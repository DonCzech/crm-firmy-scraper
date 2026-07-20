import pg from 'pg';
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

const COOKIE_KILL = `<style>
/* Kill Complianz + any cookie bars */
.cmplz-cookiebanner,.cmplz-overlay,.cmplz-cookie-notice,
#cmplz-cookiebanner-container,.cookie-bar,.cookie-notice,
[class*="cmplz"],[id*="cmplz"],[class*="cookie-bar"],
.pum-overlay,.pum-container{display:none!important;visibility:hidden!important;opacity:0!important;pointer-events:none!important}
body{overflow:auto!important}
</style>`;

const r = await pool.query(`SELECT id FROM tenants WHERE slug=$1`, ['praha-masaze-demo']);
const tid = r.rows[0].id;
const secs = await pool.query(`SELECT s.id, s.settings, p.slug FROM sections s JOIN pages p ON s.page_id=p.id WHERE s.tenant_id=$1`, [tid]);

for (const row of secs.rows) {
  const s = row.settings;
  let html = s.html || '';

  // Inject kill CSS right after <head> if not already there
  if (!html.includes('Kill Complianz')) {
    html = html.replace('<head>', '<head>' + COOKIE_KILL);
  }

  // Also remove cookie HTML elements from body
  html = html.replace(/<div[^>]*id="cmplz-cookiebanner-container"[^>]*>[\s\S]*?<\/div>/gi, '');
  html = html.replace(/<div[^>]*class="[^"]*cmplz-cookiebanner[^"]*"[^>]*>[\s\S]{0,2000}?<\/div>/gi, '');
  // Remove Complianz overlay div
  html = html.replace(/<div[^>]*class="[^"]*cmplz-overlay[^"]*"[^>]*><\/div>/gi, '');

  await pool.query(`UPDATE sections SET settings=$1, updated_at=NOW() WHERE id=$2`, [
    JSON.stringify({ ...s, html }),
    row.id,
  ]);
  console.log(`${row.slug} ✅`);
}
await pool.end();
console.log('Done ✅');
