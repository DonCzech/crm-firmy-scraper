import pg from 'pg';
const pool = new pg.Pool({ connectionString: 'postgresql://neondb_owner:npg_RG6Q7owUlpXr@ep-still-recipe-alrqcrzd-pooler.c-3.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require' });

const KILL_V2 = `<script id="venom-kill2">(function(){
  var A=['localhost','127.0.0.1'];
  function isE(u){if(!u||u[0]==='/'||u.startsWith('data:')||u.startsWith('blob:'))return false;
    try{var h=new URL(u).hostname;return!A.some(function(a){return h===a||h.endsWith('.'+a);});}catch(e){return false;}}
  // Block fetch
  var oF=window.fetch;window.fetch=function(u){
    var uu=typeof u==='string'?u:(u&&u.url)||'';
    if(isE(uu))return Promise.resolve(new Response('',{status:200}));return oF.apply(this,arguments);};
  // Block XHR
  var oO=XMLHttpRequest.prototype.open;XMLHttpRequest.prototype.open=function(m,u){if(isE(String(u))){this._vb=true;return;}return oO.apply(this,arguments);};
  var oS=XMLHttpRequest.prototype.send;XMLHttpRequest.prototype.send=function(){if(this._vb)return;return oS.apply(this,arguments);};
  // Block script element creation (setAttribute + property)
  var oSA=Element.prototype.setAttribute;
  Element.prototype.setAttribute=function(n,v){
    if(n==='src'&&this.tagName==='SCRIPT'&&isE(String(v))){return;}
    return oSA.apply(this,arguments);};
  // Block img/link external src
  Object.defineProperty(HTMLScriptElement.prototype,'src',{
    set:function(v){if(isE(String(v)))return;oSA.call(this,'src',v);},
    get:function(){return this.getAttribute('src')||'';},configurable:true});
})()</script>`;

const r = await pool.query(`SELECT id FROM tenants WHERE slug=$1`, ['tribo-demo']);
const tid = r.rows[0].id;
const secs = await pool.query(`SELECT s.id, s.settings, p.slug FROM sections s JOIN pages p ON s.page_id=p.id WHERE s.tenant_id=$1`, [tid]);

for (const row of secs.rows) {
  const s = row.settings;
  let html = s.html || '';
  // Replace old kill script with v2
  html = html.replace(/<script id="venom-kill">[\s\S]*?<\/script>/g, '');
  if (!html.includes('venom-kill2')) html = KILL_V2 + '\n' + html;
  await pool.query(`UPDATE sections SET settings=$1, updated_at=NOW() WHERE id=$2`, [
    JSON.stringify({ ...s, html }),
    row.id,
  ]);
  console.log(`${row.slug}: ✅`);
}
await pool.end();
console.log('Done ✅');
