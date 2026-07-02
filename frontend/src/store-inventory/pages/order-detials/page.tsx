import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FilePlus2, Info, Pencil, UserRound } from 'lucide-react';
import { toAbsoluteUrl } from '@/lib/helpers';
import { Alert, AlertIcon, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogBody, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import {
  createInvoiceFromOrder,
  downloadInvoicePdf,
  fetchContacts,
  fetchInvoices,
  fetchOrder,
  fetchProducts,
  updateContact,
  updateOrder,
  type BackendContact,
  type BackendInvoice,
  type BackendOrder,
  type BackendProduct,
} from '@/crm/services/backend';

function formatCurrency(amount: number, currency: string) {
  try {
    return new Intl.NumberFormat('cs-CZ', {
      style: 'currency',
      currency: currency || 'CZK',
      maximumFractionDigits: 2,
    }).format(amount || 0);
  } catch {
    return `${amount || 0} ${currency || 'CZK'}`;
  }
}

function statusVariant(status: string): 'success' | 'warning' | 'destructive' | 'secondary' {
  const normalized = (status || '').toLowerCase();
  if (normalized === 'paid' || normalized === 'delivered' || normalized === 'shipped') return 'success';
  if (normalized === 'failed' || normalized === 'canceled' || normalized === 'cancelled') return 'destructive';
  if (normalized === 'pending' || normalized === 'processing' || normalized === 'on_hold') return 'warning';
  return 'secondary';
}

function resolveOrderItemImageSrc(image?: string) {
  if (!image) return toAbsoluteUrl('/media/store/client/1200x1200/11.png');
  const normalized = image.trim();
  if (!normalized) return toAbsoluteUrl('/media/store/client/1200x1200/11.png');
  if (
    normalized.startsWith('data:image/') ||
    normalized.startsWith('blob:') ||
    normalized.startsWith('http://') ||
    normalized.startsWith('https://')
  ) {
    return normalized;
  }
  if (normalized.startsWith('/media/')) return toAbsoluteUrl(normalized);
  return toAbsoluteUrl(`/media/store/client/1200x1200/${normalized}`);
}

export function OrderDetailsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const orderId = useMemo(() => new URLSearchParams(location.search).get('orderId') || '', [location.search]);

  const [order, setOrder] = useState<BackendOrder | null>(null);
  const [customer, setCustomer] = useState<BackendContact | null>(null);
  const [invoices, setInvoices] = useState<BackendInvoice[]>([]);
  const [products, setProducts] = useState<BackendProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingInvoices, setLoadingInvoices] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [creatingInvoice, setCreatingInvoice] = useState(false);
  const [downloadingInvoiceId, setDownloadingInvoiceId] = useState<string | null>(null);
  const [editCustomerOpen, setEditCustomerOpen] = useState(false);
  const [savingCustomer, setSavingCustomer] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');

  const loadOrder = useCallback(async () => {
    if (!orderId) {
      setOrder(null);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const result = await fetchOrder(orderId);
      setOrder(result);
    } catch (fetchError) {
      setOrder(null);
      setError(fetchError instanceof Error ? fetchError.message : 'Failed to load order detail');
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    void loadOrder();
  }, [loadOrder]);

  const loadInvoices = useCallback(async () => {
    if (!orderId) {
      setInvoices([]);
      return;
    }
    try {
      setLoadingInvoices(true);
      const response = await fetchInvoices({ orderId, limit: 20 });
      setInvoices(response.data || []);
    } catch {
      setInvoices([]);
    } finally {
      setLoadingInvoices(false);
    }
  }, [orderId]);

  useEffect(() => {
    void loadInvoices();
  }, [loadInvoices]);

  const latestInvoice = useMemo(() => {
    if (!invoices.length) return null;
    return invoices[0];
  }, [invoices]);

  useEffect(() => {
    let active = true;
    const run = async () => {
      try {
        const response = await fetchProducts({ page: 1, limit: 500 });
        if (!active) return;
        setProducts(response.data || []);
      } catch {
        if (!active) return;
        setProducts([]);
      }
    };
    void run();
    return () => {
      active = false;
    };
  }, []);

  const productBySku = useMemo(() => {
    const map = new Map<string, BackendProduct>();
    for (const product of products) {
      const sku = (product.sku || '').trim().toLowerCase();
      if (sku) map.set(sku, product);
    }
    return map;
  }, [products]);

  const productByName = useMemo(() => {
    const map = new Map<string, BackendProduct>();
    for (const product of products) {
      const name = (product.name || '').trim().toLowerCase();
      if (name) map.set(name, product);
    }
    return map;
  }, [products]);

  useEffect(() => {
    if (!order) {
      setCustomer(null);
      setCustomerName('');
      setCustomerEmail('');
      setCustomerPhone('');
      return;
    }
    setCustomerName(order.customerName || '');
    setCustomerEmail(order.customerEmail || '');
    setCustomerPhone(order.customerPhone || '');

    const run = async () => {
      try {
        const email = (order.customerEmail || '').trim().toLowerCase();
        const name = (order.customerName || '').trim().toLowerCase();
        const response = await fetchContacts({
          limit: 500,
          search: order.customerEmail || order.customerName,
        });
        const contacts = response.data || [];

        const exactByEmail = email
          ? contacts.find((contact) => (contact.email || '').trim().toLowerCase() === email)
          : null;

        const exactByName = !exactByEmail && name
          ? contacts.find((contact) =>
              `${contact.firstName || ''} ${contact.lastName || ''}`.trim().toLowerCase() === name,
            )
          : null;

        setCustomer(exactByEmail || exactByName || null);
      } catch {
        setCustomer(null);
      }
    };

    void run();
  }, [order]);

  const handleCreateInvoice = async () => {
    if (!order) return;
    try {
      setCreatingInvoice(true);
      const created = await createInvoiceFromOrder(order.id);
      await loadInvoices();
      if (created.createdNew) {
        toast.success(`Invoice ${created.invoiceNumber} created`);
      } else {
        toast.info(`Invoice ${created.invoiceNumber} already exists for this order`);
      }
      await handleDownloadInvoice(created);
    } catch (createError) {
      toast.error(createError instanceof Error ? createError.message : 'Failed to create invoice');
    } finally {
      setCreatingInvoice(false);
    }
  };

  const handleSaveCustomer = async () => {
    if (!order) return;
    const trimmedName = customerName.trim();
    const trimmedEmail = customerEmail.trim();
    const trimmedPhone = customerPhone.trim();
    if (!trimmedName) {
      toast.error('Customer name is required');
      return;
    }
    try {
      setSavingCustomer(true);
      const updatedOrder = await updateOrder(order.id, {
        customerName: trimmedName,
        customerEmail: trimmedEmail || undefined,
        customerPhone: trimmedPhone || undefined,
      });
      setOrder(updatedOrder);

      if (customer) {
        const nameParts = trimmedName.split(/\s+/).filter(Boolean);
        const firstName = nameParts[0] || customer.firstName || 'Customer';
        const lastName = nameParts.slice(1).join(' ') || customer.lastName || '';
        await updateContact(customer.id, {
          firstName,
          lastName,
          email: trimmedEmail || undefined,
          phone: trimmedPhone || undefined,
        });
      }

      toast.success('Customer updated');
      setEditCustomerOpen(false);
      await loadOrder();
    } catch (saveError) {
      toast.error(saveError instanceof Error ? saveError.message : 'Failed to update customer');
    } finally {
      setSavingCustomer(false);
    }
  };

  const handleDownloadInvoice = async (invoice: BackendInvoice) => {
    try {
      setDownloadingInvoiceId(invoice.id);
      const blob = await downloadInvoicePdf(invoice.id);
      const url = window.URL.createObjectURL(blob);
      const opened = window.open(url, '_blank', 'noopener,noreferrer');
      if (!opened) {
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = `${invoice.invoiceNumber || 'invoice'}.pdf`;
        document.body.appendChild(anchor);
        anchor.click();
        anchor.remove();
      }
      window.setTimeout(() => window.URL.revokeObjectURL(url), 60_000);
      toast.success(`Invoice ${invoice.invoiceNumber} opened`);
    } catch (downloadError) {
      toast.error(downloadError instanceof Error ? downloadError.message : 'Failed to download invoice PDF');
    } finally {
      setDownloadingInvoiceId(null);
    }
  };

  if (!orderId) {
    return (
      <div className="container-fluid space-y-5 lg:space-y-9">
        <Alert icon="info">
          <AlertIcon>
            <Info />
          </AlertIcon>
          <AlertTitle>Select an order from Order List to view its details.</AlertTitle>
        </Alert>
        <Button variant="outline" onClick={() => navigate('/core/order-list')}>
          Back to Order List
        </Button>
      </div>
    );
  }

  return (
    <div className="container-fluid space-y-5 lg:space-y-9">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-bold text-foreground">Order Detail</h1>
          <span className="text-sm text-muted-foreground">Order ID: {orderId}</span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => navigate('/core/order-list')}>
            Back to Order List
          </Button>
          <Button
            variant="outline"
            disabled={!order}
            onClick={() => setEditCustomerOpen(true)}
          >
            <Pencil />
            Edit Customer
          </Button>
          <Button variant="mono" disabled={!order || creatingInvoice} onClick={() => void handleCreateInvoice()}>
            <FilePlus2 />
            {creatingInvoice ? 'Creating Invoice...' : 'Create Invoice'}
          </Button>
          <Button
            variant="outline"
            disabled={!latestInvoice || downloadingInvoiceId === latestInvoice.id}
            onClick={() => latestInvoice && void handleDownloadInvoice(latestInvoice)}
          >
            {latestInvoice
              ? downloadingInvoiceId === latestInvoice.id
                ? 'Downloading...'
                : `Open Invoice PDF (${latestInvoice.invoiceNumber})`
              : 'No Invoice Yet'}
          </Button>
          <Button
            variant="mono"
            disabled={!customer}
            onClick={() => customer && navigate(`/core/customer-list-details?customerId=${customer.id}`)}
          >
            <UserRound />
            Open Customer Detail
          </Button>
        </div>
      </div>

      {loading && (
        <Alert icon="info">
          <AlertIcon>
            <Info />
          </AlertIcon>
          <AlertTitle>Loading order detail...</AlertTitle>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertIcon>
            <Info />
          </AlertIcon>
          <AlertTitle>{error}</AlertTitle>
        </Alert>
      )}

      {order && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
          <Card className="xl:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2.5">
                {order.orderNumber}
                <Badge variant={statusVariant(order.deliveryStatus)} appearance="light">
                  {order.deliveryStatus}
                </Badge>
                <Badge variant={statusVariant(order.paymentStatus)} appearance="light">
                  {order.paymentStatus}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-muted-foreground">Customer</span>
                  <div className="font-medium">{order.customerName}</div>
                  <div className="text-muted-foreground">{order.customerEmail || '—'}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Order Date</span>
                  <div className="font-medium">{new Date(order.orderDate).toLocaleString('cs-CZ')}</div>
                  <div className="text-muted-foreground">Carrier: {order.carrierName || '—'}</div>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                {order.items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between gap-3 text-sm">
                    {(() => {
                      const skuKey = (item.sku || '').trim().toLowerCase();
                      const nameKey = (item.productName || '').trim().toLowerCase();
                      const linkedProduct = (skuKey && productBySku.get(skuKey)) || productByName.get(nameKey);
                      const linkedImage = linkedProduct?.images?.[0] || linkedProduct?.image || item.image;
                      const linkedName = linkedProduct?.name || item.productName;
                      return (
                    <div className="flex items-center gap-3">
                      <img
                        src={resolveOrderItemImageSrc(linkedImage || undefined)}
                        alt={linkedName}
                        className="h-11 w-11 rounded-md object-cover border border-border"
                        onError={(event) => {
                          (event.currentTarget as HTMLImageElement).src = toAbsoluteUrl(
                            '/media/store/client/1200x1200/11.png',
                          );
                        }}
                      />
                      <div>
                        <div className="font-medium">{linkedName}</div>
                        <div className="text-muted-foreground">SKU: {item.sku || '—'} • Qty: {item.quantity}</div>
                      </div>
                    </div>
                      );
                    })()}
                    <div className="font-medium">{formatCurrency(item.totalPrice, order.currency)}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>{formatCurrency(order.subtotal, order.currency)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Shipping</span><span>{formatCurrency(order.shippingCost, order.currency)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Tax</span><span>{formatCurrency(order.tax, order.currency)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Discount</span><span>{formatCurrency(order.discount, order.currency)}</span></div>
              <Separator />
              <div className="flex justify-between font-semibold"><span>Total</span><span>{formatCurrency(order.total, order.currency)}</span></div>
              <Separator />
              <div className="text-xs text-muted-foreground">
                Linked customer: {customer ? `${customer.firstName} ${customer.lastName}`.trim() : 'not found by email'}
              </div>
              <div className="space-y-1">
                <div className="text-xs text-muted-foreground">Invoices</div>
                {loadingInvoices && <div className="text-xs text-muted-foreground">Loading invoices...</div>}
                {!loadingInvoices && invoices.length === 0 && (
                  <div className="text-xs text-muted-foreground">No invoice for this order yet.</div>
                )}
                {!loadingInvoices &&
                  invoices.map((invoice) => (
                    <div key={invoice.id} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span>{invoice.invoiceNumber}</span>
                        <Badge variant={statusVariant(invoice.status)} appearance="light">
                          {invoice.status}
                        </Badge>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={downloadingInvoiceId === invoice.id}
                        onClick={() => void handleDownloadInvoice(invoice)}
                      >
                        {downloadingInvoiceId === invoice.id ? '...' : 'PDF'}
                      </Button>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Dialog open={editCustomerOpen} onOpenChange={setEditCustomerOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Edit Customer</DialogTitle>
          </DialogHeader>
          <DialogBody className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="order-details-customer-name">Customer Name</Label>
              <Input
                id="order-details-customer-name"
                value={customerName}
                onChange={(event) => setCustomerName(event.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="order-details-customer-email">Customer Email</Label>
              <Input
                id="order-details-customer-email"
                value={customerEmail}
                onChange={(event) => setCustomerEmail(event.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="order-details-customer-phone">Customer Phone</Label>
              <Input
                id="order-details-customer-phone"
                value={customerPhone}
                onChange={(event) => setCustomerPhone(event.target.value)}
              />
            </div>
          </DialogBody>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditCustomerOpen(false)}>
              Cancel
            </Button>
            <Button disabled={savingCustomer} onClick={() => void handleSaveCustomer()}>
              {savingCustomer ? 'Saving...' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
