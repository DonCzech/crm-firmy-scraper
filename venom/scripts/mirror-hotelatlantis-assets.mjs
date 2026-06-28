/**
 * Mirror hotel-atlantis.cz — Vite/custom SPA
 */
import pkg from '/Users/apple/.npm/_npx/e41f203b7505f1fb/node_modules/playwright/index.js';
const { chromium } = pkg;
import fs from 'node:fs';
import path from 'node:path';

const BASE_URL = 'https://www.hotel-atlantis.cz';
const CLONE_DIR = '/Users/apple/DEV/CRM/venom/public/clones/hotelatlantis';
const PAGES_DIR = path.join(CLONE_DIR, 'pages');
fs.mkdirSync(PAGES_DIR, { recursive: true });

const PAGES = [
  { slug: 'home',      url: '/' },
  { slug: 'ubytovani', url: '/ubytovani' },
  { slug: 'wellness',  url: '/wellness' },
  { slug: 'galerie',   url: '/galerie' },
  { slug: 'cenik',     url: '/cenik' },
  { slug: 'kontakt',   url: '/kontakt' },
];

const assetMap = {};
const browser = await chromium.launch();
const context = await browser.newContext({ ignoreHTTPSErrors: true });

context.on('response', async (response) => {
  const url = response.url();
  if (!url.includes('hotel-atlantis.cz') && !url.includes('hotelatlantis.cz')) return;
  const ct = response.headers()['content-type'] || '';
  if (!ct.match(/css|javascript|image|font|svg|webp|png|jpg|jpeg|gif|woff/)) return;
  const urlPath = new URL(url).pathname;
  if (PAGES.some(p => p.url === urlPath) || urlPath === '/') return;
  const localPath = path.join(CLONE_DIR, urlPath);
  assetMap[url.split('?')[0]] = `/clones/hotelatlantis${urlPath}`;
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
  await page.waitForTimeout(3000);
  const html = await page.content();
  fs.writeFileSync(path.join(PAGES_DIR, `${p.slug}.html`), html);
  console.log(`Saved ${p.slug}: ${html.length} chars`);
  await page.close();
}

await browser.close();
fs.writeFileSync(path.join(CLONE_DIR, 'assetMap.json'), JSON.stringify(assetMap, null, 2));
console.log(`Assets: ${Object.keys(assetMap).length}`);
