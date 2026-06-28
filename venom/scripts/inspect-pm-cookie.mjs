import pg from 'pg';
const pool = new pg.Pool({ connectionString: 'postgresql://neondb_owner:npg_RG6Q7owUlpXr@ep-still-recipe-alrqcrzd-pooler.c-3.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require' });
const r = await pool.query(`SELECT id FROM tenants WHERE slug=$1`, ['praha-masaze-demo']);
const s = await pool.query(`SELECT settings->>'html' as html FROM sections s JOIN pages p ON s.page_id=p.id WHERE s.tenant_id=$1 AND p.slug='home'`, [r.rows[0].id]);
const html = s.rows[0].html;
// Find Complianz content
const idx = html.search(/cmplz|Přijmout|Zamítnout|cookie.*accept/i);
if (idx >= 0) {
  console.log('Cookie HTML context:');
  console.log(html.slice(Math.max(0, idx-100), idx+300));
}
// Find all cmplz refs
const matches = [...new Set(html.match(/class="[^"]*cmplz[^"]*"/gi) || [])];
console.log('\nCmplz classes:', matches);
await pool.end();
