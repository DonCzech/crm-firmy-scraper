'use client';

import { useEffect, useState } from 'react';
import { PlusIcon, Upload } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ProductFormSheet } from '../components/product-form-sheet';
import { ProductListTable } from '../tables/product-list';
import { fetchProducts } from '@/crm/services/backend';

export function ProductList() {
  const [searchParams] = useSearchParams();
  const [isCreateProductOpen, setIsCreateProductOpen] = useState(false);
  const [stats, setStats] = useState({ total: 0, activePct: 0 });
  const initialProductId = (searchParams.get('productId') || '').trim() || undefined;

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const response = await fetchProducts({ page: 1, limit: 5000 });
        if (!active) return;
        const rows = response.data || [];
        const total = rows.length;
        const activeRows = rows.filter((p) => (p.status || '').toLowerCase() === 'published').length;
        const activePct = total > 0 ? Math.round((activeRows / total) * 100) : 0;
        setStats({ total, activePct });
      } catch {
        if (!active) return;
        setStats({ total: 0, activePct: 0 });
      }
    };
    void load();
    const refresh = () => void load();
    window.addEventListener('product-list:changed', refresh);
    return () => {
      active = false;
      window.removeEventListener('product-list:changed', refresh);
    };
  }, []);

  return (
    <div className="container-fluid space-y-5 lg:space-y-9">
      <div className="flex items-center flex-wrap dap-2.5 justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-bold text-foreground">Product List</h1>
          <span className="text-sm text-muted-foreground">
            {stats.total} products found. {stats.activePct}% are active.
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="gap-2">
            <Upload className="h-4 w-4" />
            Import
          </Button>
          <Button
            variant="mono"
            className="gap-2"
            onClick={() => setIsCreateProductOpen(true)}
          >
            <PlusIcon className="h-4 w-4" />
            Add Product
          </Button>
        </div>
      </div>

      {/* Product List Table */}
      <ProductListTable initialProductId={initialProductId} />

      {/* Create Product Modal */}
      <ProductFormSheet
        mode="new"
        open={isCreateProductOpen}
        onOpenChange={setIsCreateProductOpen}
      />
    </div>
  );
}
