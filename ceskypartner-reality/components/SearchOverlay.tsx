"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { ArrowUpRight, CornerDownLeft, MapPin, Newspaper, Search, SearchX, X } from "lucide-react";
import { ARTICLES } from "@/data/articles";
import { formatPrice, INVESTICE, KIND_LABELS, PRODEJ, PRONAJEM, type Listing } from "@/data/listings";
import type { SiteLocale } from "@/lib/locale";
import { INVESTMENT_EN, RENT_EN, SALE_EN } from "@/data/listings-en";

type SearchOverlayProps = {
  open: boolean;
  onClose: () => void;
  locale?: SiteLocale;
};

const ALL_LISTINGS: { listing: Listing; deal: string }[] = [
  ...PRODEJ.map((l) => ({ listing: l, deal: "Prodej" })),
  ...PRONAJEM.map((l) => ({ listing: l, deal: "Pronájem" })),
  ...INVESTICE.map((l) => ({ listing: l, deal: "Investice" })),
];

/** Rychlé odkazy pro prázdný stav */
const QUICK_LINKS = [
  { label: "Byty na prodej", href: "/nabidka/prodej?typ=byt" },
  { label: "Domy a vily na prodej", href: "/nabidka/prodej?typ=dum" },
  { label: "Byty k pronájmu", href: "/nabidka/pronajem?typ=byt" },
  { label: "Investiční příležitosti", href: "/nabidka/investicni" },
  { label: "Novinky v nabídce", href: "/nabidka/prodej?novinky=1" },
];
const QUICK_LINKS_EN = [
  { label: "Apartments for sale", href: "/en/properties/for-sale?type=apartment" },
  { label: "Houses and villas for sale", href: "/en/properties/for-sale?type=house" },
  { label: "Apartments to let", href: "/en/properties/to-let?type=apartment" },
  { label: "Investment opportunities", href: "/en/properties/investment" },
  { label: "New to the market", href: "/en/properties/for-sale?new=1" },
];
const ALL_LISTINGS_EN = [
  ...SALE_EN.map((listing) => ({ listing, deal: "For sale" })),
  ...RENT_EN.map((listing) => ({ listing, deal: "To let" })),
  ...INVESTMENT_EN.map((listing) => ({ listing, deal: "Investment" })),
];

const POPULAR_QUERIES = ["Praha 1", "Vinohrady", "vila", "terasa", "3+kk", "Brno"];

