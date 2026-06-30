/**
 * 聊天分析路由 - POST /api/analyze
 * 分析聊天记录，生成关系分析报告
 */

import { Router } from 'express';
import { z } from 'zod';
import { callLLM } from '../llm/client.js';
import { mockAnalyze } from '../llm/mock.js';
import { AnalyzeResponseSchema } from '../schemas/index.js';
import { buildAnalyzePrompt } from '../prompts/analyze.js';

const router = Router();

// 输入参数校验 — 匹配前端 AnalyzeChatRequest
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
  console.log('📥 [/api/analyze] 收到请求');
  console.log('📥 [/api/analyze] raw body:', JSON.stringify(req.body, null, 2));

  let input: z.infer<typeof AnalyzeInputSchema>;

  try {
    input = AnalyzeInputSchema.parse(req.body);
    console.log('✅ [/api/analyze] schema parse 成功:', {
      hasUserProfile: !!input.userProfile,
      hasGirlProfile: !!input.girlProfile,
      hasMaleQuestionnaire: !!input.maleQuestionnaire,
      hasFemaleQuestionnaire: !!input.femaleQuestionnaire,
      hasChatSession: !!input.chatSession,
      messagesCount: input.messages?.length ?? 0,
      userQuestion: input.userQuestion,
    });
  } catch (error: any) {
    console.error('❌ [/api/analyze] schema parse 失败:', {
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

    console.log('🤖 [/api/analyze] 准备调用 AI:', {
      mode: process.env.MOCK_MODE,
      useMock: mockMode,
      messagesCount: input.messages?.length ?? 0,
      hasUserProfile: !!input.userProfile,
      hasGirlProfile: !!input.girlProfile,
      userQuestion: input.userQuestion,
    });

    let result: any;

    if (mockMode) {
      console.log('🧪 [/api/analyze] 当前走 mock 分析，没有调用真实 AI');
      result = mockAnalyze();
    } else {
      try {
        // 构建 prompt 并调用 LLM
        console.log('🚀 [/api/analyze] 正在调用真实 AI 接口...');
        const messages = buildAnalyzePrompt(input);
        const raw = await callLLM(messages);
        console.log('✅ [/api/analyze] 真实 AI 返回成功');

        // 校验 LLM 返回的数据结构
        result = AnalyzeResponseSchema.parse(raw);
      } catch (llmError: any) {
        console.error('❌ [/api/analyze] 真实 AI 调用失败，回退到 mock:', llmError.message);
        result = mockAnalyze();
      }
    }

    console.log('📤 [/api/analyze] 准备返回分析报告:', {
      hasSimpleAnswer: !!result?.simpleAnswer,
      hasRelationshipStage: !!result?.relationshipStage,
      hasInteractionHeat: !!result?.interactionHeat,
    });

    res.json(result);
  } catch (error: any) {
    console.error('❌ [/api/analyze] 处理失败:', error);
    res.status(500).json({
      success: false,
      message: '分析处理失败',
      details: error.message,
    });
  }
});

export default router;
