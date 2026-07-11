import type { RelationshipStageValue } from '@/lib/relationshipStage';
import type { LoveGuideArticle } from '@/types/loveGuide';

export type LoveGuideArticleWithStage = LoveGuideArticle & {
  stage?: RelationshipStageValue;
};

export function isLoveGuideArticleVisible(
  article: LoveGuideArticleWithStage,
  currentStage: RelationshipStageValue,
): boolean {
  return !article.stage || article.stage === currentStage;
}

export function filterLoveGuideArticlesByStage<T extends LoveGuideArticleWithStage>(
  articles: T[],
  currentStage: RelationshipStageValue,
): T[] {
  return articles.filter((article) => isLoveGuideArticleVisible(article, currentStage));
}
