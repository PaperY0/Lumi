import type { RelationshipStageValue } from '@/lib/relationshipStage';
import type { LoveGuideArticle } from '@/types/loveGuide';
import { normalizeRelationshipStage } from '@/lib/relationshipStage';

export type LoveGuideArticleWithStage = LoveGuideArticle & {
  stage?: RelationshipStageValue;
};

export const loveGuideStageGroups = [
  { key: 'foundation', label: '通用基础', status: '始终可见', disabled: false },
  { key: 'observing', label: '初识接触期', status: '当前阶段', disabled: false },
  { key: 'warming', label: '升温期', status: '当前阶段', disabled: false },
  { key: 'ambiguous', label: '暧昧观察期', status: '当前阶段', disabled: false },
  { key: 'dating', label: '未来恋爱期', status: '即将开放', disabled: true },
] as const;

export function isLoveGuideArticleVisible(
  article: LoveGuideArticleWithStage,
  currentStage: RelationshipStageValue,
): boolean {
  return !article.stage || normalizeRelationshipStage(article.stage) === normalizeRelationshipStage(currentStage);
}

export function filterLoveGuideArticlesByStage<T extends LoveGuideArticleWithStage>(
  articles: T[],
  currentStage: RelationshipStageValue,
): T[] {
  return articles.filter((article) => isLoveGuideArticleVisible(article, currentStage));
}
