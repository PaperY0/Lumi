/**
 * 聊天导入增强：OCR / Markdown 数据清洗 + 发言人选择 相关类型。
 *
 * 本文件是"导入草稿层"的类型，与 types/chat.ts 里"已落库"的 ChatMessage 区分：
 *   - ChatMessageDraft：刚从 OCR/Markdown 切出来的草稿，发言人还没定，用 me/her/unknown
 *   - ChatMessage（chat.ts）：用户确认发言人后、写入 IndexedDB 的最终消息，用 user/other
 *
 * 保存到数据库时，由 ChatPreviewPage 做映射：me→user, her→other, unknown→丢弃或保留为 other。
 */

/** 草稿阶段的发言人角色：我 / 她 / 未确定 */
export type SenderRole = 'me' | 'her' | 'unknown';

/** 一条待确认的聊天消息草稿 */
export interface ChatMessageDraft {
  /** 临时主键，预览页用它定位某条消息；落库时会换成 ChatMessage.id */
  id: string;
  /** 原始文本（清洗前的那一行，便于回溯） */
  rawText: string;
  /** 清洗后文本（去掉前缀、合并空格后） */
  cleanedText: string;
  /** 发言人角色，默认 unknown，由用户在预览页确认 */
  senderRole: SenderRole;
  /** 从文本里识别到的原始昵称（如"小明："里的"小明"），辅助用户判断 */
  senderName?: string;
  /** 时间戳（ISO 字符串），OCR/Markdown 通常没有，可选 */
  timestamp?: string;
  /** OCR 置信度 0~1，非 OCR 场景为空 */
  confidence?: number;
}

/** 导入流水线的总结果 */
export interface ChatImportResult {
  /** 原始粘贴/识别文本 */
  rawText: string;
  /** 清洗后纯文本（行用 \n 拼接） */
  cleanedText: string;
  /** 切分后的草稿消息 */
  messages: ChatMessageDraft[];
  /** 被清洗掉的噪声行数 */
  removedNoiseCount: number;
  /** 过程中的提示信息（空内容、未识别发言人等） */
  warnings: string[];
}

/** 发言人候选（用于辅助用户选择谁是我、谁是她） */
export interface SpeakerCandidate {
  /** 候选昵称 */
  name: string;
  /** 出现次数，按次数降序排序 */
  count: number;
}
