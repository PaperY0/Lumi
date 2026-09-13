# Onboarding Hero Visual Refinement

## Goal

Refine only the desktop onboarding hero so it feels softer and more alive while
preserving the existing Lumi visual language and the mobile experience.

## Approved Visual Direction

- Keep the two-line hero heading as a purple-pink gradient, but shift it from
  a dark plum treatment to a lighter berry, soft-rose, and mist-purple range.
- Move the logo lockup approximately 16 px left and 18 px up on desktop.
- Enlarge only the 3D heart gem, approximately 14% wider and 18% taller. Do
  not enlarge the surrounding gold orbit or the canvas.
- Expand the conversation layer from three to six short bubbles. Place them
  around the orbit and give each a distinct, slow horizontal and vertical drift
  with separate duration and phase.
- When `prefers-reduced-motion` is enabled, keep all conversation bubbles
  stationary.

## Implementation Boundaries

`OnboardingPage.tsx` remains responsible for the hero copy and the six
decorative callout elements. `globals.css` owns desktop placement, colors, and
motion keyframes. `HeroScene.tsx` scales the named `HeartGem` mesh after the
GLB has loaded; it must not change the model camera, root fit calculation, or
gold-orbit geometry.

## Motion Design

Use transform-only keyframes so the animation is inexpensive: each bubble
drifts within roughly 8 to 14 px horizontally and 6 to 10 px vertically over
6 to 10 seconds, with alternating movement direction and staggered negative
delays. The composition should read as a gentle exchange, not orbital motion
or rapid notification activity.

## Responsive and Accessibility Behavior

The desktop adjustments apply at 769 px and above. The existing mobile rule
continues to hide the WebGL preview and its bubbles. Reduced-motion users see
the same content without animation. Bubble text remains `aria-hidden` because
it is decorative rather than conversational content.

## Verification

- Run frontend type-check and production build.
- Open the desktop landing route at 127.0.0.1:5173 and confirm the lighter
  heading, shifted brand, enlarged heart, and six non-overlapping bubbles.
- Check a viewport below 769 px to confirm the current single-column mobile
  first screen is unchanged.
- Emulate reduced motion and confirm the bubbles do not animate.

## Scope Exclusions

Do not alter onboarding copy, the call-to-action, the 3D model asset, global
color tokens, or any post-onboarding application page.
