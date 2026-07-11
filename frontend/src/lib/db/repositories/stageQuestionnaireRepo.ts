import { v4 as uuidv4 } from 'uuid';
import type { StageQuestionnaireAudience, StageQuestionnaireResult } from '@/types';
import type { RelationshipStageValue } from '@/lib/relationshipStage';
import { db } from '../database';

export const stageQuestionnaireRepository = {
  async save(result: Partial<StageQuestionnaireResult>): Promise<StageQuestionnaireResult> {
    if (!result.userId || !result.relationshipStage || !result.audience) {
      throw new Error('保存阶段问卷失败：缺少用户、阶段或问卷类型');
    }

    const now = new Date().toISOString();
    const entity: StageQuestionnaireResult = {
      id: result.id ?? uuidv4(),
      userId: result.userId,
      girlId: result.girlId,
      relationshipStage: result.relationshipStage,
      audience: result.audience,
      version: result.version ?? 1,
      answers: result.answers ?? [],
      summary: result.summary ?? [],
      completedAt: result.completedAt ?? now,
    };

    await db.stageQuestionnaireResults.put(entity);
    return entity;
  },

  async getLatest(
    userId: string,
    relationshipStage: RelationshipStageValue,
    audience: StageQuestionnaireAudience,
  ): Promise<StageQuestionnaireResult | undefined> {
    const results = await db.stageQuestionnaireResults
      .where('userId')
      .equals(userId)
      .filter((result) => result.relationshipStage === relationshipStage && result.audience === audience)
      .toArray();

    return results.sort((a, b) => b.completedAt.localeCompare(a.completedAt))[0];
  },

  async clearAll(): Promise<void> {
    await db.stageQuestionnaireResults.clear();
  },
};
