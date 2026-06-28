/**
 * Mirror ambi.cz — Astro SSG + Contember CMS (restaurace Ambiente)
 * FÁZE 1: download all assets via Playwright response interception
 * Run: node scripts/mirror-ambi-assets.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright-core';

const SLUG   = 'ambi';
const ORIGIN = 'https://www.ambi.cz';
const CDN    = 'https://data.eu.cntmbr.com';
const OUT    = `public/clones/${SLUG}`;

const PAGES = [
  { slug: 'home',           url: '/' },
  { slug: 'nase-podniky',   url: '/nase-podniky' },
  { slug: 'pribeh-ambiente',url: '/pribeh-ambiente' },
  { slug: 'kontakty',       url: '/kontakty' },
];

// Maps: original URL → local path
const assetMap = new Map();

function cfImageToLocal(cfUrl) {
  // /cf-image?url=https%3A%2F%2Fdata.eu.cntmbr.com%2Fambiente%2Fambiente-prod%2FUUID.ext&width=...
  try {
    const parsed = new URL(cfUrl, ORIGIN);
    const rawUrl = parsed.searchParams.get('url');
    if (!rawUrl) return null;
    const cdnPath = new URL(rawUrl).pathname; // /ambiente/ambiente-prod/UUID.ext
    const fname = path.basename(cdnPath.split('?')[0]);
    return { dest: `${OUT}/images/${fname}`, local: `/clones/${SLUG}/images/${fname}`, cdnUrl: rawUrl };
  } catch { return null; }
}

function cdnUrlToLocal(url) {
  // https://data.eu.cntmbr.com/ambiente/ambiente-prod/UUID.ext
  try {
    const parsed = new URL(url);
    const fname = path.basename(parsed.pathname.split('?')[0]);
    return { dest: `${OUT}/images/${fname}`, local: `/clones/${SLUG}/images/${fname}` };
  } catch { return null; }
}

fs.mkdirSync(`${OUT}/pages`, { recursive: true });
fs.mkdirSync(`${OUT}/_astro`, { recursive: true });
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
    const ct = resp.headers()['content-type'] || '';

    try {
      // Astro CSS/JS assets: https://www.ambi.cz/_astro/...
      if (url.startsWith(`${ORIGIN}/_astro/`)) {
        const rel = url.replace(ORIGIN, '').split('?')[0];
        const dest = `${OUT}${rel}`;
        if (!fs.existsSync(dest)) {
          const body = await resp.body();
          if (body.length > 0) {
            fs.mkdirSync(path.dirname(dest), { recursive: true });
            fs.writeFileSync(dest, body);
          }
        }
        assetMap.set(url, `/clones/${SLUG}${rel}`);
        return;
      }

      // Fonts: https://www.ambi.cz/fonts/...
      if (url.startsWith(`${ORIGIN}/fonts/`)) {
        const rel = url.replace(ORIGIN, '').split('?')[0];
        const dest = `${OUT}${rel}`;
        if (!fs.existsSync(dest)) {
          const body = await resp.body();
          if (body.length > 0) {
            fs.mkdirSync(path.dirname(dest), { recursive: true });
            fs.writeFileSync(dest, body);
          }
        }
        assetMap.set(url, `/clones/${SLUG}${rel}`);
        return;
      }

      // /cf-image proxy → download from CDN URL
      if (url.startsWith(`${ORIGIN}/cf-image`)) {
        const info = cfImageToLocal(url);
        if (!info) return;
        if (!fs.existsSync(info.dest)) {
          const body = await resp.body();
          if (body.length > 4) fs.writeFileSync(info.dest, body);
        }
        assetMap.set(url, info.local);
        // Also map without width/quality params
        const baseUrl = url.split('&')[0];
        assetMap.set(baseUrl, info.local);
        return;
      }

      // Direct CDN image references
      if (url.startsWith(CDN)) {
        const info = cdnUrlToLocal(url);
        if (!info) return;
        if (!fs.existsSync(info.dest)) {
          const body = await resp.body();
          if (body.length > 4) fs.writeFileSync(info.dest, body);
        }
        assetMap.set(url, info.local);
        assetMap.set(url.split('?')[0], info.local);
        return;
      }
    } catch {}
  });

  await page.goto(`${ORIGIN}${p.url}`, { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(3000);

  const html = await page.content();
  fs.writeFileSync(`${OUT}/pages/${p.slug}-raw.html`, html);
  console.log(`  ${p.slug}: ${html.length} bytes | assets: ${assetMap.size}`);
  await page.close();
  await context.close();
}

await browser.close();
console.log(`\nTotal assets: ${assetMap.size}`);

// --- Post-pass: download missing /cf-image images from raw HTML ---
console.log('\n--- Downloading missing cf-image assets ---');
const allHtml = PAGES.map(p => {
  const f = `${OUT}/pages/${p.slug}-raw.html`;
  return fs.existsSync(f) ? fs.readFileSync(f, 'utf8') : '';
}).join('\n');

// Extract all /cf-image URLs (with url= param)
const cfUrls = new Set([
  ...allHtml.matchAll(/\/cf-image\?url=([^"&\s]+)/g)
].map(m => {
  try { return decodeURIComponent(m[1]); } catch { return m[1]; }
}).filter(u => u.startsWith('https://')));

let downloaded = 0;
for (const cdnUrl of cfUrls) {
  const fname = path.basename(new URL(cdnUrl).pathname);
  const dest = `${OUT}/images/${fname}`;
  const local = `/clones/${SLUG}/images/${fname}`;
  if (fs.existsSync(dest)) { continue; }
  try {
    const res = await fetch(cdnUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible)' }
    });
    if (res.ok) {
      fs.writeFileSync(dest, Buffer.from(await res.arrayBuffer()));
      downloaded++;
    } else {
      console.log(`  WARN ${res.status}: ${cdnUrl}`);
    }
  } catch (e) {
    console.log(`  ERR: ${cdnUrl}: ${e.message}`);
  }
}
console.log(`  Downloaded ${downloaded} additional images`);

// --- Also grab direct CDN references (favicon etc.) ---
const cdnDirectUrls = new Set([
  ...allHtml.matchAll(/https:\/\/data\.eu\.cntmbr\.com\/[^\s"'>,]+/g)
].map(m => m[0].split('"')[0].split("'")[0]));

let downloadedDirect = 0;
for (const url of cdnDirectUrls) {
  const fname = path.basename(new URL(url).pathname);
  const dest = `${OUT}/images/${fname}`;
  if (fs.existsSync(dest)) continue;
  try {
    const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (compatible)' } });
    if (res.ok) {
      fs.writeFileSync(dest, Buffer.from(await res.arrayBuffer()));
      downloadedDirect++;
    }
  } catch {}
}
console.log(`  Downloaded ${downloadedDirect} direct CDN assets`);

// --- Build processed HTML ---
const LINK_MAP = {
  '/':                  `/demo/ambi-bistro-demo`,
  '/nase-podniky':      `/demo/ambi-bistro-demo/nase-podniky`,
  '/pribeh-ambiente':   `/demo/ambi-bistro-demo/pribeh-ambiente`,
  '/kontakty':          `/demo/ambi-bistro-demo/kontakty`,
};

function processHtml(html) {
  // Rewrite /_astro/ paths → local
  html = html.replace(/\/_astro\//g, `/clones/${SLUG}/_astro/`);

  // Rewrite /fonts/ paths → local
  html = html.replace(/(?<=['"(])\/fonts\//g, `/clones/${SLUG}/fonts/`);

  // Rewrite /cf-image?url=... → local image
  html = html.replace(/\/cf-image\?url=([^"&\s]+)[^"')\s]*/g, (match, encoded) => {
    try {
      const cdnUrl = decodeURIComponent(encoded);
      const fname = path.basename(new URL(cdnUrl).pathname);
      return `/clones/${SLUG}/images/${fname}`;
    } catch { return match; }
  });

  // Rewrite direct CDN image references
  html = html.replace(/https:\/\/data\.eu\.cntmbr\.com\/ambiente\/ambiente-prod\/([^"')\s?&]+)/g,
    (_, rest) => `/clones/${SLUG}/images/${path.basename(rest)}`);

  // Strip GTM + tracking scripts
  html = html.replace(/<!-- Google Tag Manager[\s\S]*?<!-- End Google Tag Manager[^\n]*\n?/gi, '');
  html = html.replace(/<script[^>]*(?:googletagmanager|gtag|hotjar|analytics)[^>]*>[\s\S]*?<\/script>/gi, '');
  html = html.replace(/<noscript><iframe[^>]*googletagmanager[^>]*><\/iframe><\/noscript>/gi, '');

  // Strip cookie consent scripts
  html = html.replace(/<script[^>]*(?:cookiebot|cookiehub|osano|usercentrics)[^>]*>[\s\S]*?<\/script>/gi, '');

  // Social links → #
  html = html.replace(/href="https?:\/\/(?:www\.)?(?:instagram|facebook|youtube|twitter|tiktok|linkedin)\.com\/[^"]*"/gi, 'href="#"');

  // External reservations/portals → #rezervace
  html = html.replace(/href="https?:\/\/moje\.ambi\.cz[^"]*"/gi, 'href="#rezervace"');
  html = html.replace(/href="https?:\/\/darkovapoukazka\.ambi\.cz[^"]*"/gi, 'href="#rezervace"');
  html = html.replace(/href="https?:\/\/zapojse\.ambi\.cz[^"]*"/gi, 'href="#"');
  html = html.replace(/href="https?:\/\/(?:www\.)?google\.com\/maps[^"]*"/gi, 'href="#"');

  // Internal link rewrites
  for (const [from, to] of Object.entries(LINK_MAP)) {
    html = html.replace(new RegExp(`href="${from.replace(/\//g,'\\/')}"`, 'g'), `href="${to}"`);
    html = html.replace(new RegExp(`href="${ORIGIN.replace(/\./g,'\\.')}${from.replace(/\//g,'\\/')}(?=["/?#])`, 'g'), `href="${to}`);
  }
  // Remaining ambi.cz/ambiente links → demo home
  html = html.replace(/href="https?:\/\/(?:www\.|cafe-savoy\.|cafesavoy\.)?ambi\.cz\/[^"]*"/gi, `href="/demo/ambi-bistro-demo"`);
  html = html.replace(/href="https?:\/\/(?:www\.|cafe-savoy\.|cafesavoy\.)?ambi\.cz"/gi, `href="/demo/ambi-bistro-demo"`);
  html = html.replace(/href="https?:\/\/cafesavoy\.ambi\.cz[^"]*"/gi, `href="/demo/ambi-bistro-demo"`);

  // Brand scrub
  html = html.replace(/Ambiente(?!\s*Demo)/g, 'Ambiente Demo');
  html = html.replace(/ambiente(?!\s*demo)/g, 'ambiente-demo');
  html = html.replace(/ambi\.cz/gi, 'demo.local');
  html = html.replace(/\+420\s*\d{3}\s*\d{3}\s*\d{3}/g, '+420 608 288 777');
  html = html.replace(/[a-z0-9.]+@ambi\.cz/gi, 'info@demo.local');

  // Strip /en language switcher links
  html = html.replace(/href="\/en[^"]*"/g, 'href="#"');

  // Strip GDPR/legal pages
  html = html.replace(/href="[^"]*zasady-zpracovani[^"]*"/gi, 'href="#"');
  html = html.replace(/href="[^"]*kalendar-akci[^"]*"/gi, 'href="#"');

  // Google Maps links → #
  html = html.replace(/href="https?:\/\/(?:maps\.app\.goo\.gl|maps\.google\.com)[^"]*"/gi, 'href="#"');
  html = html.replace(/href="https?:\/\/(?:www\.)?google\.[a-z]+\/maps[^"]*"/gi, 'href="#"');

  // Ambiente group restaurant links → #
  const ambiRestaurants = ['umumum','lokal','marieb','jidloaradost','korunni','ladegustation',
    'eskaletna','eskakarlin','burgerservice','pizzanuova','bokovka','amaso','dvakohouti',
    'bufetkarlin','zabadomu','vindemariedomu','kohoutidomu','burgerservicedomu','ambiente-demo'];
  for (const r of ambiRestaurants) {
    html = html.replace(new RegExp(`href="https?://[^"]*${r}[^"]*"`, 'gi'), 'href="#"');
  }

  // Strip Hotjar + FB SDK scripts
  html = html.replace(/<script[^>]*(?:hotjar|static\.hotjar|connect\.facebook)[^>]*>[\s\S]*?<\/script>/gi, '');
  html = html.replace(/<script[^>]*src="https?:\/\/connect\.facebook\.net[^"]*"[^>]*><\/script>/gi, '');

  return html;
}

console.log('\n--- Processing HTML ---');
for (const p of PAGES) {
  const raw = fs.readFileSync(`${OUT}/pages/${p.slug}-raw.html`, 'utf8');
  const processed = processHtml(raw);
  fs.writeFileSync(`${OUT}/pages/${p.slug}.html`, processed);
  const extLeft = (processed.match(/https?:\/\/(?!(?:demo\.local|schema\.org|w3\.org|og:))[a-z0-9.-]+\.[a-z]{2,}/gi) || []).length;
  const brandLeft = (processed.match(/ambi\.cz/gi) || []).length;
  console.log(`${p.slug}: ${raw.length}→${processed.length} | ext=${extLeft} brand=${brandLeft}`);
}

console.log('\nMirror done ✅');
console.log(`Assets in: ${OUT}/`);
