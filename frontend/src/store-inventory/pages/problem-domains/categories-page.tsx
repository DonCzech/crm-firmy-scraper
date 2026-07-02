import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { fetchProblemDomainsCategories, type ProblemDomainsCategory } from '@/crm/services/backend';
import { ProblemDomainsModuleNav } from './module-nav';

export function ProblemDomainsCategoriesPage() {
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<ProblemDomainsCategory[]>([]);
  const [error, setError] = useState<string | null>(null);

  const load = async (q = '') => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetchProblemDomainsCategories({ search: q, page: 1, limit: 200 });
      setData(res.data || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Nepodařilo se načíst kategorie');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  return (
    <div className="container-fluid space-y-5 lg:space-y-8">
      <div className="space-y-1">
        <h1 className="text-xl font-bold">Katalog kategorií</h1>
        <p className="text-sm text-muted-foreground">Kategorie, podkategorie a základní business model popisy.</p>
      </div>

      <ProblemDomainsModuleNav />

      {error ? (
        <Card>
          <CardContent className="py-4 text-sm text-destructive">{error}</CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Vyhledávání</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Fulltext přes název a popis"
            className="max-w-xl"
          />
          <Button variant="outline" onClick={() => void load(search)} disabled={loading}>
            Filtrovat
          </Button>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {data.map((category) => (
          <Card key={category.id}>
            <CardHeader className="space-y-1">
              <CardTitle className="text-base">{category.name}</CardTitle>
              <p className="text-xs text-muted-foreground line-clamp-2">{category.shortDescription || 'Bez stručného popisu'}</p>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="line-clamp-3 text-sm text-muted-foreground">{category.detailedDescription || 'Bez detailního popisu'}</p>
              <div>
                <Link to={`/core/problem-domains/categories/${category.id}`} className="text-sm font-medium text-primary hover:underline">
                  Otevřít detail kategorie
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {!loading && !error && data.length === 0 ? (
        <Card>
          <CardContent className="py-6 text-sm text-muted-foreground">Žádné kategorie k zobrazení.</CardContent>
        </Card>
      ) : null}
    </div>
  );
}
