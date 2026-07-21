"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { Maximize2, Rotate3d, X } from "lucide-react";
import type { SiteLocale } from "@/lib/locale";

type VirtualTourProps = {
  url: string;
  poster: string;
  title: string;
  locale?: SiteLocale;
};

/** Event, kterým lze prohlídku otevřít odjinud (např. z galerie). */
export const OPEN_TOUR_EVENT = "cp:open-tour";

/**
 * 3D prohlídka (CubiCasa / VisitHome) jako "facade" — do kliknutí se renderuje
 * jen poster z galerie, iframe třetí strany se načte až na vyžádání.
 * Nulový dopad na PageSpeed při načtení stránky.
 *
 * Fullscreen: primárně nativní Fullscreen API (iframe se nepřemountuje a tour
 * nepřijde o stav). Pozor — CSS `position: fixed` tu nefunguje, komponenta bývá
 * uvnitř <Reveal>, jehož transform vytváří containing block. Fallback pro
 * prohlížeče bez Fullscreen API (iPhone Safari) je proto overlay přes portál
 * do document.body.
 */
/**
 * Normalizace sdíleného odkazu: vynutí metrické jednotky (mu=m).
 * Viewer podporuje jen tyto parametry: dm/m=0 (skrýt míry), dz (zoom),
 * dp (fotky), da (adresa), ds (swipe), mu (m/ft) — žádný jazyk/locale nemá.
 */
function normalizeTourUrl(raw: string): string {
  try {
    const u = new URL(raw.trim());
    if (!u.searchParams.get("mu")) u.searchParams.set("mu", "m");
    return u.toString();
  } catch {
    return raw;
  }
}

export default function VirtualTour({ url, poster, title, locale = "cs" }: VirtualTourProps) {
  const en = locale === "en";
  const [active, setActive] = useState(false);
  const [fallbackExpanded, setFallbackExpanded] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  // Sync stavu s nativním fullscreenem (Escape ho ukončí mimo React)
  useEffect(() => {
    const onChange = () => setIsFullscreen(document.fullscreenElement === sectionRef.current);
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  // Otevření z galerie ("3D prohlídka" u fotek)
  useEffect(() => {
    const onOpen = () => {
      setActive(true);
      sectionRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    };
    window.addEventListener(OPEN_TOUR_EVENT, onOpen);
    return () => window.removeEventListener(OPEN_TOUR_EVENT, onOpen);
  }, []);

  // Fallback overlay: Escape + zámek scrollu (stejně jako lightbox galerie)
  useEffect(() => {
    if (!fallbackExpanded) return;
    document.documentElement.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setFallbackExpanded(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.documentElement.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [fallbackExpanded]);

  function enterFullscreen() {
    const el = sectionRef.current as (HTMLDivElement & { webkitRequestFullscreen?: () => void }) | null;
    if (!el) return;
    if (el.requestFullscreen) {
      el.requestFullscreen().catch(() => setFallbackExpanded(true));
    } else if (el.webkitRequestFullscreen) {
      el.webkitRequestFullscreen();
    } else {
      setFallbackExpanded(true);
    }
  }

  const frame = (
    <iframe
      title={`${en ? "3D tour" : "3D prohlídka"} — ${title}`}
      src={normalizeTourUrl(url)}
      className="h-full w-full border-0"
      allow="fullscreen; gyroscope; accelerometer; xr-spatial-tracking"
      allowFullScreen
      loading="lazy"
    />
  );

  return (
    <>
      <div
        ref={sectionRef}
        className="relative h-[72vh] min-h-[420px] overflow-hidden border border-line bg-stone [&:fullscreen]:h-full [&:fullscreen]:border-0 [&:fullscreen]:bg-ink"
      >
        {!active ? (
          <button
            type="button"
            onClick={() => setActive(true)}
            className="group absolute inset-0 h-full w-full"
            aria-label={en ? "Start property 3D tour" : "Spustit 3D prohlídku nemovitosti"}
          >
            <Image
              src={poster}
              alt={`${en ? "3D tour" : "3D prohlídka"} — ${title}`}
              fill
              sizes="(min-width: 1024px) 60vw, 100vw"
              className="object-cover transition-transform duration-[900ms] ease-luxe group-hover:scale-[1.03]"
            />
            <span className="absolute inset-0 bg-ink/45 transition-colors duration-500 group-hover:bg-ink/55" />
            <span className="absolute inset-0 flex flex-col items-center justify-center gap-5 text-paper">
              <span className="flex h-16 w-16 items-center justify-center rounded-full border border-white/30 backdrop-blur-[2px] transition-all duration-500 group-hover:border-paper group-hover:bg-paper/10">
                <Rotate3d size={26} strokeWidth={1.2} />
              </span>
              <span className="flex flex-col items-center gap-1.5">
                <span className="text-[13px] uppercase tracking-[0.16em]">{en ? "Start 3D tour" : "Spustit 3D prohlídku"}</span>
                <span className="text-[11.5px] tracking-[0.08em] text-paper/60">
                  {en ? "Interactive property model" : "Interaktivní model nemovitosti"}
                </span>
              </span>
            </span>
          </button>
        ) : (
          <>
            {!fallbackExpanded && frame}
            {isFullscreen ? (
              <button
                type="button"
                onClick={() => document.exitFullscreen()}
                aria-label={en ? "Exit full screen" : "Zavřít celou obrazovku"}
                className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full border border-white/25 bg-ink/60 text-paper backdrop-blur-md transition-colors hover:border-paper"
              >
                <X size={19} strokeWidth={1.5} />
              </button>
            ) : (
              <button
                type="button"
                onClick={enterFullscreen}
                aria-label={en ? "View full screen" : "Zobrazit na celou obrazovku"}
                className="absolute bottom-4 right-4 flex h-11 items-center gap-2 rounded-full border border-white/25 bg-ink/60 px-4 text-[12px] uppercase tracking-[0.12em] text-paper backdrop-blur-md transition-colors hover:border-paper"
              >
                <Maximize2 size={15} strokeWidth={1.5} />
                {en ? "Full screen" : "Celá obrazovka"}
              </button>
            )}
          </>
        )}
      </div>

      {/* Fallback pro prohlížeče bez Fullscreen API */}
      {fallbackExpanded &&
        createPortal(
          <div className="fixed inset-x-0 top-0 z-[80] h-[100dvh] bg-ink" role="dialog" aria-modal="true" aria-label={`${en ? "3D tour" : "3D prohlídka"} — ${title}`}>
            {frame}
            <button
              type="button"
              onClick={() => setFallbackExpanded(false)}
              aria-label={en ? "Close 3D tour" : "Zavřít 3D prohlídku"}
              className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full border border-white/25 bg-ink/60 text-paper backdrop-blur-md transition-colors hover:border-paper"
            >
              <X size={19} strokeWidth={1.5} />
            </button>
          </div>,
          document.body
        )}
    </>
  );
}
