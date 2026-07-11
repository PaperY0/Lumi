import { describe, expect, it } from 'vitest';
import {
  getRelationshipStageLabel,
  getRelationshipStageValue,
  relationshipStageOptions,
} from './relationshipStage';

describe('relationshipStage', () => {
  it('defines the four user-selectable relationship stages in order', () => {
    expect(relationshipStageOptions.map((option) => option.label)).toEqual([
      '初识接触期',
      '追求期',
      '暧昧观察期',
      '升温期',
    ]);
  });

  it('keeps legacy stages readable while saving the new four-stage values', () => {
    expect(getRelationshipStageLabel({ currentStage: 'observing' })).toBe('初识接触期');
    expect(getRelationshipStageLabel({ currentStage: 'dating' })).toBe('升温期');
    expect(getRelationshipStageValue('追求期')).toBe('pursuing');
    expect(getRelationshipStageValue('升温期')).toBe('warming');
  });
});
