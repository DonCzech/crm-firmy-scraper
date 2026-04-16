import { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft, Eye, Users, Activity, TrendingUp, Globe,
  Monitor, Smartphone, Tablet, ArrowUpRight, ArrowDownRight,
  MousePointerClick, Clock, ExternalLink, BarChart2, LayoutList,
} from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { fetchGaAnalytics } from '@/crm/services/backend';
import { logFrontendError } from '@/crm/services/frontend-logger';

// ─── Types ────────────────────────────────────────────────────────────────────

interface GaTotals {
  pageviews: number;       prevPageviews: number;       changePageviews: number | null;
  visitors: number;        prevVisitors: number;        changeVisitors: number | null;
  sessions: number;        prevSessions: number;        changeSessions: number | null;
  newUsers: number;        prevNewUsers: number;        changeNewUsers: number | null;
  bounceRate: number;      prevBounceRate: number;      changeBounceRate: number | null;
  avgSessionDuration: number; prevAvgSessionDuration: number; changeAvgSessionDuration: number | null;
}

interface GaRow { name: string; visitors: number; pct: number; sessions?: number; pageviews?: number; }
interface GaPage { path: string; views: number; visitors: number; avgDuration: number; pct: number; }
interface GaChartPoint { date: string; pageviews: number; visitors: number; sessions: number; }

interface GaAnalytics {
  slug: string;
  name: string;
  url: string;
  color: string;
  configured: boolean;
  period: { from: string; to: string; label: string } | null;
  totals: GaTotals | null;
  chart: GaChartPoint[];
  channels: (GaRow & { sessions: number; pageviews: number })[];
  countries: GaRow[];
  cities: GaRow[];
  devices: GaRow[];
  browsers: GaRow[];
  oses: GaRow[];
  pages: GaPage[];
}

// ─── Period presets ───────────────────────────────────────────────────────────