/** Odstranění diakritiky pro tolerantní hledání */
function normalize(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function listingHaystack({ listing, deal }: { listing: Listing; deal: string }): string {
  return normalize(
    [listing.title, listing.location, listing.disposition, KIND_LABELS[listing.kind], deal, listing.tag]
      .filter(Boolean)
      .join(" ")
  );
}

export default function SearchOverlay({ open, onClose, locale = "cs" }: SearchOverlayProps) {
  const en = locale === "en";
  const quickLinks = en ? QUICK_LINKS_EN : QUICK_LINKS;
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  // Skutečná nabídka z DB — statická data slouží jen jako fallback, když API selže
  const [dbItems, setDbItems] = useState<{ listing: Listing; deal: string }[] | null>(null);

  useEffect(() => {
    if (!open || dbItems) return;
    fetch("/api/listing-cards?all=1")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) setDbItems(data);
      })
      .catch(() => {});
  }, [open, dbItems]);

  // ESC + zámek scrollu + autofocus
  useEffect(() => {
    if (!open) return;
    document.documentElement.style.overflow = "hidden";
    const t = setTimeout(() => inputRef.current?.focus(), 350);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      document.documentElement.style.overflow = "";
      clearTimeout(t);
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  // Reset dotazu při zavření
  useEffect(() => {
    if (!open) setQuery("");
  }, [open]);

  const q = normalize(query.trim());
  const terms = q.split(/\s+/).filter(Boolean);

  const listingResults = useMemo(() => {
    if (terms.length === 0) return [];
    return (en ? ALL_LISTINGS_EN : dbItems ?? ALL_LISTINGS).filter((item) => {
      const hay = listingHaystack(item);
      return terms.every((t) => hay.includes(t));
    }).slice(0, 8);
  }, [terms, dbItems, en]);

  const articleResults = useMemo(() => {
    if (terms.length === 0) return [];
    if (en) return [];
    return ARTICLES.filter((a) => {
      const hay = normalize(`${a.title} ${a.category}`);
      return terms.every((t) => hay.includes(t));
    }).slice(0, 3);
  }, [terms, en]);

  const hasQuery = terms.length > 0;
  const hasResults = listingResults.length > 0 || articleResults.length > 0;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (listingResults.length > 0) {
      window.location.href = en
        ? `/en/property/${listingResults[0].listing.id}`
        : `/nemovitost/${listingResults[0].listing.id}`;
    }
  };

  const reveal = (i: number, extra = "") => ({
    className: `${extra} transition-all duration-700 ease-luxe ${
      open ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
    }`,
    style: { transitionDelay: open ? `${120 + i * 60}ms` : "0ms" },
  });

  return (
    <div
      className={`fixed inset-x-0 top-0 z-[75] h-[100dvh] bg-paper text-ink transition-[opacity,visibility] duration-500 ease-luxe ${
        open ? "visible opacity-100" : "invisible opacity-0"
      }`}
      role="dialog"
      aria-modal="true"
      aria-label={en ? "Search" : "Vyhledávání"}
    >
      <div className="flex h-full flex-col">
        {/* Vyhledávací pole */}
        <div className="mx-auto w-full max-w-site shrink-0 px-6 pt-10 xl:px-10">
          <div {...reveal(0)}>
            <div className="flex items-center justify-between gap-6">
              <p className="eyebrow text-muted">{en ? "Search" : "Hledání"}</p>
              <button
                type="button"
                onClick={onClose}
                aria-label={en ? "Close search" : "Zavřít vyhledávání"}
                className="group flex items-center gap-3 text-[12px] uppercase tracking-[0.2em] text-muted transition-colors hover:text-ink"
              >
                {en ? "Close" : "Zavřít"}
                <span className="flex h-11 w-11 items-center justify-center rounded-full border border-line text-ink transition-all duration-300 group-hover:rotate-90 group-hover:border-ink">
                  <X size={18} strokeWidth={1.5} />
                </span>
              </button>
            </div>

            <form onSubmit={submit} className="mt-6 flex items-center gap-5 border-b border-ink/20 pb-5 transition-colors focus-within:border-bronze">
              <Search size={26} strokeWidth={1.3} className="shrink-0 text-bronze" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={en ? "Search by location, property type or layout…" : "Hledejte lokalitu, typ nemovitosti, dispozici…"}
                aria-label={en ? "Search query" : "Vyhledávací dotaz"}
                className="w-full bg-transparent text-[clamp(1.4rem,2.6vw,2.2rem)] font-semibold tracking-[-0.01em] outline-none placeholder:font-normal placeholder:text-muted/50"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => {
                    setQuery("");
                    inputRef.current?.focus();
                  }}
                  aria-label={en ? "Clear query" : "Smazat dotaz"}
                  className="text-[12px] uppercase tracking-[0.16em] text-muted transition-colors hover:text-ink"
                >
                  {en ? "Clear" : "Smazat"}
                </button>
              )}
            </form>
          </div>
        </div>

        {/* Výsledky / prázdný stav */}
        <div className="mx-auto w-full max-w-site flex-1 overflow-y-auto px-6 pb-10 pt-8 xl:px-10">
          {!hasQuery && (
            <div {...reveal(1, "grid gap-14 lg:grid-cols-2")}>
              <div>
                <p className="eyebrow text-muted">{en ? "Browse property" : "Rychlé odkazy"}</p>
                <ul className="mt-6">
                  {quickLinks.map((link) => (
                    <li key={link.href}>
                      <a
                        href={link.href}
                        onClick={onClose}
                        className="group flex items-center justify-between border-b border-line py-4 text-[15.5px] transition-colors hover:text-bronze-deep"
                      >
                        <span className="transition-transform duration-[400ms] ease-luxe group-hover:translate-x-1.5">
                          {link.label}
                        </span>
                        <ArrowUpRight
                          size={15}
                          strokeWidth={1.5}
                          className="text-bronze opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                        />
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="eyebrow text-muted">{en ? "Popular searches" : "Zkuste hledat"}</p>
                <div className="mt-6 flex flex-wrap gap-2.5">
                  {POPULAR_QUERIES.map((term) => (
                    <button
                      key={term}
                      type="button"
                      onClick={() => {
                        setQuery(term);
                        inputRef.current?.focus();
                      }}
                      className="border border-line px-5 py-2.5 text-[13.5px] transition-all duration-300 hover:border-ink"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {hasQuery && hasResults && (
            <div className="grid gap-14 lg:grid-cols-[1.4fr_1fr]">
              {/* Nemovitosti */}
              <div>
                <p className="eyebrow text-muted" aria-live="polite">
                  {en ? "Properties" : "Nemovitosti"} — {listingResults.length}
                </p>
                <ul className="mt-5">
                  {listingResults.map(({ listing, deal }, i) => (
                    <li key={listing.id}>
                      <a
                        href={en ? `/en/property/${listing.id}` : `/nemovitost/${listing.id}`}
                        onClick={onClose}
                        className="group flex items-center gap-5 border-b border-line py-4 transition-colors hover:bg-stone/40"
                      >
                        <div className="relative h-[68px] w-[96px] shrink-0 overflow-hidden bg-stone">
                          <Image
                            src={listing.image}
                            alt=""
                            fill
                            sizes="96px"
                            className="object-cover transition-transform duration-700 ease-luxe group-hover:scale-105"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[15px] font-semibold tracking-[-0.01em]">
                            {listing.title}
                          </p>
                          <p className="mt-1 flex items-center gap-1.5 text-[12.5px] text-muted">
                            <MapPin size={12} strokeWidth={1.5} className="shrink-0 text-bronze" />
                            {listing.location}
                            <span className="text-line">|</span>
                            {deal}
                            {listing.disposition ? ` · ${listing.disposition}` : ""}
                          </p>
                        </div>
                        <p className="hidden shrink-0 text-[14px] font-semibold text-bronze-deep sm:block">
                          {formatPrice(listing)}
                        </p>
                        {i === 0 && (
                          <span className="hidden items-center gap-1 text-[11px] uppercase tracking-[0.14em] text-muted/60 md:flex">
                            <CornerDownLeft size={12} strokeWidth={1.5} />
                            Enter
                          </span>
                        )}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Články */}
              {articleResults.length > 0 && (
                <div>
                  <p className="eyebrow text-muted">Aktuálně — {articleResults.length}</p>
                  <ul className="mt-5">
                    {articleResults.map((article) => (
                      <li key={article.id}>
                        <a
                          href="/#aktualne"
                          onClick={onClose}
                          className="group flex items-start gap-4 border-b border-line py-4"
                        >
                          <Newspaper size={16} strokeWidth={1.5} className="mt-1 shrink-0 text-bronze" />
                          <span>
                            <span className="block text-[14.5px] font-semibold leading-snug tracking-[-0.01em]">
                              <span className="card-title">{article.title}</span>
                            </span>
                            <span className="mt-1.5 block text-[12px] text-muted">
                              {article.category} · {article.date}
                            </span>
                          </span>
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {hasQuery && !hasResults && (
            <div className="flex flex-col items-center border border-line bg-stone/50 px-8 py-20 text-center">
              <SearchX size={32} strokeWidth={1.2} className="text-bronze" />
              <p className="mt-5 text-[18px] font-semibold">
                {en ? `No results for “${query.trim()}”` : `Pro „${query.trim()}“ jsme nic nenašli`}
              </p>
              <p className="mt-2 max-w-md text-[14px] leading-relaxed text-muted">
                {en
                  ? "Try another location, layout or property type. Alternatively, speak to us — the right property may be available discreetly, off market."
                  : "Zkuste jiný výraz — lokalitu, dispozici nebo typ nemovitosti. Nebo nám zavolejte, hledaná nemovitost může být v diskrétní nabídce."}
              </p>
              <a
                href="tel:+420224000111"
                className="mt-8 border border-ink px-8 py-3.5 text-[12.5px] font-semibold uppercase tracking-[0.16em] transition-colors duration-300 hover:bg-ink hover:text-paper"
              >
                +420 224 000 111
              </a>
            </div>
          )}
        </div>

        {/* Nápověda — klávesové zkratky jen na desktopu */}
        <div className="mx-auto hidden h-14 w-full max-w-site shrink-0 items-center gap-8 border-t border-line px-6 text-[11.5px] uppercase tracking-[0.14em] text-muted/70 md:flex xl:px-10">
          <span className="flex items-center gap-2">
            <CornerDownLeft size={12} strokeWidth={1.5} />
            {en ? "open first result" : "otevřít první výsledek"}
          </span>
          <span>ESC — {en ? "close" : "zavřít"}</span>
        </div>
      </div>
    </div>
  );
}
