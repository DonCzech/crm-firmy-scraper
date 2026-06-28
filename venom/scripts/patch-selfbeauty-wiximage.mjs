import pg from 'pg';
const pool = new pg.Pool({ connectionString: 'postgresql://neondb_owner:npg_RG6Q7owUlpXr@ep-still-recipe-alrqcrzd-pooler.c-3.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require' });

const r = await pool.query(`SELECT id FROM tenants WHERE slug = $1`, ['selfbeauty-demo']);
const tid = r.rows[0].id;
const secs = await pool.query(`SELECT id, settings FROM sections WHERE tenant_id = $1`, [tid]);

for (const row of secs.rows) {
  const s = row.settings;
  let { html, cssUrls = [], jsUrls = [] } = s;

  // Fix remaining wixstatic img src references (different hash pattern)
  html = html.replace(
    /https:\/\/static\.wixstatic\.com\/media\/([a-f0-9]{32,})\.(jpg|jpeg|png|webp)[^"' )\n]*/gi,
    '/clones/selfbeauty/img/$1.$2'
  );

  // Add wix-image polyfill to jsUrls if not already there
  const polyfillUrl = '/clones/selfbeauty/js/wix-image-polyfill.js';
  if (!jsUrls.includes(polyfillUrl)) {
    jsUrls = [...jsUrls, polyfillUrl];
  }

  await pool.query(`UPDATE sections SET settings = $1, updated_at = NOW() WHERE id = $2`, [
    JSON.stringify({ ...s, html, cssUrls, jsUrls }),
    row.id,
  ]);
  const remaining = (html.match(/static\.wixstatic\.com/g) || []).length;
  console.log(`Section ${row.id}: wixstatic remaining=${remaining}`);
}

await pool.end();
console.log('Done ✅');
