import type { LLMMessage } from '../llm/client.js';

export interface ReplyInput {
  userProfile?: Record<string, any>;
  girlProfile?: Record<string, any>;
  maleQuestionnaire?: Record<string, any> | null;
  femaleQuestionnaire?: Record<string, any> | null;
  recentMessages?: Array<Record<string, any>>;
  profileContext?: string;
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

function renderRecentMessages(messages: Array<Record<string, any>> = []): string {
  if (messages.length === 0) return 'No recent messages.';

  return messages.slice(-20).map((msg) => {
    const role = msg.sender === 'user' ? 'boy' : 'girl';
    const content = typeof msg.content === 'string' ? msg.content : '';
    return `[${role}] ${content}`;
  }).join('\n');
}

export function buildReplyPrompt(input: ReplyInput): LLMMessage[] {
  const systemPrompt = `You are Lumi's reply assistant.

Your job:
- Help the user reply naturally and respectfully.
- Generate six different reply styles.
- Use the full profile context to avoid known boundaries and personalize tone.
- Output Chinese JSON only. No Markdown, no prose outside JSON.

Safety rules:
1. Do not provide PUA, manipulation, pressure, guilt-tripping, interrogation, or cold-violence replies.
2. Respect the other person's known dislikes, boundaries, and current relationship stage.
3. If the other person seems cold or pressured, prefer low-pressure replies.
4. Do not overuse her interests mechanically. Mention them only when it feels natural.
5. The "avoidReplies" field must explain what not to say, especially if it would hit a known dislike or boundary.

追求期规则：
1. 当前产品只服务追求期互动，不默认使用亲昵称呼。
2. 不将回复慢、回复短或单次冷淡直接解释为不喜欢。
3. 邀约和推进建议必须具体、低压力，并保留拒绝空间。
4. 用户的观察只能作为辅助线索，必须使用“可能”“基于目前信息”等不确定表达。

Return exactly this JSON shape with Chinese values and all six styles:
{
  "id": "reply-${Date.now()}",
  "createdAt": "${new Date().toISOString()}",
  "simpleAnswer": "one short Chinese answer",
  "recommendedReplies": [
    { "style": "自然真诚型", "text": "reply text" },
    { "style": "轻松幽默型", "text": "reply text" },
    { "style": "稳重关心型", "text": "reply text" },
    { "style": "暧昧升温型", "text": "reply text" },
    { "style": "道歉修复型", "text": "reply text" },
    { "style": "边界尊重型", "text": "reply text" }
  ],
  "avoidReplies": ["bad reply pattern 1", "bad reply pattern 2"],
  "analysis": "brief Chinese analysis"
}`;

  const userContent = `Generate reply suggestions with this priority:
1. The other person's latest message and the user's intent.
2. Full profile context: both people's stage, communication style, user's confusion, her interests, dislikes, contact frequency, important dates, and notes.
3. Recent messages for immediate conversation tone.
4. Raw profile/questionnaire JSON only as fallback.

## Full profile context, read first
${input.profileContext || 'No structured profile context. Fall back to raw profile JSON below.'}

## Latest message from her
"${input.userMessage}"

## User intent
${input.userIntent || 'Not specified'}

## Current scene
${input.scene || 'Not specified'}

## Recent messages
${renderRecentMessages(input.recentMessages)}

## Raw user profile
${input.userProfile ? JSON.stringify(input.userProfile, null, 2) : 'None'}

## Raw girl profile
${input.girlProfile ? JSON.stringify(input.girlProfile, null, 2) : 'None'}

## Male questionnaire
${input.maleQuestionnaire ? JSON.stringify(input.maleQuestionnaire, null, 2) : 'None'}

## Female observation questionnaire
${input.femaleQuestionnaire ? JSON.stringify(input.femaleQuestionnaire, null, 2) : 'None'}

Generate exactly these six styles: ${replyStyles.join('、')}. Keep replies concise, natural, and usable for chat copy-paste.`;

  return [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userContent },
  ];
}
