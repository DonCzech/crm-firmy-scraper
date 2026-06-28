/**
 * Mirror bomtonclinic.cz — Wix Thunderbolt SPA
 */
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright-core';

const SLUG = 'bomton';
const ORIGIN = 'https://www.bomtonclinic.cz';
const OUT = `public/clones/${SLUG}`;
const PAGES = [
  { slug: 'home',     url: '/' },
  { slug: 'o-klinice', url: '/o-klinice' },
];

for (const d of ['pages', 'img', 'css', 'fonts', 'js']) fs.mkdirSync(`${OUT}/${d}`, { recursive: true });

const cssMap = new Map();
const jsMap  = new Map();
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
    
    // Wix assets come from static.wixstatic.com or frog.wix.com
    const isWixAsset = url.includes('wixstatic.com') || url.includes('frog.wix.com') || url.includes('wix-static.net');
    const isOrigin = url.startsWith(ORIGIN);
    if (!isWixAsset && !isOrigin) return;
    
    try {
      const body = await resp.body();
      if (body.length < 10) return;
      
      if (ct.includes('image') || rel.match(/\.(jpg|jpeg|png|webp|svg|gif|ico)$/i)) {
        const safeBase = fname.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 80);
        const dest = `${OUT}/img/${safeBase}`;
        if (!fs.existsSync(dest)) fs.writeFileSync(dest, body);
        imgMap.set(url, `/clones/${SLUG}/img/${safeBase}`);
        imgMap.set(rel, `/clones/${SLUG}/img/${safeBase}`);
      } else if (ct.includes('css') || rel.endsWith('.css')) {
        const dest = `${OUT}/css/${fname}`;
        if (!fs.existsSync(dest)) fs.writeFileSync(dest, body);
        cssMap.set(url, `/clones/${SLUG}/css/${fname}`);
      } else if (ct.includes('font') || ct.includes('woff') || rel.match(/\.(woff2?|ttf|otf)$/i)) {
        const dest = `${OUT}/fonts/${fname}`;
        if (!fs.existsSync(dest)) fs.writeFileSync(dest, body);
        fontMap.set(url, `/clones/${SLUG}/fonts/${fname}`);
      }
    } catch {}
  });

  await page.goto(`${ORIGIN}${p.url}`, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(8000); // Wix needs extra time for JS render

  const html = await page.content();
  fs.writeFileSync(`${OUT}/pages/${p.slug}-raw.html`, html);
  console.log(`  ${p.slug}: ${html.length} bytes | css:${cssMap.size} img:${imgMap.size} fonts:${fontMap.size}`);
  await page.close();
  await context.close();
}

await browser.close();
console.log(`\nTotal: css=${cssMap.size} img=${imgMap.size} fonts=${fontMap.size}`);

function processHtml(html) {
  // Rewrite all wixstatic.com URLs to local
  for (const [orig, local] of imgMap) {
    html = html.replaceAll(orig, local);
  }
  for (const [orig, local] of cssMap) {
    html = html.replaceAll(orig, local);
  }
  for (const [orig, local] of fontMap) {
    html = html.replaceAll(orig, local);
  }
  html = html.replaceAll(ORIGIN, '');
  html = html.replaceAll('https://www.bomtonclinic.cz', '');
  return html;
}

console.log('\n--- Processing HTML ---');
for (const p of PAGES) {
  const raw = fs.readFileSync(`${OUT}/pages/${p.slug}-raw.html`, 'utf8');
  const processed = processHtml(raw);
  fs.writeFileSync(`${OUT}/pages/${p.slug}.html`, processed);
  const bomtonLeft = (processed.match(/bomtonclinic\.cz/gi) || []).length;
  const wixLeft = (processed.match(/wixstatic\.com/gi) || []).length;
  console.log(`${p.slug}: ${raw.length}→${processed.length} | bomton=${bomtonLeft} wix=${wixLeft}`);
}

console.log('\nMirror done ✅');
