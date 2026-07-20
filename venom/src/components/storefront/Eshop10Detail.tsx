"use client";

/**
 * eshop-10 "BOTIQ" — footshop.cz detail produktu (vlastní black/volt identita).
 *
 * Layout dle předlohy (prace/eshop/Footshop/detailproduktu.pdf):
 *   breadcrumb → [galerie vlevo: hlavní foto + mřížka dalších záběrů]
 *   + [sticky sloupec: brand → H1 → cena (sale červeně + přeškrtnutá) →
 *   mřížka velikostí (vyprodané přeškrtnuté) + Průvodce velikostmi →
 *   volt PŘIDAT DO KOŠÍKU (POST + webero-cart-item-added → otevře drawer
 *   „PŘIDÁNO DO KOŠÍKU" jako footshop pop-up) → benefit řádky s ikonami →
 *   HODÍ SE K… mini karta] → taby O produktu / Materiál a péče / Doprava
 *   a vrácení → PODOBNÉ PRODUKTY řada.
 */

import Link from "next/link";
import { useMemo, useState } from "react";

const COND = "'Barlow Condensed','Arial Narrow',Arial,sans-serif";
const SANS = "'Barlow','Segoe UI',Arial,sans-serif";
const BLACK = "#0a0a0b";
const VOLT = "#c8f53c";
const ON_VOLT = "#111603";
const VOLT_DEEP = "#6d9204";
const SALE_INK = "#e8402c";
const GREEN = "#1fa05e";
const INK = "#121212";
const MUTED = "#6f6f6f";
const BORDER = "#e6e6e4";
const SURFACE = "#f4f4f3";

export interface Es10Variant {
  id: number;
  title: string | null;
  price_cents: number;
  compare_at_price_cents?: number | null;
  stock_qty: number;
  track_stock: boolean;
  stock_policy: string;
  is_default: boolean;
}

export interface Es10Related {
  slug: string;
  title: string;
  brand?: string | null;
  price_cents: number;
  image_url: string | null;
}

interface Props {
  tenantSlug: string;
  basePath: string;
  currency: string;
  shopName: string;
  crumbs: Array<{ slug: string; name: string }>;
  product: {
    title: string;
    subtitle: string | null;
    brand: string | null;
    description: string | null;
    isNew: boolean;
    images: Array<{ url: string; alt: string | null }>;
  };
  variants: Es10Variant[];
  optionName: string;
  related: Es10Related[];
  fitsWith: Es10Related | null;
}

function czk(cents: number, currency = "CZK"): string {
  return new Intl.NumberFormat("cs-CZ", { style: "currency", currency, maximumFractionDigits: 0 }).format(cents / 100);
}

