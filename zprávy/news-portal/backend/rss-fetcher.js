import Parser from 'rss-parser';
import { RSS_SOURCES } from './config.js';
import { insertArticle } from './database.js';
import { generateSlug, guessCategory } from './utils.js';

const parser = new Parser({
  timeout: 10000,
  headers: { 'User-Agent': 'Mozilla/5.0 (compatible; NewsBot/1.0)' }
});

export async function fetchAllFeeds() {
  const results = [];
  for (const source of RSS_SOURCES.filter(s => s.enabled)) {
    try {
      const result = await fetchFeed(source);
      results.push(result);
      console.log(`[RSS] ${source.name}: ${result.newCount} nových článků`);
    } catch (err) {
      console.error(`[RSS] Chyba ${source.name}:`, err.message);
      results.push({ source: source.id, newCount: 0, error: err.message });
    }
    await sleep(1000);
  }
  return results;
}

async function fetchFeed(source) {
  const feed = await parser.parseURL(source.rssUrl);
  let newCount = 0;

  for (const item of feed.items.slice(0, 20)) {
    const article = {
      source_id:      source.id,
      source_name:    source.name,
      original_url:   item.link || item.guid,
      original_title: item.title || 'Bez titulku',
      original_perex: stripHtml(item.contentSnippet || item.summary || ''),
      original_body:  null,
      category:       guessCategory(item.title, normalizeCategories(item.categories)),
      image_url:      extractImage(item),
      author:         item.author || item.creator || source.name,
      tags:           JSON.stringify(normalizeCategories(item.categories)),
      published_at:   item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString(),
      fetched_at:     new Date().toISOString(),
      rewrite_status: 'pending',
      slug:           generateSlug(item.title || '', item.link || ''),
      is_breaking:    isBreaking(item.title) ? 1 : 0
    };
    const result = insertArticle(article);
    if (result.changes > 0) newCount++;
  }
  return { source: source.id, newCount };
}

// RSS categories can be strings or objects {_: 'label', $: {domain: ...}}
function normalizeCategories(cats = []) {
  return (cats || []).map(c => (typeof c === 'string' ? c : c?._ || '')).filter(Boolean);
}

function extractImage(item) {
  if (item.enclosure?.url) return item.enclosure.url;
  if (item['media:content']?.['$']?.url) return item['media:content']['$'].url;
  const m = (item.content || '').match(/<img[^>]+src="([^"]+)"/);
  return m ? m[1] : null;
}

function isBreaking(title = '') {
  const kw = ['zemřel', 'exploz', 'útok', 'neštěstí', 'tragédie', 'havárie', 'požár'];
  return kw.some(k => title.toLowerCase().includes(k));
}

function stripHtml(html) {
  return html.replace(/<[^>]*>/g, '').replace(/&[a-z]+;/g, ' ').trim();
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }
