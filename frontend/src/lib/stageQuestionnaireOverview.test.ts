import { describe, expect, it } from 'vitest';
import { getStageCompletionCount, stageQuestionnaireRecommendation } from './stageQuestionnaireOverview';

describe('stage questionnaire overview', () => {
  it('counts only the active stage questionnaires', () => {
    expect(getStageCompletionCount({ male: true, female: true, stage: { self: true, observation: false, relationship: true } })).toBe(2);
  });

  it('exposes the recommended completion order', () => {
    expect(stageQuestionnaireRecommendation).toBe('先认识自己 → 再记录互动 → 最后检查推进边界');
  });
});
