/**
 * MinerU 聊天解析路由 - POST /api/parse-mineru-chat
 *
 * 流程：
 *   1. 校验 originalMarkdown 非空
 *   2. MOCK_MODE 或无 API Key → mockMinerUChatParse
 *   3. 否则 → buildMinerUChatPrompt → callLLM → schema 校验
 *   4. 校验失败回退 mock
 */

import { Router } from 'express';
import { z } from 'zod';
import { callLLM } from '../llm/client.js';
import { mockMinerUChatParse } from '../llm/mock.js';
import { MinerUParseResponseSchema } from '../schemas/index.js';
import { buildMinerUChatPrompt } from '../prompts/minerUChat.js';

const router = Router();

const InputSchema = z.object({
  originalMarkdown: z.string().min(1, 'originalMarkdown 不能为空'),
});

router.post('/parse-mineru-chat', async (req, res) => {
  console.log('📥 [minerUChat] 收到请求');

  let input: z.infer<typeof InputSchema>;
  try {
    input = InputSchema.parse(req.body);
  } catch (error: any) {
    return res.status(400).json({ success: false, message: 'originalMarkdown 不能为空', details: error?.issues });
  }

  const { originalMarkdown } = input;
  console.log('📥 [minerUChat] MinerU Markdown 长度:', originalMarkdown.length);

  try {
    const mockMode = process.env.MOCK_MODE === 'true' || !process.env.DEEPSEEK_API_KEY;

    let result: any;

    if (mockMode) {
      console.log('🧪 [minerUChat] MOCK 模式');
      result = mockMinerUChatParse({ originalMarkdown });
    } else {
      try {
        const messages = buildMinerUChatPrompt({ originalMarkdown });
        const raw = await callLLM(messages);
        result = MinerUParseResponseSchema.parse(raw);
      } catch (llmError: any) {
        console.warn('⚠️ [minerUChat] AI 返回校验失败，回退 mock:', llmError.message);
        result = mockMinerUChatParse({ originalMarkdown });
      }
    }

    // 确保 messages 有 id
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

    console.log('📤 [minerUChat] 返回消息数:', messagesWithId.length);
    res.json(response);
  } catch (error: any) {
    console.error('❌ [minerUChat] 处理失败:', error);
    res.status(500).json({ success: false, message: '解析处理失败', details: error.message });
  }
});

export default router;
