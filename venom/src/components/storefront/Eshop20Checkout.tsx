"use client";

/**
 * Eshop20Checkout — Vykuk (dedoles.cz DNA) pokladna dle pokladna.pdf.
 * Vlevo: expresní pokladna (Apple Pay / Google Pay černá tlačítka) → „NEBO" →
 * Kontakt (e-mail) → Doručení (Česko, jméno/příjmení, adresa, PSČ/město,
 * telefon + formátová nápověda) → Metoda dopravy (radio karty, zdarma od 999)
 * → Platba (radio karty s logy, dobírka +39, převod) → souhlas → růžová
 * pill Zaplatit. Vpravo sticky souhrn: thumbnaily s qty badge, slevový kód,
 * Mezisoučet/Doprava/Celkem. API: POST /shop/checkout (stejný kontrakt jako
 * CheckoutClient), kupóny POST /shop/coupons.
 */

import Link from "next/link";
import { useMemo, useRef, useState } from "react";

const HEAD = "'Baloo 2', 'Arial Rounded MT Bold', sans-serif";
const SANS = "'Figtree', 'Segoe UI', system-ui, sans-serif";
const COCOA = "#4b2413";
const PINK = "#f6a7d7";
const PINK_DK = "#f18cc8";
const CREAM = "#fdf8f0";
const INK = "#3c2010";
const MUTED = "#8a7160";
const LINE = "#efe4d5";
const GREEN = "#2f9e44";
const RED = "#e03131";

export interface Es20CheckoutItem {
  id: number;
  title: string;
  variant_title: string | null;
  qty: number;
  line_total_cents: number;
  image_url: string | null;
}

export interface Es20ShippingMethod {
  key: string;
  label: string;
  description?: string;
  price_cents: number;
  free_above_cents: number | null;
}

export interface Es20PaymentMethod {
  key: string;
  label: string;
  description?: string;
  fee_cents: number;
}

interface Props {
  tenantSlug: string;
  initialCart: { items: Es20CheckoutItem[]; subtotal_cents: number };
  shippingMethods: Es20ShippingMethod[];
  paymentMethods: Es20PaymentMethod[];
}

function czk(cents: number): string {
  return new Intl.NumberFormat("cs-CZ", { style: "currency", currency: "CZK", maximumFractionDigits: cents % 100 ? 2 : 0 }).format(cents / 100);
}

function ApplePayMark() {
  return (
    <svg width="52" height="22" viewBox="0 0 52 22" fill="currentColor" aria-hidden>
      <path d="M9.4 4.06c.56-.7.95-1.64.84-2.6-.82.04-1.82.55-2.4 1.24-.52.6-.99 1.58-.87 2.5.92.08 1.86-.46 2.43-1.14Zm.83 1.32c-1.34-.08-2.48.76-3.12.76-.64 0-1.62-.72-2.67-.7-1.37.02-2.64.8-3.35 2.03-1.43 2.47-.37 6.13 1.02 8.14.68.98 1.49 2.08 2.56 2.04 1.02-.04 1.41-.66 2.65-.66s1.59.66 2.67.64c1.1-.02 1.8-1 2.48-1.99.78-1.13 1.1-2.23 1.12-2.29-.02-.02-2.15-.84-2.17-3.32-.02-2.08 1.7-3.07 1.77-3.12-.97-1.43-2.47-1.59-2.96-1.53Z"/>
      <text x="15" y="16.5" fontFamily="-apple-system,'Helvetica Neue',Arial,sans-serif" fontWeight="600" fontSize="14.5">Pay</text>
    </svg>
  );
}

function GooglePayMark() {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }} aria-hidden>
      <svg width="19" height="19" viewBox="0 0 24 24">
        <path fill="#4285F4" d="M23.5 12.27c0-.85-.08-1.66-.22-2.45H12v4.64h6.45a5.52 5.52 0 0 1-2.39 3.62v3h3.87c2.26-2.09 3.57-5.16 3.57-8.81Z"/>
        <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.87-3c-1.07.72-2.44 1.14-4.06 1.14-3.12 0-5.77-2.11-6.71-4.95H1.29v3.1A11.99 11.99 0 0 0 12 24Z"/>
        <path fill="#FBBC05" d="M5.29 14.28A7.2 7.2 0 0 1 4.91 12c0-.79.14-1.56.38-2.28v-3.1H1.29a12 12 0 0 0 0 10.76l4-3.1Z"/>
        <path fill="#EA4335" d="M12 4.77c1.76 0 3.34.6 4.58 1.79l3.44-3.44A11.53 11.53 0 0 0 12 0 11.99 11.99 0 0 0 1.29 6.62l4 3.1C6.23 6.88 8.88 4.77 12 4.77Z"/>
      </svg>
      <span style={{ fontFamily: "'Product Sans','Helvetica Neue',Arial,sans-serif", fontWeight: 600, fontSize: 15 }}>Pay</span>
    </span>
  );
}

