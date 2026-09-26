/* Responsive checks for the Study House site.

   Usage (site served at http://localhost:8000, e.g. `python3 -m http.server 8000`):

     npm install
     node responsive.mjs                       # all pages, all viewports, Uzbek
     node responsive.mjs --lang ru             # same in Russian (long words)
     node responsive.mjs --only 320x568,1920x1080 --pages /,/services/
     node responsive.mjs --shots               # also write full-page screenshots to shots/
     node responsive.mjs --sweep               # width sweep 320..3840 instead of the device list

   For every page at every viewport it asserts:
     - no horizontal overflow (and names the elements that cause it)
     - no console errors, page errors or failed same-origin requests
     - no broken images (every lazy image is scrolled into view first)
     - no interactive element smaller than 44px on touch viewports
     - the header does not wrap and its parts do not overlap
   Exit code is 1 if anything fails. */

import { chromium } from 'playwright-core';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const BASE = process.env.BASE || 'http://localhost:8000';

const args = process.argv.slice(2);
const flag = (n) => args.includes('--' + n);
const opt = (n, d) => { const i = args.indexOf('--' + n); return i >= 0 ? args[i + 1] : d; };

const PAGES = (opt('pages', '') ? opt('pages').split(',') : [
  '/', '/services/', '/destinations/', '/destinations/usa/', '/destinations/australia/',
  '/destinations/china/', '/destinations/europe/', '/destinations/europe/germany/',
  '/destinations/europe/italy/', '/destinations/europe/france/', '/destinations/europe/spain/',
  '/destinations/europe/finland/', '/destinations/europe/latvia/', '/expertise/', '/gpa-calculator/'
]);

/* The device list from the brief */
const DEVICES = [
  [320, 568], [360, 640], [375, 667], [390, 844], [412, 915], [667, 375],
  [768, 1024], [1024, 768], [820, 1180], [1366, 768], [1440, 900],
  [1920, 1080], [2560, 1440], [3840, 2160]
];
/* The breakpoint sweep from the brief */
const SWEEP = [320, 360, 375, 390, 412, 480, 600, 768, 820, 1024, 1180, 1280, 1440, 1920, 2560, 3840]
  .map((w) => [w, w < 600 ? 800 : w < 1200 ? 900 : 1000]);

let VIEWPORTS = flag('sweep') ? SWEEP : DEVICES;
if (opt('only', '')) {
  const want = new Set(opt('only').split(','));
  VIEWPORTS = VIEWPORTS.filter(([w, h]) => want.has(`${w}x${h}`) || want.has(String(w)));
}
const LANG = opt('lang', 'uz');
const SHOTS = flag('shots');
const CONCURRENCY = Number(opt('jobs', 4));

const isTouch = (w) => w <= 1024;

