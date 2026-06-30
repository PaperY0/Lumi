/**
 * 本地数据管理工具
 * 负责数据概览、导出、清空和重置操作。
 * 所有操作仅涉及浏览器本地 IndexedDB + localStorage，不调用后端。
 */

import { db } from '@/lib/db';
import { BRAND_NAME, BRAND_VERSION } from '@/app/brand';

// ─── 项目 localStorage key 白名单 ─────────────────────────────────────────
const LUMI_LS_KEYS = [
  'lumi-settings',
  'lumi_love_guide_read_article_ids',
];

// ─── 类型定义 ─────────────────────────────────────────────────────────────

export interface LocalDataSummary {
  userProfileCount: number;
  girlProfileCount: number;
  maleQuestionnaireCount: number;
  femaleQuestionnaireCount: number;
  relationshipPortraitCount: number;
  chatMessageCount: number;
  analysisReportCount: number;
  replyHistoryCount: number;
  simulateHistoryCount: number;
  localStorageKeyCount: number;
  lastUpdatedAt: string | null;
}

export interface LocalDataExport {
  exportedAt: string;
  appName: string;
  version: string;
  indexedDB: Record<string, unknown[]>;
  localStorage: Record<string, unknown>;
}

// ─── 内部辅助 ─────────────────────────────────────────────────────────────

/** 从一组记录中提取最新时间戳（兼容 updatedAt / createdAt / completedAt / sentAt） */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function pickLatestTime(records: any[]): string | null {
  let latest: string | null = null;
  for (const r of records) {
    const t: string | undefined = r.updatedAt ?? r.createdAt ?? r.completedAt ?? r.sentAt;
    if (t && (!latest || t > latest)) latest = t;
  }
  return latest;
}

function mergeLatest(current: string | null, candidate: string | null): string | null {
  if (!candidate) return current;
  if (!current) return candidate;
  return candidate > current ? candidate : current;
}

// ─── 公开方法 ─────────────────────────────────────────────────────────────

/** 获取本地数据概览统计 */
export async function getLocalDataSummary(): Promise<LocalDataSummary> {
  console.log('📦 [localDataManager] 获取本地数据概览');

  const [
    users,
    girls,
    maleQ,
    femaleQ,
    portraits,
    messages,
    analyses,
    replies,
    simulations,
  ] = await Promise.all([
    db.userProfiles.toArray(),
    db.girlProfiles.toArray(),
    db.maleQuestionnaireResults.toArray(),
    db.femaleQuestionnaireResults.toArray(),
    db.relationshipPortraits.toArray(),
    db.chatMessages.toArray(),
    db.analysisReports.toArray(),
    db.replyHistory.toArray(),
    db.simulateHistory.toArray(),
  ]);

  // 计算 localStorage 中项目相关 key 数量
  let lsCount = 0;
  for (const key of LUMI_LS_KEYS) {
    if (localStorage.getItem(key) !== null) lsCount++;
  }

  // 计算最新更新时间
  let lastUpdatedAt: string | null = null;
  lastUpdatedAt = mergeLatest(lastUpdatedAt, pickLatestTime(users));
  lastUpdatedAt = mergeLatest(lastUpdatedAt, pickLatestTime(girls));
  lastUpdatedAt = mergeLatest(lastUpdatedAt, pickLatestTime(maleQ));
  lastUpdatedAt = mergeLatest(lastUpdatedAt, pickLatestTime(femaleQ));
  lastUpdatedAt = mergeLatest(lastUpdatedAt, pickLatestTime(portraits));
  lastUpdatedAt = mergeLatest(lastUpdatedAt, pickLatestTime(messages));
  lastUpdatedAt = mergeLatest(lastUpdatedAt, pickLatestTime(analyses));
  lastUpdatedAt = mergeLatest(lastUpdatedAt, pickLatestTime(replies));
  lastUpdatedAt = mergeLatest(lastUpdatedAt, pickLatestTime(simulations));

  return {
    userProfileCount: users.length,
    girlProfileCount: girls.length,
    maleQuestionnaireCount: maleQ.length,
    femaleQuestionnaireCount: femaleQ.length,
    relationshipPortraitCount: portraits.length,
    chatMessageCount: messages.length,
    analysisReportCount: analyses.length,
    replyHistoryCount: replies.length,
    simulateHistoryCount: simulations.length,
    localStorageKeyCount: lsCount,
    lastUpdatedAt,
  };
}

