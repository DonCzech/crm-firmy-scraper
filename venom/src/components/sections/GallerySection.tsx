"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import { GenericEditableText } from "@/components/tenant/GenericEditableText";
import { GenericEditableImage } from "@/components/tenant/GenericEditableImage";
import { shouldSkipNextImageOptimization } from "@/lib/image-source";

interface Props {
  content: Record<string, unknown>;
  variant: string;
  isAdmin: boolean;
  sectionId: number;
}

interface GalleryImage { url?: string; fullUrl?: string; alt?: string; }

// Normalize: accept both legacy string[] and new {url,alt}[] formats
function normalizeImages(raw: unknown): GalleryImage[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((item) =>
    typeof item === "string"
      ? { url: item, alt: "" }
      : {
          url: String((item as Record<string, unknown>).url ?? ""),
          fullUrl: String((item as Record<string, unknown>).fullUrl ?? ""),
          alt: String((item as Record<string, unknown>).alt ?? ""),
        }
  ).filter((img) => img.url);
}

export function GallerySection({ content, variant, sectionId }: Props) {
  const raw = (content as { images?: unknown }).images;
  const rawArray = Array.isArray(raw) ? raw : [];
  const images = normalizeImages(raw);
  const [activeImage, setActiveImage] = useState<GalleryImage | null>(null);
  const [slideIndex, setSlideIndex] = useState(0);

  // hair-04: dark bg, gold nadpis, 4-up smooth CSS slider s arrow nav + lightbox
  if (variant === "hair-04-carousel") {
    return (
      <Hair04Carousel
        content={content}
        sectionId={sectionId}
        images={images}
        activeImage={activeImage}
        setActiveImage={setActiveImage}
        slideIndex={slideIndex}
        setSlideIndex={setSlideIndex}
      />
    );
  }

  // hair-03: white bg, centered H2 40px, large main slide + thumbnail strip
  if (variant === "hair-03-gallery-slider") {
    const c2 = content as { title?: string };
    const DARK = "#2f201a";
    const SANS = "Helvetica, Arial, sans-serif";
    const currentImg = images[slideIndex];
    return (
      <section id="galerie" style={{ backgroundColor: "#ffffff", padding: "80px 0" }} data-template="hair-03">
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 60px" }}>
          <h2
            style={{
              fontFamily: SANS,
              fontSize: 40,
              fontWeight: 400,
              color: DARK,
              textAlign: "center",
              margin: "0 0 40px 0",
            }}
          >
            <GenericEditableText sectionId={sectionId} field="title" value={c2.title || "Galerie"} tag="span" />
          </h2>

          {/* Main slide */}
          {currentImg?.url && (
            <div
              style={{ position: "relative", width: "100%", aspectRatio: "16/10", overflow: "hidden", cursor: "zoom-in" }}
              onClick={() => setActiveImage(currentImg)}
            >
              <Image
                src={currentImg.url}
                alt={currentImg.alt ?? `Slide ${slideIndex + 1}`}
                fill
                className="object-cover"
                sizes="(max-width: 1200px) 100vw, 1080px"
                priority={slideIndex === 0}
                unoptimized={shouldSkipNextImageOptimization(currentImg.url)}
              />
            </div>
          )}

          {/* Thumbnail strip */}
          {images.length > 1 && (
            <div style={{ display: "flex", gap: 8, marginTop: 8, overflowX: "auto", scrollbarWidth: "none" }}>
              {images.map((img, i) => (
                <GenericEditableImage
                  key={i}
                  sectionId={sectionId}
                  field={typeof rawArray[i] === "string" ? `images.${i}` : `images.${i}.url`}
                  src={img.url!}
                  alt={img.alt ?? `Thumb ${i + 1}`}
                  className="relative flex-shrink-0 overflow-hidden"
                  style={{
                    width: 140,
                    height: 93,
                    cursor: "pointer",
                    outline: i === slideIndex ? `2px solid ${DARK}` : "none",
                    outlineOffset: -2,
                    opacity: i === slideIndex ? 1 : 0.65,
                    transition: "opacity 0.2s",
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setSlideIndex(i)}
                    style={{ border: 0, padding: 0, background: "none", display: "block", width: 140, height: 93, position: "relative", cursor: "pointer" }}
                    aria-label={`Snímek ${i + 1}`}
                  >
                    <Image
                      src={img.url!}
                      alt={img.alt ?? `Thumb ${i + 1}`}
                      fill
                      className="object-cover"
                      sizes="140px"
                      unoptimized={shouldSkipNextImageOptimization(img.url!)}
                    />
                  </button>
                </GenericEditableImage>
              ))}
            </div>
          )}
        </div>

        {/* Lightbox */}
        {activeImage?.url && (
          <button className="gallery-lightbox" type="button" onClick={() => setActiveImage(null)} aria-label="Zavřít náhled">
            <span className="gallery-lightbox-frame">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={activeImage.fullUrl || activeImage.url} alt={activeImage.alt || ""} />
            </span>
          </button>
        )}
        <style>{`
          .gallery-lightbox{position:fixed;inset:0;z-index:80;display:grid;place-items:center;padding:24px;border:0;background:rgba(0,0,0,0.88);cursor:zoom-out;}
          .gallery-lightbox-frame{display:block;max-width:min(1100px,94vw);max-height:88vh;}
          .gallery-lightbox-frame img{display:block;max-width:100%;max-height:88vh;width:auto;height:auto;object-fit:contain;box-shadow:0 24px 80px rgba(0,0,0,0.5);}
        `}</style>
      </section>
    );
  }

  // beauty-01: horizontal scroll carousel, landscape 960×540, white bg
  // Reference: selfbeautystudio.com — Studio sekce, 6 fotek v řadě
  if (variant === "beauty-01-gallery-masonry") {
    const title    = String((content as Record<string,unknown>).title    ?? "Studio");
    const subtitle = String((content as Record<string,unknown>).subtitle ?? "Prostor navržený pro pohodlí.");
    const desc     = String((content as Record<string,unknown>).description ?? "");
    const WHITE    = "#ffffff";
    const DARK     = "#1F1F1F";
    const MUTED    = "#5B4D43";
    const FONT_H   = "'Cormorant Garamond', 'Fahkwang', Georgia, serif";
    const FONT_B   = "'Fahkwang', sans-serif";

    return (
      <section id="galerie" style={{ backgroundColor: WHITE, padding: "80px 0" }} data-template="beauty-01">
        {/* Header — s levým paddingem */}
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px", marginBottom: 40 }}>
          <p style={{ fontFamily: FONT_B, fontSize: 11, fontWeight: 300, letterSpacing: "0.22em", color: MUTED, textTransform: "uppercase", marginBottom: 10 }}>
            <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
          </p>
          {subtitle && (
            <h2 style={{ fontFamily: FONT_H, fontSize: "clamp(24px, 3vw, 40px)", fontWeight: 400, color: DARK, marginBottom: desc ? 12 : 0 }}>
              <GenericEditableText sectionId={sectionId} field="subtitle" value={subtitle} tag="span" />
            </h2>
          )}
          {desc && (
            <p style={{ fontFamily: FONT_B, fontSize: 15, fontWeight: 300, color: MUTED, lineHeight: 1.7, maxWidth: 560 }}>
              <GenericEditableText sectionId={sectionId} field="description" value={desc} tag="span" />
            </p>
          )}
        </div>

        {/* Horizontal scroll strip */}
        <div
          style={{
            display: "flex",
            overflowX: "auto",
            gap: 12,
            paddingLeft: 24,
            paddingRight: 24,
            scrollSnapType: "x mandatory",
            WebkitOverflowScrolling: "touch",
            msOverflowStyle: "none",
            scrollbarWidth: "none",
          }}
        >
          <style>{`.b01-gallery-strip::-webkit-scrollbar{display:none}`}</style>
          {images.map((img, i) => (
            <button
              key={`g-${i}`}
              type="button"
              onClick={() => setActiveImage(img)}
              style={{
                flex: "0 0 auto",
                width: "clamp(280px, 40vw, 480px)",
                aspectRatio: "16/9",
                position: "relative",
                overflow: "hidden",
                scrollSnapAlign: "start",
                cursor: "pointer",
                border: "none",
                padding: 0,
                background: "#f0ece6",
              }}
              aria-label={img.alt || `Foto ${i + 1}`}
            >
              <GenericEditableImage
                sectionId={sectionId}
                field={`images.${i}.url`}
                src={img.url!}
                alt={img.alt ?? ""}
                className="absolute inset-0 w-full h-full"
                style={{ position: "absolute" }}
              >
                <Image
                  src={img.url!}
                  alt={img.alt ?? ""}
                  fill
                  className="object-cover transition-transform duration-500 hover:scale-105"
                  sizes="(max-width: 640px) 90vw, (max-width: 1024px) 50vw, 480px"
                  unoptimized={shouldSkipNextImageOptimization(img.url!)}
                />
              </GenericEditableImage>
            </button>
          ))}
        </div>

        {/* Lightbox */}
        {activeImage && (
          <div
            className="gallery-lightbox-overlay"
            onClick={() => setActiveImage(null)}
            role="dialog"
            aria-modal="true"
            aria-label="Lightbox"
          >
            <button
              className="gallery-lightbox-close"
              onClick={() => setActiveImage(null)}
              aria-label="Zavřít"
            >✕</button>
            <div className="gallery-lightbox-frame" onClick={(e) => e.stopPropagation()}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={activeImage.fullUrl || activeImage.url} alt={activeImage.alt ?? ""} />
            </div>
          </div>
        )}
        <style>{`
          .gallery-lightbox-overlay {
            position: fixed; inset: 0; z-index: 1000;
            background: rgba(0,0,0,0.88);
            display: flex; align-items: center; justify-content: center;
            cursor: pointer;
          }
          .gallery-lightbox-close {
            position: absolute; top: 20px; right: 24px;
            background: none; border: none; cursor: pointer;
            color: #fff; font-size: 28px; line-height: 1; opacity: 0.8;
            transition: opacity 0.2s;
          }
          .gallery-lightbox-close:hover { opacity: 1; }
          .gallery-lightbox-frame {
            max-width: min(1100px, 94vw); max-height: 88vh;
          }
          .gallery-lightbox-frame img {
            display: block; max-width: 100%; max-height: 88vh;
            width: auto; height: auto; object-fit: contain;
            box-shadow: 0 24px 80px rgba(0,0,0,0.35);
          }
        `}</style>
      </section>
    );
  }

  if (!images.length) {
    return (
      <section className="py-16 px-6 text-center" style={{ backgroundColor: "var(--color-surface)" }}>
        <p className="text-gray-400 text-sm">Galerie — přidejte fotky v editoru</p>
      </section>
    );
  }

  const c = content as { title?: string };

  if (variant === "peak-cut-mosaic") {
    // peak-cut Minimal — kompaktní asymetrická mřížka s těsným gap, square fotky
    // Bez velkého centrovaného nadpisu — jen malý label v levém horním rohu.
    return (
      <section className="py-12 px-6 md:px-10" style={{ backgroundColor: "#f5f3ef" }} data-template="peak-cut">
        <div className="max-w-[1280px] mx-auto">
          {c.title && (
            <h2
              className="uppercase"
              style={{
                fontFamily: "'Oswald','Arial Narrow',Arial,sans-serif",
                fontWeight: 500,
                fontSize: "clamp(18px, 1.4vw, 22px)",
                letterSpacing: "0.04em",
                color: "#1a1a1a",
                margin: "0 0 24px",
              }}
            >
              <GenericEditableText sectionId={sectionId} field="title" value={c.title} tag="span" />
            </h2>
          )}
          {/* Řádek 1: 3 stejně velké | Řádek 2: 1 velký (2/3) + 1 menší (1/3) */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 6 }}>
            {images.slice(0, 5).map((img, i) => {
              const isBottomLarge = i === 3;
              return (
                <div
                  key={`pc-g-${i}`}
                  className="relative overflow-hidden"
                  style={{
                    gridColumn: isBottomLarge ? "span 2" : "span 1",
                    aspectRatio: isBottomLarge ? "8 / 5" : "4 / 5",
                    backgroundColor: "#e6e2dc",
                  }}
                >
                  <GenericEditableImage
                    sectionId={sectionId}
                    field={`images.${i}.url`}
                    src={String(img.url ?? "")}
                    alt={img.alt ?? ""}
                    className="absolute inset-0"
                  >
                    {img.url ? (
                      <Image
                        src={String(img.url)}
                        alt={img.alt ?? ""}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover"
                        unoptimized={shouldSkipNextImageOptimization(String(img.url))}
                      />
                    ) : null}
                  </GenericEditableImage>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    );
  }

  if (variant === "four-col" || variant === "four-col-contained") {
    const contained = variant === "four-col-contained";
    const tileRadius = contained ? 0 : 0;
    return (
      <section
        style={{
          padding: contained ? "80px 0" : 0,
          backgroundColor: contained ? "#1c1410" : "#1a1a1a",
        }}
        data-template={contained ? "barber-03" : undefined}
      >
        {contained && c.title && (
          <h2
            className="text-center uppercase"
            style={{
              fontFamily: "var(--font-heading)",
              color: "#c8a96e",
              fontWeight: 700,
              fontSize: "clamp(1.6rem, 3vw, 2.4rem)",
              letterSpacing: "0.16em",
              marginBottom: 48,
            }}
          >
            <GenericEditableText sectionId={sectionId} field="title" value={c.title} tag="span" />
          </h2>
        )}
        <div
          data-four-col-gallery
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: contained ? "16px" : "3px",
            maxWidth: contained ? 1200 : undefined,
            margin: contained ? "0 auto" : undefined,
            padding: contained ? "0 24px" : undefined,
          }}
        >
          {images.map((img, i) => (
            <GenericEditableImage
              key={i}
              sectionId={sectionId}
              field={typeof rawArray[i] === "string" ? `images.${i}` : `images.${i}.url`}
              fullField={typeof rawArray[i] === "string" ? undefined : `images.${i}.fullUrl`}
              src={img.url!}
              alt={img.alt || ""}
              className="relative w-full"
              style={{ overflow: "hidden", borderRadius: 0 }}
            >
              <button
                type="button"
                className="relative block w-full overflow-hidden border-0 bg-transparent p-0"
                style={{ aspectRatio: "1 / 1", cursor: "zoom-in", borderRadius: 0 }}
                onClick={() => setActiveImage(img)}
                aria-label="Zobrazit větší obrázek"
              >
                <Image
                  src={img.url!}
                  alt={img.alt || ""}
                  width={400}
                  height={400}
                  className="h-full w-full object-cover"
                  style={{ transition: "transform 0.4s ease" }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLImageElement).style.transform = "scale(1.04)"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLImageElement).style.transform = "scale(1)"; }}
                  sizes="(max-width: 600px) 50vw, 25vw"
                  unoptimized={shouldSkipNextImageOptimization(img.url)}
                />
              </button>
            </GenericEditableImage>
          ))}
        </div>
        {activeImage?.url && (
          <button className="gallery-lightbox" type="button" onClick={() => setActiveImage(null)} aria-label="Zavřít náhled">
            <span className="gallery-lightbox-frame">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={activeImage.fullUrl || activeImage.url} alt={activeImage.alt || ""} />
            </span>
          </button>
        )}
        <style>{`
          .gallery-lightbox{position:fixed;inset:0;z-index:80;display:grid;place-items:center;padding:24px;border:0;background:rgba(0,0,0,0.88);cursor:zoom-out;}
          .gallery-lightbox-frame{display:block;max-width:min(1100px,94vw);max-height:88vh;}
          .gallery-lightbox-frame img{display:block;max-width:100%;max-height:88vh;width:auto;height:auto;border-radius:4px;object-fit:contain;box-shadow:0 24px 80px rgba(0,0,0,0.5);}
          @media(max-width:900px){[data-four-col-gallery]{grid-template-columns:repeat(3,1fr) !important;}}
          @media(max-width:600px){[data-four-col-gallery]{grid-template-columns:repeat(2,1fr) !important;}}
        `}</style>
      </section>
    );
  }

  return (
    <section className="py-20 px-6" style={{ backgroundColor: "var(--color-bg, #fff)" }}>
      <div className="max-w-5xl mx-auto">
        <h2
          className="text-3xl font-bold text-center mb-12"
          style={{ fontFamily: "var(--font-heading)", color: "var(--color-text, #111)" }}
        >
          <GenericEditableText sectionId={sectionId} field="title" value={c.title || "Galerie"} tag="span" />
        </h2>
        <div
          className="grid grid-cols-2 md:grid-cols-3 gap-4"
        >
          {images.map((img, i) => (
            <GenericEditableImage
              key={i}
              sectionId={sectionId}
              field={typeof rawArray[i] === "string" ? `images.${i}` : `images.${i}.url`}
              fullField={typeof rawArray[i] === "string" ? undefined : `images.${i}.fullUrl`}
              src={img.url!}
              alt={img.alt || ""}
              className="relative w-full"
              style={{ borderRadius: "var(--radius, 8px)", overflow: "hidden" }}
            >
              <button
                type="button"
                className="relative block w-full overflow-hidden border-0 bg-transparent p-0"
                style={{
                  aspectRatio: "1 / 1",
                  borderRadius: "var(--radius, 8px)",
                  cursor: "zoom-in",
                }}
                onClick={() => setActiveImage(img)}
                aria-label="Zobrazit větší obrázek"
              >
                <Image
                  src={img.url!}
                  alt={img.alt || ""}
                  width={331}
                  height={331}
                  className="h-full w-full object-cover"
                  sizes="(max-width: 768px) 50vw, 33vw"
                  unoptimized={shouldSkipNextImageOptimization(img.url)}
                />
              </button>
            </GenericEditableImage>
          ))}
        </div>
      </div>
      {activeImage?.url && (
        <button className="gallery-lightbox" type="button" onClick={() => setActiveImage(null)} aria-label="Zavřít náhled">
          <span className="gallery-lightbox-frame">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={activeImage.fullUrl || activeImage.url} alt={activeImage.alt || ""} />
          </span>
        </button>
      )}
      <style>{`
        .gallery-lightbox {
          position: fixed;
          inset: 0;
          z-index: 80;
          display: grid;
          place-items: center;
          padding: 24px;
          border: 0;
          background: rgba(0,0,0,0.78);
          cursor: zoom-out;
        }
        .gallery-lightbox-frame {
          display: block;
          max-width: min(1100px, 94vw);
          max-height: 88vh;
        }
        .gallery-lightbox-frame img {
          display: block;
          max-width: 100%;
          max-height: 88vh;
          width: auto;
          height: auto;
          border-radius: 8px;
          object-fit: contain;
          box-shadow: 0 24px 80px rgba(0,0,0,0.35);
        }
      `}</style>
    </section>
  );
}

