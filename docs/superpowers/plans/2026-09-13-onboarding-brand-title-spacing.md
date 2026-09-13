# Onboarding Brand and Title Spacing Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make only the `Lumi 恋语` brand name rose pink and increase the visual separation between the two onboarding-title lines without changing the page layout.

**Architecture:** Keep the existing onboarding component structure and add stable classes to its two title-line spans. Apply the approved color and line-specific transforms in the existing global onboarding styles, with reduced offsets in the mobile media query.

**Tech Stack:** React, TypeScript, CSS, Vitest, Testing Library, Vite

## Global Constraints

- Change only the `Lumi 恋语` brand name to `#c06f91`.
- Keep `AI 恋爱沟通陪伴工具` unchanged.
- Move the first title line up `6px` and the second line down `6px` on desktop.
- Use `3px` offsets on mobile.
- Do not change the title wrapper position, page columns, 3D canvas, orbit, heart, or chat bubbles.

---

### Task 1: Brand Color and Split Title Spacing

**Files:**
- Modify: `frontend/src/app/components/OnboardingPage.tsx`
- Modify: `frontend/src/styles/globals.css`
- Test: `frontend/src/app/components/OnboardingPage.test.tsx`
- Test: `frontend/src/app/components/OnboardingHeroStyles.test.mjs`

**Interfaces:**
- Consumes: existing `.onboarding-brand-name`, `.onboarding-title`, and mobile media-query styles.
- Produces: `.onboarding-title-line`, `.onboarding-title-line-first`, and `.onboarding-title-line-second` styling hooks.

- [ ] **Step 1: Write failing component and style assertions**

Add these assertions to the existing onboarding tests:

```tsx
expect(container.querySelector('.onboarding-title-line-first')).toHaveTextContent('让沟通更真诚，');
expect(container.querySelector('.onboarding-title-line-second')).toHaveTextContent('让靠近更有分寸');
```

```js
expect(styles).toContain('color: #c06f91;');
expect(styles).toContain('.onboarding-title-line-first');
expect(styles).toContain('transform: translateY(-6px);');
expect(styles).toContain('.onboarding-title-line-second');
expect(styles).toContain('transform: translateY(6px);');
```

- [ ] **Step 2: Run focused tests and verify they fail**

Run:

```powershell
pnpm --filter @figma/my-make-file exec vitest run src/app/components/OnboardingPage.test.tsx src/app/components/OnboardingHeroStyles.test.mjs --configLoader runner
```

Expected: FAIL because the line classes, rose brand color, and transforms do not exist yet.

- [ ] **Step 3: Add stable title-line classes**

Replace the two title spans in `OnboardingPage.tsx` with:

```tsx
<span className="onboarding-title-line onboarding-title-line-first">让沟通更真诚，</span>
<span className="onboarding-title-line onboarding-title-line-second">让靠近更有分寸</span>
```

- [ ] **Step 4: Apply the brand color and desktop title offsets**

Update the brand name and add title-line rules in `globals.css`:

```css
.onboarding-brand-name {
  color: #c06f91;
}

.onboarding-title-line {
  display: block;
}

.onboarding-title-line-first {
  transform: translateY(-6px);
}

.onboarding-title-line-second {
  transform: translateY(6px);
}
```

Keep all existing typography values in `.onboarding-brand-name` after replacing only its `color` declaration.

- [ ] **Step 5: Add smaller mobile offsets**

Inside the existing `@media (max-width: 768px)` block in `globals.css`, add:

```css
.onboarding-title-line-first {
  transform: translateY(-3px);
}

.onboarding-title-line-second {
  transform: translateY(3px);
}
```

- [ ] **Step 6: Run focused tests and verify they pass**

Run:

```powershell
pnpm --filter @figma/my-make-file exec vitest run src/app/components/OnboardingPage.test.tsx src/app/components/OnboardingHeroStyles.test.mjs --configLoader runner
```

Expected: 2 test files pass.

- [ ] **Step 7: Run full verification**

Run:

```powershell
pnpm --filter @figma/my-make-file test -- --run
pnpm --filter @figma/my-make-file build
```

Expected: 34 test files and 117 tests pass; TypeScript and Vite build exit successfully.

- [ ] **Step 8: Perform browser visual verification**

Open `http://127.0.0.1:5174/` at `1440x900` and verify:

- `Lumi 恋语` is rose pink while the subtitle remains gold.
- The first title line moves upward and the second moves downward.
- The title gradient and left-right layout remain unchanged.
- The heart, orbit, and six drifting chat bubbles remain unchanged.

- [ ] **Step 9: Commit the implementation**

```powershell
git add frontend/src/app/components/OnboardingPage.tsx frontend/src/styles/globals.css frontend/src/app/components/OnboardingPage.test.tsx frontend/src/app/components/OnboardingHeroStyles.test.mjs
git commit -m "style: refine onboarding brand and title spacing"
```

