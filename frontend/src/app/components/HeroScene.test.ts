import { expect, test } from 'vitest';
import { HEART_GEM_SCALE } from './HeroScene';

test('keeps the heart wider and taller without changing depth', () => {
  expect(HEART_GEM_SCALE).toEqual({ x: 1.34, y: 1.42, z: 1 });
});
