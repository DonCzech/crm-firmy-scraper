/**
 * Mirror fyziovsem.cz — WordPress + OceanWP + Elementor Pro
 * FÁZE 1: download all assets via Playwright response interception
 * Run: node scripts/mirror-fyziovsem-assets.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright-core';

const SLUG   = 'fyziovsem';
const ORIGIN = 'https://fyziovsem.cz';
const OUT    = `public/clones/${SLUG}`;

const PAGES = [
  { slug: 'home',   url: '/' },
  { slug: 'o-nas',  url: '/o-nas/' },
  { slug: 'sluzby', url: '/sluzby/' },
  { slug: 'cenik',  url: '/cenik/' },
];

// Flat maps: original URL → local path
const cssMap = new Map();
const jsMap  = new Map();
const imgMap = new Map();

function saveAsset(rel, body, ct) {
  const fname = path.basename(rel.split('?')[0]);
  if (!fname || fname.length < 2) return;

  const relClean = rel.split('?')[0];

  if (ct.includes('css') || relClean.endsWith('.css')) {
    // Strip Complianz/cookie blocker CSS
    if (relClean.includes('complianz') || relClean.includes('cookieblocker') ||
        relClean.includes('cmplz') || relClean.includes('banner-{banner_id}')) return;

    const dest = `${OUT}${relClean}`;
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    if (!fs.existsSync(dest)) fs.writeFileSync(dest, body);
    const localUrl = `/clones/${SLUG}${relClean}`;
    cssMap.set(ORIGIN + rel, localUrl);
    cssMap.set(ORIGIN + relClean, localUrl);

  } else if (ct.includes('javascript') || relClean.endsWith('.js')) {
    // Strip tracking + Complianz JS
    if (fname.includes('gtm') || fname.includes('analytics') || fname.includes('pixel') ||
        fname.includes('complianz') || fname.includes('cookieblocker') || fname.includes('cmplz')) return;

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
    // Fonts are referenced via relative paths in CSS — no map entry needed
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
  // Accept/dismiss cookie banner so it doesn't block content
  try {
    await page.click('.cmplz-deny, .cmplz-dismiss, .cmplz-close, [class*="cmplz-deny"]', { timeout: 2000 });
  } catch {}
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
  // Rewrite absolute https://fyziovsem.cz/ URL references
  css = css.replace(/url\((['"]?)https?:\/\/(?:www\.)?fyziovsem\.cz(\/[^'")]+)\1\)/gi,
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

// --- Build processed HTML for each page ---
const LINK_MAP = {
  '/':        `/demo/fyziovsem-demo`,
  '/o-nas/':  `/demo/fyziovsem-demo/o-nas`,
  '/sluzby/': `/demo/fyziovsem-demo/sluzby`,
  '/cenik/':  `/demo/fyziovsem-demo/cenik`,
};

function processHtml(html) {
  // Rewrite asset URLs
  for (const [orig, local] of [...cssMap, ...jsMap, ...imgMap]) html = html.replaceAll(orig, local);
  html = html.replaceAll(ORIGIN, '');

  // Strip tracking scripts
  html = html.replace(/<script[^>]*(?:googletagmanager|gtag|hotjar|complianz|cmplz|cookiebot|cookieblocker)[^>]*>[\s\S]*?<\/script>/gi, '');
  html = html.replace(/<noscript>[^<]*(?:googletagmanager|gtm)[^<]*<\/noscript>/gi, '');
  // Strip Complianz CSS
  html = html.replace(/<link[^>]*(?:complianz|cookieblocker|cmplz|banner-\{banner_id\})[^>]*>/gi, '');
  // Strip Complianz cookie banner div
  for (const cls of ['cmplz-', 'cc-nb', 'cookie-notice', 'cn-notice']) {
    const re = new RegExp(`<div[^>]*${cls}[^>]*>[\\s\\S]{0,8000}?<\\/div>`, 'gi');
    html = html.replace(re, '');
  }
  // Strip social links
  html = html.replace(/href="https?:\/\/(?:www\.)?(?:facebook|instagram|youtube|tiktok|twitter)\.com\/[^"]*"/gi, 'href="#"');

  // Strip wp-json API links from head
  html = html.replace(/<link[^>]*wp-json[^>]*>/gi, '');

  // Rewrite internal links
  for (const [from, to] of Object.entries(LINK_MAP)) {
    html = html.replace(new RegExp(`href="${ORIGIN}${from.replace(/\//g,'\\/')}"`, 'gi'), `href="${to}"`);
    html = html.replace(new RegExp(`href="${from.replace(/\//g,'\\/')}"`, 'g'), `href="${to}"`);
  }
  // Remaining fyziovsem.cz internal links → demo home
  html = html.replace(/href="https?:\/\/(?:www\.)?fyziovsem\.cz\/[^"]*"/gi, `href="/demo/fyziovsem-demo"`);

  // Brand scrub
  html = html.replace(/Fyzio Všem(?!\s*Demo)/g, 'Fyzio Všem Demo');
  html = html.replace(/fyziovsem\.cz/gi, 'demo.local');
  html = html.replace(/\+420\s*\d{3}\s*\d{3}\s*\d{3}/g, '+420 608 288 777');
  html = html.replace(/[a-z.]+@fyziovsem\.cz/gi, 'info@demo.local');

  // Fix root-relative WP paths
  html = html.replace(/(?<!\/clones\/fyziovsem)\/wp-content\//g, '/clones/fyziovsem/wp-content/');
  html = html.replace(/(?<!\/clones\/fyziovsem)\/wp-includes\//g, '/clones/fyziovsem/wp-includes/');

  return html;
}

console.log('\n--- Processing HTML ---');
for (const p of PAGES) {
  const raw = fs.readFileSync(`${OUT}/pages/${p.slug}-raw.html`, 'utf8');
  const processed = processHtml(raw);
  fs.writeFileSync(`${OUT}/pages/${p.slug}.html`, processed);
  const extLeft = (processed.match(/https?:\/\/(?!(?:demo\.local|schema\.org|w3\.org))[a-z0-9.-]+\.[a-z]{2,}/gi) || []).length;
  const brandLeft = (processed.match(/fyziovsem\.cz/gi) || []).length;
  console.log(`${p.slug}: ${raw.length}→${processed.length} | ext=${extLeft} brand=${brandLeft}`);
}

console.log('\nMirror done ✅');
console.log(`Assets in: ${OUT}/wp-content/`);
