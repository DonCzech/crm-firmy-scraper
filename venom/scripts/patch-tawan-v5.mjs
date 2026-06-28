import pg from 'pg';
const pool = new pg.Pool({ connectionString: 'postgresql://neondb_owner:npg_RG6Q7owUlpXr@ep-still-recipe-alrqcrzd-pooler.c-3.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require' });

const r = await pool.query(`SELECT id FROM tenants WHERE slug=$1`, ['tawan-demo']);
const tid = r.rows[0].id;
const secs = await pool.query(`SELECT s.id, s.settings, p.slug FROM sections s JOIN pages p ON s.page_id=p.id WHERE s.tenant_id=$1`, [tid]);

for (const row of secs.rows) {
  const s = row.settings;
  let html = s.html || '';

  // Strip ALL external <script src="..."> tags from HTML (they're in jsUrls)
  html = html.replace(/<script[^>]+src="[^"]*(?:sites\/default\/files|themes\/custom)[^"]*"[^>]*><\/script>/gi, '');

  // Fix the /sites/default/files/js path that's 404-ing (was not rewritten for query-param version)
  html = html.replace(
    /src="\/sites\/default\/files\/js\/(js_[^"?]+)(?:\?[^"]+)?"/gi,
    `src="/clones/tawan/js/$1"`
  );

  // Also download/fix /themes/custom/awesome scripts
  html = html.replace(
    /src="\/themes\/custom\/awesome\/([^"]+)"/gi,
    `src="/clones/tawan/themes/custom/awesome/$1"`
  );

  // Add jQuery init check inline to help $ undefined
  if (!html.includes('jquery-check')) {
    html = html.replace('</head>', `<script id="jquery-check">
window.$ = window.$ || function() { console.warn('jQuery not loaded yet'); };
window.jQuery = window.$;
</script></head>`);
  }

  await pool.query(`UPDATE sections SET settings=$1, updated_at=NOW() WHERE id=$2`, [
    JSON.stringify({ ...s, html }),
    row.id,
  ]);
  console.log(`${row.slug}: ✅ (${html.length} bytes)`);
}

await pool.end();
console.log('Done ✅');
