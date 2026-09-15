import { callLLM, getPublicLLMError } from '../llm/client.js';
import { buildMinerUChatPrompt } from '../prompts/minerUChat.js';
import { MinerUParseResponseSchema } from '../schemas/index.js';

export interface ParsedMinerUChat {
  originalMarkdown: string;
  rawText: string;
  messages: Array<{
    id: string;
    rawText: string;
    cleanedText: string;
    role: 'A' | 'B' | 'unknown';
    confidence?: number;
    reason?: string;
  }>;
  warnings: string[];
  removedNoiseCount?: number;
}

export function preserveMinerUText(originalMarkdown: string): ParsedMinerUChat {
  const kept = originalMarkdown.split('\n').map(line => line.trim()).filter(line =>
    line && !/^<!--.*-->$/.test(line) && !/^!\[[^\]]*\]\([^)]*\)$/.test(line) &&
    !/^<img\b/i.test(line) && !/^\[(图片|表情|动画表情)\]$/.test(line),
  );
  const messages = kept.map((line, index) => {
    const match = line.match(/^(A|B|我|她|左侧|右侧)\s*[：:]\s*(.+)$/i);
    const label = match?.[1].toUpperCase();
    const role = label === 'A' || label === '她' || label === '左侧' ? 'A'
      : label === 'B' || label === '我' || label === '右侧' ? 'B' : 'unknown';
    return { id: `mineru-${Date.now()}-${index}`, rawText: line, cleanedText: match?.[2] || line,
      role: role as 'A' | 'B' | 'unknown', confidence: label ? 0.9 : 0,
      reason: label ? '原文包含明确发言人标识，请确认' : 'Markdown 不包含可靠左右坐标，请手动选择发言人' };
  });
  return { originalMarkdown, rawText: kept.join('\n'), messages,
    warnings: ['已保留识别原文。不能仅凭图片标记上下顺序确定聊天左右，请确认每条消息的发言人。'] };
}

export async function parseMinerUChatMarkdown(originalMarkdown: string): Promise<ParsedMinerUChat> {
  const mockMode = process.env.MOCK_MODE === 'true';
  let result: any;

  if (mockMode) {
    result = preserveMinerUText(originalMarkdown);
  } else {
    try {
      const messages = buildMinerUChatPrompt({ originalMarkdown });
      const raw = await callLLM(messages);
      result = MinerUParseResponseSchema.parse(raw);
    } catch (error) {
      result = preserveMinerUText(originalMarkdown);
      result.warnings.unshift(`AI 整理未完成：${getPublicLLMError(error).message}。OCR 原文仍可手动导入。`);
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
