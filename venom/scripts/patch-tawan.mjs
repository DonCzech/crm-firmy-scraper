import pg from 'pg';
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

const SLUG = 'tawan';

const CSS_URLS = [
  `/clones/${SLUG}/sites/default/files/css/css_0qt5IFFJLUJvgYP4HwfCRWJCjFFWcBV2RDDd2Jz-_0k.css`,
  `/clones/${SLUG}/sites/default/files/css/css_Zii9lMIONbcVnTAoUqv5rUlypnN_NbHgRFLUR5iyQ94.css`,
  `/clones/${SLUG}/sites/default/files/css/css_FP7nYDeYm7XL-V28ZefU8T8pLQRQGkGv9k8Kt5wnaVE.css`,
  `/clones/${SLUG}/css/aos.css`,
  `/clones/${SLUG}/css/selectize.css`,
];

const JS_URLS = [
  `/clones/${SLUG}/js/jquery-3.7.1.min.js`,          // jQuery FIRST
  `/clones/${SLUG}/js/js_36AmUJGmxQdGMBFl8HljBCsNg4tVY2oAjz-WuAtkwWk.js`,
  `/clones/${SLUG}/js/js_Z1X_zXA40t8jKeqOUKWZ5fEoddnPAh-Pog-sBgkY8_w.js`,
  `/clones/${SLUG}/js/js_dAxcr5tLpfzVGUK9DoaAQhZdToVPWXm31ol_UzqemD8.js`,
  `/clones/${SLUG}/js/js_xnGlrawGddq4lWCNvvUKUuxCaJokRSqqp7pZKr7OZgM.js`,
  `/clones/${SLUG}/js/owl.carousel.js`,
  `/clones/${SLUG}/js/jquery.paroller.min.js`,
  `/clones/${SLUG}/js/aos.js`,
];

// Brand scrub + demo content
const BRAND_MAP = [
  [/TAWAN(?!\s+Demo)/g, 'TAWAN Demo'],
  [/tawan\.cz/gi, 'demo.local'],
  [/info@tawan\.cz/gi, 'info@demo.local'],
  [/rezervace@tawan\.cz/gi, 'rezervace@demo.local'],
  [/\+420\s*\d{3}\s*\d{3}\s*\d{3}/g, '+420 608 288 777'],
  // Prague addresses
  [/(?:Mánesova|Korunní|Vinohradská|Náměstí Míru)\s+\d+[^<,]{0,30}Praha\s*\d*/gi, 'Demo ulice 12, Praha 2'],
];

function patchHtml(html) {
  // 1. Remove Cookiebot consent modal HTML (raw text issue)
  html = html.replace(/<div[^>]*id="CybotCookiebotDialog[^"]*"[^>]*>[\s\S]*?<\/div>/gi, '');
  html = html.replace(/<div[^>]*class="[^"]*CybotCookiebot[^"]*"[^>]*>[\s\S]{0,8000}?<\/div>/gi, '');
  html = html.replace(/\[#IABV2_BODY_INTRO#\][\s\S]{0,3000}?(?=<div|$)/g, '');
  // Remove Cookiebot overlay and backdrop
  html = html.replace(/<div[^>]*id="CookiebotWidget[^"]*"[^>]*>[\s\S]*?<\/div>/gi, '');

  // 2. Remove Cookiebot script and link references remaining
  html = html.replace(/<script[^>]*cookiebot[^>]*>[\s\S]*?<\/script>/gi, '');
  html = html.replace(/<link[^>]*cookiebot[^>]*>/gi, '');
  html = html.replace(/<script[^>]*cookiebot[^>]*><\/script>/gi, '');

  // 3. Fix /themes/custom/awesome/ paths
  html = html.replace(/\/themes\/custom\/awesome\//g, `/clones/${SLUG}/themes/custom/awesome/`);

  // 4. Brand scrub
  for (const [pattern, replacement] of BRAND_MAP) {
    html = html.replace(pattern, replacement);
  }

  // 5. Kill cookie CSS
  if (!html.includes('cookiebot-kill')) {
    html = html.replace('</head>', `<style id="cookiebot-kill">
      #CybotCookiebotDialog,#CookiebotWidget,.CybotCookiebot,
      [id*="Cookiebot"],[class*="CybotCookiebot"],
      #cookiebanner,.cookie-notice{display:none!important}
    </style></head>`);
  }

  return html;
}

const r = await pool.query(`SELECT id FROM tenants WHERE slug=$1`, ['tawan-demo']);
const tid = r.rows[0].id;
const secs = await pool.query(`SELECT s.id, s.settings, p.slug FROM sections s JOIN pages p ON s.page_id=p.id WHERE s.tenant_id=$1`, [tid]);

for (const row of secs.rows) {
  const s = row.settings;
  const patched = patchHtml(s.html || '');
  const cookieLeft = (patched.match(/CybotCookiebot|cookiebot/gi) || []).length;
  const tawanLeft = (patched.match(/tawan\.cz/gi) || []).length;
  await pool.query(`UPDATE sections SET settings=$1, updated_at=NOW() WHERE id=$2`, [
    JSON.stringify({ ...s, html: patched, cssUrls: CSS_URLS, jsUrls: JS_URLS }),
    row.id,
  ]);
  console.log(`${row.slug}: cookiebot=${cookieLeft}, tawan=${tawanLeft}`);
}

await pool.end();
console.log('Done ✅');
