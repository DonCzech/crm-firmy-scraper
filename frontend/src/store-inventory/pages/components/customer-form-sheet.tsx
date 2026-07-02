'use client';

import { useEffect, useState, type ChangeEvent } from 'react';
import { User, X } from 'lucide-react';
import { toAbsoluteUrl } from '@/lib/helpers';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetBody,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { IData } from '../tables/customer-list';

export type CustomerFormValues = {
  fullName: string;
  email: string;
  phoneNumber: string;
  status: 'active' | 'inactive' | 'pending' | 'banned';
  companyName: string;
  timeZone: string;
};

const defaultValues: CustomerFormValues = {
  fullName: '',
  email: '',
  phoneNumber: '',
  status: 'active',
  companyName: '',
  timeZone: 'europe/prague',
};

function toInitialValues(customer?: IData | null): CustomerFormValues {
  if (!customer) return defaultValues;

  const status =
    customer.status.label.toLowerCase() === 'active'
      ? 'active'
      : customer.status.label.toLowerCase() === 'inactive'
        ? 'inactive'
        : customer.status.label.toLowerCase() === 'pending'
          ? 'pending'
          : 'banned';

  return {
    fullName: customer.customerInfo.title || '',
    email: customer.customerInfo.label || '',
    phoneNumber: customer.phone || '',
    status,
    companyName: customer.companyName || '',
    timeZone: customer.timeZone || 'europe/prague',
  };
}

function CustomerAvatarUpload({ mode }: { mode: 'new' | 'edit' }) {
  const [selectedImage, setSelectedImage] = useState<string | null>(
    mode === 'edit' ? toAbsoluteUrl('/media/avatars/300-13.png') : null,
  );

  const handleImageUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => setSelectedImage((e.target?.result as string) || null);
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <div className="w-full h-[200px] bg-accent/50 border border-border rounded-lg flex items-center justify-center">
          {selectedImage ? (
            <div className="relative flex items-center justify-center w-full h-full">
              <img
                src={selectedImage}
                alt="Customer Avatar"
                className="w-full h-full object-cover rounded-lg"
              />
              <Button
                variant="outline"
                size="icon"
                className="absolute top-2 right-2 size-6"
                onClick={() => setSelectedImage(null)}
              >
                <X className="size-3" />
              </Button>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="customer-avatar-upload"
              />
              <label htmlFor="customer-avatar-upload" className="absolute bottom-3 right-3">
                <Button size="sm" variant="outline" asChild>
                  <span>Change</span>
                </Button>
              </label>
            </div>
          ) : (
            <div className="relative w-full h-full flex items-center justify-center">
              <User className="size-[35px] text-muted-foreground" />
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="customer-avatar-upload"
              />
              <label htmlFor="customer-avatar-upload" className="absolute bottom-3 right-3">
                <Button size="sm" variant="outline" asChild>
                  <span>Upload</span>
                </Button>
              </label>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function CustomerFormSheet({
  mode,
  open,
  onOpenChange,
  initialCustomer,
  submitting = false,
  onSubmit,
}: {
  mode: 'new' | 'edit';
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialCustomer?: IData | null;
  submitting?: boolean;
  onSubmit?: (values: CustomerFormValues) => Promise<void> | void;
}) {
  const isNewMode = mode === 'new';
  const [values, setValues] = useState<CustomerFormValues>(defaultValues);

  useEffect(() => {
    if (!open) return;
    setValues(toInitialValues(initialCustomer));
  }, [open, initialCustomer, mode]);

  const update = <K extends keyof CustomerFormValues>(
    key: K,
    value: CustomerFormValues[K],
  ) => {
    setValues((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    if (onSubmit) {
      await onSubmit(values);
      return;
    }
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="gap-0 lg:w-[820px] sm:max-w-none inset-5 border start-auto h-auto rounded-lg p-0 [&_[data-slot=sheet-close]]:top-4.5 [&_[data-slot=sheet-close]]:end-5">
        <SheetHeader className="border-b py-3.5 px-5 border-border">
          <SheetTitle className="font-medium">
            {isNewMode ? 'New Customer' : 'Edit Customer'}
          </SheetTitle>
        </SheetHeader>

        <SheetBody className="p-0 grow">
          <ScrollArea
            className="flex flex-col h-[calc(100dvh-10rem)] mx-1.5"
            viewportClassName="[&>div]:h-full [&>div>div]:h-full"
          >
            <div className="flex flex-wrap lg:flex-nowrap px-3.5 grow">
              <div className="w-full shrink-0 lg:w-[280px] py-5 lg:pe-5 space-y-4">
                <CustomerAvatarUpload mode={mode} />
              </div>

              <div className="grow lg:border-s border-border space-y-5 py-5 lg:ps-5">
                <div className="flex items-center gap-10">
                  <Label className="text-xs font-medium w-24 shrink-0">Full Name</Label>
                  <Input
                    placeholder="Full Name"
                    value={values.fullName}
                    onChange={(e) => update('fullName', e.target.value)}
                    className="flex-1"
                  />
                </div>

                <div className="flex items-center gap-10">
                  <Label className="text-xs font-medium w-24 shrink-0">Email</Label>
                  <Input
                    placeholder="Email"
                    type="email"
                    value={values.email}
                    onChange={(e) => update('email', e.target.value)}
                    className="flex-1"
                  />
                </div>

                <div className="flex items-center gap-10">
                  <Label className="text-xs font-medium w-24 shrink-0">Phone</Label>
                  <Input
                    placeholder="+420..."
                    value={values.phoneNumber}
                    onChange={(e) => update('phoneNumber', e.target.value)}
                    className="flex-1"
                  />
                </div>

                <div className="flex items-center gap-10">
                  <Label className="text-xs font-medium w-24 shrink-0">Status</Label>
                  <Select
                    value={values.status}
                    onValueChange={(value) =>
                      update(
                        'status',
                        value as CustomerFormValues['status'],
                      )
                    }
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Select Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="banned">Banned</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-10">
                  <Label className="text-xs font-medium w-24 shrink-0">Company</Label>
                  <Input
                    placeholder="Company Name"
                    value={values.companyName}
                    onChange={(e) => update('companyName', e.target.value)}
                    className="flex-1"
                  />
                </div>

                <div className="flex items-center gap-10">
                  <Label className="text-xs font-medium w-24 shrink-0">Time Zone</Label>
                  <Select value={values.timeZone} onValueChange={(value) => update('timeZone', value)}>
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Select Time Zone" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="europe/prague">Europe/Prague</SelectItem>
                      <SelectItem value="europe/london">Europe/London</SelectItem>
                      <SelectItem value="europe/amsterdam">Europe/Amsterdam</SelectItem>
                      <SelectItem value="america/new_york">America/New_York</SelectItem>
                      <SelectItem value="asia/singapore">Asia/Singapore</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </ScrollArea>
        </SheetBody>

        <SheetFooter className="flex-row border-t pb-4 p-5 border-border gap-2.5 lg:gap-0">
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={submitting}>
            Close
          </Button>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
            Cancel
          </Button>
          <Button variant="mono" onClick={handleSave} disabled={submitting}>
            {submitting ? 'Saving...' : isNewMode ? 'Create' : 'Save'}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
