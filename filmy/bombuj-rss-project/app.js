const PAGE_SIZE = 80;
const SAFE_MODE_LOCKED = false;
const POPUP_TRAP_CLICKS = 6;
const POPUP_TRAP_WINDOW_MS = 25000;
const STORAGE_LAST_SLUG = 'app_last_movie_slug';
const STORAGE_LAST_QUERY = 'app_last_search_query';
const STORAGE_POPUP_SHIELD = 'app_popup_shield_enabled';
const STORAGE_PLAYER_INTERACTION = 'app_player_interaction_enabled';
const BLOCKED_REDIRECT_HOSTS = [
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

const UNSAFE_SERVER_PATTERNS = ['vidsrc', 'vidlink', 'multiembed', '2embed', 'moviesclub', 'embed'];
const SANDBOX_INCOMPATIBLE_PATTERNS = [
  'vidsrc',
  'vidlink',
  'multiembed',
  '2embed',
  'moviesclub',
  'embed',
  'byse',
  'voe',
  'voe2',
  'netu',
  'streamtape',
  'mixdrop',
  'filemoon'
];
const DIRECT_CZ_SERVER_PATTERNS = [];
const HIDDEN_SERVER_PATTERNS = ['voe sx vip', 'voe.sx vip', 'voe vip'];
const AUTO_DEPRIORITIZED_SERVER_PATTERNS = ['byse', 'voe2'];

const state = {
  key: localStorage.getItem('app_access_key') || '',
  catalog: [],
  filtered: [],
  movies: [],
  visibleCount: PAGE_SIZE,
  activeSlug: '',
  activeServerUrl: '',
  loading: false,
  resolving: false,
  resolvedCache: new Map(),
  lastSlug: localStorage.getItem(STORAGE_LAST_SLUG) || '',
  lastQuery: localStorage.getItem(STORAGE_LAST_QUERY) || '',
  popupShieldEnabled: SAFE_MODE_LOCKED ? true : localStorage.getItem(STORAGE_POPUP_SHIELD) !== '0',
  playerInteractionEnabled: localStorage.getItem(STORAGE_PLAYER_INTERACTION) == null
    ? true
    : localStorage.getItem(STORAGE_PLAYER_INTERACTION) !== '0',
  popupGuardActiveUntil: 0,
  currentMovieLinks: [],
  selectedLink: null,
  selectedResolvedUrl: '',
  serverButtonByUrl: new Map(),
  sandboxBypassForCurrentServer: false,
  popupTrapRemaining: 0,
  popupTrapUntil: 0
};

const el = {
  search: document.getElementById('search'),
  status: document.getElementById('status'),
  results: document.getElementById('results'),
  loadMore: document.getElementById('load-more'),
  playerInteractionToggle: document.getElementById('toggle-player-interaction'),
  popupShieldToggle: document.getElementById('toggle-popup-shield'),
  playDirectBtn: document.getElementById('play-direct'),
  playDirectStatus: document.getElementById('play-direct-status'),
  movieTitle: document.getElementById('movie-title'),
  player: document.getElementById('player'),
  playerClickShield: document.getElementById('player-click-shield'),
  serverGroups: document.getElementById('server-groups'),
  openExternal: document.getElementById('open-external'),
  changeKey: document.getElementById('change-key')
};

function normalizeText(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, ' ')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

function isUnsafeServerName(name) {
  const n = normalizeText(name);
  return UNSAFE_SERVER_PATTERNS.some((p) => n.includes(p));
}

function needsSandboxBypass(serverName) {
  const n = normalizeText(serverName);
  return SANDBOX_INCOMPATIBLE_PATTERNS.some((p) => n.includes(p));
}

function needsReferrerForServer(link) {
  const server = normalizeText(link?.serverName || '');
  return /streamtape|mixdrop|netu|voe|voe2|byse|filemoon/.test(server);
}

function shouldUseDirectPlayerUrl(link) {
  const lang = normalizeText(link?.languageLabel || '');
  const server = normalizeText(link?.serverName || '');
  if (lang.includes('cz dabing')) return true;
  return DIRECT_CZ_SERVER_PATTERNS.some((p) => server.includes(p));
}

function isHiddenServer(link) {
  const server = normalizeText(link?.serverName || '');
  return HIDDEN_SERVER_PATTERNS.some((p) => server.includes(p));
}

function isAutoDeprioritizedServer(link) {
  const server = normalizeText(link?.serverName || '');
  return AUTO_DEPRIORITIZED_SERVER_PATTERNS.some((p) => server.includes(p));
}


function toProxyUrl(url) {
  if (!url || url === 'about:blank' || url.startsWith('about:')) return url;
  return `/api/proxy-player?url=${encodeURIComponent(url)}&key=${encodeURIComponent(state.key)}`;
}

function isBlockedResolvedUrl(url) {
  try {
    const u = new URL(url);
    const host = (u.hostname || '').toLowerCase();
    if (BLOCKED_REDIRECT_HOSTS.some((h) => host === h || host.endsWith(`.${h}`))) return true;
    if (url.includes('utm_source=voluum') || url.toLowerCase().includes('adcash')) return true;
    return false;
  } catch {
    return false;
  }
}

function slugToTitle(slug) {
  return String(slug || '')
    .replace(/^online-film-/, '')
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim();
}

function editDistanceWithin(a, b, maxDistance = 2) {
  if (a === b) return 0;
  const la = a.length;
  const lb = b.length;
  if (Math.abs(la - lb) > maxDistance) return maxDistance + 1;

  let prev = new Array(lb + 1);
  let curr = new Array(lb + 1);
  for (let j = 0; j <= lb; j += 1) prev[j] = j;

  for (let i = 1; i <= la; i += 1) {
    curr[0] = i;
    let rowMin = curr[0];
    for (let j = 1; j <= lb; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      curr[j] = Math.min(prev[j] + 1, curr[j - 1] + 1, prev[j - 1] + cost);
      if (curr[j] < rowMin) rowMin = curr[j];
    }
    if (rowMin > maxDistance) return maxDistance + 1;
    const tmp = prev;
    prev = curr;
    curr = tmp;
  }

  return prev[lb];
}

function ensureKey(force = false) {
  if (state.key && !force) return true;
  const v = window.prompt('Zadej přístupový klíč pro interní katalog:', state.key || '');
  if (!v) return false;
  state.key = v.trim();
  localStorage.setItem('app_access_key', state.key);
  return true;
}

async function api(path) {
  const res = await fetch(path, {
    headers: {
      'x-access-key': state.key
    }
  });

  if (res.status === 401) {
    state.key = '';
    localStorage.removeItem('app_access_key');
    throw new Error('Unauthorized');
  }

  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }

  return res.json();
}

