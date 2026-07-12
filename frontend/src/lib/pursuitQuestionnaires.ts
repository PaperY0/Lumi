import { stageQuestionnaireRepository } from '@/lib/db';
import type { StageQuestionnaireAudience, StageQuestionnaireResult } from '@/types';
import type { RelationshipStageValue } from '@/lib/relationshipStage';

const audiences: StageQuestionnaireAudience[] = ['self', 'observation', 'relationship'];

export async function loadPursuitQuestionnaires(
  userId: string,
  girlId?: string,
  relationshipStage: RelationshipStageValue = 'observing',
): Promise<StageQuestionnaireResult[]> {
  const results = await Promise.all(audiences.map(async (audience) => {
    const current = await stageQuestionnaireRepository.getLatest(userId, relationshipStage, audience, girlId);
    if (current || relationshipStage !== 'observing') return current;
    return stageQuestionnaireRepository.getLatest(userId, 'pursuing', audience, girlId);
  }));

  return results.filter((result): result is NonNullable<typeof result> => Boolean(result));
}
