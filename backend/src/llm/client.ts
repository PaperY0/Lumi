/**
 * LLM 客户端 - 负责调用 DeepSeek API
 * 支持 mock 模式，当环境变量未配置或 MOCK_MODE=true 时抛出错误由上层处理
 */

import OpenAI from 'openai';

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
 * @throws {Error} 当 MOCK_MODE 启用或未配置 API Key 时抛出 'MOCK_MODE' 错误
 */
export async function callLLM(
  messages: LLMMessage[],
  options: CallLLMOptions = {}
): Promise<any> {
  // 检查是否应该使用 mock 模式
  if (process.env.MOCK_MODE === 'true' || !process.env.DEEPSEEK_API_KEY) {
    throw new Error('MOCK_MODE');
  }

  try {
    // 初始化 OpenAI 客户端（使用 DeepSeek 的兼容端点）
    const client = new OpenAI({
      apiKey: process.env.DEEPSEEK_API_KEY,
      baseURL: 'https://api.deepseek.com/v1',
    });

    // 调用聊天完成接口
    const response = await client.chat.completions.create({
      model: 'deepseek-chat',
      messages: messages as any,
      response_format: { type: 'json_object' },
      temperature: options.temperature ?? 0.7,
      max_tokens: options.maxTokens,
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
      throw new Error(`DeepSeek API 错误: ${error.message}`);
    }
    throw error;
  }
}
