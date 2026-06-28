/**
 * Mirror cathedralcafe.cz — Custom Stimulus + Swup app (Vite-style assets)
 * Run: node scripts/mirror-cathedral-assets.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright-core';

const SLUG   = 'cathedral';
const ORIGIN = 'https://www.cathedralcafe.cz';
const OUT    = `public/clones/${SLUG}`;

const PAGES = [
  { slug: 'home',     url: '/' },
  { slug: 'nase-menu', url: '/nase-menu' },
  { slug: 'galerie',  url: '/galerie' },
  { slug: 'kontakt',  url: '/kontakt' },
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
      if (isJs && /gtm|analytics|pixel|hotjar|cookiebot/.test(base)) return;

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
  // Fix root-relative paths from CSS
  css = css.replace(/url\((['"]?)\/userfiles\//g, `url($1/clones/${SLUG}/userfiles/`);
  css = css.replace(/url\((['"]?)\/assets\//g, `url($1/clones/${SLUG}/assets/`);
  return css;
}
walk(`${OUT}/assets`, (fp) => {
  if (!fp.endsWith('.css')) return;
  fs.writeFileSync(fp, fixCss(fs.readFileSync(fp, 'utf8')));
});

// LINK_MAP
const LINK_MAP = {
  '/':           `/demo/cathedral-cafe-demo`,
  '/nase-menu':  `/demo/cathedral-cafe-demo/nase-menu`,
  '/galerie':    `/demo/cathedral-cafe-demo/galerie`,
  '/kontakt':    `/demo/cathedral-cafe-demo/kontakt`,
  '/akce':       `/demo/cathedral-cafe-demo`,
  '/faq':        `#`,
  '/gdpr':       `#`,
  '/booking':    `#rezervace`,
  '/rezervace':  `#rezervace`,
};

function processHtml(html) {
  for (const [orig, local] of assetMap) html = html.replaceAll(orig, local);
  html = html.replace(/(\/clones\/cathedral\/[^"'?#\s]+)\?[^"'>\s]*/g, '$1');

  // Strip tracking
  html = html.replace(/<script[^>]*(?:googletagmanager|gtag|hotjar|analytics)[^>]*>[\s\S]*?<\/script>/gi, '');
  html = html.replace(/<noscript><iframe[^>]*googletagmanager[^>]*><\/iframe><\/noscript>/gi, '');

  // Strip cookie banners
  html = html.replace(/<div[^>]*(?:cookie-banner|cookie-consent|gdpr-banner|cookies-popup)[^>]*>[\s\S]{0,5000}?<\/div>/gi, '');

  // Social → #
  html = html.replace(/href="https?:\/\/(?:www\.)?(?:facebook|instagram|youtube|tiktok|twitter|linkedin)\.com\/[^"]*"/gi, 'href="#"');

  // Strip alternate language links
  html = html.replace(/<link[^>]*hreflang="(?:en|de|pl|x-default)"[^>]*>/gi, '');
  html = html.replace(/href="https?:\/\/(?:www\.)?cathedralcafe\.cz\/(?:en|de|pl)\/[^"]*"/gi, 'href="#"');
  html = html.replace(/href="https?:\/\/(?:www\.)?cathedralcafe\.cz\/(?:en|de|pl)"/gi, 'href="#"');

  // Internal link rewrites
  for (const [from, to] of Object.entries(LINK_MAP)) {
    html = html.replace(new RegExp(`href="${from.replace(/\//g,'\\/')}"`, 'gi'), `href="${to}"`);
    html = html.replace(new RegExp(`href="${ORIGIN.replace(/\./g,'\\.')}${from.replace(/\//g,'\\/')}(?=["/?#])`, 'g'), `href="${to}`);
  }
  // Remaining cathedral links → demo home
  html = html.replace(/href="https?:\/\/(?:www\.)?cathedralcafe\.cz\/[^"]*"/gi, `href="/demo/cathedral-cafe-demo"`);
  html = html.replace(/href="https?:\/\/(?:www\.)?cathedralcafe\.cz"/gi, `href="/demo/cathedral-cafe-demo"`);

  // Brand scrub
  html = html.replace(/Cathedral\s+Café(?!\s*Demo)/g, 'Cathedral Café Demo');
  html = html.replace(/Cathedral\s+Cafe(?!\s*Demo)/g, 'Cathedral Cafe Demo');
  html = html.replace(/CATHEDRAL\s+CAFÉ(?!\s*DEMO)/g, 'CATHEDRAL CAFÉ DEMO');
  html = html.replace(/cathedralcafe\.cz/gi, 'demo.local');
  html = html.replace(/\+420\s*\d{3}\s*\d{3}\s*\d{3}/g, '+420 608 288 777');
  html = html.replace(/[a-z0-9._-]+@cathedralcafe\.cz/gi, 'info@demo.local');

  // Google Maps placeholders
  html = html.replace(/<iframe[^>]*(?:google\.com\/maps|maps\.google)[^>]*>[\s\S]*?<\/iframe>/gi,
    '<div style="background:#e0e0e0;height:280px;display:flex;align-items:center;justify-content:center;color:#666">Mapa</div>');
  html = html.replace(/href="https?:\/\/(?:maps\.google|maps\.app\.goo\.gl|goo\.gl|www\.google\.[a-z]+\/maps)[^"]*"/gi, 'href="#"');

  return html;
}

console.log('\n--- Processing HTML ---');
for (const p of PAGES) {
  const raw = fs.readFileSync(`${OUT}/pages/${p.slug}-raw.html`, 'utf8');
  const processed = processHtml(raw);
  fs.writeFileSync(`${OUT}/pages/${p.slug}.html`, processed);
  const extLeft = (processed.match(/https?:\/\/(?!(?:demo\.local|schema\.org|w3\.org|og:|fonts\.gstatic\.com|fonts\.googleapis\.com))[a-z0-9.-]+\.[a-z]{2,}/gi) || []).length;
  const brandLeft = (processed.match(/cathedralcafe\.cz/gi) || []).length;
  console.log(`${p.slug}: ${raw.length}→${processed.length} | ext=${extLeft} brand=${brandLeft}`);
}

console.log('\nMirror done ✅');
