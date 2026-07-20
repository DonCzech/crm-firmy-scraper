/**
 * Reseed homie-demo from original HTML files (safe patch - no dangerous lazy regexes)
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'url';
import pg from 'pg';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const DB_URL = process.env.DATABASE_URL;
const pool = new pg.Pool({ connectionString: DB_URL });

const SLUG = 'homie';
const TENANT_SLUG = 'homie-demo';

const KILL = `<script id="venom-kill">(function(){var A=['localhost','127.0.0.1'];function isE(u){if(!u||u[0]==='/'||u.startsWith('data:')||u.startsWith('blob:'))return false;try{var h=new URL(u).hostname;return!A.some(function(a){return h===a||h.endsWith('.'+a);});}catch(e){return false;}}var oF=window.fetch;window.fetch=function(u){var uu=typeof u==='string'?u:(u&&u.url)||'';if(isE(uu))return Promise.resolve(new Response('',{status:200}));return oF.apply(this,arguments);};var oO=XMLHttpRequest.prototype.open;XMLHttpRequest.prototype.open=function(m,u){if(isE(String(u))){this._b=true;return;}return oO.apply(this,arguments);};var oS=XMLHttpRequest.prototype.send;XMLHttpRequest.prototype.send=function(){if(this._b)return;return oS.apply(this,arguments);};var oSA=Element.prototype.setAttribute;Element.prototype.setAttribute=function(n,v){if(n==='src'&&this.tagName==='SCRIPT'&&isE(String(v)))return;return oSA.apply(this,arguments);};})()</script>`;

function log(m) { console.log(`[${new Date().toISOString().slice(11,19)}] ${m}`); }

function patchHtml(rawHtml) {
  const headMatch = rawHtml.match(/<head[^>]*>([\s\S]*?)<\/head>/i);
  const inlineStyles = [...(headMatch?.[1] || '').matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)]
    .map(m => `<style>${m[1]}</style>`).join('\n');
  const bodyMatch = rawHtml.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  let body = bodyMatch?.[1] || rawHtml;

  // 1. Strip GTM noscript
  body = body.replace(/<noscript><iframe[^>]*googletagmanager[^>]*><\/iframe><\/noscript>/gi, '');

  // 2. Strip external SCRIPT TAGS by src attribute (safe: matches only single tag)
  const BAD_SRC = ['clarity.ms', 'facebook.net', 'fbevents', 'googletagmanager', 'google-analytics',
    'gstatic.com/recaptcha', 'zotabox.com', 'youtube.com/player_api', 'youtube-nocookie',
    's.w.org', 'cookielaw', 'bookio', 'hotjar', 'smartlook'];
  for (const pat of BAD_SRC) {
    const re = new RegExp(`<script[^>]*${pat.replace(/\./g,'\\.')}[^>]*><\\/script>`, 'gi');
    body = body.replace(re, '');
    // Also block-style with content
    const re2 = new RegExp(`<script[^>]*${pat.replace(/\./g,'\\.')}[^>]*>[\\s\\S]{0,500}?<\\/script>`, 'gi');
    body = body.replace(re2, '');
  }

  // 3. Strip YouTube iframes (safe: use width/height attributes as delimiter)
  body = body.replace(/<iframe[^>]*src="[^"]*youtube[^"]*"[^>]*><\/iframe>/gi, '');
  body = body.replace(/<iframe[^>]*src="[^"]*youtube[^"]*"[^>]*\/>/gi, '');

  // 4. Strip Google Maps iframes
  body = body.replace(/<iframe[^>]*src="[^"]*google\.com\/maps[^"]*"[^>]*><\/iframe>/gi, '');

  // 5. Strip recaptcha divs (by specific id)
  body = body.replace(/<div[^>]*id="g-recaptcha[^"]*"[^>]*>[\s\S]{0,300}?<\/div>/gi, '');

  // 6. Strip Facebook pixel noscript
  body = body.replace(/<noscript>[^<]*<img[^>]*facebook\.com\/tr[^>]*>[^<]*<\/noscript>/gi, '');

  // 7. Strip WordPress emoji script (safe: matches known inline pattern)
  body = body.replace(/window\._wpemojiSettings[\s\S]{0,2000}?<\/script>/g, '</script>');

  // 8. Strip cookie-law info-bar config (the JS object, not a div)
  // These are inline scripts with known short content
  // Instead of greedy regex, just look for the specific var
  body = body.replace(/var Cli_Data[\s\S]{0,3000}?;<\/script>/g, '</script>');
  body = body.replace(/var log_object[\s\S]{0,500}?;<\/script>/g, '</script>');

  // 9. Replace external jQuery with local
  body = body.replace(/src="\/\/ajax\.googleapis\.com\/ajax\/libs\/jquery\/[^"]+"/gi,
    'src="/clones/homie/js/jquery.min.js"');
  body = body.replace(/src="https?:\/\/ajax\.googleapis\.com\/ajax\/libs\/jquery\/[^"]+"/gi,
    'src="/clones/homie/js/jquery.min.js"');

  // 10. Strip webfont loader
  body = body.replace(/<script[^>]*webfont\.js[^>]*><\/script>/gi, '');

  // 11. Brand / social / contact scrub
  body = body.replace(/href="https?:\/\/(?:www\.)?(?:facebook|instagram|youtube|tiktok)\.com\/[^"]*"/gi, 'href="#"');
  body = body.replace(/\+420\s*777\s*926\s*123/g, '+420 608 288 777');
  body = body.replace(/[a-z.]+@homietattoo\.cz/gi, 'info@demo.local');
  body = body.replace(/Homie Tattoo(?!\s*Demo)/g, 'Homie Tattoo Demo');
  body = body.replace(/homietattoo\.cz/gi, 'demo.local');
  body = body.replace(/Panská\s+\d+\/\d+[^<,]{0,30}Praha\s*\d*/gi, 'Demo ulice 12, Praha 1');

  return KILL + '\n' + inlineStyles + '\n' + body;
}

