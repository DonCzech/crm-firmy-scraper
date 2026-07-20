import pg from 'pg';
const DB_URL = process.env.DATABASE_URL;
const baseUrl = 'http://localhost:3015';
const SLUG = 'cafe-01-v2';
const EMAIL = 'demo@cafe-01-v2.test';
const TEMPLATE_KEY = 'cafe-01';
const INDUSTRY = 'cafe';
const pool = new pg.Pool({ connectionString: DB_URL });
const del = await pool.query(`DELETE FROM tenants WHERE slug=$1 RETURNING id`, [SLUG]);
console.log(`cleanup removed ${del.rowCount}`);
const res = await fetch(`${baseUrl}/api/onboarding`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', Origin: baseUrl, Referer: baseUrl + '/', 'X-Forwarded-For': '10.0.0.' + Math.floor(Math.random()*250) },
  body: JSON.stringify({ email: EMAIL, templateKey: TEMPLATE_KEY, industry: INDUSTRY, slug: SLUG })
});
const body = await res.json().catch(() => ({}));
console.log('status', res.status, JSON.stringify(body, null, 2).slice(0, 500));
await pool.end();
