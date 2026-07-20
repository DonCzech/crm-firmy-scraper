import pg from 'pg';
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

const r = await pool.query(`SELECT id FROM tenants WHERE slug = $1`, ['selfbeauty-demo']);
const tid = r.rows[0].id;
const secs = await pool.query(`SELECT s.id, s.settings FROM sections s JOIN pages p ON s.page_id = p.id WHERE s.tenant_id = $1 AND p.slug = 'home'`, [tid]);
const row = secs.rows[0];
const html = row.settings.html || '';

// Find remaining parastorage ref
const idx = html.search(/parastorage\.com/i);
if (idx >= 0) {
  console.log('Context:', html.slice(Math.max(0,idx-60), idx+100));
}

// Strip remaining parastorage refs (likely in a data attribute or inline style)
const patched = html
  .replace(/ data-url="[^"]*parastorage[^"]*"/gi, '')
  .replace(/ data-href="[^"]*parastorage[^"]*"/gi, '')
  .replace(/src="[^"]*parastorage[^"]*"/gi, 'src=""')
  .replace(/href="[^"]*parastorage[^"]*"/gi, 'href="#"');

const remaining = (patched.match(/parastorage\.com/gi) || []).length;
console.log('After: remaining =', remaining);

await pool.query(`UPDATE sections SET settings = $1, updated_at = NOW() WHERE id = $2`, [
  JSON.stringify({ ...row.settings, html: patched }),
  row.id,
]);
await pool.end();
console.log('Done ✅');
