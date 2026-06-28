import pg from 'pg';
const pool = new pg.Pool({ connectionString: 'postgresql://neondb_owner:npg_RG6Q7owUlpXr@ep-still-recipe-alrqcrzd-pooler.c-3.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require' });

const r = await pool.query(`SELECT id FROM tenants WHERE slug = $1`, ['selfbeauty-demo']);
const tid = r.rows[0].id;
const secs = await pool.query(`
  SELECT s.settings->>'html' as html, p.slug as page_slug
  FROM sections s JOIN pages p ON s.page_id = p.id
  WHERE s.tenant_id = $1
`, [tid]);

const BRAND_PATTERNS = [
  { name: 'real phone', re: /720[\s-]?014|720[\s-]?314/gi },
  { name: 'real email', re: /@selfbeautystudio\.com/gi },
  { name: 'brand domain (visible)', re: /selfbeautystudio\.com(?![\w_])/gi },
  { name: 'external wixstatic', re: /https?:\/\/static\.wixstatic\.com/gi },
  { name: 'external parastorage', re: /https?:\/\/(?:static|siteassets)\.parastorage\.com.*?(?=["' )])/gi },
];

let allClean = true;
for (const row of secs.rows) {
  const html = row.html || '';
  const issues = [];
  for (const pat of BRAND_PATTERNS) {
    const matches = html.match(pat.re) || [];
    if (matches.length > 0) issues.push(`${pat.name}: ${matches.length}`);
  }
  const status = issues.length === 0 ? '✅ CLEAN' : '⚠️  ' + issues.join(', ');
  console.log(`${row.page_slug}: ${status}`);
  if (issues.length > 0) allClean = false;
}

console.log('\nBrand audit:', allClean ? 'PASS ✅' : 'FAIL ⚠️');
await pool.end();
