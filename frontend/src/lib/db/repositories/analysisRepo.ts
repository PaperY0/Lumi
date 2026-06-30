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
    console.log('✅ [analysisRepository.save] 分析报告已保存:', entity.id);
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

  /** 取某条分析报告（按 id） */
  async getById(id: string): Promise<AIAnalysisReport | undefined> {
    return db.analysisReports.get(id);
  },

  /** 列出所有分析报告（按 createdAt 倒序） */
  async listAll(): Promise<AIAnalysisReport[]> {
    const reports = await db.analysisReports.toArray();
    return reports.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },

  /**
   * 按女生 id 列出分析报告。
   * 因为 analysisReports 表没有 girlId 索引，需要先通过 chatSessions 找到关联的 sessionId。
   */
  async listByGirlId(girlId: string): Promise<AIAnalysisReport[]> {
    console.log('📚 [analysisRepository.listByGirlId] 查询 AI 分析历史:', girlId);

    // 1. 找出该女生的所有会话 id
    const sessions = await db.chatSessions
      .where('girlId')
      .equals(girlId)
      .toArray();
    const sessionIds = sessions.map((s) => s.id);
    if (sessionIds.length === 0) return [];

    // 2. 用 anyOf 取出这些会话对应的所有报告
    const reports = await db.analysisReports
      .where('sessionId')
      .anyOf(sessionIds)
      .toArray();

    // 3. 按 createdAt 倒序返回
    return reports.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },

  /** 删除单条分析报告 */
  async remove(id: string): Promise<void> {
    console.log('🗑️ [analysisRepository.remove] 删除 AI 分析报告:', id);
    await db.analysisReports.delete(id);
    console.log('✅ [analysisRepository.remove] 删除成功:', id);
  },

  /** 清空所有分析报告 */
  async clearAll(): Promise<void> {
    await db.analysisReports.clear();
  },
};