function PayLogos({ k }: { k: string }) {
  if (k === "applepay") return <span className="es20co-paylogo" style={{ background: "#000", color: "#fff" }}><ApplePayMark /></span>;
  if (k === "googlepay") return <span className="es20co-paylogo" style={{ background: "#fff", border: `1px solid ${LINE}` }}><GooglePayMark /></span>;
  if (k === "karta") {
    return (
      <span style={{ display: "inline-flex", gap: 6 }}>
        <span className="es20co-paylogo" style={{ background: "#1a1f71", color: "#fff", fontStyle: "italic", fontWeight: 800, fontSize: 12, letterSpacing: "0.04em" }}>VISA</span>
        <span className="es20co-paylogo" style={{ background: "#fff", border: `1px solid ${LINE}` }} aria-hidden>
          <svg width="30" height="18" viewBox="0 0 30 18"><circle cx="12" cy="9" r="7" fill="#eb001b"/><circle cx="18" cy="9" r="7" fill="#f79e1b" fillOpacity="0.9"/></svg>
        </span>
      </span>
    );
  }
  if (k === "cod") {
    return (
      <span className="es20co-paylogo" style={{ background: "#fff", border: `1px solid ${LINE}`, color: COCOA }} aria-hidden>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><rect x="2" y="6" width="20" height="12" rx="2.5"/><circle cx="12" cy="12" r="2.6"/></svg>
      </span>
    );
  }
  return (
    <span className="es20co-paylogo" style={{ background: "#fff", border: `1px solid ${LINE}`, color: COCOA }} aria-hidden>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 10h18M5 10v10M19 10v10M3 20h18M12 3l9 7H3z"/></svg>
    </span>
  );
}

