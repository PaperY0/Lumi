import { Router } from 'express';
import { z } from 'zod';
import { callLLM } from '../llm/client.js';
import { mockReply } from '../llm/mock.js';
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
    const mockMode = process.env.MOCK_MODE === 'true' || !process.env.DEEPSEEK_API_KEY;
    logRouteEvent(res, '/api/reply', 'llm_prepare', {
      useMock: mockMode,
      recentMessagesCount: input.recentMessages?.length ?? 0,
      profileContextChars: input.profileContext?.length ?? 0,
      userMessageLength: input.userMessage.length,
    });

    let raw: any;

    if (mockMode) {
      raw = mockReply();
    } else {
      try {
        const messages = buildReplyPrompt(input);
        raw = await callLLM(messages);
      } catch (llmError: any) {
        logRouteEvent(res, '/api/reply', 'llm_failed_fallback_mock', { message: llmError?.message });
        raw = mockReply();
      }
    }

    const result = ReplyResponseSchema.parse(raw);
    logRouteEvent(res, '/api/reply', 'response_ready', {
      recommendedRepliesCount: result?.recommendedReplies?.length ?? 0,
      avoidRepliesCount: result?.avoidReplies?.length ?? 0,
    });

    res.json(result);
  } catch (error: any) {
    logRouteEvent(res, '/api/reply', 'handler_failed', { message: error?.message });
    res.status(500).json({
      success: false,
      message: '回复生成失败',
      details: error.message,
    });
  }
});

export default router;
