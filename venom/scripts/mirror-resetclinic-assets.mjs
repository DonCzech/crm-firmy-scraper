/**
 * Mirror resetclinic.cz — Webflow site (fyzioterapie / funkční neurologie)
 * FÁZE 1: download all assets via Playwright response interception
 * Run: node scripts/mirror-resetclinic-assets.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright-core';

const SLUG    = 'resetclinic';
const ORIGIN  = 'https://www.resetclinic.cz';
const CDN     = 'https://cdn.prod.website-files.com';
const SITE_ID = '67eae6b510b7940c86a01508';
const OUT     = `public/clones/${SLUG}`;

const PAGES = [
  { slug: 'home',    url: '/' },
  { slug: 'o-nas',   url: '/o-nas' },
  { slug: 'terapie', url: '/terapie' },
  { slug: 'cenik',   url: '/cenik' },
];

const cdnMap = new Map(); // CDN URL → local path

function cdnRelToLocal(rel) {
  // rel starts with /<site_id>/...
  const stripped = rel.replace(`/${SITE_ID}/`, '');
  return `/clones/${SLUG}/${stripped}`;
}

function saveAsset(url, body, ct) {
  let rel = null;
  let localPath = null;

  if (url.startsWith(CDN)) {
    rel = url.replace(CDN, '').split('?')[0];
    // Decode URL-encoded chars so filenames are filesystem-friendly
    const strippedRaw = rel.replace(`/${SITE_ID}/`, '');
    let stripped;
    try { stripped = decodeURIComponent(strippedRaw); } catch { stripped = strippedRaw; }
    const dest = `${OUT}/${stripped}`;
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    if (!fs.existsSync(dest)) fs.writeFileSync(dest, body);
    localPath = `/clones/${SLUG}/${stripped}`;
  } else if (url.startsWith('https://ajax.googleapis.com/ajax/libs/webfont')) {
    // Skip Google WebFont loader — we'll use local fonts
    return;
  } else if (url.startsWith('https://fonts.googleapis.com') || url.startsWith('https://fonts.gstatic.com')) {
    // Captured and handled separately
    return;
  } else {
    return;
  }

  if (localPath) {
    cdnMap.set(url, localPath);
    cdnMap.set(url.split('?')[0], localPath);
  }
}

fs.mkdirSync(`${OUT}/pages`, { recursive: true });
fs.mkdirSync(`${OUT}/css`, { recursive: true });
fs.mkdirSync(`${OUT}/js`, { recursive: true });
fs.mkdirSync(`${OUT}/fonts`, { recursive: true });
fs.mkdirSync(`${OUT}/images`, { recursive: true });

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
    if (!url.startsWith(CDN)) return;
    const ct = resp.headers()['content-type'] || '';
    try {
      const body = await resp.body();
      if (body.length < 4) return;
      saveAsset(url, body, ct);
    } catch {}
  });

  await page.goto(`${ORIGIN}${p.url}`, { waitUntil: 'networkidle', timeout: 45000 });
  await page.waitForTimeout(2000);

  const html = await page.content();
  fs.writeFileSync(`${OUT}/pages/${p.slug}-raw.html`, html);
  console.log(`  ${p.slug}: ${html.length} bytes | cdn_assets: ${cdnMap.size}`);
  await page.close();
  await context.close();
}

await browser.close();
console.log(`\nTotal CDN assets: ${cdnMap.size}`);

// --- Download all CDN images from srcsets (not caught by Playwright) ---
console.log('\n--- Downloading srcset variants ---');
const allHtmlFiles = PAGES.map(p => fs.readFileSync(`${OUT}/pages/${p.slug}-raw.html`, 'utf8')).join('\n');
const cdnUrls = new Set([...allHtmlFiles.matchAll(/https:\/\/cdn\.prod\.website-files\.com\/[^\s"'>,]+/g)].map(m => m[0].split(' ')[0]));
let downloaded = 0;
for (const url of cdnUrls) {
  if (cdnMap.has(url)) continue; // already downloaded
  const rel = url.replace(CDN, '').split('?')[0];
  const stripped = rel.replace(`/${SITE_ID}/`, '');
  const dest = `${OUT}/${stripped}`;
  if (fs.existsSync(dest)) { cdnMap.set(url, `/clones/${SLUG}/${stripped}`); continue; }
  try {
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    const res = await fetch(url);
    if (res.ok) {
      const buf = Buffer.from(await res.arrayBuffer());
      fs.writeFileSync(dest, buf);
      cdnMap.set(url, `/clones/${SLUG}/${stripped}`);
      downloaded++;
    }
  } catch {}
}
console.log(`  Downloaded ${downloaded} additional CDN assets. Total: ${cdnMap.size}`);

// --- Download Google Fonts locally ---
console.log('\n--- Downloading Google Fonts ---');
const FONT_FAMILIES = [
  { name: 'DM+Serif+Display', weights: '300,400,500,600,700', file: 'dm-serif-display' },
  { name: 'Plus+Jakarta+Sans', weights: '300,400,500,600,700', file: 'plus-jakarta-sans' },
];
for (const f of FONT_FAMILIES) {
  const url = `https://fonts.googleapis.com/css2?family=${f.name}:wght@${f.weights}&display=swap`;
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'text/css,*/*;q=0.1',
    }
  });
  let css = await res.text();
  if (!css.includes('@font-face')) { console.log(`  WARN: ${f.file} no @font-face found`); continue; }
  // Download each woff2 file
  const woff2s = [...css.matchAll(/url\((https:\/\/fonts\.gstatic\.com\/[^)'"]+\.woff2[^)'"]*)\)/g)].map(m => m[1]);
  for (const wurl of woff2s) {
    const fname = path.basename(new URL(wurl).pathname);
    const dest = `${OUT}/fonts/${fname}`;
    if (!fs.existsSync(dest)) {
      const r = await fetch(wurl);
      if (r.ok) fs.writeFileSync(dest, Buffer.from(await r.arrayBuffer()));
    }
    css = css.replace(wurl, `/clones/${SLUG}/fonts/${fname}`);
  }
  fs.writeFileSync(`${OUT}/css/${f.file}.css`, css);
  console.log(`  ${f.file}: ${woff2s.length} font files`);
}

// --- Build processed HTML ---
const LINK_MAP = {
  '/':          `/demo/resetclinic-demo`,
  '/o-nas':     `/demo/resetclinic-demo/o-nas`,
  '/terapie':   `/demo/resetclinic-demo/terapie`,
  '/cenik':     `/demo/resetclinic-demo/cenik`,
  '/workshopy': `/demo/resetclinic-demo`,
  '/kontakt':   `/demo/resetclinic-demo`,
  '/rezervace': `#rezervace`,
  '/blog':      `/demo/resetclinic-demo`,
};

function processHtml(html, pageSlug) {
  // Rewrite CDN URLs to local paths (map-based first, then global fallback)
  for (const [orig, local] of cdnMap) html = html.replaceAll(orig, local);
  // Global fallback: any remaining CDN site-id path → local
  html = html.replace(
    new RegExp(`https://cdn\\.prod\\.website-files\\.com/${SITE_ID}/`, 'g'),
    `/clones/${SLUG}/`
  );
  // Strip bare CDN preconnect (no longer needed)
  html = html.replace(/<link[^>]*cdn\.prod\.website-files\.com[^>]*>/gi, '');

  // Rewrite CloudFront jQuery to local
  html = html.replace(/https?:\/\/d3e54v103j8qbb\.cloudfront\.net\/js\/jquery-3\.5\.1\.min\.[^"]+/g,
    `/clones/${SLUG}/js/jquery-3.5.1.min.js`);

  // Strip GTM + tracking + cookie scripts
  html = html.replace(/<!-- Google Tag Manager[\s\S]*?<!-- End Google Tag Manager[^\n]*\n?/gi, '');
  html = html.replace(/<script[^>]*(?:googletagmanager|gtag|hotjar|cookiebot|CookieScript|cs-\d+|analytics)[^>]*>[\s\S]*?<\/script>/gi, '');
  html = html.replace(/<noscript>[^<]*googletagmanager[^<]*<\/noscript>/gi, '');

  // Replace WebFont loader with proper <link> tag for Google Fonts
  html = html.replace(/<script[^>]*ajax\.googleapis\.com[^>]*webfont[^>]*><\/script>/gi, '');
  html = html.replace(/<script[^>]*>[\s\S]*?WebFont\.load[\s\S]*?<\/script>/gi,
    '<link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet">');

  // Strip cookie consent
  html = html.replace(/<div[^>]*(?:cookie|consent|gdpr)[^>]*>[\s\S]{0,3000}?<\/div>/gi, '');

  // Social links → #
  html = html.replace(/href="https?:\/\/(?:www\.)?(?:facebook|instagram|youtube|tiktok|linkedin|twitter)\.com\/[^"]*"/gi, 'href="#"');

  // Booking / external partner links → #rezervace
  html = html.replace(/href="https?:\/\/[^"]*simplybook\.[^"]*"/gi, 'href="#rezervace"');
  html = html.replace(/href="https?:\/\/(?:www\.)?learntoreset\.com[^"]*"/gi, 'href="#"');
  html = html.replace(/href="https?:\/\/(?:www\.)?luma\.com[^"]*"/gi, 'href="#"');
  html = html.replace(/href="https?:\/\/(?:www\.)?google\.com\/search[^"]*"/gi, 'href="#"');

  // Internal link rewrites
  for (const [from, to] of Object.entries(LINK_MAP)) {
    html = html.replace(new RegExp(`href="${from.replace(/\//g,'\\/')}"`, 'g'), `href="${to}"`);
    html = html.replace(new RegExp(`href="${ORIGIN}${from.replace(/\//g,'\\/')}(?=["/?#])`, 'g'), `href="${to}`);
  }
  // Remaining external resetclinic.cz links → demo home
  html = html.replace(/href="https?:\/\/(?:www\.)?resetclinic\.cz\/[^"]*"/gi, `href="/demo/resetclinic-demo"`);
  html = html.replace(/href="https?:\/\/(?:www\.)?resetclinic\.cz"/gi, `href="/demo/resetclinic-demo"`);

  // Brand scrub (before any URL rewrites that might introduce the domain back)
  html = html.replace(/Reset Fyzio Klinika(?!\s*Demo)/g, 'Reset Fyzio Demo');
  html = html.replace(/Reset Clinic(?!\s*Demo)/g, 'Reset Clinic Demo');
  html = html.replace(/resetclinic\.cz/gi, 'demo.local');
  html = html.replace(/\+420\s*\d{3}\s*\d{3}\s*\d{3}/g, '+420 608 288 777');
  html = html.replace(/[a-z.]+@resetclinic\.cz/gi, 'info@demo.local');

  return html;
}

console.log('\n--- Processing HTML ---');
for (const p of PAGES) {
  const raw = fs.readFileSync(`${OUT}/pages/${p.slug}-raw.html`, 'utf8');
  const processed = processHtml(raw, p.slug);
  fs.writeFileSync(`${OUT}/pages/${p.slug}.html`, processed);
  const extLeft = (processed.match(/https?:\/\/(?!(?:demo\.local|schema\.org|w3\.org|og:image))[a-z0-9.-]+\.[a-z]{2,}/gi) || []).length;
  const brandLeft = (processed.match(/resetclinic\.cz/gi) || []).length;
  console.log(`${p.slug}: ${raw.length}→${processed.length} | ext=${extLeft} brand=${brandLeft}`);
}

console.log('\nMirror done ✅');
console.log(`Assets in: ${OUT}/`);
