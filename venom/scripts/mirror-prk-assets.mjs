/**
 * Mirror prkpartners.com/cs — Custom SPA/CMS (advokátní kancelář)
 * Run: node scripts/mirror-prk-assets.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright-core';

const SLUG   = 'prk';
const ORIGIN = 'https://www.prkpartners.com';
const OUT    = `public/clones/${SLUG}`;

const PAGES = [
  { slug: 'home',           url: '/cs' },
  { slug: 'o-nas',          url: '/cs/o-nas' },
  { slug: 'legal-services', url: '/cs/legal-services' },
  { slug: 'kontakt',        url: '/cs/kontakt' },
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
    if (isJs && /gtm|analytics|pixel|hotjar|cookiebot|gtag|fbevents/.test(base)) return;
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
    await page.waitForTimeout(5000);
  } catch (e) { console.log('  timeout', e.message.substring(0,40)); }
  try { await page.click('button[class*="accept"], .cookie-accept', { timeout: 2000 }); } catch {}
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
['css','assets','static','_next','dist'].forEach(d => walk(`${OUT}/${d}`, (fp) => { if (fp.endsWith('.css')) fs.writeFileSync(fp, fixCss(fs.readFileSync(fp, 'utf8'))); }));

const BASE_PATH = '/cs';
const LINK_MAP = {
  [`${BASE_PATH}`]:               `/demo/prk-partners-demo`,
  [`${BASE_PATH}/o-nas`]:         `/demo/prk-partners-demo/o-nas`,
  [`${BASE_PATH}/legal-services`]:`/demo/prk-partners-demo/legal-services`,
  [`${BASE_PATH}/kontakt`]:       `/demo/prk-partners-demo/kontakt`,
  [`${BASE_PATH}/nas-tym`]:       `/demo/prk-partners-demo`,
  [`${BASE_PATH}/novinky`]:       `/demo/prk-partners-demo`,
  [`${BASE_PATH}/kariera`]:       `/demo/prk-partners-demo`,
  [`${BASE_PATH}/doing-business`]:`/demo/prk-partners-demo`,
  [`${BASE_PATH}/oceneni`]:       `/demo/prk-partners-demo`,
};

function processHtml(html) {
  for (const [orig, local] of assetMap) html = html.replaceAll(orig, local);
  html = html.replace(/(\/clones\/prk\/[^"'?#\s]+)\?[^"'>\s]*/g, '$1');

  html = html.replace(/<script[^>]*src="https?:\/\/[^"]+"[^>]*>[\s\S]*?<\/script>/gi, '');
  html = html.replace(/<script[^>]*(?:googletagmanager|gtag|hotjar|cookiebot|analytics|fbevents|connect\.facebook)[^>]*>[\s\S]*?<\/script>/gi, '');
  html = html.replace(/<noscript><iframe[^>]*googletagmanager[^>]*><\/iframe><\/noscript>/gi, '');
  html = html.replace(/<div[^>]*(?:cookie-banner|cookie-consent|gdpr-banner)[^>]*>[\s\S]{0,5000}?<\/div>/gi, '');

  html = html.replace(/href="https?:\/\/(?:www\.)?(?:facebook|instagram|youtube|linkedin|twitter|x\.com)\.com\/[^"]*"/gi, 'href="#"');

  // Strip team/article/service detail links
  html = html.replace(/href="https?:\/\/(?:www\.)?prkpartners\.com\/cs\/(?:clen-tymu|novinky|kariera)[^"]*"/gi, `href="/demo/prk-partners-demo"`);
  html = html.replace(/href="\/cs\/(?:clen-tymu|novinky|kariera)[^"]*"/gi, `href="/demo/prk-partners-demo"`);

  for (const [from, to] of Object.entries(LINK_MAP)) {
    html = html.replace(new RegExp(`href="${from.replace(/\//g,'\\/')}"`, 'gi'), `href="${to}"`);
    html = html.replace(new RegExp(`href="${ORIGIN.replace(/\./g,'\\.')}${from.replace(/\//g,'\\/')}(?=["/?#])`, 'g'), `href="${to}`);
  }
  html = html.replace(/href="https?:\/\/(?:www\.)?prkpartners\.com\/cs\/[^"]*"/gi, `href="/demo/prk-partners-demo"`);
  html = html.replace(/href="https?:\/\/(?:www\.)?prkpartners\.com\/cs"/gi, `href="/demo/prk-partners-demo"`);
  html = html.replace(/href="https?:\/\/(?:www\.)?prkpartners\.com\/en[^"]*"/gi, `href="#"`);
  html = html.replace(/<link[^>]*hreflang="en[^"]*"[^>]*>/gi, '');

  html = html.replace(/PRK\s*Partners(?!\s*Demo)/g, 'PRK Partners Demo');
  html = html.replace(/prkpartners\.com/gi, 'demo.local');
  html = html.replace(/\+420\s*\d{3}\s*\d{3}\s*\d{3}/g, '+420 608 288 777');
  html = html.replace(/[a-z0-9._-]+@prk(?:partners)?\.cz/gi, 'info@demo.local');

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
  const brandLeft = (processed.match(/prkpartners\.com/gi) || []).length;
  console.log(`${p.slug}: ${raw.length}→${processed.length} | ext=${extLeft} brand=${brandLeft}`);
}
console.log('\nMirror done ✅');
