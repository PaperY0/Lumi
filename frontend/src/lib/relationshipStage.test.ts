import { describe, expect, it } from 'vitest';
import {
  getRelationshipStageLabel,
  getRelationshipStageValue,
  normalizeRelationshipStage,
  getRelationshipStageDisplay,
  relationshipStageOptions,
} from './relationshipStage';

describe('relationshipStage', () => {
  it('defines the three user-selectable pursuit phases in order', () => {
    expect(relationshipStageOptions.map((option) => option.label)).toEqual([
      '初识接触期',
      '升温期',
      '暧昧观察期',
    ]);
  });

  it('keeps legacy stages readable while saving the new three-phase values', () => {
    expect(getRelationshipStageLabel({ currentStage: 'observing' })).toBe('初识接触期');
    expect(getRelationshipStageLabel({ currentStage: 'dating' })).toBe('升温期');
    expect(getRelationshipStageValue('升温期')).toBe('warming');
    expect(getRelationshipStageValue('暧昧观察期')).toBe('ambiguous');
    expect(getRelationshipStageLabel({ currentStage: 'pursuing' })).toBe('初识接触期');
  });

  it('normalizes legacy values and exposes the pursuit umbrella display', () => {
    expect(normalizeRelationshipStage('stranger')).toBe('observing');
    expect(normalizeRelationshipStage('pursuing')).toBe('observing');
    expect(normalizeRelationshipStage('dating')).toBe('warming');
    expect(getRelationshipStageDisplay({ currentStage: 'ambiguous' })).toBe('当前处于追求期 · 暧昧观察期');
  });
});
