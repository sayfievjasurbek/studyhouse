/* Runs Lighthouse (mobile) against the pages in PAGES and prints the four scores.

     node serve.mjs &                                  # in one terminal
     node lighthouse.mjs                               # home + GPA calculator
     node lighthouse.mjs --pages /,/services/ --label after
*/
import lighthouse from 'lighthouse';
import * as chromeLauncher from 'chrome-launcher';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const BASE = process.env.BASE || 'http://localhost:8081';
const args = process.argv.slice(2);
const opt = (n, d) => { const i = args.indexOf('--' + n); return i >= 0 ? args[i + 1] : d; };
const PAGES = opt('pages', '/,/gpa-calculator/').split(',');
const LABEL = opt('label', 'run');

const chrome = await chromeLauncher.launch({ chromeFlags: ['--headless=new', '--no-sandbox'] });
const rows = [];
for (const url of PAGES) {
  const r = await lighthouse(BASE + url, { port: chrome.port, output: 'json', logLevel: 'error',
    onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'] });
  const c = r.lhr.categories, a = r.lhr.audits;
  const failed = Object.values(a).filter((x) => x.score !== null && x.score < 0.9 && x.scoreDisplayMode !== 'informative' && x.scoreDisplayMode !== 'notApplicable' && x.scoreDisplayMode !== 'manual')
    .map((x) => `${x.id}(${Math.round(x.score * 100)})`);
  rows.push({ url, performance: Math.round(c.performance.score * 100), accessibility: Math.round(c.accessibility.score * 100),
    bestPractices: Math.round(c['best-practices'].score * 100), seo: Math.round(c.seo.score * 100),
    metrics: { FCP: a['first-contentful-paint'].displayValue, LCP: a['largest-contentful-paint'].displayValue,
      TBT: a['total-blocking-time'].displayValue, CLS: a['cumulative-layout-shift'].displayValue, SI: a['speed-index'].displayValue },
    failed });
  fs.mkdirSync(path.join(HERE, 'reports'), { recursive: true });
  fs.writeFileSync(path.join(HERE, 'reports', `lighthouse-${LABEL}-${url.replace(/\W+/g, '_')}.json`), JSON.stringify(r.lhr));
}
await chrome.kill();
for (const r of rows) {
  console.log(`\n${r.url}   Performance ${r.performance}  Accessibility ${r.accessibility}  Best Practices ${r.bestPractices}  SEO ${r.seo}`);
  console.log('   ' + Object.entries(r.metrics).map(([k, v]) => `${k} ${v}`).join('   '));
  console.log('   audits below 90: ' + (r.failed.join(', ') || 'none'));
}
fs.writeFileSync(path.join(HERE, 'reports', `lighthouse-${LABEL}.json`), JSON.stringify(rows, null, 2));
