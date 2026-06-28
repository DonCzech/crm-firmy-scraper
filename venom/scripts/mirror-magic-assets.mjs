/**
 * Mirror magictattoo.cz — WordPress + Bricks Builder
 * Playwright scraping for full JS render
 */
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright-core';

const SLUG = 'magic';
const ORIGIN = 'https://www.magictattoo.cz';
const OUT = `public/clones/${SLUG}`;
const PAGES = [
  { slug: 'home',   url: '/' },
  { slug: 'cenik',  url: '/cenik/' },
  { slug: 'faq',    url: '/caste-otazky/' },
];

for (const d of ['pages', 'img', 'css', 'js', 'fonts']) fs.mkdirSync(`${OUT}/${d}`, { recursive: true });
fs.mkdirSync(`${OUT}/wp-content/uploads`, { recursive: true });
fs.mkdirSync(`${OUT}/wp-content/cache/wpfc-minified`, { recursive: true });

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
    if (!url.startsWith(ORIGIN) && !url.startsWith('https://magictattoo.cz')) return;
    const ct = resp.headers()['content-type'] || '';
    const rel = url.replace(ORIGIN, '').replace('https://magictattoo.cz', '').split('?')[0];
    const fname = path.basename(rel).split('?')[0];
    if (!fname || fname.length < 2) return;
    try {
      const body = await resp.body();
      if (body.length < 4) return;
      if (ct.includes('css') || rel.endsWith('.css')) {
        // Preserve wpfc-minified cache path
        if (rel.includes('/wp-content/cache/wpfc-minified/')) {
          const subRel = rel.replace('/wp-content/cache/wpfc-minified/', '');
          const dir = path.dirname(subRel);
          fs.mkdirSync(`${OUT}/wp-content/cache/wpfc-minified/${dir}`, { recursive: true });
          const dest = `${OUT}/wp-content/cache/wpfc-minified/${subRel}`;
          if (!fs.existsSync(dest)) fs.writeFileSync(dest, body);
          cssMap.set(url, `/clones/${SLUG}/wp-content/cache/wpfc-minified/${subRel}`);
          cssMap.set(url.split('?')[0], `/clones/${SLUG}/wp-content/cache/wpfc-minified/${subRel}`);
        } else {
          const dest = `${OUT}/css/${fname}`;
          if (!fs.existsSync(dest)) fs.writeFileSync(dest, body);
          cssMap.set(url, `/clones/${SLUG}/css/${fname}`);
          cssMap.set(url.split('?')[0], `/clones/${SLUG}/css/${fname}`);
        }
      } else if (ct.includes('javascript') || rel.endsWith('.js')) {
        if (!fname.includes('gtm') && !fname.includes('analytics') && !fname.includes('pixel') &&
            !fname.includes('cookiebot') && !fname.includes('consent')) {
          const dest = `${OUT}/js/${fname}`;
          if (!fs.existsSync(dest)) fs.writeFileSync(dest, body);
          jsMap.set(url, `/clones/${SLUG}/js/${fname}`);
          jsMap.set(url.split('?')[0], `/clones/${SLUG}/js/${fname}`);
        }
      } else if (ct.includes('image') || rel.match(/\.(jpg|jpeg|png|webp|svg|gif|ico)$/i)) {
        if (rel.includes('/wp-content/uploads/')) {
          const subRel = rel.replace('/wp-content/uploads/', '');
          fs.mkdirSync(`${OUT}/wp-content/uploads/${path.dirname(subRel)}`, { recursive: true });
          const dest = `${OUT}/wp-content/uploads/${subRel}`;
          if (!fs.existsSync(dest)) fs.writeFileSync(dest, body);
          imgMap.set(url, `/clones/${SLUG}/wp-content/uploads/${subRel}`);
          imgMap.set(url.split('?')[0], `/clones/${SLUG}/wp-content/uploads/${subRel}`);
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

  await page.goto(`${ORIGIN}${p.url}`, { waitUntil: 'networkidle', timeout: 45000 });
  await page.waitForTimeout(3000);
  // Accept/dismiss cookie if present
  try {
    await page.click('[class*="accept"], [id*="accept"], .cmplz-accept', { timeout: 2000 });
  } catch {}

  const html = await page.content();
  fs.writeFileSync(`${OUT}/pages/${p.slug}-raw.html`, html);
  console.log(`  ${p.slug}: ${html.length} bytes | css:${cssMap.size} img:${imgMap.size} js:${jsMap.size}`);
  await page.close();
  await context.close();
}

await browser.close();
console.log(`\nTotal: css=${cssMap.size} js=${jsMap.size} img=${imgMap.size}`);

function processHtml(html) {
  // Rewrite all asset URLs to local
  for (const [orig, local] of [...cssMap, ...jsMap, ...imgMap]) {
    html = html.replaceAll(orig, local);
  }
  html = html.replaceAll(ORIGIN, '');
  html = html.replaceAll('https://magictattoo.cz', '');
  // Strip tracking
  html = html.replace(/<script[^>]*(?:googletagmanager|gtag|hotjar|cookiebot|complianz|pixel)[^>]*>[\s\S]*?<\/script>/gi, '');
  html = html.replace(/<noscript>[^<]*(?:googletagmanager|gtm)[^<]*<\/noscript>/gi, '');
  // Internal nav links
  const linkMap = {
    '/cenik/': '/demo/magic-demo/cenik',
    '/caste-otazky/': '/demo/magic-demo/faq',
    '/': '/demo/magic-demo',
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
  const extLeft = (processed.match(/https?:\/\/(?:www\.)?magictattoo\.cz/gi) || []).length;
  console.log(`${p.slug}: ${raw.length}→${processed.length} | magic refs: ${extLeft}`);
}

// Fix CSS url() refs
for (const f of fs.readdirSync(`${OUT}/css`)) {
  let css = fs.readFileSync(`${OUT}/css/${f}`, 'utf8');
  for (const [orig, local] of [...cssMap, ...imgMap]) css = css.replaceAll(orig, local);
  css = css.replace(/url\((['"]?)https?:\/\/(?:www\.)?magictattoo\.cz([^'")]+)\1\)/gi,
    (_, q, rel2) => `url(${q}/clones/${SLUG}${rel2.split('?')[0]}${q})`);
  fs.writeFileSync(`${OUT}/css/${f}`, css);
}
// Fix wpfc-minified CSS
const wpfcDir = `${OUT}/wp-content/cache/wpfc-minified`;
function fixCssDir(dir) {
  for (const f of fs.readdirSync(dir)) {
    const full = path.join(dir, f);
    if (fs.statSync(full).isDirectory()) { fixCssDir(full); continue; }
    if (!f.endsWith('.css')) continue;
    let css = fs.readFileSync(full, 'utf8');
    for (const [orig, local] of [...cssMap, ...imgMap]) css = css.replaceAll(orig, local);
    css = css.replace(/url\((['"]?)https?:\/\/(?:www\.)?magictattoo\.cz([^'")]+)\1\)/gi,
      (_, q, rel2) => `url(${q}/clones/${SLUG}${rel2.split('?')[0]}${q})`);
    fs.writeFileSync(full, css);
  }
}
fixCssDir(wpfcDir);

console.log('\nMirror done ✅');
