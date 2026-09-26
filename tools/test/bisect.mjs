/* Finds which top-level block (and then which child) makes a page wider than the viewport,
   by hiding them one at a time.   node bisect.mjs <url> <width> */
import { chromium } from 'playwright-core';
const [url, w] = [process.argv[2], Number(process.argv[3] || 320)];
const b = await chromium.launch({ channel: 'chrome' });
const ctx = await b.newContext({ viewport: { width: w, height: 700 }, isMobile: true, hasTouch: true });
await ctx.addInitScript(() => { try { localStorage.setItem('sh-lang', 'uz'); } catch (e) {} });
const p = await ctx.newPage();
await p.goto((process.env.BASE || 'http://localhost:8000') + url, { waitUntil: 'networkidle' });
await p.evaluate(() => document.querySelectorAll('.reveal').forEach((e) => e.classList.add('visible')));
await p.waitForTimeout(500);
const r = await p.evaluate(() => {
  const sw = () => document.documentElement.scrollWidth;
  const base = sw(), hits = [];
  const walk = (parent, depth) => {
    for (const el of parent.children) {
      if (/SCRIPT|STYLE|LINK|NOSCRIPT/.test(el.tagName)) continue;
      const old = el.style.display; el.style.display = 'none';
      const now = sw(); el.style.display = old;
      if (now < base - 1) {
        hits.push(`${'  '.repeat(depth)}${el.tagName.toLowerCase()}.${String(el.className).split(' ').slice(0, 2).join('.')} (page ${base} -> ${now} without it)`);
        if (depth < 4) walk(el, depth + 1);
      }
    }
  };
  walk(document.body, 0);
  return { base, hits };
});
console.log('scrollWidth', r.base); console.log(r.hits.join('\n') || '(hiding any single block does not change it)');
await b.close();
