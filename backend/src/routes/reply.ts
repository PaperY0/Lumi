import { Router } from 'express';
import { z } from 'zod';
import { callLLM, getPublicLLMError } from '../llm/client.js';
import { mockReply } from '../llm/mock.js';
import { executeLLM } from '../llm/execute.js';
import { ReplyResponseSchema } from '../schemas/index.js';
import { buildReplyPrompt } from '../prompts/reply.js';
import { logRouteEvent, summarizeRequestBody } from '../middleware/security.js';

const router = Router();

const ReplyInputSchema = z.object({
  userProfile: z.any(),
  girlProfile: z.any(),
  maleQuestionnaire: z.any().nullable().optional(),
  femaleQuestionnaire: z.any().nullable().optional(),
  recentMessages: z.array(z.any()).optional().default([]),
  profileContext: z.string().optional(),
  userMessage: z.string().optional(),
  userIntent: z.string().optional(),
  scene: z.string().optional(),
  relationshipStage: z.string().optional(),
  rhythmCard: z.object({ status: z.string(), title: z.string(), nextAction: z.string(), avoid: z.string() }).optional(),
  message: z.string().optional(),
}).transform((input) => ({
  ...input,
  userMessage: input.userMessage || input.message || '',
})).pipe(z.object({
  userProfile: z.any(),
  girlProfile: z.any(),
  maleQuestionnaire: z.any().nullable().optional(),
  femaleQuestionnaire: z.any().nullable().optional(),
  recentMessages: z.array(z.any()).optional().default([]),
  profileContext: z.string().optional(),
  userMessage: z.string().min(1, 'userMessage 不能为空'),
  userIntent: z.string().optional(),
  scene: z.string().optional(),
  relationshipStage: z.string().optional(),
  rhythmCard: z.object({ status: z.string(), title: z.string(), nextAction: z.string(), avoid: z.string() }).optional(),
  message: z.string().optional(),
}));

router.post('/reply', async (req, res) => {
  logRouteEvent(res, '/api/reply', 'request_received', summarizeRequestBody(req.body));

  let input: z.infer<typeof ReplyInputSchema>;

  try {
    input = ReplyInputSchema.parse(req.body);
    logRouteEvent(res, '/api/reply', 'schema_ok', {
      hasUserProfile: !!input.userProfile,
      hasGirlProfile: !!input.girlProfile,
      recentMessagesCount: input.recentMessages?.length ?? 0,
      profileContextChars: input.profileContext?.length ?? 0,
      userMessageLength: input.userMessage.length,
      userIntentLength: input.userIntent?.length ?? 0,
      scene: input.scene,
    });
  } catch (error: any) {
    logRouteEvent(res, '/api/reply', 'schema_failed', {
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
    logRouteEvent(res, '/api/reply', 'llm_prepare', {
      useMock: mockMode,
      recentMessagesCount: input.recentMessages?.length ?? 0,
      profileContextChars: input.profileContext?.length ?? 0,
      userMessageLength: input.userMessage.length,
    });

    const execution = await executeLLM({
      mockMode,
      mock: () => mockReply(input),
      live: async () => {
        const messages = buildReplyPrompt(input);
        return await callLLM(messages);
      },
    });
    res.setHeader('x-lumi-ai-source', execution.source);

    const result = ReplyResponseSchema.parse(execution.value);
    logRouteEvent(res, '/api/reply', 'response_ready', {
      recommendedRepliesCount: result?.recommendedReplies?.length ?? 0,
      avoidRepliesCount: result?.avoidReplies?.length ?? 0,
    });

    res.json(result);
  } catch (error: any) {
    logRouteEvent(res, '/api/reply', 'handler_failed', { message: error?.message });
    res.setHeader('x-lumi-ai-source', 'deepseek-error');
    res.status(502).json({
      success: false,
      message: '回复生成失败',
      details: getPublicLLMError(error),
    });
  }
});

export default router;
