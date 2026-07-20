"use client";

/**
 * eshop-10 "BOTIQ" — footshop.cz kategorie/listing (vlastní black/volt identita).
 *
 * Layout dle předlohy (prace/eshop/Footshop/kategorie.pdf):
 *   breadcrumb → H1 + počet produktů → pill dlaždice podkategorií (foto + label,
 *   aktivní černá) → filtr lišta (pills Vše | Skladem | Novinky | Ve slevě +
 *   značka select + řazení select) → 4sloupcový grid footshop karet (srdíčko,
 *   stack badge −% + EXTRA, NOVINKA, brand condensed, cena sale červeně,
 *   tagline) s volt PROMO dlaždicí uvnitř gridu → stránkování + UKÁZAT DALŠÍ.
 */

import Link from "next/link";
import React, { useMemo, useState } from "react";
import type { ProductItem } from "./ProductListing";

export type Es10Item = ProductItem & { default_variant_id?: number | null };

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
  items: Es10Item[];
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

const COND = "'Barlow Condensed','Arial Narrow',Arial,sans-serif";
const SANS = "'Barlow','Segoe UI',Arial,sans-serif";
const BLACK = "#0a0a0b";
const VOLT = "#c8f53c";
const ON_VOLT = "#111603";
const VOLT_DEEP = "#6d9204";
const VIOLET = "#7a5cff";
const SALE_INK = "#e8402c";
const INK = "#121212";
const MUTED = "#6f6f6f";
const BORDER = "#e6e6e4";
const SURFACE = "#f4f4f3";

function czk(cents: number, currency = "CZK"): string {
  return new Intl.NumberFormat("cs-CZ", { style: "currency", currency, maximumFractionDigits: 0 }).format(cents / 100);
}

function discountPct(price: number, compare: number | null | undefined): number | null {
  if (!compare || compare <= price) return null;
  return Math.round((1 - price / compare) * 100);
}

function Es10Card({ p, basePath, currency, wished, onWish }: { p: Es10Item; basePath: string; currency: string; wished: boolean; onWish: () => void }) {
  const soldOut = p.stock_total <= 0;
  const lastPieces = !soldOut && p.stock_total <= 5;
  const pct = discountPct(p.price_min_cents, p.compare_at_max_cents);
  const onSale = pct != null;

  return (
    <Link href={`${basePath}/${p.slug}`} className="es10l-card">
      <span className="es10l-media">
        {p.image_url ? <img src={p.image_url} alt={p.title} loading="lazy" /> : <span style={{ display: "block", width: "100%", height: "100%", background: SURFACE }} />}
        <span className="es10l-badges">
          {onSale && <span className="es10l-sale">−{pct} %</span>}
          {onSale && <span className="es10l-extra">Extra −5 %</span>}
          {!onSale && p.is_featured && <span className="es10l-new">Novinka</span>}
        </span>
        <button type="button" aria-label={wished ? "Odebrat z oblíbených" : "Přidat do oblíbených"}
          className={`es10l-wish${wished ? " es10l-wish--on" : ""}`}
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); onWish(); }}>
          <svg width="17" height="17" viewBox="0 0 24 24" fill={wished ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20.5S3.5 15.6 3.5 9.7a4.7 4.7 0 0 1 8.5-2.8A4.7 4.7 0 0 1 20.5 9.7c0 5.9-8.5 10.8-8.5 10.8z"/></svg>
        </button>
      </span>
      <span className="es10l-underline" />
      {p.brand && <span className="es10l-brand">{p.brand}</span>}
      <span className="es10l-title">{p.title}</span>
      <span className="es10l-prices">
        <span className={`es10l-price${onSale ? " es10l-price--sale" : ""}`}>{czk(p.price_min_cents, currency)}</span>
        {onSale && p.compare_at_max_cents && <span className="es10l-compare">{czk(p.compare_at_max_cents, currency)}</span>}
      </span>
      <span className="es10l-tagline" style={{ color: soldOut ? MUTED : lastPieces ? SALE_INK : VOLT_DEEP }}>
        {soldOut ? "Vyprodáno" : lastPieces ? `Poslední ${p.stock_total} ks` : p.is_featured ? "↗ Trending" : "Skladem"}
      </span>
    </Link>
  );
}

