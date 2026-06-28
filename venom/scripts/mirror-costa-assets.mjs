/**
 * Mirror costa-coffee.cz — WordPress custom theme
 * FÁZE 1: download all assets via Playwright response interception
 * Run: node scripts/mirror-costa-assets.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright-core';

const SLUG   = 'costa';
const ORIGIN = 'https://www.costa-coffee.cz';
const OUT    = `public/clones/${SLUG}`;

const PAGES = [
  { slug: 'home',     url: '/' },
  { slug: 'nabidka',  url: '/nabidka/' },
  { slug: 'kavarny',  url: '/kavarny/' },
  { slug: 'historie', url: '/historie/' },
];

const assetMap = new Map();

function saveAsset(relUrl, body, ct) {
  const rel = relUrl.split('?')[0];
  const ext = path.extname(rel).toLowerCase();
  const isCss  = ct.includes('css') || ext === '.css';
  const isJs   = ct.includes('javascript') || ext === '.js';
  const isImg  = ct.includes('image') || ['.jpg','.jpeg','.png','.webp','.gif','.svg','.ico'].includes(ext);
  const isFont = ct.includes('font') || ct.includes('woff') || ['.woff','.woff2','.ttf','.otf','.eot'].includes(ext);
  if (!isCss && !isJs && !isImg && !isFont) return;
  if (isJs) {
    const base = path.basename(rel);
    if (base.includes('gtm') || base.includes('analytics') || base.includes('pixel') ||
        base.includes('cookiebot') || base.includes('stats') || base.includes('smartform') ||
        base.includes('packeta') || base.includes('lagardere')) return;
  }
  const dest = `${OUT}${rel}`;
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  if (!fs.existsSync(dest)) fs.writeFileSync(dest, body);
  assetMap.set(ORIGIN + relUrl, `/clones/${SLUG}${rel}`);
  assetMap.set(ORIGIN + rel, `/clones/${SLUG}${rel}`);
}

fs.mkdirSync(`${OUT}/pages`, { recursive: true });

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
    if (!url.startsWith(ORIGIN)) return;
    const ct = resp.headers()['content-type'] || '';
    const rel = url.replace(ORIGIN, '');
    try {
      const body = await resp.body();
      if (body.length < 4) return;
      saveAsset(rel, body, ct);
    } catch {}
  });

  await page.goto(`${ORIGIN}${p.url}`, { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(3000);
  try { await page.click('[id*="cookie"] button, [class*="cookie"] button, button[class*="accept"], #CybotCookiebotDialogBodyButtonAccept', { timeout: 2000 }); } catch {}
  await page.waitForTimeout(1000);

  const html = await page.content();
  fs.writeFileSync(`${OUT}/pages/${p.slug}-raw.html`, html);
  console.log(`  ${p.slug}: ${html.length} bytes | assets: ${assetMap.size}`);
  await page.close();
  await context.close();
}

await browser.close();
console.log(`\nTotal assets: ${assetMap.size}`);

// --- Fix CSS: rewrite absolute URLs ---
function fixCss(content) {
  let css = content;
  for (const [orig, local] of assetMap) css = css.replaceAll(orig, local);
  // Fix root-relative URLs in CSS
  css = css.replace(/url\((['"]?)https?:\/\/(?:www\.)?costa-coffee\.cz(\/[^'")]+)\1\)/gi,
    (_, q, r) => `url(${q}/clones/${SLUG}${r.split('?')[0]}${q})`);
  return css;
}

function walkDir(dir, fn) {
  if (!fs.existsSync(dir)) return;
  for (const f of fs.readdirSync(dir)) {
    const full = path.join(dir, f);
    if (fs.statSync(full).isDirectory()) walkDir(full, fn);
    else fn(full);
  }
}
walkDir(`${OUT}/src`, (fpath) => {
  if (!fpath.endsWith('.css')) return;
  const fixed = fixCss(fs.readFileSync(fpath, 'utf8'));
  fs.writeFileSync(fpath, fixed);
});

// --- LINK_MAP ---
const LINK_MAP = {
  '/':            `/demo/costa-coffee-demo`,
  '/nabidka/':    `/demo/costa-coffee-demo/nabidka`,
  '/nabidka':     `/demo/costa-coffee-demo/nabidka`,
  '/kavarny/':    `/demo/costa-coffee-demo/kavarny`,
  '/kavarny':     `/demo/costa-coffee-demo/kavarny`,
  '/historie/':   `/demo/costa-coffee-demo/historie`,
  '/historie':    `/demo/costa-coffee-demo/historie`,
  '/kontakt/':    `#kontakt`,
  '/kontakt':     `#kontakt`,
  '/club/':       `/demo/costa-coffee-demo`,
  '/kariera/':    `/demo/costa-coffee-demo`,
  '/costa-eko/':  `/demo/costa-coffee-demo`,
  '/coffee-times/': `/demo/costa-coffee-demo`,
  '/costa-express/': `/demo/costa-coffee-demo`,
  '/costa-foundation/': `/demo/costa-coffee-demo`,
};

function processHtml(html) {
  // Rewrite asset URLs
  for (const [orig, local] of assetMap) html = html.replaceAll(orig, local);
  // Strip query params from local clone paths
  html = html.replace(/(\/clones\/costa\/[^"'?#\s]+)\?[^"'>\s]*/g, '$1');

  // Strip tracking
  html = html.replace(/<!-- Google Tag Manager[\s\S]*?<!-- End Google Tag Manager[^\n]*\n?/gi, '');
  html = html.replace(/<script[^>]*(?:googletagmanager|gtag|hotjar|cookiebot|lagardere|smartform|stats\.query)[^>]*>[\s\S]*?<\/script>/gi, '');
  html = html.replace(/<noscript><iframe[^>]*googletagmanager[^>]*><\/iframe><\/noscript>/gi, '');

  // Strip cookie consent
  html = html.replace(/<div[^>]*(?:CybotCookiebot|cookie-consent|cookielaw)[^>]*>[\s\S]{0,8000}?<\/div>/gi, '');
  html = html.replace(/<script[^>]*CookieConsent[^>]*><\/script>/gi, '');

  // Social links → #
  html = html.replace(/href="https?:\/\/(?:www\.)?(?:facebook|instagram|youtube|tiktok|twitter|linkedin)\.com\/[^"]*"/gi, 'href="#"');

  // Internal link rewrites
  for (const [from, to] of Object.entries(LINK_MAP)) {
    html = html.replace(new RegExp(`href="${from.replace(/\//g,'\\/')}"`, 'gi'), `href="${to}"`);
    html = html.replace(new RegExp(`href="${ORIGIN.replace(/\./g,'\\.')}${from.replace(/\//g,'\\/')}(?=["/?#])`, 'g'), `href="${to}`);
  }
  // Remaining costa-coffee.cz links → demo home
  html = html.replace(/href="https?:\/\/(?:www\.)?costa-coffee\.cz\/[^"]*"/gi, `href="/demo/costa-coffee-demo"`);
  html = html.replace(/href="https?:\/\/(?:www\.)?costa-coffee\.cz"/gi, `href="/demo/costa-coffee-demo"`);

  // Brand scrub
  html = html.replace(/Costa Coffee(?!\s*Demo)/g, 'Costa Coffee Demo');
  html = html.replace(/COSTA COFFEE(?!\s*DEMO)/g, 'COSTA COFFEE DEMO');
  html = html.replace(/costa-coffee\.cz/gi, 'demo.local');
  html = html.replace(/\+420\s*\d{3}\s*\d{3}\s*\d{3}/g, '+420 608 288 777');
  html = html.replace(/[a-z0-9._-]+@costa-coffee\.cz/gi, 'info@demo.local');
  html = html.replace(/[a-z0-9._-]+@costacoffee[^"'\s]*/gi, 'info@demo.local');

  // Strip WP admin bar
  html = html.replace(/href="[^"]*wp-(?:admin|login)[^"]*"/gi, 'href="#"');
  html = html.replace(/<link[^>]*wp-json[^>]*>/gi, '');

  // Replace Google Maps iframes with placeholder
  html = html.replace(/<iframe[^>]*(?:google\.com\/maps|maps\.google)[^>]*>[\s\S]*?<\/iframe>/gi,
    '<div style="background:#e0e0e0;height:220px;display:flex;align-items:center;justify-content:center;color:#666;font-size:13px">Mapa pobočky</div>');
  // Google Maps location links → #
  html = html.replace(/href="https?:\/\/(?:www\.)?google\.[a-z]+\/maps\/[^"]*"/gi, 'href="#"');
  html = html.replace(/href="https?:\/\/maps\.(?:app\.goo\.gl|google\.com)[^"]*"/gi, 'href="#"');
  // Strip lagardere privacy policy link
  html = html.replace(/href="https?:\/\/[^"]*lagardere[^"]*"/gi, 'href="#"');
  // Strip query.cz analytics
  html = html.replace(/<script[^>]*query\.cz[^>]*>[\s\S]*?<\/script>/gi, '');

  // Fix root-relative /src/ paths
  html = html.replace(/(?<!")\/src\/(themes|plugins)\//g, `/clones/${SLUG}/src/$1/`);

  return html;
}

console.log('\n--- Processing HTML ---');
for (const p of PAGES) {
  const raw = fs.readFileSync(`${OUT}/pages/${p.slug}-raw.html`, 'utf8');
  const processed = processHtml(raw);
  fs.writeFileSync(`${OUT}/pages/${p.slug}.html`, processed);
  const extLeft = (processed.match(/https?:\/\/(?!(?:demo\.local|schema\.org|w3\.org|og:|fonts\.gstatic\.com))[a-z0-9.-]+\.[a-z]{2,}/gi) || []).length;
  const brandLeft = (processed.match(/costa-coffee\.cz/gi) || []).length;
  console.log(`${p.slug}: ${raw.length}→${processed.length} | ext=${extLeft} brand=${brandLeft}`);
}

console.log('\nMirror done ✅');
