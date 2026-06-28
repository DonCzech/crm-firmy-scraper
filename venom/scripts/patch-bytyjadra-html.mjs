/**
 * Patch bytyjadra-demo sections with fixed HTML (local images)
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'url';
import pg from 'pg';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const DB_URL = 'postgresql://neondb_owner:npg_RG6Q7owUlpXr@ep-still-recipe-alrqcrzd-pooler.c-3.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';
const pool = new pg.Pool({ connectionString: DB_URL });

const SLUG = 'bytyjadra';
const TENANT_SLUG = 'bytyjadra-demo';

// Section IDs from DB query
const PAGE_SECTION_MAP = {
  'home':      1619,
  'sluzby':    1620,
  'reference': 1621,
  'kontakt':   1622,
};

function patchHtml(rawHtml) {
  const headMatch = rawHtml.match(/<head[^>]*>([\s\S]*?)<\/head>/i);
  const inlineStyles = [...(headMatch?.[1] || '').matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)]
    .map(m => `<style>${m[1]}</style>`).join('\n');
  const bodyMatch = rawHtml.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  let body = bodyMatch?.[1] || rawHtml;

  // Rewrite /_next/ to /clones/SLUG/_next/
  body = body.replace(/\/_next\//g, `/clones/${SLUG}/_next/`);

  // Fix remaining /_next/image?url= references (already decoded by fix script, but patch just in case)
  body = body.replace(/\/clones\/bytyjadra\/_next\/image\?url=([^&"'\s]+)[^"'\s]*/g, (m, encoded) => {
    try {
      const decoded = decodeURIComponent(encoded);
      const localPath = path.join(ROOT, 'public/clones', SLUG, decoded.replace(/^\//, ''));
      if (fs.existsSync(localPath)) return `/clones/${SLUG}${decoded}`;
    } catch {}
    return '';
  });

  // External scripts
  body = body.replace(/<script[^>]*src="https?:\/\/[^"]+"[^>]*>[\s\S]*?<\/script>/gi, '');
  body = body.replace(/<script[^>]*(?:googletagmanager|gtag|hotjar|cookiebot|analytics|fbevents|smartsupp)[^>]*>[\s\S]*?<\/script>/gi, '');
  body = body.replace(/<noscript><iframe[^>]*googletagmanager[^>]*><\/iframe><\/noscript>/gi, '');
  body = body.replace(/<div[^>]*(?:cookie-banner|cookie-consent|gdpr|cmplz|CybotCookiebot)[^>]*>[\s\S]{0,8000}?<\/div>/gi, '');

  // Maps
  body = body.replace(/<iframe[^>]*(?:google\.com\/maps|maps\.google)[^>]*>[\s\S]*?<\/iframe>/gi,
    '<div style="background:#e0e0e0;height:300px;display:flex;align-items:center;justify-content:center;color:#666">Mapa</div>');

  return inlineStyles + '\n' + body;
}

for (const [pageSlug, sectionId] of Object.entries(PAGE_SECTION_MAP)) {
  const htmlFile = path.join(ROOT, `public/clones/${SLUG}/pages/${pageSlug}.html`);
  if (!fs.existsSync(htmlFile)) { console.log(`SKIP ${pageSlug} (no file)`); continue; }

  const rawHtml = fs.readFileSync(htmlFile, 'utf8');
  const patchedHtml = patchHtml(rawHtml);

  const r = await pool.query(
    `UPDATE sections SET settings = jsonb_set(settings, '{html}', $1::text::jsonb) WHERE id = $2`,
    [JSON.stringify(patchedHtml), sectionId]
  );
  console.log(`PATCHED ${pageSlug} (section ${sectionId}): ${r.rowCount} rows`);
}

// Set published
await pool.query(`UPDATE tenants SET lifecycle_status = 'published' WHERE slug = $1`, [TENANT_SLUG]);
console.log('Published bytyjadra-demo ✅');

await pool.end();
