/**
 * Mirror yesvisage.cz — WordPress + custom ipress theme (Webpack build)
 */
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright-core';

const SLUG = 'yesvisage';
const ORIGIN = 'https://www.yesvisage.cz';
const OUT = `public/clones/${SLUG}`;
const PAGES = [
  { slug: 'home',    url: '/' },
  { slug: 'cenik',   url: '/cenik/' },
  { slug: 'kontakt', url: '/kontakt/' },
];

for (const d of ['pages', 'img', 'css', 'js', 'fonts', 'svgs']) fs.mkdirSync(`${OUT}/${d}`, { recursive: true });
fs.mkdirSync(`${OUT}/app/themes/ipress/build/css`, { recursive: true });
fs.mkdirSync(`${OUT}/app/themes/ipress/build/js`, { recursive: true });
fs.mkdirSync(`${OUT}/app/themes/ipress/build/images`, { recursive: true });
fs.mkdirSync(`${OUT}/app/themes/ipress/build/svgs`, { recursive: true });
fs.mkdirSync(`${OUT}/app/uploads`, { recursive: true });

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
    const fname = path.basename(rel).split('?')[0];
    if (!fname || fname.length < 2) return;
    try {
      const body = await resp.body();
      if (body.length < 4) return;
      if (ct.includes('css') || rel.endsWith('.css')) {
        if (rel.startsWith('/app/themes/ipress/build/css/')) {
          const dest = `${OUT}/app/themes/ipress/build/css/${fname}`;
          if (!fs.existsSync(dest)) fs.writeFileSync(dest, body);
          cssMap.set(url, `/clones/${SLUG}/app/themes/ipress/build/css/${fname}`);
          cssMap.set(url.split('?')[0], `/clones/${SLUG}/app/themes/ipress/build/css/${fname}`);
        } else {
          const dest = `${OUT}/css/${fname}`;
          if (!fs.existsSync(dest)) fs.writeFileSync(dest, body);
          cssMap.set(url, `/clones/${SLUG}/css/${fname}`);
          cssMap.set(url.split('?')[0], `/clones/${SLUG}/css/${fname}`);
        }
      } else if (ct.includes('javascript') || rel.endsWith('.js')) {
        if (!fname.includes('gtm') && !fname.includes('analytics') && !fname.includes('pixel') &&
            !fname.includes('cookiebot') && !fname.includes('consent') && !fname.includes('manychat') &&
            !fname.includes('mccdn')) {
          if (rel.startsWith('/app/themes/ipress/build/js/')) {
            const dest = `${OUT}/app/themes/ipress/build/js/${fname}`;
            if (!fs.existsSync(dest)) fs.writeFileSync(dest, body);
            jsMap.set(url, `/clones/${SLUG}/app/themes/ipress/build/js/${fname}`);
            jsMap.set(url.split('?')[0], `/clones/${SLUG}/app/themes/ipress/build/js/${fname}`);
          } else {
            const dest = `${OUT}/js/${fname}`;
            if (!fs.existsSync(dest)) fs.writeFileSync(dest, body);
            jsMap.set(url, `/clones/${SLUG}/js/${fname}`);
            jsMap.set(url.split('?')[0], `/clones/${SLUG}/js/${fname}`);
          }
        }
      } else if (ct.includes('image') || rel.match(/\.(jpg|jpeg|png|webp|svg|gif|ico)$/i)) {
        if (rel.startsWith('/app/uploads/') || rel.startsWith('/app/themes/ipress/build/images/')) {
          if (rel.startsWith('/app/uploads/')) {
            const subRel = rel.replace('/app/uploads/', '');
            fs.mkdirSync(`${OUT}/app/uploads/${path.dirname(subRel)}`, { recursive: true });
            const dest = `${OUT}/app/uploads/${subRel}`;
            if (!fs.existsSync(dest)) fs.writeFileSync(dest, body);
            imgMap.set(url, `/clones/${SLUG}/app/uploads/${subRel}`);
            imgMap.set(url.split('?')[0], `/clones/${SLUG}/app/uploads/${subRel}`);
          } else {
            const dest = `${OUT}/app/themes/ipress/build/images/${fname}`;
            if (!fs.existsSync(dest)) fs.writeFileSync(dest, body);
            imgMap.set(url, `/clones/${SLUG}/app/themes/ipress/build/images/${fname}`);
            imgMap.set(url.split('?')[0], `/clones/${SLUG}/app/themes/ipress/build/images/${fname}`);
          }
        } else if (rel.endsWith('.svg') || rel.startsWith('/app/themes/ipress/build/svgs/')) {
          const dest = `${OUT}/app/themes/ipress/build/svgs/${fname}`;
          if (!fs.existsSync(dest)) fs.writeFileSync(dest, body);
          imgMap.set(url, `/clones/${SLUG}/app/themes/ipress/build/svgs/${fname}`);
          imgMap.set(url.split('?')[0], `/clones/${SLUG}/app/themes/ipress/build/svgs/${fname}`);
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
  try {
    await page.click('[class*="accept"], .accept-cookies, #accept-all, button[data-accept]', { timeout: 2000 });
    await page.waitForTimeout(1000);
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
  for (const [orig, local] of [...cssMap, ...jsMap, ...imgMap]) {
    html = html.replaceAll(orig, local);
  }
  html = html.replaceAll(ORIGIN, '');
  html = html.replaceAll('https://yesvisage.cz', '');
  html = html.replace(/<script[^>]*(?:googletagmanager|gtag|hotjar|cookiebot|manychat|mccdn)[^>]*>[\s\S]*?<\/script>/gi, '');
  html = html.replace(/<noscript>[^<]*(?:googletagmanager|gtm)[^<]*<\/noscript>/gi, '');
  const linkMap = {
    '/cenik/': '/demo/yesvisage-demo/cenik',
    '/kontakt/': '/demo/yesvisage-demo/kontakt',
    '/': '/demo/yesvisage-demo',
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
  const extLeft = (processed.match(/https?:\/\/(?:www\.)?yesvisage\.cz/gi) || []).length;
  console.log(`${p.slug}: ${raw.length}→${processed.length} | yesvisage refs: ${extLeft}`);
}

// Fix CSS url() refs
const cssDirs = [
  `${OUT}/app/themes/ipress/build/css`,
  `${OUT}/css`,
];
for (const dir of cssDirs) {
  if (!fs.existsSync(dir)) continue;
  for (const f of fs.readdirSync(dir)) {
    if (!f.endsWith('.css')) continue;
    let css = fs.readFileSync(`${dir}/${f}`, 'utf8');
    for (const [orig, local] of [...cssMap, ...imgMap]) css = css.replaceAll(orig, local);
    css = css.replace(/url\((['"]?)https?:\/\/(?:www\.)?yesvisage\.cz([^'")]+)\1\)/gi,
      (_, q, r2) => `url(${q}/clones/${SLUG}${r2.split('?')[0]}${q})`);
    fs.writeFileSync(`${dir}/${f}`, css);
  }
}

console.log('\nMirror done ✅');
