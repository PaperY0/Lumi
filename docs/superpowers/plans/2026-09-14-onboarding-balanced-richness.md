# Onboarding Balanced Richness Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give the onboarding headline more scale and vertical rhythm, shorten its supporting copy, and enrich the right-side 3D composition with five restrained animated stars.

**Architecture:** Keep the existing `OnboardingPage` markup and global onboarding style layer. Add only five decorative, `aria-hidden` spans to the existing hero decoration group, and extend the established `heroSparkDrift` CSS pattern rather than introducing a new animation system or dependency.

**Tech Stack:** React 18, TypeScript, Vite, Vitest, Testing Library, native CSS animations, Three.js hero already present in the project.

## Global Constraints

- Preserve the split layout, 3D heart geometry, ribbons, orbit, camera, canvas size, six chat bubbles, brand treatment, and CTA.
- Wide desktop headline: `clamp(48px, 5.8vw, 74px)`, `40px` row gap, and line transforms of `-8px` and `8px`.
- Compact desktop from 769px through 1180px: `clamp(38px, 4vw, 50px)`, `34px` row gap, and line transforms of `-6px` and `6px`.
- Mobile keeps its current `clamp(40px, 12vw, 56px)`, `10px` row gap, and `-3px` and `3px` transforms.
- Supporting copy is exactly `读懂关系信号，组织恰当表达，也尊重彼此边界。` with a wide-desktop maximum width of `560px`.
- Add exactly five `aria-hidden` star spans, for thirteen `.hero-spark` elements total.
- New stars use only `✦` and `✧`, reuse `heroSparkDrift`, and animate only `transform` and `opacity`.
- New stars nine through thirteen are hidden at widths up to 768px.
- No new dependency, image asset, route, or user interaction.
- No horizontal overflow at 1440x900 or 1014x904; the CTA remains visible in the first viewport.

---

### Task 1: Increase headline presence and shorten supporting copy

**Files:**
- Modify: `frontend/src/app/components/OnboardingPage.test.tsx`
- Modify: `frontend/src/app/components/OnboardingHeroStyles.test.mjs`
- Modify: `frontend/src/app/components/OnboardingPage.tsx`
- Modify: `frontend/src/styles/globals.css`

**Interfaces:**
- Consumes: existing `.onboarding-title`, `.onboarding-title-line-first`, `.onboarding-title-line-second`, and `.onboarding-subtitle` class hooks.
- Produces: the same component API, `OnboardingPage({ onComplete })`, with revised visible copy and responsive typography.

- [ ] **Step 1: Write failing component assertions for the new title scale and copy**

In `frontend/src/app/components/OnboardingPage.test.tsx`, replace the existing heading style assertion and add an exact supporting-copy assertion:

```tsx
expect(screen.getByRole('heading', { level: 1 })).toHaveStyle({
  fontSize: 'clamp(48px, 5.8vw, 74px)',
  letterSpacing: '0.005em',
});
expect(screen.getByText('读懂关系信号，组织恰当表达，也尊重彼此边界。')).toBeInTheDocument();
```

- [ ] **Step 2: Write failing CSS assertions for wide and compact desktop rhythm**

In `frontend/src/app/components/OnboardingHeroStyles.test.mjs`, replace the old desktop spacing assertions and add the compact override assertions:

```js
expect(styles).toContain('row-gap: 40px;');
expect(styles).toContain('transform: translateY(-8px);');
expect(styles).toContain('transform: translateY(8px);');
expect(styles).toContain('font-size: clamp(38px, 4vw, 50px) !important;');
expect(styles).toContain('row-gap: 34px;');
expect(styles).toContain('max-width: 560px;');
```

Keep the existing mobile assertions for `row-gap: 10px`, `-3px`, and `3px`.

- [ ] **Step 3: Run the focused tests and verify RED**

Run:

```powershell
pnpm --filter @figma/my-make-file exec vitest run src/app/components/OnboardingPage.test.tsx src/app/components/OnboardingHeroStyles.test.mjs --configLoader runner
```

Expected: both files fail because the production component still uses the old sentence and `68px` maximum, while CSS still contains the `28px` desktop gap and `-6px` and `6px` transforms.

- [ ] **Step 4: Implement the wide-desktop title and exact shortened copy**

In `frontend/src/app/components/OnboardingPage.tsx`, update only the title size and subtitle text:

```tsx
<h1 className="onboarding-title" style={{
  margin: 0,
  fontSize: 'clamp(48px, 5.8vw, 74px)',
  fontWeight: 800,
  letterSpacing: '0.005em',
  lineHeight: 1.06,
  background: 'linear-gradient(145deg, #321923 0%, #77334f 52%, #5c3155 100%)',
  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
}}>
  <span className="onboarding-title-line onboarding-title-line-first">让沟通更真诚，</span>
  <span className="onboarding-title-line onboarding-title-line-second">让靠近更有分寸</span>
</h1>
<p className="onboarding-subtitle">
  读懂关系信号，组织恰当表达，也尊重彼此边界。
</p>
```

- [ ] **Step 5: Implement responsive headline rhythm**

In `frontend/src/styles/globals.css`, change the wide-desktop rules to:

