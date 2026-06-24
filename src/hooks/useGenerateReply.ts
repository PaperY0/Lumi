/**
 * 回复建议生成 Hook
 * 封装"收集上下文 → 调 AI 接口 → 返回回复建议"的完整流程
 */

import { useState, useCallback } from 'react';
import { aiClient } from '@/lib/ai';
import {
  userProfileRepository,
  girlProfileRepository,
  questionnaireRepository,
  replyRepository,
} from '@/lib/db';
import { chatRepository } from '@/lib/db/repositories/chatRepo';
import type { ReplyResponse, ChatMessage } from '@/types';

export function useGenerateReply() {
  const [data, setData] = useState<ReplyResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = useCallback(async (
    userMessage: string,
    userIntent?: string,
    scene?: string,
  ) => {
    const trimmedUserMessage = userMessage.trim();

    // 1. 校验输入
    if (!trimmedUserMessage) {
      setError('请输入她发来的消息');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('🎯 [useGenerateReply.generate] 开始生成回复建议');
      console.log('📥 [useGenerateReply.generate] 对方消息:', trimmedUserMessage);
      console.log('📥 [useGenerateReply.generate] 用户意图:', userIntent);
      console.log('📥 [useGenerateReply.generate] 当前场景:', scene);

      // 2. 读取当前 user
      const user = await userProfileRepository.getCurrent();
      if (!user) {
        console.warn('⚠️ [useGenerateReply.generate] 未找到用户资料');
        setError('请先完成你的个人档案');
        return;
      }
      console.log('✅ [useGenerateReply.generate] user 收集成功:', { id: user.id, nickname: user.nickname });

      // 3. 读取当前 girl
      const girls = await girlProfileRepository.getByUserId(user.id);
      const girl = girls[0];
      if (!girl) {
        console.warn('⚠️ [useGenerateReply.generate] 未找到女生资料');
        setError('请先完成她的资料');
        return;
      }
      console.log('✅ [useGenerateReply.generate] girl 收集成功:', { id: girl.id, nickname: girl.nickname });

      // 4. 读取问卷
      const maleQ = await questionnaireRepository.getLatestMale(user.id);
      const femaleQ = await questionnaireRepository.getLatestFemale(user.id);

      // 5. 读取最近聊天记录（允许为空）
      let recentMessages: ChatMessage[] = [];
      const latestSession = await chatRepository.getLatestSession(user.id, girl.id);
      if (latestSession) {
        const messages = await chatRepository.getMessages(latestSession.id);
        recentMessages = messages.slice(-10);
        console.log('📥 [useGenerateReply.generate] recentMessages 数量:', recentMessages.length);
      } else {
        console.log('ℹ️ [useGenerateReply.generate] 未找到聊天记录，使用空 recentMessages 继续生成回复');
      }

      // 6. 调用 AI 接口
      console.log('🚀 [useGenerateReply.generate] 准备调用 /api/reply');

      const reply = await aiClient.generateReply({
        userProfile: user,
        girlProfile: girl,
        maleQuestionnaire: maleQ ?? null,
        femaleQuestionnaire: femaleQ ?? null,
        recentMessages,
        userMessage: trimmedUserMessage,
        userIntent,
        scene,
      });

      console.log('✅ [useGenerateReply.generate] 回复生成完成:', {
        hasSimpleAnswer: !!reply.simpleAnswer,
        recommendedRepliesCount: reply.recommendedReplies?.length ?? 0,
        avoidRepliesCount: reply.avoidReplies?.length ?? 0,
        hasAnalysis: !!reply.analysis,
      });

      // 7. 更新状态
      setData(reply);

      // 8. 保存回复历史（失败不覆盖已生成结果）
      try {
        await replyRepository.save({
          id: reply.id || undefined,
          userId: user.id,
          girlId: girl.id,
          userMessage: trimmedUserMessage,
          userIntent,
          scene,
          simpleAnswer: reply.simpleAnswer,
          analysis: reply.analysis,
          recommendedReplies: reply.recommendedReplies ?? [],
          avoidReplies: reply.avoidReplies ?? [],
          createdAt: reply.createdAt || undefined,
        });
        console.log('✅ [useGenerateReply.generate] 回复历史保存成功');
      } catch (saveError) {
        console.error('❌ [useGenerateReply.generate] 回复历史保存失败:', saveError);
        // 不覆盖已生成的 data，只记录错误
      }
    } catch (e: any) {
      console.error('❌ [useGenerateReply.generate] 回复生成失败:', e);
      setError(e instanceof Error ? e.message : '生成回复失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    data,
    loading,
    error,
    generate,
    setData,
  };
}
