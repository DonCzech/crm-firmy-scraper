#!/usr/bin/env node
import pg from 'pg';

const DB_URL = process.env.DATABASE_URL
  || process.env.DATABASE_URL;
const baseUrl = process.env.VENOM_BASE_URL || 'http://localhost:3015';
const SLUG = 'tattoo-03-demo';
const EMAIL = 'demo@tattoo-03.test';
const TEMPLATE_KEY = 'tattoo-03';
const INDUSTRY = 'tattoo';

const pool = new pg.Pool({ connectionString: DB_URL });

async function main() {
  const del = await pool.query(`DELETE FROM tenants WHERE slug=$1 RETURNING id, slug`, [SLUG]);
  console.log(`✓ cleanup: removed ${del.rowCount} previous tenants with slug=${SLUG}`);

  const res = await fetch(`${baseUrl}/api/onboarding`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Origin: baseUrl, Referer: baseUrl + '/', 'X-Forwarded-For': '10.88.22.1' },
    body: JSON.stringify({
      businessName: 'Demo Magic Tattoo Studio',
      email: EMAIL,
      templateKey: TEMPLATE_KEY,
      industry: INDUSTRY,
      slug: SLUG,
    }),
  });

  const data = await res.json();
  if (!res.ok) {
    console.error('✗ onboarding failed:', res.status, JSON.stringify(data));
    process.exit(1);
  }

  console.log(`✓ tattoo-03 tenant created`);
  console.log(`  preview: ${baseUrl}/demo/${SLUG}`);
  console.log(`  editor:  ${baseUrl}/demo/${SLUG}/admin`);
  await pool.end();
}

main().catch(e => { console.error(e); process.exit(1); });
