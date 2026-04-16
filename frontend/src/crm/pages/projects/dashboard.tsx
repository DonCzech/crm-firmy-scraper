import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Eye, Users, TrendingUp, UserPlus, Globe, Home, BarChart2,
  ArrowUpRight, ArrowDownRight, Monitor, Smartphone, Tablet, ExternalLink,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartTooltip,
  ResponsiveContainer, Legend,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { fetchProjectsDashboard, fetchGaRealtime, type GaRealtimeEntry } from '@/crm/services/backend';
import { logFrontendError } from '@/crm/services/frontend-logger';

type Range = '7d' | '30d' | '90d';
type SortKey = 'pageviews' | 'visitors' | 'sessions' | 'registrations';

interface Project {
  id: string;
  key: string;
  name: string;
  url?: string;
  color?: string;
  isActive: boolean;
}

interface DayMetric {
  date: string;
  pageviews: number;
  visitors: number;
  sessions?: number;
  registrations?: number;
  sourceBreakdown?: string;
  deviceBreakdown?: string;
  browserBreakdown?: string;
  countryBreakdown?: string;
}

interface ProjectRow {
  project: Project;
  totals: { pageviews: number; sessions: number; visitors: number; registrations: number };
  metrics: DayMetric[];
}

type ChartEntry = { date: string; label: string } & Record<string, number | string>;

const PROJECT_COLORS: Record<string, string> = {
  'online-odhad': '#3b82f6',
  'bezrealitky': '#10b981',
  'iqboost': '#8b5cf6',
  'core-ceskypartner': '#f97316',
  'ceskypartner': '#06b6d4',
};

const PROJECT_ICONS: Record<string, typeof Globe> = {
  'online-odhad': Globe,
  'bezrealitky': Home,
  'iqboost': BarChart2,
  'core-ceskypartner': BarChart2,
  'ceskypartner': Globe,
};

const FALLBACK_COLORS = ['#6366f1', '#f59e0b', '#ec4899', '#14b8a6'];

function getColor(project: Project, idx: number): string {
  return project.color || PROJECT_COLORS[project.key] || FALLBACK_COLORS[idx % FALLBACK_COLORS.length];
}

function parseBreakdown(str?: string): Record<string, number> {
  if (!str) return {};
  try { return JSON.parse(str) as Record<string, number>; } catch { return {}; }
}

function aggregateBreakdowns(rows: ProjectRow[], field: keyof DayMetric): Record<string, number> {
  const agg: Record<string, number> = {};
  for (const row of rows) {
    for (const m of row.metrics) {
      const bd = parseBreakdown(m[field] as string | undefined);
      for (const [k, v] of Object.entries(bd)) {
        agg[k] = (agg[k] ?? 0) + v;
      }
    }
  }
  return agg;
}

