import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import portraitRouter from './routes/portrait.js';
import analyzeRouter from './routes/analyze.js';
import replyRouter from './routes/reply.js';
import simulateRouter from './routes/simulate.js';
import minerUChatRouter from './routes/minerUChat.js';
import minerUImageRouter from './routes/minerUImage.js';
import minerUProxyRouter from './routes/minerUProxy.js';
import zhihuRouter from './routes/zhihu.js';
import {
  aiRateLimiter,
  attachRequestId,
  getAllowedOrigins,
  getRequestId,
  globalRateLimiter,
  zhihuSearchRateLimiter,
} from './middleware/security.js';

const app = express();
const PORT = process.env.PORT || 3001;
const HOST = process.env.HOST || '0.0.0.0';
const isProduction = process.env.NODE_ENV === 'production';
const serveFrontend = process.env.SERVE_FRONTEND === 'true';
const mockMode = process.env.MOCK_MODE === 'true' || !process.env.DEEPSEEK_API_KEY;

if (isProduction && process.env.MOCK_MODE === 'false' && !process.env.DEEPSEEK_API_KEY) {
  console.error('DEEPSEEK_API_KEY is required when production MOCK_MODE=false');
  process.exit(1);
}

if (isProduction) {
  app.set('trust proxy', 1);
}

app.use(attachRequestId);
app.use(cors({ origin: getAllowedOrigins() }));
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  if (isProduction && req.secure) {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }
  next();
});
app.use(express.json({ limit: '5mb' }));

app.get('/api/health', (req, res) => {
  res.json({
    ok: true,
    mockMode,
    timestamp: new Date().toISOString(),
  });
});

app.get('/api/ready', (req, res) => {
  const ready = mockMode || Boolean(process.env.DEEPSEEK_API_KEY);
  res.status(ready ? 200 : 503).json({
    ok: ready,
    mode: mockMode ? 'mock' : 'ai',
  });
});

app.use(globalRateLimiter);

app.use(['/api/mineru/parse-image-chat', '/api/analyze', '/api/reply', '/api/simulate', '/api/portrait', '/api/parse-mineru-chat'], aiRateLimiter);
app.use('/api', minerUImageRouter);
app.use('/api/zhihu', zhihuSearchRateLimiter, zhihuRouter);
app.use('/api', minerUProxyRouter);
app.use('/api', analyzeRouter);
app.use('/api', replyRouter);
app.use('/api', simulateRouter);
app.use('/api', portraitRouter);
app.use('/api', minerUChatRouter);

app.use('/api', (req, res) => {
  res.status(404).json({ error: 'API endpoint not found' });
});

if (serveFrontend) {
  const currentDir = path.dirname(fileURLToPath(import.meta.url));
  const publicDir = process.env.STATIC_DIR
    ? path.resolve(process.env.STATIC_DIR)
    : path.resolve(currentDir, '../public');
  app.use(express.static(publicDir, {
    index: false,
    maxAge: isProduction ? '1y' : 0,
    immutable: isProduction,
  }));
  app.get('*', (req, res) => {
    res.setHeader('Cache-Control', 'no-cache');
    res.sendFile(path.join(publicDir, 'index.html'));
  });
} else {
  app.use((req, res) => {
    res.status(404).json({ error: 'Endpoint not found' });
  });
}

app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(`[${getRequestId(res)}] server error`, {
    message: err?.message,
    stack: isProduction ? undefined : err?.stack,
  });
  res.status(500).json({
    error: 'Internal server error',
    requestId: getRequestId(res),
  });
});

const server = app.listen(Number(PORT), HOST, () => {
  console.log(`
Lumi Server started
Address: http://${HOST}:${PORT}
Health: http://localhost:${PORT}/api/health
Mode: ${mockMode ? 'MOCK' : 'AI'}
Frontend: ${serveFrontend ? 'served by Express' : 'disabled'}
Allowed origins: ${getAllowedOrigins().join(', ')}

Routes:
  POST /api/portrait
  POST /api/analyze
  POST /api/reply
  POST /api/simulate
  GET  /api/zhihu/search
  POST /api/parse-mineru-chat
  POST /api/mineru/parse-image-chat
  POST /api/mineru/upload-to-oss  (compat only; frontend should not call)
  GET  /api/mineru-md            (compat only; frontend should not call)
  *    /api/mineru/*             (compat only; frontend should not call)
  `);
});

function shutdown(signal: string) {
  console.log(`${signal} received, shutting down`);
  server.close((error) => {
    if (error) {
      console.error('Graceful shutdown failed', error);
      process.exit(1);
    }
    process.exit(0);
  });
}

process.once('SIGTERM', () => shutdown('SIGTERM'));
process.once('SIGINT', () => shutdown('SIGINT'));
