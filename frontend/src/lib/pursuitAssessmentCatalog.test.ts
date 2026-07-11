import { describe, expect, it } from 'vitest';
import { getStageAssessmentCatalog } from './pursuitAssessmentCatalog';

describe('getStageAssessmentCatalog', () => {
  it('offers three clearly separated assessments for the pursuit stage', () => {
    const catalog = getStageAssessmentCatalog('pursuing');

    expect(catalog.available).toBe(true);
    expect(catalog.items.map((item) => item.audience)).toEqual([
      'self',
      'observation',
      'relationship',
    ]);
  });

  it('does not present unfinished assessments as available for other stages', () => {
    const catalog = getStageAssessmentCatalog('ambiguous');

    expect(catalog.available).toBe(false);
    expect(catalog.items).toEqual([]);
  });
});
