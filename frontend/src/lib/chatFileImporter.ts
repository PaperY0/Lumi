/**
 * 聊天文件导入器
 * 在浏览器本地读取 .txt / .md / .csv / .json 文件。
 * 支持 UTF-8 / GB18030 编码检测，JSON 数组转换，CSV 自动识别，
 * 以及微信"昵称 / 时间 / 内容"三行块格式的结构化预处理。
 * 文件不会上传服务器，读取后转为标准冒号格式，复用 parseChatText 流程。
 */

export interface ChatFileImportResult {
  fileName: string;
  text: string;
  warning?: string;
}

const MAX_FILE_SIZE = 2 * 1024 * 1024;
const MAX_FILES = 10;
const ALLOWED_EXTENSIONS = ['.txt', '.md', '.csv', '.json'];

// ─── 编码检测 ──────────────────────────────────────────

/**
 * 检测文本是否有乱码。
 * 规则：
 *   1. 替换字符 �（即 �）占比 > 1% → 乱码
 *   2. 存在连续 latin-1 高位字节（-ÿ）且不含中文且长度 > 50 → 可能是 GBK 被误读为 latin-1
 */
function looksGarbled(text: string): boolean {
  if (!text) return false;
  const replacementChars = (text.match(/�/g) || []).length;
  if (replacementChars / text.length > 0.01) return true;
  const garbledPattern = /[-ÿ]{4,}/;
  if (garbledPattern.test(text) && !/[一-龥]/.test(text) && text.length > 50) return true;
  return false;
}

async function readFileAsBuffer(file: File): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as ArrayBuffer);
    reader.onerror = () => reject(reader.error);
    reader.readAsArrayBuffer(file);
  });
}

function decodeBuffer(buffer: ArrayBuffer, encoding: string): string {
  const decoder = new TextDecoder(encoding);
  return decoder.decode(buffer);
}

async function decodeText(buffer: ArrayBuffer): Promise<{
  text: string;
  encoding: string;
  warning?: string;
}> {
  // 先用 UTF-8 解码
  const utf8Text = decodeBuffer(buffer, 'utf-8');
  if (!looksGarbled(utf8Text)) return { text: utf8Text, encoding: 'utf-8' };

  // UTF-8 乱码 → 尝试 GB18030（兼容 GBK/GB2312）
  try {
    const gbkText = decodeBuffer(buffer, 'gb18030');
    if (!looksGarbled(gbkText)) {
      return { text: gbkText, encoding: 'gb18030', warning: '文件编码检测为 GB18030，已自动转换' };
    }
    // GB18030 也乱码 → 保留 UTF-8 原文，给出警告
    return { text: utf8Text, encoding: 'utf-8', warning: '文件编码未能识别，可能包含乱码，请检查文件来源' };
  } catch {
    // 浏览器不支持 GB18030
    return { text: utf8Text, encoding: 'utf-8', warning: '文件可能是 GBK/GB2312 编码，当前浏览器不支持自动转换，可能有乱码' };
  }
}

// ─── JSON 转换 ─────────────────────────────────────────

function tryConvertJson(data: unknown): string | null {
  if (!Array.isArray(data)) return null;

  const lines: string[] = [];
  for (const item of data) {
    if (typeof item !== 'object' || item === null) continue;
    const obj = item as Record<string, unknown>;
    const sender =
      obj.sender || obj.senderName || obj.name || obj.from || obj.speaker || '';
    const content =
      obj.content || obj.text || obj.message || obj.msg || '';
    if (sender && content) {
      lines.push(`${sender}：${content}`);
    }
  }

  return lines.length > 0 ? lines.join('\n') : null;
}

// ─── CSV 转换 ──────────────────────────────────────────

