import { useState, useCallback, useEffect } from 'react';
import type { AIAnalysisReport, ImportantDate, ReplyHistory, SimulateHistoryRecord } from '@/types';
import {
  userProfileRepository,
  girlProfileRepository,
  analysisRepository,
  replyRepository,
  simulateHistoryRepository,
  importantDateRepository,
} from '@/lib/db/repositories';
import { loadOnboardingProgress, type OnboardingProgressState } from '@/lib/onboardingProgress';

export interface UpcomingImportantDate {
  item: ImportantDate;
  daysUntil: number;
}

export interface DashboardData {
  userName: string;
  girlName: string;
  girlStage: string | undefined;
  girlStageLabel: string | undefined;
  profileCompletion: number;
  analysisReportCount: number;
  replyHistoryCount: number;
  simulateHistoryCount: number;
  latestAnalysisReport: AIAnalysisReport | null;
  latestReplyHistory: ReplyHistory | null;
  latestSimulateHistory: SimulateHistoryRecord | null;
  totalPracticeMessages: number;
  averageSimulateScore: number | null;
  upcomingImportantDates: UpcomingImportantDate[];
  lastActiveAt: string | null;
  onboardingProgress: OnboardingProgressState;
}

function daysUntilNext(dateValue: string): number | null {
  const base = new Date(`${dateValue}T00:00:00`);
  if (Number.isNaN(base.getTime())) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  let next = new Date(today.getFullYear(), base.getMonth(), base.getDate());
  if (next < today) {
    next = new Date(today.getFullYear() + 1, base.getMonth(), base.getDate());
  }
  return Math.ceil((next.getTime() - today.getTime()) / 86400000);
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

      const onboardingProgress = await loadOnboardingProgress();

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
      const importantDates = girl
        ? await importantDateRepository.listByGirlId(girl.id)
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

      const upcomingImportantDates = importantDates
        .map((item) => ({ item, daysUntil: daysUntilNext(item.date) }))
        .filter((entry): entry is UpcomingImportantDate => entry.daysUntil != null && entry.daysUntil <= 30)
        .sort((a, b) => a.daysUntil - b.daysUntil)
        .slice(0, 4);

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
        girlStage: girl?.currentStage,
        girlStageLabel: girl?.currentStageLabel,
        profileCompletion: onboardingProgress.percentage,
        analysisReportCount: analysisList.length,
        replyHistoryCount: replyList.length,
        simulateHistoryCount: simulateList.length,
        latestAnalysisReport: latestAnalysis,
        latestReplyHistory: latestReply,
        latestSimulateHistory: latestSimulate,
        totalPracticeMessages,
        averageSimulateScore,
        upcomingImportantDates,
        lastActiveAt,
        onboardingProgress,
      };

      setData(result);
      console.log('✅ [dashboard] 首页数据加载完成', {
        analysisReportCount: result.analysisReportCount,
        replyHistoryCount: result.replyHistoryCount,
        simulateHistoryCount: result.simulateHistoryCount,
        upcomingImportantDateCount: result.upcomingImportantDates.length,
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
