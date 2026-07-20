import pg from 'pg';
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

const r = await pool.query(`SELECT id FROM tenants WHERE slug=$1`, ['tribo-demo']);
const tid = r.rows[0].id;
const secs = await pool.query(`SELECT s.id, s.settings, p.slug FROM sections s JOIN pages p ON s.page_id=p.id WHERE s.tenant_id=$1`, [tid]);

// Find YouTube references in home HTML
for (const row of secs.rows) {
  const s = row.settings;
  let html = s.html || '';

  // Find YouTube data in HTML
  const ytIdx = html.toLowerCase().search(/youtube|youtu\.be|player_api/);
  if (ytIdx >= 0) {
    console.log(`${row.slug}: YouTube at ${ytIdx}:`, html.slice(Math.max(0,ytIdx-50), ytIdx+100));
  }

  // Approach: add window.onYouTubeIframeAPIReady blocker + delete YT namespace
  const ytBlock = `<script id="yt-block">
window.onYouTubeIframeAPIReady=function(){};
window.YT={Player:function(){},PlayerState:{}};
</script>`;
  if (!html.includes('yt-block')) {
    html = html.replace('<script id="venom-kill2">', ytBlock + '\n<script id="venom-kill2">');
  }

  // Also remove any data-youtube attributes that trigger player init
  html = html.replace(/data-youtube="[^"]*"/gi, 'data-youtube-blocked="1"');
  html = html.replace(/data-video="[^"]*youtube[^"]*"/gi, 'data-video-blocked="1"');

  await pool.query(`UPDATE sections SET settings=$1, updated_at=NOW() WHERE id=$2`, [
    JSON.stringify({ ...s, html }),
    row.id,
  ]);
  console.log(`${row.slug}: ✅`);
}
await pool.end();
console.log('Done ✅');
