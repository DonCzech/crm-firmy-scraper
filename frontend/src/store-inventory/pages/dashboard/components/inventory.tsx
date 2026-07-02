import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BadgeDot } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { fetchProducts } from '@/crm/services/backend';
import { logFrontendError } from '@/crm/services/frontend-logger';

type InventoryProps = object;
type InventoryProduct = { id: string; name: string; sku?: string | null; price: number; status: string };

const Inventory = ({}: InventoryProps) => {
  const [products, setProducts] = useState<InventoryProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts({ limit: 100 })
      .then((res) => {
        const normalized: InventoryProduct[] = (res?.data ?? []).map((p) => ({
          id: p.id,
          name: p.name,
          sku: p.sku ?? null,
          price: p.price ?? 0,
          status: p.status ?? 'inactive',
        }));
        setProducts(normalized);
      })
      .catch((error) => {
        logFrontendError({
          area: 'store-dashboard-inventory',
          message: error instanceof Error ? error.message : 'Failed to load inventory widget data',
          meta: { operation: 'fetch_products_inventory_widget' },
        });
      })
      .finally(() => setLoading(false));
  }, []);

  const active = products.filter(p => p.status === 'active').length;
  const inactive = products.filter(p => p.status !== 'active').length;
  const total = products.length;
  const totalValue = products.reduce((s, p) => s + (p.price ?? 0), 0);
  const activePct = total > 0 ? Math.round((active / total) * 100) : 60;
  const inactivePct = total > 0 ? Math.round((inactive / total) * 100) : 25;

  const lowStock = products.filter(p => p.status !== 'active').slice(0, 3);
  const displayRows = lowStock.length > 0 ? lowStock : products.slice(-3);

  return (
    <Card className="h-full">
      <CardHeader className="lg:px-7.5">
        <CardTitle>Produkty</CardTitle>
        <Button mode="link" underline="solid" asChild>
          <Link to="/core/crm/products">Vše</Link>
        </Button>
      </CardHeader>
      <CardContent className="flex flex-col justify-between gap-2 p-5 lg:p-7.5">
        <div>
          {loading ? (
            <div className="h-9 w-32 bg-muted animate-pulse rounded mb-4" />
          ) : (
            <div className="flex flex-col gap-0.5 mb-2">
              <span className="text-sm font-normal text-muted-foreground">Celková hodnota</span>
              <span className="text-3xl font-semibold text-foreground">
                {totalValue.toLocaleString('cs-CZ', { style: 'currency', currency: 'CZK', maximumFractionDigits: 0 })}
              </span>
            </div>
          )}

          {!loading && (
            <>
              <div className="flex items-center gap-1 mb-2.5">
                <div className="bg-green-500 h-2 rounded-xs" style={{ width: `${activePct}%`, minWidth: '4px' }} />
                <div className="bg-destructive h-2 rounded-xs" style={{ width: `${Math.min(inactivePct, 40)}%`, minWidth: inactivePct > 0 ? '4px' : '0' }} />
              </div>
              <div className="flex items-center flex-wrap gap-4 mb-3.5">
                <div className="flex items-center gap-1.5">
                  <BadgeDot className="bg-green-500 size-2" />
                  <span className="text-sm font-normal text-secondary-foreground">Aktivní ({active})</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <BadgeDot className="bg-destructive size-2" />
                  <span className="text-sm font-normal text-secondary-foreground">Neaktivní ({inactive})</span>
                </div>
              </div>
              <div className="flex items-center justify-between mb-0.5">
                <span className="text-foreground font-medium text-sm">
                  {lowStock.length > 0 ? 'Neaktivní' : 'Poslední produkty'}
                </span>
              </div>
            </>
          )}
        </div>

        <div className="flex flex-col gap-2">
          {loading
            ? [1, 2, 3].map(i => <div key={i} className="h-10 bg-muted animate-pulse rounded-md" />)
            : displayRows.map((p) => (
              <div key={p.id} className="flex items-center justify-between bg-accent/50 rounded-md px-4 py-2 text-sm gap-2">
                <span className="text-foreground font-normal truncate">{p.name}</span>
                <div className="flex items-center gap-3">
                  {p.sku && <span className="text-xs text-muted-foreground shrink-0">{p.sku}</span>}
                  <Separator className="bg-gray-300 h-3" orientation="vertical" />
                  <span className="font-medium shrink-0">
                    {(p.price ?? 0).toLocaleString('cs-CZ', { style: 'currency', currency: 'CZK', maximumFractionDigits: 0 })}
                  </span>
                </div>
              </div>
            ))}
        </div>
      </CardContent>
    </Card>
  );
};

export { Inventory };
