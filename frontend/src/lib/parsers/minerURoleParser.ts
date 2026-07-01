/**
 * MinerU A/B 初步角色识别工具。
 *
 * 核心逻辑：利用 MinerU 输出里的 <!-- image--> 标记作为头像位置线索。
 * 微信/QQ 聊天截图中，头像在左侧表示对方，在右侧表示自己。
 * MinerU 把每个头像/表情渲染成 <!-- image--> 注释，这个标记是我们判断 A/B 的关键信号。
 *
 * 规则（基于 originalMarkdown，不基于 cleanedRawText）：
 *   1. 按行拆分，保留 <!-- image--> 作为位置信号
 *   2. 过滤纯噪声行（HTML注释/图片语法/占位词/纯符号/顶部噪音），与 cleaner 一致
 *   3. 遇到有效文本行时，检查它与最近 image 标记的上下文关系：
 *      - image → text → EMPTY/NEXT_TEXT → 文字左侧（对方/A）
 *      - text → image → ...                           → 文字右侧（自己/B）
 *      更精确的判断：
 *        a. 上一有效行是 image 且下一有效行不是 image → A（头像在左）
 *        b. 下一有效行是 image 且上一有效行不是 image → B（头像在右）
 *        c. 上一 image，下一也 image → unknown, confidence=0.4
 *        d. 附近无 image → unknown, confidence=0.2
 *   4. 第一条消息特殊处理：如果第一条之前有 image → B
 *   5. 不合并连续短句，一行一条，交给用户手动处理
 */

import type { MinerUParsedMessage, DraftSpeakerRole } from '@/types';

/** 生成 id */
function genId(index: number): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `mineru-draft-${Date.now()}-${index}`;
}

/** 是否为 image 标记行 */
function isImageLine(line: string): boolean {
  return /^\s*<!--\s*image\s*-->\s*$/.test(line.trim());
}

/** 是否为应跳过的纯噪声行（与 cleaner 一致，但不包括 image 标记行） */
function isNoiseLine(line: string): boolean {
  const t = line.trim();
  if (!t) return true;
  // image 标记不是噪声，是信号！
  if (isImageLine(t)) return false;
  // HTML 注释
  if (/^\s*<!--.*?-->\s*$/.test(t)) return true;
  // Markdown 图片
  if (/^!\[[^\]]*\]\([^)]*\)\s*$/.test(t)) return true;
  // HTML 图片
  if (/^\s*<img[^>]*>\s*$/i.test(t)) return true;
  // 占位词
  if (/^(\[?(图片|表情|动画表情)\]?)$/.test(t)) return true;
  // 纯符号
  if (/^[。，、？！；：""''《》【】（）().,!?;:'"\s\-_=*~`|/\\<>#@$%^&+]+$/.test(t)) return true;
  // 顶部噪音（单字母/纯数字/含"离开"/群名短行）— 在前 5 个非空行生效
  return false;
}

/** 顶部噪音（与 cleaner 一致） */
function isTopNoise(line: string): boolean {
  return /离开/.test(line) || /^[A-Za-z]$/.test(line) || /^\d+$/.test(line) || /^[一-龥]{2,12}$/.test(line);
}

function cleanText(line: string): string {
  return line.trim().replace(/[ \t]+/g, ' ');
}

export function parseMinerURoles(originalMarkdown: string): {
  messages: MinerUParsedMessage[];
  roleParsedText: string;
  warnings: string[];
} {
  console.log('🧭 [minerURoleParser] 开始基于 image 标记推断角色');

  const warnings: string[] = [];
  const allLines = originalMarkdown.split('\n');

  // ── 第一次遍历：构建有效行索引（含 image 作为信号）────────
  // tokens: { type: 'image' | 'text', line: string, index: number }
  const tokens: { type: 'image' | 'text'; line: string; originalIdx: number }[] = [];
  let seenTopCount = 0;

  for (let i = 0; i < allLines.length; i++) {
    const t = allLines[i].trim();
    if (!t) continue;

    if (isImageLine(t)) {
      tokens.push({ type: 'image', line: t, originalIdx: i });
      seenTopCount++;
      continue;
    }

    if (isNoiseLine(t)) {
      // 顶部噪音在前 5 个非空行才删除
      if (seenTopCount < 5 && isTopNoise(t)) {
        seenTopCount++;
        continue;
      }
      // 非顶部的普通噪声也跳过
      continue;
    }

    // 有效文本行
    seenTopCount++;
    tokens.push({ type: 'text', line: t, originalIdx: i });
  }

  // ── 第二次遍历：基于 image 上下文判断角色 ────────────────
  const messages: MinerUParsedMessage[] = [];
  let aCount = 0, bCount = 0, unknownCount = 0;

  for (let i = 0; i < tokens.length; i++) {
    const tok = tokens[i];
    if (tok.type !== 'text') continue;

    const prevTok = i > 0 ? tokens[i - 1] : null;
    const nextTok = i < tokens.length - 1 ? tokens[i + 1] : null;

    const prevIsImage = prevTok?.type === 'image';
    const nextIsImage = nextTok?.type === 'image';

    let speakerRole: DraftSpeakerRole = 'unknown';
    let confidence = 0.2;
    let reason = '附近没有 image 标记，无法判断角色';

    if (prevIsImage && !nextIsImage) {
      // image → text → (空/更多text) → 文字在头像右侧 → A（对方）
      speakerRole = 'A';
      confidence = 0.7;
      reason = `上一行是 image 标记（第 ${tok.originalIdx + 1} 行前），文字在头像右侧，初判为 A`;
    } else if (!prevIsImage && nextIsImage) {
      // text → image → ... → 文字在头像左侧 → B（自己）
      speakerRole = 'B';
      confidence = 0.7;
      reason = `下一行是 image 标记（第 ${tok.originalIdx + 1} 行后），文字在头像左侧，初判为 B`;
    } else if (prevIsImage && nextIsImage) {
      speakerRole = 'unknown';
      confidence = 0.4;
      reason = '上下行均为 image 标记，无法确定文字归属哪一侧';
    } else {
      // 无附近 image
      speakerRole = 'unknown';
      confidence = 0.2;
      reason = '附近没有 image 标记，无法判断角色';
    }

    // 第一条消息特殊处理：如果之前有 image（即第一条有效文本的上一条是 image）
    // 实际上上面已经覆盖了；再加一个边界：如果只有 1 个 text 前面都是 image
    if (i === 0 && messages.length === 0 && prevIsImage) {
      speakerRole = 'A';
      confidence = 0.6;
      reason = '首条消息前有 image 标记，初判为 A';
    }

    if (speakerRole === 'A') aCount++;
    else if (speakerRole === 'B') bCount++;
    else unknownCount++;

    messages.push({
      id: genId(messages.length),
      rawText: tok.line,
      cleanedText: cleanText(tok.line),
      speakerRole,
      confidence,
      reason,
    });
  }

  // ── 构建 roleParsedText ─────────────────────────────────
  const roleParsedText = messages
    .map((m) => `${m.speakerRole}: ${m.cleanedText}`)
    .join('\n');

  // ── warnings ─────────────────────────────────────────────
  if (unknownCount > messages.length / 2) {
    warnings.push('部分消息无法可靠判断发言人，请在预览页手动确认。');
  }

  console.log('🧭 [minerURoleParser] 生成消息数:', messages.length);
  console.log('🧭 [minerURoleParser] A 数量:', aCount, 'B 数量:', bCount, 'unknown 数量:', unknownCount);

  return { messages, roleParsedText, warnings };
}