/* Runs in the page. Returns everything we assert on. */
function inspect({ touch }) {
  const vw = window.innerWidth;
  /* From 1920px the page is scaled with CSS zoom, and measured sizes come back
     multiplied by it. Divide it out so thresholds are in CSS pixels. */
  const zoom = parseFloat(getComputedStyle(document.documentElement).zoom) || 1;
  const out = { overflow: null, culprits: [], small: [], exemptInline: 0, header: {}, brokenImages: [] };

  const sel = (el) => {
    let s = el.tagName.toLowerCase();
    if (el.id) s += '#' + el.id;
    if (el.className && typeof el.className === 'string') s += '.' + el.className.trim().split(/\s+/).slice(0, 2).join('.');
    return s;
  };

  /* ---- horizontal overflow ---- */
  const doc = document.documentElement;
  out.overflow = { scrollWidth: doc.scrollWidth, bodyScrollWidth: document.body.scrollWidth, innerWidth: vw };
  const clipped = (el) => {
    for (let p = el.parentElement; p && p !== document.body; p = p.parentElement) {
      const o = getComputedStyle(p);
      if (/(hidden|auto|scroll|clip)/.test(o.overflowX)) return true;
    }
    return false;
  };
  if (doc.scrollWidth > vw + 1 || document.body.scrollWidth > vw + 1) {
    for (const el of document.body.querySelectorAll('*')) {
      const r = el.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) continue;
      const cs = getComputedStyle(el);
      if (cs.position === 'fixed' || cs.visibility === 'hidden' || cs.display === 'none') continue;
      if ((r.right > vw + 1 || r.left < -1) && !clipped(el)) {
        out.culprits.push(`${sel(el)} right=${Math.round(r.right)} left=${Math.round(r.left)} w=${Math.round(r.width)}`);
        if (out.culprits.length >= 8) break;
      }
    }
  }

  /* ---- touch targets ---- */
  if (touch) {
    const q = 'a[href], button, input:not([type=hidden]), select, textarea, summary, [role=button], [tabindex]:not([tabindex="-1"])';
    for (const el of document.querySelectorAll(q)) {
      const cs = getComputedStyle(el);
      if (cs.display === 'none' || cs.visibility === 'hidden') continue;
      if (el.closest('[hidden], [aria-hidden="true"], .sr-only, .booking__hp, .booking[hidden], .pmodal[hidden], [inert]')) continue;
      let target = el;
      if ((el.type === 'checkbox' || el.type === 'radio') && el.closest('label')) target = el.closest('label');
      const r = target.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) continue;
      if (r.bottom < 0 || r.top > 1e6) continue;
      /* An inline text link inside a sentence is exempt (WCAG 2.5.8 "inline" exception). */
      if (el.tagName === 'A' && cs.display === 'inline') { out.exemptInline++; continue; }
      if (r.width / zoom < 43.5 || r.height / zoom < 43.5) {
        out.small.push(`${sel(el)} ${Math.round(r.width)}x${Math.round(r.height)} "${(el.textContent || el.getAttribute('aria-label') || el.placeholder || '').trim().slice(0, 24)}"`);
      }
    }
  }

  /* ---- header ---- */
  const nav = document.querySelector('.navbar');
  if (nav) {
    const inner = nav.querySelector('.navbar__inner');
    const logo = nav.querySelector('.navbar__logo');
    const mark = nav.querySelector('.navbar__logo-mark-img');
    const text = nav.querySelector('.navbar__logo-text-img');
    const links = [...nav.querySelectorAll('.navbar__link')].filter((l) => l.offsetParent !== null);
    const burger = nav.querySelector('.navbar__hamburger');
    const burgerOn = burger && burger.offsetParent !== null;
    const actions = nav.querySelector('.navbar__actions');
    const R = (e) => e.getBoundingClientRect();
    const issues = [];
    if (R(nav).height / zoom > 96) issues.push(`navbar is ${Math.round(R(nav).height / zoom)}px tall (wrapped?)`);
    if (links.length && new Set(links.map((l) => Math.round(R(l).top))).size > 1) issues.push('menu items on more than one line');
    if (links.length && burgerOn) issues.push('menu and hamburger both visible');
    if (!links.length && !burgerOn) issues.push('no menu and no hamburger');
    if (mark && text && R(text).left < R(mark).right + 3) issues.push(`logo parts touch (gap ${Math.round(R(text).left - R(mark).right)}px)`);
    if (logo && actions && R(logo).right > R(actions).left - 3) issues.push(`logo overlaps actions (${Math.round(R(logo).right)} > ${Math.round(R(actions).left)})`);
    if (logo && links.length && R(logo).right > R(links[0]).left - 3) issues.push('logo overlaps first menu item');
    if (actions && (R(actions).right > vw + 0.5 || R(actions).left < -0.5)) issues.push('header actions outside the viewport');
    if (logo && R(logo).left < -0.5) issues.push('logo outside the viewport');
    if (burgerOn && R(burger).right > vw + 0.5) issues.push('hamburger outside the viewport');
    out.header = { issues, links: links.length, burger: !!burgerOn, height: Math.round(R(nav).height) };
  }
  return out;
}

async function autoScroll(page) {
  await page.evaluate(async () => {
    await new Promise((res) => {
      let y = 0;
      const step = () => {
        window.scrollTo(0, y);
        y += Math.max(300, window.innerHeight * 0.8);
        if (y < document.documentElement.scrollHeight + 300) setTimeout(step, 60); else { window.scrollTo(0, 0); setTimeout(res, 250); }
      };
      step();
    });
  });
}

