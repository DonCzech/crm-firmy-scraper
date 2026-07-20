import pg from 'pg';
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const r = await pool.query(`SELECT id FROM tenants WHERE slug=$1`, ['homie-demo']);
const s = await pool.query(`SELECT settings->>'html' as html FROM sections s JOIN pages p ON s.page_id=p.id WHERE s.tenant_id=$1 AND p.slug='home'`, [r.rows[0].id]);
const html = s.rows[0].html;
const patterns = ['s\\.w\\.org', 'recaptcha', 'clarity\\.ms', 'fbevents', 'facebook\\.net', 'googletagmanager'];
for (const p of patterns) {
  const m = html.match(new RegExp(p, 'gi')) || [];
  if (m.length) {
    const idx = html.search(new RegExp(p, 'i'));
    console.log(`${p}: ${m.length} refs. Context:`, html.slice(Math.max(0,idx-50), idx+80));
  }
}
await pool.end();
