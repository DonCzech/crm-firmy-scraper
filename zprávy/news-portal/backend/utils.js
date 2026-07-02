export function generateSlug(title, url) {
  const slug = title.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-').replace(/-+/g, '-')
    .substring(0, 80);
  const hash = Math.abs(url.split('').reduce((a, c) => ((a << 5) - a) + c.charCodeAt(0), 0))
    .toString(36).substring(0, 6);
  return `${slug}-${hash}`;
}

export function guessCategory(title = '', rssCategories = []) {
  const text = (title + ' ' + rssCategories.join(' ')).toLowerCase();
  const mapping = {
    domaci:      ['česk', 'česká', 'prague', 'praha', 'vláda', 'sněmovna', 'babiš', 'fiala'],
    zahranicni:  ['zahranič', 'svět', 'německo', 'usa', 'rusko', 'ukraji', 'nato', 'eu '],
    ekonomika:   ['ekonom', 'inflac', 'koruna', 'burza', 'banka', 'ceny', 'zdraž', 'firma'],
    sport:       ['fotbal', 'hokej', 'tenis', 'sport', 'ms ', 'me ', 'liga', 'olymp'],
    kultura:     ['kultura', 'film', 'seriál', 'hudba', 'divadl', 'výstav', 'kniha'],
    technologie: ['technolog', 'ai ', 'umělá inteligence', 'software', 'hardware', 'mobil'],
    veda:        ['věda', 'výzkum', 'vesmír', 'biolog', 'klimat', 'fyzik', 'objev'],
    zdravi:      ['zdraví', 'nemoc', 'léčba', 'nemocn', 'lék', 'rakovina'],
    cestovani:   ['cestov', 'dovolená', 'letiště', 'turistik', 'hotel'],
    krimi:       ['policie', 'vražda', 'loupež', 'krimi', 'soud', 'útok', 'nehoda'],
  };
  for (const [cat, kw] of Object.entries(mapping)) {
    if (kw.some(k => text.includes(k))) return cat;
  }
  return 'domaci';
}
