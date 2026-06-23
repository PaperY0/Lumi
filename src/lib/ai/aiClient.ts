/**
 * AI 服务客户端
 * 统一封装所有 AI 接口调用，包含超时控制和错误处理
 */

import { AI_API_BASE } from './config';
import type {
  PortraitRequest,
  PortraitResponse,
  AnalyzeRequest,
  AnalyzeResponse,
  ReplyRequest,
  ReplyResponse,
  SimulateRequest,
  SimulateResponse,
} from '@/types';

/**
 * AI 请求错误类
 * 携带 HTTP 状态码和错误消息
 */
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

/**
 * 内部通用 POST 请求函数
 * 包含 30 秒超时控制
 */
async function postJson<T>(path: string, body: any): Promise<T> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 秒超时

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
      const errorBody = await response.json().catch(() => ({}));
      throw new AIRequestError(
        response.status,
        errorBody.error || `请求失败 (${response.status})`,
        errorBody
      );
    }

    return await response.json();
  } catch (error: any) {
    clearTimeout(timeoutId);

    // 处理超时错误
    if (error.name === 'AbortError') {
      throw new AIRequestError(408, '请求超时，请稍后重试');
    }

    // 处理网络错误
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new AIRequestError(0, '网络连接失败，请检查后端服务是否启动');
    }

    // 其他错误直接抛出
    throw error;
  }
}

/**
 * AI 客户端对象
 * 提供 4 个核心接口方法
 */
export const aiClient = {
  /**
   * 生成关系画像
   */
  async generatePortrait(input: PortraitRequest): Promise<PortraitResponse> {
    return postJson<PortraitResponse>('/api/portrait', input);
  },

  /**
   * 分析聊天会话
   */
  async analyzeChat(input: AnalyzeRequest): Promise<AnalyzeResponse> {
    return postJson<AnalyzeResponse>('/api/analyze', input);
  },

  /**
   * 生成回复建议
   */
  async generateReply(input: ReplyRequest): Promise<ReplyResponse> {
    return postJson<ReplyResponse>('/api/reply', input);
  },

  /**
   * 模拟对话
   */
  async simulateChat(input: SimulateRequest): Promise<SimulateResponse> {
    return postJson<SimulateResponse>('/api/simulate', input);
  },
};
