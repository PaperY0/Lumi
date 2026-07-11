import { stageQuestionnaireRepository } from '@/lib/db';
import type { StageQuestionnaireAudience, StageQuestionnaireResult } from '@/types';

const audiences: StageQuestionnaireAudience[] = ['self', 'observation', 'relationship'];

export async function loadPursuitQuestionnaires(userId: string): Promise<StageQuestionnaireResult[]> {
  const results = await Promise.all(audiences.map((audience) =>
    stageQuestionnaireRepository.getLatest(userId, 'pursuing', audience),
  ));

  return results.filter((result): result is NonNullable<typeof result> => Boolean(result));
}
