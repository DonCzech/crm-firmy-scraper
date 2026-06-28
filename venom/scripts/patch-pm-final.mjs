import pg from 'pg';
const pool = new pg.Pool({ connectionString: 'postgresql://neondb_owner:npg_RG6Q7owUlpXr@ep-still-recipe-alrqcrzd-pooler.c-3.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require' });

const CSS_URLS = [
  '/clones/praha-masaze/fonts/google-fonts.css',
  '/clones/praha-masaze/wp-includes/css/dist/block-library/style.min.css',
  '/clones/praha-masaze/wp-content/themes/generatepress/assets/css/main.min.css',
  '/clones/praha-masaze/wp-content/themes/prahamasaze/style.css',
  '/clones/praha-masaze/css/slick.min.css',
  '/clones/praha-masaze/css/slick-theme.min.css',
];

const JS_URLS = [
  '/clones/praha-masaze/wp-includes/js/jquery/jquery.min.js',
  '/clones/praha-masaze/wp-includes/js/jquery/jquery-migrate.min.js',
  '/clones/praha-masaze/wp-content/themes/generatepress/assets/js/gp-menu.min.js',
  '/clones/praha-masaze/js/slick.min.js',
  '/clones/praha-masaze/wp-content/themes/prahamasaze/assets/js/main.js',
];

function patchHtml(html) {
  // 1. Hide Complianz cookie banner with CSS override
  html = html.replace('</head>', `<style>
    .cmplz-cookiebanner,.cmplz-overlay,.cmplz-cookie-notice,.cookie-notice-container{display:none!important}
    #cmplz-cookiebanner-container{display:none!important}
  </style></head>`);

  // 2. Remove Instagram feed section entirely (dynamic plugin, no static content)
  html = html.replace(/<section[^>]*(?:instagram|sb-instagram|sbi)[^>]*>[\s\S]{0,5000}?<\/section>/gi, '');
  html = html.replace(/<div[^>]*(?:sb_instagram|sbi_instagram|instagram-feed)[^>]*>[\s\S]{0,3000}?<\/div>/gi, '');

  // 3. Remove Complianz cookie HTML blocks
  html = html.replace(/<div[^>]*id="cmplz[^"]*"[^>]*>[\s\S]{0,3000}?<\/div>/gi, '');

  // 4. Initialize Slick carousels — inject at end of body
  const slickInit = `<script>
(function() {
  function initSliders() {
    if (typeof jQuery === 'undefined' || typeof jQuery.fn.slick === 'undefined') {
      setTimeout(initSliders, 300); return;
    }
    jQuery('.masaze-slider, .wp-block-group.is-style-slider, [class*="slider"]:not([class*="nav"])').each(function() {
      if (!jQuery(this).hasClass('slick-initialized')) {
        jQuery(this).slick({ dots: true, arrows: true, autoplay: true, autoplaySpeed: 4000, adaptiveHeight: true });
      }
    });
    // Fix slick arrow visibility
    jQuery('<style>.slick-prev,.slick-next{z-index:10;width:40px;height:40px}</style>').appendTo('head');
  }
  document.addEventListener('DOMContentLoaded', initSliders);
  setTimeout(initSliders, 1000);
})();
</script>`;
  html = html.replace('</body>', slickInit + '</body>');

  return html;
}

const r = await pool.query(`SELECT id FROM tenants WHERE slug = $1`, ['praha-masaze-demo']);
const tid = r.rows[0].id;
const secs = await pool.query(`SELECT s.id, s.settings, p.slug FROM sections s JOIN pages p ON s.page_id=p.id WHERE s.tenant_id=$1`, [tid]);

for (const row of secs.rows) {
  const s = row.settings;
  const patched = patchHtml(s.html || '');
  await pool.query(`UPDATE sections SET settings=$1, updated_at=NOW() WHERE id=$2`, [
    JSON.stringify({ ...s, html: patched, cssUrls: CSS_URLS, jsUrls: JS_URLS }),
    row.id,
  ]);
  console.log(`${row.slug}: patched ✅ (${patched.length} bytes)`);
}

await pool.end();
console.log('Done ✅');