export function Eshop10Detail({ tenantSlug, basePath, currency, shopName, crumbs, product, variants, optionName, related, fitsWith }: Props) {
  const inStock = (v: Es10Variant) => !v.track_stock || v.stock_qty > 0 || v.stock_policy === "continue";
  const firstAvailable = useMemo(() => variants.find((v) => v.is_default && inStock(v)) ?? variants.find(inStock) ?? variants[0], [variants]);
  const [variantId, setVariantId] = useState<number | null>(variants.length > 1 ? null : firstAvailable?.id ?? null);
  const [busy, setBusy] = useState(false);
  const [needSize, setNeedSize] = useState(false);
  const [tab, setTab] = useState(0);
  const [mainImg, setMainImg] = useState(0);
  const [wished, setWished] = useState(false);
  const [fitsBusy, setFitsBusy] = useState(false);

  const selected = variants.find((v) => v.id === variantId) ?? null;
  const shown = selected ?? firstAvailable;
  const onSale = shown?.compare_at_price_cents != null && shown.compare_at_price_cents > shown.price_cents;
  const pct = onSale ? Math.round((1 - shown!.price_cents / shown!.compare_at_price_cents!) * 100) : 0;
  const anyStock = variants.some(inStock);
  const hasSizes = variants.length > 1;

  const addToCart = async () => {
    if (busy) return;
    const v = hasSizes ? selected : firstAvailable;
    if (!v) return;
    if (hasSizes && !selected) { setNeedSize(true); return; }
    setBusy(true);
    try {
      await fetch(`/api/demo/${tenantSlug}/shop/cart/items`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ variant_id: v.id, qty: 1 }),
      });
      window.dispatchEvent(new CustomEvent("webero-cart-item-added", { detail: { title: product.title } }));
      window.dispatchEvent(new Event("webero-cart-updated"));
    } finally {
      setBusy(false);
    }
  };

  const tabs = [
    { label: "O produktu", body: product.description ?? product.subtitle ?? "" },
    { label: "Materiál a péče", body: "Svršek: textil / syntetika · Podšívka: textil · Podešev: guma. Doporučujeme impregnovat před prvním nošením a čistit jemným kartáčem nasucho. Do pračky nikdy — boty ti poděkují." },
    { label: "Doprava a vrácení", body: "Doprava zdarma nad 2 500 Kč, jinak od 79 Kč. Odesíláme do 24 hodin, doručení obvykle do 2 pracovních dnů. Vrácení do 30 dní bez udání důvodu — stačí, když boty nebyly venku." },
  ];

  const gallery = product.images.length > 0 ? product.images : [{ url: "", alt: null }];

  return (
    <div style={{ fontFamily: SANS, color: INK, maxWidth: 1460, margin: "0 auto", padding: "0 24px" }}>
      <style>{`
        .es10d-crumb { font-size: 13px; font-weight: 500; color: ${MUTED}; text-decoration: none; transition: color 0.13s; }
        .es10d-crumb:hover { color: ${INK}; }
        .es10d-grid { display: grid; grid-template-columns: minmax(0, 1.35fr) minmax(360px, 1fr); gap: 40px; align-items: start; }
        @media (max-width: 980px) { .es10d-grid { grid-template-columns: 1fr; } .es10d-sticky { position: static !important; } }

        .es10d-main { position: relative; aspect-ratio: 1/1; border-radius: 2px; overflow: hidden; background: ${SURFACE}; }
        .es10d-main img { width: 100%; height: 100%; object-fit: cover; display: block; }
        .es10d-thumb { aspect-ratio: 1/1; border-radius: 2px; overflow: hidden; background: ${SURFACE}; border: 2px solid transparent;
          cursor: pointer; padding: 0; transition: border-color 0.14s; }
        .es10d-thumb img { width: 100%; height: 100%; object-fit: cover; display: block; }
        .es10d-thumb--on { border-color: ${BLACK}; }

        .es10d-size { height: 46px; border: 1.5px solid ${BORDER}; border-radius: 2px; background: #fff; cursor: pointer;
          font-family: ${SANS}; font-size: 13.5px; font-weight: 700; color: ${INK};
          transition: border-color 0.13s, background 0.13s, color 0.13s; }
        .es10d-size:hover { border-color: ${INK}; }
        .es10d-size--on { background: ${BLACK}; border-color: ${BLACK}; color: ${VOLT}; }
        .es10d-size--out { color: #c2c2c0; text-decoration: line-through; cursor: not-allowed; background: ${SURFACE}; }
        .es10d-size--out:hover { border-color: ${BORDER}; }

        .es10d-cta { display: flex; align-items: center; justify-content: center; gap: 10px; width: 100%; height: 54px;
          border: none; border-radius: 2px; background: ${VOLT}; color: ${ON_VOLT}; cursor: pointer;
          font-family: ${COND}; font-size: 17.5px; font-weight: 800; letter-spacing: 0.13em; text-transform: uppercase;
          transition: background 0.15s, letter-spacing 0.2s; }
        .es10d-cta:hover { background: #d9ff55; letter-spacing: 0.17em; }
        .es10d-cta:disabled { background: ${SURFACE}; color: ${MUTED}; cursor: not-allowed; letter-spacing: 0.13em; }

        .es10d-wish { width: 54px; height: 54px; flex-shrink: 0; border: 2px solid ${BORDER}; border-radius: 2px; background: #fff;
          color: ${INK}; cursor: pointer; display: inline-flex; align-items: center; justify-content: center;
          transition: background 0.14s, border-color 0.14s, color 0.14s; }
        .es10d-wish:hover { border-color: ${INK}; }
        .es10d-wish--on { background: ${VOLT}; border-color: ${VOLT}; color: ${ON_VOLT}; }

        .es10d-tab { padding: 13px 2px; margin-right: 26px; border: none; background: none; cursor: pointer; position: relative;
          font-family: ${COND}; font-size: 16.5px; font-weight: 800; letter-spacing: 0.09em; text-transform: uppercase; color: ${MUTED};
          transition: color 0.14s; }
        .es10d-tab::after { content: ""; position: absolute; left: 0; right: 0; bottom: -1px; height: 3px; background: ${VOLT};
          transform: scaleX(0); transform-origin: left; transition: transform 0.2s cubic-bezier(0.16,1,0.3,1); }
        .es10d-tab--on { color: ${INK}; }
        .es10d-tab--on::after { transform: scaleX(1); }

        .es10d-rel { display: flex; flex-direction: column; text-decoration: none; }
        .es10d-rel-media { aspect-ratio: 1/1; border-radius: 2px; overflow: hidden; background: ${SURFACE}; }
        .es10d-rel-media img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.4s cubic-bezier(0.16,1,0.3,1); }
        .es10d-rel:hover .es10d-rel-media img { transform: scale(1.06); }
        .es10d-rel-title { margin-top: 8px; font-size: 14px; font-weight: 600; color: ${INK}; line-height: 1.35;
          overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; }
        .es10d-rel:hover .es10d-rel-title { text-decoration: underline; text-underline-offset: 3px; }

        .es10d-fits-btn { height: 36px; padding: 0 15px; border: 2px solid ${INK}; border-radius: 2px; background: #fff; color: ${INK};
          cursor: pointer; font-family: ${COND}; font-size: 13px; font-weight: 800; letter-spacing: 0.1em; text-transform: uppercase;
          transition: background 0.15s, color 0.15s; flex-shrink: 0; }
        .es10d-fits-btn:hover { background: ${INK}; color: #fff; }
        .es10d-guide { font-size: 13px; font-weight: 600; color: ${MUTED}; text-decoration: underline; text-underline-offset: 3px;
          background: none; border: none; cursor: pointer; font-family: ${SANS}; transition: color 0.13s; }
        .es10d-guide:hover { color: ${INK}; }
      `}</style>

      {/* breadcrumb */}
      <nav style={{ display: "flex", alignItems: "center", gap: 8, padding: "18px 0 16px", flexWrap: "wrap" }} aria-label="Drobečková navigace">
        <Link href={basePath} className="es10d-crumb">{shopName || "Obchod"}</Link>
        {crumbs.map((c) => (
          <span key={c.slug} style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
            <span style={{ color: BORDER }}>›</span>
            <Link href={`${basePath}?kategorie=${c.slug}`} className="es10d-crumb">{c.name}</Link>
          </span>
        ))}
        <span style={{ color: BORDER }}>›</span>
        <span style={{ fontSize: 13, fontWeight: 700, color: INK }}>{product.title}</span>
      </nav>

      <div className="es10d-grid">
        {/* ═══ GALERIE ═══ */}
        <div>
          <div className="es10d-main">
            {gallery[mainImg]?.url && <img src={gallery[mainImg].url} alt={gallery[mainImg].alt ?? product.title} />}
            <span style={{ position: "absolute", top: 12, left: 12, display: "flex", flexDirection: "column", gap: 5, alignItems: "flex-start" }}>
              {onSale && <span style={{ background: SALE_INK, color: "#fff", borderRadius: 2, padding: "6px 10px", fontFamily: COND, fontSize: 15, fontWeight: 800, lineHeight: 1 }}>−{pct} %</span>}
              {onSale && <span style={{ background: VOLT, color: ON_VOLT, borderRadius: 2, padding: "5px 9px", fontFamily: COND, fontSize: 12.5, fontWeight: 800, letterSpacing: "0.06em", textTransform: "uppercase", lineHeight: 1 }}>Extra −5 %</span>}
              {!onSale && product.isNew && <span style={{ background: BLACK, color: VOLT, borderRadius: 2, padding: "6px 10px", fontFamily: COND, fontSize: 13, fontWeight: 800, letterSpacing: "0.09em", textTransform: "uppercase", lineHeight: 1 }}>Novinka</span>}
            </span>
          </div>
          {gallery.length > 1 && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 10, marginTop: 10 }}>
              {gallery.map((im, i) => (
                <button key={i} type="button" className={`es10d-thumb${i === mainImg ? " es10d-thumb--on" : ""}`} onClick={() => setMainImg(i)} aria-label={`Foto ${i + 1}`}>
                  {im.url && <img src={im.url} alt="" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ═══ STICKY SLOUPEC ═══ */}
        <div className="es10d-sticky" style={{ position: "sticky", top: 130 }}>
          {product.brand && (
            <Link href={`${basePath}?znacka=${encodeURIComponent(product.brand)}`} style={{ fontFamily: COND, fontSize: 14.5, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: MUTED, textDecoration: "none" }}>{product.brand}</Link>
          )}
          <h1 style={{ margin: "6px 0 0", fontFamily: COND, fontSize: "clamp(28px, 2.8vw, 40px)", fontWeight: 800, letterSpacing: "0.02em", textTransform: "uppercase", color: INK, lineHeight: 0.98 }}>{product.title}</h1>
          {product.subtitle && <p style={{ margin: "9px 0 0", fontSize: 14.5, fontWeight: 500, lineHeight: 1.5, color: MUTED }}>{product.subtitle}</p>}

          {/* cena */}
          {shown && (
            <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginTop: 16 }}>
              <span style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-0.01em", color: onSale ? SALE_INK : INK }}>{czk(shown.price_cents, currency)}</span>
              {onSale && <span style={{ fontSize: 16, fontWeight: 500, color: MUTED, textDecoration: "line-through" }}>{czk(shown.compare_at_price_cents!, currency)}</span>}
              <span style={{ fontSize: 12.5, fontWeight: 500, color: MUTED }}>s DPH</span>
            </div>
          )}

          {/* velikosti */}
          {hasSizes && (
            <div style={{ marginTop: 18 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 9 }}>
                <span style={{ fontFamily: COND, fontSize: 15, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", color: needSize && !selected ? SALE_INK : INK }}>
                  {needSize && !selected ? `Vyber ${optionName.toLowerCase()}` : optionName}
                </span>
                <button type="button" className="es10d-guide">Průvodce velikostmi</button>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(74px, 1fr))", gap: 8 }}>
                {variants.map((v) => {
                  const out = !inStock(v);
                  return (
                    <button key={v.id} type="button" disabled={out}
                      className={`es10d-size${v.id === variantId ? " es10d-size--on" : ""}${out ? " es10d-size--out" : ""}`}
                      onClick={() => { setVariantId(v.id); setNeedSize(false); }}>
                      {v.title ?? "—"}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* CTA + wishlist */}
          <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
            <button type="button" className="es10d-cta" disabled={!anyStock || busy} onClick={addToCart}>
              {anyStock ? (busy ? "Přidávám…" : "Přidat do košíku") : "Vyprodáno"}
              {anyStock && !busy && <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 7h12l1.2 13.2a1.5 1.5 0 0 1-1.5 1.8H6.3a1.5 1.5 0 0 1-1.5-1.8L6 7z"/><path d="M8.5 9.5V6a3.5 3.5 0 0 1 7 0v3.5"/></svg>}
            </button>
            <button type="button" aria-label="Přidat do oblíbených" className={`es10d-wish${wished ? " es10d-wish--on" : ""}`} onClick={() => setWished(!wished)}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill={wished ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20.5S3.5 15.6 3.5 9.7a4.7 4.7 0 0 1 8.5-2.8A4.7 4.7 0 0 1 20.5 9.7c0 5.9-8.5 10.8-8.5 10.8z"/></svg>
            </button>
          </div>

          {/* benefity */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 20, padding: "16px 0", borderTop: `1px solid ${BORDER}`, borderBottom: `1px solid ${BORDER}` }}>
            {[
              { icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={GREEN} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M1.5 6h13v11h-13z"/><path d="M14.5 10h4l3 3.5V17h-7"/><circle cx="6" cy="17.5" r="1.9"/><circle cx="18" cy="17.5" r="1.9"/></svg>, text: <><strong>Doprava zdarma nad 2 500 Kč</strong> — odesíláme do 24 h</> },
              { icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={INK} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 3-6.7"/><path d="M3 4v5h5"/></svg>, text: <>Vrácení do <strong>30 dní</strong> bez udání důvodu</> },
              { icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={VOLT_DEEP} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><path d="M9 12.5l2.2 2.2L15.5 10"/></svg>, text: <><strong>5 % zpátky</strong> na klubový účet z každého nákupu</> },
            ].map((b, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 11, fontSize: 13.5, fontWeight: 500, color: INK }}>
                <span style={{ flexShrink: 0, display: "inline-flex" }}>{b.icon}</span>
                <span>{b.text}</span>
              </div>
            ))}
          </div>

          {/* HODÍ SE K… */}
          {fitsWith && (
            <div style={{ marginTop: 18 }}>
              <div style={{ fontFamily: COND, fontSize: 15, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", color: INK, marginBottom: 10 }}>Hodí se k…</div>
              <div style={{ display: "flex", alignItems: "center", gap: 13, padding: 10, border: `1.5px solid ${BORDER}`, borderRadius: 2 }}>
                <Link href={`${basePath}/${fitsWith.slug}`} style={{ flexShrink: 0 }}>
                  {fitsWith.image_url ? <img src={fitsWith.image_url} alt="" style={{ width: 62, height: 62, borderRadius: 2, objectFit: "cover", background: SURFACE }} loading="lazy" /> : <span style={{ display: "block", width: 62, height: 62, borderRadius: 2, background: SURFACE }} />}
                </Link>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <Link href={`${basePath}/${fitsWith.slug}`} style={{ display: "block", fontSize: 13.5, fontWeight: 600, color: INK, textDecoration: "none", lineHeight: 1.3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{fitsWith.title}</Link>
                  <span style={{ display: "block", marginTop: 3, fontSize: 14, fontWeight: 800, color: INK }}>{czk(fitsWith.price_cents, currency)}</span>
                </div>
                <Link href={`${basePath}/${fitsWith.slug}`} className="es10d-fits-btn" style={{ display: "inline-flex", alignItems: "center", textDecoration: "none" }}>Zobrazit</Link>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ═══ TABY ═══ */}
      <div style={{ marginTop: 46 }}>
        <div style={{ borderBottom: `1px solid ${BORDER}` }}>
          {tabs.map((t, i) => (
            <button key={i} type="button" className={`es10d-tab${tab === i ? " es10d-tab--on" : ""}`} onClick={() => setTab(i)}>{t.label}</button>
          ))}
        </div>
        <div style={{ maxWidth: 760, padding: "20px 0 4px", fontSize: 14.5, fontWeight: 500, lineHeight: 1.65, color: "#3c3c3e", whiteSpace: "pre-line" }}>
          {tabs[tab].body}
        </div>
      </div>

      {/* ═══ PODOBNÉ PRODUKTY ═══ */}
      {related.length > 0 && (
        <div style={{ marginTop: 40, paddingBottom: 46 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
            <span aria-hidden style={{ width: 10, height: 10, background: VOLT, flexShrink: 0 }} />
            <h2 style={{ margin: 0, fontFamily: COND, fontSize: "clamp(22px, 2.2vw, 30px)", fontWeight: 800, letterSpacing: "0.06em", textTransform: "uppercase", color: INK, lineHeight: 1 }}>
              {product.brand ? `Další produkty ${product.brand}` : "Podobné produkty"}
            </h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16 }}>
            {related.map((r) => (
              <Link key={r.slug} href={`${basePath}/${r.slug}`} className="es10d-rel">
                <span className="es10d-rel-media">{r.image_url && <img src={r.image_url} alt={r.title} loading="lazy" />}</span>
                {r.brand && <span style={{ marginTop: 8, fontFamily: COND, fontSize: 12.5, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: MUTED }}>{r.brand}</span>}
                <span className="es10d-rel-title">{r.title}</span>
                <span style={{ marginTop: 4, fontSize: 15, fontWeight: 800, color: INK }}>{czk(r.price_cents, currency)}</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
