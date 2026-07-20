"use client";

/**
 * Eshop19Detail — Grunt (dek.cz DNA) detail produktu.
 * Breadcrumb → 2 sloupce (foto karta | H1, badge Výhodná cena, lead, odkaz
 * Podrobný popis, zelená skladovost + V prodejně, price box: žlutá skosená
 * vlajka s přeškrtnutou cenou + „Sleva N %", Cena s DPH červeně / bez DPH,
 * stepper + zelené Do košíku, žlutý info pruh s úsporou; Číslo položky /
 * Katalogový kód / Značka) → sticky tab lišta (Popis / Parametry / Info o
 * ceně / Hodnocení / Související) → „Zákazníci společně nakupují" rail →
 * Popis + Parametry tabulka (2 sloupce) → Informace o ceně → Hodnocení
 * (0,0 empty state s hvězdami) → Související položky rail.
 */

import { useState } from "react";

const HEAD = "'Space Grotesk', 'Arial', sans-serif";
const SANS = "'Inter', 'Segoe UI', system-ui, sans-serif";
const RED = "#d5232c";
const GRAPHITE = "#212428";
const INK = "#1d1f23";
const MUTED = "#6b6f76";
const PAPER = "#f4f3ef";
const LINE = "#e6e5e0";
const GREEN = "#1e8f4a";
const GREEN_DK = "#187a3f";
const YELLOW = "#ffd12e";
const CREAM_INFO = "#fbf7df";

export interface Es19MiniCard {
  slug: string;
  title: string;
  subtitle: string | null;
  price_cents: number;
  compare_cents: number | null;
  image_url: string | null;
  default_variant_id: number | null;
  is_deal: boolean;
  unit: string;
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
    isNew: boolean;
    isDeal: boolean;
    unit: string;
    itemNo: string;
    catalogCode: string;
  };
  variant: {
    id: number;
    price_cents: number;
    compare_at_price_cents: number | null;
    stock_qty: number;
  } | null;
  paramRows: { label: string; value: string }[];
  together: Es19MiniCard[];
  related: Es19MiniCard[];
}

