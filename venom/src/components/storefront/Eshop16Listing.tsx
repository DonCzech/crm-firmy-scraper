"use client";

/**
 * Eshop16Listing — Spížka (kosik.cz DNA) stránka kategorie.
 * Breadcrumb → Bricolage H1 + popis → dlaždice podkategorií (foto/iniciála)
 * → filtr lišta (chipy Akce/Multikup/Zvýhodněné/Novinky + řazení) → grid 6
 * karet v kosik stylu (chipy na fotce, „+" přes roh, malinový cenový box se
 * superscript haléři při slevě, gramáž vlevo + jednotková cena vpravo) →
 * „Dalších N produktů" + stránkování.
 */

import { useState } from "react";

const HEAD = "'Bricolage Grotesque', 'Segoe UI', sans-serif";
const SANS = "'Figtree', 'Segoe UI', system-ui, sans-serif";
const FIG = "#56203d";
const FIG_DK = "#3f152c";
const APRICOT = "#f2a541";
const RASP = "#d23c55";
const GREEN = "#3e9b4f";
const INK = "#241a20";
const MUTED = "#7a6c74";
const CREAM = "#fbf7f1";
const SURFACE = "#f6efe4";
const LINE = "#e9dfe0";

export interface Es16ListItem {
  id: number;
  slug: string;
  title: string;
  subtitle: string | null;
  brand: string | null;
  image_url: string | null;
  price_min_cents: number;
  compare_at_max_cents: number | null;
  default_variant_id: number | null;
  is_new: boolean;
  price_match: boolean;
  multikup_qty: number | null;
}

export interface Es16Category {
  id: number;
  slug: string;
  name: string;
  parent_id: number | null;
  product_count: number;
  image_url: string | null;
}

