import { useEffect, useMemo, useState } from 'react';
import { Search, History, Play, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  checkDomainsBulk,
  fetchTop100DomainScanStatus,
  fetchDomainHistory,
  fetchTopCzDomainsModel,
  startTop100DomainScan,
  type CzDomainAvailability,
  type DomainBulkResponse,
  type DomainHistoryItem,
  type Top100ScanStatus,
  type TopCzDomainRow,
} from '@/crm/services/backend';

const AVAILABLE_TLDS = ['cz', 'com', 'eu', 'app', 'ai'] as const;
const CHECK_CHUNK_SIZE = 5;
const CHECK_CHUNK_DELAY_MS = 1400;
const BULK_API_TIMEOUT_MS = 20000;
const SMART_SUFFIX_POOL = [
  'xo', 'io', 'go', 'up', 'pro', 'web', 'shop', 'store', 'hub', 'lab', 'ly', 'ai', 'me', 'co', '24', 'plus', 'max',
  'now', 'app', 'net', 'box', 'base', 'spot', 'zone', 'nova', 'star', 'one', 'top', 'city', 'link', 'flow', 'mint',
  'nest', 'line', 'grid', 'deck', 'wave', 'cloud', 'core', 'point', 'drive', 'pulse', 'forge', 'kraft', 'craft', 'boost',
  'rocket', 'prime', 'elite', 'ultra', 'smart', 'quick', 'flash', 'click', 'world', 'portal', 'online', 'direct', 'target',
  'media', 'market', 'trade', 'group', 'team', 'works', 'space', 'pixel', 'studio', 'house', 'home', 'dom', 'auto', 'real',
  'estate', 'tech', 'it', 'soft', 'pay', 'fin', 'bank', 'crm', 'erp', 'api', 'seo', 'ads', 'lead', 'sale', 'shop24',
  'plus24', 'max24', 'guru', 'pilot', 'bird', 'fox', 'wolf', 'lion', 'nova24', 'go24', 'up24', 'zone24', 'biz', 'expert',
  'fast', 'easy', 'wow', 'neo', 'zen', 'peak', 'edge', 'vista', 'vision', 'logic', 'novaweb', 'proweb', 'on', 'x', 'z',
];

type LearnedModelStats = {
  prefixTop: string[];
  suffixTop: string[];
  wordTop: string[];
  lengthTop: number[];
  lengthWeights: Map<number, number>;
};

function splitBulkDomains(value: string): string[] {
  return Array.from(
    new Set(
      value
        .replace(/\r/g, '\n')
        .split(/[\n,;]+/)
        .map((item) => item.trim())
        .filter(Boolean),
    ),
  );
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function normalizeDomainRoot(value: string): string {
  const clean = value.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/^www\./, '');
  const host = clean.split('/')[0].split('?')[0].split('#')[0];
  return (host.includes('.') ? host.split('.')[0] : host).replace(/[^a-z0-9-]/g, '');
}

function buildSimilarCandidates(inputDomain: string, maxLength: number): string[] {
  const root = normalizeDomainRoot(inputDomain);
  if (!root) return [];

  const isAuto = /auto|auta|autick|autobazar|car/.test(root);
  const variants = new Set<string>();
  const prefixes = ['s', 'top', 'super', 'pro', 'my', 'online', 'best'];
  const suffixes = ['online', 'pro', 'shop', 'plus', 'web', 'portal', 'trh'];

  variants.add(root);
  if (isAuto) {
    [
      'auta',
      'auticka',
      'autobazar',
      'autoprodej',
      'autoweb',
      'autoplus',
      'autoonline',
      'autotrh',
      'autoportal',
      'autoprofi',
      'autosvet',
      'autoblog',
    ].forEach((v) => variants.add(v));
  } else if (root.length > 4) {
    variants.add(`${root}y`);
    variants.add(`${root}ik`);
  }

  for (const p of prefixes) variants.add(`${p}${root}`);
  for (const s of suffixes) variants.add(`${root}${s}`);
  for (const p of ['top', 'super', 'pro']) {
    for (const s of ['online', 'portal', 'plus']) {
      variants.add(`${p}${root}${s}`);
    }
  }
  variants.add(`${root}cz`);

  return Array.from(variants)
    .filter((v) => v.length >= 4 && v.length <= maxLength)
    .sort((a, b) => a.length - b.length || a.localeCompare(b))
    .slice(0, 35);
}

