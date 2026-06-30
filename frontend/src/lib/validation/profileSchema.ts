/**
 * 「资料建档」表单的校验规则（Zod）。
 *
 * 这里只定义「我的信息」(UserProfile) 这一块的表单校验，配合 react-hook-form 使用。
 * 注意：本项目用的是 Zod 4，自定义错误信息用 `error` 字段（Zod 3 的 `errorMap` 在 4 里已移除）。
 */

import { z } from 'zod';

/** 资料建档表单校验 schema */
export const userProfileSchema = z.object({
  // 昵称：必填，1~20 字
  nickname: z.string().min(1, '请填写昵称').max(20, '昵称不超过 20 字'),
  // 年龄段：四选一枚举，缺/错都提示「请选择年龄段」
  ageRange: z.enum(['18-22', '23-27', '28-32', '33+'], { error: '请选择年龄段' }),
  // 当前关系状态：四选一枚举
  relationshipStatus: z.enum(['single', 'pursuing', 'ambiguous', 'dating'], { error: '请选择当前关系状态' }),
  // 恋爱经验：四选一枚举
  loveExperience: z.enum(['none', 'little', 'some', 'rich'], { error: '请选择恋爱经验' }),
  // 主要困惑：必填，2~200 字（多选标签会拼成一个字符串存这里）
  mainConfusion: z.string().min(2, '请简单描述主要困惑').max(200, '不超过 200 字'),
  // MBTI 人格类型（可选）
  mbti: z.string().optional(),
  // 自我性格描述（可选）
  selfPersonality: z.string().optional(),
  // 沟通习惯（可选）
  communicationHabit: z.string().optional(),
  // 情绪表达方式（可选）
  emotionExpression: z.string().optional(),
  // 聊天风格（可选，多选标签拼成字符串）
  chatStyle: z.string().optional(),
  // 是否容易焦虑（可选）
  isAnxious: z.boolean().optional(),
  // 是否主动（可选）
  isProactive: z.boolean().optional(),
});

/** 表单值类型：由 schema 推导，组件里直接复用 */
export type ProfileFormValues = z.infer<typeof userProfileSchema>;
