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
    expect(resolveOnboardingDestination({ hasUser: true, hasGirl: true, hasMaleQuestionnaire: true, hasFemaleQuestionnaire: true, onboardingCompleted: true })).toBe('dashboard');
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
