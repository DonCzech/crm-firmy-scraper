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
  ChevronUp,
  Copy,
  Download,
  Eye,
  Info,
  Link as LinkIcon,
  Search,
  SquarePen,
  Trash,
  X,
} from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  createContact,
  deleteContact,
  fetchContacts,
  type BackendContact,
  updateContact,
} from '@/crm/services/backend';
import { CRM_CONTACTS_REFRESH_EVENT, dispatchCrmEvent } from '@/crm/services/events';
import { toAbsoluteUrl } from '@/lib/helpers';
import { Alert, AlertIcon, AlertTitle } from '@/components/ui/alert';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Avatar, AvatarFallback, AvatarImage, AvatarIndicator, AvatarStatus } from '@/components/ui/avatar';
import { Badge, type BadgeProps } from '@/components/ui/badge';
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
import { Separator } from '@/components/ui/separator';
import {
  CustomerFormSheet,
  type CustomerFormValues,
} from '../components/customer-form-sheet';
import { CustomerDetailsSheet } from '../components/customer-details-sheet';

interface IColumnFilterProps<TData, TValue> {
  column: Column<TData, TValue>;
}

export interface IData {
  id: string;
  user: string;
  customerInfo: {
    image: string;
    title: string;
    label: string;
    statusColor: 'online' | 'offline' | 'busy';
    verified?: boolean;
  };
  location: {
    name: string;
    flag: string;
  };
  created: string;
  total: string;
  price: string;
  status: {
    label: 'Active' | 'Inactive' | 'Pending' | 'Banned';
    variant: 'success' | 'warning' | 'secondary' | 'destructive';
  };
  updated: string;
  phone?: string;
  companyName?: string;
  timeZone?: string;
  contact: BackendContact;
}

export type CustomerListDisplaySheet = 'customerDetails' | 'createCustomer' | 'editCustomer';

interface CustomerListProps {
  displaySheet?: CustomerListDisplaySheet;
  shouldOpenSheet?: boolean;
  onSheetClose?: () => void;
  focusCustomerId?: string;
}

const avatarPool = [
  '300-1.png',
  '300-2.png',
  '300-3.png',
  '300-4.png',
  '300-5.png',
  '300-6.png',
  '300-7.png',
  '300-8.png',
  '300-9.png',
  '300-10.png',
  '300-11.png',
  '300-12.png',
  '300-13.png',
  '300-14.png',
  '300-15.png',
  '300-16.png',
  '300-17.png',
  '300-18.png',
  '300-19.png',
  '300-20.png',
  '300-21.png',
  '300-22.png',
  '300-23.png',
  '300-24.png',
  '300-25.png',
  '300-26.png',
  '300-27.png',
  '300-28.png',
  '300-29.png',
  '300-30.png',
];

const countryFlagMap: Record<string, string> = {
  CZ: 'czech-republic.svg',
  US: 'usa.svg',
  GB: 'united-kingdom.svg',
  DE: 'germany.svg',
  FR: 'france.svg',
  ES: 'spain.svg',
  IT: 'italy.svg',
  PL: 'poland.svg',
  NL: 'netherlands.svg',
  SK: 'slovakia.svg',
  AT: 'austria.svg',
  CA: 'canada.svg',
};

function parseStatus(status?: string): IData['status'] {
  if (status === 'inactive') return { label: 'Inactive', variant: 'warning' };
  if (status === 'archived') return { label: 'Banned', variant: 'destructive' };
  return { label: 'Active', variant: 'success' };
}

function statusToBackend(status: CustomerFormValues['status']): 'active' | 'inactive' | 'archived' {
  if (status === 'banned') return 'archived';
  if (status === 'pending') return 'inactive';
  if (status === 'inactive') return 'inactive';
  return 'active';
}

function getCountryName(country?: string): string {
  const code = (country || '').trim().toUpperCase();
  if (!code) return '—';

  try {
    const display = new Intl.DisplayNames(['en'], { type: 'region' }).of(code);
    return display || code;
  } catch {
    return code;
  }
}

function getAvatar(contact: BackendContact): string {
  const key = `${contact.id}${contact.email || ''}`;
  let hash = 0;
  for (let i = 0; i < key.length; i += 1) hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
  return avatarPool[hash % avatarPool.length];
}

