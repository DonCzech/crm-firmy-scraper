// scripts/mirror-selfbeauty-assets.mjs
// WIX clone: rendered HTML + images + CSS
import fs from 'node:fs';
import path from 'node:path';
import https from 'node:https';
import http from 'node:http';
import { chromium } from 'playwright-core';

const SLUG = 'selfbeauty';
const ORIGIN = 'https://www.selfbeautystudio.com';
const OUT = `public/clones/${SLUG}`;

const PAGES = [
  { slug: 'home', url: '/' },
  { slug: 'cenik-barber', url: '/cenik-barber-shop' },
  { slug: 'cenik-manikura', url: '/cenik-manikura-a-pedikura' },
  { slug: 'cenik-kosmetika', url: '/cenik-kosmetika' },
  { slug: 'darkovy-poukaz', url: '/darkovy-poukaz' },
];

for (const d of ['pages', 'img', 'css', 'fonts', 'js']) {
  fs.mkdirSync(`${OUT}/${d}`, { recursive: true });
}

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    if (fs.existsSync(dest)) return resolve();
    const file = fs.createWriteStream(dest);
    const lib = url.startsWith('https') ? https : http;
    const req = lib.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        'Accept': '*/*',
        'Referer': ORIGIN,
      },
      timeout: 20000,
    }, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        file.close();
        fs.unlinkSync(dest);
        return downloadFile(res.headers.location, dest).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        file.close();
        fs.existsSync(dest) && fs.unlinkSync(dest);
        return reject(new Error(`HTTP ${res.statusCode} for ${url}`));
      }
      res.pipe(file);
      file.on('finish', () => { file.close(); resolve(); });
    });
    req.on('error', (e) => { file.close(); fs.existsSync(dest) && fs.unlinkSync(dest); reject(e); });
    req.on('timeout', () => { req.destroy(); reject(new Error('timeout')); });
  });
}

// Extract base image ID from wixstatic URL
function wixImgLocalName(url) {
  // https://static.wixstatic.com/media/HASH~mv2.jpg/v1/fill/...
  // or https://static.wixstatic.com/media/HASH~mv2.jpg
  const mediaMatch = url.match(/\/media\/([^/|?]+)/);
  if (!mediaMatch) return null;
  const filename = mediaMatch[1].replace(/[~%|]/g, '_').replace(/\|/g, '_');
  return filename;
}

// Build a download URL for wixstatic image (reasonably sized)
function wixImgDownloadUrl(url) {
  const mediaMatch = url.match(/\/media\/([^/|?%]+(?:~|%7E)mv2\.[a-zA-Z]+)/);
  if (mediaMatch) {
    const id = mediaMatch[1].replace(/%7E/gi, '~');
    // Download at 1200px wide, original quality
    return `https://static.wixstatic.com/media/${id}/v1/fill/w_1200,al_c,q_85/${id}`;
  }
  return url.split('?')[0];
}

// Extract CSS filename from parastorage URL
function cssLocalName(url) {
  const parts = url.split('/');
  const filename = parts[parts.length - 1].split('?')[0];
  return filename || `style_${Date.now()}.css`;
}

const browser = await chromium.launch({
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  args: ['--no-sandbox'],
});

const allImages = new Map(); // wixstatic_url -> local_filename
const allCss = new Map(); // parastorage_url -> local_filename