function setStatus(text) {
  el.status.textContent = text;
}

function setPlayDirectStatus(text) {
  if (el.playDirectStatus) el.playDirectStatus.textContent = text || '';
}

function highlightServerButton(playerUrl) {
  document.querySelectorAll('.server-btn').forEach((b) => b.classList.remove('active'));
  const btn = state.serverButtonByUrl.get(playerUrl);
  if (btn) btn.classList.add('active');
}

function applyPopupShieldUi() {
  if (!el.popupShieldToggle) return;
  el.popupShieldToggle.textContent = `Anti-popup: ${state.popupShieldEnabled ? 'ON' : 'OFF'}${SAFE_MODE_LOCKED ? ' (SAFE)' : ''}`;
}

function applyPlayerInteractionUi() {
  if (!el.playerInteractionToggle) return;
  el.playerInteractionToggle.textContent = `Interakce v playeru: ${state.playerInteractionEnabled ? 'ON' : 'OFF'}${SAFE_MODE_LOCKED ? ' (SAFE)' : ''}`;
}

function applyPlayerClickShield() {
  if (!el.playerClickShield) return;
  if (state.playerInteractionEnabled) {
    el.playerClickShield.classList.add('hidden');
  } else {
    el.playerClickShield.classList.remove('hidden');
  }
}

