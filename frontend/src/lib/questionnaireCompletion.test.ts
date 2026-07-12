import { describe, expect, it } from 'vitest';
import { getQuestionnaireCompletionState } from './questionnaireCompletion';

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
