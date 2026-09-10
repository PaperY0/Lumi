import { describe, expect, it } from 'vitest';
import { curatedZhihuArticles, zhihuCategories } from './zhihuCuratedArticles';

describe('Zhihu curated relationship library', () => {
  it('has three reviewed articles in every category', () => {
    expect(zhihuCategories).toHaveLength(7);
    for (const category of zhihuCategories) {
      expect(curatedZhihuArticles.filter((item) => item.category === category.key)).toHaveLength(3);
    }
  });

  it('keeps external sources distinct from Lumi commentary', () => {
    for (const item of curatedZhihuArticles) {
      expect(item.url).toMatch(/^https:\/\/(www\.)?zhihu\.com|^https:\/\/zhuanlan\.zhihu\.com/);
      expect(item.lumiReason.length).toBeGreaterThan(12);
    }
  });
});
