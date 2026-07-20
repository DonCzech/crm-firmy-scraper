"use client";

/**
 * Modul „promo-kod-detail" — promo box slevového kódu v detailu produktu.
 * Klik na PŘIDAT KÓD: (1) přidá produkt do košíku, (2) uloží kód, který se
 * v pokladně automaticky uplatní (CheckoutClient si ho přečte a ověří).
 * Sdílená komponenta pro všechny e-shop šablony — barvy přes props.
 */

import { useState } from "react";

export const PROMO_CODE_STORAGE_PREFIX = "webero_promo_code_";

interface Props {
  tenantSlug: string;
  variantId: number;
  code: string;
  title: string;        // např. „Sleva 15 % s kódem LETO15"
  subtitle?: string;    // např. „Platí jen dnes na vybrané kolekce"
  buttonLabel?: string; // default „PŘIDAT KÓD"
  accent?: string;      // pozadí boxu (default bonami červená)
}

export function PromoCodeAdd({ tenantSlug, variantId, code, title, subtitle, buttonLabel = "PŘIDAT KÓD", accent = "#d64541" }: Props) {
  const [busy, setBusy] = useState(false);
  const [applied, setApplied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClick = async () => {
    if (busy || applied) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/demo/${tenantSlug}/shop/cart/items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ variant_id: variantId, qty: 1 }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error((data as { error?: string }).error ?? "Přidání do košíku selhalo");
      }
      try { localStorage.setItem(`${PROMO_CODE_STORAGE_PREFIX}${tenantSlug}`, code); } catch { /* private mode */ }
      setApplied(true);
      window.dispatchEvent(new Event("webero-cart-item-added"));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Přidání do košíku selhalo");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mt-3.5 rounded-xl px-5 py-3.5" style={{ background: accent }}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[14px] font-extrabold text-white">{title}</p>
          {subtitle && <p className="mt-0.5 text-[12px] font-semibold text-white/80">{subtitle}</p>}
        </div>
        <button
          type="button"
          onClick={handleClick}
          disabled={busy || applied}
          className="rounded-full bg-white px-4 py-2 text-[12px] font-extrabold tracking-wide text-neutral-950 transition hover:bg-neutral-100 disabled:opacity-90"
        >
          {applied ? (
            <span className="flex items-center gap-1.5">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#3d9a50" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12.5l5 5L20 6.5" /></svg>
              KÓD {code.toUpperCase()} PŘIDÁN
            </span>
          ) : busy ? (
            <span className="flex h-4 w-14 items-center justify-center"><span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-neutral-300 border-t-neutral-900" /></span>
          ) : (
            buttonLabel
          )}
        </button>
      </div>
      {applied && (
        <p className="mt-2 text-[12px] font-semibold text-white/90">
          Produkt je v košíku — kód {code.toUpperCase()} se v pokladně uplatní automaticky.
        </p>
      )}
      {error && <p className="mt-2 text-[12px] font-semibold text-white">{error}</p>}
    </div>
  );
}
