import axios from 'axios';
import * as cheerio from 'cheerio';
import { RSS_SOURCES } from './config.js';
import { getDb } from './database.js';

const http = axios.create({
  timeout: 15000,
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    'Accept': 'text/html,application/xhtml+xml',
    'Accept-Language': 'cs-CZ,cs;q=0.9',
  }
});

const MIN_CONTENT_LENGTH_BY_SOURCE = {
  idnes: 2600,
  aktualne: 2000,
  denik: 1700,
  novinky: 1700,
  ct24: 1700,
};

export async function scrapeArticleBodies() {
  const db = getDb();
  const articles = db.prepare(`
    SELECT id, original_url, source_id, image_url, image_urls FROM articles
    WHERE (original_body IS NULL OR length(original_body) >= 7900)
    ORDER BY published_at DESC LIMIT 15
  `).all();

  console.log(`[SCRAPER] Scrapuji fulltext pro ${articles.length} článků`);

  for (const article of articles) {
    try {
      const { body, imageUrl, imageUrls, contentBlocks } = await scrapeArticle(article.original_url, article.source_id);
      const newImage = imageUrl || article.image_url || null;
      const mergedImageUrls = mergeImageUrls(imageUrls, article.image_urls, newImage);
      if (body && body.length > 100) {
        db.prepare(`UPDATE articles
          SET original_body=$body, image_url=$img, image_urls=$imgs, content_json=$content
          WHERE id=$id`)
          .run({
            $body: body,
            $img: newImage,
            $imgs: serializeImageUrls(mergedImageUrls),
            $content: serializeContentBlocks(contentBlocks),
            $id: article.id,
          });
      } else {
        db.prepare(`UPDATE articles
          SET original_body=original_perex, image_url=$img, image_urls=$imgs, content_json=$content
          WHERE id=$id`)
          .run({
            $img: newImage,
            $imgs: serializeImageUrls(mergedImageUrls),
            $content: serializeContentBlocks(contentBlocks),
            $id: article.id,
          });
      }
    } catch (err) {
      console.error(`[SCRAPER] Chyba ${article.original_url}:`, err.message);
      db.prepare(`UPDATE articles SET original_body=original_perex WHERE id=$id`).run({ $id: article.id });
    }
    await sleep(2000);
  }
}

// Scrape images for articles that already have body but no image
export async function scrapeArticleImages() {
  const db = getDb();
  const articles = db.prepare(`
    SELECT id, original_url, source_id, image_url, image_urls FROM articles
    WHERE (image_url IS NULL OR image_urls IS NULL OR length(image_urls) < 5)
      AND original_body IS NOT NULL
    ORDER BY published_at DESC LIMIT 20
  `).all();

  if (!articles.length) return;
  console.log(`[SCRAPER] Scrapuji obrázky pro ${articles.length} článků`);

  for (const article of articles) {
    try {
      const { imageUrl, imageUrls, contentBlocks } = await scrapeArticle(article.original_url, article.source_id);
      if (imageUrl || (imageUrls && imageUrls.length > 0)) {
        const mergedImageUrls = mergeImageUrls(imageUrls, article.image_urls, imageUrl || article.image_url);
        db.prepare(`UPDATE articles
          SET image_url=$img, image_urls=$imgs, content_json=COALESCE($content, content_json)
          WHERE id=$id`)
          .run({
            $img: imageUrl || article.image_url || null,
            $imgs: serializeImageUrls(mergedImageUrls),
            $content: serializeContentBlocks(contentBlocks),
            $id: article.id,
          });
      }
    } catch (err) {
      // silent - images are optional
    }
    await sleep(1500);
  }
}

