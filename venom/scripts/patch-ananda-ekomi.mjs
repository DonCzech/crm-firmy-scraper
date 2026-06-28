import pg from 'pg';
const pool = new pg.Pool({ connectionString: 'postgresql://neondb_owner:npg_RG6Q7owUlpXr@ep-still-recipe-alrqcrzd-pooler.c-3.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require' });

function removeEkomi(html) {
  // Remove all <style> blocks that contain ekomiapps references
  const parts = html.split('<style');
  const cleaned = parts.map((part, i) => {
    if (i === 0) return part;
    const closeIdx = part.indexOf('</style>');
    if (closeIdx === -1) return '<style' + part;
    const styleContent = part.slice(0, closeIdx);
    if (/ekomiapps|ekomi/i.test(styleContent)) {
      // Remove this entire style block
      return part.slice(closeIdx + 8); // skip </style>
    }
    return '<style' + part;
  });
  html = cleaned.join('');

  // Remove eKomi widget container
  // Find and remove everything between start and end of eKomi div
  let result = html;
  const ekStart = result.search(/(<div[^>]*(?:id="ekw|class="[^"]*ekomi)[^>]*>)/i);
  if (ekStart >= 0) {
    // Find matching closing div (simple depth counter)
    let depth = 0;
    let i = ekStart;
    while (i < result.length) {
      if (result.slice(i, i+4) === '<div') depth++;
      else if (result.slice(i, i+6) === '</div>') {
        depth--;
        if (depth === 0) { result = result.slice(0, ekStart) + result.slice(i + 6); break; }
      }
      i++;
    }
  }

  // Strip any remaining @import from ekomiapps from remaining inline styles
  result = result.replace(/@import url\([^)]*ekomiapps[^)]*\)[^;]*;/gi, '');
  result = result.replace(/#ekw\d+[^{]*\{[^}]*\}/gi, '');

  return result;
}

const r = await pool.query(`SELECT id FROM tenants WHERE slug=$1`, ['ananda-demo']);
const tid = r.rows[0].id;
const secs = await pool.query(`SELECT s.id, s.settings, p.slug FROM sections s JOIN pages p ON s.page_id=p.id WHERE s.tenant_id=$1`, [tid]);

for (const row of secs.rows) {
  const s = row.settings;
  const orig = s.html || '';
  const patched = removeEkomi(orig);
  const ekLeft = (patched.match(/ekomi/gi) || []).length;
  await pool.query(`UPDATE sections SET settings=$1, updated_at=NOW() WHERE id=$2`, [
    JSON.stringify({ ...s, html: patched }),
    row.id,
  ]);
  console.log(`${row.slug}: ${orig.length}→${patched.length}, ekomi_left=${ekLeft}`);
}
await pool.end();
console.log('Done ✅');
