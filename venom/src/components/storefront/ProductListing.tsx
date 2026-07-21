"use client";

import Link from "next/link";
import { useState, useMemo } from "react";

export interface ProductItem {
  id: number;
  slug: string;
  title: string;
  subtitle?: string | null;
  brand: string | null;
  image_url: string | null;
  price_min_cents: number;
  price_max_cents: number;
  compare_at_max_cents: number | null;
  stock_total: number;
  is_new?: boolean;
  is_sale?: boolean;
  is_featured?: boolean;
}

interface Category {
  id: number;
  slug: string;
  name: string;
  parent_id: number | null;
  product_count: number;
  image_url?: string | null;
  description?: string | null;
}

interface FilterableParam {
  id: number;
  slug: string;
  name: string;
  type: string;
  unit: string | null;
  values: string[];
}

interface Props {
  items: ProductItem[];
  categories: Category[];
  activeCategory: string | null;
  basePath: string;
  currency: string;
  shopName: string;
  total: number;
  page: number;
  pages: number;
  filterableParams?: FilterableParam[];
  initialBrand?: string | null;
  initialQuery?: string | null;
  /** Zobrazí přepínač hustoty mřížky 4/3 sloupce (opt-in per šablona). */
  columnsToggle?: boolean;
}

type ViewMode = "grid" | "list";
type SortMode = "newest" | "price-asc" | "price-desc" | "discount" | "name";

function czk(cents: number, currency = "CZK"): string {
  return new Intl.NumberFormat("cs-CZ", { style: "currency", currency, maximumFractionDigits: 0 }).format(cents / 100);
}

function discountPct(price: number, compare: number | null): number | null {
  if (!compare || compare <= price) return null;
  return Math.round((1 - price / compare) * 100);
}

