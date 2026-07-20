"use client";

/**
 * Eshop20Cart — Vykuk (dedoles.cz DNA) stránka košíku.
 * Vlevo: „Zpět nakupovat" | Baloo uppercase „N PRODUKTŮ V KOŠÍKU", řádky
 * s thumbnailem, velikostí, stepperem, řádkovou cenou a ×, Vyprázdnit košík,
 * upsell rail „Mohlo by se ti také líbit". Vpravo sticky: zelený progress do
 * dopravy zdarma 999 Kč, Doplňkové služby (reálné produkty ze skryté kategorie
 * — checkbox = přidat/odebrat z košíku), slevový kód (demo: VYKUK/SUMMER
 * uplatní hlášku), Celkem, růžová pill CTA Pokladna, trust blok.
 */

import { useCallback, useEffect, useState } from "react";

const HEAD = "'Baloo 2', 'Arial Rounded MT Bold', sans-serif";
const SANS = "'Figtree', 'Segoe UI', system-ui, sans-serif";
const COCOA = "#4b2413";
const PINK = "#f6a7d7";
const PINK_DK = "#f18cc8";
const PINK_DEEP = "#e0559f";
const CREAM = "#fdf8f0";
const INK = "#3c2010";
const MUTED = "#8a7160";
const LINE = "#efe4d5";
const GREEN = "#2f9e44";
const GOLD = "#f2b01e";

const FREE_SHIPPING_CENTS = 99900;