function normalizeLabelPart(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '')
    .replace(/--+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function buildTop100Suffixes(baseWord: string, forcedSuffix: string, topDomains: TopCzDomainRow[] = []): string[] {
  const base = normalizeLabelPart(baseWord);
  const forced = normalizeLabelPart(forcedSuffix);
  const contextual: string[] = [];
  if (/auto|car/.test(base)) contextual.push('car', 'cars', 'auto', 'drive', 'ride');
  if (/real|byt|dum|home/.test(base)) contextual.push('home', 'real', 'estate', 'dom', 'house');
  if (/shop|elektro|tech|it/.test(base)) contextual.push('shop', 'tech', 'it', 'store', 'market');

  const weightedByPattern = new Map<string, number>();
  for (const row of topDomains) {
    const host = normalizeLabelPart(row.domain.replace(/\.cz$/i, '').split('.').join(''));
    if (!host || host.length < 3) continue;
    const rankWeight = Math.max(1, 1001 - Math.max(1, row.rank || 1000));

    if (host.startsWith(base) && host.length > base.length) {
      const suffix = host.slice(base.length);
      if (suffix.length >= 1 && suffix.length <= 5) {
        weightedByPattern.set(suffix, (weightedByPattern.get(suffix) || 0) + rankWeight * 3);
      }
    }

    for (let len = 2; len <= 4; len += 1) {
      if (host.length <= len) continue;
      const suffix = host.slice(-len);
      if (!/^[a-z0-9]+$/.test(suffix)) continue;
      weightedByPattern.set(suffix, (weightedByPattern.get(suffix) || 0) + rankWeight);
    }
  }

  const learned = Array.from(weightedByPattern.entries())
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map((x) => x[0]);

  return Array.from(new Set([forced, ...contextual, ...learned, ...SMART_SUFFIX_POOL].filter(Boolean))).slice(0, 100);
}

function buildSmartCandidates(baseWord: string, suffixes: string[], maxLength: number, target = 20): string[] {
  const base = normalizeLabelPart(baseWord);
  if (!base) return [];
  const out = new Set<string>();
  for (const suffix of suffixes) {
    const normalizedSuffix = normalizeLabelPart(suffix);
    const label = `${base}${normalizedSuffix}`;
    if (label.length >= 3 && label.length <= maxLength) out.add(label);
    if (out.size >= target) break;
  }
  if (out.size < target && base.length <= maxLength) out.add(base);
  return Array.from(out).slice(0, target);
}

function extractLabelFromTopDomain(row: TopCzDomainRow): string {
  const host = row.domain.toLowerCase();
  const parts = host.split('.');
  if (parts.length >= 2) {
    return normalizeLabelPart(parts[0]);
  }
  return normalizeLabelPart(host.replace(/\.cz$/i, ''));
}

function analyzeTopDomainModel(rows: TopCzDomainRow[]): LearnedModelStats {
  const prefixScore = new Map<string, number>();
  const suffixScore = new Map<string, number>();
  const wordScore = new Map<string, number>();
  const lengthScore = new Map<number, number>();

  for (const row of rows) {
    const label = extractLabelFromTopDomain(row);
    if (!label || label.length < 2) continue;
    const rankWeight = Math.max(1, 10001 - Math.max(1, row.rank || 10000));

    lengthScore.set(label.length, (lengthScore.get(label.length) || 0) + rankWeight);

    for (let len = 2; len <= 4; len += 1) {
      if (label.length <= len) continue;
      const prefix = label.slice(0, len);
      if (!/^[a-z0-9]+$/.test(prefix)) continue;
      prefixScore.set(prefix, (prefixScore.get(prefix) || 0) + rankWeight);
    }

    for (let len = 2; len <= 5; len += 1) {
      if (label.length <= len) continue;
      const suffix = label.slice(-len);
      if (!/^[a-z0-9]+$/.test(suffix)) continue;
      suffixScore.set(suffix, (suffixScore.get(suffix) || 0) + rankWeight);
    }

    const tokens = label.split('-').flatMap((seg) => seg.split(/[0-9]+/)).filter(Boolean);
    for (const token of tokens) {
      if (token.length < 2 || token.length > 10) continue;
      wordScore.set(token, (wordScore.get(token) || 0) + rankWeight);
      for (let i = 0; i <= token.length - 3; i += 1) {
        const frag = token.slice(i, i + 3);
        if (/^[a-z]+$/.test(frag)) {
          wordScore.set(frag, (wordScore.get(frag) || 0) + Math.floor(rankWeight / 10));
        }
      }
    }
  }

  const suffixTop = Array.from(suffixScore.entries())
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map((x) => x[0])
    .slice(0, 300);

  const prefixTop = Array.from(prefixScore.entries())
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map((x) => x[0])
    .slice(0, 300);

  const wordTop = Array.from(wordScore.entries())
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map((x) => x[0])
    .slice(0, 500);

  const lengthTop = Array.from(lengthScore.entries())
    .sort((a, b) => b[1] - a[1] || a[0] - b[0])
    .map((x) => x[0])
    .slice(0, 8);

  return {
    prefixTop,
    suffixTop,
    wordTop,
    lengthTop,
    lengthWeights: lengthScore,
  };
}

function buildAutoCandidatesFromModel(
  model: LearnedModelStats,
  topDomains: TopCzDomainRow[],
  maxLength = 10,
  target = 80,
): string[] {
  if (topDomains.length === 0) return [];

  const takenSet = new Set(
    topDomains
      .map((row) => extractLabelFromTopDomain(row))
      .filter(Boolean),
  );
  const preferredLengths = model.lengthTop.length > 0 ? model.lengthTop : [5, 6, 7, 8];
  const vowels = ['a', 'e', 'i', 'o', 'u', 'y'];
  const rankedSeeds = topDomains
    .slice()
    .sort((a, b) => a.rank - b.rank)
    .map((row) => extractLabelFromTopDomain(row))
    .filter((label) => label.length >= 3 && label.length <= maxLength)
    .slice(0, 1200);

  const scoreLen = (len: number) => {
    let score = 0;
    for (let i = 0; i < preferredLengths.length; i += 1) {
      const dist = Math.abs(len - preferredLengths[i]);
      score += Math.max(0, 60 - dist * 20) / (i + 1);
    }
    score += Math.min(80, (model.lengthWeights.get(len) || 0) / 300);
    return score;
  };

  const pool = new Map<string, number>();
  const put = (label: string, baseScore: number) => {
    const clean = normalizeLabelPart(label);
    if (!clean || clean.length < 3 || clean.length > maxLength) return;
    if (takenSet.has(clean)) return;
    if (/^\d+$/.test(clean)) return;
    if (clean.includes('--')) return;
    const score = baseScore + scoreLen(clean.length);
    pool.set(clean, Math.max(pool.get(clean) || -1e9, score));
  };

  const mutateSeed = (seed: string, rankWeight: number) => {
    if (!seed) return;
    const chars = seed.split('');
    const last = chars[chars.length - 1];
    const secondLast = chars.length > 1 ? chars[chars.length - 2] : '';

    // 1) posledni znak na jinou samohlasku: alza -> alze/alzi/alzo
    if (vowels.includes(last)) {
      for (const v of vowels) {
        if (v === last) continue;
        put(`${seed.slice(0, -1)}${v}`, 80 + rankWeight);
      }
    } else {
      for (const v of vowels) {
        put(`${seed}${v}`, 64 + rankWeight);
      }
    }

    // 2) predposledni samohlaska varianta (konzervativni zmena)
    if (vowels.includes(secondLast) && chars.length >= 4) {
      for (const v of vowels) {
        if (v === secondLast) continue;
        const label = `${seed.slice(0, -2)}${v}${last}`;
        put(label, 56 + rankWeight);
      }
    }

    // 3) vymena posledniho znaku za caste koncovkove znaky z modelu
    for (const sfx of model.suffixTop.slice(0, 16)) {
      const tail = sfx.slice(-1);
      if (!tail || tail.length !== 1) continue;
      if (tail === last) continue;
      put(`${seed.slice(0, -1)}${tail}`, 48 + rankWeight);
    }

    // 4) drop + samohlaska: alza -> alz + o/e/i
    if (seed.length >= 4) {
      const stem = seed.slice(0, -1);
      for (const v of ['a', 'e', 'i', 'o']) {
        put(`${stem}${v}`, 44 + rankWeight);
      }
    }
  };

  for (let i = 0; i < rankedSeeds.length; i += 1) {
    const rankWeight = Math.max(1, Math.floor((1200 - i) / 120));
    mutateSeed(rankedSeeds[i], rankWeight);
    if (pool.size >= target * 8) break;
  }

  return Array.from(pool.entries())
    .sort((a, b) => b[1] - a[1] || a[0].length - b[0].length || a[0].localeCompare(b[0]))
    .map(([label]) => label)
    .slice(0, target);
}

function sortSimilarRows(items: CzDomainAvailability[]): CzDomainAvailability[] {
  return [...items].sort((a, b) => a.domain.length - b.domain.length || a.domain.localeCompare(b.domain));
}

function statusBadge(result: { status: string }) {
  if (result.status === 'available') return <Badge className="bg-green-600 text-white hover:bg-green-600">Volna</Badge>;
  if (result.status === 'taken') return <Badge className="bg-red-600 text-white hover:bg-red-600">Zabrana</Badge>;
  if (result.status === 'error') return <Badge variant="outline">Chyba</Badge>;
  return <Badge variant="outline">Nelze overit</Badge>;
}

function formatExpiry(value: string | null): string {
  if (!value || !value.trim()) return 'Neuvedeno';
  const parsed = new Date(value);
  if (!Number.isNaN(parsed.getTime())) return parsed.toLocaleDateString('cs-CZ');
  return value;
}

function formatCheckedAt(value: string): string {
  if (!value || !value.trim()) return 'Neuvedeno';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return 'Neuvedeno';
  return parsed.toLocaleString('cs-CZ');
}

function buildBulkErrorResponse(domains: string[], tld: string, message: string): DomainBulkResponse {
  const now = new Date().toISOString();
  const results: CzDomainAvailability[] = domains.map((domain) => ({
    domain,
    tld,
    status: 'error',
    available: false,
    message,
    source: 'frontend-timeout-guard',
    checkedAt: now,
    owner: null,
    expiresAt: null,
    registrar: null,
    registeredAt: null,
    changedAt: null,
    registrantId: null,
    statuses: [],
    nameServers: [],
    details: {},
    rawSnippet: '',
  }));

  return {
    batchId: null,
    total: results.length,
    available: 0,
    taken: 0,
    unknown: 0,
    error: results.length,
    results,
  };
}

function levenshteinDistance(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const dp = Array.from({ length: m + 1 }, () => Array<number>(n + 1).fill(0));
  for (let i = 0; i <= m; i += 1) dp[i][0] = i;
  for (let j = 0; j <= n; j += 1) dp[0][j] = j;
  for (let i = 1; i <= m; i += 1) {
    for (let j = 1; j <= n; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + cost,
      );
    }
  }
  return dp[m][n];
}

