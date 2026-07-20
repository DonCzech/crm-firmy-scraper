"use client";

import { useState, useCallback, useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";

interface LightboxImage {
  url: string;
  alt?: string;
  caption?: string;
}

interface LightboxContextValue {
  open: (images: LightboxImage[], index: number) => void;
}

let globalOpen: LightboxContextValue["open"] | null = null;

export function openLightbox(images: LightboxImage[], index: number) {
  globalOpen?.(images, index);
}

export function LightboxProvider({ children }: { children: ReactNode }) {
  const [images, setImages] = useState<LightboxImage[]>([]);
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(false);

  const open = useCallback((imgs: LightboxImage[], idx: number) => {
    setImages(imgs);
    setIndex(idx);
    setVisible(true);
  }, []);

  useEffect(() => {
    globalOpen = open;
    return () => { globalOpen = null; };
  }, [open]);

  const close = useCallback(() => setVisible(false), []);
  const prev = useCallback(() => setIndex((i) => (i > 0 ? i - 1 : images.length - 1)), [images.length]);
  const next = useCallback(() => setIndex((i) => (i < images.length - 1 ? i + 1 : 0)), [images.length]);

  useEffect(() => {
    if (!visible) return;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKey);
    return () => { document.body.style.overflow = ""; window.removeEventListener("keydown", onKey); };
  }, [visible, close, prev, next]);

  if (!visible || !images.length) return <>{children}</>;

  const img = images[index];

  // Portal to <body>: the blog sits inside wrappers that create stacking
  // contexts (transforms, filters), which would trap even z-[9999] below the
  // fixed navbar and the cookie bar.
  return (
    <>
      {children}
      {createPortal(
        <div
        className="fixed inset-0 z-[9999] flex items-center justify-center"
        style={{ backgroundColor: "rgba(0,0,0,.92)" }}
        onClick={close}
        role="dialog"
        aria-label="Zvětšený obrázek"
      >
        {/* Close */}
        <button
          onClick={close}
          className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center text-white/70 hover:text-white text-2xl transition-colors"
          aria-label="Zavřít"
        >
          ✕
        </button>

        {/* Prev */}
        {images.length > 1 && (
          <button
            onClick={(e) => { e.stopPropagation(); prev(); }}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center text-white/60 hover:text-white text-3xl transition-colors"
            aria-label="Předchozí"
          >
            ‹
          </button>
        )}

        {/* Image */}
        <div
          className="max-w-[90vw] max-h-[85vh] flex flex-col items-center"
          onClick={(e) => e.stopPropagation()}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={img.url}
            alt={img.alt ?? ""}
            className="max-w-full max-h-[80vh] object-contain select-none"
            draggable={false}
          />
          {(img.caption || img.alt) && (
            <p className="text-white/70 text-sm mt-3 text-center max-w-lg">
              {img.caption || img.alt}
            </p>
          )}
          {images.length > 1 && (
            <p className="text-white/40 text-xs mt-2">
              {index + 1} / {images.length}
            </p>
          )}
        </div>

        {/* Next */}
        {images.length > 1 && (
          <button
            onClick={(e) => { e.stopPropagation(); next(); }}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center text-white/60 hover:text-white text-3xl transition-colors"
            aria-label="Další"
          >
            ›
          </button>
        )}
        </div>,
        document.body
      )}
    </>
  );
}
