#!/usr/bin/env node
import { DatabaseSync } from 'node:sqlite';
import { Pool } from 'pg';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const defaultSqlite = path.join(__dirname, '../data/news.db');
const sqlitePath = process.env.SOURCE_SQLITE_PATH || defaultSqlite;
const targetUrl = process.env.TARGET_DATABASE_URL || process.env.DATABASE_URL;

if (!targetUrl) {
  throw new Error('TARGET_DATABASE_URL (or DATABASE_URL) is required');
}

const sqlite = new DatabaseSync(sqlitePath);
const pool = new Pool({
  connectionString: targetUrl,
  ssl: targetUrl.includes('sslmode=require') ? { rejectUnauthorized: false } : undefined,
});

async function ensureSchema() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS articles (
      id               BIGINT PRIMARY KEY,
      source_id        TEXT NOT NULL,
      source_name      TEXT NOT NULL,
      original_url     TEXT UNIQUE NOT NULL,
      original_title   TEXT NOT NULL,
      original_perex   TEXT,
      original_body    TEXT,
      rewritten_title  TEXT,
      rewritten_perex  TEXT,
      rewritten_body   TEXT,
      category         TEXT DEFAULT 'domaci',
      image_url        TEXT,
      image_urls       TEXT,
      content_json     TEXT,
      author           TEXT,
      tags             TEXT,
      published_at     TEXT NOT NULL,
      fetched_at       TEXT NOT NULL,
      rewritten_at     TEXT,
      is_breaking      INTEGER DEFAULT 0,
      views            INTEGER DEFAULT 0,
      rewrite_status   TEXT DEFAULT 'pending',
      slug             TEXT UNIQUE
    );
  `);
  await pool.query(`CREATE INDEX IF NOT EXISTS idx_articles_published ON articles(published_at DESC)`);
  await pool.query(`CREATE INDEX IF NOT EXISTS idx_articles_category ON articles(category)`);
  await pool.query(`CREATE INDEX IF NOT EXISTS idx_articles_status ON articles(rewrite_status)`);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS fetch_log (
      id               BIGINT PRIMARY KEY,
      source_id        TEXT NOT NULL,
      fetched_at       TEXT NOT NULL,
      articles_found   INTEGER DEFAULT 0,
      articles_new     INTEGER DEFAULT 0,
      error            TEXT
    );
  `);
}

async function truncateTarget() {
  await pool.query(`TRUNCATE TABLE fetch_log RESTART IDENTITY CASCADE`);
  await pool.query(`TRUNCATE TABLE articles RESTART IDENTITY CASCADE`);
}

async function insertRows(table, rows) {
  if (!rows.length) return 0;
  const cols = Object.keys(rows[0]);
  const maxParams = 25000;
  const maxRowsPerInsert = Math.max(1, Math.floor(maxParams / cols.length));
  let inserted = 0;

  for (let i = 0; i < rows.length; i += maxRowsPerInsert) {
    const part = rows.slice(i, i + maxRowsPerInsert);
    const values = [];
    const tuples = part.map((row) => {
      const placeholders = cols.map((col) => {
        values.push(row[col] ?? null);
        return `$${values.length}`;
      });
      return `(${placeholders.join(',')})`;
    });
    const sql = `
      INSERT INTO ${table} (${cols.map((c) => `"${c}"`).join(',')})
      VALUES ${tuples.join(',')}
      ON CONFLICT DO NOTHING
    `;
    await pool.query(sql, values);
    inserted += part.length;
  }
  return inserted;
}

async function fixSequence(table) {
  const seq = await pool.query(`SELECT pg_get_serial_sequence($1, 'id') AS s`, [table]);
  const seqName = seq.rows[0]?.s;
  if (!seqName) return;
  const max = await pool.query(`SELECT COALESCE(MAX(id), 0) AS m FROM ${table}`);
  const m = Number(max.rows[0]?.m || 0);
  await pool.query(`SELECT setval($1, GREATEST($2, 1), $2 > 0)`, [seqName, m]);
}

async function main() {
  await ensureSchema();
  await truncateTarget();

  const articles = sqlite.prepare(`SELECT * FROM articles ORDER BY id`).all();
  const logs = sqlite.prepare(`SELECT * FROM fetch_log ORDER BY id`).all();

  const a = await insertRows('articles', articles);
  const f = await insertRows('fetch_log', logs);
  await fixSequence('articles');
  await fixSequence('fetch_log');

  console.log(JSON.stringify({ ok: true, sqlitePath, inserted: { articles: a, fetch_log: f } }, null, 2));
}

main()
  .catch((err) => {
    console.error('migrate-sqlite-to-postgres failed:', err?.message || err);
    process.exit(1);
  })
  .finally(async () => {
    sqlite.close();
    await pool.end();
  });
