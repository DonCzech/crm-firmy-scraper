'use client';

import { PlusIcon } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { CategoryListTable } from '../tables/category-list';
import { useState } from 'react';
import { CategoryFormSheet, type CategoryFormValues } from '../components/category-form-sheet';
import { upsertStoreCategory } from '@/store-inventory/services/catalog';

export function CategoryList() {
  const [isCreateCategoryOpen, setIsCreateCategoryOpen] = useState(false);
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
      setIsCreateCategoryOpen(false);
    } finally {
      setSubmitting(false);
    }
  };
  
  return (
    <div className="container-fluid space-y-5 lg:space-y-9">
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <h3 className="text-xl font-semibold text-foreground">
            Category List
          </h3>
          <span className="text-sm text-muted-foreground">
            {stats.total} categories found. {stats.attention} need your attention.
          </span>
        </div>

        <Button variant="mono" onClick={() => setIsCreateCategoryOpen(true)}>
          <PlusIcon />
          Add Category
        </Button>
      </div>
      <CategoryListTable onStatsChange={setStats} />
      <CategoryFormSheet
        mode="new"
        open={isCreateCategoryOpen}
        onOpenChange={setIsCreateCategoryOpen}
        submitting={submitting}
        onSubmit={handleCreate}
      />
    </div>
  );
}
