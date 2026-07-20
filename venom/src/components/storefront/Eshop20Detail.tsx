"use client";

/**
 * Eshop20Detail — Vykuk (dedoles.cz DNA) detail produktu.
 * Breadcrumb → 2-col: foto karta (chipy Novinka/Léto, srdíčko) | panel:
 * Baloo uppercase H1, demo rating hvězdy + počet recenzí, cena (sleva červeně
 * + −N % pill), zelený pruh „2 + 1 ZDARMA — Kód: VYKUK", výběr velikosti
 * (pill chipy, vybraná růžová, tabulka velikostí link), růžová pill CTA Přidat
 * do košíku (vybraná varianta → pop-up košík), skladovost, benefity (doprava
 * zdarma nad 999 Kč, 100 dnů na vrácení), akordeony Popis produktu / Možnosti
 * dopravy → „Zákazníkům se také líbí" rail → recenze (SKVĚLÉ + demo karty
 * s Ověřeno) → limetkový výprodej pás s růžovou CTA.
 */

import { useState } from "react";

const HEAD = "'Baloo 2', 'Arial Rounded MT Bold', sans-serif";
const SANS = "'Figtree', 'Segoe UI', system-ui, sans-serif";
const COCOA = "#4b2413";
const PINK = "#f6a7d7";
const PINK_DK = "#f18cc8";
const PINK_DEEP = "#e0559f";
const LIME = "#d6e84a";
const CREAM = "#fdf8f0";
const INK = "#3c2010";
const MUTED = "#8a7160";
const LINE = "#efe4d5";
const GREEN = "#2f9e44";
const RED = "#e03131";
const GOLD = "#f2b01e";

export interface Es20DetailVariant {
  id: number;
  title: string;
  price_cents: number;
  compare_at_price_cents: number | null;
  stock_qty: number;
  is_default: boolean;
}

export interface Es20DetailMiniCard {
  slug: string;
  title: string;
  subtitle: string | null;
  price_cents: number;
  compare_cents: number | null;
  image_url: string | null;
  default_variant_id: number | null;
  is_new: boolean;
  is_summer: boolean;
}

interface Props {
  tenantSlug: string;
  basePath: string;
  currency: string;
  crumbs: Array<{ label: string; href?: string }>;
  product: {
    slug: string;
    title: string;
    subtitle: string | null;
    description: string | null;
    image_url: string | null;
    image_alt: string | null;
    is_new: boolean;
    is_summer: boolean;
  };
  variants: Es20DetailVariant[];
  promoText: string | null;
  promoCode: string | null;
  related: Es20DetailMiniCard[];
}

function Star({ fill = 1, size = 16 }: { fill?: number; size?: number }) {
  const id = `es20dstar-${Math.round(fill * 100)}`;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" style={{ display: "block" }}>
      <defs>
        <linearGradient id={id} x1="0" x2="1" y1="0" y2="0">
          <stop offset={`${fill * 100}%`} stopColor={GOLD} />
          <stop offset={`${fill * 100}%`} stopColor="#e5dcd0" />
        </linearGradient>
      </defs>
      <path d="M12 2.5l2.95 5.98 6.6.96-4.78 4.66 1.13 6.58L12 17.57l-5.9 3.11 1.13-6.58L2.45 9.44l6.6-.96L12 2.5z" fill={`url(#${id})`} />
    </svg>
  );
}

// deterministický demo rating ze slugu (4.3–4.9)
function demoRating(slug: string): { rating: number; count: number } {
  let h = 0;
  for (let i = 0; i < slug.length; i++) h = (h * 31 + slug.charCodeAt(i)) >>> 0;
  return { rating: 4.3 + (h % 7) / 10, count: 3 + (h % 46) };
}

const DEMO_REVIEWS = [
  { name: "Kamila V.", date: "24. 6. 2026", text: "Krásné barvy, sedí přesně podle tabulky. Kupuju už potřetí jako dárek." },
  { name: "Tomáš R.", date: "1. 4. 2026", text: "Pohodlné a po půl roce nošení vypadají pořád jako nové. Doporučuji." },
];

