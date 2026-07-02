function escapeXml(value = '') {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function createRssXml(movies, opts = {}) {
  const now = new Date().toUTCString();
  const siteUrl = opts.siteUrl || 'https://www.bombuj.si';

  const items = movies
    .map((movie) => {
      const linksText = movie.serverLinks
        .map((l) => `${l.serverName} -> ${l.playerUrl}`)
        .join('\n');

      const description = linksText || 'Bez dostupnych server odkazu';

      return [
        '    <item>',
        `      <title>${escapeXml(movie.title)}</title>`,
        `      <link>${escapeXml(movie.pageUrl)}</link>`,
        `      <guid isPermaLink="false">${escapeXml(movie.slug)}</guid>`,
        `      <description>${escapeXml(description)}</description>`,
        `      <pubDate>${new Date(movie.updatedAt || Date.now()).toUTCString()}</pubDate>`,
        '    </item>'
      ].join('\n');
    })
    .join('\n');

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0">',
    '  <channel>',
    '    <title>Bombuj.si - Filmy a server odkazy</title>',
    `    <link>${escapeXml(siteUrl)}</link>`,
    '    <description>RSS feed filmu a jejich server odkazu z bombuj.si</description>',
    '    <language>cs-sk</language>',
    `    <lastBuildDate>${now}</lastBuildDate>`,
    items,
    '  </channel>',
    '</rss>',
    ''
  ].join('\n');
}

module.exports = { createRssXml };
