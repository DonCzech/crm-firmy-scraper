const { requireAccess } = require('../src/auth');
const { fetchText } = require('../src/http');

const BASE = 'https://www.bombuj.si';
const cache = new Map();
const BLOCKED_AD_HOSTS = [
  'chatmate.tv',
  'adcash.com',
  'adcash.co',
  'highcpmgate.com',
  'exdynsrv.com',
  'hilltopads.net',
  'popads.net',
  'propellerads.com',
  'onclicksuper.com',
  'doubleclick.net'
];
const PREFERRED_VIDEO_HOSTS = ['streamtape.com', 'mixdrop', 'voe', 'vidstream', 'filemoon', 'netu'];

function toAbsolute(url) {
  if (!url) return '';
  const trimmed = String(url).trim();
  if (!trimmed) return '';
  if (/^(javascript|data|vbscript):/i.test(trimmed)) return '';
  if (/^[a-z][a-z0-9+.-]*:/i.test(trimmed) && !/^https?:/i.test(trimmed)) return '';
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return trimmed;
  if (trimmed.startsWith('//')) return `https:${trimmed}`;
  if (trimmed.startsWith('/')) return `${BASE}${trimmed}`;
  return `${BASE}/${trimmed.replace(/^\/+/, '')}`;
}

function decodeEntities(input) {
  return input
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function hostOf(url) {
  try {
    return new URL(url).hostname.toLowerCase();
  } catch {
    return '';
  }
}

function isBlockedAdHost(url) {
  const h = hostOf(url);
  if (!h) return false;
  return BLOCKED_AD_HOSTS.some((d) => h === d || h.endsWith(`.${d}`));
}

function hasAdblockChallenge(html) {
  const text = String(html || '').toLowerCase();
  return (
    text.includes('ad blocker detected') ||
    text.includes('disable your ad blocker') ||
    text.includes("doesn't allow adblock views") ||
    text.includes('adblock views')
  );
}

function extractIframeSrcs(html) {
  const out = [];
  const pushCandidate = (raw) => {
    const abs = toAbsolute(decodeEntities(raw || ''));
    if (!abs) return;
    try {
      const u = new URL(abs);
      if (!/^https?:$/i.test(u.protocol)) return;
      out.push(abs);
    } catch {
      // ignore malformed candidate
    }
  };

  const iframeRe = /<iframe[^>]+src=["']([^"']+)["']/gi;
  let m = iframeRe.exec(html);
  while (m) {
    pushCandidate(m[1]);
    m = iframeRe.exec(html);
  }

  const jsIframeRe = /<iframe[^>]+src=\\"([^\\"]+)\\"/gi;
  m = jsIframeRe.exec(html);
  while (m) {
    pushCandidate(m[1]);
    m = jsIframeRe.exec(html);
  }

  const fallbackRe = /(prehravace_final\/[a-z0-9._-]+\.php\?[^"'\\s<)]+)/gi;
  m = fallbackRe.exec(html);
  while (m) {
    pushCandidate(m[1]);
    m = fallbackRe.exec(html);
  }

  return [...new Set(out.filter(Boolean))];
}

function pickBestCandidate(candidates) {
  if (!candidates.length) return '';

  const clean = candidates.filter((u) => !isBlockedAdHost(u));
  const list = clean.length ? clean : candidates;

  list.sort((a, b) => {
    const ah = hostOf(a);
    const bh = hostOf(b);
    const ap = PREFERRED_VIDEO_HOSTS.some((x) => ah.includes(x)) ? 2 : 0;
    const bp = PREFERRED_VIDEO_HOSTS.some((x) => bh.includes(x)) ? 2 : 0;
    if (bp !== ap) return bp - ap;

    const aBombuj = ah.endsWith('bombuj.si') ? 0 : 1;
    const bBombuj = bh.endsWith('bombuj.si') ? 0 : 1;
    if (aBombuj !== bBombuj) return aBombuj - bBombuj;
    return 0;
  });

  return list[0] || '';
}

function isBombujUrl(url) {
  try {
    const u = new URL(url);
    return /(^|\.)bombuj\.si$/i.test(u.hostname);
  } catch {
    return false;
  }
}

function pickResolvedFromChain(chain, current) {
  // Prefer the deepest direct embed URL (non-bombuj) — e.g. bysekoze.com, streamtape.com.
  // The proxy sends the correct Bombuj referer itself, so we don't need to keep the wrapper.
  for (let i = chain.length - 1; i >= 0; i -= 1) {
    const candidate = chain[i];
    if (!isBombujUrl(candidate) && !isBlockedAdHost(candidate)) {
      return candidate;
    }
  }
  // Fallback: any bombuj.si wrapper that isn't a blocked ad host
  for (let i = chain.length - 1; i >= 0; i -= 1) {
    const candidate = chain[i];
    if (!isBlockedAdHost(candidate)) {
      return candidate;
    }
  }
  if (chain.length > 1) return chain[chain.length - 2];
  return current;
}

async function deepResolve(startUrl, maxDepth = 3) {
  const chain = [startUrl];
  let current = startUrl;
  const visited = new Set([startUrl]);
  let adblockDetected = false;

  for (let i = 0; i < maxDepth; i += 1) {
    try {
      const html = await fetchText(current, { timeoutMs: 20000, retries: 2 });
      if (hasAdblockChallenge(html)) adblockDetected = true;
      const candidates = extractIframeSrcs(html);
      const next = pickBestCandidate(candidates);
      if (!next || next === current) break;
      if (visited.has(next)) break;
      visited.add(next);
      chain.push(next);
      current = next;
      if (isBlockedAdHost(current)) break;
    } catch {
      // Keep the last successfully resolved URL in the chain.
      break;
    }
  }

  const resolvedUrl = pickResolvedFromChain(chain, current);
  return { resolvedUrl, chain, adblockDetected };
}

module.exports = async function handler(req, res) {
  if (!requireAccess(req, res)) return;

  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const urlRaw = String(req.query.url || '').trim();
  if (!urlRaw) {
    res.status(400).json({ error: 'Missing url' });
    return;
  }

  const playerUrl = toAbsolute(urlRaw);
  if (!playerUrl.startsWith(BASE)) {
    res.status(400).json({ error: 'Only bombuj.si URLs are allowed' });
    return;
  }

  if (cache.has(playerUrl)) {
    const cached = cache.get(playerUrl);
    if (typeof cached === 'string') {
      res.status(200).json({ sourceUrl: playerUrl, resolvedUrl: cached, adblockDetected: false, cached: true });
      return;
    }
    res.status(200).json({
      sourceUrl: playerUrl,
      resolvedUrl: cached.resolvedUrl || playerUrl,
      adblockDetected: Boolean(cached.adblockDetected),
      cached: true
    });
    return;
  }

  try {
    const { resolvedUrl, chain, adblockDetected } = await deepResolve(playerUrl, 6);
    cache.set(playerUrl, { resolvedUrl, adblockDetected });

    if (cache.size > 4000) {
      const first = cache.keys().next().value;
      if (first) cache.delete(first);
    }

    res.status(200).json({
      sourceUrl: playerUrl,
      resolvedUrl,
      chain,
      adblockDetected,
      blockedHostDetected: isBlockedAdHost(resolvedUrl),
      cached: false
    });
  } catch (err) {
    res.status(200).json({ sourceUrl: playerUrl, resolvedUrl: playerUrl, cached: false, warning: String(err) });
  }
};
