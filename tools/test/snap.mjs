/* Quick screenshots of one page at one size, optionally after clicking something.
     node snap.mjs <url> <WxH> <out.png> [--click "selector"] [--full] [--lang en] */
import { chromium } from 'playwright-core';
const [url, size, out] = process.argv.slice(2, 5);
const a = process.argv.slice(5);
const opt = (n, d) => { const i = a.indexOf('--' + n); return i >= 0 ? a[i + 1] : d; };
const [w, h] = size.split('x').map(Number);
const touch = w <= 1024;
const b = await chromium.launch({ channel: 'chrome' });
const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1, isMobile: touch, hasTouch: touch });
await ctx.addInitScript((l) => { try { localStorage.setItem('sh-lang', l); } catch (e) {} }, opt('lang', 'uz'));
const p = await ctx.newPage();
await p.goto((process.env.BASE || 'http://localhost:8000') + url, { waitUntil: 'networkidle' });
await p.evaluate(() => document.querySelectorAll('.reveal').forEach((e) => e.classList.add('visible')));
if (opt('scrollto', '')) await p.evaluate((s) => document.querySelector(s)?.scrollIntoView({ block: 'start' }), opt('scrollto'));
if (opt('click', '')) { await p.click(opt('click')); }
await p.waitForTimeout(700);
await p.screenshot({ path: out, fullPage: a.includes('--full') });
await b.close();
