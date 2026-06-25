/**
 * AI 分析报告历史 Hook
 * 封装历史报告的加载、选择、删除逻辑
 */

import { useState, useCallback } from 'react';
import { analysisRepository } from '@/lib/db';
import type { AIAnalysisReport } from '@/types';

export function useAnalysisHistory() {
  const [reports, setReports] = useState<AIAnalysisReport[]>([]);
  const [selectedReport, setSelectedReport] = useState<AIAnalysisReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  /** 按女生 id 加载分析历史 */
  const loadByGirlId = useCallback(async (girlId: string) => {
    console.log('📚 [useAnalysisHistory.loadByGirlId] 加载 AI 分析历史:', girlId);
    setLoading(true);
    setError(null);
    try {
      const list = await analysisRepository.listByGirlId(girlId);
      setReports(list);
    } catch (e: any) {
      console.error('❌ [useAnalysisHistory] 操作失败:', e);
      setError('加载 AI 分析历史失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  }, []);

  /** 按用户 id 加载分析历史 */
  const loadByUserId = useCallback(async (userId: string) => {
    console.log('📚 [useAnalysisHistory.loadByUserId] 加载 AI 分析历史:', userId);
    setLoading(true);
    setError(null);
    try {
      const list = await analysisRepository.listByUser(userId);
      setReports(list);
    } catch (e: any) {
      console.error('❌ [useAnalysisHistory] 操作失败:', e);
      setError('加载 AI 分析历史失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  }, []);

  /** 加载所有分析历史（兜底） */
  const loadAll = useCallback(async () => {
    console.log('📚 [useAnalysisHistory.loadAll] 加载所有 AI 分析历史');
    setLoading(true);
    setError(null);
    try {
      const list = await analysisRepository.listAll();
      setReports(list);
    } catch (e: any) {
      console.error('❌ [useAnalysisHistory] 操作失败:', e);
      setError('加载 AI 分析历史失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  }, []);

  /** 选中一条报告查看详情 */
  const selectReport = useCallback((report: AIAnalysisReport) => {
    setSelectedReport(report);
  }, []);

  /** 清空选中 */
  const clearSelectedReport = useCallback(() => {
    setSelectedReport(null);
  }, []);

  /** 删除单条报告 */
  const deleteReport = useCallback(async (id: string) => {
    if (deletingId) return;

    console.log('🗑️ [useAnalysisHistory.deleteReport] 准备删除 AI 分析报告:', id);
    setDeletingId(id);
    try {
      await analysisRepository.remove(id);

      // 从列表中移除
      setReports((prev) => prev.filter((r) => r.id !== id));

      // 如果正在查看这条详情，自动关闭
      if (selectedReport?.id === id) {
        setSelectedReport(null);
      }

      console.log('✅ [useAnalysisHistory.deleteReport] 删除成功:', id);
    } catch (e: any) {
      console.error('❌ [useAnalysisHistory] 操作失败:', e);
      setError('删除 AI 分析报告失败，请稍后重试');
    } finally {
      setDeletingId(null);
    }
  }, [deletingId, selectedReport]);

  /** 重新加载（根据当前 reports 的来源推断） */
  const reload = useCallback(async (girlId?: string, userId?: string) => {
    if (girlId) {
      await loadByGirlId(girlId);
    } else if (userId) {
      await loadByUserId(userId);
    } else {
      await loadAll();
    }
  }, [loadByGirlId, loadByUserId, loadAll]);

  return {
    reports,
    selectedReport,
    loading,
    deletingId,
    error,
    loadByGirlId,
    loadByUserId,
    loadAll,
    selectReport,
    clearSelectedReport,
    deleteReport,
    reload,
  };
}