```css
@media (min-width: 769px) {
  .onboarding-title {
    display: grid;
    row-gap: 40px;
    background: linear-gradient(145deg, #87566f 0%, #c1849f 52%, #a58aa4 100%) !important;
    -webkit-background-clip: text !important;
    background-clip: text !important;
    -webkit-text-fill-color: transparent;
  }
}

.onboarding-title-line-first {
  transform: translateY(-8px);
}

.onboarding-title-line-second {
  transform: translateY(8px);
}

.onboarding-subtitle {
  max-width: 560px;
  margin: 26px 0 0;
  color: rgba(72, 48, 68, 0.72);
  font-size: 16px;
  line-height: 1.75;
}
```

Extend the existing compact-desktop media block with:

```css
@media (min-width: 769px) and (max-width: 1180px) {
  .onboarding-layout { gap: 40px !important; }
  .onboarding-title {
    font-size: clamp(38px, 4vw, 50px) !important;
    row-gap: 34px;
  }
  .onboarding-title-line-first { transform: translateY(-6px); }
  .onboarding-title-line-second { transform: translateY(6px); }
  .onboarding-hero3d { transform: scale(0.76); transform-origin: center; }
}
```

The existing mobile block remains later in the file for mobile `font-size`, `row-gap`, and line-transform values.

- [ ] **Step 6: Run focused tests and verify GREEN**

Run:

```powershell
pnpm --filter @figma/my-make-file exec vitest run src/app/components/OnboardingPage.test.tsx src/app/components/OnboardingHeroStyles.test.mjs --configLoader runner
```

Expected: 2 test files pass.

- [ ] **Step 7: Commit the typography and copy change**

```powershell
git add frontend/src/app/components/OnboardingPage.test.tsx frontend/src/app/components/OnboardingHeroStyles.test.mjs frontend/src/app/components/OnboardingPage.tsx frontend/src/styles/globals.css
git commit -m "style: strengthen onboarding headline rhythm"
```

---

### Task 2: Add five restrained star decorations

**Files:**
- Modify: `frontend/src/app/components/OnboardingPage.test.tsx`
- Modify: `frontend/src/app/components/OnboardingHeroStyles.test.mjs`
- Modify: `frontend/src/app/components/OnboardingPage.tsx`
- Modify: `frontend/src/styles/globals.css`

**Interfaces:**
- Consumes: existing `.hero-spark` element pattern and `@keyframes heroSparkDrift` custom properties `--spark-x`, `--spark-y`, `--spark-duration`, and `--spark-delay`.
- Produces: `.hero-spark-nine` through `.hero-spark-thirteen`, all decorative and `aria-hidden`.

- [ ] **Step 1: Write failing component assertions for thirteen decorative sparks**

In `frontend/src/app/components/OnboardingPage.test.tsx`, change the spark count and assert the new selectors are decorative:

```tsx
expect(container.querySelectorAll('.hero-spark')).toHaveLength(13);
expect(container.querySelector('.hero-spark-nine')).toHaveAttribute('aria-hidden', 'true');
expect(container.querySelector('.hero-spark-thirteen')).toHaveAttribute('aria-hidden', 'true');
```

- [ ] **Step 2: Write failing style assertions for the new star range and positions**

In `frontend/src/app/components/OnboardingHeroStyles.test.mjs`, replace the old eighth-spark assertion with:

```js
expect(styles).toContain('.hero-spark-nine');
expect(styles).toContain('.hero-spark-thirteen');
expect(styles).toContain('top: 86px; left: 22px;');
expect(styles).toContain('bottom: 54px; left: 54px;');
```

- [ ] **Step 3: Run focused tests and verify RED**

Run:

```powershell
pnpm --filter @figma/my-make-file exec vitest run src/app/components/OnboardingPage.test.tsx src/app/components/OnboardingHeroStyles.test.mjs --configLoader runner
```

Expected: failures report 8 sparks instead of 13 and missing selectors `.hero-spark-nine` through `.hero-spark-thirteen`.

- [ ] **Step 4: Add five semantic-free star spans**

In `frontend/src/app/components/OnboardingPage.tsx`, append these spans directly after `.hero-spark-eight` and before `.hero-signal-trail`:

```tsx
<span className="hero-spark hero-spark-nine" aria-hidden>✧</span>
<span className="hero-spark hero-spark-ten" aria-hidden>✦</span>
<span className="hero-spark hero-spark-eleven" aria-hidden>✦</span>
<span className="hero-spark hero-spark-twelve" aria-hidden>✧</span>
<span className="hero-spark hero-spark-thirteen" aria-hidden>✦</span>
```

- [ ] **Step 5: Style the five stars with distinct slow drift**

In `frontend/src/styles/globals.css`, append these selectors after `.hero-spark-eight`:

