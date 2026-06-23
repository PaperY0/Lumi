/**
 * Lumi Server - 主入口文件
 * 提供 4 个 AI 接口：analyze、reply、simulate、portrait
 * 支持 mock 模式，配置 CORS 允许前端访问
 */

import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import portraitRouter from './routes/portrait.js';
import analyzeRouter from './routes/analyze.js';
import replyRouter from './routes/reply.js';
import simulateRouter from './routes/simulate.js';

const app = express();
const PORT = process.env.PORT || 3001;

// 中间件配置
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174'] 
}));
app.use(express.json({ limit: '5mb' }));

// 健康检查接口
app.get('/api/health', (req, res) => {
  const mockMode = process.env.MOCK_MODE === 'true' || !process.env.DEEPSEEK_API_KEY;
  res.json({
    ok: true,
    mockMode,
    timestamp: new Date().toISOString(),
  });
});

// 挂载路由
app.use('/api', portraitRouter);
app.use('/api', analyzeRouter);
app.use('/api', replyRouter);
app.use('/api', simulateRouter);

// 404 处理
app.use((req, res) => {
  res.status(404).json({ error: '接口不存在' });
});

// 全局错误处理
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('❌ 服务器错误:', err);
  res.status(500).json({
    error: err.message || '服务器内部错误',
  });
});

// 启动服务
app.listen(PORT, () => {
  const mockMode = process.env.MOCK_MODE === 'true' || !process.env.DEEPSEEK_API_KEY;
  console.log(`
🚀 Lumi Server 已启动
📡 监听端口: ${PORT}
🌐 健康检查: http://localhost:${PORT}/api/health
${mockMode ? '🔄 运行模式: MOCK (使用假数据)' : '🤖 运行模式: AI (调用 DeepSeek API)'}

可用接口:
  POST /api/portrait  - 关系画像生成
  POST /api/analyze   - 聊天消息分析
  POST /api/reply     - 回复建议生成
  POST /api/simulate  - 模拟对方回复
  `);
});
