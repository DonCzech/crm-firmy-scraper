"use client";

/**
 * Eshop18Listing — Oktan (autokelly.cz DNA, carbon & signal) stránka kategorie.
 * Breadcrumb → Archivo italic H1 + popis → chipy podkategorií s počty (žlutý
 * blesk čip) → filtr lišta dle AK listingu (Skladem/Akce/Výprodej toggle chipy
 * + pill dropdowny Výrobce/Balení/Specifikace + řazení vpravo) → grid karet
 * v Oktan anatomii (skosené badge −%/TOP/Novinka, žlutý quick-add, brand,
 * skladovost s tečkou, cena + s DPH) → „Dalších N produktů" + stránkování.
 */

import { useState } from "react";

const HEAD = "'Archivo', 'Arial Black', sans-serif";
const SANS = "'Inter', 'Segoe UI', system-ui, sans-serif";
const CARBON = "#131417";
const CARBON_DK = "#0b0c0e";
const YELLOW = "#ffd400";
const YELLOW_DK = "#eec500";
const INK = "#16171a";
const MUTED = "#6a6e75";
const PAPER = "#f5f5f2";
const LINE = "#e4e5e0";
const GREEN = "#1f9d55";
const RED = "#e03131";

export interface Es18ListItem {
  id: number;
  slug: string;
  title: string;
  subtitle: string | null;
  brand: string | null;
  image_url: string | null;
  price_min_cents: number;
  compare_at_max_cents: number | null;
  stock_total: number;
  default_variant_id: number | null;
  featured: boolean;
  is_new: boolean;
}

export interface Es18Category {
  id: number;
  slug: string;
  name: string;
  parent_id: number | null;
  product_count: number;
}

interface Props {
  items: Es18ListItem[];
  categories: Es18Category[];
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
}

const TOGGLE_FILTERS = ["Skladem", "Akce", "Výprodej"];
const DROPDOWN_FILTERS = ["Výrobce", "Balení", "Specifikace", "Norma výrobce"];