function applyPlayerSandbox() {
  if (!el.player) return;
  if (state.popupShieldEnabled && !state.sandboxBypassForCurrentServer) {
    el.player.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-forms allow-presentation');
  } else {
    el.player.removeAttribute('sandbox');
  }
}

function applyPlayerReferrerPolicy(link = null) {
  if (!el.player) return;
  if (needsReferrerForServer(link)) {
    // Some hosts block no-referrer embeds as "client blocked".
    el.player.referrerPolicy = 'origin';
  } else {
    el.player.referrerPolicy = 'strict-origin-when-cross-origin';
  }
}

function startPopupGuard(durationMs = 9000) {
  state.popupGuardActiveUntil = Date.now() + durationMs;
}

function popupGuardIsActive() {
  return Date.now() < state.popupGuardActiveUntil;
}

function armPopupTrap(clicks = POPUP_TRAP_CLICKS, durationMs = POPUP_TRAP_WINDOW_MS) {
  state.popupTrapRemaining = Math.max(0, Number(clicks) || 0);
  state.popupTrapUntil = Date.now() + durationMs;
}

function popupTrapIsActive() {
  return state.popupTrapRemaining > 0 && Date.now() < state.popupTrapUntil;
}

function updateLoadMoreButton() {
  const show = state.movies.length > 0 && state.visibleCount < state.filtered.length;
  el.loadMore.style.display = show ? 'block' : 'none';
  el.loadMore.disabled = state.loading || !show;
  if (show) {
    const remaining = Math.max(0, state.filtered.length - state.visibleCount);
    el.loadMore.textContent = `Načíst další (${remaining})`;
  }
}

function renderResults() {
  el.results.innerHTML = '';

  if (state.movies.length === 0) {
    el.results.innerHTML = '<li class="result-meta">Žádné výsledky</li>';
    updateLoadMoreButton();
    return;
  }

  for (const movie of state.movies) {
    const li = document.createElement('li');
    li.className = `result-item${state.activeSlug === movie.slug ? ' active' : ''}`;
    li.dataset.slug = movie.slug;
    li.innerHTML = `
      <div class="result-title">${movie.title}</div>
      <div class="result-meta">${movie.serverLinksCount} serverů</div>
    `;
    li.addEventListener('click', () => loadMovie(movie.slug));
    el.results.appendChild(li);
  }

  updateLoadMoreButton();
}

function applyFilter(query) {
  const q = normalizeText(query);

  if (!q) {
    state.filtered = state.catalog;
  } else {
    const tokens = q.split(' ').filter(Boolean);
    const scored = [];
    const qTrigrams = buildTrigrams(q);
    const minTokenHits = Math.max(1, Math.ceil(tokens.length * 0.5));

    for (const m of state.catalog) {
      let score = 0;
      const inTitle = m.searchTitle.includes(q);
      const inBlob = m.searchBlob.includes(q);

      if (inTitle) score += 260;
      if (inBlob) score += 180;

      let tokenHits = 0;
      for (const token of tokens) {
        if (m.searchBlob.includes(token)) tokenHits += 1;
      }
      if (tokenHits === tokens.length && tokens.length > 0) {
        score += 100 + tokenHits * 8;
      } else {
        score += tokenHits * 10;
      }

      let fuzzyPoints = 0;
      if (tokens.length > 0) {
        for (const token of tokens) {
          if (token.length < 3) continue;
          let best = 3;
          for (const word of m.searchWords) {
            const d = editDistanceWithin(token, word, 2);
            if (d < best) best = d;
            if (best === 0) break;
          }
          if (best === 1) fuzzyPoints += 2;
          else if (best === 2) fuzzyPoints += 1;
        }
      }
      score += fuzzyPoints * 18;

      const trigramScore = diceScore(qTrigrams, m.searchTrigrams);
      score += trigramScore * 220;

      const strongMatch =
        inTitle ||
        inBlob ||
        tokenHits >= minTokenHits ||
        (tokens.length <= 2 && fuzzyPoints >= 2) ||
        trigramScore >= 0.33;

      if (strongMatch && score >= 70) scored.push({ movie: m, score });
    }

    scored.sort((a, b) => b.score - a.score || a.movie.title.localeCompare(b.movie.title, 'cs'));
    state.filtered = scored.map((x) => x.movie);
  }

  state.visibleCount = PAGE_SIZE;
  state.movies = state.filtered.slice(0, state.visibleCount);
  renderResults();
  setStatus(`Nalezeno ${state.filtered.length} z ${state.catalog.length} filmů`);
}

