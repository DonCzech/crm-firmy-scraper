"use client";

/**
 * eshop-12 "PACKA" — petcenter.cz detail produktu (vlastní purple/mango identita).
 *
 * Layout dle předlohy (prace/eshop/Petcenter/detail-produktu.pdf):
 *   breadcrumb → [galerie vlevo: hlavní foto + thumbnaily, badge −%/Novinka]
 *   + [pravý sloupec: H1 → hvězdičky + počet hodnocení → krátký popis →
 *   zelený dostupnost box (Skladem · Odesíláme zítra + osobní odběr) →
 *   balení pills (varianty) → velká mango cena + přeškrtnutá → qty stepper +
 *   mango VLOŽIT DO KOŠÍKU (POST + webero-cart-item-added → drawer) →
 *   progress doprava zdarma („Objednejte ještě za X…" 0→1299) →
 *   Kód produktu · Značka] → USP pás → „Doporučujeme ještě přikoupit"
 *   karusel s DO KOŠÍKU → taby Popis a parametry / Recenze zákazníků
 *   (rating souhrn + bars + recenze) → „S tímto produktem zákazníci
 *   nejčastěji nakupují".
 */

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

const DISPLAY = "'Baloo 2','Segoe UI',system-ui,sans-serif";
const SANS = "'Nunito','Segoe UI',system-ui,sans-serif";
const PURPLE = "#6f45d1";
const PURPLE_SOFT = "#f3eeff";
const MANGO = "#ff8a3d";
const MANGO_DEEP = "#f06e1e";
const NAVY = "#14224a";
const GREEN = "#16a06a";
const GREEN_DEEP = "#0e8557";
const GREEN_SOFT = "#e9f7f0";
const SALE = "#f5453b";
const MUTED = "#5b6478";
const BORDER = "#f0e7db";
const CREAM = "#fffbf6";
const FREE_SHIP = 129900;

export interface Es12Variant {
  id: number;
  title: string | null;
  price_cents: number;
  compare_at_price_cents?: number | null;
  stock_qty: number;
  track_stock: boolean;
  stock_policy: string;
  is_default: boolean;
}

export interface Es12Related {
  slug: string;
  title: string;
  brand?: string | null;
  price_cents: number;
  image_url: string | null;
  default_variant_id?: number | null;
}

interface Props {
  tenantSlug: string;
  basePath: string;
  currency: string;
  shopName: string;
  crumbs: Array<{ slug: string; name: string }>;
  product: {
    id: number;
    title: string;
    subtitle: string | null;
    brand: string | null;
    description: string | null;
    isNew: boolean;
    images: Array<{ url: string; alt: string | null }>;
    categoryName?: string | null;
  };
  variants: Es12Variant[];
  optionName: string;
  related: Es12Related[];
}

function czk(cents: number, currency = "CZK"): string {
  return new Intl.NumberFormat("cs-CZ", { style: "currency", currency, maximumFractionDigits: 0 }).format(cents / 100);
}

function shipDate(): string {
  const d = new Date(Date.now() + 24 * 3600 * 1000);
  return `${d.getDate()}.${d.getMonth() + 1}.${d.getFullYear()}`;
}

const REVIEWERS = ["Roman Ulrich", "Jana Dvořáková", "Petr Svoboda", "Lucie Malá", "Tomáš Beneš", "Eva Horáková"];
const REVIEW_TEXTS = [
  "Naší mlsné fence chutná moc :-) Krmíme dlouho a spokojenost, čistě kvalitní složení.",
  "Rychlé dodání, mazlíček nadšený. Objednáváme opakovaně a určitě zase.",
  "Skvělý poměr cena/kvalita. Na prodejně nám navíc ochotně poradili s výběrem.",
  "Konečně produkt, který naše kočka neodmítla. Doporučuji vyzkoušet.",
];

