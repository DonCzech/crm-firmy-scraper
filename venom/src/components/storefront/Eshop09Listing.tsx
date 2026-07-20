"use client";

/**
 * eshop-09 "Mobil Expres" — mp.cz kategorie/listing (vlastní navy/mint identita).
 *
 * Layout dle předlohy (prace/eshop/Mobil Pohotovost/kategorie.pdf):
 *   breadcrumb → H1 → dlaždice podkategorií (Limitované nabídky tmavá s coral
 *   bleskem) → [sidebar: Cena od/do | Značka checkboxy s počty | Dostupnost |
 *   Speciální nabídka] + [sort taby s ikonami (Nejoblíbenější | Nejlevnější |
 *   Nejdražší | Největší sleva) + „X produktů" → 4sloupcový grid karet
 *   (coral −%, navy NOVINKA, perk pill, skladem mint, navy AKČNÍ CENA tag,
 *   od X Kč/měs., mint Koupit quick-add, outline Pronajmout)] → stránkování.
 */

import Link from "next/link";
import { useMemo, useState } from "react";
import type { ProductItem } from "./ProductListing";

export type Es09Item = ProductItem & { default_variant_id?: number | null };

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
  items: Es09Item[];
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

const INK = "#232a30";
const NAVY = "#1d2433";
const MINT = "#3ce0a6";
const MINT_DARK = "#0f9d70";
const ON_MINT = "#06281c";
const CORAL = "#ff7a59";
const MUTED = "#8b949c";
const BORDER = "#e8e9eb";
const SURFACE = "#f5f6f7";
const SANS = "'Archivo','Segoe UI',Arial,sans-serif";

const ES09_PERKS = ["Záruka 3 roky zdarma", "Bonus k výkupní ceně", "Doprava zdarma", "Dárek k nákupu"];

function czk(cents: number, currency = "CZK"): string {
  return new Intl.NumberFormat("cs-CZ", { style: "currency", currency, maximumFractionDigits: 0 }).format(cents / 100);
}

function discountPct(price: number, compare: number | null | undefined): number | null {
  if (!compare || compare <= price) return null;
  return Math.round((1 - price / compare) * 100);
}

function Es09ListingCard({ p, basePath, currency, tenantSlug }: { p: Es09Item; basePath: string; currency: string; tenantSlug: string }) {
  const [busy, setBusy] = useState(false);
  const soldOut = p.stock_total <= 0;
  const lastPieces = !soldOut && p.stock_total <= 5;
  const pct = discountPct(p.price_min_cents, p.compare_at_max_cents);
  const onSale = pct != null;
  const perk = ES09_PERKS[p.id % ES09_PERKS.length];
  const monthly = Math.round(p.price_min_cents / 100 / 24);
  const rentMonthly = Math.round(p.price_min_cents / 100 / 36);
  const priceRange = p.price_min_cents !== p.price_max_cents;

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
    <Link href={`${basePath}/${p.slug}`} className="es09l-card">
      <span className="es09l-media">
        {soldOut ? (
          <span className="es09l-sale" style={{ background: SURFACE, color: MUTED, boxShadow: "none" }}>Vyprodáno</span>
        ) : (
          onSale && <span className="es09l-sale">−{pct} %</span>
        )}
        {p.is_new && !soldOut && <span className="es09l-new">Novinka</span>}
        {!soldOut && <span className="es09l-perk">{perk}</span>}
        {p.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={p.image_url} alt={p.title} loading="lazy" />
        ) : (
          <span className="es09l-noimg" aria-hidden>
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="M21 15l-5-5L5 21" /></svg>
          </span>
        )}
      </span>
      {p.brand && <span className="es09l-brand">{p.brand}</span>}
      <span className="es09l-title">{p.title}</span>
      <span className="es09l-avail" style={{ color: soldOut ? CORAL : MINT_DARK }}>
        {soldOut ? "Vyprodáno" : lastPieces ? "Skladem · poslední kusy" : "Skladem · ihned k odeslání"}
      </span>
      <span className="es09l-pricebox">
        <span style={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 0 }}>
          {onSale && <span className="es09l-old">{czk(p.compare_at_max_cents!, currency)}</span>}
          <span className="es09l-monthly">od {monthly.toLocaleString("cs-CZ")} Kč/měs.</span>
        </span>
        {onSale ? (
          <span className="es09l-tag">
            <span className="es09l-tag-label">Akční cena</span>
            <span className="es09l-tag-price">{priceRange ? `od ${czk(p.price_min_cents, currency)}` : czk(p.price_min_cents, currency)}</span>
          </span>
        ) : (
          <span style={{ fontSize: 17, fontWeight: 800, color: NAVY, whiteSpace: "nowrap" }}>
            {priceRange ? `od ${czk(p.price_min_cents, currency)}` : czk(p.price_min_cents, currency)}
          </span>
        )}
      </span>
      {!soldOut && p.default_variant_id ? (
        <button className="es09l-buy" onClick={addToCart} disabled={busy} style={{ opacity: busy ? 0.6 : 1 }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M5.5 9 8 3.5M18.5 9 16 3.5M3 9h18l-1.7 9.4a2 2 0 0 1-2 1.6H6.7a2 2 0 0 1-2-1.6L3 9z"/></svg>
          Koupit
        </button>
      ) : (
        <span className="es09l-buy" style={{ background: SURFACE, color: MUTED }}>Vyprodáno</span>
      )}
      {!soldOut && p.price_min_cents >= 500000 && (
        <span className="es09l-rent">Pronajmout za {rentMonthly.toLocaleString("cs-CZ")} Kč/měs.</span>
      )}
    </Link>
  );
}