interface Props {
  items: Es16ListItem[];
  categories: Es16Category[];
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

const QUICK_FILTERS = [
  { label: "Akční týden", slug: "akcni-tyden" },
  { label: "Multikup", slug: "multikup" },
  { label: "Zvýhodněné", slug: "zvyhodnene" },
  { label: "Zachraň jídlo", slug: "zachran-jidlo" },
  { label: "Novinky", slug: "novinky" },
];

export function Eshop16Listing({
  items, categories, activeCategory, categoryName, categoryDescription,
  basePath, tenantSlug, currency, total, page, pages, perPage,
}: Props) {
  const [adding, setAdding] = useState<string | null>(null);
  const [added, setAdded] = useState<string | null>(null);

  const fmt = (cents: number) =>
    new Intl.NumberFormat("cs-CZ", { style: "currency", currency, maximumFractionDigits: cents % 100 === 0 ? 0 : 2 }).format(cents / 100);
  const splitPrice = (cents: number) => ({
    kc: new Intl.NumberFormat("cs-CZ").format(Math.floor(cents / 100)),
    hal: String(cents % 100).padStart(2, "0"),
  });

  const active = activeCategory ? categories.find((c) => c.slug === activeCategory) : null;
  const specialSlugs = new Set(QUICK_FILTERS.map((f) => f.slug));
  const tiles = (active
    ? categories.filter((c) => c.parent_id === active.id)
    : categories.filter((c) => !c.parent_id && !specialSlugs.has(c.slug))
  ).filter((c) => c.product_count > 0);
  const catHref = (slug: string) => `${basePath}?kategorie=${slug}`;
  const pageHref = (n: number) => `${basePath}?${activeCategory ? `kategorie=${activeCategory}&` : ""}strana=${n}`;

  const quickAdd = (e: React.MouseEvent, it: Es16ListItem) => {
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

  // subtitle „500 g • 109,80 Kč/kg" → gramáž vlevo, jednotková cena vpravo (kosik vzor)
  const splitSub = (sub: string | null): [string, string] => {
    if (!sub) return ["", ""];
    const idx = sub.indexOf("•");
    if (idx === -1) return [sub, ""];
    return [sub.slice(0, idx).trim(), sub.slice(idx + 1).trim()];
  };

  const remaining = Math.max(0, total - page * perPage);

  return (
    <div style={{ fontFamily: SANS, background: CREAM }}>
      <style>{`
        .es16l-wrap { max-width: 1420px; margin: 0 auto; padding: 0 28px 46px; }
        .es16l-crumb { display: flex; align-items: center; gap: 8px; padding: 16px 0 4px; font-size: 13px; color: ${MUTED}; }
        .es16l-crumb a { color: ${MUTED}; text-decoration: none; }
        .es16l-crumb a:hover { color: ${FIG}; text-decoration: underline; text-underline-offset: 3px; }
        .es16l-desc { max-width: 640px; font-size: 14px; line-height: 1.55; color: ${MUTED}; margin: 10px 0 0; }

        .es16l-tiles { display: flex; gap: 12px; overflow-x: auto; scroll-snap-type: x proximity; scrollbar-width: none; -ms-overflow-style: none; padding: 18px 2px 22px; }
        .es16l-tiles::-webkit-scrollbar { display: none; }
        .es16l-tile { scroll-snap-align: start; flex: 0 0 auto; width: 108px; background: #fff; border: 1px solid ${LINE}; border-radius: 14px;
          padding: 9px 7px 11px; text-decoration: none; display: flex; flex-direction: column; gap: 8px; transition: transform 0.16s, box-shadow 0.16s, border-color 0.15s; }
        .es16l-tile:hover { transform: translateY(-3px); box-shadow: 0 14px 28px rgba(86,32,61,0.12); border-color: transparent; }
        .es16l-tile.on { border-color: ${FIG}; box-shadow: inset 0 0 0 1px ${FIG}; }
        .es16l-tile-media { aspect-ratio: 1/1; border-radius: 9px; overflow: hidden; background: ${SURFACE}; display: flex; align-items: center; justify-content: center; }
        .es16l-tile-media img { width: 100%; height: 100%; object-fit: cover; display: block; }
        .es16l-tile-letter { font-family: ${HEAD}; font-weight: 800; font-size: 30px; color: ${FIG}; }
        .es16l-tile-label { font-size: 12px; font-weight: 600; color: ${INK}; text-align: center; line-height: 1.3; min-height: 31px; display: flex; align-items: flex-start; justify-content: center; }
        .es16l-tile:hover .es16l-tile-label { color: ${FIG}; }

        .es16l-filters { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; padding: 14px 0; border-top: 1px solid ${LINE}; }
        .es16l-filter { display: inline-flex; align-items: center; gap: 7px; height: 36px; padding: 0 15px; border: 1px solid ${LINE}; border-radius: 999px;
          background: #fff; color: ${INK}; font-size: 13px; font-weight: 600; text-decoration: none; white-space: nowrap; transition: border-color 0.13s, background 0.13s, color 0.13s; }
        .es16l-filter:hover { border-color: ${FIG}; color: ${FIG}; }
        .es16l-filter.on { background: ${FIG}; border-color: ${FIG}; color: #fff; }
        .es16l-sort { margin-left: auto; display: inline-flex; align-items: center; gap: 7px; font-size: 13px; font-weight: 700; color: ${FIG}; white-space: nowrap; }
        .es16l-count { font-size: 13px; color: ${MUTED}; padding: 4px 0 16px; }

        .es16l-grid { display: grid; grid-template-columns: repeat(6, minmax(0, 1fr)); gap: 12px; }
        @media (max-width: 1300px) { .es16l-grid { grid-template-columns: repeat(5, minmax(0, 1fr)); } }
        @media (max-width: 1100px) { .es16l-grid { grid-template-columns: repeat(4, minmax(0, 1fr)); } }
        @media (max-width: 860px) { .es16l-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); } }
        @media (max-width: 620px) { .es16l-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }

        .es16l-card { text-decoration: none; display: flex; flex-direction: column; background: #fff; border: 1px solid ${LINE}; border-radius: 14px;
          padding: 10px 10px 13px; transition: transform 0.17s, box-shadow 0.17s, border-color 0.15s; }
        .es16l-card:hover { transform: translateY(-3px); box-shadow: 0 16px 32px rgba(86,32,61,0.12); border-color: transparent; }
        .es16l-media { position: relative; aspect-ratio: 1/1; border-radius: 9px; overflow: hidden; background: ${CREAM}; }
        .es16l-media img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; transition: transform 0.4s cubic-bezier(0.16,1,0.3,1); }
        .es16l-card:hover .es16l-media img { transform: scale(1.05); }
        .es16l-chip { position: absolute; top: 7px; left: 7px; font-size: 10.5px; font-weight: 700; padding: 4px 8px; border-radius: 999px; line-height: 1.2; }
        .es16l-chip.new { background: rgba(242,165,65,0.94); color: #3f152c; }
        .es16l-chip.match { background: #f9e3b0; color: #7a5a12; }
        .es16l-chip.mk { background: ${FIG}; color: #fff; letter-spacing: 0.06em; }
        .es16l-add { position: absolute; right: 7px; bottom: 7px; width: 36px; height: 36px; border-radius: 999px; border: none; cursor: pointer;
          background: ${FIG}; color: #fff; display: inline-flex; align-items: center; justify-content: center; box-shadow: 0 8px 16px rgba(36,26,32,0.22);
          transition: background 0.15s, transform 0.14s; }
        .es16l-add:hover { background: ${FIG_DK}; transform: scale(1.08); }
        .es16l-add[disabled] { opacity: 0.6; cursor: default; transform: none; }
        .es16l-add.is-added { background: ${GREEN}; }

        .es16l-priceline { display: flex; align-items: center; gap: 7px; margin-top: 10px; min-height: 27px; flex-wrap: wrap; }
        .es16l-pricebox { background: ${RASP}; color: #fff; border-radius: 7px; padding: 3px 7px 4px; font-family: ${HEAD}; font-weight: 800; font-size: 17px; line-height: 1; }
        .es16l-pricebox sup { font-size: 10px; font-weight: 800; margin-left: 1px; }
        .es16l-price { font-family: ${HEAD}; font-weight: 800; font-size: 17.5px; color: ${INK}; letter-spacing: -0.01em; }
        .es16l-price sup { font-size: 10.5px; font-weight: 800; margin-left: 1px; }
        .es16l-old { font-size: 12px; color: ${MUTED}; text-decoration: line-through; }
        .es16l-salenote { margin-top: 4px; font-size: 12px; font-weight: 700; color: ${RASP}; }
        .es16l-title { margin-top: 6px; font-size: 13.5px; font-weight: 600; color: ${INK}; line-height: 1.35; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; min-height: 2.7em; transition: color 0.14s; }
        .es16l-card:hover .es16l-title { color: ${FIG}; }
        .es16l-meta { display: flex; align-items: baseline; justify-content: space-between; gap: 8px; margin-top: 5px; font-size: 11.5px; color: ${MUTED}; }

        .es16l-morebtn { display: inline-flex; align-items: center; gap: 9px; height: 44px; padding: 0 24px; border: 1px solid ${LINE}; border-radius: 999px;
          background: #fff; color: ${FIG}; font-size: 14px; font-weight: 700; text-decoration: none; transition: background 0.14s, border-color 0.14s, color 0.14s; }
        .es16l-morebtn:hover { background: ${FIG}; border-color: ${FIG}; color: #fff; }
        .es16l-page { display: inline-flex; align-items: center; justify-content: center; min-width: 36px; height: 36px; padding: 0 8px; border-radius: 999px;
          font-size: 13.5px; font-weight: 700; color: ${INK}; text-decoration: none; transition: background 0.13s; }
        .es16l-page:hover { background: ${SURFACE}; }
        .es16l-page.on { background: ${FIG}; color: #fff; }

        @media (prefers-reduced-motion: reduce) {
          .es16l-card, .es16l-media img, .es16l-add, .es16l-tile { transition: none !important; }
          .es16l-card:hover .es16l-media img { transform: none; }
        }
      `}</style>

      <div className="es16l-wrap">
        <nav className="es16l-crumb" aria-label="Drobečková navigace">
          <a href={`/demo/${tenantSlug}`}>Domů</a>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 6 6 6-6 6"/></svg>
          {active?.parent_id && (() => {
            const parent = categories.find((c) => c.id === active.parent_id);
            return parent ? (
              <>
                <a href={catHref(parent.slug)}>{parent.name}</a>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 6 6 6-6 6"/></svg>
              </>
            ) : null;
          })()}
          <span style={{ color: INK, fontWeight: 600 }}>{categoryName}</span>
        </nav>

        <h1 style={{ margin: "6px 0 0", fontFamily: HEAD, fontSize: "clamp(26px, 2.6vw, 36px)", fontWeight: 800, letterSpacing: "-0.02em", color: INK, lineHeight: 1.1 }}>{categoryName}</h1>
        {categoryDescription && <p className="es16l-desc">{categoryDescription}</p>}

        {tiles.length > 0 && (
          <div className="es16l-tiles">
            {tiles.map((c) => (
              <a key={c.id} href={catHref(c.slug)} className={`es16l-tile${c.slug === activeCategory ? " on" : ""}`}>
                <span className="es16l-tile-media">
                  {c.image_url
                    ? <img src={c.image_url} alt={c.name} loading="lazy" />
                    : <span className="es16l-tile-letter">{c.name.charAt(0)}</span>}
                </span>
                <span className="es16l-tile-label">{c.name}</span>
              </a>
            ))}
          </div>
        )}

        <div className="es16l-filters">
          {QUICK_FILTERS.map((f) => (
            <a key={f.slug} href={catHref(f.slug)} className={`es16l-filter${activeCategory === f.slug ? " on" : ""}`}>{f.label}</a>
          ))}
          <span className="es16l-sort">
            Doporučené
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
          </span>
        </div>

        <div className="es16l-count">{total} produktů</div>

        {items.length === 0 ? (
          <div style={{ padding: "50px 0", color: MUTED, fontSize: 15 }}>V této kategorii zatím nejsou žádné produkty.</div>
        ) : (
          <div className="es16l-grid">
            {items.map((it) => {
              const sale = it.compare_at_max_cents != null && it.compare_at_max_cents > it.price_min_cents;
              const pct = sale ? Math.round((1 - it.price_min_cents / (it.compare_at_max_cents as number)) * 100) : 0;
              const { kc, hal } = splitPrice(it.price_min_cents);
              const [weight, unitPrice] = splitSub(it.subtitle);
              return (
                <a key={it.id} className="es16l-card" href={`${basePath}/${it.slug}`}>
                  <span className="es16l-media">
                    {it.image_url && <img src={it.image_url} alt={it.title} loading="lazy" />}
                    {it.multikup_qty != null
                      ? <span className="es16l-chip mk">MULTIKUP</span>
                      : it.price_match
                        ? <span className="es16l-chip match">Srovnaná cena</span>
                        : it.is_new
                          ? <span className="es16l-chip new">Novinka</span>
                          : null}
                    <button
                      className={`es16l-add${added === it.slug ? " is-added" : ""}`}
                      disabled={adding === it.slug || !it.default_variant_id}
                      onClick={(e) => quickAdd(e, it)}
                      aria-label={`Přidat ${it.title} do košíku`}
                    >
                      {added === it.slug ? (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                      ) : (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
                      )}
                    </button>
                  </span>

                  <span className="es16l-priceline">
                    {sale ? (
                      <>
                        <span className="es16l-pricebox">{kc}<sup>{hal}</sup></span>
                        <span className="es16l-old">{fmt(it.compare_at_max_cents!)}</span>
                      </>
                    ) : (
                      <span className="es16l-price">{kc}<sup>{hal}</sup></span>
                    )}
                  </span>
                  {sale && pct > 2 && <span className="es16l-salenote">−{pct} % do neděle</span>}
                  <span className="es16l-title">{it.title}</span>
                  <span className="es16l-meta">
                    <span>{weight}</span>
                    <span>{unitPrice}</span>
                  </span>
                </a>
              );
            })}
          </div>
        )}

        {pages > 1 && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 22, paddingTop: 36, flexWrap: "wrap" }}>
            {page < pages && (
              <a href={pageHref(page + 1)} className="es16l-morebtn">
                Dalších {Math.min(perPage, remaining)} produktů
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
              </a>
            )}
            <span style={{ display: "inline-flex", gap: 4 }}>
              {Array.from({ length: Math.min(5, pages) }, (_, i) => i + 1).map((n) => (
                <a key={n} href={pageHref(n)} className={`es16l-page${n === page ? " on" : ""}`}>{n}</a>
              ))}
              {pages > 5 && <span className="es16l-page" style={{ cursor: "default" }}>…</span>}
              {pages > 5 && <a href={pageHref(pages)} className="es16l-page">{pages}</a>}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
