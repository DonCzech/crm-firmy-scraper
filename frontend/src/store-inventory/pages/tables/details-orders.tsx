'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  ColumnDef,
  ExpandedState,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  PaginationState,
  RowSelectionState,
  SortingState,
  useReactTable,
} from '@tanstack/react-table';
import { EllipsisVertical, Info, SquareMinus, SquarePlus, Trash } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Alert, AlertIcon, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toAbsoluteUrl } from '@/lib/helpers';
import {
  Card,
  CardFooter,
  CardTable,
} from '@/components/ui/card';
import { DataGrid } from '@/components/ui/data-grid';
import { DataGridColumnHeader } from '@/components/ui/data-grid-column-header';
import { DataGridPagination } from '@/components/ui/data-grid-pagination';
import {
  DataGridTable,
} from '@/components/ui/data-grid-table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { CreateShippingLabelSheet } from '../components/create-shipping-label-sheet';
import { TrackShippingSheet } from '../components/track-shipping-sheet';
import { ProductInfoSheet } from '../components/product-info-sheet';
import type { VariantProps } from 'class-variance-authority';
import { Settings, Pencil } from 'lucide-react';
import { DropdownMenuLabel, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { fetchOrders, type BackendOrder } from '@/crm/services/backend';

// ---- DATA TYPE ----
export interface OrderItemData {
  id: string;
  productInfo: {
    image: string;
    title: string;
    label: string;
    tooltip: string;
  };
  category: string;
  price: string;
  trends: {
    label: string;
    variant: VariantProps<typeof Badge>['variant'];
  };
  stock: number;
  reserved: number;
  thresholdLevel: number;
  supplier: {
    name: string;
    logo: string;
  };
}

export interface DetailsOrdersData {
  date: string;
  order: string;
  id: string;
  total: string;
  paymentStatus: {
    label: string;
    variant: VariantProps<typeof Badge>['variant'];
  };
  items: number;
  carrier: {
    name: string;
    logo: string;
  };
  category: string;
}

interface DetailsOrdersProps {
  mockData?: DetailsOrdersData[];
  displayProducts?: boolean;
}

function formatOrderDate(value: string): string {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });
}

function mapPaymentStatus(status?: string): DetailsOrdersData['paymentStatus'] {
  const normalized = (status || '').toLowerCase();
  if (normalized === 'paid') return { label: 'Paid', variant: 'success' };
  if (normalized === 'failed' || normalized === 'cancelled') return { label: 'Failed', variant: 'destructive' };
  if (normalized === 'refunded') return { label: 'Refunded', variant: 'secondary' };
  return { label: 'Pending', variant: 'info' };
}

function mapBackendOrderToDetails(row: BackendOrder): DetailsOrdersData {
  return {
    id: row.id,
    order: row.orderNumber || row.id.slice(0, 8),
    date: formatOrderDate(row.orderDate),
    total: new Intl.NumberFormat('cs-CZ', { style: 'currency', currency: row.currency || 'CZK' }).format(
      Number(row.total || 0),
    ),
    paymentStatus: mapPaymentStatus(row.paymentStatus),
    items: (row.items || []).reduce((sum, item) => sum + Number(item.quantity || 0), 0),
    carrier: {
      name: row.carrierName || 'Carrier',
      logo: row.carrierLogo || 'ups.svg',
    },
    category: row.category || 'General',
  };
}

// ---- MOCK DATA ----
const orderItemsMockData: OrderItemData[] = [];

const mockData: DetailsOrdersData[] = [];


