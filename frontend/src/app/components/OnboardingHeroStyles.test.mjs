import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { expect, test } from 'vitest';

const styles = readFileSync(resolve(process.cwd(), 'src/styles/globals.css'), 'utf8');

test('defines the approved desktop hero color, spacing, and glass bubble drift', () => {
  expect(styles).toContain('transform: translate(-16px, -18px)');
  expect(styles).toContain('#87566f 0%, #c1849f 52%, #a58aa4 100%');
  expect(styles).toContain('-webkit-background-clip: text !important;');
  expect(styles).toContain('row-gap: 40px;');
  expect(styles).toContain('@keyframes heroBubbleDrift');
  expect(styles).toContain('.hero-callout-six');
  expect(styles).toContain('background: rgba(255, 252, 253, 0.66);');
  expect(styles).toContain('backdrop-filter: blur(18px) saturate(1.3);');
  expect(styles).toContain('-webkit-backdrop-filter: blur(18px) saturate(1.3);');
  expect(styles).toContain('top: -14px; left: 52px; --bubble-x: 8px; --bubble-y: -6px;');
  expect(styles).toContain('right: 48px; bottom: -18px; --bubble-x: -9px; --bubble-y: -8px;');
  expect(styles).toContain('color: #c06f91;');
  expect(styles).toContain('.onboarding-title-line-first');
  expect(styles).toContain('transform: translateY(-8px);');
  expect(styles).toContain('.onboarding-title-line-second');
  expect(styles).toContain('transform: translateY(8px);');
  expect(styles).toContain('font-size: clamp(38px, 4vw, 50px) !important;');
  expect(styles).toContain('row-gap: 34px;');
  expect(styles).toContain('max-width: 560px;');
  expect(styles).toContain('row-gap: 10px;');
  expect(styles).toContain('transform: translateY(-3px);');
  expect(styles).toContain('transform: translateY(3px);');
  expect(styles).toContain('.hero-spark-eight');
  expect(styles).toContain('.hero-signal-trail');
  expect(styles).toContain('@keyframes heroSparkDrift');
  expect(styles).toContain('animation: none;');
});
