"use client";

/** Webero Commerce — obsah košíku (Fáze 4). */

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

interface CartItem {
  id: number;
  qty: number;
  product_slug: string;
  product_title: string;
  variant_title: string | null;
  price_cents: number;
  line_total_cents: number;
  stock_qty: number;
  track_stock: boolean;
  stock_policy: string;
  image_url: string | null;
}

interface Cart {
  items: CartItem[];
  item_count: number;
  subtotal_cents: number;
  currency: string;
}

const CART_PAYMENT_LOGOS = [
  { label: "Visa", src: "/assets/eshop-01/logos/payments/visa.webp", className: "h-[12px] w-[39px]" },
  { label: "Mastercard", src: "/assets/eshop-01/logos/payments/mastercard.webp", className: "h-[18px] w-[36px]" },
  { label: "Apple Pay", src: "/assets/eshop-01/logos/payments/apple-pay.webp", className: "h-[16px] w-[47px]" },
  { label: "Google Pay", src: "/assets/eshop-01/logos/payments/google-pay.webp", className: "h-[15px] w-[54px]" },
  { label: "GoPay", src: "/assets/eshop-01/logos/payments/gopay.webp", className: "h-[14px] w-[57px]" },
];

function czk(cents: number, currency = "CZK"): string {
  return new Intl.NumberFormat("cs-CZ", { style: "currency", currency, maximumFractionDigits: 0 })
    .format(cents / 100);
}

export interface UpsellProduct {
  id: number;
  slug: string;
  title: string;
  variant_id: number | null;
  price_cents: number;
  image_url: string | null;
}

interface CartClientProps {
  tenantSlug: string;
  /** Modul doprava-zdarma-lista — bez něj se progress bar nezobrazí */
  showFreeShippingBar?: boolean;
  /** Modul upsell-kosik — tipy na dokoupení */
  upsellProducts?: UpsellProduct[];
  /** Šablonový skin košíku (eshop-06: svetplodu layout — top karusel, info bar, služby, raketa) */
  skin?: string;
  /** Doplňkové služby (checkbox řádky) — reálné produkty ze skryté kategorie */
  services?: UpsellProduct[];
  /** Práh dopravy zdarma v haléřích (default 150000) */
  freeShippingFromCents?: number;
}

