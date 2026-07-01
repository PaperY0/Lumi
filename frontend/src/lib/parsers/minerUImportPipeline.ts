/**
 * MinerU 聊天导入流水线：把 MinerU 原始 Markdown 串成完整解析流程。
 *
 * 流程：
 *   1. cleanMinerUMarkdown(originalMarkdown) → 基础清洗（删注释/图片/占位/空行/纯符号/顶部噪音）
 *   2. parseMinerURoles(originalMarkdown)     → A/B 初判（基于 image 标记，不依赖 cleaned）
 *   3. 合并 warnings + 补全空内容提示
 *   4. 返回 MinerUImportResult
 */

import type { MinerUImportResult } from '@/types';
import { cleanMinerUMarkdown } from './minerUCleaner';
import { parseMinerURoles } from './minerURoleParser';

export function parseMinerUChatMarkdown(originalMarkdown: string): MinerUImportResult {
  console.log('📥 [minerUImportPipeline] 开始解析 MinerU Markdown');

  // 步骤 1：基础清洗
  const { cleanedRawText, removedNoiseCount, warnings: cleanWarnings } =
    cleanMinerUMarkdown(originalMarkdown);

  // 步骤 2：A/B 角色初判（基于 originalMarkdown）
  const { messages, roleParsedText, warnings: roleWarnings } =
    parseMinerURoles(originalMarkdown);

  // 步骤 3：合并 warnings
  const warnings = [...cleanWarnings, ...roleWarnings];

  // 步骤 4：补全空消息提示
  if (messages.length === 0) {
    warnings.push('没有生成任何可解析消息');
  }

  const result: MinerUImportResult = {
    originalMarkdown,
    cleanedRawText,
    roleParsedText,
    messages,
    removedNoiseCount,
    warnings,
  };

  console.log('📤 [minerUImportPipeline] 解析完成:', {
    messages: messages.length,
    noise: removedNoiseCount,
    warnings: warnings.length,
  });

  return result;
}
