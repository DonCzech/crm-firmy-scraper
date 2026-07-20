"use client";

/**
 * Eshop20Listing — Vykuk (dedoles.cz DNA) stránka kategorie.
 * Breadcrumb → centrovaný Baloo uppercase H1 s vlnitým podtrhem + centrovaný
 * popis → kruhové dlaždice podkategorií → filtr lišta (Udržitelnost toggle,
 * Výprodej toggle → letni-vyprodej, dekorativní dropdowny Pohlaví/Velikost/
 * Motiv/Barva, vpravo řazení) → grid 4 karet ve stylu homepage railu (chipy
 * Novinka/Léto, srdíčko, růžový + quick-add, cena + červený −N % pill) →
 * „Prohlédli jste si X z Y produktů" progress + Zobrazit více + stránkování.
 */

import { useState } from "react";

const HEAD = "'Baloo 2', 'Arial Rounded MT Bold', sans-serif";
const SANS = "'Figtree', 'Segoe UI', system-ui, sans-serif";
const COCOA = "#4b2413";
const PINK = "#f6a7d7";
const PINK_DEEP = "#e0559f";
const LIME = "#d6e84a";
const CREAM = "#fdf8f0";
const INK = "#3c2010";
const MUTED = "#8a7160";
const LINE = "#efe4d5";
const GREEN = "#2f9e44";
const RED = "#e03131";

export interface Es20ListItem {
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
  is_new: boolean;
  is_summer: boolean;
}

export interface Es20Category {
  id: number;
  slug: string;
  name: string;
  parent_id: number | null;
  product_count: number;
  image_url: string | null;
}

