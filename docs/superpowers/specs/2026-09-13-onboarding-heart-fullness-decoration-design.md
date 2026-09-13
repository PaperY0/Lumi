# Onboarding Heart Fullness and Decoration Design

## Goal

Make the existing 3D heart rounder and fuller, give the desktop title more breathing room, and enrich the page with restrained decorative details while preserving the current composition.

## Heart Shape

- Keep the existing `HeartGem` mesh, material, scene, orbit, and animation.
- Clone the heart geometry before modification so no shared GLTF geometry is mutated.
- Increase the heart transform from `{ x: 1.34, y: 1.42, z: 1 }` to `{ x: 1.42, y: 1.43, z: 1.06 }`.
- Apply a bounded local-space deformation based on the geometry bounding box:
  - widen the middle side contour by up to `10%`, strongest near the vertical center and tapering to zero at the top and tip;
  - widen the outer portion of the upper lobes by up to an additional `5%`;
  - increase middle depth by up to `4%` for a softer, more dimensional highlight.
- Normalize each vertex to `nx = abs(x / halfWidth)` and `ny = (y - centerY) / halfHeight`, clamped to `0..1` and `-1..1`. Use `middleWeight = 1 - abs(ny)` and `upperWeight = max(0, 1 - abs(ny - 0.5) / 0.5) * nx`; multiply `x` by `1 + 0.10 * middleWeight + 0.05 * upperWeight` and `z` by `1 + 0.04 * middleWeight`.
- Recompute vertex normals and geometry bounds after deformation.
- Do not scale or deform the gold orbit, pink frame, lavender ribbon, particles, or scene root.

## Desktop Title Spacing

- Increase the first-line desktop transform from `translateY(-6px)` to `translateY(-12px)`.
- Increase the second-line desktop transform from `translateY(6px)` to `translateY(12px)`.
- Keep the title font size, letter spacing, gradient, wrapper position, and subtitle position unchanged.
- Keep the existing mobile transforms at `-3px` and `3px`; the user specifically requested stronger desktop spacing.

## Decorative Layer

- Keep the existing two hero sparks and add six decorative items for eight total.
- Use a restrained mix of small hearts, four-point stars, and pearl dots.
- Distribute them around and slightly beyond the heart scene so they fill the visual field without covering the title, button, chat bubbles, or heart focal point.
- Add one faint curved signal trail behind the 3D hero to visually connect the copy and illustration without changing flex layout.
- Decorations are `aria-hidden`, non-interactive, low-opacity, and use independent slow drift animations between `5.5s` and `9s` with movement no greater than `10px`.
- Disable decorative animation under `prefers-reduced-motion: reduce`.
- Hide the extended decorative layer on mobile if it creates crowding; the existing two compact sparks may remain.

## Boundaries

- Do not replace the GLB model.
- Do not change the brand block, six chat messages, CTA, page columns, 580px scene box, background palette, or route behavior.
- Do not introduce a new runtime dependency.

## Verification

- Unit-test the exported heart scale and deformation constants.
- Test that the geometry deformation leaves vertical coordinates unchanged, widens middle side vertices more than extreme top and tip vertices, and updates depth only within the bounded amount.
- Assert eight decorative items, the curved trail, desktop title offsets, and reduced-motion coverage.
- Run focused tests, all frontend tests, TypeScript production build, and desktop browser visual verification at `1440x900`.
