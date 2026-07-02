import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { fetchProblemDomainDetail, refreshProblemDomain, updateProblemDomain } from '@/crm/services/backend';
import { ProblemDomainsModuleNav } from './module-nav';

export function ProblemDomainsDomainDetailPage() {
  const { domainId } = useParams();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);
  const [internalNote, setInternalNote] = useState('');

  const load = async () => {
    if (!domainId) return;
    setLoading(true);
    try {
      const res = await fetchProblemDomainDetail(domainId);
      setData(res);
      setInternalNote(res.internalNote || '');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [domainId]);

  const saveNote = async () => {
    if (!domainId) return;
    await updateProblemDomain(domainId, { internalNote });
    await load();
  };

  const refresh = async () => {
    if (!domainId) return;
    await refreshProblemDomain(domainId);
    await load();
  };

  if (!data) {
    return (
      <div className="container-fluid space-y-5 lg:space-y-8">
        <ProblemDomainsModuleNav />
        <Card><CardContent className="py-6">{loading ? 'Načítám…' : 'Doména nenalezena'}</CardContent></Card>
      </div>
    );
  }

  return (
    <div className="container-fluid space-y-5 lg:space-y-8">
      <div className="space-y-1">
        <h1 className="text-xl font-bold">Detail domény</h1>
        <p className="text-sm text-muted-foreground">{data.domain}</p>
      </div>

      <ProblemDomainsModuleNav />

      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Základní data</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div><strong>Doména:</strong> {data.domain}</div>
            <div><strong>Kategorie:</strong> {data.category?.name || '-'}</div>
            <div><strong>Podkategorie:</strong> {data.subcategory?.name || '-'}</div>
            <div><strong>Business model:</strong> {(data.businessModelTags || []).join(', ') || '-'}</div>
            <div><strong>Trustpilot URL:</strong> {data.trustpilotUrl || '-'}</div>
            <div><strong>Trust score:</strong> {typeof data.trustScore === 'number' ? data.trustScore.toFixed(1) : 'n/a'}</div>
            <div><strong>Počet recenzí:</strong> {data.reviewCountTotal ?? 0}</div>
            <div><strong>Negativní recenze:</strong> {data.negativeReviewsCount ?? 0}</div>
            <div><strong>Pozitivní recenze:</strong> {Math.max(0, Number(data.reviewCountTotal ?? 0) - Number(data.negativeReviewsCount ?? 0))}</div>
            <div><strong>Negative ratio:</strong> {typeof data.negativeRatio === 'number' ? data.negativeRatio.toFixed(3) : 'n/a'}</div>
            <div><strong>Poslední update:</strong> {data.lastSyncedAt ? new Date(data.lastSyncedAt).toLocaleString('cs-CZ') : '-'}</div>
            <div><strong>Sync status:</strong> {data.syncStatus}</div>
            <div><strong>Tagy:</strong> {(data.tags || []).join(', ') || '-'}</div>
            <div><strong>Poznámky:</strong> {data.notes || '-'}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Admin editace</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div>
              <label className="text-sm font-medium">Interní poznámka</label>
              <Textarea value={internalNote} onChange={(e) => setInternalNote(e.target.value)} rows={6} />
            </div>
            <div className="flex flex-wrap gap-2">
              <Button onClick={() => void saveNote()}>Uložit interní poznámku</Button>
              <Button variant="outline" onClick={() => void refresh()}>Ruční refresh</Button>
            </div>
            <div>
              <label className="text-sm font-medium">Trustpilot URL override</label>
              <Input defaultValue={data.trustpilotUrl || ''} disabled />
              <p className="text-xs text-muted-foreground mt-1">Editaci URL lze doplnit přímo v databázové tabulce modulů.</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Posledních 10 negativních recenzí</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {(data.negativeReviews || []).length === 0 ? (
              <div className="rounded-md border px-3 py-3 text-sm text-muted-foreground">
                Zatím nejsou dostupné žádné uložené negativní recenze. Spusť ruční refresh domény.
              </div>
            ) : (
              (data.negativeReviews || []).map((review: any, idx: number) => (
                <div key={review.id || `${idx}-${review.externalReviewId || 'row'}`} className="rounded-md border px-3 py-3 text-sm">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="font-medium">
                      {review.title || 'Bez titulku'} | {review.rating}★
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {review.publishedAt ? new Date(review.publishedAt).toLocaleString('cs-CZ') : 'Datum neuvedeno'}
                    </div>
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    Autor: {review.authorName || 'Anonym'}
                  </div>
                  <div className="mt-2 whitespace-pre-wrap">{review.text}</div>
                  {review.sourceUrl ? (
                    <a
                      href={review.sourceUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-2 inline-block text-xs text-primary hover:underline"
                    >
                      Otevřít zdroj recenze
                    </a>
                  ) : null}
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Vývoj metrik v čase (snapshoty)</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {(data.snapshots || []).slice(0, 20).map((snap: any) => (
              <div key={snap.id} className="grid grid-cols-1 gap-1 rounded-md border px-3 py-2 text-sm md:grid-cols-4">
                <div>{new Date(snap.capturedAt).toLocaleString('cs-CZ')}</div>
                <div>score: {typeof snap.trustScore === 'number' ? snap.trustScore.toFixed(1) : 'n/a'}</div>
                <div>reviews: {snap.reviewCountTotal ?? 0}</div>
                <div>negative: {snap.negativeReviewsCount ?? 0}</div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Historie změn</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {(data.changes || []).slice(0, 30).map((change: any) => (
              <div key={change.id} className="rounded-md border px-3 py-2 text-sm">
                <div className="font-medium">{change.fieldName}</div>
                <div className="text-xs text-muted-foreground">{new Date(change.createdAt).toLocaleString('cs-CZ')} | {change.changeSource || '-'}</div>
                <div className="text-xs">{change.oldValue || 'null'} → {change.newValue || 'null'}</div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
