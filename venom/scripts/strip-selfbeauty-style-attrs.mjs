import pg from 'pg';
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

const r = await pool.query(`SELECT id FROM tenants WHERE slug = $1`, ['selfbeauty-demo']);
const tid = r.rows[0].id;
const secs = await pool.query(`SELECT id, settings FROM sections WHERE tenant_id = $1`, [tid]);

for (const row of secs.rows) {
  const s = row.settings;
  let html = s.html || '';

  // Strip data-url and data-href attributes from <style> tags (Wix CSS attribution metadata)
  // These contain parastorage URLs but don't cause network requests
  html = html.replace(/(<style[^>]*)\s+data-url="[^"]*"/gi, '$1');
  html = html.replace(/(<style[^>]*)\s+data-href="[^"]*"/gi, '$1');
  html = html.replace(/(<style[^>]*)\s+data-styled-components[^=]*/gi, '$1');

  // Also strip <meta name="generator" content="Wix...">
  html = html.replace(/<meta[^>]*name="generator"[^>]*content="Wix[^"]*"[^>]*>/gi, '');

  const remaining = (html.match(/parastorage\.com/gi) || []).length;
  await pool.query(`UPDATE sections SET settings = $1, updated_at = NOW() WHERE id = $2`, [
    JSON.stringify({ ...s, html }),
    row.id,
  ]);
  console.log(`Section ${row.id}: parastorage remaining=${remaining}`);
}

await pool.end();
console.log('Done ✅');
