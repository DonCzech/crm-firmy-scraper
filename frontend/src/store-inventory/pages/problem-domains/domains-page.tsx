import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowDownCircle, ArrowUpCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  bulkRefreshProblemDomains,
  exportProblemDomainsCsv,
  fetchProblemDomainsList,
  fetchProblemDomainsOptions,
  type ProblemDomainRow,
} from '@/crm/services/backend';
import { ProblemDomainsModuleNav } from './module-nav';

export function ProblemDomainsDomainsPage() {
  const [rows, setRows] = useState<ProblemDomainRow[]>([]);
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [options, setOptions] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [categoryId, setCategoryId] = useState('all');
  const [subcategoryId, setSubcategoryId] = useState('all');
  const [businessModel, setBusinessModel] = useState('all');
  const [syncStatus, setSyncStatus] = useState('all');
  const [isSeed, setIsSeed] = useState('all');
  const [sortBy, setSortBy] = useState('negativeReviewsCount');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [pageSize, setPageSize] = useState('5000');

  const load = async (nextPage = page) => {
    try {
      setLoading(true);
      setError(null);
      const [res, opts] = await Promise.all([
        fetchProblemDomainsList({
          search: search || undefined,
          categoryId: categoryId === 'all' ? undefined : categoryId,
          subcategoryId: subcategoryId === 'all' ? undefined : subcategoryId,
          businessModel: businessModel === 'all' ? undefined : businessModel,
          syncStatus: syncStatus === 'all' ? undefined : syncStatus,
          isSeed: isSeed === 'all' ? undefined : (isSeed as 'true' | 'false'),
          page: nextPage,
          limit: Number(pageSize),
          sortBy,
          sortOrder,
        }),
        fetchProblemDomainsOptions(),
      ]);
      setRows(res.data || []);
      setMeta(res.meta);
      setOptions(opts);
      setPage(nextPage);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Nepodařilo se načíst domény');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectedIds = useMemo(() => Object.entries(selected).filter(([, v]) => v).map(([k]) => k), [selected]);

  const toggleRow = (id: string, checked: boolean) => {
    setSelected((prev) => ({ ...prev, [id]: checked }));
  };

  const runBulkRefresh = async () => {
    await bulkRefreshProblemDomains({ domainIds: selectedIds, limit: selectedIds.length || 100 });
    await load(page);
  };

  const doExportCsv = async () => {
    await exportProblemDomainsCsv({
      search: search || undefined,
      categoryId: categoryId === 'all' ? undefined : categoryId,
      subcategoryId: subcategoryId === 'all' ? undefined : subcategoryId,
      businessModel: businessModel === 'all' ? undefined : businessModel,
      syncStatus: syncStatus === 'all' ? undefined : syncStatus,
      isSeed: isSeed === 'all' ? undefined : (isSeed as 'true' | 'false'),
      sortBy,
      sortOrder,
    });
  };

  return (
    <div className="container-fluid space-y-5 lg:space-y-8">
      <div className="space-y-1">
        <h1 className="text-xl font-bold">Databáze domén</h1>
        <p className="text-sm text-muted-foreground">Server-side filtry, řazení, pagination, bulk akce a export CSV.</p>
      </div>

      <ProblemDomainsModuleNav />

      {error ? (
        <Card>
          <CardContent className="py-4 text-sm text-destructive">{error}</CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader><CardTitle>Filtry</CardTitle></CardHeader>
        <CardContent className="grid gap-2 md:grid-cols-3 xl:grid-cols-6">
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Fulltext" />
          <Select value={categoryId} onValueChange={setCategoryId}>
            <SelectTrigger><SelectValue placeholder="Kategorie" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Všechny kategorie</SelectItem>
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
          <Select value={businessModel} onValueChange={setBusinessModel}>
            <SelectTrigger><SelectValue placeholder="Business model" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Všechny modely</SelectItem>
              {(options?.businessModelTags || []).map((tag: string) => <SelectItem key={tag} value={tag}>{tag}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={syncStatus} onValueChange={setSyncStatus}>
            <SelectTrigger><SelectValue placeholder="Sync status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Všechny stavy</SelectItem>
              {(options?.syncStatuses || []).map((status: string) => <SelectItem key={status} value={status}>{status}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={isSeed} onValueChange={setIsSeed}>
            <SelectTrigger><SelectValue placeholder="Seed" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Seed + non-seed</SelectItem>
              <SelectItem value="true">Jen seed</SelectItem>
              <SelectItem value="false">Jen non-seed</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger><SelectValue placeholder="Řadit dle" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="negativeReviewsCount">negativeReviewsCount</SelectItem>
              <SelectItem value="trustScore">trustScore</SelectItem>
              <SelectItem value="reviewCountTotal">reviewCountTotal</SelectItem>
              <SelectItem value="updatedAt">updatedAt</SelectItem>
              <SelectItem value="negativeRatio">negativeRatio</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sortOrder} onValueChange={(v) => setSortOrder(v as 'asc' | 'desc')}>
            <SelectTrigger><SelectValue placeholder="Směr" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="desc">desc</SelectItem>
              <SelectItem value="asc">asc</SelectItem>
            </SelectContent>
          </Select>
          <Select value={pageSize} onValueChange={setPageSize}>
            <SelectTrigger><SelectValue placeholder="Řádků" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="25">25</SelectItem>
              <SelectItem value="100">100</SelectItem>
              <SelectItem value="500">500</SelectItem>
              <SelectItem value="5000">Všechny</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={() => void load(1)} disabled={loading}>Použít filtry</Button>
          <Button variant="outline" onClick={() => void doExportCsv()}>Export CSV</Button>
          <Button onClick={() => void runBulkRefresh()} disabled={selectedIds.length === 0}>Bulk refresh ({selectedIds.length})</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Domény ({meta?.total ?? rows.length})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="hidden grid-cols-9 gap-2 rounded-md border bg-muted/40 px-3 py-2 text-xs font-semibold text-muted-foreground md:grid">
            <div>Doména</div>
            <div>Kategorie</div>
            <div>Podkategorie</div>
            <div>Business model</div>
            <div>Trust score</div>
            <div>Recenze</div>
            <div>Negativní</div>
            <div>Pozitivní</div>
            <div>Sync</div>
          </div>
          {rows.map((row) => (
            <div key={row.id} className="grid grid-cols-1 gap-2 rounded-md border px-3 py-2 text-sm md:grid-cols-9">
              <div className="flex items-center gap-2">
                <Checkbox checked={Boolean(selected[row.id])} onCheckedChange={(v) => toggleRow(row.id, Boolean(v))} />
                <Link to={`/core/problem-domains/domains/${row.id}`} className="font-medium text-primary hover:underline">{row.domain}</Link>
              </div>
              <div>{row.category?.name || '-'}</div>
              <div>{row.subcategory?.name || '-'}</div>
              <div>{row.businessModelTags.join(', ') || '-'}</div>
              <div>score: {typeof row.trustScore === 'number' ? row.trustScore.toFixed(1) : 'n/a'}</div>
              <div>reviews: {row.reviewCountTotal ?? 0}</div>
              <div className="flex items-center gap-1 font-medium text-red-600"><ArrowDownCircle className="h-4 w-4" />{row.negativeReviewsCount ?? 0}</div>
              <div className="flex items-center gap-1 font-medium text-green-600"><ArrowUpCircle className="h-4 w-4" />{Math.max(0, Number(row.reviewCountTotal ?? 0) - Number(row.negativeReviewsCount ?? 0))}</div>
              <div>sync: {row.syncStatus}</div>
            </div>
          ))}

          {!loading && !error && rows.length === 0 ? (
            <div className="rounded-md border px-3 py-4 text-sm text-muted-foreground">
              Žádné domény k zobrazení.
            </div>
          ) : null}

          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 text-sm">
            <span className="text-muted-foreground">Strana {meta?.page ?? page} / {meta?.totalPages ?? 1}</span>
            <div className="flex gap-2">
              <Button variant="outline" disabled={(meta?.page ?? page) <= 1} onClick={() => void load(Math.max(1, (meta?.page ?? page) - 1))}>Předchozí</Button>
              <Button variant="outline" disabled={(meta?.page ?? page) >= (meta?.totalPages ?? 1)} onClick={() => void load((meta?.page ?? page) + 1)}>Další</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
