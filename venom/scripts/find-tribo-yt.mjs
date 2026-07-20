import pg from 'pg';
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const r = await pool.query(`SELECT id FROM tenants WHERE slug=$1`, ['tribo-demo']);
const tid = r.rows[0].id;
const s = await pool.query(`SELECT settings->>'html' as html FROM sections s JOIN pages p ON s.page_id=p.id WHERE s.tenant_id=$1 AND p.slug='home'`, [tid]);
const html = s.rows[0].html;
let idx = 0, count = 0;
while ((idx = html.toLowerCase().indexOf('youtube', idx)) >= 0 && count < 5) {
  console.log(`At ${idx}:`, JSON.stringify(html.slice(Math.max(0,idx-30), idx+80)));
  idx += 7; count++;
}
await pool.end();
