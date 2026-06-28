/**
 * Mirror petrovomalovani.cz — malíř, natěrač, tapetování
 * Run: node scripts/mirror-petrovomalovani-assets.mjs (from venom/ dir)
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'url';
import { chromium } from 'playwright-core';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SLUG   = 'petrovomalovani';
const ORIGIN = 'https://www.petrovomalovani.cz';
const OUT    = path.join(__dirname, '..', 'public', 'clones', SLUG);

const PAGES = [
  { slug: 'home',      url: '/' },
  { slug: 'sluzby',    url: '/malovani.php' },
  { slug: 'reference', url: '/reference.php' },
  { slug: 'kontakt',   url: '/kontakt.php' },
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
    if (isJs && /gtm|analytics|pixel|hotjar|cookiebot|gtag|fbevents|smartsupp|seznam|bat\.bing|recaptcha|clarity/.test(base)) return;
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
  try { await page.click('button[class*="accept"], .cookie-accept, #CybotCookiebotDialogBodyLevelButtonLevelOptinAllowAll, .cc-btn, [data-cc="accept-all"], .cmplz-accept', { timeout: 2000 }); } catch {}
  await page.waitForTimeout(1000);

  const html = await page.content();
  fs.writeFileSync(path.join(OUT, 'pages', `${p.slug}-raw.html`), html);
  console.log(`  ${p.slug}: ${html.length} bytes | assets: ${assetMap.size}`);

  const pdfPath = path.join(OUT, 'pages', `${p.slug}.pdf`);
  await page.pdf({ path: pdfPath, printBackground: true, format: 'A4', scale: 0.6 });
  console.log(`  PDF: ${pdfPath}`);

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
  '/':                         `/demo/petrovomalovani-demo`,
  '/malovani.php':             `/demo/petrovomalovani-demo/sluzby`,
  '/lakovani.php':             `/demo/petrovomalovani-demo/sluzby`,
  '/reference.php':            `/demo/petrovomalovani-demo/reference`,
  '/kontakt.php':              `/demo/petrovomalovani-demo/kontakt`,
  '/cenik.php':                `/demo/petrovomalovani-demo/kontakt`,
  '/caste-dotazy.php':         `/demo/petrovomalovani-demo`,
};

function processHtml(html) {
  for (const [orig, local] of assetMap) html = html.replaceAll(orig, local);
  html = html.replace(new RegExp(`(\\/clones\\/${SLUG}\\/[^"'?#\\s]+)\\?[^"'>\\s]*`, 'g'), '$1');

  // WP Rocket lazy-load fix
  html = html.replace(/data-rocket-src="([^"]+)"/g, 'src="$1"');
  html = html.replace(/type="[^"]*rocketlazyloadscript[^"]*"/g, 'type="text/javascript"');

  html = html.replace(/<script[^>]*src="https?:\/\/[^"]+"[^>]*>[\s\S]*?<\/script>/gi, '');
  html = html.replace(/<script[^>]*(?:googletagmanager|gtag|hotjar|cookiebot|analytics|fbevents|smartsupp|seznam|recaptcha|clarity|leady|smartlook|bing|perfmatters)[^>]*>[\s\S]*?<\/script>/gi, '');
  html = html.replace(/<noscript><iframe[^>]*googletagmanager[^>]*><\/iframe><\/noscript>/gi, '');
  html = html.replace(/<noscript>[\s\S]*?(?:facebook\.com\/tr)[\s\S]*?<\/noscript>/gi, '');
  html = html.replace(/<div[^>]*(?:cookie-banner|cookie-consent|gdpr|cmplz|CybotCookiebot|complianz|cc-window|cc-banner)[^>]*>[\s\S]{0,8000}?<\/div>/gi, '');

  html = html.replace(/href="https?:\/\/(?:www\.)?(?:facebook|instagram|youtube|linkedin|twitter|x\.com)\.com\/[^"]*"/gi, 'href="#"');

  for (const [from, to] of Object.entries(LINK_MAP)) {
    html = html.replace(new RegExp(`href="${from.replace(/\//g,'\\/')}"`, 'gi'), `href="${to}"`);
    html = html.replace(new RegExp(`href="https?://(?:www\\.)?petrovomalovani\\.cz${from.replace(/\//g,'\\/')}(?=["/?#])`, 'g'), `href="${to}`);
  }
  html = html.replace(/href="https?:\/\/(?:www\.)?petrovomalovani\.cz\/[^"]*"/gi, `href="/demo/petrovomalovani-demo"`);
  html = html.replace(/href="https?:\/\/(?:www\.)?petrovomalovani\.cz"/gi, `href="/demo/petrovomalovani-demo"`);
  html = html.replace(/https?:\/\/(?:www\.)?petrovomalovani\.cz(\/[^"'\s>]+)/g, `/clones/${SLUG}$1`);

  html = html.replace(/<iframe[^>]*(?:google\.com\/maps|maps\.google)[^>]*>[\s\S]*?<\/iframe>/gi,
    '<div style="background:#e0e0e0;height:300px;display:flex;align-items:center;justify-content:center;color:#666">Mapa</div>');

  // Brand scrub
  html = html.replace(/Petrovo malování(?!\s*Demo)/g, 'Petrovo malování Demo');
  html = html.replace(/petrovomalovani\.cz/gi, 'demo.local');
  html = html.replace(/\+420\s*\d{3}\s*\d{3}\s*\d{3}/g, '+420 608 288 777');
  html = html.replace(/\b7[0-9]{2}\s*[0-9]{3}\s*\d{3}\b/g, '608 288 777');
  html = html.replace(/[a-z0-9._-]+@[a-z0-9.-]+\.(?:cz|com)/gi, 'info@demo.local');
  // Restore paths corrupted by brand scrub
  html = html.replace(/\/clones\/Petrovo malování Demo\//g, `/clones/${SLUG}/`);
  html = html.replace(/(\/clones\/${SLUG}\/[^\s"']*?)demo\.local/g, `$1petrovomalovani.cz`);

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
  const brandLeft = (processed.match(/petrovomalovani\.cz/gi) || []).length;
  console.log(`${p.slug}: ${raw.length}→${processed.length} | ext=${extLeft} brand=${brandLeft}`);
}
console.log('\nMirror done ✅');
