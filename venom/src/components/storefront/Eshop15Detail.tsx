"use client";

/**
 * Eshop15Detail — Apatyka (pilulka.cz DNA 1:1) detail produktu.
 * Breadcrumb → 2 sloupce (foto karta s chipy | brand, H1, lead, cena +
 * jednotková, PRO pill, plná pill „Koupit za…", dostupnost) → „Ještě se
 * může hodit" karusel → sticky tab lišta s Koupit → popis → panel
 * „Doplňující informace" → recenze (empty state) → „Často se kupuje
 * společně" karusel.
 */

import { useState } from "react";

const GREEN = "#064740";
const GREEN_DK = "#03332e";
const TEAL = "#0f7a5e";
const LIME_SOFT = "#c6f9ae";
const PINK = "#e6007e";
const PINK_SOFT = "#fccce6";
const MINT = "#cdeed9";
const EGGSHELL = "#f0efe6";
const INK = "#1c1c1c";
const MUTED = "#6f6f6f";
const LINE = "#e8e8e6";
const SYS = "-apple-system, 'system-ui', 'Segoe UI', Roboto, Arial, sans-serif";

export interface Es15MiniCard {
  slug: string;
  title: string;
  brand: string | null;
  subtitle: string | null;
  price_cents: number;
  compare_cents: number | null;
  pro_cents: number | null;
  rating: string | null;
  cashback: boolean;
  image_url: string | null;
  default_variant_id: number | null;
}

interface Props {
  tenantSlug: string;
  basePath: string;
  currency: string;
  crumbs: { slug: string; name: string }[];
  product: {
    title: string;
    subtitle: string | null;
    brand: string | null;
    description: string | null;
    image_url: string | null;
    image_alt: string | null;
    pro_cents: number | null;
    rating: string | null;
    cashback: boolean;
    isNew: boolean;
  };
  variant: {
    id: number;
    price_cents: number;
    compare_at_price_cents: number | null;
    stock_qty: number;
  } | null;
  infoRows: { label: string; value: string }[];
  related: Es15MiniCard[];
  boughtTogether: Es15MiniCard[];
  deliveryText?: string;
  freeShippingText?: string;
}

function ratingColor(r: string) {
  return r.startsWith("A") ? "#7ac143" : r.startsWith("B") ? "#b5c227" : "#f0b429";
}

function MiniRail({ heading, items, basePath, tenantSlug, fmt, deliveryText }: {
  heading: string;
  items: Es15MiniCard[];
  basePath: string;
  tenantSlug: string;
  fmt: (c: number) => string;
  deliveryText: string;
}) {
  const [adding, setAdding] = useState<string | null>(null);
  const [added, setAdded] = useState<string | null>(null);
  if (!items.length) return null;

  const quickAdd = (e: React.MouseEvent, it: Es15MiniCard) => {
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

  return (
    <div style={{ padding: "34px 0 6px" }}>
      <h2 style={{ margin: "0 0 16px", fontFamily: SYS, fontSize: "clamp(21px, 2.1vw, 27px)", fontWeight: 800, letterSpacing: "-0.02em", color: GREEN }}>{heading}</h2>
      <div className="es15d-rail">
        {items.map((it) => {
          const sale = it.compare_cents != null && it.compare_cents > it.price_cents;
          return (
            <a key={it.slug} className="es15d-mini" href={`${basePath}/${it.slug}`}>
              <span className="es15d-mini-media">
                {it.image_url && <img src={it.image_url} alt={it.title} loading="lazy" />}
                {it.cashback && <span className="es15d-cashback">Cashback</span>}
                <button
                  className={`es15d-add${added === it.slug ? " is-added" : ""}`}
                  disabled={adding === it.slug || !it.default_variant_id}
                  onClick={(e) => quickAdd(e, it)}
                  aria-label={`Přidat ${it.title} do košíku`}
                >
                  {added === it.slug ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                  ) : (
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
                  )}
                </button>
              </span>
              <span className="es15d-mini-priceline">
                {sale ? (
                  <span className="es15d-sale">{fmt(it.price_cents)} <s>{fmt(it.compare_cents!)}</s></span>
                ) : (
                  <span className="es15d-price-s">{fmt(it.price_cents)}</span>
                )}
              </span>
              {it.pro_cents != null && <span className="es15d-pro-s">{fmt(it.pro_cents)} s apatyka PRO</span>}
              {it.brand && <span className="es15d-brand-s">{it.brand}</span>}
              <span className="es15d-title-s">{it.title}</span>
              {it.rating && <span className="es15d-rating-s">NutraRating <b style={{ background: ratingColor(it.rating) }}>{it.rating}</b></span>}
              <span className="es15d-ship-s">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M5 17h-2v-11a1 1 0 0 1 1 -1h9v12m-4 0h6m4 0h2v-6h-8m0 -5h5l3 5"/><circle cx="7.5" cy="17.5" r="2"/><circle cx="17.5" cy="17.5" r="2"/></svg>
                {deliveryText}
              </span>
            </a>
          );
        })}
      </div>
    </div>
  );
}

