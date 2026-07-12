# Task 6 report

Status: complete

## Summary

- `loadPursuitQuestionnaires` now reads the active relationship stage and falls back to legacy `pursuing` records only for `observing`.
- Portrait, analysis, simulation, and reply hooks pass the current girl's normalized stage and keep `girlId` scoping.
- Portrait context now includes explicit stage focus guidance for all three selectable stages.
- Stage questionnaire overview now shows current-stage completion as `X/3` and the recommended order.

## Commit

The scoped implementation commit is recorded in git history as:

`feat: use current-stage questionnaires in portrait context`

## Files

- `frontend/src/lib/pursuitQuestionnaires.ts`
- `frontend/src/lib/pursuitQuestionnaires.test.ts`
- `frontend/src/lib/ai/profileContext.ts`
- `frontend/src/lib/ai/profileContext.test.ts`
- `frontend/src/hooks/useGeneratePortrait.ts`
- `frontend/src/hooks/useAnalyzeChat.ts`
- `frontend/src/hooks/useSimulateChat.ts`
- `frontend/src/hooks/useGenerateReply.ts`
- `frontend/src/lib/stageQuestionnaireOverview.ts`
- `frontend/src/lib/stageQuestionnaireOverview.test.ts`
- `frontend/src/app/components/StageQuestionnairePage.tsx`

## Verification

- Focused tests: 3 files, 9 tests passed.
- Full unit tests: 24 files, 104 tests passed.
- Type-check: passed.
- Build: passed; existing large-chunk warning remains (`index-D6z60S39.js`, 875.19 kB).
- Onboarding E2E: 4 passed.
- Smoke E2E: 10 passed.

## Concerns

- No IndexedDB schema changes were made.
- Existing `.codex-run` reports and Playwright test-result artifacts were left untouched and are not part of the scoped commit.
