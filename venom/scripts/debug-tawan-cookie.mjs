import pg from 'pg';
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const r = await pool.query(`SELECT id FROM tenants WHERE slug=$1`, ['tawan-demo']);
const s = await pool.query(`SELECT settings->>'html' as html FROM sections s JOIN pages p ON s.page_id=p.id WHERE s.tenant_id=$1 AND p.slug='home'`, [r.rows[0].id]);
const html = s.rows[0].html;
// Find first cookiebot occurrence
const idx = html.toLowerCase().indexOf('cookiebot');
console.log('First cookiebot at:', idx);
console.log('Context:', html.slice(Math.max(0,idx-100), idx+300));
// What tag is it in?
const before = html.slice(Math.max(0,idx-200), idx);
const lastTag = before.match(/<(script|style|div|span)[^>]*>[^<]*$/i);
console.log('Likely in:', lastTag?.[1] || 'unknown');
await pool.end();
