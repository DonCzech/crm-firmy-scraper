/**
 * Mirror coffeeroom.cz — Webflow CMS
 * Run: node scripts/mirror-coffeeroom-assets.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright-core';

const SLUG   = 'coffeeroom';
const ORIGIN = 'https://www.coffeeroom.cz';
const CDN    = 'https://cdn.prod.website-files.com';
const OUT    = `public/clones/${SLUG}`;

const PAGES = [
  { slug: 'home',      url: '/' },
  { slug: 'coffeebar', url: '/coffeebar' },
  { slug: 'contact',   url: '/contact' },
  { slug: 'products',  url: '/products' },
];

const assetMap = new Map();

function cdnLocal(url) {
  try {
    const parsed = new URL(url);
    if (parsed.hostname !== new URL(CDN).hostname) return null;
    const rel = parsed.pathname.split('?')[0];
    return { dest: `${OUT}/cdn${rel}`, local: `/clones/${SLUG}/cdn${rel}` };
  } catch { return null; }
}

function originLocal(url) {
  try {
    const parsed = new URL(url);
    if (parsed.hostname !== new URL(ORIGIN).hostname) return null;
    const rel = parsed.pathname.split('?')[0];
    return { dest: `${OUT}${rel}`, local: `/clones/${SLUG}${rel}` };
  } catch { return null; }
}

fs.mkdirSync(`${OUT}/pages`, { recursive: true });
fs.mkdirSync(`${OUT}/cdn`, { recursive: true });

const browser = await chromium.launch({
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  args: ['--no-sandbox'],
});

for (const p of PAGES) {
  console.log(`\n=== ${p.slug} ===`);
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    locale: 'cs-CZ',
  });
  const page = await context.newPage();

  page.on('response', async (resp) => {
    const url = resp.url();
    const ct = resp.headers()['content-type'] || '';
    try {
      const info = cdnLocal(url) || originLocal(url);
      if (!info) return;
      const ext = path.extname(info.dest).toLowerCase();
      const isCss  = ct.includes('css') || ext === '.css';
      const isJs   = ct.includes('javascript') || ext === '.js';
      const isImg  = ct.includes('image') || ['.jpg','.jpeg','.png','.webp','.gif','.svg','.ico','.avif'].includes(ext);
      const isFont = ct.includes('font') || ['.woff','.woff2','.ttf','.otf','.eot'].includes(ext);
      if (!isCss && !isJs && !isImg && !isFont) return;
      // Skip tracking JS
      if (isJs && /gtm|analytics|pixel|hotjar|cookiebot|webfont\/1\.6/.test(path.basename(info.dest))) return;

      if (!fs.existsSync(info.dest)) {
        const body = await resp.body();
        if (body.length < 4) return;
        fs.mkdirSync(path.dirname(info.dest), { recursive: true });
        fs.writeFileSync(info.dest, body);
      }
      assetMap.set(url, info.local);
      assetMap.set(url.split('?')[0], info.local);
    } catch {}
  });

  await page.goto(`${ORIGIN}${p.url}`, { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(3000);
  try { await page.click('[class*="cookie"] button, [id*="cookie"] button, button[class*="accept"]', { timeout: 2000 }); } catch {}
  await page.waitForTimeout(1000);

  const html = await page.content();
  fs.writeFileSync(`${OUT}/pages/${p.slug}-raw.html`, html);
  console.log(`  ${p.slug}: ${html.length} bytes | assets: ${assetMap.size}`);
  await page.close();
  await context.close();
}

await browser.close();
console.log(`\nTotal assets: ${assetMap.size}`);

// Fix CSS files for asset references
function fixCss(content) {
  let css = content;
  for (const [orig, local] of assetMap) css = css.replaceAll(orig, local);
  // Fix root-relative paths
  css = css.replace(/url\((['"]?)\/(67cc82[a-z0-9]+\/)/g, 'url($1/clones/coffeeroom/cdn/$2');
  return css;
}

function walk(dir, fn) {
  if (!fs.existsSync(dir)) return;
  for (const f of fs.readdirSync(dir)) {
    const full = path.join(dir, f);
    if (fs.statSync(full).isDirectory()) walk(full, fn);
    else fn(full);
  }
}
walk(`${OUT}/cdn`, (fp) => {
  if (!fp.endsWith('.css')) return;
  fs.writeFileSync(fp, fixCss(fs.readFileSync(fp, 'utf8')));
});

// LINK_MAP
const LINK_MAP = {
  '/':         `/demo/coffee-room-demo`,
  '/coffeebar': `/demo/coffee-room-demo/coffeebar`,
  '/contact':  `/demo/coffee-room-demo/contact`,
  '/products': `/demo/coffee-room-demo/products`,
  '/checkout': `#`,
  '/gdpr':     `#`,
  '/policies': `#`,
  '/terms-and-conditions': `#`,
};

function processHtml(html) {
  for (const [orig, local] of assetMap) html = html.replaceAll(orig, local);
  html = html.replace(/(\/clones\/coffeeroom\/[^"'?#\s]+)\?[^"'>\s]*/g, '$1');

  // Strip tracking
  html = html.replace(/<script[^>]*(?:googletagmanager|gtag|hotjar|analytics)[^>]*>[\s\S]*?<\/script>/gi, '');
  html = html.replace(/<noscript><iframe[^>]*googletagmanager[^>]*><\/iframe><\/noscript>/gi, '');

  // Strip cookie consent banners
  html = html.replace(/<div[^>]*(?:cookie-banner|cookie-consent|gdpr-banner)[^>]*>[\s\S]{0,3000}?<\/div>/gi, '');

  // Social → #
  html = html.replace(/href="https?:\/\/(?:www\.)?(?:facebook|instagram|youtube|tiktok|twitter|linkedin)\.com\/[^"]*"/gi, 'href="#"');

  // Internal link rewrites
  for (const [from, to] of Object.entries(LINK_MAP)) {
    html = html.replace(new RegExp(`href="${from.replace(/\//g,'\\/')}"`, 'gi'), `href="${to}"`);
    html = html.replace(new RegExp(`href="${ORIGIN.replace(/\./g,'\\.')}${from.replace(/\//g,'\\/')}(?=["/?#])`, 'g'), `href="${to}`);
  }
  // Remaining coffeeroom.cz links → demo home
  html = html.replace(/href="https?:\/\/(?:www\.)?coffeeroom\.cz\/[^"]*"/gi, `href="/demo/coffee-room-demo"`);
  html = html.replace(/href="https?:\/\/(?:www\.)?coffeeroom\.cz"/gi, `href="/demo/coffee-room-demo"`);

  // Brand scrub
  html = html.replace(/Coffee Room(?!\s*Demo)/g, 'Coffee Room Demo');
  html = html.replace(/COFFEE ROOM(?!\s*DEMO)/g, 'COFFEE ROOM DEMO');
  html = html.replace(/coffeeroom\.cz/gi, 'demo.local');
  html = html.replace(/\+420\s*\d{3}\s*\d{3}\s*\d{3}/g, '+420 608 288 777');
  html = html.replace(/[a-z0-9._-]+@coffeeroom\.cz/gi, 'info@demo.local');

  // Strip Webflow webforms action (would fail anyway)
  html = html.replace(/action="https?:\/\/[^"]*webflow[^"]*"/gi, 'action="#"');

  return html;
}

console.log('\n--- Processing HTML ---');
for (const p of PAGES) {
  const raw = fs.readFileSync(`${OUT}/pages/${p.slug}-raw.html`, 'utf8');
  const processed = processHtml(raw);
  fs.writeFileSync(`${OUT}/pages/${p.slug}.html`, processed);
  const extLeft = (processed.match(/https?:\/\/(?!(?:demo\.local|schema\.org|w3\.org|og:|fonts\.gstatic\.com))[a-z0-9.-]+\.[a-z]{2,}/gi) || []).length;
  const brandLeft = (processed.match(/coffeeroom\.cz/gi) || []).length;
  console.log(`${p.slug}: ${raw.length}→${processed.length} | ext=${extLeft} brand=${brandLeft}`);
}

console.log('\nMirror done ✅');
