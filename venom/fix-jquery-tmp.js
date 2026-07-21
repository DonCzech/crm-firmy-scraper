const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL, connectionTimeoutMillis: 10000 });

async function run() {
  const r = await pool.query('SELECT settings FROM sections WHERE id = 1152');
  const settings = r.rows[0].settings;
  let html = settings.html;

  if(html.includes('jquery.min.js')) {
    console.log('jQuery already in HTML - skipping');
    await pool.end();
    return;
  }

  const jqueryInject = '<script src="/clones/magic/js/jquery.min.js" id="jquery-core-js"></script>\n<script src="/clones/magic/js/jquery-migrate.min.js" id="jquery-migrate-js"></script>\n';
  const hookScriptTag = '<script src="/clones/magic/js/hooks.min.js"';

  if(html.includes(hookScriptTag)) {
    html = html.replace(hookScriptTag, jqueryInject + hookScriptTag);
    console.log('Injected jQuery before hooks.min.js');
  } else {
    console.log('hooks tag not found');
    await pool.end();
    return;
  }

  const newJsUrls = (settings.jsUrls || []).filter(function(u) { return !u.includes('jquery'); });
  const newSettings = Object.assign({}, settings, { html: html, jsUrls: newJsUrls });

  await pool.query('UPDATE sections SET settings = $1 WHERE id = 1152', [JSON.stringify(newSettings)]);
  console.log('DONE: Section 1152 updated');
  console.log('New jsUrls:', JSON.stringify(newJsUrls));
  await pool.end();
}

run().catch(function(e) { console.error('ERR:', e.message); pool.end(); });
