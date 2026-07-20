"use client";

/**
 * Webero Commerce — checkout formulář (Fáze 4).
 * Kontakt → adresa → doprava → platba → souhrn. Ceny přepočítává server,
 * tady jen zrcadlíme stejná pravidla pro okamžitou zpětnou vazbu.
 */

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

interface CartItemLite {
  id: number;
  title: string;
  variant_title: string | null;
  qty: number;
  line_total_cents: number;
  image_url: string | null;
}

interface ShippingMethod {
  key: string;
  label: string;
  description?: string;
  price_cents: number;
  free_above_cents: number | null;
}

interface PaymentMethod {
  key: string;
  label: string;
  description?: string;
  fee_cents: number;
}

interface Props {
  tenantSlug: string;
  currency: string;
  initialCart: { items: CartItemLite[]; subtotal_cents: number };
  shippingMethods: ShippingMethod[];
  paymentMethods: PaymentMethod[];
  /** Automatické slevy z aktivních modulů — spočtené serverem */
  autoDiscounts?: { label: string; amount_cents: number }[];
  /** Dárek k objednávce (modul darky-k-objednavce) */
  giftLabel?: string | null;
  /** Modul ares-ico: tlačítko načtení firmy z ARES */
  enableAres?: boolean;
  /** Modul rozsirena-objednavka: dárkové balení + termín doručení */
  enableExtended?: boolean;
}

function czk(cents: number, currency = "CZK"): string {
  return new Intl.NumberFormat("cs-CZ", { style: "currency", currency, maximumFractionDigits: 0 })
    .format(cents / 100);
}

const inputCls = "h-11 w-full rounded-lg border border-neutral-200 bg-white px-3.5 text-[14px] text-neutral-950 outline-none transition focus:border-neutral-900 focus:ring-2 focus:ring-neutral-900/5";
const labelCls = "mb-1 block text-[12px] font-semibold text-neutral-600";

