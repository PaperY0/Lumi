import { AI_API_BASE } from './config';
import type {
  PortraitRequest,
  PortraitResponse,
  AnalyzeChatRequest,
  AnalyzeResponse,
  ReplyRequest,
  ReplyResponse,
  SimulateRequest,
  SimulateResponse,
} from '@/types';
import type { MinerUParseRequest, MinerUParseResponse } from '@/types/minerUChatImport';

export class AIRequestError extends Error {
  constructor(
    public status: number,
    message: string,
    public body?: any
  ) {
    super(message);
    this.name = 'AIRequestError';
  }
}

async function postJson<T>(path: string, body: any): Promise<T> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000);

  try {
    const response = await fetch(`${AI_API_BASE}${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const responseText = await response.text().catch(() => '');
      let parsedError: any = {};
      try {
        parsedError = JSON.parse(responseText);
      } catch {
        parsedError = { message: responseText };
      }

      throw new AIRequestError(
        response.status,
        parsedError.error || parsedError.message || `请求失败 (${response.status})`,
        parsedError
      );
    }

    return await response.json();
  } catch (error: any) {
    clearTimeout(timeoutId);

    if (error.name === 'AbortError') {
      throw new AIRequestError(408, '请求超时，请稍后重试');
    }

    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new AIRequestError(0, '网络连接失败，请检查后端服务是否启动');
    }

    throw error;
  }
}

export const aiClient = {
  async generatePortrait(input: PortraitRequest): Promise<PortraitResponse> {
    return postJson<PortraitResponse>('/api/portrait', input);
  },

  async analyzeChatFull(input: AnalyzeChatRequest): Promise<AnalyzeResponse> {
    return postJson<AnalyzeResponse>('/api/analyze', input);
  },

  async generateReply(input: ReplyRequest): Promise<ReplyResponse> {
    return postJson<ReplyResponse>('/api/reply', input);
  },

  async simulate(input: SimulateRequest): Promise<SimulateResponse> {
    return postJson<SimulateResponse>('/api/simulate', input);
  },

  async parseMinerUChat(input: MinerUParseRequest): Promise<MinerUParseResponse> {
    return postJson<MinerUParseResponse>('/api/parse-mineru-chat', input);
  },
};
