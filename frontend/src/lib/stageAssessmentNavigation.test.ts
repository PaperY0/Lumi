import { describe, expect, it } from 'vitest';
import { getNextStageAssessment } from './stageAssessmentNavigation';

describe('getNextStageAssessment', () => {
  it('moves from self reflection to interaction observation', () => {
    expect(getNextStageAssessment('self')).toBe('pursuit-observation-assessment');
  });

  it('moves from interaction observation to rhythm and boundaries', () => {
    expect(getNextStageAssessment('observation')).toBe('pursuit-relationship-assessment');
  });

  it('has no questionnaire after rhythm and boundaries', () => {
    expect(getNextStageAssessment('relationship')).toBeNull();
  });
});
