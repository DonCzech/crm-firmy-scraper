/**
 * Final cleanup: strip siteassets preload links + fix remaining parastorage CSS refs
 */
import pg from 'pg';
import fs from 'fs';

const DB_URL = 'postgresql://neondb_owner:npg_RG6Q7owUlpXr@ep-still-recipe-alrqcrzd-pooler.c-3.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';
const pool = new pg.Pool({ connectionString: DB_URL });

// Build map of local CSS files (parastorage URL → local path)
const cssDir = 'public/clones/selfbeauty/css';
const cssFiles = fs.readdirSync(cssDir);
// Key: filename (with brackets replaced by _)
const cssMap = new Map();
for (const f of cssFiles) {
  cssMap.set(f, `/clones/selfbeauty/css/${f}`);
}

function cssLocalPath(url) {
  // Extract filename from URL
  const parts = url.split('/');
  let fname = parts[parts.length - 1].split('?')[0];
  // Handle brackets
  const normalized = fname.replace(/[\[\]]/g, '_');
  if (cssMap.has(normalized)) return cssMap.get(normalized);
  if (cssMap.has(fname)) return cssMap.get(fname);
  return null; // not downloaded
}

function patchSection(html) {
  // 1. Strip ALL link tags pointing to siteassets.parastorage.com (Thunderbolt preloads)
  html = html.replace(/<link[^>]+href="https?:\/\/siteassets\.parastorage\.com[^"]*"[^>]*>/gi, '');

  // 2. Rewrite static.parastorage.com CSS link hrefs to local paths
  html = html.replace(
    /<link([^>]+)href="(https?:\/\/static\.parastorage\.com\/[^"]+\.(?:min\.css|css)(?:\?[^"]*)?)"([^>]*)>/gi,
    (match, before, url, after) => {
      const local = cssLocalPath(url);
      if (local) return `<link${before}href="${local}"${after}>`;
      return ''; // strip if not locally available
    }
  );

  // 3. Strip any remaining script tags loading from parastorage
  html = html.replace(/<script[^>]*src="https?:\/\/static\.parastorage\.com[^"]*"[^>]*><\/script>/gi, '');
  html = html.replace(/<script[^>]*src="https?:\/\/(?:static|siteassets)\.parastorage\.com[^"]*"[^>]*>[\s\S]*?<\/script>/gi, '');

  // 4. Strip remaining link preloads to parastorage
  html = html.replace(/<link[^>]+href="https?:\/\/static\.parastorage\.com[^"]*"[^>]*(?:rel="preload"[^>]*|as="[^"]*"[^>]*)>/gi, '');
  html = html.replace(/<link[^>]*rel="preload"[^>]*href="https?:\/\/(?:static|siteassets)\.parastorage\.com[^"]*"[^>]*>/gi, '');

  return html;
}

const r = await pool.query(`SELECT id FROM tenants WHERE slug = $1`, ['selfbeauty-demo']);
const tid = r.rows[0].id;
const secs = await pool.query(`SELECT id, settings, (SELECT slug FROM pages WHERE id = sections.page_id) as page_slug FROM sections WHERE tenant_id = $1`, [tid]);

for (const row of secs.rows) {
  const s = row.settings;
  const orig = s.html || '';
  const patched = patchSection(orig);

  // Check remaining external refs
  const remaining = (patched.match(/https?:\/\/(?:static|siteassets)\.parastorage\.com[^"' )\n]*/g) || []);
  const uniqueRemaining = [...new Set(remaining)];

  await pool.query(`UPDATE sections SET settings = $1, updated_at = NOW() WHERE id = $2`, [
    JSON.stringify({ ...s, html: patched }),
    row.id,
  ]);
  console.log(`${row.page_slug}: ${orig.length} → ${patched.length} bytes | remaining ext: ${uniqueRemaining.length}`);
  if (uniqueRemaining.length > 0) {
    uniqueRemaining.slice(0,3).forEach(u => console.log('  -', u.slice(0,80)));
  }
}

await pool.end();
console.log('Done ✅');
