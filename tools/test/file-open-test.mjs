/* Pages opened straight from the folder (file:// — what happens when someone downloads the
   repo and double-clicks index.html). Browsers refuse fetch() there, so the data-driven parts
   (GPA calculator, comparison tables, Services cards) must come from data/bundle.js.
   Also checks that online (http) the bundle is never downloaded.
     node file-open-test.mjs */
import { chromium } from 'playwright-core';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const HTTP = process.env.BASE || 'http://localhost:8000';
let fails = 0;
const check = (name, ok, extra = '') => { if (!ok) fails++; console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${ok ? '' : '  ' + extra}`); };

// [page, selector that only exists once the data has loaded, minimum count]
const CASES = [
  ['gpa-calculator/index.html', '[data-gpa] select, [data-gpa] input', 1],
  ['index.html', '[data-gpa] select, [data-gpa] input', 1],
  ['services/index.html', '#prog-grid > *', 6],
  ['destinations/usa/index.html', '#compare-root table, #compare-root .cmp-table, #compare-root tr', 3],
  ['destinations/australia/index.html', '#compare-root tr', 3],
  ['destinations/china/index.html', '#compare-root tr', 3],
];

const b = await chromium.launch({ channel: 'chrome' });
for (const [page, sel, min] of CASES) {
  const ctx = await b.newContext({ viewport: { width: 1280, height: 900 } });
  const p = await ctx.newPage();
  const errs = [];
  p.on('pageerror', (e) => errs.push(e.message));
  p.on('console', (m) => { if (m.type() === 'error' && !/font|CORS|ERR_FAILED/i.test(m.text())) errs.push(m.text()); });
  await p.goto('file://' + path.join(ROOT, page));
  await p.waitForTimeout(2500);
  const n = await p.locator(sel).count();
  const empty = await p.evaluate(() => /could not be loaded|yuklab boʻlmadi|не удалось/i.test(document.body.innerText));
  check(`file://  ${page}: data-driven content is there (${n} found)`, n >= min && !empty, `count ${n}, error text shown: ${empty}; ${errs.join(' | ')}`);
  check(`file://  ${page}: no script errors`, errs.length === 0, errs.join(' | '));
  await ctx.close();
}

// Online, the bundle must not be requested at all
const ctx = await b.newContext();
const p = await ctx.newPage();
const seen = [];
p.on('request', (r) => seen.push(r.url()));
await p.goto(HTTP + '/gpa-calculator/index.html', { waitUntil: 'networkidle' });
check('http: the calculator works and data/bundle.js is NOT downloaded', (await p.locator('[data-gpa] select, [data-gpa] input').count()) >= 1 && !seen.some((u) => u.includes('bundle.js')), seen.filter((u) => u.includes('bundle')).join());
await b.close();
console.log(fails ? `\n${fails} FAILED` : '\nALL PASS');
process.exit(fails ? 1 : 0);
