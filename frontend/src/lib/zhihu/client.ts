import { AI_API_BASE } from '../ai/config';
import type { ZhihuSearchData, ZhihuSearchRequest } from '@/types';

interface ZhihuSearchApiResponse {
  success: boolean;
  data?: ZhihuSearchData;
  error?: string;
  message?: string;
}

export class ZhihuClientError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly code?: string,
  ) {
    super(message);
    this.name = 'ZhihuClientError';
  }
}

const REQUEST_TIMEOUT_MS = 20_000;

function errorMessageFor(status: number, response: ZhihuSearchApiResponse): string {
  if (status === 400) return '搜索词不符合要求，请调整后重试';
  if (status === 401 || status === 403) return '知乎服务授权失败，请稍后再试';
  if (status === 429) return response.message || '知乎搜索过于频繁，请稍后再试';
  if (status >= 500) return '知乎内容暂时不可用，请稍后再试';
  return response.message || '知乎内容请求失败，请稍后重试';
}

export async function searchZhihu(input: ZhihuSearchRequest): Promise<ZhihuSearchData> {
  const params = new URLSearchParams({ query: input.query });
  if (input.count !== undefined) params.set('count', String(input.count));
  if (input.sortBy) params.set('sortBy', input.sortBy);

  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(`${AI_API_BASE}/api/zhihu/search?${params.toString()}`, {
      method: 'GET',
      signal: controller.signal,
    });
    const payload = await response.json().catch(() => ({})) as ZhihuSearchApiResponse;

    if (!response.ok || !payload.success || !payload.data) {
      throw new ZhihuClientError(response.status, errorMessageFor(response.status, payload), payload.error);
    }

    return payload.data;
  } catch (error) {
    if (error instanceof ZhihuClientError) throw error;
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new ZhihuClientError(408, '知乎内容请求超时，请稍后重试');
    }
    throw new ZhihuClientError(0, '网络连接失败，请检查后端服务是否启动');
  } finally {
    window.clearTimeout(timeoutId);
  }
}
