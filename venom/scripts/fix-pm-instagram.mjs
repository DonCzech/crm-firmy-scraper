import pg from 'pg';
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

function removeInstagram(html) {
  // Remove ALL sbi / instagram-feed divs — walk and remove depth
  // Strategy: remove any element containing sb_instagram or sbi_ class names
  // Also remove SVG elements that are huge (from the instagram plugin)

  // Remove sb_instagram containers (any depth)
  html = html.replace(/<div[^>]*class="[^"]*(?:sb_instagram|sbi_|instagram-feed)[^"]*"[^>]*>[\s\S]*?(?=<div[^>]*class="[^"]*(?:wp-block|entry|site|footer|header|nav|menu|section-|masaze|container|row|col)[^"]*"|<\/body>)/gi, '');

  // More aggressive: remove the entire section that has "Sledujte" or "Instagram"
  html = html.replace(/<section[^>]*>(?:(?!<\/section>)[\s\S])*?(?:Sledujte n[áa]s na Instagramu|sb_instagram|sbi_)[\s\S]*?<\/section>/gi, '');

  // Remove any wp-block-group containing instagram
  html = html.replace(/<div[^>]*wp-block-group[^"]*"[^>]*>(?:(?!<\/div>)[\s\S])*?(?:sb_instagram|sbi_|instagram-feed)[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/gi, '');

  // Remove SVG play icons from Instagram plugin (they have specific class patterns)
  html = html.replace(/<svg[^>]*class="[^"]*(?:sbi|sb-icon|play)[^"]*"[^>]*>[\s\S]*?<\/svg>/gi, '');

  // Remove any <svg> that is fullscreen (the 1280x1463 ones)
  // They appear as standalone SVGs with specific viewBox patterns from SBI
  html = html.replace(/<svg[^>]*viewBox="0 0 50[0-9] [0-9]+"[^>]*>[\s\S]*?<\/svg>/gi, '');

  // Final sweep: remove any div with sbi in ID
  html = html.replace(/<div[^>]*id="[^"]*sbi[^"]*"[^>]*>[\s\S]*?<\/div>/gi, '');

  // Remove remaining instagram webp img tags
  html = html.replace(/<img[^>]*sb-instagram-feed-images[^>]*>/gi, '');
  html = html.replace(/<img[^>]*_nlow\.webp[^>]*>/gi, '');
  html = html.replace(/<a[^>]*><img[^>]*(?:nlow|instagram)[^>]*><\/a>/gi, '');

  return html;
}

const r = await pool.query(`SELECT id FROM tenants WHERE slug=$1`, ['praha-masaze-demo']);
const tid = r.rows[0].id;
const secs = await pool.query(`SELECT s.id, s.settings, p.slug FROM sections s JOIN pages p ON s.page_id=p.id WHERE s.tenant_id=$1`, [tid]);

for (const row of secs.rows) {
  const s = row.settings;
  const orig = s.html || '';
  const patched = removeInstagram(orig);

  // Count remaining instagram refs
  const igLeft = (patched.match(/sb_instagram|sbi_|instagram-feed|_nlow\.webp/gi) || []).length;
  const svgLeft = (patched.match(/<svg/gi) || []).length;

  await pool.query(`UPDATE sections SET settings=$1, updated_at=NOW() WHERE id=$2`, [
    JSON.stringify({ ...s, html: patched }),
    row.id,
  ]);
  console.log(`${row.slug}: instagram refs=${igLeft}, svgs=${svgLeft}, ${orig.length}→${patched.length} bytes`);
}

await pool.end();
console.log('Done ✅');
