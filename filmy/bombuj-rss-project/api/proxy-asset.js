const { requireAccess } = require('../src/auth');
const { execFile } = require('node:child_process');
const { promisify } = require('node:util');
const execFileAsync = promisify(execFile);

const ALLOWED_PROXY_HOSTS = [
  'streamtape.com', 'streamtape.net',
  'mixdrop.co', 'mixdrop.to', 'mixdrop.ag', 'mixdrop.bz', 'mixdrop.ch',
  'voe.sx', 'voe.ac',
  'netu.ac', 'netu.io',
  'filemoon.sx', 'filemoon.to', 'filemoon.in',
  'vidstream.cc', 'vidstream.to',
  'byse.sx', 'byse.sk', 'byse.cz', 'bysekoze.com',
  'www.bombuj.si', 'bombuj.si'
];

const BOMBUJ_REFERER = 'https://www.bombuj.si/';
const FETCH_TIMEOUT_MS = 20000;

const cache = new Map();
const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes for static assets

function isAllowedHost(url) {
  try {
    const host = new URL(url).hostname.toLowerCase();
    return ALLOWED_PROXY_HOSTS.some((h) => host === h || host.endsWith('.' + h));
  } catch {
    return false;
  }
}

// Patch JS bundle: rewrite __vite__mapDeps chunk paths and similar asset references
// so dynamic import() calls resolve through our proxy (which adds CORS headers).
function patchJsBundle(content, pageOrigin, proxyKey) {
  // Match quoted asset paths like "assets/foo-HASH.js" or "assets/foo-HASH.css"
  const assetRe = /"(assets\/[a-zA-Z0-9_./-]+-[a-zA-Z0-9_]{3,12}\.[a-z]{1,5})"/g;
  return content.replace(assetRe, (match, relPath) => {
    try {
      const abs = new URL(relPath, pageOrigin + '/').href;
      if (!isAllowedHost(abs)) return match;
      return `"/api/proxy-asset?url=${encodeURIComponent(abs)}&key=${encodeURIComponent(proxyKey)}"`;
    } catch {
      return match;
    }
  });
}

module.exports = async function handler(req, res) {
  if (!requireAccess(req, res)) return;

  if (req.method !== 'GET') {
    res.status(405).end();
    return;
  }

  const urlRaw = String(req.query.url || '').trim();
  if (!urlRaw) {
    res.status(400).json({ error: 'Missing url' });
    return;
  }

  if (!isAllowedHost(urlRaw)) {
    res.status(400).json({ error: 'Host not allowed' });
    return;
  }

  // Check cache
  const cached = cache.get(urlRaw);
  if (cached && Date.now() - cached.ts < CACHE_TTL_MS) {
    res.setHeader('Content-Type', cached.contentType);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 'public, max-age=1800');
    res.setHeader('X-Proxy-Cache', 'HIT');
    res.status(200).send(cached.body);
    return;
  }

  const proxyKey = String(req.query.key || req.headers['x-access-key'] || '');
  const isJs = urlRaw.endsWith('.js');

  try {
    let body;
    let contentType;

    if (isJs) {
      // For JS bundles use text fetch with curl fallback (same pattern as http.js)
      let text;
      try {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
        const response = await fetch(urlRaw, {
          signal: controller.signal,
          headers: {
            'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
            'accept': '*/*',
            'referer': BOMBUJ_REFERER
          }
        });
        clearTimeout(timer);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        contentType = response.headers.get('content-type') || 'text/javascript';
        text = await response.text();
      } catch {
        // curl fallback
        const { stdout } = await execFileAsync('curl', [
          '-sS', '-L', '--max-time', '20',
          '-H', `User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36`,
          '-H', `Referer: ${BOMBUJ_REFERER}`,
          urlRaw
        ]);
        contentType = 'text/javascript';
        text = stdout;
      }

      const origin = new URL(urlRaw).origin;
      const patched = patchJsBundle(text, origin, proxyKey);
      body = Buffer.from(patched, 'utf8');
    } else {
      // CSS, images, fonts — binary passthrough via curl
      const { stdout } = await execFileAsync('curl', [
        '-sS', '-L', '--max-time', '20',
        '-H', `Referer: ${BOMBUJ_REFERER}`,
        '--output', '-',
        urlRaw
      ], { encoding: 'buffer' });
      contentType = urlRaw.endsWith('.css') ? 'text/css' : 'application/octet-stream';
      body = stdout;
    }

    cache.set(urlRaw, { body, contentType, ts: Date.now() });
    if (cache.size > 200) {
      const first = cache.keys().next().value;
      if (first) cache.delete(first);
    }

    res.setHeader('Content-Type', contentType);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 'public, max-age=1800');
    res.setHeader('X-Proxy-Cache', 'MISS');
    res.status(200).send(body);
  } catch (err) {
    res.status(502).json({ error: 'Failed to fetch asset', detail: String(err) });
  }
};
