/**
 * 聊天文本清洗工具。
 *
 * 输入：OCR 或 Markdown 导入的原始文本（含大量噪声）。
 * 输出：去掉噪声行后的干净文本 + 删除噪声统计 + 警告。
 *
 * 清洗规则（保守，宁可多保留也不要误删用户聊天）：
 *   1. 删除 HTML 注释整行，如 <!-- image-->、<!-- image -->、<!-- ... -->
 *   2. 删除 Markdown 图片 ![图片](url)、![](url)
 *   3. 删除 HTML 图片 <img ...>
 *   4. 删除占位词整行：[图片]、[表情]、[动画表情]
 *   5. 删除空行
 *   6. 每行 trim，行内连续空格合并为单个空格
 *   7. 统计 removedNoiseCount
 *   8. 清洗后为空 → warnings 提示"没有识别到有效聊天内容"
 */

export interface CleanResult {
  cleanedText: string;
  removedNoiseCount: number;
  warnings: string[];
}

// 整行匹配的正则：用 ^...$ 锚定，避免误删行内正常文字
const RE_HTML_COMMENT = /^\s*<!--.*?-->\s*$/; // <!-- image--> 等
const RE_MD_IMAGE = /^!\[[^\]]*\]\([^)]*\)\s*$/; // ![图片](url) 或 ![](url)
const RE_HTML_IMG = /^\s*<img[^>]*>\s*$/i; // <img ...>
const RE_PLACEHOLDER = /^\[(图片|表情|动画表情)\]$/; // [图片] [表情] [动画表情]

export function cleanChatMarkdown(rawText: string): CleanResult {
  console.log('🧹 [chatCleaner] 原始长度:', rawText.length);

  const warnings: string[] = [];
  const kept: string[] = [];
  let removedNoiseCount = 0;

  const lines = rawText.split('\n');

  for (const line of lines) {
    const trimmed = line.trim();

    // 规则 5：空行跳过（不计入噪声，本来就是空白）
    if (!trimmed) continue;

    // 规则 1：HTML 注释整行
    if (RE_HTML_COMMENT.test(trimmed)) {
      removedNoiseCount++;
      continue;
    }

    // 规则 2：Markdown 图片整行
    if (RE_MD_IMAGE.test(trimmed)) {
      removedNoiseCount++;
      continue;
    }

    // 规则 3：HTML 图片整行
    if (RE_HTML_IMG.test(trimmed)) {
      removedNoiseCount++;
      continue;
    }

    // 规则 4：占位词整行
    if (RE_PLACEHOLDER.test(trimmed)) {
      removedNoiseCount++;
      continue;
    }

    // 规则 6：行内连续空格合并为一个空格
    const collapsed = trimmed.replace(/[ \t]+/g, ' ');
    kept.push(collapsed);
  }

  const cleanedText = kept.join('\n');

  // 规则 8：清洗后为空
  if (!cleanedText.trim()) {
    warnings.push('没有识别到有效聊天内容');
  }

  console.log('🧹 [chatCleaner] 删除噪声行数:', removedNoiseCount);
  console.log('🧹 [chatCleaner] 清洗后长度:', cleanedText.length);

  return { cleanedText, removedNoiseCount, warnings };
}