interface Props {
  items: Es20ListItem[];
  categories: Es20Category[];
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

const SPECIAL_SLUGS = new Set(["letni-vyprodej", "novinky", "outlet", "letni-kolekce", "darky"]);
const FAKE_DROPDOWNS = ["Pohlaví", "Velikost", "Motiv", "Barva"];

export function Eshop20Listing({
  items, categories, activeCategory, categoryName, categoryDescription,
  basePath, tenantSlug, currency, total, page, pages, perPage,
}: Props) {
  const [adding, setAdding] = useState<string | null>(null);
  const [added, setAdded] = useState<string | null>(null);
  const [loved, setLoved] = useState<Record<string, boolean>>({});
  const [eco, setEco] = useState(false);

  const fmt = (cents: number) =>
    new Intl.NumberFormat("cs-CZ", { style: "currency", currency, maximumFractionDigits: 0 }).format(cents / 100);

  const active = activeCategory ? categories.find((c) => c.slug === activeCategory) : null;
  const tiles = (active
    ? categories.filter((c) => c.parent_id === active.id)
    : categories.filter((c) => !c.parent_id && !SPECIAL_SLUGS.has(c.slug))
  ).filter((c) => c.product_count > 0);
  const catHref = (slug: string) => `${basePath}?kategorie=${slug}`;
  const pageHref = (n: number) => `${basePath}?${activeCategory ? `kategorie=${activeCategory}&` : ""}strana=${n}`;

  const quickAdd = (e: React.MouseEvent, it: Es20ListItem) => {
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

  const toggleLove = (e: React.MouseEvent, slug: string) => {
    e.preventDefault();
    e.stopPropagation();
    setLoved((m) => ({ ...m, [slug]: !m[slug] }));
  };

  const seen = Math.min(total, page * perPage);
  const seenPct = total > 0 ? Math.round((seen / total) * 100) : 100;

  return (
    <div style={{ fontFamily: SANS, background: CREAM }}>
      <style>{`
        .es20l-wrap { max-width: 1420px; margin: 0 auto; padding: 0 28px 48px; }
        .es20l-crumb { display: flex; align-items: center; gap: 8px; padding: 16px 0 4px; font-size: 13px; color: ${MUTED}; flex-wrap: wrap; }
        .es20l-crumb a { color: ${MUTED}; text-decoration: none; }
        .es20l-crumb a:hover { color: ${PINK_DEEP}; text-decoration: underline; text-underline-offset: 3px; }

        .es20l-h1 { margin: 14px auto 0; text-align: center; font-family: ${HEAD}; font-weight: 800; font-size: clamp(24px, 2.6vw, 36px);
          letter-spacing: 0.03em; text-transform: uppercase; color: ${COCOA}; line-height: 1.12; max-width: 800px; padding-bottom: 10px; width: fit-content; display: block;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='5' viewBox='0 0 20 5'%3E%3Cpath d='M0 3.5c2.5 0 2.5-2.5 5-2.5s2.5 2.5 5 2.5 2.5-2.5 5-2.5 2.5 2.5 5 2.5' fill='none' stroke='%23f6a7d7' stroke-width='1.8' stroke-linecap='round'/%3E%3C/svg%3E");
          background-repeat: repeat-x; background-position: center bottom; }
        .es20l-desc { max-width: 680px; font-size: 14.5px; line-height: 1.55; color: ${MUTED}; margin: 12px auto 0; text-align: center; }

        .es20l-tiles { display: flex; gap: 6px; overflow-x: auto; scroll-snap-type: x proximity; scrollbar-width: none; -ms-overflow-style: none; padding: 22px 2px 20px; justify-content: safe center; }
        .es20l-tiles::-webkit-scrollbar { display: none; }
        .es20l-tile { scroll-snap-align: start; flex: 0 0 auto; width: 112px; text-decoration: none; display: flex; flex-direction: column; align-items: center; gap: 9px; padding: 4px; }
        .es20l-circle { width: 84px; height: 84px; border-radius: 999px; overflow: hidden; background: #fff; border: 3px solid #fff;
          box-shadow: 0 2px 10px rgba(56,25,12,0.09); display: flex; align-items: center; justify-content: center;
          transition: border-color 0.18s, transform 0.18s cubic-bezier(0.16,1,0.3,1); }
        .es20l-tile:hover .es20l-circle { border-color: ${PINK}; transform: translateY(-3px); }
        .es20l-tile.on .es20l-circle { border-color: ${PINK_DEEP}; }
        .es20l-circle img { width: 100%; height: 100%; object-fit: cover; display: block; }
        .es20l-letter { font-family: ${HEAD}; font-weight: 800; font-size: 26px; color: ${COCOA}; }
        .es20l-tile-label { font-size: 12.5px; font-weight: 600; color: ${INK}; text-align: center; line-height: 1.3; min-height: 32px; }
        .es20l-tile:hover .es20l-tile-label { color: ${PINK_DEEP}; }

        .es20l-filters { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; padding: 14px 0; border-top: 1px solid ${LINE}; }
        .es20l-toggle { display: inline-flex; align-items: center; gap: 9px; height: 38px; padding: 0 15px; border: 1.5px solid ${LINE}; border-radius: 999px;
          background: #fff; color: ${INK}; font-size: 13px; font-weight: 700; cursor: pointer; font-family: ${SANS}; text-decoration: none;
          transition: border-color 0.13s, background 0.13s; }
        .es20l-toggle:hover { border-color: ${PINK}; }
        .es20l-toggle.on { border-color: ${PINK_DEEP}; background: #fff; }
        .es20l-switch { width: 32px; height: 18px; border-radius: 999px; background: ${LINE}; position: relative; transition: background 0.16s; flex-shrink: 0; }
        .es20l-switch::after { content: ""; position: absolute; top: 2px; left: 2px; width: 14px; height: 14px; border-radius: 999px; background: #fff; transition: transform 0.18s cubic-bezier(0.16,1,0.3,1); box-shadow: 0 1px 3px rgba(56,25,12,0.25); }
        .es20l-toggle.on .es20l-switch { background: ${GREEN}; }
        .es20l-toggle.on .es20l-switch::after { transform: translateX(14px); }
        .es20l-drop { display: inline-flex; align-items: center; gap: 7px; height: 38px; padding: 0 15px; border: 1.5px solid ${LINE}; border-radius: 999px;
          background: #fff; color: ${INK}; font-size: 13px; font-weight: 600; cursor: default; white-space: nowrap; }
        .es20l-sort { margin-left: auto; display: inline-flex; align-items: center; gap: 7px; font-size: 13px; font-weight: 700; color: ${COCOA}; white-space: nowrap; }
        .es20l-count { font-size: 13px; color: ${MUTED}; padding: 6px 0 16px; }

        .es20l-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 14px; }
        @media (max-width: 1100px) { .es20l-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); } }
        @media (max-width: 820px) { .es20l-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; } }

        .es20l-card { position: relative; display: flex; flex-direction: column; background: #fff; border: 1.5px solid ${LINE}; border-radius: 18px;
          overflow: hidden; text-decoration: none; transition: transform 0.18s cubic-bezier(0.16,1,0.3,1), box-shadow 0.2s, border-color 0.18s; }
        .es20l-card:hover { transform: translateY(-4px); box-shadow: 0 18px 34px rgba(56,25,12,0.12); border-color: ${PINK}; }
        .es20l-media { position: relative; aspect-ratio: 1/1; overflow: hidden; background: ${CREAM}; }
        .es20l-media img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; transition: transform 0.5s cubic-bezier(0.16,1,0.3,1); }
        .es20l-card:hover .es20l-media img { transform: scale(1.06); }
        .es20l-chip { display: inline-flex; align-items: center; font-family: ${HEAD}; font-weight: 700; font-size: 11px; letter-spacing: 0.06em;
          text-transform: uppercase; padding: 4px 11px; border-radius: 999px; line-height: 1.3; }
        .es20l-love { position: absolute; right: 9px; top: 9px; width: 34px; height: 34px; border: none; border-radius: 999px; background: rgba(255,255,255,0.92);
          color: ${COCOA}; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; transition: transform 0.15s; }
        .es20l-love:hover { transform: scale(1.1); }
        .es20l-add { position: absolute; right: 9px; bottom: 9px; width: 40px; height: 40px; border: none; border-radius: 999px; background: ${PINK};
          color: ${COCOA}; cursor: pointer; display: inline-flex; align-items: center; justify-content: center;
          box-shadow: 0 6px 16px rgba(56,25,12,0.18); transition: background 0.15s, transform 0.15s; }
        .es20l-add:hover { background: ${PINK_DEEP}; color: #fff; transform: scale(1.06); }
        .es20l-add[disabled] { opacity: 0.75; cursor: default; }
        .es20l-add.is-added { background: ${GREEN}; color: #fff; }
        .es20l-title { font-size: 14px; font-weight: 600; color: ${INK}; line-height: 1.4; overflow: hidden; display: -webkit-box;
          -webkit-line-clamp: 2; -webkit-box-orient: vertical; min-height: 2.8em; margin-top: 9px; }
        .es20l-sub { margin-top: 3px; font-size: 12px; color: ${MUTED}; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

        .es20l-progress { max-width: 300px; margin: 0 auto; }
        .es20l-morebtn { display: inline-flex; align-items: center; gap: 9px; height: 48px; padding: 0 30px; border: 2px solid ${COCOA}; border-radius: 999px;
          background: #fff; color: ${COCOA}; font-size: 14.5px; font-weight: 800; text-decoration: none; transition: background 0.15s, color 0.15s, transform 0.14s; }
        .es20l-morebtn:hover { background: ${COCOA}; color: ${PINK}; transform: translateY(-2px); }
        .es20l-page { display: inline-flex; align-items: center; justify-content: center; min-width: 36px; height: 36px; padding: 0 8px; border-radius: 999px;
          font-size: 13.5px; font-weight: 700; color: ${INK}; text-decoration: none; transition: background 0.13s; }
        .es20l-page:hover { background: #fff; }
        .es20l-page.on { background: ${COCOA}; color: #fff; }

        @media (prefers-reduced-motion: reduce) {
          .es20l-card, .es20l-media img, .es20l-add, .es20l-tile, .es20l-circle { transition: none !important; }
          .es20l-card:hover .es20l-media img { transform: none; }
        }
      `}</style>

      <div className="es20l-wrap">
        <nav className="es20l-crumb" aria-label="Drobečková navigace">
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

        <h1 className="es20l-h1">{categoryName}</h1>
        {categoryDescription && <p className="es20l-desc">{categoryDescription}</p>}

        {tiles.length > 0 && (
          <div className="es20l-tiles">
            {tiles.map((c) => (
              <a key={c.id} href={catHref(c.slug)} className={`es20l-tile${c.slug === activeCategory ? " on" : ""}`}>
                <span className="es20l-circle">
                  {c.image_url
                    ? <img src={c.image_url} alt={c.name} loading="lazy" />
                    : <span className="es20l-letter">{c.name.charAt(0)}</span>}
                </span>
                <span className="es20l-tile-label">{c.name}</span>
              </a>
            ))}
          </div>
        )}

        <div className="es20l-filters">
          <button className={`es20l-toggle${eco ? " on" : ""}`} onClick={() => setEco(v => !v)} aria-pressed={eco}>
            Udržitelnost
            <span className="es20l-switch" />
          </button>
          <a href={catHref("letni-vyprodej")} className={`es20l-toggle${activeCategory === "letni-vyprodej" ? " on" : ""}`}>
            Výprodej
            <span className="es20l-switch" style={activeCategory === "letni-vyprodej" ? { background: GREEN } : undefined} />
          </a>
          {FAKE_DROPDOWNS.map((f) => (
            <span key={f} className="es20l-drop">
              {f}
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
            </span>
          ))}
          <span className="es20l-sort">
            Nejrelevantnější
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 4v13M4 14l3 3 3-3M17 20V7M14 10l3-3 3 3"/></svg>
          </span>
        </div>

        <div className="es20l-count">{total} produktů</div>

        {items.length === 0 ? (
          <div style={{ padding: "50px 0", color: MUTED, fontSize: 15, textAlign: "center" }}>V této kategorii zatím nejsou žádné produkty.</div>
        ) : (
          <div className="es20l-grid">
            {items.map((it) => {
              const sale = it.compare_at_max_cents != null && it.compare_at_max_cents > it.price_min_cents;
              const pct = sale ? Math.round((1 - it.price_min_cents / (it.compare_at_max_cents as number)) * 100) : 0;
              const isLoved = !!loved[it.slug];
              const soldOut = it.stock_total <= 0;
              return (
                <a key={it.id} className="es20l-card" href={`${basePath}/${it.slug}`}>
                  <span className="es20l-media">
                    {it.image_url && <img src={it.image_url} alt={it.title} loading="lazy" />}
                    <span style={{ position: "absolute", left: 9, top: 9, display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 5 }}>
                      {it.is_new && <span className="es20l-chip" style={{ background: COCOA, color: "#fff" }}>Novinka</span>}
                      {it.is_summer && <span className="es20l-chip" style={{ background: LIME, color: COCOA }}>Léto</span>}
                    </span>
                    <button className="es20l-love" onClick={(e) => toggleLove(e, it.slug)} aria-label={isLoved ? "Odebrat z oblíbených" : "Přidat do oblíbených"} aria-pressed={isLoved}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill={isLoved ? PINK_DEEP : "none"} stroke={isLoved ? PINK_DEEP : "currentColor"} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20.5s-8-4.9-8-11a4.6 4.6 0 0 1 8-3.1 4.6 4.6 0 0 1 8 3.1c0 6.1-8 11-8 11Z"/></svg>
                    </button>
                    {soldOut ? (
                      <span style={{ position: "absolute", inset: 0, background: "rgba(253,248,240,0.72)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <span className="es20l-chip" style={{ background: "#fff", color: MUTED, border: `1.5px solid ${LINE}` }}>Vyprodáno</span>
                      </span>
                    ) : (
                      <button
                        className={`es20l-add${added === it.slug ? " is-added" : ""}`}
                        disabled={adding === it.slug || !it.default_variant_id}
                        onClick={(e) => quickAdd(e, it)}
                        aria-label={`Přidat ${it.title} do košíku`}
                      >
                        {added === it.slug ? (
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                        ) : (
                          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
                        )}
                      </button>
                    )}
                  </span>

                  <span style={{ display: "flex", flexDirection: "column", flex: 1, padding: "0 13px 13px" }}>
                    <span className="es20l-title">{it.title}</span>
                    {it.subtitle && <span className="es20l-sub">{it.subtitle}</span>}
                    <span style={{ display: "flex", alignItems: "center", gap: 8, marginTop: "auto", paddingTop: 9 }}>
                      <span style={{ fontFamily: HEAD, fontWeight: 800, fontSize: 17, color: sale ? RED : COCOA, whiteSpace: "nowrap" }}>{fmt(it.price_min_cents)}</span>
                      {sale && <s style={{ color: MUTED, fontSize: 12.5, fontWeight: 500 }}>{fmt(it.compare_at_max_cents!)}</s>}
                      {sale && pct > 0 && (
                        <span style={{ marginLeft: "auto", background: RED, color: "#fff", fontFamily: HEAD, fontWeight: 700, fontSize: 11.5, padding: "3px 9px", borderRadius: 999 }}>−{pct} %</span>
                      )}
                    </span>
                  </span>
                </a>
              );
            })}
          </div>
        )}

        {/* Dedoles „Prohlédli jste si X z Y produktů" + Zobrazit více */}
        <div style={{ textAlign: "center", paddingTop: 34 }}>
          <div style={{ fontSize: 13.5, fontWeight: 600, color: MUTED, marginBottom: 9 }}>Prohlédli jste si {seen} z {total} produktů.</div>
          <div className="es20l-progress">
            <div style={{ height: 5, borderRadius: 999, background: LINE, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${seenPct}%`, borderRadius: 999, background: COCOA }} />
            </div>
          </div>
          {page < pages && (
            <div style={{ marginTop: 20 }}>
              <a href={pageHref(page + 1)} className="es20l-morebtn">Zobrazit více</a>
            </div>
          )}
          {pages > 1 && (
            <div style={{ display: "inline-flex", gap: 4, marginTop: 20 }}>
              {Array.from({ length: Math.min(5, pages) }, (_, i) => i + 1).map((n) => (
                <a key={n} href={pageHref(n)} className={`es20l-page${n === page ? " on" : ""}`}>{n}</a>
              ))}
              {pages > 5 && <span className="es20l-page" style={{ cursor: "default" }}>…</span>}
              {pages > 5 && <a href={pageHref(pages)} className="es20l-page">{pages}</a>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
