import { Router } from 'express';
import { z } from 'zod';
import { callLLM, getPublicLLMError } from '../llm/client.js';
import { mockSimulate } from '../llm/mock.js';
import { executeLLM } from '../llm/execute.js';
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
  profileContext: z.string().optional(),
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
      profileContextChars: input.profileContext?.length ?? 0,
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
    const mockMode = process.env.MOCK_MODE === 'true';
    logRouteEvent(res, '/api/simulate', 'llm_prepare', {
      useMock: mockMode,
      scenario: input.scenario,
      difficulty: input.difficulty,
      conversationCount: input.conversation?.length ?? 0,
      userReplyLength: input.userReply?.length ?? 0,
    });

    const execution = await executeLLM({
      mockMode,
      mock: () => mockSimulate(),
      live: async () => {
        const messages = buildSimulatePrompt(input);
        return await callLLM(messages);
      },
    });
    res.setHeader('x-lumi-ai-source', execution.source);

    const result = SimulateResponseSchema.parse(execution.value);
    logRouteEvent(res, '/api/simulate', 'response_ready', {
      hasGirlReply: !!result?.girlReply,
      hasFeedback: !!result?.feedback,
    });

    res.json(result);
  } catch (error: any) {
    logRouteEvent(res, '/api/simulate', 'handler_failed', { message: error?.message });
    res.setHeader('x-lumi-ai-source', 'deepseek-error');
    res.status(502).json({
      success: false,
      message: '模拟回复生成失败',
      details: getPublicLLMError(error),
    });
  }
});

export default router;
