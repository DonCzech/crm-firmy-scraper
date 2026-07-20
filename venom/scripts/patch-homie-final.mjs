import pg from 'pg';
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL, max: 1 });

const r = await pool.query(`SELECT id FROM tenants WHERE slug=$1`, ['homie-demo']);
const tid = r.rows[0].id;
const secs = await pool.query(`SELECT s.id, s.settings, p.slug FROM sections s JOIN pages p ON s.page_id=p.id WHERE s.tenant_id=$1`, [tid]);

for (const row of secs.rows) {
  const s = row.settings;
  let html = s.html || '';

  // Strip WP emoji img tags → replace with alt text
  html = html.replace(/<img[^>]*src="https?:\/\/s\.w\.org\/images\/core\/emoji\/[^"]*"[^>]*alt="([^"]*)"[^>]*\/?>/gi, '$1');

  // Strip Google Maps links → href="#"
  html = html.replace(/href="https?:\/\/(?:goo\.gl\/maps|maps\.app\.goo\.gl|maps\.google)[^"]*"/gi, 'href="#"');
  html = html.replace(/href="https?:\/\/www\.google\.com\/(?:maps|search)[^"]*"/gi, 'href="#"');

  // Strip Facebook pixel noscript img
  html = html.replace(/<img[^>]*src="https?:\/\/www\.facebook\.com\/tr[^"]*"[^>]*\/?>/gi, '');

  // Strip recaptcha iframe src
  html = html.replace(/<iframe[^>]*src="https?:\/\/www\.google\.com\/recaptcha[^"]*"[^>]*>[\s\S]*?<\/iframe>/gi, '');

  // Strip noscript GTM + Facebook pixel blocks
  html = html.replace(/<noscript>[\s\S]*?(?:googletagmanager|facebook\.com\/tr)[^<]*[\s\S]*?<\/noscript>/gi, '');

  // Remove inline GTM obfuscated scripts
  html = html.replace(/<script[^>]*>\s*\(function\(w,d,s,l,i\)[\s\S]*?googletagmanager[\s\S]*?<\/script>/gi, '');

  const extLeft = (html.match(/https?:\/\/(?!(?:demo\.local|schema\.org|w3\.org|fonts\.gstatic|fonts\.googleapis))[a-z0-9.-]+\.[a-z]{2,}/gi) || []).filter(u =>
    !u.includes('clones/') && !u.includes('venom-saas.vercel.app')
  ).length;

  await pool.query(`UPDATE sections SET settings=$1, updated_at=NOW() WHERE id=$2`, [
    JSON.stringify({ ...s, html }), row.id,
  ]);
  console.log(`${row.slug}: ext_refs_remaining=${extLeft}`);
}

await pool.end();
console.log('Done ✅');
