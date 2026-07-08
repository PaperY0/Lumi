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

const MAX_PROMPT_CHAT_MESSAGES = 40;

export function buildPortraitPrompt(input: PortraitInput): LLMMessage[] {
  const systemPrompt = `你是 Lumi 恋语的关系画像分析助手。你的职责是帮助用户理解自己在亲密关系沟通中的模式，以及对方在当前互动中可能呈现出的状态。

安全原则：
1. 不输出 PUA、操控、施压、逼问、冷暴力或越界推进关系的建议。
2. 不做“她一定喜欢你/一定不喜欢你”这类绝对判断。
3. 资料和问卷用于判断长期倾向；最近聊天记录用于判断最近互动状态。
4. 如果聊天记录不足或信号不明确，要明确表达“不确定”，并给出低压力、尊重边界的下一步。
5. 建议必须具体、温和、可执行。

请严格返回 JSON，不要输出 Markdown，不要添加解释文字。字段使用 camelCase：
{
  "maleTypeTags": ["男生沟通类型标签1", "男生沟通类型标签2"],
  "maleWeaknesses": ["男生容易踩坑点1", "男生容易踩坑点2", "男生容易踩坑点3"],
  "maleSuggestions": ["给男生的沟通建议1", "给男生的沟通建议2", "给男生的沟通建议3"],
  "femalePersonalityTags": ["女生观察标签1", "女生观察标签2"],
  "possibleStage": "当前可能的关系阶段",
  "interactionHeat": "cold|cool|warm|hot",
  "positiveSignals": ["积极信号1", "积极信号2"],
  "cautionSignals": ["风险或谨慎信号1", "风险或谨慎信号2"],
  "suggestions": ["下一步建议1", "下一步建议2", "下一步建议3", "下一步建议4"]
}`;

  const chatContext = input.chatHistory && input.chatHistory.length > 0
    ? input.chatHistory
      .slice(-MAX_PROMPT_CHAT_MESSAGES)
      .map((msg) => {
        const role = msg.role === 'user' ? '男生' : msg.role === 'other' ? '女生' : msg.role;
        const time = msg.timestamp ? ` ${msg.timestamp}` : '';
        return `[${role}${time}] ${msg.content}`;
      })
      .join('\n')
    : '暂无聊天记录。请基于资料和问卷生成基础画像，并说明聊天证据不足。';

  const userContent = `请综合以下信息生成关系画像。

判断优先级：
- 最近聊天记录：优先用于判断当前阶段、互动热度、积极信号、风险信号。
- 男生/女生资料：用于理解背景和表达偏好。
- 两份问卷：用于判断长期沟通倾向和容易出现的模式。

## 男生资料
${input.userProfile ? JSON.stringify(input.userProfile, null, 2) : '暂无'}

## 女生资料
${input.girlProfile ? JSON.stringify(input.girlProfile, null, 2) : '暂无'}

## 男生问卷答案
${input.userQuestionnaire ? JSON.stringify(input.userQuestionnaire, null, 2) : '暂无'}

## 女生观察问卷答案
${input.girlQuestionnaire ? JSON.stringify(input.girlQuestionnaire, null, 2) : '暂无'}

## 最近聊天记录（最多 ${MAX_PROMPT_CHAT_MESSAGES} 条）
${chatContext}

请输出完整关系画像。建议要落到具体行动，不要只写“多沟通”“保持真诚”这类空泛表达。`;

  return [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userContent },
  ];
}
