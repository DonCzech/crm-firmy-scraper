"use client";

/**
 * eshop-14 "Zahradia" — kategorie/listing (smaragdová identita, Poppins).
 *
 * Struktura dle mountfield kategorie reference (prace/eshop/mountfield/kategorie*.pdf),
 * vizuál vlastní: breadcrumb → H1 + popis kategorie s odkazem na rádce →
 * dlaždice podkategorií s počty → levý sidebar filtrů (Dostupnost, Cena od–do,
 * Značka, Jen akce) | řadicí lišta (Doporučujeme / Novinky / Nejprodávanější /
 * Nejlevnější / Nejdražší + počet) → 3sloupcový grid karet (badge AKCE /
 * NOVINKA / DOPRAVA ZDARMA, titulek, hvězdičky, parametry, „Loňská cena“
 * přeškrtnutá + smaragdová cena, skladovost e-shop + prodejny, DO KOŠÍKU
 * s quick-add) → Načíst další.
 */

import Link from "next/link";
import React, { useMemo, useState } from "react";
import type { ProductItem } from "./ProductListing";

export type Es14Item = ProductItem & { default_variant_id?: number | null };

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
  items: Es14Item[];
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

const SANS = "'Poppins','Segoe UI',Arial,sans-serif";
const EMERALD = "#1f7a4e";
const EMERALD_DK = "#175e3c";
const INK = "#30363b";
const MUTED = "#7a8187";
const LINE = "#e2e5e7";
const GREY = "#f4f5f6";
const TERRA = "#d96f32";
const STAR = "#f2a90a";
const STOCK = "#259455";

function czk(cents: number, currency = "CZK"): string {
  return new Intl.NumberFormat("cs-CZ", { style: "currency", currency, maximumFractionDigits: 0 }).format(cents / 100);
}

function pct(price: number, compare: number | null | undefined): number | null {
  if (!compare || compare <= price) return null;
  return Math.round((1 - price / compare) * 100);
}

function Stars({ seed }: { seed: number }) {
  const rating = (42 + (seed % 9)) / 10;
  const count = 2 + (seed % 31);
  const full = Math.round(rating);
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
      <span style={{ display: "inline-flex", gap: 1.5 }}>
        {[1, 2, 3, 4, 5].map((st) => (
          <svg key={st} width="13" height="13" viewBox="0 0 24 24" fill={st <= full ? STAR : "#d9dcde"}><path d="M12 2l2.9 6.3 6.9.8-5.1 4.7 1.4 6.8L12 17.2 5.9 20.6l1.4-6.8L2.2 9.1l6.9-.8L12 2z" /></svg>
        ))}
      </span>
      <span style={{ fontSize: 12, color: MUTED }}>({count})</span>
    </span>
  );
}

