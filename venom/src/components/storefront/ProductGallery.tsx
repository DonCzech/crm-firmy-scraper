"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface Image { id: number; url: string; alt: string | null; }

interface GalleryProps {
  images: Image[];
  title: string;
  /** Zoom lupou na hover — defaultně vypnuto (Alza styl: klik otevře lightbox). */
  enableZoom?: boolean;
  /** Šipky pro listování přímo na hlavním obrázku — defaultně vypnuto. */
  enableArrows?: boolean;
}

export function ProductGallery({ images, title, enableZoom = false, enableArrows = false }: GalleryProps) {
  const [idx, setIdx] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const [zoom, setZoom] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });
  const mainRef = useRef<HTMLDivElement>(null);

  const current = images[idx] ?? null;
  const len = images.length;

  const prev = useCallback(() => setIdx((i) => (i - 1 + len) % len), [len]);
  const next = useCallback(() => setIdx((i) => (i + 1) % len), [len]);

  useEffect(() => {
    if (!lightbox) return;
    document.body.style.overflow = "hidden";
    const h = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightbox(false);
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    document.addEventListener("keydown", h);
    return () => { document.body.style.overflow = ""; document.removeEventListener("keydown", h); };
  }, [lightbox, prev, next]);

  function onMainMouseMove(e: React.MouseEvent) {
    if (!enableZoom || !zoom || !mainRef.current) return;
    const rect = mainRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPos({ x, y });
  }

  if (!current) return null;

  return (
    <>
      <style>{`
        .pg-thumb { border: 2px solid transparent; transition: border-color 0.15s, opacity 0.15s; opacity: 0.6; cursor: pointer; }
        .pg-thumb:hover, .pg-thumb[data-active] { border-color: #2563eb; opacity: 1; }
        .pg-arrow { position: absolute; top: 50%; transform: translateY(-50%); width: 36px; height: 36px; border-radius: 50%; background: rgba(255,255,255,0.9); border: 1px solid #e5e7eb; display: flex; align-items: center; justify-content: center; cursor: pointer; color: #111; transition: all 0.15s; box-shadow: 0 2px 8px rgba(0,0,0,0.08); z-index: 2; }
        .pg-arrow:hover { background: #fff; box-shadow: 0 4px 12px rgba(0,0,0,0.12); }
        .pg-lb-enter { animation: pgFadeIn 0.2s ease; }
        @keyframes pgFadeIn { from { opacity: 0; } to { opacity: 1; } }
      `}</style>

      <div>
        {/* Main image with zoom */}
        <div
          ref={mainRef}
          onClick={() => setLightbox(true)}
          onMouseEnter={enableZoom ? () => setZoom(true) : undefined}
          onMouseLeave={enableZoom ? () => setZoom(false) : undefined}
          onMouseMove={enableZoom ? onMainMouseMove : undefined}
          style={{
            position: "relative", aspectRatio: "1", overflow: "hidden",
            borderRadius: 12, background: "#f5f5f5", cursor: enableZoom && zoom ? "crosshair" : "pointer",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={current.url}
            alt={current.alt ?? title}
            style={{
              width: "100%", height: "100%", objectFit: "cover",
              transform: enableZoom && zoom ? "scale(2)" : "scale(1)",
              transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
              transition: enableZoom && zoom ? "none" : "transform 0.3s ease",
            }}
          />
          {enableArrows && len > 1 && (
            <>
              <button className="pg-arrow" style={{ left: 10 }} onClick={(e) => { e.stopPropagation(); prev(); }} aria-label="Předchozí">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M15 18l-6-6 6-6" /></svg>
              </button>
              <button className="pg-arrow" style={{ right: 10 }} onClick={(e) => { e.stopPropagation(); next(); }} aria-label="Další">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M9 6l6 6-6 6" /></svg>
              </button>
            </>
          )}
          <div style={{ position: "absolute", bottom: 10, right: 10, background: "rgba(0,0,0,0.5)", color: "#fff", borderRadius: 6, padding: "3px 8px", fontSize: 11, fontWeight: 600 }}>
            {idx + 1} / {len}
          </div>
        </div>

        {/* Thumbnails */}
        {len > 1 && (
          <div style={{ display: "flex", gap: 8, marginTop: 10, overflowX: "auto", paddingBottom: 4 }}>
            {images.map((img, i) => (
              <button
                key={img.id}
                className="pg-thumb"
                data-active={i === idx ? "" : undefined}
                onClick={() => setIdx(i)}
                style={{ width: 64, height: 64, borderRadius: 8, overflow: "hidden", flexShrink: 0, padding: 0, background: "#f5f5f5" }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img.url} alt={img.alt ?? ""} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div
          className="pg-lb-enter"
          onClick={() => setLightbox(false)}
          style={{
            position: "fixed", inset: 0, zIndex: 9999,
            background: "rgba(0,0,0,0.92)", backdropFilter: "blur(8px)",
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          }}
        >
          <button onClick={() => setLightbox(false)} style={{
            position: "absolute", top: 16, right: 16, width: 40, height: 40,
            borderRadius: 10, background: "rgba(255,255,255,0.1)", border: "none",
            color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
          </button>

          <div onClick={(e) => e.stopPropagation()} style={{ position: "relative", maxWidth: "85vw", maxHeight: "80vh" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={current.url} alt={current.alt ?? title} style={{ maxWidth: "85vw", maxHeight: "80vh", objectFit: "contain", borderRadius: 8 }} />
            {len > 1 && (
              <>
                <button className="pg-arrow" style={{ left: -48 }} onClick={prev} aria-label="Předchozí">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M15 18l-6-6 6-6" /></svg>
                </button>
                <button className="pg-arrow" style={{ right: -48 }} onClick={next} aria-label="Další">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M9 6l6 6-6 6" /></svg>
                </button>
              </>
            )}
          </div>

          {/* Lightbox thumbnails */}
          {len > 1 && (
            <div onClick={(e) => e.stopPropagation()} style={{ display: "flex", gap: 8, marginTop: 16 }}>
              {images.map((img, i) => (
                <button
                  key={img.id}
                  onClick={() => setIdx(i)}
                  style={{
                    width: 56, height: 56, borderRadius: 8, overflow: "hidden", flexShrink: 0,
                    padding: 0, background: "rgba(255,255,255,0.1)",
                    border: i === idx ? "2px solid #fff" : "2px solid transparent",
                    opacity: i === idx ? 1 : 0.5, cursor: "pointer", transition: "all 0.15s",
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img.url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </button>
              ))}
            </div>
          )}

          <div style={{ position: "absolute", bottom: 16, color: "rgba(255,255,255,0.5)", fontSize: 12, fontWeight: 500 }}>
            {idx + 1} / {len} · ESC zavřít · ← → navigace
          </div>
        </div>
      )}
    </>
  );
}
