/**
 * 微信聊天记录解析器
 *
 * 解析微信"复制"功能导出的真实格式（三行一组：昵称/时间/内容）
 *
 * 格式示例：
 * ```
 * Paper Y
 * 2026年06月23日 08:00
 * 醒来啦
 * Whiskey
 * 2026年06月23日 08:00
 * [动画表情]
 * ```
 */

export interface ParsedMessage {
  /** 原始昵称（从聊天记录中提取） */
  senderName: string;
  /** 发送者角色（根据用户指定的"我"的昵称映射） */
  sender: 'user' | 'other';
  /** 消息内容 */
  content: string;
  /** 发送时间 */
  sentAt: Date;
}

export interface ParseResult {
  /** 解析出的消息列表 */
  messages: ParsedMessage[];
  /** 检测到的所有不重复昵称（给 UI 让用户选谁是"我"） */
  detectedNames: string[];
  /** 解析过程中的错误信息 */
  errors: string[];
}

/** 微信时间格式：YYYY年MM月DD日 HH:mm */
const TIME_REGEX = /^(\d{4})年(\d{1,2})月(\d{1,2})日\s+(\d{1,2}):(\d{2})$/;

/**
 * 解析微信聊天记录文本
 *
 * @param raw 原始聊天记录文本（三行一组格式）
 * @param myName 可选，指定哪个昵称是"我"（用于映射 sender 字段）
 * @returns 解析结果，包含消息列表、检测到的昵称和错误信息
 */
export function parseChatText(raw: string, myName?: string): ParseResult {
  const lines = raw.split('\n').map(l => l.trim());
  const messages: Omit<ParsedMessage, 'sender'>[] = [];
  const errors: string[] = [];
  const namesSet = new Set<string>();

  let i = 0;
  while (i < lines.length) {
    // 跳过空行
    if (!lines[i]) {
      i++;
      continue;
    }

    // 当前行不是时间，且下一行是时间 → 当前行是昵称
    const nameLine = lines[i];
    const timeLine = lines[i + 1];

    if (!timeLine || !TIME_REGEX.test(timeLine)) {
      // 不是消息块开头，跳过
      i++;
      continue;
    }

    if (TIME_REGEX.test(nameLine)) {
      // 昵称位置出现时间，格式异常
      errors.push(`第 ${i + 1} 行: 昵称缺失`);
      i++;
      continue;
    }

    // 解析时间
    const m = timeLine.match(TIME_REGEX)!;
    const sentAt = new Date(
      Number(m[1]),
      Number(m[2]) - 1,
      Number(m[3]),
      Number(m[4]),
      Number(m[5]),
    );

    // 收集内容直到下一个"昵称+时间"组合
    const contentLines: string[] = [];
    let j = i + 2;
    while (j < lines.length) {
      // 检查 j 和 j+1 是否构成新的消息块（昵称+时间）
      if (
        lines[j] &&
        !TIME_REGEX.test(lines[j]) &&
        lines[j + 1] &&
        TIME_REGEX.test(lines[j + 1])
      ) {
        break; // 遇到下一条消息
      }

      if (lines[j]) contentLines.push(lines[j]);
      j++;
    }

    const content = contentLines.join('\n').trim();
    if (content) {
      namesSet.add(nameLine);
      messages.push({ senderName: nameLine, content, sentAt });
    }

    i = j;
  }

  // 映射 sender 字段
  const final: ParsedMessage[] = messages.map(msg => ({
    ...msg,
    sender: myName && msg.senderName === myName ? 'user' : 'other',
  }));

  return {
    messages: final,
    detectedNames: Array.from(namesSet),
    errors,
  };
}
