import pg from 'pg';
const DB_URL = process.env.DATABASE_URL;
const pool = new pg.Pool({ connectionString: DB_URL });

const res = await pool.query('SELECT id FROM tenants WHERE slug = $1', ['selfbeauty-demo']);
const tid = res.rows[0].id;
const secs = await pool.query('SELECT id, settings FROM sections WHERE tenant_id = $1', [tid]);

for (const row of secs.rows) {
  const s = row.settings;
  let html = s.html || '';

  // Fix missed wixstatic images (hash-only IDs without mv2 suffix)
  html = html.replace(/https?:\/\/static\.wixstatic\.com\/media\/([a-f0-9]{32})\.jpg[^"' )]*/g, '/clones/selfbeauty/img/$1.jpg');
  html = html.replace(/https?:\/\/static\.wixstatic\.com\/media\/([a-f0-9]{32})\.png[^"' )]*/g, '/clones/selfbeauty/img/$1.png');
  html = html.replace(/https?:\/\/static\.wixstatic\.com\/media\/([a-f0-9]{32})\.jpeg[^"' )]*/g, '/clones/selfbeauty/img/$1.jpeg');

  // Add kill-external.js as first jsUrl
  const jsUrls = ['/clones/selfbeauty/js/kill-external.js', ...(s.jsUrls || []).filter(u => u !== '/clones/selfbeauty/js/kill-external.js')];

  const remaining = (html.match(/static\.wixstatic\.com/g) || []).length;
  const siteassets = (html.match(/siteassets\.parastorage\.com/g) || []).length;
  console.log(`Section ${row.id}: wixstatic=${remaining}, siteassets=${siteassets}`);

  await pool.query('UPDATE sections SET settings = $1, updated_at = NOW() WHERE id = $2', [
    JSON.stringify({ ...s, html, jsUrls }),
    row.id,
  ]);
}
await pool.end();
console.log('Done ✅');
