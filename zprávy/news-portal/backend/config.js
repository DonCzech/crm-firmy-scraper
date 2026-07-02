export const RSS_SOURCES = [
  {
    id: 'novinky',
    name: 'Novinky.cz',
    rssUrl: 'https://www.novinky.cz/rss2/',
    baseUrl: 'https://www.novinky.cz',
    articleSelector: '.article-body, .article-text, [class*="body"]',
    enabled: true
  },
  {
    id: 'idnes',
    name: 'iDnes.cz',
    rssUrl: 'https://servis.idnes.cz/rss.aspx?c=zpravodaj',
    baseUrl: 'https://www.idnes.cz',
    articleSelector: '.art-full-text, .article-body, [itemprop="articleBody"]',
    enabled: true
  },
  {
    id: 'aktualne',
    name: 'Aktuálně.cz',
    rssUrl: 'https://zpravy.aktualne.cz/rss/',
    baseUrl: 'https://zpravy.aktualne.cz',
    articleSelector: '.e-web-aktualne-articles-show-body .f-tiptap-content__root, .e-web-aktualne-articles-show-body, .article-body, .clanek-text',
    enabled: true
  },
  {
    id: 'denik',
    name: 'Deník.cz',
    rssUrl: 'https://www.denik.cz/rss/zpravy.html',
    baseUrl: 'https://www.denik.cz',
    articleSelector: '.article-body',
    enabled: true
  },
  {
    id: 'ct24',
    name: 'ČT24',
    rssUrl: 'https://ct24.ceskatelevize.cz/rss/hlavni-zpravy',
    baseUrl: 'https://ct24.ceskatelevize.cz',
    articleSelector: '.article__body, .article-body',
    enabled: true
  }
];

export const CATEGORIES = [
  { id: 'domaci',      label: 'Domácí' },
  { id: 'zahranicni',  label: 'Zahraniční' },
  { id: 'ekonomika',   label: 'Ekonomika' },
  { id: 'sport',       label: 'Sport' },
  { id: 'kultura',     label: 'Kultura' },
  { id: 'technologie', label: 'Technologie' },
  { id: 'veda',        label: 'Věda' },
  { id: 'zdravi',      label: 'Zdraví' },
  { id: 'cestovani',   label: 'Cestování' },
  { id: 'krimi',       label: 'Krimi' }
];

export const AI_CONFIG = {
  model: 'claude-sonnet-4-5',
  maxTokens: 1500,
  rewriteDelayMs: 2000,       // pauza mezi AI voláními (rate limiting)
  fetchIntervalMinutes: 15,
  maxArticlesPerFetch: 10,    // max nových článků per run
};
