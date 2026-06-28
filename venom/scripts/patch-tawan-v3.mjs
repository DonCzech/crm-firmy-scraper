import pg from 'pg';
const pool = new pg.Pool({ connectionString: 'postgresql://neondb_owner:npg_RG6Q7owUlpXr@ep-still-recipe-alrqcrzd-pooler.c-3.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require' });

function depthRemove(html, startPattern) {
  let result = html;
  const m = result.match(startPattern);
  if (!m) return result;
  const startIdx = result.indexOf(m[0]);
  // Find the opening tag end
  const tagEnd = result.indexOf('>', startIdx) + 1;
  let depth = 1;
  let i = tagEnd;
  while (i < result.length && depth > 0) {
    if (result[i] === '<') {
      if (result.slice(i, i+5) === '</div') { depth--; if(depth===0){ result = result.slice(0, startIdx) + result.slice(i+6); break; } i+=5; continue; }
      else if (result.slice(i).match(/^<div/)) depth++;
    }
    i++;
  }
  return result;
}

function removeCookiebot(html) {
  // Remove all known Cookiebot elements
  const patterns = [
    /<div[^>]*id="CybotCookiebotDialog"[^>]*>/i,
    /<div[^>]*id="CybotCookiebotDialogBodyUnderlay"[^>]*>/i,
    /<div[^>]*id="CookiebotWidget"[^>]*>/i,
    /<div[^>]*id="CybotCookiebotDialogBodyEdge"[^>]*>/i,
  ];
  for (const pattern of patterns) {
    html = depthRemove(html, pattern);
  }

  // Remove IAB v2 placeholders
  html = html.replace(/\[#IABV2[A-Z_]+#\]/g, '');

  // Remove remaining CybotCookiebot inline elements
  html = html.replace(/<[a-z][^>]*class="[^"]*CybotCookiebot[^"]*"[^>]*>[\s\S]{0,500}?<\/[a-z]+>/gi, '');

  // Remove any iframe with cookiebot
  html = html.replace(/<iframe[^>]*(?:cookiebot|consent\.cookiebot)[^>]*>[\s\S]*?<\/iframe>/gi, '');
  html = html.replace(/<iframe[^>]*(?:cookiebot|consent\.cookiebot)[^>]*\/>/gi, '');

  return html;
}

const r = await pool.query(`SELECT id FROM tenants WHERE slug=$1`, ['tawan-demo']);
const tid = r.rows[0].id;
const secs = await pool.query(`SELECT s.id, s.settings, p.slug FROM sections s JOIN pages p ON s.page_id=p.id WHERE s.tenant_id=$1`, [tid]);

for (const row of secs.rows) {
  const s = row.settings;
  let html = s.html || '';
  const origLen = html.length;
  html = removeCookiebot(html);
  const left = (html.match(/CybotCookiebot/gi) || []).length;
  await pool.query(`UPDATE sections SET settings=$1, updated_at=NOW() WHERE id=$2`, [
    JSON.stringify({ ...s, html }),
    row.id,
  ]);
  console.log(`${row.slug}: ${origLen}→${html.length} | CybotCookiebot=${left}`);
}

await pool.end();
console.log('Done ✅');
