"use client";

/**
 * eshop-08 "Domea" — bonami.cz kategorie/listing.
 *
 * Layout dle předlohy (prace/eshop/bonami/kategorie.pdf):
 *   breadcrumb → H1 → dlaždice podkategorií s fotkami → filtr pills
 *   (FILTRY | Skladem | Novinky | Akce a slevy | značka) → toolbar
 *   („X výsledků" | řazení) → 4sloupcový grid bonami karet (červený −% pill,
 *   Novinka, brand, název, popis, dostupnost, cena, zelené DO KOŠÍKU)
 *   s promo dlaždicí Summer Sale → číslované stránkování.
 */

import Link from "next/link";
import { useMemo, useState } from "react";
import type { ProductItem } from "./ProductListing";

export type Es08Item = ProductItem & { default_variant_id?: number | null };

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
  items: Es08Item[];
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

const INK = "#2b2b2b";
const GREEN = "#3d9a50";
const GREEN_DARK = "#2f7d3f";
const RED = "#d64541";
const MUTED = "#8a8a86";
const BORDER = "#e6e6e3";
const SURFACE = "#f4f4f2";
const GOLD = "#f0b429";
const SANS = "'DM Sans','Segoe UI',Arial,sans-serif";

function czk(cents: number, currency = "CZK"): string {
  return new Intl.NumberFormat("cs-CZ", { style: "currency", currency, maximumFractionDigits: 0 }).format(cents / 100);
}

function discountPct(price: number, compare: number | null | undefined): number | null {
  if (!compare || compare <= price) return null;
  return Math.round((1 - price / compare) * 100);
}

function Es08ListingCard({ p, basePath, currency, tenantSlug }: { p: Es08Item; basePath: string; currency: string; tenantSlug: string }) {
  const [busy, setBusy] = useState(false);
  const soldOut = p.stock_total <= 0;
  const lastPieces = !soldOut && p.stock_total <= 8;
  const pct = discountPct(p.price_min_cents, p.compare_at_max_cents);
  const onSale = pct != null;
  const rating = (43 + ((p.id * 37) % 7)) / 10;
  const reviews = 1 + ((p.id * 53) % 60);

  const addToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!p.default_variant_id || busy) return;
    setBusy(true);
    fetch(`/api/demo/${tenantSlug}/shop/cart/items`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ variant_id: p.default_variant_id, qty: 1 }),
    })
      .then(() => window.dispatchEvent(new Event("webero-cart-item-added")))
      .finally(() => setBusy(false));
  };

  return (
    <Link href={`${basePath}/${p.slug}`} className="es08l-card">
      <span className="es08l-media">
        <span className="es08l-badges">
          {soldOut ? (
            <span className="es08l-badge" style={{ background: SURFACE, color: MUTED }}>Vyprodáno</span>
          ) : (
            <>
              {onSale && <span className="es08l-badge" style={{ background: RED, color: "#fff" }}>−{pct} %</span>}
              {p.is_new && <span className="es08l-badge" style={{ background: INK, color: "#fff" }}>Novinka</span>}
              {p.is_featured && !onSale && !p.is_new && <span className="es08l-badge" style={{ background: "#fff", color: INK, border: `1px solid ${BORDER}` }}>Premium</span>}
            </>
          )}
        </span>
        <span className="es08l-heart" aria-hidden>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
        </span>
        {p.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={p.image_url} alt={p.title} loading="lazy" />
        ) : (
          <span className="es08l-noimg" aria-hidden>
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="M21 15l-5-5L5 21" /></svg>
          </span>
        )}
      </span>
      {p.brand && <span className="es08l-brand">{p.brand}</span>}
      <span className="es08l-title">{p.title}</span>
      {p.subtitle && <span className="es08l-sub">{p.subtitle}</span>}
      <span className="es08l-stars">
        <svg width="13" height="13" viewBox="0 0 20 20" fill={GOLD}><path d="M10 1l2.39 4.84L18 6.71l-4 3.9.94 5.5L10 13.4l-4.94 2.71.94-5.5-4-3.9 5.61-.87L10 1z" /></svg>
        <b>{rating.toFixed(1)}</b> <i>({reviews})</i>
      </span>
      <span className="es08l-avail" style={{ color: soldOut ? RED : GREEN }}>
        {soldOut ? "Vyprodáno" : lastPieces ? "Skladem · Poslední kousky" : "Skladem"}
      </span>
      <span className="es08l-priceline">
        <span className="es08l-price" style={{ color: soldOut ? MUTED : onSale ? RED : INK }}>
          {p.price_min_cents !== p.price_max_cents ? `od ${czk(p.price_min_cents, currency)}` : czk(p.price_min_cents, currency)}
        </span>
        {onSale && <span className="es08l-old">{czk(p.compare_at_max_cents!, currency)}</span>}
      </span>
      {!soldOut && p.default_variant_id && (
        <button className="es08l-cartbtn" onClick={addToCart} disabled={busy} style={{ opacity: busy ? 0.6 : 1 }}>
          DO KOŠÍKU
        </button>
      )}
    </Link>
  );
}

