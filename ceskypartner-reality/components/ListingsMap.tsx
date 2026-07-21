"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { ChevronLeft, ChevronRight, MapPin, Minus, Plus, X } from "lucide-react";
import { formatPrice, type Listing } from "@/data/listings";
import type { SiteLocale } from "@/lib/locale";

type Props = {
  listings: Listing[];
  locale?: SiteLocale;
};

type QuickDetail = {
  title: string;
  slug: string;
  location: string;
  price: number;
  deal: string;
  disposition: string | null;
  area: number | null;
  landArea: number | null;
  floor: number | null;
  floors: number | null;
  penb: string | null;
  yearBuilt: number | null;
  description: string | null;
  images: string[];
};

/** Kapkový pin — tmavě modrá slza se světlým středem (S&W styl) */
const PIN_ICON = L.divIcon({
  className: "cp-pin-wrap",
  html: `<svg width="36" height="46" viewBox="0 0 36 46" style="filter:drop-shadow(0 4px 10px rgba(20,24,26,.35))">
    <path d="M18 0C8.06 0 0 8.06 0 18c0 13.5 18 28 18 28s18-14.5 18-28C36 8.06 27.94 0 18 0Z" fill="#152238"/>
    <circle cx="18" cy="17" r="6" fill="#c5d5c0"/>
  </svg>`,
  iconSize: [36, 46],
  iconAnchor: [18, 46],
  popupAnchor: [0, -48],
});

/** Cluster — tmavý kruh s bílým počtem */
const clusterIcon = (cluster: { getChildCount: () => number }) =>
  L.divIcon({
    className: "cp-cluster-wrap",
    html: `<div class="cp-cluster">${cluster.getChildCount()}</div>`,
    iconSize: [52, 52],
    iconAnchor: [26, 26],
  });

/** Vlastní minimalistický zoom — vpravo dole, vždy viditelný (malá i fullscreen mapa) */
function CustomZoom({ locale = "cs" }: { locale?: SiteLocale }) {
  const en = locale === "en";
  const map = useMap();
  const btn =
    "flex h-[42px] w-[42px] items-center justify-center bg-white text-[#14181A] transition-colors hover:bg-[#faf9f6]";
  return (
    <div className="absolute bottom-4 right-4 z-[1000] flex flex-col shadow-[0_6px_20px_rgba(20,24,26,0.15)]">
      <button type="button" aria-label={en ? "Zoom in" : "Přiblížit"} onClick={() => map.zoomIn()} className={`${btn} border-b border-[#edeae3]`}>
        <Plus size={18} strokeWidth={1.6} />
      </button>
      <button type="button" aria-label={en ? "Zoom out" : "Oddálit"} onClick={() => map.zoomOut()} className={btn}>
        <Minus size={18} strokeWidth={1.6} />
      </button>
    </div>
  );
}

