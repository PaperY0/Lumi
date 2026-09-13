import * as THREE from 'three';
import { expect, test } from 'vitest';
import {
  createFullerHeartGeometry,
  HEART_GEM_DEFORMATION,
  HEART_GEM_SCALE,
} from './HeroScene';

test('uses the approved fuller heart proportions', () => {
  expect(HEART_GEM_SCALE).toEqual({ x: 1.42, y: 1.43, z: 1.06 });
  expect(HEART_GEM_DEFORMATION).toEqual({
    sideBulge: 0.1,
    upperLobeBulge: 0.05,
    depthBulge: 0.04,
  });
});

test('rounds the heart middle and upper lobes without moving vertices vertically', () => {
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
});
