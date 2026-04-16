import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Globe, TrendingUp, Users, Eye, ExternalLink, ArrowUpRight,
  ArrowDownRight, Activity, MousePointerClick, AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { fetchGaDashboard, fetchGaRealtime, type GaRealtimeEntry } from '@/crm/services/backend';
import { logFrontendError } from '@/crm/services/frontend-logger';

// ─── Types ────────────────────────────────────────────────────────────────────

interface GaProperty {
  slug: string;
  name: string;
  url: string;
  color: string;
  configured: boolean;
  measurementId: string;
  totals: {
    pageviews: number;
    visitors: number;
    sessions: number;
    newUsers: number;
    bounceRate: number;
    avgSessionDuration: number;
  } | null;
  chart: { date: string; pageviews: number; visitors: number }[];
}

const RANGES = [
  { value: '7d', label: '7 dní' },
  { value: '30d', label: '30 dní' },
  { value: '90d', label: '90 dní' },
];

// ─── Sparkline ────────────────────────────────────────────────────────────────

function Sparkline({ data, color = '#6366f1' }: { data: number[]; color?: string }) {
  if (!data.length) return <div className="h-10 flex items-center justify-center text-xs text-muted-foreground">—</div>;
  const max = Math.max(...data, 1);
  const w = 120, h = 36, pad = 2;
  const pts = data.map((v, i) => {
    const x = pad + (i / Math.max(data.length - 1, 1)) * (w - pad * 2);
    const y = h - pad - ((v / max) * (h - pad * 2));
    return [x, y] as [number, number];
  });
  const polyline = pts.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
  const area = [
    `M ${pts[0][0]},${h - pad}`,
    ...pts.map(([x, y]) => `L ${x},${y}`),
    `L ${pts[pts.length - 1][0]},${h - pad}`,
    'Z',
  ].join(' ');
  const gid = `g${color.replace(/[^a-z0-9]/gi, '')}`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-10" preserveAspectRatio="none">
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.2" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${gid})`} />
      <polyline points={polyline} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

// ─── Duration formatter ───────────────────────────────────────────────────────

function fmtDur(secs: number): string {
  if (!secs) return '0s';
  if (secs < 60) return `${secs}s`;
  const m = Math.floor(secs / 60), s = secs % 60;
  return s > 0 ? `${m}m ${s}s` : `${m}m`;
}

// ─── Project card ─────────────────────────────────────────────────────────────

function ProjectCard({ p, liveUsers }: { p: GaProperty; liveUsers: number }) {
  const sparkData = p.chart.map(c => c.pageviews);
  const half = Math.floor(sparkData.length / 2);
  const prev = sparkData.slice(0, half).reduce((a, b) => a + b, 0);
  const curr = sparkData.slice(half).reduce((a, b) => a + b, 0);
  const trend = prev === 0 ? null : Math.round(((curr - prev) / prev) * 100);

  return (
    <Card className="hover:shadow-md transition-shadow flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center text-white shrink-0"
              style={{ backgroundColor: p.color }}
            >
              <Globe size={16} />
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-sm leading-tight">{p.name}</h3>
              <a
                href={p.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-0.5"
              >
                {p.url.replace(/^https?:\/\//, '')}
                <ExternalLink size={10} />
              </a>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {liveUsers > 0 && (
              <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                {liveUsers} živě
              </span>
            )}
            {trend !== null && (
              <span className={`text-xs font-medium flex items-center gap-0.5 ${trend >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                {trend >= 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                {Math.abs(trend)}%
              </span>
            )}
            {!p.configured && (
              <Badge variant="secondary" className="text-xs">Nekonfigurováno</Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col gap-3">
        {/* Sparkline */}
        <Sparkline data={sparkData} color={p.color} />

        {/* Metrics */}
        {p.totals ? (
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
            <div>
              <p className="text-muted-foreground flex items-center gap-1"><Eye size={11} /> Zobrazení</p>
              <p className="font-semibold text-sm">{p.totals.pageviews.toLocaleString('cs-CZ')}</p>
            </div>
            <div>
              <p className="text-muted-foreground flex items-center gap-1"><Users size={11} /> Uživatelé</p>
              <p className="font-semibold text-sm">{p.totals.visitors.toLocaleString('cs-CZ')}</p>
            </div>
            <div>
              <p className="text-muted-foreground flex items-center gap-1"><Activity size={11} /> Relace</p>
              <p className="font-semibold text-sm">{p.totals.sessions.toLocaleString('cs-CZ')}</p>
            </div>
            <div>
              <p className="text-muted-foreground flex items-center gap-1"><TrendingUp size={11} /> Noví uživatelé</p>
              <p className="font-semibold text-sm">{p.totals.newUsers.toLocaleString('cs-CZ')}</p>
            </div>
            <div>
              <p className="text-muted-foreground flex items-center gap-1"><MousePointerClick size={11} /> Bounce rate</p>
              <p className="font-semibold text-sm">{p.totals.bounceRate}%</p>
            </div>
            <div>
              <p className="text-muted-foreground">Ø trvání relace</p>
              <p className="font-semibold text-sm">{fmtDur(p.totals.avgSessionDuration)}</p>
            </div>
          </div>
        ) : p.configured ? (
          <p className="text-xs text-muted-foreground py-2">Načítám data…</p>
        ) : (
          <div className="flex items-center gap-1.5 text-xs text-amber-600 py-2">
            <AlertCircle size={13} />
            Doplňte numerické Property ID do GA_PROPERTY_IDS
          </div>
        )}

        <Link
          to={`/core/projects/${p.slug}`}
          className="block w-full text-center text-xs font-medium py-1.5 rounded-md bg-secondary hover:bg-secondary/80 transition-colors mt-auto"
        >
          Zobrazit detail →
        </Link>
      </CardContent>
    </Card>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function ProjectsPage() {
  const reqRef = useRef(0);
  const [data, setData] = useState<GaProperty[]>([]);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState('30d');
  const [realtime, setRealtime] = useState<GaRealtimeEntry[]>([]);

  useEffect(() => {
    function loadRealtime() {
      fetchGaRealtime()
        .then(d => { setRealtime(d); console.log('[realtime]', d); })
        .catch(e => { console.error('[realtime error]', e); });
    }
    loadRealtime();
    const interval = setInterval(loadRealtime, 30_000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const id = ++reqRef.current;
    setLoading(true);
    fetchGaDashboard(range)
      .then(d => {
        if (id !== reqRef.current) return;
        setData(Array.isArray(d) ? (d as GaProperty[]) : []);
      })
      .catch(err => {
        if (id !== reqRef.current) return;
        logFrontendError({ area: 'ga-projects-page', message: err instanceof Error ? err.message : 'Failed to load GA dashboard', meta: { range } });
        toast.error('Nepodařilo se načíst data z Google Analytics');
      })
      .finally(() => { if (id === reqRef.current) setLoading(false); });
  }, [range]);

  const totalViews = data.reduce((s, d) => s + (d.totals?.pageviews || 0), 0);
  const totalVisitors = data.reduce((s, d) => s + (d.totals?.visitors || 0), 0);
  const configured = data.filter(d => d.configured).length;

  return (
    <div className="flex flex-col min-h-full">
      {/* Header */}
      <div className="bg-background flex items-center justify-between border-b px-8 h-14 shrink-0">
        <div className="flex items-center gap-3">
          <h1 className="font-semibold text-base">Google Analytics</h1>
          <Badge variant="secondary">{data.length} domén</Badge>
          {configured < data.length && (
            <Badge variant="outline" className="text-amber-600 border-amber-300">{data.length - configured} bez ID</Badge>
          )}
          {!loading && totalViews > 0 && (
            <span className="text-xs text-muted-foreground">
              {totalViews.toLocaleString('cs-CZ')} zobrazení · {totalVisitors.toLocaleString('cs-CZ')} uživatelů
            </span>
          )}
          {realtime.length > 0 && (() => {
            const total = realtime.reduce((s, r) => s + r.activeUsers, 0);
            if (total === 0) return null;
            return (
              <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                {total} živě
              </span>
            );
          })()}
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            {RANGES.map(r => (
              <button
                key={r.value}
                onClick={() => setRange(r.value)}
                className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                  range === r.value
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-8 space-y-6">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 14 }).map((_, i) => (
              <div key={i} className="h-64 rounded-lg bg-muted animate-pulse" />
            ))}
          </div>
        ) : data.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <p>Žádná data. Zkontrolujte GA_SERVICE_ACCOUNT_KEY a GA_PROPERTY_IDS v prostředí serveru.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {data.map(p => (
              <ProjectCard key={p.slug} p={p} liveUsers={realtime.find(r => r.slug === p.slug)?.activeUsers ?? 0} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
