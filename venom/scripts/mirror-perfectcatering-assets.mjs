/**
 * FÁZE 1 — Mirror perfectcatering.cz
 * Nuxt.js SSR, DigitalOcean CDN images, Adobe Typekit fonts
 * Single page with anchor nav (#services, #about-us, #our-work, #contact)
 */
import { chromium } from 'playwright-core';
import fs from 'node:fs';
import path from 'node:path';
import https from 'node:https';
import http from 'node:http';

const SLUG = 'perfectcatering';
const ORIGIN = 'https://www.perfectcatering.cz';
const DO_CDN_PREFIX = 'https://perfect-catering-file-space.fra1.digitaloceanspaces.com';
const OUT = `public/clones/${SLUG}`;

for (const d of ['pages', 'img', 'css', 'js', 'fonts']) fs.mkdirSync(`${OUT}/${d}`, { recursive: true });

function dlUrl(url) {
  return new Promise((res, rej) => {
    const mod = url.startsWith('https') ? https : http;
    const req = mod.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (r) => {
      if (r.statusCode >= 300 && r.statusCode < 400 && r.headers.location)
        return dlUrl(r.headers.location).then(res).catch(rej);
      const chunks = [];
      r.on('data', c => chunks.push(c));
      r.on('end', () => res(Buffer.concat(chunks)));
    });
    req.on('error', rej);
    req.setTimeout(15000, () => { req.destroy(); rej(new Error('timeout')); });
  });
}

const cssMap = new Map();
const jsMap  = new Map();
const imgMap = new Map();
const fontMap = new Map();

const browser = await chromium.launch({
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  args: ['--no-sandbox'],
  headless: true,
});

const context = await browser.newContext({
  userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  locale: 'cs-CZ',
});
const page = await context.newPage();

// Block tracking/GDPR before navigation
await page.route('**/*', async (route) => {
  const url = route.request().url();
  if (url.includes('consentmanager.net') || url.includes('googletagmanager') ||
      url.includes('google-analytics') || url.includes('linkedin.com/collect') ||
      url.includes('snap.licdn.com') || url.includes('px4.ads.linkedin')) {
    return route.abort();
  }
  route.continue();
});

page.on('response', async (resp) => {
  const url = resp.url();
  const ct = resp.headers()['content-type'] || '';
  const urlNoQ = url.split('?')[0];
  const fname = path.basename(urlNoQ);
  if (!fname || fname.length < 3) return;

  try {
    const body = await resp.body();
    if (body.length < 4) return;

    if (url.startsWith(ORIGIN) && (ct.includes('css') || urlNoQ.endsWith('.css'))) {
      const dest = `${OUT}/css/${fname}`;
      if (!fs.existsSync(dest)) fs.writeFileSync(dest, body);
      cssMap.set(url, `/clones/${SLUG}/css/${fname}`);
      cssMap.set(urlNoQ, `/clones/${SLUG}/css/${fname}`);
    } else if (url.startsWith(ORIGIN) && (ct.includes('javascript') || urlNoQ.endsWith('.js'))) {
      const dest = `${OUT}/js/${fname}`;
      if (!fs.existsSync(dest)) fs.writeFileSync(dest, body);
      jsMap.set(url, `/clones/${SLUG}/js/${fname}`);
      jsMap.set(urlNoQ, `/clones/${SLUG}/js/${fname}`);
    } else if (url.startsWith(DO_CDN_PREFIX) || url.startsWith(ORIGIN + '/image/')) {
      if (ct.includes('image') || urlNoQ.match(/\.(jpg|jpeg|png|webp|svg|gif|ico)$/i)) {
        const dest = `${OUT}/img/${fname}`;
        if (!fs.existsSync(dest)) fs.writeFileSync(dest, body);
        imgMap.set(url, `/clones/${SLUG}/img/${fname}`);
        imgMap.set(urlNoQ, `/clones/${SLUG}/img/${fname}`);
      }
    } else if (url.startsWith(ORIGIN) && (ct.includes('image') || urlNoQ.match(/\.(jpg|jpeg|png|webp|svg|gif|ico)$/i))) {
      const dest = `${OUT}/img/${fname}`;
      if (!fs.existsSync(dest)) fs.writeFileSync(dest, body);
      imgMap.set(url, `/clones/${SLUG}/img/${fname}`);
      imgMap.set(urlNoQ, `/clones/${SLUG}/img/${fname}`);
    } else if (url.includes('typekit.net') && (ct.includes('woff') || urlNoQ.match(/\.(woff2?|ttf|otf)$/i))) {
      const fName = `typekit-${fname}`;
      const dest = `${OUT}/fonts/${fName}`;
      if (!fs.existsSync(dest)) fs.writeFileSync(dest, body);
      fontMap.set(url, `/clones/${SLUG}/fonts/${fName}`);
    } else if (url.includes('typekit.net') && ct.includes('css')) {
      const dest = `${OUT}/fonts/typekit-raw.css`;
      if (!fs.existsSync(dest)) fs.writeFileSync(dest, body);
    }
  } catch { /* ignore */ }
});

