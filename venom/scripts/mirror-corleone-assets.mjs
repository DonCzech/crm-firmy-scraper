/**
 * Mirror corleone.cz — Pizzeria/Ristorante Praha
 */
import { chromium } from 'playwright-core';
import fs from 'node:fs';
import path from 'node:path';
import https from 'node:https';
import http from 'node:http';

const SLUG   = 'corleone';
const ORIGIN = 'https://www.corleone.cz';
const OUT    = `public/clones/${SLUG}`;

for (const d of ['pages','img','css','js','fonts']) fs.mkdirSync(`${OUT}/${d}`, { recursive: true });

function dlUrl(url) {
  return new Promise((res, rej) => {
    const mod = url.startsWith('https') ? https : http;
    const req = mod.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' } }, (r) => {
      if (r.statusCode >= 300 && r.statusCode < 400 && r.headers.location)
        return dlUrl(r.headers.location).then(res).catch(rej);
      const c = []; r.on('data', d => c.push(d)); r.on('end', () => res(Buffer.concat(c)));
    });
    req.on('error', rej);
    req.setTimeout(20000, () => { req.destroy(); rej(new Error('timeout')); });
  });
}

const cssMap = new Map();
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
      url.includes('cookiebot') || url.includes('doubleclick')) {
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

console.log('Navigating corleone.cz...');
await page.goto(ORIGIN, { waitUntil: 'domcontentloaded', timeout: 30000 });
await page.waitForTimeout(3000);

// Dismiss cookie
try {
  await page.click('button:has-text("Souhlasím"), button:has-text("Přijmout"), button:has-text("Souhlasit"), .cookie-accept, #acceptCookies, [data-cookiebanner="accept"]', { timeout: 3000 });
  console.log('Cookie dismissed');
} catch { console.log('No cookie button'); }

// Scroll to trigger lazy images
await page.evaluate(async () => {
  for (let i = 0; i < 15; i++) {
    window.scrollBy(0, window.innerHeight);
    await new Promise(r => setTimeout(r, 250));
  }
  window.scrollTo(0, 0);
});
await page.waitForTimeout(2000);

const rawHtml = await page.content();
console.log(`Raw HTML: ${rawHtml.length} bytes`);
fs.writeFileSync(`${OUT}/pages/home-raw.html`, rawHtml);
await browser.close();
console.log(`CSS=${cssMap.size} Img=${imgMap.size}`);

// --- kill-external.js ---
fs.writeFileSync(`${OUT}/js/kill-external.js`, `(function(){
  var _xo=XMLHttpRequest.prototype.open;
  XMLHttpRequest.prototype.open=function(m,url){if(typeof url==='string'&&url.match(/^https?:\\/\\//)&&!url.includes(location.hostname))return;_xo.apply(this,arguments);};
  var _f=window.fetch;
  window.fetch=function(url){if(typeof url==='string'&&url.match(/^https?:\\/\\//)&&!url.includes(location.hostname))return Promise.resolve(new Response('{}',{status:200}));return _f.apply(window,arguments);};
})();`);

// Fix CSS url() refs
for (const fname of fs.readdirSync(`${OUT}/css`)) {
  let css = fs.readFileSync(`${OUT}/css/${fname}`, 'utf8');
  for (const [orig, local] of [...cssMap, ...imgMap]) css = css.replaceAll(orig, local);
  fs.writeFileSync(`${OUT}/css/${fname}`, css);
}

// Detect CMS
const rawLower = rawHtml.toLowerCase();
const isWP = rawLower.includes('wp-content');
const isNext = rawLower.includes('__next') || rawLower.includes('_next');
const isNuxt = rawLower.includes('__nuxt') || rawLower.includes('nuxt');
console.log(`CMS: WP=${isWP} Next=${isNext} Nuxt=${isNuxt}`);

// Build home.html
const headEnd = rawHtml.indexOf('</head>');
const afterHead = headEnd > -1 ? rawHtml.slice(headEnd + 7) : rawHtml;
const bodyM = afterHead.match(/<body[^>]*>([\s\S]*)<\/body>/i);
let body = bodyM ? bodyM[1] : afterHead;

// Strip tracking scripts
body = body
  .replace(/<script[^>]*(?:googletagmanager|gtag|analytics|tawk|hotjar|cookiebot)[^>]*>[\s\S]*?<\/script>/gi, '')
  .replace(/<noscript[^>]*>[\s\S]*?(?:googletagmanager|analytics)[\s\S]*?<\/noscript>/gi, '');

// Rewrite image URLs
for (const [origUrl, localPath] of imgMap) body = body.replaceAll(origUrl, localPath);
for (const [origUrl, localPath] of cssMap) body = body.replaceAll(origUrl, localPath);

// CMS fixes
body = body
  .replace(/Corleone/g, 'Demo Corleone')
  .replace(/corleone\.cz/gi, 'demo.local')
  .replace(/\+420\s*[0-9 ]{9,12}/g, '+420 608 288 777')
  .replace(/[a-z._+-]+@corleone\.cz/gi, 'info@demo.local')
  .replace(/href="https?:\/\/(?:www\.)?corleone\.cz([^"]*)"/gi, 'href="#"');

const cssUrls = [...new Set([...cssMap.values()])];
const finalHtml = `<!DOCTYPE html><html lang="cs"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><meta name="robots" content="noindex, nofollow"><title>Demo Corleone — Ukázka šablony</title>
${cssUrls.map(u => `<link rel="stylesheet" href="${u}">`).join('\n')}
<script src="/clones/${SLUG}/js/kill-external.js"></script>
<style>[class*="cookie"],[id*="cookie"]{display:none!important;}.modal-backdrop{display:none!important;}</style>
</head><body>${body}</body></html>`;

fs.writeFileSync(`${OUT}/pages/home.html`, finalHtml);
const ext = (finalHtml.match(/https?:\/\/(?!demo\.local)[a-z]/g)||[]).length;
const brand = (finalHtml.match(/\bCorleone\b(?!\s+Demo|\s+PROMO|\s+AKCE|\s+PRODEJNA)/g)||[]).length;
console.log(`home.html: ${finalHtml.length}B | ext=${ext} | brand=${brand}`);
console.log('=== HOTOVO ===');
