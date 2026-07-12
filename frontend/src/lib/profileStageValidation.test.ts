import { describe, expect, it } from 'vitest';
import { hasRequiredRelationshipStage } from './profileStageValidation';

describe('hasRequiredRelationshipStage', () => {
  it('requires one selected relationship stage before saving', () => {
    expect(hasRequiredRelationshipStage([])).toBe(false);
    expect(hasRequiredRelationshipStage(['初识接触期'])).toBe(true);
  });
});