export async function backfillAllArticleImages(limit = 500) {
  const db = getDb();
  const rows = db.prepare(`
    SELECT id, original_url, source_id, image_url, image_urls
    FROM articles
    WHERE original_body IS NOT NULL
    ORDER BY published_at DESC
    LIMIT $limit
  `).all({ $limit: Number(limit) || 500 });

  const target = rows.filter((row) => parseImageUrls(row.image_urls).length < 3);
  if (!target.length) return;
  console.log(`[SCRAPER] Backfill všech obrázků pro ${target.length} článků`);

  for (const article of target) {
    try {
      const { imageUrl, imageUrls, contentBlocks } = await scrapeArticle(article.original_url, article.source_id);
      const mergedImageUrls = mergeImageUrls(imageUrls, article.image_urls, imageUrl || article.image_url);
      if (mergedImageUrls.length > 0) {
        db.prepare(`UPDATE articles
          SET image_url=$img, image_urls=$imgs, content_json=COALESCE($content, content_json)
          WHERE id=$id`)
          .run({
            $img: mergedImageUrls[0],
            $imgs: serializeImageUrls(mergedImageUrls),
            $content: serializeContentBlocks(contentBlocks),
            $id: article.id,
          });
      }
    } catch (err) {
      console.error(`[SCRAPER] Backfill obrázků chyba ${article.original_url}:`, err.message);
    }
    await sleep(350);
  }
}

export async function rescrapeArticlesBySource(sourceId, limit = 200) {
  const db = getDb();
  const rows = db.prepare(`
    SELECT id, original_url, source_id, image_url, image_urls
    FROM articles
    WHERE source_id = $sourceId
    ORDER BY published_at DESC
    LIMIT $limit
  `).all({ $sourceId: sourceId, $limit: Number(limit) || 200 });

  console.log(`[SCRAPER] Rescrape source=${sourceId}, count=${rows.length}`);
  for (const article of rows) {
    try {
      const { body, imageUrl, imageUrls, contentBlocks } = await scrapeArticle(article.original_url, article.source_id);
      const mergedImageUrls = mergeImageUrls(imageUrls, article.image_urls, imageUrl || article.image_url);
      if (body && body.length > 100) {
        db.prepare(`UPDATE articles
          SET original_body=$body,
              image_url=COALESCE($img, image_url),
              image_urls=$imgs,
              content_json=$content
          WHERE id=$id`)
          .run({
            $body: body,
            $img: imageUrl || null,
            $imgs: serializeImageUrls(mergedImageUrls),
            $content: serializeContentBlocks(contentBlocks),
            $id: article.id,
          });
      }
    } catch (err) {
      console.error(`[SCRAPER] Rescrape chyba ${article.original_url}:`, err.message);
    }
    await sleep(500);
  }
}

export async function fetchFullBodyForArticle(url, sourceId) {
  const { body, imageUrl, imageUrls, contentBlocks } = await scrapeArticle(url, sourceId);
  return { body, imageUrl, imageUrls, contentBlocks };
}

async function scrapeArticle(url, sourceId) {
  const source = RSS_SOURCES.find(s => s.id === sourceId);
  const selector = source?.articleSelector || 'article, .article-body, main p';

  const response = await http.get(url, {
    headers: buildSourceHeaders(sourceId),
  });
  const $ = cheerio.load(response.data);

  $('script,style,nav,header,footer,.ad,.advertisement,.related,.comments').remove();

  const structured = extractStructuredContent($, selector, url, sourceId);
  let text = normalizeText(structured.paragraphs.join('\n\n'));
  let contentBlocks = structured.contentBlocks;
  let imageUrls = [...structured.imageUrls];
  const fallbackEmbeds = extractEmbedsFromRawHtml(response.data, url);

  if (!text || text.length < 100) {
    const fallbackText = extractStructuredText($, selector) || extractStructuredText($, 'article') || extractStructuredText($, 'main');
    text = normalizeText(fallbackText);
    contentBlocks = text
      .split(/\n{2,}/)
      .map((line) => cleanParagraphText(line))
      .filter(Boolean)
      .map((line) => ({ type: 'paragraph', text: line }));
  }

  // Some sources (notably iDnes) frequently return cookie-wall fragments in direct HTML.
  // Fallback to jina.ai reader when direct extraction is too short or low quality.
  if (isLikelyIncomplete(text, sourceId)) {
    const jinaText = await fetchViaJinaReader(url);
    if (jinaText && jinaText.length > text.length && !isConsentOrPolicyText(jinaText)) {
      text = jinaText;
      contentBlocks = text
        .split(/\n{2,}/)
        .map((line) => cleanParagraphText(line))
        .filter(Boolean)
        .map((line) => ({ type: 'paragraph', text: line }));
    }
  }

  if (imageUrls.length === 0) {
    const lead = extractMetaImages($, url)[0] || null;
    if (lead) {
      imageUrls = [lead];
      contentBlocks = [{ type: 'image', src: lead }, ...contentBlocks];
    }
  }
  if (fallbackEmbeds.length > 0) {
    const existing = new Set(
      contentBlocks
        .filter((b) => b.type === 'embed' && typeof b.src === 'string')
        .map((b) => b.src)
    );
    for (const embed of fallbackEmbeds) {
      if (existing.has(embed.src)) continue;
      contentBlocks.push(embed);
      existing.add(embed.src);
    }
  }
  const imageUrl = imageUrls[0] || null;

  return {
    body: text,
    imageUrl,
    imageUrls,
    contentBlocks,
  };
}

