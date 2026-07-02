const { requireAccess } = require('../src/auth');
const { execFile } = require('node:child_process');
const { promisify } = require('node:util');
const execFileAsync = promisify(execFile);

const BOMBUJ_REFERER = 'https://www.bombuj.si/';
const FETCH_TIMEOUT_MS = 15000;

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

// Script src patterns that are known adblock detector libraries
const ADBLOCK_DETECTOR_SRC_PATTERNS = [
  'fuckadblock', 'blockadblock', 'detect-adblock', 'adblock-detect',
  'adblockdetector', 'adblock_detector', 'antiblock', 'anti-block'
];

// Injected at the very top of <head> — neutralizes client-side adblock detection
const NEUTRALIZE_SCRIPT = `<script>
(function(){
  'use strict';
  window.canRunAds = true;
  window.google_ad_status = 1;
  var noop = function(){ return this; };
  var det = { onDetected: noop, onNotDetected: noop, check: noop, setOption: noop };
  window.FuckAdBlock = function(){ return det; };
  window.BlockAdBlock = window.FuckAdBlock;
  window.fuckAdBlock = det;
  window.blockAdBlock = det;
  // Patch offsetHeight/offsetWidth so bait elements appear visible
  var adCls = ['adsbox','ads','adsbygoogle','ad-placement','ad-header','banner-ads','ad-zone'];
  function patchProp(proto, name) {
    var d = Object.getOwnPropertyDescriptor(proto, name);
    if (!d || !d.get) return;
    Object.defineProperty(proto, name, { configurable: true, get: function() {
      var c = (this.className || '') + ' ' + (this.id || '');
      if (adCls.some(function(x){ return c.indexOf(x) !== -1; })) return 1;
      return d.get.call(this);
    }});
  }
  patchProp(HTMLElement.prototype, 'offsetHeight');
  patchProp(HTMLElement.prototype, 'offsetWidth');
  // Intercept fetch to strip adblock_detection / force_disable_adblock from API responses
  var _fetch = window.fetch;
  window.fetch = function(input, init) {
    return _fetch.call(this, input, init).then(function(res) {
      var url = typeof input === 'string' ? input : (input && input.url) || '';
      if (url.indexOf('/api/videos/') !== -1 && url.indexOf('/settings') !== -1) {
        return res.clone().json().then(function(json) {
          if (json && typeof json === 'object') {
            json.adblock_detection = false;
            json.force_disable_adblock = false;
            if (json.settings) {
              json.settings.adblock_detection = false;
              json.settings.force_disable_adblock = false;
            }
          }
          return new Response(JSON.stringify(json), {
            status: res.status,
            statusText: res.statusText,
            headers: res.headers
          });
        }).catch(function() { return res; });
      }
      return res;
    });
  };
})();
</script>`;

const cache = new Map();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

function isAllowedHost(url) {
  try {
    const host = new URL(url).hostname.toLowerCase();
    return ALLOWED_PROXY_HOSTS.some((h) => host === h || host.endsWith('.' + h));
  } catch {
    return false;
  }
}

function removeAdblockDetectorScripts(html) {
  return html.replace(/<script[^>]+src=["'][^"']*["'][^>]*>\s*<\/script>/gi, (match) => {
    const m = /src=["']([^"']+)["']/.exec(match);
    if (!m) return match;
    const src = m[1].toLowerCase();
    return ADBLOCK_DETECTOR_SRC_PATTERNS.some((p) => src.includes(p)) ? '' : match;
  });
}

