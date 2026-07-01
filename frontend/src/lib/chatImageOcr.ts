/**
 * 聊天图片 OCR 识别工具
 * 使用 MinerU Agent 轻量解析 API — 文件上传模式。
 *
 * 流程（4 步）：
 *   1. POST /api/v1/agent/parse/file       → 获取 task_id + file_url (OSS 预签名)
 *   2. PUT  file_url                        → 直传文件到 OSS（不经 proxy，不带 Auth）
 *   3. GET  /api/v1/agent/parse/task/{id}   → 轮询，每 2s，最多 60s
 *   4. GET  markdown_url                    → 下载并清洗 Markdown
 *
 * Token 在 vite.config proxy 层注入（onProxyReq），前端不可见。
 */

// ─── 常量 ─────────────────────────────────────────────

const MINERU_BASE = '/api/mineru/api/v1/agent/parse';
const MINERU_CREATE = `${MINERU_BASE}/file`;
const MINERU_QUERY = `${MINERU_BASE}`; // GET /api/v1/agent/parse/{task_id}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/jp2', 'image/webp', 'image/gif', 'image/bmp'];

const POLL_INTERVAL = 2000;
const POLL_MAX_RETRIES = 30; // 60s total

// ─── 错误码映射 ───────────────────────────────────────

const ERROR_MESSAGES: Record<number, string> = {
  [-30001]: '图片超过 10MB，请压缩后重试',
  [-30002]: '不支持的图片格式，请上传 png/jpg 等常见图片',
  [-30003]: '截图过长，请分段后再识别',
  [-30004]: '参数错误，请重试',
};

function friendlyError(code: number, fallback: string): string {
  return ERROR_MESSAGES[code] || fallback;
}

// ─── 类型 ─────────────────────────────────────────────

export interface ImageOcrResult {
  fileName: string;
  text: string;
  normalizedText: string;
  lines: { side: 'left' | 'right' | 'center' | 'unknown'; text: string; top: number; confidence: number }[];
  confidence?: number;
  warning?: string;
}

interface MineruCreateData {
  code: number;
  msg?: string;
  data?: { task_id: string; file_url: string };
}

interface MineruTaskData {
  code: number;
  msg?: string;
  data?: {
    task_id: string;
    state: string;
    markdown_url?: string;
    err_code?: number;
    err_msg?: string;
  };
}

// ─── 前置校验 ─────────────────────────────────────────

function validateFile(file: File): string | null {
  if (file.size > MAX_FILE_SIZE) {
    return `图片超过 10MB（当前 ${(file.size / 1024 / 1024).toFixed(1)}MB），请压缩后重试。`;
  }
  const ext = file.name.split('.').pop()?.toLowerCase();
  const mimeOk = ALLOWED_TYPES.includes(file.type);
  const extOk = ext ? ['png', 'jpg', 'jpeg', 'jp2', 'webp', 'gif', 'bmp'].includes(ext) : false;
  if (!mimeOk && !extOk) {
    return `不支持的图片格式（${file.type || ext || '未知'}），请使用 png/jpg/jpeg/webp/gif/bmp。`;
  }
  return null;
}

// ─── 工具 ─────────────────────────────────────────────

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ════════════════════════════════════════════════════════
// 主识别函数
// ════════════════════════════════════════════════════════

export async function recognizeChatImages(
  files: File[],
  onProgress?: (progress: number) => void,
): Promise<ImageOcrResult[]> {
  const results: ImageOcrResult[] = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const baseProgress = Math.round((i / files.length) * 100);

    // 前置校验
    const validationError = validateFile(file);
    if (validationError) {
      console.warn(`[OCR] ${file.name}: ${validationError}`);
      results.push({ fileName: file.name, text: '', normalizedText: '', lines: [], warning: validationError });
      continue;
    }

    try {
      // ── 步骤 1：创建任务 (0-10%) ──
      onProgress?.(baseProgress);
      console.log(`[OCR] Step 1: create task for ${file.name}`);
      const { taskId, fileUrl } = await createTask(file);

      // ── 步骤 2：上传到 OSS (10-30%) ──
      onProgress?.(baseProgress + 10);
      console.log(`[OCR] Step 2: upload to OSS`);
      await uploadToOss(fileUrl, file);
      onProgress?.(baseProgress + 30);

      // ── 步骤 3：轮询 (30-90%) ──
      console.log(`[OCR] Step 3: polling task ${taskId}`);
      const markdownUrl = await pollTask(taskId, (pollProgress) => {
        onProgress?.(baseProgress + 30 + Math.round(pollProgress * 0.6));
      });

      // ── 步骤 4：下载并清洗 (90-100%) ──
      onProgress?.(baseProgress + 90);
      console.log(`[OCR] Step 4: download & clean markdown`);
      const rawText = await downloadAndCleanMarkdown(markdownUrl);
      onProgress?.(baseProgress + 100);

      const normalizedText = buildNormalized(rawText);

      console.log(`[OCR] ${file.name}: done, chars=${rawText.length}`);

      results.push({
        fileName: file.name,
        text: rawText,
        normalizedText,
        lines: [],
        warning: undefined,
      });
    } catch (err) {
      const reason = err instanceof Error ? err.message : 'Unknown error';
      console.warn(`[OCR] ${file.name}: ${reason}`);
      results.push({
        fileName: file.name,
        text: '',
        normalizedText: '',
        lines: [],
        warning: reason || '云端识别失败，请稍后重试或改用文本/文件导入',
      });
    }
  }

  return results;
}

