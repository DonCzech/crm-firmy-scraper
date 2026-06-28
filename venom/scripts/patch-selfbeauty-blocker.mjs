import pg from 'pg';
const DB_URL = 'postgresql://neondb_owner:npg_RG6Q7owUlpXr@ep-still-recipe-alrqcrzd-pooler.c-3.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';
const pool = new pg.Pool({ connectionString: DB_URL });

// Inline XHR/fetch blocker — must run before any Wix JS
const KILL_SCRIPT = `<script>(function(){
  var A=['localhost','127.0.0.1'];
  function isExt(u){
    if(!u||u[0]==='/'||u.startsWith('data:')||u.startsWith('blob:'))return false;
    try{var h=new URL(u).hostname;return!A.some(function(a){return h===a||h.endsWith('.'+a);});}catch(e){return false;}
  }
  var oF=window.fetch;
  window.fetch=function(u){
    if(isExt(typeof u==='string'?u:u.url)){return Promise.resolve(new Response('',{status:200}));}
    return oF.apply(this,arguments);
  };
  var oO=XMLHttpRequest.prototype.open;
  XMLHttpRequest.prototype.open=function(m,u){
    if(isExt(u)){this._blocked=true;return;}
    return oO.apply(this,arguments);
  };
  var oS=XMLHttpRequest.prototype.send;
  XMLHttpRequest.prototype.send=function(){
    if(this._blocked)return;
    return oS.apply(this,arguments);
  };
})()</script>`;

const r = await pool.query(`SELECT id FROM tenants WHERE slug = $1`, ['selfbeauty-demo']);
const tid = r.rows[0].id;
const secs = await pool.query(`SELECT id, settings FROM sections WHERE tenant_id = $1`, [tid]);

for (const row of secs.rows) {
  const s = row.settings;
  let html = s.html || '';
  if (!html.includes('_blocked=true')) {
    html = KILL_SCRIPT + '\n' + html;
  }
  await pool.query(`UPDATE sections SET settings = $1, updated_at = NOW() WHERE id = $2`, [
    JSON.stringify({ ...s, html }),
    row.id,
  ]);
  console.log('Patched section', row.id, '— html now', html.length, 'bytes');
}

await pool.end();
console.log('Done ✅');
