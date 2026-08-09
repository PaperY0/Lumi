# Stable Questionnaire Layout and Full-flow Test Tool Design

## Goal

Make all questionnaire pages visually stable and readable on wide screens, and add a persistent local-only testing control that completes every required questionnaire for the current relationship stage before opening the relationship portrait.

## Scope

- Applies to male questionnaire, female questionnaire, and the three current-stage assessments: self, observation, relationship rhythm and boundaries.
- The test tool only uses the currently saved user, girl profile, and selected relationship stage.
- Existing saved answers and profile data are not deleted or overwritten by the test tool.

## Stable layout

- The page is split into a fixed header region and an independently scrolling questionnaire region.
- The header contains a larger, sticky onboarding stepper. Its container height, step-circle size, labels, and connector positions remain constant while answer content changes.
- Wide desktop content uses a shared maximum width of 800px; narrow screens remain fluid with 20px side padding.
- The question card has a fixed minimum height of 132px. Long question text wraps inside the card.
- Each answer card has a fixed minimum height of 88px for single-column questionnaires; the female two-column choices use a 104px minimum height.
- Navigation has a fixed 56px button height and a fixed 72px footer region. Answer text may wrap, but controls do not move vertically.
- Text remains readable: question 20px, answers 16px, step labels 13px, step circles 42px.

## Testing control

- A visible “测试工具” button is fixed at the questionnaire page's upper-right corner.
- Clicking it opens a confirmation dialog stating that it writes local test answers and jumps to the portrait.
- Confirming:
  1. loads the current user and girl profile;
  2. refuses to proceed with a clear message if either profile or relationship stage is missing;
  3. keeps existing profile data unchanged;
  4. writes deterministic safe fixture answers for male and female questionnaires only when their latest result is absent;
  5. writes deterministic safe fixture answers for self, observation, and relationship assessments for the current stage only when each is absent;
  6. opens the relationship portrait page.
- Fixture answers choose the first clearly safe or “information insufficient” option. They must never select coercive, jealous, invasive, or pressure-oriented answers.
- The button does not run automatically and does not send extra data beyond the existing local questionnaire persistence behavior.

## Data boundary

The test helper uses the existing questionnaire repositories and completion scopes:
- male: current user;
- female: current user and current girl;
- stage: current user, current girl, current relationship stage, and audience.

A completed existing record wins over the fixture. This makes the action repeatable without overwriting user answers.

## Acceptance

1. Changing questions with very short and very long text does not shift the fixed header, question-card footprint, option-row footprint, or navigation footer.
2. The stepper remains visible while the answer region scrolls.
3. All five questionnaire entry pages show the same test-tool affordance.
4. With valid profile and stage, one confirmation creates any missing questionnaire records and opens the portrait.
5. Repeating the action preserves previously completed real answers.
6. With missing profile or stage, no record is written and the UI explains the prerequisite.
7. Test, type-check, build, and browser verification pass.

