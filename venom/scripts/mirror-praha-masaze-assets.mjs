/**
 * FÁZE 1 — Mirror prahamasaze.com
 * WordPress 6.9.4 + GeneratePress child theme
 * Playwright zachytí všechny assets, zachová WP strukturu cest.
 *
 * Spustit: node scripts/mirror-praha-masaze-assets.mjs
 * Výstup:  public/clones/praha-masaze/  (zachovaná WP struktura)
 *          /tmp/praha-masaze-{page}.html (seed vstupy)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const SLUG = 'praha-masaze';
const ORIGIN = 'https://www.prahamasaze.com';
const OUT = path.join(ROOT, `public/clones/${SLUG}`);
const CLONE_PATH = `/clones/${SLUG}`;

const PAGES = [
  { slug: 'home',     url: '/' },
  { slug: 'cenik',    url: '/cenik-masazi/' },
];

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

function log(msg) { console.log(`[${new Date().toISOString()}] ${msg}`); }

function saveAsset(url, body) {
  try {
    // Rewrite ORIGIN → local path
    const rel = url.replace(ORIGIN, '').split('?')[0]; // strip query strings
    if (!rel || rel === '/') return;
    const dest = path.join(OUT, rel);
    if (fs.existsSync(dest)) return; // idempotent
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.writeFileSync(dest, body);
  } catch {}
}

function processHtml(html, pageSlug) {
  // 1. Rewrite all ORIGIN references to local clone path
  html = html.split(ORIGIN).join(CLONE_PATH);
  html = html.split('https://prahamasaze.com').join(CLONE_PATH);
  html = html.split('http://prahamasaze.com').join(CLONE_PATH);

  // 2. Fix localhost:8080 URLs → CLONE_PATH (dev artifacts in WP)
  html = html.replace(/http:\/\/localhost:\d+\/wp-content\//g, `${CLONE_PATH}/wp-content/`);

  // 2b. Complianz cookie banner — rendered div + toolbar (3 bloky)
  // Blok 1: hlavní banner container
  html = html.replace(/<div[^>]*id="cmplz-cookiebanner-container"[^>]*>[\s\S]*?<!-- categories end -->/gi, '');
  html = html.replace(/<div[^>]*id="cmplz-cookiebanner-container"[^>]*>[\s\S]*?<\/div>\s*<\/div>\s*<\/div>\s*<\/div>\s*<\/div>/gi, '');
  // Blok 2: toolbar div at start of body (empty class)
  html = html.replace(/<div[^>]*class="[^"]*cmplz[^"]*"[^>]*>[\s\S]*?<\/div>/gi, '');
  // Blok 3: cmplz config script
  html = html.replace(/<script[^>]*>[\s\S]*?complianz[\s\S]*?<\/script>/gi, '');
  // Remaining cmplz divs
  html = html.replace(/<[^>]*(?:id|class)="[^"]*cmplz[^"]*"[^>]*>[\s\S]*?<\/[^>]+>/gi, '');

  // 3. Remove tracking + external scripts
  html = html
    // Google Tag Manager
    .replace(/<!-- Google Tag Manager[\s\S]*?<!-- End Google Tag Manager -->/gi, '')
    .replace(/<script[^>]*googletagmanager[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<noscript[^>]*>[\s\S]*?googletagmanager[\s\S]*?<\/noscript>/gi, '')
    // Complianz scripts
    .replace(/<script[^>]*complianz[^>]*><\/script>/gi, '')
    .replace(/var complianz\s*=\s*\{[\s\S]*?\};\s*/g, '')
    // TrustIndex Google reviews widget (dynamic)
    .replace(/<script[^>]*trustindex[^>]*><\/script>/gi, '')
    .replace(/<div[^>]*trustindex[^>]*>[\s\S]*?<\/div>/gi, '')
    // Rank Math JSON-LD
    .replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/gi, '')
    // Instagram feed
    .replace(/<section[^>]*instagram[^>]*>[\s\S]*?<\/section>/gi, '')
    .replace(/<script[^>]*sbi[^>]*><\/script>/gi, '')
    // WP admin bar
    .replace(/<div[^>]*id="wpadminbar"[^>]*>[\s\S]*?<\/div>\s*/i, '')
    // WP emoji (inline settings script + emoji release JS)
    .replace(/<script[^>]*>[\s\S]*?wp-emoji[\s\S]*?<\/script>/gi, '')
    .replace(/<script[^>]*wp-emoji-release[^>]*><\/script>/gi, '')
    .replace(/window\._wpemojiSettings[\s\S]*?;/g, '')
    // Seznam.cz retargeting
    .replace(/<script[^>]*seznam\.cz[^>]*><\/script>/gi, '')
    .replace(/<script[^>]*rc\.js[^>]*><\/script>/gi, '')
    // Google Analytics / gtag
    .replace(/<script[^>]*gtag[^>]*><\/script>/gi, '')
    .replace(/<script[^>]*google-analytics[^>]*><\/script>/gi, '')
    .replace(/gtag\('config'[\s\S]*?\);/g, '')
    // GTM obfuscated inline (function(w,d,s,l,i){...GTM...})
    .replace(/<script[^>]*>\s*\(function\(w,d,s,l,i\)[\s\S]*?googletagmanager[\s\S]*?<\/script>/gi, '')
    // WP emoji converted img tags → alt text
    .replace(/<img[^>]*class="emoji"[^>]*alt="([^"]*)"[^>]*>/gi, '$1')
    // WP emoji inline settings
    .replace(/<script[^>]*>[\s\S]*?_wpemojiSettings[\s\S]*?<\/script>/gi, '');

  // 4. Remove external CDN font links (local fonts already downloaded by Playwright)
  html = html
    .replace(/<link[^>]+fonts\.googleapis\.com[^>]*>/gi, '')
    .replace(/<link[^>]+fonts\.gstatic\.com[^>]*>/gi, '');

  // 5. Inject local Google Fonts fallback CSS into head (in case Playwright didn't cache them)
  html = html.replace(
    /<\/head>/i,
    `<style>
/* Complianz + cookie kill */
[class*='cmplz'],[id*='cmplz']{display:none!important;visibility:hidden!important;}
/* Instagram feed */
#sb_instagram,.sbi-feed-container,.sbi_header_text{display:none!important;}
/* Admin bar */
#wpadminbar{display:none!important;}
html{margin-top:0!important;}
</style>
</head>`
  );

  // 6. Remove srcset (simplify — single src only)
  html = html
    .replace(/\s+srcset="[^"]*"/gi, '')
    .replace(/\s+sizes="[^"]*"/gi, '');

  // 7. Remove canonical pointing to original domain (will be set by Next.js)
  html = html
    .replace(/<link[^>]+rel="canonical"[^>]*>/gi, '')
    .replace(/<meta[^>]+property="og:url"[^>]*>/gi, '');

  // 8. Strip query strings from asset URLs (versioning)
  html = html.replace(/(\/clones\/[^"'?\s]+)\?[^"'>\s]*/g, '$1');

  // 9. Brand scrub — nahradit originálním demo obsahem
  // Logo: replace img+text logo s SVG
  const SVG_LOGO = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 44" width="160" height="36" style="display:block;">
    <text x="4" y="28" font-family="Georgia,serif" font-size="20" font-weight="700" fill="#1a1a1a" letter-spacing="1">DEMO</text>
    <text x="68" y="28" font-family="Georgia,serif" font-size="20" font-weight="400" fill="#8b6f47" letter-spacing="1">MASÁŽE</text>
    <line x1="4" y1="36" x2="196" y2="36" stroke="#8b6f47" stroke-width="1.5"/>
    <text x="4" y="44" font-family="Arial,sans-serif" font-size="9" fill="#999" letter-spacing="2">DEMO ŠABLONA</text>
  </svg>`;
  html = html.replace(
    /<a[^>]+class="site-logo"[^>]*>[\s\S]*?<\/a>/i,
    `<a href="#" class="site-logo" rel="home" aria-label="Demo Masáže">${SVG_LOGO}</a>`
  );

  // Business name
  html = html.replace(/Praha masáže/g, 'Demo Masáže');
  html = html.replace(/Praha Masáže/g, 'Demo Masáže');
  html = html.replace(/prahamasaze/gi, 'demo-masaze');
  // Therapist
  html = html.replace(/Milan Soukup/g, 'Demo Masér');
  html = html.replace(/milan\.soukup@[^\s"<]*/gi, 'info@demo.local');
  // Phone
  html = html.replace(/\+420\s*721\s*845\s*634/g, '+420 608 288 777');
  html = html.replace(/tel:\+420721845634/g, 'tel:+420608288777');
  // Email
  html = html.replace(/info@prahamasaze\.com/gi, 'info@demo.local');
  html = html.replace(/mailto:info@prahamasaze\.com/gi, 'mailto:info@demo.local');
  // Social (href + text)
  html = html.replace(/facebook\.com\/vasosobnimaser/gi, 'facebook.com/demomasaze');
  html = html.replace(/instagram\.com\/prahamasaze/gi, 'instagram.com/demomasaze');
  html = html.replace(/@prahamasaze/gi, '@demomasaze');
  // Address (keep general "Praha 1")
  html = html.replace(/Sokolovská 100\/94/gi, 'Demo ulice 12');
  // Copyright
  html = html.replace(/©\s*\d{4}[\s\S]*?prahamasaze/gi, '© 2026 Demo Masáže s.r.o.');
  html = html.replace(/©\s*\d{4}[\s\S]*?Praha\s*masáže/gi, '© 2026 Demo Masáže s.r.o.');
  // Title tag
  html = html.replace(/<title>[^<]*<\/title>/i, '<title>Demo Masáže — Masážní terapie</title>');
  // meta description
  html = html.replace(/(<meta[^>]+name="description"[^>]+content=")[^"]*(")/i, '$1Demo šablona masáže a wellness pro Venom SaaS. Ukázka webu pro masážní salon.$2');

  return html;
}

async function main() {
  log(`=== FÁZE 1: Mirror ${ORIGIN} ===`);

  const { chromium } = await import('playwright-core');
  const browser = await chromium.launch({ executablePath: CHROME, headless: true });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    locale: 'cs-CZ',
    extraHTTPHeaders: { 'Accept-Language': 'cs,en;q=0.9' },
  });
  const page = await context.newPage();

  // Block external tracking/CDN requests
  await page.route('**', async (route) => {
    const url = route.request().url();
    // Allow only origin domain + known CDNs needed for rendering
    const blocked = [
      'googletagmanager.com', 'google-analytics.com', 'analytics.google.com',
      'googleadservices.com', 'facebook.net', 'facebook.com/tr',
      'seznam.cz/js', 'smartlook.com', 'hotjar.com',
      'trustindex.io', 'instagram.com', 'cdn.jsdelivr.net',
      's.w.org/images/core/emoji', // WP emoji CDN
    ];
    if (blocked.some(b => url.includes(b))) {
      await route.abort();
    } else {
      await route.continue();
    }
  });

  // Capture all asset responses from origin domain
  let assetCount = 0;
  page.on('response', async (resp) => {
    const url = resp.url();
    if (!url.startsWith(ORIGIN)) return;
    const ct = resp.headers()['content-type'] || '';
    if (/(css|javascript|image|font|woff|svg|png|jpe?g|webp|gif)/.test(ct) ||
        /\.(css|js|woff2?|ttf|eot|svg|png|jpe?g|webp|gif)(\?|$)/i.test(url)) {
      try {
        const body = await resp.body();
        saveAsset(url, body);
        assetCount++;
      } catch {}
    }
  });

  for (const p of PAGES) {
    log(`\n-- Page: ${p.slug} (${p.url}) --`);
    await page.goto(`${ORIGIN}${p.url}`, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(1000);

    let html = await page.content();
    log(`  Raw HTML: ${(html.length / 1024).toFixed(0)}KB`);

    html = processHtml(html, p.slug);
    log(`  Processed HTML: ${(html.length / 1024).toFixed(0)}KB`);

    fs.writeFileSync(`/tmp/praha-masaze-${p.slug}.html`, html, 'utf-8');
    log(`  Saved: /tmp/praha-masaze-${p.slug}.html`);
  }

  await browser.close();
  log(`\nAssets captured: ${assetCount}`);

  // Booking page — static form replacing JS calendar
  const bookingHtml = buildBookingHtml();
  fs.writeFileSync('/tmp/praha-masaze-rezervace.html', bookingHtml, 'utf-8');
  log('Booking page: /tmp/praha-masaze-rezervace.html (static form)');

  log('\n=== FÁZE 1 HOTOVA ===');
  log(`Assets: ${OUT}`);
  log('\nDůkaz — 0 external URLs v assets:');
  log(`  grep -rohE "https?://[^\\"']+" ${OUT} | grep -v "localhost|w3.org|schema.org" | wc -l`);
  log('\nNásledující kroky:');
  log('  node scripts/seed-praha-masaze-demo.mjs');
}

// ── Static booking form ───────────────────────────────────────────────────────
function buildBookingHtml() {
  return `<!DOCTYPE html>
<html lang="cs">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Rezervace — Demo Masáže</title>
<style>
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
body{font-family:system-ui,'Inter',sans-serif;background:#faf8f5;color:#1a1a1a;min-height:100vh;display:flex;flex-direction:column;}
.bk-header{background:#fff;border-bottom:1px solid #e8e0d0;padding:20px 40px;display:flex;align-items:center;justify-content:space-between;}
.bk-logo{font-size:1.2rem;font-weight:700;color:#1a1a1a;text-decoration:none;letter-spacing:0.05em;}
.bk-back{font-size:.875rem;color:#8b6f47;text-decoration:none;}
.bk-main{flex:1;display:flex;align-items:center;justify-content:center;padding:60px 24px;}
.bk-card{background:#fff;border:1px solid #e8e0d0;border-radius:12px;padding:48px;max-width:540px;width:100%;text-align:center;}
.bk-title{font-size:1.75rem;font-weight:700;margin-bottom:12px;}
.bk-sub{font-size:.9375rem;color:#6b6560;line-height:1.7;margin-bottom:32px;}
.bk-form{display:flex;flex-direction:column;gap:14px;text-align:left;}
.bk-label{font-size:.75rem;font-weight:600;letter-spacing:.06em;text-transform:uppercase;color:#6b6560;margin-bottom:5px;display:block;}
.bk-input,.bk-select,.bk-textarea{width:100%;padding:12px 16px;border:1px solid #e8e0d0;border-radius:8px;font-size:.9375rem;color:#1a1a1a;background:#fff;outline:none;}
.bk-input:focus,.bk-select:focus{border-color:#8b6f47;}
.bk-textarea{resize:vertical;min-height:90px;}
.bk-row{display:grid;grid-template-columns:1fr 1fr;gap:14px;}
.bk-btn{width:100%;padding:15px;background:#1a1a1a;color:#fff;font-size:.9375rem;font-weight:600;border:none;border-radius:8px;cursor:pointer;margin-top:6px;}
.bk-btn:hover{background:#8b6f47;}
.bk-note{font-size:.8125rem;color:#9a918b;text-align:center;margin-top:14px;line-height:1.6;}
.bk-footer{background:#fff;border-top:1px solid #e8e0d0;padding:20px 40px;text-align:center;font-size:.8125rem;color:#9a918b;}
</style>
</head>
<body>
<header class="bk-header">
  <a href="/demo/praha-masaze-demo" class="bk-logo">DEMO MASÁŽE</a>
  <a href="javascript:history.back()" class="bk-back">← Zpět</a>
</header>
<main class="bk-main">
  <div class="bk-card">
    <h1 class="bk-title">Rezervace masáže</h1>
    <p class="bk-sub">Vyplňte formulář a my vás kontaktujeme ohledně termínu. Odpovídáme do 2 hodin.</p>
    <form class="bk-form" onsubmit="return false;">
      <div>
        <label class="bk-label">Typ masáže</label>
        <select class="bk-select">
          <option>— vyberte —</option>
          <option>Klasická relaxační masáž (60 min)</option>
          <option>Klasická relaxační masáž (90 min)</option>
          <option>Sportovní masáž (60 min)</option>
          <option>Thajská masáž (60 min)</option>
          <option>Hluboká tkáňová masáž (60 min)</option>
          <option>Aromaterapeutická masáž (60 min)</option>
          <option>Párová masáž (60 min)</option>
        </select>
      </div>
      <div class="bk-row">
        <div>
          <label class="bk-label">Jméno a příjmení</label>
          <input class="bk-input" type="text" placeholder="Jana Nováková">
        </div>
        <div>
          <label class="bk-label">Telefon</label>
          <input class="bk-input" type="tel" placeholder="+420 777 123 456">
        </div>
      </div>
      <div>
        <label class="bk-label">E-mail</label>
        <input class="bk-input" type="email" placeholder="jana@email.cz">
      </div>
      <div>
        <label class="bk-label">Preferovaný termín</label>
        <input class="bk-input" type="date">
      </div>
      <div>
        <label class="bk-label">Poznámka (nepovinné)</label>
        <textarea class="bk-textarea" placeholder="Zdravotní omezení, preference..."></textarea>
      </div>
      <button class="bk-btn" onclick="this.textContent='✓ Odesláno!';this.style.background='#4a7c59';">Odeslat poptávku</button>
      <p class="bk-note">Potvrzení dostanete na e-mail. Urgentní rezervace: <strong>+420 608 288 777</strong></p>
    </form>
  </div>
</main>
<footer class="bk-footer">© 2026 Demo Masáže s.r.o. · Praha</footer>
</body>
</html>`;
}

main().catch(e => { console.error(e); process.exit(1); });
