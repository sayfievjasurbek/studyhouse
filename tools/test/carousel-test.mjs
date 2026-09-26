/* Checks the logo carousel: it drifts, a touch swipe scrolls it and pauses the drift, a touch
   lets it resume, the wrap is seamless, and the mouse pauses it.   node carousel-test.mjs */
import { chromium } from 'playwright-core';
const b = await chromium.launch({ channel: 'chrome' });
const res = [];
for (const [name, opts] of [['phone (touch)', { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true }], ['desktop (mouse)', { viewport: { width: 1280, height: 800 } }]]) {
  const ctx = await b.newContext(opts);
  const p = await ctx.newPage();
  await p.goto((process.env.BASE || 'http://localhost:8000') + '/', { waitUntil: 'networkidle' });
  await p.evaluate(() => document.getElementById('uni-carousel').scrollIntoView({ block: 'center' }));
  await p.waitForTimeout(800);
  const sl = () => p.evaluate(() => document.getElementById('uni-carousel').scrollLeft);
  const info = await p.evaluate(() => { const s = document.getElementById('uni-carousel'); return { tab: s.getAttribute('tabindex'), role: s.getAttribute('role'), items: s.querySelectorAll('.uni-logo-card').length, scrollable: s.scrollWidth > s.clientWidth, scrollbar: getComputedStyle(s).scrollbarWidth }; });
  const a = await sl(); await p.waitForTimeout(1500); const c = await sl();
  res.push([name, 'drifts by itself', c > a, `${a.toFixed(0)} -> ${c.toFixed(0)} in 1.5s`]);
  res.push([name, 'keyboard reachable', info.tab === '0' && info.role === 'region', `tabindex=${info.tab} role=${info.role}`]);
  res.push([name, 'scrollable, scrollbar hidden', info.scrollable && info.scrollbar === 'none', `${info.items} slots`]);
  if (opts.hasTouch) {
    const box = await (await p.$('#uni-carousel')).boundingBox();
    const cdp = await ctx.newCDPSession(p);
    const y = box.y + box.height / 2, x0 = box.x + box.width - 40, x1 = box.x + 40;
    const before = await sl();
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: x0, y }] });
    for (let i = 1; i <= 10; i++) { await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: x0 + (x1 - x0) * i / 10, y }] }); await p.waitForTimeout(16); }
    const during = await sl();
    res.push([name, 'a swipe scrolls it', Math.abs(during - before) > 100, `moved ${(during - before).toFixed(0)}px`]);
    await p.waitForTimeout(500); const held1 = await sl(); await p.waitForTimeout(400); const held2 = await sl();
    res.push([name, 'drift is paused while touching', Math.abs(held2 - held1) < 3, `${held1.toFixed(0)} -> ${held2.toFixed(0)}`]);
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    await p.waitForTimeout(4500);
    const r1 = await sl(); await p.waitForTimeout(1200); const r2 = await sl();
    res.push([name, 'drift resumes after the touch', Math.abs(r2 - r1) > 5, `${r1.toFixed(0)} -> ${r2.toFixed(0)}`]);
  } else {
    await p.hover('#uni-carousel'); await p.waitForTimeout(300);
    const h1 = await sl(); await p.waitForTimeout(1200); const h2 = await sl();
    res.push([name, 'pauses on mouse hover', Math.abs(h2 - h1) < 3, `${h1.toFixed(0)} -> ${h2.toFixed(0)}`]);
    await p.mouse.move(5, 5); await p.waitForTimeout(500); const m1 = await sl(); await p.waitForTimeout(1200); const m2 = await sl();
    res.push([name, 'resumes when the mouse leaves', m2 - m1 > 5, `${m1.toFixed(0)} -> ${m2.toFixed(0)}`]);
  }
  // seamless wrap: run past a full loop and confirm the position stays inside [loop, 2*loop)
  const wrap = await p.evaluate(async () => {
    const s = document.getElementById('uni-carousel'), t = document.getElementById('uni-carousel-track');
    const loop = t.children[10].offsetLeft - t.children[0].offsetLeft;
    s.scrollLeft = loop * 2 - 30; await new Promise((r) => setTimeout(r, 900));
    return { loop, x: s.scrollLeft };
  });
  res.push([name, 'wraps without running out', wrap.x >= wrap.loop - 5 && wrap.x < wrap.loop * 2, `loop=${wrap.loop} position=${wrap.x.toFixed(0)}`]);
  await ctx.close();
}
await b.close();
let bad = 0;
for (const [n, what, ok, d] of res) { if (!ok) bad++; console.log(`${ok ? 'PASS' : 'FAIL'}  ${n.padEnd(16)} ${what.padEnd(34)} ${d}`); }
process.exit(bad ? 1 : 0);
