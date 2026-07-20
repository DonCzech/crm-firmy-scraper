"use client";

/**
 * eshop-12 "PACKA" — petcenter.cz kategorie/listing (vlastní purple/mango identita).
 *
 * Layout dle předlohy (prace/eshop/Petcenter/kategorie.pdf):
 *   breadcrumb → H1 + popis kategorie → pill dlaždice podkategorií (foto + label)
 *   → levý sidebar filtrů (Dle štítku checkboxy: Na skladě / Akce / Novinka,
 *   Cena od–do, Značky checkboxy s počty) + pravý obsah: sort taby
 *   NEJPRODÁVANĚJŠÍ | NEJLEVNĚJŠÍ | NEJDRAŽŠÍ + „N položek celkem" →
 *   3sloupcový grid petcenter karet (badge −% / 2+1 / Novinka, hvězdičky,
 *   „Odesíláme…", zelené Skladem, mango cena, qty stepper − 1 + a zelené
 *   DO KOŠÍKU s přímým přidáním přes default_variant_id) →
 *   NAČÍST DALŠÍ PRODUKTY + číslované stránkování.
 */

import Link from "next/link";
import React, { useMemo, useState } from "react";
import type { ProductItem } from "./ProductListing";

export type Es12Item = ProductItem & { default_variant_id?: number | null };

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
  items: Es12Item[];
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

const DISPLAY = "'Baloo 2','Segoe UI',system-ui,sans-serif";
const SANS = "'Nunito','Segoe UI',system-ui,sans-serif";
const PURPLE = "#6f45d1";
const PURPLE_DEEP = "#5836ad";
const PURPLE_SOFT = "#f3eeff";
const MANGO = "#ff8a3d";
const MANGO_DEEP = "#f06e1e";
const NAVY = "#14224a";
const GREEN = "#16a06a";
const GREEN_DEEP = "#0e8557";
const SALE = "#f5453b";
const MUTED = "#71809a";
const BORDER = "#f0e7db";
const CREAM = "#fffbf6";

function czk(cents: number, currency = "CZK"): string {
  return new Intl.NumberFormat("cs-CZ", { style: "currency", currency, maximumFractionDigits: 0 }).format(cents / 100);
}

function discountPct(price: number, compare: number | null | undefined): number | null {
  if (!compare || compare <= price) return null;
  return Math.round((1 - price / compare) * 100);
}

function shipDate(): string {
  const d = new Date(Date.now() + 24 * 3600 * 1000);
  return `${d.getDate()}.${d.getMonth() + 1}.${d.getFullYear()}`;
}

