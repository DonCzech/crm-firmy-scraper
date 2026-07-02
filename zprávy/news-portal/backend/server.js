import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  getArticles, getArticleBySlug, getLatestArticles,
  getBreakingArticles, getStats, getDb
} from './database.js';
import { startScheduler } from './scheduler.js';
import { fetchFullBodyForArticle } from './scraper.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const MIN_CONTENT_LENGTH_BY_SOURCE = {
  idnes: 2600,
  aktualne: 2000,
  denik: 1700,
  novinky: 1700,
  ct24: 1700,
};

app.use(cors());
app.use(express.json());

// ── API endpoints ──────────────────────────────────────────────────────────────

app.get('/api/articles', (req, res) => {
  const { category, source, limit = 20, offset = 0, search } = req.query;
  res.json(
    getArticles({ category, source, search,
      limit: parseInt(limit), offset: parseInt(offset) }).map(fmt)
  );
});

app.get('/api/articles/latest', (req, res) => {
  res.json(getLatestArticles(parseInt(req.query.limit) || 50).map(fmt));
});

app.get('/api/articles/breaking', (req, res) => {
  res.json(getBreakingArticles().map(fmt));
});

app.get('/api/articles/:slug', async (req, res) => {
  const a = getArticleBySlug(req.params.slug);
  if (!a) return res.status(404).json({ error: 'Nenalezen' });
  const refreshed = await maybeRefreshBody(a);
  res.json(fmt(refreshed));
});

app.get('/api/stats', (req, res) => res.json(getStats()));

app.get('/api/image', async (req, res) => {
  const input = String(req.query.url || '').trim();
  if (!input) return res.status(400).json({ error: 'Missing url' });
  let target;
  try {
    target = new URL(input);
  } catch {
    return res.status(400).json({ error: 'Invalid url' });
  }
  if (!/^https?:$/.test(target.protocol)) {
    return res.status(400).json({ error: 'Unsupported protocol' });
  }

  try {
    const upstream = await fetch(target.href, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
        Referer: `${target.protocol}//${target.host}/`,
        Accept: 'image/avif,image/webp,image/apng,image/*,*/*;q=0.8',
      },
    });
    if (!upstream.ok) {
      return res.status(upstream.status).end();
    }
    const contentType = upstream.headers.get('content-type') || 'image/jpeg';
    const arrayBuffer = await upstream.arrayBuffer();
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=1800');
    res.end(Buffer.from(arrayBuffer));
  } catch {
    return res.status(502).json({ error: 'Image fetch failed' });
  }
});

// ── Serve React build ──────────────────────────────────────────────────────────

const dist = path.join(__dirname, '../frontend/dist');
app.use(express.static(dist));
app.get('*', (req, res) => {
  res.sendFile(path.join(dist, 'index.html'));
});

const PORT = process.env.PORT || 3003;
app.listen(PORT, () => {
  console.log(`[SERVER] http://localhost:${PORT}`);
  startScheduler();
});

function fmt(a) {
  const title = a.original_title || '';
  const perex = a.original_perex || '';
  const bodyText = normalizeBodyText(a.original_body);
  const body = splitBodyToParagraphs(bodyText, perex);
  const contentStatus = classifyContentStatus(a.source_id, bodyText, perex);
  const contentBlocks = parseContentBlocks(a.content_json, body);
  const imageUrls = extractImageUrlsFromBlocks(contentBlocks, parseImageUrls(a.image_urls, a.image_url));

  return {
    id:          a.id,
    slug:        a.slug,
    title,
    perex,
    body,
    contentBlocks,
    category:    a.category,
    sourceName:  a.source_name,
    sourceUrl:   a.original_url,
    imageUrl:    imageUrls[0] || null,
    imageUrls,
    author:      a.author,
    tags:        a.tags ? JSON.parse(a.tags) : [],
    publishedAt: a.published_at,
    rewrittenAt: a.rewritten_at,
    isBreaking:  a.is_breaking === 1,
    views:       a.views,
    readTime:    Math.max(1, Math.ceil((bodyText?.length || perex.length || 500) / 1000)),
    contentStatus,
  };
}

function parseImageUrls(raw, fallback) {
  let urls = [];
  if (raw) {
    try {
      const parsed = JSON.parse(String(raw));
      if (Array.isArray(parsed)) {
        urls = parsed.map((item) => String(item || '').trim()).filter(Boolean);
      }
    } catch {
      // ignore invalid legacy values
    }
  }
  if (fallback && !urls.includes(fallback)) {
    urls.unshift(fallback);
  }
  return [...new Set(urls)];
}

function parseContentBlocks(raw, fallbackBody = []) {
  if (raw) {
    try {
      const parsed = JSON.parse(String(raw));
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.filter((b) => b && typeof b === 'object' && typeof b.type === 'string');
      }
    } catch {
      // ignore invalid legacy values
    }
  }

  return (Array.isArray(fallbackBody) ? fallbackBody : [])
    .map((text) => String(text || '').trim())
    .filter(Boolean)
    .map((text) => ({ type: 'paragraph', text }));
}

