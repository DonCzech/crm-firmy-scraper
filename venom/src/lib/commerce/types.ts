// Webero Commerce — shared row types (mirror src/lib/commerce/schema.ts)

export interface Shop {
  id: number;
  tenant_id: number;
  name: string;
  currency: string;
  locale: string;
  vat_mode: "inclusive" | "exclusive";
  default_tax_rate: number;
  order_number_prefix: string;
  order_number_seq: number;
  company: Record<string, unknown>;
  legal: Record<string, unknown>;
  settings: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface ProductCategory {
  id: number;
  tenant_id: number;
  parent_id: number | null;
  slug: string;
  name: string;
  description: string | null;
  image_url: string | null;
  is_visible: boolean;
  sort_order: number;
  seo_title: string | null;
  seo_description: string | null;
  created_at: string;
  updated_at: string;
}

export type ProductStatus = "draft" | "active" | "archived";

export interface ProductOptionDef {
  name: string;
  values: string[];
}

export interface Product {
  id: number;
  tenant_id: number;
  slug: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  brand: string | null;
  status: ProductStatus;
  tax_rate: number | null;
  primary_category_id: number | null;
  options: ProductOptionDef[];
  flags: Record<string, unknown>;
  seo_title: string | null;
  seo_description: string | null;
  og_image: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProductVariant {
  id: number;
  tenant_id: number;
  product_id: number;
  sku: string | null;
  ean: string | null;
  title: string | null;
  option_values: Record<string, string>;
  price_cents: number;
  compare_at_price_cents: number | null;
  cost_cents: number | null;
  weight_grams: number | null;
  stock_qty: number;
  stock_policy: "deny" | "continue";
  track_stock: boolean;
  is_default: boolean;
  position: number;
  created_at: string;
  updated_at: string;
}

export interface ProductImage {
  id: number;
  tenant_id: number;
  product_id: number;
  variant_id: number | null;
  url: string;
  alt: string | null;
  position: number;
}

/** Product with joined detail used by admin + storefront. */
export interface ProductDetail extends Product {
  variants: ProductVariant[];
  images: ProductImage[];
  category_ids: number[];
}

/** Aggregated row for the admin products grid. */
export interface ProductListRow {
  id: number;
  slug: string;
  title: string;
  subtitle: string | null;
  brand: string | null;
  status: ProductStatus;
  price_min_cents: number;
  price_max_cents: number;
  compare_at_max_cents: number | null;
  stock_total: number;
  variant_count: number;
  sku: string | null;
  image_url: string | null;
  primary_category_id: number | null;
  updated_at: string;
  flags: string;
  created_at: string;
}

export interface Customer {
  id: number;
  tenant_id: number;
  email: string;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  company: Record<string, unknown>;
  marketing_consent: boolean;
  note: string | null;
  created_at: string;
  updated_at: string;
}

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "shipped"
  | "completed"
  | "cancelled";

export type PaymentStatus =
  | "pending"
  | "authorized"
  | "paid"
  | "failed"
  | "cancelled"
  | "refunded"
  | "partially_refunded";

export type FulfillmentStatus = "unfulfilled" | "partial" | "fulfilled";

export interface OrderAddress {
  name?: string;
  street?: string;
  city?: string;
  zip?: string;
  country?: string;
  phone?: string;
  company?: string;
  ico?: string;
  dic?: string;
}

export interface Order {
  id: number;
  tenant_id: number;
  order_number: string;
  customer_id: number | null;
  email: string;
  phone: string | null;
  status: OrderStatus;
  payment_status: PaymentStatus;
  fulfillment_status: FulfillmentStatus;
  currency: string;
  subtotal_cents: number;
  discount_cents: number;
  shipping_cents: number;
  tax_cents: number;
  total_cents: number;
  billing_address: OrderAddress;
  shipping_address: OrderAddress;
  shipping_method: string | null;
  payment_method: string | null;
  customer_note: string | null;
  admin_note: string | null;
  meta: Record<string, unknown>;
  public_token: string | null;
  placed_at: string;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: number;
  tenant_id: number;
  order_id: number;
  product_id: number | null;
  variant_id: number | null;
  title: string;
  variant_title: string | null;
  sku: string | null;
  qty: number;
  unit_price_cents: number;
  tax_rate: number;
  total_cents: number;
  meta: Record<string, unknown>;
  /** Hlavní obrázek produktu (doplňuje getOrder pro admin UI). */
  image_url?: string | null;
}

export interface OrderEvent {
  id: number;
  tenant_id: number;
  order_id: number;
  type: string;
  message: string | null;
  data: Record<string, unknown>;
  actor_email: string | null;
  created_at: string;
}

export interface OrderDetail extends Order {
  items: OrderItem[];
  events: OrderEvent[];
}
