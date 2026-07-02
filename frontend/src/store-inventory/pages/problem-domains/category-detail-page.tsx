import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { fetchProblemDomainsCategoryDetail } from '@/crm/services/backend';
import { ProblemDomainsModuleNav } from './module-nav';

export function ProblemDomainsCategoryDetailPage() {
  const { categoryId } = useParams();
  const [search, setSearch] = useState('');
  const [subcategoryId, setSubcategoryId] = useState('all');
  const [syncStatus, setSyncStatus] = useState('all');
  const [data, setData] = useState<any>(null);

  const load = async () => {
    if (!categoryId) return;
    const res = await fetchProblemDomainsCategoryDetail(categoryId, {
      search,
      subcategoryId: subcategoryId === 'all' ? undefined : subcategoryId,
      syncStatus: syncStatus === 'all' ? undefined : syncStatus,
      page: 1,
      limit: 50,
    });
    setData(res);
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryId]);

  const category = data?.category;

  return (
    <div className="container-fluid space-y-5 lg:space-y-8">
      <div className="space-y-1">
        <h1 className="text-xl font-bold">Detail kategorie</h1>
        <p className="text-sm text-muted-foreground">{category?.name || 'Kategorie'}</p>
      </div>

      <ProblemDomainsModuleNav />

      {category ? (
        <Card>
          <CardHeader>
            <CardTitle>{category.name} - Jak tento model funguje</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-2">
            <div><strong>Typ služby:</strong> {category.serviceTypeDescription || '-'}</div>
            <div><strong>Landing page:</strong> {category.typicalLandingPage || '-'}</div>
            <div><strong>Akvizice:</strong> {category.typicalAcquisition || '-'}</div>
            <div><strong>Funnel:</strong> {category.typicalFunnel || '-'}</div>
            <div><strong>Monetizace:</strong> {category.typicalMonetization || '-'}</div>
            <div><strong>Dark patterns:</strong> {category.typicalDarkPatterns || '-'}</div>
            <div><strong>Stížnosti:</strong> {category.typicalComplaints || '-'}</div>
            <div><strong>Rizikové signály:</strong> {category.riskSignals || '-'}</div>
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Filtry domén v kategorii</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Hledat doménu/poznámky" className="max-w-xs" />
          <Select value={subcategoryId} onValueChange={setSubcategoryId}>
            <SelectTrigger className="w-[220px]"><SelectValue placeholder="Podkategorie" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Všechny podkategorie</SelectItem>
              {(data?.category?.subcategories || []).map((sub: any) => (
                <SelectItem key={sub.id} value={sub.id}>{sub.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={syncStatus} onValueChange={setSyncStatus}>
            <SelectTrigger className="w-[220px]"><SelectValue placeholder="Stav update" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Všechny stavy</SelectItem>
              <SelectItem value="synced">synced</SelectItem>
              <SelectItem value="pending">pending</SelectItem>
              <SelectItem value="error">error</SelectItem>
              <SelectItem value="no-source">no-source</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={() => void load()}>Použít</Button>
        </CardContent>
      </Card>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Top 10 nejhorších domén v kategorii</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {(data?.top10 || []).map((row: any, idx: number) => (
              <div key={row.id} className="flex items-center justify-between rounded-md border px-3 py-2 text-sm">
                <div className="truncate">#{idx + 1} {row.domain}</div>
                <div>{typeof row.trustScore === 'number' ? row.trustScore.toFixed(1) : 'n/a'}</div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Podkategorie</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {(data?.category?.subcategories || []).map((sub: any) => (
              <div key={sub.id} className="flex items-center justify-between rounded-md border px-3 py-2 text-sm">
                <span>{sub.name}</span>
                <Link to={`/core/problem-domains/subcategories/${sub.id}`} className="text-primary hover:underline">Detail</Link>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Tabulka domén v kategorii</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {(data?.domains?.data || []).map((row: any) => (
            <div key={row.id} className="grid grid-cols-1 gap-1 rounded-md border px-3 py-2 text-sm md:grid-cols-5">
              <Link to={`/core/problem-domains/domains/${row.id}`} className="font-medium text-primary hover:underline">{row.domain}</Link>
              <div>{row.subcategory?.name || '-'}</div>
              <div>score: {typeof row.trustScore === 'number' ? row.trustScore.toFixed(1) : 'n/a'}</div>
              <div>neg: {row.negativeReviewsCount ?? 0}</div>
              <div>sync: {row.syncStatus}</div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