function MethodIcon({ k }: { k: string }) {
  const key = k.toLowerCase();
  const common = { width: 20, height: 20, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  if (key.includes("zasilkovna") || key.includes("pickup") || key.includes("balik") || key.includes("vydej")) {
    return <svg {...common}><path d="M21 8l-9-5-9 5v8l9 5 9-5z" /><path d="M3 8l9 5 9-5M12 13v8" /></svg>;
  }
  if (key.includes("osobni") || key.includes("store")) {
    return <svg {...common}><path d="M4 9l8-5 8 5v11H4z" /><path d="M9 20v-6h6v6" /></svg>;
  }
  if (key.includes("gopay") || key.includes("card") || key.includes("karta") || key.includes("online")) {
    return <svg {...common}><rect x="2" y="5" width="20" height="14" rx="2.5" /><path d="M2 10h20" /></svg>;
  }
  if (key.includes("prevod") || key.includes("bank") || key.includes("transfer")) {
    return <svg {...common}><path d="M3 10h18M5 10V20M19 10v10M3 20h18M12 3l9 7H3z" /></svg>;
  }
  if (key.includes("dobirka") || key.includes("cod") || key.includes("cash") || key.includes("hotov")) {
    return <svg {...common}><rect x="2" y="6" width="20" height="12" rx="2.5" /><circle cx="12" cy="12" r="2.6" /></svg>;
  }
  return <svg {...common}><path d="M3 7h11v10H3zM14 10h4l3 3v4h-7z" /><circle cx="7" cy="19" r="1.6" /><circle cx="17.5" cy="19" r="1.6" /></svg>;
}

export function CheckoutClient({ tenantSlug, currency, initialCart, shippingMethods, paymentMethods, autoDiscounts = [], giftLabel = null, enableAres = false, enableExtended = false }: Props) {
  const [form, setForm] = useState({
    email: "", phone: "", name: "", street: "", city: "", zip: "",
    company: "", ico: "", dic: "", note: "",
  });
  const [showCompany, setShowCompany] = useState(false);
  const [showNote, setShowNote] = useState(false);
  const [shipping, setShipping] = useState(shippingMethods[0]?.key ?? "");
  const [payment, setPayment] = useState(paymentMethods[0]?.key ?? "");
  const [consent, setConsent] = useState(false);
  const [marketing, setMarketing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [customerEmail, setCustomerEmail] = useState<string | null>(null);
  const [couponInput, setCouponInput] = useState("");
  const [coupon, setCoupon] = useState<{ code: string; discount_cents: number; free_shipping: boolean } | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [couponBusy, setCouponBusy] = useState(false);
  const [aresBusy, setAresBusy] = useState(false);
  const [aresError, setAresError] = useState<string | null>(null);
  const [giftWrap, setGiftWrap] = useState(false);
  const [deliveryDate, setDeliveryDate] = useState("");

  async function loadFromAres() {
    const ico = form.ico.replace(/\s/g, "");
    if (!/^\d{8}$/.test(ico)) { setAresError("Zadejte platné 8místné IČO"); return; }
    setAresBusy(true);
    setAresError(null);
    try {
      const res = await fetch(`/api/demo/${tenantSlug}/shop/ares?ico=${ico}`);
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Firmu se nepodařilo najít");
      setForm((f) => ({
        ...f,
        company: data.company || f.company,
        dic: data.dic || f.dic,
        street: f.street || data.street || "",
        city: f.city || data.city || "",
        zip: f.zip || data.zip || "",
      }));
    } catch (err) {
      setAresError(err instanceof Error ? err.message : "Firmu se nepodařilo najít");
    } finally {
      setAresBusy(false);
    }
  }

  // Přihlášený zákazník: předvyplnit kontakt a výchozí adresu z účtu
  useEffect(() => {
    const token = localStorage.getItem("webero_customer_token");
    if (!token) return;
    const headers = { Authorization: `Bearer ${token}` };
    (async () => {
      try {
        const [profRes, addrRes] = await Promise.all([
          fetch(`/api/demo/${tenantSlug}/shop/customer/profile`, { headers }),
          fetch(`/api/demo/${tenantSlug}/shop/customer/addresses`, { headers }),
        ]);
        if (!profRes.ok) return; // neplatný/expirovaný token → nechat guest checkout
        const prof = await profRes.json();
        const p = prof.profile;
        if (!p) return;
        setCustomerEmail(p.email ?? null);
        const addrs = addrRes.ok ? (await addrRes.json()).addresses ?? [] : [];
        const a = addrs.find((x: { is_default: boolean }) => x.is_default) ?? addrs[0];
        setForm((f) => ({
          ...f,
          email: f.email || p.email || "",
          phone: f.phone || a?.phone || p.phone || "",
          name: f.name || a?.name || [p.first_name, p.last_name].filter(Boolean).join(" "),
          street: f.street || a?.street || "",
          city: f.city || a?.city || "",
          zip: f.zip || a?.zip || "",
        }));
      } catch { /* offline/API chyba → guest checkout */ }
    })();
  }, [tenantSlug]);

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm({ ...form, [key]: e.target.value });

  const shippingCents = useMemo(() => {
    const m = shippingMethods.find((x) => x.key === shipping);
    if (!m) return 0;
    if (m.free_above_cents != null && initialCart.subtotal_cents >= m.free_above_cents) return 0;
    return m.price_cents;
  }, [shipping, shippingMethods, initialCart.subtotal_cents]);

  const paymentFee = paymentMethods.find((x) => x.key === payment)?.fee_cents ?? 0;
  const effectiveShipping = coupon?.free_shipping ? 0 : shippingCents;
  const autoDiscountTotal = autoDiscounts.reduce((s, d) => s + d.amount_cents, 0);
  const discountCents = Math.min((coupon?.discount_cents ?? 0) + autoDiscountTotal, initialCart.subtotal_cents);
  const total = initialCart.subtotal_cents - discountCents + effectiveShipping + paymentFee;
  const itemCount = initialCart.items.reduce((s, i) => s + i.qty, 0);

  // Modul promo-kod-detail: kód uložený z detailu produktu se uplatní automaticky
  useEffect(() => {
    let saved: string | null = null;
    try { saved = localStorage.getItem(`webero_promo_code_${tenantSlug}`); } catch { /* noop */ }
    if (!saved) return;
    (async () => {
      try {
        const res = await fetch(`/api/demo/${tenantSlug}/shop/coupons`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code: saved }),
        });
        const data = await res.json().catch(() => ({}));
        if (res.ok) {
          setCoupon({ code: data.code, discount_cents: data.discount_cents, free_shipping: data.free_shipping });
          try { localStorage.removeItem(`webero_promo_code_${tenantSlug}`); } catch { /* noop */ }
        }
      } catch { /* nevalidní kód tiše ignorujeme, zákazník ho může zadat ručně */ }
    })();
     
  }, [tenantSlug]);

  async function applyCoupon() {
    const code = couponInput.trim();
    if (!code || couponBusy) return;
    setCouponBusy(true);
    setCouponError(null);
    try {
      const res = await fetch(`/api/demo/${tenantSlug}/shop/coupons`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Kupón se nepodařilo ověřit");
      setCoupon({ code: data.code, discount_cents: data.discount_cents, free_shipping: data.free_shipping });
      setCouponInput("");
    } catch (err) {
      setCouponError(err instanceof Error ? err.message : "Kupón se nepodařilo ověřit");
    } finally {
      setCouponBusy(false);
    }
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
          ...form,
          phone: form.phone || undefined,
          company: showCompany ? form.company || undefined : undefined,
          ico: showCompany ? form.ico || undefined : undefined,
          dic: showCompany ? form.dic || undefined : undefined,
          note: [
            enableExtended && giftWrap ? "🎀 Dárkové balení (+49 Kč zdarma v rámci akce)" : null,
            enableExtended && deliveryDate ? `Preferovaný termín doručení: ${deliveryDate}` : null,
            form.note || null,
          ].filter(Boolean).join("\n") || undefined,
          shipping_method: shipping,
          payment_method: payment,
          consent: true,
          marketing_consent: marketing,
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
      <div className="flex flex-col items-center py-20 text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-neutral-100 text-neutral-400">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1.5" /><circle cx="19" cy="21" r="1.5" /><path d="M2 3h3l2.7 13.4a2 2 0 0 0 2 1.6h8.9a2 2 0 0 0 2-1.6L23 7H6" /></svg>
        </span>
        <p className="mt-5 text-[17px] font-bold text-neutral-950">Košík je prázdný — není co objednat</p>
        <Link href={`/demo/${tenantSlug}/obchod`} className="mt-6 rounded-lg bg-neutral-900 px-6 py-3 text-[14px] font-semibold text-white transition hover:bg-neutral-700">
          Zpět do obchodu
        </Link>
      </div>
    );
  }

  const stepBadge = "flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-neutral-950 text-[13px] font-extrabold text-white";
  const sectionCls = "rounded-2xl border border-neutral-100 bg-white p-5 sm:p-6";
  const h2Cls = "flex items-center gap-2.5 text-[16px] font-extrabold tracking-tight text-neutral-950";

  return (
    <form onSubmit={submit} className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1fr)_400px]">
      <div className="space-y-4">
        {/* Kontakt */}
        <div className={sectionCls}>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className={h2Cls}><span className={stepBadge}>1</span>Kontaktní údaje</h2>
            {customerEmail && (
              <span className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-[12px] font-bold text-emerald-700">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 13l4 4L19 7" /></svg>
                Přihlášen jako {customerEmail}
              </span>
            )}
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div>
              <label className={labelCls}>E-mail *</label>
              <input
                type="email" required className={inputCls} value={form.email} onChange={set("email")}
                autoComplete="email" placeholder="jan.novak@email.cz"
                onBlur={() => {
                  // Modul opusteny-kosik: tiché uložení e-mailu ke košíku pro upomínky
                  if (form.email.includes("@")) {
                    fetch(`/api/demo/${tenantSlug}/shop/cart/email`, {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ email: form.email }),
                    }).catch(() => {});
                  }
                }}
              />
            </div>
            <div>
              <label className={labelCls}>Telefon</label>
              <input type="tel" className={inputCls} value={form.phone} onChange={set("phone")} autoComplete="tel" placeholder="+420" />
            </div>
          </div>
        </div>

        {/* Adresa */}
        <div className={sectionCls}>
          <h2 className={h2Cls}><span className={stepBadge}>2</span>Doručovací adresa</h2>
          <div className="mt-4 space-y-3">
            <div>
              <label className={labelCls}>Jméno a příjmení *</label>
              <input required className={inputCls} value={form.name} onChange={set("name")} autoComplete="name" />
            </div>
            <div>
              <label className={labelCls}>Ulice a číslo popisné *</label>
              <input required className={inputCls} value={form.street} onChange={set("street")} autoComplete="street-address" />
            </div>
            <div className="grid gap-3 sm:grid-cols-[1fr_140px]">
              <div>
                <label className={labelCls}>Město *</label>
                <input required className={inputCls} value={form.city} onChange={set("city")} autoComplete="address-level2" />
              </div>
              <div>
                <label className={labelCls}>PSČ *</label>
                <input required className={inputCls} value={form.zip} onChange={set("zip")} autoComplete="postal-code" />
              </div>
            </div>
            <button type="button" onClick={() => setShowCompany(!showCompany)}
              className="text-[13px] font-semibold text-neutral-500 underline underline-offset-2 transition hover:text-neutral-950">
              {showCompany ? "− Skrýt firemní údaje" : "+ Nakupuji na firmu (IČO/DIČ)"}
            </button>
            {showCompany && (
              <div className="grid gap-3 rounded-xl bg-neutral-50 p-4 sm:grid-cols-3">
                <div className="sm:col-span-3">
                  <label className={labelCls}>Název firmy</label>
                  <input className={inputCls} value={form.company} onChange={set("company")} />
                </div>
                <div>
                  <label className={labelCls}>IČO</label>
                  {enableAres ? (
                    <div className="flex gap-2">
                      <input className={inputCls} value={form.ico} onChange={(e) => { setForm({ ...form, ico: e.target.value }); setAresError(null); }} inputMode="numeric" />
                      <button type="button" onClick={loadFromAres} disabled={aresBusy}
                        className="h-11 shrink-0 whitespace-nowrap rounded-lg border border-neutral-900 px-3 text-[12px] font-bold text-neutral-900 transition hover:bg-neutral-900 hover:text-white disabled:opacity-40">
                        {aresBusy ? "Hledám…" : "Načíst z ARES"}
                      </button>
                    </div>
                  ) : (
                    <input className={inputCls} value={form.ico} onChange={set("ico")} />
                  )}
                  {aresError && <p className="mt-1 text-[12px] text-red-600">{aresError}</p>}
                </div>
                <div>
                  <label className={labelCls}>DIČ</label>
                  <input className={inputCls} value={form.dic} onChange={set("dic")} placeholder="CZ…" />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Doprava */}
        <div className={sectionCls}>
          <h2 className={h2Cls}><span className={stepBadge}>3</span>Doprava</h2>
          <div className="mt-4 space-y-2">
            {shippingMethods.map((m) => {
              const free = m.free_above_cents != null && initialCart.subtotal_cents >= m.free_above_cents;
              const price = free ? 0 : m.price_cents;
              const active = shipping === m.key;
              return (
                <label key={m.key} className={`flex cursor-pointer items-center gap-3.5 rounded-xl border p-4 transition ${active ? "border-neutral-950 bg-neutral-50 shadow-sm" : "border-neutral-200 hover:border-neutral-400"}`}>
                  <input type="radio" name="shipping" className="sr-only" checked={active} onChange={() => setShipping(m.key)} />
                  <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition ${active ? "border-neutral-950" : "border-neutral-300"}`}>
                    {active && <span className="h-2.5 w-2.5 rounded-full bg-neutral-950" />}
                  </span>
                  <span className={`shrink-0 ${active ? "text-neutral-950" : "text-neutral-400"}`}><MethodIcon k={`${m.key} ${m.label}`} /></span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[14px] font-bold text-neutral-950">{m.label}</span>
                    {m.description && <span className="block text-[12px] text-neutral-400">{m.description}</span>}
                  </span>
                  <span className={`text-[14px] font-extrabold tabular-nums ${price === 0 ? "text-emerald-600" : "text-neutral-950"}`}>
                    {price === 0 ? "Zdarma" : czk(price, currency)}
                  </span>
                </label>
              );
            })}
          </div>
        </div>

        {/* Platba */}
        <div className={sectionCls}>
          <h2 className={h2Cls}><span className={stepBadge}>4</span>Platba</h2>
          <div className="mt-4 space-y-2">
            {paymentMethods.map((m) => {
              const active = payment === m.key;
              return (
                <label key={m.key} className={`flex cursor-pointer items-center gap-3.5 rounded-xl border p-4 transition ${active ? "border-neutral-950 bg-neutral-50 shadow-sm" : "border-neutral-200 hover:border-neutral-400"}`}>
                  <input type="radio" name="payment" className="sr-only" checked={active} onChange={() => setPayment(m.key)} />
                  <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition ${active ? "border-neutral-950" : "border-neutral-300"}`}>
                    {active && <span className="h-2.5 w-2.5 rounded-full bg-neutral-950" />}
                  </span>
                  <span className={`shrink-0 ${active ? "text-neutral-950" : "text-neutral-400"}`}><MethodIcon k={`${m.key} ${m.label}`} /></span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[14px] font-bold text-neutral-950">{m.label}</span>
                    {m.description && <span className="block text-[12px] text-neutral-400">{m.description}</span>}
                  </span>
                  <span className="text-[14px] font-extrabold tabular-nums text-neutral-950">
                    {m.fee_cents > 0 ? `+ ${czk(m.fee_cents, currency)}` : ""}
                  </span>
                </label>
              );
            })}
          </div>
        </div>

        {/* Rozšířená objednávka (modul rozsirena-objednavka) */}
        {enableExtended && (
          <div className={sectionCls}>
            <h2 className={h2Cls}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="8" width="18" height="13" rx="2" /><path d="M3 12h18M12 8v13M12 8s-1.5-5-5-5a2.5 2.5 0 0 0 0 5M12 8s1.5-5 5-5a2.5 2.5 0 0 1 0 5" /></svg>
              Doplňky objednávky
            </h2>
            <div className="mt-4 space-y-3">
              <label className="flex cursor-pointer items-center gap-2.5 text-[13.5px] text-neutral-700">
                <input type="checkbox" checked={giftWrap} onChange={(e) => setGiftWrap(e.target.checked)} className="h-4 w-4 accent-[#1d9a44]" />
                <span>Zabalit jako dárek <span className="font-semibold text-emerald-600">(nyní zdarma)</span></span>
              </label>
              <div className="max-w-[240px]">
                <label className={labelCls}>Preferovaný termín doručení</label>
                <input type="date" className={inputCls} value={deliveryDate} onChange={(e) => setDeliveryDate(e.target.value)} min={new Date(Date.now() + 86400000).toISOString().slice(0, 10)} />
              </div>
            </div>
          </div>
        )}

        {/* Poznámka */}
        <div className={sectionCls}>
          {showNote ? (
            <div>
              <label className={labelCls}>Poznámka k objednávce</label>
              <textarea className="h-20 w-full rounded-lg border border-neutral-200 bg-white px-3.5 py-2.5 text-[14px] text-neutral-950 outline-none transition focus:border-neutral-900 focus:ring-2 focus:ring-neutral-900/5" value={form.note} onChange={set("note")} autoFocus />
            </div>
          ) : (
            <button type="button" onClick={() => setShowNote(true)}
              className="text-[13px] font-semibold text-neutral-500 underline underline-offset-2 transition hover:text-neutral-950">
              + Přidat poznámku k objednávce
            </button>
          )}
        </div>
      </div>

      {/* Souhrn */}
      <div className="lg:sticky lg:top-[140px] lg:self-start">
        <div className="rounded-2xl border border-neutral-100 bg-white p-5 shadow-[0_4px_24px_rgba(0,0,0,0.04)] sm:p-6">
          <h2 className="text-[16px] font-extrabold tracking-tight text-neutral-950">
            Vaše objednávka <span className="font-semibold text-neutral-400">({itemCount} ks)</span>
          </h2>
          <ul className="mt-4 space-y-3">
            {initialCart.items.map((i) => (
              <li key={i.id} className="flex items-center gap-3 text-[13px]">
                <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-neutral-100">
                  {i.image_url && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={i.image_url} alt="" className="h-full w-full object-cover" />
                  )}
                </div>
                <span className="min-w-0 flex-1">
                  <span className="line-clamp-1 font-semibold text-neutral-950">{i.title}</span>
                  <span className="text-[12px] text-neutral-400">{i.variant_title ? `${i.variant_title} · ` : ""}× {i.qty}</span>
                </span>
                <span className="font-bold tabular-nums text-neutral-950">{czk(i.line_total_cents, currency)}</span>
              </li>
            ))}
          </ul>
          {/* Slevový kupón */}
          <div className="mt-4 border-t border-neutral-100 pt-4">
            {coupon ? (
              <div className="flex items-center justify-between rounded-lg bg-emerald-50 px-3 py-2 ring-1 ring-emerald-200">
                <span className="flex items-center gap-2 text-[13px] font-semibold text-emerald-700">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.6 13.4 12 22l-9-9 8.6-8.6a2 2 0 0 1 1.4-.6H19a2 2 0 0 1 2 2v6.2a2 2 0 0 1-.6 1.4Z" /><circle cx="16" cy="8" r="1" /></svg>
                  Kupón {coupon.code}
                  {coupon.free_shipping ? " — doprava zdarma" : ""}
                </span>
                <button type="button" onClick={() => setCoupon(null)} aria-label="Odebrat kupón"
                  className="text-[12px] font-semibold text-emerald-700/70 underline-offset-2 hover:underline">
                  Odebrat
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <input type="text" value={couponInput} onChange={(e) => { setCouponInput(e.target.value); setCouponError(null); }}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); applyCoupon(); } }}
                  placeholder="Slevový kupón"
                  className="h-10 min-w-0 flex-1 rounded-lg border border-neutral-200 px-3 text-[13px] uppercase placeholder:normal-case placeholder:text-neutral-400 focus:border-[#1d9a44] focus:outline-none" />
                <button type="button" onClick={applyCoupon} disabled={couponBusy || !couponInput.trim()}
                  className="h-10 shrink-0 rounded-lg border border-neutral-900 px-4 text-[13px] font-bold text-neutral-900 transition hover:bg-neutral-900 hover:text-white disabled:opacity-40">
                  {couponBusy ? "Ověřuji…" : "Uplatnit"}
                </button>
              </div>
            )}
            {couponError && <p className="mt-1.5 text-[12px] text-red-600">{couponError}</p>}
          </div>

          <dl className="mt-4 space-y-2 border-t border-neutral-100 pt-4 text-[13.5px]">
            <div className="flex justify-between"><dt className="text-neutral-500">Mezisoučet</dt><dd className="font-semibold tabular-nums text-neutral-900">{czk(initialCart.subtotal_cents, currency)}</dd></div>
            {autoDiscounts.map((d, i) => (
              <div key={i} className="flex justify-between gap-3"><dt className="text-emerald-600">{d.label}</dt><dd className="shrink-0 font-semibold tabular-nums text-emerald-600">−{czk(d.amount_cents, currency)}</dd></div>
            ))}
            {coupon && (coupon.discount_cents ?? 0) > 0 && (
              <div className="flex justify-between"><dt className="text-emerald-600">Sleva ({coupon.code})</dt><dd className="font-semibold tabular-nums text-emerald-600">−{czk(Math.min(coupon.discount_cents, initialCart.subtotal_cents - autoDiscountTotal), currency)}</dd></div>
            )}
            {giftLabel && (
              <div className="flex justify-between gap-3 rounded-lg bg-amber-50 px-2 py-1.5 ring-1 ring-amber-200"><dt className="font-semibold text-amber-700">🎁 {giftLabel}</dt><dd className="shrink-0 font-bold text-amber-700">0 Kč</dd></div>
            )}
            <div className="flex justify-between"><dt className="text-neutral-500">Doprava a platba</dt>
              <dd className={`font-semibold tabular-nums ${effectiveShipping + paymentFee === 0 ? "text-emerald-600" : "text-neutral-900"}`}>
                {effectiveShipping + paymentFee === 0 ? "Zdarma" : czk(effectiveShipping + paymentFee, currency)}
              </dd>
            </div>
          </dl>
          <div className="mt-4 flex items-baseline justify-between border-t border-neutral-100 pt-4">
            <span className="text-[15px] font-bold text-neutral-950">Celkem</span>
            <span className="text-[22px] font-extrabold tabular-nums text-neutral-950">{czk(total, currency)}</span>
          </div>
          <p className="mt-0.5 text-right text-[11.5px] text-neutral-400">vč. DPH</p>

          <label className="mt-4 flex cursor-pointer items-start gap-2.5 text-[12.5px] text-neutral-600">
            <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-0.5 h-4 w-4 accent-[#1d9a44]" required />
            <span>Souhlasím s obchodními podmínkami a zpracováním osobních údajů. *</span>
          </label>
          <label className="mt-2 flex cursor-pointer items-start gap-2.5 text-[12.5px] text-neutral-500">
            <input type="checkbox" checked={marketing} onChange={(e) => setMarketing(e.target.checked)} className="mt-0.5 h-4 w-4 accent-[#1d9a44]" />
            <span>Chci dostávat novinky a slevy e-mailem.</span>
          </label>

          {error && <div className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[13px] text-red-700">{error}</div>}

          <button type="submit" disabled={submitting}
            className="mt-4 flex h-[52px] w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-b from-[#26b854] to-[#1d9a44] text-[15px] font-bold text-white shadow-[0_2px_10px_rgba(29,154,68,0.35)] transition hover:from-[#2cc75c] hover:to-[#21a94b] disabled:opacity-60">
            {submitting ? (
              <>
                <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="3" /><path d="M12 2a10 10 0 0 1 10 10" stroke="#fff" strokeWidth="3" strokeLinecap="round" /></svg>
                Odesílám objednávku…
              </>
            ) : payment === "gopay" ? "Objednat a zaplatit" : "Odeslat objednávku"}
          </button>
          <p className="mt-2 text-center text-[11.5px] text-neutral-400">
            Odesláním objednávky vzniká závazek k platbě.
          </p>

          <div className="mt-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 border-t border-neutral-100 pt-4 text-[11.5px] text-neutral-500">
            <span className="flex items-center gap-1.5">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="10" width="16" height="10" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></svg>
              Zabezpečená platba
            </span>
            <span className="flex items-center gap-1.5">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 3-6.7" /><path d="M3 4v5h5" /></svg>
              Vrácení do 30 dnů
            </span>
          </div>
        </div>
      </div>
    </form>
  );
}
