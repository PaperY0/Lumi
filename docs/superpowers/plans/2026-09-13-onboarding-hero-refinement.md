# Onboarding Hero Refinement Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox syntax for tracking.

**Goal:** Soften the desktop onboarding headline, shift the brand lockup, enlarge only the 3D heart, and turn the decorative conversation layer into six gently drifting bubbles.

**Architecture:** OnboardingPage.tsx declares six decorative callouts. globals.css owns desktop placement, the softer text gradient, and transform-only motion. HeroScene.tsx exports one scale constant and applies it only to the HeartGem mesh.

**Tech Stack:** React 18, TypeScript, Vite 6, Vitest 4, Three.js, CSS animations.

## Global Constraints

- Apply visual changes only at 769 px and above.
- Preserve onboarding copy, CTA, GLB asset, model camera, root fit, and gold orbit geometry.
- Continuous bubble motion uses transform and opacity only.
- Keep bubbles aria-hidden and disable their animation under prefers-reduced-motion.
- Preserve the existing mobile rule that hides the WebGL hero.

---

## File Structure

- Modify: frontend/src/app/components/OnboardingPage.tsx — six callouts.
- Create: frontend/src/app/components/OnboardingPage.test.tsx — count and decorative accessibility contract.
- Modify: frontend/src/app/components/HeroScene.tsx — isolated HeartGem scaling.
- Create: frontend/src/app/components/HeroScene.test.ts — heart scale contract.
- Modify: frontend/src/styles/globals.css — color, placement, motion, reduced-motion rules.

### Task 1: Define and test the decorative conversation layer

**Files:**

- Create: frontend/src/app/components/OnboardingPage.test.tsx
- Modify: frontend/src/app/components/OnboardingPage.tsx:82-86

**Interfaces:**

- Consumes: OnboardingPageProps with onComplete: () => void.
- Produces: six .hero-callout elements inside .onboarding-hero3d, all aria-hidden.

- [ ] **Step 1: Write the failing component test**

~~~tsx
import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import { OnboardingPage } from './OnboardingPage';

vi.mock('./HeroScene', () => ({
  HeroScene: () => <div data-testid="hero-scene" />,
}));

describe('OnboardingPage hero conversation layer', () => {
  it('renders six decorative callouts around the desktop hero', () => {
    const { container } = render(<OnboardingPage onComplete={vi.fn()} />);
    expect(container.querySelectorAll('.hero-callout')).toHaveLength(6);
    expect(screen.getByText('在吗？')).toHaveAttribute('aria-hidden', 'true');
    expect(screen.getByText('慢慢来，也很好')).toHaveAttribute('aria-hidden', 'true');
  });
});
~~~

- [ ] **Step 2: Run the test and verify it fails**

Run: pnpm --filter @figma/my-make-file exec vitest run src/app/components/OnboardingPage.test.tsx --configLoader runner

Expected: FAIL because the page currently renders three .hero-callout elements.

- [ ] **Step 3: Add the three decorative callouts**

Place this complete group immediately after <HeroScene size={580} />:

~~~tsx
<div className="hero-callout hero-callout-one" aria-hidden>在吗？</div>
<div className="hero-callout hero-callout-two" aria-hidden>今天想见你</div>
<div className="hero-callout hero-callout-three" aria-hidden>慢慢来，也很好</div>
<div className="hero-callout hero-callout-four" aria-hidden>到家说一声</div>
<div className="hero-callout hero-callout-five" aria-hidden>我在听</div>
<div className="hero-callout hero-callout-six" aria-hidden>晚安，好梦</div>
~~~

- [ ] **Step 4: Run the focused test and verify it passes**

Run: pnpm --filter @figma/my-make-file exec vitest run src/app/components/OnboardingPage.test.tsx --configLoader runner

Expected: PASS with one passing test.

- [ ] **Step 5: Commit**

~~~powershell
git add frontend/src/app/components/OnboardingPage.tsx frontend/src/app/components/OnboardingPage.test.tsx
git commit -m "feat: enrich onboarding conversation layer"
~~~

### Task 2: Scale only the heart gem in the Three.js scene

**Files:**

- Create: frontend/src/app/components/HeroScene.test.ts
- Modify: frontend/src/app/components/HeroScene.tsx:20,75-98

**Interfaces:**

- Produces: HEART_GEM_SCALE exported as readonly { x: number; y: number; z: number }.
- Consumes: GLB mesh name HeartGem.

- [ ] **Step 1: Write the failing scale-contract test**

~~~ts
import { expect, test } from 'vitest';
import { HEART_GEM_SCALE } from './HeroScene';

test('keeps the heart wider and taller without changing depth', () => {
  expect(HEART_GEM_SCALE).toEqual({ x: 1.14, y: 1.18, z: 1 });
});
~~~

- [ ] **Step 2: Run it and verify it fails**

Run: pnpm --filter @figma/my-make-file exec vitest run src/app/components/HeroScene.test.ts --configLoader runner

Expected: FAIL because HEART_GEM_SCALE is not exported.

- [ ] **Step 3: Export and apply the scale only to HeartGem**

Add after const MODEL_URL:

~~~ts
export const HEART_GEM_SCALE = { x: 1.14, y: 1.18, z: 1 } as const;
~~~

Add as the first line inside the existing mesh.name === 'HeartGem' branch:

