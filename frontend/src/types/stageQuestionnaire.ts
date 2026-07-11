import type { RelationshipStageValue } from '@/lib/relationshipStage';

export type StageQuestionnaireAudience = 'self' | 'observation' | 'relationship';

export interface StageQuestionnaireAnswer {
  questionId: string;
  optionId: string;
  evidenceLevel?: 'explicit' | 'chat' | 'observation' | 'uncertain';
}

/** 阶段化问卷结果：独立于旧男女问卷，便于逐步上线不同阶段题库。 */
export interface StageQuestionnaireResult {
  id: string;
  userId: string;
  girlId?: string;
  relationshipStage: RelationshipStageValue;
  audience: StageQuestionnaireAudience;
  version: number;
  answers: StageQuestionnaireAnswer[];
  summary: string[];
  completedAt: string;
}
