/**
 * 关系画像路由 - POST /api/portrait
 * 综合男生问卷、女生问卷、双方资料生成关系画像
 */

import { Router } from 'express';
import { z } from 'zod';
import { callLLM } from '../llm/client.js';
import { mockPortrait } from '../llm/mock.js';
import { PortraitResponseSchema } from '../schemas/index.js';
import { buildPortraitPrompt } from '../prompts/portrait.js';

const router = Router();

// 输入参数校验
const PortraitInputSchema = z.object({
  userProfile: z.object({
    name: z.string().optional(),
    age: z.number().optional(),
    occupation: z.string().optional(),
  }).optional(),
  girlProfile: z.object({
    name: z.string().optional(),
    age: z.number().optional(),
    occupation: z.string().optional(),
  }).optional(),
  userQuestionnaire: z.record(z.any()).optional(),
  girlQuestionnaire: z.record(z.any()).optional(),
  chatHistory: z.array(z.object({
    role: z.string(),
    content: z.string(),
    timestamp: z.string().optional(),
  })).optional(),
});

router.post('/portrait', async (req, res) => {
  try {
    // 校验输入参数
    const input = PortraitInputSchema.parse(req.body);

    try {
      // 构建 prompt 并调用 LLM
      const messages = buildPortraitPrompt(input);
      const raw = await callLLM(messages);

      // 校验 LLM 返回的数据结构
      const parsed = PortraitResponseSchema.parse(raw);

      res.json(parsed);
    } catch (error: any) {
      // LLM 调用失败或数据校验失败时，返回 mock 数据
      if (error.message === 'MOCK_MODE') {
        console.warn('🔄 使用 mock 模式（MOCK_MODE 已启用或未配置 API Key）');
      } else {
        console.warn('⚠️ LLM 调用或数据校验失败，回退到 mock 数据:', error.message);
      }
      res.json(mockPortrait());
    }
  } catch (error: any) {
    // 输入参数校验失败
    console.error('❌ 输入参数校验失败:', error);
    res.status(400).json({ error: '输入参数格式不正确', details: error.message });
  }
});

export default router;