export function CartClient({ tenantSlug, showFreeShippingBar = false, upsellProducts = [], skin, services = [], freeShippingFromCents }: CartClientProps) {
  const [cart, setCart] = useState<Cart | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busyItem, setBusyItem] = useState<number | null>(null);
  const [busyUpsell, setBusyUpsell] = useState<number | null>(null);
  // eshop-08 (bonami): rezervační odpočet „Zboží rezervujeme ještě mm:ss"
  const [reserveLeft, setReserveLeft] = useState(20 * 60);
  useEffect(() => {
    if (skin !== "eshop-08") return;
    const t = setInterval(() => setReserveLeft((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, [skin]);
  const base = `/api/demo/${tenantSlug}/shop`;
  const storeBase = `/demo/${tenantSlug}/obchod`;

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

  async function addUpsell(p: UpsellProduct) {
    if (!p.variant_id || busyUpsell) return;
    setBusyUpsell(p.id);
    setError(null);
    try {
      const res = await fetch(`${base}/cart/items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ variant_id: p.variant_id, qty: 1 }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Přidání selhalo");
      setCart(data.cart);
      window.dispatchEvent(new CustomEvent("webero-cart-updated"));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Přidání selhalo");
    } finally {
      setBusyUpsell(null);
    }
  }

  async function setQty(itemId: number, qty: number) {
    setBusyItem(itemId);
    setError(null);
    try {
      const res = await fetch(`${base}/cart/items/${itemId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ qty }),
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
  }

  if (!cart) {
    return (
      <div className="flex flex-col items-center py-20 text-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-neutral-200 border-t-neutral-950" />
        <p className="mt-4 text-[14px] text-neutral-400">{error ?? "Načítám košík…"}</p>
      </div>
    );
  }

  if (!cart.items.length) {
    return (
      <div className="flex flex-col items-center py-20 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-neutral-100 text-neutral-300">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M3 4h2l2.4 12.2A1.5 1.5 0 0 0 8.9 17.4h8.8a1.5 1.5 0 0 0 1.5-1.2L21 8H6" /><circle cx="9.5" cy="20.5" r="1.3" /><circle cx="17.5" cy="20.5" r="1.3" /></svg>
        </div>
        <p className="mt-5 text-[18px] font-extrabold tracking-tight text-neutral-950">Váš košík je prázdný</p>
        <p className="mt-1 text-[14px] text-neutral-500">Přidejte si něco pěkného — doprava je od 1 500 Kč zdarma.</p>
        <Link href={storeBase} className="mt-6 inline-flex h-12 items-center rounded-xl bg-neutral-950 px-7 text-[14px] font-semibold text-white transition hover:bg-neutral-800">
          Prohlédnout obchod
        </Link>
      </div>
    );
  }

  const isEs06 = skin === "eshop-06";
  const isEs07 = skin === "eshop-07";
  // eshop-08 "Domea" — bonami košík: timer, chip rezervace, Doporučujeme
  // přikoupit accordion, voucher accordion, Cena produktů celkem / Celkem s DPH,
  // PŘIHLÁŠENÍ PRO RYCHLÝ NÁKUP + POKRAČOVAT K OBJEDNÁVCE
  const isEs08 = skin === "eshop-08";
  // eshop-09 "Mobil Expres" — mp.cz košík: mint skladem řádek s prodejnami,
  // Doporučujeme služby s checkboxy a mint cenami, Rekapitulace + mint CTA
  const isEs09 = skin === "eshop-09";
  // eshop-10 "BOTIQ" — footshop košík: volt progress dopravy zdarma s náklaďákem,
  // ostré rohy, condensed CTA DOPRAVA A PLATBA, MOHLO BY SE TI HODIT s outline PŘIDAT
  const isEs10 = skin === "eshop-10";
  // eshop-12 "PACKA" — petcenter košík: mango progress dopravy zdarma s měřítkem
  // 0→1299, zelené Skladem řádky, mango pill CTA, „S tímto produktem zákazníci
  // nejčastěji kupují" 4-up se zelenými DO KOŠÍKU
  const isEs12 = skin === "eshop-12";
  // eshop-13 "LUNELA" — milagro košík: editorial skin (Hanken Grotesk, ostré
  // rohy, černé CTA se serif labelem, růžový progress dopravy zdarma)
  const isEs13 = skin === "eshop-13";
  const freeShippingFrom = freeShippingFromCents ?? 150000;
  const missing = freeShippingFrom - cart.subtotal_cents;
  const progress = Math.min(100, Math.round((cart.subtotal_cents / freeShippingFrom) * 100));

  const serviceSlugs = new Set(services.map((s) => s.slug));
  const cartServiceItems = cart.items.filter((i) => serviceSlugs.has(i.product_slug));
  const regularItems = isEs06 || isEs07 || isEs09 ? cart.items.filter((i) => !serviceSlugs.has(i.product_slug)) : cart.items;

  async function toggleService(s: UpsellProduct, on: boolean) {
    const existing = cartServiceItems.find((i) => i.product_slug === s.slug);
    if (on && !existing) await addUpsell(s);
    else if (!on && existing) await setQty(existing.id, 0);
  }

  return (
    <div className={`mt-6${isEs10 ? " es10cart" : ""}${isEs12 ? " es12cart" : ""}${isEs13 ? " es13cart" : ""}`} style={isEs10 ? { fontFamily: "'Barlow','Segoe UI',Arial,sans-serif" } : isEs12 ? { fontFamily: "'Nunito','Segoe UI',system-ui,sans-serif" } : isEs13 ? { fontFamily: "'Hanken Grotesk','Segoe UI',system-ui,sans-serif" } : undefined}>
      {isEs12 && <style>{`
        .es12cart-baloo { font-family: 'Baloo 2','Segoe UI',system-ui,sans-serif; }
      `}</style>}
      {isEs13 && <style>{`
        .es13cart [class*="rounded"] { border-radius: 0 !important; }
        .es13cart .es13cart-serif { font-family: 'Playfair Display', Georgia, serif; }
        .es13cart [class*="bg-gradient"] { background: #FFD2D0 !important; }
      `}</style>}
      {isEs10 && <style>{`
        .es10cart [class*="rounded"] { border-radius: 2px !important; }
        .es10cart .es10cart-cond { font-family: 'Barlow Condensed','Arial Narrow',Arial,sans-serif; }
      `}</style>}
      {error && <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-[13px] font-medium text-red-700">{error}</div>}

      {/* eshop-08: rezervační odpočet */}
      {isEs08 && (
        <p className="-mt-1 mb-4 text-right text-[13px] text-neutral-500">
          Zboží rezervujeme ještě{" "}
          <strong className="tabular-nums font-extrabold text-neutral-900">
            {Math.floor(reserveLeft / 60)}:{String(reserveLeft % 60).padStart(2, "0")}
          </strong>
        </p>
      )}

      {/* eshop-06: Doporučujeme dokoupit — světlý box s kartami nad košíkem */}
      {isEs06 && (() => {
        const inCart = new Set(cart.items.map((i) => i.product_slug));
        const tips = upsellProducts.filter((p) => !inCart.has(p.slug) && p.variant_id && !serviceSlugs.has(p.slug)).slice(0, 4);
        if (!tips.length) return null;
        return (
          <div className="mb-8 rounded-2xl bg-[#f5f5f2] p-6 sm:p-8">
            <h2 className="text-[22px] font-extrabold tracking-tight text-neutral-950" style={{ fontFamily: "'Archivo','Helvetica Neue',Arial,sans-serif" }}>
              Doporučujeme dokoupit
            </h2>
            <div className="mt-5 grid grid-cols-2 gap-4 lg:grid-cols-4">
              {tips.map((p) => (
                <div key={p.id} className="group relative rounded-xl bg-white p-3">
                  <Link href={`${storeBase}/${p.slug}`} className="block aspect-square overflow-hidden rounded-lg bg-neutral-50">
                    {p.image_url && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.image_url} alt="" loading="lazy" className="h-full w-full object-cover transition duration-300 group-hover:scale-105" />
                    )}
                  </Link>
                  <Link href={`${storeBase}/${p.slug}`} className="mt-3 line-clamp-2 block text-[13.5px] font-bold leading-snug text-neutral-900 group-hover:underline" style={{ fontFamily: "'Archivo','Helvetica Neue',Arial,sans-serif" }}>
                    {p.title}
                  </Link>
                  <div className="mt-1 flex items-center justify-between">
                    <span className="text-[14px] font-bold tabular-nums text-neutral-950">{czk(p.price_cents, cart.currency)}</span>
                    <button onClick={() => addUpsell(p)} disabled={busyUpsell === p.id}
                      className="flex h-9 w-9 items-center justify-center rounded-full bg-[#21a95c] text-white transition hover:bg-[#188a49] disabled:opacity-50" aria-label={`Přidat ${p.title}`}>
                      {busyUpsell === p.id
                        ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                        : <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })()}

      {/* eshop-06: info bar */}
      {isEs06 && (
        <div className="mb-6 flex items-start gap-3 rounded-xl bg-[#eef7e6] px-5 py-4">
          <span className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-[#1d1d1b] text-white">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="M12 8h.01M11 12h1v4h1"/></svg>
          </span>
          <p className="text-[14px] leading-relaxed text-neutral-800">
            <strong className="font-bold">Zkontrolujte si prosím obsah košíku ještě před odesláním objednávky.</strong>{" "}
            Po zaplacení už ji nepůjde upravit. Děkujeme — a přejeme dobré křupání!
          </p>
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_380px]">
        {/* Položky */}
        <div className="space-y-3">
          {regularItems.map((item, itemIdx) => (
            <div key={item.id} className={`flex items-center gap-4 rounded-2xl border border-neutral-100 bg-white p-4 transition sm:gap-5 ${busyItem === item.id ? "opacity-60" : ""}`}>
              <Link href={`${storeBase}/${item.product_slug}`} className="block h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-neutral-50">
                {item.image_url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.image_url} alt="" className="h-full w-full object-cover" />
                )}
              </Link>
              <div className="min-w-0 flex-1">
                <Link href={`${storeBase}/${item.product_slug}`} className="line-clamp-2 text-[14.5px] font-semibold leading-snug text-neutral-900 hover:underline">
                  {item.product_title}
                </Link>
                {isEs08 && itemIdx === 0 && (
                  <span className="mb-1 inline-block rounded-md bg-[#f4f4f2] px-2 py-0.5 text-[11px] font-bold text-neutral-600">Rezervujeme jen pro ty nejrychlejší</span>
                )}
                {item.variant_title && <div className="mt-0.5 text-[12.5px] text-neutral-400">{item.variant_title}</div>}
                {isEs08 && (() => { const d = new Date(Date.now() + 86400000); return (
                  <div className="mt-0.5 text-[12.5px] font-bold text-[#3d9a50]">Doručíme od {new Intl.DateTimeFormat("cs-CZ", { weekday: "short", day: "numeric", month: "numeric" }).format(d)}</div>
                ); })()}
                {isEs06 && <div className="mt-0.5 text-[12.5px] font-bold text-[#21a95c]">skladem</div>}
                {isEs07 && <div className="mt-0.5 text-[12.5px] font-bold text-[#14a99a]">skladem &gt; 5 ks</div>}
                {isEs09 && <div className="mt-0.5 text-[12.5px] font-bold text-[#0f9d70]">Skladem &gt; 5 ks <span className="font-medium text-[#8b949c]">· ihned na 13 prodejnách</span></div>}
                {isEs10 && <div className="mt-0.5 text-[12.5px] font-bold text-[#1fa05e]">Skladem <span className="font-medium text-[#6f6f6f]">· odesíláme do 24 h</span></div>}
                {isEs12 && (() => { const d = new Date(Date.now() + 86400000); return (
                  <div className="mt-0.5 flex items-center gap-1.5 text-[12.5px] font-extrabold text-[#16a06a]">
                    <span aria-hidden className="inline-block h-2 w-2 rounded-full bg-[#16a06a]" />
                    Skladem <span className="font-semibold text-[#71809a]">· Odesíláme {d.getDate()}.{d.getMonth() + 1}.{d.getFullYear()}</span>
                  </div>
                ); })()}
                <div className="mt-1 text-[12.5px] text-neutral-500 tabular-nums">{czk(item.price_cents, cart.currency)} / ks</div>
                <div className="mt-2 flex items-center gap-3 sm:hidden">
                  <QtyStepper item={item} busy={busyItem === item.id} setQty={setQty} />
                  <span className="text-[14.5px] font-bold tabular-nums">{czk(item.line_total_cents, cart.currency)}</span>
                </div>
              </div>
              <div className="hidden sm:block">
                <QtyStepper item={item} busy={busyItem === item.id} setQty={setQty} />
              </div>
              <div className="hidden w-28 text-right text-[15px] font-bold tabular-nums sm:block">{czk(item.line_total_cents, cart.currency)}</div>
              <button onClick={() => setQty(item.id, 0)} disabled={busyItem === item.id}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-neutral-300 transition hover:bg-red-50 hover:text-red-500" aria-label="Odebrat" title="Odebrat z košíku">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M4 7h16M10 11v6M14 11v6M6 7l1 13a1.5 1.5 0 0 0 1.5 1.3h7A1.5 1.5 0 0 0 17 20l1-13M9 7V5a1.5 1.5 0 0 1 1.5-1.5h3A1.5 1.5 0 0 1 15 5v2" /></svg>
              </button>
            </div>
          ))}

          {/* eshop-06/07/09: doplňkové služby (checkbox řádky) — es09 = mp „Doporučujeme" */}
          {(isEs06 || isEs07 || isEs09) && services.length > 0 && (
            <div className={`mt-5 space-y-1 border-t border-neutral-100 pt-4 ${isEs09 ? "rounded-2xl border border-neutral-100 bg-white p-4 sm:p-5" : ""}`}>
              {isEs09 && (
                <p className="mb-2 flex items-center gap-2.5 text-[15px] font-extrabold text-[#232a30]" style={{ fontFamily: "'Archivo','Helvetica Neue',Arial,sans-serif" }}>
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg" style={{ backgroundColor: "#3ce0a6" }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1d2433" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 10v12M15 5.88L14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2a3.13 3.13 0 0 1 3 3.88z"/></svg>
                  </span>
                  Doporučujeme k nákupu
                </p>
              )}
              {services.map((s) => {
                const checked = cartServiceItems.some((i) => i.product_slug === s.slug);
                return (
                  <label key={s.id} className="flex cursor-pointer items-center gap-3.5 rounded-xl px-2 py-3 transition hover:bg-neutral-50">
                    <input
                      type="checkbox"
                      checked={checked}
                      disabled={busyUpsell === s.id}
                      onChange={(e) => toggleService(s, e.target.checked)}
                      className={`h-[18px] w-[18px] flex-shrink-0 rounded ${isEs09 ? "accent-[#0f9d70]" : "accent-[#21a95c]"}`}
                    />
                    {s.image_url && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={s.image_url} alt="" loading="lazy" className="h-12 w-12 flex-shrink-0 rounded-lg object-cover" />
                    )}
                    <span className="min-w-0 flex-1 text-[14px] font-semibold text-neutral-900">{s.title}</span>
                    <span className={`text-[14px] font-bold tabular-nums ${isEs09 ? "text-[#0f9d70]" : "text-neutral-950"}`}>{czk(s.price_cents, cart.currency)}</span>
                  </label>
                );
              })}
            </div>
          )}

          {/* eshop-06: raketa — k dopravě zdarma */}
          {isEs06 && (
            <div className="mt-5 flex items-center gap-4 border-t border-neutral-100 pt-5">
              <span className="flex h-[52px] w-[52px] flex-shrink-0 items-center justify-center rounded-full bg-[#eef7e6]">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1d1d1b" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/></svg>
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[14px] font-semibold text-neutral-900">
                  {missing > 0
                    ? <>K dopravě zdarma chybí <strong className="font-extrabold">{czk(missing, cart.currency)}</strong></>
                    : <strong className="font-extrabold text-[#188a49]">Máte dopravu zdarma! 🎉</strong>}
                </p>
                <div className="mt-2 h-[7px] overflow-hidden rounded-full bg-neutral-200">
                  <div className={`h-full rounded-full transition-all duration-500 ${missing > 0 ? "bg-[#1d1d1b]" : "bg-[#21a95c]"}`} style={{ width: `${progress}%` }} />
                </div>
              </div>
            </div>
          )}

          {/* eshop-08: Doporučujeme přikoupit — bonami accordion s řádky */}
          {isEs08 && (() => {
            const inCart = new Set(cart.items.map((i) => i.product_slug));
            const tips = upsellProducts.filter((p) => !inCart.has(p.slug) && p.variant_id).slice(0, 3);
            if (!tips.length) return null;
            return (
              <details className="rounded-2xl border border-neutral-100 bg-white px-5 py-2" open>
                <summary className="flex cursor-pointer list-none items-center justify-between py-3 text-[14px] font-bold text-neutral-900 [&::-webkit-details-marker]:hidden">
                  Doporučujeme přikoupit
                  <svg width="13" height="13" viewBox="0 0 12 12" fill="none"><path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </summary>
                <div className="border-t border-neutral-100">
                  {tips.map((s) => (
                    <div key={s.id} className="flex items-center gap-3.5 border-b border-neutral-50 py-3 last:border-0">
                      {s.image_url && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={s.image_url} alt="" loading="lazy" className="h-14 w-14 flex-shrink-0 rounded-lg object-cover" />
                      )}
                      <div className="min-w-0 flex-1">
                        <Link href={`${storeBase}/${s.slug}`} className="line-clamp-1 text-[13.5px] font-semibold text-neutral-900 hover:underline">{s.title}</Link>
                        <div className="text-[12px] font-bold text-[#3d9a50]">Skladem</div>
                      </div>
                      <span className="text-[14px] font-bold tabular-nums text-neutral-950">{czk(s.price_cents, cart.currency)}</span>
                      <button onClick={() => addUpsell(s)} disabled={busyUpsell === s.id}
                        className="flex h-9 items-center rounded-full border-[1.5px] border-[#3d9a50] px-3.5 text-[11.5px] font-extrabold text-[#3d9a50] transition hover:bg-[#3d9a50] hover:text-white disabled:opacity-50">
                        {busyUpsell === s.id ? <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" /> : "DO KOŠÍKU"}
                      </button>
                    </div>
                  ))}
                </div>
              </details>
            );
          })()}

          {/* eshop-10: footshop progress dopravy zdarma s náklaďákem */}
          {isEs10 && (
            <div className="mt-5 border-t border-neutral-100 pt-5">
              <div className="flex items-center justify-between gap-3">
                <p className="text-[14px] font-semibold text-neutral-900">
                  {missing > 0
                    ? <>Do dopravy zdarma zbývá: <strong className="font-extrabold tabular-nums">{czk(missing, cart.currency)}</strong></>
                    : <strong className="font-extrabold text-[#1fa05e]">Máš dopravu zdarma ✓</strong>}
                </p>
                <svg className="flex-shrink-0" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={missing > 0 ? "#6f6f6f" : "#1fa05e"} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M1.5 6h13v11h-13z"/><path d="M14.5 10h4l3 3.5V17h-7"/><circle cx="6" cy="17.5" r="1.9"/><circle cx="18" cy="17.5" r="1.9"/></svg>
              </div>
              <div className="mt-2 h-[6px] overflow-hidden rounded-full bg-neutral-100">
                <div className="h-full transition-all duration-500" style={{ width: `${Math.max(3, progress)}%`, background: missing > 0 ? "linear-gradient(90deg,#6d9204,#c8f53c)" : "#1fa05e" }} />
              </div>
            </div>
          )}

          {/* eshop-12: petcenter progress dopravy zdarma s měřítkem 0 → 1 299 Kč */}
          {isEs12 && (
            <div className="mt-5 rounded-2xl border border-[#f0e7db] bg-white p-4">
              <p className="text-[13.5px] font-bold text-[#14224a]">
                {missing > 0
                  ? <>Nakupte ještě za <strong className="font-extrabold text-[#f06e1e]">{czk(missing, cart.currency)}</strong> a získáte dopravu ZDARMA</>
                  : <strong className="font-extrabold text-[#16a06a]">Máte dopravu ZDARMA 🎉</strong>}
              </p>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#f0e9de]">
                <div className="h-full rounded-full transition-all duration-500" style={{ width: `${Math.max(3, progress)}%`, background: missing > 0 ? "#ff8a3d" : "#16a06a" }} />
              </div>
              <div className="mt-1 flex justify-between text-[11px] font-bold text-[#71809a]">
                <span>0 Kč</span><span>{czk(freeShippingFrom, cart.currency)}</span>
              </div>
            </div>
          )}

          <Link href={storeBase} className="inline-flex items-center gap-1.5 pt-2 text-[13.5px] font-semibold text-neutral-500 transition hover:text-neutral-950">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M11 18l-6-6 6-6" /></svg>
            Pokračovat v nákupu
          </Link>

          {/* Upsell (modul upsell-kosik) — kompaktní řádky; eshop-06 má karusel nahoře */}
          {!isEs06 && !isEs07 && !isEs08 && !isEs09 && !isEs10 && !isEs12 && (() => {
            const inCart = new Set(cart.items.map((i) => i.product_slug));
            const tips = upsellProducts.filter((p) => !inCart.has(p.slug) && p.variant_id).slice(0, 4);
            if (!tips.length) return null;
            return (
              <div className="mt-6 rounded-2xl border border-neutral-100 bg-neutral-50/60 p-5">
                <h3 className="text-[14px] font-extrabold tracking-tight text-neutral-950">Hodí se k vašemu nákupu</h3>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  {tips.map((p) => (
                    <div key={p.id} className="flex items-center gap-3 rounded-xl border border-neutral-100 bg-white p-3">
                      <Link href={`${storeBase}/${p.slug}`} className="block h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-neutral-50">
                        {p.image_url && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={p.image_url} alt="" loading="lazy" className="h-full w-full object-cover" />
                        )}
                      </Link>
                      <div className="min-w-0 flex-1">
                        <Link href={`${storeBase}/${p.slug}`} className="line-clamp-1 text-[13px] font-semibold text-neutral-900 hover:underline">{p.title}</Link>
                        <div className="text-[12.5px] font-bold tabular-nums text-neutral-950">{czk(p.price_cents, cart.currency)}</div>
                      </div>
                      <button onClick={() => addUpsell(p)} disabled={busyUpsell === p.id}
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-neutral-950 text-white transition hover:bg-neutral-700 disabled:opacity-50" aria-label={`Přidat ${p.title}`} title="Přidat do košíku">
                        {busyUpsell === p.id
                          ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                          : <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}
        </div>

        {/* Souhrn objednávky */}
        <aside>
          <div className="lg:sticky lg:top-[140px]">
            {/* eshop-08: Slevový kód/voucher accordion nad souhrnem */}
            {isEs08 && (
              <details className="mb-4 rounded-2xl border border-neutral-100 bg-white px-5 py-1.5">
                <summary className="flex cursor-pointer list-none items-center justify-between py-3 text-[14px] font-bold text-neutral-900 [&::-webkit-details-marker]:hidden">
                  Slevový kód/voucher
                  <svg width="13" height="13" viewBox="0 0 12 12" fill="none"><path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </summary>
                <p className="border-t border-neutral-100 pb-3.5 pt-3 text-[13px] text-neutral-500">
                  Kód zadáte v dalším kroku — v pokladně se uplatní automaticky na celou objednávku.
                </p>
              </details>
            )}
            <div className="rounded-2xl border border-neutral-100 bg-white p-6 shadow-[0_10px_35px_-18px_rgba(0,0,0,0.18)]">
              <div className="flex items-baseline justify-between gap-3">
                <h2 className={`text-[17px] font-extrabold tracking-tight text-neutral-950 ${isEs08 ? "hidden" : ""} ${isEs10 ? "es10cart-cond uppercase tracking-[0.08em] text-[19px]" : ""} ${isEs12 ? "es12cart-baloo text-[19px] text-[#14224a]" : ""}`} style={isEs09 ? { fontFamily: "'Archivo','Helvetica Neue',Arial,sans-serif" } : undefined}>{isEs09 ? "Rekapitulace" : isEs10 ? "Souhrn objednávky" : isEs06 || isEs07 ? "Shrnutí objednávky" : "Souhrn objednávky"}</h2>
                {isEs07 && (
                  <Link href={`${storeBase}/pokladna`} className="whitespace-nowrap text-[12.5px] font-bold text-neutral-700 underline underline-offset-2 hover:text-neutral-950">
                    Vložit slevový kód %
                  </Link>
                )}
              </div>

              {/* Doprava zdarma progress (modul doprava-zdarma-lista) */}
              {showFreeShippingBar && (
              <div className="mt-4">
                {missing > 0 ? (
                  <p className="text-[12.5px] text-neutral-500">
                    Nakupte ještě za <strong className="text-neutral-900">{czk(missing, cart.currency)}</strong> a dopravu máte zdarma.
                  </p>
                ) : (
                  <p className="flex items-center gap-1.5 text-[12.5px] font-semibold text-emerald-600">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M5 13l4 4L19 7" /></svg>
                    Máte dopravu zdarma
                  </p>
                )}
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-neutral-100">
                  <div className={`h-full rounded-full transition-all duration-500 ${missing > 0 ? "bg-neutral-950" : "bg-emerald-500"}`} style={{ width: `${progress}%` }} />
                </div>
              </div>
              )}

              {isEs07 && (
                <div className="mt-4 rounded-xl border border-neutral-200 px-4 py-1">
                  <div className="flex items-center gap-3 py-3">
                    <svg className="flex-shrink-0" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#16161d" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M1 6h13v11H1zM14 9h4l3 3v5h-7z"/><circle cx="5.5" cy="18.5" r="1.9"/><circle cx="17.5" cy="18.5" r="1.9"/></svg>
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] font-medium text-neutral-800">
                        {missing > 0
                          ? <>K dopravě zdarma chybí <strong className="font-extrabold">{czk(missing, cart.currency)}</strong></>
                          : <strong className="font-extrabold text-[#14a99a]">Dopravu máte od nás zdarma 🎉</strong>}
                      </p>
                      <div className="mt-1.5 h-[5px] overflow-hidden rounded-full bg-neutral-100">
                        <div className={`h-full rounded-full transition-all duration-500 ${missing > 0 ? "bg-neutral-950" : "bg-[#1fbfae]"}`} style={{ width: `${Math.max(4, progress)}%` }} />
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 border-t border-neutral-200 py-3">
                    <svg className="flex-shrink-0" width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#16161d" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="17" rx="2"/><path d="M16 2v4M8 2v4M3 9.5h18"/></svg>
                    <p className="text-[13px] font-medium text-neutral-800">
                      {(() => { const d = new Date(Date.now() + 86400000); const wd = new Intl.DateTimeFormat("cs-CZ", { weekday: "long" }).format(d); return `U vás doma už ${/^[sč]/.test(wd) ? "ve" : "v"} ${wd} ${d.getDate()}. ${d.getMonth() + 1}.`; })()}
                    </p>
                  </div>
                </div>
              )}

              <dl className="mt-5 space-y-2.5 border-t border-neutral-100 pt-4 text-[13.5px]">
                <div className="flex items-center justify-between">
                  <dt className="text-neutral-500">{isEs08 ? "Cena produktů celkem" : isEs09 ? `Zboží v košíku (${cart.item_count} ks)` : `Mezisoučet (${cart.item_count} ks)`}</dt>
                  <dd className="font-semibold tabular-nums text-neutral-900">{czk(cart.subtotal_cents, cart.currency)}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-neutral-500">Doprava</dt>
                  <dd className="font-semibold text-neutral-900">{missing > 0 ? "dle pokladny" : <span className="text-emerald-600">Zdarma</span>}</dd>
                </div>
              </dl>

              <div className="mt-4 flex items-baseline justify-between border-t border-neutral-100 pt-4">
                <span className="text-[15px] font-bold text-neutral-950">{isEs07 || isEs08 || isEs09 ? "Celkem s DPH" : "Celkem"}</span>
                <span className="text-[22px] font-extrabold tabular-nums text-neutral-950">{czk(cart.subtotal_cents, cart.currency)}</span>
              </div>
              <p className="mt-0.5 text-right text-[11.5px] text-neutral-400">vč. DPH</p>

              {isEs08 && (
                <button type="button" className="mt-5 flex h-12 w-full items-center justify-center rounded-full border-[1.5px] border-neutral-300 text-[12.5px] font-extrabold uppercase tracking-wide text-neutral-900 transition hover:border-neutral-900">
                  Přihlášení pro rychlý nákup
                </button>
              )}
              <Link href={`${storeBase}/pokladna`} className={`flex h-13 w-full items-center justify-center gap-2 py-3.5 text-[15px] font-bold transition ${isEs08 ? "mt-3 rounded-full bg-[#3d9a50] text-white shadow-[0_2px_10px_rgba(61,154,80,0.35)] hover:bg-[#2f7d3f]" : isEs09 ? "mt-5 rounded-full bg-[#3ce0a6] text-[#1d2433] shadow-[0_6px_18px_rgba(60,224,166,0.4)] hover:bg-[#22c993]" : isEs10 ? "mt-5 bg-[#c8f53c] text-[#111603] hover:bg-[#d9ff55]" : isEs12 ? "mt-5 rounded-full bg-[#ff8a3d] text-white shadow-[0_10px_24px_rgba(240,110,30,0.35)] hover:bg-[#f06e1e]" : isEs13 ? "mt-5 bg-[#141414] text-white hover:bg-black" : "mt-5 rounded-xl bg-gradient-to-b from-[#26b854] to-[#1d9a44] text-white shadow-[0_2px_10px_rgba(29,154,68,0.35)] hover:from-[#2cc75c] hover:to-[#21a94b]"}`}>
                {isEs07 ? <span className="text-[13px] font-extrabold uppercase tracking-[0.08em]">Pokračovat na doprava a platba</span>
                  : isEs08 ? <span className="text-[13px] font-extrabold uppercase tracking-[0.06em]">Pokračovat k objednávce</span>
                  : isEs09 ? <span className="text-[13px] font-extrabold uppercase tracking-[0.08em]">Přejít k dopravě a platbě</span>
                  : isEs10 ? <span className="es10cart-cond text-[16px] font-extrabold uppercase tracking-[0.13em]">Doprava a platba</span>
                  : isEs12 ? <span className="es12cart-baloo text-[15px] font-extrabold uppercase tracking-[0.05em]">Pokračovat na dopravu a platbu</span>
                  : isEs13 ? <span className="es13cart-serif text-[17px] font-medium">Pokračovat k pokladně</span>
                  : "Pokračovat k pokladně"}
                {!isEs07 && <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>}
              </Link>
              {isEs07 && (
                <Link href={storeBase} className="mt-4 block text-center text-[14px] font-semibold text-neutral-800 underline underline-offset-2 hover:text-neutral-950">
                  Zpět k nákupu
                </Link>
              )}

              {isEs06 && (
                <>
                  <Link href={`${storeBase}/pokladna`} className="mt-3 flex h-12 w-full items-center justify-center gap-2.5 rounded-xl bg-[#f5f5f2] text-[12.5px] font-extrabold uppercase tracking-wide text-neutral-900 transition hover:bg-[#eceae6]">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full border-[1.5px] border-neutral-900 text-[11px] font-extrabold">%</span>
                    Vložit slevový kód
                  </Link>
                  <Link href={storeBase} className="mt-4 block text-center text-[14px] font-semibold text-neutral-800 underline underline-offset-2 hover:text-neutral-950">
                    Zpět k nákupu
                  </Link>
                </>
              )}

              {isEs08 && (
                <p className="mt-4 flex items-center justify-center gap-2 text-[12.5px] font-semibold text-neutral-600">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#3d9a50" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l7 3v5c0 4.5-3 8.2-7 10-4-1.8-7-5.5-7-10V6z" /><path d="M9 12l2 2 4-4" /></svg>
                  Spokojený a bezpečný nákup
                </p>
              )}
              <div className="mt-4 flex flex-wrap items-center justify-center gap-1.5">
                {CART_PAYMENT_LOGOS.map((p) => (
                  <span key={p.label} className="flex h-7 min-w-[48px] items-center justify-center rounded-md border border-neutral-200 bg-white px-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p.src} alt={p.label} loading="lazy" className={`${p.className} object-contain`} />
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-4 flex flex-wrap justify-center gap-x-5 gap-y-2 text-[12px] text-neutral-500">
              <span className="flex items-center gap-1.5">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l7 3v5c0 4.5-3 8.2-7 10-4-1.8-7-5.5-7-10V6z" /><path d="M9 12l2 2 4-4" /></svg>
                Bezpečná platba
              </span>
              <span className="flex items-center gap-1.5">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 3-6.7" /><path d="M3 4v5h5" /></svg>
                Vrácení do 30 dnů
              </span>
            </div>
          </div>
        </aside>
      </div>

      {/* eshop-09: Mohlo by vás zajímat — mp cross-sell řada pod košíkem */}
      {isEs09 && (() => {
        const inCart = new Set(cart.items.map((i) => i.product_slug));
        const tips = upsellProducts.filter((p) => !inCart.has(p.slug) && p.variant_id && !serviceSlugs.has(p.slug)).slice(0, 4);
        if (!tips.length) return null;
        return (
          <div className="mt-14">
            <h2 className="text-[22px] font-extrabold tracking-tight text-[#232a30]" style={{ fontFamily: "'Archivo','Helvetica Neue',Arial,sans-serif" }}>
              Mohlo by vás zajímat
            </h2>
            <div className="mt-5 grid grid-cols-2 gap-4 md:grid-cols-4">
              {tips.map((p) => (
                <div key={p.id} className="group flex flex-col rounded-2xl border border-[#e8e9eb] bg-white p-4 transition hover:shadow-[0_16px_36px_-16px_rgba(29,36,51,0.25)]">
                  <Link href={`${storeBase}/${p.slug}`} className="block aspect-square overflow-hidden rounded-xl bg-[#f5f6f7]">
                    {p.image_url && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.image_url} alt="" loading="lazy" className="h-full w-full object-cover transition duration-300 group-hover:scale-105" />
                    )}
                  </Link>
                  <Link href={`${storeBase}/${p.slug}`} className="mt-3 line-clamp-2 min-h-[2.6em] text-[13.5px] font-bold leading-snug text-[#232a30] group-hover:underline">{p.title}</Link>
                  <div className="mt-0.5 text-[12px] font-bold text-[#0f9d70]">Skladem · ihned k odeslání</div>
                  <div className="mt-1 text-[15px] font-extrabold tabular-nums text-[#232a30]">{czk(p.price_cents, cart.currency)}</div>
                  <button onClick={() => addUpsell(p)} disabled={busyUpsell === p.id}
                    className="mt-3 flex h-10 items-center justify-center gap-1.5 rounded-full bg-[#3ce0a6] text-[12.5px] font-extrabold text-[#1d2433] transition hover:bg-[#22c993] disabled:opacity-50">
                    {busyUpsell === p.id
                      ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#1d2433]/30 border-t-[#1d2433]" />
                      : <>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1.6"/><circle cx="19" cy="21" r="1.6"/><path d="M2.5 3h2l2.6 12.4a2 2 0 0 0 2 1.6h9.7a2 2 0 0 0 2-1.6L22.5 7H6"/></svg>
                          Do košíku
                        </>}
                  </button>
                </div>
              ))}
            </div>
          </div>
        );
      })()}

      {/* eshop-12: S tímto produktem zákazníci nejčastěji kupují — petcenter 4-up */}
      {isEs12 && (() => {
        const inCart = new Set(cart.items.map((i) => i.product_slug));
        const tips = upsellProducts.filter((p) => !inCart.has(p.slug) && p.variant_id && !serviceSlugs.has(p.slug)).slice(0, 4);
        if (!tips.length) return null;
        const d = new Date(Date.now() + 86400000);
        return (
          <div className="mt-14">
            <h2 className="es12cart-baloo text-center text-[24px] font-extrabold text-[#14224a]">S tímto produktem zákazníci nejčastěji kupují</h2>
            <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
              {tips.map((p) => (
                <div key={p.id} className="group flex flex-col rounded-2xl border border-[#f0e7db] bg-white p-4 transition hover:-translate-y-1 hover:shadow-[0_18px_38px_rgba(20,34,74,0.10)]">
                  <Link href={`${storeBase}/${p.slug}`} className="block aspect-square overflow-hidden rounded-xl bg-[#f7f2ea]">
                    {p.image_url && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.image_url} alt="" loading="lazy" className="h-full w-full object-cover transition duration-300 group-hover:scale-105" />
                    )}
                  </Link>
                  <Link href={`${storeBase}/${p.slug}`} className="mt-3 line-clamp-2 min-h-[2.6em] text-[13.5px] font-bold leading-snug text-[#14224a] group-hover:text-[#6f45d1]">{p.title}</Link>
                  <div className="mt-1 text-[12px] font-extrabold text-[#16a06a]">Skladem <span className="font-semibold text-[#71809a]">· Odesíláme {d.getDate()}.{d.getMonth() + 1}.</span></div>
                  <div className="es12cart-baloo mt-1 text-[17px] font-extrabold tabular-nums text-[#f06e1e]">{czk(p.price_cents, cart.currency)}</div>
                  <button onClick={() => addUpsell(p)} disabled={busyUpsell === p.id}
                    className="es12cart-baloo mt-2.5 flex h-10 items-center justify-center gap-1.5 rounded-full bg-[#16a06a] text-[12.5px] font-extrabold uppercase tracking-[0.04em] text-white transition hover:bg-[#0e8557] disabled:opacity-50">
                    {busyUpsell === p.id
                      ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      : "Do košíku"}
                  </button>
                </div>
              ))}
            </div>
          </div>
        );
      })()}

      {/* eshop-10: Mohlo by se ti hodit — footshop cross-sell s outline PŘIDAT */}
      {isEs10 && (() => {
        const inCart = new Set(cart.items.map((i) => i.product_slug));
        const tips = upsellProducts.filter((p) => !inCart.has(p.slug) && p.variant_id && !serviceSlugs.has(p.slug)).slice(0, 4);
        if (!tips.length) return null;
        return (
          <div className="mt-14">
            <h2 className="es10cart-cond flex items-center gap-3 text-[24px] font-extrabold uppercase tracking-[0.08em] text-[#121212]">
              <span aria-hidden className="inline-block h-[10px] w-[10px] bg-[#c8f53c]" />
              Mohlo by se ti hodit
            </h2>
            <div className="mt-5 grid grid-cols-2 gap-4 md:grid-cols-4">
              {tips.map((p) => (
                <div key={p.id} className="group flex flex-col">
                  <Link href={`${storeBase}/${p.slug}`} className="block aspect-square overflow-hidden bg-[#f4f4f3]">
                    {p.image_url && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.image_url} alt="" loading="lazy" className="h-full w-full object-cover transition duration-300 group-hover:scale-105" />
                    )}
                  </Link>
                  <Link href={`${storeBase}/${p.slug}`} className="mt-3 line-clamp-2 min-h-[2.6em] text-[13.5px] font-semibold leading-snug text-[#121212] group-hover:underline">{p.title}</Link>
                  <div className="mt-1 text-[15px] font-extrabold tabular-nums text-[#121212]">{czk(p.price_cents, cart.currency)}</div>
                  <button onClick={() => addUpsell(p)} disabled={busyUpsell === p.id}
                    className="es10cart-cond mt-2.5 flex h-10 items-center justify-center border-2 border-[#121212] bg-white text-[13.5px] font-extrabold uppercase tracking-[0.1em] text-[#121212] transition hover:bg-[#121212] hover:text-white disabled:opacity-50">
                    {busyUpsell === p.id
                      ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      : "Přidat do košíku"}
                  </button>
                </div>
              ))}
            </div>
          </div>
        );
      })()}

      {/* eshop-07: Zákazníci koupili také — řada karet pod košíkem */}
      {isEs07 && (() => {
        const inCart = new Set(cart.items.map((i) => i.product_slug));
        const tips = upsellProducts.filter((p) => !inCart.has(p.slug) && p.variant_id && !serviceSlugs.has(p.slug)).slice(0, 5);
        if (!tips.length) return null;
        return (
          <div className="mt-14">
            <h2 className="text-center text-[19px] font-extrabold uppercase tracking-[0.14em] text-neutral-950">Zákazníci koupili také</h2>
            <div className="mt-7 grid grid-cols-2 gap-4 md:grid-cols-5">
              {tips.map((p) => (
                <div key={p.id} className="group flex flex-col rounded-xl border border-neutral-200 p-3 transition hover:border-neutral-950 hover:shadow-[0_14px_30px_rgba(22,22,29,0.08)]">
                  <Link href={`${storeBase}/${p.slug}`} className="block aspect-square overflow-hidden rounded-lg bg-neutral-50">
                    {p.image_url && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.image_url} alt="" loading="lazy" className="h-full w-full object-cover transition duration-300 group-hover:scale-105" />
                    )}
                  </Link>
                  <Link href={`${storeBase}/${p.slug}`} className="mt-3 line-clamp-2 min-h-[2.6em] text-[13.5px] font-semibold leading-snug text-neutral-900 group-hover:underline">{p.title}</Link>
                  <div className="mt-1 text-[14.5px] font-extrabold tabular-nums text-neutral-950">{czk(p.price_cents, cart.currency)}</div>
                  <div className="text-[12px] font-bold text-[#14a99a]">skladem</div>
                  <button onClick={() => addUpsell(p)} disabled={busyUpsell === p.id}
                    className="mt-2.5 flex h-9 items-center justify-center rounded-lg bg-neutral-950 text-[11.5px] font-extrabold uppercase tracking-[0.08em] text-white transition hover:bg-black disabled:opacity-50">
                    {busyUpsell === p.id
                      ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      : "Do košíku"}
                  </button>
                </div>
              ))}
            </div>
          </div>
        );
      })()}
    </div>
  );
}

function QtyStepper({ item, busy, setQty }: { item: CartItem; busy: boolean; setQty: (id: number, qty: number) => void }) {
  return (
    <div className="flex h-10 items-center rounded-xl border border-neutral-200">
      <button onClick={() => setQty(item.id, item.qty - 1)} disabled={busy}
        className="h-full w-9 text-[16px] text-neutral-500 transition hover:text-neutral-950 disabled:opacity-40" aria-label="Méně">−</button>
      <span className="w-8 text-center text-[14px] font-semibold tabular-nums">{item.qty}</span>
      <button onClick={() => setQty(item.id, item.qty + 1)} disabled={busy}
        className="h-full w-9 text-[16px] text-neutral-500 transition hover:text-neutral-950 disabled:opacity-40" aria-label="Více">+</button>
    </div>
  );
}
