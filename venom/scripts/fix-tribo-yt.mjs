import pg from 'pg';
const pool = new pg.Pool({ connectionString: 'postgresql://neondb_owner:npg_RG6Q7owUlpXr@ep-still-recipe-alrqcrzd-pooler.c-3.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require' });
const r = await pool.query(`SELECT id FROM tenants WHERE slug=$1`, ['tribo-demo']);
const tid = r.rows[0].id;
const secs = await pool.query(`SELECT s.id, s.settings, p.slug FROM sections s JOIN pages p ON s.page_id=p.id WHERE s.tenant_id=$1`, [tid]);
for (const row of secs.rows) {
  const s = row.settings;
  let html = s.html || '';
  // Remove ALL YouTube/video trigger data attributes
  html = html.replace(/\s*data-cover-video(?:-id)?="[^"]*"/gi, '');
  html = html.replace(/\s*data-youtube(?:-id)?="[^"]*"/gi, '');
  html = html.replace(/\s*data-video="[^"]*(?:youtube|youtu\.be)[^"]*"/gi, '');
  await pool.query(`UPDATE sections SET settings=$1, updated_at=NOW() WHERE id=$2`, [
    JSON.stringify({ ...s, html }), row.id,
  ]);
  const ytLeft = (html.match(/youtube/gi) || []).length;
  console.log(`${row.slug}: youtube refs=${ytLeft}`);
}
await pool.end();
console.log('Done ✅');
