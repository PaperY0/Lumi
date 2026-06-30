/**
 * 回复历史管理 Hook
 * 负责加载、选择、删除、复制帮我回复历史记录
 */

import { useState, useCallback } from 'react';
import { replyRepository } from '@/lib/db';
import type { ReplyHistory } from '@/types';

export function useReplyHistory() {
  const [records, setRecords] = useState<ReplyHistory[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<ReplyHistory | null>(null);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [copyingText, setCopyingText] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const loadByGirlId = useCallback(async (girlId: string) => {
    console.log('📚 [useReplyHistory.loadByGirlId] 加载回复历史:', girlId);
    setLoading(true);
    setError(null);
    try {
      const list = await replyRepository.listByGirlId(girlId);
      setRecords(list);
    } catch (e) {
      console.error('❌ [useReplyHistory] 加载失败:', e);
      setError('加载回复历史失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadByUserId = useCallback(async (userId: string) => {
    console.log('📚 [useReplyHistory.loadByUserId] 加载回复历史:', userId);
    setLoading(true);
    setError(null);
    try {
      const list = await replyRepository.listByUserId(userId);
      setRecords(list);
    } catch (e) {
      console.error('❌ [useReplyHistory] 加载失败:', e);
      setError('加载回复历史失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadAll = useCallback(async () => {
    console.log('📚 [useReplyHistory.loadAll] 加载全部回复历史');
    setLoading(true);
    setError(null);
    try {
      const list = await replyRepository.listAll();
      setRecords(list);
    } catch (e) {
      console.error('❌ [useReplyHistory] 加载失败:', e);
      setError('加载回复历史失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  }, []);

  const selectRecord = useCallback((record: ReplyHistory) => {
    setSelectedRecord(record);
  }, []);

  const clearSelectedRecord = useCallback(() => {
    setSelectedRecord(null);
  }, []);

  const deleteRecord = useCallback(async (id: string) => {
    if (deletingId) return;
    console.log('🗑️ [useReplyHistory.deleteRecord] 准备删除回复历史:', id);
    setDeletingId(id);
    try {
      await replyRepository.remove(id);
      setRecords((prev) => prev.filter((r) => r.id !== id));
      if (selectedRecord?.id === id) {
        setSelectedRecord(null);
      }
      setSuccessMessage('已删除这条回复历史');
      console.log('✅ [useReplyHistory.deleteRecord] 删除成功:', id);
    } catch (e) {
      console.error('❌ [useReplyHistory] 删除失败:', e);
      setError('删除回复历史失败，请稍后重试');
    } finally {
      setDeletingId(null);
    }
  }, [deletingId, selectedRecord]);

  const copyReply = useCallback(async (text: string) => {
    console.log('📋 [useReplyHistory.copyReply] 复制回复内容');
    setCopyingText(text);
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(text);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setSuccessMessage('已复制回复内容');
    } catch (e) {
      console.error('❌ [useReplyHistory] 复制失败:', e);
      setError('复制失败，请手动复制');
    } finally {
      setTimeout(() => setCopyingText(null), 1800);
    }
  }, []);

  const clearMessage = useCallback(() => {
    setError(null);
    setSuccessMessage(null);
  }, []);

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
    records,
    selectedRecord,
    loading,
    deletingId,
    copyingText,
    error,
    successMessage,
    loadByGirlId,
    loadByUserId,
    loadAll,
    selectRecord,
    clearSelectedRecord,
    deleteRecord,
    copyReply,
    clearMessage,
    reload,
  };
}
