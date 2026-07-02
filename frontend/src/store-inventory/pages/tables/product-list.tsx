'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Column,
  ColumnDef,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  PaginationState,
  RowSelectionState,
  SortingState,
  useReactTable,
} from '@tanstack/react-table';
import {
  EllipsisVertical,
  Filter,
  Info,
  Search,
  Settings,
  Star,
  Trash,
  X,
  Layers,
} from 'lucide-react';
import { toast } from 'sonner';
import { toAbsoluteUrl } from '@/lib/helpers';
import { Alert, AlertIcon, AlertTitle } from '@/components/ui/alert';
import { Badge, BadgeProps } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardFooter,
  CardHeader,
  CardTable,
  CardToolbar,
} from '@/components/ui/card';
import { DataGrid } from '@/components/ui/data-grid';
import { DataGridColumnHeader } from '@/components/ui/data-grid-column-header';
import { DataGridColumnVisibility } from '@/components/ui/data-grid-column-visibility';
import { DataGridPagination } from '@/components/ui/data-grid-pagination';
import {
  DataGridTable,
  DataGridTableRowSelect,
  DataGridTableRowSelectAll,
} from '@/components/ui/data-grid-table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input, InputWrapper } from '@/components/ui/input';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { ProductFormSheet } from '../components/product-form-sheet';
import { ProductDetailsAnalyticsSheet } from '../components/product-details-analytics-sheet';
import { ManageVariantsSheet } from '../components/manage-variants';
import { cn } from '@/lib/utils';
import {
  deleteProduct,
  fetchProducts,
  type BackendProduct,
} from '@/crm/services/backend';

interface IColumnFilterProps<TData, TValue> {
  column: Column<TData, TValue>;
}

export interface IData {
  id: string;
  productInfo: {
    image: string;
    title: string;
    label: string;
    tooltip: string;
  };
  category: string;
  price: string;
  status: {
    label: string;
    variant: string;
  };
  created: string;
  updated: string;
  images?: string[];
}