const CSS_FILES = fs.readdirSync(`public/clones/${SLUG}/css`).filter(f =>
  !f.includes('cookie') && !f.includes('bookly') && !f.includes('customer-profile') &&
  !f.includes('intlTel') && !f.includes('ladda') && !f.includes('picker')
);
const CSS_URLS = CSS_FILES.map(f => `/clones/${SLUG}/css/${f}`);
const JS_URLS = [
  `/clones/${SLUG}/js/jquery.min.js`,
  `/clones/${SLUG}/js/5777.js`,
  `/clones/${SLUG}/js/front.js`,
  `/clones/${SLUG}/js/index.js`,
  `/clones/${SLUG}/js/main.js`,
  `/clones/${SLUG}/js/owlcarousel.init.js`,
];
log(`CSS: ${CSS_URLS.length} | JS: ${JS_URLS.length}`);

const PAGES = [
  { slug: 'home',     title: 'Domů',     file: 'home.html',     isHome: true  },
  { slug: 'piercing', title: 'Piercing', file: 'piercing.html', isHome: false },
  { slug: 'faq',      title: 'FAQ',      file: 'faq.html',      isHome: false },
];

log('=== Re-seed homie-demo ===');
const r = await pool.query(`SELECT id FROM tenants WHERE slug=$1`, [TENANT_SLUG]);
const tid = r.rows[0].id;
log(`Tenant id: ${tid}`);

// Delete existing pages/sections
await pool.query(`DELETE FROM sections WHERE tenant_id=$1`, [tid]);
await pool.query(`DELETE FROM pages WHERE tenant_id=$1`, [tid]);
log('Cleared old pages/sections');

for (const p of PAGES) {
  const htmlPath = path.join(ROOT, `public/clones/${SLUG}/pages/${p.file}`);
  if (!fs.existsSync(htmlPath)) { log(`SKIP: ${p.file}`); continue; }
  const rawHtml = fs.readFileSync(htmlPath, 'utf8');
  const html = patchHtml(rawHtml);

  const ext = (html.match(/https?:\/\/(?!(?:demo\.local))[a-z0-9.-]+\.[a-z]{2,}/gi) || []).filter(u => !u.includes('demo.local')).length;
  const brand = (html.match(/homietattoo\.cz/gi) || []).length;
  log(`${p.slug}: ${rawHtml.length}→${html.length} | ext=${ext} brand=${brand}`);

  const pg2 = await pool.query(`
    INSERT INTO pages (tenant_id, slug, title, is_homepage, seo_title, seo_description)
    VALUES ($1, $2, $3, $4, $5, $6) RETURNING id
  `, [tid, p.slug, p.title, p.isHome,
    `${p.title} — Demo Homie Tattoo`, 'Ukázka šablony pro tetovací studio Praha.']);

  await pool.query(`
    INSERT INTO sections (tenant_id, page_id, section_type, settings, order_index, is_visible)
    VALUES ($1, $2, 'full-page-clone', $3, 0, true)
  `, [tid, pg2.rows[0].id, JSON.stringify({ html, cssUrls: CSS_URLS, jsUrls: JS_URLS })]);

  log(`  ${p.slug} → page ${pg2.rows[0].id} ✅`);
}

// Ensure published
await pool.query(`UPDATE tenants SET lifecycle_status='published', updated_at=NOW() WHERE id=$1`, [tid]);
log('Published ✅');

await pool.end();
log('Done! http://localhost:3015/demo/homie-demo');
