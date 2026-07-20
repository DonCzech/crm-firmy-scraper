"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

interface WishItem {
  product_id: number;
  title: string;
  slug: string;
  brand: string | null;
  image_url: string | null;
  price_cents: number | null;
  variant_id: number | null;
}

function czk(cents: number, currency = "CZK"): string {
  return new Intl.NumberFormat("cs-CZ", { style: "currency", currency, maximumFractionDigits: 0 }).format(cents / 100);
}

export function WishlistPageClient({ tenantSlug, currency }: { tenantSlug: string; currency: string }) {
  const [items, setItems] = useState<WishItem[] | null>(null);
  const [addingId, setAddingId] = useState<number | null>(null);
  const base = `/demo/${tenantSlug}/obchod`;

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/demo/${tenantSlug}/shop/wishlist`);
      const data = await res.json();
      setItems(Array.isArray(data?.items) ? data.items : []);
    } catch {
      setItems([]);
    }
  }, [tenantSlug]);

  useEffect(() => { load(); }, [load]);

  async function remove(productId: number) {
    setItems((prev) => (prev ?? []).filter((i) => i.product_id !== productId));
    await fetch(`/api/demo/${tenantSlug}/shop/wishlist`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId, action: "remove" }),
    });
    window.dispatchEvent(new CustomEvent("webero-wishlist-updated"));
  }

  async function addToCart(item: WishItem) {
    if (!item.variant_id || addingId) return;
    setAddingId(item.product_id);
    try {
      const res = await fetch(`/api/demo/${tenantSlug}/shop/cart/items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ variant_id: item.variant_id, qty: 1 }),
      });
      if (res.ok) {
        window.dispatchEvent(new CustomEvent("webero-cart-updated"));
        window.dispatchEvent(new CustomEvent("webero-cart-item-added", {
          detail: {
            title: item.title,
            price: item.price_cents != null ? czk(item.price_cents, currency) : "",
            image: item.image_url ?? undefined,
            tenantSlug,
          },
        }));
      }
    } finally {
      setAddingId(null);
    }
  }

  if (items === null) {
    return (
      <div className="flex justify-center py-20">
        <svg className="animate-spin text-neutral-300" width="28" height="28" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.3" /><path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" /></svg>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center py-20 text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-neutral-100 text-neutral-400">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg>
        </span>
        <p className="mt-5 text-[17px] font-bold text-neutral-950">Zatím nemáte žádné oblíbené produkty</p>
        <p className="mt-1.5 max-w-sm text-[13.5px] text-neutral-500">Klikněte na srdíčko u produktu a najdete ho tady — i po zavření prohlížeče.</p>
        <Link href={base} className="mt-6 rounded-lg bg-neutral-900 px-6 py-3 text-[14px] font-semibold text-white transition hover:bg-neutral-700">
          Prohlédnout nabídku
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {items.map((item) => (
        <div key={item.product_id} className="group relative flex flex-col rounded-2xl border border-neutral-100 bg-white p-3 transition hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)]">
          <button
            onClick={() => remove(item.product_id)}
            aria-label="Odebrat z oblíbených"
            title="Odebrat z oblíbených"
            className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-red-500 shadow-sm transition hover:bg-red-50"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="#ef4444" stroke="#ef4444" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg>
          </button>
          <Link href={`${base}/${item.slug}`} className="block overflow-hidden rounded-xl bg-neutral-100">
            {item.image_url ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img src={item.image_url} alt={item.title} className="aspect-square w-full object-cover transition duration-300 group-hover:scale-[1.04]" />
            ) : (
              <div className="flex aspect-square items-center justify-center text-[12px] text-neutral-300">Bez fotky</div>
            )}
          </Link>
          <div className="flex flex-1 flex-col pt-3">
            {item.brand && <span className="text-[11px] font-semibold uppercase tracking-wide text-neutral-400">{item.brand}</span>}
            <Link href={`${base}/${item.slug}`} className="mt-0.5 line-clamp-2 text-[13.5px] font-semibold leading-snug text-neutral-950 hover:underline">
              {item.title}
            </Link>
            <div className="mt-auto pt-3">
              {item.price_cents != null && (
                <div className="text-[15px] font-extrabold tabular-nums text-neutral-950">{czk(item.price_cents, currency)}</div>
              )}
              <button
                onClick={() => addToCart(item)}
                disabled={!item.variant_id || addingId === item.product_id}
                className="mt-2 w-full rounded-lg bg-gradient-to-b from-[#26b854] to-[#1d9a44] py-2 text-[13px] font-bold text-white transition hover:from-[#2cc75c] hover:to-[#21a94b] disabled:cursor-not-allowed disabled:bg-neutral-300 disabled:from-neutral-300 disabled:to-neutral-300"
              >
                {addingId === item.product_id ? "Přidávám…" : "Do košíku"}
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
