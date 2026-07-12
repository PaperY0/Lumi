import { describe, expect, it } from 'vitest';
import { ambiguousSelfQuestions } from './ambiguousSelfQuestions';
import { ambiguousObservationQuestions } from './ambiguousObservationQuestions';
import { ambiguousRelationshipQuestions } from './ambiguousRelationshipQuestions';

describe('暧昧观察期专项题库', () => {
  it('contains three independent sets with uncertainty options', () => {
    expect(ambiguousSelfQuestions).toHaveLength(8);
    expect(ambiguousObservationQuestions).toHaveLength(8);
    expect(ambiguousRelationshipQuestions).toHaveLength(8);
    expect(ambiguousObservationQuestions.every((q) => q.options.some((option) => option.id === 'not-sure'))).toBe(true);
  });
});
