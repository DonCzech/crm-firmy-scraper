/**
 * Mirror usmevneboli.cz — WordPress (dentální hygienistka)
 * Run: node scripts/mirror-usmevneboli-assets.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright-core';

const SLUG   = 'usmev';
const ORIGIN = 'https://usmevneboli.cz';
const OUT    = `public/clones/${SLUG}`;

const PAGES = [
  { slug: 'home',       url: '/' },
  { slug: 'beleni',     url: '/beleni-zubu/' },
  { slug: 'blog',       url: '/blog' },
];

const assetMap = new Map();
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
    const rel = url.replace(ORIGIN, '').split('?')[0];
    const ext = path.extname(rel).toLowerCase();
    const isCss  = ct.includes('css') || ext === '.css';
    const isJs   = ct.includes('javascript') || ext === '.js';
    const isImg  = ct.includes('image') || ['.jpg','.jpeg','.png','.webp','.gif','.svg','.ico','.avif'].includes(ext);
    const isFont = ct.includes('font') || ['.woff','.woff2','.ttf','.otf','.eot'].includes(ext);
    if (!isCss && !isJs && !isImg && !isFont) return;
    const base = path.basename(rel);
    if (isJs && /gtm|analytics|pixel|hotjar|complianz|cookiebot|gtag/.test(base)) return;
    try {
      const dest = `${OUT}${rel}`;
      if (!fs.existsSync(dest)) {
        const body = await resp.body();
        if (body.length < 4) return;
        fs.mkdirSync(path.dirname(dest), { recursive: true });
        fs.writeFileSync(dest, body);
      }
      assetMap.set(url, `/clones/${SLUG}${rel}`);
      assetMap.set(url.split('?')[0], `/clones/${SLUG}${rel}`);
    } catch {}
  });

  try {
    await page.goto(`${ORIGIN}${p.url}`, { waitUntil: 'domcontentloaded', timeout: 45000 });
    await page.waitForTimeout(4000);
  } catch (e) { console.log('  timeout', e.message.substring(0,40)); }
  try { await page.click('button[class*="cmplz-accept"], button[class*="accept"]', { timeout: 2000 }); } catch {}
  await page.waitForTimeout(1000);

  const html = await page.content();
  fs.writeFileSync(`${OUT}/pages/${p.slug}-raw.html`, html);
  console.log(`  ${p.slug}: ${html.length} bytes | assets: ${assetMap.size}`);
  await page.close();
  await context.close();
}

await browser.close();
console.log(`\nTotal assets: ${assetMap.size}`);

function walk(dir, fn) {
  if (!fs.existsSync(dir)) return;
  for (const f of fs.readdirSync(dir)) {
    const full = path.join(dir, f);
    if (fs.statSync(full).isDirectory()) walk(full, fn);
    else fn(full);
  }
}
function fixCss(c) { for (const [o,l] of assetMap) c = c.replaceAll(o,l); return c; }
walk(`${OUT}/wp-content`, (fp) => { if (fp.endsWith('.css')) fs.writeFileSync(fp, fixCss(fs.readFileSync(fp, 'utf8'))); });

const LINK_MAP = {
  '/':              `/demo/usmev-neboli-demo`,
  '/beleni-zubu/':  `/demo/usmev-neboli-demo/beleni`,
  '/beleni-zubu':   `/demo/usmev-neboli-demo/beleni`,
  '/blog':          `/demo/usmev-neboli-demo/blog`,
  '/blog/':         `/demo/usmev-neboli-demo/blog`,
  '/zasady-cookies-eu/': `#`,
  '/ochrana-osobnich-udaju/': `#`,
  '/obchodni-podminky': `#`,
};

function processHtml(html) {
  for (const [orig, local] of assetMap) html = html.replaceAll(orig, local);
  html = html.replace(/(\/clones\/usmev\/[^"'?#\s]+)\?[^"'>\s]*/g, '$1');

  html = html.replace(/<script[^>]*src="https?:\/\/[^"]+"[^>]*>[\s\S]*?<\/script>/gi, '');
  html = html.replace(/<script[^>]*(?:googletagmanager|gtag|hotjar|complianz|cookiebot|analytics)[^>]*>[\s\S]*?<\/script>/gi, '');
  html = html.replace(/<noscript><iframe[^>]*googletagmanager[^>]*><\/iframe><\/noscript>/gi, '');
  html = html.replace(/<div[^>]*(?:cmplz-cookiebanner|cmplz-consent)[^>]*>[\s\S]{0,8000}?<\/div>/gi, '');

  html = html.replace(/href="https?:\/\/(?:www\.)?(?:facebook|instagram|youtube|tiktok|twitter|linkedin)\.com\/[^"]*"/gi, 'href="#"');
  html = html.replace(/href="https?:\/\/usmevneboli\.xdent\.cz[^"]*"/gi, 'href="#objednani"');

  // Strip article detail links → blog
  html = html.replace(/href="https?:\/\/usmevneboli\.cz\/(?!wp-content|beleni-zubu|blog)[a-z0-9_-]+\/[^"]*"/gi, `href="/demo/usmev-neboli-demo/blog"`);

  for (const [from, to] of Object.entries(LINK_MAP)) {
    html = html.replace(new RegExp(`href="${from.replace(/\//g,'\\/')}"`, 'gi'), `href="${to}"`);
    html = html.replace(new RegExp(`href="${ORIGIN.replace(/\./g,'\\.')}${from.replace(/\//g,'\\/')}(?=["/?#])`, 'g'), `href="${to}`);
  }
  html = html.replace(/href="https?:\/\/(?:www\.)?usmevneboli\.cz\/[^"]*"/gi, `href="/demo/usmev-neboli-demo"`);
  html = html.replace(/href="https?:\/\/(?:www\.)?usmevneboli\.cz"/gi, `href="/demo/usmev-neboli-demo"`);

  // Brand scrub
  html = html.replace(/Úsměv\s*Nebolí(?!\s*Demo)/g, 'Úsměv Nebolí Demo');
  html = html.replace(/usmevneboli\.cz/gi, 'demo.local');
  html = html.replace(/\+420\s*\d{3}\s*\d{3}\s*\d{3}/g, '+420 608 288 777');
  html = html.replace(/[a-z0-9._-]+@usmevneboli\.cz/gi, 'info@demo.local');

  html = html.replace(/href="[^"]*wp-(?:admin|login)[^"]*"/gi, 'href="#"');
  html = html.replace(/<link[^>]*wp-json[^>]*>/gi, '');

  // Fix root-relative wp-content paths
  html = html.replace(/(["'\s\(=,])\/wp-content\//g, `$1/clones/${SLUG}/wp-content/`);
  html = html.replace(/(["'\s\(=,])\/wp-includes\//g, `$1/clones/${SLUG}/wp-includes/`);

  return html;
}

console.log('\n--- Processing HTML ---');
for (const p of PAGES) {
  const raw = fs.readFileSync(`${OUT}/pages/${p.slug}-raw.html`, 'utf8');
  const processed = processHtml(raw);
  fs.writeFileSync(`${OUT}/pages/${p.slug}.html`, processed);
  const extLeft = (processed.match(/https?:\/\/(?!(?:demo\.local|schema\.org|w3\.org|og:|fonts\.gstatic|fonts\.googleapis))[a-z0-9.-]+\.[a-z]{2,}/gi) || []).length;
  const brandLeft = (processed.match(/usmevneboli\.cz/gi) || []).length;
  console.log(`${p.slug}: ${raw.length}→${processed.length} | ext=${extLeft} brand=${brandLeft}`);
}
console.log('\nMirror done ✅');
