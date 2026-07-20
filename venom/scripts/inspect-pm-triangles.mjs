import pg from 'pg';
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const r = await pool.query(`SELECT id FROM tenants WHERE slug=$1`, ['praha-masaze-demo']);
const s = await pool.query(`SELECT settings->>'html' as html FROM sections s JOIN pages p ON s.page_id=p.id WHERE s.tenant_id=$1 AND p.slug='home'`, [r.rows[0].id]);
const html = s.rows[0].html;
const iframes = html.match(/<iframe[^>]+>/gi) || [];
const videos = html.match(/<video[^>]+>/gi) || [];
const embeds = html.match(/class="[^"]*wp-block-embed[^"]*"/gi) || [];
const slick = html.match(/class="[^"]*slick[^"]*"/gi) || [];
console.log('iframes:', iframes.length, '\n', iframes.slice(0,3).map(i=>i.slice(0,120)).join('\n'));
console.log('\nvideos:', videos.length, videos.slice(0,2));
console.log('\nwp-block-embed:', embeds.slice(0,5));
console.log('\nslick classes:', slick.slice(0,5));
// Find what comes right before/after slick arrows area
const slickPrev = html.indexOf('slick-prev');
if (slickPrev >= 0) console.log('\nslick-prev context:', html.slice(Math.max(0,slickPrev-200), slickPrev+50));
await pool.end();
