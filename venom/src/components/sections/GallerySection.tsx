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
  tenantSlug?: string;
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

export function GallerySection({ content, variant, sectionId, tenantSlug, isAdmin }: Props) {
  const raw = (content as { images?: unknown }).images;
  const rawArray = Array.isArray(raw) ? raw : [];
  const images = normalizeImages(raw);
  const [activeImage, setActiveImage] = useState<GalleryImage | null>(null);
  const [slideIndex, setSlideIndex] = useState(0);

  if (variant === "arch-01-projects")  return <GalleryArch01Projects  content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;
  if (variant === "arch-01-interiors") return <GalleryArch01Interiors content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;
  if (variant === "arch-01-awards")    return <GalleryArch01Awards    content={content} sectionId={sectionId} />;
  if (variant === "grooming-01-gallery") return <GalleryGrooming01 content={content} sectionId={sectionId} />;
  if (variant === "pethotel-01-gallery") return <GalleryPethotel01 content={content} sectionId={sectionId} images={images} />;
  if (variant === "florist-01-collections") return <GalleryFlorist01Collections content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;
  if (variant === "elektro-01-gallery") return <GalleryElektro01 content={content} sectionId={sectionId} images={images} />;
  if (variant === "instala-02-gallery") return <GalleryInstala02 content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;
  if (variant === "stavba-01-gallery") return <GalleryStavba01 content={content} sectionId={sectionId} />;
  if (variant === "stavba-02-gallery") return <GalleryStavba02 content={content} sectionId={sectionId} />;
  if (variant === "stavba-03-gallery") return <GalleryStavba03 content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;
  if (variant === "nails-01-gallery") {
    return <GalleryNails01 content={content} sectionId={sectionId} images={images} />;
  }
  if (variant === "nails-02-gallery") {
    return <GalleryNails02 content={content} sectionId={sectionId} images={images} />;
  }
  if (variant === "nails-03-gallery") {
    return <GalleryNails03 content={content} sectionId={sectionId} images={images} />;
  }
  if (variant === "clinic-03-gallery") {
    return <GalleryClinic03 content={content} sectionId={sectionId} images={images} />;
  }
  if (variant === "restaurant-03-gallery") {
    return <GalleryRestaurant03 content={content} sectionId={sectionId} images={images} />;
  }
  if (variant === "cafe-03-gallery") {
    return <GalleryCafe03 content={content} sectionId={sectionId} images={images} />;
  }
  if (variant === "tattoo-01-gallery") {
    return <GalleryTattoo01 content={content} sectionId={sectionId} images={images} rawArray={rawArray} />;
  }
  if (variant === "tattoo-02-gallery") {
    return <GalleryTattoo02 content={content} sectionId={sectionId} />;
  }
  if (variant === "tattoo-03-gallery") {
    return <GalleryTattoo03 content={content} sectionId={sectionId} />;
  }

  if (variant === "massage-01-gallery-insta") {
    return <Massage01GalleryInsta content={content} sectionId={sectionId} images={images} />;
  }
  if (variant === "autoservis-03-gallery") return <GalleryAutoservis03 content={content} sectionId={sectionId} />;
  if (variant === "catering-01-gallery") return <GalleryCatering01 content={content} sectionId={sectionId} />;
  if (variant === "clean-01-gallery")    return <GalleryClean01 content={content} sectionId={sectionId} />;
  if (variant === "garden-01-gallery")   return <GalleryGarden01 content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;
  if (variant === "klima-01-gallery")       return <GalleryKlima01 content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;
  if (variant === "floors-01-inspiration")  return <InspirationFloors01 content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;
  if (variant === "hotel-01-offers")        return <GalleryHotel01Offers content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;
  if (variant === "hotel-02-gallery")       return <GalleryHotel02 content={content} sectionId={sectionId} />;
  if (variant === "klempir-01-gallery")    return <GalleryKlempir01 content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;
  if (variant === "arbo-01-gallery")       return <GalleryArbo01    content={content} sectionId={sectionId} />;
  if (variant === "ddd-01-gallery")        return <GalleryDdd01     content={content} sectionId={sectionId} />;
  if (variant === "chalet-01-gallery")     return <GalleryChalet01  content={content} sectionId={sectionId} />;
  if (variant === "malir-02-gallery")      return <GalleryMalir02   content={content} sectionId={sectionId} />;
  if (variant === "photo-01-gallery")      return <GalleryPhoto01   content={content} sectionId={sectionId} />;
  if (variant === "events-01-gallery")     return <GalleryEvents01  content={content} sectionId={sectionId} />;
  if (variant === "restaurant-04-gallery") return <GalleryRestaurant04 content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;
  if (variant === "video-01-gallery")      return <GalleryVideo01     content={content} sectionId={sectionId} isAdmin={isAdmin} />;

  if (variant === "fitness-02-gallery-grid") {
    return <GalleryFitness02 content={content} sectionId={sectionId} images={images} />;
  }

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
              <img loading="lazy" src={activeImage.fullUrl || activeImage.url} alt={activeImage.alt || ""} />
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
              <img loading="lazy" src={activeImage.fullUrl || activeImage.url} alt={activeImage.alt ?? ""} />
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
          <style>{`.pc-mosaic-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 6px; } @media (min-width: 640px) { .pc-mosaic-grid { grid-template-columns: repeat(3, 1fr); } }`}</style>
          {/* Řádek 1: 3 stejně velké | Řádek 2: 1 velký (2/3) + 1 menší (1/3) */}
          <div className="pc-mosaic-grid">
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
    const b03gHeadRef = useRef<HTMLHeadingElement>(null);
    const b03gGridRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
      if (!contained) return;
      const els = [b03gHeadRef.current, b03gGridRef.current].filter(Boolean) as HTMLElement[];
      const obs = els.map((el, i) => {
        const o = new IntersectionObserver(([e]) => { if (e.isIntersecting) { el.style.animationDelay = `${i * 0.15}s`; el.classList.add("b03g-vis"); o.disconnect(); } }, { threshold: 0.08 });
        o.observe(el); return o;
      });
      return () => obs.forEach(o => o.disconnect());
    }, [contained]);
    return (
      <section
        style={{
          padding: contained ? "clamp(48px, 8vw, 80px) 0" : 0,
          backgroundColor: contained ? "#1c1410" : "#1a1a1a",
        }}
        data-template={contained ? "barber-03" : undefined}
      >
        <style>{`
          [data-four-col-gallery] { grid-template-columns: repeat(2, 1fr) !important; }
          @media (min-width: 640px) { [data-four-col-gallery] { grid-template-columns: repeat(4, 1fr) !important; } }
        `}</style>
        {contained && <style>{`
          @keyframes b03FadeUp { from { opacity:0; transform:translateY(32px); } to { opacity:1; transform:translateY(0); } }
          .b03g-reveal { opacity: 0; }
          .b03g-reveal.b03g-vis { animation: b03FadeUp 0.72s cubic-bezier(.22,.68,0,1.2) forwards; }
        `}</style>}
        {contained && c.title && (
          <h2
            ref={b03gHeadRef}
            className="b03g-reveal text-center uppercase"
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
          ref={b03gGridRef}
          data-four-col-gallery
          className={contained ? "b03g-reveal" : undefined}
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: contained ? "clamp(8px, 1.5vw, 16px)" : "3px",
            maxWidth: contained ? 1200 : undefined,
            margin: contained ? "0 auto" : undefined,
            padding: contained ? "0 clamp(16px, 4vw, 24px)" : undefined,
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
                className="b03g-cell relative block w-full overflow-hidden border-0 bg-transparent p-0"
                style={{ aspectRatio: "1 / 1", cursor: "pointer", borderRadius: 0 }}
                onClick={() => setActiveImage(img)}
                aria-label="Zobrazit větší obrázek"
              >
                <Image
                  src={img.url!}
                  alt={img.alt || ""}
                  width={400}
                  height={400}
                  className="b03g-img h-full w-full object-cover"
                  style={{ transition: "transform 0.5s cubic-bezier(.22,.68,0,1.2)" }}
                  sizes="(max-width: 600px) 50vw, 25vw"
                  unoptimized={shouldSkipNextImageOptimization(img.url)}
                />
                <span className="b03g-overlay" aria-hidden="true">
                  <svg className="b03g-expand" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
                    {/* top-left corner */}
                    <polyline points="4,14 4,4 14,4" stroke="#c8a96e" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                    {/* top-right corner */}
                    <polyline points="30,4 40,4 40,14" stroke="#c8a96e" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                    {/* bottom-right corner */}
                    <polyline points="40,30 40,40 30,40" stroke="#c8a96e" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                    {/* bottom-left corner */}
                    <polyline points="14,40 4,40 4,30" stroke="#c8a96e" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </span>
              </button>
            </GenericEditableImage>
          ))}
        </div>
        {activeImage?.url && (
          <button className="gallery-lightbox" type="button" onClick={() => setActiveImage(null)} aria-label="Zavřít náhled">
            <span className="gallery-lightbox-frame">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img loading="lazy" src={activeImage.fullUrl || activeImage.url} alt={activeImage.alt || ""} />
            </span>
          </button>
        )}
        <style>{`
          .gallery-lightbox{position:fixed;inset:0;z-index:80;display:grid;place-items:center;padding:24px;border:0;background:rgba(0,0,0,0.88);cursor:pointer;}
          .gallery-lightbox-frame{display:block;max-width:min(1100px,94vw);max-height:88vh;}
          .gallery-lightbox-frame img{display:block;max-width:100%;max-height:88vh;width:auto;height:auto;border-radius:4px;object-fit:contain;box-shadow:0 24px 80px rgba(0,0,0,0.5);}
          @media(max-width:900px){[data-four-col-gallery]{grid-template-columns:repeat(3,1fr) !important;}}
          @media(max-width:600px){[data-four-col-gallery]{grid-template-columns:repeat(2,1fr) !important;}}
          .b03g-cell { position: relative; }
          .b03g-img { display: block; }
          .b03g-cell:hover .b03g-img { transform: scale(1.08); }
          .b03g-overlay {
            position: absolute; inset: 0;
            background: rgba(10,10,10,0.38);
            display: flex; align-items: center; justify-content: center;
            opacity: 0;
            transition: opacity 0.35s ease;
          }
          .b03g-cell:hover .b03g-overlay { opacity: 1; }
          .b03g-expand {
            width: 44px; height: 44px;
            opacity: 0;
            transform: scale(0.7);
            transition: opacity 0.35s ease 0.05s, transform 0.35s cubic-bezier(.22,.68,0,1.2) 0.05s;
          }
          .b03g-cell:hover .b03g-expand { opacity: 1; transform: scale(1); }
        `}</style>
      </section>
    );
  }

  if (variant === "barber-04-gallery") {
    const title    = String((content as { title?: string }).title    ?? "Naše práce");
    const subtitle = String((content as { subtitle?: string }).subtitle ?? "Střihy · Holení · Péče o vousy");
    const headRef  = useRef<HTMLDivElement>(null);
    const gridRef  = useRef<HTMLDivElement>(null);
    useEffect(() => {
      const els = [headRef.current, gridRef.current].filter(Boolean) as HTMLElement[];
      const observers = els.map((el) => {
        const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { el.classList.add("b04-vis"); obs.disconnect(); } }, { threshold: 0.12 });
        obs.observe(el);
        return obs;
      });
      return () => observers.forEach((o) => o.disconnect());
    }, []);
    return (
      <section style={{ background: "#0a0806", padding: "88px 0 100px" }} data-template="barber-04">
        {/* Header */}
        <div ref={headRef} className="b04-reveal" style={{ textAlign: "center", marginBottom: 60, padding: "0 24px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 16, marginBottom: 18 }}>
            <div style={{ height: 1, width: 48, background: "#d5b981" }} />
            <p style={{ color: "#d5b981", fontSize: 11, fontWeight: 600, letterSpacing: "0.24em", textTransform: "uppercase", margin: 0, whiteSpace: "nowrap" }}>
              <GenericEditableText sectionId={sectionId} field="subtitle" value={subtitle} tag="span" />
            </p>
            <div style={{ height: 1, width: 48, background: "#d5b981" }} />
          </div>
          <h2 style={{ fontFamily: "'Bebas Neue','Oswald',Impact,sans-serif", fontSize: "clamp(52px,7vw,84px)", color: "#fff", letterSpacing: "0.10em", lineHeight: 1, margin: 0 }}>
            <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
          </h2>
        </div>

        {/* Grid */}
        <div
          ref={gridRef}
          className="b04-gal-grid b04-reveal"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 4,
            maxWidth: 1280,
            margin: "0 auto",
            padding: "0 clamp(16px, 4vw, 24px)",
            animationDelay: "0.15s",
          }}
        >
          {images.map((img, i) => (
            <GenericEditableImage
              key={i}
              sectionId={sectionId}
              field={typeof rawArray[i] === "string" ? `images.${i}` : `images.${i}.url`}
              fullField={typeof rawArray[i] === "string" ? undefined : `images.${i}.fullUrl`}
              src={img.url ?? ""}
              alt={img.alt ?? ""}
              className="b04-gal-cell"
              style={{ overflow: "hidden" }}
            >
              <button
                type="button"
                style={{
                  position: "relative",
                  display: "block",
                  width: "100%",
                  aspectRatio: "3 / 4",
                  background: "#1a1a1a",
                  border: 0,
                  padding: 0,
                  cursor: "pointer",
                  overflow: "hidden",
                }}
                onClick={() => setActiveImage(img)}
                aria-label="Zobrazit"
              >
                {img.url ? (
                  <Image
                    src={img.url}
                    alt={img.alt ?? ""}
                    fill
                    className="b04-gal-img"
                    sizes="(max-width: 768px) 50vw, 33vw"
                    style={{ objectFit: "cover", transition: "transform 0.55s ease" }}
                    unoptimized={shouldSkipNextImageOptimization(img.url)}
                  />
                ) : (
                  <div style={{ position: "absolute", inset: 0, background: "#111" }} />
                )}
                <span className="b04-gal-over" aria-hidden>
                  <span className="b04-gal-icon">
                    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M4 10V4h6M24 10V4h-6M4 18v6h6M24 18v6h-6" stroke="#d5b981" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </span>
                </span>
              </button>
            </GenericEditableImage>
          ))}
        </div>

        {/* Lightbox */}
        {activeImage?.url && (
          <button className="b04-gal-lb" type="button" onClick={() => setActiveImage(null)} aria-label="Zavřít náhled">
            <span className="b04-gal-lb-frame">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img loading="lazy" src={activeImage.fullUrl || activeImage.url} alt={activeImage.alt ?? ""} />
            </span>
          </button>
        )}

        <style>{`
          @keyframes b04FadeUp { from { opacity:0; transform:translateY(32px); } to { opacity:1; transform:translateY(0); } }
          .b04-reveal { opacity: 0; }
          .b04-reveal.b04-vis { animation: b04FadeUp 0.72s cubic-bezier(.22,.68,0,1.2) forwards; }
          .b04-gal-cell { display: block; }
          .b04-gal-cell button { border-radius: 0 !important; }
          .b04-gal-img { transform-origin: center; }
          .b04-gal-cell:hover .b04-gal-img { transform: scale(1.07) !important; }
          .b04-gal-over {
            position: absolute; inset: 0; z-index: 2;
            background: transparent;
            box-shadow: inset 0 0 0 0 rgba(213,185,129,0);
            transition: background 0.35s ease, box-shadow 0.35s ease;
            display: grid; place-items: center;
            pointer-events: none;
          }
          .b04-gal-icon {
            display: grid; place-items: center;
            opacity: 0; transition: opacity 0.35s ease, transform 0.35s ease; transform: scale(0.75);
          }
          .b04-gal-cell:hover .b04-gal-over { background: rgba(10,8,6,0.48); box-shadow: inset 0 0 0 1.5px rgba(213,185,129,0.65); }
          .b04-gal-cell:hover .b04-gal-icon { opacity: 1; transform: scale(1); }
          .b04-gal-lb {
            position: fixed; inset: 0; z-index: 9000; display: grid; place-items: center;
            padding: 24px; border: 0; background: rgba(0,0,0,0.93); cursor: pointer;
          }
          .b04-gal-lb-frame { display: block; max-width: min(1100px,94vw); max-height: 90vh; }
          .b04-gal-lb-frame img {
            display: block; max-width: 100%; max-height: 90vh;
            width: auto; height: auto; object-fit: contain;
            box-shadow: 0 32px 100px rgba(0,0,0,0.7);
          }
          @media (max-width: 900px)  { .b04-gal-grid { grid-template-columns: repeat(2, 1fr) !important; } }
          @media (max-width: 480px)  { .b04-gal-grid { gap: 2px !important; } }
        `}</style>
      </section>
    );
  }

  if (variant === "barber-dark") {
    return <GalleryBarberDark content={content} sectionId={sectionId} images={images} rawArray={rawArray} activeImage={activeImage} setActiveImage={setActiveImage} />;
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
            <img loading="lazy" src={activeImage.fullUrl || activeImage.url} alt={activeImage.alt || ""} />
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

// ── massage-01-gallery-insta ─────────────────────────────────────────────────
// Dark BG #0A0A0A, 4-col × 2-row grid, gap 8px, hover zoom 1.06
// Section header: gold dot + sectionTag + H2 + instagram handle CTA
// ─────────────────────────────────────────────────────────────────────────────
function Massage01GalleryInsta({
  content,
  sectionId,
  images,
}: {
  content: Record<string, unknown>;
  sectionId: number;
  images: GalleryImage[];
}) {
  const sectionTag       = String(content.sectionTag       ?? "Galerie");
  const heading          = String(content.heading          ?? "Naše prostředí");
  const instagramHandle  = String(content.instagramHandle  ?? "@demomasaze");
  const instagramUrl     = String(content.instagramUrl     ?? "#");

  const BG       = "#0A0A0A";
  const GOLD     = "#C9A962";
  const GOLDDIM  = "rgba(201,169,98,0.18)";
  const TEXT     = "#F5F0E8";
  const SECONDARY = "#A09888";
  const BORDER   = "#2A2520";
  const FONT     = "'Inter', sans-serif";
  const SERIF    = "'Cormorant Garamond', serif";

  // Use first 8 images (2 rows × 4 cols), pad with repeats if fewer
  const padded = images.length === 0
    ? Array(8).fill({ url: "", alt: "" })
    : Array.from({ length: 8 }, (_, i) => images[i % images.length]);
  const rows = [padded.slice(0, 4), padded.slice(4, 8)];

  const [hovered, setHovered] = useState<number | null>(null);
  const [ctaHovered, setCtaHovered] = useState(false);

  return (
    <section
      id="galerie"
      style={{ backgroundColor: BG, padding: "100px 80px" }}
      data-template="massage-01"
    >
      <div style={{ maxWidth: 1280, margin: "0 auto" }}>
        {/* Section header */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, textAlign: "center", marginBottom: 56 }}>
          <p style={{ display: "inline-flex", alignItems: "center", gap: 8, color: GOLD, fontFamily: FONT, fontSize: 11, fontWeight: 500, letterSpacing: 3, textTransform: "uppercase", margin: 0 }}>
            <span style={{ display: "inline-block", width: 6, height: 6, background: GOLD, borderRadius: "50%" }} />
            <GenericEditableText sectionId={sectionId} field="sectionTag" value={sectionTag} tag="span" />
          </p>
          <h2 style={{ fontFamily: SERIF, fontSize: 44, fontWeight: 400, color: TEXT, lineHeight: 1.1, margin: 0 }}>
            <GenericEditableText sectionId={sectionId} field="heading" value={heading} tag="span" />
          </h2>
          <p style={{ fontFamily: FONT, fontSize: 15, fontWeight: 300, color: SECONDARY, margin: 0 }}>
            <a
              href={instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: SECONDARY, textDecoration: "underline" }}
            >
              {instagramHandle}
            </a>
          </p>
        </div>

        {/* 4×2 grid */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 48 }}>
          {rows.map((row, ri) => (
            <div key={ri} style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
              {row.map((img, ci) => {
                const globalIdx = ri * 4 + ci;
                return (
                  <div
                    key={ci}
                    onMouseEnter={() => setHovered(globalIdx)}
                    onMouseLeave={() => setHovered(null)}
                    style={{
                      aspectRatio: "1",
                      overflow: "hidden",
                      background: "#141414",
                      position: "relative",
                    }}
                  >
                    {img.url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={img.url}
                        alt={img.alt ?? ""}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          display: "block",
                          transform: hovered === globalIdx ? "scale(1.06)" : "scale(1)",
                          transition: "transform 0.4s ease",
                        }}
                      />
                    ) : (
                      <div style={{ width: "100%", height: "100%", background: "#1A1A1A" }} />
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {/* Instagram CTA */}
        <div style={{ display: "flex", justifyContent: "center" }}>
          <a
            href={instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            onMouseEnter={() => setCtaHovered(true)}
            onMouseLeave={() => setCtaHovered(false)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
              padding: "16px 36px",
              fontFamily: FONT,
              fontSize: 13,
              fontWeight: 500,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: ctaHovered ? "#0A0A0A" : GOLD,
              background: ctaHovered ? GOLD : "transparent",
              border: `1px solid ${ctaHovered ? GOLD : GOLDDIM}`,
              textDecoration: "none",
              transition: "all 0.25s ease",
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
              <circle cx="12" cy="12" r="4"/>
              <circle cx="17.5" cy="6.5" r=".5" fill="currentColor"/>
            </svg>
            Sledovat na Instagramu
          </a>
        </div>
      </div>
    </section>
  );
}

// ── tattoo-01-gallery ─────────────────────────────────────────────────────────
// Galerie s nadpisem, paddingem, tmavý bg — 4-col mřížka s lightboxem
// ─────────────────────────────────────────────────────────────────────────────
function GalleryTattoo01({
  content,
  sectionId,
  images,
  rawArray,
}: {
  content: Record<string, unknown>;
  sectionId: number;
  images: GalleryImage[];
  rawArray: unknown[];
}) {
  const heading = String(content.heading ?? "Naše práce");
  const [activeImage, setActiveImage] = useState<GalleryImage | null>(null);
  const ACCENT = "#ff5c4b";
  const SANS   = "Arial, Helvetica, sans-serif";

  return (
    <section
      id="galerie"
      data-template="tattoo-01"
      style={{ backgroundColor: "#111111" }}
    >
      {/* Nadpis s paddingem */}
      <div style={{ padding: "clamp(56px, 8vw, 96px) clamp(24px, 6vw, 80px) clamp(48px, 6vw, 72px)", textAlign: "center" }}>
        <div style={{ width: 48, height: 3, backgroundColor: ACCENT, margin: "0 auto 24px" }} aria-hidden />
        <h2
          style={{
            fontFamily: "'Arial Black', Arial, sans-serif",
            fontSize: "clamp(1.5rem, 3vw, 2.25rem)",
            fontWeight: 900,
            color: "#ffffff",
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            margin: 0,
          }}
        >
          <GenericEditableText sectionId={sectionId} field="heading" value={heading} tag="span" />
        </h2>
      </div>

      {/* 4-col mřížka — edge-to-edge */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 3,
        }}
      >
        {images.map((img, i) => (
          <GenericEditableImage
            key={i}
            sectionId={sectionId}
            field={typeof rawArray[i] === "string" ? `images.${i}` : `images.${i}.url`}
            src={img.url!}
            alt={img.alt || ""}
            className="relative w-full"
            style={{ overflow: "hidden" }}
          >
            <button
              type="button"
              className="relative block w-full overflow-hidden border-0 bg-transparent p-0 group"
              style={{ aspectRatio: "1 / 1", cursor: "zoom-in" }}
              onClick={() => setActiveImage(img)}
              aria-label="Zobrazit větší obrázek"
            >
              <Image
                src={img.url!}
                alt={img.alt || ""}
                width={400}
                height={400}
                className="h-full w-full object-cover"
                style={{ transition: "transform 0.5s ease, filter 0.5s ease" }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLImageElement).style.transform = "scale(1.06)";
                  (e.currentTarget as HTMLImageElement).style.filter = "brightness(1.1)";
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLImageElement).style.transform = "scale(1)";
                  (e.currentTarget as HTMLImageElement).style.filter = "none";
                }}
                sizes="(max-width: 600px) 50vw, 25vw"
                unoptimized={shouldSkipNextImageOptimization(img.url)}
              />
              {/* Červený hover overlay */}
              <div
                style={{
                  position: "absolute", inset: 0,
                  backgroundColor: ACCENT,
                  opacity: 0,
                  transition: "opacity 0.3s",
                  pointerEvents: "none",
                }}
                className="t01-gallery-hover"
              />
            </button>
          </GenericEditableImage>
        ))}
      </div>

      {/* Spodní padding */}
      <div style={{ height: "clamp(48px, 7vw, 80px)" }} />

      {/* Lightbox */}
      {activeImage?.url && (
        <button
          className="gallery-lightbox"
          type="button"
          onClick={() => setActiveImage(null)}
          aria-label="Zavřít náhled"
        >
          <span className="gallery-lightbox-frame">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img loading="lazy" src={activeImage.fullUrl || activeImage.url} alt={activeImage.alt || ""} />
          </span>
        </button>
      )}

      <style>{`
        .gallery-lightbox{position:fixed;inset:0;z-index:80;display:grid;place-items:center;padding:24px;border:0;background:rgba(0,0,0,0.92);cursor:zoom-out;}
        .gallery-lightbox-frame{display:block;max-width:min(1100px,94vw);max-height:88vh;}
        .gallery-lightbox-frame img{display:block;max-width:100%;max-height:88vh;width:auto;height:auto;object-fit:contain;box-shadow:0 24px 80px rgba(0,0,0,0.6);}
        .t01-gallery-hover { opacity: 0 !important; }
        button:hover .t01-gallery-hover { opacity: 0.08 !important; }
        @media(max-width:900px){[data-template="tattoo-01"] #galerie .t01-grid{grid-template-columns:repeat(3,1fr) !important;}}
        @media(max-width:540px){[data-template="tattoo-01"] #galerie .t01-grid{grid-template-columns:repeat(2,1fr) !important;}}
        @media(max-width:900px){[data-template="tattoo-01"] #galerie>div:nth-child(2){grid-template-columns:repeat(3,1fr) !important;}}
        @media(max-width:540px){[data-template="tattoo-01"] #galerie>div:nth-child(2){grid-template-columns:repeat(2,1fr) !important;}}
      `}</style>
    </section>
  );
}

// ── tattoo-02-gallery ─────────────────────────────────────────────────────────
// Záložky Tattoo / Piercing, masonry-like 3-col grid, tmavá sekce, zlaté akcenty.
// ─────────────────────────────────────────────────────────────────────────────
function GalleryTattoo02({ content, sectionId }: {
  content: Record<string, unknown>;
  sectionId: number;
}) {
  const c       = content as Record<string, unknown>;
  const heading = String(c.heading    ?? "Portfolio");
  const tabs    = (c.tabs as string[]) ?? ["Tattoo", "Piercing"];
  const images  = (c.images as Array<{ url: string; alt: string; tab: string }>) ?? [];

  const [activeTab, setActiveTab] = useState(tabs[0] ?? "Tattoo");
  const filtered = images.filter(img => img.tab === activeTab);

  const GOLD = "#BF8A1D";
  const DARK = "#111111";

  return (
    <>
      <style>{`
        .tg02-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 8px;
        }
        @media (max-width: 860px) { .tg02-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 480px) { .tg02-grid { grid-template-columns: 1fr 1fr; gap: 4px; } }
        .tg02-img-wrap {
          overflow: hidden;
          aspect-ratio: 1 / 1;
          cursor: pointer;
        }
        .tg02-img-wrap img {
          width: 100%; height: 100%;
          object-fit: cover;
          transition: transform 0.4s ease;
          display: block;
        }
        .tg02-img-wrap:hover img { transform: scale(1.06); }
        .tg02-tab {
          background: none; border: none; cursor: pointer;
          font-family: Arial, sans-serif; font-size: 0.8rem; font-weight: 700;
          letter-spacing: 0.18em; text-transform: uppercase;
          padding: 10px 0; margin: 0 20px;
          color: rgba(255,255,255,0.45);
          border-bottom: 2px solid transparent;
          transition: color 0.2s, border-color 0.2s;
        }
        .tg02-tab.active { color: ${GOLD}; border-bottom-color: ${GOLD}; }
        .tg02-tab:hover:not(.active) { color: rgba(255,255,255,0.75); }
      `}</style>

      <section
        id="galerie"
        data-section="gallery-tattoo-02"
        style={{ background: DARK, padding: "clamp(64px,9vw,110px) 0" }}
      >
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 48, padding: "0 24px" }}>
          <p style={{
            fontFamily: "Arial, sans-serif", fontSize: "0.7rem", fontWeight: 700,
            color: GOLD, letterSpacing: "0.3em", textTransform: "uppercase",
            margin: "0 0 14px",
          }}>
            Naše práce
          </p>
          <h2 style={{
            fontFamily: "'Arial Black', Arial, sans-serif",
            fontWeight: 900, fontSize: "clamp(28px,4vw,46px)",
            color: "#fff", margin: "0 0 32px", lineHeight: 1.1,
          }}>
            <GenericEditableText sectionId={sectionId} field="heading" value={heading} tag="span" />
          </h2>

          {/* Záložky */}
          <div style={{ display: "flex", justifyContent: "center", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
            {tabs.map(tab => (
              <button
                key={tab}
                className={`tg02-tab${activeTab === tab ? " active" : ""}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 clamp(12px,3vw,32px)" }}>
          <div className="tg02-grid">
            {filtered.map((img, i) => (
              <div key={`${activeTab}-${i}`} className="tg02-img-wrap">
                <img src={img.url} alt={img.alt} loading="lazy" />
              </div>
            ))}
          </div>

          {/* CTA pod gridem */}
          <div style={{ textAlign: "center", marginTop: 48 }}>
            <a
              href="#kontakt"
              style={{
                display: "inline-flex", alignItems: "center", gap: 10,
                background: GOLD, color: "#fff",
                fontFamily: "Arial, sans-serif", fontSize: "0.78rem", fontWeight: 700,
                letterSpacing: "0.1em", textTransform: "uppercase", textDecoration: "none",
                padding: "0 36px", height: 50,
                transition: "background 0.2s",
              }}
              onMouseEnter={e => (e.currentTarget.style.background = "#a87318")}
              onMouseLeave={e => (e.currentTarget.style.background = GOLD)}
            >
              Objednat konzultaci
              <svg width="16" height="10" viewBox="0 0 16 10" fill="none" aria-hidden>
                <path d="M1 5h14M10 1l5 4-5 4" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </a>
          </div>
        </div>
      </section>
    </>
  );
}

// ── tattoo-03-gallery ─────────────────────────────────────────────────────────
// Tmavý bg + 4-col portrait mřížka — magictattoo.cz inspired
// #0A0A0E bg, H2 + červený subheading, 4-col grid s aspect-ratio 3/4
// ─────────────────────────────────────────────────────────────────────────────
function GalleryTattoo03({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const c          = content as Record<string, unknown>;
  const heading    = String(c.heading    ?? "Ukázky práce");
  const subheading = String(c.subheading ?? "Práce našich tatérů");
  const rawImages  = (c.images as Array<{ url: string; alt: string }>) ?? [];

  const BG     = "#0A0A0E";
  const ACCENT = "#D41515";

  return (
    <section id="galerie" style={{ backgroundColor: BG, padding: "clamp(48px,7vw,96px) clamp(20px,4vw,40px)" }}>
      <div style={{ maxWidth: 1360, margin: "0 auto" }}>
        {/* Nadpis */}
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <p style={{
            fontFamily: "Arial, Helvetica, sans-serif",
            fontSize: "0.75rem", fontWeight: 700,
            color: ACCENT, letterSpacing: "0.18em",
            textTransform: "uppercase", margin: "0 0 8px",
          }}>
            <GenericEditableText sectionId={sectionId} field="subheading" value={subheading} tag="span" />
          </p>
          <h2 style={{
            fontFamily: "Arial, Helvetica, sans-serif",
            fontWeight: 900,
            fontSize: "clamp(22px, 2.8vw, 38px)",
            color: "#ffffff", margin: 0,
          }}>
            <GenericEditableText sectionId={sectionId} field="heading" value={heading} tag="span" />
          </h2>
        </div>

        {/* 4-col mřížka */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 8,
        }} className="t03-gallery-grid">
          <style>{`
            @media (max-width: 900px) { .t03-gallery-grid { grid-template-columns: repeat(2, 1fr) !important; } }
            @media (max-width: 480px) { .t03-gallery-grid { grid-template-columns: repeat(2, 1fr) !important; } }
          `}</style>
          {rawImages.map((img, i) => (
            <div
              key={i}
              style={{
                aspectRatio: "3/4",
                overflow: "hidden",
                backgroundColor: "#141414",
              }}
            >
              <GenericEditableImage sectionId={sectionId} field={`images.${i}.url`} src={img.url} alt={img.alt} className="w-full h-full" style={{ width: "100%", height: "100%" }}>
                <img
                  src={img.url}
                  alt={img.alt}
                  style={{
                    width: "100%", height: "100%",
                    objectFit: "cover", objectPosition: "center",
                    transition: "transform 0.4s ease",
                  }}
                  loading="lazy"
                  onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.04)")}
                  onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
                />
              </GenericEditableImage>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// nails-01: 3-col masonry-style grid, 6 photos — cream bg, centered title
function GalleryNails01({ content, sectionId, images }: { content: Record<string, unknown>; sectionId: number; images: GalleryImage[] }) {
  const BURGUNDY = "#79142b";
  const SERIF    = "Georgia, 'Times New Roman', serif";
  const title    = (content.title as string) ?? "Naše studio";

  const displayImages = images.slice(0, 6);

  return (
    <section
      id="galerie"
      data-template="nails-01"
      style={{ backgroundColor: "#f4f1e9", padding: "clamp(60px, 8vh, 96px) clamp(24px, 4vw, 60px)" }}
    >
      <div style={{ textAlign: "center", marginBottom: "clamp(36px, 5vh, 56px)" }}>
        <h2 style={{
          fontFamily: SERIF,
          fontSize: "clamp(24px, 2.8vw, 40px)",
          fontWeight: 400,
          color: BURGUNDY,
          margin: 0,
        }}>
          <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
        </h2>
      </div>

      {/* 3-col grid, rows auto */}
      <style>{`
        .n01-gallery-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: clamp(8px, 1.2vw, 16px); max-width: 1100px; margin: 0 auto; }
        @media (max-width: 640px) { .n01-gallery-grid { grid-template-columns: repeat(2, 1fr); } }
      `}</style>
      <div className="n01-gallery-grid">
        {displayImages.map((img, i) => (
          <div
            key={i}
            style={{
              overflow: "hidden",
              borderRadius: "4px",
              aspectRatio: i === 0 || i === 5 ? "4/5" : "1/1",
            }}
          >
            <GenericEditableImage
              sectionId={sectionId}
              field={`images.${i}.url`}
              src={img.url ?? ""}
              alt={img.alt ?? "Studio"}
              className="w-full h-full"
              style={{ width: "100%", height: "100%" }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img.url ?? ""}
                alt={img.alt ?? "Studio"}
                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", transition: "transform 0.4s ease" }}
                onMouseEnter={e => ((e.currentTarget as HTMLImageElement).style.transform = "scale(1.04)")}
                onMouseLeave={e => ((e.currentTarget as HTMLImageElement).style.transform = "scale(1)")}
              />
            </GenericEditableImage>
          </div>
        ))}
      </div>
    </section>
  );
}

// ── nails-02-gallery ──────────────────────────────────────────────────────────
// Editoriální gallery — cream bg, big wine serif italic "Galerie" + taupe linka
// + uppercase kicker. 3-col grid 6 portrait fotek, čisté hrany, hover scale +
// taupe overlay. IG link dole.
// ─────────────────────────────────────────────────────────────────────────────
function GalleryNails02({ content, sectionId, images }: { content: Record<string, unknown>; sectionId: number; images: GalleryImage[] }) {
  const WINE  = "#6b3f38";
  const TAUPE = "#d4a080";
  const CREAM = "#f6efe9";

  const title    = String(content.title    ?? "Galerie");
  const kicker   = String(content.kicker   ?? "Naše práce v detailu");
  const igText   = String(content.igText   ?? "Sledujte nás na Instagramu");
  const igHref   = String(content.igHref   ?? "https://instagram.com/demo");

  return (
    <section
      id="galerie"
      data-section-type="gallery"
      data-variant="nails-02-gallery"
      data-template="nails-02"
      style={{
        backgroundColor: CREAM,
        padding: "clamp(80px, 12vw, 160px) clamp(24px, 6vw, 72px)",
      }}
    >
      <div style={{ maxWidth: 1320, margin: "0 auto" }}>
        <div style={{ marginBottom: "clamp(56px, 7vw, 88px)", textAlign: "left" }}>
          <h2
            style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontStyle: "italic",
              fontWeight: 400,
              fontSize: "clamp(3rem, 6vw, 5.6rem)",
              lineHeight: 1,
              color: WINE,
              margin: 0,
              letterSpacing: "-0.01em",
            }}
          >
            <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
          </h2>
          <div aria-hidden="true" style={{ width: 64, height: 1, backgroundColor: TAUPE, margin: "32px 0 24px" }} />
          <p
            style={{
              fontFamily: "'Poppins', 'Helvetica Neue', Arial, sans-serif",
              fontSize: "0.78rem",
              fontWeight: 500,
              color: TAUPE,
              textTransform: "uppercase",
              letterSpacing: "0.32em",
              margin: 0,
            }}
          >
            <GenericEditableText sectionId={sectionId} field="kicker" value={kicker} tag="span" />
          </p>
        </div>

        <div
          className="nails02-gallery-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
            gap: "clamp(14px, 1.6vw, 22px)",
          }}
        >
          {images.slice(0, 6).map((img, i) => (
            <GenericEditableImage
              key={`g-${i}`}
              sectionId={sectionId}
              field={`images.${i}.url`}
              src={img.url ?? ""}
              alt={img.alt ?? `Galerie ${i + 1}`}
              style={{
                position: "relative",
                aspectRatio: "3 / 4",
                overflow: "hidden",
                display: "block",
                cursor: "default",
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img.fullUrl || img.url || ""}
                alt={img.alt ?? `Galerie ${i + 1}`}
                loading="lazy"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  display: "block",
                  transition: "transform 0.6s ease",
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLImageElement).style.transform = "scale(1.06)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLImageElement).style.transform = "scale(1)"; }}
              />
            </GenericEditableImage>
          ))}
        </div>

        <div style={{ marginTop: "clamp(48px, 6vw, 72px)", textAlign: "center" }}>
          <a
            href={igHref}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
              fontFamily: "'Poppins', 'Helvetica Neue', Arial, sans-serif",
              fontSize: "0.84rem",
              fontWeight: 500,
              color: WINE,
              textTransform: "uppercase",
              letterSpacing: "0.28em",
              textDecoration: "none",
              paddingBottom: 4,
              borderBottom: `1px solid ${WINE}`,
              transition: "color 0.2s, border-color 0.2s",
            }}
            onMouseEnter={e => { e.currentTarget.style.color = TAUPE; e.currentTarget.style.borderBottomColor = TAUPE; }}
            onMouseLeave={e => { e.currentTarget.style.color = WINE; e.currentTarget.style.borderBottomColor = WINE; }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="3" y="3" width="18" height="18" rx="5"/>
              <circle cx="12" cy="12" r="4"/>
              <circle cx="17.5" cy="6.5" r="0.8" fill="currentColor" stroke="none"/>
            </svg>
            <GenericEditableText sectionId={sectionId} field="igText" value={igText} tag="span" />
          </a>
        </div>
      </div>
      <style>{`
        @media (max-width: 768px) {
          .nails02-gallery-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
      `}</style>
    </section>
  );
}

// ── nails-03-gallery ──────────────────────────────────────────────────────────
// maidenstudio.cz Instagram sekce — dark #0B090C bg, centrovaný cream kicker +
// H2; 3-col × 2-row grid 6 fotek (aspect 1/1), hover dim overlay 0.25;
// cream IG handle link s ikonkou dole.
// ─────────────────────────────────────────────────────────────────────────────
function GalleryNails03({
  content,
  sectionId,
  images,
}: {
  content: Record<string, unknown>;
  sectionId: number;
  images: GalleryImage[];
}) {
  const DARK  = "#0B090C";
  const CREAM = "#FCF9F0";
  const BROWN = "#806248";
  const FONT  = "'Manrope', 'Helvetica Neue', Arial, sans-serif";

  const title  = String(content.title  ?? "Galerie");
  const kicker = String(content.kicker ?? "Sledujte nás na Instagramu");
  const igText = String(content.igText ?? "@maiden_studio_demo");
  const igHref = String(content.igHref ?? "https://instagram.com/demo");

  const displayImages = images.slice(0, 6);

  return (
    <section
      id="galerie"
      data-section-type="gallery"
      data-variant="nails-03-gallery"
      style={{ backgroundColor: DARK, padding: "96px 24px" }}
    >
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 52 }}>
          <p style={{
            fontFamily: FONT, fontWeight: 700, fontSize: "0.72rem",
            letterSpacing: "0.28em", textTransform: "uppercase",
            color: BROWN, margin: "0 0 16px",
          }}>
            <GenericEditableText sectionId={sectionId} field="kicker" value={kicker} tag="span" />
          </p>
          <h2 style={{
            fontFamily: FONT, fontWeight: 800,
            fontSize: "clamp(1.9rem, 3.5vw, 2.8rem)",
            color: CREAM, margin: 0, lineHeight: 1.1,
          }}>
            <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
          </h2>
        </div>

        {/* 3×2 grid */}
        <div
          className="nails03-gallery-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 8,
          }}
        >
          {displayImages.map((img, i) => {
            const src = img.url || img.fullUrl || "";
            return (
              <div
                key={i}
                style={{
                  position: "relative",
                  aspectRatio: "1/1",
                  overflow: "hidden",
                  cursor: "pointer",
                }}
                onMouseEnter={e => {
                  const overlay = e.currentTarget.querySelector(".n03-gallery-overlay") as HTMLElement | null;
                  if (overlay) overlay.style.opacity = "1";
                }}
                onMouseLeave={e => {
                  const overlay = e.currentTarget.querySelector(".n03-gallery-overlay") as HTMLElement | null;
                  if (overlay) overlay.style.opacity = "0";
                }}
              >
                <GenericEditableImage
                  sectionId={sectionId}
                  field={`images[${i}].url`}
                  src={src}
                  alt={img.alt || `Fotografie ${i + 1}`}
                  style={{ display: "block", width: "100%", height: "100%" }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={src}
                    alt={img.alt || `Fotografie ${i + 1}`}
                    style={{
                      width: "100%", height: "100%",
                      objectFit: "cover", display: "block",
                      position: "absolute", inset: 0,
                      transition: "transform 0.4s ease",
                    }}
                  />
                </GenericEditableImage>
                {/* Hover overlay */}
                <div
                  className="n03-gallery-overlay"
                  aria-hidden="true"
                  style={{
                    position: "absolute", inset: 0,
                    backgroundColor: "rgba(11,9,12,0.28)",
                    opacity: 0,
                    transition: "opacity 0.3s ease",
                  }}
                />
              </div>
            );
          })}
        </div>

        {/* IG link */}
        <div style={{ textAlign: "center", marginTop: 44 }}>
          <a
            href={igHref}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-flex", alignItems: "center", gap: 10,
              fontFamily: FONT, fontSize: "0.9rem", fontWeight: 600,
              letterSpacing: "0.08em", color: CREAM,
              textDecoration: "none",
              opacity: 0.85,
              transition: "opacity 0.2s, color 0.2s",
            }}
            onMouseEnter={e => { e.currentTarget.style.opacity = "1"; e.currentTarget.style.color = BROWN; }}
            onMouseLeave={e => { e.currentTarget.style.opacity = "0.85"; e.currentTarget.style.color = CREAM; }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
              <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
            </svg>
            <GenericEditableText sectionId={sectionId} field="igText" value={igText} tag="span" />
          </a>
        </div>
      </div>

      <style>{`
        @media (max-width: 640px) {
          .nails03-gallery-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
      `}</style>
    </section>
  );
}

// ── clinic-03-gallery ─────────────────────────────────────────────────────────
// Masonry-style 3-col grid: 1. řada velký + 2 menší, 2. řada 3 stejné
// hover scale 1.04, outline gold CTA dole
// Reference: yesvisage.cz — Proměny sekce
// ─────────────────────────────────────────────────────────────────────────────
function GalleryClinic03({ content, sectionId, images }: { content: Record<string,unknown>; sectionId: number; images: GalleryImage[] }) {
  const GOLD   = "#97855F";
  const GOLD_H = "#716448";
  const WHITE  = "#ffffff";
  const DARK   = "#2D2D2D";
  const SURF   = "#F7F5F0";
  const FONT   = "'DM Sans', Arial, sans-serif";
  const SERIF  = "'Playfair Display', Georgia, serif";

  const title   = String(content.title   ?? "Proměny našich klientů");
  const kicker  = String(content.kicker  ?? "Z dokonalých proměn spokojení klienti");
  const ctaText = String(content.ctaText ?? "Všechny proměny");

  const fallback = [
    { url: "https://images.unsplash.com/photo-1552693673-1bf958298935?auto=format&fit=crop&w=600&q=80", alt: "Proměna 1" },
    { url: "https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&w=600&q=80", alt: "Proměna 2" },
    { url: "https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?auto=format&fit=crop&w=600&q=80", alt: "Proměna 3" },
    { url: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=600&q=80", alt: "Proměna 4" },
    { url: "https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?auto=format&fit=crop&w=600&q=80", alt: "Proměna 5" },
    { url: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=600&q=80", alt: "Proměna 6" },
  ];
  const imgs = images.length > 0 ? images : fallback;

  function ImgCell({ img, idx, style }: { img: GalleryImage; idx: number; style: React.CSSProperties }) {
    return (
      <div style={{ overflow: "hidden", backgroundColor: SURF, ...style }}>
        <GenericEditableImage sectionId={sectionId} field={`images.${idx}.url`} src={img.url ?? ""} alt={img.alt ?? ""} style={{ display: "block", width: "100%", height: "100%" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={img.url} alt={img.alt ?? ""}
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", transition: "transform 0.4s ease" }}
            onMouseEnter={e => { (e.currentTarget as HTMLImageElement).style.transform = "scale(1.05)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLImageElement).style.transform = "scale(1)"; }}
          />
        </GenericEditableImage>
      </div>
    );
  }

  return (
    <section id="galerie" data-variant="clinic-03-gallery" style={{ backgroundColor: WHITE, padding: "80px 0", fontFamily: FONT }}>
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 clamp(20px, 4vw, 60px)" }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <p style={{ fontSize: "0.72rem", fontWeight: 400, color: GOLD, letterSpacing: "0.18em", textTransform: "uppercase", margin: "0 0 12px", fontFamily: FONT }}>
            <GenericEditableText sectionId={sectionId} field="kicker" value={kicker} tag="span" />
          </p>
          <h2 style={{ fontFamily: SERIF, fontSize: "clamp(1.5rem, 2.4vw, 2rem)", fontWeight: 400, color: DARK, margin: 0 }}>
            <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
          </h2>
        </div>

        {/* Row 1: large left (2 cols) + 2 portrait right */}
        <div className="c03-gal-row1" style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: 12, marginBottom: 12 }}>
          <ImgCell img={imgs[0] ?? fallback[0]} idx={0} style={{ aspectRatio: "4/3" }} />
          <ImgCell img={imgs[1] ?? fallback[1]} idx={1} style={{ aspectRatio: "3/4" }} />
          <ImgCell img={imgs[2] ?? fallback[2]} idx={2} style={{ aspectRatio: "3/4" }} />
        </div>

        {/* Row 2: 3 equal portraits */}
        <div className="c03-gal-row2" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 40 }}>
          <ImgCell img={imgs[3] ?? fallback[3]} idx={3} style={{ aspectRatio: "3/4" }} />
          <ImgCell img={imgs[4] ?? fallback[4]} idx={4} style={{ aspectRatio: "3/4" }} />
          <ImgCell img={imgs[5] ?? fallback[5]} idx={5} style={{ aspectRatio: "3/4" }} />
        </div>

        {/* CTA */}
        <div style={{ textAlign: "center" }}>
          <a
            href="#kontakt"
            style={{ display: "inline-flex", alignItems: "center", height: 48, padding: "0 36px", border: `1px solid ${GOLD}`, color: GOLD, fontFamily: FONT, fontSize: "0.85rem", fontWeight: 400, letterSpacing: "0.08em", textDecoration: "none", transition: "all 0.18s" }}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = GOLD; e.currentTarget.style.color = WHITE; }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = GOLD; }}
          >
            <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
          </a>
        </div>
      </div>
      <style>{`
        @media (max-width: 768px) {
          #galerie .c03-gal-row1 { grid-template-columns: 1fr 1fr !important; }
          #galerie .c03-gal-row1 > *:first-child { grid-column: 1 / -1; }
          #galerie .c03-gal-row2 { grid-template-columns: 1fr 1fr !important; }
        }
        @media (max-width: 480px) {
          #galerie .c03-gal-row1,
          #galerie .c03-gal-row2 { grid-template-columns: 1fr !important; }
          #galerie .c03-gal-row1 > *:first-child { grid-column: auto; }
        }
      `}</style>
    </section>
  );
}

// ── fitness-02-gallery-grid ───────────────────────────────────────────────────
// 5-col mosaic grid — 1:1 fitnessvictory.cz
// Black bg, pink kicker + Archivo Black H2
// 5-col compact grid with hover pink overlay
// ─────────────────────────────────────────────────────────────────────────────
function GalleryFitness02({
  content,
  sectionId,
  images: rawImages,
}: {
  content: Record<string, unknown>;
  sectionId: number;
  images: GalleryImage[];
}) {
  const tagline = String(content.tagline ?? "Naše centra");
  const title   = String(content.title   ?? "Moderní vybavení, přátelská atmosféra");
  const imgs    = rawImages.slice(0, 10);

  const ACCENT = "#FF5500";
  const WHITE  = "#FFFFFF";
  const FONT_H = "'Archivo Black', sans-serif";
  const FONT_B = "'Montserrat', sans-serif";

  return (
    <section
      id="galerie"
      style={{ backgroundColor: "#000000", padding: "100px 0", fontFamily: FONT_B }}
      data-template="fitness-02"
    >
      <style>{`
        .f02-gal-item:hover img { transform: scale(1.06); }
        .f02-gal-item:hover .f02-gal-overlay { opacity: 1 !important; }
      `}</style>

      <div style={{ maxWidth: 1140, margin: "0 auto", padding: "0 24px", marginBottom: 48 }}>
        <p style={{
          fontSize: 13, fontWeight: 600, letterSpacing: "0.15em",
          textTransform: "uppercase", color: ACCENT, marginBottom: 12, fontFamily: FONT_B,
          textAlign: "center",
        }}>
          <GenericEditableText sectionId={sectionId} field="tagline" value={tagline} tag="span" />
        </p>
        <h2 style={{
          fontFamily: FONT_H, fontSize: "clamp(26px, 3vw, 42px)", fontWeight: 900,
          color: WHITE, textTransform: "uppercase", textAlign: "center", lineHeight: 1.2,
        }}>
          <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
        </h2>
      </div>

      {/* 5-col grid */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(5, 1fr)",
        gap: 4,
        maxWidth: 1600,
        margin: "0 auto",
      }} className="f02-gallery-grid">
        {imgs.map((img, i) => (
          <div
            key={i}
            className="f02-gal-item"
            style={{ position: "relative", overflow: "hidden", cursor: "pointer", aspectRatio: "1/1" }}
          >
            <GenericEditableImage sectionId={sectionId} field={`images.${i}.url`} src={img.url ?? ""} alt={img.alt ?? `Foto ${i + 1}`} className="relative" style={{ width: "100%", height: "100%" }}>
              <img
                src={img.url ?? ""}
                alt={img.alt ?? `Foto ${i + 1}`}
                style={{
                  width: "100%", height: "100%", objectFit: "cover",
                  display: "block", transition: "transform 0.5s ease",
                }}
              />
            </GenericEditableImage>
            <div
              className="f02-gal-overlay"
              style={{
                position: "absolute", inset: 0,
                background: `rgba(255,85,0,0.2)`,
                opacity: 0, transition: "opacity 0.3s ease",
                pointerEvents: "none",
              }}
            />
          </div>
        ))}
      </div>

      <style>{`
        @media (max-width: 900px) {
          #galerie .f02-gallery-grid { grid-template-columns: repeat(3, 1fr) !important; }
        }
        @media (max-width: 600px) {
          #galerie .f02-gallery-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
      `}</style>
    </section>
  );
}

// ── restaurant-03-gallery ──────────────────────────────────────────────────────
// Dark #0c351a bg, zlatý kicker + bílý serif H2 centrovaně
// 4-col grid landscape fotek (3:2 aspect) s hover zlatým overlay + scale
// Dole: zlaté outline CTA "Celá galerie" (pokud ctaText vyplněno)
// Ref: lacasalatina.cz galerie — 600×400 food a atmosféra fotky
// ─────────────────────────────────────────────────────────────────────────────
function GalleryRestaurant03({ content, sectionId, images }: { content: Record<string, unknown>; sectionId: number; images: GalleryImage[] }) {
  const id      = String(content.id      ?? "galerie");
  const tagline = String(content.tagline ?? "Atmosféra");
  const title   = String(content.title   ?? "Nahlédněte\nk nám.");
  const ctaText = String(content.ctaText ?? "");
  const ctaHref = String(content.ctaHref ?? "/galerie");

  const BG   = "#0d1b2a";
  const GOLD = "#e05e3f";
  const WHITE = "#ffffff";
  const FONT = "Georgia, 'Times New Roman', serif";
  const SANS = "'Helvetica Neue', Helvetica, Arial, sans-serif";

  const FALLBACK_IMGS: GalleryImage[] = [
    { url: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&h=533&fit=crop&fm=webp&q=80", alt: "Restaurace" },
    { url: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&h=533&fit=crop&fm=webp&q=80", alt: "Jídlo" },
    { url: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=800&h=533&fit=crop&fm=webp&q=80", alt: "Ceviche" },
    { url: "https://images.unsplash.com/photo-1578474846511-04ba529f0b88?w=800&h=533&fit=crop&fm=webp&q=80", alt: "Bar" },
    { url: "https://images.unsplash.com/photo-1544025162-d76694265947?w=800&h=533&fit=crop&fm=webp&q=80", alt: "Grill" },
    { url: "https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=800&h=533&fit=crop&fm=webp&q=80", alt: "Steak" },
    { url: "https://images.unsplash.com/photo-1559847844-5315695dadae?w=800&h=533&fit=crop&fm=webp&q=80", alt: "Mořské plody" },
    { url: "https://images.unsplash.com/photo-1547592180-85f173990554?w=800&h=533&fit=crop&fm=webp&q=80", alt: "Suroviny" },
  ];

  const contentImgs = normalizeImages((content as Record<string, unknown>).images);
  const pool = images.length > 0 ? images : contentImgs.length > 0 ? contentImgs : FALLBACK_IMGS;
  const displayed = pool.slice(0, 8);

  return (
    <section id={id} data-variant="restaurant-03-gallery" style={{ backgroundColor: BG, padding: "96px 0", fontFamily: SANS }}>
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 clamp(20px, 4vw, 48px)" }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <p style={{ fontFamily: SANS, fontSize: 11, fontWeight: 600, letterSpacing: "0.22em", textTransform: "uppercase", color: GOLD, margin: "0 0 12px" }}>
            <GenericEditableText sectionId={sectionId} field="tagline" value={tagline} tag="span" />
          </p>
          <h2 style={{ fontFamily: FONT, fontSize: "clamp(28px, 3.5vw, 44px)", fontWeight: 400, color: WHITE, margin: 0, lineHeight: 1.2, whiteSpace: "pre-line" }}>
            <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
          </h2>
          <div style={{ width: 40, height: 1, backgroundColor: GOLD, margin: "20px auto 0", opacity: 0.5 }} />
        </div>

        {/* 4-col grid */}
        <div className="r03-gallery-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 6 }}>
          {displayed.map((img, i) => {
            const src = img.fullUrl || img.url || "";
            return (
              <div
                key={i}
                className="r03-gallery-item"
                style={{ position: "relative", overflow: "hidden", aspectRatio: "3/2", cursor: "pointer" }}
              >
                <GenericEditableImage sectionId={sectionId} field={`images.${i}.url`} src={src} alt={img.alt ?? `Fotka ${i + 1}`} style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
                  <img
                    src={src}
                    alt={img.alt ?? `Fotka ${i + 1}`}
                    style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center", display: "block", transition: "transform 0.45s ease" }}
                    loading="lazy"
                  />
                </GenericEditableImage>
                {/* Coral hover overlay */}
                <div className="r03-gallery-overlay" style={{
                  position: "absolute", inset: 0,
                  backgroundColor: `${GOLD}33`,
                  opacity: 0, transition: "opacity 0.3s ease",
                  pointerEvents: "none",
                }} />
              </div>
            );
          })}
        </div>

        {/* CTA */}
        {ctaText && (
          <div style={{ textAlign: "center", marginTop: 40 }}>
            <a
              href={ctaHref}
              data-btn="primary"
              style={{
                fontFamily: SANS, fontSize: 11, fontWeight: 700,
                letterSpacing: "0.14em", textTransform: "uppercase",
                color: GOLD, textDecoration: "none",
                padding: "12px 32px", border: `1px solid ${GOLD}`,
                display: "inline-block", transition: "background-color 0.2s, color 0.2s",
              }}
              onMouseEnter={e => { e.currentTarget.style.backgroundColor = GOLD; e.currentTarget.style.color = WHITE; }}
              onMouseLeave={e => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = GOLD; }}
            >
              <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
            </a>
          </div>
        )}
      </div>
      <style>{`
        .r03-gallery-item:hover img { transform: scale(1.06); }
        .r03-gallery-item:hover .r03-gallery-overlay { opacity: 1; }
        @media(max-width:900px){ .r03-gallery-grid{ grid-template-columns: repeat(2,1fr)!important; } }
        @media(max-width:480px){ .r03-gallery-grid{ grid-template-columns: 1fr!important; } }
      `}</style>
    </section>
  );
}

// ── cafe-03-gallery ────────────────────────────────────────────────────────────
// Ref: cathedral.cz — s-gallery-slider
// Bílé bg, Great Vibes H2 centrovaně, horizontální slider se šipkami
// Fotky aspect 8:5, prev/next navigace zlatá
// ─────────────────────────────────────────────────────────────────────────────
function GalleryCafe03({ content, sectionId, images }: { content: Record<string, unknown>; sectionId: number; images: Array<{ url: string; alt?: string }> }) {
  const GOLD    = "#C69C60";
  const GOLD_DK = "#A07840";
  const SERIF   = "'Great Vibes', cursive";
  const SANS    = "'Open Sans', sans-serif";

  const title = String(content.title ?? "Jak to u nás vypadá");
  const id    = String(content.id    ?? "galerie");

  const defaultImages = [
    { url: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=960&h=600&fit=crop&fm=webp&q=85", alt: "Kavárna" },
    { url: "https://images.unsplash.com/photo-1445116572660-236099ec97a0?w=960&h=600&fit=crop&fm=webp&q=85", alt: "Interiér" },
    { url: "https://images.unsplash.com/photo-1559925393-8be0ec4767c8?w=960&h=600&fit=crop&fm=webp&q=85", alt: "Kavárna detail" },
    { url: "https://images.unsplash.com/photo-1543007630-9710e4a00a20?w=960&h=600&fit=crop&fm=webp&q=85", alt: "Káva" },
    { url: "https://images.unsplash.com/photo-1521017432531-fbd92d768814?w=960&h=600&fit=crop&fm=webp&q=85", alt: "Terasa" },
  ];
  const imgs = images.length > 0 ? images : defaultImages;

  const trackRef = useRef<HTMLDivElement>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(true);

  const ITEM_WIDTH = 520;
  const GAP = 20;
  const STEP = ITEM_WIDTH + GAP;

  const updateArrows = useCallback(() => {
    const t = trackRef.current;
    if (!t) return;
    setCanPrev(t.scrollLeft > 8);
    setCanNext(t.scrollLeft < t.scrollWidth - t.clientWidth - 8);
  }, []);

  useEffect(() => {
    const t = trackRef.current;
    if (!t) return;
    t.addEventListener("scroll", updateArrows, { passive: true });
    updateArrows();
    return () => t.removeEventListener("scroll", updateArrows);
  }, [updateArrows]);

  const scroll = (dir: -1 | 1) => {
    trackRef.current?.scrollBy({ left: dir * STEP * 2, behavior: "smooth" });
  };

  const ArrowBtn = ({ dir }: { dir: -1 | 1 }) => {
    const active = dir === -1 ? canPrev : canNext;
    return (
      <button
        onClick={() => scroll(dir)}
        aria-label={dir === -1 ? "Předchozí" : "Další"}
        style={{ width: 44, height: 44, borderRadius: "50%", border: `1.5px solid ${active ? GOLD : "#ccc"}`, background: "none", cursor: active ? "pointer" : "default", color: active ? GOLD : "#ccc", display: "flex", alignItems: "center", justifyContent: "center", transition: "border-color 0.2s, color 0.2s", flexShrink: 0 }}
        onMouseEnter={e => { if (active) { e.currentTarget.style.backgroundColor = GOLD; e.currentTarget.style.color = "#fff"; } }}
        onMouseLeave={e => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = active ? GOLD : "#ccc"; }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points={dir === -1 ? "15 18 9 12 15 6" : "9 18 15 12 9 6"}/></svg>
      </button>
    );
  };

  return (
    <section id={id} style={{ backgroundColor: "#fff", padding: "clamp(48px, 8vw, 96px) 0", fontFamily: SANS }}>
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 clamp(20px, 5vw, 60px)" }}>
        <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "clamp(24px, 4vw, 48px)", flexWrap: "wrap", gap: 16 }}>
          <GenericEditableText sectionId={sectionId} field="title" value={title} tag="h2">
            <h2 style={{ fontFamily: SERIF, fontSize: "clamp(28px, 4vw, 48px)", fontWeight: 400, color: "#1a1a1a", margin: 0 }}>{title}</h2>
          </GenericEditableText>
          <div style={{ display: "flex", gap: 12 }}>
            <ArrowBtn dir={-1} />
            <ArrowBtn dir={1} />
          </div>
        </header>
      </div>

      {/* Full-width scroll track */}
      <div
        ref={trackRef}
        style={{ display: "flex", gap: GAP, overflowX: "auto", scrollSnapType: "x mandatory", paddingInline: "clamp(20px, 5vw, 60px)", paddingBottom: 8 }}
        className="c3-gallery-track"
      >
        {imgs.map((img, i) => (
          <div key={i} style={{ flexShrink: 0, width: ITEM_WIDTH, scrollSnapAlign: "start" }}>
            <GenericEditableImage sectionId={sectionId} field={`images.${i}.url`} src={img.url} alt={img.alt ?? ""} style={{ display: "block" }}>
              <img src={img.url} alt={img.alt ?? ""} style={{ width: "100%", aspectRatio: "8/5", objectFit: "cover", display: "block" }} loading="lazy" />
            </GenericEditableImage>
          </div>
        ))}
      </div>

      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Great+Vibes&family=Open+Sans:wght@300;400&display=swap" />
      <style>{`        .c3-gallery-track { -ms-overflow-style: none; scrollbar-width: none; }
        .c3-gallery-track::-webkit-scrollbar { display: none; }
      `}</style>
    </section>
  );
}

// ── autoservis-03-gallery ─────────────────────────────────────────────────────
function GalleryAutoservis03({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const SANS = "'Inter', 'Helvetica Neue', sans-serif";
  const ORANGE = "#f97316";
  const [lightbox, setLightbox] = useState<string | null>(null);

  const tagline  = (content.tagline as string)  || "Naše práce";
  const title    = (content.title as string)    || "Výsledky, na které jsme hrdí";
  const subtitle = (content.subtitle as string) || "";
  const items    = (content.items as Array<{ url: string; alt?: string }>) || [];

  return (
    <section
      id={(content.id as string) || "galerie"}
      data-template="autoservis-03-gallery"
      style={{ backgroundColor: "#0a0a0a", padding: "100px 24px" }}
    >
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <span style={{ fontFamily: SANS, fontSize: 13, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: ORANGE }}>
            <GenericEditableText sectionId={sectionId} field="tagline" value={tagline} tag="span" />
          </span>
          <h2 style={{ fontFamily: SANS, fontSize: "clamp(26px,3.2vw,40px)", fontWeight: 900, color: "#fff", margin: "12px 0 0", lineHeight: 1.2, whiteSpace: "pre-line" }}>
            <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
          </h2>
          {subtitle && <p style={{ fontFamily: SANS, fontSize: 15, color: "#9ca3af", margin: "12px 0 0" }}>{subtitle}</p>}
        </div>

        {/* 3-col photo grid */}
        <style>{`
          .a03-gallery-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
          @media (max-width: 768px) { .a03-gallery-grid { grid-template-columns: repeat(2, 1fr); } }
          @media (max-width: 480px) { .a03-gallery-grid { grid-template-columns: 1fr; } }
        `}</style>
        <div className="a03-gallery-grid">
          {items.map((item, i) => (
            <div
              key={i}
              onClick={() => setLightbox(item.url)}
              style={{ aspectRatio: "4/3", borderRadius: 10, overflow: "hidden", cursor: "pointer", position: "relative", backgroundColor: "#111827" }}
              onMouseEnter={e => { (e.currentTarget as HTMLDivElement).querySelector("div")!.style.opacity = "1"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLDivElement).querySelector("div")!.style.opacity = "0"; }}
            >
              <img loading="lazy" src={item.url} alt={item.alt || ""} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", transition: "transform 0.3s" }} />
              <div style={{ position: "absolute", inset: 0, backgroundColor: "rgba(249,115,22,0.15)", display: "flex", alignItems: "center", justifyContent: "center", opacity: 0, transition: "opacity 0.2s" }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                  <line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/>
                </svg>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div
          onClick={() => setLightbox(null)}
          style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.92)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999, cursor: "pointer", padding: 24 }}
        >
          <img loading="lazy" src={lightbox} alt="" style={{ maxWidth: "90vw", maxHeight: "85vh", objectFit: "contain", borderRadius: 8 }} />
          <button onClick={() => setLightbox(null)} style={{ position: "absolute", top: 24, right: 24, background: "none", border: "none", cursor: "pointer", color: "#fff", fontSize: 28, lineHeight: 1 }}>✕</button>
        </div>
      )}
    </section>
  );
}

// ─── Stavba-01 Gallery ────────────────────────────────────────────────────────
function GalleryStavba01({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const ORANGE = "#FF6F0D";
  const DARK   = "#1a1a1a";
  const GRAY   = "#6b6b6b";
  const FONT   = "'Inter', sans-serif";

  interface GalleryItem { title: string; category?: string; image: string; }

  const tagline  = String(content.tagline  ?? "Portfolio");
  const title    = String(content.title    ?? "Naše reference");
  const subtitle = String(content.subtitle ?? "");
  const items    = (content.items as GalleryItem[]) ?? [];

  // collect unique categories for filter tabs
  const categories = ["Vše", ...Array.from(new Set(items.map(it => it.category).filter(Boolean) as string[]))];
  const [activeCategory, setActiveCategory] = useState("Vše");
  const [lightbox, setLightbox] = useState<string | null>(null);

  const filtered = activeCategory === "Vše" ? items : items.filter(it => it.category === activeCategory);

  return (
    <section id={String(content.id ?? "reference")} style={{ backgroundColor: "#f8f7f4", fontFamily: FONT, padding: "clamp(64px,9vw,112px) 0" }} data-template="stavba-01">
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 32px" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: 24, marginBottom: 40 }}>
          <div>
            <p style={{ color: ORANGE, fontSize: "0.78rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", margin: "0 0 12px" }}>
              <GenericEditableText sectionId={sectionId} field="tagline" value={tagline} tag="span" />
            </p>
            <h2 style={{ color: DARK, fontSize: "clamp(26px,3.5vw,44px)", fontWeight: 800, lineHeight: 1.1, letterSpacing: "-0.02em", margin: 0 }}>
              <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
            </h2>
            {subtitle && <p style={{ color: GRAY, fontSize: "0.9rem", margin: "10px 0 0" }}>
              <GenericEditableText sectionId={sectionId} field="subtitle" value={subtitle} tag="span" />
            </p>}
          </div>

          {/* Category filter pills */}
          {categories.length > 1 && (
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {categories.map(cat => (
                <button key={cat} onClick={() => setActiveCategory(cat)}
                  style={{ padding: "8px 18px", borderRadius: 999, border: "1.5px solid", fontFamily: FONT, fontSize: "0.82rem", fontWeight: 600, cursor: "pointer", transition: "all 0.18s",
                    backgroundColor: activeCategory === cat ? ORANGE : "transparent",
                    borderColor: activeCategory === cat ? ORANGE : "#d0d0d0",
                    color: activeCategory === cat ? "#fff" : GRAY }}>
                  {cat}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Uniform 3-col grid — all cards same 4:3 ratio */}
        <div className="stavba-gallery-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 20 }}>
          {filtered.map((item, i) => (
            <div key={`${item.image}-${i}`} onClick={() => setLightbox(item.image)}
              style={{ position: "relative", borderRadius: 12, overflow: "hidden", cursor: "zoom-in", aspectRatio: "4/3", backgroundColor: "#e8e8e8" }}>
              <GenericEditableImage sectionId={sectionId} field={`items.${i}.image`} src={item.image} alt={item.title} className="relative overflow-hidden w-full h-full" style={{ height: "100%" }}>
                <Image src={item.image} alt={item.title} fill className="object-cover" style={{ transition: "transform 0.4s ease" }}
                  sizes="(max-width:768px) 50vw, 33vw" unoptimized={shouldSkipNextImageOptimization(item.image)}
                  onMouseEnter={e => { (e.target as HTMLImageElement).style.transform = "scale(1.06)"; }}
                  onMouseLeave={e => { (e.target as HTMLImageElement).style.transform = "scale(1)"; }} />
              </GenericEditableImage>
              {/* Bottom info bar — always visible */}
              <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "linear-gradient(to top, rgba(0,0,0,0.72) 0%, transparent 100%)", padding: "32px 16px 14px" }}>
                {item.category && (
                  <span style={{ display: "inline-block", backgroundColor: ORANGE, color: "#fff", fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", padding: "2px 8px", borderRadius: 4, marginBottom: 5 }}>
                    <GenericEditableText sectionId={sectionId} field={`items.${i}.category`} value={item.category} tag="span" />
                  </span>
                )}
                <div style={{ color: "#fff", fontSize: "0.875rem", fontWeight: 600, lineHeight: 1.3 }}>
                  <GenericEditableText sectionId={sectionId} field={`items.${i}.title`} value={item.title} tag="span" />
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* Lightbox */}
      {lightbox && (
        <div onClick={() => setLightbox(null)} style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.93)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999, cursor: "zoom-out", padding: 24 }}>
          <img loading="lazy" src={lightbox} alt="" style={{ maxWidth: "90vw", maxHeight: "85vh", objectFit: "contain", borderRadius: 8 }} />
          <button onClick={() => setLightbox(null)} style={{ position: "absolute", top: 20, right: 24, background: "rgba(255,255,255,0.12)", border: "none", cursor: "pointer", color: "#fff", width: 40, height: 40, borderRadius: "50%", fontSize: 20, display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
        </div>
      )}

      <style>{`
        @media (max-width: 900px) { .stavba-gallery-grid { grid-template-columns: repeat(2,1fr) !important; } }
        @media (max-width: 480px) { .stavba-gallery-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </section>
  );
}

// ── elektro-01-gallery ────────────────────────────────────────────────────────
function GalleryElektro01({ content, sectionId, images }: { content: Record<string, unknown>; sectionId: number; images: GalleryImage[] }) {
  const [lightbox, setLightbox] = useState<string | null>(null);

  const RED  = "#dd0808";
  const DARK = "#1b1b1b";
  const FONT = "'Montserrat', sans-serif";

  const title    = String(content.title    ?? "Galerie realizací");
  const kicker   = String(content.kicker   ?? "Moje reference");
  const subtitle = String(content.subtitle ?? "Ukázky dokončených elektroinstalačních prací a hromosvodů");
  const ctaText  = String(content.ctaText  ?? "Více referencí");

  const rawItems = (content.images as Array<{ url?: string; alt?: string; category?: string }>) ?? [];
  const items = rawItems.length ? rawItems : images.map(img => ({ url: img.url ?? "", alt: img.alt ?? "", category: "" }));

  const PLACEHOLDER = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect width='400' height='300' fill='%23e5e5e5'/%3E%3Ctext x='50%25' y='50%25' font-family='sans-serif' font-size='14' fill='%23999' text-anchor='middle' dominant-baseline='middle'%3EFoto%3C/text%3E%3C/svg%3E";

  return (
    <section id="reference" data-template="elektro-01"
      style={{ backgroundColor: "#fff", fontFamily: FONT, padding: "clamp(56px,8vw,96px) 0" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 32px" }}>

        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <span style={{ display: "inline-block", color: RED, fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", marginBottom: 10 }}>
            <GenericEditableText sectionId={sectionId} field="kicker" value={kicker} tag="span" />
          </span>
          <h2 style={{ color: DARK, fontSize: "clamp(24px,3.5vw,40px)", fontWeight: 800, margin: "0 0 14px", lineHeight: 1.15, fontFamily: FONT }}>
            <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
          </h2>
          <p style={{ color: "#6b6b6b", fontSize: "clamp(14px,1.3vw,17px)", maxWidth: 560, margin: "0 auto", lineHeight: 1.6, fontFamily: "'Roboto',sans-serif" }}>
            <GenericEditableText sectionId={sectionId} field="subtitle" value={subtitle} tag="span" />
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 20 }} className="elektro-gallery-grid">
          {items.map((img, i) => {
            const src = img.url || PLACEHOLDER;
            return (
              <div key={i} onClick={() => img.url && setLightbox(img.url)}
                style={{ cursor: img.url ? "zoom-in" : "default", position: "relative", overflow: "hidden", aspectRatio: "4/3", backgroundColor: "#f0f0f0" }}>
                <GenericEditableImage sectionId={sectionId} field={`images.${i}.url`} src={src} alt={img.alt ?? `Realizace ${i + 1}`} style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
                  <Image src={src} alt={img.alt ?? `Realizace ${i + 1}`} fill className="object-cover"
                    sizes="(max-width:768px)100vw,(max-width:1100px)50vw,33vw"
                    unoptimized={shouldSkipNextImageOptimization(src)} />
                </GenericEditableImage>
                <div className="elektro-gal-overlay" style={{ position: "absolute", inset: 0, backgroundColor: "rgba(221,8,8,0)", transition: "background-color 0.3s", pointerEvents: "none" }} />
                {(img.category || img.alt) && (
                  <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "linear-gradient(to top,rgba(0,0,0,0.65) 0%,transparent 100%)", padding: "24px 12px 10px" }}>
                    {img.category && <span style={{ display: "block", color: RED, fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 2 }}>
                      <GenericEditableText sectionId={sectionId} field={`images.${i}.category`} value={img.category} tag="span" />
                    </span>}
                    {img.alt && <span style={{ display: "block", color: "#fff", fontSize: "0.8rem", fontWeight: 600 }}>
                      <GenericEditableText sectionId={sectionId} field={`images.${i}.alt`} value={img.alt} tag="span" />
                    </span>}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div style={{ textAlign: "center", marginTop: 48 }}>
          <a href="#kontakt" style={{ display: "inline-flex", alignItems: "center", backgroundColor: RED, color: "#fff", fontFamily: FONT, fontSize: "0.82rem", fontWeight: 700, padding: "14px 36px", borderRadius: 0, textDecoration: "none", textTransform: "uppercase", letterSpacing: "0.1em" }}>
            <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
          </a>
        </div>
      </div>

      {lightbox && (
        <div onClick={() => setLightbox(null)} style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.93)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999, cursor: "zoom-out", padding: 24 }}>
          <img loading="lazy" src={lightbox} alt="" style={{ maxWidth: "90vw", maxHeight: "85vh", objectFit: "contain" }} />
          <button onClick={() => setLightbox(null)} style={{ position: "absolute", top: 20, right: 24, background: "rgba(255,255,255,0.12)", border: "none", cursor: "pointer", color: "#fff", width: 40, height: 40, borderRadius: "50%", fontSize: 20 }}>✕</button>
        </div>
      )}
      <style>{`
        @media (max-width:900px) { .elektro-gallery-grid { grid-template-columns: repeat(2,1fr) !important; } }
        @media (max-width:520px)  { .elektro-gallery-grid { grid-template-columns: 1fr !important; } }
        .elektro-gallery-grid > div:hover .elektro-gal-overlay { background-color: rgba(221,8,8,0.18) !important; }
      `}</style>
    </section>
  );
}

// ── stavba-02-gallery ─────────────────────────────────────────────────────────
// Cream bg, centered header, asymmetric 2+2 masonry grid, brown hover overlay
// CTA "Zobrazit fotogalerii" centered below
function GalleryStavba02({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const BROWN = "#674832";
  const CREAM = "#F8F5F0";
  const DARK  = "#2D1A0F";
  const MUTED = "#7A6454";
  const FONT  = "'Roboto', sans-serif";

  const title    = String(content.title    ?? "Ukázky našich realizací");
  const subtitle = String(content.subtitle ?? "Podívejte se na výběr z našich dokončených projektů.");
  const ctaText  = String(content.ctaText  ?? "Zobrazit fotogalerii");
  const ctaHref  = String(content.ctaHref  ?? "/fotogalerie");
  const sectionId2 = String(content.id ?? "fotogalerie");

  type GImg = { url: string; alt?: string };
  const defaultImages: GImg[] = [
    { url: "https://images.unsplash.com/photo-1556912172-45b7abe8b7e1?w=800&h=600&fit=crop&fm=webp&q=85", alt: "Rekonstrukce bytu — obývací pokoj" },
    { url: "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&h=600&fit=crop&fm=webp&q=85", alt: "Rekonstrukce kuchyně" },
    { url: "https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=800&h=600&fit=crop&fm=webp&q=85", alt: "Moderní koupelna po rekonstrukci" },
    { url: "https://images.unsplash.com/photo-1502005229762-cf1b2da7c5d6?w=800&h=600&fit=crop&fm=webp&q=85", alt: "Rekonstrukce rodinného domu" },
  ];
  const rawImgs = ((content.images as Array<Record<string, unknown>>) ?? [])
    .filter(img => img?.url)
    .map(img => ({ url: String(img.url), alt: img.alt ? String(img.alt) : undefined }));
  const images: GImg[] = rawImgs.length >= 2 ? rawImgs : defaultImages;

  // Asymmetric layout: left col = 1 tall image, right col = 3 stacked (or 2+2 grid for 4 images)
  const left  = images.slice(0, 2);   // 2 left images (stacked)
  const right = images.slice(2, 4);   // 2 right images (stacked)

  return (
    <section id={sectionId2} style={{ backgroundColor: CREAM, fontFamily: FONT, padding: "clamp(64px, 8vw, 100px) 0" }} data-template="stavba-02">
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 32px" }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <h2 style={{ color: DARK, fontSize: "clamp(24px, 3.5vw, 40px)", fontWeight: 700, lineHeight: 1.15, letterSpacing: "-0.02em", margin: "0 0 12px" }}>
            <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
          </h2>
          <p style={{ color: MUTED, fontSize: "clamp(14px, 1.4vw, 17px)", lineHeight: 1.65, margin: 0 }}>
            <GenericEditableText sectionId={sectionId} field="subtitle" value={subtitle} tag="span" />
          </p>
        </div>

        {/* Grid — 2 cols × 2 rows, equal cells */}
        <div className="s02-gal-grid">
          {[...left, ...right].map((img, i) => (
            <div
              key={i}
              style={{ position: "relative", borderRadius: 12, overflow: "hidden", aspectRatio: "4/3", backgroundColor: "#ddd" }}
            >
              <GenericEditableImage sectionId={sectionId} field={`images.${i}.url`} src={img.url} alt={img.alt ?? ""} className="relative overflow-hidden w-full h-full" style={{ height: "100%" }}>
                <Image
                  src={img.url}
                  alt={img.alt ?? `Realizace ${i + 1}`}
                  fill
                  className="object-cover"
                  sizes="(max-width:768px) 100vw, 50vw"
                  unoptimized={shouldSkipNextImageOptimization(img.url)}
                />
              </GenericEditableImage>
              {/* Brown hover overlay */}
              <div
                className="s02-gal-overlay"
                style={{ position: "absolute", inset: 0, backgroundColor: "rgba(103,72,50,0)", transition: "background-color 0.25s ease" }}
                onMouseEnter={e => { e.currentTarget.style.backgroundColor = "rgba(103,72,50,0.22)"; }}
                onMouseLeave={e => { e.currentTarget.style.backgroundColor = "rgba(103,72,50,0)"; }}
              />
            </div>
          ))}
        </div>

        {/* CTA */}
        <div style={{ textAlign: "center", marginTop: 40 }}>
          <a
            href={ctaHref}
            data-btn="primary"
            style={{ display: "inline-flex", alignItems: "center", gap: 8, backgroundColor: BROWN, color: "#fff", fontFamily: FONT, fontSize: "0.9rem", fontWeight: 600, padding: "13px 32px", borderRadius: 6, textDecoration: "none", transition: "opacity 0.18s" }}
            onMouseEnter={e => { e.currentTarget.style.opacity = "0.88"; }}
            onMouseLeave={e => { e.currentTarget.style.opacity = "1"; }}
          >
            <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </a>
        </div>
      </div>

      <style>{`
        .s02-gal-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; }
        @media (max-width: 600px) { .s02-gal-grid { grid-template-columns: 1fr; } }
      `}</style>
    </section>
  );
}

// ── stavba-03-gallery ─────────────────────────────────────────────────────────
// světle-šedé #f4f4f4 bg, oranžový kicker + tmavý H2, 3-col grid karet
// Karta: foto aspect-4/3 + hover orange overlay + kategorie tag + nadpis projektu
// Dole: CTA "Všechny projekty"
// ─────────────────────────────────────────────────────────────────────────────
function GalleryStavba03({ content, sectionId, tenantSlug, isAdmin }: { content: Record<string, unknown>; sectionId: number; tenantSlug?: string; isAdmin?: boolean }) {
  const ORANGE = "#fa7d19";
  const DARK   = "#1b1a1a";
  const GRAY   = "#666666";
  const FONT   = "'Roboto', sans-serif";

  const kicker   = String(content.kicker   ?? "Reference");
  const heading  = String(content.heading  ?? "Seznamte se s naší prací");
  const subtitle = String(content.subtitle ?? "Realizované projekty v Praze a okolí");
  const ctaText  = String(content.ctaText  ?? "Všechny projekty");
  const ctaHref  = String(content.ctaHref  ?? "/reference");

  type GalleryItem = { src?: string; category?: string; title?: string };
  const rawImages = (content.images as GalleryItem[]) ?? [];

  const defaultImages: GalleryItem[] = [
    { src: "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&h=600&fit=crop&fm=webp&q=80", category: "Rekonstrukce bytů",   title: "Kompletní rekonstrukce 3+kk Praha 5" },
    { src: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=800&h=600&fit=crop&fm=webp&q=80", category: "Stavby domů",          title: "Rodinný dům Praha-západ" },
    { src: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=600&fit=crop&fm=webp&q=80", category: "Koupelny",              title: "Rekonstrukce koupelny v Praze 10" },
    { src: "https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800&h=600&fit=crop&fm=webp&q=80", category: "Ploty a terasy",    title: "Stavba plotu a terasy Říčany" },
    { src: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop&fm=webp&q=80", category: "Obklady a dlažby",     title: "Pokládka dlažby komerční prostory" },
    { src: "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=800&h=600&fit=crop&fm=webp&q=80", category: "Rekonstrukce objektů", title: "Rekonstrukce restaurace Praha 1" },
  ];

  const images = rawImages.map((img, i) => ({
    src: img.src || defaultImages[i]?.src || defaultImages[0].src,
    category: img.category || defaultImages[i]?.category || "",
    title: img.title || defaultImages[i]?.title || `Projekt ${i + 1}`,
  }));

  const resolve = (href: string) => {
    if (!tenantSlug || !href.startsWith("/")) return href;
    const base = isAdmin ? `/demo/${tenantSlug}/admin` : `/demo/${tenantSlug}`;
    return base + href;
  };

  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <section style={{ backgroundColor: "#f4f4f4", fontFamily: FONT, padding: "80px 0" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 32px" }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <div style={{ color: ORANGE, fontSize: "0.75rem", fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", marginBottom: 12 }}>
            <GenericEditableText sectionId={sectionId} field="kicker" value={kicker} tag="span" />
          </div>
          <h2 style={{ color: DARK, fontFamily: FONT, fontWeight: 700, fontSize: "clamp(1.5rem, 2.5vw, 2rem)", lineHeight: 1.25, margin: "0 0 10px" }}>
            <GenericEditableText sectionId={sectionId} field="heading" value={heading} tag="span" />
          </h2>
          <p style={{ color: GRAY, fontSize: "0.95rem", margin: 0 }}>
            <GenericEditableText sectionId={sectionId} field="subtitle" value={subtitle} tag="span" />
          </p>
        </div>

        {/* Grid */}
        <div className="stavba03-gal-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
          {images.map((img, i) => (
            <div
              key={i}
              style={{ position: "relative", aspectRatio: "4/3", overflow: "hidden", borderRadius: 2, cursor: "pointer" }}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
            >
              <GenericEditableImage sectionId={sectionId} field={`images.${i}.src`} src={img.src!} alt={img.title} className="relative overflow-hidden w-full h-full" style={{ position: "absolute", inset: 0 }}>
                <Image
                  src={img.src!}
                  alt={img.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 33vw"
                  unoptimized={shouldSkipNextImageOptimization(img.src!)}
                  style={{ transition: "transform 0.45s ease" }}
                />
              </GenericEditableImage>
              {/* Hover overlay */}
              <div style={{
                position: "absolute", inset: 0, zIndex: 1,
                backgroundColor: "rgba(250,125,25,0.82)",
                opacity: hovered === i ? 1 : 0,
                transition: "opacity 0.3s ease",
                display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24, textAlign: "center",
              }}>
                <div style={{ color: "#fff", fontSize: "0.7rem", fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", marginBottom: 10, opacity: 0.9 }}>
                  <GenericEditableText sectionId={sectionId} field={`images.${i}.category`} value={img.category} tag="span" />
                </div>
                <div style={{ color: "#fff", fontSize: "1rem", fontWeight: 700, lineHeight: 1.3 }}>
                  <GenericEditableText sectionId={sectionId} field={`images.${i}.title`} value={img.title} tag="span" />
                </div>
              </div>

              {/* Category tag — always visible */}
              <div style={{
                position: "absolute", bottom: 12, left: 12, zIndex: 2,
                backgroundColor: "rgba(0,0,0,0.55)", color: "#fff",
                fontSize: "0.7rem", fontWeight: 600, letterSpacing: "0.5px",
                padding: "4px 10px", borderRadius: 2,
                opacity: hovered === i ? 0 : 1,
                transition: "opacity 0.3s ease",
              }}>
                <GenericEditableText sectionId={sectionId} field={`images.${i}.category`} value={img.category} tag="span" />
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div style={{ textAlign: "center", marginTop: 44 }}>
          <a
            href={resolve(ctaHref)}
            data-btn="primary"
            style={{ display: "inline-flex", alignItems: "center", gap: 8, backgroundColor: ORANGE, color: "#fff", fontFamily: FONT, fontSize: "0.9rem", fontWeight: 700, padding: "14px 32px", textDecoration: "none", borderRadius: 2, letterSpacing: "0.3px", transition: "opacity 0.18s" }}
            onMouseEnter={e => { e.currentTarget.style.opacity = "0.88"; }}
            onMouseLeave={e => { e.currentTarget.style.opacity = "1"; }}
          >
            <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </a>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) { .stavba03-gal-grid { grid-template-columns: repeat(2, 1fr) !important; } }
        @media (max-width: 560px) { .stavba03-gal-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </section>
  );
}

// ── florist-01-collections ───────────────────────────────────────────────────
// 1:1 freja.cz collection list: 5-col grid, square cards, zoom hover, left title
function GalleryFlorist01Collections({ content, sectionId, tenantSlug, isAdmin }: { content: Record<string, unknown>; sectionId: number; tenantSlug?: string; isAdmin: boolean }) {
  const ARIMO = "Arimo, Arial, sans-serif";
  const FG = "#1c1f28";

  interface CollItem { name?: string; href?: string; image?: string; }
  const title = String(content.title ?? "Naše kolekce");
  const items = (content.items as CollItem[]) ?? [];

  const resolveHref = (href: string) => {
    if (!href || href.startsWith("#")) return href ?? "#";
    if (isAdmin) return `/demo/${tenantSlug}/admin`;
    return href;
  };

  return (
    <section style={{ background: "#ffffff", fontFamily: ARIMO }}>
      <style>{`
        .f01-coll-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 16px; }
        .f01-coll-img { overflow: hidden; aspect-ratio: 1; }
        .f01-coll-img img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.4s ease; display: block; }
        .f01-coll-card:hover .f01-coll-img img { transform: scale(1.06); }
        @media (max-width: 749px) { .f01-coll-grid { grid-template-columns: repeat(2, 1fr); gap: 12px; } }
      `}</style>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "36px 3rem 18px" }}>
        {title && (
          <h2 style={{ fontSize: 22, fontWeight: 600, color: FG, margin: "0 0 24px", letterSpacing: "-0.01em" }}>
            <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
          </h2>
        )}
        <ul className="f01-coll-grid" style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {items.map((item, i) => (
            <li key={i} className="f01-coll-card">
              <a href={resolveHref(item.href ?? "#")} style={{ textDecoration: "none", display: "block" }}>
                <div className="f01-coll-img">
                  {item.image && (
                    <GenericEditableImage sectionId={sectionId} field={`items.${i}.image`} src={item.image} alt={item.name ?? ""} style={{ display: "block", width: "100%", height: "100%" }}>
                      <img
                        src={item.image}
                        alt={item.name ?? ""}
                        loading={i < 3 ? "eager" : "lazy"}
                        style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                      />
                    </GenericEditableImage>
                  )}
                </div>
                <div style={{ paddingTop: 10 }}>
                  <span style={{ fontSize: 14, fontWeight: 600, color: FG, lineHeight: 1.3 }}>
                    <GenericEditableText sectionId={sectionId} field={`items.${i}.name`} value={item.name ?? ""} tag="span" />
                  </span>
                </div>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

// ── catering-01-gallery ───────────────────────────────────────────────────────
// Dark teal bg, asymmetric CSS grid: large first image + 5 tiles
// ─────────────────────────────────────────────────────────────────────────────
function GalleryCatering01({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const TEAL  = "#1c373a";
  const CREAM = "#fefff1";
  const GOLD  = "#baae8c";
  const SANS  = "'Source Sans 3', 'Source Sans Pro', sans-serif";
  const SERIF = "'Libre Baskerville', Georgia, serif";

  interface GalleryImage { url: string; alt?: string }
  const heading = String(content.heading ?? "Naše práce");
  const images  = (content.images as GalleryImage[]) ?? [];

  return (
    <section
      id="galerie"
      data-template="catering-01"
      data-variant="catering-01-gallery"
      style={{ background: TEAL, overflow: "hidden" }}
    >
      <style>{`
        .c01gl-wrap{
          max-width:calc(100% - 3.2rem);margin:0 auto;
          padding:4.5rem 0 5rem;
        }
        .c01gl-top{
          display:flex;align-items:flex-end;justify-content:space-between;
          margin-bottom:2.8rem;
          padding-bottom:1.8rem;
          border-bottom:.06rem solid rgba(186,174,140,.2);
        }
        .c01gl-h{
          font-family:${SERIF};font-style:italic;font-weight:300;
          font-size:clamp(2rem,4.5vw,4.4rem);line-height:1.08;
          text-transform:uppercase;color:${CREAM};margin:0;
        }
        .c01gl-kicker{
          font-family:${SANS};font-size:.68rem;font-weight:700;
          letter-spacing:.55rem;text-transform:uppercase;
          color:${GOLD};margin:0 0 .8rem;
        }

        /* grid — mobile: 2 cols uniform */
        .c01gl-grid{
          display:grid;
          grid-template-columns:1fr 1fr;
          grid-auto-rows:auto;
          gap:.8rem;
        }
        .c01gl-cell{
          overflow:hidden;background:#0d1a1c;
          aspect-ratio:4/3;
        }
        .c01gl-cell img{
          width:100%;height:100%;object-fit:cover;display:block;
          transition:transform .7s ease, filter .4s ease;
          filter:brightness(.88) saturate(.9);
        }
        .c01gl-cell:hover img{
          transform:scale(1.06);
          filter:brightness(1) saturate(1.05);
        }

        /* desktop: asymmetric 3-col grid */
        @media(min-width:900px){
          .c01gl-wrap{max-width:calc(100% - 6.4rem);padding:5.5rem 0 6rem}
          .c01gl-grid{
            grid-template-columns:2fr 1fr 1fr;
            grid-template-rows:repeat(2,28vw);
            gap:1rem;
          }
          .c01gl-cell{aspect-ratio:unset}
          /* first image: spans 2 rows */
          .c01gl-cell:first-child{
            grid-row:1/3;
          }
          /* 3rd image: square accent */
          .c01gl-cell:nth-child(4){
            grid-column:2/3;grid-row:2/3;
          }
        }
        @media(min-width:1400px){
          .c01gl-grid{grid-template-rows:repeat(2,32vw);gap:1.2rem}
        }
      `}</style>

      <div className="c01gl-wrap">
        <div className="c01gl-top">
          <div>
            <p className="c01gl-kicker">realizace</p>
            <h2 className="c01gl-h">
              <GenericEditableText sectionId={sectionId} field="heading" value={heading} tag="span" />
            </h2>
          </div>
        </div>

        <div className="c01gl-grid">
          {images.map((img, i) => (
            <div key={i} className="c01gl-cell">
              <GenericEditableImage sectionId={sectionId} field={`images.${i}.url`} src={img.url} alt={img.alt ?? `Galerie ${i + 1}`}>
                <img
                  src={img.url}
                  alt={img.alt ?? `Galerie ${i + 1}`}
                  loading={i < 2 ? "eager" : "lazy"}
                  style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                />
              </GenericEditableImage>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}


// ── pethotel-01-gallery ───────────────────────────────────────────────────────
// Instagram-style gallery: white bg, Quicksand H2 #712419, 2×2/4-col grid,
// hover zoom + camera icon overlay, lightbox (click), staggered fade-in,
// gradient IG CTA dole.
// ─────────────────────────────────────────────────────────────────────────────
function GalleryPethotel01({
  content,
  sectionId,
  images: imgsProp,
}: {
  content: Record<string, unknown>;
  sectionId: number;
  images: GalleryImage[];
}) {
  const heading         = String(content.heading         ?? "Kdo si hraje, nezlobí");
  const subheading      = String(content.subheading      ?? "");
  const instagramHandle = String(content.instagramHandle ?? "@demo-hotel-psicz");
  const instagramUrl    = String(content.instagramUrl    ?? "https://instagram.com/demo");

  const BROWN = "#712419";
  const CREAM = "#fff5ee";
  const FONT  = "'Quicksand', Arial, sans-serif";

  const shown = imgsProp.length > 0 ? imgsProp.slice(0, 4) : Array(4).fill({ url: "", alt: "" });

  const [lightbox, setLightbox] = useState<number | null>(null);
  const [visible,  setVisible]  = useState<boolean[]>(Array(shown.length).fill(false));
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const observers: IntersectionObserver[] = [];
    cardRefs.current.forEach((el, i) => {
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setTimeout(() => setVisible((v) => { const n = [...v]; n[i] = true; return n; }), i * 110);
            obs.disconnect();
          }
        },
        { threshold: 0.1 }
      );
      obs.observe(el);
      observers.push(obs);
    });
    return () => observers.forEach((o) => o.disconnect());
  }, []);

  useEffect(() => {
    if (lightbox === null) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightbox(null);
      if (e.key === "ArrowLeft")  setLightbox((l) => l === null ? null : (l - 1 + shown.length) % shown.length);
      if (e.key === "ArrowRight") setLightbox((l) => l === null ? null : (l + 1) % shown.length);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [lightbox, shown.length]);

  const IgCameraIcon = () => (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="5" width="20" height="15" rx="3" />
      <circle cx="12" cy="12.5" r="3.5" />
      <path d="M8 5V3.5C8 3.224 8.224 3 8.5 3h7c.276 0 .5.224.5.5V5" />
    </svg>
  );

  const IgLogoIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="2" y="2" width="20" height="20" rx="5" stroke="currentColor" strokeWidth="2" />
      <circle cx="12" cy="12" r="4.5" stroke="currentColor" strokeWidth="2" />
      <circle cx="17.5" cy="6.5" r="1.3" fill="currentColor" />
    </svg>
  );

  return (
    <>
      <style>{`
        .ph01gl { background: #fff; padding: 100px 0 80px; font-family: ${FONT}; }
        .ph01gl-inner { max-width: 1100px; margin: 0 auto; padding: 0 32px; }

        .ph01gl-hdr { text-align: center; margin-bottom: 64px; }
        .ph01gl-h2 { color: ${BROWN}; font-size: clamp(28px,3.5vw,48px); font-weight: 800; margin: 0 0 16px; line-height: 1.15; font-family: ${FONT}; }
        .ph01gl-paw { display: inline-block; margin: 0 10px; opacity: 0.5; vertical-align: middle; font-style: normal; }
        .ph01gl-sub { color: #a08070; font-size: clamp(14px,1.5vw,18px); font-weight: 500; margin: 0; }

        .ph01gl-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; }
        @media (min-width: 700px) { .ph01gl-grid { grid-template-columns: repeat(4, 1fr); gap: 14px; } }

        .ph01gl-card {
          position: relative; aspect-ratio: 1/1; overflow: hidden;
          border-radius: 6px; cursor: pointer; background: ${CREAM};
          opacity: 0; transform: translateY(20px) scale(0.97);
          transition: opacity 0.55s ease, transform 0.55s ease, box-shadow 0.35s ease;
        }
        .ph01gl-card.ph01gl-vis { opacity: 1; transform: translateY(0) scale(1); }
        .ph01gl-card:hover { box-shadow: 0 12px 36px rgba(113,36,25,0.22); }
        .ph01gl-card img { width: 100%; height: 100%; object-fit: cover; display: block; transition: transform 0.5s cubic-bezier(.4,0,.2,1); }
        .ph01gl-card:hover img { transform: scale(1.09); }
        .ph01gl-ov {
          position: absolute; inset: 0;
          background: rgba(113,36,25,0.48);
          display: flex; align-items: center; justify-content: center;
          opacity: 0; transition: opacity 0.3s ease;
        }
        .ph01gl-card:hover .ph01gl-ov { opacity: 1; }

        .ph01gl-cta-wrap { display: flex; justify-content: center; margin-top: 52px; }
        .ph01gl-cta {
          display: inline-flex; align-items: center; gap: 10px;
          padding: 15px 38px; border-radius: 50px;
          background: linear-gradient(135deg,#f09433 0%,#e6683c 25%,#dc2743 50%,#cc2366 75%,#bc1888 100%);
          color: #fff; font-family: ${FONT}; font-size: 15px; font-weight: 700;
          text-decoration: none; letter-spacing: 0.03em;
          box-shadow: 0 4px 22px rgba(214,18,61,0.38);
          transition: box-shadow 0.3s ease, transform 0.2s ease;
        }
        .ph01gl-cta:hover { box-shadow: 0 8px 32px rgba(214,18,61,0.55); transform: translateY(-2px); }

        .ph01lb {
          position: fixed; inset: 0; z-index: 9999;
          background: rgba(0,0,0,0.93); backdrop-filter: blur(8px);
          display: flex; align-items: center; justify-content: center;
          animation: ph01lb-in 0.2s ease;
        }
        @keyframes ph01lb-in { from { opacity:0 } to { opacity:1 } }
        .ph01lb-img { max-width: 90vw; max-height: 86vh; object-fit: contain; border-radius: 4px; box-shadow: 0 24px 80px rgba(0,0,0,0.7); }
        .ph01lb-close {
          position: absolute; top: 18px; right: 26px;
          background: none; border: 2px solid rgba(255,255,255,0.3); color: #fff;
          width: 44px; height: 44px; border-radius: 50%; font-size: 24px;
          cursor: pointer; display: flex; align-items: center; justify-content: center;
          transition: border-color 0.2s, background 0.2s;
        }
        .ph01lb-close:hover { background: rgba(255,255,255,0.15); border-color: #fff; }
        .ph01lb-arrow {
          position: absolute; top: 50%; transform: translateY(-50%);
          background: rgba(255,255,255,0.1); border: 2px solid rgba(255,255,255,0.25);
          color: #fff; width: 52px; height: 52px; border-radius: 50%; font-size: 26px;
          cursor: pointer; display: flex; align-items: center; justify-content: center;
          transition: background 0.2s, border-color 0.2s;
        }
        .ph01lb-arrow:hover { background: rgba(255,255,255,0.25); border-color: #fff; }
        .ph01lb-prev { left: 20px; }
        .ph01lb-next { right: 20px; }
        .ph01lb-counter { position: absolute; bottom: 18px; left: 50%; transform: translateX(-50%); color: rgba(255,255,255,0.55); font-family: ${FONT}; font-size: 13px; font-weight: 600; }
      `}</style>

      <section className="ph01gl" data-template="pethotel-01-gallery">
        <div className="ph01gl-inner">

          <div className="ph01gl-hdr">
            <h2 className="ph01gl-h2">
              <em className="ph01gl-paw" aria-hidden="true">🐾</em>
              <GenericEditableText sectionId={sectionId} field="heading" value={heading} tag="span" />
              <em className="ph01gl-paw" aria-hidden="true">🐾</em>
            </h2>
            {subheading && (
              <p className="ph01gl-sub">
                <GenericEditableText sectionId={sectionId} field="subheading" value={subheading} tag="span" />
              </p>
            )}
          </div>

          <div className="ph01gl-grid">
            {shown.map((img, i) => (
              <div
                key={i}
                ref={(el) => { cardRefs.current[i] = el; }}
                className={`ph01gl-card${visible[i] ? " ph01gl-vis" : ""}`}
                onClick={() => { if (img.url) setLightbox(i); }}
                role={img.url ? "button" : undefined}
                tabIndex={img.url ? 0 : undefined}
                aria-label={img.alt ?? `Foto ${i + 1}`}
              >
                {img.url ? (
                  <GenericEditableImage sectionId={sectionId} field={`images.${i}.url`} src={img.url} alt={img.alt ?? `Foto ${i + 1}`}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img.url} alt={img.alt ?? `Foto ${i + 1}`} loading={i < 2 ? "eager" : "lazy"} />
                  </GenericEditableImage>
                ) : (
                  <div style={{ width: "100%", height: "100%", background: "#eedec3" }} />
                )}
                <div className="ph01gl-ov" aria-hidden="true"><IgCameraIcon /></div>
              </div>
            ))}
          </div>

          <div className="ph01gl-cta-wrap">
            <a href={instagramUrl} target="_blank" rel="noopener noreferrer" className="ph01gl-cta">
              <IgLogoIcon />
              {instagramHandle}
            </a>
          </div>

        </div>
      </section>

      {lightbox !== null && shown[lightbox]?.url && (
        <div className="ph01lb" onClick={() => setLightbox(null)} role="dialog" aria-modal="true" aria-label="Lightbox">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img loading="lazy" src={shown[lightbox].url} alt={shown[lightbox].alt ?? ""} className="ph01lb-img" onClick={(e) => e.stopPropagation()} />
          <button className="ph01lb-close" onClick={() => setLightbox(null)} aria-label="Zavřít">×</button>
          {shown.length > 1 && (
            <>
              <button
                className="ph01lb-arrow ph01lb-prev"
                onClick={(e) => { e.stopPropagation(); setLightbox((l) => l === null ? null : (l - 1 + shown.length) % shown.length); }}
                aria-label="Předchozí"
              >‹</button>
              <button
                className="ph01lb-arrow ph01lb-next"
                onClick={(e) => { e.stopPropagation(); setLightbox((l) => l === null ? null : (l + 1) % shown.length); }}
                aria-label="Další"
              >›</button>
            </>
          )}
          <div className="ph01lb-counter">{lightbox + 1} / {shown.length}</div>
        </div>
      )}
    </>
  );
}

// ── grooming-01-gallery ───────────────────────────────────────────────────────
// Premium dark photo wall:
// - Tmavé bg #101417, heading bílý nahoře
// - CSS masonry-style 3-col grid, každá fotka jiná výška (střídáme 3 výšky)
// - Hover: zoom + overlay s jménem + plemenem + zlatou čarou
// ─────────────────────────────────────────────────────────────────────────────
function GalleryGrooming01({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const GOLD  = "#d0aa57";
  const WHITE = "#ffffff";
  const DARK  = "#101417";
  const FONT  = "'Hanken Grotesk', 'Inter', sans-serif";

  type GItem = { name?: string; breed?: string; imageUrl?: string };
  const items   = (content.items as GItem[]) ?? [];
  const heading = String(content.heading ?? "Naše výsledky");
  const kicker  = String(content.kicker  ?? "změna je život");

  return (
    <section id="galerie" data-template="grooming-01-gallery" style={{ background: DARK, fontFamily: FONT }}>
      <style>{`
        .gr01gl-head{padding:80px 40px 56px;text-align:center;}
        .gr01gl-kicker{font-size:12px;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:${GOLD};margin:0 0 12px;}
        .gr01gl-h2{font-size:clamp(30px,4vw,52px);font-weight:700;color:${WHITE};margin:0;}
        .gr01gl-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;padding:0 6px 6px;}
        .gr01gl-item{position:relative;overflow:hidden;cursor:pointer;background:#1a1f22;aspect-ratio:1/1;}
        .gr01gl-photo{width:100%;height:100%;background-size:cover;background-position:center top;transition:transform 0.6s cubic-bezier(.25,.46,.45,.94);}
        .gr01gl-item:hover .gr01gl-photo{transform:scale(1.07);}
        .gr01gl-overlay{position:absolute;inset:0;background:linear-gradient(to top,rgba(16,20,23,0.88) 0%,transparent 55%);opacity:0;transition:opacity 0.35s;}
        .gr01gl-item:hover .gr01gl-overlay{opacity:1;}
        .gr01gl-info{position:absolute;bottom:0;left:0;right:0;padding:24px 20px;transform:translateY(12px);transition:transform 0.35s cubic-bezier(.25,.46,.45,.94),opacity 0.35s;opacity:0;}
        .gr01gl-item:hover .gr01gl-info{transform:translateY(0);opacity:1;}
        .gr01gl-gold-bar{width:28px;height:2px;background:${GOLD};margin-bottom:8px;}
        .gr01gl-name{font-size:18px;font-weight:700;color:${WHITE};margin:0 0 3px;line-height:1.1;}
        .gr01gl-breed{font-size:12px;color:rgba(255,255,255,0.65);font-weight:500;letter-spacing:0.5px;}
        @media(max-width:900px){.gr01gl-grid{grid-template-columns:repeat(2,1fr);}}
        @media(max-width:560px){
          .gr01gl-grid{grid-template-columns:repeat(2,1fr);}
          .gr01gl-head{padding:56px 24px 40px;}
          .gr01gl-overlay{opacity:1;}
          .gr01gl-info{transform:translateY(0);opacity:1;}
        }
      `}</style>

      <div className="gr01gl-head">
        <p className="gr01gl-kicker">
          <GenericEditableText sectionId={sectionId} field="kicker" value={kicker} tag="span" />
        </p>
        <h2 className="gr01gl-h2">
          <GenericEditableText sectionId={sectionId} field="heading" value={heading} tag="span" />
        </h2>
      </div>

      <div className="gr01gl-grid">
        {items.map((item, i) => (
          <div
            key={i}
            className="gr01gl-item"
          >
            <GenericEditableImage
              sectionId={sectionId}
              field={`items.${i}.imageUrl`}
              src={item.imageUrl ?? ""}
              style={{ width: "100%", height: "100%", position: "absolute", inset: 0 }}
            >
              <div
                className="gr01gl-photo"
                style={{ backgroundImage: item.imageUrl ? `url(${item.imageUrl})` : undefined }}
                role="img"
                aria-label={`${item.name ?? ""} — ${item.breed ?? ""}`}
              />
            </GenericEditableImage>
            <div className="gr01gl-overlay" aria-hidden="true" />
            <div className="gr01gl-info">
              <div className="gr01gl-gold-bar" />
              <p className="gr01gl-name">
                <GenericEditableText sectionId={sectionId} field={`items.${i}.name`} value={item.name ?? ""} tag="span" />
              </p>
              <p className="gr01gl-breed">
                <GenericEditableText sectionId={sectionId} field={`items.${i}.breed`} value={item.breed ?? ""} tag="span" />
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ── arch-01-projects ──────────────────────────────────────────────────────────
// 1:1 karesarch.cz realizace sekce:
// - černé pozadí, 3-sloupcový grid karet
// - každá karta: bg-image, tmavý overlay, čtvercový play icon uprostřed
// - nadpis sekce "Realizace" bílý nahoře
// - CTA "Všechny realizace" dole
// ─────────────────────────────────────────────────────────────────────────────
function GalleryArch01Projects({ content, sectionId, tenantSlug, isAdmin }: { content: Record<string, unknown>; sectionId: number; tenantSlug?: string; isAdmin?: boolean }) {
  type Item = { title?: string; category?: string; imageUrl?: string; href?: string };
  const items   = (content.items as Item[]) ?? [];
  const heading = String(content.heading ?? "Realizace");
  const ctaText = String(content.ctaText ?? "Všechny realizace");
  const ctaHref = String(content.ctaHref ?? "/realizace");

  const FONT  = "'Helvetica Neue', Helvetica, Arial, sans-serif";
  const WHITE = "#ffffff";

  const VISIBLE = 3;
  const [idx, setIdx] = useState(0);
  const maxIdx = Math.max(0, items.length - VISIBLE);

  useEffect(() => {
    if (items.length <= VISIBLE) return;
    const t = setInterval(() => setIdx(i => (i >= maxIdx ? 0 : i + 1)), 5000);
    return () => clearInterval(t);
  }, [maxIdx, items.length]);

  const prev = () => setIdx(i => (i <= 0 ? maxIdx : i - 1));
  const next = () => setIdx(i => (i >= maxIdx ? 0 : i + 1));

  const resolvedCta = tenantSlug
    ? `/${["demo", tenantSlug, ctaHref.replace(/^\//, "")].filter(Boolean).join("/")}`
    : ctaHref;

  const NewsArrow = ({ size = 30 }: { size?: number }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 12" width={size} height={size * 12 / 30} aria-hidden="true">
      <path fill={WHITE} d="M24,0l6,6l-6,6V7.5H0v-3h24V0z"/>
    </svg>
  );

  const ChevronLeft = () => (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={WHITE} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="15,18 9,12 15,6"/>
    </svg>
  );

  const ChevronRight = () => (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={WHITE} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="9,18 15,12 9,6"/>
    </svg>
  );

  const styles = `
    .a01proj {
      background: #000;
      padding: 80px 0 60px;
      color: ${WHITE};
      overflow: hidden;
    }
    .a01proj-padded {
      padding: 0 3.5rem;
    }
    .a01proj-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 48px;
    }
    .a01proj-heading {
      font-family: ${FONT};
      font-size: clamp(24px, 2.5vw, 34px);
      font-weight: 300;
      letter-spacing: 0.04em;
      color: ${WHITE};
      margin: 0;
      display: flex;
      align-items: center;
      gap: 18px;
    }
    .a01proj-slider-outer {
      position: relative;
    }
    .a01proj-slider-wrap {
      overflow: hidden;
    }
    .a01proj-track {
      display: flex;
      width: 100%;
      transition: transform 0.5s ease;
    }
    .a01proj-slide {
      flex: 0 0 33.3333%;
      min-width: 0;
    }
    .a01proj-card {
      display: block;
      text-decoration: none;
      color: ${WHITE};
      padding: 0 1px;
    }
    .a01proj-img-wrap {
      overflow: hidden;
      aspect-ratio: 3/2;
      background: #111;
    }
    .a01proj-card-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      object-position: 50% 50%;
      display: block;
      transition: transform 0.3s ease-in-out;
    }
    .a01proj-card:hover .a01proj-card-img { transform: scale(1.1); }
    .a01proj-card-body {
      padding: 16px 8px 24px;
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
    }
    .a01proj-card-name {
      font-family: ${FONT};
      font-size: 16px;
      font-weight: 300;
      color: ${WHITE};
      margin: 0 0 5px;
      line-height: 1.4;
    }
    .a01proj-card:hover .a01proj-card-name { text-decoration: underline; }
    .a01proj-card-cat {
      font-family: ${FONT};
      font-size: 11px;
      font-weight: 400;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: rgba(255,255,255,0.48);
      margin: 0;
    }
    .a01proj-card-arrow {
      opacity: 0;
      transition: opacity 0.3s ease-in-out;
      flex-shrink: 0;
      margin-top: 2px;
      padding-left: 8px;
    }
    .a01proj-card:hover .a01proj-card-arrow { opacity: 1; }
    .a01proj-btn-prev, .a01proj-btn-next {
      position: absolute;
      top: 33%;
      transform: translateY(-50%);
      background: transparent;
      border: none;
      cursor: pointer;
      z-index: 3;
      padding: 16px 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: ${WHITE};
      transition: opacity 0.2s;
    }
    .a01proj-btn-prev { left: 0; }
    .a01proj-btn-next { right: 0; }
    .a01proj-btn-prev:hover, .a01proj-btn-next:hover { opacity: 0.7; }
    .a01proj-cta-wrap {
      text-align: center;
      padding: 48px 24px 0;
    }
    .a01proj-cta {
      display: inline-block;
      padding: 11px 36px;
      border: 1px solid rgba(255,255,255,0.45);
      color: ${WHITE};
      font-family: ${FONT};
      font-size: 12px;
      font-weight: 400;
      letter-spacing: 0.2em;
      text-transform: uppercase;
      text-decoration: none;
      transition: background 0.2s, border-color 0.2s;
    }
    .a01proj-cta:hover { background: rgba(255,255,255,0.08); border-color: ${WHITE}; }
    @media (max-width: 900px) {
      .a01proj-slide { flex: 0 0 50%; }
      .a01proj-padded { padding: 0 2rem; }
    }
    @media (max-width: 540px) {
      .a01proj-slide { flex: 0 0 100%; }
      .a01proj-padded { padding: 0 1rem; }
    }
  `;

  const trackShift = -(idx * (100 / VISIBLE));

  return (
    <>
      <style>{styles}</style>
      <section className="a01proj" data-template="arch-01-projects">
        <div className="a01proj-padded">
          <div className="a01proj-header">
            <h2 className="a01proj-heading">
              <GenericEditableText sectionId={sectionId} field="heading" value={heading} tag="span" />
              <NewsArrow />
            </h2>
          </div>
        </div>
        <div className="a01proj-padded a01proj-slider-outer">
          <div className="a01proj-slider-wrap">
            <div className="a01proj-track" style={{ transform: `translateX(${trackShift}%)` }}>
              {items.map((item, i) => {
                const href = item.href
                  ? (tenantSlug ? `/${["demo", tenantSlug, item.href.replace(/^\//, "")].join("/")}` : item.href)
                  : resolvedCta;
                return (
                  <div key={i} className="a01proj-slide">
                    <a href={href} className="a01proj-card">
                      <div className="a01proj-img-wrap">
                        <GenericEditableImage
                          sectionId={sectionId}
                          field={`items.${i}.imageUrl`}
                          src={item.imageUrl ?? ""}
                          alt={item.title ?? `Projekt ${i + 1}`}
                          style={{ width: "100%", height: "100%", display: "block" }}
                        >
                          <img loading="lazy" src={item.imageUrl} alt={item.title ?? `Projekt ${i + 1}`} className="a01proj-card-img" />
                        </GenericEditableImage>
                      </div>
                      <div className="a01proj-card-body">
                        <div>
                          <p className="a01proj-card-name">
                            <GenericEditableText sectionId={sectionId} field={`items.${i}.title`} value={item.title ?? ""} tag="span" />
                          </p>
                          {item.category && (
                            <p className="a01proj-card-cat">
                              <GenericEditableText sectionId={sectionId} field={`items.${i}.category`} value={item.category} tag="span" />
                            </p>
                          )}
                        </div>
                        <div className="a01proj-card-arrow" aria-hidden="true"><NewsArrow size={24} /></div>
                      </div>
                    </a>
                  </div>
                );
              })}
            </div>
          </div>
          {items.length > VISIBLE && (
            <>
              <button className="a01proj-btn-prev" onClick={prev} aria-label="Předchozí realizace"><ChevronLeft /></button>
              <button className="a01proj-btn-next" onClick={next} aria-label="Další realizace"><ChevronRight /></button>
            </>
          )}
        </div>
        <div className="a01proj-cta-wrap">
          <a href={resolvedCta} className="a01proj-cta">
            <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
          </a>
        </div>
      </section>
    </>
  );
}

// ── arch-01-interiors ─────────────────────────────────────────────────────────
// 1:1 karesarch.cz interiéry sekce:
// - bílé pozadí, 4-sloupcový masonry-style grid
// - nadpis + subheading, CTA
// ─────────────────────────────────────────────────────────────────────────────
function GalleryArch01Interiors({ content, sectionId, tenantSlug, isAdmin }: { content: Record<string, unknown>; sectionId: number; tenantSlug?: string; isAdmin?: boolean }) {
  type Item = { title?: string; category?: string; imageUrl?: string; href?: string };
  const items      = (content.items as Item[]) ?? [];
  const heading    = String(content.heading    ?? "Interiéry");
  const subheading = String(content.subheading ?? "");
  const ctaText    = String(content.ctaText    ?? "Všechny interiéry");
  const ctaHref    = String(content.ctaHref    ?? "/interiery");

  const FONT = "'Helvetica Neue', Helvetica, Arial, sans-serif";

  const resolvedCta = tenantSlug
    ? `/${["demo", tenantSlug, ctaHref.replace(/^\//, "")].join("/")}`
    : ctaHref;

  const styles = `
    .a01int {
      background: #fff;
      padding: 80px 0 60px;
    }
    .a01int-header {
      max-width: 860px;
      margin: 0 auto 48px;
      padding: 0 clamp(24px, 5vw, 80px);
      text-align: center;
    }
    .a01int-heading {
      font-family: ${FONT};
      font-size: clamp(13px, 1.4vw, 16px);
      font-weight: 400;
      letter-spacing: 0.25em;
      text-transform: uppercase;
      color: #111;
      margin: 0 0 20px;
    }
    .a01int-sub {
      font-family: ${FONT};
      font-size: clamp(14px, 1.5vw, 17px);
      font-weight: 300;
      line-height: 1.7;
      color: #555;
      margin: 0;
    }
    .a01int-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 2px;
    }
    .a01int-card {
      position: relative;
      aspect-ratio: 3/4;
      overflow: hidden;
      display: block;
      text-decoration: none;
    }
    .a01int-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      object-position: 50% 50%;
      display: block;
      transition: transform 0.5s ease;
    }
    .a01int-card:hover .a01int-img { transform: scale(1.04); }
    .a01int-overlay {
      position: absolute;
      inset: 0;
      background: linear-gradient(to top, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0) 50%);
      transition: background 0.3s;
    }
    .a01int-card:hover .a01int-overlay { background: linear-gradient(to top, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.1) 50%); }
    .a01int-label {
      position: absolute;
      bottom: 16px; left: 0; right: 0;
      text-align: center;
      font-family: ${FONT};
      font-size: 12px;
      font-weight: 400;
      letter-spacing: 0.15em;
      text-transform: uppercase;
      color: #fff;
    }
    .a01int-cta-wrap {
      text-align: center;
      padding: 48px 24px 0;
    }
    .a01int-cta {
      display: inline-block;
      padding: 11px 36px;
      border: 1px solid rgba(0,0,0,0.35);
      color: #111;
      font-family: ${FONT};
      font-size: 12px;
      font-weight: 400;
      letter-spacing: 0.2em;
      text-transform: uppercase;
      text-decoration: none;
      transition: background 0.2s, border-color 0.2s;
    }
    .a01int-cta:hover { background: rgba(0,0,0,0.05); border-color: #111; }
    @media (max-width: 767px) {
      .a01int-grid { grid-template-columns: repeat(2, 1fr); }
    }
    @media (max-width: 480px) {
      .a01int-grid { grid-template-columns: 1fr 1fr; }
    }
  `;

  return (
    <>
      <style>{styles}</style>
      <section className="a01int" data-template="arch-01-interiors">
        <div className="a01int-header">
          <p className="a01int-heading">
            <GenericEditableText sectionId={sectionId} field="heading" value={heading} tag="span" />
          </p>
          {subheading && (
            <p className="a01int-sub">
              <GenericEditableText sectionId={sectionId} field="subheading" value={subheading} tag="span" />
            </p>
          )}
        </div>
        <div className="a01int-grid">
          {items.map((item, i) => (
            <a
              key={i}
              href={item.href
                ? (tenantSlug ? `/${["demo", tenantSlug, item.href.replace(/^\//, "")].join("/")}` : item.href)
                : resolvedCta}
              className="a01int-card"
            >
              <GenericEditableImage
                sectionId={sectionId}
                field={`items.${i}.imageUrl`}
                src={item.imageUrl ?? ""}
                alt={item.title ?? `Interiér ${i + 1}`}
                style={{ width: "100%", height: "100%", display: "block" }}
              >
                <img loading="lazy" src={item.imageUrl} alt={item.title ?? `Interiér ${i + 1}`} className="a01int-img" />
              </GenericEditableImage>
              <div className="a01int-overlay" aria-hidden="true" />
              <div className="a01int-label">
                <GenericEditableText sectionId={sectionId} field={`items.${i}.title`} value={item.title ?? ""} tag="span" />
              </div>
            </a>
          ))}
        </div>
        <div className="a01int-cta-wrap">
          <a href={resolvedCta} className="a01int-cta">
            <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
          </a>
        </div>
      </section>
    </>
  );
}

// ── arch-01-awards ────────────────────────────────────────────────────────────
// 1:1 karesarch.cz ocenění sekce:
// - bílé pozadí, 4-sloupcový grid dlaždic s obrázky
// - nadpis "Ocenění", CTA
// ─────────────────────────────────────────────────────────────────────────────
function GalleryArch01Awards({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  type Item = { title?: string; imageUrl?: string; alt?: string };
  const items   = (content.items as Item[]) ?? [];
  const heading = String(content.heading ?? "Ocenění");

  const FONT = "'Helvetica Neue', Helvetica, Arial, sans-serif";

  const styles = `
    .a01aw {
      background: #fff;
      padding: 80px clamp(24px, 5vw, 80px);
    }
    .a01aw-header {
      text-align: center;
      margin-bottom: 48px;
    }
    .a01aw-heading {
      font-family: ${FONT};
      font-size: clamp(13px, 1.4vw, 16px);
      font-weight: 400;
      letter-spacing: 0.25em;
      text-transform: uppercase;
      color: #111;
      margin: 0;
    }
    .a01aw-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 24px;
      max-width: 960px;
      margin: 0 auto;
    }
    .a01aw-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
    }
    .a01aw-img {
      width: 100%;
      aspect-ratio: 1;
      object-fit: contain;
      display: block;
    }
    .a01aw-title {
      font-family: ${FONT};
      font-size: 11px;
      font-weight: 400;
      letter-spacing: 0.08em;
      color: #555;
      text-align: center;
      line-height: 1.4;
    }
    @media (max-width: 640px) {
      .a01aw-grid { grid-template-columns: repeat(2, 1fr); gap: 16px; }
    }
    @media (max-width: 380px) {
      .a01aw-grid { grid-template-columns: 1fr 1fr; gap: 12px; }
      .a01aw { padding: 60px 16px; }
    }
  `;

  return (
    <>
      <style>{styles}</style>
      <section className="a01aw" data-template="arch-01-awards">
        <div className="a01aw-header">
          <p className="a01aw-heading">
            <GenericEditableText sectionId={sectionId} field="heading" value={heading} tag="span" />
          </p>
        </div>
        <div className="a01aw-grid">
          {items.map((item, i) => (
            <div key={i} className="a01aw-item">
              <GenericEditableImage
                sectionId={sectionId}
                field={`items.${i}.imageUrl`}
                src={item.imageUrl ?? ""}
                alt={item.alt ?? item.title ?? `Ocenění ${i + 1}`}
                style={{ width: "100%", display: "block" }}
              >
                <img loading="lazy" src={item.imageUrl} alt={item.alt ?? item.title ?? `Ocenění ${i + 1}`} className="a01aw-img" />
              </GenericEditableImage>
              <p className="a01aw-title">
                <GenericEditableText sectionId={sectionId} field={`items.${i}.title`} value={item.title ?? ""} tag="span" />
              </p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

// ── clean-01-gallery ──────────────────────────────────────────────────────────
// 3-foto mozaika: tmavé pozadí, eyebrow + nadpis + podtitulek centrovaně,
// 3 fotky vedle sebe (1:1 aspect-ratio), na hover ztmavení + zoom.
// ─────────────────────────────────────────────────────────────────────────────
function GalleryClean01({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const GREEN = "#69be28";
  const DARK  = "#0d1a20";
  const FONT  = "Arial, Helvetica, sans-serif";

  const eyebrow  = String(content.eyebrow  ?? "Reference");
  const title    = String(content.title    ?? "Naše práce");
  const subtitle = String(content.subtitle ?? "Ukázky z realizovaných zakázek.");

  type GImage = { url?: string; alt?: string };
  const images = (content.images as GImage[] | undefined) ?? [];

  const styles = `
    .c01gl-section {
      background: ${DARK};
      font-family: ${FONT};
      padding: 5rem 1.5rem;
    }
    .c01gl-header {
      text-align: center;
      margin-bottom: 3rem;
    }
    .c01gl-eyebrow {
      display: inline-block;
      font-size: 0.78rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.14em;
      color: ${GREEN};
      margin-bottom: 0.75rem;
    }
    .c01gl-title {
      font-size: clamp(1.6rem, 3vw, 2.4rem);
      font-weight: 700;
      color: #ffffff;
      margin: 0 0 0.6rem;
    }
    .c01gl-subtitle {
      font-size: 1rem;
      color: rgba(255,255,255,0.55);
      max-width: 500px;
      margin: 0 auto;
      line-height: 1.6;
    }
    .c01gl-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1rem;
      max-width: 1100px;
      margin: 0 auto;
    }
    @media (max-width: 47.99rem) {
      .c01gl-grid { grid-template-columns: 1fr; }
      .c01gl-item { aspect-ratio: 4 / 3; }
    }
    .c01gl-item {
      position: relative;
      aspect-ratio: 1 / 1;
      overflow: hidden;
      border-radius: 4px;
    }
    .c01gl-item img {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.4s ease;
    }
    .c01gl-item:hover img { transform: scale(1.06); }
    .c01gl-item::after {
      content: "";
      position: absolute;
      inset: 0;
      background: rgba(0,0,0,0);
      transition: background 0.3s;
    }
    .c01gl-item:hover::after { background: rgba(0,0,0,0.25); }
    .c01gl-caption {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      padding: 0.9rem 1rem;
      background: linear-gradient(to top, rgba(0,0,0,0.75), transparent);
      color: #fff;
      font-size: 0.85rem;
      z-index: 1;
      opacity: 0;
      transition: opacity 0.3s;
    }
    .c01gl-item:hover .c01gl-caption { opacity: 1; }
    @media (max-width: 47.99rem) {
      .c01gl-caption { opacity: 1; }
    }
  `;

  return (
    <section id="reference" className="c01gl-section">
      <style>{styles}</style>
      <div className="c01gl-header">
        <span className="c01gl-eyebrow">
          <GenericEditableText sectionId={sectionId} field="eyebrow" value={eyebrow} tag="span" />
        </span>
        <h2 className="c01gl-title">
          <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
        </h2>
        <p className="c01gl-subtitle">
          <GenericEditableText sectionId={sectionId} field="subtitle" value={subtitle} tag="span" />
        </p>
      </div>
      <div className="c01gl-grid">
        {images.map((img, i) => (
          <div key={i} className="c01gl-item">
            <GenericEditableImage sectionId={sectionId} field={`images.${i}.url`} src={String(img.url ?? "")} alt={String(img.alt ?? `Foto ${i + 1}`)} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img loading="lazy" src={String(img.url ?? "")} alt={String(img.alt ?? `Foto ${i + 1}`)} />
            </GenericEditableImage>
            <span className="c01gl-caption">
              <GenericEditableText sectionId={sectionId} field={`images.${i}.alt`} value={String(img.alt ?? "")} tag="span" />
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}


// ─── instala-02 Gallery ──────────────────────────────────────────────────────
function GalleryInstala02({ content, sectionId, tenantSlug, isAdmin }: { content: Record<string, unknown>; sectionId: number; tenantSlug?: string; isAdmin?: boolean }) {
  const c = content as Record<string, unknown>;
  const [lightbox, setLightbox] = useState<number | null>(null);

  const RED    = "#ee4036";
  const DARK   = "#0a0a0a";
  const WHITE  = "#ffffff";
  const FONT_H = "'Montserrat', sans-serif";
  const FONT_B = "'Roboto', sans-serif";

  const kicker   = String(c.kicker   ?? "Naše realizace");
  const title    = String(c.title    ?? "Reference");
  const subtitle = String(c.subtitle ?? "Vybrané dokončené projekty. Každá zakázka je pro nás výzvou k maximální pečlivosti.");
  const images   = (c.images as Array<{ url: string; alt: string; caption: string }>) ?? [];

  const prev = () => setLightbox(l => l === null ? null : l === 0 ? images.length - 1 : l - 1);
  const next = () => setLightbox(l => l === null ? null : l === images.length - 1 ? 0 : l + 1);

  // Grid position classes per index (for up to 8 images)
  const gridClass = ["i2gx-t1","i2gx-t2","i2gx-t3","i2gx-t4","i2gx-t5","i2gx-t6","i2gx-t7","i2gx-t8"];

  return (
    <section
      data-template="instala-02-gallery"
      style={{ backgroundColor: DARK, fontFamily: FONT_B }}
    >
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Montserrat:wght@600;700;800&family=Roboto:wght@400;500&display=swap" />
      <style>{`
        /* ── header ── */
        .i2gx-head   { max-width: 1280px; margin: 0 auto; padding: 88px 48px 56px; }
        .i2gx-kicker { font-family: ${FONT_H}; font-size: 11px; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: ${RED}; margin: 0 0 16px; display: flex; align-items: center; gap: 12px; }
        .i2gx-kicker::before { content: ''; display: inline-block; width: 36px; height: 2px; background: ${RED}; }
        .i2gx-h2     { font-family: ${FONT_H}; font-size: clamp(36px, 5vw, 68px); font-weight: 800; color: ${WHITE}; line-height: 1; margin: 0 0 16px; letter-spacing: -0.02em; }
        .i2gx-h2 span.accent { color: ${RED}; }
        .i2gx-sub    { font-size: 15px; color: #666; max-width: 520px; line-height: 1.65; margin: 0; }

        /* ── grid ── */
        .i2gx-grid   {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          grid-template-rows: 310px 310px 240px;
          gap: 3px;
        }
        /* tile positions */
        .i2gx-t1 { grid-column: 1 / 3; grid-row: 1 / 3; }
        .i2gx-t2 { grid-column: 3;     grid-row: 1; }
        .i2gx-t3 { grid-column: 4;     grid-row: 1; }
        .i2gx-t4 { grid-column: 3;     grid-row: 2; }
        .i2gx-t5 { grid-column: 4;     grid-row: 2; }
        .i2gx-t6 { grid-column: 1;     grid-row: 3; }
        .i2gx-t7 { grid-column: 2;     grid-row: 3; }
        .i2gx-t8 { grid-column: 3 / 5; grid-row: 3; }

        /* tile base */
        .i2gx-tile   { position: relative; overflow: hidden; cursor: zoom-in; }
        .i2gx-tile-img-wrap { position: absolute; inset: 0; transition: transform .6s cubic-bezier(.25,.46,.45,.94); }
        .i2gx-tile:hover .i2gx-tile-img-wrap { transform: scale(1.07); }

        /* overlay */
        .i2gx-ov     { position: absolute; inset: 0; z-index: 1; display: flex; flex-direction: column; justify-content: flex-end; padding: 24px; background: linear-gradient(to top, rgba(0,0,0,0.72) 0%, transparent 55%); opacity: 0; transition: opacity .35s; }
        .i2gx-tile:hover .i2gx-ov { opacity: 1; }

        /* red bottom line */
        .i2gx-tile::after { content: ''; position: absolute; bottom: 0; left: 0; width: 0; height: 3px; background: ${RED}; z-index: 2; transition: width .4s ease; }
        .i2gx-tile:hover::after { width: 100%; }

        .i2gx-cap-label { font-family: ${FONT_H}; font-size: 11px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: ${RED}; margin-bottom: 5px; }
        .i2gx-cap-title { font-family: ${FONT_H}; font-size: 15px; font-weight: 700; color: ${WHITE}; line-height: 1.3; }
        .i2gx-t1 .i2gx-cap-title { font-size: 20px; }

        /* zoom icon */
        .i2gx-zoom   { position: absolute; top: 20px; right: 20px; z-index: 2; width: 36px; height: 36px; background: rgba(255,255,255,0.12); border-radius: 50%; display: flex; align-items: center; justify-content: center; opacity: 0; transform: scale(0.8); transition: opacity .3s, transform .3s; backdrop-filter: blur(4px); }
        .i2gx-tile:hover .i2gx-zoom { opacity: 1; transform: scale(1); }

        /* bottom strip */
        .i2gx-strip  { max-width: 1280px; margin: 0 auto; padding: 32px 48px; display: flex; align-items: center; justify-content: space-between; gap: 20px; flex-wrap: wrap; }
        .i2gx-count  { font-family: ${FONT_H}; font-size: 12px; font-weight: 600; color: #555; letter-spacing: 0.06em; text-transform: uppercase; }
        .i2gx-count strong { color: ${RED}; font-size: 28px; font-weight: 800; display: block; line-height: 1; margin-bottom: 2px; }
        .i2gx-cta    { font-family: ${FONT_H}; font-size: 13px; font-weight: 700; color: ${WHITE}; background: ${RED}; padding: 12px 24px; border-radius: 6px; text-decoration: none; letter-spacing: 0.03em; display: inline-flex; align-items: center; gap: 8px; }
        .i2gx-cta:hover { background: #c42d2d; }

        /* ── lightbox ── */
        .i2gx-lb     { position: fixed; inset: 0; background: rgba(0,0,0,0.96); z-index: 9999; display: flex; align-items: center; justify-content: center; animation: i2gx-fade .25s ease; }
        @keyframes i2gx-fade { from { opacity:0 } to { opacity:1 } }
        .i2gx-lb-inner { display: flex; flex-direction: column; align-items: center; max-width: 92vw; }
        .i2gx-lb-img  { max-width: 88vw; max-height: 80vh; width: auto; height: auto; border-radius: 6px; object-fit: contain; display: block; box-shadow: 0 32px 80px rgba(0,0,0,0.6); }
        .i2gx-lb-meta { margin-top: 20px; text-align: center; }
        .i2gx-lb-cap  { font-family: ${FONT_H}; font-size: 12px; font-weight: 700; color: rgba(255,255,255,0.5); text-transform: uppercase; letter-spacing: 0.08em; }
        .i2gx-lb-counter { font-family: ${FONT_H}; font-size: 12px; color: #444; margin-top: 6px; }
        .i2gx-lb-close { position: fixed; top: 20px; right: 24px; background: rgba(255,255,255,0.08); border: none; color: #fff; cursor: pointer; width: 44px; height: 44px; border-radius: 50%; display: flex; align-items: center; justify-content: center; transition: background .2s; }
        .i2gx-lb-close:hover { background: ${RED}; }
        .i2gx-lb-nav  { position: fixed; top: 50%; transform: translateY(-50%); background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1); color: #fff; cursor: pointer; width: 52px; height: 52px; border-radius: 50%; display: flex; align-items: center; justify-content: center; transition: background .2s, border-color .2s; }
        .i2gx-lb-nav:hover { background: ${RED}; border-color: ${RED}; }
        .i2gx-lb-prev { left: 20px; }
        .i2gx-lb-next { right: 20px; }

        /* ── mobile ── */
        @media (max-width: 900px) {
          .i2gx-head { padding: 56px 20px 36px; }
          .i2gx-grid {
            grid-template-columns: 1fr 1fr;
            grid-template-rows: repeat(4, 200px);
          }
          .i2gx-t1 { grid-column: 1 / 3; grid-row: 1; }
          .i2gx-t2 { grid-column: 1;     grid-row: 2; }
          .i2gx-t3 { grid-column: 2;     grid-row: 2; }
          .i2gx-t4 { grid-column: 1;     grid-row: 3; }
          .i2gx-t5 { grid-column: 2;     grid-row: 3; }
          .i2gx-t6 { grid-column: 1;     grid-row: 4; }
          .i2gx-t7 { grid-column: 2;     grid-row: 4; }
          .i2gx-t8 { display: none; }
          .i2gx-strip { padding: 24px 20px; }
        }
      `}</style>

      {/* Header */}
      <div className="i2gx-head">
        <p className="i2gx-kicker">
          <GenericEditableText sectionId={sectionId} field="kicker" value={kicker} tag="span" />
        </p>
        <h2 className="i2gx-h2">
          <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
          <span className="accent"> —</span>
        </h2>
        <p className="i2gx-sub">
          <GenericEditableText sectionId={sectionId} field="subtitle" value={subtitle} tag="span" />
        </p>
      </div>

      {/* Grid */}
      <div className="i2gx-grid">
        {images.map((img, i) => (
          <div
            key={i}
            className={`i2gx-tile ${gridClass[i] ?? ""}`}
            onClick={() => setLightbox(i)}
            role="button"
            aria-label={`Zobrazit: ${img.caption || img.alt}`}
          >
            <GenericEditableImage
              sectionId={sectionId} field={`images.${i}.url`} src={img.url} alt={img.alt}
              className="i2gx-tile-img-wrap" style={{ position: "absolute", inset: 0 }}
            >
              <Image
                src={img.url} alt={img.alt} fill className="object-cover"
                sizes="(max-width:900px) 50vw, 25vw"
                unoptimized={shouldSkipNextImageOptimization(img.url)}
              />
            </GenericEditableImage>

            {/* Hover overlay */}
            <div className="i2gx-ov">
              {img.caption && (
                <>
                  <div className="i2gx-cap-label">Realizace</div>
                  <div className="i2gx-cap-title">{img.caption}</div>
                </>
              )}
            </div>

            {/* Zoom icon */}
            <div className="i2gx-zoom">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <circle cx="11" cy="11" r="8" stroke="white" strokeWidth="2"/>
                <path d="m21 21-4.35-4.35" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                <path d="M11 8v6M8 11h6" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
              </svg>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom strip */}
      <div className="i2gx-strip">
        <div className="i2gx-count">
          <strong>{images.length}</strong>
          dokončených realizací v galerii
        </div>
        <a href="/kontakt" className="i2gx-cta">
          Chci také takový výsledek
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path d="M5 12h14M12 5l7 7-7 7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </a>
      </div>

      {/* Lightbox */}
      {lightbox !== null && (
        <div className="i2gx-lb" onClick={() => setLightbox(null)}>
          <div className="i2gx-lb-inner" onClick={e => e.stopPropagation()}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img loading="lazy" src={images[lightbox].url} alt={images[lightbox].alt} className="i2gx-lb-img" />
            <div className="i2gx-lb-meta">
              {images[lightbox].caption && (
                <p className="i2gx-lb-cap">{images[lightbox].caption}</p>
              )}
              <p className="i2gx-lb-counter">{lightbox + 1} / {images.length}</p>
            </div>
          </div>

          <button className="i2gx-lb-close" onClick={() => setLightbox(null)} aria-label="Zavřít">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6l12 12" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>

          {images.length > 1 && (
            <>
              <button className="i2gx-lb-nav i2gx-lb-prev" onClick={e => { e.stopPropagation(); prev(); }} aria-label="Předchozí">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M15 18l-6-6 6-6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              <button className="i2gx-lb-nav i2gx-lb-next" onClick={e => { e.stopPropagation(); next(); }} aria-label="Další">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M9 18l6-6-6-6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </>
          )}
        </div>
      )}
    </section>
  );
}

// ── klima-01-gallery ──────────────────────────────────────────────────────────
// 1:1 pragoclima.cz „Naše práce": světlé bg, eyebrow + title na střed,
// 3-sloupcový masonry grid realizačních fotek s tagem, lightbox, CTA dole
// ─────────────────────────────────────────────────────────────────────────────
function GalleryKlima01({ content, sectionId, tenantSlug, isAdmin }: { content: Record<string, unknown>; sectionId: number; tenantSlug?: string; isAdmin?: boolean }) {
  type GImg = { url?: string; alt?: string; tag?: string };
  const eyebrow = String(content.eyebrow ?? "Naše práce");
  const title   = String(content.title   ?? "Prohlédněte si naše vybrané realizace");
  const subtitle= String(content.subtitle ?? "");
  const ctaText = String(content.ctaText ?? "Všechny reference");
  const ctaHref = String(content.ctaHref ?? "/reference");
  const images  = ((content.images as GImg[]) ?? []);

  const [lightbox, setLightbox] = useState<GImg | null>(null);

  const RED  = "#e30016";
  const NAVY = "#182545";
  const FONT = "'Outfit', -apple-system, sans-serif";

  function resolve(href: string) {
    if (!tenantSlug || !href.startsWith("/")) return href;
    const base = `/demo/${tenantSlug}${isAdmin ? "/admin" : ""}`;
    return href === "/" ? base : `${base}${href}`;
  }

  /* Zavření lightboxu Escape */
  useEffect(() => {
    if (!lightbox) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setLightbox(null); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightbox]);

  return (
    <>
    <style>{`
      @media (max-width: 768px) {
        .klima-gallery-grid { grid-template-columns: repeat(2, 1fr) !important; gap: 12px !important; }
      }
      @media (max-width: 480px) {
        .klima-gallery-grid { grid-template-columns: 1fr !important; }
      }
    `}</style>
    <section style={{ backgroundColor: "#f7f7f7", padding: "80px 24px", fontFamily: FONT }} data-template="klima-01">

      {/* Header */}
      <div style={{ textAlign: "center", maxWidth: 640, margin: "0 auto 52px" }}>
        <p style={{ fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.12em", color: RED, margin: "0 0 10px" }}>
          <GenericEditableText sectionId={sectionId} field="eyebrow" value={eyebrow} tag="span" />
        </p>
        <h2 style={{ fontSize: "clamp(1.5rem, 2.4vw, 2.1rem)", fontWeight: 700, color: NAVY, lineHeight: 1.25, margin: "0 0 14px" }}>
          <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
        </h2>
        {subtitle && (
          <p style={{ fontSize: 15, lineHeight: 1.7, color: "#666", margin: 0 }}>
            <GenericEditableText sectionId={sectionId} field="subtitle" value={subtitle} tag="span" />
          </p>
        )}
      </div>

      {/* 3-col grid */}
      <div className="klima-gallery-grid" style={{ maxWidth: 1200, margin: "0 auto 48px", display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
        {images.map((img, i) => {
          const src = img.url ?? "";
          return (
            <GenericEditableImage
              key={i}
              sectionId={sectionId}
              field={`images.${i}.url`}
              src={src}
              alt={img.alt ?? ""}
              style={{ position: "relative", borderRadius: 10, overflow: "hidden", display: "block" }}
            >
            <div
              onClick={() => setLightbox(img)}
              style={{
                position: "relative", borderRadius: 10, overflow: "hidden",
                cursor: "pointer", aspectRatio: "4/3",
                boxShadow: "0 2px 12px rgba(0,0,0,0.07)",
                transition: "transform 0.22s ease, box-shadow 0.22s ease",
              }}
              onMouseEnter={e => { const el = e.currentTarget as HTMLDivElement; el.style.transform = "scale(1.025)"; el.style.boxShadow = "0 8px 28px rgba(0,0,0,0.15)"; }}
              onMouseLeave={e => { const el = e.currentTarget as HTMLDivElement; el.style.transform = "scale(1)"; el.style.boxShadow = "0 2px 12px rgba(0,0,0,0.07)"; }}
            >
              <Image
                src={src}
                alt={img.alt ?? ""}
                fill
                className="object-cover"
                sizes="(max-width: 480px) 100vw, (max-width: 768px) 50vw, 33vw"
                unoptimized={shouldSkipNextImageOptimization(src)}
              />
              {/* Hover overlay */}
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(24,37,69,0.65) 0%, transparent 55%)", opacity: 0, transition: "opacity 0.2s" }}
                className="klima-img-overlay" />
              {/* Tag badge */}
              {img.tag && (
                <span style={{
                  position: "absolute", top: 12, left: 12,
                  backgroundColor: RED, color: "#fff",
                  fontSize: 11, fontWeight: 600, letterSpacing: "0.06em",
                  padding: "4px 10px", borderRadius: 4,
                }}>
                  {img.tag}
                </span>
              )}
            </div>
            </GenericEditableImage>
          );
        })}
      </div>

      {/* CTA */}
      <div style={{ textAlign: "center" }}>
        <a
          href={resolve(ctaHref)}
          data-btn="primary"
          style={{
            display: "inline-block",
            backgroundColor: NAVY, color: "#fff",
            textDecoration: "none", fontWeight: 600, fontSize: 15,
            padding: "13px 32px", borderRadius: 5,
            transition: "background-color 0.2s",
          }}
          onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#0f1a33")}
          onMouseLeave={e => (e.currentTarget.style.backgroundColor = NAVY)}
        >
          <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
        </a>
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div
          onClick={() => setLightbox(null)}
          style={{
            position: "fixed", inset: 0, zIndex: 999,
            backgroundColor: "rgba(0,0,0,0.88)",
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: 24,
          }}
        >
          <button
            onClick={() => setLightbox(null)}
            style={{ position: "absolute", top: 20, right: 24, background: "none", border: "none", color: "#fff", fontSize: 32, cursor: "pointer", lineHeight: 1 }}
            aria-label="Zavřít"
          >✕</button>
          <div onClick={e => e.stopPropagation()} style={{ position: "relative", maxWidth: "90vw", maxHeight: "85vh" }}>
            <Image
              src={lightbox.url ?? ""}
              alt={lightbox.alt ?? ""}
              width={1200}
              height={800}
              style={{ maxWidth: "90vw", maxHeight: "85vh", objectFit: "contain", borderRadius: 8 }}
              unoptimized={shouldSkipNextImageOptimization(lightbox.url ?? "")}
            />
          </div>
        </div>
      )}
    </section>
    </>
  );
}

// ── floors-01-inspiration ─────────────────────────────────────────────────────
// Inspirace — nadpis + podnadpis + 5-sloupcová galerie s hover overlay
// ─────────────────────────────────────────────────────────────────────────────
function InspirationFloors01({ content, sectionId, tenantSlug, isAdmin }: { content: Record<string, unknown>; sectionId: number; tenantSlug?: string; isAdmin?: boolean }) {
  const GREEN = "#007d47";
  const WHITE = "#ffffff";
  const DARK  = "#212529";
  const FONT  = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif";

  const title    = String(content.title    ?? "Inspirace");
  const subtitle = String(content.subtitle ?? "Najděte podlahu, která bude nejvíce odpovídat vašim potřebám.");
  type Img = { url: string; alt: string; caption: string; href: string };
  const images = (content.images as Img[]) ?? [
    { url: "/clones/supellex/user/www-supellex-cz/inspiration/dlc00116-2-420x236.jpg",                      alt: "Podlaha do bytu",        caption: "Podlaha do bytu? Vsaďte na vinyl",              href: "/sluzby" },
    { url: "/clones/supellex/user/www-supellex-cz/inspiration/db00114-2-420x236.jpg",                       alt: "Podlahy do ložnice",     caption: "Vinylové podlahy do ložnice",                   href: "/sluzby" },
    { url: "/clones/supellex/user/www-supellex-cz/inspiration/lucienahp-420x236.jpg",                       alt: "Podlahy obývací pokoj",  caption: "Dřevěné podlahy do obývacího pokoje",           href: "/sluzby" },
    { url: "/clones/supellex/user/www-supellex-cz/inspiration/loznice-na-web-420x236.jpg",                  alt: "Jak vybrat podlahu",     caption: "Jak vybrat podlahu do ložnice",                  href: "/sluzby" },
    { url: "/clones/supellex/user/www-supellex-cz/inspiration/detsky-pokoj-foto-na-webtowebp-420x236.jpg", alt: "Podlaha dětský pokoj",   caption: "Podlaha do dětského pokoje — bezpečná a odolná", href: "/sluzby" },
  ];

  const resolve = (href: string) => {
    if (!tenantSlug) return href;
    const base = `/demo/${tenantSlug}${isAdmin ? "/admin" : ""}`;
    if (href.startsWith("http") || href.startsWith("#")) return href;
    return `${base}${href.startsWith("/") ? href : "/" + href}`;
  };

  return (
    <>
      <style>{`
        .f01i-card { overflow: hidden; border-radius: 6px; position: relative; display: block; }
        .f01i-card img { width: 100%; height: 200px; object-fit: cover; display: block; transition: transform 0.4s ease; }
        .f01i-card:hover img { transform: scale(1.06); }
        .f01i-overlay { position: absolute; inset: 0; background: linear-gradient(transparent 40%, rgba(0,0,0,0.65) 100%); opacity: 0; transition: opacity 0.3s ease; border-radius: 6px; }
        .f01i-card:hover .f01i-overlay { opacity: 1; }
        .f01i-caption { position: absolute; bottom: 0; left: 0; right: 0; padding: 14px 14px 12px; color: #fff; font-size: 13px; font-weight: 600; line-height: 1.35; transform: translateY(6px); transition: transform 0.3s ease; opacity: 0; }
        .f01i-card:hover .f01i-caption { transform: translateY(0); opacity: 1; }
        @media (max-width: 900px) { .f01i-grid { grid-template-columns: repeat(3, 1fr) !important; } }
        @media (max-width: 600px) { .f01i-grid { grid-template-columns: repeat(2, 1fr) !important; } }
      `}</style>
      <section style={{ padding: "64px 20px", background: WHITE, fontFamily: FONT }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          {/* Header */}
          <div style={{ marginBottom: 40, display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
            <div>
              <GenericEditableText sectionId={sectionId} field="title" value={title} tag="h2" style={{ fontSize: 30, fontWeight: 800, color: DARK, margin: "0 0 8px", letterSpacing: "-0.01em" }}>
                {title}
              </GenericEditableText>
              <GenericEditableText sectionId={sectionId} field="subtitle" value={subtitle} tag="p" style={{ fontSize: 15, color: "#6c757d", margin: 0, lineHeight: 1.5 }}>
                {subtitle}
              </GenericEditableText>
            </div>
            <a href={resolve("/sluzby")} style={{ fontSize: 13, fontWeight: 700, color: GREEN, textDecoration: "none", borderBottom: `2px solid ${GREEN}`, paddingBottom: 2, whiteSpace: "nowrap" }}>
              Zobrazit vše →
            </a>
          </div>

          {/* Grid */}
          <div className="f01i-grid" style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 16 }}>
            {images.map((img, i) => (
              <a key={i} href={resolve(img.href)} className="f01i-card" style={{ textDecoration: "none" }}>
                <GenericEditableImage sectionId={sectionId} field={`images.${i}.url`} src={img.url} alt={img.alt} style={{ position: "absolute", inset: 0 }}>
                  <img src={img.url} alt={img.alt} loading="lazy" />
                </GenericEditableImage>
                <div className="f01i-overlay" />
                <div className="f01i-caption">
                  <GenericEditableText sectionId={sectionId} field={`images.${i}.caption`} value={img.caption} tag="span">{img.caption}</GenericEditableText>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

// ── klempir-01-gallery ────────────────────────────────────────────────────────
// 1:1 klempirzprahy.cz:
// - White bg, padding 80px 0
// - H2 "Realizoval jsem" centered 36px + silver underline
// - Grid repeat(auto-fill, minmax(350px, 1fr)), gap 30px
// - Card: radius 8px, overflow hidden, box-shadow
//   hover: translateY(-10px), image scale(1.1)
//   - Image 250px height
//   - Info: padding 20px, center; h3 18px #3a3a3a; p 14px gray
// - Footer "A mnoho dalších..." with decorative lines
// ─────────────────────────────────────────────────────────────────────────────
interface GalleryK01Props {
  content: Record<string, unknown>;
  sectionId: number;
  tenantSlug?: string;
  isAdmin: boolean;
}
type K01GalleryItem = { url?: string; alt?: string; title?: string; description?: string };

function GalleryKlempir01({ content, sectionId, tenantSlug, isAdmin }: GalleryK01Props) {
  const FONT   = "'Montserrat', sans-serif";
  const SILVER = "#c0c0c0";
  const DARK   = "#1a1a1a";
  const MEDIUM = "#3a3a3a";
  const GRAY   = "#717171";

  const title  = String(content.title  ?? "Realizoval jsem");
  const images = (Array.isArray(content.images) ? content.images : []) as K01GalleryItem[];

  return (
    <>
      <style>{`
        .k01-gallery { background: #ffffff; padding: 80px 0; position: relative; font-family: ${FONT}; }
        .k01-gallery::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 1px; background: rgba(0,0,0,0.05); }
        .k01-gallery-container { width: 90%; max-width: 1200px; margin: 0 auto; padding: 0 15px; }
        .k01-gallery-h2 { font-size: 36px; font-weight: 600; color: ${DARK}; text-align: center; margin-bottom: 50px; position: relative; font-family: ${FONT}; }
        .k01-gallery-h2::after { content: ''; display: block; width: 80px; height: 3px; background: ${SILVER}; margin: 15px auto 0; }
        .k01-gallery-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap: 30px; }
        .k01-proj-card { border-radius: 8px; overflow: hidden; box-shadow: 0 5px 15px rgba(0,0,0,0.1); transition: transform 0.3s ease, box-shadow 0.3s ease; }
        .k01-proj-card:hover { transform: translateY(-10px); box-shadow: 0 15px 30px rgba(0,0,0,0.1); }
        .k01-proj-img { height: 250px; overflow: hidden; }
        .k01-proj-img img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.3s ease; display: block; }
        .k01-proj-card:hover .k01-proj-img img { transform: scale(1.1); }
        .k01-proj-info { padding: 20px; background: #ffffff; display: flex; flex-direction: column; flex-grow: 1; text-align: center; }
        .k01-proj-info h3 { font-size: 18px; font-weight: 600; margin-bottom: 10px; color: ${MEDIUM}; font-family: ${FONT}; }
        .k01-proj-info p { color: ${GRAY}; font-size: 14px; line-height: 1.6; margin: 0; }
        .k01-gallery-more { text-align: center; margin-top: 40px; font-style: italic; font-size: 18px; color: ${GRAY}; display: flex; align-items: center; justify-content: center; gap: 15px; }
        .k01-deco-line { display: inline-block; width: 30px; height: 1px; background: ${GRAY}; flex-shrink: 0; }
        @media (max-width: 768px) {
          .k01-gallery-grid { grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); }
          .k01-proj-img { height: 200px; }
        }
      `}</style>

      <section id="galerie" className="k01-gallery" data-template="klempir-01">
        <div className="k01-gallery-container">
          <h2 className="k01-gallery-h2">
            <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
          </h2>

          <div className="k01-gallery-grid">
            {images.map((item, i) => {
              const imgUrl = String(item.url ?? "");
              const imgAlt = String(item.alt ?? "");
              const imgTitle = String(item.title ?? "");
              const imgDesc  = String(item.description ?? "");
              return (
                <div key={i} className="k01-proj-card">
                  <div className="k01-proj-img">
                    <GenericEditableImage sectionId={sectionId} field={`images.${i}.url`} src={imgUrl} alt={imgAlt} style={{}}>
                      <img loading="lazy" src={imgUrl} alt={imgAlt} />
                    </GenericEditableImage>
                  </div>
                  <div className="k01-proj-info">
                    <h3>
                      <GenericEditableText sectionId={sectionId} field={`images.${i}.title`} value={imgTitle} tag="span" />
                    </h3>
                    <p>
                      <GenericEditableText sectionId={sectionId} field={`images.${i}.description`} value={imgDesc} tag="span" />
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="k01-gallery-more">
            <span className="k01-deco-line" />
            <p>A mnoho dalších...</p>
            <span className="k01-deco-line" />
          </div>
        </div>
      </section>
    </>
  );
}

// ── garden-01-gallery ────────────────────────────────────────────────────────
function GalleryGarden01({
  content,
  sectionId,
  tenantSlug,
  isAdmin,
}: {
  content: Record<string, unknown>;
  sectionId: number;
  tenantSlug?: string;
  isAdmin: boolean;
}) {
  const title = String(content.title ?? "Proměny zahrad");
  const subtitle = String(content.subtitle ?? "Ukázky proměn zahrad před a po realizaci.");
  const images = normalizeImages((content as { images?: unknown }).images);
  const [lightbox, setLightbox] = useState<number | null>(null);

  const prev = () => setLightbox(i => i !== null ? (i - 1 + images.length) % images.length : null);
  const next = () => setLightbox(i => i !== null ? (i + 1) % images.length : null);

  useEffect(() => {
    if (lightbox === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
      if (e.key === "Escape") setLightbox(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightbox]);

  return (
    <>
      <style>{`
        .g01g-section {
          background: #ffffff;
          padding: 80px 48px;
          box-sizing: border-box;
        }
        .g01g-header {
          max-width: 860px;
          margin: 0 auto 40px auto;
          text-align: left;
        }
        .g01g-title {
          font-family: 'Cardo', Georgia, serif;
          font-size: 38px;
          font-weight: 700;
          color: #202714;
          margin: 0 0 12px 0;
          line-height: 1.2;
        }
        .g01g-hr {
          border: none;
          border-top: 2px solid #6a961f;
          margin: 0 0 16px 0;
          width: 60px;
        }
        .g01g-subtitle {
          font-family: 'Inter', Arial, sans-serif;
          font-size: 16px;
          color: #5a5a5a;
          margin: 0;
          line-height: 1.6;
        }
        .g01g-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
          max-width: 1200px;
          margin: 0 auto;
        }
        .g01g-item {
          position: relative;
          overflow: hidden;
          cursor: zoom-in;
          background: #f2f2f2;
          aspect-ratio: 4 / 3;
        }
        .g01g-item img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center;
          display: block;
          transition: transform 0.4s ease;
        }
        .g01g-item:hover img {
          transform: scale(1.04);
        }
        .g01g-lightbox {
          position: fixed;
          inset: 0;
          z-index: 9999;
          background: rgba(0,0,0,0.92);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .g01g-lb-img {
          max-width: 90vw;
          max-height: 85vh;
          object-fit: contain;
          border-radius: 4px;
        }
        .g01g-lb-close {
          position: absolute;
          top: 20px;
          right: 28px;
          background: none;
          border: none;
          color: #fff;
          font-size: 36px;
          cursor: pointer;
          line-height: 1;
          padding: 4px 8px;
        }
        .g01g-lb-prev,
        .g01g-lb-next {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          background: rgba(255,255,255,0.12);
          border: none;
          color: #fff;
          font-size: 28px;
          cursor: pointer;
          padding: 16px 20px;
          border-radius: 4px;
          line-height: 1;
        }
        .g01g-lb-prev { left: 20px; }
        .g01g-lb-next { right: 20px; }
        .g01g-lb-prev:hover,
        .g01g-lb-next:hover { background: rgba(255,255,255,0.22); }

        @media (max-width: 767px) {
          .g01g-section { padding: 60px 20px; }
          .g01g-grid { grid-template-columns: 1fr; gap: 8px; }
          .g01g-title { font-size: 28px; }
        }
      `}</style>

      <section id="galerie" className="g01g-section">
        <div className="g01g-header">
          <GenericEditableText
            tag="h2"
            className="g01g-title"
            value={title}
            sectionId={sectionId}
            field="title"
          />
          <hr className="g01g-hr" />
          <GenericEditableText
            tag="p"
            className="g01g-subtitle"
            value={subtitle}
            sectionId={sectionId}
            field="subtitle"
          />
        </div>

        <div className="g01g-grid">
          {images.map((img, i) => (
            <div key={i} className="g01g-item" onClick={() => setLightbox(i)}>
              <img
                src={img.url}
                alt={img.alt ?? `Fotografie ${i + 1}`}
                loading={i < 4 ? "eager" : "lazy"}
              />
            </div>
          ))}
        </div>
      </section>

      {lightbox !== null && (
        <div className="g01g-lightbox" onClick={() => setLightbox(null)}>
          <button className="g01g-lb-close" onClick={() => setLightbox(null)}>×</button>
          <button className="g01g-lb-prev" onClick={e => { e.stopPropagation(); prev(); }}>‹</button>
          <img
            className="g01g-lb-img"
            src={images[lightbox].url}
            alt={images[lightbox].alt ?? ""}
            onClick={e => e.stopPropagation()}
          />
          <button className="g01g-lb-next" onClick={e => { e.stopPropagation(); next(); }}>›</button>
        </div>
      )}
    </>
  );
}

// ── arbo-01-gallery ───────────────────────────────────────────────────────────
// - Light #f7f6fd bg, centered heading
// - 3-col photo grid (2-col tablet, 1-col mobile), equal aspect-ratio 4/3
// - Hover: green overlay + zoom icon
// - Lightbox on click: prev/next, ESC close
// - CTA button below grid
// ─────────────────────────────────────────────────────────────────────────────
function GalleryArbo01({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const [active, setActive] = useState<number | null>(null);

  const title   = String(content.title   ?? "Náš tým v akci");
  const ctaText = String(content.ctaText ?? "Nezávazná poptávka");
  const ctaHref = String(content.ctaHref ?? "#kontakt");
  const rawImgs = (content.images as Array<{ url: string; alt?: string }>) ?? [];
  const images  = rawImgs.length > 0 ? rawImgs : [
    { url: "/clones/lesarb/site/gallery-01.jpg", alt: "Arboristické práce" },
    { url: "/clones/lesarb/site/gallery-02.jpg", alt: "Kácení stromů" },
    { url: "/clones/lesarb/site/gallery-03.jpg", alt: "Prořezávání" },
    { url: "/clones/lesarb/site/img__gallery-pila-format.jpg", alt: "Zpracování dřeva" },
    { url: "/clones/lesarb/site/team.jpg",        alt: "Náš tým" },
    { url: "/clones/lesarb/site/gallery-06.jpg",  alt: "Realizace" },
  ];

  const prev = () => setActive(i => i !== null ? (i - 1 + images.length) % images.length : null);
  const next = () => setActive(i => i !== null ? (i + 1) % images.length : null);

  useEffect(() => {
    if (active === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setActive(null);
      if (e.key === "ArrowLeft")  prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active]);

  return (
    <>
      <style>{`
        .arbo01-gl {
          background: #f7f6fd;
          padding: 5rem 1.5rem;
          font-family: "AlanSans","Inter",system-ui,sans-serif;
        }
        .arbo01-gl-inner { max-width: 1370px; margin: 0 auto; }
        .arbo01-gl-title {
          font-size: clamp(1.5rem, 2.5vw, 2.1rem);
          font-weight: 700;
          color: #051d35;
          text-align: center;
          margin: 0 0 2.5rem;
        }
        .arbo01-gl-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 0.75rem;
        }
        @media (min-width: 600px) { .arbo01-gl-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (min-width: 960px) { .arbo01-gl-grid { grid-template-columns: repeat(3, 1fr); } }
        .arbo01-gl-item {
          position: relative;
          overflow: hidden;
          border-radius: 8px;
          aspect-ratio: 4/3;
          cursor: pointer;
        }
        .arbo01-gl-item img {
          width: 100%; height: 100%;
          object-fit: cover;
          display: block;
          transition: transform 0.45s ease;
        }
        .arbo01-gl-item:hover img { transform: scale(1.07); }
        .arbo01-gl-hover {
          position: absolute;
          inset: 0;
          background: rgba(0,151,57,0.55);
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transition: opacity 0.3s ease;
        }
        .arbo01-gl-item:hover .arbo01-gl-hover { opacity: 1; }
        .arbo01-gl-zoom {
          width: 44px; height: 44px;
          border-radius: 50%;
          background: rgba(255,255,255,0.9);
          display: flex; align-items: center; justify-content: center;
          color: #009739; font-size: 1.4rem; font-weight: 300;
        }
        .arbo01-gl-cta-wrap {
          text-align: center;
          margin-top: 2.5rem;
        }
        .arbo01-gl-cta {
          display: inline-flex; align-items: center; gap: 0.5rem;
          background: #009739; color: #fff;
          font-size: 0.9rem; font-weight: 700;
          text-decoration: none;
          padding: 0.7rem 1.5rem;
          border-radius: 6px;
          transition: background 0.2s;
        }
        .arbo01-gl-cta:hover { background: #15472a; }

        /* Lightbox */
        .arbo01-lb {
          position: fixed; inset: 0; z-index: 9000;
          background: rgba(5,29,53,0.93);
          display: flex; align-items: center; justify-content: center;
        }
        .arbo01-lb img {
          max-width: 90vw; max-height: 85vh;
          object-fit: contain; border-radius: 6px;
          display: block;
        }
        .arbo01-lb-close {
          position: absolute; top: 1.25rem; right: 1.5rem;
          background: none; border: none; color: #fff;
          font-size: 2.2rem; cursor: pointer; line-height: 1;
        }
        .arbo01-lb-prev, .arbo01-lb-next {
          position: absolute; top: 50%; transform: translateY(-50%);
          background: rgba(255,255,255,0.15); border: none;
          color: #fff; font-size: 2rem; cursor: pointer;
          width: 48px; height: 48px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          transition: background 0.2s;
        }
        .arbo01-lb-prev:hover, .arbo01-lb-next:hover { background: rgba(255,255,255,0.3); }
        .arbo01-lb-prev { left: 1rem; }
        .arbo01-lb-next { right: 1rem; }
      `}</style>

      <section className="arbo01-gl" id={String(sectionId)} data-template="arbo-01-gallery">
        <div className="arbo01-gl-inner">
          <h2 className="arbo01-gl-title">
            <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
          </h2>
          <div className="arbo01-gl-grid">
            {images.map((img, i) => (
              <div key={i} className="arbo01-gl-item" onClick={() => setActive(i)} role="button" tabIndex={0} aria-label={img.alt ?? "Fotografie"}>
                <GenericEditableImage sectionId={sectionId} field={`images.${i}.url`} src={img.url} alt={img.alt ?? "Fotografie"} style={{ position: "absolute", inset: 0 }}>
                  <img loading="lazy" src={img.url} alt={img.alt ?? "Arboristické práce"} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                </GenericEditableImage>
                <div className="arbo01-gl-hover">
                  <div className="arbo01-gl-zoom">⊕</div>
                </div>
              </div>
            ))}
          </div>
          <div className="arbo01-gl-cta-wrap">
            <a href={ctaHref} data-btn="primary" className="arbo01-gl-cta">
              <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
              <span aria-hidden="true">→</span>
            </a>
          </div>
        </div>
      </section>

      {active !== null && (
        <div className="arbo01-lb" onClick={() => setActive(null)} role="dialog" aria-modal="true">
          <button className="arbo01-lb-close" onClick={() => setActive(null)} aria-label="Zavřít">×</button>
          <img
            src={images[active].url}
            alt={images[active].alt ?? "Fotografie"}
            onClick={e => e.stopPropagation()}
          />
          <button className="arbo01-lb-prev" onClick={e => { e.stopPropagation(); prev(); }} aria-label="Předchozí">‹</button>
          <button className="arbo01-lb-next" onClick={e => { e.stopPropagation(); next(); }} aria-label="Další">›</button>
        </div>
      )}
    </>
  );
}

// ── ddd-01-gallery ────────────────────────────────────────────────────────────
// 1:1 deratizacepraha.com — "Škůdci" sekce:
// - Bílé bg, centered heading (h-sr-only v originále → viditelný v enginu)
// - Grid karet: 5 col desktop / 4 / 3 / 2 mobile; čtvercové fotky s caption dole
// - Hover: lehký scale + shadow
// ─────────────────────────────────────────────────────────────────────────────
function GalleryDdd01({ content, sectionId }: { content: Record<string,unknown>; sectionId: number }) {
  const PRIMARY = "#0c93eb";
  const DARK    = "#015ba3";
  const FONT    = "'Figtree', system-ui, sans-serif";

  const eyebrow = String(content.eyebrow ?? "Nejčastěji hubíme");
  const title   = String(content.title   ?? "Škůdci");
  const images  = (content.images as Array<{ url: string; alt?: string }>) ?? [];

  return (
    <>
      <style>{`
        .ddd01g-wrap {
          font-family: ${FONT};
          background: #ffffff;
          padding: 3rem 1.5rem 4rem;
        }
        .ddd01g-inner { max-width: 80rem; margin: 0 auto; }
        .ddd01g-header {
          text-align: center;
          margin-bottom: 2.5rem;
        }
        .ddd01g-eyebrow {
          display: inline-block;
          color: ${PRIMARY};
          font-size: clamp(0.84rem, 0.32vw + 0.77rem, 1.06rem);
          font-weight: 400;
          letter-spacing: 0.375rem;
          text-transform: uppercase;
          margin-bottom: 0.5rem;
        }
        .ddd01g-h2 {
          color: ${DARK};
          font-size: clamp(1.625rem, 0.89vw + 1.45rem, 2.25rem);
          font-weight: 700;
          text-transform: uppercase;
          margin: 0;
        }
        .ddd01g-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 0.75rem;
          justify-content: center;
        }
        .ddd01g-card {
          position: relative;
          overflow: hidden;
          border-radius: 4px;
          aspect-ratio: 1/1;
          background: #e5eef7;
          cursor: pointer;
          transition: transform 0.18s, box-shadow 0.18s;
        }
        .ddd01g-card:hover {
          transform: scale(1.03);
          box-shadow: 0 4px 16px rgba(0,0,0,0.18);
        }
        .ddd01g-card img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }
        .ddd01g-caption {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          background: linear-gradient(transparent, rgba(0,0,0,0.62));
          color: #fff;
          font-size: clamp(0.75rem, 1.2vw, 0.95rem);
          font-weight: 500;
          text-align: center;
          padding: 1.5rem 0.4rem 0.5rem;
        }
        @media (max-width: 1024px) { .ddd01g-grid { grid-template-columns: repeat(4, 1fr); } }
        @media (max-width: 640px)  { .ddd01g-grid { grid-template-columns: repeat(3, 1fr); } }
        @media (max-width: 420px)  { .ddd01g-grid { grid-template-columns: repeat(2, 1fr); } }
      `}</style>

      <section className="ddd01g-wrap" id="skudci" data-template="ddd-01-gallery">
        <div className="ddd01g-inner">
          <div className="ddd01g-header">
            <p className="ddd01g-eyebrow">
              <GenericEditableText sectionId={sectionId} field="eyebrow" value={eyebrow} tag="span" />
            </p>
            <h2 className="ddd01g-h2">
              <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
            </h2>
          </div>
          <div className="ddd01g-grid">
            {images.map((img, i) => (
              <div key={i} className="ddd01g-card">
                <GenericEditableImage sectionId={sectionId} field={`images.${i}.url`} src={img.url} alt={img.alt ?? ""} style={{}}>
                  <img src={img.url} alt={img.alt ?? ""} loading="lazy" decoding="async" />
                </GenericEditableImage>
                <p className="ddd01g-caption">
                  <GenericEditableText sectionId={sectionId} field={`images.${i}.alt`} value={img.alt ?? ""} tag="span" />
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

// ── chalet-01-gallery ─────────────────────────────────────────────────────────
function GalleryChalet01({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const c = (content ?? {}) as Record<string, any>;
  const title    = String(c.title    ?? "Galerie");
  const subtitle = String(c.subtitle ?? "");
  const images: Array<{ url: string; alt: string }> =
    Array.isArray(c.images) ? c.images : [];

  const [lightbox, setLightbox] = useState<number | null>(null);

  useEffect(() => {
    if (lightbox === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightbox(null);
      if (e.key === "ArrowRight") setLightbox(i => i !== null ? (i + 1) % images.length : null);
      if (e.key === "ArrowLeft")  setLightbox(i => i !== null ? (i - 1 + images.length) % images.length : null);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [lightbox, images.length]);

  const BEIGE  = "#c0bbad";
  const DARK   = "#1e2329";
  const FONT_H = "'Josefin Sans', system-ui, sans-serif";
  const FONT_B = "'Plus Jakarta Sans', system-ui, sans-serif";

  // bento layout: [0]=left tall (row span 2), [1-2]=right top/bottom, [3-5]=3 equal, [6-7]=2 wide split
  // Pozice v gridu (4 col × N rows):
  // [0] col 1, row 1-2 (portrait tall)
  // [1] col 2-3, row 1 (wide landscape)
  // [2] col 4, row 1 (square)
  // [3] col 2, row 2 (square)
  // [4] col 3, row 2 (square)
  // [5] col 4, row 2 (square)
  // [6] col 1-2, row 3 (wide)
  // [7] col 3-4, row 3 (wide)

  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Josefin+Sans:wght@300;400;600&family=Plus+Jakarta+Sans:wght@400;500;600&display=swap" />
      <style>{`        .ch01gl {
          background: #ffffff;
          padding: clamp(4rem, 8vw, 7rem) 0;
        }
        .ch01gl-header {
          text-align: center;
          padding: 0 1.5rem;
          margin-bottom: clamp(2.5rem, 5vw, 4rem);
        }
        .ch01gl-kicker {
          display: block;
          font-family: ${FONT_H};
          font-size: 0.65rem;
          font-weight: 400;
          letter-spacing: 0.32em;
          text-transform: uppercase;
          color: ${BEIGE};
          margin-bottom: 0.75rem;
        }
        .ch01gl-title {
          font-family: ${FONT_H};
          font-size: clamp(1.5rem, 3vw, 2.2rem);
          font-weight: 300;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: ${DARK};
          margin: 0 0 0.9rem;
        }
        .ch01gl-divider {
          width: 40px;
          height: 1px;
          background: ${BEIGE};
          margin: 0 auto;
        }
        /* Bento grid */
        .ch01gl-bento {
          max-width: 1400px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          grid-template-rows: 320px 240px 260px;
          gap: 4px;
          padding: 0 4px;
        }
        .ch01gl-cell {
          position: relative;
          overflow: hidden;
          cursor: pointer;
          background: #e8e4de;
        }
        /* explicit placements */
        .ch01gl-cell:nth-child(1) { grid-column: 1; grid-row: 1 / 3; }
        .ch01gl-cell:nth-child(2) { grid-column: 2 / 4; grid-row: 1; }
        .ch01gl-cell:nth-child(3) { grid-column: 4; grid-row: 1; }
        .ch01gl-cell:nth-child(4) { grid-column: 2; grid-row: 2; }
        .ch01gl-cell:nth-child(5) { grid-column: 3; grid-row: 2; }
        .ch01gl-cell:nth-child(6) { grid-column: 4; grid-row: 2; }
        .ch01gl-cell:nth-child(7) { grid-column: 1 / 3; grid-row: 3; }
        .ch01gl-cell:nth-child(8) { grid-column: 3 / 5; grid-row: 3; }
        .ch01gl-cell img {
          width: 100%; height: 100%;
          object-fit: cover;
          display: block;
          transition: transform 0.55s cubic-bezier(0.25,0.46,0.45,0.94);
        }
        .ch01gl-cell:hover img { transform: scale(1.07); }
        .ch01gl-cell-ov {
          position: absolute;
          inset: 0;
          background: rgba(30,35,41,0);
          transition: background 0.35s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .ch01gl-cell:hover .ch01gl-cell-ov {
          background: rgba(30,35,41,0.42);
        }
        .ch01gl-cell-ov-icon {
          opacity: 0;
          transform: scale(0.75) rotate(-10deg);
          transition: opacity 0.3s ease, transform 0.3s ease;
          color: #fff;
          width: 48px;
          height: 48px;
          border-radius: 50%;
          border: 1.5px solid rgba(255,255,255,0.7);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .ch01gl-cell:hover .ch01gl-cell-ov-icon {
          opacity: 1;
          transform: scale(1) rotate(0deg);
        }
        /* alt text label on hover */
        .ch01gl-cell-label {
          position: absolute;
          bottom: 0; left: 0; right: 0;
          padding: 0.6rem 0.85rem;
          background: linear-gradient(to top, rgba(0,0,0,0.6), transparent);
          font-family: ${FONT_H};
          font-size: 0.65rem;
          font-weight: 400;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.85);
          transform: translateY(100%);
          transition: transform 0.3s ease;
        }
        .ch01gl-cell:hover .ch01gl-cell-label { transform: translateY(0); }
        /* Lightbox */
        .ch01gl-lb {
          position: fixed;
          inset: 0;
          z-index: 9999;
          background: rgba(10,12,15,0.96);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .ch01gl-lb-img {
          max-width: 88vw;
          max-height: 86vh;
          object-fit: contain;
          display: block;
          box-shadow: 0 24px 80px rgba(0,0,0,0.6);
        }
        .ch01gl-lb-close {
          position: absolute;
          top: 1.5rem; right: 1.75rem;
          background: none; border: 0;
          color: rgba(255,255,255,0.7);
          font-size: 2rem;
          cursor: pointer; line-height: 1;
          transition: color 0.2s;
        }
        .ch01gl-lb-close:hover { color: #fff; }
        .ch01gl-lb-counter {
          position: absolute;
          bottom: 1.5rem; left: 50%; transform: translateX(-50%);
          font-family: ${FONT_H};
          font-size: 0.65rem;
          letter-spacing: 0.2em;
          color: rgba(255,255,255,0.45);
        }
        .ch01gl-lb-btn {
          position: absolute;
          top: 50%; transform: translateY(-50%);
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.2);
          color: #fff;
          width: 52px; height: 52px;
          border-radius: 50%;
          cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          transition: background 0.2s, border-color 0.2s;
        }
        .ch01gl-lb-btn:hover { background: rgba(255,255,255,0.16); border-color: rgba(255,255,255,0.45); }
        .ch01gl-lb-btn.prev { left: 2rem; }
        .ch01gl-lb-btn.next { right: 2rem; }
        @media (max-width: 900px) {
          .ch01gl-bento {
            grid-template-columns: repeat(2, 1fr);
            grid-template-rows: auto;
          }
          .ch01gl-cell { grid-column: auto !important; grid-row: auto !important; aspect-ratio: 4/3; }
        }
        @media (max-width: 520px) {
          .ch01gl-bento { grid-template-columns: 1fr; gap: 3px; }
          .ch01gl-cell { aspect-ratio: 16/9; }
        }
      `}</style>

      <section className="ch01gl" id="galerie" data-template="chalet-01-gallery">
        <div className="ch01gl-header">
          <span className="ch01gl-kicker">foto &amp; prostory</span>
          <h2 className="ch01gl-title">
            <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
          </h2>
          <div className="ch01gl-divider" />
          {subtitle && (
            <p className="ch01gl-subtitle">
              <GenericEditableText sectionId={sectionId} field="subtitle" value={String(subtitle)} tag="span" />
            </p>
          )}
        </div>

        <div className="ch01gl-bento">
          {images.slice(0, 8).map((img, i) => (
            <div key={i} className="ch01gl-cell" onClick={() => setLightbox(i)} role="button" tabIndex={0} aria-label={`Otevřít foto: ${img.alt}`}>
              <GenericEditableImage
                sectionId={sectionId}
                field={`images.${i}.url`}
                src={img.url}
                alt={img.alt}
                className="relative overflow-hidden w-full h-full"
                style={{}}
              >
                <img src={img.url} alt={img.alt} loading={i < 2 ? "eager" : "lazy"} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </GenericEditableImage>
              <div className="ch01gl-cell-ov">
                <div className="ch01gl-cell-ov-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/>
                  </svg>
                </div>
              </div>
              <div className="ch01gl-cell-label">
                <GenericEditableText sectionId={sectionId} field={`images.${i}.alt`} value={img.alt} tag="span" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {lightbox !== null && (
        <div className="ch01gl-lb" onClick={() => setLightbox(null)} role="dialog" aria-modal="true" aria-label="Lightbox">
          <button className="ch01gl-lb-close" onClick={() => setLightbox(null)} aria-label="Zavřít">×</button>
          <img
            className="ch01gl-lb-img"
            src={images[lightbox]?.url}
            alt={images[lightbox]?.alt}
            onClick={e => e.stopPropagation()}
          />
          <span className="ch01gl-lb-counter">{lightbox + 1} / {images.length}</span>
          {images.length > 1 && (
            <>
              <button className="ch01gl-lb-btn prev" onClick={e => { e.stopPropagation(); setLightbox((lightbox - 1 + images.length) % images.length); }} aria-label="Předchozí">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
              </button>
              <button className="ch01gl-lb-btn next" onClick={e => { e.stopPropagation(); setLightbox((lightbox + 1) % images.length); }} aria-label="Další">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg>
              </button>
            </>
          )}
        </div>
      )}
    </>
  );
}

// ── hotel-01-offers ───────────────────────────────────────────────────────────
function GalleryHotel01Offers({ content, sectionId, isAdmin }: { content: Record<string, unknown>; sectionId: number; tenantSlug?: string; isAdmin: boolean }) {
  const c        = (content ?? {}) as Record<string, any>;
  const eyebrow  = c.eyebrow  ?? "Speciální nabídky";
  const title    = c.title    ?? "Využijte naše balíčky";
  const subtitle = c.subtitle ?? "";
  const items: { name: string; description: string; image: string; moreHref: string; bookHref: string }[] = Array.isArray(c.items) ? c.items : [];

  const resolve = (href: string) => (isAdmin ? "#" : href ?? "#");

  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500&family=Poppins:wght@300;400;500&display=swap" />
      <style>{`        .h01offers {
          background: #fff;
          padding: clamp(60px,8vw,110px) clamp(20px,5vw,80px);
          font-family: 'Poppins', sans-serif;
        }
        .h01offers-header {
          max-width: 1200px; margin: 0 auto 52px; text-align: center;
        }
        .h01offers-eyebrow {
          font-size: 11px; letter-spacing: 0.22em; text-transform: uppercase;
          color: #a98763; font-weight: 500; margin: 0 0 16px;
        }
        .h01offers-title {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: clamp(26px,3vw,42px); font-weight: 400; color: #3e3e3e;
          margin: 0 0 16px; line-height: 1.2;
        }
        .h01offers-subtitle {
          font-size: 15px; color: #797979; font-weight: 300;
          max-width: 580px; margin: 0 auto; line-height: 1.7;
        }
        .h01offers-grid {
          max-width: 1200px; margin: 0 auto;
          display: grid; grid-template-columns: repeat(3, 1fr); gap: 28px;
        }
        .h01offers-card {
          display: flex; flex-direction: column;
          border: 1px solid #e8e0d6; overflow: hidden;
          transition: box-shadow 0.25s;
        }
        .h01offers-card:hover { box-shadow: 0 8px 32px rgba(0,0,0,0.10); }
        .h01offers-img-wrap {
          position: relative; overflow: hidden; aspect-ratio: 4/3; flex-shrink: 0;
        }
        .h01offers-img {
          width: 100%; height: 100%; object-fit: cover; display: block;
          transition: transform 0.55s ease;
        }
        .h01offers-card:hover .h01offers-img { transform: scale(1.05); }
        .h01offers-badge {
          position: absolute; top: 16px; left: 0;
          background: #879B32; color: #fff;
          font-size: 10px; letter-spacing: 0.14em; text-transform: uppercase;
          padding: 5px 14px; font-weight: 500;
        }
        .h01offers-body {
          padding: 24px 24px 28px; display: flex; flex-direction: column; flex: 1;
        }
        .h01offers-name {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: 18px; font-weight: 400; color: #3e3e3e;
          margin: 0 0 12px; line-height: 1.3;
        }
        .h01offers-desc {
          font-size: 14px; color: #5D5D5D; font-weight: 300;
          line-height: 1.75; margin: 0 0 24px; flex: 1;
        }
        .h01offers-ctas { display: flex; gap: 10px; flex-wrap: wrap; }
        .h01offers-more {
          display: inline-flex; align-items: center;
          border: 1px solid #a98763; color: #a98763;
          font-family: 'Playfair Display', Georgia, serif;
          font-size: 11px; letter-spacing: 0.12em; text-transform: uppercase;
          padding: 9px 20px; text-decoration: none; transition: background 0.2s, color 0.2s;
        }
        .h01offers-more:hover { background: #a98763; color: #fff; }
        .h01offers-book {
          display: inline-flex; align-items: center;
          background: #879B32; color: #fff;
          font-family: 'Playfair Display', Georgia, serif;
          font-size: 11px; letter-spacing: 0.12em; text-transform: uppercase;
          padding: 9px 20px; text-decoration: none; transition: background 0.2s;
        }
        .h01offers-book:hover { background: #6a7a28; }
        @media (max-width: 900px) { .h01offers-grid { grid-template-columns: 1fr 1fr; } }
        @media (max-width: 560px) { .h01offers-grid { grid-template-columns: 1fr; } }
      `}</style>

      <section className="h01offers" id="nabidky" data-template="hotel-01-offers">
        <div className="h01offers-header">
          <p className="h01offers-eyebrow">
            <GenericEditableText sectionId={sectionId} field="eyebrow" value={eyebrow} tag="span" />
          </p>
          <h2 className="h01offers-title">
            <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
          </h2>
          {subtitle && (
            <p className="h01offers-subtitle">
              <GenericEditableText sectionId={sectionId} field="subtitle" value={subtitle} tag="span" />
            </p>
          )}
        </div>

        <div className="h01offers-grid">
          {items.map((item, i) => (
            <div key={i} className="h01offers-card">
              <div className="h01offers-img-wrap">
                <GenericEditableImage sectionId={sectionId} field={`items.${i}.image`} src={item.image || "/placeholder.jpg"} alt={item.name} style={{ width: "100%", height: "100%" }}>
                  <img src={item.image || "/placeholder.jpg"} alt={item.name} className="h01offers-img" loading="lazy" />
                </GenericEditableImage>
                <span className="h01offers-badge">Nabídka</span>
              </div>
              <div className="h01offers-body">
                <h3 className="h01offers-name">
                  <GenericEditableText sectionId={sectionId} field={`items.${i}.name`} value={item.name} tag="span" />
                </h3>
                <p className="h01offers-desc">
                  <GenericEditableText sectionId={sectionId} field={`items.${i}.description`} value={item.description} tag="span" />
                </p>
                <div className="h01offers-ctas">
                  <a href={resolve(item.moreHref)} className="h01offers-more">Více informací</a>
                  <a href={resolve(item.bookHref)} className="h01offers-book">Rezervujte</a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

// ── hotel-02-gallery ──────────────────────────────────────────────────────────
function GalleryHotel02({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const c      = (content ?? {}) as Record<string, any>;
  const title  = c.title ?? "Jak to u nás vypadá?";
  const images: { url: string; alt: string }[] = Array.isArray(c.images) ? c.images : [];

  const [lightbox, setLightbox] = useState<number | null>(null);

  const prev = () => setLightbox(i => (i === null ? null : (i - 1 + images.length) % images.length));
  const next = () => setLightbox(i => (i === null ? null : (i + 1) % images.length));

  useEffect(() => {
    if (lightbox === null) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") prev();
      else if (e.key === "ArrowRight") next();
      else if (e.key === "Escape") setLightbox(null);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [lightbox]);

  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400&family=Montserrat:wght@400;500&display=swap" />
      <style>{`        .h02gl {
          background: #1a2332;
          padding: clamp(60px,8vw,100px) clamp(20px,4vw,60px);
          font-family: 'Montserrat', sans-serif;
        }
        .h02gl-header {
          text-align: center; margin: 0 auto clamp(36px,5vw,56px);
        }
        .h02gl-title {
          font-family: 'Cormorant Garamond', Georgia, serif;
          font-size: clamp(26px,3vw,42px); font-weight: 300;
          color: #fff; margin: 0; line-height: 1.2;
        }
        .h02gl-grid {
          max-width: 1300px; margin: 0 auto;
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          grid-auto-rows: 220px;
          gap: 8px;
        }
        /* First item spans 2 cols + 2 rows */
        .h02gl-item:nth-child(1) { grid-column: span 2; grid-row: span 2; }
        /* 5th item spans 2 rows */
        .h02gl-item:nth-child(5) { grid-row: span 2; }

        .h02gl-item {
          position: relative; overflow: hidden; cursor: pointer;
          background: #2d3f57;
        }
        .h02gl-img {
          width: 100%; height: 100%; object-fit: cover; display: block;
          transition: transform 0.55s ease, filter 0.35s ease;
        }
        .h02gl-item:hover .h02gl-img {
          transform: scale(1.06);
          filter: brightness(0.75);
        }
        .h02gl-overlay {
          position: absolute; inset: 0;
          display: flex; align-items: center; justify-content: center;
          opacity: 0; transition: opacity 0.3s;
        }
        .h02gl-item:hover .h02gl-overlay { opacity: 1; }
        .h02gl-zoom-icon {
          width: 44px; height: 44px; border: 1.5px solid rgba(255,255,255,0.8);
          border-radius: 50%; display: flex; align-items: center; justify-content: center;
          color: #fff;
        }

        /* Lightbox */
        .h02gl-lb {
          position: fixed; inset: 0; z-index: 9000;
          background: rgba(0,0,0,0.92);
          display: flex; align-items: center; justify-content: center;
        }
        .h02gl-lb-img {
          max-width: 90vw; max-height: 88vh;
          object-fit: contain; display: block;
          box-shadow: 0 24px 80px rgba(0,0,0,0.6);
        }
        .h02gl-lb-close {
          position: absolute; top: 20px; right: 28px;
          background: none; border: none; color: #fff; font-size: 36px;
          cursor: pointer; line-height: 1; opacity: 0.8; transition: opacity 0.2s;
        }
        .h02gl-lb-close:hover { opacity: 1; }
        .h02gl-lb-arrow {
          position: absolute; top: 50%; transform: translateY(-50%);
          background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2);
          color: #fff; width: 48px; height: 48px; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          transition: background 0.2s;
        }
        .h02gl-lb-arrow:hover { background: rgba(150,161,172,0.4); }
        .h02gl-lb-arrow.left  { left: 20px; }
        .h02gl-lb-arrow.right { right: 20px; }

        @media (max-width: 860px) {
          .h02gl-grid {
            grid-template-columns: repeat(2, 1fr);
            grid-auto-rows: 180px;
          }
          .h02gl-item:nth-child(1) { grid-column: span 2; grid-row: span 1; }
          .h02gl-item:nth-child(5) { grid-row: span 1; }
        }
        @media (max-width: 480px) {
          .h02gl-grid { grid-template-columns: 1fr 1fr; grid-auto-rows: 140px; }
        }
      `}</style>

      <section className="h02gl" id="galerie" data-template="hotel-02-gallery">
        <div className="h02gl-header">
          <h2 className="h02gl-title">
            <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
          </h2>
        </div>

        <div className="h02gl-grid">
          {images.map((img, i) => (
            <div key={i} className="h02gl-item" onClick={() => setLightbox(i)}>
              <GenericEditableImage sectionId={sectionId} field={`images.${i}.url`} src={img.url} alt={img.alt ?? ""} style={{ width: "100%", height: "100%" }}>
                <img src={img.url} alt={img.alt ?? ""} className="h02gl-img" loading="lazy" />
              </GenericEditableImage>
              <div className="h02gl-overlay">
                <div className="h02gl-zoom-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                    <line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/>
                  </svg>
                </div>
              </div>
            </div>
          ))}
        </div>

        {lightbox !== null && (
          <div className="h02gl-lb" onClick={() => setLightbox(null)}>
            <button className="h02gl-lb-close" onClick={e => { e.stopPropagation(); setLightbox(null); }}>×</button>
            <button className="h02gl-lb-arrow left" onClick={e => { e.stopPropagation(); prev(); }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
            </button>
            <img loading="lazy" src={images[lightbox]?.url} alt={images[lightbox]?.alt ?? ""} className="h02gl-lb-img" onClick={e => e.stopPropagation()} />
            <button className="h02gl-lb-arrow right" onClick={e => { e.stopPropagation(); next(); }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
            </button>
          </div>
        )}
      </section>
    </>
  );
}

// ── malir-02-gallery ──────────────────────────────────────────────────────────
function GalleryMalir02({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const ORANGE  = "#ff914d";
  const DARK    = "#232323";
  const POPPINS = "'Poppins', sans-serif";

  type ImgItem = { url: string; title: string; category: string };
  const defaultImages: ImgItem[] = [
    { url: "/templates/malir-02/galerie-1.jpg",  title: "Malování místnosti s krbem",       category: "Byty a domy" },
    { url: "/templates/malir-02/galerie-2.jpg",  title: "Drobné opravy omítek a malba bytu", category: "Byty a domy" },
    { url: "/templates/malir-02/galerie-3.jpg",  title: "Výmalba ordinace lékaře",           category: "Nebytové prostory" },
    { url: "/templates/malir-02/galerie-4.jpg",  title: "Natírání sloupů v podzemní garáži", category: "Nebytové prostory" },
    { url: "/templates/malir-02/galerie-5.jpg",  title: "Natírání a lakování",               category: "Lakýrnické práce" },
    { url: "/templates/malir-02/galerie-6.jpg",  title: "Malování dekorativní stěny",        category: "Byty a domy" },
    { url: "/templates/malir-02/galerie-7.jpg",  title: "Malování ve školní jídelně",        category: "Nebytové prostory" },
    { url: "/templates/malir-02/galerie-8.jpg",  title: "Malování pokoje",                   category: "Byty a domy" },
    { url: "/templates/malir-02/galerie-9.jpg",  title: "Barevná lišta v rozích",            category: "Byty a domy" },
    { url: "/templates/malir-02/galerie-10.jpg", title: "Natření střechy ochranným nátěrem", category: "Byty a domy" },
  ];

  const rawImages = Array.isArray(content.images) && content.images.length ? content.images as ImgItem[] : defaultImages;
  const heading  = typeof content.heading === "string" ? content.heading : "Galerie naší práce";
  const filters  = Array.isArray(content.filters) ? content.filters as string[] : ["Vybrané", "Byty a domy", "Nebytové prostory", "Lakýrnické práce"];

  const [activeFilter, setActiveFilter] = useState("Vybrané");
  const [lightbox, setLightbox]         = useState<number | null>(null);

  const filtered = activeFilter === "Vybrané" ? rawImages : rawImages.filter(img => img.category === activeFilter);

  const prev = () => setLightbox(i => i !== null ? (i - 1 + filtered.length) % filtered.length : 0);
  const next = () => setLightbox(i => i !== null ? (i + 1) % filtered.length : 0);

  return (
    <>
      <style>{`
        .m02gl-section { background: #f7f7f7; padding: 80px 0 60px; }
        .m02gl-inner   { max-width: 1240px; margin: 0 auto; padding: 0 24px; }
        .m02gl-head    { text-align: center; margin-bottom: 48px; }
        .m02gl-h2      { font-family: ${POPPINS}; font-weight: 700; font-size: 38px; color: ${DARK}; margin: 0 0 28px; }
        .m02gl-h2 span { color: ${ORANGE}; }
        .m02gl-tabs    { display: flex; gap: 10px; justify-content: center; flex-wrap: wrap; }
        .m02gl-tab {
          font-family: ${POPPINS}; font-weight: 600; font-size: 13px; letter-spacing: 0.05em;
          text-transform: uppercase; color: #666; background: #fff;
          border: 1.5px solid #ddd; padding: 8px 20px; border-radius: 30px;
          cursor: pointer; transition: all 0.2s;
        }
        .m02gl-tab:hover              { border-color: ${ORANGE}; color: ${ORANGE}; }
        .m02gl-tab.active             { background: ${ORANGE}; border-color: ${ORANGE}; color: #fff; }
        .m02gl-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 10px;
        }
        .m02gl-item {
          position: relative; aspect-ratio: 4/3; overflow: hidden; cursor: pointer;
          background: #ddd;
        }
        .m02gl-item img { width: 100%; height: 100%; object-fit: cover; display: block; transition: transform 0.45s ease; }
        .m02gl-item:hover img { transform: scale(1.06); }
        .m02gl-overlay {
          position: absolute; inset: 0; background: rgba(0,0,0,0);
          display: flex; align-items: flex-end;
          transition: background 0.3s;
        }
        .m02gl-item:hover .m02gl-overlay { background: rgba(0,0,0,0.42); }
        .m02gl-caption {
          font-family: ${POPPINS}; font-weight: 600; font-size: 13px; color: #fff;
          padding: 14px 16px; opacity: 0; transform: translateY(8px); transition: all 0.3s;
          text-shadow: 0 1px 3px rgba(0,0,0,0.6); line-height: 1.35;
        }
        .m02gl-item:hover .m02gl-caption { opacity: 1; transform: translateY(0); }
        /* Lightbox */
        .m02gl-lb {
          position: fixed; inset: 0; background: rgba(0,0,0,0.92); z-index: 9999;
          display: flex; align-items: center; justify-content: center;
        }
        .m02gl-lb-img  { max-width: 90vw; max-height: 85vh; object-fit: contain; border-radius: 4px; }
        .m02gl-lb-close {
          position: fixed; top: 20px; right: 28px; background: none; border: none;
          color: #fff; font-size: 38px; cursor: pointer; line-height: 1; z-index: 10000; opacity: 0.8;
        }
        .m02gl-lb-close:hover { opacity: 1; }
        .m02gl-lb-arrow {
          position: fixed; top: 50%; transform: translateY(-50%);
          background: rgba(255,255,255,0.15); border: none; color: #fff;
          width: 48px; height: 48px; border-radius: 50%; cursor: pointer; font-size: 24px;
          display: flex; align-items: center; justify-content: center; z-index: 10000;
          transition: background 0.2s;
        }
        .m02gl-lb-arrow:hover { background: rgba(255,255,255,0.3); }
        .m02gl-lb-arrow.left  { left: 20px; }
        .m02gl-lb-arrow.right { right: 20px; }
        @media (max-width: 900px) { .m02gl-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 500px) { .m02gl-grid { grid-template-columns: 1fr; } .m02gl-h2 { font-size: 26px; } }
      `}</style>

      <section className="m02gl-section" id="galerie" data-template="malir-02">
        <div className="m02gl-inner">
          <div className="m02gl-head">
            <h2 className="m02gl-h2"><GenericEditableText sectionId={sectionId} field="heading" value={heading} tag="span">{heading.split(" ").map((w, i) => i === 0 ? <span key={i} style={{ color: ORANGE }}>{w} </span> : w + " ")}</GenericEditableText></h2>
            <div className="m02gl-tabs">
              {filters.map((f, i) => (
                <button key={i} className={`m02gl-tab${activeFilter === f ? " active" : ""}`} onClick={() => setActiveFilter(f)}>{f}</button>
              ))}
            </div>
          </div>

          <div className="m02gl-grid">
            {filtered.map((img, i) => (
              <div key={i} className="m02gl-item" onClick={() => setLightbox(i)}>
                <GenericEditableImage sectionId={sectionId} field={`images.${i}.url`} src={img.url} alt={img.title} style={{ width: "100%", height: "100%" }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img loading="lazy" src={img.url} alt={img.title} />
                </GenericEditableImage>
                <div className="m02gl-overlay">
                  <span className="m02gl-caption"><GenericEditableText sectionId={sectionId} field={`images.${i}.title`} value={img.title} tag="span">{img.title}</GenericEditableText></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {lightbox !== null && (
        <div className="m02gl-lb" onClick={() => setLightbox(null)}>
          <button className="m02gl-lb-close" onClick={e => { e.stopPropagation(); setLightbox(null); }}>×</button>
          <button className="m02gl-lb-arrow left" onClick={e => { e.stopPropagation(); prev(); }}>‹</button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img loading="lazy" src={filtered[lightbox]?.url} alt={filtered[lightbox]?.title ?? ""} className="m02gl-lb-img" onClick={e => e.stopPropagation()} />
          <button className="m02gl-lb-arrow right" onClick={e => { e.stopPropagation(); next(); }}>›</button>
        </div>
      )}
    </>
  );
}

// ── photo-01-gallery ──────────────────────────────────────────────────────────
// 3-col square grid (Instagram-style) + lightbox — 1:1 zbiralova.cz portfolio
function GalleryPhoto01({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const eyebrow = String(content.eyebrow ?? "");
  const title   = String(content.title   ?? "");
  const images  = (content.images as Array<{ url: string; alt: string }>) ?? [];
  const [lightbox, setLightbox] = useState<number | null>(null);

  const prev = () => setLightbox(i => i === null ? null : (i - 1 + images.length) % images.length);
  const next = () => setLightbox(i => i === null ? null : (i + 1) % images.length);

  useEffect(() => {
    if (lightbox === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft")  prev();
      if (e.key === "ArrowRight") next();
      if (e.key === "Escape")     setLightbox(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightbox]);

  useEffect(() => {
    document.body.style.overflow = lightbox !== null ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [lightbox]);

  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500&display=swap" />
      <style>{`        .ph01gl {
          background: #fff;
          padding: 64px 0 80px;
        }
        .ph01gl-inner {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 24px;
        }
        .ph01gl-header {
          text-align: center;
          margin-bottom: 32px;
        }
        .ph01gl-eyebrow {
          font-family: 'Inter', sans-serif; font-size: 0.75rem; letter-spacing: 0.18em;
          text-transform: uppercase; color: #8b7355; margin: 0 0 10px;
        }
        .ph01gl-title {
          font-family: Georgia, 'Times New Roman', serif; font-size: 32px;
          font-weight: 400; color: #1a1a1a; margin: 0;
        }
        .ph01gl-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 5px;
        }
        .ph01gl-cell {
          position: relative;
          aspect-ratio: 1 / 1;
          overflow: hidden;
          cursor: pointer;
          background: #f0ece8;
        }
        .ph01gl-cell img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          transition: transform 0.45s ease;
        }
        .ph01gl-cell::after {
          content: '';
          position: absolute;
          inset: 0;
          background: rgba(0,0,0,0);
          transition: background 0.35s ease;
          pointer-events: none;
        }
        .ph01gl-cell:hover img { transform: scale(1.06); }
        .ph01gl-cell:hover::after { background: rgba(0,0,0,0.18); }
        .ph01gl-lb {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.92);
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .ph01gl-lb-img {
          max-width: 90vw;
          max-height: 90vh;
          object-fit: contain;
          display: block;
          border-radius: 2px;
        }
        .ph01gl-lb-close {
          position: absolute;
          top: 20px;
          right: 28px;
          background: none;
          border: none;
          color: #fff;
          font-size: 2.25rem;
          cursor: pointer;
          line-height: 1;
          opacity: 0.8;
        }
        .ph01gl-lb-close:hover { opacity: 1; }
        .ph01gl-lb-arrow {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: #fff;
          font-size: 3rem;
          cursor: pointer;
          padding: 0 20px;
          opacity: 0.7;
          line-height: 1;
          user-select: none;
        }
        .ph01gl-lb-arrow:hover { opacity: 1; }
        .ph01gl-lb-arrow.left  { left:  0; }
        .ph01gl-lb-arrow.right { right: 0; }
        @media (max-width: 768px) {
          .ph01gl-grid { grid-template-columns: repeat(2, 1fr); gap: 3px; }
          .ph01gl { padding: 40px 0 56px; }
        }
      `}</style>

      <section className="ph01gl" id="portfolio" data-template="photo-01-gallery">
        <div className="ph01gl-inner">
          {(eyebrow || title) && (
            <div className="ph01gl-header">
              {eyebrow && (
                <GenericEditableText sectionId={sectionId} field="eyebrow" value={eyebrow} tag="p">
                  <p className="ph01gl-eyebrow">{eyebrow}</p>
                </GenericEditableText>
              )}
              {title && (
                <GenericEditableText sectionId={sectionId} field="title" value={title} tag="h2">
                  <h2 className="ph01gl-title">{title}</h2>
                </GenericEditableText>
              )}
            </div>
          )}
          <div className="ph01gl-grid">
            {images.map((img, i) => (
              <div key={i} className="ph01gl-cell" onClick={() => setLightbox(i)}>
                <GenericEditableImage sectionId={sectionId} field={`images.${i}.url`} src={img.url} alt={img.alt}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img.url} alt={img.alt} loading={i < 6 ? "eager" : "lazy"} />
                </GenericEditableImage>
              </div>
            ))}
          </div>
        </div>
      </section>

      {lightbox !== null && (
        <div className="ph01gl-lb" onClick={() => setLightbox(null)}>
          <button className="ph01gl-lb-close" onClick={() => setLightbox(null)}>×</button>
          <button className="ph01gl-lb-arrow left"  onClick={e => { e.stopPropagation(); prev(); }}>‹</button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img loading="lazy" src={images[lightbox]?.url} alt={images[lightbox]?.alt ?? ""} className="ph01gl-lb-img" onClick={e => e.stopPropagation()} />
          <button className="ph01gl-lb-arrow right" onClick={e => { e.stopPropagation(); next(); }}>›</button>
        </div>
      )}
    </>
  );
}

// ── events-01-gallery ─────────────────────────────────────────────────────────
function GalleryEvents01({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const GOLD = "#d4b896";
  const eyebrow = String(content.eyebrow ?? "Vybrané projekty");
  const title   = String(content.title   ?? "Portfolio akcí");
  const images  = (content.images as Array<{ url: string; alt: string; caption?: string; label?: string }>) ?? [];
  return (
    <>
      <style>{`
        .ev01gal { padding: 120px 40px; background: #0f0f0f; }
        .ev01gal-inner { max-width: 1280px; margin: 0 auto; }
        .ev01gal-head { text-align: center; margin-bottom: 80px; }
        .ev01gal-eyebrow { color: ${GOLD}; font-family: 'Inter', sans-serif; font-size: 13px; letter-spacing: 6px; text-transform: uppercase; display: block; margin-bottom: 16px; }
        .ev01gal-h2 { font-family: 'Playfair Display', Georgia, serif; font-size: clamp(32px,3.5vw,48px); font-weight: 300; margin: 0; color: #fff; letter-spacing: -0.5px; }
        .ev01gal-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 16px; }
        .ev01gal-card { position: relative; aspect-ratio: 4/3; overflow: hidden; cursor: pointer; background: #1a1a1a; }
        .ev01gal-card img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.4s; }
        .ev01gal-card:hover img { transform: scale(1.03); }
        .ev01gal-overlay { position: absolute; inset: 0; background: linear-gradient(to top, rgba(0,0,0,0.9) 0%, transparent 60%); display: flex; align-items: flex-end; padding: 24px; }
        .ev01gal-overlay h4 { color: #fff; font-family: 'Playfair Display', Georgia, serif; font-size: 18px; font-weight: 500; margin: 0; }
        .ev01gal-overlay span { color: ${GOLD}; font-family: 'Inter', sans-serif; font-size: 11px; letter-spacing: 2px; text-transform: uppercase; display: block; margin-bottom: 4px; }
        @media (max-width: 900px) { .ev01gal { padding: 80px 24px; } .ev01gal-grid { grid-template-columns: repeat(2,1fr); } }
        @media (max-width: 480px) { .ev01gal-grid { grid-template-columns: 1fr; } }
      `}</style>
      <section className="ev01gal" id="portfolio" data-template="events-01-gallery">
        <div className="ev01gal-inner">
          <div className="ev01gal-head">
            <GenericEditableText sectionId={sectionId} field="eyebrow" value={eyebrow} tag="span"><span className="ev01gal-eyebrow">{eyebrow}</span></GenericEditableText>
            <GenericEditableText sectionId={sectionId} field="title" value={title} tag="h2"><h2 className="ev01gal-h2">{title}</h2></GenericEditableText>
          </div>
          <div className="ev01gal-grid">
            {images.map((img, i) => (
              <div className="ev01gal-card" key={i}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img.url} alt={img.alt} loading="lazy" />
                <div className="ev01gal-overlay">
                  <div>
                    {img.label && (
                      <GenericEditableText sectionId={sectionId} field={`images.${i}.label`} value={img.label} tag="span">
                        <span>{img.label}</span>
                      </GenericEditableText>
                    )}
                    <GenericEditableText sectionId={sectionId} field={`images.${i}.caption`} value={img.caption ?? img.alt} tag="h4">
                      <h4>{img.caption ?? img.alt}</h4>
                    </GenericEditableText>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

// ── restaurant-04-gallery ─────────────────────────────────────────────────────
// Tmavé pozadí #0d1f0a, header (kicker + H2 + CTA),
// 4-col masonry-style grid, červený hover overlay + zoom, lightbox.
// ─────────────────────────────────────────────────────────────────────────────
function GalleryRestaurant04({ content, sectionId, tenantSlug, isAdmin }: { content: Record<string, unknown>; sectionId: number; tenantSlug?: string; isAdmin?: boolean }) {
  const tagline = String(content.tagline ?? "Jak to u nás vypadá?");
  const title   = String(content.title   ?? "Prostředí\na atmosféra.");
  const ctaText = String(content.ctaText ?? "Celá galerie");
  const ctaHref = String(content.ctaHref ?? "/galerie");
  const images  = (content.images as Array<{ url: string; alt?: string }>) ?? [];

  const DARK  = "#0d1f0a";
  const RED   = "#c41c1c";
  const CREAM = "#f5f0e8";
  const MUTED = "#8fa889";
  const SERIF = "'Fraunces', Georgia, 'Times New Roman', serif";
  const SANS  = "'Nunito Sans', 'Helvetica Neue', Arial, sans-serif";

  const [lightbox, setLightbox] = useState<number | null>(null);
  const [hovIdx, setHovIdx]     = useState<number | null>(null);

  const resolve = (href: string) => {
    if (!href.startsWith("/")) return href;
    if (!tenantSlug) return href;
    return isAdmin ? `/demo/${tenantSlug}/admin/page${href}` : `/demo/${tenantSlug}${href}`;
  };

  const close = () => setLightbox(null);
  const prev  = () => setLightbox(i => (i !== null ? (i - 1 + images.length) % images.length : null));
  const next  = () => setLightbox(i => (i !== null ? (i + 1) % images.length : null));

  return (
    <section id="galerie" style={{ background: DARK, padding: "clamp(64px, 10vw, 120px) clamp(24px, 6vw, 80px)" }}>
      {/* Header */}
      <div style={{
        maxWidth: 1180, margin: "0 auto 48px",
        display: "flex", flexWrap: "wrap", gap: 24,
        alignItems: "flex-end", justifyContent: "space-between",
      }}>
        <div>
          <p style={{
            fontFamily: SANS, fontSize: 11, fontWeight: 700,
            letterSpacing: "0.22em", textTransform: "uppercase",
            color: RED, margin: "0 0 16px",
          }}>
            <GenericEditableText sectionId={sectionId} field="tagline" value={tagline} tag="span" />
          </p>
          <h2 style={{
            fontFamily: SERIF, fontSize: "clamp(28px, 4vw, 50px)", fontWeight: 400,
            fontStyle: "italic", color: CREAM, margin: 0, lineHeight: 1.12,
            whiteSpace: "pre-line",
          }}>
            <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
          </h2>
        </div>
        {ctaText && ctaHref && (
          <a
            href={resolve(ctaHref)}
            data-btn="primary"
            style={{
              display: "inline-block", fontFamily: SANS, fontSize: 11, fontWeight: 700,
              letterSpacing: "0.14em", textTransform: "uppercase",
              color: CREAM, textDecoration: "none",
              padding: "13px 28px", border: `1px solid ${RED}`, borderRadius: 2,
              transition: "background-color 0.2s",
              flexShrink: 0,
            }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = RED)}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = "transparent")}
          >
            <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
          </a>
        )}
      </div>

      {/* Grid */}
      <div style={{
        maxWidth: 1180, margin: "0 auto",
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: 8,
      }} className="r04-gal-grid">
        {images.map((img, i) => (
          <div
            key={i}
            onClick={() => setLightbox(i)}
            onMouseEnter={() => setHovIdx(i)}
            onMouseLeave={() => setHovIdx(null)}
            style={{
              position: "relative", overflow: "hidden",
              aspectRatio: "4/3",
              cursor: "zoom-in",
              borderRadius: 2,
            }}
          >
            <img
              src={img.url}
              alt={img.alt ?? ""}
              style={{
                width: "100%", height: "100%", objectFit: "cover", display: "block",
                transition: "transform 0.5s ease",
                transform: hovIdx === i ? "scale(1.07)" : "scale(1)",
              }}
            />
            {/* Red overlay on hover */}
            <div style={{
              position: "absolute", inset: 0,
              background: `rgba(196,28,28,${hovIdx === i ? "0.35" : "0"})`,
              transition: "background 0.35s",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              {hovIdx === i && (
                <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                  <circle cx="14" cy="14" r="13" stroke={CREAM} strokeWidth="1.5"/>
                  <path d="M10 14h8M14 10v8" stroke={CREAM} strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox */}
      {lightbox !== null && (
        <div
          onClick={close}
          style={{
            position: "fixed", inset: 0, zIndex: 9999,
            background: "rgba(0,0,0,0.92)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          {/* Prev */}
          <button
            onClick={e => { e.stopPropagation(); prev(); }}
            style={{
              position: "absolute", left: 24, top: "50%", transform: "translateY(-50%)",
              background: "rgba(0,0,0,0.5)", border: `1px solid ${CREAM}44`,
              borderRadius: "50%", width: 48, height: 48,
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", color: CREAM,
            }}
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M11 4L6 9L11 14" stroke={CREAM} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          {/* Image */}
          <img
            src={images[lightbox]?.url}
            alt={images[lightbox]?.alt ?? ""}
            onClick={e => e.stopPropagation()}
            style={{
              maxWidth: "90vw", maxHeight: "88vh",
              objectFit: "contain", borderRadius: 2,
            }}
          />
          {/* Next */}
          <button
            onClick={e => { e.stopPropagation(); next(); }}
            style={{
              position: "absolute", right: 24, top: "50%", transform: "translateY(-50%)",
              background: "rgba(0,0,0,0.5)", border: `1px solid ${CREAM}44`,
              borderRadius: "50%", width: 48, height: 48,
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", color: CREAM,
            }}
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M7 4L12 9L7 14" stroke={CREAM} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          {/* Close */}
          <button
            onClick={close}
            style={{
              position: "absolute", top: 20, right: 20,
              background: "none", border: "none",
              color: CREAM, fontSize: 32, cursor: "pointer", lineHeight: 1,
            }}
          >×</button>
          {/* Counter */}
          <p style={{
            position: "absolute", bottom: 20, left: "50%", transform: "translateX(-50%)",
            fontFamily: SANS, fontSize: 12, color: `${CREAM}88`, margin: 0,
            letterSpacing: "0.1em",
          }}>
            {lightbox + 1} / {images.length}
          </p>
        </div>
      )}

      <style>{`
        @media (max-width: 900px) { .r04-gal-grid { grid-template-columns: repeat(2, 1fr) !important; } }
        @media (max-width: 500px) { .r04-gal-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </section>
  );
}

/* ─────────────────────────────────────────────
   video-01-gallery  — 1:1 honzakamenar.cz
   White bg, centered H2 + subtitle, 2×3 grid
   Each card: landscape image + couple + location
   + italic tags row + hover dark overlay
   CTA "Celé portfolio" below grid
───────────────────────────────────────────── */
function GalleryVideo01({ content, sectionId, isAdmin }: {
  content: Record<string, unknown>;
  sectionId: string;
  isAdmin: boolean;
}) {
  const c = content as {
    eyebrow?: string; title?: string; subtitle?: string;
    ctaText?: string; ctaHref?: string;
    items?: { url: string; alt: string; couple: string; location: string; tags: string }[];
  };
  const title    = c.title    ?? "Šest svateb, šest příběhů";
  const subtitle = c.subtitle ?? "Každý pár je jiný. Každý příběh je autentický.";
  const ctaText  = c.ctaText  ?? "Celé portfolio";
  const ctaHref  = c.ctaHref  ?? "#kontakt";
  const items    = c.items    ?? [];

  return (
    <section id={sectionId} style={{ background: "#fff" }}>
      <style>{`
        .vd01gl-section {
          max-width: 980px;
          margin: 0 auto;
          padding: 80px 24px 88px;
        }
        .vd01gl-header {
          text-align: center;
          margin-bottom: 52px;
        }
        .vd01gl-title {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: 36px;
          font-weight: 500;
          color: #2E2A28;
          margin: 0 0 14px;
          line-height: 1.2;
        }
        .vd01gl-subtitle {
          font-family: 'Inter', system-ui, sans-serif;
          font-size: 16px;
          font-weight: 300;
          color: #7a736d;
          margin: 0;
        }
        .vd01gl-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 28px;
        }
        .vd01gl-card {
          display: block;
          text-decoration: none;
          cursor: default;
        }
        .vd01gl-thumb {
          position: relative;
          width: 100%;
          aspect-ratio: 16 / 10;
          overflow: hidden;
          background: #e8e0d8;
        }
        .vd01gl-thumb img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          transition: transform 0.45s ease;
        }
        .vd01gl-card:hover .vd01gl-thumb img { transform: scale(1.04); }
        .vd01gl-thumb-overlay {
          position: absolute;
          inset: 0;
          background: rgba(46,42,40,0);
          transition: background 0.35s;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .vd01gl-card:hover .vd01gl-thumb-overlay { background: rgba(46,42,40,0.35); }
        .vd01gl-info {
          padding: 14px 0 0;
        }
        .vd01gl-couple {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: 18px;
          font-weight: 500;
          color: #2E2A28;
          margin: 0 0 4px;
        }
        .vd01gl-location {
          font-family: 'Inter', system-ui, sans-serif;
          font-size: 13px;
          font-weight: 400;
          color: #7a736d;
          margin: 0 0 6px;
        }
        .vd01gl-tags {
          font-family: 'Inter', system-ui, sans-serif;
          font-size: 12px;
          font-weight: 300;
          font-style: italic;
          color: #C49A6C;
          margin: 0;
        }
        .vd01gl-footer {
          text-align: center;
          margin-top: 52px;
        }
        .vd01gl-cta {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          font-family: 'Inter', system-ui, sans-serif;
          font-size: 13px;
          font-weight: 400;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #2E2A28;
          text-decoration: none;
          border: 1px solid #2E2A28;
          padding: 14px 36px;
          transition: background 0.2s, color 0.2s;
        }
        .vd01gl-cta:hover { background: #2E2A28; color: #fff; }
        @media (max-width: 640px) {
          .vd01gl-grid  { grid-template-columns: 1fr; gap: 20px; }
          .vd01gl-title { font-size: 26px; }
          .vd01gl-section { padding: 52px 20px 60px; }
        }
      `}</style>

      <div className="vd01gl-section">
        <div className="vd01gl-header">
          <h2 className="vd01gl-title">
            {isAdmin ? <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" /> : title}
          </h2>
          <p className="vd01gl-subtitle">
            {isAdmin ? <GenericEditableText sectionId={sectionId} field="subtitle" value={subtitle} tag="span" /> : subtitle}
          </p>
        </div>

        <div className="vd01gl-grid">
          {items.map((item, i) => (
            <div key={i} className="vd01gl-card">
              <div className="vd01gl-thumb">
                {isAdmin
                  ? <GenericEditableImage sectionId={sectionId} field={`items.${i}.url`} src={item.url} alt={item.alt}><img src={item.url} alt={item.alt} loading="lazy" /></GenericEditableImage>
                  : <img src={item.url} alt={item.alt} loading="lazy" />}
                <div className="vd01gl-thumb-overlay" />
              </div>
              <div className="vd01gl-info">
                <p className="vd01gl-couple">
                  {isAdmin ? <GenericEditableText sectionId={sectionId} field={`items.${i}.couple`} value={item.couple} tag="span" /> : item.couple}
                </p>
                <p className="vd01gl-location">
                  {isAdmin ? <GenericEditableText sectionId={sectionId} field={`items.${i}.location`} value={item.location} tag="span" /> : item.location}
                </p>
                <p className="vd01gl-tags">
                  {isAdmin ? <GenericEditableText sectionId={sectionId} field={`items.${i}.tags`} value={item.tags} tag="span" /> : item.tags}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="vd01gl-footer">
          <a href={ctaHref} data-btn="primary" className="vd01gl-cta">
            {isAdmin ? <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" /> : ctaText}
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </a>
        </div>
      </div>
    </section>
  );
}

// ── barber-dark gallery ───────────────────────────────────────────────────────
// Tmavé pozadí #0a0a0a, 3-col asymetrický grid s hover gold overlay + lightbox.
// Kicker "Galerie" + velký bílý titulek centered nad gridem.
// Každá 3. fotka je "tall" (rowSpan 2) pro dynamičnost.
// ─────────────────────────────────────────────────────────────────────────────
function GalleryBarberDark({
  content, sectionId, images, rawArray, activeImage, setActiveImage,
}: {
  content: Record<string, unknown>;
  sectionId: number;
  images: GalleryImage[];
  rawArray: unknown[];
  activeImage: GalleryImage | null;
  setActiveImage: (img: GalleryImage | null) => void;
}) {
  const title = String(content.title ?? "Naše práce");

  const GOLD   = "#C9A84C";
  const BG     = "#0a0a0a";
  const SERIF  = "var(--font-heading, Playfair Display, serif)";
  const SANS   = "var(--font-body, Inter, sans-serif)";

  return (
    <section style={{ backgroundColor: BG, padding: "clamp(56px, 10vw, 100px) 24px" }} data-template="barber-01">
      <style>{`
        .bc-gallery-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          grid-auto-rows: 280px;
          gap: 6px;
          max-width: 1200px;
          margin: 0 auto;
        }
        .bc-gallery-item { position: relative; overflow: hidden; cursor: zoom-in; }
        .bc-gallery-item.tall { grid-row: span 2; }
        .bc-gallery-item img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.5s ease; }
        .bc-gallery-item:hover img { transform: scale(1.06); }
        .bc-gallery-overlay {
          position: absolute; inset: 0;
          background: linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 60%);
          opacity: 0; transition: opacity 0.3s;
          display: flex; align-items: flex-end; padding: 20px;
        }
        .bc-gallery-item:hover .bc-gallery-overlay { opacity: 1; }
        .bc-gallery-overlay-line { width: 32px; height: 2px; background: ${GOLD}; }
        .bc-gallery-lightbox {
          position: fixed; inset: 0; z-index: 1000;
          background: rgba(0,0,0,0.93);
          display: flex; align-items: center; justify-content: center;
          cursor: pointer;
        }
        .bc-gallery-lightbox img { max-width: 90vw; max-height: 88vh; object-fit: contain; cursor: default; }
        .bc-gallery-lb-close {
          position: absolute; top: 20px; right: 24px;
          color: #fff; font-size: 28px; background: none; border: none; cursor: pointer;
          line-height: 1; opacity: 0.7; transition: opacity 0.2s;
        }
        .bc-gallery-lb-close:hover { opacity: 1; color: ${GOLD}; }
        @media (max-width: 768px) {
          .bc-gallery-grid { grid-template-columns: repeat(2, 1fr); grid-auto-rows: 200px; }
          .bc-gallery-item.tall { grid-row: span 1; }
        }
        @media (max-width: 480px) {
          .bc-gallery-grid { grid-template-columns: 1fr; grid-auto-rows: 260px; }
        }
      `}</style>

      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: "clamp(36px, 6vw, 56px)" }}>
        <p style={{ fontFamily: SANS, fontSize: 10, fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase", color: GOLD, margin: "0 0 16px" }}>
          Galerie
        </p>
        <h2 style={{ fontFamily: SERIF, fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 700, color: "#F5F5F5", margin: 0, lineHeight: 1.1 }}>
          <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
        </h2>
        <div style={{ width: 48, height: 2, backgroundColor: GOLD, margin: "20px auto 0" }} />
      </div>

      {/* Grid */}
      <div className="bc-gallery-grid">
        {images.map((img, i) => {
          const isTall = i % 5 === 2;
          return (
            <div
              key={i}
              className={`bc-gallery-item${isTall ? " tall" : ""}`}
              onClick={() => setActiveImage(img)}
            >
              <GenericEditableImage
                sectionId={sectionId}
                field={typeof rawArray[i] === "string" ? `images.${i}` : `images.${i}.url`}
                src={img.url!}
                alt={img.alt ?? `Foto ${i + 1}`}
                className="absolute inset-0 w-full h-full"
                style={{ position: "absolute" }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img.url!} alt={img.alt ?? `Foto ${i + 1}`} loading="lazy" />
              </GenericEditableImage>
              <div className="bc-gallery-overlay">
                <div className="bc-gallery-overlay-line" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Lightbox */}
      {activeImage && (
        <div className="bc-gallery-lightbox" onClick={() => setActiveImage(null)}>
          <button className="bc-gallery-lb-close" onClick={() => setActiveImage(null)} aria-label="Zavřít">✕</button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={activeImage.fullUrl || activeImage.url}
            alt={activeImage.alt ?? ""}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </section>
  );
}
