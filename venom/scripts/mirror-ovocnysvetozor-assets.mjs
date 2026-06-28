/**
 * Mirror ovocnysvetozor.cz — Joomla + Gantry 5 (cukrárna chain)
 * FÁZE 1: Playwright capture + asset download
 */
import { chromium } from 'playwright-core';
import fs from 'node:fs';
import path from 'node:path';
import https from 'node:https';
import http from 'node:http';

const SLUG   = 'ovocnysvetozor';
const ORIGIN = 'https://www.ovocnysvetozor.cz';
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
  args: ['--no-sandbox'],
  headless: true,
});

const context = await browser.newContext({
  userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  locale: 'cs-CZ',
  extraHTTPHeaders: { 'Accept-Language': 'cs-CZ,cs;q=0.9' },
});
const page = await context.newPage();

await page.route('**/*', async (route) => {
  const url = route.request().url();
  if (url.includes('googletagmanager') || url.includes('google-analytics') ||
      url.includes('facebook.net') || url.includes('analytics') ||
      url.includes('tawk.to') || url.includes('hotjar') ||
      url.includes('recaptcha') || url.includes('cookiebot')) {
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

    if (ct.includes('css') || urlNoQ.endsWith('.css')) {
      const dest = `${OUT}/css/${fname}`;
      if (!fs.existsSync(dest)) fs.writeFileSync(dest, body);
      cssMap.set(url, `/clones/${SLUG}/css/${fname}`);
      cssMap.set(urlNoQ, `/clones/${SLUG}/css/${fname}`);
    }
    else if ((ct.includes('javascript') || urlNoQ.endsWith('.js')) && url.includes('ovocnysvetozor.cz')) {
      const dest = `${OUT}/js/${fname}`;
      if (!fs.existsSync(dest)) fs.writeFileSync(dest, body);
      jsMap.set(url, `/clones/${SLUG}/js/${fname}`);
      jsMap.set(urlNoQ, `/clones/${SLUG}/js/${fname}`);
    }
    else if (ct.includes('image') || urlNoQ.match(/\.(jpg|jpeg|png|webp|svg|gif|ico)$/i)) {
      if (body.length > 200) {
        const dest = `${OUT}/img/${fname}`;
        if (!fs.existsSync(dest)) fs.writeFileSync(dest, body);
        imgMap.set(url, `/clones/${SLUG}/img/${fname}`);
        imgMap.set(urlNoQ, `/clones/${SLUG}/img/${fname}`);
      }
    }
    else if (ct.includes('woff') || urlNoQ.match(/\.(woff2?|ttf|otf)$/i)) {
      const dest = `${OUT}/fonts/${fname}`;
      if (!fs.existsSync(dest)) fs.writeFileSync(dest, body);
    }
  } catch { /* ignore */ }
});

console.log('Navigating ovocnysvetozor.cz...');
await page.goto(ORIGIN, { waitUntil: 'networkidle', timeout: 35000 });

// Dismiss cookie consent
try {
  await page.click('[data-testid="accept"], #cookie-accept, .cookie-accept, button[id*="accept"], .btn-success, button:has-text("Souhlasím"), button:has-text("Přijmout")', { timeout: 3000 });
  console.log('Cookie dismissed');
} catch { console.log('No cookie button found'); }

// Close any popup/modal
try {
  await page.keyboard.press('Escape');
  await page.click('.modal-close, .close, [data-dismiss="modal"], .popup-close', { timeout: 1500 });
} catch {}

