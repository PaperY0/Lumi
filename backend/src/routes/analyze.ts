import { Router } from 'express';
import { z } from 'zod';
import { callLLM, getPublicLLMError } from '../llm/client.js';
import { mockAnalyze } from '../llm/mock.js';
import { executeLLM } from '../llm/execute.js';
import { AnalyzeResponseSchema } from '../schemas/index.js';
import { buildAnalyzePrompt } from '../prompts/analyze.js';
import { logRouteEvent, summarizeRequestBody } from '../middleware/security.js';

const router = Router();

const AnalyzeInputSchema = z.object({
  userProfile: z.any().optional(),
  girlProfile: z.any().optional(),
  maleQuestionnaire: z.any().nullable().optional(),
  femaleQuestionnaire: z.any().nullable().optional(),
  chatSession: z.any().nullable().optional(),
  messages: z.array(z.any()).optional().default([]),
  userQuestion: z.string().optional(),
  profileContext: z.string().optional(),
});

router.post('/analyze', async (req, res) => {
  logRouteEvent(res, '/api/analyze', 'request_received', summarizeRequestBody(req.body));

  let input: z.infer<typeof AnalyzeInputSchema>;

  try {
    input = AnalyzeInputSchema.parse(req.body);
    logRouteEvent(res, '/api/analyze', 'schema_ok', {
      hasUserProfile: !!input.userProfile,
      hasGirlProfile: !!input.girlProfile,
      hasMaleQuestionnaire: !!input.maleQuestionnaire,
      hasFemaleQuestionnaire: !!input.femaleQuestionnaire,
      hasChatSession: !!input.chatSession,
      messagesCount: input.messages?.length ?? 0,
      userQuestionLength: input.userQuestion?.length ?? 0,
      profileContextChars: input.profileContext?.length ?? 0,
    });
  } catch (error: any) {
    logRouteEvent(res, '/api/analyze', 'schema_failed', {
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
    logRouteEvent(res, '/api/analyze', 'llm_prepare', {
      useMock: mockMode,
      messagesCount: input.messages?.length ?? 0,
    });

    const execution = await executeLLM({
      mockMode,
      mock: () => mockAnalyze(),
      live: async () => {
        const messages = buildAnalyzePrompt(input);
        const raw = await callLLM(messages);
        return AnalyzeResponseSchema.parse(raw);
      },
    });
    res.setHeader('x-lumi-ai-source', execution.source);
    const result = execution.value;

    logRouteEvent(res, '/api/analyze', 'response_ready', {
      hasSimpleAnswer: !!result?.simpleAnswer,
      hasRelationshipStage: !!result?.relationshipStage,
      hasInteractionHeat: !!result?.interactionHeat,
    });

    res.json(result);
  } catch (error: any) {
    logRouteEvent(res, '/api/analyze', 'handler_failed', { message: error?.message });
    res.setHeader('x-lumi-ai-source', 'deepseek-error');
    res.status(502).json({
      success: false,
      message: '分析处理失败',
      details: getPublicLLMError(error),
    });
  }
});

export default router;
