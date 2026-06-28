import pg from 'pg';
const pool = new pg.Pool({ connectionString: 'postgresql://neondb_owner:npg_RG6Q7owUlpXr@ep-still-recipe-alrqcrzd-pooler.c-3.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require' });

const r = await pool.query(`SELECT id FROM tenants WHERE slug = $1`, ['selfbeauty-demo']);
const s = await pool.query(`SELECT settings->>'html' as html FROM sections WHERE tenant_id = $1 LIMIT 1`, [r.rows[0].id]);
const html = s.rows[0].html;

const refs = [...new Set((html.match(/https?:\/\/(?:static|siteassets)\.parastorage\.com[^"' \n)]+/g) || []))];
console.log('Unique remaining parastorage refs:', refs.length);
refs.forEach(r => console.log(' -', r.slice(0, 120)));

// Also check what HTML element each ref appears in
for (const ref of refs.slice(0, 3)) {
  const idx = html.indexOf(ref);
  if (idx >= 0) {
    console.log('\nContext for:', ref.slice(0,60));
    console.log(html.slice(Math.max(0, idx-100), idx+120));
  }
}

await pool.end();