// Scroll to trigger lazy images
await page.evaluate(async () => {
  for (let i = 0; i < 12; i++) {
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
})();`);

// --- Fix CSS url() refs ---
for (const fname of fs.readdirSync(`${OUT}/css`)) {
  let css = fs.readFileSync(`${OUT}/css/${fname}`, 'utf8');
  for (const [orig, local] of [...cssMap, ...imgMap]) css = css.replaceAll(orig, local);
  // Fix relative paths in CSS
  css = css.replace(/url\(['"]?([^'")]+\.(jpg|jpeg|png|webp|svg|gif|woff2?))['"]?\)/gi, (m, p1) => {
    if (p1.startsWith('http') || p1.startsWith('/')) return m;
    return m; // leave relative paths as-is for now
  });
  fs.writeFileSync(`${OUT}/css/${fname}`, css);
}

// --- Build home.html ---
function buildHtml(raw) {
  const bodyM = raw.match(/<body[^>]*>([\s\S]*)<\/body>/i);
  let body = bodyM ? bodyM[1] : raw;

  // Strip tracking
  body = body
    .replace(/<script[^>]*(?:googletagmanager|gtag|analytics|tawk|hotjar|cookiebot)[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<noscript[^>]*>[\s\S]*?googletagmanager[\s\S]*?<\/noscript>/gi, '');

  // Remove Google Maps (requires API key, blank iframe)
  body = body.replace(/<div[^>]*(?:map|mapa|gmap|google-map)[^>]*>[\s\S]{0,10000}?<\/div>/gi, (m) => {
    if (m.length > 500) return '<div class="venom-map-removed" style="display:none"></div>';
    return m;
  });

  // Rewrite image URLs
  for (const [origUrl, localPath] of imgMap) {
    body = body.replaceAll(origUrl, localPath);
  }

  // Rewrite absolute origin paths → local
  body = body.replace(/https?:\/\/(?:www\.)?ovocnysvetozor\.cz\/images\/([^"'?\s]+)/gi, `/clones/${SLUG}/img/$1`);
  body = body.replace(/\/images\/([^"'?\s]+)/g, `/clones/${SLUG}/img/$1`);

  // Rewrite CSS URLs
  for (const [origUrl, localPath] of cssMap) {
    body = body.replaceAll(origUrl, localPath);
  }

  // CMS fixes
  body = body
    .replace(/\+420\s*[0-9 ]{9,12}/g, '+420 608 288 777')
    .replace(/[a-z._+-]+@ovocnysvetozor\.cz/gi, 'info@demo.local')
    .replace(/ovocnysvetozor\.cz/gi, 'demo.local')
    .replace(/Ovocný\s+Světozor/g, 'Demo Světozor')
    .replace(/Ovocny\s+Svetozor/gi, 'Demo Svetozor');

  // Remove internal links
  body = body.replace(/href="https?:\/\/(?:www\.)?ovocnysvetozor\.cz([^"]*)"/gi, 'href="#"');
  body = body.replace(/href="\/(?!clones)([^"]*)"(?=[^>]*class="[^"]*nav[^"]*")/gi, 'href="#"');

  const cssUrls = [...new Set([...cssMap.values()])];

  return `<!DOCTYPE html>
<html lang="cs">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="robots" content="noindex, nofollow">
  <title>Demo Světozor — Ukázka šablony pro cukrárnu</title>
  <meta name="description" content="Ukázka prémiové webové šablony pro cukrárnu. Produkty, pobočky, akce.">
${cssUrls.map(u => `  <link rel="stylesheet" href="${u}">`).join('\n')}
  <script src="/clones/${SLUG}/js/kill-external.js"></script>
  <style>
    /* Venom overrides */
    .cookie-consent, .cookie-bar, [class*="cookie"], [id*="cookie"] { display: none !important; }
    .modal-backdrop, .modal { display: none !important; }
  </style>
</head>
<body>
${body}
</body>
</html>`;
}

const finalHtml = buildHtml(rawHtml);
fs.writeFileSync(`${OUT}/pages/home.html`, finalHtml);

const extRefs = (finalHtml.match(/https?:\/\/(?!demo\.local)[a-z]/g) || []).length;
const brandRefs = (finalHtml.match(/ovocnysvetozor\.cz/gi) || []).length;
console.log(`home.html: ${finalHtml.length} bytes | ext=${extRefs} | brand=${brandRefs}`);
console.log(`CSS files: ${[...new Set([...cssMap.values()])].length}`);
console.log('\n=== HOTOVO ===');
