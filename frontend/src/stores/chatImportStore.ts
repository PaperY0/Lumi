/**
 * 聊天导入 Store：管理"刚导入但还没存进数据库"的临时聊天记录。
 * 流程：上传文件/粘贴 → 解析出消息 → 进预览页让用户确认/修正 → 点确认才落库。
 * 这中间的草稿数据就存在这里，确认或离开后调 clear() 清空。
 */

import { create } from 'zustand';
import type { ChatMessage } from '@/types';
import type { ChatImportResult, ChatMessageDraft, SenderRole } from '@/types/chatImport';
import type { MinerUImportResult, MinerUParseResponse, MinerUParsedMessage, DraftSpeakerRole } from '@/types/minerUChatImport';

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

  /** 导入增强：清洗 + 切分后的草稿消息（发言人待用户确认） */
  draftMessages: ChatMessageDraft[];
  /** 导入增强：流水线结果（含统计/warnings），供预览页顶部展示 */
  importResult: ChatImportResult | null;

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

  // ── 导入增强：草稿操作 ──
  /** 设置草稿消息 + 流水线结果（ChatImportPage 解析后调用） */
  setImportResult: (result: ChatImportResult) => void;
  /** 修改某条草稿的发言人角色 */
  updateMessageSender: (id: string, role: SenderRole) => void;
  /** 修改某条草稿的文本 */
  updateMessageText: (id: string, text: string) => void;
  /** 删除某条草稿 */
  deleteMessage: (id: string) => void;
  /** 把某条草稿合并到上一条（content 追加，用 \n 连接） */
  mergeWithPrevious: (id: string) => void;
  /** 清空草稿层 */
  clearImportResult: () => void;

  // ── MinerU A/B 流：草稿操作 ──
  /** MinerU 导入结果 + 消息（A/B/unknown） */
  minerUImportResult: MinerUImportResult | null;
  minerUMessages: MinerUParsedMessage[];
  /** 设置 MinerU 导入结果 */
  setMinerUImportResult: (result: MinerUImportResult | MinerUParseResponse) => void;
  /** 修改某条 MinerU 消息的角色（A/B/unknown） */
  updateMinerUMessageRole: (id: string, role: DraftSpeakerRole) => void;
  /** 修改某条 MinerU 消息的文本 */
  updateMinerUMessageText: (id: string, text: string) => void;
  /** 删除某条 MinerU 消息 */
  deleteMinerUMessage: (id: string) => void;
  /** 把某条 MinerU 消息合并到上一条 */
  mergeMinerUWithPrevious: (id: string) => void;
  /** 清空 MinerU 草稿层 */
  clearMinerUImportResult: () => void;
}

/** ✅ 初始状态提取为常量 */
const initialState = {
  pendingMessages: [],
  sourceMethod: null,
  importedAt: null,
  draftMessages: [],
  importResult: null,
  minerUImportResult: null,
  minerUMessages: [],
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

  // ── 导入增强：草稿操作 ──
  setImportResult: (result) =>
    set({
      importResult: result,
      draftMessages: result.messages,
    }),

  updateMessageSender: (id, role) =>
    set((state) => ({
      draftMessages: state.draftMessages.map((m) =>
        m.id === id ? { ...m, senderRole: role } : m,
      ),
    })),

  updateMessageText: (id, text) =>
    set((state) => ({
      draftMessages: state.draftMessages.map((m) =>
        m.id === id ? { ...m, cleanedText: text } : m,
      ),
    })),

  deleteMessage: (id) =>
    set((state) => ({
      draftMessages: state.draftMessages.filter((m) => m.id !== id),
    })),

  mergeWithPrevious: (id) =>
    set((state) => {
      const idx = state.draftMessages.findIndex((m) => m.id === id);
      if (idx <= 0) return state; // 没有上一条，不处理
      const prev = state.draftMessages[idx - 1];
      const cur = state.draftMessages[idx];
      const merged: ChatMessageDraft = {
        ...prev,
        cleanedText: `${prev.cleanedText}\n${cur.cleanedText}`,
        rawText: `${prev.rawText}\n${cur.rawText}`,
      };
      const next = [...state.draftMessages];
      next.splice(idx - 1, 2, merged);
      return { draftMessages: next };
    }),

  clearImportResult: () =>
    set({ draftMessages: [], importResult: null }),

  // ── MinerU A/B 流 ──
  setMinerUImportResult: (result: MinerUImportResult | MinerUParseResponse) =>
    set({
      minerUImportResult: {
        originalMarkdown: result.originalMarkdown,
        cleanedRawText: (result as any).cleanedRawText ?? (result as MinerUParseResponse).rawText ?? '',
        roleParsedText: (result as any).roleParsedText ?? (result as MinerUParseResponse).rawText ?? '',
        messages: result.messages,
        removedNoiseCount: result.removedNoiseCount ?? 0,
        warnings: result.warnings || [],
      } as MinerUImportResult,
      minerUMessages: (result.messages as MinerUParsedMessage[]).map((m, i) => ({
        ...m,
        speakerRole: (m as any).speakerRole ?? (m.role ?? 'unknown') as DraftSpeakerRole,
        id: m.id || `mineru-store-${Date.now()}-${i}`,
      })),
    }),

  updateMinerUMessageRole: (id, role) =>
    set((state) => ({
      minerUMessages: state.minerUMessages.map((m) =>
        m.id === id ? { ...m, speakerRole: role } : m,
      ),
    })),

  updateMinerUMessageText: (id, text) =>
    set((state) => ({
      minerUMessages: state.minerUMessages.map((m) =>
        m.id === id ? { ...m, cleanedText: text } : m,
      ),
    })),

  deleteMinerUMessage: (id) =>
    set((state) => ({
      minerUMessages: state.minerUMessages.filter((m) => m.id !== id),
    })),

  mergeMinerUWithPrevious: (id) =>
    set((state) => {
      const idx = state.minerUMessages.findIndex((m) => m.id === id);
      if (idx <= 0) return state;
      const prev = state.minerUMessages[idx - 1];
      const cur = state.minerUMessages[idx];
      if (prev.speakerRole !== cur.speakerRole) {
        console.warn(`[mergeMinerUWithPrevious] 角色冲突：prev=${prev.speakerRole} cur=${cur.speakerRole}，保留 prev 角色`);
      }
      const merged: MinerUParsedMessage = {
        ...prev,
        cleanedText: `${prev.cleanedText}\n${cur.cleanedText}`,
        rawText: `${prev.rawText}\n${cur.rawText}`,
      };
      const next = [...state.minerUMessages];
      next.splice(idx - 1, 2, merged);
      return { minerUMessages: next };
    }),

  clearMinerUImportResult: () =>
    set({ minerUImportResult: null, minerUMessages: [] }),
}));
