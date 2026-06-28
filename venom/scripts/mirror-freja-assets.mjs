/**
 * FÁZE 1 — Mirror freja.cz
 * Shopify e-commerce (flower shop) — static clone of homepage
 * CSS/images from cdn.shopify.com, remove cart/checkout/dynamic
 */
import { chromium } from 'playwright-core';
import fs from 'node:fs';
import path from 'node:path';
import https from 'node:https';
import http from 'node:http';

const SLUG   = 'freja';
const ORIGIN = 'https://freja.cz';
const OUT    = `public/clones/${SLUG}`;

for (const d of ['pages','img','css','js','fonts']) fs.mkdirSync(`${OUT}/${d}`, { recursive: true });

function dlUrl(url) {
  return new Promise((res, rej) => {
    const mod = url.startsWith('https') ? https : http;
    const req = mod.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (r) => {
      if (r.statusCode >= 300 && r.statusCode < 400 && r.headers.location)
        return dlUrl(r.headers.location).then(res).catch(rej);
      const c = []; r.on('data', d => c.push(d)); r.on('end', () => res(Buffer.concat(c)));
    });
    req.on('error', rej);
    req.setTimeout(20000, () => { req.destroy(); rej(new Error('timeout')); });
  });
}

const cssMap = new Map();
const jsMap  = new Map();
const imgMap = new Map();

const browser = await chromium.launch({
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  args: ['--no-sandbox'], headless: true,
});

const context = await browser.newContext({
  userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  locale: 'cs-CZ',
  extraHTTPHeaders: { 'Accept-Language': 'cs-CZ,cs;q=0.9' },
});
const page = await context.newPage();

// Block tracking/ads/Shopify analytics
await page.route('**/*', async (route) => {
  const url = route.request().url();
  if (url.includes('googletagmanager') || url.includes('google-analytics') ||
      url.includes('facebook.net') || url.includes('avada.io') ||
      url.includes('getsupertime.com') || url.includes('cloudfront.net') ||
      url.includes('shop.app/checkouts') || url.includes('analytics') ||
      url.includes('trekkie') || url.includes('monorail')) {
    return route.abort();
  }
  route.continue();
});

page.on('response', async (resp) => {
  const url  = resp.url();
  const ct   = resp.headers()['content-type'] || '';
  const urlNoQ = url.split('?')[0];
  const fname  = path.basename(urlNoQ);
  if (!fname || fname.length < 3) return;

  try {
    const body = await resp.body();
    if (body.length < 4) return;

    // CSS — both from origin and Shopify CDN
    if (ct.includes('css') || urlNoQ.endsWith('.css')) {
      const dest = `${OUT}/css/${fname}`;
      if (!fs.existsSync(dest)) fs.writeFileSync(dest, body);
      cssMap.set(url, `/clones/${SLUG}/css/${fname}`);
      cssMap.set(urlNoQ, `/clones/${SLUG}/css/${fname}`);
    }
    // JS — origin only (skip Shopify CDN JS — too complex)
    else if ((ct.includes('javascript') || urlNoQ.endsWith('.js')) &&
             (url.includes('freja.cz') || url.includes('cdn.shopify.com/s/files')) &&
             !fname.includes('gtm') && !fname.includes('analytics') &&
             !fname.includes('trekkie') && !fname.includes('monorail')) {
      const dest = `${OUT}/js/${fname}`;
      if (!fs.existsSync(dest)) fs.writeFileSync(dest, body);
      jsMap.set(url, `/clones/${SLUG}/js/${fname}`);
      jsMap.set(urlNoQ, `/clones/${SLUG}/js/${fname}`);
    }
    // Images — origin + Shopify CDN images
    else if (ct.includes('image') || urlNoQ.match(/\.(jpg|jpeg|png|webp|svg|gif|ico)$/i)) {
      if (body.length > 200) {
        const dest = `${OUT}/img/${fname}`;
        if (!fs.existsSync(dest)) fs.writeFileSync(dest, body);
        imgMap.set(url, `/clones/${SLUG}/img/${fname}`);
        imgMap.set(urlNoQ, `/clones/${SLUG}/img/${fname}`);
      }
    }
    // Fonts
    else if (ct.includes('woff') || urlNoQ.match(/\.(woff2?|ttf|otf)$/i)) {
      const dest = `${OUT}/fonts/${fname}`;
      if (!fs.existsSync(dest)) fs.writeFileSync(dest, body);
      cssMap.set(url, `/clones/${SLUG}/fonts/${fname}`);
    }
  } catch { /* ignore */ }
});

console.log('Navigating freja.cz...');
await page.goto(ORIGIN, { waitUntil: 'networkidle', timeout: 35000 });

// Dismiss cookie banner if present
try { await page.click('[data-testid="accept"], #cookie-accept, .cookie-accept, [class*="accept"]', { timeout: 2000 }); } catch {}

