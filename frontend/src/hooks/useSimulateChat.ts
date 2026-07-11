/**
 * 模拟对话练习 Hook
 * 封装"开始练习 → 用户回复 → AI 模拟女生回复 → 反馈 → 结束并保存"的完整流程
 */

import { useState, useCallback } from 'react';
import { aiClient } from '@/lib/ai';
import {
  userProfileRepository,
  girlProfileRepository,
  questionnaireRepository,
  simulateHistoryRepository,
} from '@/lib/db';
import { chatRepository } from '@/lib/db/repositories/chatRepo';
import { buildPursuitContext, preparePursuitProfiles } from '@/lib/ai/profileContext';
import type {
  SimulateMessage,
  SimulateFeedback,
  SimulateScenario,
  SimulateDifficulty,
  SimulateHistoryRecord,
  ChatMessage,
} from '@/types';

function buildLocalSummary(params: {
  scenario: string;
  difficulty: string;
  messageCount: number;
  userMessageCount: number;
  girlMessageCount: number;
  score?: number;
}): string {
  const { scenario, difficulty, messageCount, userMessageCount, girlMessageCount, score } = params;
  let s = `本次你完成了「${scenario}」场景下的${difficulty}难度练习，共进行了 ${messageCount} 条对话（你 ${userMessageCount} 条，她 ${girlMessageCount} 条）`;
  if (score != null) {
    s += `，最终反馈评分为 ${score} 分`;
  }
  s += '。可以重点回看最后一次建议，继续优化表达方式。';
  return s;
}

