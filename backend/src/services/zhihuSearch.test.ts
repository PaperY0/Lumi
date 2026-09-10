import assert from 'node:assert/strict';
import test from 'node:test';
import { ZhihuSearchResponseSchema } from '../schemas/index.js';
import { mapZhihuResponse, normalizeZhihuQuery } from './zhihuSearch.js';

test('normalizeZhihuQuery trims whitespace and rejects empty values', () => {
  assert.equal(normalizeZhihuQuery('  爱情与交流  '), '爱情与交流');
  assert.throws(() => normalizeZhihuQuery('   '), /查询关键词不能为空/);
});

test('ZhihuSearchResponseSchema rejects an item without a valid external link', () => {
  const parsed = ZhihuSearchResponseSchema.safeParse({
    success: true,
    data: {
      hasMore: false,
      searchHashId: 'search-hash-1',
      items: [{
        title: '情侣之间该怎么交流？', contentType: 'Answer', contentId: '123',
        contentText: '沟通需要先理解感受。', url: 'not-a-url', commentCount: 8,
        voteUpCount: 61, authorName: '简单心理Uni', editTime: 1710000000,
        authorityLevel: '2', rankingScore: 0.98,
      }],
    },
  });

  assert.equal(parsed.success, false);
});

test('mapZhihuResponse keeps only documented public result fields', () => {
  const result = mapZhihuResponse({
    Code: 0,
    Message: 'success',
    Data: {
      HasMore: false,
      SearchHashId: 'search-hash-1',
      Items: [
        {
          Title: '情侣之间该怎么交流？',
          ContentType: 'Answer',
          ContentID: '123',
          ContentText: '沟通需要先理解感受。',
          Url: 'https://www.zhihu.com/question/123',
          CommentCount: 8,
          VoteUpCount: 61,
          AuthorName: '简单心理Uni',
          EditTime: 1710000000,
          AuthorityLevel: '2',
          RankingScore: 0.98,
          PrivateField: 'must-not-leak',
        },
      ],
    },
  });

  assert.deepEqual(result, {
    success: true,
    data: {
      hasMore: false,
      searchHashId: 'search-hash-1',
      items: [
        {
          title: '情侣之间该怎么交流？',
          contentType: 'Answer',
          contentId: '123',
          contentText: '沟通需要先理解感受。',
          url: 'https://www.zhihu.com/question/123',
          commentCount: 8,
          voteUpCount: 61,
          authorName: '简单心理Uni',
          editTime: 1710000000,
          authorityLevel: '2',
          rankingScore: 0.98,
        },
      ],
    },
  });
});
