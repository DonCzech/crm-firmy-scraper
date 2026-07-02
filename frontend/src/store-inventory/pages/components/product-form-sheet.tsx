'use client';

import { useEffect, useMemo, useState } from 'react';
import { CircleX } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { Badge, BadgeButton } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardToolbar,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import {
  Sheet,
  SheetBody,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import {
  createProduct,
  updateProduct,
  type BackendProduct,
} from '@/crm/services/backend';
import { ProductFormImageUpload, type ImageFile } from './product-form-image-upload';
import { ProductFormVariants } from './product-form-variants';

function ProductFormTagInput({
  value,
  onChange,
}: {
  value: string[];
  onChange: (next: string[]) => void;
}) {
  const [inputValue, setInputValue] = useState('');

  const addTag = (tag: string) => {
    const normalized = tag.trim();
    if (!normalized || value.includes(normalized)) return;
    onChange([...value, normalized]);
    setInputValue('');
  };

  const removeTag = (tagToRemove: string) => {
    onChange(value.filter((tag) => tag !== tagToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(inputValue);
    }
  };

  return (
    <div>
      <div className="flex flex-col gap-2.5 mb-2.5">
        <Label className="text-xs leading-3">Tags</Label>
        <Input
          placeholder="Add tags (press Enter or comma)"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
        />
      </div>
      <div className="flex flex-wrap items-center gap-2.5">
        {value.map((tag) => (
          <Badge
            key={tag}
            variant="secondary"
            appearance="light"
            className="flex items-center gap-1"
          >
            {tag}
            <BadgeButton onClick={() => removeTag(tag)}>
              <CircleX className="size-3.5 text-muted-foreground" />
            </BadgeButton>
          </Badge>
        ))}
      </div>
    </div>
  );
}

export type ProductFormValues = {
  name: string;
  description: string;
  category: string;
  brand: string;
  sku: string;
  barcode: string;
  price: number;
  status: 'draft' | 'published' | 'archived';
  featured: boolean;
  image: string;
  images: string[];
  tags: string[];
};

type ProductInitial = Partial<BackendProduct>;

function toInitialValues(initial?: ProductInitial | null): ProductFormValues {
  const normalizedStatus: ProductFormValues['status'] =
    initial?.status === 'published' || initial?.status === 'archived' || initial?.status === 'draft'
      ? initial.status
      : 'draft';
  const initialImages = Array.isArray(initial?.images)
    ? initial.images.filter(Boolean)
    : initial?.image
      ? [initial.image]
      : [];
  return {
    name: initial?.name || '',
    description: initial?.description || '',
    category: initial?.category || 'General',
    brand: initial?.brand || 'Brand',
    sku: initial?.sku || '',
    barcode: initial?.barcode || '',
    price: Number(initial?.price ?? 0),
    status: normalizedStatus,
    featured: Boolean(initial?.featured),
    image: initialImages[0] || '',
    images: initialImages,
    tags: Array.isArray(initial?.tags) ? initial.tags : [],
  };
}

function toDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(new Error('Failed to read image file'));
    reader.readAsDataURL(file);
  });
}

