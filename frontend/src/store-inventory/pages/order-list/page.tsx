'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { addDays, format } from 'date-fns';
import { ChevronDown, PlusIcon, Upload } from 'lucide-react';
import { DateRange } from 'react-day-picker';
import { useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { OrderListTable } from '../tables/order-list';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { createOrder } from '@/crm/services/backend';
import { Dialog, DialogBody, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';


export function OrderList() {
  const location = useLocation();
  // Date range picker state
  const today = new Date();
  const defaultDateRange: DateRange = {
    from: addDays(today, -30), // Show last 30 days by default
    to: today,
  };
  const [dateRange, setDateRange] = useState<DateRange | undefined>(
    defaultDateRange,
  );
  const [tempDateRange, setTempDateRange] = useState<DateRange | undefined>(
    defaultDateRange,
  );
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const isApplyingRef = useRef(false);
  const [reloadToken, setReloadToken] = useState(0);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [newOrderCategory, setNewOrderCategory] = useState('Electronics');
  const [amount, setAmount] = useState('0');
  const [moreAction, setMoreAction] = useState('more-actions');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [stats, setStats] = useState({
    total: 0,
    attention: 0,
    paid: 0,
    pending: 0,
    failed: 0,
  });

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const category = (params.get('category') || '').trim();
    setCategoryFilter(category || 'all');
  }, [location.search]);

  const categoryOptions = useMemo(() => {
    const defaults = ['all', 'Electronics', 'Clothing', 'Home & Garden', 'General'];
    if (categoryFilter !== 'all' && !defaults.includes(categoryFilter)) {
      return [...defaults, categoryFilter];
    }
    return defaults;
  }, [categoryFilter]);

  const handleCreateOrder = async () => {
    const parsedAmount = Number(amount || 0);
    if (!customerName.trim()) {
      toast.error('Customer name is required');
      return;
    }

    try {
      await createOrder({
        customerName: customerName.trim(),
        customerEmail: customerEmail.trim() || undefined,
        category: newOrderCategory,
        paymentStatus: 'pending',
        deliveryStatus: 'processing',
        carrierName: 'UPS Global',
        carrierLogo: 'ups.svg',
        items: [
          {
            productName: `${newOrderCategory} Item`,
            category: newOrderCategory,
            quantity: 1,
            unitPrice: Number.isFinite(parsedAmount) ? Math.max(parsedAmount, 0) : 0,
            trendLabel: 'Standard',
            trendVariant: 'secondary',
            stock: 0,
            reserved: 0,
            thresholdLevel: 0,
            supplierName: 'Supplier',
            supplierLogo: 'clusterhq.svg',
          },
        ],
      });

      toast.success('Order created');
      setCreateDialogOpen(false);
      setCustomerName('');
      setCustomerEmail('');
      setAmount('0');
      setReloadToken((value) => value + 1);
      window.dispatchEvent(new Event('order-list:changed'));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create order');
    }
  };

  // Date range picker handlers
  const handleDateRangeApply = () => {
    isApplyingRef.current = true;
    if (tempDateRange) {
      setDateRange(tempDateRange);
    }
    setIsDatePickerOpen(false);
    setTimeout(() => {
      isApplyingRef.current = false;
    }, 100);
  };

  const handleDateRangeReset = () => {
    isApplyingRef.current = true;
    setTempDateRange(defaultDateRange);
    setDateRange(defaultDateRange);
    setIsDatePickerOpen(false);
    setTimeout(() => {
      isApplyingRef.current = false;
    }, 100);
  };

  const handleDateRangeCancel = () => {
    isApplyingRef.current = true;
    // Reset temp state to actual state when canceling
    setTempDateRange(dateRange);
    setIsDatePickerOpen(false);
    setTimeout(() => {
      isApplyingRef.current = false;
    }, 100);
  };

  const handleDateRangeSelect = (selected: DateRange | undefined) => {
    setTempDateRange({
      from: selected?.from || undefined,
      to: selected?.to || undefined,
    });
  };
  
  return (
    <div className="container-fluid space-y-5 lg:space-y-9">
      <div className="flex items-center flex-wrap gap-2 justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-bold text-foreground">Order List</h1>
          <span className="text-sm text-muted-foreground">
            {stats.total} orders found. {stats.attention} orders need your attention.
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Date Range Filter */}
          <Popover
            open={isDatePickerOpen}
            onOpenChange={(open) => {
              if (open) {
                // Sync temp state with actual state when opening
                setTempDateRange(dateRange);
                setIsDatePickerOpen(open);
              } else if (!isApplyingRef.current) {
                // Only handle cancel if we're not in the middle of applying/resetting
                setTempDateRange(dateRange);
                setIsDatePickerOpen(open);
              }
            }}
          >
            <PopoverTrigger asChild>
              <Button type="button" variant="outline">
                {dateRange?.from ? (
                  dateRange.to ? (
                    <>
                      {format(dateRange.from, 'MMM dd')} -{' '}
                      {format(dateRange.to, 'MMM dd, yyyy')}
                    </>
                  ) : (
                    format(dateRange.from, 'MMM dd, yyyy')
                  )
                ) : (
                  <span>2 June - 9 June</span>
                )}
                <ChevronDown className="size-4 ml-1" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                autoFocus
                mode="range"
                defaultMonth={tempDateRange?.from || dateRange?.from}
                showOutsideDays={false}
                selected={tempDateRange} // <-- Only temp
                onSelect={handleDateRangeSelect} // <-- Updates temp only
                numberOfMonths={2}
              />
              <div className="flex items-center justify-between border-t border-border p-3">
                <Button variant="outline" onClick={handleDateRangeReset}>
                  Reset
                </Button>
                <div className="flex items-center gap-1.5">
                  <Button variant="outline" onClick={handleDateRangeCancel}>
                    Cancel
                  </Button>
                  <Button onClick={handleDateRangeApply}>Apply</Button>
                </div>
              </div>
            </PopoverContent>
          </Popover> 
          
          <Select value={categoryFilter} onValueChange={setCategoryFilter} indicatorPosition="right">
            <SelectTrigger className="w-[170px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              {categoryOptions.map((option) => (
                <SelectItem key={option} value={option}>
                  {option === 'all' ? 'All Categories' : option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            className="gap-2 shrink-0"
            onClick={() => window.dispatchEvent(new Event('order-list:export-all'))}
          >
            <Upload className="h-4 w-4" />
            Export
          </Button>

          {/* Select */}
          <Select
            value={moreAction}
            onValueChange={(value) => {
              setMoreAction(value);
              if (value === 'order-tracking') {
                window.dispatchEvent(new Event('order-list:export-selected'));
              }
              if (value === 'view-shipping-label') {
                window.dispatchEvent(new Event('order-list:export-all'));
              }
              if (value === 'delete') {
                window.dispatchEvent(new Event('order-list:delete-selected'));
              }
              setTimeout(() => setMoreAction('more-actions'), 100);
            }}
            indicatorPosition="right"
          >
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="More Actions" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="more-actions">More Actions</SelectItem>
              <SelectItem value="order-tracking">Export Selected</SelectItem>
              <SelectItem value="view-shipping-label">Export All</SelectItem>
              <SelectItem value="delete">Delete Selected</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="mono" onClick={() => setCreateDialogOpen(true)}>
            <PlusIcon />
            New Order
          </Button>
        </div>
      </div>

      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>New Order</DialogTitle>
          </DialogHeader>
          <DialogBody className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="order-customer-name">Customer Name</Label>
              <Input
                id="order-customer-name"
                value={customerName}
                onChange={(event) => setCustomerName(event.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="order-customer-email">Customer Email</Label>
              <Input
                id="order-customer-email"
                value={customerEmail}
                onChange={(event) => setCustomerEmail(event.target.value)}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="order-category">Category</Label>
                <Input
                  id="order-category"
                  value={newOrderCategory}
                  onChange={(event) => setNewOrderCategory(event.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="order-amount">Amount (CZK)</Label>
                <Input
                  id="order-amount"
                  type="number"
                  min={0}
                  value={amount}
                  onChange={(event) => setAmount(event.target.value)}
                />
              </div>
            </div>
          </DialogBody>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateOrder}>Create Order</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <OrderListTable
        reloadToken={reloadToken}
        dateRange={dateRange}
        categoryFilter={categoryFilter}
        onStatsChange={setStats}
      />
    </div>
  );
}
