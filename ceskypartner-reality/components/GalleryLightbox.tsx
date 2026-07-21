"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ArrowLeft, ArrowRight, Camera, Rotate3d, X } from "lucide-react";
import ExclusiveBadge from "@/components/ExclusiveBadge";
import PhotoWatermark from "@/components/PhotoWatermark";
import { OPEN_TOUR_EVENT } from "@/components/VirtualTour";
import { useFocusTrap } from "@/lib/useFocusTrap";
import type { SiteLocale } from "@/lib/locale";

type GalleryLightboxProps = {
  images: string[];
  title: string;
  /** URL 3D prohlídky (CubiCasa / VisitHome) — zobrazí tlačítka propojující galerii s prohlídkou */
  tourUrl?: string | null;
  /** Vodoznak na fotografiích — řídí se admin nastavením, výchozí vypnuto */
  watermark?: boolean;
  /** Štítek „Exkluzivně" v levém horním rohu hlavní fotografie */
  exclusive?: boolean;
  /** „Prodáno" / „Pronajato" / „Rezervováno" — celoplošný overlay přes hlavní fotografii */
  soldLabel?: string | null;
  /** Drobný řádek nad velkým nápisem overlaye */
  soldEyebrow?: string;
  locale?: SiteLocale;
};

export default function GalleryLightbox({ images, title, tourUrl, watermark = false, exclusive = false, soldLabel = null, soldEyebrow, locale = "cs" }: GalleryLightboxProps) {
  const en = locale === "en";
  const overlayEyebrow = soldEyebrow ?? (en ? "Successfully completed" : "Úspěšně zprostředkováno");
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const lightboxRef = useFocusTrap<HTMLDivElement>(open);

  const show = (i: number) => {
    setIndex(i);
    setOpen(true);
  };

  const step = useCallback(
    (dir: 1 | -1) => setIndex((i) => (i + dir + images.length) % images.length),
    [images.length]
  );

  // Klávesnice + zámek scrollu
  useEffect(() => {
    if (!open) return;
    document.documentElement.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.documentElement.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open, step]);

  return (
    <>
      {/* Bento grid: 1 velká + 2 menší */}
      <div className="relative h-full">
      <div className="grid h-full grid-cols-1 gap-2 md:grid-cols-3 md:grid-rows-2">
        <button
          type="button"
          onClick={() => show(0)}
          className="group relative aspect-[4/3] overflow-hidden bg-stone md:col-span-2 md:row-span-2 md:aspect-auto"
          aria-label={en ? "Open photo 1" : "Otevřít fotografii 1"}
        >
          <Image
            src={images[0]}
            alt={title}
            fill
            priority
            sizes="(min-width: 768px) 66vw, 100vw"
            className={`object-cover transition-transform duration-[900ms] ease-luxe group-hover:scale-[1.03] ${soldLabel ? "grayscale-[0.65]" : ""}`}
            draggable={false}
            onContextMenu={(e) => e.preventDefault()}
          />
          {watermark && <PhotoWatermark />}
          {exclusive && !soldLabel && <ExclusiveBadge className="pointer-events-none absolute left-4 top-4 z-10" />}
          {soldLabel && (
            <span className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center overflow-hidden">
              {/* Ztmavení — jemný gradient, ať fotka pod nápisem stále dýchá */}
              <span className="absolute inset-0 bg-gradient-to-t from-ink/75 via-ink/40 to-ink/60 backdrop-blur-[1.5px]" />
              <span className="relative flex flex-col items-center gap-5 px-6 text-center text-paper md:gap-6">
                <span className="h-px w-14 bg-bronze md:w-20" />
                <span className="text-[10.5px] uppercase tracking-[0.42em] text-paper/70 [text-indent:0.42em] md:text-[11.5px]">
                  {overlayEyebrow}
                </span>
                <span className="text-[clamp(2.4rem,7vw,4.8rem)] font-semibold uppercase leading-none tracking-[0.26em] [text-indent:0.26em] drop-shadow-[0_4px_24px_rgba(0,0,0,0.35)]">
                  {soldLabel}
                </span>
                <span className="h-px w-14 bg-bronze md:w-20" />
              </span>
            </span>
          )}
        </button>
        {images.slice(1, 3).map((src, i) => (
          <button
            key={src + i}
            type="button"
            onClick={() => show(i + 1)}
            className="group relative hidden aspect-[4/3] overflow-hidden bg-stone md:block md:aspect-auto"
            aria-label={`${en ? "Open photo" : "Otevřít fotografii"} ${i + 2}`}
          >
            <Image
              src={src}
              alt=""
              fill
              sizes="33vw"
              className="object-cover transition-transform duration-[900ms] ease-luxe group-hover:scale-[1.04]"
              draggable={false}
              onContextMenu={(e) => e.preventDefault()}
            />
            {watermark && <PhotoWatermark variant="card" />}
            {i === 1 && (
              <span className="absolute inset-0 flex items-center justify-center bg-ink/45 text-paper opacity-0 backdrop-blur-[2px] transition-opacity duration-300 group-hover:opacity-100">
                <span className="flex items-center gap-2 text-[13px] uppercase tracking-[0.14em]">
                  <Camera size={16} strokeWidth={1.5} />
                  {en ? "All photos" : "Všechny fotografie"}
                </span>
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Chip 3D prohlídky na hlavní fotografii — fotky v prohlídce jsou stejné jako v galerii */}
      {tourUrl && (
        <button
          type="button"
          onClick={() => window.dispatchEvent(new CustomEvent(OPEN_TOUR_EVENT))}
          className="absolute bottom-3 left-3 z-10 flex items-center gap-2 border border-white/25 bg-ink/55 px-4 py-2.5 text-[12px] uppercase tracking-[0.14em] text-paper backdrop-blur-md transition-colors duration-300 hover:border-paper hover:bg-ink/70"
        >
          <Rotate3d size={15} strokeWidth={1.5} className="text-bronze" />
          {en ? "3D tour" : "3D prohlídka"}
        </button>
      )}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-x-8 gap-y-2">
        <button
          type="button"
          onClick={() => show(0)}
          className="flex items-center gap-2 text-[13px] uppercase tracking-[0.14em] text-muted transition-colors hover:text-ink"
        >
          <Camera size={15} strokeWidth={1.5} className="text-bronze" />
          {en ? "All photos" : "Všechny fotografie"} ({images.length})
        </button>
        {tourUrl && (
          <button
            type="button"
            onClick={() => window.dispatchEvent(new CustomEvent(OPEN_TOUR_EVENT))}
            className="flex items-center gap-2 text-[13px] uppercase tracking-[0.14em] text-muted transition-colors hover:text-ink"
          >
            <Rotate3d size={15} strokeWidth={1.5} className="text-bronze" />
            {en ? "3D tour" : "3D prohlídka"}
          </button>
        )}
      </div>

      {/* Lightbox */}
      {open && (
        <div
          ref={lightboxRef}
          className="fixed inset-x-0 top-0 z-[80] flex h-[100dvh] flex-col bg-ink/95 backdrop-blur-md"
          role="dialog"
          aria-modal="true"
          aria-label={en ? "Photo gallery" : "Galerie fotografií"}
        >
          <div className="flex items-center justify-between px-6 py-5 text-paper/70">
            <span className="text-[13px] tracking-[0.14em]">
              {index + 1} / {images.length}
            </span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label={en ? "Close gallery" : "Zavřít galerii"}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-white/20 text-paper transition-colors hover:border-paper"
            >
              <X size={19} strokeWidth={1.5} />
            </button>
          </div>

          <div
            className="relative flex-1 touch-pan-y px-4 pb-6 md:px-20"
            onTouchStart={(e) => {
              touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
            }}
            onTouchEnd={(e) => {
              if (!touchStart.current) return;
              const dx = e.changedTouches[0].clientX - touchStart.current.x;
              const dy = e.changedTouches[0].clientY - touchStart.current.y;
              touchStart.current = null;
              // Swipe do stran — jen když horizontální pohyb převáží vertikální
              if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy)) step(dx < 0 ? 1 : -1);
            }}
          >
            {/* Obal se smrští na skutečné rozměry fotky — vodoznak tak sedí na snímku, ne v letterboxu */}
            <div className="flex h-full w-full items-center justify-center">
              <div className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  key={images[index]}
                  src={images[index]}
                  alt={`${title} — ${en ? "photo" : "fotografie"} ${index + 1}`}
                  className="max-h-[calc(100dvh-140px)] max-w-full object-contain"
                  draggable={false}
                  onContextMenu={(e) => e.preventDefault()}
                />
                {watermark && <PhotoWatermark />}
              </div>
            </div>

            <button
              type="button"
              onClick={() => step(-1)}
              aria-label={en ? "Previous photo" : "Předchozí fotografie"}
              className="absolute left-4 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 text-paper transition-colors hover:border-paper md:left-6"
            >
              <ArrowLeft size={18} strokeWidth={1.5} />
            </button>
            <button
              type="button"
              onClick={() => step(1)}
              aria-label={en ? "Next photo" : "Další fotografie"}
              className="absolute right-4 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 text-paper transition-colors hover:border-paper md:right-6"
            >
              <ArrowRight size={18} strokeWidth={1.5} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
