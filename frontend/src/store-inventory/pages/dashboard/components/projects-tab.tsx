import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Eye, Users, TrendingUp, UserPlus, Globe, Home, BarChart2,
  ArrowUpRight, ArrowDownRight, ExternalLink,
} from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { fetchProjectsDashboard } from '@/crm/services/backend';
import { logFrontendError } from '@/crm/services/frontend-logger';

type Range = '7d' | '30d' | '90d';

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
}

interface ProjectRow {
  project: Project;
  totals: { pageviews: number; sessions: number; visitors: number; registrations: number };
  metrics: DayMetric[];
}

const PROJECT_ICONS: Record<string, typeof Globe> = {
  'online-odhad': Globe,
  'bezrealitky': Home,
  'iqboost': BarChart2,
};
const PROJECT_COLORS: Record<string, string> = {
  'online-odhad': '#3b82f6',
  'bezrealitky': '#10b981',
  'iqboost': '#a855f7',
};

function Sparkline({ data }: { data: number[] }) {
  const max = Math.max(...data, 1);
  if (!data.length) return <div className="h-10 text-xs text-muted-foreground flex items-center">žádná data</div>;
  return (
    <div className="flex items-end gap-0.5 h-10">
      {data.map((v, i) => (
        <div
          key={i}
          className="flex-1 rounded-sm bg-primary/50 hover:bg-primary/80 transition-colors"
          style={{ height: `${Math.max(2, Math.round((v / max) * 40))}px` }}
        />
      ))}
    </div>
  );
}

function TrendBadge({ current, previous }: { current: number; previous: number }) {
  if (!previous) return null;
  const diff = ((current - previous) / previous) * 100;
  const up = diff >= 0;
  return (
    <span className={`inline-flex items-center gap-0.5 text-xs font-medium ${up ? 'text-emerald-600' : 'text-red-500'}`}>
      {up ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
      {Math.abs(diff).toFixed(1)}%
    </span>
  );
}

export function ProjectsTab() {
  const [range, setRange] = useState<Range>('7d');
  const [rows, setRows] = useState<ProjectRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchProjectsDashboard(range)
      .then(data => setRows(Array.isArray(data) ? data as ProjectRow[] : []))
      .catch((error) => {
        logFrontendError({
          area: 'store-dashboard-projects-tab',
          message: error instanceof Error ? error.message : 'Failed to load projects tab data',
          meta: { range, operation: 'fetch_projects_dashboard' },
        });
        toast.error('Nepodařilo se načíst data projektů');
      })
      .finally(() => setLoading(false));
  }, [range]);

  const globalTotals = rows.reduce(
    (acc, r) => ({
      pageviews: acc.pageviews + r.totals.pageviews,
      visitors: acc.visitors + r.totals.visitors,
      sessions: acc.sessions + r.totals.sessions,
      registrations: acc.registrations + r.totals.registrations,
    }),
    { pageviews: 0, visitors: 0, sessions: 0, registrations: 0 },
  );

  return (
    <div className="grid gap-5 lg:gap-7.5">

      {/* Header row */}
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold">Přehled projektů</h2>
        <div className="flex items-center gap-2">
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
          <Link to="/core/projects/dashboard" className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
            Celá nástěnka <ExternalLink size={11} />
          </Link>
        </div>
      </div>

      {/* Global KPI */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-5">
        {[
          { label: 'Zobrazení celkem', value: globalTotals.pageviews, icon: Eye, color: 'text-blue-500 bg-blue-50 dark:bg-blue-950' },
          { label: 'Návštěvníci', value: globalTotals.visitors, icon: Users, color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950' },
          { label: 'Relace', value: globalTotals.sessions, icon: TrendingUp, color: 'text-violet-500 bg-violet-50 dark:bg-violet-950' },
          { label: 'Registrace', value: globalTotals.registrations, icon: UserPlus, color: 'text-amber-500 bg-amber-50 dark:bg-amber-950' },
        ].map(({ label, value, icon: Icon, color }) => (
          <Card key={label}>
            <CardContent className="pt-5 pb-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-muted-foreground text-xs mb-1">{label}</p>
                  <p className="text-2xl font-bold tracking-tight">
                    {loading ? <span className="inline-block w-12 h-6 bg-muted animate-pulse rounded" /> : value.toLocaleString('cs-CZ')}
                  </p>
                </div>
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${color}`}>
                  <Icon size={16} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Per-project grid */}
      <div className="grid lg:grid-cols-3 gap-5 lg:gap-7.5">
        {loading
          ? [1, 2, 3].map(i => <div key={i} className="h-52 rounded-xl bg-muted animate-pulse" />)
          : rows.length === 0
          ? (
            <Card className="col-span-3">
              <CardContent className="py-12 text-center text-muted-foreground text-sm">
                Žádná data pro zvolené období. Zkontrolujte, zda jsou projekty nasazeny s tracking snippetem.
              </CardContent>
            </Card>
          )
          : rows.map(({ project, totals, metrics }) => {
              const Icon = PROJECT_ICONS[project.key] || Globe;
              const color = project.color || PROJECT_COLORS[project.key] || '#6366f1';
              const sparkData = metrics.map(m => m.pageviews);
              const half = Math.floor(metrics.length / 2);
              const prev = metrics.slice(0, half).reduce((s, m) => s + m.pageviews, 0);
              const curr = metrics.slice(half).reduce((s, m) => s + m.pageviews, 0);

              return (
                <Card key={project.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-white shrink-0"
                          style={{ backgroundColor: color }}
                        >
                          <Icon size={15} />
                        </div>
                        <div>
                          <p className="font-semibold text-sm leading-tight">{project.name}</p>
                          {project.url && (
                            <a
                              href={project.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-muted-foreground hover:text-foreground"
                            >
                              {project.url.replace(/^https?:\/\/(www\.)?/, '')}
                            </a>
                          )}
                        </div>
                      </div>
                      <TrendBadge current={curr} previous={prev} />
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-xs">
                      <div>
                        <p className="text-muted-foreground">Zobrazení</p>
                        <p className="font-semibold text-sm">{totals.pageviews.toLocaleString('cs-CZ')}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Návštěvníci</p>
                        <p className="font-semibold text-sm">{totals.visitors.toLocaleString('cs-CZ')}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Relace</p>
                        <p className="font-semibold text-sm">{totals.sessions.toLocaleString('cs-CZ')}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Registrace</p>
                        <p className="font-semibold text-sm text-emerald-600">{totals.registrations.toLocaleString('cs-CZ')}</p>
                      </div>
                    </div>
                    <Sparkline data={sparkData} />
                    <Link
                      to={`/core/projects/${project.key}`}
                      className="block w-full text-center text-xs font-medium py-1.5 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors"
                    >
                      Detail projektu →
                    </Link>
                  </CardContent>
                </Card>
              );
            })
        }
      </div>

    </div>
  );
}
