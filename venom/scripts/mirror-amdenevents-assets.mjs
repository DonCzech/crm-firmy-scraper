/**
 * Mirror amdenevents.cz (WordPress + custom aevents theme)
 */
import fs from 'node:fs';
import path from 'node:path';
import https from 'node:https';
import http from 'node:http';

const CLONE_DIR = '/Users/apple/DEV/CRM/venom/public/clones/amdenevents';
const BASE = 'https://amdenevents.cz';

const PAGES = [
  { slug: 'home',           url: `${BASE}/` },
  { slug: 'sluzby',         url: `${BASE}/sluzby/` },
  { slug: 'reference',      url: `${BASE}/reference/` },
  { slug: 'event-agentura', url: `${BASE}/event-agentura/` },
  { slug: 'kontakt',        url: `${BASE}/kontakt/` },
];

function download(url, dest) {
  return new Promise((resolve) => {
    if (fs.existsSync(dest)) { resolve(true); return; }
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    const client = url.startsWith('https') ? https : http;
    const tmp = dest + '.tmp';
    const file = fs.createWriteStream(tmp);
    const req = client.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' }, timeout: 20000 }, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        file.close(); try { fs.unlinkSync(tmp); } catch {}
        download(res.headers.location, dest).then(resolve); return;
      }
      if (res.statusCode !== 200) { file.close(); try { fs.unlinkSync(tmp); } catch {} resolve(false); return; }
      res.pipe(file);
      file.on('finish', () => { file.close(); fs.renameSync(tmp, dest); resolve(true); });
    });
    req.on('error', () => { file.close(); try { fs.unlinkSync(tmp); } catch {} resolve(false); });
    req.on('timeout', () => { req.destroy(); resolve(false); });
  });
}

function fetchText(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    let data = '';
    const req = client.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' }, timeout: 20000 }, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        fetchText(res.headers.location).then(resolve).catch(reject); return;
      }
      res.setEncoding('utf8');
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('timeout')); });
  });
}

// Fetch pages
console.log('Fetching pages...');
for (const page of PAGES) {
  const dest = path.join(CLONE_DIR, 'pages', `${page.slug}.html`);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  if (fs.existsSync(dest)) { console.log(`  SKIP ${page.slug}`); continue; }
  try {
    const html = await fetchText(page.url);
    fs.writeFileSync(dest, html);
    console.log(`  ✓ ${page.slug} (${html.length} bytes)`);
  } catch (e) {
    console.log(`  FAIL ${page.slug}: ${e.message}`);
  }
}

// Collect all asset URLs from all pages
const allHtml = PAGES.map(p => {
  const f = path.join(CLONE_DIR, 'pages', `${p.slug}.html`);
  return fs.existsSync(f) ? fs.readFileSync(f, 'utf8') : '';
}).join('\n');

const assetUrls = new Set();
// WP uploads + theme files
for (const m of allHtml.matchAll(/https?:\/\/amdenevents\.cz\/(wp-content|wp-includes)[^\s"'<>?#]+\.(jpg|jpeg|png|svg|gif|webp|css|js|woff|woff2|ttf)/gi)) {
  assetUrls.add(m[0]);
}

console.log(`\nDownloading ${assetUrls.size} assets...`);
let ok = 0, fail = 0;
for (const url of assetUrls) {
  const u = new URL(url);
  const dest = path.join(CLONE_DIR, u.pathname);
  const r = await download(url, dest);
  if (r) ok++; else fail++;
}
console.log(`Done: ${ok} ok, ${fail} fail`);
