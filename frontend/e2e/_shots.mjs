// Ad-hoc screenshot helper (not a test). Run: node e2e/_shots.mjs
import { chromium } from '@playwright/test';
import fs from 'node:fs';
import { seed } from './_seed.mjs';

const OUT = 'D:/Project/Lumi/.shots';
fs.mkdirSync(OUT, { recursive: true });


const routes = ['/chat-import', '/ai-analysis', '/settings', '/dashboard'];
const viewports = [{ name: 'desktop', width: 1440, height: 900 }, { name: 'mobile', width: 390, height: 844 }];

const browser = await chromium.launch();
for (const vp of viewports) {
  const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height }, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  const errors = [];
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', (e) => errors.push('PAGEERROR ' + e.message));
  await seed(page);
  for (const r of routes) {
    await page.goto('http://localhost:5173' + r);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1200);
    const name = r.replace('/', '') || 'home';
    await page.screenshot({ path: `${OUT}/${vp.name}-${name}.png`, fullPage: false });
    // Full content of the scrolling <main>: temporarily let the shell grow so fullPage captures it.
    await page.evaluate(() => {
      const shell = document.querySelector('.app-shell');
      const main = document.querySelector('main');
      if (shell) shell.style.height = 'auto';
      if (main) { main.style.overflowY = 'visible'; main.style.height = 'auto'; }
    });
    await page.screenshot({ path: `${OUT}/${vp.name}-${name}-full.png`, fullPage: true });
    await page.reload(); await page.waitForLoadState('networkidle'); await page.waitForTimeout(600);
    // Also measure overflow
    const m = await page.evaluate(() => {
      const main = document.querySelector('main');
      const doc = document.documentElement;
      return {
        docScrollH: doc.scrollHeight, docClientH: doc.clientHeight, docScrollW: doc.scrollWidth, docClientW: doc.clientWidth,
        mainScrollH: main?.scrollHeight, mainClientH: main?.clientHeight, mainOverflowY: main ? getComputedStyle(main).overflowY : null,
        shellH: document.querySelector('.app-shell')?.getBoundingClientRect().height,
      };
    });
    console.log(vp.name, r, JSON.stringify(m));
  }
  console.log(vp.name, 'console errors:', errors.slice(0, 5));
  await ctx.close();
}
await browser.close();
