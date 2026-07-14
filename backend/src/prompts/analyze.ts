/**
 * 聊天分析 Prompt 构建器
 * 基于用户资料、问卷结果和聊天记录生成分析报告
 */

import type { LLMMessage } from '../llm/client.js';

export interface AnalyzeInput {
  userProfile?: Record<string, any>;
  girlProfile?: Record<string, any>;
  maleQuestionnaire?: Record<string, any> | null;
  femaleQuestionnaire?: Record<string, any> | null;
  chatSession?: Record<string, any> | null;
  messages?: Array<Record<string, any>>;
  userQuestion?: string;
  profileContext?: string;
}

export function buildAnalyzePrompt(input: AnalyzeInput): LLMMessage[] {
  const systemPrompt = `你是一位温和、克制、尊重边界的恋爱沟通顾问。你的职责是帮助用户理解当前关系状态、分析聊天中的信号、并给出真诚的沟通建议。

你的原则：
1. 不做绝对判断，承认感情的不确定性
2. 帮助用户理解可能的情绪和需求
3. 提供建设性的回复方向建议
4. 避免过度解读或阴谋论式的分析
5. 强调尊重对方边界
6. 不鼓励操控、套路、道德绑架或连续轰炸

追求期规则：
1. 当前产品只服务追求期互动，不默认使用亲昵称呼。
2. 不将回复慢、回复短或单次冷淡直接解释为不喜欢。
3. 邀约和推进建议必须具体、低压力，并保留拒绝空间。
4. 用户的观察只能作为辅助线索，必须使用“可能”“基于目前信息”等不确定表达。

**必须返回严格的 JSON 格式，字段使用 camelCase 命名**，结构如下：
{
  "simpleAnswer": "一句话结论，简明扼要地描述当前关系状态或回答用户问题",
    "relationshipStage": "当前关系阶段描述（只可为：初识接触期、升温期、暧昧观察期；追求期仅作为总称）",
  "interactionHeat": "cold 或 warm 或 hot",
  "girlEmotion": "女生当前可能的情绪状态描述",
  "positiveSignals": ["积极信号1", "积极信号2"],
  "riskSignals": ["风险信号1", "风险信号2"],
  "boyIssues": ["男生自身可能存在的沟通问题1", "问题2"],
  "girlPerspective": "站在女生视角的解读，帮助男生理解对方可能的想法",
  "recommendedReplies": [
    { "style": "自然真诚型", "text": "推荐的回复文本" },
    { "style": "轻松幽默型", "text": "推荐的回复文本" }
  ],
  "avoidReplies": ["不要这样回复1", "不要这样回复2"],
  "nextStep": "下一步建议，具体的可执行动作"
}`;

  let userContent = '';

  if (input.profileContext) {
    userContent += `## 追求期结构化上下文（优先参考）\n${input.profileContext}\n\n`;
  }

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

  // 添加聊天记录
  if (input.messages && input.messages.length > 0) {
    userContent += `## 聊天记录（共 ${input.messages.length} 条）\n`;
    const recentMessages = input.messages.slice(-30); // 最近30条
    for (const msg of recentMessages) {
      const role = msg.sender === 'user' ? '男生' : '女生';
      userContent += `[${role}] ${msg.content}\n`;
    }
    userContent += '\n';
  } else {
    userContent += `## 聊天记录\n暂无聊天记录，请基于问卷和资料进行分析。\n\n`;
  }

  // 添加用户问题
  if (input.userQuestion) {
    userContent += `## 用户的具体问题\n${input.userQuestion}\n\n`;
  }

  userContent += `请综合以上所有信息，生成一份完整的恋爱关系分析报告。`;

  return [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userContent },
  ];
}
