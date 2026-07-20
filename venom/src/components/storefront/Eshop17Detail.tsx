"use client";

/**
 * Eshop17Detail — Rozkvět (florea.cz DNA 1:1) detail produktu.
 * Breadcrumb → 2 sloupce: galerie s miniaturami | Fraunces H1 + TIP badge +
 * popis se „zobrazit více" → box dostupnosti (zeleně) + cenový box (Cena
 * s DPH | qty stepper | zelené Přidat do košíku → otevře pop-up košík) →
 * bordó upsell pruh „svážeme vám vlastní kytici" → Průvodce velikostí květů
 * (3 velikosti kytice SVG) + „Mohlo by vás před nákupem zajímat" odkazy →
 * Podrobnější informace (tabulka) → benefity řádek → „Naše další nabídka
 * z kategorie" grid florea karet.
 */

import { useState } from "react";

const BORDO = "#8f1d3d";
const BORDO_DK = "#611028";
const GOLD = "#c9a24b";
const GREEN = "#3c7d46";
const GREEN_DK = "#2f6238";
const INK = "#241a1d";
const MUTED = "#7d6d72";
const CREAM = "#f7f1e8";
const LINE = "#eadfd6";
const HEAD = "'Fraunces', Georgia, serif";
const SANS = "'Instrument Sans', 'Segoe UI', system-ui, sans-serif";

export interface Es17DetailMiniCard {
  slug: string;
  title: string;
  image_url: string | null;
  price_cents: number;
  compare_cents: number | null;
  stock_total: number;
  bulk: number | null;
  featured: boolean;
  free_ship: boolean;
}

interface Props {
  tenantSlug: string;
  basePath: string;
  currency: string;
  crumbs: Array<{ label: string; href?: string }>;
  product: {
    title: string;
    subtitle: string | null;
    description: string | null;
    image_url: string | null;
    image_alt: string | null;
    bulk: number | null;
    featured: boolean;
    free_ship: boolean;
    sku: string | null;
  };
  variant: { id: number; price_cents: number; compare_at_price_cents: number | null; stock_qty: number } | null;
  infoRows: Array<{ label: string; value: string }>;
  related: Es17DetailMiniCard[];
  categoryName: string | null;
}

const GUIDE_LINKS = [
  "Význam počtu růží",
  "Kolik růží k narozeninám",
  "Přání k svátku podle jmen",
  "Proč jsou naše kytice na eshopu jen virtuální?",
];

