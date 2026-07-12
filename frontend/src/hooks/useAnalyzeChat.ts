/**
 * AI 聊天分析 Hook
 * 封装"收集数据 → 校验聊天记录 → 调 AI 接口 → 保存报告"的完整流程
 */

import { useState, useCallback } from 'react';
import { aiClient } from '@/lib/ai';
import {
  userProfileRepository,
  girlProfileRepository,
  questionnaireRepository,
  analysisRepository,
} from '@/lib/db';
import { chatRepository } from '@/lib/db/repositories/chatRepo';
import { buildPursuitContext, preparePursuitProfiles } from '@/lib/ai/profileContext';
import type { AIAnalysisReport } from '@/types';
import { loadPursuitQuestionnaires } from '@/lib/pursuitQuestionnaires';
import { getRelationshipStageLabel, getRelationshipStageValue } from '@/lib/relationshipStage';

const MIN_ANALYSIS_MESSAGE_COUNT = 10;

export function useAnalyzeChat() {
  const [data, setData] = useState<AIAnalysisReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * 加载已缓存的分析报告
   * 进页面时调用，从 IndexedDB 读取最新一条
   */
  const loadCached = useCallback(async (sessionId?: string) => {
    try {
      console.log('[useAnalyzeChat] 开始加载缓存分析报告');

      let targetSessionId = sessionId;

      // 如果没传 sessionId，读取用户最新会话
      if (!targetSessionId) {
        const user = await userProfileRepository.getCurrent();
        if (!user) {
          console.log('[useAnalyzeChat] 没有用户信息，跳过加载缓存');
          return;
        }

        const sessions = await chatRepository.listSessions(user.id);
        if (sessions.length === 0) {
          console.log('[useAnalyzeChat] 没有会话记录，跳过加载缓存');
          return;
        }

        targetSessionId = sessions[0].id;
      }

      const cachedReport = await analysisRepository.getBySessionId(targetSessionId);
      if (cachedReport) {
        console.log('[useAnalyzeChat] 找到缓存报告:', cachedReport.id);
        setData(cachedReport);
      } else {
        console.log('[useAnalyzeChat] 没有缓存报告');
      }
    } catch (e: any) {
      console.error('[useAnalyzeChat] 加载缓存失败:', e);
    }
  }, []);

  /**
   * 执行 AI 分析
   */
  const analyze = useCallback(async (options?: { sessionId?: string; userQuestion?: string }) => {
    setLoading(true);
    setError(null);

    try {
      console.log('🎯 [useAnalyzeChat.analyze] 开始 AI 聊天分析');

      // 1. 收集用户资料
      const user = await userProfileRepository.getCurrent();
      if (!user) {
        throw new Error('请先完成资料建档');
      }
      console.log('📥 [useAnalyzeChat.analyze] user:', { id: user.id, nickname: user.nickname });

      // 2. 收集女生资料
      const girls = await girlProfileRepository.getByUserId(user.id);
      const girl = girls[0];
      if (!girl) {
        throw new Error('请先完成女生资料');
      }
      console.log('📥 [useAnalyzeChat.analyze] girl:', { id: girl.id, nickname: girl.nickname });
      const stage = getRelationshipStageValue(getRelationshipStageLabel(girl));

      // 3. 收集问卷
      const maleQ = await questionnaireRepository.getLatestMale(user.id);
      const femaleQ = await questionnaireRepository.getLatestFemale(user.id);
      const stageQuestionnaires = await loadPursuitQuestionnaires(user.id, girl.id, stage);

      // 4. 收集聊天会话
      let session;
      if (options?.sessionId) {
        session = await chatRepository.getSession(options.sessionId);
      } else {
        session = await chatRepository.getLatestSession(user.id, girl.id);
      }

      // 5. 收集消息
      const messages = session ? await chatRepository.getMessages(session.id) : [];
      console.log('📥 [useAnalyzeChat.analyze] latestSession:', session ? {
        id: session.id,
        messageCount: session.messageCount,
      } : null);
      console.log('📥 [useAnalyzeChat.analyze] messages 数量:', messages.length);

      // 6. 校验聊天记录数量
      if (!session || messages.length === 0) {
        console.warn('⚠️ [useAnalyzeChat.analyze] 未找到聊天记录，停止分析，禁止空 messages 调用 AI');
        setError('还没有导入聊天记录。请先导入至少 10 条聊天记录，这样 AI 才能基于真实互动给出更准确的分析。');
        return;
      }

      if (messages.length < MIN_ANALYSIS_MESSAGE_COUNT) {
        console.warn('⚠️ [useAnalyzeChat.analyze] 聊天记录不足 10 条，停止分析，禁止调用 AI:', {
          messagesCount: messages.length,
        });
        setError(`当前只导入了 ${messages.length} 条聊天记录。建议至少导入 10 条聊天记录后再分析，这样结果会更准确。`);
        return;
      }

      const profileContext = buildPursuitContext({
        userProfile: user,
        girlProfile: girl,
        maleQuestionnaire: maleQ,
        femaleQuestionnaire: femaleQ,
        stageQuestionnaires,
        recentMessages: messages,
      });
      const pursuitProfiles = preparePursuitProfiles(user, girl);

      // 7. 调用 AI 接口
      console.log('🚀 [useAnalyzeChat.analyze] 聊天记录数量满足要求，准备调用 /api/analyze', {
        messagesCount: messages.length,
      });

      const report = await aiClient.analyzeChatFull({
        userProfile: pursuitProfiles.userProfile,
        girlProfile: pursuitProfiles.girlProfile,
        maleQuestionnaire: maleQ,
        femaleQuestionnaire: femaleQ,
        chatSession: session ? {
          id: session.id,
          userId: session.userId,
          title: session.title || '聊天会话',
          startTime: session.importedAt,
          endTime: undefined,
          messageCount: session.messageCount,
          createdAt: session.importedAt,
        } : undefined,
        messages: messages.map(m => ({
          id: m.id,
          sessionId: m.sessionId,
          sender: m.sender,
          content: m.content,
          timestamp: m.sentAt,
        })),
        profileContext: profileContext.summary,
        userQuestion: options?.userQuestion,
      });

      // 8. 保存报告
      const saved = await analysisRepository.save({
        ...report,
        sessionId: session.id,
      });

      console.log('✅ [useAnalyzeChat.analyze] AI 分析完成并保存');

      // 9. 更新状态
      setData(saved);
    } catch (e: any) {
      console.error('[useAnalyzeChat] 分析失败:', e);
      setError(e.message || '分析失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    data,
    loading,
    error,
    analyze,
    loadCached,
    setData,
  };
}
