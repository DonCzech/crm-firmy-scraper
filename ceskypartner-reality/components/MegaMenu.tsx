"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { ArrowRight, ArrowUpRight, Facebook, Instagram, Linkedin, Mail, Phone, X } from "lucide-react";
import { formatPrice, INVESTICE, PRODEJ, PRONAJEM } from "@/data/listings";
import Logo from "./Logo";
import PropertySearchModal from "./PropertySearchModal";
import type { SiteLocale } from "@/lib/locale";
import { SALE_EN } from "@/data/listings-en";
import { toCzechPath, toEnglishPath } from "@/lib/i18nRoutes";

type MegaMenuProps = {
  open: boolean;
  onClose: () => void;
  locale?: SiteLocale;
};

type SearchPreset = { offer: string; type?: string };

type MenuCounts = {
  deals: Record<string, number>;
  kinds: Record<string, number>;
  newCount: number;
  featured: {
    title: string;
    slug: string;
    location: string;
    price: number;
    isRent: boolean;
    tag: string | null;
    image: string | null;
  } | null;
};

/** Hlavní sekce nabídky — otevírají vyhledávání s přednastaveným typem nabídky */
const MAIN_LINKS: { label: string; preset: SearchPreset; deal: string; fallback: number }[] = [
  { label: "Prodej", preset: { offer: "Prodej" }, deal: "SALE", fallback: PRODEJ.length },
  { label: "Pronájem", preset: { offer: "Pronájem" }, deal: "RENT", fallback: PRONAJEM.length },
  { label: "Investice", preset: { offer: "Investice" }, deal: "INVESTMENT", fallback: INVESTICE.length },
];

const SECONDARY_LINKS = [
  { label: "Služby", href: "/sluzby" },
  { label: "O nás", href: "/o-nas" },
  { label: "Blog", href: "/blog" },
  { label: "Kontakt", href: "/kontakt" },
];

/** Detailní kategorie — otevírají vyhledávání s přednastaveným typem nabídky i nemovitosti.
 *  `kindKey` = "DEAL:KIND" pro reálný počet z DB, "new" = novinky. */
const CATEGORY_LINKS: { label: string; preset?: SearchPreset; href?: string; kindKey: string; fallback: number }[] = [
  { label: "Byty prodej", preset: { offer: "Prodej", type: "Byt" }, kindKey: "SALE:APARTMENT", fallback: PRODEJ.filter((l) => l.kind === "byt").length },
  { label: "Byty pronájem", preset: { offer: "Pronájem", type: "Byt" }, kindKey: "RENT:APARTMENT", fallback: PRONAJEM.filter((l) => l.kind === "byt").length },
  { label: "Rodinné domy a vily prodej", preset: { offer: "Prodej", type: "Rodinný dům" }, kindKey: "SALE:HOUSE", fallback: PRODEJ.filter((l) => l.kind === "dum").length },
  { label: "Rodinné domy a vily pronájem", preset: { offer: "Pronájem", type: "Rodinný dům" }, kindKey: "RENT:HOUSE", fallback: PRONAJEM.filter((l) => l.kind === "dum").length },
  { label: "Komerční prostory", preset: { offer: "Pronájem", type: "Obchodní prostory" }, kindKey: "RENT:COMMERCIAL", fallback: PRONAJEM.filter((l) => l.kind === "komercni").length },
  { label: "Pozemky", preset: { offer: "Investice", type: "Pozemek" }, kindKey: "INVESTMENT:LAND", fallback: INVESTICE.filter((l) => l.kind === "pozemek").length },
  { label: "Činžovní a bytové domy", preset: { offer: "Investice", type: "Bytový dům" }, kindKey: "INVESTMENT:COMMERCIAL", fallback: INVESTICE.filter((l) => l.kind === "komercni").length },
  { label: "Nově zařazené nemovitosti", href: "/nabidka/prodej?novinky=1", kindKey: "new", fallback: PRODEJ.filter((l) => l.tag === "Novinka").length },
];

const FEATURED = PRODEJ[0];

