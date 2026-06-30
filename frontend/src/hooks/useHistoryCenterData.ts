import { useState, useEffect, useCallback } from 'react';
import { userProfileRepository, girlProfileRepository } from '@/lib/db';
import { chatRepository } from '@/lib/db/repositories/chatRepo';
import { analysisRepository } from '@/lib/db/repositories/analysisRepo';
import { replyRepository } from '@/lib/db/repositories/replyRepo';
import { simulateHistoryRepository } from '@/lib/db/repositories/simulateHistoryRepo';
import type { ChatSession, AIAnalysisReport, ReplyHistory, SimulateHistoryRecord } from '@/types';

export interface HistoryCenterData {
  loading: boolean;
  error: string | null;

  chatSessionCount: number;
  analysisReportCount: number;
  replyHistoryCount: number;
  simulateHistoryCount: number;

  latestChatSession: ChatSession | null;
  latestAnalysisReport: AIAnalysisReport | null;
  latestReplyHistory: ReplyHistory | null;
  latestSimulateHistory: SimulateHistoryRecord | null;

  totalCount: number;
  lastActiveAt: string | null;
}

/**
 * 统一历史中心数据 hook。
 * 读取四类历史的概览数据（数量 + 最近一条），用于历史中心面板。
 */
export function useHistoryCenterData() {
  const [data, setData] = useState<HistoryCenterData>({
    loading: true,
    error: null,
    chatSessionCount: 0,
    analysisReportCount: 0,
    replyHistoryCount: 0,
    simulateHistoryCount: 0,
    latestChatSession: null,
    latestAnalysisReport: null,
    latestReplyHistory: null,
    latestSimulateHistory: null,
    totalCount: 0,
    lastActiveAt: null,
  });

  const load = useCallback(async () => {
    console.log('📚 [HistoryCenter] 加载统一历史概览');

    setData((prev) => ({ ...prev, loading: true, error: null }));

    try {
      // 1. 获取当前用户和女生资料
      const user = await userProfileRepository.getCurrent();
      if (!user) {
        setData({
          loading: false,
          error: null,
          chatSessionCount: 0,
          analysisReportCount: 0,
          replyHistoryCount: 0,
          simulateHistoryCount: 0,
          latestChatSession: null,
          latestAnalysisReport: null,
          latestReplyHistory: null,
          latestSimulateHistory: null,
          totalCount: 0,
          lastActiveAt: null,
        });
        return;
      }

      const girls = await girlProfileRepository.getByUserId(user.id);
      const girlId = girls[0]?.id;
      const userId = user.id;

      // 2. 并行加载四类历史
      const [chatSessions, analysisReports, replyHistories, simulateHistories] = await Promise.all([
        girlId
          ? chatRepository.listSessionsByGirlId(girlId)
          : chatRepository.listSessions(userId).catch(() => []),
        girlId
          ? analysisRepository.listByGirlId(girlId)
          : analysisRepository.listByUser(userId).catch(() => []),
        girlId
          ? replyRepository.listByGirlId(girlId)
          : replyRepository.listByUserId(userId).catch(() => []),
        girlId
          ? simulateHistoryRepository.listByGirlId(girlId)
          : simulateHistoryRepository.listByUserId(userId).catch(() => []),
      ]);

      // 3. 取各类最新一条
      const latestChat = chatSessions[0] ?? null;
      const latestAnalysis = analysisReports[0] ?? null;
      const latestReply = replyHistories[0] ?? null;
      const latestSimulate = simulateHistories[0] ?? null;

      // 4. 计算 lastActiveAt
      const timestamps = [
        latestChat?.importedAt,
        latestAnalysis?.createdAt,
        latestReply?.createdAt,
        latestSimulate?.createdAt,
      ].filter(Boolean) as string[];

      const lastActiveAt = timestamps.length > 0
        ? timestamps.sort((a, b) => b.localeCompare(a))[0]
        : null;

      const result: HistoryCenterData = {
        loading: false,
        error: null,
        chatSessionCount: chatSessions.length,
        analysisReportCount: analysisReports.length,
        replyHistoryCount: replyHistories.length,
        simulateHistoryCount: simulateHistories.length,
        latestChatSession: latestChat,
        latestAnalysisReport: latestAnalysis,
        latestReplyHistory: latestReply,
        latestSimulateHistory: latestSimulate,
        totalCount: chatSessions.length + analysisReports.length + replyHistories.length + simulateHistories.length,
        lastActiveAt,
      };

      console.log('✅ [HistoryCenter] 历史概览加载完成', {
        chatSessionCount: result.chatSessionCount,
        analysisReportCount: result.analysisReportCount,
        replyHistoryCount: result.replyHistoryCount,
        simulateHistoryCount: result.simulateHistoryCount,
      });

      setData(result);
    } catch (err) {
      console.error('❌ [HistoryCenter] 加载失败:', err);
      setData((prev) => ({
        ...prev,
        loading: false,
        error: '历史记录加载失败，请稍后重试',
      }));
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { data, reload: load };
}