function Es14Card({ p, basePath, currency, tenantSlug }: { p: Es14Item; basePath: string; currency: string; tenantSlug: string }) {
  const [busy, setBusy] = useState(false);
  const soldOut = p.stock_total <= 0;
  const lastPieces = !soldOut && p.stock_total <= 5;
  const disc = pct(p.price_min_cents, p.compare_at_max_cents);
  const onSale = disc != null;
  const freeShip = p.price_min_cents >= 299000;
  const stores = 4 + (p.id % 51);

  const quickAdd = (e: React.MouseEvent) => {
    if (!p.default_variant_id || soldOut) return; // proklik na detail
    e.preventDefault();
    setBusy(true);
    fetch(`/api/demo/${tenantSlug}/shop/cart/items`, {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ variant_id: p.default_variant_id, qty: 1 }),
    })
      .then(() => window.dispatchEvent(new Event("webero-cart-item-added")))
      .finally(() => setBusy(false));
  };

  return (
    <Link href={`${basePath}/${p.slug}`} className="es14l-card">
      <span className="es14l-media">
        {p.image_url ? <img src={p.image_url} alt={p.title} loading="lazy" /> : <span style={{ display: "block", width: "100%", height: "100%", background: GREY }} />}
        <span className="es14l-chips">
          {onSale && <span className="es14l-chip" style={{ background: TERRA }}>AKCE</span>}
          {p.is_featured && !onSale && !soldOut && <span className="es14l-chip" style={{ background: EMERALD }}>NOVINKA</span>}
          {freeShip && !soldOut && <span className="es14l-chip" style={{ background: "#43484d" }}>DOPRAVA ZDARMA</span>}
          {soldOut && <span className="es14l-chip" style={{ background: "#9aa0a5" }}>VYPRODÁNO</span>}
        </span>
      </span>

      <span className="es14l-title">{p.title}</span>
      <Stars seed={p.id} />
      <span className="es14l-params">
        {p.brand && <span><span style={{ color: MUTED }}>Značka</span> {p.brand}</span>}
        {p.subtitle && <span className="es14l-sub">{p.subtitle}</span>}
      </span>

      <span className="es14l-pricebox">
        {onSale && p.compare_at_max_cents && (
          <span className="es14l-lastyear">Loňská cena: <s>{czk(p.compare_at_max_cents, currency)}</s></span>
        )}
        <span style={{ display: "flex", alignItems: "center", gap: 9 }}>
          <span className="es14l-price">{czk(p.price_min_cents, currency)}</span>
          {onSale && disc && <span className="es14l-pct">−{disc} %</span>}
        </span>
      </span>

      <span className="es14l-stockrows">
        <span style={{ color: soldOut ? MUTED : STOCK, fontWeight: 600 }}>
          {soldOut ? "Není skladem v e-shopu" : lastPieces ? `Skladem poslední ${p.stock_total} ks` : "Skladem > 5 kusů"}
        </span>
        <span style={{ color: MUTED }}>Skladem v {stores} prodejnách</span>
      </span>

      <span
        className={`es14l-btn${soldOut ? " es14l-btn--out" : ""}`}
        onClick={quickAdd}
        style={{ opacity: busy ? 0.6 : 1 }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="20" r="1.4"/><circle cx="17.5" cy="20" r="1.4"/><path d="M2.5 3.5h2.6l2.5 12h10.2l2.2-8.5H6.2"/></svg>
        {soldOut ? "Detail produktu" : "DO KOŠÍKU"}
      </span>
    </Link>
  );
}

