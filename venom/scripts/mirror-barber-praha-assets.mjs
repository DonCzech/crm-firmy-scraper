/**
 * Fáze 1 — Mirror assets z barberpraha.online → public/clones/barber-praha/
 * WordPress + Divi 4.27.6 — CSS je inline v HTML (263KB), netřeba separátní CSS soubor.
 *
 * Spustit: node scripts/mirror-barber-praha-assets.mjs
 * Výstup:  public/clones/barber-praha/...  (obrázky + fonty)
 *          /tmp/barber-praha-home.html      (zpracované HTML pro seed)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { mkdirSync, existsSync, writeFileSync } from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const CLONE_DIR = path.join(ROOT, 'public/clones/barber-praha');
const ORIGIN = 'https://barberpraha.online';
const CLONE_PATH = '/clones/barber-praha';

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
  'Accept-Language': 'cs,en;q=0.9',
};

function log(msg) { console.log(`[${new Date().toISOString()}] ${msg}`); }

async function download(url, destPath) {
  if (existsSync(destPath)) { log(`  SKIP (exists): ${path.basename(destPath)}`); return true; }
  mkdirSync(path.dirname(destPath), { recursive: true });
  log(`  GET: ${url}`);
  try {
    const res = await fetch(url, { headers: HEADERS, signal: AbortSignal.timeout(30000) });
    if (!res.ok) { log(`  WARN: ${res.status} ${url}`); return false; }
    const buf = await res.arrayBuffer();
    fs.writeFileSync(destPath, Buffer.from(buf));
    log(`  OK: ${path.basename(destPath)} (${(buf.byteLength/1024).toFixed(1)}KB)`);
    return true;
  } catch(e) { log(`  ERR: ${url}: ${e.message}`); return false; }
}

async function downloadText(url) {
  const res = await fetch(url, { headers: HEADERS, signal: AbortSignal.timeout(30000) });
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  return res.text();
}

// ── Image URLs to download ────────────────────────────────────────────────────
const IMAGE_URLS = [
  // Hero images (will be replaced by AI in Fáze 6)
  `${ORIGIN}/wp-content/uploads/2020/10/Barbershop-Homepage-Hero-Image-2.jpg`,
  `${ORIGIN}/wp-content/uploads/2020/10/Barbershop-Homepage-Hero-Image-4.jpg`,
  // Gallery images (will be replaced by AI)
  `${ORIGIN}/wp-content/uploads/2020/10/Barbershop-Homepage-Gallery-6.jpg`,
  `${ORIGIN}/wp-content/uploads/2020/10/Barbershop-Homepage-Gallery-7.jpg`,
  `${ORIGIN}/wp-content/uploads/2020/10/Barbershop-Homepage-Gallery-8.jpg`,
  `${ORIGIN}/wp-content/uploads/2020/10/Barbershop-Homepage-Gallery-9.jpg`,
  `${ORIGIN}/wp-content/uploads/2020/10/Barbershop-Homepage-Gallery-10.jpg`,
  `${ORIGIN}/wp-content/uploads/2020/10/Barbershop-Homepage-Gallery-11.jpg`,
  // Team photos (will be replaced by AI)
  `${ORIGIN}/wp-content/uploads/2026/05/01.webp`,
  `${ORIGIN}/wp-content/uploads/2026/05/02.webp`,
  `${ORIGIN}/wp-content/uploads/2026/05/03.webp`,
  `${ORIGIN}/wp-content/uploads/2026/05/04.webp`,
  `${ORIGIN}/wp-content/uploads/2026/05/05.webp`,
  `${ORIGIN}/wp-content/uploads/2026/05/06.webp`,
  `${ORIGIN}/wp-content/uploads/2026/05/07.webp`,
  `${ORIGIN}/wp-content/uploads/2026/05/08.webp`,
  // Icons (SVG — keep)
  `${ORIGIN}/wp-content/uploads/2020/11/barber-icon-01.svg`,
  `${ORIGIN}/wp-content/uploads/2020/11/barber-icon-04.svg`,
  `${ORIGIN}/wp-content/uploads/2020/11/barber-icon-08.svg`,
  `${ORIGIN}/wp-content/uploads/2020/11/barber-icon-09.svg`,
  `${ORIGIN}/wp-content/uploads/2020/11/separator-01.svg`,
  // Favicon
  `${ORIGIN}/wp-content/uploads/2021/03/cropped-favicon-150x150.png`,
];

// ── Google Fonts — Bebas Neue + Open Sans + Lato ──────────────────────────────
async function localizeGoogleFonts() {
  log('Localizing Google Fonts...');
  const fontsDir = path.join(CLONE_DIR, 'fonts');
  mkdirSync(fontsDir, { recursive: true });

  const families = [
    { name: 'Bebas Neue', weights: ['400'], style: 'normal' },
    { name: 'Open Sans', weights: ['300', '400', '500', '600', '700', '800'], style: 'normal' },
    { name: 'Lato', weights: ['100', '300', '400', '700', '900'], style: 'normal' },
  ];

  const cssLines = [];
  for (const fam of families) {
    for (const weight of fam.weights) {
      const apiUrl = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(fam.name)}:wght@${weight}&display=swap`;
      let css;
      try {
        const res = await fetch(apiUrl, {
          headers: { ...HEADERS, 'Accept': 'text/css' },
          signal: AbortSignal.timeout(15000),
        });
        css = await res.text();
      } catch(e) { log(`  WARN: font fetch failed: ${fam.name} ${weight}`); continue; }

      // Extract woff2 URLs and download
      const woffUrls = [...css.matchAll(/url\(([^)]+\.woff2[^)]*)\)/g)].map(m => m[1].replace(/['"]/g, ''));
      for (const woffUrl of woffUrls) {
        const fname = `${fam.name.replace(/\s+/g, '-').toLowerCase()}-${weight}.woff2`;
        const dest = path.join(fontsDir, fname);
        await download(woffUrl, dest);
        // Replace URL in CSS
        css = css.replace(woffUrl, `${CLONE_PATH}/fonts/${fname}`);
      }
      cssLines.push(css);
    }
  }
  const fontsCssPath = path.join(CLONE_DIR, 'fonts.css');
  writeFileSync(fontsCssPath, cssLines.join('\n'), 'utf-8');
  log(`  Saved fonts.css (${cssLines.length} font-face blocks)`);
}

// ── HTML processing ───────────────────────────────────────────────────────────
function buildHtml(rawHtml) {
  // Divi: 227KB CSS is in <head> inline <style> blocks — extract and prepend to body
  const headMatch = rawHtml.match(/<head[^>]*>([\s\S]*?)<\/head>/i);
  const headStyles = headMatch
    ? [...headMatch[1].matchAll(/<style[^>]*>[\s\S]*?<\/style>/gi)].map(m => m[0]).join('\n')
    : '';

  const bodyMatch = rawHtml.match(/<body[^>]*>([\s\S]*)<\/body>/i);
  if (!bodyMatch) throw new Error('No <body> found');
  let html = headStyles + '\n' + bodyMatch[1];

  // 2. Remove ALL tracking & analytics scripts
  html = html.replace(/<!-- Google Tag Manager[\s\S]*?End Google Tag Manager -->/gi, '');
  html = html.replace(/<!-- Google Tag Manager \(noscript\)[\s\S]*?End Google Tag Manager \(noscript\) -->/gi, '');
  html = html.replace(/<script[^>]*googletagmanager[^>]*>[\s\S]*?<\/script>/gi, '');
  html = html.replace(/<script[^>]*gtag[^>]*>[\s\S]*?<\/script>/gi, '');
  html = html.replace(/<script[^>]*dataLayer[^>]*>[\s\S]*?<\/script>/gi, '');
  html = html.replace(/<script[^>]*cookie-script[^>]*>[\s\S]*?<\/script>/gi, '');
  html = html.replace(/<script[^>]*cookiescript[^>]*>[\s\S]*?<\/script>/gi, '');
  html = html.replace(/<script[^>]*gstatic[^>]*>[\s\S]*?<\/script>/gi, '');
  html = html.replace(/<script[^>]*googleadservices[^>]*>[\s\S]*?<\/script>/gi, '');
  html = html.replace(/<script[^>]*doubleclick[^>]*>[\s\S]*?<\/script>/gi, '');
  html = html.replace(/<noscript>[\s\S]*?<\/noscript>/gi, '');

  // 3. Remove Divi Pixel plugin scripts (external CDN)
  html = html.replace(/<script[^>]*divi-pixel[^>]*>[\s\S]*?<\/script>/gi, '');
  html = html.replace(/<link[^>]*divi-pixel[^>]*>/gi, '');

  // 4. Remove WP admin bar
  html = html.replace(/<div[^>]*id="wpadminbar"[\s\S]*?<\/div>\s*<\/div>/gi, '');
  html = html.replace(/<style[^>]*#wpadminbar[\s\S]*?<\/style>/gi, '');

  // 5. Remove cookie consent popup/script
  html = html.replace(/<div[^>]*cookie[^>]*>[\s\S]*?<\/div>/gi, '');
  html = html.replace(/<script[^>]*cc4d84e[^>]*>[\s\S]*?<\/script>/gi, '');

  // 6. Replace external booking link with demo CTA
  html = html.replace(/href="https?:\/\/barbersmichov\.snippet\.myfox\.cz[^"]*"/g, 'href="#rezervace"');
  html = html.replace(/href="https?:\/\/[^"]*myfox[^"]*"/g, 'href="#rezervace"');

  // 7. Fix all barberpraha.online asset URLs → local paths
  html = html.replace(/https?:\/\/barberpraha\.online(\/wp-content\/[^"'\s>)]+)/g, (_, p) => `${CLONE_PATH}${p.split('?')[0]}`);
  html = html.replace(/https?:\/\/barberpraha\.online(\/wp-includes\/[^"'\s>)]+)/g, (_, p) => `${CLONE_PATH}${p.split('?')[0]}`);

  // 8a. Replace Google Fonts link with local fonts.css
  html = html.replace(/<link[^>]*fonts\.googleapis\.com[^>]*>/gi, `<link rel="stylesheet" href="${CLONE_PATH}/fonts.css">`);
  html = html.replace(/<link[^>]*fonts\.gstatic\.com[^>]*>/gi, '');

  // 9. Remove external scripts that can't be localized (gstatic, google ads, etc.)
  html = html.replace(/<script[^>]*src="https?:\/\/www\.gstatic\.com[^"]*"[^>]*><\/script>/gi, '');
  html = html.replace(/<script[^>]*src="https?:\/\/www\.googletagmanager\.com[^"]*"[^>]*><\/script>/gi, '');
  html = html.replace(/<script[^>]*src="https?:\/\/cdn\.cookie-script\.com[^"]*"[^>]*><\/script>/gi, '');

  // 10. Remove announcement bar (specific to current business — "1.5. a 8.5.2026 MÁME OTEVŘENO CELÝ DEN")
  html = html.replace(/<div[^>]*et_pb_text[^>]*>[\s\S]*?MÁME OTEVŘENO CELÝ DEN[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/gi, '');

  // 11. DEMO CONTENT — replace real contact data
  html = html.replace(/Ostrovského 1332\/4/g, 'Demo ulice 12');
  html = html.replace(/Praha 5 Smíchov 150 00/g, 'Praha 2, 120 00');
  html = html.replace(/\+420 778 553 280/g, '+420 608 288 777');
  html = html.replace(/barbersmichov@gmail\.com/g, 'info@demo.local');
  html = html.replace(/IČ\s*:\s*70357412/g, 'IČ: 00000000');

  // 12. DEMO — replace opening hours (real: Pondělí-neděle 9:00-20:00)
  html = html.replace(/Pondělí-neděle:\s*9:00\s*(?:&#8211;|–|-)\s*20:00/g, 'Po–Pá: 09:00–18:00 &nbsp; So: 10:00–15:00 &nbsp; Ne: zavřeno');

  // 13. DEMO — replace prices (±15% shuffle to avoid 1:1 copy)
  html = html.replace(/490\s*Kč/g, '520 Kč');
  html = html.replace(/170\s*Kč/g, '180 Kč');
  html = html.replace(/450\s*Kč/g, '480 Kč');
  html = html.replace(/250\s*Kč/g, '270 Kč');
  html = html.replace(/350\s*Kč/g, '380 Kč');

  // 14. DEMO — replace hero subtitle / brand taglines
  html = html.replace(/HOLIČ PRO MUŽE - BARBER PRAHA/gi, 'DEMO ŠABLONA — BARBERSHOP');
  html = html.replace(/Barber Shop Smíchov/gi, 'Demo Barbershop');
  html = html.replace(/BARBER SHOP SMÍCHOV/gi, 'DEMO BARBERSHOP');
  html = html.replace(/Barber Praha/gi, 'Demo Barbershop');
  html = html.replace(/barberpraha/gi, 'demo-barber');

  // 15. DEMO — replace logo (webp logos → inline SVG demo logo)
  html = html.replace(
    /<img[^>]*logo-web[^>]*>/gi,
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 220 60" style="height:50px;display:block">
      <text x="10" y="28" font-family="'Bebas Neue',sans-serif" font-size="26" fill="#c9a84c" letter-spacing="3">BARBER</text>
      <text x="10" y="52" font-family="'Bebas Neue',sans-serif" font-size="18" fill="#fff" letter-spacing="5">DEMO ŠABLONA</text>
      <line x1="10" y1="32" x2="210" y2="32" stroke="#c9a84c" stroke-width="1" opacity="0.5"/>
    </svg>`
  );

  // 16. DEMO — counter values (static, JS counters won't run in demo)
  // Make counters show static demo numbers
  html = html.replace(/data-count-to='999'/g, "data-count-to='500'");
  html = html.replace(/data-count-to='7'/g, "data-count-to='5'");
  html = html.replace(/data-count-to='29'/g, "data-count-to='24'");

  // 17. Add demo watermark hint to hero subtitle
  html = html.replace(
    /Ukázka šablony pro prémiový barbershop/g,
    'Ukázka šablony pro prémiový barbershop'
  );

  // 8b. Add et-cache CSS links (localized) at the top — critical for Divi layout
  const etCssLinks = `
<link rel="stylesheet" href="${CLONE_PATH}/css/et-core-unified.min.css">
<link rel="stylesheet" href="${CLONE_PATH}/css/et-divi-dynamic.css">
`;
  html = etCssLinks + html;

  // 18. Remove WP-specific meta/link noise (security hardening)
  html = html.replace(/<link[^>]*wp-json[^>]*>/gi, '');
  html = html.replace(/<link[^>]*wlwmanifest[^>]*>/gi, '');
  html = html.replace(/<link[^>]*EditURI[^>]*>/gi, '');
  html = html.replace(/<meta[^>]*generator[^>]*Divi[^>]*>/gi, '<meta name="generator" content="Venom SaaS">');
  html = html.replace(/<meta[^>]*generator[^>]*WordPress[^>]*>/gi, '');

  return html;
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  mkdirSync(CLONE_DIR, { recursive: true });
  log('=== FÁZE 1: Mirror barber-praha assets ===');

  // Step 1: Download homepage HTML
  log('\n[1/4] Fetching homepage HTML...');
  let rawHtml;
  try {
    rawHtml = await downloadText(ORIGIN + '/');
  } catch(e) {
    log(`ERR: Failed to fetch homepage: ${e.message}`);
    process.exit(1);
  }
  log(`  Raw HTML: ${(rawHtml.length/1024).toFixed(0)}KB`);

  // Step 2: Download et-cache CSS files + images
  log('\n[2/4] Downloading CSS + images...');
  const cssDir = path.join(CLONE_DIR, 'css');
  mkdirSync(cssDir, { recursive: true });

  // Download et-cache CSS and fix internal paths
  const etCssFiles = [
    {
      url: `${ORIGIN}/wp-content/et-cache/645/et-core-unified-645.min.css?ver=1778504877`,
      dest: path.join(cssDir, 'et-core-unified.min.css'),
    },
    {
      url: `${ORIGIN}/wp-content/et-cache/645/et-divi-dynamic-tb-662-645.css?ver=1778504877`,
      dest: path.join(cssDir, 'et-divi-dynamic.css'),
    },
  ];
  for (const { url, dest } of etCssFiles) {
    if (!existsSync(dest)) {
      log(`  GET CSS: ${path.basename(dest)}`);
      try {
        const res = await fetch(url, { headers: HEADERS, signal: AbortSignal.timeout(30000) });
        if (res.ok) {
          let css = await res.text();
          // Fix relative URLs in CSS → absolute local paths
          css = css.replace(/url\(['"]?(\/wp-content\/[^'")\s]+)['"]?\)/g, `url('${CLONE_PATH}$1')`);
          css = css.replace(/url\(['"]?(https?:\/\/barberpraha\.online\/wp-content\/[^'")\s]+)['"]?\)/g,
            (_, p) => `url('${CLONE_PATH}${p.replace(/^https?:\/\/barberpraha\.online/, '').split('?')[0]}')`);
          writeFileSync(dest, css, 'utf-8');
          log(`  OK: ${path.basename(dest)} (${(css.length/1024).toFixed(0)}KB)`);
        }
      } catch(e) { log(`  WARN: ${e.message}`); }
    } else { log(`  SKIP (exists): ${path.basename(dest)}`); }
  }

  for (const url of IMAGE_URLS) {
    const relPath = url.replace(ORIGIN, '');
    const destPath = path.join(CLONE_DIR, relPath);
    await download(url, destPath);
  }

  // Step 3: Localize Google Fonts
  log('\n[3/4] Localizing Google Fonts...');
  await localizeGoogleFonts();

  // Step 4: Process HTML
  log('\n[4/4] Processing HTML...');
  const processedHtml = buildHtml(rawHtml);
  const outPath = '/tmp/barber-praha-home.html';
  writeFileSync(outPath, processedHtml, 'utf-8');
  log(`  Saved: ${outPath} (${(processedHtml.length/1024).toFixed(0)}KB)`);

  // Summary
  log('\n=== HOTOVO ===');
  log(`Clone dir: ${CLONE_DIR}`);
  log(`HTML: ${outPath}`);
  log('Další krok: node scripts/seed-barber-praha-demo.mjs');
}

main().catch(e => { console.error(e); process.exit(1); });