function Es12RecoCard({ r, basePath, currency, tenantSlug }: { r: Es12Related; basePath: string; currency: string; tenantSlug: string }) {
  const [qty, setQty] = useState(1);
  const [busy, setBusy] = useState(false);
  const add = (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    if (!r.default_variant_id || busy) return;
    setBusy(true);
    fetch(`/api/demo/${tenantSlug}/shop/cart/items`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ variant_id: r.default_variant_id, qty }),
    }).then(() => window.dispatchEvent(new Event("webero-cart-item-added"))).finally(() => setBusy(false));
  };
  return (
    <Link href={`${basePath}/${r.slug}`} className="es12d-reco">
      <span className="es12d-reco-media">{r.image_url && <img src={r.image_url} alt="" loading="lazy" />}</span>
      {r.brand && <span className="es12d-reco-brand">{r.brand}</span>}
      <span className="es12d-reco-title">{r.title}</span>
      <span className="es12d-reco-ship">Odesíláme {shipDate()} · <b style={{ color: GREEN }}>Skladem</b></span>
      <span className="es12d-reco-price">{czk(r.price_cents, currency)}</span>
      <span className="es12d-reco-buyrow" onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}>
        <span className="es12d-qty es12d-qty--sm">
          <button type="button" aria-label="Méně" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setQty(v => Math.max(1, v - 1)); }}>−</button>
          <span>{qty}</span>
          <button type="button" aria-label="Více" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setQty(v => Math.min(99, v + 1)); }}>+</button>
        </span>
        <button type="button" className="es12d-reco-buy" disabled={!r.default_variant_id || busy} onClick={add}>Do košíku</button>
      </span>
    </Link>
  );
}

