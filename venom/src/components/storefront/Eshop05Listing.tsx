"use client";

/**
 * eshop-05 "Hračkolandia" — pompo.cz kategorie/listing.
 *
 * Layout dle pompo.cz/domecky-a-stany:
 *   breadcrumb + H1 → dlaždice podkategorií → Nejprodávanější (top 3
 *   s číslovanými odznaky) → toolbar (Seřadit N produktů + select + pager)
 *   → sidebar filtry (Skladovost / Značky se search / Cena / parametry)
 *   → 4-sloupcový grid pompo karet (Skladem online + prodejna, červená
 *   cena + DMOC přeškrtnuté) → „Zobrazit další produkty" + číslované
 *   stránkování → SEO text.
 */

import Link from "next/link";
import { useState, useMemo } from "react";
import type { ProductItem } from "./ProductListing";

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
}

const RED = "#ff3b5c";
const NAVY = "#0e1b2c";
const GREEN = "#12b76a";
const MUTED = "#64748b";
const BORDER = "#e7eaee";
const SURFACE = "#f2f4f7";

function czk(cents: number, currency = "CZK"): string {
  return new Intl.NumberFormat("cs-CZ", { style: "currency", currency, maximumFractionDigits: 0 }).format(cents / 100);
}

function discountPct(price: number, compare: number | null): number | null {
  if (!compare || compare <= price) return null;
  return Math.round((1 - price / compare) * 100);
}

/* ── Pompo availability rows ─────────────────────────────────── */
function AvailRows({ p }: { p: ProductItem }) {
  const soldOut = p.stock_total <= 0;
  const lastPiece = !soldOut && p.stock_total === 1;
  return (
    <div className="mt-1.5 space-y-0.5">
      <span className="flex items-center gap-1.5 text-[12px] font-bold" style={{ color: soldOut ? MUTED : GREEN }}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M1 4h13v12H1zm13 4h4l3 3v5h-7zM5 18.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zm12 0a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z"/></svg>
        {soldOut ? "Vyprodáno" : lastPiece ? "Skladem poslední kus" : "Skladem online"}
      </span>
      <span className="flex items-center gap-1.5 text-[12px] font-semibold" style={{ color: p.stock_total > 3 ? GREEN : MUTED }}>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="3"/></svg>
        {p.stock_total > 3 ? "Skladem v prodejně" : "Dostupné v jiných prodejnách"}
      </span>
    </div>
  );
}