function buildSourceHeaders(sourceId) {
  const headers = {};
  const key = String(sourceId || '').toUpperCase();
  const cookie = process.env[`${key}_COOKIE`];
  const userAgent = process.env[`${key}_USER_AGENT`];

  if (cookie && cookie.trim()) {
    headers.Cookie = cookie.trim();
  }
  if (userAgent && userAgent.trim()) {
    headers['User-Agent'] = userAgent.trim();
  }
  return headers;
}

function extractStructuredText($, selector) {
  const root = $(selector).first();
  if (!root || root.length === 0) return '';

  const paragraphNodes = root.find('p');
  if (paragraphNodes.length > 0) {
    return paragraphNodes
      .toArray()
      .map((el) => $(el).text())
      .join('\n\n')
      .trim();
  }

  return root.text().trim();
}

function extractStructuredContent($, selector, pageUrl, sourceId) {
  const root = resolveContentRoot($, selector, sourceId);
  if (!root || root.length === 0) {
    return { paragraphs: [], imageUrls: [], contentBlocks: [] };
  }

  const clone = root.clone();
  clone.find('script,style,.reklama,.ad,.advertisement,.related,.comments,.e-ads-banner,.e-web-aktualne-articles-card-horizontal,.e-web-aktualne-articles-timeline').remove();

  const paragraphs = [];
  const images = [];
  const contentBlocks = [];
  const seen = new Set();

  clone.find('p, img, iframe, video, a[href]').each((_, el) => {
    const node = $(el);
    const tag = String(el.tagName || '').toLowerCase();

    if (tag === 'p') {
      const text = cleanParagraphText(node.text());
      if (!text) return;
      paragraphs.push(text);
      contentBlocks.push({ type: 'paragraph', text });
      return;
    }

    if (tag === 'img') {
      const src = resolveUrl(
        node.attr('src') || node.attr('data-src') || node.attr('data-original') || node.attr('data-lazy-src'),
        pageUrl
      );
      if (!isValidImageUrl(src)) return;
      if (seen.has(`img:${src}`)) return;
      seen.add(`img:${src}`);
      images.push(src);
      contentBlocks.push({ type: 'image', src });
      return;
    }

    if (tag === 'iframe' || tag === 'video') {
      const src = resolveUrl(node.attr('src'), pageUrl);
      if (!isEmbeddableUrl(src)) return;
      if (!shouldKeepEmbed(src)) return;
      if (seen.has(`embed:${src}`)) return;
      seen.add(`embed:${src}`);
      contentBlocks.push({ type: 'embed', src, provider: detectProvider(src) });
      return;
    }

    if (tag === 'a') {
      if (node.parents('p').length > 0) return;
      const href = resolveUrl(node.attr('href'), pageUrl);
      if (!isEmbeddableUrl(href)) return;
      if (!shouldKeepEmbed(href)) return;
      if (seen.has(`embed:${href}`)) return;
      seen.add(`embed:${href}`);
      contentBlocks.push({ type: 'embed', src: href, provider: detectProvider(href) });
    }
  });

  return {
    paragraphs,
    imageUrls: [...new Set(images)].slice(0, 20),
    contentBlocks,
  };
}

function resolveContentRoot($, selector, sourceId) {
  const sourceRootSelectors = {
    aktualne: '.e-web-aktualne-articles-show-body .f-tiptap-content__root, .e-web-aktualne-articles-show-body',
    idnes: '.art-full-text, [itemprop="articleBody"], .article-body',
    novinky: '.article-body, .article-text',
    denik: '.article-body, [itemprop="articleBody"]',
    ct24: '.article__body, .article-body, [itemprop="articleBody"]',
  };

  const specific = sourceRootSelectors[sourceId];
  if (specific) {
    const root = $(specific).first();
    if (root && root.length > 0) return root;
  }
  return $(selector).first();
}

