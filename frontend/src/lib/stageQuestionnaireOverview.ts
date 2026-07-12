import type { QuestionnaireCompletionState } from './questionnaireCompletion';

export const stageQuestionnaireRecommendation = '先认识自己 → 再记录互动 → 最后检查推进边界';

export function getStageCompletionCount(completion: QuestionnaireCompletionState): number {
  return Object.values(completion.stage).filter(Boolean).length;
}
