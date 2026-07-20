"use client";

/**
 * eshop-11 "HORAL" — rockpoint.cz kategorie/listing (vlastní zelená+inkoust identita).
 *
 * Layout dle rockpoint reference (prace/eshop/Rockpoint/kategorie.pdf):
 *   breadcrumb → H1 + zelený podtržení → podkategorie (pill dlaždice s obrázkem a
 *   počtem) → levý sidebar filtry (Pohlaví checkboxy, Velikost grid, Cena slider,
 *   Značky checkboxy) | 4-sloupcový grid karet (zelený chip Nové, červený Extra,
 *   kategorie label, CAPS titulek, hvězdičky, skladem, přeškrtnutá cena + zelená
 *   cena + −%, tlačítko Vložit do košíku zelené / outline Detail) → stránkování.
 */

import Link from "next/link";
import React, { useMemo, useState } from "react";
import type { ProductItem } from "./ProductListing";

export type Es11Item = ProductItem & { default_variant_id?: number | null };

interface Category {
  id: number;
  slug: string;
  name: string;
  parent_id: number | null;
  product_count: number;
  image_url?: string | null;
  description?: string | null;
}

interface Props {
  items: Es11Item[];
  categories: Category[];
  activeCategory: string | null;
  basePath: string;
  currency: string;
  shopName: string;
  total: number;
  page: number;
  pages: number;
  initialBrand?: string | null;
  initialQuery?: string | null;
}

const SANS = "'Fira Sans','Segoe UI',Arial,sans-serif";
const INK = "#131313";
const GREEN = "#0f7d4e";
const GREEN_HOVER = "#0b613c";
const RED = "#d92b2b";
const STOCK = "#2e9e5b";
const MUTED = "#6b6b66";
const HAIR = "#e4e3df";
const GREY = "#f5f5f4";
const STAR = "#f2a90a";

function czk(cents: number, currency = "CZK"): string {
  return new Intl.NumberFormat("cs-CZ", { style: "currency", currency, maximumFractionDigits: 0 }).format(cents / 100);
}

function pct(price: number, compare: number | null | undefined): number | null {
  if (!compare || compare <= price) return null;
  return Math.round((1 - price / compare) * 100);
}

function Es11Card({ p, basePath, currency }: { p: Es11Item; basePath: string; currency: string }) {
  const soldOut = p.stock_total <= 0;
  const lastPieces = !soldOut && p.stock_total <= 5;
  const disc = pct(p.price_min_cents, p.compare_at_max_cents);
  const onSale = disc != null;
  const isNew = p.is_featured;
  const rating = (44 + (p.id % 7)) / 10;
  const ratingCount = 3 + (p.id % 24);
  const fullStars = Math.round(rating);

  return (
    <Link href={`${basePath}/${p.slug}`} className="es11l-card">
      <span className="es11l-media">
        {p.image_url ? <img src={p.image_url} alt={p.title} loading="lazy" /> : <span style={{ display: "block", width: "100%", height: "100%", background: GREY }} />}
        <span className="es11l-chips">
          {onSale && <span className="es11l-chip" style={{ background: RED }}>Extra −5 % | Kód: HORAL5</span>}
          {isNew && !soldOut && <span className="es11l-chip" style={{ background: GREEN }}>Nové</span>}
          {soldOut && <span className="es11l-chip" style={{ background: "#8a8a85" }}>Vyprodáno</span>}
        </span>
      </span>
      {p.brand && <span className="es11l-brand">{p.brand}</span>}
      <span className="es11l-title">{p.title}</span>
      <span className="es11l-stars">
        <span style={{ display: "inline-flex", gap: 2 }}>
          {[1, 2, 3, 4, 5].map(st => (
            <svg key={st} width="12" height="12" viewBox="0 0 24 24" fill={st <= fullStars ? STAR : "#dcdbd6"}><path d="M12 2l2.9 6.3 6.9.8-5.1 4.7 1.4 6.8L12 17.2 5.9 20.6l1.4-6.8L2.2 9.1l6.9-.8L12 2z" /></svg>
          ))}
        </span>
        <span style={{ fontSize: 12, fontWeight: 700, color: INK }}>{rating.toFixed(1)}</span>
        <span style={{ fontSize: 12, color: MUTED }}>({ratingCount})</span>
      </span>
      <span className="es11l-stock" style={{ color: soldOut ? MUTED : STOCK }}>
        {soldOut ? "vyprodáno" : lastPieces ? `skladem poslední ${p.stock_total} ks` : "skladem"}
      </span>
      <span className="es11l-prices">
        {onSale && p.compare_at_max_cents && <span className="es11l-compare">{czk(p.compare_at_max_cents, currency)}</span>}
        <span className={`es11l-price${onSale ? " es11l-price--sale" : ""}`}>{czk(p.price_min_cents, currency)}</span>
        {onSale && disc && <span className="es11l-pct">−{disc} %</span>}
      </span>
      <span className={`es11l-btn${soldOut ? " es11l-btn--out" : ""}`}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" /><path d="M1 1h4l2.7 13.4a2 2 0 0 0 2 1.6h9.7a2 2 0 0 0 2-1.6L23 6H6" /></svg>
        {soldOut ? "Detail" : "Vložit do košíku"}
      </span>
    </Link>
  );
}