/** 导出全部本地数据为 JSON 结构（不触发下载，仅返回对象） */
export async function exportLocalData(): Promise<LocalDataExport> {
  console.log('📤 [localDataManager] 导出本地数据');

  const [
    users,
    girls,
    maleQ,
    femaleQ,
    portraits,
    messages,
    analyses,
    replies,
    simulations,
    sessions,
    simSessions,
    simMessages,
    importantDates,
    appSettings,
  ] = await Promise.all([
    db.userProfiles.toArray(),
    db.girlProfiles.toArray(),
    db.maleQuestionnaireResults.toArray(),
    db.femaleQuestionnaireResults.toArray(),
    db.relationshipPortraits.toArray(),
    db.chatMessages.toArray(),
    db.analysisReports.toArray(),
    db.replyHistory.toArray(),
    db.simulateHistory.toArray(),
    db.chatSessions.toArray(),
    db.simulationSessions.toArray(),
    db.simulationMessages.toArray(),
    db.importantDates.toArray(),
    db.appSettings.toArray(),
  ]);

  // 导出项目相关 localStorage
  const lsData: Record<string, unknown> = {};
  for (const key of LUMI_LS_KEYS) {
    const raw = localStorage.getItem(key);
    if (raw !== null) {
      try {
        lsData[key] = JSON.parse(raw);
      } catch {
        lsData[key] = raw;
      }
    }
  }

  return {
    exportedAt: new Date().toISOString(),
    appName: BRAND_NAME,
    version: BRAND_VERSION,
    indexedDB: {
      userProfiles: users,
      girlProfiles: girls,
      maleQuestionnaireResults: maleQ,
      femaleQuestionnaireResults: femaleQ,
      relationshipPortraits: portraits,
      chatMessages: messages,
      analysisReports: analyses,
      replyHistory: replies,
      simulateHistory: simulations,
      chatSessions: sessions,
      simulationSessions: simSessions,
      simulationMessages: simMessages,
      importantDates,
      appSettings,
    },
    localStorage: lsData,
  };
}

/** 清空全部本地数据（IndexedDB 业务表 + 项目 localStorage key） */
export async function clearAllLocalData(): Promise<void> {
  console.log('🧹 [localDataManager] 清空全部本地数据');

  // 清空 IndexedDB 所有业务表
  await db.transaction('rw', db.tables, async () => {
    for (const table of db.tables) {
      await table.clear();
    }
  });

  // 清空项目相关 localStorage key
  for (const key of LUMI_LS_KEYS) {
    localStorage.removeItem(key);
  }

  console.log('✅ [localDataManager] 全部本地数据已清空');
}

/** 清除恋爱法典已读状态 */
export function clearLoveGuideReadState(): void {
  console.log('📖 [localDataManager] 清除恋爱法典阅读状态');
  localStorage.removeItem('lumi_love_guide_read_article_ids');
}

/** 重置新手引导标记（不删除 IndexedDB 数据） */
export function resetOnboardingFlag(): void {
  console.log('🔁 [localDataManager] 重置新手引导标记');
  try {
    const raw = localStorage.getItem('lumi-settings');
    if (raw) {
      const parsed = JSON.parse(raw);
      parsed.state = { ...parsed.state, onboardingCompleted: false };
      localStorage.setItem('lumi-settings', JSON.stringify(parsed));
    }
  } catch {
    // 解析失败时保留原值，仅修改 onboardingCompleted
    localStorage.setItem('lumi-settings', JSON.stringify({
      state: { onboardingCompleted: false },
      version: 2,
    }));
  }
}
