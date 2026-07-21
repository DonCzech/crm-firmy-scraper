"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import dynamic from "next/dynamic";
import { ArrowDownUp, ArrowUpRight, ChevronDown, LayoutGrid, Map as MapIcon, MapPin, Maximize2, Minimize2, Rows3, SearchX, List, X } from "lucide-react";
import { formatPrice, KIND_LABELS, type Listing, type ListingKind } from "@/data/listings";
import { BLUR_DATA_URL } from "@/lib/blur";
import FavoriteButton from "./FavoriteButton";
import Reveal from "./Reveal";
import WatchdogForm from "./WatchdogForm";
import type { SiteLocale } from "@/lib/locale";

/** Leaflet jen na klientu */
const ListingsMap = dynamic(() => import("./ListingsMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-stone/60 text-[13px] text-muted">
      <span className="h-2 w-2 animate-pulse rounded-full bg-bronze" aria-hidden="true" />
    </div>
  ),
});

type SortKey = "vychozi" | "cena-asc" | "cena-desc" | "plocha-desc";

const SORT_LABELS: Record<SortKey, string> = {
  vychozi: "Doporučené",
  "cena-asc": "Cena od nejnižší",
  "cena-desc": "Cena od nejvyšší",
  "plocha-desc": "Plocha od největší",
};
const SORT_LABELS_EN: Record<SortKey, string> = {
  vychozi: "Recommended",
  "cena-asc": "Price: low to high",
  "cena-desc": "Price: high to low",
  "plocha-desc": "Largest floor area",
};
const KIND_LABELS_EN: Record<ListingKind, string> = {
  byt: "Apartments",
  dum: "Houses and villas",
  pozemek: "Land",
  komercni: "Commercial",
};
const TAG_LABELS_EN: Record<string, string> = {
  Novinka: "New",
  Exkluzivně: "Exclusive",
  Investice: "Investment",
  Pronájem: "To let",
  Rezervováno: "Reserved",
  Prodáno: "Sold",
};

type CategoryBrowserProps = {
  listings: Listing[];
  initialKind?: ListingKind | null;
  initialNewOnly?: boolean;
  title?: string;
  /** SALE | RENT | INVESTMENT — pro hlídacího psa v prázdném stavu */
  deal?: string;
  locale?: SiteLocale;
};

/** Kolik inzerátů se vykreslí najednou — další se donačítají tlačítkem */
const PAGE_SIZE = 12;

