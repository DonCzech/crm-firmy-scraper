import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { DataGridLoadingRows } from '@/crm/components/data-grid-loading-rows';
import { DataGridLoadingFooter } from '@/crm/components/data-grid-loading-footer';
import { useGridSearch } from '@/crm/hooks/use-grid-search';
import { ConnectionStrength } from '@/crm/types/connection-strength';
import { EmployeeRange } from '@/crm/types/employee-range';
import { EstimatedArr } from '@/crm/types/estimated-arr';
import { fetchCompanies } from '@/crm/services/backend';
import { CRM_COMPANIES_REFRESH_EVENT, CRM_CONTACTS_REFRESH_EVENT } from '@/crm/services/events';
import { logFrontendError } from '@/crm/services/frontend-logger';
import { avatarFromId, mapCompanyToUI } from '@/crm/services/mappers';
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
import { Filter, Search, Settings2, X, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toAbsoluteUrl } from '@/lib/helpers';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { CATEGORIES } from '../../mock/categories';
import { CONNECTION_STRENGTHS } from '../../mock/connection-strengths';
import { EMPLOYEE_RANGES } from '../../mock/employee-ranges';
import { ESTIMATED_ARRS } from '../../mock/estimated-arrs';
import { Company } from '../../types/company';

const COMPANIES_COLUMN_VISIBILITY_STORAGE_KEY = 'crm-companies-column-visibility-v1';

