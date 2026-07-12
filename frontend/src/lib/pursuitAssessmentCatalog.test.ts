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

  it('offers the dedicated ambiguous-observation set for the ambiguous phase', () => {
    const catalog = getStageAssessmentCatalog('ambiguous');

    expect(catalog.available).toBe(true);
    expect(catalog.items.every((item) => item.title.includes('暧昧观察期'))).toBe(true);
  });

  it('offers the dedicated initial-contact set for the initial-contact phase', () => {
    const catalog = getStageAssessmentCatalog('observing');

    expect(catalog.available).toBe(true);
    expect(catalog.items.every((item) => item.title.includes('初识接触期'))).toBe(true);
  });

  it('offers the dedicated warming set for the warming phase', () => {
    const catalog = getStageAssessmentCatalog('warming');

    expect(catalog.available).toBe(true);
    expect(catalog.items.every((item) => item.title.includes('升温期'))).toBe(true);
  });
});
