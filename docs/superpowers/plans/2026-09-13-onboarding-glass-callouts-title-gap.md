# Onboarding Glass Callouts and Title Gap Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the six onboarding callouts into lighter frosted-glass bubbles, move them away from major 3D features, and create a real visible gap between the two desktop title lines.

**Architecture:** Keep the existing React markup and solve this through the onboarding CSS contract. Replace transform-only title separation with grid row spacing plus small line offsets, and tune the six existing callout position/drift variables without changing their content or animation timing.

**Tech Stack:** CSS, Vitest, Vite, browser visual verification

## Global Constraints

- Use callout background `rgba(255, 252, 253, 0.66)`.
- Use `blur(18px) saturate(1.3)` for frosted glass.
- Preserve all six messages, their durations, and delays.
- Use desktop title `row-gap: 28px` with line transforms `-6px` and `6px`.
- Use mobile title `row-gap: 10px` with line transforms `-3px` and `3px`.
- Do not change the 580px scene, 0.76 medium-screen scale, heart, orbit, ribbons, page columns, brand, CTA, or route behavior.

---

### Task 1: Glass Callouts and Real Title Spacing

**Files:**
- Modify: `frontend/src/styles/globals.css`
- Test: `frontend/src/app/components/OnboardingHeroStyles.test.mjs`

**Interfaces:**
- Consumes: `.hero-callout`, `.hero-callout-one` through `.hero-callout-six`, `.onboarding-title`, and the two title-line classes.
- Produces: the approved glass surface, perimeter positions, bounded drift vectors, and desktop/mobile title row gaps.

- [ ] **Step 1: Update style assertions before production CSS**

Replace the old title-transform assertions and add these exact checks in `OnboardingHeroStyles.test.mjs`:

```js
expect(styles).toContain('background: rgba(255, 252, 253, 0.66);');
expect(styles).toContain('backdrop-filter: blur(18px) saturate(1.3);');
expect(styles).toContain('-webkit-backdrop-filter: blur(18px) saturate(1.3);');
expect(styles).toContain('row-gap: 28px;');
expect(styles).toContain('transform: translateY(-6px);');
expect(styles).toContain('transform: translateY(6px);');
expect(styles).toContain('row-gap: 10px;');
expect(styles).toContain('transform: translateY(-3px);');
expect(styles).toContain('transform: translateY(3px);');
expect(styles).toContain('top: -14px; left: 52px; --bubble-x: 8px; --bubble-y: -6px;');
expect(styles).toContain('right: 48px; bottom: -18px; --bubble-x: -9px; --bubble-y: -8px;');
```

- [ ] **Step 2: Run the focused test and verify it fails**

```powershell
pnpm --filter @figma/my-make-file exec vitest run src/app/components/OnboardingHeroStyles.test.mjs --configLoader runner
```

Expected: FAIL because the callout background is still `0.92`, no backdrop blur exists, no title row gaps exist, and positions/drifts still use the old values.

- [ ] **Step 3: Implement the frosted-glass surface**

Update the relevant `.hero-callout` declarations in `globals.css` to:

```css
.hero-callout {
  background: rgba(255, 252, 253, 0.66);
  border: 1px solid rgba(255, 255, 255, 0.74);
  box-shadow: 0 10px 28px rgba(98, 47, 78, 0.09), inset 0 1px 0 rgba(255, 255, 255, 0.86);
  backdrop-filter: blur(18px) saturate(1.3);
  -webkit-backdrop-filter: blur(18px) saturate(1.3);
}
```

Keep all existing positioning, typography, z-index, white-space, and animation declarations that are not replaced above.

- [ ] **Step 4: Move callouts toward perimeter slots and reduce drift**

Replace the six variant rules with:

```css
.hero-callout-one   { top: -14px; left: 52px; --bubble-x: 8px; --bubble-y: -6px; --bubble-duration: 7.4s; --bubble-delay: -1.2s; }
.hero-callout-two   { bottom: 96px; left: -52px; --bubble-x: -7px; --bubble-y: 9px; --bubble-duration: 8.6s; --bubble-delay: -4.1s; }
.hero-callout-three { right: -34px; bottom: 42px; --bubble-x: 10px; --bubble-y: -6px; --bubble-duration: 9.8s; --bubble-delay: -2.8s; }
.hero-callout-four  { top: 146px; right: -28px; --bubble-x: -8px; --bubble-y: 7px; --bubble-duration: 7.9s; --bubble-delay: -5.3s; }
.hero-callout-five  { top: 286px; left: -52px; --bubble-x: 6px; --bubble-y: 9px; --bubble-duration: 9.1s; --bubble-delay: -3.6s; }
.hero-callout-six   { right: 48px; bottom: -18px; --bubble-x: -9px; --bubble-y: -8px; --bubble-duration: 8.2s; --bubble-delay: -6.4s; }
```

- [ ] **Step 5: Add real desktop and mobile title gaps**

Extend the desktop `.onboarding-title` rule and update base line transforms:

```css
@media (min-width: 769px) {
  .onboarding-title {
    display: grid;
    row-gap: 28px;
  }
}

.onboarding-title-line-first {
  transform: translateY(-6px);
}

.onboarding-title-line-second {
  transform: translateY(6px);
}
```

Inside the existing mobile onboarding media query, add `row-gap: 10px` to `.onboarding-title` and retain the existing `-3px` and `3px` transforms.

- [ ] **Step 6: Run the focused test and verify it passes**

```powershell
pnpm --filter @figma/my-make-file exec vitest run src/app/components/OnboardingHeroStyles.test.mjs --configLoader runner
```

Expected: the style test passes.

- [ ] **Step 7: Run full automated verification**

```powershell
pnpm --filter @figma/my-make-file test -- --run
pnpm --filter @figma/my-make-file build
```

Expected: all frontend tests pass and TypeScript/Vite production build exits successfully.

- [ ] **Step 8: Verify both desktop widths in the browser**

At `1440x900`, measure the first-line bottom and second-line top; expected visible gap is approximately `40px`. Confirm the bubbles appear translucent, retain readable text, and avoid the central heart and main ribbon intersections.

At `1014x904`, confirm every callout bounding box satisfies `left >= 0` and `right <= 1014`, and that no horizontal scrollbar appears. Confirm the title uses the same explicit desktop row gap.

- [ ] **Step 9: Commit**

```powershell
git add frontend/src/styles/globals.css frontend/src/app/components/OnboardingHeroStyles.test.mjs
git commit -m "fix: clarify onboarding callouts and title spacing"
```