export function Eshop10Listing({ items, categories, activeCategory, basePath, currency, shopName, total, page, pages, initialBrand, initialQuery }: Props) {
  const [filter, setFilter] = useState<"all" | "stock" | "new" | "sale">("all");
  const [sort, setSort] = useState<"pop" | "cheap" | "exp" | "disc">("pop");
  const [brand, setBrand] = useState<string>("");
  const [shown, setShown] = useState(12);
  const [wishlist, setWishlist] = useState<Set<number>>(new Set());

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
    if (filter === "sale") list = list.filter((p) => discountPct(p.price_min_cents, p.compare_at_max_cents) != null);
    if (brand) list = list.filter((p) => p.brand === brand);
    if (sort === "cheap") list = [...list].sort((a, b) => a.price_min_cents - b.price_min_cents);
    if (sort === "exp") list = [...list].sort((a, b) => b.price_min_cents - a.price_min_cents);
    if (sort === "disc") list = [...list].sort((a, b) => (discountPct(b.price_min_cents, b.compare_at_max_cents) ?? 0) - (discountPct(a.price_min_cents, a.compare_at_max_cents) ?? 0));
    return list;
  }, [items, filter, brand, sort]);

  const toggleWish = (id: number) => setWishlist((w) => { const n = new Set(w); if (n.has(id)) n.delete(id); else n.add(id); return n; });

  const showPromo = activeCategory !== "vyprodej" && filter !== "sale" && visible.length > 4;
  const shownItems = visible.slice(0, shown);
  const hasMore = visible.length > shown;

  const pageHref = (n: number) => {
    const params = new URLSearchParams();
    if (activeCategory) params.set("kategorie", activeCategory);
    if (initialBrand) params.set("znacka", initialBrand);
    if (initialQuery) params.set("q", initialQuery);
    if (n > 1) params.set("strana", String(n));
    const qs = params.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  };

  const filterPills: Array<{ key: typeof filter; label: string }> = [
    { key: "all", label: "Vše" },
    { key: "stock", label: "Skladem" },
    { key: "new", label: "Novinky" },
    { key: "sale", label: "Ve slevě" },
  ];

  return (
    <div style={{ fontFamily: SANS, color: INK }}>
      <style>{`
        .es10l-crumb { font-size: 13px; font-weight: 500; color: ${MUTED}; text-decoration: none; transition: color 0.13s; }
        .es10l-crumb:hover { color: ${INK}; }

        .es10l-subcat { display: inline-flex; align-items: center; gap: 9px; padding: 6px 15px 6px 7px; border: 1.5px solid ${BORDER};
          border-radius: 2px; background: #fff; text-decoration: none; font-family: ${COND}; font-size: 14.5px; font-weight: 700;
          letter-spacing: 0.06em; text-transform: uppercase; color: ${INK}; white-space: nowrap; transition: border-color 0.14s, background 0.14s, color 0.14s; }
        .es10l-subcat:hover { border-color: ${INK}; }
        .es10l-subcat--on { background: ${BLACK}; border-color: ${BLACK}; color: #fff; }
        .es10l-subcat-img { width: 34px; height: 34px; border-radius: 2px; object-fit: cover; background: ${SURFACE}; flex-shrink: 0; }

        .es10l-pill { padding: 8px 16px; border: 1.5px solid ${BORDER}; border-radius: 2px; background: #fff; cursor: pointer;
          font-family: ${COND}; font-size: 14px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: ${INK};
          transition: background 0.14s, border-color 0.14s, color 0.14s; }
        .es10l-pill:hover { border-color: ${INK}; }
        .es10l-pill--on { background: ${VOLT}; border-color: ${VOLT}; color: ${ON_VOLT}; }
        .es10l-select { height: 38px; padding: 0 12px; border: 1.5px solid ${BORDER}; border-radius: 2px; background: #fff;
          font-family: ${SANS}; font-size: 13.5px; font-weight: 600; color: ${INK}; cursor: pointer; outline: none; }
        .es10l-select:focus { border-color: ${VOLT_DEEP}; }

        .es10l-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 22px 16px; }
        @media (max-width: 1100px) { .es10l-grid { grid-template-columns: repeat(3, 1fr); } }
        @media (max-width: 820px) { .es10l-grid { grid-template-columns: repeat(2, 1fr); } }

        .es10l-card { display: flex; flex-direction: column; text-decoration: none; }
        .es10l-media { position: relative; aspect-ratio: 1/1; border-radius: 2px; overflow: hidden; background: ${SURFACE}; display: block; }
        .es10l-media img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.45s cubic-bezier(0.16,1,0.3,1); }
        .es10l-card:hover .es10l-media img { transform: scale(1.06); }
        .es10l-underline { display: block; height: 2px; background: ${VOLT}; transform: scaleX(0); transform-origin: left; transition: transform 0.25s cubic-bezier(0.16,1,0.3,1); }
        .es10l-card:hover .es10l-underline { transform: scaleX(1); }
        .es10l-badges { position: absolute; top: 10px; left: 10px; z-index: 2; display: flex; flex-direction: column; gap: 5px; align-items: flex-start; }
        .es10l-sale { background: ${SALE_INK}; color: #fff; border-radius: 2px; padding: 5px 9px; font-family: ${COND}; font-size: 14px; font-weight: 800; letter-spacing: 0.04em; line-height: 1; }
        .es10l-extra { background: ${VOLT}; color: ${ON_VOLT}; border-radius: 2px; padding: 4px 8px; font-family: ${COND}; font-size: 12px; font-weight: 800; letter-spacing: 0.06em; text-transform: uppercase; line-height: 1; }
        .es10l-new { background: ${BLACK}; color: ${VOLT}; border-radius: 2px; padding: 5px 9px; font-family: ${COND}; font-size: 12.5px; font-weight: 800; letter-spacing: 0.09em; text-transform: uppercase; line-height: 1; }
        .es10l-wish { position: absolute; top: 8px; right: 8px; z-index: 3; width: 34px; height: 34px; border: none; border-radius: 2px;
          background: rgba(255,255,255,0.92); color: ${INK}; cursor: pointer; display: inline-flex; align-items: center; justify-content: center;
          transition: background 0.14s, color 0.14s, transform 0.14s; }
        .es10l-wish:hover { transform: scale(1.08); }
        .es10l-wish--on { background: ${VOLT}; color: ${ON_VOLT}; }
        .es10l-brand { margin-top: 11px; font-family: ${COND}; font-size: 13px; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: ${MUTED}; }
        .es10l-title { margin-top: 3px; font-size: 14.5px; font-weight: 600; color: ${INK}; line-height: 1.35; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; min-height: 2.7em; }
        .es10l-card:hover .es10l-title { text-decoration: underline; text-underline-offset: 3px; }
        .es10l-prices { display: flex; align-items: baseline; gap: 8px; margin-top: 7px; }
        .es10l-price { font-size: 16.5px; font-weight: 800; color: ${INK}; letter-spacing: -0.01em; }
        .es10l-price--sale { color: ${SALE_INK}; }
        .es10l-compare { font-size: 13px; font-weight: 500; color: ${MUTED}; text-decoration: line-through; }
        .es10l-tagline { margin-top: 5px; font-family: ${COND}; font-size: 13px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; }

        .es10l-promo { position: relative; display: flex; flex-direction: column; align-items: flex-start; justify-content: flex-end;
          border-radius: 2px; background: ${VOLT}; padding: 22px; text-decoration: none; overflow: hidden; aspect-ratio: 1/1; align-self: start; }
        .es10l-promo::after { content: ""; position: absolute; right: -34px; top: -34px; width: 120px; height: 120px; background: ${VIOLET};
          transform: rotate(45deg); opacity: 0.9; }
        .es10l-promo-btn { display: inline-flex; align-items: center; gap: 8px; margin-top: 14px; height: 42px; padding: 0 18px;
          background: ${BLACK}; color: ${VOLT}; border-radius: 2px; font-family: ${COND}; font-size: 14.5px; font-weight: 800;
          letter-spacing: 0.11em; text-transform: uppercase; transition: letter-spacing 0.18s; }
        .es10l-promo:hover .es10l-promo-btn { letter-spacing: 0.15em; }

        .es10l-more { display: block; margin: 26px auto 0; height: 50px; padding: 0 34px; border: 2px solid ${BLACK}; border-radius: 2px;
          background: #fff; color: ${INK}; cursor: pointer; font-family: ${COND}; font-size: 15.5px; font-weight: 800;
          letter-spacing: 0.12em; text-transform: uppercase; transition: background 0.15s, color 0.15s; }
        .es10l-more:hover { background: ${BLACK}; color: ${VOLT}; }
        .es10l-page { display: inline-flex; align-items: center; justify-content: center; min-width: 38px; height: 38px; padding: 0 6px;
          border: 1.5px solid ${BORDER}; border-radius: 2px; font-family: ${COND}; font-size: 14.5px; font-weight: 700; color: ${INK};
          text-decoration: none; transition: background 0.14s, border-color 0.14s, color 0.14s; }
        .es10l-page:hover { border-color: ${INK}; }
        .es10l-page--on { background: ${BLACK}; border-color: ${BLACK}; color: ${VOLT}; }

        .es10l-subrow { display: flex; gap: 10px; overflow-x: auto; scrollbar-width: none; padding-bottom: 4px; }
        .es10l-subrow::-webkit-scrollbar { display: none; }
      `}</style>

      {/* breadcrumb */}
      <nav style={{ display: "flex", alignItems: "center", gap: 8, padding: "18px 0 10px", flexWrap: "wrap" }} aria-label="Drobečková navigace">
        <Link href={basePath.replace(/\/obchod$/, "")} className="es10l-crumb">{shopName || "Domů"}</Link>
        <span style={{ color: BORDER }}>›</span>
        <Link href={basePath} className="es10l-crumb">Obchod</Link>
        {parent && (<><span style={{ color: BORDER }}>›</span><Link href={`${basePath}?kategorie=${parent.slug}`} className="es10l-crumb">{parent.name}</Link></>)}
        {active && (<><span style={{ color: BORDER }}>›</span><span style={{ fontSize: 13, fontWeight: 700, color: INK }}>{active.name}</span></>)}
        {initialQuery && (<><span style={{ color: BORDER }}>›</span><span style={{ fontSize: 13, fontWeight: 700, color: INK }}>Hledání „{initialQuery}"</span></>)}
      </nav>

      {/* H1 + počet */}
      <div style={{ display: "flex", alignItems: "baseline", gap: 14, flexWrap: "wrap", marginBottom: 16 }}>
        <h1 style={{ margin: 0, display: "flex", alignItems: "center", gap: 13, fontFamily: COND, fontSize: "clamp(30px, 3.2vw, 44px)", fontWeight: 800, letterSpacing: "0.04em", textTransform: "uppercase", color: INK, lineHeight: 1 }}>
          <span aria-hidden style={{ width: 11, height: 11, background: VOLT, flexShrink: 0 }} />
          {initialQuery ? `Výsledky pro „${initialQuery}"` : active?.name ?? "Všechny produkty"}
        </h1>
        <span style={{ fontSize: 13.5, fontWeight: 600, color: MUTED }}>Produkty: {total}</span>
      </div>

      {active?.description && <p style={{ margin: "0 0 16px", maxWidth: 640, fontSize: 14.5, fontWeight: 500, lineHeight: 1.5, color: MUTED }}>{active.description}</p>}

      {/* pill dlaždice podkategorií */}
      {siblings.length > 1 && (
        <div className="es10l-subrow" style={{ marginBottom: 18 }}>
          {siblings.map((c) => (
            <Link key={c.slug} href={`${basePath}?kategorie=${c.slug}`} className={`es10l-subcat${c.slug === activeCategory ? " es10l-subcat--on" : ""}`}>
              {c.image_url ? <img src={c.image_url} alt="" className="es10l-subcat-img" /> : <span className="es10l-subcat-img" aria-hidden />}
              {c.name}
            </Link>
          ))}
        </div>
      )}

      {/* filtr lišta */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", padding: "14px 0", borderTop: `1px solid ${BORDER}`, borderBottom: `1px solid ${BORDER}`, marginBottom: 22 }}>
        {filterPills.map((f) => (
          <button key={f.key} type="button" className={`es10l-pill${filter === f.key ? " es10l-pill--on" : ""}`} onClick={() => setFilter(f.key)}>{f.label}</button>
        ))}
        {brands.length > 1 && (
          <select className="es10l-select" value={brand} onChange={(e) => setBrand(e.target.value)} aria-label="Značka">
            <option value="">Všechny značky</option>
            {brands.map((b) => <option key={b} value={b}>{b}</option>)}
          </select>
        )}
        <span style={{ marginLeft: "auto", display: "inline-flex", alignItems: "center", gap: 9 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: MUTED }}>Řadit:</span>
          <select className="es10l-select" value={sort} onChange={(e) => setSort(e.target.value as typeof sort)} aria-label="Řazení">
            <option value="pop">Populární</option>
            <option value="cheap">Nejlevnější</option>
            <option value="exp">Nejdražší</option>
            <option value="disc">Největší sleva</option>
          </select>
        </span>
      </div>

      {/* grid s promo dlaždicí */}
      {shownItems.length === 0 ? (
        <div style={{ padding: "60px 0", textAlign: "center", color: MUTED, fontSize: 15, fontWeight: 500 }}>
          Tomuhle výběru nic neodpovídá. Zkus zrušit filtry.
        </div>
      ) : (
        <div className="es10l-grid">
          {shownItems.flatMap((p, i) => {
            const nodes: React.ReactNode[] = [];
            if (showPromo && i === 5) {
              nodes.push(
                <Link key="promo" href={`${basePath}?kategorie=vyprodej`} className="es10l-promo">
                  <span style={{ position: "relative", fontFamily: COND, fontStyle: "italic", fontSize: 15, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(10,10,11,0.6)" }}>Letní výprodej</span>
                  <span style={{ position: "relative", marginTop: 6, fontFamily: COND, fontSize: "clamp(30px, 2.6vw, 40px)", fontWeight: 800, textTransform: "uppercase", color: ON_VOLT, lineHeight: 0.95 }}>Slevy až<br />60 %</span>
                  <span style={{ position: "relative", marginTop: 8, fontSize: 13.5, fontWeight: 600, color: "rgba(10,10,11,0.7)" }}>+ extra 5 % s kódem KLUB5</span>
                  <span className="es10l-promo-btn">
                    Nakupuj výprodej
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
                  </span>
                </Link>
              );
            }
            nodes.push(<Es10Card key={p.id} p={p} basePath={basePath} currency={currency} wished={wishlist.has(p.id)} onWish={() => toggleWish(p.id)} />);
            return nodes;
          })}
        </div>
      )}

      {/* ukázat další + stránkování */}
      {hasMore && (
        <button type="button" className="es10l-more" onClick={() => setShown((s) => s + 12)}>Ukázat další</button>
      )}
      {pages > 1 && (
        <div style={{ display: "flex", justifyContent: "center", gap: 7, marginTop: 22, flexWrap: "wrap" }}>
          {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
            <Link key={n} href={pageHref(n)} className={`es10l-page${n === page ? " es10l-page--on" : ""}`}>{n}</Link>
          ))}
        </div>
      )}
      <div style={{ height: 40 }} />
    </div>
  );
}
