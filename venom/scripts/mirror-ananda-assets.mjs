/**
 * FÁZE 1 — Mirror anandaspa.cz
 * CMS: Laravel + Alpine.js + Vite (custom PHP app)
 * Stránky: home, ajurvedske-procedury, darkovypoukaz
 */
import fs from 'node:fs';
import path from 'node:path';
import https from 'node:https';
import http from 'node:http';
import { chromium } from 'playwright-core';

const SLUG = 'ananda';
const ORIGIN = 'https://anandaspa.cz';
const OUT = `public/clones/${SLUG}`;
const PAGES = [
  { slug: 'home',      url: '/' },
  { slug: 'procedury', url: '/ajurvedske-procedury' },
  { slug: 'voucher',   url: '/darkovypoukaz' },
];

for (const d of ['pages', 'img', 'css', 'js', 'fonts']) {
  fs.mkdirSync(`${OUT}/${d}`, { recursive: true });
}

function dl(url) {
  return new Promise((res, rej) => {
    const lib = url.startsWith('https') ? https : http;
    const chunks = [];
    const req = lib.get(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36', Accept: '*/*', Referer: ORIGIN },
      timeout: 25000,
    }, (r) => {
      if (r.statusCode === 301 || r.statusCode === 302) return dl(r.headers.location).then(res).catch(rej);
      if (r.statusCode !== 200) return rej(new Error(`HTTP ${r.statusCode} ${url.slice(0,60)}`));
      r.on('data', c => chunks.push(c));
      r.on('end', () => res(Buffer.concat(chunks)));
    });
    req.on('error', rej);
    req.on('timeout', () => { req.destroy(); rej(new Error('timeout ' + url.slice(0,60))); });
  });
}

const browser = await chromium.launch({
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  args: ['--no-sandbox'],
});

const cssMap = new Map();
const jsMap  = new Map();
const imgMap = new Map();

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
    const fname = path.basename(rel);
    if (!fname || fname.length < 2) return;
    try {
      const body = await resp.body();
      if (ct.includes('css') || rel.endsWith('.css')) {
        const dest = `${OUT}/css/${fname}`;
        if (!fs.existsSync(dest)) fs.writeFileSync(dest, body);
        cssMap.set(url, `/clones/${SLUG}/css/${fname}`);
        // Also map without query string
        cssMap.set(url.split('?')[0], `/clones/${SLUG}/css/${fname}`);
      } else if ((ct.includes('javascript') || rel.endsWith('.js')) &&
                 !fname.includes('gtm') && !fname.includes('analytics')) {
        const dest = `${OUT}/js/${fname}`;
        if (!fs.existsSync(dest)) fs.writeFileSync(dest, body);
        jsMap.set(url, `/clones/${SLUG}/js/${fname}`);
        jsMap.set(url.split('?')[0], `/clones/${SLUG}/js/${fname}`);
      } else if (ct.includes('image')) {
        const ext2 = rel.split('.').pop()?.split('?')[0] || 'jpg';
        const safeName = fname.replace(/[^a-zA-Z0-9._-]/g, '_');
        const dest = `${OUT}/img/${safeName}`;
        if (!fs.existsSync(dest)) fs.writeFileSync(dest, body);
        imgMap.set(url, `/clones/${SLUG}/img/${safeName}`);
        imgMap.set(url.split('?')[0], `/clones/${SLUG}/img/${safeName}`);
      } else if (ct.includes('font') || ct.includes('woff')) {
        const dest = `${OUT}/fonts/${fname}`;
        if (!fs.existsSync(dest)) fs.writeFileSync(dest, body);
        cssMap.set(url, `/clones/${SLUG}/fonts/${fname}`);
      }
    } catch {}
  });

  await page.goto(`${ORIGIN}${p.url}`, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(5000);

  // Dismiss cookie consent
  try {
    await page.click('[id*="cookie"] button, .cookie-accept, button:has-text("Souhlasím"), button:has-text("OK")', { timeout: 2000 });
    await page.waitForTimeout(500);
  } catch {}

  const html = await page.content();
  fs.writeFileSync(`${OUT}/pages/${p.slug}-raw.html`, html);
  console.log(`  Raw: ${html.length} bytes | css:${cssMap.size} img:${imgMap.size} js:${jsMap.size}`);

  await page.close();
  await context.close();
}

await browser.close();
console.log(`\nTotal: css=${cssMap.size}, js=${jsMap.size}, img=${imgMap.size}`);

// Process HTML
function processHtml(html) {
  // Rewrite all asset URLs
  for (const [orig, local] of [...cssMap, ...jsMap, ...imgMap]) {
    html = html.replaceAll(orig, local);
  }
  // Rewrite remaining origin refs
  html = html.replaceAll(ORIGIN, '');
  html = html.replaceAll('https://anandaspa.cz', '');

  // Strip tracking
  html = html.replace(/<script[^>]*(?:google-analytics|googletagmanager|gtag|hotjar|smartlook|facebook\.net|clarity\.ms)[^>]*>[\s\S]*?<\/script>/gi, '');

  // Strip cookie consent scripts/elements
  html = html.replace(/<script[^>]*(?:cookiebot|cookieconsent|tarteaucitron|axeptio)[^>]*>[\s\S]*?<\/script>/gi, '');
  html = html.replace(/<div[^>]*(?:cookie|consent)[^>]*>[\s\S]{0,2000}?<\/div>/gi, '');

  // Internal nav links
  const linkMap = {
    '/ajurvedske-procedury': '/demo/ananda-demo/procedury',
    '/darkovypoukaz': '/demo/ananda-demo/voucher',
    '/': '/demo/ananda-demo',
  };
  for (const [from, to] of Object.entries(linkMap)) {
    html = html.replace(new RegExp(`href="${from.replace(/\//g, '\\/')}"`, 'g'), `href="${to}"`);
    html = html.replace(new RegExp(`href="https://anandaspa\\.cz${from.replace(/\//g, '\\/')}"`, 'g'), `href="${to}"`);
  }
  // Other internal links → #
  html = html.replace(/href="\/[^"]*"/g, 'href="#"');

  return html;
}

console.log('\n--- Processing HTML ---');
for (const p of PAGES) {
  const raw = fs.readFileSync(`${OUT}/pages/${p.slug}-raw.html`, 'utf8');
  const processed = processHtml(raw);
  fs.writeFileSync(`${OUT}/pages/${p.slug}.html`, processed);
  const extLeft = (processed.match(/https?:\/\/anandaspa\.cz/gi) || []).length;
  const originLeft = (processed.match(/https?:\/\/(?!localhost|data:|blob:)[^\s"'<>]*anandaspa[^\s"'<>]*/gi) || []).length;
  console.log(`${p.slug}: ${raw.length} → ${processed.length} bytes | anandaspa refs: ${originLeft}`);
}

// Rewrite url() refs in CSS
for (const fname of fs.readdirSync(`${OUT}/css`)) {
  let css = fs.readFileSync(`${OUT}/css/${fname}`, 'utf8');
  for (const [orig, local] of [...cssMap, ...imgMap]) {
    css = css.replaceAll(orig, local);
  }
  css = css.replace(/url\((['"]?)https:\/\/anandaspa\.cz([^'")]+)\1\)/gi, (_, q, rel) => {
    const fname2 = path.basename(rel.split('?')[0]);
    if (fs.existsSync(`${OUT}/img/${fname2}`)) return `url(${q}/clones/${SLUG}/img/${fname2}${q})`;
    if (fs.existsSync(`${OUT}/fonts/${fname2}`)) return `url(${q}/clones/${SLUG}/fonts/${fname2}${q})`;
    return `url(${q}${rel}${q})`;
  });
  fs.writeFileSync(`${OUT}/css/${fname}`, css);
}

console.log('\nMirror done ✅');
console.log(`css: ${fs.readdirSync(OUT+'/css').length} | js: ${fs.readdirSync(OUT+'/js').length} | img: ${fs.readdirSync(OUT+'/img').length} | fonts: ${fs.readdirSync(OUT+'/fonts').length}`);
