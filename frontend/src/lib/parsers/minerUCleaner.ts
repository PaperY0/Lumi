/**
 * MinerU Markdown 基础清洗工具。
 *
 * 原则：
 *   - originalMarkdown 原样保留，绝不覆盖
 *   - cleanedRawText 只做"删噪声"不"判角色"
 *   - 顶部噪音（离开 / 单字母 / 纯数字 / 群名短行）只在前 5 行内删，避免误伤真实聊天
 *   - 正常短句（求/私/蹲/嗯喽）必须保留
 */

import type { MinerUCleanResult } from '@/types';

/** 整行 HTML 注释：<!-- image-->、<!-- image -->、<!-- ... --> */
const RE_HTML_COMMENT = /^\s*<!--.*?-->\s*$/;
/** 整行 Markdown 图片：![...](url)、![](url) */
const RE_MD_IMAGE = /^!\[[^\]]*\]\([^)]*\)\s*$/;
/** 整行 HTML 图片：<img ...> */
const RE_HTML_IMG = /^\s*<img[^>]*>\s*$/i;
/** 占位词整行：图片 / [图片] / [表情] / [动画表情] */
const RE_PLACEHOLDER = /^(\[?(图片|表情|动画表情)\]?)$/;
/** 纯符号/标点/空格行 */
const RE_PURE_SYMBOL = /^[。，、？！；：""''《》【】（）().,!?;:'"\s\-_=*~`|/\\<>#@$%^&+]+$/;
/** 顶部噪音：单字母（如 L） */
const RE_SINGLE_LETTER = /^[A-Za-z]$/;
/** 顶部噪音：纯数字（如 7） */
const RE_PURE_NUMBER = /^\d+$/;
/** 顶部噪音：含"离开" */
const RE_HAS_LEAVE = /离开/;
/** 顶部噪音：像群名/昵称的短行（2~12 个中文字符，无标点、无数字、无有效动词）—保守只在前5行用 */
const RE_LIKE_GROUP_NAME = /^[一-龥]{2,12}$/;

/** 顶部噪音检测：只在前 5 行内生效 */
function isTopNoise(line: string): boolean {
  if (RE_HAS_LEAVE.test(line)) return true;
  if (RE_SINGLE_LETTER.test(line)) return true;
  if (RE_PURE_NUMBER.test(line)) return true;
  if (RE_LIKE_GROUP_NAME.test(line)) return true; // 例如"冲冲宝宝"
  return false;
}

export function cleanMinerUMarkdown(originalMarkdown: string): MinerUCleanResult {
  console.log('🧹 [minerUCleaner] 原始长度:', originalMarkdown.length);

  const warnings: string[] = [];
  const lines = originalMarkdown.split('\n');
  const cleanedLines: string[] = [];
  let removedNoiseCount = 0;

  // 找到首个非空行作为顶部起点，统计前 5 个"有内容"行
  let seenTopCount = 0;
  const TOP_LIMIT = 5;

  for (const line of lines) {
    const trimmed = line.trim();

    // 删空行（不计入噪声）
    if (!trimmed) continue;

    // 删 HTML 注释整行
    if (RE_HTML_COMMENT.test(trimmed)) {
      removedNoiseCount++;
      continue;
    }
    // 删 Markdown 图片整行
    if (RE_MD_IMAGE.test(trimmed)) {
      removedNoiseCount++;
      continue;
    }
    // 删 HTML 图片整行
    if (RE_HTML_IMG.test(trimmed)) {
      removedNoiseCount++;
      continue;
    }
    // 删占位词整行
    if (RE_PLACEHOLDER.test(trimmed)) {
      removedNoiseCount++;
      continue;
    }
    // 删纯符号/标点行
    if (RE_PURE_SYMBOL.test(trimmed)) {
      removedNoiseCount++;
      continue;
    }

    // 顶部噪音（只在第 1~5 个有内容行内判断）
    if (seenTopCount < TOP_LIMIT && isTopNoise(trimmed)) {
      removedNoiseCount++;
      seenTopCount++;
      continue;
    }

    // 通过所有过滤 → 保留
    seenTopCount++;
    const collapsed = trimmed.replace(/[ \t]+/g, ' ');
    cleanedLines.push(collapsed);
  }

  const cleanedRawText = cleanedLines.join('\n');

  if (!cleanedRawText.trim()) {
    warnings.push('没有识别到有效聊天内容');
  }

  console.log('🧹 [minerUCleaner] 删除噪声行数:', removedNoiseCount);
  console.log('🧹 [minerUCleaner] 清洗后行数:', cleanedLines.length);

  return {
    originalMarkdown,
    cleanedRawText,
    removedNoiseCount,
    warnings,
  };
}