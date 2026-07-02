import {
  fetchContacts,
  fetchOrders,
  fetchProducts,
  type BackendContact,
  type BackendOrder,
  type BackendProduct,
} from '@/crm/services/backend';

export type StoreCategoryStatus = 'active' | 'inactive' | 'draft' | 'archived';

export interface StoreCategory {
  id: string;
  name: string;
  slug: string;
  status: StoreCategoryStatus;
  featured: boolean;
  description: string;
  image: string;
  productsQty: number;
  ordersQty: number;
  customersQty: number;
  totalEarnings: number;
  createdAt: string;
  updatedAt: string;
}

const STORAGE_KEY = 'store_categories_v2';

function slugify(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function iconForSlug(slug: string): string {
  const icons = [
    'running-shoes.svg',
    'casual-sneaker.svg',
    'ankle-boot.svg',
    'ski-boots.svg',
    'sandals.svg',
    'football-boot.svg',
    'hiking-boot.svg',
    'slip-on-shoe.svg',
  ];
  let hash = 0;
  for (let i = 0; i < slug.length; i += 1) {
    hash = (hash * 31 + slug.charCodeAt(i)) >>> 0;
  }
  return icons[hash % icons.length];
}

function parseStoredCategories(): StoreCategory[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as StoreCategory[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveStoredCategories(categories: StoreCategory[]) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(categories));
}

function normalizeCategoryName(value: string | null | undefined): string {
  const v = (value || '').trim();
  return v || 'General';
}

function identityFromCustomer(order: BackendOrder): string {
  const email = (order.customerEmail || '').trim().toLowerCase();
  if (email) return `email:${email}`;
  const name = (order.customerName || '').trim().toLowerCase();
  if (name) return `name:${name}`;
  return `order:${order.id}`;
}

function deriveFromData(
  products: BackendProduct[],
  orders: BackendOrder[],
  contacts: BackendContact[],
): StoreCategory[] {
  const bySlug = new Map<string, StoreCategory>();
  const customerEmailSet = new Set(
    contacts
      .filter((c) => c.contactType === 'customer')
      .map((c) => (c.email || '').trim().toLowerCase())
      .filter(Boolean),
  );
  const customerNameSet = new Set(
    contacts
      .filter((c) => c.contactType === 'customer')
      .map((c) => `${(c.firstName || '').trim()} ${(c.lastName || '').trim()}`.trim().toLowerCase())
      .filter(Boolean),
  );
  const categoryCustomers = new Map<string, Set<string>>();

  const ensure = (categoryName: string, ts: string): StoreCategory => {
    const slug = slugify(categoryName) || 'general';
    const current = bySlug.get(slug);
    if (current) return current;
    const created: StoreCategory = {
      id: `cat-${slug}`,
      name: categoryName,
      slug,
      status: 'active',
      featured: false,
      description: '',
      image: iconForSlug(slug),
      productsQty: 0,
      ordersQty: 0,
      customersQty: 0,
      totalEarnings: 0,
      createdAt: ts,
      updatedAt: ts,
    };
    bySlug.set(slug, created);
    return created;
  };

  for (const product of products || []) {
    const categoryName = normalizeCategoryName(product.category);
    const item = ensure(categoryName, product.createdAt || new Date().toISOString());
    item.productsQty += 1;
    if (new Date(product.updatedAt || 0).getTime() > new Date(item.updatedAt).getTime()) {
      item.updatedAt = product.updatedAt || item.updatedAt;
    }
  }

  for (const order of orders || []) {
    const categories = new Set<string>();
    categories.add(normalizeCategoryName(order.category));
    for (const item of order.items || []) {
      categories.add(normalizeCategoryName(item.category));
    }

    for (const categoryName of categories) {
      const item = ensure(categoryName, order.createdAt || new Date().toISOString());
      item.ordersQty += 1;
      item.totalEarnings += order.total || 0;
      if (new Date(order.updatedAt || 0).getTime() > new Date(item.updatedAt).getTime()) {
        item.updatedAt = order.updatedAt || item.updatedAt;
      }

      const customerIdentity = identityFromCustomer(order);
      if (!categoryCustomers.has(item.slug)) categoryCustomers.set(item.slug, new Set());
      const hasKnownCustomer =
        (order.customerEmail && customerEmailSet.has(order.customerEmail.trim().toLowerCase())) ||
        customerNameSet.has((order.customerName || '').trim().toLowerCase());
      // If contact exists we still store normalized order identity, so dedupe stays stable across runs.
      categoryCustomers.get(item.slug)?.add(hasKnownCustomer ? customerIdentity : customerIdentity);
    }
  }

  for (const [slug, customers] of categoryCustomers.entries()) {
    const row = bySlug.get(slug);
    if (!row) continue;
    row.customersQty = customers.size;
    if (row.productsQty === 0 && row.ordersQty === 0) row.status = 'draft';
    else if (row.ordersQty === 0) row.status = 'inactive';
    else row.status = 'active';
  }

  for (const row of bySlug.values()) {
    if (row.productsQty === 0 && row.ordersQty === 0) row.status = 'draft';
    else if (row.ordersQty === 0) row.status = 'inactive';
    else row.status = 'active';
  }

  return Array.from(bySlug.values());
}

function mergeCategories(base: StoreCategory[], stored: StoreCategory[]): StoreCategory[] {
  const map = new Map<string, StoreCategory>();
  for (const item of base) map.set(item.slug, item);

  for (const item of stored) {
    const existing = map.get(item.slug);
    if (existing) {
      map.set(item.slug, {
        ...existing,
        id: item.id || existing.id,
        status: item.status || existing.status,
        featured: item.featured,
        description: item.description || existing.description,
        image: item.image || existing.image,
        name: item.name || existing.name,
        updatedAt: item.updatedAt || existing.updatedAt,
        // metrics are always derived from live data
        productsQty: existing.productsQty,
        ordersQty: existing.ordersQty,
        customersQty: existing.customersQty,
        totalEarnings: existing.totalEarnings,
      });
      continue;
    }
    map.set(item.slug, item);
  }

  return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
}

export async function loadStoreCategories(): Promise<StoreCategory[]> {
  const [productsRes, ordersRes, contactsRes] = await Promise.all([
    fetchProducts({ page: 1, limit: 5000 }),
    fetchOrders({ page: 1, limit: 5000 }),
    fetchContacts({ limit: 5000, contactType: 'customer' }),
  ]);
  const derived = deriveFromData(productsRes.data ?? [], ordersRes.data ?? [], contactsRes.data ?? []);
  const stored = parseStoredCategories();
  const merged = mergeCategories(derived, stored);
  saveStoredCategories(merged);
  return merged;
}

export function upsertStoreCategory(
  category: Omit<StoreCategory, 'id' | 'createdAt' | 'updatedAt' | 'slug'> & { slug?: string; id?: string },
): StoreCategory {
  const existing = parseStoredCategories();
  const now = new Date().toISOString();
  const slug = slugify(category.slug || category.name) || `category-${Date.now()}`;
  const match = existing.find((item) => item.slug === slug || item.id === category.id);

  const payload: StoreCategory = {
    id: match?.id || category.id || `cat-${slug}`,
    slug,
    createdAt: match?.createdAt || now,
    updatedAt: now,
    name: category.name,
    status: category.status,
    featured: category.featured,
    description: category.description,
    image: category.image || iconForSlug(slug),
    productsQty: category.productsQty,
    ordersQty: category.ordersQty,
    customersQty: category.customersQty,
    totalEarnings: category.totalEarnings,
  };

  const rest = existing.filter((item) => item.id !== payload.id && item.slug !== payload.slug);
  const next = [...rest, payload];
  saveStoredCategories(next);
  return payload;
}

export function deleteStoreCategory(id: string): void {
  const current = parseStoredCategories();
  const next = current.filter((item) => item.id !== id);
  saveStoredCategories(next);
}
