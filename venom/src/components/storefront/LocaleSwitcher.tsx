"use client";

import { useEffect, useState } from "react";

/** Modul „Cizí jazyky“ — přepínač jazyka produktového obsahu (cookie + reload). */

const LOCALES: { code: string; label: string }[] = [
  { code: "cs", label: "🇨🇿 CZ" },
  { code: "sk", label: "🇸🇰 SK" },
  { code: "en", label: "🇬🇧 EN" },
  { code: "de", label: "🇩🇪 DE" },
  { code: "pl", label: "🇵🇱 PL" },
];

export function LocaleSwitcher({ tenantSlug }: { tenantSlug: string }) {
  const [current, setCurrent] = useState("cs");

  useEffect(() => {
    const m = document.cookie.match(new RegExp(`webero_locale_${tenantSlug}=([a-z]{2})`));
    if (m && LOCALES.some((l) => l.code === m[1])) setCurrent(m[1]);
  }, [tenantSlug]);

  function change(next: string) {
    document.cookie = `webero_locale_${tenantSlug}=${next}; path=/; max-age=31536000; SameSite=Lax`;
    window.location.reload();
  }

  return (
    <select
      aria-label="Jazyk"
      value={current}
      onChange={(e) => change(e.target.value)}
      className="hidden h-9 cursor-pointer rounded-full border border-neutral-200 bg-white px-2 text-[12px] font-bold text-neutral-700 outline-none transition hover:border-neutral-400 sm:block"
    >
      {LOCALES.map((l) => (
        <option key={l.code} value={l.code}>{l.label}</option>
      ))}
    </select>
  );
}
