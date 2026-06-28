import pg from 'pg';
const pool = new pg.Pool({ connectionString: 'postgresql://neondb_owner:npg_RG6Q7owUlpXr@ep-still-recipe-alrqcrzd-pooler.c-3.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require' });

const KILL = `<script id="venom-kill">(function(){
  var A=['localhost','127.0.0.1'];
  function isE(u){if(!u||u[0]==='/'||u.startsWith('data:')||u.startsWith('blob:'))return false;
    try{var h=new URL(u).hostname;return!A.some(function(a){return h===a||h.endsWith('.'+a);});}catch(e){return false;}}
  var oF=window.fetch;window.fetch=function(u){if(isE(typeof u==='string'?u:u.url))return Promise.resolve(new Response('',{status:200}));return oF.apply(this,arguments);};
  var oO=XMLHttpRequest.prototype.open;XMLHttpRequest.prototype.open=function(m,u){if(isE(u)){this._b=true;return;}return oO.apply(this,arguments);};
  XMLHttpRequest.prototype.send=function(){if(this._b)return;return XMLHttpRequest.prototype.send.apply(this,arguments);};
})()</script>`;

const r = await pool.query(`SELECT id FROM tenants WHERE slug=$1`, ['tribo-demo']);
const tid = r.rows[0].id;
const secs = await pool.query(`SELECT s.id, s.settings, p.slug FROM sections s JOIN pages p ON s.page_id=p.id WHERE s.tenant_id=$1`, [tid]);

for (const row of secs.rows) {
  const s = row.settings;
  let html = s.html || '';

  // Inject kill-external blocker
  if (!html.includes('venom-kill')) html = KILL + '\n' + html;

  // Strip Seznam.cz tracking
  html = html.replace(/<script[^>]*c\.seznam\.cz[^>]*>[\s\S]*?<\/script>/gi, '');
  html = html.replace(/<script[^>]*c\.seznam\.cz[^>]*><\/script>/gi, '');
  html = html.replace(/<noscript>[^<]*seznam[^<]*<\/noscript>/gi, '');

  // Replace YouTube iframe with thumbnail link (avoid external request)
  html = html.replace(/<iframe[^>]*(?:youtube\.com|youtu\.be)[^>]*><\/iframe>/gi, '');
  html = html.replace(/<iframe[^>]*(?:youtube\.com|youtu\.be)[^>]*\/>/gi, '');

  // Strip Solid Pixels CDN dynamic resources (loaded by JS)
  html = html.replace(/<script[^>]*cdn\.solidpixels[^>]*>[\s\S]*?<\/script>/gi, '');
  html = html.replace(/<link[^>]*cdn\.solidpixels[^>]*>/gi, '');

  await pool.query(`UPDATE sections SET settings=$1, updated_at=NOW() WHERE id=$2`, [
    JSON.stringify({ ...s, html }),
    row.id,
  ]);
  console.log(`${row.slug}: ✅`);
}

await pool.end();
console.log('Done ✅');
