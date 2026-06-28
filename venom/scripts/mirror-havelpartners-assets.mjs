/**
 * Mirror havelpartners.cz — WordPress (advokátní kancelář)
 * Run: node scripts/mirror-havelpartners-assets.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright-core';

const SLUG   = 'havel';
const ORIGIN = 'https://www.havelpartners.cz';
const OUT    = `public/clones/${SLUG}`;

const PAGES = [
  { slug: 'home',    url: '/' },
  { slug: 'o-nas',   url: '/o-nas/' },
  { slug: 'tym',     url: '/tym/' },
  { slug: 'kontakt', url: '/kontakt/' },
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
    if (isJs && /gtm|analytics|pixel|hotjar|complianz|cookiebot|gtag|instantpage/.test(base)) return;
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
  try { await page.click('button[class*="accept"], button[class*="souhlas"], .cookie-accept', { timeout: 2000 }); } catch {}
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
  '/':           `/demo/havel-partners-demo`,
  '/o-nas/':     `/demo/havel-partners-demo/o-nas`,
  '/o-nas':      `/demo/havel-partners-demo/o-nas`,
  '/tym/':       `/demo/havel-partners-demo/tym`,
  '/tym':        `/demo/havel-partners-demo/tym`,
  '/kontakt/':   `/demo/havel-partners-demo/kontakt`,
  '/kontakt':    `/demo/havel-partners-demo/kontakt`,
  '/kariera/':   `/demo/havel-partners-demo`,
  '/novinky/':   `/demo/havel-partners-demo`,
  '/sluzby/':    `/demo/havel-partners-demo`,
};

function processHtml(html) {
  for (const [orig, local] of assetMap) html = html.replaceAll(orig, local);
  html = html.replace(/(\/clones\/havel\/[^"'?#\s]+)\?[^"'>\s]*/g, '$1');

  html = html.replace(/<script[^>]*src="https?:\/\/[^"]+"[^>]*>[\s\S]*?<\/script>/gi, '');
  html = html.replace(/<script[^>]*(?:googletagmanager|gtag|hotjar|complianz|cookiebot|analytics)[^>]*>[\s\S]*?<\/script>/gi, '');
  html = html.replace(/<noscript><iframe[^>]*googletagmanager[^>]*><\/iframe><\/noscript>/gi, '');
  html = html.replace(/<div[^>]*(?:cmplz-|cookie-banner|cookie-consent)[^>]*>[\s\S]{0,8000}?<\/div>/gi, '');

  html = html.replace(/href="https?:\/\/(?:www\.)?(?:facebook|instagram|youtube|linkedin|twitter)\.com\/[^"]*"/gi, 'href="#"');

  // Strip language variant links
  html = html.replace(/href="https?:\/\/(?:www\.)?havelpartners\.(?:sk|com|de)[^"]*"/gi, 'href="#"');
  html = html.replace(/<link[^>]*hreflang="(?!cs)[^"]*"[^>]*>/gi, '');

  // Strip team member/article detail links → tym
  html = html.replace(/href="\/tym\/[^"]*"/gi, `href="/demo/havel-partners-demo/tym"`);
  html = html.replace(/href="\/novinky\/[^"]*"/gi, `href="/demo/havel-partners-demo"`);
  html = html.replace(/href="\/sluzby\/[^"]*"/gi, `href="/demo/havel-partners-demo"`);
  html = html.replace(/href="\/o-nas\/[^"]*"/gi, `href="/demo/havel-partners-demo/o-nas"`);

  for (const [from, to] of Object.entries(LINK_MAP)) {
    html = html.replace(new RegExp(`href="${from.replace(/\//g,'\\/')}"`, 'gi'), `href="${to}"`);
    html = html.replace(new RegExp(`href="${ORIGIN.replace(/\./g,'\\.')}${from.replace(/\//g,'\\/')}(?=["/?#])`, 'g'), `href="${to}`);
  }
  html = html.replace(/href="https?:\/\/(?:www\.)?havelpartners\.cz\/[^"]*"/gi, `href="/demo/havel-partners-demo"`);
  html = html.replace(/href="https?:\/\/(?:www\.)?havelpartners\.cz"/gi, `href="/demo/havel-partners-demo"`);

  // Brand scrub
  html = html.replace(/HAVEL\s*&(?:amp;)?\s*PARTNERS(?!\s*Demo)/g, 'HAVEL & PARTNERS Demo');
  html = html.replace(/Havel\s*&(?:amp;)?\s*Partners(?!\s*Demo)/g, 'Havel & Partners Demo');
  html = html.replace(/havelpartners\.cz/gi, 'demo.local');
  html = html.replace(/\+420\s*\d{3}\s*\d{3}\s*\d{3}/g, '+420 608 288 777');
  html = html.replace(/[a-z0-9._-]+@havelpartners\.cz/gi, 'info@demo.local');

  html = html.replace(/<iframe[^>]*(?:google\.com\/maps|maps\.google)[^>]*>[\s\S]*?<\/iframe>/gi,
    '<div style="background:#e0e0e0;height:300px;display:flex;align-items:center;justify-content:center;color:#666">Mapa</div>');
  html = html.replace(/href="https?:\/\/(?:maps\.google|maps\.app\.goo\.gl|goo\.gl|www\.google\.[a-z]+\/maps)[^"]*"/gi, 'href="#"');

  html = html.replace(/href="[^"]*wp-(?:admin|login)[^"]*"/gi, 'href="#"');
  html = html.replace(/<link[^>]*wp-json[^>]*>/gi, '');

  // Fix root-relative WP paths
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
  const brandLeft = (processed.match(/havelpartners\.cz/gi) || []).length;
  console.log(`${p.slug}: ${raw.length}→${processed.length} | ext=${extLeft} brand=${brandLeft}`);
}
console.log('\nMirror done ✅');
