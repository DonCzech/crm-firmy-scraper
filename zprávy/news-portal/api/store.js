import { Pool } from 'pg';

const DATABASE_URL = (process.env.DATABASE_URL || '').trim();

if (!DATABASE_URL) {
  throw new Error('DATABASE_URL is required for API runtime');
}

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: DATABASE_URL.includes('sslmode=require') ? { rejectUnauthorized: false } : undefined,
});

let initPromise;

async function initSchema() {
  if (!initPromise) {
    initPromise = (async () => {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS articles (
          id               BIGSERIAL PRIMARY KEY,
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
          id               BIGSERIAL PRIMARY KEY,
          source_id        TEXT NOT NULL,
          fetched_at       TEXT NOT NULL,
          articles_found   INTEGER DEFAULT 0,
          articles_new     INTEGER DEFAULT 0,
          error            TEXT
        );
      `);
    })();
  }
  return initPromise;
}

export async function getArticles({ category, source, limit = 20, offset = 0, search } = {}) {
  await initSchema();
  const where = [`(original_perex IS NOT NULL OR original_title IS NOT NULL)`];
  const params = [];
  if (category) {
    params.push(category);
    where.push(`category = $${params.length}`);
  }
  if (source) {
    params.push(source);
    where.push(`source_id = $${params.length}`);
  }
  if (search) {
    params.push(`%${search}%`);
    where.push(`(original_title ILIKE $${params.length} OR original_perex ILIKE $${params.length})`);
  }
  params.push(Number(limit) || 20);
  const limitPos = params.length;
  params.push(Number(offset) || 0);
  const offsetPos = params.length;

  const sql = `
    SELECT * FROM articles
    WHERE ${where.join(' AND ')}
    ORDER BY published_at DESC
    LIMIT $${limitPos} OFFSET $${offsetPos}
  `;
  const { rows } = await pool.query(sql, params);
  return rows;
}

export async function getLatestArticles(limit = 50) {
  await initSchema();
  const { rows } = await pool.query(
    `SELECT * FROM articles WHERE (original_perex IS NOT NULL OR original_title IS NOT NULL) ORDER BY published_at DESC LIMIT $1`,
    [Number(limit) || 50],
  );
  return rows;
}

export async function getBreakingArticles() {
  await initSchema();
  const { rows } = await pool.query(
    `SELECT * FROM articles WHERE is_breaking=1 AND (original_perex IS NOT NULL OR original_title IS NOT NULL) ORDER BY published_at DESC LIMIT 5`,
  );
  return rows;
}

export async function getArticleBySlug(slug) {
  await initSchema();
  await pool.query(`UPDATE articles SET views=views+1 WHERE slug=$1`, [slug]).catch(() => {});
  const { rows } = await pool.query(`SELECT * FROM articles WHERE slug=$1 LIMIT 1`, [slug]);
  return rows[0] || null;
}

export async function getStats() {
  await initSchema();
  const [{ rows: total }, { rows: done }, { rows: pending }, { rows: failed }] = await Promise.all([
    pool.query(`SELECT COUNT(*)::bigint AS c FROM articles`),
    pool.query(`SELECT COUNT(*)::bigint AS c FROM articles WHERE rewrite_status='done'`),
    pool.query(`SELECT COUNT(*)::bigint AS c FROM articles WHERE rewrite_status='pending'`),
    pool.query(`SELECT COUNT(*)::bigint AS c FROM articles WHERE rewrite_status='failed'`),
  ]);
  return {
    total: Number(total[0].c || 0),
    done: Number(done[0].c || 0),
    pending: Number(pending[0].c || 0),
    failed: Number(failed[0].c || 0),
  };
}

export async function refreshArticleBody(id, body, imageUrl, imageUrls, contentJson) {
  await initSchema();
  await pool.query(
    `
    UPDATE articles
    SET original_body = $2,
        image_url = COALESCE($3, image_url),
        image_urls = COALESCE($4, image_urls),
        content_json = COALESCE($5, content_json)
    WHERE id = $1
    `,
    [id, body, imageUrl || null, imageUrls || null, contentJson || null],
  );
}
