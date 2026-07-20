/**
 * Seed antoninovopekarstvi-demo
 * 5 pages: home, nase-pecivo, nabidka, o-nas, kontakt
 */
import pg from '/Users/apple/DEV/CRM/venom/node_modules/pg/lib/index.js';
import fs from 'node:fs';
import path from 'node:path';

const { Pool } = pg;

const SLUG        = 'antoninpekarstvi';
const TENANT_SLUG = 'antoninovopekarstvi-demo';
const ROOT        = '/Users/apple/DEV/CRM/venom';
const OUT         = `${ROOT}/public/clones/${SLUG}`;
const DB_URL      = process.env.DATABASE_URL;

const pool = new Pool({ connectionString: DB_URL });

function log(m) { console.log(`[${new Date().toISOString().slice(11,19)}] ${m}`); }

// ─── CSS/JS URLs ──────────────────────────────────────────────────────────────
const CSS_URLS = [
  `/clones/${SLUG}/wp-content/plugins/revslider/public/assets/css/settings.css`,
  `/clones/${SLUG}/wp-content/themes/marco/assets/css/app.css`,
  `/clones/${SLUG}/wp-content/plugins/js_composer/assets/css/js_composer.min.css`,
  `/clones/${SLUG}/wp-content/themes/marco-child/style.css`,
  `/clones/${SLUG}/wp-content/plugins/js_composer/assets/lib/bower/animate-css/animate.min.css`,
];

const JS_URLS = [
  `/clones/${SLUG}/wp-content/plugins/jquery-manager/assets/js/jquery-1.12.4.min.js`,
  `/clones/${SLUG}/wp-content/themes/marco/assets/js/libs.js`,
  `/clones/${SLUG}/wp-content/themes/marco/assets/js/app.js`,
];

// ─── Pages ────────────────────────────────────────────────────────────────────
const PAGES = [
  { key: 'home',        title: 'Domů',             isHome: true  },
  { key: 'nase-pecivo', title: 'Naše pečivo',      isHome: false },
  { key: 'nabidka',     title: 'Aktuální nabídka', isHome: false },
  { key: 'o-nas',       title: 'O nás',            isHome: false },
  { key: 'kontakt',     title: 'Kontakt',          isHome: false },
];

// ─── patchHtml ────────────────────────────────────────────────────────────────
function patchHtml(html) {
  // 1. Rewrite absolute URLs → local
  html = html.replace(/https?:\/\/(?:www\.)?antoninovopekarstvi\.cz\//g, `/clones/${SLUG}/`);
  // Fix double prefix
  html = html.replace(new RegExp(`/clones/${SLUG}/clones/${SLUG}/`, 'g'), `/clones/${SLUG}/`);

  // 2. Remove external scripts
  html = html.replace(/<script[^>]*src="https?:\/\/[^"]*"[^>]*>[\s\S]*?<\/script>/gi, '');
  html = html.replace(/<script[^>]*(?:googletagmanager|gtag|analytics|facebook|instagram|revslider)[^>]*>[\s\S]*?<\/script>/gi, '');

  // 3. Remove WP-specific
  html = html.replace(/<script[^>]*(?:wp-embed|wp-block|admin-bar)[^>]*>[\s\S]*?<\/script>/gi, '');

  // 4. Remove cookie consent
  html = html.replace(/<div[^>]*(?:cookie|consent|gdpr)[^>]*>[\s\S]{0,8000}?<\/div>/gi, '');

  // 5. Remove admin bar
  html = html.replace(/<div[^>]*id="wpadminbar"[^>]*>[\s\S]*?<\/div>/gi, '');

  // 6. Brand scrub
  html = html.replace(/Antonínovo pekárstv[ií]/gi, 'Demo Pekárna');
  html = html.replace(/Antonínovo pekař[^<]{0,30}/gi, 'Demo Pekárna');
  html = html.replace(/Antonínova pekárna/gi, 'Demo Pekárna');
  html = html.replace(/Antonínova kavárna/gi, 'Demo kavárna');
  html = html.replace(/Antonín[^<]{0,20}pekárstv/gi, 'Demo Pekárna');
  html = html.replace(/Antonín[^<]{0,20}pekař/gi, 'Demo Pekárna');
  html = html.replace(/antoninovopekarstvi\.cz/gi, 'demo.local');
  html = html.replace(/\+420\s*\d{3}\s*\d{3}\s*\d{3}/g, '+420 608 288 777');
  html = html.replace(/[a-z0-9._-]+@antoninovopekarstvi[^"<\s]*/gi, 'info@demo.local');
  html = html.replace(/[a-z0-9._-]+@[a-z0-9.-]+\.(?:cz|com)/gi, 'info@demo.local');

  // 7. WP lazy loading: data-src → src
  html = html.replace(/\bsrc="data:image\/[^"]*"/g, '');
  html = html.replace(/\bdata-src="([^"]+)"/g, 'src="$1"');
  html = html.replace(/\bdata-lazy-src="([^"]+)"/g, 'src="$1"');

  // 8. noscript cleanup
  html = html.replace(/<noscript>[\s\S]{0,500}?<\/noscript>/gi, '');

  // Extract body
  const bodyMatch = html.match(/<body[^>]*class="([^"]*)"[^>]*>/i);
  const bodyClasses = (bodyMatch?.[1] || '').replace(/logged-in|admin-bar/g, '').trim();
  const headMatch = html.match(/<head[^>]*>([\s\S]*?)<\/head>/i);
  const inlineStyles = [...(headMatch?.[1] || '').matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)]
    .map(m => `<style>${m[1]}</style>`).join('\n');
  const body = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i)?.[1] || html;

  const FORCE_CSS = `<style>
/* venom-antonin */
[class*="consent"],[id*="consent"],[class*="cookie"],[id*="cookie"],
[class*="gdpr"],[id*="gdpr"],[class*="cli-"],[id*="cli-"],
#wpadminbar,.admin-bar{display:none!important;margin-top:0!important;}
html,body{margin-top:0!important;}
.animated{animation:none!important;opacity:1!important;transform:none!important;visibility:visible!important;}
img[src=""]{display:none}
</style>`;

  const bodyClassAttr = bodyClasses ? ` class="${bodyClasses}"` : '';
  return `${FORCE_CSS}\n${inlineStyles}\n<div${bodyClassAttr}>\n${body}\n</div>`;
}

