import { Router } from 'express';
import { z } from 'zod';
import { callLLM } from '../llm/client.js';
import { mockSimulate } from '../llm/mock.js';
import { SimulateResponseSchema } from '../schemas/index.js';
import { buildSimulatePrompt } from '../prompts/simulate.js';
import { logRouteEvent, summarizeRequestBody } from '../middleware/security.js';

const router = Router();

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
  message: z.string().optional(),
});

router.post('/simulate', async (req, res) => {
  logRouteEvent(res, '/api/simulate', 'request_received', summarizeRequestBody(req.body));

  let input: z.infer<typeof SimulateInputSchema>;

  try {
    input = SimulateInputSchema.parse(req.body);
    logRouteEvent(res, '/api/simulate', 'schema_ok', {
      hasUserProfile: !!input.userProfile,
      hasGirlProfile: !!input.girlProfile,
      scenario: input.scenario,
      difficulty: input.difficulty,
      conversationCount: input.conversation?.length ?? 0,
      userReplyLength: input.userReply?.length ?? 0,
    });
  } catch (error: any) {
    logRouteEvent(res, '/api/simulate', 'schema_failed', {
      issues: error?.issues,
      message: error?.message,
    });
    return res.status(400).json({
      success: false,
      message: '输入参数格式不正确',
      details: error?.issues ?? error?.message,
    });
  }

  try {
    const mockMode = process.env.MOCK_MODE === 'true' || !process.env.DEEPSEEK_API_KEY;
    logRouteEvent(res, '/api/simulate', 'llm_prepare', {
      useMock: mockMode,
      scenario: input.scenario,
      difficulty: input.difficulty,
      conversationCount: input.conversation?.length ?? 0,
      userReplyLength: input.userReply?.length ?? 0,
    });

    let raw: any;

    if (mockMode) {
      raw = mockSimulate();
    } else {
      try {
        const messages = buildSimulatePrompt(input);
        raw = await callLLM(messages);
      } catch (llmError: any) {
        logRouteEvent(res, '/api/simulate', 'llm_failed_fallback_mock', { message: llmError?.message });
        raw = mockSimulate();
      }
    }

    const result = SimulateResponseSchema.parse(raw);
    logRouteEvent(res, '/api/simulate', 'response_ready', {
      hasGirlReply: !!result?.girlReply,
      hasFeedback: !!result?.feedback,
    });

    res.json(result);
  } catch (error: any) {
    logRouteEvent(res, '/api/simulate', 'handler_failed', { message: error?.message });
    res.status(500).json({
      success: false,
      message: '模拟回复生成失败',
      details: error.message,
    });
  }
});

export default router;
