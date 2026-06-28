/**
 * Final patch: fix all remaining path issues + strip eKomi + fix Swiper CDN ref
 */
import pg from 'pg';
const pool = new pg.Pool({ connectionString: 'postgresql://neondb_owner:npg_RG6Q7owUlpXr@ep-still-recipe-alrqcrzd-pooler.c-3.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require' });

function patchHtml(html) {
  // 1. Fix /build/assets/ paths
  html = html.replace(/\/build\/assets\/font-CX8Z7V2Y\.woff2/g, '/clones/ananda/fonts/font-CX8Z7V2Y.woff2');
  html = html.replace(/\/build\/assets\/font-BqEH4j1h\.woff/g, '/clones/ananda/fonts/font-BqEH4j1h.woff');
  html = html.replace(/\/build\/assets\/Subtraction%202-C8EL6biz\.svg/g, '/clones/ananda/img/Subtraction 2-C8EL6biz.svg');
  // All remaining /build/assets/ → flat img dir
  html = html.replace(/\/build\/assets\/([^"' )\n?]+)/g, '/clones/ananda/img/$1');

  // 2. Fix Swiper CDN → local
  html = html.replace(/https?:\/\/cdn\.jsdelivr\.net\/npm\/swiper[^"' )\n]*/g, '/clones/ananda/js/swiper-bundle.min.js');
  // Swiper CSS CDN
  html = html.replace(/<link[^>]*(?:cdn\.jsdelivr\.net\/npm\/swiper)[^>]*>/gi, '');

  // 3. Fully strip eKomi widget HTML + scripts
  html = html.replace(/<div[^>]*id="[^"]*ekomi[^"]*"[^>]*>[\s\S]{0,3000}?<\/div>/gi, '');
  html = html.replace(/<div[^>]*class="[^"]*ekomi[^"]*"[^>]*>[\s\S]{0,3000}?<\/div>/gi, '');
  html = html.replace(/<script[^>]*(?:ekomi|eKomiapps)[^>]*>[\s\S]*?<\/script>/gi, '');
  html = html.replace(/<link[^>]*(?:ekomi)[^>]*>/gi, '');

  // 4. Fix video path
  html = html.replace(/\/assets\/videos\/new\/home_6_1\.mp4/g, '/clones/ananda/img/home_6_1.mp4');

  // 5. Fix remaining /assets/images/ (keep subdir structure since we created those dirs)
  html = html.replace(/\/assets\/images\//g, '/clones/ananda/img/');

  // 6. Fix remaining /assets/ root
  html = html.replace(/\/assets\/favicon\//g, '/clones/ananda/img/');

  // 7. Strip Livewire
  html = html.replace(/<script[^>]*(?:livewire|Livewire)[^>]*>[\s\S]*?<\/script>/gi, '');
  html = html.replace(/<script[^>]*src="\/livewire[^"]*"[^>]*><\/script>/gi, '');

  // 8. Strip cookie consent
  html = html.replace(/<script[^>]*(?:cookieconsent|cookie-consent)[^>]*>[\s\S]*?<\/script>/gi, '');

  return html;
}

const r = await pool.query(`SELECT id FROM tenants WHERE slug=$1`, ['ananda-demo']);
const tid = r.rows[0].id;
const secs = await pool.query(`SELECT s.id, s.settings, p.slug FROM sections s JOIN pages p ON s.page_id=p.id WHERE s.tenant_id=$1`, [tid]);

for (const row of secs.rows) {
  const s = row.settings;
  const patched = patchHtml(s.html || '');
  await pool.query(`UPDATE sections SET settings=$1, updated_at=NOW() WHERE id=$2`, [
    JSON.stringify({ ...s, html: patched }),
    row.id,
  ]);
  const ext = (patched.match(/https?:\/\/(?!localhost)(?:ekomi|cdn\.jsdelivr|smart-widget)[^\s"'<>]*/gi) || []).length;
  const remaining404 = ['/build/assets/', '/assets/images/', '/assets/videos/'].filter(p => patched.includes(p));
  console.log(`${row.slug}: ext_refs=${ext}, still_broken_paths=${remaining404.join(',') || 'none ✅'}`);
}

await pool.end();
console.log('Done ✅');