// ─── Read + patch pages ───────────────────────────────────────────────────────
const patchedPages = {};
for (const p of PAGES) {
  const rawPath = `${OUT}/pages/${p.key}-raw.html`;
  if (!fs.existsSync(rawPath)) {
    log(`WARNING: ${rawPath} not found, skipping`);
    continue;
  }
  const raw = fs.readFileSync(rawPath, 'utf8');
  const patched = patchHtml(raw);
  patchedPages[p.key] = patched;
  log(`Patched ${p.key}: ${raw.length}B → ${patched.length}B`);

  // Audit
  const brandRefs = (patched.match(/antoninovopekarstvi\.cz/gi) || []).length;
  const extRefs = (patched.match(/https?:\/\/(?!(?:schema\.org|w3\.org|demo\.local|fonts\.googleapis|opensource\.keycdn))/gi) || []).length;
  log(`  Audit: brand=${brandRefs} extRefs=${extRefs}`);
}

// ─── DB Seed ──────────────────────────────────────────────────────────────────
const ACCESS_TOKEN = 'antonin' + Math.random().toString(36).slice(2, 9);
log(`=== Seed ${TENANT_SLUG} token=${ACCESS_TOKEN} ===`);

// Delete existing tenant
const del = await pool.query(`DELETE FROM tenants WHERE slug=$1 RETURNING id`, [TENANT_SLUG]);
if (del.rowCount) log(`Deleted old tenant ${del.rows[0].id}`);

// Find a template
const tplR = await pool.query(`SELECT id FROM templates WHERE key='barber' LIMIT 1`);
const tplId = tplR.rows[0]?.id;
if (!tplId) { log('ERROR: No template found'); process.exit(1); }

// Create tenant
const tenR = await pool.query(`
  INSERT INTO tenants (slug, template_id, business_name, industry, email, lifecycle_status, access_token, analytics_config)
  VALUES ($1, $2, $3, $4, $5, 'draft', $6, $7)
  RETURNING id
`, [
  TENANT_SLUG,
  tplId,
  'Demo Pekárna',
  'Pekárna, cukrárna, čerstvé pečivo, dorty na zakázku',
  'info@demo.local',
  ACCESS_TOKEN,
  JSON.stringify({ cloneSource: 'antoninovopekarstvi.cz', cms: 'WordPress Marco theme RevSlider WPBakery' }),
]);
const tid = tenR.rows[0].id;
log(`Tenant created: ${tid}`);

const pageIds = {};

// Create pages + sections
for (const p of PAGES) {
  if (!patchedPages[p.key]) continue;

  const pgR = await pool.query(`
    INSERT INTO pages (tenant_id, slug, title, is_homepage, seo_title, seo_description)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING id
  `, [
    tid,
    p.key,
    p.title,
    p.isHome,
    `${p.title} — Demo Pekárna`,
    'Ukázka prémiové webové šablony pro pekárnu a cukrárnu.',
  ]);
  const pageId = pgR.rows[0].id;
  pageIds[p.key] = pageId;

  const settings = {
    html:    patchedPages[p.key],
    cssUrls: CSS_URLS,
    jsUrls:  JS_URLS,
    title:   p.title,
  };

  await pool.query(`
    INSERT INTO sections (tenant_id, page_id, section_type, settings, order_index, is_visible)
    VALUES ($1, $2, 'full-page-clone', $3::jsonb, 0, true)
  `, [tid, pageId, JSON.stringify(settings)]);

  log(`Page ${p.key} → ${pageId} ✅`);
}

// Publish tenant
await pool.query(`UPDATE tenants SET lifecycle_status='published', updated_at=NOW() WHERE id=$1`, [tid]);
log(`Tenant published ✅`);

await pool.end();

log('');
log(`=== DONE ===`);
log(`Tenant ID:    ${tid}`);
log(`Access Token: ${ACCESS_TOKEN}`);
log(`Page IDs:     ${JSON.stringify(pageIds)}`);
log(`URL:          http://localhost:3015/demo/${TENANT_SLUG}`);
