/**
 * Mirror lacasalatina.cz — WordPress + WPBakery + Webox theme (restaurace)
 * FÁZE 1: download all assets via Playwright response interception
 * Run: node scripts/mirror-lacasalatina-assets.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright-core';

const SLUG   = 'lacasalatina';
const ORIGIN = 'https://www.lacasalatina.cz';
const OUT    = `public/clones/${SLUG}`;

const PAGES = [
  { slug: 'home',    url: '/cs/uvod/' },
  { slug: 'o-nas',   url: '/cs/o-nas/' },
  { slug: 'menu',    url: '/cs/la-casa-latina-menu/' },
  { slug: 'galerie', url: '/cs/galerie/' },
];

const cssMap = new Map();
const jsMap  = new Map();
const imgMap = new Map();

function saveAsset(rel, body, ct) {
  const fname = path.basename(rel.split('?')[0]);
  if (!fname || fname.length < 2) return;
  const relClean = rel.split('?')[0];

  if (ct.includes('css') || relClean.endsWith('.css')) {
    const dest = `${OUT}${relClean}`;
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    if (!fs.existsSync(dest)) fs.writeFileSync(dest, body);
    const localUrl = `/clones/${SLUG}${relClean}`;
    cssMap.set(ORIGIN + rel, localUrl);
    cssMap.set(ORIGIN + relClean, localUrl);
  } else if (ct.includes('javascript') || relClean.endsWith('.js')) {
    if (fname.includes('gtm') || fname.includes('analytics') || fname.includes('pixel') ||
        fname.includes('cookiebot') || fname.includes('cookielaw') || fname.includes('gtag')) return;
    const dest = `${OUT}${relClean}`;
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    if (!fs.existsSync(dest)) fs.writeFileSync(dest, body);
    const localUrl = `/clones/${SLUG}${relClean}`;
    jsMap.set(ORIGIN + rel, localUrl);
    jsMap.set(ORIGIN + relClean, localUrl);
  } else if (ct.includes('image') || relClean.match(/\.(jpg|jpeg|png|webp|svg|gif|ico)$/i)) {
    const dest = `${OUT}${relClean}`;
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    if (!fs.existsSync(dest)) fs.writeFileSync(dest, body);
    const localUrl = `/clones/${SLUG}${relClean}`;
    imgMap.set(ORIGIN + rel, localUrl);
    imgMap.set(ORIGIN + relClean, localUrl);
  } else if (ct.includes('font') || ct.includes('woff') || relClean.match(/\.(woff2?|ttf|otf|eot)$/i)) {
    const dest = `${OUT}${relClean}`;
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    if (!fs.existsSync(dest)) fs.writeFileSync(dest, body);
  }
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

  await page.goto(`${ORIGIN}${p.url}`, { waitUntil: 'networkidle', timeout: 45000 });
  await page.waitForTimeout(2000);
  // Dismiss any popups
  try { await page.click('.sgpb-popup-close-button, .popmake-close, [class*="cookie"][class*="accept"]', { timeout: 2000 }); } catch {}
  await page.waitForTimeout(1000);

  const html = await page.content();
  fs.writeFileSync(`${OUT}/pages/${p.slug}-raw.html`, html);
  console.log(`  ${p.slug}: ${html.length} bytes | css:${cssMap.size} img:${imgMap.size} js:${jsMap.size}`);
  await page.close();
  await context.close();
}

await browser.close();
console.log(`\nTotal: css=${cssMap.size} js=${jsMap.size} img=${imgMap.size}`);

// --- Fix CSS files: rewrite absolute URLs ---
function fixCss(content) {
  let css = content;
  css = css.replace(/url\((['"]?)https?:\/\/(?:www\.)?lacasalatina\.cz(\/[^'")]+)\1\)/gi,
    (_, q, r) => `url(${q}/clones/${SLUG}${r.split('?')[0]}${q})`);
  for (const [orig, local] of [...cssMap, ...imgMap]) css = css.replaceAll(orig, local);
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

walkDir(`${OUT}/wp-content`, (fpath) => {
  if (!fpath.endsWith('.css')) return;
  const fixed = fixCss(fs.readFileSync(fpath, 'utf8'));
  fs.writeFileSync(fpath, fixed);
});

// --- Build processed HTML ---
const LINK_MAP = {
  '/':                          `/demo/lacasa-latina-demo`,
  '/cs/uvod/':                  `/demo/lacasa-latina-demo`,
  '/cs/uvod':                   `/demo/lacasa-latina-demo`,
  '/cs/o-nas/':                 `/demo/lacasa-latina-demo/o-nas`,
  '/cs/o-nas':                  `/demo/lacasa-latina-demo/o-nas`,
  '/cs/la-casa-latina-menu/':   `/demo/lacasa-latina-demo/menu`,
  '/cs/la-casa-latina-menu':    `/demo/lacasa-latina-demo/menu`,
  '/cs/galerie/':               `/demo/lacasa-latina-demo/galerie`,
  '/cs/galerie':                `/demo/lacasa-latina-demo/galerie`,
  '/cs/rezervace/':             `#rezervace`,
  '/cs/rezervace':              `#rezervace`,
  '/cs/kontakt/':               `#kontakt`,
  '/cs/kontakt':                `#kontakt`,
  '/cs/events/':                `/demo/lacasa-latina-demo`,
  '/cs/novinky/':               `/demo/lacasa-latina-demo`,
  '/cs/vouchery/':              `#rezervace`,
  '/cs/churrasco-rodizio/':     `/demo/lacasa-latina-demo/menu`,
};

function processHtml(html) {
  // Rewrite asset URLs
  for (const [orig, local] of [...cssMap, ...jsMap, ...imgMap]) html = html.replaceAll(orig, local);
  html = html.replaceAll(ORIGIN, '');

  // Strip tracking scripts
  html = html.replace(/<!-- Google Tag Manager[\s\S]*?<!-- End Google Tag Manager[^\n]*\n?/gi, '');
  html = html.replace(/<script[^>]*(?:googletagmanager|gtag|hotjar|cookiebot|cookielaw|cmplz|cookieblocker)[^>]*>[\s\S]*?<\/script>/gi, '');
  html = html.replace(/<noscript>[^<]*(?:googletagmanager|gtm)[^<]*<\/noscript>/gi, '');

  // Strip cookie consent banners
  html = html.replace(/<div[^>]*(?:cookie-notice|cn-notice|cmplz-|cli-bar|cookieconsent|cookielaw)[^>]*>[\s\S]{0,5000}?<\/div>/gi, '');

  // Strip popups (popup-builder)
  html = html.replace(/<div[^>]*sgpb-popup-builder[^>]*>[\s\S]*?<\/div>/gi, '');
  html = html.replace(/<div[^>]*id="sgpb-popup[^"]*"[^>]*>[\s\S]*?<\/div>/gi, '');

  // Social links → #
  html = html.replace(/href="https?:\/\/(?:www\.)?(?:facebook|instagram|youtube|tiktok|twitter|linkedin)\.com\/[^"]*"/gi, 'href="#"');

  // English version → demo home
  html = html.replace(/href="https?:\/\/(?:www\.)?lacasalatina\.cz\/en\/[^"]*"/gi, `href="/demo/lacasa-latina-demo"`);
  html = html.replace(/href="\/en\/[^"]*"/gi, 'href="#"');

  // RSS feed
  html = html.replace(/<link[^>]*rel="alternate"[^>]*type="application\/rss\+xml"[^>]*>/gi, '');
  html = html.replace(/<link[^>]*wp-json[^>]*>/gi, '');

  // Strip wp-admin / wp-login references
  html = html.replace(/href="[^"]*wp-(?:admin|login)[^"]*"/gi, 'href="#"');

  // Internal link rewrites
  for (const [from, to] of Object.entries(LINK_MAP)) {
    html = html.replace(new RegExp(`href="${from.replace(/\//g,'\\/')}"`, 'gi'), `href="${to}"`);
  }
  // Remaining absolute lacasalatina.cz internal links → demo home
  html = html.replace(/href="https?:\/\/(?:www\.)?lacasalatina\.cz\/[^"]*"/gi, `href="/demo/lacasa-latina-demo"`);
  html = html.replace(/href="https?:\/\/(?:www\.)?lacasalatina\.cz"/gi, `href="/demo/lacasa-latina-demo"`);

  // Brand scrub
  html = html.replace(/La Casa Latina(?!\s*Demo)/g, 'La Casa Latina Demo');
  html = html.replace(/LA CASA LATINA(?!\s*DEMO)/g, 'LA CASA LATINA DEMO');
  html = html.replace(/lacasalatina\.cz/gi, 'demo.local');
  html = html.replace(/\+420\s*\d{3}\s*\d{3}\s*\d{3}/g, '+420 608 288 777');
  html = html.replace(/[a-z0-9._-]+@lacasalatina\.cz/gi, 'info@demo.local');
  html = html.replace(/[a-z0-9._-]+@lacasaargentina\.cz/gi, 'info@demo.local');

  // Fix root-relative WP paths (after asset map replacement, some may remain)
  html = html.replace(/(?<!\/clones\/lacasalatina)\/wp-content\//g, `/clones/${SLUG}/wp-content/`);
  html = html.replace(/(?<!\/clones\/lacasalatina)\/wp-includes\//g, `/clones/${SLUG}/wp-includes/`);

  return html;
}

console.log('\n--- Processing HTML ---');
for (const p of PAGES) {
  const raw = fs.readFileSync(`${OUT}/pages/${p.slug}-raw.html`, 'utf8');
  const processed = processHtml(raw);
  fs.writeFileSync(`${OUT}/pages/${p.slug}.html`, processed);
  const extLeft = (processed.match(/https?:\/\/(?!(?:demo\.local|schema\.org|w3\.org))[a-z0-9.-]+\.[a-z]{2,}/gi) || []).length;
  const brandLeft = (processed.match(/lacasalatina\.cz/gi) || []).length;
  console.log(`${p.slug}: ${raw.length}→${processed.length} | ext=${extLeft} brand=${brandLeft}`);
}

console.log('\nMirror done ✅');
console.log(`Assets in: ${OUT}/wp-content/`);
