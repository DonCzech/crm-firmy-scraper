import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { fetchProducts } from '@/crm/services/backend';
import { logFrontendError } from '@/crm/services/frontend-logger';

export function BestSeller() {
  const [products, setProducts] = useState<Array<{ id: string; name: string; price: number; sku?: string | null; category?: string | null }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts({ limit: 4 })
      .then(res => setProducts(res?.data ?? []))
      .catch((error) => {
        logFrontendError({
          area: 'store-dashboard-best-sellers',
          message: error instanceof Error ? error.message : 'Failed to load best-sellers widget data',
          meta: { operation: 'fetch_products_best_sellers_widget' },
        });
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <Card className="h-full">
        <CardHeader className="lg:px-7.5">
          <CardTitle>Produkty</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 p-5 lg:p-7.5">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-14 bg-muted animate-pulse rounded-md" />)}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader className="lg:px-7.5">
        <CardTitle>Produkty</CardTitle>
        <Button mode="link" underline="solid" asChild>
          <Link to="/core/crm/products">Vše</Link>
        </Button>
      </CardHeader>
      <CardContent className="flex flex-col gap-2 lg:gap-7.5 p-5 lg:p-7.5">
        {products.length === 0 ? (
          <p className="text-sm text-muted-foreground">Žádné produkty.</p>
        ) : products.map((p) => (
          <div key={p.id} className="flex items-center gap-3.5">
            <Card className="flex items-center justify-center rounded-md bg-accent/50 h-[50px] w-[60px] shadow-none shrink-0">
              <Package className="w-6 h-6 text-muted-foreground" />
            </Card>
            <div className="flex flex-col gap-1.5 mb-1 min-w-0">
              <span className="text-sm font-medium text-mono leading-5.5 truncate">{p.name}</span>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                {p.sku && <span className="uppercase">SKU: <span className="font-medium text-foreground">{p.sku}</span></span>}
                {p.category && <span className="text-muted-foreground">· {p.category}</span>}
              </div>
            </div>
            <div className="ml-auto shrink-0 font-semibold text-sm">
              {p.price.toLocaleString('cs-CZ', { style: 'currency', currency: 'CZK', maximumFractionDigits: 0 })}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
