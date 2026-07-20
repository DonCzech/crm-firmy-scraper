"use client";

/**
 * Eshop16Detail — Spížka (kosik.cz DNA) detail produktu (kosik ho má jako
 * modal, u nás plná stránka). Breadcrumb → 2-col: foto karta s chipy | titulek
 * + balení pill + cenový blok (superscript, malinový box při slevě, jednotková
 * cena, multikup info) + stepper s fíkovou pill „Do košíku" + demo info řádky
 * + benefity → Popis produktu + TRVANLIVOST box + skladovací podmínky +
 * disclaimer + kategorie odkazy → „Mohlo by se hodit" karusel.
 */

import { useState } from "react";

const HEAD = "'Bricolage Grotesque', 'Segoe UI', sans-serif";
const SANS = "'Figtree', 'Segoe UI', system-ui, sans-serif";
const FIG = "#56203d";
const FIG_DK = "#3f152c";
const RASP = "#d23c55";
const GREEN = "#3e9b4f";
const INK = "#241a20";
const MUTED = "#7a6c74";
const CREAM = "#fbf7f1";
const SURFACE = "#f6efe4";
const LINE = "#e9dfe0";

export interface Es16DetailMiniCard {
  slug: string;
  title: string;
  subtitle: string | null;
  price_cents: number;
  compare_cents: number | null;
  image_url: string | null;
  default_variant_id: number | null;
  price_match: boolean;
  is_new: boolean;
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
    is_new: boolean;
    price_match: boolean;
    multikup: { qty: number; price: number } | null;
  };
  variant: {
    id: number;
    price_cents: number;
    compare_at_price_cents: number | null;
    stock_qty: number;
  } | null;
  categoryLinks: { slug: string; name: string }[];
  related: Es16DetailMiniCard[];
}

