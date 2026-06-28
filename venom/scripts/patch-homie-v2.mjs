// patch-homie-v2 — strip WP emoji, reCAPTCHA, Clarity, Facebook, GTM
import pg from 'pg';
const pool = new pg.Pool({ connectionString: 'postgresql://neondb_owner:npg_RG6Q7owUlpXr@ep-still-recipe-alrqcrzd-pooler.c-3.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require' });

const r0 = await pool.query(`SELECT id FROM tenants WHERE slug=$1`, ['homie-demo']);
const tid0 = r0.rows[0].id;
const secs0 = await pool.query(`SELECT s.id, s.settings, p.slug FROM sections s JOIN pages p ON s.page_id=p.id WHERE s.tenant_id=$1`, [tid0]);

for (const row of secs0.rows) {
  const s = row.settings;
  let html = s.html || '';
  html = html.replace(/<script[^>]*(?:wp-emoji|emoji-release)[^>]*>[\s\S]*?<\/script>/gi, '');
  html = html.replace(/<script[^>]*src="https?:\/\/www\.google\.com\/recaptcha[^"]*"[^>]*><\/script>/gi, '');
  html = html.replace(/<script[^>]*(?:clarity\.ms|clarity\b)[^>]*>[\s\S]*?<\/script>/gi, '');
  html = html.replace(/<script[^>]*(?:fbevents|facebook\.net)[^>]*>[\s\S]*?<\/script>/gi, '');
  html = html.replace(/<script[^>]*(?:fbevents|facebook\.net)[^>]*><\/script>/gi, '');
  html = html.replace(/<script[^>]*(?:gtm\.js|googletagmanager)[^>]*>[\s\S]*?<\/script>/gi, '');
  html = html.replace(/<noscript>[^<]*(?:googletagmanager|facebook)[^<]*<\/noscript>/gi, '');
  html = html.replace(/<link[^>]*s\.w\.org[^>]*>/gi, '');
  html = html.replace(/<div[^>]*class="[^"]*wpcf7[^"]*"[^>]*>[\s\S]{0,3000}?<\/div>/gi,
    '<div style="padding:20px;background:#1a1a1a;border:1px solid #333;border-radius:8px;text-align:center;color:#ccc">Rezervace: <a href="mailto:info@demo.local" style="color:#e0c070">info@demo.local</a> | +420 608 288 777</div>');
  const extLeft = (html.match(/s\.w\.org|recaptcha|clarity\.ms|fbevents|facebook\.net|googletagmanager/gi) || []).length;
  await pool.query(`UPDATE sections SET settings=$1, updated_at=NOW() WHERE id=$2`, [JSON.stringify({ ...s, html }), row.id]);
  console.log(`${row.slug}: ext_refs=${extLeft}`);
}
await pool.end();
console.log('Done ✅');
// --- original content below intentionally replaced ---

const KILL = `<script id="venom-kill">(function(){
  var A=['localhost','127.0.0.1'];
  function isE(u){if(!u||u[0]==='/'||u.startsWith('data:')||u.startsWith('blob:'))return false;
    try{var h=new URL(u).hostname;return!A.some(function(a){return h===a||h.endsWith('.'+a);});}catch(e){return false;}}
  var oF=window.fetch;window.fetch=function(u){var uu=typeof u==='string'?u:(u&&u.url)||'';if(isE(uu))return Promise.resolve(new Response('',{status:200}));return oF.apply(this,arguments);};
  var oO=XMLHttpRequest.prototype.open;XMLHttpRequest.prototype.open=function(m,u){if(isE(String(u))){this._b=true;return;}return oO.apply(this,arguments);};
  var oS=XMLHttpRequest.prototype.send;XMLHttpRequest.prototype.send=function(){if(this._b)return;return oS.apply(this,arguments);};
  var oSA=Element.prototype.setAttribute;Element.prototype.setAttribute=function(n,v){if(n==='src'&&this.tagName==='SCRIPT'&&isE(String(v)))return;return oSA.apply(this,arguments);};
  // Block iframe src injection
  var oCA=Element.prototype.setAttribute;
})()</script>`;