function Hair04Carousel({
  content, sectionId, images: imgs0, activeImage, setActiveImage,
}: {
  content: Record<string, unknown>;
  sectionId: number;
  images: GalleryImage[];
  activeImage: GalleryImage | null;
  setActiveImage: (img: GalleryImage | null) => void;
  slideIndex: number;
  setSlideIndex: (fn: (i: number) => number) => void;
}) {
  const GOLD = "#FFDF25";
  const DARK = "#0d0d0d";
  const LATO = "'Lato', sans-serif";
  const GAP = 20;
  const PLACEHOLDERS: GalleryImage[] = [
    { url: "https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?w=800&h=600&fit=crop&fm=webp", alt: "Interiér salonu" },
    { url: "https://images.unsplash.com/photo-1562322140-8baeececf3df?w=800&h=600&fit=crop&fm=webp", alt: "Střih vlasů" },
    { url: "https://images.unsplash.com/photo-1492106087820-71f1a00d2b11?w=800&h=600&fit=crop&fm=webp", alt: "Barvení vlasů" },
    { url: "https://images.unsplash.com/photo-1605497788044-5a32c7078486?w=800&h=600&fit=crop&fm=webp", alt: "Styling" },
    { url: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&h=600&fit=crop&fm=webp", alt: "Interiér 2" },
    { url: "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=800&h=600&fit=crop&fm=webp", alt: "Výsledek" },
  ];
  const title = String((content as Record<string, unknown>).title ?? "Galerie");
  const imgs = imgs0.length > 0 ? imgs0 : PLACEHOLDERS;

  // Responsive VISIBLE: 1 mobile / 2 tablet / 4 desktop
  const getVisible = () => {
    if (typeof window === "undefined") return 4;
    if (window.innerWidth <= 640) return 1;
    if (window.innerWidth <= 1024) return 2;
    return 4;
  };
  const [visible, setVisible] = useState(4);
  useEffect(() => {
    const update = () => setVisible(getVisible());
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Rebuild extended array when visible changes — reset to start
  const ext = [...imgs.slice(-visible), ...imgs, ...imgs.slice(0, visible)];
  const START = visible;

  const [pos, setPos] = useState(START);
  const posRef = useRef(START);
  const trackRef = useRef<HTMLDivElement>(null);
  const [dotIndex, setDotIndex] = useState(0);
  // Touch support
  const touchStartX = useRef<number | null>(null);

  // When visible changes, reset position instantly
  useEffect(() => {
    posRef.current = visible;
    setPos(visible);
    setDotIndex(0);
    const el = trackRef.current;
    if (el) el.style.transition = "none";
    requestAnimationFrame(() => requestAnimationFrame(() => {
      if (trackRef.current) trackRef.current.style.transition = "";
    }));
  }, [visible]);

  const stepPct = 100 / visible;
  const stepGap = GAP / visible;

  const slideTo = useCallback((newPos: number, animate: boolean) => {
    const el = trackRef.current;
    if (!el) return;
    if (!animate) el.style.transition = "none";
    else el.style.transition = "";
    posRef.current = newPos;
    setPos(newPos);
    const realIdx = ((newPos - visible) % imgs.length + imgs.length) % imgs.length;
    setDotIndex(realIdx);
  }, [imgs.length, visible]);

  const handleTransitionEnd = useCallback(() => {
    const p = posRef.current;
    const s = visible;
    if (p >= imgs.length + s) {
      const target = p - imgs.length;
      const el = trackRef.current;
      if (el) el.style.transition = "none";
      posRef.current = target;
      setPos(target);
      setDotIndex(((target - s) % imgs.length + imgs.length) % imgs.length);
      requestAnimationFrame(() => requestAnimationFrame(() => {
        if (trackRef.current) trackRef.current.style.transition = "";
      }));
    } else if (p < s) {
      const target = p + imgs.length;
      const el = trackRef.current;
      if (el) el.style.transition = "none";
      posRef.current = target;
      setPos(target);
      setDotIndex(((target - s) % imgs.length + imgs.length) % imgs.length);
      requestAnimationFrame(() => requestAnimationFrame(() => {
        if (trackRef.current) trackRef.current.style.transition = "";
      }));
    }
  }, [imgs.length, visible]);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    el.addEventListener("transitionend", handleTransitionEnd);
    return () => el.removeEventListener("transitionend", handleTransitionEnd);
  }, [handleTransitionEnd]);

  const next = () => slideTo(posRef.current + 1, true);
  const prev = () => slideTo(posRef.current - 1, true);

  const translate = `calc(${-pos * stepPct}% - ${pos * stepGap}px)`;

  const cellSize = `calc(${100 / visible}% - ${GAP * (visible - 1) / visible}px)`;
  const imgSizes = visible === 1 ? "100vw" : visible === 2 ? "50vw" : "25vw";

  return (
    <section id="galerie" data-template="hair-04" style={{ backgroundColor: DARK, padding: "80px 0 90px" }}>
      <style>{`
        [data-template="hair-04"] .h04g-track { transition: transform 0.55s cubic-bezier(.4,0,.2,1); will-change: transform; }
        [data-template="hair-04"] .h04g-cell { transition: filter 0.3s ease, transform 0.3s ease; cursor: zoom-in; overflow: hidden; }
        [data-template="hair-04"] .h04g-cell:hover { filter: brightness(1.18); transform: scale(1.03); }
        [data-template="hair-04"] .h04g-btn { transition: background 0.22s, color 0.22s, border-color 0.22s; }
        [data-template="hair-04"] .h04g-btn:hover { background: ${GOLD} !important; color: #000 !important; border-color: ${GOLD} !important; }
        [data-template="hair-04"] .h04g-dot { transition: width 0.3s ease, background 0.3s ease; border: none; padding: 0; cursor: pointer; border-radius: 4px; height: 8px; }
        @media (max-width: 640px) {
          [data-template="hair-04"] #galerie { padding: 48px 0 56px; }
          [data-template="hair-04"] .h04g-wrap { padding: 0 12px !important; }
        }
      `}</style>

      <h2 style={{ fontFamily: LATO, fontSize: "clamp(28px,3vw,42px)", fontWeight: 700, color: GOLD, textAlign: "center", margin: "0 0 52px", letterSpacing: "0.02em" }}>
        <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
      </h2>

      {/* Slider */}
      <div className="h04g-wrap" style={{ position: "relative", width: "100%", padding: "0 64px", boxSizing: "border-box" }}>

        <button type="button" className="h04g-btn" onClick={prev} aria-label="Předchozí"
          style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", zIndex: 10, width: 44, height: 44, borderRadius: "50%", border: `1.5px solid ${GOLD}`, background: "rgba(0,0,0,0.7)", color: GOLD, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 6 9 12 15 18"/></svg>
        </button>

        <div
          style={{ overflow: "hidden" }}
          onTouchStart={e => { touchStartX.current = e.touches[0].clientX; }}
          onTouchEnd={e => {
            if (touchStartX.current === null) return;
            const dx = touchStartX.current - e.changedTouches[0].clientX;
            if (Math.abs(dx) > 40) dx > 0 ? next() : prev();
            touchStartX.current = null;
          }}
        >
          <div
            ref={trackRef}
            className="h04g-track"
            style={{ display: "flex", gap: GAP, transform: `translateX(${translate})` }}
          >
            {ext.map((img, i) => (
              <div
                key={i}
                className="h04g-cell"
                onClick={() => setActiveImage(img)}
                style={{ flex: `0 0 ${cellSize}`, aspectRatio: "4/3", position: "relative", borderRadius: 6, backgroundColor: "#1a1a1a" }}
              >
                <GenericEditableImage
                  sectionId={sectionId}
                  field={`images.${((i - START + imgs.length * 10) % imgs.length)}.url`}
                  src={img.url ?? ""}
                  alt={img.alt ?? ""}
                  className="absolute inset-0 w-full h-full"
                  style={{ position: "absolute" }}
                >
                  <Image src={img.url ?? ""} alt={img.alt ?? ""} fill className="object-cover" sizes={imgSizes} unoptimized={shouldSkipNextImageOptimization(img.url ?? "")} />
                </GenericEditableImage>
              </div>
            ))}
          </div>
        </div>

        <button type="button" className="h04g-btn" onClick={next} aria-label="Další"
          style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", zIndex: 10, width: 44, height: 44, borderRadius: "50%", border: `1.5px solid ${GOLD}`, background: "rgba(0,0,0,0.7)", color: GOLD, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 6 15 12 9 18"/></svg>
        </button>
      </div>

      {/* Dots */}
      <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 28 }}>
        {imgs.map((_, i) => (
          <button key={i} type="button" className="h04g-dot"
            onClick={() => slideTo(START + i, true)}
            aria-label={`Foto ${i + 1}`}
            style={{ width: i === dotIndex ? 32 : 8, backgroundColor: i === dotIndex ? GOLD : "rgba(255,255,255,0.22)" }} />
        ))}
      </div>

      {/* Lightbox */}
      {activeImage && (
        <div onClick={() => setActiveImage(null)}
          style={{ position: "fixed", inset: 0, zIndex: 9999, backgroundColor: "rgba(0,0,0,0.94)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "zoom-out" }}>
          <div style={{ position: "relative", maxWidth: "90vw", maxHeight: "90vh", width: 1000, height: 750 }}>
            <Image src={activeImage.url ?? ""} alt={activeImage.url ?? ""} fill className="object-contain" sizes="92vw" unoptimized={shouldSkipNextImageOptimization(activeImage.url ?? "")} />
          </div>
          <button onClick={() => setActiveImage(null)} aria-label="Zavřít"
            style={{ position: "absolute", top: 20, right: 28, background: "none", border: "none", color: "#fff", fontSize: 38, cursor: "pointer", lineHeight: 1, opacity: 0.75 }}>×</button>
        </div>
      )}
    </section>
  );
}