export function Eshop17Detail({ tenantSlug, basePath, currency, crumbs, product, variant, infoRows, related, categoryName }: Props) {
  const [qty, setQty] = useState(1);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const [descOpen, setDescOpen] = useState(false);
  const [thumb, setThumb] = useState(0);

  const fmt = (cents: number) =>
    new Intl.NumberFormat("cs-CZ", { style: "currency", currency, maximumFractionDigits: 0 }).format(cents / 100);
  const deliveryDate = new Intl.DateTimeFormat("cs-CZ", { day: "numeric", month: "numeric", year: "numeric" })
    .format(new Date(Date.now() + 24 * 3600 * 1000));

  const sale = variant?.compare_at_price_cents != null && variant.compare_at_price_cents > variant.price_cents;
  const inStock = (variant?.stock_qty ?? 0) > 50;

  // Galerie: jedna DB fotka → 3 pohledy přes rozdílné cropy (demo)
  const galleryUrls = product.image_url
    ? [
        product.image_url,
        product.image_url.replace("fit=crop", "fit=crop&crop=entropy"),
        product.image_url.replace("fit=crop", "fit=crop&crop=top"),
      ]
    : [];

  const addToCart = () => {
    if (!variant || adding) return;
    setAdding(true);
    fetch(`/api/demo/${tenantSlug}/shop/cart/items`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ variant_id: variant.id, qty }),
    })
      .then(() => {
        window.dispatchEvent(new Event("webero-cart-item-added"));
        setAdded(true);
        setTimeout(() => setAdded(false), 1800);
      })
      .finally(() => setAdding(false));
  };

  const desc = product.description ?? "";
  const shortDesc = desc.length > 260 && !descOpen ? desc.slice(0, 260).replace(/\s+\S*$/, "") + "…" : desc;

  return (
    <div style={{ fontFamily: SANS, background: "#fff" }}>
      <style>{`
        .es17d-wrap { max-width: 1420px; margin: 0 auto; padding: 0 28px 50px; }
        .es17d-crumb { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; padding: 16px 0 14px; font-size: 13px; color: ${MUTED}; }
        .es17d-crumb a { color: ${BORDO}; text-decoration: none; font-weight: 600; }
        .es17d-crumb a:hover { text-decoration: underline; text-underline-offset: 3px; }

        .es17d-cols { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1.15fr); gap: clamp(24px, 3.4vw, 56px); align-items: start; }
        @media (max-width: 980px) { .es17d-cols { grid-template-columns: 1fr; } }

        .es17d-main-img { position: relative; aspect-ratio: 1/1; border: 1px solid ${LINE}; border-radius: 16px; overflow: hidden; background: ${CREAM}; }
        .es17d-main-img img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
        .es17d-thumbs { display: flex; gap: 10px; margin-top: 12px; }
        .es17d-thumb { width: 84px; height: 84px; border-radius: 10px; overflow: hidden; border: 2px solid ${LINE}; padding: 0; cursor: pointer; background: ${CREAM}; transition: border-color 0.14s, opacity 0.14s; opacity: 0.75; }
        .es17d-thumb img { width: 100%; height: 100%; object-fit: cover; display: block; }
        .es17d-thumb.on { border-color: ${BORDO}; opacity: 1; }
        .es17d-thumb:hover { opacity: 1; }

        .es17d-badge { display: inline-flex; align-items: center; gap: 6px; font-size: 11px; font-weight: 700; letter-spacing: 0.05em; padding: 5px 11px; border-radius: 6px; color: #fff; }

        .es17d-more { border: none; background: none; color: ${BORDO}; font-family: ${SANS}; font-size: 13.5px; font-weight: 700; cursor: pointer; text-decoration: underline; text-underline-offset: 3px; padding: 0; }
        .es17d-more:hover { color: ${BORDO_DK}; }

        .es17d-buybox { border: 1px solid ${LINE}; border-radius: 14px; background: ${CREAM}; padding: 18px 20px; margin-top: 20px; }
        .es17d-qty { display: inline-flex; align-items: center; background: #fff; border: 1px solid ${LINE}; border-radius: 999px; }
        .es17d-qty button { border: none; background: none; cursor: pointer; color: ${INK}; font-size: 17px; padding: 8px 14px; line-height: 1; transition: opacity 0.13s; }
        .es17d-qty button:hover { opacity: 0.55; }
        .es17d-add { display: inline-flex; align-items: center; gap: 10px; border: none; cursor: pointer; background: ${GREEN}; color: #fff;
          font-family: ${SANS}; font-size: 15px; font-weight: 700; padding: 14px 28px; border-radius: 999px; transition: background 0.16s, transform 0.14s;
          box-shadow: 0 10px 24px rgba(60,125,70,0.32); }
        .es17d-add:hover { background: ${GREEN_DK}; transform: translateY(-1px); }
        .es17d-add[disabled] { opacity: 0.6; cursor: default; transform: none; }

        .es17d-upsell { background: ${BORDO}; color: #fff; border-radius: 12px; padding: 14px 18px; margin-top: 14px; font-size: 14px; line-height: 1.55; }
        .es17d-upsell a { color: #fff; font-weight: 700; text-decoration: underline; text-underline-offset: 3px; }
        .es17d-upsell a:hover { color: #e7c886; }

        .es17d-h2 { font-family: ${HEAD}; font-weight: 600; font-size: clamp(19px, 1.7vw, 24px); color: ${BORDO}; margin: 0 0 14px; }
        .es17d-guide-link { display: block; padding: 7px 0; font-size: 14px; font-weight: 600; color: ${BORDO}; text-decoration: none; }
        .es17d-guide-link:hover { text-decoration: underline; text-underline-offset: 3px; }

        .es17d-info { border: 1px solid ${LINE}; border-radius: 12px; overflow: hidden; }
        .es17d-info-row { display: grid; grid-template-columns: 200px 1fr; gap: 14px; padding: 11px 16px; font-size: 14px; }
        .es17d-info-row:nth-child(odd) { background: ${CREAM}; }
        .es17d-info-row b { font-weight: 700; color: ${INK}; }

        .es17d-bens { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 16px; border-top: 1px solid ${LINE}; border-bottom: 1px solid ${LINE}; padding: 22px 0; margin: 36px 0 30px; }
        @media (max-width: 900px) { .es17d-bens { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
        .es17d-ben { display: flex; align-items: center; gap: 12px; }
        .es17d-ben-ico { width: 42px; height: 42px; border-radius: 999px; background: ${CREAM}; color: ${BORDO}; border: 1px solid ${LINE}; display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .es17d-ben b { display: block; font-size: 13.5px; font-weight: 700; color: ${INK}; }
        .es17d-ben span { display: block; font-size: 12px; color: ${MUTED}; }

        .es17d-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 16px; }
        @media (max-width: 1100px) { .es17d-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
        .es17d-card { background: #fff; border: 1px solid ${LINE}; border-radius: 12px; overflow: hidden; text-decoration: none;
          display: flex; flex-direction: column; transition: transform 0.18s, box-shadow 0.2s, border-color 0.18s; }
        .es17d-card:hover { transform: translateY(-3px); box-shadow: 0 18px 36px rgba(46,10,24,0.11); border-color: #ddc9b4; }
        .es17d-card-title { padding: 12px 14px 9px; font-size: 13.5px; font-weight: 700; color: ${INK}; line-height: 1.4;
          overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; min-height: calc(2.8em + 21px); }
        .es17d-card:hover .es17d-card-title { color: ${BORDO}; }
        .es17d-card-media { position: relative; aspect-ratio: 1/1; overflow: hidden; background: ${CREAM}; }
        .es17d-card-media img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; transition: transform 0.5s cubic-bezier(0.16,1,0.3,1); }
        .es17d-card:hover .es17d-card-media img { transform: scale(1.06); }
        .es17d-card-detail { margin-left: auto; display: inline-flex; align-items: center; background: ${GREEN}; color: #fff; font-size: 12.5px;
          font-weight: 700; padding: 8px 15px; border-radius: 999px; transition: background 0.15s; }
        .es17d-card:hover .es17d-card-detail { background: ${GREEN_DK}; }
      `}</style>

      <div className="es17d-wrap">
        {/* Breadcrumb */}
        <nav className="es17d-crumb" aria-label="Drobečková navigace">
          {crumbs.map((c, i) => (
            <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
              {i > 0 && <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 6 6 6-6 6"/></svg>}
              {c.href ? <a href={c.href}>{c.label}</a> : <span style={{ color: INK, fontWeight: 500 }}>{c.label}</span>}
            </span>
          ))}
        </nav>

        <div className="es17d-cols">
          {/* ═══ GALERIE ═══ */}
          <div>
            <div className="es17d-main-img">
              {galleryUrls[thumb] && <img src={galleryUrls[thumb]} alt={product.image_alt ?? product.title} />}
              <span style={{ position: "absolute", left: 12, top: 12, display: "flex", flexDirection: "column", gap: 6 }}>
                {product.bulk != null && <span className="es17d-badge" style={{ background: BORDO }}>MNOŽSTEVNÍ SLEVA {product.bulk} %</span>}
                {product.free_ship && <span className="es17d-badge" style={{ background: GREEN }}>DOPRAVA ZDARMA</span>}
              </span>
            </div>
            {galleryUrls.length > 1 && (
              <div className="es17d-thumbs">
                {galleryUrls.map((u, i) => (
                  <button key={i} type="button" className={`es17d-thumb${thumb === i ? " on" : ""}`} onClick={() => setThumb(i)} aria-label={`Náhled ${i + 1}`}>
                    <img src={u.replace(/w=\d+/, "w=180").replace(/h=\d+/, "h=180")} alt="" loading="lazy" />
                  </button>
                ))}
              </div>
            )}

            {/* Průvodce velikostí */}
            <div style={{ marginTop: 30 }}>
              <h2 className="es17d-h2">Průvodce velikostí květů a délek květin</h2>
              <div style={{ border: `1px solid ${LINE}`, borderRadius: 14, background: CREAM, padding: "20px 22px", display: "flex", alignItems: "flex-end", gap: "clamp(14px, 3vw, 40px)", justifyContent: "center" }}>
                {[{ h: 52, l: "40–50 cm" }, { h: 74, l: "60–70 cm" }, { h: 96, l: "80+ cm" }].map((s, i) => (
                  <span key={i} style={{ display: "inline-flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                    <svg width={s.h * 0.85} height={s.h} viewBox="0 0 40 48" aria-hidden="true">
                      <circle cx="20" cy="14" r={9 + i * 2.4} fill={BORDO} opacity={0.85 + i * 0.05} />
                      <circle cx="14" cy="10" r={3 + i} fill="#b34762" />
                      <circle cx="26" cy="11" r={2.6 + i} fill="#7a1934" />
                      <path d={`M20 ${14 + 9 + i * 2.4} L20 46`} stroke={GREEN} strokeWidth="2.2" strokeLinecap="round" />
                      <path d={`M20 ${30 + i * 2} q 6 -2 8 -7`} stroke={GREEN} strokeWidth="1.8" fill="none" strokeLinecap="round" />
                    </svg>
                    <span style={{ fontSize: 12.5, fontWeight: 700, color: INK }}>{s.l}</span>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* ═══ INFO SLOUPEC ═══ */}
          <div>
            <h1 style={{ margin: 0, fontFamily: HEAD, fontSize: "clamp(26px, 2.6vw, 36px)", fontWeight: 600, letterSpacing: "-0.01em", color: BORDO, lineHeight: 1.15 }}>{product.title}</h1>
            {product.featured && (
              <span className="es17d-badge" style={{ background: GOLD, color: BORDO_DK, marginTop: 12 }}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M3.5 3.5h7.6l9.4 9.4a1.7 1.7 0 0 1 0 2.4l-5.2 5.2a1.7 1.7 0 0 1-2.4 0L3.5 11V3.5Z"/><circle cx="8" cy="8" r="1.4"/></svg>
                TIP
              </span>
            )}

            {desc && (
              <p style={{ margin: "16px 0 0", fontSize: 14.5, lineHeight: 1.65, color: INK }}>
                {shortDesc}{" "}
                {desc.length > 260 && (
                  <button type="button" className="es17d-more" onClick={() => setDescOpen(!descOpen)}>{descOpen ? "zobrazit méně" : "zobrazit více"}</button>
                )}
              </p>
            )}

            {/* Buy box */}
            <div className="es17d-buybox">
              <div style={{ fontSize: 14, fontWeight: 700, color: (variant?.stock_qty ?? 0) > 0 ? GREEN_DK : MUTED, marginBottom: 12 }}>
                {(variant?.stock_qty ?? 0) <= 0 ? "Vyprodáno" : inStock ? `Skladem ${variant!.stock_qty} kusů` : (
                  <>
                    {variant!.stock_qty} {variant!.stock_qty >= 5 ? "kusů" : variant!.stock_qty === 1 ? "kus" : "kusy"}
                    <span style={{ fontWeight: 600, color: INK }}> • dodání od {deliveryDate}</span>
                  </>
                )}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
                <span>
                  <span style={{ display: "block", fontSize: 12.5, color: MUTED }}>Cena s DPH</span>
                  <span style={{ display: "inline-flex", alignItems: "baseline", gap: 9 }}>
                    {sale && <s style={{ color: MUTED, fontSize: 14, fontWeight: 500 }}>{fmt(variant!.compare_at_price_cents!)}</s>}
                    <span style={{ fontFamily: HEAD, fontSize: 31, fontWeight: 600, color: BORDO, letterSpacing: "-0.01em" }}>{variant ? fmt(variant.price_cents) : "—"}</span>
                  </span>
                </span>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 12, marginLeft: "auto" }}>
                  <span className="es17d-qty">
                    <button type="button" onClick={() => setQty(Math.max(1, qty - 1))} aria-label="Snížit množství">−</button>
                    <span style={{ fontSize: 14.5, fontWeight: 700, minWidth: 26, textAlign: "center" }}>{qty}</span>
                    <button type="button" onClick={() => setQty(qty + 1)} aria-label="Zvýšit množství">+</button>
                  </span>
                  <button type="button" className="es17d-add" disabled={adding || !variant || (variant.stock_qty ?? 0) <= 0} onClick={addToCart}>
                    {added ? (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                    ) : (
                      <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="20" r="1.4"/><circle cx="17.5" cy="20" r="1.4"/><path d="M2.5 3.5h2.6l2.5 12h10.2l2.2-8.5H6.2"/></svg>
                    )}
                    {added ? "Přidáno" : "Přidat do košíku"}
                  </button>
                </span>
              </div>
            </div>

            {/* Upsell pruh */}
            <div className="es17d-upsell">
              Nevybrali jste si z připravených kytic? Nevadí, svážeme vám vlastní z jakýchkoli <a href={`${basePath}?kategorie=ruze`}>řezaných růží</a> či <a href={`${basePath}?kategorie=kvetiny`}>dalších květin</a>.
            </div>

            {/* Mohlo by vás zajímat */}
            <div style={{ marginTop: 28 }}>
              <h2 className="es17d-h2">Mohlo by vás před nákupem zajímat</h2>
              {GUIDE_LINKS.map((l) => (
                <a key={l} href={basePath} className="es17d-guide-link">{l}</a>
              ))}
            </div>

            {/* Podrobnější informace */}
            {infoRows.length > 0 && (
              <div style={{ marginTop: 28 }}>
                <h2 className="es17d-h2">Podrobnější informace</h2>
                <div className="es17d-info">
                  {infoRows.map((r) => (
                    <div key={r.label} className="es17d-info-row">
                      <b>{r.label}</b>
                      <span>{r.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Benefity řádek */}
        <div className="es17d-bens">
          {[
            { t: "Doprava zdarma", s: "při nákupu nad 1 590 Kč", i: "pig" },
            { t: "Rozvoz po celé ČR", s: "vlastními chlazenými vozy", i: "truck" },
            { t: "Tisíce ověřených hodnocení", s: "poznejte kvalitu našich služeb", i: "thumb" },
            { t: "Reálná skladová dostupnost", s: "všechny květiny máme skladem", i: "box" },
          ].map((b) => (
            <div key={b.t} className="es17d-ben">
              <span className="es17d-ben-ico">
                {b.i === "pig" && <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M19 10c.8.3 1.5.4 2 .3v3.2c-.6 0-1.2.2-1.7.6-.4 1.2-1.2 2.3-2.3 3v2.4h-2.5l-.7-1.5a9 9 0 0 1-3.6 0l-.7 1.5H7v-2.4a7 7 0 0 1-2.6-4.1H2.5v-3h1.9A7 7 0 0 1 11 5.5c3.7 0 6.8 1.8 8 4.5Z"/><circle cx="15.5" cy="10.5" r="0.8" fill="currentColor"/></svg>}
                {b.i === "truck" && <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M5 17h-2v-11a1 1 0 0 1 1 -1h9v12m-4 0h6m4 0h2v-6h-8m0 -5h5l3 5"/><circle cx="7.5" cy="17.5" r="2"/><circle cx="17.5" cy="17.5" r="2"/></svg>}
                {b.i === "thumb" && <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M7 11v9H3.5v-9H7Zm0 0 4-7c1.3 0 2.4 1 2.4 2.4l-.6 3.3h6.2a1.8 1.8 0 0 1 1.8 2.2l-1.4 6.3a1.8 1.8 0 0 1-1.8 1.4H7"/></svg>}
                {b.i === "box" && <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2.5 21 7v10l-9 4.5L3 17V7l9-4.5Z"/><path d="m3 7 9 4.5L21 7"/><path d="M12 11.5V21.5"/></svg>}
              </span>
              <span><b>{b.t}</b><span>{b.s}</span></span>
            </div>
          ))}
        </div>

        {/* Naše další nabídka */}
        {related.length > 0 && (
          <div>
            <h2 className="es17d-h2" style={{ textAlign: "center", fontSize: "clamp(21px, 2vw, 28px)", marginBottom: 20 }}>
              Naše další nabídka{categoryName ? ` z kategorie ${categoryName}` : ""}
            </h2>
            <div className="es17d-grid">
              {related.slice(0, 4).map((r) => {
                const rSale = r.compare_cents != null && r.compare_cents > r.price_cents;
                const rIn = r.stock_total > 50;
                return (
                  <a key={r.slug} className="es17d-card" href={`${basePath}/${r.slug}`}>
                    <span className="es17d-card-title">{r.title}</span>
                    <span className="es17d-card-media">
                      {r.image_url && <img src={r.image_url} alt={r.title} loading="lazy" />}
                      {r.bulk != null && <span className="es17d-badge" style={{ position: "absolute", top: 9, right: 9, background: BORDO, fontSize: 10 }}>MNOŽSTEVNÍ SLEVA {r.bulk} %</span>}
                      <span style={{ position: "absolute", right: 9, bottom: 9, display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 5 }}>
                        {r.free_ship && <span className="es17d-badge" style={{ background: GREEN, fontSize: 10 }}>DOPRAVA ZDARMA</span>}
                        {rSale && <span className="es17d-badge" style={{ background: BORDO_DK, fontSize: 10 }}>−{Math.round((1 - r.price_cents / (r.compare_cents as number)) * 100)} %</span>}
                      </span>
                    </span>
                    <span style={{ fontSize: 12, padding: "9px 14px 0", minHeight: "2.1em" }}>
                      {r.stock_total <= 0 ? (
                        <span style={{ color: MUTED, fontWeight: 600 }}>Vyprodáno</span>
                      ) : rIn ? (
                        <span style={{ color: GREEN_DK, fontWeight: 700 }}>Skladem {r.stock_total} kusů</span>
                      ) : (
                        <>
                          <span style={{ color: GREEN_DK, fontWeight: 700 }}>{r.stock_total} {r.stock_total >= 5 ? "kusů" : r.stock_total === 1 ? "kus" : "kusy"}</span>
                          <span style={{ display: "block", color: INK, fontWeight: 600 }}>dodání od {deliveryDate}</span>
                        </>
                      )}
                    </span>
                    <span style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 14px 14px", marginTop: "auto" }}>
                      {rSale && <s style={{ color: MUTED, fontSize: 12, fontWeight: 500 }}>{fmt(r.compare_cents as number)}</s>}
                      <span style={{ fontSize: 15.5, fontWeight: 700, color: rSale ? BORDO : INK, whiteSpace: "nowrap" }}>{fmt(r.price_cents)}</span>
                      <span className="es17d-card-detail">Detail</span>
                    </span>
                  </a>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
