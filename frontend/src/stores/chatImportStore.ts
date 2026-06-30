/**
 * 聊天导入 Store：管理"刚导入但还没存进数据库"的临时聊天记录。
 * 流程：上传文件/粘贴 → 解析出消息 → 进预览页让用户确认/修正 → 点确认才落库。
 * 这中间的草稿数据就存在这里，确认或离开后调 clear() 清空。
 */

import { create } from 'zustand';
import type { ChatMessage } from '@/types';

/** 导入来源方式 */
type SourceMethod = 'paste' | 'ocr' | 'file';

/** chatImportStore 的状态 + 动作类型定义 */
interface ChatImportState {
  /** 解析后的临时消息数组（id 可能还是临时的，未落库） */
  pendingMessages: ChatMessage[];
  /** 本次导入的来源方式；未导入时为 null */
  sourceMethod: SourceMethod | null;
  /** 导入时间（ISO 8601 字符串）；未导入时为 null */
  importedAt: string | null;

  /** 设置一批待确认消息，并记录来源方式与导入时间 */
  setPendingMessages: (messages: ChatMessage[], sourceMethod: SourceMethod) => void;
  /** 修正某一条消息（预览页编辑用） */
  updateMessage: (messageId: string, patch: Partial<ChatMessage>) => void;
  /** 删除某一条消息（预览页删除用） */
  removeMessage: (messageId: string) => void;
  /** 全部清空，回到初始状态 */
  clear: () => void;
  /** ✅ 重置为初始状态（别名，与其他 store 统一） */
  reset: () => void;
}

/** ✅ 初始状态提取为常量 */
const initialState = {
  pendingMessages: [],
  sourceMethod: null,
  importedAt: null,
};

export const useChatImportStore = create<ChatImportState>((set) => ({
  ...initialState,

  setPendingMessages: (messages, sourceMethod) =>
    set({
      pendingMessages: messages,
      sourceMethod,
      importedAt: new Date().toISOString(),
    }),

  updateMessage: (messageId, patch) =>
    set((state) => ({
      pendingMessages: state.pendingMessages.map((m) =>
        m.id === messageId ? { ...m, ...patch } : m,
      ),
    })),

  removeMessage: (messageId) =>
    set((state) => ({
      pendingMessages: state.pendingMessages.filter((m) => m.id !== messageId),
    })),

  clear: () => set({ ...initialState }),

  // ✅ reset 方法（与 clear 功能相同）
  reset: () => set({ ...initialState }),
}));
