/* Walks the GPA calculator through its three steps at one size and saves a screenshot of each.
     node gpa-shots.mjs <WxH> <outPrefix> [--lang ru] */
import { chromium } from 'playwright-core';
const [size, out] = process.argv.slice(2, 4);
const lang = process.argv.includes('--lang') ? process.argv[process.argv.indexOf('--lang') + 1] : 'uz';
const [w, h] = size.split('x').map(Number);
const b = await chromium.launch({ channel: 'chrome' });
const ctx = await b.newContext({ viewport: { width: w, height: h }, isMobile: w <= 1024, hasTouch: w <= 1024, deviceScaleFactor: 1 });
await ctx.addInitScript((l) => { try { localStorage.setItem('sh-lang', l); } catch (e) {} }, lang);
const p = await ctx.newPage();
await p.goto('http://localhost:8000/gpa-calculator/', { waitUntil: 'networkidle' });
await p.evaluate(() => document.querySelectorAll('.reveal').forEach((e) => e.classList.add('visible')));
const shot = async (n) => { await p.waitForTimeout(700); await p.screenshot({ path: `${out}-${n}.png`, fullPage: true }); };
await p.fill('#gpa-known', '3,8'); await p.click('.gpa__chip >> nth=1'); await p.click('.gpa__chip >> nth=5');
await shot(1);
await p.click('.gpa__next');
await p.fill('#gpa-name', 'Nodira'); await p.selectOption('#gpa-level', 'university-student');
await p.click('.gpa__test-toggle >> nth=1'); await p.fill('.gpa__score', '6,5');
await shot(2);
await p.click('.gpa__next'); await p.waitForTimeout(1200);
await shot(3);
await b.close();
