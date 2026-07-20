"use client";

import { useMemo, useState, useRef } from "react";

interface VariantOption {
  id: number;
  title: string | null;
  price_cents: number;
  compare_at_price_cents?: number | null;
  stock_qty: number;
  track_stock: boolean;
  stock_policy: string;
  is_default: boolean;
}

interface Props {
  tenantSlug: string;
  variants: VariantOption[];
  currency: string;
  productTitle?: string;
  productImage?: string;
  /** Modul min-max: maximální počet kusů na objednávku */
  maxPerOrder?: number | null;
  /** Zobrazí cenu vybrané varianty v nákupním řádku před stepperem (opt-in per šablona). */
  showPrice?: boolean;
  /** eshop-05 (pompo): skryje stepper množství — jen zelené tlačítko na plnou šířku. */
  hideQty?: boolean;
  ctaLabel?: string;
  /** eshop-07 (kosmetika-zdravi): varianty jako velké dlaždice s miniaturou, dostupností a cenou. */
  variantTiles?: boolean;
  /** eshop-07: zvětšený stepper + CTA (uppercase, plná šířka). */
  size?: "md" | "lg";
}

function czk(cents: number, currency = "CZK"): string {
  return new Intl.NumberFormat("cs-CZ", { style: "currency", currency, maximumFractionDigits: 0 })
    .format(cents / 100);
}

