"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Menu, X, Check, ChevronRight, ChevronDown, ArrowRight } from "lucide-react";
import { OnboardingModal } from "@/components/onboarding/OnboardingModal";
import { type PlatformLocale, localizedPath, platformCopy, platformPath } from "@/lib/platform-i18n";

const navItemsFor = (locale: PlatformLocale) => {
  const copy = platformCopy[locale].nav;
  return [
    { label: copy.products, href: platformPath("/produkty-a-reseni", locale) },
    { label: copy.designs, href: platformPath("/vybrat-design", locale) },
    { label: copy.pricing, href: platformPath("/cenik", locale) },
    { label: copy.contactNav, href: platformPath("/kontakt", locale) },
  ];
};

function WeberoMark({ size = 30, light = false }: { size?: number; light?: boolean }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 30 30"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="transition-transform duration-200 ease-out group-hover/logo:-rotate-6 group-hover/logo:scale-110"
    >
      <rect width="30" height="30" rx="8" fill={light ? "rgba(255,255,255,0.15)" : "url(#wm-grad)"} />
      {light && (
        <rect
          width="30"
          height="30"
          rx="8"
          fill="url(#wm-grad)"
          className="opacity-0 transition-opacity duration-200 group-hover/logo:opacity-100"
        />
      )}
      <path
        d="M7 9.5L10.8 20.5L15 12.5L19.2 20.5L23 9.5"
        stroke="white"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <defs>
        <linearGradient id="wm-grad" x1="0" y1="0" x2="30" y2="30" gradientUnits="userSpaceOnUse">
          <stop stopColor="#6366f1" />
          <stop offset="1" stopColor="#4338ca" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function PlatformHeader({
  forceSolid = false,
  locale = "cs",
  navItems,
}: {
  forceSolid?: boolean;
  locale?: PlatformLocale;
  navItems?: { label: string; href: string }[];
} = {}) {
  const copy = platformCopy[locale].nav;
  const NAV_ITEMS = navItems ?? navItemsFor(locale);
  const pathname = usePathname() || "/";
  const switchPath = (target: PlatformLocale) => {
    const withoutLocale = pathname.replace(/^\/(cs|en)(?=\/|$)/, "") || "/";
    if (withoutLocale !== "/") return platformPath(withoutLocale, target);
    return platformPath("/", target);
  };
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  function openTryFree() {
    setMenuOpen(false);
    setModalOpen(true);
  }

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40);
    handler();
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const solid = scrolled || menuOpen || forceSolid;

  return (
    <header className="fixed left-0 right-0 top-0 z-50">
      {/* Pozadí je samostatná vrstva: backdrop-filter na <header> by z něj udělal
          containing block pro fixed potomky (mobilní drawer, onboarding modal). */}
      <div
        aria-hidden
        className={`pointer-events-none absolute inset-0 transition-all duration-150 ${
          solid
            ? "bg-white shadow-[0_1px_2px_rgba(16,24,40,0.04),0_8px_24px_rgba(16,24,40,0.05)] border-b border-[#f3f4f6] lg:bg-white/90 lg:backdrop-blur-xl"
            : "bg-transparent"
        }`}
      />
      <div className="relative mx-auto flex h-[64px] max-w-[1280px] items-center justify-between px-5 sm:px-6 lg:h-[72px] lg:px-8">

        {/* Logo */}
        <Link
          href={localizedPath("/", locale)}
          className={`group/logo flex items-center gap-3 font-bold text-[22px] tracking-[-0.025em] transition-colors duration-200 ${
            solid ? "text-[#111827] hover:text-[#4f46e5]" : "text-white hover:text-[#c7d2fe]"
          }`}
        >
          <WeberoMark size={42} light={!solid} />
          Webero
        </Link>

        {/* Desktop nav */}
        <nav
          className="hidden items-center gap-9 lg:flex"
          style={{
            fontSize: "14.5px",
            letterSpacing: "0.05em",
            fontFamily:
              "'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
          }}
        >
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <a
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`group/nav relative py-1 font-medium ${
                  active ? "text-[#4f46e5]" : solid ? "text-[#374151]" : "text-white/95"
                }`}
              >
                <span className="relative block overflow-hidden">
                  <span className="block transition-transform duration-300 ease-[cubic-bezier(0.76,0,0.24,1)] group-hover/nav:-translate-y-full">
                    {item.label}
                  </span>
                  <span
                    aria-hidden
                    className={`absolute inset-0 block translate-y-full transition-transform duration-300 ease-[cubic-bezier(0.76,0,0.24,1)] group-hover/nav:translate-y-0 ${
                      solid || active ? "text-[#6366f1]" : "text-white"
                    }`}
                  >
                    {item.label}
                  </span>
                </span>
                <span
                  className={`absolute -bottom-0.5 left-0 h-[2px] w-full origin-left rounded-full transition-transform duration-300 ease-out ${
                    solid || active ? "bg-[#6366f1]" : "bg-white"
                  } ${active ? "scale-x-100" : "scale-x-0 group-hover/nav:scale-x-100"}`}
                />
              </a>
            );
          })}
        </nav>

        {/* Desktop actions */}
        <div className="hidden items-center gap-3 lg:flex">
          <Link
            href={platformPath("/admin/login", locale)}
            className={`group/login relative py-1 text-[15px] font-medium ${
              solid ? "text-[#374151]" : "text-white/90"
            }`}
          >
            <span className="relative block overflow-hidden">
              <span className="block transition-transform duration-300 ease-[cubic-bezier(0.76,0,0.24,1)] group-hover/login:-translate-y-full">
                {copy.login}
              </span>
              <span
                aria-hidden
                className={`absolute inset-0 block translate-y-full transition-transform duration-300 ease-[cubic-bezier(0.76,0,0.24,1)] group-hover/login:translate-y-0 ${
                  solid ? "text-[#6366f1]" : "text-white"
                }`}
              >
                {copy.login}
              </span>
            </span>
            <span
              className={`absolute -bottom-0.5 left-0 h-[2px] w-full origin-left scale-x-0 rounded-full transition-transform duration-300 ease-out group-hover/login:scale-x-100 ${
                solid ? "bg-[#6366f1]" : "bg-white"
              }`}
            />
          </Link>
          <button
            type="button"
            onClick={openTryFree}
            className={`group/cta relative inline-flex items-center gap-1.5 overflow-hidden rounded-lg px-5 py-2.5 text-[14.5px] font-semibold transition-all duration-200 hover:-translate-y-[1px] active:translate-y-0 active:scale-[0.98] ${
              solid
                ? "bg-[#4f46e5] text-white shadow-[0_1px_3px_rgba(0,0,0,.12),0_4px_12px_rgba(79,70,229,.25)] hover:bg-[#4338ca] hover:shadow-[0_2px_4px_rgba(0,0,0,.12),0_8px_20px_rgba(79,70,229,.35)]"
                : "bg-white text-[#111827] hover:bg-white/90"
            }`}
          >
            <span
              aria-hidden
              className={`pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent to-transparent transition-transform duration-500 ease-out group-hover/cta:translate-x-full ${
                solid ? "via-white/25" : "via-[#6366f1]/10"
              }`}
            />
            {copy.tryFree}
            <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover/cta:translate-x-0.5" />
          </button>
          <div className="group relative">
            <button
              type="button"
              aria-label={copy.language}
              className={`inline-flex h-10 items-center gap-2 rounded-full border px-3 text-[14px] font-semibold transition-all duration-200 active:scale-[0.97] ${
                solid
                  ? "border-[#e5e7eb] bg-white text-[#374151] hover:border-[#c7cdd8] hover:shadow-[0_2px_8px_rgba(16,24,40,0.08)]"
                  : "border-white/20 bg-white/10 text-white hover:border-white/35 hover:bg-white/15"
              }`}
            >
              <span aria-hidden className="transition-transform duration-200 group-hover:scale-110">
                {locale === "en" ? "🇬🇧" : "🇨🇿"}
              </span>
              <span>{locale.toUpperCase()}</span>
              <ChevronDown
                className="h-3.5 w-3.5 opacity-60 transition-transform duration-200 group-hover:rotate-180"
                strokeWidth={2.5}
              />
            </button>
            <div className="invisible absolute right-0 top-full translate-y-1 pt-2 opacity-0 transition-all duration-200 ease-out group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100">
              <div className="w-40 overflow-hidden rounded-xl border border-[#e5e7eb] bg-white p-1.5 shadow-[0_18px_45px_rgba(15,23,42,0.16)]">
                <Link
                  href={switchPath("cs")}
                  className={`flex items-center gap-2 rounded-lg px-2.5 py-2 text-[13.5px] font-medium transition-colors duration-150 ${
                    locale === "cs" ? "bg-[#eef2ff] text-[#4f46e5]" : "text-[#111827] hover:bg-[#f8fafc]"
                  }`}
                >
                  <span aria-hidden>🇨🇿</span>
                  {copy.czech}
                  {locale === "cs" && <Check className="ml-auto h-4 w-4" strokeWidth={2.5} />}
                </Link>
                <Link
                  href={switchPath("en")}
                  className={`flex items-center gap-2 rounded-lg px-2.5 py-2 text-[13.5px] font-medium transition-colors duration-150 ${
                    locale === "en" ? "bg-[#eef2ff] text-[#4f46e5]" : "text-[#111827] hover:bg-[#f8fafc]"
                  }`}
                >
                  <span aria-hidden>🇬🇧</span>
                  {copy.english}
                  {locale === "en" && <Check className="ml-auto h-4 w-4" strokeWidth={2.5} />}
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile hamburger */}
        <button
          aria-label={copy.openMenu}
          onClick={() => setMenuOpen(true)}
          className={`-mr-2 grid h-10 w-10 place-items-center transition-colors lg:hidden ${
            solid ? "text-[#374151]" : "text-white"
          }`}
        >
          <Menu className="h-6 w-6" strokeWidth={2.2} />
        </button>
      </div>

      {/* Mobile drawer overlay */}
      <div
        className={`fixed inset-0 z-[60] transition-opacity duration-300 lg:hidden ${
          menuOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={() => setMenuOpen(false)}
      >
        <div className="absolute inset-0 bg-[#111827]/40 backdrop-blur-sm" />

        <aside
          className={`absolute right-0 top-0 flex h-full w-[86%] max-w-[360px] flex-col bg-white shadow-2xl transition-transform duration-300 ease-out ${
            menuOpen ? "translate-x-0" : "translate-x-full"
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Drawer header */}
          <div className="flex h-[64px] items-center justify-between border-b border-[#e5e7eb] px-5">
            <div className="flex items-center gap-3 font-bold text-[22px] tracking-[-0.025em] text-[#111827]">
              <WeberoMark size={38} />
              Webero
            </div>
            <button
              aria-label={copy.close}
              onClick={() => setMenuOpen(false)}
              className="-mr-2 grid h-10 w-10 place-items-center text-[#374151]"
            >
              <X className="h-6 w-6" strokeWidth={2.2} />
            </button>
          </div>

          {/* Drawer nav */}
          <nav className="flex-1 overflow-y-auto px-5 py-4">
            {NAV_ITEMS.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className="flex items-center justify-between border-b border-[#e5e7eb] py-4 text-[17px] font-medium text-[#111827]"
              >
                {item.label}
                <ChevronRight className="h-5 w-5 text-[#9ca3af]" />
              </a>
            ))}
            <Link
              href={platformPath("/admin/login", locale)}
              onClick={() => setMenuOpen(false)}
              className="flex items-center justify-between border-b border-[#e5e7eb] py-4 text-[17px] font-medium text-[#111827]"
            >
              {copy.login}
              <ChevronRight className="h-5 w-5 text-[#9ca3af]" />
            </Link>
          </nav>

          {/* Drawer CTA */}
          <div className="border-t border-[#e5e7eb] p-5">
            <div className="mb-4 grid grid-cols-2 gap-2">
              <Link
                href={switchPath("cs")}
                onClick={() => setMenuOpen(false)}
                className="flex items-center justify-center gap-2 rounded-lg border border-[#e5e7eb] px-3 py-2 text-[13px] font-semibold text-[#111827]"
              >
                <span aria-hidden>🇨🇿</span>
                CS
              </Link>
              <Link
                href={switchPath("en")}
                onClick={() => setMenuOpen(false)}
                className="flex items-center justify-center gap-2 rounded-lg border border-[#e5e7eb] px-3 py-2 text-[13px] font-semibold text-[#111827]"
              >
                <span aria-hidden>🇬🇧</span>
                EN
              </Link>
            </div>
            <button
              type="button"
              onClick={openTryFree}
              className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-[#4f46e5] px-5 py-3.5 text-[16px] font-semibold text-white"
            >
              {copy.tryFree}
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </aside>
      </div>

      {modalOpen && <OnboardingModal locale={locale} onClose={() => setModalOpen(false)} />}
    </header>
  );
}