// Scroll to trigger lazy images
await page.evaluate(async () => {
  for (let i = 0; i < 10; i++) {
    window.scrollBy(0, window.innerHeight);
    await new Promise(r => setTimeout(r, 300));
  }
  window.scrollTo(0, 0);
});
await page.waitForTimeout(1500);

const rawHtml = await page.content();
console.log(`Raw HTML: ${rawHtml.length} bytes`);
fs.writeFileSync(`${OUT}/pages/home-raw.html`, rawHtml);

await browser.close();
console.log(`CSS=${cssMap.size} JS=${jsMap.size} Img=${imgMap.size}`);

// Download any Shopify CDN images referenced in HTML but not captured
const shopifyImgRe = /https:\/\/cdn\.shopify\.com\/s\/files\/[^\s"'?><)]+/g;
const shopifyUrls = new Set([...rawHtml.matchAll(shopifyImgRe)].map(m => m[0]));
console.log(`Shopify CDN image URLs in HTML: ${shopifyUrls.size}`);
let downloaded = 0;
for (const url of shopifyUrls) {
  if (!url.match(/\.(jpg|jpeg|png|webp|svg|gif|ico)(\?|$)/i)) continue;
  const fname = path.basename(url.split('?')[0]);
  const dest = `${OUT}/img/${fname}`;
  if (!imgMap.has(url) && !fs.existsSync(dest)) {
    try {
      const body = await dlUrl(url);
      if (body.length > 200) {
        fs.writeFileSync(dest, body);
        imgMap.set(url, `/clones/${SLUG}/img/${fname}`);
        downloaded++;
        process.stdout.write('.');
      }
    } catch { /* skip */ }
  } else if (!imgMap.has(url) && fs.existsSync(dest)) {
    imgMap.set(url, `/clones/${SLUG}/img/${fname}`);
  }
}
console.log(`\nDownloaded ${downloaded} more images. Total: ${imgMap.size}`);

// --- fix CSS url() refs ---
for (const fname of fs.readdirSync(`${OUT}/css`)) {
  let css = fs.readFileSync(`${OUT}/css/${fname}`, 'utf8');
  for (const [orig, local] of [...cssMap, ...imgMap]) css = css.replaceAll(orig, local);
  // Fix Shopify CDN relative/absolute paths
  css = css.replace(/url\(['"]?(https:\/\/cdn\.shopify\.com[^'")]+)['"]?\)/gi, (_, u) => {
    const fn = path.basename(u.split('?')[0]);
    if (fs.existsSync(`${OUT}/img/${fn}`)) return `url('/clones/${SLUG}/img/${fn}')`;
    if (fs.existsSync(`${OUT}/fonts/${fn}`)) return `url('/clones/${SLUG}/fonts/${fn}')`;
    return `url('${u}')`;
  });
  fs.writeFileSync(`${OUT}/css/${fname}`, css);
}

// --- kill-external.js ---
fs.writeFileSync(`${OUT}/js/kill-external.js`, `(function(){
  var _xo = XMLHttpRequest.prototype.open;
  XMLHttpRequest.prototype.open = function(m,url){
    if(typeof url==='string'&&url.match(/^https?:\\/\\//)&&!url.includes(location.hostname))return;
    _xo.apply(this,arguments);
  };
  var _f=window.fetch;
  window.fetch=function(url){
    if(typeof url==='string'&&url.match(/^https?:\\/\\//)&&!url.includes(location.hostname))
      return Promise.resolve(new Response('{}',{status:200}));
    return _f.apply(window,arguments);
  };
  var _sa=Element.prototype.setAttribute;
  Element.prototype.setAttribute=function(n,v){
    if((n==='src'||n==='href')&&typeof v==='string'&&v.match(/^https?:\\/\\//)&&!v.includes(location.hostname)&&!v.startsWith('data:'))return;
    _sa.call(this,n,v);
  };
})();`);

// --- Build HTML ---
function buildHtml(raw) {
  const bodyM = raw.match(/<body[^>]*>([\s\S]*)<\/body>/i);
  let body = bodyM ? bodyM[1] : raw;

  // Strip tracking + Shopify analytics
  body = body
    .replace(/<script[^>]*(?:googletagmanager|gtag|avada\.io|getsupertime|trekkie|monorail|cloudfront\.net|shop\.app)[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<noscript[^>]*>[\s\S]*?googletagmanager[\s\S]*?<\/noscript>/gi, '')
    // Cookie banner
    .replace(/<div[^>]*(?:cookie|consent|gdpr)[^>]*>[\s\S]{0,8000}?<\/div>\s*(<\/div>\s*){0,5}/gi, '')
    // Cart drawer (exclude closing tags </header-drawer> etc — use negative lookahead for /)
    .replace(/<(?!\/)[^>]*(?:cart-drawer|cart-notification|drawer)[^>]*>[\s\S]{0,5000}?<\/(?:cart-drawer|cart-notification|div)>/gi, '')
    // Shopify section IDs that break static view
    .replace(/(<form[^>]*(?:cart|checkout|product-form)[^>]*>[\s\S]*?<\/form>)/gi, '')
    // Remove login/cart/checkout links
    .replace(/href="https?:\/\/freja\.cz\/(?:cart|checkout|customer_authentication)[^"]*"/gi, 'href="#"')
    .replace(/href="\/(?:cart|checkout|account|customer_authentication)[^"]*"/gi, 'href="#"')
    // Language switcher → remove
    .replace(/<[^>]*(?:localization-form|language-selector)[^>]*>[\s\S]{0,2000}?<\/(?:localization-form|div)>/gi, '');

  // Rewrite Shopify CDN image URLs
  for (const [origUrl, localPath] of imgMap) {
    body = body.replaceAll(origUrl, localPath);
  }

  // Rewrite CSS URLs
  for (const [origUrl, localPath] of cssMap) {
    body = body.replaceAll(origUrl, localPath);
    const rel = origUrl.replace(ORIGIN, '');
    if (rel !== origUrl) body = body.replaceAll(rel, localPath);
  }

  // Collection links → demo paths (keep visual but non-functional)
  body = body.replace(/href="https?:\/\/freja\.cz\/collections\/[^"]*"/gi, 'href="#"');
  body = body.replace(/href="https?:\/\/freja\.cz\/pages\/[^"]*"/gi, 'href="#"');
  body = body.replace(/href="https?:\/\/freja\.cz\/products\/[^"]*"/gi, 'href="#"');
  body = body.replace(/href="\/collections\/[^"]*"/gi, 'href="#"');
  body = body.replace(/href="\/pages\/[^"]*"/gi, 'href="#"');
  body = body.replace(/href="\/products\/[^"]*"/gi, 'href="#"');

  // Social links → #
  body = body.replace(/href="https?:\/\/(?:www\.)?(?:instagram|facebook|pinterest)\.com\/[^"]*"/gi, 'href="#" rel="nofollow"');

  // Contact details
  body = body
    .replace(/\+420\s*7[0-9]{2}\s*[0-9]{3}\s*[0-9]{3}/g, '+420 608 288 777')
    .replace(/\+420\s*[0-9]{3}\s*[0-9]{3}\s*[0-9]{3}/g, '+420 608 288 777')
    .replace(/[a-z._+-]+@freja\.cz/gi, 'info@demo.local')
    .replace(/freja\.cz/gi, 'demo.local')
    .replace(/freja-flower-shop\.myshopify\.com/gi, 'demo.local')
    .replace(/Freja(?!\s*Demo)/g, 'Demo Freja')
    .replace(/Podbělohorská\s+\d+[^<,]{0,30}/gi, 'Demo ulice 12, Praha 2')
    .replace(/Praha\s+5/gi, 'Praha 2');

  // Lazy loading
  body = body.replace(/<img(?![^>]*loading=)([^>]*)>/gi, (m, rest) => {
    if (rest.includes('hero') || rest.includes('banner') || rest.includes('slideshow')) return m;
    return `<img loading="lazy"${rest}>`;
  });

  const cssUrls = [...new Set([...cssMap.values()])];

  return `<!DOCTYPE html>
<html lang="cs">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="robots" content="noindex, nofollow">
  <title>Demo Květinářství — Ukázka šablony pro floristický e-shop</title>
  <meta name="description" content="Ukázka prémiové webové šablony pro květinářství. Rozvoz kytek, product grid, objednávkový formulář.">
${cssUrls.map(u => `  <link rel="stylesheet" href="${u}">`).join('\n')}
  <script src="/clones/${SLUG}/js/kill-external.js"></script>
  <style>
    /* Venom: hide Shopify dynamic elements */
    cart-drawer, cart-notification, .shopify-section--cart,
    [id*="shopify"], [class*="shopify-challenge"],
    .cookie-bar, .cookie-banner, #cookie-consent { display: none !important; }
  </style>
</head>
<body>
${body}
</body>
</html>`;
}

const finalHtml = buildHtml(rawHtml);
fs.writeFileSync(`${OUT}/pages/home.html`, finalHtml);

const extRefs   = (finalHtml.match(/https?:\/\/(?!demo\.local)[a-z]/g) || []).length;
const brandRefs = (finalHtml.match(/freja\.cz/gi) || []).length;
console.log(`home.html: ${finalHtml.length} bytes | ext=${extRefs} | brand=${brandRefs}`);
console.log('CSS files:', [...new Set([...cssMap.values()])].length);
console.log('\n=== HOTOVO ===');
