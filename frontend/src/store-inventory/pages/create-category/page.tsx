'use client';

import { useState } from 'react';
import { PlusIcon } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { CategoryFormSheet, type CategoryFormValues } from '../components/category-form-sheet';
import { CategoryListTable } from '../tables/category-list';
import { upsertStoreCategory } from '@/store-inventory/services/catalog';

export function CreateCategoryPage() {
  const [isSheetOpen, setIsSheetOpen] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [stats, setStats] = useState({ total: 0, attention: 0 });

  const handleCreate = async (values: CategoryFormValues) => {
    if (!values.name.trim()) return;
    setSubmitting(true);
    try {
      upsertStoreCategory({
        name: values.name.trim(),
        status: values.status,
        description: values.description,
        featured: values.featured,
        image: values.image,
        productsQty: 0,
        ordersQty: 0,
        customersQty: 0,
        totalEarnings: 0,
      });
      window.dispatchEvent(new Event('order-list:changed'));
      toast.success('Category created');
      setIsSheetOpen(false);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container-fluid space-y-5 lg:space-y-9">
      <div className="flex items-center flex-wrap gap-2.5 justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-bold text-foreground">Create Category</h1>
          <span className="text-sm text-muted-foreground">
            {stats.total} categories in total. {stats.attention} currently need attention.
          </span>
        </div>
        <Button variant="mono" onClick={() => setIsSheetOpen(true)}>
          <PlusIcon />
          Add Category
        </Button>
      </div>

      <CategoryListTable onStatsChange={setStats} />
      <CategoryFormSheet
        mode="new"
        open={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        submitting={submitting}
        onSubmit={handleCreate}
      />
    </div>
  );
}
