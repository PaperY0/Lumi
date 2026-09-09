import assert from 'node:assert/strict';
import test from 'node:test';
import { ZhihuRouteError, parseZhihuSearchQuery } from './zhihu.js';

test('parseZhihuSearchQuery rejects an empty query before upstream search', () => {
  assert.throws(
    () => parseZhihuSearchQuery({ query: '   ' }),
    (error: unknown) => error instanceof ZhihuRouteError && error.code === 'ZHIHU_INVALID_QUERY',
  );
});

test('parseZhihuSearchQuery clamps count to the documented range', () => {
  assert.deepEqual(
    parseZhihuSearchQuery({ query: '爱情与交流', count: '50', sortBy: 'VoteUpCount:desc' }),
    { query: '爱情与交流', count: 10, sortBy: 'VoteUpCount:desc' },
  );
});
