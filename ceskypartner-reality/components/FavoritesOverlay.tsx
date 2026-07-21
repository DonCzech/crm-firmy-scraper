"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { ArrowUpRight, Columns3, Heart, List, MapPin, X } from "lucide-react";
import { formatPrice, INVESTICE, PRODEJ, PRONAJEM, KIND_LABELS, type Listing } from "@/data/listings";
import { useFavorites } from "@/lib/useFavorites";
import { useFocusTrap } from "@/lib/useFocusTrap";
import FavoriteButton from "./FavoriteButton";
import type { SiteLocale } from "@/lib/locale";
import { INVESTMENT_EN, RENT_EN, SALE_EN } from "@/data/listings-en";

type FavoritesOverlayProps = {
  open: boolean;
  onClose: () => void;
  locale?: SiteLocale;
};

type FavItem = { listing: Listing; deal: string };

const STATIC_ALL: FavItem[] = [
  ...PRODEJ.map((l) => ({ listing: l, deal: "Prodej" })),
  ...PRONAJEM.map((l) => ({ listing: l, deal: "Pronájem" })),
  ...INVESTICE.map((l) => ({ listing: l, deal: "Investice" })),
];
const STATIC_ALL_EN: FavItem[] = [
  ...SALE_EN.map((listing) => ({ listing, deal: "For sale" })),
  ...RENT_EN.map((listing) => ({ listing, deal: "To let" })),
  ...INVESTMENT_EN.map((listing) => ({ listing, deal: "Investment" })),
];
const KIND_LABELS_EN: Record<Listing["kind"], string> = {
  byt: "Apartment",
  dum: "House",
  pozemek: "Land",
  komercni: "Commercial",
};
const TAG_LABELS_EN: Record<string, string> = {
  Novinka: "New",
  Rezervováno: "Reserved",
  Exkluzivně: "Exclusive",
  Prodáno: "Sold",
  Pronajato: "Let",
};

