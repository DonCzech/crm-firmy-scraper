/**
 * FÁZE 1 — Mirror assets z jarkacechova.cz → public/clones/studio-jarka/
 * Tilda CMS — CSS/JS z static.tildacdn.net, inline per-section styles v body
 *
 * Spustit: node scripts/mirror-studio-jarka-assets.mjs
 * Výstup:  public/clones/studio-jarka/...
 *          /tmp/studio-jarka-home.html
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { mkdirSync, existsSync, writeFileSync } from 'fs';
import pwPkg from '/Users/apple/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core/index.js';
const { chromium } = pwPkg;

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const CLONE_DIR = path.join(ROOT, 'public/clones/studio-jarka');
const ORIGIN = 'https://jarkacechova.cz';
const CLONE_PATH = '/clones/studio-jarka';
const TILDA_STATIC = 'https://static.tildacdn.net';
const TILDA_NEO = 'https://neo.tildacdn.com';

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

// ── Tilda CSS files ──────────────────────────────────────────────────────────
const CSS_FILES = [
  { url: `${TILDA_STATIC}/css/tilda-grid-3.0.min.css`,             dest: 'css/tilda-grid-3.0.min.css' },
  { url: `${TILDA_STATIC}/ws/project24653133/tilda-blocks-page135993773.min.css?t=1778075009`, dest: 'css/tilda-blocks.min.css' },
  { url: `${TILDA_STATIC}/css/tilda-animation-2.0.min.css`,        dest: 'css/tilda-animation-2.0.min.css' },
  { url: `${TILDA_STATIC}/css/tilda-slds-1.4.min.css`,             dest: 'css/tilda-slds-1.4.min.css' },
  { url: `${TILDA_STATIC}/css/tilda-menu-widgeticons-1.0.min.css`, dest: 'css/tilda-menu-widgeticons-1.0.min.css' },
];

// ── Tilda JS files ───────────────────────────────────────────────────────────
const JS_FILES = [
  { url: `${TILDA_NEO}/js/tilda-fallback-1.0.min.js`,             dest: 'js/tilda-fallback-1.0.min.js' },
  { url: `${TILDA_STATIC}/js/tilda-polyfill-1.0.min.js`,          dest: 'js/tilda-polyfill-1.0.min.js' },
  { url: `${TILDA_STATIC}/js/jquery-1.10.2.min.js`,               dest: 'js/jquery-1.10.2.min.js' },
  { url: `${TILDA_STATIC}/js/tilda-scripts-3.0.min.js`,           dest: 'js/tilda-scripts-3.0.min.js' },
  { url: `${TILDA_STATIC}/ws/project24653133/tilda-blocks-page135993773.min.js?t=1778075009`, dest: 'js/tilda-blocks.min.js' },
  { url: `${TILDA_STATIC}/js/tilda-lazyload-1.0.min.js`,          dest: 'js/tilda-lazyload-1.0.min.js' },
  { url: `${TILDA_STATIC}/js/tilda-animation-2.0.min.js`,         dest: 'js/tilda-animation-2.0.min.js' },
  { url: `${TILDA_STATIC}/js/tilda-zero-1.1.min.js`,              dest: 'js/tilda-zero-1.1.min.js' },
  { url: `${TILDA_STATIC}/js/tilda-slds-1.4.min.js`,              dest: 'js/tilda-slds-1.4.min.js' },
  { url: `${TILDA_STATIC}/js/hammer.min.js`,                       dest: 'js/hammer.min.js' },
  { url: `${TILDA_STATIC}/js/tilda-video-1.0.min.js`,             dest: 'js/tilda-video-1.0.min.js' },
  { url: `${TILDA_STATIC}/js/tilda-menu-1.0.min.js`,              dest: 'js/tilda-menu-1.0.min.js' },
  { url: `${TILDA_STATIC}/js/tilda-menu-widgeticons-1.0.min.js`,  dest: 'js/tilda-menu-widgeticons-1.0.min.js' },
  { url: `${TILDA_STATIC}/js/tilda-animation-sbs-1.0.min.js`,     dest: 'js/tilda-animation-sbs-1.0.min.js' },
  { url: `${TILDA_STATIC}/js/tilda-zero-scale-1.0.min.js`,        dest: 'js/tilda-zero-scale-1.0.min.js' },
  { url: `${TILDA_STATIC}/js/tilda-skiplink-1.0.min.js`,          dest: 'js/tilda-skiplink-1.0.min.js' },
  { url: `${TILDA_STATIC}/js/tilda-events-1.0.min.js`,            dest: 'js/tilda-events-1.0.min.js' },
];

// ── Additional tildacdn.ink images (separate CDN domain) ─────────────────────
const INK_IMAGE_URLS = [
  'https://static.tildacdn.ink/tild6263-3364-4436-b136-666563343234/Frame_47_1.svg',
  'https://static.tildacdn.ink/tild6366-3030-4262-a232-313466623833/Frame_49_1.svg',
  'https://optim.tildacdn.ink/tild3135-3035-4237-a262-626433356137/-/format/webp/Frame_55.jpg.webp',
];

// ── Image URLs (all 78 from static.tildacdn.net) ─────────────────────────────
const IMAGE_URLS = [
  'https://static.tildacdn.net/tild3032-6237-4262-a536-663761643438/Group_70.svg',
  'https://static.tildacdn.net/tild3032-6461-4638-b665-653561306339/Group_58_1.svg',
  'https://static.tildacdn.net/tild3034-3339-4862-a265-323365623163/Group_7_5.svg',
  'https://static.tildacdn.net/tild3035-3235-4637-b162-653132393634/Group_71_2.svg',
  'https://static.tildacdn.net/tild3037-6665-4437-b133-343961643031/Ellipse_12.jpg',
  'https://static.tildacdn.net/tild3038-3136-4230-b634-623139366436/Rectangle_18.jpg',
  'https://static.tildacdn.net/tild3063-6163-4262-b135-306166363230/Frame_58.svg',
  'https://static.tildacdn.net/tild3064-6239-4437-a261-343465313437/Frame_45.png',
  'https://static.tildacdn.net/tild3131-3134-4366-a465-396337663535/image_14_1.jpg',
  'https://static.tildacdn.net/tild3131-3332-4464-a634-323266663564/Rectangle_25_1.jpg',
  'https://static.tildacdn.net/tild3132-6563-4133-b763-313635616363/Group_68.svg',
  'https://static.tildacdn.net/tild3134-3164-4931-a438-393266643330/Group_7_1.svg',
  'https://static.tildacdn.net/tild3164-6334-4831-b665-303865353262/Group_62.svg',
  'https://static.tildacdn.net/tild3230-6465-4839-b931-633334376362/Rectangle_29_1.jpg',
  'https://static.tildacdn.net/tild3233-3535-4666-a438-633536366638/Rectangle_24_1.jpg',
  'https://static.tildacdn.net/tild3237-6131-4833-b164-373337323663/Group_71.svg',
  'https://static.tildacdn.net/tild3261-3564-4730-b636-356163393464/Group_61_2.svg',
  'https://static.tildacdn.net/tild3261-6431-4436-b362-373633383335/Rectangle_27_2_1.jpg',
  'https://static.tildacdn.net/tild3262-3837-4365-b865-616632313733/Group_8_1.svg',
  'https://static.tildacdn.net/tild3262-3865-4138-a265-373732613732/Group_7_2.svg',
  'https://static.tildacdn.net/tild3332-3065-4235-b962-346238623062/image_12_2_1.jpg',
  'https://static.tildacdn.net/tild3334-3066-4230-b462-613165323466/Frame_32.svg',
  'https://static.tildacdn.net/tild3334-3466-4239-b061-323162386565/Rectangle_28_1.jpg',
  'https://static.tildacdn.net/tild3337-3165-4132-b932-633637636532/Rectangle_26_2_1.jpg',
  'https://static.tildacdn.net/tild3364-3431-4032-b737-356163303763/Rectangle_20.jpg',
  'https://static.tildacdn.net/tild3431-6338-4331-a135-646233393836/Avatars_1_1.png',
  'https://static.tildacdn.net/tild3434-6239-4165-b430-316435326533/Group_2_5.svg',
  'https://static.tildacdn.net/tild3466-3430-4161-b863-346566623932/Rectangle_24_2_1_1_1.png',
  'https://static.tildacdn.net/tild3535-3065-4236-b431-326464633431/Frame_57.svg',
  'https://static.tildacdn.net/tild3536-3038-4837-a637-393363656438/Frame_48_3.svg',
  'https://static.tildacdn.net/tild3562-6231-4133-a361-356365323164/Group_64_3.svg',
  'https://static.tildacdn.net/tild3562-6231-4161-b666-383634363834/Frame_59.svg',
  'https://static.tildacdn.net/tild3635-3733-4639-b032-353066613862/Group_59.svg',
  'https://static.tildacdn.net/tild3662-6463-4230-b531-613564626338/Frame_56.svg',
  'https://static.tildacdn.net/tild3665-6662-4732-a331-306333656135/Group_69.svg',
  'https://static.tildacdn.net/tild3733-6537-4862-a332-343935356238/Group_2_2.svg',
  'https://static.tildacdn.net/tild3735-6638-4264-b334-343962393332/Vector_2.svg',
  'https://static.tildacdn.net/tild3739-3264-4463-b337-343038613266/Frame_19.svg',
  'https://static.tildacdn.net/tild3761-3931-4064-a365-373165626533/Frame_29.svg',
  'https://static.tildacdn.net/tild3762-3137-4161-a631-353761303463/Group_70_1.svg',
  'https://static.tildacdn.net/tild3762-3537-4163-a361-623635326130/Rectangle_30_1.jpg',
  'https://static.tildacdn.net/tild3832-3733-4961-a437-326534613763/Group_65.svg',
  'https://static.tildacdn.net/tild3835-3438-4535-b332-643130303464/Frame_46.png',
  'https://static.tildacdn.net/tild3863-3365-4261-b964-643435323832/Frame_58_1.svg',
  'https://static.tildacdn.net/tild3932-3239-4966-b633-383963653564/Group_67.svg',
  'https://static.tildacdn.net/tild3937-3462-4531-b361-303031643463/Rectangle_17_1.jpg',
  'https://static.tildacdn.net/tild3939-3131-4233-b634-616366306234/Ellipse_11.jpg',
  'https://static.tildacdn.net/tild3963-3738-4664-b736-326633636532/Star_1.svg',
  'https://static.tildacdn.net/tild3963-3761-4636-b730-316264326231/Group_62_1.svg',
  'https://static.tildacdn.net/tild3965-3861-4433-a432-393939396536/Ellipse_10.jpg',
  'https://static.tildacdn.net/tild6161-6633-4639-b861-343831383332/Frame_58_2.svg',
  'https://static.tildacdn.net/tild6164-3866-4638-a630-666133663966/Ellipse_11_1.jpg',
  'https://static.tildacdn.net/tild6232-6564-4265-a261-396334626464/Frame_47.png',
  'https://static.tildacdn.net/tild6235-6364-4238-a239-623734313866/Group_64_1.svg',
  'https://static.tildacdn.net/tild6236-3633-4636-b533-616635653662/Frame_61.svg',
  'https://static.tildacdn.net/tild6238-6231-4161-a237-303161646261/Rectangle_19.jpg',
  'https://static.tildacdn.net/tild6261-3539-4130-b961-326563343434/Frame_46_1.svg',
  'https://static.tildacdn.net/tild6263-3134-4163-b766-613638373838/image_12_3_1.jpg',
  'https://static.tildacdn.net/tild6265-3034-4137-b439-303634646331/Group_63.svg',
  'https://static.tildacdn.net/tild6266-6133-4163-b239-326538366131/Frame_33.svg',
  'https://static.tildacdn.net/tild6334-3134-4331-b662-343362376263/Group_8_2.svg',
  'https://static.tildacdn.net/tild6335-6536-4132-a161-373538313435/Frame_30.svg',
  'https://static.tildacdn.net/tild6361-3631-4833-b834-303165363466/Frame_46.png',
  'https://static.tildacdn.net/tild6430-3531-4261-a539-343636323735/Group_60_1.svg',
  'https://static.tildacdn.net/tild6431-3263-4335-b333-636163383266/Group_61_1.svg',
  'https://static.tildacdn.net/tild6432-3830-4734-b632-376435303132/Group_2_4.svg',
  'https://static.tildacdn.net/tild6432-6636-4230-b433-626433323332/Frame_58_3.svg',
  'https://static.tildacdn.net/tild6435-6435-4131-b035-373063613863/Frame_46.svg',
  'https://static.tildacdn.net/tild6436-3731-4839-b235-643461623332/Star_5.svg',
  'https://static.tildacdn.net/tild6463-3834-4262-a431-623161373563/Group_66.svg',
  'https://static.tildacdn.net/tild6531-6263-4861-b934-386561663365/Frame_60.svg',
  'https://static.tildacdn.net/tild6532-3239-4335-b233-333163303766/Rectangle_23.jpg',
  'https://static.tildacdn.net/tild6534-3334-4238-a435-393333323330/Rectangle_57_1.jpg',
  'https://static.tildacdn.net/tild6563-3639-4032-a565-383834346465/Group_61_3.svg',
  'https://static.tildacdn.net/tild6564-6666-4230-b233-336663653063/image_13_1.jpg',
  'https://static.tildacdn.net/tild6631-6266-4032-b336-396330616333/Frame_62.svg',
  'https://static.tildacdn.net/tild6638-3962-4330-a261-343839643361/Group_72.svg',
  'https://static.tildacdn.net/tild6666-6134-4539-b338-393561303963/Group_71_1.svg',
];

// ── Google Fonts — Montserrat only ───────────────────────────────────────────
async function localizeGoogleFonts() {
  log('Localizing Google Fonts (Montserrat)...');
  const fontsDir = path.join(CLONE_DIR, 'fonts');
  mkdirSync(fontsDir, { recursive: true });

  const weights = ['100', '200', '300', '400', '500', '600', '700', '800', '900'];
  const cssLines = [];

  for (const weight of weights) {
    const apiUrl = `https://fonts.googleapis.com/css2?family=Montserrat:wght@${weight}&display=swap`;
    let css;
    try {
      const res = await fetch(apiUrl, {
        headers: { ...HEADERS, 'Accept': 'text/css' },
        signal: AbortSignal.timeout(15000),
      });
      css = await res.text();
    } catch(e) { log(`  WARN: font fetch failed: Montserrat ${weight}`); continue; }

    const woffUrls = [...css.matchAll(/url\(([^)]+\.woff2[^)]*)\)/g)].map(m => m[1].replace(/['"]/g, ''));
    for (const woffUrl of woffUrls) {
      const fname = `montserrat-${weight}.woff2`;
      const dest = path.join(fontsDir, fname);
      await download(woffUrl, dest);
      css = css.replace(woffUrl, `${CLONE_PATH}/fonts/${fname}`);
    }
    cssLines.push(css);
  }

  writeFileSync(path.join(CLONE_DIR, 'fonts.css'), cssLines.join('\n'), 'utf-8');
  log(`  Saved fonts.css (${cssLines.length} font-face blocks)`);
}

// ── HTML processing ───────────────────────────────────────────────────────────
function buildHtml(rawHtml) {
  // 1. Extract head inline styles (Tilda has CSS variables/resets in head)
  const headMatch = rawHtml.match(/<head[^>]*>([\s\S]*?)<\/head>/i);
  const headStyles = headMatch
    ? [...headMatch[1].matchAll(/<style[^>]*>[\s\S]*?<\/style>/gi)].map(m => m[0]).join('\n')
    : '';

  // 2. Extract body (grab body class attr too — Tilda uses body classes)
  const bodyMatch = rawHtml.match(/<body([^>]*)>([\s\S]*)<\/body>/i);
  if (!bodyMatch) throw new Error('No <body> found');
  // Preserve body class for Tilda layout (e.g. t-body_scrollable-fix-for-android)
  const bodyAttrs = bodyMatch[1];
  const bodyClassMatch = bodyAttrs.match(/class="([^"]*)"/);
  const bodyClassStyle = bodyClassMatch
    ? `<div class="${bodyClassMatch[1]}" style="margin:0;padding:0">\n`
    : '';
  let html = headStyles + '\n' + (bodyClassStyle || '') + bodyMatch[2] + (bodyClassStyle ? '</div>' : '');

  // 3. Remove GTM (two occurrences — head + noscript)
  html = html.replace(/<!-- Google Tag Manager[\s\S]*?End Google Tag Manager -->/gi, '');
  html = html.replace(/<!-- Google Tag Manager \(noscript\)[\s\S]*?End Google Tag Manager \(noscript\) -->/gi, '');
  html = html.replace(/<script[^>]*googletagmanager[^>]*>[\s\S]*?<\/script>/gi, '');
  html = html.replace(/<script[^>]*gtag[^>]*>[\s\S]*?<\/script>/gi, '');
  html = html.replace(/<script[^>]*dataLayer[^>]*>[\s\S]*?<\/script>/gi, '');
  html = html.replace(/<noscript>[\s\S]*?<\/noscript>/gi, '');

  // 4. Remove noona.app booking links → replace with demo anchor
  html = html.replace(/https?:\/\/noona\.app\/[^"'\s]*/g, '#rezervace');

  // 5. Replace Google Maps iframe with static address card
  html = html.replace(
    /<iframe[^>]*google\.com\/maps[^>]*>[\s\S]*?<\/iframe>/gi,
    `<div style="width:100%;height:400px;background:#1a1a1a;display:flex;align-items:center;justify-content:center;border-radius:8px;color:#ccc;font-family:Montserrat,sans-serif;">
      <div style="text-align:center;padding:40px;">
        <div style="font-size:32px;margin-bottom:16px;">📍</div>
        <div style="font-size:18px;font-weight:600;margin-bottom:8px;">Demo ulice 12</div>
        <div style="font-size:14px;color:#888;">Praha 1, 110 00</div>
      </div>
    </div>`
  );

  // 6. Remove Tilda external tracking/analytics scripts
  html = html.replace(/<script[^>]*tilda-stat[^>]*>[\s\S]*?<\/script>/gi, '');
  html = html.replace(/<script[^>]*tildacdn[^>]*analytics[^>]*>[\s\S]*?<\/script>/gi, '');

  // 6b. Remove kinescope video embeds (iframes only)
  html = html.replace(
    /<iframe[^>]*kinescope\.io[^>]*>[\s\S]*?<\/iframe>/gi,
    `<div style="width:100%;aspect-ratio:16/9;background:#1a1a1a;display:flex;align-items:center;justify-content:center;border-radius:8px;">
      <div style="text-align:center;color:#888;font-family:Montserrat,sans-serif;">
        <div style="font-size:48px;margin-bottom:12px;">▶</div>
        <div style="font-size:13px;">Video ukázka</div>
      </div>
    </div>`
  );
  // Neutralize kinescope URLs (just replace URLs, don't remove script blocks — the
  // scripts don't run in dangerouslySetInnerHTML anyway)
  html = html.replace(/https?:\/\/kinescope\.io\/[^"'\s,)]*/gi, '#');

  // 6c. Remove GSAP CDN script (not needed for static clone)
  html = html.replace(/<script[^>]*cdnjs\.cloudflare\.com[^>]*><\/script>/gi, '');

  // 6d. Replace social media links with demo placeholders
  html = html.replace(/https?:\/\/www\.facebook\.com\/[^"'\s]*/g, '#socialni-site');
  html = html.replace(/https?:\/\/www\.instagram\.com\/[^"'\s]*/g, '#socialni-site');
  html = html.replace(/https?:\/\/bananza\.cz\/[^"'\s]*/g, '#rezervace');

  // 6e. Replace maps goo.gl link
  html = html.replace(/https?:\/\/maps\.app\.goo\.gl\/[^"'\s]*/g, '#mapa');

  // 7. Localize ALL static.tildacdn.net + static.tildacdn.ink image/asset URLs
  html = html.replace(/https?:\/\/static\.tildacdn\.net\/(tild[a-f0-9-]+\/[^"'\s)>]+)/g,
    (_, p) => `${CLONE_PATH}/${p}`);
  html = html.replace(/https?:\/\/static\.tildacdn\.ink\/(tild[a-f0-9-]+\/[^"'\s)>]+)/g,
    (_, p) => `${CLONE_PATH}/${p}`);
  // optim.tildacdn.ink (webp optimized versions) → map to same tild path
  html = html.replace(/https?:\/\/optim\.tildacdn\.ink\/(tild[a-f0-9-]+)\/-\/[^"'\s)>]*\/(Frame_55\.jpg\.webp)/g,
    (_, hash, fname) => `${CLONE_PATH}/${hash}/${fname}`);
  // thb.tildacdn.net (tiny thumbnails used as blur-up src) → replace with blank gif
  html = html.replace(/https?:\/\/thb\.tildacdn\.net\/[^"'\s)>]*/g,
    'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7');

  // 8. Localize static.tildacdn.net/ws project-specific assets
  html = html.replace(
    /https?:\/\/static\.tildacdn\.net\/ws\/project24653133\/tilda-blocks-page135993773\.min\.js[^"'\s]*/g,
    `${CLONE_PATH}/js/tilda-blocks.min.js`
  );
  html = html.replace(
    /https?:\/\/static\.tildacdn\.net\/ws\/project24653133\/tilda-blocks-page135993773\.min\.css[^"'\s]*/g,
    `${CLONE_PATH}/css/tilda-blocks.min.css`
  );

  // 9. Localize static.tildacdn.net/js and /css paths
  html = html.replace(/https?:\/\/static\.tildacdn\.net\/(js\/[^"'\s>)]+)/g,
    (_, p) => `${CLONE_PATH}/${p}`);
  html = html.replace(/https?:\/\/static\.tildacdn\.net\/(css\/[^"'\s>)]+)/g,
    (_, p) => `${CLONE_PATH}/${p}`);

  // 10. Localize neo.tildacdn.com
  html = html.replace(/https?:\/\/neo\.tildacdn\.com\/(js\/[^"'\s>)]+)/g,
    (_, p) => `${CLONE_PATH}/${p}`);

  // 11. Replace Google Fonts with local fonts.css
  html = html.replace(/<link[^>]*fonts\.googleapis\.com[^>]*>/gi,
    `<link rel="stylesheet" href="${CLONE_PATH}/fonts.css">`);
  html = html.replace(/<link[^>]*fonts\.gstatic\.com[^>]*>/gi, '');

  // 12. Remove any remaining external tilda scripts
  html = html.replace(/<script[^>]*ws\.tildacdn\.com[^>]*>[\s\S]*?<\/script>/gi, '');

  // 13. DEMO TEXTY — brand replacements
  html = html.replace(/Jarka Čechová/g, 'Demo Salón');
  html = html.replace(/Jarky Čechové/g, 'Demo Salónu');
  html = html.replace(/jarkacechova\.cz/g, 'demo.local');
  html = html.replace(/info@jarkacechova\.cz/g, 'info@demo.local');
  html = html.replace(/\+420\s*737\s*610\s*555/g, '+420 608 288 777');
  html = html.replace(/Politických vězňů 23/g, 'Demo ulice 12');
  html = html.replace(/Praha 1,?\s*110 00/g, 'Praha 1, 110 00');
  // Opening hours
  html = html.replace(/Po[–-]Pá[^<]{0,30}8:00[^<]{0,30}21:00/g, 'Po–Pá: 09:00–18:00');
  html = html.replace(/So[^<]{0,20}10:00[^<]{0,20}16:00/g, 'So: 10:00–15:00');
  html = html.replace(/Ne[^<]{0,20}Zavřeno/g, 'Ne: Zavřeno');
  // Year stats
  html = html.replace(/od roku 2009/g, 'od roku 2010');
  html = html.replace(/23 let/g, '15 let');
  html = html.replace(/10 let/g, '8 let');
  html = html.replace(/6 nominací/g, '5 nominací');
  // T396 splits stats into separate elements — replace standalone numbers too
  // "23" standalone → "15", "10" standalone in stats → "8", "6" in stats → "5"
  html = html.replace(/>23<\/div>/g, '>15</div>');
  html = html.replace(/>10 nominací/g, '>6 nominací');
  html = html.replace(/>6\s*<\/div>/g, '>5</div>');
  // Team member names → generic demo names
  html = html.replace(/Jaroslava Čechová/g, 'Lenka Nováková');
  html = html.replace(/Pavlína Kirschnerová/g, 'Petra Kovářová');
  html = html.replace(/Marta Abuladze/g, 'Marta Svobodová');
  html = html.replace(/Markéta Hanzlíková/g, 'Markéta Horváth');
  html = html.replace(/Jana Michálková/g, 'Jana Procházková');
  html = html.replace(/Eliška Matoušková/g, 'Eliška Veselá');
  html = html.replace(/Markéta Altmanová/g, 'Markéta Bílá');
  // Remove "Vytvořilo bananza.cz" footer credit entirely
  html = html.replace(/Vytvořilo\s*<strong[^>]*>[\s\S]*?bananza\.cz[\s\S]*?<\/strong>/gi, '');
  html = html.replace(/Vytvořilo bananza\.cz/gi, '');

  // 14. DEMO LOGO — replace Frame_45 (floating large logo) with inline SVG
  html = html.replace(
    /<img[^>]*Frame_45[^>]*>/gi,
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 60" style="height:44px;display:block">
      <text x="10" y="26" font-family="Montserrat,sans-serif" font-size="13" font-weight="700" fill="#fff" letter-spacing="4">DEMO</text>
      <text x="10" y="44" font-family="Montserrat,sans-serif" font-size="9" font-weight="400" fill="#bbb" letter-spacing="3">HAIR SALON</text>
    </svg>`
  );

  // 14b. Frame_58/59/60/61 variants — these are the large JARKA ČECHOVÁ salon logo (273x224)
  // They appear in: T396 hero center, dark video section, review decorations
  // Replace with a compact inline SVG that fits in T396 absolutely-positioned slot
  const INLINE_BRAND_LOGO = `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="160" viewBox="0 0 200 160" style="display:block;">` +
    `<rect x="50" y="10" width="100" height="80" rx="6" fill="#8A6F28"/>` +
    `<text x="100" y="62" font-family="Montserrat,sans-serif" font-size="36" font-weight="700" fill="#fff" text-anchor="middle">DS</text>` +
    `<text x="100" y="115" font-family="Montserrat,sans-serif" font-size="15" font-weight="700" fill="#1E1E1E" text-anchor="middle" letter-spacing="3">DEMO SALÓN</text>` +
    `<text x="100" y="137" font-family="Montserrat,sans-serif" font-size="9" font-weight="400" fill="#888" text-anchor="middle" letter-spacing="2">UKÁZKOVÁ ŠABLONA</text>` +
    `</svg>`;
  html = html.replace(/<img[^>]*Frame_5[89][^>]*>/gi, INLINE_BRAND_LOGO);
  html = html.replace(/<img[^>]*Frame_6[012][^>]*>/gi, INLINE_BRAND_LOGO);

  // 14c. Group_65 (wide logo 461x78) → compact inline
  html = html.replace(
    /<img[^>]*Group_65[^>]*>/gi,
    `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="50" viewBox="0 0 300 50" style="display:block;">` +
    `<rect x="0" y="5" width="40" height="40" rx="4" fill="#8A6F28"/>` +
    `<text x="20" y="32" font-family="Montserrat,sans-serif" font-size="16" font-weight="700" fill="#fff" text-anchor="middle">DS</text>` +
    `<text x="50" y="24" font-family="Montserrat,sans-serif" font-size="14" font-weight="700" fill="#1E1E1E" letter-spacing="3">DEMO SALÓN</text>` +
    `<text x="50" y="40" font-family="Montserrat,sans-serif" font-size="8" font-weight="400" fill="#888" letter-spacing="2">UKÁZKOVÁ ŠABLONA</text>` +
    `</svg>`
  );

  // 14d. Replace nav logo img elements with inline SVG
  const INLINE_NAV_LOGO = `<svg xmlns="http://www.w3.org/2000/svg" width="120" height="20" viewBox="0 0 120 20" style="display:block;height:20px;">` +
    `<rect width="22" height="20" rx="2" fill="#8A6F28"/>` +
    `<text x="11" y="14" font-family="Montserrat,sans-serif" font-size="10" font-weight="700" fill="#fff" text-anchor="middle">DS</text>` +
    `<text x="32" y="14" font-family="Montserrat,sans-serif" font-size="8" font-weight="400" fill="currentColor" letter-spacing="1.5">DEMO SALÓN</text>` +
    `</svg>`;
  html = html.replace(/<img[^>]*Group_2_\d+\.svg[^>]*\/?>/gi, INLINE_NAV_LOGO);

  // 15. Hero subtitle
  html = html.replace(/HAIR SALON PRAHA 1/gi, 'DEMO ŠABLONA');
  html = html.replace(/Hair salon Jarka Čechová/gi, 'Demo Hair Salon');

  // 15b. Suppress T396 re-initialization — positions are already baked in from rendered HTML.
  // Disable tilda-zero-init.js effect by neutralizing t396_init calls inline.
  // We add a script that marks all T396 artboards as already initialized.
  const T396_SUPPRESS = `<script>
(function(){
  // T396 positions are pre-baked from rendered HTML — suppress re-init to prevent flash of unstyled content
  window.__t396_pre_initialized = true;
  var orig = window.t396_init;
  Object.defineProperty(window, 't396_init', {
    configurable: true,
    set: function(fn) { orig = fn; },
    get: function() {
      return function(id) {
        // Only run init if not already positioned (has no left/top inline style)
        var el = document.getElementById('rec' + id) || document.querySelector('[data-record-id="' + id + '"]');
        if (el) {
          var artboard = el.querySelector('.t396__artboard');
          if (artboard) {
            var elems = artboard.querySelectorAll('.t396__elem');
            var hasPositions = Array.from(elems).some(function(e) { return e.style.left || e.style.top; });
            if (hasPositions) return; // already positioned from baked HTML
          }
        }
        if (typeof orig === 'function') orig(id);
      };
    }
  });
})();
</script>`;
  // Inject before first T396 block
  html = html.replace(/(<div[^>]*data-record-type="396")/, T396_SUPPRESS + '\n$1');

  // 16. Prepend CSS links (Tilda externals localized + fonts)
  const cssLinks = [
    `<link rel="stylesheet" href="${CLONE_PATH}/fonts.css">`,
    `<link rel="stylesheet" href="${CLONE_PATH}/css/tilda-grid-3.0.min.css">`,
    `<link rel="stylesheet" href="${CLONE_PATH}/css/tilda-blocks.min.css">`,
    `<link rel="stylesheet" href="${CLONE_PATH}/css/tilda-animation-2.0.min.css">`,
    `<link rel="stylesheet" href="${CLONE_PATH}/css/tilda-slds-1.4.min.css">`,
    `<link rel="stylesheet" href="${CLONE_PATH}/css/tilda-menu-widgeticons-1.0.min.css">`,
  ].join('\n');

  // Remove original link tags for CSS (already handled above in tildacdn replacement)
  // but also remove any remaining external ones not caught
  html = html.replace(/<link[^>]*static\.tildacdn\.net[^>]*>/gi, '');
  html = html.replace(/<link[^>]*neo\.tildacdn\.com[^>]*>/gi, '');

  // 17. Disable Tilda AJAX lazy-loading (prevents fetching sections from Tilda CDN)
  html = html.replace(/data-tilda-lazy="yes"/g, 'data-tilda-lazy="no"');

  // 17b. T396 artboards: rendered HTML may have xutem class (visibility:hidden) if captured
  // before t396_init ran. Force visibility visible on all T396 elements.
  html = html.replace(/class="([^"]*\bt396__artboard\b[^"]*\bxutem\b[^"]*)"/g,
    (_, cls) => `class="${cls.replace(/\bxutem\b/, 'xjfth').trim()}"`);
  // Also set visibility:visible on tn-elem items that may have visibility:hidden
  html = html.replace(/(<div[^>]*class="[^"]*\bt396__elem\b[^"]*"[^>]*style="[^"]*)visibility:\s*hidden/gi,
    '$1visibility:visible');

  // 18. Pre-convert data-original → src (bypass JS lazy loading for images)
  html = html.replace(/(<img[^>]+)\s+src="[^"]*"([^>]+)\s+data-original="([^"]+)"/g,
    (_, before, after, orig) => `${before} src="${orig}"${after}`);
  html = html.replace(/(<img[^>]+)\s+data-original="([^"]+)"([^>]*)\s+src="[^"]*"/g,
    (_, before, orig, after) => `${before} src="${orig}"${after}`);
  // Remaining data-original without src
  html = html.replace(/data-original="([^"]*)"/g, 'src="$1"');

  // 18a. Fix HTML-entity-encoded quotes in style attributes.
  // background-image:url(&quot;...&quot;) → url('...') (use single quotes to avoid breaking outer attr)
  html = html.replace(/style="([^"]*)"/g, (_, styleContent) => {
    // Replace &quot; with single-quote ONLY when inside url(...) to avoid breaking the outer style="..." attribute
    const fixed = styleContent.replace(/url\(&quot;([^&]+)&quot;\)/g, "url('$1')");
    const decoded = fixed.replace(/&amp;/g, '&');
    return `style="${decoded}"`;
  });

  // 18b. Convert t-bgimg divs: apply src as inline background-image AFTER all src URLs are finalized
  // Uses lazy quantifiers to avoid consuming src attribute
  // NOTE: Always override background-image when src is a real local path (not data:)
  // Playwright may have rendered a thb (thumbnail) URL into style; we replaced it with blank gif.
  html = html.replace(/<div([^>]*?t-bgimg[^>]*?)src="([^"]+)"([^>]*?)>/gs, (_, pre, src, post) => {
    if (!src || src.startsWith('data:')) {
      return `<div${pre}src="${src}"${post}>`;
    }
    const bgStyle = `background-image:url('${src}');background-size:cover;background-position:center;`;
    // Always override/set background-image using the real src path
    if (/style="/.test(post)) {
      // Replace existing background-image in style or prepend
      const newPost = post.replace(/background-image:[^;]+;/g, '').replace(/style="/, `style="${bgStyle}`);
      return `<div${pre}src="${src}"${newPost}>`;
    }
    if (/style="/.test(pre)) {
      const newPre = pre.replace(/background-image:[^;]+;/g, '').replace(/style="/, `style="${bgStyle}`);
      return `<div${newPre}src="${src}"${post}>`;
    }
    return `<div${pre}src="${src}"${post} style="${bgStyle}">`;
  });

  // 18c. Replace rec2190094773 (brand showcase T396) with static demo reviews.
  // The original Tilda dynamic review cards are loaded via AJAX and never appear in static HTML.
  // We replace the full brand showcase strip with 4 static review cards matching Tilda's style.
  const STATIC_REVIEWS = `<div id="rec2190094773_static" style="background:#fff;padding:40px 0 60px;width:100%;box-sizing:border-box;">
  <div style="max-width:1200px;margin:0 auto;padding:0 24px;display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:24px;">
    <div style="background:#fff;border:1px solid #e8e8e8;border-radius:20px;padding:28px 24px;display:flex;flex-direction:column;gap:16px;">
      <div style="display:flex;gap:4px;">
        <svg width="18" height="18" viewBox="0 0 18 18" fill="#8A6F28"><path d="M9 1l2.47 5h5.33l-4.31 3.13 1.64 5.06L9 11.08l-5.13 3.11 1.64-5.06L1.2 6h5.33z"/></svg>
        <svg width="18" height="18" viewBox="0 0 18 18" fill="#8A6F28"><path d="M9 1l2.47 5h5.33l-4.31 3.13 1.64 5.06L9 11.08l-5.13 3.11 1.64-5.06L1.2 6h5.33z"/></svg>
        <svg width="18" height="18" viewBox="0 0 18 18" fill="#8A6F28"><path d="M9 1l2.47 5h5.33l-4.31 3.13 1.64 5.06L9 11.08l-5.13 3.11 1.64-5.06L1.2 6h5.33z"/></svg>
        <svg width="18" height="18" viewBox="0 0 18 18" fill="#8A6F28"><path d="M9 1l2.47 5h5.33l-4.31 3.13 1.64 5.06L9 11.08l-5.13 3.11 1.64-5.06L1.2 6h5.33z"/></svg>
        <svg width="18" height="18" viewBox="0 0 18 18" fill="#8A6F28"><path d="M9 1l2.47 5h5.33l-4.31 3.13 1.64 5.06L9 11.08l-5.13 3.11 1.64-5.06L1.2 6h5.33z"/></svg>
      </div>
      <p style="margin:0;font-size:15px;line-height:1.6;color:#1e1e1e;font-family:Montserrat,sans-serif;">Absolutně nejlepší kadeřnictví v centru Prahy. Péče o zákazníka je na prvním místě, výsledek vždy překoná očekávání. Vrátím se určitě!</p>
      <div style="display:flex;align-items:center;gap:12px;margin-top:auto;">
        <img src="/clones/studio-jarka/tild3939-3131-4233-b634-616366306234/Ellipse_11.jpg" alt="Simona M." style="width:44px;height:44px;border-radius:50%;object-fit:cover;flex-shrink:0;">
        <div>
          <div style="font-size:14px;font-weight:600;color:#1e1e1e;font-family:Montserrat,sans-serif;">Simona Matějovská</div>
          <div style="font-size:11px;color:#888;font-family:Montserrat,sans-serif;">Google recenze · 2025</div>
        </div>
      </div>
    </div>
    <div style="background:#fff;border:1px solid #e8e8e8;border-radius:20px;padding:28px 24px;display:flex;flex-direction:column;gap:16px;">
      <div style="display:flex;gap:4px;">
        <svg width="18" height="18" viewBox="0 0 18 18" fill="#8A6F28"><path d="M9 1l2.47 5h5.33l-4.31 3.13 1.64 5.06L9 11.08l-5.13 3.11 1.64-5.06L1.2 6h5.33z"/></svg>
        <svg width="18" height="18" viewBox="0 0 18 18" fill="#8A6F28"><path d="M9 1l2.47 5h5.33l-4.31 3.13 1.64 5.06L9 11.08l-5.13 3.11 1.64-5.06L1.2 6h5.33z"/></svg>
        <svg width="18" height="18" viewBox="0 0 18 18" fill="#8A6F28"><path d="M9 1l2.47 5h5.33l-4.31 3.13 1.64 5.06L9 11.08l-5.13 3.11 1.64-5.06L1.2 6h5.33z"/></svg>
        <svg width="18" height="18" viewBox="0 0 18 18" fill="#8A6F28"><path d="M9 1l2.47 5h5.33l-4.31 3.13 1.64 5.06L9 11.08l-5.13 3.11 1.64-5.06L1.2 6h5.33z"/></svg>
        <svg width="18" height="18" viewBox="0 0 18 18" fill="#8A6F28"><path d="M9 1l2.47 5h5.33l-4.31 3.13 1.64 5.06L9 11.08l-5.13 3.11 1.64-5.06L1.2 6h5.33z"/></svg>
      </div>
      <p style="margin:0;font-size:15px;line-height:1.6;color:#1e1e1e;font-family:Montserrat,sans-serif;">Skvělé barvení a střih, přesně podle mých představ. Prostředí je nádherné, profesionální přístup. Velmi doporučuji každé ženě, která si chce dopřát péči.</p>
      <div style="display:flex;align-items:center;gap:12px;margin-top:auto;">
        <img src="/clones/studio-jarka/tild3965-3861-4433-a432-393939396536/Ellipse_10.jpg" alt="Ala M." style="width:44px;height:44px;border-radius:50%;object-fit:cover;flex-shrink:0;">
        <div>
          <div style="font-size:14px;font-weight:600;color:#1e1e1e;font-family:Montserrat,sans-serif;">Ala Mann</div>
          <div style="font-size:11px;color:#888;font-family:Montserrat,sans-serif;">Google recenze · 2025</div>
        </div>
      </div>
    </div>
    <div style="background:#fff;border:1px solid #e8e8e8;border-radius:20px;padding:28px 24px;display:flex;flex-direction:column;gap:16px;">
      <div style="display:flex;gap:4px;">
        <svg width="18" height="18" viewBox="0 0 18 18" fill="#8A6F28"><path d="M9 1l2.47 5h5.33l-4.31 3.13 1.64 5.06L9 11.08l-5.13 3.11 1.64-5.06L1.2 6h5.33z"/></svg>
        <svg width="18" height="18" viewBox="0 0 18 18" fill="#8A6F28"><path d="M9 1l2.47 5h5.33l-4.31 3.13 1.64 5.06L9 11.08l-5.13 3.11 1.64-5.06L1.2 6h5.33z"/></svg>
        <svg width="18" height="18" viewBox="0 0 18 18" fill="#8A6F28"><path d="M9 1l2.47 5h5.33l-4.31 3.13 1.64 5.06L9 11.08l-5.13 3.11 1.64-5.06L1.2 6h5.33z"/></svg>
        <svg width="18" height="18" viewBox="0 0 18 18" fill="#8A6F28"><path d="M9 1l2.47 5h5.33l-4.31 3.13 1.64 5.06L9 11.08l-5.13 3.11 1.64-5.06L1.2 6h5.33z"/></svg>
        <svg width="18" height="18" viewBox="0 0 18 18" fill="#8A6F28"><path d="M9 1l2.47 5h5.33l-4.31 3.13 1.64 5.06L9 11.08l-5.13 3.11 1.64-5.06L1.2 6h5.33z"/></svg>
      </div>
      <p style="margin:0;font-size:15px;line-height:1.6;color:#1e1e1e;font-family:Montserrat,sans-serif;">Přišla jsem poprvé a určitě se vrátím. Stylistka mě vyslechla, pochopila co chci, a výsledek byl naprosto perfektní. Vlasy vypadají zdravě a krásně.</p>
      <div style="display:flex;align-items:center;gap:12px;margin-top:auto;">
        <img src="/clones/studio-jarka/tild6164-3866-4638-a630-666133663966/Ellipse_11_1.jpg" alt="Jana P." style="width:44px;height:44px;border-radius:50%;object-fit:cover;flex-shrink:0;">
        <div>
          <div style="font-size:14px;font-weight:600;color:#1e1e1e;font-family:Montserrat,sans-serif;">Jana Procházková</div>
          <div style="font-size:11px;color:#888;font-family:Montserrat,sans-serif;">Google recenze · 2025</div>
        </div>
      </div>
    </div>
    <div style="background:#fff;border:1px solid #e8e8e8;border-radius:20px;padding:28px 24px;display:flex;flex-direction:column;gap:16px;">
      <div style="display:flex;gap:4px;">
        <svg width="18" height="18" viewBox="0 0 18 18" fill="#8A6F28"><path d="M9 1l2.47 5h5.33l-4.31 3.13 1.64 5.06L9 11.08l-5.13 3.11 1.64-5.06L1.2 6h5.33z"/></svg>
        <svg width="18" height="18" viewBox="0 0 18 18" fill="#8A6F28"><path d="M9 1l2.47 5h5.33l-4.31 3.13 1.64 5.06L9 11.08l-5.13 3.11 1.64-5.06L1.2 6h5.33z"/></svg>
        <svg width="18" height="18" viewBox="0 0 18 18" fill="#8A6F28"><path d="M9 1l2.47 5h5.33l-4.31 3.13 1.64 5.06L9 11.08l-5.13 3.11 1.64-5.06L1.2 6h5.33z"/></svg>
        <svg width="18" height="18" viewBox="0 0 18 18" fill="#8A6F28"><path d="M9 1l2.47 5h5.33l-4.31 3.13 1.64 5.06L9 11.08l-5.13 3.11 1.64-5.06L1.2 6h5.33z"/></svg>
        <svg width="18" height="18" viewBox="0 0 18 18" fill="#8A6F28"><path d="M9 1l2.47 5h5.33l-4.31 3.13 1.64 5.06L9 11.08l-5.13 3.11 1.64-5.06L1.2 6h5.33z"/></svg>
      </div>
      <p style="margin:0;font-size:15px;line-height:1.6;color:#1e1e1e;font-family:Montserrat,sans-serif;">Fantastické studio, profesionální tým a příjemná atmosféra. Nejlepší volba pro péči o vlasy v Praze. Každá návštěva je zážitek.</p>
      <div style="display:flex;align-items:center;gap:12px;margin-top:auto;">
        <img src="/clones/studio-jarka/tild3037-6665-4437-b133-343961643031/Ellipse_12.jpg" alt="Markéta B." style="width:44px;height:44px;border-radius:50%;object-fit:cover;flex-shrink:0;">
        <div>
          <div style="font-size:14px;font-weight:600;color:#1e1e1e;font-family:Montserrat,sans-serif;">Markéta Bílá</div>
          <div style="font-size:11px;color:#888;font-family:Montserrat,sans-serif;">Google recenze · 2025</div>
        </div>
      </div>
    </div>
  </div>
</div>`;
  // Replace the T396 brand showcase strip with static reviews
  html = html.replace(/<div[^>]*id="rec2190094773"[\s\S]*?(?=<div[^>]*id="rec2190100473")/, STATIC_REVIEWS + '\n');

  // 18d0. Hide T450 full-screen mobile nav captured in open state by Playwright.
  // The overlay and sliding panel must be hidden; the horizontal scroll-menu (T449) stays visible.
  html = html.replace(/<div class="t450__overlay">/g, '<div class="t450__overlay" style="display:none!important;">');
  // Inject display:none into existing style on the t450 nav panel (has existing style attribute)
  html = html.replace(/<div id="nav(\d+)" (class="t450\s*"[^>]*style=")([^"]*)"/, '<div id="nav$1" $2$3;display:none!important;"');

  // 18d0b. Replace entire hero T396 section (rec2184119513) with a clean full-screen photo hero.
  // Original T396 had: text overlays, blank video placeholder, ratings, CTA — all removed.
  // Kept: full-screen salon photo + animated scroll-down indicator only.
  const HERO_REPLACEMENT = `<style>@keyframes sj-chev1{0%,100%{opacity:0;transform:translateY(-4px)}60%{opacity:1;transform:translateY(0)}}@keyframes sj-chev2{0%,100%{opacity:0;transform:translateY(-4px)}60%{opacity:.6;transform:translateY(0)}}.sjc1{animation:sj-chev1 1.6s ease-in-out infinite}.sjc2{animation:sj-chev2 1.6s ease-in-out .28s infinite}</style><div id="rec2184119513" class="r t-rec" style="position:relative;width:100%;height:100vh;min-height:620px;overflow:hidden;padding:0;margin:0;"><img src="/clones/studio-jarka/tild3332-3065-4235-b962-346238623062/image_12_2_1.jpg" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:center top;display:block;" alt=""><div style="position:absolute;bottom:48px;left:50%;transform:translateX(-50%);text-align:center;z-index:10;pointer-events:none;"><div style="font-family:'Montserrat',sans-serif;font-size:10px;letter-spacing:4px;text-transform:uppercase;color:rgba(255,255,255,0.9);margin-bottom:14px;">SCROLL</div><svg width="22" height="32" viewBox="0 0 22 32" fill="none" xmlns="http://www.w3.org/2000/svg"><polyline class="sjc1" points="3,4 11,12 19,4" stroke="rgba(255,255,255,0.9)" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round"/><polyline class="sjc2" points="3,14 11,22 19,14" stroke="rgba(255,255,255,0.55)" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg></div></div>`;
  html = html.replace(/<div id="rec2184119513"[\s\S]*?(?=<div id="rec2190592093")/, HERO_REPLACEMENT + '\n');

  // 18d0b2. Replace remaining blank video placeholders (e.g. in "Víme..." T396) with stock video
  // + poster fallback so the section has actual moving content behind the text.
  // Hosted locally (CDN hotlink to Pexels/Pixabay returns 403); video downloaded from Mixkit free library.
  const STOCK_VIDEO = '/clones/studio-jarka/video/hero-bg.mp4';
  const POSTER_IMG = '/clones/studio-jarka/tild3332-3065-4235-b962-346238623062/image_12_2_1.jpg';
  html = html.replace(
    /<video([^>]*?)style="([^"]*)"([^>]*)><source type="video\/mp4" src="#"><\/video>/g,
    (_, pre, st, post) =>
      `<video${pre}style="${st}" muted="" autoplay="" loop="" playsinline="" poster="${POSTER_IMG}"${post}>` +
      `<source src="${STOCK_VIDEO}" type="video/mp4"></video>`
  );

  // 18d1. Fix Tilda screen-max sections: inject display:none inline so they're always hidden.
  // The demo is a desktop page; t-screenmax-1200px sections are mobile-only duplicates.
  for (const cls of ['t-screenmax-1200px', 't-screenmax-640px']) {
    const re = new RegExp(`<div([^>]*\\b${cls}\\b[^>]*)>`, 'g');
    html = html.replace(re, (match) => {
      if (/style="[^"]*display\s*:\s*none/.test(match)) return match;
      if (/style="/.test(match)) {
        return match.replace(/style="([^"]*)"/, 'style="$1;display:none!important;"');
      }
      return match.replace(/>$/, ' style="display:none!important;">');
    });
  }

  // 18d. Fix T604 slider: items-wrapper gets width:0 from JS init (captured before slider measured).
  // Direct inline style patch: set items-wrapper to 720px width and translateX(0) so first visible slide shows.
  // Also patch individual items: show only active, hide rest.
  html = html.replace(
    /<div((?:[^>]*?\s)?)class="(t-slds__items-wrapper t-slds_animated[^"]*)"([^>]*)style="width:\s*0px;[^"]*"([^>]*)>/gs,
    (_, pre, cls, mid, post) => `<div${pre}class="${cls}"${mid}style="width:720px;transform:translateX(0px);"${post}>`
  );
  // Active slide is missing the width:660px that non-active siblings have — make it consistent so
  // the carousel doesn't look misaligned. Inject width:660px into the active slide's style attribute.
  html = html.replace(
    /<div class="(t-slds__item t-slds__item_active[^"]*)"([^>]*?)style="([^"]*)"/g,
    (_, cls, mid, st) => {
      if (/width\s*:/.test(st)) return `<div class="${cls}"${mid}style="${st}"`;
      return `<div class="${cls}"${mid}style="width:660px;${st}"`;
    }
  );

  // Global CSS for t604: bgimg captured with height:0 — force it to fill imgwrapper so photos show.
  const T604_SLIDER_FIX = `<style>
.t604 .t604__imgwrapper { position: relative !important; }
.t604 .t-slds__bgimg { position: absolute !important; top:0; left:0; right:0; bottom:0; height: 100% !important; width: 100% !important; background-size: cover !important; background-position: center center !important; }
.t604 .t-slds__item { vertical-align: top; }
</style>`;
  html = html.replace(/(<div[^>]*class="[^"]*\bt604\b[^"]*")/, T604_SLIDER_FIX + '\n$1');

  // 19. Meta robots noindex
  html = `<meta name="robots" content="noindex,nofollow">\n<meta name="viewport" content="width=device-width, initial-scale=1.0">\n` + cssLinks + '\n' + html;

  return html;
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  mkdirSync(CLONE_DIR, { recursive: true });
  mkdirSync(path.join(CLONE_DIR, 'css'), { recursive: true });
  mkdirSync(path.join(CLONE_DIR, 'js'), { recursive: true });
  log('=== FÁZE 1: Mirror studio-jarka assets ===');

  // Step 1: Fetch homepage HTML via Playwright (get RENDERED HTML — T396 positions baked in)
  log('\n[1/5] Fetching rendered homepage HTML via Playwright...');
  let rawHtml;
  try {
    const browser = await chromium.launch({
      executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
      headless: true,
    });
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await ctx.newPage();
    await page.goto(ORIGIN + '/', { waitUntil: 'networkidle', timeout: 40000 });
    // Wait for T396 init + animations to settle
    await page.waitForTimeout(5000);
    rawHtml = await page.evaluate(() => document.documentElement.outerHTML);
    await browser.close();
    log(`  Rendered HTML: ${(rawHtml.length/1024).toFixed(0)}KB (T396 positions baked in)`);
  } catch(e) {
    log(`ERR: Playwright fetch failed: ${e.message}`);
    process.exit(1);
  }

  // Step 2: Download CSS files
  log('\n[2/5] Downloading CSS files...');
  for (const { url, dest } of CSS_FILES) {
    await download(url, path.join(CLONE_DIR, dest));
  }

  // Step 3: Download JS files
  log('\n[3/5] Downloading JS files...');
  for (const { url, dest } of JS_FILES) {
    await download(url, path.join(CLONE_DIR, dest));
  }

  // Step 4: Download images (78 + extra ink images)
  log('\n[4/5] Downloading images (78 + ink CDN files)...');
  for (const url of IMAGE_URLS) {
    const relPath = url.replace('https://static.tildacdn.net/', '');
    const destPath = path.join(CLONE_DIR, relPath);
    await download(url, destPath);
  }
  // Additional images from tildacdn.ink CDN
  for (const url of INK_IMAGE_URLS) {
    let relPath;
    if (url.includes('optim.tildacdn.ink')) {
      // extract: tild{hash}/Frame_55.jpg.webp
      const m = url.match(/\/(tild[a-f0-9-]+)\/-\/[^/]+\/(.+)$/);
      relPath = m ? `${m[1]}/${m[2]}` : url.split('/').slice(-2).join('/');
    } else {
      relPath = url.replace(/https?:\/\/static\.tildacdn\.ink\//, '');
    }
    const destPath = path.join(CLONE_DIR, relPath);
    await download(url, destPath);
  }

  // Step 5: Localize Google Fonts
  log('\n[5/5] Localizing Google Fonts...');
  await localizeGoogleFonts();

  // Step 5b: Overwrite ALL brand logo SVG files with demo versions
  // Source files contain "JARKA ČECHOVÁ" as SVG path data — not replaceable by regex

  // 133×20 nav logo
  const DEMO_LOGO_133x20 = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="133" height="20" viewBox="0 0 133 20" fill="none">
  <text x="2" y="15" font-family="Montserrat,sans-serif" font-size="17" font-weight="700" fill="#8A6F28">DS</text>
  <text x="30" y="15" font-family="Montserrat,sans-serif" font-size="9" font-weight="400" fill="#1E1E1E" letter-spacing="2">DEMO SALÓN</text>
</svg>`;

  // 145×64 mobile/scrollmenu logo (Frame_48_3) — the one uc-scrollmenu loads
  const DEMO_LOGO_145x64 = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="145" height="64" viewBox="0 0 145 64" fill="none">
  <rect x="0" y="12" width="40" height="40" rx="4" fill="#8A6F28"/>
  <text x="20" y="37" font-family="Montserrat,sans-serif" font-size="18" font-weight="700" fill="#fff" text-anchor="middle">DS</text>
  <text x="50" y="32" font-family="Montserrat,sans-serif" font-size="11" font-weight="700" fill="#1E1E1E" letter-spacing="1">DEMO</text>
  <text x="50" y="47" font-family="Montserrat,sans-serif" font-size="9" font-weight="400" fill="#555" letter-spacing="2">SALÓN</text>
</svg>`;

  // 273×224 large logo variants (Frame_58/59/60/61 and their _1/_2/_3 suffixes)
  const DEMO_LOGO_273x224 = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="273" height="224" viewBox="0 0 273 224" fill="none">
  <rect x="86" y="20" width="100" height="100" rx="8" fill="#8A6F28"/>
  <text x="136" y="80" font-family="Montserrat,sans-serif" font-size="48" font-weight="700" fill="#fff" text-anchor="middle">DS</text>
  <text x="136" y="148" font-family="Montserrat,sans-serif" font-size="20" font-weight="700" fill="#1E1E1E" text-anchor="middle" letter-spacing="3">DEMO</text>
  <text x="136" y="172" font-family="Montserrat,sans-serif" font-size="13" font-weight="400" fill="#555" text-anchor="middle" letter-spacing="4">SALÓN</text>
  <line x1="60" y1="185" x2="213" y2="185" stroke="#8A6F28" stroke-width="1" opacity="0.4"/>
  <text x="136" y="204" font-family="Montserrat,sans-serif" font-size="10" font-weight="300" fill="#888" text-anchor="middle" letter-spacing="2">UKÁZKOVÁ ŠABLONA</text>
</svg>`;

  // 461×78 wide logo (Group_65)
  const DEMO_LOGO_461x78 = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="461" height="78" viewBox="0 0 461 78" fill="none">
  <rect x="0" y="9" width="60" height="60" rx="6" fill="#8A6F28"/>
  <text x="30" y="47" font-family="Montserrat,sans-serif" font-size="26" font-weight="700" fill="#fff" text-anchor="middle">DS</text>
  <text x="78" y="36" font-family="Montserrat,sans-serif" font-size="22" font-weight="700" fill="#1E1E1E" letter-spacing="4">DEMO SALÓN</text>
  <text x="78" y="58" font-family="Montserrat,sans-serif" font-size="11" font-weight="300" fill="#888" letter-spacing="3">UKÁZKOVÁ ŠABLONA</text>
</svg>`;

  const LOGO_FILES_133x20 = [
    'tild3434-6239-4165-b430-316435326533/Group_2_5.svg',
    'tild3733-6537-4862-a332-343935356238/Group_2_2.svg',
    'tild6432-3830-4734-b632-376435303132/Group_2_4.svg',
  ];
  const LOGO_FILES_145x64 = [
    'tild3536-3038-4837-a637-393363656438/Frame_48_3.svg',
  ];
  const LOGO_FILES_273x224 = [
    'tild3063-6163-4262-b135-306166363230/Frame_58.svg',
    'tild3863-3365-4261-b964-643435323832/Frame_58_1.svg',
    'tild6161-6633-4639-b861-343831383332/Frame_58_2.svg',
    'tild6432-6636-4230-b433-626433323332/Frame_58_3.svg',
    'tild3562-6231-4161-b666-383634363834/Frame_59.svg',
    'tild6531-6263-4861-b934-386561663365/Frame_60.svg',
    'tild6236-3633-4636-b533-616635653662/Frame_61.svg',
  ];
  const LOGO_FILES_461x78 = [
    'tild3832-3733-4961-a437-326534613763/Group_65.svg',
  ];

  for (const [files, content] of [
    [LOGO_FILES_133x20, DEMO_LOGO_133x20],
    [LOGO_FILES_145x64, DEMO_LOGO_145x64],
    [LOGO_FILES_273x224, DEMO_LOGO_273x224],
    [LOGO_FILES_461x78, DEMO_LOGO_461x78],
  ]) {
    for (const f of files) {
      const p = path.join(CLONE_DIR, f);
      if (existsSync(p)) {
        fs.writeFileSync(p, content, 'utf-8');
        log(`  Logo overwritten: ${f}`);
      } else {
        log(`  WARN: Logo file not found (skip): ${f}`);
      }
    }
  }

  // Step 6: Process HTML
  log('\n[6/6] Processing HTML...');
  const processedHtml = buildHtml(rawHtml);
  const outPath = '/tmp/studio-jarka-home.html';
  writeFileSync(outPath, processedHtml, 'utf-8');
  log(`  Saved: ${outPath} (${(processedHtml.length/1024).toFixed(0)}KB)`);

  // Summary
  log('\n=== HOTOVO ===');
  log(`Clone dir: ${CLONE_DIR}`);
  log(`HTML: ${outPath}`);
  log('Další krok: node scripts/seed-studio-jarka-demo.mjs');
}

main().catch(e => { console.error(e); process.exit(1); });
