import { describe, expect, it } from 'vitest';
import { quickStartMaleQuestionIds, quickStartMaleQuestions } from './maleQuestions';

describe('quickStartMaleQuestions', () => {
  it('contains six ordered questions from distinct core dimensions', () => {
    expect(quickStartMaleQuestions.map((question) => question.id)).toEqual([...quickStartMaleQuestionIds]);
    expect(quickStartMaleQuestions).toHaveLength(6);
    expect(new Set(quickStartMaleQuestions.map((question) => question.dimension)).size).toBe(6);
  });
});