export function Eshop18Listing({
  items, categories, activeCategory, categoryName, categoryDescription,
  basePath, tenantSlug, currency, total, page, pages, perPage,
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

  const quickAdd = (e: React.MouseEvent, it: Es18ListItem) => {
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
    <div style={{ fontFamily: SANS, background: PAPER }}>
      <style>{`
        .es18l-wrap { max-width: 1420px; margin: 0 auto; padding: 0 28px 46px; }
        .es18l-crumb { display: flex; align-items: center; gap: 8px; padding: 16px 0 4px; font-size: 13px; color: ${MUTED}; }
        .es18l-crumb a { color: ${MUTED}; text-decoration: none; }
        .es18l-crumb a:hover { color: ${INK}; text-decoration: underline; text-underline-offset: 3px; }

        .es18l-h1 { display: flex; align-items: center; gap: 14px; margin: 10px 0 0; }
        .es18l-desc { max-width: 620px; font-size: 14.5px; line-height: 1.6; color: ${MUTED}; margin: 10px 0 0; }

        .es18l-chips { display: grid; grid-template-columns: repeat(auto-fill, minmax(215px, 1fr)); gap: 10px; padding: 20px 0 6px; }
        .es18l-chip { display: flex; align-items: center; gap: 11px; border: 1.5px solid ${LINE}; border-radius: 12px; padding: 11px 14px;
          text-decoration: none; background: #fff; transition: border-color 0.14s, box-shadow 0.16s, transform 0.14s; }
        .es18l-chip:hover { border-color: ${CARBON}; box-shadow: 0 8px 18px rgba(11,12,14,0.08); transform: translateY(-1px); }
        .es18l-chip-ico { width: 34px; height: 34px; border-radius: 9px; background: ${PAPER}; color: ${CARBON}; display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0; transition: background 0.14s; }
        .es18l-chip:hover .es18l-chip-ico { background: ${YELLOW}; }
        .es18l-chip-name { font-size: 13.5px; font-weight: 700; color: ${INK}; line-height: 1.25; }
        .es18l-chip-count { font-size: 12px; color: ${MUTED}; }

        .es18l-filters { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; padding: 16px 0 14px; border-top: 1.5px solid ${LINE}; margin-top: 16px; }
        .es18l-toggle { display: inline-flex; align-items: center; gap: 7px; height: 36px; padding: 0 14px; border: 1.5px solid ${LINE}; border-radius: 10px;
          background: #fff; color: ${INK}; font-size: 12.5px; font-weight: 800; letter-spacing: 0.04em; text-transform: uppercase; cursor: pointer; font-family: ${SANS};
          white-space: nowrap; transition: border-color 0.13s, background 0.13s, color 0.13s; }
        .es18l-toggle:hover { border-color: ${CARBON}; }
        .es18l-toggle.on { background: ${YELLOW}; border-color: ${YELLOW}; color: ${CARBON}; }
        .es18l-filter { display: inline-flex; align-items: center; gap: 7px; height: 36px; padding: 0 14px; border: 1.5px solid ${LINE}; border-radius: 10px;
          background: #fff; color: ${INK}; font-size: 13px; font-weight: 600; cursor: pointer; font-family: ${SANS}; white-space: nowrap; transition: border-color 0.13s; }
        .es18l-filter:hover { border-color: ${CARBON}; }
        .es18l-sort { margin-left: auto; display: inline-flex; align-items: center; gap: 7px; font-size: 13px; font-weight: 700; color: ${INK}; cursor: pointer; white-space: nowrap; }

        .es18l-count { font-size: 13px; color: ${MUTED}; padding: 2px 0 14px; }

        .es18l-grid { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 12px; }
        @media (max-width: 1280px) { .es18l-grid { grid-template-columns: repeat(4, minmax(0, 1fr)); } }
        @media (max-width: 1020px) { .es18l-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); } }
        @media (max-width: 720px) { .es18l-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; } }

        .es18l-card { position: relative; background: #fff; border: 1.5px solid ${LINE}; border-radius: 14px; overflow: hidden; text-decoration: none;
          display: flex; flex-direction: column; transition: transform 0.18s cubic-bezier(0.16,1,0.3,1), box-shadow 0.2s, border-color 0.18s; }
        .es18l-card:hover { transform: translateY(-3px); box-shadow: 0 16px 32px rgba(11,12,14,0.1); border-color: ${CARBON}; }
        .es18l-media { position: relative; aspect-ratio: 1/1; overflow: hidden; background: ${PAPER}; }
        .es18l-media img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; transition: transform 0.5s cubic-bezier(0.16,1,0.3,1); }
        .es18l-card:hover .es18l-media img { transform: scale(1.05); }
        .es18l-chip-badge { display: inline-flex; align-items: center; gap: 4px; font-family: ${HEAD}; font-weight: 800; font-stretch: 110%; font-size: 11px;
          letter-spacing: 0.07em; text-transform: uppercase; padding: 5px 11px; line-height: 1.2; clip-path: polygon(6px 0, 100% 0, calc(100% - 6px) 100%, 0 100%); }
        .es18l-add { position: absolute; right: 10px; bottom: 10px; width: 40px; height: 40px; border: none; border-radius: 11px; background: ${YELLOW};
          color: ${CARBON}; cursor: pointer; display: inline-flex; align-items: center; justify-content: center;
          box-shadow: 0 6px 16px rgba(11,12,14,0.16); transition: background 0.15s, color 0.15s, transform 0.15s; }
        .es18l-add:hover { background: ${CARBON}; color: ${YELLOW}; transform: translateY(-2px); }
        .es18l-add:disabled { cursor: default; opacity: 0.75; }
        .es18l-add.is-added { background: ${GREEN}; color: #fff; }
        .es18l-title { font-size: 13.5px; font-weight: 700; color: ${INK}; line-height: 1.38;
          overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; min-height: 2.76em; }

        .es18l-morebtn { display: inline-flex; align-items: center; gap: 9px; height: 46px; padding: 0 26px; border: 1.5px solid ${CARBON}; border-radius: 12px;
          background: #fff; color: ${INK}; font-size: 12.5px; font-weight: 800; letter-spacing: 0.05em; text-transform: uppercase; text-decoration: none;
          transition: background 0.15s, color 0.15s; }
        .es18l-morebtn:hover { background: ${CARBON}; color: ${YELLOW}; }
        .es18l-page { display: inline-flex; align-items: center; justify-content: center; min-width: 38px; height: 38px; padding: 0 8px; border-radius: 10px;
          font-size: 13.5px; font-weight: 700; color: ${INK}; text-decoration: none; border: 1.5px solid transparent; transition: border-color 0.13s, background 0.13s; }
        .es18l-page:hover { border-color: ${CARBON}; background: #fff; }
        .es18l-page.on { background: ${CARBON}; color: ${YELLOW}; }

        @media (prefers-reduced-motion: reduce) {
          .es18l-card, .es18l-media img, .es18l-add, .es18l-chip { transition: none !important; }
          .es18l-card:hover .es18l-media img { transform: none; }
        }
      `}</style>

      <div className="es18l-wrap">
        {/* Breadcrumb */}
        <nav className="es18l-crumb" aria-label="Drobečková navigace">
          <a href={`/demo/${tenantSlug}`}>Domů</a>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 6 6 6-6 6"/></svg>
          <a href={basePath}>Katalog</a>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 6 6 6-6 6"/></svg>
          <span style={{ color: INK, fontWeight: 600 }}>{categoryName}</span>
        </nav>

        {/* Nadpis + popis */}
        <div className="es18l-h1">
          <span aria-hidden="true" style={{ width: 12, height: 34, background: YELLOW, transform: "skewX(-14deg)", flexShrink: 0 }} />
          <h1 style={{ margin: 0, fontFamily: HEAD, fontWeight: 900, fontStyle: "italic", fontStretch: "115%", fontSize: "clamp(26px, 2.6vw, 38px)", letterSpacing: "0.01em", textTransform: "uppercase", color: INK, lineHeight: 1.05 }}>{categoryName}</h1>
        </div>
        {categoryDescription && <p className="es18l-desc">{categoryDescription}</p>}

        {/* Chipy podkategorií */}
        {chips.length > 0 && (
          <div className="es18l-chips">
            {chips.map((c) => (
              <a key={c.id} href={catHref(c.slug)} className="es18l-chip">
                <span className="es18l-chip-ico">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2 4.5 13.5h6L10 22l8.5-11.5h-6L13 2Z"/></svg>
                </span>
                <span>
                  <span className="es18l-chip-name">{c.name}</span>{" "}
                  <span className="es18l-chip-count">({c.product_count})</span>
                </span>
              </a>
            ))}
          </div>
        )}

        {/* Filtr lišta */}
        <div className="es18l-filters">
          {TOGGLE_FILTERS.map((f, i) => (
            <button key={f} type="button" className={`es18l-toggle${i === 0 ? " on" : ""}`}>
              {i === 0 && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round"><path d="m4.5 12.5 5 5 10-11"/></svg>}
              {f}
            </button>
          ))}
          <span aria-hidden="true" style={{ width: 1.5, height: 22, background: LINE, margin: "0 4px" }} />
          {DROPDOWN_FILTERS.map((f) => (
            <button key={f} type="button" className="es18l-filter">
              {f}
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
            </button>
          ))}
          <span className="es18l-sort">
            Řadit: nejprodávanější
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
          </span>
        </div>

        <div className="es18l-count">{total} položek</div>

        {/* Grid produktů */}
        {items.length === 0 ? (
          <div style={{ padding: "50px 0", color: MUTED, fontSize: 15 }}>V této kategorii zatím nejsou žádné produkty.</div>
        ) : (
          <div className="es18l-grid">
            {items.map((it) => {
              const sale = it.compare_at_max_cents != null && it.compare_at_max_cents > it.price_min_cents;
              const salePct = sale ? Math.round((1 - it.price_min_cents / (it.compare_at_max_cents as number)) * 100) : 0;
              return (
                <a key={it.id} className="es18l-card" href={`${basePath}/${it.slug}`}>
                  <span className="es18l-media">
                    {it.image_url && <img src={it.image_url} alt={it.title} loading="lazy" />}
                    <span style={{ position: "absolute", left: 10, top: 10, display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 5 }}>
                      {sale && salePct > 0 && <span className="es18l-chip-badge" style={{ background: RED, color: "#fff" }}>−{salePct} %</span>}
                      {it.featured && <span className="es18l-chip-badge" style={{ background: YELLOW, color: CARBON }}>TOP</span>}
                      {it.is_new && <span className="es18l-chip-badge" style={{ background: CARBON, color: "#fff" }}>Novinka</span>}
                    </span>
                    {it.stock_total > 0 && it.default_variant_id != null && (
                      <button
                        className={`es18l-add${added === it.slug ? " is-added" : ""}`}
                        disabled={adding === it.slug || added === it.slug}
                        onClick={(e) => quickAdd(e, it)}
                        aria-label={`Přidat ${it.title} do košíku`}
                      >
                        {added === it.slug ? (
                          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round"><path d="m4.5 12.5 5 5 10-11"/></svg>
                        ) : (
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="20" r="1.4"/><circle cx="17.5" cy="20" r="1.4"/><path d="M2.5 3.5h2.6l2.5 12h10.2l2.2-8.5H6.2"/><path d="M13.5 6.5h5M16 4v5"/></svg>
                        )}
                      </button>
                    )}
                  </span>

                  <span style={{ display: "flex", flexDirection: "column", flex: 1, padding: "11px 13px 13px" }}>
                    {it.brand && <span style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: "0.13em", textTransform: "uppercase", color: MUTED, marginBottom: 4 }}>{it.brand}</span>}
                    <span className="es18l-title">{it.title}</span>
                    {it.subtitle && <span style={{ marginTop: 3, fontSize: 12, color: MUTED, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{it.subtitle}</span>}
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, marginTop: 9, fontSize: 12, fontWeight: 700 }}>
                      {it.stock_total <= 0 ? (
                        <span style={{ color: MUTED }}>Vyprodáno</span>
                      ) : it.stock_total > 15 ? (
                        <>
                          <span style={{ width: 7, height: 7, borderRadius: 999, background: GREEN, flexShrink: 0 }} />
                          <span style={{ color: GREEN }}>Skladem {it.stock_total} ks</span>
                        </>
                      ) : (
                        <>
                          <span style={{ width: 7, height: 7, borderRadius: 999, background: "#e8a13c", flexShrink: 0 }} />
                          <span style={{ color: "#b97e22" }}>Běžně do 11 dnů</span>
                        </>
                      )}
                    </span>
                    <span style={{ display: "flex", alignItems: "baseline", gap: 8, marginTop: 8 }}>
                      {sale && <s style={{ color: MUTED, fontSize: 12, fontWeight: 500 }}>{fmt(it.compare_at_max_cents as number)}</s>}
                      <span style={{ fontFamily: HEAD, fontWeight: 800, fontStretch: "108%", fontSize: 17.5, color: sale ? RED : INK, whiteSpace: "nowrap" }}>{fmt(it.price_min_cents)}</span>
                      <span style={{ fontSize: 10.5, fontWeight: 600, color: MUTED }}>s DPH</span>
                    </span>
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
              <a href={pageHref(page + 1)} className="es18l-morebtn">
                Dalších {Math.min(perPage, remaining)} položek
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
              </a>
            )}
            <span style={{ display: "inline-flex", gap: 4 }}>
              {Array.from({ length: Math.min(5, pages) }, (_, i) => i + 1).map((n) => (
                <a key={n} href={pageHref(n)} className={`es18l-page${n === page ? " on" : ""}`}>{n}</a>
              ))}
              {pages > 5 && <span className="es18l-page" style={{ cursor: "default" }}>…</span>}
              {pages > 5 && <a href={pageHref(pages)} className="es18l-page">{pages}</a>}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