function Es12ListCard({ p, basePath, currency, tenantSlug }: { p: Es12Item; basePath: string; currency: string; tenantSlug: string }) {
  const [qty, setQty] = useState(1);
  const [busy, setBusy] = useState(false);
  const soldOut = p.stock_total <= 0;
  const pct = discountPct(p.price_min_cents, p.compare_at_max_cents);
  const onSale = pct != null;
  const rating = 4 + ((p.id % 10) / 10);
  const full = Math.round(Math.min(5, rating));
  const votes = 8 + (p.id % 87);
  const fromPrice = p.price_min_cents !== p.price_max_cents;

  const addToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!p.default_variant_id || busy) return;
    setBusy(true);
    fetch(`/api/demo/${tenantSlug}/shop/cart/items`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ variant_id: p.default_variant_id, qty }),
    })
      .then(() => window.dispatchEvent(new Event("webero-cart-item-added")))
      .finally(() => setBusy(false));
  };

  return (
    <Link href={`${basePath}/${p.slug}`} className="es12l-card">
      <span className="es12l-media">
        {p.image_url ? <img src={p.image_url} alt={p.title} loading="lazy" /> : <span style={{ display: "block", width: "100%", height: "100%", background: PURPLE_SOFT }} />}
        <span className="es12l-badges">
          {onSale && <span className="es12l-sale">−{pct} %</span>}
          {p.is_new && <span className="es12l-new">Novinka</span>}
        </span>
      </span>
      {p.brand && <span className="es12l-brand">{p.brand}</span>}
      <span className="es12l-title">{p.title}</span>
      <span className="es12l-stars" aria-label={`Hodnocení ${rating.toFixed(1)} z 5`}>
        <span style={{ display: "inline-flex", gap: 1 }}>
          {[1, 2, 3, 4, 5].map(st => (
            <svg key={st} width="12" height="12" viewBox="0 0 24 24" fill={st <= full ? MANGO : "#e8e0d4"}><path d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4l-5.9 3.1 1.2-6.5L2.5 9.4l6.6-.9z"/></svg>
          ))}
        </span>
        <span style={{ fontSize: 11, fontWeight: 700, color: MUTED }}>({votes})</span>
      </span>
      <span className="es12l-ship">Odesíláme {shipDate()}</span>
      <span className={`es12l-avail${soldOut ? " es12l-avail--out" : ""}`}>
        {soldOut ? "Vyprodáno" : <>Skladem {p.stock_total > 20 ? ">20" : p.stock_total} ks</>}
      </span>
      <span className="es12l-prices">
        <span className="es12l-price">{fromPrice ? `od ${czk(p.price_min_cents, currency)}` : czk(p.price_min_cents, currency)}</span>
        {onSale && <span className="es12l-compare">{czk(p.compare_at_max_cents!, currency)}</span>}
      </span>
      <span className="es12l-buyrow" onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}>
        <span className="es12l-qty">
          <button type="button" aria-label="Méně" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setQty(v => Math.max(1, v - 1)); }}>−</button>
          <span>{qty}</span>
          <button type="button" aria-label="Více" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setQty(v => Math.min(99, v + 1)); }}>+</button>
        </span>
        <button type="button" className="es12l-buy" disabled={soldOut || !p.default_variant_id || busy} onClick={addToCart}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="20" r="1.4"/><circle cx="18" cy="20" r="1.4"/><path d="M2.5 3h2.2l2.2 12.2a1.6 1.6 0 0 0 1.6 1.3h8.9a1.6 1.6 0 0 0 1.6-1.3L21 7H6"/></svg>
          {busy ? "Přidávám…" : "Do košíku"}
        </button>
      </span>
    </Link>
  );
}