function pronounceabilityScore(label: string): number {
  const vowels = new Set(['a', 'e', 'i', 'o', 'u', 'y']);
  if (!label) return -1000;
  if (!/[aeiouy]/.test(label)) return -600;
  if (/[^a-z0-9]/.test(label)) return -500;
  if (/\d/.test(label)) return -120;
  if (/(.)\1\1/.test(label)) return -120;

  let vowelCount = 0;
  let maxConsRun = 0;
  let maxVowelRun = 0;
  let consRun = 0;
  let vowelRun = 0;
  for (const ch of label) {
    if (vowels.has(ch)) {
      vowelCount += 1;
      vowelRun += 1;
      consRun = 0;
    } else {
      consRun += 1;
      vowelRun = 0;
    }
    maxConsRun = Math.max(maxConsRun, consRun);
    maxVowelRun = Math.max(maxVowelRun, vowelRun);
  }

  const ratio = vowelCount / label.length;
  let score = 0;
  score += Math.max(0, 100 - Math.abs(ratio - 0.45) * 260);
  score -= Math.max(0, maxConsRun - 2) * 35;
  score -= Math.max(0, maxVowelRun - 2) * 28;

  const patterns = ['cv', 'vc'];
  let altHits = 0;
  for (let i = 0; i < label.length - 1; i += 1) {
    const pair = `${vowels.has(label[i]) ? 'v' : 'c'}${vowels.has(label[i + 1]) ? 'v' : 'c'}`;
    if (patterns.includes(pair)) altHits += 1;
  }
  score += altHits * 6;

  return score;
}

