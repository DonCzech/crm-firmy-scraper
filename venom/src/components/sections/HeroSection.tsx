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
  hoursLines?: Array<{ label: string; value: string }>;
  address?: string;
  scrollIndicator?: boolean;
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

  // hair-02: full-bleed photo slider, height 687px, white overlay, teal CTA pill
  if (variant === "hero-hair-02-slider") {
    return <HeroHair02Slider content={content} sectionId={sectionId} />;
  }

  // hair-03: 2-col split — levý sloupec 50% s paddingem, pravý sloupec 50% foto edge-to-edge.
  // BG #ebebeb sjednocený s navbarem. H1: 96px Helvetica dark. CTA: solid dark square.
  if (variant === "hero-hair-03-split") {
    const image    = String((content as Record<string,unknown>).image ?? "");
    const title    = String((content as Record<string,unknown>).title ?? "S LÁSKOU K VLASŮM");
    const subtitle = String((content as Record<string,unknown>).subtitle ?? "Jsme profesionální kadeřnický salon v samém srdci Prahy.");
    const ctaText  = String((content as Record<string,unknown>).ctaText ?? "Chci se objednat");
    const ctaHref  = String((content as Record<string,unknown>).ctaHref ?? "#kontakt");
    const DARK     = "#2f201a";
    const BG       = "#ebebeb";
    const SANS     = "Helvetica, Arial, sans-serif";

    return (
      <section
        id="uvod"
        className="w-full"
        style={{ backgroundColor: BG }}
        data-template="hair-03"
      >
        <div style={{ display: "flex", flexDirection: "row", minHeight: 779 }}>
          {/* Levý sloupec — text */}
          <div
            style={{
              flex: "0 0 50%",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              padding: "64px 60px 64px 90px",
            }}
          >
            <GenericEditableText
              sectionId={sectionId}
              field="title"
              value={title}
              tag="h1"
              style={{
                fontFamily: SANS,
                fontSize: 96,
                fontWeight: 400,
                color: DARK,
                lineHeight: 1.05,
                letterSpacing: "1px",
                margin: "0 0 28px 0",
              }}
            />
            <GenericEditableText
              sectionId={sectionId}
              field="subtitle"
              value={subtitle}
              tag="p"
              style={{
                fontFamily: SANS,
                fontSize: 16,
                fontWeight: 400,
                color: DARK,
                lineHeight: 1.6,
                maxWidth: 380,
                margin: "0 0 36px 0",
              }}
            />
            <a
              href={ctaHref}
              style={{
                display: "inline-block",
                alignSelf: "flex-start",
                fontFamily: SANS,
                fontSize: 16,
                fontWeight: 400,
                color: "#ffffff",
                backgroundColor: DARK,
                padding: "14px 32px",
                borderRadius: 0,
                textDecoration: "none",
                letterSpacing: "0.01em",
                transition: "background 0.15s",
              }}
              onMouseEnter={e => { e.currentTarget.style.backgroundColor = "#4a3428"; }}
              onMouseLeave={e => { e.currentTarget.style.backgroundColor = DARK; }}
            >
              <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
            </a>
          </div>

          {/* Pravý sloupec — foto vyplňuje celou pravou půlku */}
          {image && (
            <div style={{ flex: "0 0 50%", position: "relative", minHeight: 651 }}>
              <GenericEditableImage
                sectionId={sectionId}
                field="image"
                src={image}
                alt={title}
                className="absolute inset-0 w-full h-full"
                style={{ position: "absolute" }}
              >
                <Image
                  src={image}
                  alt={title}
                  fill
                  className="object-cover object-top"
                  priority
                  sizes="50vw"
                  unoptimized={shouldSkipNextImageOptimization(image)}
                />
              </GenericEditableImage>
            </div>
          )}
        </div>
      </section>
    );
  }

  // hair-04: navbar embedded v hero — 1:1 kim-impressive.cz
  // Fixed sticky navbar: dark semi-transparent strip (rgba(0,0,0,0.55)), logo vlevo, nav vpravo.
  // bg foto 100vh, overlay rgba(0,0,0,0.24), H1 bílý v tmavém boxu, 2× pill CTA gold border.
  if (variant === "hero-hair-04-with-navbar") {
    const bg          = String(content.backgroundImage ?? "");
    const siteName    = String(content.siteName ?? "Impresiv Studio");
    const logoUrl     = String(content.logoUrl ?? "");
    const links       = (content.links as Array<{ label: string; href: string }>) ?? [];
    const title       = String(content.title ?? "Je čas se ostříhat? Posaďte se k nám.");
    const ctaPrimText = String(content.ctaPrimaryText ?? "Ceník a rezervace");
    const ctaPrimHref = String(content.ctaPrimaryHref ?? "/#cenik");
    const ctaSecText  = String(content.ctaSecondaryText ?? "Chci se ostříhat hned");
    const ctaSecHref  = String(content.ctaSecondaryHref ?? "/#kontakt");

    const WHITE = "#ffffff";
    const GOLD  = "#FFDF25";
    const LATO  = "'Lato', sans-serif";
    const NAV_H = 113; // px — výška sticky navbaru

    /* Logo — HTML elementy (SVG text nefunguje bez načteného fontu v browseru) */
    const LogoEl = () => (
      <div style={{ display: "flex", alignItems: "center", gap: 14, textDecoration: "none" }}>
        {/* K lettermark */}
        <span style={{ fontFamily: LATO, fontSize: 64, fontWeight: 900, color: WHITE, lineHeight: 1, letterSpacing: "-2px", userSelect: "none" }}>K</span>
        {/* Svislý oddělovač */}
        <span aria-hidden style={{ display: "block", width: 1, height: 64, backgroundColor: "rgba(255,255,255,0.3)", flexShrink: 0 }} />
        {/* Text vpravo */}
        <span style={{ display: "flex", flexDirection: "column", gap: 1 }}>
          <span style={{ fontFamily: LATO, fontSize: 17, fontWeight: 700, color: WHITE, letterSpacing: "0.04em", lineHeight: 1.2 }}>Kim</span>
          <span style={{ fontFamily: LATO, fontSize: 17, fontWeight: 700, color: WHITE, letterSpacing: "0.04em", lineHeight: 1.2 }}>Impressive</span>
          <span style={{ fontFamily: LATO, fontSize: 10, fontWeight: 300, color: "rgba(255,255,255,0.7)", letterSpacing: "0.25em", lineHeight: 1.4, textTransform: "uppercase" }}>Hair Salon</span>
        </span>
      </div>
    );

    return (
      <>
      <style>{`
        html { scroll-behavior: smooth; }
        @media (max-width: 768px) {
          [data-template="hair-04"] .h04-hero-content { padding-top: 80px !important; }
          [data-template="hair-04"] .h04-title-box { max-width: 90% !important; padding: 4% 5% !important; }
          [data-template="hair-04"] .h04-cta-row { flex-direction: column; align-items: center; gap: 14px !important; }
          [data-template="hair-04"] .h04-cta-row a { padding: 14px 32px !important; font-size: 16px !important; }
        }
      `}</style>
      <section
        id="uvod"
        style={{ position: "relative", height: 600, overflow: "hidden", backgroundColor: "#1a1a1a" }}
        data-template="hair-04"
      >
        {/* Fotografie na pozadí */}
        {bg ? (
          <GenericEditableImage sectionId={sectionId} field="backgroundImage" src={bg} alt="hero" className="absolute inset-0 w-full h-full" style={{ position: "absolute" }}>
            <Image src={bg} alt="hero" fill className="object-cover object-center" priority sizes="100vw" unoptimized={shouldSkipNextImageOptimization(bg)} />
          </GenericEditableImage>
        ) : (
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, #4a6080 0%, #92a8d1 50%, #2c3e50 100%)" }} />
        )}

        {/* Tmavý overlay přes celé hero */}
        <div aria-hidden style={{ position: "absolute", inset: 0, backgroundColor: "rgba(0,0,0,0.24)" }} />

        {/* ═══ STICKY NAVBAR — position: fixed, tmavý pruh ═══ */}
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            zIndex: 1000,
            backgroundColor: "rgba(0,0,0,0.55)",
            backdropFilter: "blur(3px)",
          }}
        >
          {/* Desktop nav */}
          <div
            className="hidden lg:flex"
            style={{ width: "100%", alignItems: "center", minHeight: NAV_H, paddingLeft: 137, paddingRight: 137 }}
          >
            {/* Logo — vlevo */}
            <a
              href={tenantSlug ? `/demo/${tenantSlug}${isAdmin ? "/admin" : ""}` : "/"}
              style={{ textDecoration: "none", display: "flex", alignItems: "center", flexShrink: 0 }}
              aria-label={siteName}
            >
              {logoUrl
                ? <img src={logoUrl} alt={siteName} style={{ maxHeight: 80, display: "block" }} />
                : <LogoEl />
              }
            </a>

            {/* Nav links — úplně vpravo, těsně u okraje */}
            <nav style={{ marginLeft: "auto", display: "flex", alignItems: "center" }} aria-label="Hlavní menu">
              {links.map((l, i) => (
                <a
                  key={`h4-nav-${i}`}
                  href={resolveDemoHref(l.href, tenantSlug, isAdmin)}
                  style={{
                    fontFamily: LATO,
                    fontSize: 18,
                    fontWeight: i === 0 ? 400 : 100,
                    color: i === 0 ? GOLD : WHITE,
                    textDecoration: "none",
                    padding: "0.7em 1.15em",
                    display: "inline-block",
                    whiteSpace: "nowrap",
                    letterSpacing: "0.01em",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.color = GOLD; }}
                  onMouseLeave={e => { e.currentTarget.style.color = i === 0 ? GOLD : WHITE; }}
                >
                  <GenericEditableText sectionId={sectionId} field={`links.${i}.label`} value={l.label} tag="span" />
                </a>
              ))}
            </nav>
          </div>

          {/* Mobile nav */}
          <div className="flex lg:hidden items-center justify-between" style={{ padding: "0 16px", height: 64 }}>
            <a href={tenantSlug ? `/demo/${tenantSlug}${isAdmin ? "/admin" : ""}` : "/"} style={{ display: "flex", alignItems: "center" }}>
              {logoUrl
                ? <img src={logoUrl} alt={siteName} style={{ maxWidth: 100, maxHeight: 50, objectFit: "contain" }} />
                : (
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontFamily: LATO, fontSize: 40, fontWeight: 900, color: WHITE, lineHeight: 1 }}>K</span>
                    <span style={{ display: "flex", flexDirection: "column" }}>
                      <span style={{ fontFamily: LATO, fontSize: 13, fontWeight: 700, color: WHITE }}>Kim Impressive</span>
                      <span style={{ fontFamily: LATO, fontSize: 9, fontWeight: 300, color: "rgba(255,255,255,0.7)", letterSpacing: "0.2em" }}>HAIR SALON</span>
                    </span>
                  </div>
                )
              }
            </a>
            <button style={{ background: "none", border: "none", cursor: "pointer", padding: 8, display: "flex", flexDirection: "column", gap: 5 }} aria-label="Menu">
              <span style={{ display: "block", width: 26, height: 2, backgroundColor: WHITE }} />
              <span style={{ display: "block", width: 26, height: 2, backgroundColor: WHITE }} />
              <span style={{ display: "block", width: 26, height: 2, backgroundColor: WHITE }} />
            </button>
          </div>
        </div>

        {/* ═══ HERO CONTENT — posunutý pod fixed navbar ═══ */}
        <div
          className="h04-hero-content"
          style={{
            position: "relative",
            zIndex: 5,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: 600,
            flexDirection: "column",
            paddingTop: NAV_H + 20,
            paddingBottom: 20,
            paddingLeft: "2%",
            paddingRight: "2%",
            boxSizing: "border-box",
          }}
        >
          {/* H1 v tmavém boxu */}
          <div
            style={{
              backgroundColor: "#00000085",
              borderRadius: 20,
              padding: "3% 4%",
              maxWidth: "44%",
              textAlign: "center",
              marginBottom: "2.5%",
            }}
          >
            <GenericEditableText
              sectionId={sectionId}
              field="title"
              value={title}
              tag="h1"
              style={{
                fontFamily: LATO,
                fontSize: "clamp(22px, 2.8vw, 46px)",
                fontWeight: 700,
                color: WHITE,
                lineHeight: 1.35,
                margin: 0,
              }}
            />
          </div>

          {/* 2× CTA buttony — pill, gold border, +20% oproti originálu */}
          <div className="h04-cta-row" style={{ display: "flex", gap: 28, flexWrap: "wrap", justifyContent: "center" }}>
            {[
              { text: ctaPrimText, field: "ctaPrimaryText",   href: ctaPrimHref },
              { text: ctaSecText,  field: "ctaSecondaryText", href: ctaSecHref  },
            ].map(({ text, field, href }) => (
              <a
                key={field}
                href={resolveDemoHref(href, tenantSlug, isAdmin)}
                style={{
                  fontFamily: LATO,
                  fontSize: 22,
                  fontWeight: 600,
                  color: GOLD,
                  backgroundColor: "rgba(0,0,0,0.55)",
                  border: `2px solid ${GOLD}`,
                  borderRadius: 60,
                  padding: "18px 52px",
                  textDecoration: "none",
                  display: "inline-block",
                  transition: "color 0.2s, border-color 0.2s",
                  whiteSpace: "nowrap",
                  textAlign: "center",
                }}
                onMouseEnter={e => { e.currentTarget.style.color = WHITE; e.currentTarget.style.borderColor = WHITE; }}
                onMouseLeave={e => { e.currentTarget.style.color = GOLD; e.currentTarget.style.borderColor = GOLD; }}
              >
                <GenericEditableText sectionId={sectionId} field={field} value={text} tag="span" />
              </a>
            ))}
          </div>
        </div>
      </section>
      </>
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

  // beauty-01: full-bleed hero foto, výška 615px (přesně dle selfbeauty-demo)
  // Originál selfbeauty.cz — žádný overlay (data-bg-effect-name="")
  // H1: Cormorant Garamond 100px → Fahkwang light, "na jednom místě." 70px italic
  if (variant === "hero-beauty-01-fullbleed") {
    const bg       = String(content.backgroundImage ?? "");
    const tag      = String(content.tag ?? "Praha 1 · Prémiové beauty studio");
    const titleH1  = String(content.titleH1 ?? "Holičství, nehty\na péče o pleť");
    const titleIta = String(content.titleItalic ?? "na jednom místě.");
    const sub      = String(content.subtitle ?? "Vaše péče o sebe začíná tady.");
    const cta      = String(content.ctaText ?? "Rezervovat");
    const href     = String(content.ctaHref ?? "#rezervace");
    const SERIF    = "'Cormorant Garamond', 'Fahkwang', Georgia, serif";
    const SERIF_IT = "'Adobe Caslon Pro', 'Cormorant Garamond', 'Fahkwang', Georgia, serif";
    const SANS     = "Inter, 'Fahkwang', sans-serif";
    const SAND     = "#E0BE9A";
    return (
      <section
        id="uvod"
        className="relative w-full flex items-center justify-center overflow-hidden"
        style={{ minHeight: 615, backgroundColor: "#2a2520" }}
      >
        {/* Bg foto */}
        {bg && (
          <GenericEditableImage sectionId={sectionId} field="backgroundImage" src={bg} alt="" className="absolute inset-0 z-0" style={{ position: "absolute" }} priority>
            <Image src={bg} alt="" fill className="object-cover object-center" sizes="100vw" priority unoptimized={shouldSkipNextImageOptimization(bg)} />
          </GenericEditableImage>
        )}
        {/* Subtle dark overlay */}
        <div aria-hidden className="absolute inset-0 z-[1] pointer-events-none" style={{ backgroundColor: "rgba(0,0,0,0.22)" }} />

        {/* Text content — zarovnáno na střed sekce */}
        <div
          className="relative z-[2] flex flex-col items-center text-center"
          style={{ padding: "60px clamp(20px, 6vw, 80px)", width: "100%", maxWidth: 1040 }}
        >
          {/* Tag — Inter 14px bold, bílá */}
          <p
            style={{
              fontFamily: SANS,
              fontSize: 14,
              fontWeight: 600,
              color: "#ffffff",
              letterSpacing: "0.06em",
              marginBottom: 28,
            }}
          >
            <GenericEditableText sectionId={sectionId} field="tag" value={tag} tag="span" />
          </p>

          {/* H1 — Cormorant Garamond, 100px → responsive */}
          <h1
            style={{
              fontFamily: SERIF,
              fontSize: "clamp(42px, 7vw, 100px)",
              fontWeight: 400,
              color: "#ffffff",
              lineHeight: 1.05,
              marginBottom: 0,
              whiteSpace: "pre-line",
            }}
          >
            <GenericEditableText sectionId={sectionId} field="titleH1" value={titleH1} tag="span" />
          </h1>

          {/* Italic část — Adobe Caslon / Cormorant, 70px sand, italic */}
          <p
            style={{
              fontFamily: SERIF_IT,
              fontSize: "clamp(30px, 5vw, 70px)",
              fontWeight: 400,
              fontStyle: "italic",
              color: SAND,
              lineHeight: 1.1,
              marginTop: 4,
              marginBottom: 24,
            }}
          >
            <GenericEditableText sectionId={sectionId} field="titleItalic" value={titleIta} tag="span" />
          </p>

          {/* Subtitle — Inter 18px bílá */}
          <p
            style={{
              fontFamily: SANS,
              fontSize: 18,
              fontWeight: 400,
              color: "#ffffff",
              marginBottom: 36,
              lineHeight: 1.5,
            }}
          >
            <GenericEditableText sectionId={sectionId} field="subtitle" value={sub} tag="span" />
          </p>

          {/* CTA tlačítko — sand bg */}
          <a
            href={resolveDemoHref(href, tenantSlug, isAdmin)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: SAND,
              color: "#1F1F1F",
              fontFamily: SANS,
              fontSize: 13,
              fontWeight: 600,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              textDecoration: "none",
              padding: "12px 36px",
              transition: "background 0.25s",
            }}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = "#C4A07E"; }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = SAND; }}
          >
            <GenericEditableText sectionId={sectionId} field="ctaText" value={cta} tag="span" />
          </a>
        </div>
      </section>
    );
  }

  // Default: hero-centered (s bg fotkou = bílý text + overlay; bez = tmavý text)
  const hasBg = !!c.backgroundImage;
  return (
    <section
      className="relative flex items-center justify-center text-center overflow-hidden"
      style={{
        backgroundColor: hasBg ? "#1a1a1a" : "var(--color-surface, #f4f6f9)",
        paddingInline: "clamp(16px, 5vw, 32px)",
        paddingBlock: hasBg ? "0" : "6rem",
        minHeight: hasBg ? 480 : undefined,
      }}
    >
      {hasBg && (
        <>
          <BackgroundEditableImage sectionId={sectionId} src={c.backgroundImage!} priority={true} />
          <div className="absolute inset-0 z-10" style={{ backgroundColor: "rgba(0,0,0,0.45)" }} aria-hidden />
        </>
      )}
      <div className="relative z-20 max-w-3xl mx-auto w-full" style={{ padding: hasBg ? "120px 0 100px" : undefined }}>
        <h1
          className="text-3xl md:text-6xl font-bold mb-6 whitespace-pre-line leading-tight"
          style={{ fontFamily: "var(--font-heading)", color: hasBg ? "#ffffff" : "var(--color-text, #111)" }}
        >
          <GenericEditableText sectionId={sectionId} field="title" value={c.title ?? "Vítejte"} tag="span" />
        </h1>
        <p className="text-base md:text-lg mb-10 max-w-2xl mx-auto" style={{ color: hasBg ? "rgba(255,255,255,0.85)" : "var(--color-text-muted, #666)" }}>
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
  // Hash-only anchor — vrátit jen #hash, jinak browser naviguje na novou URL a způsobuje reload
  if (href.startsWith("/#")) return href.slice(1);
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
                fontWeight: 400,
                letterSpacing: "2px",
                padding: "10px 28px",
                borderRadius: 0,
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

function HeroHair02Slider({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  type Slide = { image: string; alt?: string };
  const slides = ((content.slides as Slide[]) ?? []);
  const ctaText = String(content.ctaText ?? "On-line rezervace");
  const ctaHref = String(content.ctaHref ?? "#kontakt");
  const [idx, setIdx] = useState(0);
  const count = slides.length;

  useEffect(() => {
    if (count <= 1) return;
    const t = setInterval(() => setIdx((i) => (i + 1) % count), 6000);
    return () => clearInterval(t);
  }, [count]);

  const TEAL = "#459696";
  const HERO_H = 687;

  return (
    <section
      id="uvod"
      className="relative w-full overflow-hidden"
      style={{ height: HERO_H, backgroundColor: "#ebe8e2" }}
      data-template="hair-02"
    >
      {/* slides — crossfade */}
      {slides.map((sl, i) => (
        <div
          key={i}
          aria-hidden={i !== idx}
          className="absolute inset-0 transition-opacity duration-1000"
          style={{ opacity: i === idx ? 1 : 0, zIndex: i === idx ? 1 : 0 }}
        >
          <Image
            src={sl.image}
            alt={sl.alt ?? ""}
            fill
            className="object-cover"
            sizes="100vw"
            priority={i === 0}
            unoptimized={shouldSkipNextImageOptimization(sl.image)}
          />
        </div>
      ))}

      {/* white overlay rgba(255,255,255,0.25) */}
      <div aria-hidden className="absolute inset-0 z-10" style={{ backgroundColor: "rgba(255,255,255,0.25)" }} />

      {/* CTA pill — centered at ~65% of height */}
      <div
        className="absolute z-20 flex flex-col items-center"
        style={{ left: "50%", top: "65%", transform: "translate(-50%, -50%)" }}
      >
        <a
          href={ctaHref}
          className="no-underline uppercase tracking-widest transition-opacity hover:opacity-80"
          style={{
            backgroundColor: TEAL,
            color: "#fff",
            fontFamily: "'Montserrat', sans-serif",
            fontSize: 13,
            fontWeight: 600,
            letterSpacing: "0.18em",
            padding: "13px 36px",
            borderRadius: 99,
            display: "inline-block",
          }}
        >
          <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
        </a>
      </div>

      {/* Prev / Next arrows */}
      {count > 1 && (
        <>
          <button
            type="button"
            onClick={() => setIdx((i) => (i - 1 + count) % count)}
            aria-label="Předchozí slide"
            className="absolute top-1/2 z-20 flex items-center justify-center bg-transparent border-0 cursor-pointer"
            style={{ left: 20, transform: "translateY(-50%)", color: TEAL, opacity: 0.8, padding: 0 }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = "0.8")}
          >
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <polyline points="15 6 9 12 15 18" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => setIdx((i) => (i + 1) % count)}
            aria-label="Další slide"
            className="absolute top-1/2 z-20 flex items-center justify-center bg-transparent border-0 cursor-pointer"
            style={{ right: 20, transform: "translateY(-50%)", color: TEAL, opacity: 0.8, padding: 0 }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = "0.8")}
          >
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <polyline points="9 6 15 12 9 18" />
            </svg>
          </button>
        </>
      )}

      {/* Dots */}
      {count > 1 && (
        <div
          className="absolute left-1/2 z-20 flex items-center gap-2"
          style={{ bottom: 20, transform: "translateX(-50%)" }}
          aria-hidden
        >
          {slides.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setIdx(i)}
              aria-label={`Slide ${i + 1}`}
              className="border-0 cursor-pointer rounded-full p-0"
              style={{
                width: i === idx ? 10 : 8,
                height: i === idx ? 10 : 8,
                backgroundColor: i === idx ? TEAL : "rgba(255,255,255,0.7)",
                transition: "all .25s",
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
