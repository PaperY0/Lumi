// Scroll <main> to bottom and screenshot; also dump body/html computed styles.
import { chromium } from '@playwright/test';
import { seed } from './_seed.mjs';
const OUT = 'D:/Project/Lumi/.shots';
const route = process.env.ROUTE || '/ai-analysis';
const width = Number(process.env.W || 1440), height = Number(process.env.H || 900);
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width, height } });
const page = await ctx.newPage();
await seed(page);
await page.goto('http://localhost:5173' + route);
await page.waitForLoadState('networkidle');
await page.waitForTimeout(1200);
const info = await page.evaluate(() => {
  const cs = (el) => { const s = getComputedStyle(el); return { h: s.height, minH: s.minHeight, ov: s.overflow, ovY: s.overflowY }; };
  const main = document.querySelector('main');
  main.scrollTop = main.scrollHeight;
  return { html: cs(document.documentElement), body: cs(document.body), root: cs(document.getElementById('root')), main: { scrollTop: main.scrollTop, scrollH: main.scrollHeight, clientH: main.clientHeight } };
});
console.log(JSON.stringify(info, null, 1));
await page.waitForTimeout(400);
await page.screenshot({ path: `${OUT}/scrolled-${route.replace('/', '')}-${width}.png` });
await browser.close();
