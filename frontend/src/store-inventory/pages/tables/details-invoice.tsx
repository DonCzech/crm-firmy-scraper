'use client';

import { useEffect, useMemo, useState } from 'react';
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
import { Download, EllipsisVertical, Info, Trash } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Alert, AlertIcon, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
import type { VariantProps } from 'class-variance-authority';
import { Settings, Pencil } from 'lucide-react';
import { DropdownMenuLabel, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { fetchInvoices, type BackendInvoice } from '@/crm/services/backend';

// ---- DATA TYPE ----

export interface DetailsInvoiceData {
  invoice: string;
  date: string;
  dueDate: string;
  id: string;
  total: string;
  paymentStatus: {
    label: string;
    variant: VariantProps<typeof Badge>['variant'];
  };
}

interface DetailsInvoiceProps {
  mockData?: DetailsInvoiceData[];
  displayProducts?: boolean;
}

function formatInvoiceDate(value: string): string {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });
}

function mapInvoiceStatus(status?: string): DetailsInvoiceData['paymentStatus'] {
  const normalized = (status || '').toLowerCase();
  if (normalized === 'paid') return { label: 'Paid', variant: 'success' };
  if (normalized === 'overdue') return { label: 'Overdue', variant: 'destructive' };
  if (normalized === 'cancelled') return { label: 'Cancelled', variant: 'destructive' };
  return { label: 'Pending', variant: 'info' };
}

function mapBackendInvoiceToDetails(row: BackendInvoice): DetailsInvoiceData {
  return {
    id: row.id,
    invoice: row.invoiceNumber || row.id.slice(0, 8),
    date: formatInvoiceDate(row.issueDate),
    dueDate: formatInvoiceDate(row.dueDate),
    total: new Intl.NumberFormat('cs-CZ', { style: 'currency', currency: row.currency || 'CZK' }).format(
      Number(row.total || 0),
    ),
    paymentStatus: mapInvoiceStatus(row.status),
  };
}


const mockData: DetailsInvoiceData[] = [];


// ---- MAIN TABLE COMPONENT ----
export function DetailsInvoiceTable({ mockData: propsMockData }: DetailsInvoiceProps) {
  const navigate = useNavigate();
  const [apiData, setApiData] = useState<DetailsInvoiceData[]>([]);
  const rawData = propsMockData ?? apiData;

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 5,
  });
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [sorting, setSorting] = useState<SortingState>([]);

  const [trackShippingSheetOpen, setTrackShippingSheetOpen] = useState(false);

  const [createShippingSheetOpen, setCreateShippingSheetOpen] = useState(false);


  const [createModalData] = useState<DetailsInvoiceData | null>(null);

  useEffect(() => {
    if (propsMockData) return;
    let active = true;
    const load = async () => {
      try {
        const response = await fetchInvoices({ page: 1, limit: 200 });
        if (!active) return;
        setApiData((response.data || []).map(mapBackendInvoiceToDetails));
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

  // Use raw data directly without filtering
  const filteredData = rawData;


  // --- COLUMNS ---
  const columns = useMemo<ColumnDef<DetailsInvoiceData>[]>(
    () => [
      {
        id: 'invoice',
        accessorFn: (row) => row.invoice,
        header: ({ column }) => (
          <DataGridColumnHeader title="InvoiceID" column={column} />
        ),
        cell: (info) => (
          <button
            type="button"
            className="text-2sm text-primary font-normal"
            onClick={() =>
              navigate(`/core/order-details?orderId=${encodeURIComponent(info.row.original.id)}`)
            }
          >
            {info.row.original.invoice}
          </button>
        ),
        enableSorting: true,
        size: 100,
      },
      {
        id: 'date',
        accessorFn: (row) => row.date,
        header: ({ column }) => (
          <DataGridColumnHeader title="Date" column={column} />
        ),
        cell: (info) => info.row.original.date,
        enableSorting: true,
        size: 110,
      },
      {
        id: 'dueDate',
        accessorFn: (row) => row.dueDate,
        header: ({ column }) => (
          <DataGridColumnHeader title="Due Date" column={column} />
        ),
        cell: (info) => info.row.original.dueDate,
        enableSorting: true,
        size: 110,
      },
      {
        id: 'total',
        accessorFn: (row) => row.total,
        header: ({ column }) => (
          <DataGridColumnHeader title="Total" column={column} />
        ),
        cell: (info) => info.row.original.total,
        enableSorting: true,
        size: 90,
      },
      {
        id: 'paymentStatus',
        accessorFn: (row) => row.paymentStatus,
        header: ({ column }) => (
          <DataGridColumnHeader title="Status" column={column} />
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
        size: 80,
      },
      {
        id: 'actions',
        header: ({ column }) => (
          <DataGridColumnHeader title="" column={column} />
        ),
        enableSorting: false,
        cell: (info) => (
          <div className="flex grow justify-center items-center gap-1.5">
              <Button
                 variant="ghost"
                 size="sm"
                 onClick={() =>
                   navigate(`/core/order-details?orderId=${encodeURIComponent(info.row.original.id)}`)
                 }
                 title="View category"
               >
                 <Download />
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
                    navigate(`/core/order-details?orderId=${encodeURIComponent(info.row.original.id)}`)
                  }
                >
                  <Info />
                  View Details
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTrackShippingSheetOpen(true)}>
                  <Pencil />
                  Track Shipping
                </DropdownMenuItem>
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
        size: 60,
      },
    ],
    [navigate],
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
    },
    getRowId: (row: DetailsInvoiceData) => row.id,
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
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
