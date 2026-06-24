/**
 * Zod Schemas - 校验 LLM 返回的 JSON 结构
 * 确保数据格式符合预期，不合法时会抛出错误
 */

import { z } from 'zod';

// 关系画像响应结构
export const PortraitResponseSchema = z.object({
  maleTypeTags: z.array(z.string()),
  maleWeaknesses: z.array(z.string()),
  maleSuggestions: z.array(z.string()),
  femalePersonalityTags: z.array(z.string()),
  possibleStage: z.string(),
  interactionHeat: z.enum(['cold', 'cool', 'warm', 'hot']),
  positiveSignals: z.array(z.string()),
  cautionSignals: z.array(z.string()),
  suggestions: z.array(z.string()),
});

// 聊天分析响应结构 — 匹配前端 AIAnalysisReport
export const AnalyzeResponseSchema = z.object({
  simpleAnswer: z.string(),
  relationshipStage: z.string(),
  interactionHeat: z.enum(['cold', 'warm', 'hot']),
  girlEmotion: z.string(),
  positiveSignals: z.array(z.string()),
  riskSignals: z.array(z.string()),
  boyIssues: z.array(z.string()),
  girlPerspective: z.string(),
  recommendedReplies: z.array(z.object({
    style: z.string(),
    text: z.string(),
  })),
  avoidReplies: z.array(z.string()),
  nextStep: z.string(),
});

// 回复建议响应结构
export const ReplyResponseSchema = z.object({
  simpleAnswer: z.string(),
  recommendedReplies: z.array(
    z.object({
      style: z.string(),
      text: z.string(),
      pros: z.string(),
      cons: z.string(),
    })
  ),
  avoidReplies: z.array(
    z.object({
      text: z.string(),
      reason: z.string(),
    })
  ),
});

// 模拟回复响应结构
export const SimulateResponseSchema = z.object({
  aiReply: z.string(),
  feedback: z.string(),
  nextStepSuggestion: z.string().optional(),
});

// 导出类型定义（供 TypeScript 使用）
export type PortraitResponse = z.infer<typeof PortraitResponseSchema>;
export type AnalyzeResponse = z.infer<typeof AnalyzeResponseSchema>;
export type ReplyResponse = z.infer<typeof ReplyResponseSchema>;
export type SimulateResponse = z.infer<typeof SimulateResponseSchema>;
