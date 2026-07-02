import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { fetchProblemDomainsSubcategoryDetail } from '@/crm/services/backend';
import { ProblemDomainsModuleNav } from './module-nav';

export function ProblemDomainsSubcategoryDetailPage() {
  const { subcategoryId } = useParams();
  const [search, setSearch] = useState('');
  const [data, setData] = useState<any>(null);

  const load = async () => {
    if (!subcategoryId) return;
    const res = await fetchProblemDomainsSubcategoryDetail(subcategoryId, {
      search,
      page: 1,
      limit: 50,
    });
    setData(res);
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subcategoryId]);

  const sub = data?.subcategory;

  return (
    <div className="container-fluid space-y-5 lg:space-y-8">
      <div className="space-y-1">
        <h1 className="text-xl font-bold">Detail podkategorie</h1>
        <p className="text-sm text-muted-foreground">{sub?.name || 'Podkategorie'}</p>
      </div>

      <ProblemDomainsModuleNav />

      <Card>
        <CardHeader>
          <CardTitle>{sub?.name || '-'} - Jak tento model funguje</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2">
          <div><strong>Typ služby:</strong> {sub?.serviceTypeDescription || '-'}</div>
          <div><strong>Landing page:</strong> {sub?.typicalLandingPage || '-'}</div>
          <div><strong>Akvizice:</strong> {sub?.typicalAcquisition || '-'}</div>
          <div><strong>Funnel:</strong> {sub?.typicalFunnel || '-'}</div>
          <div><strong>Monetizace:</strong> {sub?.typicalMonetization || '-'}</div>
          <div><strong>Dark patterns:</strong> {sub?.typicalDarkPatterns || '-'}</div>
          <div><strong>Stížnosti:</strong> {sub?.typicalComplaints || '-'}</div>
          <div><strong>Rizikové signály:</strong> {sub?.riskSignals || '-'}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Filtr domén podkategorie</CardTitle></CardHeader>
        <CardContent className="flex gap-2">
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Hledat doménu" className="max-w-xs" />
          <Button variant="outline" onClick={() => void load()}>Filtrovat</Button>
          {sub?.categoryId ? <Link className="text-sm text-primary hover:underline self-center" to={`/core/problem-domains/categories/${sub.categoryId}`}>Zpět na kategorii</Link> : null}
        </CardContent>
      </Card>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Top 10 nejhorších domén v podkategorii</CardTitle></CardHeader>
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
          <CardHeader><CardTitle>Domény podkategorie</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {(data?.domains?.data || []).map((row: any) => (
              <div key={row.id} className="grid grid-cols-1 gap-1 rounded-md border px-3 py-2 text-sm md:grid-cols-4">
                <Link to={`/core/problem-domains/domains/${row.id}`} className="font-medium text-primary hover:underline">{row.domain}</Link>
                <div>score: {typeof row.trustScore === 'number' ? row.trustScore.toFixed(1) : 'n/a'}</div>
                <div>neg: {row.negativeReviewsCount ?? 0}</div>
                <div>{row.syncStatus}</div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
