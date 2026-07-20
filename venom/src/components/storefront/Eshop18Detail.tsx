"use client";

/**
 * Eshop18Detail — Oktan (autokelly.cz DNA, carbon & signal) detail produktu.
 * Breadcrumb → Archivo italic H1 → 3 sloupce dle AK (foto karta se skosenými
 * badge | buy box: objednací kód, Vaše cena + s DPH, zelená dostupnost
 * „Skladem na N místech" + centrální sklad, qty stepper + žluté KOUPIT,
 * benefity řádky | karbonový panel Další informace: záruka, výdej, doprava,
 * vrácení) → tab lišta (Popis produktu / Výskyt / Náhrady / Přílohy / Kódy /
 * Sklad — demo) → parametry tabulka „UPŘESNĚNÍ PRO VYBRANÉ VOZIDLO" +
 * INFORMACE O PRODUKTU + INFORMACE O VÝROBCI, vpravo aside „Zákazníci také
 * zakoupili" (mini karty).
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

export interface Es18DetailMiniCard {
  slug: string;
  title: string;
  brand: string | null;
  subtitle: string | null;
  price_cents: number;
  compare_cents: number | null;
  image_url: string | null;
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
    featured: boolean;
    isNew: boolean;
    sku: string | null;
  };
  variant: {
    id: number;
    price_cents: number;
    compare_at_price_cents: number | null;
    stock_qty: number;
  } | null;
  infoRows: { label: string; value: string }[];
  alsoBought: Es18DetailMiniCard[];
  brandNote?: string | null;
}

const TABS = ["Popis produktu", "Výskyt produktu", "Náhrady", "Přílohy", "Kódy", "Sklad"];

export function Eshop18Detail({
  tenantSlug, basePath, currency, crumbs, product, variant, infoRows, alsoBought, brandNote,
}: Props) {
  const [qty, setQty] = useState(1);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  const fmt = (cents: number) =>
    new Intl.NumberFormat("cs-CZ", { style: "currency", currency, maximumFractionDigits: 0 }).format(cents / 100);

  const sale = variant?.compare_at_price_cents != null && variant.compare_at_price_cents > variant.price_cents;
  const salePct = sale && variant ? Math.round((1 - variant.price_cents / (variant.compare_at_price_cents as number)) * 100) : 0;
  const inStock = (variant?.stock_qty ?? 0) > 0;
  const branchCount = variant ? Math.max(3, Math.min(120, Math.round(variant.stock_qty * 0.8))) : 0;

  const buy = () => {
    if (!variant || busy) return;
    setBusy(true);
    fetch(`/api/demo/${tenantSlug}/shop/cart/items`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ variant_id: variant.id, qty }),
    })
      .then(() => {
        window.dispatchEvent(new Event("webero-cart-item-added"));
        setDone(true);
        setTimeout(() => setDone(false), 1800);
      })
      .finally(() => setBusy(false));
  };

  return (
    <div style={{ fontFamily: SANS, background: PAPER }}>
      <style>{`
        .es18d-wrap { max-width: 1420px; margin: 0 auto; padding: 0 28px 50px; }
        .es18d-crumb { display: flex; align-items: center; gap: 8px; padding: 16px 0 6px; font-size: 13px; color: ${MUTED}; flex-wrap: wrap; }
        .es18d-crumb a { color: ${MUTED}; text-decoration: none; }
        .es18d-crumb a:hover { color: ${INK}; text-decoration: underline; text-underline-offset: 3px; }

        .es18d-grid { display: grid; grid-template-columns: minmax(0, 1.1fr) minmax(0, 1.25fr) 300px; gap: 14px; align-items: start; margin-top: 16px; }
        @media (max-width: 1150px) { .es18d-grid { grid-template-columns: minmax(0, 1fr) minmax(0, 1.2fr); } .es18d-aside { grid-column: 1 / -1; } }
        @media (max-width: 760px) { .es18d-grid { grid-template-columns: 1fr; } }

        .es18d-card { background: #fff; border: 1.5px solid ${LINE}; border-radius: 16px; }
        .es18d-chip-badge { display: inline-flex; align-items: center; font-family: ${HEAD}; font-weight: 800; font-stretch: 110%; font-size: 11.5px;
          letter-spacing: 0.07em; text-transform: uppercase; padding: 6px 12px; line-height: 1.2; clip-path: polygon(6px 0, 100% 0, calc(100% - 6px) 100%, 0 100%); }

        .es18d-qty { display: inline-flex; align-items: center; border: 1.5px solid ${LINE}; border-radius: 11px; background: #fff; height: 52px; }
        .es18d-qty button { border: none; background: none; cursor: pointer; padding: 0 15px; height: 100%; color: ${INK}; display: inline-flex; align-items: center; transition: opacity 0.13s; }
        .es18d-qty button:hover { opacity: 0.55; }
        .es18d-buy { flex: 1; display: inline-flex; align-items: center; justify-content: center; gap: 10px; height: 52px; border: none; border-radius: 12px;
          background: ${YELLOW}; color: ${CARBON}; font-family: ${SANS}; font-size: 14px; font-weight: 800; letter-spacing: 0.06em; text-transform: uppercase;
          cursor: pointer; transition: background 0.15s, transform 0.14s; }
        .es18d-buy:hover { background: ${YELLOW_DK}; transform: translateY(-1px); }
        .es18d-buy.is-done { background: ${GREEN}; color: #fff; }
        .es18d-buy:disabled { opacity: 0.7; cursor: default; }

        .es18d-benefit { display: flex; align-items: center; gap: 10px; font-size: 13px; font-weight: 600; color: ${INK}; padding: 7px 0; }
        .es18d-benefit svg { color: ${CARBON}; background: ${YELLOW}; border-radius: 7px; padding: 4px; flex-shrink: 0; }

        .es18d-inforow { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.08); font-size: 13px; }
        .es18d-inforow:last-child { border-bottom: none; }

        .es18d-tabs { display: flex; gap: 6px; overflow-x: auto; scrollbar-width: none; margin: 22px 0 0; border-bottom: 2px solid ${LINE}; }
        .es18d-tabs::-webkit-scrollbar { display: none; }
        .es18d-tab { position: relative; border: none; background: none; cursor: pointer; padding: 13px 16px; font-family: ${SANS}; font-size: 12.5px;
          font-weight: 800; letter-spacing: 0.05em; text-transform: uppercase; color: ${MUTED}; white-space: nowrap; transition: color 0.14s; }
        .es18d-tab::after { content: ""; position: absolute; left: 10px; right: 10px; bottom: -2px; height: 3px; background: ${YELLOW}; transform: scaleX(0); transition: transform 0.18s; }
        .es18d-tab.on { color: ${INK}; }
        .es18d-tab.on::after, .es18d-tab:hover::after { transform: scaleX(1); }

        .es18d-content { display: grid; grid-template-columns: minmax(0, 1fr) 320px; gap: 14px; align-items: start; margin-top: 14px; }
        @media (max-width: 1020px) { .es18d-content { grid-template-columns: 1fr; } }

        .es18d-params tr { border-bottom: 1px solid ${LINE}; }
        .es18d-params tr:nth-child(odd) { background: ${PAPER}; }
        .es18d-params td { padding: 9px 14px; font-size: 13px; }
        .es18d-params td:first-child { color: ${MUTED}; font-weight: 600; width: 45%; }
        .es18d-params td:last-child { color: ${INK}; font-weight: 700; }

        .es18d-mini { display: flex; align-items: center; gap: 12px; padding: 11px 0; border-bottom: 1px solid ${LINE}; text-decoration: none; transition: background 0.13s; }
        .es18d-mini:last-child { border-bottom: none; }
        .es18d-mini:hover { background: ${PAPER}; }
        .es18d-h2 { display: flex; align-items: center; gap: 11px; margin: 0 0 14px; }
      `}</style>

      <div className="es18d-wrap">
        {/* Breadcrumb */}
        <nav className="es18d-crumb" aria-label="Drobečková navigace">
          <a href={`/demo/${tenantSlug}`}>Domů</a>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 6 6 6-6 6"/></svg>
          <a href={basePath}>Katalog</a>
          {crumbs.map((c) => (
            <span key={c.slug} style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 6 6 6-6 6"/></svg>
              <a href={`${basePath}?kategorie=${c.slug}`}>{c.name}</a>
            </span>
          ))}
        </nav>

        {/* H1 */}
        <div style={{ display: "flex", alignItems: "center", gap: 14, margin: "8px 0 0" }}>
          <span aria-hidden="true" style={{ width: 11, height: 30, background: YELLOW, transform: "skewX(-14deg)", flexShrink: 0 }} />
          <h1 style={{ margin: 0, fontFamily: HEAD, fontWeight: 900, fontStyle: "italic", fontStretch: "112%", fontSize: "clamp(21px, 2.1vw, 30px)", letterSpacing: "0.01em", textTransform: "uppercase", color: INK, lineHeight: 1.12 }}>{product.title}</h1>
        </div>
        {product.subtitle && <p style={{ margin: "8px 0 0 25px", fontSize: 14, color: MUTED }}>{product.subtitle}</p>}

        <div className="es18d-grid">
          {/* ═══ FOTO ═══ */}
          <div className="es18d-card" style={{ overflow: "hidden", position: "relative" }}>
            <div style={{ position: "relative", aspectRatio: "1/1", background: PAPER }}>
              {product.image_url && <img src={product.image_url} alt={product.image_alt ?? product.title} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />}
              <span style={{ position: "absolute", left: 12, top: 12, display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 6 }}>
                {sale && salePct > 0 && <span className="es18d-chip-badge" style={{ background: RED, color: "#fff" }}>−{salePct} %</span>}
                {product.featured && <span className="es18d-chip-badge" style={{ background: YELLOW, color: CARBON }}>TOP</span>}
                {product.isNew && <span className="es18d-chip-badge" style={{ background: CARBON, color: "#fff" }}>Novinka</span>}
              </span>
            </div>
          </div>

          {/* ═══ BUY BOX ═══ */}
          <div className="es18d-card" style={{ padding: "clamp(20px, 1.9vw, 28px)" }}>
            {product.sku && (
              <div style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 12.5, color: MUTED, background: PAPER, border: `1px solid ${LINE}`, borderRadius: 8, padding: "6px 11px" }}>
                Objednací kód: <b style={{ color: INK, fontWeight: 700 }}>{product.sku}</b>
              </div>
            )}

            <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginTop: 16, flexWrap: "wrap" }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: MUTED }}>Vaše cena</span>
              {sale && variant && <s style={{ color: MUTED, fontSize: 15, fontWeight: 500 }}>{fmt(variant.compare_at_price_cents as number)}</s>}
              {variant && <span style={{ fontFamily: HEAD, fontWeight: 900, fontStyle: "italic", fontStretch: "110%", fontSize: "clamp(28px, 2.4vw, 36px)", lineHeight: 1, color: sale ? RED : INK }}>{fmt(variant.price_cents)}</span>}
              <span style={{ fontSize: 12, fontWeight: 600, color: MUTED }}>s DPH</span>
            </div>

            <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 4 }}>
              {inStock ? (
                <>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 7, fontSize: 13.5, fontWeight: 700, color: GREEN }}>
                    <span style={{ width: 8, height: 8, borderRadius: 999, background: GREEN }} />
                    Skladem na {branchCount} pobočkách
                  </span>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 7, fontSize: 13, fontWeight: 600, color: GREEN, paddingLeft: 15 }}>
                    Skladem na centrálním skladu — u vás zítra
                  </span>
                </>
              ) : (
                <span style={{ fontSize: 13.5, fontWeight: 700, color: MUTED }}>Vyprodáno — na objednávku</span>
              )}
            </div>

            <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
              <span className="es18d-qty">
                <button onClick={() => setQty(Math.max(1, qty - 1))} aria-label="Snížit množství">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12"/></svg>
                </button>
                <span style={{ minWidth: 30, textAlign: "center", fontSize: 15, fontWeight: 800 }}>{qty}</span>
                <button onClick={() => setQty(qty + 1)} aria-label="Zvýšit množství">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12"/><line x1="12" y1="5" x2="12" y2="19"/></svg>
                </button>
              </span>
              <button className={`es18d-buy${done ? " is-done" : ""}`} disabled={!variant || !inStock || busy} onClick={buy}>
                {done ? (
                  <>
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round"><path d="m4.5 12.5 5 5 10-11"/></svg>
                    V košíku
                  </>
                ) : (
                  <>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="20" r="1.4"/><circle cx="17.5" cy="20" r="1.4"/><path d="M2.5 3.5h2.6l2.5 12h10.2l2.2-8.5H6.2"/></svg>
                    Koupit
                  </>
                )}
              </button>
            </div>

            <div style={{ marginTop: 18, borderTop: `1.5px solid ${LINE}`, paddingTop: 10 }}>
              <span className="es18d-benefit">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2 4.5 13.5h6L10 22l8.5-11.5h-6L13 2Z"/></svg>
                Dnes objednáte, zítra vyzvednete na pobočce
              </span>
              <span className="es18d-benefit">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 17h-2v-11a1 1 0 0 1 1 -1h9v12m-4 0h6m4 0h2v-6h-8m0 -5h5l3 5"/><circle cx="7.5" cy="17.5" r="2"/><circle cx="17.5" cy="17.5" r="2"/></svg>
                Doprava zdarma od 1 500 Kč
              </span>
              <span className="es18d-benefit">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 3-6.7"/><path d="M3 4v5h5"/></svg>
                Vrácení bez udání důvodu do 30 dnů
              </span>
            </div>
          </div>

          {/* ═══ DALŠÍ INFORMACE ═══ */}
          <div className="es18d-aside" style={{ background: CARBON, borderRadius: 16, padding: "clamp(18px, 1.7vw, 24px)", color: "#fff" }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 7, fontSize: 11.5, fontWeight: 800, letterSpacing: "0.16em", textTransform: "uppercase", color: YELLOW }}>
              <span style={{ width: 7, height: 7, borderRadius: 999, background: YELLOW, boxShadow: "0 0 0 3px rgba(255,212,0,0.22)" }} />
              Další informace
            </span>
            <div style={{ marginTop: 10 }}>
              <div className="es18d-inforow"><span style={{ color: "rgba(255,255,255,0.6)" }}>Záruka</span><b>24 měsíců</b></div>
              {product.brand && <div className="es18d-inforow"><span style={{ color: "rgba(255,255,255,0.6)" }}>Značka</span><b>{product.brand}</b></div>}
              <div className="es18d-inforow"><span style={{ color: "rgba(255,255,255,0.6)" }}>Výdej</span><b>120 poboček</b></div>
              <div className="es18d-inforow"><span style={{ color: "rgba(255,255,255,0.6)" }}>Odborná linka</span><b style={{ color: YELLOW }}>704 123 456</b></div>
            </div>
          </div>
        </div>

        {/* ═══ TABY ═══ */}
        <div className="es18d-tabs" role="tablist" aria-label="Informace o produktu">
          {TABS.map((t, i) => (
            <button key={t} type="button" role="tab" aria-selected={i === 0} className={`es18d-tab${i === 0 ? " on" : ""}`}>{t}</button>
          ))}
        </div>

        <div className="es18d-content">
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {/* Parametry */}
            {infoRows.length > 0 && (
              <div className="es18d-card" style={{ padding: "clamp(18px, 1.7vw, 26px)" }}>
                <div className="es18d-h2">
                  <span aria-hidden="true" style={{ width: 9, height: 22, background: YELLOW, transform: "skewX(-14deg)" }} />
                  <h2 style={{ margin: 0, fontFamily: HEAD, fontWeight: 900, fontStyle: "italic", fontStretch: "112%", fontSize: 17, letterSpacing: "0.03em", textTransform: "uppercase", color: INK }}>Upřesnění pro vybrané vozidlo</h2>
                </div>
                <table className="es18d-params" style={{ width: "100%", borderCollapse: "collapse", border: `1px solid ${LINE}`, borderRadius: 10, overflow: "hidden" }}>
                  <tbody>
                    {infoRows.map((r) => (
                      <tr key={r.label + r.value}><td>{r.label}</td><td>{r.value}</td></tr>
                    ))}
                  </tbody>
                </table>
                <p style={{ margin: "12px 0 0", fontSize: 12.5, color: MUTED }}>Produkt odpovídá výše zobrazeným normám.</p>
              </div>
            )}

            {/* Popis */}
            {product.description && (
              <div className="es18d-card" style={{ padding: "clamp(18px, 1.7vw, 26px)" }}>
                <div className="es18d-h2">
                  <span aria-hidden="true" style={{ width: 9, height: 22, background: YELLOW, transform: "skewX(-14deg)" }} />
                  <h2 style={{ margin: 0, fontFamily: HEAD, fontWeight: 900, fontStyle: "italic", fontStretch: "112%", fontSize: 17, letterSpacing: "0.03em", textTransform: "uppercase", color: INK }}>Informace o produktu</h2>
                </div>
                <p style={{ margin: 0, fontSize: 14, lineHeight: 1.65, color: "#3c3f45", whiteSpace: "pre-line" }}>{product.description}</p>
              </div>
            )}

            {/* Výrobce */}
            {product.brand && (
              <div className="es18d-card" style={{ padding: "clamp(18px, 1.7vw, 26px)" }}>
                <div className="es18d-h2">
                  <span aria-hidden="true" style={{ width: 9, height: 22, background: YELLOW, transform: "skewX(-14deg)" }} />
                  <h2 style={{ margin: 0, fontFamily: HEAD, fontWeight: 900, fontStyle: "italic", fontStretch: "112%", fontSize: 17, letterSpacing: "0.03em", textTransform: "uppercase", color: INK }}>Informace o výrobci</h2>
                </div>
                <span style={{ display: "inline-flex", alignItems: "center", background: CARBON, color: YELLOW, fontFamily: HEAD, fontWeight: 900, fontStyle: "italic", fontStretch: "115%", fontSize: 15, letterSpacing: "0.05em", textTransform: "uppercase", padding: "8px 16px", clipPath: "polygon(8px 0, 100% 0, calc(100% - 8px) 100%, 0 100%)" }}>{product.brand}</span>
                <p style={{ margin: "13px 0 0", fontSize: 14, lineHeight: 1.65, color: "#3c3f45" }}>
                  {brandNote ?? `Značka ${product.brand} patří do demo portfolia Oktan — vybíráme sortimenty, které pokrývají potřeby většiny vozového parku ČR, při zachování férové ceny a plné záruky.`}
                </p>
                <p style={{ margin: "12px 0 0", fontSize: 12, lineHeight: 1.6, color: MUTED }}>
                  Odpovědný hospodářský subjekt v EU: Oktan Parts s.r.o., Demo 12, 110 00 Praha (demo) • e-mail: email@demo.cz
                </p>
              </div>
            )}
          </div>

          {/* ═══ ZÁKAZNÍCI TAKÉ ZAKOUPILI ═══ */}
          {alsoBought.length > 0 && (
            <div className="es18d-card" style={{ padding: "18px 20px" }}>
              <div className="es18d-h2" style={{ marginBottom: 6 }}>
                <span aria-hidden="true" style={{ width: 9, height: 22, background: YELLOW, transform: "skewX(-14deg)" }} />
                <h2 style={{ margin: 0, fontFamily: HEAD, fontWeight: 900, fontStyle: "italic", fontStretch: "112%", fontSize: 15.5, letterSpacing: "0.03em", textTransform: "uppercase", color: INK }}>Zákazníci také zakoupili</h2>
              </div>
              {alsoBought.slice(0, 4).map((it) => (
                <a key={it.slug} href={`${basePath}/${it.slug}`} className="es18d-mini">
                  <span style={{ width: 58, height: 58, borderRadius: 10, background: PAPER, overflow: "hidden", flexShrink: 0, position: "relative" }}>
                    {it.image_url && <img src={it.image_url} alt={it.title} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />}
                  </span>
                  <span style={{ minWidth: 0 }}>
                    {it.brand && <span style={{ display: "block", fontSize: 10, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", color: MUTED }}>{it.brand}</span>}
                    <span style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", fontSize: 12.5, fontWeight: 700, color: INK, lineHeight: 1.35, overflow: "hidden" }}>{it.title}</span>
                    <span style={{ display: "inline-flex", alignItems: "baseline", gap: 6, marginTop: 3 }}>
                      {it.compare_cents != null && it.compare_cents > it.price_cents && <s style={{ fontSize: 11, color: MUTED }}>{fmt(it.compare_cents)}</s>}
                      <span style={{ fontFamily: HEAD, fontWeight: 800, fontStretch: "108%", fontSize: 14, color: it.compare_cents != null && it.compare_cents > it.price_cents ? RED : INK }}>{fmt(it.price_cents)}</span>
                      <span style={{ fontSize: 10, color: MUTED, fontWeight: 600 }}>s DPH</span>
                    </span>
                  </span>
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
