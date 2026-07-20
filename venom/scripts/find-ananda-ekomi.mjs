import pg from 'pg';
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const r = await pool.query(`SELECT id FROM tenants WHERE slug=$1`, ['ananda-demo']);
const s = await pool.query(`SELECT settings->>'html' as html FROM sections s JOIN pages p ON s.page_id=p.id WHERE s.tenant_id=$1 AND p.slug='home'`, [r.rows[0].id]);
const html = s.rows[0].html;
const idx = html.search(/ekomi/i);
if (idx >= 0) {
  console.log('eKomi in HTML at:', idx);
  console.log(html.slice(Math.max(0,idx-100), idx+300));
} else {
  console.log('No eKomi in HTML ✅');
}
// Check for external script tags
const extScripts = html.match(/<script[^>]+src="https?:\/\/[^"]*"[^>]*>/gi) || [];
console.log('External scripts:', extScripts.map(s=>s.slice(0,100)));
await pool.end();
