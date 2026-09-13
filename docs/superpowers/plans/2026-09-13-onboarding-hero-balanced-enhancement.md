# Onboarding Hero Balanced Enhancement Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox syntax for tracking.

**Goal:** Strengthen title spacing/color, heart scale, and bubble motion without changing layout.

**Architecture:** Existing component and style boundaries remain unchanged. Contract tests are updated first, then minimal constants and CSS values change.

**Tech Stack:** React, TypeScript, Three.js, CSS, Vitest.

## Global Constraints

- Do not modify .onboarding-layout, column proportions, gap, content order, positions, canvas size, orbit, ribbons, or mobile composition.
- Set title letter spacing to 0.005em.
- Set HeartGem scale to { x: 1.34, y: 1.42, z: 1 }.
- Use six bubbles with 14-22 px transform-only drift.
- Preserve reduced-motion behavior.

---

### Task 1: Lock the enhanced visual constants

**Files:**
- Modify: frontend/src/app/components/OnboardingPage.test.tsx
- Modify: frontend/src/app/components/HeroScene.test.ts
- Modify: frontend/src/app/components/OnboardingHeroStyles.test.mjs

- [ ] Update OnboardingPage.test.tsx to assert the h1 inline letterSpacing equals 0.005em.
- [ ] Update HeroScene.test.ts to expect { x: 1.34, y: 1.42, z: 1 }.
- [ ] Update OnboardingHeroStyles.test.mjs to expect gradient #87566f → #c1849f → #a58aa4 and bubble distances --bubble-x: 22px and --bubble-y: -18px.
- [ ] Run the three focused tests and confirm they fail only on the old values.

### Task 2: Apply the balanced enhancement

**Files:**
- Modify: frontend/src/app/components/OnboardingPage.tsx
- Modify: frontend/src/app/components/HeroScene.tsx
- Modify: frontend/src/styles/globals.css

- [ ] Change title letterSpacing from -0.055em to 0.005em.
- [ ] Change HEART_GEM_SCALE to { x: 1.34, y: 1.42, z: 1 }.
- [ ] Change the desktop gradient to linear-gradient(145deg, #87566f 0%, #c1849f 52%, #a58aa4 100%).
- [ ] Set six unique bubble drift vectors within 14-22 px while retaining their current positions, durations, delays, and heroBubbleDrift keyframes.
- [ ] Run focused tests, then all frontend tests, type-check, and production build.
- [ ] Inspect http://127.0.0.1:5174/ at desktop width and reduced-motion mode.
- [ ] Commit the verified changes.

## Self-Review

All approved constants and exclusions map to explicit test and implementation steps. No layout selector is modified. Names match current source and tests.

