import pg from 'pg';
const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const r = await pool.query(`SELECT email, created_at FROM admin_accounts ORDER BY created_at`);
console.log('Admin accounts:', r.rows);
await pool.end();
