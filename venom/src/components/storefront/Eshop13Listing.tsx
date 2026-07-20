"use client";

/**
 * eshop-13 "LUNELA" — milagro.cz kategorie/listing (vlastní editorial identita).
 *
 * Layout dle milagro reference (prace/eshop/Milagro/kategorie.pdf):
 *   breadcrumb → centrovaný light nadpis → pill podkategorie (outlined, wrap,
 *   centrované) → toolbar (Počet produktů | Řadit select · brand checkboxy
 *   s počty) → 3sloupcový grid celošedých karet (#EBECE9: foto 1/1, růžová
 *   badge Výprodej, brand šedě + název černě, cena + přeškrtnutá + černý −%
 *   chip) → stránkování s čísly. Playfair Display + Hanken Grotesk, ostré rohy.
 */

import Link from "next/link";
import React, { useMemo, useState } from "react";
import type { ProductItem } from "./ProductListing";

export type Es13Item = ProductItem & { default_variant_id?: number | null };

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
  items: Es13Item[];
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

const SERIF = "'Playfair Display', Georgia, serif";
const SANS = "'Hanken Grotesk', 'Segoe UI', system-ui, sans-serif";
const INK = "#141414";
const TILE = "#EBECE9";
const PINK = "#FFD2D0";
const MUTED = "#83837f";
const HAIR = "#e4e4e1";

function czk(cents: number, currency = "CZK"): string {
  return new Intl.NumberFormat("cs-CZ", { style: "currency", currency, maximumFractionDigits: 0 }).format(cents / 100);
}

function pct(price: number, compare: number | null | undefined): number | null {
  if (!compare || compare <= price) return null;
  return Math.round((1 - price / compare) * 100);
}

function Es13Card({ p, basePath, currency }: { p: Es13Item; basePath: string; currency: string }) {
  const soldOut = p.stock_total <= 0;
  const disc = pct(p.price_min_cents, p.compare_at_max_cents);
  const onSale = disc != null;
  const brand = p.brand ?? "";
  const titleRest = brand
    ? p.title.replace(new RegExp(`^${brand.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*`, "i"), "")
    : p.title;

  return (
    <Link href={`${basePath}/${p.slug}`} className="es13l-card">
      <span className="es13l-media">
        {p.image_url ? <img src={p.image_url} alt={p.title} loading="lazy" /> : <span style={{ display: "block", width: "100%", height: "100%" }} />}
      </span>
      <span className="es13l-body">
        {(onSale || soldOut) && (
          <span className="es13l-badge" style={soldOut ? { background: "#dcdcd8", color: MUTED } : undefined}>
            {soldOut ? "Vyprodáno" : "Výprodej"}
          </span>
        )}
        <span className="es13l-name">
          {brand && <span className="es13l-brand">{brand}</span>}{brand ? " " : ""}{titleRest}
        </span>
        <span className="es13l-prices">
          <span className="es13l-price">{czk(p.price_min_cents, currency)}</span>
          {onSale && (
            <>
              <span className="es13l-compare">{czk(p.compare_at_max_cents!, currency)}</span>
              <span className="es13l-pct">−{disc} %</span>
            </>
          )}
        </span>
      </span>
    </Link>
  );
}