function groupByLanguage(serverLinks) {
  const map = new Map();
  for (const link of serverLinks) {
    if (isHiddenServer(link)) continue;
    const key = link.languageLabel || 'Ostatní';
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(link);
  }
  return [...map.entries()];
}

function buildTrigrams(text) {
  const t = `  ${text} `;
  const out = new Set();
  for (let i = 0; i < t.length - 2; i += 1) {
    out.add(t.slice(i, i + 3));
  }
  return out;
}

function diceScore(setA, setB) {
  if (!setA.size || !setB.size) return 0;
  let inter = 0;
  for (const x of setA) {
    if (setB.has(x)) inter += 1;
  }
  return (2 * inter) / (setA.size + setB.size);
}

function serverPriority(serverName) {
  const n = normalizeText(serverName);
  if (/streamtape|mixdrop|netu|byse|voe|voe2|filemoon/.test(n)) return 120;
  if (/vidstream/.test(n)) return 90;
  if (/vidsrc|vidlink|multiembed|2embed|moviesclub|embed/.test(n)) return 20;
  return 60;
}

function languagePriority(languageLabel) {
  const l = normalizeText(languageLabel || '');
  if (l.includes('cz dabing')) return 180;
  if (l.includes('sk dabing')) return 160;
  if (l.includes('cz/sk titulky') || l.includes('cz sk titulky')) return 120;
  if (l.includes('en dab/tit')) return 60;
  return 80;
}

async function resolvePlayerMeta(sourceUrl) {
  if (state.resolvedCache.has(sourceUrl)) {
    return state.resolvedCache.get(sourceUrl);
  }

  const data = await api(`/api/resolve-player?url=${encodeURIComponent(sourceUrl)}`);
  const meta = {
    resolvedUrl: data.resolvedUrl || sourceUrl,
    adblockDetected: Boolean(data.adblockDetected)
  };
  state.resolvedCache.set(sourceUrl, meta);
  return meta;
}

async function activateServer(link, button = null, fallbackLinks = []) {
  startPopupGuard();
  state.sandboxBypassForCurrentServer = needsSandboxBypass(link.serverName);
  applyPlayerSandbox();
  applyPlayerReferrerPolicy(link);
  state.activeServerUrl = link.playerUrl;
  state.selectedLink = link;
  if (button) {
    highlightServerButton(link.playerUrl);
  } else {
    highlightServerButton(link.playerUrl);
  }

  try {
    state.resolving = true;
    setStatus(`Načítám server: ${link.serverName}...`);
    const meta = await resolvePlayerMeta(link.playerUrl);
    if (meta.adblockDetected && fallbackLinks.length > 0) {
      const next = fallbackLinks[0];
      setStatus(`Server ${link.serverName} blokuje adblock, zkouším ${next.serverName}...`);
      return activateServer(next, null, fallbackLinks.slice(1));
    }
    if (meta.adblockDetected) {
      setStatus(`Server ${link.serverName} hlásí anti-adblock ochranu`);
    }
    const finalUrl = shouldUseDirectPlayerUrl(link) ? link.playerUrl : meta.resolvedUrl;
    if (isBlockedResolvedUrl(finalUrl) && fallbackLinks.length > 0) {
      const next = fallbackLinks[0];
      setStatus(`Server ${link.serverName} přeskočen (ad redirect), zkouším ${next.serverName}...`);
      return activateServer(next, null, fallbackLinks.slice(1));
    }

    el.player.src = toProxyUrl(finalUrl);
    armPopupTrap();
    el.openExternal.href = finalUrl;
    state.selectedResolvedUrl = finalUrl;
    localStorage.setItem(STORAGE_LAST_SLUG, state.activeSlug || '');
    setStatus(
      state.sandboxBypassForCurrentServer
        ? `Přehrávač připraven: ${link.serverName} (compat mode bez sandboxu)`
        : `Přehrávač připraven: ${link.serverName}`
    );
  } catch (err) {
    if (fallbackLinks.length > 0) {
      const next = fallbackLinks[0];
      setStatus(`Server ${link.serverName} selhal, zkouším ${next.serverName}...`);
      return activateServer(next, null, fallbackLinks.slice(1));
    }
    el.player.src = toProxyUrl(link.playerUrl);
    el.openExternal.href = link.playerUrl;
    setStatus(`Použit fallback URL pro ${link.serverName}`);
  } finally {
    state.resolving = false;
  }
}

