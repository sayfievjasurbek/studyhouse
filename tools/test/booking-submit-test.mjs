/* The booking form's submit path against a STAND-IN for the Apps Script endpoint (nothing
   real is contacted, so nobody gets a Telegram message).
   Checks the request shape (POST, text/plain, JSON body with the honeypot), the loading state,
   success (message, mascot, form reset) and every kind of failure (data kept, button back).
     node booking-submit-test.mjs */
import { chromium } from 'playwright-core';
const BASE = process.env.BASE || 'http://localhost:8000';
const ENDPOINT = /script\.google\.com\/macros\/s\/.+\/exec/;
const CORS = { 'access-control-allow-origin': '*' };
let fails = 0;
const check = (size, name, ok, extra = '') => { if (!ok) fails++; console.log(`${ok ? 'PASS' : 'FAIL'}  ${size}  ${name}${ok ? '' : '  ' + extra}`); };

const b = await chromium.launch({ channel: 'chrome' });
for (const [w, h] of [[375, 667], [1440, 900]]) {
  const size = `${w}x${h}`;
  const touch = w <= 1024;
  const ctx = await b.newContext({ viewport: { width: w, height: h }, isMobile: touch, hasTouch: touch });
  await ctx.addInitScript(() => { try { localStorage.setItem('sh-lang', 'uz'); } catch (e) {} });
  const p = await ctx.newPage();
  const problems = [];
  p.on('pageerror', (e) => problems.push('pageerror: ' + e.message));
  let expectFail = false;   // Chrome logs the stand-in's deliberate 500 / abort; that is the test, not a bug
  p.on('console', (m) => { if (m.type() === 'error' && !/\[booking\] submit failed/.test(m.text()) && !(expectFail && /Failed to load resource/.test(m.text()))) problems.push('console: ' + m.text()); });
  p.on('response', (r) => { if (r.status() >= 400 && !ENDPOINT.test(r.url())) problems.push('http ' + r.status() + ' ' + r.url()); });

  const external = new Set();   // every URL that is not the local server
  p.on('request', (r) => { if (!r.url().startsWith(BASE) && !r.url().startsWith('data:')) external.add(r.url()); });
  let mode = 'ok', requests = [];
  await p.route(ENDPOINT, async (route) => {
    const req = route.request();
    requests.push({ method: req.method(), type: req.headers()['content-type'], body: req.postData() });
    if (mode === 'abort') return route.abort();
    await new Promise((r) => setTimeout(r, 600));
    if (mode === 'ok') return route.fulfill({ status: 200, headers: CORS, contentType: 'application/json', body: '{"ok":true}' });
    if (mode === 'notok') return route.fulfill({ status: 200, headers: CORS, contentType: 'application/json', body: '{"ok":false,"error":"x"}' });
    if (mode === 'http500') return route.fulfill({ status: 500, headers: CORS, contentType: 'application/json', body: '{"ok":true}' });
    if (mode === 'html') return route.fulfill({ status: 200, headers: CORS, contentType: 'text/html', body: '<html>Error</html>' });
  });

  await p.goto(BASE + '/index.html', { waitUntil: 'networkidle' });
  const fill = async () => {
    await p.click('[data-booking] >> visible=true');
    await p.waitForSelector('.booking--open');
    await p.fill('#bk-first', 'Ali');
    await p.fill('#bk-surname', 'Valiyev');
    await p.fill('#bk-phone', '901234567');
    await p.fill('#bk-telegram', 'ali_v1');
    await p.selectOption('#bk-country', 'latvia');
    await p.check('#bk-consent');
  };
  const hidden = (s) => p.evaluate((sel) => document.querySelector(sel).hidden, s);

  // --- success ---
  await fill();
  check(size, 'honeypot is off-screen, tabindex -1, autocomplete off', await p.evaluate(() => {
    const i = document.querySelector('input[name="website"]'); const r = i.getBoundingClientRect();
    return i.tabIndex === -1 && i.autocomplete === 'off' && (r.right < 0 || r.left > innerWidth) && i.value === '';
  }));
  await p.click('#bk-submit');
  await p.waitForTimeout(150);
  check(size, 'loading: button disabled + "Yuborilmoqda"', await p.evaluate(() => { const s = document.getElementById('bk-submit'); return s.disabled && s.classList.contains('is-loading') && /Yuborilmoqda/.test(s.textContent); }));
  await p.waitForSelector('#bk-success:not([hidden])', { timeout: 5000 });
  const rq = requests[0];
  const body = JSON.parse(rq.body);
  check(size, 'one POST, text/plain;charset=utf-8', requests.length === 1 && rq.method === 'POST' && rq.type === 'text/plain;charset=utf-8', JSON.stringify(rq));
  check(size, 'body has firstName/surname/phone/telegram/interest/website', body.firstName === 'Ali' && body.surname === 'Valiyev' && body.phone === '+998901234567' && body.telegram === '@ali_v1' && body.interest === 'Latvia' && body.website === '', rq.body);
  check(size, 'no secrets in the payload or page code', !/bot\d|api\.telegram|chat_id/i.test(rq.body + await (await p.request.get(BASE + '/booking.js')).text()));
  check(size, 'success message in Uzbek', await p.evaluate(() => document.querySelector('#bk-success .booking__title').textContent.trim()) === 'Rahmat! Tez orada siz bilan bogʻlanamiz');
  check(size, 'mascot visible on success', await p.evaluate(() => { const i = document.querySelector('.booking__mascot-img'); const r = i.getBoundingClientRect(); return i.complete && i.naturalWidth > 0 && r.width > 20 && r.height > 20; }));
  check(size, 'form was reset', await p.evaluate(() => { const f = document.getElementById('bk-form'); return !f.firstName.value && !f.phone.value && !f.telegram.value && !f.country.value && !f.consent.checked; }));
  await p.click('#bk-success [data-booking-close]');
  await p.waitForTimeout(300);

  // --- failures: data kept, button back, message shown ---
  for (const m of ['notok', 'http500', 'html', 'abort']) {
    mode = m; requests = []; expectFail = true;
    await fill();
    await p.click('#bk-submit');
    await p.waitForFunction(() => !document.getElementById('bk-status').hidden, null, { timeout: 5000 });
    const st = await p.evaluate(() => ({ msg: document.getElementById('bk-status').textContent, dis: document.getElementById('bk-submit').disabled, first: document.getElementById('bk-form').firstName.value, phone: document.getElementById('bk-form').phone.value, ok: document.getElementById('bk-success').hidden }));
    check(size, `${m}: error shown in Uzbek, not success`, st.ok && /Kechirasiz/.test(st.msg), JSON.stringify(st));
    check(size, `${m}: button re-enabled, data kept`, !st.dis && st.first === 'Ali' && st.phone === '+998 90 123 45 67', JSON.stringify(st));
    await p.click('.booking__close');
    await p.waitForTimeout(300);
  }

  // --- validation: nothing is sent when first name / phone are wrong ---
  mode = 'ok'; requests = []; expectFail = false;
  await p.click('[data-booking] >> visible=true'); await p.waitForSelector('.booking--open');
  await p.fill('#bk-first', 'Ali'); await p.fill('#bk-phone', '9012');
  await p.click('#bk-submit'); await p.waitForTimeout(300);
  check(size, 'bad phone: nothing sent', requests.length === 0);

  const configured = (await (await p.request.get(BASE + '/booking.js')).text()).match(/BOOKING_ENDPOINT = '([^']+)'/)[1];
  check(size, 'the only external URL contacted is the BOOKING_ENDPOINT in booking.js', external.size === 1 && external.has(configured), [...external].join(' | '));
  check(size, 'no console errors / failed requests', problems.length === 0, problems.join(' | '));
  await ctx.close();
}
await b.close();
console.log(fails ? `\n${fails} FAILED` : '\nALL PASS');
process.exit(fails ? 1 : 0);
