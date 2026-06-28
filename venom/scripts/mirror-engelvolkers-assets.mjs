/**
 * Mirror engelvoelkers.com/cz/cs — Next.js SSR (realitní kancelář)
 * Run: node scripts/mirror-engelvolkers-assets.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright-core';

const SLUG   = 'engelvolkers';
const ORIGIN = 'https://www.engelvoelkers.com';
const OUT    = `public/clones/${SLUG}`;

const PAGES = [
  { slug: 'home',           url: '/cz/cs' },
  { slug: 'o-nas',          url: '/cz/cs/firma/o-nas' },
  { slug: 'tym',            url: '/cz/cs/firma/tym' },
  { slug: 'prehled-sluzeb', url: '/cz/cs/firma/prehled-sluzeb' },
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

// EV uses external CDN media.engelvoelkers.com for images
function cdnLocal(url) {
  try {
    const parsed = new URL(url);
    if (!parsed.hostname.includes('engelvoelkers.com')) return null;
    if (parsed.hostname === new URL(ORIGIN).hostname) return null;
    const rel = parsed.pathname.split('?')[0];
    return { dest: `${OUT}/cdn/${parsed.hostname}${rel}`, local: `/clones/${SLUG}/cdn/${parsed.hostname}${rel}` };
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
      const info = originLocal(url) || cdnLocal(url);
      if (!info) return;
      const ext = path.extname(info.dest).toLowerCase();
      const isCss  = ct.includes('css') || ext === '.css';
      const isJs   = ct.includes('javascript') || ext === '.js';
      const isImg  = ct.includes('image') || ['.jpg','.jpeg','.png','.webp','.gif','.svg','.ico','.avif'].includes(ext);
      const isFont = ct.includes('font') || ['.woff','.woff2','.ttf','.otf','.eot'].includes(ext);
      if (!isCss && !isJs && !isImg && !isFont) return;
      const base = path.basename(info.dest);
      if (isJs && /gtm|analytics|pixel|hotjar|cookiebot|gtag|usercentrics/.test(base)) return;

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
  await page.waitForTimeout(3500);
  try { await page.click('[id*="consent"] button, button[class*="accept"], button[data-testid*="accept"]', { timeout: 2000 }); } catch {}
  await page.waitForTimeout(1500);

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
  css = css.replace(/url\((['"]?)\/_next\//g, `url($1/clones/${SLUG}/_next/`);
  return css;
}
walk(`${OUT}/_next`, (fp) => {
  if (!fp.endsWith('.css')) return;
  fs.writeFileSync(fp, fixCss(fs.readFileSync(fp, 'utf8')));
});

const LINK_MAP = {
  '/cz/cs':                           `/demo/engel-volkers-demo`,
  '/cz/cs/':                          `/demo/engel-volkers-demo`,
  '/cz/cs/firma/o-nas':               `/demo/engel-volkers-demo/o-nas`,
  '/cz/cs/firma/tym':                 `/demo/engel-volkers-demo/tym`,
  '/cz/cs/firma/prehled-sluzeb':      `/demo/engel-volkers-demo/prehled-sluzeb`,
  '/cz/cs/firma/realitni-report':     `/demo/engel-volkers-demo`,
  '/cz/cs/firma/komercni-prodej-pronajem':    `/demo/engel-volkers-demo`,
  '/cz/cs/firma/rezidencni-prodej-pronajem':  `/demo/engel-volkers-demo`,
  '/cz/cs/developerske-projekty':     `/demo/engel-volkers-demo`,
  '/cz/cs/komercni':                  `/demo/engel-volkers-demo`,
};

function processHtml(html) {
  for (const [orig, local] of assetMap) html = html.replaceAll(orig, local);
  html = html.replace(/(\/clones\/engelvolkers\/[^"'?#\s]+\.(?:js|css|woff2?|svg|png|jpg|jpeg|webp|gif|avif))\?[^"'>\s]*/g, '$1');

  // Strip tracking
  html = html.replace(/<script[^>]*(?:googletagmanager|gtag|hotjar|usercentrics|cookiebot)[^>]*>[\s\S]*?<\/script>/gi, '');
  html = html.replace(/<noscript><iframe[^>]*googletagmanager[^>]*><\/iframe><\/noscript>/gi, '');

  // Social → #
  html = html.replace(/href="https?:\/\/(?:www\.|[a-z0-9.-]*\.)?(?:facebook|instagram|youtube|tiktok|twitter|linkedin|xing)\.com\/[^"]*"/gi, 'href="#"');

  // Strip other language links / x-default
  html = html.replace(/<link[^>]*hreflang="(?!cs)[^"]*"[^>]*>/gi, '');
  html = html.replace(/href="https?:\/\/(?:www\.)?engelvoelkers\.com\/(?!cz\/cs)[^"]*"/gi, 'href="#"');

  // Internal link rewrites
  for (const [from, to] of Object.entries(LINK_MAP)) {
    html = html.replace(new RegExp(`href="${from.replace(/\//g,'\\/')}"`, 'gi'), `href="${to}"`);
    html = html.replace(new RegExp(`href="${ORIGIN.replace(/\./g,'\\.')}${from.replace(/\//g,'\\/')}(?=["/?#])`, 'g'), `href="${to}`);
  }
  // Remaining /cz/cs/ links → demo home
  html = html.replace(/href="\/cz\/cs\/[^"]*"/gi, `href="/demo/engel-volkers-demo"`);
  html = html.replace(/href="\/cz\/cs"/gi, `href="/demo/engel-volkers-demo"`);
  // Remaining engelvoelkers.com links → demo home
  html = html.replace(/href="https?:\/\/(?:www\.)?engelvoelkers\.com\/[^"]*"/gi, `href="/demo/engel-volkers-demo"`);

  // Brand scrub
  html = html.replace(/Engel\s*&amp;\s*Völkers(?!\s*Demo)/g, 'Engel &amp; Völkers Demo');
  html = html.replace(/Engel\s*&\s*Völkers(?!\s*Demo)/g, 'Engel & Völkers Demo');
  html = html.replace(/ENGEL\s*&amp;\s*VÖLKERS(?!\s*DEMO)/g, 'ENGEL &amp; VÖLKERS DEMO');
  html = html.replace(/engelvoelkers\.com/gi, 'demo.local');
  html = html.replace(/\+420\s*\d{3}\s*\d{3}\s*\d{3}/g, '+420 608 288 777');
  html = html.replace(/[a-z0-9._-]+@engelvoelkers\.com/gi, 'info@demo.local');

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
  const extLeft = (processed.match(/https?:\/\/(?!(?:demo\.local|schema\.org|w3\.org|og:|fonts\.gstatic|fonts\.googleapis))[a-z0-9.-]+\.[a-z]{2,}/gi) || []).length;
  const brandLeft = (processed.match(/engelvoelkers\.com/gi) || []).length;
  console.log(`${p.slug}: ${raw.length}→${processed.length} | ext=${extLeft} brand=${brandLeft}`);
}
console.log('\nMirror done ✅');