console.log('Navigating...');
await page.goto(ORIGIN, { waitUntil: 'networkidle', timeout: 30000 });

// Scroll to trigger lazy images
await page.evaluate(async () => {
  for (let i = 0; i < 12; i++) {
    window.scrollBy(0, window.innerHeight);
    await new Promise(r => setTimeout(r, 350));
  }
  window.scrollTo(0, 0);
});
await page.waitForTimeout(1500);

const rawHtml = await page.content();
console.log(`Raw HTML: ${rawHtml.length} bytes`);

await browser.close();
console.log(`Captured: CSS=${cssMap.size} JS=${jsMap.size} Img=${imgMap.size} Fonts=${fontMap.size}`);

// --- Download any DO CDN images missed during capture ---
const doCdnRe = /https:\/\/perfect-catering-file-space\.fra1\.digitaloceanspaces\.com\/perfect-catering\/[a-f0-9]+\.[a-z]+/g;
const siteImgRe = /https:\/\/www\.perfectcatering\.cz\/image\/[^\s"')>]+/g;

for (const re of [doCdnRe, siteImgRe]) {
  const matches = [...rawHtml.matchAll(re)].map(m => m[0]);
  for (const url of new Set(matches)) {
    const fname = path.basename(url.split('?')[0]);
    const dest = `${OUT}/img/${fname}`;
    if (!imgMap.has(url) && !fs.existsSync(dest)) {
      try {
        const body = await dlUrl(url);
        if (body.length > 100) {
          fs.writeFileSync(dest, body);
          imgMap.set(url, `/clones/${SLUG}/img/${fname}`);
          process.stdout.write('.');
        }
      } catch (e) { console.log(`\nMiss: ${url.slice(-40)} — ${e.message}`); }
    } else if (!imgMap.has(url)) {
      imgMap.set(url, `/clones/${SLUG}/img/${fname}`);
    }
  }
}
console.log(`\nTotal images: ${imgMap.size}`);

// --- Localize Typekit fonts ---
let fontsCSS = '';
if (fs.existsSync(`${OUT}/fonts/typekit-raw.css`)) {
  let tkCSS = fs.readFileSync(`${OUT}/fonts/typekit-raw.css`, 'utf8');
  const tkUrlRe = /url\("(https:\/\/use\.typekit\.net[^"]+)"/g;
  for (const [, fontUrl] of [...tkCSS.matchAll(tkUrlRe)]) {
    const fName = `typekit-${path.basename(fontUrl.split('?')[0])}`;
    const dest = `${OUT}/fonts/${fName}`;
    if (!fs.existsSync(dest)) {
      try {
        const body = await dlUrl(fontUrl);
        if (body.length > 100) { fs.writeFileSync(dest, body); process.stdout.write('f'); }
      } catch { /* ignore */ }
    }
    if (fs.existsSync(dest)) tkCSS = tkCSS.replaceAll(fontUrl, `/clones/${SLUG}/fonts/${fName}`);
  }
  tkCSS = tkCSS.replace(/font-display:\s*auto/g, 'font-display: swap');
  fontsCSS = tkCSS;
  console.log('\nTypekit fonts localized');
} else {
  // Fallback: use captured woff2 + serif fallback
  fontsCSS = `
@font-face { font-family: 'superior-title'; font-display: swap; font-weight: 400; font-style: normal; src: local('Playfair Display'), local('Georgia'), local('serif'); }
@font-face { font-family: 'superior-title'; font-display: swap; font-weight: 700; font-style: normal; src: local('Playfair Display Bold'), local('Georgia'), local('serif'); }
@font-face { font-family: 'superior-title'; font-display: swap; font-weight: 400; font-style: italic; src: local('Playfair Display Italic'), local('Georgia Italic'), local('serif'); }
`;
  console.log('Typekit not captured, using serif fallback');
}
fs.writeFileSync(`${OUT}/fonts/fonts.css`, fontsCSS);