// ---- MAIN TABLE COMPONENT ----
export function DetailsOrdersTable({ mockData: propsMockData, displayProducts = false }: DetailsOrdersProps & { displayProducts?: boolean }) {
  const navigate = useNavigate();
  const [apiData, setApiData] = useState<DetailsOrdersData[]>([]);
  const rawData = propsMockData ?? apiData;

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 6,
  });
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [sorting, setSorting] = useState<SortingState>([]);
  const [expandedRows, setExpandedRows] = useState<ExpandedState>({});

  const [trackShippingSheetOpen, setTrackShippingSheetOpen] = useState(false);

  const [createShippingSheetOpen, setCreateShippingSheetOpen] = useState(false);

  const [productInfoSheetOpen, setProductInfoSheetOpen] = useState(false);

  const [createModalData] = useState<DetailsOrdersData | null>(null);

  useEffect(() => {
    if (propsMockData) return;
    let active = true;
    const load = async () => {
      try {
        const response = await fetchOrders({ page: 1, limit: 200 });
        if (!active) return;
        setApiData((response.data || []).map(mapBackendOrderToDetails));
      } catch {
        if (!active) return;
        setApiData([]);
      }
    };
    void load();
    return () => {
      active = false;
    };
  }, [propsMockData]);

  // --- DATA ---
  const filteredData = rawData;

  // Auto-expand first row when displayProducts is true
  useEffect(() => {
    if (displayProducts && filteredData.length > 0) {
      setExpandedRows({ [filteredData[0].id]: true });
    } else if (!displayProducts) {
      // Clear expanded rows when displayProducts is false
      setExpandedRows({});
    }
  }, [displayProducts, filteredData]);

  // --- COLUMNS ---
  const columns = useMemo<ColumnDef<DetailsOrdersData>[]>(
    () => [
      {
        id: 'order',
        accessorFn: (row) => row.order,
        header: ({ column }) => (
          <DataGridColumnHeader title="OrderID" column={column} />
        ),
        cell: (info) => (
          <button
            type="button"
            className="text-2sm text-primary font-normal"
            onClick={() =>
              navigate(`/core/order-details?orderId=${encodeURIComponent(info.row.original.id)}`)
            }
          >
            {info.row.original.order}
          </button>
        ),
        enableSorting: true,
        size: 120,
      },
      {
        id: 'date',
        accessorFn: (row) => row.date,
        header: ({ column }) => (
          <DataGridColumnHeader title="Date" column={column} />
        ),
        cell: (info) => info.row.original.date,
        enableSorting: true,
        size: 120,
      },
      {
        id: 'total',
        accessorFn: (row) => row.total,
        header: ({ column }) => (
          <DataGridColumnHeader title="Total" column={column} />
        ),
        cell: (info) => info.row.original.total,
        enableSorting: true,
        size: 100,
      },
      {
        id: 'paymentStatus',
        accessorFn: (row) => row.paymentStatus,
        header: ({ column }) => (
          <DataGridColumnHeader title="Payment St." column={column} />
        ),
        cell: (info) => {
          const ps = info.row.original.paymentStatus;
          return (
            <Badge variant={ps.variant} appearance="light">
              {ps.label}
            </Badge>
          );
        },
        enableSorting: true,
        size: 100,
      },
      {
        id: 'items',
        accessorFn: (row) => row.items,
        header: ({ column }) => (
          <DataGridColumnHeader title="Items" column={column} />
        ),
        cell: (info) => (
          <div 
            className="cursor-pointer hover:text-primary transition-colors"
            onClick={() => info.row.getToggleExpandedHandler()()}
          >
            {info.row.original.items} items
          </div>
        ),
        enableSorting: true,
        size: 100,
      },
      {
        id: 'carrier',
        accessorFn: (row) => row.carrier,
        header: ({ column }) => (
          <DataGridColumnHeader title="Carrier" column={column} />
        ),
        cell: (info) => (
          <Button variant="outline" size="sm" onClick={() => setTrackShippingSheetOpen(true)}>
            <img
              src={toAbsoluteUrl(`/media/brand-logos/${info.row.original.carrier.logo}`)}
              className="h-3.5 rounded-full"
              alt={info.row.original.carrier.name}
            />
            
            {info.row.original.carrier.name}
          </Button>
        ),
        enableSorting: true,
        size: 140,
      },
      {
        id: 'actions',
        header: ({ column }) => (
          <DataGridColumnHeader title="Actions" column={column} />
        ),
        enableSorting: false,
        cell: ({row}) => (
          <div className="flex grow justify-center items-center gap-1.5">
            <Button
                className="size-6 text-muted-foreground"
                onClick={(e) => {
                  e.stopPropagation();
                  row.getToggleExpandedHandler()();
                }}
                variant="ghost" 
                mode="icon" 
                size="sm"
            >
              {row.getIsExpanded() ? <SquareMinus /> : <SquarePlus />}
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" mode="icon" size="sm" >
                  <EllipsisVertical />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" side="bottom">
                <DropdownMenuLabel>Order Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() =>
                    navigate(`/core/order-details?orderId=${encodeURIComponent(row.original.id)}`)
                  }
                >
                  <Info />
                  View Details
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTrackShippingSheetOpen(true)}>
                  <Pencil />
                  Track Shipping
                </DropdownMenuItem>
                {displayProducts && (
                  <DropdownMenuItem onClick={() => setProductInfoSheetOpen(true)}>
                    <SquarePlus />
                    View Products
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Settings />
                  Edit Order
                </DropdownMenuItem>
                <DropdownMenuItem variant="destructive">
                  <Trash />
                  Cancel Order
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ),
        size: 80,
          meta: {
           expandedContent: (row) => <OrderListTable rowData={row} />,
         },
      },
    ],
    [displayProducts, navigate],
  );

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

  const table = useReactTable({ 
    data: filteredData,
    columns,
    state: {
      pagination,
      sorting,
      rowSelection,
      expanded: expandedRows,
    },
    getRowId: (row: DetailsOrdersData) => row.id,
    getRowCanExpand: (row) => Boolean(row.original.id),
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    onExpandedChange: setExpandedRows,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
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
      <TrackShippingSheet
        open={trackShippingSheetOpen}
        onOpenChange={setTrackShippingSheetOpen}
      />

      {createModalData && (
        <CreateShippingLabelSheet
          open={createShippingSheetOpen}
          onOpenChange={setCreateShippingSheetOpen}
          data={createModalData}
        />
      )}

      {productInfoSheetOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="rounded-lg p-6 w-full mx-4 overflow-y-auto bg-[#FAFAFA]">
            <ProductInfoSheet
              mockData={[]}
            />
          </div>
        </div>
      )}

      <Card>

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
  );
}

