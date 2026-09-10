import { Router } from 'express';
import { getRequestId, logRouteEvent } from '../middleware/security.js';
import {
  clampZhihuCount,
  normalizeZhihuQuery,
  searchZhihuContent,
  ZhihuSearchError,
  type ZhihuSearchInput,
} from '../services/zhihuSearch.js';

export class ZhihuRouteError extends Error {
  constructor(
    public readonly code: 'ZHIHU_INVALID_QUERY',
    message: string,
  ) {
    super(message);
    this.name = 'ZhihuRouteError';
  }
}

function singleQueryValue(value: unknown, field: string): string | undefined {
  if (value === undefined) {
    return undefined;
  }
  if (typeof value !== 'string') {
    throw new ZhihuRouteError('ZHIHU_INVALID_QUERY', `${field} 参数格式无效`);
  }
  return value;
}

export function parseZhihuSearchQuery(query: Record<string, unknown>): Required<Pick<ZhihuSearchInput, 'query' | 'count'>> & Pick<ZhihuSearchInput, 'sortBy'> {
  const rawQuery = singleQueryValue(query.query, 'query');
  let normalizedQuery: string;
  try {
    normalizedQuery = normalizeZhihuQuery(rawQuery || '');
  } catch {
    throw new ZhihuRouteError('ZHIHU_INVALID_QUERY', '查询关键词不能为空');
  }

  const rawCount = singleQueryValue(query.count, 'count');
  const parsedCount = rawCount === undefined ? 10 : Number(rawCount);
  if (!Number.isFinite(parsedCount)) {
    throw new ZhihuRouteError('ZHIHU_INVALID_QUERY', 'count 参数必须是数字');
  }

  const rawSortBy = singleQueryValue(query.sortBy, 'sortBy');
  const sortBy = rawSortBy?.trim() || undefined;
  if (sortBy && sortBy.length > 100) {
    throw new ZhihuRouteError('ZHIHU_INVALID_QUERY', 'sortBy 参数过长');
  }

  return {
    query: normalizedQuery,
    count: clampZhihuCount(parsedCount),
    ...(sortBy ? { sortBy } : {}),
  };
}

const router = Router();

router.get('/search', async (req, res) => {
  let input: Required<Pick<ZhihuSearchInput, 'query' | 'count'>> & Pick<ZhihuSearchInput, 'sortBy'>;
  try {
    input = parseZhihuSearchQuery(req.query as Record<string, unknown>);
  } catch (error) {
    const routeError = error instanceof ZhihuRouteError
      ? error
      : new ZhihuRouteError('ZHIHU_INVALID_QUERY', '查询参数无效');
    logRouteEvent(res, '/api/zhihu/search', 'query_invalid', { code: routeError.code });
    res.status(400).json({ success: false, error: routeError.code, message: routeError.message });
    return;
  }

  logRouteEvent(res, '/api/zhihu/search', 'request_received', {
    queryLength: input.query.length,
    count: input.count,
    hasSortBy: Boolean(input.sortBy),
  });

  try {
    const response = await searchZhihuContent(input);
    logRouteEvent(res, '/api/zhihu/search', 'response_ready', {
      requestId: getRequestId(res),
      itemCount: response.data.items.length,
      hasMore: response.data.hasMore,
    });
    res.status(200).json(response);
  } catch (error) {
    const searchError = error instanceof ZhihuSearchError
      ? error
      : new ZhihuSearchError('ZHIHU_UPSTREAM_FAILED', '知乎搜索服务暂时不可用，请稍后重试', 502);
    logRouteEvent(res, '/api/zhihu/search', 'request_failed', { code: searchError.code });
    res.status(searchError.status).json({ success: false, error: searchError.code, message: searchError.message });
  }
});

export default router;
