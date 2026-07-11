import { describe, expect, it } from 'vitest';
import { evaluatePursuitRelationship, pursuitRelationshipQuestions } from './pursuitRelationshipQuestions';

describe('evaluatePursuitRelationship', () => {
  it('recognizes a respectful pace as ready to continue', () => {
    const answers = Object.fromEntries(pursuitRelationshipQuestions.map((question) => [question.id, question.options[0].id]));
    const result = evaluatePursuitRelationship(answers);

    expect(result.status).toBe('continue');
    expect(result.title).toBe('可以继续');
  });

  it('asks the user to pause when answers ignore an explicit refusal or cross privacy boundaries', () => {
    const result = evaluatePursuitRelationship({
      pr4: 'keep-persuading',
      pr8: 'check-without-permission',
    });

    expect(result.status).toBe('pause');
    expect(result.title).toBe('需要暂停复盘');
    expect(result.message).toContain('停止推进');
  });
});