export function AddToCart({ tenantSlug, variants, currency, productTitle, productImage, maxPerOrder = null, showPrice = false, hideQty = false, ctaLabel, variantTiles = false, size = "md" }: Props) {
  const inStock = (v: VariantOption) => !v.track_stock || v.stock_qty > 0 || v.stock_policy === "continue";
  const firstAvailable = useMemo(
    () => variants.find((v) => v.is_default && inStock(v)) ?? variants.find(inStock) ?? variants[0],
     
    [variants]
  );
  const [variantId, setVariantId] = useState<number>(firstAvailable?.id ?? 0);
  const [qty, setQty] = useState(1);
  const [busy, setBusy] = useState(false);
  const [added, setAdded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const btnRef = useRef<HTMLButtonElement>(null);

  const selected = variants.find((v) => v.id === variantId) ?? firstAvailable;
  const canBuy = selected && inStock(selected);
  const stockCap = selected?.track_stock && selected.stock_policy !== "continue" && selected.stock_qty > 0 ? selected.stock_qty : 99;
  const maxQty = Math.max(1, Math.min(99, maxPerOrder ?? 99, stockCap));

  async function add() {
    if (!selected || busy) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/demo/${tenantSlug}/shop/cart/items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ variant_id: selected.id, qty }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error((data as { error?: string }).error ?? "Přidání selhalo");

      setAdded(true);
      window.dispatchEvent(new CustomEvent("webero-cart-updated"));
      window.dispatchEvent(new CustomEvent("webero-cart-item-added", {
        detail: {
          title: productTitle ?? "Produkt",
          variant: selected.title ?? undefined,
          price: czk(selected.price_cents * qty, currency),
          image: productImage ?? undefined,
          tenantSlug,
          // Celý košík z odpovědi — drawery ho vykreslí okamžitě bez refetche.
          cart: (data as { cart?: unknown }).cart,
        },
      }));

      if (btnRef.current) {
        btnRef.current.style.transform = "scale(0.95)";
        setTimeout(() => { if (btnRef.current) btnRef.current.style.transform = "scale(1)"; }, 150);
      }

      setTimeout(() => setAdded(false), 4000);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Přidání selhalo");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <style>{`
        @keyframes atcShine {
          0% { transform: translateX(-120%) skewX(-18deg); }
          14% { transform: translateX(240%) skewX(-18deg); }
          100% { transform: translateX(240%) skewX(-18deg); }
        }
        .atc-shine { position: absolute; top: 0; bottom: 0; left: 0; width: 45%; pointer-events: none;
          background: linear-gradient(105deg, transparent, rgba(255,255,255,0.22), transparent);
          animation: atcShine 7s ease-in-out 2.5s infinite; }
      `}</style>
      {variantTiles && variants.length > 1 && (
        <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {variants.map((v) => {
            const available = inStock(v);
            const active = v.id === variantId;
            return (
              <button
                key={v.id}
                type="button"
                disabled={!available}
                onClick={() => setVariantId(v.id)}
                className={`flex items-center gap-4 rounded-md border px-5 py-4 text-left transition ${
                  active ? "border-[#1fbfae] shadow-[0_0_0_1px_#1fbfae]" : available ? "border-neutral-200 hover:border-neutral-400" : "cursor-not-allowed border-neutral-100 opacity-50"
                }`}
              >
                {productImage && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={productImage} alt="" className="h-14 w-11 flex-shrink-0 rounded object-cover" loading="lazy" />
                )}
                <span className="min-w-0 flex-1">
                  <span className="block text-[17px] font-semibold text-neutral-950">{v.title ?? "Standard"}</span>
                  <span className={`block text-[14px] font-semibold ${available ? "text-[#14a99a]" : "text-neutral-400"}`}>{available ? "skladem" : "vyprodáno"}</span>
                </span>
                <span className="whitespace-nowrap text-[19px] font-extrabold tabular-nums text-neutral-950">{czk(v.price_cents, currency)}</span>
              </button>
            );
          })}
        </div>
      )}

      {!variantTiles && variants.length > 1 && (
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <span className="text-[12px] font-semibold uppercase tracking-wide text-neutral-500">Varianta</span>
          <div className="flex flex-wrap gap-2">
            {variants.map((v) => {
              const available = inStock(v);
              return (
                <button
                  key={v.id}
                  type="button"
                  disabled={!available}
                  onClick={() => setVariantId(v.id)}
                  className={`rounded border px-3 py-1.5 text-[13px] font-medium transition ${
                    v.id === variantId
                      ? "border-neutral-900 bg-neutral-900 text-white"
                      : available
                      ? "border-neutral-300 text-neutral-800 hover:border-neutral-500"
                      : "cursor-not-allowed border-neutral-200 text-neutral-300 line-through"
                  }`}
                >
                  {v.title ?? "Standard"}
                  {v.price_cents !== selected?.price_cents && available && (
                    <span className="ml-1.5 text-[11.5px] opacity-70">{czk(v.price_cents, currency)}</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className={showPrice ? "flex flex-wrap items-center gap-4 bg-neutral-50 px-5 py-4" : "flex flex-wrap items-center gap-3"}>
        {showPrice && selected && (() => {
          const compare = selected.compare_at_price_cents;
          const onSale = compare != null && compare > selected.price_cents;
          const pct = onSale ? Math.round((1 - selected.price_cents / compare!) * 100) : 0;
          return (
            <span className="mr-2 flex min-w-[140px] flex-col">
              {onSale && <span className="text-[13px] font-bold text-neutral-500">−{pct} %</span>}
              <span className="text-[28px] font-extrabold leading-tight tabular-nums text-neutral-950">
                {czk(selected.price_cents, currency)}
              </span>
              <span className="text-[12.5px] text-neutral-400">
                bez DPH {czk(Math.round(selected.price_cents / 1.21), currency)}
              </span>
            </span>
          );
        })()}
        {!hideQty && (
        <div className={`flex items-center border border-neutral-300 bg-white ${size === "lg" ? "h-[64px] rounded-md" : "h-[48px] rounded-lg"}`}>
          <button type="button" onClick={() => setQty(Math.max(1, qty - 1))}
            className={`h-full text-neutral-500 hover:text-neutral-900 ${size === "lg" ? "w-14 text-[22px]" : "w-11 text-[18px]"}`} aria-label="Méně">−</button>
          <span className={`text-center font-semibold tabular-nums ${size === "lg" ? "w-10 text-[17px]" : "w-8 text-[15px]"}`}>{qty}</span>
          <button type="button" onClick={() => setQty(Math.min(maxQty, qty + 1))} disabled={qty >= maxQty}
            className={`h-full text-neutral-500 hover:text-neutral-900 disabled:opacity-40 ${size === "lg" ? "w-14 text-[22px]" : "w-11 text-[18px]"}`} aria-label="Více">+</button>
        </div>
        )}

        <button
          ref={btnRef}
          type="button"
          onClick={add}
          disabled={!canBuy || busy}
          className={`relative overflow-hidden text-white ${size === "lg" ? "h-[64px] flex-1 rounded-md px-8 text-[14px] font-extrabold uppercase tracking-[0.08em]" : "h-[48px] min-w-[240px] flex-1 rounded-lg px-6 text-[15px] font-bold sm:flex-none"} ${
            canBuy
              ? "bg-gradient-to-b from-[#26b854] to-[#1d9a44] shadow-[0_2px_10px_rgba(29,154,68,0.35)] hover:from-[#2cc75c] hover:to-[#21a94b]"
              : "cursor-not-allowed bg-neutral-300"
          }`}
          style={{ transition: "background 0.2s, transform 0.15s cubic-bezier(0.34,1.56,0.64,1)" }}
        >
          {canBuy && !busy && <span className="atc-shine" aria-hidden />}
          {busy ? (
            <span className="inline-flex items-center gap-2">
              <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="3" /><path d="M12 2a10 10 0 0 1 10 10" stroke="#fff" strokeWidth="3" strokeLinecap="round" /></svg>
              Přidávám…
            </span>
          ) : !canBuy ? "Vyprodáno" : added ? (
            <span className="inline-flex items-center gap-2">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 13l4 4L19 7" /></svg>
              Přidáno!
            </span>
          ) : (
            <span className="inline-flex items-center gap-2">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 7h12l-1.2 10.5a1.8 1.8 0 0 1-1.8 1.5H9a1.8 1.8 0 0 1-1.8-1.5L6 7Z" /><path d="M9 7V5a3 3 0 0 1 6 0v2" /></svg>
              {ctaLabel ?? "Přidat do košíku"}
            </span>
          )}
        </button>
      </div>

      {selected?.track_stock && selected.stock_qty > 0 && selected.stock_qty <= 5 && (
        <p className="mt-2 text-[12.5px] font-medium text-amber-600">Poslední {selected.stock_qty} ks skladem</p>
      )}
      {maxPerOrder != null && maxQty === maxPerOrder && (
        <p className="mt-2 text-[12.5px] text-neutral-400">Max. {maxPerOrder} ks na objednávku</p>
      )}
      {error && <p className="mt-2 text-[13px] text-red-600">{error}</p>}
    </div>
  );
}