for (const p of PAGES) {
  console.log(`\n--- Scraping: ${p.slug} ---`);
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    locale: 'cs-CZ',
  });
  const page = await context.newPage();

  // Intercept CSS from parastorage
  page.on('response', async (resp) => {
    const url = resp.url();
    const ct = resp.headers()['content-type'] || '';
    if (url.includes('parastorage.com') && ct.includes('css')) {
      const localName = cssLocalName(url);
      if (!allCss.has(url)) {
        allCss.set(url, localName);
        const dest = `${OUT}/css/${localName}`;
        if (!fs.existsSync(dest)) {
          try {
            const body = await resp.body();
            fs.writeFileSync(dest, body);
          } catch {}
        }
      }
    }
  });

  await page.goto(`${ORIGIN}${p.url}`, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(4000);

  // Dismiss cookie consent if visible
  try {
    await page.click('[data-testid="uc-accept-all-button"], button:has-text("Přijmout vše")', { timeout: 2000 });
    await page.waitForTimeout(1000);
  } catch {}

  const html = await page.content();

  // Collect all wixstatic image URLs
  const imgUrls = [...new Set(html.match(/https:\/\/static\.wixstatic\.com\/media\/[^"' )\n]+/g) || [])];
  for (const url of imgUrls) {
    const localName = wixImgLocalName(url);
    if (localName) allImages.set(url, localName);
  }

  // Also collect SVG/shape URLs from wixstatic
  const svgUrls = [...new Set(html.match(/https:\/\/static\.wixstatic\.com\/shapes\/[^"' )\n]+/g) || [])];
  for (const url of svgUrls) {
    const localName = `shape_${url.split('/').pop().split('?')[0]}`;
    allImages.set(url, localName);
  }

  await page.close();
  await context.close();

  // Store raw rendered HTML
  fs.writeFileSync(`${OUT}/pages/${p.slug}-raw.html`, html);
  console.log(`  Saved raw HTML: ${html.length} bytes, images collected: ${imgUrls.length}`);
}

await browser.close();
console.log(`\nTotal unique images: ${allImages.size}`);
console.log(`Total unique CSS files: ${allCss.size}`);

// Download images
console.log('\n--- Downloading images ---');
let imgOk = 0, imgFail = 0;
const imageEntries = [...allImages.entries()];
for (let i = 0; i < imageEntries.length; i++) {
  const [url, localName] = imageEntries[i];
  const dest = `${OUT}/img/${localName}`;
  if (fs.existsSync(dest) && fs.statSync(dest).size > 100) { imgOk++; continue; }
  const downloadUrl = wixImgDownloadUrl(url);
  try {
    await downloadFile(downloadUrl, dest);
    imgOk++;
    if (i % 10 === 0) process.stdout.write(`  ${i+1}/${imageEntries.length} `);
  } catch (e) {
    // Try original URL as fallback
    try {
      await downloadFile(url.split('?')[0], dest);
      imgOk++;
    } catch {
      imgFail++;
      console.log(`  FAIL: ${localName} — ${e.message}`);
    }
  }
}
console.log(`\nImages: ${imgOk} OK, ${imgFail} FAIL`);

// Now process each page HTML
console.log('\n--- Processing HTML ---');

// Build URL rewrite maps
function rewriteHtml(html, pageSlug) {
  // 1. Rewrite wixstatic image URLs → local
  for (const [url, localName] of allImages) {
    // Replace full URL including transformation params
    const escaped = url.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    html = html.replace(new RegExp(escaped, 'g'), `/clones/${SLUG}/img/${localName}`);
  }

  // 2. Rewrite remaining wixstatic media URLs by pattern
  html = html.replace(
    /https:\/\/static\.wixstatic\.com\/media\/([^"' )\n\/]+)(?:~mv2|%7Emv2|~|%7E)([^"' )\n]*)/g,
    (match, hash) => {
      const localName = `${hash}.jpg`;
      return `/clones/${SLUG}/img/${localName}`;
    }
  );

  // 3. Strip Wix JS scripts (they need Wix servers)
  html = html.replace(/<script[^>]*(?:wix-thunderbolt|clientWorker|tag-manager|usercentrics|sentry-cdn|hotjar|gtag|googletagmanager|facebook\.net|analytics)[^>]*>[\s\S]*?<\/script>/gi, '');
  html = html.replace(/<script[^>]*(?:parastorage\.com\/services\/wix|parastorage\.com\/services\/tag)[^>]*><\/script>/gi, '');

  // 4. Strip Usercentrics / cookie consent
  html = html.replace(/<script[^>]*usercentrics[^>]*>[\s\S]*?<\/script>/gi, '');
  html = html.replace(/<link[^>]*usercentrics[^>]*>/gi, '');

  // 5. Strip Wix chat widget, bookings scripts
  html = html.replace(/<script[^>]*(?:wix-chat|chat-backend|wixapps|wix-booking)[^>]*>[\s\S]*?<\/script>/gi, '');

  // 6. Rewrite internal page links to our demo routes
  const linkMap = {
    'selfbeautystudio.com/cenik-barber-shop': '/demo/selfbeauty-demo/cenik-barber',
    'selfbeautystudio.com/cenik-manikura-a-pedikura': '/demo/selfbeauty-demo/cenik-manikura',
    'selfbeautystudio.com/cenik-kosmetika': '/demo/selfbeauty-demo/cenik-kosmetika',
    'selfbeautystudio.com/darkovy-poukaz': '/demo/selfbeauty-demo/darkovy-poukaz',
    'selfbeautystudio.com/rezervace': '#rezervace',
    'selfbeautystudio.com/blog': '#',
    'selfbeautystudio.com/domů': '/demo/selfbeauty-demo',
    'selfbeautystudio.com/dom%C5%AF': '/demo/selfbeauty-demo',
    'selfbeautystudio.com': '/demo/selfbeauty-demo',
  };
  for (const [from, to] of Object.entries(linkMap)) {
    html = html.replace(new RegExp(`https?://(?:www\\.)?${from.replace(/\./g, '\\.')}/?(?=[\"' >])`, 'g'), to);
  }

  // 7. Strip language switcher (Czech flag selector causing issues)
  html = html.replace(/<[^>]*data-testid="languageSwitcher"[^>]*>[\s\S]*?<\/[^>]+>/g, '');

  return html;
}

for (const p of PAGES) {
  const rawHtml = fs.readFileSync(`${OUT}/pages/${p.slug}-raw.html`, 'utf8');
  const processedHtml = rewriteHtml(rawHtml, p.slug);
  fs.writeFileSync(`${OUT}/pages/${p.slug}.html`, processedHtml);
  console.log(`  ${p.slug}: ${rawHtml.length} → ${processedHtml.length} bytes`);
}

// Verify: check for remaining wixstatic/parastorage media refs
console.log('\n--- External URL check ---');
let extCount = 0;
for (const p of PAGES) {
  const html = fs.readFileSync(`${OUT}/pages/${p.slug}.html`, 'utf8');
  const ext = html.match(/https?:\/\/static\.(wixstatic|parastorage)\.com\/media\/[^"' )]+/g) || [];
  if (ext.length > 0) {
    console.log(`  ${p.slug}: ${ext.length} remaining wixstatic media refs`);
    extCount += ext.length;
  }
}
if (extCount === 0) console.log('  0 remaining wixstatic media refs ✅');

console.log('\nMirror complete ✅');
console.log(`Assets: ${OUT}/`);