export function ProductFormSheet({
  mode,
  open,
  onOpenChange,
  initialProduct,
  onSaved,
}: {
  mode: 'new' | 'edit';
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialProduct?: ProductInitial | null;
  onSaved?: (product: BackendProduct) => void;
}) {
  const isNewMode = mode === 'new';
  const isEditMode = mode === 'edit';
  const [saving, setSaving] = useState(false);
  const [values, setValues] = useState<ProductFormValues>(toInitialValues(initialProduct));

  useEffect(() => {
    if (!open) return;
    setValues(toInitialValues(initialProduct));
  }, [open, initialProduct]);

  const update = <K extends keyof ProductFormValues>(key: K, value: ProductFormValues[K]) => {
    setValues((prev) => ({ ...prev, [key]: value }));
  };

  const primaryActionDisabled = useMemo(
    () => saving || !values.name.trim(),
    [saving, values.name],
  );

  const handleSave = async () => {
    if (!values.name.trim()) {
      toast.error('Product name is required');
      return;
    }

    try {
      setSaving(true);
      const payload = {
        name: values.name.trim(),
        description: values.description.trim() || undefined,
        category: values.category.trim() || undefined,
        brand: values.brand.trim() || undefined,
        sku: values.sku.trim() || undefined,
        barcode: values.barcode.trim() || undefined,
        price: Number.isFinite(values.price) ? Math.max(values.price, 0) : 0,
        status: values.status,
        featured: values.featured,
        image: values.image || undefined,
        images: values.images,
        tags: values.tags,
      };

      const saved =
        isEditMode && initialProduct?.id
          ? await updateProduct(initialProduct.id, payload)
          : await createProduct(payload);

      toast.success(isEditMode ? 'Product updated' : 'Product created');
      onSaved?.(saved);
      window.dispatchEvent(new Event('product-list:changed'));
      onOpenChange(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="gap-0 lg:w-[1080px] sm:max-w-none inset-5 border start-auto h-auto rounded-lg p-0 [&_[data-slot=sheet-close]]:top-4.5 [&_[data-slot=sheet-close]]:end-5">
        <SheetHeader className="border-b py-3.5 px-5 border-border">
          <SheetTitle className="font-medium">{isNewMode ? 'Create New Product' : 'Edit Product'}</SheetTitle>
        </SheetHeader>

        <SheetBody className="p-0 grow">
          <div className="flex justify-between gap-2 flex-wrap border-b border-border p-5">
            <Select
              value={values.status}
              onValueChange={(value) => update('status', value as ProductFormValues['status'])}
              indicatorPosition="right"
            >
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Select Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex items-center gap-2.5 text-xs text-gray-800 font-medium">
              Read about
              <Link to="/core/dashboard" className="text-primary">
                How to Create Product
              </Link>
              <Button variant="outline" className="text-dark" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button variant="mono" onClick={handleSave} disabled={primaryActionDisabled}>
                {saving ? 'Saving...' : isNewMode ? 'Create' : 'Save'}
              </Button>
            </div>
          </div>

          <ScrollArea
            className="flex flex-col h-[calc(100dvh-15.2rem)] mx-1.5"
            viewportClassName="[&>div]:h-full [&>div>div]:h-full"
          >
            <div className="flex flex-wrap lg:flex-nowrap px-3.5 grow">
              <div className="grow lg:border-e border-border lg:pe-5 space-y-5 py-5">
                <Card className="rounded-md">
                  <CardHeader className="min-h-[38px] bg-accent/50">
                    <CardTitle className="text-2sm">Basic Info</CardTitle>
                    <CardToolbar>
                      <div className="flex items-center space-x-2">
                        <Label htmlFor="product-featured" className="text-xs">
                          Featured
                        </Label>
                        <Switch
                          size="sm"
                          id="product-featured"
                          checked={values.featured}
                          onCheckedChange={(checked) => update('featured', Boolean(checked))}
                        />
                      </div>
                    </CardToolbar>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className="flex flex-col gap-2 mb-3">
                      <Label className="text-xs">Product Name</Label>
                      <Input
                        placeholder="Product Name"
                        value={values.name}
                        onChange={(e) => update('name', e.target.value)}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-5 mb-2.5">
                      <div className="flex flex-col gap-2">
                        <Label className="text-xs">SKU</Label>
                        <Input
                          placeholder="SKU"
                          value={values.sku}
                          onChange={(e) => update('sku', e.target.value)}
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <Label className="text-xs">Barcode</Label>
                        <Input
                          placeholder="Barcode"
                          value={values.barcode}
                          onChange={(e) => update('barcode', e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-5 mb-2.5">
                      <div className="flex flex-col gap-2">
                        <Label className="text-xs">Price (CZK)</Label>
                        <Input
                          type="number"
                          min={0}
                          placeholder="0"
                          value={values.price}
                          onChange={(e) => update('price', Number(e.target.value || 0))}
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <Label className="text-xs">Brand</Label>
                        <Input
                          placeholder="Brand"
                          value={values.brand}
                          onChange={(e) => update('brand', e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 mb-2.5">
                      <Label className="text-xs">Product Description</Label>
                      <Textarea
                        className="min-h-[100px]"
                        placeholder="Product Description"
                        value={values.description}
                        onChange={(e) => update('description', e.target.value)}
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card className="rounded-md">
                  <CardHeader className="min-h-[38px] bg-accent/50">
                    <CardTitle className="text-2sm">Category & Brand</CardTitle>
                  </CardHeader>

                  <CardContent className="pt-4 space-y-3">
                    <div className="flex flex-col gap-2">
                      <Label className="text-xs">Product Category</Label>
                      <Input
                        placeholder="Category"
                        value={values.category}
                        onChange={(e) => update('category', e.target.value)}
                      />
                    </div>
                  </CardContent>
                </Card>

                <ProductFormVariants mode={mode} />
              </div>

              <div className="w-full lg:w-[420px] shrink-0 lg:mt-5 space-y-5 lg:ps-5">
                <ProductFormImageUpload
                  mode={mode}
                  initialImage={values.image}
                  initialImages={values.images}
                  onImagesChange={async (images: ImageFile[]) => {
                    if (!images.length) return;
                    try {
                      const dataUrls = await Promise.all(images.map((image) => toDataUrl(image.file)));
                      setValues((prev) => {
                        const merged = [...prev.images];
                        for (const url of dataUrls) {
                          if (!merged.includes(url)) merged.push(url);
                        }
                        return {
                          ...prev,
                          images: merged,
                          image: merged[0] || '',
                        };
                      });
                    } catch {
                      update('images', []);
                      update('image', '');
                    }
                  }}
                />

                <Separator className="w-full" />

                <ProductFormTagInput
                  value={values.tags}
                  onChange={(next) => update('tags', next)}
                />
              </div>
            </div>
          </ScrollArea>
        </SheetBody>

        <SheetFooter className="flex-row border-t not-only-of-type:justify-between items-center p-5 border-border gap-2">
          <Select
            value={values.status}
            onValueChange={(value) => update('status', value as ProductFormValues['status'])}
            indicatorPosition="right"
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Select Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button variant="mono" onClick={handleSave} disabled={primaryActionDisabled}>
              {saving ? 'Saving...' : isNewMode ? 'Create' : 'Save'}
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
