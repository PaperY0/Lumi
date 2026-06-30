/**
 * 模拟对话练习历史 Hook
 * 负责读取、选择、删除模拟对话历史
 */

import { useState, useCallback } from 'react';
import { simulateHistoryRepository } from '@/lib/db';
import type { SimulateHistoryRecord } from '@/types';

export function useSimulateHistory() {
  const [records, setRecords] = useState<SimulateHistoryRecord[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<SimulateHistoryRecord | null>(null);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadByGirlId = useCallback(async (girlId: string) => {
    setLoading(true);
    setError(null);
    try {
      console.log('📚 [useSimulateHistory.loadByGirlId] 加载女生模拟练习历史:', girlId);
      const list = await simulateHistoryRepository.listByGirlId(girlId);
      setRecords(list);
    } catch (e: any) {
      console.error('❌ [useSimulateHistory] 操作失败:', e);
      setError('加载模拟练习历史失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadByUserId = useCallback(async (userId: string) => {
    setLoading(true);
    setError(null);
    try {
      console.log('📚 [useSimulateHistory.loadByUserId] 加载用户模拟练习历史:', userId);
      const list = await simulateHistoryRepository.listByUserId(userId);
      setRecords(list);
    } catch (e: any) {
      console.error('❌ [useSimulateHistory] 操作失败:', e);
      setError('加载模拟练习历史失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  }, []);

  const selectRecord = useCallback((record: SimulateHistoryRecord) => {
    setSelectedRecord(record);
  }, []);

  const clearSelectedRecord = useCallback(() => {
    setSelectedRecord(null);
  }, []);

  const deleteRecord = useCallback(async (id: string) => {
    if (deletingId) return;
    setDeletingId(id);
    try {
      console.log('🗑️ [useSimulateHistory.deleteRecord] 准备删除模拟练习历史:', id);
      await simulateHistoryRepository.remove(id);
      console.log('✅ [useSimulateHistory.deleteRecord] 删除成功:', id);
      setRecords(prev => prev.filter(r => r.id !== id));
      if (selectedRecord?.id === id) {
        setSelectedRecord(null);
      }
    } catch (e: any) {
      console.error('❌ [useSimulateHistory] 操作失败:', e);
      setError('删除模拟练习历史失败，请稍后重试');
    } finally {
      setDeletingId(null);
    }
  }, [deletingId, selectedRecord]);

  return {
    records,
    selectedRecord,
    loading,
    deletingId,
    error,
    loadByGirlId,
    loadByUserId,
    selectRecord,
    clearSelectedRecord,
    deleteRecord,
  };
}