export function Eshop20Detail({ tenantSlug, basePath, currency, crumbs, product, variants, promoText, promoCode, related }: Props) {
  const defaultIdx = Math.max(0, variants.findIndex((v) => v.is_default));
  const [sel, setSel] = useState<number>(defaultIdx);
  const [qty, setQty] = useState(1);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const [loved, setLoved] = useState(false);
  const [recoAdded, setRecoAdded] = useState<string | null>(null);
  const [openAcc, setOpenAcc] = useState<number | null>(0);

  const v = variants[sel] ?? variants[0] ?? null;
  const fmt = (cents: number) =>
    new Intl.NumberFormat("cs-CZ", { style: "currency", currency, maximumFractionDigits: 0 }).format(cents / 100);

  const sale = v && v.compare_at_price_cents != null && v.compare_at_price_cents > v.price_cents;
  const pct = sale ? Math.round((1 - v!.price_cents / (v!.compare_at_price_cents as number)) * 100) : 0;
  const { rating, count } = demoRating(product.slug);
  const stars = [1, 2, 3, 4, 5].map(i => Math.max(0, Math.min(1, rating - (i - 1))));

  const addToCart = () => {
    if (!v || adding) return;
    setAdding(true);
    fetch(`/api/demo/${tenantSlug}/shop/cart/items`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ variant_id: v.id, qty }),
    })
      .then(() => {
        window.dispatchEvent(new Event("webero-cart-item-added"));
        setAdded(true);
        setTimeout(() => setAdded(false), 1800);
      })
      .finally(() => setAdding(false));
  };

  const addReco = (e: React.MouseEvent, it: Es20DetailMiniCard) => {
    e.preventDefault();
    e.stopPropagation();
    if (!it.default_variant_id) return;
    fetch(`/api/demo/${tenantSlug}/shop/cart/items`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ variant_id: it.default_variant_id, qty: 1 }),
    }).then(() => {
      window.dispatchEvent(new Event("webero-cart-item-added"));
      setRecoAdded(it.slug);
      setTimeout(() => setRecoAdded((cur) => (cur === it.slug ? null : cur)), 1600);
    });
  };

  const accordions: Array<{ title: string; body: React.ReactNode }> = [
    {
      title: "Popis produktu",
      body: (
        <>
          {product.description && <p style={{ margin: 0, fontSize: 14, lineHeight: 1.65, color: INK }}>{product.description}</p>}
          {product.subtitle && <p style={{ margin: "10px 0 0", fontSize: 13, color: MUTED }}>{product.subtitle}</p>}
        </>
      ),
    },
    {
      title: "Možnosti dopravy",
      body: (
        <ul style={{ margin: 0, padding: "0 0 0 18px", fontSize: 14, lineHeight: 1.8, color: INK }}>
          <li>Výdejní box — 59 Kč (zdarma nad 999 Kč)</li>
          <li>Kurýr na adresu — 89 Kč (zdarma nad 999 Kč)</li>
          <li>Pošta — 79 Kč</li>
          <li>Odesíláme do 48 hodin, vrácení až do 100 dnů</li>
        </ul>
      ),
    },
  ];

  return (
    <div style={{ fontFamily: SANS, background: CREAM }}>
      <style>{`
        .es20d-wrap { max-width: 1180px; margin: 0 auto; padding: 0 24px 50px; }
        .es20d-crumb { display: flex; align-items: center; gap: 8px; padding: 16px 0 18px; font-size: 13px; color: ${MUTED}; flex-wrap: wrap; }
        .es20d-crumb a { color: ${MUTED}; text-decoration: none; }
        .es20d-crumb a:hover { color: ${PINK_DEEP}; text-decoration: underline; text-underline-offset: 3px; }
        .es20d-cols { display: grid; grid-template-columns: minmax(0, 1.05fr) minmax(0, 1fr); gap: clamp(22px, 3.5vw, 52px); align-items: start; }
        @media (max-width: 900px) { .es20d-cols { grid-template-columns: 1fr; } }

        .es20d-size { min-width: 74px; height: 44px; padding: 0 16px; border: 1.5px solid ${LINE}; border-radius: 999px; background: #fff; color: ${INK};
          font-family: ${SANS}; font-size: 14px; font-weight: 700; cursor: pointer; transition: border-color 0.14s, background 0.14s, transform 0.13s; }
        .es20d-size:hover { border-color: ${PINK_DEEP}; transform: translateY(-1px); }
        .es20d-size.on { background: ${PINK}; border-color: ${PINK}; color: ${COCOA}; }
        .es20d-size[data-out="true"] { opacity: 0.45; text-decoration: line-through; }

        .es20d-cta { display: inline-flex; align-items: center; justify-content: center; gap: 10px; width: 100%; height: 56px; border: none; border-radius: 999px;
          background: ${PINK}; color: ${COCOA}; font-family: ${SANS}; font-size: 16px; font-weight: 800; cursor: pointer;
          box-shadow: 0 10px 24px rgba(56,25,12,0.16); transition: background 0.16s, transform 0.14s; }
        .es20d-cta:hover { background: ${PINK_DK}; transform: translateY(-2px); }
        .es20d-cta:disabled { opacity: 0.7; cursor: default; transform: none; }
        .es20d-cta.ok { background: ${GREEN}; color: #fff; }

        .es20d-qty { border: none; background: none; cursor: pointer; padding: 4px 12px; color: ${INK}; display: flex; align-items: center; }
        .es20d-qty:hover { opacity: 0.55; }

        .es20d-acc { border-top: 1px solid ${LINE}; }
        .es20d-accbtn { width: 100%; display: flex; align-items: center; justify-content: space-between; gap: 10px; padding: 16px 2px; border: none;
          background: none; cursor: pointer; font-family: ${HEAD}; font-weight: 700; font-size: 15px; letter-spacing: 0.05em; text-transform: uppercase; color: ${COCOA}; }

        .es20d-mini { flex: 0 0 auto; width: 218px; scroll-snap-align: start; position: relative; display: flex; flex-direction: column; background: #fff;
          border: 1.5px solid ${LINE}; border-radius: 18px; overflow: hidden; text-decoration: none; transition: transform 0.18s, box-shadow 0.2s, border-color 0.18s; }
        .es20d-mini:hover { transform: translateY(-4px); box-shadow: 0 16px 30px rgba(56,25,12,0.12); border-color: ${PINK}; }
        .es20d-mini-add { position: absolute; right: 8px; top: 152px; width: 36px; height: 36px; border: none; border-radius: 999px; background: ${PINK};
          color: ${COCOA}; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; box-shadow: 0 5px 14px rgba(56,25,12,0.18); transition: background 0.15s; }
        .es20d-mini-add:hover { background: ${PINK_DEEP}; color: #fff; }
        .es20d-mini-add.ok { background: ${GREEN}; color: #fff; }
        .es20d-rail { display: flex; gap: 13px; overflow-x: auto; scroll-snap-type: x mandatory; padding: 8px 2px 18px; scrollbar-width: none; }
        .es20d-rail::-webkit-scrollbar { display: none; }

        .es20d-salecta { display: inline-flex; align-items: center; gap: 9px; background: ${PINK}; color: ${COCOA}; text-decoration: none;
          font-size: 14.5px; font-weight: 800; padding: 13px 30px; border-radius: 999px; transition: background 0.16s, transform 0.14s; }
        .es20d-salecta:hover { background: ${PINK_DK}; transform: translateY(-2px); }
      `}</style>

      <div className="es20d-wrap">
        <nav className="es20d-crumb" aria-label="Drobečková navigace">
          {crumbs.map((c, i) => (
            <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
              {i > 0 && <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 6 6 6-6 6"/></svg>}
              {c.href ? <a href={c.href}>{c.label}</a> : <span style={{ color: INK, fontWeight: 600 }}>{c.label}</span>}
            </span>
          ))}
        </nav>

        <div className="es20d-cols">
          {/* Foto */}
          <div style={{ position: "relative", background: "#fff", border: `1.5px solid ${LINE}`, borderRadius: 22, overflow: "hidden" }}>
            <div style={{ position: "relative", aspectRatio: "1/1" }}>
              {product.image_url && <img src={product.image_url} alt={product.image_alt ?? product.title} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />}
              <span style={{ position: "absolute", left: 14, top: 14, display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 6 }}>
                {product.is_new && <span style={{ fontFamily: HEAD, fontWeight: 700, fontSize: 12, letterSpacing: "0.06em", textTransform: "uppercase", background: COCOA, color: "#fff", padding: "5px 14px", borderRadius: 999 }}>Novinka</span>}
                {product.is_summer && <span style={{ fontFamily: HEAD, fontWeight: 700, fontSize: 12, letterSpacing: "0.06em", textTransform: "uppercase", background: LIME, color: COCOA, padding: "5px 14px", borderRadius: 999 }}>Léto</span>}
              </span>
              <button
                onClick={() => setLoved(x => !x)}
                aria-pressed={loved}
                aria-label={loved ? "Odebrat z oblíbených" : "Přidat do oblíbených"}
                style={{ position: "absolute", right: 13, top: 13, width: 42, height: 42, border: "none", borderRadius: 999, background: "rgba(255,255,255,0.94)", color: loved ? PINK_DEEP : COCOA, cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", boxShadow: "0 3px 10px rgba(56,25,12,0.12)" }}
              >
                <svg width="19" height="19" viewBox="0 0 24 24" fill={loved ? PINK_DEEP : "none"} stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20.5s-8-4.9-8-11a4.6 4.6 0 0 1 8-3.1 4.6 4.6 0 0 1 8 3.1c0 6.1-8 11-8 11Z"/></svg>
              </button>
            </div>
          </div>

          {/* Panel */}
          <div>
            <h1 style={{ margin: 0, fontFamily: HEAD, fontWeight: 800, fontSize: "clamp(23px, 2.4vw, 32px)", lineHeight: 1.15, letterSpacing: "0.02em", textTransform: "uppercase", color: COCOA }}>{product.title}</h1>

            <a href="#es20d-reviews" style={{ display: "inline-flex", alignItems: "center", gap: 7, marginTop: 10, textDecoration: "none" }}>
              <span style={{ display: "inline-flex", gap: 1.5 }}>{stars.map((f, i) => <Star key={i} fill={f} size={15} />)}</span>
              <span style={{ fontSize: 13.5, fontWeight: 700, color: INK }}>{rating.toFixed(1).replace(".", ",")}</span>
              <span style={{ fontSize: 13, fontWeight: 500, color: MUTED }}>({count} recenze)</span>
            </a>

            {v && (
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 16, flexWrap: "wrap" }}>
                <span style={{ fontFamily: HEAD, fontWeight: 800, fontSize: 30, color: sale ? RED : COCOA }}>{fmt(v.price_cents)}</span>
                {sale && <s style={{ fontSize: 15, color: MUTED, fontWeight: 500 }}>{fmt(v.compare_at_price_cents!)}</s>}
                {sale && pct > 0 && <span style={{ background: RED, color: "#fff", fontFamily: HEAD, fontWeight: 700, fontSize: 13.5, padding: "4px 13px", borderRadius: 999 }}>−{pct} %</span>}
              </div>
            )}

            {promoText && (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginTop: 16, background: "rgba(47,158,68,0.1)", border: "1px solid rgba(47,158,68,0.25)", borderRadius: 12, padding: "10px 16px" }}>
                <span style={{ fontSize: 13.5, fontWeight: 800, letterSpacing: "0.04em", textTransform: "uppercase", color: GREEN }}>{promoText}</span>
                {promoCode && (
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 7, fontSize: 13, fontWeight: 700, color: INK }}>
                    Kód: <span style={{ fontFamily: HEAD, letterSpacing: "0.06em", background: "#fff", border: `1.5px dashed ${GREEN}`, borderRadius: 8, padding: "3px 10px" }}>{promoCode}</span>
                  </span>
                )}
              </div>
            )}

            {variants.length > 1 && (
              <div style={{ marginTop: 20 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                  <span style={{ fontSize: 13.5, fontWeight: 800, letterSpacing: "0.05em", textTransform: "uppercase", color: INK }}>Vyberte velikost</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: MUTED, textDecoration: "underline", textUnderlineOffset: 3 }}>Tabulka velikostí</span>
                </div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {variants.map((vv, i) => (
                    <button key={vv.id} className={`es20d-size${i === sel ? " on" : ""}`} data-out={vv.stock_qty <= 0} onClick={() => setSel(i)} aria-pressed={i === sel}>
                      {vv.title}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 20 }}>
              <span style={{ display: "inline-flex", alignItems: "center", border: `1.5px solid ${LINE}`, borderRadius: 999, background: "#fff", height: 56 }}>
                <button className="es20d-qty" onClick={() => setQty(q => Math.max(1, q - 1))} aria-label="Snížit množství">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12"/></svg>
                </button>
                <span style={{ fontSize: 15.5, fontWeight: 800, minWidth: 26, textAlign: "center" }}>{qty}</span>
                <button className="es20d-qty" onClick={() => setQty(q => Math.min(99, q + 1))} aria-label="Zvýšit množství">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12"/><line x1="12" y1="5" x2="12" y2="19"/></svg>
                </button>
              </span>
              <button className={`es20d-cta${added ? " ok" : ""}`} onClick={addToCart} disabled={adding || !v || v.stock_qty <= 0}>
                {added ? (
                  <>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="m4.5 12.5 5 5 10-11"/></svg>
                    Přidáno
                  </>
                ) : v && v.stock_qty <= 0 ? "Vyprodáno" : (
                  <>
                    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M6.3 8.5h11.4l1.3 11a1.6 1.6 0 0 1-1.6 1.8H6.6A1.6 1.6 0 0 1 5 19.5l1.3-11Z"/><path d="M8.8 10.5V6.7a3.2 3.2 0 0 1 6.4 0v3.8"/></svg>
                    Přidat do košíku
                  </>
                )}
              </button>
            </div>

            {v && v.stock_qty > 0 && (
              <div style={{ display: "flex", alignItems: "center", gap: 7, marginTop: 12, fontSize: 13, fontWeight: 700, color: GREEN }}>
                <span style={{ width: 7, height: 7, borderRadius: 999, background: GREEN }} />
                Skladem · Odesíláme za 1–2 pracovní dny
              </div>
            )}

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 18, background: "#fff", border: `1.5px solid ${LINE}`, borderRadius: 14, padding: "14px 18px" }}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 9, fontSize: 13, fontWeight: 600, color: INK }}>
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={COCOA} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M2.5 6h11v10h-11zM13.5 9.5h4l3 3.5v3h-7"/><circle cx="6.5" cy="17.5" r="1.7"/><circle cx="17" cy="17.5" r="1.7"/></svg>
                Doprava <b>&nbsp;zdarma&nbsp;</b> nad 999 Kč
              </span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 9, fontSize: 13, fontWeight: 600, color: INK }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={COCOA} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 2.6-6.4L3 8"/><path d="M3 3v5h5"/></svg>
                Až 100 dnů na vrácení
              </span>
            </div>

            <div style={{ marginTop: 24 }}>
              {accordions.map((a, i) => (
                <div key={a.title} className="es20d-acc">
                  <button className="es20d-accbtn" onClick={() => setOpenAcc(openAcc === i ? null : i)} aria-expanded={openAcc === i}>
                    {a.title}
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" style={{ transform: openAcc === i ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}><path d="m6 9 6 6 6-6"/></svg>
                  </button>
                  {openAcc === i && <div style={{ padding: "0 2px 18px" }}>{a.body}</div>}
                </div>
              ))}
              <div style={{ borderTop: `1px solid ${LINE}` }} />
            </div>
          </div>
        </div>

        {/* Zákazníkům se také líbí */}
        {related.length > 0 && (
          <div style={{ marginTop: "clamp(38px, 5vw, 64px)" }}>
            <div style={{ textAlign: "center", marginBottom: 16 }}>
              <h2 style={{
                display: "inline-block", margin: 0, fontFamily: HEAD, fontWeight: 800, fontSize: "clamp(19px, 2vw, 26px)",
                letterSpacing: "0.03em", textTransform: "uppercase", color: COCOA, paddingBottom: 10,
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='5' viewBox='0 0 20 5'%3E%3Cpath d='M0 3.5c2.5 0 2.5-2.5 5-2.5s2.5 2.5 5 2.5 2.5-2.5 5-2.5 2.5 2.5 5 2.5' fill='none' stroke='%23f6a7d7' stroke-width='1.8' stroke-linecap='round'/%3E%3C/svg%3E")`,
                backgroundRepeat: "repeat-x", backgroundPosition: "center bottom",
              }}>Zákazníkům se také líbí</h2>
            </div>
            <div className="es20d-rail">
              {related.map((it) => {
                const rsale = it.compare_cents != null && it.compare_cents > it.price_cents;
                const rpct = rsale ? Math.round((1 - it.price_cents / (it.compare_cents as number)) * 100) : 0;
                return (
                  <a key={it.slug} href={`${basePath}/${it.slug}`} className="es20d-mini">
                    <span style={{ position: "relative", aspectRatio: "1/1", overflow: "hidden", background: CREAM, display: "block" }}>
                      {it.image_url && <img src={it.image_url} alt={it.title} loading="lazy" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />}
                      <span style={{ position: "absolute", left: 8, top: 8, display: "flex", flexDirection: "column", gap: 4, alignItems: "flex-start" }}>
                        {it.is_new && <span style={{ fontFamily: HEAD, fontWeight: 700, fontSize: 10.5, letterSpacing: "0.06em", textTransform: "uppercase", background: COCOA, color: "#fff", padding: "3px 10px", borderRadius: 999 }}>Novinka</span>}
                        {it.is_summer && <span style={{ fontFamily: HEAD, fontWeight: 700, fontSize: 10.5, letterSpacing: "0.06em", textTransform: "uppercase", background: LIME, color: COCOA, padding: "3px 10px", borderRadius: 999 }}>Léto</span>}
                      </span>
                    </span>
                    {it.default_variant_id != null && (
                      <button className={`es20d-mini-add${recoAdded === it.slug ? " ok" : ""}`} onClick={(e) => addReco(e, it)} aria-label={`Přidat ${it.title} do košíku`}>
                        {recoAdded === it.slug ? (
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                        ) : (
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
                        )}
                      </button>
                    )}
                    <span style={{ display: "flex", flexDirection: "column", flex: 1, padding: "10px 12px 12px" }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: INK, lineHeight: 1.4, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", minHeight: "2.8em" }}>{it.title}</span>
                      <span style={{ display: "flex", alignItems: "center", gap: 7, marginTop: "auto", paddingTop: 8 }}>
                        <span style={{ fontFamily: HEAD, fontWeight: 800, fontSize: 15.5, color: rsale ? RED : COCOA }}>{fmt(it.price_cents)}</span>
                        {rsale && <s style={{ fontSize: 11.5, color: MUTED }}>{fmt(it.compare_cents!)}</s>}
                        {rsale && rpct > 0 && <span style={{ marginLeft: "auto", background: RED, color: "#fff", fontFamily: HEAD, fontWeight: 700, fontSize: 10.5, padding: "2px 8px", borderRadius: 999 }}>−{rpct} %</span>}
                      </span>
                    </span>
                  </a>
                );
              })}
            </div>
          </div>
        )}

        {/* Recenze */}
        <div id="es20d-reviews" style={{ marginTop: "clamp(34px, 4.5vw, 56px)", background: "#fff", border: `1.5px solid ${LINE}`, borderRadius: 22, padding: "clamp(20px, 3vw, 34px)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", marginBottom: 18 }}>
            <span style={{ fontFamily: HEAD, fontWeight: 800, fontSize: 18, letterSpacing: "0.06em", textTransform: "uppercase", color: COCOA }}>Skvělé</span>
            <span style={{ display: "inline-flex", gap: 2 }}>{stars.map((f, i) => <Star key={i} fill={f} size={17} />)}</span>
            <span style={{ fontSize: 13.5, fontWeight: 600, color: MUTED }}>({count} recenzí)</span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 14 }}>
            {DEMO_REVIEWS.map((r) => (
              <div key={r.name} style={{ background: CREAM, borderRadius: 16, padding: "18px 20px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                  <span style={{ display: "inline-flex", gap: 1.5 }}>{[1,2,3,4,5].map(i => <Star key={i} fill={1} size={13} />)}</span>
                  <span style={{ fontSize: 12, color: MUTED }}>{r.date}</span>
                  <span style={{ marginLeft: "auto", display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11.5, fontWeight: 700, color: GREEN }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2.5 4.5 5.5v6c0 4.6 3.2 8 7.5 10 4.3-2 7.5-5.4 7.5-10v-6L12 2.5Z"/><path d="m8.8 12 2.3 2.3 4.1-4.6"/></svg>
                    Ověřeno
                  </span>
                </div>
                <div style={{ fontSize: 13.5, fontWeight: 700, color: INK, marginBottom: 5 }}>{r.name}</div>
                <div style={{ fontSize: 13.5, color: INK, lineHeight: 1.55 }}>{r.text}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Limetkový výprodej pás */}
      <div style={{ background: LIME }}>
        <div style={{ maxWidth: 1180, margin: "0 auto", padding: "18px 24px", display: "flex", alignItems: "center", justifyContent: "center", gap: 22, flexWrap: "wrap" }}>
          <span style={{ fontFamily: HEAD, fontWeight: 800, fontSize: "clamp(16px, 1.7vw, 21px)", letterSpacing: "0.04em", textTransform: "uppercase", color: COCOA }}>Letní výprodej až do −70 %</span>
          <a href={`${basePath}?kategorie=letni-vyprodej`} className="es20d-salecta">
            Ponoř se!
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
          </a>
        </div>
      </div>
    </div>
  );
}
