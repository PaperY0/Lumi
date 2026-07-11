import { describe, expect, it } from 'vitest';
import { filterLoveGuideArticlesByStage } from './loveGuideStage';
import type { LoveGuideArticleWithStage } from './loveGuideStage';

describe('love guide stage filtering', () => {
  it('keeps generic legacy articles visible for every stage', () => {
    const articles = [
      { id: 'legacy', category: 'chat', title: '旧文章' } as unknown as LoveGuideArticleWithStage,
      { id: 'pursuit', category: 'chat', title: '追求期文章', stage: 'pursuing' } as unknown as LoveGuideArticleWithStage,
      { id: 'dating', category: 'chat', title: '恋爱期文章', stage: 'warming' } as unknown as LoveGuideArticleWithStage,
    ];

    expect(filterLoveGuideArticlesByStage(articles, 'pursuing').map((article) => article.id)).toEqual([
      'legacy',
      'pursuit',
    ]);
  });
});
