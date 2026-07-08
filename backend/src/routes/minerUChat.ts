import { Router } from 'express';
import { z } from 'zod';
import { logRouteEvent, summarizeRequestBody } from '../middleware/security.js';
import { parseMinerUChatMarkdown } from '../services/minerUChatParser.js';

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
    logRouteEvent(res, '/api/parse-mineru-chat', 'llm_prepare', {
      useMock: process.env.MOCK_MODE === 'true' || !process.env.DEEPSEEK_API_KEY,
      originalMarkdownLength: originalMarkdown.length,
    });

    const response = await parseMinerUChatMarkdown(originalMarkdown);

    logRouteEvent(res, '/api/parse-mineru-chat', 'response_ready', {
      messagesCount: response.messages.length,
      warningsCount: response.warnings.length,
    });
    res.json(response);
  } catch (error: any) {
    logRouteEvent(res, '/api/parse-mineru-chat', 'handler_failed', { message: error?.message });
    res.status(500).json({ success: false, message: '解析处理失败', details: error.message });
  }
});

export default router;
