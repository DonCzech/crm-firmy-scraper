import pg from 'pg';
const { Pool } = pg;
const pool = new Pool({ connectionString: 'postgresql://neondb_owner:npg_RG6Q7owUlpXr@ep-still-recipe-alrqcrzd-pooler.c-3.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require' });

const r = await pool.query(`SELECT email, created_at FROM admin_accounts ORDER BY created_at`);
console.log('Admin accounts:', r.rows);
await pool.end();
