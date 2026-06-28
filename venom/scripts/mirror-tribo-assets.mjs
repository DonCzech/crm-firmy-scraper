/**
 * FÁZE 1 — Mirror tribo.cz
 * Custom CMS, cached assets
 */
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright-core';

const SLUG = 'tribo';
const ORIGIN = 'https://www.tribo.cz';
const OUT = `public/clones/${SLUG}`;
const PAGES = [
  { slug: 'home',    url: '/cs' },
  { slug: 'tattoo',  url: '/tattoo' },
  { slug: 'cenik',   url: '/cenik' },
  { slug: 'kontakt', url: '/kontakt' },
];

for (const d of ['pages', 'img', 'css', 'js', 'fonts', 'assets']) fs.mkdirSync(`${OUT}/${d}`, { recursive: true });

const cssMap = new Map();
const jsMap  = new Map();
const imgMap = new Map();

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
    if (!url.startsWith(ORIGIN)) return;
    const ct = resp.headers()['content-type'] || '';
    const rel = url.replace(ORIGIN, '').split('?')[0];
    const fname = path.basename(rel);
    if (!fname || fname.length < 2) return;
    try {
      const body = await resp.body();
      if (body.length < 4) return;
      if (ct.includes('css') || rel.endsWith('.css')) {
        const dest = `${OUT}/css/${fname}`;
        if (!fs.existsSync(dest)) fs.writeFileSync(dest, body);
        cssMap.set(url, `/clones/${SLUG}/css/${fname}`);
        cssMap.set(url.split('?')[0], `/clones/${SLUG}/css/${fname}`);
      } else if (ct.includes('javascript') || rel.endsWith('.js')) {
        const dest = `${OUT}/js/${fname}`;
        if (!fs.existsSync(dest)) fs.writeFileSync(dest, body);
        jsMap.set(url, `/clones/${SLUG}/js/${fname}`);
        jsMap.set(url.split('?')[0], `/clones/${SLUG}/js/${fname}`);
      } else if (ct.includes('image') || rel.match(/\.(jpg|jpeg|png|webp|svg|gif|ico)$/i)) {
        // Preserve assets/ structure
        if (rel.includes('/assets/')) {
          const subRel = rel.replace('/assets/', '');
          fs.mkdirSync(`${OUT}/assets/${path.dirname(subRel)}`, { recursive: true });
          const dest = `${OUT}/assets/${subRel}`;
          if (!fs.existsSync(dest)) fs.writeFileSync(dest, body);
          imgMap.set(url, `/clones/${SLUG}/assets/${subRel}`);
          imgMap.set(url.split('?')[0], `/clones/${SLUG}/assets/${subRel}`);
        } else {
          const dest = `${OUT}/img/${fname}`;
          if (!fs.existsSync(dest)) fs.writeFileSync(dest, body);
          imgMap.set(url, `/clones/${SLUG}/img/${fname}`);
          imgMap.set(url.split('?')[0], `/clones/${SLUG}/img/${fname}`);
        }
      } else if (ct.includes('font') || ct.includes('woff') || rel.match(/\.(woff2?|ttf|otf)$/i)) {
        const dest = `${OUT}/fonts/${fname}`;
        if (!fs.existsSync(dest)) fs.writeFileSync(dest, body);
        cssMap.set(url, `/clones/${SLUG}/fonts/${fname}`);
        cssMap.set(url.split('?')[0], `/clones/${SLUG}/fonts/${fname}`);
      }
    } catch {}
  });

  await page.goto(`${ORIGIN}${p.url}`, { waitUntil: 'networkidle', timeout: 35000 });
  await page.waitForTimeout(3000);
  try { await page.click('button[data-consent-accept], .cookie-accept, [class*="cookie"] button', { timeout: 2000 }); } catch {}

  const html = await page.content();
  fs.writeFileSync(`${OUT}/pages/${p.slug}-raw.html`, html);
  console.log(`  ${p.slug}: ${html.length} bytes | css:${cssMap.size} img:${imgMap.size} js:${jsMap.size}`);
  await page.close();
  await context.close();
}

await browser.close();
console.log(`\nTotal: css=${cssMap.size} js=${jsMap.size} img=${imgMap.size}`);

function processHtml(html) {
  for (const [orig, local] of [...cssMap, ...jsMap, ...imgMap]) html = html.replaceAll(orig, local);
  html = html.replaceAll(ORIGIN, '');
  html = html.replace(/<script[^>]*(?:googletagmanager|gtag|hotjar|facebook\.net|cookiebot|CookieConsent)[^>]*>[\s\S]*?<\/script>/gi, '');
  html = html.replace(/href="\/(?!clones|demo|_next)[^"]*"/g, 'href="#"');
  const linkMap = {
    '/tattoo': '/demo/tribo-demo/tattoo',
    '/cenik': '/demo/tribo-demo/cenik',
    '/kontakt': '/demo/tribo-demo/kontakt',
    '/cs': '/demo/tribo-demo',
  };
  for (const [from, to] of Object.entries(linkMap)) {
    html = html.replace(new RegExp(`href="${from.replace(/\//g,'\\/')}"`, 'g'), `href="${to}"`);
  }
  return html;
}

console.log('\n--- Processing HTML ---');
for (const p of PAGES) {
  const raw = fs.readFileSync(`${OUT}/pages/${p.slug}-raw.html`, 'utf8');
  const processed = processHtml(raw);
  fs.writeFileSync(`${OUT}/pages/${p.slug}.html`, processed);
  const extLeft = (processed.match(/https?:\/\/(?:www\.)?tribo\.cz/gi) || []).length;
  console.log(`${p.slug}: ${raw.length}→${processed.length} | tribo refs: ${extLeft}`);
}

// Fix CSS
for (const fname of fs.readdirSync(`${OUT}/css`)) {
  let css = fs.readFileSync(`${OUT}/css/${fname}`, 'utf8');
  for (const [orig, local] of [...cssMap, ...imgMap]) css = css.replaceAll(orig, local);
  css = css.replace(/url\((['"]?)https?:\/\/(?:www\.)?tribo\.cz([^'")]+)\1\)/gi, (_, q, rel2) => `url(${q}/clones/${SLUG}${rel2.split('?')[0]}${q})`);
  fs.writeFileSync(`${OUT}/css/${fname}`, css);
}

console.log('\nMirror done ✅');
console.log(`css:${fs.readdirSync(OUT+'/css').length} js:${fs.readdirSync(OUT+'/js').length} fonts:${fs.readdirSync(OUT+'/fonts').length}`);
