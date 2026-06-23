/**
 * 回复建议 Prompt 构建器
 * 根据对方消息生成多种风格的回复建议
 */

import type { LLMMessage } from '../llm/client.js';

export interface ReplyInput {
  message: string;
  context?: Array<{ role: string; content: string }>;
  userQuestion?: string;
  userProfile?: Record<string, any>;
  girlProfile?: Record<string, any>;
}

export function buildReplyPrompt(input: ReplyInput): LLMMessage[] {
  const systemPrompt = `你是一位温和、克制、尊重边界的恋爱沟通顾问。你的职责是帮助用户更好地回复对方，建立健康的沟通模式。

你的原则：
1. 提供真诚、自然的回复建议，避免套路和话术
2. 尊重双方边界，不鼓励操控或过度追求
3. 提供多种风格的选择，让用户根据自己的性格选择
4. 明确指出应该避免的回复方式及原因

请根据对方的消息和用户的问题，生成回复建议。

**必须返回严格的 JSON 格式，字段使用 camelCase 命名**，结构如下：
{
  "simpleAnswer": "简短直接的回复建议",
  "recommendedReplies": [
    {
      "style": "风格标签（如 caring/light/balance）",
      "text": "具体的回复文本",
      "pros": "这样回复的优点",
      "cons": "这样回复可能的风险"
    }
  ],
  "avoidReplies": [
    {
      "text": "不建议的回复示例",
      "reason": "为什么不建议这样回复"
    }
  ]
}

请生成 3 种不同风格的推荐回复，和 2-3 个应该避免的回复。`;

  let userContent = `## 对方的消息
"${input.message}"`;

  if (input.userQuestion) {
    userContent += `\n\n## 用户的问题\n"${input.userQuestion}"`;
  }

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

  userContent += `\n请生成多种风格的回复建议。`;

  return [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userContent },
  ];
}