export function Eshop08Listing({ items, categories, activeCategory, basePath, currency, total, page, pages, initialBrand }: Props) {
  const tenantSlug = basePath.split("/")[2] ?? "";
  const [fltStock, setFltStock] = useState(false);
  const [fltNew, setFltNew] = useState(false);
  const [fltSale, setFltSale] = useState(false);
  const [sort, setSort] = useState<"default" | "cheap" | "expensive">("default");

  const activeCat = activeCategory ? categories.find((c) => c.slug === activeCategory) ?? null : null;
  const subTiles = useMemo(() => {
    if (activeCat) {
      const kids = categories.filter((c) => c.parent_id === activeCat.id);
      return kids.length ? kids : [];
    }
    return categories.filter((c) => !c.parent_id);
  }, [categories, activeCat]);

  const filtered = useMemo(() => {
    let out = items.filter((p) => {
      if (fltStock && p.stock_total <= 0) return false;
      if (fltNew && !p.is_new) return false;
      if (fltSale && !(p.compare_at_max_cents && p.compare_at_max_cents > p.price_min_cents)) return false;
      return true;
    });
    if (sort === "cheap") out = [...out].sort((a, b) => a.price_min_cents - b.price_min_cents);
    if (sort === "expensive") out = [...out].sort((a, b) => b.price_min_cents - a.price_min_cents);
    return out;
  }, [items, fltStock, fltNew, fltSale, sort]);

  const catHref = (slug: string) => `${basePath}?kategorie=${slug}`;
  const pageHref = (n: number) => {
    const params = new URLSearchParams();
    if (activeCategory) params.set("kategorie", activeCategory);
    if (initialBrand) params.set("znacka", initialBrand);
    if (n > 1) params.set("strana", String(n));
    const qs = params.toString();
    return qs ? `${basePath}?${qs}` : `${basePath}?vse=1`;
  };

  const Pill = ({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) => (
    <button type="button" onClick={onClick} className="es08l-pill" style={{
      background: active ? INK : "#fff", color: active ? "#fff" : INK, borderColor: active ? INK : BORDER,
    }}>{children}</button>
  );

  return (
    <div style={{ fontFamily: SANS, color: INK }}>
      <style>{`
        .es08l-pill { height: 38px; padding: 0 16px; border: 1.5px solid ${BORDER}; border-radius: 19px; font-family: ${SANS}; font-size: 13.5px; font-weight: 600; cursor: pointer; transition: border-color 0.14s, background 0.14s, color 0.14s; white-space: nowrap; }
        .es08l-pill:hover { border-color: ${INK}; }

        .es08l-subtiles { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 12px; }
        .es08l-subtile { display: flex; align-items: center; gap: 10px; padding: 9px 12px; border: 1px solid ${BORDER}; border-radius: 12px; text-decoration: none; font-size: 13.5px; font-weight: 600; color: ${INK}; background: #fff; transition: border-color 0.14s, box-shadow 0.14s; }
        .es08l-subtile:hover { border-color: ${GREEN}; box-shadow: 0 6px 16px rgba(43,43,43,0.07); }
        .es08l-subtile img { width: 44px; height: 44px; border-radius: 8px; object-fit: cover; background: ${SURFACE}; flex-shrink: 0; }

        .es08l-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 22px 16px; }
        @media (max-width: 1100px) { .es08l-grid { grid-template-columns: repeat(3, 1fr); } }
        @media (max-width: 800px) { .es08l-grid { grid-template-columns: repeat(2, 1fr); } }

        .es08l-card { display: flex; flex-direction: column; text-decoration: none; position: relative; }
        .es08l-media { position: relative; display: block; aspect-ratio: 1/1; border-radius: 12px; overflow: hidden; background: ${SURFACE}; }
        .es08l-media img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.4s cubic-bezier(0.16,1,0.3,1); }
        .es08l-card:hover .es08l-media img { transform: scale(1.05); }
        .es08l-noimg { display: flex; align-items: center; justify-content: center; height: 100%; color: #d4d4d0; }
        .es08l-badges { position: absolute; top: 10px; left: 10px; display: flex; flex-direction: column; align-items: flex-start; gap: 5px; z-index: 2; }
        .es08l-badge { padding: 4px 10px; border-radius: 999px; font-size: 11px; font-weight: 800; }
        .es08l-heart { position: absolute; top: 10px; right: 10px; width: 32px; height: 32px; border-radius: 50%; background: rgba(255,255,255,0.94); color: ${INK}; display: flex; align-items: center; justify-content: center; z-index: 2; opacity: 0; transform: translateY(-4px); transition: opacity 0.18s, transform 0.18s, color 0.14s; }
        .es08l-card:hover .es08l-heart { opacity: 1; transform: translateY(0); }
        .es08l-heart:hover { color: ${RED}; }
        .es08l-brand { margin-top: 10px; font-size: 12px; font-weight: 500; color: ${MUTED}; }
        .es08l-title { font-size: 14px; font-weight: 700; color: ${INK}; line-height: 1.35; margin-top: 2px; }
        .es08l-card:hover .es08l-title { text-decoration: underline; text-underline-offset: 3px; }
        .es08l-sub { margin-top: 3px; font-size: 12.5px; font-weight: 500; color: ${MUTED}; line-height: 1.45; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; }
        .es08l-stars { display: inline-flex; align-items: center; gap: 4px; margin-top: 6px; font-size: 12px; color: ${INK}; }
        .es08l-stars i { font-style: normal; color: ${MUTED}; }
        .es08l-avail { margin-top: 4px; font-size: 12.5px; font-weight: 600; }
        .es08l-priceline { display: flex; align-items: baseline; gap: 8px; margin-top: 3px; }
        .es08l-price { font-size: 16px; font-weight: 800; }
        .es08l-old { font-size: 12.5px; font-weight: 500; color: ${MUTED}; text-decoration: line-through; }
        .es08l-cartbtn { margin-top: 10px; align-self: flex-start; height: 38px; padding: 0 20px; border: none; border-radius: 19px; background: ${GREEN}; color: #fff; font-family: ${SANS}; font-size: 12.5px; font-weight: 800; letter-spacing: 0.04em; cursor: pointer; transition: background 0.15s, transform 0.15s; }
        .es08l-cartbtn:hover { background: ${GREEN_DARK}; transform: translateY(-1px); }

        .es08l-promo { border-radius: 12px; background: #e8b93b; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 24px; text-decoration: none; min-height: 260px; transition: transform 0.2s, box-shadow 0.2s; }
        .es08l-promo:hover { transform: translateY(-3px); box-shadow: 0 14px 30px rgba(43,43,43,0.14); }

        .es08l-page { min-width: 38px; height: 38px; border: 1.5px solid ${BORDER}; border-radius: 10px; display: inline-flex; align-items: center; justify-content: center; padding: 0 10px; text-decoration: none; font-size: 13.5px; font-weight: 700; color: ${INK}; transition: border-color 0.14s, background 0.14s; }
        .es08l-page:hover { border-color: ${INK}; }
        .es08l-page.is-active { background: ${INK}; color: #fff; border-color: ${INK}; }

        .es08l-sort { height: 38px; border: 1.5px solid ${BORDER}; border-radius: 19px; padding: 0 14px; font-family: ${SANS}; font-size: 13.5px; font-weight: 600; color: ${INK}; background: #fff; cursor: pointer; }
      `}</style>

      {/* breadcrumb + H1 */}
      <nav style={{ padding: "16px 0 4px", fontSize: 12.5, color: MUTED, display: "flex", gap: 7, flexWrap: "wrap" }} aria-label="Drobečková navigace">
        <Link href={basePath.replace(/\/obchod$/, "")} style={{ color: MUTED, textDecoration: "none" }}>Domů</Link>
        <span>›</span>
        <Link href={`${basePath}?vse=1`} style={{ color: activeCat ? MUTED : INK, textDecoration: "none", fontWeight: activeCat ? 500 : 700 }}>Kategorie</Link>
        {activeCat && (<><span>›</span><span style={{ color: INK, fontWeight: 700 }}>{activeCat.name}</span></>)}
      </nav>
      <h1 style={{ margin: "6px 0 18px", fontSize: "clamp(26px, 3vw, 34px)", fontWeight: 800, letterSpacing: "-0.02em" }}>
        {activeCat?.name ?? "Kategorie"}
      </h1>

      {/* dlaždice podkategorií */}
      {subTiles.length > 0 && (
        <div className="es08l-subtiles" style={{ marginBottom: 22 }}>
          {subTiles.map((c) => (
            <a key={c.id} href={catHref(c.slug)} className="es08l-subtile">
              {c.image_url ? <img src={c.image_url} alt="" loading="lazy" /> : (
                <span style={{ width: 44, height: 44, borderRadius: 8, background: SURFACE, flexShrink: 0 }} />
              )}
              {c.name}
            </a>
          ))}
        </div>
      )}

      {/* filtr pills + toolbar */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", paddingBottom: 14, borderBottom: `1px solid ${BORDER}` }}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 7, fontSize: 13, fontWeight: 800, letterSpacing: "0.06em" }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 6h16M7 12h10M10 18h4"/></svg>
          FILTRY
        </span>
        <Pill active={fltStock} onClick={() => setFltStock(!fltStock)}>Skladem</Pill>
        <Pill active={fltNew} onClick={() => setFltNew(!fltNew)}>Novinky</Pill>
        <Pill active={fltSale} onClick={() => setFltSale(!fltSale)}>Akce a slevy</Pill>
        <span style={{ marginLeft: "auto", display: "inline-flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 13.5, fontWeight: 500, color: MUTED }}>{total.toLocaleString("cs-CZ")} výsledků</span>
          <select className="es08l-sort" value={sort} onChange={(e) => setSort(e.target.value as typeof sort)} aria-label="Řazení">
            <option value="default">Nejprodávanější</option>
            <option value="cheap">Od nejlevnějšího</option>
            <option value="expensive">Od nejdražšího</option>
          </select>
        </span>
      </div>

      {/* grid */}
      <div className="es08l-grid" style={{ paddingTop: 22 }}>
        {filtered.map((p, i) => (
          <span key={p.id} style={{ display: "contents" }}>
            <Es08ListingCard p={p} basePath={basePath} currency={currency} tenantSlug={tenantSlug} />
            {i === 7 && (
              <a href={`${basePath}?kategorie=slevy`} className="es08l-promo">
                <span style={{ fontSize: 13, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,255,255,0.92)" }}>Summer Sale</span>
                <span style={{ marginTop: 4, fontSize: "clamp(26px, 2.6vw, 34px)", fontWeight: 800, letterSpacing: "-0.02em", color: "#fff", lineHeight: 1.1 }}>Ušetřete<br />až 40 %</span>
                <span style={{ marginTop: 14, height: 38, padding: "0 20px", borderRadius: 19, background: "#fff", color: INK, fontSize: 12.5, fontWeight: 800, display: "inline-flex", alignItems: "center" }}>DO VÝPRODEJE →</span>
              </a>
            )}
          </span>
        ))}
        {filtered.length === 0 && (
          <div style={{ gridColumn: "1 / -1", border: `1px dashed ${BORDER}`, borderRadius: 12, padding: "50px 24px", textAlign: "center", color: MUTED, fontSize: 14 }}>
            Tomuto výběru neodpovídají žádné produkty.
          </div>
        )}
      </div>

      {/* stránkování */}
      {pages > 1 && (
        <div style={{ display: "flex", justifyContent: "center", gap: 8, padding: "34px 0 10px", flexWrap: "wrap" }}>
          {page > 1 && <Link href={pageHref(page - 1)} className="es08l-page" aria-label="Předchozí">‹</Link>}
          {Array.from({ length: pages }, (_, i) => i + 1)
            .filter((n) => n === 1 || n === pages || Math.abs(n - page) <= 2)
            .map((n, idx, arr) => (
              <span key={n} style={{ display: "inline-flex", gap: 8 }}>
                {idx > 0 && arr[idx - 1] !== n - 1 && <span style={{ alignSelf: "center", color: MUTED }}>…</span>}
                <Link href={pageHref(n)} className={`es08l-page${n === page ? " is-active" : ""}`}>{n}</Link>
              </span>
            ))}
          {page < pages && <Link href={pageHref(page + 1)} className="es08l-page" aria-label="Další">›</Link>}
        </div>
      )}
    </div>
  );
}
