'use client';

import { useEffect, useState, type ChangeEvent } from 'react';
import { Image as ImageIcon, X } from 'lucide-react';
import { toAbsoluteUrl } from '@/lib/helpers';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
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
import { Textarea } from '@/components/ui/textarea';
import type { StoreCategory, StoreCategoryStatus } from '@/store-inventory/services/catalog';

export type CategoryFormValues = {
  name: string;
  status: StoreCategoryStatus;
  description: string;
  featured: boolean;
  image: string;
};

function toInitialValues(category?: StoreCategory | null): CategoryFormValues {
  return {
    name: category?.name || '',
    status: category?.status || 'active',
    description: category?.description || '',
    featured: category?.featured || false,
    image: category?.image || 'running-shoes.svg',
  };
}

export function CategoryFormSheet({
  mode,
  open,
  onOpenChange,
  initialCategory,
  submitting = false,
  onSubmit,
  onDelete,
}: {
  mode: 'new' | 'edit';
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialCategory?: StoreCategory | null;
  submitting?: boolean;
  onSubmit?: (values: CategoryFormValues) => Promise<void> | void;
  onDelete?: () => Promise<void> | void;
}) {
  const isEditMode = mode === 'edit';
  const [values, setValues] = useState<CategoryFormValues>(toInitialValues(initialCategory));
  const [uploadPreview, setUploadPreview] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setValues(toInitialValues(initialCategory));
    setUploadPreview(null);
  }, [open, initialCategory]);

  const update = <K extends keyof CategoryFormValues>(key: K, value: CategoryFormValues[K]) => {
    setValues((prev) => ({ ...prev, [key]: value }));
  };

  const handleImageUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => setUploadPreview((e.target?.result as string) || null);
    reader.readAsDataURL(file);
  };

  const iconSrc = uploadPreview || toAbsoluteUrl(`/media/store/client/icons/light/${values.image}`);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="gap-0 w-[500px] p-0 inset-5 border start-auto h-auto rounded-lg [&_[data-slot=sheet-close]]:top-4.5 [&_[data-slot=sheet-close]]:end-5">
        <SheetHeader className="border-b py-4 px-6">
          <SheetTitle className="font-medium">
            {isEditMode ? 'Edit Category' : 'Add Category'}
          </SheetTitle>
        </SheetHeader>

        <SheetBody className="p-0 grow pt-5">
          <ScrollArea
            className="h-[calc(100dvh-14rem)] mx-1.5 px-3.5 grow"
            viewportClassName="[&>div]:h-full [&>div>div]:h-full"
          >
            <div className="space-y-6">
              <div className="relative">
                <div className="w-full h-[200px] bg-accent/50 border border-border rounded-lg flex items-center justify-center">
                  {iconSrc ? (
                    <div className="relative flex items-center justify-center w-full h-full">
                      <img src={iconSrc} alt="Category" className="h-[140px] object-contain" />
                      {uploadPreview && (
                        <Button
                          variant="outline"
                          size="icon"
                          className="absolute top-2 right-2 size-6"
                          onClick={() => setUploadPreview(null)}
                        >
                          <X className="size-3" />
                        </Button>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        id="category-image-upload"
                      />
                      <label htmlFor="category-image-upload" className="absolute bottom-3 right-3">
                        <Button size="sm" variant="outline" asChild>
                          <span>{isEditMode ? 'Change' : 'Upload'}</span>
                        </Button>
                      </label>
                    </div>
                  ) : (
                    <ImageIcon className="size-[35px] text-muted-foreground" />
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-medium">Category Name</Label>
                <Input
                  placeholder="Category Name"
                  value={values.name}
                  onChange={(e) => update('name', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-medium">Status</Label>
                <Select value={values.status} onValueChange={(v) => update('status', v as StoreCategoryStatus)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-medium">Description</Label>
                <Textarea
                  placeholder="Category Description"
                  value={values.description}
                  onChange={(e) => update('description', e.target.value)}
                  rows={4}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="featured"
                  checked={values.featured}
                  onCheckedChange={(checked) => update('featured', Boolean(checked))}
                />
                <Label htmlFor="featured" className="text-xs font-medium">
                  Featured
                </Label>
              </div>
            </div>
          </ScrollArea>
        </SheetBody>

        <SheetFooter className="border-t p-5">
          <div className="flex items-center justify-end gap-3 w-full">
            <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={submitting}>
              Close
            </Button>
            {isEditMode && onDelete && (
              <Button variant="outline" onClick={() => void onDelete()} disabled={submitting}>
                Delete
              </Button>
            )}
            <Button
              variant="mono"
              onClick={() => void onSubmit?.(values)}
              disabled={submitting || !values.name.trim()}
            >
              {submitting ? 'Saving...' : isEditMode ? 'Save' : 'Create'}
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
