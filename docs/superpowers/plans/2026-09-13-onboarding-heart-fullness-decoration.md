# Onboarding Heart Fullness and Decoration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the existing 3D heart wider, rounder, and more dimensional; increase desktop title-line separation; and add restrained ambient decoration without changing the page composition.

**Architecture:** Add one pure exported Three.js geometry-cloning function in `HeroScene.tsx`, then apply it only to `HeartGem` before scene normalization. Extend the existing title-line and hero-spark patterns in `OnboardingPage.tsx` and `globals.css`, preserving the current 580px scene, flex layout, GLB asset, and reduced-motion behavior.

**Tech Stack:** React, TypeScript, Three.js, CSS, Vitest, Testing Library, Vite

## Global Constraints

- Keep the existing GLB, material treatment, orbit, ribbons, scene root, and animation.
- Use heart scale `{ x: 1.42, y: 1.43, z: 1.06 }`.
- Widen the middle contour by at most `10%`, upper outer lobes by at most an additional `5%`, and middle depth by at most `4%`.
- Use desktop title transforms of `-12px` and `12px`; keep mobile at `-3px` and `3px`.
- Use eight total decorative spark items and one faint signal trail.
- Do not change the brand, CTA, six chat messages, columns, background palette, 580px scene box, or route behavior.
- Add no runtime dependency.

---

### Task 1: Fuller Heart Geometry

**Files:**
- Modify: `frontend/src/app/components/HeroScene.tsx`
- Test: `frontend/src/app/components/HeroScene.test.ts`

**Interfaces:**
- Consumes: `THREE.BufferGeometry` from the GLTF `HeartGem` mesh.
- Produces: `createFullerHeartGeometry(source: THREE.BufferGeometry): THREE.BufferGeometry`, `HEART_GEM_SCALE`, and `HEART_GEM_DEFORMATION`.

- [ ] **Step 1: Write failing scale and deformation tests**

Extend `HeroScene.test.ts` with a geometry containing vertices at the vertical center, upper lobe, top, and tip. Assert:

```ts
expect(HEART_GEM_SCALE).toEqual({ x: 1.42, y: 1.43, z: 1.06 });
expect(HEART_GEM_DEFORMATION).toEqual({ sideBulge: 0.1, upperLobeBulge: 0.05, depthBulge: 0.04 });

const source = new THREE.BufferGeometry();
source.setAttribute('position', new THREE.Float32BufferAttribute([
  1, 0, 0.5,
  1, 0.5, 0.5,
  1, 1, 0.5,
  1, -1, 0.5,
  -1, 0, 0.5,
], 3));
const result = createFullerHeartGeometry(source);
const position = result.getAttribute('position');

expect(result).not.toBe(source);
expect(position.getX(0)).toBeCloseTo(1.1);
expect(position.getZ(0)).toBeCloseTo(0.52);
expect(position.getX(1)).toBeCloseTo(1.1);
expect(position.getY(1)).toBeCloseTo(0.5);
expect(position.getX(2)).toBeCloseTo(1);
expect(position.getX(3)).toBeCloseTo(1);
expect(position.getX(4)).toBeCloseTo(-1.1);
```

- [ ] **Step 2: Run the focused test and verify it fails**

```powershell
pnpm --filter @figma/my-make-file exec vitest run src/app/components/HeroScene.test.ts --configLoader runner
```

Expected: FAIL because the new constants and deformation function do not exist.

- [ ] **Step 3: Implement the geometry clone and bounded deformation**

In `HeroScene.tsx`, export the new constants and function:

```ts
export const HEART_GEM_SCALE = { x: 1.42, y: 1.43, z: 1.06 } as const;
export const HEART_GEM_DEFORMATION = {
  sideBulge: 0.1,
  upperLobeBulge: 0.05,
  depthBulge: 0.04,
} as const;

export function createFullerHeartGeometry(source: THREE.BufferGeometry): THREE.BufferGeometry {
  const geometry = source.clone();
  geometry.computeBoundingBox();
  const box = geometry.boundingBox;
  const position = geometry.getAttribute('position');
  if (!box || !position) return geometry;

  const centerX = (box.min.x + box.max.x) / 2;
  const centerY = (box.min.y + box.max.y) / 2;
  const halfWidth = Math.max((box.max.x - box.min.x) / 2, Number.EPSILON);
  const halfHeight = Math.max((box.max.y - box.min.y) / 2, Number.EPSILON);

  for (let index = 0; index < position.count; index += 1) {
    const x = position.getX(index);
    const y = position.getY(index);
    const z = position.getZ(index);
    const dx = x - centerX;
    const nx = THREE.MathUtils.clamp(Math.abs(dx) / halfWidth, 0, 1);
    const ny = THREE.MathUtils.clamp((y - centerY) / halfHeight, -1, 1);
    const middleWeight = 1 - Math.abs(ny);
    const upperWeight = Math.max(0, 1 - Math.abs(ny - 0.5) / 0.5) * nx;
    const widthFactor = 1
      + HEART_GEM_DEFORMATION.sideBulge * middleWeight
      + HEART_GEM_DEFORMATION.upperLobeBulge * upperWeight;
    const depthFactor = 1 + HEART_GEM_DEFORMATION.depthBulge * middleWeight;
    position.setXYZ(index, centerX + dx * widthFactor, y, z * depthFactor);
  }

  position.needsUpdate = true;
  geometry.computeVertexNormals();
  geometry.computeBoundingBox();
  geometry.computeBoundingSphere();
  return geometry;
}
```

