import { describe, expect, it } from 'vitest';
import { getOnboardingProgress, resolveOnboardingDestination } from './onboardingFlow';

describe('resolveOnboardingDestination', () => {
  it('sends a new user through profile, both questionnaires, then stage questionnaires', () => {
    expect(resolveOnboardingDestination({ hasUser: false, hasGirl: false, hasMaleQuestionnaire: false, hasFemaleQuestionnaire: false, onboardingCompleted: false })).toBe('onboarding');
    expect(resolveOnboardingDestination({ hasUser: true, hasGirl: false, hasMaleQuestionnaire: false, hasFemaleQuestionnaire: false, onboardingCompleted: false })).toBe('profile');
    expect(resolveOnboardingDestination({ hasUser: true, hasGirl: true, hasMaleQuestionnaire: false, hasFemaleQuestionnaire: false, onboardingCompleted: false })).toBe('male-questionnaire');
    expect(resolveOnboardingDestination({ hasUser: true, hasGirl: true, hasMaleQuestionnaire: true, hasFemaleQuestionnaire: false, onboardingCompleted: false })).toBe('female-questionnaire');
    expect(resolveOnboardingDestination({ hasUser: true, hasGirl: true, hasMaleQuestionnaire: true, hasFemaleQuestionnaire: true, onboardingCompleted: false })).toBe('stage-questionnaires');
  });

  it('sends a completed local user directly to the dashboard', () => {
    expect(resolveOnboardingDestination({ hasUser: true, hasGirl: true, hasMaleQuestionnaire: true, hasFemaleQuestionnaire: true, onboardingCompleted: true, profileComplete: true, stageCompleted: { self: true, observation: true, relationship: true } })).toBe('dashboard');
  });

  it.each([
    ['profile', { profileComplete: false, hasGirl: true }],
    ['male-questionnaire', { profileComplete: true, hasMaleQuestionnaire: false }],
    ['female-questionnaire', { profileComplete: true, hasMaleQuestionnaire: true, hasFemaleQuestionnaire: false }],
    ['stage-questionnaires', { profileComplete: true, hasMaleQuestionnaire: true, hasFemaleQuestionnaire: true, stageCompleted: { self: false, observation: true, relationship: true } }],
    ['stage-questionnaires', { profileComplete: true, hasMaleQuestionnaire: true, hasFemaleQuestionnaire: true, stageCompleted: { self: true, observation: false, relationship: true } }],
    ['stage-questionnaires', { profileComplete: true, hasMaleQuestionnaire: true, hasFemaleQuestionnaire: true, stageCompleted: { self: true, observation: true, relationship: false } }],
  ] as const)('routes to the first missing %s requirement even when completion flag is stale', (expected, overrides) => {
    expect(resolveOnboardingDestination({
      hasUser: true,
      hasGirl: true,
      hasMaleQuestionnaire: true,
      hasFemaleQuestionnaire: true,
      onboardingCompleted: true,
      ...overrides,
      profileComplete: overrides.profileComplete ?? true,
      stageCompleted: 'stageCompleted' in overrides
        ? overrides.stageCompleted
        : { self: true, observation: true, relationship: true },
    })).toBe(expected);
  });
});

describe('getOnboardingProgress', () => {
  const completeInput = {
    profileComplete: true,
    maleCompleted: true,
    femaleCompleted: true,
    stageCompleted: { self: true, observation: true, relationship: true },
  };

  it('requires all six onboarding requirements', () => {
    expect(getOnboardingProgress(completeInput)).toEqual({
      profileComplete: true,
      male: true,
      female: true,
      stage: { self: true, observation: true, relationship: true },
      isComplete: true,
    });

    expect(getOnboardingProgress({ ...completeInput, maleCompleted: false }).isComplete).toBe(false);
    expect(getOnboardingProgress({ ...completeInput, femaleCompleted: false }).isComplete).toBe(false);
    expect(getOnboardingProgress({ ...completeInput, profileComplete: false }).isComplete).toBe(false);
    expect(getOnboardingProgress({
      ...completeInput,
      stageCompleted: { ...completeInput.stageCompleted, self: false },
    }).isComplete).toBe(false);
    expect(getOnboardingProgress({
      ...completeInput,
      stageCompleted: { ...completeInput.stageCompleted, observation: false },
    }).isComplete).toBe(false);
    expect(getOnboardingProgress({
      ...completeInput,
      stageCompleted: { ...completeInput.stageCompleted, relationship: false },
    }).isComplete).toBe(false);
  });
});
