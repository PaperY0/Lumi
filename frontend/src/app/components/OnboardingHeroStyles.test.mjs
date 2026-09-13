import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { expect, test } from 'vitest';

const styles = readFileSync(resolve(process.cwd(), 'src/styles/globals.css'), 'utf8');

test('defines the approved desktop hero color, placement, and bubble drift', () => {
  expect(styles).toContain('transform: translate(-16px, -18px)');
  expect(styles).toContain('#87566f 0%, #c1849f 52%, #a58aa4 100%');
  expect(styles).toContain('-webkit-background-clip: text !important;');
  expect(styles).toContain('@keyframes heroBubbleDrift');
  expect(styles).toContain('.hero-callout-six');
  expect(styles).toContain('--bubble-x: 22px');
  expect(styles).toContain('--bubble-y: -18px');
  expect(styles).toContain('color: #c06f91;');
  expect(styles).toContain('.onboarding-title-line-first');
  expect(styles).toContain('transform: translateY(-12px);');
  expect(styles).toContain('.onboarding-title-line-second');
  expect(styles).toContain('transform: translateY(12px);');
  expect(styles).toContain('transform: translateY(-3px);');
  expect(styles).toContain('transform: translateY(3px);');
  expect(styles).toContain('.hero-spark-eight');
  expect(styles).toContain('.hero-signal-trail');
  expect(styles).toContain('@keyframes heroSparkDrift');
  expect(styles).toContain('animation: none;');
});
