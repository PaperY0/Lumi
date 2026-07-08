import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import portraitRouter from './routes/portrait.js';
import analyzeRouter from './routes/analyze.js';
import replyRouter from './routes/reply.js';
import simulateRouter from './routes/simulate.js';
import minerUChatRouter from './routes/minerUChat.js';
import minerUImageRouter from './routes/minerUImage.js';
import minerUProxyRouter from './routes/minerUProxy.js';
import {
  aiRateLimiter,
  attachRequestId,
  getAllowedOrigins,
  getRequestId,
  globalRateLimiter,
} from './middleware/security.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(attachRequestId);
app.use(cors({ origin: getAllowedOrigins() }));
app.use(globalRateLimiter);
app.use(express.json({ limit: '5mb' }));

app.get('/api/health', (req, res) => {
  const mockMode = process.env.MOCK_MODE === 'true' || !process.env.DEEPSEEK_API_KEY;
  res.json({
    ok: true,
    mockMode,
    timestamp: new Date().toISOString(),
  });
});

app.use('/api', aiRateLimiter, minerUImageRouter);
app.use('/api', minerUProxyRouter);
app.use('/api', aiRateLimiter, analyzeRouter);
app.use('/api', aiRateLimiter, replyRouter);
app.use('/api', aiRateLimiter, simulateRouter);
app.use('/api', aiRateLimiter, portraitRouter);
app.use('/api', aiRateLimiter, minerUChatRouter);

app.use((req, res) => {
  res.status(404).json({ error: 'API endpoint not found' });
});

app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(`[${getRequestId(res)}] server error`, {
    message: err?.message,
    stack: err?.stack,
  });
  res.status(500).json({
    error: err.message || 'Internal server error',
  });
});

app.listen(PORT, () => {
  const mockMode = process.env.MOCK_MODE === 'true' || !process.env.DEEPSEEK_API_KEY;
  console.log(`
Lumi Server started
Port: ${PORT}
Health: http://localhost:${PORT}/api/health
Mode: ${mockMode ? 'MOCK' : 'AI'}
Allowed origins: ${getAllowedOrigins().join(', ')}

Routes:
  POST /api/portrait
  POST /api/analyze
  POST /api/reply
  POST /api/simulate
  POST /api/parse-mineru-chat
  POST /api/mineru/parse-image-chat
  POST /api/mineru/upload-to-oss  (compat only; frontend should not call)
  GET  /api/mineru-md            (compat only; frontend should not call)
  *    /api/mineru/*             (compat only; frontend should not call)
  `);
});
