/**
 * 模拟回复路由 - POST /api/simulate
 * 模拟女生可能的回复并给出反馈
 */

import { Router } from 'express';
import { z } from 'zod';
import { callLLM } from '../llm/client.js';
import { mockSimulate } from '../llm/mock.js';
import { SimulateResponseSchema } from '../schemas/index.js';
import { buildSimulatePrompt } from '../prompts/simulate.js';

const router = Router();

// 输入参数校验
const SimulateInputSchema = z.object({
  userMessage: z.string().min(1, '用户消息不能为空'),
  context: z.array(z.object({
    role: z.string(),
    content: z.string(),
  })).optional(),
  girlProfile: z.record(z.any()).optional(),
  girlQuestionnaire: z.record(z.any()).optional(),
});

router.post('/simulate', async (req, res) => {
  try {
    // 校验输入参数
    const input = SimulateInputSchema.parse(req.body);

    try {
      // 构建 prompt 并调用 LLM
      const messages = buildSimulatePrompt(input);
      const raw = await callLLM(messages);

      // 校验 LLM 返回的数据结构
      const parsed = SimulateResponseSchema.parse(raw);

      res.json(parsed);
    } catch (error: any) {
      // LLM 调用失败或数据校验失败时，返回 mock 数据
      if (error.message === 'MOCK_MODE') {
        console.warn('🔄 使用 mock 模式（MOCK_MODE 已启用或未配置 API Key）');
      } else {
        console.warn('⚠️ LLM 调用或数据校验失败，回退到 mock 数据:', error.message);
      }
      res.json(mockSimulate());
    }
  } catch (error: any) {
    // 输入参数校验失败
    console.error('❌ 输入参数校验失败:', error);
    res.status(400).json({ error: '输入参数格式不正确', details: error.message });
  }
});

export default router;
