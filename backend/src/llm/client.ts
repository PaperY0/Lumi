/**
 * LLM 客户端 - 负责调用 DeepSeek API
 * 仅显式 MOCK_MODE=true 启用演示模式；缺少 Key 或上游失败必须作为错误呈现。
 */

import OpenAI from 'openai';

export class LLMProviderError extends Error {
  constructor(
    message: string,
    public readonly providerStatus?: number,
    public readonly providerCode?: string,
  ) {
    super(message);
    this.name = 'LLMProviderError';
  }
}

export function getPublicLLMError(error: unknown) {
  if (error instanceof LLMProviderError) {
    return {
      error: 'DEEPSEEK_REQUEST_FAILED',
      providerStatus: error.providerStatus,
      providerCode: error.providerCode,
      message: error.providerStatus === 401
        ? 'AI 服务鉴权失败：请管理员检查 Render 中的 DEEPSEEK_API_KEY'
        : error.providerStatus === 402
          ? 'AI 服务余额不足：请管理员检查 DeepSeek 账户余额'
          : 'AI 服务暂时不可用，请稍后重试',
    };
  }

  return { error: 'AI_RESPONSE_INVALID', message: 'AI 返回内容无法解析，请重试' };
}

export interface LLMMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface CallLLMOptions {
  temperature?: number;
  maxTokens?: number;
}

/**
 * 调用 DeepSeek API
 * @throws {Error} 显式演示模式抛出 MOCK_MODE；鉴权问题抛出 LLMProviderError。
 */
export async function callLLM(
  messages: LLMMessage[],
  options: CallLLMOptions = {}
): Promise<any> {
  // 检查是否应该使用 mock 模式
  const apiKey = process.env.DEEPSEEK_API_KEY?.trim();
  if (process.env.MOCK_MODE === 'true') {
    throw new Error('MOCK_MODE');
  }
  if (!apiKey) {
    throw new LLMProviderError('DeepSeek API key is missing', 401, 'api_key_missing');
  }

  try {
    // 初始化 OpenAI 客户端（使用 DeepSeek 的兼容端点）
    const client = new OpenAI({
      apiKey,
      baseURL: 'https://api.deepseek.com/v1',
    });

    // 调用聊天完成接口
    // deepseek-v4-flash 默认开启思考模式，推理过程会写入 reasoning_content 并占用
    // completion token 预算；不显式关闭思考模式时，长回复容易把 content 挤空或截断。
    // 显式禁用思考模式，确保 content 字段直接是可解析的最终 JSON。
    const response = await client.chat.completions.create({
      model: 'deepseek-v4-flash',
      messages: messages as any,
      response_format: { type: 'json_object' },
      temperature: options.temperature ?? 0.7,
      max_tokens: options.maxTokens,
      ...({ thinking: { type: 'disabled' } } as any),
    });

    // 提取并解析 JSON 响应
    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('LLM 返回内容为空');
    }

    return JSON.parse(content);
  } catch (error: any) {
    // 如果是 API 错误，包装后抛出
    if (error.name === 'APIError' || error.status) {
      throw new LLMProviderError(
        'DeepSeek API request failed',
        typeof error.status === 'number' ? error.status : undefined,
        typeof error.code === 'string' ? error.code : undefined,
      );
    }
    throw error;
  }
}