function tryConvertCsv(text: string): string | null {
  const lines = text.split('\n').filter((l) => l.trim());
  if (lines.length < 2) return null;

  const parseRow = (line: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    for (const ch of line) {
      if (ch === '"') {
        inQuotes = !inQuotes;
      } else if (ch === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += ch;
      }
    }
    result.push(current.trim());
    return result;
  };

  const header = parseRow(lines[0]);
  const senderIdx = header.findIndex((h) =>
    /^(sender|senderName|name|from|speaker)$/i.test(h),
  );
  const contentIdx = header.findIndex((h) =>
    /^(content|message|text|msg)$/i.test(h),
  );

  if (senderIdx === -1 || contentIdx === -1) return null;

  const result: string[] = [];
  for (let i = 1; i < lines.length; i++) {
    const row = parseRow(lines[i]);
    const sender = row[senderIdx]?.trim();
    const content = row[contentIdx]?.trim();
    if (sender && content) {
      result.push(`${sender}：${content}`);
    }
  }

  return result.length > 0 ? result.join('\n') : null;
}

// ─── 微信三行块格式预处理 ──────────────────────────────

/**
 * 时间行识别正则 — 匹配以下三种格式：
 *   1. 2026年06月30日 13:20  （中文年月日 + 时间）
 *   2. 2026/06/30 或 2026-06-30 （ISO 日期，可能带时间）
 *   3. 13:20  （纯时间）
 */
const TIME_RE_CN = /^\d{4}年\d{1,2}月\d{1,2}日\s*\d{1,2}:\d{2}$/;
const TIME_RE_ISO = /^\d{4}[/-]\d{1,2}[/-]\d{1,2}/;
const TIME_RE_SHORT = /^\d{1,2}:\d{2}$/;

function isTimeLine(line: string): boolean {
  const t = line.trim();
  return TIME_RE_CN.test(t) || TIME_RE_ISO.test(t) || TIME_RE_SHORT.test(t);
}