function renderServers(movie) {
  el.serverGroups.innerHTML = '';
  state.currentMovieLinks = (movie.serverLinks || []).filter((link) => !isHiddenServer(link));
  state.selectedLink = null;
  state.selectedResolvedUrl = '';
  applyPlayerInteractionUi();
  applyPlayerClickShield();
  state.sandboxBypassForCurrentServer = false;
  applyPlayerSandbox();
  state.serverButtonByUrl = new Map();
  setPlayDirectStatus('');
  const groups = groupByLanguage(movie.serverLinks || []);

  if (groups.length === 0) {
    el.serverGroups.innerHTML = '<div class="result-meta">U filmu nejsou žádné odkazy.</div>';
    el.player.src = 'about:blank';
    el.openExternal.href = '#';
    return;
  }

  let firstLink = null;
  let firstButton = null;
  const autoCandidates = [];

  for (const [language, links] of groups) {
    const sortedLinks = [...links].sort((a, b) => {
      const p = serverPriority(b.serverName) - serverPriority(a.serverName);
      if (p !== 0) return p;
      return a.position - b.position;
    });

    const wrap = document.createElement('div');
    const title = document.createElement('div');
    title.className = 'group-title';
    title.textContent = language;

    const list = document.createElement('div');
    list.className = 'server-list';

    sortedLinks.forEach((link, idx) => {
      const btn = document.createElement('button');
      btn.className = 'server-btn';
      btn.type = 'button';
      btn.textContent = link.serverName;
      btn.addEventListener('click', () => activateServer(link, btn, []));
      list.appendChild(btn);
      state.serverButtonByUrl.set(link.playerUrl, btn);

      if (!isUnsafeServerName(link.serverName)) {
        autoCandidates.push(link);
      }

      if (!firstLink && idx === 0) {
        firstLink = link;
        firstButton = btn;
      }
    });

    wrap.appendChild(title);
    wrap.appendChild(list);
    el.serverGroups.appendChild(wrap);
  }

  const candidates = autoCandidates.length > 0 ? autoCandidates : firstLink ? [firstLink] : [];
  if (candidates.length > 0) {
    playDirectCurrent();
  }
}

