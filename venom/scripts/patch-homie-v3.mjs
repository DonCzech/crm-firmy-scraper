import pg from 'pg';
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL, max: 1 });

// Improved kill script that also overrides src property setter
const KILL_V3 = `<script id="venom-kill3">(function(){
  var A=['localhost','127.0.0.1'];
  function isE(u){if(!u||String(u)[0]==='/'||String(u).startsWith('data:')||String(u).startsWith('blob:'))return false;
    try{var h=new URL(String(u)).hostname;return!A.some(function(a){return h===a||h.endsWith('.'+a);});}catch(e){return false;}}
  // Block fetch
  var oF=window.fetch;window.fetch=function(u){var uu=typeof u==='string'?u:(u&&u.url)||'';if(isE(uu))return Promise.resolve(new Response('',{status:200}));return oF.apply(this,arguments);};
  // Block XHR
  var oO=XMLHttpRequest.prototype.open;XMLHttpRequest.prototype.open=function(m,u){if(isE(String(u))){this._b=true;return;}return oO.apply(this,arguments);};
  XMLHttpRequest.prototype.send=function(){if(this._b)return;return XMLHttpRequest.prototype.send.apply(this,arguments);};
  // Block script.src property setter (inline JS like "s.src = https://...")
  try{Object.defineProperty(HTMLScriptElement.prototype,'src',{
    set:function(v){if(isE(String(v))){console.debug('[venom] blocked script.src:',String(v).slice(0,60));return;}
      Object.getOwnPropertyDescriptor(HTMLElement.prototype,'src')?.set?.call(this,v)||this.setAttribute('src',String(v));},
    get:function(){return this.getAttribute('src')||'';},configurable:true});}catch(e){}
  // Block setAttribute
  var oSA=Element.prototype.setAttribute;
  Element.prototype.setAttribute=function(n,v){
    if(n==='src'&&this.tagName==='SCRIPT'&&isE(String(v)))return;
    return oSA.apply(this,arguments);};
})()</script>`;

const r = await pool.query(`SELECT id FROM tenants WHERE slug=$1`, ['homie-demo']);
const tid = r.rows[0].id;
const secs = await pool.query(`SELECT s.id, s.settings, p.slug FROM sections s JOIN pages p ON s.page_id=p.id WHERE s.tenant_id=$1`, [tid]);

for (const row of secs.rows) {
  const s = row.settings;
  let html = s.html || '';

  // Replace old kill with v3
  html = html.replace(/<script id="venom-kill[^"]*">[\s\S]*?<\/script>/g, '');
  html = KILL_V3 + '\n' + html;

  // Strip ALL inline scripts that load external trackers
  // Split by <script and process each block
  const scriptParts = html.split('<script');
  const cleanedParts = scriptParts.map((part, i) => {
    if (i === 0) return part;
    const closeIdx = part.indexOf('</script>');
    if (closeIdx === -1) return '<script' + part;
    const content = part.slice(0, closeIdx);
    // Remove script blocks containing tracking code
    if (/clarity\.ms|fbevents|gtm\.js|googletagmanager|recaptcha\/api\.js|wp-emoji|s\.w\.org/.test(content)) {
      return part.slice(closeIdx + 9); // skip the entire block
    }
    return '<script' + part;
  });
  html = cleanedParts.join('');

  // Strip noscript GTM iframes
  html = html.replace(/<noscript>[\s\S]*?googletagmanager[\s\S]*?<\/noscript>/gi, '');

  // Replace WP emoji img tags with actual emoji char
  html = html.replace(/<img[^>]*src="https:\/\/s\.w\.org\/images\/core\/emoji\/[^"]*\/([^"]+)\.svg"[^>]*alt="([^"]*)"[^>]*>/gi,
    (match, code, alt) => alt || '');

  // Strip .grecaptcha-badge style (harmless but cleanup)
  html = html.replace(/\.grecaptcha-badge\s*\{[^}]+\}/g, '');

  const extLeft = (html.match(/s\.w\.org|clarity\.ms|fbevents|facebook\.net|googletagmanager|recaptcha\/api/gi) || []).length;
  await pool.query(`UPDATE sections SET settings=$1, updated_at=NOW() WHERE id=$2`, [
    JSON.stringify({ ...s, html }), row.id,
  ]);
  console.log(`${row.slug}: ext_refs=${extLeft}`);
}

await pool.end();
console.log('Done ✅');
