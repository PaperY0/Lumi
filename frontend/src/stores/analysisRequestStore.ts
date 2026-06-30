/**
 * 分析请求 Store：ChatImportPage → AIAnalysisPage 的临时传递。
 * 不持久化，不写 localStorage，页面刷新后清空。
 */

import { create } from 'zustand';

interface AnalysisRequestState {
  /** 待分析的聊天 session id */
  pendingSessionId: string | null;
  /** 用户填写的分析侧重点 */
  pendingFocusQuestion: string | null;

  /** 设置待分析请求 */
  setPending: (sessionId: string, focusQuestion?: string) => void;
  /** 清空待分析请求 */
  clearPending: () => void;
}

export const useAnalysisRequestStore = create<AnalysisRequestState>((set) => ({
  pendingSessionId: null,
  pendingFocusQuestion: null,

  setPending: (sessionId, focusQuestion) => {
    const trimmed = focusQuestion?.trim() || null;
    console.log('🎯 [analysisRequestStore] 设置待分析请求', {
      sessionId,
      hasFocusQuestion: Boolean(trimmed),
    });
    set({
      pendingSessionId: sessionId,
      pendingFocusQuestion: trimmed,
    });
  },

  clearPending: () => {
    set({
      pendingSessionId: null,
      pendingFocusQuestion: null,
    });
  },
}));
