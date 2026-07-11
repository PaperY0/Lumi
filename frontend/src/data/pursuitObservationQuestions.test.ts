import { describe, expect, it } from 'vitest';
import { evaluatePursuitObservation, pursuitObservationQuestions } from './pursuitObservationQuestions';

describe('evaluatePursuitObservation', () => {
  it('separates confirmed interaction facts from uncertain observations', () => {
    const answers = Object.fromEntries(
      pursuitObservationQuestions.map((question) => [question.id, question.options[0].id]),
    );
    answers['po2'] = 'not-sure';

    const result = evaluatePursuitObservation(answers);

    expect(result.confirmedSignals.length).toBeGreaterThan(0);
    expect(result.unknownAreas.length).toBeGreaterThan(0);
    expect(result.summary.join(' ')).not.toMatch(/喜欢你|不喜欢你/);
  });

  it('never treats a declined invitation as proof of rejection', () => {
    const result = evaluatePursuitObservation({ po8: 'polite-no' });

    expect(result.summary.join(' ')).toContain('不能仅凭一次婉拒判断');
  });

  it('describes her interaction patterns without asking for evidence sources', () => {
    expect(pursuitObservationQuestions.every((question) =>
      question.options.some((option) => option.id === 'not-sure'),
    )).toBe(true);
    expect(pursuitObservationQuestions.map((question) => question.text).join(' ')).not.toContain('判断来自哪里');
  });
});