export function Eshop13Listing({ items, categories, activeCategory, basePath, currency, total, page, pages, initialBrand, initialQuery }: Props) {
  const [sort, setSort] = useState<"doporucene" | "nejlevnejsi" | "nejdrazsi" | "nazev">("doporucene");
  const [brandFilter, setBrandFilter] = useState<Set<string>>(() => new Set(initialBrand ? [initialBrand] : []));

  const active = categories.find(c => c.slug === activeCategory) ?? null;
  const heading = initialQuery ? `Hledání: ${initialQuery}` : (active?.name ?? "Všechny šperky");

  const subcategories = useMemo(() => {
    if (!active) return categories.filter(c => c.parent_id == null && c.product_count > 0).slice(0, 12);
    return categories.filter(c => c.parent_id === active.id && c.product_count > 0);
  }, [categories, active]);

  const brands = useMemo(() => {
    const m = new Map<string, number>();
    for (const it of items) if (it.brand) m.set(it.brand, (m.get(it.brand) ?? 0) + 1);
    return [...m.entries()].sort((a, b) => b[1] - a[1]);
  }, [items]);

  const shown = useMemo(() => {
    let list = items;
    if (brandFilter.size) list = list.filter(it => it.brand && brandFilter.has(it.brand));
    switch (sort) {
      case "nejlevnejsi": list = [...list].sort((a, b) => a.price_min_cents - b.price_min_cents); break;
      case "nejdrazsi": list = [...list].sort((a, b) => b.price_min_cents - a.price_min_cents); break;
      case "nazev": list = [...list].sort((a, b) => a.title.localeCompare(b.title, "cs")); break;
    }
    return list;
  }, [items, brandFilter, sort]);

  const toggleBrand = (b: string) => {
    setBrandFilter(prev => {
      const next = new Set(prev);
      if (next.has(b)) next.delete(b); else next.add(b);
      return next;
    });
  };

  const pageHref = (n: number) => {
    const params = new URLSearchParams();
    if (activeCategory) params.set("kategorie", activeCategory);
    if (initialQuery) params.set("hledat", initialQuery);
    if (n > 1) params.set("strana", String(n));
    const qs = params.toString();
    return `${basePath}${qs ? `?${qs}` : ""}`;
  };

  return (
    <div style={{ fontFamily: SANS, color: INK }}>
      <style>{`
        .es13l-breadcrumb { display: flex; align-items: center; gap: 9px; padding: 20px 0 6px; font-size: 12.5px; color: ${MUTED}; }
        .es13l-breadcrumb a { color: ${MUTED}; text-decoration: none; }
        .es13l-breadcrumb a:hover { color: ${INK}; text-decoration: underline; text-underline-offset: 3px; }

        .es13l-h1 { font-family: ${SANS}; font-size: 46px; font-weight: 300; letter-spacing: 0.01em; text-align: center; margin: 18px 0 26px; color: ${INK}; }

        .es13l-pills { display: flex; flex-wrap: wrap; justify-content: center; gap: 12px; margin-bottom: 34px; }
        .es13l-pill { border: 1px solid #d6d6d2; border-radius: 999px; padding: 9px 18px; font-size: 13.5px; color: ${INK};
          text-decoration: none; line-height: 1; transition: background 0.15s, border-color 0.15s, color 0.15s; }
        .es13l-pill:hover { border-color: ${INK}; }
        .es13l-pill--active { background: ${INK}; border-color: ${INK}; color: #fff; }

        .es13l-toolbar { display: flex; align-items: center; gap: 22px; flex-wrap: wrap; border-top: 1px solid ${HAIR};
          padding: 14px 0; margin-bottom: 10px; font-size: 13.5px; }
        .es13l-toolbar select { border: none; background: none; font-family: ${SANS}; font-size: 13.5px; font-weight: 600; color: ${INK}; cursor: pointer; outline: none; }
        .es13l-check { display: inline-flex; align-items: center; gap: 8px; cursor: pointer; user-select: none; }
        .es13l-check input { width: 15px; height: 15px; accent-color: ${INK}; cursor: pointer; }
        .es13l-check .cnt { color: ${MUTED}; font-size: 12px; }

        .es13l-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
        .es13l-card { display: flex; flex-direction: column; background: ${TILE}; text-decoration: none; color: ${INK};
          transition: transform 0.2s, box-shadow 0.2s; }
        .es13l-card:hover { transform: translateY(-3px); box-shadow: 0 18px 36px rgba(20,20,20,0.12); }
        .es13l-media { position: relative; aspect-ratio: 1 / 1; overflow: hidden; }
        .es13l-media img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.55s cubic-bezier(0.16,1,0.3,1); }
        .es13l-card:hover .es13l-media img { transform: scale(1.05); }
        .es13l-body { display: flex; flex-direction: column; align-items: flex-start; padding: 4px 20px 22px; }
        .es13l-badge { background: ${PINK}; color: ${INK}; font-size: 12px; font-weight: 600; padding: 5px 9px; line-height: 1; margin-bottom: 10px; }
        .es13l-name { font-size: 14.5px; line-height: 1.45; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; }
        .es13l-brand { color: ${MUTED}; text-transform: uppercase; letter-spacing: 0.03em; }
        .es13l-card:hover .es13l-name { text-decoration: underline; text-underline-offset: 3px; text-decoration-thickness: 1px; }
        .es13l-prices { display: flex; align-items: center; gap: 9px; margin-top: 11px; flex-wrap: wrap; }
        .es13l-price { font-size: 16.5px; font-weight: 700; }
        .es13l-compare { font-size: 13px; color: ${MUTED}; text-decoration: line-through; }
        .es13l-pct { background: ${INK}; color: #fff; font-size: 12px; font-weight: 700; padding: 4px 7px; line-height: 1; }

        .es13l-paging { display: flex; align-items: center; justify-content: center; gap: 10px; padding: 38px 0 10px; }
        .es13l-page { min-width: 38px; height: 38px; display: inline-flex; align-items: center; justify-content: center;
          border-radius: 999px; font-size: 14px; color: ${INK}; text-decoration: none; border: 1px solid transparent; transition: border-color 0.15s; }
        .es13l-page:hover { border-color: ${INK}; }
        .es13l-page--active { background: ${INK}; color: #fff; }
        .es13l-empty { border: 1px dashed ${HAIR}; padding: 60px 24px; text-align: center; color: ${MUTED}; font-size: 14.5px; }

        @media (max-width: 900px) { .es13l-grid { grid-template-columns: repeat(2, 1fr); gap: 14px; } .es13l-h1 { font-size: 34px; } }
        @media (max-width: 480px) { .es13l-grid { grid-template-columns: 1fr; } }
      `}</style>

      {/* Breadcrumb */}
      <nav className="es13l-breadcrumb" aria-label="Drobečková navigace">
        <Link href={basePath.replace(/\/obchod$/, "")}>Úvodní stránka</Link>
        <span aria-hidden>›</span>
        {active ? <span style={{ color: INK }}>{active.name}</span> : <span style={{ color: INK }}>Šperky</span>}
      </nav>

      <h1 className="es13l-h1">{heading}</h1>

      {/* Podkategorie pills */}
      {subcategories.length > 0 && (
        <div className="es13l-pills">
          {subcategories.map(sc => (
            <Link key={sc.slug} href={`${basePath}?kategorie=${sc.slug}`} className={`es13l-pill${sc.slug === activeCategory ? " es13l-pill--active" : ""}`}>
              {sc.name}
            </Link>
          ))}
        </div>
      )}

      {/* Toolbar */}
      <div className="es13l-toolbar">
        <span style={{ color: MUTED }}>Počet produktů: <strong style={{ color: INK, fontWeight: 600 }}>{total}</strong></span>
        <label style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
          <span style={{ color: MUTED }}>Řadit:</span>
          <select value={sort} onChange={e => setSort(e.target.value as typeof sort)} aria-label="Řazení produktů">
            <option value="doporucene">Doporučené</option>
            <option value="nejlevnejsi">Od nejlevnějšího</option>
            <option value="nejdrazsi">Od nejdražšího</option>
            <option value="nazev">Podle názvu</option>
          </select>
        </label>
        <span style={{ flex: 1 }} />
        {brands.map(([b, cnt]) => (
          <label key={b} className="es13l-check">
            <input type="checkbox" checked={brandFilter.has(b)} onChange={() => toggleBrand(b)} />
            {b} <span className="cnt">({cnt})</span>
          </label>
        ))}
      </div>

      {/* Grid */}
      {shown.length === 0 ? (
        <div className="es13l-empty">Tomuto výběru neodpovídají žádné šperky. Zkuste upravit filtry.</div>
      ) : (
        <div className="es13l-grid">
          {shown.map(p => <Es13Card key={p.id} p={p} basePath={basePath} currency={currency} />)}
        </div>
      )}

      {/* Stránkování */}
      {pages > 1 && (
        <nav className="es13l-paging" aria-label="Stránkování">
          {Array.from({ length: pages }, (_, i) => i + 1).map(n => (
            <Link key={n} href={pageHref(n)} className={`es13l-page${n === page ? " es13l-page--active" : ""}`}>{n}</Link>
          ))}
        </nav>
      )}
    </div>
  );
}