// ---- ORDER ITEMS SUB TABLE COMPONENT ----
interface OrderListTableProps {
  rowData?: unknown;
}

function OrderListTable({}: OrderListTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);

  const columns = useMemo<ColumnDef<OrderItemData>[]>(
    () => [
      {
        id: 'productInfo',
        accessorFn: (row) => row.productInfo,
        header: ({ column }) => (
          <DataGridColumnHeader title="Product Info" column={column} />
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
                  src={toAbsoluteUrl(
                    `/media/store/client/1200x1200/${productInfo.image}`,
                  )}
                  className="cursor-pointer h-[40px]"
                  alt="image"
                />
              </Card>
              <div className="flex flex-col gap-1">
                {productInfo.title.length > 20 ? (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span
                          className="text-sm font-medium text-foreground leading-3.5 truncate max-w-[180px] cursor-pointer hover:text-primary transition-colors"
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
        size: 250,
      },
      {
        id: 'category',
        accessorFn: (row) => row.category,
        header: ({ column }) => (
          <DataGridColumnHeader title="Category" column={column} />
        ),
        cell: (info) => info.row.original.category,
        enableSorting: true,
        size: 100,
      },
      {
        id: 'price',
        accessorFn: (row) => row.price,
        header: ({ column }) => (
          <DataGridColumnHeader title="Price" column={column} />
        ),
        cell: (info) => info.row.original.price,
        enableSorting: true,
        size: 80,
      },
      {
        id: 'trends',
        accessorFn: (row) => row.trends,
        header: ({ column }) => (
          <DataGridColumnHeader title="Trends" column={column} />
        ),
        cell: (info) => {
          const trends = info.row.original.trends;
          return (
            <Badge variant={trends.variant} appearance="light">
              {trends.label}
            </Badge>
          );
        },
        enableSorting: true,
        size: 125,
      },
      {
        id: 'stock',
        accessorFn: (row) => row.stock,
        header: ({ column }) => (
          <DataGridColumnHeader title="Stock" column={column} />
        ),
        cell: (info) => info.row.original.stock,
        enableSorting: true,
        size: 80,
      },
      {
        id: 'reserved',
        accessorFn: (row) => row.reserved,
        header: ({ column }) => (
          <DataGridColumnHeader title="Rsvd" column={column} />
        ),
        cell: (info) => info.row.original.reserved,
        enableSorting: true,
        size: 80,
      },
      {
        id: 'thresholdLevel',
        accessorFn: (row) => row.thresholdLevel,
        header: ({ column }) => (
          <DataGridColumnHeader title="T-Lvl" column={column} />
        ),
        cell: (info) => info.row.original.thresholdLevel,
        enableSorting: true,
        size: 80,
      },
      {
        id: 'supplier',
        accessorFn: (row) => row.supplier,
        header: ({ column }) => (
          <DataGridColumnHeader title="Supplier" column={column} />
        ),
        cell: (info) => {
          return (
            <div className="flex items-center gap-1.5">
              <img
                src={toAbsoluteUrl(
                  `/media/brand-logos/${info.row.original.supplier.logo}`,
                )}
                className="h-6 rounded-full"
                alt="image"
              />
              <span className="leading-none text-secondary-foreground">
                {info.row.original.supplier.name}
              </span>
            </div>
          );
        },
        enableSorting: true,
        size: 160,
      },
    ],
    [],
  );

  const table = useReactTable({
    data: orderItemsMockData,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getRowId: (row: OrderItemData) => row.id,
  });

  return (
    <div className="bg-muted/30 p-5">
      <div className="bg-card rounded-lg border border-muted-foreground/22 overflow-x-auto">
        <DataGrid
          table={table}
          recordCount={orderItemsMockData.length}
          tableLayout={{
            cellBorder: true,
            rowBorder: true,
            headerBackground: true,
            headerBorder: true,
          }}
        >
          <DataGridTable />
        </DataGrid>
      </div>
    </div>
  );
}
