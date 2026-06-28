/**
 * Mirror antoninovopekarstvi.cz → antoninpekarstvi
 * 5 pages: home, nase-pecivo, nabidka, o-nas, kontakt
 */
import pkg from '/Users/apple/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core/index.js';
const { chromium } = pkg;
import fs from 'node:fs';
import path from 'node:path';
import https from 'node:https';
import http from 'node:http';

const SLUG   = 'antoninpekarstvi';
const ORIGIN = 'https://www.antoninovopekarstvi.cz';
const ROOT   = '/Users/apple/DEV/CRM/venom';
const OUT    = `${ROOT}/public/clones/${SLUG}`;

const PAGES = [
  { key: 'home',        url: `${ORIGIN}/`,                                        title: 'Domů' },
  { key: 'nase-pecivo', url: `${ORIGIN}/nase-pecivo/`,                            title: 'Naše pečivo' },
  { key: 'nabidka',     url: `${ORIGIN}/aktualni-nabidka-pekarstvi/`,             title: 'Aktuální nabídka' },
  { key: 'o-nas',       url: `${ORIGIN}/o-antoninove-pekarstvi/`,                 title: 'O nás' },
  { key: 'kontakt',     url: `${ORIGIN}/kudy-k-nam/`,                             title: 'Kontakt' },
];

// Create dirs including wp-content structure
const dirs = [
  'pages',
  'img',
  'fonts',
  'wp-content/plugins/revslider/public/assets/css',
  'wp-content/themes/marco/assets/css',
  'wp-content/plugins/js_composer/assets/css',
  'wp-content/themes/marco-child',
  'wp-content/plugins/js_composer/assets/lib/bower/animate-css',
  'wp-content/plugins/jquery-manager/assets/js',
  'wp-content/themes/marco/assets/js',
  'wp-content/uploads',
];
for (const d of dirs) fs.mkdirSync(`${OUT}/${d}`, { recursive: true });

function dlUrl(url) {
  return new Promise((res, rej) => {
    const mod = url.startsWith('https') ? https : http;
    const req = mod.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'cs-CZ,cs;q=0.9',
      }
    }, (r) => {
      if (r.statusCode >= 300 && r.statusCode < 400 && r.headers.location) {
        return dlUrl(r.headers.location).then(res).catch(rej);
      }
      const c = []; r.on('data', d => c.push(d)); r.on('end', () => res(Buffer.concat(c)));
    });
    req.on('error', rej);
    req.setTimeout(30000, () => { req.destroy(); rej(new Error('timeout ' + url)); });
  });
}

// Maps for collecting assets
const cssMap = new Map();
const jsMap  = new Map();
const imgMap = new Map();
const fontMap = new Map();

// Download and save asset by original URL path
async function downloadAsset(url) {
  if (!url || !url.startsWith('http')) return null;
  const urlNoQ = url.split('?')[0];

  try {
    const body = await dlUrl(url);
    if (!body || body.length < 4) return null;

    // Determine local path based on URL structure
    let localPath = null;

    if (url.includes('wp-content/')) {
      // Preserve wp-content path structure
      const wpMatch = urlNoQ.match(/wp-content\/(.+)$/);
      if (wpMatch) {
        const relPath = wpMatch[1];
        const destDir = `${OUT}/wp-content/${path.dirname(relPath)}`;
        fs.mkdirSync(destDir, { recursive: true });
        const dest = `${OUT}/wp-content/${relPath}`;
        if (!fs.existsSync(dest)) fs.writeFileSync(dest, body);
        localPath = `/clones/${SLUG}/wp-content/${relPath}`;
      }
    } else if (urlNoQ.match(/\.(jpg|jpeg|png|webp|svg|gif|ico)$/i)) {
      const fname = path.basename(urlNoQ);
      const dest = `${OUT}/img/${fname}`;
      if (!fs.existsSync(dest)) fs.writeFileSync(dest, body);
      localPath = `/clones/${SLUG}/img/${fname}`;
    } else if (urlNoQ.match(/\.(woff2?|ttf|otf|eot)$/i)) {
      const fname = path.basename(urlNoQ);
      const dest = `${OUT}/fonts/${fname}`;
      if (!fs.existsSync(dest)) fs.writeFileSync(dest, body);
      localPath = `/clones/${SLUG}/fonts/${fname}`;
    }

    return { localPath, body };
  } catch (e) {
    // silently ignore asset download failures
    return null;
  }
}