export function Eshop16Detail({ tenantSlug, basePath, currency, crumbs, product, variant, categoryLinks, related }: Props) {
  const [qty, setQty] = useState(1);
  const [adding, setAdding] = useState(false);
  const [addedMain, setAddedMain] = useState(false);
  const [addingMini, setAddingMini] = useState<string | null>(null);
  const [addedMini, setAddedMini] = useState<string | null>(null);

  const fmt = (cents: number) =>
    new Intl.NumberFormat("cs-CZ", { style: "currency", currency, maximumFractionDigits: cents % 100 === 0 ? 0 : 2 }).format(cents / 100);
  const splitPrice = (cents: number) => ({
    kc: new Intl.NumberFormat("cs-CZ").format(Math.floor(cents / 100)),
    hal: String(cents % 100).padStart(2, "0"),
  });

  const sale = variant?.compare_at_price_cents != null && variant.compare_at_price_cents > variant.price_cents;
  const pct = sale && variant ? Math.round((1 - variant.price_cents / (variant.compare_at_price_cents as number)) * 100) : 0;
  const inStock = (variant?.stock_qty ?? 0) > 0;
  const [weight, unitPrice] = (() => {
    const sub = product.subtitle ?? "";
    const i = sub.indexOf("•");
    return i === -1 ? [sub, ""] : [sub.slice(0, i).trim(), sub.slice(i + 1).trim()];
  })();

  const addToCart = () => {
    if (!variant || adding) return;
    setAdding(true);
    fetch(`/api/demo/${tenantSlug}/shop/cart/items`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ variant_id: variant.id, qty }),
    })
      .then(() => {
        window.dispatchEvent(new Event("webero-cart-item-added"));
        setAddedMain(true);
        setTimeout(() => setAddedMain(false), 1800);
      })
      .finally(() => setAdding(false));
  };

  const quickAddMini = (e: React.MouseEvent, it: Es16DetailMiniCard) => {
    e.preventDefault();
    e.stopPropagation();
    if (!it.default_variant_id || addingMini) return;
    setAddingMini(it.slug);
    fetch(`/api/demo/${tenantSlug}/shop/cart/items`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ variant_id: it.default_variant_id, qty: 1 }),
    })
      .then(() => {
        window.dispatchEvent(new Event("webero-cart-item-added"));
        setAddedMini(it.slug);
        setTimeout(() => setAddedMini((cur) => (cur === it.slug ? null : cur)), 1600);
      })
      .finally(() => setAddingMini(null));
  };

  const { kc, hal } = splitPrice(variant?.price_cents ?? 0);
  const mkSplit = product.multikup ? splitPrice(product.multikup.price) : null;

  return (
    <div style={{ fontFamily: SANS, background: CREAM }}>
      <style>{`
        .es16d-wrap { max-width: 1180px; margin: 0 auto; padding: 0 28px 50px; }
        .es16d-crumb { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; padding: 16px 0 18px; font-size: 13px; color: ${MUTED}; }
        .es16d-crumb a { color: ${MUTED}; text-decoration: none; }
        .es16d-crumb a:hover { color: ${FIG}; text-decoration: underline; text-underline-offset: 3px; }

        .es16d-top { display: grid; grid-template-columns: minmax(0, 460fr) minmax(0, 560fr); gap: clamp(24px, 3.5vw, 52px); align-items: start; }
        @media (max-width: 860px) { .es16d-top { grid-template-columns: 1fr; } }

        .es16d-photo { position: relative; background: #fff; border: 1px solid ${LINE}; border-radius: 18px; overflow: hidden; aspect-ratio: 1/1; }
        .es16d-photo img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
        .es16d-chip { position: absolute; top: 12px; left: 12px; font-size: 11.5px; font-weight: 700; padding: 5px 11px; border-radius: 999px; line-height: 1.2; }
        .es16d-chip.new { background: rgba(242,165,65,0.95); color: #3f152c; }
        .es16d-chip.match { background: #f9e3b0; color: #7a5a12; }
        .es16d-chip.mk { background: ${FIG}; color: #fff; letter-spacing: 0.06em; }

        .es16d-title { margin: 0; font-family: ${HEAD}; font-weight: 800; font-size: clamp(23px, 2.4vw, 31px); letter-spacing: -0.02em; color: ${INK}; line-height: 1.15; }
        .es16d-pack { display: inline-flex; margin-top: 12px; background: #fff; border: 1.5px solid ${FIG}; color: ${FIG}; font-size: 13px; font-weight: 700; padding: 7px 15px; border-radius: 999px; }

        .es16d-priceline { display: flex; align-items: center; gap: 12px; margin-top: 20px; flex-wrap: wrap; }
        .es16d-pricebox { background: ${RASP}; color: #fff; border-radius: 10px; padding: 6px 12px 7px; font-family: ${HEAD}; font-weight: 800; font-size: 30px; line-height: 1; }
        .es16d-pricebox sup { font-size: 16px; font-weight: 800; margin-left: 2px; }
        .es16d-price { font-family: ${HEAD}; font-weight: 800; font-size: 32px; color: ${INK}; letter-spacing: -0.01em; }
        .es16d-price sup { font-size: 17px; font-weight: 800; margin-left: 2px; }
        .es16d-old { font-size: 15px; color: ${MUTED}; text-decoration: line-through; }
        .es16d-salenote { font-size: 13.5px; font-weight: 700; color: ${RASP}; }
        .es16d-unit { margin-top: 5px; font-size: 13px; color: ${MUTED}; }

        .es16d-mk { display: flex; align-items: center; gap: 10px; margin-top: 14px; background: ${SURFACE}; border-radius: 12px; padding: 11px 14px; font-size: 13.5px; color: ${INK}; }
        .es16d-mk b { font-family: ${HEAD}; color: ${FIG}; }
        .es16d-mk-chip { background: ${FIG}; color: #fff; font-size: 10.5px; font-weight: 800; letter-spacing: 0.06em; padding: 4px 9px; border-radius: 999px; line-height: 1.2; flex: 0 0 auto; }

        .es16d-buy { display: flex; align-items: center; gap: 12px; margin-top: 20px; flex-wrap: wrap; }
        .es16d-step { display: inline-flex; align-items: center; border: 1.5px solid ${LINE}; border-radius: 999px; background: #fff; overflow: hidden; }
        .es16d-step button { width: 42px; height: 46px; border: none; background: transparent; cursor: pointer; color: ${FIG}; font-size: 19px; font-weight: 700;
          display: inline-flex; align-items: center; justify-content: center; transition: background 0.13s; font-family: ${SANS}; }
        .es16d-step button:hover { background: ${SURFACE}; }
        .es16d-step span { min-width: 40px; text-align: center; font-size: 15.5px; font-weight: 800; color: ${INK}; }
        .es16d-cta { display: inline-flex; align-items: center; gap: 10px; height: 48px; padding: 0 30px; border: none; cursor: pointer; border-radius: 999px;
          background: ${FIG}; color: #fff; font-family: ${SANS}; font-size: 15px; font-weight: 800; transition: background 0.15s, transform 0.14s; }
        .es16d-cta:hover { background: ${FIG_DK}; transform: translateY(-1px); }
        .es16d-cta[disabled] { opacity: 0.6; cursor: default; transform: none; }
        .es16d-cta.is-added { background: ${GREEN}; }
        .es16d-stock { display: inline-flex; align-items: center; gap: 7px; font-size: 13.5px; font-weight: 700; color: ${GREEN}; }
        .es16d-stock.out { color: ${RASP}; }

        .es16d-info { margin-top: 22px; border-top: 1px solid ${LINE}; }
        .es16d-info-row { display: flex; justify-content: space-between; gap: 16px; padding: 10px 0; border-bottom: 1px solid ${LINE}; font-size: 13.5px; }
        .es16d-info-row dt { color: ${MUTED}; margin: 0; }
        .es16d-info-row dd { color: ${INK}; font-weight: 600; margin: 0; text-align: right; }

        .es16d-usps { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-top: 18px; }
        @media (max-width: 560px) { .es16d-usps { grid-template-columns: 1fr; } }
        .es16d-usp { display: flex; align-items: center; gap: 9px; background: ${SURFACE}; border-radius: 12px; padding: 10px 12px; font-size: 12px; font-weight: 600; color: ${INK}; line-height: 1.35; }
        .es16d-usp svg { color: ${FIG}; flex: 0 0 auto; }

        .es16d-section { max-width: 780px; margin-top: 40px; }
        .es16d-h2 { font-family: ${HEAD}; font-weight: 800; font-size: 21px; letter-spacing: -0.015em; color: ${INK}; margin: 0 0 12px; }
        .es16d-text { font-size: 14.5px; line-height: 1.65; color: #4a3f46; margin: 0 0 12px; white-space: pre-line; }
        .es16d-box { background: ${SURFACE}; border-radius: 14px; padding: 16px 18px; margin-top: 16px; }
        .es16d-box h3 { font-family: ${HEAD}; font-weight: 800; font-size: 13px; letter-spacing: 0.08em; text-transform: uppercase; color: ${FIG}; margin: 0 0 7px; }
        .es16d-box p { font-size: 13.5px; line-height: 1.55; color: #4a3f46; margin: 0; }
        .es16d-disclaimer { margin-top: 16px; border: 1px dashed ${LINE}; border-radius: 12px; padding: 12px 15px; font-size: 12px; color: ${MUTED}; line-height: 1.5; }
        .es16d-cats { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; margin-top: 14px; }
        .es16d-cat { display: inline-flex; background: #fff; border: 1px solid ${LINE}; border-radius: 999px; padding: 7px 14px; font-size: 12.5px; font-weight: 700; color: ${FIG}; text-decoration: none; transition: border-color 0.13s, background 0.13s; }
        .es16d-cat:hover { border-color: ${FIG}; background: ${SURFACE}; }

        .es16d-rel { margin-top: 46px; }
        .es16d-rel-grid { display: grid; grid-template-columns: repeat(6, minmax(0, 1fr)); gap: 12px; }
        @media (max-width: 1100px) { .es16d-rel-grid { grid-template-columns: repeat(4, minmax(0, 1fr)); } }
        @media (max-width: 720px) { .es16d-rel-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
        .es16d-mini { text-decoration: none; display: flex; flex-direction: column; background: #fff; border: 1px solid ${LINE}; border-radius: 14px; padding: 10px 10px 13px;
          transition: transform 0.17s, box-shadow 0.17s, border-color 0.15s; }
        .es16d-mini:hover { transform: translateY(-3px); box-shadow: 0 16px 32px rgba(86,32,61,0.12); border-color: transparent; }
        .es16d-mini-media { position: relative; aspect-ratio: 1/1; border-radius: 9px; overflow: hidden; background: ${CREAM}; }
        .es16d-mini-media img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
        .es16d-mini-add { position: absolute; right: 7px; bottom: 7px; width: 34px; height: 34px; border-radius: 999px; border: none; cursor: pointer;
          background: ${FIG}; color: #fff; display: inline-flex; align-items: center; justify-content: center; transition: background 0.15s, transform 0.14s; }
        .es16d-mini-add:hover { background: ${FIG_DK}; transform: scale(1.08); }
        .es16d-mini-add.is-added { background: ${GREEN}; }
        .es16d-mini-price { margin-top: 9px; display: flex; align-items: center; gap: 6px; }
        .es16d-mini-pricebox { background: ${RASP}; color: #fff; border-radius: 6px; padding: 2px 6px 3px; font-family: ${HEAD}; font-weight: 800; font-size: 15px; line-height: 1; }
        .es16d-mini-pricebox sup { font-size: 9px; margin-left: 1px; }
        .es16d-mini-pricetxt { font-family: ${HEAD}; font-weight: 800; font-size: 15.5px; color: ${INK}; }
        .es16d-mini-pricetxt sup { font-size: 9.5px; margin-left: 1px; }
        .es16d-mini-old { font-size: 11px; color: ${MUTED}; text-decoration: line-through; }
        .es16d-mini-title { margin-top: 5px; font-size: 12.5px; font-weight: 600; color: ${INK}; line-height: 1.35; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; min-height: 2.7em; }
        .es16d-mini:hover .es16d-mini-title { color: ${FIG}; }
        .es16d-mini-sub { margin-top: 3px; font-size: 11px; color: ${MUTED}; }
      `}</style>

      <div className="es16d-wrap">
        <nav className="es16d-crumb" aria-label="Drobečková navigace">
          <a href={`/demo/${tenantSlug}`}>Domů</a>
          {crumbs.map((c) => (
            <span key={c.slug} style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 6 6 6-6 6"/></svg>
              <a href={`${basePath}?kategorie=${c.slug}`}>{c.name}</a>
            </span>
          ))}
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 6 6 6-6 6"/></svg>
          <span style={{ color: INK, fontWeight: 600 }}>{product.title}</span>
        </nav>

        <div className="es16d-top">
          <div className="es16d-photo">
            {product.image_url && <img src={product.image_url} alt={product.image_alt ?? product.title} />}
            {product.multikup
              ? <span className="es16d-chip mk">MULTIKUP</span>
              : product.price_match
                ? <span className="es16d-chip match">Srovnaná cena</span>
                : product.is_new
                  ? <span className="es16d-chip new">Novinka</span>
                  : null}
          </div>

          <div>
            <h1 className="es16d-title">{product.title}</h1>
            {weight && <span className="es16d-pack">{weight}</span>}

            <div className="es16d-priceline">
              {sale ? (
                <>
                  <span className="es16d-pricebox">{kc}<sup>{hal}</sup></span>
                  <span className="es16d-old">{fmt(variant!.compare_at_price_cents!)}</span>
                  {pct > 2 && <span className="es16d-salenote">−{pct} % do neděle</span>}
                </>
              ) : (
                <span className="es16d-price">{kc}<sup>{hal}</sup></span>
              )}
            </div>
            {unitPrice && <div className="es16d-unit">{unitPrice}</div>}

            {product.multikup && mkSplit && (
              <div className="es16d-mk">
                <span className="es16d-mk-chip">MULTIKUP</span>
                <span>Od {product.multikup.qty} ks jen <b>{fmt(product.multikup.price)}</b> za kus — nakoupíte více, zaplatíte méně.</span>
              </div>
            )}

            <div className="es16d-buy">
              <span className="es16d-step">
                <button type="button" onClick={() => setQty((n) => Math.max(1, n - 1))} aria-label="Snížit množství">−</button>
                <span>{qty}</span>
                <button type="button" onClick={() => setQty((n) => Math.min(99, n + 1))} aria-label="Zvýšit množství">+</button>
              </span>
              <button className={`es16d-cta${addedMain ? " is-added" : ""}`} disabled={adding || !variant || !inStock} onClick={addToCart}>
                {addedMain ? (
                  <>
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                    Přidáno
                  </>
                ) : (
                  <>
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="20" r="1.4"/><circle cx="17.5" cy="20" r="1.4"/><path d="M2.5 3.5h2.6l2.5 12h10.2l2.2-8.5H6.2"/></svg>
                    Do košíku
                  </>
                )}
              </button>
              <span className={`es16d-stock${inStock ? "" : " out"}`}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">{inStock ? <path d="M20 6 9 17l-5-5"/> : <path d="M18 6 6 18M6 6l12 12"/>}</svg>
                {inStock ? "Skladem, doručíme dnes" : "Momentálně vyprodáno"}
              </span>
            </div>

            <dl className="es16d-info" style={{ margin: "22px 0 0" }}>
              {product.brand && (
                <div className="es16d-info-row"><dt>Značka</dt><dd>{product.brand}</dd></div>
              )}
              <div className="es16d-info-row"><dt>Země původu</dt><dd>Česká republika (demo)</dd></div>
              <div className="es16d-info-row"><dt>Minimální trvanlivost</dt><dd>4 dny od doručení</dd></div>
              <div className="es16d-info-row"><dt>Dodavatel</dt><dd>Spížka Logistika s.r.o., Demo 12, Praha</dd></div>
            </dl>

            <div className="es16d-usps">
              <span className="es16d-usp">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>
                Doručení dnes už od 14:00
              </span>
              <span className="es16d-usp">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7h11v10H3z"/><path d="M14 10h4l3 3v4h-7"/><circle cx="7" cy="17.5" r="1.7"/><circle cx="17.5" cy="17.5" r="1.7"/></svg>
                Doprava zdarma na 30 dní
              </span>
              <span className="es16d-usp">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2.5 19.5 5v6.2c0 4.6-3.1 8.2-7.5 10.3-4.4-2.1-7.5-5.7-7.5-10.3V5L12 2.5Z"/><path d="m9 11.5 2 2 4-4"/></svg>
                Záruka spokojenosti, jinak vracíme peníze
              </span>
            </div>
          </div>
        </div>

        <div className="es16d-section">
          <h2 className="es16d-h2">Popis produktu</h2>
          {product.description
            ? <p className="es16d-text">{product.description}</p>
            : <p className="es16d-text">Vybíráme denně čerstvé zboží od prověřených dodavatelů.</p>}

          <div className="es16d-box">
            <h3>Trvanlivost</h3>
            <p>Obvyklá trvanlivost od doručení nákupu: 4 dny. Minimální trvanlivost produktu: 4 dny. Údaje jsou demonstrační.</p>
          </div>
          <div className="es16d-box">
            <h3>Skladovací podmínky</h3>
            <p>Skladujte v suchu a chladu. Mělo by být zabráněno přístupu přímého slunečního světla. Ideální teplota skladování 6–10 °C.</p>
          </div>

          <div className="es16d-disclaimer">
            Fotografie produktů jsou ilustrační. Přestože se maximálně snažíme, aby všechny informace o výrobcích byly aktuální a správné,
            může dojít k dílčím odchylkám — pro závazné údaje se prosím řiďte informacemi na obalu výrobku. Toto je demo obchod.
          </div>

          {categoryLinks.length > 0 && (
            <>
              <h2 className="es16d-h2" style={{ marginTop: 28, fontSize: 14, letterSpacing: "0.06em", textTransform: "uppercase" }}>Kategorie, ve kterých se produkt nachází</h2>
              <div className="es16d-cats">
                {categoryLinks.map((c) => (
                  <a key={c.slug} href={`${basePath}?kategorie=${c.slug}`} className="es16d-cat">{c.name}</a>
                ))}
              </div>
            </>
          )}
        </div>

        {related.length > 0 && (
          <div className="es16d-rel">
            <h2 className="es16d-h2" style={{ fontSize: "clamp(19px, 2vw, 24px)", marginBottom: 14 }}>Mohlo by se hodit</h2>
            <div className="es16d-rel-grid">
              {related.map((it) => {
                const mSale = it.compare_cents != null && it.compare_cents > it.price_cents;
                const mp = splitPrice(it.price_cents);
                return (
                  <a key={it.slug} href={`${basePath}/${it.slug}`} className="es16d-mini">
                    <span className="es16d-mini-media">
                      {it.image_url && <img src={it.image_url} alt={it.title} loading="lazy" />}
                      <button
                        className={`es16d-mini-add${addedMini === it.slug ? " is-added" : ""}`}
                        disabled={addingMini === it.slug || !it.default_variant_id}
                        onClick={(e) => quickAddMini(e, it)}
                        aria-label={`Přidat ${it.title} do košíku`}
                      >
                        {addedMini === it.slug ? (
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                        ) : (
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
                        )}
                      </button>
                    </span>
                    <span className="es16d-mini-price">
                      {mSale ? (
                        <>
                          <span className="es16d-mini-pricebox">{mp.kc}<sup>{mp.hal}</sup></span>
                          <span className="es16d-mini-old">{fmt(it.compare_cents!)}</span>
                        </>
                      ) : (
                        <span className="es16d-mini-pricetxt">{mp.kc}<sup>{mp.hal}</sup></span>
                      )}
                    </span>
                    <span className="es16d-mini-title">{it.title}</span>
                    <span className="es16d-mini-sub">{it.subtitle ?? ""}</span>
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