function generateManualVariants(
  seed: string,
  model: LearnedModelStats,
  maxLength = 10,
  maxCount = 120,
): string[] {
  const base = normalizeLabelPart(seed);
  if (!base) return [];
  const vowels = ['a', 'e', 'i', 'o', 'u', 'y'];
  const similarConsonants: Record<string, string[]> = {
    b: ['p', 'v'],
    p: ['b', 'f'],
    d: ['t'],
    t: ['d'],
    g: ['k'],
    k: ['g', 'c'],
    s: ['z', 'c'],
    z: ['s'],
    c: ['k', 's'],
    f: ['v', 'p'],
    v: ['f', 'w', 'b'],
    m: ['n'],
    n: ['m'],
    l: ['r'],
    r: ['l'],
  };

  const out = new Set<string>();
  const add = (x: string) => {
    const clean = normalizeLabelPart(x);
    if (!clean || clean.length < 2 || clean.length > maxLength) return;
    if (clean === base) return;
    out.add(clean);
  };

  // Special handling for very short inputs (e.g. "zo")
  if (base.length <= 2) {
    const shortEnds = ['lo', 'la', 'li', 'v', 'b', 'x', 'n', 'r', 's', 'm', 'go', 'io', 'up'];
    const prefixes = ['a', 'e', 'i', 'o', 'u', 'z', 'x', 'm', 't', 'k'];
    for (const end of shortEnds) add(`${base}${end}`);
    for (const p of prefixes) add(`${p}${base}`);
    for (const v of vowels) add(`${base[0]}${v}${base[1] || ''}`);
    for (const c of ['b', 'v', 'l', 'r', 'm']) add(`${base}${c}`);
    for (const c of ['b', 'v', 'l', 'r', 'm']) add(`${base[0]}u${c}`);
    return Array.from(out).slice(0, maxCount);
  }

  // 1) replace last char with vowels / learned suffix endings
  const endings = Array.from(new Set([...vowels, ...model.suffixTop.slice(0, 20).map((s) => s.slice(-1)).filter(Boolean)]));
  for (const e of endings) add(`${base.slice(0, -1)}${e}`);

  // 2) mutate last two chars (vowel/consonant-like)
  if (base.length >= 4) {
    const last = base[base.length - 1];
    const prev = base[base.length - 2];
    if (vowels.includes(prev)) {
      for (const v of vowels) add(`${base.slice(0, -2)}${v}${last}`);
    }
    if (similarConsonants[last]) {
      for (const c of similarConsonants[last]) add(`${base.slice(0, -1)}${c}`);
    }
  }

  // 3) stem + short ending from learned suffixes (1-2 chars)
  const stem = base.slice(0, -1);
  for (const sfx of model.suffixTop.slice(0, 40)) {
    const tail = normalizeLabelPart(sfx).slice(-2);
    if (!tail) continue;
    add(`${stem}${tail}`);
  }

  // 4) insert vowel before last consonant
  if (base.length >= 4) {
    const idx = base.length - 1;
    for (const v of vowels) add(`${base.slice(0, idx)}${v}${base.slice(idx)}`);
  }

  // 5) swap last two chars
  if (base.length >= 4) {
    add(`${base.slice(0, -2)}${base[base.length - 1]}${base[base.length - 2]}`);
  }

  return Array.from(out).slice(0, maxCount);
}

function generateFirstLetterVariants(seed: string, maxCount = 20): string[] {
  const base = normalizeLabelPart(seed);
  if (!base || base.length < 2) return [];
  const out = new Set<string>();
  const alphabet = 'abcdefghijklmnopqrstuvwxyz';
  const original = base[0];

  for (const ch of alphabet) {
    if (ch === original) continue;
    out.add(`${ch}${base.slice(1)}`);
    if (out.size >= maxCount) break;
  }

  return Array.from(out).slice(0, maxCount);
}

