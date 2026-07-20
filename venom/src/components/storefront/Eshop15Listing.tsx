"use client";

/**
 * Eshop15Listing — Apatyka (pilulka.cz DNA 1:1) stránka kategorie.
 * Breadcrumb → velký nadpis + popis + promo banner → chipy podkategorií
 * s počty → filtr lišta (pill dropdowny + řazení) → grid karet (cena,
 * PRO cena, Wow!, NutraRating, brand, jednotková cena, dostupnost) →
 * „Dalších N produktů" + číslované stránkování.
 */

import { useState } from "react";

const GREEN = "#064740";
const GREEN_DK = "#03332e";
const TEAL = "#0f7a5e";
const LIME_SOFT = "#c6f9ae";
const PINK = "#e6007e";
const PINK_SOFT = "#fccce6";
const MINT = "#cdeed9";
const INK = "#1c1c1c";
const MUTED = "#6f6f6f";
const LINE = "#e8e8e6";
const SYS = "-apple-system, 'system-ui', 'Segoe UI', Roboto, Arial, sans-serif";

export interface Es15ListItem {
  id: number;
  slug: string;
  title: string;
  subtitle: string | null;
  brand: string | null;
  image_url: string | null;
  price_min_cents: number;
  compare_at_max_cents: number | null;
  default_variant_id: number | null;
  pro_cents: number | null;
  rating: string | null;
  cashback: boolean;
}

export interface Es15Category {
  id: number;
  slug: string;
  name: string;
  parent_id: number | null;
  product_count: number;
}

interface Props {
  items: Es15ListItem[];
  categories: Es15Category[];
  activeCategory: string | null;
  categoryName: string;
  categoryDescription: string | null;
  basePath: string;
  tenantSlug: string;
  currency: string;
  total: number;
  page: number;
  pages: number;
  perPage: number;
  deliveryText?: string;
}

const FILTERS = ["Cena", "Akce a slevy", "Kvalita složení (NutraRating)", "Hodnocení", "Značky", "Velikost balení", "Pro", "Forma"];

function ratingColor(r: string) {
  return r.startsWith("A") ? "#7ac143" : r.startsWith("B") ? "#b5c227" : "#f0b429";
}

