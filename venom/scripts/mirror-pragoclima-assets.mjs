import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright-core';

const SLUG   = 'pragoclima';
const ORIGIN = 'https://www.pragoclima.cz';
const OUT    = `public/clones/${SLUG}`;

const PAGES = [
  { slug: 'home',      url: '/' },
  { slug: 'sluzby',    url: '/sluzby' },
  { slug: 'reference', url: '/reference' },
  { slug: 'kontakt',   url: '/kontakt' },
];

const assetMap = new Map();
fs.mkdirSync(`${OUT}/pages`, { recursive: true });

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
    const rel = url.replace(ORIGIN, '').split('?')[0];
    const ext = path.extname(rel).toLowerCase();
    const isCss  = ct.includes('css') || ext === '.css';
    const isJs   = ct.includes('javascript') || ext === '.js';
    const isImg  = ct.includes('image') || ['.jpg','.jpeg','.png','.webp','.gif','.svg','.ico','.avif'].includes(ext);
    const isFont = ct.includes('font') || ['.woff','.woff2','.ttf','.otf','.eot'].includes(ext);
    if (!isCss && !isJs && !isImg && !isFont) return;

    if (url.startsWith(ORIGIN)) {
      const base = path.basename(rel);
      if (isJs && /gtm|analytics|pixel|hotjar|cookiebot|gtag|fbevents/.test(base)) return;
      try {
        const dest = `${OUT}${rel}`;
        if (!fs.existsSync(dest)) {
          const body = await resp.body();
          if (body.length < 4) return;
          fs.mkdirSync(path.dirname(dest), { recursive: true });
          fs.writeFileSync(dest, body);
        }
        assetMap.set(url, `/clones/${SLUG}${rel}`);
        assetMap.set(url.split('?')[0], `/clones/${SLUG}${rel}`);
      } catch {}
    }

    // Webflow CDN (images, fonts)
    const wfCdn = url.match(/https?:\/\/(?:uploads-ssl\.webflow\.com|cdn\.prod\.website-files\.com)\/(.*)/);
    if (wfCdn && (isImg || isFont || isCss)) {
      const rel2 = '/' + wfCdn[1].split('?')[0];
      try {
        const dest = `${OUT}/cdn${rel2}`;
        if (!fs.existsSync(dest)) {
          const body = await resp.body();
          if (body.length < 4) return;
          fs.mkdirSync(path.dirname(dest), { recursive: true });
          fs.writeFileSync(dest, body);
        }
        assetMap.set(url, `/clones/${SLUG}/cdn${rel2}`);
        assetMap.set(url.split('?')[0], `/clones/${SLUG}/cdn${rel2}`);
      } catch {}
    }
  });

  try {
    await page.goto(`${ORIGIN}${p.url}`, { waitUntil: 'networkidle', timeout: 45000 });
    await page.waitForTimeout(3000);
  } catch (e) { console.log('  timeout', e.message.substring(0,60)); }
  try { await page.click('[class*="cookie"] button, [id*="cookie"] button', { timeout: 2000 }); } catch {}
  await page.waitForTimeout(800);

  const html = await page.content();
  fs.writeFileSync(`${OUT}/pages/${p.slug}-raw.html`, html);
  console.log(`  ${p.slug}: ${html.length} bytes | assets: ${assetMap.size}`);
  await page.close();
  await context.close();
}

await browser.close();
console.log(`\nTotal assets: ${assetMap.size}`);