export default function CompanyList() {
  const latestLoadRequestRef = useRef(0);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 15,
  });

  const [sorting, setSorting] = useState<SortingState>([
    { id: 'name', desc: true },
  ]);
  const [columnVisibility, setColumnVisibility] = useState<Record<string, boolean>>(() => {
    if (typeof window === 'undefined') return {};
    try {
      const raw = window.localStorage.getItem(COMPANIES_COLUMN_VISIBILITY_STORAGE_KEY);
      if (!raw) return {};
      const parsed = JSON.parse(raw) as Record<string, boolean>;
      return parsed && typeof parsed === 'object' ? parsed : {};
    } catch {
      return {};
    }
  });
  const {
    searchQuery,
    debouncedSearchQuery,
    searchInputRef,
    setSearchQuery,
    clearSearchQuery,
    handleSearchInputKeyDown,
  } = useGridSearch({ debounceMs: 180 });
  const [companyData, setCompanyData] = useState<Company[]>([]);
  const [companiesHydrated, setCompaniesHydrated] = useState(false);
  const [teamMembersById, setTeamMembersById] = useState<
    Record<string, { name: string; avatar: string }>
  >({});

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(
        COMPANIES_COLUMN_VISIBILITY_STORAGE_KEY,
        JSON.stringify(columnVisibility),
      );
    } catch {
      // ignore storage errors
    }
  }, [columnVisibility]);

  const loadCompanies = useCallback(async () => {
    const requestId = latestLoadRequestRef.current + 1;
    latestLoadRequestRef.current = requestId;
    try {
      const response = await fetchCompanies({ limit: 500 });
      const mappedCompanies = (response?.data ?? []).map(mapCompanyToUI);

      const teamMap = (response?.data ?? []).reduce(
        (acc, company) => {
          (company.contacts ?? []).forEach((contact) => {
            const name =
              `${contact.firstName ?? ''} ${contact.lastName ?? ''}`.trim() ||
              'Unknown';
            acc[contact.id] = {
              name,
              avatar: avatarFromId(contact.id),
            };
          });
          return acc;
        },
        {} as Record<string, { name: string; avatar: string }>,
      );

      if (requestId !== latestLoadRequestRef.current) return;
      if (mappedCompanies.length > 0) {
        setCompanyData(mappedCompanies);
        setTeamMembersById(teamMap);
      } else {
        setCompanyData([]);
        setTeamMembersById({});
      }
    } catch (error) {
      if (requestId !== latestLoadRequestRef.current) return;
      logFrontendError({
        area: 'crm-company-list',
        message: error instanceof Error ? error.message : 'Failed to load companies',
        meta: { operation: 'load_companies' },
      });
      setCompanyData([]);
      setTeamMembersById({});
    } finally {
      if (requestId === latestLoadRequestRef.current) setCompaniesHydrated(true);
    }
  }, []);

  useEffect(() => {
    void loadCompanies();
  }, [loadCompanies]);

  useEffect(() => {
    const onRefresh = () => {
      void loadCompanies();
    };
    window.addEventListener(CRM_COMPANIES_REFRESH_EVENT, onRefresh);
    window.addEventListener(CRM_CONTACTS_REFRESH_EVENT, onRefresh);
    return () => {
      window.removeEventListener(CRM_COMPANIES_REFRESH_EVENT, onRefresh);
      window.removeEventListener(CRM_CONTACTS_REFRESH_EVENT, onRefresh);
    };
  }, [loadCompanies]);

  const columns = useMemo<ColumnDef<Company>[]>(
    () => [
      {
        accessorKey: 'id',
        id: 'id',
        header: () => <DataGridTableRowSelectAll size="sm" />,
        cell: ({ row }) => <DataGridTableRowSelect row={row} size="sm" />,
        enableSorting: false,
        size: 40,
        meta: {
          headerClassName: 'ps-4',
          cellClassName: 'ps-4',
        },
        enableHiding: false,
        enableResizing: false,
      },
      {
        accessorKey: 'name',
        id: 'name',
        header: ({ column }) => (
          <DataGridColumnHeader
            title="Company"
            visibility={true}
            column={column}
          />
        ),
        cell: ({ row }) => {
          return (
            <Link
              to={`/crm/companies/${row.original.id}`}
              className="group flex items-center gap-1.5 cursor-pointer"
            >
              <Avatar className="size-5.5 rounded-none">
                <AvatarImage
                  src={toAbsoluteUrl(row.original.logo || '')}
                  alt={row.original.name}
                  className="rounded-none"
                />
                <AvatarFallback className="border-0 text-[11px] font-semibold bg-yellow-500 text-white">
                  {row.original.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="font-medium text-foreground group-hover:text-primary">
                {row.original.name}
              </div>
            </Link>
          );
        },
        size: 225,
        enableSorting: true,
        enableHiding: false,
        enableResizing: true,
      },
      {
        accessorKey: 'categories',
        id: 'categories',
        header: ({ column }) => (
          <DataGridColumnHeader
            title="Categories"
            visibility={true}
            column={column}
          />
        ),
        cell: ({ row }) => {
          const categoryIds = row.original.categoryIds || [];
          return (
            <div className="flex truncate overflow-hidden gap-1.5">
              {categoryIds.map((catId) => {
                const badge = CATEGORIES.find((b) => b.id === catId);
                return (
                  <Badge key={catId} className={cn('shrink-0', badge?.color)}>
                    {badge ? badge.name : catId}
                  </Badge>
                );
              })}
            </div>
          );
        },
        size: 250,
        enableSorting: true,
        enableHiding: true,
        enableResizing: true,
      },
      {
        accessorKey: 'team',
        id: 'team',
        header: ({ column }) => (
          <DataGridColumnHeader
            title="Team"
            visibility={true}
            column={column}
          />
        ),
        cell: ({ row }) => {
          const contactIds = row.original.contactIds || [];
          return (
            <div className="flex truncate overflow-hidden gap-1.5">
              {contactIds.map((contactId) => {
                const contact = teamMembersById[contactId];
                return contact ? (
                  <div
                    key={contactId}
                    className="group cursor-pointer flex items-center gap-1 px-1 border border-border rounded-full bg-accent/50"
                  >
                    <Avatar className="size-4 my-1">
                      <AvatarImage
                        src={toAbsoluteUrl(contact.avatar)}
                        alt={contact.name}
                      />
                      <AvatarFallback className="border-0 text-[11px] font-semibold bg-green-500 text-white">
                        {contact.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>

                    <div className="border-r border-border h-full"></div>

                    <span className="truncate max-w-[100px] text-xs group-hover:text-primary">
                      {contact.name}
                    </span>
                  </div>
                ) : null;
              })}
            </div>
          );
        },
        size: 200,
        enableSorting: true,
        enableHiding: true,
        enableResizing: true,
      },
      {
        accessorKey: 'description',
        id: 'description',
        header: ({ column }) => (
          <DataGridColumnHeader
            title="Description"
            visibility={true}
            column={column}
          />
        ),
        cell: ({ row }) => {
          return (
            <div className="flex items-center gap-1.5 truncate">
              {row.original.description}
            </div>
          );
        },
        size: 200,
        meta: {
          headerClassName: '',
          cellClassName: 'text-start',
        },
        enableSorting: true,
        enableHiding: true,
        enableResizing: true,
      },
      {
        accessorKey: 'connectionStrength',
        id: 'connection',
        header: ({ column }) => (
          <DataGridColumnHeader
            title="Connection"
            visibility={true}
            column={column}
          />
        ),
        cell: ({ row }) => {
          const value = row.original.connectionStrengthId;
          const item = CONNECTION_STRENGTHS.find(
            (item: ConnectionStrength) => item.id === value,
          );

          return (
            <div className="inline-flex items-center gap-1.5">
              <span className={cn('rounded-full size-2', item?.color)}></span>
              <span className={cn('text-medium text-foreground')}>
                {item?.name}
              </span>
            </div>
          );
        },
        size: 200,
        enableSorting: true,
        enableHiding: true,
        enableResizing: true,
      },
      {
        accessorKey: 'country',
        id: 'country',
        header: ({ column }) => (
          <DataGridColumnHeader
            title="Location"
            visibility={true}
            column={column}
          />
        ),
        cell: ({ row }) => {
          return (
            <div className="inline-flex items-center gap-1.5">
              <span>{row.original.country},</span>
              <span>{row.original.city}</span>
            </div>
          );
        },
        size: 175,
        meta: {
          headerClassName: '',
          cellClassName: 'text-start',
        },
        enableSorting: true,
        enableHiding: true,
        enableResizing: true,
      },
      {
        accessorKey: 'estimatedArr',
        id: 'estimated',
        header: ({ column }) => (
          <DataGridColumnHeader
            title="Estimated Arr"
            visibility={true}
            column={column}
          />
        ),
        cell: ({ row }) => {
          const value = row.original.estimatedArrId;
          const badge = ESTIMATED_ARRS.find(
            (badge: EstimatedArr) => badge.id === value,
          );

          return (
            <Badge className={cn('shrink-0', badge?.color)}>
              {badge?.name}
            </Badge>
          );
        },
        size: 200,
        enableSorting: true,
        enableHiding: true,
        enableResizing: true,
      },
      {
        accessorKey: 'employeeRange',
        id: 'employee',
        header: ({ column }) => (
          <DataGridColumnHeader
            title="Employee range"
            visibility={true}
            column={column}
          />
        ),
        cell: ({ row }) => {
          const value = row.original.employeeRangeId;
          const badge = EMPLOYEE_RANGES.find(
            (item: EmployeeRange) => item.id === value,
          );

          return (
            <Badge className={cn('shrink-0', badge?.color)}>
              {badge?.name}
            </Badge>
          );
        },
        size: 200,
        enableSorting: true,
        enableHiding: true,
        enableResizing: true,
      },
      {
        accessorKey: 'last-contacted',
        id: 'contacted',
        header: ({ column }) => (
          <DataGridColumnHeader
            title="Last Contacted"
            visibility={true}
            column={column}
          />
        ),
        cell: ({ row }) => {
          return (
            <div className="flex items-center gap-1.5 truncate">
              {row.original.lastContacted}
            </div>
          );
        },
        size: 200,
        meta: {
          headerClassName: '',
          cellClassName: 'text-start',
        },
        enableSorting: true,
        enableHiding: true,
        enableResizing: true,
      },
      {
        accessorKey: 'email',
        id: 'email',
        header: ({ column }) => (
          <DataGridColumnHeader
            title="Email"
            visibility={true}
            column={column}
          />
        ),
        cell: ({ row }) => {
          return (
            <Link
              to={`mailto:${row.original.email}`}
              className="hover:text-primary"
            >
              {row.original.email}
            </Link>
          );
        },
        size: 200,
        meta: {
          headerClassName: '',
          cellClassName: 'text-start',
        },
        enableSorting: true,
        enableHiding: true,
        enableResizing: true,
      },
      {
        accessorKey: 'domain',
        id: 'domain',
        header: ({ column }) => (
          <DataGridColumnHeader
            title="Domain"
            visibility={true}
            column={column}
          />
        ),
        cell: ({ row }) => {
          return (
            <Link
              to={`http://${row.original.domain}`}
              className="hover:text-primary"
              target="_blank"
              rel="noopener noreferrer"
            >
              {row.original.domain}
            </Link>
          );
        },
        size: 200,
        meta: {
          headerClassName: '',
          cellClassName: 'text-start',
        },
        enableSorting: true,
        enableHiding: true,
        enableResizing: true,
      },
      {
        accessorKey: 'foundedAt',
        id: 'foundedAt',
        header: ({ column }) => (
          <DataGridColumnHeader
            title="Founded"
            visibility={true}
            column={column}
          />
        ),
        cell: ({ row }) => {
          return (
            <div className="flex items-center gap-1.5">
              {row.original.foundedAt?.getFullYear()}
            </div>
          );
        },
        size: 100,
        meta: {
          headerTitle: 'Founded',
          headerClassName: '',
          cellClassName: 'text-start',
        },
        enableSorting: true,
        enableHiding: true,
        enableResizing: true,
      },
    ],
    [teamMembersById],
  );

  const [columnOrder, setColumnOrder] = useState<string[]>(
    columns.map((column) => column.id as string),
  );

  const filteredData = useMemo(() => {
    return companyData.filter((item) => {
      // Filter by status
      const matchesStatus =
        !selectedCategories?.length ||
        selectedCategories.includes(item.categoryIds?.[0] || '');
      // Filter by search query (case-insensitive)
      const searchLower = debouncedSearchQuery.toLowerCase();
      const matchesSearch =
        !debouncedSearchQuery ||
        Object.values(item).join(' ').toLowerCase().includes(searchLower);
      return matchesStatus && matchesSearch;
    });
  }, [companyData, debouncedSearchQuery, selectedCategories]);

  const categoryCounts = useMemo(() => {
    return companyData.reduce(
      (acc, company) => {
        company.categoryIds?.forEach((catId) => {
          acc[catId] = (acc[catId] || 0) + 1;
        });
        return acc;
      },
      {} as Record<string, number>,
    );
  }, [companyData]);

  const handleCategoryChange = (checked: boolean, category: string) => {
    if (checked) {
      setSelectedCategories((prev) => [...prev, category]);
    } else {
      setSelectedCategories((prev) => prev.filter((c) => c !== category));
    }
  };

  const [selectedConnectionStrengths, setSelectedConnectionStrengths] =
    useState<string[]>([]);
  const [connectionStrengthSearch, setConnectionStrengthSearch] = useState('');

  const handleConnectionStrengthChange = (checked: boolean, id: string) => {
    setSelectedConnectionStrengths((prev) =>
      checked ? [...prev, id] : prev.filter((c) => c !== id),
    );
  };

  const filteredConnectionStrengths = useMemo(() => {
    if (!connectionStrengthSearch) return CONNECTION_STRENGTHS;
    const lower = connectionStrengthSearch.toLowerCase();
    return CONNECTION_STRENGTHS.filter((item) =>
      item.name.toLowerCase().includes(lower),
    );
  }, [connectionStrengthSearch]);

  const connectionStrengthCounts = companyData.reduce(
    (acc, company) => {
      const key = company.connectionStrengthId;
      if (key) {
        acc[key] = (acc[key] || 0) + 1;
      }
      return acc;
    },
    {} as Record<string, number>,
  );

  const table = useReactTable({
    columns,
    data: filteredData,
    pageCount: Math.ceil((filteredData?.length || 0) / pagination.pageSize),
    getRowId: (row: Company) => row.id,
    state: {
      pagination,
      sorting,
      columnOrder,
      columnVisibility,
    },
    columnResizeMode: 'onChange',
    onColumnOrderChange: setColumnOrder,
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <DataGrid
      table={table}
      recordCount={filteredData?.length || 0}
      tableClassNames={{
        bodyRow: 'group/row',
      }}
      tableLayout={{
        dense: true,
        columnsPinnable: true,
        columnsResizable: true,
        columnsMovable: true,
        columnsVisibility: true,
      }}
    >
      <Card className="min-w-0 border-none shadow-none">
        <CardHeader className="px-4 py-3">
          <CardHeading>
            <div className="flex min-w-0 flex-wrap items-center gap-2.5">
              {/* General */}
              <div className="relative min-w-0 w-full sm:w-auto">
                <Search className="size-4 text-muted-foreground absolute start-3 top-1/2 -translate-y-1/2" />
                <Input
                  ref={searchInputRef}
                  variant="sm"
                  placeholder="Search... (/)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleSearchInputKeyDown}
                  className="ps-9 w-full sm:w-40"
                />
                {searchQuery.length > 0 && (
                  <Button
                    mode="icon"
                    variant="ghost"
                    className="absolute end-1.5 top-1/2 -translate-y-1/2 h-6 w-6"
                    onClick={clearSearchQuery}
                  >
                    <X />
                  </Button>
                )}
              </div>

              {/* Categories */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button size="sm" variant="outline">
                    <Filter className="size-3.5" />
                    Categories
                    {selectedCategories.length > 0 && (
                      <Badge size="sm" variant="outline">
                        {selectedCategories.length}
                      </Badge>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-56 p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Search category..." />
                    <CommandList>
                      <CommandEmpty>No category found.</CommandEmpty>
                      <CommandGroup>
                        <ScrollArea className="h-[225px]">
                          {Object.keys(categoryCounts).map((category) => {
                            const categoryData = CATEGORIES.find(
                              (c) => c.id === category,
                            );
                            const count = categoryCounts[category];

                            return (
                              <CommandItem
                                key={category}
                                value={category}
                                className="flex items-center gap-2.5 bg-transparent!"
                              >
                                <Checkbox
                                  id={category}
                                  checked={selectedCategories.includes(
                                    category,
                                  )}
                                  onCheckedChange={(checked) =>
                                    handleCategoryChange(
                                      checked === true,
                                      category,
                                    )
                                  }
                                />
                                <Label
                                  htmlFor={category}
                                  className="grow flex items-center justify-between font-normal gap-1.5"
                                >
                                  <Badge
                                    key={category}
                                    className={cn(
                                      'shrink-0',
                                      categoryData?.color,
                                    )}
                                  >
                                    {categoryData
                                      ? categoryData.name
                                      : category}
                                  </Badge>
                                  <span className="text-muted-foreground font-semibold me-2.5">
                                    {count}
                                  </span>
                                </Label>
                              </CommandItem>
                            );
                          })}
                        </ScrollArea>
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>

              {/* Connections */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <Zap className="size-3.5" />
                    Connection
                    {selectedConnectionStrengths.length > 0 && (
                      <Badge size="sm" variant="outline">
                        {selectedConnectionStrengths.length}
                      </Badge>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-56 p-0" align="start">
                  <Command>
                    <CommandInput
                      placeholder="Search..."
                      value={connectionStrengthSearch}
                      onValueChange={setConnectionStrengthSearch}
                    />
                    <CommandList>
                      <CommandEmpty>No connection strength found.</CommandEmpty>
                      <CommandGroup>
                        {filteredConnectionStrengths.map((item) => (
                          <CommandItem
                            key={item.id}
                            value={item.id}
                            className="flex items-center gap-2.5 bg-transparent!"
                          >
                            <Checkbox
                              id={`conn-${item.id}`}
                              checked={selectedConnectionStrengths.includes(
                                item.id,
                              )}
                              onCheckedChange={(checked) =>
                                handleConnectionStrengthChange(
                                  checked === true,
                                  item.id,
                                )
                              }
                            />
                            <Label
                              htmlFor={`conn-${item.id}`}
                              className="grow flex items-center justify-between font-normal gap-1.5"
                            >
                              <div className="inline-flex items-center gap-1.5">
                                <span
                                  className={cn(
                                    'rounded-full size-2',
                                    item.color,
                                  )}
                                ></span>
                                <span className={cn('text-sm text-foreground')}>
                                  {item.name}
                                </span>
                              </div>
                              <span className="text-sm text-foreground">
                                {connectionStrengthCounts[item.id] || 0}
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
                <Button size="sm" variant="outline">
                  <Settings2 />
                  View Settings
                </Button>
              }
            />
          </CardToolbar>
        </CardHeader>

        <CardTable>
          {companiesHydrated ? (
            <ScrollArea>
              <DataGridTable />
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          ) : (
            <DataGridLoadingRows idPrefix="companies-table-skeleton" />
          )}
        </CardTable>

        <CardFooter className="px-4 py-0">
          {companiesHydrated ? (
            <DataGridPagination
              className="py-1"
              sizes={[5, 10, 15, 30, 50, 100]}
            />
          ) : (
            <DataGridLoadingFooter />
          )}
        </CardFooter>
      </Card>
    </DataGrid>
  );
}
