import pg from 'pg';
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

const r = await pool.query(`SELECT id FROM tenants WHERE slug = $1`, ['selfbeauty-demo']);
const tid = r.rows[0].id;
const secs = await pool.query(`SELECT id, settings FROM sections WHERE tenant_id = $1`, [tid]);

for (const row of secs.rows) {
  const s = row.settings;
  let html = s.html || '';

  // Fix all wixstatic refs including underscore pattern (11062b_...)
  html = html.replace(
    /https?:\/\/static\.wixstatic\.com\/media\/([a-zA-Z0-9_]+\.[a-z]{2,4})[^"' )\n]*/gi,
    (match, fname) => `/clones/selfbeauty/img/${fname}`
  );

  const remaining = (html.match(/static\.wixstatic\.com/g) || []).length;
  if (remaining > 0 || s.html !== html) {
    await pool.query(`UPDATE sections SET settings = $1, updated_at = NOW() WHERE id = $2`, [
      JSON.stringify({ ...s, html }),
      row.id,
    ]);
    console.log(`Section ${row.id}: wixstatic remaining=${remaining} (updated)`);
  } else {
    console.log(`Section ${row.id}: clean ✅`);
  }
}

await pool.end();
console.log('Done ✅');