- [ ] **Step 4: Apply deformation only to `HeartGem`**

Inside the existing `mesh.name === 'HeartGem'` branch, add this before setting scale:

```ts
mesh.geometry = createFullerHeartGeometry(mesh.geometry);
mesh.scale.set(HEART_GEM_SCALE.x, HEART_GEM_SCALE.y, HEART_GEM_SCALE.z);
```

- [ ] **Step 5: Run the focused test and verify it passes**

```powershell
pnpm --filter @figma/my-make-file exec vitest run src/app/components/HeroScene.test.ts --configLoader runner
```

Expected: the heart scale and deformation test passes.

- [ ] **Step 6: Commit the heart change**

```powershell
git add frontend/src/app/components/HeroScene.tsx frontend/src/app/components/HeroScene.test.ts
git commit -m "feat: round out onboarding heart geometry"
```

---

### Task 2: Desktop Title Breathing Room

**Files:**
- Modify: `frontend/src/styles/globals.css`
- Test: `frontend/src/app/components/OnboardingHeroStyles.test.mjs`

**Interfaces:**
- Consumes: `.onboarding-title-line-first` and `.onboarding-title-line-second`.
- Produces: stronger desktop transforms while retaining the existing mobile override.

- [ ] **Step 1: Update the style assertions first**

Replace the desktop transform assertions with:

```js
expect(styles).toContain('transform: translateY(-12px);');
expect(styles).toContain('transform: translateY(12px);');
expect(styles).toContain('transform: translateY(-3px);');
expect(styles).toContain('transform: translateY(3px);');
```

- [ ] **Step 2: Run the style test and verify it fails**

```powershell
pnpm --filter @figma/my-make-file exec vitest run src/app/components/OnboardingHeroStyles.test.mjs --configLoader runner
```

Expected: FAIL because desktop still uses `-6px` and `6px`.

- [ ] **Step 3: Increase only the desktop offsets**

Change the base rules in `globals.css` to:

```css
.onboarding-title-line-first {
  transform: translateY(-12px);
}

.onboarding-title-line-second {
  transform: translateY(12px);
}
```

Leave the existing mobile media-query values at `-3px` and `3px`.

- [ ] **Step 4: Run the style test and verify it passes**

```powershell
pnpm --filter @figma/my-make-file exec vitest run src/app/components/OnboardingHeroStyles.test.mjs --configLoader runner
```

Expected: the style test passes.

- [ ] **Step 5: Commit the title change**

```powershell
git add frontend/src/styles/globals.css frontend/src/app/components/OnboardingHeroStyles.test.mjs
git commit -m "style: open up onboarding title spacing"
```

---

### Task 3: Ambient Decorative Layer

**Files:**
- Modify: `frontend/src/app/components/OnboardingPage.tsx`
- Modify: `frontend/src/styles/globals.css`
- Test: `frontend/src/app/components/OnboardingPage.test.tsx`
- Test: `frontend/src/app/components/OnboardingHeroStyles.test.mjs`

**Interfaces:**
- Consumes: existing `.hero-spark` and reduced-motion styles.
- Produces: eight total `.hero-spark` elements and one `.hero-signal-trail`.

- [ ] **Step 1: Write failing decoration assertions**

Add to `OnboardingPage.test.tsx`:

```tsx
expect(container.querySelectorAll('.hero-spark')).toHaveLength(8);
expect(container.querySelector('.hero-signal-trail')).toHaveAttribute('aria-hidden', 'true');
```

Add to `OnboardingHeroStyles.test.mjs`:

```js
expect(styles).toContain('.hero-spark-eight');
expect(styles).toContain('.hero-signal-trail');
expect(styles).toContain('@keyframes heroSparkDrift');
```

- [ ] **Step 2: Run focused onboarding tests and verify they fail**

```powershell
pnpm --filter @figma/my-make-file exec vitest run src/app/components/OnboardingPage.test.tsx src/app/components/OnboardingHeroStyles.test.mjs --configLoader runner
```

Expected: FAIL because only two sparks exist and there is no signal trail or spark-drift keyframe.

- [ ] **Step 3: Add six decorative items and the signal trail**

After the existing two spark spans in `OnboardingPage.tsx`, add:

