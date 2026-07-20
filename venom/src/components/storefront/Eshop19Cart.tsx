"use client";

/**
 * Eshop19Cart — Grunt (dek.cz DNA) stránka košíku dle kosik.pdf 1:1.
 * Papírová lišta kroků (Košík › Doprava a platba › Dodací údaje › Souhrn +
 * zelené POKRAČOVAT) → H1 „Obsah vašeho košíku" + chip „Zkopírovat odkaz
 * na košík" → řádky položek v kartě (thumb, název, stepper + ks, zelené
 * „Skladem vše", ks bez/s DPH, Celkem s DPH červeně, × remove) → šedý pruh
 * s přepínačem „Chci zboží odebrat na paletách." → žlutý panel „Celkem
 * k zaplacení" (bez DPH / DPH / Výsledná cena červeně) → „Mohlo by vás
 * zajímat" 3 karty se zeleným Do košíku → Zpět k nákupu | Vysypat košík +
 * zelené POKRAČOVAT.
 */

import { useCallback, useEffect, useState } from "react";

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
const CREAM_INFO = "#fbf7df";

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

export interface Es19CartUpsell {
  id: number;
  slug: string;
  title: string;
  subtitle: string | null;
  variant_id: number | null;
  price_cents: number;
  compare_cents: number | null;
  image_url: string | null;
  flags: unknown;
}

interface Props {
  tenantSlug: string;
  upsellProducts: Es19CartUpsell[];
}

const STEPS = [
  { label: "Košík", icon: "cart" },
  { label: "Doprava a platba", icon: "truck" },
  { label: "Dodací údaje", icon: "home" },
  { label: "Souhrn", icon: "check" },
];

function StepIcon({ name, size = 17 }: { name: string; size?: number }) {
  const p = { width: size, height: size, viewBox: "0 0 24 24", fill: "none" as const, stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true as const };
  switch (name) {
    case "cart": return (<svg {...p}><circle cx="9" cy="20" r="1.4"/><circle cx="17.5" cy="20" r="1.4"/><path d="M2.5 3.5h2.6l2.5 12h10.2l2.2-8.5H6.2"/></svg>);
    case "truck": return (<svg {...p}><path d="M2.5 16.5V6h11v10.5M13.5 9.5h4.5l3 3.5v3.5h-3"/><circle cx="7" cy="17.5" r="1.9"/><circle cx="16.5" cy="17.5" r="1.9"/></svg>);
    case "home": return (<svg {...p}><path d="M4 11.5 12 4l8 7.5M6 10v10h12V10"/></svg>);
    default: return (<svg {...p}><circle cx="12" cy="12" r="9"/><path d="m8 12.5 2.7 2.7L16.5 9"/></svg>);
  }
}