```css
.hero-spark-nine     { top: 86px; left: 22px; color: #f5dce8; font-size: 12px; --spark-x: -5px; --spark-y: -8px; --spark-duration: 7.2s; --spark-delay: -1.4s; }
.hero-spark-ten      { top: 74px; right: -36px; color: #e98cab; font-size: 18px; --spark-x: 7px; --spark-y: -6px; --spark-duration: 8.8s; --spark-delay: -4.8s; }
.hero-spark-eleven   { top: 236px; right: 76px; color: #d9aa68; font-size: 10px; --spark-x: -4px; --spark-y: 6px; --spark-duration: 6.6s; --spark-delay: -2.1s; }
.hero-spark-twelve   { right: -42px; bottom: 118px; color: #c5b0dc; font-size: 15px; --spark-x: 8px; --spark-y: 7px; --spark-duration: 9.6s; --spark-delay: -6.2s; }
.hero-spark-thirteen { bottom: 54px; left: 54px; color: #efb3ca; font-size: 13px; --spark-x: -6px; --spark-y: 8px; --spark-duration: 8.1s; --spark-delay: -3.9s; }
```

Add `.hero-spark-nine` through `.hero-spark-thirteen` to the existing mobile hide selector list:

```css
.hero-spark-three,
.hero-spark-four,
.hero-spark-five,
.hero-spark-six,
.hero-spark-seven,
.hero-spark-eight,
.hero-spark-nine,
.hero-spark-ten,
.hero-spark-eleven,
.hero-spark-twelve,
.hero-spark-thirteen,
.hero-signal-trail {
  display: none;
}
```

- [ ] **Step 6: Run focused tests and verify GREEN**

Run:

```powershell
pnpm --filter @figma/my-make-file exec vitest run src/app/components/OnboardingPage.test.tsx src/app/components/OnboardingHeroStyles.test.mjs --configLoader runner
```

Expected: 2 test files pass.

- [ ] **Step 7: Commit the decoration change**

```powershell
git add frontend/src/app/components/OnboardingPage.test.tsx frontend/src/app/components/OnboardingHeroStyles.test.mjs frontend/src/app/components/OnboardingPage.tsx frontend/src/styles/globals.css
git commit -m "style: enrich onboarding star field"
```

---

### Task 3: Verify responsive composition and production readiness

**Files:**
- Verify: `frontend/src/app/components/OnboardingPage.tsx`
- Verify: `frontend/src/styles/globals.css`
- Verify: `frontend/src/app/components/OnboardingPage.test.tsx`
- Verify: `frontend/src/app/components/OnboardingHeroStyles.test.mjs`

**Interfaces:**
- Consumes: completed typography, copy, and star-field changes from Tasks 1 and 2.
- Produces: browser measurements and screenshots proving the two desktop compositions remain inside their viewports.

- [ ] **Step 1: Run the complete frontend test suite**

Run:

```powershell
pnpm --filter @figma/my-make-file test -- --run
```

Expected: all test files pass with zero failures.

- [ ] **Step 2: Run type checking and the production build**

Run:

```powershell
pnpm --filter @figma/my-make-file build
```

Expected: TypeScript exits successfully and Vite produces `frontend/dist`.

- [ ] **Step 3: Inspect the 1440x900 desktop render**

Open `http://127.0.0.1:5174/`, set viewport to 1440x900, wait for `.onboarding-hero3d canvas`, and verify:

```js
const first = document.querySelector('.onboarding-title-line-first').getBoundingClientRect();
const second = document.querySelector('.onboarding-title-line-second').getBoundingClientRect();
const subtitle = document.querySelector('.onboarding-subtitle').getBoundingClientRect();
const sparks = [...document.querySelectorAll('.hero-spark')].map((el) => el.getBoundingClientRect());
({
  visibleLineGap: second.top - first.bottom,
  firstLineHeight: first.height,
  secondLineHeight: second.height,
  subtitleHeight: subtitle.height,
  sparkCount: sparks.length,
  sparksWithinViewport: sparks.every((r) => r.left >= 0 && r.right <= innerWidth && r.top >= 0 && r.bottom <= innerHeight),
  horizontalOverflow: document.documentElement.scrollWidth > innerWidth,
});
```

Expected: visible line gap is approximately 56px, each heading span occupies one rendered row, subtitle height is one CSS line, spark count is 13, all sparks remain in the viewport, and horizontal overflow is false.

- [ ] **Step 4: Inspect the 1014x904 compact-desktop render**

Repeat the same measurement at 1014x904.

Expected: visible line gap is approximately 46px, each explicit heading span remains one rendered row, spark count is 13, no new star covers the heart or chat bubble text, all decorations remain in the viewport, the CTA is visible, and horizontal overflow is false. The shortened subtitle may wrap naturally at this width.

- [ ] **Step 5: Inspect the motion and reduced-motion behavior**

Observe the normal page long enough to confirm the five new stars drift slowly without orbiting or jumping. Emulate `prefers-reduced-motion: reduce` and confirm computed `animation-name` is `none` for `.hero-spark-nine` and `.hero-spark-thirteen`.

- [ ] **Step 6: Perform the final pre-flight review**

Confirm the visible onboarding page contains no em dash characters, the CTA text remains on one desktop line, the rose-lavender palette and soft-radius system remain consistent, and the new stars do not introduce interaction or accessibility content.

- [ ] **Step 7: Confirm the worktree is clean**

Run:

```powershell
git status --short
```

Expected: no output.