const PERIODS = [
  { value: 'today', label: 'Dnes' },
  { value: 'yesterday', label: 'Včera' },
  { value: 'thisweek', label: 'Tento týden' },
  { value: 'lastweek', label: 'Min. týden' },
  { value: '7d', label: '7 dní' },
  { value: '30d', label: '30 dní' },
  { value: 'thismonth', label: 'Tento měsíc' },
  { value: 'lastmonth', label: 'Min. měsíc' },
  { value: '90d', label: '90 dní' },
  { value: '6m', label: '6 měsíců' },
  { value: '1y', label: '1 rok' },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtDur(secs: number): string {
  if (!secs) return '0s';
  if (secs < 60) return `${secs}s`;
  const m = Math.floor(secs / 60), s = secs % 60;
  return s > 0 ? `${m}m ${s}s` : `${m}m`;
}

function fmtLabel(iso: string): string {
  return new Date(iso + 'T00:00:00Z').toLocaleDateString('cs-CZ', { day: '2-digit', month: '2-digit', timeZone: 'UTC' });
}

function DeviceIcon({ name }: { name: string }) {
  const n = name.toLowerCase();
  if (n === 'mobile') return <Smartphone size={13} className="shrink-0" />;
  if (n === 'tablet') return <Tablet size={13} className="shrink-0" />;
  return <Monitor size={13} className="shrink-0" />;
}

// ─── KPI tile ─────────────────────────────────────────────────────────────────

function KpiTile({
  label, value, prev, change, fmt, icon: Icon, invertColor,
}: {
  label: string; value: number; prev: number; change: number | null;
  fmt?: (v: number) => string; icon: typeof Eye; invertColor?: boolean;
}) {
  const f = fmt || ((v: number) => v.toLocaleString('cs-CZ'));
  const up = change !== null && change > 0;
  const dn = change !== null && change < 0;
  const col = invertColor
    ? (up ? 'text-red-500' : dn ? 'text-emerald-500' : 'text-muted-foreground')
    : (up ? 'text-emerald-500' : dn ? 'text-red-500' : 'text-muted-foreground');

  return (
    <Card>
      <CardContent className="pt-4 pb-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <p className="text-muted-foreground text-xs mb-1.5 truncate">{label}</p>
            <p className="text-2xl font-bold leading-none">{f(value)}</p>
            <div className="flex items-center gap-1.5 mt-1.5 min-h-4">
              {change !== null ? (
                <>
                  <span className={`flex items-center gap-0.5 text-xs font-medium ${col}`}>
                    {up ? <ArrowUpRight size={12} /> : dn ? <ArrowDownRight size={12} /> : null}
                    {change > 0 ? '+' : ''}{change}%
                  </span>
                  <span className="text-xs text-muted-foreground">vs {f(prev)}</span>
                </>
              ) : (
                <span className="text-xs text-muted-foreground">vs {f(prev)}</span>
              )}
            </div>
          </div>
          <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
            <Icon size={15} className="text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Bar chart ────────────────────────────────────────────────────────────────

function BarChart({ data, metric }: {
  data: GaChartPoint[];
  metric: 'pageviews' | 'visitors';
}) {
  if (!data.length) return null;
  const max = Math.max(...data.map(d => d[metric]), 1);
  const showEvery = data.length > 20 ? Math.ceil(data.length / 10) : 1;

  return (
    <div className="flex items-end gap-px h-20">
      {data.map((d, i) => {
        const h = Math.max(2, Math.round((d[metric] / max) * 80));
        return (
          <div key={d.date} className="flex-1 group relative">
            <div
              className="w-full bg-primary/70 rounded-sm group-hover:bg-primary transition-colors cursor-default"
              style={{ height: `${h}px` }}
            />
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:flex
              flex-col items-center pointer-events-none z-10">
              <div className="bg-foreground text-background text-xs rounded px-2 py-1 whitespace-nowrap">
                {fmtLabel(d.date)}: {d[metric].toLocaleString('cs-CZ')}
              </div>
            </div>
            {i % showEvery === 0 && (
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 text-[9px] text-muted-foreground whitespace-nowrap hidden sm:block">
                {fmtLabel(d.date)}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Breakdown table ──────────────────────────────────────────────────────────

function BreakdownTable({ rows, label, showDevice }: {
  rows: GaRow[];
  label: string;
  showDevice?: boolean;
}) {
  if (!rows.length) return <p className="text-xs text-muted-foreground py-2">Žádná data.</p>;
  const maxVal = rows[0]?.visitors || 1;
  return (
    <div>
      <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">{label}</p>
      <div className="space-y-1">
        {rows.slice(0, 10).map((row, i) => (
          <div key={i} className="relative flex items-center gap-2 text-xs py-1 px-2 rounded group hover:bg-muted/40">
            <div className="absolute inset-0 bg-primary/6 rounded" style={{ width: `${Math.round((row.visitors / maxVal) * 100)}%` }} />
            {showDevice && (
              <span className="relative text-muted-foreground"><DeviceIcon name={row.name} /></span>
            )}
            <span className="relative flex-1 truncate font-medium">{row.name}</span>
            <span className="relative text-muted-foreground w-12 text-right">{row.visitors.toLocaleString('cs-CZ')}</span>
            <span className="relative text-muted-foreground w-8 text-right">{row.pct}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Channel table ────────────────────────────────────────────────────────────

function ChannelTable({ channels }: { channels: GaAnalytics['channels'] }) {
  if (!channels.length) return <p className="text-xs text-muted-foreground py-2">Žádná data.</p>;
  const maxVal = channels[0]?.visitors || 1;
  return (
    <div className="space-y-1">
      {channels.map((ch, i) => (
        <div key={i} className="relative text-xs py-1 px-2 rounded hover:bg-muted/40">
          <div className="absolute inset-0 bg-primary/6 rounded" style={{ width: `${Math.round((ch.visitors / maxVal) * 100)}%` }} />
          <div className="relative flex items-center gap-2">
            <span className="flex-1 truncate font-medium">{ch.name}</span>
            <span className="text-muted-foreground w-16 text-right">{ch.visitors.toLocaleString('cs-CZ')} uj.</span>
            <span className="text-muted-foreground w-14 text-right">{ch.sessions.toLocaleString('cs-CZ')} rel.</span>
            <span className="text-muted-foreground w-8 text-right">{ch.pct}%</span>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Pages table ─────────────────────────────────────────────────────────────

function PagesTable({ pages }: { pages: GaPage[] }) {
  if (!pages.length) return <p className="text-xs text-muted-foreground py-2">Žádná data.</p>;
  const maxViews = pages[0]?.views || 1;
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2 text-xs text-muted-foreground px-2 pb-1 border-b">
        <span className="flex-1">Stránka</span>
        <span className="w-16 text-right">Zobrazení</span>
        <span className="w-16 text-right">Uživatelé</span>
        <span className="w-16 text-right">Ø čas</span>
      </div>
      {pages.map((p, i) => (
        <div key={i} className="relative flex items-center gap-2 text-xs py-1.5 px-2 rounded hover:bg-muted/40">
          <div className="absolute inset-0 bg-primary/5 rounded" style={{ width: `${Math.round((p.views / maxViews) * 100)}%` }} />
          <span className="relative flex-1 truncate font-mono text-xs">{p.path}</span>
          <span className="relative w-16 text-right text-muted-foreground">{p.views.toLocaleString('cs-CZ')}</span>
          <span className="relative w-16 text-right text-muted-foreground">{p.visitors.toLocaleString('cs-CZ')}</span>
          <span className="relative w-16 text-right text-muted-foreground">{fmtDur(p.avgDuration)}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Detail Page ──────────────────────────────────────────────────────────────

export function ProjectDetailPage() {
  const { projectKey: slug } = useParams<{ projectKey: string }>();
  const [period, setPeriod] = useState('30d');
  const [data, setData] = useState<GaAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [chartMetric, setChartMetric] = useState<'pageviews' | 'visitors'>('pageviews');

  const load = useCallback((p: string) => {
    if (!slug) return;
    setLoading(true);
    fetchGaAnalytics(slug, p)
      .then(d => {
        const a = d as any;
        if (a?.totals !== undefined || a?.configured === false) setData(a as GaAnalytics);
        else setData(null);
      })
      .catch(err => {
        logFrontendError({
          area: 'ga-projects-detail',
          message: err instanceof Error ? err.message : 'Failed to load GA analytics',
          meta: { slug, period: p },
        });
        toast.error('Chyba při načítání Google Analytics');
      })
      .finally(() => setLoading(false));
  }, [slug]);

  useEffect(() => { load(period); }, [period, load]);

  const periodSelector = (
    <div className="flex items-center gap-1 flex-wrap">
      {PERIODS.map(p => (
        <button
          key={p.value}
          onClick={() => setPeriod(p.value)}
          className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
            period === p.value
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted'
          }`}
        >
          {p.label}
        </button>
      ))}
    </div>
  );

  if (loading) {
    return (
      <div className="flex flex-col min-h-full">
        <div className="bg-background flex items-center gap-3 border-b px-8 h-14 shrink-0">
          <Link to="/core/projects" className="text-muted-foreground hover:text-foreground"><ArrowLeft size={16} /></Link>
          <div className="h-4 w-32 bg-muted animate-pulse rounded" />
        </div>
        <div className="p-8 space-y-4">
          <div className="flex gap-1">{Array.from({ length: 11 }).map((_, i) => <div key={i} className="h-7 w-16 bg-muted animate-pulse rounded" />)}</div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-24 bg-muted animate-pulse rounded-lg" />)}
          </div>
          <div className="h-40 bg-muted animate-pulse rounded-lg" />
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-48 bg-muted animate-pulse rounded-lg" />)}
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex flex-col min-h-full">
        <div className="bg-background flex items-center gap-3 border-b px-8 h-14 shrink-0">
          <Link to="/core/projects" className="text-muted-foreground hover:text-foreground"><ArrowLeft size={16} /></Link>
          <span className="font-semibold text-base">{slug}</span>
        </div>
        <div className="p-8 text-center py-20 text-muted-foreground">Doména nebyla nalezena.</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-full">
      {/* Header */}
      <div className="bg-background flex items-center justify-between border-b px-8 h-14 shrink-0">
        <div className="flex items-center gap-3">
          <Link to="/core/projects" className="text-muted-foreground hover:text-foreground"><ArrowLeft size={16} /></Link>
          <div
            className="w-7 h-7 rounded-md flex items-center justify-center text-white shrink-0"
            style={{ backgroundColor: data.color }}
          >
            <Globe size={14} />
          </div>
          <h1 className="font-semibold text-base">{data.name}</h1>
          {data.url && (
            <a href={data.url} target="_blank" rel="noopener noreferrer"
              className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-0.5">
              {data.url.replace(/^https?:\/\//, '')} <ExternalLink size={10} />
            </a>
          )}
          {!data.configured && (
            <Badge variant="outline" className="text-amber-600 border-amber-300">Doplňte Property ID</Badge>
          )}
        </div>
        <span className="text-xs text-muted-foreground">Google Analytics 4 · {data.period?.label}</span>
      </div>

      <div className="p-8 space-y-6">

        {/* Period selector */}
        {periodSelector}

        {!data.configured ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              <p className="text-sm">Pro tuto doménu není nastaveno numerické GA4 Property ID.</p>
              <p className="text-xs mt-1">Doplňte ho do env proměnné <code className="bg-muted px-1 rounded">GA_PROPERTY_IDS</code> jako <code className="bg-muted px-1 rounded">"{data.slug}":"123456789"</code></p>
            </CardContent>
          </Card>
        ) : !data.totals ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground text-sm">Žádná data pro zvolené období.</CardContent>
          </Card>
        ) : (
          <>
            {/* KPI grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <KpiTile label="Zobrazení stránek"    value={data.totals.pageviews}          prev={data.totals.prevPageviews}          change={data.totals.changePageviews}          icon={Eye} />
              <KpiTile label="Aktivní uživatelé"    value={data.totals.visitors}           prev={data.totals.prevVisitors}           change={data.totals.changeVisitors}           icon={Users} />
              <KpiTile label="Relace"               value={data.totals.sessions}           prev={data.totals.prevSessions}           change={data.totals.changeSessions}           icon={Activity} />
              <KpiTile label="Noví uživatelé"       value={data.totals.newUsers}           prev={data.totals.prevNewUsers}           change={data.totals.changeNewUsers}           icon={TrendingUp} />
              <KpiTile label="Bounce rate"          value={data.totals.bounceRate}         prev={data.totals.prevBounceRate}         change={data.totals.changeBounceRate}         icon={MousePointerClick} fmt={v => `${v}%`} invertColor />
              <KpiTile label="Ø trvání relace"      value={data.totals.avgSessionDuration} prev={data.totals.prevAvgSessionDuration} change={data.totals.changeAvgSessionDuration} icon={Clock} fmt={fmtDur} />
            </div>

            {/* Chart */}
            <Card>
              <CardHeader className="pb-2 flex-row items-center justify-between">
                <p className="text-sm font-medium">Vývoj návštěvnosti</p>
                <div className="flex gap-1">
                  {(['pageviews', 'visitors'] as const).map(m => (
                    <button
                      key={m}
                      onClick={() => setChartMetric(m)}
                      className={`px-2 py-0.5 rounded text-xs font-medium transition-colors ${
                        chartMetric === m ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'
                      }`}
                    >
                      {m === 'pageviews' ? 'Zobrazení' : 'Uživatelé'}
                    </button>
                  ))}
                </div>
              </CardHeader>
              <CardContent className="pt-2 pb-6">
                {data.chart.length > 0
                  ? <BarChart data={data.chart} metric={chartMetric} />
                  : <p className="text-xs text-muted-foreground py-4 text-center">Žádná data.</p>
                }
              </CardContent>
            </Card>

            {/* Channels + Pages */}
            <div className="grid lg:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    <BarChart2 size={15} className="text-muted-foreground" />
                    <p className="text-sm font-medium">Kanály</p>
                  </div>
                </CardHeader>
                <CardContent>
                  <ChannelTable channels={data.channels} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    <LayoutList size={15} className="text-muted-foreground" />
                    <p className="text-sm font-medium">Top stránky</p>
                  </div>
                </CardHeader>
                <CardContent>
                  <PagesTable pages={data.pages} />
                </CardContent>
              </Card>
            </div>

            {/* Geo + Devices + Browsers + OS */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <p className="text-sm font-medium flex items-center gap-2"><Globe size={14} className="text-muted-foreground" /> Státy</p>
                </CardHeader>
                <CardContent>
                  <BreakdownTable rows={data.countries} label="Uživatelé" />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <p className="text-sm font-medium flex items-center gap-2"><Globe size={14} className="text-muted-foreground" /> Města</p>
                </CardHeader>
                <CardContent>
                  <BreakdownTable rows={data.cities} label="Uživatelé" />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <p className="text-sm font-medium flex items-center gap-2"><Monitor size={14} className="text-muted-foreground" /> Zařízení</p>
                </CardHeader>
                <CardContent>
                  <BreakdownTable rows={data.devices} label="Uživatelé" showDevice />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <p className="text-sm font-medium flex items-center gap-2"><TrendingUp size={14} className="text-muted-foreground" /> Prohlížeče</p>
                </CardHeader>
                <CardContent>
                  <BreakdownTable rows={data.browsers} label="Uživatelé" />
                </CardContent>
              </Card>
            </div>

            {/* OS */}
            <div className="grid md:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <p className="text-sm font-medium">Operační systémy</p>
                </CardHeader>
                <CardContent>
                  <BreakdownTable rows={data.oses} label="Uživatelé" />
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
