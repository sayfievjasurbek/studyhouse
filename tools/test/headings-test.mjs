/* Heading levels must not skip on the way down (h1 -> h3 without an h2).   node headings-test.mjs */
import { chromium } from 'playwright-core';
const PAGES = ['/', '/services/', '/destinations/', '/destinations/usa/', '/destinations/australia/', '/destinations/china/', '/destinations/europe/', '/destinations/europe/germany/', '/destinations/europe/italy/', '/destinations/europe/france/', '/destinations/europe/spain/', '/destinations/europe/finland/', '/destinations/europe/latvia/', '/expertise/', '/gpa-calculator/'];
const b = await chromium.launch({ channel: 'chrome' });
const p = await (await b.newContext({ viewport: { width: 1280, height: 900 } })).newPage();
await p.addInitScript(() => { try { localStorage.setItem('sh-lang', 'en'); } catch (e) {} });
let bad = 0;
for (const url of PAGES) {
  await p.goto('http://localhost:8000' + url, { waitUntil: 'networkidle' });
  const r = await p.evaluate(() => {
    const hs = [...document.querySelectorAll('h1,h2,h3,h4,h5,h6')].filter((h) => h.offsetParent !== null && !h.closest('[hidden]'));
    const issues = []; let prev = 0; let h1s = 0;
    for (const h of hs) { const l = +h.tagName[1]; if (l === 1) h1s++; if (prev && l > prev + 1) issues.push(`h${prev} -> h${l} "${h.textContent.trim().slice(0, 30)}"`); prev = l; }
    return { issues, h1s, n: hs.length };
  });
  const ok = r.issues.length === 0 && r.h1s === 1;
  if (!ok) bad++;
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${url.padEnd(32)} ${r.n} headings, ${r.h1s} h1 ${r.issues.join(' | ')}`);
}
await b.close(); process.exit(bad ? 1 : 0);
