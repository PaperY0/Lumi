/**
 * 聊天分析 Prompt 构建器
 * 分析对方消息的情绪基调、核心需求和言外之意
 */

import type { LLMMessage } from '../llm/client.js';

export interface AnalyzeInput {
  message: string;
  context?: Array<{ role: string; content: string }>;
  userProfile?: Record<string, any>;
  girlProfile?: Record<string, any>;
}

export function buildAnalyzePrompt(input: AnalyzeInput): LLMMessage[] {
  const systemPrompt = `你是一位温和、克制、尊重边界的恋爱沟通顾问。你的职责是帮助用户理解对方消息背后的情绪和需求。

你的原则：
1. 不做绝对判断，承认感情的不确定性
2. 帮助用户理解可能的情绪和需求
3. 提供建设性的回复方向建议
4. 避免过度解读或阴谋论式的分析

请分析对方的这条消息，识别情绪基调、核心需求、可能的言外之意，并给出回复方向建议。

**必须返回严格的 JSON 格式，字段使用 camelCase 命名**，结构如下：
{
  "emotionalTone": "情绪基调描述",
  "coreNeed": "核心需求分析",
  "subtext": "可能的言外之意（可选）",
  "replyDirection": "建议的回复方向",
  "reasoning": "分析推理过程",
  "attentionPoints": ["注意点1", "注意点2", "注意点3"]
}`;

  let userContent = `请分析以下消息：

## 对方的消息
"${input.message}"`;

  if (input.context && input.context.length > 0) {
    userContent += `\n\n## 上下文（最近的聊天记录）\n`;
    userContent += input.context.slice(-10).map(msg => `[${msg.role}] ${msg.content}`).join('\n');
  }

  if (input.userProfile || input.girlProfile) {
    userContent += `\n\n## 背景信息\n`;
    if (input.userProfile) {
      userContent += `男生：${JSON.stringify(input.userProfile)}\n`;
    }
    if (input.girlProfile) {
      userContent += `女生：${JSON.stringify(input.girlProfile)}\n`;
    }
  }

  userContent += `\n请分析这条消息的情绪、需求和言外之意，并给出回复建议。`;

  return [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userContent },
  ];
}