/** Velká editorial karta — 2 na řádek (compact = mobilní zobrazení 2 na řádek) */
function LargeCard({ listing, index, compact = false, locale = "cs" }: { listing: Listing; index: number; compact?: boolean; locale?: SiteLocale }) {
  const en = locale === "en";
  const meta = [
    listing.disposition,
    `${listing.area.toLocaleString(en ? "en-GB" : "cs-CZ")} m²`,
    listing.yieldPa && `${en ? "Yield" : "Výnos"} ${listing.yieldPa}`,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <Reveal delay={(index % 2) * 100}>
      <a
        href={en ? `/en/property/${listing.id}` : `/nemovitost/${listing.id}`}
        className="group block"
        aria-label={`${listing.title}, ${listing.location}`}
      >
        <div className="relative aspect-[16/10] overflow-hidden bg-stone">
          <Image
            src={listing.image}
            alt={listing.title}
            fill
            placeholder="blur"
            blurDataURL={BLUR_DATA_URL}
            sizes={compact ? "50vw" : "(min-width: 1024px) 48vw, 100vw"}
            className="object-cover transition-transform duration-[900ms] ease-luxe group-hover:scale-[1.04]"
          />
          {listing.tag && listing.tag !== "Exkluzivně" && (
            <span className={`absolute bg-ink font-semibold uppercase text-paper ${compact ? "left-2.5 top-2.5 px-2 py-1 text-[9px] tracking-[0.14em]" : "left-5 top-5 px-3.5 py-1.5 text-[10.5px] tracking-[0.18em]"}`}>
              {en ? TAG_LABELS_EN[listing.tag] ?? listing.tag : listing.tag}
            </span>
          )}
          {!compact && <FavoriteButton id={listing.id} className="absolute right-5 top-5" locale={locale} />}
          <span className="absolute bottom-5 right-5 flex h-11 w-11 translate-y-2 items-center justify-center rounded-full bg-paper text-ink opacity-0 transition-all duration-[400ms] ease-luxe group-hover:translate-y-0 group-hover:opacity-100">
            <ArrowUpRight size={17} strokeWidth={1.5} />
          </span>
        </div>

        {compact ? (
          <div className="pt-3">
            <h2 className="line-clamp-2 text-[13.5px] font-semibold leading-snug tracking-[-0.01em]">
              <span className="card-title">{listing.title}</span>
            </h2>
            <p className="mt-1.5 flex items-center gap-1 text-[11.5px] text-muted">
              <MapPin size={11} strokeWidth={1.5} className="shrink-0 text-bronze" />
              <span className="truncate">{listing.location}</span>
            </p>
            <p className="mt-1.5 text-[13px] font-semibold tracking-[-0.01em] text-bronze-deep">
              {formatPrice(listing, locale)}
            </p>
          </div>
        ) : (
          <div className="flex flex-wrap items-start justify-between gap-x-8 gap-y-3 pt-6">
            <div className="min-w-0">
              <h2 className="text-[clamp(1.2rem,1.6vw,1.5rem)] font-semibold leading-snug tracking-[-0.01em]">
                <span className="card-title">{listing.title}</span>
              </h2>
              <p className="mt-2.5 flex items-center gap-1.5 text-[13.5px] text-muted">
                <MapPin size={14} strokeWidth={1.5} className="shrink-0 text-bronze" />
                {listing.location}
                <span className="mx-1.5 text-line">|</span>
                {meta}
              </p>
            </div>
            <p className="text-[17px] font-semibold tracking-[-0.01em] text-bronze-deep">
              {formatPrice(listing, locale)}
            </p>
          </div>
        )}
        <div className={`border-b border-line ${compact ? "mt-3" : "mt-5"}`} />
      </a>
    </Reveal>
  );
}

