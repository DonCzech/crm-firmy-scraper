/**
 * Mirror brokerconsulting.cz — Finanční poradce
 * Run: node scripts/mirror-brokerconsulting-assets.mjs 2>/dev/null
 */
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright-core';

const SLUG   = 'brokerconsulting';
const ORIGIN = 'https://www.brokerconsulting.cz';
const OUT    = `public/clones/${SLUG}`;

const PAGES = [
  { slug: 'home',      url: '/' },
  { slug: 'o-nas',     url: '/o-spolecnosti/' },
  { slug: 'sluzby',    url: '/nase-sluzby/' },
  { slug: 'kariery',   url: '/kariery/' },
  { slug: 'kontakt',   url: '/kontakt/' },
];

const cssMap = new Map();
const jsMap  = new Map();
const imgMap = new Map();

const JS_BLACKLIST = [
  'gtm','gtag','analytics','pixel','hotjar','clarity','facebook',
  'complianz','cmplz','cookieblocker','cookiebot','cookieconsent',
  'recaptcha','grecaptcha','adsense','doubleclick','hubspot','intercom'
];
const CSS_BLACKLIST = ['complianz','cmplz','cookieblocker','banner-{banner_id}'];

function saveAsset(rel, body, ct) {
  if (!rel || body.length < 4) return;
  const relClean = rel.split('?')[0];
  const fname = path.basename(relClean);
  if (!fname || fname.length < 2) return;

  if (ct.includes('css') || relClean.endsWith('.css')) {
    if (CSS_BLACKLIST.some(b => relClean.includes(b))) return;
    const dest = `${OUT}${relClean}`;
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    if (!fs.existsSync(dest)) fs.writeFileSync(dest, body);
    const localUrl = `/clones/${SLUG}${relClean}`;
    cssMap.set(ORIGIN + rel, localUrl);
    cssMap.set(ORIGIN + relClean, localUrl);

  } else if (ct.includes('javascript') || relClean.endsWith('.js')) {
    if (JS_BLACKLIST.some(b => fname.toLowerCase().includes(b))) return;
    const dest = `${OUT}${relClean}`;
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    if (!fs.existsSync(dest)) fs.writeFileSync(dest, body);
    const localUrl = `/clones/${SLUG}${relClean}`;
    jsMap.set(ORIGIN + rel, localUrl);
    jsMap.set(ORIGIN + relClean, localUrl);

  } else if (ct.includes('image') || relClean.match(/\.(jpg|jpeg|png|webp|svg|gif|ico)$/i)) {
    const dest = `${OUT}${relClean}`;
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    if (!fs.existsSync(dest)) fs.writeFileSync(dest, body);
    const localUrl = `/clones/${SLUG}${relClean}`;
    imgMap.set(ORIGIN + rel, localUrl);
    imgMap.set(ORIGIN + relClean, localUrl);

  } else if (ct.includes('font') || ct.includes('woff') || relClean.match(/\.(woff2?|ttf|otf|eot)$/i)) {
    const dest = `${OUT}${relClean}`;
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    if (!fs.existsSync(dest)) fs.writeFileSync(dest, body);
  }
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
    if (!url.startsWith(ORIGIN)) return;
    const ct = resp.headers()['content-type'] || '';
    const rel = url.replace(ORIGIN, '');
    try {
      const body = await resp.body();
      if (body.length < 4) return;
      saveAsset(rel, body, ct);
    } catch {}
  });

  try {
    await page.goto(`${ORIGIN}${p.url}`, { waitUntil: 'networkidle', timeout: 50000 });
    await page.waitForTimeout(2500);
  } catch (e) {
    console.log(`  WARN: ${e.message}`);
    try { await page.waitForTimeout(1000); } catch {}
  }

  const html = await page.content();
  fs.writeFileSync(`${OUT}/pages/${p.slug}-raw.html`, html);
  console.log(`  ${p.slug}: ${html.length} bytes | css:${cssMap.size} img:${imgMap.size} js:${jsMap.size}`);
  await page.close();
  await context.close();
}

await browser.close();
console.log(`\nTotal: css=${cssMap.size} js=${jsMap.size} img=${imgMap.size}`);

