import pg from 'pg';
const pool = new pg.Pool({ connectionString: 'postgresql://neondb_owner:npg_RG6Q7owUlpXr@ep-still-recipe-alrqcrzd-pooler.c-3.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require' });

function nukeCookiebot(html) {
  // The Cookiebot dialog is at the very start of body.
  // Find the first real site element: <header or <div id="page" or <nav
  const siteStart = html.search(/<(?:header|nav)[^>]*(?:class|id)="[^"]*(?:header|nav|site-header|main-nav|navbar)[^"]*"/i);
  const pageDiv = html.search(/<div[^>]*id="(?:page|wrapper|site-wrapper|main-wrapper)"[^>]*>/i);

  // Also find the first meaningful content divs with site classes
  const contentStart = Math.min(
    siteStart >= 0 ? siteStart : Infinity,
    pageDiv >= 0 ? pageDiv : Infinity,
  );

  if (contentStart > 0 && contentStart < html.length * 0.5) {
    // Everything before this is Cookiebot
    const inlineStyles = (html.match(/<style[^>]*>[\s\S]*?<\/style>/g) || []).join('\n');
    html = inlineStyles + '\n' + html.slice(contentStart);
    console.log(`  Truncated ${contentStart} bytes of Cookiebot from start`);
  } else {
    // Fallback: remove any element with CybotCookiebot in it
    html = html.replace(/<[^>]+CybotCookiebot[^>]+>[\s\S]*?<\/[a-z]+>/gi, '');
  }

  // Remove remaining Cookiebot artifacts
  html = html.replace(/<a[^>]*CybotCookiebot[^>]*>[\s\S]{0,2000}?<\/a>/gi, '');
  html = html.replace(/<svg[^>]*aria-hidden[^>]*>[\s\S]*?<\/svg>/g, (match) => {
    // Remove large SVG blocks (Cookiebot logo SVGs)
    if (match.length > 500) return '';
    return match;
  });
  html = html.replace(/\[#IABV2[A-Z_]+#\]/g, '');

  return html;
}

const r = await pool.query(`SELECT id FROM tenants WHERE slug=$1`, ['tawan-demo']);
const tid = r.rows[0].id;
const secs = await pool.query(`SELECT s.id, s.settings, p.slug FROM sections s JOIN pages p ON s.page_id=p.id WHERE s.tenant_id=$1`, [tid]);

for (const row of secs.rows) {
  const s = row.settings;
  let html = s.html || '';
  const orig = html.length;
  html = nukeCookiebot(html);
  const left = (html.match(/CybotCookiebot/gi) || []).length;
  await pool.query(`UPDATE sections SET settings=$1, updated_at=NOW() WHERE id=$2`, [
    JSON.stringify({ ...s, html }),
    row.id,
  ]);
  console.log(`${row.slug}: ${orig}→${html.length} | remaining=${left}`);
}

await pool.end();
console.log('Done ✅');