// --- kill-external.js ---
fs.writeFileSync(`${OUT}/js/kill-external.js`, `/* block outbound requests */
(function() {
  var _xhrOpen = XMLHttpRequest.prototype.open;
  XMLHttpRequest.prototype.open = function(m, url) {
    if (typeof url === 'string' && url.match(/^https?:\/\//) && !url.includes(location.hostname)) return;
    _xhrOpen.apply(this, arguments);
  };
  var _fetch = window.fetch;
  window.fetch = function(url) {
    if (typeof url === 'string' && url.match(/^https?:\/\//) && !url.includes(location.hostname))
      return Promise.resolve(new Response('{}', { status: 200, headers: { 'content-type': 'application/json' } }));
    return _fetch.apply(window, arguments);
  };
  var origSetAttr = Element.prototype.setAttribute;
  Element.prototype.setAttribute = function(name, value) {
    if ((name === 'src' || name === 'href') && typeof value === 'string' &&
        value.match(/^https?:\/\//) && !value.includes(location.hostname) &&
        !value.startsWith('data:')) return;
    origSetAttr.call(this, name, value);
  };
})();
`);

// --- Fix CSS: rewrite DO CDN + origin URLs inside CSS files ---
for (const fname of fs.readdirSync(`${OUT}/css`)) {
  let css = fs.readFileSync(`${OUT}/css/${fname}`, 'utf8');
  for (const [orig, local] of imgMap) css = css.replaceAll(orig, local);
  for (const [orig, local] of fontMap) css = css.replaceAll(orig, local);
  css = css.replace(/url\(['"]?https?:\/\/www\.perfectcatering\.cz([^'")]+)['"]?\)/gi,
    (_, rel) => `url('/clones/${SLUG}${rel.split('?')[0]}')`);
  fs.writeFileSync(`${OUT}/css/${fname}`, css);
}