function fixCss(content) {
  let css = content;
  css = css.replace(/url\((['"]?)https?:\/\/(?:www\.)?brokerconsulting\.cz(\/[^'")]+)\1\)/gi,
    (_, q, r) => `url(${q}/clones/${SLUG}${r.split('?')[0]}${q})`);
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

walkDir(`${OUT}/wp-content`, (fpath) => {
  if (!fpath.endsWith('.css')) return;
  const fixed = fixCss(fs.readFileSync(fpath, 'utf8'));
  fs.writeFileSync(fpath, fixed);
});
walkDir(`${OUT}/themes`, (fpath) => {
  if (!fpath.endsWith('.css')) return;
  const fixed = fixCss(fs.readFileSync(fpath, 'utf8'));
  fs.writeFileSync(fpath, fixed);
});
// also handle non-WP paths
walkDir(`${OUT}/assets`, (fpath) => {
  if (!fpath.endsWith('.css')) return;
  const fixed = fixCss(fs.readFileSync(fpath, 'utf8'));
  fs.writeFileSync(fpath, fixed);
});
walkDir(`${OUT}/css`, (fpath) => {
  if (!fpath.endsWith('.css')) return;
  const fixed = fixCss(fs.readFileSync(fpath, 'utf8'));
  fs.writeFileSync(fpath, fixed);
});

const LINK_MAP = {
  '/':                  `/demo/brokerconsulting-demo`,
  '/o-spolecnosti/':    `/demo/brokerconsulting-demo/o-nas`,
  '/nase-sluzby/':      `/demo/brokerconsulting-demo/sluzby`,
  '/kariery/':          `/demo/brokerconsulting-demo/kariery`,
  '/kontakt/':          `/demo/brokerconsulting-demo/kontakt`,
};

function processHtml(html) {
  for (const [orig, local] of [...cssMap, ...jsMap, ...imgMap]) html = html.replaceAll(orig, local);
  html = html.replaceAll(ORIGIN, '');
  html = html.replaceAll('https://brokerconsulting.cz', '');

  html = html.replace(/<script[^>]*(?:googletagmanager|gtag|hotjar|complianz|cmplz|cookiebot|cookieblocker|clarity\.ms|facebook\.net|hubspot|intercom)[^>]*>[\s\S]*?<\/script>/gi, '');
  html = html.replace(/<noscript>[^<]*(?:googletagmanager|gtm)[^<]*<\/noscript>/gi, '');
  html = html.replace(/<noscript><iframe[^>]*googletagmanager[^>]*><\/iframe><\/noscript>/gi, '');
  html = html.replace(/<link[^>]*(?:complianz|cookieblocker|cmplz|banner-\{banner_id\})[^>]*>/gi, '');
  for (const cls of ['cmplz-', 'cc-nb', 'cookie-notice', 'cn-notice','cookiebanner','cookie-bar','cookie-popup','hs-cookie']) {
    const re = new RegExp(`<div[^>]*${cls}[^>]*>[\\s\\S]{0,8000}?<\\/div>`, 'gi');
    html = html.replace(re, '');
  }
  html = html.replace(/href="https?:\/\/(?:www\.)?(?:facebook|instagram|youtube|tiktok|twitter|linkedin)\.com\/[^"]*"/gi, 'href="#"');
  html = html.replace(/<link[^>]*wp-json[^>]*>/gi, '');

  for (const [from, to] of Object.entries(LINK_MAP)) {
    html = html.replace(new RegExp(`href="${ORIGIN}${from.replace(/\//g,'\\/')}"`, 'gi'), `href="${to}"`);
    html = html.replace(new RegExp(`href="${from.replace(/\//g,'\\/')}"`, 'g'), `href="${to}"`);
  }
  html = html.replace(/href="https?:\/\/(?:www\.)?brokerconsulting\.cz\/[^"]*"/gi, `href="/demo/brokerconsulting-demo"`);

  // Brand scrub
  html = html.replace(/Broker Consulting(?!\s*Demo)/gi, 'Demo Finance');
  html = html.replace(/BrokerConsulting(?!\s*Demo)/gi, 'Demo Finance');
  html = html.replace(/brokerconsulting\.cz/gi, 'demo.local');
  html = html.replace(/\+420\s*\d{3}\s*\d{3}\s*\d{3}/g, '+420 608 288 777');
  html = html.replace(/[a-z._%+-]+@brokerconsulting\.cz/gi, 'info@demo.local');
  html = html.replace(/[a-z._%+-]+@(?:broker-consulting|brokerconsulting)\.cz/gi, 'info@demo.local');

  html = html.replace(/(?<!\/clones\/brokerconsulting)\/wp-content\//g, '/clones/brokerconsulting/wp-content/');
  html = html.replace(/(?<!\/clones\/brokerconsulting)\/wp-includes\//g, '/clones/brokerconsulting/wp-includes/');

  return html;
}

console.log('\n--- Processing HTML ---');
for (const p of PAGES) {
  const rawPath = `${OUT}/pages/${p.slug}-raw.html`;
  if (!fs.existsSync(rawPath)) { console.log(`SKIP: ${p.slug}`); continue; }
  const raw = fs.readFileSync(rawPath, 'utf8');
  const processed = processHtml(raw);
  fs.writeFileSync(`${OUT}/pages/${p.slug}.html`, processed);
  const extLeft = (processed.match(/https?:\/\/(?!(?:demo\.local|schema\.org|w3\.org|fonts\.googleapis|fonts\.gstatic))[a-z0-9.-]+\.[a-z]{2,}/gi) || []).length;
  const brandLeft = (processed.match(/brokerconsulting\.cz/gi) || []).length;
  console.log(`${p.slug}: ${raw.length}→${processed.length} | ext=${extLeft} brand=${brandLeft}`);
}

console.log('\nMirror done ✅');
console.log(`Assets in: ${OUT}/`);
