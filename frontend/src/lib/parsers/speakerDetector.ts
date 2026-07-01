/**
 * 发言人候选识别工具。
 *
 * 从清洗后的文本里检测 "名字：内容" / "名字: 内容" 格式，
 * 统计冒号前的名字出现次数，返回前 5 个候选人。
 *
 * 这个函数只是辅助用户判断"谁是我、谁是她"，不强行决定角色。
 */

import type { SpeakerCandidate } from '@/types';

/** "名字：内容" 格式，名字 1~12 字符，中文/英文冒号均可 */
const RE_NAME_PREFIX = /^([^：:\n]{1,12})[：:]\s*(.+)$/;

/** 无效名字黑名单：URL 协议、时间、空 */
const INVALID_NAMES = new Set(['http', 'https', '时间', '']);

export function detectSpeakerCandidates(cleanedText: string): SpeakerCandidate[] {
  const counts = new Map<string, number>();
  const lines = cleanedText.split('\n');

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    const match = trimmed.match(RE_NAME_PREFIX);
    if (!match) continue;

    const name = match[1].trim();
    // 黑名单过滤
    if (INVALID_NAMES.has(name.toLowerCase())) continue;
    // 跳过纯数字（可能是时间残留）
    if (/^\d+$/.test(name)) continue;

    counts.set(name, (counts.get(name) ?? 0) + 1);
  }

  const candidates: SpeakerCandidate[] = Array.from(counts.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  console.log('👤 [speakerDetector] 候选人:', candidates);
  return candidates;
}
