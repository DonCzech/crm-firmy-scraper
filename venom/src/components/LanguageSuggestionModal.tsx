"use client";

import { useState } from "react";
import type { PlatformLocale } from "@/lib/platform-i18n";

interface LanguageSuggestionModalProps {
  currentLocale: PlatformLocale;
  suggestedLocale: PlatformLocale | "";
}

function savePreference(locale: "cs" | "en") {
  const secure = window.location.protocol === "https:" ? "; secure" : "";
  document.cookie = `webero-locale-preference=${locale}; path=/; max-age=31536000; samesite=lax${secure}`;
  document.cookie = `webero-locale-suggested=; path=/; max-age=0; samesite=lax${secure}`;
  try { localStorage.setItem("webero-locale-preference", locale); } catch {}
}

export function LanguageSuggestionModal({ currentLocale, suggestedLocale }: LanguageSuggestionModalProps) {
  const [open, setOpen] = useState(true);
  if (!open || currentLocale !== "en" || suggestedLocale !== "cs") return null;

  const stayEnglish = () => {
    savePreference("en");
    setOpen(false);
  };

  const continueCzech = () => {
    savePreference("cs");
    const map: Record<string, string> = {
      "/": "/cs",
      "/en": "/cs",
      "/en/products-and-solutions": "/produkty-a-reseni",
      "/en/features": "/prehled-funkci",
      "/en/choose-design": "/vybrat-design",
      "/en/pricing": "/cenik",
      "/en/admin/login": "/admin/login",
    };
    const target = map[window.location.pathname] || "/cs";
    window.location.assign(target + window.location.search + window.location.hash);
  };

  return (
    <div id="webero-lang-suggestion" role="dialog" aria-modal="true" aria-labelledby="webero-lang-title" className="fixed inset-0 z-[9998] flex items-center justify-center bg-[rgba(8,10,18,.58)] p-4 backdrop-blur-[14px]">
      <div className="relative w-full max-w-[30rem] overflow-hidden rounded-[22px] border border-white/15 bg-[#0a0a0a] text-white shadow-[0_32px_90px_rgba(0,0,0,.42)]">
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(99,102,241,.42),transparent_34%),linear-gradient(135deg,rgba(255,255,255,.08),transparent_46%)]" />
        <button type="button" onClick={stayEnglish} aria-label="Close" className="absolute right-3.5 top-3.5 z-20 flex h-[34px] w-[34px] items-center justify-center rounded-full border border-white/15 bg-white/[.06] text-white/70">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden><path d="M12 4 4 12M4 4l8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
        </button>
        <div className="relative z-10 px-[26px] pb-6 pt-[30px]">
          <div aria-hidden className="mx-auto mb-[18px] flex h-[66px] w-[66px] items-center justify-center rounded-[18px] bg-gradient-to-br from-indigo-500 to-indigo-700 text-3xl shadow-[0_18px_42px_rgba(99,102,241,.38)]">🇨🇿</div>
          <p className="m-0 text-center text-xs font-extrabold uppercase tracking-[.16em] text-indigo-300">Webero speaks Czech too</p>
          <h2 id="webero-lang-title" className="mt-2.5 text-center text-2xl font-extrabold leading-[1.12] tracking-[-.02em]">Webero je dostupné i v češtině</h2>
          <p className="mx-auto mt-2.5 max-w-[22rem] text-center text-sm leading-[1.55] text-white/70">Vypadá to, že jste z Česka. Můžete pokračovat česky, nebo zůstat v anglické verzi.</p>
          <div className="mt-[22px] grid gap-2.5">
            <button type="button" onClick={continueCzech} className="w-full rounded-full bg-white px-[18px] py-3 text-sm font-extrabold text-[#0a0a0a] shadow-[0_8px_26px_rgba(255,255,255,.18)]">Pokračovat česky</button>
            <button type="button" onClick={stayEnglish} className="w-full rounded-full border border-white/15 bg-white/[.06] px-[18px] py-3 text-sm font-bold text-white/80">Stay in English</button>
          </div>
        </div>
      </div>
    </div>
  );
}