// Rewrite nested iframe src attributes that point to allowed hosts so they also go through the proxy.
// This handles the case where bombuj.si wrapper contains <iframe src="https://byse.sx/embed/...">
function rewriteNestedIframes(html, pageOrigin, proxyKey) {
  return html.replace(/(<iframe[^>]+src=)(["'])([^"']+)\2/gi, (match, prefix, quote, src) => {
    let abs;
    try {
      abs = new URL(src, pageOrigin + '/').href;
    } catch {
      return match;
    }
    if (!isAllowedHost(abs)) return match;
    const proxied = `/api/proxy-player?url=${encodeURIComponent(abs)}&key=${encodeURIComponent(proxyKey)}`;
    return `${prefix}${quote}${proxied}${quote}`;
  });
}

// Rewrite external type="module" crossorigin scripts to load via proxy-asset.
// This solves the CORS problem for SPA pages (e.g. byse.sx) where module scripts
// have no Access-Control-Allow-Origin header.
// The script src is changed to our proxy-asset endpoint (same origin, no CORS needed).
// type="module" is kept only for inline scripts; external ones become regular <script src>.
function rewriteModuleScripts(html, pageOrigin, proxyKey) {
  return html.replace(/<script([^>]*)>/gi, (match, attrs) => {
    // Only process external scripts with type="module" (has src= attribute)
    if (!/type=["']module["']/i.test(attrs)) return match;
    if (!/src=["'][^"']+["']/i.test(attrs)) return match; // inline module, leave as-is

    const srcMatch = /src=["']([^"']+)["']/i.exec(attrs);
    if (!srcMatch) return match;

    let abs;
    try {
      abs = new URL(srcMatch[1], pageOrigin + '/').href;
    } catch {
      return match;
    }
    if (!isAllowedHost(abs)) return match;

    const proxySrc = `/api/proxy-asset?url=${encodeURIComponent(abs)}&key=${encodeURIComponent(proxyKey)}`;
    // Remove type="module" and crossorigin, replace src with proxy-asset URL
    const newAttrs = attrs
      .replace(/\s*type=["']module["']/gi, '')
      .replace(/\s*crossorigin(\s*=["'][^"']*["']|\b)/gi, '')
      .replace(/src=["'][^"']+["']/i, `src="${proxySrc}"`);
    return `<script${newAttrs}>`;
  });
}

function patchHtml(html, playerUrl, proxyKey) {
  const parsedUrl = new URL(playerUrl);
  const origin = parsedUrl.origin;
  const originalPath = parsedUrl.pathname + parsedUrl.search + parsedUrl.hash;
  const baseTag = `<base href="${origin}/">`;

  // Patch window.location so SPA router sees the original /e/... path
  const pathPatchScript = `<script>(function(){try{if(history&&history.replaceState)history.replaceState(null,'',${JSON.stringify(originalPath)});}catch(e){}})()</script>`;

  // Remove any existing <base> tag to avoid conflicts
  let patched = html.replace(/<base[^>]*\/?>/gi, '');

  // Inject base + neutralize script + path patch right after <head>
  if (/<head[^>]*>/i.test(patched)) {
    patched = patched.replace(/(<head[^>]*>)/i, `$1${baseTag}${NEUTRALIZE_SCRIPT}${pathPatchScript}`);
  } else {
    patched = baseTag + NEUTRALIZE_SCRIPT + pathPatchScript + patched;
  }

  patched = removeAdblockDetectorScripts(patched);
  patched = rewriteModuleScripts(patched, origin, proxyKey);
  patched = rewriteNestedIframes(patched, origin, proxyKey);

  return patched;
}

// SprintCDN PoW solver — FNV-1a hash, same algorithm as their browser JS
function sprintCdnQuickHash(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
    h >>>= 0;
  }
  return h >>> 0;
}

function solveSprintPoW(nonce, difficulty) {
  const mask = (1 << Math.min(difficulty + 6, 20)) - 1;
  for (let i = 0; i < 5_000_000; i++) {
    if ((sprintCdnQuickHash(`${nonce}:${i}`) & mask) === 0) return i;
  }
  return null;
}

function extractSprintChallenge(html) {
  const nonceMatch = /const nonce = "([^"]+)"/.exec(html);
  const pathMatch = /const path = "([^"]+)"/.exec(html);
  const diffMatch = /const baseDifficulty = Number\((\d+)\)/.exec(html);
  if (!nonceMatch) return null;
  return {
    nonce: nonceMatch[1],
    path: pathMatch ? pathMatch[1] : '/index.html',
    difficulty: diffMatch ? parseInt(diffMatch[1], 10) : 2
  };
}

