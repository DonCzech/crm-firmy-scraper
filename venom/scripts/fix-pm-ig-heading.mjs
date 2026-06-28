import pg from 'pg';
const pool = new pg.Pool({ connectionString: 'postgresql://neondb_owner:npg_RG6Q7owUlpXr@ep-still-recipe-alrqcrzd-pooler.c-3.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require' });

const r = await pool.query(`SELECT id FROM tenants WHERE slug=$1`, ['praha-masaze-demo']);
const tid = r.rows[0].id;
const secs = await pool.query(`SELECT s.id, s.settings, p.slug FROM sections s JOIN pages p ON s.page_id=p.id WHERE s.tenant_id=$1`, [tid]);

for (const row of secs.rows) {
  const s = row.settings;
  let html = s.html || '';

  // Remove the "Sledujte nás na Instagramu" heading + surrounding section
  html = html.replace(/<[a-z]+[^>]*>\s*Sledujte n[áa]s na Instagramu\s*<\/[a-z]+>/gi, '');
  html = html.replace(/<p[^>]*>\s*@[a-zA-Z0-9._]+\s*<\/p>/gi, ''); // Remove @handle

  // Remove remaining sbi/instagram class attributes
  html = html.replace(/ class="[^"]*(?:sbi|sb_instagram|instagram)[^"]*"/gi, '');

  // Strip Complianz cookie button (ensure gone)
  html = html.replace(/<button[^>]*(?:cmplz|cookie)[^>]*>[\s\S]{0,200}?<\/button>/gi, '');
  html = html.replace(/<div[^>]*(?:cmplz|cookie-bar)[^>]*>[\s\S]{0,500}?<\/div>/gi, '');

  const igLeft = (html.match(/sb_instagram|sbi_|instagram/gi) || []).length;
  await pool.query(`UPDATE sections SET settings=$1, updated_at=NOW() WHERE id=$2`, [
    JSON.stringify({ ...s, html }),
    row.id,
  ]);
  console.log(`${row.slug}: instagram refs=${igLeft}`);
}
await pool.end();
console.log('Done ✅');
