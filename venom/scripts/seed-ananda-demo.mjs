import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'url';
import pg from 'pg';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const DB_URL = process.env.DATABASE_URL;
const pool = new pg.Pool({ connectionString: DB_URL });

const TENANT_SLUG = 'ananda-demo';
const ACCESS_TOKEN = 'ananda' + Math.random().toString(36).slice(2, 11);
const SLUG = 'ananda';

const CSS_URLS = [
  `/clones/${SLUG}/css/app-pR6ImjcH.css`,
];
const JS_URLS = [
  `/clones/${SLUG}/js/app-CAiCLEjY.js`,
];

const PAGES = [
  { slug: 'home',      title: 'Domů',                 file: 'home.html',       isHome: true  },
  { slug: 'procedury', title: 'Ájurvédské procedury', file: 'procedury.html',  isHome: false },
  { slug: 'voucher',   title: 'Dárkový voucher',       file: 'voucher.html',    isHome: false },
];

function extractBody(rawHtml) {
  // Get inline styles from head
  const headMatch = rawHtml.match(/<head[^>]*>([\s\S]*?)<\/head>/i);
  const headContent = headMatch?.[1] || '';
  const inlineStyles = [...headContent.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)]
    .map(m => `<style>${m[1]}</style>`).join('\n');

  // Get body content
  const bodyMatch = rawHtml.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  let body = bodyMatch?.[1] || rawHtml;

  // Strip scripts (Alpine.js livewire won't work offline anyway — keep for structure)
  // Actually keep Alpine.js-compatible scripts but strip tracking/livewire
  body = body.replace(/<script[^>]*(?:googletagmanager|google-analytics|gtag|hotjar|doubleclick|facebook\.net|ekomi)[^>]*>[\s\S]*?<\/script>/gi, '');
  body = body.replace(/<script[^>]*wire:[^>]*>[\s\S]*?<\/script>/gi, '');

  // Strip cookie overlay
  body = body.replace(/<div[^>]*(?:cookie|consent|gdpr)[^>]*>[\s\S]{0,3000}?<\/div>/gi, '');

  // Fix social links
  body = body.replace(/href="https?:\/\/(?:www\.)?(?:instagram|facebook|youtube|twitter|tiktok)\.com\/[^"]*"/gi, 'href="#"');
  body = body.replace(/href="https?:\/\/anandaspa\.cz\/[^"]*"/gi, 'href="#"');
  body = body.replace(/href="http:\/\/anandaspa\.cz[^"]*"/gi, 'href="#"');

  // Strip tracking links
  body = body.replace(/href="https?:\/\/(?:googleads|doubleclick|ekomi)[^"]*"/gi, 'href="#"');

  return inlineStyles + '\n' + body;
}

function log(m) { console.log(`[${new Date().toISOString().slice(11,19)}] ${m}`); }

log('=== Seed ananda-demo (Laravel/Alpine/Vite) ===');

const del = await pool.query(`DELETE FROM tenants WHERE slug=$1 RETURNING id`, [TENANT_SLUG]);
if (del.rowCount) log(`Deleted old tenant ${del.rows[0].id}`);

const tpl = await pool.query(`SELECT id FROM templates WHERE key='wellness' LIMIT 1`);
if (!tpl.rows.length) throw new Error('Template wellness not found');

const ten = await pool.query(`
  INSERT INTO tenants (slug, template_id, business_name, industry, email, lifecycle_status, access_token, analytics_config)
  VALUES ($1,$2,$3,$4,$5,'draft',$6,$7) RETURNING id
`, [TENANT_SLUG, tpl.rows[0].id, 'Demo Ananda SPA', 'ayurvéda & wellness',
    'info@demo.local', ACCESS_TOKEN,
    JSON.stringify({ cloneSource: 'anandaspa.cz', cms: 'Laravel+Alpine+Vite' })]);
const tenantId = ten.rows[0].id;
log(`Tenant ${tenantId}, token: ${ACCESS_TOKEN}`);

for (let i = 0; i < PAGES.length; i++) {
  const p = PAGES[i];
  const htmlPath = path.join(ROOT, `public/clones/${SLUG}/pages/${p.file}`);
  if (!fs.existsSync(htmlPath)) { log(`SKIP missing: ${p.file}`); continue; }

  const rawHtml = fs.readFileSync(htmlPath, 'utf8');
  const html = extractBody(rawHtml);
  log(`${p.slug}: ${rawHtml.length} → ${html.length} bytes`);

  const pageRes = await pool.query(`
    INSERT INTO pages (tenant_id, slug, title, is_homepage, seo_title, seo_description)
    VALUES ($1,$2,$3,$4,$5,$6) ON CONFLICT (tenant_id, slug) DO UPDATE
    SET title=$3, is_homepage=$4, seo_title=$5, seo_description=$6 RETURNING id
  `, [tenantId, p.slug, p.title, p.isHome,
      `${p.title} — Demo Ananda SPA`, 'Ukázka šablony pro Ayurvédické SPA & wellness. Demo verze.']);
  const pageId = pageRes.rows[0].id;

  await pool.query(`
    INSERT INTO sections (tenant_id, page_id, section_type, settings, order_index, is_visible)
    VALUES ($1,$2,'full-page-clone',$3,0,true) ON CONFLICT DO NOTHING
  `, [tenantId, pageId, JSON.stringify({ html, cssUrls: CSS_URLS, jsUrls: JS_URLS })]);
  log(`  Page ${p.slug} → ${pageId} ✅`);
}

await pool.end();
log(`Done! URL: http://localhost:3015/demo/${TENANT_SLUG}`);
log(`Admin: http://localhost:3015/demo/${TENANT_SLUG}/admin`);
