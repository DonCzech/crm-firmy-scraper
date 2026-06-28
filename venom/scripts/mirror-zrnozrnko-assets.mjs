/**
 * Mirror zrnozrnko.cz — Webnode 2 CMS (pekárna & kavárna)
 * FÁZE 1: download all assets via Playwright response interception
 * Run: node scripts/mirror-zrnozrnko-assets.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright-core';

const SLUG   = 'zrnozrnko';
const ORIGIN = 'https://www.zrnozrnko.cz';
const CDN1   = 'https://duyn491kcolsw.cloudfront.net';
const CDN2   = 'https://a7e487cbdc.clvaw-cdnwnd.com';
const OUT    = `public/clones/${SLUG}`;

const PAGES = [
  { slug: 'home',    url: '/' },
  { slug: 'o-nas',   url: '/o-nas/' },
  { slug: 'pekarna', url: '/pekarna/' },
  { slug: 'kava',    url: '/kava/' },
];

const cssMap = new Map();
const jsMap  = new Map();
const imgMap = new Map();

function cdnLocalPath(url) {
  try {
    const parsed = new URL(url);
    const rel = parsed.pathname.split('?')[0];
    if (parsed.hostname === new URL(CDN1).hostname) {
      return { dest: `${OUT}/cdn1${rel}`, local: `/clones/${SLUG}/cdn1${rel}` };
    }
    if (parsed.hostname === new URL(CDN2).hostname) {
      return { dest: `${OUT}/cdn2${rel}`, local: `/clones/${SLUG}/cdn2${rel}` };
    }
    return null;
  } catch { return null; }
}

fs.mkdirSync(`${OUT}/pages`, { recursive: true });
fs.mkdirSync(`${OUT}/cdn1`, { recursive: true });
fs.mkdirSync(`${OUT}/cdn2`, { recursive: true });

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
      const isCdn1 = url.startsWith(CDN1);
      const isCdn2 = url.startsWith(CDN2);
      if (!isCdn1 && !isCdn2) return;

      const info = cdnLocalPath(url);
      if (!info) return;

      const ext = path.extname(info.dest.split('?')[0]).toLowerCase();
      const isCss  = ct.includes('css') || ext === '.css';
      const isJs   = ct.includes('javascript') || ext === '.js';
      const isImg  = ct.includes('image') || ['.jpg','.jpeg','.png','.webp','.gif','.svg','.ico'].includes(ext);
      const isFont = ct.includes('font') || ct.includes('woff') || ['.woff','.woff2','.ttf','.otf','.eot'].includes(ext);

      if (!isCss && !isJs && !isImg && !isFont) return;

      if (!fs.existsSync(info.dest)) {
        const body = await resp.body();
        if (body.length < 4) return;
        fs.mkdirSync(path.dirname(info.dest), { recursive: true });
        fs.writeFileSync(info.dest, body);
      }

      const urlNoQ = url.split('?')[0];
      if (isCss)  { cssMap.set(url, info.local); cssMap.set(urlNoQ, info.local); }
      if (isJs)   { jsMap.set(url, info.local);  jsMap.set(urlNoQ, info.local);  }
      if (isImg)  { imgMap.set(url, info.local); imgMap.set(urlNoQ, info.local); }
    } catch {}
  });

  await page.goto(`${ORIGIN}${p.url}`, { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(3000);
  // Close cookie banners
  try { await page.click('[class*="consent"] button, [class*="cookie"] button, button[class*="accept"]', { timeout: 2000 }); } catch {}
  await page.waitForTimeout(1000);

  const html = await page.content();
  fs.writeFileSync(`${OUT}/pages/${p.slug}-raw.html`, html);
  console.log(`  ${p.slug}: ${html.length} bytes | css:${cssMap.size} js:${jsMap.size} img:${imgMap.size}`);
  await page.close();
  await context.close();
}

await browser.close();
console.log(`\nTotal: css=${cssMap.size} js=${jsMap.size} img=${imgMap.size}`);

// --- Fix CSS: rewrite CDN URLs to local ---
function fixCss(content) {
  let css = content;
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

walkDir(`${OUT}/cdn1`, (fpath) => {
  if (!fpath.endsWith('.css')) return;
  const fixed = fixCss(fs.readFileSync(fpath, 'utf8'));
  fs.writeFileSync(fpath, fixed);
});

// --- LINK_MAP ---
const LINK_MAP = {
  '/':         `/demo/zrno-zrnko-demo`,
  '/o-nas/':   `/demo/zrno-zrnko-demo/o-nas`,
  '/o-nas':    `/demo/zrno-zrnko-demo/o-nas`,
  '/pekarna/': `/demo/zrno-zrnko-demo/pekarna`,
  '/pekarna':  `/demo/zrno-zrnko-demo/pekarna`,
  '/kava/':    `/demo/zrno-zrnko-demo/kava`,
  '/kava':     `/demo/zrno-zrnko-demo/kava`,
  '/pobocky/': `/demo/zrno-zrnko-demo`,
  '/nakup/':   `#nakup`,
  '/merch/':   `#nakup`,
  '/brunch/':  `/demo/zrno-zrnko-demo/pekarna`,
  '/akce/':    `/demo/zrno-zrnko-demo`,
  '/dodavame/': `/demo/zrno-zrnko-demo`,
  '/pomahame/': `/demo/zrno-zrnko-demo`,
  '/prodejny/': `/demo/zrno-zrnko-demo`,
  '/nusle/':   `/demo/zrno-zrnko-demo`,
};

function processHtml(html) {
  // Rewrite CDN asset URLs
  for (const [orig, local] of [...cssMap, ...jsMap, ...imgMap]) html = html.replaceAll(orig, local);
  // Strip query params from local clone paths
  html = html.replace(/(\/clones\/zrnozrnko\/[^"'?#\s]+)\?[^"'>\s]*/g, '$1');

  // Strip tracking
  html = html.replace(/<!-- Google Tag Manager[\s\S]*?<!-- End Google Tag Manager[^\n]*\n?/gi, '');
  html = html.replace(/<script[^>]*(?:googletagmanager|gtag|hotjar|analytics|mcjs)[^>]*>[\s\S]*?<\/script>/gi, '');
  html = html.replace(/<noscript><iframe[^>]*googletagmanager[^>]*><\/iframe><\/noscript>/gi, '');
  html = html.replace(/<script[^>]*chimpstatic\.com[^>]*>[\s\S]*?<\/script>/gi, '');

  // Strip cookie consent
  html = html.replace(/<div[^>]*(?:cookie|consent|gdpr)[^>]*>[\s\S]{0,3000}?<\/div>\s*(?=<div|<\/)/gi, '');

  // Social links → #
  html = html.replace(/href="https?:\/\/(?:www\.)?(?:facebook|instagram|youtube|twitter|tiktok|linkedin|open\.spotify)\.com\/[^"]*"/gi, 'href="#"');

  // Internal link rewrites
  for (const [from, to] of Object.entries(LINK_MAP)) {
    html = html.replace(new RegExp(`href="${from.replace(/\//g,'\\/')}"`, 'gi'), `href="${to}"`);
    html = html.replace(new RegExp(`href="${ORIGIN.replace(/\./g,'\\.')}${from.replace(/\//g,'\\/')}(?=["/?#])`, 'g'), `href="${to}`);
  }
  // Remaining zrnozrnko.cz links → demo home
  html = html.replace(/href="https?:\/\/(?:www\.)?zrnozrnko\.cz\/[^"]*"/gi, `href="/demo/zrno-zrnko-demo"`);
  html = html.replace(/href="https?:\/\/(?:www\.)?zrnozrnko\.cz"/gi, `href="/demo/zrno-zrnko-demo"`);

  // Brand scrub
  html = html.replace(/Zrno\s+zrnko(?!\s*Demo)/gi, 'Zrno Zrnko Demo');
  html = html.replace(/ZRNO\s+ZRNKO(?!\s*DEMO)/gi, 'ZRNO ZRNKO DEMO');
  html = html.replace(/zrnozrnko\.cz/gi, 'demo.local');
  html = html.replace(/\+420\s*\d{3}\s*\d{3}\s*\d{3}/g, '+420 608 288 777');
  html = html.replace(/[a-z0-9._-]+@zrnozrnko\.cz/gi, 'info@demo.local');

  // Strip /en language switcher
  html = html.replace(/href="https?:\/\/[^"]*\/en\/[^"]*"/gi, 'href="#"');

  // Strip Google Maps links
  html = html.replace(/href="https?:\/\/(?:maps\.app\.goo\.gl|maps\.google\.com|goo\.gl)[^"]*"/gi, 'href="#"');

  // Strip Mailchimp subscription forms action
  html = html.replace(/action="https?:\/\/[^"]*mailchimp[^"]*"/gi, 'action="#"');

  return html;
}

console.log('\n--- Processing HTML ---');
for (const p of PAGES) {
  const raw = fs.readFileSync(`${OUT}/pages/${p.slug}-raw.html`, 'utf8');
  const processed = processHtml(raw);
  fs.writeFileSync(`${OUT}/pages/${p.slug}.html`, processed);
  const extLeft = (processed.match(/https?:\/\/(?!(?:demo\.local|schema\.org|w3\.org|og:))[a-z0-9.-]+\.[a-z]{2,}/gi) || []).length;
  const brandLeft = (processed.match(/zrnozrnko\.cz/gi) || []).length;
  console.log(`${p.slug}: ${raw.length}→${processed.length} | ext=${extLeft} brand=${brandLeft}`);
}

console.log('\nMirror done ✅');
console.log(`Assets in: ${OUT}/`);
