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
  profileComplete?: boolean;
  stageCompleted?: {
    self: boolean;
    observation: boolean;
    relationship: boolean;
  };
}

export interface OnboardingProgressInput {
  profileComplete: boolean;
  maleCompleted: boolean;
  femaleCompleted: boolean;
  stageCompleted: {
    self: boolean;
    observation: boolean;
    relationship: boolean;
  };
}

export interface OnboardingProgressSummary {
  profileComplete: boolean;
  male: boolean;
  female: boolean;
  stage: OnboardingProgressInput['stageCompleted'];
  isComplete: boolean;
}

export function getOnboardingProgress(input: OnboardingProgressInput): OnboardingProgressSummary {
  const { profileComplete, maleCompleted, femaleCompleted, stageCompleted } = input;
  const isComplete = profileComplete
    && maleCompleted
    && femaleCompleted
    && stageCompleted.self
    && stageCompleted.observation
    && stageCompleted.relationship;

  return {
    profileComplete,
    male: maleCompleted,
    female: femaleCompleted,
    stage: stageCompleted,
    isComplete,
  };
}

export function resolveOnboardingDestination(progress: OnboardingProgress): OnboardingDestination {
  if (!progress.hasUser) return 'onboarding';
  if (!(progress.profileComplete ?? progress.hasGirl)) return 'profile';
  if (!progress.hasMaleQuestionnaire) return 'male-questionnaire';
  if (!progress.hasFemaleQuestionnaire) return 'female-questionnaire';
  const stageCompleted = progress.stageCompleted;
  if (stageCompleted && !(stageCompleted.self && stageCompleted.observation && stageCompleted.relationship)) {
    return 'stage-questionnaires';
  }
  if (stageCompleted?.self && stageCompleted.observation && stageCompleted.relationship) return 'dashboard';
  return progress.onboardingCompleted ? 'dashboard' : 'stage-questionnaires';
}