export function Eshop09Listing({ items, categories, activeCategory, basePath, currency, total, page, pages, initialBrand, initialQuery }: Props) {
  const tenantSlug = basePath.split("/")[2] ?? "";
  const [fltBrands, setFltBrands] = useState<Set<string>>(() => new Set(initialBrand ? [initialBrand] : []));
  const [fltStock, setFltStock] = useState(false);
  const [fltNew, setFltNew] = useState(false);
  const [fltSale, setFltSale] = useState(false);
  const [priceFrom, setPriceFrom] = useState("");
  const [priceTo, setPriceTo] = useState("");
  const [sort, setSort] = useState<"popular" | "cheap" | "expensive" | "discount">("popular");
  const [openGroups, setOpenGroups] = useState<Set<string>>(() => new Set(["cena", "znacka", "special"]));

  const activeCat = activeCategory ? categories.find((c) => c.slug === activeCategory) ?? null : null;
  const subTiles = useMemo(() => {
    if (activeCat) return categories.filter((c) => c.parent_id === activeCat.id);
    return categories.filter((c) => !c.parent_id);
  }, [categories, activeCat]);

  const brands = useMemo(() => {
    const m = new Map<string, number>();
    for (const p of items) if (p.brand) m.set(p.brand, (m.get(p.brand) ?? 0) + 1);
    return [...m.entries()].sort((a, b) => b[1] - a[1]);
  }, [items]);

  const filtered = useMemo(() => {
    const from = parseInt(priceFrom, 10);
    const to = parseInt(priceTo, 10);
    let out = items.filter((p) => {
      if (fltBrands.size && (!p.brand || !fltBrands.has(p.brand))) return false;
      if (fltStock && p.stock_total <= 0) return false;
      if (fltNew && !p.is_new) return false;
      if (fltSale && !(p.compare_at_max_cents && p.compare_at_max_cents > p.price_min_cents)) return false;
      if (!Number.isNaN(from) && p.price_min_cents < from * 100) return false;
      if (!Number.isNaN(to) && p.price_min_cents > to * 100) return false;
      return true;
    });
    if (sort === "cheap") out = [...out].sort((a, b) => a.price_min_cents - b.price_min_cents);
    if (sort === "expensive") out = [...out].sort((a, b) => b.price_min_cents - a.price_min_cents);
    if (sort === "discount") out = [...out].sort((a, b) => (discountPct(b.price_min_cents, b.compare_at_max_cents) ?? 0) - (discountPct(a.price_min_cents, a.compare_at_max_cents) ?? 0));
    return out;
  }, [items, fltBrands, fltStock, fltNew, fltSale, priceFrom, priceTo, sort]);

  const toggleBrand = (b: string) => {
    setFltBrands((prev) => {
      const next = new Set(prev);
      if (next.has(b)) next.delete(b); else next.add(b);
      return next;
    });
  };
  const toggleGroup = (g: string) => {
    setOpenGroups((prev) => {
      const next = new Set(prev);
      if (next.has(g)) next.delete(g); else next.add(g);
      return next;
    });
  };

  const catHref = (slug: string) => `${basePath}?kategorie=${slug}`;
  const pageHref = (n: number) => {
    const params = new URLSearchParams();
    if (activeCategory) params.set("kategorie", activeCategory);
    if (initialBrand) params.set("znacka", initialBrand);
    if (initialQuery) params.set("q", initialQuery);
    if (n > 1) params.set("strana", String(n));
    const qs = params.toString();
    return qs ? `${basePath}?${qs}` : `${basePath}?vse=1`;
  };

  const SORT_TABS: Array<{ key: typeof sort; label: string; icon: React.ReactNode }> = [
    { key: "popular", label: "Nejoblíbenější", icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M12 17.3 6.2 20.6l1.1-6.5L2.6 9.5l6.5-.9L12 2.7l2.9 5.9 6.5.9-4.7 4.6 1.1 6.5z"/></svg> },
    { key: "cheap", label: "Nejlevnější", icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round"><path d="M4 6h10M4 12h7M4 18h4M18 8v10m0 0-3-3m3 3 3-3"/></svg> },
    { key: "expensive", label: "Nejdražší", icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round"><path d="M4 6h4M4 12h7M4 18h10M18 18V8m0 0-3 3m3-3 3 3"/></svg> },
    { key: "discount", label: "Největší sleva", icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round"><path d="M19 5 5 19"/><circle cx="7.5" cy="7.5" r="2.2"/><circle cx="16.5" cy="16.5" r="2.2"/></svg> },
  ];

  const Group = ({ id, label, children }: { id: string; label: string; children: React.ReactNode }) => {
    const open = openGroups.has(id);
    return (
      <div style={{ borderBottom: `1px solid ${BORDER}`, paddingBottom: open ? 16 : 0 }}>
        <button type="button" className="es09l-group" onClick={() => toggleGroup(id)} aria-expanded={open}>
          {label}
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ transition: "transform 0.18s", transform: open ? "rotate(180deg)" : "none" }}>
            <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        {open && children}
      </div>
    );
  };

  const Check = ({ on, onToggle, children, count }: { on: boolean; onToggle: () => void; children: React.ReactNode; count?: number }) => (
    <label className="es09l-check">
      <span className={`es09l-box${on ? " on" : ""}`} role="checkbox" aria-checked={on} onClick={(e) => { e.preventDefault(); onToggle(); }}>
        {on && <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={ON_MINT} strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5l4.5 4.5L19 7"/></svg>}
      </span>
      <span onClick={onToggle} style={{ flex: 1 }}>{children}</span>
      {count != null && <span style={{ color: MUTED, fontWeight: 500 }}>({count})</span>}
    </label>
  );

  return (
    <div style={{ fontFamily: SANS, color: INK }}>
      <style>{`
        .es09l-subtiles { display: grid; grid-template-columns: repeat(auto-fill, minmax(190px, 1fr)); gap: 12px; }
        .es09l-subtile { display: flex; align-items: center; gap: 11px; padding: 10px 14px; border: 1px solid ${BORDER}; border-radius: 13px; text-decoration: none; font-size: 13.5px; font-weight: 700; color: ${INK}; background: #fff; transition: border-color 0.14s, box-shadow 0.14s, transform 0.14s; }
        .es09l-subtile:hover { border-color: ${MINT_DARK}; box-shadow: 0 8px 20px rgba(14,20,25,0.08); transform: translateY(-1px); }
        .es09l-subtile img { width: 46px; height: 46px; border-radius: 9px; object-fit: cover; background: ${SURFACE}; flex-shrink: 0; }
        .es09l-subtile.es09l-subtile--hot { background: ${NAVY}; border-color: ${NAVY}; color: ${CORAL}; }
        .es09l-subtile.es09l-subtile--hot:hover { border-color: ${CORAL}; }

        .es09l-layout { display: grid; grid-template-columns: 256px minmax(0, 1fr); gap: 30px; align-items: start; }
        @media (max-width: 1000px) { .es09l-layout { grid-template-columns: 1fr; } .es09l-side { display: none; } }

        .es09l-side { display: flex; flex-direction: column; gap: 16px; }
        .es09l-group { display: flex; align-items: center; justify-content: space-between; width: 100%; padding: 4px 0 14px; border: none; background: none; cursor: pointer; font-family: ${SANS}; font-size: 14.5px; font-weight: 800; color: ${INK}; }
        .es09l-check { display: flex; align-items: center; gap: 9px; padding: 5px 0; font-size: 13.5px; font-weight: 600; color: ${INK}; cursor: pointer; user-select: none; }
        .es09l-box { flex-shrink: 0; width: 18px; height: 18px; border-radius: 5px; border: 1.5px solid #c3cad2; display: inline-flex; align-items: center; justify-content: center; transition: background 0.13s, border-color 0.13s; background: #fff; }
        .es09l-box.on { background: ${MINT}; border-color: ${MINT}; }
        .es09l-price-input { width: 100%; height: 40px; border: 1.5px solid ${BORDER}; border-radius: 10px; padding: 0 12px; font-family: ${SANS}; font-size: 13.5px; font-weight: 600; color: ${INK}; outline: none; transition: border-color 0.14s; }
        .es09l-price-input:focus { border-color: ${MINT_DARK}; }

        .es09l-tabs { display: flex; border: 1px solid ${BORDER}; border-radius: 13px; overflow: hidden; background: #fff; }
        .es09l-tab { position: relative; flex: 1; display: inline-flex; align-items: center; justify-content: center; gap: 8px; padding: 13px 10px; border: none; border-right: 1px solid ${BORDER}; background: none; cursor: pointer; font-family: ${SANS}; font-size: 13px; font-weight: 700; color: ${MUTED}; white-space: nowrap; transition: color 0.14s, background 0.14s; }
        .es09l-tab:last-child { border-right: none; }
        .es09l-tab:hover { background: ${SURFACE}; color: ${INK}; }
        .es09l-tab.on { color: ${NAVY}; }
        .es09l-tab.on::after { content: ""; position: absolute; left: 0; right: 0; bottom: 0; height: 3px; background: ${MINT}; }

        .es09l-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
        @media (max-width: 1280px) { .es09l-grid { grid-template-columns: repeat(3, 1fr); } }
        @media (max-width: 760px) { .es09l-grid { grid-template-columns: repeat(2, 1fr); } }

        .es09l-card { display: flex; flex-direction: column; text-decoration: none; position: relative; border: 1px solid ${BORDER}; border-radius: 16px; padding: 12px 12px 14px; background: #fff; transition: border-color 0.16s, transform 0.16s, box-shadow 0.16s; }
        .es09l-card:hover { border-color: rgba(29,36,51,0.4); transform: translateY(-3px); box-shadow: 0 18px 38px rgba(14,20,25,0.1); }
        .es09l-media { position: relative; display: block; aspect-ratio: 1/1; border-radius: 11px; overflow: hidden; background: ${SURFACE}; }
        .es09l-media img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.45s cubic-bezier(0.16,1,0.3,1); }
        .es09l-card:hover .es09l-media img { transform: scale(1.06); }
        .es09l-noimg { display: flex; align-items: center; justify-content: center; height: 100%; color: #d4d4d0; }
        .es09l-sale { position: absolute; top: 9px; left: 9px; z-index: 2; background: ${CORAL}; color: #fff; border-radius: 999px; padding: 5px 10px; font-size: 11.5px; font-weight: 800; box-shadow: 0 8px 18px rgba(255,122,89,0.4); }
        .es09l-new { position: absolute; top: 9px; right: 9px; z-index: 2; background: ${NAVY}; color: #fff; border-radius: 999px; padding: 5px 10px; font-size: 10.5px; font-weight: 800; letter-spacing: 0.05em; text-transform: uppercase; }
        .es09l-perk { position: absolute; left: 9px; bottom: 9px; z-index: 2; max-width: calc(100% - 18px); background: rgba(255,255,255,0.92); backdrop-filter: blur(3px); color: ${NAVY}; border: 1px solid rgba(29,36,51,0.1); border-radius: 999px; padding: 4px 10px; font-size: 10.5px; font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .es09l-brand { margin-top: 10px; font-size: 12px; font-weight: 600; color: ${MUTED}; }
        .es09l-title { margin-top: 2px; font-size: 14px; font-weight: 700; color: ${INK}; line-height: 1.35; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; min-height: 2.7em; }
        .es09l-card:hover .es09l-title { text-decoration: underline; text-underline-offset: 3px; }
        .es09l-avail { margin-top: 5px; font-size: 12px; font-weight: 700; }
        .es09l-pricebox { display: flex; align-items: flex-end; justify-content: space-between; gap: 8px; margin-top: 9px; min-height: 48px; }
        .es09l-old { font-size: 12px; font-weight: 600; color: ${MUTED}; text-decoration: line-through; white-space: nowrap; }
        .es09l-monthly { font-size: 10.5px; font-weight: 600; color: ${MUTED}; white-space: nowrap; }
        .es09l-tag { background: ${NAVY}; border-radius: 10px 10px 10px 3px; padding: 5px 11px 6px; text-align: right; }
        .es09l-tag-label { display: block; font-size: 9px; font-weight: 800; letter-spacing: 0.09em; text-transform: uppercase; color: ${MINT}; }
        .es09l-tag-price { display: block; font-size: 15.5px; font-weight: 800; color: #fff; letter-spacing: -0.01em; white-space: nowrap; }
        .es09l-buy { display: flex; align-items: center; justify-content: center; gap: 8px; height: 40px; margin-top: 11px; border: none; border-radius: 999px; background: ${MINT}; color: ${ON_MINT}; font-family: ${SANS}; font-size: 13px; font-weight: 800; letter-spacing: 0.02em; cursor: pointer; transition: background 0.15s, box-shadow 0.15s; }
        .es09l-buy:hover { background: #63eabb; box-shadow: 0 10px 22px rgba(34,201,147,0.32); }
        .es09l-rent { display: flex; align-items: center; justify-content: center; height: 36px; margin-top: 8px; border: 1.5px solid rgba(34,201,147,0.5); border-radius: 999px; color: ${MINT_DARK}; font-size: 12px; font-weight: 700; transition: border-color 0.14s, background 0.14s; }
        .es09l-card:hover .es09l-rent { border-color: ${MINT_DARK}; background: rgba(60,224,166,0.07); }

        .es09l-page { min-width: 38px; height: 38px; border: 1.5px solid ${BORDER}; border-radius: 11px; display: inline-flex; align-items: center; justify-content: center; padding: 0 10px; text-decoration: none; font-size: 13.5px; font-weight: 700; color: ${INK}; transition: border-color 0.14s, background 0.14s, color 0.14s; }
        .es09l-page:hover { border-color: ${NAVY}; }
        .es09l-page.is-active { background: ${NAVY}; color: #fff; border-color: ${NAVY}; }
      `}</style>

      {/* breadcrumb + H1 */}
      <nav style={{ padding: "16px 0 4px", fontSize: 12.5, color: MUTED, display: "flex", gap: 7, flexWrap: "wrap" }} aria-label="Drobečková navigace">
        <Link href={basePath.replace(/\/obchod$/, "")} style={{ color: MUTED, textDecoration: "none" }}>Domů</Link>
        <span>›</span>
        <Link href={`${basePath}?vse=1`} style={{ color: activeCat ? MUTED : INK, textDecoration: "none", fontWeight: activeCat ? 500 : 700 }}>Kategorie</Link>
        {activeCat && (<><span>›</span><span style={{ color: INK, fontWeight: 700 }}>{activeCat.name}</span></>)}
      </nav>
      <h1 style={{ margin: "6px 0 6px", fontSize: "clamp(26px, 3vw, 34px)", fontWeight: 800, letterSpacing: "-0.02em" }}>
        {activeCat?.name ?? (initialQuery ? `Hledání „${initialQuery}"` : "Všechny produkty")}
      </h1>
      {activeCat?.description && <p style={{ margin: "0 0 18px", fontSize: 14.5, fontWeight: 500, color: MUTED, maxWidth: 640 }}>{activeCat.description}</p>}

      {/* dlaždice podkategorií */}
      {subTiles.length > 0 && (
        <div className="es09l-subtiles" style={{ margin: "14px 0 26px" }}>
          {subTiles.map((c) => {
            const hot = c.slug === "limitovane-nabidky";
            return (
              <a key={c.id} href={catHref(c.slug)} className={`es09l-subtile${hot ? " es09l-subtile--hot" : ""}`}>
                {hot ? (
                  <span style={{ width: 46, height: 46, borderRadius: 9, background: "rgba(255,122,89,0.14)", display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={CORAL} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2 4.5 14h6L9 22l8.5-12h-6L13 2z"/></svg>
                  </span>
                ) : c.image_url ? (
                  <img src={c.image_url} alt="" loading="lazy" />
                ) : (
                  <span style={{ width: 46, height: 46, borderRadius: 9, background: "rgba(60,224,166,0.14)", color: "#0f9d70", display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 17, fontWeight: 800 }} aria-hidden>
                    {c.name.charAt(0).toUpperCase()}
                  </span>
                )}
                {c.name}
              </a>
            );
          })}
        </div>
      )}

      <div className="es09l-layout">
        {/* ── SIDEBAR FILTRY ── */}
        <aside className="es09l-side">
          <Group id="cena" label="Cena">
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <input className="es09l-price-input" type="number" inputMode="numeric" placeholder="od" value={priceFrom} onChange={(e) => setPriceFrom(e.target.value)} aria-label="Cena od" />
              <span style={{ color: MUTED, fontSize: 13 }}>—</span>
              <input className="es09l-price-input" type="number" inputMode="numeric" placeholder="do" value={priceTo} onChange={(e) => setPriceTo(e.target.value)} aria-label="Cena do" />
              <span style={{ fontSize: 13, fontWeight: 700, color: MUTED }}>Kč</span>
            </div>
          </Group>

          {brands.length > 0 && (
            <Group id="znacka" label="Značka">
              <div style={{ display: "flex", flexDirection: "column" }}>
                {brands.map(([b, n]) => (
                  <Check key={b} on={fltBrands.has(b)} onToggle={() => toggleBrand(b)} count={n}>{b}</Check>
                ))}
              </div>
            </Group>
          )}

          <Group id="special" label="Speciální nabídka">
            <div style={{ display: "flex", flexDirection: "column" }}>
              <Check on={fltSale} onToggle={() => setFltSale(!fltSale)}>Akce a slevy</Check>
              <Check on={fltNew} onToggle={() => setFltNew(!fltNew)}>Novinky</Check>
            </div>
          </Group>

          <Group id="dostupnost" label="Dostupnost">
            <Check on={fltStock} onToggle={() => setFltStock(!fltStock)}>Skladem kdekoliv</Check>
          </Group>
        </aside>

        {/* ── VÝSLEDKY ── */}
        <div style={{ minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap", marginBottom: 18 }}>
            <div className="es09l-tabs" style={{ flex: 1, minWidth: 320 }}>
              {SORT_TABS.map((t) => (
                <button key={t.key} type="button" className={`es09l-tab${sort === t.key ? " on" : ""}`} onClick={() => setSort(t.key)}>
                  {t.icon}
                  {t.label}
                </button>
              ))}
            </div>
            <span style={{ fontSize: 13.5, fontWeight: 600, color: MUTED, whiteSpace: "nowrap" }}>
              {total.toLocaleString("cs-CZ")} produktů
            </span>
          </div>

          <div className="es09l-grid">
            {filtered.map((p) => (
              <Es09ListingCard key={p.id} p={p} basePath={basePath} currency={currency} tenantSlug={tenantSlug} />
            ))}
            {filtered.length === 0 && (
              <div style={{ gridColumn: "1 / -1", border: `1px dashed ${BORDER}`, borderRadius: 14, padding: "50px 24px", textAlign: "center", color: MUTED, fontSize: 14 }}>
                Tomuto výběru neodpovídají žádné produkty. Zkuste upravit filtry.
              </div>
            )}
          </div>

          {/* stránkování */}
          {pages > 1 && (
            <div style={{ display: "flex", justifyContent: "center", gap: 8, padding: "34px 0 10px", flexWrap: "wrap" }}>
              {page > 1 && <Link href={pageHref(page - 1)} className="es09l-page" aria-label="Předchozí">‹</Link>}
              {Array.from({ length: pages }, (_, i) => i + 1)
                .filter((n) => n === 1 || n === pages || Math.abs(n - page) <= 2)
                .map((n, idx, arr) => (
                  <span key={n} style={{ display: "inline-flex", gap: 8 }}>
                    {idx > 0 && arr[idx - 1] !== n - 1 && <span style={{ alignSelf: "center", color: MUTED }}>…</span>}
                    <Link href={pageHref(n)} className={`es09l-page${n === page ? " is-active" : ""}`}>{n}</Link>
                  </span>
                ))}
              {page < pages && <Link href={pageHref(page + 1)} className="es09l-page" aria-label="Další">›</Link>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
