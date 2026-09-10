import type { CuratedZhihuArticle, LoveGuideArticle, LoveGuideCategory, ZhihuCategory } from '@/types';

const ZHIHU_CATEGORY_BY_LOVE_GUIDE: Record<LoveGuideCategory, ZhihuCategory> = {
  chat: 'communication',
  date: 'interestConnection',
  confession: 'action',
  conflict: 'repair',
  relationship: 'communication',
  selfGrowth: 'science',
};

export interface LoveCodeZhihuReadings {
  items: CuratedZhihuArticle[];
  reason: string;
}

export function getLoveCodeZhihuReadings(
  article: Pick<LoveGuideArticle, 'category' | 'tags' | 'stage'>,
  articles: readonly CuratedZhihuArticle[],
): LoveCodeZhihuReadings {
  const category = ZHIHU_CATEGORY_BY_LOVE_GUIDE[article.category];
  const ranked = articles
    .map((item, index) => {
      const sharedTags = item.tags.filter((tag) => article.tags.includes(tag));
      const stageMatch = Boolean(article.stage && item.stages.includes(article.stage));
      return { item, index, sharedTags, stageMatch };
    })
    .filter(({ item }) => item.category === category)
    .sort((a, b) => (
      b.sharedTags.length - a.sharedTags.length
      || Number(b.stageMatch) - Number(a.stageMatch)
      || a.index - b.index
    ))
    .slice(0, 2);

  const directMatch = ranked.find(({ sharedTags, stageMatch }) => sharedTags.length > 0 || stageMatch);
  const reason = directMatch
    ? `这篇法典关注${directMatch.sharedTags.length > 0 ? `「${directMatch.sharedTags.join('、')}」` : '当前关系阶段'}，因此优先推荐相近的知乎内容。`
    : '这两篇内容与当前法典属于同一关系主题，可作为延伸讨论。';

  return { items: ranked.map(({ item }) => item), reason };
}