export function Eshop15Listing({
  items, categories, activeCategory, categoryName, categoryDescription,
  basePath, tenantSlug, currency, total, page, pages, perPage,
  deliveryText = "Zítra od 07:00 u vás",
}: Props) {
  const [adding, setAdding] = useState<string | null>(null);
  const [added, setAdded] = useState<string | null>(null);

  const fmt = (cents: number) =>
    new Intl.NumberFormat("cs-CZ", { style: "currency", currency, maximumFractionDigits: 0 }).format(cents / 100);

  const active = activeCategory ? categories.find((c) => c.slug === activeCategory) : null;
  const chips = active
    ? categories.filter((c) => c.parent_id === active.id)
    : categories.filter((c) => !c.parent_id);
  const catHref = (slug: string) => `${basePath}?kategorie=${slug}`;
  const pageHref = (n: number) => `${basePath}?${activeCategory ? `kategorie=${activeCategory}&` : ""}strana=${n}`;

  const quickAdd = (e: React.MouseEvent, it: Es15ListItem) => {
    e.preventDefault();
    e.stopPropagation();
    if (!it.default_variant_id || adding) return;
    setAdding(it.slug);
    fetch(`/api/demo/${tenantSlug}/shop/cart/items`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ variant_id: it.default_variant_id, qty: 1 }),
    })
      .then(() => {
        window.dispatchEvent(new Event("webero-cart-item-added"));
        setAdded(it.slug);
        setTimeout(() => setAdded((cur) => (cur === it.slug ? null : cur)), 1600);
      })
      .finally(() => setAdding(null));
  };

  const remaining = Math.max(0, total - page * perPage);

  return (
    <div style={{ fontFamily: SYS, background: "#fff" }}>
      <style>{`
        .es15l-wrap { max-width: 1420px; margin: 0 auto; padding: 0 28px 46px; }
        .es15l-crumb { display: flex; align-items: center; gap: 8px; padding: 16px 0 4px; font-size: 13px; color: ${MUTED}; }
        .es15l-crumb a { color: ${MUTED}; text-decoration: none; }
        .es15l-crumb a:hover { color: ${GREEN}; text-decoration: underline; text-underline-offset: 3px; }

        .es15l-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 40px; padding: 10px 0 22px; }
        .es15l-desc { max-width: 560px; font-size: 14.5px; line-height: 1.6; color: #444; margin: 12px 0 0; }
        .es15l-banner { flex: 0 0 420px; height: 128px; border-radius: 14px; overflow: hidden; position: relative; text-decoration: none;
          background: linear-gradient(120deg, #bcd9ee 0%, #d8e9f5 60%, #eef6fb 100%); display: flex; flex-direction: column; justify-content: center; padding: 0 26px; }
        .es15l-banner:hover .es15l-banner-cta { background: ${GREEN_DK}; }
        @media (max-width: 1023px) { .es15l-banner { display: none; } }

        .es15l-chips { display: grid; grid-template-columns: repeat(auto-fill, minmax(215px, 1fr)); gap: 10px; padding-bottom: 22px; }
        .es15l-chip { display: flex; align-items: center; gap: 11px; border: 1px solid ${LINE}; border-radius: 12px; padding: 11px 14px;
          text-decoration: none; background: #fff; transition: border-color 0.14s, box-shadow 0.16s; }
        .es15l-chip:hover { border-color: ${GREEN}; box-shadow: 0 6px 16px rgba(6,71,64,0.08); }
        .es15l-chip-ico { width: 34px; height: 34px; border-radius: 999px; background: ${MINT}; color: ${GREEN}; display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .es15l-chip-name { font-size: 13.5px; font-weight: 600; color: ${INK}; line-height: 1.25; }
        .es15l-chip-count { font-size: 12px; color: ${MUTED}; }

        .es15l-filters { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; padding: 14px 0; border-top: 1px solid ${LINE}; }
        .es15l-filter { display: inline-flex; align-items: center; gap: 7px; height: 36px; padding: 0 14px; border: 1px solid #cfd4cf; border-radius: 999px;
          background: #fff; color: ${INK}; font-size: 13.5px; font-weight: 500; cursor: pointer; font-family: ${SYS}; white-space: nowrap; transition: border-color 0.13s, background 0.13s; }
        .es15l-filter:hover { border-color: ${GREEN}; background: #f4faf6; }
        .es15l-sort { margin-left: auto; display: inline-flex; align-items: center; gap: 7px; font-size: 13.5px; font-weight: 600; color: ${GREEN}; cursor: pointer; white-space: nowrap; }

        .es15l-count { font-size: 13.5px; color: ${MUTED}; padding: 4px 0 16px; }

        .es15l-grid { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 22px 14px; }
        @media (max-width: 1200px) { .es15l-grid { grid-template-columns: repeat(4, minmax(0, 1fr)); } }
        @media (max-width: 900px) { .es15l-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); } }
        @media (max-width: 640px) { .es15l-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }

        .es15l-card { text-decoration: none; display: flex; flex-direction: column; }
        .es15l-media { position: relative; aspect-ratio: 1/1; border: 1px solid ${LINE}; border-radius: 12px; overflow: hidden; background: #fff; transition: box-shadow 0.22s, border-color 0.18s; }
        .es15l-card:hover .es15l-media { border-color: transparent; box-shadow: 0 14px 30px rgba(6,71,64,0.14); }
        .es15l-media img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; transition: transform 0.45s cubic-bezier(0.16,1,0.3,1); }
        .es15l-card:hover .es15l-media img { transform: scale(1.05); }
        .es15l-cashback { position: absolute; top: 9px; right: 9px; background: ${GREEN}; color: #fff; font-size: 11px; font-weight: 700; padding: 5px 10px; border-radius: 999px; line-height: 1; }
        .es15l-add { position: absolute; right: 10px; bottom: 10px; width: 40px; height: 40px; border-radius: 999px; border: none; cursor: pointer;
          background: ${GREEN}; color: #fff; display: inline-flex; align-items: center; justify-content: center; transition: background 0.15s, transform 0.14s; }
        .es15l-add:hover { background: ${GREEN_DK}; transform: scale(1.08); }
        .es15l-add[disabled] { opacity: 0.6; cursor: default; transform: none; }
        .es15l-add.is-added { background: #2fb26a; }

        .es15l-priceline { display: flex; align-items: center; gap: 7px; margin-top: 10px; min-height: 24px; flex-wrap: wrap; }
        .es15l-price { font-size: 16px; font-weight: 800; color: ${INK}; letter-spacing: -0.01em; white-space: nowrap; }
        .es15l-sale { display: inline-flex; align-items: center; gap: 6px; background: ${PINK}; color: #fff; font-size: 13px; font-weight: 800; padding: 4px 8px; border-radius: 6px; line-height: 1.2; white-space: nowrap; }
        .es15l-sale s { font-weight: 500; opacity: 0.75; font-size: 11.5px; }
        .es15l-wow { background: ${PINK_SOFT}; color: #b3005f; font-size: 11.5px; font-weight: 800; padding: 4px 8px; border-radius: 6px; line-height: 1.2; }
        .es15l-pro { display: inline-flex; margin-top: 5px; background: ${LIME_SOFT}; color: ${GREEN}; font-size: 12px; font-weight: 700; padding: 4px 8px; border-radius: 6px; line-height: 1.2; align-self: flex-start; }
        .es15l-brand { margin-top: 7px; font-size: 13px; font-weight: 600; color: ${TEAL}; text-decoration: underline; text-underline-offset: 3px; align-self: flex-start; }
        .es15l-title { margin-top: 4px; font-size: 14px; font-weight: 500; color: ${INK}; line-height: 1.35; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; min-height: 2.7em; transition: color 0.14s; }
        .es15l-card:hover .es15l-title { color: ${GREEN}; }
        .es15l-rating { display: inline-flex; align-items: center; gap: 6px; margin-top: 5px; font-size: 12px; color: ${INK}; }
        .es15l-rating b { font-size: 11px; font-weight: 800; color: #fff; padding: 3px 6px; border-radius: 5px; line-height: 1; }
        .es15l-sub { margin-top: 3px; font-size: 12px; color: ${MUTED}; line-height: 1.35; }
        .es15l-ship { display: inline-flex; align-items: center; gap: 6px; margin-top: 8px; font-size: 12px; font-weight: 600; color: #159a62; }

        .es15l-morebtn { display: inline-flex; align-items: center; gap: 9px; height: 44px; padding: 0 24px; border: 1px solid #cfd4cf; border-radius: 999px;
          background: #fff; color: ${GREEN}; font-size: 14px; font-weight: 600; text-decoration: none; transition: background 0.14s, border-color 0.14s; }
        .es15l-morebtn:hover { background: ${MINT}; border-color: ${MINT}; }
        .es15l-page { display: inline-flex; align-items: center; justify-content: center; min-width: 36px; height: 36px; padding: 0 8px; border-radius: 999px;
          font-size: 13.5px; font-weight: 600; color: ${INK}; text-decoration: none; transition: background 0.13s; }
        .es15l-page:hover { background: #eef3ef; }
        .es15l-page.on { background: ${GREEN}; color: #fff; }

        @media (prefers-reduced-motion: reduce) {
          .es15l-media, .es15l-media img, .es15l-add, .es15l-chip, .es15l-filter { transition: none !important; }
          .es15l-card:hover .es15l-media img { transform: none; }
        }
      `}</style>

      <div className="es15l-wrap">
        {/* Breadcrumb */}
        <nav className="es15l-crumb" aria-label="Drobečková navigace">
          <a href={`/demo/${tenantSlug}`}>Domů</a>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 6 6 6-6 6"/></svg>
          <span style={{ color: INK, fontWeight: 500 }}>{categoryName}</span>
        </nav>

        {/* Nadpis + popis + promo banner */}
        <div className="es15l-head">
          <div>
            <h1 style={{ margin: 0, fontFamily: SYS, fontSize: "clamp(30px, 3vw, 42px)", fontWeight: 800, letterSpacing: "-0.02em", color: GREEN, lineHeight: 1.1 }}>{categoryName}</h1>
            {categoryDescription && <p className="es15l-desc">{categoryDescription}</p>}
          </div>
          <a href={catHref("dermokosmetika")} className="es15l-banner">
            <span style={{ position: "absolute", right: 22, top: 16, background: PINK_SOFT, color: "#b3005f", fontSize: 13, fontWeight: 800, padding: "6px 11px", borderRadius: 999 }}>−20 %</span>
            <span style={{ fontSize: 21, fontWeight: 800, letterSpacing: "-0.01em", color: "#123c56" }}>Dermia Laboratoires</span>
            <span style={{ fontSize: 13.5, color: "#2b4d63", marginTop: 3 }}>Dermokosmetická péče pro lepší život</span>
            <span className="es15l-banner-cta" style={{ display: "inline-flex", alignSelf: "flex-start", marginTop: 12, background: GREEN, color: "#fff", fontSize: 13, fontWeight: 700, padding: "8px 16px", borderRadius: 999, transition: "background 0.15s" }}>Objevit</span>
          </a>
        </div>

        {/* Chipy podkategorií */}
        {chips.length > 0 && (
          <div className="es15l-chips">
            {chips.map((c) => (
              <a key={c.id} href={catHref(c.slug)} className="es15l-chip">
                <span className="es15l-chip-ico">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3.5 13.8 9l5.7 1.8-5.7 1.8L12 18.2l-1.8-5.6L4.5 10.8 10.2 9 12 3.5Z"/></svg>
                </span>
                <span>
                  <span className="es15l-chip-name">{c.name}</span>{" "}
                  <span className="es15l-chip-count">({c.product_count})</span>
                </span>
              </a>
            ))}
          </div>
        )}

        {/* Filtr lišta */}
        <div className="es15l-filters">
          {FILTERS.map((f) => (
            <button key={f} type="button" className="es15l-filter">
              {f}
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
            </button>
          ))}
          <span className="es15l-sort">
            Podle oblíbenosti
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
          </span>
        </div>

        <div className="es15l-count">{total} produktů</div>

        {/* Grid produktů */}
        {items.length === 0 ? (
          <div style={{ padding: "50px 0", color: MUTED, fontSize: 15 }}>V této kategorii zatím nejsou žádné produkty.</div>
        ) : (
          <div className="es15l-grid">
            {items.map((it) => {
              const sale = it.compare_at_max_cents != null && it.compare_at_max_cents > it.price_min_cents;
              return (
                <a key={it.id} className="es15l-card" href={`${basePath}/${it.slug}`}>
                  <div className="es15l-media">
                    {it.image_url && <img src={it.image_url} alt={it.title} loading="lazy" />}
                    {it.cashback && <span className="es15l-cashback">Cashback</span>}
                    <button
                      className={`es15l-add${added === it.slug ? " is-added" : ""}`}
                      disabled={adding === it.slug || !it.default_variant_id}
                      onClick={(e) => quickAdd(e, it)}
                      aria-label={`Přidat ${it.title} do košíku`}
                    >
                      {added === it.slug ? (
                        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                      ) : (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
                      )}
                    </button>
                  </div>

                  <span className="es15l-priceline">
                    {sale ? (
                      <>
                        <span className="es15l-sale">{fmt(it.price_min_cents)} <s>{fmt(it.compare_at_max_cents!)}</s></span>
                        <span className="es15l-wow">Wow!</span>
                      </>
                    ) : (
                      <span className="es15l-price">{fmt(it.price_min_cents)}</span>
                    )}
                  </span>
                  {it.pro_cents != null && <span className="es15l-pro">{fmt(it.pro_cents)} s apatyka PRO</span>}

                  {it.brand && <span className="es15l-brand">{it.brand}</span>}
                  <span className="es15l-title">{it.title}</span>
                  {it.rating && <span className="es15l-rating">NutraRating <b style={{ background: ratingColor(it.rating) }}>{it.rating}</b></span>}
                  {it.subtitle && <span className="es15l-sub">{it.subtitle}</span>}
                  <span className="es15l-ship">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M5 17h-2v-11a1 1 0 0 1 1 -1h9v12m-4 0h6m4 0h2v-6h-8m0 -5h5l3 5"/><circle cx="7.5" cy="17.5" r="2"/><circle cx="17.5" cy="17.5" r="2"/></svg>
                    {deliveryText}
                  </span>
                </a>
              );
            })}
          </div>
        )}

        {/* Stránkování */}
        {pages > 1 && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 22, paddingTop: 36, flexWrap: "wrap" }}>
            {page < pages && (
              <a href={pageHref(page + 1)} className="es15l-morebtn">
                Dalších {Math.min(perPage, remaining)} produktů
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
              </a>
            )}
            <span style={{ display: "inline-flex", gap: 4 }}>
              {Array.from({ length: Math.min(5, pages) }, (_, i) => i + 1).map((n) => (
                <a key={n} href={pageHref(n)} className={`es15l-page${n === page ? " on" : ""}`}>{n}</a>
              ))}
              {pages > 5 && <span className="es15l-page" style={{ cursor: "default" }}>…</span>}
              {pages > 5 && <a href={pageHref(pages)} className="es15l-page">{pages}</a>}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
