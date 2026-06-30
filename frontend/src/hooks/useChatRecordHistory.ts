import { useState, useCallback } from 'react';
import type { ChatSession, ChatMessage } from '@/types';
import { chatRepository } from '@/lib/db/repositories/chatRepo';

/**
 * 聊天记录历史管理 hook。
 * 提供按 girlId / userId / 全量加载历史会话、查看详情、删除会话的能力。
 */
export function useChatRecordHistory() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<ChatSession | null>(null);
  const [selectedMessages, setSelectedMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  /** 按 girlId 加载历史会话 */
  const loadByGirlId = useCallback(async (girlId: string) => {
    console.log('📚 [useChatRecordHistory.loadByGirlId] 加载聊天记录历史:', girlId);
    setLoading(true);
    setError(null);
    try {
      const list = await chatRepository.listSessionsByGirlId(girlId);
      setSessions(list);
    } catch (err) {
      console.error('❌ [useChatRecordHistory] 操作失败:', err);
      setError('加载聊天记录历史失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  }, []);

  /** 按 userId 加载历史会话 */
  const loadByUserId = useCallback(async (userId: string) => {
    console.log('📚 [useChatRecordHistory.loadByUserId] 加载聊天记录历史:', userId);
    setLoading(true);
    setError(null);
    try {
      const list = await chatRepository.listSessions(userId);
      setSessions(list);
    } catch (err) {
      console.error('❌ [useChatRecordHistory] 操作失败:', err);
      setError('加载聊天记录历史失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  }, []);

  /** 加载全部历史会话（兜底） */
  const loadAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await chatRepository.listAllSessions();
      setSessions(list);
    } catch (err) {
      console.error('❌ [useChatRecordHistory] 操作失败:', err);
      setError('加载聊天记录历史失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  }, []);

  /** 选中某条会话并加载详情 */
  const selectSession = useCallback(async (session: ChatSession) => {
    console.log('📖 [useChatRecordHistory.selectSession] 加载聊天详情:', session.id);
    setSelectedSession(session);
    setLoadingDetail(true);
    setError(null);
    try {
      const messages = await chatRepository.getMessages(session.id);
      setSelectedMessages(messages);
    } catch (err) {
      console.error('❌ [useChatRecordHistory] 操作失败:', err);
      setError('加载聊天详情失败，请稍后重试');
    } finally {
      setLoadingDetail(false);
    }
  }, []);

  /** 清空选中状态 */
  const clearSelectedSession = useCallback(() => {
    setSelectedSession(null);
    setSelectedMessages([]);
  }, []);

  /** 删除某条会话（含其下消息） */
  const deleteSession = useCallback(async (sessionId: string) => {
    if (deletingId) return;
    console.log('🗑️ [useChatRecordHistory.deleteSession] 准备删除聊天记录:', sessionId);
    setDeletingId(sessionId);
    setError(null);
    try {
      await chatRepository.deleteSession(sessionId);
      setSessions((prev) => prev.filter((s) => s.id !== sessionId));
      if (selectedSession?.id === sessionId) {
        setSelectedSession(null);
        setSelectedMessages([]);
      }
      setSuccessMessage('已删除这次聊天记录');
    } catch (err) {
      console.error('❌ [useChatRecordHistory] 操作失败:', err);
      setError('删除聊天记录失败，请稍后重试');
    } finally {
      setDeletingId(null);
    }
  }, [deletingId, selectedSession]);

  /** 清除提示消息 */
  const clearMessage = useCallback(() => {
    setError(null);
    setSuccessMessage(null);
  }, []);

  /** 重新加载（复用当前维度） */
  const reload = useCallback(() => {
    // 外部自行决定调用哪个 load
  }, []);

  return {
    sessions,
    selectedSession,
    selectedMessages,
    loading,
    loadingDetail,
    deletingId,
    error,
    successMessage,
    loadByGirlId,
    loadByUserId,
    loadAll,
    selectSession,
    clearSelectedSession,
    deleteSession,
    clearMessage,
    reload,
  };
}
