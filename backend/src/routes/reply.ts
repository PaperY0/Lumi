/**
 * 回复建议路由 - POST /api/reply
 * 根据对方消息生成多种风格的回复建议
 */

import { Router } from 'express';
import { z } from 'zod';
import { callLLM } from '../llm/client.js';
import { mockReply } from '../llm/mock.js';
import { ReplyResponseSchema } from '../schemas/index.js';
import { buildReplyPrompt } from '../prompts/reply.js';

const router = Router();

// 输入参数校验 — 匹配前端 ReplyRequest
const ReplyInputSchema = z.object({
  userProfile: z.any(),
  girlProfile: z.any(),
  maleQuestionnaire: z.any().nullable().optional(),
  femaleQuestionnaire: z.any().nullable().optional(),
  recentMessages: z.array(z.any()).optional().default([]),
  userMessage: z.string().min(1, 'userMessage 不能为空'),
  userIntent: z.string().optional(),
  scene: z.string().optional(),
  // 兼容旧字段
  message: z.string().optional(),
});

router.post('/reply', async (req, res) => {
  console.log('📥 [/api/reply] 收到请求');
  console.log('📥 [/api/reply] raw body:', JSON.stringify(req.body, null, 2));

  let input: z.infer<typeof ReplyInputSchema>;

  try {
    input = ReplyInputSchema.parse(req.body);
    // 兼容旧字段：如果没传 userMessage 但传了 message，用 message 兜底
    if (!input.userMessage && input.message) {
      input.userMessage = input.message;
    }
    console.log('✅ [/api/reply] schema parse 成功:', {
      hasUserProfile: !!input.userProfile,
      hasGirlProfile: !!input.girlProfile,
      hasMaleQuestionnaire: !!input.maleQuestionnaire,
      hasFemaleQuestionnaire: !!input.femaleQuestionnaire,
      recentMessagesCount: input.recentMessages?.length ?? 0,
      userMessage: input.userMessage,
      userIntent: input.userIntent,
      scene: input.scene,
    });
  } catch (error: any) {
    console.error('❌ [/api/reply] schema parse 失败:', {
      issues: error?.issues,
      message: error?.message,
      rawBody: req.body,
    });
    return res.status(400).json({
      success: false,
      message: '输入参数格式不正确',
      details: error?.issues ?? error?.message,
    });
  }

  try {
    const mockMode = process.env.MOCK_MODE === 'true' || !process.env.DEEPSEEK_API_KEY;

    console.log('🤖 [/api/reply] 准备生成回复:', {
      useMock: mockMode,
      recentMessagesCount: input.recentMessages?.length ?? 0,
      userMessage: input.userMessage,
      userIntent: input.userIntent,
      scene: input.scene,
    });

    let raw: any;

    if (mockMode) {
      console.log('🧪 [/api/reply] 当前走 mock 回复生成，没有调用真实 AI');
      raw = mockReply();
    } else {
      try {
        console.log('🚀 [/api/reply] 正在调用真实 AI 接口...');
        const messages = buildReplyPrompt(input);
        raw = await callLLM(messages);
        console.log('✅ [/api/reply] 真实 AI 返回成功');
      } catch (llmError: any) {
        console.error('❌ [/api/reply] 真实 AI 调用失败，回退到 mock:', llmError.message);
        raw = mockReply();
      }
    }

    // 校验 LLM 返回的数据结构
    const result = ReplyResponseSchema.parse(raw);

    console.log('📤 [/api/reply] 准备返回回复建议:', {
      hasSimpleAnswer: !!result?.simpleAnswer,
      recommendedRepliesCount: result?.recommendedReplies?.length ?? 0,
      avoidRepliesCount: result?.avoidReplies?.length ?? 0,
      hasAnalysis: !!result?.analysis,
    });

    res.json(result);
  } catch (error: any) {
    console.error('❌ [/api/reply] 处理失败:', error);
    res.status(500).json({
      success: false,
      message: '回复生成失败',
      details: error.message,
    });
  }
});

export default router;
