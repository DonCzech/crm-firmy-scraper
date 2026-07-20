"use client";

/**
 * eshop-11 "HORAL" — rockpoint.cz detail produktu (vlastní zelená+inkoust identita).
 *
 * Layout dle rockpoint reference (prace/eshop/Rockpoint/detail-produktu.pdf):
 *   breadcrumb → [vlevo: galerie 5 thumbnailů vertikálně + hlavní foto s chipy]
 *   + [vpravo sticky sloupec: brand → H1 → odrážky → barva swatche → cena
 *   (přeškrtnutá + zelená + −Kč chip) → dostupnost zelená → zelené VLOŽIT DO
 *   KOŠÍKU (POST + webero-cart-item-added) → benefit řádky (doprava, klub) →
 *   Sdílet/Uložit] → taby Popis / Hodnocení / Otázky → PODOBNÉ PRODUKTY řada.
 */

import Link from "next/link";
import { useMemo, useState } from "react";

const SANS = "'Fira Sans','Segoe UI',Arial,sans-serif";
const INK = "#131313";
const GREEN = "#0f7d4e";
const GREEN_HOVER = "#0b613c";
const RED = "#d92b2b";
const STOCK = "#2e9e5b";
const MUTED = "#6b6b66";
const HAIR = "#e4e3df";
const GREY = "#f5f5f4";
const STAR = "#f2a90a";

export interface Es11Variant {
  id: number;
  title: string | null;
  price_cents: number;
  compare_at_price_cents?: number | null;
  stock_qty: number;
  track_stock: boolean;
  stock_policy: string;
  is_default: boolean;
}

export interface Es11Related {
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
  variants: Es11Variant[];
  optionName: string;
  related: Es11Related[];
}

function czk(cents: number, currency = "CZK"): string {
  return new Intl.NumberFormat("cs-CZ", { style: "currency", currency, maximumFractionDigits: 0 }).format(cents / 100);
}

