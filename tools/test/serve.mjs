/* A tiny static server that behaves like real hosting: gzip for text files and
   Cache-Control on everything. Used for Lighthouse, because the bare
   `python3 -m http.server` sends neither and would drag the scores down for reasons
   that have nothing to do with the site.

     node serve.mjs            # serves the project root on http://localhost:8081
*/
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const PORT = Number(process.env.PORT || 8081);
const TYPES = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8', '.webp': 'image/webp', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.xml': 'application/xml', '.txt': 'text/plain; charset=utf-8', '.ico': 'image/x-icon' };
const GZIP = new Set(['.html', '.css', '.js', '.json', '.svg', '.xml', '.txt']);

http.createServer((req, res) => {
  let p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  if (p.endsWith('/')) p += 'index.html';
  const file = path.join(ROOT, p);
  if (!file.startsWith(ROOT) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) { res.writeHead(404); return res.end('Not found'); }
  const ext = path.extname(file);
  const headers = { 'Content-Type': TYPES[ext] || 'application/octet-stream',
    /* versioned CSS/JS (?v=hash) and fonts can be cached hard; everything else for an hour */
    'Cache-Control': (req.url.includes('?v=') || ext === '.woff2') ? 'public, max-age=31536000, immutable' : 'public, max-age=3600' };
  const body = fs.readFileSync(file);
  if (GZIP.has(ext) && /\bgzip\b/.test(req.headers['accept-encoding'] || '')) {
    headers['Content-Encoding'] = 'gzip'; headers['Vary'] = 'Accept-Encoding';
    res.writeHead(200, headers); return res.end(zlib.gzipSync(body));
  }
  res.writeHead(200, headers); res.end(body);
}).listen(PORT, () => console.log(`serving ${ROOT} on http://localhost:${PORT}`));
