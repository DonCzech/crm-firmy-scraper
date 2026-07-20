import pg from 'pg';
import { existsSync } from 'fs';
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

const KILL = `<script id="venom-kill">(function(){
  var A=['localhost','127.0.0.1'];
  function isE(u){if(!u||u[0]==='/'||u.startsWith('data:')||u.startsWith('blob:'))return false;
    try{var h=new URL(u).hostname;return!A.some(function(a){return h===a||h.endsWith('.'+a);});}catch(e){return false;}}
  var oF=window.fetch;window.fetch=function(u){var uu=typeof u==='string'?u:(u&&u.url)||'';if(isE(uu))return Promise.resolve(new Response('',{status:200}));return oF.apply(this,arguments);};
  var oO=XMLHttpRequest.prototype.open;XMLHttpRequest.prototype.open=function(m,u){if(isE(String(u))){this._b=true;return;}return oO.apply(this,arguments);};
  var oS=XMLHttpRequest.prototype.send;XMLHttpRequest.prototype.send=function(){if(this._b)return;return oS.apply(this,arguments);};
  var oSA=Element.prototype.setAttribute;Element.prototype.setAttribute=function(n,v){if(n==='src'&&this.tagName==='SCRIPT'&&isE(String(v)))return;return oSA.apply(this,arguments);};
})()</script>`;

const SLUG = 'homie';
const CSS_URLS = [
  `/clones/${SLUG}/css/style.css`,
  `/clones/${SLUG}/css/bootstrap.min.css`,
  `/clones/${SLUG}/css/classic-themes.min.css`,
  `/clones/${SLUG}/css/5750.css`,
].filter(u => { try { return existsSync('public' + u); } catch { return true; } });

const JS_URLS = [
  `/clones/${SLUG}/js/jquery.min.js`,
  `/clones/${SLUG}/js/5777.js`,
  `/clones/${SLUG}/js/main.js`,
  `/clones/${SLUG}/js/front.js`,
  `/clones/${SLUG}/js/index.js`,
];

const r = await pool.query(`SELECT id FROM tenants WHERE slug=$1`, ['homie-demo']);
const tid = r.rows[0].id;
const secs = await pool.query(`SELECT s.id, s.settings, p.slug FROM sections s JOIN pages p ON s.page_id=p.id WHERE s.tenant_id=$1`, [tid]);

for (const row of secs.rows) {
  const s = row.settings;
  let html = s.html || '';

  // Inject kill-external
  if (!html.includes('venom-kill')) html = KILL + '\n' + html;

  // Strip external tracking scripts
  html = html.replace(/<script[^>]*(?:clarity\.ms|facebook\.net|google\.com\/recaptcha|gstatic|analytics)[^>]*>[\s\S]*?<\/script>/gi, '');
  html = html.replace(/<script[^>]*(?:clarity|fbq|gtag|ga\(|_gaq)[^>]*><\/script>/gi, '');

  // Strip WordPress emoji/Gutenberg external
  html = html.replace(/<link[^>]*s\.w\.org[^>]*>/gi, '');
  html = html.replace(/<script[^>]*s\.w\.org[^>]*>[\s\S]*?<\/script>/gi, '');

  // Fix cyrillic image path (URL-encoded)
  html = html.replace(/\/wp-content\/uploads\/%D[^"' )]+/g, '/clones/homie/img/placeholder.jpg');

  // Fix /images/ paths (webflow-style)
  html = html.replace(/\/clones\/homie\/images\//g, '/clones/homie/img/');

  await pool.query(`UPDATE sections SET settings=$1, updated_at=NOW() WHERE id=$2`, [
    JSON.stringify({ ...s, html, cssUrls: s.cssUrls, jsUrls: s.jsUrls }),
    row.id,
  ]);
  console.log(`${row.slug}: ✅`);
}

await pool.end();
console.log('Done ✅');
