import { describe, expect, it } from 'vitest';
import { initialContactSelfQuestions } from './initialContactSelfQuestions';
import { initialContactObservationQuestions } from './initialContactObservationQuestions';
import { initialContactRelationshipQuestions } from './initialContactRelationshipQuestions';

describe('初识接触期专项题库', () => {
  it('has three separate behavior-focused question sets', () => {
    expect(initialContactSelfQuestions.length).toBeGreaterThanOrEqual(8);
    expect(initialContactObservationQuestions.length).toBeGreaterThanOrEqual(8);
    expect(initialContactRelationshipQuestions.length).toBeGreaterThanOrEqual(8);
    expect(initialContactObservationQuestions.every((q) => q.options.some((option) => option.id === 'not-sure'))).toBe(true);
  });
});
