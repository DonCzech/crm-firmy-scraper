import { DatabaseSync } from 'node:sqlite';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BUNDLED_DB_PATH = path.join(__dirname, '../data/news.db');
const DB_PATH = process.env.VERCEL ? '/tmp/news.db' : BUNDLED_DB_PATH;

let db;

export function getDb() {
  if (!db) {
    if (process.env.VERCEL && !fs.existsSync(DB_PATH) && fs.existsSync(BUNDLED_DB_PATH)) {
      fs.copyFileSync(BUNDLED_DB_PATH, DB_PATH);
    }
    db = new DatabaseSync(DB_PATH);
    // On serverless read-only FS (e.g. Vercel), WAL/schema writes can fail.
    // Keep the DB usable for read endpoints even if write capabilities are unavailable.
    try { db.exec('PRAGMA journal_mode = WAL'); } catch {}
    try { initSchema(); } catch {}
  }
  return db;
}

function initSchema() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS articles (
      id               INTEGER PRIMARY KEY AUTOINCREMENT,
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

    CREATE INDEX IF NOT EXISTS idx_articles_published ON articles(published_at DESC);
    CREATE INDEX IF NOT EXISTS idx_articles_category  ON articles(category);
    CREATE INDEX IF NOT EXISTS idx_articles_status    ON articles(rewrite_status);

    CREATE TABLE IF NOT EXISTS fetch_log (
      id               INTEGER PRIMARY KEY AUTOINCREMENT,
      source_id        TEXT NOT NULL,
      fetched_at       TEXT NOT NULL,
      articles_found   INTEGER DEFAULT 0,
      articles_new     INTEGER DEFAULT 0,
      error            TEXT
    );
  `);

  ensureColumn('articles', 'image_urls', 'TEXT');
  ensureColumn('articles', 'content_json', 'TEXT');
}

function ensureColumn(table, column, sqlType) {
  const cols = db.prepare(`PRAGMA table_info(${table})`).all();
  if (!cols.some((c) => c.name === column)) {
    db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${sqlType}`);
  }
}

// ── CRUD ──────────────────────────────────────────────────────────────────────

export function insertArticle(article) {
  const stmt = getDb().prepare(`
    INSERT OR IGNORE INTO articles
      (source_id, source_name, original_url, original_title, original_perex,
       original_body, category, image_url, image_urls, content_json, author, tags, published_at,
       fetched_at, rewrite_status, slug, is_breaking)
    VALUES
      ($source_id, $source_name, $original_url, $original_title, $original_perex,
       $original_body, $category, $image_url, $image_urls, $content_json, $author, $tags, $published_at,
       $fetched_at, $rewrite_status, $slug, $is_breaking)
  `);
  return stmt.run({
    $source_id:      article.source_id,
    $source_name:    article.source_name,
    $original_url:   article.original_url,
    $original_title: article.original_title,
    $original_perex: article.original_perex ?? null,
    $original_body:  article.original_body ?? null,
    $category:       article.category,
    $image_url:      article.image_url ?? null,
    $image_urls:     article.image_urls ?? null,
    $content_json:   article.content_json ?? null,
    $author:         article.author ?? null,
    $tags:           article.tags ?? '[]',
    $published_at:   article.published_at,
    $fetched_at:     article.fetched_at,
    $rewrite_status: article.rewrite_status,
    $slug:           article.slug,
    $is_breaking:    article.is_breaking ?? 0,
  });
}

export function updateRewrittenArticle(id, data) {
  return getDb().prepare(`
    UPDATE articles
    SET rewritten_title=$title, rewritten_perex=$perex,
        rewritten_body=$body, rewrite_status='done', rewritten_at=$rewritten_at
    WHERE id=$id
  `).run({ $title: data.title, $perex: data.perex, $body: data.body, $rewritten_at: data.rewritten_at, $id: id });
}

export function markRewriteFailed(id) {
  return getDb().prepare(`UPDATE articles SET rewrite_status='failed' WHERE id=$id`).run({ $id: id });
}

export function getPendingRewrites(limit = 10) {
  return getDb().prepare(`
    SELECT * FROM articles
    WHERE rewrite_status='pending' AND original_body IS NOT NULL
    ORDER BY published_at DESC LIMIT $limit
  `).all({ $limit: limit });
}

export function getArticles({ category, source, limit = 20, offset = 0, search } = {}) {
  let where = "WHERE (original_perex IS NOT NULL OR original_title IS NOT NULL)";
  const params = {};
  if (category) { where += ' AND category=$category'; params.$category = category; }
  if (source)   { where += ' AND source_id=$source';  params.$source = source; }
  if (search) {
    where += ' AND (original_title LIKE $search1 OR original_perex LIKE $search2)';
    params.$search1 = `%${search}%`;
    params.$search2 = `%${search}%`;
  }
  params.$limit  = limit;
  params.$offset = offset;
  return getDb().prepare(
    `SELECT * FROM articles ${where} ORDER BY published_at DESC LIMIT $limit OFFSET $offset`
  ).all(params);
}

export function getArticleBySlug(slug) {
  try {
    getDb().prepare(`UPDATE articles SET views=views+1 WHERE slug=$slug`).run({ $slug: slug });
  } catch {
    // Ignore on read-only deployments.
  }
  return getDb().prepare(`SELECT * FROM articles WHERE slug=$slug`).get({ $slug: slug });
}

export function getLatestArticles(limit = 50) {
  return getDb().prepare(
    `SELECT * FROM articles
     WHERE (original_perex IS NOT NULL OR original_title IS NOT NULL)
     ORDER BY published_at DESC LIMIT $limit`
  ).all({ $limit: limit });
}

export function getBreakingArticles() {
  return getDb().prepare(
    `SELECT * FROM articles
     WHERE is_breaking=1 AND (original_perex IS NOT NULL OR original_title IS NOT NULL)
     ORDER BY published_at DESC LIMIT 5`
  ).all({});
}

export function getStats() {
  const d = getDb();
  return {
    total:   d.prepare(`SELECT COUNT(*) as c FROM articles`).get({}).c,
    done:    d.prepare(`SELECT COUNT(*) as c FROM articles WHERE rewrite_status='done'`).get({}).c,
    pending: d.prepare(`SELECT COUNT(*) as c FROM articles WHERE rewrite_status='pending'`).get({}).c,
    failed:  d.prepare(`SELECT COUNT(*) as c FROM articles WHERE rewrite_status='failed'`).get({}).c,
  };
}
