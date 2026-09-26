/* Lists every element wider than the viewport on a page (including ones an ancestor clips),
   to find the cause of a stubborn horizontal overflow.   node who.mjs <url> <width> */
import { chromium } from 'playwright-core';
const [url, w] = [process.argv[2], Number(process.argv[3] || 320)];
const b = await chromium.launch({ channel: 'chrome' });
const ctx = await b.newContext({ viewport: { width: w, height: 700 }, isMobile: w <= 1024, hasTouch: w <= 1024 });
await ctx.addInitScript(() => { try { localStorage.setItem('sh-lang', 'uz'); } catch (e) {} });
const p = await ctx.newPage();
await p.goto((process.env.BASE || 'http://localhost:8000') + url, { waitUntil: 'networkidle' });
await p.evaluate(() => document.querySelectorAll('.reveal').forEach((e) => e.classList.add('visible')));
await p.waitForTimeout(500);
const out = await p.evaluate(() => {
  const vw = innerWidth, res = [];
  for (const el of document.querySelectorAll('body *')) {
    const r = el.getBoundingClientRect(); if (!r.width) continue;
    if (r.right > vw + 1 || r.left < -1) {
      const cs = getComputedStyle(el);
      let clip = ''; for (let a = el.parentElement; a && a !== document.body; a = a.parentElement) { const o = getComputedStyle(a).overflowX; if (/(hidden|auto|scroll|clip)/.test(o)) { clip = a.tagName.toLowerCase() + '.' + a.className; break; } }
      res.push(`${el.tagName.toLowerCase()}.${String(el.className).split(' ')[0]} right=${Math.round(r.right)} w=${Math.round(r.width)} pos=${cs.position} clippedBy=${clip || '-'} text="${(el.textContent||'').trim().slice(0,30)}"`);
    }
  }
  /* Elements whose own content (text, pseudo-elements) sticks out past their box */
  for (const el of document.querySelectorAll('body *')) {
    const r = el.getBoundingClientRect(); if (!r.width) continue;
    if (el.scrollWidth > el.clientWidth + 1 && r.left + el.scrollWidth > vw + 1)
      res.push(`INNER ${el.tagName.toLowerCase()}.${String(el.className).split(' ')[0]} box=${Math.round(r.width)} content=${el.scrollWidth} left=${Math.round(r.left)} overflow=${getComputedStyle(el).overflowX}`);
  }
  return { sw: document.documentElement.scrollWidth, items: res.slice(0, 14) };
});
console.log('scrollWidth', out.sw, '\n' + out.items.join('\n'));
await b.close();
