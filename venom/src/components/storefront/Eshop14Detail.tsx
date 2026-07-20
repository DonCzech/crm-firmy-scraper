"use client";

/**
 * eshop-14 "Zahradia" — detail produktu (smaragdová identita, Poppins).
 *
 * Struktura dle mountfield detail reference (prace/eshop/mountfield/detail-produktu.pdf),
 * vizuál vlastní: breadcrumb → galerie s thumby vlevo | pravý buy box (titulek,
 * hvězdičky, „Loňská cena“ přeškrtnutá + velká smaragdová cena, výběr provedení,
 * množství, zelené PŘIDAT DO KOŠÍKU, řádky dostupnosti e-shop + prodejny +
 * doprava, benefity) → taby Popis / Parametry / Doprava a platba → Podobné
 * produkty.
 */

import Link from "next/link";
import React, { useMemo, useState } from "react";

export type Es14Variant = {
  id: number;
  title: string | null;
  price_cents: number;
  compare_at_price_cents: number | null;
  stock_qty: number;
  track_stock: boolean;
  stock_policy: string;
  is_default: boolean;
};

export type Es14Related = { slug: string; title: string; brand: string | null; price_cents: number; image_url: string | null };

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
  variants: Es14Variant[];
  optionName: string;
  related: Es14Related[];
}

const SANS = "'Poppins','Segoe UI',Arial,sans-serif";
const EMERALD = "#1f7a4e";
const EMERALD_DK = "#175e3c";
const INK = "#30363b";
const MUTED = "#7a8187";
const LINE = "#e2e5e7";
const GREY = "#f4f5f6";
const TERRA = "#d96f32";
const STAR = "#f2a90a";
const STOCK = "#259455";

function czk(cents: number, currency = "CZK"): string {
  return new Intl.NumberFormat("cs-CZ", { style: "currency", currency, maximumFractionDigits: 0 }).format(cents / 100);
}