const r = await pool.query(`SELECT id FROM tenants WHERE slug=$1`, ['homie-demo']);
const tid = r.rows[0].id;
const secs = await pool.query(`SELECT s.id, s.settings, p.slug FROM sections s JOIN pages p ON s.page_id=p.id WHERE s.tenant_id=$1`, [tid]);

for (const row of secs.rows) {
  const s = row.settings;
  let html = s.html || '';

  // Ensure kill-external is present
  if (html.includes('venom-kill')) {
    html = html.replace(/<script id="venom-kill">[\s\S]*?<\/script>/, '');
  }
  html = KILL + '\n' + html;

  // Strip GTM noscript iframe
  html = html.replace(/<noscript><iframe[^>]*googletagmanager[^>]*>[\s\S]*?<\/iframe><\/noscript>/gi, '');

  // Strip tracking script tags (clarity, facebook, google analytics)
  html = html.replace(/<script[^>]*(?:clarity\.ms|facebook\.net|fbevents|fbq|googletagmanager|google-analytics|hotjar|smartlook)[^>]*>[\s\S]*?<\/script>/gi, '');
  html = html.replace(/<script[^>]*>[\s\S]*?(?:clarity\.ms|fbq\(|_gaq|ga\(|gtag\()[^\s]*[\s\S]*?<\/script>/gi, '');

  // Strip cookie-law JSON config scripts (contain cookie-law-info string)
  html = html.replace(/<script[^>]*>(?:[^<]|<(?!\/script>))*cookie-law-info(?:[^<]|<(?!\/script>))*<\/script>/gi, '');
  // Strip cookie-law info HTML divs
  html = html.replace(/<div[^>]*(?:cookie-law-info|cli-bar|cli_bar|cookie-law)[^>]*>[\s\S]{0,5000}?<\/div>\s*/gi, '');

  // Strip WordPress emoji script/stylesheet
  html = html.replace(/<script[^>]*>[\s\S]*?s\.w\.org\/images\/core\/emoji[\s\S]*?<\/script>/gi, '');
  html = html.replace(/<link[^>]*s\.w\.org[^>]*>/gi, '');
  // Replace emoji img tags (s.w.org SVGs)
  html = html.replace(/<img[^>]*s\.w\.org\/images\/core\/emoji[^>]*>/gi, '');

  // Strip YouTube iframes (replace with empty div to avoid layout breaks)
  html = html.replace(/<iframe[^>]*youtube\.com\/embed[^>]*>[\s\S]*?<\/iframe>/gi, '<div style="display:none"></div>');
  html = html.replace(/<iframe[^>]*youtube-nocookie\.com\/embed[^>]*>[\s\S]*?<\/iframe>/gi, '<div style="display:none"></div>');
  // Strip WP oEmbed figure wrapping YouTube
  html = html.replace(/<figure[^>]*wp-block-embed[^>]*>[\s\S]{0,2000}?<\/figure>/gi, '');

  // Strip Google Maps iframes
  html = html.replace(/<iframe[^>]*google\.com\/maps[^>]*>[\s\S]*?<\/iframe>/gi, '');
  // Replace goo.gl maps links with #
  html = html.replace(/href="https?:\/\/(?:goo\.gl\/maps|maps\.google\.com|www\.google\.com\/maps)[^"]*"/gi, 'href="#"');

  // Strip recaptcha iframes
  html = html.replace(/<iframe[^>]*recaptcha[^>]*>[\s\S]*?<\/iframe>/gi, '');
  html = html.replace(/<div[^>]*g-recaptcha[^>]*>[\s\S]{0,500}?<\/div>/gi, '');

  // Strip Facebook pixel noscript img
  html = html.replace(/<noscript>[\s\S]{0,200}?facebook\.com\/tr[\s\S]{0,200}?<\/noscript>/gi, '');

  const extCount = (html.match(/https?:\/\/(?!(?:demo\.local))[a-z0-9.-]+\.[a-z]{2,}/gi) || []).length;
  const cookieLeft = html.includes('cookie-law-info');

  await pool.query(`UPDATE sections SET settings=$1, updated_at=NOW() WHERE id=$2`, [
    JSON.stringify({ ...s, html }),
    row.id,
  ]);
  console.log(`${row.slug}: ext=${extCount} cookie=${cookieLeft} ✅`);
}

await pool.end();
console.log('Done ✅');
