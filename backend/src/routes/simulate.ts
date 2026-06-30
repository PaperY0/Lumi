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

// 输入参数校验 — 匹配前端 SimulateRequest
const SimulateInputSchema = z.object({
  userProfile: z.any(),
  girlProfile: z.any(),
  maleQuestionnaire: z.any().nullable().optional(),
  femaleQuestionnaire: z.any().nullable().optional(),
  recentMessages: z.array(z.any()).optional().default([]),
  scenario: z.string().min(1, 'scenario 不能为空'),
  difficulty: z.string().min(1, 'difficulty 不能为空'),
  conversation: z.array(z.any()).optional().default([]),
  userReply: z.string().optional().default(''),
  // 兼容旧字段
  message: z.string().optional(),
});

router.post('/simulate', async (req, res) => {
  console.log('🧭 [/api/simulate] 命中实际 route 文件: server/src/routes/simulate.ts');
  console.log('📥 [/api/simulate] 收到请求');
  console.log('📥 [/api/simulate] raw body:', JSON.stringify(req.body, null, 2));
  console.log('📋 [/api/simulate] raw body 字段摘要:', {
    keys: Object.keys(req.body || {}),
    hasUserProfile: !!req.body?.userProfile,
    hasGirlProfile: !!req.body?.girlProfile,
    scenario: req.body?.scenario,
    difficulty: req.body?.difficulty,
    conversationIsArray: Array.isArray(req.body?.conversation),
    conversationCount: Array.isArray(req.body?.conversation) ? req.body.conversation.length : null,
    userReply: req.body?.userReply,
    message: req.body?.message,
  });

  let input: z.infer<typeof SimulateInputSchema>;

  try {
    input = SimulateInputSchema.parse(req.body);
    console.log('✅ [/api/simulate] schema parse 成功:', {
      hasUserProfile: !!input.userProfile,
      hasGirlProfile: !!input.girlProfile,
      scenario: input.scenario,
      difficulty: input.difficulty,
      conversationCount: input.conversation?.length ?? 0,
      userReply: input.userReply,
    });
  } catch (error: any) {
    console.error('❌ [/api/simulate] schema parse 失败:', {
      issues: error?.issues,
      message: error?.message,
      rawBody: req.body,
    });
    return res.status(400).json({
      success: false,
      message: '输入参数格式不正确',
      details: error?.issues ?? error?.message,
    });
  }

  try {
    const mockMode = process.env.MOCK_MODE === 'true' || !process.env.DEEPSEEK_API_KEY;

    console.log('🤖 [/api/simulate] 准备生成模拟回复:', {
      useMock: mockMode,
      scenario: input.scenario,
      difficulty: input.difficulty,
      conversationCount: input.conversation?.length ?? 0,
      userReply: input.userReply,
    });

    let raw: any;

    if (mockMode) {
      console.log('🧪 [/api/simulate] 当前走 mock 模拟回复，没有调用真实 AI');
      raw = mockSimulate();
    } else {
      try {
        console.log('🚀 [/api/simulate] 正在调用真实 AI 接口...');
        const messages = buildSimulatePrompt(input);
        raw = await callLLM(messages);
        console.log('✅ [/api/simulate] 真实 AI 返回成功');
      } catch (llmError: any) {
        console.error('❌ [/api/simulate] 真实 AI 调用失败，回退到 mock:', llmError.message);
        raw = mockSimulate();
      }
    }

    // 校验 LLM 返回的数据结构
    const result = SimulateResponseSchema.parse(raw);

    console.log('📤 [/api/simulate] 准备返回模拟结果:', {
      hasGirlReply: !!result?.girlReply,
      hasFeedback: !!result?.feedback,
    });

    res.json(result);
  } catch (error: any) {
    console.error('❌ [/api/simulate] 处理失败:', error);
    res.status(500).json({
      success: false,
      message: '模拟回复生成失败',
      details: error.message,
    });
  }
});

export default router;
