"use client";

import { useEffect, useState } from "react";

/** Modul „Cizí měny“ — přepínač zobrazovací měny (cookie + reload). */

const CURRENCIES = ["CZK", "EUR", "USD", "PLN", "GBP"] as const;

export function CurrencySwitcher({ tenantSlug }: { tenantSlug: string }) {
  const [current, setCurrent] = useState("CZK");

  useEffect(() => {
    const m = document.cookie.match(new RegExp(`webero_currency_${tenantSlug}=([A-Z]{3})`));
    if (m && CURRENCIES.includes(m[1] as (typeof CURRENCIES)[number])) setCurrent(m[1]);
  }, [tenantSlug]);

  function change(next: string) {
    document.cookie = `webero_currency_${tenantSlug}=${next}; path=/; max-age=31536000; SameSite=Lax`;
    window.location.reload();
  }

  return (
    <select
      aria-label="Měna"
      value={current}
      onChange={(e) => change(e.target.value)}
      className="hidden h-9 cursor-pointer rounded-full border border-neutral-200 bg-white px-2 text-[12px] font-bold text-neutral-700 outline-none transition hover:border-neutral-400 sm:block"
    >
      {CURRENCIES.map((c) => (
        <option key={c} value={c}>{c}</option>
      ))}
    </select>
  );
}