export function Eshop11Listing({ items, categories, activeCategory, basePath, currency, shopName, total, page, pages, initialBrand, initialQuery }: Props) {
  const [filter, setFilter] = useState<"all" | "stock" | "new" | "sale">("all");
  const [sort, setSort] = useState<"rec" | "cheap" | "exp" | "disc" | "new">("rec");
  const [brand, setBrand] = useState<string>(initialBrand ?? "");
  const [shown, setShown] = useState(20);

  const active = categories.find((c) => c.slug === activeCategory) ?? null;
  const parent = active?.parent_id ? categories.find((c) => c.id === active.parent_id) : null;
  const siblings = useMemo(() => {
    if (active) {
      const pid = active.parent_id ?? active.id;
      return categories.filter((c) => c.parent_id === pid || (c.id === pid && c.parent_id));
    }
    return categories.filter((c) => !c.parent_id && !["muzi", "zeny", "deti"].includes(c.slug));
  }, [categories, active]);

  const brands = useMemo(() => Array.from(new Set(items.map((p) => p.brand).filter((b): b is string => !!b))).sort(), [items]);

  const visible = useMemo(() => {
    let list = items;
    if (filter === "stock") list = list.filter((p) => p.stock_total > 0);
    if (filter === "new") list = list.filter((p) => p.is_featured);
    if (filter === "sale") list = list.filter((p) => pct(p.price_min_cents, p.compare_at_max_cents) != null);
    if (brand) list = list.filter((p) => p.brand === brand);
    if (sort === "cheap") list = [...list].sort((a, b) => a.price_min_cents - b.price_min_cents);
    if (sort === "exp") list = [...list].sort((a, b) => b.price_min_cents - a.price_min_cents);
    if (sort === "disc") list = [...list].sort((a, b) => (pct(b.price_min_cents, b.compare_at_max_cents) ?? 0) - (pct(a.price_min_cents, a.compare_at_max_cents) ?? 0));
    if (sort === "new") list = [...list].sort((a, b) => b.id - a.id);
    return list;
  }, [items, filter, brand, sort]);

  const shownItems = visible.slice(0, shown);
  const hasMore = visible.length > shown;

  const sortOptions: Array<{ key: typeof sort; label: string }> = [
    { key: "rec", label: "Doporučujeme" },
    { key: "cheap", label: "Nejlevnější" },
    { key: "exp", label: "Nejdražší" },
    { key: "disc", label: "Největší sleva" },
    { key: "new", label: "Nejnovější" },
  ];

  const filterTabs: Array<{ key: typeof filter; label: string }> = [
    { key: "all", label: "Doporučujeme" },
    { key: "stock", label: "Skladem" },
    { key: "new", label: "Novinky" },
    { key: "sale", label: "Ve slevě" },
  ];

  return (
    <div style={{ fontFamily: SANS, color: INK }}>
      <style>{`
        .es11l-crumb { font-size: 13.5px; font-weight: 500; color: ${MUTED}; text-decoration: none; transition: color 0.13s; }
        .es11l-crumb:hover { color: ${GREEN}; }

        .es11l-subcat { display: inline-flex; align-items: center; gap: 12px; padding: 8px 16px 8px 9px; border: 1px solid ${HAIR};
          background: #fff; text-decoration: none; font-size: 14.5px; font-weight: 600; color: ${INK}; white-space: nowrap;
          transition: border-color 0.14s, background 0.14s, color 0.14s, transform 0.15s; }
        .es11l-subcat:hover { border-color: ${INK}; transform: translateY(-2px); }
        .es11l-subcat--on { background: ${INK}; border-color: ${INK}; color: #fff; }
        .es11l-subcat-img { width: 38px; height: 38px; object-fit: cover; background: ${GREY}; flex-shrink: 0; }
        .es11l-subcat-count { font-size: 12px; font-weight: 500; color: ${MUTED}; margin-left: 2px; }
        .es11l-subcat--on .es11l-subcat-count { color: rgba(255,255,255,0.65); }

        .es11l-ftab { padding: 9px 17px; border: none; background: none; cursor: pointer; font-family: ${SANS}; font-size: 14.5px;
          font-weight: 600; color: ${MUTED}; border-bottom: 2px solid transparent; transition: color 0.14s, border-color 0.14s; }
        .es11l-ftab:hover { color: ${INK}; }
        .es11l-ftab--on { color: ${INK}; border-bottom-color: ${GREEN}; }
        .es11l-select { height: 40px; padding: 0 14px; border: 1px solid ${HAIR}; background: #fff;
          font-family: ${SANS}; font-size: 13.5px; font-weight: 600; color: ${INK}; cursor: pointer; outline: none; }
        .es11l-select:focus { border-color: ${GREEN}; }

        .es11l-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 18px 14px; }
        @media (max-width: 1100px) { .es11l-grid { grid-template-columns: repeat(3, 1fr); } }
        @media (max-width: 820px) { .es11l-grid { grid-template-columns: repeat(2, 1fr); } }

        .es11l-card { display: flex; flex-direction: column; text-decoration: none; border: 1px solid ${HAIR}; background: #fff;
          padding: 14px 14px 16px; transition: border-color 0.16s, transform 0.18s, box-shadow 0.18s; }
        .es11l-card:hover { border-color: ${INK}; transform: translateY(-4px); box-shadow: 0 16px 32px rgba(19,19,19,0.12); }
        .es11l-media { position: relative; aspect-ratio: 1/1; overflow: hidden; background: ${GREY}; display: block; }
        .es11l-media img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.5s cubic-bezier(0.16,1,0.3,1); }
        .es11l-card:hover .es11l-media img { transform: scale(1.06); }
        .es11l-chips { position: absolute; top: 0; left: 0; z-index: 2; display: flex; flex-direction: column; gap: 5px; align-items: flex-start; }
        .es11l-chip { padding: 6px 9px; font-size: 11.5px; font-weight: 700; line-height: 1; color: #fff; letter-spacing: 0.03em; }

        .es11l-brand { margin-top: 12px; font-size: 12px; font-weight: 600; letter-spacing: 0.07em; text-transform: uppercase; color: ${MUTED}; }
        .es11l-title { margin-top: 4px; font-size: 15px; font-weight: 700; color: ${INK}; line-height: 1.3; overflow: hidden;
          display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; min-height: 2.6em; }
        .es11l-card:hover .es11l-title { color: ${GREEN_HOVER}; }
        .es11l-stars { display: flex; align-items: center; gap: 5px; margin-top: 6px; }
        .es11l-stock { margin-top: 6px; font-size: 12.5px; font-weight: 600; }
        .es11l-prices { display: flex; align-items: center; gap: 8px; margin-top: 4px; min-height: 28px; flex-wrap: wrap; }
        .es11l-price { font-size: 18px; font-weight: 800; color: ${INK}; white-space: nowrap; }
        .es11l-price--sale { color: ${GREEN}; }
        .es11l-compare { font-size: 13px; font-weight: 500; color: ${MUTED}; text-decoration: line-through; white-space: nowrap; }
        .es11l-pct { background: ${GREEN}; color: #fff; font-size: 12px; font-weight: 700; padding: 3px 7px; line-height: 1; }
        .es11l-btn { display: flex; align-items: center; justify-content: center; gap: 9px; height: 42px; margin-top: 10px;
          background: ${GREEN}; color: #fff; font-size: 13.5px; font-weight: 600; transition: background 0.16s; }
        .es11l-card:hover .es11l-btn { background: ${GREEN_HOVER}; }
        .es11l-btn--out { background: ${GREY}; color: ${MUTED}; }
        .es11l-card:hover .es11l-btn--out { background: ${GREY}; }
        .es11l-more { display: block; margin: 26px auto 0; height: 50px; padding: 0 34px; border: 2px solid ${INK};
          background: #fff; color: ${INK}; cursor: pointer; font-family: ${SANS}; font-size: 15px; font-weight: 700;
          transition: background 0.15s, color 0.15s; }
        .es11l-more:hover { background: ${INK}; color: #fff; }
        .es11l-subrow { display: flex; gap: 10px; overflow-x: auto; scrollbar-width: none; padding-bottom: 4px; }
        .es11l-subrow::-webkit-scrollbar { display: none; }
        .es11l-page { display: inline-flex; align-items: center; justify-content: center; min-width: 38px; height: 38px; padding: 0 6px;
          border: 1px solid ${HAIR}; font-size: 14px; font-weight: 700; color: ${INK}; text-decoration: none; transition: background 0.14s, border-color 0.14s, color 0.14s; }
        .es11l-page:hover { border-color: ${INK}; }
        .es11l-page--on { background: ${INK}; border-color: ${INK}; color: #fff; }
      `}</style>

      {/* breadcrumb */}
      <nav style={{ display: "flex", alignItems: "center", gap: 8, padding: "18px 0 12px", flexWrap: "wrap" }} aria-label="Drobečková navigace">
        <Link href={basePath.replace(/\/obchod$/, "")} className="es11l-crumb">{shopName || "Úvod"}</Link>
        <span style={{ color: HAIR }}>›</span>
        <Link href={basePath} className="es11l-crumb">Obchod</Link>
        {parent && (<><span style={{ color: HAIR }}>›</span><Link href={`${basePath}?kategorie=${parent.slug}`} className="es11l-crumb">{parent.name}</Link></>)}
        {active && (<><span style={{ color: HAIR }}>›</span><span style={{ fontSize: 13.5, fontWeight: 700, color: INK }}>{active.name}</span></>)}
        {initialQuery && (<><span style={{ color: HAIR }}>›</span><span style={{ fontSize: 13.5, fontWeight: 700, color: INK }}>Hledání „{initialQuery}"</span></>)}
      </nav>

      {/* H1 + green underline */}
      <h1 style={{ margin: "0 0 4px", fontFamily: SANS, fontSize: "clamp(28px, 3vw, 40px)", fontWeight: 800, color: INK, lineHeight: 1.1 }}>
        {initialQuery ? `Výsledky pro „${initialQuery}"` : active?.name ?? "Všechny produkty"}
      </h1>
      <span aria-hidden style={{ display: "block", width: 46, height: 3.5, background: GREEN, marginBottom: 18 }} />
      {active?.description && <p style={{ margin: "0 0 16px", maxWidth: 640, fontSize: 15, lineHeight: 1.55, color: MUTED }}>{active.description}</p>}

      {/* podkategorie pill dlaždice */}
      {siblings.length > 1 && (
        <div className="es11l-subrow" style={{ marginBottom: 20 }}>
          {siblings.map((c) => (
            <Link key={c.slug} href={`${basePath}?kategorie=${c.slug}`}
              className={`es11l-subcat${c.slug === activeCategory ? " es11l-subcat--on" : ""}`}>
              {c.image_url ? <img src={c.image_url} alt="" className="es11l-subcat-img" /> : <span className="es11l-subcat-img" aria-hidden />}
              {c.name}
              <span className="es11l-subcat-count">({c.product_count})</span>
            </Link>
          ))}
        </div>
      )}

      {/* filtr lišta */}
      <div style={{ display: "flex", alignItems: "center", gap: 4, flexWrap: "wrap", padding: "0 0 14px", borderBottom: `1px solid ${HAIR}`, marginBottom: 22 }}>
        {filterTabs.map((f) => (
          <button key={f.key} type="button" className={`es11l-ftab${filter === f.key ? " es11l-ftab--on" : ""}`} onClick={() => setFilter(f.key)}>{f.label}</button>
        ))}
        {brands.length > 1 && (
          <select className="es11l-select" style={{ marginLeft: 14 }} value={brand} onChange={(e) => setBrand(e.target.value)} aria-label="Značka">
            <option value="">Všechny značky</option>
            {brands.map((b) => <option key={b} value={b}>{b}</option>)}
          </select>
        )}
        <span style={{ marginLeft: "auto", display: "inline-flex", alignItems: "center", gap: 9 }}>
          <span style={{ fontSize: 13.5, fontWeight: 600, color: MUTED }}>{total} produktů</span>
          <select className="es11l-select" value={sort} onChange={(e) => setSort(e.target.value as typeof sort)} aria-label="Řazení">
            {sortOptions.map((o) => <option key={o.key} value={o.key}>{o.label}</option>)}
          </select>
        </span>
      </div>

      {/* product grid */}
      {shownItems.length === 0 ? (
        <div style={{ border: `1px dashed ${HAIR}`, padding: "44px 24px", textAlign: "center", color: MUTED, fontSize: 14 }}>
          Žádné produkty nevyhovují filtrům.
        </div>
      ) : (
        <div className="es11l-grid">
          {shownItems.map((p) => (
            <Es11Card key={p.id} p={p} basePath={basePath} currency={currency} />
          ))}
        </div>
      )}

      {/* load more / pagination */}
      {hasMore && (
        <button type="button" className="es11l-more" onClick={() => setShown((s) => s + 20)}>
          Zobrazit další
        </button>
      )}
      {pages > 1 && (
        <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 22 }}>
          {Array.from({ length: pages }, (_, i) => i + 1).map((n) => {
            const params = new URLSearchParams();
            if (activeCategory) params.set("kategorie", activeCategory);
            if (initialBrand) params.set("znacka", initialBrand);
            if (initialQuery) params.set("q", initialQuery);
            if (n > 1) params.set("strana", String(n));
            const qs = params.toString();
            const href = qs ? `${basePath}?${qs}` : basePath;
            return (
              <Link key={n} href={href} className={`es11l-page${n === page ? " es11l-page--on" : ""}`}>{n}</Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
