/**
 * Mirror restauracehybernska.cz — Shoptet CMS (restaurace)
 * FÁZE 1: download all assets via Playwright response interception
 * Run: node scripts/mirror-hybernska-assets.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright-core';

const SLUG   = 'hybernska';
const ORIGIN = 'https://www.restauracehybernska.cz';
const CDN    = 'https://cdn.myshoptet.com';
const OUT    = `public/clones/${SLUG}`;

const PAGES = [
  { slug: 'home',   url: '/' },
  { slug: 'o-nas',  url: '/o-nas/' },
  { slug: 'menu',   url: '/menu/' },
  { slug: 'akce',   url: '/akce/' },
];

const assetMap = new Map(); // original URL → local path

function saveResponse(url, body) {
  if (body.length < 4) return;

  // Root-relative assets from origin: /user/documents/...
  if (url.startsWith(ORIGIN + '/user/')) {
    const rel = url.replace(ORIGIN, '').split('?')[0];
    const dest = `${OUT}${rel}`;
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    if (!fs.existsSync(dest)) fs.writeFileSync(dest, body);
    const local = `/clones/${SLUG}${rel}`;
    assetMap.set(url, local);
    assetMap.set(url.split('?')[0], local);
    return;
  }

  // CDN assets: css, js, fonts, images
  if (url.startsWith(CDN)) {
    const rel = url.replace(CDN, '').split('?')[0];
    const dest = `${OUT}/cdn${rel}`;
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    if (!fs.existsSync(dest)) fs.writeFileSync(dest, body);
    const local = `/clones/${SLUG}/cdn${rel}`;
    assetMap.set(url, local);
    assetMap.set(url.split('?')[0], local);
    return;
  }
}

fs.mkdirSync(`${OUT}/pages`, { recursive: true });
fs.mkdirSync(`${OUT}/user/documents/css`, { recursive: true });
fs.mkdirSync(`${OUT}/user/documents/images`, { recursive: true });
fs.mkdirSync(`${OUT}/cdn`, { recursive: true });

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
    if (!url.startsWith(ORIGIN) && !url.startsWith(CDN)) return;
    try {
      const body = await resp.body();
      saveResponse(url, body);
    } catch {}
  });

  await page.goto(`${ORIGIN}${p.url}`, { waitUntil: 'networkidle', timeout: 45000 });
  await page.waitForTimeout(2000);

  const html = await page.content();
  fs.writeFileSync(`${OUT}/pages/${p.slug}-raw.html`, html);
  console.log(`  ${p.slug}: ${html.length} bytes | assets: ${assetMap.size}`);
  await page.close();
  await context.close();
}

await browser.close();
console.log(`\nTotal assets: ${assetMap.size}`);

// --- Fix CSS files: rewrite CDN absolute URLs → local ---
function fixCss(content) {
  let css = content;
  for (const [orig, local] of assetMap) css = css.replaceAll(orig, local);
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

walkDir(`${OUT}/user`, (fpath) => {
  if (!fpath.endsWith('.css')) return;
  const fixed = fixCss(fs.readFileSync(fpath, 'utf8'));
  fs.writeFileSync(fpath, fixed);
});
walkDir(`${OUT}/cdn`, (fpath) => {
  if (!fpath.endsWith('.css')) return;
  const fixed = fixCss(fs.readFileSync(fpath, 'utf8'));
  fs.writeFileSync(fpath, fixed);
});
console.log('CSS rewritten');

// --- Build processed HTML ---
const LINK_MAP = {
  '/':                   `/demo/hybernska-demo`,
  '/o-nas/':             `/demo/hybernska-demo/o-nas`,
  '/menu/':              `/demo/hybernska-demo/menu`,
  '/akce/':              `/demo/hybernska-demo/akce`,
  '/napojovy-listek/':   `/demo/hybernska-demo/menu`,
  '/pro-deti/':          `/demo/hybernska-demo`,
  '/galerie/':           `/demo/hybernska-demo`,
  '/kontakt/':           `/demo/hybernska-demo`,
};

function processHtml(html) {
  // Rewrite CDN and origin asset URLs to local paths
  for (const [orig, local] of assetMap) html = html.replaceAll(orig, local);

  // Rewrite remaining root-relative /user/ paths
  html = html.replace(/(['"\s(])\/user\//g, `$1/clones/${SLUG}/user/`);

  // Rewrite CDN URLs still remaining (with query params)
  html = html.replace(
    new RegExp(`https://cdn\\.myshoptet\\.com`, 'g'),
    `/clones/${SLUG}/cdn`
  );

  // Strip query params from local clone asset paths (prevents 404 on ?v=... ?t=... cache busters)
  html = html.replace(/(\/clones\/hybernska\/[^"'?#\s]+)\?[^"'>\s]*/g, '$1');

  // Normalize CDN user path: www.restauracehybernska.cz → www.demo.local (BEFORE brand scrub)
  html = html.replace(/\/clones\/hybernska\/cdn\/usr\/www\.restauracehybernska\.cz\//g,
    '/clones/hybernska/cdn/usr/www.demo.local/');

  // Strip GTM + tracking scripts
  html = html.replace(/<!-- Google Tag Manager[\s\S]*?<!-- End Google Tag Manager[^\n]*\n?/gi, '');
  html = html.replace(/<script[^>]*(?:googletagmanager|gtag|hotjar|analytics)[^>]*>[\s\S]*?<\/script>/gi, '');
  html = html.replace(/<noscript><iframe[^>]*googletagmanager[^>]*><\/iframe><\/noscript>/gi, '');
  html = html.replace(/<script[^>]*src="https?:\/\/connect\.facebook\.net[^"]*"[^>]*><\/script>/gi, '');

  // Strip cookie bar / GDPR
  html = html.replace(/<div[^>]*(?:cookie|gdpr|consent)[^>]*>[\s\S]{0,3000}?<\/div>/gi, '');

  // Social links → #
  html = html.replace(/href="https?:\/\/(?:www\.)?(?:instagram|facebook|youtube|twitter)\.com\/[^"]*"/gi, 'href="#"');

  // Booking links → #rezervace
  html = html.replace(/href="https?:\/\/[^"]*(?:bookio|storekeeper|rezervace)[^"]*"/gi, 'href="#rezervace"');
  html = html.replace(/href="https?:\/\/[^"]*(?:objednat|reservation|booking)[^"]*"/gi, 'href="#rezervace"');

  // Strip login/register/kosik links
  html = html.replace(/href="\/login[^"]*"/g, 'href="#"');
  html = html.replace(/href="\/registrace[^"]*"/g, 'href="#"');
  html = html.replace(/href="\/kosik[^"]*"/g, 'href="#"');
  html = html.replace(/href="\/klient[^"]*"/g, 'href="#"');

  // Strip GDPR link
  html = html.replace(/href="[^"]*ochrana[^"]*"/gi, 'href="#"');
  html = html.replace(/href="[^"]*podminky[^"]*"/gi, 'href="#"');

  // Internal link rewrites
  for (const [from, to] of Object.entries(LINK_MAP)) {
    html = html.replace(new RegExp(`href="${from.replace(/\//g,'\\/')}"`, 'g'), `href="${to}"`);
    html = html.replace(new RegExp(`href="${ORIGIN.replace(/\./g,'\\.')}${from.replace(/\//g,'\\/')}(?=["/?#])`, 'g'), `href="${to}`);
  }
  // Remaining origin links → demo home
  html = html.replace(/href="https?:\/\/(?:www\.)?restauracehybernska\.cz\/[^"]*"/gi, `href="/demo/hybernska-demo"`);
  html = html.replace(/href="https?:\/\/(?:www\.)?restauracehybernska\.cz"/gi, `href="/demo/hybernska-demo"`);

  // Brand scrub
  html = html.replace(/Restaurace Hybernská(?!\s*Demo)/g, 'Restaurace Hybernská Demo');
  html = html.replace(/Hybernská(?!\s*Demo)/g, 'Hybernská Demo');
  html = html.replace(/restauracehybernska\.cz/gi, 'demo.local');
  html = html.replace(/\+420\s*\d{3}\s*\d{3}\s*\d{3}/g, '+420 608 288 777');
  html = html.replace(/[a-z0-9.]+@(?:restauracehybernska|hybernska)\.[a-z]+/gi, 'info@demo.local');

  return html;
}

console.log('\n--- Processing HTML ---');
for (const p of PAGES) {
  const raw = fs.readFileSync(`${OUT}/pages/${p.slug}-raw.html`, 'utf8');
  const processed = processHtml(raw);
  fs.writeFileSync(`${OUT}/pages/${p.slug}.html`, processed);
  const extLeft = (processed.match(/https?:\/\/(?!(?:demo\.local|schema\.org|w3\.org))[a-z0-9.-]+\.[a-z]{2,}/gi) || []).length;
  const brandLeft = (processed.match(/restauracehybernska\.cz/gi) || []).length;
  console.log(`${p.slug}: ${raw.length}→${processed.length} | ext=${extLeft} brand=${brandLeft}`);
}

console.log('\nMirror done ✅');
console.log(`Assets in: ${OUT}/`);
