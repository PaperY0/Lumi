# Onboarding Completion State Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (- [ ]) syntax for tracking.

**Goal:** Make Lumi distinguish new and returning local users correctly, persist and display questionnaire completion per current relationship stage, and only complete onboarding after all required inputs exist.

**Architecture:** Put progression policy in pure functions under frontend/src/lib; App loads persisted facts and enforces the resulting destination. Pages consume derived mode and completion state rather than independently using localStorage. Preserve all Dexie records and legacy pursuing compatibility; no database migration or cloud accounts.

**Tech Stack:** React 18, TypeScript, React Router, Zustand, Dexie/IndexedDB, Vitest, Playwright.

## Global Constraints

- Do not delete or rewrite existing IndexedDB data; retain legacy pursuing reads.
- A new user cannot reach dashboard, portrait completion, or stage questionnaires before prerequisites.
- “重新填写” is returning-user only; new users see “开始填写” or “已完成”.
- Stage completion is scoped to userId, girlId, relationshipStage, and audience.
- No account, server endpoint, or cloud storage in this MVP.

---

## File map

- frontend/src/lib/onboardingFlow.ts: pure progression model and destination resolver.
- frontend/src/lib/questionnaireCompletion.ts: display action and completion calculation.
- frontend/src/lib/db/repositories/stageQuestionnaireRepo.ts: counterpart-scoped result query.
- frontend/src/app/App.tsx: persisted-progress load and route guard.
- frontend/src/app/components/{ProfileSetupPage,StageQuestionnairePage,RelationshipPortraitPage}.tsx: status display and bypass removal.
- frontend/src/lib/*.test.ts and frontend/e2e/onboarding.spec.ts: regression coverage.

## Task 1: Define the completion policy

**Files:**

- Modify: frontend/src/lib/onboardingFlow.ts
- Modify: frontend/src/lib/onboardingFlow.test.ts
- Modify: frontend/src/lib/questionnaireCompletion.ts
- Modify: frontend/src/lib/questionnaireCompletion.test.ts

**Produces:** getOnboardingProgress(input), returning profileComplete, male, female, stage, and isComplete; getQuestionnaireAction({ completed, isReturningUser }), returning start, completed, or rewrite.

- [ ] **Step 1: Write failing policy tests.**

~~~
expect(getOnboardingProgress(completeInput).isComplete).toBe(true);
expect(getOnboardingProgress({ ...completeInput, maleCompleted: false }).isComplete).toBe(false);
expect(getQuestionnaireAction({ completed: true, isReturningUser: false })).toBe('completed');
expect(getQuestionnaireAction({ completed: true, isReturningUser: true })).toBe('rewrite');
~~~

- [ ] **Step 2: Verify red.**

Run: npm run test -- --run src/lib/onboardingFlow.test.ts src/lib/questionnaireCompletion.test.ts

Expected: FAIL because the new exports do not exist.

- [ ] **Step 3: Implement the pure policy.**

~~~
export function getQuestionnaireAction({ completed, isReturningUser }: {
  completed: boolean; isReturningUser: boolean;
}) {
  if (!completed) return 'start' as const;
  return isReturningUser ? 'rewrite' as const : 'completed' as const;
}
~~~

Set isComplete only when profile, male, female, self, observation, and relationship are all true. Do not access Dexie or Zustand in this layer.

- [ ] **Step 4: Verify green, then commit.**

Run: npm run test -- --run src/lib/onboardingFlow.test.ts src/lib/questionnaireCompletion.test.ts

Expected: PASS.

~~~
git add frontend/src/lib/onboardingFlow.ts frontend/src/lib/onboardingFlow.test.ts frontend/src/lib/questionnaireCompletion.ts frontend/src/lib/questionnaireCompletion.test.ts
git commit -m "feat: define onboarding completion policy"
~~~

## Task 2: Scope stage results to the active relationship

**Files:**

- Modify: frontend/src/lib/db/repositories/stageQuestionnaireRepo.ts
- Create: frontend/src/lib/db/repositories/stageQuestionnaireRepo.test.ts
- Modify: frontend/src/app/App.tsx
- Modify: frontend/src/app/components/StageQuestionnairePage.tsx

**Produces:** getLatest(userId, relationshipStage, audience, girlId?) and all onboarding/status reads pass the current girl.id.

- [ ] **Step 1: Write a failing two-girl repository test.**

~~~
await stageQuestionnaireRepository.save({ userId: 'u1', girlId: 'g1', relationshipStage: 'warming', audience: 'self' });
await stageQuestionnaireRepository.save({ userId: 'u1', girlId: 'g2', relationshipStage: 'warming', audience: 'self' });
expect((await stageQuestionnaireRepository.getLatest('u1', 'warming', 'self', 'g1'))?.girlId).toBe('g1');
~~~

- [ ] **Step 2: Verify red.**

Run: npm run test -- --run src/lib/db/repositories/stageQuestionnaireRepo.test.ts

Expected: FAIL or select the wrong girl's latest record.

- [ ] **Step 3: Implement optional counterpart filtering.**

~~~
.filter((result) =>
  result.relationshipStage === relationshipStage &&
  result.audience === audience &&
  (girlId === undefined || result.girlId === girlId),
)
~~~

Keep the existing three-argument signature valid for legacy callers.

- [ ] **Step 4: Verify green, then commit.**

Run: npm run test -- --run src/lib/db/repositories/stageQuestionnaireRepo.test.ts src/lib/questionnaireCompletion.test.ts

Expected: PASS.

~~~
git add frontend/src/lib/db/repositories/stageQuestionnaireRepo.ts frontend/src/lib/db/repositories/stageQuestionnaireRepo.test.ts frontend/src/app/App.tsx frontend/src/app/components/StageQuestionnairePage.tsx
git commit -m "fix: scope stage completion to current profile"
~~~

## Task 3: Guard routes and the completion transition

**Files:**

- Modify: frontend/src/app/App.tsx
- Modify: frontend/src/app/components/ProfileSetupPage.tsx
- Modify: frontend/src/app/components/RelationshipPortraitPage.tsx
- Modify: frontend/src/lib/onboardingFlow.test.ts

**Consumes:** Task 1 policy and Task 2 result lookup.

- [ ] **Step 1: Add failing destination tests.**

~~~
expect(resolveOnboardingDestination({
  ...completeData,
  stage: { self: true, observation: true, relationship: false },
  onboardingCompleted: false,
})).toBe('stage-questionnaires');
expect(resolveOnboardingDestination({ ...completeData, onboardingCompleted: true })).toBe('dashboard');
~~~

- [ ] **Step 2: Verify red.**

Run: npm run test -- --run src/lib/onboardingFlow.test.ts

Expected: FAIL until stage state participates in destination resolution.

- [ ] **Step 3: Load all six facts in App and redirect incomplete routes.**

Use first-missing order: profile → male-questionnaire → female-questionnaire → stage-questionnaires. A direct visit to dashboard or relationship-portrait during onboarding redirects to that first missing route.

- [ ] **Step 4: Remove bypasses.**

Remove the new-user “稍后补充” dashboard button. In the portrait, only display “开始使用 Lumi” and call setOnboardingCompleted(true) when isComplete is true; otherwise display the missing requirement and route back to it.

- [ ] **Step 5: Verify green, then commit.**

Run: npm run test -- --run src/lib/onboardingFlow.test.ts src/lib/questionnaireCompletion.test.ts

Expected: PASS.

~~~
git add frontend/src/app/App.tsx frontend/src/app/components/ProfileSetupPage.tsx frontend/src/app/components/RelationshipPortraitPage.tsx frontend/src/lib/onboardingFlow.ts frontend/src/lib/onboardingFlow.test.ts
git commit -m "fix: guard incomplete onboarding routes"
~~~

## Task 4: Render completion actions consistently

**Files:**

- Modify: frontend/src/app/components/StageQuestionnairePage.tsx
- Modify: frontend/src/app/components/ProfileSetupPage.tsx
- Modify: frontend/src/app/components/MaleQuestionnairePage.tsx
- Modify: frontend/src/app/components/FemaleQuestionnairePage.tsx
- Modify: frontend/src/app/components/PursuitSelfAssessmentPage.tsx
- Modify: frontend/src/app/components/PursuitObservationAssessmentPage.tsx
- Modify: frontend/src/app/components/PursuitRelationshipAssessmentPage.tsx
- Create: frontend/src/app/components/StageQuestionnairePage.test.tsx

- [ ] **Step 1: Write component tests for incomplete new, completed new, and completed returning users.**

~~~
render(<StageQuestionnairePage onNavigate={vi.fn()} />);
expect(await screen.findByText('已完成')).toBeVisible();
expect(screen.queryByText('重新填写')).not.toBeInTheDocument();
~~~

Mock repositories for each state, including the current stage and girl.

- [ ] **Step 2: Verify red.**

Run: npm run test -- --run src/app/components/StageQuestionnairePage.test.tsx

Expected: FAIL because a completed new-user card currently renders “重新填写”.

- [ ] **Step 3: Implement action display.**

Use getQuestionnaireAction: no result = 开始填写; completed returning user = 重新填写; completed new user = green check + 已完成, without a rewrite action. Render optional localized completedAt below the state. Apply equivalent status display to male/female entries in the profile area.

- [ ] **Step 4: Preserve post-save routing.**

After a save, use the first missing onboarding destination for a new user. A returning user who resaves a base questionnaire returns to the portrait. Existing toasts and success text remain.

- [ ] **Step 5: Verify green, then commit.**

Run: npm run test -- --run src/app/components/StageQuestionnairePage.test.tsx src/lib/questionnaireCompletion.test.ts

Expected: PASS.

~~~
git add frontend/src/app/components/StageQuestionnairePage.tsx frontend/src/app/components/ProfileSetupPage.tsx frontend/src/app/components/MaleQuestionnairePage.tsx frontend/src/app/components/FemaleQuestionnairePage.tsx frontend/src/app/components/PursuitSelfAssessmentPage.tsx frontend/src/app/components/PursuitObservationAssessmentPage.tsx frontend/src/app/components/PursuitRelationshipAssessmentPage.tsx frontend/src/app/components/StageQuestionnairePage.test.tsx
git commit -m "feat: show onboarding questionnaire completion state"
~~~

## Task 5: Browser verification and final acceptance

**Files:**

- Create: frontend/e2e/onboarding.spec.ts
- Modify: docs/ONBOARDING_REWORK_PLAN.md

- [ ] **Step 1: Write the blocked-new-user browser scenario.**

~~~
test('new user cannot finish onboarding until all stage questionnaires are saved', async ({ page }) => {
  await clearLumiData(page);
  await page.goto('/');
  await expect(page.getByText('开始建立关系档案')).toBeVisible();
  // Seed profile and base results but omit the relationship-stage “relationship” result.
  await expect(page).toHaveURL(/stage-questionnaires/);
  await expect(page.getByText('开始使用 Lumi')).not.toBeVisible();
});
~~~

- [ ] **Step 2: Write the returning-user browser scenario.**

Seed a fully complete profile and onboardingCompleted: true, reload, assert dashboard, open stage overview, and assert 重新填写 for a completed card.

- [ ] **Step 3: Run e2e.**

Run: npm run e2e -- onboarding.spec.ts

Expected: PASS. If Playwright browsers are unavailable, record the exact installation failure in docs/ONBOARDING_REWORK_PLAN.md, then run the manual script below.

- [ ] **Step 4: Manual IndexedDB acceptance.**

1. Settings → 清空全部本地数据.
2. Fill profile with 初识接触期; complete male, female, and all three stage questionnaires.
3. Confirm green checks update immediately and survive refresh.
4. Confirm 开始使用 Lumi appears only after the last stage questionnaire.
5. Reload and confirm dashboard; completed cards now say 重新填写.
6. Change to 升温期 and confirm all three stage cards are incomplete for that stage.

- [ ] **Step 5: Release verification and commit.**

Run: npm run test -- --run; npm run type-check; npm run build

Expected: all tests pass, TypeScript reports no errors, and Vite build succeeds.

~~~
git add frontend/e2e/onboarding.spec.ts docs/ONBOARDING_REWORK_PLAN.md
git commit -m "test: cover onboarding completion flow"
~~~

## Coverage review

- Ordered new-user flow, refresh persistence, and no dashboard bypass: Tasks 1, 3, 5.
- Green checks, timestamp, new-user copy, and returning-user rewrite copy: Tasks 1 and 4.
- Stage switching and multiple-relationship isolation: Tasks 2 and 5.
- Continuous questionnaire navigation and portrait/home gate: Tasks 3–5.
- Local data and pursuing compatibility: Tasks 1–2, with no schema migration.

