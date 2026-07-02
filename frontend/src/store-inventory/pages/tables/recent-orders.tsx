'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Column,
  ColumnDef,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  PaginationState,
  RowSelectionState,
  SortingState,
  useReactTable,
} from '@tanstack/react-table';
import { Info, Search, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
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
  CardTitle,
  CardToolbar,
} from '@/components/ui/card';
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
import { fetchOrders, type BackendOrder } from '@/crm/services/backend';

interface IColumnFilterProps<TData, TValue> {
  column: Column<TData, TValue>;
}

interface IData {
  id: string; // Use string for ID
  date: string;
  customer: string;
  orderId: string;
  paymentMethod: string;
  country: ICountry;
  label: string;
  variant: string;
  amount: string;
}

interface ICountry {
  name: string;
  flag: string;
}

const data: IData[] = [];

const DashboardTable = () => {
  const navigate = useNavigate();
  const [apiData, setApiData] = useState<IData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [rowSelection] = useState<RowSelectionState>({});
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'date', desc: true },
  ]);
  const inputRef = useRef<HTMLInputElement>(null);

  const ColumnInputFilter = <TData, TValue>({
    column,
  }: IColumnFilterProps<TData, TValue>) => {
    return (
      <Input
        placeholder="Filter..."
        value={(column.getFilterValue() as string) ?? ''}
        onChange={(event) => column.setFilterValue(event.target.value)}
        variant="sm"
        className="max-w-40"
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
        size: 48,
        meta: {
          cellClassName: '',
        },
      },
      {
        id: 'orderId',
        accessorFn: (row) => row.orderId,
        header: ({ column }) => (
          <DataGridColumnHeader
            title="Order ID"
            filter={<ColumnInputFilter column={column} />}
            column={column}
          />
        ),
        cell: (info) => {
          return info.row.original.orderId;
        },
        enableSorting: true,
        size: 210,
        meta: {
          cellClassName: '',
        },
      },
      {
        id: 'date',
        accessorFn: (row) => row.date,
        header: ({ column }) => (
          <DataGridColumnHeader title="Date" column={column} />
        ),
        cell: (info) => {
          return info.row.original.date;
        },
        enableSorting: true,
        size: 170,
        meta: {
          cellClassName: '',
        },
      },
      {
        id: 'customer',
        accessorFn: (row) => row.customer,
        header: ({ column }) => (
          <DataGridColumnHeader title="Customer" column={column} />
        ),
        cell: (info) => {
          return info.row.original.customer;
        },
        enableSorting: true,
        size: 160,
        meta: {
          cellClassName: '',
        },
      },
      {
        id: 'amount',
        accessorFn: (row) => row.amount,
        header: ({ column }) => (
          <DataGridColumnHeader title="Amount" column={column} />
        ),
        cell: (info) => {
          return info.row.original.amount;
        },
        enableSorting: true,
        size: 160,
        meta: {
          cellClassName: '',
        },
      },
      {
        id: 'paymentMethod',
        accessorFn: (row) => row.paymentMethod,
        header: ({ column }) => (
          <DataGridColumnHeader title="Payment Method" column={column} />
        ),
        cell: (info) => {
          return info.row.original.paymentMethod;
        },
        enableSorting: true,
        size: 160,
        meta: {
          cellClassName: '',
        },
      },
      {
        id: 'country',
        accessorFn: (row) => row.country,
        header: ({ column }) => (
          <DataGridColumnHeader title="Country" column={column} />
        ),
        cell: (info) => {
          return (
            <div className="flex items-center gap-1.5">
              <img
                src={toAbsoluteUrl(
                  `/media/flags/${info.row.original.country.flag}`,
                )}
                className="h-4 rounded-full"
                alt="image"
              />
              <span className="leading-none text-secondary-foreground">
                {info.row.original.country.name}
              </span>
            </div>
          );
        },
        enableSorting: true,
        size: 160,
        meta: {
          cellClassName: '',
        },
      },
      {
        id: 'label',
        accessorFn: (row) => row.label,
        header: ({ column }) => (
          <DataGridColumnHeader title="Order Status" column={column} />
        ),
        cell: (info) => {
          const variant = info.row.original
            .variant as keyof BadgeProps['variant'];

          return (
            <Badge variant={variant} appearance="light">
              {info.row.original.label}
            </Badge>
          );
        },
        enableSorting: true,
        size: 150,
        meta: {
          cellClassName: '',
        },
      },
      {
        id: 'actions',
        header: () => '',
        enableSorting: false,
        cell: (info) => {
          return (
            <Button
              mode="link"
              underlined="dashed"
              onClick={() => {
                navigate(`/core/order-details?orderId=${encodeURIComponent(info.row.original.id)}`);
              }}
            >
              Details
            </Button>
          );
        },
        size: 90,
      },
    ],
    [],
  );

  const filteredData: IData[] = useMemo(() => {
    const source = apiData.length > 0 ? apiData : [];
    if (!searchQuery) return source;

    const query = searchQuery.toLowerCase();
    return source.filter((item) => {
      return item.id.toLowerCase().includes(query) || item.orderId.toLowerCase().includes(query);
    });
  }, [apiData, searchQuery]);

  useEffect(() => {
    let active = true;
    const mapStatus = (status?: string) => {
      const normalized = (status || '').toLowerCase();
      if (normalized === 'delivered' || normalized === 'shipped') return { label: 'Delivered', variant: 'success' };
      if (normalized === 'processing' || normalized === 'pending') return { label: 'Pending', variant: 'warning' };
      if (normalized === 'canceled' || normalized === 'cancelled' || normalized === 'failed') {
        return { label: 'Cancelled', variant: 'destructive' };
      }
      return { label: 'Pending', variant: 'warning' };
    };

    const mapOrder = (row: BackendOrder): IData => {
      const status = mapStatus(row.deliveryStatus || row.paymentStatus);
      const parsed = new Date(row.orderDate);
      const date = Number.isNaN(parsed.getTime())
        ? row.orderDate
        : parsed.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });
      return {
        id: row.id,
        orderId: row.orderNumber || row.id.slice(0, 8),
        date,
        customer: row.customerName || 'Customer',
        amount: new Intl.NumberFormat('cs-CZ', { style: 'currency', currency: row.currency || 'CZK' }).format(
          Number(row.total || 0),
        ),
        paymentMethod: row.paymentStatus || 'Card',
        country: {
          name: 'Czech Republic',
          flag: 'czech-republic.svg',
        },
        label: status.label,
        variant: status.variant,
      };
    };

    const load = async () => {
      try {
        setIsLoading(true);
        const response = await fetchOrders({ page: 1, limit: 200 });
        if (!active) return;
        setApiData((response.data || []).map(mapOrder));
      } catch {
        if (!active) return;
        setApiData([]);
      } finally {
        if (active) setIsLoading(false);
      }
    };

    void load();
    const refresh = () => void load();
    window.addEventListener('order-list:changed', refresh);
    return () => {
      active = false;
      window.removeEventListener('order-list:changed', refresh);
    };
  }, []);

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
    columns,
    data: filteredData,
    pageCount: Math.ceil((filteredData?.length || 0) / pagination.pageSize),
    getRowId: (row: IData) => row.id,
    state: {
      pagination,
      sorting,
    },
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const Toolbar = () => {
    const [inputValue, setInputValue] = useState('');

    // Sync inputValue with searchQuery when searchQuery changes externally
    useEffect(() => {
      setInputValue(searchQuery);
    }, []);

    // Update search query when input changes
    useEffect(() => {
      const timer = setTimeout(() => {
        if (inputValue !== searchQuery) {
          setSearchQuery(inputValue);
        }
      }, 300);

      return () => clearTimeout(timer);
    }, [inputValue]);

    return (
      <CardToolbar>
        {/* Search */}
        <div className="w-full max-w-[200px]">
          <InputWrapper>
            <Search />
            <Input
              placeholder="Search by ID"
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
              onClick={() => setInputValue('')}
              variant="dim"
              className="-me-4"
              disabled={inputValue === ''}
            >
              {inputValue !== '' && <X size={16} />}
            </Button>
          </InputWrapper>
        </div>
        <Button variant="outline">Export CSV</Button>
      </CardToolbar>
    );
  };

  return (
    <DataGrid
      table={table}
      recordCount={filteredData?.length || 0}
      tableLayout={{
        columnsPinnable: true,
        columnsMovable: true,
        columnsVisibility: true,
        cellBorder: true,
      }}
    >
      <Card>
        <CardHeader className="py-3.5">
          <CardTitle>Recent Orders</CardTitle>
          <Toolbar />
        </CardHeader>
        <CardTable>
          <ScrollArea>
            <DataGridTable />
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </CardTable>
        <CardFooter>
          {isLoading && <span className="text-xs text-muted-foreground">Loading...</span>}
          <DataGridPagination />
        </CardFooter>
      </Card>
    </DataGrid>
  );
};

export { DashboardTable };
