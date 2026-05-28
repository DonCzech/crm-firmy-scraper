"use client";

import { useState } from "react";
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

  if (!images.length) {
    return (
      <section className="py-16 px-6 text-center" style={{ backgroundColor: "var(--color-surface)" }}>
        <p className="text-gray-400 text-sm">Galerie — přidejte fotky v editoru</p>
      </section>
    );
  }

  const c = content as { title?: string };

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
