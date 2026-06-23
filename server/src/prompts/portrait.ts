/**
 * 关系画像 Prompt 构建器
 * 综合男生问卷、女生问卷、双方资料生成关系画像
 */

import type { LLMMessage } from '../llm/client.js';

export interface PortraitInput {
  userProfile?: {
    name?: string;
    age?: number;
    occupation?: string;
  };
  girlProfile?: {
    name?: string;
    age?: number;
    occupation?: string;
  };
  userQuestionnaire?: Record<string, any>;
  girlQuestionnaire?: Record<string, any>;
  chatHistory?: Array<{ role: string; content: string; timestamp?: string }>;
}

export function buildPortraitPrompt(input: PortraitInput): LLMMessage[] {
  const systemPrompt = `你是一位温和、克制、尊重边界的恋爱沟通顾问。你的职责是帮助用户理解他们在感情互动中的模式和对方的可能心理，但绝不输出 PUA 技巧、操控策略或绝对判断。

你的原则：
1. 尊重双方边界，不鼓励过度追求或强行推进关系
2. 提供建设性建议，帮助用户更好地理解和沟通
3. 承认感情的复杂性和不确定性
4. 避免性别刻板印象和绝对化判断

请根据提供的信息（男生画像、女生画像、问卷答案、聊天记录等）生成关系画像分析。

**必须返回严格的 JSON 格式，字段使用 camelCase 命名**，结构如下：
{
  "maleTypeTags": ["标签1", "标签2"],
  "maleWeaknesses": ["弱点1", "弱点2", "弱点3"],
  "maleSuggestions": ["建议1", "建议2", "建议3"],
  "femalePersonalityTags": ["标签1", "标签2"],
  "possibleStage": "当前可能的关系阶段",
  "interactionHeat": "cold|cool|warm|hot",
  "positiveSignals": ["积极信号1", "积极信号2"],
  "cautionSignals": ["注意信号1", "注意信号2"],
  "suggestions": ["整体建议1", "整体建议2", "整体建议3", "整体建议4"]
}`;

  const userContent = `请分析以下信息并生成关系画像：

## 男生资料
${input.userProfile ? JSON.stringify(input.userProfile, null, 2) : '暂无'}

## 女生资料
${input.girlProfile ? JSON.stringify(input.girlProfile, null, 2) : '暂无'}

## 男生问卷答案
${input.userQuestionnaire ? JSON.stringify(input.userQuestionnaire, null, 2) : '暂无'}

## 女生问卷答案
${input.girlQuestionnaire ? JSON.stringify(input.girlQuestionnaire, null, 2) : '暂无'}

## 最近聊天记录（最多 20 条）
${input.chatHistory && input.chatHistory.length > 0
  ? input.chatHistory.slice(-20).map(msg => `[${msg.role}] ${msg.content}`).join('\n')
  : '暂无聊天记录'}

请综合以上信息，生成完整的关系画像分析。`;

  return [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userContent },
  ];
}
