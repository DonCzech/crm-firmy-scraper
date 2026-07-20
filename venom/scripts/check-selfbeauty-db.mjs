import pg from 'pg';
const DB_URL = process.env.DATABASE_URL;
const pool = new pg.Pool({ connectionString: DB_URL });

const r = await pool.query(`SELECT id FROM tenants WHERE slug = $1`, ['selfbeauty-demo']);
const tid = r.rows[0].id;
const secs = await pool.query(`SELECT id, settings FROM sections WHERE tenant_id = $1 LIMIT 1`, [tid]);
const row = secs.rows[0];
const s = row.settings;

console.log('cssUrls:', JSON.stringify(s.cssUrls));
console.log('jsUrls:', JSON.stringify(s.jsUrls));

const html = s.html || '';
const parastorageLinkRefs = (html.match(/https?:\/\/(?:static|siteassets)\.parastorage\.com[^"' )\n]*/g) || []);
const wixstaticRefs = (html.match(/https?:\/\/static\.wixstatic\.com[^"' )\n]*/g) || []);

console.log('parastorage refs in html:', parastorageLinkRefs.length);
if (parastorageLinkRefs.length > 0) {
  console.log('Sample:', parastorageLinkRefs.slice(0, 5).join('\n  '));
}
console.log('wixstatic refs in html:', wixstaticRefs.length);

// Look for <link> tags
const links = (html.match(/<link[^>]+href="[^"]*parastorage[^"]*"[^>]*>/g) || []);
console.log('Link tags with parastorage:', links.length);
links.slice(0,3).forEach(l => console.log(' ', l.slice(0,120)));

// Check for CSS-loaded URLs
const localCssFiles = s.cssUrls || [];
console.log('\nLocal CSS files:', localCssFiles.join(', '));

await pool.end();
