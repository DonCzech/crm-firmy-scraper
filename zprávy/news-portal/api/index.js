import express from 'express';
import cors from 'cors';
import {
  getArticles,
  getArticleBySlug,
  getLatestArticles,
  getBreakingArticles,
  getStats,
  refreshArticleBody,
} from './store.js';
import { fetchFullBodyForArticle } from '../backend/scraper.js';

const app = express();
const MIN_CONTENT_LENGTH_BY_SOURCE = {
  idnes: 2600,
  aktualne: 2000,
  denik: 1700,
  novinky: 1700,
  ct24: 1700,
};

app.use(express.json());
app.use(cors());

app.get('/api/articles', (req, res) => {
  const { category, source, limit = 20, offset = 0, search } = req.query;
  getArticles({
      category,
      source,
      search,
      limit: parseInt(String(limit), 10),
      offset: parseInt(String(offset), 10),
    })
    .then((rows) => res.json(rows.map(fmt)))
    .catch((err) => res.status(500).json({ error: err?.message || 'Failed to load articles' }));
});

app.get('/api/articles/latest', (req, res) => {
  getLatestArticles(parseInt(String(req.query.limit ?? 50), 10))
    .then((rows) => res.json(rows.map(fmt)))
    .catch((err) => res.status(500).json({ error: err?.message || 'Failed to load latest' }));
});

app.get('/api/articles/breaking', (_req, res) => {
  getBreakingArticles()
    .then((rows) => res.json(rows.map(fmt)))
    .catch((err) => res.status(500).json({ error: err?.message || 'Failed to load breaking' }));
});

app.get('/api/articles/:slug', async (req, res) => {
  const article = await getArticleBySlug(req.params.slug);
  if (!article) return res.status(404).json({ error: 'Nenalezen' });
  const refreshed = await maybeRefreshBody(article);
  return res.json(fmt(refreshed));
});

app.get('/api/stats', (_req, res) => {
  getStats()
    .then((stats) => res.json(stats))
    .catch((err) => res.status(500).json({ error: err?.message || 'Failed to load stats' }));
});

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
    if (!upstream.ok) return res.status(upstream.status).end();

    const contentType = upstream.headers.get('content-type') || 'image/jpeg';
    const arrayBuffer = await upstream.arrayBuffer();
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=1800');
    return res.end(Buffer.from(arrayBuffer));
  } catch {
    return res.status(502).json({ error: 'Image fetch failed' });
  }
});

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, timestamp: new Date().toISOString() });
});

app.get('*', (_req, res) => {
  res.status(404).json({ error: 'Not found' });
});

export default async function handler(req, res) {
  return app(req, res);
}

function fmt(a) {
  const title = a.original_title || '';
  const perex = a.original_perex || '';
  const bodyText = normalizeBodyText(a.original_body);
  const body = splitBodyToParagraphs(bodyText, perex);
  const contentStatus = classifyContentStatus(a.source_id, bodyText, perex);
  const contentBlocks = parseContentBlocks(a.content_json, body);
  const imageUrls = extractImageUrlsFromBlocks(contentBlocks, parseImageUrls(a.image_urls, a.image_url));

  return {
    id: a.id,
    slug: a.slug,
    title,
    perex,
    body,
    contentBlocks,
    category: a.category,
    sourceName: a.source_name,
    sourceUrl: a.original_url,
    imageUrl: imageUrls[0] || null,
    imageUrls,
    author: a.author,
    tags: a.tags ? JSON.parse(a.tags) : [],
    publishedAt: a.published_at,
    rewrittenAt: a.rewritten_at,
    isBreaking: a.is_breaking === 1,
    views: a.views,
    readTime: Math.max(1, Math.ceil((bodyText?.length || perex.length || 500) / 1000)),
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
    } catch {}
  }
  if (fallback && !urls.includes(fallback)) urls.unshift(fallback);
  return [...new Set(urls)];
}

function parseContentBlocks(raw, fallbackBody = []) {
  if (raw) {
    try {
      const parsed = JSON.parse(String(raw));
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.filter((b) => b && typeof b === 'object' && typeof b.type === 'string');
      }
    } catch {}
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
  if (fromBlocks.length > 0) return [...new Set(fromBlocks)];
  return [...new Set(Array.isArray(fallback) ? fallback : [])];
}

function normalizeBodyText(raw) {
  if (!raw) return '';
  const trimmed = String(raw).trim();
  if (!trimmed) return '';

  if ((trimmed.startsWith('[') && trimmed.endsWith(']')) || (trimmed.startsWith('"') && trimmed.endsWith('"'))) {
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) {
        return parsed.map((item) => String(item || '').trim()).filter(Boolean).join('\n\n');
      }
      if (typeof parsed === 'string') return parsed;
    } catch {}
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

function classifyContentStatus(sourceId, bodyText, perexText) {
  const bodyLen = (bodyText || '').trim().length;
  const perexLen = (perexText || '').trim().length;
  const minBySource = {
    idnes: 2600,
    aktualne: 2000,
    denik: 1700,
    novinky: 1700,
    ct24: 1700,
  };
  const minLen = minBySource[sourceId] ?? 900;

  if (bodyLen >= minLen) return { level: 'full', reason: 'full_text' };
  if (bodyLen >= 600) return { level: 'partial', reason: 'short_body' };
  if (perexLen > 0 && bodyLen < 200) return { level: 'partial', reason: 'source_consent_wall' };
  return { level: 'minimal', reason: 'missing_body' };
}

async function maybeRefreshBody(article) {
  if (!article) return article;

  const currentLength = String(article.original_body || '').trim().length;
  const targetMinLength = MIN_CONTENT_LENGTH_BY_SOURCE[article.source_id] ?? 900;
  const needsRefresh = !article.original_body || currentLength < targetMinLength;
  if (!needsRefresh) return article;

  try {
    const next = await fetchFullBodyForArticle(article.original_url, article.source_id);
    const nextLen = String(next?.body || '').trim().length;
    if (!next?.body || nextLen <= currentLength) return article;

    await refreshArticleBody(
      article.id,
      next.body,
      next.imageUrl || null,
      Array.isArray(next.imageUrls) && next.imageUrls.length > 0 ? JSON.stringify(next.imageUrls) : null,
      Array.isArray(next.contentBlocks) && next.contentBlocks.length > 0 ? JSON.stringify(next.contentBlocks) : null,
    );

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
