const ZHIHU_SEARCH_URL = 'https://developer.zhihu.com/api/v1/content/zhihu_search';
const CACHE_TTL_MS = 10 * 60 * 1000;

export interface ZhihuSearchInput {
  query: string;
  count?: number;
  sortBy?: string;
}

export interface ZhihuSearchItem {
  title: string;
  contentType: string;
  contentId: string;
  contentText: string;
  url: string;
  commentCount: number;
  voteUpCount: number;
  authorName: string;
  editTime: number;
  authorityLevel: string;
  rankingScore: number;
}

export interface ZhihuSearchData {
  hasMore: boolean;
  searchHashId: string;
  items: ZhihuSearchItem[];
  emptyReason?: string;
}

export interface ZhihuSearchResponse {
  success: true;
  data: ZhihuSearchData;
}

interface RawZhihuItem {
  [key: string]: unknown;
  Title: string;
  ContentType: string;
  ContentID: string;
  ContentText: string;
  Url: string;
  CommentCount: number;
  VoteUpCount: number;
  AuthorName: string;
  EditTime: number;
  AuthorityLevel: string;
  RankingScore: number;
}

interface RawZhihuResponse {
  Code: number;
  Message?: string;
  Data?: {
    HasMore?: boolean;
    SearchHashId?: string;
    Items?: RawZhihuItem[];
    EmptyReason?: string;
  };
}

interface CachedSearch {
  expiresAt: number;
  response: ZhihuSearchResponse;
}

const cache = new Map<string, CachedSearch>();

export class ZhihuSearchError extends Error {
  constructor(
    public readonly code:
      | 'ZHIHU_NOT_CONFIGURED'
      | 'ZHIHU_AUTH_FAILED'
      | 'ZHIHU_RATE_LIMITED'
      | 'ZHIHU_UPSTREAM_FAILED'
      | 'ZHIHU_UPSTREAM_INVALID_RESPONSE',
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = 'ZhihuSearchError';
  }
}

export function normalizeZhihuQuery(value: string): string {
  const query = value.trim().replace(/\s+/g, ' ');
  if (!query) {
    throw new Error('查询关键词不能为空');
  }
  return query;
}

export function clampZhihuCount(value: number | undefined): number {
  if (!Number.isFinite(value)) {
    return 10;
  }
  return Math.min(10, Math.max(1, Math.trunc(value as number)));
}

export function mapZhihuResponse(raw: RawZhihuResponse): ZhihuSearchResponse {
  if (raw.Code !== 0 || !raw.Data) {
    throw new ZhihuSearchError(
      'ZHIHU_UPSTREAM_INVALID_RESPONSE',
      raw.Message || '知乎搜索返回了无效数据',
      502,
    );
  }

  const data: ZhihuSearchData = {
    hasMore: raw.Data.HasMore === true,
    searchHashId: raw.Data.SearchHashId || '',
    items: (raw.Data.Items || []).map((item) => ({
      title: item.Title,
      contentType: item.ContentType,
      contentId: item.ContentID,
      contentText: item.ContentText,
      url: item.Url,
      commentCount: item.CommentCount,
      voteUpCount: item.VoteUpCount,
      authorName: item.AuthorName,
      editTime: item.EditTime,
      authorityLevel: item.AuthorityLevel,
      rankingScore: item.RankingScore,
    })),
  };

  if (raw.Data.EmptyReason) {
    data.emptyReason = raw.Data.EmptyReason;
  }

  return { success: true, data };
}

function cacheKey(input: Required<Pick<ZhihuSearchInput, 'query' | 'count'>> & Pick<ZhihuSearchInput, 'sortBy'>): string {
  return `${input.query}\u0000${input.count}\u0000${input.sortBy || ''}`;
}

export async function searchZhihuContent(input: ZhihuSearchInput): Promise<ZhihuSearchResponse> {
  const query = normalizeZhihuQuery(input.query);
  const count = clampZhihuCount(input.count);
  const sortBy = input.sortBy?.trim() || undefined;
  const key = cacheKey({ query, count, sortBy });
  const cached = cache.get(key);

  if (cached && cached.expiresAt > Date.now()) {
    return cached.response;
  }

  const accessSecret = process.env.ZHIHU_ACCESS_SECRET?.trim();
  if (!accessSecret) {
    throw new ZhihuSearchError('ZHIHU_NOT_CONFIGURED', '知乎搜索尚未配置', 503);
  }

  const params = new URLSearchParams({ Query: query, Count: String(count) });
  if (sortBy) {
    params.set('SortBy', sortBy);
  }

  let upstream: Response;
  try {
    upstream = await fetch(`${ZHIHU_SEARCH_URL}?${params.toString()}`, {
      headers: {
        Authorization: `Bearer ${accessSecret}`,
        'X-Request-Timestamp': String(Math.floor(Date.now() / 1000)),
        'Content-Type': 'application/json',
      },
    });
  } catch {
    throw new ZhihuSearchError('ZHIHU_UPSTREAM_FAILED', '知乎搜索服务暂时不可用，请稍后重试', 502);
  }

  if (upstream.status === 401 || upstream.status === 403) {
    throw new ZhihuSearchError('ZHIHU_AUTH_FAILED', '知乎搜索鉴权失败', 502);
  }
  if (upstream.status === 429) {
    throw new ZhihuSearchError('ZHIHU_RATE_LIMITED', '知乎搜索请求过于频繁，请稍后再试', 429);
  }
  if (!upstream.ok) {
    throw new ZhihuSearchError('ZHIHU_UPSTREAM_FAILED', '知乎搜索服务暂时不可用，请稍后重试', 502);
  }

  let raw: RawZhihuResponse;
  try {
    raw = await upstream.json() as RawZhihuResponse;
  } catch {
    throw new ZhihuSearchError('ZHIHU_UPSTREAM_INVALID_RESPONSE', '知乎搜索返回了无效数据', 502);
  }

  const response = mapZhihuResponse(raw);
  cache.set(key, { response, expiresAt: Date.now() + CACHE_TTL_MS });
  return response;
}