// ════════════════════════════════════════════════════════
// 步骤 1：创建任务
// ════════════════════════════════════════════════════════

async function createTask(file: File): Promise<{ taskId: string; fileUrl: string }> {
  const body = JSON.stringify({
    file_name: file.name,
    language: 'ch',
    is_ocr: true,
  });

  console.log(`[OCR] Step 1 — POST ${MINERU_CREATE}`);
  console.log(`[OCR]   body:`, body);

  const response = await fetch(MINERU_CREATE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
  });

  // ── 诊断日志：暴露全部响应细节 ──
  console.log(`[OCR]   ← status: ${response.status} ${response.statusText}`);
  console.log(`[OCR]   ← content-type: ${response.headers.get('content-type')}`);

  const raw = await response.text();
  console.log(`[OCR]   ← body:`, raw.slice(0, 800));

  let json: MineruCreateData;
  try {
    json = JSON.parse(raw);
    console.log(`[OCR]   ← parsed: code=${json.code} msg=${json.msg || '(none)'}`);
    if ((json as any).trace_id) console.log(`[OCR]   ← trace_id: ${(json as any).trace_id}`);
  } catch {
    console.log(`[OCR]   ← (not valid JSON)`);
    throw new Error(`云端识别失败，请稍后重试或改用文本/文件导入（HTTP ${response.status}）`);
  }

  if (!response.ok) {
    throw new Error(`云端识别失败，请稍后重试或改用文本/文件导入（HTTP ${response.status}: ${json.msg || raw.slice(0, 200)}）`);
  }

  if (json.code !== 0 || !json.data?.task_id) {
    const errMsg = json.msg || 'missing task_id';
    throw new Error(friendlyError(json.code, `云端识别失败（${errMsg}），请稍后重试或改用文本/文件导入`));
  }

  if (!json.data.file_url) {
    throw new Error('云端识别失败（未获取到上传地址），请稍后重试或改用文本/文件导入');
  }

  return { taskId: json.data.task_id, fileUrl: json.data.file_url };
}

// ════════════════════════════════════════════════════════
// 步骤 2：上传文件到 OSS（直传，不经 proxy）
// ════════════════════════════════════════════════════════

async function uploadToOss(fileUrl: string, file: File): Promise<void> {
  // 浏览器直传 OSS 会有 CORS 问题 → 走 Vite dev server 本地代理
  // 生产环境需后端提供同样的 OSS 上传代理接口
  const uploadUrl = `/api/mineru/upload-to-oss?url=${encodeURIComponent(fileUrl)}`;

  console.log(`[OCR] Step 2 — PUT via local proxy (${(file.size / 1024).toFixed(1)}KB)`);

  const response = await fetch(uploadUrl, {
    method: 'POST',
    body: file,
    headers: { 'Content-Type': 'application/octet-stream' },
  });

  const respText = await response.text().catch(() => '');
  console.log(`[OCR]   ← upload status: ${response.status} ${response.statusText}`);
  if (respText) console.log(`[OCR]   ← body:`, respText.slice(0, 200));

  if (!response.ok) {
    throw new Error(`OSS upload failed: HTTP ${response.status}${respText ? ' — ' + respText.slice(0, 150) : ''}`);
  }
}

// ════════════════════════════════════════════════════════
// 步骤 3：轮询任务结果
// ════════════════════════════════════════════════════════