async function checkPage(browser, [w, h], url) {
  const touch = isTouch(w);
  const ctx = await browser.newContext({
    viewport: { width: w, height: h },
    deviceScaleFactor: w >= 2560 ? 1 : 2,
    isMobile: touch, hasTouch: touch,
    locale: LANG === 'ru' ? 'ru-RU' : LANG === 'en' ? 'en-GB' : 'uz-UZ'
  });
  await ctx.addInitScript((lang) => { try { localStorage.setItem('sh-lang', lang); } catch (e) {} }, LANG);
  const page = await ctx.newPage();
  const problems = [];
  const consoleErrors = [];
  /* net::ERR_* lines are requests cut off when the context closes, not site errors.
     Real failures are caught by the HTTP status check below. */
  const teardown = /net::ERR_(NETWORK_IO_SUSPENDED|CONNECTION_CLOSED|ABORTED|CONNECTION_RESET)/;
  page.on('console', (m) => {
    if (m.type() !== 'error') return;
    const t = m.text();
    if (teardown.test(t) || /Failed to load resource/.test(t)) return;   // status errors are reported with their URL below
    consoleErrors.push(t.slice(0, 160));
  });
  page.on('pageerror', (e) => consoleErrors.push('pageerror: ' + String(e.message).slice(0, 160)));
  page.on('response', (r) => {
    if (r.url().startsWith(BASE) && r.status() >= 400) consoleErrors.push(`HTTP ${r.status()} ${r.url().replace(BASE, '')}`);
  });

  await page.goto(BASE + url, { waitUntil: 'networkidle', timeout: 45000 }).catch(() => {});
  await page.waitForTimeout(400);
  await page.evaluate(() => document.querySelectorAll('.reveal').forEach((e) => e.classList.add('visible')));
  await autoScroll(page);

  const r = await page.evaluate(inspect, { touch });

  const broken = await page.evaluate(() => [...document.images]
    .filter((i) => i.getAttribute('src') && i.complete && i.naturalWidth === 0 && !i.closest('.booking'))
    .map((i) => i.getAttribute('src')));

  if (r.overflow.scrollWidth > w + 1 || r.overflow.bodyScrollWidth > w + 1) {
    problems.push(`OVERFLOW scrollWidth=${r.overflow.scrollWidth} > ${w}  ← ${r.culprits.join(' | ') || 'unknown'}`);
  }
  if (consoleErrors.length) problems.push('CONSOLE ' + [...new Set(consoleErrors)].join(' | '));
  if (broken.length) problems.push('BROKEN IMG ' + [...new Set(broken)].join(', '));
  if (r.small.length) problems.push(`SMALL TARGETS (${r.small.length}) ` + [...new Set(r.small)].slice(0, 6).join(' | '));
  if (r.header.issues && r.header.issues.length) problems.push('HEADER ' + r.header.issues.join('; '));

  if (SHOTS) {
    const dir = path.join(HERE, 'shots', `${w}x${h}`);
    fs.mkdirSync(dir, { recursive: true });
    const name = (url === '/' ? 'home' : url.replace(/^\/|\/$/g, '').replace(/\//g, '_')) + '.png';
    await page.screenshot({ path: path.join(dir, name), fullPage: true }).catch(() => {});
  }
  await ctx.close();
  return { url, viewport: `${w}x${h}`, problems, exempt: r.exemptInline, small: r.small };
}

const browser = await chromium.launch({ channel: 'chrome' });
const jobs = [];
for (const vp of VIEWPORTS) for (const url of PAGES) jobs.push([vp, url]);

const results = [];
let next = 0;
async function worker() {
  while (next < jobs.length) {
    const [vp, url] = jobs[next++];
    try { results.push(await checkPage(browser, vp, url)); }
    catch (e) { results.push({ url, viewport: vp.join('x'), problems: ['TEST ERROR ' + e.message.slice(0, 200)] }); }
  }
}
await Promise.all(Array.from({ length: CONCURRENCY }, worker));
await browser.close();

results.sort((a, b) => (parseInt(a.viewport) - parseInt(b.viewport)) || a.url.localeCompare(b.url));
let failed = 0;
const byViewport = {};
for (const r of results) {
  (byViewport[r.viewport] ||= []).push(r);
  if (r.problems.length) failed++;
}
console.log(`\nlang=${LANG}  pages=${PAGES.length}  viewports=${VIEWPORTS.length}  checks=${results.length}`);
for (const [vp, list] of Object.entries(byViewport)) {
  const bad = list.filter((r) => r.problems.length);
  console.log(`\n${bad.length ? '✗' : '✓'} ${vp}  ${list.length - bad.length}/${list.length} pages clean`);
  for (const r of bad) for (const p of r.problems) console.log(`    ${r.url.padEnd(34)} ${p}`);
}
console.log(`\n${failed === 0 ? 'ALL CLEAN' : failed + ' of ' + results.length + ' checks have problems'}`);
fs.mkdirSync(path.join(HERE, 'reports'), { recursive: true });
fs.writeFileSync(path.join(HERE, 'reports', `responsive-${LANG}.json`), JSON.stringify(results, null, 2));
process.exit(failed ? 1 : 0);