const MAIN_LINKS_EN = [
  { label: "For sale", preset: { offer: "Prodej" }, deal: "SALE", fallback: PRODEJ.length },
  { label: "To let", preset: { offer: "Pronájem" }, deal: "RENT", fallback: PRONAJEM.length },
  { label: "Investment", preset: { offer: "Investice" }, deal: "INVESTMENT", fallback: INVESTICE.length },
];
const SECONDARY_LINKS_EN = [
  { label: "Services", href: "/en/services" },
  { label: "About us", href: "/en/about" },
  { label: "Journal", href: "/en/journal" },
  { label: "Contact", href: "/en/contact" },
];
const CATEGORY_LINKS_EN = [
  { ...CATEGORY_LINKS[0], label: "Apartments for sale" },
  { ...CATEGORY_LINKS[1], label: "Apartments to let" },
  { ...CATEGORY_LINKS[2], label: "Houses and villas for sale" },
  { ...CATEGORY_LINKS[3], label: "Houses and villas to let" },
  { ...CATEGORY_LINKS[4], label: "Commercial property" },
  { ...CATEGORY_LINKS[5], label: "Land" },
  { ...CATEGORY_LINKS[6], label: "Income properties" },
  { ...CATEGORY_LINKS[7], label: "New to the market", href: "/en/properties/for-sale?new=1" },
];

