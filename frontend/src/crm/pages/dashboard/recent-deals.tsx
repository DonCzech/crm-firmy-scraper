import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ColumnDef,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  PaginationState,
  SortingState,
  useReactTable,
} from '@tanstack/react-table';
import {
  AlertCircle,
  Building2,
  CheckCircle,
  Clock,
  Copy,
  DollarSign,
  Edit,
  Eye,
  Filter,
  MoreHorizontal,
  Package,
  Search,
  Settings2,
  Target,
  Trash2,
  User,
  X,
  XCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { deleteDeal, fetchDeals, formatPersonName } from '@/crm/services/backend';
import { DataGridLoadingRows } from '@/crm/components/data-grid-loading-rows';
import { DataGridLoadingFooter } from '@/crm/components/data-grid-loading-footer';
import { useGridSearch } from '@/crm/hooks/use-grid-search';
import { CRM_DEALS_REFRESH_EVENT, dispatchCrmEvent } from '@/crm/services/events';
import { logFrontendError } from '@/crm/services/frontend-logger';
import { avatarFromId } from '@/crm/services/mappers';
import { toAbsoluteUrl } from '@/lib/helpers';
import { useNavigate } from 'react-router-dom';
import { Alert, AlertIcon, AlertTitle } from '@/components/ui/alert';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge, BadgeProps } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardFooter,
  CardHeader,
  CardHeading,
  CardTable,
  CardToolbar,
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input, InputWrapper } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { useLanguage } from '@/localization/language-context';

interface Deal {
  id: string;
  dealNumber: string;
  contact: {
    name: string;
    email: string;
    avatar: string;
    company: string;
  };
  dealDetails: Array<{
    name: string;
    description: string;
    value: number;
  }>;
  total: number;
  status:
    | 'prospecting'
    | 'qualification'
    | 'proposal'
    | 'negotiation'
    | 'closed_won'
    | 'closed_lost';
  paymentStatus: 'paid' | 'pending' | 'failed';
  company: string;
  dealDate: Date;
  expectedClose: Date;
  priority: 'low' | 'medium' | 'high';
}


const dealStatuses = [
  {
    id: 'prospecting',
    name: 'Prospecting',
    variant: 'secondary',
    icon: Target,
  },
  { id: 'qualification', name: 'Qualification', variant: 'info', icon: User },
  { id: 'proposal', name: 'Proposal', variant: 'warning', icon: Package },
  { id: 'negotiation', name: 'Negotiation', variant: 'warning', icon: Clock },
  {
    id: 'closed_won',
    name: 'Closed Won',
    variant: 'success',
    icon: CheckCircle,
  },
  {
    id: 'closed_lost',
    name: 'Closed Lost',
    variant: 'destructive',
    icon: XCircle,
  },
];

const paymentStatuses = [
  { id: 'paid', name: 'Paid', variant: 'success' },
  { id: 'pending', name: 'Pending', variant: 'warning' },
  { id: 'failed', name: 'Failed', variant: 'destructive' },
];

const priorities = [
  { id: 'low', name: 'Low', variant: 'secondary' },
  { id: 'medium', name: 'Medium', variant: 'info' },
  { id: 'high', name: 'High', variant: 'destructive' },
];