// --- Build final HTML ---
function buildHtml(raw) {
  // Get body
  const bodyM = raw.match(/<body[^>]*>([\s\S]*)<\/body>/i);
  let body = bodyM ? bodyM[1] : raw;

  // Strip tracking + GDPR
  body = body
    .replace(/<script[^>]*(?:consentmanager|cmp-loader|googletagmanager|gtag|linkedin|snap\.licdn)[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<link[^>]*(?:consentmanager|cmp\.min\.css)[^>]*/gi, '')
    .replace(/<noscript[^>]*>[\s\S]*?(?:googletagmanager|cmp|linkedin)[\s\S]*?<\/noscript>/gi, '')
    // Nuxt data (prevent hydration failure)
    .replace(/<script[^>]*id="__NUXT_DATA__"[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<script[^>]*id="schema-org-graph"[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<script[^>]*>[\s\S]*?window\.__NUXT__[\s\S]*?<\/script>/gi, '')
    // Typekit script
    .replace(/<link[^>]*typekit\.net[^>]*/gi, '')
    .replace(/<script[^>]*typekit\.net[^>]*>[\s\S]*?<\/script>/gi, '')
    // Teleports div (LightGallery portal)
    .replace(/<div[^>]*id="teleports"[^>]*>[\s\S]*?<\/div>/gi, '')
    // ConsentManager overlay
    .replace(/<div[^>]*id="cmp-[^"]*"[^>]*>[\s\S]*?<\/div>/gi, '')
    // Nuxt progress bar
    .replace(/<div[^>]*id="nprogress"[^>]*>[\s\S]*?<\/div>/gi, '');

  // Rewrite DO CDN image URLs
  for (const [origUrl, localPath] of imgMap) {
    body = body.replaceAll(origUrl, localPath);
  }

  // Rewrite /_nuxt/ CSS paths
  for (const [origUrl, localPath] of cssMap) {
    const rel = origUrl.replace(ORIGIN, '');
    body = body.replaceAll(rel, localPath);
    body = body.replaceAll(origUrl, localPath);
  }

  // Rewrite /_nuxt/ JS paths
  for (const [origUrl, localPath] of jsMap) {
    const rel = origUrl.replace(ORIGIN, '');
    body = body.replaceAll(rel, localPath);
    body = body.replaceAll(origUrl, localPath);
  }

  // Social media links → #
  body = body.replace(/href="https?:\/\/(?:www\.)?(?:facebook|instagram|youtube|linkedin|twitter)\.com\/[^"]*"/gi, 'href="#" rel="nofollow"');

  // Career + EN pages → #
  body = body.replace(/href="https?:\/\/www\.perfectcatering\.cz\/career[^"]*"/gi, 'href="#"');
  body = body.replace(/href="https?:\/\/www\.perfectcatering\.cz\/en[^"]*"/gi, 'href="#"');
  body = body.replace(/href="\/career[^"]*"/gi, 'href="#"');
  body = body.replace(/href="\/en[^"]*"/gi, 'href="#"');

  // Contact details
  body = body
    .replace(/\+420\s*7\d{2}\s*\d{3}\s*\d{3}/g, '+420 608 288 777')
    .replace(/info@perfectcatering\.cz/gi, 'info@demo.local')
    .replace(/jana\.moravcova@perfectcatering\.cz/gi, 'info@demo.local')
    .replace(/filip[^@]*@perfectcatering\.cz/gi, 'info@demo.local')
    .replace(/Sokolovská\s+394\/17,?\s*Praha\s*9/gi, 'Demo ulice 12, Praha 2, 120 00')
    .replace(/Sokolovská\s+\d+\/\d+/gi, 'Demo ulice 12')
    .replace(/\b186 00\b/g, '120 00')
    .replace(/Praha\s+9\b/gi, 'Praha 2')
    .replace(/IČ[O:]?\s*\d{6,}/gi, 'IČ: 00000000')
    .replace(/DIČ[:]?\s*CZ\d+/gi, 'DIČ: CZ00000000');

  // Replace logo img (SVG file from CDN → inline SVG)
  body = body.replace(
    /<img[^>]*\/clones\/perfectcatering\/img\/5a3469934d64fb05d22ce35eb8b1eb06\.svg[^>]*>/gi,
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 260 64" width="220" height="52" style="display:inline-block">
      <text x="10" y="26" font-family="serif" font-size="22" font-weight="700" fill="#c9a96e" letter-spacing="2">DEMO</text>
      <text x="10" y="46" font-family="serif" font-size="14" fill="#ffffff" letter-spacing="2">CATERING</text>
      <rect x="8" y="52" width="110" height="1" fill="#c9a96e" opacity="0.4"/>
      <text x="8" y="62" font-family="sans-serif" font-size="8" fill="rgba(255,255,255,0.35)" letter-spacing="1">DEMO ŠABLONA</text>
    </svg>`
  );

  // Lazy loading (non-hero images)
  body = body.replace(/<img(?![^>]*loading=)([^>]*(?:class|src)=)/gi, (match, after) => {
    if (match.includes('intro') || match.includes('hero') || match.includes('c-homepage-intro')) return match;
    return `<img loading="lazy"${after}`;
  });

  // Build CSS/JS lists
  const cssUrls = [...new Set([...cssMap.values()])];
  const jsUrls  = [...new Set([...jsMap.values()])];

  const cssLinks = [
    `<link rel="stylesheet" href="/clones/${SLUG}/fonts/fonts.css">`,
    ...cssUrls.map(u => `    <link rel="stylesheet" href="${u}">`),
  ].join('\n');

  const jsScripts = [
    `    <script src="/clones/${SLUG}/js/kill-external.js"></script>`,
    ...jsUrls.map(u => `    <script defer src="${u}"></script>`),
  ].join('\n');

  return `<!DOCTYPE html>
<html lang="cs">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="robots" content="noindex, nofollow">
  <title>Demo Catering — Ukázka šablony pro cateringové služby</title>
  <meta name="description" content="Ukázka prémiové webové šablony pro cateringovou firmu. Profesionální design s galerií jídel, ceníkem a kontaktním formulářem. 160 znaků.">
${cssLinks}
${jsScripts}
  <style>
    /* Venom: hide consent overlay */
    #cmp-main, .cmpbox, [id^="cmp-"], .cmp-overlay,
    [class*="consent"], [id*="consent"] { display: none !important; }
  </style>
</head>
<body>
${body}
</body>
</html>`;
}

const finalHtml = buildHtml(rawHtml);
fs.writeFileSync(`${OUT}/pages/home.html`, finalHtml);
console.log(`home.html: ${finalHtml.length} bytes`);

// --- Quick validation ---
const extRefs = (finalHtml.match(/https?:\/\/(?!demo\.local)[a-z]/g) || []).length;
const brandRefs = (finalHtml.match(/perfectcatering\.cz/gi) || []).length;
const trackingRefs = (finalHtml.match(/consentmanager|googletagmanager|linkedin\.com\/collect/gi) || []).length;
console.log(`\nValidation:`);
console.log(`  External http refs: ${extRefs}`);
console.log(`  Brand refs (perfectcatering.cz): ${brandRefs}`);
console.log(`  Tracking refs: ${trackingRefs}`);
console.log(`  CSS files: ${cssMap.size}`);
console.log(`  JS files: ${jsMap.size}`);
console.log(`  Images: ${imgMap.size}`);

console.log('\n=== HOTOVO ===');