async function playDirectCurrent() {
  if (!state.currentMovieLinks.length) {
    setPlayDirectStatus('Nejsou dostupné odkazy');
    return;
  }

  const sorted = [...state.currentMovieLinks].sort((a, b) => {
    const lp = languagePriority(b.languageLabel) - languagePriority(a.languageLabel);
    if (lp !== 0) return lp;
    const p = serverPriority(b.serverName) - serverPriority(a.serverName);
    if (p !== 0) return p;
    return a.position - b.position;
  });

  const preferred = sorted.filter((l) => !isUnsafeServerName(l.serverName));
  const fallbackUnsafe = sorted.filter((l) => isUnsafeServerName(l.serverName));
  const baseQueue = SAFE_MODE_LOCKED ? preferred : [...preferred, ...fallbackUnsafe];
  const queuePreferred = baseQueue.filter((l) => !isAutoDeprioritizedServer(l));
  const queueDeprioritized = baseQueue.filter((l) => isAutoDeprioritizedServer(l));
  const queue = [...queuePreferred, ...queueDeprioritized];

  if (SAFE_MODE_LOCKED && queue.length === 0) {
    setPlayDirectStatus('Safe režim: dostupné jen rizikové servery');
    return;
  }

  setPlayDirectStatus('Hledám přímý odkaz...');
  for (const link of queue) {
    try {
      const meta = await resolvePlayerMeta(link.playerUrl);
      if (meta.adblockDetected) continue;
      const resolved = shouldUseDirectPlayerUrl(link) ? link.playerUrl : meta.resolvedUrl;
      if (isBlockedResolvedUrl(resolved)) continue;
      state.selectedLink = link;
      state.selectedResolvedUrl = resolved;
      state.sandboxBypassForCurrentServer = needsSandboxBypass(link.serverName);
      applyPlayerSandbox();
      applyPlayerReferrerPolicy(link);
      applyPlayerInteractionUi();
      applyPlayerClickShield();

      el.player.src = toProxyUrl(resolved);
      armPopupTrap();
      highlightServerButton(link.playerUrl);
      setPlayDirectStatus(
        state.sandboxBypassForCurrentServer
          ? `Přehrávám přes ${link.serverName} (compat mode)`
          : `Přehrávám přes ${link.serverName}`
      );
      setStatus(`Přímé přehrávání: ${link.serverName}`);
      return;
    } catch {
      // try next link
    }
  }

  setPlayDirectStatus('Přímý odkaz se nenašel');
}

async function loadMovie(slug) {
  try {
    setStatus('Načítám detail filmu...');
    const movie = await api(`/api/movie?slug=${encodeURIComponent(slug)}`);
    state.activeSlug = movie.slug;
    localStorage.setItem(STORAGE_LAST_SLUG, movie.slug);
    el.movieTitle.textContent = movie.title;
    renderResults();
    renderServers(movie);
  } catch (err) {
    if (String(err.message) === 'Unauthorized') {
      if (ensureKey(true)) {
        await bootstrap();
      }
      return;
    }
    setStatus(`Chyba detailu: ${String(err.message)}`);
  }
}

async function bootstrap() {
  if (!ensureKey()) {
    setStatus('Bez klíče nelze načíst data.');
    return;
  }

  try {
    state.loading = true;
    setStatus('Načítám celý katalog...');
    const payload = await api('/api/catalog');

    state.catalog = payload.data.map((m) => {
      const finalTitle = (m.title || '').trim() || slugToTitle(m.slug);
      const titleNorm = normalizeText(finalTitle);
      const slugNorm = normalizeText(String(m.slug || '').replace(/-/g, ' '));
      const searchBlob = `${titleNorm} ${slugNorm}`.trim();
      const searchWords = searchBlob.split(' ').filter(Boolean).slice(0, 18);
      const searchTrigrams = buildTrigrams(searchBlob);
      return {
        ...m,
        title: finalTitle,
        searchTitle: titleNorm,
        searchSlug: slugNorm,
        searchBlob,
        searchWords,
        searchTrigrams
      };
    });

    if (!el.search.value.trim() && state.lastQuery) {
      el.search.value = state.lastQuery;
    }

    applyFilter(el.search.value.trim());

    const preferredSlug = state.lastSlug;
    if (preferredSlug) {
      const exists = state.catalog.find((m) => m.slug === preferredSlug);
      if (exists) {
        await loadMovie(preferredSlug);
        return;
      }
    }

    if (state.movies.length > 0 && !state.activeSlug) {
      await loadMovie(state.movies[0].slug);
    }
  } catch (err) {
    if (String(err.message) === 'Unauthorized') {
      if (ensureKey(true)) {
        await bootstrap();
      }
      return;
    }
    setStatus(`Chyba katalogu: ${String(err.message)}`);
  } finally {
    state.loading = false;
    updateLoadMoreButton();
  }
}