export function useSimulateChat() {
  const [conversation, setConversation] = useState<SimulateMessage[]>([]);
  const [feedback, setFeedback] = useState<SimulateFeedback | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [started, setStarted] = useState(false);
  const [scenario, setScenario] = useState<SimulateScenario | string | null>(null);
  const [difficulty, setDifficulty] = useState<SimulateDifficulty | string | null>(null);

  // 保存相关状态
  const [finished, setFinished] = useState(false);
  const [savedRecord, setSavedRecord] = useState<SimulateHistoryRecord | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  /**
   * 收集上下文：user / girl / 问卷 / recentMessages
   */
  const collectContext = useCallback(async () => {
    const user = await userProfileRepository.getCurrent();
    if (!user) {
      setError('请先完成你的个人档案');
      return null;
    }

    const girls = await girlProfileRepository.getByUserId(user.id);
    const girl = girls[0];
    if (!girl) {
      setError('请先完成她的资料');
      return null;
    }

    const maleQ = await questionnaireRepository.getLatestMale(user.id);
    const femaleQ = await questionnaireRepository.getLatestFemale(user.id);

    let recentMessages: ChatMessage[] = [];
    const latestSession = await chatRepository.getLatestSession(user.id, girl.id);
    if (latestSession) {
      const messages = await chatRepository.getMessages(latestSession.id);
      recentMessages = messages.slice(-10);
    }

    console.log('✅ [useSimulateChat] 上下文收集成功:', {
      userId: user.id,
      girlId: girl.id,
      recentMessagesCount: recentMessages.length,
      hasMaleQuestionnaire: !!maleQ,
      hasFemaleQuestionnaire: !!femaleQ,
    });

    const profileContext = buildPursuitContext({
      userProfile: user,
      girlProfile: girl,
      maleQuestionnaire: maleQ,
      femaleQuestionnaire: femaleQ,
      recentMessages,
    });
    const pursuitProfiles = preparePursuitProfiles(user, girl);

    return { user, girl, maleQ, femaleQ, recentMessages, profileContext, pursuitProfiles };
  }, []);

  /**
   * 开始一次模拟练习，AI 模拟女生先说第一句话
   */
  const startPractice = useCallback(async (
    nextScenario: SimulateScenario | string,
    nextDifficulty: SimulateDifficulty | string,
  ) => {
    if (loading) return;

    console.log('🎭 [useSimulateChat.startPractice] 开始模拟练习', {
      scenario: nextScenario,
      difficulty: nextDifficulty,
    });

    setLoading(true);
    setError(null);
    setFeedback(null);
    setScenario(nextScenario);
    setDifficulty(nextDifficulty);

    try {
      const ctx = await collectContext();
      if (!ctx) return;

      console.log('🚀 [useSimulateChat.startPractice] 准备调用 /api/simulate');

      const result = await aiClient.simulate({
        userProfile: ctx.pursuitProfiles.userProfile,
        girlProfile: ctx.pursuitProfiles.girlProfile,
        maleQuestionnaire: ctx.maleQ ?? null,
        femaleQuestionnaire: ctx.femaleQ ?? null,
        recentMessages: ctx.recentMessages,
        profileContext: ctx.profileContext.summary,
        scenario: nextScenario,
        difficulty: nextDifficulty,
        conversation: [],
        userReply: '',
      });

      console.log('✅ [useSimulateChat.startPractice] 模拟开场生成成功:', {
        hasGirlReply: !!result.girlReply,
        hasFeedback: !!result.feedback,
      });

      const girlMessage: SimulateMessage = {
        id: crypto.randomUUID(),
        role: 'girl',
        content: result.girlReply,
        createdAt: result.createdAt || new Date().toISOString(),
      };

      setConversation([girlMessage]);
      setFeedback(result.feedback ?? null);
      setStarted(true);
    } catch (e: any) {
      console.error('❌ [useSimulateChat] 模拟对话失败:', e);
      setError(e instanceof Error ? e.message : '模拟对话失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  }, [loading, collectContext]);

  /**
   * 用户发送一句回复，继续模拟
   */
  const sendUserReply = useCallback(async (text: string) => {
    const trimmed = text.trim();

    if (!trimmed) {
      setError('请输入你的回复');
      return;
    }

    if (!started || !scenario || !difficulty) {
      setError('请先选择场景并开始练习');
      return;
    }

    if (loading) return;

    console.log('💬 [useSimulateChat.sendUserReply] 用户发送回复:', trimmed);

    const userMessage: SimulateMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: trimmed,
      createdAt: new Date().toISOString(),
    };

    const nextConversation = [...conversation, userMessage];
    setConversation(nextConversation);
    setLoading(true);
    setError(null);

    try {
      const ctx = await collectContext();
      if (!ctx) return;

      console.log('🚀 [useSimulateChat.sendUserReply] 准备调用 /api/simulate', {
        conversationCount: nextConversation.length,
      });

      const result = await aiClient.simulate({
        userProfile: ctx.pursuitProfiles.userProfile,
        girlProfile: ctx.pursuitProfiles.girlProfile,
        maleQuestionnaire: ctx.maleQ ?? null,
        femaleQuestionnaire: ctx.femaleQ ?? null,
        recentMessages: ctx.recentMessages,
        profileContext: ctx.profileContext.summary,
        scenario,
        difficulty,
        conversation: nextConversation,
        userReply: trimmed,
      });

      console.log('✅ [useSimulateChat.sendUserReply] 模拟回复生成成功:', {
        hasGirlReply: !!result.girlReply,
        hasFeedback: !!result.feedback,
      });

      const girlMessage: SimulateMessage = {
        id: crypto.randomUUID(),
        role: 'girl',
        content: result.girlReply,
        createdAt: result.createdAt || new Date().toISOString(),
      };

      setConversation([...nextConversation, girlMessage]);
      setFeedback(result.feedback ?? null);
    } catch (e: any) {
      console.error('❌ [useSimulateChat] 模拟对话失败:', e);
      setError(e instanceof Error ? e.message : '模拟对话失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  }, [conversation, scenario, difficulty, started, loading, collectContext]);

  /**
   * 结束练习并保存到本地历史
   */
  const finishPractice = useCallback(async (): Promise<SimulateHistoryRecord | null> => {
    if (saving) return null;

    if (!started) {
      setSaveError('请先开始练习');
      return null;
    }

    if (conversation.length === 0) {
      setSaveError('暂无可保存的练习内容');
      return null;
    }

    if (!scenario || !difficulty) {
      setSaveError('缺少练习场景或难度');
      return null;
    }

    setSaving(true);
    setSaveError(null);

    try {
      console.log('🏁 [useSimulateChat.finishPractice] 准备结束并保存练习', {
        scenario,
        difficulty,
        messageCount: conversation.length,
      });

      const ctx = await collectContext();
      if (!ctx) {
        setSaveError('请先完成你的个人档案');
        return null;
      }

      const now = new Date().toISOString();
      const userMessages = conversation.filter((m) => m.role === 'user');
      const girlMessages = conversation.filter((m) => m.role === 'girl');
      const lastUserReply = [...userMessages].pop()?.content;
      const lastGirlReply = [...girlMessages].pop()?.content;

      const summary = buildLocalSummary({
        scenario: String(scenario),
        difficulty: String(difficulty),
        messageCount: conversation.length,
        userMessageCount: userMessages.length,
        girlMessageCount: girlMessages.length,
        score: feedback?.score,
      });

      const record: SimulateHistoryRecord = {
        id: crypto.randomUUID(),
        createdAt: now,
        updatedAt: now,
        userId: ctx.user.id,
        girlId: ctx.girl.id,
        scenario: String(scenario),
        difficulty: String(difficulty),
        conversation,
        feedback,
        messageCount: conversation.length,
        userMessageCount: userMessages.length,
        girlMessageCount: girlMessages.length,
        finalScore: feedback?.score,
        summary,
        lastUserReply,
        lastGirlReply,
      };

      const saved = await simulateHistoryRepository.save(record);

      console.log('✅ [useSimulateChat.finishPractice] 练习保存成功:', {
        id: saved.id,
        messageCount: saved.messageCount,
      });

      setSavedRecord(saved);
      setFinished(true);
      setSaveError(null);
      return saved;
    } catch (e: any) {
      console.error('❌ [useSimulateChat.finishPractice] 保存模拟练习失败:', e);
      setSaveError(e instanceof Error ? e.message : '保存练习失败，请稍后重试');
      return null;
    } finally {
      setSaving(false);
    }
  }, [conversation, feedback, scenario, difficulty, started, saving, collectContext]);

  /**
   * 重置练习状态
   */
  const resetPractice = useCallback(() => {
    console.log('🔄 [useSimulateChat.resetPractice] 重置模拟练习');
    setConversation([]);
    setFeedback(null);
    setError(null);
    setStarted(false);
    setScenario(null);
    setDifficulty(null);
    setFinished(false);
    setSavedRecord(null);
    setSaving(false);
    setSaveError(null);
  }, []);

  return {
    conversation,
    feedback,
    loading,
    error,
    started,
    scenario,
    difficulty,
    finished,
    savedRecord,
    saving,
    saveError,
    startPractice,
    sendUserReply,
    finishPractice,
    resetPractice,
  };
}
