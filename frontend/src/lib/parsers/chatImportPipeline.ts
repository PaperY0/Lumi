/**
 * 聊天导入流水线：把原始文本串成完整解析流程。
 *
 * 流程：
 *   1. cleanChatMarkdown(rawText)  → 清洗噪声
 *   2. segmentChatLines(cleaned)   → 切成消息草稿
 *   3. 补全 warnings：
 *        - messages 为空 → "没有生成任何消息"
 *        - 全部 unknown  → "没有识别到发言人，请在预览页手动选择谁是我、谁是她"
 *   4. 返回 ChatImportResult
 */

import type { ChatImportResult } from '@/types';
import { cleanChatMarkdown } from './chatCleaner';
import { segmentChatLines } from './chatSegmenter';
import { parseChatText } from '../chatImportParser';

export function parseImportedChatText(rawText: string, options?: { userName?: string; girlName?: string }): ChatImportResult {
  console.log('📥 [chatImportPipeline] 开始解析导入文本');

  // 步骤 1：清洗
  const { cleanedText, removedNoiseCount, warnings } = cleanChatMarkdown(rawText);

  // 步骤 2：切分
  const parsed = parseChatText(cleanedText, options);
  const messages = parsed.messages.length ? parsed.messages.map(message => ({
    id: message.id, rawText: message.rawLine, cleanedText: message.content,
    senderName: message.senderName, timestamp: message.timestamp,
    senderRole: message.role === 'user' || /^(我|我方)$/.test(message.senderName) ? 'me' as const
      : message.role === 'girl' || /^(她|对方)$/.test(message.senderName) ? 'her' as const : 'unknown' as const,
  })) : segmentChatLines(cleanedText);

  // 步骤 3：补全 warnings
  if (messages.length === 0) {
    warnings.push('没有生成任何消息');
  } else if (messages.every((m) => m.senderRole === 'unknown')) {
    warnings.push('没有识别到发言人，请在预览页手动选择谁是我、谁是她');
  }

  const result: ChatImportResult = {
    rawText,
    cleanedText,
    messages,
    removedNoiseCount,
    warnings,
  };

  console.log('📤 [chatImportPipeline] 解析完成:', { messages: messages.length });
  return result;
}
