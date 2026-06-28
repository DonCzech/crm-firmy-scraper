/**
 * Mirror honzakamenar.cz (Wix Thunderbolt SPA)
 * Download: wixstatic.com media assets, CSS
 */
import pkg from '/Users/apple/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core/index.js';
const { chromium } = pkg;
import fs from 'node:fs';
import path from 'node:path';
import https from 'node:https';
import http from 'node:http';

const CLONE_DIR = '/Users/apple/DEV/CRM/venom/public/clones/honzakamenar';
const PAGES = [
  { slug: 'home',             url: 'https://www.honzakamenar.cz' },
  { slug: 'o-mne',            url: 'https://www.honzakamenar.cz/o-mne' },
  { slug: 'nabidka',          url: 'https://www.honzakamenar.cz/nabidka' },
  { slug: 'reference',        url: 'https://www.honzakamenar.cz/reference' },
  { slug: 'napiste-mi',       url: 'https://www.honzakamenar.cz/napiste-mi' },
];

function sanitizePath(urlStr) {
  try {
    const u = new URL(urlStr);
    // wixstatic.com/media/ID~mv2.jpg/v1/fill/.../filename.jpg  → media/ID~mv2/filename.jpg
    if (u.hostname.includes('wixstatic.com')) {
      const parts = u.pathname.split('/');
      // find media segment
      const mediaIdx = parts.indexOf('media');
      if (mediaIdx >= 0) {
        const mediaId = parts[mediaIdx + 1] || 'unknown';
        // get filename from last segment
        const last = parts[parts.length - 1];
        const clean = mediaId.replace(/[%~]/g, '_') + '_' + last.replace(/[?#]/g, '_');
        return path.join(CLONE_DIR, 'media', clean);
      }
    }
    // parastorage or other CDN
    let p2 = u.pathname.replace(/^\//, '').replace(/[?#]/g, '').replace(/\.\.\//g, '');
    p2 = p2.substring(0, 200);
    return path.join(CLONE_DIR, 'cdn', p2);
  } catch { return null; }
}

function download(url, dest) {
  return new Promise((resolve) => {
    if (fs.existsSync(dest)) { resolve(true); return; }
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    const client = url.startsWith('https') ? https : http;
    const tmp = dest + '.tmp';
    const file = fs.createWriteStream(tmp);
    const req = client.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' }, timeout: 15000 }, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        file.close(); fs.unlinkSync(tmp);
        download(res.headers.location, dest).then(resolve);
        return;
      }
      if (res.statusCode !== 200) { file.close(); fs.unlinkSync(tmp); resolve(false); return; }
      res.pipe(file);
      file.on('finish', () => { file.close(); fs.renameSync(tmp, dest); resolve(true); });
    });
    req.on('error', () => { file.close(); try { fs.unlinkSync(tmp); } catch {} resolve(false); });
    req.on('timeout', () => { req.destroy(); resolve(false); });
  });
}

const browser = await chromium.launch({ headless: true });
const assets = new Map(); // url → localPath

for (const page of PAGES) {
  console.log(`\n=== ${page.slug} ===`);
  const ctx = await browser.newContext({
    viewport: { width: 1280, height: 900 },
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
  });
  const p = await ctx.newPage();

  // Intercept all network requests to collect asset URLs
  p.on('response', async (res) => {
    const url = res.url();
    const ct = res.headers()['content-type'] || '';
    if (
      (url.includes('wixstatic.com/media') && (ct.includes('image') || ct.includes('video') || url.match(/\.(jpg|jpeg|png|gif|webp|svg|avif|mp4|webm)/i))) ||
      (url.includes('wixstatic.com') && ct.includes('css'))
    ) {
      const dest = sanitizePath(url);
      if (dest && !assets.has(url)) {
        assets.set(url, dest);
      }
    }
  });

  await p.goto(page.url, { waitUntil: 'domcontentloaded', timeout: 30000 }).catch(e => console.log('nav err:', e.message));
  await p.waitForTimeout(5000);

  // Scroll to trigger lazy images
  await p.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 400) {
      window.scrollTo(0, y);
      await new Promise(r => setTimeout(r, 150));
    }
    window.scrollTo(0, 0);
  });
  await p.waitForTimeout(2000);

  // Save rendered HTML
  const html = await p.content();
  const htmlPath = path.join(CLONE_DIR, 'pages', `${page.slug}.html`);
  fs.mkdirSync(path.dirname(htmlPath), { recursive: true });
  fs.writeFileSync(htmlPath, html);
  console.log(`Saved HTML (${html.length} bytes)`);

  await ctx.close();
}

await browser.close();

// Download all collected assets
console.log(`\nDownloading ${assets.size} assets...`);
let ok = 0, fail = 0;
for (const [url, dest] of assets) {
  const r = await download(url, dest);
  if (r) ok++; else fail++;
  if ((ok + fail) % 20 === 0) process.stdout.write(`  ${ok}/${assets.size}\r`);
}
console.log(`\nDone: ${ok} ok, ${fail} failed`);
