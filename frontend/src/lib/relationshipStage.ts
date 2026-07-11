import type { GirlProfile, UserProfile } from '@/types';

export type RelationshipStageLabel = '初识接触期' | '追求期' | '暧昧观察期' | '升温期';
export type RelationshipStageValue = 'observing' | 'pursuing' | 'ambiguous' | 'warming';

export const relationshipStageOptions: ReadonlyArray<{
  label: RelationshipStageLabel;
  value: RelationshipStageValue;
}> = [
  { label: '初识接触期', value: 'observing' },
  { label: '追求期', value: 'pursuing' },
  { label: '暧昧观察期', value: 'ambiguous' },
  { label: '升温期', value: 'warming' },
];

const labelByValue: Record<GirlProfile['currentStage'], RelationshipStageLabel> = {
  stranger: '初识接触期',
  observing: '初识接触期',
  pursuing: '追求期',
  ambiguous: '暧昧观察期',
  warming: '升温期',
  dating: '升温期',
};

const valueByLabel = Object.fromEntries(
  relationshipStageOptions.map((option) => [option.label, option.value]),
) as Record<RelationshipStageLabel, RelationshipStageValue>;

const userStatusByStage: Record<RelationshipStageValue, UserProfile['relationshipStatus']> = {
  observing: 'single',
  pursuing: 'pursuing',
  ambiguous: 'ambiguous',
  warming: 'dating',
};

export function getRelationshipStageLabel(profile: Pick<GirlProfile, 'currentStage' | 'currentStageLabel'>): RelationshipStageLabel {
  if (profile.currentStageLabel && profile.currentStageLabel in valueByLabel) {
    return profile.currentStageLabel as RelationshipStageLabel;
  }

  return labelByValue[profile.currentStage];
}

export function getRelationshipStageValue(label: RelationshipStageLabel): RelationshipStageValue {
  return valueByLabel[label];
}

export function getUserRelationshipStatus(label: RelationshipStageLabel): UserProfile['relationshipStatus'] {
  return userStatusByStage[getRelationshipStageValue(label)];
}