export function Eshop12Detail({ tenantSlug, basePath, currency, shopName, crumbs, product, variants, optionName, related }: Props) {
  const inStock = (v: Es12Variant) => !v.track_stock || v.stock_qty > 0 || v.stock_policy === "continue";
  const firstAvailable = useMemo(() => variants.find((v) => v.is_default && inStock(v)) ?? variants.find(inStock) ?? variants[0], [variants]);
  const [variantId, setVariantId] = useState<number | null>(firstAvailable?.id ?? null);
  const [qty, setQty] = useState(1);
  const [busy, setBusy] = useState(false);
  const [imgIdx, setImgIdx] = useState(0);
  const [tab, setTab] = useState<"popis" | "recenze">("popis");
  const [cartSubtotal, setCartSubtotal] = useState(0);

  const selected = variants.find((v) => v.id === variantId) ?? firstAvailable;
  const price = selected?.price_cents ?? 0;
  const compare = selected?.compare_at_price_cents ?? null;
  const onSale = compare != null && compare > price;
  const pct = onSale ? Math.round((1 - price / compare!) * 100) : 0;
  const selectedInStock = selected ? inStock(selected) : false;
  const stockQty = selected?.stock_qty ?? 0;

  const rating = 4 + ((product.id % 10) / 10);
  const votes = 3 + (product.id % 9);
  const ratingPct = Math.round((rating / 5) * 100);
  const fullStars = Math.round(Math.min(5, rating));
  const reviews = useMemo(() => Array.from({ length: Math.min(3, votes) }, (_, i) => ({
    name: REVIEWERS[(product.id + i) % REVIEWERS.length],
    text: REVIEW_TEXTS[(product.id + i) % REVIEW_TEXTS.length],
    date: `${((product.id + i * 3) % 27) + 1}.${((product.id + i) % 6) + 1}.2026`,
    stars: i === 0 ? 5 : fullStars,
  })), [product.id, votes, fullStars]);

  useEffect(() => {
    fetch(`/api/demo/${tenantSlug}/shop/cart`)
      .then(r => r.json())
      .then(d => { if (d.cart?.subtotal_cents != null) setCartSubtotal(d.cart.subtotal_cents); })
      .catch(() => {});
  }, [tenantSlug]);

  const remaining = Math.max(0, FREE_SHIP - cartSubtotal);
  const shipPctBar = Math.min(100, Math.round((cartSubtotal / FREE_SHIP) * 100));

  const addToCart = () => {
    if (!selected || busy || !selectedInStock) return;
    setBusy(true);
    fetch(`/api/demo/${tenantSlug}/shop/cart/items`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ variant_id: selected.id, qty }),
    })
      .then(() => {
        window.dispatchEvent(new Event("webero-cart-item-added"));
        setCartSubtotal(s => s + price * qty);
      })
      .finally(() => setBusy(false));
  };

  const recoA = related.slice(0, 4);
  const recoB = related.slice(4, 8).length ? related.slice(4, 8) : related.slice(0, 4);

  return (
    <div style={{ fontFamily: SANS, background: CREAM }}>
      <style>{`
        .es12d-wrap { max-width: 1360px; margin: 0 auto; padding: 0 24px; }
        .es12d-bc { display: flex; flex-wrap: wrap; align-items: center; gap: 7px; padding: 16px 0 14px; font-size: 12.5px; font-weight: 700; color: ${MUTED}; }
        .es12d-bc a { color: ${MUTED}; text-decoration: none; transition: color 0.13s; }
        .es12d-bc a:hover { color: ${PURPLE}; }
        .es12d-grid { display: grid; grid-template-columns: 1.02fr 0.98fr; gap: 34px; align-items: start; }
        @media (max-width: 980px) { .es12d-grid { grid-template-columns: 1fr; } }

        .es12d-main { position: relative; aspect-ratio: 1/1; background: #fff; border: 1px solid ${BORDER}; border-radius: 22px; overflow: hidden; }
        .es12d-main img { width: 100%; height: 100%; object-fit: cover; }
        .es12d-thumbs { display: flex; gap: 10px; margin-top: 12px; flex-wrap: wrap; }
        .es12d-thumb { width: 76px; height: 76px; border-radius: 14px; overflow: hidden; border: 2px solid ${BORDER}; background: #fff; cursor: pointer; padding: 0; transition: border-color 0.14s, transform 0.14s; }
        .es12d-thumb.on { border-color: ${PURPLE}; }
        .es12d-thumb:hover { transform: translateY(-2px); }
        .es12d-thumb img { width: 100%; height: 100%; object-fit: cover; display: block; }
        .es12d-badges { position: absolute; top: 14px; left: 14px; display: flex; flex-direction: column; gap: 6px; align-items: flex-start; }
        .es12d-sale { background: ${SALE}; color: #fff; border-radius: 999px; padding: 6px 13px; font-family: ${DISPLAY}; font-size: 14.5px; font-weight: 800; line-height: 1; }
        .es12d-new { background: ${PURPLE}; color: #fff; border-radius: 999px; padding: 6px 13px; font-family: ${DISPLAY}; font-size: 13px; font-weight: 700; line-height: 1; }

        .es12d-availbox { display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap;
          margin-top: 16px; padding: 13px 16px; background: ${GREEN_SOFT}; border: 1.5px solid #cdebdd; border-radius: 14px; }
        .es12d-variants { display: flex; flex-wrap: wrap; gap: 9px; margin-top: 14px; }
        .es12d-var { padding: 10px 16px; border-radius: 999px; border: 2px solid ${BORDER}; background: #fff; cursor: pointer;
          font-family: ${DISPLAY}; font-size: 13.5px; font-weight: 700; color: ${NAVY}; transition: border-color 0.14s, background 0.14s, color 0.14s; }
        .es12d-var.on { border-color: ${PURPLE}; background: ${PURPLE_SOFT}; color: ${PURPLE}; }
        .es12d-var:disabled { opacity: 0.4; cursor: not-allowed; text-decoration: line-through; }

        .es12d-qty { display: inline-flex; align-items: center; border: 2px solid ${BORDER}; border-radius: 999px; background: #fff; flex-shrink: 0; }
        .es12d-qty button { border: none; background: none; cursor: pointer; width: 40px; height: 50px; font-size: 19px; font-weight: 800; color: ${NAVY}; transition: color 0.13s; }
        .es12d-qty button:hover { color: ${MANGO_DEEP}; }
        .es12d-qty > span { min-width: 26px; text-align: center; font-size: 15.5px; font-weight: 800; color: ${NAVY}; }
        .es12d-qty--sm button { width: 28px; height: 36px; font-size: 15px; }
        .es12d-qty--sm > span { min-width: 18px; font-size: 13px; }

        .es12d-cta { flex: 1; display: inline-flex; align-items: center; justify-content: center; gap: 10px; height: 54px;
          border: none; border-radius: 999px; background: ${MANGO}; color: #fff; cursor: pointer;
          font-family: ${DISPLAY}; font-size: 16.5px; font-weight: 800; letter-spacing: 0.04em; text-transform: uppercase;
          box-shadow: 0 12px 26px rgba(240,110,30,0.35); transition: background 0.15s, transform 0.15s, box-shadow 0.15s; }
        .es12d-cta:hover:not(:disabled) { background: ${MANGO_DEEP}; transform: translateY(-2px); box-shadow: 0 16px 32px rgba(240,110,30,0.42); }
        .es12d-cta:disabled { opacity: 0.5; cursor: not-allowed; }

        .es12d-tabs { display: flex; gap: 8px; border-bottom: 2px solid ${BORDER}; margin: 40px 0 0; }
        .es12d-tab { border: none; background: none; cursor: pointer; padding: 12px 18px 14px; margin-bottom: -2px;
          font-family: ${DISPLAY}; font-size: 16px; font-weight: 800; color: ${MUTED}; border-bottom: 3px solid transparent;
          transition: color 0.14s, border-color 0.14s; }
        .es12d-tab.on { color: ${NAVY}; border-bottom-color: ${MANGO}; }

        .es12d-recos { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
        @media (max-width: 1080px) { .es12d-recos { grid-template-columns: repeat(2, 1fr); } }
        .es12d-reco { display: flex; flex-direction: column; background: #fff; border: 1px solid ${BORDER}; border-radius: 18px;
          padding: 13px; text-decoration: none; transition: transform 0.18s, box-shadow 0.18s; }
        .es12d-reco:hover { transform: translateY(-4px); box-shadow: 0 16px 34px rgba(20,34,74,0.10); }
        .es12d-reco-media { aspect-ratio: 1/1; border-radius: 12px; overflow: hidden; background: #f7f2ea; }
        .es12d-reco-media img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.4s; }
        .es12d-reco:hover .es12d-reco-media img { transform: scale(1.06); }
        .es12d-reco-brand { margin-top: 9px; font-size: 10.5px; font-weight: 800; letter-spacing: 0.08em; text-transform: uppercase; color: ${MUTED}; }
        .es12d-reco-title { margin-top: 2px; font-size: 13.5px; font-weight: 700; color: ${NAVY}; line-height: 1.3;
          overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; min-height: 2.6em; }
        .es12d-reco:hover .es12d-reco-title { color: ${PURPLE}; }
        .es12d-reco-ship { margin-top: 5px; font-size: 11.5px; font-weight: 600; color: ${MUTED}; }
        .es12d-reco-price { margin-top: 4px; font-family: ${DISPLAY}; font-size: 16.5px; font-weight: 800; color: ${MANGO_DEEP}; }
        .es12d-reco-buyrow { display: flex; align-items: center; gap: 7px; margin-top: 9px; }
        .es12d-reco-buy { flex: 1; height: 36px; border: none; border-radius: 999px; background: ${GREEN}; color: #fff; cursor: pointer;
          font-family: ${DISPLAY}; font-size: 12px; font-weight: 800; letter-spacing: 0.04em; text-transform: uppercase;
          transition: background 0.15s; }
        .es12d-reco-buy:hover:not(:disabled) { background: ${GREEN_DEEP}; }
        .es12d-reco-buy:disabled { opacity: 0.5; cursor: not-allowed; }

        .es12d-h2 { text-align: center; margin: 0 0 22px; }
        .es12d-h2 h2 { margin: 0; font-family: ${DISPLAY}; font-size: clamp(22px, 2.4vw, 30px); font-weight: 800; color: ${NAVY}; }

        .es12d-bar { height: 8px; border-radius: 4px; background: #f0e9de; overflow: hidden; }
        .es12d-bar > span { display: block; height: 100%; border-radius: 4px; background: ${MANGO}; }
      `}</style>

      <div className="es12d-wrap">
        {/* breadcrumb */}
        <nav className="es12d-bc" aria-label="Drobečková navigace">
          <Link href={basePath.replace(/\/obchod$/, "")}>{shopName}</Link>
          <span aria-hidden>›</span>
          <Link href={basePath}>Obchod</Link>
          {crumbs.map((c) => (
            <span key={c.slug} style={{ display: "inline-flex", gap: 7 }}>
              <span aria-hidden>›</span>
              <Link href={`${basePath}?kategorie=${c.slug}`}>{c.name}</Link>
            </span>
          ))}
          <span aria-hidden>›</span>
          <span style={{ color: NAVY }}>{product.title}</span>
        </nav>

        <div className="es12d-grid">
          {/* GALERIE */}
          <div>
            <div className="es12d-main">
              {product.images[imgIdx] && <img src={product.images[imgIdx].url} alt={product.images[imgIdx].alt ?? product.title} />}
              <span className="es12d-badges">
                {onSale && <span className="es12d-sale">−{pct} %</span>}
                {product.isNew && <span className="es12d-new">Novinka</span>}
              </span>
            </div>
            {product.images.length > 1 && (
              <div className="es12d-thumbs">
                {product.images.map((im, i) => (
                  <button key={i} type="button" className={`es12d-thumb${i === imgIdx ? " on" : ""}`} onClick={() => setImgIdx(i)} aria-label={`Foto ${i + 1}`}>
                    <img src={im.url} alt="" loading="lazy" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* PRAVÝ SLOUPEC */}
          <div>
            {product.brand && <span style={{ fontSize: 12.5, fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase", color: PURPLE }}>{product.brand}</span>}
            <h1 style={{ margin: "6px 0 0", fontFamily: DISPLAY, fontSize: "clamp(24px, 2.6vw, 34px)", fontWeight: 800, color: NAVY, lineHeight: 1.15 }}>{product.title}</h1>

            <span style={{ display: "inline-flex", alignItems: "center", gap: 8, marginTop: 10 }}>
              <span style={{ display: "inline-flex", gap: 1 }}>
                {[1, 2, 3, 4, 5].map(st => (
                  <svg key={st} width="15" height="15" viewBox="0 0 24 24" fill={st <= fullStars ? MANGO : "#e8e0d4"}><path d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4l-5.9 3.1 1.2-6.5L2.5 9.4l6.6-.9z"/></svg>
                ))}
              </span>
              <button type="button" onClick={() => setTab("recenze")} style={{ border: "none", background: "none", cursor: "pointer", fontSize: 13, fontWeight: 700, color: MUTED, textDecoration: "underline", textUnderlineOffset: 3, fontFamily: SANS }}>{votes} hodnocení</button>
            </span>

            {product.subtitle && <p style={{ margin: "12px 0 0", fontSize: 15, fontWeight: 500, lineHeight: 1.6, color: MUTED }}>{product.subtitle}</p>}

            {/* dostupnost box */}
            <div className="es12d-availbox">
              <span style={{ display: "inline-flex", alignItems: "center", gap: 9, fontSize: 14, fontWeight: 800, color: selectedInStock ? GREEN : SALE }}>
                <span aria-hidden style={{ width: 10, height: 10, borderRadius: 999, background: selectedInStock ? GREEN : SALE }} />
                {selectedInStock ? <>Skladem {stockQty > 20 ? ">20" : stockQty} ks · Odesíláme {shipDate()}</> : "Vyprodáno"}
              </span>
              <span style={{ fontSize: 12.5, fontWeight: 700, color: MUTED }}>Osobní odběr na 70+ prodejnách zdarma</span>
            </div>

            {/* varianty */}
            {variants.length > 1 && (
              <>
                <p style={{ margin: "16px 0 0", fontFamily: DISPLAY, fontSize: 14.5, fontWeight: 800, color: NAVY }}>{optionName}:</p>
                <div className="es12d-variants">
                  {variants.map(v => (
                    <button key={v.id} type="button" disabled={!inStock(v)} className={`es12d-var${v.id === variantId ? " on" : ""}`} onClick={() => setVariantId(v.id)}>
                      {v.title ?? "Standard"} · {czk(v.price_cents, currency)}
                    </button>
                  ))}
                </div>
              </>
            )}

            {/* cena */}
            <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginTop: 18 }}>
              <span style={{ fontFamily: DISPLAY, fontSize: 38, fontWeight: 800, color: onSale ? SALE : MANGO_DEEP, lineHeight: 1 }}>{czk(price, currency)}</span>
              {onSale && <span style={{ fontSize: 17, fontWeight: 600, color: MUTED, textDecoration: "line-through" }}>{czk(compare!, currency)}</span>}
            </div>

            {/* qty + CTA */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 18 }}>
              <span className="es12d-qty">
                <button type="button" aria-label="Méně" onClick={() => setQty(v => Math.max(1, v - 1))}>−</button>
                <span>{qty}</span>
                <button type="button" aria-label="Více" onClick={() => setQty(v => Math.min(99, v + 1))}>+</button>
              </span>
              <button type="button" className="es12d-cta" disabled={!selectedInStock || busy} onClick={addToCart}>
                <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="20" r="1.4"/><circle cx="18" cy="20" r="1.4"/><path d="M2.5 3h2.2l2.2 12.2a1.6 1.6 0 0 0 1.6 1.3h8.9a1.6 1.6 0 0 0 1.6-1.3L21 7H6"/></svg>
                {busy ? "Přidávám…" : "Vložit do košíku"}
              </button>
            </div>

            {/* doprava zdarma progress */}
            <div style={{ marginTop: 18, padding: "14px 16px", background: "#fff", border: `1.5px solid ${BORDER}`, borderRadius: 14 }}>
              <p style={{ margin: "0 0 8px", fontSize: 13, fontWeight: 700, color: remaining === 0 ? GREEN : NAVY }}>
                {remaining === 0 ? "Máte dopravu ZDARMA 🎉" : <>Objednejte ještě za <b style={{ color: MANGO_DEEP }}>{czk(remaining, currency)}</b> a budete mít dopravu ZDARMA.</>}
              </p>
              <div className="es12d-bar"><span style={{ width: `${shipPctBar}%`, background: remaining === 0 ? GREEN : MANGO }} /></div>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 5, fontSize: 11, fontWeight: 700, color: MUTED }}>
                <span>0 Kč</span><span>{czk(FREE_SHIP, currency)}</span>
              </div>
            </div>

            <p style={{ margin: "14px 0 0", fontSize: 12.5, fontWeight: 600, color: MUTED }}>
              Kód produktu: {100000 + product.id * 7} {product.brand && <>· Značka: <b style={{ color: NAVY }}>{product.brand}</b></>}
            </p>
          </div>
        </div>

        {/* Doporučujeme ještě přikoupit */}
        {recoA.length > 0 && (
          <section style={{ marginTop: 44 }}>
            <div className="es12d-h2">
              <svg aria-hidden width="26" height="26" viewBox="0 0 24 24" fill={MANGO} style={{ transform: "rotate(-10deg)", marginBottom: 2 }}><circle cx="6.2" cy="9.5" r="2.05"/><circle cx="10.4" cy="6.4" r="2.15"/><circle cx="14.9" cy="6.6" r="2.15"/><circle cx="18.6" cy="10.1" r="2"/><path d="M12.4 11.4c2.8 0 4.9 1.7 4.9 4 0 2.5-2.2 4.1-5.3 4.1-3 0-5.2-1.6-5.2-4 0-2.4 2.5-4.1 5.6-4.1Z"/></svg>
              <h2>Doporučujeme ještě přikoupit</h2>
            </div>
            <div className="es12d-recos">
              {recoA.map(r => <Es12RecoCard key={r.slug} r={r} basePath={basePath} currency={currency} tenantSlug={tenantSlug} />)}
            </div>
          </section>
        )}

        {/* taby */}
        <div className="es12d-tabs" role="tablist">
          <button type="button" role="tab" aria-selected={tab === "popis"} className={`es12d-tab${tab === "popis" ? " on" : ""}`} onClick={() => setTab("popis")}>Popis a parametry produktu</button>
          <button type="button" role="tab" aria-selected={tab === "recenze"} className={`es12d-tab${tab === "recenze" ? " on" : ""}`} onClick={() => setTab("recenze")}>Recenze zákazníků ({votes})</button>
        </div>

        {tab === "popis" ? (
          <div style={{ display: "grid", gridTemplateColumns: "1.4fr 0.6fr", gap: 30, padding: "26px 0 10px" }}>
            <div>
              <h3 style={{ margin: 0, fontFamily: DISPLAY, fontSize: 19, fontWeight: 800, color: NAVY }}>Detailní popis produktu</h3>
              <p style={{ margin: "12px 0 0", fontSize: 14.5, fontWeight: 500, lineHeight: 1.75, color: MUTED, whiteSpace: "pre-line" }}>{product.description ?? product.subtitle ?? ""}</p>
            </div>
            <div style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 16, padding: 20, alignSelf: "start" }}>
              <h4 style={{ margin: "0 0 10px", fontFamily: DISPLAY, fontSize: 16, fontWeight: 800, color: NAVY }}>Doplňkové parametry</h4>
              {[["Kategorie", crumbs[crumbs.length - 1]?.name ?? "—"], ["Značka", product.brand ?? "—"], ["Kód produktu", String(100000 + product.id * 7)], [optionName, variants.map(v => v.title).filter(Boolean).join(", ") || "Standard"]].map(([k, v]) => (
                <div key={k} style={{ display: "flex", justifyContent: "space-between", gap: 12, padding: "7px 0", borderBottom: `1px solid ${BORDER}`, fontSize: 13 }}>
                  <span style={{ fontWeight: 600, color: MUTED }}>{k}</span>
                  <span style={{ fontWeight: 800, color: NAVY, textAlign: "right" }}>{v}</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div style={{ padding: "26px 0 10px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "260px 1fr", gap: 30, alignItems: "start" }}>
              <div style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 16, padding: 22, textAlign: "center" }}>
                <p style={{ margin: 0, fontSize: 12.5, fontWeight: 700, color: MUTED }}>Celkové hodnocení</p>
                <p style={{ margin: "4px 0 0", fontFamily: DISPLAY, fontSize: 44, fontWeight: 800, color: GREEN, lineHeight: 1 }}>{ratingPct}%</p>
                <p style={{ margin: "4px 0 12px", fontSize: 12, fontWeight: 600, color: MUTED }}>Hodnotilo {votes} zákazníků</p>
                {[5, 4, 3, 2, 1].map(s => (
                  <div key={s} style={{ display: "flex", alignItems: "center", gap: 8, padding: "3px 0" }}>
                    <span style={{ fontSize: 11.5, fontWeight: 800, color: NAVY, width: 20 }}>{s}×</span>
                    <div className="es12d-bar" style={{ flex: 1, height: 6 }}><span style={{ width: s === 5 ? "82%" : s === 4 ? "14%" : "2%", background: MANGO }} /></div>
                  </div>
                ))}
              </div>
              <div>
                {reviews.map((r, i) => (
                  <div key={i} style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 16, padding: "16px 20px", marginBottom: 12 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                      <span style={{ fontFamily: DISPLAY, fontSize: 14.5, fontWeight: 800, color: NAVY }}>{r.name}</span>
                      <span style={{ display: "inline-flex", gap: 1 }}>
                        {[1, 2, 3, 4, 5].map(st => (
                          <svg key={st} width="12" height="12" viewBox="0 0 24 24" fill={st <= r.stars ? MANGO : "#e8e0d4"}><path d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4l-5.9 3.1 1.2-6.5L2.5 9.4l6.6-.9z"/></svg>
                        ))}
                      </span>
                      <span style={{ fontSize: 12, fontWeight: 600, color: MUTED }}>{r.date}</span>
                    </div>
                    <p style={{ margin: "8px 0 0", fontSize: 14, fontWeight: 500, lineHeight: 1.6, color: MUTED }}>{r.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* S tímto produktem nejčastěji nakupují */}
        {recoB.length > 0 && (
          <section style={{ margin: "34px 0 0", paddingBottom: 44 }}>
            <div className="es12d-h2">
              <svg aria-hidden width="26" height="26" viewBox="0 0 24 24" fill={MANGO} style={{ transform: "rotate(10deg)", marginBottom: 2 }}><circle cx="6.2" cy="9.5" r="2.05"/><circle cx="10.4" cy="6.4" r="2.15"/><circle cx="14.9" cy="6.6" r="2.15"/><circle cx="18.6" cy="10.1" r="2"/><path d="M12.4 11.4c2.8 0 4.9 1.7 4.9 4 0 2.5-2.2 4.1-5.3 4.1-3 0-5.2-1.6-5.2-4 0-2.4 2.5-4.1 5.6-4.1Z"/></svg>
              <h2>S tímto produktem zákazníci nejčastěji nakupují</h2>
            </div>
            <div className="es12d-recos">
              {recoB.map(r => <Es12RecoCard key={`b-${r.slug}`} r={r} basePath={basePath} currency={currency} tenantSlug={tenantSlug} />)}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
