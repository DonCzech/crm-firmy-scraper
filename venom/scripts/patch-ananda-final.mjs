import pg from 'pg';
const pool = new pg.Pool({ connectionString: 'postgresql://neondb_owner:npg_RG6Q7owUlpXr@ep-still-recipe-alrqcrzd-pooler.c-3.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require' });

// Also: brand scrub (FÁZE 3-5 inline)
const BRAND_REPLACEMENTS = [
  [/Ananda\s+SPA(?!\s*Demo)/gi, 'Demo Ananda SPA'],
  [/anandaspa\.cz/gi, 'demo.local'],
  [/info@anandaspa\.cz/gi, 'info@demo.local'],
  [/reservations@anandaspa\.cz/gi, 'rezervace@demo.local'],
  [/\+420\s*\d{3}\s*\d{3}\s*\d{3}/g, '+420 608 288 777'],
  [/Korunní\s+\d+[^<,]{0,30}Praha\s*\d*/gi, 'Demo ulice 12, Praha 2'],
];

function patch(html) {
  // 1. Remove eKomi logo img + surrounding link
  html = html.replace(/<a[^>]*ekomi\.cz[^>]*>[\s\S]{0,500}?<\/a>/gi, '');
  html = html.replace(/<img[^>]*ekomiapps[^>]*>/gi, '');
  html = html.replace(/<img[^>]*ekomi[^>]*>/gi, '');
  html = html.replace(/<a[^>]*ekomi[^>]*>[\s\S]{0,200}?<\/a>/gi, '');

  // 2. Remove eKomi stars image
  html = html.replace(/<img[^>]*(?:ekomi|stars-grey)[^>]*>/gi, '');

  // 3. Strip any @import from ekomiapps (belt+suspenders)
  html = html.replace(/@import url\([^)]*ekomiapps[^)]*\)[^;]*;/gi, '');

  // 4. Brand scrub
  for (const [pattern, replacement] of BRAND_REPLACEMENTS) {
    html = html.replace(pattern, replacement);
  }

  // 5. Social links → #
  html = html.replace(/href="https?:\/\/(?:www\.)?(?:instagram|facebook|youtube|twitter|tiktok)\.com\/[^"]*"/gi, 'href="#"');

  return html;
}

const r = await pool.query(`SELECT id FROM tenants WHERE slug=$1`, ['ananda-demo']);
const tid = r.rows[0].id;
const secs = await pool.query(`SELECT s.id, s.settings, p.slug FROM sections s JOIN pages p ON s.page_id=p.id WHERE s.tenant_id=$1`, [tid]);

for (const row of secs.rows) {
  const s = row.settings;
  const patched = patch(s.html || '');
  const ekLeft = (patched.match(/smart-widget-assets\.ekomiapps/gi) || []).length;
  const brandLeft = (patched.match(/anandaspa\.cz/gi) || []).length;
  await pool.query(`UPDATE sections SET settings=$1, updated_at=NOW() WHERE id=$2`, [
    JSON.stringify({ ...s, html: patched }),
    row.id,
  ]);
  console.log(`${row.slug}: ekomi_ext=${ekLeft} brand=${brandLeft}`);
}

await pool.end();
console.log('Done ✅');
