import { useEffect, useMemo, useState } from 'react';
import { Eye, TrendingUp, UserPlus, Users } from 'lucide-react';
import { fetchProjectsDashboard } from '@/crm/services/backend';
import { logFrontendError } from '@/crm/services/frontend-logger';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type Range = '7d' | '30d' | '90d';

type ProjectRow = {
  project: { id: string; key: string; name: string };
  totals: { pageviews: number; sessions: number; visitors: number; registrations: number };
};

function useProjectsRows(range: Range = '30d') {
  const [rows, setRows] = useState<ProjectRow[]>([]);
  useEffect(() => {
    fetchProjectsDashboard(range)
      .then((d) => setRows(Array.isArray(d) ? (d as ProjectRow[]) : []))
      .catch((error) => {
        logFrontendError({
          area: 'store-dashboard-projects-widgets',
          message: error instanceof Error ? error.message : 'Failed to load projects widgets data',
          meta: { range, operation: 'fetch_projects_dashboard' },
        });
        setRows([]);
      });
  }, [range]);
  return rows;
}

export function ProjectsKpiWidget() {
  const rows = useProjectsRows('30d');
  const totals = useMemo(
    () =>
      rows.reduce(
        (acc, r) => ({
          pageviews: acc.pageviews + r.totals.pageviews,
          visitors: acc.visitors + r.totals.visitors,
          registrations: acc.registrations + r.totals.registrations,
        }),
        { pageviews: 0, visitors: 0, registrations: 0 },
      ),
    [rows],
  );
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">Projekty - KPI</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-3 gap-2 text-sm">
        <div className="rounded-md bg-muted/50 p-2"><Eye className="size-4 mb-1" />{totals.pageviews.toLocaleString('cs-CZ')}</div>
        <div className="rounded-md bg-muted/50 p-2"><Users className="size-4 mb-1" />{totals.visitors.toLocaleString('cs-CZ')}</div>
        <div className="rounded-md bg-muted/50 p-2"><UserPlus className="size-4 mb-1" />{totals.registrations.toLocaleString('cs-CZ')}</div>
      </CardContent>
    </Card>
  );
}

export function ProjectsTopWidget() {
  const rows = useProjectsRows('30d');
  const top = useMemo(() => [...rows].sort((a, b) => b.totals.pageviews - a.totals.pageviews).slice(0, 5), [rows]);
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">Top projekty</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {top.length === 0 ? (
          <div className="text-sm text-muted-foreground">Žádná data.</div>
        ) : (
          top.map((r) => (
            <div key={r.project.id} className="flex items-center justify-between text-sm border rounded-md px-2 py-1.5">
              <span className="truncate">{r.project.name}</span>
              <span className="font-medium">{r.totals.pageviews.toLocaleString('cs-CZ')}</span>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}

export function ProjectsGrowthWidget() {
  const rows = useProjectsRows('7d');
  const value = useMemo(() => rows.reduce((s, r) => s + r.totals.sessions, 0), [rows]);
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2"><TrendingUp className="size-4" /> Aktivita relací (7 dní)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-semibold">{value.toLocaleString('cs-CZ')}</div>
      </CardContent>
    </Card>
  );
}