function normalizeText(text) {
  return String(text || '')
    .replace(/\r/g, '\n')
    .replace(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g, '$1')
    .replace(/https?:\/\/\S+/g, '')
    .split('\n')
    .map((line) => cleanParagraphText(line))
    .filter(Boolean)
    .join('\n\n')
    .trim();
}

function isLikelyIncomplete(text, sourceId) {
  const normalized = String(text || '').trim();
  if (!normalized) return true;

  if (/přihlásit|iDNES Premium|Souhlasím|cookie wall|podrobné nastavení/i.test(normalized) || isConsentOrPolicyText(normalized)) {
    return true;
  }

  const minLen = MIN_CONTENT_LENGTH_BY_SOURCE[sourceId] ?? 900;
  return normalized.length < minLen;
}

async function fetchViaJinaReader(url) {
  try {
    const normalizedUrl = String(url || '').replace(/^https?:\/\//, '');
    const readerUrl = `https://r.jina.ai/http://${normalizedUrl}`;
    const response = await http.get(readerUrl, { timeout: 20000 });
    return extractMainTextFromReader(response?.data);
  } catch {
    return '';
  }
}

function extractMainTextFromReader(raw) {
  const text = String(raw || '');
  if (!text) return '';
  const markdownStart = text.indexOf('Markdown Content:');
  const content = markdownStart >= 0 ? text.slice(markdownStart + 'Markdown Content:'.length) : text;

  const lines = content
    .split('\n')
    .map((line) => line.replace(/\r/g, '').trim())
    .filter(Boolean);

  const picked = [];
  let started = false;

  for (const line of lines) {
    if (!started) {
      // Start at the first paragraph-like sentence block (not nav/link markup).
      const looksLikeSentence =
        line.length >= 120 &&
        /[.!?]/.test(line) &&
        !line.includes('http') &&
        !line.startsWith('* ') &&
        !line.startsWith('[') &&
        !line.startsWith('![');
      if (looksLikeSentence) started = true;
      else continue;
    }

    if (/^\[###\s/.test(line) || /^###\s\[/.test(line)) {
      if (picked.join('\n\n').length > 1800) break;
      continue;
    }
    if (/^\* /.test(line)) continue;
    if (/^!\[Image/i.test(line)) continue;
    if (/^\[[^\]]+\]\([^)]*\)$/.test(line)) continue;
    if (/^\[.*\]\(https?:\/\//.test(line)) continue;
    if (/FCID=|PBFCID=|RANDOM=|mafra\/count/i.test(line)) continue;
    if (/^(Diskuse|Přečíst později|Sdílet článek|Uloženo na přečtení)\b/i.test(line)) continue;
    if (/^\d{1,2}\.\s*\w+\s*\d{4}/.test(line)) continue;
    if (/^další články|doporučujeme|související/i.test(line)) break;

    if (line.length < 40 && !line.startsWith('### ')) continue;
    picked.push(line);
  }

  return normalizeText(picked.join('\n\n'));
}

function isConsentOrPolicyText(text) {
  const value = String(text || '').toLowerCase();
  if (!value) return false;
  return (
    value.includes('soubory cookies') ||
    value.includes('nastavení soukromí') ||
    value.includes('oprávněného zájmu') ||
    value.includes('na těchto webových stránkách se používají') ||
    value.includes('partneři máme k těmto údajům')
  );
}

function extractMetaImages($, pageUrl) {
  const candidates = [
    $('meta[property="og:image"]').attr('content'),
    $('meta[name="twitter:image"]').attr('content'),
    $('meta[property="og:image:url"]').attr('content'),
    $('link[rel="image_src"]').attr('href'),
  ]
    .map((src) => resolveUrl(src, pageUrl))
    .filter((src) => isValidImageUrl(src));

  return [...new Set(candidates)].slice(0, 5);
}

function isValidImageUrl(url) {
  if (!url) return false;
  const lower = url.toLowerCase();
  if (!/^https?:\/\//.test(lower)) return false;
  if (!/\.(jpg|jpeg|png|webp|gif|bmp|avif)(\?|$)/i.test(lower)) return false;
  if (/(logo|icon|sprite|avatar|pixel|favicon)/.test(lower)) return false;
  return true;
}

function isEmbeddableUrl(url) {
  if (!url) return false;
  const lower = String(url).toLowerCase();
  return (
    lower.includes('x.com/') ||
    lower.includes('twitter.com/') ||
    lower.includes('youtube.com/') ||
    lower.includes('youtu.be/') ||
    lower.includes('vimeo.com/') ||
    lower.includes('facebook.com/') ||
    lower.includes('instagram.com/')
  );
}

function detectProvider(url) {
  const lower = String(url || '').toLowerCase();
  if (lower.includes('x.com') || lower.includes('twitter.com')) return 'x';
  if (lower.includes('youtube.com') || lower.includes('youtu.be')) return 'youtube';
  if (lower.includes('vimeo.com')) return 'vimeo';
  if (lower.includes('facebook.com')) return 'facebook';
  if (lower.includes('instagram.com')) return 'instagram';
  if (lower.includes('.sdn.cz/v_') || lower.includes('.sdn.cz/vmd/')) return 'sdnvideo';
  return 'embed';
}

function cleanParagraphText(value) {
  const text = String(value || '')
    .replace(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g, '$1')
    .replace(/https?:\/\/\S+/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  if (!text) return '';
  if (text.length < 20) return '';
  if (/^reklama$/i.test(text)) return '';
  if (/^sdílet$/i.test(text)) return '';
  if (isConsentOrPolicyText(text)) return '';
  return text;
}

function shouldKeepEmbed(url) {
  const value = String(url || '').toLowerCase();
  if (!value) return false;
  if (value.includes('twitter.com/intent/')) return false;
  if (value.includes('x.com/intent/')) return false;
  if (/https?:\/\/(?:x|twitter)\.com\/[a-z0-9_]+\/?$/i.test(value)) return false;
  if (value.includes('/share?')) return false;
  return true;
}

function extractEmbedsFromRawHtml(rawHtml, pageUrl) {
  const html = String(rawHtml || '').replace(/\\\//g, '/');
  if (!html) return [];
  const urls = new Set();
  const push = (u) => {
    const resolved = resolveUrl(String(u || '').trim(), pageUrl);
    if (!resolved) return;
    if (isEmbeddableUrl(resolved) || detectProvider(resolved) === 'sdnvideo') {
      if (!shouldKeepEmbed(resolved)) return;
      urls.add(resolved);
    }
  };

  const patterns = [
    /https?:\/\/(?:x\.com|twitter\.com|youtube\.com|youtu\.be|vimeo\.com|facebook\.com|instagram\.com)\/[^\s"'<>\\]+/gi,
    /https?:\/\/v\d+-a\.sdn\.cz\/[^\s"'<>\\|]+/gi,
    /https?:\/\/v\d+-a\.sdn\.cz\/vmd\/[^\s"'<>\\|]+/gi,
  ];

  for (const re of patterns) {
    const matches = html.match(re) || [];
    for (const m of matches) push(m);
  }

  return [...urls].slice(0, 6).map((src) => ({
    type: 'embed',
    src,
    provider: detectProvider(src),
  }));
}

function parseImageUrls(raw) {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(String(raw));
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((x) => String(x || '').trim())
      .filter(Boolean);
  } catch {
    return [];
  }
}

function mergeImageUrls(nextUrls, storedUrlsRaw, imageUrl) {
  const merged = [
    ...(Array.isArray(nextUrls) ? nextUrls : []),
    imageUrl || '',
  ].map((x) => String(x || '').trim())
    .filter(Boolean);
  return [...new Set(merged)];
}

function serializeImageUrls(urls) {
  if (!Array.isArray(urls) || urls.length === 0) return null;
  return JSON.stringify(urls);
}

function serializeContentBlocks(blocks) {
  if (!Array.isArray(blocks) || blocks.length === 0) return null;
  return JSON.stringify(blocks);
}

function resolveUrl(imgUrl, pageUrl) {
  if (!imgUrl) return null;
  if (imgUrl.startsWith('http')) return imgUrl;
  try {
    return new URL(imgUrl, pageUrl).href;
  } catch {
    return null;
  }
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }
