import { z } from "zod";

// Zod input schemas shared by /api/demo/[tenantSlug]/commerce/* routes.

export const VariantSchema = z.object({
  id: z.number().int().positive().optional(),
  sku: z.string().max(64).nullish(),
  ean: z.string().max(32).nullish(),
  title: z.string().max(160).nullish(),
  option_values: z.record(z.string().max(80)).optional(),
  price_cents: z.number().int().min(0),
  compare_at_price_cents: z.number().int().min(0).nullish(),
  cost_cents: z.number().int().min(0).nullish(),
  weight_grams: z.number().int().min(0).nullish(),
  stock_qty: z.number().int().optional(),
  stock_policy: z.enum(["deny", "continue"]).optional(),
  track_stock: z.boolean().optional(),
  is_default: z.boolean().optional(),
  position: z.number().int().min(0).optional(),
});

export const ImageSchema = z.object({
  url: z.string().min(1).max(1024),
  alt: z.string().max(300).nullish(),
  variant_id: z.number().int().positive().nullish(),
  position: z.number().int().min(0).optional(),
});

export const ProductBodySchema = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/, "Slug: jen malá písmena, čísla a pomlčky").min(1).max(120),
  title: z.string().min(1).max(200),
  subtitle: z.string().max(300).nullish(),
  description: z.string().max(20000).nullish(),
  brand: z.string().max(120).nullish(),
  status: z.enum(["draft", "active", "archived"]).optional(),
  tax_rate: z.number().int().min(0).max(100).nullish(),
  primary_category_id: z.number().int().positive().nullish(),
  options: z.array(z.object({ name: z.string().min(1).max(60), values: z.array(z.string().max(80)).max(50) })).max(5).optional(),
  flags: z.record(z.unknown()).optional(),
  seo_title: z.string().max(200).nullish(),
  seo_description: z.string().max(400).nullish(),
  og_image: z.string().max(1024).nullish(),
  category_ids: z.array(z.number().int().positive()).max(50).optional(),
  variants: z.array(VariantSchema).min(1).max(200).optional(),
  images: z.array(ImageSchema).max(50).optional(),
});

export const ProductPatchSchema = ProductBodySchema.partial();

export const CategoryBodySchema = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/, "Slug: jen malá písmena, čísla a pomlčky").min(1).max(120),
  name: z.string().min(1).max(160),
  parent_id: z.number().int().positive().nullish(),
  description: z.string().max(5000).nullish(),
  image_url: z.string().max(1024).nullish(),
  is_visible: z.boolean().optional(),
  sort_order: z.number().int().optional(),
  seo_title: z.string().max(200).nullish(),
  seo_description: z.string().max(400).nullish(),
});

export const CategoryPatchSchema = CategoryBodySchema.partial();

const AddressSchema = z.object({
  name: z.string().max(160).optional(),
  street: z.string().max(200).optional(),
  city: z.string().max(120).optional(),
  zip: z.string().max(16).optional(),
  country: z.string().max(2).optional(),
  phone: z.string().max(30).optional(),
  company: z.string().max(200).optional(),
  ico: z.string().max(16).optional(),
  dic: z.string().max(16).optional(),
}).partial();

export const OrderCreateSchema = z.object({
  email: z.string().email("Neplatný e-mail"),
  phone: z.string().max(30).optional(),
  items: z.array(z.object({
    variant_id: z.number().int().positive(),
    qty: z.number().int().min(1).max(10000),
    unit_price_cents: z.number().int().min(0).optional(),
  })).min(1).max(200),
  billing_address: AddressSchema.optional(),
  shipping_address: AddressSchema.optional(),
  shipping_method: z.string().max(120).optional(),
  shipping_cents: z.number().int().min(0).optional(),
  payment_method: z.enum(["gopay", "bank_transfer", "cod", "manual"]).optional(),
  customer_note: z.string().max(2000).optional(),
  admin_note: z.string().max(2000).optional(),
  discount_cents: z.number().int().min(0).optional(),
});

export const OrderPatchSchema = z.object({
  status: z.enum(["pending", "confirmed", "processing", "shipped", "completed", "cancelled"]).optional(),
  payment_status: z.enum(["pending", "authorized", "paid", "failed", "cancelled", "refunded", "partially_refunded"]).optional(),
  admin_note: z.string().max(2000).optional(),
});

export const ShopPatchSchema = z.object({
  name: z.string().max(200).optional(),
  currency: z.enum(["CZK", "EUR"]).optional(),
  locale: z.string().max(8).optional(),
  vat_mode: z.enum(["inclusive", "exclusive"]).optional(),
  default_tax_rate: z.number().int().min(0).max(100).optional(),
  order_number_prefix: z.string().regex(/^[A-Z0-9-]{1,10}$/, "Prefix: velká písmena a čísla, max 10 znaků").optional(),
  company: z.record(z.unknown()).optional(),
  legal: z.record(z.unknown()).optional(),
  settings: z.record(z.unknown()).optional(),
});

export const StockAdjustSchema = z.object({
  variant_id: z.number().int().positive(),
  delta: z.number().int().min(-100000).max(100000).refine((v) => v !== 0, "Delta nesmí být 0"),
  reason: z.enum(["manual", "correction", "import", "return"]).default("manual"),
  note: z.string().max(500).optional(),
});