function extractImageUrlsFromBlocks(blocks, fallback = []) {
  const fromBlocks = (Array.isArray(blocks) ? blocks : [])
    .filter((b) => b.type === 'image' && typeof b.src === 'string')
    .map((b) => b.src.trim())
    .filter(Boolean);

  if (fromBlocks.length > 0) {
    return [...new Set(fromBlocks)];
  }
  return [...new Set(Array.isArray(fallback) ? fallback : [])];
}

function normalizeBodyText(raw) {
  if (!raw) return '';
  const trimmed = String(raw).trim();
  if (!trimmed) return '';

  // Backward compatibility: older rewritten_body is stored as JSON array.
  if ((trimmed.startsWith('[') && trimmed.endsWith(']')) || (trimmed.startsWith('"') && trimmed.endsWith('"'))) {
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) {
        return parsed
          .map((item) => String(item || '').trim())
          .filter(Boolean)
          .join('\n\n');
      }
      if (typeof parsed === 'string') return parsed;
    } catch {
      // keep plain text fallback below
    }
  }

  return trimmed;
}

function splitBodyToParagraphs(text, perex = '') {
  const source = String(text || '').trim();
  if (!source) return perex ? [perex] : [];

  const byParagraph = source
    .split(/\n{2,}/)
    .map((p) => p.replace(/\s+/g, ' ').trim())
    .filter((p) => p.length > 0);

  if (byParagraph.length > 1) return byParagraph;

  // Fallback for one-line bodies: split by sentence boundaries to keep readability.
  const bySentenceGroup = source
    .replace(/\s+/g, ' ')
    .split(/(?<=[.!?])\s+(?=[A-ZÁ-Ž0-9])/)
    .reduce((acc, sentence) => {
      const current = sentence.trim();
      if (!current) return acc;
      if (acc.length === 0) return [current];
      const last = acc[acc.length - 1];
      if (last.length < 320) {
        acc[acc.length - 1] = `${last} ${current}`.trim();
      } else {
        acc.push(current);
      }
      return acc;
    }, []);

  return bySentenceGroup.length > 0 ? bySentenceGroup : [source];
}

async function maybeRefreshBody(article) {
  if (!article) return article;
  const currentLength = String(article.original_body || '').trim().length;
  const targetMinLength = MIN_CONTENT_LENGTH_BY_SOURCE[article.source_id] ?? 900;
  const needsRefresh =
    !article.original_body ||
    currentLength < targetMinLength;

  if (!needsRefresh) return article;

  try {
    const next = await fetchFullBodyForArticle(article.original_url, article.source_id);
    const nextLen = String(next?.body || '').trim().length;
    if (!next?.body || nextLen <= currentLength) return article;

    getDb().prepare(`
      UPDATE articles
      SET original_body = $body,
          image_url = COALESCE($image_url, image_url),
          image_urls = COALESCE($image_urls, image_urls),
          content_json = COALESCE($content_json, content_json)
      WHERE id = $id
    `).run({
      $body: next.body,
      $image_url: next.imageUrl || null,
      $image_urls: Array.isArray(next.imageUrls) && next.imageUrls.length > 0 ? JSON.stringify(next.imageUrls) : null,
      $content_json: Array.isArray(next.contentBlocks) && next.contentBlocks.length > 0
        ? JSON.stringify(next.contentBlocks)
        : null,
      $id: article.id,
    });

    return {
      ...article,
      original_body: next.body,
      image_url: next.imageUrl || article.image_url,
      image_urls: Array.isArray(next.imageUrls) && next.imageUrls.length > 0
        ? JSON.stringify(next.imageUrls)
        : article.image_urls,
      content_json: Array.isArray(next.contentBlocks) && next.contentBlocks.length > 0
        ? JSON.stringify(next.contentBlocks)
        : article.content_json,
    };
  } catch {
    return article;
  }
}

function classifyContentStatus(sourceId, bodyText, perex) {
  const len = String(bodyText || '').trim().length;
  const perexLen = String(perex || '').trim().length;
  if (!len && perexLen) {
    return { level: 'partial', reason: 'source_excerpt_only' };
  }

  const minLen = MIN_CONTENT_LENGTH_BY_SOURCE[sourceId] ?? 900;
  if (len > 0 && len < minLen) {
    if (sourceId === 'idnes') {
      return { level: 'partial', reason: 'source_consent_wall' };
    }
    return { level: 'partial', reason: 'short_source_body' };
  }

  // Fallback label for known consent-wall snippets.
  if (/přihlásit|iDNES Premium|Souhlasím|cookie wall/i.test(String(bodyText || ''))) {
    return { level: 'partial', reason: 'source_consent_wall' };
  }

  return { level: 'full', reason: 'source_fulltext_available' };
}
