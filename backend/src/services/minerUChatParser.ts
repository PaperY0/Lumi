import { callLLM } from '../llm/client.js';
import { mockMinerUChatParse } from '../llm/mock.js';
import { buildMinerUChatPrompt } from '../prompts/minerUChat.js';
import { MinerUParseResponseSchema } from '../schemas/index.js';

export interface ParsedMinerUChat {
  originalMarkdown: string;
  rawText: string;
  messages: Array<{
    id: string;
    rawText: string;
    cleanedText: string;
    role: 'A' | 'B';
    confidence?: number;
    reason?: string;
  }>;
  warnings: string[];
  removedNoiseCount?: number;
}

export async function parseMinerUChatMarkdown(originalMarkdown: string): Promise<ParsedMinerUChat> {
  const mockMode = process.env.MOCK_MODE === 'true' || !process.env.DEEPSEEK_API_KEY;
  let result: any;

  if (mockMode) {
    result = mockMinerUChatParse({ originalMarkdown });
  } else {
    try {
      const messages = buildMinerUChatPrompt({ originalMarkdown });
      const raw = await callLLM(messages);
      result = MinerUParseResponseSchema.parse(raw);
    } catch {
      result = mockMinerUChatParse({ originalMarkdown });
    }
  }

  const messagesWithId = (result.messages || []).map((message: any, index: number) => ({
    ...message,
    id: message.id || `mineru-${Date.now()}-${index}`,
  }));

  return {
    originalMarkdown,
    rawText: result.rawText || '',
    messages: messagesWithId,
    warnings: result.warnings || [],
    removedNoiseCount: result.removedNoiseCount,
  };
}
