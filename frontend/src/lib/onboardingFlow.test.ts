import { describe, expect, it } from 'vitest';
import { resolveOnboardingDestination } from './onboardingFlow';

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
