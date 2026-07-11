import { describe, expect, it } from 'vitest';
import { evaluatePursuitSelfAssessment, pursuitSelfQuestions } from './pursuitSelfQuestions';

describe('evaluatePursuitSelfAssessment', () => {
  it('turns respectful answers into strengths and practical focus areas', () => {
    const answers = Object.fromEntries(
      pursuitSelfQuestions.map((question) => [question.id, question.options[0].id]),
    );

    const result = evaluatePursuitSelfAssessment(answers);

    expect(result.needsPause).toBe(false);
    expect(result.strengths.length).toBeGreaterThan(0);
    expect(result.practiceSuggestions.length).toBeGreaterThan(0);
  });

  it('flags repeated pressure or ignored boundaries as a reason to pause', () => {
    const answers = Object.fromEntries(
      pursuitSelfQuestions.map((question) => [question.id, question.options[0].id]),
    );
    answers['ps4'] = 'continue-after-no';

    const result = evaluatePursuitSelfAssessment(answers);

    expect(result.needsPause).toBe(true);
    expect(result.pauseMessage).toContain('暂停推进');
  });
});
