/**
 * FÁZE 1 — mirror cleancat.cz (WordPress + Elementor, fotovoltaika)
 */
import { chromium } from 'playwright-core';
import fs from 'node:fs';
import path from 'node:path';

const SLUG   = 'cleancat';
const ORIGIN = 'https://www.cleancat.cz';
const OUT    = `public/clones/${SLUG}`;

for (const d of ['pages','img','css','js','fonts']) fs.mkdirSync(`${OUT}/${d}`, { recursive: true });

const cssMap = new Map();
const imgMap = new Map();

const browser = await chromium.launch({
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  args: ['--no-sandbox'], headless: true,
});
const context = await browser.newContext({
  userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  locale: 'cs-CZ',
});
const page = await context.newPage();

await page.route('**/*', async (route) => {
  const url = route.request().url();
  if (url.includes('googletagmanager') || url.includes('google-analytics') ||
      url.includes('facebook.net') || url.includes('analytics') ||
      url.includes('hotjar') || url.includes('cookiebot') || url.includes('doubleclick')) {
    return route.abort();
  }
  route.continue();
});

page.on('response', async (resp) => {
  const url  = resp.url();
  const ct   = resp.headers()['content-type'] || '';
  const urlNoQ = url.split('?')[0];
  const fname  = path.basename(urlNoQ).split('#')[0];
  if (!fname || fname.length < 3) return;
  try {
    const body = await resp.body();
    if (body.length < 4) return;
    if (ct.includes('css') || urlNoQ.endsWith('.css')) {
      const dest = `${OUT}/css/${fname}`;
      if (!fs.existsSync(dest)) fs.writeFileSync(dest, body);
      cssMap.set(url, `/clones/${SLUG}/css/${fname}`);
      cssMap.set(urlNoQ, `/clones/${SLUG}/css/${fname}`);
    } else if (ct.includes('image') || urlNoQ.match(/\.(jpg|jpeg|png|webp|svg|gif|ico)$/i)) {
      if (body.length > 200) {
        const dest = `${OUT}/img/${fname}`;
        if (!fs.existsSync(dest)) fs.writeFileSync(dest, body);
        imgMap.set(url, `/clones/${SLUG}/img/${fname}`);
        imgMap.set(urlNoQ, `/clones/${SLUG}/img/${fname}`);
      }
    } else if (ct.includes('woff') || urlNoQ.match(/\.(woff2?|ttf|otf)$/i)) {
      const dest = `${OUT}/fonts/${fname}`;
      if (!fs.existsSync(dest)) fs.writeFileSync(dest, body);
    } else if (ct.includes('javascript') && body.length > 100 && body.length < 500000) {
      const dest = `${OUT}/js/${fname}`;
      if (!fs.existsSync(dest) && fname.endsWith('.js')) fs.writeFileSync(dest, body);
    }
  } catch { /* ignore */ }
});

console.log('Navigating cleancat.cz...');
await page.goto(ORIGIN, { waitUntil: 'networkidle', timeout: 45000 });
await page.waitForTimeout(4000);

try {
  await page.click('button:has-text("Přijmout"), button:has-text("Souhlasím"), .cookie-accept, [aria-label="Close"]', { timeout: 3000 });
  console.log('Overlay dismissed');
} catch { console.log('No overlay'); }

await page.evaluate(async () => {
  for (let i = 0; i < 30; i++) { window.scrollBy(0, window.innerHeight); await new Promise(r => setTimeout(r, 200)); }
  window.scrollTo(0, 0);
});
await page.waitForTimeout(3000);

const rawHtml = await page.content();
console.log(`Raw HTML: ${rawHtml.length} bytes`);
fs.writeFileSync(`${OUT}/pages/home-raw.html`, rawHtml);

await page.screenshot({ path: '/tmp/cleancat-orig-full.jpg', fullPage: true });
console.log('Screenshot saved');
await browser.close();
console.log(`CSS=${cssMap.size} Img=${imgMap.size}`);

fs.writeFileSync(`${OUT}/js/kill-external.js`, `(function(){var _xo=XMLHttpRequest.prototype.open;XMLHttpRequest.prototype.open=function(m,url){if(typeof url==='string'&&url.match(/^https?:\\/\\//)&&!url.includes(location.hostname))return;_xo.apply(this,arguments);};var _f=window.fetch;window.fetch=function(url){if(typeof url==='string'&&url.match(/^https?:\\/\\//)&&!url.includes(location.hostname))return Promise.resolve(new Response('{}',{status:200}));return _f.apply(window,arguments);};})();`);

for (const fname of fs.readdirSync(`${OUT}/css`)) {
  let css = fs.readFileSync(`${OUT}/css/${fname}`, 'utf8');
  for (const [orig, local] of [...cssMap, ...imgMap]) css = css.replaceAll(orig, local);
  fs.writeFileSync(`${OUT}/css/${fname}`, css);
}

console.log('=== FÁZE 1 HOTOVO ===');
