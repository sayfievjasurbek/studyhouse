/* Lists body-copy text (paragraphs, list items, definitions of 40+ characters) smaller than 16px on a phone.
     node fontsize.mjs [width] */
import { chromium } from 'playwright-core';
const w = Number(process.argv[2] || 375);
const b = await chromium.launch({ channel: 'chrome' });
const ctx = await b.newContext({ viewport: { width: w, height: 800 }, isMobile: true, hasTouch: true });
await ctx.addInitScript(() => { try { localStorage.setItem('sh-lang', 'uz'); } catch (e) {} });
const p = await ctx.newPage();
const tally = {};
const pages = ['/', '/services/', '/destinations/', '/destinations/usa/', '/destinations/europe/germany/', '/expertise/', '/gpa-calculator/'];
for (const url of pages) {
  await p.goto('http://localhost:8000' + url, { waitUntil: 'networkidle' });
  await p.evaluate(() => document.querySelectorAll('.reveal').forEach((e) => e.classList.add('visible')));
  const rows = await p.evaluate(() => {
    const out = [];
    for (const el of document.querySelectorAll('p, li, dd, td, figcaption, summary, label, span, a')) {
      if (el.children.length > 2) continue;
      const own = [...el.childNodes].filter((n) => n.nodeType === 3).map((n) => n.textContent).join('').trim();
      if (own.length < 40) continue;
      const cs = getComputedStyle(el); if (cs.display === 'none' || cs.visibility === 'hidden') continue;
      const r = el.getBoundingClientRect(); if (!r.width || !r.height) continue;
      const fs = parseFloat(cs.fontSize);
      if (fs < 15.9) out.push([el.className ? '.' + String(el.className).split(' ')[0] : el.tagName.toLowerCase(), fs, own.slice(0, 40)]);
    }
    return out;
  });
  for (const [k, fs, txt] of rows) { tally[k] ||= { fs, n: 0, ex: txt, pages: new Set() }; tally[k].n++; tally[k].pages.add(url); }
}
await b.close();
const list = Object.entries(tally).sort((a, b) => b[1].n - a[1].n);
console.log(`${list.length} body-text classes under 16px at ${w}px:`);
for (const [k, v] of list) console.log(`  ${k.padEnd(34)} ${String(v.fs).padStart(5)}px  x${String(v.n).padEnd(3)} "${v.ex}"`);
