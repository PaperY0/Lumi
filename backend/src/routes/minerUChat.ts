import { Router } from 'express';
import { z } from 'zod';
import { callLLM } from '../llm/client.js';
import { mockMinerUChatParse } from '../llm/mock.js';
import { MinerUParseResponseSchema } from '../schemas/index.js';
import { buildMinerUChatPrompt } from '../prompts/minerUChat.js';
import { logRouteEvent, summarizeRequestBody } from '../middleware/security.js';

const router = Router();

const InputSchema = z.object({
  originalMarkdown: z.string().min(1, 'originalMarkdown 不能为空'),
});

router.post('/parse-mineru-chat', async (req, res) => {
  logRouteEvent(res, '/api/parse-mineru-chat', 'request_received', summarizeRequestBody(req.body));

  let input: z.infer<typeof InputSchema>;
  try {
    input = InputSchema.parse(req.body);
  } catch (error: any) {
    logRouteEvent(res, '/api/parse-mineru-chat', 'schema_failed', {
      issues: error?.issues,
      message: error?.message,
    });
    return res.status(400).json({
      success: false,
      message: 'originalMarkdown 不能为空',
      details: error?.issues,
    });
  }

  const { originalMarkdown } = input;

  try {
    const mockMode = process.env.MOCK_MODE === 'true' || !process.env.DEEPSEEK_API_KEY;
    logRouteEvent(res, '/api/parse-mineru-chat', 'llm_prepare', {
      useMock: mockMode,
      originalMarkdownLength: originalMarkdown.length,
    });

    let result: any;

    if (mockMode) {
      result = mockMinerUChatParse({ originalMarkdown });
    } else {
      try {
        const messages = buildMinerUChatPrompt({ originalMarkdown });
        const raw = await callLLM(messages);
        result = MinerUParseResponseSchema.parse(raw);
      } catch (llmError: any) {
        logRouteEvent(res, '/api/parse-mineru-chat', 'llm_failed_fallback_mock', { message: llmError?.message });
        result = mockMinerUChatParse({ originalMarkdown });
      }
    }

    const messagesWithId = (result.messages || []).map((m: any, i: number) => ({
      ...m,
      id: m.id || `mineru-${Date.now()}-${i}`,
    }));

    const response = {
      originalMarkdown,
      rawText: result.rawText || '',
      messages: messagesWithId,
      warnings: result.warnings || [],
      removedNoiseCount: result.removedNoiseCount,
    };

    logRouteEvent(res, '/api/parse-mineru-chat', 'response_ready', {
      messagesCount: messagesWithId.length,
      warningsCount: response.warnings.length,
    });
    res.json(response);
  } catch (error: any) {
    logRouteEvent(res, '/api/parse-mineru-chat', 'handler_failed', { message: error?.message });
    res.status(500).json({ success: false, message: '解析处理失败', details: error.message });
  }
});

export default router;