const browser = await chromium.launch({
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  args: ['--no-sandbox', '--ignore-certificate-errors'],
  headless: true,
});

const context = await browser.newContext({
  userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  locale: 'cs-CZ',
  extraHTTPHeaders: { 'Accept-Language': 'cs-CZ,cs;q=0.9' },
  ignoreHTTPSErrors: true,
});

await context.route('**/*', async (route) => {
  const url = route.request().url();
  // Block analytics, tracking
  if (url.includes('googletagmanager') || url.includes('google-analytics') ||
      url.includes('facebook.net') || url.includes('doubleclick') ||
      url.includes('tawk.to') || url.includes('hotjar') ||
      url.includes('recaptcha') || url.includes('cookiebot') ||
      url.includes('googlesyndication') || url.includes('instagram.com/') ||
      url.includes('graph.facebook.com')) {
    return route.abort();
  }
  route.continue();
});

context.on('response', async (resp) => {
  const url  = resp.url();
  const ct   = resp.headers()['content-type'] || '';
  const urlNoQ = url.split('?')[0];
  const fname  = path.basename(urlNoQ);
  if (!fname || fname.length < 3) return;
  if (!url.includes('antoninovopekarstvi.cz') && !url.includes('wp-content') && !url.includes('wp-includes')) return;

  try {
    const body = await resp.body();
    if (!body || body.length < 4) return;

    if (ct.includes('css') || urlNoQ.endsWith('.css')) {
      const wpMatch = urlNoQ.match(/wp-content\/(.+)$/);
      if (wpMatch) {
        const relPath = wpMatch[1];
        const destDir = `${OUT}/wp-content/${path.dirname(relPath)}`;
        fs.mkdirSync(destDir, { recursive: true });
        const dest = `${OUT}/wp-content/${relPath}`;
        if (!fs.existsSync(dest)) fs.writeFileSync(dest, body);
        const localPath = `/clones/${SLUG}/wp-content/${relPath}`;
        cssMap.set(url, localPath);
        cssMap.set(urlNoQ, localPath);
      }
    } else if ((ct.includes('javascript') || urlNoQ.endsWith('.js')) &&
               (url.includes('antoninovopekarstvi') || url.includes('wp-content') || url.includes('wp-includes'))) {
      const wpMatch = urlNoQ.match(/wp-content\/(.+)$/);
      if (wpMatch) {
        const relPath = wpMatch[1];
        const destDir = `${OUT}/wp-content/${path.dirname(relPath)}`;
        fs.mkdirSync(destDir, { recursive: true });
        const dest = `${OUT}/wp-content/${relPath}`;
        if (!fs.existsSync(dest)) fs.writeFileSync(dest, body);
        const localPath = `/clones/${SLUG}/wp-content/${relPath}`;
        jsMap.set(url, localPath);
        jsMap.set(urlNoQ, localPath);
      } else {
        const dest = `${OUT}/wp-content/themes/marco/assets/js/${fname}`;
        if (!fs.existsSync(dest)) fs.writeFileSync(dest, body);
      }
    } else if (ct.includes('image') || urlNoQ.match(/\.(jpg|jpeg|png|webp|svg|gif|ico)$/i)) {
      if (body.length > 200) {
        const wpMatch = urlNoQ.match(/wp-content\/(.+)$/);
        if (wpMatch) {
          const relPath = wpMatch[1];
          const destDir = `${OUT}/wp-content/${path.dirname(relPath)}`;
          fs.mkdirSync(destDir, { recursive: true });
          const dest = `${OUT}/wp-content/${relPath}`;
          if (!fs.existsSync(dest)) fs.writeFileSync(dest, body);
          const localPath = `/clones/${SLUG}/wp-content/${relPath}`;
          imgMap.set(url, localPath);
          imgMap.set(urlNoQ, localPath);
        } else {
          const dest = `${OUT}/img/${fname}`;
          if (!fs.existsSync(dest)) fs.writeFileSync(dest, body);
          const localPath = `/clones/${SLUG}/img/${fname}`;
          imgMap.set(url, localPath);
          imgMap.set(urlNoQ, localPath);
        }
      }
    } else if (ct.includes('woff') || urlNoQ.match(/\.(woff2?|ttf|otf|eot)$/i)) {
      const wpMatch = urlNoQ.match(/wp-content\/(.+)$/);
      if (wpMatch) {
        const relPath = wpMatch[1];
        const destDir = `${OUT}/wp-content/${path.dirname(relPath)}`;
        fs.mkdirSync(destDir, { recursive: true });
        const dest = `${OUT}/wp-content/${relPath}`;
        if (!fs.existsSync(dest)) fs.writeFileSync(dest, body);
      } else {
        const dest = `${OUT}/fonts/${fname}`;
        if (!fs.existsSync(dest)) fs.writeFileSync(dest, body);
      }
    }
  } catch { /* ignore */ }
});

