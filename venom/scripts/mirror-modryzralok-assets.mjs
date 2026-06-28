/**
 * Mirror modryzralok.cz — Webflow site
 * Pages: /, /cenik, /reference, /kontakt, /o-nas
 */
import pkg from '/Users/apple/.npm/_npx/e41f203b7505f1fb/node_modules/playwright/index.js';
const { chromium } = pkg;
import fs from 'node:fs';
import path from 'node:path';
import https from 'node:https';
import http from 'node:http';

const BASE_URL = 'https://www.modryzralok.cz';
const CLONE_DIR = '/Users/apple/DEV/CRM/venom/public/clones/modryzralok';
const PAGES_DIR = path.join(CLONE_DIR, 'pages');
const CDN_PREFIX = 'https://cdn.prod.website-files.com/681c7a15c268cbf8d16cd011/';
const SITE_ID = '681c7a15c268cbf8d16cd011';

fs.mkdirSync(PAGES_DIR, { recursive: true });

const assetMap = {};

function download(url, destPath) {
  return new Promise((resolve, reject) => {
    fs.mkdirSync(path.dirname(destPath), { recursive: true });
    if (fs.existsSync(destPath) && fs.statSync(destPath).size > 0) return resolve();
    const proto = url.startsWith('https') ? https : http;
    const file = fs.createWriteStream(destPath);
    proto.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, res => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        file.close();
        fs.unlinkSync(destPath);
        return download(res.headers.location, destPath).then(resolve).catch(reject);
      }
      res.pipe(file);
      file.on('finish', () => { file.close(); resolve(); });
    }).on('error', reject);
  });
}

const PAGES = [
  { slug: 'home',      url: '/' },
  { slug: 'cenik',     url: '/cenik' },
  { slug: 'reference', url: '/reference' },
  { slug: 'kontakt',   url: '/kontakt' },
  { slug: 'o-nas',     url: '/o-nas' },
];

const browser = await chromium.launch();
const context = await browser.newContext({ ignoreHTTPSErrors: true });

// Intercept assets
context.on('response', async (response) => {
  const url = response.url();
  if (!url.includes('website-files.com') && !url.includes('modryzralok.cz')) return;
  const ct = response.headers()['content-type'] || '';
  if (!ct.match(/css|javascript|image|font|svg|webp|png|jpg|jpeg|gif/)) return;

  let localPath;
  if (url.includes('website-files.com')) {
    // cdn.prod.website-files.com/SITE_ID/path
    const match = url.match(/website-files\.com\/[^/]+\/(.+?)(\?.*)?$/);
    if (!match) return;
    localPath = path.join(CLONE_DIR, 'cdn', match[1]);
    assetMap[url.split('?')[0]] = `/clones/modryzralok/cdn/${match[1]}`;
  } else if (url.includes('modryzralok.cz')) {
    const urlPath = new URL(url).pathname;
    if (urlPath === '/' || PAGES.some(p => p.url === urlPath)) return;
    localPath = path.join(CLONE_DIR, urlPath);
    assetMap[url.split('?')[0]] = `/clones/modryzralok${urlPath}`;
  }
  if (!localPath) return;
  if (fs.existsSync(localPath) && fs.statSync(localPath).size > 0) return;

  try {
    const buf = await response.body();
    fs.mkdirSync(path.dirname(localPath), { recursive: true });
    fs.writeFileSync(localPath, buf);
  } catch {}
});

for (const p of PAGES) {
  const page = await context.newPage();
  await page.goto(`${BASE_URL}${p.url}`, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(2000);
  const html = await page.content();
  fs.writeFileSync(path.join(PAGES_DIR, `${p.slug}.html`), html);
  console.log(`Saved ${p.slug}: ${html.length} chars`);
  await page.close();
}

await browser.close();
fs.writeFileSync(path.join(CLONE_DIR, 'assetMap.json'), JSON.stringify(assetMap, null, 2));
console.log(`Assets captured: ${Object.keys(assetMap).length}`);