const LINK_MAP = {
  '/':            `/demo/pragoclima-demo`,
  '/sluzby':      `/demo/pragoclima-demo/sluzby`,
  '/reference':   `/demo/pragoclima-demo/reference`,
  '/kontakt':     `/demo/pragoclima-demo/kontakt`,
  '/o-nas':       `/demo/pragoclima-demo`,
  '/pro-firmy':   `/demo/pragoclima-demo`,
  '/akce':        `/demo/pragoclima-demo`,
  '/kariera':     `/demo/pragoclima-demo`,
  '/katalog':     `/demo/pragoclima-demo`,
  '/sluzby/montaz-klimatizaci':   `/demo/pragoclima-demo/sluzby`,
  '/sluzby/pravidelny-servis':    `/demo/pragoclima-demo/sluzby`,
  '/sluzby/opravy-klimatizaci':   `/demo/pragoclima-demo/sluzby`,
  '/sluzby/velkoobchodni-prodej': `/demo/pragoclima-demo/sluzby`,
};

function processHtml(html) {
  for (const [orig, local] of assetMap) html = html.replaceAll(orig, local);
  html = html.replace(/https?:\/\/uploads-ssl\.webflow\.com\//g, `/clones/${SLUG}/cdn/`);
  html = html.replace(/https?:\/\/cdn\.prod\.website-files\.com\//g, `/clones/${SLUG}/cdn/`);

  html = html.replace(/<script[^>]*src="https?:\/\/[^"]+"[^>]*>[\s\S]*?<\/script>/gi, '');
  html = html.replace(/<script[^>]*(?:googletagmanager|gtag|hotjar|cookiebot|analytics|fbevents|webflow\.com\/api)[^>]*>[\s\S]*?<\/script>/gi, '');
  html = html.replace(/<noscript><iframe[^>]*googletagmanager[^>]*><\/iframe><\/noscript>/gi, '');

  html = html.replace(/href="https?:\/\/(?:www\.)?(?:facebook|instagram|youtube|linkedin|twitter|x\.com)\.com\/[^"]*"/gi, 'href="#"');

  for (const [from, to] of Object.entries(LINK_MAP)) {
    html = html.replace(new RegExp(`href="${from.replace(/\//g,'\\/')}"`, 'gi'), `href="${to}"`);
    html = html.replace(new RegExp(`href="https?://(?:www\\.)?pragoclima\\.cz${from.replace(/\//g,'\\/')}(?=["/?#])`, 'g'), `href="${to}`);
  }
  html = html.replace(/href="https?:\/\/(?:www\.)?pragoclima\.cz\/[^"]*"/gi, `href="/demo/pragoclima-demo"`);

  html = html.replace(/PragoClima(?!\s*Demo)/g, 'PragoClima Demo');
  html = html.replace(/pragoclima\.cz/gi, 'demo.local');
  html = html.replace(/\+420\s*\d{3}\s*\d{3}\s*\d{3}/g, '+420 608 288 777');
  html = html.replace(/[a-z0-9._-]+@[a-z0-9.-]+\.[a-z]{2,}/gi, 'info@demo.local');

  html = html.replace(/<iframe[^>]*(?:google\.com\/maps|maps\.google)[^>]*>[\s\S]*?<\/iframe>/gi,
    '<div style="background:#e0e0e0;height:300px;display:flex;align-items:center;justify-content:center;color:#666">Mapa</div>');

  return html;
}

console.log('\n--- Processing HTML ---');
for (const p of PAGES) {
  const rawPath = `${OUT}/pages/${p.slug}-raw.html`;
  if (!fs.existsSync(rawPath)) { console.log(`SKIP ${p.slug}`); continue; }
  const raw = fs.readFileSync(rawPath, 'utf8');
  const processed = processHtml(raw);
  fs.writeFileSync(`${OUT}/pages/${p.slug}.html`, processed);
  const extLeft = (processed.match(/https?:\/\/(?!(?:demo\.local|schema\.org|w3\.org))[a-z0-9.-]+\.[a-z]{2,}/gi) || []).length;
  const brandLeft = (processed.match(/pragoclima\.cz/gi) || []).length;
  console.log(`${p.slug}: ${raw.length}→${processed.length} | ext=${extLeft} brand=${brandLeft}`);
}
console.log('\nMirror done ✅');
