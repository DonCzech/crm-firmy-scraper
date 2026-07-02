import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowDownCircle, ArrowUpCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { fetchProblemDomainsOptions, fetchProblemDomainsRankings, type ProblemDomainRow } from '@/crm/services/backend';
import { ProblemDomainsModuleNav } from './module-nav';

const METRICS = [
  { value: 'worstComposite', label: 'worstComposite' },
  { value: 'worstByTrustScore', label: 'worstByTrustScore' },
  { value: 'worstByNegativeReviewsCount', label: 'worstByNegativeReviewsCount' },
  { value: 'worstByNegativeRatio', label: 'worstByNegativeRatio' },
] as const;

export function ProblemDomainsRankingsPage() {
  const [metric, setMetric] = useState<(typeof METRICS)[number]['value']>('worstByNegativeReviewsCount');
  const [limit, setLimit] = useState('5000');
  const [categoryId, setCategoryId] = useState('all');
  const [subcategoryId, setSubcategoryId] = useState('all');
  const [rows, setRows] = useState<ProblemDomainRow[]>([]);
  const [options, setOptions] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    try {
      setError(null);
      const [opts, ranking] = await Promise.all([
        fetchProblemDomainsOptions(),
        fetchProblemDomainsRankings({
          metric,
          limit: Number(limit),
          categoryId: categoryId === 'all' ? undefined : categoryId,
          subcategoryId: subcategoryId === 'all' ? undefined : subcategoryId,
        }),
      ]);
      setOptions(opts);
      setRows(ranking.rows || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Nepodařilo se načíst žebříčky');
    }
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [metric, limit, categoryId, subcategoryId]);

  return (
    <div className="container-fluid space-y-5 lg:space-y-8">
      <div className="space-y-1">
        <h1 className="text-xl font-bold">Žebříčky</h1>
        <p className="text-sm text-muted-foreground">Top domény podle zvolené ranking metriky (global/category/subcategory).</p>
      </div>

      <ProblemDomainsModuleNav />

      {error ? (
        <Card>
          <CardContent className="py-4 text-sm text-destructive">{error}</CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader><CardTitle>Nastavení žebříčku</CardTitle></CardHeader>
        <CardContent className="grid gap-2 md:grid-cols-4">
          <Select value={metric} onValueChange={(v) => setMetric(v as any)}>
            <SelectTrigger><SelectValue placeholder="Metrika" /></SelectTrigger>
            <SelectContent>
              {METRICS.map((m) => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={limit} onValueChange={setLimit}>
            <SelectTrigger><SelectValue placeholder="Top N" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="10">Top 10</SelectItem>
              <SelectItem value="25">Top 25</SelectItem>
              <SelectItem value="50">Top 50</SelectItem>
              <SelectItem value="5000">Všechny</SelectItem>
            </SelectContent>
          </Select>
          <Select value={categoryId} onValueChange={setCategoryId}>
            <SelectTrigger><SelectValue placeholder="Kategorie" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Globální</SelectItem>
              {(options?.categories || []).map((cat: any) => <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={subcategoryId} onValueChange={setSubcategoryId}>
            <SelectTrigger><SelectValue placeholder="Podkategorie" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Všechny podkategorie</SelectItem>
              {(options?.subcategories || []).map((sub: any) => <SelectItem key={sub.id} value={sub.id}>{sub.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Výsledky</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {rows.map((row, idx) => (
            <div key={row.id} className="grid grid-cols-1 gap-1 rounded-md border px-3 py-2 text-sm md:grid-cols-8">
              <div className="text-muted-foreground">#{idx + 1}</div>
              <Link to={`/core/problem-domains/domains/${row.id}`} className="font-medium text-primary hover:underline">{row.domain}</Link>
              <div>{row.category?.name || '-'}</div>
              <div>{row.subcategory?.name || '-'}</div>
              <div>score: {typeof row.trustScore === 'number' ? row.trustScore.toFixed(1) : 'n/a'}</div>
              <div className="flex items-center gap-1 font-medium text-red-600"><ArrowDownCircle className="h-4 w-4" />{row.negativeReviewsCount ?? 0}</div>
              <div className="flex items-center gap-1 font-medium text-green-600"><ArrowUpCircle className="h-4 w-4" />{Math.max(0, Number(row.reviewCountTotal ?? 0) - Number(row.negativeReviewsCount ?? 0))}</div>
              <div>ratio: {typeof row.negativeRatio === 'number' ? row.negativeRatio.toFixed(3) : 'n/a'}</div>
            </div>
          ))}
          {!error && rows.length === 0 ? (
            <div className="rounded-md border px-3 py-4 text-sm text-muted-foreground">Žádné výsledky pro zvolený filtr.</div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
