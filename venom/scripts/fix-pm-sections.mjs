import pg from 'pg';
const pool = new pg.Pool({ connectionString: 'postgresql://neondb_owner:npg_RG6Q7owUlpXr@ep-still-recipe-alrqcrzd-pooler.c-3.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require' });

const CSS_URLS = [
  '/clones/praha-masaze/fonts/google-fonts.css',
  '/clones/praha-masaze/wp-includes/css/dist/block-library/style.min.css',
  '/clones/praha-masaze/wp-content/themes/generatepress/assets/css/main.min.css',
  '/clones/praha-masaze/wp-content/themes/prahamasaze/style.css',
];

const JS_URLS = [
  '/clones/praha-masaze/wp-includes/js/jquery/jquery.min.js',
  '/clones/praha-masaze/wp-includes/js/jquery/jquery-migrate.min.js',
  '/clones/praha-masaze/wp-content/themes/generatepress/assets/js/gp-menu.min.js',
  '/clones/praha-masaze/wp-content/themes/prahamasaze/assets/js/main.js',
];

const r = await pool.query(`SELECT id FROM tenants WHERE slug = $1`, ['praha-masaze-demo']);
const tid = r.rows[0].id;
const secs = await pool.query(`SELECT s.id, s.settings, p.slug FROM sections s JOIN pages p ON s.page_id=p.id WHERE s.tenant_id=$1`, [tid]);

for (const row of secs.rows) {
  let s = row.settings;
  let html = s.html || '';

  // Fix any remaining external img refs
  html = html.replace(/src="https?:\/\/(?:www\.)?prahamasaze\.com\/([^"]+)"/g, (_, rel) => {
    const fname = rel.split('/').pop().split('?')[0];
    return `src="/clones/praha-masaze/${rel.split('?')[0]}"`;
  });

  // Strip Complianz markup from body
  html = html.replace(/<div[^>]*(?:cmplz|complianz|cookie)[^>]*>[\s\S]{0,3000}?<\/div>/gi, '');

  // Strip Instagram feed
  html = html.replace(/<div[^>]*(?:sb_instagram|sbi_)[^>]*>[\s\S]{0,2000}?<\/div>/gi, '');

  // Fix social links → #
  html = html.replace(/href="https?:\/\/(?:www\.)?instagram\.com\/[^"]*"/gi, 'href="#"');
  html = html.replace(/href="https?:\/\/(?:www\.)?facebook\.com\/[^"]*"/gi, 'href="#"');
  html = html.replace(/href="https?:\/\/(?:www\.)?tiktok\.com\/[^"]*"/gi, 'href="#"');

  await pool.query(`UPDATE sections SET settings = $1, updated_at = NOW() WHERE id = $2`, [
    JSON.stringify({ ...s, html, cssUrls: CSS_URLS, jsUrls: JS_URLS }),
    row.id,
  ]);

  const extLeft = (html.match(/https?:\/\/(?!ogp\.me|rankmath|w3\.org)[^\s"'<>]+prahamasaze[^\s"'<>]*/gi) || []).length;
  console.log(`${row.slug}: cssUrls fixed ✅ | external prahamasaze refs: ${extLeft}`);
}

await pool.end();
console.log('Done ✅');
