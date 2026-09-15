import { Router } from 'express';
import JSZip from 'jszip';
import { getRequestId, logRouteEvent } from '../middleware/security.js';
import { parseMinerUChatMarkdown } from '../services/minerUChatParser.js';

const router = Router();
const MINERU_ORIGIN = 'https://mineru.net';
const MAX_FILE_SIZE = 20 * 1024 * 1024;
const POLL_INTERVAL_MS = Number(process.env.MINERU_POLL_INTERVAL_MS || 2000);
const POLL_MAX_RETRIES = Number(process.env.MINERU_POLL_MAX_RETRIES || 60);
const ALLOWED_EXTENSIONS = new Set(['png', 'jpg', 'jpeg', 'jp2', 'webp', 'gif', 'bmp']);

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function upstreamFetch(url: string, options: RequestInit = {}): Promise<Response> {
  return fetch(url, { ...options, signal: AbortSignal.timeout(25000) });
}

async function readRequestBuffer(req: any): Promise<Buffer> {
  const chunks: Buffer[] = [];
  let total = 0;

  for await (const chunk of req) {
    const buffer = Buffer.from(chunk);
    total += buffer.length;
    if (total > MAX_FILE_SIZE) {
      throw new Error('FILE_TOO_LARGE');
    }
    chunks.push(buffer);
  }

  return Buffer.concat(chunks);
}

function sanitizeFileName(raw: unknown): string {
  const candidate = typeof raw === 'string' ? raw : 'chat-image.png';
  const safe = candidate.replace(/[^\w.\-()\u4e00-\u9fa5]/g, '_').slice(0, 180);
  return safe || 'chat-image.png';
}

function validateImageFileName(fileName: string): void {
  const extension = fileName.split('.').pop()?.toLowerCase() || '';
  if (!ALLOWED_EXTENSIONS.has(extension)) {
    throw new Error('UNSUPPORTED_FILE_TYPE');
  }
}

function makeDataId(fileName: string): string {
  const base = fileName.replace(/[^\w.\-]/g, '_').slice(0, 96) || 'chat_image';
  return `${Date.now()}_${base}`.slice(0, 128);
}

function getMinerUToken(): string {
  const token = process.env.MINERU_TOKEN?.trim();
  if (!token) {
    throw new Error('MINERU_TOKEN_MISSING');
  }
  return token;
}

async function readJson(response: Response): Promise<any> {
  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch {
    throw new Error(`MINERU_NON_JSON_RESPONSE:${response.status}:${text.slice(0, 200)}`);
  }
}

async function applyUploadUrl(fileName: string, token: string): Promise<{ batchId: string; uploadUrl: string }> {
  const response = await upstreamFetch(`${MINERU_ORIGIN}/api/v4/file-urls/batch`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      Accept: '*/*',
    },
    body: JSON.stringify({
      files: [{ name: fileName, data_id: makeDataId(fileName), is_ocr: true }],
      model_version: 'vlm',
      language: 'ch',
      enable_formula: false,
      enable_table: true,
    }),
  });

  const json = await readJson(response);
  if (!response.ok || json.code !== 0 || !json.data?.batch_id || !Array.isArray(json.data?.file_urls) || !json.data.file_urls[0]) {
    throw new Error(`MINERU_UPLOAD_URL_FAILED:${response.status}:${json.msg || 'missing batch_id or file_urls'}`);
  }

  return {
    batchId: json.data.batch_id,
    uploadUrl: json.data.file_urls[0],
  };
}

async function uploadFile(uploadUrl: string, fileBuffer: Buffer): Promise<void> {
  const response = await upstreamFetch(uploadUrl, {
    method: 'PUT',
    body: fileBuffer,
  });

  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(`MINERU_FILE_UPLOAD_FAILED:${response.status}:${text.slice(0, 200)}`);
  }
}

async function pollBatchResult(batchId: string, token: string, onState: (stage: string) => void): Promise<string> {
  const url = `${MINERU_ORIGIN}/api/v4/extract-results/batch/${encodeURIComponent(batchId)}`;
  const deadline = Date.now() + 120000;

  for (let attempt = 0; attempt < POLL_MAX_RETRIES; attempt++) {
    if (Date.now() >= deadline) break;
    await sleep(POLL_INTERVAL_MS);

    const response = await upstreamFetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: '*/*',
      },
    });
    const json = await readJson(response);

    if (!response.ok || json.code !== 0) {
      throw new Error(`MINERU_POLL_FAILED:${response.status}:${json.msg || 'poll failed'}`);
    }

    const result = Array.isArray(json.data?.extract_result) ? json.data.extract_result[0] : null;
    const state = result?.state;
    onState(state === 'pending' ? 'MinerU 排队中' : state === 'waiting-file' ? 'MinerU 确认上传中' : 'MinerU 正在识别文字');

    if (state === 'done' && result.full_zip_url) {
      return result.full_zip_url;
    }

    if (state === 'failed') {
      throw new Error(`MINERU_EXTRACT_FAILED:${result.err_msg || 'extract failed'}`);
    }
  }

  throw new Error('MINERU_EXTRACT_TIMEOUT');
}