export function RecentDeals() {
  const latestLoadRequestRef = useRef(0);
  const navigate = useNavigate();
  const { language } = useLanguage();
  const t =
    language === 'cs'
      ? {
          searchDeals: 'Hledat obchody...',
          status: 'Stav',
          payment: 'Platba',
          searchStatus: 'Hledat stav...',
          noStatusFound: 'Nenalezen žádný stav.',
          searchPaymentStatus: 'Hledat stav platby...',
          noPaymentStatusFound: 'Nenalezen žádný stav platby.',
          searchPriority: 'Hledat prioritu...',
        }
      : {
          searchDeals: 'Search deals...',
          status: 'Status',
          payment: 'Payment',
          searchStatus: 'Search status...',
          noStatusFound: 'No status found.',
          searchPaymentStatus: 'Search payment status...',
          noPaymentStatusFound: 'No payment status found.',
          searchPriority: 'Search priority...',
        };

  const [liveDeals, setLiveDeals] = useState<Deal[]>([]);
  const [dealsHydrated, setDealsHydrated] = useState(false);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [selectedPaymentStatuses, setSelectedPaymentStatuses] = useState<
    string[]
  >([]);
  const [selectedPriorities, setSelectedPriorities] = useState<string[]>([]);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 5,
  });
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'dealDate', desc: true },
  ]);
  const {
    searchQuery,
    debouncedSearchQuery,
    searchInputRef,
    setSearchQuery,
    clearSearchQuery,
    handleSearchInputKeyDown,
  } = useGridSearch({ debounceMs: 180 });

  const loadDeals = useCallback(async () => {
    const requestId = latestLoadRequestRef.current + 1;
    latestLoadRequestRef.current = requestId;
    try {
      const response = await fetchDeals({ limit: 200 });
      const mappedDeals = (response?.data ?? []).map((deal, index) => ({
        id: deal.id,
        dealNumber: `DEAL-${(deal.id || String(index + 1)).replace(/[^a-zA-Z0-9]/g, '').slice(0, 8).toUpperCase()}`,
        contact: {
          name: formatPersonName(deal.contact ?? deal.owner),
          email: deal.contact?.email ?? deal.owner?.email ?? '',
          avatar: avatarFromId(deal.contact?.id ?? deal.owner?.id ?? deal.id),
          company: deal.company?.name ?? '',
        },
        dealDetails: [
          {
            name: deal.title,
            description: deal.description ?? 'CRM deal',
            value: deal.value ?? 0,
          },
        ],
        total: deal.value ?? 0,
        status:
          deal.stage === 'won'
            ? 'closed_won'
            : deal.stage === 'lost'
              ? 'closed_lost'
              : deal.stage === 'negotiation'
                ? 'negotiation'
                : deal.stage === 'proposal'
                  ? 'proposal'
                  : deal.stage === 'qualified'
                    ? 'qualification'
                    : 'prospecting',
        paymentStatus: deal.stage === 'won' ? 'paid' : 'pending',
        company: deal.company?.name ?? '',
        dealDate: new Date(deal.createdAt),
        expectedClose: new Date(deal.expectedCloseDate ?? deal.createdAt),
        priority:
          (deal.probability ?? 0) >= 70
            ? 'high'
            : (deal.probability ?? 0) >= 40
              ? 'medium'
              : 'low',
      }));

      if (requestId !== latestLoadRequestRef.current) return;
      setLiveDeals(mappedDeals);
    } catch (error) {
      if (requestId !== latestLoadRequestRef.current) return;
      logFrontendError({
        area: 'crm-dashboard-recent-deals',
        message: error instanceof Error ? error.message : 'Failed to load recent deals',
        meta: { operation: 'load_recent_deals' },
      });
      setLiveDeals([]);
    } finally {
      if (requestId !== latestLoadRequestRef.current) return;
      setDealsHydrated(true);
    }
  }, []);

  useEffect(() => {
    void loadDeals();
  }, [loadDeals]);

  useEffect(() => {
    const onRefresh = () => { void loadDeals(); };
    window.addEventListener(CRM_DEALS_REFRESH_EVENT, onRefresh);
    return () => {
      window.removeEventListener(CRM_DEALS_REFRESH_EVENT, onRefresh);
    };
  }, [loadDeals]);

  const sourceDeals = liveDeals;

  const getStatusIcon = (status: string) => {
    const statusData = dealStatuses.find((s) => s.id === status);
    return statusData ? statusData.icon : Target;
  };

  const getStatusVariant = (status: string): BadgeProps['variant'] => {
    const statusData = dealStatuses.find((s) => s.id === status);
    return (statusData?.variant as BadgeProps['variant']) || 'secondary';
  };

  const getPaymentStatusVariant = (status: string): BadgeProps['variant'] => {
    const statusData = paymentStatuses.find((s) => s.id === status);
    return (statusData?.variant as BadgeProps['variant']) || 'secondary';
  };

  const getPriorityVariant = (priority: string): BadgeProps['variant'] => {
    const priorityData = priorities.find((p) => p.id === priority);
    return (priorityData?.variant as BadgeProps['variant']) || 'secondary';
  };

  const columns = useMemo<ColumnDef<Deal>[]>(
    () => [
      {
        accessorKey: 'id',
        id: 'id',
        header: () => <DataGridTableRowSelectAll size="sm" />,
        cell: ({ row }) => <DataGridTableRowSelect row={row} size="sm" />,
        enableSorting: false,
        size: 30,
        meta: {
          headerClassName: '',
          cellClassName: '',
        },
        enableHiding: false,
        enableResizing: false,
      },
      {
        accessorKey: 'dealNumber',
        id: 'dealNumber',
        header: ({ column }) => (
          <DataGridColumnHeader
            title="Deal #"
            visibility={true}
            column={column}
          />
        ),
        cell: ({ row }) => {
          return (
            <div className="font-mono font-medium text-foreground">
              {row.original.dealNumber}
            </div>
          );
        },
        size: 150,
        enableSorting: true,
        enableHiding: false,
        enableResizing: true,
      },
      {
        accessorKey: 'contact',
        id: 'contact',
        header: ({ column }) => (
          <DataGridColumnHeader
            title="Contact"
            visibility={true}
            column={column}
          />
        ),
        cell: ({ row }) => {
          const contact = row.original.contact;
          return (
            <div className="flex items-center gap-2">
              <Avatar className="size-8">
                <AvatarImage
                  src={toAbsoluteUrl(`/media/avatars/${contact.avatar}`)}
                  alt={contact.name}
                />
                <AvatarFallback className="text-xs">
                  {contact.name[0]}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="font-medium text-sm">{contact.name}</span>
                <span className="text-xs text-muted-foreground">
                  {contact.email}
                </span>
              </div>
            </div>
          );
        },
        size: 200,
        enableSorting: true,
        enableHiding: true,
        enableResizing: true,
      },
      {
        accessorKey: 'company',
        id: 'company',
        header: ({ column }) => (
          <DataGridColumnHeader
            title="Company"
            visibility={true}
            column={column}
          />
        ),
        cell: ({ row }) => {
          return (
            <div className="flex items-center gap-1 text-sm">
              <Building2 className="size-3 text-muted-foreground" />
              <span className="truncate max-w-[120px]">
                {row.original.company}
              </span>
            </div>
          );
        },
        size: 140,
        enableSorting: true,
        enableHiding: true,
        enableResizing: true,
      },
      {
        accessorKey: 'dealDetails',
        id: 'dealDetails',
        header: ({ column }) => (
          <DataGridColumnHeader
            title="Deal Details"
            visibility={true}
            column={column}
          />
        ),
        cell: ({ row }) => {
          const dealDetails = row.original.dealDetails;
          return (
            <div className="flex flex-col gap-1">
              {dealDetails.map((detail, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="truncate max-w-[120px]">{detail.name}</span>
                  <span className="text-muted-foreground">
                    ${detail.value.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          );
        },
        size: 180,
        enableSorting: false,
        enableHiding: true,
        enableResizing: true,
        hidden: true,
      },
      {
        accessorKey: 'total',
        id: 'total',
        header: ({ column }) => (
          <DataGridColumnHeader
            title="Total Value"
            visibility={true}
            column={column}
          />
        ),
        cell: ({ row }) => {
          return (
            <div className="flex items-center gap-1 font-medium">
              <DollarSign className="size-3" />
              {row.original.total.toLocaleString()}
            </div>
          );
        },
        size: 120,
        enableSorting: true,
        enableHiding: true,
        enableResizing: true,
      },
      {
        accessorKey: 'status',
        id: 'status',
        header: ({ column }) => (
          <DataGridColumnHeader
            title="Status"
            visibility={true}
            column={column}
          />
        ),
        cell: ({ row }) => {
          const status = row.original.status;
          const StatusIcon = getStatusIcon(status);
          return (
            <Badge variant={getStatusVariant(status)} appearance="light">
              <StatusIcon className="size-3" />
              {dealStatuses.find((s) => s.id === status)?.name}
            </Badge>
          );
        },
        size: 140,
        enableSorting: true,
        enableHiding: true,
        enableResizing: true,
      },
      {
        accessorKey: 'paymentStatus',
        id: 'paymentStatus',
        header: ({ column }) => (
          <DataGridColumnHeader
            title="Payment"
            visibility={false}
            column={column}
          />
        ),
        cell: ({ row }) => {
          const paymentStatus = row.original.paymentStatus;
          return (
            <Badge
              variant={getPaymentStatusVariant(paymentStatus)}
              appearance="light"
            >
              {paymentStatuses.find((s) => s.id === paymentStatus)?.name}
            </Badge>
          );
        },
        size: 100,
        enableSorting: true,
        enableHiding: true,
        enableResizing: true,
        meta: {
          headerTitle: 'Payment Status',
        },
      },
      {
        accessorKey: 'dealDate',
        id: 'dealDate',
        header: ({ column }) => (
          <DataGridColumnHeader
            title="Deal Date"
            visibility={true}
            column={column}
          />
        ),
        cell: ({ row }) => {
          return row.original.dealDate.toLocaleDateString();
        },
        size: 120,
        enableSorting: true,
        enableHiding: true,
        enableResizing: true,
        meta: {
          headerTitle: 'Deal Date',
        },
      },
      {
        accessorKey: 'expectedClose',
        id: 'expectedClose',
        header: ({ column }) => (
          <DataGridColumnHeader
            title="Expected Close"
            visibility={true}
            column={column}
          />
        ),
        cell: ({ row }) => {
          return row.original.expectedClose.toLocaleDateString();
        },
        size: 130,
        enableSorting: true,
        enableHiding: true,
        enableResizing: true,
        meta: {
          headerTitle: 'Expected Close Date',
        },
      },
      {
        accessorKey: 'priority',
        id: 'priority',
        header: ({ column }) => (
          <DataGridColumnHeader
            title="Priority"
            visibility={true}
            column={column}
          />
        ),
        cell: ({ row }) => {
          const priority = row.original.priority;
          return (
            <Badge variant={getPriorityVariant(priority)} appearance="light">
              {priorities.find((p) => p.id === priority)?.name}
            </Badge>
          );
        },
        size: 100,
        enableSorting: true,
        enableHiding: true,
        enableResizing: true,
      },
      {
        accessorKey: 'actions',
        id: 'actions',
        header: () => <span className="sr-only">Actions</span>,
        cell: ({ row }) => {
          const deal = row.original;

          const handleViewDeal = () => {
            navigate('/core/crm/pipeline');
          };

          const handleEditDeal = () => {
            navigate('/core/crm/deals');
          };

          const handleCopyDealNumber = () => {
            navigator.clipboard.writeText(deal.dealNumber);
            toast.custom(
              (t) => (
                <Alert
                  variant="mono"
                  icon="success"
                  onClose={() => toast.dismiss(t)}
                >
                  <AlertIcon>
                    <Copy />
                  </AlertIcon>
                  <AlertTitle>Deal number copied to clipboard!</AlertTitle>
                </Alert>
              ),
              { duration: 3000, position: 'top-center' },
            );
          };

          const handleRemoveDeal = async () => {
            if (!window.confirm(`Opravdu smazat obchod ${deal.dealNumber}?`)) return;
            try {
              await deleteDeal(deal.id);
              setLiveDeals((prev) => prev.filter((item) => item.id !== deal.id));
              dispatchCrmEvent(CRM_DEALS_REFRESH_EVENT);
              toast.success('Obchod byl smazán.');
            } catch (error) {
              const message = error instanceof Error ? error.message : 'Mazání obchodu selhalo.';
              logFrontendError({
                area: 'crm-dashboard-recent-deals',
                message,
                meta: { operation: 'delete_recent_deal', dealId: deal.id },
              });
              toast.error(message);
            }
          };

          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreHorizontal />
                  <span className="sr-only">Open menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={handleViewDeal}>
                  <Eye />
                  View Details
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleEditDeal}>
                  <Edit />
                  Edit Deal
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleCopyDealNumber}>
                  <Copy />
                  Copy Deal #
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleRemoveDeal}
                  variant="destructive"
                >
                  <Trash2 />
                  Remove Deal
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
        size: 50,
        enableSorting: false,
        enableHiding: false,
        enableResizing: false,
      },
    ],
    [navigate],
  );

  const [columnOrder, setColumnOrder] = useState<string[]>(
    columns.map((column) => column.id as string),
  );

  const filteredData = useMemo(() => {
    return sourceDeals.filter((item) => {
      // Filter by status
      const matchesStatus =
        !selectedStatuses?.length || selectedStatuses.includes(item.status);

      // Filter by payment status
      const matchesPaymentStatus =
        !selectedPaymentStatuses?.length ||
        selectedPaymentStatuses.includes(item.paymentStatus);

      // Filter by priority
      const matchesPriority =
        !selectedPriorities?.length ||
        selectedPriorities.includes(item.priority);

      // Filter by search query (case-insensitive)
      const searchLower = debouncedSearchQuery.toLowerCase();
      const matchesSearch =
        !debouncedSearchQuery ||
        item.dealNumber.toLowerCase().includes(searchLower) ||
        item.contact.name.toLowerCase().includes(searchLower) ||
        item.contact.email.toLowerCase().includes(searchLower) ||
        item.company.toLowerCase().includes(searchLower);

      return (
        matchesStatus &&
        matchesPaymentStatus &&
        matchesPriority &&
        matchesSearch
      );
    });
  }, [
    sourceDeals,
    debouncedSearchQuery,
    selectedStatuses,
    selectedPaymentStatuses,
    selectedPriorities,
  ]);

  const handleStatusChange = (checked: boolean, status: string) => {
    if (checked) {
      setSelectedStatuses((prev) => [...prev, status]);
    } else {
      setSelectedStatuses((prev) => prev.filter((s) => s !== status));
    }
  };

  const handlePaymentStatusChange = (checked: boolean, status: string) => {
    if (checked) {
      setSelectedPaymentStatuses((prev) => [...prev, status]);
    } else {
      setSelectedPaymentStatuses((prev) => prev.filter((s) => s !== status));
    }
  };

  const handlePriorityChange = (checked: boolean, priority: string) => {
    if (checked) {
      setSelectedPriorities((prev) => [...prev, priority]);
    } else {
      setSelectedPriorities((prev) => prev.filter((p) => p !== priority));
    }
  };

  const table = useReactTable({
    columns,
    data: filteredData,
    pageCount: Math.ceil((filteredData?.length || 0) / pagination.pageSize),
    getRowId: (row: Deal) => row.id,
    state: {
      pagination,
      sorting,
      columnOrder,
    },
    columnResizeMode: 'onChange',
    onColumnOrderChange: setColumnOrder,
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    initialState: {
      columnVisibility: {
        dealDetails: false,
        paymentStatus: false,
      },
    },
  });

  return (
    <DataGrid
      table={table}
      recordCount={filteredData?.length || 0}
      tableLayout={{
        columnsPinnable: true,
        columnsResizable: true,
        columnsMovable: true,
        columnsVisibility: true,
      }}
    >
      <Card className="min-w-0">
        <CardHeader className="px-3 py-3">
          <CardHeading>
            <div className="flex min-w-0 flex-wrap items-center gap-2.5">
              {/* Search */}
              <InputWrapper className="min-w-0 w-full sm:w-auto">
                <Search className="text-muted-foreground" />
                <Input
                  ref={searchInputRef}
                  placeholder={`${t.searchDeals} (/)`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleSearchInputKeyDown}
                  className="min-w-0 w-full sm:w-56"
                />
                {searchQuery.length > 0 && (
                  <Button
                    mode="icon"
                    variant="dim"
                    size="sm"
                    className="-me-2"
                    onClick={clearSearchQuery}
                  >
                    <X />
                  </Button>
                )}
              </InputWrapper>

              {/* Status Filter */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline">
                    <Filter className="size-3.5" />
                    {t.status}
                    {selectedStatuses.length > 0 && (
                      <Badge size="sm" variant="outline">
                        {selectedStatuses.length}
                      </Badge>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-56 p-0" align="start">
                  <Command>
                    <CommandInput placeholder={t.searchStatus} />
                    <CommandList>
                      <CommandEmpty>{t.noStatusFound}</CommandEmpty>
                      <CommandGroup>
                        {dealStatuses.map((status) => (
                          <CommandItem
                            key={status.id}
                            value={status.id}
                            className="flex items-center gap-2.5 bg-transparent!"
                          >
                            <Checkbox
                              id={status.id}
                              checked={selectedStatuses.includes(status.id)}
                              onCheckedChange={(checked) =>
                                handleStatusChange(checked === true, status.id)
                              }
                            />
                            <Label
                              htmlFor={status.id}
                              className="grow flex items-center justify-between font-normal gap-1.5"
                            >
                              <Badge
                                variant={
                                  status.variant as BadgeProps['variant']
                                }
                                appearance="light"
                              >
                                {status.name}
                              </Badge>
                              <span className="text-muted-foreground font-semibold me-2.5">
                                {
                                  filteredData.filter(
                                    (item) => item.status === status.id,
                                  ).length
                                }
                              </span>
                            </Label>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>

              {/* Payment Status Filter */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline">
                    <DollarSign className="size-3.5" />
                    {t.payment}
                    {selectedPaymentStatuses.length > 0 && (
                      <Badge size="sm" variant="outline">
                        {selectedPaymentStatuses.length}
                      </Badge>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-56 p-0" align="start">
                  <Command>
                    <CommandInput placeholder={t.searchPaymentStatus} />
                    <CommandList>
                      <CommandEmpty>{t.noPaymentStatusFound}</CommandEmpty>
                      <CommandGroup>
                        {paymentStatuses.map((status) => (
                          <CommandItem
                            key={status.id}
                            value={status.id}
                            className="flex items-center gap-2.5 bg-transparent!"
                          >
                            <Checkbox
                              id={status.id}
                              checked={selectedPaymentStatuses.includes(
                                status.id,
                              )}
                              onCheckedChange={(checked) =>
                                handlePaymentStatusChange(
                                  checked === true,
                                  status.id,
                                )
                              }
                            />
                            <Label
                              htmlFor={status.id}
                              className="grow flex items-center justify-between font-normal gap-1.5"
                            >
                              <Badge
                                variant={
                                  status.variant as BadgeProps['variant']
                                }
                                appearance="light"
                              >
                                {status.name}
                              </Badge>
                              <span className="text-muted-foreground font-semibold me-2.5">
                                {
                                  filteredData.filter(
                                    (item) => item.paymentStatus === status.id,
                                  ).length
                                }
                              </span>
                            </Label>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>

              {/* Priority Filter */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline">
                    <AlertCircle className="size-3.5" />
                    Priority
                    {selectedPriorities.length > 0 && (
                      <Badge size="sm" variant="outline">
                        {selectedPriorities.length}
                      </Badge>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-56 p-0" align="start">
                  <Command>
                    <CommandInput placeholder={t.searchPriority} />
                    <CommandList>
                      <CommandEmpty>No priority found.</CommandEmpty>
                      <CommandGroup>
                        {priorities.map((priority) => (
                          <CommandItem
                            key={priority.id}
                            value={priority.id}
                            className="flex items-center gap-2.5 bg-transparent!"
                          >
                            <Checkbox
                              id={priority.id}
                              checked={selectedPriorities.includes(priority.id)}
                              onCheckedChange={(checked) =>
                                handlePriorityChange(
                                  checked === true,
                                  priority.id,
                                )
                              }
                            />
                            <Label
                              htmlFor={priority.id}
                              className="grow flex items-center justify-between font-normal gap-1.5"
                            >
                              <Badge
                                variant={
                                  priority.variant as BadgeProps['variant']
                                }
                                appearance="light"
                              >
                                {priority.name}
                              </Badge>
                              <span className="text-muted-foreground font-semibold me-2.5">
                                {
                                  filteredData.filter(
                                    (item) => item.priority === priority.id,
                                  ).length
                                }
                              </span>
                            </Label>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
          </CardHeading>
          <CardToolbar>
            <DataGridColumnVisibility
              table={table}
              trigger={
                <Button variant="outline">
                  <Settings2 />
                  View Settings
                </Button>
              }
            />
          </CardToolbar>
        </CardHeader>
        <CardTable>
          {dealsHydrated ? (
            <ScrollArea>
              <DataGridTable />
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          ) : (
            <DataGridLoadingRows rows={5} idPrefix="recent-deals-table-skeleton" />
          )}
        </CardTable>
        <CardFooter className="px-3 py-0">
          {dealsHydrated ? (
            <DataGridPagination className="py-1" />
          ) : (
            <DataGridLoadingFooter />
          )}
        </CardFooter>
      </Card>
    </DataGrid>
  );
}
