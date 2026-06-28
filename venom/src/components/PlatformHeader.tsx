"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Menu, X, ChevronRight, ArrowRight } from "lucide-react";
import { OnboardingModal } from "@/components/onboarding/OnboardingModal";

const DEFAULT_NAV_ITEMS = [
  { label: "PRODUKTY A ŘEŠENÍ", href: "/produkty-a-reseni" },
  { label: "PŘEHLED FUNKCÍ",    href: "/prehled-funkci" },
  { label: "VYBRAT DESIGN",     href: "/vybrat-design" },
  { label: "CENÍK",             href: "/cenik" },
];

function WeberoMark({ size = 30, light = false }: { size?: number; light?: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="30" height="30" rx="8" fill={light ? "rgba(255,255,255,0.15)" : "url(#wm-grad)"} />
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
  navItems = DEFAULT_NAV_ITEMS,
}: {
  forceSolid?: boolean;
  navItems?: { label: string; href: string }[];
} = {}) {
  const NAV_ITEMS = navItems;
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
    <header
      className={`fixed left-0 right-0 top-0 z-50 transition-all duration-300 ${
        solid
          ? "bg-white shadow-[0_2px_20px_rgba(0,0,0,0.08)] border-b border-[#f3f4f6]"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex h-[64px] max-w-[1280px] items-center justify-between px-5 sm:px-6 lg:h-[72px] lg:px-8">

        {/* Logo */}
        <Link
          href="/"
          className={`flex items-center gap-3 font-bold text-[22px] tracking-[-0.025em] transition-colors duration-300 ${
            solid ? "text-[#111827]" : "text-white"
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
          {NAV_ITEMS.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className={`font-medium transition-colors duration-300 hover:text-[#6366f1] ${
                solid ? "text-[#374151]" : "text-white/95"
              }`}
            >
              {item.label}
            </a>
          ))}
        </nav>

        {/* Desktop actions */}
        <div className="hidden items-center gap-3 lg:flex">
          <Link
            href="/admin/login"
            className={`text-[15px] font-medium transition-colors duration-300 hover:text-[#6366f1] ${
              solid ? "text-[#374151]" : "text-white/90"
            }`}
          >
            Přihlásit
          </Link>
          <button
            type="button"
            onClick={openTryFree}
            className={`inline-flex items-center gap-1.5 rounded-lg px-5 py-2.5 text-[14.5px] font-semibold transition-all active:scale-[0.98] ${
              solid
                ? "bg-[#4f46e5] text-white shadow-[0_1px_3px_rgba(0,0,0,.12),0_4px_12px_rgba(79,70,229,.25)] hover:bg-[#4338ca]"
                : "bg-white text-[#111827] hover:bg-white/90"
            }`}
          >
            Vyzkoušet zdarma
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        {/* Mobile hamburger */}
        <button
          aria-label="Otevřít menu"
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
              aria-label="Zavřít"
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
              href="/admin/login"
              onClick={() => setMenuOpen(false)}
              className="flex items-center justify-between border-b border-[#e5e7eb] py-4 text-[17px] font-medium text-[#111827]"
            >
              Přihlásit
              <ChevronRight className="h-5 w-5 text-[#9ca3af]" />
            </Link>
          </nav>

          {/* Drawer CTA */}
          <div className="border-t border-[#e5e7eb] p-5">
            <button
              type="button"
              onClick={openTryFree}
              className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-[#4f46e5] px-5 py-3.5 text-[16px] font-semibold text-white"
            >
              Vyzkoušet zdarma
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </aside>
      </div>

      {modalOpen && <OnboardingModal onClose={() => setModalOpen(false)} />}
    </header>
  );
}
