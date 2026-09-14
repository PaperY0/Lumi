# Onboarding Title Upward Adjustment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move both onboarding headline rows upward, with a stronger lift on the first row, without changing any other hero element.

**Architecture:** Keep the existing two-span title structure and adjust only each span's `translateY` value at the existing desktop, compact-desktop, and mobile breakpoints. Extend the existing stylesheet regression test so each breakpoint's exact values are protected.

**Tech Stack:** CSS, Node.js test runner, Vitest, Vite, React frontend

## Global Constraints

- Wide desktop above 1180px: first row `translateY(-18px)` and second row `translateY(0)`.
- Compact desktop from 769px through 1180px: first row `translateY(-14px)` and second row `translateY(0)`.
- Mobile at 768px and below: first row `translateY(-7px)` and second row `translateY(0)`.
- Preserve the current title font sizes and `row-gap` values.
- Do not move or modify the brand, subtitle, CTA, heart model, orbit, ribbons, bubbles, stars, copy, or colors.
- Preserve the existing no-horizontal-overflow mobile behavior.

---

### Task 1: Lift the onboarding headline rows

**Files:**
- Modify: `frontend/src/app/components/OnboardingHeroStyles.test.mjs`
- Modify: `frontend/src/styles/globals.css`

**Interfaces:**
- Consumes: Existing `.onboarding-title-line-first` and `.onboarding-title-line-second` selectors and the `extractBlock(styles, selector)` test helper.
- Produces: Exact responsive transform values protected by the onboarding stylesheet test.

- [ ] **Step 1: Write the failing responsive transform assertions**

Replace the old transform checks in the first test and extend the scoped breakpoint test so the relevant assertions are:

```js
expect(styles).toContain('transform: translateY(-18px);');

const mobileOnboardingStyles = extractBlock(styles, '@media (max-width: 768px)');
const mobileFirstLineStyles = extractBlock(mobileOnboardingStyles, '.onboarding-title-line-first');
const mobileSecondLineStyles = extractBlock(mobileOnboardingStyles, '.onboarding-title-line-second');
expect(mobileFirstLineStyles).toContain('transform: translateY(-7px);');
expect(mobileSecondLineStyles).toContain('transform: translateY(0);');

const compactDesktopStyles = extractBlock(styles, '@media (min-width: 769px) and (max-width: 1180px)');
const compactFirstLineStyles = extractBlock(compactDesktopStyles, '.onboarding-title-line-first');
const compactSecondLineStyles = extractBlock(compactDesktopStyles, '.onboarding-title-line-second');
expect(compactFirstLineStyles).toContain('transform: translateY(-14px);');
expect(compactSecondLineStyles).toContain('transform: translateY(0);');
```

- [ ] **Step 2: Run the focused test and verify RED**

Run:

```powershell
pnpm --filter @figma/my-make-file exec vitest run src/app/components/OnboardingHeroStyles.test.mjs --configLoader runner
```

Expected: FAIL because the stylesheet still contains the previous `-8px`/`8px`, `-6px`/`6px`, and `-3px`/`3px` transforms.

- [ ] **Step 3: Apply the minimal CSS change**

Use these exact rules while leaving font sizes and row gaps untouched:

```css
.onboarding-title-line-first {
  transform: translateY(-18px);
}

.onboarding-title-line-second {
  transform: translateY(0);
}

@media (max-width: 768px) {
  .onboarding-title-line-first {
    transform: translateY(-7px);
  }

  .onboarding-title-line-second {
    transform: translateY(0);
  }
}

@media (min-width: 769px) and (max-width: 1180px) {
  .onboarding-title-line-first { transform: translateY(-14px); }
  .onboarding-title-line-second { transform: translateY(0); }
}
```

- [ ] **Step 4: Run focused and full verification**

Run:

```powershell
pnpm --filter @figma/my-make-file exec vitest run src/app/components/OnboardingHeroStyles.test.mjs --configLoader runner
pnpm --filter @figma/my-make-file test -- --run
pnpm --filter @figma/my-make-file build
```

Expected: focused test passes, all frontend tests pass, and the Vite production build exits successfully.

- [ ] **Step 5: Verify the rendered desktop layout**

At a 1440×900 viewport, confirm both rows have moved upward, the first row has moved farther than the second, the title does not overlap the brand or subtitle, and the page has no horizontal overflow. At 1014×904 and 390×844, confirm the responsive transforms apply without clipping or overlap.

- [ ] **Step 6: Commit the implementation**

```powershell
git add frontend/src/app/components/OnboardingHeroStyles.test.mjs frontend/src/styles/globals.css
git commit -m "style: lift onboarding headline rows"
```