let searchTimer;
el.search.addEventListener('input', () => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => {
    state.activeSlug = '';
    localStorage.setItem(STORAGE_LAST_QUERY, el.search.value.trim());
    applyFilter(el.search.value.trim());
  }, 80);
});

el.changeKey.addEventListener('click', async () => {
  if (ensureKey(true)) {
    state.activeSlug = '';
    state.catalog = [];
    state.filtered = [];
    state.movies = [];
    await bootstrap();
  }
});

el.loadMore.addEventListener('click', () => {
  if (state.loading) return;
  state.visibleCount += PAGE_SIZE;
  state.movies = state.filtered.slice(0, state.visibleCount);
  renderResults();
  setStatus(`Zobrazeno ${state.movies.length} z ${state.filtered.length} filmů`);
});

if (el.playDirectBtn) {
  el.playDirectBtn.addEventListener('click', () => {
    playDirectCurrent();
  });
}

if (el.playerInteractionToggle) {
  el.playerInteractionToggle.addEventListener('click', () => {
    if (SAFE_MODE_LOCKED) {
      setStatus('Safe režim je zamčený: interakce v playeru zůstává vypnutá');
      return;
    }
    state.playerInteractionEnabled = !state.playerInteractionEnabled;
    localStorage.setItem(STORAGE_PLAYER_INTERACTION, state.playerInteractionEnabled ? '1' : '0');
    applyPlayerInteractionUi();
    applyPlayerClickShield();
    setStatus(
      state.playerInteractionEnabled
        ? 'Interakce v playeru povolena (doporučeno pro ovládání filmu)'
        : 'Interakce v playeru blokována (max anti-redirect režim)'
    );
  });
}

if (el.playerClickShield) {
  el.playerClickShield.addEventListener('click', () => {
    playDirectCurrent();
  });
}

el.popupShieldToggle.addEventListener('click', () => {
  if (SAFE_MODE_LOCKED) {
    setStatus('Safe režim je zamčený: anti-popup zůstává zapnutý');
    return;
  }
  state.popupShieldEnabled = !state.popupShieldEnabled;
  localStorage.setItem(STORAGE_POPUP_SHIELD, state.popupShieldEnabled ? '1' : '0');
  applyPopupShieldUi();
  applyPlayerSandbox();
  setStatus(state.popupShieldEnabled ? 'Anti-popup ochrana zapnuta' : 'Anti-popup ochrana vypnuta (vyšší kompatibilita)');
});

const originalWindowOpen = window.open.bind(window);
window.open = function patchedWindowOpen(...args) {
  if (!state.popupShieldEnabled) {
    return originalWindowOpen(...args);
  }
  if (popupTrapIsActive()) {
    state.popupTrapRemaining = Math.max(0, state.popupTrapRemaining - 1);
    return null;
  }
  return originalWindowOpen(...args);
};

window.addEventListener('blur', () => {
  if (!state.popupShieldEnabled || !popupGuardIsActive()) return;
  setTimeout(() => {
    try {
      window.focus();
    } catch {}
  }, 30);
});

document.addEventListener('visibilitychange', () => {
  if (!state.popupShieldEnabled || !popupGuardIsActive()) return;
  if (document.hidden) {
    setTimeout(() => {
      try {
        window.focus();
      } catch {}
    }, 40);
  }
});

applyPopupShieldUi();
applyPlayerInteractionUi();
applyPlayerClickShield();
applyPlayerSandbox();
applyPlayerReferrerPolicy(null);
if (SAFE_MODE_LOCKED) {
  state.popupShieldEnabled = true;
  state.playerInteractionEnabled = true;
  localStorage.setItem(STORAGE_POPUP_SHIELD, '1');
  localStorage.setItem(STORAGE_PLAYER_INTERACTION, '1');
  applyPopupShieldUi();
  applyPlayerInteractionUi();
  applyPlayerClickShield();
  applyPlayerSandbox();
  applyPlayerReferrerPolicy(state.selectedLink);
}
bootstrap();
