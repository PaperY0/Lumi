/**
 * 聊天导入解析器 — 统一中间格式
 *
 * ============================================================================
 * 标准中间格式（所有导入路径最终统一为此格式）
 * ============================================================================
 *
 *   发送人标识：消息内容
 *
 * 发送人标识支持以下两种形式：
 *
 *   格式 A（昵称式）— 直接使用聊天中的昵称：
 *     wh：今天还好吗？
 *     Alice: Hello
 *
 *   格式 B（方向式，用于 OCR / 无昵称场景）— 使用方向标识代替昵称：
 *     左侧：消息内容      左边：消息内容      我方：消息内容
 *     右侧：消息内容      右边：消息内容      对方：消息内容
 *
 * 规则：
 *   - 同时支持中文冒号"："和英文冒号":"。
 *   - 一行没有发送人前缀时，视为上一条消息的续行追加（多行消息合并）。
 *   - 空行跳过，不产生消息也不追加到续行。
 *   - 时间戳行、系统提示、图片占位等噪音行被过滤。
 *
 * 输入源（均通过 parseChatText 统一解析为 ParsedChatMessage[]）：
 *   1. 用户粘贴文本  → 格式 A 或格式 B
 *   2. OCR 识别结果  → 格式 B（chatImageOcr.ts 输出 左侧：/右侧：）
 *   3. 文件导入      → 格式 A（chatFileImporter.ts 输出 sender：content）
 *
 * 所有路径最终都通过本文件的 parseChatText 解析，输出统一的
 * ParsedChatMessage[] 结构，供 ChatImportPage 和 senderMapping 使用。
 * ============================================================================
 *
 * 原始格式检测（自动识别，无需用户选择）：
 *   1. colon          - 昵称：内容 或 昵称: 内容
 *   2. bracket-time   - [2026/06/24 18:30] 昵称：内容
 *   3. datetime-prefix - 2026-06-24 18:30 昵称：内容
 *   4. wechat-block   - 昵称\n时间\n内容（微信复制三行格式）
 *
 * 不调用 AI，不请求后端，纯本地解析。
 */

export interface ParsedChatMessage {
  id: string;
  role: 'user' | 'girl' | 'unknown';
  senderName: string;
  content: string;
  rawLine: string;
  timestamp?: string;
  createdAt: string;
}

export interface ChatImportParseResult {
  messages: ParsedChatMessage[];
  skippedLines: string[];
  warnings: string[];
  detectedFormat: string;
  userMessageCount: number;
  girlMessageCount: number;
  unknownMessageCount: number;
}

/** 时间模式 */
const BRACKET_TIME_RE = /^\[(\d{4}\/\d{1,2}\/\d{1,2}\s+\d{1,2}:\d{2})\]\s*/;
const DATETIME_RE = /^(\d{4}-\d{1,2}-\d{1,2}\s+\d{1,2}:\d{2})\s*/;
const WECHAT_TIME_RE = /^(\d{4})年(\d{1,2})月(\d{1,2})日\s+(\d{1,2}):(\d{2})$/;

/**
 * 冒号分隔正则 — 匹配"发送人：内容"或"发送人: 内容"。
 * 发送人标识可以是昵称（格式 A）或方向标识（格式 B：左侧/右侧/左边/右边/我方/对方）。
 */
const COLON_RE = /^([^：:]+)[：:]\s*(.+)$/;

/** 系统消息关键词 */
const SYSTEM_KEYWORDS = [
  '撤回了一条消息',
  '以上是打招呼内容',
  '聊天记录',
  '图片',
  '表情',
  '动画表情',
  '语音消息',
  '视频消息',
  '文件',
  '位置',
  '名片',
  '红包',
  '转账',
  '你已添加了',
  '以上是',
  '系统消息',
  '以下是打招呼',
];

/**
 * 判断一行是否应该跳过（不是有效聊天消息）
 * 用于过滤图片、HTML、Markdown、base64、bbox、OCR、系统内容等
 */
