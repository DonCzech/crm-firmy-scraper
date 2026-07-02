'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
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
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Alert, AlertIcon, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toAbsoluteUrl } from '@/lib/helpers';
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
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CreateShippingLabelSheet } from '../components/create-shipping-label-sheet';
import { TrackShippingSheet } from '../components/track-shipping-sheet';
import { ProductInfoSheet } from '../components/product-info-sheet';
import type { VariantProps } from 'class-variance-authority';
import { Settings, Pencil } from 'lucide-react';
import { DropdownMenuLabel, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import {
  BackendOrder,
  deleteOrder,
  fetchOrders,
  updateOrder,
} from '@/crm/services/backend';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { DateRange } from 'react-day-picker';

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

export interface OrderListData {
  deliveryStatus: {
    label: string;
    variant: VariantProps<typeof Badge>['variant'];
  };
  customer: string;
  date: string;
  order: string;
  id: string;
  total: string;
  paymentStatus: {
    label: string;
    variant: VariantProps<typeof Badge>['variant'];
  };
  items: number;
  customerEmail?: string;
  currency?: string;
  paymentStatusCode?: string;
  deliveryStatusCode?: string;
  carrier: {
    name: string;
    logo: string;
  };
  category: string;
  products?: OrderItemData[];
  orderDateISO?: string;
}

interface OrderListProps {
  mockData?: OrderListData[];
  displayProducts?: boolean;
  reloadToken?: number;
  dateRange?: DateRange;
  categoryFilter?: string;
  onStatsChange?: (stats: {
    total: number;
    attention: number;
    paid: number;
    pending: number;
    failed: number;
  }) => void;
}

// ---- MOCK DATA ----
const orderItemsMockData: OrderItemData[] = [
  {
    id: '1',
    productInfo: {
      image: '11.png',
      title: 'Air Max 270 React Eng...',
      label: 'WM-8421',
      tooltip: 'Air Max 270 React Engineered - Premium sneakers with advanced cushioning technology',
    },
    category: 'Sneakers',
    price: '$83.00',
    trends: {
      label: 'Fast Moving',
      variant: 'success',
    },
    stock: 92,
    reserved: 5,
    thresholdLevel: 110,
    supplier: {
      name: 'SwiftStock',
      logo: 'clusterhq.svg',
    },
  },
  {
    id: '2',
    productInfo: {
      image: '10.png',
      title: 'Trail Runner Z2',
      label: 'UC-3990',
      tooltip: 'Trail Runner Z2 - High-performance outdoor running shoes with superior grip',
    },
    category: 'Outdoor',
    price: '$110.00',
    trends: {
      label: 'Promo',
      variant: 'info',
    },
    stock: 12,
    reserved: 3,
    thresholdLevel: 250,
    supplier: {
      name: 'NexaSource',
      logo: 'coinhodler.svg',
    },
  },
  {
    id: '3',
    productInfo: {
      image: '9.png',
      title: 'Urban Flex Knit Low...',
      label: 'KB-8820',
      tooltip: 'Urban Flex Knit Low - Comfortable urban running shoes with flexible knit upper',
    },
    category: 'Runners',
    price: '$76.50',
    trends: {
      label: 'Clearance',
      variant: 'warning',
    },
    stock: 47,
    reserved: 9,
    thresholdLevel: 40,
    supplier: {
      name: 'CoreMart',
      logo: 'infography.svg',
    },
  },
  {
    id: '4',
    productInfo: {
      image: '8.png',
      title: 'Blaze Street Classic',
      label: 'LS-1033',
      tooltip: 'Blaze Street Classic - Timeless street style sneakers with modern comfort',
    },
    category: 'Sneakers',
    price: '$69.99',
    trends: {
      label: 'Slow Moving',
      variant: 'destructive',
    },
    stock: 0,
    reserved: 0,
    thresholdLevel: 100,
    supplier: {
      name: 'StockLab',
      logo: 'clusterhq.svg',
    },
  },
];

const mockData: OrderListData[] = [
  {
    id: '1',
    order: 'SO-TX-4587',
    date: '18 Aug, 2025',
    customer: 'John Smith',
    total: '$372.93',
    paymentStatus: {
      label: 'Paid',
      variant: 'success',
    },
    items: 2,
    deliveryStatus: {
      label: 'Shipped',
      variant: 'primary',
    },
    carrier: {
      name: 'UPS Global',
      logo: 'ups.svg',
    },
    category: 'Electronics',
  },
  {
    id: '2',
    order: 'SO-TX-4590',
    date: '17 Aug, 2025',
    customer: 'Sarah Lee',
    total: '$245.10',
    paymentStatus: {
      label: 'Paid',
      variant: 'success',
    },
    items: 1,
    deliveryStatus: {
      label: 'Processing',
      variant: 'info',
    },
    carrier: {
      name: 'FedEx Standard',
      logo: 'fedEx.svg',
    },
    category: 'Clothing',
  },
  {
    id: '3',
    order: 'SO-CA-1254',
    date: '16 Aug, 2025',
    customer: 'Sarah Lee',
    total: '$1,024.50',
    paymentStatus: {
      label: 'Pending',
      variant: 'info',
    },
    items: 3,
    deliveryStatus: {
      label: 'Delivered',
      variant: 'success',
    },
    carrier: {
      name: 'PostNL',
      logo: 'postNl.svg',
    },
    category: 'Home & Garden',
  },
  {
    id: '4',
    order: 'SO-NY-8874',
    date: '12 Aug, 2025',
    customer: 'Emily Carter',
    total: '$540.00',
    paymentStatus: {
      label: 'Failed',
      variant: 'destructive',
    },
    items: 2,
    deliveryStatus: {
      label: 'Shipped',
      variant: 'primary',
    },
    carrier: {
      name: 'UPS Global',
      logo: 'ups.svg',
    },
    category: 'Electronics',
  },
  {
    id: '5',
    order: 'SO-FL-5633',
    date: '5 Aug, 2025',
    customer: 'Liam Johnson',
    total: '$120.99',
    paymentStatus: {
      label: 'Paid',
      variant: 'success',
    },
    items: 3,
    deliveryStatus: {
      label: 'On Hold',
      variant: 'secondary',
    },
    carrier: {
      name: 'DHL Express',
      logo: 'dhl.svg',
    },
    category: 'Electronics',
  },
  {
    id: '6',
    order: 'SO-TX-4593',
    date: '29 Jul, 2025',
    customer: 'Olivia Brown',
    total: '$799.00',
    paymentStatus: {
      label: 'Cancelled',
      variant: 'warning',
    },
    items: 3,
    deliveryStatus: {
      label: 'Shipped',
      variant: 'primary',
    },
    carrier: {
      name: 'UPS Global',
      logo: 'ups.svg',
    },
    category: 'Electronics',
  },
  {
    id: '7',
    order: 'SO-CA-1255',
    date: '23 Jul, 2025',
    customer: 'Noah Wilson',
    total: '$215.75',
    paymentStatus: {
      label: 'Paid',
      variant: 'success',
    },
    items: 1,
    deliveryStatus: {
      label: 'Canceled',
      variant: 'warning',
    },
    carrier: {
      name: 'PostNL',
      logo: 'postNl.svg',
    },
    category: 'Electronics',
  },
  {
    id: '8',
    order: 'SO-NV-7755',
    date: '20 Jul, 2025',
    customer: 'Ava Martinez',
    total: '$430.20',
    paymentStatus: {
      label: 'Paid',
      variant: 'success',
    },
    items: 4,
    deliveryStatus: {
      label: 'Shipped',
      variant: 'primary',
    },
    carrier: {
      name: 'In-Store Pickup',
      logo: 'postNl.svg',
    },
    category: 'Electronics',
  },
  {
    id: '9',
    order: 'SO-WA-3321',
    date: '17 Jul, 2025',
    customer: 'Ethan Davis',
    total: '$620.00',
    paymentStatus: {
      label: 'Paid',
      variant: 'success',
    },
    items: 2,
    deliveryStatus: {
      label: 'Processing',
      variant: 'info',
    },
    carrier: {
      name: 'UPS Global',
      logo: 'ups.svg',
    },
    category: 'Electronics',
  },
  {
    id: '10',
    order: 'SO-IL-9912',
    date: '11 Jul, 2025',
    customer: 'Mia Anderson',
    total: '$980.49',
    paymentStatus: {
      label: 'Pending',
      variant: 'info',
    },
    items: 8,
    deliveryStatus: {
      label: 'On Hold',
      variant: 'secondary',
    },
    carrier: {
      name: 'PostNL',
      logo: 'postNl.svg',
    },
    category: 'Electronics',
  },
  {
    id: '11',
    order: 'SO-CA-1256',
    date: '8 Jul, 2025',
    customer: 'Lucas Garcia',
    total: '$345.67',
    paymentStatus: {
      label: 'Paid',
      variant: 'success',
    },
    items: 2,
    deliveryStatus: {
      label: 'Delivered',
      variant: 'success',
    },
    carrier: {
      name: 'FedEx Standard',
      logo: 'fedEx.svg',
    },
    category: 'Clothing',
  },
  {
    id: '12',
    order: 'SO-TX-4594',
    date: '5 Jul, 2025',
    customer: 'Emma Wilson',
    total: '$1,250.00',
    paymentStatus: {
      label: 'Paid',
      variant: 'success',
    },
    items: 5,
    deliveryStatus: {
      label: 'Shipped',
      variant: 'primary',
    },
    carrier: {
      name: 'DHL Express',
      logo: 'dhl.svg',
    },
    category: 'Home & Garden',
  },
  {
    id: '13',
    order: 'SO-NY-8875',
    date: '2 Jul, 2025',
    customer: 'James Taylor',
    total: '$89.99',
    paymentStatus: {
      label: 'Failed',
      variant: 'destructive',
    },
    items: 1,
    deliveryStatus: {
      label: 'Processing',
      variant: 'info',
    },
    carrier: {
      name: 'UPS Global',
      logo: 'ups.svg',
    },
    category: 'Electronics',
  },
  {
    id: '14',
    order: 'SO-FL-5634',
    date: '29 Jun, 2025',
    customer: 'Sophia Rodriguez',
    total: '$567.89',
    paymentStatus: {
      label: 'Paid',
      variant: 'success',
    },
    items: 3,
    deliveryStatus: {
      label: 'On Hold',
      variant: 'secondary',
    },
    carrier: {
      name: 'PostNL',
      logo: 'postNl.svg',
    },
    category: 'Electronics',
  },
  {
    id: '15',
    order: 'SO-TX-4595',
    date: '26 Jun, 2025',
    customer: 'Benjamin Lee',
    total: '$2,100.50',
    paymentStatus: {
      label: 'Cancelled',
      variant: 'warning',
    },
    items: 7,
    deliveryStatus: {
      label: 'Canceled',
      variant: 'warning',
    },
    carrier: {
      name: 'FedEx Standard',
      logo: 'fedEx.svg',
    },
    category: 'Electronics',
  },
  {
    id: '16',
    order: 'SO-CA-1257',
    date: '23 Jun, 2025',
    customer: 'Isabella Martinez',
    total: '$445.75',
    paymentStatus: {
      label: 'Paid',
      variant: 'success',
    },
    items: 2,
    deliveryStatus: {
      label: 'Delivered',
      variant: 'success',
    },
    carrier: {
      name: 'DHL Express',
      logo: 'dhl.svg',
    },
    category: 'Clothing',
  },
  {
    id: '17',
    order: 'SO-NV-7756',
    date: '20 Jun, 2025',
    customer: 'Mason Thompson',
    total: '$789.25',
    paymentStatus: {
      label: 'Pending',
      variant: 'info',
    },
    items: 4,
    deliveryStatus: {
      label: 'Processing',
      variant: 'info',
    },
    carrier: {
      name: 'UPS Global',
      logo: 'ups.svg',
    },
    category: 'Home & Garden',
  },
  {
    id: '18',
    order: 'SO-WA-3322',
    date: '17 Jun, 2025',
    customer: 'Aria Johnson',
    total: '$156.00',
    paymentStatus: {
      label: 'Paid',
      variant: 'success',
    },
    items: 1,
    deliveryStatus: {
      label: 'Shipped',
      variant: 'primary',
    },
    carrier: {
      name: 'PostNL',
      logo: 'postNl.svg',
    },
    category: 'Electronics',
  },
  {
    id: '19',
    order: 'SO-IL-9913',
    date: '14 Jun, 2025',
    customer: 'Ethan Davis',
    total: '$890.30',
    paymentStatus: {
      label: 'Failed',
      variant: 'destructive',
    },
    items: 3,
    deliveryStatus: {
      label: 'On Hold',
      variant: 'secondary',
    },
    carrier: {
      name: 'FedEx Standard',
      logo: 'fedEx.svg',
    },
    category: 'Electronics',
  },
  {
    id: '20',
    order: 'SO-CA-1258',
    date: '11 Jun, 2025',
    customer: 'Olivia Brown',
    total: '$1,450.00',
    paymentStatus: {
      label: 'Paid',
      variant: 'success',
    },
    items: 6,
    deliveryStatus: {
      label: 'Delivered',
      variant: 'success',
    },
    carrier: {
      name: 'DHL Express',
      logo: 'dhl.svg',
    },
    category: 'Home & Garden',
  },
  {
    id: '21',
    order: 'SO-TX-4596',
    date: '8 Jun, 2025',
    customer: 'Noah Wilson',
    total: '$234.56',
    paymentStatus: {
      label: 'Paid',
      variant: 'success',
    },
    items: 2,
    deliveryStatus: {
      label: 'Shipped',
      variant: 'primary',
    },
    carrier: {
      name: 'UPS Global',
      logo: 'ups.svg',
    },
    category: 'Clothing',
  },
  {
    id: '22',
    order: 'SO-NY-8876',
    date: '5 Jun, 2025',
    customer: 'Ava Garcia',
    total: '$678.90',
    paymentStatus: {
      label: 'Cancelled',
      variant: 'warning',
    },
    items: 4,
    deliveryStatus: {
      label: 'Canceled',
      variant: 'warning',
    },
    carrier: {
      name: 'PostNL',
      logo: 'postNl.svg',
    },
    category: 'Electronics',
  },
  {
    id: '23',
    order: 'SO-FL-5635',
    date: '2 Jun, 2025',
    customer: 'William Rodriguez',
    total: '$345.67',
    paymentStatus: {
      label: 'Paid',
      variant: 'success',
    },
    items: 1,
    deliveryStatus: {
      label: 'Processing',
      variant: 'info',
    },
    carrier: {
      name: 'FedEx Standard',
      logo: 'fedEx.svg',
    },
    category: 'Clothing',
  },
  {
    id: '24',
    order: 'SO-TX-4597',
    date: '30 May, 2025',
    customer: 'Sofia Martinez',
    total: '$1,890.25',
    paymentStatus: {
      label: 'Paid',
      variant: 'success',
    },
    items: 8,
    deliveryStatus: {
      label: 'Delivered',
      variant: 'success',
    },
    carrier: {
      name: 'DHL Express',
      logo: 'dhl.svg',
    },
    category: 'Home & Garden',
  },
  {
    id: '25',
    order: 'SO-CA-1259',
    date: '27 May, 2025',
    customer: 'Henry Thompson',
    total: '$567.89',
    paymentStatus: {
      label: 'Pending',
      variant: 'info',
    },
    items: 3,
    deliveryStatus: {
      label: 'On Hold',
      variant: 'secondary',
    },
    carrier: {
      name: 'UPS Global',
      logo: 'ups.svg',
    },
    category: 'Electronics',
  },
];

// ---- TABS ----
const tabs = [
  { id: 'all', label: 'All' },
  { id: 'in-transit', label: 'In Transit' },
  { id: 'delivered', label: 'Delivered' },
  { id: 'returns', label: 'Returns' },
  { id: 'canceled', label: 'Canceled' },
];

const CARRIER_LOGO_BY_NAME: Record<string, string> = {
  'UPS Global': 'ups.svg',
  'FedEx Standard': 'fedEx.svg',
  'DHL Express': 'dhl.svg',
  PostNL: 'postNl.svg',
  'In-Store Pickup': 'postNl.svg',
};

function formatOrderDate(date: string): string {
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return date;
  return parsed.toLocaleDateString('en-US', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function parseOrderDateValue(row: OrderListData): Date | null {
  const candidate = row.orderDateISO || row.date;
  const parsed = new Date(candidate);
  if (!Number.isNaN(parsed.getTime())) return parsed;
  return null;
}

function formatOrderTotal(amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat('cs-CZ', {
      style: 'currency',
      currency: currency || 'CZK',
      maximumFractionDigits: 2,
    }).format(amount ?? 0);
  } catch {
    return `${amount ?? 0} ${currency || 'CZK'}`;
  }
}

function paymentStatusToBadge(status: string): OrderListData['paymentStatus'] {
  switch ((status || '').toLowerCase()) {
    case 'paid':
      return { label: 'Paid', variant: 'success' };
    case 'failed':
      return { label: 'Failed', variant: 'destructive' };
    case 'cancelled':
      return { label: 'Cancelled', variant: 'warning' };
    case 'refunded':
      return { label: 'Refunded', variant: 'secondary' };
    case 'pending':
    default:
      return { label: 'Pending', variant: 'info' };
  }
}

function deliveryStatusToBadge(status: string): OrderListData['deliveryStatus'] {
  switch ((status || '').toLowerCase()) {
    case 'shipped':
      return { label: 'Shipped', variant: 'primary' };
    case 'delivered':
      return { label: 'Delivered', variant: 'success' };
    case 'on_hold':
      return { label: 'On Hold', variant: 'secondary' };
    case 'returned':
      return { label: 'Returned', variant: 'warning' };
    case 'canceled':
      return { label: 'Canceled', variant: 'warning' };
    case 'processing':
    default:
      return { label: 'Processing', variant: 'info' };
  }
}

function toOrderItemData(items: BackendOrder['items']): OrderItemData[] {
  return items.map((item) => ({
    id: item.id,
    productInfo: {
      image: item.image || '11.png',
      title: item.productName,
      label: item.sku || '-',
      tooltip: item.productName,
    },
    category: item.category || 'General',
    price: formatOrderTotal(item.totalPrice, 'CZK'),
    trends: {
      label: item.trendLabel || 'Standard',
      variant: (item.trendVariant as VariantProps<typeof Badge>['variant']) || 'secondary',
    },
    stock: item.stock ?? 0,
    reserved: item.reserved ?? 0,
    thresholdLevel: item.thresholdLevel ?? 0,
    supplier: {
      name: item.supplierName || 'Supplier',
      logo: item.supplierLogo || 'clusterhq.svg',
    },
  }));
}

function mapBackendOrderToRow(order: BackendOrder): OrderListData {
  return {
    id: order.id,
    order: order.orderNumber,
    date: formatOrderDate(order.orderDate),
    customer: order.customerName,
    customerEmail: order.customerEmail,
    total: formatOrderTotal(order.total, order.currency),
    currency: order.currency,
    paymentStatusCode: order.paymentStatus,
    deliveryStatusCode: order.deliveryStatus,
    paymentStatus: paymentStatusToBadge(order.paymentStatus),
    items: order.items.length,
    deliveryStatus: deliveryStatusToBadge(order.deliveryStatus),
    carrier: {
      name: order.carrierName || 'Carrier',
      logo: order.carrierLogo || CARRIER_LOGO_BY_NAME[order.carrierName || ''] || 'ups.svg',
    },
    category: order.category || 'General',
    products: toOrderItemData(order.items),
    orderDateISO: order.orderDate,
  };
}

// ---- MAIN TABLE COMPONENT ----
export function OrderListTable({
  mockData: propsMockData,
  displayProducts = false,
  reloadToken,
  dateRange,
  categoryFilter,
  onStatsChange,
}: OrderListProps & { displayProducts?: boolean }) {
  const navigate = useNavigate();
  const [apiData, setApiData] = useState<OrderListData[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);
  const [ordersError, setOrdersError] = useState<string | null>(null);

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [sorting, setSorting] = useState<SortingState>([]);
  const [expandedRows, setExpandedRows] = useState<ExpandedState>({});

  const [trackShippingSheetOpen, setTrackShippingSheetOpen] = useState(false);

  const [createShippingSheetOpen, setCreateShippingSheetOpen] = useState(false);

  const [productInfoSheetOpen, setProductInfoSheetOpen] = useState(false);

  const [createModalData] = useState<OrderListData | null>(null);

  const [activeTab, setActiveTab] = useState<string>('all');
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<OrderListData | null>(null);
  const [editCustomerName, setEditCustomerName] = useState('');
  const [editCustomerEmail, setEditCustomerEmail] = useState('');
  const [editPaymentStatus, setEditPaymentStatus] = useState('pending');
  const [editDeliveryStatus, setEditDeliveryStatus] = useState('processing');

  const rawData = useMemo(() => {
    if (propsMockData) return propsMockData;
    return apiData;
  }, [propsMockData, apiData]);

  const loadOrders = useCallback(async () => {
    try {
      setIsLoadingOrders(true);
      setOrdersError(null);
      const response = await fetchOrders({ page: 1, limit: 200 });
      setApiData(response.data.map(mapBackendOrderToRow));
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unable to load orders from backend API.';
      setOrdersError(message);
      setApiData([]);
    } finally {
      setIsLoadingOrders(false);
    }
  }, []);

  useEffect(() => {
    if (propsMockData) return;
    void loadOrders();
  }, [propsMockData, reloadToken, loadOrders]);

  const openEditDialog = (row: OrderListData) => {
    setEditTarget(row);
    setEditCustomerName(row.customer);
    setEditCustomerEmail(row.customerEmail || '');
    setEditPaymentStatus(row.paymentStatusCode || 'pending');
    setEditDeliveryStatus(row.deliveryStatusCode || 'processing');
    setEditDialogOpen(true);
  };

  const handleEditSave = async () => {
    if (!editTarget) return;
    try {
      await updateOrder(editTarget.id, {
        customerName: editCustomerName.trim() || editTarget.customer,
        customerEmail: editCustomerEmail.trim() || undefined,
        paymentStatus: editPaymentStatus as 'pending' | 'paid' | 'failed' | 'cancelled' | 'refunded',
        deliveryStatus: editDeliveryStatus as
          | 'processing'
          | 'shipped'
          | 'delivered'
          | 'on_hold'
          | 'canceled'
          | 'returned',
      });
      toast.success('Order updated');
      setEditDialogOpen(false);
      await loadOrders();
      window.dispatchEvent(new Event('order-list:changed'));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update order');
    }
  };

  const handleDeleteOrder = useCallback(async (row: OrderListData) => {
    try {
      await deleteOrder(row.id);
      toast.success('Order deleted');
      await loadOrders();
      window.dispatchEvent(new Event('order-list:changed'));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete order');
    }
  }, [loadOrders]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  const scopedData = useMemo(() => {
    const normalizedCategory = (categoryFilter || '').trim().toLowerCase();
    const start = dateRange?.from ? new Date(dateRange.from) : null;
    const end = dateRange?.to ? new Date(dateRange.to) : null;
    if (start) start.setHours(0, 0, 0, 0);
    if (end) end.setHours(23, 59, 59, 999);

    return rawData.filter((row) => {
      if (normalizedCategory && normalizedCategory !== 'all') {
        if (!(row.category || '').toLowerCase().includes(normalizedCategory)) return false;
      }

      if (!start && !end) return true;

      const rowDate = parseOrderDateValue(row);
      if (!rowDate) return false;
      if (start && rowDate < start) return false;
      if (end && rowDate > end) return false;
      return true;
    });
  }, [rawData, categoryFilter, dateRange?.from, dateRange?.to]);

  // --- TAB FILTERING ---
  const filteredData = useMemo(() => {
    switch (activeTab) {
      case 'in-transit':
        return scopedData.filter((d) => d.deliveryStatus.label === 'Shipped');
      case 'delivered':
        return scopedData.filter((d) => d.deliveryStatus.label === 'Delivered');
      case 'returns':
        return scopedData.filter(
          (d) =>
            d.paymentStatus.label === 'Refunded' ||
            d.deliveryStatus.label === 'Returned',
        );
      case 'canceled':
        return scopedData.filter(
          (d) =>
            d.deliveryStatus.label === 'On Hold' ||
            d.deliveryStatus.label === 'Canceled' ||
            d.paymentStatus.label === 'Failed' ||
            d.paymentStatus.label === 'Cancelled',
        );
      case 'all':
      default:
        return scopedData;
    }
  }, [activeTab, scopedData]);

  const tabBadges = useMemo(() => {
    const all = scopedData.length;
    const inTransit = scopedData.filter((d) => d.deliveryStatus.label === 'Shipped').length;
    const delivered = scopedData.filter((d) => d.deliveryStatus.label === 'Delivered').length;
    const returns = scopedData.filter(
      (d) =>
        d.paymentStatus.label === 'Refunded' || d.deliveryStatus.label === 'Returned',
    ).length;
    const canceled = scopedData.filter(
      (d) =>
        d.deliveryStatus.label === 'On Hold' ||
        d.deliveryStatus.label === 'Canceled' ||
        d.paymentStatus.label === 'Failed' ||
        d.paymentStatus.label === 'Cancelled',
    ).length;

    return { all, inTransit, delivered, returns, canceled };
  }, [scopedData]);

  useEffect(() => {
    if (!onStatsChange) return;
    const total = scopedData.length;
    const paid = scopedData.filter((d) => d.paymentStatus.label === 'Paid').length;
    const pending = scopedData.filter((d) => d.paymentStatus.label === 'Pending').length;
    const failed = scopedData.filter(
      (d) => d.paymentStatus.label === 'Failed' || d.paymentStatus.label === 'Cancelled',
    ).length;
    const attention = scopedData.filter(
      (d) =>
        d.paymentStatus.label === 'Pending' ||
        d.paymentStatus.label === 'Failed' ||
        d.paymentStatus.label === 'Cancelled' ||
        d.deliveryStatus.label === 'Processing' ||
        d.deliveryStatus.label === 'On Hold' ||
        d.deliveryStatus.label === 'Canceled' ||
        d.deliveryStatus.label === 'Returned',
    ).length;
    onStatsChange({ total, attention, paid, pending, failed });
  }, [scopedData, onStatsChange]);

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
  const columns = useMemo<ColumnDef<OrderListData>[]>(
    () => [
      {
        accessorKey: 'id',
        accessorFn: (row) => row.id,
        header: () => <DataGridTableRowSelectAll />,
        cell: ({ row }) => <DataGridTableRowSelect row={row} />,
        enableSorting: false,
        enableHiding: false,
        enableResizing: false,
        size: 50,
        meta: {
          cellClassName: '',
        },
      },
      {
        id: 'order',
        accessorFn: (row) => row.order,
        header: ({ column }) => (
          <DataGridColumnHeader title="OrderId" column={column} />
        ),
        cell: (info) => (
          <button
            type="button"
            className="text-2sm text-primary font-normal"
            onClick={() => {
              navigate(`/core/order-details?orderId=${encodeURIComponent(info.row.original.id)}`);
            }}
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
        id: 'customer',
        accessorFn: (row) => row.customer,
        header: ({ column }) => (
          <DataGridColumnHeader title="Customer" column={column} />
        ),
        cell: (info) => info.row.original.customer,
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
          <DataGridColumnHeader title="Payment Status" column={column} />
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
        size: 130,
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
        id: 'deliveryStatus',
        accessorFn: (row) => row.deliveryStatus,
        header: ({ column }) => (
          <DataGridColumnHeader title="Delivery Status" column={column} />
        ),
        cell: (info) => {
          const ds = info.row.original.deliveryStatus;
          return (
            <Badge variant={ds.variant} appearance="light">
              {ds.label}
            </Badge>
          );
        },
        enableSorting: true,
        size: 130,
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
        size: 150,
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
                  onClick={() => {
                    navigate(`/core/order-details?orderId=${encodeURIComponent(row.original.id)}`);
                  }}
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
                <DropdownMenuItem onClick={() => openEditDialog(row.original)}>
                  <Settings />
                  Edit Order
                </DropdownMenuItem>
                <DropdownMenuItem
                  variant="destructive"
                  onClick={() => handleDeleteOrder(row.original)}
                >
                  <Trash />
                  Delete Order
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ),
        size: 80,
          meta: {
           expandedContent: (row) => (
             <OrderItemsSubTable items={row.original.products || orderItemsMockData} />
           ),
         },
      },
    ],
    [displayProducts, navigate, handleDeleteOrder],
  );

  const selectedRows = useMemo(() => {
    const ids = new Set(
      Object.entries(rowSelection)
        .filter(([, value]) => Boolean(value))
        .map(([id]) => id),
    );
    return filteredData.filter((row) => ids.has(row.id));
  }, [filteredData, rowSelection]);

  const exportRowsToCsv = useCallback((rows: OrderListData[], filename: string) => {
    const headers = [
      'Order Number',
      'Date',
      'Customer',
      'Email',
      'Category',
      'Total',
      'Payment Status',
      'Delivery Status',
      'Carrier',
      'Items',
    ];
    const escape = (value: unknown) => `"${String(value ?? '').replace(/"/g, '""')}"`;
    const lines = rows.map((row) =>
      [
        row.order,
        row.date,
        row.customer,
        row.customerEmail || '',
        row.category,
        row.total,
        row.paymentStatus.label,
        row.deliveryStatus.label,
        row.carrier.name,
        row.items,
      ]
        .map(escape)
        .join(','),
    );
    const csv = [headers.join(','), ...lines].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }, []);

  const handleDeleteSelected = useCallback(async () => {
    if (selectedRows.length === 0) {
      toast.info('No orders selected');
      return;
    }
    if (propsMockData) {
      toast.info('Bulk delete is available only for live backend data');
      return;
    }

    const results = await Promise.allSettled(selectedRows.map((row) => deleteOrder(row.id)));
    const successCount = results.filter((r) => r.status === 'fulfilled').length;
    const failCount = results.length - successCount;
    if (successCount > 0) toast.success(`${successCount} orders deleted`);
    if (failCount > 0) toast.error(`${failCount} orders failed to delete`);
    setRowSelection({});
    await loadOrders();
    window.dispatchEvent(new Event('order-list:changed'));
  }, [selectedRows, propsMockData, loadOrders]);

  useEffect(() => {
    const exportAll = () => {
      if (filteredData.length === 0) {
        toast.info('No orders to export');
        return;
      }
      exportRowsToCsv(filteredData, `orders-${new Date().toISOString().slice(0, 10)}.csv`);
      toast.success('Orders exported');
    };
    const exportSelected = () => {
      if (selectedRows.length === 0) {
        toast.info('No selected orders to export');
        return;
      }
      exportRowsToCsv(selectedRows, `orders-selected-${new Date().toISOString().slice(0, 10)}.csv`);
      toast.success('Selected orders exported');
    };
    const deleteSelected = () => {
      void handleDeleteSelected();
    };

    window.addEventListener('order-list:export-all', exportAll);
    window.addEventListener('order-list:export-selected', exportSelected);
    window.addEventListener('order-list:delete-selected', deleteSelected);
    return () => {
      window.removeEventListener('order-list:export-all', exportAll);
      window.removeEventListener('order-list:export-selected', exportSelected);
      window.removeEventListener('order-list:delete-selected', deleteSelected);
    };
  }, [filteredData, selectedRows, exportRowsToCsv, handleDeleteSelected]);

  const table = useReactTable({ 
    data: filteredData,
    columns,
    state: {
      pagination,
      sorting,
      rowSelection,
      expanded: expandedRows,
    },
    getRowId: (row: OrderListData) => row.id,
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

      {isLoadingOrders && !propsMockData && (
        <Alert icon="info">
          <AlertIcon>
            <Info />
          </AlertIcon>
          <AlertTitle>Loading orders from database...</AlertTitle>
        </Alert>
      )}

      {ordersError && !propsMockData && (
        <Alert variant="destructive">
          <AlertIcon>
            <Info />
          </AlertIcon>
          <AlertTitle>{ordersError}</AlertTitle>
        </Alert>
      )}

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Edit Order</DialogTitle>
          </DialogHeader>
          <DialogBody className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="edit-customer-name">Customer Name</Label>
              <Input
                id="edit-customer-name"
                value={editCustomerName}
                onChange={(event) => setEditCustomerName(event.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit-customer-email">Customer Email</Label>
              <Input
                id="edit-customer-email"
                value={editCustomerEmail}
                onChange={(event) => setEditCustomerEmail(event.target.value)}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="edit-payment-status">Payment Status</Label>
                <select
                  id="edit-payment-status"
                  className="h-8.5 px-3 text-[0.8125rem] rounded-md border border-input bg-background w-full"
                  value={editPaymentStatus}
                  onChange={(event) => setEditPaymentStatus(event.target.value)}
                >
                  <option value="pending">Pending</option>
                  <option value="paid">Paid</option>
                  <option value="failed">Failed</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="refunded">Refunded</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="edit-delivery-status">Delivery Status</Label>
                <select
                  id="edit-delivery-status"
                  className="h-8.5 px-3 text-[0.8125rem] rounded-md border border-input bg-background w-full"
                  value={editDeliveryStatus}
                  onChange={(event) => setEditDeliveryStatus(event.target.value)}
                >
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="on_hold">On Hold</option>
                  <option value="canceled">Canceled</option>
                  <option value="returned">Returned</option>
                </select>
              </div>
            </div>
          </DialogBody>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditSave}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Card>
        <CardHeader className="py-3.5 flex-nowrap">
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
                        {tab.id === 'all'
                          ? tabBadges.all
                          : tab.id === 'in-transit'
                            ? tabBadges.inTransit
                            : tab.id === 'delivered'
                              ? tabBadges.delivered
                              : tab.id === 'returns'
                                ? tabBadges.returns
                                : tabBadges.canceled}
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
            <Button
              variant="outline"
              asChild
            >
              <Link to="/core/order-details">
                View Order Details
              </Link>
            </Button>
            <Button
              variant="mono"
              asChild
            >
              <Link to="/core/stock-planner">
                Stock Planner
              </Link>
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
  );
}

// ---- ORDER ITEMS SUB TABLE COMPONENT ----
interface OrderItemsSubTableProps {
  items: OrderItemData[];
}

function OrderItemsSubTable({ items }: OrderItemsSubTableProps) {
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
        size: 200,
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
        size: 100,
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
    data: items,
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
      <div className="bg-card rounded-lg border border-muted-foreground/22">
        <DataGrid
          table={table}
          recordCount={items.length}
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
