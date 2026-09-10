import { describe, expect, it } from 'vitest';
import type { CuratedZhihuArticle, LoveGuideArticle } from '@/types';
import { getLoveCodeZhihuReadings } from './loveCodeRecommendations';

const article: LoveGuideArticle = {
  id: 'guide-1', category: 'conflict', title: '冲突后如何修复', subtitle: '', summary: '', content: '',
  tags: ['争吵', '修复'], readTimeMinutes: 3, difficulty: '入门', stage: 'ambiguous',
};

function reading(id: string, tags: string[], stages: string[]): CuratedZhihuArticle {
  return {
    id, zhihuContentId: id, category: 'repair', title: id, summary: '', contentType: 'Answer',
    authorName: '', voteUpCount: 0, commentCount: 0, url: `https://www.zhihu.com/question/${id}`,
    tags, lumiReason: '', stages,
  };
}

const readings = [
  reading('same-tags-stage', ['争吵', '修复'], ['ambiguous']),
  reading('same-tag', ['修复'], ['warming']),
  reading('stage-tiebreaker', ['修复'], ['ambiguous']),
  reading('fallback', ['道歉'], ['relationship']),
];

describe('getLoveCodeZhihuReadings', () => {
  it('prioritizes shared tags and then matching relationship stage', () => {
    expect(getLoveCodeZhihuReadings(article, readings).items.map((item) => item.id))
      .toEqual(['same-tags-stage', 'stage-tiebreaker']);
  });

  it('falls back to same-category readings and explains the fallback', () => {
    const result = getLoveCodeZhihuReadings({ ...article, tags: [], stage: undefined }, readings);

    expect(result.items.map((item) => item.id)).toEqual(['same-tags-stage', 'same-tag']);
    expect(result.reason).toMatch(/同一关系主题/);
  });
});