interface CartItem {
  id: number;
  variant_id: number;
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

export interface Es20CartService {
  slug: string;
  title: string;
  subtitle: string | null;
  variant_id: number | null;
  price_cents: number;
}

export interface Es20CartUpsell {
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
  services: Es20CartService[];
  upsellProducts: Es20CartUpsell[];
}

export function Eshop20Cart({ tenantSlug, services, upsellProducts }: Props) {
  const base = `/api/demo/${tenantSlug}/shop`;
  const [cart, setCart] = useState<Cart | null>(null);
  const [busy, setBusy] = useState<number | null>(null);
  const [svcBusy, setSvcBusy] = useState<string | null>(null);
  const [upselling, setUpselling] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [codeMsg, setCodeMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch(`${base}/cart`);
      const d = await res.json();
      if (d.cart) setCart(d.cart);
    } catch { /* noop */ }
  }, [base]);

  useEffect(() => { load(); }, [load]);

  const notify = () => window.dispatchEvent(new Event("webero-cart-updated"));

  const setQty = async (it: CartItem, qty: number) => {
    setBusy(it.id);
    try {
      await fetch(`${base}/cart/items/${it.id}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ qty }),
      });
      await load();
      notify();
    } finally { setBusy(null); }
  };

  const removeItem = async (it: CartItem) => {
    setBusy(it.id);
    try {
      await fetch(`${base}/cart/items/${it.id}`, { method: "DELETE" });
      await load();
      notify();
    } finally { setBusy(null); }
  };

  const clearAll = async () => {
    if (!cart) return;
    for (const it of cart.items) {
      await fetch(`${base}/cart/items/${it.id}`, { method: "DELETE" }).catch(() => {});
    }
    await load();
    notify();
  };

  const addByVariant = async (variantId: number) => {
    await fetch(`${base}/cart/items`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ variant_id: variantId, qty: 1 }),
    });
    await load();
    notify();
  };

  const toggleService = async (svc: Es20CartService) => {
    if (!svc.variant_id || svcBusy) return;
    setSvcBusy(svc.slug);
    try {
      const inCart = cart?.items.find((it) => it.product_slug === svc.slug);
      if (inCart) {
        await fetch(`${base}/cart/items/${inCart.id}`, { method: "DELETE" });
        await load();
        notify();
      } else {
        await addByVariant(svc.variant_id);
      }
    } finally { setSvcBusy(null); }
  };

  const addUpsell = async (u: Es20CartUpsell) => {
    if (!u.variant_id || upselling) return;
    setUpselling(u.slug);
    try { await addByVariant(u.variant_id); } finally { setUpselling(null); }
  };

  const applyCode = (e: React.FormEvent) => {
    e.preventDefault();
    const c = code.trim().toUpperCase();
    if (c === "VYKUK") setCodeMsg({ ok: true, text: "Kód uplatněn! Akce 2 + 1 zdarma se projeví v pokladně." });
    else if (c === "SUMMER") setCodeMsg({ ok: true, text: "Kód uplatněn! −20 % na letní kolekci se projeví v pokladně." });
    else setCodeMsg({ ok: false, text: "Tento kód neznáme. Zkuste VYKUK nebo SUMMER." });
  };

  const fmt = (cents: number) =>
    new Intl.NumberFormat("cs-CZ", { style: "currency", currency: cart?.currency ?? "CZK", maximumFractionDigits: 0 }).format(cents / 100);

  const goodsItems = cart?.items.filter((it) => !it.product_slug.startsWith("sluzba-")) ?? [];
  const serviceItems = cart?.items.filter((it) => it.product_slug.startsWith("sluzba-")) ?? [];
  const goodsSubtotal = goodsItems.reduce((a, it) => a + it.line_total_cents, 0);
  const shipRemaining = Math.max(0, FREE_SHIPPING_CENTS - goodsSubtotal);
  const shipPct = Math.min(100, Math.round((goodsSubtotal / FREE_SHIPPING_CENTS) * 100));
  const goodsCount = goodsItems.reduce((a, it) => a + it.qty, 0);

  const drawerTitle = (n: number) => {
    if (n === 1) return "1 produkt v košíku";
    if (n >= 2 && n <= 4) return `${n} produkty v košíku`;
    return `${n} produktů v košíku`;
  };

  const inCartSlugs = new Set(cart?.items.map((it) => it.product_slug));
  const upsell = upsellProducts.filter((u) => !inCartSlugs.has(u.slug)).slice(0, 4);

  return (
    <div style={{ fontFamily: SANS, background: CREAM }}>
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Baloo+2:wght@500;600;700;800&family=Figtree:wght@400;500;600;700;800&display=swap" />
      <style>{`
        .es20k-wrap { max-width: 1180px; margin: 0 auto; padding: 18px 24px 56px; }
        .es20k-back { display: inline-flex; align-items: center; gap: 7px; color: ${MUTED}; text-decoration: none; font-size: 13.5px; font-weight: 600; transition: color 0.14s; }
        .es20k-back:hover { color: ${PINK_DEEP}; }
        .es20k-cols { display: grid; grid-template-columns: minmax(0, 1.55fr) minmax(320px, 1fr); gap: clamp(20px, 3vw, 40px); align-items: start; margin-top: 16px; }
        @media (max-width: 920px) { .es20k-cols { grid-template-columns: 1fr; } }
        .es20k-qty { border: none; background: none; cursor: pointer; padding: 3px 10px; color: ${INK}; display: flex; align-items: center; }
        .es20k-qty:hover { opacity: 0.55; }
        .es20k-x { border: none; background: none; cursor: pointer; color: ${MUTED}; padding: 6px; border-radius: 999px; transition: color 0.14s, background 0.14s; }
        .es20k-x:hover { color: ${INK}; background: ${CREAM}; }
        .es20k-clear { border: none; background: none; cursor: pointer; color: ${MUTED}; font-family: ${SANS}; font-size: 13px; font-weight: 600; text-decoration: underline; text-underline-offset: 3px; transition: color 0.14s; }
        .es20k-clear:hover { color: ${INK}; }
        .es20k-svc { display: flex; align-items: flex-start; gap: 11px; padding: 13px 14px; border: 1.5px solid ${LINE}; border-radius: 14px; cursor: pointer; transition: border-color 0.14s, background 0.14s; background: #fff; }
        .es20k-svc:hover { border-color: ${PINK}; }
        .es20k-svc.on { border-color: ${GREEN}; background: rgba(47,158,68,0.05); }
        .es20k-check { width: 21px; height: 21px; border-radius: 7px; border: 2px solid ${LINE}; background: #fff; display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0; margin-top: 1px; transition: background 0.14s, border-color 0.14s; }
        .es20k-svc.on .es20k-check { background: ${GREEN}; border-color: ${GREEN}; color: #fff; }
        .es20k-codein { flex: 1; height: 46px; border: 1.5px solid ${LINE}; border-radius: 999px; background: #fff; padding: 0 18px; font-family: ${SANS}; font-size: 14px; color: ${INK}; outline: none; transition: border-color 0.14s, box-shadow 0.14s; }
        .es20k-codein:focus { border-color: ${COCOA}; box-shadow: 0 0 0 3px rgba(246,167,215,0.4); }
        .es20k-codebtn { height: 46px; padding: 0 20px; border: none; border-radius: 999px; background: ${COCOA}; color: #fff; font-family: ${SANS}; font-size: 13.5px; font-weight: 800; cursor: pointer; transition: background 0.15s; }
        .es20k-codebtn:hover { background: #38190c; }
        .es20k-cta { display: flex; align-items: center; justify-content: center; gap: 10px; width: 100%; height: 56px; border-radius: 999px; background: ${PINK};
          color: ${COCOA}; font-size: 16px; font-weight: 800; text-decoration: none; box-shadow: 0 10px 24px rgba(56,25,12,0.16); transition: background 0.16s, transform 0.14s; }
        .es20k-cta:hover { background: ${PINK_DK}; transform: translateY(-2px); }
        .es20k-cta[data-disabled="true"] { opacity: 0.55; pointer-events: none; }
        .es20k-up { display: flex; align-items: center; gap: 12px; background: #fff; border: 1.5px solid ${LINE}; border-radius: 16px; padding: 10px 12px; }
        .es20k-upbtn { border: 1.5px solid ${COCOA}; background: #fff; color: ${INK}; cursor: pointer; font-family: ${SANS}; font-size: 11px; font-weight: 800;
          letter-spacing: 0.05em; text-transform: uppercase; padding: 8px 15px; border-radius: 999px; transition: background 0.15s, border-color 0.15s, color 0.15s; }
        .es20k-upbtn:hover { background: ${PINK}; border-color: ${PINK}; color: ${COCOA}; }
      `}</style>

      <div className="es20k-wrap">
        <a href={`/demo/${tenantSlug}/obchod`} className="es20k-back">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M11 18l-6-6 6-6"/></svg>
          Zpět nakupovat
        </a>

        <div className="es20k-cols">
          {/* Položky */}
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 16 }}>
              <h1 style={{ margin: 0, fontFamily: HEAD, fontWeight: 800, fontSize: "clamp(21px, 2.2vw, 28px)", letterSpacing: "0.03em", textTransform: "uppercase", color: COCOA }}>
                {goodsCount > 0 ? drawerTitle(goodsCount) : "Nákupní košík"}
              </h1>
              {goodsItems.length > 0 && <button className="es20k-clear" onClick={clearAll}>Vyprázdnit košík</button>}
            </div>

            {!cart || goodsItems.length === 0 ? (
              <div style={{ background: "#fff", border: `1.5px solid ${LINE}`, borderRadius: 22, padding: "54px 24px", textAlign: "center" }}>
                <div style={{ fontSize: 15, fontWeight: 600, color: MUTED, marginBottom: 18 }}>Tvůj košík zatím zeje prázdnotou.</div>
                <a href={`/demo/${tenantSlug}/obchod`} style={{ display: "inline-flex", alignItems: "center", gap: 8, border: `2px solid ${COCOA}`, borderRadius: 999, padding: "12px 26px", color: COCOA, fontWeight: 800, fontSize: 14, textDecoration: "none" }}>Pokračovat v nákupu</a>
              </div>
            ) : (
              <div style={{ background: "#fff", border: `1.5px solid ${LINE}`, borderRadius: 22, padding: "6px 20px" }}>
                {goodsItems.map((it) => (
                  <div key={it.id} style={{ display: "flex", gap: 14, alignItems: "center", padding: "15px 0", borderBottom: `1px solid ${LINE}`, opacity: busy === it.id ? 0.5 : 1 }}>
                    <a href={`/demo/${tenantSlug}/obchod/${it.product_slug}`} style={{ width: 72, height: 72, background: CREAM, borderRadius: 14, flexShrink: 0, overflow: "hidden", display: "block" }}>
                      {it.image_url && <img src={it.image_url} alt={it.product_title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />}
                    </a>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <a href={`/demo/${tenantSlug}/obchod/${it.product_slug}`} style={{ fontSize: 14, fontWeight: 600, color: INK, textDecoration: "none", lineHeight: 1.35, display: "block" }}>{it.product_title}</a>
                      {it.variant_title && it.variant_title !== "Uni" && <div style={{ fontSize: 12.5, color: MUTED, marginTop: 3 }}>Velikost: <b>{it.variant_title}</b></div>}
                      <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 9 }}>
                        <span style={{ display: "inline-flex", alignItems: "center", border: `1.5px solid ${LINE}`, borderRadius: 999 }}>
                          <button className="es20k-qty" disabled={busy === it.id} onClick={() => setQty(it, it.qty - 1)} aria-label="Snížit množství">
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12"/></svg>
                          </button>
                          <span style={{ fontSize: 13.5, fontWeight: 700, minWidth: 24, textAlign: "center" }}>{it.qty}</span>
                          <button className="es20k-qty" disabled={busy === it.id} onClick={() => setQty(it, it.qty + 1)} aria-label="Zvýšit množství">
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12"/><line x1="12" y1="5" x2="12" y2="19"/></svg>
                          </button>
                        </span>
                        <span style={{ fontFamily: HEAD, fontWeight: 800, fontSize: 15.5, color: INK, marginLeft: "auto" }}>{fmt(it.line_total_cents)}</span>
                        <button className="es20k-x" disabled={busy === it.id} onClick={() => removeItem(it)} aria-label={`Odebrat ${it.product_title}`}>
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="5" y1="5" x2="19" y2="19"/><line x1="19" y1="5" x2="5" y2="19"/></svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                {serviceItems.length > 0 && (
                  <div style={{ padding: "12px 0 14px" }}>
                    {serviceItems.map((it) => (
                      <div key={it.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "5px 0", fontSize: 13, color: MUTED }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={GREEN} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="m4.5 12.5 5 5 10-11"/></svg>
                        <span style={{ flex: 1 }}>{it.product_title}</span>
                        <span style={{ fontWeight: 700, color: INK }}>{fmt(it.line_total_cents)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Upsell */}
            {upsell.length > 0 && goodsItems.length > 0 && (
              <div style={{ marginTop: 26 }}>
                <div style={{ fontFamily: HEAD, fontWeight: 800, fontSize: 16, letterSpacing: "0.05em", textTransform: "uppercase", color: COCOA, marginBottom: 12 }}>Mohlo by se ti také líbit</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 10 }}>
                  {upsell.map((u) => (
                    <div key={u.slug} className="es20k-up">
                      <a href={`/demo/${tenantSlug}/obchod/${u.slug}`} style={{ width: 54, height: 54, background: CREAM, borderRadius: 12, flexShrink: 0, overflow: "hidden", display: "block" }}>
                        {u.image_url && <img src={u.image_url} alt={u.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />}
                      </a>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 12.5, fontWeight: 600, color: INK, lineHeight: 1.3, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>{u.title}</div>
                        <div style={{ fontSize: 12.5, fontWeight: 800, color: INK, marginTop: 3 }}>{fmt(u.price_cents)}</div>
                      </div>
                      <button className="es20k-upbtn" disabled={upselling === u.slug || !u.variant_id} onClick={() => addUpsell(u)}>Přidat</button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div style={{ position: "sticky", top: 100, display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Doprava zdarma */}
            <div style={{ background: "#fff", border: `1.5px solid ${LINE}`, borderRadius: 18, padding: "16px 18px" }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 9, fontSize: 13, fontWeight: 600, color: shipRemaining === 0 ? GREEN : INK, marginBottom: 10 }}>
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={shipRemaining === 0 ? GREEN : COCOA} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 1 }}><path d="M2.5 6h11v10h-11zM13.5 9.5h4l3 3.5v3h-7"/><circle cx="6.5" cy="17.5" r="1.7"/><circle cx="17" cy="17.5" r="1.7"/></svg>
                <span>
                  {shipRemaining === 0
                    ? "Hurá! Máte dopravu zdarma."
                    : <>Už tam skoro jste. Nakupte ještě za <b>{fmt(shipRemaining)}</b> a získáte dopravu zdarma.</>}
                </span>
              </div>
              <div style={{ height: 7, borderRadius: 999, background: "#ece2d2", overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${shipPct}%`, borderRadius: 999, background: GREEN, transition: "width 0.4s cubic-bezier(0.16,1,0.3,1)" }} />
              </div>
            </div>

            {/* Doplňkové služby */}
            {services.length > 0 && (
              <div style={{ background: "#fff", border: `1.5px solid ${LINE}`, borderRadius: 18, padding: "16px 18px" }}>
                <div style={{ fontFamily: HEAD, fontWeight: 800, fontSize: 14.5, letterSpacing: "0.05em", textTransform: "uppercase", color: COCOA, marginBottom: 11 }}>Doplňkové služby</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {services.map((svc) => {
                    const on = !!cart?.items.find((it) => it.product_slug === svc.slug);
                    return (
                      <div key={svc.slug} className={`es20k-svc${on ? " on" : ""}`} onClick={() => toggleService(svc)} role="checkbox" aria-checked={on} tabIndex={0}
                        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggleService(svc); } }}
                        style={{ opacity: svcBusy === svc.slug ? 0.5 : 1 }}>
                        <span className="es20k-check">
                          {on && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m4.5 12.5 5 5 10-11"/></svg>}
                        </span>
                        <span style={{ flex: 1, minWidth: 0 }}>
                          <span style={{ display: "block", fontSize: 13.5, fontWeight: 700, color: INK, lineHeight: 1.3 }}>{svc.title}</span>
                          {svc.subtitle && <span style={{ display: "block", fontSize: 12, color: MUTED, marginTop: 2 }}>{svc.subtitle}</span>}
                        </span>
                        <span style={{ fontSize: 13.5, fontWeight: 800, color: INK, whiteSpace: "nowrap" }}>{fmt(svc.price_cents)}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Slevový kód */}
            <form onSubmit={applyCode} style={{ background: "#fff", border: `1.5px solid ${LINE}`, borderRadius: 18, padding: "16px 18px" }}>
              <div style={{ fontFamily: HEAD, fontWeight: 800, fontSize: 14.5, letterSpacing: "0.05em", textTransform: "uppercase", color: COCOA, marginBottom: 11 }}>Slevový kód</div>
              <div style={{ display: "flex", gap: 8 }}>
                <input className="es20k-codein" value={code} onChange={(e) => { setCode(e.target.value); setCodeMsg(null); }} placeholder="Slevový kód nebo dárková karta" aria-label="Slevový kód" />
                <button type="submit" className="es20k-codebtn">Uplatnit</button>
              </div>
              {codeMsg && (
                <div style={{ marginTop: 9, fontSize: 12.5, fontWeight: 600, color: codeMsg.ok ? GREEN : "#b3413d" }}>{codeMsg.text}</div>
              )}
            </form>

            {/* Celkem + CTA */}
            <div style={{ background: "#fff", border: `1.5px solid ${LINE}`, borderRadius: 18, padding: "18px" }}>
              <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 4 }}>
                <span style={{ fontSize: 13.5, fontWeight: 600, color: MUTED }}>Celkem za produkty</span>
                <span style={{ fontFamily: HEAD, fontWeight: 800, fontSize: 22, color: INK }}>{fmt(cart?.subtotal_cents ?? 0)}</span>
              </div>
              <div style={{ fontSize: 12, color: MUTED, textAlign: "right", marginBottom: 14 }}>Odesíláme do 1–2 pracovních dnů</div>
              <a href={`/demo/${tenantSlug}/obchod/pokladna`} className="es20k-cta" data-disabled={goodsItems.length === 0}>
                Pokladna
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
              </a>
            </div>

            {/* Trust */}
            <div style={{ background: CREAM, border: `1.5px solid ${LINE}`, borderRadius: 18, padding: "16px 18px", textAlign: "center" }}>
              <div style={{ fontSize: 12.5, fontWeight: 600, color: MUTED, marginBottom: 7 }}>Víc než 4M spokojených zákazníků</div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 9 }}>
                <span style={{ fontFamily: HEAD, fontWeight: 800, fontSize: 14, letterSpacing: "0.06em", textTransform: "uppercase", color: COCOA }}>Skvělé</span>
                <span style={{ display: "inline-flex", gap: 1.5 }}>
                  {[1, 2, 3, 4].map((i) => (
                    <svg key={i} width="14" height="14" viewBox="0 0 24 24"><path d="M12 2.5l2.95 5.98 6.6.96-4.78 4.66 1.13 6.58L12 17.57l-5.9 3.11 1.13-6.58L2.45 9.44l6.6-.96L12 2.5z" fill={GOLD} /></svg>
                  ))}
                  <svg width="14" height="14" viewBox="0 0 24 24"><defs><linearGradient id="es20k-half" x1="0" x2="1" y1="0" y2="0"><stop offset="70%" stopColor={GOLD} /><stop offset="70%" stopColor="#e5dcd0" /></linearGradient></defs><path d="M12 2.5l2.95 5.98 6.6.96-4.78 4.66 1.13 6.58L12 17.57l-5.9 3.11 1.13-6.58L2.45 9.44l6.6-.96L12 2.5z" fill="url(#es20k-half)" /></svg>
                </span>
                <span style={{ fontSize: 12, fontWeight: 600, color: MUTED }}>(32 481 recenzí)</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 16, flexWrap: "wrap" }}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 600, color: INK }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={GREEN} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 2.6-6.4L3 8"/><path d="M3 3v5h5"/></svg>
                  Vrácení až do 100 dnů
                </span>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 600, color: INK }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={GREEN} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2.5 4.5 5.5v6c0 4.6 3.2 8 7.5 10 4.3-2 7.5-5.4 7.5-10v-6L12 2.5Z"/><path d="m8.8 12 2.3 2.3 4.1-4.6"/></svg>
                  Zaručeně bezpečný nákup
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
