"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import { GenericEditableText } from "@/components/tenant/GenericEditableText";
import { GenericEditableImage } from "@/components/tenant/GenericEditableImage";
import { shouldSkipNextImageOptimization } from "@/lib/image-source";

function resolveDemoHref(href: string, tenantSlug?: string, isAdmin = false) {
  if (isAdmin) return "#";
  if (!href || href === "#") return "#";
  if (href.startsWith("http") || href.startsWith("mailto:") || href.startsWith("tel:")) return href;
  const slug = tenantSlug ?? "";
  if (href.startsWith("#")) return href;
  const clean = href.startsWith("/") ? href : `/${href}`;
  if (clean.startsWith("/demo/")) return clean;
  return slug ? `/demo/${slug}${clean}` : clean;
}

function resolveNavHref(href: string, siteMode: string, tenantSlug?: string, isAdmin = false) {
  if (siteMode === "onepage") {
    if (href.startsWith("/#")) return resolveDemoHref("/", tenantSlug, isAdmin) + href.slice(1);
    if (href === "/" || href.startsWith("http") || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) return resolveDemoHref(href, tenantSlug, isAdmin);
    const slug = href.replace(/^\//, "");
    return resolveDemoHref("/", tenantSlug, isAdmin) + "#" + slug;
  }
  if (href.startsWith("/#")) return resolveDemoHref("/" + href.slice(2), tenantSlug, isAdmin);
  return resolveDemoHref(href, tenantSlug, isAdmin);
}

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

  if (variant === "orbit-01-integrations") return <IntegrationsOrbit01 content={content} sectionId={sectionId} />;
  if (variant === "signal-01-cases") return <CasesSignal01 content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;
  if (variant === "proof-01-beforeafter") return <BeforeAfterProof01 content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;
  if (variant === "gallery-universal") {
    return <GalleryUniversal
      content={content}
      sectionId={sectionId}
      images={images}
      rawArray={rawArray}
      activeImage={activeImage}
      setActiveImage={setActiveImage}
    />;
  }

  if (variant === "arch-01-projects")  return <GalleryArch01Projects  content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;
  if (variant === "arch-01-interiors") return <GalleryArch01Interiors content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;
  if (variant === "arch-01-awards")    return <GalleryArch01Awards    content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;
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
    return <GalleryTattoo02 content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;
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
    return <GalleryFitness02 content={content} sectionId={sectionId} images={images} isAdmin={isAdmin} />;
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

  if (variant === "four-col" || variant === "four-col-contained") return <GalleryFourCol content={content} variant={variant} images={images} rawArray={rawArray} activeImage={activeImage} setActiveImage={setActiveImage} sectionId={sectionId} />;

  if (variant === "barber-04-gallery") return <GalleryBarber04 content={content} images={images} rawArray={rawArray} activeImage={activeImage} setActiveImage={setActiveImage} sectionId={sectionId} />;

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
function Massage01GalleryInsta({
  content,
  sectionId,
  images,
}: {
  content: Record<string, unknown>;
  sectionId: number;
  images: GalleryImage[];
}) {
  const sectionTag      = String(content.sectionTag      ?? "Galerie");
  const heading         = String(content.heading         ?? "Naše prostředí");
  const subtitle        = String(content.subtitle        ?? "");
  const instagramHandle = String(content.instagramHandle ?? "@harmonie.masaze");
  const instagramUrl    = String(content.instagramUrl    ?? "#");
  const ctaLabel        = String(content.ctaLabel        ?? "Sledovat na Instagramu");

  const padded = images.length === 0
    ? Array(8).fill({ url: "", alt: "" })
    : Array.from({ length: 8 }, (_, i) => images[i % images.length]);

  const showHeader = !!(sectionTag.trim() || heading.trim() || subtitle.trim());

  return (
    <section id="galerie" className="m01-gal" data-template="massage-01">
      <div className="m01-gal-inner">
        {showHeader && (
          <header className="m01-gal-header">
            <p className="m01-hero-tag">
              <span className="m01-hero-tag-dot" />
              <GenericEditableText sectionId={sectionId} field="sectionTag" value={sectionTag} tag="span" />
            </p>
            <h2 className="m01-gal-title">
              <GenericEditableText sectionId={sectionId} field="heading" value={heading} tag="span" />
            </h2>
            {subtitle.trim() && (
              <p className="m01-gal-sub">
                <GenericEditableText sectionId={sectionId} field="subtitle" value={subtitle} tag="span" />
              </p>
            )}
          </header>
        )}

        <div className="m01-gal-grid">
          {padded.map((img, i) => (
            <div key={i} className="m01-gal-cell">
              <GenericEditableImage sectionId={sectionId} field={`galleryImage_${i}`} src={img.url} className="m01-gal-img-wrap">
                {img.url ? (
                  <Image src={img.url} alt={img.alt ?? `Gallery ${i + 1}`} fill className="m01-gal-img" sizes="(max-width: 900px) 50vw, 25vw" unoptimized={shouldSkipNextImageOptimization(img.url)} />
                ) : (
                  <div style={{ width: "100%", height: "100%", background: "#1A1A1A" }} />
                )}
              </GenericEditableImage>
              <div className="m01-gal-bracket" />
            </div>
          ))}
        </div>

        <div className="m01-gal-cta-wrap">
          <a
            href={instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="m01-hero-cta m01-gal-cta"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
              <circle cx="12" cy="12" r="4"/>
              <circle cx="17.5" cy="6.5" r=".5" fill="currentColor"/>
            </svg>
            <GenericEditableText sectionId={sectionId} field="ctaLabel" value={ctaLabel} tag="span" />
          </a>
        </div>
      </div>
    </section>
  );
}

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
  const eyebrow = String(content.eyebrow ?? "Portfolio");
  const [activeImage, setActiveImage] = useState<GalleryImage | null>(null);
  const ACCENT = "#ff5c4b";

  const headerRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const [headerVis, setHeaderVis] = useState(false);
  const [gridVis, setGridVis] = useState(false);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setHeaderVis(true); obs.disconnect(); } }, { threshold: 0.3 });
    if (headerRef.current) obs.observe(headerRef.current);
    return () => obs.disconnect();
  }, []);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setGridVis(true); obs.disconnect(); } }, { threshold: 0.1 });
    if (gridRef.current) obs.observe(gridRef.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") setActiveImage(null); };
    if (activeImage) window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [activeImage]);

  return (
    <section
      id="galerie"
      data-template="tattoo-01"
      style={{ backgroundColor: "#111111" }}
    >
      <div
        ref={headerRef}
        className={`t01-gal-reveal ${headerVis ? "t01-visible" : ""}`}
        style={{ padding: "clamp(56px, 8vw, 96px) clamp(24px, 6vw, 80px) clamp(48px, 6vw, 72px)", textAlign: "center" }}
      >
        <p style={{ fontFamily: "Arial, Helvetica, sans-serif", fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.18em", color: ACCENT, margin: "0 0 16px" }}>
          <GenericEditableText sectionId={sectionId} field="eyebrow" value={eyebrow} tag="span" />
        </p>
        <div style={{ width: 48, height: 3, backgroundColor: ACCENT, margin: "0 auto 24px" }} aria-hidden />
        <h2 style={{
          fontFamily: "'Arial Black', Arial, sans-serif",
          fontSize: "clamp(1.5rem, 3vw, 2.25rem)",
          fontWeight: 900, color: "#ffffff",
          textTransform: "uppercase", letterSpacing: "0.06em", margin: 0,
        }}>
          <GenericEditableText sectionId={sectionId} field="heading" value={heading} tag="span" />
        </h2>
      </div>

      <div ref={gridRef} className="t01-gal-grid">
        {images.map((img, i) => (
          <GenericEditableImage
            key={i}
            sectionId={sectionId}
            field={typeof rawArray[i] === "string" ? `images.${i}` : `images.${i}.url`}
            src={img.url!}
            alt={img.alt || ""}
            className={`t01-gal-reveal ${gridVis ? "t01-visible" : ""}`}
            style={{ overflow: "hidden", transitionDelay: gridVis ? `${i * 0.07}s` : "0s" }}
          >
            <button
              type="button"
              className="t01-gal-tile"
              onClick={() => setActiveImage(img)}
              aria-label="Zobrazit větší obrázek"
            >
              <Image
                src={img.url!}
                alt={img.alt || ""}
                width={400}
                height={400}
                sizes="(max-width: 600px) 50vw, 25vw"
                unoptimized={shouldSkipNextImageOptimization(img.url)}
              />
              <span className="t01-gal-overlay" aria-hidden>
                <span className="t01-gal-zoom">
                  <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="15 3 21 3 21 9" />
                    <polyline points="9 21 3 21 3 15" />
                    <line x1="21" y1="3" x2="14" y2="10" />
                    <line x1="3" y1="21" x2="10" y2="14" />
                  </svg>
                  <span className="t01-gal-rule" />
                  <span className="t01-gal-label">Zobrazit</span>
                </span>
              </span>
            </button>
          </GenericEditableImage>
        ))}
      </div>

      <div style={{ height: "clamp(48px, 7vw, 80px)" }} />

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
        .gallery-lightbox{position:fixed;inset:0;z-index:80;display:grid;place-items:center;padding:24px;border:0;background:rgba(0,0,0,0.92);cursor:pointer;}
        .gallery-lightbox-frame{display:block;max-width:min(1100px,94vw);max-height:88vh;}
        .gallery-lightbox-frame img{display:block;max-width:100%;max-height:88vh;width:auto;height:auto;object-fit:contain;box-shadow:0 24px 80px rgba(0,0,0,0.6);}
      `}</style>
    </section>
  );
}

// ── tattoo-02-gallery ─────────────────────────────────────────────────────────
// "Shadow Ink" — Tattoo/Piercing taby, 3-col grid, tmavá sekce, gold akcenty.
// Lightbox (keyboard nav + counter), luxe SVG kurzor, gold corner brackets.
// CSS v globals (t02-gal-*). Conditional header. resolveNavHref na CTA.
// ─────────────────────────────────────────────────────────────────────────────
function GalleryTattoo02({ content, sectionId, tenantSlug, isAdmin }: {
  content: Record<string, unknown>;
  sectionId: number;
  tenantSlug?: string;
  isAdmin?: boolean;
}) {
  const c = content as Record<string, unknown>;

  const eyebrowRaw = c.eyebrow;
  const headingRaw = c.heading;
  const eyebrow = eyebrowRaw === undefined ? "Naše práce" : String(eyebrowRaw);
  const heading = headingRaw === undefined ? "Portfolio" : String(headingRaw);
  const showHeader = !!(eyebrow.trim() || heading.trim());

  const tabs    = (c.tabs as string[]) ?? ["Tattoo", "Piercing"];
  const images  = (c.images as Array<{ url: string; alt: string; tab: string }>) ?? [];
  const ctaText = String(c.ctaText ?? "Objednat konzultaci");
  const ctaHref = String(c.ctaHref ?? "/kontakt");

  const [activeTab, setActiveTab] = useState(tabs[0] ?? "Tattoo");
  const [lightbox, setLightbox] = useState<number | null>(null);
  const filtered = images.filter(img => img.tab === activeTab);

  useEffect(() => {
    if (lightbox === null) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightbox(null);
      if (e.key === "ArrowLeft")  setLightbox(v => (v === null ? null : (v - 1 + filtered.length) % filtered.length));
      if (e.key === "ArrowRight") setLightbox(v => (v === null ? null : (v + 1) % filtered.length));
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [lightbox, filtered.length]);

  const GOLD = "#BF8A1D";
  const DARK = "#111111";
  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <section id="galerie" data-template="tattoo-02" style={{ background: DARK, padding: "clamp(64px,9vw,110px) 0" }}>
      {/* Header */}
      {showHeader && (
        <div style={{ textAlign: "center", marginBottom: 44, padding: "0 24px" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 13, marginBottom: 16 }}>
            <span aria-hidden style={{ width: 32, height: 2, background: GOLD }} />
            <GenericEditableText
              sectionId={sectionId} field="eyebrow" value={eyebrow} tag="span"
              style={{ fontFamily: "var(--font-oswald), 'Oswald', sans-serif", fontSize: "0.74rem", fontWeight: 600, color: GOLD, letterSpacing: "0.24em", textTransform: "uppercase" }}
            />
            <span aria-hidden style={{ width: 32, height: 2, background: GOLD }} />
          </div>
          <h2 style={{
            fontFamily: "var(--font-oswald), 'Oswald', sans-serif",
            fontWeight: 700, fontSize: "clamp(30px,4vw,50px)",
            color: "#fff", margin: 0, lineHeight: 1.05, textTransform: "uppercase", letterSpacing: "0.02em",
          }}>
            <GenericEditableText sectionId={sectionId} field="heading" value={heading} tag="span" />
          </h2>
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: "flex", justifyContent: "center", borderBottom: "1px solid rgba(255,255,255,0.1)", maxWidth: 1200, margin: "0 auto 40px", padding: "0 24px" }}>
        {tabs.map((tab, ti) => (
          <button
            key={tab}
            className={`t02-tab${activeTab === tab ? " active" : ""}`}
            onClick={() => { setActiveTab(tab); setLightbox(null); }}
          >
            <GenericEditableText sectionId={sectionId} field={`tabs.${ti}`} value={tab} tag="span" />
          </button>
        ))}
      </div>

      {/* Grid */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 clamp(12px,3vw,32px)" }}>
        <div className="t02-gal-grid">
          {filtered.map((img, i) => (
            <div key={`${activeTab}-${i}`} className="t02-gal-cell" onClick={() => setLightbox(i)}>
              <img src={img.url} alt={img.alt} loading="lazy" />
              <span aria-hidden className="t02-gal-bracket tl" />
              <span aria-hidden className="t02-gal-bracket br" />
            </div>
          ))}
        </div>

        {/* CTA */}
        <div style={{ textAlign: "center", marginTop: 48 }}>
          <a href={resolveNavHref(ctaHref, String(c.siteMode ?? "multipage"), tenantSlug, isAdmin)} data-btn="primary" className="t02-cta" style={{ textDecoration: "none" }}>
            <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
            <svg className="t02-cta-arrow" width="16" height="10" viewBox="0 0 16 10" fill="none" aria-hidden>
              <path d="M1 5h14M10 1l5 4-5 4" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </a>
        </div>
      </div>

      {/* Lightbox */}
      {lightbox !== null && filtered[lightbox] && (
        <div className="t02-lb" onClick={() => setLightbox(null)}>
          <button className="t02-lb-btn t02-lb-close" aria-label="Zavřít" onClick={(e) => { e.stopPropagation(); setLightbox(null); }}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M4 4l12 12M16 4L4 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
          </button>
          <button className="t02-lb-btn t02-lb-prev" aria-label="Předchozí" onClick={(e) => { e.stopPropagation(); setLightbox(v => (v === null ? null : (v - 1 + filtered.length) % filtered.length)); }}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M13 4l-7 6 7 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
          <button className="t02-lb-btn t02-lb-next" aria-label="Další" onClick={(e) => { e.stopPropagation(); setLightbox(v => (v === null ? null : (v + 1) % filtered.length)); }}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M7 4l7 6-7 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
          <img src={filtered[lightbox].url} alt={filtered[lightbox].alt} onClick={(e) => e.stopPropagation()} />
          <span className="t02-lb-counter">{pad(lightbox + 1)} / {pad(filtered.length)}</span>
        </div>
      )}
    </section>
  );
}

// ── tattoo-03-gallery ─────────────────────────────────────────────────────────
// Tmavý bg + 4-col portrait mřížka — magictattoo.cz inspired
// #0A0A0E bg, H2 + červený subheading, 4-col grid s aspect-ratio 3/4
// ─────────────────────────────────────────────────────────────────────────────
function GalleryTattoo03({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const c          = content as Record<string, unknown>;
  const headingRaw    = c.heading;
  const subheadingRaw = c.subheading;
  const heading    = headingRaw    === undefined ? "Ukázky práce" : String(headingRaw);
  const subheading = subheadingRaw === undefined ? "Práce našich tatérů" : String(subheadingRaw);
  const showHeader = !!(heading.trim() || subheading.trim());
  const rawImages  = (c.images as Array<{ url: string; alt: string }>) ?? [];

  const BG     = "#0A0A0E";
  const ACCENT = "#D41515";

  const [lightbox, setLightbox] = useState<number | null>(null);
  useEffect(() => {
    if (lightbox === null) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightbox(null);
      if (e.key === "ArrowLeft")  setLightbox(v => (v === null ? null : (v - 1 + rawImages.length) % rawImages.length));
      if (e.key === "ArrowRight") setLightbox(v => (v === null ? null : (v + 1) % rawImages.length));
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [lightbox, rawImages.length]);

  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <section id="galerie" data-template="tattoo-03" style={{ backgroundColor: BG, padding: "clamp(56px,7vw,104px) clamp(20px,4vw,40px)" }}>
      <div style={{ maxWidth: 1360, margin: "0 auto" }}>
        {/* Nadpis */}
        {showHeader && (
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
              <span aria-hidden style={{ width: 30, height: 1, background: "rgba(212,21,21,0.6)" }} />
              <GenericEditableText sectionId={sectionId} field="subheading" value={subheading} tag="span" style={{
                fontFamily: "'Barlow Condensed','Oswald',sans-serif", fontSize: "0.9rem", fontWeight: 600,
                letterSpacing: "0.26em", textTransform: "uppercase", color: ACCENT,
              }} />
              <span aria-hidden style={{ width: 30, height: 1, background: "rgba(212,21,21,0.6)" }} />
            </div>
            <h2 style={{
              fontFamily: "'Bebas Neue','Oswald',sans-serif",
              fontWeight: 400,
              fontSize: "clamp(32px, 4vw, 56px)",
              color: "#ffffff", margin: 0,
              letterSpacing: "0.01em", textTransform: "uppercase", lineHeight: 1,
            }}>
              <GenericEditableText sectionId={sectionId} field="heading" value={heading} tag="span" />
            </h2>
          </div>
        )}

        {/* 4-col mřížka */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 10,
        }} className="t03-gallery-grid">
          {rawImages.map((img, i) => (
            <div
              key={i}
              className="t03-gal-cell"
              onClick={() => setLightbox(i)}
              style={{
                aspectRatio: "3/4",
                overflow: "hidden",
                backgroundColor: "#141414",
                position: "relative",
              }}
            >
              <GenericEditableImage sectionId={sectionId} field={`images.${i}.url`} src={img.url} alt={img.alt} className="w-full h-full" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
                <img
                  src={img.url}
                  alt={img.alt}
                  className="t03-gal-img"
                  style={{
                    width: "100%", height: "100%",
                    objectFit: "cover", objectPosition: "center",
                    transition: "transform 0.5s ease, filter 0.5s ease",
                  }}
                  loading="lazy"
                />
              </GenericEditableImage>
              <span aria-hidden className="t03-gal-overlay" />
              <span aria-hidden className="t03-gal-bracket" />
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      {lightbox !== null && rawImages[lightbox] && (
        <div
          onClick={() => setLightbox(null)}
          style={{
            position: "fixed", inset: 0, zIndex: 1000,
            background: "rgba(6,6,9,0.94)",
            backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)",
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: "clamp(20px,5vw,64px)",
          }}
        >
          {/* Close */}
          <button
            aria-label="Zavřít"
            onClick={(e) => { e.stopPropagation(); setLightbox(null); }}
            className="t03-lb-btn"
            style={{ position: "absolute", top: 24, right: 24, width: 46, height: 46, background: "transparent", border: "1px solid rgba(255,255,255,0.25)", color: "#fff", fontSize: "1.4rem", cursor: "pointer", lineHeight: 1 }}
          >×</button>
          {/* Prev */}
          <button
            aria-label="Předchozí"
            onClick={(e) => { e.stopPropagation(); setLightbox(v => (v === null ? null : (v - 1 + rawImages.length) % rawImages.length)); }}
            className="t03-lb-btn"
            style={{ position: "absolute", left: "clamp(12px,3vw,40px)", top: "50%", transform: "translateY(-50%)", width: 52, height: 52, background: "transparent", border: "1px solid rgba(255,255,255,0.25)", color: "#fff", fontSize: "1.5rem", cursor: "pointer" }}
          >‹</button>
          {/* Next */}
          <button
            aria-label="Další"
            onClick={(e) => { e.stopPropagation(); setLightbox(v => (v === null ? null : (v + 1) % rawImages.length)); }}
            className="t03-lb-btn"
            style={{ position: "absolute", right: "clamp(12px,3vw,40px)", top: "50%", transform: "translateY(-50%)", width: 52, height: 52, background: "transparent", border: "1px solid rgba(255,255,255,0.25)", color: "#fff", fontSize: "1.5rem", cursor: "pointer" }}
          >›</button>
          {/* Image + caption */}
          <div onClick={(e) => e.stopPropagation()} style={{ maxWidth: "min(880px, 92vw)", maxHeight: "86vh", display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={rawImages[lightbox].url} alt={rawImages[lightbox].alt} style={{ maxWidth: "100%", maxHeight: "76vh", objectFit: "contain", border: "1px solid rgba(255,255,255,0.12)" }} />
            <div style={{ display: "flex", alignItems: "center", gap: 16, fontFamily: "'Barlow Condensed','Oswald',sans-serif", letterSpacing: "0.12em", textTransform: "uppercase", fontSize: "0.85rem", color: "rgba(255,255,255,0.7)" }}>
              <span style={{ color: ACCENT, fontWeight: 700 }}>{pad(lightbox + 1)}</span>
              <span aria-hidden style={{ width: 30, height: 1, background: "rgba(255,255,255,0.3)" }} />
              <span>{pad(rawImages.length)}</span>
            </div>
          </div>
        </div>
      )}
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
  const INK   = "#3a2a25";
  const SERIF = "'Cormorant Garamond', Georgia, 'Times New Roman', serif";
  const SANS  = "'Helvetica Neue', Arial, sans-serif";

  const numberPrefix = String(content.numberPrefix ?? "(bonus)");
  const title    = String(content.title    ?? "Galerie");
  const kicker   = String(content.kicker   ?? "Naše práce v detailu");
  const lead     = String(content.lead     ?? "Výběr z podpisové kolekce — manikúra, pedikúra i originální nail design pro pravidelné klientky studia.");
  const igText   = String(content.igText   ?? "Sledujte @premiumnails.demo");
  const igHref   = String(content.igHref   ?? "https://instagram.com/premiumnails.demo");
  const zoomLabel = String(content.zoomLabel ?? "Zvětšit");

  const displayImages = images.slice(0, 6);

  const [lightbox, setLightbox] = useState<number | null>(null);
  useEffect(() => {
    if (lightbox === null) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightbox(null);
      if (e.key === "ArrowLeft") setLightbox(v => (v === null ? null : (v - 1 + displayImages.length) % displayImages.length));
      if (e.key === "ArrowRight") setLightbox(v => (v === null ? null : (v + 1) % displayImages.length));
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [lightbox, displayImages.length]);

  const bentoStyle = (i: number): React.CSSProperties => {
    if (displayImages.length >= 6) {
      // Row 1: wide hero (2 cols) + square
      // Row 2: 3 equal squares
      const bento: Record<number, React.CSSProperties> = {
        0: { gridColumn: "1 / span 2", aspectRatio: "2 / 1" },
        1: { aspectRatio: "1 / 1" },
        2: { aspectRatio: "1 / 1" },
        3: { aspectRatio: "1 / 1" },
        4: { aspectRatio: "1 / 1" },
        5: { aspectRatio: "1 / 1" },
      };
      return bento[i] ?? {};
    }
    return { aspectRatio: "3 / 4" };
  };

  return (
    <section
      id="galerie"
      data-section-type="gallery"
      data-variant="nails-02-gallery"
      data-template="nails-02"
      style={{
        backgroundColor: CREAM,
        padding: "clamp(90px, 12vw, 160px) clamp(24px, 6vw, 72px)",
        position: "relative",
      }}
    >
      {/* Section eyebrow */}
      <div
        className="n02-gal-eyebrow"
        aria-hidden="true"
        style={{
          position: "absolute",
          top: "clamp(40px, 6vw, 80px)",
          right: "clamp(24px, 6vw, 72px)",
          display: "flex",
          alignItems: "center",
          gap: 14,
          fontFamily: SANS,
          fontSize: "0.7rem",
          fontWeight: 500,
          color: TAUPE,
          letterSpacing: "0.32em",
          textTransform: "uppercase",
          opacity: 0.75,
        }}
      >
        <span>Kapitola · 04</span>
        <span style={{ display: "block", width: 42, height: 1, backgroundColor: TAUPE, opacity: 0.6 }} />
      </div>

      <div style={{ maxWidth: 1360, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ marginBottom: "clamp(64px, 8vw, 108px)", maxWidth: 720 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 40 }}>
            <span aria-hidden style={{ display: "block", width: 1, height: 32, backgroundColor: TAUPE }} />
            <span style={{
              fontFamily: SERIF,
              fontStyle: "italic",
              fontWeight: 400,
              fontSize: "clamp(1.5rem, 1.9vw, 1.9rem)",
              color: TAUPE,
              lineHeight: 1,
            }}>
              <GenericEditableText sectionId={sectionId} field="numberPrefix" value={numberPrefix} tag="span" />
            </span>
          </div>
          <h2
            style={{
              fontFamily: SERIF,
              fontStyle: "italic",
              fontWeight: 400,
              fontSize: "clamp(3.2rem, 7vw, 6.6rem)",
              lineHeight: 0.95,
              color: WINE,
              margin: 0,
              letterSpacing: "-0.015em",
            }}
          >
            <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
          </h2>
          <div aria-hidden="true" style={{ width: 88, height: 1, backgroundColor: TAUPE, margin: "48px 0 28px" }} />
          <p style={{
            fontFamily: SANS,
            fontSize: "0.76rem",
            fontWeight: 600,
            color: TAUPE,
            textTransform: "uppercase",
            letterSpacing: "0.32em",
            margin: 0,
          }}>
            <GenericEditableText sectionId={sectionId} field="kicker" value={kicker} tag="span" />
          </p>
          <p style={{
            marginTop: 24,
            fontFamily: SANS,
            fontSize: "1rem",
            fontWeight: 300,
            lineHeight: 1.8,
            color: INK,
            maxWidth: 540,
          }}>
            <GenericEditableText sectionId={sectionId} field="lead" value={lead} tag="span" />
          </p>
        </div>

        {/* Bento grid */}
        <div
          className="nails02-gallery-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
            gridAutoRows: "auto",
            gap: "clamp(14px, 1.8vw, 24px)",
          }}
        >
          {displayImages.map((img, i) => {
            const nStr = String(i + 1).padStart(2, "0");
            const gridStyle = bentoStyle(i);
            return (
              <div
                key={`g-${i}`}
                className="n02-gal-cell"
                onClick={() => setLightbox(i)}
                onKeyDown={(e) => { if (e.key === "Enter") setLightbox(i); }}
                tabIndex={0}
                role="button"
                aria-label={`Otevřít ${img.alt ?? `foto ${i + 1}`}`}
                style={{
                  position: "relative",
                  overflow: "hidden",
                  cursor: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='36' height='36' viewBox='0 0 36 36'><circle cx='18' cy='18' r='15' fill='rgba(107,63,56,0.88)' stroke='%23d4a080' stroke-width='1.2'/><path d='M11 11 L11 14.5 M11 11 L14.5 11 M25 11 L25 14.5 M25 11 L21.5 11 M11 25 L11 21.5 M11 25 L14.5 25 M25 25 L25 21.5 M25 25 L21.5 25' stroke='%23f6efe9' stroke-width='1.6' stroke-linecap='round' fill='none'/></svg>") 18 18, pointer`,
                  outline: "none",
                  ...gridStyle,
                }}
              >
                <GenericEditableImage
                  sectionId={sectionId}
                  field={`images.${i}.url`}
                  src={img.url ?? ""}
                  alt={img.alt ?? `Galerie ${i + 1}`}
                  style={{
                    position: "absolute",
                    inset: 0,
                    display: "block",
                    width: "100%",
                    height: "100%",
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={img.fullUrl || img.url || ""}
                    alt={img.alt ?? `Galerie ${i + 1}`}
                    loading="lazy"
                    className="n02-gal-img"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      display: "block",
                      transition: "transform 0.9s cubic-bezier(0.22,1,0.36,1)",
                    }}
                  />
                </GenericEditableImage>

                {/* Corner label N° */}
                <span
                  aria-hidden="true"
                  className="n02-gal-numeral"
                  style={{
                    position: "absolute",
                    top: 14,
                    left: 14,
                    zIndex: 3,
                    fontFamily: SERIF,
                    fontStyle: "italic",
                    fontWeight: 400,
                    fontSize: "1.1rem",
                    color: CREAM,
                    letterSpacing: "0.02em",
                    textShadow: "0 1px 6px rgba(0,0,0,0.4)",
                    opacity: 0.85,
                    transition: "opacity 0.4s ease",
                  }}
                >
                  N°{nStr}
                </span>

                {/* Wine hover overlay */}
                <div
                  aria-hidden="true"
                  className="n02-gal-overlay"
                  style={{
                    position: "absolute",
                    inset: 0,
                    zIndex: 2,
                    background: `linear-gradient(180deg, rgba(31,20,17,0.02) 0%, rgba(107,63,56,0.35) 100%)`,
                    opacity: 0,
                    transition: "opacity 0.45s ease",
                    pointerEvents: "none",
                    display: "flex",
                    alignItems: "flex-end",
                    justifyContent: "flex-start",
                    padding: 22,
                  }}
                >
                  <span style={{
                    fontFamily: SERIF,
                    fontStyle: "italic",
                    fontWeight: 400,
                    fontSize: "1.1rem",
                    color: CREAM,
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                  }}>
                    <GenericEditableText sectionId={sectionId} field="zoomLabel" value={zoomLabel} tag="span" />
                    <span aria-hidden="true">↗</span>
                  </span>
                </div>

                {/* Corner brackets on hover */}
                {[
                  { top: 6, left: 6, rotate: 0 },
                  { top: 6, right: 6, rotate: 90 },
                  { bottom: 6, right: 6, rotate: 180 },
                  { bottom: 6, left: 6, rotate: 270 },
                ].map(({ rotate, ...pos }, bi) => (
                  <span
                    key={`gbrk-${bi}`}
                    aria-hidden="true"
                    className="n02-gal-bracket"
                    style={{
                      position: "absolute",
                      ...pos,
                      width: 20,
                      height: 20,
                      transform: `rotate(${rotate}deg)`,
                      transformOrigin: "center",
                      pointerEvents: "none",
                      zIndex: 3,
                      opacity: 0,
                      transition: "opacity 0.45s ease",
                    }}
                  >
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <path d="M20 0 H4 A4 4 0 0 0 0 4 V20" stroke={CREAM} strokeWidth="1" fill="none"/>
                    </svg>
                  </span>
                ))}
              </div>
            );
          })}
        </div>

        {/* IG footer */}
        <div style={{
          marginTop: "clamp(48px, 6vw, 72px)",
          display: "flex",
          justifyContent: "center",
        }}>
          <a
            href={igHref}
            target="_blank"
            rel="noopener noreferrer"
            className="n02-gal-ig"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 14,
              fontFamily: SANS,
              fontSize: "0.82rem",
              fontWeight: 600,
              color: WINE,
              textTransform: "uppercase",
              letterSpacing: "0.28em",
              textDecoration: "none",
              paddingBottom: 6,
              borderBottom: `1px solid ${WINE}`,
              transition: "color 0.3s ease, border-color 0.3s ease, gap 0.3s ease",
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="3" y="3" width="18" height="18" rx="5"/>
              <circle cx="12" cy="12" r="4"/>
              <circle cx="17.5" cy="6.5" r="0.8" fill="currentColor" stroke="none"/>
            </svg>
            <GenericEditableText sectionId={sectionId} field="igText" value={igText} tag="span" />
            <span aria-hidden="true">→</span>
          </a>
        </div>
      </div>

      {/* Lightbox */}
      {lightbox !== null && displayImages[lightbox] && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setLightbox(null)}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 90,
            backgroundColor: "rgba(15,8,7,0.92)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "clamp(24px, 5vw, 80px)",
          }}
        >
          {/* Close */}
          <button
            onClick={(e) => { e.stopPropagation(); setLightbox(null); }}
            aria-label="Zavřít"
            style={{
              position: "absolute",
              top: 24, right: 24,
              background: "transparent",
              border: `1px solid ${CREAM}55`,
              color: CREAM,
              width: 44, height: 44,
              borderRadius: 999,
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><line x1="6" y1="6" x2="18" y2="18"/><line x1="18" y1="6" x2="6" y2="18"/></svg>
          </button>
          {/* Prev */}
          <button
            onClick={(e) => { e.stopPropagation(); setLightbox(v => (v === null ? null : (v - 1 + displayImages.length) % displayImages.length)); }}
            aria-label="Předchozí"
            style={{
              position: "absolute",
              left: "clamp(12px, 3vw, 40px)",
              top: "50%",
              transform: "translateY(-50%)",
              background: "transparent",
              border: `1px solid ${CREAM}55`,
              color: CREAM,
              width: 48, height: 48,
              borderRadius: 999,
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
          {/* Next */}
          <button
            onClick={(e) => { e.stopPropagation(); setLightbox(v => (v === null ? null : (v + 1) % displayImages.length)); }}
            aria-label="Další"
            style={{
              position: "absolute",
              right: "clamp(12px, 3vw, 40px)",
              top: "50%",
              transform: "translateY(-50%)",
              background: "transparent",
              border: `1px solid ${CREAM}55`,
              color: CREAM,
              width: 48, height: 48,
              borderRadius: 999,
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
          {/* Counter */}
          <div style={{
            position: "absolute",
            bottom: 28,
            left: "50%",
            transform: "translateX(-50%)",
            fontFamily: SERIF,
            fontStyle: "italic",
            fontSize: "1.1rem",
            color: TAUPE,
            letterSpacing: "0.05em",
          }}>
            N°{String(lightbox + 1).padStart(2, "0")} <span style={{ opacity: 0.55 }}>/ {String(displayImages.length).padStart(2, "0")}</span>
          </div>
          {/* Image */}
          <div onClick={(e) => e.stopPropagation()} style={{
            maxWidth: "min(1200px, 92vw)",
            maxHeight: "82vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={displayImages[lightbox].fullUrl || displayImages[lightbox].url || ""}
              alt={displayImages[lightbox].alt ?? `Galerie ${lightbox + 1}`}
              style={{ maxWidth: "100%", maxHeight: "82vh", objectFit: "contain", display: "block" }}
            />
          </div>
        </div>
      )}

      <style>{`
        .n02-gal-cell:hover .n02-gal-img { transform: scale(1.06); }
        .n02-gal-cell:hover .n02-gal-overlay { opacity: 1; }
        .n02-gal-cell:hover .n02-gal-bracket { opacity: 1; }
        .n02-gal-cell:hover .n02-gal-numeral { opacity: 0; }
        .n02-gal-ig:hover { color: ${TAUPE}; border-bottom-color: ${TAUPE}; gap: 18px; }
        @media (max-width: 900px) {
          .nails02-gallery-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .nails02-gallery-grid > .n02-gal-cell { grid-column: auto !important; grid-row: auto !important; aspect-ratio: 3 / 4 !important; }
          .n02-gal-eyebrow { display: none !important; }
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
// Reference: diamond-look.cz — Proměny sekce
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
  const ctaHref = String(content.ctaHref ?? "#kontakt");

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
            href={ctaHref}
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
  isAdmin,
}: {
  content: Record<string, unknown>;
  sectionId: number;
  images: GalleryImage[];
  isAdmin?: boolean;
}) {
  const tagline = String(content.tagline ?? "Naše studia");
  const title   = String(content.title   ?? "Moderní vybavení, přátelská atmosféra");
  const imgs    = rawImages.slice(0, 10);
  const showHeader = (content as { showHeader?: boolean }).showHeader !== false;

  const ACCENT = "#FF5500";
  const WHITE  = "#FFFFFF";
  const MUTED  = "#C3C3C3";
  const FONT_H = "'Archivo Black', sans-serif";
  const FONT_B = "'Montserrat', sans-serif";

  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);

  const closeLightbox = useCallback(() => setLightboxIdx(null), []);
  const prev = useCallback(() => setLightboxIdx(i => (i === null ? null : (i - 1 + imgs.length) % imgs.length)), [imgs.length]);
  const next = useCallback(() => setLightboxIdx(i => (i === null ? null : (i + 1) % imgs.length)), [imgs.length]);

  useEffect(() => {
    if (lightboxIdx === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeLightbox();
      else if (e.key === "ArrowLeft") prev();
      else if (e.key === "ArrowRight") next();
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [lightboxIdx, closeLightbox, prev, next]);

  return (
    <section
      id="galerie"
      className="fitness02-gallery"
      style={{ backgroundColor: "#000000", padding: "120px 0", fontFamily: FONT_B, position: "relative", overflow: "hidden" }}
      data-template="fitness-02"
      data-section="fitness-02-gallery"
    >
      <div aria-hidden="true" className="fitness02-grain" style={{ position: "absolute", inset: 0, pointerEvents: "none", opacity: 0.04, mixBlendMode: "overlay" }} />

      {showHeader && (
        <div style={{ maxWidth: 1240, margin: "0 auto", padding: "0 40px", marginBottom: 64, textAlign: "center", position: "relative", zIndex: 1 }}>
          <div className="fitness02-gallery-kicker" style={{ display: "inline-flex", alignItems: "center", gap: 16, marginBottom: 26, justifyContent: "center" }}>
            <span aria-hidden="true" style={{ display: "inline-block", width: 40, height: 2, background: ACCENT }} />
            <span style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.28em", textTransform: "uppercase", color: ACCENT, fontFamily: FONT_B }}>
              <GenericEditableText sectionId={sectionId} field="tagline" value={tagline} tag="span" />
            </span>
            <span aria-hidden="true" style={{ display: "inline-block", width: 40, height: 2, background: ACCENT }} />
          </div>
          <h2 className="fitness02-gallery-title" style={{
            fontFamily: FONT_H, fontSize: "clamp(32px, 4vw, 56px)",
            color: WHITE, textTransform: "uppercase", lineHeight: 1.1, margin: 0, letterSpacing: "-0.01em",
          }}>
            <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
          </h2>
        </div>
      )}

      {/* 5-col grid */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(5, 1fr)",
        gap: 6,
        maxWidth: 1600,
        margin: "0 auto",
        position: "relative",
        zIndex: 1,
      }} className="fitness02-gallery-grid">
        {imgs.map((img, i) => (
          <div
            key={i}
            className="fitness02-gal-item"
            role="button"
            tabIndex={0}
            aria-label={`Zvětšit ${img.alt ?? `foto ${i + 1}`}`}
            onClick={() => { if (!isAdmin) setLightboxIdx(i); }}
            onKeyDown={(e) => { if (!isAdmin && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); setLightboxIdx(i); } }}
            style={{ position: "relative", overflow: "hidden", aspectRatio: "1/1" }}
          >
            <GenericEditableImage sectionId={sectionId} field={`images.${i}.url`} src={img.url ?? ""} alt={img.alt ?? `Foto ${i + 1}`} className="relative" style={{ width: "100%", height: "100%" }}>
              <img
                src={img.url ?? ""}
                alt={img.alt ?? `Foto ${i + 1}`}
                loading="lazy"
                style={{
                  width: "100%", height: "100%", objectFit: "cover",
                  display: "block", transition: "transform 0.8s cubic-bezier(0.22,0.61,0.36,1)",
                }}
              />
            </GenericEditableImage>
            <div
              className="fitness02-gal-overlay"
              aria-hidden="true"
              style={{
                position: "absolute", inset: 0,
                background: "rgba(255,85,0,0.28)",
                opacity: 0, transition: "opacity 0.35s ease",
                pointerEvents: "none",
                mixBlendMode: "multiply",
              }}
            />
            {/* Corner bracket top-right */}
            <span aria-hidden="true" className="fitness02-gal-bracket" style={{
              position: "absolute", top: 10, right: 10, width: 28, height: 28,
              borderTop: `2px solid ${ACCENT}`, borderRight: `2px solid ${ACCENT}`,
              opacity: 0, transform: "translate(6px,-6px)",
              transition: "opacity 0.35s ease, transform 0.45s cubic-bezier(0.22,0.61,0.36,1)",
              pointerEvents: "none",
            }} />
          </div>
        ))}
      </div>

      {/* Lightbox */}
      {lightboxIdx !== null && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Náhled fotky"
          className="fitness02-lightbox"
          onClick={closeLightbox}
          style={{
            position: "fixed", inset: 0, zIndex: 300,
            background: "rgba(0,0,0,0.96)",
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: "clamp(20px, 4vw, 60px)",
            fontFamily: FONT_B,
          }}
        >
          {/* Counter top-left */}
          <div aria-live="polite" style={{
            position: "absolute", top: 24, left: 32,
            color: MUTED, fontFamily: FONT_H, fontSize: 12, letterSpacing: "0.32em", textTransform: "uppercase",
          }}>
            <span style={{ color: ACCENT }}>{String(lightboxIdx + 1).padStart(2, "0")}</span>
            <span style={{ opacity: 0.5 }}> / {String(imgs.length).padStart(2, "0")}</span>
          </div>
          {/* Close */}
          <button
            onClick={(e) => { e.stopPropagation(); closeLightbox(); }}
            aria-label="Zavřít"
            style={{
              position: "absolute", top: 20, right: 24, background: "none", border: `1px solid rgba(255,85,0,0.6)`,
              color: WHITE, width: 44, height: 44, cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              transition: "background 0.3s ease, border-color 0.3s ease",
            }}
            className="fitness02-lb-close"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="2" y1="2" x2="14" y2="14" /><line x1="14" y1="2" x2="2" y2="14" />
            </svg>
          </button>
          {/* Prev / Next */}
          <button
            onClick={(e) => { e.stopPropagation(); prev(); }}
            aria-label="Předchozí"
            className="fitness02-lb-nav"
            style={{
              position: "absolute", left: 24, top: "50%", transform: "translateY(-50%)",
              background: "none", border: `1px solid rgba(255,255,255,0.25)`, color: WHITE,
              width: 52, height: 52, cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              transition: "background 0.3s ease, border-color 0.3s ease",
            }}
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="11 14 5 9 11 4" /></svg>
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); next(); }}
            aria-label="Další"
            className="fitness02-lb-nav"
            style={{
              position: "absolute", right: 24, top: "50%", transform: "translateY(-50%)",
              background: "none", border: `1px solid rgba(255,255,255,0.25)`, color: WHITE,
              width: 52, height: 52, cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              transition: "background 0.3s ease, border-color 0.3s ease",
            }}
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="7 4 13 9 7 14" /></svg>
          </button>
          {/* Image */}
          <img
            src={imgs[lightboxIdx]?.url ?? ""}
            alt={imgs[lightboxIdx]?.alt ?? `Foto ${lightboxIdx + 1}`}
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: "min(1400px, 90vw)", maxHeight: "82vh",
              objectFit: "contain", display: "block",
              boxShadow: "0 24px 80px -20px rgba(255,85,0,0.35)",
            }}
          />
        </div>
      )}
    </section>
  );
}

// ── restaurant-03-gallery ──────────────────────────────────────────────────────
// La Casa Dorada — luxe deep-green #0c351a + gold. Ornament header, čistý
// symetrický 4-col grid s custom gold expand-corner cursorem, gold corner brackets
// reveal, gradient overlay + caption slide-up, image zoom. Sdílený lightbox
// s prev/next/counter/caption + keyboard nav. Conditional header pro /galerie.
// ─────────────────────────────────────────────────────────────────────────────
function GalleryRestaurant03({ content, sectionId, images }: { content: Record<string, unknown>; sectionId: number; images: GalleryImage[] }) {
  const id      = String(content.id      ?? "galerie");
  const taglineRaw = content.tagline;
  const titleRaw   = content.title;
  const tagline = taglineRaw === undefined ? "Atmosféra" : String(taglineRaw);
  const title   = titleRaw   === undefined ? "Nahlédněte\nk nám." : String(titleRaw);
  const showHeader = !!(tagline.trim() || title.trim());
  const ctaText = String(content.ctaText ?? "");
  const ctaHref = String(content.ctaHref ?? "/galerie");

  const BG   = "#0c351a";
  const GOLD = "#b97d26";
  const GOLD_LT = "#d4a24c";
  const WHITE = "#ffffff";
  const FONT = "Georgia, 'Times New Roman', serif";
  const SANS = "'Helvetica Neue', Helvetica, Arial, sans-serif";

  const FALLBACK_IMGS: GalleryImage[] = Array.from({ length: 8 }, (_, i) => ({
    url: `/templates/restaurant-03/gal-${i + 1}.webp`, alt: `Fotka ${i + 1}`,
  }));

  const contentImgs = normalizeImages((content as Record<string, unknown>).images);
  const pool = images.length > 0 ? images : contentImgs.length > 0 ? contentImgs : FALLBACK_IMGS;
  const displayed = pool.slice(0, 8);

  // Lightbox
  const [lbIdx, setLbIdx] = useState<number | null>(null);
  const open = lbIdx !== null;
  const close = useCallback(() => setLbIdx(null), []);
  const prev = useCallback(() => setLbIdx(i => (i === null ? i : (i - 1 + displayed.length) % displayed.length)), [displayed.length]);
  const next = useCallback(() => setLbIdx(i => (i === null ? i : (i + 1) % displayed.length)), [displayed.length]);
  useEffect(() => {
    if (!open) return;
    const h = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      else if (e.key === "ArrowLeft") prev();
      else if (e.key === "ArrowRight") next();
    };
    document.addEventListener("keydown", h);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", h); document.body.style.overflow = ""; };
  }, [open, close, prev, next]);

  const active = open ? displayed[lbIdx!] : null;
  const activeSrc = active ? (active.fullUrl || active.url || "") : "";

  return (
    <section id={id} data-template="restaurant-03" data-variant="restaurant-03-gallery" style={{ backgroundColor: BG, padding: "clamp(72px,10vw,116px) 0", fontFamily: SANS }}>
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 clamp(20px, 4vw, 48px)" }}>

        {/* Header */}
        {showHeader && (
          <div style={{ textAlign: "center", marginBottom: 50 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
              <span aria-hidden style={{ width: 34, height: 1, background: `linear-gradient(to right, ${GOLD}00, ${GOLD})` }} />
              <span aria-hidden style={{ width: 6, height: 6, background: GOLD, transform: "rotate(45deg)" }} />
              <GenericEditableText sectionId={sectionId} field="tagline" value={tagline} tag="span"
                style={{ fontFamily: SANS, fontSize: 11.5, fontWeight: 600, letterSpacing: "0.24em", textTransform: "uppercase", color: GOLD_LT }} />
              <span aria-hidden style={{ width: 6, height: 6, background: GOLD, transform: "rotate(45deg)" }} />
              <span aria-hidden style={{ width: 34, height: 1, background: `linear-gradient(to left, ${GOLD}00, ${GOLD})` }} />
            </div>
            <h2 style={{ fontFamily: FONT, fontSize: "clamp(28px, 3.6vw, 48px)", fontWeight: 400, color: WHITE, margin: 0, lineHeight: 1.16, whiteSpace: "pre-line" }}>
              <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
            </h2>
          </div>
        )}

        {/* Symetrický 4-col grid */}
        <div className="r03-gallery-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
          {displayed.map((img, i) => {
            const src = img.fullUrl || img.url || "";
            const cap = img.alt ?? `Fotka ${i + 1}`;
            return (
              <div
                key={i}
                className="r03-gallery-item"
                onClick={() => setLbIdx(i)}
                style={{ position: "relative", overflow: "hidden", aspectRatio: "3/2", borderRadius: 2 }}
              >
                <GenericEditableImage sectionId={sectionId} field={`images.${i}.url`} src={src} alt={cap} style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
                  <img
                    src={src}
                    alt={cap}
                    className="r03-gallery-img"
                    style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center", display: "block" }}
                    loading="lazy"
                  />
                </GenericEditableImage>
                {/* Gradient overlay + caption */}
                <div className="r03-gallery-overlay" aria-hidden style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(10,45,21,0.85), rgba(10,45,21,0) 55%)", opacity: 0, transition: "opacity 0.4s ease", pointerEvents: "none", display: "flex", alignItems: "flex-end", padding: 16 }}>
                  <span style={{ fontFamily: SANS, fontSize: 12, fontWeight: 500, letterSpacing: "0.08em", color: WHITE, textTransform: "uppercase", transform: "translateY(8px)", transition: "transform 0.4s ease" }} className="r03-gallery-cap">{cap}</span>
                </div>
                {/* Gold corner brackets */}
                <span aria-hidden className="r03-gallery-corner r03-gallery-corner--tl" />
                <span aria-hidden className="r03-gallery-corner r03-gallery-corner--br" />
              </div>
            );
          })}
        </div>

        {/* CTA */}
        {ctaText && (
          <div style={{ textAlign: "center", marginTop: 44 }}>
            <a
              href={ctaHref}
              data-btn="primary"
              style={{
                fontFamily: SANS, fontSize: 11.5, fontWeight: 600,
                letterSpacing: "0.16em", textTransform: "uppercase",
                color: GOLD_LT, textDecoration: "none",
                padding: "13px 34px", border: `1px solid ${GOLD}`, borderRadius: 2,
                display: "inline-flex", alignItems: "center", gap: 10,
                transition: "background-color 0.3s, color 0.3s, transform 0.3s",
              }}
              onMouseEnter={e => { e.currentTarget.style.backgroundColor = GOLD; e.currentTarget.style.color = BG; e.currentTarget.style.transform = "translateY(-2px)"; }}
              onMouseLeave={e => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = GOLD_LT; e.currentTarget.style.transform = "translateY(0)"; }}
            >
              <span aria-hidden style={{ width: 6, height: 6, background: "currentColor", transform: "rotate(45deg)" }} />
              <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
            </a>
          </div>
        )}
      </div>

      {/* Lightbox */}
      {open && active && (
        <div
          onClick={close}
          style={{ position: "fixed", inset: 0, zIndex: 3000, background: "rgba(6,24,14,0.94)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", padding: "clamp(20px,5vw,64px)" }}
        >
          {/* Counter */}
          <div style={{ position: "absolute", top: 26, left: 0, right: 0, textAlign: "center", fontFamily: FONT, fontSize: 15, letterSpacing: "0.2em", color: GOLD_LT }}>
            {String(lbIdx! + 1).padStart(2, "0")} <span style={{ opacity: 0.5 }}>/ {String(displayed.length).padStart(2, "0")}</span>
          </div>
          {/* Close */}
          <button onClick={(e) => { e.stopPropagation(); close(); }} aria-label="Zavřít" style={{ position: "absolute", top: 20, right: 24, background: "none", border: "none", color: WHITE, fontSize: 30, lineHeight: 1, cursor: "pointer", padding: 8 }}>×</button>
          {/* Prev */}
          <button onClick={(e) => { e.stopPropagation(); prev(); }} aria-label="Předchozí" className="r03-lb-nav" style={{ position: "absolute", left: "clamp(8px,3vw,32px)", top: "50%", transform: "translateY(-50%)", background: "rgba(185,125,38,0.12)", border: `1px solid ${GOLD}`, color: GOLD_LT, width: 48, height: 48, borderRadius: "50%", cursor: "pointer", fontSize: 20 }}>‹</button>
          {/* Image */}
          <figure onClick={(e) => e.stopPropagation()} style={{ margin: 0, maxWidth: "min(1000px,92vw)", maxHeight: "82vh", display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
            <img src={activeSrc} alt={active.alt ?? ""} style={{ maxWidth: "100%", maxHeight: "72vh", objectFit: "contain", display: "block", borderRadius: 2, boxShadow: "0 30px 80px rgba(0,0,0,0.6)" }} />
            {active.alt && <figcaption style={{ fontFamily: SANS, fontSize: 13, letterSpacing: "0.14em", textTransform: "uppercase", color: `${WHITE}cc` }}>{active.alt}</figcaption>}
          </figure>
          {/* Next */}
          <button onClick={(e) => { e.stopPropagation(); next(); }} aria-label="Další" className="r03-lb-nav" style={{ position: "absolute", right: "clamp(8px,3vw,32px)", top: "50%", transform: "translateY(-50%)", background: "rgba(185,125,38,0.12)", border: `1px solid ${GOLD}`, color: GOLD_LT, width: 48, height: 48, borderRadius: "50%", cursor: "pointer", fontSize: 20 }}>›</button>
        </div>
      )}

      <style>{`
        [data-template="restaurant-03"] .r03-gallery-item {
          cursor: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40'%3E%3Cg fill='none' stroke='%23d4a24c' stroke-width='1.5'%3E%3Cpath d='M4 12V4h8'/%3E%3Cpath d='M28 4h8v8'/%3E%3Cpath d='M36 28v8h-8'/%3E%3Cpath d='M12 36H4v-8'/%3E%3C/g%3E%3Ccircle cx='20' cy='20' r='1.6' fill='%23d4a24c'/%3E%3C/svg%3E") 20 20, zoom-in;
        }
        [data-template="restaurant-03"] .r03-gallery-img { transition: transform 0.7s cubic-bezier(.2,.7,.2,1); }
        [data-template="restaurant-03"] .r03-gallery-item:hover .r03-gallery-img { transform: scale(1.08); }
        [data-template="restaurant-03"] .r03-gallery-item:hover .r03-gallery-overlay { opacity: 1; }
        [data-template="restaurant-03"] .r03-gallery-item:hover .r03-gallery-cap { transform: translateY(0) !important; }
        [data-template="restaurant-03"] .r03-gallery-corner { position: absolute; width: 15px; height: 15px; opacity: 0; transition: opacity 0.4s ease, transform 0.4s ease; pointer-events: none; }
        [data-template="restaurant-03"] .r03-gallery-corner--tl { top: 11px; left: 11px; border-top: 1px solid ${GOLD_LT}; border-left: 1px solid ${GOLD_LT}; transform: translate(6px,6px); }
        [data-template="restaurant-03"] .r03-gallery-corner--br { bottom: 11px; right: 11px; border-bottom: 1px solid ${GOLD_LT}; border-right: 1px solid ${GOLD_LT}; transform: translate(-6px,-6px); }
        [data-template="restaurant-03"] .r03-gallery-item:hover .r03-gallery-corner { opacity: 1; transform: translate(0,0); }
        [data-template="restaurant-03"] .r03-lb-nav { transition: background-color 0.25s, color 0.25s; }
        [data-template="restaurant-03"] .r03-lb-nav:hover { background: ${GOLD} !important; color: ${BG} !important; }
        @media(max-width:900px){ .r03-gallery-grid{ grid-template-columns: repeat(2,1fr)!important; } }
        @media(max-width:480px){ .r03-gallery-grid{ grid-template-columns: 1fr!important; } }
      `}</style>
    </section>
  );
}

// ── cafe-03-gallery ────────────────────────────────────────────────────────────
// Cathedral Editorial Slider — luxe redesign (2026-07-02)
// Parchment bg, 2-col header (Great Vibes H2 + Cormorant kicker | Cormorant italic
// counter + gold ghost arrows), horizontální snap slider s alternujícími portrait
// (3:4) / landscape (4:3) formáty, Cormorant číslicemi, Great Vibes captiony,
// custom luxe gold magnifier cursor, lightbox s prev/next/counter, progress bar.
// ─────────────────────────────────────────────────────────────────────────────
function GalleryCafe03({ content, sectionId, images: _normalizedImages }: { content: Record<string, unknown>; sectionId: number; images: Array<{ url?: string; fullUrl?: string; alt?: string; caption?: string }> }) {
  // Read raw content.images (parent normalize strips caption + sets fullUrl="" which breaks ?? fallback)
  const rawImages = Array.isArray((content as { images?: unknown }).images) ? ((content as { images: Array<Record<string, unknown>> }).images) : [];
  const GOLD    = "#C69C60";
  const GOLD_LT = "#D8B57A";
  const GOLD_DK = "#8F6A38";
  const NOIR    = "#0d0d0d";
  const INK     = "#1a1a1a";
  const MUTED   = "#5a544a";
  const PARCH   = "#F5EFE4";
  const CREAM   = "#FBF7EF";
  const SCRIPT  = "'Great Vibes', cursive";
  const ITAL    = "'Cormorant Garamond', 'Playfair Display', Georgia, serif";
  const SANS    = "'Inter', 'Open Sans', system-ui, sans-serif";

  const id       = String(content.id       ?? "galerie");
  const eyebrow  = String(content.eyebrow  ?? "OKAMŽIKY U NÁS");
  const title    = String(content.title    ?? "Katedrální galerie");
  const kicker   = String(content.kicker   ?? "interiér · terasa · jídlo · noc");

  const defaultImages: Array<{ url: string; alt: string; caption: string; fullUrl?: string }> = [
    { url: "https://images.unsplash.com/photo-1445116572660-236099ec97a0?w=1200&h=1600&fit=crop&fm=webp&q=88", alt: "Klenutý sál",           caption: "Klenutý sál" },
    { url: "https://images.unsplash.com/photo-1559925393-8be0ec4767c8?w=1200&h=900&fit=crop&fm=webp&q=88",   alt: "Zimní zahrada",         caption: "Zimní zahrada" },
    { url: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=1200&h=1600&fit=crop&fm=webp&q=88", alt: "Ranní latte art",      caption: "Ranní latte" },
    { url: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1200&h=900&fit=crop&fm=webp&q=88",  alt: "Vinný sklep při svíčkách", caption: "Vinný sklep" },
    { url: "https://images.unsplash.com/photo-1543007630-9710e4a00a20?w=1200&h=1600&fit=crop&fm=webp&q=88",   alt: "Cappuccino",           caption: "Cappuccino" },
    { url: "https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=1200&h=900&fit=crop&fm=webp&q=88",  alt: "Sezónní talíř",         caption: "Sezónní talíř" },
    { url: "https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=1200&h=1600&fit=crop&fm=webp&q=88", alt: "Snídaňový set",        caption: "Snídaňový set" },
    { url: "https://images.unsplash.com/photo-1521017432531-fbd92d768814?w=1200&h=900&fit=crop&fm=webp&q=88",  alt: "Letní terasa",          caption: "Letní terasa" },
  ];
  const imgs: Array<{ url?: string; fullUrl?: string; alt?: string; caption?: string }> = rawImages.length > 0
    ? rawImages.map(r => ({ url: r.url as string | undefined, fullUrl: r.fullUrl as string | undefined, alt: r.alt as string | undefined, caption: r.caption as string | undefined }))
    : defaultImages;

  const trackRef = useRef<HTMLDivElement>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(true);
  const [activeIdx, setActiveIdx] = useState(0);
  const [progress, setProgress] = useState(0);
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);

  const updateState = useCallback(() => {
    const t = trackRef.current;
    if (!t) return;
    setCanPrev(t.scrollLeft > 8);
    setCanNext(t.scrollLeft < t.scrollWidth - t.clientWidth - 8);
    const maxScroll = Math.max(1, t.scrollWidth - t.clientWidth);
    setProgress(Math.min(1, t.scrollLeft / maxScroll));
    // Find nearest snap item
    const children = Array.from(t.children) as HTMLElement[];
    let nearest = 0, nearestDelta = Infinity;
    children.forEach((child, i) => {
      const delta = Math.abs(child.offsetLeft - t.scrollLeft);
      if (delta < nearestDelta) { nearestDelta = delta; nearest = i; }
    });
    setActiveIdx(nearest);
  }, []);

  useEffect(() => {
    const t = trackRef.current;
    if (!t) return;
    t.addEventListener("scroll", updateState, { passive: true });
    updateState();
    const ro = new ResizeObserver(updateState);
    ro.observe(t);
    return () => { t.removeEventListener("scroll", updateState); ro.disconnect(); };
  }, [updateState]);

  const scroll = (dir: -1 | 1) => {
    const t = trackRef.current;
    if (!t) return;
    const children = Array.from(t.children) as HTMLElement[];
    if (!children.length) return;
    const targetIdx = Math.max(0, Math.min(children.length - 1, activeIdx + dir));
    const target = children[targetIdx];
    if (target) t.scrollTo({ left: target.offsetLeft, behavior: "smooth" });
  };

  // Lightbox keyboard nav
  useEffect(() => {
    if (lightboxIdx === null) return;
    const h = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightboxIdx(null);
      else if (e.key === "ArrowLeft") setLightboxIdx(i => (i !== null && i > 0 ? i - 1 : i));
      else if (e.key === "ArrowRight") setLightboxIdx(i => (i !== null && i < imgs.length - 1 ? i + 1 : i));
    };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [lightboxIdx, imgs.length]);

  useEffect(() => {
    document.body.style.overflow = lightboxIdx !== null ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [lightboxIdx]);

  const totalPad = String(imgs.length).padStart(2, "0");
  const activePad = String(activeIdx + 1).padStart(2, "0");

  // Luxe gold magnifier cursor (SVG data URL)
  const luxCursor = `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='42' height='42' viewBox='0 0 42 42'><circle cx='18' cy='18' r='11' fill='none' stroke='%23C69C60' stroke-width='1.4'/><line x1='26' y1='26' x2='36' y2='36' stroke='%23C69C60' stroke-width='1.4' stroke-linecap='round'/><line x1='13' y1='18' x2='23' y2='18' stroke='%23C69C60' stroke-width='1.2'/><line x1='18' y1='13' x2='18' y2='23' stroke='%23C69C60' stroke-width='1.2'/></svg>") 21 21, zoom-in`;

  const ArrowBtn = ({ dir }: { dir: -1 | 1 }) => {
    const active = dir === -1 ? canPrev : canNext;
    return (
      <button
        onClick={() => scroll(dir)}
        disabled={!active}
        aria-label={dir === -1 ? "Předchozí" : "Další"}
        className="c3gal-arr"
        style={{ width: 52, height: 52, borderRadius: "50%", border: `1px solid ${active ? GOLD : `${GOLD}33`}`, background: "transparent", cursor: active ? "pointer" : "default", color: active ? GOLD_DK : `${GOLD}55`, display: "flex", alignItems: "center", justifyContent: "center", transition: "background-color 0.28s ease, color 0.28s ease, border-color 0.28s ease", flexShrink: 0 }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><polyline points={dir === -1 ? "15 18 9 12 15 6" : "9 18 15 12 9 6"}/></svg>
      </button>
    );
  };

  return (
    <section id={id} data-template="cafe-03" className="c3gal" style={{ backgroundColor: PARCH, padding: "clamp(72px, 10vw, 130px) 0", fontFamily: SANS, position: "relative", overflow: "hidden" }}>
      {/* Watermark gothic arch right */}
      <svg aria-hidden width="320" height="480" viewBox="0 0 320 480" style={{ position: "absolute", right: -80, bottom: 40, opacity: 0.05, pointerEvents: "none" }}>
        <path d="M20 460 V 200 A 140 140 0 0 1 300 200 V 460" stroke={INK} strokeWidth="1" fill="none" />
      </svg>

      <div style={{ maxWidth: 1400, margin: "0 auto", padding: "0 clamp(20px, 5vw, 60px)", position: "relative", zIndex: 1 }}>
        {/* Header 2-col */}
        <header className="c3gal-header" style={{ display: "grid", gridTemplateColumns: "1fr auto", alignItems: "end", gap: 24, marginBottom: "clamp(32px, 5vw, 56px)" }}>
          <div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 14, marginBottom: 14 }}>
              <span aria-hidden style={{ display: "inline-block", width: 32, height: 1, backgroundColor: GOLD }} />
              <GenericEditableText sectionId={sectionId} field="eyebrow" value={eyebrow} tag="span">
                <span style={{ fontFamily: SANS, fontSize: 11, fontWeight: 500, letterSpacing: "0.32em", textTransform: "uppercase", color: GOLD_DK }}>{eyebrow}</span>
              </GenericEditableText>
            </div>
            <GenericEditableText sectionId={sectionId} field="title" value={title} tag="h2">
              <h2 style={{ fontFamily: SCRIPT, fontSize: "clamp(44px, 6vw, 78px)", fontWeight: 400, color: INK, margin: 0, lineHeight: 1.05, letterSpacing: "0.005em" }}>{title}</h2>
            </GenericEditableText>
            <GenericEditableText sectionId={sectionId} field="kicker" value={kicker} tag="p">
              <p style={{ fontFamily: ITAL, fontStyle: "italic", fontSize: "clamp(15px, 1.4vw, 18px)", color: GOLD_DK, margin: "8px 0 0", letterSpacing: "0.04em" }}>— {kicker}</p>
            </GenericEditableText>
          </div>

          {/* Counter + arrows */}
          <div className="c3gal-controls" style={{ display: "flex", alignItems: "center", gap: 20, flexShrink: 0 }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
              <span style={{ fontFamily: ITAL, fontStyle: "italic", fontSize: 40, color: GOLD_DK, lineHeight: 1, minWidth: 40, textAlign: "right" }}>{activePad}</span>
              <span style={{ fontFamily: ITAL, fontStyle: "italic", fontSize: 22, color: MUTED, opacity: 0.6 }}>/{totalPad}</span>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <ArrowBtn dir={-1} />
              <ArrowBtn dir={1} />
            </div>
          </div>
        </header>
      </div>

      {/* Full-width scroll track */}
      <div
        ref={trackRef}
        className="c3gal-track"
        style={{ display: "flex", gap: 24, overflowX: "auto", scrollSnapType: "x mandatory", paddingInline: "clamp(20px, 5vw, 60px)", paddingBottom: 12 }}
      >
        {imgs.map((img, i) => {
          const isPortrait = i % 2 === 0;
          const width = isPortrait ? 380 : 560;
          const aspect = isPortrait ? "3/4" : "4/3";
          const caption = img.caption ?? img.alt ?? "";
          return (
            <div
              key={i}
              className="c3gal-slide"
              onClick={() => setLightboxIdx(i)}
              style={{ flexShrink: 0, width, scrollSnapAlign: "start", position: "relative", cursor: "pointer" }}
            >
              {/* Number */}
              <div style={{ position: "absolute", top: -8, left: 0, zIndex: 3, display: "flex", alignItems: "center", gap: 8 }}>
                <span aria-hidden style={{ display: "inline-block", width: 18, height: 1, backgroundColor: GOLD }} />
                <span style={{ fontFamily: ITAL, fontStyle: "italic", fontSize: 20, color: GOLD_DK, letterSpacing: "0.05em" }}>{String(i + 1).padStart(2, "0")}</span>
              </div>

              <div className="c3gal-imgwrap" style={{ position: "relative", aspectRatio: aspect, overflow: "hidden", backgroundColor: NOIR, cursor: luxCursor as unknown as string }}>
                <GenericEditableImage sectionId={sectionId} field={`images.${i}.url`} src={img.url ?? ""} alt={img.alt ?? ""} style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
                  <img src={img.url} alt={img.alt ?? ""} className="c3gal-img" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", transition: "transform 0.9s cubic-bezier(.25,.1,.25,1), filter 0.5s ease" }} loading="lazy" />
                </GenericEditableImage>
                {/* Bottom veil for caption */}
                <div aria-hidden className="c3gal-veil" style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: "40%", background: `linear-gradient(to top, rgba(13,13,13,0.7) 0%, transparent 100%)`, opacity: 0, transition: "opacity 0.4s ease" }} />
                {/* Caption */}
                <div className="c3gal-cap" style={{ position: "absolute", left: 20, bottom: 20, right: 20, opacity: 0, transform: "translateY(6px)", transition: "opacity 0.4s ease 0.05s, transform 0.4s ease 0.05s", zIndex: 2 }}>
                  <GenericEditableText sectionId={sectionId} field={`images.${i}.caption`} value={caption} tag="div">
                    <div style={{ fontFamily: SCRIPT, fontSize: 28, color: "#fff", lineHeight: 1.1, letterSpacing: "0.005em" }}>{caption}</div>
                  </GenericEditableText>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Progress bar */}
      <div style={{ maxWidth: 1400, margin: "18px auto 0", padding: "0 clamp(20px, 5vw, 60px)" }}>
        <div aria-hidden style={{ position: "relative", height: 1, backgroundColor: `${GOLD}33`, overflow: "hidden" }}>
          <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${Math.max(4, progress * 100)}%`, backgroundColor: GOLD, transition: "width 0.4s cubic-bezier(.4,0,.2,1)" }} />
        </div>
      </div>

      {/* Lightbox */}
      {lightboxIdx !== null && (
        <div
          onClick={() => setLightboxIdx(null)}
          style={{ position: "fixed", inset: 0, zIndex: 9999, backgroundColor: "rgba(5,5,5,0.94)", display: "flex", alignItems: "center", justifyContent: "center", padding: "80px 20px 100px", cursor: "pointer" }}
        >
          {/* Close */}
          <button
            onClick={e => { e.stopPropagation(); setLightboxIdx(null); }}
            aria-label="Zavřít"
            style={{ position: "absolute", top: 24, right: 24, width: 48, height: 48, borderRadius: "50%", border: `1px solid ${GOLD}66`, background: "transparent", color: GOLD_LT, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "background-color 0.2s, color 0.2s" }}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = GOLD; e.currentTarget.style.color = NOIR; }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = GOLD_LT; }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>

          {/* Prev */}
          {lightboxIdx > 0 && (
            <button
              onClick={e => { e.stopPropagation(); setLightboxIdx(lightboxIdx - 1); }}
              aria-label="Předchozí"
              style={{ position: "absolute", left: 24, top: "50%", transform: "translateY(-50%)", width: 52, height: 52, borderRadius: "50%", border: `1px solid ${GOLD}66`, background: "transparent", color: GOLD_LT, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
            </button>
          )}

          {/* Next */}
          {lightboxIdx < imgs.length - 1 && (
            <button
              onClick={e => { e.stopPropagation(); setLightboxIdx(lightboxIdx + 1); }}
              aria-label="Další"
              style={{ position: "absolute", right: 24, top: "50%", transform: "translateY(-50%)", width: 52, height: 52, borderRadius: "50%", border: `1px solid ${GOLD}66`, background: "transparent", color: GOLD_LT, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
            </button>
          )}

          {/* Image */}
          <div onClick={e => e.stopPropagation()} style={{ position: "relative", maxWidth: "90vw", maxHeight: "82vh", cursor: "default" }}>
            <img src={imgs[lightboxIdx].fullUrl || imgs[lightboxIdx].url || ""} alt={imgs[lightboxIdx].alt ?? ""} style={{ maxWidth: "90vw", maxHeight: "82vh", objectFit: "contain", display: "block", boxShadow: `0 40px 80px rgba(0,0,0,0.6)`, border: `1px solid ${GOLD}33` }} loading="eager" />
            {imgs[lightboxIdx].caption && (
              <div style={{ position: "absolute", left: 0, right: 0, bottom: -50, textAlign: "center" }}>
                <span style={{ fontFamily: SCRIPT, fontSize: 30, color: GOLD_LT }}>{imgs[lightboxIdx].caption}</span>
              </div>
            )}
          </div>

          {/* Counter */}
          <div style={{ position: "absolute", bottom: 24, left: "50%", transform: "translateX(-50%)", fontFamily: ITAL, fontStyle: "italic", fontSize: 18, color: GOLD_LT, letterSpacing: "0.06em" }}>
            {String(lightboxIdx + 1).padStart(2, "0")}
            <span style={{ opacity: 0.5, marginInline: 8 }}>/</span>
            {totalPad}
          </div>
        </div>
      )}

      <style>{`
        [data-template="cafe-03"].c3gal .c3gal-track { -ms-overflow-style: none; scrollbar-width: none; }
        [data-template="cafe-03"].c3gal .c3gal-track::-webkit-scrollbar { display: none; }
        [data-template="cafe-03"].c3gal .c3gal-slide:hover .c3gal-img { transform: scale(1.05); }
        [data-template="cafe-03"].c3gal .c3gal-slide:hover .c3gal-veil { opacity: 1; }
        [data-template="cafe-03"].c3gal .c3gal-slide:hover .c3gal-cap { opacity: 1 !important; transform: none !important; }
        [data-template="cafe-03"].c3gal .c3gal-arr:not(:disabled):hover { background-color: ${GOLD} !important; color: ${NOIR} !important; }
        @media (max-width: 767px) {
          [data-template="cafe-03"].c3gal .c3gal-header { grid-template-columns: 1fr !important; align-items: flex-start !important; }
          [data-template="cafe-03"].c3gal .c3gal-controls { align-self: flex-start; }
        }
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

  const taglineRaw = content.tagline;
  const titleRaw   = content.title;
  const tagline  = taglineRaw === undefined ? "Portfolio" : String(taglineRaw);
  const title    = titleRaw   === undefined ? "Naše reference" : String(titleRaw);
  const subtitle = String(content.subtitle ?? "");
  const showHeader = !!(tagline.trim() || title.trim() || subtitle.trim());
  const items    = (content.items as GalleryItem[]) ?? [];

  // collect unique categories for filter tabs
  const categories = ["Vše", ...Array.from(new Set(items.map(it => it.category).filter(Boolean) as string[]))];
  const [activeCategory, setActiveCategory] = useState("Vše");
  const [lightIdx, setLightIdx] = useState<number | null>(null);

  const filtered = activeCategory === "Vše" ? items : items.filter(it => it.category === activeCategory);

  const gridRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;
    const cells = Array.from(grid.querySelectorAll<HTMLElement>(".s01-gal-cell"));
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          const el = e.target as HTMLElement;
          el.style.animationDelay = `${Math.max(0, cells.indexOf(el)) * 0.07}s`;
          el.classList.add("s01-gal-vis");
          obs.unobserve(el);
        }
      });
    }, { threshold: 0.1 });
    cells.forEach((c) => obs.observe(c));
    return () => obs.disconnect();
  }, [filtered.length, activeCategory]);

  const closeLb = useCallback(() => setLightIdx(null), []);
  const prevLb = useCallback(() => setLightIdx((v) => (v === null ? v : (v - 1 + filtered.length) % filtered.length)), [filtered.length]);
  const nextLb = useCallback(() => setLightIdx((v) => (v === null ? v : (v + 1) % filtered.length)), [filtered.length]);
  useEffect(() => {
    if (lightIdx === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeLb();
      else if (e.key === "ArrowLeft") prevLb();
      else if (e.key === "ArrowRight") nextLb();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightIdx, closeLb, prevLb, nextLb]);

  const activeItem = lightIdx !== null ? filtered[lightIdx] : null;

  return (
    <section id={String(content.id ?? "reference")} style={{ backgroundColor: "#f8f7f4", fontFamily: FONT, padding: "clamp(64px,9vw,112px) 0" }} data-template="stavba-01">
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 32px" }}>

        {/* Header */}
        {(showHeader || categories.length > 1) && (
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: 24, marginBottom: 40 }}>
          {showHeader && (
          <div>
            {tagline.trim() && (
              <div style={{ display: "inline-flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                <span style={{ display: "block", width: 30, height: 3, backgroundColor: ORANGE, borderRadius: 2 }} />
                <GenericEditableText sectionId={sectionId} field="tagline" value={tagline} tag="p"
                  style={{ color: ORANGE, fontSize: "0.78rem", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", margin: 0 }} />
              </div>
            )}
            {title.trim() && (
              <h2 style={{ color: DARK, fontSize: "clamp(26px,3.5vw,44px)", fontWeight: 800, lineHeight: 1.1, letterSpacing: "-0.02em", margin: 0 }}>
                <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
              </h2>
            )}
            {subtitle.trim() && <p style={{ color: GRAY, fontSize: "0.95rem", margin: "12px 0 0", maxWidth: 460, lineHeight: 1.6 }}>
              <GenericEditableText sectionId={sectionId} field="subtitle" value={subtitle} tag="span" />
            </p>}
          </div>
          )}

          {/* Category filter pills */}
          {categories.length > 1 && (
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {categories.map(cat => {
                const active = activeCategory === cat;
                return (
                <button key={cat} onClick={() => setActiveCategory(cat)}
                  className={`s01-gal-pill${active ? " is-active" : ""}`}
                  style={{ padding: "8px 18px", borderRadius: 999, border: "1.5px solid", fontFamily: FONT, fontSize: "0.82rem", fontWeight: 600, cursor: "pointer",
                    backgroundColor: active ? ORANGE : "transparent",
                    borderColor: active ? ORANGE : "#d0d0d0",
                    color: active ? "#fff" : GRAY }}>
                  {cat}
                </button>
                );
              })}
            </div>
          )}
        </div>
        )}

        {/* Uniform 3-col grid — all cards same 4:3 ratio */}
        <div ref={gridRef} className="stavba-gallery-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 20 }}>
          {filtered.map((item, i) => {
            const origIdx = items.indexOf(item);
            return (
            <div key={`${item.image}-${i}`} onClick={() => setLightIdx(i)}
              className="s01-gal-cell"
              style={{ position: "relative", borderRadius: 12, overflow: "hidden", aspectRatio: "4/3", backgroundColor: "#e8e8e8" }}>
              <GenericEditableImage sectionId={sectionId} field={`items.${origIdx}.image`} src={item.image} alt={item.title} className="absolute inset-0 w-full h-full" style={{ height: "100%" }}>
                <Image src={item.image} alt={item.title} fill className="object-cover s01-gal-img"
                  sizes="(max-width:768px) 50vw, 33vw" unoptimized={shouldSkipNextImageOptimization(item.image)} />
              </GenericEditableImage>
              {/* Orange corner brackets on hover */}
              <span className="s01-gal-bracket tl" aria-hidden="true" />
              <span className="s01-gal-bracket br" aria-hidden="true" />
              {/* Bottom info bar — always visible */}
              <div className="s01-gal-info" style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "linear-gradient(to top, rgba(0,0,0,0.74) 0%, transparent 100%)", padding: "34px 16px 14px", zIndex: 1 }}>
                {item.category && (
                  <span style={{ display: "inline-block", backgroundColor: ORANGE, color: "#fff", fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", padding: "2px 8px", borderRadius: 4, marginBottom: 6 }}>
                    <GenericEditableText sectionId={sectionId} field={`items.${origIdx}.category`} value={item.category} tag="span" />
                  </span>
                )}
                <div style={{ color: "#fff", fontSize: "0.9rem", fontWeight: 600, lineHeight: 1.3 }}>
                  <GenericEditableText sectionId={sectionId} field={`items.${origIdx}.title`} value={item.title} tag="span" />
                </div>
              </div>
            </div>
            );
          })}
        </div>

      </div>

      {/* Lightbox with prev/next/counter/caption */}
      {activeItem && lightIdx !== null && (
        <div onClick={closeLb} style={{ position: "fixed", inset: 0, backgroundColor: "rgba(12,10,8,0.94)", backdropFilter: "blur(4px)", WebkitBackdropFilter: "blur(4px)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", zIndex: 9999, padding: "72px 24px" }}>
          <button onClick={closeLb} aria-label="Zavřít" style={{ position: "absolute", top: 20, right: 24, background: "rgba(255,255,255,0.12)", border: "none", cursor: "pointer", color: "#fff", width: 44, height: 44, borderRadius: "50%", fontSize: 20, display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
          {filtered.length > 1 && (
            <button onClick={(e) => { e.stopPropagation(); prevLb(); }} aria-label="Předchozí" className="s01-glb-nav" style={{ position: "absolute", left: "clamp(12px,3vw,40px)", top: "50%", transform: "translateY(-50%)", background: "rgba(255,255,255,0.12)", border: "none", cursor: "pointer", color: "#fff", width: 48, height: 48, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1 }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m15 18-6-6 6-6"/></svg>
            </button>
          )}
          <img loading="lazy" src={activeItem.image} alt={activeItem.title} onClick={(e) => e.stopPropagation()} style={{ maxWidth: "min(1100px,90vw)", maxHeight: "78vh", objectFit: "contain", borderRadius: 8, boxShadow: "0 24px 60px rgba(0,0,0,0.5)" }} />
          {filtered.length > 1 && (
            <button onClick={(e) => { e.stopPropagation(); nextLb(); }} aria-label="Další" className="s01-glb-nav" style={{ position: "absolute", right: "clamp(12px,3vw,40px)", top: "50%", transform: "translateY(-50%)", background: "rgba(255,255,255,0.12)", border: "none", cursor: "pointer", color: "#fff", width: 48, height: 48, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1 }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m9 18 6-6-6-6"/></svg>
            </button>
          )}
          {/* Caption + counter */}
          <div onClick={(e) => e.stopPropagation()} style={{ marginTop: 20, textAlign: "center", color: "#fff", fontFamily: FONT }}>
            {activeItem.category && <div style={{ color: ORANGE, fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 4 }}>{activeItem.category}</div>}
            <div style={{ fontSize: "1rem", fontWeight: 600 }}>{activeItem.title}</div>
            <div style={{ marginTop: 8, fontSize: "0.8rem", color: "rgba(255,255,255,0.55)", fontVariantNumeric: "tabular-nums", letterSpacing: "0.08em" }}>
              {String(lightIdx + 1).padStart(2, "0")} / {String(filtered.length).padStart(2, "0")}
            </div>
          </div>
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
// Botanical Atelier Editorial mosaic:
// - Warm ivory bg, editorial header (moss eyebrow + Georgia italic H2 + Inter subtitle)
// - 5 unequal cells v magazine mosaic gridu (large hero-left + 2 stacked right + 2 bottom wide)
// - Cell: image + moss overlay (opacity 0→38 on hover) + Georgia italic "01" number badge
//   + label chip warm ivory s italic name + slide-in arrow → + olive-gold corner brackets on hover
// - Custom luxe cursor (sprig) na cells, bottom hairline + "Zobrazit celý katalog →" CTA link
function GalleryFlorist01Collections({ content, sectionId, tenantSlug, isAdmin }: { content: Record<string, unknown>; sectionId: number; tenantSlug?: string; isAdmin: boolean }) {
  const MOSS   = "#2f4a3a";
  const SAGE   = "#5c8a6a";
  const IVORY  = "#faf7f2";
  const INK    = "#2a1a0a";
  const INK70  = "rgba(42,26,10,0.72)";
  const GOLD   = "#c9b78a";
  const GEORGIA = "Georgia, 'Times New Roman', serif";
  const INTER   = "Inter, system-ui, sans-serif";

  interface CollItem { name?: string; href?: string; image?: string; count?: string; }
  const rawItems = (content.items as CollItem[]) ?? [];
  const items: CollItem[] = (rawItems.length >= 5 ? rawItems : [
    { name: "Kytice růží",       count: "24 variant",  href: "/katalog", image: "https://images.unsplash.com/photo-1494972308805-463bc619d34e?auto=format&fit=crop&w=1400&q=85" },
    { name: "Pivoňky & růže",    count: "12 variant",  href: "/katalog", image: "https://images.unsplash.com/photo-1509281373149-e957c6296406?auto=format&fit=crop&w=1200&q=85" },
    { name: "Mono kytice",       count: "9 variant",   href: "/katalog", image: "https://images.unsplash.com/photo-1487070183336-b863922373d4?auto=format&fit=crop&w=1200&q=85" },
    { name: "Svatební kolekce",  count: "6 variant",   href: "/katalog", image: "https://images.unsplash.com/photo-1518895949257-7621c3c786d7?auto=format&fit=crop&w=1200&q=85" },
    { name: "Sušené & floristika","count": "18 variant","href": "/katalog","image": "https://images.unsplash.com/photo-1508610048659-a06b669e3321?auto=format&fit=crop&w=1200&q=85" }
  ]).slice(0, 5);

  const eyebrow = String(content.eyebrow ?? "02 · KOLEKCE");
  const title   = String(content.title   ?? "Sezónní kolekce, které milujeme");
  const kicker  = String(content.kicker  ?? "Pět kurátorských linií — od klasických růží po sušenou floristiku. Ručně vybíráme z každé sezónní dodávky.");
  const ctaText = String(content.ctaText ?? "Zobrazit celý katalog");
  const ctaHref = String(content.ctaHref ?? "/katalog");

  const resolveHref = (href: string) => {
    if (!href) return "#";
    if (href.startsWith("http") || href.startsWith("#") || href.startsWith("tel") || href.startsWith("mailto")) return href;
    if (isAdmin) return `/demo/${tenantSlug}/admin${href}`;
    if (tenantSlug) return `/demo/${tenantSlug}${href}`;
    return href;
  };

  const cursorSvg = "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='36' height='36' viewBox='0 0 36 36'><circle cx='18' cy='18' r='16' fill='%23faf7f2' stroke='%232f4a3a' stroke-width='1'/><path d='M18 26 V14 M18 22 Q14 20 12 16 M18 19 Q22 17 24 13' stroke='%232f4a3a' stroke-width='1' fill='none' stroke-linecap='round'/><circle cx='18' cy='13' r='1.4' fill='%232f4a3a'/></svg>\") 18 18, pointer";

  return (
    <section id="katalog" data-template="florist-01" className="f01coll" style={{ background: IVORY, fontFamily: INTER, padding: "96px 24px 108px" }}>
      <style>{`
        .f01coll-inner { max-width: 1280px; margin: 0 auto; }
        .f01coll-head { text-align:center; display:flex; flex-direction:column; align-items:center; gap:16px; margin-bottom: 56px; }
        .f01coll-eye { display:inline-flex; align-items:center; gap:14px; font-family:${INTER}; font-weight:500; font-size:11px; letter-spacing:0.34em; text-transform:uppercase; color:${MOSS}; }
        .f01coll-eye i { width:26px; height:1px; background:${GOLD}; display:inline-block; }
        .f01coll-eye em { color:${GOLD}; font-style:normal; font-size:10px; }
        .f01coll-h { font-family:${GEORGIA}; font-style:italic; font-weight:400; font-size:clamp(30px, 3.6vw, 46px); line-height:1.12; color:${INK}; margin:0; letter-spacing:-0.012em; max-width: 760px; }
        .f01coll-k { font-family:${INTER}; font-weight:300; font-size:15px; line-height:1.7; color:${INK70}; max-width: 620px; margin:0; }

        /* Editorial mosaic: 4 cols × 4 rows */
        .f01coll-grid { display:grid; grid-template-columns: repeat(4, 1fr); grid-auto-rows: 200px; gap: 20px; }
        .f01coll-cell { position:relative; overflow:hidden; text-decoration:none; color:inherit; background:${MOSS}; cursor: ${cursorSvg}; }
        .f01coll-cell:nth-child(1) { grid-column: span 2; grid-row: span 2; }
        .f01coll-cell:nth-child(2) { grid-column: span 2; grid-row: span 1; }
        .f01coll-cell:nth-child(3) { grid-column: span 2; grid-row: span 1; }
        .f01coll-cell:nth-child(4) { grid-column: span 2; grid-row: span 2; }
        .f01coll-cell:nth-child(5) { grid-column: span 2; grid-row: span 2; }

        .f01coll-cell img { width:100%; height:100%; object-fit:cover; display:block; transition: transform 1.1s cubic-bezier(.2,.7,.2,1), filter 0.6s ease; filter: brightness(0.96) saturate(0.98); }
        .f01coll-cell:hover img { transform: scale(1.07); filter: brightness(1) saturate(1.08); }

        /* Moss veil, subtle by default, stronger on hover */
        .f01coll-veil { position:absolute; inset:0; background: linear-gradient(180deg, rgba(47,74,58,0.10) 0%, rgba(47,74,58,0.55) 100%); transition: background 0.5s ease; pointer-events:none; }
        .f01coll-cell:hover .f01coll-veil { background: linear-gradient(180deg, rgba(47,74,58,0.20) 0%, rgba(47,74,58,0.72) 100%); }

        /* Corner brackets olive-gold — fade in on hover */
        .f01coll-brk { position:absolute; pointer-events:none; }
        .f01coll-brk::before, .f01coll-brk::after,
        .f01coll-brk span::before, .f01coll-brk span::after {
          content:""; position:absolute; width:32px; height:32px; opacity:0; transition: opacity 0.5s ease, transform 0.5s cubic-bezier(.6,.05,.35,1); transform: scale(0.85);
          border: 0 solid ${GOLD};
        }
        .f01coll-brk::before { top:14px; left:14px; border-top-width:1px; border-left-width:1px; }
        .f01coll-brk::after  { top:14px; right:14px; border-top-width:1px; border-right-width:1px; }
        .f01coll-brk span::before { bottom:14px; left:14px; border-bottom-width:1px; border-left-width:1px; }
        .f01coll-brk span::after  { bottom:14px; right:14px; border-bottom-width:1px; border-right-width:1px; }
        .f01coll-cell:hover .f01coll-brk::before,
        .f01coll-cell:hover .f01coll-brk::after,
        .f01coll-cell:hover .f01coll-brk span::before,
        .f01coll-cell:hover .f01coll-brk span::after { opacity: 1; transform: scale(1); }

        .f01coll-num { position:absolute; top:22px; left:24px; font-family:${GEORGIA}; font-style:italic; font-size:14px; color:${IVORY}; letter-spacing:0.14em; opacity:0.9; }
        .f01coll-label { position:absolute; left:24px; right:24px; bottom:24px; display:flex; align-items:flex-end; justify-content:space-between; gap:14px; color:${IVORY}; }
        .f01coll-label-l { display:flex; flex-direction:column; gap:6px; }
        .f01coll-name { font-family:${GEORGIA}; font-style:italic; font-size:clamp(20px, 2vw, 28px); line-height:1.15; margin:0; letter-spacing:-0.008em; }
        .f01coll-count { font-family:${INTER}; font-weight:400; font-size:11.5px; letter-spacing:0.24em; text-transform:uppercase; color:${IVORY}; opacity:0.72; }
        .f01coll-arrow { width:48px; height:48px; border:1px solid rgba(250,247,242,0.6); border-radius:50%; display:inline-flex; align-items:center; justify-content:center; color:${IVORY};
          background: rgba(47,74,58,0.4); backdrop-filter: blur(4px); transition: background 0.4s ease, color 0.4s ease, border-color 0.4s ease, transform 0.5s cubic-bezier(.6,.05,.35,1); flex-shrink:0; }
        .f01coll-cell:hover .f01coll-arrow { background:${IVORY}; color:${MOSS}; border-color:${IVORY}; transform: translate(4px,-4px); }

        .f01coll-foot { display:flex; align-items:center; justify-content:center; gap:20px; margin-top: 56px; padding-top: 34px; border-top:1px solid ${GOLD}; }
        .f01coll-cta { position:relative; display:inline-flex; align-items:center; gap:12px; padding:14px 26px; background:transparent; color:${MOSS}; font-family:${INTER}; font-weight:500; font-size:13px; letter-spacing:0.24em; text-transform:uppercase;
          text-decoration:none; border:1px solid ${MOSS}; transition:color 0.4s ease, background 0.4s ease; }
        .f01coll-cta:hover { background:${MOSS}; color:${IVORY}; }
        .f01coll-cta span.arrow { transition: transform 0.4s ease; }
        .f01coll-cta:hover span.arrow { transform: translateX(4px); }

        @media(max-width:900px){
          .f01coll { padding: 64px 20px 76px; }
          .f01coll-grid { grid-template-columns: repeat(2, 1fr); grid-auto-rows: 220px; gap: 14px; }
          .f01coll-cell:nth-child(1),
          .f01coll-cell:nth-child(4),
          .f01coll-cell:nth-child(5) { grid-column: span 2; grid-row: span 1; }
          .f01coll-cell:nth-child(2),
          .f01coll-cell:nth-child(3) { grid-column: span 1; grid-row: span 1; }
          .f01coll-name { font-size: 20px; }
          .f01coll-arrow { width:40px; height:40px; }
        }
      `}</style>

      <div className="f01coll-inner">
        <header className="f01coll-head">
          <span className="f01coll-eye"><i /><em>✿</em>
            <GenericEditableText sectionId={sectionId} field="eyebrow" value={eyebrow} tag="span" />
            <em>✿</em><i />
          </span>
          <h2 className="f01coll-h">
            <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
          </h2>
          <p className="f01coll-k">
            <GenericEditableText sectionId={sectionId} field="kicker" value={kicker} tag="span" />
          </p>
        </header>

        <div className="f01coll-grid">
          {items.map((item, i) => (
            <a key={i} className="f01coll-cell" href={resolveHref(item.href ?? "/katalog")} aria-label={item.name}>
              {item.image && (
                <GenericEditableImage sectionId={sectionId} field={`items.${i}.image`} src={item.image} alt={item.name ?? ""} style={{ display: "block", width: "100%", height: "100%" }}>
                  <img src={item.image} alt={item.name ?? ""} loading={i < 2 ? "eager" : "lazy"} />
                </GenericEditableImage>
              )}
              <span className="f01coll-veil" aria-hidden />
              <span className="f01coll-brk" aria-hidden><span /></span>
              <span className="f01coll-num">0{i + 1}</span>
              <div className="f01coll-label">
                <div className="f01coll-label-l">
                  <span className="f01coll-count">
                    <GenericEditableText sectionId={sectionId} field={`items.${i}.count`} value={item.count ?? ""} tag="span" />
                  </span>
                  <h3 className="f01coll-name">
                    <GenericEditableText sectionId={sectionId} field={`items.${i}.name`} value={item.name ?? ""} tag="span" />
                  </h3>
                </div>
                <span className="f01coll-arrow" aria-hidden>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </span>
              </div>
            </a>
          ))}
        </div>

        <div className="f01coll-foot">
          <a href={resolveHref(ctaHref)} className="f01coll-cta">
            <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
            <span className="arrow" aria-hidden>→</span>
          </a>
        </div>
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
  const DARK  = "#101417";
  const FONT  = "'Hanken Grotesk', 'Inter', sans-serif";

  type GItem = { name?: string; breed?: string; imageUrl?: string };
  const items   = (content.items as GItem[]) ?? [];

  const eyebrowRaw = (content as Record<string, unknown>).kicker;
  const titleRaw   = (content as Record<string, unknown>).heading;
  const kicker  = eyebrowRaw === undefined ? "Proměny k nepoznání" : String(eyebrowRaw);
  const heading = titleRaw   === undefined ? "Naše výsledky" : String(titleRaw);
  const showHeader = !!(kicker.trim() || heading.trim());

  const [lightbox, setLightbox] = useState<number | null>(null);

  useEffect(() => {
    if (lightbox === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightbox(null);
      else if (e.key === "ArrowRight") setLightbox(v => (v === null ? null : (v + 1) % items.length));
      else if (e.key === "ArrowLeft") setLightbox(v => (v === null ? null : (v - 1 + items.length) % items.length));
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [lightbox, items.length]);

  const active = lightbox !== null ? items[lightbox] : null;

  return (
    <section id="galerie" data-template="grooming-01-gallery" style={{ background: DARK, fontFamily: FONT }}>
      {showHeader && (
        <div className="gr01gl-head">
          <p className="gr01gl-kicker">
            <GenericEditableText sectionId={sectionId} field="kicker" value={kicker} tag="span" />
          </p>
          <h2 className="gr01gl-h2">
            <GenericEditableText sectionId={sectionId} field="heading" value={heading} tag="span" />
          </h2>
        </div>
      )}

      <div className="gr01gl-grid">
        {items.map((item, i) => (
          <div key={i} className="gr01gl-item" onClick={() => setLightbox(i)} role="button" tabIndex={0}
            onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setLightbox(i); } }}
            aria-label={`Zvětšit: ${item.name ?? ""} ${item.breed ?? ""}`}>
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
            <span className="gr01gl-brk gr01gl-brk-tl" aria-hidden="true" />
            <span className="gr01gl-brk gr01gl-brk-br" aria-hidden="true" />
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

      {active && (
        <div className="gr01gl-lb" role="dialog" aria-modal="true" onClick={() => setLightbox(null)}>
          <button className="gr01gl-lb-close" aria-label="Zavřít" onClick={() => setLightbox(null)}>×</button>
          <button className="gr01gl-lb-nav gr01gl-lb-prev" aria-label="Předchozí"
            onClick={(e) => { e.stopPropagation(); setLightbox(v => (v === null ? null : (v - 1 + items.length) % items.length)); }}>‹</button>
          <figure className="gr01gl-lb-fig" onClick={(e) => e.stopPropagation()}>
            <img src={active.imageUrl ?? ""} alt={`${active.name ?? ""} — ${active.breed ?? ""}`} className="gr01gl-lb-img" />
            <figcaption className="gr01gl-lb-cap">
              <span className="gr01gl-lb-count">{String((lightbox ?? 0) + 1).padStart(2, "0")} / {String(items.length).padStart(2, "0")}</span>
              <span className="gr01gl-lb-name">{active.name}</span>
              <span className="gr01gl-lb-breed">{active.breed}</span>
            </figcaption>
          </figure>
          <button className="gr01gl-lb-nav gr01gl-lb-next" aria-label="Další"
            onClick={(e) => { e.stopPropagation(); setLightbox(v => (v === null ? null : (v + 1) % items.length)); }}>›</button>
        </div>
      )}
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
function GalleryArch01Awards({ content, sectionId, tenantSlug, isAdmin }: { content: Record<string, unknown>; sectionId: number; tenantSlug?: string; isAdmin?: boolean }) {
  const ctaText = String(content.ctaText ?? "");
  const ctaHref = String(content.ctaHref ?? "");
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
    .a01aw-more { display: flex; justify-content: center; margin-top: clamp(28px, 4vw, 48px); }
    .a01aw-more-link {
      display: inline-flex; align-items: center; gap: 10px;
      font-family: ${FONT}; font-size: 12px; font-weight: 400;
      letter-spacing: 0.18em; text-transform: uppercase;
      color: #111; text-decoration: none;
      padding-bottom: 4px; border-bottom: 1px solid rgba(17,17,17,0.25);
      transition: border-color 0.3s ease, opacity 0.3s ease;
    }
    .a01aw-more-link:hover { border-color: #111; opacity: 0.7; }
    .a01aw-more-arrow { transition: transform 0.3s ease; }
    .a01aw-more-link:hover .a01aw-more-arrow { transform: translateX(4px); }
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
        {ctaText && (
          <div className="a01aw-more">
            <a href={resolveDemoHref(ctaHref, tenantSlug, isAdmin)} className="a01aw-more-link">
              <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
              <span className="a01aw-more-arrow" aria-hidden="true">→</span>
            </a>
          </div>
        )}
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

  const DARK   = "#0a0a0a";

  const kickerRaw = c.kicker as string | undefined;
  const titleRaw  = c.title  as string | undefined;
  const bodyRaw   = c.subtitle as string | undefined;
  const hasText = (v: unknown) => typeof v === "string" && v.trim() !== "";
  const showHeader = hasText(kickerRaw) || hasText(titleRaw) || hasText(bodyRaw);

  const kicker   = String(kickerRaw ?? "Naše realizace");
  const title    = String(titleRaw  ?? "Z čeho máme radost");
  const subtitle = String(bodyRaw   ?? "Vybrané dokončené projekty. Každá zakázka je pro nás výzvou k maximální pečlivosti.");
  const images   = (c.images as Array<{ url: string; alt: string; caption: string }>) ?? [];
  const siteMode = String(c.siteMode ?? "multipage");
  const ctaText  = String(c.ctaText ?? "Chci také takový výsledek");
  const ctaHref  = String(c.ctaHref ?? "/kontakt");

  const prev = () => setLightbox(l => l === null ? null : l === 0 ? images.length - 1 : l - 1);
  const next = () => setLightbox(l => l === null ? null : l === images.length - 1 ? 0 : l + 1);

  // Klávesnice: Esc zavře, šipky listují
  useEffect(() => {
    if (lightbox === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightbox(null);
      else if (e.key === "ArrowLeft") prev();
      else if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lightbox, images.length]);

  // Grid position classes per index (for up to 8 images)
  // t1–t8 = bento blok (t1 velká 2×2, t8 široká), t9+ = uniformní doplňkové řady
  const gridClass = ["i2gx-t1","i2gx-t2","i2gx-t3","i2gx-t4","i2gx-t5","i2gx-t6","i2gx-t7","i2gx-t8"];

  return (
    <section
      data-template="instala-02-gallery"
      style={{ backgroundColor: DARK, fontFamily: "'Roboto', sans-serif" }}
    >
      {/* Header */}
      {showHeader && (
        <div className="i2gx-head">
          <p className="i2gx-kicker">
            <GenericEditableText sectionId={sectionId} field="kicker" value={kicker} tag="span" />
          </p>
          <h2 className="i2gx-h2">
            <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
          </h2>
          <p className="i2gx-sub">
            <GenericEditableText sectionId={sectionId} field="subtitle" value={subtitle} tag="span" />
          </p>
        </div>
      )}

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
        <a href={resolveNavHref(ctaHref, siteMode, tenantSlug, isAdmin)} className="i2gx-cta">
          <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
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
// 1:1 aircomfort-klima.cz „Naše práce": světlé bg, eyebrow + title na střed,
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
  const FONT  = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif";
  const siteMode = String(content.siteMode ?? "multipage");

  const eyebrowRaw  = (content as Record<string, unknown>).eyebrow;
  const titleRaw    = (content as Record<string, unknown>).title;
  const subtitleRaw = (content as Record<string, unknown>).subtitle;
  const eyebrow  = eyebrowRaw  === undefined ? "Inspirace pro váš domov" : String(eyebrowRaw);
  const title    = titleRaw    === undefined ? "Podívejte se, jak podlaha promění prostor" : String(titleRaw);
  const subtitle = subtitleRaw === undefined ? "Realizace z různých typů interiérů — nechte se inspirovat a najděte ten svůj." : String(subtitleRaw);
  const allLabel = String((content as Record<string, unknown>).allLabel ?? "Zobrazit vše");
  const allHref  = String((content as Record<string, unknown>).allHref ?? "/sluzby");
  const showHeader = !!(eyebrow.trim() || title.trim() || subtitle.trim());

  type Img = { url: string; alt: string; caption: string; href: string };
  const images = (content.images as Img[]) ?? [
    { url: "/templates/floors-01/ins-1.webp", alt: "Obývací pokoj vinyl", caption: "Moderní obývák — vinyl s dekorem dřeva", href: "/sluzby" },
    { url: "/templates/floors-01/ins-2.webp", alt: "Home office", caption: "Home office — podlaha, která motivuje", href: "/sluzby" },
    { url: "/templates/floors-01/ins-3.webp", alt: "Ložnice světlé dřevo", caption: "Ložnice ve světlém dřevu", href: "/sluzby" },
    { url: "/templates/floors-01/ins-4.webp", alt: "Kuchyň a jídelna", caption: "Kuchyň + jídelna — odolná podlaha bez kompromisů", href: "/sluzby" },
    { url: "/templates/floors-01/ins-5.webp", alt: "Relaxační koutek koberec", caption: "Klidná zóna s měkkým kobercem", href: "/sluzby" },
  ];

  const resolve = (href: string) => resolveNavHref(href, siteMode, tenantSlug, isAdmin);
  const ArrowLine = () => (<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>);

  return (
    <section data-template="floors-01" style={{ fontFamily: FONT }}>
      <div className="f01i-section">
        <div className="f01i-wrap">
          {showHeader && (
            <div className="f01i-head">
              <div>
                {eyebrow.trim() && (
                  <span className="f01i-eyebrow"><GenericEditableText sectionId={sectionId} field="eyebrow" value={eyebrow} tag="span" /></span>
                )}
                <GenericEditableText sectionId={sectionId} field="title" value={title} tag="h2" className="f01i-title" />
                <GenericEditableText sectionId={sectionId} field="subtitle" value={subtitle} tag="p" className="f01i-sub" />
              </div>
              <a href={resolve(allHref)} className="f01i-all">
                <GenericEditableText sectionId={sectionId} field="allLabel" value={allLabel} tag="span" />
                <ArrowLine />
              </a>
            </div>
          )}

          <div className="f01i-grid">
            {images.map((img, i) => (
              <a key={i} href={resolve(img.href)} className="f01i-card">
                <GenericEditableImage sectionId={sectionId} field={`images.${i}.url`} src={img.url} alt={img.alt} style={{ position: "absolute", inset: 0 }}>
                  <img src={img.url} alt={img.alt} loading="lazy" />
                </GenericEditableImage>
                <div className="f01i-ov" aria-hidden="true" />
                <div className="f01i-cap">
                  <span className="f01i-cap-text"><GenericEditableText sectionId={sectionId} field={`images.${i}.caption`} value={img.caption} tag="span">{img.caption}</GenericEditableText></span>
                  <span className="f01i-cap-arrow" aria-hidden="true"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg></span>
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ── klempir-01-gallery ────────────────────────────────────────────────────────
// Copper & Slate: paper bg, editorial header; 3 projektové karty s foto 4/3,
// Fraunces titulek + popis, copper hover linka.
interface GalleryK01Props {
  content: Record<string, unknown>;
  sectionId: number;
  tenantSlug?: string;
  isAdmin: boolean;
}
type K01GalleryItem = { url?: string; alt?: string; title?: string; description?: string };

function GalleryKlempir01({ content, sectionId, tenantSlug: _tenantSlug, isAdmin: _isAdmin }: GalleryK01Props) {
  const kicker = String(content.kicker ?? "Realizace");
  const title = String(content.title ?? "Dokončené projekty");
  const note = String(content.note ?? "…a desítky dalších střech v Brně a okolí.");
  const images = (content.images as K01GalleryItem[]) ?? [];

  return (
    <>
      <style>{`
        .k01g-section { background: #F5F3EF; padding: clamp(4rem, 8vw, 7rem) 0; font-family: 'Manrope', sans-serif; }
        .k01g-inner { max-width: 76rem; margin: 0 auto; padding: 0 clamp(1.25rem, 4vw, 2.5rem); }
        .k01g-kicker {
          display: inline-flex; align-items: center; gap: 0.6rem;
          font-size: 0.8rem; font-weight: 700; letter-spacing: 0.16em; text-transform: uppercase;
          color: #B4622D; margin-bottom: 1.1rem;
        }
        .k01g-kicker::before { content: ""; width: 26px; height: 2px; background: #B4622D; }
        .k01g-h2 {
          font-family: 'Fraunces', serif;
          font-size: clamp(1.9rem, 3.4vw, 2.8rem); font-weight: 600;
          color: #191C1F; line-height: 1.1; margin: 0 0 clamp(2rem, 4vw, 3rem); letter-spacing: -0.02em;
        }
        .k01g-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.2rem; }
        .k01g-card {
          background: #fff; border: 1px solid #E9E5DD; border-radius: 6px; overflow: hidden;
          transition: box-shadow 0.3s, transform 0.3s;
        }
        .k01g-card:hover { transform: translateY(-4px); box-shadow: 0 28px 50px -30px rgba(20,23,26,0.35); }
        .k01g-img { aspect-ratio: 4/3; overflow: hidden; background: #E4E0D8; position: relative; }
        .k01g-img img {
          width: 100%; height: 100%; object-fit: cover; display: block;
          transition: transform 0.5s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .k01g-card:hover .k01g-img img { transform: scale(1.045); }
        .k01g-body { padding: 1.25rem 1.35rem 1.4rem; }
        .k01g-title { font-family: 'Fraunces', serif; font-size: 1.14rem; font-weight: 600; color: #191C1F; margin: 0 0 0.4rem; letter-spacing: -0.01em; }
        .k01g-desc { font-size: 0.9rem; color: #6B6F73; line-height: 1.62; margin: 0; }
        .k01g-note {
          margin: 2.2rem 0 0; text-align: center; font-size: 0.95rem; color: #9B9F9F;
          font-style: italic; font-family: 'Fraunces', serif;
        }
        @media (max-width: 900px) { .k01g-grid { grid-template-columns: 1fr; } }
        @media (prefers-reduced-motion: reduce) { .k01g-card, .k01g-img img { transition: none !important; } }
      `}</style>

      <section className="k01g-section" id="galerie" data-template="klempir-01-gallery">
        <div className="k01g-inner">
          <p className="k01g-kicker"><GenericEditableText sectionId={sectionId} field="kicker" value={kicker} tag="span" /></p>
          <h2 className="k01g-h2"><GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" /></h2>
          <div className="k01g-grid">
            {images.map((img, i) => (
              <article key={i} className="k01g-card">
                <div className="k01g-img">
                  <GenericEditableImage sectionId={sectionId} field={`images.${i}.url`} src={img.url ?? ""} alt={img.alt ?? img.title ?? ""} className="absolute inset-0 w-full h-full" style={{ position: "absolute" }}>
                    <img src={img.url} alt={img.alt ?? img.title ?? ""} loading="lazy" />
                  </GenericEditableImage>
                </div>
                <div className="k01g-body">
                  <h3 className="k01g-title"><GenericEditableText sectionId={sectionId} field={`images.${i}.title`} value={img.title ?? ""} tag="span" /></h3>
                  <p className="k01g-desc"><GenericEditableText sectionId={sectionId} field={`images.${i}.description`} value={img.description ?? ""} tag="span" /></p>
                </div>
              </article>
            ))}
          </div>
          <p className="k01g-note"><GenericEditableText sectionId={sectionId} field="note" value={note} tag="span" /></p>
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
          font-family: 'Figtree', system-ui, sans-serif;
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
        .ddd01g-card > *:not(.ddd01g-caption) {
          width: 100%;
          height: 100%;
        }
        .ddd01g-caption {
          z-index: 1;
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
function GalleryHotel01Offers({ content, sectionId, tenantSlug, isAdmin }: { content: Record<string, unknown>; sectionId: number; tenantSlug?: string; isAdmin: boolean }) {
  const c          = (content ?? {}) as Record<string, any>;
  const showHeader = c.showHeader !== false;
  const eyebrow   = c.eyebrow   ?? "Balíčky & Akce";
  const title      = c.title     ?? "Speciální nabídky pro váš pobyt";
  const titleAccent = c.titleAccent ?? "pobyt";
  const subtitle   = c.subtitle  ?? "";
  const ctaText    = c.ctaText   ?? "Zobrazit všechny balíčky";
  const ctaHref    = c.ctaHref   ?? "/nabidky";
  const items: { name: string; description: string; image: string; moreHref: string; bookHref: string }[] = Array.isArray(c.items) ? c.items : [];

  const href = (h: string) => resolveDemoHref(h ?? "#", tenantSlug, isAdmin);

  const renderTitle = () => {
    if (!titleAccent || !title.includes(titleAccent)) {
      return <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />;
    }
    const parts = title.split(titleAccent);
    return (
      <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span">
        <>{parts[0]}<em className="h01offers-accent">{titleAccent}</em>{parts.slice(1).join(titleAccent)}</>
      </GenericEditableText>
    );
  };

  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;1,400;1,500&family=Poppins:wght@300;400;500&display=swap" />
      <style>{`
        .h01offers {
          background: #f9f6f2;
          padding: clamp(80px,10vw,140px) clamp(20px,5vw,80px);
          font-family: 'Poppins', sans-serif;
          position: relative; overflow: hidden;
        }
        .h01offers::before {
          content: ''; position: absolute; top: 0; left: 50%; transform: translateX(-50%);
          width: 1px; height: 60px; background: linear-gradient(180deg, #a98763, transparent);
        }
        .h01offers-header {
          max-width: 1200px; margin: 0 auto 64px; text-align: center;
        }
        .h01offers-eyebrow {
          font-family: 'Playfair Display', Georgia, serif;
          font-style: italic; font-weight: 400;
          font-size: 13px; letter-spacing: 0.28em; text-transform: uppercase;
          color: #a98763; margin: 0 0 20px;
          display: inline-flex; align-items: center; gap: 18px;
        }
        .h01offers-eyebrow::before, .h01offers-eyebrow::after {
          content: ''; display: inline-block; width: 32px; height: 1px; background: #a98763;
        }
        .h01offers-title {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: clamp(30px,4vw,52px); font-weight: 400; color: #2a2520;
          margin: 0 0 18px; line-height: 1.15;
        }
        .h01offers-accent { font-style: italic; color: #a98763; }
        .h01offers-subtitle {
          font-size: 15.5px; color: #7a7268; font-weight: 300;
          max-width: 620px; margin: 0 auto; line-height: 1.8;
        }
        .h01offers-grid {
          max-width: 1200px; margin: 0 auto;
          display: grid; grid-template-columns: repeat(3, 1fr); gap: 32px;
        }
        .h01offers-card {
          display: flex; flex-direction: column;
          background: #fff; overflow: hidden;
          transition: box-shadow .4s, transform .4s;
        }
        .h01offers-card:hover {
          box-shadow: 0 20px 60px rgba(42,37,32,0.12);
          transform: translateY(-4px);
        }
        .h01offers-img-wrap {
          position: relative; overflow: hidden; aspect-ratio: 16/11; flex-shrink: 0;
        }
        .h01offers-img {
          width: 100%; height: 100%; object-fit: cover; display: block;
          transition: transform .8s cubic-bezier(.22,.68,0,1.1);
          filter: contrast(1.02) saturate(1.05);
        }
        .h01offers-card:hover .h01offers-img { transform: scale(1.08); }
        .h01offers-badge {
          position: absolute; top: 18px; left: 18px;
          background: rgba(42,37,32,.85); backdrop-filter: blur(6px);
          color: #d4b088;
          font-family: 'Playfair Display', Georgia, serif;
          font-style: italic;
          font-size: 11px; letter-spacing: 0.16em; text-transform: uppercase;
          padding: 6px 16px;
        }
        .h01offers-num {
          position: absolute; bottom: 14px; right: 18px;
          font-family: 'Playfair Display', Georgia, serif;
          font-style: italic; font-size: 42px; font-weight: 400;
          color: rgba(255,255,255,.25); line-height: 1;
        }
        .h01offers-body {
          padding: 28px 28px 32px; display: flex; flex-direction: column; flex: 1;
          border-left: 1px solid rgba(169,135,99,.18);
          border-right: 1px solid rgba(169,135,99,.18);
          border-bottom: 1px solid rgba(169,135,99,.18);
        }
        .h01offers-name {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: 20px; font-weight: 400; color: #2a2520;
          margin: 0 0 14px; line-height: 1.3;
        }
        .h01offers-desc {
          font-size: 14.5px; color: #6d6560; font-weight: 300;
          line-height: 1.8; margin: 0 0 28px; flex: 1;
        }
        .h01offers-ctas { display: flex; gap: 10px; flex-wrap: wrap; }
        .h01offers-more {
          position: relative; overflow: hidden;
          display: inline-flex; align-items: center; gap: 8px;
          border: 1px solid rgba(169,135,99,.5); color: #a98763;
          font-family: 'Playfair Display', Georgia, serif;
          font-size: 11px; letter-spacing: 0.16em; text-transform: uppercase;
          padding: 11px 22px; text-decoration: none;
          transition: color .35s, border-color .35s;
        }
        .h01offers-more::before {
          content: ''; position: absolute; inset: 0;
          background: #a98763; transform: translateY(101%);
          transition: transform .5s cubic-bezier(.22,.68,0,1.1); z-index: 0;
        }
        .h01offers-more:hover { color: #fff; border-color: #a98763; }
        .h01offers-more:hover::before { transform: translateY(0); }
        .h01offers-more > * { position: relative; z-index: 1; }
        .h01offers-book {
          position: relative; overflow: hidden;
          display: inline-flex; align-items: center; gap: 8px;
          background: #2a2520; color: #f9f6f2;
          font-family: 'Playfair Display', Georgia, serif;
          font-size: 11px; letter-spacing: 0.16em; text-transform: uppercase;
          padding: 11px 22px; text-decoration: none; border: 1px solid #2a2520;
          transition: color .35s, border-color .35s;
        }
        .h01offers-book::before {
          content: ''; position: absolute; inset: 0;
          background: #a98763; transform: translateY(101%);
          transition: transform .5s cubic-bezier(.22,.68,0,1.1); z-index: 0;
        }
        .h01offers-book:hover { border-color: #a98763; }
        .h01offers-book:hover::before { transform: translateY(0); }
        .h01offers-book > * { position: relative; z-index: 1; }
        .h01offers-footer {
          max-width: 1200px; margin: 52px auto 0; text-align: center;
        }
        .h01offers-all {
          display: inline-flex; align-items: center; gap: 12px;
          font-family: 'Playfair Display', Georgia, serif;
          font-style: italic; font-size: 15px; color: #a98763;
          text-decoration: none; letter-spacing: 0.04em;
          transition: color .3s;
        }
        .h01offers-all:hover { color: #2a2520; }
        .h01offers-all::after {
          content: '→'; display: inline-block;
          transition: transform .35s cubic-bezier(.22,.68,0,1.1);
        }
        .h01offers-all:hover::after { transform: translateX(6px); }
        @media (max-width: 900px) { .h01offers-grid { grid-template-columns: 1fr 1fr; } }
        @media (max-width: 560px) {
          .h01offers-grid { grid-template-columns: 1fr; }
          .h01offers-body { padding: 22px 22px 26px; }
        }
      `}</style>

      <section className="h01offers" id="nabidky" data-template="hotel-01-offers">
        {showHeader && (
          <div className="h01offers-header">
            <div className="h01offers-eyebrow">
              <GenericEditableText sectionId={sectionId} field="eyebrow" value={eyebrow} tag="span" />
            </div>
            <h2 className="h01offers-title">{renderTitle()}</h2>
            {subtitle && (
              <p className="h01offers-subtitle">
                <GenericEditableText sectionId={sectionId} field="subtitle" value={subtitle} tag="span" />
              </p>
            )}
          </div>
        )}

        <div className="h01offers-grid">
          {items.map((item, i) => (
            <div key={i} className="h01offers-card">
              <div className="h01offers-img-wrap">
                <GenericEditableImage sectionId={sectionId} field={`items.${i}.image`} src={item.image || "/placeholder.jpg"} alt={item.name} style={{ width: "100%", height: "100%" }}>
                  <img src={item.image || "/placeholder.jpg"} alt={item.name} className="h01offers-img" loading="lazy" />
                </GenericEditableImage>
                <span className="h01offers-badge">Nabídka</span>
                <span className="h01offers-num" aria-hidden="true">0{i + 1}</span>
              </div>
              <div className="h01offers-body">
                <h3 className="h01offers-name">
                  <GenericEditableText sectionId={sectionId} field={`items.${i}.name`} value={item.name} tag="span" />
                </h3>
                <p className="h01offers-desc">
                  <GenericEditableText sectionId={sectionId} field={`items.${i}.description`} value={item.description} tag="span" />
                </p>
                <div className="h01offers-ctas">
                  <a href={href(item.moreHref)} className="h01offers-more">
                    <span>Více informací</span>
                  </a>
                  <a href={href(item.bookHref)} className="h01offers-book">
                    <span>Rezervovat</span>
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="h01offers-footer">
          <a href={href(ctaHref)} className="h01offers-all">
            <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
          </a>
        </div>
      </section>
    </>
  );
}

// ── hotel-02-gallery ──────────────────────────────────────────────────────────
function GalleryHotel02({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const c       = (content ?? {}) as Record<string, any>;
  const eyebrow = c.eyebrow ?? "Galerie";
  const title   = c.title   ?? "Nahlédněte k nám";
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
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300&family=Montserrat:wght@400;500&display=swap" />
      <style>{`
        .h02gl {
          background: #1a2332;
          padding: clamp(72px,9vw,120px) clamp(20px,4vw,60px);
          font-family: 'Montserrat', sans-serif;
          position: relative; overflow: hidden;
        }
        .h02gl::before {
          content: ''; position: absolute; top: 0; left: 50%; transform: translateX(-50%);
          width: 60px; height: 1px; background: #96A1AC;
        }
        .h02gl-header {
          text-align: center; margin: 0 auto clamp(40px,5vw,64px);
          max-width: 600px;
        }
        .h02gl-eyebrow {
          font-family: 'Montserrat', sans-serif;
          font-size: 11px; font-weight: 500; letter-spacing: 3px; text-transform: uppercase;
          color: #96A1AC; margin: 0 0 12px; line-height: 1;
        }
        .h02gl-title {
          font-family: 'Cormorant Garamond', Georgia, serif;
          font-size: clamp(28px,3.2vw,44px); font-weight: 300;
          color: #fff; margin: 0; line-height: 1.15;
        }
        .h02gl-grid {
          max-width: 1300px; margin: 0 auto;
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          grid-auto-rows: 230px;
          gap: 6px;
        }
        .h02gl-item:nth-child(1) { grid-column: span 2; grid-row: span 2; }
        .h02gl-item:nth-child(5) { grid-row: span 2; }
        .h02gl-item {
          position: relative; overflow: hidden; cursor: pointer;
          background: #2d3f57;
        }
        .h02gl-item::after {
          content: ''; position: absolute; inset: 6px;
          border: 1px solid rgba(255,255,255,0);
          transition: border-color 0.4s ease;
          pointer-events: none; z-index: 2;
        }
        .h02gl-item:hover::after { border-color: rgba(255,255,255,0.3); }
        .h02gl-img {
          width: 100%; height: 100%; object-fit: cover; display: block;
          transition: transform 0.7s cubic-bezier(0.25,0.46,0.45,0.94), filter 0.4s ease;
        }
        .h02gl-item:hover .h02gl-img {
          transform: scale(1.05);
          filter: brightness(0.7);
        }
        .h02gl-overlay {
          position: absolute; inset: 0; z-index: 3;
          display: flex; align-items: center; justify-content: center;
          opacity: 0; transition: opacity 0.35s ease;
        }
        .h02gl-item:hover .h02gl-overlay { opacity: 1; }
        .h02gl-zoom-icon {
          width: 48px; height: 48px; border: 1px solid rgba(255,255,255,0.7);
          border-radius: 0; display: flex; align-items: center; justify-content: center;
          color: #fff; backdrop-filter: blur(4px); background: rgba(26,35,50,0.3);
        }

        /* Lightbox */
        .h02gl-lb {
          position: fixed; inset: 0; z-index: 9000;
          background: rgba(10,14,20,0.95);
          display: flex; align-items: center; justify-content: center;
          backdrop-filter: blur(8px);
        }
        .h02gl-lb-img {
          max-width: 88vw; max-height: 85vh;
          object-fit: contain; display: block;
          box-shadow: 0 32px 100px rgba(0,0,0,0.7);
        }
        .h02gl-lb-close {
          position: absolute; top: 24px; right: 28px;
          background: none; border: 1px solid rgba(255,255,255,0.2);
          color: #fff; width: 44px; height: 44px;
          cursor: pointer; display: flex; align-items: center; justify-content: center;
          transition: border-color 0.2s, background 0.2s;
          font-size: 0;
        }
        .h02gl-lb-close:hover { border-color: rgba(255,255,255,0.5); background: rgba(255,255,255,0.05); }
        .h02gl-lb-close svg { width: 18; height: 18; }
        .h02gl-lb-arrow {
          position: absolute; top: 50%; transform: translateY(-50%);
          background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.15);
          color: #fff; width: 52px; height: 52px; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          transition: background 0.25s, border-color 0.25s;
        }
        .h02gl-lb-arrow:hover { background: rgba(150,161,172,0.2); border-color: rgba(150,161,172,0.5); }
        .h02gl-lb-arrow.left  { left: 24px; }
        .h02gl-lb-arrow.right { right: 24px; }
        .h02gl-lb-counter {
          position: absolute; bottom: 28px; left: 50%; transform: translateX(-50%);
          font-family: 'Montserrat', sans-serif; font-size: 13px; letter-spacing: 2px;
          color: rgba(255,255,255,0.5);
        }

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
          <p className="h02gl-eyebrow">
            <GenericEditableText sectionId={sectionId} field="eyebrow" value={eyebrow} tag="span" />
          </p>
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
            <button className="h02gl-lb-close" onClick={e => { e.stopPropagation(); setLightbox(null); }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
            <button className="h02gl-lb-arrow left" onClick={e => { e.stopPropagation(); prev(); }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
            </button>
            <img loading="lazy" src={images[lightbox]?.url} alt={images[lightbox]?.alt ?? ""} className="h02gl-lb-img" onClick={e => e.stopPropagation()} />
            <button className="h02gl-lb-arrow right" onClick={e => { e.stopPropagation(); next(); }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
            </button>
            <div className="h02gl-lb-counter">{lightbox + 1} / {images.length}</div>
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

  // "Vybrané" = obrázky s featured:true (pokud jsou označené), jinak všechny
  const hasFeatured = rawImages.some(img => (img as { featured?: boolean }).featured === true);
  const filtered = activeFilter === "Vybrané"
    ? (hasFeatured ? rawImages.filter(img => (img as { featured?: boolean }).featured === true) : rawImages)
    : rawImages.filter(img => img.category === activeFilter);

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
// Prémiová event-agentura: 3-col dark portfolio grid s gold hairline eyebrow,
// Playfair H2, karty s per-tile label (rok) + Playfair italic caption overlay,
// lightbox s prev/next/counter, luxe SVG cursor, stagger fade-in reveal.
// Awwwards polish 2026-07-01.
// ─────────────────────────────────────────────────────────────────────────────
function GalleryEvents01({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const GOLD = "#d4b896";
  const showHeader = content.showHeader !== false;
  const eyebrow    = String(content.eyebrow ?? "Vybrané projekty");
  const title      = String(content.title   ?? "Portfolio akcí");
  const subtitle   = String(content.subtitle ?? "");
  const images     = (content.images as Array<{ url: string; alt: string; caption?: string; label?: string }>) ?? [];

  const [lightbox, setLightbox] = useState<number | null>(null);
  const close = () => setLightbox(null);
  const prev  = () => setLightbox(i => (i === null ? null : (i - 1 + images.length) % images.length));
  const next  = () => setLightbox(i => (i === null ? null : (i + 1) % images.length));

  useEffect(() => {
    if (lightbox === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [lightbox]);

  const luxeCursor = "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 32 32'><circle cx='16' cy='16' r='13' fill='rgba(10,10,10,0.85)' stroke='%23d4b896' stroke-width='1.2'/><path d='M11 11 L11 14 M11 11 L14 11 M21 11 L21 14 M21 11 L18 11 M11 21 L11 18 M11 21 L14 21 M21 21 L21 18 M21 21 L18 21' stroke='%23d4b896' stroke-width='1.6' stroke-linecap='round' fill='none'/></svg>\") 16 16, zoom-in";

  return (
    <>
      <style>{`
        .ev01gal {
          position: relative;
          padding: 140px 40px 130px;
          background: #0f0f0f;
          overflow: hidden;
        }
        .ev01gal::before {
          content: "";
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent 0%, rgba(212,184,150,0.14) 50%, transparent 100%);
        }
        .ev01gal-inner { max-width: 1280px; margin: 0 auto; }
        .ev01gal-head { text-align: center; margin-bottom: 90px; }
        .ev01gal-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 16px;
          color: ${GOLD};
          font-family: 'Inter', sans-serif;
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 4px;
          text-transform: uppercase;
          margin-bottom: 26px;
        }
        .ev01gal-eyebrow::before,
        .ev01gal-eyebrow::after {
          content: "";
          display: block;
          width: 44px;
          height: 1px;
          background: linear-gradient(90deg, transparent 0%, ${GOLD} 100%);
        }
        .ev01gal-eyebrow::after {
          background: linear-gradient(90deg, ${GOLD} 0%, transparent 100%);
        }
        .ev01gal-h2 {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: clamp(34px, 4vw, 56px);
          font-weight: 400;
          margin: 0;
          color: #fff;
          letter-spacing: -0.01em;
          line-height: 1.1;
        }
        .ev01gal-sub {
          font-family: 'Inter', sans-serif;
          font-size: 15px;
          color: rgba(255,255,255,0.6);
          line-height: 1.7;
          margin: 22px auto 0;
          max-width: 560px;
        }
        .ev01gal-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
        }
        .ev01gal-card {
          position: relative;
          aspect-ratio: 4/3;
          overflow: hidden;
          background: #1a1a1a;
          isolation: isolate;
          opacity: 0;
          transform: translateY(20px);
          animation: ev01galReveal 1s cubic-bezier(.32,.72,0,1) forwards;
        }
        .ev01gal-card:nth-child(1) { animation-delay: 0.1s; }
        .ev01gal-card:nth-child(2) { animation-delay: 0.2s; }
        .ev01gal-card:nth-child(3) { animation-delay: 0.3s; }
        .ev01gal-card:nth-child(4) { animation-delay: 0.4s; }
        .ev01gal-card:nth-child(5) { animation-delay: 0.5s; }
        .ev01gal-card:nth-child(6) { animation-delay: 0.6s; }
        @keyframes ev01galReveal { to { opacity: 1; transform: translateY(0); } }
        .ev01gal-card img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          transition: transform 1.1s cubic-bezier(.32,.72,0,1), filter 0.6s cubic-bezier(.32,.72,0,1);
          filter: brightness(0.88) saturate(0.9);
        }
        .ev01gal-card:hover img {
          transform: scale(1.06);
          filter: brightness(1) saturate(1.05);
        }
        .ev01gal-card::before,
        .ev01gal-card::after {
          content: "";
          position: absolute;
          width: 24px;
          height: 24px;
          border: 1px solid ${GOLD};
          opacity: 0;
          z-index: 4;
          transition: opacity 0.5s cubic-bezier(.32,.72,0,1), width 0.5s cubic-bezier(.32,.72,0,1), height 0.5s cubic-bezier(.32,.72,0,1);
          pointer-events: none;
        }
        .ev01gal-card::before { top: 10px; left: 10px; border-right: none; border-bottom: none; }
        .ev01gal-card::after  { bottom: 10px; right: 10px; border-left: none; border-top: none; }
        .ev01gal-card:hover::before,
        .ev01gal-card:hover::after {
          opacity: 1;
          width: 32px;
          height: 32px;
        }
        .ev01gal-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.5) 40%, transparent 70%);
          display: flex;
          align-items: flex-end;
          padding: 26px;
          z-index: 3;
        }
        .ev01gal-overlay-inner {
          transform: translateY(6px);
          opacity: 0.94;
          transition: transform 0.5s cubic-bezier(.32,.72,0,1), opacity 0.5s cubic-bezier(.32,.72,0,1);
        }
        .ev01gal-card:hover .ev01gal-overlay-inner {
          transform: translateY(0);
          opacity: 1;
        }
        .ev01gal-label {
          color: ${GOLD};
          font-family: 'Inter', sans-serif;
          font-size: 10.5px;
          letter-spacing: 3px;
          text-transform: uppercase;
          display: inline-flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 8px;
        }
        .ev01gal-label::before {
          content: "";
          display: block;
          width: 16px;
          height: 1px;
          background: ${GOLD};
        }
        .ev01gal-caption {
          color: #fff;
          font-family: 'Playfair Display', Georgia, serif;
          font-style: italic;
          font-size: 20px;
          font-weight: 400;
          margin: 0;
          line-height: 1.3;
        }
        .ev01gal-cursor { cursor: ${luxeCursor}; }
        /* lightbox */
        .ev01gal-lb {
          position: fixed;
          inset: 0;
          background: rgba(6,6,6,0.96);
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
          z-index: 9999;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px;
          animation: ev01galLbIn 0.4s cubic-bezier(.32,.72,0,1);
        }
        @keyframes ev01galLbIn { from { opacity: 0; } to { opacity: 1; } }
        .ev01gal-lb-img { max-width: min(90vw, 1400px); max-height: 82vh; object-fit: contain; box-shadow: 0 60px 120px -30px rgba(0,0,0,0.8), 0 0 0 1px rgba(212,184,150,0.12); }
        .ev01gal-lb-close {
          position: absolute;
          top: 24px; right: 30px;
          background: none;
          border: none;
          color: rgba(255,255,255,0.7);
          font-size: 32px;
          line-height: 1;
          cursor: pointer;
          transition: color 0.3s;
        }
        .ev01gal-lb-close:hover { color: ${GOLD}; }
        .ev01gal-lb-nav {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: 1px solid rgba(212,184,150,0.25);
          color: rgba(255,255,255,0.8);
          width: 52px;
          height: 52px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: color 0.3s, border-color 0.3s, background 0.3s;
        }
        .ev01gal-lb-nav:hover { color: ${GOLD}; border-color: ${GOLD}; background: rgba(212,184,150,0.08); }
        .ev01gal-lb-prev { left: 30px; }
        .ev01gal-lb-next { right: 30px; }
        .ev01gal-lb-counter {
          position: absolute;
          bottom: 30px;
          left: 50%;
          transform: translateX(-50%);
          font-family: 'Inter', sans-serif;
          font-size: 11px;
          letter-spacing: 4px;
          text-transform: uppercase;
          color: ${GOLD};
          display: inline-flex;
          align-items: center;
          gap: 10px;
        }
        .ev01gal-lb-counter::before,
        .ev01gal-lb-counter::after {
          content: "";
          display: block;
          width: 28px;
          height: 1px;
          background: rgba(212,184,150,0.35);
        }
        @media (max-width: 900px) {
          .ev01gal { padding: 90px 24px 80px; }
          .ev01gal-grid { grid-template-columns: repeat(2, 1fr); gap: 16px; }
          .ev01gal-head { margin-bottom: 60px; }
          .ev01gal-caption { font-size: 17px; }
          .ev01gal-lb-nav { width: 44px; height: 44px; }
          .ev01gal-lb-prev { left: 12px; }
          .ev01gal-lb-next { right: 12px; }
        }
        @media (max-width: 480px) { .ev01gal-grid { grid-template-columns: 1fr; } }
      `}</style>
      <section className="ev01gal" id="portfolio" data-template="events-01-gallery">
        <div className="ev01gal-inner">
          {showHeader && (
            <div className="ev01gal-head">
              {eyebrow && (
                <div className="ev01gal-eyebrow">
                  <GenericEditableText sectionId={sectionId} field="eyebrow" value={eyebrow} tag="span">{eyebrow}</GenericEditableText>
                </div>
              )}
              {title && (
                <GenericEditableText sectionId={sectionId} field="title" value={title} tag="h2">
                  <h2 className="ev01gal-h2">{title}</h2>
                </GenericEditableText>
              )}
              {subtitle && (
                <p className="ev01gal-sub">
                  <GenericEditableText sectionId={sectionId} field="subtitle" value={subtitle} tag="span">{subtitle}</GenericEditableText>
                </p>
              )}
            </div>
          )}
          <div className="ev01gal-grid">
            {images.map((img, i) => (
              <div className="ev01gal-card ev01gal-cursor" key={i} onClick={() => setLightbox(i)} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === "Enter") setLightbox(i); }} aria-label={img.caption ?? img.alt}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img.url} alt={img.alt} loading="lazy" />
                <div className="ev01gal-overlay">
                  <div className="ev01gal-overlay-inner">
                    {img.label && (
                      <span className="ev01gal-label">
                        <GenericEditableText sectionId={sectionId} field={`images.${i}.label`} value={img.label} tag="span">{img.label}</GenericEditableText>
                      </span>
                    )}
                    <GenericEditableText sectionId={sectionId} field={`images.${i}.caption`} value={img.caption ?? img.alt} tag="h4">
                      <h4 className="ev01gal-caption">{img.caption ?? img.alt}</h4>
                    </GenericEditableText>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        {lightbox !== null && images[lightbox] && (
          <div className="ev01gal-lb" onClick={close}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="ev01gal-lb-img" src={images[lightbox].url} alt={images[lightbox].alt} onClick={e => e.stopPropagation()} />
            <button className="ev01gal-lb-close" onClick={(e) => { e.stopPropagation(); close(); }} aria-label="Zavřít">×</button>
            {images.length > 1 && (
              <>
                <button className="ev01gal-lb-nav ev01gal-lb-prev" onClick={(e) => { e.stopPropagation(); prev(); }} aria-label="Předchozí">
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.2"><path d="M12 3 L6 9 L12 15"/></svg>
                </button>
                <button className="ev01gal-lb-nav ev01gal-lb-next" onClick={(e) => { e.stopPropagation(); next(); }} aria-label="Další">
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.2"><path d="M6 3 L12 9 L6 15"/></svg>
                </button>
                <div className="ev01gal-lb-counter">
                  {String(lightbox + 1).padStart(2, "0")} <span style={{ opacity: 0.55 }}>/</span> {String(images.length).padStart(2, "0")}
                </div>
              </>
            )}
          </div>
        )}
      </section>
    </>
  );
}

// ── restaurant-04-gallery ─────────────────────────────────────────────────────
// Tmavé pozadí #0d1f0a, header (kicker + H2 + CTA),
// 4-col masonry-style grid, červený hover overlay + zoom, lightbox.
// ─────────────────────────────────────────────────────────────────────────────
function GalleryRestaurant04({ content, sectionId, tenantSlug, isAdmin }: { content: Record<string, unknown>; sectionId: number; tenantSlug?: string; isAdmin?: boolean }) {
  const tagline = String(content.tagline ?? "");
  const title   = String(content.title   ?? "");
  const ctaText = String(content.ctaText ?? "Celá galerie");
  const ctaHref = String(content.ctaHref ?? "/galerie");
  const images  = (content.images as Array<{ url: string; alt?: string }>) ?? [];
  const siteMode = String(content.siteMode ?? "multipage");
  const showHeader = !!(tagline.trim() || title.trim());

  const DARK  = "#0d1f0a";
  const SURF  = "#152d11";
  const RED   = "#c41c1c";
  const CREAM = "#f5f0e8";
  const SERIF = "'Fraunces', Georgia, 'Times New Roman', serif";
  const SANS  = "'Nunito Sans', 'Helvetica Neue', Arial, sans-serif";

  const [lightbox, setLightbox] = useState<number | null>(null);

  const resolve = (href: string) => resolveNavHref(href, siteMode, tenantSlug, isAdmin ?? false);
  const close = () => setLightbox(null);
  const prev  = () => setLightbox(i => (i !== null ? (i - 1 + images.length) % images.length : null));
  const next  = () => setLightbox(i => (i !== null ? (i + 1) % images.length : null));

  useEffect(() => {
    if (lightbox === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  return (
    <section
      id="galerie"
      data-template="restaurant-04"
      style={{ background: DARK, padding: "clamp(80px, 12vw, 140px) clamp(24px, 6vw, 80px)" }}
    >
      {/* Header — conditional */}
      {showHeader && (
        <div style={{
          maxWidth: 1200, margin: "0 auto 56px",
          display: "flex", flexWrap: "wrap", gap: 24,
          alignItems: "flex-end", justifyContent: "space-between",
        }}>
          <div>
            {tagline && (
              <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "0 0 16px" }}>
                <span style={{ width: 28, height: 1, background: RED }} />
                <p style={{
                  fontFamily: SANS, fontSize: 11, fontWeight: 700,
                  letterSpacing: "0.22em", textTransform: "uppercase",
                  color: RED, margin: 0,
                }}>
                  <GenericEditableText sectionId={sectionId} field="tagline" value={tagline} tag="span" />
                </p>
              </div>
            )}
            {title && (
              <h2 style={{
                fontFamily: SERIF, fontSize: "clamp(28px, 4.5vw, 52px)", fontWeight: 400,
                fontStyle: "italic", color: CREAM, margin: 0, lineHeight: 1.1,
                whiteSpace: "pre-line",
              }}>
                <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
              </h2>
            )}
          </div>
          {ctaText && ctaHref && (
            <a
              href={resolve(ctaHref)}
              data-btn="primary"
              className="r04-gal-cta"
              style={{
                display: "inline-block", fontFamily: SANS, fontSize: 11, fontWeight: 700,
                letterSpacing: "0.14em", textTransform: "uppercase",
                color: CREAM, textDecoration: "none",
                padding: "14px 32px", border: `1px solid ${RED}`, borderRadius: 2,
                flexShrink: 0,
              }}
            >
              <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
            </a>
          )}
        </div>
      )}

      {/* Bento-style grid — 2 rows, mixed spans */}
      <div style={{ maxWidth: 1200, margin: "0 auto" }} className="r04-gal-grid">
        {images.map((img, i) => (
          <div
            key={i}
            className="r04-gal-item"
            onClick={() => setLightbox(i)}
            style={{
              position: "relative", overflow: "hidden",
              cursor: "zoom-in", borderRadius: 3,
              background: SURF,
            }}
          >
            <img
              src={img.url}
              alt={img.alt ?? ""}
              loading="lazy"
              style={{
                width: "100%", height: "100%", objectFit: "cover", display: "block",
                transition: "transform 0.6s cubic-bezier(0.22,1,0.36,1)",
              }}
            />
            {/* Hover overlay */}
            <div className="r04-gal-overlay" style={{
              position: "absolute", inset: 0,
              background: `linear-gradient(135deg, ${RED}00 0%, ${RED}55 100%)`,
              opacity: 0, transition: "opacity 0.4s",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none" style={{ opacity: 0.9 }}>
                <circle cx="16" cy="16" r="15" stroke={CREAM} strokeWidth="1.2"/>
                <path d="M11 16h10M16 11v10" stroke={CREAM} strokeWidth="1.2" strokeLinecap="round"/>
              </svg>
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
            background: `${DARK}f5`,
            display: "flex", alignItems: "center", justifyContent: "center",
            backdropFilter: "blur(8px)",
          }}
        >
          <button
            onClick={e => { e.stopPropagation(); prev(); }}
            className="r04-lb-btn"
            aria-label="Předchozí"
            style={{
              position: "absolute", left: 20, top: "50%", transform: "translateY(-50%)",
              background: `${DARK}aa`, border: `1px solid ${CREAM}33`,
              borderRadius: "50%", width: 52, height: 52,
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", color: CREAM,
            }}
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M11 4L6 9L11 14" stroke={CREAM} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <img
            src={images[lightbox]?.url}
            alt={images[lightbox]?.alt ?? ""}
            onClick={e => e.stopPropagation()}
            style={{
              maxWidth: "88vw", maxHeight: "86vh",
              objectFit: "contain", borderRadius: 3,
              boxShadow: "0 32px 80px -20px rgba(0,0,0,0.7)",
            }}
          />
          <button
            onClick={e => { e.stopPropagation(); next(); }}
            className="r04-lb-btn"
            aria-label="Další"
            style={{
              position: "absolute", right: 20, top: "50%", transform: "translateY(-50%)",
              background: `${DARK}aa`, border: `1px solid ${CREAM}33`,
              borderRadius: "50%", width: 52, height: 52,
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", color: CREAM,
            }}
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M7 4L12 9L7 14" stroke={CREAM} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <button
            onClick={close}
            className="r04-lb-close"
            aria-label="Zavřít"
            style={{
              position: "absolute", top: 20, right: 24,
              background: `${DARK}99`, border: `1px solid ${CREAM}33`,
              borderRadius: "50%", width: 44, height: 44,
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", color: CREAM, fontSize: 22, lineHeight: 1,
            }}
          >×</button>
          <p style={{
            position: "absolute", bottom: 24, left: "50%", transform: "translateX(-50%)",
            fontFamily: SANS, fontSize: 12, color: `${CREAM}77`, margin: 0,
            letterSpacing: "0.14em", fontWeight: 600,
          }}>
            {lightbox + 1} / {images.length}
          </p>
        </div>
      )}
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
  sectionId: number;
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
    <section id={String(sectionId)} style={{ background: "#fff" }}>
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

// ═══════════════════════════════════════════════════════════════════════════
// UNIVERSAL GALLERY — jedna komponenta, 6 skinů, 3 palette modes
// ═══════════════════════════════════════════════════════════════════════════
// Použití v template.json: { type: "gallery", variant: "gallery-universal" }
// Editor fields:
//   - skin: "wall" | "tiles" | "bento" | "mosaic" | "editorial" | "slider"
//   - palette: "auto" | "cream-light" | "warm-dark" | "mono-light" | "mono-dark"
//   - eyebrow, title, subtitle (optional, conditional header)
//   - images: [{url, fullUrl, alt}, ...]
//   - accent (optional hex override — default gold #c8a96e)
// ═══════════════════════════════════════════════════════════════════════════
function GalleryUniversal({
  content, sectionId, images, rawArray, activeImage, setActiveImage,
}: {
  content: Record<string, unknown>;
  sectionId: number;
  images: GalleryImage[];
  rawArray: unknown[];
  activeImage: GalleryImage | null;
  setActiveImage: (img: GalleryImage | null) => void;
}) {
  const skin     = String(content.skin     ?? "tiles");
  const palette  = String(content.palette  ?? "auto");
  const accent   = String(content.accent   ?? "#c8a96e");
  const eyebrow  = String(content.eyebrow  ?? "");
  const title    = String(content.title    ?? "");
  const subtitle = String(content.subtitle ?? "");
  const showHeader = !!(eyebrow.trim() || title.trim() || subtitle.trim());

  // Palette mode → CSS variables
  const palettes: Record<string, Record<string, string>> = {
    "auto":         { bg: "#f9f7f5", surface: "#1c1410", text: "#1a1a1a", textMuted: "#666", accent, gold: accent, cursorBg: "rgba(28,20,16,0.85)" },
    "cream-light":  { bg: "#f9f7f5", surface: "#ffffff", text: "#1a1a1a", textMuted: "#666", accent, gold: accent, cursorBg: "rgba(249,247,245,0.92)" },
    "warm-dark":    { bg: "#1c1410", surface: "#0f0a07", text: "#f5efe6", textMuted: "rgba(245,239,230,0.72)", accent, gold: accent, cursorBg: "rgba(28,20,16,0.85)" },
    "mono-light":   { bg: "#ffffff", surface: "#fafafa", text: "#0a0a0a", textMuted: "#666", accent: "#0a0a0a", gold: "#0a0a0a", cursorBg: "rgba(255,255,255,0.92)" },
    "mono-dark":    { bg: "#0a0a0a", surface: "#1a1a1a", text: "#f5f5f5", textMuted: "#999", accent: "#f5f5f5", gold: "#f5f5f5", cursorBg: "rgba(10,10,10,0.85)" },
  };
  const p = palettes[palette] || palettes["auto"];

  // Lightbox navigation
  const activeIdx = activeImage ? images.findIndex(im => im.url === activeImage.url) : -1;
  const goPrev = () => { if (activeIdx > 0) setActiveImage(images[activeIdx - 1]); };
  const goNext = () => { if (activeIdx >= 0 && activeIdx < images.length - 1) setActiveImage(images[activeIdx + 1]); };

  // Custom luxe cursor — SVG data URI with accent color
  const accentHex = (p.gold || "#c8a96e").replace("#", "%23");
  const cursorBg = p.cursorBg;
  const luxeCursor = `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 32 32'><circle cx='16' cy='16' r='13' fill='${cursorBg}' stroke='${accentHex}' stroke-width='1.2'/><path d='M11 11 L11 14 M11 11 L14 11 M21 11 L21 14 M21 11 L18 11 M11 21 L11 18 M11 21 L14 21 M21 21 L21 18 M21 21 L18 21' stroke='${accentHex}' stroke-width='1.6' stroke-linecap='round' fill='none'/></svg>") 16 16, pointer`;

  // Tile renderer — used by all skins
  const Tile = ({ img, i, className, style }: { img: GalleryImage; i: number; className?: string; style?: React.CSSProperties }) => (
    <div
      className={`gu-tile ${className ?? ""}`}
      style={{
        position: "relative",
        overflow: "hidden",
        cursor: luxeCursor as string,
        ...style,
      }}
      onClick={() => setActiveImage(img)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === "Enter") setActiveImage(img); }}
      aria-label={img.alt ?? `Foto ${i + 1}`}
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
        <img src={img.url!} alt={img.alt ?? `Foto ${i + 1}`} loading="lazy" className="gu-img" />
      </GenericEditableImage>

      {/* Gold corner brackets reveal on hover */}
      <span aria-hidden className="gu-bracket gu-bracket-tl" style={{ borderColor: p.gold }} />
      <span aria-hidden className="gu-bracket gu-bracket-br" style={{ borderColor: p.gold }} />

      {/* Caption overlay */}
      <div className="gu-overlay">
        <span aria-hidden className="gu-cap-line" style={{ backgroundColor: p.gold }} />
        <span className="gu-cap-text">{img.alt ?? `Foto ${i + 1}`}</span>
      </div>
    </div>
  );

  // ── Skin renderers ───────────────────────────────────────────────────────
  const renderWall = () => (
    <div className="gu-grid gu-grid-wall">
      {images.map((img, i) => <Tile key={i} img={img} i={i} />)}
    </div>
  );

  const renderTiles = () => (
    <div className="gu-grid gu-grid-tiles">
      {images.map((img, i) => <Tile key={i} img={img} i={i} style={{ aspectRatio: "1 / 1" }} />)}
    </div>
  );

  const renderBento = () => (
    <div className="gu-grid gu-grid-bento">
      {images.map((img, i) => (
        <Tile
          key={i}
          img={img}
          i={i}
          className={
            i === 0 ? "gu-bento-hero" :
            i === 3 ? "gu-bento-wide" :
            i === 5 ? "gu-bento-wide" : ""
          }
        />
      ))}
    </div>
  );

  const renderMosaic = () => {
    // Mosaic — mixed aspect ratios in rows
    const aspects = ["1 / 1", "3 / 4", "4 / 3", "1 / 1", "3 / 4", "4 / 3", "1 / 1", "1 / 1"];
    return (
      <div className="gu-grid gu-grid-mosaic">
        {images.map((img, i) => <Tile key={i} img={img} i={i} style={{ aspectRatio: aspects[i % aspects.length] }} />)}
      </div>
    );
  };

  const renderEditorial = () => (
    <div className="gu-grid gu-grid-editorial">
      {images.map((img, i) => (
        <div key={i} className={`gu-edit-row ${i % 2 === 0 ? "gu-edit-left" : "gu-edit-right"}`}>
          <Tile img={img} i={i} className="gu-edit-img" />
          {img.alt && (
            <div className="gu-edit-caption">
              <span style={{ width: 36, height: 1, backgroundColor: p.gold, display: "inline-block", marginBottom: 14 }} />
              <p style={{ fontFamily: "'Libre Baskerville', Georgia, serif", fontStyle: "italic", fontSize: "1.05rem", color: p.text, margin: 0, lineHeight: 1.65 }}>
                {img.alt}
              </p>
              <p style={{ fontFamily: "'Source Sans Pro', system-ui, sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: "0.32em", textTransform: "uppercase", color: p.gold, margin: "12px 0 0" }}>
                {String(i + 1).padStart(2, "0")} / {String(images.length).padStart(2, "0")}
              </p>
            </div>
          )}
        </div>
      ))}
    </div>
  );

  const renderSlider = () => (
    <div className="gu-slider-wrap">
      <div className="gu-slider">
        {images.map((img, i) => (
          <div key={i} className="gu-slide">
            <Tile img={img} i={i} style={{ aspectRatio: "3 / 4" }} />
          </div>
        ))}
      </div>
      <p className="gu-slider-hint" style={{ color: p.textMuted }}>
        ← Posunout dlaždice →
      </p>
    </div>
  );

  const renderSkin = () => {
    switch (skin) {
      case "wall":      return renderWall();
      case "bento":     return renderBento();
      case "mosaic":    return renderMosaic();
      case "editorial": return renderEditorial();
      case "slider":    return renderSlider();
      case "tiles":
      default:          return renderTiles();
    }
  };

  return (
    <section
      id="gallery"
      className="gallery-universal"
      data-skin={skin}
      data-palette={palette}
      style={{
        backgroundColor: p.bg,
        color: p.text,
        position: "relative",
        overflow: "hidden",
        paddingBlock: "clamp(80px, 12vw, 130px)",
        paddingInline: skin === "wall" ? 0 : "clamp(20px, 5vw, 40px)",
        ["--gu-gold" as never]: p.gold,
        ["--gu-text" as never]: p.text,
        ["--gu-text-muted" as never]: p.textMuted,
        ["--gu-bg" as never]: p.bg,
        ["--gu-surface" as never]: p.surface,
      }}
    >
      {/* Editorial header — conditional */}
      {showHeader && (
        <div className="gu-header" style={{ textAlign: "center", maxWidth: 760, margin: "0 auto", marginBottom: "clamp(48px, 7vw, 72px)", paddingInline: skin === "wall" ? "clamp(20px, 5vw, 40px)" : 0 }}>
          {eyebrow && (
            <div style={{ display: "inline-flex", alignItems: "center", gap: 14, marginBottom: 22 }}>
              <span aria-hidden style={{ width: 36, height: 1, backgroundColor: p.gold }} />
              <span style={{
                fontFamily: "'Libre Baskerville', Georgia, serif",
                fontStyle: "italic",
                fontSize: "12px",
                letterSpacing: "0.28em",
                textTransform: "uppercase",
                color: p.gold,
              }}>
                <GenericEditableText sectionId={sectionId} field="eyebrow" value={eyebrow} tag="span" />
              </span>
              <span aria-hidden style={{ width: 36, height: 1, backgroundColor: p.gold }} />
            </div>
          )}
          {title && (
            <h2 style={{
              fontFamily: "'Libre Baskerville', Georgia, serif",
              fontSize: "clamp(2rem, 4.2vw, 3rem)",
              fontWeight: 700,
              lineHeight: 1.12,
              letterSpacing: "0.02em",
              color: p.text,
              margin: "0 auto 18px",
              maxWidth: 720,
            }}>
              <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
            </h2>
          )}
          {subtitle && (
            <p style={{
              fontFamily: "'Source Sans Pro', system-ui, sans-serif",
              fontSize: "clamp(0.98rem, 1.4vw, 1.1rem)",
              fontWeight: 300,
              color: p.textMuted,
              lineHeight: 1.7,
              margin: "0 auto",
              maxWidth: 600,
            }}>
              <GenericEditableText sectionId={sectionId} field="subtitle" value={subtitle} tag="span" />
            </p>
          )}
        </div>
      )}

      {renderSkin()}

      {/* Shared lightbox — prev/next/counter/keyboard nav */}
      {activeImage && (
        <div
          className="gu-lightbox"
          role="dialog"
          aria-modal="true"
          onClick={() => setActiveImage(null)}
          onKeyDown={(e) => {
            if (e.key === "Escape") setActiveImage(null);
            if (e.key === "ArrowLeft") goPrev();
            if (e.key === "ArrowRight") goNext();
          }}
          tabIndex={-1}
          ref={(el) => { if (el) el.focus(); }}
          style={{ ["--gu-gold" as never]: p.gold }}
        >
          <button className="gu-lb-close" onClick={(e) => { e.stopPropagation(); setActiveImage(null); }} aria-label="Zavřít">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
          {activeIdx > 0 && (
            <button className="gu-lb-nav gu-lb-prev" onClick={(e) => { e.stopPropagation(); goPrev(); }} aria-label="Předchozí">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6"/>
              </svg>
            </button>
          )}
          {activeIdx >= 0 && activeIdx < images.length - 1 && (
            <button className="gu-lb-nav gu-lb-next" onClick={(e) => { e.stopPropagation(); goNext(); }} aria-label="Další">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </button>
          )}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            key={activeImage.url}
            className="gu-lb-img"
            src={activeImage.fullUrl || activeImage.url}
            alt={activeImage.alt ?? ""}
            onClick={(e) => e.stopPropagation()}
          />
          {activeImage.alt && (
            <div className="gu-lb-caption">{activeImage.alt}</div>
          )}
          {activeIdx >= 0 && (
            <div className="gu-lb-counter">
              <span>{String(activeIdx + 1).padStart(2, "0")} / {String(images.length).padStart(2, "0")}</span>
            </div>
          )}
        </div>
      )}
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
  const titleRaw    = (content as Record<string, unknown>).title;
  const eyebrowRaw  = (content as Record<string, unknown>).eyebrow;
  const subtitleRaw = (content as Record<string, unknown>).subtitle;
  const title    = titleRaw    === undefined ? "Naše práce"      : String(titleRaw);
  const eyebrow  = eyebrowRaw  === undefined ? "Naše portfolio"  : String(eyebrowRaw);
  const subtitle = subtitleRaw === undefined ? "Vyberte si z naší galerie střihů, holení a finálního stylingu — každá fotka je skutečný klient ze studia v Brně." : String(subtitleRaw);
  const showHeader = !!(eyebrow.trim() || title.trim() || subtitle.trim());

  const GOLD   = "#C9A84C";
  const BG     = "#0a0a0a";
  const SERIF  = "var(--font-heading, Playfair Display, serif)";
  const SANS   = "var(--font-body, Inter, sans-serif)";

  // Lightbox keyboard nav
  const activeIdx = activeImage ? images.findIndex(im => im.url === activeImage.url) : -1;
  const goPrev = () => { if (activeIdx > 0) setActiveImage(images[activeIdx - 1]); };
  const goNext = () => { if (activeIdx >= 0 && activeIdx < images.length - 1) setActiveImage(images[activeIdx + 1]); };

  return (
    <section style={{ backgroundColor: BG, padding: "clamp(80px, 12vh, 130px) 24px", position: "relative", overflow: "hidden" }} data-template="barber-01">
      <style>{`
        /* Uniform grid — všechny karty stejně velké, čtvercový 1:1 aspect */
        .bc-gallery-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 10px;
          max-width: 1320px;
          margin: 0 auto;
        }
        .bc-gallery-item {
          position: relative; overflow: hidden;
          /* Custom gold "expand corners" cursor — luxe, ne lupa */
          cursor: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 32 32'><circle cx='16' cy='16' r='13' fill='rgba(10,10,10,0.85)' stroke='%23C9A84C' stroke-width='1.2'/><path d='M11 11 L11 14 M11 11 L14 11 M21 11 L21 14 M21 11 L18 11 M11 21 L11 18 M11 21 L14 21 M21 21 L21 18 M21 21 L18 21' stroke='%23C9A84C' stroke-width='1.6' stroke-linecap='round' fill='none'/></svg>") 16 16, pointer;
          aspect-ratio: 1 / 1;
          opacity: 0; transform: translateY(24px);
          animation: bcGalFadeUp 0.65s cubic-bezier(.22,.68,0,1.1) forwards;
        }
        .bc-gallery-item:nth-child(1) { animation-delay: 0.05s; }
        .bc-gallery-item:nth-child(2) { animation-delay: 0.12s; }
        .bc-gallery-item:nth-child(3) { animation-delay: 0.19s; }
        .bc-gallery-item:nth-child(4) { animation-delay: 0.26s; }
        .bc-gallery-item:nth-child(5) { animation-delay: 0.33s; }
        .bc-gallery-item:nth-child(6) { animation-delay: 0.40s; }
        .bc-gallery-item:nth-child(n+7) { animation-delay: 0.47s; }
        @keyframes bcGalFadeUp { to { opacity: 1; transform: translateY(0); } }

        .bc-gallery-item img {
          width: 100%; height: 100%; object-fit: cover;
          transition: transform 0.85s cubic-bezier(.2,.6,.15,1), filter 0.5s ease;
          filter: grayscale(0.15) brightness(0.92);
        }
        .bc-gallery-item:hover img {
          transform: scale(1.08);
          filter: grayscale(0) brightness(1);
        }

        /* Dark overlay with gold caption + zoom icon */
        .bc-gallery-overlay {
          position: absolute; inset: 0;
          background: linear-gradient(to top, rgba(10,10,10,0.85) 0%, rgba(10,10,10,0.18) 45%, rgba(10,10,10,0.45) 100%);
          opacity: 0; transition: opacity 0.4s ease;
          display: flex; flex-direction: column; justify-content: space-between;
          padding: 22px;
        }
        .bc-gallery-item:hover .bc-gallery-overlay { opacity: 1; }

        /* Gold corner brackets — appear on hover */
        .bc-gallery-bracket {
          position: absolute; width: 18px; height: 18px;
          opacity: 0; transition: opacity 0.4s ease, transform 0.4s ease;
        }
        .bc-gallery-item:hover .bc-gallery-bracket { opacity: 1; }
        .bc-gallery-bracket.tl { top: 14px; left: 14px; border-top: 1px solid ${GOLD}; border-left: 1px solid ${GOLD}; transform: translate(6px, 6px); }
        .bc-gallery-bracket.tr { top: 14px; right: 14px; border-top: 1px solid ${GOLD}; border-right: 1px solid ${GOLD}; transform: translate(-6px, 6px); }
        .bc-gallery-bracket.bl { bottom: 14px; left: 14px; border-bottom: 1px solid ${GOLD}; border-left: 1px solid ${GOLD}; transform: translate(6px, -6px); }
        .bc-gallery-bracket.br { bottom: 14px; right: 14px; border-bottom: 1px solid ${GOLD}; border-right: 1px solid ${GOLD}; transform: translate(-6px, -6px); }
        .bc-gallery-item:hover .bc-gallery-bracket.tl,
        .bc-gallery-item:hover .bc-gallery-bracket.tr,
        .bc-gallery-item:hover .bc-gallery-bracket.bl,
        .bc-gallery-item:hover .bc-gallery-bracket.br { transform: translate(0, 0); }

        /* Caption */
        .bc-gallery-caption {
          color: #F5F5F5;
          font-family: ${SANS};
          font-size: 12px; font-weight: 700; letter-spacing: 0.18em; text-transform: uppercase;
          transform: translateY(12px);
          transition: transform 0.45s cubic-bezier(.22,.68,0,1.1);
          margin-top: auto;
        }
        .bc-gallery-item:hover .bc-gallery-caption { transform: translateY(0); }
        .bc-gallery-caption-line {
          width: 24px; height: 1px; background: ${GOLD}; margin-bottom: 8px;
          transform: scaleX(0); transform-origin: left; transition: transform 0.5s ease 0.1s;
        }
        .bc-gallery-item:hover .bc-gallery-caption-line { transform: scaleX(1); }

        /* Lightbox */
        .bc-gallery-lightbox {
          position: fixed; inset: 0; z-index: 1000;
          background: rgba(8,8,8,0.96);
          backdrop-filter: blur(12px);
          display: flex; align-items: center; justify-content: center;
          cursor: pointer;
          animation: bcLbFade 0.25s ease;
        }
        @keyframes bcLbFade { from { opacity: 0; } to { opacity: 1; } }
        .bc-gallery-lightbox img {
          max-width: 88vw; max-height: 82vh; object-fit: contain; cursor: default;
          box-shadow: 0 30px 100px rgba(0,0,0,0.7);
          animation: bcLbZoom 0.4s cubic-bezier(.22,.68,0,1.1);
        }
        @keyframes bcLbZoom { from { opacity: 0; transform: scale(0.92); } to { opacity: 1; transform: scale(1); } }
        .bc-gallery-lb-close, .bc-gallery-lb-nav {
          position: absolute; background: rgba(255,255,255,0.06); border: 1px solid rgba(201,168,76,0.4);
          color: #fff; cursor: pointer;
          width: 52px; height: 52px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          transition: background 0.25s, border-color 0.25s, color 0.25s;
        }
        .bc-gallery-lb-close { top: 28px; right: 28px; }
        .bc-gallery-lb-nav.prev { left: 28px; top: 50%; transform: translateY(-50%); }
        .bc-gallery-lb-nav.next { right: 28px; top: 50%; transform: translateY(-50%); }
        .bc-gallery-lb-close:hover, .bc-gallery-lb-nav:hover {
          background: rgba(201,168,76,0.2); border-color: ${GOLD}; color: ${GOLD};
        }
        .bc-gallery-lb-counter {
          position: absolute; bottom: 32px; left: 50%; transform: translateX(-50%);
          color: rgba(245,245,245,0.85);
          font-family: ${SANS}; font-size: 11px; font-weight: 700; letter-spacing: 0.32em; text-transform: uppercase;
          display: flex; align-items: center; gap: 14px;
        }
        .bc-gallery-lb-counter::before, .bc-gallery-lb-counter::after {
          content: ''; width: 24px; height: 1px; background: ${GOLD};
        }
        .bc-gallery-lb-caption {
          position: absolute; bottom: 80px; left: 50%; transform: translateX(-50%);
          max-width: 70vw; text-align: center;
          color: rgba(245,245,245,0.7); font-family: ${SANS}; font-size: 13px;
          font-style: italic;
        }

        /* Tablet */
        @media (max-width: 900px) { .bc-gallery-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 520px) {
          .bc-gallery-grid { grid-template-columns: 1fr; }
          .bc-gallery-lb-nav.prev { left: 12px; }
          .bc-gallery-lb-nav.next { right: 12px; }
        }
      `}</style>

      {/* Decorative ornament */}
      <div aria-hidden style={{
        position: "absolute", bottom: -60, right: -60, width: 320, height: 320, opacity: 0.025, zIndex: 0,
        backgroundImage: "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23C9A84C' stroke-width='1' stroke-linecap='round' stroke-linejoin='round'><circle cx='6' cy='6' r='3'/><circle cx='6' cy='18' r='3'/><line x1='20' y1='4' x2='8.12' y2='15.88'/><line x1='14.47' y1='14.48' x2='20' y2='20'/><line x1='8.12' y1='8.12' x2='12' y2='12'/></svg>\")",
        backgroundSize: "contain", backgroundRepeat: "no-repeat", transform: "rotate(20deg)",
      }} />

      {/* Header — skipped on subpages where banner already shows page title */}
      {showHeader && (
        <div style={{ textAlign: "center", maxWidth: 760, margin: "0 auto clamp(48px, 7vw, 72px)", position: "relative", zIndex: 1 }}>
          {eyebrow.trim() && (
            <div style={{ display: "inline-flex", alignItems: "center", gap: 14, marginBottom: 22 }}>
              <span aria-hidden style={{ width: 36, height: 1, background: GOLD }} />
              <GenericEditableText sectionId={sectionId} field="eyebrow" value={eyebrow} tag="span" className="services-eyebrow" />
              <span aria-hidden style={{ width: 36, height: 1, background: GOLD }} />
            </div>
          )}
          {title.trim() && (
            <h2 className="services-title" style={{ fontFamily: SERIF, fontSize: "clamp(2.2rem, 4.5vw, 3.2rem)", fontWeight: 700, color: "#F5F5F5", margin: "0 0 22px", letterSpacing: "-0.01em", lineHeight: 1.05 }}>
              <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
            </h2>
          )}
          {subtitle.trim() && (
            <p style={{ fontFamily: SANS, color: "rgba(245,245,245,0.7)", fontSize: "clamp(0.95rem, 1.05vw, 1.05rem)", lineHeight: 1.6, fontWeight: 300, margin: 0 }}>
              <GenericEditableText sectionId={sectionId} field="subtitle" value={subtitle} tag="span" />
            </p>
          )}
        </div>
      )}

      {/* Bento Grid */}
      <div className="bc-gallery-grid">
        {images.map((img, i) => (
          <div
            key={i}
            className="bc-gallery-item"
            onClick={() => setActiveImage(img)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === "Enter") setActiveImage(img); }}
            aria-label={img.alt ?? `Foto ${i + 1}`}
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

            <span aria-hidden className="bc-gallery-bracket tl" />
            <span aria-hidden className="bc-gallery-bracket tr" />
            <span aria-hidden className="bc-gallery-bracket bl" />
            <span aria-hidden className="bc-gallery-bracket br" />

            <div className="bc-gallery-overlay">
              <div className="bc-gallery-caption">
                <div className="bc-gallery-caption-line" />
                {img.alt ?? `Foto ${i + 1}`}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox with navigation */}
      {activeImage && (
        <div
          className="bc-gallery-lightbox"
          onClick={() => setActiveImage(null)}
          role="dialog"
          aria-modal="true"
          onKeyDown={(e) => {
            if (e.key === "Escape") setActiveImage(null);
            if (e.key === "ArrowLeft") goPrev();
            if (e.key === "ArrowRight") goNext();
          }}
          tabIndex={-1}
          ref={(el) => { if (el) el.focus(); }}
        >
          <button className="bc-gallery-lb-close" onClick={(e) => { e.stopPropagation(); setActiveImage(null); }} aria-label="Zavřít">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>

          {activeIdx > 0 && (
            <button className="bc-gallery-lb-nav prev" onClick={(e) => { e.stopPropagation(); goPrev(); }} aria-label="Předchozí">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6"/>
              </svg>
            </button>
          )}
          {activeIdx >= 0 && activeIdx < images.length - 1 && (
            <button className="bc-gallery-lb-nav next" onClick={(e) => { e.stopPropagation(); goNext(); }} aria-label="Další">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </button>
          )}

          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            key={activeImage.url}
            src={activeImage.fullUrl || activeImage.url}
            alt={activeImage.alt ?? ""}
            onClick={(e) => e.stopPropagation()}
          />

          {activeImage.alt && (
            <div className="bc-gallery-lb-caption">{activeImage.alt}</div>
          )}

          {activeIdx >= 0 && (
            <div className="bc-gallery-lb-counter">
              <span>{String(activeIdx + 1).padStart(2, "0")} / {String(images.length).padStart(2, "0")}</span>
            </div>
          )}
        </div>
      )}
    </section>
  );
}


// barber-04 galerie. Vlastní komponenta, aby se hooks nevolaly až za early
// returny dispatcheru — jinak změna varianty za běhu mění počet hooks.
function GalleryBarber04({ content, images, rawArray, activeImage, setActiveImage, sectionId }: { content: Record<string, unknown>; images: GalleryImage[]; rawArray: unknown[]; activeImage: GalleryImage | null; setActiveImage: (img: GalleryImage | null) => void; sectionId: number }) {
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

// four-col / four-col-contained. Vlastní komponenta, aby se hooks nevolaly až
// za early returny dispatcheru — jinak změna varianty za běhu mění počet hooks.
function GalleryFourCol({ content, variant, images, rawArray, activeImage, setActiveImage, sectionId }: { content: Record<string, unknown>; variant?: string; images: GalleryImage[]; rawArray: unknown[]; activeImage: GalleryImage | null; setActiveImage: (img: GalleryImage | null) => void; sectionId: number }) {
  const c = content as { title?: string };
    const contained = variant === "four-col-contained";
    const tileRadius = contained ? 0 : 0;
    const isB02 = !contained;
    const b02Eyebrow  = String((content as Record<string, unknown>).eyebrow ?? "");
    const b02Subtitle = String((content as Record<string, unknown>).subtitle ?? "");
    const b03gHeadRef = useRef<HTMLHeadingElement>(null);
    const b03gGridRef = useRef<HTMLDivElement>(null);
    const b02HeaderRef = useRef<HTMLDivElement>(null);
    const b02GridRef   = useRef<HTMLDivElement>(null);
    useEffect(() => {
      if (contained) {
        const els = [b03gHeadRef.current, b03gGridRef.current].filter(Boolean) as HTMLElement[];
        const obs = els.map((el, i) => {
          const o = new IntersectionObserver(([e]) => { if (e.isIntersecting) { el.style.animationDelay = `${i * 0.15}s`; el.classList.add("b03g-vis"); o.disconnect(); } }, { threshold: 0.08 });
          o.observe(el); return o;
        });
        return () => obs.forEach(o => o.disconnect());
      } else {
        const els = [b02HeaderRef.current, b02GridRef.current].filter(Boolean) as HTMLElement[];
        const obs = els.map((el, i) => {
          const o = new IntersectionObserver(([e]) => { if (e.isIntersecting) { el.style.animationDelay = `${i * 0.18}s`; el.classList.add("b02a-vis"); o.disconnect(); } }, { threshold: 0.08 });
          o.observe(el); return o;
        });
        return () => obs.forEach(o => o.disconnect());
      }
    }, [contained]);
    return (
      <section
        style={{
          padding: contained ? "clamp(96px, 13vw, 150px) 0" : 0,
          backgroundColor: contained ? "#1c1410" : "#1a1410",
          position: contained ? "relative" : undefined,
          overflow: contained ? "hidden" : undefined,
        }}
        data-template={contained ? "barber-03" : (isB02 ? "barber-02" : undefined)}
      >
        {/* barber-02 header strip — DARK pre-section creates rhythm cream → dark → cream */}
        {isB02 && (c.title || b02Eyebrow || b02Subtitle) && (
          <div
            ref={b02HeaderRef}
            className="b02a-reveal"
            style={{
              backgroundColor: "#1a1410",
              padding: "clamp(80px, 11vw, 120px) clamp(20px, 5vw, 40px) clamp(60px, 9vw, 96px)",
              textAlign: "center",
              position: "relative",
              borderTop: "1px solid rgba(212,169,110,0.18)",
            }}
          >
            {/* Top decorative gold hairline accent */}
            <div aria-hidden style={{
              position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)",
              width: 120, height: 1,
              background: "linear-gradient(90deg, transparent, #d4a96e 50%, transparent)",
            }} />

            {b02Eyebrow && (
              <div style={{ display: "inline-flex", alignItems: "center", gap: 12, marginBottom: 22 }}>
                <span aria-hidden style={{ width: 36, height: 1, backgroundColor: "#d4a96e" }} />
                <span style={{
                  fontFamily: "'Libre Baskerville', Georgia, serif",
                  fontStyle: "italic",
                  fontSize: "12px",
                  letterSpacing: "0.22em",
                  textTransform: "uppercase",
                  color: "#d4a96e",
                }}>
                  <GenericEditableText sectionId={sectionId} field="eyebrow" value={b02Eyebrow} tag="span" />
                </span>
                <span aria-hidden style={{ width: 36, height: 1, backgroundColor: "#d4a96e" }} />
              </div>
            )}
            {c.title && (
              <h2 style={{
                fontFamily: "'Libre Baskerville', Georgia, serif",
                fontSize: "clamp(2rem, 4vw, 3rem)",
                fontWeight: 700,
                lineHeight: 1.15,
                letterSpacing: "0.04em",
                color: "#f5efe6",
                margin: "0 auto 18px",
                maxWidth: 720,
              }}>
                <GenericEditableText sectionId={sectionId} field="title" value={c.title} tag="span" />
              </h2>
            )}
            {b02Subtitle && (
              <p style={{
                fontFamily: "'Source Sans Pro', system-ui, sans-serif",
                fontSize: "clamp(0.98rem, 1.4vw, 1.1rem)",
                fontWeight: 300,
                color: "rgba(245,239,230,0.7)",
                lineHeight: 1.7,
                margin: "0 auto",
                maxWidth: 620,
              }}>
                <GenericEditableText sectionId={sectionId} field="subtitle" value={b02Subtitle} tag="span" />
              </p>
            )}
            {/* Bottom decorative rule */}
            <div aria-hidden style={{ display: "inline-flex", alignItems: "center", gap: 14, marginTop: 32 }}>
              <span style={{ width: 48, height: 1, backgroundColor: "rgba(212,169,110,0.55)" }} />
              <span style={{ width: 5, height: 5, borderRadius: "50%", backgroundColor: "#d4a96e" }} />
              <span style={{ width: 48, height: 1, backgroundColor: "rgba(212,169,110,0.55)" }} />
            </div>
          </div>
        )}
        <style>{`
          [data-four-col-gallery] { grid-template-columns: repeat(2, 1fr) !important; }
          @media (min-width: 640px) { [data-four-col-gallery] { grid-template-columns: repeat(4, 1fr) !important; } }
        `}</style>
        {contained && <style>{`
          @keyframes b03FadeUp { from { opacity:0; transform:translateY(32px); } to { opacity:1; transform:translateY(0); } }
          .b03g-reveal { opacity: 0; }
          .b03g-reveal.b03g-vis { animation: b03FadeUp 0.72s cubic-bezier(.22,.68,0,1.2) forwards; }
        `}</style>}
        {contained && (() => {
          const b03Eyebrow  = String((content as Record<string, unknown>).eyebrow  ?? "");
          const b03Subtitle = String((content as Record<string, unknown>).subtitle ?? "");
          if (!b03Eyebrow && !b03Subtitle && !c.title) return null;
          return (
            <>
              {/* Top + bottom gold hairlines + warm radial glow — sit on the parent section */}
              <div aria-hidden style={{
                position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)",
                width: 180, height: 1,
                background: "linear-gradient(90deg, transparent, #c8a96e 50%, transparent)",
              }} />
              <div aria-hidden style={{
                position: "absolute", bottom: 0, left: "50%", transform: "translateX(-50%)",
                width: 180, height: 1,
                background: "linear-gradient(90deg, transparent, rgba(200,169,110,0.5) 50%, transparent)",
              }} />
              <div aria-hidden style={{
                position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0,
                background: "radial-gradient(ellipse at 50% 0%, rgba(200,169,110,0.07) 0%, transparent 55%)",
              }} />
              <div
                ref={b03gHeadRef}
                className="b03g-reveal text-center"
                style={{
                  maxWidth: 720,
                  margin: "0 auto",
                  padding: "0 24px",
                  marginBottom: "clamp(48px, 7vw, 72px)",
                  position: "relative",
                  zIndex: 1,
                }}
              >
                {b03Eyebrow && (
                  <div style={{ display: "inline-flex", alignItems: "center", gap: 14, marginBottom: 22 }}>
                    <span aria-hidden style={{ width: 42, height: 1, backgroundColor: "#c8a96e" }} />
                    <span style={{
                      fontFamily: "'Libre Baskerville', Georgia, serif",
                      fontStyle: "italic",
                      fontSize: "12px",
                      letterSpacing: "0.28em",
                      textTransform: "uppercase",
                      color: "#c8a96e",
                    }}>
                      <GenericEditableText sectionId={sectionId} field="eyebrow" value={b03Eyebrow} tag="span" />
                    </span>
                    <span aria-hidden style={{ width: 42, height: 1, backgroundColor: "#c8a96e" }} />
                  </div>
                )}
                {c.title && (
                  <h2 style={{
                    fontFamily: "'Libre Baskerville', Georgia, serif",
                    fontSize: "clamp(2rem, 4.2vw, 3rem)",
                    fontWeight: 700,
                    lineHeight: 1.12,
                    letterSpacing: "0.04em",
                    color: "#f5efe6",
                    textTransform: "uppercase",
                    margin: "0 auto 18px",
                    maxWidth: 720,
                  }}>
                    <GenericEditableText sectionId={sectionId} field="title" value={c.title} tag="span" />
                  </h2>
                )}
                {b03Subtitle && (
                  <p style={{
                    fontFamily: "'Libre Baskerville', Georgia, serif",
                    fontStyle: "italic",
                    fontSize: "clamp(0.98rem, 1.4vw, 1.1rem)",
                    color: "rgba(245,239,230,0.72)",
                    lineHeight: 1.7,
                    margin: "0 auto",
                    maxWidth: 580,
                  }}>
                    <GenericEditableText sectionId={sectionId} field="subtitle" value={b03Subtitle} tag="span" />
                  </p>
                )}
                {/* Diamond rule */}
                <div aria-hidden style={{ display: "inline-flex", alignItems: "center", gap: 14, marginTop: 28 }}>
                  <span style={{ width: 48, height: 1, backgroundColor: "rgba(200,169,110,0.55)" }} />
                  <span style={{ width: 6, height: 6, backgroundColor: "#c8a96e", transform: "rotate(45deg)" }} />
                  <span style={{ width: 48, height: 1, backgroundColor: "rgba(200,169,110,0.55)" }} />
                </div>
              </div>
            </>
          );
        })()}
        <div
          ref={contained ? b03gGridRef : b02GridRef}
          data-four-col-gallery
          className={contained ? "b03g-reveal" : "b02a-reveal"}
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: contained ? "clamp(8px, 1.5vw, 16px)" : "6px",
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
        {activeImage?.url && (() => {
          const activeIdx = images.findIndex(im => im.url === activeImage.url);
          const goPrev = () => { if (activeIdx > 0) setActiveImage(images[activeIdx - 1]); };
          const goNext = () => { if (activeIdx >= 0 && activeIdx < images.length - 1) setActiveImage(images[activeIdx + 1]); };
          return (
            <div
              className="gallery-lightbox"
              role="dialog"
              aria-modal="true"
              onClick={() => setActiveImage(null)}
              onKeyDown={(e) => {
                if (e.key === "Escape") setActiveImage(null);
                if (e.key === "ArrowLeft") goPrev();
                if (e.key === "ArrowRight") goNext();
              }}
              tabIndex={-1}
              ref={(el) => { if (el) el.focus(); }}
            >
              <button
                className="gallery-lb-close"
                type="button"
                onClick={(e) => { e.stopPropagation(); setActiveImage(null); }}
                aria-label="Zavřít náhled"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>

              {activeIdx > 0 && (
                <button
                  className="gallery-lb-nav gallery-lb-prev"
                  type="button"
                  onClick={(e) => { e.stopPropagation(); goPrev(); }}
                  aria-label="Předchozí obrázek"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="15 18 9 12 15 6"/>
                  </svg>
                </button>
              )}
              {activeIdx >= 0 && activeIdx < images.length - 1 && (
                <button
                  className="gallery-lb-nav gallery-lb-next"
                  type="button"
                  onClick={(e) => { e.stopPropagation(); goNext(); }}
                  aria-label="Další obrázek"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6"/>
                  </svg>
                </button>
              )}

              <span className="gallery-lightbox-frame" onClick={(e) => e.stopPropagation()}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img key={activeImage.url} loading="lazy" src={activeImage.fullUrl || activeImage.url} alt={activeImage.alt || ""} />
              </span>

              {activeImage.alt && (
                <div className="gallery-lb-caption">{activeImage.alt}</div>
              )}

              {activeIdx >= 0 && (
                <div className="gallery-lb-counter">
                  <span>{String(activeIdx + 1).padStart(2, "0")} / {String(images.length).padStart(2, "0")}</span>
                </div>
              )}
            </div>
          );
        })()}
        <style>{`
          .gallery-lightbox{position:fixed;inset:0;z-index:80;display:grid;place-items:center;padding:24px;background:rgba(8,8,8,0.94);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);cursor:pointer;animation:b02LbFade 0.25s ease;}
          @keyframes b02LbFade{from{opacity:0;}to{opacity:1;}}
          .gallery-lightbox-frame{display:block;max-width:min(1100px,94vw);max-height:82vh;cursor:default;animation:b02LbZoom 0.4s cubic-bezier(.22,.68,0,1.1);}
          @keyframes b02LbZoom{from{opacity:0;transform:scale(.94);}to{opacity:1;transform:scale(1);}}
          .gallery-lightbox-frame img{display:block;max-width:100%;max-height:82vh;width:auto;height:auto;border-radius:4px;object-fit:contain;box-shadow:0 30px 100px rgba(0,0,0,0.7);}
          .gallery-lb-close,.gallery-lb-nav{position:absolute;background:rgba(255,255,255,0.06);border:1px solid rgba(212,169,110,0.4);color:#fff;cursor:pointer;width:52px;height:52px;border-radius:50%;display:flex;align-items:center;justify-content:center;transition:background 0.25s,border-color 0.25s,color 0.25s;}
          .gallery-lb-close{top:28px;right:28px;}
          .gallery-lb-prev{left:28px;top:50%;transform:translateY(-50%);}
          .gallery-lb-next{right:28px;top:50%;transform:translateY(-50%);}
          .gallery-lb-close:hover,.gallery-lb-nav:hover{background:rgba(212,169,110,0.2);border-color:#d4a96e;color:#d4a96e;}
          .gallery-lb-counter{position:absolute;bottom:32px;left:50%;transform:translateX(-50%);color:rgba(245,245,245,0.85);font-family:'Source Sans Pro',system-ui,sans-serif;font-size:11px;font-weight:700;letter-spacing:0.32em;text-transform:uppercase;display:flex;align-items:center;gap:14px;}
          .gallery-lb-counter::before,.gallery-lb-counter::after{content:'';width:24px;height:1px;background:#d4a96e;}
          .gallery-lb-caption{position:absolute;bottom:80px;left:50%;transform:translateX(-50%);max-width:70vw;text-align:center;color:rgba(245,245,245,0.7);font-family:'Libre Baskerville',Georgia,serif;font-size:13px;font-style:italic;}
          @media (max-width: 600px) {
            .gallery-lb-prev{left:12px;}
            .gallery-lb-next{right:12px;}
            .gallery-lb-close{top:16px;right:16px;}
          }
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


// ══ PROOF (proof-01) — Before/After comparison slider (nová capability) ════════
type BaItem = { beforeImage?: string; afterImage?: string; beforeLabel?: string; afterLabel?: string; caption?: string; slug?: string; title?: string; excerpt?: string };

function BeforeAfterCard({ item, sectionId, index }: { item: BaItem; sectionId: number; index: number }) {
  const [pos, setPos] = useState(50);
  const beforeImage = String(item.beforeImage ?? "");
  const afterImage  = String(item.afterImage ?? "");
  const beforeLabel = String(item.beforeLabel ?? "Před");
  const afterLabel  = String(item.afterLabel ?? "Po");
  const caption     = String(item.caption ?? "");
  return (
    <figure className="pf01ba-card">
      <div className="pf01ba-stage">
        <GenericEditableImage sectionId={sectionId} field={`items.${index}.afterImage`} src={afterImage} alt={afterLabel} className="pf01ba-imgslot">
          <img src={afterImage} alt={afterLabel} className="pf01ba-img" draggable={false} />
        </GenericEditableImage>
        <div className="pf01ba-before" style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }} aria-hidden="true">
          <GenericEditableImage sectionId={sectionId} field={`items.${index}.beforeImage`} src={beforeImage} alt={beforeLabel} className="pf01ba-imgslot">
            <img src={beforeImage} alt="" className="pf01ba-img" draggable={false} />
          </GenericEditableImage>
        </div>
        <span className="pf01ba-tag pf01ba-tag-before" style={{ opacity: pos > 12 ? 1 : 0 }}>{beforeLabel}</span>
        <span className="pf01ba-tag pf01ba-tag-after"  style={{ opacity: pos < 88 ? 1 : 0 }}>{afterLabel}</span>
        <div className="pf01ba-divider" style={{ left: `${pos}%` }} aria-hidden="true">
          <span className="pf01ba-handle">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6M9 6l6 6-6 6"/></svg>
          </span>
        </div>
        <input
          type="range"
          className="pf01ba-range"
          min={0}
          max={100}
          value={pos}
          onChange={(e) => setPos(Number(e.target.value))}
          aria-label={`Porovnání ${beforeLabel} / ${afterLabel}`}
        />
      </div>
      {caption && (
        <figcaption className="pf01ba-cap">
          <GenericEditableText sectionId={sectionId} field={`items.${index}.caption`} value={caption} tag="span" />
        </figcaption>
      )}
    </figure>
  );
}

function BeforeAfterProof01({ content, sectionId, tenantSlug, isAdmin }: { content: Record<string, unknown>; sectionId: number; tenantSlug?: string; isAdmin?: boolean }) {
  const eyebrow = String(content.eyebrow ?? "Realizace");
  const title   = String(content.title   ?? "Vidíte rozdíl — přetáhněte posuvník");
  const lead    = String(content.lead    ?? "Reálné zakázky před a po. Táhněte středem, nebo použijte šipky na klávesnici.");
  const items = (content.items as BaItem[] | undefined) ?? [];
  const detailCtaText = String(content.detailCtaText ?? "Zobrazit celou realizaci");
  return (
    <>
      <style>{`
        .pf01ba { --pf-accent:#C3352B; --pf-ink:#1B3A5C; --pf-muted:#6A6E78; --pf-border:#E5E1D8;
          background:var(--pf-paper,#F4F1EB); font-family:var(--font-body, system-ui, -apple-system, sans-serif); color:var(--pf-ink);
          padding:clamp(56px,8vw,104px) clamp(20px,5vw,48px); }
        .pf01ba-inner { max-width:1280px; margin:0 auto; }
        .pf01ba-head { max-width:640px; margin-bottom:clamp(32px,5vw,52px); }
        .pf01ba-title { font-family: var(--font-heading, system-ui, sans-serif); color: var(--pf-ink); font-size:clamp(1.8rem,3.6vw,2.75rem); font-weight:800; letter-spacing:-.02em; line-height:1.08; margin:0 0 14px; }
        .pf01ba-lead { font-size:1.05rem; color:var(--pf-muted); line-height:1.6; margin:0; }
        .pf01ba-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(min(100%,320px),1fr)); gap:22px; }
        .pf01ba-card { margin:0; }
        .pf01ba-stage { position:relative; border-radius:10px; overflow:hidden; aspect-ratio:4/3; background:#ddd; border:1px solid var(--pf-border); user-select:none; touch-action:pan-y; cursor:ew-resize; }
        .pf01ba-imgslot { position:absolute; inset:0; width:100%; height:100%; display:block; }
        .pf01ba-img { position:absolute; inset:0; width:100%; height:100%; object-fit:cover; display:block; }
        .pf01ba-before { position:absolute; inset:0; }
        .pf01ba-tag { position:absolute; top:14px; font-size:.72rem; font-weight:800; letter-spacing:.08em; text-transform:uppercase; color:#fff; background:rgba(27,58,92,.7); padding:5px 11px; border-radius:999px; transition:opacity .2s; pointer-events:none; }
        .pf01ba-tag-before { left:14px; } .pf01ba-tag-after { right:14px; background:var(--pf-accent); }
        .pf01ba-divider { position:absolute; top:0; bottom:0; width:3px; background:#fff; box-shadow:0 0 0 1px rgba(27,58,92,.15); transform:translateX(-50%); pointer-events:none; }
        .pf01ba-handle { position:absolute; top:50%; left:50%; transform:translate(-50%,-50%); width:46px; height:46px; border-radius:50%; background:#fff; color:var(--pf-ink); display:flex; align-items:center; justify-content:center; box-shadow:0 4px 16px rgba(27,58,92,.4); transition:transform .2s cubic-bezier(.22,.68,0,1), box-shadow .2s; }
        .pf01ba-stage:hover .pf01ba-handle { transform:translate(-50%,-50%) scale(1.08); box-shadow:0 0 0 6px rgba(195,53,43,.18), 0 6px 18px rgba(27,58,92,.45); }
        .pf01ba-stage:active .pf01ba-handle { transform:translate(-50%,-50%) scale(1.14); }
        .pf01ba-range { position:absolute; inset:0; width:100%; height:100%; margin:0; opacity:0; cursor:ew-resize; }
        .pf01ba-stage:focus-within .pf01ba-handle { box-shadow:0 0 0 4px rgba(195,53,43,.4), 0 4px 14px rgba(27,58,92,.35); }
        .pf01ba-cap { font-size:.92rem; font-weight:600; color:var(--pf-ink); margin-top:12px; }
        .pf01ba-detail { display:inline-flex; align-items:center; gap:6px; margin-top:8px; font-size:.88rem; font-weight:700; color:var(--pf-accent); text-decoration:none; }
        .pf01ba-detail svg { transition:transform .25s; }
        .pf01ba-detail:hover svg { transform:translateX(4px); }
        @media (prefers-reduced-motion: reduce){ .pf01ba-handle{ transition:none; } }
      `}</style>
      <section className="pf01ba" data-template="proof-01" id="realizace">
        <div className="pf01ba-inner">
          <div className="pf01ba-head">
            <p className="pf01-eyebrow" style={{ fontWeight: 800, letterSpacing: ".16em", textTransform: "uppercase" as const, fontSize: ".78rem", color: "var(--pf-accent)", margin: "0 0 12px", display: "inline-flex", alignItems: "center", gap: 12 }}>
              <GenericEditableText sectionId={sectionId} field="eyebrow" value={eyebrow} tag="span" />
            </p>
            <h2 className="pf01ba-title"><GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" /></h2>
            <p className="pf01ba-lead"><GenericEditableText sectionId={sectionId} field="lead" value={lead} tag="span" /></p>
          </div>
          <div className="pf01ba-grid">
            {items.map((it, i) => (
              <div key={i}>
                <BeforeAfterCard item={it} sectionId={sectionId} index={i} />
                {it.slug && (
                  <a
                    className="pf01ba-detail"
                    href={isAdmin ? "#" : tenantSlug ? `/demo/${tenantSlug}/realizace/${it.slug}` : `#`}
                  >
                    {detailCtaText}
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

// ══ SIGNAL — Swiss authority (signal-01) ══════════════════════════════════════
// Case studies: fotokarty s velkou metrikou (Oswald, electric blue), industry mono
// štítkem a odkazem na CMS detail /case-studies/<slug>.
function CasesSignal01({ content, sectionId, tenantSlug, isAdmin }: { content: Record<string, unknown>; sectionId: number; tenantSlug?: string; isAdmin?: boolean }) {
  const eyebrow = String(content.eyebrow ?? "Case studies");
  const title   = String(content.title   ?? "Výsledky, které si můžete přeměřit");
  const lead    = String(content.lead    ?? "Každý projekt končí číslem, ne prezentací. Vybrané case studies s měřitelným dopadem.");
  type SgCase = { slug?: string; title?: string; excerpt?: string; body?: string; metric?: string; metricLabel?: string; industry?: string; photo?: string; client?: string };
  const items = (content.items as SgCase[] | undefined) ?? [];
  const linkLabel = String(content.linkLabel ?? "Celá case study");
  const gridRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const root = gridRef.current;
    if (!root) return;
    const els = Array.from(root.querySelectorAll<HTMLElement>(".sg01cs-card"));
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("sg01-vis"); io.unobserve(e.target); } });
    }, { threshold: 0.15 });
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [items.length]);
  return (
    <>
      <style>{`
        .sg01cs { --sg-accent:#2563EB; --sg-ink:#101418; --sg-muted:#5B6472; --sg-border:#E3E7EB;
          background:#fff; font-family:var(--font-body, system-ui, -apple-system, sans-serif); color:var(--sg-ink);
          padding:clamp(56px,8vw,104px) clamp(20px,5vw,48px); }
        .sg01cs-inner { max-width:1280px; margin:0 auto; }
        .sg01cs-head { max-width:660px; margin-bottom:clamp(32px,5vw,52px); }
        .sg01cs .sg01-eyebrow { font-family:var(--font-overpass-mono, ui-monospace, monospace); font-size:.76rem; font-weight:700; letter-spacing:.16em; text-transform:uppercase; color:var(--sg-accent); margin:0 0 12px; display:inline-flex; align-items:center; gap:12px; }
        .sg01cs .sg01-eyebrow::before { content:''; width:32px; height:2px; background:var(--sg-accent); }
        .sg01cs-title { font-family:var(--font-heading, system-ui, sans-serif); color:var(--sg-ink); font-size:clamp(1.9rem,3.8vw,2.9rem); font-weight:600; letter-spacing:.01em; line-height:1.08; margin:0 0 14px; }
        .sg01cs-lead { font-size:1.05rem; color:var(--sg-muted); line-height:1.6; margin:0; }
        .sg01cs-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(300px,1fr)); gap:18px; }
        .sg01cs-card { display:flex; flex-direction:column; background:#fff; border:1px solid var(--sg-border); border-radius:10px; overflow:hidden;
          text-decoration:none; color:inherit; opacity:0; transform:translateY(20px);
          transition:opacity .55s cubic-bezier(.22,.68,0,1) calc(var(--i,0) * 80ms), transform .55s cubic-bezier(.22,.68,0,1) calc(var(--i,0) * 80ms), box-shadow .25s, border-color .25s; }
        .sg01cs-card.sg01-vis { opacity:1; transform:translateY(0); }
        .sg01cs-card.sg01-vis:hover { transform:translateY(-5px); box-shadow:0 14px 30px -18px rgba(16,20,24,.28); border-color:#CBD5E1;
          transition:opacity .2s, transform .25s cubic-bezier(.22,.68,0,1), box-shadow .25s, border-color .25s; }
        .sg01cs-photo { position:relative; aspect-ratio:16/10; overflow:hidden; background:#E4E8ED; }
        .sg01cs-photo img { position:absolute; inset:0; width:100%; height:100%; object-fit:cover; transition:transform .5s cubic-bezier(.22,.68,0,1); }
        .sg01cs-card:hover .sg01cs-photo img { transform:scale(1.05); }
        .sg01cs-photo::after { content:''; position:absolute; inset:0; background:linear-gradient(180deg, transparent 55%, rgba(13,17,22,.5)); }
        .sg01cs-ind { position:absolute; left:14px; top:14px; z-index:1; font-family:var(--font-overpass-mono, ui-monospace, monospace); font-size:.7rem; font-weight:700; letter-spacing:.1em; text-transform:uppercase;
          color:#fff; background:rgba(13,17,22,.72); padding:5px 10px; border-radius:4px; backdrop-filter:blur(6px); }
        .sg01cs-body { display:flex; flex-direction:column; gap:8px; padding:22px 24px 24px; flex:1; }
        .sg01cs-metric { display:flex; align-items:baseline; gap:10px; padding-bottom:12px; border-bottom:1px solid var(--sg-border); margin-bottom:6px; }
        .sg01cs-metric > b { font-family:var(--font-heading, system-ui, sans-serif); font-size:clamp(1.9rem,2.4vw,2.4rem); font-weight:600; line-height:1; color:var(--sg-accent); font-variant-numeric:tabular-nums; white-space:nowrap; }
        .sg01cs-metric b span { font-size:inherit; }
        .sg01cs-metric > span { font-size:.84rem; color:var(--sg-muted); font-weight:600; line-height:1.35; }
        .sg01cs-name { font-family:var(--font-heading, system-ui, sans-serif); color:var(--sg-ink); font-size:1.18rem; font-weight:600; letter-spacing:.01em; margin:0; }
        .sg01cs-excerpt { font-size:.93rem; color:var(--sg-muted); line-height:1.55; margin:0; flex:1; }
        .sg01cs-more { display:inline-flex; align-items:center; gap:6px; font-weight:700; font-size:.88rem; color:var(--sg-accent); margin-top:6px; }
        .sg01cs-more svg { transition:transform .25s; } .sg01cs-card:hover .sg01cs-more svg { transform:translateX(4px); }
        @media (prefers-reduced-motion: reduce){ .sg01cs-card{ opacity:1; transform:none; transition:none; } .sg01cs-more svg,.sg01cs-photo img{ transition:none; } }
      `}</style>
      <section className="sg01cs" data-template="signal-01" id="case-studies">
        <div className="sg01cs-inner">
          <div className="sg01cs-head">
            <p className="sg01-eyebrow"><GenericEditableText sectionId={sectionId} field="eyebrow" value={eyebrow} tag="span" /></p>
            <h2 className="sg01cs-title"><GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" /></h2>
            <p className="sg01cs-lead"><GenericEditableText sectionId={sectionId} field="lead" value={lead} tag="span" /></p>
          </div>
          <div className="sg01cs-grid" ref={gridRef}>
            {items.map((c, i) => {
              const href = isAdmin ? "#" : c.slug && tenantSlug ? `/demo/${tenantSlug}/case-studies/${c.slug}` : "#";
              return (
                <a key={i} className="sg01cs-card" style={{ ["--i" as string]: i % 3 }} href={href}>
                  <span className="sg01cs-photo" aria-hidden="true">
                    {c.photo && <img src={String(c.photo)} alt="" loading="lazy" />}
                    {c.industry && (
                      <span className="sg01cs-ind">
                        <GenericEditableText sectionId={sectionId} field={`items.${i}.industry`} value={String(c.industry ?? "")} tag="span" />
                      </span>
                    )}
                  </span>
                  <span className="sg01cs-body">
                    <span className="sg01cs-metric">
                      <b><GenericEditableText sectionId={sectionId} field={`items.${i}.metric`} value={String(c.metric ?? "")} tag="span" /></b>
                      <span><GenericEditableText sectionId={sectionId} field={`items.${i}.metricLabel`} value={String(c.metricLabel ?? "")} tag="span" /></span>
                    </span>
                    <h3 className="sg01cs-name"><GenericEditableText sectionId={sectionId} field={`items.${i}.title`} value={String(c.title ?? "")} tag="span" /></h3>
                    <p className="sg01cs-excerpt"><GenericEditableText sectionId={sectionId} field={`items.${i}.excerpt`} value={String(c.excerpt ?? "")} tag="span" /></p>
                    <span className="sg01cs-more">
                      <GenericEditableText sectionId={sectionId} field="linkLabel" value={linkLabel} tag="span" />
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                    </span>
                  </span>
                </a>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}

// ══ ORBIT — Precision instrument (orbit-01) ═══════════════════════════════════
// Integrace: dlaždice kategorií nástrojů s iniciálovým tile (žádné reálné
// značky) + široká API karta s mono code řádkem na ink mini terminálu.
function IntegrationsOrbit01({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const eyebrow = String(content.eyebrow ?? "Integrace");
  const title   = String(content.title   ?? "Zapadne do nástrojů, které už používáte");
  const lead    = String(content.lead    ?? "");
  const items = (content.items as Array<{ name?: string; category?: string }> | undefined) ?? [];
  const apiTitle = String(content.apiTitle ?? "REST API a webhooky");
  const apiCode  = String(content.apiCode  ?? "POST /v1/orders → 201 Created");
  const apiNote  = String(content.apiNote  ?? "");
  const gridRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const root = gridRef.current;
    if (!root) return;
    const els = Array.from(root.querySelectorAll<HTMLElement>(".ob01ig-card"));
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("ob01-vis"); io.unobserve(e.target); } });
    }, { threshold: 0.15 });
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [items.length]);
  return (
    <>
      <style>{`
        .ob01ig { --ob-accent: var(--color-accent, #047857); --ob-ink: var(--color-secondary, #0A0F16);
          --ob-accent-lt: color-mix(in srgb, var(--color-accent, #047857) 52%, #fff);
          --ob-muted: var(--color-text-muted, #5C6672); --ob-border: var(--color-border, #E1E7E2);
          background:var(--color-bg, #F2F5F3); font-family:var(--font-body, system-ui, -apple-system, sans-serif); color:var(--color-text, #0E1420);
          padding:clamp(56px,8vw,104px) clamp(20px,5vw,48px); }
        .ob01ig-inner { max-width:1280px; margin:0 auto; }
        .ob01ig-head { max-width:660px; margin-bottom:clamp(32px,5vw,56px); }
        .ob01ig .ob01-eyebrow { font-family:var(--font-overpass-mono, ui-monospace, monospace); font-size:.76rem; font-weight:700; letter-spacing:.16em; text-transform:uppercase; color:var(--ob-accent); margin:0 0 12px; display:inline-flex; align-items:center; gap:12px; }
        .ob01ig .ob01-eyebrow::before { content:''; width:32px; height:2px; background:var(--ob-accent); }
        .ob01ig-title { font-family:var(--font-heading, system-ui, sans-serif); color:var(--ob-ink); font-size:clamp(1.9rem,3.8vw,2.9rem); font-weight:800; letter-spacing:-0.03em; line-height:1.06; margin:0 0 14px; }
        .ob01ig-lead { font-size:1.05rem; color:var(--ob-muted); line-height:1.6; margin:0; }
        .ob01ig-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:14px; }
        .ob01ig-card { display:flex; align-items:center; gap:14px; background:var(--color-surface, #fff); border:1px solid var(--ob-border);
          border-radius:10px; padding:16px 18px; opacity:0; transform:translateY(16px);
          transition:opacity .5s cubic-bezier(.22,.68,0,1) calc(var(--i,0) * 55ms), transform .5s cubic-bezier(.22,.68,0,1) calc(var(--i,0) * 55ms), box-shadow .25s, border-color .25s; }
        .ob01ig-card.ob01-vis { opacity:1; transform:translateY(0); }
        .ob01ig-card.ob01-vis:hover { box-shadow:0 10px 24px -16px rgba(10,15,22,.25); border-color:color-mix(in srgb, var(--ob-accent) 40%, var(--ob-border)); }
        .ob01ig-tile { width:42px; height:42px; border-radius:9px; flex-shrink:0; display:inline-flex; align-items:center; justify-content:center;
          background:color-mix(in srgb, var(--ob-accent) 10%, #fff); border:1px solid color-mix(in srgb, var(--ob-accent) 22%, #fff);
          color:var(--ob-accent); font-family:var(--font-heading, system-ui, sans-serif); font-weight:800; font-size:1.05rem; }
        .ob01ig-name { font-family:var(--font-heading, system-ui, sans-serif); color:var(--ob-ink); font-size:.98rem; font-weight:800; letter-spacing:-0.01em; margin:0; }
        .ob01ig-cat { font-family:var(--font-overpass-mono, ui-monospace, monospace); font-size:.68rem; font-weight:700; letter-spacing:.1em; text-transform:uppercase; color:var(--ob-muted); margin:3px 0 0; }
        .ob01ig-api { grid-column:1 / -1; display:grid; grid-template-columns:auto minmax(220px,1fr) auto; align-items:center; gap:10px 22px; text-align:left; background:var(--ob-ink);
          border:1px solid color-mix(in srgb, var(--ob-ink) 70%, #fff); border-radius:10px; padding:18px 22px; color:#fff;
          opacity:0; transform:translateY(16px);
          transition:opacity .5s cubic-bezier(.22,.68,0,1) calc(var(--i,0) * 55ms), transform .5s cubic-bezier(.22,.68,0,1) calc(var(--i,0) * 55ms); }
        .ob01ig-api.ob01-vis { opacity:1; transform:translateY(0); }
        .ob01ig-api-t { font-family:var(--font-heading, system-ui, sans-serif); color:#fff; font-size:1.02rem; font-weight:800; letter-spacing:-0.01em; margin:0; }
        .ob01ig-api-code { font-family:var(--font-overpass-mono, ui-monospace, monospace); font-size:.82rem; color:var(--ob-accent-lt);
          background:rgba(255,255,255,.06); border:1px solid rgba(255,255,255,.12); border-radius:6px; padding:9px 13px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
        .ob01ig-api-code::before { content:'$ '; color:rgba(255,255,255,.4); }
        .ob01ig-api-n { font-size:.84rem; color:rgba(255,255,255,.68); margin:0; line-height:1.5; }
        .ob01ig-api-t, .ob01ig-api-n { text-align:left; }
        @media (max-width:980px){ .ob01ig-grid{ grid-template-columns:repeat(2,1fr); } .ob01ig-api{ grid-template-columns:1fr; } }
        @media (max-width:520px){ .ob01ig-grid{ grid-template-columns:1fr; } }
        @media (prefers-reduced-motion: reduce){ .ob01ig-card, .ob01ig-api{ opacity:1; transform:none; transition:none; } }
      `}</style>
      <section className="ob01ig" data-template="orbit-01" id="integrace">
        <div className="ob01ig-inner">
          <div className="ob01ig-head">
            <p className="ob01-eyebrow"><GenericEditableText sectionId={sectionId} field="eyebrow" value={eyebrow} tag="span" /></p>
            <h2 className="ob01ig-title"><GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" /></h2>
            {lead && <p className="ob01ig-lead"><GenericEditableText sectionId={sectionId} field="lead" value={lead} tag="span" /></p>}
          </div>
          <div className="ob01ig-grid" ref={gridRef}>
            {items.map((it, i) => (
              <div key={i} className="ob01ig-card" style={{ ["--i" as string]: i % 4 }}>
                <span className="ob01ig-tile" aria-hidden="true">{String(it.name ?? "?").charAt(0)}</span>
                <span>
                  <p className="ob01ig-name"><GenericEditableText sectionId={sectionId} field={`items.${i}.name`} value={String(it.name ?? "")} tag="span" /></p>
                  <p className="ob01ig-cat"><GenericEditableText sectionId={sectionId} field={`items.${i}.category`} value={String(it.category ?? "")} tag="span" /></p>
                </span>
              </div>
            ))}
            <div className="ob01ig-api ob01ig-card" style={{ ["--i" as string]: items.length % 4 }}>
              <h3 className="ob01ig-api-t"><GenericEditableText sectionId={sectionId} field="apiTitle" value={apiTitle} tag="span" /></h3>
              <span className="ob01ig-api-code"><GenericEditableText sectionId={sectionId} field="apiCode" value={apiCode} tag="span" /></span>
              {apiNote && <p className="ob01ig-api-n"><GenericEditableText sectionId={sectionId} field="apiNote" value={apiNote} tag="span" /></p>}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
