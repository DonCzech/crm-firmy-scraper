"use client";

/**
 * Eshop16Cart — Spížka (kosik.cz DNA) stránka košíku.
 * Horní řádek „‹ Zpět nakupovat | Nákupní košík | Celkem pill" → 2-col:
 * vlevo Obsah košíku (řádky: × remove, thumbnail, název, stepper, cena)
 * + „Vyprázdnit košík"; vpravo sticky karta s progressem do minimálního
 * nákupu 699 Kč (meruňková → zelená), souhrn Zboží/Celkem k platbě a
 * „Pokračovat k pokladně" (disabled pod minimem, jako kosik). Dole
 * „Nezapomněli jste na něco?" upsell rail a 18+ disclaimer.
 */

import { useCallback, useEffect, useState } from "react";

const HEAD = "'Bricolage Grotesque', 'Segoe UI', sans-serif";
const SANS = "'Figtree', 'Segoe UI', system-ui, sans-serif";
const FIG = "#56203d";
const FIG_DK = "#3f152c";
const APRICOT = "#f2a541";
const RASP = "#d23c55";
const GREEN = "#3e9b4f";
const INK = "#241a20";
const MUTED = "#7a6c74";
const CREAM = "#fbf7f1";
const SURFACE = "#f6efe4";
const LINE = "#e9dfe0";

const MIN_ORDER_CENTS = 69900;

interface CartItem {
  id: number;
  qty: number;
  product_slug: string;
  product_title: string;
  variant_title: string | null;
  price_cents: number;
  line_total_cents: number;
  image_url: string | null;
}

interface Cart {
  items: CartItem[];
  item_count: number;
  subtotal_cents: number;
  currency: string;
}

export interface Es16CartUpsell {
  id: number;
  slug: string;
  title: string;
  subtitle: string | null;
  variant_id: number | null;
  price_cents: number;
  compare_cents: number | null;
  image_url: string | null;
}

interface Props {
  tenantSlug: string;
  upsellProducts: Es16CartUpsell[];
}

