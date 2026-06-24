/**
 * 回复建议 Prompt 构建器
 * 根据对方消息和完整上下文生成多种风格的回复建议
 */

import type { LLMMessage } from '../llm/client.js';

export interface ReplyInput {
  userProfile?: Record<string, any>;
  girlProfile?: Record<string, any>;
  maleQuestionnaire?: Record<string, any> | null;
  femaleQuestionnaire?: Record<string, any> | null;
  recentMessages?: Array<Record<string, any>>;
  userMessage: string;
  userIntent?: string;
  scene?: string;
}

export function buildReplyPrompt(input: ReplyInput): LLMMessage[] {
  const systemPrompt = `你是一位温和、克制、尊重边界的恋爱沟通顾问。你的职责是帮助用户更好地回复对方，建立健康的沟通模式。

你的原则：
1. 提供真诚、自然的回复建议，避免套路和话术
2. 尊重双方边界，不鼓励操控或过度追求
3. 提供多种风格的选择，让用户根据自己的性格选择
4. 明确指出应该避免的回复方式及原因

**必须返回严格的 JSON 格式，字段使用 camelCase 命名**，结构如下：
{
  "id": "reply-${Date.now()}",
  "createdAt": "${new Date().toISOString()}",
  "simpleAnswer": "一句话简短直接的回复建议",
  "recommendedReplies": [
    { "style": "自然真诚型", "text": "具体的回复文本" },
    { "style": "轻松幽默型", "text": "具体的回复文本" },
    { "style": "稳重关心型", "text": "具体的回复文本" }
  ],
  "avoidReplies": ["不建议的回复1", "不建议的回复2"],
  "analysis": "详细分析：对方这句话的可能含义、你的回复思路、需要注意的点"
}

请生成 3 种不同风格的推荐回复，和 2-3 个应该避免的回复。`;

  let userContent = '';

  // 添加用户资料
  if (input.userProfile) {
    userContent += `## 男生资料\n${JSON.stringify(input.userProfile, null, 2)}\n\n`;
  }

  // 添加女生资料
  if (input.girlProfile) {
    userContent += `## 女生资料\n${JSON.stringify(input.girlProfile, null, 2)}\n\n`;
  }

  // 添加问卷结果
  if (input.maleQuestionnaire) {
    userContent += `## 男生问卷结果\n${JSON.stringify(input.maleQuestionnaire, null, 2)}\n\n`;
  }

  if (input.femaleQuestionnaire) {
    userContent += `## 女生观察问卷结果\n${JSON.stringify(input.femaleQuestionnaire, null, 2)}\n\n`;
  }

  // 添加最近聊天记录
  if (input.recentMessages && input.recentMessages.length > 0) {
    userContent += `## 最近聊天记录\n`;
    for (const msg of input.recentMessages.slice(-10)) {
      const role = msg.sender === 'user' ? '男生' : '女生';
      userContent += `[${role}] ${msg.content}\n`;
    }
    userContent += '\n';
  }

  // 添加对方消息
  userContent += `## 对方最新消息\n"${input.userMessage}"\n\n`;

  // 添加用户意图
  if (input.userIntent) {
    userContent += `## 用户意图\n${input.userIntent}\n\n`;
  }

  // 添加场景
  if (input.scene) {
    userContent += `## 当前场景\n${input.scene}\n\n`;
  }

  userContent += `请综合以上信息，生成多种风格的回复建议。`;

  return [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userContent },
  ];
}
