"use client";

import { useState } from "react";

/** Modul „Sady produktů" — zvýhodněná sada na detailu produktu. */

interface BundleItemView {
  variant_id: number;
  qty: number;
  product_slug: string;
  product_title: string;
  variant_title: string | null;
  price_cents: number;
  image_url: string | null;
}

interface BundleView {
  id: number;
  name: string;
  discount_pct: number;
  items: BundleItemView[];
  regular_cents: number;
  bundle_cents: number;
}

function fmt(cents: number, currency: string): string {
  return new Intl.NumberFormat("cs-CZ", { style: "currency", currency, maximumFractionDigits: currency === "CZK" ? 0 : 2 }).format(cents / 100);
}

export function BundleOffer({ tenantSlug, bundles, currency }: { tenantSlug: string; bundles: BundleView[]; currency: string }) {
  const [adding, setAdding] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function addBundle(bundle: BundleView) {
    setAdding(bundle.id);
    setError(null);
    try {
      for (const item of bundle.items) {
        const res = await fetch(`/api/demo/${tenantSlug}/shop/cart/items`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ variant_id: item.variant_id, qty: item.qty }),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => null);
          throw new Error(data?.error ?? "Přidání do košíku selhalo");
        }
      }
      window.location.href = `/demo/${tenantSlug}/obchod/kosik`;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Přidání do košíku selhalo");
      setAdding(null);
    }
  }

  if (!bundles.length) return null;

  return (
    <section className="mt-14">
      <h2 className="text-[22px] font-extrabold tracking-tight text-neutral-950">Výhodné sady</h2>
      {error && (
        <p className="mt-3 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-[13px] font-semibold text-red-600">{error}</p>
      )}
      <div className="mt-4 space-y-4">
        {bundles.map((b) => {
          const savings = b.regular_cents - b.bundle_cents;
          return (
            <div key={b.id} className="rounded-2xl border border-neutral-200 bg-neutral-50/60 p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="text-[15px] font-bold text-neutral-950">{b.name}</div>
                <span className="rounded-full bg-emerald-100 px-3 py-1 text-[12px] font-bold text-emerald-700">
                  Ušetříte {fmt(savings, currency)} (−{b.discount_pct} %)
                </span>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-3">
                {b.items.map((item, idx) => (
                  <div key={item.variant_id} className="flex items-center gap-3">
                    {idx > 0 && <span className="text-[20px] font-bold text-neutral-300">+</span>}
                    <a href={`/demo/${tenantSlug}/obchod/${item.product_slug}`}
                      className="flex w-[150px] flex-col rounded-xl border border-neutral-200 bg-white p-3 transition hover:border-neutral-300 hover:shadow-sm">
                      <div className="flex h-[84px] items-center justify-center overflow-hidden rounded-lg bg-neutral-50">
                        {item.image_url
                          ? <img src={item.image_url} alt={item.product_title} className="max-h-full max-w-full object-contain" loading="lazy" />
                          : <span className="text-[24px] text-neutral-300">📦</span>}
                      </div>
                      <div className="mt-2 line-clamp-2 text-[12.5px] font-semibold leading-tight text-neutral-900">
                        {item.qty > 1 ? `${item.qty}× ` : ""}{item.product_title}
                      </div>
                      {item.variant_title && <div className="text-[11px] text-neutral-400">{item.variant_title}</div>}
                      <div className="mt-1 text-[12.5px] font-bold text-neutral-700">{fmt(item.price_cents * item.qty, currency)}</div>
                    </a>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-neutral-200 pt-4">
                <div>
                  <span className="text-[13.5px] text-neutral-400 line-through">{fmt(b.regular_cents, currency)}</span>
                  <span className="ml-2.5 text-[21px] font-extrabold tracking-tight text-neutral-950">{fmt(b.bundle_cents, currency)}</span>
                  <span className="ml-2 text-[12px] text-neutral-400">za celou sadu</span>
                </div>
                <button type="button" onClick={() => addBundle(b)} disabled={adding !== null}
                  className="rounded-full bg-neutral-950 px-6 py-2.5 text-[13.5px] font-bold text-white transition hover:bg-neutral-800 disabled:opacity-60">
                  {adding === b.id ? "Přidávám…" : "Přidat sadu do košíku"}
                </button>
              </div>
              <p className="mt-2 text-[11.5px] text-neutral-400">Sleva sady se odečte automaticky v pokladně.</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
