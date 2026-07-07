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

const replyStyles = [
  '自然真诚型',
  '轻松幽默型',
  '稳重关心型',
  '暧昧升温型',
  '道歉修复型',
  '边界尊重型',
];

export function buildReplyPrompt(input: ReplyInput): LLMMessage[] {
  const systemPrompt = `你是一位温和、克制、尊重边界的恋爱沟通顾问。你的职责是帮助用户更好地回复对方，建立健康的沟通模式。

原则：
1. 回复必须真诚、自然，避免套路和操控。
2. 尊重双方边界，不鼓励施压、冷暴力、PUA 或过度追问。
3. 根据上下文生成 6 种不同风格的回复。
4. 明确指出应该避免的回复方式。

必须返回严格 JSON，字段使用 camelCase：
{
  "id": "reply-${Date.now()}",
  "createdAt": "${new Date().toISOString()}",
  "simpleAnswer": "一句话简短建议",
  "recommendedReplies": [
    { "style": "自然真诚型", "text": "具体回复" },
    { "style": "轻松幽默型", "text": "具体回复" },
    { "style": "稳重关心型", "text": "具体回复" },
    { "style": "暧昧升温型", "text": "具体回复" },
    { "style": "道歉修复型", "text": "具体回复" },
    { "style": "边界尊重型", "text": "具体回复" }
  ],
  "avoidReplies": ["不建议的回复1", "不建议的回复2"],
  "analysis": "详细分析"
}`;

  let userContent = '';

  if (input.userProfile) {
    userContent += `## 男生资料\n${JSON.stringify(input.userProfile, null, 2)}\n\n`;
  }

  if (input.girlProfile) {
    userContent += `## 女生资料\n${JSON.stringify(input.girlProfile, null, 2)}\n\n`;
  }

  if (input.maleQuestionnaire) {
    userContent += `## 男生问卷结果\n${JSON.stringify(input.maleQuestionnaire, null, 2)}\n\n`;
  }

  if (input.femaleQuestionnaire) {
    userContent += `## 女生观察问卷结果\n${JSON.stringify(input.femaleQuestionnaire, null, 2)}\n\n`;
  }

  if (input.recentMessages && input.recentMessages.length > 0) {
    userContent += `## 最近聊天记录\n`;
    for (const msg of input.recentMessages.slice(-10)) {
      const role = msg.sender === 'user' ? '男生' : '女生';
      userContent += `[${role}] ${msg.content}\n`;
    }
    userContent += '\n';
  }

  userContent += `## 对方最新消息\n"${input.userMessage}"\n\n`;

  if (input.userIntent) {
    userContent += `## 用户意图\n${input.userIntent}\n\n`;
  }

  if (input.scene) {
    userContent += `## 当前场景\n${input.scene}\n\n`;
  }

  userContent += `请生成 ${replyStyles.join('、')} 这 6 种风格的回复建议。`;

  return [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userContent },
  ];
}
