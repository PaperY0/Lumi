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

export function parseImportedChatText(rawText: string): ChatImportResult {
  console.log('📥 [chatImportPipeline] 开始解析导入文本');

  // 步骤 1：清洗
  const { cleanedText, removedNoiseCount, warnings } = cleanChatMarkdown(rawText);

  // 步骤 2：切分
  const messages = segmentChatLines(cleanedText);

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

  console.log('📤 [chatImportPipeline] 解析完成:', result);
  return result;
}
