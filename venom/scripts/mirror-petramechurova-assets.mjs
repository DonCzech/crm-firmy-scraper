/**
 * FÁZE 1 — Mirror assets z petramechurova.cz → public/clones/petramechurova/
 * Weblantis CMS + Bootstrap 5.3
 * Obrázky z admin.weblantis.cz/storage/creator/45/
 *
 * Spustit: node scripts/mirror-petramechurova-assets.mjs
 */

import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';
import pwPkg from '/Users/apple/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core/index.js';
const { chromium } = pwPkg;

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const SLUG = 'petramechurova';
const ORIGIN = 'https://www.petramechurova.cz';
const WEBLANTIS_CDN = 'https://admin.weblantis.cz';
const CLONE_DIR = path.join(ROOT, `public/clones/${SLUG}`);
const CLONE_PATH = `/clones/${SLUG}`;

const PAGES = [
  { slug: 'home',     url: '/cs/' },
  { slug: 'kolekce',  url: '/cs/kolekce/' },
  { slug: 'kontakt',  url: '/cs/kontakt/' },
  { slug: 'oceneni',  url: '/cs/oceneni/' },
  { slug: 'tym',      url: '/cs/tym-1/' },
];

// Adresáře
for (const d of ['pages', 'css', 'js', 'img', 'fonts', 'assets/css', 'assets/js', 'assets/img', 'storage']) {
  fs.mkdirSync(path.join(CLONE_DIR, d), { recursive: true });
}

function log(msg) { console.log(`[${new Date().toISOString().slice(11,19)}] ${msg}`); }

function downloadFile(url, dest) {
  return new Promise((res, rej) => {
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    const file = fs.createWriteStream(dest);
    const req = https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (resp) => {
      if ([301, 302, 303].includes(resp.statusCode) && resp.headers.location) {
        file.close();
        try { fs.unlinkSync(dest); } catch {}
        return downloadFile(resp.headers.location, dest).then(res).catch(rej);
      }
      if (resp.statusCode !== 200) { file.close(); try { fs.unlinkSync(dest); } catch {}; return res(resp.statusCode); }
      resp.pipe(file);
      file.on('finish', () => { file.close(); res(200); });
    });
    req.on('error', rej);
  });
}

