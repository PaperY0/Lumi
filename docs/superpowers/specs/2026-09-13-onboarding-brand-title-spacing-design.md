# Onboarding Brand and Title Spacing Design

## Goal

Refine the existing onboarding hero without changing its overall left-right layout.

## Scope

- Change only the `Lumi 恋语` brand name to a soft rose pink (`#c06f91`).
- Keep the `AI 恋爱沟通陪伴工具` brand subtitle unchanged.
- Increase the visual separation between the two hero-title lines.
- Move the first title line upward by `6px` and the second line downward by `6px` on desktop.
- Use smaller line offsets on mobile so the title remains compact and readable.

## Implementation

- Add stable class names to the two title-line spans in `OnboardingPage.tsx`.
- Define the brand-name color and title-line transforms in `globals.css`.
- Preserve the existing title gradient, font sizing, title wrapper position, page columns, 3D canvas, orbit, heart, and chat bubbles.

## Verification

- Extend the onboarding style test to assert the approved brand color and both title-line transforms.
- Run the focused onboarding tests, full frontend test suite, TypeScript production build, and browser visual verification at desktop width.

