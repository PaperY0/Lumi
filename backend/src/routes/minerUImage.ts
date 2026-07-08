import { Router } from 'express';
import JSZip from 'jszip';
import { getRequestId, logRouteEvent } from '../middleware/security.js';
import { parseMinerUChatMarkdown } from '../services/minerUChatParser.js';

const router = Router();
const MINERU_ORIGIN = 'https://mineru.net';
const MAX_FILE_SIZE = 200 * 1024 * 1024;
const POLL_INTERVAL_MS = Number(process.env.MINERU_POLL_INTERVAL_MS || 2000);
const POLL_MAX_RETRIES = Number(process.env.MINERU_POLL_MAX_RETRIES || 60);
const ALLOWED_EXTENSIONS = new Set(['png', 'jpg', 'jpeg', 'jp2', 'webp', 'gif', 'bmp']);

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
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
  const token = process.env.MINERU_TOKEN;
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
  const response = await fetch(`${MINERU_ORIGIN}/api/v4/file-urls/batch`, {
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
  const response = await fetch(uploadUrl, {
    method: 'PUT',
    body: fileBuffer,
  });

  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(`MINERU_FILE_UPLOAD_FAILED:${response.status}:${text.slice(0, 200)}`);
  }
}

async function pollBatchResult(batchId: string, token: string): Promise<string> {
  const url = `${MINERU_ORIGIN}/api/v4/extract-results/batch/${encodeURIComponent(batchId)}`;

  for (let attempt = 0; attempt < POLL_MAX_RETRIES; attempt++) {
    await sleep(POLL_INTERVAL_MS);

    const response = await fetch(url, {
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

  const response = await fetch(fullZipUrl);
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

  try {
    validateImageFileName(fileName);
    const token = getMinerUToken();
    const fileBuffer = await readRequestBuffer(req);
    if (fileBuffer.length === 0) {
      return res.status(400).json({ success: false, error: 'EMPTY_FILE', message: 'image file is empty' });
    }

    logRouteEvent(res, '/api/mineru/parse-image-chat', 'mineru_v4_apply_upload_url', {
      fileName,
      bytes: fileBuffer.length,
    });
    const { batchId, uploadUrl } = await applyUploadUrl(fileName, token);

    logRouteEvent(res, '/api/mineru/parse-image-chat', 'mineru_v4_upload_file', { batchId });
    await uploadFile(uploadUrl, fileBuffer);

    logRouteEvent(res, '/api/mineru/parse-image-chat', 'mineru_v4_poll_batch', { batchId });
    const fullZipUrl = await pollBatchResult(batchId, token);

    logRouteEvent(res, '/api/mineru/parse-image-chat', 'mineru_v4_extract_markdown', { batchId });
    const originalMarkdown = await extractFullMarkdown(fullZipUrl);

    const parsed = await parseMinerUChatMarkdown(originalMarkdown);
    logRouteEvent(res, '/api/mineru/parse-image-chat', 'mineru_chat_clean_done', {
      batchId,
      originalMarkdownLength: originalMarkdown.length,
      messagesCount: parsed.messages.length,
      warningsCount: parsed.warnings.length,
    });

    res.json({
      ...parsed,
      fileName,
      batchId,
    });
  } catch (error: any) {
    const message = error?.message || 'MinerU image parse failed';
    console.error(`[${requestId}] /api/mineru/parse-image-chat failed`, { message });

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