export function Eshop15Detail({
  tenantSlug, basePath, currency, crumbs, product, variant, infoRows,
  related, boughtTogether,
  deliveryText = "Zítra od 07:00 u vás",
  freeShippingText = "Doprava ZDARMA při nákupu nad 1 499 Kč",
}: Props) {
  const [buying, setBuying] = useState(false);
  const [bought, setBought] = useState(false);

  const fmt = (cents: number) =>
    new Intl.NumberFormat("cs-CZ", { style: "currency", currency, maximumFractionDigits: 0 }).format(cents / 100);

  const sale = variant?.compare_at_price_cents != null && variant.compare_at_price_cents > variant.price_cents;
  const inStock = (variant?.stock_qty ?? 0) > 0;

  const buy = () => {
    if (!variant || buying) return;
    setBuying(true);
    fetch(`/api/demo/${tenantSlug}/shop/cart/items`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ variant_id: variant.id, qty: 1 }),
    })
      .then(() => {
        window.dispatchEvent(new Event("webero-cart-item-added"));
        setBought(true);
        setTimeout(() => setBought(false), 1800);
      })
      .finally(() => setBuying(false));
  };

  const descParagraphs = (product.description ?? "").split(/\n{2,}|\n/).map((s) => s.trim()).filter(Boolean);

  return (
    <div style={{ fontFamily: SYS, background: "#fff" }}>
      <style>{`
        .es15d-wrap { max-width: 1420px; margin: 0 auto; padding: 0 28px 50px; }
        .es15d-crumb { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; padding: 16px 0 18px; font-size: 13px; color: ${MUTED}; }
        .es15d-crumb a { color: ${MUTED}; text-decoration: none; }
        .es15d-crumb a:hover { color: ${GREEN}; text-decoration: underline; text-underline-offset: 3px; }

        .es15d-top { display: grid; grid-template-columns: minmax(0, 6fr) minmax(0, 5fr); gap: 54px; align-items: start; }
        @media (max-width: 900px) { .es15d-top { grid-template-columns: 1fr; gap: 26px; } }

        .es15d-photo { position: relative; border: 1px solid ${LINE}; border-radius: 16px; overflow: hidden; aspect-ratio: 1/1; background: #fff; }
        .es15d-photo img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
        .es15d-chiprow { display: flex; gap: 7px; margin-top: 12px; }
        .es15d-chip { display: inline-flex; background: ${MINT}; color: ${GREEN}; font-size: 12px; font-weight: 700; padding: 5px 12px; border-radius: 999px; }

        .es15d-buy { width: 100%; display: inline-flex; align-items: center; justify-content: center; gap: 10px; height: 54px;
          border: none; border-radius: 999px; background: ${GREEN}; color: #fff; font-size: 15.5px; font-weight: 700; cursor: pointer;
          font-family: ${SYS}; transition: background 0.16s, transform 0.14s; box-shadow: 0 10px 26px rgba(6,71,64,0.24); }
        .es15d-buy:hover { background: ${GREEN_DK}; transform: translateY(-1px); }
        .es15d-buy[disabled] { opacity: 0.65; cursor: default; transform: none; }
        .es15d-buy.is-added { background: #2fb26a; }

        .es15d-avail { display: flex; align-items: flex-start; gap: 10px; padding: 11px 0; border-bottom: 1px solid #f0f0ee; font-size: 14px; color: ${INK}; }
        .es15d-avail svg { flex-shrink: 0; margin-top: 1px; }

        .es15d-tabs { position: sticky; top: 0; z-index: 40; background: #f4f7f2; border-radius: 999px; margin: 40px 0 30px;
          display: flex; align-items: center; gap: 6px; padding: 7px; flex-wrap: wrap; }
        .es15d-tabname { flex: 1 1 200px; min-width: 0; padding: 0 16px; font-size: 13px; font-weight: 700; color: ${INK};
          overflow: hidden; text-overflow: ellipsis; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; line-height: 1.3; }
        .es15d-tab { display: inline-flex; align-items: center; height: 40px; padding: 0 18px; border-radius: 999px; font-size: 13.5px; font-weight: 600;
          color: ${GREEN}; text-decoration: none; white-space: nowrap; transition: background 0.14s; }
        .es15d-tab:hover { background: #e6efe7; }
        .es15d-tabbuy { display: inline-flex; align-items: center; height: 40px; padding: 0 22px; border: none; border-radius: 999px; background: ${GREEN};
          color: #fff; font-size: 13.5px; font-weight: 700; cursor: pointer; font-family: ${SYS}; white-space: nowrap; transition: background 0.15s; }
        .es15d-tabbuy:hover { background: ${GREEN_DK}; }
        @media (max-width: 760px) { .es15d-tabname { display: none; } }

        .es15d-body { max-width: 880px; margin: 0 auto; font-size: 15px; line-height: 1.65; color: #333; }
        .es15d-body h3 { font-family: ${SYS}; font-size: 18px; font-weight: 800; color: ${INK}; margin: 26px 0 8px; letter-spacing: -0.01em; }
        .es15d-body p { margin: 0 0 14px; }

        .es15d-info { background: #f2f6fb; border-radius: 18px; padding: 40px 20px 46px; margin-top: 44px; }
        .es15d-info-card { max-width: 880px; margin: 22px auto 0; background: #fff; border-radius: 14px; overflow: hidden; }
        .es15d-info-row { display: flex; justify-content: space-between; gap: 26px; padding: 13px 26px; font-size: 14px; }
        .es15d-info-row:nth-child(odd) { background: #fafbfd; }
        .es15d-info-row dt { color: ${MUTED}; font-weight: 600; }
        .es15d-info-row dd { margin: 0; color: ${TEAL}; font-weight: 600; text-align: right; }

        .es15d-rail { display: flex; gap: 14px; overflow-x: auto; scroll-snap-type: x mandatory; scrollbar-width: none; -ms-overflow-style: none; padding: 4px 2px 14px; }
        .es15d-rail::-webkit-scrollbar { display: none; }
        .es15d-mini { scroll-snap-align: start; flex: 0 0 calc(16.666% - 12px); min-width: 196px; text-decoration: none; display: flex; flex-direction: column; }
        .es15d-mini-media { position: relative; aspect-ratio: 1/1; border: 1px solid ${LINE}; border-radius: 12px; overflow: hidden; background: #fff; display: block; transition: box-shadow 0.22s, border-color 0.18s; }
        .es15d-mini:hover .es15d-mini-media { border-color: transparent; box-shadow: 0 14px 30px rgba(6,71,64,0.14); }
        .es15d-mini-media img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; transition: transform 0.45s cubic-bezier(0.16,1,0.3,1); }
        .es15d-mini:hover .es15d-mini-media img { transform: scale(1.05); }
        .es15d-cashback { position: absolute; top: 8px; right: 8px; background: ${GREEN}; color: #fff; font-size: 10.5px; font-weight: 700; padding: 4px 9px; border-radius: 999px; line-height: 1; }
        .es15d-add { position: absolute; right: 9px; bottom: 9px; width: 38px; height: 38px; border-radius: 999px; border: none; cursor: pointer;
          background: ${GREEN}; color: #fff; display: inline-flex; align-items: center; justify-content: center; transition: background 0.15s, transform 0.14s; }
        .es15d-add:hover { background: ${GREEN_DK}; transform: scale(1.08); }
        .es15d-add[disabled] { opacity: 0.6; cursor: default; transform: none; }
        .es15d-add.is-added { background: #2fb26a; }
        .es15d-mini-priceline { display: flex; align-items: center; gap: 6px; margin-top: 9px; min-height: 22px; }
        .es15d-price-s { font-size: 15px; font-weight: 800; color: ${INK}; }
        .es15d-sale { display: inline-flex; align-items: center; gap: 5px; background: ${PINK}; color: #fff; font-size: 12.5px; font-weight: 800; padding: 3px 8px; border-radius: 6px; line-height: 1.2; white-space: nowrap; }
        .es15d-sale s { font-weight: 500; opacity: 0.75; font-size: 11px; }
        .es15d-pro-s { display: inline-flex; margin-top: 5px; background: ${LIME_SOFT}; color: ${GREEN}; font-size: 11.5px; font-weight: 700; padding: 3px 8px; border-radius: 6px; align-self: flex-start; }
        .es15d-brand-s { margin-top: 6px; font-size: 12.5px; font-weight: 600; color: ${TEAL}; text-decoration: underline; text-underline-offset: 3px; align-self: flex-start; }
        .es15d-title-s { margin-top: 3px; font-size: 13.5px; font-weight: 500; color: ${INK}; line-height: 1.35; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; min-height: 2.7em; }
        .es15d-mini:hover .es15d-title-s { color: ${GREEN}; }
        .es15d-rating-s { display: inline-flex; align-items: center; gap: 5px; margin-top: 4px; font-size: 11.5px; color: ${INK}; }
        .es15d-rating-s b { font-size: 10.5px; font-weight: 800; color: #fff; padding: 3px 6px; border-radius: 5px; line-height: 1; }
        .es15d-ship-s { display: inline-flex; align-items: center; gap: 5px; margin-top: 7px; font-size: 11.5px; font-weight: 600; color: #159a62; }

        .es15d-review-btn { display: inline-flex; align-items: center; height: 40px; padding: 0 22px; border: 1px solid #cfd4cf; border-radius: 999px;
          background: #fff; color: ${GREEN}; font-size: 13.5px; font-weight: 600; cursor: pointer; font-family: ${SYS}; transition: background 0.14s, border-color 0.14s; }
        .es15d-review-btn:hover { background: ${MINT}; border-color: ${MINT}; }

        @media (prefers-reduced-motion: reduce) {
          .es15d-buy, .es15d-add, .es15d-mini-media, .es15d-mini-media img { transition: none !important; }
          .es15d-mini:hover .es15d-mini-media img { transform: none; }
        }
      `}</style>

      <div className="es15d-wrap">
        {/* Breadcrumb */}
        <nav className="es15d-crumb" aria-label="Drobečková navigace">
          <a href={`/demo/${tenantSlug}`}>Domů</a>
          {crumbs.map((c) => (
            <span key={c.slug} style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 6 6 6-6 6"/></svg>
              <a href={`${basePath}?kategorie=${c.slug}`}>{c.name}</a>
            </span>
          ))}
        </nav>

        {/* Horní blok */}
        <div className="es15d-top">
          <div>
            <div className="es15d-photo">
              {product.image_url && <img src={product.image_url} alt={product.image_alt ?? product.title} />}
              {product.cashback && <span className="es15d-cashback" style={{ top: 14, right: 14 }}>Cashback</span>}
            </div>
            <div className="es15d-chiprow">
              {product.isNew && <span className="es15d-chip" style={{ background: PINK_SOFT, color: "#b3005f" }}>Novinka</span>}
              {product.rating && <span className="es15d-chip">NutraRating {product.rating}</span>}
              <span className="es15d-chip" style={{ background: EGGSHELL }}>Ověřená kvalita</span>
            </div>
          </div>

          <div>
            {product.brand && (
              <a href={`${basePath}?znacka=${encodeURIComponent(product.brand)}`} style={{ fontSize: 14, fontWeight: 600, color: TEAL, textDecoration: "underline", textUnderlineOffset: 3 }}>{product.brand}</a>
            )}
            <h1 style={{ margin: "8px 0 0", fontFamily: SYS, fontSize: "clamp(24px, 2.4vw, 32px)", fontWeight: 800, letterSpacing: "-0.015em", lineHeight: 1.2, color: GREEN }}>{product.title}</h1>
            {descParagraphs[0] && (
              <p style={{ margin: "12px 0 0", fontSize: 14.5, lineHeight: 1.6, color: "#444" }}>
                {descParagraphs[0].length > 180 ? descParagraphs[0].slice(0, 180).replace(/\s\S*$/, "") + "…" : descParagraphs[0]}{" "}
                <a href="#es15d-popis" style={{ color: TEAL, fontWeight: 600 }}>Více informací</a>
              </p>
            )}

            {variant && (
              <div style={{ marginTop: 22 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                  {sale ? (
                    <>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 7, background: PINK, color: "#fff", fontSize: 19, fontWeight: 800, padding: "6px 13px", borderRadius: 8 }}>
                        {fmt(variant.price_cents)} <s style={{ fontWeight: 500, opacity: 0.75, fontSize: 14 }}>{fmt(variant.compare_at_price_cents!)}</s>
                      </span>
                      <span style={{ background: PINK_SOFT, color: "#b3005f", fontSize: 13, fontWeight: 800, padding: "6px 11px", borderRadius: 8 }}>Wow!</span>
                    </>
                  ) : (
                    <span style={{ fontSize: 27, fontWeight: 800, color: INK, letterSpacing: "-0.01em" }}>{fmt(variant.price_cents)}</span>
                  )}
                </div>
                {product.subtitle && <div style={{ marginTop: 5, fontSize: 12.5, color: MUTED }}>{product.subtitle}</div>}
                {product.pro_cents != null && (
                  <span style={{ display: "inline-flex", marginTop: 10, background: LIME_SOFT, color: GREEN, fontSize: 13.5, fontWeight: 700, padding: "6px 12px", borderRadius: 8 }}>
                    {fmt(product.pro_cents)} s apatyka PRO
                  </span>
                )}

                <div style={{ marginTop: 18 }}>
                  <button className={`es15d-buy${bought ? " is-added" : ""}`} disabled={buying || !inStock} onClick={buy}>
                    {bought ? (
                      <>
                        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                        Přidáno do košíku
                      </>
                    ) : inStock ? `Koupit za ${fmt(variant.price_cents)}` : "Vyprodáno"}
                  </button>
                </div>

                <div style={{ marginTop: 18 }}>
                  <div className="es15d-avail">
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#159a62" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                    <span>
                      <b style={{ color: "#159a62" }}>{inStock ? `Skladem ${variant.stock_qty >= 5 ? "5 a více" : variant.stock_qty} kusů` : "Momentálně vyprodáno"}</b>
                      {inStock && <span style={{ color: MUTED }}> — {deliveryText}</span>}
                    </span>
                  </div>
                  <div className="es15d-avail">
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={GREEN} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M13 3 4 14h6l-1 7 9-11h-6l1-7Z"/></svg>
                    <span>Apatyka Expresem již dnes od 08:30</span>
                  </div>
                  <div className="es15d-avail" style={{ borderBottom: "none" }}>
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={GREEN} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M5 17h-2v-11a1 1 0 0 1 1 -1h9v12m-4 0h6m4 0h2v-6h-8m0 -5h5l3 5"/><circle cx="7.5" cy="17.5" r="2"/><circle cx="17.5" cy="17.5" r="2"/></svg>
                    <span>{freeShippingText}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Ještě se může hodit */}
        <MiniRail heading="Ještě se může hodit" items={related} basePath={basePath} tenantSlug={tenantSlug} fmt={fmt} deliveryText={deliveryText} />

        {/* Sticky tab lišta */}
        <div className="es15d-tabs">
          <span className="es15d-tabname">{product.title}</span>
          <a href="#es15d-popis" className="es15d-tab">Vše o produktu</a>
          <a href="#es15d-info" className="es15d-tab">Doplňující informace</a>
          <a href="#es15d-recenze" className="es15d-tab">Hodnocení produktu</a>
          {variant && (
            <button className="es15d-tabbuy" disabled={buying || !inStock} onClick={buy}>
              {inStock ? `Koupit za ${fmt(variant.price_cents)}` : "Vyprodáno"}
            </button>
          )}
        </div>

        {/* Popis */}
        <div id="es15d-popis" className="es15d-body" style={{ scrollMarginTop: 90 }}>
          {descParagraphs.map((p, i) => <p key={i}>{p}</p>)}
          <h3>Použití</h3>
          <p>Užívejte dle doporučeného dávkování uvedeného na obalu, ideálně s jídlem a dostatkem tekutin. Nepřekračujte doporučenou denní dávku.</p>
          <h3>Upozornění</h3>
          <p>Doplněk stravy — není náhradou pestré stravy. Uchovávejte mimo dosah dětí, v suchu a při teplotě do 25 °C.</p>
        </div>

        {/* Doplňující informace */}
        <div id="es15d-info" className="es15d-info" style={{ scrollMarginTop: 90 }}>
          <h2 style={{ margin: 0, textAlign: "center", fontFamily: SYS, fontSize: "clamp(21px, 2.1vw, 27px)", fontWeight: 800, letterSpacing: "-0.02em", color: INK }}>Doplňující informace</h2>
          <dl className="es15d-info-card" style={{ margin: "22px auto 0" }}>
            {infoRows.map((r) => (
              <div key={r.label} className="es15d-info-row">
                <dt>{r.label}</dt>
                <dd>{r.value}</dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Recenze */}
        <div id="es15d-recenze" style={{ textAlign: "center", padding: "48px 0 8px", scrollMarginTop: 90 }}>
          <h2 style={{ margin: 0, fontFamily: SYS, fontSize: "clamp(21px, 2.1vw, 27px)", fontWeight: 800, letterSpacing: "-0.02em", color: GREEN }}>Recenze a zkušenosti s produktem</h2>
          <p style={{ margin: "16px 0 18px", fontSize: 15, color: "#444" }}>Ohodnoťte tento produkt jako první.</p>
          <button type="button" className="es15d-review-btn">Napište vlastní hodnocení</button>
        </div>

        {/* Často se kupuje společně */}
        <MiniRail heading="Často se kupuje společně" items={boughtTogether} basePath={basePath} tenantSlug={tenantSlug} fmt={fmt} deliveryText={deliveryText} />
      </div>
    </div>
  );
}
