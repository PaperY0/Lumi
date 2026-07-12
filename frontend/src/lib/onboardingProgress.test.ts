import { describe, expect, it } from 'vitest';
import { getOnboardingChecklist, getOnboardingProgressPercent, getOnboardingAction } from './onboardingProgress';

describe('onboarding progress checklist', () => {
  it('counts six requirements including current-stage questionnaires', () => {
    const checklist = getOnboardingChecklist({
      profileComplete: true,
      maleCompleted: true,
      femaleCompleted: false,
      stageCompleted: { self: true, observation: false, relationship: true },
      isReturningUser: true,
    });
    expect(checklist.completedCount).toBe(4);
    expect(checklist.totalCount).toBe(6);
    expect(checklist.percentage).toBe(67);
  });

  it('maps item actions for new and returning users', () => {
    expect(getOnboardingAction({ key: 'profile', completed: true, isReturningUser: true })).toEqual({ label: '修改资料', page: 'profile' });
    expect(getOnboardingAction({ key: 'male', completed: false, isReturningUser: false })).toEqual({ label: '开始填写', page: 'male-questionnaire' });
    expect(getOnboardingAction({ key: 'female', completed: true, isReturningUser: true })).toEqual({ label: '重新填写', page: 'female-questionnaire' });
    expect(getOnboardingAction({ key: 'stage-self', completed: false, isReturningUser: true })).toEqual({ label: '开始填写', page: 'pursuit-self-assessment' });
    expect(getOnboardingAction({ key: 'stage-relationship', completed: true, isReturningUser: false })).toEqual({ label: '已完成', page: 'pursuit-relationship-assessment' });
  });

  it('rounds percentage from six requirements', () => {
    expect(getOnboardingProgressPercent(1, 6)).toBe(17);
    expect(getOnboardingProgressPercent(6, 6)).toBe(100);
  });
});
