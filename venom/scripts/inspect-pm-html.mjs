import pg from 'pg';
const pool = new pg.Pool({ connectionString: 'postgresql://neondb_owner:npg_RG6Q7owUlpXr@ep-still-recipe-alrqcrzd-pooler.c-3.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require' });

const r = await pool.query(`SELECT id FROM tenants WHERE slug = $1`, ['praha-masaze-demo']);
const tid = r.rows[0].id;
const s = await pool.query(`SELECT s.settings->>'html' as html FROM sections s JOIN pages p ON s.page_id=p.id WHERE s.tenant_id=$1 AND p.slug='home'`, [tid]);
const html = s.rows[0].html;

// First 800 chars
console.log('FIRST 800:');
console.log(html.slice(0, 800));
console.log('\n...\n');
// Check for <link> and <style> tags
const links = (html.match(/<link[^>]+>/gi) || []);
const styles = (html.match(/<style[^>]*>/gi) || []);
console.log('Link tags:', links.length, links.slice(0,3));
console.log('Style tags:', styles.length);
// Check for img tags with local paths
const localImgs = (html.match(/src="\/clones[^"]+"/g) || []);
console.log('Local img srcs:', localImgs.length, localImgs.slice(0,3));
// Check for any img tags with external paths
const extImgs = (html.match(/src="https?:\/\/[^"]+"/g) || []);
console.log('External img srcs:', extImgs.length, extImgs.slice(0,3));

await pool.end();
