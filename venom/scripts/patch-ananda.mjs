import pg from 'pg';
const pool = new pg.Pool({ connectionString: 'postgresql://neondb_owner:npg_RG6Q7owUlpXr@ep-still-recipe-alrqcrzd-pooler.c-3.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require' });

const CSS_URLS = [
  '/clones/ananda/css/swiper-bundle.min.css',
  '/clones/ananda/css/app-pR6ImjcH.css',
];
const JS_URLS = [
  '/clones/ananda/js/swiper-bundle.min.js',
  '/clones/ananda/js/app-CAiCLEjY.js',
];

const SWIPER_INIT = `<script>
document.addEventListener('DOMContentLoaded', function() {
  // Init all Swiper instances found on page
  document.querySelectorAll('.swiper:not(.swiper-initialized)').forEach(function(el) {
    const opts = {
      loop: true, autoplay: { delay: 5000, disableOnInteraction: false },
      pagination: { el: el.querySelector('.swiper-pagination'), clickable: true },
      navigation: { nextEl: el.querySelector('.swiper-button-next'), prevEl: el.querySelector('.swiper-button-prev') },
    };
    new Swiper(el, opts);
  });
});
</script>`;

function patchHtml(html) {
  // Fix font URL — build/assets/font → local
  html = html.replace(/\/build\/assets\/font-CX8Z7V2Y\.woff2/g, '/clones/ananda/fonts/font-CX8Z7V2Y.woff2');
  // Fix SVG paths
  html = html.replace(/\/build\/assets\/Subtraction%202-C8EL6biz\.svg/g, '/clones/ananda/img/Subtraction 2-C8EL6biz.svg');
  html = html.replace(/\/assets\/images\/home\/new\/Path%201294\.svg/g, '/clones/ananda/img/Path 1294.svg');
  html = html.replace(/\/assets\/images\/hotels\/9_cosmopolitan-logo-color\.jpg/g, '/clones/ananda/img/9_cosmopolitan-logo-color.jpg');
  // Fix all remaining /build/assets/ paths → local img
  html = html.replace(/\/build\/assets\/([^"' )\n]+)/g, '/clones/ananda/img/$1');
  // Fix remaining /assets/images/ paths
  html = html.replace(/\/assets\/images\/([^"' )\n]+)/g, '/clones/ananda/img/$1');

  // Remove Livewire (requires Laravel backend)
  html = html.replace(/<script[^>]*livewire[^>]*>[\s\S]*?<\/script>/gi, '');
  html = html.replace(/<script[^>]*src="\/livewire[^"]*"[^>]*><\/script>/gi, '');

  // Remove eKomi widget
  html = html.replace(/<div[^>]*(?:ekomi|eKomi|review-widget)[^>]*>[\s\S]{0,2000}?<\/div>/gi, '');
  html = html.replace(/<script[^>]*ekomi[^>]*>[\s\S]*?<\/script>/gi, '');

  // Remove cookie consent (initCookieConsent)
  html = html.replace(/<script[^>]*(?:cookieconsent|cookie-consent|CookieConsent)[^>]*>[\s\S]*?<\/script>/gi, '');
  html = html.replace(/initCookieConsent\([^)]*\)/g, '');

  // Kill cookie overlay CSS
  if (!html.includes('cookie-kill')) {
    html = html.replace('</head>', `<style id="cookie-kill">
      [class*="cookie"],[id*="cookie"],[class*="consent"],[id*="consent"],
      .cc-window,.cc-banner{display:none!important}
    </style></head>`);
  }

  // Inject Swiper init
  if (!html.includes('swiper-initialized-script')) {
    html = html.replace('</body>', `<script id="swiper-initialized-script">
document.addEventListener('DOMContentLoaded',function(){
  if(typeof Swiper==='undefined')return;
  document.querySelectorAll('.swiper:not(.swiper-initialized)').forEach(function(el){
    new Swiper(el,{loop:true,autoplay:{delay:5000,disableOnInteraction:false},
      pagination:{el:el.querySelector('.swiper-pagination'),clickable:true},
      navigation:{nextEl:el.querySelector('.swiper-button-next'),prevEl:el.querySelector('.swiper-button-prev')}});
  });
});
</script></body>`);
  }

  return html;
}

const r = await pool.query(`SELECT id FROM tenants WHERE slug=$1`, ['ananda-demo']);
const tid = r.rows[0].id;
const secs = await pool.query(`SELECT s.id, s.settings, p.slug FROM sections s JOIN pages p ON s.page_id=p.id WHERE s.tenant_id=$1`, [tid]);

for (const row of secs.rows) {
  const s = row.settings;
  const patched = patchHtml(s.html || '');
  await pool.query(`UPDATE sections SET settings=$1, updated_at=NOW() WHERE id=$2`, [
    JSON.stringify({ ...s, html: patched, cssUrls: CSS_URLS, jsUrls: JS_URLS }),
    row.id,
  ]);
  const ext = (patched.match(/https?:\/\/(?!localhost)[^\s"'<>]*anandaspa[^\s"'<>]*/gi) || []).length;
  console.log(`${row.slug}: ${patched.length} bytes | anandaspa: ${ext}`);
}

await pool.end();
console.log('Done ✅');