export default function MegaMenu({ open, onClose, locale = "cs" }: MegaMenuProps) {
  const en = locale === "en";
  const mainLinks = en ? MAIN_LINKS_EN : MAIN_LINKS;
  const secondaryLinks = en ? SECONDARY_LINKS_EN : SECONDARY_LINKS;
  const categoryLinks = en ? CATEGORY_LINKS_EN : CATEGORY_LINKS;
  const pathname = usePathname();
  const czechHref = toCzechPath(pathname);
  const englishHref = toEnglishPath(pathname);
  const [searchPreset, setSearchPreset] = useState<SearchPreset | null>(null);
  const [counts, setCounts] = useState<MenuCounts | null>(null);

  // Reálné počty z DB při otevření menu
  useEffect(() => {
    if (!open || counts) return;
    fetch("/api/menu-counts")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => data && setCounts(data))
      .catch(() => {});
  }, [open, counts]);

  const dealCount = (deal: string, fallback: number) => counts?.deals[deal] ?? fallback;
  const kindCount = (key: string, fallback: number) =>
    counts ? (key === "new" ? counts.newCount : counts.kinds[key] ?? 0) : fallback;

  // Vybraná nemovitost — reálná z DB, statická jen jako fallback
  const featured = !en && counts?.featured
    ? {
        href: `/nemovitost/${counts.featured.slug}`,
        title: counts.featured.title,
        location: counts.featured.location,
        priceLabel: `${counts.featured.price.toLocaleString("cs-CZ")} Kč${counts.featured.isRent ? " / měsíc" : ""}`,
        tag: counts.featured.tag,
        image: counts.featured.image ?? FEATURED.image,
      }
    : {
        href: en ? `/en/property/${FEATURED.id}` : `/nemovitost/${FEATURED.id}`,
        title: en ? SALE_EN[0].title : FEATURED.title,
        location: en ? SALE_EN[0].location : FEATURED.location,
        priceLabel: formatPrice(en ? SALE_EN[0] : FEATURED, en ? "en" : "cs"),
        tag: en ? SALE_EN[0].tag ?? null : FEATURED.tag ?? null,
        image: en ? SALE_EN[0].image : FEATURED.image,
      };

  // ESC + zámek scrollu (ESC nechá zpracovat modal vyhledávání, pokud je otevřený)
  useEffect(() => {
    if (!open) return;
    document.documentElement.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !searchPreset) onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.documentElement.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose, searchPreset]);

  const reveal = () =>
    `transition-all duration-700 ease-luxe ${
      open ? "translate-y-0 opacity-100" : "translate-y-7 opacity-0"
    }`;
  const delay = (i: number) => ({ transitionDelay: open ? `${140 + i * 55}ms` : "0ms" });

  return (
    <div
      className={`fixed inset-x-0 top-0 z-[70] h-[100dvh] bg-paper text-ink transition-[opacity,visibility] duration-500 ease-luxe ${
        open ? "visible opacity-100" : "invisible opacity-0"
      }`}
      role="dialog"
      aria-modal="true"
      aria-label={en ? "Main menu" : "Hlavní menu"}
    >
      <div className="flex h-full flex-col">
        {/* Horní lišta */}
        <div className="mx-auto flex h-[88px] w-full max-w-site shrink-0 items-center justify-between border-b border-line px-6 xl:px-10">
          <a href={en ? "/en" : "/"} onClick={onClose} aria-label={en ? "Český Partner — English homepage" : "Český Partner — úvodní stránka"}>
            <Logo locale={locale} />
          </a>
          <button
            type="button"
            onClick={onClose}
            aria-label={en ? "Close menu" : "Zavřít menu"}
            className="group flex items-center gap-3 text-[12px] uppercase tracking-[0.2em] text-muted transition-colors hover:text-ink"
          >
            {en ? "Close" : "Zavřít"}
            <span className="flex h-11 w-11 items-center justify-center rounded-full border border-line text-ink transition-all duration-300 group-hover:rotate-90 group-hover:border-ink">
              <X size={18} strokeWidth={1.5} />
            </span>
          </button>
        </div>

        {/* Obsah */}
        <div className="mx-auto grid w-full max-w-site flex-1 gap-x-16 gap-y-12 overflow-y-auto px-6 pb-10 pt-8 md:pt-12 lg:grid-cols-[1.05fr_0.95fr_400px] xl:px-10">
          {/* Sloupec A — hlavní odkazy */}
          <nav aria-label={en ? "Property menu" : "Hlavní nabídka"}>
            <p className={`eyebrow text-muted ${reveal()}`} style={delay(0)}>
              {en ? "Property" : "Nabídka nemovitostí"}
            </p>
            <ul className="mt-6">
              {mainLinks.map((item, i) => (
                <li key={item.label} className={reveal()} style={delay(i + 1)}>
                  <button
                    type="button"
                    onClick={() => setSearchPreset(item.preset)}
                    className="group flex w-full items-baseline gap-4 border-b border-line py-5 text-left"
                  >
                    <span className="text-[clamp(2rem,3.6vw,3.1rem)] font-semibold leading-none tracking-[-0.02em] transition-all duration-[400ms] ease-luxe group-hover:translate-x-2 group-hover:text-bronze-deep">
                      {item.label}
                    </span>
                    <sup className="text-[13px] font-normal text-muted transition-colors group-hover:text-bronze-deep">
                      {dealCount(item.deal, item.fallback)}
                    </sup>
                    <ArrowRight
                      size={22}
                      strokeWidth={1.5}
                      className="ml-auto -translate-x-3 self-center text-bronze opacity-0 transition-all duration-[400ms] ease-luxe group-hover:translate-x-0 group-hover:opacity-100"
                    />
                  </button>
                </li>
              ))}
            </ul>

            <ul className="mt-9 flex flex-wrap gap-x-8 gap-y-3">
              {secondaryLinks.map((item, i) => (
                <li key={item.href} className={reveal()} style={delay(i + 4)}>
                  <a
                    href={item.href}
                    onClick={onClose}
                    className="nav-link text-[14px] text-muted transition-colors hover:text-ink"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* Sloupec B — detailní kategorie */}
          <nav aria-label={en ? "Property categories" : "Kategorie nemovitostí"}>
            <p className={`eyebrow text-muted ${reveal()}`} style={delay(1)}>
              {en ? "Categories" : "Kategorie"}
            </p>
            <ul className="mt-6">
              {categoryLinks.map((item, i) => {
                const inner = (
                  <>
                    <span className="transition-transform duration-[400ms] ease-luxe group-hover:translate-x-1.5">
                      {item.label}
                    </span>
                    <span className="flex items-center gap-3">
                      <span className="text-[12px] text-muted/70 transition-colors group-hover:text-bronze-deep">
                        {kindCount(item.kindKey, item.fallback)}
                      </span>
                      <ArrowUpRight
                        size={14}
                        strokeWidth={1.5}
                        className="text-bronze opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                      />
                    </span>
                  </>
                );
                const cls =
                  "group flex w-full items-center justify-between border-b border-line py-3.5 text-[15px] text-ink/75 transition-colors hover:text-ink";
                return (
                  <li key={item.label} className={reveal()} style={delay(i + 2)}>
                    {item.preset ? (
                      <button type="button" onClick={() => setSearchPreset(item.preset!)} className={`${cls} text-left`}>
                        {inner}
                      </button>
                    ) : (
                      <a href={item.href} onClick={onClose} className={cls}>
                        {inner}
                      </a>
                    )}
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Sloupec C — vybraná nemovitost + kontakt */}
          <div className="hidden lg:block">
            <p className={`eyebrow text-muted ${reveal()}`} style={delay(2)}>
              {en ? "Featured property" : "Vybraná nemovitost"}
            </p>
            <a
              href={featured.href}
              onClick={onClose}
              className={`group mt-6 block ${reveal()}`}
              style={delay(3)}
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-stone">
                <Image
                  src={featured.image}
                  alt={featured.title}
                  fill
                  sizes="400px"
                  className="object-cover transition-transform duration-[900ms] ease-luxe group-hover:scale-105"
                />
                {featured.tag && featured.tag !== "Exkluzivně" && (
                  <span className="absolute left-4 top-4 bg-ink/40 px-3 py-1.5 text-[10px] uppercase tracking-[0.18em] text-paper backdrop-blur-sm">
                    {featured.tag}
                  </span>
                )}
              </div>
              <p className="mt-5 text-[17px] font-semibold leading-snug tracking-[-0.01em]">
                <span className="card-title">{featured.title}</span>
              </p>
              <p className="mt-1.5 text-[13px] text-muted">{featured.location}</p>
              <p className="mt-3 text-[15px] font-semibold text-bronze-deep">{featured.priceLabel}</p>
            </a>

            <div className={`mt-10 border-t border-line pt-7 ${reveal()}`} style={delay(5)}>
              <a href="tel:+420224000111" className="flex items-center gap-2.5 text-[14px] text-muted transition-colors hover:text-ink">
                <Phone size={14} strokeWidth={1.5} className="text-bronze" />
                +420 224 000 111
              </a>
              <a href="mailto:info@ceskypartner.cz" className="mt-2.5 flex items-center gap-2.5 text-[14px] text-muted transition-colors hover:text-ink">
                <Mail size={14} strokeWidth={1.5} className="text-bronze" />
                info@ceskypartner.cz
              </a>
            </div>
          </div>
        </div>

        {/* Spodní lišta */}
        <div
          className={`mx-auto flex h-16 w-full max-w-site shrink-0 items-center justify-between border-t border-line px-6 text-[12px] text-muted xl:px-10 ${reveal()}`}
          style={delay(6)}
        >
          <span className="tracking-[0.04em]">Český Partner s.r.o. — {en ? "Real Estate" : "Realitní kancelář"}</span>
          <div className="flex items-center gap-5">
            {[
              { icon: Instagram, label: "Instagram" },
              { icon: Facebook, label: "Facebook" },
              { icon: Linkedin, label: "LinkedIn" },
            ].map((s) => (
              <a key={s.label} href="#" aria-label={s.label} className="transition-colors hover:text-bronze-deep">
                <s.icon size={16} strokeWidth={1.5} />
              </a>
            ))}
            <span className="ml-3 flex items-center gap-2">
              <a href={czechHref} className={en ? "transition-colors hover:text-ink" : "font-semibold text-ink"}>CZ</a>
              <span className="opacity-40">/</span>
              <a href={englishHref} className={en ? "font-semibold text-ink" : "transition-colors hover:text-ink"}>EN</a>
            </span>
          </div>
        </div>
      </div>

      {/* Vyhledávání s přednastavením — otevírá se nad menu, zavřením se vrátí do menu */}
      <PropertySearchModal
        open={!!searchPreset}
        onClose={() => setSearchPreset(null)}
        initialOfferType={searchPreset?.offer}
        initialPropertyType={searchPreset?.type ?? ""}
        locale={locale}
      />
    </div>
  );
}