/** 元数据行 — 不参与聊天内容的行 */
function isMetaLine(line: string): boolean {
  const t = line.trim();
  if (/^--- 文件：.*---$/.test(t)) return true;
  if (/^#{1,6}\s/.test(t)) return true;
  if (/^```/.test(t)) return true;
  if (/^!\[.*\]\(.*\)$/.test(t)) return true;
  if (/^\[.*\]\(.*\)$/.test(t)) return true;
  return false;
}

/**
 * 判定一行是否像昵称（而非时间、内容、元数据）。
 *
 * 昵称特征：短文本（≤20 字符）、无标点符号、非时间格式、非元数据、
 * 不含冒号（否则已经是标准格式了）。
 */
function looksLikeNickname(line: string): boolean {
  const t = line.trim();
  if (!t || t.length > 20) return false;
  if (/[。，、？！；：""''《》【】（）]/.test(t)) return false;
  if (isTimeLine(t) || isMetaLine(t)) return false;
  if (/[：:]/.test(t)) return false;
  return true;
}

/**
 * 将微信导出的"昵称 / 时间 / 内容"三行块格式转换为标准冒号格式。
 *
 * 输入结构（微信复制 / Markdown 导出）：
 *   --- 文件：chat.md ---        ← 元数据，过滤
 *   # 聊天记录                    ← Markdown 标题，过滤
 *
 *   Whiskey                      ← 昵称行（短文本、无标点）
 *   2026年06月30日 13:20          ← 时间行（分隔信号）
 *   今天还好吗？                   ← 消息内容（可能多行）
 *   晚上一起吃饭吧
 *
 *   Paper Y                      ← 下一个昵称行
 *   2026年06月30日 13:21          ← 时间行
 *   好啊，去哪里吃？               ← 消息内容
 *   > 上次那家不错                ← 引用行，去掉 > 保留内容
 *
 * 输出标准格式：
 *   Whiskey：今天还好吗？\n晚上一起吃饭吧
 *   Paper Y：好啊，去哪里吃？\n上次那家不错
 *
 * 如果未检测到任何三行块结构，返回原文不变（让后续格式检测兜底）。
 */
function convertWechatBlockToColon(text: string): string {
  const lines = text.split('\n');
  const result: string[] = [];
  let blockCount = 0;

  let i = 0;
  while (i < lines.length) {
    const line = lines[i].trim();

    // 跳过空行和元数据行
    if (!line || isMetaLine(line)) {
      i++;
      continue;
    }

    // 检查是否为"昵称 + 下一行是时间"的结构
    const nextLine = lines[i + 1]?.trim();
    if (nextLine && isTimeLine(nextLine) && looksLikeNickname(line)) {
      const nickname = line;
      blockCount++;

      // 收集消息内容（从时间行之后开始）
      const contentLines: string[] = [];
      let j = i + 2; // 跳过昵称行和时间行，从内容开始

      while (j < lines.length) {
        const cl = lines[j].trim();

        // 遇到下一个昵称+时间对 → 停止收集
        const nl = lines[j + 1]?.trim();
        if (looksLikeNickname(cl) && nl && isTimeLine(nl)) break;

        // 跳过空行和元数据行
        if (!cl || isMetaLine(cl)) {
          j++;
          continue;
        }

        // 去掉 Markdown 引用符号 >
        const cleaned = cl.replace(/^>\s?/, '');
        if (cleaned) contentLines.push(cleaned);
        j++;
      }

      if (contentLines.length > 0) {
        result.push(`${nickname}：${contentLines.join('\n')}`);
      }

      i = j; // 跳到下一个昵称行（或文件末尾）
      continue;
    }

    i++;
  }

  // 如果没检测到任何三行块结构，返回原文（兜底其他格式）
  return blockCount > 0 ? result.join('\n') : text;
}

// ─── 文件类型判断 ──────────────────────────────────────

function isJsonFile(name: string): boolean {
  return name.toLowerCase().endsWith('.json');
}

function isCsvFile(name: string): boolean {
  return name.toLowerCase().endsWith('.csv');
}

function isTextFile(name: string): boolean {
  const lower = name.toLowerCase();
  return lower.endsWith('.txt') || lower.endsWith('.md');
}

function isAllowedFile(name: string): boolean {
  return ALLOWED_EXTENSIONS.some((ext) => name.toLowerCase().endsWith(ext));
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}

// ─── 主函数 ────────────────────────────────────────────

export async function readChatFiles(files: File[]): Promise<ChatFileImportResult[]> {
  const results: ChatFileImportResult[] = [];

  if (files.length > MAX_FILES) {
    results.push({
      fileName: '',
      text: '',
      warning: `一次最多导入 ${MAX_FILES} 个文件，已取前 ${MAX_FILES} 个`,
    });
  }

  const remaining = files.slice(0, MAX_FILES);

  for (const file of remaining) {
    if (!isAllowedFile(file.name)) {
      results.push({ fileName: file.name, text: '', warning: '不支持的格式，仅支持 txt/md/csv/json' });
      continue;
    }

    if (file.size > MAX_FILE_SIZE) {
      results.push({
        fileName: file.name,
        text: '',
        warning: `文件过大 (${formatSize(file.size)})，单文件限制 ${formatSize(MAX_FILE_SIZE)}`,
      });
      continue;
    }

    try {
      const buffer = await readFileAsBuffer(file);
      const { text: raw, encoding, warning: encWarning } = await decodeText(buffer);

      let text = raw;
      const warnings: string[] = [];
      if (encWarning) warnings.push(encWarning);

      // TXT / MD → 先尝试微信三行块格式预处理，转为标准冒号格式
      if (isTextFile(file.name)) {
        text = convertWechatBlockToColon(text);
      }

      // JSON 处理
      if (isJsonFile(file.name)) {
        try {
          const parsed = JSON.parse(text);
          const converted = tryConvertJson(parsed);
          if (converted) {
            text = converted;
          } else {
            warnings.push('JSON 格式不支持，已保留原始文本作为参考');
          }
        } catch {
          warnings.push('JSON 解析失败，已保留原始文本作为参考');
        }
      }

      // CSV 处理
      if (isCsvFile(file.name)) {
        const converted = tryConvertCsv(text);
        if (converted) {
          text = converted;
        } else {
          warnings.push('CSV 未识别到 sender/content 列，已保留原始文本');
        }
      }

      results.push({
        fileName: file.name,
        text,
        warning: warnings.length > 0 ? warnings.join('；') : undefined,
      });
    } catch {
      results.push({ fileName: file.name, text: '', warning: '文件读取失败，请重试' });
    }
  }

  return results;
}
