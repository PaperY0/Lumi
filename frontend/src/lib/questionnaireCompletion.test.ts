import { describe, expect, it } from 'vitest';
import { getQuestionnaireAction, getQuestionnaireCompletionState } from './questionnaireCompletion';

describe('getQuestionnaireCompletionState', () => {
  it('marks the three stage questionnaires independently', () => {
    const state = getQuestionnaireCompletionState({
      maleCompleted: true,
      femaleCompleted: false,
      stageResults: [
        { relationshipStage: 'observing', audience: 'self' },
        { relationshipStage: 'observing', audience: 'relationship' },
      ],
      currentStage: 'observing',
    });

    expect(state.male).toBe(true);
    expect(state.female).toBe(false);
    expect(state.stage.self).toBe(true);
    expect(state.stage.observation).toBe(false);
    expect(state.stage.relationship).toBe(true);
  });

  it('treats legacy pursuing results as initial-contact completion', () => {
    const state = getQuestionnaireCompletionState({
      maleCompleted: false,
      femaleCompleted: false,
      stageResults: [{ relationshipStage: 'pursuing', audience: 'observation' }],
      currentStage: 'observing',
    });

    expect(state.stage.observation).toBe(true);
  });
});

describe('getQuestionnaireAction', () => {
  it('returns start for incomplete questionnaires', () => {
    expect(getQuestionnaireAction({ completed: false, isReturningUser: false })).toBe('start');
    expect(getQuestionnaireAction({ completed: false, isReturningUser: true })).toBe('start');
  });

  it('uses completed for a new user and rewrite for a returning user', () => {
    expect(getQuestionnaireAction({ completed: true, isReturningUser: false })).toBe('completed');
    expect(getQuestionnaireAction({ completed: true, isReturningUser: true })).toBe('rewrite');
  });
});
