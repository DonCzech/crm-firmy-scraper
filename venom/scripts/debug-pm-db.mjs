import pg from 'pg';
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

const r = await pool.query(`SELECT id FROM tenants WHERE slug = $1`, ['praha-masaze-demo']);
const tid = r.rows[0].id;
const secs = await pool.query(`SELECT s.id, s.settings, p.slug FROM sections s JOIN pages p ON s.page_id=p.id WHERE s.tenant_id=$1`, [tid]);

for (const row of secs.rows) {
  const s = row.settings;
  const html = s.html || '';
  console.log(`\n=== ${row.slug} (section ${row.id}) ===`);
  console.log('HTML length:', html.length);
  console.log('cssUrls:', JSON.stringify(s.cssUrls));
  console.log('jsUrls:', JSON.stringify(s.jsUrls?.slice(0,4)));
  // Check for external refs
  const ext = [...new Set((html.match(/https?:\/\/(?!localhost)[^"' \n)]+/g) || []))];
  console.log('External refs:', ext.length);
  ext.slice(0,5).forEach(u => console.log(' -', u.slice(0,90)));
  // Check if local paths exist
  const localCss = (html.match(/\/clones\/[^"' )]+\.css/g) || []);
  console.log('Local CSS refs in HTML:', localCss.length, localCss.slice(0,3));
}

await pool.end();