function rewriteHtml(html) {
  return html
    // Tracking odstranit
    .replace(/<script[^>]*(googletagmanager|google-analytics|gtag|hotjar|smartlook|facebook\.net)[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<script[^>]*(googletagmanager|google-analytics|gtag)[^>]*\/>/gi, '')
    // Cookie consent smazat
    .replace(/<div[^>]*id="cookieConsent"[^>]*>[\s\S]*?<\/div>/gi, '')
    .replace(/<div[^>]*class="[^"]*cookie[^"]*"[^>]*>[\s\S]*?<\/div>/gi, '')
    .replace(/<script[^>]*cookie[^>]*>[\s\S]*?<\/script>/gi, '')
    // Weblantis booking API → #rezervace
    .replace(/https:\/\/admin\.weblantis\.cz\/api\/[^\s"'<>]*/g, '#rezervace')
    // Social links → #
    .replace(/href="https?:\/\/(?:www\.)?(?:facebook|instagram|tiktok|twitter|youtube)\.com\/[^"]*"/g, 'href="#"')
    // E-SHOP link → #
    .replace(/href="[^"]*eshop[^"]*"/gi, 'href="#"')
    // weblantis.cz odkaz → #
    .replace(/href="https?:\/\/(?:www\.)?weblantis\.cz[^"]*"/gi, 'href="#"')
    // Rewrite CDN URLs
    .replaceAll(WEBLANTIS_CDN, CLONE_PATH)
    .replaceAll(ORIGIN, CLONE_PATH)
    // Rewrite lokální /cs/ paths
    .replace(/href="\/cs\//g, `href="${CLONE_PATH}/pages/`)
    .replace(/action="\/cs\//g, `action="#`)
    // Smazat RSS/sitemap links
    .replace(/<link[^>]*(?:rss|sitemap|xmlrpc)[^>]*>/gi, '')
    // Smazat language switcher EN variantu (flag links)
    .replace(/<a[^>]*href="\/en\/[^"]*"[^>]*>[\s\S]*?<\/a>/gi, '')
    // Smazat generator meta
    .replace(/<meta[^>]*name="generator"[^>]*>/gi, '');
}

const browser = await chromium.launch({
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  args: ['--no-sandbox', '--disable-dev-shm-usage'],
});

const context = await browser.newContext({
  userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
  locale: 'cs-CZ',
  extraHTTPHeaders: { 'Accept-Language': 'cs,en;q=0.9' },
});

// Sbírat assety
const assetMap = new Map();
context.on('response', async (resp) => {
  const url = resp.url();
  if (assetMap.has(url)) return;
  const isLocal = url.startsWith(ORIGIN);
  const isCDN = url.startsWith(WEBLANTIS_CDN);
  if (!isLocal && !isCDN) return;
  const ct = resp.headers()['content-type'] || '';
  if (!/(css|javascript|image|font|woff|svg|webp|jpeg|jpg|png)/.test(ct)) return;
  try { assetMap.set(url, await resp.body()); } catch {}
});

for (const p of PAGES) {
  log(`Scraping ${p.slug} (${p.url})...`);
  const page = await context.newPage();
  try {
    await page.goto(ORIGIN + p.url, { waitUntil: 'domcontentloaded', timeout: 25000 });
    // Zavřít cookie dialog pokud existuje
    try {
      await page.click('button[id*="accept"], button[class*="accept"], .cookie-accept', { timeout: 2000 });
    } catch {}
    await page.waitForTimeout(3000);
    // Scroll pro lazy images
    await page.evaluate(() => { window.scrollTo(0, document.body.scrollHeight); });
    await page.waitForTimeout(2000);
    await page.evaluate(() => { window.scrollTo(0, 0); });

    let html = await page.content();
    html = rewriteHtml(html);

    const outPath = path.join(CLONE_DIR, 'pages', `${p.slug}.html`);
    fs.writeFileSync(outPath, html, 'utf-8');
    fs.writeFileSync(`/tmp/petramechurova-${p.slug}.html`, html, 'utf-8');
    log(`  → saved ${p.slug}.html (${html.length} chars)`);
  } catch (e) {
    log(`  ERROR on ${p.slug}: ${e.message}`);
  }
  await page.close();
}

await browser.close();
log(`Assets collected: ${assetMap.size}`);

// Uložit assety
let saved = 0;
for (const [url, buf] of assetMap) {
  try {
    let rel;
    if (url.startsWith(WEBLANTIS_CDN)) {
      rel = url.replace(WEBLANTIS_CDN + '/', '');
    } else {
      rel = url.replace(ORIGIN + '/', '');
    }
    // Odstranit query stringy z filename
    const [relPath] = rel.split('?');
    const outFile = path.join(CLONE_DIR, relPath);
    fs.mkdirSync(path.dirname(outFile), { recursive: true });

    if (/\.css(\?|$)/.test(rel)) {
      let css = buf.toString('utf-8');
      css = css.replaceAll(WEBLANTIS_CDN, CLONE_PATH).replaceAll(ORIGIN, CLONE_PATH);
      fs.writeFileSync(outFile, css, 'utf-8');
    } else {
      fs.writeFileSync(outFile, buf);
    }
    saved++;
  } catch {}
}
log(`Saved ${saved} assets`);

// Ověřit ext refs
log('\n=== External URL check ===');
const pages = fs.readdirSync(path.join(CLONE_DIR, 'pages'));
for (const f of pages) {
  const html = fs.readFileSync(path.join(CLONE_DIR, 'pages', f), 'utf-8');
  const extRefs = [...html.matchAll(/(?:src|href|action)="(https?:\/\/(?!localhost)[^"]+)"/g)]
    .map(m => m[1])
    .filter(u => !u.includes('petramechurova.cz') && !u.includes('w3.org') && !u.includes('schema.org'));
  if (extRefs.length > 0) {
    log(`  ${f}: ${extRefs.length} ext refs`);
    [...new Set(extRefs)].slice(0, 5).forEach(u => log(`    - ${u.slice(0, 80)}`));
  } else {
    log(`  ${f}: OK`);
  }
}
log('=== DONE ===');
