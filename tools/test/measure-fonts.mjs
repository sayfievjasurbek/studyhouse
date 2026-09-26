/* Measures how wide the web fonts render compared with the system fallbacks, to
   derive @font-face `size-adjust` values so the fallback text takes the same room. */
import { chromium } from 'playwright-core';
const browser = await chromium.launch({ channel: 'chrome' });
const page = await browser.newPage();
await page.setContent(`<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Playfair+Display:ital,wght@0,600;0,700;1,500&display=swap"><body></body>`);
await page.evaluate(() => document.fonts.ready);
await page.evaluate(() => Promise.all([document.fonts.load('400 16px Inter'), document.fonts.load('600 16px Inter'), document.fonts.load('700 16px "Playfair Display"'), document.fonts.load('600 16px "Playfair Display"')]));
const SAMPLE = 'The quick brown fox jumps over the lazy dog. Kelajagingiz toʻgʻri universitetdan boshlanadi. Ваше будущее начинается с правильного университета 0123456789';
const r = await page.evaluate((text) => {
  const w = (family, weight) => { const s = document.createElement('span'); s.style.cssText = `font:${weight} 100px ${family};white-space:nowrap;position:absolute`; s.textContent = text; document.body.appendChild(s); const x = s.getBoundingClientRect().width; s.remove(); return x; };
  return {
    interRegular: w('Inter, monospace', 400), arial: w('Arial, monospace', 400), helv: w('"Helvetica Neue", monospace', 400),
    playfair700: w('"Playfair Display", monospace', 700), playfair600: w('"Playfair Display", monospace', 600), georgia: w('Georgia, monospace', 700), georgia600: w('Georgia, monospace', 600), times: w('"Times New Roman", monospace', 700)
  };
}, SAMPLE);
console.log(JSON.stringify(r, null, 1));
console.log('Inter/Arial size-adjust        =', (r.interRegular / r.arial * 100).toFixed(2) + '%');
console.log('Playfair700/Georgia size-adjust =', (r.playfair700 / r.georgia * 100).toFixed(2) + '%');
console.log('Playfair600/Georgia600          =', (r.playfair600 / r.georgia600 * 100).toFixed(2) + '%');
await browser.close();
