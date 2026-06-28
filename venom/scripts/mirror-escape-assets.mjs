/**
 * FÁZE 1 — Mirror escapemassage.cz
 * WordPress + WPO Minify + Cookiebot + Google Fonts
 */
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright-core';

const SLUG = 'escape';
const ORIGIN = 'https://www.escapemassage.cz';
const OUT = `public/clones/${SLUG}`;
const PAGES = [
  { slug: 'home',    url: '/' },
  { slug: 'masaze',  url: '/masaze/' },
  { slug: 'cenik',   url: '/cenik-masazi/' },
  { slug: 'voucher', url: '/darkove-poukazy-na-masaz/' },
];

for (const d of ['pages', 'img', 'css', 'js', 'fonts']) fs.mkdirSync(`${OUT}/${d}`, { recursive: true });
// WPO Minify cache path
fs.mkdirSync(`${OUT}/wp-content/cache/wpo-minify`, { recursive: true });
// Standard WP paths
fs.mkdirSync(`${OUT}/wp-content/uploads`, { recursive: true });
fs.mkdirSync(`${OUT}/wp-content/themes`, { recursive: true });
fs.mkdirSync(`${OUT}/wp-includes`, { recursive: true });

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
    const isOrigin = url.startsWith(ORIGIN);
    const isGF = url.includes('fonts.googleapis.com') || url.includes('fonts.gstatic.com');
    if (!isOrigin && !isGF) return;

    const ct = resp.headers()['content-type'] || '';
    const rel = url.replace(ORIGIN, '').split('?')[0];
    const fname = path.basename(rel);
    if (!fname || fname.length < 2) return;

    try {
      const body = await resp.body();
      if (body.length < 4) return;

      if (ct.includes('css') || rel.endsWith('.css')) {
        // Preserve WP cache structure: /wp-content/cache/wpo-minify/.../assets/
        let localPath, dest;
        if (rel.includes('/wp-content/cache/wpo-minify/')) {
          const subRel = rel.replace('/wp-content/cache/wpo-minify/', '');
          fs.mkdirSync(`${OUT}/wp-content/cache/wpo-minify/${path.dirname(subRel)}`, { recursive: true });
          dest = `${OUT}/wp-content/cache/wpo-minify/${subRel}`;
          localPath = `/clones/${SLUG}/wp-content/cache/wpo-minify/${subRel}`;
        } else if (isGF) {
          dest = `${OUT}/fonts/${fname}`;
          localPath = `/clones/${SLUG}/fonts/${fname}`;
        } else {
          dest = `${OUT}/css/${fname}`;
          localPath = `/clones/${SLUG}/css/${fname}`;
        }
        if (!fs.existsSync(dest)) fs.writeFileSync(dest, body);
        cssMap.set(url, localPath);
        cssMap.set(url.split('?')[0], localPath);
      } else if (ct.includes('javascript') || rel.endsWith('.js')) {
        if (!fname.includes('gtm') && !fname.includes('analytics') && !fname.includes('cookiebot') && !fname.includes('pixel')) {
          const dest = `${OUT}/js/${fname}`;
          if (!fs.existsSync(dest)) fs.writeFileSync(dest, body);
          jsMap.set(url, `/clones/${SLUG}/js/${fname}`);
          jsMap.set(url.split('?')[0], `/clones/${SLUG}/js/${fname}`);
        }
      } else if (ct.includes('image') || rel.match(/\.(jpg|jpeg|png|webp|svg|gif|ico)$/i)) {
        // Preserve WP uploads structure
        if (rel.includes('/wp-content/uploads/')) {
          const subRel = rel.replace('/wp-content/uploads/', '');
          const dir = path.dirname(subRel);
          fs.mkdirSync(`${OUT}/wp-content/uploads/${dir}`, { recursive: true });
          const dest = `${OUT}/wp-content/uploads/${subRel}`;
          if (!fs.existsSync(dest)) fs.writeFileSync(dest, body);
          imgMap.set(url, `/clones/${SLUG}/wp-content/uploads/${subRel}`);
          imgMap.set(url.split('?')[0], `/clones/${SLUG}/wp-content/uploads/${subRel}`);
        } else if (isGF) {
          const dest = `${OUT}/fonts/${fname}`;
          if (!fs.existsSync(dest)) fs.writeFileSync(dest, body);
          cssMap.set(url, `/clones/${SLUG}/fonts/${fname}`);
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

  // Dismiss cookie consent
  try { await page.click('#CybotCookiebotDialogBodyButtonAccept, .cb-enable', { timeout: 2000 }); await page.waitForTimeout(500); } catch {}

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
  for (const [orig, local] of [...cssMap, ...jsMap, ...imgMap]) {
    html = html.replaceAll(orig, local);
  }
  html = html.replaceAll(ORIGIN, '');
  html = html.replaceAll('https://escapemassage.cz', '');

  // Strip tracking + Cookiebot
  html = html.replace(/<script[^>]*(?:cookiebot|Cookiebot|googletagmanager|gtag|hotjar|facebook\.net|poptag|activecampaign)[^>]*>[\s\S]*?<\/script>/gi, '');
  html = html.replace(/<script[^>]*(?:cookiebot|googletagmanager|gtag|hotjar)[^>]*><\/script>/gi, '');
  html = html.replace(/<noscript>[^<]*googletagmanager[^<]*<\/noscript>/gi, '');

  // Internal links
  const linkMap = {
    '/masaze/': '/demo/escape-demo/masaze',
    '/cenik-masazi/': '/demo/escape-demo/cenik',
    '/darkove-poukazy-na-masaz/': '/demo/escape-demo/voucher',
  };
  for (const [from, to] of Object.entries(linkMap)) {
    html = html.replace(new RegExp(`href="${from.replace(/\//g, '\\/')}"`, 'g'), `href="${to}"`);
  }
  html = html.replace(/href="\/(?!clones|demo|_next)[^"]*"/g, 'href="#"');

  return html;
}

console.log('\n--- Processing HTML ---');
for (const p of PAGES) {
  const raw = fs.readFileSync(`${OUT}/pages/${p.slug}-raw.html`, 'utf8');
  const processed = processHtml(raw);
  fs.writeFileSync(`${OUT}/pages/${p.slug}.html`, processed);
  const extLeft = (processed.match(/https?:\/\/(?:www\.)?escapemassage\.cz/gi) || []).length;
  console.log(`${p.slug}: ${raw.length} → ${processed.length} | escape refs: ${extLeft}`);
}

// Fix CSS url() refs
for (const dir of [`${OUT}/css`]) {
  if (!fs.existsSync(dir)) continue;
  for (const fname of fs.readdirSync(dir)) {
    let css = fs.readFileSync(`${dir}/${fname}`, 'utf8');
    for (const [orig, local] of [...cssMap, ...imgMap]) css = css.replaceAll(orig, local);
    css = css.replace(/url\((['"]?)https?:\/\/(?:www\.)?escapemassage\.cz([^'")]+)\1\)/gi,
      (_, q, rel2) => `url(${q}/clones/${SLUG}${rel2.split('?')[0]}${q})`);
    fs.writeFileSync(`${dir}/${fname}`, css);
  }
}

// Also fix the WPO minify CSS
const wpoDir = `${OUT}/wp-content/cache/wpo-minify`;
if (fs.existsSync(wpoDir)) {
  function fixCssDir(dir) {
    for (const item of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = `${dir}/${item.name}`;
      if (item.isDirectory()) fixCssDir(full);
      else if (item.name.endsWith('.css')) {
        let css = fs.readFileSync(full, 'utf8');
        for (const [orig, local] of [...cssMap, ...imgMap]) css = css.replaceAll(orig, local);
        css = css.replace(/url\((['"]?)https?:\/\/(?:www\.)?escapemassage\.cz([^'")]+)\1\)/gi,
          (_, q, rel2) => `url(${q}/clones/${SLUG}${rel2.split('?')[0]}${q})`);
        // Fix Google Fonts url() in CSS
        for (const [gfUrl, local] of cssMap) {
          if (gfUrl.includes('fonts.gstatic.com')) css = css.replaceAll(gfUrl, local);
        }
        fs.writeFileSync(full, css);
      }
    }
  }
  fixCssDir(wpoDir);
}

console.log('\nMirror done ✅');
const imgCount = fs.readdirSync(`${OUT}/img`).length;
const uploadsCount = fs.existsSync(`${OUT}/wp-content/uploads`) ?
  fs.readdirSync(`${OUT}/wp-content/uploads`, {recursive:true}).filter(f=>typeof f==='string'&&f.match(/\.(jpg|png|webp|svg)$/i)).length : 0;
console.log(`css:${fs.readdirSync(OUT+'/css').length} | js:${fs.readdirSync(OUT+'/js').length} | img:${imgCount}+${uploadsCount}uploads | fonts:${fs.readdirSync(OUT+'/fonts').length}`);
