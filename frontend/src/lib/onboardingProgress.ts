import type { PageName } from '@/app/components/GlassUI';
import { getRelationshipStageLabel, getRelationshipStageValue, type RelationshipStageValue } from './relationshipStage';
import { getQuestionnaireCompletionState } from './questionnaireCompletion';
import {
  userProfileRepository,
  girlProfileRepository,
  questionnaireRepository,
  stageQuestionnaireRepository,
} from './db/repositories';

export interface OnboardingProgressState {
  profileComplete: boolean;
  male: boolean;
  female: boolean;
  stage: { self: boolean; observation: boolean; relationship: boolean };
  isComplete: boolean;
  isReturningUser: boolean;
  completedCount: number;
  totalCount: 6;
  percentage: number;
  girlId?: string;
  currentStage?: RelationshipStageValue;
}

export interface OnboardingChecklistInput {
  profileComplete: boolean;
  maleCompleted: boolean;
  femaleCompleted: boolean;
  stageCompleted: OnboardingProgressState['stage'];
  isReturningUser: boolean;
}

export type OnboardingChecklistKey = 'profile' | 'male' | 'female' | 'stage-self' | 'stage-observation' | 'stage-relationship';

export function getOnboardingProgressPercent(completedCount: number, totalCount = 6): number {
  if (totalCount <= 0) return 0;
  return Math.round((completedCount / totalCount) * 100);
}

export function getReturningUserState(isComplete: boolean, persistedFlag: boolean): boolean {
  return isComplete || persistedFlag;
}

export function getOnboardingChecklist(input: OnboardingChecklistInput): OnboardingProgressState {
  const stage = input.stageCompleted;
  const completedCount = [input.profileComplete, input.maleCompleted, input.femaleCompleted, stage.self, stage.observation, stage.relationship]
    .filter(Boolean).length;
  return {
    profileComplete: input.profileComplete,
    male: input.maleCompleted,
    female: input.femaleCompleted,
    stage,
    isComplete: completedCount === 6,
    isReturningUser: input.isReturningUser,
    completedCount,
    totalCount: 6,
    percentage: getOnboardingProgressPercent(completedCount),
  };
}

const pageByKey: Record<OnboardingChecklistKey, PageName> = {
  profile: 'profile',
  male: 'male-questionnaire',
  female: 'female-questionnaire',
  'stage-self': 'pursuit-self-assessment',
  'stage-observation': 'pursuit-observation-assessment',
  'stage-relationship': 'pursuit-relationship-assessment',
};

export function getOnboardingAction({ key, completed, isReturningUser }: { key: OnboardingChecklistKey; completed: boolean; isReturningUser: boolean }): { label: string; page: PageName } {
  if (key === 'profile') return { label: completed ? '修改资料' : '完善资料', page: pageByKey[key] };
  if (!completed) return { label: '开始填写', page: pageByKey[key] };
  return { label: isReturningUser ? '重新填写' : '已完成', page: pageByKey[key] };
}

export async function loadOnboardingProgress(): Promise<OnboardingProgressState> {
  const user = await userProfileRepository.getCurrent();
  if (!user) return getOnboardingChecklist({ profileComplete: false, maleCompleted: false, femaleCompleted: false, stageCompleted: { self: false, observation: false, relationship: false }, isReturningUser: false });
  const girls = await girlProfileRepository.getByUserId(user.id);
  const girl = girls[0];
  const male = await questionnaireRepository.getLatestMale(user.id);
  const female = await questionnaireRepository.getLatestFemale(user.id);
  const profileComplete = Boolean(girl && girl.nickname && girl.currentStage && girl.currentStage !== 'stranger');
  const currentStage = girl && girl.currentStage !== 'stranger' ? getRelationshipStageValue(getRelationshipStageLabel(girl)) : undefined;
  let stageCompleted = { self: false, observation: false, relationship: false };
  if (girl && currentStage) {
    const results = await Promise.all((['self', 'observation', 'relationship'] as const).map((audience) => stageQuestionnaireRepository.getLatest(user.id, currentStage, audience, girl.id)));
    const legacy = currentStage === 'observing'
      ? await Promise.all((['self', 'observation', 'relationship'] as const).map((audience) => stageQuestionnaireRepository.getLatest(user.id, 'pursuing', audience, girl.id)))
      : [];
    stageCompleted = getQuestionnaireCompletionState({ maleCompleted: Boolean(male), femaleCompleted: Boolean(female), currentStage, stageResults: [...results, ...legacy].filter(Boolean).map((result) => ({ relationshipStage: result!.relationshipStage, audience: result!.audience })).filter(Boolean) }).stage;
  }
  const state = getOnboardingChecklist({ profileComplete, maleCompleted: Boolean(male), femaleCompleted: Boolean(female), stageCompleted, isReturningUser: false });
  const persistedFlag = typeof localStorage !== 'undefined' && localStorage.getItem('onboardingCompleted') === 'true';
  state.isReturningUser = getReturningUserState(state.isComplete, persistedFlag);
  return { ...state, girlId: girl?.id, currentStage };
}