export function FreeDomainsPage() {
  const [similarInput, setSimilarInput] = useState('auto.cz');
  const [maxDomainLength, setMaxDomainLength] = useState(18);
  const [smartManualInput, setSmartManualInput] = useState('malibo.cz');
  const [smartTopSuffixes, setSmartTopSuffixes] = useState<string[]>([]);
  const [topCzModel, setTopCzModel] = useState<TopCzDomainRow[]>([]);
  const [topModelLimit, setTopModelLimit] = useState(1000);
  const [topModelSearch, setTopModelSearch] = useState('');
  const [loadingTopModel, setLoadingTopModel] = useState(false);
  const [loadingTopScanStart, setLoadingTopScanStart] = useState(false);
  const [loadingTopScanStatus, setLoadingTopScanStatus] = useState(false);
  const [bulkInput, setBulkInput] = useState('');
  const [selectedTlds, setSelectedTlds] = useState<string[]>(['cz']);

  const [loadingSimilar, setLoadingSimilar] = useState(false);
  const [loadingBulk, setLoadingBulk] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const [similarResult, setSimilarResult] = useState<CzDomainAvailability[] | null>(null);
  const [bulkResult, setBulkResult] = useState<DomainBulkResponse | null>(null);
  const [history, setHistory] = useState<DomainHistoryItem[]>([]);
  const [topScanStatus, setTopScanStatus] = useState<Top100ScanStatus | null>(null);
  const [smartRows, setSmartRows] = useState<CzDomainAvailability[]>([]);
  const [loadingSmartCheck, setLoadingSmartCheck] = useState(false);
  const [smartError, setSmartError] = useState<string | null>(null);

  const [similarError, setSimilarError] = useState<string | null>(null);
  const [bulkError, setBulkError] = useState<string | null>(null);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [topScanError, setTopScanError] = useState<string | null>(null);
  const [checkProgress, setCheckProgress] = useState<string | null>(null);
  const learnedModel = useMemo(() => analyzeTopDomainModel(topCzModel), [topCzModel]);
  const normalizedTopSearch = topModelSearch.trim().toLowerCase();
  const filteredTopModel = topCzModel
    .slice()
    .sort((a, b) => a.rank - b.rank)
    .filter((row) => !normalizedTopSearch || row.domain.toLowerCase().includes(normalizedTopSearch));

  const loadHistory = async () => {
    setLoadingHistory(true);
    setHistoryError(null);
    try {
      const rows = await fetchDomainHistory(100);
      setHistory(rows);
    } catch (e) {
      setHistory([]);
      setHistoryError(e instanceof Error ? e.message : 'Historii se nepodarilo nacist');
    } finally {
      setLoadingHistory(false);
    }
  };

  const loadTopCzModel = async (refresh = false, limit = topModelLimit) => {
    setLoadingTopModel(true);
    try {
      const rows = await fetchTopCzDomainsModel({ limit, refresh });
      setTopCzModel(rows);
    } catch {
      setTopCzModel([]);
    } finally {
      setLoadingTopModel(false);
    }
  };

  const loadTopScanStatus = async () => {
    setLoadingTopScanStatus(true);
    setTopScanError(null);
    try {
      const status = await fetchTop100DomainScanStatus();
      setTopScanStatus(status);
    } catch (e) {
      setTopScanError(e instanceof Error ? e.message : 'Status top scan nelze nacist');
      setTopScanStatus(null);
    } finally {
      setLoadingTopScanStatus(false);
    }
  };

  useEffect(() => {
    loadHistory();
    loadTopCzModel(false);
    loadTopScanStatus();
  }, []);

  useEffect(() => {
    void loadTopCzModel(false, topModelLimit);
  }, [topModelLimit]);

  useEffect(() => {
    const suffixes = Array.from(new Set([...learnedModel.suffixTop.slice(0, 100), ...SMART_SUFFIX_POOL])).slice(0, 100);
    setSmartTopSuffixes(suffixes);
  }, [learnedModel]);

  useEffect(() => {
    if (!topScanStatus?.running) return;
    const timer = window.setInterval(() => {
      void loadTopScanStatus();
    }, 3500);
    return () => window.clearInterval(timer);
  }, [topScanStatus?.running]);

  const onStartTopScan = async () => {
    setLoadingTopScanStart(true);
    setTopScanError(null);
    try {
      await startTop100DomainScan({ refreshTop: false, wait: false });
      await loadTopScanStatus();
    } catch (e) {
      setTopScanError(e instanceof Error ? e.message : 'Top scan se nepodarilo spustit');
    } finally {
      setLoadingTopScanStart(false);
    }
  };

  const onSmartCheck20 = async () => {
    const seedRoot = normalizeDomainRoot(smartManualInput);
    if (!seedRoot || seedRoot.length < 2) {
      setSmartError('Zadejte slovo nebo domenu, napr. malibo.cz');
      return;
    }
    if (selectedTlds.length === 0) {
      setSmartError('Vyberte alespon 1 TLD');
      return;
    }
    setLoadingSmartCheck(true);
    setSmartError(null);
    setCheckProgress(null);
    try {
      const suffixes = Array.from(new Set([...learnedModel.suffixTop.slice(0, 100), ...SMART_SUFFIX_POOL])).slice(0, 100);
      setSmartTopSuffixes(suffixes);
      const base = seedRoot.toLowerCase();
      const rawVariants = generateManualVariants(base, learnedModel, 10, 160);
      const ranked = rawVariants
        .map((label) => {
          const dist = levenshteinDistance(base, label);
          const pron = pronounceabilityScore(label);
          const lenPenalty = Math.abs(label.length - base.length) * 10;
          const distPenalty = dist * 18;
          const modelTailBonus = learnedModel.suffixTop.slice(0, 60).some((s) => label.endsWith(s.slice(-2))) ? 20 : 0;
          const total = pron + modelTailBonus - lenPenalty - distPenalty;
          return { label, total, dist };
        })
        .filter((x) => x.dist <= 3 && x.total > -300)
        .sort((a, b) => b.total - a.total || a.label.length - b.label.length || a.label.localeCompare(b.label))
        .map((x) => x.label)
        .slice(0, 20);

      const firstLetterVariants = generateFirstLetterVariants(base, 20);
      const finalCandidates = Array.from(new Set([...ranked, ...firstLetterVariants])).slice(0, 40);

      if (finalCandidates.length === 0) {
        setSmartError('Nepodarilo se vytvorit kombinace z tohoto slova');
        setSmartRows([]);
        return;
      }

      const primaryTld = selectedTlds[0] || 'cz';
      const response = await runBulkInChunks(finalCandidates, [primaryTld]);
      const ordered = [...response.results].sort((a, b) => {
        const score = (s: string) => (s === 'available' ? 4 : s === 'taken' ? 3 : s === 'unknown' ? 2 : 1);
        const diff = score(b.status) - score(a.status);
        if (diff !== 0) return diff;
        return a.domain.length - b.domain.length;
      });
      setSmartRows(ordered.slice(0, 40));
      await loadHistory();
    } catch (e) {
      setSmartError(e instanceof Error ? e.message : 'Smart check selhal');
      setSmartRows([]);
    } finally {
      setLoadingSmartCheck(false);
      setCheckProgress(null);
    }
  };

  const runBulkInChunks = async (domains: string[], tlds: string[]): Promise<DomainBulkResponse> => {
    const primaryTld = tlds[0] || 'cz';
    const safeBulkCheck = async (chunkDomains: string[], concurrency: number): Promise<DomainBulkResponse> => {
      const timeoutFallback = buildBulkErrorResponse(chunkDomains, primaryTld, 'Timeout pri overeni domeny');
      try {
        return await Promise.race<DomainBulkResponse>([
          checkDomainsBulk({
            domains: chunkDomains,
            tlds,
            concurrency,
          }),
          new Promise<DomainBulkResponse>((resolve) =>
            window.setTimeout(() => resolve(timeoutFallback), BULK_API_TIMEOUT_MS),
          ),
        ]);
      } catch (e) {
        return buildBulkErrorResponse(
          chunkDomains,
          primaryTld,
          e instanceof Error ? e.message : 'Chyba overeni domeny',
        );
      }
    };

    const normalizedDomains = Array.from(new Set(domains.map((d) => d.trim()).filter(Boolean)));
    const chunks: string[][] = [];
    for (let i = 0; i < normalizedDomains.length; i += CHECK_CHUNK_SIZE) {
      chunks.push(normalizedDomains.slice(i, i + CHECK_CHUNK_SIZE));
    }

    const mergedResults: DomainBulkResponse['results'] = [];
    let mergedBatchId: string | null = null;

    for (let idx = 0; idx < chunks.length; idx += 1) {
      const chunk = chunks[idx];
      setCheckProgress(`Kontroluji davku ${idx + 1}/${chunks.length} (${chunk.length} domen)`);
      const response = await safeBulkCheck(chunk, 4);
      mergedBatchId = response.batchId ?? mergedBatchId;
      mergedResults.push(...response.results);

      if (idx < chunks.length - 1) {
        await sleep(CHECK_CHUNK_DELAY_MS);
      }
    }

    const uniqueByDomain = new Map<string, DomainBulkResponse['results'][number]>();
    for (const row of mergedResults) {
      if (!uniqueByDomain.has(row.domain)) uniqueByDomain.set(row.domain, row);
    }
    let results = Array.from(uniqueByDomain.values());

    for (let pass = 1; pass <= 2; pass += 1) {
      const unresolved = results.filter((r) => r.status === 'unknown' || r.status === 'error');
      if (unresolved.length === 0) break;

      setCheckProgress(`Dodatecna kontrola neoverenych (${pass}/2): ${unresolved.length} domen`);
      const unresolvedChunks: string[][] = [];
      for (let i = 0; i < unresolved.length; i += CHECK_CHUNK_SIZE) {
        unresolvedChunks.push(unresolved.slice(i, i + CHECK_CHUNK_SIZE).map((r) => r.domain));
      }

      for (let idx = 0; idx < unresolvedChunks.length; idx += 1) {
        const response = await safeBulkCheck(unresolvedChunks[idx], 2);
        for (const row of response.results) {
          const prev = uniqueByDomain.get(row.domain);
          const prevScore = prev?.status === 'available' || prev?.status === 'taken' ? 2 : 0;
          const nextScore = row.status === 'available' || row.status === 'taken' ? 2 : 0;
          if (!prev || nextScore >= prevScore) uniqueByDomain.set(row.domain, row);
        }
        if (idx < unresolvedChunks.length - 1) await sleep(1200);
      }

      results = Array.from(uniqueByDomain.values());
      if (pass < 2) await sleep(1800);
    }

    return {
      batchId: mergedBatchId,
      total: results.length,
      available: results.filter((r) => r.status === 'available').length,
      taken: results.filter((r) => r.status === 'taken').length,
      unknown: results.filter((r) => r.status === 'unknown').length,
      error: results.filter((r) => r.status === 'error').length,
      results,
    };
  };

  const onSimilarGenerate = async () => {
    const domain = similarInput.trim().toLowerCase();
    if (!domain) {
      setSimilarError('Zadejte domenu, napriklad auto.cz');
      setSimilarResult(null);
      return;
    }
    if (selectedTlds.length === 0) {
      setSimilarError('Vyberte alespon 1 koncovku');
      setSimilarResult(null);
      return;
    }
    if (!Number.isFinite(maxDomainLength) || maxDomainLength < 4) {
      setSimilarError('Nastavte platny maximalni pocet znaku (min. 4)');
      setSimilarResult(null);
      return;
    }

    setLoadingSimilar(true);
    setSimilarError(null);
    setCheckProgress(null);
    try {
      const candidates = buildSimilarCandidates(domain, maxDomainLength);
      if (candidates.length === 0) {
        setSimilarError('Neplatny vstup domeny');
        setSimilarResult(null);
        return;
      }
      const response = await runBulkInChunks(candidates, selectedTlds);
      setSimilarResult(sortSimilarRows(response.results).slice(0, 20));
      await loadHistory();
    } catch (e) {
      setSimilarError(e instanceof Error ? e.message : 'Generator domen selhal');
      setSimilarResult(null);
    } finally {
      setLoadingSimilar(false);
      setCheckProgress(null);
    }
  };

  const onBulkCheck = async () => {
    const domains = splitBulkDomains(bulkInput);
    if (domains.length === 0) {
      setBulkError('Vlozte alespon 1 domenu');
      setBulkResult(null);
      return;
    }
    if (selectedTlds.length === 0) {
      setBulkError('Vyberte alespon 1 koncovku');
      setBulkResult(null);
      return;
    }

    setLoadingBulk(true);
    setBulkError(null);
    setCheckProgress(null);
    try {
      const response = await runBulkInChunks(domains, selectedTlds);
      setBulkResult(response);
      await loadHistory();
    } catch (e) {
      setBulkError(e instanceof Error ? e.message : 'Hromadne overeni selhalo');
      setBulkResult(null);
    } finally {
      setLoadingBulk(false);
      setCheckProgress(null);
    }
  };

  return (
    <div className="space-y-4">
      <Tabs defaultValue="registry" className="w-full space-y-4">
        <TabsList className="inline-flex whitespace-nowrap border border-border/80 bg-muted/80">
          <TabsTrigger value="registry">Databaze domen</TabsTrigger>
          <TabsTrigger value="top-model">Top CZ statistika</TabsTrigger>
          <TabsTrigger value="history">Historie zadavani</TabsTrigger>
        </TabsList>

        <TabsContent value="registry" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Automatika Top 100 x 40</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <Button onClick={onStartTopScan} disabled={loadingTopScanStart || Boolean(topScanStatus?.running)}>
                  <Play className="size-4" />
                  {loadingTopScanStart ? 'Spoustim...' : topScanStatus?.running ? 'Prave bezi' : 'Spustit scan'}
                </Button>
                <Button variant="outline" onClick={() => loadTopScanStatus()} disabled={loadingTopScanStatus}>
                  <RefreshCw className="size-4" />
                  {loadingTopScanStatus ? 'Obnovuji...' : 'Obnovit stav'}
                </Button>
                {topScanStatus?.running ? (
                  <Badge className="bg-amber-600 text-white hover:bg-amber-600">Bezi</Badge>
                ) : (
                  <Badge variant="outline">Neaktivni</Badge>
                )}
              </div>

              {topScanError && <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{topScanError}</div>}

              {topScanStatus && (
                <div className="space-y-2 rounded-md border border-border p-3">
                  <div className="flex items-center justify-between text-sm">
                    <span>Prubeh: {topScanStatus.processedBases}/{Math.max(1, topScanStatus.totalBases)}</span>
                    <span>{topScanStatus.progressPct}%</span>
                  </div>
                  <div className="h-2 w-full rounded bg-muted">
                    <div
                      className="h-2 rounded bg-primary transition-all"
                      style={{ width: `${Math.max(0, Math.min(100, topScanStatus.progressPct))}%` }}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground md:grid-cols-4">
                    <div>Volne: {topScanStatus.available}</div>
                    <div>Zabrane: {topScanStatus.taken}</div>
                    <div>Nejiste: {topScanStatus.unknown}</div>
                    <div>Chyby: {topScanStatus.error + topScanStatus.failedBases}</div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    ETA: {topScanStatus.etaSeconds == null ? '—' : `${topScanStatus.etaSeconds}s`}
                    {topScanStatus.currentBaseDomain ? ` · Prave: ${topScanStatus.currentBaseDomain}` : ''}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Smart Generator + Checker (manualni vstup)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <input
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                value={smartManualInput}
                onChange={(e) => setSmartManualInput(e.target.value)}
                placeholder="Napr. malibo.cz"
              />
              <div className="flex items-center gap-2">
                <Button onClick={onSmartCheck20} disabled={loadingSmartCheck}>
                  {loadingSmartCheck ? 'Generuji a overuji 40 kombinaci...' : 'Zkusit 40 kombinaci'}
                </Button>
              </div>
              {smartError && <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{smartError}</div>}
              {checkProgress && <div className="text-xs text-muted-foreground">{checkProgress}</div>}
              {smartRows.length > 0 && (
                <div className="rounded-md border border-border overflow-hidden">
                  <div className="max-h-80 overflow-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-muted/50 text-muted-foreground">
                        <tr>
                          <th className="text-left px-3 py-2 font-medium">Domena</th>
                          <th className="text-left px-3 py-2 font-medium">Stav</th>
                          <th className="text-left px-3 py-2 font-medium">Vlastnik</th>
                          <th className="text-left px-3 py-2 font-medium">Kontrola</th>
                        </tr>
                      </thead>
                      <tbody>
                        {smartRows.map((row) => (
                          <tr key={`${row.domain}-${row.checkedAt}`} className="border-t border-border/60">
                            <td className="px-3 py-2 font-medium">{row.domain}</td>
                            <td className="px-3 py-2">{statusBadge({ status: row.status })}</td>
                            <td className="px-3 py-2 text-muted-foreground">{row.status === 'taken' ? (row.owner || 'Neuvedeno') : '—'}</td>
                            <td className="px-3 py-2 text-muted-foreground">{formatCheckedAt(row.checkedAt)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Generator podobnych domen (prvni)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="text-sm font-medium">Koncovky domen</div>
                <div className="flex items-center gap-4 flex-wrap">
                  {AVAILABLE_TLDS.map((tld) => (
                    <label key={tld} className="inline-flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={selectedTlds.includes(tld)}
                        onChange={(e) => {
                          setSelectedTlds((prev) =>
                            e.target.checked ? Array.from(new Set([...prev, tld])) : prev.filter((x) => x !== tld),
                          );
                        }}
                      />
                      <span>.{tld}</span>
                    </label>
                  ))}
                </div>
              </div>

              <input
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                value={similarInput}
                onChange={(e) => setSimilarInput(e.target.value)}
                placeholder="napr. auto.cz"
              />
              <div className="space-y-1">
                <div className="text-xs text-muted-foreground">Max znaku</div>
                <input
                  type="number"
                  min={4}
                  max={63}
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                  value={maxDomainLength}
                  onChange={(e) => setMaxDomainLength(Math.max(4, Number(e.target.value || 4)))}
                />
              </div>
              <div className="text-xs text-muted-foreground">
                Generator preferuje nejkratsi nazvy jako prvni, teprve potom delsi.
              </div>
              <div className="flex items-center gap-2">
                <Button onClick={onSimilarGenerate} disabled={loadingSimilar}>
                  <Search className="size-4" />
                  {loadingSimilar ? 'Generuji alternativy...' : 'Najit 20 alternativ'}
                </Button>
              </div>
              {checkProgress && <div className="text-xs text-muted-foreground">{checkProgress}</div>}

              {similarError && <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{similarError}</div>}

              {similarResult && (
                <div className="rounded-md border border-border overflow-hidden">
                  <div className="max-h-80 overflow-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-muted/50 text-muted-foreground">
                        <tr>
                          <th className="text-left px-3 py-2 font-medium">Domena</th>
                          <th className="text-left px-3 py-2 font-medium">Stav</th>
                          <th className="text-left px-3 py-2 font-medium">Vlastnik</th>
                          <th className="text-left px-3 py-2 font-medium">Exspirace</th>
                        </tr>
                      </thead>
                      <tbody>
                        {similarResult.map((item) => (
                          <tr key={`${item.domain}-${item.checkedAt}`} className="border-t border-border/60">
                            <td className="px-3 py-2 font-medium">{item.domain}</td>
                            <td className="px-3 py-2">{statusBadge(item)}</td>
                            <td className="px-3 py-2 text-muted-foreground">{item.status === 'taken' ? (item.owner || 'Neuvedeno') : '—'}</td>
                            <td className="px-3 py-2 text-muted-foreground">{item.status === 'taken' ? formatExpiry(item.expiresAt) : '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Bulk overeni domen</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <textarea
                className="min-h-40 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={bulkInput}
                onChange={(e) => setBulkInput(e.target.value)}
                placeholder={'pavel\nalza.cz\nmojedomena'}
              />
              <div className="flex items-center gap-2">
                <Button onClick={onBulkCheck} disabled={loadingBulk}>
                  <Search className="size-4" />
                  {loadingBulk ? 'Kontroluji vse...' : 'Zkontrolovat vse'}
                </Button>
                <Button variant="outline" onClick={() => setBulkInput('')} disabled={loadingBulk}>
                  Vymazat vstup
                </Button>
              </div>
              {checkProgress && <div className="text-xs text-muted-foreground">{checkProgress}</div>}

              {bulkError && <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{bulkError}</div>}

              {bulkResult && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm flex-wrap">
                    <Badge className="bg-green-600 text-white hover:bg-green-600">Volne: {bulkResult.available}</Badge>
                    <Badge className="bg-red-600 text-white hover:bg-red-600">Zabrane: {bulkResult.taken}</Badge>
                    <Badge variant="outline">Nejiste: {bulkResult.unknown}</Badge>
                    <Badge variant="outline">Chyby: {bulkResult.error}</Badge>
                    <Badge variant="outline">Celkem: {bulkResult.total}</Badge>
                  </div>

                  <div className="rounded-md border border-border overflow-hidden">
                    <div className="max-h-80 overflow-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-muted/50 text-muted-foreground">
                          <tr>
                            <th className="text-left px-3 py-2 font-medium">Domena</th>
                            <th className="text-left px-3 py-2 font-medium">Stav</th>
                            <th className="text-left px-3 py-2 font-medium">Vlastnik</th>
                            <th className="text-left px-3 py-2 font-medium">Exspirace</th>
                          </tr>
                        </thead>
                        <tbody>
                          {bulkResult.results.map((item) => (
                            <tr key={`${item.domain}-${item.checkedAt}`} className="border-t border-border/60">
                              <td className="px-3 py-2 font-medium">{item.domain}</td>
                              <td className="px-3 py-2">{statusBadge(item)}</td>
                              <td className="px-3 py-2 text-muted-foreground">{item.status === 'taken' ? (item.owner || 'Neuvedeno') : '—'}</td>
                              <td className="px-3 py-2 text-muted-foreground">{item.status === 'taken' ? formatExpiry(item.expiresAt) : '—'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

        </TabsContent>

        <TabsContent value="top-model" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Top CZ domeny podle navstevnosti</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <Button variant={topModelLimit === 1000 ? 'default' : 'outline'} onClick={() => setTopModelLimit(1000)} disabled={loadingTopModel}>
                  1000
                </Button>
                <Button variant={topModelLimit === 10000 ? 'default' : 'outline'} onClick={() => setTopModelLimit(10000)} disabled={loadingTopModel}>
                  10 000
                </Button>
                <Button variant="outline" onClick={() => loadTopCzModel(true, topModelLimit)} disabled={loadingTopModel}>
                  {loadingTopModel ? 'Nacitam...' : `Obnovit top ${topModelLimit.toLocaleString('cs-CZ')} CZ domen`}
                </Button>
                <Badge variant="outline">Polozek: {topCzModel.length}</Badge>
                <Badge variant="outline">Zobrazeno: {filteredTopModel.length}</Badge>
              </div>
              <input
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                value={topModelSearch}
                onChange={(e) => setTopModelSearch(e.target.value)}
                placeholder="Hledat domenu, napr. kasa.cz"
              />
              <div className="text-xs text-muted-foreground">
                Zdroj: domaintyper API. Razeni: rank v .CZ (1 = nejvyssi navstevnost v jejich zebricku).
              </div>
              {topCzModel.length === 0 ? (
                <div className="text-sm text-muted-foreground">Data zatim nejsou nactena.</div>
              ) : filteredTopModel.length === 0 ? (
                <div className="text-sm text-muted-foreground">Pro hledany vyraz nebyla domena nalezena v aktualnim top 1000 zdroji.</div>
              ) : (
                <div className="rounded-md border border-border overflow-hidden">
                  <div className="max-h-[70vh] overflow-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-muted/50 text-muted-foreground">
                        <tr>
                          <th className="text-left px-3 py-2 font-medium">Rank CZ</th>
                          <th className="text-left px-3 py-2 font-medium">Domena</th>
                          <th className="text-left px-3 py-2 font-medium">Global Rank</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredTopModel.map((row) => (
                            <tr key={`${row.domain}-${row.rank}`} className="border-t border-border/60">
                              <td className="px-3 py-2">{row.rank}</td>
                              <td className="px-3 py-2 font-medium">{row.domain}</td>
                              <td className="px-3 py-2 text-muted-foreground">{row.globalRank ?? 'Neuvedeno'}</td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <History className="size-4 text-primary" />
                  Historie zadavani
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <Button variant="outline" onClick={loadHistory} disabled={loadingHistory}>
                    {loadingHistory ? 'Nacitam historii...' : 'Obnovit historii'}
                  </Button>
                  <Badge className="bg-green-600 text-white hover:bg-green-600">
                    Volne: {history.filter((h) => h.status === 'available').length}
                  </Badge>
                  <Badge className="bg-red-600 text-white hover:bg-red-600">
                    Zabrane: {history.filter((h) => h.status === 'taken').length}
                  </Badge>
                </div>
                {historyError && <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{historyError}</div>}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Volne domeny</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border border-border overflow-hidden">
                  <div className="max-h-72 overflow-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-muted/50 text-muted-foreground">
                        <tr>
                          <th className="text-left px-3 py-2 font-medium">Domena</th>
                          <th className="text-left px-3 py-2 font-medium">Kontrola</th>
                        </tr>
                      </thead>
                      <tbody>
                        {history.filter((row) => row.status === 'available').map((row) => (
                          <tr key={row.id} className="border-t border-border/60">
                            <td className="px-3 py-2 font-medium">{row.domain}</td>
                            <td className="px-3 py-2 text-muted-foreground">{formatCheckedAt(row.checkedAt)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Zabrane domeny</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border border-border overflow-hidden">
                  <div className="max-h-72 overflow-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-muted/50 text-muted-foreground">
                        <tr>
                          <th className="text-left px-3 py-2 font-medium">Domena</th>
                          <th className="text-left px-3 py-2 font-medium">Vlastnik</th>
                          <th className="text-left px-3 py-2 font-medium">Exspirace</th>
                          <th className="text-left px-3 py-2 font-medium">Kontrola</th>
                        </tr>
                      </thead>
                      <tbody>
                        {history.filter((row) => row.status === 'taken').map((row) => (
                          <tr key={row.id} className="border-t border-border/60">
                            <td className="px-3 py-2 font-medium">{row.domain}</td>
                            <td className="px-3 py-2 text-muted-foreground">{row.owner || 'Neuvedeno'}</td>
                            <td className="px-3 py-2 text-muted-foreground">{formatExpiry(row.expiresAt)}</td>
                            <td className="px-3 py-2 text-muted-foreground">{formatCheckedAt(row.checkedAt)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