function shouldSkipLine(line: string): boolean {
  const trimmed = line.trim();

  // 空行
  if (!trimmed) return true;

  // 纯图片/媒体占位
  if (/^\[?(图片|表情|动画表情|视频|语音|语音消息|视频消息|文件|位置|名片|红包|转账)\]?$/.test(trimmed)) {
    return true;
  }

  // 撤回消息
  if (trimmed.includes('撤回了一条消息')) return true;

  // 聊天记录标题或系统提示
  if (/^(聊天记录|系统消息|以上是|以下是打招呼)/.test(trimmed)) return true;

  // OCR / bbox
  if (/^bbox\s*\d*/i.test(trimmed)) return true;

  // HTML 图片标签
  if (/<img[\s>]/i.test(trimmed)) return true;

  // Markdown 图片
  if (/!\[.*?\]\(.*?\)/.test(trimmed)) return true;

  // base64 图片
  if (/data:image\/[a-zA-Z]+;base64,/i.test(trimmed)) return true;

  // 过长 base64 内容
  if (trimmed.length > 2000 && /base64/i.test(trimmed)) return true;

  // 纯时间行
  if (/^\d{1,2}:\d{2}$/.test(trimmed)) return true;
  if (/^\d{4}[/-]\d{1,2}[/-]\d{1,2}\s+\d{1,2}:\d{2}$/.test(trimmed)) return true;

  // 文件导入分隔行
  if (/^--- 文件：.*---$/.test(trimmed)) return true;

  return false;
}

function isSystemMessage(content: string): boolean {
  const trimmed = content.trim();
  return SYSTEM_KEYWORDS.some((k) => trimmed.includes(k)) || /^\[.+\]$/.test(trimmed);
}

function cleanContent(raw: string): string {
  return raw
    .replace(/​/g, '')
    .replace(/ /g, ' ')
    .trim();
}

let _idCounter = 0;
function nextId(): string {
  _idCounter++;
  return `msg-${Date.now()}-${_idCounter}`;
}

/**
 * 解析聊天记录文本，支持多种格式。
 *
 * 所有输入最终都通过此函数统一为 ParsedChatMessage[]。
 * 发送人标识支持格式 A（昵称式）和格式 B（方向式：左侧/右侧/左边/右边/我方/对方）。
 * 无发送人前缀的行自动作为上一条消息的续行合并。
 *
 * @param input 原始文本
 * @param options.userName 用户昵称（用于匹配 role='user'）
 * @param options.girlName 女生昵称（用于匹配 role='girl'）
 */
export function parseChatText(
  input: string,
  options?: { userName?: string; girlName?: string },
): ChatImportParseResult {
  _idCounter = 0;

  const result: ChatImportParseResult = {
    messages: [],
    skippedLines: [],
    warnings: [],
    detectedFormat: 'unknown',
    userMessageCount: 0,
    girlMessageCount: 0,
    unknownMessageCount: 0,
  };

  if (!input || !input.trim()) return result;

  const lines = input.split('\n');

  // ── 检测格式 ──────────────────────────────────────────
  let bracketCount = 0;
  let datetimeCount = 0;
  let colonCount = 0;
  let wechatBlockCount = 0;

  for (let i = 0; i < lines.length; i++) {
    const t = lines[i].trim();
    if (!t) continue;
    if (BRACKET_TIME_RE.test(t)) bracketCount++;
    else if (DATETIME_RE.test(t)) datetimeCount++;
    if (COLON_RE.test(t)) colonCount++;
    if (
      WECHAT_TIME_RE.test(t) &&
      i > 0 &&
      lines[i - 1].trim() &&
      !WECHAT_TIME_RE.test(lines[i - 1].trim())
    ) {
      wechatBlockCount++;
    }
  }

  const max = Math.max(bracketCount, datetimeCount, colonCount, wechatBlockCount);
  if (max === 0) {
    result.warnings.push('未识别到任何有效消息行，请检查格式');
    return result;
  }

  if (max === bracketCount && bracketCount >= 2) {
    result.detectedFormat = 'bracket-time';
    parseBracketTime(lines, result, options);
  } else if (max === datetimeCount && datetimeCount >= 2) {
    result.detectedFormat = 'datetime-prefix';
    parseDatetimePrefix(lines, result, options);
  } else if (max === wechatBlockCount && wechatBlockCount >= 2) {
    result.detectedFormat = 'wechat-block';
    parseWechatBlock(lines, result, options);
  } else if (max === colonCount && colonCount >= 2) {
    result.detectedFormat = 'colon';
    parseColon(lines, result, options);
  } else {
    // 尝试按 colon 解析
    result.detectedFormat = 'colon';
    parseColon(lines, result, options);
  }

  // ── 角色统计 ──────────────────────────────────────────
  result.userMessageCount = result.messages.filter((m) => m.role === 'user').length;
  result.girlMessageCount = result.messages.filter((m) => m.role === 'girl').length;
  result.unknownMessageCount = result.messages.filter((m) => m.role === 'unknown').length;

  return result;
}

// ── 续行合并 ──────────────────────────────────────────────

