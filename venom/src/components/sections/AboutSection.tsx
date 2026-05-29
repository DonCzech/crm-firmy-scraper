"use client";

import { useEffect, useState } from "react";
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

export function AboutSection({ content, variant, sectionId }: Props) {

  // hair-01: 2-col dark left (label+lead+body+3 stats) / gold right (#8a6f28, portrait+CTA)
  if (variant === "about-hair-split-stats") {
    const title     = String(content.title ?? "O společnosti");
    const lead      = String(content.lead ?? "");
    const body      = String(content.body ?? "");
    const portrait  = String(content.portraitImage ?? "");
    const ctaText   = String(content.ctaText ?? "Objednat se");
    const ctaHref   = String(content.ctaHref ?? "#rezervace");
    const stats = (content.stats as Array<{ value: string; label: string }>) ?? [];
    const MONO = "'Montserrat',sans-serif";
    return (
      <section id="onas" className="w-full" data-template="hair-01" style={{ fontFamily: MONO }}>
        <div className="grid" style={{ gridTemplateColumns: "1fr 1fr" }}>
          {/* Left — dark panel: text + stats */}
          <div
            className="flex flex-col justify-center"
            style={{ backgroundColor: "#1e1e1e", padding: "clamp(48px,7vw,100px) clamp(28px,5vw,72px)" }}
          >
            <p style={{ color: "#8a6f28", fontSize: 11, fontWeight: 600, letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: 24 }}>
              <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
            </p>
            <p style={{ color: "rgba(255,255,255,0.92)", fontSize: "clamp(15px,1.6vw,20px)", fontWeight: 300, lineHeight: 1.65, marginBottom: 32 }}>
              <GenericEditableText sectionId={sectionId} field="lead" value={lead} tag="span" />
            </p>
            <p style={{ color: "rgba(255,255,255,0.65)", fontSize: 14, fontWeight: 300, lineHeight: 1.75, marginBottom: 48 }}>
              <GenericEditableText sectionId={sectionId} field="body" value={body} tag="span" />
            </p>
            {/* Stats */}
            {stats.length > 0 && (
              <div className="flex flex-col gap-6">
                {stats.map((s, i) => (
                  <div key={i} className="flex items-baseline gap-4">
                    <span style={{ color: "#8a6f28", fontSize: "clamp(28px,3vw,42px)", fontWeight: 300, lineHeight: 1, minWidth: 60 }}>
                      <GenericEditableText sectionId={sectionId} field={`stats.${i}.value`} value={s.value} tag="span" />
                    </span>
                    <span style={{ color: "rgba(255,255,255,0.55)", fontSize: 12, fontWeight: 400, letterSpacing: "0.06em", lineHeight: 1.4 }}>
                      <GenericEditableText sectionId={sectionId} field={`stats.${i}.label`} value={s.label} tag="span" />
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right — gold panel: portrait + CTA */}
          <div
            className="relative flex flex-col items-center justify-end"
            style={{ backgroundColor: "#8a6f28", minHeight: "clamp(380px,55vw,680px)", padding: "40px 32px" }}
          >
            {portrait && (
              <GenericEditableImage sectionId={sectionId} field="portraitImage" src={portrait} alt="Salon Aria stylistka" className="absolute inset-0 w-full h-full">
                <Image src={portrait} alt="Salon Aria stylistka" fill className="object-cover object-top" sizes="50vw" unoptimized={shouldSkipNextImageOptimization(portrait)} />
              </GenericEditableImage>
            )}
            <div aria-hidden className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(138,111,40,0.55) 0%, transparent 40%)" }} />
            <a
              href={ctaHref}
              className="relative z-10 inline-block no-underline uppercase"
              style={{
                border: "1.5px solid #fff",
                color: "#fff",
                backgroundColor: "transparent",
                fontFamily: MONO,
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: "0.18em",
                padding: "14px 36px",
                transition: "background 0.2s",
              }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.15)")}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = "transparent")}
            >
              <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
            </a>
          </div>
        </div>
        <style>{`@media(max-width:768px){[data-template="hair-01"] .grid{grid-template-columns:1fr !important}}`}</style>
      </section>
    );
  }

  // hair-01-values — full-bleed two-col: image left 55%, text right on white bg
  if (variant === "about-hair-values") {
    const valTitle = String(content.title ?? "Víme, jak důležité jsou vaše vlasy");
    const valBody  = String(content.body  ?? "");
    const valImage = String(content.image ?? "");
    const MONO = "'Montserrat',sans-serif";
    return (
      <section
        data-template="hair-01"
        style={{ backgroundColor: "#ffffff", fontFamily: MONO }}
      >
        <div className="grid" style={{ gridTemplateColumns: "55% 45%", minHeight: "clamp(360px,50vw,600px)" }}>
          {/* Left — full-bleed image */}
          <div className="relative overflow-hidden" style={{ backgroundColor: "#e8e0d8" }}>
            {valImage && (
              <GenericEditableImage sectionId={sectionId} field="image" src={valImage} alt={valTitle} className="absolute inset-0 w-full h-full">
                <Image src={valImage} alt={valTitle} fill className="object-cover" sizes="55vw" unoptimized={shouldSkipNextImageOptimization(valImage)} />
              </GenericEditableImage>
            )}
          </div>
          {/* Right — text panel */}
          <div
            className="flex flex-col justify-center"
            style={{ padding: "clamp(40px,7vw,90px) clamp(28px,5vw,72px)" }}
          >
            <h2 style={{ color: "#1e1e1e", fontSize: "clamp(20px,2.2vw,32px)", fontWeight: 300, lineHeight: 1.25, letterSpacing: "0.04em", marginBottom: 24 }}>
              <GenericEditableText sectionId={sectionId} field="title" value={valTitle} tag="span" />
            </h2>
            {valBody && (
              <p style={{ color: "#605f5f", fontSize: 14, fontWeight: 300, lineHeight: 1.85, maxWidth: 480 }}>
                <GenericEditableText sectionId={sectionId} field="body" value={valBody} tag="span" />
              </p>
            )}
          </div>
        </div>
        <style>{`@media(max-width:640px){[data-template="hair-01"] .grid{grid-template-columns:1fr !important}}`}</style>
      </section>
    );
  }

  const title = String(content.title ?? "O nás");
  const body = String(content.body ?? "");
  const image = String(content.image ?? "");
  const highlight = String(content.highlight ?? "");
  const values = (content.values as Array<{ icon: string; title: string; text: string }>) ?? [];

  // cafe-loyalty-tilted — image left (tilted) + display heading right
  if (variant === "cafe-loyalty-tilted") {
    return (
      <section className="py-12 px-6" style={{ backgroundColor: "var(--color-bg, #fff)" }}>
        <div className="max-w-5xl mx-auto md:flex md:gap-10 md:items-center">
          {image && (
            <GenericEditableImage
              sectionId={sectionId}
              field="image"
              src={image}
              alt={title}
              className="md:w-1/2 mb-10 md:mb-0 flex justify-center"
            >
              <Image
                src={image}
                alt={title}
                width={360}
                height={225}
                className="-rotate-6"
                unoptimized={shouldSkipNextImageOptimization(image)}
              />
            </GenericEditableImage>
          )}
          <div className="md:w-1/2">
            <h2
              className="text-4xl md:text-5xl leading-tight"
              style={{ color: "var(--color-primary, #6d1f37)", fontFamily: "var(--font-heading)" }}
            >
              <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
            </h2>
            {body && (
              <p className="text-xl my-6" style={{ color: "var(--color-primary, #6d1f37)", fontFamily: "var(--font-heading)" }}>
                <GenericEditableText sectionId={sectionId} field="body" value={body} tag="span" />
              </p>
            )}
            {highlight && (
              <a
                href="#"
                className="inline-block px-6 py-3 rounded-full font-semibold text-white"
                style={{ backgroundColor: "var(--color-primary, #6d1f37)" }}
              >
                <GenericEditableText sectionId={sectionId} field="highlight" value={highlight} tag="span" />
              </a>
            )}
          </div>
        </div>
      </section>
    );
  }

  // About — barber-04 (Černý Fade): centered intro + 8-image strip carousel with numbered badge
  if (variant === "about-barber-04-strip") {
    const lead = String(content.lead ?? "");
    const images = ((content.images as Array<{ url?: string; alt?: string }>) ?? []).slice(0, 12);
    return (
      <AboutBarber04Strip
        title={title}
        lead={lead}
        body={body}
        images={images}
        sectionId={sectionId}
      />
    );
  }

  // About — luxury barber (barber-02): lead italic + body left, photo right, cream bg
  if (variant === "about-barber-luxury") {
    const lead = String(content.lead ?? "");
    return (
      <section
        style={{
          padding: "100px 40px",
          backgroundColor: "var(--color-surface, #f9f7f5)",
        }}
      >
        <div
          className="grid grid-cols-1 md:grid-cols-2 items-center"
          style={{ maxWidth: 1100, margin: "0 auto", gap: 80 }}
        >
          <div>
            {lead && (
              <p
                style={{
                  fontFamily: "var(--font-heading)",
                  fontStyle: "italic",
                  fontSize: "clamp(1.1rem, 2vw, 1.4rem)",
                  color: "var(--color-secondary, #9a7a50)",
                  lineHeight: 1.7,
                  marginBottom: 24,
                }}
              >
                <GenericEditableText sectionId={sectionId} field="lead" value={lead} tag="span" />
              </p>
            )}
            {body && (
              <p
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "1rem",
                  fontWeight: 300,
                  color: "#444",
                  lineHeight: 1.85,
                }}
              >
                <GenericEditableText sectionId={sectionId} field="body" value={body} tag="span" />
              </p>
            )}
          </div>
          {image && (
            <GenericEditableImage
              sectionId={sectionId}
              field="image"
              src={image}
              alt={title}
              className="relative w-full overflow-hidden"
              style={{ borderRadius: 2, aspectRatio: "4/3" }}
            >
              <Image
                src={image}
                alt={title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
                unoptimized={shouldSkipNextImageOptimization(image)}
              />
            </GenericEditableImage>
          )}
        </div>
      </section>
    );
  }

  // Two-column layout (wellness)
  if (variant === "two-col") {
    return (
      <section className="py-16 px-4" style={{ backgroundColor: "var(--color-bg, #fff)" }}>
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {image && (
            <GenericEditableImage sectionId={sectionId} field="image" src={image} alt={title} className="order-2 md:order-1 relative h-80 rounded-2xl overflow-hidden">
              <Image src={image} alt={title} fill className="object-cover" sizes="(max-width: 768px) 100vw, 50vw" unoptimized={shouldSkipNextImageOptimization(image)} />
            </GenericEditableImage>
          )}
          <div className={image ? "order-1 md:order-2" : "md:col-span-2 text-center"}>
            <h2
              className="text-3xl font-bold mb-4"
              style={{ color: "var(--color-text, #111827)", fontFamily: "var(--font-heading)" }}
            >
              <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
            </h2>
            {body && (
              <p className="text-base leading-relaxed mb-4" style={{ color: "var(--color-text-muted, #6b7280)" }}>
                <GenericEditableText sectionId={sectionId} field="body" value={body} tag="span" />
              </p>
            )}
            {highlight && (
              <p
                className="text-sm font-semibold italic mt-4 pl-4"
                style={{
                  color: "var(--color-primary, #6366f1)",
                  borderLeft: "3px solid var(--color-primary, #6366f1)",
                }}
              >
                <GenericEditableText sectionId={sectionId} field="highlight" value={highlight} tag="span" />
              </p>
            )}
          </div>
        </div>
      </section>
    );
  }

  // Professional layout (lawyer)
  return (
    <section className="py-16 px-4" style={{ backgroundColor: "var(--color-surface, #f9fafb)" }}>
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start mb-12">
          <div>
            <h2
              className="text-3xl font-bold mb-4"
              style={{ color: "var(--color-text, #111827)", fontFamily: "var(--font-heading)" }}
            >
              <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
            </h2>
            {body && (
              <p className="text-base leading-relaxed" style={{ color: "var(--color-text-muted, #6b7280)" }}>
                <GenericEditableText sectionId={sectionId} field="body" value={body} tag="span" />
              </p>
            )}
          </div>
          {image && (
            <GenericEditableImage sectionId={sectionId} field="image" src={image} alt={title} className="relative h-64 rounded-xl overflow-hidden">
              <Image src={image} alt={title} fill className="object-cover" sizes="(max-width: 768px) 100vw, 50vw" unoptimized={shouldSkipNextImageOptimization(image)} />
            </GenericEditableImage>
          )}
        </div>

        {values.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {values.map((v, i) => (
              <div key={i} className="bg-white rounded-xl p-5 shadow-sm">
                {v.icon && <span className="text-2xl mb-3 block">{v.icon}</span>}
                <p
                  className="font-semibold mb-1"
                  style={{ color: "var(--color-text, #111827)", fontFamily: "var(--font-heading)" }}
                >
                  <GenericEditableText sectionId={sectionId} field={`values.${i}.title`} value={v.title} tag="span" />
                </p>
                <p className="text-sm" style={{ color: "var(--color-text-muted, #6b7280)" }}>
                  <GenericEditableText sectionId={sectionId} field={`values.${i}.text`} value={v.text} tag="span" />
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function AboutBarber04Strip({
  title,
  lead,
  body,
  images,
  sectionId,
}: {
  title: string;
  lead: string;
  body: string;
  images: Array<{ url?: string; alt?: string }>;
  sectionId: number;
}) {
  // Carousel — desktop ukáže 4 najednou, mobil 1; auto-advance 4s.
  const [idx, setIdx] = useState(0);
  const [perView, setPerView] = useState(4);
  useEffect(() => {
    const recalc = () => {
      const w = window.innerWidth;
      setPerView(w < 640 ? 1 : w < 980 ? 2 : w < 1280 ? 3 : 4);
    };
    recalc();
    window.addEventListener("resize", recalc);
    return () => window.removeEventListener("resize", recalc);
  }, []);
  const count = images.length;
  useEffect(() => {
    if (count <= perView) return;
    const t = setInterval(() => setIdx((i) => (i + 1) % count), 4000);
    return () => clearInterval(t);
  }, [count, perView]);

  return (
    <section
      className="relative"
      style={{ padding: "72px 24px", backgroundColor: "#f4f6f7" }}
      data-template="barber-04"
    >
      <div className="max-w-[1180px] mx-auto text-center">
        <h2
          className="uppercase"
          style={{
            fontFamily: "'Bebas Neue','Oswald',Impact,sans-serif",
            fontWeight: 300,
            fontSize: "clamp(22px, 2.2vw, 34px)",
            letterSpacing: "0",
            color: "#d5b981",
            margin: "0 auto 14px",
            lineHeight: 1.2,
          }}
        >
          <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
        </h2>

        {/* Decorative separator */}
        <div
          aria-hidden
          className="mx-auto"
          style={{
            width: 60,
            height: 2,
            backgroundColor: "#d5b981",
            opacity: 0.7,
            margin: "0 auto 32px",
          }}
        />

        {lead && (
          <p
            style={{
              fontFamily: "'Lato',Helvetica,Arial,sans-serif",
              fontWeight: 700,
              fontSize: "clamp(14px, 1.05vw, 16px)",
              color: "#1a1a1a",
              maxWidth: 720,
              margin: "0 auto 10px",
              lineHeight: 1.55,
            }}
          >
            <GenericEditableText sectionId={sectionId} field="lead" value={lead} tag="span" />
          </p>
        )}
        {body && (
          <p
            style={{
              fontFamily: "'Lato',Helvetica,Arial,sans-serif",
              fontWeight: 400,
              fontSize: "clamp(14px, 1vw, 15px)",
              color: "#666",
              maxWidth: 720,
              margin: "0 auto 48px",
              lineHeight: 1.75,
            }}
          >
            <GenericEditableText sectionId={sectionId} field="body" value={body} tag="span" />
          </p>
        )}
      </div>

      {/* Carousel strip */}
      {count > 0 && (
        <div className="max-w-[1280px] mx-auto px-6 overflow-hidden">
          <div
            className="flex transition-transform duration-700 ease-in-out"
            style={{
              transform: `translateX(-${(idx * 100) / perView}%)`,
              gap: 16,
            }}
          >
            {images.map((img, i) => (
              <div
                key={`strip-${i}`}
                className="relative shrink-0 overflow-hidden"
                style={{
                  width: `calc(${100 / perView}% - ${(16 * (perView - 1)) / perView}px)`,
                  aspectRatio: "3/4",
                  backgroundColor: "#1a1a1a",
                }}
              >
                <GenericEditableImage
                  sectionId={sectionId}
                  field={`images.${i}.url`}
                  src={String(img.url ?? "")}
                  alt={img.alt ?? `Slide ${i + 1}`}
                  className="absolute inset-0"
                >
                  {img.url ? (
                    <Image
                      src={String(img.url)}
                      alt={img.alt ?? ""}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1280px) 33vw, 25vw"
                      className="object-cover"
                      unoptimized={shouldSkipNextImageOptimization(String(img.url))}
                    />
                  ) : (
                    <div className="absolute inset-0" style={{ backgroundColor: "#2a2a2a" }} />
                  )}
                </GenericEditableImage>
                {/* Numbered badge 01–N (Bebas Neue, gold) */}
                <span
                  aria-hidden
                  className="absolute"
                  style={{
                    top: 16,
                    left: 16,
                    fontFamily: "'Bebas Neue','Oswald',Impact,sans-serif",
                    fontSize: "clamp(36px, 3.5vw, 56px)",
                    letterSpacing: "0.04em",
                    color: "#d5b981",
                    lineHeight: 1,
                    textShadow: "0 2px 8px rgba(0,0,0,.4)",
                  }}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
              </div>
            ))}
          </div>
          {/* Dots */}
          {count > perView && (
            <div className="flex items-center justify-center gap-3 mt-8" aria-hidden>
              {Array.from({ length: count }).map((_, i) => (
                <button
                  key={`about-dot-${i}`}
                  type="button"
                  onClick={() => setIdx(i)}
                  aria-label={`Slide ${i + 1}`}
                  className="border-0 cursor-pointer"
                  style={{
                    width: i === idx ? 28 : 10,
                    height: 2,
                    backgroundColor: i === idx ? "#d5b981" : "rgba(0,0,0,0.25)",
                    padding: 0,
                    transition: "width .25s, background-color .25s",
                  }}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