/* ── Pompo product card ──────────────────────────────────────── */
function Eshop05Card({ p, basePath, currency }: { p: ProductItem; basePath: string; currency: string }) {
  const pct = discountPct(p.price_min_cents, p.compare_at_max_cents);
  return (
    <Link href={`${basePath}/${p.slug}`} className="es05l-card group flex flex-col">
      <div className="relative overflow-hidden rounded-lg" style={{ background: "#f5f6f8", aspectRatio: "1/1" }}>
        {pct !== null && (
          <span className="absolute left-3 top-3 z-10 rounded px-2 py-1 text-[11.5px] font-extrabold leading-none text-white" style={{ background: RED }}>−{pct}%</span>
        )}
        {p.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={p.image_url} alt={p.title} loading="lazy"
            className="h-full w-full object-cover p-0 transition-transform duration-500 group-hover:scale-[1.05]" />
        ) : (
          <div className="flex h-full w-full items-center justify-center" style={{ color: "#cbd5e1" }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="9" cy="9" r="2" /><path d="M21 15l-5-5L5 21" /></svg>
          </div>
        )}
        {p.stock_total > 0 && (
          <span className="es05l-cart absolute bottom-3 right-3 z-10 flex h-11 w-11 items-center justify-center rounded-full text-white opacity-0 shadow-lg transition-all duration-200 group-hover:opacity-100"
            style={{ background: GREEN }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round"><circle cx="9" cy="20" r="1.3"/><circle cx="17" cy="20" r="1.3"/><path d="M1 1h3.27l2.4 12.27a2 2 0 0 0 2 1.73h8.4a2 2 0 0 0 2-1.46L21 6H6"/></svg>
          </span>
        )}
      </div>
      <h2 className="mt-3 line-clamp-2 min-h-[38px] text-[14px] font-bold leading-snug group-hover:underline" style={{ color: NAVY, textUnderlineOffset: 3 }}>{p.title}</h2>
      <AvailRows p={p} />
      <div className="mt-2">
        <p className="text-[17px] font-extrabold tabular-nums" style={{ color: pct !== null ? RED : NAVY }}>
          {p.price_min_cents === p.price_max_cents ? czk(p.price_min_cents, currency) : `od ${czk(p.price_min_cents, currency)}`}
        </p>
        {pct !== null && p.compare_at_max_cents && (
          <p className="text-[12px] font-semibold" style={{ color: MUTED }}>
            <span style={{ borderBottom: `1px dotted ${MUTED}` }}>DMOC: <span className="line-through">{czk(p.compare_at_max_cents, currency)}</span></span>
          </p>
        )}
      </div>
    </Link>
  );
}

/* ── Sidebar filter block ────────────────────────────────────── */
function SideBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-b pb-5" style={{ borderColor: BORDER }}>
      <p className="mb-3 text-[14.5px] font-extrabold" style={{ color: NAVY }}>{title}</p>
      {children}
    </div>
  );
}

function CheckRow({ label, count, checked, onChange }: { label: string; count?: number; checked: boolean; onChange: () => void }) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-2 py-1">
      <span className="flex items-center gap-2.5">
        <input type="checkbox" checked={checked} onChange={onChange} className="h-4 w-4 rounded" style={{ accentColor: RED }} />
        <span className="text-[13.5px] font-semibold" style={{ color: "#33445c" }}>{label}</span>
      </span>
      {count !== undefined && <span className="text-[12px] tabular-nums" style={{ color: MUTED }}>{count}</span>}
    </label>
  );
}