/** Řádková karta — Remax styl: fotografie vlevo (hlavní + 3 náhledy), obsah a cena vpravo */
function RowCard({ listing, index, locale = "cs" }: { listing: Listing; index: number; locale?: SiteLocale }) {
  const en = locale === "en";
  const thumbs = (listing.images ?? [])
    .filter((url) => url !== listing.image)
    .slice(0, 3);
  const meta = [
    listing.disposition,
    `${listing.area.toLocaleString(en ? "en-GB" : "cs-CZ")} m²`,
    listing.yieldPa && `${en ? "Yield" : "Výnos"} ${listing.yieldPa}`,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <Reveal delay={Math.min(index, 2) * 80}>
      <a
        href={en ? `/en/property/${listing.id}` : `/nemovitost/${listing.id}`}
        className="group grid gap-7 border-b border-line pb-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-10"
        aria-label={`${listing.title}, ${listing.location}`}
      >
        <div>
          <div className="relative aspect-[4/3] overflow-hidden bg-stone">
            <Image
              src={listing.image}
              alt={listing.title}
              fill
              placeholder="blur"
              blurDataURL={BLUR_DATA_URL}
              sizes="(min-width: 1024px) 38vw, 100vw"
              className="object-cover transition-transform duration-[900ms] ease-luxe group-hover:scale-[1.04]"
            />
            {listing.tag && listing.tag !== "Exkluzivně" && (
              <span className="absolute left-4 top-4 bg-ink px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-paper">
                {en ? TAG_LABELS_EN[listing.tag] ?? listing.tag : listing.tag}
              </span>
            )}
            <FavoriteButton id={listing.id} className="absolute right-4 top-4" locale={locale} />
          </div>
          {thumbs.length > 0 && (
            <div className="mt-2 grid grid-cols-3 gap-2">
              {thumbs.map((src) => (
                <div key={src} className="relative aspect-[4/3] overflow-hidden bg-stone">
                  <Image
                    src={src}
                    alt=""
                    fill
                    placeholder="blur"
                    blurDataURL={BLUR_DATA_URL}
                    sizes="(min-width: 1024px) 12vw, 33vw"
                    className="object-cover transition-transform duration-[900ms] ease-luxe group-hover:scale-[1.05]"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex min-w-0 flex-col lg:py-1">
          <h2 className="text-[clamp(1.25rem,1.8vw,1.65rem)] font-semibold leading-snug tracking-[-0.01em]">
            <span className="card-title">{listing.title}</span>
          </h2>
          <p className="mt-3 flex items-center gap-1.5 text-[14px] text-muted">
            <MapPin size={14} strokeWidth={1.5} className="shrink-0 text-bronze" />
            {listing.location}
            {meta && (
              <>
                <span className="mx-1.5 text-line">|</span>
                {meta}
              </>
            )}
          </p>
          {listing.description && (
            <p className="mt-5 line-clamp-3 max-w-2xl text-[14.5px] leading-[1.75] text-muted">
              {listing.description}
            </p>
          )}
          <div className="mt-auto flex flex-wrap items-end justify-between gap-x-8 gap-y-4 pt-7">
            <p className="text-[21px] font-semibold tracking-[-0.01em] text-bronze-deep">
              {formatPrice(listing, locale)}
            </p>
            <span className="flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.16em] text-muted transition-colors duration-300 group-hover:text-ink">
              {en ? "View property" : "Detail nemovitosti"}
              <ArrowUpRight size={15} strokeWidth={1.5} className="text-bronze transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </span>
          </div>
        </div>
      </a>
    </Reveal>
  );
}

export default function CategoryBrowser({
  listings,
  initialKind = null,
  initialNewOnly = false,
  title,
  deal,
  locale = "cs",
}: CategoryBrowserProps) {
  const en = locale === "en";
  const [kind, setKind] = useState<ListingKind | null>(initialKind);
  const [city, setCity] = useState<string>("vse");
  const [newOnly, setNewOnly] = useState(initialNewOnly);
  const [sort, setSort] = useState<SortKey>("vychozi");
  const [showMap, setShowMap] = useState(false);
  const [mapExpanded, setMapExpanded] = useState(false);
  const [twoCols, setTwoCols] = useState(false);
  const [rowView, setRowView] = useState(false);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  // Filtry typu/novinek držíme v URL — reload i sdílení odkazu zachová stav
  useEffect(() => {
    const url = new URL(window.location.href);
    const kindKey = en ? "type" : "typ";
    const newKey = en ? "new" : "novinky";
    const englishKind: Record<ListingKind, string> = {
      byt: "apartment",
      dum: "house",
      pozemek: "land",
      komercni: "commercial",
    };
    if (kind) url.searchParams.set(kindKey, en ? englishKind[kind] : kind); else url.searchParams.delete(kindKey);
    if (newOnly) url.searchParams.set(newKey, "1"); else url.searchParams.delete(newKey);
    window.history.replaceState(null, "", url.toString());
  }, [kind, newOnly, en]);

  // Změna filtru resetuje stránkování
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [kind, city, newOnly, sort]);

  // V mapovém režimu skryjeme hero stránky a sjedeme přímo na mapu,
  // aby vyplnila celý viewport (vč. zoom tlačítek) a byl vidět scrollovatelný seznam
  useEffect(() => {
    const hero = document.getElementById("category-hero");
    if (hero) hero.classList.toggle("hidden", showMap);
    if (showMap) {
      requestAnimationFrame(() => {
        const target = document.getElementById("map-results");
        if (target) {
          const top = target.getBoundingClientRect().top + window.scrollY - 64;
          window.scrollTo({ top, behavior: "smooth" });
        } else {
          window.scrollTo({ top: 0 });
        }
      });
    }
    return () => hero?.classList.remove("hidden");
  }, [showMap]);

  // Fullscreen mapa — zámek scrollu + Esc pro zavření
  useEffect(() => {
    if (!mapExpanded) return;
    document.documentElement.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMapExpanded(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.documentElement.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [mapExpanded]);

  const kinds = useMemo(
    () => (Object.keys(KIND_LABELS) as ListingKind[]).filter((k) => listings.some((l) => l.kind === k)),
    [listings]
  );
  const cities = useMemo(
    () =>
      Array.from(new Set(listings.map((l) => l.location.split(" — ")[0]))).sort((a, b) =>
        a.localeCompare(b, "cs")
      ),
    [listings]
  );

  const filtered = useMemo(() => {
    let out = listings.filter(
      (l) =>
        (!kind || l.kind === kind) &&
        (city === "vse" || l.location.startsWith(city)) &&
        (!newOnly || l.tag === "Novinka")
    );
    if (sort === "cena-asc") out = [...out].sort((a, b) => a.price - b.price);
    if (sort === "cena-desc") out = [...out].sort((a, b) => b.price - a.price);
    if (sort === "plocha-desc") out = [...out].sort((a, b) => b.area - a.area);
    return out;
  }, [listings, kind, city, newOnly, sort]);

  const chipClass = (active: boolean) =>
    `border px-5 py-2.5 text-[13px] tracking-[0.02em] transition-all duration-300 ${
      active
        ? "border-ink bg-ink text-paper"
        : "border-line bg-paper text-ink hover:border-ink"
    }`;

  return (
    <div>
      {/* Filtry */}
      <div className="border-y border-line py-5">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between lg:gap-8">
          <div className="flex flex-wrap items-center gap-2.5">
            <button type="button" onClick={() => setKind(null)} className={chipClass(kind === null)}>
              {en ? "All" : "Vše"}
            </button>
            {kinds.map((k) => (
              <button key={k} type="button" onClick={() => setKind(k)} className={chipClass(kind === k)}>
                {en ? KIND_LABELS_EN[k] : KIND_LABELS[k]}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setNewOnly((v) => !v)}
              className={chipClass(newOnly)}
              aria-pressed={newOnly}
            >
              {en ? "New listings only" : "Jen novinky"}
            </button>
            {/* Přepínač hustoty mřížky — mobil a tablet */}
            <button
              type="button"
              onClick={() => setTwoCols((v) => !v)}
              aria-pressed={twoCols}
              aria-label={twoCols ? (en ? "Show one property per row" : "Zobrazit 1 inzerát na řádek") : (en ? "Show two properties per row" : "Zobrazit 2 inzeráty na řádek")}
              className={`${chipClass(twoCols)} flex items-center gap-2 lg:hidden`}
            >
              {twoCols ? <Rows3 size={14} strokeWidth={1.7} /> : <LayoutGrid size={14} strokeWidth={1.7} />}
              {twoCols ? (en ? "1 per row" : "1 na řádek") : (en ? "2 per row" : "2 na řádek")}
            </button>
          </div>

          {/* Desktopové akce jsou na stejné ose jako kategorie. */}
          <div className="hidden shrink-0 items-center gap-3 lg:flex">
            <div className="flex border border-line" role="group" aria-label={en ? "View options" : "Způsob zobrazení"}>
              <button
                type="button"
                onClick={() => setRowView(false)}
                aria-pressed={!rowView}
                aria-label={en ? "Grid view" : "Zobrazit jako mřížku"}
                className={`flex h-[42px] w-[46px] items-center justify-center transition-colors duration-300 ${
                  !rowView ? "bg-ink text-paper" : "bg-paper text-muted hover:text-ink"
                }`}
              >
                <LayoutGrid size={15} strokeWidth={1.7} />
              </button>
              <button
                type="button"
                onClick={() => setRowView(true)}
                aria-pressed={rowView}
                aria-label={en ? "List view" : "Zobrazit jako řádky"}
                className={`flex h-[42px] w-[46px] items-center justify-center border-l border-line transition-colors duration-300 ${
                  rowView ? "bg-ink text-paper" : "bg-paper text-muted hover:text-ink"
                }`}
              >
                <Rows3 size={15} strokeWidth={1.7} />
              </button>
            </div>
            <button
              type="button"
              onClick={() => setShowMap((v) => !v)}
              aria-pressed={showMap}
              className={`flex h-[42px] items-center gap-2.5 border px-5 text-[13px] font-semibold tracking-[0.02em] transition-all duration-300 ${
                showMap
                  ? "border-ink bg-ink text-paper"
                  : "border-line bg-paper text-ink hover:border-ink"
              }`}
            >
              {showMap ? <List size={15} strokeWidth={1.7} /> : <MapIcon size={15} strokeWidth={1.7} />}
              {showMap ? (en ? "View list" : "Zobrazit seznam") : (en ? "View on map" : "Zobrazit na mapě")}
            </button>
          </div>
        </div>

        {/* Sekundární nástroje mají vlastní řádek, aby nerozbíjely osu hlavních filtrů. */}
        <div className="mt-4 flex flex-wrap items-center justify-end gap-x-6 gap-y-3 border-t border-line/70 pt-4">
          <label className="relative flex items-center gap-2 text-[13px] text-muted">
            <MapPin size={14} strokeWidth={1.5} className="text-bronze" />
            <select
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="cursor-pointer appearance-none bg-transparent pr-6 text-[13px] text-ink outline-none"
            >
              <option value="vse">{en ? "All locations" : "Všechny lokality"}</option>
              {cities.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <ChevronDown size={13} strokeWidth={1.5} className="pointer-events-none absolute right-0 text-muted" />
          </label>

          <label className="relative flex items-center gap-2 text-[13px] text-muted">
            <ArrowDownUp size={14} strokeWidth={1.5} className="text-bronze" />
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              className="cursor-pointer appearance-none bg-transparent pr-6 text-[13px] text-ink outline-none"
            >
              {(Object.keys(SORT_LABELS) as SortKey[]).map((s) => (
                <option key={s} value={s}>{en ? SORT_LABELS_EN[s] : SORT_LABELS[s]}</option>
              ))}
            </select>
            <ChevronDown size={13} strokeWidth={1.5} className="pointer-events-none absolute right-0 text-muted" />
          </label>

          {/* Mapa zůstává dostupná v sekundárním řádku pod desktop breakpointem. */}
          <button
            type="button"
            onClick={() => setShowMap((v) => !v)}
            aria-pressed={showMap}
            className={`flex h-[42px] items-center gap-2.5 border px-5 text-[13px] font-semibold tracking-[0.02em] transition-all duration-300 lg:hidden ${
              showMap
                ? "border-ink bg-ink text-paper"
                : "border-line bg-paper text-ink hover:border-ink"
            }`}
          >
            {showMap ? <List size={15} strokeWidth={1.7} /> : <MapIcon size={15} strokeWidth={1.7} />}
            {showMap ? (en ? "View list" : "Zobrazit seznam") : (en ? "View on map" : "Zobrazit na mapě")}
          </button>
        </div>
      </div>

      {/* Počet */}
      <p className="mt-8 text-[13px] text-muted" aria-live="polite">
        {en
          ? `${filtered.length} ${filtered.length === 1 ? "property" : "properties"}`
          : filtered.length === 1
          ? "1 nemovitost"
          : filtered.length >= 2 && filtered.length <= 4
            ? `${filtered.length} nemovitosti`
            : `${filtered.length} nemovitostí`}
      </p>

      {/* Výsledky — grid, nebo full-bleed split se sticky mapou (S&W) */}
      {filtered.length > 0 ? (
        showMap ? (
          <div id="map-results" className="relative left-1/2 mt-2 w-screen -translate-x-1/2 scroll-mt-16">
            <div className="grid lg:grid-cols-2">
              {/* Nabídky — 2 v řadě + kompaktní hlavička */}
              <div className="px-6 pb-16 xl:pl-[max(1.5rem,calc((100vw-1360px)/2+2.5rem))] xl:pr-10">
                {title && (
                  <div className="mb-7 border border-line bg-stone/50 px-5 py-4">
                    <p className="text-[16px] font-semibold text-ink">
                      {title} ({filtered.length}{" "}
                      {en
                        ? filtered.length === 1 ? "result" : "results"
                        : filtered.length === 1 ? "výsledek" : filtered.length <= 4 ? "výsledky" : "výsledků"})
                    </p>
                    <p className="mt-0.5 text-[13px] text-muted">{en ? "Czech Republic" : "Česká republika"}</p>
                  </div>
                )}
                <div className="grid gap-x-8 gap-y-12 sm:grid-cols-2">
                  {filtered.map((listing, i) => (
                    <LargeCard key={listing.id} listing={listing} index={i} locale={locale} />
                  ))}
                </div>
              </div>

              {/* Mapa — plná výška, až k pravému okraji (nebo fullscreen přes portál) */}
              <div className="max-lg:order-first">
                {(() => {
                  const mapInner = (
                    <>
                      <ListingsMap key={mapExpanded ? "full" : "split"} listings={filtered} locale={locale} />
                      <button
                        type="button"
                        onClick={() => setMapExpanded((v) => !v)}
                        className="absolute left-4 top-4 z-[1001] flex items-center gap-2.5 border border-line bg-white px-5 py-3 text-[13.5px] font-semibold text-ink shadow-[0_6px_20px_rgba(20,24,26,0.12)] transition-colors duration-300 hover:bg-stone"
                      >
                        {mapExpanded ? (
                          <>
                            <Minimize2 size={16} strokeWidth={1.8} />
                            {en ? "Minimise map" : "Zmenšit mapu"}
                          </>
                        ) : (
                          <>
                            <Maximize2 size={16} strokeWidth={1.8} />
                            {en ? "Expand map" : "Zvětšit mapu"}
                          </>
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => { setMapExpanded(false); setShowMap(false); }}
                        className="absolute right-4 top-4 z-[1001] flex items-center gap-2.5 border border-line bg-white px-5 py-3 text-[13.5px] font-semibold text-ink shadow-[0_6px_20px_rgba(20,24,26,0.12)] transition-colors duration-300 hover:bg-stone"
                      >
                        <X size={16} strokeWidth={1.8} />
                        {en ? "Back to results" : "Zpět na výpis"}
                      </button>
                    </>
                  );

                  // Fullscreen musí do portálu — fixed uvnitř transformovaného
                  // breakout wrapperu by se počítal vůči němu, ne vůči viewportu
                  return mapExpanded
                    ? createPortal(
                        <div className="fixed inset-x-0 top-0 z-[70] h-[100dvh] bg-white">{mapInner}</div>,
                        document.body
                      )
                    : (
                        <div className="relative h-[60vh] lg:sticky lg:top-16 lg:h-[calc(100vh-64px)]">
                          {mapInner}
                        </div>
                      );
                })()}
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Řádkové zobrazení — jen desktop; pod lg vždy mřížka */}
            {rowView && (
              <div className="mt-10 hidden space-y-12 lg:block">
                {filtered.slice(0, visibleCount).map((listing, i) => (
                  <RowCard key={listing.id} listing={listing} index={i} locale={locale} />
                ))}
              </div>
            )}
            <div
              className={`mt-8 grid lg:grid-cols-2 lg:gap-x-12 lg:gap-y-14 ${
                twoCols ? "grid-cols-2 gap-x-4 gap-y-8" : "gap-x-12 gap-y-14"
              } ${rowView ? "lg:hidden" : ""}`}
            >
              {filtered.slice(0, visibleCount).map((listing, i) => (
                <LargeCard key={listing.id} listing={listing} index={i} compact={twoCols} locale={locale} />
              ))}
            </div>
            {filtered.length > visibleCount && (
              <div className="mt-14 text-center">
                <button
                  type="button"
                  onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
                  className="border border-ink px-10 py-4 text-[12.5px] font-semibold uppercase tracking-[0.16em] transition-colors duration-300 hover:bg-ink hover:text-paper"
                >
                  {en ? "Show more" : "Zobrazit další"} ({filtered.length - visibleCount})
                </button>
              </div>
            )}
          </>
        )
      ) : (
        <div className="mt-16">
          <div className="flex flex-col items-center border border-line bg-stone/50 px-8 py-16 text-center">
            <SearchX size={32} strokeWidth={1.2} className="text-bronze" />
            <p className="mt-5 text-[18px] font-semibold">{en ? "No properties match your criteria" : "Zadaným kritériím neodpovídá žádná nemovitost"}</p>
            <p className="mt-2 max-w-md text-[14px] leading-relaxed text-muted">
              {en
                ? "Try adjusting your filters, or register your requirements below and we will contact you when a suitable property becomes available."
                : "Zkuste upravit filtry — nebo si níže aktivujte hlídacího psa a ozveme se, jakmile se objeví nemovitost přesně podle vašich představ."}
            </p>
            <button
              type="button"
              onClick={() => {
                setKind(null);
                setCity("vse");
                setNewOnly(false);
              }}
              className="mt-8 border border-ink px-8 py-3.5 text-[12.5px] font-semibold uppercase tracking-[0.16em] transition-colors duration-300 hover:bg-ink hover:text-paper"
            >
              {en ? "Clear filters" : "Zrušit filtry"}
            </button>
          </div>
          <div className="mt-6">
            <WatchdogForm deal={deal} kind={kind ? { byt: "APARTMENT", dum: "HOUSE", pozemek: "LAND", komercni: "COMMERCIAL" }[kind] : null} locale={locale} />
          </div>
        </div>
      )}
    </div>
  );
}