/* ── Filter section with collapse ─────────────────────────────── */
function FilterSection({ title, children, defaultOpen = true }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-neutral-100 pb-5">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between py-1 text-left"
      >
        <span className="text-[12px] font-bold uppercase tracking-[0.12em] text-neutral-900">{title}</span>
        <svg className={`h-3.5 w-3.5 text-neutral-400 transition-transform duration-200 ${open ? "" : "-rotate-90"}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M6 9l6 6 6-6" /></svg>
      </button>
      {open && <div className="mt-3">{children}</div>}
    </div>
  );
}

/* ── Product card (grid) ──────────────────────────────────────── */
export function ProductCard({ p, basePath, currency }: { p: ProductItem; basePath: string; currency: string }) {
  const pct = discountPct(p.price_min_cents, p.compare_at_max_cents);
  const soldOut = p.stock_total <= 0;

  return (
    <Link
      href={`${basePath}/${p.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-neutral-100 bg-white transition-all duration-300 hover:-translate-y-0.5 hover:border-neutral-200 hover:shadow-[0_12px_32px_-12px_rgba(0,0,0,0.16)]"
    >
      <div className="relative aspect-square overflow-hidden bg-neutral-50">
        {p.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={p.image_url}
            alt={p.title}
            loading="lazy"
            className={`h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06] ${soldOut ? "opacity-60 saturate-50" : ""}`}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-neutral-300">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="9" cy="9" r="2" /><path d="M21 15l-5-5L5 21" /></svg>
          </div>
        )}

        {/* Badges */}
        <div className="absolute left-3 top-3 flex flex-col gap-1.5">
          {pct !== null && (
            <span className="rounded-md bg-red-600 px-2 py-1 text-[11px] font-bold leading-none text-white shadow-sm">−{pct} %</span>
          )}
          {p.is_new && (
            <span className="rounded-md bg-blue-600 px-2 py-1 text-[11px] font-bold leading-none text-white shadow-sm">Novinka</span>
          )}
          {p.is_featured && !p.is_new && pct === null && (
            <span className="rounded-md bg-neutral-950 px-2 py-1 text-[11px] font-bold leading-none text-white shadow-sm">Tip</span>
          )}
        </div>
        {soldOut && (
          <div className="absolute inset-x-0 bottom-0 bg-neutral-950/85 py-1.5 text-center text-[11px] font-bold uppercase tracking-widest text-white">
            Vyprodáno
          </div>
        )}

        {/* Hover CTA */}
        {!soldOut && (
          <div className="absolute inset-x-3 bottom-3 translate-y-2 opacity-0 transition-[transform,opacity] duration-300 group-hover:translate-y-0 group-hover:opacity-100">
            <span className="flex h-10 items-center justify-center rounded-xl bg-neutral-950/95 text-[13px] font-semibold text-white shadow-lg">
              Zobrazit detail
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        {p.brand && (
          <p className="text-[10.5px] font-bold uppercase tracking-[0.1em] text-neutral-400">{p.brand}</p>
        )}
        <h2 className="mt-1 line-clamp-2 text-[14px] font-semibold leading-snug text-neutral-900">{p.title}</h2>
        {p.subtitle && (
          <p className="mt-1 line-clamp-2 text-[12px] leading-snug text-neutral-500">{p.subtitle}</p>
        )}
        <div className="mt-auto flex items-end justify-between pt-3">
          <div>
            {pct !== null && p.compare_at_max_cents && (
              <p className="text-[12px] text-neutral-400 line-through">{czk(p.compare_at_max_cents, currency)}</p>
            )}
            <p className={`text-[15.5px] font-bold tabular-nums ${pct !== null ? "text-red-600" : "text-neutral-950"}`}>
              {p.price_min_cents === p.price_max_cents
                ? czk(p.price_min_cents, currency)
                : `od ${czk(p.price_min_cents, currency)}`}
            </p>
          </div>
          {!soldOut && (
            <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Skladem
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

/* ── Main listing ─────────────────────────────────────────────── */
export function ProductListing({
  items, categories, activeCategory, basePath, currency, shopName,
  total, page, pages, filterableParams = [], initialBrand = null, initialQuery = null,
  columnsToggle = false,
}: Props) {
  const [view, setView] = useState<ViewMode>("grid");
  const [gridCols, setGridCols] = useState<3 | 4>(columnsToggle ? 3 : 4);
  const [sort, setSort] = useState<SortMode>("newest");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 0]);
  const [onlyInStock, setOnlyInStock] = useState(false);
  const [onlySale, setOnlySale] = useState(false);
  const [brandFilter, setBrandFilter] = useState<string | null>(initialBrand);
  const [paramFilters, setParamFilters] = useState<Record<string, string[]>>({});
  const [mobileFilters, setMobileFilters] = useState(false);

  const brands = useMemo(() => {
    const counts = new Map<string, number>();
    items.forEach((p) => { if (p.brand) counts.set(p.brand, (counts.get(p.brand) ?? 0) + 1); });
    if (initialBrand && !counts.has(initialBrand)) counts.set(initialBrand, 0);
    return Array.from(counts.entries()).sort((a, b) => a[0].localeCompare(b[0], "cs"));
  }, [items, initialBrand]);

  const filtered = useMemo(() => {
    let list = [...items];
    if (initialQuery) {
      const q = initialQuery.toLowerCase();
      list = list.filter((p) => p.title.toLowerCase().includes(q) || (p.brand ?? "").toLowerCase().includes(q));
    }
    if (onlyInStock) list = list.filter((p) => p.stock_total > 0);
    if (onlySale) list = list.filter((p) => discountPct(p.price_min_cents, p.compare_at_max_cents) !== null);
    if (brandFilter) list = list.filter((p) => p.brand === brandFilter);
    if (priceRange[0] > 0 || priceRange[1] > 0) {
      const lo = priceRange[0] > 0 ? priceRange[0] * 100 : 0;
      const hi = priceRange[1] > 0 ? priceRange[1] * 100 : Infinity;
      list = list.filter((p) => p.price_min_cents >= lo && p.price_min_cents <= hi);
    }
    switch (sort) {
      case "price-asc": list.sort((a, b) => a.price_min_cents - b.price_min_cents); break;
      case "price-desc": list.sort((a, b) => b.price_min_cents - a.price_min_cents); break;
      case "discount": list.sort((a, b) => (discountPct(b.price_min_cents, b.compare_at_max_cents) ?? 0) - (discountPct(a.price_min_cents, a.compare_at_max_cents) ?? 0)); break;
      case "name": list.sort((a, b) => a.title.localeCompare(b.title, "cs")); break;
    }
    return list;
  }, [items, sort, onlyInStock, onlySale, brandFilter, priceRange, initialQuery]);

  const activeCat = categories.find((c) => c.slug === activeCategory);
  const parentCat = activeCat?.parent_id ? categories.find((c) => c.id === activeCat.parent_id) : null;
  const siblingOrChildCats = activeCat
    ? categories.filter((c) => c.parent_id === activeCat.id)
    : [];

  const hasActiveFilters = onlyInStock || onlySale || brandFilter || Object.keys(paramFilters).length > 0 || priceRange[0] > 0 || priceRange[1] > 0;

  // Strom kategorií pro sidebar: děti aktivní kategorie, jinak sourozenci, jinak top-level.
  const treeItems = activeCat
    ? (siblingOrChildCats.length > 0
        ? siblingOrChildCats
        : categories.filter((c) => c.parent_id === activeCat.parent_id))
    : categories.filter((c) => !c.parent_id);
  const treeHeading = activeCat
    ? (siblingOrChildCats.length > 0 ? activeCat : parentCat) ?? null
    : null;

  const categoryTree = (
    <div className="border-b border-neutral-100 pb-5">
      <p className="text-[12px] font-bold uppercase tracking-[0.12em] text-neutral-900">Kategorie</p>
      <div className="mt-3">
        {treeHeading ? (
          <Link
            href={treeHeading.parent_id
              ? `${basePath}?kategorie=${categories.find((c) => c.id === treeHeading.parent_id)?.slug ?? ""}`
              : `${basePath}?vse=1`}
            className="mb-1 flex items-center gap-1.5 rounded-lg px-1 py-1.5 text-[13.5px] font-bold text-neutral-950 transition hover:bg-neutral-50"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="M15 18l-6-6 6-6" /></svg>
            {treeHeading.name}
          </Link>
        ) : (
          <Link
            href={`${basePath}?vse=1`}
            className={`mb-1 flex items-center rounded-lg px-2 py-1.5 text-[13.5px] transition hover:bg-neutral-50 ${!activeCat ? "font-bold text-neutral-950" : "font-medium text-neutral-600"}`}
          >
            Všechny produkty
          </Link>
        )}
        <div className={treeHeading ? "space-y-0.5 border-l border-neutral-100 pl-3" : "space-y-0.5"}>
          {treeItems.map((c) => {
            const isActive = c.slug === activeCategory;
            return (
              <Link
                key={c.id}
                href={`${basePath}?kategorie=${c.slug}`}
                className={`flex items-center justify-between rounded-lg px-2 py-1.5 text-[13.5px] transition hover:bg-neutral-50 ${
                  isActive ? "bg-neutral-950 font-bold text-white hover:bg-neutral-950" : "font-medium text-neutral-600 hover:text-neutral-950"
                }`}
              >
                <span className="truncate">{c.name}</span>
                <span className={`ml-2 text-[11.5px] tabular-nums ${isActive ? "text-white/60" : "text-neutral-400"}`}>{c.product_count}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );

  const filterSidebar = (
    <div className="space-y-5">
      {categoryTree}
      {/* Price */}
      <FilterSection title="Cena">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <input
              type="number" placeholder="Od" min={0}
              value={priceRange[0] || ""}
              onChange={(e) => setPriceRange([parseInt(e.target.value) || 0, priceRange[1]])}
              className="h-10 w-full rounded-xl border border-neutral-200 bg-neutral-50/50 px-3 pr-8 text-[13px] font-medium outline-none transition focus:border-neutral-900 focus:bg-white"
            />
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-neutral-400">Kč</span>
          </div>
          <span className="text-neutral-300">–</span>
          <div className="relative flex-1">
            <input
              type="number" placeholder="Do" min={0}
              value={priceRange[1] || ""}
              onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value) || 0])}
              className="h-10 w-full rounded-xl border border-neutral-200 bg-neutral-50/50 px-3 pr-8 text-[13px] font-medium outline-none transition focus:border-neutral-900 focus:bg-white"
            />
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-neutral-400">Kč</span>
          </div>
        </div>
      </FilterSection>

      {/* Availability */}
      <FilterSection title="Dostupnost">
        <div className="space-y-1">
          <label className="flex cursor-pointer items-center gap-2.5 rounded-lg px-1 py-1.5 transition hover:bg-neutral-50">
            <input type="checkbox" checked={onlyInStock} onChange={(e) => setOnlyInStock(e.target.checked)}
              className="h-4 w-4 rounded border-neutral-300 accent-neutral-950" />
            <span className="text-[13.5px] font-medium text-neutral-700">Pouze skladem</span>
          </label>
          <label className="flex cursor-pointer items-center gap-2.5 rounded-lg px-1 py-1.5 transition hover:bg-neutral-50">
            <input type="checkbox" checked={onlySale} onChange={(e) => setOnlySale(e.target.checked)}
              className="h-4 w-4 rounded border-neutral-300 accent-neutral-950" />
            <span className="text-[13.5px] font-medium text-neutral-700">Ve slevě</span>
          </label>
        </div>
      </FilterSection>

      {/* Brands */}
      {brands.length > 0 && (
        <FilterSection title="Značka">
          <div className="max-h-56 space-y-0.5 overflow-y-auto pr-1">
            {brands.map(([b, count]) => (
              <label key={b} className="flex cursor-pointer items-center gap-2.5 rounded-lg px-1 py-1.5 transition hover:bg-neutral-50">
                <input
                  type="radio" name="brand"
                  checked={brandFilter === b}
                  onChange={() => setBrandFilter(b === brandFilter ? null : b)}
                  onClick={() => { if (brandFilter === b) setBrandFilter(null); }}
                  className="h-4 w-4 border-neutral-300 accent-neutral-950"
                />
                <span className="flex-1 text-[13.5px] font-medium text-neutral-700">{b}</span>
                <span className="text-[11.5px] font-medium tabular-nums text-neutral-400">{count}</span>
              </label>
            ))}
          </div>
          {brandFilter && (
            <button onClick={() => setBrandFilter(null)} className="mt-2 text-[12px] font-semibold text-neutral-400 underline-offset-2 hover:text-neutral-700 hover:underline">
              Zrušit výběr značky
            </button>
          )}
        </FilterSection>
      )}

      {/* Param facets */}
      {filterableParams.map((p) => (
        <FilterSection key={p.id} title={p.unit ? `${p.name} (${p.unit})` : p.name} defaultOpen={false}>
          <div className="max-h-48 space-y-0.5 overflow-y-auto pr-1">
            {p.values.map((v) => {
              const selected = paramFilters[p.slug]?.includes(v) ?? false;
              return (
                <label key={v} className="flex cursor-pointer items-center gap-2.5 rounded-lg px-1 py-1.5 transition hover:bg-neutral-50">
                  <input
                    type="checkbox" checked={selected}
                    onChange={() => {
                      setParamFilters((prev) => {
                        const curr = prev[p.slug] ?? [];
                        const next = selected ? curr.filter((x) => x !== v) : [...curr, v];
                        if (next.length === 0) {
                          const { [p.slug]: _, ...rest } = prev;
                          return rest;
                        }
                        return { ...prev, [p.slug]: next };
                      });
                    }}
                    className="h-4 w-4 rounded border-neutral-300 accent-neutral-950"
                  />
                  <span className="text-[13.5px] font-medium text-neutral-700">{v}</span>
                </label>
              );
            })}
          </div>
        </FilterSection>
      ))}

      {hasActiveFilters && (
        <button
          onClick={() => { setOnlyInStock(false); setOnlySale(false); setBrandFilter(null); setParamFilters({}); setPriceRange([0, 0]); }}
          className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-neutral-200 py-2.5 text-[12.5px] font-bold text-neutral-600 transition hover:border-neutral-950 hover:text-neutral-950"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
          Zrušit všechny filtry
        </button>
      )}
    </div>
  );

  return (
    <div>
      {/* Breadcrumbs */}
      <nav className="mb-5 flex items-center gap-1.5 text-[12.5px] text-neutral-400">
        <Link href={basePath} className="transition hover:text-neutral-900">{shopName || "Obchod"}</Link>
        {parentCat && (
          <>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M9 6l6 6-6 6" /></svg>
            <Link href={`${basePath}?kategorie=${parentCat.slug}`} className="transition hover:text-neutral-900">{parentCat.name}</Link>
          </>
        )}
        {activeCat ? (
          <>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M9 6l6 6-6 6" /></svg>
            <span className="font-semibold text-neutral-900">{activeCat.name}</span>
          </>
        ) : initialQuery ? (
          <>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M9 6l6 6-6 6" /></svg>
            <span className="font-semibold text-neutral-900">Hledání: „{initialQuery}"</span>
          </>
        ) : (
          <>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M9 6l6 6-6 6" /></svg>
            <span className="font-semibold text-neutral-900">Všechny produkty</span>
          </>
        )}
      </nav>

      {/* Heading — hero banner s obrázkem kategorie, jinak plochý nadpis */}
      {activeCat?.image_url && !initialQuery ? (
        <header className="relative mb-7 overflow-hidden rounded-3xl bg-neutral-950">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={activeCat.image_url.replace("w=600&h=600", "w=1600&h=400")}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-black/15" />
          <div className="relative px-7 py-10 sm:px-10 sm:py-14">
            <h1 className="text-[32px] font-extrabold tracking-tight text-white sm:text-[42px]">{activeCat.name}</h1>
            {activeCat.description && (
              <p className="mt-3 max-w-[640px] text-[14px] leading-relaxed text-white/85">{activeCat.description}</p>
            )}
            <p className="mt-2 text-[13px] font-semibold text-white/60">
              {filtered.length} {filtered.length === 1 ? "produkt" : filtered.length >= 2 && filtered.length <= 4 ? "produkty" : "produktů"}
              {hasActiveFilters && " (filtrováno)"}
            </p>
          </div>
        </header>
      ) : (
        <header className="mb-6">
          <h1 className="text-[30px] font-extrabold tracking-tight text-neutral-950">
            {initialQuery ? `Výsledky pro „${initialQuery}"` : activeCat ? activeCat.name : brandFilter && initialBrand ? initialBrand : "Všechny produkty"}
          </h1>
          {activeCat?.description && !initialQuery && (
            <p className="mt-2 max-w-[720px] text-[14px] leading-relaxed text-neutral-600">{activeCat.description}</p>
          )}
          <p className="mt-1.5 text-[13.5px] text-neutral-500">
            {filtered.length} {filtered.length === 1 ? "produkt" : filtered.length >= 2 && filtered.length <= 4 ? "produkty" : "produktů"}
            {hasActiveFilters && " (filtrováno)"}
          </p>
        </header>
      )}

      {/* Subcategory tiles s fotkami */}
      {siblingOrChildCats.length > 0 && (
        <div className="mb-7 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
          {siblingOrChildCats.map((c) => (
            <Link
              key={c.id}
              href={`${basePath}?kategorie=${c.slug}`}
              className="group flex items-center gap-3 rounded-2xl border border-neutral-100 bg-white p-2.5 pr-4 transition-all hover:-translate-y-0.5 hover:border-neutral-200 hover:shadow-[0_10px_24px_-12px_rgba(0,0,0,0.18)]"
            >
              <span className="h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-neutral-100">
                {c.image_url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={c.image_url.replace("w=600&h=600", "w=120&h=120")}
                    alt=""
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                )}
              </span>
              <span className="min-w-0">
                <span className="block truncate text-[13px] font-bold text-neutral-900">{c.name}</span>
                <span className="block text-[11px] font-medium text-neutral-400">{c.product_count} produktů</span>
              </span>
            </Link>
          ))}
        </div>
      )}

      {/* Toolbar */}
      <div className="mb-6 flex items-center gap-2 rounded-2xl border border-neutral-100 bg-neutral-50/60 px-3 py-2.5 sm:gap-3 sm:px-4 sm:py-3">
        <button
          onClick={() => setMobileFilters(!mobileFilters)}
          className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-xl border border-neutral-200 bg-white px-3 text-[13px] font-semibold text-neutral-700 transition hover:border-neutral-950 sm:gap-2 sm:px-3.5 lg:hidden"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 6h16M7 12h10M10 18h4" /></svg>
          Filtry {hasActiveFilters && <span className="flex h-4 w-4 items-center justify-center rounded-full bg-neutral-950 text-[10px] font-bold text-white">!</span>}
        </button>

        <div className="ml-auto flex min-w-0 flex-1 items-center justify-end gap-2 lg:flex-none">
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortMode)}
            className="h-10 min-w-0 max-w-[190px] flex-1 cursor-pointer rounded-xl border border-neutral-200 bg-white px-3 pr-7 text-[13px] font-semibold text-neutral-700 outline-none transition focus:border-neutral-950 sm:flex-none sm:px-3.5 sm:pr-8"
          >
            <option value="newest">Nejnovější</option>
            <option value="price-asc">Nejlevnější</option>
            <option value="price-desc">Nejdražší</option>
            <option value="discount">Největší sleva</option>
            <option value="name">Název A–Z</option>
          </select>

          {columnsToggle && view === "grid" && (
            <select
              value={gridCols}
              onChange={(e) => setGridCols(Number(e.target.value) === 3 ? 3 : 4)}
              className="h-10 shrink-0 cursor-pointer rounded-xl border border-neutral-200 bg-white px-3 pr-7 text-[13px] font-semibold text-neutral-700 outline-none transition focus:border-neutral-950 sm:px-3.5 sm:pr-8"
              aria-label="Počet produktů v řadě"
            >
              <option value={4}>4 v řadě</option>
              <option value={3}>3 v řadě</option>
            </select>
          )}

          <div className="flex shrink-0 overflow-hidden rounded-xl border border-neutral-200 bg-white">
            <button
              onClick={() => setView("grid")}
              className={`flex h-10 w-10 items-center justify-center transition ${view === "grid" ? "bg-neutral-950 text-white" : "text-neutral-400 hover:text-neutral-700"}`}
              aria-label="Mřížka"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></svg>
            </button>
            <button
              onClick={() => setView("list")}
              className={`flex h-10 w-10 items-center justify-center border-l border-neutral-200 transition ${view === "list" ? "bg-neutral-950 text-white" : "text-neutral-400 hover:text-neutral-700"}`}
              aria-label="Seznam"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="4" y1="6" x2="20" y2="6" /><line x1="4" y1="12" x2="20" y2="12" /><line x1="4" y1="18" x2="20" y2="18" /></svg>
            </button>
          </div>
        </div>
      </div>

      {/* Active filter chips */}
      {hasActiveFilters && (
        <div className="mb-6 flex flex-wrap items-center gap-2">
          {onlyInStock && (
            <button onClick={() => setOnlyInStock(false)} className="group flex items-center gap-1.5 rounded-full bg-neutral-950 px-3.5 py-1.5 text-[12.5px] font-semibold text-white transition hover:bg-neutral-700">
              Pouze skladem
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
            </button>
          )}
          {onlySale && (
            <button onClick={() => setOnlySale(false)} className="group flex items-center gap-1.5 rounded-full bg-red-600 px-3.5 py-1.5 text-[12.5px] font-semibold text-white transition hover:bg-red-500">
              Ve slevě
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
            </button>
          )}
          {brandFilter && (
            <button onClick={() => setBrandFilter(null)} className="group flex items-center gap-1.5 rounded-full bg-neutral-950 px-3.5 py-1.5 text-[12.5px] font-semibold text-white transition hover:bg-neutral-700">
              {brandFilter}
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
            </button>
          )}
          {(priceRange[0] > 0 || priceRange[1] > 0) && (
            <button onClick={() => setPriceRange([0, 0])} className="group flex items-center gap-1.5 rounded-full bg-neutral-950 px-3.5 py-1.5 text-[12.5px] font-semibold text-white transition hover:bg-neutral-700">
              {priceRange[0] > 0 ? `od ${priceRange[0].toLocaleString("cs-CZ")} Kč` : ""}{priceRange[0] > 0 && priceRange[1] > 0 ? " " : ""}{priceRange[1] > 0 ? `do ${priceRange[1].toLocaleString("cs-CZ")} Kč` : ""}
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
            </button>
          )}
          {Object.entries(paramFilters).flatMap(([slug, vals]) =>
            vals.map((v) => (
              <button
                key={`${slug}:${v}`}
                onClick={() => setParamFilters((prev) => {
                  const next = (prev[slug] ?? []).filter((x) => x !== v);
                  if (next.length === 0) {
                    const { [slug]: _, ...rest } = prev;
                    return rest;
                  }
                  return { ...prev, [slug]: next };
                })}
                className="group flex items-center gap-1.5 rounded-full bg-neutral-950 px-3.5 py-1.5 text-[12.5px] font-semibold text-white transition hover:bg-neutral-700"
              >
                {v}
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
              </button>
            ))
          )}
          <button
            onClick={() => { setOnlyInStock(false); setOnlySale(false); setBrandFilter(null); setParamFilters({}); setPriceRange([0, 0]); }}
            className="text-[12.5px] font-semibold text-neutral-400 underline-offset-2 transition hover:text-neutral-950 hover:underline"
          >
            Zrušit vše
          </button>
        </div>
      )}

      {/* Mobile filters */}
      {mobileFilters && (
        <div className="mb-6 rounded-2xl border border-neutral-200 bg-white p-5 lg:hidden">
          {filterSidebar}
        </div>
      )}

      <div className="flex gap-8">
        {/* Desktop sidebar */}
        <aside className="hidden w-[264px] shrink-0 lg:block">
          <div className="rounded-2xl border border-neutral-100 bg-white p-5">{filterSidebar}</div>
        </aside>

        {/* Products */}
        <div className="min-w-0 flex-1">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center py-20 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-neutral-100 text-neutral-400">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="11" cy="11" r="7.5" /><path d="M20.5 20.5l-3.5-3.5M8 11h6" /></svg>
              </div>
              <p className="mt-4 text-[16px] font-bold text-neutral-900">Nic jsme nenašli</p>
              <p className="mt-1 text-[13.5px] text-neutral-500">Zkuste upravit filtry nebo hledaný výraz.</p>
              {hasActiveFilters && (
                <button
                  onClick={() => { setOnlyInStock(false); setOnlySale(false); setBrandFilter(null); setParamFilters({}); setPriceRange([0, 0]); }}
                  className="mt-5 rounded-xl bg-neutral-950 px-5 py-2.5 text-[13px] font-semibold text-white transition hover:bg-neutral-800"
                >
                  Zrušit filtry
                </button>
              )}
            </div>
          ) : view === "grid" ? (
            <div className={gridCols === 3 ? "grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-3" : "grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4"}>
              {filtered.map((p) => (
                <ProductCard key={p.id} p={p} basePath={basePath} currency={currency} />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((p) => {
                const pct = discountPct(p.price_min_cents, p.compare_at_max_cents);
                const soldOut = p.stock_total <= 0;
                return (
                  <Link key={p.id} href={`${basePath}/${p.slug}`}
                    className="group flex items-center gap-5 rounded-2xl border border-neutral-100 bg-white p-3.5 transition hover:border-neutral-200 hover:shadow-[0_8px_24px_-10px_rgba(0,0,0,0.12)]">
                    <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-xl bg-neutral-50">
                      {p.image_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={p.image_url} alt={p.title} loading="lazy" className={`h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 ${soldOut ? "opacity-60 saturate-50" : ""}`} />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-[11px] text-neutral-300">Bez fotky</div>
                      )}
                      {pct !== null && (
                        <span className="absolute left-1.5 top-1.5 rounded bg-red-600 px-1.5 py-0.5 text-[10px] font-bold text-white">−{pct} %</span>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      {p.brand && <p className="text-[10.5px] font-bold uppercase tracking-[0.1em] text-neutral-400">{p.brand}</p>}
                      <h2 className="mt-0.5 text-[15.5px] font-semibold leading-snug text-neutral-900">{p.title}</h2>
                      {p.subtitle && <p className="mt-0.5 line-clamp-1 text-[12.5px] text-neutral-500">{p.subtitle}</p>}
                      <div className="mt-2 flex items-center gap-3">
                        {pct !== null && p.compare_at_max_cents && (
                          <span className="text-[12.5px] text-neutral-400 line-through">{czk(p.compare_at_max_cents, currency)}</span>
                        )}
                        <span className={`text-[16px] font-bold tabular-nums ${pct !== null ? "text-red-600" : "text-neutral-950"}`}>
                          {p.price_min_cents === p.price_max_cents ? czk(p.price_min_cents, currency) : `od ${czk(p.price_min_cents, currency)}`}
                        </span>
                        {soldOut ? (
                          <span className="rounded-full bg-neutral-100 px-2.5 py-1 text-[11px] font-bold text-neutral-400">Vyprodáno</span>
                        ) : (
                          <span className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-600">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                            Skladem
                          </span>
                        )}
                      </div>
                    </div>
                    <span className="mr-1 hidden shrink-0 rounded-xl border border-neutral-200 px-4 py-2.5 text-[13px] font-semibold text-neutral-700 transition group-hover:border-neutral-950 group-hover:bg-neutral-950 group-hover:text-white sm:block">
                      Detail
                    </span>
                  </Link>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          {pages > 1 && (
            <nav className="mt-12 flex items-center justify-center gap-1.5 text-[13.5px]">
              {page > 1 && (
                <Link
                  href={`${basePath}?${new URLSearchParams({ ...(activeCategory ? { kategorie: activeCategory } : {}), strana: String(page - 1) })}`}
                  className="flex h-10 items-center gap-1 rounded-xl border border-neutral-200 px-3.5 font-semibold text-neutral-600 transition hover:border-neutral-950 hover:text-neutral-950"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M15 18l-6-6 6-6" /></svg>
                  Předchozí
                </Link>
              )}
              {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
                <Link
                  key={n}
                  href={`${basePath}?${new URLSearchParams({ ...(activeCategory ? { kategorie: activeCategory } : {}), strana: String(n) })}`}
                  className={`flex h-10 w-10 items-center justify-center rounded-xl font-bold transition ${n === page ? "bg-neutral-950 text-white" : "border border-neutral-200 text-neutral-600 hover:border-neutral-950 hover:text-neutral-950"}`}
                >
                  {n}
                </Link>
              ))}
              {page < pages && (
                <Link
                  href={`${basePath}?${new URLSearchParams({ ...(activeCategory ? { kategorie: activeCategory } : {}), strana: String(page + 1) })}`}
                  className="flex h-10 items-center gap-1 rounded-xl border border-neutral-200 px-3.5 font-semibold text-neutral-600 transition hover:border-neutral-950 hover:text-neutral-950"
                >
                  Další
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M9 6l6 6-6 6" /></svg>
                </Link>
              )}
            </nav>
          )}
        </div>
      </div>
    </div>
  );
}
