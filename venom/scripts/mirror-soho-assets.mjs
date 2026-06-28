/**
 * Mirror sohosalon.cz — WordPress/Divi
 */
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright-core';

const SLUG = 'soho';
const ORIGIN = 'https://sohosalon.cz';
const OUT = `public/clones/${SLUG}`;
const PAGES = [
  { slug: 'home',       url: '/' },
  { slug: 'price-list', url: '/price-list/' },
  { slug: 'about-us',   url: '/about-us' },
];

for (const d of ['pages', 'img', 'css', 'fonts', 'js']) fs.mkdirSync(`${OUT}/${d}`, { recursive: true });
fs.mkdirSync(`${OUT}/wp-content/et-cache`, { recursive: true });
fs.mkdirSync(`${OUT}/wp-content/uploads`, { recursive: true });

const cssMap = new Map();
const imgMap = new Map();
const fontMap = new Map();

const browser = await chromium.launch({
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  args: ['--no-sandbox'],
});

for (const p of PAGES) {
  console.log(`\n=== ${p.slug} ===`);
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    locale: 'cs-CZ',
    viewport: { width: 1280, height: 900 },
  });
  const page = await context.newPage();

  page.on('response', async (resp) => {
    const url = resp.url();
    const ct = resp.headers()['content-type'] || '';
    const rel = url.split('?')[0];
    const fname = path.basename(rel).split('?')[0];
    if (!fname || fname.length < 2) return;

    const isOrigin = url.startsWith(ORIGIN);
    if (!isOrigin) return;

    try {
      const body = await resp.body();
      if (body.length < 10) return;

      if (ct.includes('image') || rel.match(/\.(jpg|jpeg|png|webp|svg|gif|ico)$/i)) {
        const relPath = rel.replace(ORIGIN, '');
        const dest = `${OUT}${relPath}`;
        fs.mkdirSync(path.dirname(dest), { recursive: true });
        if (!fs.existsSync(dest)) fs.writeFileSync(dest, body);
        imgMap.set(url, `/clones/${SLUG}${relPath}`);
        imgMap.set(rel, `/clones/${SLUG}${relPath}`);
        const flat = `${OUT}/img/${fname.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 80)}`;
        if (!fs.existsSync(flat)) fs.writeFileSync(flat, body);
      } else if (ct.includes('css') || rel.endsWith('.css')) {
        if (rel.includes('/wp-content/et-cache/')) {
          const subRel = rel.replace(/.*\/wp-content\/et-cache\//, '');
          const dir = path.dirname(subRel);
          fs.mkdirSync(`${OUT}/wp-content/et-cache/${dir}`, { recursive: true });
          const dest = `${OUT}/wp-content/et-cache/${subRel}`;
          if (!fs.existsSync(dest)) fs.writeFileSync(dest, body);
          cssMap.set(url, `/clones/${SLUG}/wp-content/et-cache/${subRel}`);
        } else {
          const relPath = rel.replace(ORIGIN, '');
          const dest = `${OUT}${relPath}`;
          fs.mkdirSync(path.dirname(dest), { recursive: true });
          if (!fs.existsSync(dest)) fs.writeFileSync(dest, body);
          cssMap.set(url, `/clones/${SLUG}${relPath}`);
          const dest2 = `${OUT}/css/${fname}`;
          if (!fs.existsSync(dest2)) fs.writeFileSync(dest2, body);
        }
      } else if (ct.includes('font') || ct.includes('woff') || rel.match(/\.(woff2?|ttf|otf)$/i)) {
        const relPath = rel.replace(ORIGIN, '');
        const dest = `${OUT}${relPath}`;
        fs.mkdirSync(path.dirname(dest), { recursive: true });
        if (!fs.existsSync(dest)) fs.writeFileSync(dest, body);
        fontMap.set(url, `/clones/${SLUG}${relPath}`);
        const dest2 = `${OUT}/fonts/${fname}`;
        if (!fs.existsSync(dest2)) fs.writeFileSync(dest2, body);
      }
    } catch {}
  });

  await page.goto(`${ORIGIN}${p.url}`, { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(3000);

  const html = await page.content();
  fs.writeFileSync(`${OUT}/pages/${p.slug}-raw.html`, html);
  console.log(`  ${p.slug}: ${html.length} bytes | css:${cssMap.size} img:${imgMap.size} fonts:${fontMap.size}`);
  await page.close();
  await context.close();
}

await browser.close();
console.log(`\nTotal: css=${cssMap.size} img=${imgMap.size} fonts=${fontMap.size}`);

function processHtml(html) {
  for (const [orig, local] of imgMap) html = html.replaceAll(orig, local);
  for (const [orig, local] of cssMap) html = html.replaceAll(orig, local);
  for (const [orig, local] of fontMap) html = html.replaceAll(orig, local);
  html = html.replaceAll(ORIGIN, '');
  html = html.replaceAll('https://sohosalon.cz', '');
  html = html.replaceAll('//sohosalon.cz', '');
  return html;
}

console.log('\n--- Processing HTML ---');
for (const p of PAGES) {
  const raw = fs.readFileSync(`${OUT}/pages/${p.slug}-raw.html`, 'utf8');
  const processed = processHtml(raw);
  fs.writeFileSync(`${OUT}/pages/${p.slug}.html`, processed);
  const brandLeft = (processed.match(/sohosalon\.cz/gi) || []).length;
  console.log(`${p.slug}: ${raw.length}→${processed.length} | soho=${brandLeft}`);
}
console.log('\nMirror done ✅');
