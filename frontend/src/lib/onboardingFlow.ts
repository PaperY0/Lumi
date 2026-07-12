export type OnboardingDestination =
  | 'onboarding'
  | 'profile'
  | 'male-questionnaire'
  | 'female-questionnaire'
  | 'stage-questionnaires'
  | 'dashboard';

export interface OnboardingProgress {
  hasUser: boolean;
  hasGirl: boolean;
  hasMaleQuestionnaire: boolean;
  hasFemaleQuestionnaire: boolean;
  onboardingCompleted: boolean;
}

export function resolveOnboardingDestination(progress: OnboardingProgress): OnboardingDestination {
  if (progress.onboardingCompleted && progress.hasUser) return 'dashboard';
  if (!progress.hasUser) return 'onboarding';
  if (!progress.hasGirl) return 'profile';
  if (!progress.hasMaleQuestionnaire) return 'male-questionnaire';
  if (!progress.hasFemaleQuestionnaire) return 'female-questionnaire';
  return 'stage-questionnaires';
}
