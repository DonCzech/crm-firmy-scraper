import pg from 'pg';
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const r = await pool.query(`SELECT id FROM tenants WHERE slug=$1`, ['ananda-demo']);
const s = await pool.query(`SELECT settings->>'html' as html FROM sections s JOIN pages p ON s.page_id=p.id WHERE s.tenant_id=$1 AND p.slug='home'`, [r.rows[0].id]);
const html = s.rows[0].html;
// Find all ekomi refs
let idx = 0;
let found = 0;
while ((idx = html.indexOf('ekomi', idx)) >= 0 && found < 3) {
  console.log(`\nEkomi at ${idx}:`);
  console.log(JSON.stringify(html.slice(Math.max(0,idx-50), idx+100)));
  idx += 5; found++;
}
await pool.end();
