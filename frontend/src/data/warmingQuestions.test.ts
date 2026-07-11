import { describe, expect, it } from 'vitest';
import { warmingSelfQuestions } from './warmingSelfQuestions';
import { warmingObservationQuestions } from './warmingObservationQuestions';
import { warmingRelationshipQuestions } from './warmingRelationshipQuestions';

describe('升温期专项题库', () => {
  it('contains three independent behavior-focused sets', () => {
    expect(warmingSelfQuestions).toHaveLength(8);
    expect(warmingObservationQuestions).toHaveLength(8);
    expect(warmingRelationshipQuestions).toHaveLength(8);
    expect(warmingObservationQuestions.every((q) => q.options.some((option) => option.id === 'not-sure'))).toBe(true);
  });
});
