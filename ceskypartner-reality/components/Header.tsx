"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Heart, Search } from "lucide-react";
import { useFavorites } from "@/lib/useFavorites";
import FavoritesOverlay from "./FavoritesOverlay";
import Logo from "./Logo";
import MegaMenu from "./MegaMenu";
import SearchOverlay from "./SearchOverlay";
import type { SiteLocale } from "@/lib/locale";
import { toCzechPath, toEnglishPath } from "@/lib/i18nRoutes";

const NAV_ITEMS_CS = [
  { label: "Prodej", href: "/nabidka/prodej" },
  { label: "Pronájem", href: "/nabidka/pronajem" },
  { label: "Investiční nemovitosti", href: "/nabidka/investicni" },
  { label: "Služby", href: "/sluzby" },
  { label: "O nás", href: "/o-nas" },
  { label: "Kontakt", href: "/kontakt" },
];
const NAV_ITEMS_EN = [
  { label: "For sale", href: "/en/properties/for-sale" },
  { label: "To let", href: "/en/properties/to-let" },
  { label: "Investment", href: "/en/properties/investment" },
  { label: "Services", href: "/en/services" },
  { label: "About us", href: "/en/about" },
  { label: "Contact", href: "/en/contact" },
];

type HeaderProps = {
  /** overlay = transparentní přes hero (homepage), solid = vždy světlý (podstránky) */
  variant?: "overlay" | "solid";
  locale?: SiteLocale;
};

export default function Header({ variant = "overlay", locale = "cs" }: HeaderProps) {
  const en = locale === "en";
  const navItems = en ? NAV_ITEMS_EN : NAV_ITEMS_CS;
  const pathname = usePathname();
  const czechHref = toCzechPath(pathname);
  const englishHref = toEnglishPath(pathname);
  const [scrolled, setScrolled] = useState(variant === "solid");
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [favoritesOpen, setFavoritesOpen] = useState(false);
  const { count: favoritesCount } = useFavorites();

  useEffect(() => {
    if (variant === "solid") return;
    const onScroll = () => {
      // Přepnout na světlé pozadí dřív, než se pod hlavičku dostane hero nadpis
      setScrolled(window.scrollY > window.innerHeight * 0.2);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [variant]);

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-colors duration-500 ${
          scrolled
            ? "border-b border-line bg-paper/85 text-ink backdrop-blur-md"
            : "border-b border-transparent bg-transparent text-paper [text-shadow:0_1px_2px_rgba(0,0,0,0.45),0_4px_20px_rgba(0,0,0,0.4)] [&_svg]:drop-shadow-[0_1px_5px_rgba(0,0,0,0.45)]"
        }`}
      >
        {/* Hlavní lišta */}
        <div
          className={`mx-auto flex max-w-site items-center justify-between px-6 transition-all duration-500 ease-luxe xl:px-10 ${
            scrolled ? "h-16" : "h-[88px]"
          }`}
        >
          <a href={en ? "/en" : "/"} aria-label={en ? "Český Partner — English homepage" : "Český Partner — úvodní stránka"}>
            <Logo locale={locale} />
          </a>

          <nav className="hidden items-center gap-8 xl:flex" aria-label={en ? "Main navigation" : "Hlavní navigace"}>
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="nav-link text-[13.5px] font-normal tracking-[0.03em]"
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-1">
            <span className="mr-1 flex items-center gap-1.5 text-[11px] font-semibold tracking-[0.08em] sm:mr-2">
              <a
                href={czechHref}
                aria-label="Česká verze"
                aria-current={en ? undefined : "page"}
                className={en ? "opacity-45 transition-opacity hover:opacity-100" : ""}
              >
                CZ
              </a>
              <span className="opacity-30">/</span>
              <a
                href={englishHref}
                aria-label="English version"
                aria-current={en ? "page" : undefined}
                className={en ? "" : "opacity-45 transition-opacity hover:opacity-100"}
              >
                EN
              </a>
            </span>
            <button
              type="button"
              aria-label={en ? "Search" : "Hledat"}
              onClick={() => setSearchOpen(true)}
              className="flex h-10 w-10 items-center justify-center transition-opacity hover:opacity-60"
            >
              <Search size={18} strokeWidth={1.5} />
            </button>
            <button
              type="button"
              aria-label={`${en ? "Saved properties" : "Oblíbené nemovitosti"}${favoritesCount ? ` (${favoritesCount})` : ""}`}
              onClick={() => setFavoritesOpen(true)}
              className="relative flex h-10 w-10 items-center justify-center transition-opacity hover:opacity-60"
            >
              <Heart size={18} strokeWidth={1.5} fill={favoritesCount ? "currentColor" : "none"} />
              {favoritesCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-[17px] min-w-[17px] items-center justify-center rounded-full bg-bronze px-1 text-[10px] font-semibold leading-none text-paper">
                  {favoritesCount}
                </span>
              )}
            </button>

            {/* Burger — otevírá mega menu, viditelný všude */}
            <button
              type="button"
              aria-label={en ? "Open menu" : "Otevřít menu"}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen(true)}
              className="group ml-2 flex h-11 items-center gap-3 pl-2"
            >
              <span className="hidden text-[12px] uppercase tracking-[0.2em] opacity-70 transition-opacity group-hover:opacity-100 md:block">
                Menu
              </span>
              <span className="flex h-11 w-11 flex-col items-center justify-center gap-[5px] rounded-full border transition-colors duration-300 [border-color:color-mix(in_srgb,currentColor_35%,transparent)] group-hover:[border-color:currentColor]">
                <span className="h-px w-[18px] bg-current transition-all duration-300 ease-luxe group-hover:w-[11px]" />
                <span className="h-px w-[18px] bg-current" />
                <span className="h-px w-[18px] bg-current transition-all duration-300 ease-luxe group-hover:w-[11px]" />
              </span>
            </button>
          </div>
        </div>
      </header>

      <MegaMenu open={menuOpen} onClose={() => setMenuOpen(false)} locale={locale} />
      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} locale={locale} />
      <FavoritesOverlay open={favoritesOpen} onClose={() => setFavoritesOpen(false)} locale={locale} />
    </>
  );
}