export function Eshop16Cart({ tenantSlug, upsellProducts }: Props) {
  const [cart, setCart] = useState<Cart | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busyItem, setBusyItem] = useState<number | null>(null);
  const [busyUpsell, setBusyUpsell] = useState<number | null>(null);
  const base = `/api/demo/${tenantSlug}/shop`;
  const storeBase = `/demo/${tenantSlug}/obchod`;

  const fmt = (cents: number, currency = "CZK") =>
    new Intl.NumberFormat("cs-CZ", { style: "currency", currency, maximumFractionDigits: cents % 100 === 0 ? 0 : 2 }).format(cents / 100);
  const splitPrice = (cents: number) => ({
    kc: new Intl.NumberFormat("cs-CZ").format(Math.floor(cents / 100)),
    hal: String(cents % 100).padStart(2, "0"),
  });

  const load = useCallback(async () => {
    try {
      const res = await fetch(`${base}/cart`);
      const data = await res.json();
      setCart(data.cart);
    } catch {
      setError("Košík se nepodařilo načíst");
    }
  }, [base]);

  useEffect(() => {
    const t = setTimeout(load, 0);
    return () => clearTimeout(t);
  }, [load]);

  const setQty = async (itemId: number, qty: number) => {
    setBusyItem(itemId);
    setError(null);
    try {
      const res = await fetch(`${base}/cart/items/${itemId}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ qty }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Změna selhala");
      setCart(data.cart);
      window.dispatchEvent(new CustomEvent("webero-cart-updated"));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Změna selhala");
    } finally {
      setBusyItem(null);
    }
  };

  const clearCart = async () => {
    if (!cart) return;
    for (const it of cart.items) {
      await fetch(`${base}/cart/items/${it.id}`, { method: "DELETE" }).catch(() => {});
    }
    window.dispatchEvent(new CustomEvent("webero-cart-updated"));
    load();
  };

  const addUpsell = async (p: Es16CartUpsell) => {
    if (!p.variant_id || busyUpsell) return;
    setBusyUpsell(p.id);
    try {
      const res = await fetch(`${base}/cart/items`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ variant_id: p.variant_id, qty: 1 }),
      });
      const data = await res.json();
      if (res.ok) {
        setCart(data.cart);
        window.dispatchEvent(new CustomEvent("webero-cart-updated"));
      }
    } finally {
      setBusyUpsell(null);
    }
  };

  const subtotal = cart?.subtotal_cents ?? 0;
  const currency = cart?.currency ?? "CZK";
  const remaining = Math.max(0, MIN_ORDER_CENTS - subtotal);
  const progress = Math.min(100, Math.round((subtotal / MIN_ORDER_CENTS) * 100));
  const canCheckout = subtotal >= MIN_ORDER_CENTS;
  const totalSplit = splitPrice(subtotal);
  const inCart = new Set((cart?.items ?? []).map((i) => i.product_slug));
  const upsell = upsellProducts.filter((p) => !inCart.has(p.slug)).slice(0, 8);

  return (
    <div style={{ fontFamily: SANS, background: CREAM, minHeight: "60vh" }}>
      <style>{`
        .es16k-wrap { max-width: 1420px; margin: 0 auto; padding: 0 28px 50px; }
        .es16k-bar { display: grid; grid-template-columns: 1fr auto 1fr; align-items: center; gap: 16px; padding: 20px 0 24px; }
        .es16k-back { display: inline-flex; align-items: center; gap: 8px; justify-self: start; color: ${FIG}; font-size: 14px; font-weight: 700; text-decoration: none; transition: gap 0.15s; }
        .es16k-back:hover { gap: 11px; }
        .es16k-total-pill { justify-self: end; display: inline-flex; align-items: baseline; gap: 8px; background: #fff; border: 1px solid ${LINE}; border-radius: 999px; padding: 9px 18px; font-size: 14px; color: ${MUTED}; }
        .es16k-total-pill b { font-family: ${HEAD}; font-weight: 800; font-size: 18px; color: ${INK}; }
        .es16k-total-pill b sup { font-size: 11px; }
        @media (max-width: 700px) { .es16k-bar { grid-template-columns: 1fr auto; } .es16k-total-pill { display: none; } }

        .es16k-grid { display: grid; grid-template-columns: minmax(0, 1fr) 360px; gap: 22px; align-items: start; }
        @media (max-width: 960px) { .es16k-grid { grid-template-columns: 1fr; } }

        .es16k-panel { background: #fff; border: 1px solid ${LINE}; border-radius: 18px; padding: 20px 22px; }
        .es16k-panel-h { display: flex; align-items: center; gap: 10px; font-family: ${HEAD}; font-weight: 800; font-size: 17px; color: ${INK}; margin: 0 0 6px; }
        .es16k-panel-h svg { color: ${FIG}; }
        .es16k-panel-h span { font-family: ${SANS}; font-size: 13px; font-weight: 500; color: ${MUTED}; }

        .es16k-row { display: grid; grid-template-columns: auto auto 1fr auto auto; align-items: center; gap: 14px; padding: 14px 0; border-top: 1px solid ${LINE}; }
        .es16k-row:first-of-type { border-top: none; }
        .es16k-x { width: 26px; height: 26px; border: none; border-radius: 999px; background: transparent; color: ${MUTED}; cursor: pointer;
          display: inline-flex; align-items: center; justify-content: center; transition: background 0.13s, color 0.13s; }
        .es16k-x:hover { background: ${SURFACE}; color: ${RASP}; }
        .es16k-thumb { width: 56px; height: 56px; border-radius: 10px; overflow: hidden; background: ${CREAM}; border: 1px solid ${LINE}; }
        .es16k-thumb img { width: 100%; height: 100%; object-fit: cover; display: block; }
        .es16k-name { min-width: 0; }
        .es16k-name a { font-size: 14px; font-weight: 600; color: ${INK}; text-decoration: none; line-height: 1.35; display: block; }
        .es16k-name a:hover { color: ${FIG}; }
        .es16k-name small { font-size: 12px; color: ${MUTED}; }
        .es16k-step { display: inline-flex; align-items: center; border: 1.5px solid ${LINE}; border-radius: 999px; background: #fff; }
        .es16k-step button { width: 34px; height: 36px; border: none; background: transparent; cursor: pointer; color: ${FIG}; font-size: 17px; font-weight: 700;
          display: inline-flex; align-items: center; justify-content: center; transition: background 0.13s; font-family: ${SANS}; border-radius: 999px; }
        .es16k-step button:hover { background: ${SURFACE}; }
        .es16k-step button[disabled] { opacity: 0.4; cursor: default; }
        .es16k-step span { min-width: 30px; text-align: center; font-size: 14.5px; font-weight: 800; color: ${INK}; }
        .es16k-line-price { font-family: ${HEAD}; font-weight: 800; font-size: 16px; color: ${INK}; white-space: nowrap; text-align: right; min-width: 82px; }
        @media (max-width: 560px) { .es16k-row { grid-template-columns: auto 1fr auto; } .es16k-x { order: 5; } .es16k-thumb { display: none; } }

        .es16k-clear { display: inline-flex; align-items: center; gap: 8px; margin-top: 14px; border: none; background: transparent; cursor: pointer;
          color: ${MUTED}; font-size: 13px; font-weight: 700; font-family: ${SANS}; transition: color 0.13s; padding: 0; }
        .es16k-clear:hover { color: ${RASP}; }

        .es16k-side { position: sticky; top: 90px; display: flex; flex-direction: column; gap: 14px; }
        .es16k-progress-note { font-size: 13px; color: ${INK}; margin: 0 0 9px; }
        .es16k-progress-note b { color: ${FIG}; }
        .es16k-progress { position: relative; height: 8px; border-radius: 999px; background: ${SURFACE}; overflow: hidden; }
        .es16k-progress i { position: absolute; inset: 0 auto 0 0; border-radius: 999px; transition: width 0.4s cubic-bezier(0.16,1,0.3,1); }
        .es16k-sumrow { display: flex; justify-content: space-between; gap: 12px; padding: 9px 0; font-size: 14px; color: ${MUTED}; border-bottom: 1px solid ${LINE}; }
        .es16k-sumrow.total { font-family: ${HEAD}; font-weight: 800; font-size: 16.5px; color: ${INK}; border-bottom: none; }
        .es16k-minnote { font-size: 12.5px; color: ${MUTED}; text-align: center; margin: 10px 0 0; line-height: 1.45; }
        .es16k-checkout { display: flex; align-items: center; justify-content: center; gap: 9px; height: 50px; margin-top: 12px; border-radius: 999px; border: none;
          font-family: ${SANS}; font-size: 15px; font-weight: 800; text-decoration: none; transition: background 0.15s, transform 0.14s; }
        .es16k-checkout.on { background: ${GREEN}; color: #fff; cursor: pointer; }
        .es16k-checkout.on:hover { background: #338442; transform: translateY(-1px); }
        .es16k-checkout.off { background: rgba(62,155,79,0.25); color: #fff; cursor: default; pointer-events: none; }

        .es16k-upsell-h { font-family: ${HEAD}; font-weight: 800; font-size: clamp(19px, 2vw, 24px); letter-spacing: -0.015em; color: ${INK}; margin: 38px 0 14px; }
        .es16k-rail { display: flex; gap: 12px; overflow-x: auto; scroll-snap-type: x mandatory; scrollbar-width: none; -ms-overflow-style: none; padding: 2px 2px 14px; }
        .es16k-rail::-webkit-scrollbar { display: none; }
        .es16k-mini { scroll-snap-align: start; flex: 0 0 190px; text-decoration: none; display: flex; flex-direction: column; background: #fff; border: 1px solid ${LINE};
          border-radius: 14px; padding: 10px 10px 13px; transition: transform 0.17s, box-shadow 0.17s, border-color 0.15s; }
        .es16k-mini:hover { transform: translateY(-3px); box-shadow: 0 16px 32px rgba(86,32,61,0.12); border-color: transparent; }
        .es16k-mini-media { position: relative; aspect-ratio: 1/1; border-radius: 9px; overflow: hidden; background: ${CREAM}; }
        .es16k-mini-media img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
        .es16k-mini-add { position: absolute; right: 7px; bottom: 7px; width: 34px; height: 34px; border-radius: 999px; border: none; cursor: pointer;
          background: ${FIG}; color: #fff; display: inline-flex; align-items: center; justify-content: center; transition: background 0.15s, transform 0.14s; }
        .es16k-mini-add:hover { background: ${FIG_DK}; transform: scale(1.08); }
        .es16k-mini-add[disabled] { opacity: 0.6; cursor: default; }
        .es16k-mini-price { margin-top: 9px; display: flex; align-items: center; gap: 6px; }
        .es16k-mini-pricebox { background: ${RASP}; color: #fff; border-radius: 6px; padding: 2px 6px 3px; font-family: ${HEAD}; font-weight: 800; font-size: 15px; line-height: 1; }
        .es16k-mini-pricebox sup { font-size: 9px; margin-left: 1px; }
        .es16k-mini-pricetxt { font-family: ${HEAD}; font-weight: 800; font-size: 15.5px; color: ${INK}; }
        .es16k-mini-pricetxt sup { font-size: 9.5px; margin-left: 1px; }
        .es16k-mini-old { font-size: 11px; color: ${MUTED}; text-decoration: line-through; }
        .es16k-mini-title { margin-top: 5px; font-size: 12.5px; font-weight: 600; color: ${INK}; line-height: 1.35; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; min-height: 2.7em; }
        .es16k-mini-sub { margin-top: 3px; font-size: 11px; color: ${MUTED}; }

        .es16k-age { margin-top: 26px; font-size: 12px; color: ${MUTED}; line-height: 1.55; max-width: 760px; }
        .es16k-empty { background: #fff; border: 1px solid ${LINE}; border-radius: 18px; padding: 60px 24px; text-align: center; }
      `}</style>

      <div className="es16k-wrap">
        <div className="es16k-bar">
          <a href={storeBase} className="es16k-back">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5"/><path d="m11 18-6-6 6-6"/></svg>
            Zpět nakupovat
          </a>
          <h1 style={{ margin: 0, fontFamily: HEAD, fontWeight: 800, fontSize: "clamp(22px, 2.4vw, 28px)", letterSpacing: "-0.02em", color: INK }}>Nákupní košík</h1>
          <span className="es16k-total-pill">Celkem <b>{totalSplit.kc}<sup>{totalSplit.hal}</sup> Kč</b></span>
        </div>

        {!cart ? (
          <div className="es16k-empty">
            <p style={{ margin: 0, fontSize: 14, color: MUTED }}>{error ?? "Načítám košík…"}</p>
          </div>
        ) : !cart.items.length ? (
          <div className="es16k-empty">
            <div style={{ width: 76, height: 76, borderRadius: 999, background: SURFACE, color: FIG, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="20" r="1.4"/><circle cx="17.5" cy="20" r="1.4"/><path d="M2.5 3.5h2.6l2.5 12h10.2l2.2-8.5H6.2"/></svg>
            </div>
            <p style={{ margin: "16px 0 4px", fontFamily: HEAD, fontWeight: 800, fontSize: 19, color: INK }}>Váš košík je prázdný</p>
            <p style={{ margin: "0 0 20px", fontSize: 13.5, color: MUTED }}>Naplňte si spížku — doručíme dnes už od 14:00.</p>
            <a href={storeBase} style={{ display: "inline-flex", alignItems: "center", height: 46, padding: "0 26px", borderRadius: 999, background: FIG, color: "#fff", fontSize: 14, fontWeight: 800, textDecoration: "none" }}>
              Prohlédnout sortiment
            </a>
          </div>
        ) : (
          <div className="es16k-grid">
            <div className="es16k-panel">
              <h2 className="es16k-panel-h">
                <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="20" r="1.4"/><circle cx="17.5" cy="20" r="1.4"/><path d="M2.5 3.5h2.6l2.5 12h10.2l2.2-8.5H6.2"/></svg>
                Obsah košíku <span>({cart.item_count} {cart.item_count === 1 ? "produkt" : cart.item_count < 5 ? "produkty" : "produktů"})</span>
              </h2>

              {cart.items.map((it) => (
                <div key={it.id} className="es16k-row">
                  <button className="es16k-x" onClick={() => setQty(it.id, 0)} disabled={busyItem === it.id} aria-label={`Odebrat ${it.product_title}`}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
                  </button>
                  <span className="es16k-thumb">
                    {it.image_url && <img src={it.image_url} alt={it.product_title} />}
                  </span>
                  <span className="es16k-name">
                    <a href={`${storeBase}/${it.product_slug}`}>{it.product_title}</a>
                    <small>{fmt(it.price_cents, currency)} / ks</small>
                  </span>
                  <span className="es16k-step">
                    <button onClick={() => setQty(it.id, it.qty - 1)} disabled={busyItem === it.id} aria-label="Snížit množství">−</button>
                    <span>{it.qty}</span>
                    <button onClick={() => setQty(it.id, it.qty + 1)} disabled={busyItem === it.id} aria-label="Zvýšit množství">+</button>
                  </span>
                  <span className="es16k-line-price">{fmt(it.line_total_cents, currency)}</span>
                </div>
              ))}

              <button className="es16k-clear" onClick={clearCart}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2m3 0-1 13H7L6 7"/></svg>
                Vyprázdnit košík
              </button>
              {error && <p style={{ margin: "12px 0 0", fontSize: 13, color: RASP }}>{error}</p>}
            </div>

            <div className="es16k-side">
              <div className="es16k-panel">
                {canCheckout ? (
                  <p className="es16k-progress-note"><b>Hotovo!</b> Dosáhli jste minimálního nákupu.</p>
                ) : (
                  <p className="es16k-progress-note">Zbývá <b>{fmt(remaining, currency)}</b> do minimálního nákupu</p>
                )}
                <div className="es16k-progress">
                  <i style={{ width: `${Math.max(3, progress)}%`, background: canCheckout ? GREEN : APRICOT }} />
                </div>
              </div>

              <div className="es16k-panel">
                <div className="es16k-sumrow"><span>Zboží</span><span style={{ color: INK, fontWeight: 700 }}>{fmt(subtotal, currency)}</span></div>
                <div className="es16k-sumrow total"><span>Celkem k platbě</span><span>{fmt(subtotal, currency)}</span></div>
                {!canCheckout && (
                  <p className="es16k-minnote">Pro pokračování do pokladny nakupte alespoň za {fmt(MIN_ORDER_CENTS, currency)}</p>
                )}
                <a
                  href={canCheckout ? `${storeBase}/pokladna` : undefined}
                  className={`es16k-checkout ${canCheckout ? "on" : "off"}`}
                  aria-disabled={!canCheckout}
                >
                  Pokračovat k pokladně
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m13 6 6 6-6 6"/></svg>
                </a>
              </div>
            </div>
          </div>
        )}

        {cart && upsell.length > 0 && (
          <>
            <h2 className="es16k-upsell-h">Nezapomněli jste na něco?</h2>
            <div className="es16k-rail">
              {upsell.map((p) => {
                const sale = p.compare_cents != null && p.compare_cents > p.price_cents;
                const sp = splitPrice(p.price_cents);
                return (
                  <a key={p.id} href={`${storeBase}/${p.slug}`} className="es16k-mini">
                    <span className="es16k-mini-media">
                      {p.image_url && <img src={p.image_url} alt={p.title} loading="lazy" />}
                      <button
                        className="es16k-mini-add"
                        disabled={busyUpsell === p.id || !p.variant_id}
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); addUpsell(p); }}
                        aria-label={`Přidat ${p.title} do košíku`}
                      >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
                      </button>
                    </span>
                    <span className="es16k-mini-price">
                      {sale ? (
                        <>
                          <span className="es16k-mini-pricebox">{sp.kc}<sup>{sp.hal}</sup></span>
                          <span className="es16k-mini-old">{fmt(p.compare_cents!, currency)}</span>
                        </>
                      ) : (
                        <span className="es16k-mini-pricetxt">{sp.kc}<sup>{sp.hal}</sup></span>
                      )}
                    </span>
                    <span className="es16k-mini-title">{p.title}</span>
                    <span className="es16k-mini-sub">{p.subtitle ?? ""}</span>
                  </a>
                );
              })}
            </div>
          </>
        )}

        <p className="es16k-age">
          Osobám mladším 18 let nesmíme prodávat ani předat alkoholické nápoje a tabákové výrobky. V případě, že nákup obsahuje
          takovou položku a přebírá jej nezletilý, kurýr zboží z nákupu odebere a jeho cenu odečteme z celkové částky. Toto je demo obchod.
        </p>
      </div>
    </div>
  );
}
