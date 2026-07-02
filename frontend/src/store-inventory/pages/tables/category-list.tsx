'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ColumnDef,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  PaginationState,
  RowSelectionState,
  SortingState,
  useReactTable,
} from '@tanstack/react-table';
import { Eye, Info, Search, SquarePen, Trash, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { toAbsoluteUrl } from '@/lib/helpers';
import { Alert, AlertIcon, AlertTitle } from '@/components/ui/alert';
import { Badge, type BadgeProps } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardFooter,
  CardHeader,
  CardTable,
  CardToolbar,
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { DataGrid } from '@/components/ui/data-grid';
import { DataGridColumnHeader } from '@/components/ui/data-grid-column-header';
import { DataGridPagination } from '@/components/ui/data-grid-pagination';
import {
  DataGridTable,
  DataGridTableRowSelect,
  DataGridTableRowSelectAll,
} from '@/components/ui/data-grid-table';
import { Input, InputWrapper } from '@/components/ui/input';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import {
  deleteStoreCategory,
  loadStoreCategories,
  upsertStoreCategory,
  type StoreCategory,
} from '@/store-inventory/services/catalog';
import {
  CategoryDetailsEditSheet,
} from '../components/category-details-edit-sheet';
import {
  CategoryFormSheet,
  type CategoryFormValues,
} from '../components/category-form-sheet';

export interface CategoryListTableProps {
  displaySheet?: 'categoryDetails' | 'createCategory' | 'editCategory';
  onStatsChange?: (stats: { total: number; attention: number }) => void;
}

export function CategoryListTable({ displaySheet, onStatsChange }: CategoryListTableProps) {
  const navigate = useNavigate();
  const [data, setData] = useState<StoreCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [sorting, setSorting] = useState<SortingState>([{ id: 'name', desc: false }]);
  const [isCategoryDetailsEditOpen, setIsCategoryDetailsEditOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<StoreCategory | null>(null);
  const [isEditCategoryOpen, setIsEditCategoryOpen] = useState(false);
  const [isCreateCategoryOpen, setIsCreateCategoryOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const categories = await loadStoreCategories();
      setData(categories);
    } catch {
      setData([]);
      toast.custom((t) => (
        <Alert variant="mono" icon="destructive" onClose={() => toast.dismiss(t)}>
          <AlertIcon>
            <Info />
          </AlertIcon>
          <AlertTitle>Failed to load categories</AlertTitle>
        </Alert>
      ));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
    const refresh = () => void loadData();
    window.addEventListener('order-list:changed', refresh);
    return () => window.removeEventListener('order-list:changed', refresh);
  }, [loadData]);

  useEffect(() => {
    if (!displaySheet) return;
    if (displaySheet === 'createCategory') setIsCreateCategoryOpen(true);
    if (displaySheet === 'editCategory') setIsEditCategoryOpen(true);
    if (displaySheet === 'categoryDetails') setIsCategoryDetailsEditOpen(true);
  }, [displaySheet]);

  const filteredData = useMemo(() => {
    let result = [...data];
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter((item) => item.name.toLowerCase().includes(query));
    }
    return result;
  }, [data, searchQuery]);

  useEffect(() => {
    const attention = filteredData.filter((item) => item.status !== 'active').length;
    onStatsChange?.({ total: filteredData.length, attention });
  }, [filteredData, onStatsChange]);

  const updateCategory = async (category: StoreCategory, values: CategoryFormValues) => {
    setSubmitting(true);
    try {
      upsertStoreCategory({
        id: category.id,
        name: values.name.trim(),
        status: values.status,
        description: values.description,
        featured: values.featured,
        image: values.image,
        productsQty: category.productsQty,
        ordersQty: category.ordersQty,
        customersQty: category.customersQty,
        totalEarnings: category.totalEarnings,
      });
      await loadData();
      toast.success('Category updated');
      setIsEditCategoryOpen(false);
      setIsCategoryDetailsEditOpen(false);
    } finally {
      setSubmitting(false);
    }
  };

  const createCategory = async (values: CategoryFormValues) => {
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
      await loadData();
      toast.success('Category created');
      setIsCreateCategoryOpen(false);
    } finally {
      setSubmitting(false);
    }
  };

  const deleteCategory = useCallback(async (category?: StoreCategory | null) => {
    if (!category) return;
    deleteStoreCategory(category.id);
    await loadData();
    setIsCategoryDetailsEditOpen(false);
    setIsEditCategoryOpen(false);
    toast.success(`Category "${category.name}" deleted`);
  }, [loadData]);

  const columns = useMemo<ColumnDef<StoreCategory>[]>(
    () => [
      {
        accessorKey: 'id',
        header: () => <DataGridTableRowSelectAll />,
        cell: ({ row }) => <DataGridTableRowSelect row={row} />,
        enableSorting: false,
        enableHiding: false,
        size: 40,
      },
      {
        id: 'name',
        accessorFn: (row) => row.name,
        header: ({ column }) => <DataGridColumnHeader title="Category" column={column} />,
        cell: (info) => {
          const category = info.row.original;
          return (
            <div className="flex items-center gap-2.5">
              <Card className="flex items-center justify-center rounded-md bg-accent/50 h-[40px] w-[50px] shadow-none shrink-0">
                <img
                  src={toAbsoluteUrl(`/media/store/client/icons/light/${category.image}`)}
                  className="h-[30px] dark:hidden"
                  alt={category.name}
                />
                <img
                  src={toAbsoluteUrl(`/media/store/client/icons/dark/${category.image}`)}
                  className="h-[30px] light:hidden"
                  alt={category.name}
                />
              </Card>
              <div className="flex flex-col gap-1">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCategory(category);
                    setIsCategoryDetailsEditOpen(true);
                  }}
                  className="text-sm font-medium tracking-[-1%] text-left hover:text-primary"
                >
                  {category.name}
                </button>
                <span className="text-xs text-muted-foreground">
                  Category ID:{' '}
                  <span className="text-xs font-medium text-foreground">{category.id}</span>
                </span>
              </div>
            </div>
          );
        },
        enableSorting: true,
        size: 240,
      },
      {
        id: 'productsQty',
        accessorFn: (row) => row.productsQty,
        header: ({ column }) => <DataGridColumnHeader title="Products Qty" column={column} />,
        cell: (info) => info.row.original.productsQty,
        enableSorting: true,
        size: 100,
      },
      {
        id: 'ordersQty',
        accessorFn: (row) => row.ordersQty,
        header: ({ column }) => <DataGridColumnHeader title="Orders Qty" column={column} />,
        cell: (info) => info.row.original.ordersQty,
        enableSorting: true,
        size: 100,
      },
      {
        id: 'customersQty',
        accessorFn: (row) => row.customersQty,
        header: ({ column }) => <DataGridColumnHeader title="Customers Qty" column={column} />,
        cell: (info) => info.row.original.customersQty,
        enableSorting: true,
        size: 120,
      },
      {
        id: 'totalEarnings',
        accessorFn: (row) => row.totalEarnings,
        header: ({ column }) => <DataGridColumnHeader title="Total Earnings" column={column} />,
        cell: (info) =>
          new Intl.NumberFormat('cs-CZ', { style: 'currency', currency: 'CZK' }).format(
            info.row.original.totalEarnings,
          ),
        enableSorting: true,
        size: 140,
      },
      {
        id: 'status',
        accessorFn: (row) => row.status,
        header: ({ column }) => <DataGridColumnHeader title="Status" column={column} />,
        cell: (info) => {
          const status = info.row.original.status;
          const variant =
            status === 'active'
              ? 'success'
              : status === 'inactive'
                ? 'warning'
                : status === 'draft'
                  ? 'secondary'
                  : 'destructive';
          return (
            <Badge variant={variant as BadgeProps['variant']} appearance="light">
              {status}
            </Badge>
          );
        },
        enableSorting: true,
        size: 100,
      },
      {
        id: 'featured',
        header: ({ column }) => <DataGridColumnHeader title="Featured" column={column} />,
        cell: (info) => (
          <div className="flex justify-center">
            <Checkbox
              size="sm"
              checked={info.row.original.featured}
              onCheckedChange={(checked) => {
                const row = info.row.original;
                upsertStoreCategory({
                  id: row.id,
                  name: row.name,
                  status: row.status,
                  description: row.description,
                  featured: Boolean(checked),
                  image: row.image,
                  productsQty: row.productsQty,
                  ordersQty: row.ordersQty,
                  customersQty: row.customersQty,
                  totalEarnings: row.totalEarnings,
                });
                setData((prev) =>
                  prev.map((item) =>
                    item.id === row.id ? { ...item, featured: Boolean(checked) } : item,
                  ),
                );
              }}
            />
          </div>
        ),
        size: 80,
      },
      {
        id: 'actions',
        header: () => '',
        enableSorting: false,
        cell: ({ row }) => {
          const category = row.original;
          return (
            <div className="flex items-center gap-1">
              <Button
                variant="dim"
                mode="icon"
                size="sm"
                onClick={() => {
                  setSelectedCategory(category);
                  setIsCategoryDetailsEditOpen(true);
                }}
              >
                <Eye />
              </Button>
              <Button
                variant="dim"
                mode="icon"
                size="sm"
                onClick={() => {
                  setSelectedCategory(category);
                  setIsEditCategoryOpen(true);
                }}
              >
                <SquarePen />
              </Button>
              <Button
                variant="dim"
                mode="icon"
                size="sm"
                onClick={() => void deleteCategory(category)}
              >
                <Trash />
              </Button>
            </div>
          );
        },
        size: 90,
      },
    ],
    [deleteCategory],
  );

  const table = useReactTable({
    data: filteredData,
    columns,
    state: {
      pagination,
      sorting,
      rowSelection,
    },
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <>
      <DataGrid
        table={table}
        recordCount={filteredData.length}
        tableLayout={{
          columnsPinnable: true,
          columnsMovable: true,
          columnsVisibility: true,
          cellBorder: true,
        }}
      >
        <Card>
          <CardHeader className="py-3.5">
            <CardToolbar className="flex items-center gap-2">
              <InputWrapper className="w-full lg:w-[260px]">
                <Search />
                <Input
                  placeholder="Search category..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <Button
                    variant="dim"
                    size="sm"
                    className="-me-3.5"
                    onClick={() => setSearchQuery('')}
                  >
                    <X />
                  </Button>
                )}
              </InputWrapper>
              <Button variant="outline" onClick={() => void loadData()}>
                {loading ? 'Refreshing...' : 'Refresh'}
              </Button>
            </CardToolbar>
          </CardHeader>
          <CardTable>
            <ScrollArea>
              <DataGridTable />
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </CardTable>
          <CardFooter>
            <DataGridPagination />
          </CardFooter>
        </Card>
      </DataGrid>

      <CategoryDetailsEditSheet
        open={isCategoryDetailsEditOpen}
        onOpenChange={setIsCategoryDetailsEditOpen}
        category={selectedCategory}
        onEdit={() => {
          setIsCategoryDetailsEditOpen(false);
          setIsEditCategoryOpen(true);
        }}
        onDelete={() => void deleteCategory(selectedCategory)}
        onOpenOrders={() =>
          navigate(
            selectedCategory
              ? `/core/order-list?category=${encodeURIComponent(selectedCategory.name)}`
              : '/core/order-list',
          )
        }
      />

      <CategoryFormSheet
        mode="edit"
        open={isEditCategoryOpen}
        onOpenChange={setIsEditCategoryOpen}
        initialCategory={selectedCategory}
        submitting={submitting}
        onSubmit={(values) => selectedCategory && updateCategory(selectedCategory, values)}
        onDelete={() => void deleteCategory(selectedCategory)}
      />

      <CategoryFormSheet
        mode="new"
        open={isCreateCategoryOpen}
        onOpenChange={setIsCreateCategoryOpen}
        submitting={submitting}
        onSubmit={createCategory}
      />
    </>
  );
}
