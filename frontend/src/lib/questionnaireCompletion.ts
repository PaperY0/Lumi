import type { StageQuestionnaireAudience } from '@/types';
import type { RelationshipStageValue } from './relationshipStage';

export interface StageQuestionnaireCompletionRecord {
  relationshipStage: RelationshipStageValue;
  audience: StageQuestionnaireAudience;
}

export interface QuestionnaireCompletionInput {
  maleCompleted: boolean;
  femaleCompleted: boolean;
  stageResults: StageQuestionnaireCompletionRecord[];
  currentStage: RelationshipStageValue;
}

export interface QuestionnaireCompletionState {
  male: boolean;
  female: boolean;
  stage: Record<StageQuestionnaireAudience, boolean>;
}

export function getQuestionnaireCompletionState({
  maleCompleted,
  femaleCompleted,
  stageResults,
  currentStage,
}: QuestionnaireCompletionInput): QuestionnaireCompletionState {
  const stage: Record<StageQuestionnaireAudience, boolean> = {
    self: false,
    observation: false,
    relationship: false,
  };

  for (const result of stageResults) {
    const isCurrentStage = result.relationshipStage === currentStage
      || (currentStage === 'observing' && result.relationshipStage === 'pursuing');
    if (isCurrentStage) stage[result.audience] = true;
  }

  return { male: maleCompleted, female: femaleCompleted, stage };
}
