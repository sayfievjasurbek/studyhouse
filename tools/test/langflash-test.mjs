/* Records every paint-relevant text change on the hero headline while the page loads, to prove there is
   no English flash before the chosen language.   node langflash-test.mjs */
import { chromium } from 'playwright-core';
const b = await chromium.launch({ channel: 'chrome' });
let bad = 0; const say = (ok, m) => { if (!ok) bad++; console.log((ok ? 'PASS  ' : 'FAIL  ') + m); };
for (const [lang, expect] of [['uz', 'Kelajagingiz'], ['ru', 'Ваше'], ['en', 'Your Future']]) {
  const ctx = await b.newContext({ viewport: { width: 412, height: 823 }, isMobile: true, hasTouch: true });
  await ctx.addInitScript((l) => { try { localStorage.setItem('sh-lang', l); } catch (e) {}
    /* watch what the visitor could actually SEE: every animation frame, is the headline visible and what does it say? */
    window.__seen = []; const tick = () => { const h = document.querySelector('.hero__heading'); if (h) { const vis = getComputedStyle(document.body).visibility !== 'hidden'; window.__seen.push((vis ? 'V:' : 'H:') + h.textContent.trim().slice(0, 14)); } requestAnimationFrame(tick); }; requestAnimationFrame(tick); }, lang);
  const p = await ctx.newPage();
  await p.goto('http://localhost:8000/', { waitUntil: 'networkidle' });
  const seen = await p.evaluate(() => window.__seen);
  const visible = [...new Set(seen.filter((s) => s.startsWith('V:')))];
  say(visible.length === 1 && visible[0].includes(expect), `${lang}: only ever visible as "${visible.join(' | ')}"`);
  const pend = await p.evaluate(() => document.documentElement.classList.contains('i18n-pending'));
  say(!pend, `${lang}: page is shown once translated`);
  await ctx.close();
}
/* failsafe: with the script blocked, the page still appears */
const ctx = await b.newContext(); const p = await ctx.newPage();
await p.route('**/i18n.js*', (r) => r.abort());
await p.goto('http://localhost:8000/', { waitUntil: 'load' });
await p.waitForTimeout(2600);
say(await p.evaluate(() => getComputedStyle(document.body).visibility === 'visible'), 'failsafe: page is shown after 2s even if i18n.js never loads');
await b.close(); process.exit(bad ? 1 : 0);
