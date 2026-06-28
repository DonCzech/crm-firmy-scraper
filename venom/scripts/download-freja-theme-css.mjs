/**
 * Download Shopify theme CSS files from freja.cz/cdn/shop/t/5/assets/
 * These are the actual storefront CSS files (not checkout CSS)
 */
import fs from 'node:fs';
import https from 'node:https';
import { fileURLToPath } from 'url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const OUT = path.join(ROOT, 'public/clones/freja/css');
import pg from 'pg';

const DB_URL = 'postgresql://neondb_owner:npg_RG6Q7owUlpXr@ep-still-recipe-alrqcrzd-pooler.c-3.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';
const pool = new pg.Pool({ connectionString: DB_URL });

function dlUrl(url) {
  return new Promise((res, rej) => {
    const req = https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0', 'Referer': 'https://freja.cz/' } }, (r) => {
      if (r.statusCode >= 300 && r.statusCode < 400 && r.headers.location)
        return dlUrl(r.headers.location).then(res).catch(rej);
      const c = []; r.on('data', d => c.push(d)); r.on('end', () => res(Buffer.concat(c)));
    });
    req.on('error', rej);
    req.setTimeout(15000, () => { req.destroy(); rej(new Error('timeout')); });
  });
}

// All unique CSS files from raw HTML
const raw = fs.readFileSync(path.join(ROOT, 'public/clones/freja/pages/home-raw.html'), 'utf8');
const cssRe = /\/\/freja\.cz\/cdn\/shop\/t\/\d+\/assets\/([a-z0-9_-]+\.css)\?v=[0-9]+/gi;
const cssFiles = new Set();
let m;
while ((m = cssRe.exec(raw)) !== null) {
  cssFiles.add(m[1]);
}
console.log(`Found ${cssFiles.size} unique theme CSS files`);

// Download each
let downloaded = 0, skipped = 0, failed = 0;
const themeBase = 'https://freja.cz/cdn/shop/t/5/assets/';

for (const fname of cssFiles) {
  const dest = path.join(OUT, fname);
  if (fs.existsSync(dest)) { skipped++; continue; }
  try {
    const body = await dlUrl(`${themeBase}${fname}`);
    if (body.length > 50) {
      fs.writeFileSync(dest, body);
      downloaded++;
      process.stdout.write('.');
    } else {
      failed++;
    }
  } catch { failed++; }
}
console.log(`\nDownloaded: ${downloaded} | Skipped: ${skipped} | Failed: ${failed}`);
console.log(`Total CSS files: ${fs.readdirSync(OUT).length}`);

// Now update DB with ALL css files
const allCss = fs.readdirSync(OUT).sort().map(f => `/clones/freja/css/${f}`);

// Also fix the home.html body to remove inline CSS link tags and update DB
let htmlBody = fs.readFileSync(path.join(ROOT, 'public/clones/freja/pages/home.html'), 'utf8');
const bodyM = htmlBody.match(/<body[^>]*>([\s\S]*)<\/body>/i);
let body = bodyM ? bodyM[1].trim() : htmlBody;

const styleOverride = `<style>
/* Venom: hide Shopify dynamic elements */
cart-drawer, cart-notification, .shopify-section--cart,
[id*="shopify-challenge"], [class*="shopify-challenge"],
.cookie-bar, .cookie-banner, #cookie-consent,
.shopify-pc__banner { display: none !important; }
/* Constrain icon SVGs without explicit dimensions */
.svg-wrapper svg { overflow: visible; }
</style>`;
body = styleOverride + '\n' + body;

const JS = ['/clones/freja/js/kill-external.js'];
const r = await pool.query(`SELECT s.id FROM sections s JOIN pages p ON s.page_id=p.id JOIN tenants t ON p.tenant_id=t.id WHERE t.slug='freja-demo' LIMIT 1`);
await pool.query('UPDATE sections SET settings=$1 WHERE id=$2', [
  JSON.stringify({ html: body, cssUrls: allCss, jsUrls: JS }),
  r.rows[0].id,
]);
console.log(`DB updated: body=${body.length}B cssUrls=${allCss.length} jsUrls=${JS.length} ✅`);
await pool.end();
console.log('=== HOTOVO ===');
