import pg from 'pg';
const pool = new pg.Pool({ connectionString: 'postgresql://neondb_owner:npg_RG6Q7owUlpXr@ep-still-recipe-alrqcrzd-pooler.c-3.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require' });
const r = await pool.query(`SELECT id FROM tenants WHERE slug=$1`, ['ananda-demo']);
const s = await pool.query(`SELECT settings->>'html' as html FROM sections s JOIN pages p ON s.page_id=p.id WHERE s.tenant_id=$1 AND p.slug='home'`, [r.rows[0].id]);
const html = s.rows[0].html;
// Find "bns-t" class element
const idx = html.indexOf('bns-t');
if (idx >= 0) console.log('bns-t context:\n', html.slice(Math.max(0,idx-200), idx+400));
// Find H1 context
const h1idx = html.indexOf('<h1');
if (h1idx >= 0) console.log('\nH1:\n', html.slice(Math.max(0,h1idx-300), h1idx+200));
// Find video/swiper hero
const swiperIdx = html.indexOf('swiper-slide');
if (swiperIdx >= 0) console.log('\nFirst swiper-slide:\n', html.slice(swiperIdx, swiperIdx+400));
await pool.end();
