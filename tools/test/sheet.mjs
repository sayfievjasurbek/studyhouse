/* Above-the-fold contact sheet: one page at every device size, side by side.
     node sheet.mjs <url> <out.png> [--lang uz] */
import { chromium } from 'playwright-core';
const [url, out] = process.argv.slice(2, 4);
const lang = process.argv.includes('--lang') ? process.argv[process.argv.indexOf('--lang') + 1] : 'uz';
const SIZES = [[320, 568], [360, 640], [375, 667], [390, 844], [412, 915], [667, 375], [768, 1024], [820, 1180], [1024, 768], [1366, 768], [1440, 900], [1920, 1080], [2560, 1440], [3840, 2160]];
const b = await chromium.launch({ channel: 'chrome' });
const shots = [];
for (const [w, h] of SIZES) {
  const touch = w <= 1024;
  const ctx = await b.newContext({ viewport: { width: w, height: h }, isMobile: touch, hasTouch: touch, deviceScaleFactor: 1 });
  await ctx.addInitScript((l) => { try { localStorage.setItem('sh-lang', l); } catch (e) {} }, lang);
  const p = await ctx.newPage();
  await p.goto('http://localhost:8000' + url, { waitUntil: 'networkidle' });
  await p.evaluate(() => document.querySelectorAll('.reveal').forEach((e) => e.classList.add('visible')));
  await p.waitForTimeout(500);
  shots.push({ w, h, data: (await p.screenshot()).toString('base64') });
  await ctx.close();
}
await b.close();
/* compose in the browser so we need no image library here */
const b2 = await chromium.launch({ channel: 'chrome' });
const pg = await b2.newPage({ viewport: { width: 2600, height: 900 } });
const H = 420;
await pg.setContent(`<body style="margin:0;background:#8c8c8c;display:flex;gap:14px;align-items:flex-start;padding:14px;flex-wrap:wrap;font:12px monospace">${shots.map((s) => `<div style="color:#fff"><div>${s.w}x${s.h}</div><img style="height:${H}px;display:block;border:1px solid #444" src="data:image/png;base64,${s.data}"></div>`).join('')}</body>`);
await pg.waitForTimeout(800);
await pg.screenshot({ path: out, fullPage: true });
await b2.close();
