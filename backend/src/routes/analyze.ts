import { Router } from 'express';
import { z } from 'zod';
import { callLLM } from '../llm/client.js';
import { mockAnalyze } from '../llm/mock.js';
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
    const mockMode = process.env.MOCK_MODE === 'true' || !process.env.DEEPSEEK_API_KEY;
    logRouteEvent(res, '/api/analyze', 'llm_prepare', {
      useMock: mockMode,
      messagesCount: input.messages?.length ?? 0,
    });

    let result: any;

    if (mockMode) {
      result = mockAnalyze();
    } else {
      try {
        const messages = buildAnalyzePrompt(input);
        const raw = await callLLM(messages);
        result = AnalyzeResponseSchema.parse(raw);
      } catch (llmError: any) {
        logRouteEvent(res, '/api/analyze', 'llm_failed_fallback_mock', { message: llmError?.message });
        result = mockAnalyze();
      }
    }

    logRouteEvent(res, '/api/analyze', 'response_ready', {
      hasSimpleAnswer: !!result?.simpleAnswer,
      hasRelationshipStage: !!result?.relationshipStage,
      hasInteractionHeat: !!result?.interactionHeat,
    });

    res.json(result);
  } catch (error: any) {
    logRouteEvent(res, '/api/analyze', 'handler_failed', { message: error?.message });
    res.status(500).json({
      success: false,
      message: '分析处理失败',
      details: error.message,
    });
  }
});

export default router;
