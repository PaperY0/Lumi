import { Router } from 'express';
import { getRequestId, logRouteEvent } from '../middleware/security.js';

const router = Router();
const MINERU_ORIGIN = 'https://mineru.net';
const MINERU_MARKDOWN_HOST = 'cdn-mineru.openxlab.org.cn';

function isAllowedOssUrl(raw: string): boolean {
  try {
    const url = new URL(raw);
    return url.protocol === 'https:' && url.hostname.endsWith('.aliyuncs.com');
  } catch {
    return false;
  }
}

function isAllowedMarkdownUrl(raw: string): boolean {
  try {
    const url = new URL(raw);
    return (
      url.protocol === 'https:' &&
      url.hostname === MINERU_MARKDOWN_HOST &&
      (url.pathname.endsWith('.md') || raw.includes('full.md'))
    );
  } catch {
    return false;
  }
}

async function readRequestBuffer(req: any): Promise<Buffer> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
}

router.post('/mineru/upload-to-oss', async (req, res) => {
  const fileUrl = typeof req.query.url === 'string' ? req.query.url : '';
  if (!fileUrl) {
    return res.status(400).json({ success: false, error: 'MISSING_URL', message: 'missing url param' });
  }
  if (!isAllowedOssUrl(fileUrl)) {
    return res.status(403).json({ success: false, error: 'FORBIDDEN_OSS_HOST', message: 'forbidden host' });
  }

  try {
    const body = await readRequestBuffer(req);
    logRouteEvent(res, '/api/mineru/upload-to-oss', 'upload_start', { bytes: body.length });

    const upstream = await fetch(fileUrl, {
      method: 'PUT',
      body,
      headers: { 'Content-Type': 'application/octet-stream' },
    });
    const text = await upstream.text().catch(() => '');

    res.status(upstream.status).type('text/plain').send(text || (upstream.ok ? 'OK' : `OSS error: ${upstream.status}`));
  } catch (error: any) {
    console.error(`[${getRequestId(res)}] /api/mineru/upload-to-oss failed`, { message: error?.message });
    res.status(502).json({ success: false, error: 'OSS_PROXY_FAILED', message: error?.message || 'OSS proxy failed' });
  }
});

router.get('/mineru-md', async (req, res) => {
  const markdownUrl = typeof req.query.url === 'string' ? req.query.url : '';
  if (!markdownUrl) {
    return res.status(400).json({ success: false, error: 'MISSING_URL', message: 'missing url param' });
  }
  if (!isAllowedMarkdownUrl(markdownUrl)) {
    return res.status(403).json({ success: false, error: 'FORBIDDEN_MARKDOWN_URL', message: 'forbidden markdown url' });
  }

  try {
    logRouteEvent(res, '/api/mineru-md', 'download_start');
    const upstream = await fetch(markdownUrl);
    const text = await upstream.text();
    res.status(upstream.status).type(upstream.headers.get('content-type') || 'text/markdown; charset=utf-8').send(text);
  } catch (error: any) {
    console.error(`[${getRequestId(res)}] /api/mineru-md failed`, { message: error?.message });
    res.status(502).json({ success: false, error: 'MARKDOWN_PROXY_FAILED', message: error?.message || 'Markdown proxy failed' });
  }
});

router.all('/mineru/*', async (req, res) => {
  const token = process.env.MINERU_TOKEN;
  if (!token) {
    return res.status(503).json({
      success: false,
      error: 'MINERU_TOKEN_MISSING',
      message: 'MinerU token is not configured on the backend',
    });
  }

  const upstreamPath = req.originalUrl.replace(/^\/api\/mineru/, '') || '/';
  const upstreamUrl = new URL(upstreamPath, MINERU_ORIGIN);
  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
  };

  if (req.is('application/json')) {
    headers['Content-Type'] = 'application/json';
  }

  try {
    logRouteEvent(res, '/api/mineru/*', 'proxy', { method: req.method, path: upstreamUrl.pathname });
    const upstream = await fetch(upstreamUrl, {
      method: req.method,
      headers,
      body: ['GET', 'HEAD'].includes(req.method) ? undefined : JSON.stringify(req.body ?? {}),
    });
    const contentType = upstream.headers.get('content-type') || 'application/json; charset=utf-8';
    const text = await upstream.text();
    res.status(upstream.status).type(contentType).send(text);
  } catch (error: any) {
    console.error(`[${getRequestId(res)}] /api/mineru/* failed`, { message: error?.message });
    res.status(502).json({ success: false, error: 'MINERU_PROXY_FAILED', message: error?.message || 'MinerU proxy failed' });
  }
});

export default router;
