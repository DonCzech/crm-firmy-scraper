import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'url';
import pg from 'pg';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const DB_URL = process.env.DATABASE_URL;
const pool = new pg.Pool({ connectionString: DB_URL });

const SLUG = 'escape';
const TENANT_SLUG = 'escape-demo';
const ACCESS_TOKEN = 'escape' + Math.random().toString(36).slice(2, 11);

// WPO Minify aggregated CSS + local Google Fonts
const CSS_URLS = [
  `/clones/${SLUG}/fonts/css`,   // Google Fonts CSS (locally rewritten)
  `/clones/${SLUG}/wp-content/cache/wpo-minify/1774712383/assets/wpo-minify-header-5de564e7.min.css`,
];

const JS_URLS = [
  `/clones/${SLUG}/js/wpo-minify-header-7b950e49.min.js`,
  `/clones/${SLUG}/js/wpo-minify-footer-15706dac.min.js`,
];

const PAGES = [
  { slug: 'home',    title: 'Domů',                 file: 'home.html',    isHome: true  },
  { slug: 'masaze',  title: 'Masáže',                file: 'masaze.html',  isHome: false },
  { slug: 'cenik',   title: 'Ceník masáží',           file: 'cenik.html',   isHome: false },
  { slug: 'voucher', title: 'Dárkové poukazy',        file: 'voucher.html', isHome: false },
];

function extractBody(rawHtml) {
  // Extract head styles
  const headMatch = rawHtml.match(/<head[^>]*>([\s\S]*?)<\/head>/i);
  const inlineStyles = [...(headMatch?.[1] || '').matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)]
    .map(m => `<style>${m[1]}</style>`).join('\n');

  // Extract body
  const bodyMatch = rawHtml.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  const body = bodyMatch?.[1] || '';

  // Strip tracking + Cookiebot CSS+HTML (same approach as tawan)
  // Remove Cookiebot style blocks
  const parts = (inlineStyles + '\n' + body).split('<style');
  const cleaned = parts.map((part, i) => {
    if (i === 0) return part;
    const close = part.indexOf('</style>');
    if (close === -1) return '<style' + part;
    if (/CybotCookiebot|cookieconsent/i.test(part.slice(0, close))) return part.slice(close + 8);
    return '<style' + part;
  }).join('');

  let html = cleaned;

  // Remove Cookiebot script blocks
  html = html.replace(/<script[^>]*(?:CookieConsent|Cookiebot|cookiebot)[^>]*>[\s\S]*?<\/script>/gi, '');

  // Remove Cookiebot HTML dialog (truncate from top to <header)
  const headerIdx = html.search(/<header[^>]*(?:class|id)="[^"]*(?:site-header|header|masthead)[^"]*"/i) ||
                    html.search(/<header\b/i);
  if (headerIdx > 0 && headerIdx < html.length * 0.4) {
    // Get the inline styles from before the header
    const stylesInCleaned = (html.slice(0, headerIdx).match(/<style[^>]*>[\s\S]*?<\/style>/gi) || []).join('\n');
    html = stylesInCleaned + '\n' + html.slice(headerIdx);
  }

  // Strip tracking
  html = html.replace(/<script[^>]*(?:googletagmanager|gtag|hotjar|facebook\.net)[^>]*>[\s\S]*?<\/script>/gi, '');

  // Social links → #
  html = html.replace(/href="https?:\/\/(?:www\.)?(?:facebook|instagram|youtube|tiktok)\.com\/[^"]*"/gi, 'href="#"');

  // Reservation external link → #rezervace
  html = html.replace(/href="https?:\/\/(?:app\.|www\.)?(?:bookio|calendly|acuity|simply)[^"]*"/gi, 'href="#rezervace"');

  return html;
}

// Brand replacements
function scrubBrand(html) {
  html = html.replace(/Escape Massage(?!\s*Demo)/gi, 'Demo Escape Massage');
  html = html.replace(/escapemassage\.cz/gi, 'demo.local');
  html = html.replace(/[a-z.]+@escapemassage\.cz/gi, 'info@demo.local');
  html = html.replace(/\+420\s*\d{3}\s*\d{3}\s*\d{3}/g, '+420 608 288 777');
  html = html.replace(/(?:Mánesova|Korunní|Vinohradská|Slezská|Belgická)\s+\d+[^<,]{0,30}Praha\s*\d*/gi, 'Demo ulice 12, Praha 2');
  return html;
}

function log(m) { console.log(`[${new Date().toISOString().slice(11,19)}] ${m}`); }

log('=== Seed escape-demo ===');
const del = await pool.query(`DELETE FROM tenants WHERE slug=$1 RETURNING id`, [TENANT_SLUG]);
if (del.rowCount) log(`Deleted old ${del.rows[0].id}`);

const tpl = await pool.query(`SELECT id FROM templates WHERE key='wellness' LIMIT 1`);
const ten = await pool.query(`
  INSERT INTO tenants (slug,template_id,business_name,industry,email,lifecycle_status,access_token,analytics_config)
  VALUES ($1,$2,$3,$4,$5,'draft',$6,$7) RETURNING id
`, [TENANT_SLUG, tpl.rows[0].id, 'Demo Escape Massage', 'thajské masáže Praha',
    'info@demo.local', ACCESS_TOKEN,
    JSON.stringify({ cloneSource: 'escapemassage.cz', cms: 'WordPress/WPO-Minify' })]);
const tid = ten.rows[0].id;
log(`Tenant ${tid}, token: ${ACCESS_TOKEN}`);

for (let i = 0; i < PAGES.length; i++) {
  const p = PAGES[i];
  const htmlPath = path.join(ROOT, `public/clones/${SLUG}/pages/${p.file}`);
  if (!fs.existsSync(htmlPath)) { log(`SKIP missing: ${p.file}`); continue; }

  const rawHtml = fs.readFileSync(htmlPath, 'utf8');
  let html = extractBody(rawHtml);
  html = scrubBrand(html);
  log(`${p.slug}: ${rawHtml.length} → ${html.length}`);

  const pg2 = await pool.query(`
    INSERT INTO pages (tenant_id,slug,title,is_homepage,seo_title,seo_description)
    VALUES ($1,$2,$3,$4,$5,$6) ON CONFLICT (tenant_id,slug) DO UPDATE
    SET title=$3,is_homepage=$4,seo_title=$5,seo_description=$6 RETURNING id
  `, [tid, p.slug, p.title, p.isHome,
      `${p.title} — Demo Escape Massage`, 'Ukázka šablony pro thajský masážní salon. Demo verze.']);
  const pid = pg2.rows[0].id;

  await pool.query(`
    INSERT INTO sections (tenant_id,page_id,section_type,settings,order_index,is_visible)
    VALUES ($1,$2,'full-page-clone',$3,0,true) ON CONFLICT DO NOTHING
  `, [tid, pid, JSON.stringify({ html, cssUrls: CSS_URLS, jsUrls: JS_URLS })]);
  log(`  ${p.slug} → page ${pid} ✅`);
}

await pool.end();
log(`Done! http://localhost:3015/demo/${TENANT_SLUG}`);
