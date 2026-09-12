// Screenshot the onboarding (landing) page with a fresh profile so the 3D hero renders.
import { chromium } from '@playwright/test';
const OUT = 'D:/Project/Lumi/.shots';
const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
for (const vp of [{ name: 'desktop', width: 1440, height: 900 }, { name: 'laptop', width: 1180, height: 800 }, { name: 'mobile', width: 390, height: 844 }]) {
  const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
  const page = await ctx.newPage();
  const errors = [];
  page.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') errors.push(m.type() + ': ' + m.text().slice(0, 160)); });
  page.on('pageerror', (e) => errors.push('PAGEERROR ' + e.message));
  await page.goto('http://localhost:5173/');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(3500);
  const info = await page.evaluate(() => {
    const c = document.querySelector('.onboarding-hero3d canvas');
    return { canvas: c ? { w: c.width, h: c.height, cssW: c.getBoundingClientRect().width } : null, docW: document.documentElement.scrollWidth, vw: innerWidth };
  });
  console.log(vp.name, JSON.stringify(info), errors.slice(0, 4));
  await page.screenshot({ path: `${OUT}/onboarding-${vp.name}.png` });
  await ctx.close();
}
await browser.close();
