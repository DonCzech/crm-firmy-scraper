/**
 * FÁZE 1 — Mirror assets z hairsalon-no1.cz → public/clones/hairsalon-no1/
 * WordPress + Flatsome theme
 *
 * Spustit: node scripts/mirror-hairsalon-no1-assets.mjs
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pwPkg from '/Users/apple/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core/index.js';
const { chromium } = pwPkg;

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const SLUG = 'hairsalon-no1';
const ORIGIN = 'https://hairsalon-no1.cz';
const CLONE_DIR = path.join(ROOT, `public/clones/${SLUG}`);
const CLONE_PATH = `/clones/${SLUG}`;

const PAGES = [
  { slug: 'home', url: '/cs/domu/' },
  { slug: 'salon', url: '/cs/salon/' },
  { slug: 'tym', url: '/cs/tym/' },
  { slug: 'galerie', url: '/cs/galerie/' },
  { slug: 'kariera', url: '/cs/kariera/' },
];

// Adresáře
for (const d of ['pages', 'css', 'js', 'img', 'fonts', 'wp-content/themes/flatsome/assets/css', 'wp-content/themes/flatsome/assets/js', 'wp-content/uploads']) {
  fs.mkdirSync(path.join(CLONE_DIR, d), { recursive: true });
}

function log(msg) { console.log(`[${new Date().toISOString().slice(11,19)}] ${msg}`); }

function localPath(url) {
  // Převede URL na lokální cestu v CLONE_DIR
  const u = url.replace(ORIGIN, '').replace(/^\//, '');
  return path.join(CLONE_DIR, u);
}

function rewriteHtml(html) {
  return html
    // Smazat tracking
    .replace(/<script[^>]*(googletagmanager|google-analytics|gtag|hotjar|smartlook|facebook\.net|cdn\.cookielaw|complianz|trustindex)[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<script[^>]*(googletagmanager|google-analytics|gtag|hotjar|smartlook|facebook\.net|cdn\.cookielaw|complianz)[^>]*\/>/gi, '')
    // Smazat Trustindex widget (Google recenze)
    .replace(/<div[^>]*data-[^>]*trustindex[^>]*>[\s\S]*?<\/div>/gi, '')
    .replace(/<script[^>]*trustindex[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<script[^>]*trustindex[^>]*\/>/gi, '')
    // Smazat Mystoodio booking iframe/script
    .replace(/<script[^>]*mystoodio[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<iframe[^>]*mystoodio[^>]*>[\s\S]*?<\/iframe>/gi, '')
    // Smazat emoji script
    .replace(/<script[^>]*emoji[^>]*>[\s\S]*?<\/script>/gi, '')
    // Smazat Yoast komentáře
    .replace(/<!--\s*This site is optimized with the Yoast SEO[\s\S]*?Yoast SEO plugin\. -->/gi, '')
    // Smazat generator meta
    .replace(/<meta[^>]*name=["']generator["'][^>]*>/gi, '')
    // Smazat en variantu (jazykový switcher)
    .replace(/<link[^>]*rel=["']alternate["'][^>]*hreflang=["']en["'][^>]*>/gi, '')
    // Rewrite URLs
    .replaceAll(ORIGIN, CLONE_PATH)
    .replaceAll('http://hairsalonno1.cz', CLONE_PATH)
    // Smazat xmlrpc, wp-json links
    .replace(/<link[^>]*(xmlrpc|wp-json|wp\.me)[^>]*>/gi, '')
    // Deaktivovat Complianz GDPR banner
    .replace(/<link[^>]*complianz[^>]*>/gi, '')
    .replace(/<script[^>]*complianz[^>]*>[\s\S]*?<\/script>/gi, '');
}

function rewriteCss(css, cssUrl) {
  // Přepsat url() v CSS souborech
  return css
    .replaceAll(ORIGIN, CLONE_PATH)
    .replaceAll('http://hairsalonno1.cz', CLONE_PATH)
    .replace(/url\(['"]?(https?:\/\/fonts\.googleapis\.com[^'")]+)['"]?\)/gi, 'url("")')
    .replace(/url\(['"]?(https?:\/\/fonts\.gstatic\.com[^'")]+)['"]?\)/gi, 'url("")')
    .replace(/url\(['"]?(https?:\/\/cdn\.trustindex[^'")]+)['"]?\)/gi, 'url("")')
    .replace(/@import\s+url\(['"]?https?:\/\/fonts\.[^'"]+['"]?\)/gi, '');
}

const browser = await chromium.launch({
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
});

const context = await browser.newContext({
  userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
  locale: 'cs-CZ',
  extraHTTPHeaders: { 'Accept-Language': 'cs,en;q=0.9' },
});

// Sbírat všechny assety
const assetMap = new Map(); // url → buffer

context.on('response', async (resp) => {
  const url = resp.url();
  if (assetMap.has(url)) return;
  // Zachytit jen z hairsalon-no1.cz (ne ext CDN)
  if (!url.startsWith(ORIGIN) && !url.startsWith('http://hairsalonno1.cz')) return;
  const ct = resp.headers()['content-type'] || '';
  if (!/(css|javascript|image|font|woff|octet|svg|video|mp4|webm)/.test(ct)) return;
  try {
    const buf = await resp.body();
    assetMap.set(url, buf);
  } catch {}
});

for (const p of PAGES) {
  log(`Scraping ${p.slug} (${p.url})...`);
  const page = await context.newPage();
  try {
    await page.goto(ORIGIN + p.url, { waitUntil: 'networkidle', timeout: 30000 });
    // Scroll pro lazy images
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(2000);
    await page.evaluate(() => window.scrollTo(0, 0));

    let html = await page.content();
    html = rewriteHtml(html);

    const outPath = path.join(CLONE_DIR, 'pages', `${p.slug}.html`);
    fs.writeFileSync(outPath, html, 'utf-8');
    // Taky uložit jako /tmp pro seed script
    fs.writeFileSync(`/tmp/hairsalon-no1-${p.slug}.html`, html, 'utf-8');
    log(`  → saved ${outPath} (${html.length} chars)`);
  } catch (e) {
    log(`  ERROR: ${e.message}`);
  }
  await page.close();
}

await browser.close();
log(`Assets collected: ${assetMap.size}`);

// Uložit assety
let saved = 0;
for (const [url, buf] of assetMap) {
  try {
    const rel = url.startsWith(ORIGIN)
      ? url.replace(ORIGIN + '/', '')
      : url.replace('http://hairsalonno1.cz/', '');
    const outFile = path.join(CLONE_DIR, rel);
    fs.mkdirSync(path.dirname(outFile), { recursive: true });

    // Rewrite CSS
    if (/\.css(\?.*)?$/.test(rel)) {
      let css = buf.toString('utf-8');
      css = rewriteCss(css, url);
      fs.writeFileSync(outFile, css, 'utf-8');
    } else {
      fs.writeFileSync(outFile, buf);
    }
    saved++;
  } catch (e) {
    log(`  skip asset ${url.slice(0, 80)}: ${e.message}`);
  }
}
log(`Saved ${saved} assets to public/clones/${SLUG}/`);

// Ověřit ext refs v HTML
log('\n=== Verifikace externích URL v pages/ ===');
const pages = fs.readdirSync(path.join(CLONE_DIR, 'pages'));
for (const f of pages) {
  const html = fs.readFileSync(path.join(CLONE_DIR, 'pages', f), 'utf-8');
  const extRefs = [...html.matchAll(/(?:src|href|action)=["'](https?:\/\/(?!localhost)[^"']+)["']/g)]
    .map(m => m[1])
    .filter(u => !u.includes('hairsalon-no1.cz') && !u.includes('hairsalonno1.cz') && !u.includes('w3.org') && !u.includes('schema.org'));
  if (extRefs.length) {
    log(`  ${f}: ${extRefs.length} ext refs`);
    extRefs.slice(0, 5).forEach(u => log(`    - ${u.slice(0, 80)}`));
  } else {
    log(`  ${f}: OK (0 ext refs)`);
  }
}
log('=== DONE ===');