function ShipIcon({ k }: { k: string }) {
  const common = { width: 20, height: 20, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  if (k.includes("box") || k.includes("zasilkovna")) return <svg {...common}><path d="M21 8l-9-5-9 5v8l9 5 9-5z"/><path d="M3 8l9 5 9-5M12 13v8"/></svg>;
  if (k.includes("posta")) return <svg {...common}><rect x="2" y="5" width="20" height="14" rx="2.5"/><path d="m3 6 9 7 9-7"/></svg>;
  return <svg {...common}><path d="M3 7h11v10H3zM14 10h4l3 3v4h-7z"/><circle cx="7" cy="19" r="1.6"/><circle cx="17.5" cy="19" r="1.6"/></svg>;
}

export function Eshop20Checkout({ tenantSlug, initialCart, shippingMethods, paymentMethods }: Props) {
  const [form, setForm] = useState({ email: "", firstName: "", lastName: "", street: "", zip: "", city: "", phone: "" });
  const [shipping, setShipping] = useState(shippingMethods[0]?.key ?? "");
  const [payment, setPayment] = useState(paymentMethods[0]?.key ?? "");
  const [consent, setConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [couponInput, setCouponInput] = useState("");
  const [coupon, setCoupon] = useState<{ code: string; discount_cents: number; free_shipping: boolean } | null>(null);
  const [couponMsg, setCouponMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [couponBusy, setCouponBusy] = useState(false);
  const [expressHint, setExpressHint] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [key]: e.target.value });

  const shippingCents = useMemo(() => {
    const m = shippingMethods.find((x) => x.key === shipping);
    if (!m) return 0;
    if (m.free_above_cents != null && initialCart.subtotal_cents >= m.free_above_cents) return 0;
    return m.price_cents;
  }, [shipping, shippingMethods, initialCart.subtotal_cents]);

  const paymentFee = paymentMethods.find((x) => x.key === payment)?.fee_cents ?? 0;
  const effectiveShipping = coupon?.free_shipping ? 0 : shippingCents;
  const discountCents = Math.min(coupon?.discount_cents ?? 0, initialCart.subtotal_cents);
  const total = initialCart.subtotal_cents - discountCents + effectiveShipping + paymentFee;
  const itemCount = initialCart.items.reduce((s, i) => s + i.qty, 0);

  async function applyCoupon() {
    const code = couponInput.trim();
    if (!code || couponBusy) return;
    setCouponBusy(true);
    setCouponMsg(null);
    try {
      const res = await fetch(`/api/demo/${tenantSlug}/shop/coupons`, {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ code }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Kupón se nepodařilo ověřit");
      setCoupon({ code: data.code, discount_cents: data.discount_cents, free_shipping: data.free_shipping });
      setCouponMsg({ ok: true, text: `Kód ${data.code} uplatněn.` });
      setCouponInput("");
    } catch (err) {
      setCouponMsg({ ok: false, text: err instanceof Error ? err.message : "Kupón se nepodařilo ověřit" });
    } finally {
      setCouponBusy(false);
    }
  }

  function pickExpress(key: "applepay" | "googlepay") {
    if (paymentMethods.some((m) => m.key === key)) setPayment(key);
    setExpressHint("Expresní pokladna — doplňte prosím kontakt a doručení níže, platba je předvybraná.");
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;
    setError(null);
    if (!consent) { setError("Potvrďte prosím souhlas s obchodními podmínkami."); return; }
    setSubmitting(true);
    try {
      const res = await fetch(`/api/demo/${tenantSlug}/shop/checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email,
          phone: form.phone || undefined,
          name: [form.firstName, form.lastName].filter(Boolean).join(" "),
          street: form.street,
          city: form.city,
          zip: form.zip,
          shipping_method: shipping,
          payment_method: payment,
          consent: true,
          coupon_code: coupon?.code,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Objednávku se nepodařilo odeslat");
      window.dispatchEvent(new CustomEvent("webero-cart-updated"));
      window.location.href = data.redirect;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Objednávku se nepodařilo odeslat");
      setSubmitting(false);
    }
  }

  if (!initialCart.items.length) {
    return (
      <div className="mx-auto flex max-w-[1200px] flex-col items-center px-5 py-24 text-center" style={{ fontFamily: SANS, color: INK }}>
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Baloo+2:wght@600;700;800&family=Figtree:wght@400;500;600;700;800&display=swap" />
        <p style={{ fontFamily: HEAD, fontWeight: 800, fontSize: 24, color: COCOA, textTransform: "uppercase", letterSpacing: "0.02em" }}>Košík zeje prázdnotou</p>
        <p className="mt-2 text-[15px]" style={{ color: MUTED }}>Není co objednat — hoďte do něj něco veselého.</p>
        <Link href={`/demo/${tenantSlug}/obchod`} className="mt-7 rounded-full px-8 py-3.5 text-[15px] font-extrabold transition hover:brightness-95" style={{ background: PINK, color: COCOA, fontFamily: HEAD }}>
          Zpět do obchodu
        </Link>
      </div>
    );
  }

  const inputStyle: React.CSSProperties = {
    height: 50, width: "100%", borderRadius: 14, border: `1.5px solid ${LINE}`, background: "#fff",
    padding: "0 16px", fontSize: 14.5, color: INK, outline: "none", fontFamily: SANS, transition: "border-color .15s",
  };
  const legendStyle: React.CSSProperties = {
    fontFamily: HEAD, fontWeight: 800, fontSize: 19, color: COCOA, textTransform: "uppercase", letterSpacing: "0.02em",
  };

  return (
    <div style={{ fontFamily: SANS, color: INK }}>
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Baloo+2:wght@600;700;800&family=Figtree:wght@400;500;600;700;800&display=swap" />
      <style>{`
        .es20co-input:focus { border-color: ${COCOA} !important; }
        .es20co-radio { display: flex; align-items: center; gap: 14px; border: 1.5px solid ${LINE}; background: #fff; border-radius: 16px; padding: 14px 16px; cursor: pointer; transition: border-color .15s, background .15s; }
        .es20co-radio[data-active="true"] { border-color: ${COCOA}; background: #fdf3f9; }
        .es20co-dot { width: 20px; height: 20px; border-radius: 999px; border: 2px solid #d8c9bb; background: #fff; flex: none; display: grid; place-items: center; transition: border-color .15s; }
        .es20co-radio[data-active="true"] .es20co-dot { border-color: ${COCOA}; }
        .es20co-radio[data-active="true"] .es20co-dot::after { content: ""; width: 10px; height: 10px; border-radius: 999px; background: ${COCOA}; }
        .es20co-paylogo { display: inline-flex; align-items: center; justify-content: center; min-width: 46px; height: 28px; padding: 0 8px; border-radius: 6px; }
        .es20co-express { display: flex; align-items: center; justify-content: center; gap: 6px; height: 52px; border-radius: 14px; background: #000; color: #fff; font-weight: 600; cursor: pointer; border: none; width: 100%; transition: transform .12s, opacity .12s; }
        .es20co-express:hover { opacity: .88; transform: translateY(-1px); }
      `}</style>

      <div className="mx-auto grid max-w-[1200px] gap-10 px-5 py-10 lg:grid-cols-[1fr_420px]">
        {/* ── Levý sloupec ── */}
        <div>
          {/* Expresní pokladna */}
          <p className="text-center text-[13.5px]" style={{ color: MUTED }}>
            Expresní pokladna — platba je předvybraná, stačí doplnit doručení
          </p>
          <div className="mt-3 grid grid-cols-2 gap-4">
            <button type="button" className="es20co-express" onClick={() => pickExpress("applepay")} aria-label="Zaplatit přes Apple Pay">
              <ApplePayMark />
            </button>
            <button type="button" className="es20co-express" style={{ background: "#fff", color: INK, border: `1.5px solid #d8d8d8` }} onClick={() => pickExpress("googlepay")} aria-label="Zaplatit přes Google Pay">
              <GooglePayMark />
            </button>
          </div>
          {expressHint && (
            <p className="mt-3 rounded-xl px-4 py-2.5 text-center text-[13px] font-semibold" style={{ background: "#e7f5e9", color: GREEN }}>{expressHint}</p>
          )}
          <div className="my-7 flex items-center gap-4" aria-hidden>
            <span className="h-px flex-1" style={{ background: LINE }} />
            <span className="text-[12.5px] font-bold tracking-[0.14em]" style={{ color: MUTED }}>NEBO</span>
            <span className="h-px flex-1" style={{ background: LINE }} />
          </div>

          <form onSubmit={submit} ref={formRef}>
            {/* Kontakt */}
            <div className="flex items-baseline justify-between">
              <h2 style={legendStyle}>Kontakt</h2>
              <span className="text-[13px] font-semibold underline underline-offset-2" style={{ color: MUTED }}>Nakupujete jako host</span>
            </div>
            <input className="es20co-input mt-3" style={inputStyle} type="email" required placeholder="E-mail" value={form.email} onChange={set("email")} autoComplete="email" />

            {/* Doručení */}
            <h2 className="mt-9" style={legendStyle}>Doručení</h2>
            <div className="mt-3 grid gap-3.5">
              <div className="relative">
                <span className="absolute left-4 top-1.5 text-[11px] font-semibold" style={{ color: MUTED }}>Země/region</span>
                <select className="es20co-input" style={{ ...inputStyle, height: 54, paddingTop: 16, appearance: "none" }} defaultValue="cz" aria-label="Země/region">
                  <option value="cz">Česko</option>
                  <option value="sk">Slovensko</option>
                </select>
                <svg className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={MUTED} strokeWidth="2.2" strokeLinecap="round"><path d="m6 9 6 6 6-6" /></svg>
              </div>
              <div className="grid grid-cols-2 gap-3.5">
                <input className="es20co-input" style={inputStyle} required placeholder="Křestní jméno" value={form.firstName} onChange={set("firstName")} autoComplete="given-name" />
                <input className="es20co-input" style={inputStyle} required placeholder="Příjmení" value={form.lastName} onChange={set("lastName")} autoComplete="family-name" />
              </div>
              <input className="es20co-input" style={inputStyle} required placeholder="Adresa" value={form.street} onChange={set("street")} autoComplete="street-address" />
              <div className="grid grid-cols-2 gap-3.5">
                <input className="es20co-input" style={inputStyle} required placeholder="PSČ" value={form.zip} onChange={set("zip")} autoComplete="postal-code" />
                <input className="es20co-input" style={inputStyle} required placeholder="Město" value={form.city} onChange={set("city")} autoComplete="address-level2" />
              </div>
              <input className="es20co-input" style={inputStyle} type="tel" placeholder="Telefon" value={form.phone} onChange={set("phone")} autoComplete="tel" />
            </div>
            <p className="mt-2.5 text-[12.5px] leading-relaxed" style={{ color: MUTED }}>
              Pro správné doručení zadejte telefonní číslo ve formátu +420. Za předvolbou země nesmí následovat nula.
            </p>

            {/* Metoda dopravy */}
            <h2 className="mt-9" style={legendStyle}>Metoda dopravy</h2>
            <div className="mt-3 grid gap-2.5">
              {shippingMethods.map((m) => {
                const free = m.free_above_cents != null && initialCart.subtotal_cents >= m.free_above_cents;
                return (
                  <label key={m.key} className="es20co-radio" data-active={shipping === m.key}>
                    <input type="radio" name="es20-ship" className="sr-only" checked={shipping === m.key} onChange={() => setShipping(m.key)} />
                    <span className="es20co-dot" aria-hidden />
                    <span style={{ color: COCOA }} aria-hidden><ShipIcon k={m.key} /></span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[14.5px] font-bold" style={{ color: INK }}>{m.label}</span>
                      {m.description && <span className="block text-[12.5px]" style={{ color: MUTED }}>{m.description}</span>}
                    </span>
                    <span className="text-[14px] font-extrabold" style={{ color: free ? GREEN : INK }}>
                      {free ? "Zdarma" : czk(m.price_cents)}
                    </span>
                  </label>
                );
              })}
            </div>

            {/* Platba */}
            <h2 className="mt-9" style={legendStyle}>Platba</h2>
            <p className="mt-1 text-[13px]" style={{ color: MUTED }}>Všechny transakce jsou zabezpečené a šifrované.</p>
            <div className="mt-3 grid gap-2.5">
              {paymentMethods.map((m) => (
                <label key={m.key} className="es20co-radio" data-active={payment === m.key}>
                  <input type="radio" name="es20-pay" className="sr-only" checked={payment === m.key} onChange={() => setPayment(m.key)} />
                  <span className="es20co-dot" aria-hidden />
                  <span className="min-w-0 flex-1">
                    <span className="block text-[14.5px] font-bold" style={{ color: INK }}>
                      {m.label}
                      {m.fee_cents > 0 && <span className="ml-2 text-[12.5px] font-bold" style={{ color: RED }}>+{czk(m.fee_cents)}</span>}
                    </span>
                    {m.description && <span className="block text-[12.5px]" style={{ color: MUTED }}>{m.description}</span>}
                  </span>
                  <PayLogos k={m.key} />
                </label>
              ))}
            </div>

            {/* Souhlas + submit */}
            <label className="mt-7 flex cursor-pointer items-start gap-3 rounded-2xl px-4 py-3.5 text-[13px] leading-relaxed" style={{ background: CREAM, border: `1.5px solid ${LINE}`, color: MUTED }}>
              <input type="checkbox" className="mt-0.5 h-4.5 w-4.5 accent-[#4b2413]" style={{ width: 18, height: 18 }} checked={consent} onChange={(e) => setConsent(e.target.checked)} />
              <span>
                Odesláním objednávky souhlasím s <span className="font-semibold underline underline-offset-2" style={{ color: INK }}>obchodními podmínkami</span> a se{" "}
                <span className="font-semibold underline underline-offset-2" style={{ color: INK }}>zpracováním osobních údajů</span>. (demo)
              </span>
            </label>
            {error && <p className="mt-3 rounded-xl px-4 py-3 text-[13.5px] font-semibold" style={{ background: "#fdecec", color: RED }}>{error}</p>}
            <button
              type="submit"
              disabled={submitting}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-full py-4 text-[16.5px] font-extrabold transition hover:brightness-95 disabled:opacity-60"
              style={{ background: submitting ? PINK_DK : PINK, color: COCOA, fontFamily: HEAD, letterSpacing: "0.01em" }}
            >
              {submitting ? "Odesíláme objednávku…" : <>Zaplatit {czk(total)} <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M5 12h14M13 6l6 6-6 6" /></svg></>}
            </button>
            <div className="mt-6 flex flex-wrap gap-x-5 gap-y-1.5 text-[12.5px] font-semibold" style={{ color: MUTED }}>
              <span className="underline underline-offset-2">Vrácení a reklamace</span>
              <span className="underline underline-offset-2">Zásady ochrany osobních údajů</span>
              <span className="underline underline-offset-2">Podmínky služby</span>
              <span className="underline underline-offset-2">Kontakt</span>
            </div>
          </form>
        </div>

        {/* ── Pravý souhrn ── */}
        <aside>
          <div className="rounded-3xl p-6 lg:sticky lg:top-6" style={{ background: CREAM, border: `1.5px solid ${LINE}` }}>
            <ul className="grid gap-4">
              {initialCart.items.map((it) => (
                <li key={it.id} className="flex items-center gap-4">
                  <span className="relative block h-16 w-16 flex-none overflow-hidden rounded-2xl" style={{ background: "#fff", border: `1.5px solid ${LINE}` }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    {it.image_url && <img src={it.image_url} alt="" className="h-full w-full object-cover" />}
                    <span className="absolute -right-0 -top-0 flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[11px] font-extrabold text-white" style={{ background: COCOA }}>{it.qty}</span>
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[14px] font-bold" style={{ color: INK }}>{it.title}</span>
                    {it.variant_title && <span className="block text-[12.5px]" style={{ color: MUTED }}>{it.variant_title}</span>}
                  </span>
                  <span className="text-[14px] font-extrabold" style={{ color: INK }}>{czk(it.line_total_cents)}</span>
                </li>
              ))}
            </ul>

            <div className="mt-6 flex gap-2.5">
              <input
                className="es20co-input"
                style={{ ...inputStyle, height: 46, flex: 1 }}
                placeholder="Slevový kód"
                value={couponInput}
                onChange={(e) => setCouponInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); applyCoupon(); } }}
              />
              <button type="button" onClick={applyCoupon} disabled={couponBusy} className="rounded-full px-5 text-[13.5px] font-extrabold text-white transition hover:brightness-110 disabled:opacity-60" style={{ background: COCOA, fontFamily: HEAD }}>
                Použít
              </button>
            </div>
            {couponMsg && <p className="mt-2 text-[12.5px] font-semibold" style={{ color: couponMsg.ok ? GREEN : RED }}>{couponMsg.text}</p>}

            <dl className="mt-6 grid gap-2 text-[14px]" style={{ color: INK }}>
              <div className="flex justify-between">
                <dt style={{ color: MUTED }}>Mezisoučet · {itemCount} {itemCount === 1 ? "položka" : itemCount < 5 ? "položky" : "položek"}</dt>
                <dd className="font-bold">{czk(initialCart.subtotal_cents)}</dd>
              </div>
              {discountCents > 0 && (
                <div className="flex justify-between">
                  <dt style={{ color: MUTED }}>Sleva {coupon?.code}</dt>
                  <dd className="font-bold" style={{ color: GREEN }}>−{czk(discountCents)}</dd>
                </div>
              )}
              <div className="flex justify-between">
                <dt style={{ color: MUTED }}>Doprava</dt>
                <dd className="font-bold" style={{ color: effectiveShipping === 0 ? GREEN : INK }}>{effectiveShipping === 0 ? "Zdarma" : czk(effectiveShipping)}</dd>
              </div>
              {paymentFee > 0 && (
                <div className="flex justify-between">
                  <dt style={{ color: MUTED }}>Dobírka</dt>
                  <dd className="font-bold">{czk(paymentFee)}</dd>
                </div>
              )}
            </dl>
            <div className="mt-4 flex items-baseline justify-between border-t pt-4" style={{ borderColor: LINE }}>
              <span style={{ fontFamily: HEAD, fontWeight: 800, fontSize: 19, color: COCOA, textTransform: "uppercase" }}>Celkem</span>
              <span className="text-[24px] font-extrabold" style={{ color: COCOA }}>{czk(total)}</span>
            </div>
            <p className="mt-1 text-right text-[12px]" style={{ color: MUTED }}>Včetně DPH · Odesíláme do 1–2 pracovních dnů</p>

            <div className="mt-5 rounded-2xl bg-white px-4 py-3.5 text-center" style={{ border: `1.5px solid ${LINE}` }}>
              <p className="text-[12.5px] font-bold" style={{ color: INK }}>Víc než 4M spokojených zákazníků</p>
              <p className="mt-1 flex items-center justify-center gap-3 text-[12px] font-semibold" style={{ color: GREEN }}>
                <span className="inline-flex items-center gap-1">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M3 12a9 9 0 1 0 3-6.7L3 8" /><path d="M3 3v5h5" /></svg>
                  Vrácení až do 100 dnů
                </span>
                <span className="inline-flex items-center gap-1">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M12 2 4 5.5v5.1c0 5 3.4 9.7 8 10.9 4.6-1.2 8-5.9 8-10.9V5.5z" /><path d="m9 12 2 2 4-4" /></svg>
                  Zaručeně bezpečný nákup
                </span>
              </p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