async function capturePage(pageInfo) {
  const pw = await browser.newPage();

  pw.on('response', async (resp) => {
    const url  = resp.url();
    const ct   = resp.headers()['content-type'] || '';
    const urlNoQ = url.split('?')[0];
    const fname  = path.basename(urlNoQ);
    if (!fname || fname.length < 3) return;
    if (!url.includes('antoninovopekarstvi.cz') && !url.includes('wp-content') && !url.includes('wp-includes')) return;

    try {
      const body = await resp.body();
      if (!body || body.length < 4) return;

      if (ct.includes('css') || urlNoQ.endsWith('.css')) {
        const wpMatch = urlNoQ.match(/wp-content\/(.+)$/);
        if (wpMatch) {
          const relPath = wpMatch[1];
          const destDir = `${OUT}/wp-content/${path.dirname(relPath)}`;
          fs.mkdirSync(destDir, { recursive: true });
          const dest = `${OUT}/wp-content/${relPath}`;
          if (!fs.existsSync(dest)) fs.writeFileSync(dest, body);
          const localPath = `/clones/${SLUG}/wp-content/${relPath}`;
          cssMap.set(url, localPath);
          cssMap.set(urlNoQ, localPath);
        }
      } else if ((ct.includes('image') || urlNoQ.match(/\.(jpg|jpeg|png|webp|svg|gif|ico)$/i)) && body.length > 200) {
        const wpMatch = urlNoQ.match(/wp-content\/(.+)$/);
        if (wpMatch) {
          const relPath = wpMatch[1];
          const destDir = `${OUT}/wp-content/${path.dirname(relPath)}`;
          fs.mkdirSync(destDir, { recursive: true });
          const dest = `${OUT}/wp-content/${relPath}`;
          if (!fs.existsSync(dest)) fs.writeFileSync(dest, body);
          const localPath = `/clones/${SLUG}/wp-content/${relPath}`;
          imgMap.set(url, localPath);
          imgMap.set(urlNoQ, localPath);
        } else {
          const dest = `${OUT}/img/${fname}`;
          if (!fs.existsSync(dest)) fs.writeFileSync(dest, body);
          imgMap.set(url, `/clones/${SLUG}/img/${fname}`);
          imgMap.set(urlNoQ, `/clones/${SLUG}/img/${fname}`);
        }
      } else if (ct.includes('woff') || urlNoQ.match(/\.(woff2?|ttf|otf|eot)$/i)) {
        const wpMatch = urlNoQ.match(/wp-content\/(.+)$/);
        if (wpMatch) {
          const relPath = wpMatch[1];
          const destDir = `${OUT}/wp-content/${path.dirname(relPath)}`;
          fs.mkdirSync(destDir, { recursive: true });
          const dest = `${OUT}/wp-content/${relPath}`;
          if (!fs.existsSync(dest)) fs.writeFileSync(dest, body);
        } else {
          const dest = `${OUT}/fonts/${fname}`;
          if (!fs.existsSync(dest)) fs.writeFileSync(dest, body);
        }
      }
    } catch { /* ignore */ }
  });

  await pw.route('**/*', async (route) => {
    const url = route.request().url();
    if (url.includes('googletagmanager') || url.includes('google-analytics') ||
        url.includes('facebook.net') || url.includes('doubleclick') ||
        url.includes('tawk.to') || url.includes('hotjar') ||
        url.includes('recaptcha') || url.includes('googlesyndication') ||
        url.includes('instagram.com/') || url.includes('graph.facebook.com')) {
      return route.abort();
    }
    route.continue();
  });

  console.log(`\n→ Capturing: ${pageInfo.key} (${pageInfo.url})`);
  try {
    await pw.goto(pageInfo.url, { waitUntil: 'networkidle', timeout: 45000 });
  } catch (e) {
    console.log(`  networkidle timeout for ${pageInfo.key}, continuing...`);
  }

  // Dismiss cookie consent
  try {
    await pw.click('button:has-text("Souhlasím"), button:has-text("Přijmout"), button:has-text("Souhlasit"), .cookie-accept, #acceptCookies, .accept-cookies, button[id*="accept"]', { timeout: 3000 });
    console.log('  Cookie dismissed');
    await pw.waitForTimeout(500);
  } catch { }

  // Close any popup
  try {
    await pw.keyboard.press('Escape');
  } catch { }

  // Scroll to trigger lazy images
  await pw.evaluate(async () => {
    for (let i = 0; i < 15; i++) {
      window.scrollBy(0, window.innerHeight);
      await new Promise(r => setTimeout(r, 200));
    }
    window.scrollTo(0, 0);
  });
  await pw.waitForTimeout(2000);

  const rawHtml = await pw.content();
  console.log(`  Raw HTML: ${rawHtml.length} bytes`);
  fs.writeFileSync(`${OUT}/pages/${pageInfo.key}-raw.html`, rawHtml);

  await pw.close();
  return rawHtml;
}

