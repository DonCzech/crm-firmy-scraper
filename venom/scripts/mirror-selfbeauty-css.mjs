// Download all parastorage CSS + rewrite HTML
import fs from 'node:fs';
import https from 'node:https';

const SLUG = 'selfbeauty';
const OUT = `public/clones/${SLUG}`;

function downloadText(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
        'Accept': 'text/css,*/*',
      },
      timeout: 20000,
    }, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        return downloadText(res.headers.location).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) return reject(new Error(`HTTP ${res.statusCode}`));
      let data = '';
      res.setEncoding('utf8');
      res.on('data', d => data += d);
      res.on('end', () => resolve(data));
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('timeout')); });
  });
}

const PAGES = ['home', 'cenik-barber', 'cenik-manikura', 'cenik-kosmetika', 'darkovy-poukaz'];

// Collect ALL CSS URLs from all pages
const allCssUrls = new Set();
const allJsUrls = new Set();
for (const slug of PAGES) {
  const html = fs.readFileSync(`${OUT}/pages/${slug}.html`, 'utf8');
  const cssMatches = html.match(/https:\/\/static\.parastorage\.com\/[^"]+\.(?:min\.css|css)(?:\?[^"]*)?/g) || [];
  cssMatches.forEach(u => allCssUrls.add(u.split('"')[0]));
  // Essential WIX JS bundles for visual rendering (skip thunderbolt main, tag-manager, chat)
  const jsMatches = html.match(/https:\/\/static\.parastorage\.com\/services\/editor-elements-library\/[^"]+\.bundle\.min\.js/g) || [];
  jsMatches.forEach(u => allJsUrls.add(u.split('"')[0]));
}

console.log(`CSS files to download: ${allCssUrls.size}`);
console.log(`JS bundles to download: ${allJsUrls.size}`);

// Download CSS files
console.log('\n--- Downloading CSS ---');
const cssMap = new Map(); // url -> local filename
let cssOk = 0;
for (const url of allCssUrls) {
  // Use last meaningful path segment as filename
  const parts = url.split('/');
  let fname = parts[parts.length - 1].split('?')[0];
  // Handle brackets in filename (URL encoded)
  fname = fname.replace(/[\[\]]/g, '_');
  if (fname.length > 80) fname = fname.slice(-80);
  cssMap.set(url, fname);
  const dest = `${OUT}/css/${fname}`;
  if (fs.existsSync(dest) && fs.statSync(dest).size > 10) {
    cssOk++;
    process.stdout.write('.');
    continue;
  }
  try {
    const content = await downloadText(url);
    fs.writeFileSync(dest, content);
    cssOk++;
    process.stdout.write('.');
  } catch (e) {
    process.stdout.write('x');
    console.log(`\n  FAIL: ${fname}: ${e.message}`);
  }
}
console.log(`\nCSS: ${cssOk}/${allCssUrls.size} OK`);

// Download essential JS bundles (editor-elements only, not thunderbolt main)
console.log('\n--- Downloading essential WIX UI JS bundles ---');
const jsMap = new Map();
let jsOk = 0;
for (const url of allJsUrls) {
  const parts = url.split('/');
  let fname = parts[parts.length - 1].split('?')[0];
  fname = fname.replace(/[\[\]]/g, '_');
  if (fname.length > 80) fname = fname.slice(-80);
  jsMap.set(url, fname);
  const dest = `${OUT}/js/${fname}`;
  if (fs.existsSync(dest) && fs.statSync(dest).size > 10) {
    jsOk++;
    process.stdout.write('.');
    continue;
  }
  try {
    const content = await downloadText(url);
    fs.writeFileSync(dest, content);
    jsOk++;
    process.stdout.write('.');
  } catch (e) {
    process.stdout.write('x');
  }
}
console.log(`\nJS: ${jsOk}/${allJsUrls.size} OK`);

// Rewrite HTML files with local CSS/JS paths
console.log('\n--- Rewriting HTML with local CSS/JS paths ---');
for (const pageSlug of PAGES) {
  let html = fs.readFileSync(`${OUT}/pages/${pageSlug}.html`, 'utf8');

  // Replace CSS links
  for (const [url, fname] of cssMap) {
    const escaped = url.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    html = html.replace(new RegExp(escaped, 'g'), `/clones/${SLUG}/css/${fname}`);
  }

  // Replace editor-elements JS bundles
  for (const [url, fname] of jsMap) {
    const escaped = url.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    html = html.replace(new RegExp(escaped, 'g'), `/clones/${SLUG}/js/${fname}`);
  }

  // Strip remaining parastorage JS we don't want (thunderbolt main, workers, tag-manager, etc.)
  html = html.replace(
    /<script[^>]*src="https:\/\/static\.parastorage\.com\/(?:services\/wix-thunderbolt|services\/tag-manager|unpkg\/)[^"]*"[^>]*>[\s\S]*?<\/script>/gi, ''
  );
  html = html.replace(
    /<script[^>]*src="https:\/\/[^"]*(?:thunderbolt|clientWorker|sentry|hotjar|analytics|googletagmanager|usercentrics)[^"]*"[^>]*><\/script>/gi, ''
  );
  // Strip link preloads for removed JS
  html = html.replace(
    /<link[^>]*(?:wix-thunderbolt|tag-manager-client|usercentrics)[^>]*>/gi, ''
  );

  // Strip Wix chat widget HTML
  html = html.replace(/<div[^>]*id="wix-chat[^"]*"[^>]*>[\s\S]*?<\/div>/gi, '');

  // Strip language selector
  html = html.replace(/<[^>]*data-testid="languageSwitcher"[^>]*>[\s\S]*?<\/(?:div|li|ul|nav)>/gi, '');

  fs.writeFileSync(`${OUT}/pages/${pageSlug}.html`, html);

  // Check remaining external refs
  const remaining = (html.match(/https:\/\/(?:static\.(parastorage|wixstatic)\.com|browser\.sentry-cdn|[a-z]+\.usercentrics)[^"' )]+/g) || []);
  const unique = [...new Set(remaining)];
  console.log(`  ${pageSlug}: ${unique.length} external refs remaining`);
  if (unique.length > 0 && unique.length < 10) console.log('   ', unique.join('\n    '));
}

console.log('\nDone ✅');