export function Eshop14Detail({ tenantSlug, basePath, currency, crumbs, product, variants, optionName, related }: Props) {
  const inStock = (v: Es14Variant) => !v.track_stock || v.stock_qty > 0 || v.stock_policy === "continue";
  const firstAvailable = useMemo(() => variants.find((v) => v.is_default && inStock(v)) ?? variants.find(inStock) ?? variants[0], [variants]);
  const [variantId, setVariantId] = useState<number | null>(variants.length > 1 ? null : firstAvailable?.id ?? null);
  const [qty, setQty] = useState(1);
  const [busy, setBusy] = useState(false);
  const [needVariant, setNeedVariant] = useState(false);
  const [tab, setTab] = useState(0);
  const [mainImg, setMainImg] = useState(0);

  const selected = variants.find((v) => v.id === variantId) ?? null;
  const shown = selected ?? firstAvailable;
  const onSale = shown?.compare_at_price_cents != null && shown.compare_at_price_cents > shown.price_cents;
  const anyStock = variants.some(inStock);
  const hasVariants = variants.length > 1;

  const seed = product.title.length * 7;
  const rating = (42 + (seed % 9)) / 10;
  const ratingCount = 2 + (seed % 31);
  const fullStars = Math.round(rating);
  const stores = 4 + (seed % 51);
  const freeShip = (shown?.price_cents ?? 0) >= 299000;

  const addToCart = () => {
    if (hasVariants && !variantId) { setNeedVariant(true); return; }
    const v = selected ?? firstAvailable;
    if (!v || !inStock(v)) return;
    setBusy(true);
    fetch(`/api/demo/${tenantSlug}/shop/cart/items`, {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ variant_id: v.id, qty }),
    })
      .then(() => window.dispatchEvent(new Event("webero-cart-item-added")))
      .finally(() => setBusy(false));
  };

  const tabs = [
    { label: "Popis produktu", body: product.description ?? "Podrobný popis připravujeme." },
    { label: "Parametry", body: "" },
    { label: "Doprava a platba", body: "Doprava zdarma při nákupu nad 2 990 Kč. Osobní odběr zdarma na 54 prodejnách po celé ČR — zboží skladem připravíme zpravidla do druhého dne. Platba kartou, převodem nebo na splátky." },
  ];

  return (
    <div style={{ fontFamily: SANS, color: INK, maxWidth: 1420, margin: "0 auto", padding: "0 28px 60px" }}>
      <style>{`
        .es14d-crumbs { display: flex; align-items: center; flex-wrap: wrap; gap: 7px; padding: 16px 0 18px; font-size: 12.5px; color: ${MUTED}; }
        .es14d-crumbs a { color: ${MUTED}; text-decoration: none; }
        .es14d-crumbs a:hover { color: ${EMERALD}; text-decoration: underline; }

        .es14d-layout { display: grid; grid-template-columns: minmax(0, 1.15fr) minmax(360px, 0.85fr); gap: clamp(26px, 4vw, 60px); align-items: start; }
        @media (max-width: 960px) { .es14d-layout { grid-template-columns: 1fr; } }

        .es14d-main-img { aspect-ratio: 1/1; border: 1px solid ${LINE}; border-radius: 6px; overflow: hidden; background: ${GREY}; position: relative; }
        .es14d-main-img img { width: 100%; height: 100%; object-fit: cover; display: block; }
        .es14d-thumbs { display: flex; gap: 10px; margin-top: 12px; flex-wrap: wrap; }
        .es14d-thumb { width: 76px; height: 76px; border: 1.5px solid ${LINE}; border-radius: 4px; overflow: hidden; cursor: pointer; padding: 0; background: ${GREY}; transition: border-color 0.14s; }
        .es14d-thumb img { width: 100%; height: 100%; object-fit: cover; display: block; }
        .es14d-thumb.on, .es14d-thumb:hover { border-color: ${EMERALD}; }

        .es14d-title { font-size: clamp(21px, 2.4vw, 28px); font-weight: 700; line-height: 1.22; text-transform: uppercase; letter-spacing: 0.01em; margin: 0 0 8px; }
        .es14d-sub { font-size: 14px; color: ${MUTED}; margin: 0 0 12px; line-height: 1.55; }

        .es14d-pricebox { border: 1px solid ${LINE}; border-radius: 6px; padding: 18px 20px; margin-top: 16px; }
        .es14d-lastyear { font-size: 13px; color: ${MUTED}; }
        .es14d-price { font-size: 32px; font-weight: 700; color: ${EMERALD_DK}; line-height: 1.1; }
        .es14d-save { display: inline-block; background: ${TERRA}; color: #fff; font-size: 12px; font-weight: 700; padding: 4px 9px; border-radius: 3px; }

        .es14d-variants { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 8px; }
        .es14d-var { border: 1.5px solid ${LINE}; background: #fff; border-radius: 4px; padding: 9px 14px; font-family: ${SANS}; font-size: 13.5px; font-weight: 600; color: ${INK}; cursor: pointer; transition: border-color 0.13s, background 0.13s, color 0.13s; }
        .es14d-var:hover { border-color: ${EMERALD}; }
        .es14d-var.on { border-color: ${EMERALD}; background: ${EMERALD}; color: #fff; }
        .es14d-var.dis { opacity: 0.4; text-decoration: line-through; cursor: not-allowed; }

        .es14d-qty { display: inline-flex; align-items: center; border: 1.5px solid ${LINE}; border-radius: 4px; height: 50px; }
        .es14d-qty button { width: 42px; height: 100%; border: none; background: none; cursor: pointer; font-size: 19px; color: ${INK}; }
        .es14d-qty button:hover { color: ${EMERALD}; }
        .es14d-qty span { min-width: 34px; text-align: center; font-weight: 700; font-size: 15px; }

        .es14d-add { flex: 1; display: inline-flex; align-items: center; justify-content: center; gap: 10px; height: 50px; border: none; border-radius: 4px;
          background: ${EMERALD}; color: #fff; font-family: ${SANS}; font-size: 14.5px; font-weight: 700; letter-spacing: 0.05em; cursor: pointer; transition: background 0.14s; }
        .es14d-add:hover { background: ${EMERALD_DK}; }
        .es14d-add[disabled] { background: #b9bec2; cursor: not-allowed; }

        .es14d-avail { margin-top: 16px; display: flex; flex-direction: column; gap: 7px; font-size: 13.5px; }
        .es14d-avail-row { display: flex; align-items: center; gap: 9px; }

        .es14d-benefits { margin-top: 18px; border-top: 1px solid ${LINE}; padding-top: 14px; display: flex; flex-direction: column; gap: 8px; font-size: 13px; color: ${INK}; }
        .es14d-benefits svg { color: ${EMERALD}; flex-shrink: 0; }
        .es14d-benefit { display: flex; align-items: center; gap: 10px; }

        .es14d-tabs { display: flex; gap: 4px; border-bottom: 2px solid ${LINE}; margin: 44px 0 0; flex-wrap: wrap; }
        .es14d-tab { border: none; background: none; cursor: pointer; font-family: ${SANS}; font-size: 14px; font-weight: 600; color: ${MUTED}; padding: 12px 18px; margin-bottom: -2px; border-bottom: 2px solid transparent; transition: color 0.13s, border-color 0.13s; }
        .es14d-tab:hover { color: ${INK}; }
        .es14d-tab.on { color: ${EMERALD_DK}; border-bottom-color: ${EMERALD}; }
        .es14d-tabbody { padding: 22px 2px; font-size: 14px; line-height: 1.7; color: ${INK}; max-width: 880px; white-space: pre-line; }

        .es14d-params { width: 100%; max-width: 620px; border-collapse: collapse; font-size: 13.5px; }
        .es14d-params td { padding: 9px 12px; border-bottom: 1px solid ${LINE}; }
        .es14d-params td:first-child { color: ${MUTED}; width: 45%; }
        .es14d-params tr:nth-child(odd) { background: ${GREY}; }

        .es14d-rel-h { font-size: 19px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.02em; margin: 46px 0 18px; }
        .es14d-rel { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
        @media (max-width: 1100px) { .es14d-rel { grid-template-columns: repeat(2, 1fr); } }
        .es14d-rel-card { border: 1px solid ${LINE}; border-radius: 6px; background: #fff; padding: 12px 14px 14px; text-decoration: none; color: ${INK}; transition: box-shadow 0.15s, transform 0.15s; display: flex; flex-direction: column; }
        .es14d-rel-card:hover { box-shadow: 0 14px 30px rgba(48,54,59,0.12); transform: translateY(-3px); }
        .es14d-rel-media { aspect-ratio: 1/1; border-radius: 4px; overflow: hidden; background: ${GREY}; }
        .es14d-rel-media img { width: 100%; height: 100%; object-fit: cover; display: block; }
        .es14d-rel-title { margin-top: 10px; font-size: 13px; font-weight: 600; line-height: 1.35; text-transform: uppercase; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; min-height: 2.7em; }
        .es14d-rel-price { margin-top: 7px; font-size: 15.5px; font-weight: 700; color: ${EMERALD_DK}; }
      `}</style>

      {/* Breadcrumb */}
      <nav className="es14d-crumbs" aria-label="Drobečková navigace">
        <Link href={`/demo/${tenantSlug}`}>Domů</Link>
        <span aria-hidden>›</span>
        <Link href={basePath}>E-shop</Link>
        {crumbs.map((c) => (
          <React.Fragment key={c.slug}>
            <span aria-hidden>›</span>
            <Link href={`${basePath}?kategorie=${c.slug}`}>{c.name}</Link>
          </React.Fragment>
        ))}
        <span aria-hidden>›</span>
        <span style={{ color: INK, fontWeight: 600 }}>{product.title}</span>
      </nav>

      <div className="es14d-layout">
        {/* Galerie */}
        <div>
          <div className="es14d-main-img">
            {product.images[mainImg] ? (
              <img src={product.images[mainImg].url} alt={product.images[mainImg].alt ?? product.title} />
            ) : null}
            {onSale && <span style={{ position: "absolute", top: 12, left: 12, background: TERRA, color: "#fff", fontSize: 11.5, fontWeight: 700, letterSpacing: "0.06em", padding: "6px 10px", borderRadius: 3 }}>AKCE</span>}
            {product.isNew && !onSale && <span style={{ position: "absolute", top: 12, left: 12, background: EMERALD, color: "#fff", fontSize: 11.5, fontWeight: 700, letterSpacing: "0.06em", padding: "6px 10px", borderRadius: 3 }}>NOVINKA</span>}
          </div>
          {product.images.length > 1 && (
            <div className="es14d-thumbs">
              {product.images.map((im, i) => (
                <button key={i} className={`es14d-thumb${mainImg === i ? " on" : ""}`} onClick={() => setMainImg(i)} aria-label={`Náhled ${i + 1}`}>
                  <img src={im.url} alt={im.alt ?? ""} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Buy box */}
        <div>
          {product.brand && <div style={{ fontSize: 12.5, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: MUTED, marginBottom: 6 }}>{product.brand}</div>}
          <h1 className="es14d-title">{product.title}</h1>
          {product.subtitle && <p className="es14d-sub">{product.subtitle}</p>}

          <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
            <span style={{ display: "inline-flex", gap: 2 }}>
              {[1, 2, 3, 4, 5].map((st) => (
                <svg key={st} width="15" height="15" viewBox="0 0 24 24" fill={st <= fullStars ? STAR : "#d9dcde"}><path d="M12 2l2.9 6.3 6.9.8-5.1 4.7 1.4 6.8L12 17.2 5.9 20.6l1.4-6.8L2.2 9.1l6.9-.8L12 2z" /></svg>
              ))}
            </span>
            <span style={{ fontSize: 13, fontWeight: 700 }}>{rating.toFixed(1)}</span>
            <span style={{ fontSize: 13, color: MUTED }}>({ratingCount} hodnocení)</span>
          </span>

          <div className="es14d-pricebox">
            {onSale && shown?.compare_at_price_cents && (
              <div className="es14d-lastyear">Loňská cena: <s>{czk(shown.compare_at_price_cents, currency)}</s></div>
            )}
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 2, flexWrap: "wrap" }}>
              <span className="es14d-price">{shown ? czk(shown.price_cents, currency) : "—"}</span>
              {onSale && shown?.compare_at_price_cents && (
                <span className="es14d-save">Ušetříte {czk(shown.compare_at_price_cents - shown.price_cents, currency)}</span>
              )}
            </div>

            {hasVariants && (
              <div style={{ marginTop: 16 }}>
                <div style={{ fontSize: 12.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: needVariant && !variantId ? TERRA : INK }}>
                  {optionName}{needVariant && !variantId ? " — vyberte prosím" : ""}
                </div>
                <div className="es14d-variants">
                  {variants.map((v) => (
                    <button
                      key={v.id}
                      className={`es14d-var${variantId === v.id ? " on" : ""}${!inStock(v) ? " dis" : ""}`}
                      disabled={!inStock(v)}
                      onClick={() => { setVariantId(v.id); setNeedVariant(false); }}
                    >{v.title ?? "Standard"}</button>
                  ))}
                </div>
              </div>
            )}

            <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
              <span className="es14d-qty">
                <button onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="Snížit množství">−</button>
                <span>{qty}</span>
                <button onClick={() => setQty((q) => Math.min(99, q + 1))} aria-label="Zvýšit množství">+</button>
              </span>
              <button className="es14d-add" disabled={busy || !anyStock} onClick={addToCart}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="20" r="1.4"/><circle cx="17.5" cy="20" r="1.4"/><path d="M2.5 3.5h2.6l2.5 12h10.2l2.2-8.5H6.2"/></svg>
                {anyStock ? "PŘIDAT DO KOŠÍKU" : "VYPRODÁNO"}
              </button>
            </div>

            <div className="es14d-avail">
              <span className="es14d-avail-row" style={{ color: anyStock ? STOCK : MUTED, fontWeight: 700 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                {anyStock ? "Skladem > 5 kusů" : "Není skladem v e-shopu"}
              </span>
              <span className="es14d-avail-row" style={{ color: INK }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={EMERALD} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M4 10v9h16v-9"/><path d="M3.5 6 5 3.5h14L20.5 6c.4.8-.1 2.5-1.7 2.5-1.3 0-1.9-.8-2-1.5-.1.7-.8 1.5-2.1 1.5s-2-.8-2.1-1.5c-.1.7-.8 1.5-2.1 1.5s-2-.8-2.1-1.5c-.1.7-.7 1.5-2 1.5-1.6 0-2.1-1.7-1.9-2.5Z"/></svg>
                Zítra od 9:00 <a href={`/demo/${tenantSlug}/kontakt`} style={{ color: INK }}>v {stores} prodejnách</a>
              </span>
              {freeShip && (
                <span className="es14d-avail-row" style={{ color: EMERALD_DK, fontWeight: 600 }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M5 17h-2v-11a1 1 0 0 1 1 -1h9v12m-4 0h6m4 0h2v-6h-8m0 -5h5l3 5"/><circle cx="7.5" cy="17.5" r="2"/><circle cx="17.5" cy="17.5" r="2"/></svg>
                  Doprava zdarma
                </span>
              )}
            </div>

            <div className="es14d-benefits">
              <span className="es14d-benefit">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a4.2 4.2 0 0 0-5.6 5.2L3.5 17.1a2 2 0 1 0 2.8 2.8l5.6-5.6a4.2 4.2 0 0 0 5.2-5.6l-2.6 2.6-2.5-.7-.7-2.5Z"/></svg>
                Vlastní servis a náhradní díly
              </span>
              <span className="es14d-benefit">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="9" r="6"/><path d="m8.5 14-1.5 7 5-3 5 3-1.5-7"/></svg>
                Věrnostní program — body za každý nákup
              </span>
              <span className="es14d-benefit">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M9 14 4 9l5-5"/><path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11"/></svg>
                Vrácení zboží do 30 dní
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Taby */}
      <div className="es14d-tabs">
        {tabs.map((t, i) => (
          <button key={i} className={`es14d-tab${tab === i ? " on" : ""}`} onClick={() => setTab(i)}>{t.label}</button>
        ))}
      </div>
      <div className="es14d-tabbody">
        {tab === 1 ? (
          <table className="es14d-params">
            <tbody>
              {product.brand && <tr><td>Značka</td><td>{product.brand}</td></tr>}
              {hasVariants && <tr><td>{optionName}</td><td>{variants.map((v) => v.title ?? "Standard").join(", ")}</td></tr>}
              <tr><td>Záruka</td><td>3 roky (po registraci v klubu 5 let)</td></tr>
              <tr><td>Servis</td><td>Autorizovaný servis Zahradia, náhradní díly skladem</td></tr>
              <tr><td>Dostupnost</td><td>{anyStock ? "Skladem v e-shopu i na prodejnách" : "Na objednávku"}</td></tr>
            </tbody>
          </table>
        ) : (
          tabs[tab].body
        )}
      </div>

      {/* Podobné produkty */}
      {related.length > 0 && (
        <>
          <h2 className="es14d-rel-h">Mohlo by vás zajímat</h2>
          <div className="es14d-rel">
            {related.slice(0, 4).map((r) => (
              <Link key={r.slug} href={`${basePath}/${r.slug}`} className="es14d-rel-card">
                <span className="es14d-rel-media">{r.image_url && <img src={r.image_url} alt={r.title} loading="lazy" />}</span>
                <span className="es14d-rel-title">{r.title}</span>
                <span className="es14d-rel-price">{czk(r.price_cents, currency)}</span>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
