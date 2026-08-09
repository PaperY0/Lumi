import { describe, expect, it } from 'vitest';
import { filterLoveGuideArticlesByStage, loveGuideStageGroups } from './loveGuideStage';
import type { LoveGuideArticleWithStage } from './loveGuideStage';
import { stageArticles } from '@/data/loveGuideStageArticles';

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

  it('normalizes legacy article stages while showing only foundation and current stage', () => {
    const articles = [
      { id: 'foundation', category: 'chat', title: '通用' },
      { id: 'legacy-pursuit', category: 'chat', title: '旧追求', stage: 'pursuing' },
      { id: 'warming', category: 'chat', title: '升温', stage: 'warming' },
      { id: 'ambiguous', category: 'chat', title: '暧昧', stage: 'ambiguous' },
    ] as unknown as LoveGuideArticleWithStage[];

    expect(filterLoveGuideArticlesByStage(articles, 'observing').map((article) => article.id)).toEqual(['foundation', 'legacy-pursuit']);
    expect(filterLoveGuideArticlesByStage(articles, 'warming').map((article) => article.id)).toEqual(['foundation', 'warming']);
  });

  it('exposes a disabled future dating group', () => {
    expect(loveGuideStageGroups.find((group) => group.key === 'dating')).toMatchObject({ disabled: true, label: '未来恋爱期', status: '即将开放' });
  });

  it('keeps every new article in the seven-section format', () => {
    const headings = ['适用范围', '依据原则', '可观察事实', '不要擅自推断', '风险分级', '可执行步骤', '话术示例', '停止与求助'];
    for (const article of stageArticles) {
      for (const heading of headings) expect(article.content).toContain(`## ${heading}`);
      expect(article.evidence).toMatchObject({
        principle: expect.any(String),
        evidenceBoundary: expect.any(String),
      });
      expect(article.evidence?.sources.length).toBeGreaterThan(0);
    }
  });
});
