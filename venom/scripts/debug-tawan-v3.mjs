import pg from 'pg';
const pool = new pg.Pool({ connectionString: 'postgresql://neondb_owner:npg_RG6Q7owUlpXr@ep-still-recipe-alrqcrzd-pooler.c-3.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require' });
const r = await pool.query(`SELECT id FROM tenants WHERE slug=$1`, ['tawan-demo']);
const s = await pool.query(`SELECT settings->>'html' as html FROM sections s JOIN pages p ON s.page_id=p.id WHERE s.tenant_id=$1 AND p.slug='home'`, [r.rows[0].id]);
const html = s.rows[0].html;
// First 3 CybotCookiebot
let idx = 0;
let found = 0;
while ((idx = html.indexOf('CybotCookiebot', idx)) >= 0 && found < 3) {
  console.log(`\nAt ${idx}:`, JSON.stringify(html.slice(Math.max(0,idx-80), idx+100)));
  idx += 14; found++;
}
// Also find the Cookiebot logo
const logoIdx = html.search(/cookiebot.*logo|usercentrics/i);
if (logoIdx >= 0) console.log('\nLogo/Usercentrics:', html.slice(Math.max(0,logoIdx-100), logoIdx+200));
await pool.end();