export default function FavoritesOverlay({ open, onClose, locale = "cs" }: FavoritesOverlayProps) {
  const en = locale === "en";
  const staticItems = en ? STATIC_ALL_EN : STATIC_ALL;
  const { ids } = useFavorites();
  const [dbItems, setDbItems] = useState<FavItem[]>([]);
  const [compare, setCompare] = useState(false);
  const trapRef = useFocusTrap<HTMLDivElement>(open);

  useEffect(() => {
    if (!open) return;
    document.documentElement.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      document.documentElement.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  // Oblíbené z DB (uložené pod slugem) — statická data je neznají, doptáme se API
  useEffect(() => {
    if (!open) return;
    const missing = ids.filter((id) => !staticItems.some((item) => item.listing.id === id));
    if (missing.length === 0) {
      setDbItems([]);
      return;
    }
    fetch(`/api/listing-cards?ids=${encodeURIComponent(missing.join(","))}`)
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => setDbItems(Array.isArray(data) ? data : []))
      .catch(() => setDbItems([]));
  }, [open, ids, staticItems]);

  const favorites = useMemo(
    () =>
      ids
        .map((id) => staticItems.find((item) => item.listing.id === id) || dbItems.find((item) => item.listing.id === id))
        .filter((x): x is FavItem => Boolean(x))
        .reverse(),
    [ids, dbItems, staticItems]
  );

  const reveal = (i: number, extra = "") => ({
    className: `${extra} transition-all duration-700 ease-luxe ${
      open ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
    }`,
    style: { transitionDelay: open ? `${120 + i * 60}ms` : "0ms" },
  });

  return (
    <div
      ref={trapRef}
      className={`fixed inset-x-0 top-0 z-[75] h-[100dvh] bg-paper text-ink transition-[opacity,visibility] duration-500 ease-luxe ${
        open ? "visible opacity-100" : "invisible opacity-0"
      }`}
      role="dialog"
      aria-modal="true"
      aria-label={en ? "Saved properties" : "Oblíbené nemovitosti"}
    >
      <div className="flex h-full flex-col">
        {/* Horní lišta */}
        <div className="mx-auto w-full max-w-site shrink-0 px-6 pt-10 xl:px-10">
          <div {...reveal(0)}>
            <div className="flex items-center justify-between gap-6">
              <p className="eyebrow text-muted">{en ? "Favourites" : "Oblíbené"}</p>
              <button
                type="button"
                onClick={onClose}
                aria-label={en ? "Close saved properties" : "Zavřít oblíbené"}
                className="group flex items-center gap-3 text-[12px] uppercase tracking-[0.2em] text-muted transition-colors hover:text-ink"
              >
                {en ? "Close" : "Zavřít"}
                <span className="flex h-11 w-11 items-center justify-center rounded-full border border-line text-ink transition-all duration-300 group-hover:rotate-90 group-hover:border-ink">
                  <X size={18} strokeWidth={1.5} />
                </span>
              </button>
            </div>
            <div className="flex flex-wrap items-end justify-between gap-4 border-b border-line pb-6">
              <h2 className="mt-4 text-[clamp(1.6rem,2.8vw,2.4rem)] font-semibold tracking-[-0.02em]">
                {en ? "Saved properties" : "Uložené nemovitosti"}
                {favorites.length > 0 && (
                  <sup className="ml-2 text-[15px] font-normal text-muted">{favorites.length}</sup>
                )}
              </h2>
              {favorites.length >= 2 && (
                <button
                  type="button"
                  onClick={() => setCompare((v) => !v)}
                  aria-pressed={compare}
                  className={`flex items-center gap-2.5 border px-5 py-2.5 text-[12.5px] font-semibold tracking-[0.02em] transition-all duration-300 ${
                    compare ? "border-ink bg-ink text-paper" : "border-line bg-paper text-ink hover:border-ink"
                  }`}
                >
                  {compare ? <List size={14} strokeWidth={1.7} /> : <Columns3 size={14} strokeWidth={1.7} />}
                  {compare ? (en ? "View list" : "Zobrazit seznam") : (en ? "Compare" : "Porovnat")}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Seznam / porovnání / prázdný stav */}
        <div className="mx-auto w-full max-w-site flex-1 overflow-y-auto px-6 pb-12 pt-8 xl:px-10">
          {favorites.length > 0 ? (
            compare ? (
              <div {...reveal(1, "overflow-x-auto")}>
                <table className="w-full min-w-[640px] border-collapse text-[14px]">
                  <thead>
                    <tr>
                      <th className="w-40 border-b border-line py-3 pr-4 text-left align-bottom">
                        <span className="eyebrow text-muted">{en ? "Comparison" : "Porovnání"}</span>
                      </th>
                      {favorites.map(({ listing }) => (
                        <th key={listing.id} className="min-w-[190px] border-b border-line px-3 pb-4 text-left align-bottom">
                          <a href={en ? `/en/property/${listing.id}` : `/nemovitost/${listing.id}`} onClick={onClose} className="group block">
                            <span className="relative block aspect-[4/3] overflow-hidden bg-stone">
                              <Image
                                src={listing.image}
                                alt=""
                                fill
                                sizes="220px"
                                className="object-cover transition-transform duration-700 ease-luxe group-hover:scale-105"
                              />
                            </span>
                            <span className="card-title mt-3 block text-[14px] font-semibold leading-snug tracking-[-0.01em]">
                              {listing.title}
                            </span>
                          </a>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {([
                      [en ? "Price" : "Cena", (l: Listing) => formatPrice(l, locale)],
                      [en ? "Price / m²" : "Cena / m²", (l: Listing) => (l.area > 0 ? `${Math.round(l.price / l.area).toLocaleString(en ? "en-GB" : "cs-CZ")} ${en ? "CZK" : "Kč"}` : "—")],
                      [en ? "Layout" : "Dispozice", (l: Listing) => l.disposition || "—"],
                      [en ? "Floor area" : "Plocha", (l: Listing) => (l.area > 0 ? `${l.area.toLocaleString(en ? "en-GB" : "cs-CZ")} m²` : "—")],
                      [en ? "Location" : "Lokalita", (l: Listing) => l.location],
                      [en ? "Type" : "Typ", (l: Listing) => en ? KIND_LABELS_EN[l.kind] : KIND_LABELS[l.kind]],
                      [en ? "Status" : "Stav", (l: Listing) => en ? TAG_LABELS_EN[l.tag || "Exkluzivně"] : l.tag || "Exkluzivně"],
                    ] as [string, (l: Listing) => string][]).map(([label, getter]) => (
                      <tr key={label}>
                        <td className="border-b border-line py-3.5 pr-4 text-muted">{label}</td>
                        {favorites.map(({ listing }) => (
                          <td
                            key={listing.id}
                            className={`border-b border-line px-3 py-3.5 font-semibold tracking-[-0.01em] ${label === (en ? "Price" : "Cena") ? "text-bronze-deep" : ""}`}
                          >
                            {getter(listing)}
                          </td>
                        ))}
                      </tr>
                    ))}
                    <tr>
                      <td className="py-4" />
                      {favorites.map(({ listing }) => (
                        <td key={listing.id} className="px-3 py-4">
                          <FavoriteButton id={listing.id} variant="detail" className="!h-10 !w-10" locale={locale} />
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            ) : (
              <ul {...reveal(1, "grid gap-x-12 lg:grid-cols-2")}>
                {favorites.map(({ listing, deal }) => (
                  <li key={listing.id}>
                    <a
                      href={en ? `/en/property/${listing.id}` : `/nemovitost/${listing.id}`}
                      onClick={onClose}
                      className="group flex items-center gap-5 border-b border-line py-5 transition-colors hover:bg-stone/40"
                    >
                      <div className="relative h-[76px] w-[108px] shrink-0 overflow-hidden bg-stone">
                        <Image
                          src={listing.image}
                          alt=""
                          fill
                          sizes="108px"
                          className="object-cover transition-transform duration-700 ease-luxe group-hover:scale-105"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[15.5px] font-semibold tracking-[-0.01em]">
                          {listing.title}
                        </p>
                        <p className="mt-1 flex items-center gap-1.5 text-[12.5px] text-muted">
                          <MapPin size={12} strokeWidth={1.5} className="shrink-0 text-bronze" />
                          {listing.location}
                          <span className="text-line">|</span>
                          {deal}
                        </p>
                        <p className="mt-1.5 text-[14px] font-semibold text-bronze-deep">
                          {formatPrice(listing, locale)}
                        </p>
                      </div>
                      <FavoriteButton id={listing.id} variant="detail" className="!h-10 !w-10 shrink-0" locale={locale} />
                    </a>
                  </li>
                ))}
              </ul>
            )
          ) : (
            <div {...reveal(1, "flex flex-col items-center border border-line bg-stone/50 px-8 py-24 text-center")}>
              <Heart size={32} strokeWidth={1.2} className="text-bronze" />
              <p className="mt-5 text-[18px] font-semibold">{en ? "No saved properties yet" : "Zatím žádné uložené nemovitosti"}</p>
              <p className="mt-2 max-w-md text-[14px] leading-relaxed text-muted">
                {en
                  ? "Select the heart on any property to keep it here. Your saved properties will still be waiting when you return."
                  : "Klikněte na srdíčko u kterékoli nemovitosti a najdete ji tady — uložené položky vám zůstanou i při příští návštěvě."}
              </p>
              <a
                href={en ? "/en/properties/for-sale" : "/nabidka/prodej"}
                onClick={onClose}
                className="mt-8 flex items-center gap-2 border border-ink px-8 py-3.5 text-[12.5px] font-semibold uppercase tracking-[0.16em] transition-colors duration-300 hover:bg-ink hover:text-paper"
              >
                {en ? "Browse properties" : "Prohlédnout nabídku"}
                <ArrowUpRight size={14} strokeWidth={1.8} />
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