/* ── Main ────────────────────────────────────────────────────── */
export function Eshop05Listing({
  items, categories, activeCategory, basePath, currency,
  total, page, pages, filterableParams = [], initialBrand = null, initialQuery = null,
}: Props) {
  const [sort, setSort] = useState("featured");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 0]);
  const [stockFilters, setStockFilters] = useState<{ online: boolean; supplier: boolean; store: boolean }>({ online: false, supplier: false, store: false });
  const [brandFilters, setBrandFilters] = useState<Set<string>>(new Set(initialBrand ? [initialBrand] : []));
  const [brandSearch, setBrandSearch] = useState("");
  const [paramFilters, setParamFilters] = useState<Record<string, Set<string>>>({});
  const [mobileFilters, setMobileFilters] = useState(false);

  const activeCat = categories.find((c) => c.slug === activeCategory) ?? null;
  const parentCat = activeCat?.parent_id ? categories.find((c) => c.id === activeCat.parent_id) : null;
  const subcats = activeCat
    ? categories.filter((c) => c.parent_id === activeCat.id)
    : categories.filter((c) => !c.parent_id);
  const heading = activeCat?.name ?? (initialQuery ? `Hledání: „${initialQuery}"` : "Všechny produkty");

  const brands = useMemo(() => {
    const counts = new Map<string, number>();
    items.forEach((p) => { if (p.brand) counts.set(p.brand, (counts.get(p.brand) ?? 0) + 1); });
    return Array.from(counts.entries()).sort((a, b) => a[0].localeCompare(b[0], "cs"));
  }, [items]);

  const filtered = useMemo(() => {
    let list = [...items];
    if (initialQuery) {
      const q = initialQuery.toLowerCase();
      list = list.filter((p) => p.title.toLowerCase().includes(q) || (p.brand ?? "").toLowerCase().includes(q));
    }
    if (stockFilters.online) list = list.filter((p) => p.stock_total > 0);
    if (stockFilters.store) list = list.filter((p) => p.stock_total > 3);
    if (brandFilters.size > 0) list = list.filter((p) => p.brand && brandFilters.has(p.brand));
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
  }, [items, sort, stockFilters, brandFilters, priceRange, initialQuery]);

  // Nejprodávanější: featured → sleva → sklad
  const bestsellers = useMemo(() => {
    const pool = [...items].sort((a, b) => {
      const fa = (a.is_featured ? 2 : 0) + (discountPct(a.price_min_cents, a.compare_at_max_cents) ? 1 : 0);
      const fb = (b.is_featured ? 2 : 0) + (discountPct(b.price_min_cents, b.compare_at_max_cents) ? 1 : 0);
      return fb - fa || b.stock_total - a.stock_total;
    });
    return pool.slice(0, 6);
  }, [items]);

  const rankColors = ["#ffc233", "#94a3b8", RED, "#94a3b8", "#94a3b8", "#94a3b8"];
  const [bestsellersOpen, setBestsellersOpen] = useState(false);
  const visible = filtered;
  const catParam = activeCategory ? `kategorie=${activeCategory}&` : "";
  const pageHref = (n: number) => `${basePath}?${catParam}${initialQuery ? `q=${encodeURIComponent(initialQuery)}&` : ""}strana=${n}`;
  const filteredBrands = brands.filter(([b]) => b.toLowerCase().includes(brandSearch.toLowerCase()));

  const toggleParam = (slug: string, value: string) => {
    setParamFilters((prev) => {
      const next = { ...prev };
      const set = new Set(next[slug] ?? []);
      if (set.has(value)) set.delete(value); else set.add(value);
      if (set.size) next[slug] = set; else delete next[slug];
      return next;
    });
  };

  const sidebar = (
    <div className="space-y-5">
      <SideBlock title="Skladovost">
        <CheckRow label="Skladem" checked={stockFilters.online} onChange={() => setStockFilters(s => ({ ...s, online: !s.online }))} />
        <CheckRow label="Skladem u dodavatele" checked={stockFilters.supplier} onChange={() => setStockFilters(s => ({ ...s, supplier: !s.supplier }))} />
        <CheckRow label="Skladem v prodejně: Praha" checked={stockFilters.store} onChange={() => setStockFilters(s => ({ ...s, store: !s.store }))} />
      </SideBlock>

      {brands.length > 0 && (
        <SideBlock title="Značky">
          <div className="relative mb-2">
            <input
              type="text" placeholder="Vyhledejte psaním" value={brandSearch}
              onChange={(e) => setBrandSearch(e.target.value)}
              className="h-9 w-full rounded border px-3 pr-8 text-[13px] font-medium outline-none"
              style={{ borderColor: BORDER, background: "#fff" }}
            />
            <svg className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={MUTED} strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          </div>
          <div className="max-h-56 space-y-0 overflow-y-auto pr-1">
            {filteredBrands.map(([b, count]) => (
              <CheckRow key={b} label={b} count={count} checked={brandFilters.has(b)}
                onChange={() => setBrandFilters((prev) => { const n = new Set(prev); if (n.has(b)) n.delete(b); else n.add(b); return n; })} />
            ))}
          </div>
        </SideBlock>
      )}

      <SideBlock title="Cena">
        {items.length > 0 && (
          <p className="mb-2 text-[12px] font-semibold" style={{ color: MUTED }}>
            {czk(Math.min(...items.map(i => i.price_min_cents)), currency)} – {czk(Math.max(...items.map(i => i.price_min_cents)), currency)}
          </p>
        )}
        <div className="flex items-center gap-2">
          {(["Od", "Do"] as const).map((ph, i) => (
            <div key={ph} className="relative flex-1">
              <input
                type="number" placeholder={ph} min={0}
                value={priceRange[i] || ""}
                onChange={(e) => setPriceRange(i === 0
                  ? [parseInt(e.target.value) || 0, priceRange[1]]
                  : [priceRange[0], parseInt(e.target.value) || 0])}
                className="h-10 w-full rounded border px-3 pr-8 text-[13px] font-semibold outline-none"
                style={{ borderColor: BORDER }}
              />
              <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[11px]" style={{ color: MUTED }}>Kč</span>
            </div>
          ))}
        </div>
      </SideBlock>

      {filterableParams.map((fp) => (
        <SideBlock key={fp.id} title={fp.name}>
          <div className="max-h-48 overflow-y-auto pr-1">
            {fp.values.map((v) => (
              <CheckRow key={v} label={fp.unit ? `${v} ${fp.unit}` : v}
                checked={paramFilters[fp.slug]?.has(v) ?? false}
                onChange={() => toggleParam(fp.slug, v)} />
            ))}
          </div>
        </SideBlock>
      ))}

      <div className="space-y-2 pt-1">
        <div className="flex items-center gap-2 rounded-lg px-3 py-2.5" style={{ background: SURFACE }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={GREEN} strokeWidth="2.2" strokeLinecap="round"><path d="M5 12l5 5L20 7"/></svg>
          <span className="text-[12.5px] font-extrabold leading-tight" style={{ color: NAVY }}>95 % zákazníků<br/>nás doporučuje</span>
        </div>
        <Link href={`${basePath}?kategorie=vyprodej`} className="block text-[13.5px] font-bold underline underline-offset-2" style={{ color: NAVY }}>Akce a slevy</Link>
        <Link href={`${basePath}?kategorie=ii-jakost`} className="block text-[13.5px] font-bold underline underline-offset-2" style={{ color: NAVY }}>II. jakost</Link>
      </div>
    </div>
  );

  return (
    <div className="es05l" style={{ fontFamily: "'Nunito Sans','Segoe UI',Arial,sans-serif" }}>
      <style>{`
        .es05l h1, .es05l h2, .es05l h3 { font-family: 'Nunito Sans','Segoe UI',Arial,sans-serif !important; }
        .es05l-subcat { transition: background 0.15s, box-shadow 0.15s; }
        .es05l-subcat:hover { background: #eaedf1 !important; }
        .es05l-card { text-decoration: none; }
        .es05l-select { appearance: none; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='11' height='11' viewBox='0 0 12 12'%3E%3Cpath d='M2 4l4 4 4-4' stroke='%230e1b2c' stroke-width='2' fill='none' stroke-linecap='round'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 12px center; }
      `}</style>

      {/* Breadcrumb + H1 */}
      <nav className="mb-2 flex flex-wrap items-center gap-y-1 text-[13px]" style={{ color: MUTED }}>
        <Link href={basePath} className="underline underline-offset-2 hover:no-underline" style={{ color: "#33445c" }}>Úvodní strana</Link>
        {parentCat && (
          <>
            <span className="mx-2" style={{ color: "#cbd5e1" }}>/</span>
            <Link href={`${basePath}?kategorie=${parentCat.slug}`} className="underline underline-offset-2 hover:no-underline" style={{ color: "#33445c" }}>{parentCat.name}</Link>
          </>
        )}
      </nav>
      <h1 className="text-[32px] font-black tracking-tight" style={{ color: NAVY }}>{heading}</h1>

      {/* Subcategory tiles */}
      {subcats.length > 0 && (
        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {subcats.map((sc) => (
            <Link key={sc.id} href={`${basePath}?kategorie=${sc.slug}`}
              className="es05l-subcat flex items-center gap-4 rounded-lg px-4 py-3.5"
              style={{ background: SURFACE, textDecoration: "none" }}>
              {sc.image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={sc.image_url} alt="" className="h-12 w-14 rounded object-cover" loading="lazy" />
              ) : (
                <span className="flex h-12 w-14 items-center justify-center rounded text-[16px] font-black" style={{ background: "#e2e6eb", color: MUTED }}>{sc.name.charAt(0)}</span>
              )}
              <span className="text-[15px] font-extrabold" style={{ color: NAVY }}>{sc.name}</span>
            </Link>
          ))}
        </div>
      )}

      {/* Nejprodávanější */}
      {bestsellers.length >= 3 && (
        <section className="mt-9">
          <h2 className="text-[22px] font-black" style={{ color: NAVY }}>Nejprodávanější</h2>
          <div className="mt-4 grid grid-cols-1 gap-6 md:grid-cols-3">
            {bestsellers.slice(0, bestsellersOpen ? 6 : 3).map((p, i) => {
              const pct = discountPct(p.price_min_cents, p.compare_at_max_cents);
              return (
                <Link key={p.id} href={`${basePath}/${p.slug}`} className="group flex items-center gap-4 border-l pl-5 first:border-l-0 first:pl-0" style={{ borderColor: BORDER, textDecoration: "none" }}>
                  <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-[13px] font-black text-white" style={{ background: rankColors[i] }}>{i + 1}</span>
                  <span className="h-[74px] w-[74px] flex-shrink-0 overflow-hidden rounded" style={{ background: "#f5f6f8" }}>
                    {p.image_url && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.image_url} alt="" className="h-full w-full object-cover" loading="lazy" />
                    )}
                  </span>
                  <span className="min-w-0">
                    <span className="line-clamp-2 text-[13.5px] font-bold leading-snug group-hover:underline" style={{ color: NAVY, textUnderlineOffset: 3 }}>{p.title}</span>
                    <span className="mt-0.5 flex items-center gap-1.5 text-[11.5px] font-bold" style={{ color: GREEN }}>
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="M5 12l5 5L20 7"/></svg>
                      Skladem online
                    </span>
                    <span className="mt-0.5 flex items-baseline gap-2">
                      {pct !== null && <span className="rounded px-1.5 py-0.5 text-[10.5px] font-extrabold text-white" style={{ background: RED }}>−{pct}%</span>}
                      <span className="text-[16px] font-extrabold tabular-nums" style={{ color: RED }}>{czk(p.price_min_cents, currency)}</span>
                      {p.compare_at_max_cents && pct !== null && (
                        <span className="text-[11.5px] line-through" style={{ color: MUTED }}>{czk(p.compare_at_max_cents, currency)}</span>
                      )}
                    </span>
                  </span>
                </Link>
              );
            })}
          </div>
          {bestsellers.length > 3 && (
            <div className="mt-5 flex justify-center">
              <button onClick={() => setBestsellersOpen(o => !o)}
                className="flex items-center gap-2 rounded px-5 py-2.5 text-[13.5px] font-extrabold transition hover:opacity-80"
                style={{ background: SURFACE, color: NAVY }}>
                {bestsellersOpen ? "Méně nejprodávanějších" : "Další nejprodávanější"}
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ transform: bestsellersOpen ? "rotate(180deg)" : "none" }}><path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
              </button>
            </div>
          )}
        </section>
      )}

      {/* Toolbar */}
      <div className="mt-9 flex flex-wrap items-center justify-between gap-3 border-y py-3" style={{ borderColor: BORDER }}>
        <button onClick={() => setMobileFilters(true)} className="flex items-center gap-2 rounded border px-4 py-2 text-[13.5px] font-bold lg:hidden" style={{ borderColor: BORDER, color: NAVY }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 6h16M7 12h10M10 18h4"/></svg>
          Filtry
        </button>
        <div className="ml-auto flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-[13.5px] font-bold" style={{ color: NAVY }}>
            Seřadit {filtered.length} produktů
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={MUTED} strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 8h.01M11 12h1v4h1"/></svg>
          </span>
          <select value={sort} onChange={(e) => setSort(e.target.value)}
            className="es05l-select h-10 rounded border px-3 pr-9 text-[13.5px] font-bold outline-none"
            style={{ borderColor: BORDER, color: NAVY, background: "#fff" }}>
            <option value="featured">Doporučujeme</option>
            <option value="price-asc">Od nejlevnějšího</option>
            <option value="price-desc">Od nejdražšího</option>
            <option value="discount">Největší sleva</option>
            <option value="name">Podle názvu</option>
          </select>
          <span className="hidden items-center gap-1 text-[13px] font-semibold sm:flex" style={{ color: MUTED }}>
            <Link href={pageHref(Math.max(1, page - 1))} aria-disabled={page <= 1}
              className={`flex h-9 w-9 items-center justify-center rounded border ${page <= 1 ? "pointer-events-none opacity-40" : ""}`}
              style={{ borderColor: BORDER, color: NAVY }} aria-label="Předchozí">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M15 6l-6 6 6 6"/></svg>
            </Link>
            <span className="px-2">{page} z {Math.max(1, pages)}</span>
            <Link href={pageHref(Math.min(pages, page + 1))} aria-disabled={page >= pages}
              className={`flex h-9 w-9 items-center justify-center rounded border ${page >= pages ? "pointer-events-none opacity-40" : ""}`}
              style={{ borderColor: BORDER, color: NAVY }} aria-label="Další">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M9 6l6 6-6 6"/></svg>
            </Link>
          </span>
        </div>
      </div>

      {/* Sidebar + grid */}
      <div className="mt-6 grid gap-8 lg:grid-cols-[250px_minmax(0,1fr)]">
        <aside className="hidden lg:block">{sidebar}</aside>

        <div>
          {visible.length === 0 ? (
            <div className="rounded-lg border border-dashed px-6 py-16 text-center text-[14px]" style={{ borderColor: BORDER, color: MUTED }}>
              Žádné produkty neodpovídají zvoleným filtrům.
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-x-5 gap-y-9 sm:grid-cols-3 xl:grid-cols-4">
              {visible.map((p) => <Eshop05Card key={p.id} p={p} basePath={basePath} currency={currency} />)}
            </div>
          )}

          {pages > 1 && (
            <div className="mt-10 flex flex-col items-center gap-4">
              {page < pages && (
                <Link href={pageHref(page + 1)}
                  className="rounded px-7 py-3 text-[14px] font-extrabold text-white transition hover:opacity-90"
                  style={{ background: NAVY }}>
                  Zobrazit další produkty
                </Link>
              )}
              <div className="flex items-center gap-1.5 text-[13.5px] font-bold" style={{ color: MUTED }}>
                {Array.from({ length: Math.min(6, pages) }, (_, i) => (
                  <Link key={i} href={pageHref(i + 1)}
                    className="flex h-8 w-8 items-center justify-center rounded"
                    style={i + 1 === page ? { background: SURFACE, color: NAVY } : undefined}>
                    {i + 1}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* SEO text */}
          {activeCat?.description && (
            <p className="mt-12 text-[13.5px] leading-relaxed" style={{ color: MUTED }}>{activeCat.description}</p>
          )}
        </div>
      </div>

      {/* Mobile filters drawer */}
      {mobileFilters && (
        <div className="fixed inset-0 z-[120] lg:hidden" style={{ background: "rgba(14,27,44,0.5)" }} onClick={() => setMobileFilters(false)}>
          <div className="absolute inset-y-0 left-0 w-[300px] overflow-y-auto bg-white p-5" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between">
              <span className="text-[16px] font-black" style={{ color: NAVY }}>Filtry</span>
              <button onClick={() => setMobileFilters(false)} aria-label="Zavřít" style={{ color: NAVY }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
              </button>
            </div>
            {sidebar}
          </div>
        </div>
      )}
    </div>
  );
}