/**
 * 尝试将一行无发送人前缀的文本作为续行追加到上一条消息。
 * 如果尚无可追加的消息，则记入 skippedLines。
 * 返回 true 表示已处理（已追加或已跳过），调用方应 continue。
 */
function tryAppendContinuation(
  line: string,
  result: ChatImportParseResult,
): boolean {
  if (result.messages.length > 0) {
    const last = result.messages[result.messages.length - 1];
    last.content += '\n' + line;
    last.rawLine += '\n' + line;
    return true;
  }
  result.skippedLines.push(line);
  return true;
}

// ── 格式解析 ──────────────────────────────────────────────

function parseBracketTime(
  lines: string[],
  result: ChatImportParseResult,
  opts?: { userName?: string; girlName?: string },
): void {
  for (const rawLine of lines) {
    const line = rawLine.trim();

    // 空行跳过
    if (!line) continue;

    // 系统/噪音行跳过
    if (shouldSkipLine(line)) {
      result.skippedLines.push(line);
      continue;
    }

    const timeMatch = line.match(BRACKET_TIME_RE);
    if (!timeMatch) {
      // 无时间前缀 → 续行
      tryAppendContinuation(line, result);
      continue;
    }

    const rest = line.slice(timeMatch[0].length).trim();
    const colonMatch = rest.match(COLON_RE);
    if (!colonMatch) {
      if (rest && !isSystemMessage(rest)) {
        result.warnings.push(`括号时间后无法识别发送人: ${line.slice(0, 40)}`);
      } else {
        result.skippedLines.push(line);
      }
      continue;
    }

    const senderName = cleanContent(colonMatch[1]);
    const content = cleanContent(colonMatch[2]);

    if (!content || isSystemMessage(content) || shouldSkipLine(content)) {
      result.skippedLines.push(line);
      continue;
    }

    const ts = parseFlexibleTime(timeMatch[1]);
    result.messages.push({
      id: nextId(),
      role: resolveRole(senderName, opts),
      senderName,
      content,
      rawLine: line,
      timestamp: ts || undefined,
      createdAt: ts || new Date().toISOString(),
    });
  }
}

function parseDatetimePrefix(
  lines: string[],
  result: ChatImportParseResult,
  opts?: { userName?: string; girlName?: string },
): void {
  for (const rawLine of lines) {
    const line = rawLine.trim();

    // 空行跳过
    if (!line) continue;

    // 系统/噪音行跳过
    if (shouldSkipLine(line)) {
      result.skippedLines.push(line);
      continue;
    }

    const timeMatch = line.match(DATETIME_RE);
    if (!timeMatch) {
      // 无时间前缀 → 续行
      tryAppendContinuation(line, result);
      continue;
    }

    const rest = line.slice(timeMatch[0].length).trim();
    const colonMatch = rest.match(COLON_RE);
    if (!colonMatch) {
      if (rest && !isSystemMessage(rest)) {
        result.warnings.push(`日期时间后无法识别发送人: ${line.slice(0, 40)}`);
      } else {
        result.skippedLines.push(line);
      }
      continue;
    }

    const senderName = cleanContent(colonMatch[1]);
    const content = cleanContent(colonMatch[2]);

    if (!content || isSystemMessage(content) || shouldSkipLine(content)) {
      result.skippedLines.push(line);
      continue;
    }

    const ts = parseFlexibleTime(timeMatch[1]);
    result.messages.push({
      id: nextId(),
      role: resolveRole(senderName, opts),
      senderName,
      content,
      rawLine: line,
      timestamp: ts || undefined,
      createdAt: ts || new Date().toISOString(),
    });
  }
}

function parseColon(
  lines: string[],
  result: ChatImportParseResult,
  opts?: { userName?: string; girlName?: string },
): void {
  for (const rawLine of lines) {
    const line = rawLine.trim();

    // 空行跳过
    if (!line) continue;

    // 系统/噪音行跳过
    if (shouldSkipLine(line)) {
      result.skippedLines.push(line);
      continue;
    }

    const match = line.match(COLON_RE);
    if (!match) {
      // 无发送人前缀 → 续行
      tryAppendContinuation(line, result);
      continue;
    }

    const senderName = cleanContent(match[1]);
    const content = cleanContent(match[2]);

    if (!content || isSystemMessage(content) || shouldSkipLine(content)) {
      result.skippedLines.push(line);
      continue;
    }

    if (senderName.length > 30 || content.length < 1) {
      result.skippedLines.push(line);
      continue;
    }

    result.messages.push({
      id: nextId(),
      role: resolveRole(senderName, opts),
      senderName,
      content,
      rawLine: line,
      createdAt: new Date().toISOString(),
    });
  }
}

