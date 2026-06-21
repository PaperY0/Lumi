/**
 * AI 分析报告的数据访问层（Repository）。
 * 负责对 analysisReports 表的读写。
 */

import { v4 as uuidv4 } from 'uuid';
import type { AIAnalysisReport, ChatSession } from '@/types';
import { db } from '../database';

export const analysisRepository = {
  /** 保存一条分析报告：缺 id 自动生成，缺 createdAt 自动填当前时间 */
  async save(report: Partial<AIAnalysisReport>): Promise<AIAnalysisReport> {
    const now = new Date().toISOString();
    const entity: AIAnalysisReport = {
      ...report,
      id: report.id ?? uuidv4(),
      createdAt: report.createdAt ?? now,
    } as AIAnalysisReport;

    await db.analysisReports.put(entity);
    return entity;
  },

  /** 取某会话最新的一条分析报告（按 createdAt 倒序取第一条） */
  async getBySessionId(
    sessionId: string,
  ): Promise<AIAnalysisReport | undefined> {
    const list = await db.analysisReports
      .where('sessionId')
      .equals(sessionId)
      .sortBy('createdAt');
    return list[list.length - 1];
  },

  /** 列出某男生的所有分析报告：先查该用户的会话，再按 sessionId 关联报告 */
  async listByUser(userId: string): Promise<AIAnalysisReport[]> {
    // 1. 找出该用户的所有会话 id
    const sessions: ChatSession[] = await db.chatSessions
      .where('userId')
      .equals(userId)
      .toArray();
    const sessionIds = sessions.map((s) => s.id);
    if (sessionIds.length === 0) return [];

    // 2. 用 anyOf 一次性取出这些会话对应的所有报告
    const reports = await db.analysisReports
      .where('sessionId')
      .anyOf(sessionIds)
      .toArray();

    // 3. 按 createdAt 倒序返回（最新在前）
    return reports.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },

  /** 清空所有分析报告 */
  async clearAll(): Promise<void> {
    await db.analysisReports.clear();
  },
};
