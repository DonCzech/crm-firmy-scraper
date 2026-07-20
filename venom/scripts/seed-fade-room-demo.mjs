/**
 * seed-barber-demo.mjs
 *
 * Vytvoří demo tenant "fade-room-demo" jako 1:1 klon barbershopurban.cz.
 * Renderovací mód: full-page-clone — načte originální HTML + CSS + JS ze živého webu,
 * uloží do DB jako jednu sekci, page renderuje ClonedSiteRenderer (bypass TenantPublicView).
 *
 * Použití:
 *   node scripts/seed-barber-demo.mjs
 *   node scripts/seed-barber-demo.mjs --refetch   (znovu stáhne HTML z barbershopurban.cz)
 */

import pg from 'pg';
import { readFileSync, existsSync, writeFileSync } from 'fs';

const { Pool } = pg;

// Load env
if (!process.env.DATABASE_URL) {
  const env = readFileSync('.env.local', 'utf-8');
  for (const line of env.split('\n')) {
    const [k, ...v] = line.split('=');
    if (k?.trim() && v.length) process.env[k.trim()] = v.join('=').trim();
  }
}

const CACHE_FILE = '/tmp/barber-body.html';
const SOURCE_URL = 'https://barbershopurban.cz';
const TENANT_SLUG = 'fade-room-demo';

const CSS_URLS = [
  'https://barbershopurban.cz/assets/templates/barbershop/css/styles.min.css?v=c89',
];
const JS_URLS = [
  'https://ajax.googleapis.com/ajax/libs/jquery/3.6.1/jquery.min.js',
  'https://barbershopurban.cz/assets/templates/barbershop/js/ai8d-1.js',
  'https://barbershopurban.cz/assets/templates/barbershop/js/common.js?v=15',
];

async function fetchOriginalHtml() {
  const refetch = process.argv.includes('--refetch');
  if (!refetch && existsSync(CACHE_FILE)) {
    console.log('Using cached HTML from', CACHE_FILE);
    return readFileSync(CACHE_FILE, 'utf-8');
  }

  console.log('Fetching', SOURCE_URL, '...');
  const res = await fetch(SOURCE_URL, {
    headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36' },
  });
  const raw = await res.text();

  // Extract body content
  const bodyMatch = raw.match(/<body[^>]*>([\s\S]*)<\/body>/i);
  if (!bodyMatch) throw new Error('Could not extract body from HTML');
  let body = bodyMatch[1].trim();

  // Strip analytics/tracking scripts
  body = body
    .replace(/<script[^>]*googletagmanager[^<]*<\/script>/gi, '')
    .replace(/<script[^>]*gtag[^<]*<\/script>/gi, '')
    .replace(/<script[^>]*yandex[^<]*<\/script>/gi, '')
    .replace(/<script[^>]*mc\.yandex[^<]*<\/script>/gi, '')
    .replace(/<noscript>[\s\S]*?googletagmanager[\s\S]*?<\/noscript>/gi, '')
    .replace(/<noscript>[\s\S]*?yandex[\s\S]*?<\/noscript>/gi, '');

  // Fix relative asset URLs → absolute
  body = body
    .replace(/src="assets\//g, 'src="https://barbershopurban.cz/assets/')
    .replace(/href="assets\//g, 'href="https://barbershopurban.cz/assets/')
    .replace(/href="fav\//g, 'href="https://barbershopurban.cz/fav/')
    .replace(/href="o-nas\//g, 'href="https://barbershopurban.cz/o-nas/')
    .replace(/href="cenik\//g, 'href="https://barbershopurban.cz/cenik/')
    .replace(/href="galerie\//g, 'href="https://barbershopurban.cz/galerie/')
    .replace(/href="sluzby\//g, 'href="https://barbershopurban.cz/sluzby/')
    .replace(/href="akce\//g, 'href="https://barbershopurban.cz/akce/')
    .replace(/href="faq\//g, 'href="https://barbershopurban.cz/faq/')
    .replace(/href="blog\//g, 'href="https://barbershopurban.cz/blog/');

  writeFileSync(CACHE_FILE, body);
  console.log('Fetched and cached, body size:', body.length);
  return body;
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function main() {
  const html = await fetchOriginalHtml();
  const client = await pool.connect();

  try {
    // Delete existing tenant (CASCADE removes pages + sections)
    const old = await client.query('SELECT id FROM tenants WHERE slug = $1', [TENANT_SLUG]);
    if (old.rows.length) {
      await client.query('DELETE FROM tenants WHERE slug = $1', [TENANT_SLUG]);
      console.log('Deleted old tenant:', TENANT_SLUG);
    }

    // Resolve barber template id
    const tplRow = await client.query("SELECT id FROM templates WHERE key = 'barber'");
    const templateId = tplRow.rows[0]?.id;
    if (!templateId) throw new Error('Barber template not found in DB');

    // Create tenant
    const accessToken = Math.random().toString(36).slice(2, 14) + Math.random().toString(36).slice(2, 14);
    const tenantRes = await client.query(
      `INSERT INTO tenants (slug, email, template_id, template_version, industry, status, active_modules, plan, access_token)
       VALUES ($1, $2, $3, '1.0.0', 'barber', 'demo', $4, 'free', $5)
       RETURNING id`,
      [TENANT_SLUG, 'demo@barbershopurban.cz', templateId, ['gallery', 'testimonials', 'forms'], accessToken]
    );
    const tenantId = tenantRes.rows[0].id;
    console.log('Created tenant id:', tenantId);

    // Create homepage
    const pageRes = await client.query(
      `INSERT INTO pages (tenant_id, slug, title, is_homepage, status, seo_title, seo_description)
       VALUES ($1, 'home', 'Barbershop URBAN', true, 'published', 'Barbershop Praha pánský střih - Barbershop URBAN', 'Profesionální barbershop v Praze 3')
       RETURNING id`,
      [tenantId]
    );
    const pageId = pageRes.rows[0].id;
    console.log('Created page id:', pageId);

    // Insert single full-page-clone section
    await client.query(
      `INSERT INTO sections (tenant_id, page_id, section_type, section_variant, order_index, is_visible, settings)
       VALUES ($1, $2, 'full-page-clone', 'default', 0, true, $3)`,
      [tenantId, pageId, JSON.stringify({ html, cssUrls: CSS_URLS, jsUrls: JS_URLS })]
    );
    console.log('Inserted full-page-clone section, html size:', html.length);

    console.log('\n✅ Done!');
    console.log('   Preview: http://localhost:3015/demo/' + TENANT_SLUG);
    console.log('   Admin:   http://localhost:3015/demo/' + TENANT_SLUG + '/admin');
    console.log('   Token:   ' + accessToken);
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch(e => { console.error('FAILED:', e.message); process.exit(1); });
