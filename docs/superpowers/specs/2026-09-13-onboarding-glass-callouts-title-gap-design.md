# Onboarding Glass Callouts and Title Gap Design

## Goal

Reduce callout obstruction around the 3D hero, strengthen their frosted-glass appearance, and make the separation between the two desktop title lines visibly larger.

## Root Causes

- Callouts currently use an almost opaque `rgba(255, 252, 253, 0.92)` background, `z-index: 3`, and positions that sit directly on the gold orbit and model.
- The title currently uses transforms only. At a `1014px` desktop viewport, the measured visible gap is approximately `24px`, while the title's actual flow layout still has no explicit row gap.

## Glass Callouts

- Use `rgba(255, 252, 253, 0.66)` for the glass surface.
- Add `backdrop-filter: blur(18px) saturate(1.3)` and the WebKit equivalent.
- Use a soft white border, subtle inset highlight, and lighter rose shadow so the callout remains readable without forming an opaque block.
- Preserve the current pink text color and six messages.
- Keep callouts above the canvas for legibility, but reposition their resting points toward the outside edge of the orbit:
  - one: `top: -14px; left: 52px`
  - two: `bottom: 96px; left: -52px`
  - three: `right: -34px; bottom: 42px`
  - four: `top: 146px; right: -28px`
  - five: `top: 286px; left: -52px`
  - six: `right: 48px; bottom: -18px`
- Reduce drift vectors to between `6px` and `10px` so the callouts do not drift back over the model:
  - one: `(8px, -6px)`
  - two: `(-7px, 9px)`
  - three: `(10px, -6px)`
  - four: `(-8px, 7px)`
  - five: `(6px, 9px)`
  - six: `(-9px, -8px)`
- Keep the existing individual durations and delays.
- Keep reduced-motion support.

## Desktop Title Gap

- Make `.onboarding-title` a vertical grid with a real `row-gap: 28px`.
- Set the first line to `translateY(-6px)` and the second line to `translateY(6px)`.
- The resulting visible desktop separation is approximately `40px`, rather than the current `24px`.
- Keep the title font size, letter spacing, gradient, text, and title-wrapper position unchanged.
- On mobile, use `row-gap: 10px` with the existing `-3px` and `3px` transforms.

## Responsive Behavior

- Verify both `1440x900` and `1014x904` desktop viewports.
- At `1014px`, no callout may extend beyond the viewport edge.
- The callouts may visually cross the thin outer orbit only through translucent glass, but must not cover the central heart silhouette or the main ribbon intersections.
- Do not change the 580px scene box, current medium-screen `0.76` hero scale, page columns, heart geometry, or orbit.

## Verification

- Update style assertions for the glass background, blur, row gaps, callout positions, and smaller drift vectors.
- Browser-check the actual line gap and callout bounds at both target desktop widths.
- Run all frontend tests and the TypeScript/Vite production build.

