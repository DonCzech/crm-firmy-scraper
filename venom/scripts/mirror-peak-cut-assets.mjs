/**
 * Fáze 1 — Mirror assets z barbershop-buddy.cz → public/clones/peak-cut/
 * Stáhne CSS, JS, SVG, fonty, obrázky. Přepíše cesty v CSS na lokální.
 *
 * Spustit: node scripts/mirror-peak-cut-assets.mjs
 * Výstup:  public/clones/peak-cut/...
 *          /tmp/peak-cut-home.html  (zpracované HTML pro seed)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createWriteStream, mkdirSync, existsSync, writeFileSync, readFileSync } from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const CLONE_DIR = path.join(ROOT, 'public/clones/peak-cut');
const ORIGIN = 'https://barbershop-buddy.cz';
const CLONE_PATH = '/clones/peak-cut';

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
  'Accept-Language': 'cs,en;q=0.9',
};

function log(msg) { console.log(`[${new Date().toISOString()}] ${msg}`); }

function localPath(url) {
  // Convert absolute URL to local filesystem path under CLONE_DIR
  const u = url.replace(/^https?:\/\/barbershop-buddy\.cz/, '');
  // Strip query strings
  const clean = u.split('?')[0];
  return path.join(CLONE_DIR, clean);
}

function localPublicPath(url) {
  const u = url.replace(/^https?:\/\/barbershop-buddy\.cz/, '');
  return CLONE_PATH + u.split('?')[0];
}

async function download(url, destPath) {
  if (existsSync(destPath)) {
    log(`  SKIP (exists): ${destPath}`);
    return;
  }
  mkdirSync(path.dirname(destPath), { recursive: true });
  log(`  GET: ${url}`);
  const res = await fetch(url, { headers: HEADERS, signal: AbortSignal.timeout(30000) });
  if (!res.ok) { log(`  WARN: ${res.status} ${url}`); return; }
  const buf = await res.arrayBuffer();
  fs.writeFileSync(destPath, Buffer.from(buf));
  log(`  OK: ${destPath} (${buf.byteLength} bytes)`);
}

async function downloadText(url) {
  const res = await fetch(url, { headers: HEADERS, signal: AbortSignal.timeout(30000) });
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  return res.text();
}

// ── CSS files ─────────────────────────────────────────────────────────────────
const CSS_URLS = [
  `${ORIGIN}/wp-content/themes/buddy/_assets/module/normalize/normalize.css`,
  `${ORIGIN}/wp-content/themes/buddy/style.css`,
  `${ORIGIN}/wp-content/plugins/contact-form-7/includes/css/styles.css`,
  `${ORIGIN}/wp-content/plugins/instagram-feed/css/sbi-styles.min.css`,
];

// ── JS files ──────────────────────────────────────────────────────────────────
const JS_URLS = [
  `${ORIGIN}/wp-includes/js/jquery/jquery.min.js`,
  `${ORIGIN}/wp-includes/js/jquery/jquery-migrate.min.js`,
  `${ORIGIN}/wp-content/themes/buddy/_assets/module/jquery/jquery.min.js`,
  `${ORIGIN}/wp-content/themes/buddy/_assets/js/bundle.min.js`,
  `${ORIGIN}/wp-content/themes/buddy/js/navigation.js`,
  `${ORIGIN}/wp-content/plugins/contact-form-7/includes/js/index.js`,
  `${ORIGIN}/wp-content/plugins/contact-form-7/includes/swv/js/index.js`,
];

// ── Image files ───────────────────────────────────────────────────────────────
const IMAGE_URLS = [
  `${ORIGIN}/wp-content/themes/buddy/_assets/img/style/logo.svg`,
  `${ORIGIN}/wp-content/themes/buddy/_assets/img/style/icons/icon_arrow.svg`,
  `${ORIGIN}/wp-content/themes/buddy/_assets/img/style/icons/icon_google.png`,
  `${ORIGIN}/wp-content/themes/buddy/_assets/img/style/google_powered.png`,
  `${ORIGIN}/wp-content/themes/buddy/_assets/svg/sprite.svg`,
  `${ORIGIN}/wp-content/uploads/2023/07/Frame-1.jpg`,
  `${ORIGIN}/wp-content/uploads/2023/08/Mobile-1.png`,  // AI nahradí Mobile-1.jpg
  `${ORIGIN}/wp-content/uploads/2023/07/about_image.jpg`,
  `${ORIGIN}/wp-content/uploads/2023/07/contact-us_image.jpg`,
  `${ORIGIN}/wp-content/uploads/2023/07/contacts_image1.jpg`,
  `${ORIGIN}/wp-content/uploads/2023/07/contacts_image2.jpg`,
  `${ORIGIN}/wp-content/uploads/2023/07/logo_white.svg`,
  `${ORIGIN}/wp-content/uploads/2023/07/partners_image1.png`,
  `${ORIGIN}/wp-content/uploads/2023/07/partners_image2.png`,
  `${ORIGIN}/wp-content/uploads/2023/07/partners_image3.png`,
  `${ORIGIN}/wp-content/uploads/2023/07/partners_image4.png`,
  `${ORIGIN}/wp-content/uploads/2023/07/partners_image5.png`,
  `${ORIGIN}/wp-content/uploads/2023/07/partners_image6.png`,
];

// ── Slick carousel from CDN ───────────────────────────────────────────────────
const CDN_ASSETS = [
  {
    url: 'https://cdn.jsdelivr.net/npm/slick-carousel@1.8.1/slick/slick.css',
    dest: path.join(CLONE_DIR, 'cdn/slick/slick.css'),
    publicPath: `${CLONE_PATH}/cdn/slick/slick.css`,
  },
  {
    url: 'https://cdn.jsdelivr.net/npm/slick-carousel@1.8.1/slick/slick.min.js',
    dest: path.join(CLONE_DIR, 'cdn/slick/slick.min.js'),
    publicPath: `${CLONE_PATH}/cdn/slick/slick.min.js`,
  },
  {
    url: 'https://cdn.jsdelivr.net/npm/slick-carousel@1.8.1/slick/fonts/slick.woff',
    dest: path.join(CLONE_DIR, 'cdn/slick/fonts/slick.woff'),
    publicPath: `${CLONE_PATH}/cdn/slick/fonts/slick.woff`,
  },
  {
    url: 'https://cdn.jsdelivr.net/npm/slick-carousel@1.8.1/slick/fonts/slick.ttf',
    dest: path.join(CLONE_DIR, 'cdn/slick/fonts/slick.ttf'),
    publicPath: `${CLONE_PATH}/cdn/slick/fonts/slick.ttf`,
  },
  {
    url: 'https://cdn.jsdelivr.net/npm/slick-carousel@1.8.1/slick/ajax-loader.gif',
    dest: path.join(CLONE_DIR, 'cdn/slick/ajax-loader.gif'),
    publicPath: `${CLONE_PATH}/cdn/slick/ajax-loader.gif`,
  },
];

function fixCssPaths(css, cssPublicBase) {
  // Replace all barbershop-buddy.cz references with local paths
  css = css.replace(/https?:\/\/barbershop-buddy\.cz(\/[^'"\s)]*)/g, (_, p) => `${CLONE_PATH}${p.split('?')[0]}`);
  // Fix relative paths in CSS — url(../fonts/...) etc
  // Slick uses relative paths for fonts (./fonts/ and url("fonts/"))
  css = css.replace(/url\(['"]?fonts\//g, `url('${CLONE_PATH}/cdn/slick/fonts/`);
  css = css.replace(/url\(['"]?\.\/fonts\//g, `url('${CLONE_PATH}/cdn/slick/fonts/`);
  css = css.replace(/url\(['"]?ajax-loader\.gif['"]\)/g, `url('${CLONE_PATH}/cdn/slick/ajax-loader.gif')`);
  return css;
}

async function processCss(url) {
  log(`Processing CSS: ${url}`);
  let css;
  try { css = await downloadText(url); } catch(e) { log(`WARN: skip CSS ${url}: ${e.message}`); return; }
  css = fixCssPaths(css, '');
  const dest = localPath(url);
  mkdirSync(path.dirname(dest), { recursive: true });
  writeFileSync(dest, css, 'utf-8');
  log(`  Saved CSS: ${dest}`);
}

function buildHtml(rawHtml) {
  let html = rawHtml;

  // 1. Extract <body> content only
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*)<\/body>/i);
  if (!bodyMatch) throw new Error('No <body> found');
  html = bodyMatch[1];

  // 2. Remove tracking scripts
  html = html.replace(/<!-- Google Tag Manager[\s\S]*?End Google Tag Manager -->/gi, '');
  html = html.replace(/<!-- Google Tag Manager \(noscript\)[\s\S]*?End Google Tag Manager \(noscript\) -->/gi, '');
  html = html.replace(/<!-- Facebook Pixel Code[\s\S]*?End Facebook Pixel Code -->/gi, '');
  html = html.replace(/<script[^>]*cookieyes[^>]*>[\s\S]*?<\/script>/gi, '');
  html = html.replace(/<script[^>]*gtag[^>]*>[\s\S]*?<\/script>/gi, '');
  html = html.replace(/<script[^>]*fbq[^>]*>[\s\S]*?<\/script>/gi, '');
  html = html.replace(/<script[^>]*dataLayer[^>]*>[\s\S]*?<\/script>/gi, '');

  // 3. Replace all barbershop-buddy.cz asset URLs with local clone paths
  html = html.replace(/https?:\/\/barbershop-buddy\.cz(\/wp-content\/[^'"\s>)]+)/g, (_, p) => `${CLONE_PATH}${p.split('?')[0]}`);
  html = html.replace(/https?:\/\/barbershop-buddy\.cz(\/wp-includes\/[^'"\s>)]+)/g, (_, p) => `${CLONE_PATH}${p.split('?')[0]}`);

  // 4. Fix sprite.svg references (xlink:href)
  html = html.replace(/xlink:href="https?:\/\/barbershop-buddy\.cz(\/[^"]+)"/g, (_, p) => `xlink:href="${CLONE_PATH}${p.split('?')[0]}"`);

  // 5. Remove language switcher (UA/EN/RU links)
  html = html.replace(/<ul[^>]*id\s*=\s*["']lang-menu["'][^>]*>[\s\S]*?<\/ul>/gi, '<ul id="lang-menu"></ul>');

  // 6. Remove "Rezervovat" booking link → keep button but href="#" for demo
  html = html.replace(/href="https?:\/\/noona\.app[^"]*"/g, 'href="#"');

  // 7. Remove Instagram feed section (dynamic, won't work statically)
  // Primary: remove by sb_instagram id — walk from opening section back
  // The section containing #sb_instagram: find its start and end
  {
    const igIdx = html.indexOf('id="sb_instagram"');
    if (igIdx !== -1) {
      // Walk backward to find opening <section
      let sectionStart = html.lastIndexOf('<section', igIdx);
      if (sectionStart === -1) sectionStart = html.lastIndexOf('<div', igIdx);
      // Walk forward counting nested <section> tags to find the matching closing tag
      let depth = 0;
      let pos = sectionStart;
      const tag = html.slice(sectionStart, sectionStart + 8).includes('section') ? 'section' : 'div';
      while (pos < html.length) {
        const openIdx = html.indexOf(`<${tag}`, pos + 1);
        const closeIdx = html.indexOf(`</${tag}>`, pos + 1);
        if (closeIdx === -1) break;
        if (openIdx !== -1 && openIdx < closeIdx) { depth++; pos = openIdx; }
        else { if (depth === 0) { html = html.slice(0, sectionStart) + html.slice(closeIdx + `</${tag}>`.length); break; }
          depth--; pos = closeIdx; }
      }
    }
  }
  // Fallback: remove any remaining sbi/instagram plugin markup
  html = html.replace(/<div[^>]*id="sb_instagram"[^>]*>[\s\S]*?<\/div>\s*<\/div>/gi, '');
  html = html.replace(/<h2[^>]*gallery__title[^>]*>INSTAGRAM<\/h2>/gi, '');

  // 7b. Remove "Powered by Google" badge from reviews section (static reviews replace Google API)
  html = html.replace(/<div[^>]*class="[^"]*reviews__powered[^"]*"[^>]*>[\s\S]*?<\/div>/gi, '');

  // 8. Remove WordPress emoji scripts and noscript GTM iframe (already removed above)
  html = html.replace(/<script[^>]*wp-emoji[^>]*>[\s\S]*?<\/script>/gi, '');

  // 9. Remove footer "developed by" link
  html = html.replace(/<a[^>]*class="[^"]*footer__dev[^"]*"[^>]*>[\s\S]*?<\/a>/gi, '');

  // 10. Remove VK social link (Russian social network)
  html = html.replace(/<li><a[^>]*vk\.com[^>]*>[\s\S]*?<\/a><\/li>/gi, '');

  // 11. Fix Google Maps embed to be 100% width
  html = html.replace(/width="600"/g, 'width="100%"');

  // 12. Anonymize email address
  html = html.replace(/info@barbershop-buddy\.cz/g, 'info@demo.local');
  html = html.replace(/href="mailto:info@demo\.local"/g, 'href="mailto:info@demo.local"');

  // 13. Remove WP inline scripts (AJAX, service worker, CF7 config, Instagram AJAX)
  html = html.replace(/<script[^>]*>\s*var sbiajaxurl[\s\S]*?<\/script>/gi, '');
  html = html.replace(/<script[^>]*type="module"[^>]*>\s*import \{ Workbox \}[\s\S]*?<\/script>/gi, '');
  html = html.replace(/<script[^>]*id="contact-form-7-js-extra"[^>]*>[\s\S]*?<\/script>/gi, '');
  html = html.replace(/<script[^>]*id="sbi_scripts-js-extra"[^>]*>[\s\S]*?<\/script>/gi, '');
  html = html.replace(/<script[^>]*id="pwa[^"]*"[^>]*>[\s\S]*?<\/script>/gi, '');

  // 14. Remove any remaining barbershop-buddy.cz refs in inline scripts/data
  html = html.replace(/https?:\/\/barbershop-buddy\.cz\/wp-admin\/admin-ajax\.php/g, '#');
  html = html.replace(/https?:\\\/\\\/barbershop-buddy\.cz[^'"\\]*/g, '#');
  html = html.replace(/https?:\/\/barbershop-buddy\.cz\/wp-json\/[^"']*/g, '#');

  // 15. Remove remaining tracking/analytics scripts
  html = html.replace(/<script[^>]*smartlook[^>]*>[\s\S]*?<\/script>/gi, '');
  html = html.replace(/<script[^>]*smartlook[^"']*["'][^>]*><\/script>/gi, '');
  // Smartlook inline block (window.smartlook||function...)
  html = html.replace(/<script[^>]*(?:type=["']text\/javascript["'])?[^>]*>\s*window\.smartlook[\s\S]*?<\/script>/gi, '');
  html = html.replace(/<script[^>]*>\s*[\s\S]*?smartlook[\s\S]*?<\/script>/gi, '');
  html = html.replace(/smartlook\s*&&[\s\S]*?\/\//g, '');
  html = html.replace(/<script[^>]*>\s*smartlook[\s\S]*?<\/script>/gi, '');

  // 16. Remove Slick CDN script tags from HTML body (we inject via jsUrls)
  html = html.replace(/<script[^>]*cdn\.jsdelivr\.net[^>]*slick[^>]*><\/script>/gi, '');
  html = html.replace(/<script[^>]*slick[^>]*cdn[^>]*><\/script>/gi, '');

  // 17. Remove Google Maps API script from body (map div stays, just no API calls)
  html = html.replace(/<script[^>]*maps\.googleapis\.com[^>]*><\/script>/gi, '');
  html = html.replace(/<script[^>]*initMap[^>]*>[\s\S]*?<\/script>/gi, '');

  // 18. Remove CookieYes banner (script already removed, but div might remain)
  html = html.replace(/<div[^>]*id="cookieyes[^"]*"[^>]*>[\s\S]*?<\/div>/gi, '');
  html = html.replace(/<div[^>]*class="[^"]*cky-[^"]*"[^>]*>[\s\S]*?<\/div>/gi, '');

  // 19. Remove sbi (Instagram) and navigation.js script tags from body
  html = html.replace(/<script[^>]*sbi-scripts[^>]*><\/script>/gi, '');
  html = html.replace(/<script[^>]*navigation\.js[^>]*><\/script>/gi, '');

  // 20. Remove wp-includes and wp-content script tags from body (we inject via jsUrls)
  html = html.replace(/<script[^>]*src=["'][^"']*wp-includes\/js\/jquery[^"']*["'][^>]*><\/script>/gi, '');
  // Remove CF7 script tags (wpcf7 config was stripped, these would throw errors)
  html = html.replace(/<script[^>]*contact-form-7[^>]*><\/script>/gi, '');
  html = html.replace(/<script[^>]*swv-js[^>]*><\/script>/gi, '');
  // Remove theme jquery/bundle from body (loaded via jsUrls instead)
  html = html.replace(/<script[^>]*src=["'][^"']*themes\/buddy\/_assets\/module\/jquery[^"']*["'][^>]*><\/script>/gi, '');
  html = html.replace(/<script[^>]*src=["'][^"']*themes\/buddy\/_assets\/js\/bundle[^"']*["'][^>]*><\/script>/gi, '');

  // 21. Remove Google Fonts preconnect/stylesheet links from body (loaded locally)
  html = html.replace(/<link[^>]*fonts\.googleapis\.com[^>]*>/gi, '');
  html = html.replace(/<link[^>]*fonts\.gstatic\.com[^>]*>/gi, '');

  // 21b. Nahradit dynamické Google Places reviews statickými — API nedostupné ve statickém klonu
  const STAR_SVG = `<svg><use xlink:href="/clones/peak-cut/wp-content/themes/buddy/_assets/svg/sprite.svg#icon_star"/></svg>`;
  const GOOGLE_LOGO = `<img src="/clones/peak-cut/wp-content/themes/buddy/_assets/img/style/icons/icon_google.png" width="27px" height="26px" loading="lazy" alt="Google">`;

  function makeAvatar(initials, color) {
    return `<svg width="50" height="50" viewBox="0 0 50 50" xmlns="http://www.w3.org/2000/svg"><circle cx="25" cy="25" r="25" fill="${color}"/><text x="50%" y="50%" dominant-baseline="central" text-anchor="middle" font-family="Oswald,sans-serif" font-size="18" fill="#fff">${initials}</text></svg>`;
  }

  const STATIC_REVIEWS = [
    { name: 'Tomáš N.', initials: 'TN', color: '#1a73e8', rating: 5, text: 'Naprosto profesionální přístup. Přišel jsem bez předchozí zkušenosti s tradičním holením a odcházel jsem nadšený. Výsledek byl precizní, atmosféra barbershopu příjemná. Určitě se vrátím.' },
    { name: 'Marek H.', initials: 'MH', color: '#34a853', rating: 5, text: 'Jedna z nejlepších zkušeností s barberstvím v Praze. Střih přesně podle mých představ, barbér věděl co dělá. Ceny odpovídají kvalitě. Mohu jen doporučit.' },
    { name: 'Pavel K.', initials: 'PK', color: '#ea4335', rating: 5, text: 'Skvělé místo, příjemný personál. Tradiční holení hot towel bylo zkušeností, jakou jsem nečekal — prémium servis za rozumnou cenu. Barbershop s pravou americkou atmosférou.' },
    { name: 'Ondřej M.', initials: 'OM', color: '#fbbc04', rating: 5, text: 'Chodím sem pravidelně už přes rok. Vždy profesionální, vždy přesný výsledek. Nejlepší barber v okolí Žižkova. Rezervace online funguje perfektně.' },
    { name: 'Jan Š.', initials: 'JŠ', color: '#9c27b0', rating: 5, text: 'Příjemná atmosféra, rychlá obsluha a perfektní výsledek. Přišel jsem na doporučení kolegy a nelituji. Prostředí je útulné, cítíte se jako na správném místě.' },
  ];

  function makeStars(rating) {
    // CSS uses flex-direction:row-reverse + .active~* selector — active must be on star[rating-1]
    return Array.from({length:5}, (_,i) =>
      `<div class="rating__item${i === rating - 1 ? ' active' : ''}">${STAR_SVG}</div>`
    ).join('');
  }

  const REVIEWS_HTML = STATIC_REVIEWS.map(r => `
    <div class="reviews__item">
      <div class="reviews__google-logo">${GOOGLE_LOGO}</div>
      <div class="reviews__row">
        <div class="reviews__image">${makeAvatar(r.initials, r.color)}</div>
        <div class="reviews__name">${r.name}</div>
      </div>
      <div class="reviews__rating"><div class="rating">${makeStars(r.rating)}</div></div>
      <div class="reviews__text text-3"><p>${r.text}</p></div>
    </div>`).join('\n');

  // Nahradit prázdný slider statickými reviews + přidat inline init script
  html = html.replace(
    '<div class="reviews__slider js-reviews-slider"></div>',
    `<div class="reviews__slider js-reviews-slider">${REVIEWS_HTML}</div>
    <script>
    (function() {
      function initReviewsSlick() {
        if (typeof $ === 'undefined' || typeof $.fn.slick === 'undefined') {
          return setTimeout(initReviewsSlick, 100);
        }
        var $slider = $('.js-reviews-slider');
        if ($slider.length && !$slider.hasClass('slick-initialized')) {
          $slider.slick({
            slidesToShow: 1, slidesToScroll: 1, arrows: true, dots: true,
            appendDots: '.js-reviews-dots', appendArrows: '.js-reviews-arrows',
            autoplay: true, autoplaySpeed: 5000, infinite: true,
          });
        }
      }
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initReviewsSlick);
      } else {
        initReviewsSlick();
      }
    })();
    </script>`
  );

  // 22. DEMO TEXTY — nahradit původní brand neutrálním demo obsahem
  html = html.replace(/BARBERSHOP BUDDY/gi, 'PEAK CUT');
  html = html.replace(/Barbershop BUDDY/gi, 'Peak Cut Barbershop');
  html = html.replace(/barbershop BUDDY/gi, 'Peak Cut Barbershop');
  html = html.replace(/\bBUDDY\b/g, 'Peak Cut');
  html = html.replace(/buddy_barbershop_/g, 'peakcut.barbershop');
  html = html.replace(/Barbershop Praha/g, 'Peak Cut Praha');
  html = html.replace(/buddybarbershop/gi, 'peakcutbarbershop');
  // Název v title/meta/copyright
  html = html.replace(/Barbershop BUDDY Praha/g, 'Peak Cut Barbershop Praha');
  // Facebook odkaz na originální stránku → demo
  html = html.replace(/https:\/\/www\.facebook\.com\/barbershop\.buddy/g, 'https://www.facebook.com/peakcutbarbershop');
  // Google Maps ariaLabel
  html = html.replace(/ariaLabel:\s*["']Buddy["']/gi, 'ariaLabel: "Peak Cut"');

  // 22b. Mobile-1: AI generátor ukládá jako .jpg (lepší komprese), updatuj srcset reference
  html = html.replace(/Mobile-1\.png/g, 'Mobile-1.jpg');

  // 23. Lazy loading na všechny obrázky kromě hero
  // Nejdříve hero image eager
  html = html.replace(/(<img[^>]*Frame-1[^>]*)>/g, '$1 loading="eager" fetchpriority="high">');
  html = html.replace(/(<img[^>]*Mobile-1[^>]*)>/g, '$1 loading="eager">');
  // Všechny ostatní img bez loading attr → lazy
  html = html.replace(/<img(?![^>]*loading=)([^>]*)>/g, '<img loading="lazy"$1>');
  // Opravit double loading (pokud se eager přidal nad lazy)
  html = html.replace(/loading="lazy"([^>]*)loading="eager"/g, 'loading="eager"$1');
  html = html.replace(/loading="lazy"([^>]*)fetchpriority="high"/g, '$1fetchpriority="high" loading="eager"');

  // 24. Vložit profesionální GALERIE sekci (náhrada za odstraněný Instagram feed)
  // Injekcí HTML bloku před sekci #about
  const GALLERY_HTML = `
    <section id="gallery" style="padding:80px 0;background:#fff;">
      <div style="max-width:1200px;margin:0 auto;padding:0 24px;">
        <h2 style="font-family:'Oswald',sans-serif;font-size:2.2rem;font-weight:600;letter-spacing:.12em;text-transform:uppercase;color:#1a1a1a;margin:0 0 8px;">GALERIE</h2>
        <div style="width:56px;height:3px;background:#004679;margin:0 0 44px;"></div>
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;">
          <div style="overflow:hidden;aspect-ratio:1;">
            <img loading="lazy" src="/clones/peak-cut/wp-content/uploads/2023/07/contact-us_image.jpg"
              alt="Peak Cut Barbershop — barber" width="400" height="400"
              style="width:100%;height:100%;object-fit:cover;display:block;transition:transform .4s ease;">
          </div>
          <div style="overflow:hidden;aspect-ratio:1;">
            <img loading="lazy" src="/clones/peak-cut/wp-content/uploads/2023/07/about_image.jpg"
              alt="Peak Cut Barbershop — interiér" width="400" height="400"
              style="width:100%;height:100%;object-fit:cover;display:block;transition:transform .4s ease;">
          </div>
          <div style="overflow:hidden;aspect-ratio:1;">
            <img loading="lazy" src="/clones/peak-cut/wp-content/uploads/2023/07/contacts_image2.jpg"
              alt="Peak Cut Barbershop — křesla" width="400" height="400"
              style="width:100%;height:100%;object-fit:cover;display:block;transition:transform .4s ease;">
          </div>
          <div style="overflow:hidden;aspect-ratio:1;grid-column:span 2;">
            <img loading="lazy" src="/clones/peak-cut/wp-content/uploads/2023/07/Frame-1.jpg"
              alt="Peak Cut Barbershop — střih" width="800" height="400"
              style="width:100%;height:100%;object-fit:cover;display:block;transition:transform .4s ease;">
          </div>
          <div style="overflow:hidden;aspect-ratio:1;">
            <img loading="lazy" src="/clones/peak-cut/wp-content/uploads/2023/07/contacts_image1.jpg"
              alt="Peak Cut Barbershop — exteriér" width="400" height="400"
              style="width:100%;height:100%;object-fit:cover;display:block;transition:transform .4s ease;">
          </div>
        </div>
      </div>
    </section>`;

  // Vložit galerii těsně před sekci #about
  html = html.replace('<section class="section" id="about">', GALLERY_HTML + '\n    <section class="section" id="about">');

  // 25. Nahradit jednu contact-us foto 3 stacked B&W fotkami (jako na originálu)
  const CONTACT_STACKED = `<div class="contact-us__image-wrap" style="display:flex;flex-direction:column;gap:8px;">
    <img loading="lazy" src="/clones/peak-cut/wp-content/uploads/2023/07/contact_photo1.jpg"
      alt="Peak Cut — nástroje" width="640" height="213"
      style="width:100%;height:auto;object-fit:cover;display:block;border-radius:2px;">
    <img loading="lazy" src="/clones/peak-cut/wp-content/uploads/2023/07/contact_photo2.jpg"
      alt="Peak Cut — křeslo" width="640" height="213"
      style="width:100%;height:auto;object-fit:cover;display:block;border-radius:2px;">
    <img loading="lazy" src="/clones/peak-cut/wp-content/uploads/2023/07/contact_photo3.jpg"
      alt="Peak Cut — barber" width="640" height="213"
      style="width:100%;height:auto;object-fit:cover;display:block;border-radius:2px;">
  </div>`;

  html = html.replace(
    /<div class="contact-us__image-wrap">[\s\S]*?<\/div>/,
    CONTACT_STACKED
  );

  return html;
}

async function fetchAndProcessHomepage() {
  const cacheFile = '/tmp/peak-cut-home-raw.html';
  let rawHtml;
  if (existsSync(cacheFile) && !process.argv.includes('--refetch')) {
    log('Using cached homepage HTML');
    rawHtml = readFileSync(cacheFile, 'utf-8');
  } else {
    log('Fetching homepage...');
    rawHtml = await downloadText(ORIGIN + '/');
    writeFileSync(cacheFile, rawHtml, 'utf-8');
  }

  log('Processing HTML...');
  const processed = buildHtml(rawHtml);
  writeFileSync('/tmp/peak-cut-home.html', processed, 'utf-8');
  log(`Processed HTML saved: /tmp/peak-cut-home.html (${processed.length} chars)`);
  return processed;
}

async function main() {
  log('=== Fáze 1: Mirror peak-cut (barbershop-buddy.cz) ===');

  // Download CDN assets
  log('\n-- CDN assets --');
  for (const { url, dest } of CDN_ASSETS) {
    mkdirSync(path.dirname(dest), { recursive: true });
    await download(url, dest);
  }

  // Process and download CSS
  log('\n-- CSS files --');
  for (const url of CSS_URLS) {
    await processCss(url);
  }

  // Fix slick.css font paths (CDN fonts → local)
  const slickCssPath = path.join(CLONE_DIR, 'cdn/slick/slick.css');
  if (existsSync(slickCssPath)) {
    let css = readFileSync(slickCssPath, 'utf-8');
    css = css.replace(/url\(['"]?fonts\//g, `url('${CLONE_PATH}/cdn/slick/fonts/`);
    css = css.replace(/url\(['"]?\.\/fonts\//g, `url('${CLONE_PATH}/cdn/slick/fonts/`);
    css = css.replace(/url\(['"]?ajax-loader\.gif['"]?\)/g, `url('${CLONE_PATH}/cdn/slick/ajax-loader.gif')`);
    writeFileSync(slickCssPath, css, 'utf-8');
    log('  Fixed font paths in slick.css');
  }

  // Download JS files
  log('\n-- JS files --');
  for (const url of JS_URLS) {
    await download(url, localPath(url));
  }

  // Download images
  log('\n-- Images --');
  for (const url of IMAGE_URLS) {
    await download(url, localPath(url));
  }

  // Process homepage HTML first (also saves raw to /tmp)
  log('\n-- Homepage HTML --');
  await fetchAndProcessHomepage();

  // Additional image scan from raw HTML
  log('\n-- Additional image scan --');
  if (existsSync('/tmp/peak-cut-home-raw.html')) {
    const rawHtml2 = readFileSync('/tmp/peak-cut-home-raw.html', 'utf-8');
    const extraImgs = [...rawHtml2.matchAll(/https?:\/\/barbershop-buddy\.cz(\/wp-content\/uploads\/[^'"\s>)]+\.(jpg|jpeg|png|webp|gif|svg))/gi)];
    for (const [url] of extraImgs) {
      const dest = localPath(url);
      await download(url, dest);
    }
  }

  log('\n=== Fáze 1 HOTOVA ===');
  log(`Assets v: ${CLONE_DIR}`);
  log(`HTML pro seed: /tmp/peak-cut-home.html`);
}

main().catch(err => { console.error(err); process.exit(1); });
