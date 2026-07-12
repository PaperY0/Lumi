import { describe, expect, it, vi } from 'vitest';
import { stageQuestionnaireRepository } from '@/lib/db';
import { loadPursuitQuestionnaires } from './pursuitQuestionnaires';

describe('loadPursuitQuestionnaires', () => {
  it('reads the active stage and falls back to legacy pursuing for observing', async () => {
    const getLatest = vi.spyOn(stageQuestionnaireRepository, 'getLatest').mockImplementation(async (_userId, stage, audience) => {
      if (stage === 'pursuing' && audience === 'self') {
        return {
          id: 'legacy-self', userId: 'u1', relationshipStage: 'pursuing', audience,
          version: 1, answers: [], summary: ['legacy'], completedAt: '2026-01-01',
        };
      }
      return undefined;
    });

    const results = await loadPursuitQuestionnaires('u1', 'g1', 'observing');

    expect(results.map((result) => result.id)).toEqual(['legacy-self']);
    expect(getLatest).toHaveBeenCalledWith('u1', 'observing', 'self', 'g1');
    expect(getLatest).toHaveBeenCalledWith('u1', 'pursuing', 'self', 'g1');
    getLatest.mockRestore();
  });

  it('keeps warming and ambiguous results isolated', async () => {
    const getLatest = vi.spyOn(stageQuestionnaireRepository, 'getLatest').mockImplementation(async (_userId, stage, audience) => ({
      id: `${stage}-${audience}`,
      userId: 'u1', relationshipStage: stage, audience, version: 1, answers: [], summary: [], completedAt: '2026-01-01',
    }));

    const warming = await loadPursuitQuestionnaires('u1', 'g1', 'warming');
    expect(warming.every((result) => result.relationshipStage === 'warming')).toBe(true);
    expect(getLatest).not.toHaveBeenCalledWith('u1', 'pursuing', expect.anything(), 'g1');

    getLatest.mockClear();
    const ambiguous = await loadPursuitQuestionnaires('u1', 'g1', 'ambiguous');
    expect(ambiguous.every((result) => result.relationshipStage === 'ambiguous')).toBe(true);
    expect(getLatest).toHaveBeenCalledWith('u1', 'ambiguous', 'relationship', 'g1');
    getLatest.mockRestore();
  });
});
