/**
 * UI Store：全局 UI 状态。
 * 管理 loading 蒙层、全局错误、轻提示（toast）这类"跨页面、临时性"的界面状态。
 * 不放任何业务数据。
 */

import { create } from 'zustand';

/** toast 类型 */
type ToastType = 'success' | 'error' | 'info';

/** 单条 toast 结构 */
interface Toast {
  /** toast 唯一 id（用时间戳即可） */
  id: string;
  /** 提示文案 */
  message: string;
  /** 提示类型，决定颜色/图标 */
  type: ToastType;
}

/** uiStore 的状态 + 动作类型定义 */
interface UiState {
  /** 是否显示全局 loading 蒙层 */
  globalLoading: boolean;
  /** loading 蒙层上显示的文案 */
  loadingMessage: string;
  /** 全局错误信息；无错误时为 null */
  error: string | null;
  /** 当前 toast；无 toast 时为 null */
  toast: Toast | null;

  /** 显示全局 loading，可带一句文案 */
  showLoading: (message?: string) => void;
  /** 隐藏全局 loading */
  hideLoading: () => void;
  /** 设置/清除全局错误 */
  setError: (error: string | null) => void;
  /** 弹一条 toast，3 秒后自动清空 */
  showToast: (message: string, type?: ToastType) => void;
  /** 立即清空 toast */
  clearToast: () => void;
}

export const useUiStore = create<UiState>((set, get) => ({
  globalLoading: false,
  loadingMessage: '',
  error: null,
  toast: null,

  showLoading: (message = '') =>
    set({ globalLoading: true, loadingMessage: message }),

  hideLoading: () => set({ globalLoading: false, loadingMessage: '' }),

  setError: (error) => set({ error }),

  showToast: (message, type = 'info') => {
    const id = Date.now().toString();
    set({ toast: { id, message, type } });
    // 3 秒后自动清空——但只清"这一条"，避免清掉期间又弹出的新 toast
    setTimeout(() => {
      if (get().toast?.id === id) {
        set({ toast: null });
      }
    }, 3000);
  },

  clearToast: () => set({ toast: null }),
}));
