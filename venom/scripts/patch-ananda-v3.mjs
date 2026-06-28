import pg from 'pg';
const pool = new pg.Pool({ connectionString: 'postgresql://neondb_owner:npg_RG6Q7owUlpXr@ep-still-recipe-alrqcrzd-pooler.c-3.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require' });

function patchHtml(html) {
  // Remove inline <style> blocks that contain @import from ekomi
  html = html.replace(/<style[^>]*>(?:[^<]|<(?!\/style))*@import url\(["']?https?:\/\/(?:smart-widget-assets|sw-assets)\.ekomiapps[^<]*<\/style>/gi, '');

  // Remove eKomi widget div
  html = html.replace(/<div[^>]*id="ekw[^"]*"[^>]*>[\s\S]{0,5000}?<\/div>/gi, '');
  html = html.replace(/<div[^>]*class="[^"]*ekomi[^"]*"[^>]*>[\s\S]{0,5000}?<\/div>/gi, '');

  // Remove remaining ekomi @import from any style tag
  html = html.replace(/@import url\(["']?https?:\/\/(?:smart-widget-assets|sw-assets)\.ekomiapps[^;]+;/gi, '');

  // Remove video source if file is too large (25MB) — replace with poster
  html = html.replace(/<source[^>]*home_6_1\.mp4[^>]*>/gi, '');
  html = html.replace(/<video[^>]*>[\s\S]*?<\/video>/gi, (match) => {
    // Keep video tag but remove mp4 source, add a poster image instead
    return '<div style="background:/clones/ananda/img/mobil_1-fIRd8KuI.jpg;background-size:cover;height:400px;"></div>';
  });

  return html;
}

const r = await pool.query(`SELECT id FROM tenants WHERE slug=$1`, ['ananda-demo']);
const tid = r.rows[0].id;
const secs = await pool.query(`SELECT s.id, s.settings, p.slug FROM sections s JOIN pages p ON s.page_id=p.id WHERE s.tenant_id=$1`, [tid]);

for (const row of secs.rows) {
  const s = row.settings;
  const patched = patchHtml(s.html || '');
  const ekomiLeft = (patched.match(/ekomi|ekomiapps/gi) || []).length;
  await pool.query(`UPDATE sections SET settings=$1, updated_at=NOW() WHERE id=$2`, [
    JSON.stringify({ ...s, html: patched }),
    row.id,
  ]);
  console.log(`${row.slug}: ekomi_refs=${ekomiLeft}`);
}
await pool.end();
console.log('Done ✅');
