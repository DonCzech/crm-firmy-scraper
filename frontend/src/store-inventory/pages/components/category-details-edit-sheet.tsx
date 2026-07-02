'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Sheet,
  SheetBody,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { toAbsoluteUrl } from '@/lib/helpers';
import type { StoreCategory } from '@/store-inventory/services/catalog';

export function CategoryDetailsEditSheet({
  open,
  onOpenChange,
  category,
  onEdit,
  onDelete,
  onOpenOrders,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category?: StoreCategory | null;
  onEdit?: () => void;
  onDelete?: () => void;
  onOpenOrders?: () => void;
}) {
  const name = category?.name || 'Category';
  const status = category?.status || 'active';
  const statusVariant =
    status === 'active'
      ? 'success'
      : status === 'inactive'
        ? 'warning'
        : status === 'draft'
          ? 'secondary'
          : 'destructive';

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="gap-0 lg:w-[980px] sm:max-w-none inset-5 border start-auto h-auto rounded-lg p-0 [&_[data-slot=sheet-close]]:top-4.5 [&_[data-slot=sheet-close]]:end-5">
        <SheetHeader className="border-b py-3.5 px-5 border-border">
          <SheetTitle className="font-medium">Category Details</SheetTitle>
        </SheetHeader>

        <SheetBody className="p-0 grow">
          <div className="flex justify-between flex-wrap gap-2 border-b border-border px-5 py-4">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2.5">
                <span className="lg:text-[22px] font-semibold text-foreground leading-none">{name}</span>
                <Badge size="sm" variant={statusVariant as never} appearance="light">
                  {status}
                </Badge>
              </div>
              <div className="text-sm text-muted-foreground">
                {category?.description || 'No description'}
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <Button variant="ghost" onClick={() => onOpenChange(false)}>Close</Button>
              <Button variant="outline" onClick={onOpenOrders}>Open Orders</Button>
              <Button variant="mono" onClick={onEdit}>Edit</Button>
            </div>
          </div>

          <ScrollArea className="h-[calc(100dvh-15.8rem)] mx-1.5" viewportClassName="[&>div]:h-full">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-5">
              <Card>
                <CardHeader className="py-3">
                  <CardTitle className="text-sm">Overview</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-muted-foreground">Products Qty</span><span>{category?.productsQty ?? 0}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Orders Qty</span><span>{category?.ordersQty ?? 0}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Customers Qty</span><span>{category?.customersQty ?? 0}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Total Earnings</span><span>{new Intl.NumberFormat('cs-CZ', { style: 'currency', currency: 'CZK' }).format(category?.totalEarnings ?? 0)}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Featured</span><span>{category?.featured ? 'Yes' : 'No'}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Updated</span><span>{category?.updatedAt ? new Date(category.updatedAt).toLocaleString('cs-CZ') : '—'}</span></div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="py-3">
                  <CardTitle className="text-sm">Icon</CardTitle>
                </CardHeader>
                <CardContent className="flex items-center justify-center h-[180px]">
                  <img
                    src={toAbsoluteUrl(`/media/store/client/icons/light/${category?.image || 'running-shoes.svg'}`)}
                    alt={name}
                    className="max-h-[120px] object-contain"
                  />
                </CardContent>
              </Card>
            </div>
          </ScrollArea>
        </SheetBody>

        <SheetFooter className="flex-row border-t pb-4 p-5 border-border gap-2.5 lg:gap-0">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Close</Button>
          <Button variant="outline" onClick={onDelete}>Delete</Button>
          <Button variant="mono" onClick={onEdit}>Edit</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
