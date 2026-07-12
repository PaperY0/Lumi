import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { StageQuestionnaireResult } from '@/types';

const rows = vi.hoisted(() => [] as StageQuestionnaireResult[]);

vi.mock('../database', () => ({
  db: {
    stageQuestionnaireResults: {
      put: vi.fn(async (result: StageQuestionnaireResult) => {
        rows.push(result);
      }),
      where: vi.fn(() => ({
        equals: vi.fn((userId: string) => ({
          filter: vi.fn((predicate: (result: StageQuestionnaireResult) => boolean) => ({
            toArray: vi.fn(async () => rows.filter((result) => result.userId === userId).filter(predicate)),
          })),
        })),
      })),
      clear: vi.fn(async () => {
        rows.length = 0;
      }),
    },
  },
}));

import { stageQuestionnaireRepository } from './stageQuestionnaireRepo';

const result = (id: string, girlId: string, completedAt: string): StageQuestionnaireResult => ({
  id,
  userId: 'user-1',
  girlId,
  relationshipStage: 'warming',
  audience: 'self',
  version: 1,
  answers: [],
  summary: [],
  completedAt,
});

describe('stageQuestionnaireRepository.getLatest', () => {
  beforeEach(() => {
    rows.length = 0;
  });

  it('scopes latest results to the requested girl while preserving legacy unscoped reads', async () => {
    rows.push(
      result('result-g1', 'girl-1', '2026-07-12T10:00:00.000Z'),
      result('result-g2', 'girl-2', '2026-07-12T11:00:00.000Z'),
    );

    await expect(stageQuestionnaireRepository.getLatest('user-1', 'warming', 'self', 'girl-1')).resolves.toMatchObject({ id: 'result-g1', girlId: 'girl-1' });
    await expect(stageQuestionnaireRepository.getLatest('user-1', 'warming', 'self', 'girl-2')).resolves.toMatchObject({ id: 'result-g2', girlId: 'girl-2' });
    await expect(stageQuestionnaireRepository.getLatest('user-1', 'warming', 'self')).resolves.toMatchObject({ id: 'result-g2', girlId: 'girl-2' });
  });

  it('does not attribute a result without girlId to a scoped girl', async () => {
    rows.push({ ...result('legacy', 'girl-1', '2026-07-12T12:00:00.000Z'), girlId: undefined });

    await expect(stageQuestionnaireRepository.getLatest('user-1', 'warming', 'self', 'girl-1')).resolves.toBeUndefined();
    await expect(stageQuestionnaireRepository.getLatest('user-1', 'warming', 'self')).resolves.toMatchObject({ id: 'legacy' });
  });
});