export function Eshop14Listing({ items, categories, activeCategory, basePath, currency, shopName, total, initialBrand, initialQuery }: Props) {
  const tenantSlug = basePath.split("/")[2] ?? "";
  const [sort, setSort] = useState<"rec" | "new" | "best" | "cheap" | "exp">("rec");
  const [stockOnly, setStockOnly] = useState(false);
  const [saleOnly, setSaleOnly] = useState(false);
  const [brandSel, setBrandSel] = useState<string[]>(initialBrand ? [initialBrand] : []);
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [shown, setShown] = useState(21);

  const active = categories.find((c) => c.slug === activeCategory) ?? null;
  const parent = active?.parent_id ? categories.find((c) => c.id === active.parent_id) : null;

  const subcats = useMemo(() => {
    if (active) {
      const kids = categories.filter((c) => c.parent_id === active.id && c.product_count > 0);
      if (kids.length) return kids;
      const pid = active.parent_id;
      return pid ? categories.filter((c) => c.parent_id === pid && c.product_count > 0) : [];
    }
    return categories.filter((c) => !c.parent_id && !["novinky", "akce"].includes(c.slug) && c.product_count > 0);
  }, [categories, active]);

  const brands = useMemo(() => Array.from(new Set(items.map((p) => p.brand).filter((b): b is string => !!b))).sort(), [items]);

  const visible = useMemo(() => {
    let list = items;
    if (stockOnly) list = list.filter((p) => p.stock_total > 0);
    if (saleOnly) list = list.filter((p) => pct(p.price_min_cents, p.compare_at_max_cents) != null);
    if (brandSel.length) list = list.filter((p) => p.brand && brandSel.includes(p.brand));
    const mn = Number(priceMin) * 100, mx = Number(priceMax) * 100;
    if (priceMin && mn > 0) list = list.filter((p) => p.price_min_cents >= mn);
    if (priceMax && mx > 0) list = list.filter((p) => p.price_min_cents <= mx);
    if (sort === "cheap") list = [...list].sort((a, b) => a.price_min_cents - b.price_min_cents);
    if (sort === "exp") list = [...list].sort((a, b) => b.price_min_cents - a.price_min_cents);
    if (sort === "new") list = [...list].sort((a, b) => b.id - a.id);
    if (sort === "best") list = [...list].sort((a, b) => (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0) || a.id - b.id);
    return list;
  }, [items, stockOnly, saleOnly, brandSel, priceMin, priceMax, sort]);

  const shownItems = visible.slice(0, shown);
  const hasMore = visible.length > shown;

  const sortOptions: Array<{ key: typeof sort; label: string }> = [
    { key: "rec", label: "Doporučujeme" },
    { key: "new", label: "Novinky" },
    { key: "best", label: "Nejprodávanější" },
    { key: "cheap", label: "Nejlevnější" },
    { key: "exp", label: "Nejdražší" },
  ];

  const toggleBrand = (b: string) => setBrandSel((cur) => (cur.includes(b) ? cur.filter((x) => x !== b) : [...cur, b]));

  const heading = initialQuery
    ? `Hledání: „${initialQuery}“`
    : active?.name ?? "Všechny produkty";

  return (
    <div style={{ fontFamily: SANS, color: INK }}>
      <style>{`
        .es14l-crumbs { display: flex; align-items: center; flex-wrap: wrap; gap: 7px; padding: 16px 0 10px; font-size: 12.5px; color: ${MUTED}; }
        .es14l-crumbs a { color: ${MUTED}; text-decoration: none; }
        .es14l-crumbs a:hover { color: ${EMERALD}; text-decoration: underline; }

        .es14l-h1 { font-size: clamp(24px, 2.6vw, 32px); font-weight: 700; letter-spacing: 0.01em; margin: 4px 0 10px; color: ${INK}; text-transform: uppercase; }
        .es14l-desc { max-width: 880px; font-size: 13.5px; line-height: 1.65; color: ${MUTED}; margin: 0 0 6px; }
        .es14l-hint { display: inline-flex; align-items: center; gap: 6px; font-size: 13px; font-weight: 600; color: ${EMERALD}; text-decoration: none; }
        .es14l-hint:hover { text-decoration: underline; }

        .es14l-subs { display: flex; flex-wrap: wrap; gap: 9px; margin: 18px 0 6px; }
        .es14l-sub-pill { display: inline-flex; align-items: center; gap: 7px; padding: 10px 16px; border: 1px solid ${LINE}; border-radius: 4px;
          font-size: 13px; font-weight: 600; color: ${INK}; text-decoration: none; text-transform: uppercase; letter-spacing: 0.02em; background: #fff;
          transition: border-color 0.14s, color 0.14s, background 0.14s; }
        .es14l-sub-pill:hover { border-color: ${EMERALD}; color: ${EMERALD}; }
        .es14l-sub-pill.on { background: ${EMERALD}; border-color: ${EMERALD}; color: #fff; }
        .es14l-sub-pill em { font-style: normal; font-weight: 500; opacity: 0.65; font-size: 12px; }

        .es14l-layout { display: grid; grid-template-columns: 250px 1fr; gap: 30px; align-items: start; margin-top: 18px; }
        @media (max-width: 1000px) { .es14l-layout { grid-template-columns: 1fr; } .es14l-side { display: none; } }

        .es14l-side { border: 1px solid ${LINE}; border-radius: 6px; overflow: hidden; }
        .es14l-side-head { background: ${EMERALD}; color: #fff; font-size: 13px; font-weight: 700; letter-spacing: 0.06em; padding: 12px 16px; text-transform: uppercase; }
        .es14l-fblock { padding: 14px 16px; border-top: 1px solid ${LINE}; }
        .es14l-fblock:first-of-type { border-top: none; }
        .es14l-flabel { font-size: 12px; font-weight: 700; letter-spacing: 0.05em; text-transform: uppercase; color: ${INK}; margin-bottom: 10px; }
        .es14l-check { display: flex; align-items: center; gap: 9px; padding: 5px 0; font-size: 13.5px; color: ${INK}; cursor: pointer; }
        .es14l-check input { accent-color: ${EMERALD}; width: 15px; height: 15px; cursor: pointer; }
        .es14l-price-inputs { display: flex; align-items: center; gap: 8px; }
        .es14l-price-inputs input { width: 100%; height: 38px; border: 1px solid ${LINE}; border-radius: 4px; padding: 0 10px; font-size: 13.5px; font-family: ${SANS}; color: ${INK}; outline: none; }
        .es14l-price-inputs input:focus { border-color: ${EMERALD}; }

        .es14l-sortbar { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; padding: 10px 14px; background: ${GREY}; border-radius: 6px; margin-bottom: 18px; }
        .es14l-sort { border: none; background: none; cursor: pointer; font-family: ${SANS}; font-size: 13px; font-weight: 600; color: ${MUTED}; padding: 7px 12px; border-radius: 4px; transition: color 0.13s, background 0.13s; }
        .es14l-sort:hover { color: ${INK}; }
        .es14l-sort.on { background: #fff; color: ${EMERALD}; box-shadow: 0 1px 4px rgba(0,0,0,0.08); }
        .es14l-count { margin-left: auto; font-size: 12.5px; color: ${MUTED}; }

        .es14l-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 18px; }
        @media (max-width: 1240px) { .es14l-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 640px) { .es14l-grid { grid-template-columns: 1fr; } }

        .es14l-card { display: flex; flex-direction: column; border: 1px solid ${LINE}; border-radius: 6px; background: #fff; padding: 14px 16px 16px;
          text-decoration: none; color: ${INK}; transition: box-shadow 0.16s, transform 0.16s, border-color 0.16s; }
        .es14l-card:hover { border-color: #c6cbcf; box-shadow: 0 16px 34px rgba(48,54,59,0.12); transform: translateY(-3px); }
        .es14l-media { position: relative; aspect-ratio: 1/1; overflow: hidden; border-radius: 4px; background: ${GREY}; }
        .es14l-media img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.45s cubic-bezier(0.16,1,0.3,1); }
        .es14l-card:hover .es14l-media img { transform: scale(1.05); }
        .es14l-chips { position: absolute; top: 8px; left: 8px; display: flex; flex-direction: column; align-items: flex-start; gap: 5px; }
        .es14l-chip { padding: 5px 9px; border-radius: 3px; font-size: 10.5px; font-weight: 700; letter-spacing: 0.06em; color: #fff; line-height: 1; }

        .es14l-title { margin-top: 12px; font-size: 14.5px; font-weight: 600; line-height: 1.35; text-transform: uppercase; letter-spacing: 0.01em;
          overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; min-height: 2.7em; transition: color 0.13s; }
        .es14l-card:hover .es14l-title { color: ${EMERALD}; }
        .es14l-params { display: flex; flex-direction: column; gap: 2px; margin-top: 7px; font-size: 12.5px; color: ${INK}; min-height: 34px; }
        .es14l-sub { color: ${MUTED}; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; }

        .es14l-pricebox { margin-top: 9px; display: flex; flex-direction: column; gap: 2px; min-height: 46px; justify-content: flex-end; }
        .es14l-lastyear { font-size: 12px; color: ${MUTED}; }
        .es14l-price { font-size: 20px; font-weight: 700; color: ${EMERALD_DK}; }
        .es14l-pct { background: ${TERRA}; color: #fff; font-size: 11.5px; font-weight: 700; padding: 3px 7px; border-radius: 3px; line-height: 1; }

        .es14l-stockrows { display: flex; flex-direction: column; gap: 1px; margin-top: 8px; font-size: 12px; min-height: 34px; }

        .es14l-btn { display: flex; align-items: center; justify-content: center; gap: 8px; height: 42px; margin-top: 11px; border-radius: 4px;
          background: ${EMERALD}; color: #fff; font-size: 13px; font-weight: 700; letter-spacing: 0.04em; transition: background 0.14s; }
        .es14l-btn:hover { background: ${EMERALD_DK}; }
        .es14l-btn--out { background: #fff; color: ${INK}; border: 1px solid ${LINE}; }
        .es14l-btn--out:hover { background: ${GREY}; }

        .es14l-more { display: block; margin: 26px auto 8px; border: 1.5px solid ${EMERALD}; background: #fff; color: ${EMERALD_DK}; cursor: pointer;
          font-family: ${SANS}; font-size: 13.5px; font-weight: 700; letter-spacing: 0.04em; padding: 12px 34px; border-radius: 4px; transition: background 0.14s, color 0.14s; }
        .es14l-more:hover { background: ${EMERALD}; color: #fff; }

        .es14l-empty { padding: 60px 20px; text-align: center; color: ${MUTED}; font-size: 14.5px; }
      `}</style>

      {/* Breadcrumb */}
      <nav className="es14l-crumbs" aria-label="Drobečková navigace">
        <Link href={`/demo/${tenantSlug}`}>Domů</Link>
        <span aria-hidden>›</span>
        <Link href={basePath.replace(/\/obchod$/, "/obchod")}>E-shop</Link>
        {parent && (<><span aria-hidden>›</span><Link href={`${basePath}?kategorie=${parent.slug}`}>{parent.name}</Link></>)}
        {active && (<><span aria-hidden>›</span><span style={{ color: INK, fontWeight: 600 }}>{active.name}</span></>)}
      </nav>

      {/* H1 + popis */}
      <h1 className="es14l-h1">{heading}</h1>
      {active?.description && <p className="es14l-desc">{active.description}</p>}
      {active && (
        <Link href={`/demo/${tenantSlug}/poradna`} className="es14l-hint">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><path d="M9.5 9.3a2.5 2.5 0 1 1 3.6 2.2c-.8.4-1.1 1-1.1 1.8v.4"/><circle cx="12" cy="17" r="0.4" fill="currentColor"/></svg>
          Jak vybrat? Poradíme v Zahradním rádci
        </Link>
      )}

      {/* Podkategorie */}
      {subcats.length > 1 && (
        <div className="es14l-subs">
          {subcats.map((c) => (
            <Link key={c.slug} href={`${basePath}?kategorie=${c.slug}`} className={`es14l-sub-pill${c.slug === activeCategory ? " on" : ""}`}>
              {c.name} <em>({c.product_count})</em>
            </Link>
          ))}
        </div>
      )}

      <div className="es14l-layout">
        {/* Sidebar filtrů */}
        <aside className="es14l-side">
          <div className="es14l-side-head">Filtrace produktů</div>
          <div className="es14l-fblock">
            <div className="es14l-flabel">Dostupnost</div>
            <label className="es14l-check">
              <input type="checkbox" checked={stockOnly} onChange={(e) => setStockOnly(e.target.checked)} />
              Skladem v e-shopu
            </label>
            <label className="es14l-check">
              <input type="checkbox" checked={saleOnly} onChange={(e) => setSaleOnly(e.target.checked)} />
              Jen akční nabídky
            </label>
          </div>
          <div className="es14l-fblock">
            <div className="es14l-flabel">Cena</div>
            <div className="es14l-price-inputs">
              <input type="number" inputMode="numeric" placeholder="Od" value={priceMin} onChange={(e) => setPriceMin(e.target.value)} aria-label="Cena od" />
              <span style={{ color: MUTED }}>–</span>
              <input type="number" inputMode="numeric" placeholder="Do" value={priceMax} onChange={(e) => setPriceMax(e.target.value)} aria-label="Cena do" />
              <span style={{ fontSize: 13, color: MUTED }}>Kč</span>
            </div>
          </div>
          {brands.length > 1 && (
            <div className="es14l-fblock">
              <div className="es14l-flabel">Značka</div>
              {brands.map((b) => (
                <label key={b} className="es14l-check">
                  <input type="checkbox" checked={brandSel.includes(b)} onChange={() => toggleBrand(b)} />
                  {b}
                </label>
              ))}
            </div>
          )}
        </aside>

        {/* Výpis */}
        <div>
          <div className="es14l-sortbar">
            <span style={{ fontSize: 12.5, color: MUTED, marginRight: 4 }}>Řadit podle</span>
            {sortOptions.map((o) => (
              <button key={o.key} className={`es14l-sort${sort === o.key ? " on" : ""}`} onClick={() => setSort(o.key)}>{o.label}</button>
            ))}
            <span className="es14l-count">1–{Math.min(shown, visible.length)} z {visible.length}</span>
          </div>

          {shownItems.length === 0 ? (
            <div className="es14l-empty">Zadaným filtrům neodpovídá žádný produkt. Zkuste filtry uvolnit.</div>
          ) : (
            <div className="es14l-grid">
              {shownItems.map((p) => (
                <Es14Card key={p.id} p={p} basePath={basePath} currency={currency} tenantSlug={tenantSlug} />
              ))}
            </div>
          )}

          {hasMore && (
            <button className="es14l-more" onClick={() => setShown((n) => n + 21)}>NAČÍST DALŠÍ PRODUKTY</button>
          )}
        </div>
      </div>
    </div>
  );
}
