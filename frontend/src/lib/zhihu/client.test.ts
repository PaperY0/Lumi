import { afterEach, describe, expect, it, vi } from 'vitest';
import { ZhihuClientError, searchZhihu } from './client';

describe('searchZhihu', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('URL-encodes a Chinese query and returns public search data', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({
      success: true,
      data: { hasMore: false, searchHashId: 'hash', items: [] },
    }), { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);

    await expect(searchZhihu({ query: '爱情与交流', count: 5 })).resolves.toEqual({
      hasMore: false,
      searchHashId: 'hash',
      items: [],
    });
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('query=%E7%88%B1%E6%83%85%E4%B8%8E%E4%BA%A4%E6%B5%81'),
      expect.objectContaining({ method: 'GET' }),
    );
  });

  it('maps a rate-limit response to a displayable Chinese error', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({
      success: false,
      error: 'ZHIHU_RATE_LIMITED',
      message: '知乎搜索过于频繁，请稍后再试',
    }), { status: 429 })));

    await expect(searchZhihu({ query: '情侣沟通' })).rejects.toMatchObject({
      name: 'ZhihuClientError',
      status: 429,
      message: '知乎搜索过于频繁，请稍后再试',
    } satisfies Partial<ZhihuClientError>);
  });
});
