# Lumi Onboarding Balanced Richness Design

## Goal

Refine the existing onboarding hero without changing its split layout, 3D heart geometry, orbit, six chat bubbles, brand treatment, or primary action. The result should give the left headline more presence and breathing room, keep the supporting sentence on one desktop line where space permits, and make the right visual feel richer through restrained star decoration.

## Existing State

- The desktop headline uses `clamp(44px, 5.5vw, 68px)`.
- The two headline rows use a `28px` grid gap plus `-6px` and `6px` vertical offsets.
- The supporting copy is 34 Chinese characters and is constrained to `500px`.
- The hero includes six glass chat bubbles, eight ambient sparks, and one signal trail.
- At 1014px width the split layout remains active, so headline sizing must be constrained separately to avoid turning the intended two-line headline into four lines.

## Approved Direction

This is a preserve-style refinement for a young consumer relationship product. Keep the soft rose, lavender, glass, and romantic 3D visual language.

- Design variance: 7
- Motion intensity: 6
- Visual density: 5

The visual additions should make the composition feel complete, not crowded. New motion must remain slow and must animate only `transform` and `opacity`.

## Typography

### Wide desktop

- Change the headline size to `clamp(48px, 5.8vw, 74px)`.
- Increase the true grid row gap from `28px` to `40px`.
- Increase the first and second line offsets to `-8px` and `8px`.
- Keep the current font weight, gradient, letter spacing, and two explicit text rows.
- Expected visible gap at 1440px is approximately 56px.

### Compact desktop

For widths from 769px through 1180px:

- Override headline size with `clamp(38px, 4vw, 50px)`.
- Use a `34px` row gap and `-6px` and `6px` offsets.
- Preserve exactly two rendered headline rows at the 1014px verification viewport.

### Mobile

- Preserve the current mobile font scale and 10px row gap.
- Preserve the current `-3px` and `3px` line offsets.

## Supporting Copy

Replace the current sentence with:

> 读懂关系信号，组织恰当表达，也尊重彼此边界。

- Keep the current color and type size.
- Increase the desktop maximum width to `560px` so the revised copy stays on one line at wide desktop sizes.
- Keep natural wrapping on compact desktop and mobile rather than reducing readability.

## Right-side Decoration

Retain the current six bubbles, eight sparks, and signal trail. Add five new decorative star spans, bringing the spark count to thirteen.

Use only the star glyphs `✦` and `✧`. Place them in available space around the ring:

- one small pale star above the ring near the upper-left quadrant;
- one medium rose star outside the upper-right quadrant;
- one tiny gold star between the top and right chat bubbles;
- one lavender outline star outside the lower-right quadrant;
- one pale rose star near the lower-left orbit edge.

Each star receives a distinct size, color, drift vector, duration, and negative delay. Movement remains slow, uses the existing `heroSparkDrift` animation, and does not overlap the central heart or glass chat bubbles at 1440px and 1014px verification sizes.

## Responsive and Accessibility Rules

- New stars nine through thirteen are hidden with the other secondary decorations on screens up to 768px.
- Existing `prefers-reduced-motion` behavior continues to disable all spark animation.
- Decorative stars remain `aria-hidden` and do not add spoken content.
- No horizontal overflow is allowed at 1440x900 or 1014x904.
- The CTA must remain visible in the initial viewport.

## Tests and Verification

- Update the component test to expect thirteen spark elements and the shortened supporting sentence.
- Update the style test to assert the approved headline scale, desktop gap, compact-desktop override, and the new thirteenth spark selector.
- Demonstrate a failing focused test before changing production code.
- Run the focused tests after implementation.
- Run all frontend tests and the production build.
- Visually inspect 1440x900 and 1014x904, measuring the headline line gap, line count, subtitle line count, decoration bounds, and horizontal overflow.

## Out of Scope

- Changing the split hero layout or column proportions
- Changing the 3D heart geometry, ribbons, orbit, camera, or canvas size
- Changing the six chat messages or their glass styling
- Changing the brand name, brand mark, subtitle, or CTA
- Adding new libraries or image assets
