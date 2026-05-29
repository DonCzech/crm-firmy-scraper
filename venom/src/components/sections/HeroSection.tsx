"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { GenericEditableText } from "@/components/tenant/GenericEditableText";
import { GenericEditableImage } from "@/components/tenant/GenericEditableImage";
import { shouldSkipNextImageOptimization } from "@/lib/image-source";

interface HeroContent {
  title?: string;
  subtitle?: string;
  ctaText?: string;
  ctaHref?: string;
  backgroundImage?: string;
}

interface Props {
  content: Record<string, unknown>;
  variant: string;
  isAdmin: boolean;
  tenantSlug?: string;
  sectionId: number;
}

export function HeroSection({ content, variant, tenantSlug, isAdmin, sectionId }: Props) {
  const c = content as HeroContent;

  // hair-01: full-bleed tmavá foto, bez textu, SCROLL indikátor dole
  if (variant === "hero-hair-fullbleed") {
    const bg = String((content as Record<string,unknown>).backgroundImage ?? "");
    return (
      <section
        id="uvod"
        className="relative w-full overflow-hidden"
        style={{ minHeight: "100svh", backgroundColor: "#1e1e1e" }}
        data-template="hair-01"
      >
        {bg && (
          <GenericEditableImage sectionId={sectionId} field="backgroundImage" src={bg} alt="Salon Aria hero" className="absolute inset-0 w-full h-full">
            <Image src={bg} alt="Salon Aria hero" fill className="object-cover" priority sizes="100vw" unoptimized={shouldSkipNextImageOptimization(bg)} />
          </GenericEditableImage>
        )}
        {/* subtle dark overlay at bottom */}
        <div aria-hidden className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 50%)" }} />
        {/* SCROLL indicator */}
        <div
          aria-hidden
          className="absolute bottom-8 left-1/2 flex flex-col items-center gap-2"
          style={{ transform: "translateX(-50%)", color: "rgba(255,255,255,0.75)", fontFamily: "'Montserrat',sans-serif", fontSize: 10, fontWeight: 500, letterSpacing: "0.18em" }}
        >
          <span>SCROLL</span>
          <svg width="14" height="22" viewBox="0 0 14 22" fill="none" style={{ animation: "hair01scroll 1.5s ease-in-out infinite" }}>
            <path d="M7 1v20M1 14l6 7 6-7" stroke="rgba(255,255,255,0.75)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <style>{`@keyframes hair01scroll{0%,100%{transform:translateY(0)}50%{transform:translateY(6px)}}`}</style>
      </section>
    );
  }

  if (variant === "hero-luxury-dark") {
    return (
      <section
        className="relative min-h-dvh flex items-center justify-center text-white overflow-hidden"
        style={{
          backgroundColor: "var(--color-bg, #111)",
        }}
      >
        {c.backgroundImage && (
          <BackgroundEditableImage sectionId={sectionId} src={c.backgroundImage} overlayColor="rgba(0,0,0,0.55)" priority={true} />
        )}
        <div className="relative z-10 text-center px-6 max-w-3xl mx-auto w-full">
          <h1
            className="text-4xl md:text-7xl font-bold mb-6 whitespace-pre-line leading-tight"
            style={{ fontFamily: "var(--font-heading)", color: "var(--color-accent, #C9A84C)" }}
          >
            <GenericEditableText sectionId={sectionId} field="title" value={c.title ?? "Váš styl, náš um."} tag="span" />
          </h1>
          <p className="text-base md:text-xl text-gray-300 mb-10 max-w-xl mx-auto">
            <GenericEditableText sectionId={sectionId} field="subtitle" value={c.subtitle ?? "Profesionální barber studio."} tag="span" />
          </p>
          {c.ctaHref && (
            <a
              href={resolveDemoHref(c.ctaHref, tenantSlug, isAdmin)}
              className="block sm:inline-block w-full sm:w-auto px-8 py-4 rounded font-semibold text-black text-center transition-opacity hover:opacity-90"
              style={{ backgroundColor: "var(--color-accent, #C9A84C)" }}
            >
              <GenericEditableText sectionId={sectionId} field="ctaText" value={c.ctaText ?? "Rezervovat termín"} tag="span" />
            </a>
          )}
        </div>
      </section>
    );
  }

  if (variant === "hero-split-image") {
    return (
      <section
        className="min-h-screen flex flex-col md:flex-row"
        style={{ backgroundColor: "var(--color-bg, #fff)" }}
      >
        <div className="flex-1 flex items-center px-8 md:px-16 py-20">
          <div>
            <h1
              className="text-4xl md:text-6xl font-bold mb-6 whitespace-pre-line leading-tight"
              style={{ fontFamily: "var(--font-heading)", color: "var(--color-text, #111)" }}
            >
              <GenericEditableText sectionId={sectionId} field="title" value={c.title ?? "Najděte svůj klid."} tag="span" />
            </h1>
            <p className="text-lg mb-10" style={{ color: "var(--color-text-muted, #666)" }}>
              <GenericEditableText sectionId={sectionId} field="subtitle" value={c.subtitle ?? "Profesionální wellness studio."} tag="span" />
            </p>
            {c.ctaHref && (
              <a
                href={resolveDemoHref(c.ctaHref, tenantSlug, isAdmin)}
                className="inline-block px-8 py-4 rounded-xl font-semibold text-white transition-opacity hover:opacity-90"
                style={{ backgroundColor: "var(--color-primary, #7B9E87)" }}
              >
                <GenericEditableText sectionId={sectionId} field="ctaText" value={c.ctaText ?? "Zarezervovat"} tag="span" />
              </a>
            )}
          </div>
        </div>
        {c.backgroundImage && (
          <GenericEditableImage sectionId={sectionId} field="backgroundImage" src={c.backgroundImage} alt="" className="flex-1 min-h-64 md:min-h-0 relative" priority={true}>
            <Image
              src={c.backgroundImage}
              alt=""
              fill
              className="object-cover"
              priority
              unoptimized={shouldSkipNextImageOptimization(c.backgroundImage)}
            />
          </GenericEditableImage>
        )}
      </section>
    );
  }

  if (variant === "hero-cafe-wave") {
    const bgImage = c.backgroundImage || "/clones/costa/src/themes/template/build/COSTA_banner_2026_05_1600x640_06.webp";
    return (
      <section className="relative bg-white">
        {/* Top gradient — darkens area behind navbar for readability */}
        <div className="pointer-events-none absolute left-0 top-0 z-10 w-full h-[280px] bg-gradient-to-t from-black/0 to-black/60" />
        {/* Text overlay (z-30, above image + gradient + image upload input) */}
        <div className="absolute z-30 top-0 left-0 w-full pointer-events-none">
          <div className="max-w-7xl mx-auto px-6 lg:px-12 relative mt-24 md:mt-40 lg:mt-48 text-center lg:text-left lg:pl-32 pointer-events-auto">
            <h1
              className="text-white text-4xl sm:text-5xl md:text-6xl lg:text-7xl"
              style={{ fontFamily: "var(--font-heading, 'CostaDisplayWave', Georgia, serif)", whiteSpace: "pre-line", fontWeight: 700, lineHeight: 1.1 }}
            >
              <GenericEditableText sectionId={sectionId} field="title" value={c.title ?? "Ledové drinky\nv cherry stylu"} tag="span" />
            </h1>
            {c.subtitle && (
              <span
                className="text-white block mt-2 text-xl sm:text-2xl md:text-3xl lg:text-4xl"
                style={{ fontFamily: "var(--font-heading, 'CostaDisplayWave', Georgia, serif)", fontWeight: 400 }}
              >
                <GenericEditableText sectionId={sectionId} field="subtitle" value={c.subtitle} tag="span" />
              </span>
            )}
            {c.ctaHref && (
              <a
                href={resolveDemoHref(c.ctaHref, tenantSlug, isAdmin)}
                className="flex sm:inline-flex items-center justify-center gap-2 mt-8 md:mt-14 px-7 py-3 bg-white font-semibold rounded-full transition-opacity hover:opacity-90 text-base w-full sm:w-auto"
                style={{ color: "var(--color-primary, #6d1f37)", fontFamily: "var(--font-body, 'CostaText', sans-serif)" }}
              >
                <GenericEditableText sectionId={sectionId} field="ctaText" value={c.ctaText ?? "Zjistit více"} tag="span" />
                <span aria-hidden>▸</span>
              </a>
            )}
          </div>
        </div>
        {/* Image with wave mask cutting bottom into wave shape */}
        <div
          className="hero-wave-mask relative h-[380px] sm:h-[480px] md:h-[640px] overflow-hidden"
          style={{ backgroundColor: "var(--color-primary, #6d1f37)" }}
        >
          <GenericEditableImage
            sectionId={sectionId}
            field="backgroundImage"
            src={bgImage}
            alt={String(c.title ?? "")}
            className="absolute inset-0 w-full h-full"
            style={{ width: "100%", height: "100%" }}
          >
            <Image
              src={bgImage}
              alt=""
              fill
              priority
              sizes="100vw"
              className="object-cover object-right-top"
              unoptimized={shouldSkipNextImageOptimization(bgImage)}
            />
          </GenericEditableImage>
        </div>
      </section>
    );
  }

  if (variant === "hero-full-bleed") {
    return (
      <section
        className="relative min-h-dvh flex items-end md:items-center overflow-hidden"
        style={{ backgroundColor: "#111" }}
      >
        {c.backgroundImage && (
          <BackgroundEditableImage sectionId={sectionId} src={c.backgroundImage} overlayColor="rgba(0,0,0,0.6)" priority={true} />
        )}
        <div
          className="relative z-10 w-full px-6 md:px-16 pb-16 pt-32 md:py-0 max-w-3xl"
          style={{ paddingInline: "clamp(16px, 6vw, 80px)" }}
        >
          <h1
            className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6 leading-tight whitespace-pre-line"
            style={{
              fontFamily: "var(--font-heading)",
              color: "#ffffff",
              letterSpacing: "0.01em",
              textTransform: "uppercase",
            }}
          >
            <GenericEditableText sectionId={sectionId} field="title" value={c.title ?? "Váš styl,\nnaše řemeslo."} tag="span" />
          </h1>
          <p
            className="text-base md:text-xl mb-10 max-w-md"
            style={{ color: "rgba(255,255,255,0.75)", fontFamily: "var(--font-body)", fontWeight: 200, lineHeight: 1.5 }}
          >
            <GenericEditableText sectionId={sectionId} field="subtitle" value={c.subtitle ?? "Profesionální barbershop."} tag="span" />
          </p>
          {c.ctaHref && (
            <a
              href={resolveDemoHref(c.ctaHref, tenantSlug, isAdmin)}
              className="inline-flex items-center justify-center min-h-[48px] px-8 font-bold uppercase tracking-widest text-white transition-opacity hover:opacity-80 w-full sm:w-auto text-center"
              style={{
                backgroundColor: "var(--color-primary, #004679)",
                borderRadius: "var(--radius, 5px)",
                fontSize: "0.8125rem",
                letterSpacing: "0.1em",
              }}
            >
              <GenericEditableText sectionId={sectionId} field="ctaText" value={c.ctaText ?? "Rezervovat termín"} tag="span" />
            </a>
          )}
        </div>
      </section>
    );
  }

  if (variant === "hero-barber-04-page-title") {
    // Mini-hero pro podstránky — centrovaný uppercase title + decorative separator,
    // padding nad header (offset header transparent fixed).
    return (
      <section
        className="relative"
        style={{ padding: "180px 24px 80px", backgroundColor: "#0f0f0f" }}
        data-template="barber-04"
      >
        <div className="max-w-[860px] mx-auto text-center">
          <h1
            className="uppercase"
            style={{
              fontFamily: "'Bebas Neue','Oswald',Impact,sans-serif",
              fontWeight: 300,
              fontSize: "clamp(28px, 3vw, 52px)",
              letterSpacing: 0,
              color: "#ffffff",
              lineHeight: 1.15,
              margin: "0 auto 16px",
            }}
          >
            <GenericEditableText sectionId={sectionId} field="title" value={String(c.title ?? "")} tag="span" />
          </h1>
          <div
            aria-hidden
            className="mx-auto"
            style={{ width: 60, height: 2, backgroundColor: "#d5b981", opacity: 0.85, margin: "0 auto 18px" }}
          />
          {c.subtitle && (
            <p
              style={{
                fontFamily: "'Lato',Helvetica,Arial,sans-serif",
                fontWeight: 400,
                fontStyle: "italic",
                fontSize: "clamp(13px, 1.05vw, 16px)",
                color: "rgba(255,255,255,0.78)",
                maxWidth: 640,
                margin: "0 auto",
                lineHeight: 1.7,
              }}
            >
              <GenericEditableText sectionId={sectionId} field="subtitle" value={String(c.subtitle ?? "")} tag="span" />
            </p>
          )}
        </div>
      </section>
    );
  }

  if (variant === "hero-barber-04-slider") {
    // barber-04 (Černý Fade) — full-bleed 2-slide slider, gradient overlay,
    // Bebas Neue title gold, autoplay 6s, fade transition.
    type Slide = { title?: string; subtitle?: string; backgroundImage?: string };
    const slides = (c as unknown as { slides?: Slide[] }).slides ?? [];
    const interval = Number((c as unknown as { autoPlayInterval?: number }).autoPlayInterval ?? 6000);
    const ctaText = String(c.ctaText ?? "vytvořit rezervaci");
    const ctaHref = String(c.ctaHref ?? "#rezervace");
    return (
      <HeroBarber04Slider
        slides={slides}
        interval={interval}
        ctaText={ctaText}
        ctaHref={resolveDemoHref(ctaHref, tenantSlug, isAdmin)}
        sectionId={sectionId}
      />
    );
  }

  if (variant === "hero-barber-luxury") {
    const hoursLines = (c.hoursLines as Array<{ label: string; value: string }>) ?? [];
    const address = String(c.address ?? "");
    const showScroll = c.scrollIndicator !== false;
    return (
      <section
        className="relative flex items-center justify-center overflow-hidden"
        style={{ minHeight: "100vh", backgroundColor: "#111" }}
      >
        {/* Fallback dark backdrop — paints FIRST so it sits under the image.
            pointer-events:none so it never blocks the clickable image above. */}
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{ backgroundColor: "#1a1a1a", zIndex: 0 }}
        />
        {c.backgroundImage && (
          <BackgroundEditableImage
            sectionId={sectionId}
            src={c.backgroundImage}
            overlayColor="transparent"
            priority={true}
          />
        )}
        {/* Hero gradient overlay — over BackgroundEditableImage, under content.
            pointer-events:none → clicks pass through to the image (background edit). */}
        <div
          aria-hidden
          className="absolute inset-0 z-[1] pointer-events-none"
          style={{
            background:
              "linear-gradient(to bottom,rgba(0,0,0,.2) 0%,rgba(0,0,0,.55) 60%,rgba(0,0,0,.75) 100%)",
          }}
        />

        <div className="relative z-10 text-center text-white px-6 max-w-[800px]">
          <h1
            className="uppercase mb-4"
            style={{
              fontFamily: "var(--font-heading)",
              fontWeight: 400,
              fontSize: "clamp(3rem, 7vw, 6rem)",
              letterSpacing: "0.18em",
              color: "#fff",
            }}
          >
            <GenericEditableText sectionId={sectionId} field="title" value={c.title ?? "ATELIER"} tag="span" />
          </h1>
          <p
            className="mb-10"
            style={{
              fontFamily: "var(--font-body)",
              fontWeight: 300,
              fontSize: "clamp(1rem, 2.5vw, 1.4rem)",
              letterSpacing: "0.06em",
              color: "rgba(255,255,255,0.9)",
            }}
          >
            <GenericEditableText sectionId={sectionId} field="subtitle" value={c.subtitle ?? ""} tag="span" />
          </p>
          {c.ctaHref && (
            <a
              href={resolveDemoHref(c.ctaHref, tenantSlug, isAdmin)}
              className="inline-block uppercase no-underline transition-colors"
              style={{
                border: "1.5px solid rgba(255,255,255,0.8)",
                color: "#fff",
                fontFamily: "var(--font-body)",
                fontSize: 12,
                letterSpacing: "0.2em",
                padding: "14px 36px",
                borderRadius: 50,
                marginBottom: 48,
              }}
            >
              <GenericEditableText sectionId={sectionId} field="ctaText" value={c.ctaText ?? "Rezervovat"} tag="span" />
            </a>
          )}
          {(hoursLines.length > 0 || address) && (
            <div
              style={{
                fontSize: "0.95rem",
                lineHeight: 2,
                color: "rgba(255,255,255,0.85)",
                marginTop: 32,
              }}
            >
              {hoursLines.map((h, i) => (
                <p key={i}>
                  <strong style={{ color: "#fff" }}>
                    <GenericEditableText
                      sectionId={sectionId}
                      field={`hoursLines.${i}.label`}
                      value={h.label}
                      tag="span"
                    />
                  </strong>{" "}
                  <GenericEditableText
                    sectionId={sectionId}
                    field={`hoursLines.${i}.value`}
                    value={h.value}
                    tag="span"
                  />
                </p>
              ))}
              {address && (
                <p>
                  <GenericEditableText sectionId={sectionId} field="address" value={address} tag="span" />
                </p>
              )}
            </div>
          )}
        </div>
        {showScroll && (
          <div
            aria-hidden
            className="absolute z-10"
            style={{
              bottom: 32,
              left: "50%",
              transform: "translateX(-50%)",
              opacity: 0.7,
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M12 5v14M5 12l7 7 7-7" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        )}
      </section>
    );
  }

  if (variant === "hero-barber-titleonly") {
    return (
      <section
        className="relative flex items-center justify-center overflow-hidden"
        style={{ minHeight: "80vh", backgroundColor: "#1c1410" }}
        data-template="barber-03"
      >
        <div aria-hidden className="absolute inset-0 pointer-events-none" style={{ backgroundColor: "#1c1410", zIndex: 0 }} />
        {c.backgroundImage && (
          <BackgroundEditableImage sectionId={sectionId} src={c.backgroundImage} overlayColor="transparent" priority={true} />
        )}
        <div
          aria-hidden
          className="absolute inset-0 z-[1] pointer-events-none"
          style={{ background: "linear-gradient(to bottom,rgba(0,0,0,.35) 0%,rgba(0,0,0,.55) 60%,rgba(28,20,16,.82) 100%)" }}
        />
        <div className="relative z-10 text-center text-white px-6 max-w-[1100px]">
          <h1
            className="uppercase"
            style={{
              fontFamily: "var(--font-heading)",
              fontWeight: 400,
              fontSize: "clamp(1.9rem, 4.6vw, 4rem)",
              letterSpacing: "0.12em",
              lineHeight: 1.18,
              color: "#fff",
              textShadow: "0 2px 24px rgba(0,0,0,0.45)",
            }}
          >
            <GenericEditableText sectionId={sectionId} field="title" value={c.title ?? ""} tag="span" />
          </h1>
        </div>
      </section>
    );
  }

  if (variant === "hero-split") {
    return (
      <section
        className="relative flex flex-col md:flex-row min-h-dvh overflow-hidden"
        style={{ backgroundColor: "var(--color-bg, #1e1e1e)" }}
      >
        {/* Left: text block */}
        <div
          className="relative z-10 flex flex-col justify-center flex-1 px-10 md:px-16 py-28 md:py-0 order-2 md:order-1"
          style={{ borderLeft: "5px solid var(--color-primary, #ff5268)", minWidth: 0 }}
        >
          <h1
            className="text-5xl md:text-6xl lg:text-7xl font-black mb-6 leading-none whitespace-pre-line uppercase"
            style={{
              fontFamily: "var(--font-heading)",
              color: "var(--color-text, #f4f4f4)",
              letterSpacing: "-0.01em",
            }}
          >
            <GenericEditableText
              sectionId={sectionId}
              field="title"
              value={c.title ?? "Fade.\nStyle.\nIdentity."}
              tag="span"
            />
          </h1>
          <div
            style={{
              width: 48,
              height: 3,
              backgroundColor: "var(--color-primary, #ff5268)",
              marginBottom: "1.5rem",
            }}
          />
          <p
            className="text-base md:text-lg mb-10 max-w-sm"
            style={{
              color: "rgba(255,255,255,0.65)",
              fontFamily: "var(--font-body)",
              fontWeight: 300,
              lineHeight: 1.7,
            }}
          >
            <GenericEditableText
              sectionId={sectionId}
              field="subtitle"
              value={c.subtitle ?? "Urban barbershop. Přesné střihy, nulový kompromis."}
              tag="span"
            />
          </p>
          {c.ctaHref && (
            <a
              href={resolveDemoHref(c.ctaHref, tenantSlug, isAdmin)}
              className="inline-flex items-center justify-center self-start min-h-[52px] px-10 font-bold uppercase tracking-widest transition-opacity hover:opacity-80"
              style={{
                backgroundColor: "var(--color-primary, #ff5268)",
                color: "#fff",
                borderRadius: "var(--radius, 4px)",
                fontSize: "0.8rem",
                letterSpacing: "0.12em",
              }}
            >
              <GenericEditableText sectionId={sectionId} field="ctaText" value={c.ctaText ?? "Rezervovat"} tag="span" />
            </a>
          )}
        </div>

        {/* Right: full-height image */}
        <div className="relative flex-1 min-h-[45vh] md:min-h-full order-1 md:order-2" style={{ maxWidth: "45%" }}>
          {c.backgroundImage ? (
            <GenericEditableImage
              sectionId={sectionId}
              field="backgroundImage"
              src={c.backgroundImage}
              alt={c.title ?? "hero"}
              className="absolute inset-0 h-full w-full"
            >
              <Image
                src={c.backgroundImage}
                alt={c.title ?? "hero"}
                fill
                priority
                className="object-cover object-center"
                unoptimized={shouldSkipNextImageOptimization(c.backgroundImage)}
              />
            </GenericEditableImage>
          ) : (
            <div
              className="absolute inset-0"
              style={{ backgroundColor: "var(--color-surface, #2a2a2a)" }}
            />
          )}
          {/* Overlay gradient for depth */}
          <div
            className="absolute inset-0"
            style={{ background: "linear-gradient(to right, rgba(30,30,30,0.4) 0%, rgba(0,0,0,0.15) 100%)" }}
          />
        </div>
      </section>
    );
  }

  // Default: hero-centered
  return (
    <section
      className="relative min-h-dvh flex items-center justify-center text-center overflow-hidden"
      style={{
        backgroundColor: "var(--color-surface, #f4f6f9)",
        paddingInline: "clamp(16px, 5vw, 32px)",
        paddingBlock: "6rem",
      }}
    >
      {c.backgroundImage && (
        <BackgroundEditableImage sectionId={sectionId} src={c.backgroundImage} priority={true} />
      )}
      <div className="relative z-10 max-w-3xl mx-auto w-full">
        <h1
          className="text-3xl md:text-6xl font-bold mb-6 whitespace-pre-line leading-tight"
          style={{ fontFamily: "var(--font-heading)", color: "var(--color-text, #111)" }}
        >
          <GenericEditableText sectionId={sectionId} field="title" value={c.title ?? "Vítejte"} tag="span" />
        </h1>
        <p className="text-base md:text-lg mb-10" style={{ color: "var(--color-text-muted, #666)" }}>
          <GenericEditableText sectionId={sectionId} field="subtitle" value={c.subtitle ?? "Váš profesionální web."} tag="span" />
        </p>
        {c.ctaHref && (
          <a
            href={resolveDemoHref(c.ctaHref, tenantSlug, isAdmin)}
            className="block sm:inline-block w-full sm:w-auto px-8 py-4 font-semibold text-white text-center transition-opacity hover:opacity-90"
            style={{ backgroundColor: "var(--color-primary, #1B3A6B)", borderRadius: "var(--radius, 4px)" }}
          >
            <GenericEditableText sectionId={sectionId} field="ctaText" value={c.ctaText ?? "Kontaktujte nás"} tag="span" />
          </a>
        )}
      </div>
    </section>
  );
}

function resolveDemoHref(href: string, tenantSlug?: string, isAdmin = false) {
  if (!tenantSlug || !href.startsWith("/")) return href;
  if (href === "/") return `/demo/${tenantSlug}${isAdmin ? "/admin" : ""}`;
  return `/demo/${tenantSlug}${isAdmin ? "/admin" : ""}${href}`;
}

function HeroBarber04Slider({
  slides,
  interval,
  ctaText,
  ctaHref,
  sectionId,
}: {
  slides: Array<{ title?: string; subtitle?: string; backgroundImage?: string }>;
  interval: number;
  ctaText: string;
  ctaHref: string;
  sectionId: number;
}) {
  const [idx, setIdx] = useState(0);
  const count = Math.max(slides.length, 1);
  useEffect(() => {
    if (count < 2) return;
    const t = setInterval(() => setIdx((i) => (i + 1) % count), Math.max(2000, interval));
    return () => clearInterval(t);
  }, [count, interval]);

  return (
    <section
      className="relative overflow-hidden"
      style={{ minHeight: "100svh", backgroundColor: "#000" }}
      data-template="barber-04"
    >
      {/* Slides — stacked, opacity-cross-fade */}
      {slides.map((s, i) => (
        <div
          key={`slide-${i}`}
          className="absolute inset-0 transition-opacity duration-700"
          style={{ opacity: i === idx ? 1 : 0, zIndex: 0 }}
          aria-hidden={i !== idx}
        >
          {s.backgroundImage ? (
            <Image
              src={String(s.backgroundImage)}
              alt=""
              fill
              priority={i === 0}
              sizes="100vw"
              className="object-cover"
              unoptimized={shouldSkipNextImageOptimization(String(s.backgroundImage))}
            />
          ) : (
            <div className="absolute inset-0" style={{ backgroundColor: "#1a1a1a" }} />
          )}
        </div>
      ))}

      {/* Gradient overlay */}
      <div
        aria-hidden
        className="absolute inset-0 z-[1] pointer-events-none"
        style={{
          background:
            "linear-gradient(to bottom,rgba(0,0,0,.45) 0%,rgba(0,0,0,.65) 70%,rgba(0,0,0,.85) 100%)",
        }}
      />

      {/* Content — keyed by idx so each slide re-mounts and replays slide-up animation */}
      <style>{`
        @keyframes barber04SlideUp {
          0%   { opacity: 0; transform: translateY(40px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        [data-template="barber-04"] .b04-anim-1 { animation: barber04SlideUp .9s cubic-bezier(.22,.61,.36,1) .15s both; }
        [data-template="barber-04"] .b04-anim-2 { animation: barber04SlideUp .9s cubic-bezier(.22,.61,.36,1) .35s both; }
        [data-template="barber-04"] .b04-anim-3 { animation: barber04SlideUp .9s cubic-bezier(.22,.61,.36,1) .55s both; }
        @media (prefers-reduced-motion: reduce) {
          [data-template="barber-04"] .b04-anim-1,
          [data-template="barber-04"] .b04-anim-2,
          [data-template="barber-04"] .b04-anim-3 { animation: none; opacity: 1; transform: none; }
        }
      `}</style>
      <div className="relative z-10 flex items-center justify-center text-center text-white px-6" style={{ minHeight: "100svh" }}>
        <div key={`slide-content-${idx}`} className="max-w-[960px] pt-24">
          <h1
            className="uppercase b04-anim-1"
            style={{
              fontFamily: "'Bebas Neue','Oswald',Impact,sans-serif",
              fontWeight: 300,
              fontSize: "clamp(24px, 3vw, 48px)",
              letterSpacing: "0",
              lineHeight: 1.15,
              color: "#fff",
              marginBottom: 16,
            }}
          >
            <GenericEditableText
              sectionId={sectionId}
              field={`slides.${idx}.title`}
              value={slides[idx]?.title ?? ""}
              tag="span"
            />
          </h1>
          <p
            className="b04-anim-2"
            style={{
              fontFamily: "'Lato',Helvetica,Arial,sans-serif",
              fontWeight: 400,
              fontStyle: "italic",
              fontSize: "clamp(13px, 1.3vw, 18px)",
              letterSpacing: "0.01em",
              color: "rgba(255,255,255,0.92)",
              maxWidth: 600,
              margin: "0 auto 32px",
              lineHeight: 1.6,
            }}
          >
            <GenericEditableText
              sectionId={sectionId}
              field={`slides.${idx}.subtitle`}
              value={slides[idx]?.subtitle ?? ""}
              tag="span"
            />
          </p>
          {ctaText && (
            <a
              href={ctaHref}
              className="inline-block uppercase no-underline transition-colors hover:bg-white hover:text-black b04-anim-3"
              style={{
                backgroundColor: "#d5b981",
                color: "#fff",
                fontFamily: "'Lato',Helvetica,Arial,sans-serif",
                fontSize: 14,
                fontWeight: 700,
                letterSpacing: "2px",
                padding: "10px 28px",
                borderRadius: 0,
                fontWeight: 400,
              }}
            >
              <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
            </a>
          )}
        </div>
      </div>

      {/* Prev / Next arrows — Divi-style large chevrons, hidden on hover-less mobile */}
      {count > 1 && (
        <>
          <button
            type="button"
            onClick={() => setIdx((i) => (i - 1 + count) % count)}
            aria-label="Předchozí slide"
            className="absolute top-1/2 z-20 hidden md:flex items-center justify-center bg-transparent border-0 cursor-pointer transition-opacity"
            style={{
              left: 22,
              transform: "translateY(-50%)",
              color: "#fff",
              width: 56,
              height: 56,
              opacity: 0.55,
              padding: 0,
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = "0.55")}
          >
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <polyline points="15 6 9 12 15 18" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => setIdx((i) => (i + 1) % count)}
            aria-label="Další slide"
            className="absolute top-1/2 z-20 hidden md:flex items-center justify-center bg-transparent border-0 cursor-pointer transition-opacity"
            style={{
              right: 22,
              transform: "translateY(-50%)",
              color: "#fff",
              width: 56,
              height: 56,
              opacity: 0.55,
              padding: 0,
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = "0.55")}
          >
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <polyline points="9 6 15 12 9 18" />
            </svg>
          </button>
        </>
      )}

      {/* Dots indikátor */}
      {count > 1 && (
        <div
          className="absolute left-1/2 z-10 flex items-center gap-3"
          style={{ bottom: 32, transform: "translateX(-50%)" }}
          aria-hidden
        >
          {slides.map((_, i) => (
            <button
              key={`dot-${i}`}
              type="button"
              onClick={() => setIdx(i)}
              aria-label={`Slide ${i + 1}`}
              className="border-0 cursor-pointer"
              style={{
                width: i === idx ? 36 : 16,
                height: 2,
                backgroundColor: i === idx ? "#d5b981" : "rgba(255,255,255,0.4)",
                padding: 0,
                transition: "width .25s, background-color .25s",
              }}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function BackgroundEditableImage({ sectionId, src, overlayColor, priority }: { sectionId: number; src: string; overlayColor?: string; priority?: boolean }) {
  return (
    <GenericEditableImage
      sectionId={sectionId}
      field="backgroundImage"
      src={src}
      alt=""
      className="absolute inset-0 z-0"
      style={{ position: "absolute" }}
      priority={priority}
    >
      <Image
        src={src}
        alt=""
        fill
        className="object-cover"
        sizes="100vw"
        priority={priority}
        unoptimized={shouldSkipNextImageOptimization(src)}
      />
      {overlayColor && (
        <div className="absolute inset-0" style={{ backgroundColor: overlayColor, pointerEvents: "none" }} />
      )}
    </GenericEditableImage>
  );
}