function toCustomerData(contact: BackendContact): IData {
  const status = parseStatus((contact as BackendContact & { status?: string }).status);
  const countryCode = (contact.country || '').toUpperCase();
  const flag = countryFlagMap[countryCode] || `${countryCode.toLowerCase()}.svg`;

  return {
    id: contact.id,
    user: contact.id.slice(0, 8).toUpperCase(),
    customerInfo: {
      image: getAvatar(contact),
      title: `${contact.firstName || ''} ${contact.lastName || ''}`.trim() || 'Customer',
      label: contact.email || '—',
      statusColor:
        status.label === 'Active'
          ? 'online'
          : status.label === 'Inactive'
            ? 'offline'
            : 'busy',
      verified: Boolean(contact.email),
    },
    location: {
      name: getCountryName(countryCode),
      flag,
    },
    created: '—',
    total: '—',
    price: '—',
    status,
    updated: new Date(contact.updatedAt).toLocaleDateString('en-US'),
    phone: contact.phone || '',
    companyName: contact.company?.name || '',
    timeZone: 'europe/prague',
    contact,
  };
}

type CustomerExtra = {
  companyName?: string;
  timeZone?: string;
};

const CUSTOMER_EXTRAS_KEY = 'crm_customer_extras_v1';

function readCustomerExtras(): Record<string, CustomerExtra> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(CUSTOMER_EXTRAS_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, CustomerExtra>;
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function saveCustomerExtra(contactId: string, extra: CustomerExtra) {
  if (!contactId || typeof window === 'undefined') return;
  const current = readCustomerExtras();
  current[contactId] = {
    companyName: extra.companyName || '',
    timeZone: extra.timeZone || '',
  };
  window.localStorage.setItem(CUSTOMER_EXTRAS_KEY, JSON.stringify(current));
}

function downloadCsv(rows: IData[]) {
  const header = ['ID', 'Name', 'Email', 'Phone', 'Country', 'Status', 'Updated'];
  const body = rows.map((row) => [
    row.id,
    row.customerInfo.title,
    row.customerInfo.label,
    row.phone || '',
    row.location.name,
    row.status.label,
    row.updated,
  ]);

  const csv = [header, ...body]
    .map((r) => r.map((v) => `"${String(v).replaceAll('"', '""')}"`).join(','))
    .join('\n');

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `customers-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function CustomerAvatar({
  image,
  statusColor,
  verified,
  name,
}: {
  image: string;
  statusColor: 'online' | 'offline' | 'busy';
  verified?: boolean;
  name: string;
}) {
  return (
    <Avatar>
      <AvatarImage src={image} alt={name} />
      <AvatarFallback>
        {name
          .split(' ')
          .map((part) => part[0] || '')
          .slice(0, 2)
          .join('')
          .toUpperCase() || 'CU'}
      </AvatarFallback>
      {verified ? (
        <AvatarIndicator className="end-0.5 top-0.5">
          <div className="size-2.5 rounded-full bg-blue-500 border border-white" />
        </AvatarIndicator>
      ) : (
        <AvatarIndicator className="-end-1.5 -top-1.5">
          <AvatarStatus variant={statusColor} className="size-2.5" />
        </AvatarIndicator>
      )}
    </Avatar>
  );
}

export function CustomerListTable({
  displaySheet,
  shouldOpenSheet,
  onSheetClose,
  focusCustomerId,
}: CustomerListProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const [data, setData] = useState<IData[]>([]);
  const [loading, setLoading] = useState(true);
  const [inputValue, setInputValue] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [sorting, setSorting] = useState<SortingState>([{ id: 'updated', desc: true }]);
  const [isCustomerSheetOpen, setIsCustomerSheetOpen] = useState(false);
  const [isCustomerFormOpen, setIsCustomerFormOpen] = useState(false);
  const [customerFormMode, setCustomerFormMode] = useState<'new' | 'edit'>('new');
  const [selectedCustomer, setSelectedCustomer] = useState<IData | null>(null);
  const [submittingForm, setSubmittingForm] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState<IData | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isGroupDeleteDialogOpen, setIsGroupDeleteDialogOpen] = useState(false);

  const loadCustomers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetchContacts({ limit: 1000, contactType: 'customer' });
      const customers = (response?.data ?? []).filter(
        (item) => (item.contactType || '').toLowerCase() === 'customer',
      );
      const extras = readCustomerExtras();
      setData(
        customers.map((contact) => {
          const mapped = toCustomerData(contact);
          const extra = extras[contact.id];
          if (!extra) return mapped;
          return {
            ...mapped,
            companyName: extra.companyName || mapped.companyName,
            timeZone: extra.timeZone || mapped.timeZone,
          };
        }),
      );
    } catch {
      setData([]);
      toast.custom((t) => (
        <Alert variant="mono" icon="destructive" onClose={() => toast.dismiss(t)}>
          <AlertIcon>
            <Info />
          </AlertIcon>
          <AlertTitle>Customer list failed to load</AlertTitle>
        </Alert>
      ));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadCustomers();
    const handleRefresh = () => {
      void loadCustomers();
    };
    window.addEventListener(CRM_CONTACTS_REFRESH_EVENT, handleRefresh);
    return () => window.removeEventListener(CRM_CONTACTS_REFRESH_EVENT, handleRefresh);
  }, [loadCustomers]);

  const handleOpenCustomerDetails = useCallback((customer: IData) => {
    if (!location.pathname.endsWith('/customer-list-details')) {
      navigate(`/core/customer-list-details?customerId=${customer.id}`);
      return;
    }
    setSelectedCustomer(customer);
    setIsCustomerSheetOpen(true);
  }, [location.pathname, navigate]);

  const handleOpenCustomerForm = useCallback((mode: 'new' | 'edit', customer?: IData) => {
    setCustomerFormMode(mode);
    setSelectedCustomer(customer ?? null);
    setIsCustomerFormOpen(true);
  }, []);

  const handleDeleteClick = useCallback((customer: IData) => {
    setCustomerToDelete(customer);
    setIsDeleteDialogOpen(true);
  }, []);

  const handleConfirmDelete = async () => {
    if (!customerToDelete) return;

    try {
      await deleteContact(customerToDelete.id);
      setData((prev) => prev.filter((customer) => customer.id !== customerToDelete.id));
      toast.custom((t) => (
        <Alert variant="mono" icon="success" onClose={() => toast.dismiss(t)}>
          <AlertIcon>
            <Info />
          </AlertIcon>
          <AlertTitle>Customer "{customerToDelete.customerInfo.title}" deleted</AlertTitle>
        </Alert>
      ));
    } catch {
      toast.custom((t) => (
        <Alert variant="mono" icon="destructive" onClose={() => toast.dismiss(t)}>
          <AlertIcon>
            <Info />
          </AlertIcon>
          <AlertTitle>Delete failed</AlertTitle>
        </Alert>
      ));
    } finally {
      setCustomerToDelete(null);
      setIsDeleteDialogOpen(false);
    }
  };

  const handleGroupStatusChange = async (status: CustomerFormValues['status']) => {
    if (selectedRows.length === 0) return;

    const backendStatus = statusToBackend(status);
    await Promise.allSettled(
      selectedRows.map((row) =>
        updateContact(row.id, {
          status: backendStatus,
          contactType: 'customer',
        }),
      ),
    );

    setData((prev) =>
      prev.map((item) =>
        selectedRows.some((selected) => selected.id === item.id)
          ? { ...item, status: parseStatus(backendStatus) }
          : item,
      ),
    );

    toast.custom((t) => (
      <Alert variant="mono" icon="success" onClose={() => toast.dismiss(t)}>
        <AlertIcon>
          <Info />
        </AlertIcon>
        <AlertTitle>Status updated for {selectedRows.length} customers</AlertTitle>
      </Alert>
    ));
  };

  const handleGroupDuplicate = async () => {
    if (selectedRows.length === 0) return;

    const tasks = selectedRows.map((row) => {
      const [firstName, ...last] = row.customerInfo.title.split(' ');
      return createContact({
        firstName: firstName || 'Customer',
        lastName: (last.join(' ').trim() || 'Copy') + ' copy',
        contactType: 'customer',
        email:
          row.customerInfo.label && row.customerInfo.label !== '—'
            ? `copy+${Date.now()}-${row.customerInfo.label}`
            : undefined,
        phone: row.phone || undefined,
        status: statusToBackend(row.status.label.toLowerCase() === 'active' ? 'active' : 'inactive'),
        country: row.contact.country || undefined,
        city: row.contact.city || undefined,
        state: row.contact.state || undefined,
      });
    });

    await Promise.allSettled(tasks);
    await loadCustomers();
    setRowSelection({});
    toast.custom((t) => (
      <Alert variant="mono" icon="success" onClose={() => toast.dismiss(t)}>
        <AlertIcon>
          <Info />
        </AlertIcon>
        <AlertTitle>Duplicated {selectedRows.length} customers</AlertTitle>
      </Alert>
    ));
  };

  const handleGroupExport = () => {
    if (selectedRows.length === 0) return;
    downloadCsv(selectedRows);
    toast.custom((t) => (
      <Alert variant="mono" icon="success" onClose={() => toast.dismiss(t)}>
        <AlertIcon>
          <Info />
        </AlertIcon>
        <AlertTitle>Exported {selectedRows.length} customers</AlertTitle>
      </Alert>
    ));
  };

  const handleConfirmGroupDelete = async () => {
    if (selectedRows.length === 0) {
      setIsGroupDeleteDialogOpen(false);
      return;
    }

    await Promise.allSettled(selectedRows.map((row) => deleteContact(row.id)));
    setData((prev) => prev.filter((item) => !selectedRows.some((row) => row.id === item.id)));
    setRowSelection({});
    setIsGroupDeleteDialogOpen(false);
    toast.custom((t) => (
      <Alert variant="mono" icon="success" onClose={() => toast.dismiss(t)}>
        <AlertIcon>
          <Info />
        </AlertIcon>
        <AlertTitle>Deleted {selectedRows.length} customers</AlertTitle>
      </Alert>
    ));
  };

  const handleSaveCustomer = async (values: CustomerFormValues) => {
    const name = values.fullName.trim();
    if (!name) {
      toast.custom((t) => (
        <Alert variant="mono" icon="destructive" onClose={() => toast.dismiss(t)}>
          <AlertIcon>
            <Info />
          </AlertIcon>
          <AlertTitle>Name is required</AlertTitle>
        </Alert>
      ));
      return;
    }

    const [firstName, ...last] = name.split(' ');
    const payload = {
      firstName: firstName || 'Customer',
      lastName: last.join(' ').trim() || 'Client',
      contactType: 'customer' as const,
      email: values.email || undefined,
      phone: values.phoneNumber || undefined,
      status: statusToBackend(values.status),
      companyId: selectedCustomer?.contact.companyId || undefined,
      country: selectedCustomer?.contact.country || undefined,
      city: selectedCustomer?.contact.city || undefined,
      state: selectedCustomer?.contact.state || undefined,
    };

    try {
      setSubmittingForm(true);
      if (customerFormMode === 'new') {
        const created = await createContact(payload);
        saveCustomerExtra(created.id, {
          companyName: values.companyName,
          timeZone: values.timeZone,
        });
        toast.custom((t) => (
          <Alert variant="mono" icon="success" onClose={() => toast.dismiss(t)}>
            <AlertIcon>
              <Info />
            </AlertIcon>
            <AlertTitle>Customer created</AlertTitle>
          </Alert>
        ));
        setIsCustomerFormOpen(false);
        await loadCustomers();
        navigate(`/core/crm/contacts/${created.id}`);
      } else if (selectedCustomer) {
        await updateContact(selectedCustomer.id, payload);
        saveCustomerExtra(selectedCustomer.id, {
          companyName: values.companyName,
          timeZone: values.timeZone,
        });
        toast.custom((t) => (
          <Alert variant="mono" icon="success" onClose={() => toast.dismiss(t)}>
            <AlertIcon>
              <Info />
            </AlertIcon>
            <AlertTitle>Customer updated</AlertTitle>
          </Alert>
        ));
        setIsCustomerFormOpen(false);
        await loadCustomers();
      }
      dispatchCrmEvent(CRM_CONTACTS_REFRESH_EVENT);
    } catch {
      toast.custom((t) => (
        <Alert variant="mono" icon="destructive" onClose={() => toast.dismiss(t)}>
          <AlertIcon>
            <Info />
          </AlertIcon>
          <AlertTitle>Save failed</AlertTitle>
        </Alert>
      ));
    } finally {
      setSubmittingForm(false);
      onSheetClose?.();
    }
  };

  const ColumnInputFilter = <TData, TValue>({
    column,
  }: IColumnFilterProps<TData, TValue>) => (
    <Input
      placeholder="Filter..."
      value={(column.getFilterValue() as string) ?? ''}
      onChange={(event) => column.setFilterValue(event.target.value)}
      variant="sm"
      className="w-40"
    />
  );

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
        size: 45,
        maxSize: 45,
        minSize: 45,
      },
      {
        id: 'user',
        accessorFn: (row) => row.user,
        header: ({ column }) => <DataGridColumnHeader title="User ID" column={column} />,
        cell: (info) => (
          <span
            className="text-sm text-primary font-medium cursor-pointer hover:text-primary/80 transition-colors"
            onClick={() => handleOpenCustomerDetails(info.row.original)}
          >
            {info.row.original.user}
          </span>
        ),
        enableSorting: true,
        size: 110,
      },
      {
        id: 'customerInfo',
        accessorFn: (row) => row.customerInfo.title,
        header: ({ column }) => (
          <DataGridColumnHeader
            title="Customer"
            filter={<ColumnInputFilter column={column} />}
            column={column}
          />
        ),
        cell: (info) => {
          const customer = info.row.original;
          return (
            <div className="flex items-center gap-2.5">
              <CustomerAvatar
                image={toAbsoluteUrl(`/media/avatars/${customer.customerInfo.image}`)}
                statusColor={customer.customerInfo.statusColor}
                verified={customer.customerInfo.verified}
                name={customer.customerInfo.title}
              />
              <div className="flex flex-col gap-1 truncate">
                <span
                  className="text-sm font-medium text-foreground leading-3.5 cursor-pointer hover:text-primary transition-colors"
                  onClick={() => handleOpenCustomerDetails(customer)}
                >
                  {customer.customerInfo.title}
                </span>
                <span className="text-xs font-normal text-secondary-foreground">
                  {customer.customerInfo.label}
                </span>
              </div>
            </div>
          );
        },
        enableSorting: true,
        size: 240,
      },
      {
        id: 'location',
        accessorFn: (row) => row.location.name,
        header: ({ column }) => (
          <DataGridColumnHeader
            title="Country"
            filter={<ColumnInputFilter column={column} />}
            column={column}
          />
        ),
        cell: (info) => {
          const location = info.row.original.location;
          return (
            <div className="flex items-center gap-1.5">
              <img
                src={toAbsoluteUrl(`/media/flags/${location.flag}`)}
                className="h-4 rounded-full"
                alt={location.name}
                onError={(event) => {
                  (event.currentTarget as HTMLImageElement).src = toAbsoluteUrl('/media/flags/united-nations.svg');
                }}
              />
              <span className="text-sm leading-none text-foreground font-normal">
                {location.name}
              </span>
            </div>
          );
        },
        enableSorting: true,
        size: 130,
      },
      {
        id: 'created',
        accessorFn: (row) => row.created,
        header: ({ column }) => <DataGridColumnHeader title="Orders" column={column} />,
        cell: (info) => info.row.original.created,
        enableSorting: true,
        size: 80,
      },
      {
        id: 'total',
        accessorFn: (row) => row.total,
        header: ({ column }) => <DataGridColumnHeader title="Total Spent" column={column} />,
        cell: (info) => <div>{info.row.original.total}</div>,
        enableSorting: true,
        size: 110,
      },
      {
        id: 'price',
        accessorFn: (row) => row.price,
        header: ({ column }) => <DataGridColumnHeader title="Avg. Spent" column={column} />,
        cell: (info) => <div>{info.row.original.price}</div>,
        enableSorting: true,
        size: 100,
      },
      {
        id: 'status',
        accessorFn: (row) => row.status.label,
        header: ({ column }) => <DataGridColumnHeader title="Status" column={column} />,
        cell: (info) => {
          const status = info.row.original.status;
          const variant = status.variant as BadgeProps['variant'];
          return (
            <Badge variant={variant} appearance="light">
              {status.label}
            </Badge>
          );
        },
        enableSorting: true,
        size: 90,
      },
      {
        id: 'updated',
        accessorFn: (row) => row.updated,
        header: ({ column }) => <DataGridColumnHeader title="Updated" column={column} />,
        cell: (info) => info.row.original.updated,
        enableSorting: true,
        size: 120,
      },
      {
        id: 'actions',
        header: () => '',
        enableSorting: false,
        cell: ({ row }) => (
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              mode="icon"
              onClick={() => handleOpenCustomerDetails(row.original)}
              title="View customer"
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              mode="icon"
              onClick={() => handleOpenCustomerForm('edit', row.original)}
              title="Edit customer"
            >
              <SquarePen className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              mode="icon"
              onClick={() => handleDeleteClick(row.original)}
              title="Delete customer"
            >
              <Trash className="h-4 w-4" />
            </Button>
          </div>
        ),
        size: 110,
      },
    ],
    [handleOpenCustomerDetails, handleOpenCustomerForm, handleDeleteClick],
  );

  const filteredData = useMemo(() => {
    if (!searchQuery) return data;
    const query = searchQuery.toLowerCase();
    return data.filter((item) => {
      const text = [
        item.user,
        item.customerInfo.title,
        item.customerInfo.label,
        item.phone || '',
        item.location.name,
      ]
        .join(' ')
        .toLowerCase();
      return text.includes(query);
    });
  }, [data, searchQuery]);

  useEffect(() => {
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  }, [searchQuery]);

  useEffect(() => {
    setInputValue(searchQuery);
  }, [searchQuery]);

  const table = useReactTable({
    data: filteredData,
    columns,
    state: {
      pagination: {
        pageIndex: pagination.pageIndex,
        pageSize: 10,
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
  });

  const selectedRows = useMemo(
    () => table.getSelectedRowModel().rows.map((row) => row.original),
    [table],
  );

  useEffect(() => {
    const handleExportAll = () => {
      if (data.length === 0) {
        toast.custom((t) => (
          <Alert variant="mono" icon="destructive" onClose={() => toast.dismiss(t)}>
            <AlertIcon>
              <Info />
            </AlertIcon>
            <AlertTitle>No customers to export</AlertTitle>
          </Alert>
        ));
        return;
      }
      downloadCsv(data);
      toast.custom((t) => (
        <Alert variant="mono" icon="success" onClose={() => toast.dismiss(t)}>
          <AlertIcon>
            <Info />
          </AlertIcon>
          <AlertTitle>Exported all customers ({data.length})</AlertTitle>
        </Alert>
      ));
    };

    const handleDeleteSelected = () => {
      if (selectedRows.length === 0) {
        toast.custom((t) => (
          <Alert variant="mono" icon="destructive" onClose={() => toast.dismiss(t)}>
            <AlertIcon>
              <Info />
            </AlertIcon>
            <AlertTitle>Select customers first</AlertTitle>
          </Alert>
        ));
        return;
      }
      setIsGroupDeleteDialogOpen(true);
    };

    window.addEventListener('customer-list:export-all', handleExportAll);
    window.addEventListener('customer-list:delete-selected', handleDeleteSelected);
    return () => {
      window.removeEventListener('customer-list:export-all', handleExportAll);
      window.removeEventListener('customer-list:delete-selected', handleDeleteSelected);
    };
  }, [data, selectedRows]);

  useEffect(() => {
    table.setPageIndex(0);
  }, [table, searchQuery]);

  useEffect(() => {
    if (!displaySheet || !shouldOpenSheet) return;
    if (displaySheet === 'createCustomer') {
      handleOpenCustomerForm('new');
      return;
    }
    if (displaySheet === 'editCustomer') {
      const target = focusCustomerId
        ? filteredData.find((item) => item.id === focusCustomerId)
        : filteredData[0];
      if (target) handleOpenCustomerForm('edit', target);
      return;
    }
    if (displaySheet === 'customerDetails' && filteredData.length > 0) {
      const target = focusCustomerId
        ? filteredData.find((item) => item.id === focusCustomerId)
        : filteredData[0];
      if (target) handleOpenCustomerDetails(target);
    }
  }, [displaySheet, shouldOpenSheet, filteredData, focusCustomerId, handleOpenCustomerDetails, handleOpenCustomerForm]);

  const handleCustomerFormClose = (open: boolean) => {
    setIsCustomerFormOpen(open);
    if (!open) onSheetClose?.();
  };

  const handleCustomerDetailsClose = (open: boolean) => {
    setIsCustomerSheetOpen(open);
    if (!open) onSheetClose?.();
  };

  const handleClearInput = () => {
    setInputValue('');
    setSearchQuery('');
    inputRef.current?.focus();
  };

  const selectedRowsCount = selectedRows.length;
  const totalRowsCount = filteredData.length;

  const BottomActionBar = () => {
    if (selectedRowsCount === 0) return null;

    return (
      <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-300">
        <div className="dark bg-zinc-950 text-white rounded-xl px-2 py-1 shadow-lg border">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium ps-3 pe-1">
              {selectedRowsCount} of {totalRowsCount} selected
            </span>

            <Separator className="h-10" orientation="vertical" />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="dark">
                  <LinkIcon className="h-4 w-4 mr-2" />
                  Change status
                  <ChevronUp className="h-4 w-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="center" className="dark">
                <DropdownMenuItem onClick={() => void handleGroupStatusChange('active')}>
                  Active
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => void handleGroupStatusChange('inactive')}>
                  Inactive
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => void handleGroupStatusChange('pending')}>
                  Pending
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => void handleGroupStatusChange('banned')}>
                  Banned
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Separator className="h-8 bg-zinc-700" orientation="vertical" />

            <Button variant="ghost" size="sm" onClick={() => void handleGroupDuplicate()}>
              <Copy className="h-4 w-4 mr-2" />
              Duplicate
            </Button>

            <Separator className="h-8 bg-zinc-700" orientation="vertical" />

            <Button variant="ghost" size="sm" onClick={handleGroupExport}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>

            <Separator className="h-8 bg-zinc-700" orientation="vertical" />

            <Button variant="ghost" size="sm" onClick={() => setIsGroupDeleteDialogOpen(true)}>
              <Trash className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div>
      <Card>
        <CardHeader className="py-3 flex-nowrap">
          <div className="flex items-center justify-between w-full">
            <h3 className="text-base font-semibold text-foreground leading-0">
              Customers {loading ? '(loading...)' : `(${filteredData.length})`}
            </h3>
            <CardToolbar className="flex items-center gap-2">
              <div className="w-full max-w-[240px]">
                <InputWrapper>
                  <Search />
                  <Input
                    placeholder="Search customer"
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
            </CardToolbar>
          </div>
        </CardHeader>

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
      </Card>

      <BottomActionBar />

      <CustomerDetailsSheet
        open={isCustomerSheetOpen}
        onOpenChange={handleCustomerDetailsClose}
        customer={selectedCustomer}
        onOpenCrmCard={() => {
          if (!selectedCustomer) return;
          setIsCustomerSheetOpen(false);
          navigate(`/core/crm/contacts/${selectedCustomer.id}`);
        }}
        onEditClick={() => {
          if (!selectedCustomer) return;
          setIsCustomerSheetOpen(false);
          handleOpenCustomerForm('edit', selectedCustomer);
        }}
      />

      <CustomerFormSheet
        mode={customerFormMode}
        open={isCustomerFormOpen}
        onOpenChange={handleCustomerFormClose}
        initialCustomer={selectedCustomer}
        submitting={submittingForm}
        onSubmit={handleSaveCustomer}
      />

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Customer</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{customerToDelete?.customerInfo.title}</strong>?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={() => void handleConfirmDelete()}>
              Delete Customer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={isGroupDeleteDialogOpen} onOpenChange={setIsGroupDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Selected Customers</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{selectedRowsCount} customers</strong>?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsGroupDeleteDialogOpen(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={() => void handleConfirmGroupDelete()}>
              Delete {selectedRowsCount} Customers
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
