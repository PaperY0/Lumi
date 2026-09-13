# Onboarding Hero Balanced Enhancement

## Goal

Strengthen the existing desktop onboarding hero without changing its two-column
layout, content order, or responsive structure.

## Approved Changes

- Increase the two-line title letter spacing from `-0.055em` to `0.005em` so
  the heading occupies more of the existing left column.
- Lighten the title gradient by roughly 15 percent while retaining its current
  berry-purple, rose, and mist-purple identity.
- Increase the `HeartGem` scale from `{ x: 1.14, y: 1.18, z: 1 }` to
  `{ x: 1.34, y: 1.42, z: 1 }`.
- Keep six conversation bubbles and make their movement more visible by using
  distinct horizontal and vertical travel distances between 14 and 22 pixels.
- Keep the movement slow, staggered, and alternating. Do not introduce circular
  paths, rapid jumps, or notification-style bouncing.

## Explicit Layout Boundary

Do not modify `.onboarding-layout`, the two-column proportions, the 48-pixel
column gap, content order, brand position, title position, CTA position, canvas
size, gold orbit, ribbons, or mobile composition.

## Implementation Ownership

- `OnboardingPage.tsx` owns the title's letter-spacing value and the existing
  six callout elements.
- `HeroScene.tsx` owns the isolated `HeartGem` scale constant.
- `globals.css` owns the lighter desktop gradient and each bubble's movement
  variables.

## Accessibility and Performance

Bubble animation remains transform-only. Existing `prefers-reduced-motion`
behavior continues to disable all bubble and sparkle animation. The decorative
bubbles remain hidden from assistive technology.

## Verification

- Add failing contract tests for the new title spacing, heart scale, gradient,
  and increased bubble travel before changing production code.
- Run all frontend tests, TypeScript checking, and the production build.
- Inspect the updated page at `http://127.0.0.1:5174/` at desktop width.
- Confirm six bubbles are present, their positions change over time, the heart
  is visibly larger, and computed two-column layout values remain unchanged.
- Confirm the mobile preview remains hidden and reduced-motion disables motion.