/** Po změně výsledků přizpůsobí výřez mapy pinům */
function FitBounds({ points }: { points: [number, number][] }) {
  const map = useMap();
  const key = points.map((p) => p.join(",")).join(";");
  useEffect(() => {
    if (points.length === 0) return;
    map.fitBounds(L.latLngBounds(points), { padding: [64, 64], maxZoom: 14 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, map]);
  return null;
}

export default function ListingsMap({ listings, locale = "cs" }: Props) {
  const en = locale === "en";
  const withCoords = useMemo(
    () => listings.filter((l): l is Listing & { lat: number; lng: number } => l.lat != null && l.lng != null),
    [listings]
  );
  const points = useMemo(() => withCoords.map((l) => [l.lat, l.lng] as [number, number]), [withCoords]);

  /* ── Rychlý náhled — data se stahují až po kliknutí na + ── */
  const [quick, setQuick] = useState<Listing | null>(null);
  const [detail, setDetail] = useState<QuickDetail | null>(null);
  const [loadingQ, setLoadingQ] = useState(false);
  const [photoIdx, setPhotoIdx] = useState(0);

  const openQuick = (l: Listing) => {
    setQuick(l);
    setDetail(null);
    setPhotoIdx(0);
    setLoadingQ(true);
    fetch(`/api/listing/${l.id}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setDetail(d))
      .catch(() => setDetail(null))
      .finally(() => setLoadingQ(false));
  };

  useEffect(() => {
    if (!quick) return;
    const prevOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setQuick(null);
    window.addEventListener("keydown", onKey);
    return () => {
      document.documentElement.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [quick]);

  const photos = detail?.images?.length ? detail.images : quick ? [quick.image] : [];
  const params: [string, string][] = detail
    ? ([
        ...(detail.disposition ? [[en ? "Layout" : "Dispozice", detail.disposition]] : []),
        ...(detail.area ? [[en ? "Floor area" : "Užitná plocha", `${detail.area.toLocaleString(en ? "en-GB" : "cs-CZ")} m²`]] : []),
        ...(detail.landArea ? [[en ? "Plot" : "Pozemek", `${detail.landArea.toLocaleString(en ? "en-GB" : "cs-CZ")} m²`]] : []),
        ...(detail.floor != null ? [[en ? "Floor" : "Podlaží", `${detail.floor}.${detail.floors ? ` ${en ? "of" : "z"} ${detail.floors}` : ""}`]] : []),
        ...(detail.penb ? [["PENB", `${en ? "Class" : "Třída"} ${detail.penb}`]] : []),
        ...(detail.yearBuilt ? [[en ? "Year built" : "Rok výstavby", String(detail.yearBuilt)]] : []),
      ] as [string, string][])
    : [];

  return (
    <>
      <MapContainer
        center={[49.82, 15.47]}
        zoom={7}
        scrollWheelZoom
        className="h-full w-full"
        attributionControl={false}
        zoomControl={false}
      >
        <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" />
        <CustomZoom locale={locale} />
        <FitBounds points={points} />
        <MarkerClusterGroup
          chunkedLoading
          showCoverageOnHover={false}
          maxClusterRadius={56}
          iconCreateFunction={clusterIcon}
        >
          {withCoords.map((l) => (
            <Marker key={l.id} position={[l.lat, l.lng]} icon={PIN_ICON}>
              <Popup closeButton={false} maxWidth={400} minWidth={380} className="cp-map-popup">
                <span className="relative flex w-[380px] max-w-[80vw] bg-white">
                  <a href={en ? `/en/property/${l.id}` : `/nemovitost/${l.id}`} className="flex min-w-0 flex-1 no-underline">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={l.image} alt={l.title} className="h-[120px] w-[150px] shrink-0 object-cover" />
                    <span className="flex min-w-0 flex-1 flex-col justify-center px-4 py-3">
                      <span className="block truncate pr-8 text-[15px] font-semibold leading-snug text-[#14181A]">{l.title}</span>
                      <span className="mt-1 block truncate text-[12.5px] text-[#6E6A63]">{l.location}</span>
                      <span className="mt-2 block text-[14px] font-semibold text-[#8A6D43]">{formatPrice(l, locale)}</span>
                    </span>
                  </a>
                  <button
                    type="button"
                    aria-label={en ? "Quick property view" : "Rychlý náhled nemovitosti"}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      openQuick(l);
                    }}
                    className="absolute right-2.5 top-2.5 flex h-8 w-8 items-center justify-center rounded-full border border-[#e6e3dd] bg-white text-[#14181A] shadow-sm transition-all duration-300 hover:bg-[#14181A] hover:text-white"
                  >
                    <Plus size={15} strokeWidth={2} />
                  </button>
                </span>
              </Popup>
            </Marker>
          ))}
        </MarkerClusterGroup>
      </MapContainer>

      {/* ── Quick view — portál do body (fixed nesmí být uvnitř transformovaného rodiče) ── */}
      {quick && createPortal(
        <div className="fixed inset-x-0 top-0 z-[2000] flex h-[100dvh] items-center justify-center p-4" role="dialog" aria-modal="true" aria-label={quick.title}>
          <div className="absolute inset-0 bg-black/45 backdrop-blur-[2px]" onClick={() => setQuick(null)} />
          <div className="relative grid w-[min(880px,94vw)] max-h-[90vh] overflow-y-auto bg-white shadow-[0_40px_120px_rgba(0,0,0,0.35)] md:grid-cols-[1.1fr_1fr]">
            {/* Galerie */}
            <div className="relative bg-stone">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photos[photoIdx] ?? quick.image}
                alt={quick.title}
                className="h-[240px] w-full object-cover md:h-full md:min-h-[420px]"
              />
              {photos.length > 1 && (
                <>
                  <button
                    type="button"
                    aria-label={en ? "Previous photo" : "Předchozí fotografie"}
                    onClick={() => setPhotoIdx((i) => (i - 1 + photos.length) % photos.length)}
                    className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center bg-white/90 text-ink shadow-md transition-colors hover:bg-white"
                  >
                    <ChevronLeft size={18} strokeWidth={1.8} />
                  </button>
                  <button
                    type="button"
                    aria-label={en ? "Next photo" : "Další fotografie"}
                    onClick={() => setPhotoIdx((i) => (i + 1) % photos.length)}
                    className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center bg-white/90 text-ink shadow-md transition-colors hover:bg-white"
                  >
                    <ChevronRight size={18} strokeWidth={1.8} />
                  </button>
                  <span className="absolute bottom-3 right-3 bg-ink/60 px-2.5 py-1 text-[11.5px] font-semibold text-white backdrop-blur-sm">
                    {photoIdx + 1} / {photos.length}
                  </span>
                </>
              )}
            </div>

            {/* Informace */}
            <div className="flex flex-col p-6 md:p-8">
              <button
                type="button"
                onClick={() => setQuick(null)}
                aria-label={en ? "Close preview" : "Zavřít náhled"}
                className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center bg-white text-ink shadow-sm transition-transform duration-300 hover:rotate-90 md:bg-transparent md:shadow-none"
              >
                <X size={18} strokeWidth={1.5} />
              </button>

              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-bronze-deep">
                {detail?.deal === "RENT"
                  ? en ? "To let" : "Pronájem"
                  : detail?.deal === "INVESTMENT"
                    ? en ? "Investment" : "Investice"
                    : en ? "For sale" : "Prodej"}
              </p>
              <h3 className="mt-2 pr-8 text-[clamp(1.2rem,2vw,1.5rem)] font-semibold leading-snug tracking-[-0.01em] text-ink">
                {quick.title}
              </h3>
              <p className="mt-1.5 flex items-center gap-1.5 text-[13.5px] text-muted">
                <MapPin size={13} strokeWidth={1.5} className="text-bronze" />
                {quick.location}
              </p>
              <p className="mt-3 text-[20px] font-semibold tracking-[-0.01em] text-bronze-deep">{formatPrice(quick, locale)}</p>

              {loadingQ ? (
                <div className="mt-6 space-y-2.5">
                  <div className="h-3.5 w-3/4 animate-pulse bg-stone" />
                  <div className="h-3.5 w-full animate-pulse bg-stone" />
                  <div className="h-3.5 w-2/3 animate-pulse bg-stone" />
                </div>
              ) : (
                <>
                  {params.length > 0 && (
                    <dl className="mt-5 grid grid-cols-2 gap-x-6 border-t border-line pt-4">
                      {params.map(([label, value]) => (
                        <div key={label} className="flex items-baseline justify-between gap-3 border-b border-line/60 py-2 text-[13px]">
                          <dt className="text-muted">{label}</dt>
                          <dd className="text-right font-semibold text-ink">{value}</dd>
                        </div>
                      ))}
                    </dl>
                  )}
                  {detail?.description && (
                    <p className="mt-4 line-clamp-4 text-[13.5px] leading-[1.7] text-ink/75">{detail.description}</p>
                  )}
                </>
              )}

              <a
                href={en ? `/en/property/${quick.id}` : `/nemovitost/${quick.id}`}
                className="mt-6 block w-full bg-ink py-3.5 text-center text-[12.5px] font-semibold uppercase tracking-[0.16em] text-paper transition-colors duration-300 hover:bg-bronze-deep md:mt-auto"
              >
                {en ? "View full property details" : "Celý detail nemovitosti"}
              </a>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
