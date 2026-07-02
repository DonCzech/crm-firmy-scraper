const cheerio = require('cheerio');
const { fetchText } = require('./http');

const BASE_URL = 'https://www.bombuj.si';
const SITEMAP_URL = `${BASE_URL}/sitemap.xml`;
const UVOD_URL = `${BASE_URL}/uvod.php`;

function decodeEntities(value) {
  return String(value || '')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
}

function absoluteUrl(input) {
  if (!input) return null;
  if (input.startsWith('http://') || input.startsWith('https://')) return input;
  if (input.startsWith('//')) return `https:${input}`;
  if (input.startsWith('/')) return `${BASE_URL}${input}`;
  return `${BASE_URL}/${input.replace(/^\/+/, '')}`;
}

function extractLocUrls(xml) {
  const out = [];
  const re = /<loc>(.*?)<\/loc>/gsi;
  let m = re.exec(xml);
  while (m) {
    out.push(m[1].trim());
    m = re.exec(xml);
  }
  return out;
}

function extractFilmUrlsFromHtml(html) {
  const out = new Set();
  const re = /href=["'](?:https?:)?\/\/(?:www\.)?bombuj\.si\/(online-film-[^"'#?\s]+)|href=["']\/(online-film-[^"'#?\s]+)/gi;
  let m = re.exec(html);
  while (m) {
    const slug = (m[1] || m[2] || '').replace(/^\/+/, '');
    if (slug.startsWith('online-film-')) out.add(`${BASE_URL}/${slug}`);
    m = re.exec(html);
  }
  return [...out];
}

function slugFromUrl(pageUrl) {
  const pathname = new URL(pageUrl).pathname;
  return pathname.replace(/^\/+/, '').replace(/\/+$/, '').replace(/^online-film-/, '');
}

function parseTitleFromHtml(html, fallbackSlug) {
  const ogDouble = html.match(/<meta[^>]*property=["']og:title["'][^>]*content="([^"]+)"/i);
  if (ogDouble?.[1]) {
    return ogDouble[1].replace(/\s*\|\s*online film\s*$/i, '').trim();
  }

  const ogSingle = html.match(/<meta[^>]*property=["']og:title["'][^>]*content='([^']+)'/i);
  if (ogSingle?.[1]) {
    return ogSingle[1].replace(/\s*\|\s*online film\s*$/i, '').trim();
  }

  const titleMatch = html.match(/<title>([^<]+)<\/title>/i);
  if (titleMatch?.[1]) {
    return titleMatch[1].split('|')[0].trim();
  }

  return fallbackSlug.replace(/-/g, ' ').trim();
}

function extractAjaxParam(html, key) {
  const esc = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp(`${esc}\\s*:\\s*'([^']*)'`, 'i');
  return html.match(re)?.[1] ?? '';
}

function extractAjaxDataParam(html, key) {
  const dataBlock = html.match(/data\s*:\s*\{([\s\S]*?)\}\s*,\s*success/i)?.[1] || '';
  if (!dataBlock) return '';
  return extractAjaxParam(dataBlock, key);
}

function parseMovieAjaxPayload(html, pageUrl) {
  const slug = slugFromUrl(pageUrl);
  return {
    url: extractAjaxDataParam(html, 'url') || slug,
    imdb_id: extractAjaxDataParam(html, 'imdb_id') || extractAjaxParam(html, 'imdb_id'),
    tmdb_id: extractAjaxDataParam(html, 'tmdb_id') || extractAjaxParam(html, 'tmdb_id'),
    vhs: extractAjaxDataParam(html, 'vhs'),
    name: extractAjaxDataParam(html, 'name'),
    hmd: extractAjaxDataParam(html, 'hmd'),
    nazovprehraj: extractAjaxDataParam(html, 'nazovprehraj')
  };
}

function parseServerLinks(html) {
  const collected = [];

  const cleanText = (input) =>
    decodeEntities(String(input || '').replace(/<[^>]+>/g, ' '))
      .replace(/\s+/g, ' ')
      .trim();

  const sectionRe = /<div[^>]*class=["'][^"']*dropdownlink[^"']*["'][^>]*>([\s\S]*?)<\/div>\s*<ul[^>]*class=["'][^"']*submenuItems[^"']*["'][^>]*>([\s\S]*?)<\/ul>/gi;
  let sectionMatch = sectionRe.exec(html);

  while (sectionMatch) {
    const languageLabel = cleanText(sectionMatch[1]) || null;
    const ulHtml = sectionMatch[2] || '';
    const liRe = /<li[^>]*\blink=["']([^"']+)["'][^>]*>([\s\S]*?)<\/li>/gi;
    let liMatch = liRe.exec(ulHtml);
    let idx = 0;

    while (liMatch) {
      const rawLink = decodeEntities(liMatch[1]);
      const serverName = cleanText(liMatch[2]);
      const playerUrl = absoluteUrl(rawLink);
      if (playerUrl) {
        const isVip = /vip/i.test(serverName);
        const isNew = /\(new\)/i.test(serverName);
        collected.push({
          languageLabel,
          serverName,
          playerUrl,
          playerPath: new URL(playerUrl).pathname,
          position: idx,
          isVip,
          isNew
        });
        idx += 1;
      }
      liMatch = liRe.exec(ulHtml);
    }

    sectionMatch = sectionRe.exec(html);
  }

  const uniq = new Map();
  for (const item of collected) {
    const key = `${item.languageLabel || ''}::${item.playerUrl}`;
    if (!uniq.has(key)) uniq.set(key, item);
  }

  return [...uniq.values()];
}

async function getMovieUrls() {
  const xml = await fetchText(SITEMAP_URL);
  const all = extractLocUrls(xml);
  return all.filter((u) => u.startsWith(`${BASE_URL}/online-film-`));
}

async function getUvodMovieUrls() {
  const html = await fetchText(UVOD_URL);
  const all = extractFilmUrlsFromHtml(html);
  return all.filter((u) => u.startsWith(`${BASE_URL}/online-film-`));
}

async function scrapeMovie(pageUrl) {
  const html = await fetchText(pageUrl);
  const slug = slugFromUrl(pageUrl);
  const title = parseTitleFromHtml(html, slug);
  const payload = parseMovieAjaxPayload(html, pageUrl);

  const qs = new URLSearchParams(payload).toString();
  const ajaxUrl = `${BASE_URL}/prehravace_ajax.php?${qs}`;
  const serversHtml = await fetchText(ajaxUrl);
  const serverLinks = parseServerLinks(serversHtml);

  return {
    slug,
    title,
    pageUrl,
    imdbId: payload.imdb_id || null,
    tmdbId: payload.tmdb_id || null,
    languageRaw: null,
    serverLinks
  };
}

module.exports = {
  BASE_URL,
  SITEMAP_URL,
  UVOD_URL,
  getMovieUrls,
  getUvodMovieUrls,
  scrapeMovie,
  slugFromUrl
};
