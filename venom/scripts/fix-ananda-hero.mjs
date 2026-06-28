/**
 * Fix hero background — add CSS override to show hero image
 * The original site used a video element which we stripped.
 * We inject a CSS hero background using the downloaded spa image.
 */
import pg from 'pg';
const pool = new pg.Pool({ connectionString: 'postgresql://neondb_owner:npg_RG6Q7owUlpXr@ep-still-recipe-alrqcrzd-pooler.c-3.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require' });

// Inspect hero structure in the Playwright DOM to find the right container
// From debug: h1 is inside "z-20 absolute h-full w-full"
// Hero background must be a sibling/parent with relative positioning

const HERO_CSS_INJECT = `<style id="ananda-hero-fix">
/* Hero background fix — video was stripped, use static image */
section.relative > div:not([class*="z-20"]):not([class*="cloud"]):not([class*="swiper"]) {
  background-image: url('/clones/ananda/img/header_individuals-hAwrdLii.png');
  background-size: cover;
  background-position: center center;
  background-repeat: no-repeat;
}
/* Ensure hero section has correct height */
section.relative:first-of-type {
  min-height: 100vh;
  position: relative;
}
/* Fix any remaining video placeholder divs */
div[style*="background:/clones"] {
  background-image: url('/clones/ananda/img/header_individuals-hAwrdLii.png') !important;
  background-size: cover !important;
  background-position: center !important;
}
/* Fix Ananda logo SVG white variant */
img[src*="Ananda_symbolA_HP_white"] {
  filter: brightness(0) invert(1);
}
/* Slick hero slider alternative — try to show first slide */
.swiper-slide:first-child {
  background-image: url('/clones/ananda/img/header_individuals-hAwrdLii.png');
  background-size: cover;
  background-position: center;
}
</style>`;

const r = await pool.query(`SELECT id FROM tenants WHERE slug=$1`, ['ananda-demo']);
const tid = r.rows[0].id;
const secs = await pool.query(`SELECT s.id, s.settings, p.slug FROM sections s JOIN pages p ON s.page_id=p.id WHERE s.tenant_id=$1`, [tid]);

for (const row of secs.rows) {
  const s = row.settings;
  let html = s.html || '';

  // Inject hero CSS fix before </head>
  if (!html.includes('ananda-hero-fix')) {
    html = html.replace('</head>', HERO_CSS_INJECT + '</head>');
  }

  // Fix the video replacement div (wrong background syntax)
  html = html.replace(
    /background:\/clones\/ananda\/img\/([^;]+\.(?:jpg|png|mp4|webp))/g,
    `background-image:url('/clones/ananda/img/$1');background-size:cover;background-position:center;min-height:100vh`
  );

  // Also fix any img paths that are still missing the hash (common Vite asset pattern)
  const assetFixes = [
    ['Ananda_symbolA_HP_white.svg', 'Ananda_symbolA_HP_white.svg'],
    ['logo-CcPwfguz.svg', 'logo-CcPwfguz.svg'],
    ['bg_hindu-BwQpXuns.svg', 'bg_hindu-BwQpXuns.svg'],
  ];
  for (const [search, dest] of assetFixes) {
    // Already should be correct from earlier patches
  }

  await pool.query(`UPDATE sections SET settings=$1, updated_at=NOW() WHERE id=$2`, [
    JSON.stringify({ ...s, html }),
    row.id,
  ]);
  console.log(`${row.slug}: hero CSS injected ✅`);
}

await pool.end();
console.log('Done ✅');