// SVG sparkline
function SvgSparkline({ data, color }: { data: number[]; color: string }) {
  if (!data.length || data.every(v => v === 0)) {
    return <div className="h-10 flex items-center text-xs text-muted-foreground">—</div>;
  }
  const W = 200, H = 40;
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const rng = max - min || 1;
  const pts = data.map((v, i) => [
    (i / Math.max(data.length - 1, 1)) * W,
    H - 4 - ((v - min) / rng) * (H - 8),
  ]);
  const lineD = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ');
  const areaD = `${lineD} L${W},${H} L0,${H} Z`;
  const gradId = `sg${color.replace(/[^a-z0-9]/gi, '')}`;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-10" preserveAspectRatio="none">
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.3} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      <path d={areaD} fill={`url(#${gradId})`} />
      <path d={lineD} fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Trend({ current, previous }: { current: number; previous: number }) {
  if (!previous) return null;
  const diff = ((current - previous) / previous) * 100;
  const up = diff >= 0;
  return (
    <span className={`flex items-center gap-0.5 text-xs font-semibold ${up ? 'text-emerald-600' : 'text-red-500'}`}>
      {up ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
      {Math.abs(diff).toFixed(1)}%
    </span>
  );
}

function convRate(reg: number, vis: number) {
  return vis > 0 ? ((reg / vis) * 100).toFixed(2) : '0.00';
}

export function ProjectsDashboard() {
  const latestLoadRequestRef = useRef(0);
  const [range, setRange] = useState<Range>('7d');
  const [rows, setRows] = useState<ProjectRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<SortKey>('pageviews');
  const [realtime, setRealtime] = useState<GaRealtimeEntry[]>([]);

  useEffect(() => {
    function loadRealtime() {
      fetchGaRealtime().then(setRealtime).catch(() => {});
    }
    loadRealtime();
    const interval = setInterval(loadRealtime, 30_000);
    return () => clearInterval(interval);
  }, []);

  function load(r: Range) {
    const requestId = latestLoadRequestRef.current + 1;
    latestLoadRequestRef.current = requestId;
    setLoading(true);
    fetchProjectsDashboard(r)
      .then((d) => {
        if (requestId !== latestLoadRequestRef.current) return;
        setRows(Array.isArray(d) ? (d as ProjectRow[]) : []);
      })
      .catch((error) => {
        if (requestId !== latestLoadRequestRef.current) return;
        logFrontendError({
          area: 'crm-projects-dashboard',
          message: error instanceof Error ? error.message : 'Failed to load projects dashboard',
          meta: { range: r, operation: 'fetch_projects_dashboard' },
        });
        toast.error('Nepodařilo se načíst nástěnku');
      })
      .finally(() => {
        if (requestId !== latestLoadRequestRef.current) return;
        setLoading(false);
      });
  }

  useEffect(() => { load(range); }, [range]);

  // Global totals
  const globalTotals = rows.reduce(
    (acc, r) => ({
      pageviews: acc.pageviews + r.totals.pageviews,
      visitors: acc.visitors + r.totals.visitors,
      sessions: acc.sessions + r.totals.sessions,
      registrations: acc.registrations + r.totals.registrations,
    }),
    { pageviews: 0, visitors: 0, sessions: 0, registrations: 0 },
  );

  // Global trend: compare first half vs second half of period
  const firstRow = rows[0];
  const half = firstRow ? Math.floor(firstRow.metrics.length / 2) : 0;
  const globalPrev = rows.reduce((s, r) => s + r.metrics.slice(0, half).reduce((a, m) => a + m.pageviews, 0), 0);
  const globalCurr = rows.reduce((s, r) => s + r.metrics.slice(half).reduce((a, m) => a + m.pageviews, 0), 0);

  // Multi-project comparison chart
  const chartData = useMemo((): ChartEntry[] => {
    if (!rows.length) return [];
    const dateMap = new Map<string, ChartEntry>();
    for (const { project, metrics } of rows) {
      for (const m of metrics) {
        if (!dateMap.has(m.date)) {
          const label = new Date(m.date).toLocaleDateString('cs-CZ', { day: 'numeric', month: 'numeric' });
          dateMap.set(m.date, { date: m.date, label });
        }
        const entry = dateMap.get(m.date)!;
        entry[project.key] = m.pageviews;
      }
    }
    return Array.from(dateMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([, v]) => v);
  }, [rows]);

  // Source breakdown
  const sourceData = useMemo(() => {
    const agg = aggregateBreakdowns(rows, 'sourceBreakdown');
    const total = Object.values(agg).reduce((s, v) => s + v, 0) || 1;
    return Object.entries(agg)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 7)
      .map(([name, value]) => ({ name: name || 'direct', value, pct: Math.round((value / total) * 100) }));
  }, [rows]);

  // Device breakdown
  const deviceData = useMemo(() => {
    const agg = aggregateBreakdowns(rows, 'deviceBreakdown');
    const total = Object.values(agg).reduce((s, v) => s + v, 0) || 1;
    return Object.entries(agg)
      .sort(([, a], [, b]) => b - a)
      .map(([name, value]) => ({ name, value, pct: Math.round((value / total) * 100) }));
  }, [rows]);

  // Browser breakdown
  const browserData = useMemo(() => {
    const agg = aggregateBreakdowns(rows, 'browserBreakdown');
    const total = Object.values(agg).reduce((s, v) => s + v, 0) || 1;
    return Object.entries(agg)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([name, value]) => ({ name, value, pct: Math.round((value / total) * 100) }));
  }, [rows]);

  const sortedRows = [...rows].sort((a, b) => b.totals[sortBy] - a.totals[sortBy]);

  const hasBreakdownData = sourceData.length > 0 || deviceData.length > 0;

  return (
    <div className="flex flex-col min-h-full">
      {/* Header */}
      <div className="bg-background flex items-center justify-between border-b px-8 h-14 shrink-0">
        <div className="flex items-center gap-3">
          <h1 className="font-semibold text-base">Nástěnka projektů</h1>
          {!loading && <Badge variant="secondary">{rows.length} projektů</Badge>}
          {realtime.length > 0 && (() => {
            const total = realtime.reduce((s, r) => s + r.activeUsers, 0);
            return (
              <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-600">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                {total} živě
              </span>
            );
          })()}
        </div>
        <div className="flex gap-1">
          {(['7d', '30d', '90d'] as Range[]).map(r => (
            <Button
              key={r}
              size="sm"
              variant={range === r ? 'default' : 'ghost'}
              className="h-7 text-xs"
              onClick={() => setRange(r)}
            >
              {r === '7d' ? '7 dní' : r === '30d' ? '30 dní' : '90 dní'}
            </Button>
          ))}
        </div>
      </div>

      <div className="p-8 space-y-6">

        {/* KPI tiles */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Celkem zobrazení', value: globalTotals.pageviews, icon: Eye },
            { label: 'Návštěvníci', value: globalTotals.visitors, icon: Users },
            { label: 'Relace', value: globalTotals.sessions, icon: TrendingUp },
            { label: 'Registrace', value: globalTotals.registrations, icon: UserPlus },
          ].map(({ label, value, icon: Icon }) => (
            <Card key={label}>
              <CardContent className="pt-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-muted-foreground text-xs mb-1">{label}</p>
                    <p className="text-2xl font-bold">{loading ? '—' : value.toLocaleString('cs-CZ')}</p>
                    {!loading && <Trend current={globalCurr} previous={globalPrev} />}
                  </div>
                  <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                    <Icon size={16} className="text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Multi-project comparison chart */}
        {!loading && chartData.length > 0 && rows.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Zobrazení stránek – porovnání projektů</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      {rows.map(({ project }, idx) => {
                        const color = getColor(project, idx);
                        return (
                          <linearGradient key={project.key} id={`gc-${project.key}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={color} stopOpacity={0.2} />
                            <stop offset="95%" stopColor={color} stopOpacity={0} />
                          </linearGradient>
                        );
                      })}
                    </defs>
                    <CartesianGrid strokeDasharray="4 4" stroke="var(--border)" vertical={false} />
                    <XAxis
                      dataKey="label"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
                      interval="preserveStartEnd"
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
                      width={35}
                    />
                    <RechartTooltip
                      contentStyle={{
                        background: 'var(--background)',
                        border: '1px solid var(--border)',
                        borderRadius: 8,
                        fontSize: 12,
                      }}
                      formatter={(value: number, key: string) => {
                        const row = rows.find(r => r.project.key === key);
                        return [value.toLocaleString('cs-CZ'), row?.project.name ?? key];
                      }}
                    />
                    <Legend
                      formatter={(value: string) => rows.find(r => r.project.key === value)?.project.name ?? value}
                      iconType="circle"
                      iconSize={8}
                    />
                    {rows.map(({ project }, idx) => {
                      const color = getColor(project, idx);
                      return (
                        <Area
                          key={project.key}
                          type="monotone"
                          dataKey={project.key}
                          stroke={color}
                          fill={`url(#gc-${project.key})`}
                          strokeWidth={2}
                          dot={false}
                          activeDot={{ r: 4, fill: color }}
                        />
                      );
                    })}
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Breakdowns row */}
        {!loading && hasBreakdownData && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

            {/* Traffic sources */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Zdroje provozu</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2.5">
                {sourceData.length === 0 ? (
                  <p className="text-xs text-muted-foreground">Žádná data.</p>
                ) : sourceData.map(({ name, value, pct }) => (
                  <div key={name}>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-medium capitalize truncate max-w-[130px]">{name}</span>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="text-muted-foreground">{value.toLocaleString('cs-CZ')}</span>
                        <span className="font-semibold text-foreground">{pct}%</span>
                      </div>
                    </div>
                    <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                      <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Device breakdown */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Zařízení</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2.5">
                {deviceData.length === 0 ? (
                  <p className="text-xs text-muted-foreground">Žádná data.</p>
                ) : deviceData.map(({ name, value, pct }) => {
                  const DevIcon = name === 'mobile' ? Smartphone : name === 'tablet' ? Tablet : Monitor;
                  const devColor = name === 'mobile' ? '#f59e0b' : name === 'tablet' ? '#8b5cf6' : '#3b82f6';
                  const devLabel = name === 'mobile' ? 'Mobil' : name === 'tablet' ? 'Tablet' : name === 'desktop' ? 'Počítač' : name;
                  return (
                    <div key={name}>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="flex items-center gap-1.5 font-medium">
                          <DevIcon size={12} style={{ color: devColor }} />
                          {devLabel}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <span className="text-muted-foreground">{value.toLocaleString('cs-CZ')}</span>
                          <span className="font-semibold text-foreground">{pct}%</span>
                        </div>
                      </div>
                      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: devColor }} />
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            {/* Browser breakdown */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Prohlížeče</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2.5">
                {browserData.length === 0 ? (
                  <p className="text-xs text-muted-foreground">Žádná data.</p>
                ) : browserData.map(({ name, value, pct }, idx) => {
                  const browserColors = ['#3b82f6', '#f59e0b', '#10b981', '#ec4899', '#6366f1'];
                  const c = browserColors[idx % browserColors.length];
                  return (
                    <div key={name}>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-medium capitalize truncate max-w-[130px]">{name || 'Neznámý'}</span>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className="text-muted-foreground">{value.toLocaleString('cs-CZ')}</span>
                          <span className="font-semibold text-foreground">{pct}%</span>
                        </div>
                      </div>
                      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: c }} />
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

          </div>
        )}

        {/* Per-project cards */}
        {loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => <div key={i} className="h-56 rounded-lg bg-muted animate-pulse" />)}
          </div>
        ) : rows.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              Žádná data pro zvolené období.
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {rows.map(({ project, totals, metrics }, idx) => {
              const Icon = PROJECT_ICONS[project.key] || Globe;
              const color = getColor(project, idx);
              const sparkData = metrics.map(m => m.pageviews);
              const cardHalf = Math.floor(metrics.length / 2);
              const prevPv = metrics.slice(0, cardHalf).reduce((s, m) => s + m.pageviews, 0);
              const currPv = metrics.slice(cardHalf).reduce((s, m) => s + m.pageviews, 0);
              const conv = convRate(totals.registrations, totals.visitors);
              const pagesPer = totals.visitors > 0 ? (totals.pageviews / totals.visitors).toFixed(1) : '—';

              const liveUsers = realtime.find(r => r.slug === project.key)?.activeUsers ?? 0;
              return (
                <Card key={project.id} className="hover:shadow-md transition-shadow overflow-hidden">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 min-w-0">
                        <div
                          className="w-7 h-7 rounded-md flex items-center justify-center text-white shrink-0"
                          style={{ backgroundColor: color }}
                        >
                          <Icon size={14} />
                        </div>
                        <span className="font-medium text-sm truncate">{project.name}</span>
                        {project.url && (
                          <a href={project.url} target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-foreground shrink-0">
                            <ExternalLink size={11} />
                          </a>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        {liveUsers > 0 && (
                          <span className="flex items-center gap-1 text-xs font-medium text-emerald-600">
                            <span className="relative flex h-1.5 w-1.5">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
                            </span>
                            {liveUsers}
                          </span>
                        )}
                        <Badge variant={project.isActive ? 'success' : 'secondary'} appearance="light" size="sm">
                          {project.isActive ? 'Aktivní' : 'Offline'}
                        </Badge>
                        <Trend current={currPv} previous={prevPv} />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 mb-3 text-xs">
                      <div>
                        <p className="text-muted-foreground">Zobrazení</p>
                        <p className="font-semibold text-sm">{totals.pageviews.toLocaleString('cs-CZ')}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Návštěvníci</p>
                        <p className="font-semibold text-sm">{totals.visitors.toLocaleString('cs-CZ')}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Stránek / relaci</p>
                        <p className="font-semibold text-sm">{pagesPer}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Konverze</p>
                        <p className="font-semibold text-sm text-emerald-600">{conv}%</p>
                      </div>
                    </div>

                    <SvgSparkline data={sparkData} color={color} />

                    <div className="flex items-center justify-between mt-3 gap-2">
                      <div className="text-xs text-muted-foreground">
                        <span className="font-medium text-foreground">{totals.registrations}</span> registrací
                      </div>
                      <Link
                        to={`/core/projects/${project.key}`}
                        className="text-xs font-medium px-3 py-1.5 rounded-md bg-secondary hover:bg-secondary/80 transition-colors"
                      >
                        Detail →
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Comparison table */}
        {!loading && rows.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Porovnání projektů</CardTitle>
              <p className="text-xs text-muted-foreground">Kliknutím na záhlaví sloupce seřadíte</p>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-xs text-muted-foreground border-b">
                      <th className="text-left font-medium pb-3 pr-4 min-w-[140px]">Projekt</th>
                      {(
                        [
                          { key: 'pageviews', label: 'Zobrazení' },
                          { key: 'visitors', label: 'Návštěvníci' },
                          { key: 'sessions', label: 'Relace' },
                          { key: 'registrations', label: 'Registrace' },
                        ] as { key: SortKey; label: string }[]
                      ).map(col => (
                        <th
                          key={col.key}
                          className={`text-right font-medium pb-3 px-3 cursor-pointer select-none hover:text-foreground transition-colors ${sortBy === col.key ? 'text-foreground' : ''}`}
                          onClick={() => setSortBy(col.key)}
                        >
                          {col.label}{sortBy === col.key ? ' ↓' : ''}
                        </th>
                      ))}
                      <th className="text-right font-medium pb-3 pl-3 min-w-[90px]">Konverze</th>
                      <th className="text-right font-medium pb-3 pl-3 min-w-[80px]">Trend</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedRows.map(({ project, totals, metrics }) => {
                      const color = getColor(project, rows.findIndex(r => r.project.id === project.id));
                      const conv = convRate(totals.registrations, totals.visitors);
                      const th = Math.floor(metrics.length / 2);
                      const tp = metrics.slice(0, th).reduce((s, m) => s + m.pageviews, 0);
                      const tc = metrics.slice(th).reduce((s, m) => s + m.pageviews, 0);
                      const share = globalTotals.pageviews > 0 ? Math.round((totals.pageviews / globalTotals.pageviews) * 100) : 0;
                      return (
                        <tr key={project.id} className="border-b last:border-0 hover:bg-muted/30">
                          <td className="py-3 pr-4">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: color }} />
                              <Link to={`/core/projects/${project.key}`} className="font-medium hover:underline truncate">
                                {project.name}
                              </Link>
                            </div>
                          </td>
                          <td className="py-3 px-3 text-right">
                            <div className="flex flex-col items-end gap-1">
                              <span className="font-medium">{totals.pageviews.toLocaleString('cs-CZ')}</span>
                              <div className="h-1 w-16 rounded-full bg-muted overflow-hidden">
                                <div className="h-full rounded-full" style={{ width: `${share}%`, backgroundColor: color }} />
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-3 text-right">{totals.visitors.toLocaleString('cs-CZ')}</td>
                          <td className="py-3 px-3 text-right">{totals.sessions.toLocaleString('cs-CZ')}</td>
                          <td className="py-3 px-3 text-right font-medium text-emerald-600">{totals.registrations.toLocaleString('cs-CZ')}</td>
                          <td className="py-3 pl-3 text-right">
                            <Badge variant={parseFloat(conv) > 0 ? 'success' : 'secondary'} appearance="light" size="sm">
                              {conv}%
                            </Badge>
                          </td>
                          <td className="py-3 pl-3 text-right">
                            <Trend current={tc} previous={tp} />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr className="border-t bg-muted/20">
                      <td className="py-2.5 pr-4 text-xs font-semibold text-muted-foreground">Celkem</td>
                      <td className="py-2.5 px-3 text-right font-bold">{globalTotals.pageviews.toLocaleString('cs-CZ')}</td>
                      <td className="py-2.5 px-3 text-right font-bold">{globalTotals.visitors.toLocaleString('cs-CZ')}</td>
                      <td className="py-2.5 px-3 text-right font-bold">{globalTotals.sessions.toLocaleString('cs-CZ')}</td>
                      <td className="py-2.5 px-3 text-right font-bold text-emerald-600">{globalTotals.registrations.toLocaleString('cs-CZ')}</td>
                      <td className="py-2.5 pl-3 text-right">
                        <Badge variant="secondary" size="sm">{convRate(globalTotals.registrations, globalTotals.visitors)}%</Badge>
                      </td>
                      <td className="py-2.5 pl-3 text-right">
                        <Trend current={globalCurr} previous={globalPrev} />
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

      </div>
    </div>
  );
}