```tsx
<span className="hero-spark hero-spark-three" aria-hidden>♥</span>
<span className="hero-spark hero-spark-four" aria-hidden>✦</span>
<span className="hero-spark hero-spark-five" aria-hidden>●</span>
<span className="hero-spark hero-spark-six" aria-hidden>♥</span>
<span className="hero-spark hero-spark-seven" aria-hidden>●</span>
<span className="hero-spark hero-spark-eight" aria-hidden>✧</span>
<span className="hero-signal-trail" aria-hidden />
```

- [ ] **Step 4: Style the decorative layer**

Keep `.hero-spark` non-interactive and define independent positions, durations, delays, and drift vectors between `5.5s` and `9s`, each no greater than `10px`. Use muted rose, champagne, pearl, and lavender colors. Add:

```css
.hero-signal-trail {
  position: absolute;
  top: 214px;
  left: -94px;
  z-index: 0;
  width: 330px;
  height: 112px;
  border-top: 1px solid rgba(202, 132, 164, 0.2);
  border-radius: 50%;
  transform: rotate(12deg);
  opacity: 0.72;
  pointer-events: none;
  mask-image: linear-gradient(90deg, transparent, black 24%, black 76%, transparent);
}

@keyframes heroSparkDrift {
  from { transform: translate3d(0, 0, 0) scale(0.96); }
  to { transform: translate3d(var(--spark-x), var(--spark-y), 0) scale(1.05); }
}
```

Set the spark animation and explicit variants to:

```css
.hero-spark {
  opacity: 0.76;
  animation: heroSparkDrift var(--spark-duration, 7s) ease-in-out var(--spark-delay, 0s) infinite alternate;
}

.hero-spark-one   { top: 126px; right: 20px; font-size: 18px; --spark-x: 6px; --spark-y: -8px; --spark-duration: 6.2s; --spark-delay: -1s; }
.hero-spark-two   { top: 38px; left: 164px; color: #d4a062; font-size: 20px; --spark-x: -7px; --spark-y: 6px; --spark-duration: 7.4s; --spark-delay: -2s; }
.hero-spark-three { top: 92px; left: -24px; color: #dca2c6; font-size: 14px; --spark-x: -8px; --spark-y: -6px; --spark-duration: 8.2s; --spark-delay: -3.2s; }
.hero-spark-four  { top: 208px; right: -38px; color: #d9ab74; font-size: 16px; --spark-x: 8px; --spark-y: 7px; --spark-duration: 6.8s; --spark-delay: -4.4s; }
.hero-spark-five  { top: 252px; left: -52px; color: #f1cad8; font-size: 10px; --spark-x: -6px; --spark-y: 9px; --spark-duration: 9s; --spark-delay: -1.8s; }
.hero-spark-six   { bottom: 18px; left: 210px; color: #ee9bb7; font-size: 15px; --spark-x: 7px; --spark-y: 8px; --spark-duration: 7.8s; --spark-delay: -5s; }
.hero-spark-seven { top: 16px; right: 92px; color: #f3dbe5; font-size: 11px; --spark-x: 5px; --spark-y: -7px; --spark-duration: 5.8s; --spark-delay: -2.6s; }
.hero-spark-eight { bottom: 174px; right: 6px; color: #bca9d8; font-size: 17px; --spark-x: -9px; --spark-y: 6px; --spark-duration: 8.6s; --spark-delay: -6s; }
```

Give `.hero-signal-trail` an `8s` alternate `heroTrailBreathe` animation between `0.38` and `0.72` opacity.

- [ ] **Step 5: Extend reduced-motion and mobile rules**

Include `.hero-signal-trail` in the reduced-motion block, disable its animation, and hold opacity at `0.55`. In the existing mobile onboarding media query, hide `.hero-spark-three` through `.hero-spark-eight` and `.hero-signal-trail` with `display: none`.

- [ ] **Step 6: Run focused onboarding tests and verify they pass**

```powershell
pnpm --filter @figma/my-make-file exec vitest run src/app/components/OnboardingPage.test.tsx src/app/components/OnboardingHeroStyles.test.mjs --configLoader runner
```

Expected: both test files pass.

- [ ] **Step 7: Run full verification**

```powershell
pnpm --filter @figma/my-make-file test -- --run
pnpm --filter @figma/my-make-file build
```

Expected: all frontend tests pass and the TypeScript/Vite production build exits successfully.

- [ ] **Step 8: Perform desktop visual verification**

Open `http://127.0.0.1:5174/` at `1440x900` and verify the heart looks wider and softer, remains inside the orbit, title lines have clear breathing room, decoration fills empty areas without covering text or bubbles, and existing layout dimensions remain unchanged.

- [ ] **Step 9: Commit the decorative layer**

```powershell
git add frontend/src/app/components/OnboardingPage.tsx frontend/src/styles/globals.css frontend/src/app/components/OnboardingPage.test.tsx frontend/src/app/components/OnboardingHeroStyles.test.mjs
git commit -m "style: enrich onboarding ambient decoration"
```
