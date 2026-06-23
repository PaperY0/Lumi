/**
 * 模拟回复 Prompt 构建器
 * 模拟女生可能的回复并给出反馈
 */

import type { LLMMessage } from '../llm/client.js';

export interface SimulateInput {
  userMessage: string;
  context?: Array<{ role: string; content: string }>;
  girlProfile?: Record<string, any>;
  girlQuestionnaire?: Record<string, any>;
}

export function buildSimulatePrompt(input: SimulateInput): LLMMessage[] {
  const systemPrompt = `你是一位温和、克制、尊重边界的恋爱沟通顾问。你的职责是帮助用户预演对话，模拟对方可能的回复并给出反馈。

你的原则：
1. 基于女生的性格和聊天风格，模拟真实、自然的回复
2. 不夸大也不过于悲观，保持中立和现实
3. 给出建设性的反馈，帮助用户理解这个回复意味着什么
4. 提供下一步的建议（可选）

请根据用户准备发送的消息，模拟女生可能的回复，并给出反馈。

**必须返回严格的 JSON 格式，字段使用 camelCase 命名**，结构如下：
{
  "aiReply": "模拟的女生回复",
  "feedback": "对这个回复的分析和反馈",
  "nextStepSuggestion": "下一步建议（可选）"
}`;

  let userContent = `## 用户准备发送的消息
"${input.userMessage}"`;

  if (input.context && input.context.length > 0) {
    userContent += `\n\n## 上下文（最近的聊天记录）\n`;
    userContent += input.context.slice(-10).map(msg => `[${msg.role}] ${msg.content}`).join('\n');
  }

  if (input.girlProfile) {
    userContent += `\n\n## 女生资料\n${JSON.stringify(input.girlProfile, null, 2)}`;
  }

  if (input.girlQuestionnaire) {
    userContent += `\n\n## 女生问卷答案\n${JSON.stringify(input.girlQuestionnaire, null, 2)}`;
  }

  userContent += `\n\n请基于女生的性格和聊天风格，模拟她可能的回复，并给出反馈建议。`;

  return [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userContent },
  ];
}
