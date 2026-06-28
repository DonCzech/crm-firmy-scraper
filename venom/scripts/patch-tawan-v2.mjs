import pg from 'pg';
const pool = new pg.Pool({ connectionString: 'postgresql://neondb_owner:npg_RG6Q7owUlpXr@ep-still-recipe-alrqcrzd-pooler.c-3.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require' });

function removeByStyleSplit(html, keyword) {
  // Remove <style> blocks containing keyword
  const parts = html.split('<style');
  const result = parts.map((part, i) => {
    if (i === 0) return part;
    const closeIdx = part.indexOf('</style>');
    if (closeIdx === -1) return '<style' + part;
    const content = part.slice(0, closeIdx);
    if (new RegExp(keyword, 'i').test(content)) return part.slice(closeIdx + 8);
    return '<style' + part;
  });
  return result.join('');
}

function removeByScriptSplit(html, keyword) {
  // Remove <script> blocks containing keyword
  const parts = html.split('<script');
  const result = parts.map((part, i) => {
    if (i === 0) return part;
    const closeIdx = part.indexOf('</script>');
    if (closeIdx === -1) return '<script' + part;
    const content = part.slice(0, closeIdx);
    if (new RegExp(keyword, 'i').test(content)) return part.slice(closeIdx + 9);
    return '<script' + part;
  });
  return result.join('');
}

const r = await pool.query(`SELECT id FROM tenants WHERE slug=$1`, ['tawan-demo']);
const tid = r.rows[0].id;
const secs = await pool.query(`SELECT s.id, s.settings, p.slug FROM sections s JOIN pages p ON s.page_id=p.id WHERE s.tenant_id=$1`, [tid]);

for (const row of secs.rows) {
  const s = row.settings;
  let html = s.html || '';
  const origLen = html.length;

  // Remove all Cookiebot style blocks
  html = removeByStyleSplit(html, 'CybotCookiebot');
  html = removeByStyleSplit(html, 'cookieconsent');

  // Remove all Cookiebot script blocks
  html = removeByScriptSplit(html, 'CookieConsent');
  html = removeByScriptSplit(html, 'Cookiebot');

  // Remove dialog HTML div
  let depth = 0;
  const dialIdx = html.search(/<div[^>]*id="CybotCookiebotDialog"/i);
  if (dialIdx >= 0) {
    let i = dialIdx;
    while (i < html.length) {
      if (html.slice(i, i+4) === '<div') depth++;
      else if (html.slice(i, i+6) === '</div>') { depth--; if(depth===0){html=html.slice(0,dialIdx)+html.slice(i+6);break;} }
      i++;
    }
  }

  // Remove IABV2 placeholder text
  html = html.replace(/\[#IABV2_BODY_INTRO#\][\s\S]*$/g, '');

  const cookieLeft = (html.match(/CybotCookiebot/gi) || []).length;
  await pool.query(`UPDATE sections SET settings=$1, updated_at=NOW() WHERE id=$2`, [
    JSON.stringify({ ...s, html }),
    row.id,
  ]);
  console.log(`${row.slug}: ${origLen}→${html.length}, CybotCookiebot=${cookieLeft}`);
}

await pool.end();
console.log('Done ✅');
