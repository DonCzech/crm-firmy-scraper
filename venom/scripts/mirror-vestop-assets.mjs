/**
 * Mirror vestop.cz — vzduchotechnika, klimatizace Praha
 * Run: node -e "import('/Users/apple/DEV/CRM/venom/scripts/mirror-vestop-assets.mjs')"
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'url';
import { chromium } from 'playwright-core';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SLUG   = 'vestop';
const ORIGIN = 'https://vestop.cz';
const OUT    = path.join(__dirname, '..', 'public', 'clones', SLUG);

const PAGES = [
  { slug: 'home',      url: '/' },
  { slug: 'sluzby',    url: '/sluzby/' },
  { slug: 'reference', url: '/reference-topenarstvi-bystrice/' },
  { slug: 'kontakt',   url: '/topenarstvi-bystrice-kontakt/' },
];

const assetMap = new Map();
fs.mkdirSync(path.join(OUT, 'pages'), { recursive: true });

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
    if (isJs && /gtm|analytics|pixel|hotjar|cookiebot|gtag|fbevents|smartsupp|seznam|bat\.bing/.test(base)) return;
    try {
      const dest = path.join(OUT, rel);
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
    await page.goto(`${ORIGIN}${p.url}`, { waitUntil: 'networkidle', timeout: 40000 });
    await page.waitForTimeout(3000);
  } catch (e) {
    try {
      await page.goto(`${ORIGIN}${p.url.replace(/\/$/, '')}`, { waitUntil: 'domcontentloaded', timeout: 20000 });
      await page.waitForTimeout(2000);
    } catch {}
    console.log('  timeout:', e.message.substring(0,60));
  }
  try { await page.click('button[class*="accept"], .cookie-accept, #CybotCookiebotDialogBodyLevelButtonLevelOptinAllowAll', { timeout: 2000 }); } catch {}
  await page.waitForTimeout(1000);

  const html = await page.content();
  fs.writeFileSync(path.join(OUT, 'pages', `${p.slug}-raw.html`), html);
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
function fixCss(c) { for (const [o,l] of assetMap) c = c.replaceAll(o, l); return c; }
['css','assets','static','_next','dist','wp-content','app','themes'].forEach(d =>
  walk(path.join(OUT, d), (fp) => { if (fp.endsWith('.css')) fs.writeFileSync(fp, fixCss(fs.readFileSync(fp, 'utf8'))); })
);

const LINK_MAP = {
  '/':                                    `/demo/vestop-demo`,
  '/sluzby/':                             `/demo/vestop-demo/sluzby`,
  '/sluzby':                              `/demo/vestop-demo/sluzby`,
  '/reference-topenarstvi-bystrice/':     `/demo/vestop-demo/reference`,
  '/reference-topenarstvi-bystrice':      `/demo/vestop-demo/reference`,
  '/topenarstvi-bystrice-kontakt/':       `/demo/vestop-demo/kontakt`,
  '/topenarstvi-bystrice-kontakt':        `/demo/vestop-demo/kontakt`,
  '/o-nas-elektrikar-topenar/':           `/demo/vestop-demo`,
  '/cenik-topenarstvi/':                  `/demo/vestop-demo`,
  '/caste-dotazy/':                       `/demo/vestop-demo`,
  '/montaz-a-vymena-kotlu/':              `/demo/vestop-demo/sluzby`,
  '/instalater-a-instalaterske-prace/':   `/demo/vestop-demo/sluzby`,
  '/servis-topeni/':                      `/demo/vestop-demo/sluzby`,
  '/elektrikar-a-elektroinstalace/':      `/demo/vestop-demo/sluzby`,
  '/instalace-tepelnych-cerpadel/':       `/demo/vestop-demo/sluzby`,
  '/novinky/':                            `/demo/vestop-demo`,
};

function processHtml(html) {
  for (const [orig, local] of assetMap) html = html.replaceAll(orig, local);
  html = html.replace(new RegExp(`(\\/clones\\/${SLUG}\\/[^"'?#\\s]+)\\?[^"'>\\s]*`, 'g'), '$1');
  html = html.replace(/\/_next\//g, `/clones/${SLUG}/_next/`);

  html = html.replace(/<script[^>]*src="https?:\/\/[^"]+"[^>]*>[\s\S]*?<\/script>/gi, '');
  html = html.replace(/<script[^>]*(?:googletagmanager|gtag|hotjar|cookiebot|analytics|fbevents|smartsupp|seznam)[^>]*>[\s\S]*?<\/script>/gi, '');
  html = html.replace(/<noscript><iframe[^>]*googletagmanager[^>]*><\/iframe><\/noscript>/gi, '');
  html = html.replace(/<noscript>[\s\S]*?(?:facebook\.com\/tr)[\s\S]*?<\/noscript>/gi, '');
  html = html.replace(/<div[^>]*(?:cookie-banner|cookie-consent|gdpr|cmplz|CybotCookiebot|complianz)[^>]*>[\s\S]{0,8000}?<\/div>/gi, '');

  html = html.replace(/href="https?:\/\/(?:www\.)?(?:facebook|instagram|youtube|linkedin|twitter|x\.com)\.com\/[^"]*"/gi, 'href="#"');

  for (const [from, to] of Object.entries(LINK_MAP)) {
    html = html.replace(new RegExp(`href="${from.replace(/\//g,'\\/')}"`, 'gi'), `href="${to}"`);
    html = html.replace(new RegExp(`href="https?://(?:www\\.)?vestop\\.cz${from.replace(/\//g,'\\/')}(?=["/?#])`, 'g'), `href="${to}`);
  }
  html = html.replace(/href="https?:\/\/(?:www\.)?vestop\.cz\/[^"]*"/gi, `href="/demo/vestop-demo"`);
  html = html.replace(/href="https?:\/\/(?:www\.)?vestop\.cz"/gi, `href="/demo/vestop-demo"`);

  html = html.replace(/<iframe[^>]*(?:google\.com\/maps|maps\.google)[^>]*>[\s\S]*?<\/iframe>/gi,
    '<div style="background:#e0e0e0;height:300px;display:flex;align-items:center;justify-content:center;color:#666">Mapa</div>');
  html = html.replace(/href="https?:\/\/(?:maps\.google|maps\.app\.goo\.gl|goo\.gl|www\.google\.[a-z]+\/maps)[^"]*"/gi, 'href="#"');

  // Brand scrub
  html = html.replace(/VESTOP(?!\s*Demo)/g, 'VESTOP Demo');
  html = html.replace(/Vestop(?!\s*Demo)/g, 'Vestop Demo');
  html = html.replace(/vestop\.cz/gi, 'demo.local');
  html = html.replace(/\+420\s*\d{3}\s*\d{3}\s*\d{3}/g, '+420 608 288 777');
  html = html.replace(/[a-z0-9._-]+@[a-z0-9.-]+\.(?:cz|com)/gi, 'info@demo.local');

  return html;
}

console.log('\n--- Processing HTML ---');
for (const p of PAGES) {
  const rawPath = path.join(OUT, 'pages', `${p.slug}-raw.html`);
  if (!fs.existsSync(rawPath)) { console.log(`SKIP ${p.slug}`); continue; }
  const raw = fs.readFileSync(rawPath, 'utf8');
  const processed = processHtml(raw);
  fs.writeFileSync(path.join(OUT, 'pages', `${p.slug}.html`), processed);
  const extLeft = (processed.match(/https?:\/\/(?!(?:demo\.local|schema\.org|w3\.org|fonts\.gstatic|fonts\.googleapis))[a-z0-9.-]+\.[a-z]{2,}/gi) || []).length;
  const brandLeft = (processed.match(/vestop\.cz/gi) || []).length;
  console.log(`${p.slug}: ${raw.length}→${processed.length} | ext=${extLeft} brand=${brandLeft}`);
}
console.log('\nMirror done ✅');