~~~ts
mesh.scale.set(HEART_GEM_SCALE.x, HEART_GEM_SCALE.y, HEART_GEM_SCALE.z);
~~~

Do not scale root, group, ribbons, halo, pearls, or camera.

- [ ] **Step 4: Run test and type-check**

Run: pnpm --filter @figma/my-make-file exec vitest run src/app/components/HeroScene.test.ts --configLoader runner

Expected: PASS with one passing test.

Run: pnpm --filter @figma/my-make-file type-check

Expected: exits with code 0.

- [ ] **Step 5: Commit**

~~~powershell
git add frontend/src/app/components/HeroScene.tsx frontend/src/app/components/HeroScene.test.ts
git commit -m "feat: enlarge onboarding heart gem"
~~~

### Task 3: Apply desktop visual treatment and drift choreography

**Files:**

- Modify: frontend/src/styles/globals.css:401-490

**Interfaces:**

- Consumes: .onboarding-brand, .onboarding-title, .hero-callout, and the six hero-callout-* classes.
- Produces: a desktop-only brand offset, lighter heading gradient, six positions, and heroBubbleDrift animation.

- [ ] **Step 1: Add desktop color and placement rules**

Insert above .onboarding-copy:

~~~css
@media (min-width: 769px) {
  .onboarding-brand {
    transform: translate(-16px, -18px);
  }

  .onboarding-title {
    background: linear-gradient(145deg, #6f4058 0%, #ae6d89 52%, #92738e 100%) !important;
  }
}
~~~

The important flag overrides the current inline gradient only on desktop; keep its existing background-clip declarations.

- [ ] **Step 2: Replace shared bubble motion with individual drift**

Replace the existing .hero-callout animation declaration and the three placement rules:

~~~css
.hero-callout {
  animation: heroBubbleDrift var(--bubble-duration, 8s) ease-in-out var(--bubble-delay, 0s) infinite alternate;
}

.hero-callout-one   { top: 66px; left: 28px; --bubble-x: 10px; --bubble-y: -8px; --bubble-duration: 7.4s; --bubble-delay: -1.2s; }
.hero-callout-two   { bottom: 112px; left: -4px; --bubble-x: -9px; --bubble-y: 8px; --bubble-duration: 8.6s; --bubble-delay: -4.1s; }
.hero-callout-three { right: -10px; bottom: 54px; --bubble-x: 12px; --bubble-y: -6px; --bubble-duration: 9.8s; --bubble-delay: -2.8s; }
.hero-callout-four  { top: 166px; right: 8px; --bubble-x: -10px; --bubble-y: 9px; --bubble-duration: 7.9s; --bubble-delay: -5.3s; }
.hero-callout-five  { top: 278px; left: -20px; --bubble-x: 8px; --bubble-y: 10px; --bubble-duration: 9.1s; --bubble-delay: -3.6s; }
.hero-callout-six   { right: 68px; bottom: 6px; --bubble-x: -12px; --bubble-y: -8px; --bubble-duration: 8.2s; --bubble-delay: -6.4s; }

@keyframes heroBubbleDrift {
  from { transform: translate3d(0, 0, 0); }
  to { transform: translate3d(var(--bubble-x), var(--bubble-y), 0); }
}
~~~

Retain heroCalloutFloat for the two spark elements.

- [ ] **Step 3: Retain the reduced-motion behavior**

Keep this selector exactly:

~~~css
@media (prefers-reduced-motion: reduce) {
  .hero-callout,
  .hero-spark {
    animation: none;
  }
}
~~~

- [ ] **Step 4: Verify the final presentation**

Run: pnpm --filter @figma/my-make-file build

Expected: exits with code 0.

Run: pnpm dev -- --host 127.0.0.1

Expected: Vite reports Local: http://127.0.0.1:5173/.

At 1440 px, verify the heading is lighter but readable, the brand is shifted left/up, the heart is larger without a larger halo, and six bubbles are visible without overlap. At 390 px, verify the single-column mobile view still hides the 3D preview. At desktop width with reduced motion emulated, verify bubbles and sparks stay still.

- [ ] **Step 5: Commit**

~~~powershell
git add frontend/src/styles/globals.css
git commit -m "style: soften and animate onboarding hero"
~~~

### Task 4: Run complete frontend verification

**Files:**

- Modify: none

**Interfaces:**

- Consumes: completed Tasks 1-3.
- Produces: verified desktop, mobile, and reduced-motion onboarding behavior.

- [ ] **Step 1: Run all frontend tests**

Run: pnpm --filter @figma/my-make-file test

Expected: exits with code 0.

- [ ] **Step 2: Run type-check and production build**

Run: pnpm --filter @figma/my-make-file type-check

Expected: exits with code 0.

Run: pnpm --filter @figma/my-make-file build

Expected: exits with code 0.

- [ ] **Step 3: Verify repository state**

Run: git status --short --branch

Expected: only commits from this plan and no uncommitted files.

## Plan Self-Review

- Spec coverage: Task 1 covers six bubbles; Task 2 isolates heart resize; Task 3 covers color, brand placement, motion, desktop and reduced-motion behavior; Task 4 covers verification.
- Placeholder scan: no placeholders or deferred implementation instructions remain.
- Type consistency: HEART_GEM_SCALE, .hero-callout, and the six numbered callout classes use the same names throughout.