// Capture all pages
for (const pageInfo of PAGES) {
  await capturePage(pageInfo);
}

await browser.close();
console.log(`\nAssets collected: CSS=${cssMap.size} JS=${jsMap.size} Img=${imgMap.size}`);

// Fix CSS url() refs to use local paths
const wpContentCssDir = `${OUT}/wp-content`;
function fixCssUrls(css, cssFilePath) {
  // Replace absolute URLs pointing to origin
  css = css.replace(/url\(['"]?(https?:\/\/(?:www\.)?antoninovopekarstvi\.cz\/wp-content\/([^'")]+))['"]?\)/gi, (m, fullUrl, relPath) => {
    return `url('/clones/${SLUG}/wp-content/${relPath}')`;
  });
  // Replace relative URLs in CSS (../fonts/ etc)
  // Leave as-is since we preserved the directory structure
  return css;
}

// Walk all CSS files and fix urls
function walkDir(dir) {
  if (!fs.existsSync(dir)) return;
  for (const f of fs.readdirSync(dir)) {
    const full = path.join(dir, f);
    if (fs.statSync(full).isDirectory()) { walkDir(full); continue; }
    if (f.endsWith('.css')) {
      let css = fs.readFileSync(full, 'utf8');
      const fixed = fixCssUrls(css, full);
      if (fixed !== css) fs.writeFileSync(full, fixed);
    }
  }
}
walkDir(`${OUT}/wp-content`);

console.log('\n=== MIRROR HOTOVO ===');
console.log(`Pages saved to: ${OUT}/pages/`);
console.log('Files:', fs.readdirSync(`${OUT}/pages/`).join(', '));
