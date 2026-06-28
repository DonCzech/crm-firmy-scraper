import pg from 'pg';
const pool = new pg.Pool({ connectionString: 'postgresql://neondb_owner:npg_RG6Q7owUlpXr@ep-still-recipe-alrqcrzd-pooler.c-3.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require' });

const SLUG = 'escape';

// Kill external script - must run as INLINE before any other JS
const KILL_INLINE = `<script id="kill-ext">(function(){
  var ALLOWED=['localhost','127.0.0.1'];
  function isExt(u){if(!u||u[0]==='/'||u.startsWith('data:')||u.startsWith('blob:'))return false;
    try{var h=new URL(u).hostname;return!ALLOWED.some(function(a){return h===a||h.endsWith('.'+a);});}catch(e){return false;}}
  var oF=window.fetch;window.fetch=function(u){
    if(isExt(typeof u==='string'?u:u.url)){return Promise.resolve(new Response('',{status:200}));}return oF.apply(this,arguments);};
  var oO=XMLHttpRequest.prototype.open;XMLHttpRequest.prototype.open=function(m,u){
    if(isExt(u)){this._b=true;return;}return oO.apply(this,arguments);};
  var oS=XMLHttpRequest.prototype.send;XMLHttpRequest.prototype.send=function(){if(this._b)return;return oS.apply(this,arguments);};
  // Block dynamic script injection for cloudfront
  var oCA=document.createElement;document.createElement=function(t){
    var el=oCA.call(document,t);
    if(t.toLowerCase()==='script'){
      var oSrc=Object.getOwnPropertyDescriptor(HTMLScriptElement.prototype,'src')||{};
      Object.defineProperty(el,'src',{set:function(v){if(isExt(v)){console.debug('[venom] blocked script:',v.slice(0,60));return;}
        Object.getOwnPropertyDescriptor(HTMLScriptElement.prototype,'src')?.set?.call(this,v)||this.setAttribute('src',v);},get:function(){return this.getAttribute('src')||'';}});
    }
    return el;
  };
})()</script>`;

function patch(html) {
  // 1. Inject kill-external inline at start
  if (!html.includes('kill-ext')) {
    html = KILL_INLINE + '\n' + html;
  }

  // 2. Fix ecomail image → local
  html = html.replace(/https?:\/\/ecomail-accounts\.s3[^"' )\n]*/gi, `/clones/${SLUG}/img/ecomail-logo.png`);

  // 3. Strip Smartsupp / widget.js loading
  html = html.replace(/<script[^>]*(?:smartsupp|cloudfront)[^>]*>[\s\S]*?<\/script>/gi, '');
  html = html.replace(/<script[^>]*widget\.js[^>]*><\/script>/gi, '');

  // 4. jQuery available before other scripts
  if (!html.includes('jquery-check')) {
    html = html.replace(KILL_INLINE, KILL_INLINE + `\n<script id="jquery-check">window.$=window.jQuery=function(){console.warn('[venom] jQuery not ready');};</script>`);
  }

  return html;
}

const r = await pool.query(`SELECT id FROM tenants WHERE slug=$1`, ['escape-demo']);
const tid = r.rows[0].id;
const secs = await pool.query(`SELECT s.id, s.settings, p.slug FROM sections s JOIN pages p ON s.page_id=p.id WHERE s.tenant_id=$1`, [tid]);

for (const row of secs.rows) {
  const s = row.settings;
  const patched = patch(s.html || '');
  await pool.query(`UPDATE sections SET settings=$1, updated_at=NOW() WHERE id=$2`, [
    JSON.stringify({ ...s, html: patched }),
    row.id,
  ]);
  console.log(`${row.slug}: ✅`);
}

await pool.end();
console.log('Done ✅');
