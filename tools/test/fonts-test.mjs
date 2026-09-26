/* Confirms the self-hosted fonts load, cover Latin (incl. the Uzbek U+02BB), Latin-Extended and Cyrillic,
   render in the real font (not a fallback), and that no request goes to a third party.   node fonts-test.mjs */
import { chromium } from 'playwright-core';
const b = await chromium.launch({ channel: 'chrome' });
let bad = 0; const say = (ok, m) => { if (!ok) bad++; console.log((ok ? 'PASS  ' : 'FAIL  ') + m); };
for (const lang of ['uz', 'ru', 'en']) {
  const ctx = await b.newContext({ viewport: { width: 1280, height: 800 } });
  await ctx.addInitScript((l) => { try { localStorage.setItem('sh-lang', l); } catch (e) {} }, lang);
  const p = await ctx.newPage();
  const external = []; const fontReq = [];
  p.on('request', (r) => { const u = r.url(); if (!u.startsWith('http://localhost')) external.push(u); if (u.endsWith('.woff2')) fontReq.push(u.split('/').pop()); });
  await p.goto('http://localhost:8000/', { waitUntil: 'networkidle' });
  await p.evaluate(() => document.fonts.ready);
  /* A subset is fetched the first time a page needs it, so ask for the ones a probe uses and wait. */
  await p.evaluate(() => Promise.all([
    document.fonts.load('700 40px "Playfair Display"', 'Ваше'), document.fonts.load('500 40px Inter', 'Университеты'),
    document.fonts.load('700 40px "Playfair Display"', 'toʻgʻri'), document.fonts.load('400 40px Inter', 'ŞĞİ')]));
  const r = await p.evaluate(async () => {
    const faces = []; document.fonts.forEach((f) => { if (f.status === 'loaded') faces.push(f.family.replace(/"/g, '') + ' ' + f.style + ' ' + f.unicodeRange.slice(0, 14)); });
    // is the h1 actually drawn in Playfair? compare its width with the same text in a monospace control
    const h1 = document.querySelector('.hero__heading');
    const cs = getComputedStyle(h1);
    const sample = (fam, txt, w, st) => { const s = document.createElement('span'); s.style.cssText = `font:${st || 'normal'} ${w} 40px ${fam};white-space:nowrap;position:absolute`; s.textContent = txt; document.body.appendChild(s); const x = s.getBoundingClientRect().width; s.remove(); return x; };
    const probe = (txt, fam, w) => sample(fam + ',monospace', txt, w) !== sample('monospace', txt, w);
    return { loaded: faces, h1font: cs.fontFamily.slice(0, 40), h1: h1.textContent.trim().slice(0, 40),
      latin: probe('Kelajagingiz', 'Playfair Display', 700), uzbek: probe('toʻgʻri oʻqish', 'Playfair Display', 700), ext: probe('ŞĞİ čšž', 'Inter', 400),
      cyr: probe('Ваше будущее', 'Playfair Display', 700), cyrInter: probe('Университеты', 'Inter', 500) };
  });
  say(external.length === 0, `${lang}: no request leaves the site (${external.length} external)`);
  say(r.loaded.length >= 3, `${lang}: ${r.loaded.length} font files loaded — ${[...new Set(fontReq)].join(', ')}`);
  say(r.latin && r.uzbek, `${lang}: Playfair renders Latin and the Uzbek ʻ`);
  say(r.ext, `${lang}: Inter renders Latin-Extended`);
  say(r.cyr && r.cyrInter, `${lang}: Playfair and Inter render Cyrillic`);
  await ctx.close();
}
await b.close(); process.exit(bad ? 1 : 0);
