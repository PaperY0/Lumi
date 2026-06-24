import { useState, useCallback, useEffect } from 'react';
import type { AIAnalysisReport, ReplyHistory, SimulateHistoryRecord } from '@/types';
import {
  userProfileRepository,
  girlProfileRepository,
  questionnaireRepository,
  analysisRepository,
  replyRepository,
  simulateHistoryRepository,
} from '@/lib/db/repositories';

export interface DashboardData {
  userName: string;
  girlName: string;
  profileCompletion: number;
  analysisReportCount: number;
  replyHistoryCount: number;
  simulateHistoryCount: number;
  latestAnalysisReport: AIAnalysisReport | null;
  latestReplyHistory: ReplyHistory | null;
  latestSimulateHistory: SimulateHistoryRecord | null;
  totalPracticeMessages: number;
  averageSimulateScore: number | null;
  lastActiveAt: string | null;
}

export function useDashboardData() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<DashboardData | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    console.log('📊 [dashboard] 加载首页数据');

    try {
      const user = await userProfileRepository.getCurrent();
      const userId = user?.id;

      const girl = userId
        ? (await girlProfileRepository.getByUserId(userId))[0]
        : undefined;

      // 问卷结果
      const maleQ = userId
        ? await questionnaireRepository.getLatestMale(userId)
        : undefined;
      const femaleQ = userId
        ? await questionnaireRepository.getLatestFemale(userId)
        : undefined;

      // 资料完成度
      let completion = 0;
      if (user) completion += 30;
      if (girl) completion += 30;
      if (maleQ) completion += 20;
      if (femaleQ) completion += 20;

      // 统计数据
      const analysisList = userId
        ? await analysisRepository.listByUser(userId)
        : [];
      const replyList = userId
        ? await replyRepository.listByUserId(userId)
        : [];
      const simulateList = userId
        ? await simulateHistoryRepository.listByUserId(userId)
        : [];

      const latestAnalysis = analysisList[0] ?? null;
      const latestReply = replyList[0] ?? null;
      const latestSimulate = simulateList[0] ?? null;

      // 累计练习消息
      const totalPracticeMessages = simulateList.reduce(
        (sum, r) => sum + r.messageCount,
        0,
      );

      // 平均评分
      const scoredRecords = simulateList.filter(
        (r) => r.finalScore != null,
      );
      const averageSimulateScore =
        scoredRecords.length > 0
          ? Math.round(
              scoredRecords.reduce((sum, r) => sum + r.finalScore!, 0) /
                scoredRecords.length,
            )
          : null;

      // 最后活跃时间
      const timestamps = [
        latestAnalysis?.createdAt,
        latestReply?.createdAt,
        latestSimulate?.createdAt,
      ]
        .filter(Boolean)
        .sort()
        .reverse();
      const lastActiveAt = timestamps[0] ?? null;

      const result: DashboardData = {
        userName: user?.nickname ?? '',
        girlName: girl?.nickname ?? '',
        profileCompletion: completion,
        analysisReportCount: analysisList.length,
        replyHistoryCount: replyList.length,
        simulateHistoryCount: simulateList.length,
        latestAnalysisReport: latestAnalysis,
        latestReplyHistory: latestReply,
        latestSimulateHistory: latestSimulate,
        totalPracticeMessages,
        averageSimulateScore,
        lastActiveAt,
      };

      setData(result);
      console.log('✅ [dashboard] 首页数据加载完成', {
        analysisReportCount: result.analysisReportCount,
        replyHistoryCount: result.replyHistoryCount,
        simulateHistoryCount: result.simulateHistoryCount,
      });
    } catch (e) {
      console.error('❌ [dashboard] 首页数据加载失败:', e);
      setError('首页数据加载失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { loading, error, data, reload: load };
}