async function pollTask(
  taskId: string,
  onPollProgress?: (progress: number) => void,
): Promise<string> {
  const queryUrl = `${MINERU_QUERY}/${encodeURIComponent(taskId)}`;

  for (let attempt = 0; attempt < POLL_MAX_RETRIES; attempt++) {
    await sleep(POLL_INTERVAL);
    onPollProgress?.(Math.round(((attempt + 1) / POLL_MAX_RETRIES) * 100));

    console.log(`[OCR] Step 3 - polling ${queryUrl}`);
    const response = await fetch(queryUrl);
    console.log(`[OCR]   poll #${attempt + 1}: HTTP ${response.status}`);

    // 404 → 路径不存在，立即停止
    if (response.status === 404) {
      const raw404 = await response.text().catch(() => '');
      console.error(`[OCR]   poll #${attempt + 1}: 404 —`, raw404.slice(0, 300));
      throw new Error('云端识别失败（查询接口 404），请稍后重试或改用文本/文件导入');
    }

    if (!response.ok) {
      console.warn(`[OCR]   poll #${attempt + 1}: non-OK HTTP ${response.status}, retrying`);
      continue;
    }

    const rawText = await response.text();
    console.log(`[OCR]   poll #${attempt + 1} raw:`, rawText.slice(0, 400));

    let json: MineruTaskData;
    try {
      json = JSON.parse(rawText);
    } catch {
      console.error(`[OCR]   poll #${attempt + 1}: not JSON, stopping`);
      throw new Error('云端识别失败（响应格式异常），请稍后重试或改用文本/文件导入');
    }

    if (!json.data) {
      console.warn(`[OCR]   poll #${attempt + 1}: no data field`);
      continue;
    }

    const { state, markdown_url, err_code, err_msg } = json.data;
    console.log(`[OCR]   poll #${attempt + 1} state: ${state}`);

    switch (state) {
      case 'done':
        if (!markdown_url) throw new Error('云端识别失败（任务完成但无结果），请稍后重试');
        console.log(`[OCR]   markdown_url: ${markdown_url.slice(0, 80)}...`);
        return markdown_url;

      case 'failed': {
        const msg = err_code
          ? friendlyError(err_code, err_msg || '任务失败')
          : (err_msg || '任务失败');
        throw new Error(msg);
      }

      case 'waiting-file':
      case 'uploading':
      case 'pending':
      case 'running':
        break;

      default:
        console.warn(`[OCR]   unknown state: "${state}"`);
        break;
    }
  }

  throw new Error('云端识别超时，请稍后重试或改用文本/文件导入');
}

// ════════════════════════════════════════════════════════
// 步骤 4：下载并清洗 Markdown
// ════════════════════════════════════════════════════════

async function downloadAndCleanMarkdown(url: string): Promise<string> {
  // 浏览器直连 CDN 会被 CORS 拦截 → 走 Vite dev server 本地代理
  const proxyUrl = `/api/mineru-md?url=${encodeURIComponent(url)}`;

  console.log(`[OCR] Step 4 - downloading markdown via local proxy`);
  const response = await fetch(proxyUrl);
  console.log(`[OCR] Step 4 <- status: ${response.status}`);

  if (!response.ok) {
    const errText = await response.text().catch(() => '');
    throw new Error(`Markdown download failed: HTTP ${response.status}${errText ? ' — ' + errText.slice(0, 150) : ''}`);
  }

  const raw = await response.text();
  console.log(`[OCR]   markdown length: ${raw.length} chars`);
  console.log(`[OCR]   first 500 chars:\n${raw.slice(0, 500)}`);

  const cleaned = cleanMineruMarkdown(raw);
  console.log(`[OCR]   cleaned length: ${cleaned.length} chars`);
  return cleaned;
}

/**
 * 清洗 MinerU 返回的 Markdown。
 *   - 删除 Markdown 图片 ![...](...)
 *   - 删除 HTML 图片 <img ...>
 *   - 删除占位词：图片、[图片]、离开 >、复制、收藏、表情
 *   - 删除 Markdown 标题行（群名/昵称）
 *   - 删除空行与纯符号行
 *   - 不删除单字中文（"求""嗯""好"）和正常英文
 */
function cleanMineruMarkdown(md: string): string {
  const lines = md.split('\n');
  const result: string[] = [];

  for (const line of lines) {
    // 删除行内 Markdown 图片
    let t = line.replace(/!\[[^\]]*\]\([^)]+\)/g, '');
    // 删除行内 HTML 图片
    t = t.replace(/<img[^>]*>/gi, '');
    t = t.trim();
    if (!t) continue;

    // 删除纯占位文字（整行匹配）
    if (/^\[?图片\]?$/.test(t)) continue;
    if (/^(离开|复制|收藏|表情)\s*[>》]?\s*$/.test(t)) continue;

    // 删除 Markdown 标题行
    if (/^#{1,6}\s/.test(t)) continue;

    // 删除纯符号行（无任何有效字符）
    if (!/[一-龥a-zA-Z0-9]/.test(t)) continue;

    result.push(t);
  }

  return result.join('\n');
}

function buildNormalized(text: string): string {
  if (!text) return '';
  return text
    .split('\n')
    .filter((l) => l.trim())
    .map((l) => `unknown：${l.trim()}`)
    .join('\n');
}
