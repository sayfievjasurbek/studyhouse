/* The comparison table with three universities at the narrowest width where the table (not the cards) is shown.
     node compare-test.mjs */
import { chromium } from 'playwright-core';
const b = await chromium.launch({ channel: 'chrome' });
let bad = 0; const say = (ok, m) => { if (!ok) bad++; console.log((ok ? 'PASS  ' : 'FAIL  ') + m); };
for (const w of [769, 820, 1024]) {
  const ctx = await b.newContext({ viewport: { width: w, height: 900 }, isMobile: true, hasTouch: true });
  await ctx.addInitScript(() => { try { localStorage.setItem('sh-lang', 'en'); } catch (e) {} });
  const p = await ctx.newPage();
  for (const path of ['/destinations/usa/', '/destinations/australia/', '/destinations/china/']) {
    await p.goto('http://localhost:8000' + path, { waitUntil: 'networkidle' });
    await p.evaluate(() => document.querySelectorAll('.reveal').forEach((e) => e.classList.add('visible')));
    const chips = await p.$$('.cmp-chip');
    for (const c of chips) { if ((await c.getAttribute('aria-pressed')) === 'false' && (await c.getAttribute('aria-disabled')) !== 'true') { await c.click(); break; } }
    await p.waitForTimeout(400);
    const r = await p.evaluate(() => {
      const wrap = document.querySelector('.cmp-tablewrap'), sc = document.querySelector('.cmp-scroll');
      const th = document.querySelector('.cmp-table tbody th');
      const before = th.getBoundingClientRect().left;
      sc.scrollLeft = 60;
      const after = th.getBoundingClientRect().left;
      return { cols: document.querySelectorAll('.cmp-table__uni').length, scrollable: sc.scrollWidth > sc.clientWidth + 1, hint: getComputedStyle(document.querySelector('.cmp-hint')).display,
        cls: wrap.className, sticky: Math.abs(after - before) < 1, tab: sc.getAttribute('tabindex'), pageOverflow: document.documentElement.scrollWidth > innerWidth + 1 };
    });
    say(!r.pageOverflow, `${w}px ${path.split('/')[2].padEnd(9)} page itself does not scroll sideways (${r.cols} universities)`);
    if (r.scrollable) { say(r.hint === 'block', `${w}px ${path.split('/')[2].padEnd(9)} scroll hint shown`); say(r.sticky, `${w}px ${path.split('/')[2].padEnd(9)} first column stays put while scrolling`); }
    else say(true, `${w}px ${path.split('/')[2].padEnd(9)} fits without scrolling`);
    say(r.tab === '0', `${w}px ${path.split('/')[2].padEnd(9)} keyboard-focusable`);
  }
  await ctx.close();
}
await b.close(); process.exit(bad ? 1 : 0);
