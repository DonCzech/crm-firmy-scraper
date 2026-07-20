"use client";

/**
 * eshop-08 "Domea" (bonami.cz DNA) — galerie detailu produktu.
 * Velké hero foto + tlačítko „Zobrazit galerii" + 2×2 mřížka dalších fotek.
 * Klik kamkoliv otevře fullscreen lightbox (šipky, Esc, náhledy).
 */

import { useCallback, useEffect, useState } from "react";

interface Img { url: string; alt?: string | null }

interface Props {
  images: Img[];
  title: string;
  saleBadge?: string | null;
}

export function BonamiGallery({ images, title, saleBadge }: Props) {
  const [open, setOpen] = useState(false);
  const [idx, setIdx] = useState(0);

  const show = (i: number) => { setIdx(i); setOpen(true); };
  const prev = useCallback(() => setIdx((i) => (i - 1 + images.length) % images.length), [images.length]);
  const next = useCallback(() => setIdx((i) => (i + 1) % images.length), [images.length]);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    const h = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    document.addEventListener("keydown", h);
    return () => { document.body.style.overflow = ""; document.removeEventListener("keydown", h); };
  }, [open, prev, next]);

  if (!images.length) return null;

  return (
    <div>
      <div className="relative overflow-hidden rounded-2xl bg-[#f4f4f2]">
        <button type="button" onClick={() => show(0)} className="block w-full cursor-zoom-in" aria-label="Zobrazit galerii">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={images[0].url} alt={images[0].alt ?? title} className="aspect-[4/3] w-full object-cover" />
        </button>
        {saleBadge && (
          <span className="pointer-events-none absolute left-4 top-4 rounded-full bg-[#d64541] px-3.5 py-1.5 text-[12.5px] font-extrabold text-white shadow-md">
            {saleBadge}
          </span>
        )}
        {images.length > 1 && (
          <button type="button" onClick={() => show(0)}
            className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full border border-neutral-200 bg-white px-4 py-2 text-[12.5px] font-bold text-neutral-900 shadow-md transition hover:bg-neutral-100">
            Zobrazit galerii{images.length > 5 ? ` (+${images.length - 5})` : ""}
          </button>
        )}
      </div>

      {images.length > 1 && (
        <div className="mt-4 grid grid-cols-2 gap-4">
          {images.slice(1, 5).map((im, i) => (
            <button key={im.url} type="button" onClick={() => show(i + 1)} className="cursor-zoom-in overflow-hidden rounded-2xl bg-[#f4f4f2]" aria-label={`Fotka ${i + 2}`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={im.url} alt={im.alt ?? title} loading="lazy" className="aspect-square w-full object-cover transition duration-300 hover:scale-105" />
            </button>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {open && (
        <div className="fixed inset-0 z-[140] flex flex-col bg-[#121212]/95 backdrop-blur-sm" onClick={() => setOpen(false)}>
          <div className="flex items-center justify-between px-5 py-4 text-white" onClick={(e) => e.stopPropagation()}>
            <span className="text-[13.5px] font-semibold text-white/80">{idx + 1} / {images.length} — {title}</span>
            <button onClick={() => setOpen(false)} aria-label="Zavřít" className="flex h-10 w-10 items-center justify-center rounded-full text-white transition hover:bg-white/10">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
            </button>
          </div>
          <div className="relative flex min-h-0 flex-1 items-center justify-center px-14" onClick={(e) => e.stopPropagation()}>
            {images.length > 1 && (
              <button onClick={prev} aria-label="Předchozí" className="absolute left-3 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/25">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M15 6l-6 6 6 6"/></svg>
              </button>
            )}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={images[idx].url} alt={images[idx].alt ?? title} className="max-h-full max-w-full rounded-lg object-contain" />
            {images.length > 1 && (
              <button onClick={next} aria-label="Další" className="absolute right-3 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/25">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M9 6l6 6-6 6"/></svg>
              </button>
            )}
          </div>
          {images.length > 1 && (
            <div className="flex justify-center gap-2 overflow-x-auto px-5 py-4" onClick={(e) => e.stopPropagation()}>
              {images.map((im, i) => (
                <button key={im.url} onClick={() => setIdx(i)} aria-label={`Fotka ${i + 1}`}
                  className={`h-14 w-14 flex-shrink-0 overflow-hidden rounded-lg transition ${i === idx ? "ring-2 ring-white" : "opacity-50 hover:opacity-90"}`}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={im.url} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
