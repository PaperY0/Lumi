/**
 * 模拟回复 Prompt 构建器
 * 模拟女生可能的回复并给出反馈
 */

import type { LLMMessage } from '../llm/client.js';

export interface SimulateInput {
  userProfile?: Record<string, any>;
  girlProfile?: Record<string, any>;
  maleQuestionnaire?: Record<string, any> | null;
  femaleQuestionnaire?: Record<string, any> | null;
  recentMessages?: Array<Record<string, any>>;
  scenario: string;
  difficulty: string;
  conversation?: Array<Record<string, any>>;
  userReply?: string;
}

export function buildSimulatePrompt(input: SimulateInput): LLMMessage[] {
  const systemPrompt = `你是一位温和、克制、尊重边界的恋爱沟通顾问。你的职责是帮助用户预演对话，模拟对方可能的回复并给出反馈。

你的原则：
1. 基于女生的性格和聊天风格，模拟真实、自然的回复
2. 不夸大也不过于悲观，保持中立和现实
3. 给出建设性的反馈，帮助用户理解这个回复意味着什么
4. 提供下一步的建议

**必须返回严格的 JSON 格式，字段使用 camelCase 命名**，结构如下：
{
  "id": "sim-${Date.now()}",
  "createdAt": "${new Date().toISOString()}",
  "girlReply": "模拟的女生回复",
  "feedback": {
    "score": 75,
    "strengths": ["表达优点1", "表达优点2"],
    "risks": ["潜在风险1"],
    "suggestion": "改进建议"
  },
  "nextSuggestion": "下一步建议（可选）",
  "isFinished": false
}`;

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

  // 添加场景和难度
  userContent += `## 模拟场景\n${input.scenario}\n\n`;
  userContent += `## 难度\n${input.difficulty}\n\n`;

  // 添加对话历史
  if (input.conversation && input.conversation.length > 0) {
    userContent += `## 对话历史\n`;
    for (const msg of input.conversation) {
      const role = msg.role === 'user' ? '男生' : msg.role === 'girl' ? '女生' : '系统';
      userContent += `[${role}] ${msg.content}\n`;
    }
    userContent += '\n';
  }

  // 添加用户本轮回复
  if (input.userReply) {
    userContent += `## 男生本轮发言\n"${input.userReply}"\n\n`;
    userContent += `请模拟女生的回复，并对男生的表达给出反馈。`;
  } else {
    userContent += `请模拟女生在这个场景下的开场白，开始对话。`;
  }

  return [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userContent },
  ];
}
