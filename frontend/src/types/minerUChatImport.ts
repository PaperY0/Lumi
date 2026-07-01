/**
 * MinerU Markdown 聊天记录导入相关类型。
 *
 * 与 types/chatImport.ts 的区别：
 *   - chatImport.ts 使用 me/her/unknown（针对粘贴文本，用户已知"谁是我"）
 *   - 本文件使用 A/B/unknown（针对 MinerU OCR，按头像位置初判 A/B，最终由用户映射成 me/her）
 *
 * 关键原则：
 *   - originalMarkdown 永远保留原样，不被清洗覆盖
 *   - cleanedRawText 是基础清洗结果（删注释/图片/占位词）
 *   - A/B 角色识别基于 originalMarkdown（保留 image 标记作线索），不是 cleanedRawText
 *   - 程序只做初步判断，最终以用户在预览页手动矫正为准
 */

/** 草稿阶段发言人角色：A / B / 未确定（A/B 谁是我谁是她由用户在保存时决定） */
export type DraftSpeakerRole = 'A' | 'B' | 'unknown';

/** 基础清洗结果 */
export interface MinerUCleanResult {
  /** 原始 Markdown，原样保留 */
  originalMarkdown: string;
  /** 清洗后纯文本（删了注释/图片/占位/空行/纯符号/顶部噪音） */
  cleanedRawText: string;
  /** 删除的噪声行数 */
  removedNoiseCount: number;
  /** 警告信息 */
  warnings: string[];
}

/** 一条经过 A/B 初判的消息 */
export interface MinerUParsedMessage {
  /** 临时主键 */
  id: string;
  /** 原始行文本 */
  rawText: string;
  /** 清洗后文本 */
  cleanedText: string;
  /** 初判角色 A/B/unknown */
  speakerRole: DraftSpeakerRole;
  /** 置信度 0~1，越接近 1 越可信 */
  confidence: number;
  /** 判断理由（便于调试和用户理解） */
  reason?: string;
}

/** MinerU 导入流水线总结果 */
export interface MinerUImportResult {
  /** 原始 Markdown，原样 */
  originalMarkdown: string;
  /** 基础清洗后纯文本 */
  cleanedRawText: string;
  /** A/B 初判后的角色文本（A: xxx\nB: xxx\unknown: xxx），用于调试输出 */
  roleParsedText: string;
  /** 切分+初判后的消息 */
  messages: MinerUParsedMessage[];
  /** 删除的噪声行数 */
  removedNoiseCount: number;
  /** 警告信息 */
  warnings: string[];
}