export function Eshop19Cart({ tenantSlug, upsellProducts }: Props) {
  const [cart, setCart] = useState<Cart | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busyItem, setBusyItem] = useState<number | null>(null);
  const [busyUpsell, setBusyUpsell] = useState<number | null>(null);
  const [pallets, setPallets] = useState(false);
  const [copied, setCopied] = useState(false);
  const base = `/api/demo/${tenantSlug}/shop`;
  const storeBase = `/demo/${tenantSlug}/obchod`;
  const checkoutHref = `${storeBase}/pokladna`;

  const fmt = (cents: number, currency = "CZK") =>
    new Intl.NumberFormat("cs-CZ", { style: "currency", currency, maximumFractionDigits: 2 }).format(cents / 100);
  const noVat = (cents: number) => Math.round(cents / 1.21);

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

  const removeItem = async (itemId: number) => {
    setBusyItem(itemId);
    try {
      await fetch(`${base}/cart/items/${itemId}`, { method: "DELETE" });
      window.dispatchEvent(new CustomEvent("webero-cart-updated"));
      await load();
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

  const addUpsell = async (p: Es19CartUpsell) => {
    if (!p.variant_id || busyUpsell) return;
    setBusyUpsell(p.id);
    try {
      const res = await fetch(`${base}/cart/items`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ variant_id: p.variant_id, qty: 1 }),
      });
      if (res.ok) {
        window.dispatchEvent(new CustomEvent("webero-cart-updated"));
        await load();
      }
    } finally {
      setBusyUpsell(null);
    }
  };

  const copyLink = () => {
    navigator.clipboard?.writeText(window.location.href).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const currency = cart?.currency ?? "CZK";
  const subtotal = cart?.subtotal_cents ?? 0;
  const subtotalNoVat = noVat(subtotal);
  const inCart = new Set((cart?.items ?? []).map((i) => i.product_slug));
  const upsell = upsellProducts.filter((p) => !inCart.has(p.slug)).slice(0, 3);
  const empty = !cart || cart.items.length === 0;

  const continueBtn = (
    <a
      href={empty ? "#" : checkoutHref}
      onClick={(e) => { if (empty) e.preventDefault(); }}
      className="es19k-continue"
      aria-disabled={empty}
      style={empty ? { opacity: 0.5, pointerEvents: "auto", cursor: "default" } : undefined}
    >
      Pokračovat
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
    </a>
  );

  return (
    <div style={{ fontFamily: SANS, background: "#fff" }}>
      <style>{`
        .es19k-continue { display: inline-flex; align-items: center; gap: 9px; background: ${GREEN}; color: #fff; text-decoration: none;
          font-family: ${SANS}; font-size: 13.5px; font-weight: 800; letter-spacing: 0.07em; text-transform: uppercase; padding: 14px 30px;
          border-radius: 6px; transition: background 0.15s, transform 0.14s, gap 0.16s; }
        .es19k-continue:hover { background: ${GREEN_DK}; transform: translateY(-1px); gap: 13px; }

        .es19k-chip { display: inline-flex; align-items: center; gap: 7px; border: 1.5px solid ${LINE}; border-radius: 6px; background: #fff;
          color: ${INK}; font-family: ${SANS}; font-size: 12.5px; font-weight: 600; padding: 8px 14px; cursor: pointer; transition: border-color 0.15s, color 0.15s; }
        .es19k-chip:hover { border-color: ${GRAPHITE}; }

        .es19k-qty { display: inline-flex; align-items: center; border: 1.5px solid ${LINE}; border-radius: 6px; background: #fff; }
        .es19k-qty button { border: none; background: none; cursor: pointer; padding: 8px 11px; color: ${INK}; display: flex; align-items: center; transition: opacity 0.13s; }
        .es19k-qty button:hover { opacity: 0.5; }

        .es19k-remove { border: none; background: none; cursor: pointer; color: ${RED}; padding: 6px; border-radius: 5px; transition: background 0.14s; }
        .es19k-remove:hover { background: #fdeeee; }

        .es19k-link { color: ${GREEN_DK}; text-decoration: none; font-size: 13px; font-weight: 700; transition: opacity 0.14s; }
        .es19k-link:hover { opacity: 0.7; }
        .es19k-link.es19k-muted { color: ${MUTED}; font-weight: 600; }
        .es19k-link.es19k-muted:hover { color: ${RED}; opacity: 1; }

        .es19k-toggle { position: relative; width: 40px; height: 22px; border-radius: 999px; border: none; cursor: pointer; transition: background 0.18s; flex-shrink: 0; }
        .es19k-toggle::after { content: ""; position: absolute; top: 3px; left: 3px; width: 16px; height: 16px; border-radius: 999px; background: #fff;
          box-shadow: 0 1px 3px rgba(0,0,0,0.25); transition: transform 0.18s cubic-bezier(0.16,1,0.3,1); }
        .es19k-toggle.es19k-on::after { transform: translateX(18px); }

        .es19k-upsell { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 14px; }
        @media (max-width: 820px) { .es19k-upsell { grid-template-columns: 1fr; } }
        .es19k-ucard { display: flex; flex-direction: column; background: #fff; border: 1.5px solid ${LINE}; border-radius: 8px; overflow: hidden;
          text-decoration: none; transition: transform 0.16s, box-shadow 0.18s, border-color 0.16s; }
        .es19k-ucard:hover { transform: translateY(-2px); box-shadow: 0 12px 26px rgba(23,25,28,0.09); border-color: ${GRAPHITE}; }
        .es19k-ubuy { margin-top: 10px; height: 36px; border: none; border-radius: 6px; background: ${GREEN}; color: #fff; font-family: ${SANS};
          font-size: 12.5px; font-weight: 800; cursor: pointer; transition: background 0.15s; }
        .es19k-ubuy:hover { background: ${GREEN_DK}; }

        .es19k-steps { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
        .es19k-step { display: inline-flex; align-items: center; gap: 8px; font-size: 13.5px; font-weight: 700; }
      `}</style>

      {/* ═══ Lišta kroků ═══ */}
      <div style={{ background: PAPER, borderBottom: `1px solid ${LINE}` }}>
        <div style={{ maxWidth: 1420, margin: "0 auto", padding: "14px 28px", display: "flex", alignItems: "center", gap: 18, flexWrap: "wrap" }}>
          <div className="es19k-steps" style={{ flex: 1 }}>
            {STEPS.map((s, i) => (
              <span key={s.label} style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
                {i > 0 && <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={MUTED} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m9 6 6 6-6 6"/></svg>}
                <span className="es19k-step" style={{ color: i === 0 ? INK : MUTED }}>
                  <span style={{ color: i === 0 ? GREEN : MUTED, display: "inline-flex" }}><StepIcon name={s.icon} /></span>
                  {s.label}
                </span>
              </span>
            ))}
          </div>
          {continueBtn}
        </div>
      </div>

      <div style={{ maxWidth: 1420, margin: "0 auto", padding: "26px 28px 56px" }}>
        {/* H1 + zkopírovat odkaz */}
        <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap", marginBottom: 20 }}>
          <h1 style={{ fontFamily: HEAD, fontWeight: 700, fontSize: "clamp(23px, 2.2vw, 30px)", letterSpacing: "0.02em", textTransform: "uppercase", color: INK, margin: 0 }}>Obsah vašeho košíku</h1>
          <button className="es19k-chip" onClick={copyLink}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M10 13.5a4 4 0 0 0 6 .5l3-3a4 4 0 0 0-5.7-5.7l-1.5 1.5"/><path d="M14 10.5a4 4 0 0 0-6-.5l-3 3a4 4 0 0 0 5.7 5.7l1.5-1.5"/></svg>
            {copied ? "Odkaz zkopírován ✓" : "Zkopírovat odkaz na košík"}
          </button>
        </div>

        {error && <div style={{ marginBottom: 14, background: "#fdeeee", border: `1px solid ${RED}`, borderRadius: 6, padding: "10px 14px", fontSize: 13, color: RED, fontWeight: 600 }}>{error}</div>}

        {empty ? (
          <div style={{ border: `1.5px solid ${LINE}`, borderRadius: 10, padding: "64px 24px", textAlign: "center" }}>
            <svg width="46" height="46" viewBox="0 0 24 24" fill="none" stroke={LINE} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" style={{ margin: "0 auto 14px", display: "block" }} aria-hidden="true"><circle cx="9" cy="20" r="1.4"/><circle cx="17.5" cy="20" r="1.4"/><path d="M2.5 3.5h2.6l2.5 12h10.2l2.2-8.5H6.2"/></svg>
            <div style={{ fontSize: 15, fontWeight: 600, color: MUTED, marginBottom: 20 }}>Váš košík je zatím prázdný.</div>
            <a href={storeBase} className="es19k-continue" style={{ background: GRAPHITE }}>Zpět k nákupu</a>
          </div>
        ) : (
          <>
            {/* Položky */}
            <div style={{ border: `1.5px solid ${LINE}`, borderRadius: 10, overflow: "hidden" }}>
              {cart.items.map((it, i) => (
                <div key={it.id} style={{ display: "flex", alignItems: "center", gap: 18, padding: "16px 20px", borderBottom: i < cart.items.length - 1 ? `1px solid ${LINE}` : "none", opacity: busyItem === it.id ? 0.5 : 1, flexWrap: "wrap" }}>
                  <a href={`${storeBase}/${it.product_slug}`} style={{ width: 74, height: 74, background: PAPER, borderRadius: 8, overflow: "hidden", flexShrink: 0, border: `1px solid ${LINE}` }}>
                    {it.image_url && <img src={it.image_url} alt={it.product_title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />}
                  </a>
                  <div style={{ flex: "1 1 220px", minWidth: 0 }}>
                    <a href={`${storeBase}/${it.product_slug}`} style={{ fontSize: 14.5, fontWeight: 700, color: INK, textDecoration: "none", lineHeight: 1.35 }}>{it.product_title}</a>
                    <div style={{ marginTop: 6, display: "flex", alignItems: "center", gap: 14 }}>
                      <span className="es19k-qty">
                        <button disabled={busyItem === it.id} onClick={() => setQty(it.id, it.qty - 1)} aria-label="Snížit množství">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12"/></svg>
                        </button>
                        <span style={{ fontSize: 13.5, fontWeight: 700, minWidth: 26, textAlign: "center" }}>{it.qty}</span>
                        <button disabled={busyItem === it.id} onClick={() => setQty(it.id, it.qty + 1)} aria-label="Zvýšit množství">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12"/><line x1="12" y1="5" x2="12" y2="19"/></svg>
                        </button>
                      </span>
                      <span style={{ fontSize: 13, fontWeight: 600, color: MUTED }}>ks</span>
                      <span style={{ fontSize: 13, fontWeight: 700, color: GREEN_DK, textDecoration: "underline", textUnderlineOffset: 3 }}>Skladem vše</span>
                    </div>
                  </div>
                  <div style={{ marginLeft: "auto", textAlign: "right", fontSize: 12.5, color: MUTED, lineHeight: 1.7 }}>
                    <div>ks bez DPH <span style={{ color: INK, fontWeight: 600, marginLeft: 10 }}>{fmt(noVat(it.price_cents), currency)}</span></div>
                    <div>ks s DPH <span style={{ color: INK, fontWeight: 600, marginLeft: 10 }}>{fmt(it.price_cents, currency)}</span></div>
                    <div style={{ fontSize: 13.5, fontWeight: 700, color: INK }}>Celkem s DPH <span style={{ color: RED, fontFamily: HEAD, fontWeight: 700, fontSize: 16, marginLeft: 10 }}>{fmt(it.line_total_cents, currency)}</span></div>
                  </div>
                  <button className="es19k-remove" disabled={busyItem === it.id} onClick={() => removeItem(it.id)} aria-label={`Odebrat ${it.product_title}`}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><line x1="5" y1="5" x2="19" y2="19"/><line x1="19" y1="5" x2="5" y2="19"/></svg>
                  </button>
                </div>
              ))}
            </div>

            {/* Palety toggle */}
            <div style={{ marginTop: 14, background: PAPER, border: `1px solid ${LINE}`, borderRadius: 8, padding: "13px 18px", display: "flex", alignItems: "center", gap: 12 }}>
              <button
                className={`es19k-toggle${pallets ? " es19k-on" : ""}`}
                style={{ background: pallets ? GREEN : "#cfcec8" }}
                onClick={() => setPallets((v) => !v)}
                role="switch"
                aria-checked={pallets}
                aria-label="Chci zboží odebrat na paletách"
              />
              <span style={{ fontSize: 13.5, fontWeight: 600, color: INK }}>Chci zboží odebrat na paletách.</span>
              {pallets && <span style={{ fontSize: 12, color: MUTED }}>Vratné palety naúčtujeme zálohově a po vrácení vykoupíme zpět (demo).</span>}
            </div>

            {/* Celkem k zaplacení */}
            <div style={{ marginTop: 14, background: CREAM_INFO, border: "1px solid #efe6b8", borderBottom: `3px solid ${GRAPHITE}`, borderRadius: 8, padding: "22px 24px", display: "flex", alignItems: "center", gap: 24, flexWrap: "wrap" }}>
              <h2 style={{ fontFamily: HEAD, fontWeight: 700, fontSize: 21, letterSpacing: "0.02em", textTransform: "uppercase", color: INK, margin: 0, flex: 1 }}>Celkem k zaplacení</h2>
              <div style={{ minWidth: 250, fontSize: 13.5, color: MUTED }}>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "3px 0" }}><span>Celkem bez DPH</span><span style={{ color: INK, fontWeight: 600 }}>{fmt(subtotalNoVat, currency)}</span></div>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "3px 0", borderBottom: `1px solid #e5dca9`, paddingBottom: 8 }}><span>DPH</span><span style={{ color: INK, fontWeight: 600 }}>{fmt(subtotal - subtotalNoVat, currency)}</span></div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", paddingTop: 8 }}>
                  <span style={{ color: INK, fontWeight: 600 }}>Výsledná cena</span>
                  <span style={{ fontFamily: HEAD, fontWeight: 700, fontSize: 24, color: RED }}>{fmt(subtotal, currency)}</span>
                </div>
              </div>
            </div>

            {/* Mohlo by vás zajímat */}
            {upsell.length > 0 && (
              <div style={{ marginTop: 34 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
                  <span aria-hidden="true" style={{ width: 9, height: 23, background: RED, borderRadius: 2, flexShrink: 0 }} />
                  <h2 style={{ fontFamily: HEAD, fontWeight: 700, fontSize: 20, letterSpacing: "0.02em", textTransform: "uppercase", color: INK, margin: 0 }}>Mohlo by vás zajímat</h2>
                </div>
                <div className="es19k-upsell">
                  {upsell.map((p) => {
                    const f = (typeof p.flags === "string" ? JSON.parse((p.flags as string) || "{}") : (p.flags ?? {})) as Record<string, unknown>;
                    const unit = typeof f.unit === "string" ? (f.unit as string) : "ks";
                    const isDeal = !!f.deal;
                    return (
                      <a key={p.id} href={`${storeBase}/${p.slug}`} className="es19k-ucard">
                        <span style={{ position: "relative", display: "block", aspectRatio: "16/9", background: PAPER, overflow: "hidden" }}>
                          {p.image_url && <img src={p.image_url} alt={p.title} loading="lazy" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />}
                          {isDeal && <span style={{ position: "absolute", left: 10, top: 10, background: RED, color: "#fff", fontSize: 10.5, fontWeight: 800, letterSpacing: "0.05em", textTransform: "uppercase", padding: "3.5px 8px", borderRadius: 3 }}>Výhodná cena</span>}
                        </span>
                        <span style={{ display: "flex", flexDirection: "column", flex: 1, padding: "12px 14px 14px" }}>
                          <span style={{ fontSize: 13.5, fontWeight: 700, color: INK, lineHeight: 1.35, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", minHeight: "2.7em" }}>{p.title}</span>
                          <span style={{ display: "flex", alignItems: "baseline", gap: 7, marginTop: 8 }}>
                            <span style={{ fontFamily: HEAD, fontWeight: 700, fontSize: 17, color: isDeal ? RED : INK }}>{fmt(p.price_cents, currency)}</span>
                            <span style={{ fontSize: 10.5, fontWeight: 600, color: MUTED }}>cena za {unit} s DPH</span>
                          </span>
                          <button
                            className="es19k-ubuy"
                            disabled={busyUpsell === p.id || !p.variant_id}
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); addUpsell(p); }}
                            aria-label={`Přidat ${p.title} do košíku`}
                          >Do košíku</button>
                        </span>
                      </a>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Spodní lišta */}
            <div style={{ marginTop: 34, display: "flex", alignItems: "center", gap: 22, flexWrap: "wrap" }}>
              <a href={storeBase} className="es19k-link">‹ Zpět k nákupu</a>
              <button onClick={clearCart} className="es19k-link es19k-muted" style={{ border: "none", background: "none", cursor: "pointer", fontFamily: SANS }}>Vysypat košík</button>
              <span style={{ marginLeft: "auto" }}>{continueBtn}</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
