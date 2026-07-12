import { describe, expect, it } from 'vitest';
import { buildPursuitContext, preparePursuitProfiles } from './profileContext';

const userProfile = {
  id: 'user-1',
  nickname: '阿远',
  ageRange: '23-27' as const,
  relationshipStatus: 'pursuing' as const,
  loveExperience: 'little' as const,
  mainConfusion: '怕说错话',
  createdAt: '2026-07-11T00:00:00.000Z',
  updatedAt: '2026-07-11T00:00:00.000Z',
};

const girlProfile = {
  id: 'girl-1',
  userId: userProfile.id,
  nickname: '小林',
  ageRange: '23-27' as const,
  knownChannel: '朋友介绍',
  knownDuration: '三个月',
  currentStage: 'observing' as const,
  interactionFrequency: 'medium' as const,
  likes: ['音乐'],
  customInterests: ['看展'],
  interactionPreferences: ['文字聊天'],
  invitationExperience: 'not-yet' as const,
  observationSource: 'observation' as const,
  birthday: '2000-02-16',
  createdAt: '2026-07-11T00:00:00.000Z',
  updatedAt: '2026-07-11T00:00:00.000Z',
};

describe('buildPursuitContext', () => {
  it('uses pursuit rules and marks user observations as lower-confidence context', () => {
    const context = buildPursuitContext({ userProfile, girlProfile });

    expect(context.mode).toBe('pursuit');
    expect(context.summary).toContain('当前模式：追求期');
    expect(context.summary).toContain('看展');
    expect(context.summary).toContain('补充信息来源：我的观察');
    expect(context.summary).toContain('不默认使用亲昵称呼');
  });

  it('does not include important dates in general AI context', () => {
    const context = buildPursuitContext({ userProfile, girlProfile });

    expect(context.summary).not.toContain('重要日子');
    expect(context.summary).not.toContain('2000-02-16');
  });

  it('removes important dates from the raw profile fallback sent to AI', () => {
    const profiles = preparePursuitProfiles(userProfile, girlProfile);

    expect(profiles.girlProfile).not.toHaveProperty('birthday');
    expect(profiles.girlProfile).not.toHaveProperty('importantDates');
    expect(profiles.girlProfile.customInterests).toEqual(['看展']);
  });

  it('includes saved pursuit assessments in the AI context', () => {
    const context = buildPursuitContext({
      userProfile,
      girlProfile,
      stageQuestionnaires: [{
        id: 'assessment-1',
        userId: userProfile.id,
        relationshipStage: 'pursuing',
        audience: 'relationship',
        version: 1,
        answers: [],
        summary: ['需要暂停复盘', '请先停止推进'],
        completedAt: '2026-07-11T00:00:00.000Z',
      }],
    });

    expect(context.summary).toContain('需要暂停复盘');
    expect(context.summary).toContain('追求期关系节奏问卷');
  });

  it('includes stage-specific focus for each relationship stage', () => {
    const focusByStage = [
      ['observing', '礼貌距离'],
      ['warming', '双方主动'],
      ['ambiguous', '双向投入'],
    ] as const;

    for (const [currentStage, focus] of focusByStage) {
      const context = buildPursuitContext({
        userProfile,
        girlProfile: { ...girlProfile, currentStage },
        stageQuestionnaires: [{
          id: `assessment-${currentStage}`,
          userId: userProfile.id,
          relationshipStage: currentStage,
          audience: 'self',
          version: 1,
          answers: [],
          summary: [`${currentStage} summary`],
          completedAt: '2026-07-11T00:00:00.000Z',
        }],
      });

      expect(context.summary).toContain(`当前关系阶段重点：${focus}`);
      expect(context.summary).toContain(`${currentStage} summary`);
    }
  });
});
