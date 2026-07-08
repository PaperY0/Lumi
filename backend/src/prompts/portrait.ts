import type { LLMMessage } from '../llm/client.js';

export interface PortraitInput {
  userProfile?: Record<string, any>;
  girlProfile?: Record<string, any>;
  userQuestionnaire?: Record<string, any>;
  girlQuestionnaire?: Record<string, any>;
  profileContext?: string;
  chatHistory?: Array<{ role: string; content: string; timestamp?: string }>;
}

const MAX_PROMPT_CHAT_MESSAGES = 40;

export function buildPortraitPrompt(input: PortraitInput): LLMMessage[] {
  const systemPrompt = `You are Lumi's relationship portrait analyst.

Your job:
- Help the user understand his communication pattern.
- Infer the other person's current interaction state carefully.
- Use relationship data as contextual evidence, never as absolute truth.
- Output Chinese JSON only. No Markdown, no prose outside JSON.

Safety rules:
1. Do not provide PUA, manipulation, pressure, interrogation, cold-violence, or boundary-crossing strategies.
2. Do not say she definitely likes or dislikes the user.
3. Use profile context for background, preferences, boundaries, known interests, dislikes, important dates, and current relationship setup.
4. Use questionnaires for longer-term communication tendencies.
5. Use recent chat records for current stage, heat, positive signals, and risk signals.
6. If evidence is weak or conflicting, say the signal is uncertain and recommend low-pressure, respectful next steps.

Return exactly this JSON shape with Chinese values:
{
  "maleTypeTags": ["label1", "label2"],
  "maleWeaknesses": ["weakness1", "weakness2", "weakness3"],
  "maleSuggestions": ["suggestion1", "suggestion2", "suggestion3"],
  "femalePersonalityTags": ["label1", "label2"],
  "possibleStage": "current possible relationship stage",
  "interactionHeat": "cold|cool|warm|hot",
  "positiveSignals": ["signal1", "signal2"],
  "cautionSignals": ["risk1", "risk2"],
  "suggestions": ["next step1", "next step2", "next step3", "next step4"]
}`;

  const chatContext = input.chatHistory && input.chatHistory.length > 0
    ? input.chatHistory
      .slice(-MAX_PROMPT_CHAT_MESSAGES)
      .map((msg) => {
        const role = msg.role === 'user' ? 'boy' : msg.role === 'other' ? 'girl' : msg.role;
        const time = msg.timestamp ? ` ${msg.timestamp}` : '';
        return `[${role}${time}] ${msg.content}`;
      })
      .join('\n')
    : 'No recent chat record. Generate a basic portrait from profile context and questionnaires, and mention that chat evidence is insufficient.';

  const userContent = `Analyze the relationship with this priority:
1. Recent chat: current stage, heat, positive signals, risk signals.
2. Full profile context: both people's background, preferences, known boundaries, interests, dislikes, important dates, the user's confusion, and current relationship setup.
3. Questionnaires: long-term communication tendencies.

## Full profile context, read first
${input.profileContext || 'No structured profile context. Fall back to raw profile JSON below.'}

## Raw user profile
${input.userProfile ? JSON.stringify(input.userProfile, null, 2) : 'None'}

## Raw girl profile
${input.girlProfile ? JSON.stringify(input.girlProfile, null, 2) : 'None'}

## Male questionnaire
${input.userQuestionnaire ? JSON.stringify(input.userQuestionnaire, null, 2) : 'None'}

## Female observation questionnaire
${input.girlQuestionnaire ? JSON.stringify(input.girlQuestionnaire, null, 2) : 'None'}

## Recent chat, max ${MAX_PROMPT_CHAT_MESSAGES} messages
${chatContext}

Write practical Chinese advice. Avoid vague advice like "communicate more" unless it is paired with a concrete action.`;

  return [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userContent },
  ];
}
