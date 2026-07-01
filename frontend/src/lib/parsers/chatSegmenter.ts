/**
 * 聊天消息切分工具。
 *
 * 把清洗后的纯文本按行切成 ChatMessageDraft[]。
 *
 * 第一版规则（保守，不强行合并上下行，避免误伤短句）：
 *   1. 按 \n 分割，空行跳过
 *   2. 每行作为一条消息草稿
 *   3. id 用 crypto.randomUUID()，不支持则用 Date.now()+index 兜底
 *   4. rawText = 该行原文，cleanedText = 该行文本
 *   5. senderRole 默认 'unknown'
 *   6. 检测 "我：xxx" / "她：xxx" / "我: xxx" / "她: xxx" 前缀：
 *        - 命中 → senderRole 设为 me/her，去掉前缀作为 cleanedText
 *   7. 单个标点（纯符号）跳过，不算消息
 */

import type { ChatMessageDraft, SenderRole } from '@/types';

/** "我：xxx" / "她：xxx" / "我: xxx" / "她: xxx" 前缀识别 */
const RE_ME_PREFIX = /^我\s*[：:]\s*(.*)$/;
const RE_HER_PREFIX = /^她\s*[：:]\s*(.*)$/;

/** 纯标点符号行（单个或几个标点，无有效字符）跳过 */
const RE_PURE_PUNCT = /^[。，、？！；：""''《》【】（）().,!?;:'"\s]+$/;

/** 生成 id：优先 crypto.randomUUID，不支持则兜底 */
function genId(index: number): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `draft-${Date.now()}-${index}`;
}

export function segmentChatLines(cleanedText: string): ChatMessageDraft[] {
  const messages: ChatMessageDraft[] = [];
  const lines = cleanedText.split('\n');

  let idx = 0;
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    // 规则 7：纯标点跳过
    if (RE_PURE_PUNCT.test(trimmed)) continue;

    let senderRole: SenderRole = 'unknown';
    let cleanedText = trimmed;
    let senderName: string | undefined;

    // 规则 6：检测 我/她 前缀
    const meMatch = trimmed.match(RE_ME_PREFIX);
    if (meMatch) {
      senderRole = 'me';
      senderName = '我';
      cleanedText = meMatch[1].trim();
    } else {
      const herMatch = trimmed.match(RE_HER_PREFIX);
      if (herMatch) {
        senderRole = 'her';
        senderName = '她';
        cleanedText = herMatch[1].trim();
      }
    }

    // 去掉前缀后如果空了，跳过
    if (!cleanedText) continue;

    messages.push({
      id: genId(idx),
      rawText: trimmed,
      cleanedText,
      senderRole,
      senderName,
    });
    idx++;
  }

  console.log('✂️ [chatSegmenter] 生成消息数:', messages.length);
  return messages;
}
