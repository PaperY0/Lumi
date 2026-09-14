import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { expect, test } from 'vitest';

const styles = readFileSync(resolve(process.cwd(), 'src/styles/globals.css'), 'utf8');

function extractBlock(source, selector, fromIndex = 0) {
  const selectorIndex = source.indexOf(selector, fromIndex);
  expect(selectorIndex).toBeGreaterThanOrEqual(0);

  const openingBraceIndex = source.indexOf('{', selectorIndex + selector.length);
  expect(openingBraceIndex).toBeGreaterThan(selectorIndex);

  let depth = 1;
  for (let index = openingBraceIndex + 1; index < source.length; index += 1) {
    if (source[index] === '{') depth += 1;
    if (source[index] === '}') depth -= 1;
    if (depth === 0) return source.slice(openingBraceIndex + 1, index);
  }

  throw new Error(`Unclosed CSS block for ${selector}`);
}

test('defines the approved desktop hero color, spacing, and glass bubble drift', () => {
  const desktopFirstLineStyles = extractBlock(styles, '.onboarding-title-line-first');
  const desktopSecondLineStyles = extractBlock(styles, '.onboarding-title-line-second');

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
  expect(desktopFirstLineStyles).toContain('transform: translateY(-18px);');
  expect(desktopSecondLineStyles).toContain('transform: translateY(0);');
  expect(styles).toContain('font-size: clamp(38px, 4vw, 50px) !important;');
  expect(styles).toContain('row-gap: 34px;');
  expect(styles).toContain('max-width: 560px;');
  expect(styles).toContain('.hero-spark-nine');
  expect(styles).toContain('.hero-spark-thirteen');
  expect(styles).toContain('top: 86px; left: 22px;');
  expect(styles).toContain('bottom: 54px; left: 54px;');
  expect(styles).toContain('.hero-signal-trail');
  expect(styles).toContain('@keyframes heroSparkDrift');
  expect(styles).toContain('animation: none;');
});

test('applies the approved title gap within the mobile onboarding rule', () => {
  const mobileOnboardingStyles = extractBlock(styles, '@media (max-width: 768px)');
  const mobileTitleStyles = extractBlock(mobileOnboardingStyles, '.onboarding-title');
  const mobileFirstLineStyles = extractBlock(mobileOnboardingStyles, '.onboarding-title-line-first');
  const mobileSecondLineStyles = extractBlock(mobileOnboardingStyles, '.onboarding-title-line-second');

  expect(mobileTitleStyles).toContain('display: grid;');
  expect(mobileTitleStyles).toContain('row-gap: 10px;');
  expect(mobileFirstLineStyles).toContain('transform: translateY(-7px);');
  expect(mobileSecondLineStyles).toContain('transform: translateY(0);');

  const compactDesktopStyles = extractBlock(styles, '@media (min-width: 769px) and (max-width: 1180px)');
  const compactFirstLineStyles = extractBlock(compactDesktopStyles, '.onboarding-title-line-first');
  const compactSecondLineStyles = extractBlock(compactDesktopStyles, '.onboarding-title-line-second');
  expect(compactFirstLineStyles).toContain('transform: translateY(-14px);');
  expect(compactSecondLineStyles).toContain('transform: translateY(0);');
});