export function Eshop12Listing({ items, categories, activeCategory, basePath, currency, shopName, total, page, pages, initialBrand, initialQuery }: Props) {
  const tenantSlug = basePath.split("/")[2] ?? "";
  const active = activeCategory ? categories.find(c => c.slug === activeCategory) ?? null : null;

  // sourozenci / děti aktivní kategorie pro pill dlaždice
  const pills = useMemo(() => {
    if (!active) return categories.filter(c => c.parent_id === null && !["novinky", "akce"].includes(c.slug));
    const children = categories.filter(c => c.parent_id === active.id);
    if (children.length) return children;
    return categories.filter(c => c.parent_id === active.parent_id && c.id !== active.id);
  }, [categories, active]);

  const brands = useMemo(() => {
    const m = new Map<string, number>();
    for (const p of items) if (p.brand) m.set(p.brand, (m.get(p.brand) ?? 0) + 1);
    return [...m.entries()].sort((a, b) => b[1] - a[1]);
  }, [items]);

  const [tagStock, setTagStock] = useState(false);
  const [tagSale, setTagSale] = useState(false);
  const [tagNew, setTagNew] = useState(false);
  const [brandSel, setBrandSel] = useState<Set<string>>(() => new Set(initialBrand ? [initialBrand] : []));
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [sort, setSort] = useState<"top" | "cheap" | "expensive">("top");
  const [visible, setVisible] = useState(12);

  const filtered = useMemo(() => {
    let out = items.slice();
    if (tagStock) out = out.filter(p => p.stock_total > 0);
    if (tagSale) out = out.filter(p => (p.compare_at_max_cents ?? 0) > p.price_min_cents);
    if (tagNew) out = out.filter(p => p.is_new);
    if (brandSel.size) out = out.filter(p => p.brand && brandSel.has(p.brand));
    const mn = parseInt(priceMin, 10); const mx = parseInt(priceMax, 10);
    if (!Number.isNaN(mn)) out = out.filter(p => p.price_min_cents >= mn * 100);
    if (!Number.isNaN(mx)) out = out.filter(p => p.price_min_cents <= mx * 100);
    if (sort === "cheap") out.sort((a, b) => a.price_min_cents - b.price_min_cents);
    if (sort === "expensive") out.sort((a, b) => b.price_min_cents - a.price_min_cents);
    return out;
  }, [items, tagStock, tagSale, tagNew, brandSel, priceMin, priceMax, sort]);

  const shown = filtered.slice(0, visible);
  const saleCount = items.filter(p => (p.compare_at_max_cents ?? 0) > p.price_min_cents).length;
  const newCount = items.filter(p => p.is_new).length;
  const stockCount = items.filter(p => p.stock_total > 0).length;

  const pageHref = (n: number) => {
    const sp = new URLSearchParams();
    if (activeCategory) sp.set("kategorie", activeCategory);
    if (initialQuery) sp.set("q", initialQuery);
    if (n > 1) sp.set("strana", String(n));
    const qs = sp.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  };

  const toggleBrand = (b: string) => setBrandSel(s => { const n = new Set(s); if (n.has(b)) n.delete(b); else n.add(b); return n; });

  return (
    <div style={{ fontFamily: SANS, background: CREAM }}>
      <style>{`
        .es12l-bc { display: flex; align-items: center; gap: 7px; padding: 16px 0 4px; font-size: 12.5px; font-weight: 700; color: ${MUTED}; }
        .es12l-bc a { color: ${MUTED}; text-decoration: none; transition: color 0.13s; }
        .es12l-bc a:hover { color: ${PURPLE}; }

        .es12l-pills { display: grid; grid-template-columns: repeat(6, 1fr); gap: 10px; margin: 18px 0 22px; }
        @media (max-width: 1180px) { .es12l-pills { grid-template-columns: repeat(4, 1fr); } }
        @media (max-width: 720px) { .es12l-pills { grid-template-columns: repeat(2, 1fr); } }
        .es12l-pill { display: flex; align-items: center; gap: 10px; padding: 9px 12px; background: #fff;
          border: 1.5px solid ${BORDER}; border-radius: 14px; text-decoration: none;
          transition: transform 0.16s, box-shadow 0.16s, border-color 0.16s; }
        .es12l-pill:hover { transform: translateY(-2px); border-color: #e5d5bd; box-shadow: 0 10px 22px rgba(20,34,74,0.08); }
        .es12l-pill img { width: 38px; height: 38px; border-radius: 10px; object-fit: cover; background: ${PURPLE_SOFT}; flex-shrink: 0; }
        .es12l-pill span { font-family: ${SANS}; font-size: 12.5px; font-weight: 800; color: ${NAVY}; line-height: 1.2; }

        .es12l-layout { display: grid; grid-template-columns: 250px 1fr; gap: 26px; align-items: start; }
        @media (max-width: 980px) { .es12l-layout { grid-template-columns: 1fr; } .es12l-side { display: none; } }

        .es12l-side { background: #fff; border: 1px solid ${BORDER}; border-radius: 18px; padding: 18px; position: sticky; top: 200px; }
        .es12l-side h4 { margin: 0 0 10px; font-family: ${DISPLAY}; font-size: 15px; font-weight: 800; color: ${NAVY}; }
        .es12l-side hr { border: none; border-top: 1px solid ${BORDER}; margin: 16px 0; }
        .es12l-check { display: flex; align-items: center; gap: 9px; padding: 5px 0; font-size: 13.5px; font-weight: 600; color: ${NAVY}; cursor: pointer; }
        .es12l-check input { width: 16px; height: 16px; accent-color: ${MANGO}; cursor: pointer; }
        .es12l-check small { color: ${MUTED}; font-weight: 600; }
        .es12l-pricerow { display: flex; align-items: center; gap: 8px; }
        .es12l-pricerow input { width: 100%; height: 38px; border: 1.5px solid ${BORDER}; border-radius: 10px; padding: 0 10px;
          font-family: ${SANS}; font-size: 13.5px; font-weight: 600; color: ${NAVY}; background: ${CREAM}; }
        .es12l-pricerow input:focus { outline: none; border-color: ${PURPLE}; }

        .es12l-toolbar { display: flex; align-items: center; flex-wrap: wrap; gap: 12px; margin-bottom: 16px; }
        .es12l-sort { display: inline-flex; background: #fff; border: 1.5px solid ${BORDER}; border-radius: 999px; padding: 4px; gap: 2px; }
        .es12l-sort button { border: none; background: none; cursor: pointer; padding: 8px 16px; border-radius: 999px;
          font-family: ${DISPLAY}; font-size: 12.5px; font-weight: 800; letter-spacing: 0.05em; text-transform: uppercase;
          color: ${MUTED}; transition: background 0.14s, color 0.14s; }
        .es12l-sort button.on { background: ${NAVY}; color: #fff; }
        .es12l-count { margin-left: auto; font-size: 13px; font-weight: 700; color: ${MUTED}; }

        .es12l-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
        @media (max-width: 1180px) { .es12l-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 640px) { .es12l-grid { grid-template-columns: 1fr; } }

        .es12l-card { display: flex; flex-direction: column; background: #fff; border: 1px solid ${BORDER};
          border-radius: 18px; padding: 13px 13px 15px; text-decoration: none; position: relative;
          transition: transform 0.2s cubic-bezier(0.16,1,0.3,1), box-shadow 0.2s, border-color 0.2s; }
        .es12l-card:hover { transform: translateY(-4px); box-shadow: 0 18px 38px rgba(20,34,74,0.10); border-color: #e7dbc9; }
        .es12l-media { position: relative; aspect-ratio: 1/1; border-radius: 12px; overflow: hidden; background: #f7f2ea; }
        .es12l-media img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.45s cubic-bezier(0.16,1,0.3,1); }
        .es12l-card:hover .es12l-media img { transform: scale(1.06); }
        .es12l-badges { position: absolute; top: 9px; left: 9px; display: flex; flex-direction: column; gap: 5px; align-items: flex-start; }
        .es12l-sale { background: ${SALE}; color: #fff; border-radius: 999px; padding: 4px 10px; font-family: ${DISPLAY}; font-size: 13px; font-weight: 800; line-height: 1; }
        .es12l-new { background: ${PURPLE}; color: #fff; border-radius: 999px; padding: 4px 10px; font-family: ${DISPLAY}; font-size: 12px; font-weight: 700; line-height: 1; }
        .es12l-brand { margin-top: 10px; font-size: 11px; font-weight: 800; letter-spacing: 0.09em; text-transform: uppercase; color: ${MUTED}; }
        .es12l-title { margin-top: 2px; font-size: 14px; font-weight: 700; color: ${NAVY}; line-height: 1.35;
          overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; min-height: 2.7em; }
        .es12l-card:hover .es12l-title { color: ${PURPLE}; }
        .es12l-stars { display: flex; align-items: center; gap: 5px; margin-top: 5px; }
        .es12l-ship { margin-top: 6px; font-size: 12px; font-weight: 600; color: ${MUTED}; }
        .es12l-avail { margin-top: 2px; font-size: 12.5px; font-weight: 800; color: ${GREEN}; }
        .es12l-avail--out { color: ${SALE}; }
        .es12l-prices { display: flex; align-items: baseline; gap: 8px; margin-top: 5px; }
        .es12l-price { font-family: ${DISPLAY}; font-size: 18px; font-weight: 800; color: ${MANGO_DEEP}; }
        .es12l-compare { font-size: 12.5px; font-weight: 600; color: ${MUTED}; text-decoration: line-through; }
        .es12l-buyrow { display: flex; align-items: center; gap: 8px; margin-top: 10px; }
        .es12l-qty { display: inline-flex; align-items: center; border: 1.5px solid ${BORDER}; border-radius: 999px; background: ${CREAM}; flex-shrink: 0; }
        .es12l-qty button { border: none; background: none; cursor: pointer; width: 30px; height: 38px;
          font-size: 16px; font-weight: 800; color: ${NAVY}; transition: color 0.13s; }
        .es12l-qty button:hover { color: ${MANGO_DEEP}; }
        .es12l-qty > span { min-width: 20px; text-align: center; font-size: 13.5px; font-weight: 800; color: ${NAVY}; }
        .es12l-buy { flex: 1; display: inline-flex; align-items: center; justify-content: center; gap: 7px; height: 40px;
          border: none; border-radius: 999px; background: ${GREEN}; color: #fff; cursor: pointer;
          font-family: ${DISPLAY}; font-size: 13px; font-weight: 800; letter-spacing: 0.04em; text-transform: uppercase;
          box-shadow: 0 6px 14px rgba(22,160,106,0.26); transition: background 0.15s, transform 0.15s; }
        .es12l-buy:hover:not(:disabled) { background: ${GREEN_DEEP}; transform: translateY(-1px); }
        .es12l-buy:disabled { opacity: 0.5; cursor: not-allowed; }

        .es12l-more { display: inline-flex; align-items: center; gap: 9px; height: 50px; padding: 0 28px;
          border-radius: 999px; border: none; background: ${MANGO}; color: #fff; cursor: pointer;
          font-family: ${DISPLAY}; font-size: 15px; font-weight: 800; letter-spacing: 0.04em; text-transform: uppercase;
          box-shadow: 0 10px 24px rgba(240,110,30,0.32); transition: background 0.15s, transform 0.15s; }
        .es12l-more:hover { background: ${MANGO_DEEP}; transform: translateY(-2px); }
        .es12l-pagebtn { display: inline-flex; align-items: center; justify-content: center; min-width: 40px; height: 40px;
          padding: 0 8px; border-radius: 999px; border: 1.5px solid ${BORDER}; background: #fff;
          font-family: ${DISPLAY}; font-size: 14px; font-weight: 800; color: ${NAVY}; text-decoration: none;
          transition: background 0.14s, border-color 0.14s, color 0.14s; }
        .es12l-pagebtn:hover { border-color: ${PURPLE}; color: ${PURPLE}; }
        .es12l-pagebtn.on { background: ${PURPLE}; border-color: ${PURPLE}; color: #fff; }
      `}</style>

      {/* breadcrumb */}
      <nav className="es12l-bc" aria-label="Drobečková navigace">
        <Link href={basePath.replace(/\/obchod$/, "")}>{shopName}</Link>
        <span aria-hidden>›</span>
        <Link href={basePath}>Obchod</Link>
        {active && (<><span aria-hidden>›</span><span style={{ color: NAVY }}>{active.name}</span></>)}
      </nav>

      {/* H1 + popis */}
      <div style={{ margin: "10px 0 0" }}>
        <h1 style={{ margin: 0, fontFamily: DISPLAY, fontSize: "clamp(28px, 3vw, 40px)", fontWeight: 800, color: NAVY, lineHeight: 1.05 }}>
          {initialQuery ? `Hledání: ${initialQuery}` : active ? active.name : "Všechny produkty"}
        </h1>
        {active?.description && (
          <p style={{ margin: "8px 0 0", maxWidth: 720, fontSize: 14.5, fontWeight: 500, lineHeight: 1.6, color: MUTED }}>{active.description}</p>
        )}
      </div>

      {/* pill dlaždice podkategorií */}
      {pills.length > 0 && (
        <div className="es12l-pills">
          {pills.slice(0, 12).map(c => (
            <Link key={c.id} href={`${basePath}?kategorie=${c.slug}`} className="es12l-pill">
              {c.image_url ? <img src={c.image_url} alt="" loading="lazy" /> : <span aria-hidden style={{ width: 38, height: 38, borderRadius: 10, background: PURPLE_SOFT, flexShrink: 0 }} />}
              <span>{c.name}</span>
            </Link>
          ))}
        </div>
      )}

      <div className="es12l-layout">
        {/* SIDEBAR */}
        <aside className="es12l-side">
          <h4>Dle štítku</h4>
          <label className="es12l-check"><input type="checkbox" checked={tagStock} onChange={e => setTagStock(e.target.checked)} /> Na skladě <small>({stockCount})</small></label>
          <label className="es12l-check"><input type="checkbox" checked={tagSale} onChange={e => setTagSale(e.target.checked)} /> Akce <small>({saleCount})</small></label>
          <label className="es12l-check"><input type="checkbox" checked={tagNew} onChange={e => setTagNew(e.target.checked)} /> Novinka <small>({newCount})</small></label>
          <hr />
          <h4>Cena</h4>
          <div className="es12l-pricerow">
            <input type="number" inputMode="numeric" placeholder="od Kč" value={priceMin} onChange={e => setPriceMin(e.target.value)} aria-label="Cena od" />
            <span style={{ color: MUTED, fontWeight: 700 }}>–</span>
            <input type="number" inputMode="numeric" placeholder="do Kč" value={priceMax} onChange={e => setPriceMax(e.target.value)} aria-label="Cena do" />
          </div>
          {brands.length > 1 && (
            <>
              <hr />
              <h4>Značky</h4>
              {brands.map(([b, n]) => (
                <label key={b} className="es12l-check"><input type="checkbox" checked={brandSel.has(b)} onChange={() => toggleBrand(b)} /> {b} <small>({n})</small></label>
              ))}
            </>
          )}
        </aside>

        {/* OBSAH */}
        <div>
          <div className="es12l-toolbar">
            <div className="es12l-sort" role="tablist" aria-label="Řazení">
              <button type="button" className={sort === "top" ? "on" : ""} onClick={() => setSort("top")}>Nejprodávanější</button>
              <button type="button" className={sort === "cheap" ? "on" : ""} onClick={() => setSort("cheap")}>Nejlevnější</button>
              <button type="button" className={sort === "expensive" ? "on" : ""} onClick={() => setSort("expensive")}>Nejdražší</button>
            </div>
            <span className="es12l-count">{filtered.length} položek {filtered.length !== total ? `(z ${total} celkem)` : "celkem"}</span>
          </div>

          {shown.length === 0 ? (
            <div style={{ padding: "60px 20px", textAlign: "center", background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 18 }}>
              <p style={{ margin: 0, fontFamily: DISPLAY, fontSize: 19, fontWeight: 800, color: NAVY }}>Nic jsme nenašli 🐾</p>
              <p style={{ margin: "8px 0 0", fontSize: 14, fontWeight: 600, color: MUTED }}>Zkuste upravit filtry nebo se podívat do jiné kategorie.</p>
            </div>
          ) : (
            <div className="es12l-grid">
              {shown.map(p => <Es12ListCard key={p.id} p={p} basePath={basePath} currency={currency} tenantSlug={tenantSlug} />)}
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, padding: "26px 0 34px" }}>
            {visible < filtered.length && (
              <button type="button" className="es12l-more" onClick={() => setVisible(v => v + 12)}>
                Načíst další produkty
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12l7 7 7-7"/></svg>
              </button>
            )}
            {pages > 1 && (
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center" }}>
                {Array.from({ length: pages }, (_, i) => i + 1).slice(0, 8).map(n => (
                  <Link key={n} href={pageHref(n)} className={`es12l-pagebtn${n === page ? " on" : ""}`}>{n}</Link>
                ))}
                {pages > 8 && <span className="es12l-pagebtn" style={{ pointerEvents: "none" }}>…</span>}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