function MiniRail({ heading, items, basePath, tenantSlug, currency, anchor }: {
  heading: string;
  items: Es19MiniCard[];
  basePath: string;
  tenantSlug: string;
  currency: string;
  anchor?: string;
}) {
  const [adding, setAdding] = useState<string | null>(null);
  const fmt = (cents: number) =>
    new Intl.NumberFormat("cs-CZ", { style: "currency", currency, maximumFractionDigits: 2 }).format(cents / 100);

  const quickAdd = (e: React.MouseEvent, it: Es19MiniCard) => {
    e.preventDefault(); e.stopPropagation();
    if (!it.default_variant_id || adding) return;
    setAdding(it.slug);
    fetch(`/api/demo/${tenantSlug}/shop/cart/items`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ variant_id: it.default_variant_id, qty: 1 }),
    })
      .then(() => window.dispatchEvent(new Event("webero-cart-item-added")))
      .finally(() => setAdding(null));
  };

  if (!items.length) return null;
  return (
    <div id={anchor} style={{ margin: "34px 0 0" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
        <span aria-hidden="true" style={{ width: 9, height: 23, background: RED, borderRadius: 2, flexShrink: 0 }} />
        <h2 style={{ fontFamily: HEAD, fontWeight: 700, fontSize: 20, letterSpacing: "0.02em", textTransform: "uppercase", color: INK, margin: 0 }}>{heading}</h2>
      </div>
      <div className="es19d-rail">
        {items.map((it) => {
          const sale = it.compare_cents != null && it.compare_cents > it.price_cents;
          return (
            <a key={it.slug} href={`${basePath}/${it.slug}`} className="es19d-mini">
              <span style={{ position: "relative", display: "block", aspectRatio: "1/1", background: PAPER, overflow: "hidden" }}>
                {it.image_url && <img src={it.image_url} alt={it.title} loading="lazy" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />}
                {it.is_deal && <span style={{ position: "absolute", left: 8, top: 8, background: RED, color: "#fff", fontSize: 10, fontWeight: 800, letterSpacing: "0.05em", textTransform: "uppercase", padding: "3px 7px", borderRadius: 3 }}>Výhodná cena</span>}
              </span>
              <span style={{ display: "flex", flexDirection: "column", flex: 1, padding: "10px 12px 12px" }}>
                <span style={{ fontSize: 12.5, fontWeight: 700, color: INK, lineHeight: 1.35, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", minHeight: "2.7em" }}>{it.title}</span>
                <span style={{ display: "flex", alignItems: "baseline", gap: 6, marginTop: 7 }}>
                  {sale && <s style={{ color: MUTED, fontSize: 11 }}>{fmt(it.compare_cents as number)}</s>}
                  <span style={{ fontFamily: HEAD, fontWeight: 700, fontSize: 15.5, color: sale || it.is_deal ? RED : INK }}>{fmt(it.price_cents)}</span>
                </span>
                <span style={{ fontSize: 10, fontWeight: 600, color: MUTED }}>cena za {it.unit} s DPH</span>
                {it.default_variant_id != null && (
                  <button
                    onClick={(e) => quickAdd(e, it)}
                    disabled={adding === it.slug}
                    className="es19d-mini-buy"
                    aria-label={`Přidat ${it.title} do košíku`}
                  >Do košíku</button>
                )}
              </span>
            </a>
          );
        })}
      </div>
    </div>
  );
}

export function Eshop19Detail({ tenantSlug, basePath, currency, crumbs, product, variant, paramRows, together, related }: Props) {
  const [qty, setQty] = useState(1);
  const [adding, setAdding] = useState(false);

  const fmt = (cents: number) =>
    new Intl.NumberFormat("cs-CZ", { style: "currency", currency, maximumFractionDigits: 2 }).format(cents / 100);

  const price = variant?.price_cents ?? 0;
  const compare = variant?.compare_at_price_cents ?? null;
  const sale = compare != null && compare > price;
  const salePct = sale ? Math.round((1 - price / (compare as number)) * 100) : 0;
  const noVat = Math.round(price / 1.21);
  const saved = sale ? (compare as number) - price : 0;
  const stock = variant?.stock_qty ?? 0;
  const stockFmt = (n: number) => (n >= 500 ? "> 500" : n >= 100 ? "> 100" : n >= 20 ? "> 20" : String(n));

  const addToCart = () => {
    if (!variant || adding) return;
    setAdding(true);
    fetch(`/api/demo/${tenantSlug}/shop/cart/items`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ variant_id: variant.id, qty }),
    })
      .then(() => window.dispatchEvent(new Event("webero-cart-item-added")))
      .finally(() => setAdding(false));
  };

  const TABS = [
    { id: "popis", label: "Popis" },
    { id: "parametry", label: "Parametry" },
    { id: "info-cena", label: "Info o ceně" },
    { id: "hodnoceni", label: "Hodnocení" },
    { id: "souvisejici", label: "Související položky" },
  ];

  return (
    <div style={{ fontFamily: SANS, background: "#fff" }}>
      <style>{`
        .es19d-crumb { color: ${MUTED}; text-decoration: none; font-size: 12.5px; font-weight: 500; transition: color 0.13s; }
        .es19d-crumb:hover { color: ${RED}; }

        .es19d-cols { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 40px; align-items: start; }
        @media (max-width: 900px) { .es19d-cols { grid-template-columns: 1fr; gap: 22px; } }

        .es19d-qty { display: inline-flex; align-items: center; border: 1.5px solid ${LINE}; border-radius: 6px; background: #fff; }
        .es19d-qty button { border: none; background: none; cursor: pointer; padding: 10px 13px; color: ${INK}; display: flex; align-items: center; transition: opacity 0.13s; }
        .es19d-qty button:hover { opacity: 0.5; }

        .es19d-buy { display: inline-flex; align-items: center; justify-content: center; gap: 9px; height: 48px; padding: 0 34px; border: none; border-radius: 6px;
          background: ${GREEN}; color: #fff; font-family: ${SANS}; font-size: 14.5px; font-weight: 800; letter-spacing: 0.03em; cursor: pointer;
          transition: background 0.15s, transform 0.14s; }
        .es19d-buy:hover { background: ${GREEN_DK}; transform: translateY(-1px); }
        .es19d-buy:disabled { cursor: default; opacity: 0.8; }

        .es19d-tab { display: inline-flex; align-items: center; height: 46px; padding: 0 16px; color: ${MUTED}; text-decoration: none;
          font-size: 13.5px; font-weight: 700; border-bottom: 3px solid transparent; transition: color 0.14s, border-color 0.14s; white-space: nowrap; }
        .es19d-tab:hover { color: ${INK}; border-bottom-color: ${LINE}; }

        .es19d-rail { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 12px; }
        @media (max-width: 1100px) { .es19d-rail { grid-template-columns: repeat(3, minmax(0, 1fr)); } }
        @media (max-width: 700px) { .es19d-rail { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; } }
        .es19d-mini { display: flex; flex-direction: column; background: #fff; border: 1.5px solid ${LINE}; border-radius: 8px; overflow: hidden;
          text-decoration: none; transition: transform 0.16s, box-shadow 0.18s, border-color 0.16s; }
        .es19d-mini:hover { transform: translateY(-2px); box-shadow: 0 12px 26px rgba(23,25,28,0.09); border-color: ${GRAPHITE}; }
        .es19d-mini-buy { margin-top: 9px; height: 32px; border: none; border-radius: 6px; background: ${GREEN}; color: #fff; font-family: ${SANS};
          font-size: 11.5px; font-weight: 800; cursor: pointer; transition: background 0.15s; }
        .es19d-mini-buy:hover { background: ${GREEN_DK}; }

        .es19d-params { width: 100%; border-collapse: collapse; }
        .es19d-params td { padding: 9px 12px; font-size: 13px; border-bottom: 1px solid ${LINE}; }
        .es19d-params tr:nth-child(odd) { background: ${PAPER}; }
        .es19d-params td:first-child { color: ${MUTED}; font-weight: 500; width: 46%; }
        .es19d-params td:last-child { color: ${INK}; font-weight: 700; }
      `}</style>

      <div style={{ maxWidth: 1420, margin: "0 auto", padding: "18px 28px 56px" }}>
        {/* Breadcrumb */}
        <nav aria-label="Drobečková navigace" style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 18 }}>
          <a href={basePath} className="es19d-crumb">Obchod</a>
          {crumbs.map((c) => (
            <span key={c.slug} style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
              <span style={{ color: LINE }}>›</span>
              <a href={`${basePath}?kategorie=${c.slug}`} className="es19d-crumb">{c.name}</a>
            </span>
          ))}
          <span style={{ color: LINE }}>›</span>
          <span className="es19d-crumb" style={{ color: INK, fontWeight: 700 }}>{product.title}</span>
        </nav>

        <div className="es19d-cols">
          {/* Foto karta */}
          <div style={{ position: "relative", border: `1.5px solid ${LINE}`, borderRadius: 10, overflow: "hidden", background: PAPER, aspectRatio: "4/3" }}>
            {product.image_url && (
              <img src={product.image_url} alt={product.image_alt ?? product.title} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
            )}
            {product.isNew && (
              <span style={{ position: "absolute", right: 14, top: 14, background: GRAPHITE, color: "#fff", fontFamily: HEAD, fontWeight: 700, fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", padding: "5px 12px", borderRadius: 4 }}>Novinka</span>
            )}
          </div>

          {/* Pravý sloupec */}
          <div>
            <h1 style={{ fontFamily: HEAD, fontWeight: 700, fontSize: "clamp(22px, 2.1vw, 30px)", lineHeight: 1.15, letterSpacing: "0.01em", color: INK, margin: 0 }}>{product.title}</h1>
            {product.isDeal && (
              <span style={{ display: "inline-block", marginTop: 10, background: RED, color: "#fff", fontSize: 11, fontWeight: 800, letterSpacing: "0.05em", textTransform: "uppercase", padding: "4.5px 10px", borderRadius: 3 }}>Výhodná cena</span>
            )}
            {product.subtitle && <p style={{ marginTop: 12, fontSize: 14, lineHeight: 1.6, color: MUTED }}>{product.subtitle}</p>}
            <a href="#popis" style={{ display: "inline-flex", alignItems: "center", gap: 6, marginTop: 8, fontSize: 13, fontWeight: 700, color: RED, textDecoration: "none" }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              Podrobný popis
            </a>

            {/* Dostupnost */}
            <div style={{ marginTop: 16, fontSize: 13.5, fontWeight: 700 }}>
              {stock > 0 ? (
                <>
                  <span style={{ color: GREEN, display: "inline-flex", alignItems: "center", gap: 7 }}>
                    <span style={{ width: 8, height: 8, borderRadius: 999, background: GREEN }} />
                    Skladem: {stockFmt(stock)} {product.unit}
                  </span>
                  <span style={{ display: "block", marginTop: 2, paddingLeft: 15, fontSize: 12.5, fontWeight: 500, color: MUTED }}>V prodejně</span>
                </>
              ) : (
                <span style={{ color: MUTED }}>Vyprodáno</span>
              )}
            </div>

            {/* Price box */}
            {variant && (
              <div style={{ marginTop: 16, border: `1.5px solid ${LINE}`, borderRadius: 10, background: "#fbfaf7", padding: "20px 22px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 22, flexWrap: "wrap" }}>
                  {sale && (
                    <span style={{ background: YELLOW, transform: "skewX(-6deg)", padding: "9px 16px", boxShadow: "0 4px 12px rgba(23,25,28,0.12)" }}>
                      <span style={{ display: "inline-flex", flexDirection: "column", transform: "skewX(6deg)", lineHeight: 1.25 }}>
                        <s style={{ fontSize: 12, fontWeight: 600, color: INK }}>{fmt(compare as number)}</s>
                        <span style={{ fontFamily: HEAD, fontWeight: 700, fontSize: 14.5, color: INK }}>Sleva {salePct} %</span>
                      </span>
                    </span>
                  )}
                  <span>
                    <span style={{ display: "block", fontSize: 11.5, fontWeight: 600, color: MUTED }}>Cena s DPH</span>
                    <span style={{ fontFamily: HEAD, fontWeight: 700, fontSize: 30, color: RED, lineHeight: 1.1 }}>{fmt(price)}</span>
                    <span style={{ fontSize: 12, fontWeight: 600, color: MUTED, marginLeft: 6 }}>za {product.unit}</span>
                  </span>
                  <span>
                    <span style={{ display: "block", fontSize: 11.5, fontWeight: 600, color: MUTED }}>Cena bez DPH</span>
                    <span style={{ fontSize: 15, fontWeight: 700, color: INK }}>{fmt(noVat)} za {product.unit}</span>
                  </span>
                </div>

                {stock > 0 && (
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 18, flexWrap: "wrap" }}>
                    <span className="es19d-qty">
                      <button onClick={() => setQty((v) => Math.max(1, v - 1))} aria-label="Snížit množství">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12"/></svg>
                      </button>
                      <span style={{ fontSize: 14.5, fontWeight: 700, minWidth: 30, textAlign: "center" }}>{qty}</span>
                      <button onClick={() => setQty((v) => v + 1)} aria-label="Zvýšit množství">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12"/><line x1="12" y1="5" x2="12" y2="19"/></svg>
                      </button>
                    </span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: MUTED }}>{product.unit}</span>
                    <button className="es19d-buy" onClick={addToCart} disabled={adding} style={{ marginLeft: "auto", flex: "1 1 auto", maxWidth: 280 }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="20" r="1.4"/><circle cx="17.5" cy="20" r="1.4"/><path d="M2.5 3.5h2.6l2.5 12h10.2l2.2-8.5H6.2"/></svg>
                      Do košíku
                    </button>
                  </div>
                )}

                <div style={{ marginTop: 16, background: CREAM_INFO, border: "1px solid #efe6b8", borderRadius: 6, padding: "11px 14px", fontSize: 12.5, lineHeight: 1.55, color: INK }}>
                  Do košíku přidáte {qty} {product.unit} za {fmt(price * qty)} s DPH ({fmt(noVat * qty)} bez DPH).
                  {sale && saved > 0 && <> Ušetříte <strong>{fmt(saved * qty)} s DPH</strong>.</>}
                </div>
              </div>
            )}

            {/* Meta řádek */}
            <div style={{ marginTop: 16, display: "flex", alignItems: "center", gap: 18, flexWrap: "wrap", fontSize: 12.5, color: MUTED }}>
              <span>Číslo položky: <strong style={{ color: INK }}>{product.itemNo}</strong></span>
              <span>Katalogový kód: <strong style={{ color: INK }}>{product.catalogCode}</strong></span>
              {product.brand && <span>Výrobky značky: <a href={`${basePath}?znacka=${encodeURIComponent(product.brand)}`} style={{ color: RED, fontWeight: 700, textDecoration: "none" }}>{product.brand}</a></span>}
            </div>
          </div>
        </div>

        {/* Sticky tab lišta */}
        <div style={{ position: "sticky", top: 0, zIndex: 30, background: "#fff", borderBottom: `1.5px solid ${LINE}`, marginTop: 30, display: "flex", alignItems: "center", gap: 2, overflowX: "auto" }}>
          {TABS.map((t) => (
            <a key={t.id} href={`#${t.id}`} className="es19d-tab">{t.label}</a>
          ))}
        </div>

        {/* Zákazníci společně nakupují */}
        <MiniRail heading="Zákazníci společně nakupují" items={together} basePath={basePath} tenantSlug={tenantSlug} currency={currency} />

        {/* Popis + Parametry */}
        <div className="es19d-cols" style={{ marginTop: 38 }}>
          <div id="popis">
            <h2 style={{ fontFamily: HEAD, fontWeight: 700, fontSize: 20, letterSpacing: "0.02em", textTransform: "uppercase", color: INK, margin: "0 0 12px" }}>Popis</h2>
            <div style={{ border: `1.5px solid ${LINE}`, borderRadius: 10, padding: "20px 22px", fontSize: 14, lineHeight: 1.7, color: INK }}>
              {product.description || "Podrobný popis připravujeme."}
            </div>

            <div id="info-cena" style={{ marginTop: 24 }}>
              <h2 style={{ fontFamily: HEAD, fontWeight: 700, fontSize: 20, letterSpacing: "0.02em", textTransform: "uppercase", color: INK, margin: "0 0 12px" }}>Informace o ceně</h2>
              <div style={{ border: `1.5px solid ${LINE}`, borderRadius: 10, padding: "18px 22px", fontSize: 13.5 }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 14, padding: "7px 0", borderBottom: `1px solid ${LINE}` }}>
                  <span style={{ color: MUTED }}>Aktuální prodejní cena{sale ? ` po slevě ${salePct} % z ceníkové ceny` : ""}</span>
                  <span style={{ fontWeight: 700, color: sale ? RED : INK, whiteSpace: "nowrap" }}>{fmt(price)} s DPH</span>
                </div>
                {sale && (
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 14, padding: "7px 0" }}>
                    <span style={{ color: MUTED }}>Ceníková cena před poskytnutím slevy</span>
                    <span style={{ fontWeight: 700, color: INK, whiteSpace: "nowrap" }}>{fmt(compare as number)} s DPH</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div id="parametry">
            <h2 style={{ fontFamily: HEAD, fontWeight: 700, fontSize: 20, letterSpacing: "0.02em", textTransform: "uppercase", color: INK, margin: "0 0 12px" }}>Parametry</h2>
            <div style={{ border: `1.5px solid ${LINE}`, borderRadius: 10, overflow: "hidden" }}>
              <table className="es19d-params">
                <tbody>
                  {paramRows.map((r) => (
                    <tr key={r.label}><td>{r.label}</td><td>{r.value}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div id="hodnoceni" style={{ marginTop: 24 }}>
              <h2 style={{ fontFamily: HEAD, fontWeight: 700, fontSize: 20, letterSpacing: "0.02em", textTransform: "uppercase", color: INK, margin: "0 0 12px" }}>Hodnocení</h2>
              <div style={{ border: `1.5px solid ${LINE}`, borderRadius: 10, padding: "20px 22px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <span style={{ fontFamily: HEAD, fontWeight: 700, fontSize: 40, color: INK, lineHeight: 1 }}>0,0</span>
                  <span style={{ display: "inline-flex", gap: 3 }} aria-label="0 z 5 hvězd">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <svg key={i} width="19" height="19" viewBox="0 0 24 24" fill={LINE} aria-hidden="true"><path d="m12 2.5 2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4l-5.9 3.1 1.2-6.5L2.5 9.4l6.6-.9 2.9-6Z"/></svg>
                    ))}
                  </span>
                  <span style={{ fontSize: 12.5, color: MUTED }}>hodnotilo 0 uživatelů</span>
                </div>
                <div style={{ marginTop: 14, background: CREAM_INFO, border: "1px solid #efe6b8", borderRadius: 6, padding: "10px 14px", fontSize: 12.5, color: INK, textAlign: "center" }}>
                  Přidávat hodnocení může pouze přihlášený uživatel.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Související položky */}
        <MiniRail heading="Související položky" items={related} basePath={basePath} tenantSlug={tenantSlug} currency={currency} anchor="souvisejici" />
      </div>
    </div>
  );
}
