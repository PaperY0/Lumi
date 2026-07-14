import type { GirlProfile, UserProfile } from '@/types';

export type RelationshipStageLabel = '初识接触期' | '升温期' | '暧昧观察期';
/** `pursuing` remains readable for old IndexedDB records, but is no longer selectable. */
export type RelationshipStageValue = 'observing' | 'pursuing' | 'ambiguous' | 'warming';

export function normalizeRelationshipStage(value: GirlProfile['currentStage']): Exclude<RelationshipStageValue, 'pursuing'> {
  if (value === 'dating') return 'warming';
  if (value === 'pursuing' || value === 'stranger') return 'observing';
  return value;
}

export const relationshipStageOptions: ReadonlyArray<{
  label: RelationshipStageLabel;
  value: RelationshipStageValue;
}> = [
  { label: '初识接触期', value: 'observing' },
  { label: '升温期', value: 'warming' },
  { label: '暧昧观察期', value: 'ambiguous' },
];

const labelByValue: Record<GirlProfile['currentStage'], RelationshipStageLabel> = {
  stranger: '初识接触期',
  observing: '初识接触期',
  pursuing: '初识接触期',
  warming: '升温期',
  ambiguous: '暧昧观察期',
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

export function getRelationshipStageDisplay(profile: Pick<GirlProfile, 'currentStage' | 'currentStageLabel'>): string {
  return `当前处于追求期 · ${getRelationshipStageLabel(profile)}`;
}

export function getRelationshipStageValue(label: RelationshipStageLabel): RelationshipStageValue {
  return valueByLabel[label];
}

export function getUserRelationshipStatus(label: RelationshipStageLabel): UserProfile['relationshipStatus'] {
  return userStatusByStage[getRelationshipStageValue(label)];
}
