export type StageAssessmentAudience = 'self' | 'observation' | 'relationship';
export type StageAssessmentPage = 'pursuit-observation-assessment' | 'pursuit-relationship-assessment';

export function getNextStageAssessment(audience: 'self' | 'observation'): StageAssessmentPage;
export function getNextStageAssessment(audience: 'relationship'): null;
export function getNextStageAssessment(audience: StageAssessmentAudience): StageAssessmentPage | null {
  if (audience === 'self') return 'pursuit-observation-assessment';
  if (audience === 'observation') return 'pursuit-relationship-assessment';
  return null;
}
