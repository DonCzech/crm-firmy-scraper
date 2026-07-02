import { useEffect, useMemo, useState } from 'react';
import { ArrowDownCircle, ArrowUpCircle, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { fetchProblemDomainImportRuns, fetchProblemDomainsDashboard, syncProblemDomains, type ProblemDomainRow } from '@/crm/services/backend';
import { ProblemDomainsModuleNav } from './module-nav';

function scoreBadge(score?: number | null) {
  if (score == null) return <Badge variant="outline">n/a</Badge>;
  if (score <= 2.5) return <Badge variant="destructive">{score.toFixed(1)}</Badge>;
  if (score <= 3.5) return <Badge variant="secondary">{score.toFixed(1)}</Badge>;
  return <Badge variant="default">{score.toFixed(1)}</Badge>;
}

export function ProblemDomainsDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<{ total: number; done: number; status: string } | null>(null);

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetchProblemDomainsDashboard();
      setData(res);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Nepodařilo se načíst dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const latestSyncLabel = useMemo(() => {
    const run = data?.latestSync;
    if (!run?.startedAt) return 'Žádná synchronizace';
    const started = new Date(run.startedAt).toLocaleString('cs-CZ');
    const status = run.status || 'unknown';
    return `${started} (${status})`;
  }, [data]);

  const runSync = async () => {
    const updateProgress = async () => {
      try {
        const runs = await fetchProblemDomainImportRuns(1, 10);
        const active = (runs.data || []).find((r: any) => r.status === 'running') || (runs.data || [])[0];
        if (!active) return;
        const done = Number(active.syncedCount || 0) + Number(active.skippedCount || 0) + Number(active.errorCount || 0);
        const total = Number(active.totalDomains || 0);
        setProgress({ total, done, status: active.status || 'running' });
      } catch {
        // ignore progress polling errors
      }
    };

    try {
      setSyncing(true);
      setProgress({ total: 0, done: 0, status: 'running' });
      await updateProgress();
      const timer = window.setInterval(() => {
        void updateProgress();
      }, 1500);
      try {
        await syncProblemDomains({ onlyPending: false, limit: 5000 });
      } finally {
        window.clearInterval(timer);
      }
      await updateProgress();
      await load();
    } finally {
      setSyncing(false);
      setTimeout(() => setProgress(null), 4000);
    }
  };

  const kpi = data?.kpi || {};

  return (
    <div className="container-fluid space-y-5 lg:space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-xl font-bold">Problémové domény</h1>
          <p className="text-sm text-muted-foreground">Modul analytiky rizikových domén a Trustpilot metrik.</p>
        </div>
        <Button className="gap-2" onClick={runSync} disabled={syncing}>
          <RefreshCw className={syncing ? 'h-4 w-4 animate-spin' : 'h-4 w-4'} />
          Nahrát / aktualizovat data
        </Button>
      </div>

      <ProblemDomainsModuleNav />

      {error ? (
        <Card>
          <CardContent className="py-6 text-sm text-destructive">{error}</CardContent>
        </Card>
      ) : null}

      {syncing && progress ? (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Průběh aktualizace dat</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="h-2 w-full overflow-hidden rounded bg-muted">
              <div
                className="h-full bg-primary transition-all"
                style={{ width: `${progress.total > 0 ? Math.min(100, Math.round((progress.done / progress.total) * 100)) : 12}%` }}
              />
            </div>
            <div className="text-xs text-muted-foreground">
              {progress.total > 0 ? `${progress.done} / ${progress.total}` : `${progress.done} zpracováno`} | status: {progress.status}
            </div>
          </CardContent>
        </Card>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          ['Počet kategorií', kpi.categories],
          ['Počet podkategorií', kpi.subcategories],
          ['Počet evidovaných domén', kpi.domains],
          ['Aktivně trackované domény', kpi.trackedDomains],
          ['Domény s Trustpilot daty', kpi.domainsWithTrustpilot],
          ['Domény bez aktualizace', kpi.domainsWithoutRecentUpdate],
          ['Domény s velmi nízkým skóre', kpi.domainsVeryLowScore],
          ['Poslední synchronizace', latestSyncLabel],
        ].map(([label, value]) => (
          <Card key={String(label)}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
            </CardHeader>
            <CardContent className="text-2xl font-semibold">{loading ? '…' : (value as any) ?? '0'}</CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Top 10 nejhorších domén celkově</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {(data?.widgets?.top10GlobalWorst || []).slice(0, 10).map((row: ProblemDomainRow, idx: number) => (
              <div key={row.id} className="flex items-center justify-between rounded-md border px-3 py-2 text-sm">
                <div className="truncate">
                  <span className="mr-2 text-muted-foreground">#{idx + 1}</span>
                  {row.domain}
                </div>
                <div className="flex items-center gap-2">
                  {scoreBadge(row.trustScore)}
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-red-600"><ArrowDownCircle className="h-3.5 w-3.5" />{row.negativeReviewsCount ?? 0}</span>
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-green-600"><ArrowUpCircle className="h-3.5 w-3.5" />{Math.max(0, Number(row.reviewCountTotal ?? 0) - Number(row.negativeReviewsCount ?? 0))}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top 10 kategorií dle nejhoršího průměru</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {(data?.widgets?.top10CategoriesWorstAvg || []).slice(0, 10).map((row: any, idx: number) => (
              <div key={row.id} className="flex items-center justify-between rounded-md border px-3 py-2 text-sm">
                <div className="truncate">
                  <span className="mr-2 text-muted-foreground">#{idx + 1}</span>
                  {row.name}
                </div>
                <div className="flex items-center gap-2">
                  {scoreBadge(row.avgTrustScore)}
                  <span className="text-xs text-muted-foreground">domén: {row.domainCount}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