const BROWSER_HEADERS = {
  'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'accept-language': 'cs-CZ,cs;q=0.9,en;q=0.8',
  'referer': BOMBUJ_REFERER
};

async function fetchWithTimeout(url, options = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), options.timeoutMs || FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(timer);
    return res;
  } catch (e) {
    clearTimeout(timer);
    throw e;
  }
}

async function fetchPlayerHtml(url) {
  const origin = new URL(url).origin;
  const res = await fetchWithTimeout(url, { headers: BROWSER_HEADERS });

  // SprintCDN challenge — solve PoW server-side
  if (res.status === 403 && res.headers.get('x-sprintcdn-anti-bot-action') === 'challenge') {
    const challengeHtml = await res.text();
    const challenge = extractSprintChallenge(challengeHtml);
    if (!challenge) throw new Error('SprintCDN challenge: nonce not found');

    // Use base difficulty (fastest/easiest — server accepts any valid pow)
    const pow = solveSprintPoW(challenge.nonce, challenge.difficulty);
    if (pow === null) throw new Error('SprintCDN challenge: PoW unsolvable');

    // Get the initial challenge cookie
    const challengeCookie = res.headers.get('set-cookie') || '';
    const cookieValue = (challengeCookie.match(/(__sprintcdn_antibot[^=]+=\S+?)(?:;|$)/) || [])[1] || '';

    // Submit PoW solution to get verified cookie
    const verifyUrl = `${origin}/__sprintcdn_antibot/challenge/verify?nonce=${encodeURIComponent(challenge.nonce)}&pow=${pow}&difficulty=${challenge.difficulty}&path=${encodeURIComponent(challenge.path)}`;
    const verifyRes = await fetchWithTimeout(verifyUrl, {
      redirect: 'manual',
      headers: {
        ...BROWSER_HEADERS,
        ...(cookieValue ? { cookie: cookieValue } : {})
      }
    });

    // Extract verified cookie from verify response
    const verifiedCookie = verifyRes.headers.get('set-cookie') || '';
    const verifiedValue = (verifiedCookie.match(/(__sprintcdn_antibot[^=]+=\S+?)(?:;|$)/) || [])[1] || '';
    const allCookies = [cookieValue, verifiedValue].filter(Boolean).join('; ');

    // Now fetch the real page with the solved cookie
    const realRes = await fetchWithTimeout(url, {
      headers: { ...BROWSER_HEADERS, ...(allCookies ? { cookie: allCookies } : {}) }
    });
    if (!realRes.ok) throw new Error(`HTTP ${realRes.status} after SprintCDN solve`);
    return await realRes.text();
  }

  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return await res.text();
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

  if (!isAllowedHost(urlRaw)) {
    res.status(400).json({ error: 'Host not allowed for proxy' });
    return;
  }

  const proxyKey = String(req.query.key || req.headers['x-access-key'] || '');

  // Cache stores raw HTML; patch on every request so the key is always current
  const cached = cache.get(urlRaw);
  const rawHtml = cached && Date.now() - cached.ts < CACHE_TTL_MS ? cached.raw : null;

  try {
    const raw = rawHtml || await fetchPlayerHtml(urlRaw);

    if (!rawHtml) {
      cache.set(urlRaw, { raw, ts: Date.now() });
      if (cache.size > 500) {
        const first = cache.keys().next().value;
        if (first) cache.delete(first);
      }
    }

    const patched = patchHtml(raw, urlRaw, proxyKey);

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'private, max-age=300');
    res.setHeader('X-Proxy-Cache', rawHtml ? 'HIT' : 'MISS');
    res.status(200).send(patched);
  } catch (err) {
    res.status(502).json({ error: 'Failed to fetch player', detail: String(err) });
  }
};
