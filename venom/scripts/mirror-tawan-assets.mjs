/**
 * FÁZE 1 — Mirror tawan.cz
 * CMS: Drupal, custom theme "awesome"
 * Pages: home, masaze, cenik, darkove-poukazy
 */
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright-core';

const SLUG = 'tawan';
const ORIGIN = 'https://www.tawan.cz';
const OUT = `public/clones/${SLUG}`;
const PAGES = [
  { slug: 'home',     url: '/' },
  { slug: 'masaze',   url: '/masaze' },
  { slug: 'cenik',    url: '/cenik' },
  { slug: 'voucher',  url: '/darkove-poukazy' },
];

for (const d of ['pages', 'img', 'css', 'js', 'fonts']) fs.mkdirSync(`${OUT}/${d}`, { recursive: true });
// Drupal stores files in sites/default/files/
fs.mkdirSync(`${OUT}/sites/default/files/images`, { recursive: true });
fs.mkdirSync(`${OUT}/sites/default/files/css`, { recursive: true });
fs.mkdirSync(`${OUT}/themes/custom/awesome`, { recursive: true });

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
    if (!url.startsWith(ORIGIN) && !url.includes('fonts.googleapis') && !url.includes('fonts.gstatic') && !url.includes('unpkg.com')) return;
    const ct = resp.headers()['content-type'] || '';
    const rel = url.replace(ORIGIN, '').split('?')[0];
    const fname = path.basename(rel);
    if (!fname || fname.length < 2) return;

    try {
      const body = await resp.body();
      if (body.length < 4) return;

      if (ct.includes('css') || rel.endsWith('.css')) {
        // Preserve Drupal CSS structure: /sites/default/files/css/
        let dest;
        if (rel.includes('/sites/default/files/css/')) {
          dest = `${OUT}/sites/default/files/css/${fname}`;
        } else {
          dest = `${OUT}/css/${fname}`;
        }
        if (!fs.existsSync(dest)) fs.writeFileSync(dest, body);
        cssMap.set(url, dest.replace(`public/clones/${SLUG}`, `/clones/${SLUG}`));
        cssMap.set(url.split('?')[0], dest.replace(`public/clones/${SLUG}`, `/clones/${SLUG}`));
      } else if (ct.includes('javascript') || rel.endsWith('.js')) {
        if (!fname.includes('gtm') && !fname.includes('analytics') && !fname.includes('cookiebot')) {
          const dest = `${OUT}/js/${fname}`;
          if (!fs.existsSync(dest)) fs.writeFileSync(dest, body);
          jsMap.set(url, `/clones/${SLUG}/js/${fname}`);
          jsMap.set(url.split('?')[0], `/clones/${SLUG}/js/${fname}`);
        }
      } else if (ct.includes('image') || rel.match(/\.(jpg|jpeg|png|webp|svg|gif|ico)$/i)) {
        // Preserve sites/default/files/images structure
        if (rel.includes('/sites/default/files/')) {
          const subPath = rel.replace('/sites/default/files/', '');
          const subDir = path.dirname(subPath);
          fs.mkdirSync(`${OUT}/sites/default/files/${subDir}`, { recursive: true });
          const dest = `${OUT}/sites/default/files/${subPath}`;
          if (!fs.existsSync(dest)) fs.writeFileSync(dest, body);
          imgMap.set(url, `/clones/${SLUG}/sites/default/files/${subPath}`);
          imgMap.set(url.split('?')[0], `/clones/${SLUG}/sites/default/files/${subPath}`);
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

  await page.goto(`${ORIGIN}${p.url}`, { waitUntil: 'networkidle', timeout: 40000 });
  await page.waitForTimeout(3000);

  // Dismiss cookie consent (Cookiebot)
  try { await page.click('#CybotCookiebotDialogBodyButtonAccept, .cb-enable, [id*="CookiebotDialog"] button', { timeout: 2000 }); await page.waitForTimeout(500); } catch {}

  const html = await page.content();
  fs.writeFileSync(`${OUT}/pages/${p.slug}-raw.html`, html);
  console.log(`  ${p.slug}: ${html.length} bytes | css:${cssMap.size} img:${imgMap.size} js:${jsMap.size}`);
  await page.close();
  await context.close();
}

await browser.close();
console.log(`\nTotal: css=${cssMap.size} js=${jsMap.size} img=${imgMap.size}`);

// Process HTML
function processHtml(html) {
  // Rewrite all asset URLs
  for (const [orig, local] of [...cssMap, ...jsMap, ...imgMap]) {
    html = html.replaceAll(orig, local);
  }
  html = html.replaceAll(ORIGIN, '');

  // Strip tracking + Cookiebot
  html = html.replace(/<script[^>]*(?:cookiebot|Cookiebot|CookieConsent|googletagmanager|gtag|hotjar|facebook\.net)[^>]*>[\s\S]*?<\/script>/gi, '');
  html = html.replace(/<script[^>]*(?:cookiebot|googletagmanager)[^>]*><\/script>/gi, '');

  // Internal nav links
  const linkMap = {
    '/masaze': '/demo/tawan-demo/masaze',
    '/cenik': '/demo/tawan-demo/cenik',
    '/darkove-poukazy': '/demo/tawan-demo/voucher',
    'https://www.tawan.cz/': '/demo/tawan-demo',
    'https://www.tawan.cz': '/demo/tawan-demo',
  };
  for (const [from, to] of Object.entries(linkMap)) {
    html = html.replace(new RegExp(`href="${from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"`, 'g'), `href="${to}"`);
  }
  html = html.replace(/href="\/(?!clones|demo|_next)[^"]*"/g, 'href="#"');

  return html;
}

console.log('\n--- Processing HTML ---');
for (const p of PAGES) {
  const raw = fs.readFileSync(`${OUT}/pages/${p.slug}-raw.html`, 'utf8');
  const processed = processHtml(raw);
  fs.writeFileSync(`${OUT}/pages/${p.slug}.html`, processed);
  const extLeft = (processed.match(/https?:\/\/(?:www\.)?tawan\.cz/gi) || []).length;
  console.log(`${p.slug}: ${raw.length} → ${processed.length} | tawan refs: ${extLeft}`);
}

// Rewrite URL refs in CSS files
for (const dir of [`${OUT}/css`, `${OUT}/sites/default/files/css`]) {
  if (!fs.existsSync(dir)) continue;
  for (const fname of fs.readdirSync(dir)) {
    let css = fs.readFileSync(`${dir}/${fname}`, 'utf8');
    for (const [orig, local] of [...cssMap, ...imgMap]) css = css.replaceAll(orig, local);
    css = css.replace(/url\((['"]?)(?:https?:\/\/(?:www\.)?tawan\.cz)?(\/sites\/default\/files\/[^'")]+)\1\)/gi,
      (_, q, rel) => `url(${q}/clones/${SLUG}${rel.split('?')[0]}${q})`);
    fs.writeFileSync(`${dir}/${fname}`, css);
  }
}

console.log('\nMirror done ✅');
const imgCount = fs.readdirSync(`${OUT}/img`).length +
  (fs.existsSync(`${OUT}/sites/default/files/images`) ? fs.readdirSync(`${OUT}/sites/default/files/images`).length : 0);
console.log(`css:${fs.readdirSync(OUT+'/css').length + (fs.existsSync(OUT+'/sites/default/files/css') ? fs.readdirSync(OUT+'/sites/default/files/css').length : 0)} js:${fs.readdirSync(OUT+'/js').length} img:~${imgCount} fonts:${fs.readdirSync(OUT+'/fonts').length}`);
