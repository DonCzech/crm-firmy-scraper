/**
 * Mirror lexxusnorton.cz — Next.js SSR (realitní kancelář)
 * Run: node scripts/mirror-lexxus-assets.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright-core';

const SLUG   = 'lexxus';
const ORIGIN = 'https://www.lexxusnorton.cz';
const OUT    = `public/clones/${SLUG}`;

const PAGES = [
  { slug: 'home',                 url: '/' },
  { slug: 'o-nas',                url: '/o-nas' },
  { slug: 'kontakt',              url: '/kontakt' },
  { slug: 'oblibene-nemovitosti', url: '/oblibene-nemovitosti' },
];

const assetMap = new Map();

function originLocal(url) {
  try {
    const parsed = new URL(url);
    if (parsed.hostname !== new URL(ORIGIN).hostname) return null;
    const rel = parsed.pathname.split('?')[0];
    return { dest: `${OUT}${rel}`, local: `/clones/${SLUG}${rel}` };
  } catch { return null; }
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
    const ct = resp.headers()['content-type'] || '';
    try {
      const info = originLocal(url);
      if (!info) return;
      const ext = path.extname(info.dest).toLowerCase();
      const isCss  = ct.includes('css') || ext === '.css';
      const isJs   = ct.includes('javascript') || ext === '.js';
      const isImg  = ct.includes('image') || ['.jpg','.jpeg','.png','.webp','.gif','.svg','.ico','.avif'].includes(ext);
      const isFont = ct.includes('font') || ['.woff','.woff2','.ttf','.otf','.eot'].includes(ext);
      if (!isCss && !isJs && !isImg && !isFont) return;
      const base = path.basename(info.dest);
      if (isJs && /gtm|analytics|pixel|hotjar|cookiebot|gtag/.test(base)) return;

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
  try { await page.click('[class*="cookie"] button, [id*="cookie"] button, button[class*="accept"], button[class*="souhlasim"]', { timeout: 2000 }); } catch {}
  await page.waitForTimeout(1000);

  const html = await page.content();
  fs.writeFileSync(`${OUT}/pages/${p.slug}-raw.html`, html);
  console.log(`  ${p.slug}: ${html.length} bytes | assets: ${assetMap.size}`);
  await page.close();
  await context.close();
}

await browser.close();
console.log(`\nTotal assets: ${assetMap.size}`);

// Fix CSS
function walk(dir, fn) {
  if (!fs.existsSync(dir)) return;
  for (const f of fs.readdirSync(dir)) {
    const full = path.join(dir, f);
    if (fs.statSync(full).isDirectory()) walk(full, fn);
    else fn(full);
  }
}
function fixCss(content) {
  let css = content;
  for (const [orig, local] of assetMap) css = css.replaceAll(orig, local);
  // Fix root-relative paths in CSS
  css = css.replace(/url\((['"]?)\/_next\//g, `url($1/clones/${SLUG}/_next/`);
  return css;
}
walk(`${OUT}/_next`, (fp) => {
  if (!fp.endsWith('.css')) return;
  fs.writeFileSync(fp, fixCss(fs.readFileSync(fp, 'utf8')));
});

// LINK_MAP
const LINK_MAP = {
  '/':                     `/demo/lexxus-norton-demo`,
  '/o-nas':                `/demo/lexxus-norton-demo/o-nas`,
  '/kontakt':              `/demo/lexxus-norton-demo/kontakt`,
  '/oblibene-nemovitosti': `/demo/lexxus-norton-demo/oblibene-nemovitosti`,
  '/kariera':              `/demo/lexxus-norton-demo`,
  '/blog':                 `/demo/lexxus-norton-demo`,
  '/pravni-ujednani':      `#`,
};

function processHtml(html) {
  for (const [orig, local] of assetMap) html = html.replaceAll(orig, local);
  // Strip query params from local clone paths (preserves _next hash filenames intact)
  html = html.replace(/(\/clones\/lexxus\/[^"'?#\s]+\.(?:js|css|woff2?|svg|png|jpg|jpeg|webp|gif))\?[^"'>\s]*/g, '$1');

  // Strip tracking
  html = html.replace(/<script[^>]*(?:googletagmanager|gtag|hotjar|analytics)[^>]*>[\s\S]*?<\/script>/gi, '');
  html = html.replace(/<noscript><iframe[^>]*googletagmanager[^>]*><\/iframe><\/noscript>/gi, '');

  // Strip cookie banners
  html = html.replace(/<div[^>]*(?:cookie-banner|cookie-consent|gdpr-banner)[^>]*>[\s\S]{0,5000}?<\/div>/gi, '');

  // Social → #
  html = html.replace(/href="https?:\/\/(?:www\.)?(?:facebook|instagram|youtube|tiktok|twitter|linkedin)\.com\/[^"]*"/gi, 'href="#"');

  // Strip /en lang switcher
  html = html.replace(/href="https?:\/\/(?:www\.)?lexxusnorton\.cz\/en[^"]*"/gi, 'href="#"');
  html = html.replace(/href="\/en[^"]*"/gi, 'href="#"');
  html = html.replace(/<link[^>]*hreflang="(?:en|x-default)"[^>]*>/gi, '');

  // Strip blog category & detail links → blog home
  html = html.replace(/href="\/blog\/[^"]*"/gi, `href="/demo/lexxus-norton-demo"`);

  // Internal link rewrites
  for (const [from, to] of Object.entries(LINK_MAP)) {
    html = html.replace(new RegExp(`href="${from.replace(/\//g,'\\/')}"`, 'gi'), `href="${to}"`);
    html = html.replace(new RegExp(`href="${ORIGIN.replace(/\./g,'\\.')}${from.replace(/\//g,'\\/')}(?=["/?#])`, 'g'), `href="${to}`);
  }
  // Remaining lexxusnorton.cz links → demo home
  html = html.replace(/href="https?:\/\/(?:www\.)?lexxusnorton\.cz\/[^"]*"/gi, `href="/demo/lexxus-norton-demo"`);
  html = html.replace(/href="https?:\/\/(?:www\.)?lexxusnorton\.cz"/gi, `href="/demo/lexxus-norton-demo"`);

  // Brand scrub
  html = html.replace(/Lexxus\s+Norton(?!\s*Demo)/g, 'Lexxus Norton Demo');
  html = html.replace(/LEXXUS\s+NORTON(?!\s*DEMO)/g, 'LEXXUS NORTON DEMO');
  html = html.replace(/lexxusnorton\.cz/gi, 'demo.local');
  html = html.replace(/\+420\s*\d{3}\s*\d{3}\s*\d{3}/g, '+420 608 288 777');
  html = html.replace(/[a-z0-9._-]+@lexxusnorton\.cz/gi, 'info@demo.local');

  // Google Maps → placeholder
  html = html.replace(/<iframe[^>]*(?:google\.com\/maps|maps\.google)[^>]*>[\s\S]*?<\/iframe>/gi,
    '<div style="background:#e0e0e0;height:300px;display:flex;align-items:center;justify-content:center;color:#666">Mapa</div>');
  html = html.replace(/href="https?:\/\/(?:maps\.google|maps\.app\.goo\.gl|goo\.gl|www\.google\.[a-z]+\/maps)[^"]*"/gi, 'href="#"');

  return html;
}

console.log('\n--- Processing HTML ---');
for (const p of PAGES) {
  const raw = fs.readFileSync(`${OUT}/pages/${p.slug}-raw.html`, 'utf8');
  const processed = processHtml(raw);
  fs.writeFileSync(`${OUT}/pages/${p.slug}.html`, processed);
  const extLeft = (processed.match(/https?:\/\/(?!(?:demo\.local|schema\.org|w3\.org|og:|fonts\.gstatic\.com|fonts\.googleapis\.com))[a-z0-9.-]+\.[a-z]{2,}/gi) || []).length;
  const brandLeft = (processed.match(/lexxusnorton\.cz/gi) || []).length;
  console.log(`${p.slug}: ${raw.length}→${processed.length} | ext=${extLeft} brand=${brandLeft}`);
}

console.log('\nMirror done ✅');