function isAllowedZipUrl(raw: string): boolean {
  try {
    const url = new URL(raw);
    return url.protocol === 'https:' && url.hostname === 'cdn-mineru.openxlab.org.cn' && url.pathname.endsWith('.zip');
  } catch {
    return false;
  }
}

async function extractFullMarkdown(fullZipUrl: string): Promise<string> {
  if (!isAllowedZipUrl(fullZipUrl)) {
    throw new Error('FORBIDDEN_MINERU_ZIP_URL');
  }

  const response = await upstreamFetch(fullZipUrl);
  if (!response.ok) {
    throw new Error(`MINERU_ZIP_DOWNLOAD_FAILED:${response.status}`);
  }

  const zipBuffer = Buffer.from(await response.arrayBuffer());
  const zip = await JSZip.loadAsync(zipBuffer);
  const fullMdEntry = Object.values(zip.files).find((entry) => !entry.dir && entry.name.endsWith('full.md'));
  if (!fullMdEntry) {
    throw new Error('MINERU_FULL_MARKDOWN_MISSING');
  }

  return await fullMdEntry.async('string');
}

router.post('/mineru/parse-image-chat', async (req, res) => {
  const requestId = getRequestId(res);
  const fileName = sanitizeFileName(req.header('x-file-name') || req.query.fileName);
  const streaming = req.header('accept')?.includes('application/x-ndjson') === true;
  const progress = (value: number, stage: string) => {
    if (streaming && !res.destroyed) res.write(`${JSON.stringify({ type: 'progress', progress: value, stage })}\n`);
  };

  try {
    validateImageFileName(fileName);
    const token = getMinerUToken();
    const fileBuffer = await readRequestBuffer(req);
    if (fileBuffer.length === 0) {
      return res.status(400).json({ success: false, error: 'EMPTY_FILE', message: 'image file is empty' });
    }

    if (streaming) {
      res.setHeader('Content-Type', 'application/x-ndjson; charset=utf-8');
      res.setHeader('Cache-Control', 'no-store');
      res.flushHeaders();
    }
    progress(10, '正在申请 MinerU 上传地址');

    logRouteEvent(res, '/api/mineru/parse-image-chat', 'mineru_v4_apply_upload_url', {
      fileName,
      bytes: fileBuffer.length,
    });
    const { batchId, uploadUrl } = await applyUploadUrl(fileName, token);
    progress(20, '正在上传图片到 MinerU');

    logRouteEvent(res, '/api/mineru/parse-image-chat', 'mineru_v4_upload_file', { batchId });
    await uploadFile(uploadUrl, fileBuffer);

    logRouteEvent(res, '/api/mineru/parse-image-chat', 'mineru_v4_poll_batch', { batchId });
    progress(30, '等待 MinerU 识别');
    const fullZipUrl = await pollBatchResult(batchId, token, stage => progress(40, stage));

    logRouteEvent(res, '/api/mineru/parse-image-chat', 'mineru_v4_extract_markdown', { batchId });
    const originalMarkdown = await extractFullMarkdown(fullZipUrl);
    progress(80, '识别完成，正在整理聊天草稿');

    const parsed = await parseMinerUChatMarkdown(originalMarkdown);
    logRouteEvent(res, '/api/mineru/parse-image-chat', 'mineru_chat_clean_done', {
      batchId,
      originalMarkdownLength: originalMarkdown.length,
      messagesCount: parsed.messages.length,
      warningsCount: parsed.warnings.length,
    });

    const result = {
      ...parsed,
      fileName,
      batchId,
    };
    if (streaming) {
      progress(100, '聊天草稿已准备好');
      res.end(`${JSON.stringify({ type: 'result', result })}\n`);
    } else res.json(result);
  } catch (error: any) {
    const message = error?.message || 'MinerU image parse failed';
    console.error(`[${requestId}] /api/mineru/parse-image-chat failed`, { message });
    if (res.headersSent) {
      const publicMessage = error?.name === 'TimeoutError'
        ? 'MinerU 服务响应超时，请稍后重试；识别服务可能正在排队。'
        : message === 'MINERU_EXTRACT_TIMEOUT'
          ? 'MinerU 排队或识别超过两分钟，请稍后重试。'
          : message.includes(':401:') || message.includes(':403:')
            ? 'MinerU 鉴权失败，请管理员检查 Render 中的 MINERU_TOKEN。'
            : message;
      return res.end(`${JSON.stringify({ type: 'error', message: publicMessage })}\n`);
    }

    if (message === 'MINERU_TOKEN_MISSING') {
      return res.status(503).json({ success: false, error: 'MINERU_TOKEN_MISSING', message: 'MinerU token is not configured on the backend' });
    }
    if (message === 'FILE_TOO_LARGE') {
      return res.status(413).json({ success: false, error: 'FILE_TOO_LARGE', message: 'image file is too large' });
    }
    if (message === 'UNSUPPORTED_FILE_TYPE') {
      return res.status(400).json({ success: false, error: 'UNSUPPORTED_FILE_TYPE', message: 'unsupported image file type' });
    }

    res.status(502).json({ success: false, error: 'MINERU_IMAGE_PARSE_FAILED', message });
  }
});

export default router;
