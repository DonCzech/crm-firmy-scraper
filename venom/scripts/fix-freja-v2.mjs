/**
 * Fix freja-demo v2
 * 1. Download missing Shopify CDN images from freja.cz
 * 2. Rewrite //demo.local/cdn/... image refs to local /clones/freja/img/
 * 3. Remove inline CSS link tags from body (cssUrls array handles CSS)
 * 4. Remove inline JS script tags for external Shopify assets
 * 5. Update DB: body-only, cssUrls array, jsUrls=[kill-external]
 */
import pg from 'pg';
import fs from 'node:fs';
import path from 'node:path';
import https from 'node:https';
import http from 'node:http';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const SLUG = 'freja';
const OUT = `public/clones/${SLUG}`;
const DB_URL = 'postgresql://neondb_owner:npg_RG6Q7owUlpXr@ep-still-recipe-alrqcrzd-pooler.c-3.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';
const pool = new pg.Pool({ connectionString: DB_URL });

function dlUrl(url) {
  return new Promise((res, rej) => {
    const mod = url.startsWith('https') ? https : http;
    const req = mod.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (r) => {
      if (r.statusCode >= 300 && r.statusCode < 400 && r.headers.location)
        return dlUrl(r.headers.location).then(res).catch(rej);
      const c = []; r.on('data', d => c.push(d)); r.on('end', () => res(Buffer.concat(c)));
    });
    req.on('error', rej);
    req.setTimeout(20000, () => { req.destroy(); rej(new Error('timeout')); });
  });
}

let html = fs.readFileSync(path.join(ROOT, `${OUT}/pages/home.html`), 'utf8');
console.log(`Read home.html: ${html.length} bytes`);

// ─── Find all //demo.local/cdn/shop/... image refs ─────────────────────────
const imgRe = /\/\/demo\.local\/cdn\/shop\/(?:files|collections)\/([a-zA-Z0-9_.,%-]+\.(?:jpg|jpeg|png|webp|gif|svg))(?:\?[^"'\s,\)>]*)?\b/g;
const imgUrls = new Map(); // origPath → { freja url, local path }
let m;
while ((m = imgRe.exec(html)) !== null) {
  const fname = m[1].replace(/%[0-9a-f]{2}/gi, '_');
  const localPath = `/clones/${SLUG}/img/${fname}`;
  const frPath = m[0].replace('//demo.local', '');  // /cdn/shop/files/...
  const frUrl = `https://freja.cz${frPath}`;
  if (!imgUrls.has(fname)) {
    imgUrls.set(fname, { frUrl, localPath });
  }
}
console.log(`Found ${imgUrls.size} unique CDN images to download`);

// ─── Download missing images ───────────────────────────────────────────────
let downloaded = 0;
for (const [fname, { frUrl, localPath }] of imgUrls) {
  const dest = path.join(ROOT, `${OUT}/img/${fname}`);
  if (fs.existsSync(dest)) continue;
  try {
    const body = await dlUrl(frUrl);
    if (body.length > 200) {
      fs.writeFileSync(dest, body);
      downloaded++;
      process.stdout.write('.');
    }
  } catch { /* skip */ }
}
console.log(`\nDownloaded ${downloaded} new images`);

// ─── Rewrite //demo.local/cdn/... image refs to local paths ───────────────
const replRe = /\/\/demo\.local\/cdn\/shop\/(files|collections)\/([^"'\s,\)>?]+?)(?:\?[^"'\s,\)>]*)?\b/g;
let replaced = 0;
html = html.replace(replRe, (match, dir, fname) => {
  const cleanFname = fname.replace(/%[0-9a-f]{2}/gi, '_');
  const local = `/clones/${SLUG}/img/${cleanFname}`;
  if (fs.existsSync(path.join(ROOT, local))) {
    replaced++;
    return local;
  }
  return match;
});
console.log(`Rewrote ${replaced} image URLs to local paths`);

// ─── Remove inline CSS <link> tags from body (cssUrls handles CSS in head) ─
const linksBefore = (html.match(/<link[^>]+rel=['"']stylesheet['"'][^>]*>/gi) || []).length;
html = html.replace(/<link[^>]+rel=['"']stylesheet['"'][^>]*>/gi, '');
html = html.replace(/<link[^>]*href=["'][^"']*\.(css)[^"']*["'][^>]*>/gi, '');
console.log(`Removed ${linksBefore} inline CSS link tags`);

// ─── Remove inline <script src="//demo.local/..."> tags ───────────────────
const scriptsBefore = (html.match(/<script[^>]+src=["'][^"']*demo\.local[^"']*["'][^>]*><\/script>/gi) || []).length;
html = html.replace(/<script[^>]+src=["'][^"']*demo\.local[^"']*["'][^>]*><\/script>/gi, '');
console.log(`Removed ${scriptsBefore} external script tags`);

// ─── Remove Shopify cookie consent section (remaining) ────────────────────
html = html.replace(/<section[^>]*shopify-pc__banner[^>]*>[\s\S]{0,3000}?<\/section>/gi, '');

// ─── Check remaining demo.local ────────────────────────────────────────────
const remaining = (html.match(/\/\/demo\.local/g) || []).length;
const extRefs = (html.match(/https?:\/\/(?!demo\.local)/g) || []).length;
console.log(`Remaining //demo.local: ${remaining} | ext https refs: ${extRefs}`);

// ─── Save updated file ─────────────────────────────────────────────────────
fs.writeFileSync(path.join(ROOT, `${OUT}/pages/home.html`), html);

// ─── Extract body ─────────────────────────────────────────────────────────
function extractBody(h) {
  const m = h.match(/<body[^>]*>([\s\S]*)<\/body>/i);
  return m ? m[1].trim() : h;
}

let body = extractBody(html);
const styleOverride = `<style>
/* Venom: hide Shopify dynamic elements */
cart-drawer, cart-notification, .shopify-section--cart,
[id*="shopify"], [class*="shopify-challenge"],
.cookie-bar, .cookie-banner, #cookie-consent,
.shopify-pc__banner { display: none !important; }
</style>`;
body = styleOverride + '\n' + body;

const cssFiles = fs.readdirSync(path.join(ROOT, `${OUT}/css`)).sort();
const CSS = cssFiles.map(f => `/clones/${SLUG}/css/${f}`);
const JS = [`/clones/${SLUG}/js/kill-external.js`];

// ─── Update DB ─────────────────────────────────────────────────────────────
const r = await pool.query(`SELECT s.id FROM sections s JOIN pages p ON s.page_id=p.id JOIN tenants t ON p.tenant_id=t.id WHERE t.slug='freja-demo' LIMIT 1`);
await pool.query('UPDATE sections SET settings=$1 WHERE id=$2', [JSON.stringify({ html: body, cssUrls: CSS, jsUrls: JS }), r.rows[0].id]);
console.log(`DB updated: body=${body.length}B cssUrls=${CSS.length} ✅`);

await pool.end();
console.log('=== HOTOVO ===');
