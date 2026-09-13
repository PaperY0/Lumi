import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { expect, test } from 'vitest';

const styles = readFileSync(resolve(process.cwd(), 'src/styles/globals.css'), 'utf8');

test('defines the approved desktop hero color, placement, and bubble drift', () => {
  expect(styles).toContain('transform: translate(-16px, -18px)');
  expect(styles).toContain('#6f4058 0%, #ae6d89 52%, #92738e 100%');
  expect(styles).toContain('-webkit-background-clip: text !important;');
  expect(styles).toContain('@keyframes heroBubbleDrift');
  expect(styles).toContain('.hero-callout-six');
  expect(styles).toContain('animation: none;');
});