function parseWechatBlock(
  lines: string[],
  result: ChatImportParseResult,
  opts?: { userName?: string; girlName?: string },
): void {
  let i = 0;
  while (i < lines.length) {
    const line = lines[i].trim();

    // 使用 shouldSkipLine 过滤无效内容
    if (shouldSkipLine(line)) {
      if (line) result.skippedLines.push(line);
      i++;
      continue;
    }

    // 检查是否为"昵称 + 时间"开头的消息块
    const nextLine = lines[i + 1]?.trim();
    if (nextLine && WECHAT_TIME_RE.test(nextLine) && !WECHAT_TIME_RE.test(line)) {
      // 解析时间
      const m = nextLine.match(WECHAT_TIME_RE)!;
      const sentAt = `${m[1]}-${m[2].padStart(2, '0')}-${m[3].padStart(2, '0')}T${m[4].padStart(2, '0')}:${m[5].padStart(2, '0')}:00`;

      // 收集内容行
      const contentLines: string[] = [];
      let j = i + 2;
      while (j < lines.length) {
        const next = lines[j]?.trim();
        if (next && !WECHAT_TIME_RE.test(next) && lines[j + 1]?.trim() && WECHAT_TIME_RE.test(lines[j + 1].trim())) {
          break;
        }
        if (next && !shouldSkipLine(next)) contentLines.push(next);
        j++;
      }

      const content = cleanContent(contentLines.join('\n'));
      if (content && !isSystemMessage(content) && !shouldSkipLine(content)) {
        result.messages.push({
          id: nextId(),
          role: resolveRole(line, opts),
          senderName: line,
          content,
          rawLine: `${line} / ${nextLine} / ${content.slice(0, 30)}`,
          timestamp: sentAt,
          createdAt: sentAt,
        });
      } else {
        result.skippedLines.push(line);
      }
      i = j;
    } else {
      // 检查是否为纯冒号格式
      const colonMatch = line.match(COLON_RE);
      if (colonMatch) {
        const senderName = cleanContent(colonMatch[1]);
        const content = cleanContent(colonMatch[2]);
        if (content && !isSystemMessage(content) && !shouldSkipLine(content) && senderName.length <= 30) {
          result.messages.push({
            id: nextId(),
            role: resolveRole(senderName, opts),
            senderName,
            content,
            rawLine: line,
            createdAt: new Date().toISOString(),
          });
        } else {
          result.skippedLines.push(line);
        }
      } else {
        result.skippedLines.push(line);
      }
      i++;
    }
  }
}

// ── 工具函数 ──────────────────────────────────────────────

/**
 * 解析灵活的时间格式为 ISO 字符串。
 * 支持: "2026/06/24 18:30", "2026-06-24 18:30", "2026年06月24日 18:30"
 */
function parseFlexibleTime(raw: string): string | null {
  const s = raw.trim();

  // YYYY/MM/DD HH:mm 或 YYYY-MM-DD HH:mm
  const m1 = s.match(/^(\d{4})[\/-](\d{1,2})[\/-](\d{1,2})\s+(\d{1,2}):(\d{2})$/);
  if (m1) {
    return `${m1[1]}-${m1[2].padStart(2, '0')}-${m1[3].padStart(2, '0')}T${m1[4].padStart(2, '0')}:${m1[5].padStart(2, '0')}:00`;
  }

  // YYYY年MM月DD日 HH:mm
  const m2 = s.match(/^(\d{4})年(\d{1,2})月(\d{1,2})日\s+(\d{1,2}):(\d{2})$/);
  if (m2) {
    return `${m2[1]}-${m2[2].padStart(2, '0')}-${m2[3].padStart(2, '0')}T${m2[4].padStart(2, '0')}:${m2[5].padStart(2, '0')}:00`;
  }

  return null;
}

function resolveRole(
  senderName: string,
  opts?: { userName?: string; girlName?: string },
): 'user' | 'girl' | 'unknown' {
  if (!senderName) return 'unknown';
  const lower = senderName.toLowerCase();

  // 优先精确匹配 userName
  if (opts?.userName && (lower === opts.userName.toLowerCase() || lower.includes(opts.userName.toLowerCase()))) {
    return 'user';
  }
  // 然后匹配 girlName
  if (opts?.girlName && (lower === opts.girlName.toLowerCase() || lower.includes(opts.girlName.toLowerCase()))) {
    return 'girl';
  }

  // 没有提供名字线索时，不做猜测
  return 'unknown';
}
