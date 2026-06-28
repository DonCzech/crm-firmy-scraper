import pg from 'pg';
const pool = new pg.Pool({ connectionString: 'postgresql://neondb_owner:npg_RG6Q7owUlpXr@ep-still-recipe-alrqcrzd-pooler.c-3.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require' });

const r = await pool.query(`SELECT s.id, s.settings FROM sections s JOIN pages p ON s.page_id = p.id JOIN tenants t ON p.tenant_id = t.id WHERE t.slug = 'perfectcatering-demo' LIMIT 1`);
const sec = r.rows[0];
const settings = sec.settings;
let html = settings.html;

html = html
  .replace(/Perfect\s+Catering(?!\s*Demo)/gi, 'Demo Catering')
  .replace(/Filip\s+Sajler/gi, 'Demo Šéfkuchař')
  .replace(/\+420\s*7[0-9]{2}\s*[0-9]{3}\s*[0-9]{3}/g, '+420 608 288 777')
  .replace(/jana[^@]{0,5}@[^"<\s]{0,40}/gi, 'info@demo.local')
  .replace(/Jana\s+Moravcová/gi, 'Demo Manažerka')
  .replace(/Nově\s+zal[^<]{10,500}/g, 'Tato sekce ukazuje, jak může šablona představit příběh a atmosféru firmy. Zde může podnikatel popsat svůj tým, filozofii nebo přístup ke klientům.');

const after = {
  pc: (html.match(/Perfect\s+Catering(?!\s*Demo)/gi) || []).length,
  sajler: (html.match(/Filip\s+Sajler/gi) || []).length,
  phone: (html.match(/\+420\s*72\d/g) || []).length,
};
console.log('Remaining:', JSON.stringify(after));

settings.html = html;
await pool.query('UPDATE sections SET settings=$1 WHERE id=$2', [JSON.stringify(settings), sec.id]);
console.log('Updated ✅');
await pool.end();
