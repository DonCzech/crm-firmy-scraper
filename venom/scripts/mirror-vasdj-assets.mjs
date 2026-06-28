/**
 * Mirror vasdj.cz (SKY:CMS — server-rendered HTML)
 */
import fs from 'node:fs';
import path from 'node:path';
import https from 'node:https';
import http from 'node:http';

const CLONE_DIR = '/Users/apple/DEV/CRM/venom/public/clones/vasdj';
const BASE = 'https://www.vasdj.cz';

const PAGES = [
  { slug: 'home',        url: `${BASE}/` },
  { slug: 'sluzby',      url: `${BASE}/sluzby.html` },
  { slug: 'reference',   url: `${BASE}/reference.html` },
  { slug: 'nas-tym',     url: `${BASE}/nas-tym.html` },
  { slug: 'kontakt',     url: `${BASE}/kontakt.html` },
];

// All static assets to download
const ASSETS = [
  `${BASE}/_css/_www/build.v1741088699.css`,
  `${BASE}/_css/_www/build.data.v1525885435.css`,
  `${BASE}/_scripts/_js/build.v1525885652.js`,
  `${BASE}/_layout/_www/logo.svg`,
  `${BASE}/_layout/_www/team.png`,
  `${BASE}/_layout/_www/category-11.jpg`,
  `${BASE}/_layout/_www/category-12.jpg`,
  `${BASE}/_layout/_www/category-13.jpg`,
  `${BASE}/_layout/_www/category-18.jpg`,
  `${BASE}/_layout/_www/category-19.jpg`,
  `${BASE}/_layout/_www/category-20.jpg`,
  `${BASE}/_layout/_www/category-21.jpg`,
  `${BASE}/_layout/_www/category-344.jpg`,
  `${BASE}/_layout/_www/_references/bmw.svg`,
  `${BASE}/_layout/_www/_references/csob.svg`,
  `${BASE}/_layout/_www/_references/ikea.svg`,
  `${BASE}/_layout/_www/_references/kik.svg`,
  `${BASE}/_layout/_www/_references/kpmg.svg`,
  `${BASE}/_layout/_www/_references/nespresso.svg`,
  `${BASE}/_layout/_www/_references/o2.svg`,
  `${BASE}/_layout/_www/_references/orea.svg`,
  `${BASE}/_layout/_www/_references/uniqa.svg`,
  `${BASE}/_layout/_www/_references/vorwerk.svg`,
];

function download(url, dest) {
  return new Promise((resolve) => {
    if (fs.existsSync(dest)) { resolve(true); return; }
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    const client = url.startsWith('https') ? https : http;
    const tmp = dest + '.tmp';
    const file = fs.createWriteStream(tmp);
    const req = client.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' }, timeout: 15000 }, (res) => {
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
    const req = client.get(url, { headers: { 'User-Agent': 'Mozilla/5.0', 'Accept': 'text/html' }, timeout: 15000 }, (res) => {
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

// Also fetch additional page images that may appear in subpages
const allHtml = PAGES.map(p => {
  const f = path.join(CLONE_DIR, 'pages', `${p.slug}.html`);
  return fs.existsSync(f) ? fs.readFileSync(f, 'utf8') : '';
}).join('\n');

// Extract storage.vasdj.cz URLs
const storageUrls = [...new Set([...allHtml.matchAll(/https?:\/\/(?:storage|www)\.vasdj\.cz\/[^"'\s)>]+/g)].map(m => m[0]))];
const allAssets = [...new Set([...ASSETS, ...storageUrls.filter(u => u.match(/\.(jpg|jpeg|png|svg|gif|webp|css|js)/i))])];
console.log(`\nDownloading ${allAssets.length} assets...`);

for (const url of allAssets) {
  const u = new URL(url);
  const dest = path.join(CLONE_DIR, u.pathname);
  const result = await download(url, dest);
  if (!result) console.log(`  FAIL: ${url}`);
}
console.log('Done ✅');