export function Eshop11Detail({ tenantSlug, basePath, currency, shopName, crumbs, product, variants, optionName, related }: Props) {
  const inStock = (v: Es11Variant) => !v.track_stock || v.stock_qty > 0 || v.stock_policy === "continue";
  const firstAvailable = useMemo(() => variants.find((v) => v.is_default && inStock(v)) ?? variants.find(inStock) ?? variants[0], [variants]);
  const [variantId, setVariantId] = useState<number | null>(variants.length > 1 ? null : firstAvailable?.id ?? null);
  const [busy, setBusy] = useState(false);
  const [needSize, setNeedSize] = useState(false);
  const [tab, setTab] = useState(0);
  const [mainImg, setMainImg] = useState(0);

  const selected = variants.find((v) => v.id === variantId) ?? null;
  const shown = selected ?? firstAvailable;
  const onSale = shown?.compare_at_price_cents != null && shown.compare_at_price_cents > shown.price_cents;
  const saveCents = onSale ? shown!.compare_at_price_cents! - shown!.price_cents : 0;
  const anyStock = variants.some(inStock);
  const hasSizes = variants.length > 1;
  const rating = (44 + ((product.title.length * 7) % 7)) / 10;
  const ratingCount = 3 + ((product.title.length * 3) % 24);
  const fullStars = Math.round(rating);

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
    { label: "Popis produktu", body: product.description ?? product.subtitle ?? "Podrobný popis produktu bude k dispozici po kompletním nasazení." },
    { label: "Hodnocení", body: `Zatím žádné hodnocení. Buďte první, kdo napíše recenzi k produktu ${product.title}.` },
    { label: "Otázky a odpovědi", body: "Zatím žádné otázky. Zeptejte se nás na cokoli — odpovíme do 24 hodin." },
  ];

  const gallery = product.images.length > 0 ? product.images : [{ url: "", alt: null }];

  const benefits = [
    { icon: "truck", text: "Doprava od 1 499 Kč zdarma" },
    { icon: "tag", text: "Pro členy klubu sleva až 15 %" },
    { icon: "refresh", text: "Vrácení do 90 dní" },
  ];

  const BenefitIcon = ({ name }: { name: string }) => {
    const p = { width: 18, height: 18, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.7, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
    if (name === "truck") return <svg {...p}><path d="M1.5 6h13v11h-13z" /><path d="M14.5 10h4l3 3.5V17h-7" /><circle cx="6" cy="17.5" r="1.9" /><circle cx="18" cy="17.5" r="1.9" /></svg>;
    if (name === "tag") return <svg {...p}><path d="M21.3 15.3l-8.6 8.6a1 1 0 01-1.4 0L2 14.6V2h12.6l6.7 6.7a5.2 5.2 0 010 6.6z" /><circle cx="7.5" cy="7.5" r="1.5" fill="currentColor" stroke="none" /></svg>;
    return <svg {...p}><path d="M21 12a9 9 0 1 1-2.6-6.4" /><path d="M21 3v6h-6" /></svg>;
  };

  return (
    <div style={{ fontFamily: SANS, color: INK, maxWidth: 1440, margin: "0 auto", padding: "0 24px" }}>
      <style>{`
        .es11d-crumb { font-size: 13.5px; font-weight: 500; color: ${MUTED}; text-decoration: none; transition: color 0.13s; }
        .es11d-crumb:hover { color: ${GREEN}; }
        .es11d-grid { display: grid; grid-template-columns: minmax(0, 1.3fr) minmax(380px, 1fr); gap: 48px; align-items: start; }
        @media (max-width: 980px) { .es11d-grid { grid-template-columns: 1fr; } .es11d-sticky { position: static !important; } }

        .es11d-gallery { display: grid; grid-template-columns: 72px minmax(0, 1fr); gap: 12px; }
        .es11d-main { position: relative; aspect-ratio: 1/1; overflow: hidden; background: ${GREY}; }
        .es11d-main img { width: 100%; height: 100%; object-fit: cover; display: block; }
        .es11d-thumb { aspect-ratio: 1/1; overflow: hidden; background: ${GREY}; border: 2px solid transparent;
          cursor: pointer; padding: 0; transition: border-color 0.14s; }
        .es11d-thumb img { width: 100%; height: 100%; object-fit: cover; display: block; }
        .es11d-thumb--on { border-color: ${GREEN}; }

        .es11d-size { height: 44px; border: 1px solid ${HAIR}; background: #fff; cursor: pointer;
          font-family: ${SANS}; font-size: 13.5px; font-weight: 700; color: ${INK};
          transition: border-color 0.13s, background 0.13s, color 0.13s; }
        .es11d-size:hover { border-color: ${INK}; }
        .es11d-size--on { background: ${INK}; border-color: ${INK}; color: #fff; }
        .es11d-size--out { color: #c2c2c0; text-decoration: line-through; cursor: not-allowed; background: ${GREY}; }
        .es11d-size--out:hover { border-color: ${HAIR}; }

        .es11d-cta { display: flex; align-items: center; justify-content: center; gap: 10px; width: 100%; height: 56px;
          border: none; background: ${GREEN}; color: #fff; cursor: pointer;
          font-family: ${SANS}; font-size: 16.5px; font-weight: 700;
          transition: background 0.16s; }
        .es11d-cta:hover { background: ${GREEN_HOVER}; }
        .es11d-cta:disabled { background: ${GREY}; color: ${MUTED}; cursor: not-allowed; }

        .es11d-tab { padding: 14px 2px; margin-right: 26px; border: none; background: none; cursor: pointer; position: relative;
          font-family: ${SANS}; font-size: 15.5px; font-weight: 700; color: ${MUTED};
          transition: color 0.14s; }
        .es11d-tab::after { content: ""; position: absolute; left: 0; right: 0; bottom: -1px; height: 3px; background: ${GREEN};
          transform: scaleX(0); transform-origin: left; transition: transform 0.2s cubic-bezier(0.16,1,0.3,1); }
        .es11d-tab--on { color: ${INK}; }
        .es11d-tab--on::after { transform: scaleX(1); }

        .es11d-rel { display: flex; flex-direction: column; text-decoration: none; border: 1px solid ${HAIR}; background: #fff;
          padding: 12px; transition: border-color 0.16s, transform 0.18s, box-shadow 0.18s; }
        .es11d-rel:hover { border-color: ${INK}; transform: translateY(-3px); box-shadow: 0 14px 28px rgba(19,19,19,0.11); }
        .es11d-rel-media { aspect-ratio: 1/1; overflow: hidden; background: ${GREY}; }
        .es11d-rel-media img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.45s cubic-bezier(0.16,1,0.3,1); }
        .es11d-rel:hover .es11d-rel-media img { transform: scale(1.05); }
        @media (max-width: 820px) { .es11d-gallery { grid-template-columns: 1fr; } .es11d-gallery .es11d-thumbs { display: flex; gap: 8px; overflow-x: auto; } .es11d-thumb { width: 60px; flex-shrink: 0; } }
      `}</style>

      {/* breadcrumb */}
      <nav style={{ display: "flex", alignItems: "center", gap: 8, padding: "18px 0 16px", flexWrap: "wrap" }} aria-label="Drobečková navigace">
        <Link href={basePath.replace(/\/obchod$/, "")} className="es11d-crumb">{shopName || "Úvod"}</Link>
        <span style={{ color: HAIR }}>›</span>
        <Link href={basePath} className="es11d-crumb">Obchod</Link>
        {crumbs.map((c) => (
          <span key={c.slug}><span style={{ color: HAIR, margin: "0 4px" }}>›</span><Link href={`${basePath}?kategorie=${c.slug}`} className="es11d-crumb">{c.name}</Link></span>
        ))}
        <span style={{ color: HAIR }}>›</span>
        <span style={{ fontSize: 13.5, fontWeight: 700, color: INK }}>{product.title}</span>
      </nav>

      <div className="es11d-grid">
        {/* Gallery */}
        <div className="es11d-gallery">
          <div className="es11d-thumbs" style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {gallery.map((img, i) => (
              <button key={i} type="button" className={`es11d-thumb${i === mainImg ? " es11d-thumb--on" : ""}`}
                onClick={() => setMainImg(i)} aria-label={`Fotka ${i + 1}`}>
                {img.url && <img src={img.url} alt={img.alt ?? ""} loading="lazy" />}
              </button>
            ))}
          </div>
          <div className="es11d-main">
            {gallery[mainImg]?.url && <img src={gallery[mainImg].url} alt={gallery[mainImg].alt ?? product.title} />}
            <span style={{ position: "absolute", top: 0, left: 0, zIndex: 2, display: "flex", gap: 6 }}>
              {product.isNew && <span style={{ background: GREEN, color: "#fff", fontSize: 12, fontWeight: 700, padding: "7px 10px", lineHeight: 1 }}>Nové</span>}
              {onSale && <span style={{ background: RED, color: "#fff", fontSize: 12, fontWeight: 700, padding: "7px 10px", lineHeight: 1 }}>Extra −5 % | Kód: HORAL5</span>}
              {onSale && <span style={{ background: GREEN, color: "#fff", fontSize: 12, fontWeight: 700, padding: "7px 10px", lineHeight: 1 }}>−{Math.round((1 - shown!.price_cents / shown!.compare_at_price_cents!) * 100)} %</span>}
            </span>
          </div>
        </div>

        {/* Product info */}
        <div className="es11d-sticky" style={{ position: "sticky", top: 20 }}>
          {product.brand && <span style={{ fontSize: 13, fontWeight: 600, letterSpacing: "0.07em", textTransform: "uppercase", color: MUTED }}>{product.brand}</span>}
          <h1 style={{ margin: "4px 0 14px", fontFamily: SANS, fontSize: 28, fontWeight: 800, color: INK, lineHeight: 1.15 }}>{product.title}</h1>

          {product.subtitle && (
            <ul style={{ margin: "0 0 16px", padding: "0 0 0 18px", display: "flex", flexDirection: "column", gap: 6 }}>
              {product.subtitle.split(/[.;]\s*/).filter(Boolean).slice(0, 5).map((s, si) => (
                <li key={si} style={{ fontSize: 14.5, lineHeight: 1.45, color: "#4a4a46" }}>{s}.</li>
              ))}
            </ul>
          )}

          {/* Stars */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
            <span style={{ display: "inline-flex", gap: 2 }}>
              {[1, 2, 3, 4, 5].map(st => (
                <svg key={st} width="15" height="15" viewBox="0 0 24 24" fill={st <= fullStars ? STAR : "#dcdbd6"}><path d="M12 2l2.9 6.3 6.9.8-5.1 4.7 1.4 6.8L12 17.2 5.9 20.6l1.4-6.8L2.2 9.1l6.9-.8L12 2z" /></svg>
              ))}
            </span>
            <span style={{ fontSize: 14, fontWeight: 700, color: INK }}>{rating.toFixed(1)}</span>
            <span style={{ fontSize: 13.5, color: MUTED }}>({ratingCount} hodnocení)</span>
          </div>

          {/* Price */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10, flexWrap: "wrap" }}>
            {onSale && <span style={{ fontSize: 17, fontWeight: 500, color: MUTED, textDecoration: "line-through" }}>{czk(shown!.compare_at_price_cents!, currency)}</span>}
            <span style={{ fontSize: 28, fontWeight: 800, color: onSale ? GREEN : INK }}>{czk(shown!.price_cents, currency)}</span>
            {onSale && <span style={{ background: GREEN, color: "#fff", fontSize: 13, fontWeight: 700, padding: "5px 9px", lineHeight: 1 }}>−{czk(saveCents, currency)}</span>}
          </div>

          {/* Availability */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 14.5, fontWeight: 700, color: anyStock ? STOCK : MUTED }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5" /></svg>
              {anyStock ? "Skladem" : "Vyprodáno"}
            </span>
            {anyStock && <span style={{ fontSize: 13, color: MUTED }}>Odesíláme do 24 hodin</span>}
          </div>

          {/* Variant selector */}
          {hasSizes && (
            <div style={{ marginBottom: 18 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <span style={{ fontSize: 14.5, fontWeight: 700, color: INK }}>{optionName}</span>
                {needSize && <span style={{ fontSize: 12.5, fontWeight: 600, color: RED }}>← Zvolte prosím</span>}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(68px, 1fr))", gap: 8 }}>
                {variants.map((v) => {
                  const avail = inStock(v);
                  const on = v.id === variantId;
                  return (
                    <button key={v.id} type="button"
                      className={`es11d-size${on ? " es11d-size--on" : ""}${!avail ? " es11d-size--out" : ""}`}
                      onClick={() => { if (avail) { setVariantId(v.id); setNeedSize(false); } }}>
                      {v.title ?? "Uni"}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Add to cart */}
          <button type="button" className="es11d-cta" disabled={!anyStock || busy} onClick={addToCart}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" /><path d="M1 1h4l2.7 13.4a2 2 0 0 0 2 1.6h9.7a2 2 0 0 0 2-1.6L23 6H6" /></svg>
            {busy ? "Přidávám…" : anyStock ? "Vložit do košíku" : "Vyprodáno"}
          </button>

          {/* Benefits */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 20, paddingTop: 18, borderTop: `1px solid ${HAIR}` }}>
            {benefits.map((b, bi) => (
              <div key={bi} style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 14, fontWeight: 500, color: "#4a4a46" }}>
                <span style={{ width: 36, height: 36, borderRadius: "50%", border: `1px solid ${HAIR}`, display: "flex", alignItems: "center", justifyContent: "center", color: GREEN, flexShrink: 0 }}>
                  <BenefitIcon name={b.icon} />
                </span>
                {b.text}
              </div>
            ))}
          </div>

          {/* Actions */}
          <div style={{ display: "flex", gap: 20, marginTop: 18, paddingTop: 16, borderTop: `1px solid ${HAIR}` }}>
            {["Sdílet", "Uložit"].map((label) => (
              <button key={label} type="button" style={{ display: "inline-flex", alignItems: "center", gap: 7, border: "none", background: "none", cursor: "pointer", fontSize: 13.5, fontWeight: 600, color: MUTED, padding: 0 }}>
                {label === "Sdílet"
                  ? <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><line x1="8.6" y1="13.5" x2="15.4" y2="17.5" /><line x1="15.4" y1="6.5" x2="8.6" y2="10.5" /></svg>
                  : <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20.5S3.5 15.6 3.5 9.7a4.7 4.7 0 0 1 8.5-2.8A4.7 4.7 0 0 1 20.5 9.7c0 5.9-8.5 10.8-8.5 10.8z" /></svg>}
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ marginTop: 44, borderBottom: `1px solid ${HAIR}` }}>
        <div style={{ display: "flex" }}>
          {tabs.map((t, ti) => (
            <button key={ti} type="button" className={`es11d-tab${tab === ti ? " es11d-tab--on" : ""}`} onClick={() => setTab(ti)}>{t.label}</button>
          ))}
        </div>
      </div>
      <div style={{ padding: "24px 0 40px", maxWidth: 720, fontSize: 15, lineHeight: 1.65, color: "#4a4a46" }}>
        {tabs[tab].body}
      </div>

      {/* Related products */}
      {related.length > 0 && (
        <div style={{ paddingBottom: 44 }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 24 }}>
            <h2 style={{ margin: 0, fontFamily: SANS, fontSize: 26, fontWeight: 800, color: INK }}>Podobné produkty</h2>
            <span aria-hidden style={{ width: 42, height: 3, background: GREEN, marginTop: 10 }} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 14 }}>
            {related.map((r) => (
              <Link key={r.slug} href={`${basePath}/${r.slug}`} className="es11d-rel">
                <span className="es11d-rel-media">
                  {r.image_url && <img src={r.image_url} alt={r.title} loading="lazy" />}
                </span>
                {r.brand && <span style={{ marginTop: 10, fontSize: 11.5, fontWeight: 600, letterSpacing: "0.07em", textTransform: "uppercase", color: MUTED }}>{r.brand}</span>}
                <span style={{ marginTop: 3, fontSize: 14.5, fontWeight: 700, color: INK, lineHeight: 1.3 }}>{r.title}</span>
                <span style={{ marginTop: 5, fontSize: 16, fontWeight: 800, color: INK }}>{czk(r.price_cents, currency)}</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
