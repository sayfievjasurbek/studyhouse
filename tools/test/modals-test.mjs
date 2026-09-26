/* Opens the booking form and a programme popup at phone, tablet and desktop sizes and asserts:
   the panel fits the screen, the close button and the submit button are visible without scrolling,
   Esc closes, page scroll is locked, focus is trapped and returned, and nothing overflows sideways.
     node modals-test.mjs */
import { chromium } from 'playwright-core';
const BASE = process.env.BASE || 'http://localhost:8000';
const SIZES = [[320, 568], [360, 640], [375, 667], [390, 844], [412, 915], [667, 375], [768, 1024], [1024, 768], [1366, 768], [1920, 1080], [3840, 2160]];
const b = await chromium.launch({ channel: 'chrome' });
const rows = [];
const check = (size, what, ok, detail = '') => rows.push([`${size[0]}x${size[1]}`, what, ok, detail]);

for (const size of SIZES) {
  const touch = size[0] <= 1024;
  const ctx = await b.newContext({ viewport: { width: size[0], height: size[1] }, isMobile: touch, hasTouch: touch });
  await ctx.addInitScript(() => { try { localStorage.setItem('sh-lang', 'uz'); } catch (e) {} });
  const p = await ctx.newPage();
  const errs = []; p.on('pageerror', (e) => errs.push(e.message));

  /* ---- booking form ---- */
  await p.goto(BASE + '/', { waitUntil: 'networkidle' });
  const trigger = touch && size[0] <= 1100 ? '#hero-consult-btn' : '#hero-consult-btn';
  await p.click(trigger);
  await p.waitForTimeout(500);
  const m = await p.evaluate(() => {
    const z = parseFloat(getComputedStyle(document.documentElement).zoom) || 1;
    const R = (s) => { const e = document.querySelector(s); if (!e) return null; const r = e.getBoundingClientRect(); return { l: r.left, t: r.top, r: r.right, b: r.bottom, w: r.width, h: r.height }; };
    const vh = innerHeight, vw = innerWidth;
    const panel = R('.booking__panel'), close = R('.booking__close'), submit = R('#bk-submit');
    const inView = (r) => r && r.t >= -1 && r.b <= vh + 1 && r.l >= -1 && r.r <= vw + 1;
    return { vh, vw, z, panel, close: inView(close), closeSize: close && [Math.round(close.w / z), Math.round(close.h / z)],
      submit: inView(submit), lock: document.body.style.overflow, hscroll: document.documentElement.scrollWidth > vw + 1,
      active: document.activeElement && document.activeElement.id, dialog: document.querySelector('.booking__panel').getAttribute('role') };
  });
  check(size, 'booking: panel fits the screen', m.panel.h <= m.vh + 2 || size[0] > 768, `panel ${Math.round(m.panel.h)} / screen ${m.vh}`);
  check(size, 'booking: close button visible', m.close, `${m.closeSize}`);
  check(size, 'booking: close button >= 44px', m.closeSize[0] >= 44 || !touch, `${m.closeSize}`);
  check(size, 'booking: submit visible without scrolling', m.submit, '');
  check(size, 'booking: page scroll locked', m.lock === 'hidden', m.lock);
  check(size, 'booking: role=dialog, focus inside', m.dialog === 'dialog' && m.active === 'bk-first', `focus=${m.active}`);
  check(size, 'booking: no sideways scroll', !m.hscroll, '');
  /* focus trap: tab many times, focus must stay in the panel */
  for (let i = 0; i < 14; i++) await p.keyboard.press('Tab');
  const trapped = await p.evaluate(() => !!document.activeElement.closest('.booking__panel'));
  check(size, 'booking: focus trapped', trapped, '');
  await p.keyboard.press('Escape'); await p.waitForTimeout(500);
  const closed = await p.evaluate(() => ({ hidden: document.getElementById('booking').hidden, lock: document.body.style.overflow, focus: document.activeElement && (document.activeElement.id || document.activeElement.tagName) }));
  check(size, 'booking: Esc closes, scroll unlocked, focus returns', closed.hidden && closed.lock === '' && closed.focus === 'hero-consult-btn', `${closed.focus}`);

  /* ---- programme popup ---- */
  await p.goto(BASE + '/services/', { waitUntil: 'networkidle' });
  await p.waitForSelector('.prog-card__btn');
  const buttons = await p.$$('.prog-card__btn');
  await buttons[1].click();                                    // UWC
  await p.waitForTimeout(600);
  const q = await p.evaluate(() => {
    const z = parseFloat(getComputedStyle(document.documentElement).zoom) || 1;
    const vh = innerHeight, vw = innerWidth;
    const panel = document.querySelector('.pmodal__panel').getBoundingClientRect();
    const close = document.querySelector('.pmodal__close').getBoundingClientRect();
    const panelEl = document.querySelector('.pmodal__panel');
    panelEl.scrollTop = 900; const c2 = document.querySelector('.pmodal__close').getBoundingClientRect();   // after scrolling the popup
    return { panelH: panel.height, vh, closeIn: close.top >= -1 && close.bottom <= vh + 1, closeAfterScroll: c2.top >= -1 && c2.bottom <= vh + 1,
      closeSize: [Math.round(close.width / z), Math.round(close.height / z)], scrollable: panelEl.scrollHeight > panelEl.clientHeight,
      lock: document.body.style.overflow, hscroll: document.documentElement.scrollWidth > vw + 1, role: panelEl.getAttribute('role') };
  });
  check(size, 'popup: panel fits the screen', q.panelH <= q.vh + 2, `panel ${Math.round(q.panelH)} / screen ${q.vh}`);
  check(size, 'popup: close button visible', q.closeIn, '');
  check(size, 'popup: close button stays visible after scrolling', q.closeAfterScroll, '');
  check(size, 'popup: close button >= 44px', q.closeSize[0] >= 44 || !touch, `${q.closeSize}`);
  check(size, 'popup: content scrolls inside it', q.scrollable, '');
  check(size, 'popup: page scroll locked, role=dialog', q.lock === 'hidden' && q.role === 'dialog', '');
  check(size, 'popup: no sideways scroll', !q.hscroll, '');
  await p.keyboard.press('Escape'); await p.waitForTimeout(500);
  const pc = await p.evaluate(() => ({ open: document.getElementById('programme-modal') && !document.getElementById('programme-modal').hidden, lock: document.body.style.overflow }));
  check(size, 'popup: Esc closes and unlocks scroll', !pc.open && pc.lock === '', '');
  check(size, 'no script errors', errs.length === 0, errs.join(' | ').slice(0, 120));
  await ctx.close();
}
await b.close();
let bad = 0, cur = '';
for (const [s, what, ok, d] of rows) {
  if (s !== cur) { cur = s; console.log(`\n${s}`); }
  if (!ok) bad++;
  if (!ok || process.argv.includes('--all')) console.log(`  ${ok ? 'PASS' : 'FAIL'}  ${what}  ${d}`);
}
console.log(`\n${rows.length - bad}/${rows.length} passed${bad ? ' — ' + bad + ' FAILED' : ''}`);
process.exit(bad ? 1 : 0);