function formatProductDate(value: string): string {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString('en-US', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function statusToBadge(status: string): IData['status'] {
  switch ((status || '').toLowerCase()) {
    case 'published':
      return { label: 'Live', variant: 'success' };
    case 'archived':
      return { label: 'Archived', variant: 'info' };
    case 'draft':
    default:
      return { label: 'Draft', variant: 'warning' };
  }
}

function mapBackendProductToRow(product: BackendProduct): IData {
  return {
    id: product.id,
    productInfo: {
      image: product.image || '11.png',
      title: product.name,
      label: product.sku || '-',
      tooltip: product.description || product.name,
    },
    category: product.category || 'General',
    price: new Intl.NumberFormat('cs-CZ', { style: 'currency', currency: 'CZK' }).format(
      Number(product.price || 0),
    ),
    status: statusToBadge(product.status),
    created: formatProductDate(product.createdAt),
    updated: formatProductDate(product.updatedAt),
    images: product.images || (product.image ? [product.image] : []),
  };
}

function resolveProductImageSrc(image?: string): string {
  if (!image) {
    return toAbsoluteUrl('/media/store/client/1200x1200/11.png');
  }

  const normalized = image.trim();
  if (!normalized) {
    return toAbsoluteUrl('/media/store/client/1200x1200/11.png');
  }

  if (
    normalized.startsWith('data:image/') ||
    normalized.startsWith('blob:') ||
    normalized.startsWith('http://') ||
    normalized.startsWith('https://')
  ) {
    return normalized;
  }

  if (normalized.startsWith('/media/')) {
    return toAbsoluteUrl(normalized);
  }

  return toAbsoluteUrl(`/media/store/client/1200x1200/${normalized}`);
}

function rowToBackendProduct(product: IData): BackendProduct {
  return {
    id: product.id,
    name: product.productInfo.title,
    description: product.productInfo.tooltip,
    category: product.category,
    brand: undefined,
    sku: product.productInfo.label === '-' ? undefined : product.productInfo.label,
    barcode: undefined,
    price: Number(product.price.replace(/[^\d.-]/g, '').replace(',', '.')) || 0,
    status: product.status.label.toLowerCase() === 'live' ? 'published' : product.status.label.toLowerCase(),
    featured: false,
    image: product.productInfo.image,
    images: product.images || (product.productInfo.image ? [product.productInfo.image] : []),
    tags: [],
    createdAt: '',
    updatedAt: '',
  };
}

interface ProductListProps {
  mockData?: IData[];
  onRowClick?: (productId: string) => void;
  displaySheet?: "productDetails" | "createProduct" | "editProduct" | "manageVariants";
  initialProductId?: string;
}

const mockData: IData[] = [];

export function ProductListTable({
  mockData: propsMockData,
  onRowClick,
  displaySheet,
  initialProductId,
}: ProductListProps) {
  const [apiData, setApiData] = useState<IData[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [productsError, setProductsError] = useState<string | null>(null);
  const data = useMemo(() => {
    if (propsMockData) return propsMockData;
    return apiData;
  }, [propsMockData, apiData]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  // Search input state
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'created', desc: true },
  ]);
  const [selectedLastMoved] = useState<string[]>([]);

  // Modal state
  const [isProductDetailsOpen, setIsProductDetailsOpen] = useState(false);
  const [isEditProductOpen, setIsEditProductOpen] = useState(false);
  const [isCreateProductOpen, setIsCreateProductOpen] = useState(false);
  const [isManageVariantsOpen, setIsManageVariantsOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<BackendProduct | null>(null);
  const autoOpenedRef = useRef<string | null>(null);

  const loadProducts = useCallback(async () => {
    if (propsMockData) return;
    try {
      setIsLoadingProducts(true);
      setProductsError(null);
      const response = await fetchProducts({ page: 1, limit: 500 });
      setApiData((response.data || []).map(mapBackendProductToRow));
    } catch (error) {
      setProductsError(error instanceof Error ? error.message : 'Failed to load products');
      setApiData([]);
    } finally {
      setIsLoadingProducts(false);
    }
  }, [propsMockData]);

  useEffect(() => {
    void loadProducts();
  }, [loadProducts]);

  useEffect(() => {
    const refresh = () => void loadProducts();
    window.addEventListener('product-list:changed', refresh);
    return () => window.removeEventListener('product-list:changed', refresh);
  }, [loadProducts]);

  useEffect(() => {
    if (!initialProductId || autoOpenedRef.current === initialProductId) return;
    const row = data.find((item) => item.id === initialProductId);
    if (!row) return;
    setSelectedProduct(rowToBackendProduct(row));
    setIsProductDetailsOpen(true);
    autoOpenedRef.current = initialProductId;
  }, [data, initialProductId]);

  // Auto-open sheet based on displaySheet prop
  useEffect(() => {
    if (displaySheet) {
      switch (displaySheet) {
        case 'productDetails':
          setIsProductDetailsOpen(true);
          break;
        case 'createProduct':
          setIsCreateProductOpen(true);
          break;
        case 'editProduct':
          setIsEditProductOpen(true);
          break;
        case 'manageVariants':
          setIsManageVariantsOpen(true);
          break;
      }
    }
  }, [displaySheet]);

  const handleEditProduct = (product: IData) => {
    setSelectedProduct(rowToBackendProduct(product));
    setIsEditProductOpen(true);
  };

  const handleManageVariants = (product: IData) => {
    // You can add logic here to handle the selected product data
    console.log('Managing variants for product:', product);
    setIsManageVariantsOpen(true);
  };

  const handleViewDetails = (product: IData) => {
    setSelectedProduct(rowToBackendProduct(product));
    setIsProductDetailsOpen(true);
  };

  const ColumnInputFilter = <TData, TValue>({
    column,
  }: IColumnFilterProps<TData, TValue>) => {
    return (
      <Input
        placeholder="Filter..."
        value={(column.getFilterValue() as string) ?? ''}
        onChange={(event) => column.setFilterValue(event.target.value)}
        variant="sm"
        className="w-40"
      />
    );
  };

  const columns = useMemo<ColumnDef<IData>[]>(
    () => [
      {
        accessorKey: 'id',
        accessorFn: (row) => row.id,
        header: () => <DataGridTableRowSelectAll />,
        cell: ({ row }) => <DataGridTableRowSelect row={row} />,
        enableSorting: false,
        enableHiding: false,
        enableResizing: false,
        size: 40,
        meta: {
          cellClassName: '',
        },
      },
      {
        id: 'productInfo',
        accessorFn: (row) => row.productInfo,
        header: ({ column }) => (
          <DataGridColumnHeader
            title="Product Info"
            filter={<ColumnInputFilter column={column} />}
            column={column}
          />
        ),
        cell: (info) => {
          const productInfo = info.row.getValue('productInfo') as {
            image: string;
            title: string;
            label: string;
            tooltip: string;
          };

          return (
            <div className="flex items-center gap-2.5">
              <Card className="flex items-center justify-center rounded-md bg-accent/50 h-[40px] w-[50px] shadow-none shrink-0">
                <img
                  src={resolveProductImageSrc(productInfo.image)}
                  className="cursor-pointer h-[40px]"
                  alt="image"
                  onError={(event) => {
                    (event.currentTarget as HTMLImageElement).src = toAbsoluteUrl(
                      '/media/store/client/1200x1200/11.png',
                    );
                  }}
                />
              </Card>
              <div className="flex flex-col gap-1">
                {productInfo.title.length > 20 ? (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span
                          className="text-sm font-medium text-foreground leading-3.5 truncate max-w-[180px] cursor-pointer hover:text-primary transition-colors"
                          onClick={() => handleViewDetails(info.row.original)}
                        >
                          {productInfo.title}
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{productInfo.title}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ) : (
                  <span
                    className="text-sm font-medium text-foreground leading-3.5 cursor-pointer hover:text-primary transition-colors"
                    onClick={() => handleViewDetails(info.row.original)}
                  >
                    {productInfo.title}
                  </span>
                )}
                <span className="text-xs text-muted-foreground uppercase">
                  sku:{' '}
                  <span className="text-xs font-medium text-secondary-foreground">
                    {productInfo.label}
                  </span>
                </span>
              </div>
            </div>
          );
        },
        enableSorting: true,
        size: 260,
        meta: {
          cellClassName: '',
        },
      },
      {
        id: 'category',
        accessorFn: (row) => row.category,
        header: ({ column }) => (
          <DataGridColumnHeader title="Category" column={column} />
        ),
        cell: (info) => {
          return (
            <div>{info.row.original.category}</div>
          );
        },
        enableSorting: true,
        size: 110,
        meta: {
          cellClassName: '',
        },
      },
      {
        id: 'price',
        accessorFn: (row) => row.price,
        header: ({ column }) => (
          <DataGridColumnHeader title="Price" column={column} />
        ),
        cell: (info) => {
          return <div className="text-center">{info.row.original.price}</div>;
        },
        enableSorting: true,
        size: 80,
        meta: {
          cellClassName: '',
        },
      },
      {
        id: 'status',
        accessorFn: (row) => row.status,
        header: ({ column }) => (
          <DataGridColumnHeader title="Status" column={column} />
        ),
        cell: (info) => {
          const status = info.row.original.status;
          const variant = status.variant as keyof BadgeProps['variant'];
          return (
            <Badge
              variant={variant}
              appearance="light"
              className="rounded-full"
            >
              {status.label}
            </Badge>
          );
        },
        enableSorting: true,
        size: 90,
        meta: {
          cellClassName: '',
        },
      },
      {
        id: 'rating',
        accessorFn: () => {},
        header: ({ column }) => (
          <DataGridColumnHeader title="Rating" column={column} />
        ),
        cell: () => {
          return (
            <Badge
              size="sm"
              variant="warning"
              appearance="outline"
              className="rounded-full"
            >
              <Star className="text-[#FEC524]" fill="#FEC524" />
              5.0
            </Badge>
          );
        },
        enableSorting: true,
        size: 85,
        meta: {
          cellClassName: 'text-center',
        },
      },
      {
        id: 'created',
        accessorFn: (row) => row.created,
        header: ({ column }) => (
          <DataGridColumnHeader title="Created" column={column} />
        ),
        cell: (info) => {
          return info.row.original.created;
        },
        enableSorting: true,
        size: 120,
        meta: {
          cellClassName: '',
        },
      },
      {
        id: 'updated',
        accessorFn: (row) => row.updated,
        header: ({ column }) => (
          <DataGridColumnHeader title="Updated" column={column} />
        ),
        cell: (info) => {
          return info.row.original.updated;
        },
        enableSorting: true,
        size: 120,
        meta: {
          cellClassName: '',
        },
      },
      {
        id: 'actions',
        header: () => '',
        enableSorting: false,
        cell: ({ row }) => {
          return (
            <div className="flex items-center justify-center">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" mode="icon" size="sm" className="">
                    <EllipsisVertical />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" side="bottom">
                  <DropdownMenuItem onClick={() => handleEditProduct(row.original)}>
                    <Settings className="size-4" />
                    Edit Product
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleManageVariants(row.original)}>
                    <Layers className="size-4" />
                    Manage Variants
                  </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleViewDetails(row.original)}>
                      <Info className="size-4" />
                      View Details
                    </DropdownMenuItem>
                  <DropdownMenuItem
                    variant="destructive"
                    onClick={async () => {
                      try {
                        await deleteProduct(row.original.id);
                        toast.success('Product deleted');
                        window.dispatchEvent(new Event('product-list:changed'));
                      } catch (error) {
                        toast.error(error instanceof Error ? error.message : 'Failed to delete product');
                      }
                    }}
                  >
                    <Trash className="size-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          );
        },
        size: 80,
      },
    ],
    [], // Same columns for all tabs
  );

  // Apply search, tab, and last moved filters
  const filteredData = useMemo(() => {
    let result = [...data];

    // Apply tab filter based on tabs array ids
    if (activeTab === 'all') {
      result = result; // No filter, show all data
    } else if (activeTab === 'live') {
      result = result.filter((item) => item.status.label === 'Live');
    } else if (activeTab === 'draft') {
      result = result.filter((item) => item.status.label === 'Draft');
    } else if (activeTab === 'archived') {
      result = result.filter((item) => item.status.label === 'Archived');
    } else if (activeTab === 'actionNeeded') {
      result = result.filter((item) => item.created > '2023-01-01');
    }

    // Apply search filter - only search in product title
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter((item) =>
        item.productInfo.title.toLowerCase().includes(query),
      );
    }

    return result;
  }, [data, activeTab, searchQuery]);

  useEffect(() => {
    const selectedRowIds = Object.keys(rowSelection);
    if (selectedRowIds.length > 0) {
      toast.custom(
        (t) => (
          <Alert
            variant="mono"
            icon="success"
            close={true}
            onClose={() => toast.dismiss(t)}
          >
            <AlertIcon>
              <Info />
            </AlertIcon>
            <AlertTitle>
              Selected row IDs: {selectedRowIds.join(', ')}
            </AlertTitle>
          </Alert>
        ),
        {
          duration: 5000,
        },
      );
    }
  }, [rowSelection]);

  // Reset to first page when filters change
  useEffect(() => {
    setPagination((prev) => ({
      ...prev,
      pageIndex: 0,
    }));
  }, [activeTab, searchQuery, selectedLastMoved]);

  // Sync inputValue with searchQuery when searchQuery changes externally
  useEffect(() => {
    setInputValue(searchQuery);
  }, [searchQuery]);

  const table = useReactTable({
    data: filteredData,
    columns,
    state: {
      pagination: {
        pageIndex: pagination.pageIndex,
        pageSize: 10, // Fixed 10 items per page
      },
      sorting,
      rowSelection,
    },
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
    debugTable: true,
    debugHeaders: true,
    debugColumns: true,
  });

  const tabs = [
    { id: 'all', label: 'All', badge: 1424 },
    { id: 'live', label: 'Live', badge: 1267 },
    { id: 'draft', label: 'Draft', badge: 63 },
    { id: 'archived', label: 'Archived', badge: 185 },
    { id: 'actionNeeded', label: 'Action Needed', badge: 49 },
  ];

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    // Reset to first page when changing tabs
    setPagination((prev) => ({
      ...prev,
      pageIndex: 0,
    }));
  };

  // Search input handlers
  const handleClearInput = () => {
    setInputValue('');
    setSearchQuery('');
    inputRef.current?.focus();
  };

  return (
    <div>
      <Card>
        {isLoadingProducts && !propsMockData && (
          <Alert icon="info">
            <AlertIcon>
              <Info />
            </AlertIcon>
            <AlertTitle>Loading products from database...</AlertTitle>
          </Alert>
        )}

        {productsError && !propsMockData && (
          <Alert variant="destructive">
            <AlertIcon>
              <Info />
            </AlertIcon>
            <AlertTitle>{productsError}</AlertTitle>
          </Alert>
        )}
        <CardHeader className="py-3 flex-nowrap">
          <Tabs
            value={activeTab}
            onValueChange={handleTabChange}
            className="m-0 p-0 w-full"
          >
            <TabsList className="h-auto p-0 bg-transparent border-b-0 border-border rounded-none -ms-[3px] w-full">
              <div className="flex items-center gap-1 min-w-max">
                {tabs.map((tab) => (
                  <TabsTrigger
                    key={tab.id}
                    value={tab.id}
                    className={cn(
                      "relative text-foreground px-2 hover:text-primary data-[state=active]:text-primary data-[state=active]:shadow-none", 
                      activeTab === tab.id ? 'font-medium' : 'font-normal')
                    }
                  >
                    <div className="flex items-center gap-2">
                      {tab.label}
                      <Badge
                        size="sm"
                        variant={activeTab === tab.id ? 'primary' : 'outline'}
                        appearance="outline"
                        className={cn("rounded-full", activeTab === tab.id ? '' : 'bg-muted/60')}
                      >
                        {tab.badge}
                      </Badge>
                    </div>
                    {activeTab === tab.id && (
                      <div className="absolute bottom-0 left-0 right-0 h-px bg-primary -mb-[14px]" />
                    )}
                  </TabsTrigger>
                ))}
              </div>
            </TabsList>
          </Tabs>
          <CardToolbar className="flex items-center gap-2">
            {/* Search */}
            <div className="w-full max-w-[200px]">
              <InputWrapper>
                <Search />
                <Input
                  placeholder="Search..."
                  ref={inputRef}
                  value={inputValue}
                  onChange={(e) => {
                    setInputValue(e.target.value);
                    setSearchQuery(e.target.value);
                  }}
                  onMouseDown={(e) => e.stopPropagation()}
                  onKeyDown={(e) => e.stopPropagation()}
                />
                <Button
                  onClick={handleClearInput}
                  variant="dim"
                  className="-me-4"
                  disabled={inputValue === ''}
                >
                  {inputValue !== '' && <X size={16} />}
                </Button>
              </InputWrapper>
            </div>

            {/* Filter */}
            <DataGridColumnVisibility
              table={table}
              trigger={
                <Button variant="outline">
                  <Filter className="size-3.5" />
                  Filters
                </Button>
              }
            />
          </CardToolbar>
        </CardHeader>

        {/* Tab Contents */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          {tabs.map((tab) => (
            <TabsContent
              key={`content-${tab.id}`}
              value={tab.id}
              className="mt-0"
            >
              <DataGrid
                table={table}
                recordCount={filteredData?.length || 0}
                onRowClick={
                  onRowClick ? (row: IData) => onRowClick(row.id) : undefined
                }
                tableLayout={{
                  columnsPinnable: true,
                  columnsMovable: true,
                  columnsVisibility: true,
                  cellBorder: true,
                }}
              >
                <CardTable>
                  <ScrollArea>
                    <DataGridTable />
                    <ScrollBar orientation="horizontal" />
                  </ScrollArea>
                </CardTable>
                <CardFooter>
                  <DataGridPagination />
                </CardFooter>
              </DataGrid>
            </TabsContent>
          ))}
        </Tabs>
      </Card>

      {/* Product Details Modal */}
      <ProductDetailsAnalyticsSheet
        open={isProductDetailsOpen}
        onOpenChange={setIsProductDetailsOpen}
        product={selectedProduct}
      />

      {/* Edit Product Modal */}
      <ProductFormSheet
        mode="edit"
        open={isEditProductOpen}
        onOpenChange={setIsEditProductOpen}
        initialProduct={selectedProduct}
        onSaved={() => {
          void loadProducts();
          setIsEditProductOpen(false);
        }}
      />

      {/* Create Product Modal */}
      <ProductFormSheet
        mode="new"  
        open={isCreateProductOpen}
        onOpenChange={setIsCreateProductOpen}
        onSaved={() => {
          void loadProducts();
          setIsCreateProductOpen(false);
        }}
      />

      {/* Manage Variants Modal */}
      <ManageVariantsSheet
        open={isManageVariantsOpen}
        onOpenChange={setIsManageVariantsOpen}
      />
    </div>
  );
}
