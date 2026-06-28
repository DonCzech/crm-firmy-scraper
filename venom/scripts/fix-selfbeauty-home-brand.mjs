import pg from 'pg';
const pool = new pg.Pool({ connectionString: 'postgresql://neondb_owner:npg_RG6Q7owUlpXr@ep-still-recipe-alrqcrzd-pooler.c-3.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require' });

const r = await pool.query(`SELECT id FROM tenants WHERE slug = $1`, ['selfbeauty-demo']);
const tid = r.rows[0].id;
const s = await pool.query(`SELECT s.id, s.settings FROM sections s JOIN pages p ON s.page_id = p.id WHERE s.tenant_id = $1 AND p.slug = 'home'`, [tid]);
const row = s.rows[0];

const html = row.settings.html;
const idx = html.indexOf('selfbeautystudio.com');
console.log('Context:', html.slice(Math.max(0,idx-80), idx+80));

// Replace ALL remaining selfbeautystudio.com refs
const patched = html.replace(/selfbeautystudio\.com/gi, 'demo.local');
const remaining = (patched.match(/selfbeautystudio\.com/gi) || []).length;
console.log('After patch: remaining selfbeautystudio.com refs:', remaining);

await pool.query(`UPDATE sections SET settings = $1, updated_at = NOW() WHERE id = $2`, [
  JSON.stringify({ ...row.settings, html: patched }),
  row.id,
]);
await pool.end();
console.log('Done ✅');
