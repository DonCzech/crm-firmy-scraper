import pg from 'pg';
import fs from 'fs';
const pool = new pg.Pool({ connectionString: 'postgresql://neondb_owner:npg_RG6Q7owUlpXr@ep-still-recipe-alrqcrzd-pooler.c-3.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require' });

const SLUG = 'escape';

const CSS_URLS = [
  `/clones/${SLUG}/fonts/css`,
  `/clones/${SLUG}/wp-content/cache/wpo-minify/1774712383/assets/wpo-minify-header-5de564e7.min.css`,
];
const JS_URLS = [
  `/clones/${SLUG}/js/jquery-3.7.1.min.js`,  // jQuery standalone first
  `/clones/${SLUG}/js/wpo-minify-header-7b950e49.min.js`,
  `/clones/${SLUG}/js/wpo-minify-footer-15706dac.min.js`,
];

function patch(html) {
  // 1. Fix /wp-content/themes/twentyseventeen/assets/ → /clones/escape/...
  html = html.replace(/\/wp-content\/themes\/twentyseventeen\/assets\//g, `/clones/${SLUG}/wp-content/themes/twentyseventeen/assets/`);

  // 2. Strip video elements (mp4 hero)
  html = html.replace(/<video[^>]*>[\s\S]*?<\/video>/gi, '');
  html = html.replace(/<source[^>]*\.mp4[^>]*>/gi, '');

  // 3. Strip ecomail newsletter widget + iframe
  html = html.replace(/<div[^>]*(?:ecomail|newsletter|mailchimp)[^>]*>[\s\S]{0,3000}?<\/div>/gi, '');
  html = html.replace(/<script[^>]*(?:ecomail|mailchimp|newsletter)[^>]*>[\s\S]*?<\/script>/gi, '');
  html = html.replace(/<iframe[^>]*(?:ecomail|mailchimp)[^>]*>[\s\S]*?<\/iframe>/gi, '');
  html = html.replace(/<iframe[^>]*(?:ecomail|mailchimp)[^>]*\/>/gi, '');

  // 4. Strip cloudfront CDN scripts (chat widgets, livechat etc)
  html = html.replace(/<script[^>]*cloudfront[^>]*>[\s\S]*?<\/script>/gi, '');
  html = html.replace(/<script[^>]*cloudfront[^>]*><\/script>/gi, '');
  html = html.replace(/<link[^>]*cloudfront[^>]*>/gi, '');

  // 5. Strip all external <script src> from HTML (in jsUrls already)
  html = html.replace(/<script[^>]+src="\/(?:wp-content|wp-includes)[^"]*"[^>]*><\/script>/gi, '');
  html = html.replace(/<script[^>]+src="https?:\/\/(?:www\.)?escapemassage[^"]*"[^>]*><\/script>/gi, '');

  // 6. WhatsApp floating button → strip
  html = html.replace(/<div[^>]*(?:whatsapp|wa-widget|wa-chat)[^>]*>[\s\S]{0,500}?<\/div>/gi, '');

  // 7. Fix canonical and og:url
  html = html.replace(/https?:\/\/(?:www\.)?escapemassage\.cz(?=['"<\s])/gi, '/demo/escape-demo');

  return html;
}

const r = await pool.query(`SELECT id FROM tenants WHERE slug=$1`, ['escape-demo']);
const tid = r.rows[0].id;
const secs = await pool.query(`SELECT s.id, s.settings, p.slug FROM sections s JOIN pages p ON s.page_id=p.id WHERE s.tenant_id=$1`, [tid]);

for (const row of secs.rows) {
  const s = row.settings;
  const patched = patch(s.html || '');
  await pool.query(`UPDATE sections SET settings=$1, updated_at=NOW() WHERE id=$2`, [
    JSON.stringify({ ...s, html: patched, cssUrls: CSS_URLS, jsUrls: JS_URLS }),
    row.id,
  ]);
  const ext = (patched.match(/https?:\/\/(?!localhost|demo\.local)[a-z][^\s"'<>]*(?:cloudfront|ecomail|escapemassage)[^\s"'<>]*/gi) || []).length;
  console.log(`${row.slug}: ${patched.length} bytes | external_refs=${ext}`);
}

await pool.end();
console.log('Done ✅');
