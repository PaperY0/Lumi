import { Router } from 'express';
import { z } from 'zod';
import { callLLM, getPublicLLMError } from '../llm/client.js';
import { mockPortrait } from '../llm/mock.js';
import { executeLLM } from '../llm/execute.js';
import { getRequestId, logRouteEvent } from '../middleware/security.js';
import { buildPortraitPrompt } from '../prompts/portrait.js';
import { PortraitResponseSchema } from '../schemas/index.js';

const router = Router();

const PortraitInputSchema = z.object({
  userProfile: z.object({
    name: z.string().optional(),
    age: z.number().optional(),
    occupation: z.string().optional(),
  }).passthrough().optional(),
  girlProfile: z.object({
    name: z.string().optional(),
    age: z.number().optional(),
    occupation: z.string().optional(),
  }).passthrough().optional(),
  userQuestionnaire: z.record(z.any()).optional(),
  girlQuestionnaire: z.record(z.any()).optional(),
  profileContext: z.string().optional(),
  chatHistory: z.array(z.object({
    role: z.string(),
    content: z.string(),
    timestamp: z.string().optional(),
  })).optional(),
});

router.post('/portrait', async (req, res) => {
  try {
    const input = PortraitInputSchema.parse(req.body);

    logRouteEvent(res, '/api/portrait', 'portrait_generate_start', {
      hasUserProfile: !!input.userProfile,
      hasGirlProfile: !!input.girlProfile,
      hasUserQuestionnaire: !!input.userQuestionnaire,
      hasGirlQuestionnaire: !!input.girlQuestionnaire,
      profileContextChars: input.profileContext?.length ?? 0,
      chatHistoryCount: input.chatHistory?.length ?? 0,
      chatContentChars: input.chatHistory?.reduce((sum, message) => sum + message.content.length, 0) ?? 0,
    });

    try {
      const mockMode = process.env.MOCK_MODE === 'true';
      const messages = buildPortraitPrompt(input);
      const execution = await executeLLM({
        mockMode,
        mock: () => mockPortrait(),
        live: async () => PortraitResponseSchema.parse(await callLLM(messages)),
      });
      const parsed = execution.value;
      res.setHeader('x-lumi-ai-source', execution.source);

      logRouteEvent(res, '/api/portrait', 'portrait_generate_success', {
        maleTypeTagsCount: parsed.maleTypeTags.length,
        femalePersonalityTagsCount: parsed.femalePersonalityTags.length,
        positiveSignalsCount: parsed.positiveSignals.length,
        cautionSignalsCount: parsed.cautionSignals.length,
        interactionHeat: parsed.interactionHeat,
      });

      res.json(parsed);
    } catch (error: any) {
      console.warn(`[${getRequestId(res)}] /api/portrait provider failed`, { message: error.message });
      res.setHeader('x-lumi-ai-source', 'deepseek-error');
      res.status(502).json({
        success: false,
        message: '关系画像生成失败',
        details: getPublicLLMError(error),
      });
    }
  } catch (error: any) {
    console.error(`[${getRequestId(res)}] /api/portrait invalid input`, { message: error?.message });
    res.status(400).json({ error: '输入参数格式不正确', details: error.message });
  }
});

export default router;
