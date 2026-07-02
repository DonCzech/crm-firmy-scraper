"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { GenericEditableText } from "@/components/tenant/GenericEditableText";
import { GenericEditableImage } from "@/components/tenant/GenericEditableImage";
import { GenericEditableBackground } from "@/components/tenant/GenericEditableBackground";
import { useGenericInlineEditor } from "@/components/tenant/GenericInlineEditorContext";
import { shouldSkipNextImageOptimization } from "@/lib/image-source";
import { useStudioOptional } from "@/components/studio/StudioContext";

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

  if (variant === "florist-01-hero") return <HeroFlorist01 content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;
  if (variant === "sweet-01-hero") return <HeroSweet01 content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;
  if (variant === "stavba-01-hero") return <HeroStavba01 content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;
  if (variant === "stavba-02-hero") return <HeroStavba02 content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;
  if (variant === "stavba-03-hero") return <HeroStavba03 content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;
  if (variant === "elektro-01-hero") return <HeroElektro01 content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;
  if (variant === "catering-01-hero") return <HeroCatering01 content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;
  if (variant === "hero-catering-01-page") return <HeroCatering01Page content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;
  if (variant === "hero-peak-cut-page") return <HeroPeakCutPage content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;
  if (variant === "hero-clinic-03-page") return <HeroClinic03Page content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;
  if (variant === "hero-solar-03-page")  return <HeroSolar03Page  content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;
  if (variant === "instala-01-hero") return <HeroInstala01 content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;
  if (variant === "grooming-01-hero") return <HeroGrooming01 content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;
  if (variant === "vet-01-hero") return <HeroVet01 content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;
  if (variant === "clean-01-hero") return <HeroClean01 content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;
  if (variant === "garden-01-hero") return <HeroGarden01 content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;
  if (variant === "garden-02-hero") return <HeroGarden02 content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;
  if (variant === "arbo-01-hero")   return <HeroArbo01   content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;
  if (variant === "clean-02-hero") return <HeroClean02 content={content as Record<string, unknown>} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;
  if (variant === "ddd-01-hero")   return <HeroDdd01   content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;

  // Shared focus override — injected by StudioCanvas when user moves focus picker in HeroInspectorPanel.
  // Applies to all inline hero variants that use BackgroundEditableImage.
  const _heroBgFocusAny = (content as Record<string, unknown>).__heroBgFocus as { x: number; y: number } | undefined;
  const bgFocusStyle = _heroBgFocusAny ? `${_heroBgFocusAny.x}% ${_heroBgFocusAny.y}%` : undefined;
  const _heroBgFocusMobileAny = (content as Record<string, unknown>).__heroBgFocusMobile as { x: number; y: number } | undefined;
  const bgFocusMobileStyle = _heroBgFocusMobileAny ? `${_heroBgFocusMobileAny.x}% ${_heroBgFocusMobileAny.y}%` : undefined;

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
              data-btn="primary"
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
    const heroBgTab   = String((content as Record<string,unknown>).__heroBgTab ?? "image");
    const heroBgColor = String((content as Record<string,unknown>).__heroBgColor ?? "#1a1a1a");
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

    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [menuOpen, setMenuOpen] = useState(false);

    /* Logo — HTML elementy (SVG text nefunguje bez načteného fontu v browseru) */
    const logoEl = (
      <div style={{ display: "flex", alignItems: "center", gap: 14, textDecoration: "none" }}>
        {/* Lettermark */}
        <span style={{ fontFamily: LATO, fontSize: 64, fontWeight: 900, color: WHITE, lineHeight: 1, letterSpacing: "-2px", userSelect: "none" }}>A</span>
        {/* Svislý oddělovač */}
        <span aria-hidden style={{ display: "block", width: 1, height: 64, backgroundColor: "rgba(255,255,255,0.3)", flexShrink: 0 }} />
        {/* Text vpravo */}
        <span style={{ display: "flex", flexDirection: "column", gap: 1 }}>
          <span style={{ fontFamily: LATO, fontSize: 17, fontWeight: 700, color: WHITE, letterSpacing: "0.08em", lineHeight: 1.2, whiteSpace: "nowrap" }}>Alfa</span>
          <span style={{ fontFamily: LATO, fontSize: 17, fontWeight: 700, color: WHITE, letterSpacing: "0.08em", lineHeight: 1.2, whiteSpace: "nowrap" }}>Barbershop</span>
          <span style={{ fontFamily: LATO, fontSize: 10, fontWeight: 300, color: "rgba(255,255,255,0.7)", letterSpacing: "0.25em", lineHeight: 1.4, textTransform: "uppercase", whiteSpace: "nowrap" }}>Hair Salon</span>
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
        {heroBgTab === "color" ? (
          <div style={{ position: "absolute", inset: 0, backgroundColor: heroBgColor }} />
        ) : bg ? (
          <GenericEditableImage sectionId={sectionId} field="backgroundImage" src={bg} alt="hero" className="absolute inset-0 w-full h-full" style={{ position: "absolute" }}>
            <Image src={bg} alt="hero" fill className="object-cover" style={{ objectPosition: bgFocusStyle }} priority sizes="100vw" unoptimized={shouldSkipNextImageOptimization(bg)} />
          </GenericEditableImage>
        ) : (
          <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(135deg, #4a6080 0%, #92a8d1 50%, #2c3e50 100%)" }} />
        )}

        {/* Tmavý overlay přes celé hero */}
        <div aria-hidden style={{ position: "absolute", inset: 0, backgroundColor: "rgba(0,0,0,0.24)", pointerEvents: "none" }} />

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
                ? <img loading="eager" src={logoUrl} alt={siteName} style={{ maxHeight: 80, display: "block" }} />
                : logoEl
              }
            </a>

            {/* Nav links — úplně vpravo, těsně u okraje */}
            <nav style={{ marginLeft: "auto", display: "flex", alignItems: "center" }} aria-label="Hlavní menu">
              {links.map((l, i) => (
                <a
                  key={`h4-nav-${i}`}
                  href={resolveDemoHref(l.href, tenantSlug, isAdmin)}
                  onClick={isAdmin ? (e) => e.preventDefault() : undefined}
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

          {/* Mobile nav — hamburger row */}
          <div className="flex lg:hidden items-center justify-between" style={{ padding: "0 20px", height: 64 }}>
            <a href={tenantSlug ? `/demo/${tenantSlug}${isAdmin ? "/admin" : ""}` : "/"} style={{ display: "flex", alignItems: "center", textDecoration: "none" }}>
              {logoUrl
                ? <img loading="eager" src={logoUrl} alt={siteName} style={{ maxWidth: 100, maxHeight: 50, objectFit: "contain" }} />
                : (
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontFamily: LATO, fontSize: 38, fontWeight: 900, color: WHITE, lineHeight: 1 }}>A</span>
                    <span aria-hidden style={{ display: "block", width: 1, height: 36, backgroundColor: "rgba(255,255,255,0.3)", flexShrink: 0 }} />
                    <span style={{ display: "flex", flexDirection: "column", gap: 1 }}>
                      <span style={{ fontFamily: LATO, fontSize: 12, fontWeight: 700, color: WHITE, letterSpacing: "0.06em", lineHeight: 1.05, whiteSpace: "nowrap" }}>Alfa</span>
                      <span style={{ fontFamily: LATO, fontSize: 12, fontWeight: 700, color: WHITE, letterSpacing: "0.06em", lineHeight: 1.05, whiteSpace: "nowrap" }}>Barbershop</span>
                      <span style={{ fontFamily: LATO, fontSize: 8, fontWeight: 300, color: "rgba(255,255,255,0.7)", letterSpacing: "0.18em", textTransform: "uppercase" }}>HAIR SALON</span>
                    </span>
                  </div>
                )
              }
            </a>
            {/* Hamburger button — 3 pruhy → X */}
            <button
              onClick={() => setMenuOpen(o => !o)}
              style={{ background: "none", border: "none", cursor: "pointer", padding: 10, display: "flex", flexDirection: "column", gap: 5, alignItems: "center", justifyContent: "center" }}
              aria-label={menuOpen ? "Zavřít menu" : "Otevřít menu"}
              aria-expanded={menuOpen}
            >
              <span style={{ display: "block", width: 26, height: 2, backgroundColor: WHITE, borderRadius: 2, transition: "transform 0.25s, opacity 0.25s", transform: menuOpen ? "translateY(7px) rotate(45deg)" : "none" }} />
              <span style={{ display: "block", width: 26, height: 2, backgroundColor: WHITE, borderRadius: 2, transition: "opacity 0.25s", opacity: menuOpen ? 0 : 1 }} />
              <span style={{ display: "block", width: 26, height: 2, backgroundColor: WHITE, borderRadius: 2, transition: "transform 0.25s, opacity 0.25s", transform: menuOpen ? "translateY(-7px) rotate(-45deg)" : "none" }} />
            </button>
          </div>

          {/* Mobile dropdown menu */}
          <div
            className="lg:hidden"
            style={{
              overflow: "hidden",
              maxHeight: menuOpen ? `${links.length * 56 + 16}px` : "0px",
              transition: "max-height 0.35s cubic-bezier(.4,0,.2,1)",
              borderTop: menuOpen ? "1px solid rgba(255,255,255,0.1)" : "none",
            }}
          >
            <nav style={{ display: "flex", flexDirection: "column", padding: "8px 0" }}>
              {links.map((l, i) => (
                <a
                  key={`h4-mob-${i}`}
                  href={resolveDemoHref(l.href, tenantSlug, isAdmin)}
                  onClick={isAdmin ? (e) => e.preventDefault() : () => setMenuOpen(false)}
                  style={{
                    fontFamily: LATO,
                    fontSize: 16,
                    fontWeight: i === 0 ? 500 : 300,
                    color: i === 0 ? GOLD : WHITE,
                    textDecoration: "none",
                    padding: "14px 24px",
                    display: "block",
                    borderBottom: "1px solid rgba(255,255,255,0.06)",
                    letterSpacing: "0.03em",
                  }}
                >
                  <GenericEditableText sectionId={sectionId} field={`links.${i}.label`} value={l.label} tag="span" />
                </a>
              ))}
            </nav>
          </div>
        </div>

        {/* ═══ HERO CONTENT — posunutý pod fixed navbar ═══ */}
        <div
          className="h04-hero-content"
          style={{
            position: "relative",
            zIndex: 30,
            pointerEvents: "none",
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
              pointerEvents: "auto",
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
          <div className="h04-cta-row" style={{ display: "flex", gap: 28, flexWrap: "wrap", justifyContent: "center", pointerEvents: "auto" }}>
            {[
              { text: ctaPrimText, field: "ctaPrimaryText",   href: ctaPrimHref },
              { text: ctaSecText,  field: "ctaSecondaryText", href: ctaSecHref  },
            ].map(({ text, field, href }) => (
              <a
                key={field}
                href={resolveDemoHref(href, tenantSlug, isAdmin)}
                onClick={isAdmin ? (e) => e.preventDefault() : undefined}
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
                  position: "relative",
                  zIndex: 31,
                  pointerEvents: "auto",
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
    const heroBgTab      = String((content as Record<string,unknown>).__heroBgTab ?? "image");
    const heroBgColor    = String((content as Record<string,unknown>).__heroBgColor ?? "#1a1a1a");
    const heroBgVideoUrl = String((content as Record<string,unknown>).__heroBgVideoUrl ?? "");
    const heroBgFocus       = (content as Record<string,unknown>).__heroBgFocus as { x: number; y: number } | undefined;
    const bgFocusStyle      = heroBgFocus ? `${heroBgFocus.x}% ${heroBgFocus.y}%` : undefined;
    const heroBgFocusMobile = (content as Record<string,unknown>).__heroBgFocusMobile as { x: number; y: number } | undefined;
    const bgFocusMobileStyle = heroBgFocusMobile ? `${heroBgFocusMobile.x}% ${heroBgFocusMobile.y}%` : undefined;
    const bg             = c.backgroundImage ?? "";
    const eyebrow        = String((c as Record<string, unknown>).eyebrow ?? "");
    const ctaSecondaryText = String((c as Record<string, unknown>).ctaSecondaryText ?? "");
    const ctaSecondaryHref = String((c as Record<string, unknown>).ctaSecondaryHref ?? "");

    return (
      <section
        className="relative flex items-end md:items-center justify-start text-white overflow-hidden"
        style={{
          backgroundColor: heroBgTab === "color" ? heroBgColor : "var(--color-bg, #111)",
          minHeight: "clamp(620px, 100dvh, 1000px)",
        }}
        data-template="barber-01"
      >
        {heroBgTab === "color" ? (
          <div style={{ position: "absolute", inset: 0, backgroundColor: heroBgColor }} />
        ) : heroBgTab === "video" && heroBgVideoUrl ? (
          <>
            <video
              src={heroBgVideoUrl}
              autoPlay muted loop playsInline
              style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", zIndex: 0 }}
            />
            <div aria-hidden style={{ position: "absolute", inset: 0, backgroundColor: "rgba(0,0,0,0.55)", zIndex: 1, pointerEvents: "none" }} />
          </>
        ) : bg ? (
          <BackgroundEditableImage sectionId={sectionId} src={bg} overlayColor="transparent" priority={true} isAdmin={isAdmin} focusStyle={bgFocusStyle} focusMobileStyle={bgFocusMobileStyle} />
        ) : (
          <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(135deg, #1a1a1a 0%, #333 100%)" }} />
        )}

        {/* Vignette + gradient overlay — readability + drama */}
        <div aria-hidden style={{
          position: "absolute", inset: 0, zIndex: 1, pointerEvents: "none",
          background: "linear-gradient(180deg, rgba(0,0,0,0.62) 0%, rgba(0,0,0,0.28) 35%, rgba(0,0,0,0.55) 75%, rgba(0,0,0,0.85) 100%)",
        }} />
        <div aria-hidden style={{
          position: "absolute", inset: 0, zIndex: 1, pointerEvents: "none",
          background: "radial-gradient(ellipse at 30% 50%, transparent 35%, rgba(0,0,0,0.55) 100%)",
        }} />

        {/* Decorative gold hairline at top */}
        <div aria-hidden style={{
          position: "absolute", top: 0, left: 0, right: 0, height: 1, zIndex: 2,
          background: "linear-gradient(90deg, transparent 0%, rgba(201,168,76,0.4) 50%, transparent 100%)",
        }} />

        {/* Side label — rotated vertical, gold, na desktopu */}
        <div aria-hidden className="hidden lg:flex" style={{
          position: "absolute", left: 32, top: "50%", zIndex: 3,
          transform: "translateY(-50%) rotate(-90deg)", transformOrigin: "left center",
          fontSize: "10px", fontWeight: 700, letterSpacing: "0.42em", textTransform: "uppercase",
          color: "rgba(201,168,76,0.6)", whiteSpace: "nowrap",
        }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 14 }}>
            <span style={{ width: 36, height: 1, backgroundColor: "rgba(201,168,76,0.5)" }} />
            Est. Brno · Barbershop
          </span>
        </div>

        <div
          className="relative z-10 w-full"
          style={{
            paddingInline: "clamp(20px, 6vw, 96px)",
            paddingBlock: "clamp(140px, 18vh, 200px) clamp(80px, 12vh, 140px)",
            maxWidth: 1400,
            marginInline: "auto",
          }}
        >
          <div style={{ maxWidth: 760 }}>
            {/* Eyebrow with horizontal rule */}
            {eyebrow && (
              <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 28 }}>
                <span aria-hidden style={{ width: 48, height: 1, backgroundColor: "var(--color-accent, #C9A84C)" }} />
                <GenericEditableText
                  sectionId={sectionId}
                  field="eyebrow"
                  value={eyebrow}
                  tag="span"
                  className="hero-eyebrow"
                />
              </div>
            )}

            <h1
              className="whitespace-pre-line"
              style={{
                fontFamily: "var(--font-heading)",
                color: "#F5F5F5",
                fontSize: "clamp(2.8rem, 7.5vw, 6.5rem)",
                fontWeight: 700,
                lineHeight: 0.98,
                letterSpacing: "-0.015em",
                marginBottom: 28,
                textShadow: "0 4px 30px rgba(0,0,0,0.45)",
              }}
            >
              <GenericEditableText sectionId={sectionId} field="title" value={c.title ?? "Váš styl, náš um."} tag="span" />
            </h1>

            <p
              style={{
                color: "rgba(245,245,245,0.82)",
                fontSize: "clamp(1rem, 1.4vw, 1.22rem)",
                lineHeight: 1.55,
                maxWidth: 540,
                marginBottom: 44,
                fontWeight: 300,
              }}
            >
              <GenericEditableText sectionId={sectionId} field="subtitle" value={c.subtitle ?? "Profesionální barber studio."} tag="span" />
            </p>

            {/* CTA group */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 14, alignItems: "center" }}>
              {c.ctaHref && (
                <a
                  href={resolveDemoHref(c.ctaHref, tenantSlug, isAdmin)}
                  data-btn="primary"
                  className="barber-cta-premium"
                  style={{
                    position: "relative",
                    overflow: "hidden",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 10,
                    paddingInline: 32,
                    minHeight: 56,
                    fontSize: "12px",
                    fontWeight: 700,
                    letterSpacing: "0.22em",
                    textTransform: "uppercase",
                    color: "#0a0a0a",
                    backgroundColor: "var(--color-accent, #C9A84C)",
                    border: "1px solid var(--color-accent, #C9A84C)",
                    borderRadius: 2,
                    textDecoration: "none",
                    transition: "transform 0.25s ease, box-shadow 0.25s ease",
                    boxShadow: "0 4px 0 rgba(0,0,0,0.22)",
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow = "0 12px 32px rgba(201,168,76,0.4)";
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform = "none";
                    e.currentTarget.style.boxShadow = "0 4px 0 rgba(0,0,0,0.22)";
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0a0a0a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/>
                    <line x1="20" y1="4" x2="8.12" y2="15.88"/>
                    <line x1="14.47" y1="14.48" x2="20" y2="20"/>
                    <line x1="8.12" y1="8.12" x2="12" y2="12"/>
                  </svg>
                  <GenericEditableText sectionId={sectionId} field="ctaText" value={c.ctaText ?? "Rezervovat termín"} tag="span" />
                  <span aria-hidden className="barber-cta-shimmer" style={{
                    position: "absolute", top: 0, left: "-60%",
                    width: "50%", height: "100%",
                    background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.5) 50%, transparent 100%)",
                    transform: "skewX(-20deg)", pointerEvents: "none",
                  }} />
                </a>
              )}

              {ctaSecondaryText && (
                <a
                  href={resolveDemoHref(ctaSecondaryHref || "#", tenantSlug, isAdmin)}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 10,
                    paddingInline: 28,
                    minHeight: 56,
                    fontSize: "12px",
                    fontWeight: 700,
                    letterSpacing: "0.22em",
                    textTransform: "uppercase",
                    color: "#F5F5F5",
                    border: "1px solid rgba(245,245,245,0.32)",
                    borderRadius: 2,
                    textDecoration: "none",
                    backgroundColor: "transparent",
                    transition: "border-color 0.2s ease, background-color 0.2s ease, color 0.2s ease",
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = "var(--color-accent, #C9A84C)";
                    e.currentTarget.style.color = "var(--color-accent, #C9A84C)";
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = "rgba(245,245,245,0.32)";
                    e.currentTarget.style.color = "#F5F5F5";
                  }}
                >
                  <GenericEditableText sectionId={sectionId} field="ctaSecondaryText" value={ctaSecondaryText} tag="span" />
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                  </svg>
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Scroll indicator — clickable, scrolls to next section */}
        <button
          type="button"
          aria-label="Posunout dolů"
          onClick={() => {
            const target = document.getElementById("sluzby")
              || (document.querySelector("section[data-template='barber-01']:nth-of-type(2)") as HTMLElement | null)
              || ((document.querySelector("section[data-template='barber-01']") as HTMLElement | null)?.nextElementSibling as HTMLElement | null);
            if (target) {
              const top = target.getBoundingClientRect().top + window.scrollY - 60;
              window.scrollTo({ top, behavior: "smooth" });
            } else {
              window.scrollBy({ top: window.innerHeight * 0.9, behavior: "smooth" });
            }
          }}
          className="hidden md:flex hero-scroll-btn"
          style={{
            position: "absolute", bottom: 28, left: "50%", transform: "translateX(-50%)", zIndex: 4,
            flexDirection: "column", alignItems: "center", gap: 10,
            fontSize: "10px", fontWeight: 700, letterSpacing: "0.3em", textTransform: "uppercase",
            color: "rgba(245,245,245,0.7)",
            background: "transparent", border: 0, padding: "8px 12px",
            cursor: "pointer", transition: "color 0.2s ease",
          }}
        >
          <GenericEditableText sectionId={sectionId} field="scrollLabel" value={String((c as Record<string, unknown>).scrollLabel ?? "Scroll")} tag="span" />
          <span aria-hidden className="hero-scroll-line" style={{
            position: "relative",
            width: 1, height: 56, overflow: "hidden",
            backgroundColor: "rgba(201,168,76,0.18)",
          }}>
            <span aria-hidden className="hero-scroll-dot" style={{
              position: "absolute", top: 0, left: -2, width: 5, height: 14,
              backgroundColor: "var(--color-accent, #C9A84C)",
              borderRadius: 2,
            }} />
          </span>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </button>
      </section>
    );
  }

  if (variant === "hero-barber-page") {
    // Slim subpage banner — breadcrumb + page title + decorative line.
    // ~320px height, fixed bg image, dark gradient overlay, gold hairlines.
    const bg = c.backgroundImage ?? "/images/barber-01/hero.webp";
    const breadcrumb = String((c as Record<string, unknown>).breadcrumb ?? "Domů");
    const breadcrumbHref = String((c as Record<string, unknown>).breadcrumbHref ?? "/");
    return (
      <section
        className="relative overflow-hidden"
        style={{ minHeight: "clamp(280px, 42vh, 380px)", backgroundColor: "#0a0a0a" }}
        data-template="barber-01"
      >
        {bg && (
          <div
            aria-hidden
            style={{
              position: "absolute", inset: 0,
              backgroundImage: `url(${bg})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundAttachment: "fixed",
              filter: "grayscale(0.4) brightness(0.55)",
              zIndex: 0,
            }}
          />
        )}
        {/* Gradient overlay */}
        <div aria-hidden style={{
          position: "absolute", inset: 0, zIndex: 1, pointerEvents: "none",
          background: "linear-gradient(180deg, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.5) 50%, rgba(10,10,10,0.92) 100%)",
        }} />
        {/* Top + bottom gold hairlines */}
        <div aria-hidden style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, zIndex: 2, background: "linear-gradient(90deg, transparent, rgba(201,168,76,0.5) 50%, transparent)" }} />
        <div aria-hidden style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 1, zIndex: 2, background: "linear-gradient(90deg, transparent, rgba(201,168,76,0.5) 50%, transparent)" }} />

        <div
          className="relative flex flex-col items-center justify-center text-center"
          style={{
            zIndex: 3,
            minHeight: "clamp(280px, 42vh, 380px)",
            paddingBlock: "120px 48px",
            paddingInline: "clamp(20px, 6vw, 80px)",
          }}
        >
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" style={{
            display: "flex", alignItems: "center", gap: 10,
            fontSize: "10.5px", fontWeight: 700, letterSpacing: "0.28em", textTransform: "uppercase",
            color: "rgba(245,245,245,0.55)",
            marginBottom: 22,
          }}>
            <a href={resolveDemoHref(breadcrumbHref, tenantSlug, isAdmin)} style={{ color: "rgba(245,245,245,0.7)", textDecoration: "none", transition: "color 0.2s" }} onMouseEnter={e => e.currentTarget.style.color = "#C9A84C"} onMouseLeave={e => e.currentTarget.style.color = "rgba(245,245,245,0.7)"}>
              <GenericEditableText sectionId={sectionId} field="breadcrumb" value={breadcrumb} tag="span" />
            </a>
            <span aria-hidden style={{ color: "var(--color-accent, #C9A84C)" }}>/</span>
            <span style={{ color: "var(--color-accent, #C9A84C)" }}>
              <GenericEditableText sectionId={sectionId} field="title" value={c.title ?? "Stránka"} tag="span" />
            </span>
          </nav>

          {/* Page title */}
          <h1
            style={{
              fontFamily: "var(--font-heading)",
              color: "#F5F5F5",
              fontSize: "clamp(2.4rem, 5.5vw, 4rem)",
              fontWeight: 700,
              lineHeight: 1.05,
              letterSpacing: "-0.01em",
              margin: 0,
              textShadow: "0 2px 24px rgba(0,0,0,0.5)",
            }}
          >
            <GenericEditableText sectionId={sectionId} field="title" value={c.title ?? "Stránka"} tag="span" />
          </h1>

          {/* Decorative line + small ornament */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 22 }}>
            <span aria-hidden style={{ width: 32, height: 1, background: "var(--color-accent, #C9A84C)" }} />
            <span aria-hidden style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--color-accent, #C9A84C)" }} />
            <span aria-hidden style={{ width: 32, height: 1, background: "var(--color-accent, #C9A84C)" }} />
          </div>
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
                data-btn="primary"
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
                data-btn="primary"
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
      <>
      <link rel="stylesheet" href="/clones/peak-cut/fonts/fonts.css" />
      <section
        className="relative min-h-dvh flex items-end md:items-center overflow-hidden"
        style={{ backgroundColor: "#111" }}
      >
        {c.backgroundImage && (
          <BackgroundEditableImage sectionId={sectionId} src={c.backgroundImage} overlayColor="rgba(0,0,0,0.6)" priority={true} isAdmin={isAdmin} focusStyle={bgFocusStyle} focusMobileStyle={bgFocusMobileStyle} />
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
              data-btn="primary"
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
      </>
    );
  }

  if (variant === "hero-beauty-01-page") {
    // beauty-01 — slim subpage banner: cream bg, breadcrumb + Fahkwang H1 + sand hairline.
    // NE fullbleed photo (subpages should be calm + content-forward, viz user feedback 2026-06-30).
    const cc = c as Record<string, unknown>;
    const breadcrumb     = String(cc.breadcrumb     ?? "Domů");
    const breadcrumbHref = String(cc.breadcrumbHref ?? "/");
    const title    = String(cc.title    ?? "");
    const subtitle = String(cc.subtitle ?? "");
    const FONT     = "'Fahkwang', Georgia, serif";
    const SANS     = "var(--font-overpass), 'Overpass', Inter, system-ui, sans-serif";
    const MONO     = "var(--font-overpass-mono), 'Overpass Mono', Menlo, monospace";
    const CREAM    = "#FFF8F1";
    const SAND     = "#E0BE9A";
    const INK      = "#1F1F1F";
    const MUTED    = "#5B4D43";
    const resolvedHref = tenantSlug && breadcrumbHref.startsWith("/")
      ? `/demo/${tenantSlug}${isAdmin ? "/admin" : ""}${breadcrumbHref}` : breadcrumbHref;
    return (
      <section
        className="relative w-full overflow-hidden"
        style={{
          backgroundColor: CREAM,
          padding: "clamp(140px, 16vw, 200px) clamp(24px, 5vw, 64px) clamp(56px, 8vw, 88px)",
          borderBottom: "1px solid rgba(224,190,154,0.35)",
        }}
        data-template="beauty-01"
      >
        <div className="mx-auto text-center" style={{ maxWidth: 960 }}>
          <nav aria-label="Drobečková navigace" style={{
            display: "inline-flex", alignItems: "center", gap: 10, marginBottom: 24,
            fontFamily: MONO, fontSize: 11, letterSpacing: "0.24em",
            textTransform: "uppercase", color: MUTED,
          }}>
            <a href={resolvedHref} className="b01-page-bc-link" style={{
              color: MUTED, textDecoration: "none", transition: "color 0.3s ease",
            }}>
              <GenericEditableText sectionId={sectionId} field="breadcrumb" value={breadcrumb} tag="span" />
            </a>
            <span aria-hidden="true" style={{ color: SAND }}>·</span>
            <span style={{ color: INK }}>
              <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
            </span>
          </nav>

          <h1 style={{
            margin: 0,
            fontFamily: FONT, fontWeight: 500,
            fontSize: "clamp(36px, 6vw, 80px)",
            lineHeight: 1.1, letterSpacing: "0.01em",
            color: INK,
          }}>
            <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
          </h1>

          <span aria-hidden="true" style={{
            display: "block", width: 48, height: 1,
            backgroundColor: SAND,
            margin: subtitle ? "28px auto 24px" : "28px auto 0",
          }} />

          {subtitle && (
            <p style={{
              margin: "0 auto",
              fontFamily: SANS, fontWeight: 300,
              fontSize: "clamp(14px, 1.2vw, 17px)",
              color: MUTED, lineHeight: 1.65,
              maxWidth: 540,
            }}>
              <GenericEditableText sectionId={sectionId} field="subtitle" value={subtitle} tag="span" />
            </p>
          )}
        </div>
      </section>
    );
  }

  if (variant === "hero-peak-cut-fullbleed") {
    // peak-cut (aka barber-05) — Brutalist Atelier White hero
    // Full-bleed photo + dark gradient overlay, HUGE Oswald uppercase title centered,
    // dual CTA (filled red + ghost underline), informational ledger row at bottom.
    // ŽÁDNÉ /01 kicker ani EST. badge — per feedback_no_numbered_decorative.
    const OSWALD = "var(--font-oswald), 'Oswald', 'Bebas Neue', Impact, sans-serif";
    const MONO   = "var(--font-overpass-mono), 'Overpass Mono', 'JetBrains Mono', Menlo, monospace";
    const OVERPASS = "var(--font-overpass), 'Overpass', 'Inter', system-ui, sans-serif";
    const RED = "#c41e3a";
    const cc = c as Record<string, unknown>;
    // Hero bg — accept either backgroundImage or slides[0].backgroundImage
    type Slide = { backgroundImage?: string };
    const slides = (cc.slides as Slide[]) ?? [];
    const heroBg = String(cc.backgroundImage ?? slides[0]?.backgroundImage ?? "");
    const title = String(cc.title ?? "Váš styl,\nnaše řemeslo.");
    const subtitle = String(cc.subtitle ?? "");
    const ctaText = String(cc.ctaText ?? "Rezervovat");
    const ctaHref = String(cc.ctaHref ?? "#");
    const secondaryText = String(cc.secondaryText ?? "");
    const secondaryHref = String(cc.secondaryHref ?? "#about");
    type Ledger = { label?: string; value?: string };
    const ledger: Ledger[] = (cc.ledger as Ledger[]) ?? [
      { label: "Adresa",    value: "Krymská 12, Praha 10" },
      { label: "Otevřeno",  value: "Po–So 10—20" },
      { label: "Kontakt",   value: "+420 775 321 654" },
    ];
    return (
      <section
        id="hero"
        className="relative w-full overflow-hidden"
        style={{
          minHeight: "100svh",
          backgroundColor: "#0a0a0a",
        }}
        data-template="peak-cut"
      >
        {heroBg && (
          <BackgroundEditableImage
            sectionId={sectionId}
            src={heroBg}
            overlayColor="rgba(0,0,0,0.45)"
            priority={true}
            isAdmin={isAdmin}
            focusStyle={bgFocusStyle}
            focusMobileStyle={bgFocusMobileStyle}
          />
        )}

        {/* Extra bottom gradient for ledger legibility */}
        <div aria-hidden="true" style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(180deg, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.15) 40%, rgba(0,0,0,0.78) 100%)",
          pointerEvents: "none",
        }} />

        {/* Center content */}
        <div className="relative z-10 mx-auto w-full flex flex-col justify-center"
          style={{
            maxWidth: 1320,
            padding: "clamp(180px, 22vw, 280px) clamp(24px, 5vw, 64px) clamp(180px, 22vw, 240px)",
            minHeight: "100svh",
          }}
        >
          <h1
            className="pc-hero-title"
            style={{
              fontFamily: OSWALD,
              fontWeight: 700,
              fontSize: "clamp(44px, 9.5vw, 120px)",
              lineHeight: 1.22,
              letterSpacing: "0.005em",
              textTransform: "uppercase",
              color: "#ffffff",
              margin: 0,
              maxWidth: "14ch",
              whiteSpace: "pre-line",
              textShadow: "0 2px 28px rgba(0,0,0,0.4)",
            }}
          >
            <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
          </h1>

          {subtitle && (
            <p
              style={{
                marginTop: 28,
                maxWidth: 540,
                fontFamily: OVERPASS,
                fontWeight: 300,
                fontSize: "clamp(15px, 1.4vw, 19px)",
                lineHeight: 1.6,
                color: "rgba(255,255,255,0.82)",
                letterSpacing: "0.01em",
              }}
            >
              <GenericEditableText sectionId={sectionId} field="subtitle" value={subtitle} tag="span" />
            </p>
          )}

          <div className="pc-hero-actions" style={{ marginTop: 44, display: "flex", flexWrap: "wrap", alignItems: "center", gap: 28 }}>
            {ctaText && (
              <a
                href={resolveDemoHref(ctaHref, tenantSlug, isAdmin)}
                className="pc-hero-cta inline-flex items-center justify-center"
                style={{
                  fontFamily: OSWALD,
                  fontSize: 13,
                  fontWeight: 600,
                  letterSpacing: "0.22em",
                  textTransform: "uppercase",
                  padding: "18px 36px",
                  backgroundColor: RED,
                  color: "#ffffff",
                  textDecoration: "none",
                  border: `1px solid ${RED}`,
                  transition: "background-color 0.3s ease, transform 0.3s ease, box-shadow 0.3s ease",
                }}
              >
                <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
                <span aria-hidden="true" className="pc-hero-cta-arrow" style={{ marginLeft: 12, display: "inline-block", transition: "transform 0.3s ease" }}>→</span>
              </a>
            )}

            {secondaryText && (
              <a
                href={resolveDemoHref(secondaryHref, tenantSlug, isAdmin)}
                className="pc-hero-secondary inline-flex items-center gap-3"
                style={{
                  fontFamily: OSWALD,
                  fontSize: 12,
                  fontWeight: 500,
                  letterSpacing: "0.22em",
                  textTransform: "uppercase",
                  color: "#ffffff",
                  textDecoration: "none",
                  paddingBottom: 4,
                  borderBottom: "1px solid rgba(255,255,255,0.4)",
                  transition: "color 0.3s ease, border-color 0.3s ease",
                }}
              >
                <GenericEditableText sectionId={sectionId} field="secondaryText" value={secondaryText} tag="span" />
              </a>
            )}
          </div>
        </div>

        {/* Bottom: informational ledger (NOT decorative — real adresa/hours/contact) */}
        {ledger.length > 0 && (
          <div className="absolute bottom-0 left-0 right-0 z-10"
            style={{
              padding: "0 clamp(24px, 5vw, 64px) clamp(28px, 4vw, 48px)",
            }}
          >
            <div aria-hidden="true" style={{ height: 1, backgroundColor: "rgba(255,255,255,0.22)", marginBottom: 22 }} />
            <div className="pc-hero-ledger" style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              gap: 24,
              maxWidth: 1320,
              margin: "0 auto",
            }}>
              {ledger.map((item, i) => (
                <div key={`pc-led-${i}`} className="pc-hero-ledger-item" style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <span style={{
                    fontFamily: MONO, fontSize: 10, letterSpacing: "0.22em",
                    textTransform: "uppercase", color: "rgba(255,255,255,0.55)",
                  }}>
                    <GenericEditableText sectionId={sectionId} field={`ledger.${i}.label`} value={item.label ?? ""} tag="span" />
                  </span>
                  <span style={{
                    fontFamily: OVERPASS, fontSize: 14, fontWeight: 400,
                    color: "#ffffff", letterSpacing: "0.01em",
                  }}>
                    <GenericEditableText sectionId={sectionId} field={`ledger.${i}.value`} value={item.value ?? ""} tag="span" />
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>
    );
  }

  if (variant === "hero-barber-04-page-title") {
    // Slim banner pro podstránky — industrial dark s breadcrumb + Bebas Neue title.
    const breadcrumbLabel = String((c as Record<string, unknown>).breadcrumb ?? "Domů");
    const breadcrumbHref = String((c as Record<string, unknown>).breadcrumbHref ?? "/");
    return (
      <section
        className="relative overflow-hidden"
        style={{ padding: "clamp(108px, 11vw, 140px) 24px clamp(36px, 4vw, 52px)", backgroundColor: "#0a0806" }}
        data-template="barber-04"
      >
        {/* Bottom gold fade divider — natural section transition */}
        <div aria-hidden style={{
          position: "absolute", bottom: 0, left: "15%", right: "15%", height: 1,
          background: "linear-gradient(90deg, transparent 0%, rgba(213,185,129,.35) 50%, transparent 100%)",
        }} />

        <div className="max-w-[960px] mx-auto text-center relative z-10">
          {/* Breadcrumb — industrial uppercase */}
          <nav aria-label="Drobečková navigace" style={{
            display: "inline-flex", alignItems: "center", gap: 10, marginBottom: 28,
            fontFamily: "'Lato',Helvetica,Arial,sans-serif",
            fontSize: 11, fontWeight: 600, letterSpacing: "0.24em", textTransform: "uppercase",
          }}>
            <a
              href={resolveDemoHref(breadcrumbHref, tenantSlug, isAdmin)}
              className="b04-topbar-link"
              style={{ color: "#d5b981", textDecoration: "none" }}
            >
              <GenericEditableText sectionId={sectionId} field="breadcrumb" value={breadcrumbLabel} tag="span" />
            </a>
            <span aria-hidden style={{ color: "rgba(255,255,255,.32)" }}>/</span>
            <span style={{ color: "rgba(255,255,255,.58)" }}>
              <GenericEditableText sectionId={sectionId} field="title" value={String(c.title ?? "")} tag="span" />
            </span>
          </nav>

          <h1
            className="uppercase"
            style={{
              fontFamily: "'Bebas Neue','Oswald',Impact,sans-serif",
              fontWeight: 400,
              fontSize: "clamp(40px, 5.5vw, 80px)",
              letterSpacing: "0.03em",
              color: "#ffffff",
              lineHeight: 1.05,
              margin: "0 auto 24px",
            }}
          >
            <GenericEditableText sectionId={sectionId} field="title" value={String(c.title ?? "")} tag="span" />
          </h1>

          {/* Gold fade signature line */}
          <div
            aria-hidden
            style={{
              width: 180, height: 1,
              margin: "0 auto",
              background: "linear-gradient(90deg, transparent 0%, rgba(213,185,129,.85) 50%, transparent 100%)",
            }}
          />

          {c.subtitle && (
            <p
              className="uppercase"
              style={{
                fontFamily: "'Lato',Helvetica,Arial,sans-serif",
                fontWeight: 500,
                fontSize: "clamp(12px, 1vw, 14px)",
                letterSpacing: "0.18em",
                color: "rgba(255,255,255,0.66)",
                maxWidth: 640,
                margin: "28px auto 0",
                lineHeight: 1.75,
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
    const rawSlides = (c as unknown as { slides?: Slide[] }).slides ?? [];
    // Fallback: pokud slides chybí (migrace z hero-full-bleed), použij backgroundImage nebo prázdný placeholder
    const slides: Slide[] = rawSlides.length > 0 ? rawSlides : [
      { title: String(c.title ?? "Váš styl, naše vášeň"), subtitle: String(c.subtitle ?? ""), backgroundImage: String(c.backgroundImage ?? "") || undefined },
      { title: "", subtitle: "", backgroundImage: undefined },
    ];
    const interval = Number((c as unknown as { autoPlayInterval?: number }).autoPlayInterval ?? 6000);
    const ctaText = String(c.ctaText ?? "vytvořit rezervaci");
    const ctaHref = String(c.ctaHref ?? "#rezervace");
    const heroEyebrow = String((c as Record<string, unknown>).heroEyebrow ?? "ESTD. 2014 · BRNO");
    return (
      <HeroBarber04Slider
        slides={slides}
        interval={interval}
        ctaText={ctaText}
        ctaHref={resolveDemoHref(ctaHref, tenantSlug, isAdmin)}
        sectionId={sectionId}
        heroEyebrow={heroEyebrow}
      />
    );
  }

  if (variant === "hero-barber-luxury") {
    const hoursLines = (c.hoursLines as Array<{ label: string; value: string }>) ?? [];
    const address = String(c.address ?? "");
    const eyebrow = String((c as Record<string, unknown>).eyebrow ?? "");
    const showScroll = c.scrollIndicator !== false;
    return (
      <section
        className="relative flex items-center justify-center overflow-hidden"
        style={{ minHeight: "100vh", backgroundColor: "#0d0d0d" }}
        data-template="barber-02"
      >
        {/* Fallback dark backdrop */}
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{ backgroundColor: "#1a1410", zIndex: 0 }}
        />
        {c.backgroundImage && (
          <BackgroundEditableImage
            sectionId={sectionId}
            src={c.backgroundImage}
            overlayColor="transparent"
            priority={true}
            isAdmin={isAdmin}
            focusStyle={bgFocusStyle}
            focusMobileStyle={bgFocusMobileStyle}
          />
        )}
        {/* Vertical gradient overlay — top dark for nav contrast + bottom dark for content */}
        <div
          aria-hidden
          className="absolute inset-0 z-[1] pointer-events-none"
          style={{
            background:
              "linear-gradient(to bottom, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.32) 30%, rgba(0,0,0,0.45) 65%, rgba(0,0,0,0.78) 100%)",
          }}
        />
        {/* Radial vignette for centered focus */}
        <div
          aria-hidden
          className="absolute inset-0 z-[1] pointer-events-none"
          style={{
            background: "radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.45) 100%)",
          }}
        />

        {/* Top & bottom hairlines — warm gold accents */}
        <div aria-hidden style={{
          position: "absolute", top: 0, left: "8%", right: "8%", height: 1, zIndex: 2,
          background: "linear-gradient(90deg, transparent, rgba(212,169,110,0.5) 50%, transparent)",
        }} />
        <div aria-hidden style={{
          position: "absolute", bottom: 0, left: "8%", right: "8%", height: 1, zIndex: 2,
          background: "linear-gradient(90deg, transparent, rgba(212,169,110,0.45) 50%, transparent)",
        }} />

        <div className="relative z-10 text-center text-white px-6" style={{ maxWidth: 880, paddingBlock: "180px 80px" }}>
          {/* Eyebrow — italic serif kicker */}
          {eyebrow && (
            <div className="b02-hero-eyebrow" style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 14,
              marginBottom: 28,
              opacity: 0,
              animation: "b02HeroFade 0.9s cubic-bezier(.22,.68,0,1.1) 0.1s forwards",
            }}>
              <span aria-hidden style={{ width: 42, height: 1, backgroundColor: "#d4a96e" }} />
              <span style={{
                fontFamily: "'Libre Baskerville', Georgia, serif",
                fontStyle: "italic",
                fontSize: "13px",
                fontWeight: 400,
                letterSpacing: "0.22em",
                textTransform: "uppercase",
                color: "#d4a96e",
              }}>
                <GenericEditableText sectionId={sectionId} field="eyebrow" value={eyebrow} tag="span" />
              </span>
              <span aria-hidden style={{ width: 42, height: 1, backgroundColor: "#d4a96e" }} />
            </div>
          )}

          {/* H1 — large Libre Baskerville uppercase, fade-in */}
          <h1
            className="b02-hero-title"
            style={{
              fontFamily: "'Libre Baskerville', Georgia, serif",
              fontWeight: 400,
              fontSize: "clamp(2.8rem, 7.5vw, 6.2rem)",
              lineHeight: 1.05,
              letterSpacing: "0.16em",
              color: "#fff",
              textTransform: "uppercase",
              margin: "0 0 24px",
              textShadow: "0 2px 28px rgba(0,0,0,0.5)",
              opacity: 0,
              animation: "b02HeroFade 1s cubic-bezier(.22,.68,0,1.1) 0.25s forwards",
            }}
          >
            <GenericEditableText sectionId={sectionId} field="title" value={c.title ?? "ATELIER"} tag="span" />
          </h1>

          {/* Decorative gold dot + lines under H1 */}
          <div aria-hidden className="b02-hero-rule" style={{
            display: "inline-flex", alignItems: "center", gap: 14,
            marginBottom: 36,
            opacity: 0,
            animation: "b02HeroFade 0.9s cubic-bezier(.22,.68,0,1.1) 0.45s forwards",
          }}>
            <span style={{ width: 56, height: 1, backgroundColor: "rgba(212,169,110,0.6)" }} />
            <span style={{ width: 5, height: 5, borderRadius: "50%", backgroundColor: "#d4a96e" }} />
            <span style={{ width: 56, height: 1, backgroundColor: "rgba(212,169,110,0.6)" }} />
          </div>

          {/* Subtitle */}
          {c.subtitle && (
            <p
              className="b02-hero-subtitle"
              style={{
                fontFamily: "'Source Sans Pro', system-ui, sans-serif",
                fontWeight: 300,
                fontSize: "clamp(1rem, 1.6vw, 1.25rem)",
                lineHeight: 1.7,
                letterSpacing: "0.04em",
                color: "rgba(255,255,255,0.88)",
                margin: "0 auto 44px",
                maxWidth: 620,
                opacity: 0,
                animation: "b02HeroFade 0.9s cubic-bezier(.22,.68,0,1.1) 0.6s forwards",
              }}
            >
              <GenericEditableText sectionId={sectionId} field="subtitle" value={c.subtitle} tag="span" />
            </p>
          )}

          {/* CTA — editorial pill, fills gold on hover */}
          {c.ctaHref && (
            <a
              href={resolveDemoHref(c.ctaHref, tenantSlug, isAdmin)}
              data-btn="primary"
              className="b02-hero-cta inline-flex items-center justify-center uppercase no-underline"
              style={{
                gap: 10,
                border: "1.5px solid rgba(255,255,255,0.85)",
                color: "#fff",
                fontFamily: "'Source Sans Pro', system-ui, sans-serif",
                fontWeight: 600,
                fontSize: 12,
                letterSpacing: "0.24em",
                paddingInline: 38,
                paddingBlock: 16,
                borderRadius: 50,
                backgroundColor: "transparent",
                transition: "background 0.45s cubic-bezier(.4,0,.2,1), border-color 0.45s cubic-bezier(.4,0,.2,1), color 0.4s ease, box-shadow 0.45s ease, transform 0.4s ease",
                opacity: 0,
                animation: "b02HeroFade 0.9s cubic-bezier(.22,.68,0,1.1) 0.75s forwards",
              }}
            >
              <GenericEditableText sectionId={sectionId} field="ctaText" value={c.ctaText ?? "Rezervovat"} tag="span" />
              <span aria-hidden style={{
                display: "inline-flex",
                transition: "transform 0.4s cubic-bezier(.22,.68,0,1.1)",
              }} className="b02-hero-cta-arrow">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                </svg>
              </span>
            </a>
          )}

          {/* Hours + address — refined info row */}
          {(hoursLines.length > 0 || address) && (
            <div className="b02-hero-info" style={{
              marginTop: 64,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 36,
              flexWrap: "wrap",
              opacity: 0,
              animation: "b02HeroFade 1s cubic-bezier(.22,.68,0,1.1) 0.95s forwards",
            }}>
              {hoursLines.length > 0 && (
                <div style={{ textAlign: "center" }}>
                  <p style={{
                    fontFamily: "'Source Sans Pro', system-ui, sans-serif",
                    fontSize: 10,
                    fontWeight: 700,
                    letterSpacing: "0.28em",
                    textTransform: "uppercase",
                    color: "#d4a96e",
                    margin: "0 0 10px",
                  }}><GenericEditableText sectionId={sectionId} field="hoursLabel" value={String((c as Record<string, unknown>).hoursLabel ?? "Otevírací doba")} tag="span" /></p>
                  <div style={{
                    fontFamily: "'Libre Baskerville', Georgia, serif",
                    fontSize: "0.92rem",
                    lineHeight: 1.7,
                    color: "rgba(255,255,255,0.88)",
                  }}>
                    {hoursLines.map((h, i) => (
                      <p key={i} style={{ margin: "2px 0" }}>
                        <span style={{ fontStyle: "italic", marginRight: 10 }}>
                          <GenericEditableText sectionId={sectionId} field={`hoursLines.${i}.label`} value={h.label} tag="span" />
                        </span>
                        <GenericEditableText sectionId={sectionId} field={`hoursLines.${i}.value`} value={h.value} tag="span" />
                      </p>
                    ))}
                  </div>
                </div>
              )}
              {hoursLines.length > 0 && address && (
                <span aria-hidden className="hidden md:inline-block" style={{
                  width: 1, height: 56, backgroundColor: "rgba(212,169,110,0.45)",
                }} />
              )}
              {address && (
                <div style={{ textAlign: "center" }}>
                  <p style={{
                    fontFamily: "'Source Sans Pro', system-ui, sans-serif",
                    fontSize: 10,
                    fontWeight: 700,
                    letterSpacing: "0.28em",
                    textTransform: "uppercase",
                    color: "#d4a96e",
                    margin: "0 0 10px",
                  }}><GenericEditableText sectionId={sectionId} field="addressLabel" value={String((c as Record<string, unknown>).addressLabel ?? "Najdete nás")} tag="span" /></p>
                  <p style={{
                    fontFamily: "'Libre Baskerville', Georgia, serif",
                    fontSize: "0.92rem",
                    lineHeight: 1.7,
                    color: "rgba(255,255,255,0.88)",
                    margin: 0,
                  }}>
                    <GenericEditableText sectionId={sectionId} field="address" value={address} tag="span" />
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Scroll indicator — clickable, smoothly scrolls to next section */}
        {showScroll && (
          <button
            type="button"
            aria-label="Posunout dolů"
            className="b02-hero-scroll hidden md:flex"
            onClick={() => {
              const section = document.querySelectorAll("section")[0];
              const next = section?.nextElementSibling as HTMLElement | null;
              if (next) {
                const top = next.getBoundingClientRect().top + window.scrollY - 60;
                window.scrollTo({ top, behavior: "smooth" });
              } else {
                window.scrollBy({ top: window.innerHeight * 0.9, behavior: "smooth" });
              }
            }}
            style={{
              position: "absolute", bottom: 32, left: "50%", transform: "translateX(-50%)", zIndex: 4,
              flexDirection: "column", alignItems: "center", gap: 12,
              background: "transparent", border: 0, cursor: "pointer",
              padding: "8px 12px",
              fontFamily: "'Libre Baskerville', Georgia, serif",
              fontSize: 10,
              fontStyle: "italic",
              letterSpacing: "0.32em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.7)",
              opacity: 0,
              animation: "b02HeroFade 1.2s cubic-bezier(.22,.68,0,1.1) 1.1s forwards",
              transition: "color 0.3s ease",
            }}
          >
            <GenericEditableText sectionId={sectionId} field="scrollLabel" value={String((c as Record<string, unknown>).scrollLabel ?? "Scroll")} tag="span" />
            <span aria-hidden style={{
              position: "relative",
              width: 3, height: 68, overflow: "hidden",
              backgroundColor: "rgba(212,169,110,0.22)",
              borderRadius: 2,
            }}>
              <span aria-hidden className="b02-hero-scroll-dot" style={{
                position: "absolute", top: 0, left: 0, width: 3, height: 22,
                backgroundColor: "#d4a96e",
                borderRadius: 2,
              }} />
            </span>
          </button>
        )}
      </section>
    );
  }

  if (variant === "hero-barber-titleonly") {
    const eyebrow = String((c as Record<string, unknown>).eyebrow ?? "");
    const ctaSecondaryText = String((c as Record<string, unknown>).ctaSecondaryText ?? "");
    const ctaSecondaryHref = String((c as Record<string, unknown>).ctaSecondaryHref ?? "");
    const showScroll = c.scrollIndicator !== false;
    return (
      <section
        className="relative flex items-center justify-center overflow-hidden"
        style={{ minHeight: "100vh", backgroundColor: "#1c1410" }}
        data-template="barber-03"
      >
        {/* Fallback dark warm backdrop */}
        <div aria-hidden className="absolute inset-0 pointer-events-none" style={{ backgroundColor: "#1c1410", zIndex: 0 }} />
        {c.backgroundImage && (
          <BackgroundEditableImage sectionId={sectionId} src={c.backgroundImage} overlayColor="transparent" priority={true} isAdmin={isAdmin} focusStyle={bgFocusStyle} focusMobileStyle={bgFocusMobileStyle} />
        )}
        {/* Vertical gradient — cinematic depth */}
        <div
          aria-hidden
          className="absolute inset-0 z-[1] pointer-events-none"
          style={{
            background: "linear-gradient(180deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.28) 35%, rgba(28,20,16,0.55) 70%, rgba(28,20,16,0.92) 100%)",
          }}
        />
        {/* Warm golden ambient glow — top + bottom hot spots */}
        <div
          aria-hidden
          className="absolute inset-0 z-[1] pointer-events-none"
          style={{
            background: "radial-gradient(ellipse at 50% 30%, rgba(200,169,110,0.12) 0%, transparent 50%), radial-gradient(ellipse at 50% 90%, rgba(28,20,16,0.6) 0%, transparent 60%)",
          }}
        />
        {/* Top + bottom gold hairlines for cinematic framing */}
        <div aria-hidden style={{
          position: "absolute", top: 0, left: "10%", right: "10%", height: 1, zIndex: 2,
          background: "linear-gradient(90deg, transparent, rgba(200,169,110,0.45) 50%, transparent)",
        }} />
        <div aria-hidden style={{
          position: "absolute", bottom: 0, left: "10%", right: "10%", height: 1, zIndex: 2,
          background: "linear-gradient(90deg, transparent, rgba(200,169,110,0.4) 50%, transparent)",
        }} />

        <div className="relative z-10 text-center text-white px-6" style={{ maxWidth: 1100, paddingBlock: "180px 100px" }}>
          {/* Eyebrow — italic serif kicker with double gold hairlines */}
          {eyebrow && (
            <div className="b03-hero-eyebrow" style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 14,
              marginBottom: 32,
              opacity: 0,
              animation: "b03HeroFade 0.85s cubic-bezier(.22,.68,0,1.1) 0.1s forwards",
            }}>
              <span aria-hidden style={{ width: 48, height: 1, backgroundColor: "#c8a96e" }} />
              <span style={{
                fontFamily: "'Libre Baskerville', Georgia, serif",
                fontStyle: "italic",
                fontSize: "13px",
                fontWeight: 400,
                letterSpacing: "0.28em",
                textTransform: "uppercase",
                color: "#c8a96e",
              }}>
                <GenericEditableText sectionId={sectionId} field="eyebrow" value={eyebrow} tag="span" />
              </span>
              <span aria-hidden style={{ width: 48, height: 1, backgroundColor: "#c8a96e" }} />
            </div>
          )}

          {/* H1 — large Libre Baskerville uppercase with deep shadow */}
          <h1
            className="b03-hero-title"
            style={{
              fontFamily: "'Libre Baskerville', Georgia, serif",
              fontWeight: 700,
              fontSize: "clamp(2.6rem, 6vw, 5.4rem)",
              lineHeight: 1.06,
              letterSpacing: "0.04em",
              color: "#f5efe6",
              textTransform: "uppercase",
              margin: "0 0 30px",
              textShadow: "0 4px 30px rgba(0,0,0,0.55)",
              opacity: 0,
              animation: "b03HeroFade 1s cubic-bezier(.22,.68,0,1.1) 0.25s forwards",
            }}
          >
            <GenericEditableText sectionId={sectionId} field="title" value={c.title ?? ""} tag="span" />
          </h1>

          {/* Decorative rule under H1 — gold trio with central dot */}
          <div aria-hidden className="b03-hero-rule" style={{
            display: "inline-flex", alignItems: "center", gap: 16,
            marginBottom: c.subtitle ? 36 : 48,
            opacity: 0,
            animation: "b03HeroFade 0.85s cubic-bezier(.22,.68,0,1.1) 0.45s forwards",
          }}>
            <span style={{ width: 56, height: 1, backgroundColor: "#c8a96e" }} />
            <span style={{ width: 6, height: 6, backgroundColor: "#c8a96e", transform: "rotate(45deg)" }} />
            <span style={{ width: 56, height: 1, backgroundColor: "#c8a96e" }} />
          </div>

          {/* Subtitle — optional, italic serif */}
          {c.subtitle && (
            <p
              className="b03-hero-subtitle"
              style={{
                fontFamily: "'Libre Baskerville', Georgia, serif",
                fontStyle: "italic",
                fontWeight: 400,
                fontSize: "clamp(1rem, 1.6vw, 1.28rem)",
                lineHeight: 1.7,
                letterSpacing: "0.02em",
                color: "rgba(245,239,230,0.88)",
                margin: "0 auto 48px",
                maxWidth: 640,
                opacity: 0,
                animation: "b03HeroFade 0.9s cubic-bezier(.22,.68,0,1.1) 0.6s forwards",
              }}
            >
              <GenericEditableText sectionId={sectionId} field="subtitle" value={c.subtitle} tag="span" />
            </p>
          )}

          {/* Dual CTA — cinematic urban: primary gold-fill + secondary outline */}
          {(c.ctaHref || ctaSecondaryHref) && (
            <div className="b03-hero-cta-group" style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 16,
              justifyContent: "center",
              opacity: 0,
              animation: "b03HeroFade 0.9s cubic-bezier(.22,.68,0,1.1) 0.78s forwards",
            }}>
              {c.ctaHref && (
                <a
                  href={resolveDemoHref(c.ctaHref, tenantSlug, isAdmin)}
                  data-btn="primary"
                  className="b03-hero-cta-primary inline-flex items-center justify-center uppercase no-underline"
                  style={{
                    gap: 10,
                    backgroundColor: "#c8a96e",
                    border: "1px solid #c8a96e",
                    color: "#1c1410",
                    fontFamily: "'Source Sans Pro', system-ui, sans-serif",
                    fontWeight: 700,
                    fontSize: 12,
                    letterSpacing: "0.26em",
                    paddingInline: 38,
                    paddingBlock: 17,
                    transition: "background 0.4s cubic-bezier(.4,0,.2,1), border-color 0.4s ease, color 0.4s ease, box-shadow 0.4s ease, transform 0.4s ease",
                    boxShadow: "0 6px 24px rgba(200,169,110,0.32)",
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/>
                    <line x1="20" y1="4" x2="8.12" y2="15.88"/>
                    <line x1="14.47" y1="14.48" x2="20" y2="20"/>
                    <line x1="8.12" y1="8.12" x2="12" y2="12"/>
                  </svg>
                  <GenericEditableText sectionId={sectionId} field="ctaText" value={c.ctaText ?? "Rezervovat"} tag="span" />
                  <span aria-hidden className="b03-hero-cta-arrow" style={{
                    display: "inline-flex",
                    transition: "transform 0.4s cubic-bezier(.22,.68,0,1.1)",
                  }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                    </svg>
                  </span>
                </a>
              )}
              {ctaSecondaryText && (
                <a
                  href={resolveDemoHref(ctaSecondaryHref || "#", tenantSlug, isAdmin)}
                  className="b03-hero-cta-secondary inline-flex items-center justify-center uppercase no-underline"
                  style={{
                    gap: 10,
                    border: "1px solid rgba(245,239,230,0.4)",
                    color: "#f5efe6",
                    fontFamily: "'Source Sans Pro', system-ui, sans-serif",
                    fontWeight: 600,
                    fontSize: 12,
                    letterSpacing: "0.26em",
                    paddingInline: 34,
                    paddingBlock: 17,
                    backgroundColor: "transparent",
                    transition: "background 0.4s ease, border-color 0.4s ease, color 0.4s ease, transform 0.4s ease",
                  }}
                >
                  <GenericEditableText sectionId={sectionId} field="ctaSecondaryText" value={ctaSecondaryText} tag="span" />
                </a>
              )}
            </div>
          )}
        </div>

        {/* Scroll indicator — clickable, gold dot drops cinematically */}
        {showScroll && (
          <button
            type="button"
            aria-label="Posunout dolů"
            className="b03-hero-scroll hidden md:flex"
            onClick={() => {
              const section = document.querySelectorAll("section")[0];
              const next = section?.nextElementSibling as HTMLElement | null;
              if (next) {
                const top = next.getBoundingClientRect().top + window.scrollY - 60;
                window.scrollTo({ top, behavior: "smooth" });
              } else {
                window.scrollBy({ top: window.innerHeight * 0.9, behavior: "smooth" });
              }
            }}
            style={{
              position: "absolute", bottom: 34, left: "50%", transform: "translateX(-50%)", zIndex: 4,
              flexDirection: "column", alignItems: "center", gap: 12,
              background: "transparent", border: 0, cursor: "pointer",
              padding: "8px 12px",
              fontFamily: "'Source Sans Pro', system-ui, sans-serif",
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: "0.34em",
              textTransform: "uppercase",
              color: "rgba(245,239,230,0.65)",
              opacity: 0,
              animation: "b03HeroFade 1.1s cubic-bezier(.22,.68,0,1.1) 1s forwards",
              transition: "color 0.3s ease",
            }}
          >
            <GenericEditableText sectionId={sectionId} field="scrollLabel" value={String((c as Record<string, unknown>).scrollLabel ?? "Scroll")} tag="span" />
            <span aria-hidden style={{
              position: "relative",
              width: 3, height: 68, overflow: "hidden",
              backgroundColor: "rgba(200,169,110,0.22)",
              borderRadius: 2,
            }}>
              <span aria-hidden className="b03-hero-scroll-dot" style={{
                position: "absolute", top: 0, left: 0, width: 3, height: 22,
                backgroundColor: "#c8a96e",
                borderRadius: 2,
              }} />
            </span>
          </button>
        )}
      </section>
    );
  }

  if (variant === "hero-barber-03-page") {
    // Slim subpage banner pro barber-03 — breadcrumb + uppercase Libre Baskerville H1 + diamond rule
    const bg = c.backgroundImage ?? "";
    const breadcrumb = String((c as Record<string, unknown>).breadcrumb ?? "Domů");
    const breadcrumbHref = String((c as Record<string, unknown>).breadcrumbHref ?? "/");
    return (
      <section
        className="relative overflow-hidden"
        style={{ minHeight: "clamp(300px, 44vh, 400px)", backgroundColor: "#1c1410" }}
        data-template="barber-03"
      >
        {bg && (
          <div
            aria-hidden
            style={{
              position: "absolute", inset: 0,
              backgroundImage: `url(${bg})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundAttachment: "fixed",
              filter: "grayscale(0.5) brightness(0.55) sepia(0.18)",
              zIndex: 0,
            }}
          />
        )}
        {/* Dark warm gradient overlay */}
        <div aria-hidden style={{
          position: "absolute", inset: 0, zIndex: 1, pointerEvents: "none",
          background: "linear-gradient(180deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.45) 50%, rgba(28,20,16,0.9) 100%)",
        }} />
        {/* Warm golden ambient glow */}
        <div aria-hidden style={{
          position: "absolute", inset: 0, zIndex: 1, pointerEvents: "none",
          background: "radial-gradient(ellipse at 50% 40%, rgba(200,169,110,0.1) 0%, transparent 55%)",
        }} />
        {/* Dual gold hairlines top/bottom (consistent s ostatními b03 sekcemi) */}
        <div aria-hidden style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, zIndex: 2, background: "linear-gradient(90deg, transparent, rgba(200,169,110,0.5) 50%, transparent)" }} />
        <div aria-hidden style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 1, zIndex: 2, background: "linear-gradient(90deg, transparent, rgba(200,169,110,0.5) 50%, transparent)" }} />

        <div
          className="relative flex flex-col items-center justify-center text-center"
          style={{
            zIndex: 3,
            minHeight: "clamp(300px, 44vh, 400px)",
            paddingBlock: "130px 56px",
            paddingInline: "clamp(20px, 6vw, 80px)",
          }}
        >
          {/* Breadcrumb — Source Sans masculine uppercase */}
          <nav aria-label="Breadcrumb" style={{
            display: "flex", alignItems: "center", gap: 12,
            fontFamily: "'Source Sans Pro', system-ui, sans-serif",
            fontSize: "10.5px", fontWeight: 700, letterSpacing: "0.32em", textTransform: "uppercase",
            color: "rgba(245,239,230,0.55)",
            marginBottom: 24,
          }}>
            <a
              href={resolveDemoHref(breadcrumbHref, tenantSlug, isAdmin)}
              style={{ color: "rgba(245,239,230,0.7)", textDecoration: "none", transition: "color 0.3s ease" }}
              onMouseEnter={e => { e.currentTarget.style.color = "#c8a96e"; }}
              onMouseLeave={e => { e.currentTarget.style.color = "rgba(245,239,230,0.7)"; }}
            >
              <GenericEditableText sectionId={sectionId} field="breadcrumb" value={breadcrumb} tag="span" />
            </a>
            <span aria-hidden style={{ color: "#c8a96e" }}>/</span>
            <span style={{ color: "#c8a96e" }}>
              <GenericEditableText sectionId={sectionId} field="title" value={c.title ?? "Stránka"} tag="span" />
            </span>
          </nav>

          {/* Page title — Libre Baskerville uppercase warm cream */}
          <h1
            style={{
              fontFamily: "'Libre Baskerville', Georgia, serif",
              color: "#f5efe6",
              fontSize: "clamp(2.4rem, 5.5vw, 4rem)",
              fontWeight: 700,
              lineHeight: 1.06,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              margin: 0,
              textShadow: "0 4px 28px rgba(0,0,0,0.55)",
            }}
          >
            <GenericEditableText sectionId={sectionId} field="title" value={c.title ?? "Stránka"} tag="span" />
          </h1>

          {/* Diamond rule pod H1 (consistent s b03 motivem) */}
          <div aria-hidden style={{ display: "inline-flex", alignItems: "center", gap: 14, marginTop: 22 }}>
            <span style={{ width: 48, height: 1, backgroundColor: "#c8a96e" }} />
            <span style={{ width: 6, height: 6, backgroundColor: "#c8a96e", transform: "rotate(45deg)" }} />
            <span style={{ width: 48, height: 1, backgroundColor: "#c8a96e" }} />
          </div>
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
              data-btn="primary"
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
    // beauty-01 — Sand-Cream Editorial Wellness fullbleed hero
    // Cream paper + bg photo with light overlay, Fahkwang display title + sand italic accent,
    // dual CTA (filled sand + ghost link), bottom info ledger row (ADRESA / OTEVŘENO / KONTAKT).
    // Žádné /01 markery ani EST. badges (per feedback_no_numbered_decorative).
    const cc = content as Record<string, unknown>;
    const bg       = String(cc.backgroundImage ?? "");
    const tag      = String(cc.tag       ?? "Wellness atelier · Vinohrady, Praha");
    const titleH1  = String(cc.titleH1   ?? "Péče jako rituál,");
    const titleIta = String(cc.titleItalic ?? "ne jako služba.");
    const sub      = String(cc.subtitle  ?? "Holičství, manikúra a péče o pleť pod jednou střechou — pro klienty, kteří hledají preciznost a klid.");
    const cta      = String(cc.ctaText   ?? "Rezervovat termín");
    const href     = String(cc.ctaHref   ?? "/rezervace");
    const secText  = String(cc.secondaryText ?? "Naše služby");
    const secHref  = String(cc.secondaryHref ?? "/cenik");
    type Ledger = { label?: string; value?: string };
    const ledger: Ledger[] = (cc.ledger as Ledger[]) ?? [
      { label: "Adresa",    value: "Mánesova 14, Praha 2" },
      { label: "Otevřeno",  value: "Po–Pá 9—20  ·  So 9—15" },
      { label: "Kontakt",   value: "+420 775 321 654" },
    ];
    const FONT    = "'Fahkwang', Georgia, serif";
    const SANS    = "var(--font-overpass), 'Overpass', Inter, system-ui, sans-serif";
    const MONO    = "var(--font-overpass-mono), 'Overpass Mono', Menlo, monospace";
    const SAND    = "#E0BE9A";
    const PAPER   = "#FFF8F1";
    const INK     = "#1F1F1F";
    const resolvedSecHref = tenantSlug && secHref.startsWith("/")
      ? `/demo/${tenantSlug}${isAdmin ? "/admin" : ""}${secHref}` : secHref;
    return (
      <section
        id="hero"
        className="relative w-full overflow-hidden"
        style={{
          minHeight: "100svh",
          backgroundColor: PAPER,
        }}
        data-template="beauty-01"
      >
        {/* Bg foto */}
        {bg && (
          <GenericEditableImage sectionId={sectionId} field="backgroundImage" src={bg} alt="" className="absolute inset-0 z-0" style={{ position: "absolute" }} priority>
            <Image src={bg} alt="" fill className="object-cover object-center" sizes="100vw" priority unoptimized={shouldSkipNextImageOptimization(bg)} />
          </GenericEditableImage>
        )}

        {/* Light gradient overlay — bottom heavier for ledger legibility, top airy */}
        <div aria-hidden className="absolute inset-0 z-[1] pointer-events-none" style={{
          background: "linear-gradient(180deg, rgba(0,0,0,0.18) 0%, rgba(0,0,0,0.12) 40%, rgba(0,0,0,0.65) 100%)",
        }} />

        {/* Center content cluster */}
        <div className="relative z-[2] mx-auto w-full flex flex-col items-center text-center justify-center"
          style={{
            maxWidth: 1100,
            padding: "clamp(180px, 22vw, 280px) clamp(24px, 5vw, 64px) clamp(160px, 18vw, 220px)",
            minHeight: "100svh",
          }}
        >
          {/* Tag — Fahkwang uppercase wide */}
          <p style={{
            fontFamily: FONT, fontSize: 12, fontWeight: 400,
            color: "rgba(255,255,255,0.85)", letterSpacing: "0.30em",
            textTransform: "uppercase",
            marginBottom: 36,
          }}>
            <GenericEditableText sectionId={sectionId} field="tag" value={tag} tag="span" />
          </p>

          {/* Title — Fahkwang display + italic accent line below */}
          <h1 style={{
            fontFamily: FONT,
            fontSize: "clamp(40px, 8vw, 96px)",
            fontWeight: 500,
            color: "#ffffff",
            lineHeight: 1.05,
            margin: 0,
            letterSpacing: "0.01em",
            textShadow: "0 2px 24px rgba(0,0,0,0.3)",
          }}>
            <GenericEditableText sectionId={sectionId} field="titleH1" value={titleH1} tag="span" />
          </h1>

          {/* Italic line in sand color */}
          <p style={{
            fontFamily: FONT, fontStyle: "italic",
            fontSize: "clamp(32px, 6vw, 80px)",
            fontWeight: 400,
            color: SAND,
            lineHeight: 1.1,
            margin: "10px 0 0",
            letterSpacing: "0.01em",
            textShadow: "0 2px 18px rgba(0,0,0,0.25)",
          }}>
            <GenericEditableText sectionId={sectionId} field="titleItalic" value={titleIta} tag="span" />
          </p>

          {/* Subtle hairline divider (organic feel) */}
          <span aria-hidden="true" style={{
            display: "block",
            width: 64, height: 1,
            backgroundColor: "rgba(224,190,154,0.6)",
            margin: "36px auto 28px",
          }} />

          {/* Subtitle */}
          <p style={{
            fontFamily: SANS, fontWeight: 300,
            fontSize: "clamp(15px, 1.4vw, 18px)",
            color: "rgba(255,255,255,0.86)",
            lineHeight: 1.6,
            maxWidth: 540,
            margin: 0,
          }}>
            <GenericEditableText sectionId={sectionId} field="subtitle" value={sub} tag="span" />
          </p>

          {/* CTA cluster */}
          <div className="b01-hero-actions" style={{
            marginTop: 40,
            display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "center",
            gap: 28,
          }}>
            {cta && (
              <a
                href={tenantSlug && href.startsWith("/") ? `/demo/${tenantSlug}${isAdmin ? "/admin" : ""}${href}` : href}
                className="b01-hero-cta inline-flex items-center justify-center"
                style={{
                  fontFamily: FONT, fontSize: 13, fontWeight: 500,
                  letterSpacing: "0.22em", textTransform: "uppercase",
                  padding: "18px 36px",
                  backgroundColor: SAND, color: INK,
                  textDecoration: "none",
                  border: `1px solid ${SAND}`,
                  transition: "background-color 0.3s ease, transform 0.3s ease",
                }}
              >
                <GenericEditableText sectionId={sectionId} field="ctaText" value={cta} tag="span" />
                <span aria-hidden="true" className="b01-hero-cta-arrow" style={{ marginLeft: 12, display: "inline-block", transition: "transform 0.3s ease" }}>→</span>
              </a>
            )}
            {secText && (
              <a
                href={resolvedSecHref}
                className="b01-hero-sec inline-flex items-center gap-2"
                style={{
                  fontFamily: FONT, fontSize: 12, fontWeight: 500,
                  letterSpacing: "0.22em", textTransform: "uppercase",
                  color: "#ffffff",
                  textDecoration: "none",
                  paddingBottom: 4,
                  borderBottom: "1px solid rgba(255,255,255,0.4)",
                  transition: "color 0.3s ease, border-color 0.3s ease",
                }}
              >
                <GenericEditableText sectionId={sectionId} field="secondaryText" value={secText} tag="span" />
              </a>
            )}
          </div>
        </div>

        {/* Bottom info ledger */}
        {ledger.length > 0 && (
          <div className="absolute bottom-0 left-0 right-0 z-[2]"
            style={{ padding: "0 clamp(24px, 5vw, 64px) clamp(28px, 4vw, 48px)" }}>
            <div aria-hidden="true" style={{ height: 1, backgroundColor: "rgba(224,190,154,0.35)", marginBottom: 22 }} />
            <div className="b01-hero-ledger" style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              gap: 24,
              maxWidth: 1320, margin: "0 auto",
            }}>
              {ledger.map((item, i) => (
                <div key={`b01-led-${i}`} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <span style={{
                    fontFamily: MONO, fontSize: 10, letterSpacing: "0.24em",
                    textTransform: "uppercase", color: "rgba(255,255,255,0.6)",
                  }}>
                    <GenericEditableText sectionId={sectionId} field={`ledger.${i}.label`} value={item.label ?? ""} tag="span" />
                  </span>
                  <span style={{
                    fontFamily: FONT, fontSize: 14, fontWeight: 400,
                    color: "#ffffff",
                  }}>
                    <GenericEditableText sectionId={sectionId} field={`ledger.${i}.value`} value={item.value ?? ""} tag="span" />
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>
    );
  }

  // ── hero-massage-01-fullbleed ───────────────────────────────────────────────
  // 780px, gradient overlay, centrovaný obsah, Cormorant Garamond 72px
  // tag (gold uppercase) → H1 → subline → outline CTA — praha-masaze.cz originál
  if (variant === "hero-massage-01-fullbleed") {
    const bg      = String(content.bgImage      ?? content.backgroundImage ?? "");
    const tag     = String(content.tag          ?? "Rodinné studio krásy a zdraví");
    const headline= String(content.headline     ?? "Tady se maká na úlevě");
    const subline = String(content.subline      ?? "Odborná terapeutická masáž v intimním a příjemném prostředí.");
    const ctaText = String(content.ctaText      ?? "Rezervovat masáž");
    const ctaHref = String(content.ctaHref      ?? "#rezervace");
    const GOLD    = "#C9A962";
    const TEXT    = "#F5F0E8";
    const SECONDARY = "#A09888";
    const FONT    = "'Inter', sans-serif";
    const SERIF   = "'Cormorant Garamond', serif";
    return (
      <section
        id="uvod"
        style={{ position: "relative", height: 780, overflow: "hidden", display: "flex", alignItems: "flex-start", backgroundColor: "#0A0A0A" }}
        data-template="massage-01"
      >
        {/* Bg foto */}
        {bg && (
          <GenericEditableImage sectionId={sectionId} field="bgImage" src={bg} alt="" className="absolute inset-0 z-0" style={{ position: "absolute" }} priority>
            <Image src={bg} alt="" fill className="object-cover object-center" sizes="100vw" priority unoptimized={shouldSkipNextImageOptimization(bg)} />
          </GenericEditableImage>
        )}
        {/* Gradient overlay — přesně z clone CSS */}
        <div aria-hidden style={{
          position: "absolute", inset: 0, zIndex: 1, pointerEvents: "none",
          background: "linear-gradient(to bottom, rgba(10,10,10,0.91) 0%, rgba(10,10,10,0.69) 50%, rgba(10,10,10,0.88) 100%)"
        }} />
        {/* Content — centrovaný */}
        <div style={{
          position: "relative", zIndex: 2,
          width: "100%", maxWidth: 1280, margin: "0 auto",
          padding: "72px 80px 0",
          display: "flex", flexDirection: "column", alignItems: "center", gap: 32, textAlign: "center"
        }}>
          {/* Ikona rukou — demo logo nad tagem, 120×120, gold SVG */}
          <div aria-hidden style={{ width: 120, height: 120, marginBottom: -8 }}>
            <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
              {/* Kruh pozadí */}
              <circle cx="60" cy="60" r="58" fill="#0A0A0A" stroke="#C9A962" strokeWidth="1"/>
              {/* Ruce — stylizovaná masáž: dvě dlaně přes sebe */}
              {/* Spodní ruka */}
              <path d="M28 72 Q30 58 40 55 L52 54 Q56 53 58 56 L60 62" stroke="#C9A962" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
              <path d="M60 62 L62 54 Q63 50 67 50 Q71 50 71 54 L71 62" stroke="#C9A962" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
              <path d="M71 62 L71 52 Q71 48 75 48 Q79 48 79 52 L79 62" stroke="#C9A962" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
              <path d="M79 62 L79 54 Q79 50 83 50 Q87 50 87 54 L87 64" stroke="#C9A962" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
              <path d="M87 64 Q90 70 88 76 Q85 84 76 86 L50 86 Q38 86 32 78 L28 72" stroke="#C9A962" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
              {/* Horní ruka — překrývá */}
              <path d="M36 56 Q34 44 42 38 Q46 35 50 38 L52 42" stroke="#C9A962" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.6"/>
              <path d="M52 42 L54 34 Q55 30 59 30 Q63 30 63 34 L63 44" stroke="#C9A962" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.6"/>
              <path d="M63 44 L63 32 Q63 28 67 28 Q71 28 71 32 L71 44" stroke="#C9A962" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.6"/>
              <path d="M71 44 L71 34 Q71 30 75 30 Q79 30 79 34 L79 46" stroke="#C9A962" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.6"/>
              <path d="M79 46 Q84 50 84 58 Q84 66 78 70 L52 70 Q40 70 36 60 L36 56" stroke="#C9A962" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.6"/>
            </svg>
          </div>

          {/* Tag — gold, 11px, uppercase, letter-spacing 2px */}
          <p style={{
            fontFamily: FONT, fontSize: 11, fontWeight: 500,
            letterSpacing: 2, color: GOLD, textTransform: "uppercase",
            margin: 0,
          }}>
            <GenericEditableText sectionId={sectionId} field="tag" value={tag} tag="span" />
          </p>
          {/* H1 — Cormorant Garamond, 72px, weight 400, cream */}
          <h1 style={{
            fontFamily: SERIF, fontSize: "clamp(40px, 6vw, 72px)",
            fontWeight: 400, color: TEXT, lineHeight: 1.05,
            maxWidth: 680, margin: 0,
          }}>
            <GenericEditableText sectionId={sectionId} field="headline" value={headline} tag="span" />
          </h1>
          {/* Subline — Inter 17px, weight 300, secondary */}
          <p style={{
            fontFamily: FONT, fontSize: 17, fontWeight: 300,
            color: SECONDARY, lineHeight: 1.7, maxWidth: 560, margin: 0,
          }}>
            <GenericEditableText sectionId={sectionId} field="subline" value={subline} tag="span" />
          </p>
          {/* CTA — outline gold */}
          <a
            href={resolveDemoHref(ctaHref, tenantSlug, isAdmin)}
            data-btn="primary"
            style={{
              display: "inline-flex", alignItems: "center",
              border: `1px solid rgba(201,169,98,0.25)`,
              color: GOLD, fontFamily: FONT, fontSize: 13, fontWeight: 500,
              letterSpacing: "0.16em", textTransform: "uppercase",
              textDecoration: "none", padding: "12px 32px",
              transition: "border-color 0.25s, color 0.25s",
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = GOLD; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(201,169,98,0.25)"; }}
          >
            <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
          </a>
        </div>
      </section>
    );
  }

  // tawan-01: fullscreen video hero, transparent navbar overlays from top
  if (variant === "tawan-01-hero-slider") {
    return <HeroTawan01 content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;
  }

  if (variant === "tawan-02-hero") {
    return <HeroTawan02 content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;
  }

  // tattoo-01: fullbleed dark hero — 100svh, foto bg + pravý dekorativní art obrázek,
  // H1 uppercase vlevo nahoře + subtitle, flex spacer, 3 inline CTA tlačítka vlevo dole
  if (variant === "hero-tattoo-01-dark") {
    const c01 = content as {
      title?: string; subtitle?: string;
      cta1Text?: string; cta1Href?: string;
      cta2Text?: string; cta2Href?: string;
      cta3Text?: string; cta3Href?: string;
      backgroundImage?: string;
      artImage?: string;
    };
    const bg       = c01.backgroundImage ?? "";
    const artImage = c01.artImage ?? "/templates/tattoo-01/hero-art.webp";
    const ACCENT = "#ff5c4b";

    const href1 = c01.cta1Href ?? "#tattoo";
    const href2 = c01.cta2Href ?? "#piercing";
    const href3 = c01.cta3Href ?? "#kontakt";

    return (
      <>
        <style>{`
          @media (max-width: 767px) {
            [data-template="tattoo-01"] .t01-art-panel { display: none !important; }
            [data-template="tattoo-01"] .t01-content { max-width: 100% !important; }
          }
        `}</style>
        <section
          id="uvod"
          data-template="tattoo-01"
          style={{
            position: "relative",
            minHeight: "100svh",
            backgroundColor: "#000",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Foto pozadí */}
          {bg && (
            <GenericEditableImage sectionId={sectionId} field="backgroundImage" src={bg} alt="" className="absolute inset-0 w-full h-full">
              <Image
                src={bg}
                alt=""
                fill
                priority
                className="object-cover"
                style={{ objectPosition: "62% 54%" }}
                sizes="100vw"
                unoptimized={shouldSkipNextImageOptimization(bg)}
              />
            </GenericEditableImage>
          )}

          {/* Gradient overlay — tmavý nahoře, průhledný dole */}
          <div
            aria-hidden
            style={{
              position: "absolute", inset: 0,
              background: "linear-gradient(to bottom, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.35) 50%, rgba(0,0,0,0.15) 100%)",
              zIndex: 1,
            }}
          />

          {/* Obsah — flex row: levý text (flex:1) + pravý art panel */}
          <div
            style={{
              position: "relative",
              zIndex: 2,
              display: "flex",
              flexDirection: "row",
              flex: 1,
              alignItems: "stretch",
            }}
          >
            {/* Levý sloupec — text + CTA, vertikálně centrováno */}
            <div
              className="t01-content"
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                flex: 1,
                maxWidth: "60%",
                padding: "clamp(100px, 12vw, 140px) clamp(24px, 5vw, 72px) clamp(60px, 8vw, 100px)",
              }}
            >
              <div style={{ maxWidth: 640 }}>
                {/* Červená dekorativní linka nad H1 */}
                <div style={{ width: 44, height: 3, backgroundColor: ACCENT, marginBottom: "clamp(20px, 2.5vw, 28px)" }} aria-hidden />

                <h1
                  style={{
                    fontFamily: "'Arial Black', Arial, sans-serif",
                    fontSize: "clamp(2.6rem, 5vw, 5rem)",
                    fontWeight: 900,
                    color: "#ffffff",
                    textTransform: "uppercase",
                    letterSpacing: "0.04em",
                    lineHeight: 1.05,
                    margin: 0,
                  }}
                >
                  <GenericEditableText sectionId={sectionId} field="title" value={c01.title ?? "Demo Tattoo Studio"} tag="span" />
                </h1>

                <p
                  style={{
                    fontFamily: "Arial, Helvetica, sans-serif",
                    fontSize: "clamp(0.95rem, 1.6vw, 1.15rem)",
                    fontWeight: 300,
                    color: "rgba(255,255,255,0.7)",
                    letterSpacing: "0.06em",
                    marginTop: "clamp(14px, 2vw, 22px)",
                    marginBottom: "clamp(32px, 4vw, 48px)",
                    lineHeight: 1.6,
                  }}
                >
                  <GenericEditableText sectionId={sectionId} field="subtitle" value={c01.subtitle ?? "Tetování a piercing od roku 1996"} tag="span" />
                </p>

                {/* 3 CTA tlačítka — hned pod subtitlem */}
                <div style={{ display: "flex", flexWrap: "wrap", gap: "12px 14px", alignItems: "center" }}>
                  <a
                    href={resolveDemoHref(href1, tenantSlug, isAdmin)}
                    style={{
                      display: "inline-flex", alignItems: "center",
                      border: "1.5px solid rgba(255,255,255,0.6)",
                      color: "#ffffff",
                      fontFamily: "Arial, Helvetica, sans-serif",
                      fontSize: "0.72rem", fontWeight: 700,
                      letterSpacing: "0.14em", textTransform: "uppercase",
                      textDecoration: "none", padding: "12px 28px",
                      transition: "background 0.2s, border-color 0.2s", whiteSpace: "nowrap",
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.12)"; e.currentTarget.style.borderColor = "#ffffff"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.6)"; }}
                  >
                    <GenericEditableText sectionId={sectionId} field="cta1Text" value={c01.cta1Text ?? "Tattoo"} tag="span" />
                  </a>
                  <a
                    href={resolveDemoHref(href2, tenantSlug, isAdmin)}
                    style={{
                      display: "inline-flex", alignItems: "center",
                      border: "1.5px solid rgba(255,255,255,0.6)",
                      color: "#ffffff",
                      fontFamily: "Arial, Helvetica, sans-serif",
                      fontSize: "0.72rem", fontWeight: 700,
                      letterSpacing: "0.14em", textTransform: "uppercase",
                      textDecoration: "none", padding: "12px 28px",
                      transition: "background 0.2s, border-color 0.2s", whiteSpace: "nowrap",
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.12)"; e.currentTarget.style.borderColor = "#ffffff"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.6)"; }}
                  >
                    <GenericEditableText sectionId={sectionId} field="cta2Text" value={c01.cta2Text ?? "Piercing"} tag="span" />
                  </a>
                  <a
                    href={resolveDemoHref(href3, tenantSlug, isAdmin)}
                    style={{
                      display: "inline-flex", alignItems: "center",
                      backgroundColor: ACCENT, color: "#ffffff",
                      fontFamily: "Arial, Helvetica, sans-serif",
                      fontSize: "0.72rem", fontWeight: 700,
                      letterSpacing: "0.14em", textTransform: "uppercase",
                      textDecoration: "none", padding: "13px 30px",
                      transition: "background 0.2s", whiteSpace: "nowrap",
                    }}
                    onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#d94a38")}
                    onMouseLeave={e => (e.currentTarget.style.backgroundColor = ACCENT)}
                  >
                    <GenericEditableText sectionId={sectionId} field="cta3Text" value={c01.cta3Text ?? "Objednat se"} tag="span" />
                  </a>
                </div>
              </div>
            </div>

            {/* Pravý panel — tattoo art obrázek */}
            <div
              className="t01-art-panel"
              aria-hidden
              style={{
                flexShrink: 0,
                width: "38%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "clamp(80px, 10vw, 120px) clamp(32px, 4vw, 60px) clamp(60px, 8vw, 100px) clamp(20px, 3vw, 40px)",
                position: "relative",
              }}
            >
              <div
                style={{
                  position: "relative",
                  width: "100%",
                  maxWidth: 380,
                  aspectRatio: "3/4",
                  /* Obrázek plynule mizí do tmavého bg zleva a zespoda */
                  WebkitMaskImage: "linear-gradient(to right, transparent 0%, black 28%), linear-gradient(to top, transparent 0%, black 22%)",
                  WebkitMaskComposite: "destination-in",
                  maskImage: "linear-gradient(to right, transparent 0%, black 28%), linear-gradient(to top, transparent 0%, black 22%)",
                  maskComposite: "intersect",
                  /* Červená záře zespoda jako brand accent */
                  filter: "drop-shadow(0 0 40px rgba(255,92,75,0.22)) drop-shadow(0 24px 60px rgba(0,0,0,0.6))",
                }}
              >
                <GenericEditableImage
                  sectionId={sectionId}
                  field="artImage"
                  src={artImage}
                  alt="Tattoo art"
                  className="absolute inset-0 w-full h-full"
                  style={{ position: "absolute" }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={artImage}
                    alt="Tattoo art"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      objectPosition: "center 20%",
                      display: "block",
                    }}
                  />
                </GenericEditableImage>
              </div>
            </div>
          </div>
        </section>
      </>
    );
  }

  // ananda-01: fullscreen image slider, fixed navbar above (spacer already injected by navbar)
  if (variant === "ananda-01-hero-slider") {
    return <HeroAnanda01 content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;
  }

  if (variant === "hero-tattoo-02-centered") {
    return <HeroTattoo02 content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;
  }

  if (variant === "hero-tattoo-03-dark") {
    return <HeroTattoo03 content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;
  }

  if (variant === "nails-01-hero") {
    return <HeroNails01 content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;
  }

  if (variant === "nails-02-hero") {
    return <HeroNails02 content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;
  }

  if (variant === "nails-03-hero") {
    return <HeroNails03 content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;
  }
  if (variant === "clinic-02-hero") {
    return <HeroClinic02 content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;
  }
  if (variant === "clinic-02-page-banner") {
    return <HeroClinic02PageBanner content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;
  }
  if (variant === "clinic-03-hero") {
    return <HeroClinic03 content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;
  }
  if (variant === "hero-fitness-01-split") {
    return <HeroFitness01 content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;
  }
  if (variant === "hero-fitness-01-page") {
    return <HeroFitness01Page content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;
  }
  if (variant === "hero-fitness-02-fullwidth") {
    return <HeroFitness02 content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;
  }
  if (variant === "hero-fitness-02-page") {
    return <HeroFitness02Page content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;
  }
  if (variant === "hero-solar-02-page") {
    return <HeroSolar02Page content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;
  }

  if (variant === "hero-fyzio-01-fullbleed") {
    return <HeroFyzio01 content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;
  }
  if (variant === "hero-fyzio-02-split") {
    return <HeroFyzio02 content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;
  }
  if (variant === "restaurant-01-hero") {
    return <HeroRestaurant01 content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;
  }
  if (variant === "restaurant-02-hero") {
    return <HeroRestaurant02 content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;
  }
  if (variant === "restaurant-03-hero") {
    return <HeroRestaurant03 content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;
  }
  if (variant === "restaurant-04-hero") {
    return <HeroRestaurant04 content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;
  }
  if (variant === "cafe-02-hero") {
    return <HeroCafe02 content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;
  }
  if (variant === "cafe-03-hero") {
    return <HeroCafe03 content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;
  }
  if (variant === "cafe-04-hero") {
    return <HeroCafe04 content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;
  }
  if (variant === "bakery-01-hero") {
    return <HeroBakery01 content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;
  }
  if (variant === "bakery-02-hero") {
    return <HeroBakery02Hero content={content} sectionId={sectionId} />;
  }

  if (variant === "reality-01-hero") {
    return <HeroReality01 content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;
  }
  if (variant === "reality-02-hero") {
    return <HeroReality02 content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;
  }
  if (variant === "hero-reality-03-video") {
    return <HeroReality03 content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;
  }
  if (variant === "reality-04-split-hero") {
    return <HeroReality04Split content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;
  }
  if (variant === "reality-05-hero") {
    return <HeroReality05 content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;
  }
  if (variant === "hero-reality-06-agent") {
    return <HeroReality06Agent content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;
  }
  if (variant === "autoservis-01-hero") {
    return <HeroAutoservis01 content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;
  }
  if (variant === "autoservis-02-hero") {
    return <HeroAutoservis02 content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;
  }
  if (variant === "autoservis-03-hero") {
    return <HeroAutoservis03 content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;
  }
  if (variant === "dental-01-hero") {
    return <HeroDental01 content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;
  }
  if (variant === "lawyer-01-hero") {
    return <HeroLawyer01 content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;
  }
  if (variant === "ortho-01-hero") {
    return <HeroOrtho01 content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;
  }
  if (variant === "ortho-02-hero") {
    return <HeroOrtho02 content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;
  }
  if (variant === "legal-02-hero") {
    return <HeroLegal02 content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;
  }
  if (variant === "autoskola-01-hero") {
    return <HeroAutoskola01 content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;
  }
  if (variant === "lang-01-hero") {
    return <HeroLang01 content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;
  }
  if (variant === "edu-01-hero") {
    return <HeroEdu01 content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;
  }
  if (variant === "kids-01-hero") {
    return <HeroKids01 content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;
  }
  if (variant === "pethotel-01-hero") {
    return <HeroPethotel01 content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;
  }
  if (variant === "ucetni-01-hero") {
    return <HeroUcetni01 content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;
  }
  if (variant === "ucetni-02-hero") {
    return <HeroUcetni02 content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;
  }
  if (variant === "ucetni-03-hero") {
    return <HeroUcetni03 content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;
  }
  if (variant === "ucetni-04-hero") {
    return <HeroUcetni04 content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;
  }
  if (variant === "arch-01-hero") {
    return <HeroArch01 content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;
  }
  if (variant === "solar-01-hero") {
    return <HeroSolar01 content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;
  }
  if (variant === "solar-01-hero-page" || variant === "hero-solar-01-page") {
    return <HeroSolar01Page content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;
  }
  if (variant === "instala-02-hero") {
    return <HeroInstala02 content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;
  }
  if (variant === "klima-01-hero") {
    return <HeroKlima01 content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;
  }
  if (variant === "solar-02-hero") {
    return <HeroSolar02 content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;
  }
  if (variant === "solar-03-hero") {
    return <HeroSolar03 content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;
  }
  if (variant === "floors-01-hero") {
    return <HeroFloors01 content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;
  }
  if (variant === "klempir-01-hero") {
    return <HeroKlempir01 content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;
  }
  if (variant === "malir-01-hero") {
    return <HeroMalir01 content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;
  }
  if (variant === "malir-02-hero") {
    return <HeroMalir02 content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;
  }
  if (variant === "hotel-01-hero") {
    return <HeroHotel01 content={content} sectionId={sectionId} tenantSlug={tenantSlug ?? ""} isAdmin={isAdmin} />;
  }
  if (variant === "hotel-02-hero") {
    return <HeroHotel02 content={content} sectionId={sectionId} tenantSlug={tenantSlug ?? ""} isAdmin={isAdmin} />;
  }
  if (variant === "chalet-01-hero") {
    return <HeroChalet01 content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;
  }

  if (variant === "photo-01-hero") {
    return <HeroPhoto01 content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;
  }

  if (variant === "events-01-hero") {
    return <HeroEvents01 content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;
  }

  if (variant === "hero-events-01-page") {
    return <HeroEvents01Page content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;
  }

  if (variant === "dj-01-hero") {
    return <HeroDj01 content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;
  }

  if (variant === "dj-01-hero-page") {
    return <HeroDj01Page content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;
  }

  if (variant === "video-01-hero") {
    return <HeroVideo01 content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;
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
          <BackgroundEditableImage sectionId={sectionId} src={c.backgroundImage!} priority={true} isAdmin={isAdmin} focusStyle={bgFocusStyle} focusMobileStyle={bgFocusMobileStyle} />
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
            data-btn="primary"

            className="block sm:inline-block w-full sm:w-auto px-8 py-4 font-semibold text-white text-center transition-opacity hover:opacity-90"
            style={{ backgroundColor: "var(--color-primary, #1B3A6B)", borderRadius: "var(--radius, 4px)" }}
          >
            <GenericEditableText sectionId={sectionId} field="ctaText" value={c.ctaText ?? "Kontaktujte nás"} tag="span" />
          </a>
        )}
      </div>

      <style>{`
        @media (max-width: 768px) {
          .f01-beige { display: none !important; }
          .f01-benefits-bar { display: none !important; }
          .flex-col-mobile { flex-direction: column !important; min-height: auto !important; }
          .w-full-mobile { width: 100% !important; padding: 60px 24px 40px !important; }
        }
      `}</style>
    </section>
  );
}

// ── hero-fitness-01-split ───────────────────────────────────────────────────
// Luxe Warm Physio Sanctuary — cream #FFF9F7 split hero
// Left: badge s pulse dot, H1 Inter 800 + Instrument Serif italic accent word,
// warm brown tagline, Roboto quote body, primary CTA pill s glow + arrow,
// secondary link s hairline underline, rating cluster (avatary + hvězdy)
// Right: photo v accent-hairline frame se subtle rotation + warm radial glow,
// organic arc SVG blob místo hard diagonal clip (matches "arc" motif)
// Bottom: floating benefits bar s pulse-hover ikonami + scroll cue arrow
// ────────────────────────────────────────────────────────────────────────────
function HeroFitness01({ content, sectionId, tenantSlug, isAdmin }: Omit<Props, "variant">) {
  const c              = content as Record<string, unknown>;
  const tagline        = String(c.tagline        ?? "Fyzioterapie · Osobní trénink · Regenerace");
  const headlinePre    = String(c.headlinePre    ?? "Zpět do kondice");
  const headlineAccent = String(c.headlineAccent ?? "s respektem");
  const headlinePost   = String(c.headlinePost   ?? "k tělu");
  const headlineFallback = String(c.headline ?? "");
  const quote          = String(c.quote          ?? "");
  const ctaText        = String(c.ctaText        ?? "První konzultace zdarma");
  const ctaHref        = String(c.ctaHref        ?? "/kontakt");
  const ctaNote        = String(c.ctaNote        ?? "");
  const secondaryText  = String(c.secondaryText  ?? "");
  const secondaryHref  = String(c.secondaryHref  ?? "/cenik");
  const image          = String(c.image          ?? "/assets/fitness-01/hero-adam-vitek.webp");
  const imageAlt       = String(c.imageAlt       ?? "Fyzioterapeut a osobní trenér");
  const badgeText      = String(c.badgeText      ?? "");
  const badgeHref      = String(c.badgeHref      ?? "/onas");
  const rating         = String(c.rating         ?? "5.0");
  const ratingCount    = String(c.ratingCount    ?? "84 recenzí");
  const siteMode       = String(c.siteMode ?? "multipage");

  const bAvatars      = (c.benefitsAvatars as string[]) ?? [];
  const bItems        = (c.benefitsItems  as Array<{ icon: string; title: string; description: string }>) ?? [];

  const resolve = (href: string) => resolveHeroNavHref(href, siteMode, tenantSlug, isAdmin);

  const iconMap: Record<string, React.ReactElement> = {
    dumbbell: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M6.5 6.5h11M6.5 17.5h11M3 9.5h3v5H3zM18 9.5h3v5h-3z"/><line x1="6.5" y1="12" x2="17.5" y2="12"/></svg>,
    calendar:  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
    chat:      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
  };

  const Star = ({ size = 14 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  );

  return (
    <section className="fit01-hero" data-template="fitness-01">
      {/* Organic arc blob (right side, behind photo) */}
      <svg className="fit01-hero-blob" viewBox="0 0 900 800" preserveAspectRatio="xMaxYMid slice" aria-hidden="true">
        <defs>
          <radialGradient id="fit01BlobGradA" cx="55%" cy="50%" r="58%">
            <stop offset="0%"   stopColor="#EBDACC" stopOpacity="0.9" />
            <stop offset="55%"  stopColor="#DFCABA" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#DFCABA" stopOpacity="0" />
          </radialGradient>
        </defs>
        <path fill="url(#fit01BlobGradA)" d="M 900 60 C 780 120, 620 100, 500 190 C 360 300, 300 480, 420 640 C 540 800, 800 780, 900 700 Z" />
      </svg>

      {/* Subtle grain texture */}
      <div className="fit01-hero-grain" aria-hidden="true" />

      <div className="fit01-hero-inner">
        <div className="fit01-hero-main">
          {/* ── LEFT: copy ── */}
          <div className="fit01-hero-copy">
            {badgeText && (
              <a href={resolve(badgeHref)} className="fit01-hero-badge">
                <span className="fit01-badge-dot" aria-hidden="true" />
                <GenericEditableText sectionId={sectionId} field="badgeText" value={badgeText} tag="span" />
              </a>
            )}

            <h1 className="fit01-hero-h1">
              {headlineFallback ? (
                <GenericEditableText sectionId={sectionId} field="headline" value={headlineFallback} tag="span" />
              ) : (
                <>
                  <span className="fit01-h1-line">
                    <GenericEditableText sectionId={sectionId} field="headlinePre" value={headlinePre} tag="span" />{" "}
                    <span className="fit01-h1-accent">
                      <GenericEditableText sectionId={sectionId} field="headlineAccent" value={headlineAccent} tag="span" />
                    </span>{" "}
                    <GenericEditableText sectionId={sectionId} field="headlinePost" value={headlinePost} tag="span" />
                  </span>
                </>
              )}
            </h1>

            {quote && (
              <p className="fit01-hero-quote">
                <GenericEditableText sectionId={sectionId} field="quote" value={quote} tag="span" />
              </p>
            )}

            <div className="fit01-hero-actions">
              <a href={resolve(ctaHref)} className="fit01-hero-cta" data-btn="primary">
                <span className="fit01-hero-cta-label">
                  <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
                </span>
                <svg className="fit01-hero-cta-arrow" width="15" height="11" viewBox="0 0 15 11" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M1 5.5h12M9 1l4 4.5-4 4.5" />
                </svg>
              </a>
              {secondaryText && (
                <a href={resolve(secondaryHref)} className="fit01-hero-secondary">
                  <GenericEditableText sectionId={sectionId} field="secondaryText" value={secondaryText} tag="span" />
                </a>
              )}
            </div>

            {/* Meta row: rating + note inline */}
            <div className="fit01-hero-meta">
              {bAvatars.length > 0 && (
                <div className="fit01-avatar-stack" aria-hidden="true">
                  {bAvatars.slice(0, 3).map((src, i) => (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img key={i} src={src} alt="" className="fit01-avatar" />
                  ))}
                </div>
              )}
              <div className="fit01-rating-inline">
                <div className="fit01-rating-stars" aria-label={`Hodnocení ${rating} z 5`}>
                  <Star /><Star /><Star /><Star /><Star />
                </div>
                <span className="fit01-rating-value">{rating}</span>
                <span className="fit01-rating-count">
                  · <GenericEditableText sectionId={sectionId} field="ratingCount" value={ratingCount} tag="span" />
                </span>
              </div>
            </div>
          </div>

          {/* ── RIGHT: photo ── */}
          <div className="fit01-hero-media">
            <div className="fit01-hero-photo-wrap">
              {image && (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={image} alt={imageAlt} className="fit01-hero-photo" loading="eager" fetchPriority="high" />
              )}
              <svg className="fit01-photo-arc" width="52" height="52" viewBox="0 0 60 60" fill="none" aria-hidden="true">
                <path d="M 4 56 A 52 52 0 0 1 56 4" stroke="#AD8A72" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>
          </div>
        </div>

        {/* Benefits strip INSIDE hero (no overflow) */}
        {bItems.length > 0 && (
          <div className="fit01-benefits-strip">
            {bItems.map((item, i) => (
              <div key={i} className="fit01-benefit-chip">
                <span className="fit01-benefit-chip-ico">{iconMap[item.icon] ?? iconMap.dumbbell}</span>
                <span className="fit01-benefit-chip-body">
                  <span className="fit01-benefit-chip-title">{item.title}</span>
                  <span className="fit01-benefit-chip-desc">{item.description}</span>
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

// ── hero-fitness-01-page ────────────────────────────────────────────────────
// Slim banner for subpages: cream bg, breadcrumb + H1 (italic accent) + decorative arc rule
// ~340px viewport-safe, echoes homepage hero motifs (blob whisper, grain, hairline)
// ──────────────────────────────────────────────────────────────────────────
function HeroFitness01Page({ content, sectionId, tenantSlug, isAdmin }: Omit<Props, "variant">) {
  const c = content as Record<string, unknown>;
  const eyebrow        = String(c.eyebrow        ?? "");
  const titlePre       = String(c.titlePre       ?? "");
  const titleAccent    = String(c.titleAccent    ?? "");
  const titlePost      = String(c.titlePost      ?? "");
  const title          = String(c.title          ?? "Stránka");
  const subtitle       = String(c.subtitle       ?? "");
  const breadcrumb     = String(c.breadcrumb     ?? "Domů");
  const breadcrumbHref = String(c.breadcrumbHref ?? "/");
  const siteMode       = String(c.siteMode ?? "multipage");
  const resolve = (href: string) => resolveHeroNavHref(href, siteMode, tenantSlug, isAdmin);

  const hasSplit = Boolean(titlePre || titleAccent || titlePost);

  return (
    <section className="fit01-hero-page" data-template="fitness-01">
      <div className="fit01-hero-page-blob-wrap" aria-hidden="true">
        <svg className="fit01-hero-page-blob" viewBox="0 0 900 400" preserveAspectRatio="xMaxYMid slice">
          <defs>
            <radialGradient id="fit01PageBlob" cx="65%" cy="55%" r="55%">
              <stop offset="0%"   stopColor="#EBDACC" stopOpacity="0.75" />
              <stop offset="60%"  stopColor="#DFCABA" stopOpacity="0.55" />
              <stop offset="100%" stopColor="#DFCABA" stopOpacity="0" />
            </radialGradient>
          </defs>
          <path fill="url(#fit01PageBlob)" d="M 900 20 C 720 60, 560 90, 460 200 C 380 300, 460 400, 720 400 L 900 400 Z" />
        </svg>
      </div>
      <div className="fit01-hero-grain" aria-hidden="true" />

      <div className="fit01-hero-page-inner">
        {/* Breadcrumb */}
        <nav className="fit01-page-breadcrumb" aria-label="Drobečková navigace">
          <a href={resolve(breadcrumbHref)} className="fit01-page-crumb-link">
            <GenericEditableText sectionId={sectionId} field="breadcrumb" value={breadcrumb} tag="span" />
          </a>
          <span className="fit01-page-crumb-sep" aria-hidden="true">/</span>
          <span className="fit01-page-crumb-current">
            <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
          </span>
        </nav>

        {eyebrow && (
          <div className="fit01-page-eyebrow">
            <span className="fit01-tagline-mark" aria-hidden="true" />
            <GenericEditableText sectionId={sectionId} field="eyebrow" value={eyebrow} tag="span" />
          </div>
        )}

        <h1 className="fit01-page-h1">
          {hasSplit ? (
            <>
              {titlePre && (
                <GenericEditableText sectionId={sectionId} field="titlePre" value={titlePre} tag="span" />
              )}
              {titleAccent && (
                <>
                  {titlePre ? " " : ""}
                  <span className="fit01-h1-accent">
                    <GenericEditableText sectionId={sectionId} field="titleAccent" value={titleAccent} tag="span" />
                  </span>
                  {titlePost ? " " : ""}
                </>
              )}
              {titlePost && (
                <GenericEditableText sectionId={sectionId} field="titlePost" value={titlePost} tag="span" />
              )}
            </>
          ) : (
            <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
          )}
        </h1>

        {subtitle && (
          <p className="fit01-page-sub">
            <GenericEditableText sectionId={sectionId} field="subtitle" value={subtitle} tag="span" />
          </p>
        )}

        {/* Decorative rule: hairline + arc + hairline */}
        <div className="fit01-page-rule" aria-hidden="true">
          <span className="fit01-page-rule-line" />
          <svg width="26" height="14" viewBox="0 0 26 14" fill="none">
            <path d="M 2 12 A 12 12 0 0 1 24 12" stroke="#AD8A72" strokeWidth="1.4" strokeLinecap="round" />
          </svg>
          <span className="fit01-page-rule-line" />
        </div>
      </div>
    </section>
  );
}

// Hero-local nav resolver (mirror of NavbarSection.resolveNavHref)
function resolveHeroNavHref(href: string, siteMode: string, tenantSlug?: string, isAdmin = false) {
  if (siteMode === "onepage") {
    if (href.startsWith("/#")) return resolveDemoHref("/", tenantSlug, isAdmin) + href.slice(1);
    if (href === "/" || href.startsWith("http") || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) return resolveDemoHref(href, tenantSlug, isAdmin);
    const slug = href.replace(/^\//, "");
    return resolveDemoHref("/", tenantSlug, isAdmin) + "#" + slug;
  }
  if (href.startsWith("/#")) {
    const anchor = href.slice(2);
    return resolveDemoHref("/" + anchor, tenantSlug, isAdmin);
  }
  return resolveDemoHref(href, tenantSlug, isAdmin);
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
  heroEyebrow,
}: {
  slides: Array<{ title?: string; subtitle?: string; backgroundImage?: string }>;
  interval: number;
  ctaText: string;
  ctaHref: string;
  sectionId: number;
  heroEyebrow: string;
}) {
  const [idx, setIdx] = useState(0);
  const [hovered, setHovered] = useState(false);
  const { isAdmin, updateField } = useGenericInlineEditor();
  const studio = useStudioOptional();
  const count = Math.max(slides.length, 1);

  // Sync displayed slide with inspector chip selection when in admin mode
  useEffect(() => {
    if (!isAdmin || !studio) return;
    const studioIdx = studio.heroSlideIdx;
    if (studioIdx?.sectionId === sectionId && studioIdx.idx !== idx) {
      setIdx(studioIdx.idx);
    }
  }, [studio?.heroSlideIdx, isAdmin, sectionId]); // eslint-disable-line react-hooks/exhaustive-deps

  function handleAddSlide() {
    const next = [...slides, { title: "", subtitle: "", backgroundImage: "" }];
    updateField(sectionId, "slides", next);
    setIdx(next.length - 1);
    if (isAdmin && studio) studio.setHeroSlideIdx({ sectionId, idx: next.length - 1 });
  }

  function handleDeleteSlide(i: number) {
    if (slides.length <= 1) return;
    const next = slides.filter((_, si) => si !== i);
    updateField(sectionId, "slides", next);
    const nextIdx = Math.min(idx, next.length - 1);
    setIdx(nextIdx);
    if (isAdmin && studio) studio.setHeroSlideIdx({ sectionId, idx: nextIdx });
  }
  useEffect(() => {
    if (count < 2 || isAdmin || hovered) return;
    const ms = Math.max(2000, interval);
    // Delay first advance so the slide-0 LCP image stays the LCP candidate
    // during Lighthouse/PSI measurement (which runs within the first 5-7s).
    // After 8s the slider auto-advances normally.
    let intervalId: ReturnType<typeof setInterval> | null = null;
    const timeoutId = setTimeout(() => {
      setIdx((i) => (i + 1) % count);
      intervalId = setInterval(() => setIdx((i) => (i + 1) % count), ms);
    }, 8000);
    return () => {
      clearTimeout(timeoutId);
      if (intervalId) clearInterval(intervalId);
    };
  }, [count, interval, isAdmin, hovered]);

  return (
    <>
    <section
      className="relative overflow-hidden"
      style={{ minHeight: "100svh", backgroundColor: "#000" }}
      data-template="barber-04"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Slides — stacked, opacity-cross-fade */}
      {slides.map((s, i) => (
        <div
          key={`slide-${i}`}
          className="absolute inset-0 transition-opacity duration-700"
          style={{ opacity: i === idx ? 1 : 0, zIndex: i === idx ? 2 : 0 }}
          aria-hidden={i !== idx}
        >
          {!isAdmin && i === 0 && s.backgroundImage ? (
            <img
              src={String(s.backgroundImage)}
              alt=""
              fetchPriority="high"
              decoding="async"
              style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
            />
          ) : (
            <GenericEditableImage
              sectionId={sectionId}
              field={`slides.${i}.backgroundImage`}
              src={String(s.backgroundImage ?? "")}
              alt=""
              style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
              dimensions="hero"
              priority={i === 0}
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
            </GenericEditableImage>
          )}
        </div>
      ))}

      {/* Gradient overlay — silnější dole pro čitelnost na mobilu */}
      <div
        aria-hidden
        className="absolute inset-0 z-[1] pointer-events-none"
        style={{
          background:
            "linear-gradient(to bottom,rgba(0,0,0,.45) 0%,rgba(0,0,0,.20) 35%,rgba(0,0,0,.40) 70%,rgba(10,8,6,.78) 100%)",
        }}
      />

      {/* Content */}
      <style>{`
        @keyframes barber04SlideUp {
          0%   { opacity: 0; transform: translateY(36px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes barber04LineGrow {
          0%   { transform: scaleX(0); }
          100% { transform: scaleX(1); }
        }
        [data-template="barber-04"] .b04-anim-1 { animation: barber04SlideUp .9s cubic-bezier(.22,.61,.36,1) .15s both; }
        [data-template="barber-04"] .b04-anim-2 { animation: barber04SlideUp .9s cubic-bezier(.22,.61,.36,1) .35s both; }
        [data-template="barber-04"] .b04-anim-3 { animation: barber04SlideUp .9s cubic-bezier(.22,.61,.36,1) .55s both; }
        [data-template="barber-04"] .b04-anim-4 { animation: barber04SlideUp .9s cubic-bezier(.22,.61,.36,1) .70s both; }
        [data-template="barber-04"] .b04-hero-line { transform-origin: center; animation: barber04LineGrow .7s cubic-bezier(.4,0,.2,1) .55s both; }
        @media (prefers-reduced-motion: reduce) {
          [data-template="barber-04"] .b04-anim-1,
          [data-template="barber-04"] .b04-anim-2,
          [data-template="barber-04"] .b04-anim-3,
          [data-template="barber-04"] .b04-anim-4,
          [data-template="barber-04"] .b04-hero-line { animation: none; opacity: 1; transform: none; }
        }
        @media (max-width: 639px) {
          [data-template="barber-04"] .b04-hero-content {
            padding-top: 88px;
            padding-bottom: 120px;
          }
          [data-template="barber-04"] .b04-title { font-size: clamp(40px, 11vw, 58px) !important; margin-bottom: 18px !important; }
          [data-template="barber-04"] .b04-subtitle { font-size: 13px !important; margin-bottom: 28px !important; letter-spacing: .12em !important; }
          [data-template="barber-04"] .b04-cta { padding: 14px 28px !important; font-size: 12px !important; }
          [data-template="barber-04"] .b04-hero-eyebrow { font-size: 10px !important; margin-bottom: 18px !important; }
          [data-template="barber-04"] .b04-slide-counter { display: none; }
        }
      `}</style>
      <div
        className="b04-hero-content relative z-10 flex items-end justify-center text-center text-white px-6 pointer-events-none"
        style={{ minHeight: "100svh", paddingBottom: "14vh", paddingTop: 140 }}
      >
        <div key={`slide-content-${idx}`} className="max-w-[1100px] pointer-events-auto" style={{ width: "100%" }}>
          {/* Eyebrow industrial numbered badge */}
          <div
            className="b04-hero-eyebrow b04-anim-1"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 12,
              marginBottom: 28,
              fontFamily: "'Lato',Helvetica,Arial,sans-serif",
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.32em",
              color: "#d5b981",
              textTransform: "uppercase",
            }}
          >
            <span style={{ fontFamily: "'Bebas Neue','Oswald',Impact,sans-serif", fontWeight: 400, letterSpacing: "0.10em", fontSize: 14 }}>
              {String(idx + 1).padStart(2, "0")}
            </span>
            <span aria-hidden style={{ width: 28, height: 1, backgroundColor: "#d5b981", opacity: 0.7 }} />
            <GenericEditableText sectionId={sectionId} field="heroEyebrow" value={heroEyebrow} tag="span" />
          </div>

          <h1
            className="b04-title uppercase b04-anim-2"
            style={{
              fontFamily: "'Bebas Neue','Oswald',Impact,sans-serif",
              fontWeight: 400,
              fontSize: "clamp(44px, 5.5vw, 84px)",
              letterSpacing: "0.03em",
              lineHeight: 1.05,
              color: "#fff",
              marginBottom: 28,
              textShadow: "0 4px 32px rgba(0,0,0,.55)",
            }}
          >
            <GenericEditableText
              sectionId={sectionId}
              field={`slides.${idx}.title`}
              value={slides[idx]?.title ?? ""}
              tag="span"
            />
          </h1>

          {/* Gold fade gradient signature line */}
          <div
            aria-hidden
            className="b04-hero-line"
            style={{
              width: 220,
              height: 1,
              margin: "0 auto 28px",
              background:
                "linear-gradient(90deg, transparent 0%, rgba(213,185,129,.85) 50%, transparent 100%)",
            }}
          />

          <p
            className="b04-subtitle b04-anim-3 uppercase"
            style={{
              fontFamily: "'Lato',Helvetica,Arial,sans-serif",
              fontWeight: 400,
              fontSize: "clamp(13px, 1.05vw, 15px)",
              letterSpacing: "0.18em",
              color: "rgba(255,255,255,0.78)",
              maxWidth: 640,
              margin: "0 auto 44px",
              lineHeight: 1.7,
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
              data-btn="primary"
              className="b04-cta b04-cta-outline inline-flex items-center gap-3 uppercase no-underline b04-anim-4"
              style={{
                background: "transparent",
                color: "#d5b981",
                border: "1px solid #d5b981",
                fontFamily: "'Lato',Helvetica,Arial,sans-serif",
                fontSize: 13,
                fontWeight: 600,
                letterSpacing: "0.24em",
                padding: "15px 34px",
                borderRadius: 0,
                transition: "background .25s cubic-bezier(.4,0,.2,1), color .25s ease, transform .25s ease",
              }}
            >
              <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
              <span aria-hidden className="b04-cta-arrow" style={{ display: "inline-flex", transition: "transform .3s cubic-bezier(.22,.68,0,1.1)" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                </svg>
              </span>
            </a>
          )}
        </div>
      </div>

      {/* Slide counter industrial — bottom-left */}
      {count > 1 && (
        <div
          className="b04-slide-counter absolute z-20 hidden md:flex items-baseline gap-3 pointer-events-none"
          style={{
            left: "max(32px, 4vw)",
            bottom: "max(36px, env(safe-area-inset-bottom, 0px) + 28px)",
            fontFamily: "'Bebas Neue','Oswald',Impact,sans-serif",
            color: "#fff",
            letterSpacing: "0.10em",
          }}
        >
          <span style={{ fontSize: 38, lineHeight: 1, color: "#d5b981" }}>
            {String(idx + 1).padStart(2, "0")}
          </span>
          <span aria-hidden style={{
            width: 48, height: 1, background: "rgba(255,255,255,.4)", marginBottom: 8,
          }} />
          <span style={{ fontSize: 16, lineHeight: 1, color: "rgba(255,255,255,.6)", marginBottom: 4 }}>
            {String(count).padStart(2, "0")}
          </span>
        </div>
      )}

      {/* Šipky — pouze desktop */}
      {count > 1 && (
        <>
          <button
            type="button"
            onClick={() => setIdx((i) => (i - 1 + count) % count)}
            aria-label="Předchozí slide"
            className="absolute top-1/2 z-20 hidden md:flex items-center justify-center bg-transparent border-0 cursor-pointer transition-opacity"
            style={{ left: 22, transform: "translateY(-50%)", color: "#fff", width: 56, height: 56, opacity: 0.55, padding: 0 }}
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
            style={{ right: 22, transform: "translateY(-50%)", color: "#fff", width: 56, height: 56, opacity: 0.55, padding: 0 }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = "0.55")}
          >
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <polyline points="9 6 15 12 9 18" />
            </svg>
          </button>
        </>
      )}

      {/* Dots + swipe hint na mobilu */}
      <div
        className="absolute left-1/2 z-10 flex flex-col items-center gap-4"
        style={{ bottom: "max(28px, env(safe-area-inset-bottom, 0px) + 20px)", transform: "translateX(-50%)" }}
        aria-hidden
      >
        <div className="flex items-center gap-3">
          {slides.map((_, i) => (
            <button
              key={`dot-${i}`}
              type="button"
              onClick={() => setIdx(i)}
              aria-label={`Slide ${i + 1}`}
              className="border-0 cursor-pointer"
              style={{
                width: i === idx ? 36 : 12,
                height: 2,
                backgroundColor: i === idx ? "#d5b981" : "rgba(255,255,255,0.35)",
                padding: 0,
                transition: "width .3s, background-color .3s",
              }}
            />
          ))}
          {isAdmin && (
            <button
              type="button"
              onClick={handleAddSlide}
              aria-label="Přidat slide"
              style={{
                width: 24, height: 24, borderRadius: "50%",
                background: "rgba(213,185,129,0.18)", border: "1.5px solid rgba(213,185,129,0.6)",
                color: "#d5b981", fontSize: 16, lineHeight: 1,
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer", padding: 0, flexShrink: 0,
                transition: "background 0.2s",
              }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "rgba(213,185,129,0.35)")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "rgba(213,185,129,0.18)")}
            >+</button>
          )}
        </div>
      </div>

      {/* Delete slide button — admin only, top-right of active slide */}
      {isAdmin && slides.length > 1 && (
        <button
          type="button"
          onClick={() => handleDeleteSlide(idx)}
          aria-label="Smazat tento slide"
          style={{
            position: "absolute", top: 80, right: 20, zIndex: 30,
            background: "rgba(220,38,38,0.85)", border: "none",
            color: "#fff", fontSize: 12, fontWeight: 600, letterSpacing: "0.04em",
            padding: "6px 12px", borderRadius: 4, cursor: "pointer",
          }}
        >
          Smazat slide {idx + 1}
        </button>
      )}
    </section>
    </>
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
          data-btn="primary"
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

function BackgroundEditableImage({ sectionId, src, overlayColor, priority, isAdmin, focusStyle, focusMobileStyle }: { sectionId: number; src: string; overlayColor?: string; priority?: boolean; isAdmin?: boolean; focusStyle?: string; focusMobileStyle?: string }) {
  const bgId = `hbg-${sectionId}`;
  // Public view with priority: use plain <img> so the URL stays clean (no ?dpl= added by Next.js Image).
  // This makes the src match the static <link rel="preload"> emitted by the server component → cache hit.
  if (!isAdmin && priority && src) {
    return (
      <div id={bgId} className="absolute inset-0 z-0" style={{ position: "absolute" }}>
        {focusMobileStyle && (
          <style>{`@media(max-width:767px){#${bgId} img{object-position:${focusMobileStyle}!important}}`}</style>
        )}
        <img
          src={src}
          alt=""
          fetchPriority="high"
          decoding="async"
          style={{ position: "absolute", height: "100%", width: "100%", inset: 0, objectFit: "cover", objectPosition: focusStyle }}
        />
        {overlayColor && <div className="absolute inset-0" style={{ backgroundColor: overlayColor, pointerEvents: "none" }} />}
      </div>
    );
  }
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
      {src ? (
        <>
          <Image
            src={src}
            alt=""
            fill
            className="object-cover"
            style={{ objectPosition: focusStyle }}
            sizes="100vw"
            priority={priority}
            unoptimized={shouldSkipNextImageOptimization(src)}
          />
          {overlayColor && (
            <div className="absolute inset-0" style={{ backgroundColor: overlayColor, pointerEvents: "none" }} />
          )}
        </>
      ) : (
        <div className="absolute inset-0" style={{ backgroundColor: "#1a1a1a" }} />
      )}
    </GenericEditableImage>
  );
}

// ── tawan-01-hero-slider ──────────────────────────────────────────────────────
// Fullscreen video/image slider, výška 100svh, navbar (fixed, transparent) leží nahoře.
// Slide obsahuje: velký headline, subline, CTA tlačítko.
// Video: autoPlay muted loop playsInline — stejně jako tawan.cz
// ─────────────────────────────────────────────────────────────────────────────
function HeroTawan01({
  content,
  sectionId,
  tenantSlug,
  isAdmin,
}: {
  content: Record<string, unknown>;
  sectionId: number;
  tenantSlug?: string;
  isAdmin?: boolean;
}) {
  type Slide = { headline: string; subline: string; ctaText: string; ctaHref: string; bgImage?: string };
  const raw = (content.slides as Slide[] | undefined) ?? [];
  const slides: Slide[] = raw.length > 0 ? raw : [
    { headline: "Luxusní thajské masáže", subline: "Nejvyšší úroveň služeb", ctaText: "Rezervovat", ctaHref: "#kontakt" },
  ];

  const [idx, setIdx] = useState(0);
  const [fading, setFading] = useState(false);
  const PURPLE = "#393145";
  const BRONZE = "#af8c6a";
  const FONT   = "'Muli', sans-serif";
  const btnRadius = "16px 0 16px 0";

  useEffect(() => {
    if (slides.length <= 1) return;
    const t = setInterval(() => {
      setFading(true);
      setTimeout(() => {
        setIdx(i => (i + 1) % slides.length);
        setFading(false);
      }, 500);
    }, 6000);
    return () => clearInterval(t);
  }, [slides.length]);

  const slide = slides[idx];
  const resolve = (href: string) => {
    if (!tenantSlug || !href.startsWith("/")) return href;
    if (href === "/") return `/demo/${tenantSlug}${isAdmin ? "/admin" : ""}`;
    if (href.startsWith("/#")) return href.slice(1);
    return `/demo/${tenantSlug}${isAdmin ? "/admin" : ""}${href}`;
  };

  return (
    <section
      id="uvod"
      style={{ position: "relative", width: "100%", height: "100svh", minHeight: 600, overflow: "hidden", backgroundColor: PURPLE, display: "flex", alignItems: "center" }}
      data-template="tawan-01"
    >
      {/* Video pozadí */}
      <video
        key="/clones/tawan/sites/default/files/video-thumbnails/2022-11/tawan_main_loop_0.mp4"
        autoPlay
        muted
        loop
        playsInline
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", zIndex: 0 }}
      >
        <source src="/clones/tawan/sites/default/files/video-thumbnails/2022-11/tawan_main_loop_0.mp4" type="video/mp4" />
      </video>

      {/* Tmavý overlay */}
      <div aria-hidden style={{ position: "absolute", inset: 0, zIndex: 1, background: "linear-gradient(to bottom, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.55) 100%)" }} />

      {/* Dot navigátor */}
      {slides.length > 1 && (
        <div style={{ position: "absolute", bottom: 32, left: "50%", transform: "translateX(-50%)", zIndex: 3, display: "flex", gap: 10 }}>
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => { setFading(true); setTimeout(() => { setIdx(i); setFading(false); }, 300); }}
              aria-label={`Slide ${i + 1}`}
              style={{ width: i === idx ? 28 : 8, height: 8, borderRadius: 4, border: "none", cursor: "pointer", padding: 0, transition: "all 0.3s", backgroundColor: i === idx ? BRONZE : "rgba(255,255,255,0.5)" }}
            />
          ))}
        </div>
      )}

      {/* Slide obsah */}
      <div
        style={{
          position: "relative", zIndex: 2, width: "100%", maxWidth: 900, margin: "0 auto", padding: "0 32px",
          textAlign: "center", opacity: fading ? 0 : 1, transition: "opacity 0.5s ease",
        }}
      >
        <h1 style={{ fontFamily: FONT, fontWeight: 300, fontSize: "clamp(36px, 5vw, 72px)", color: "#ffffff", margin: "0 0 20px", letterSpacing: 2, lineHeight: 1.15 }}>
          <GenericEditableText sectionId={sectionId} field={`slides.${idx}.headline`} value={slide.headline} tag="span" />
        </h1>
        <p style={{ fontFamily: FONT, fontWeight: 300, fontSize: "clamp(14px, 2vw, 20px)", color: "rgba(255,255,255,0.85)", margin: "0 0 40px", letterSpacing: 1 }}>
          <GenericEditableText sectionId={sectionId} field={`slides.${idx}.subline`} value={slide.subline} tag="span" />
        </p>
        <a
          href={resolve(slide.ctaHref)}
          data-btn="primary"
          style={{
            fontFamily: FONT, fontWeight: 700, fontSize: 14, letterSpacing: 2, textTransform: "uppercase",
            color: "#ffffff", textDecoration: "none",
            display: "inline-block", padding: "0 36px", height: 52, lineHeight: "52px",
            backgroundColor: BRONZE, borderRadius: btnRadius,
            transition: "background 0.2s",
          }}
          onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#c19d7b")}
          onMouseLeave={e => (e.currentTarget.style.backgroundColor = BRONZE)}
        >
          <GenericEditableText sectionId={sectionId} field={`slides.${idx}.ctaText`} value={slide.ctaText} tag="span" />
        </a>
      </div>

      <style>{`
        @media (max-width: 768px) {
          [data-template="tawan-01"] h1 { font-size: clamp(28px, 8vw, 48px) !important; }
          [data-template="tawan-01"] p  { font-size: 15px !important; }
        }
      `}</style>
    </section>
  );
}

// ── ananda-01-hero-slider ─────────────────────────────────────────────────────
// 100svh fullscreen, navbar (gold, fixed) leží nad ním — spacer je v navbar komponentu.
// Slider: 4 bg obrázky, auto 6s, fade transition, dot navigátor dole.
// Obsah: centrovaný symbol "A" (SVG) + H1 light + 2× gold-border pill CTA.
// Ref: anandaspa.cz header — h-screen, Jost, gold border-radius pill buttons.
// ─────────────────────────────────────────────────────────────────────────────
function HeroAnanda01({
  content,
  sectionId,
  tenantSlug,
  isAdmin,
}: {
  content: Record<string, unknown>;
  sectionId: number;
  tenantSlug?: string;
  isAdmin?: boolean;
}) {
  type Slide = { bgImage?: string };
  const headline = String(content.headline ?? "Tradiční indická\nmedicína v srdci Prahy");
  const ctaText  = String(content.ctaText  ?? "REZERVOVAT");
  const ctaHref  = String(content.ctaHref  ?? "#kontakt");
  const cta2Text = String(content.cta2Text ?? "DÁRKOVÝ VOUCHER");
  const cta2Href = String(content.cta2Href ?? "#voucher");
  const videoUrl = String(content.videoUrl ?? "/templates/ananda-01/hero.mp4");

  const GOLD  = "#AA813A";
  const WHITE = "#ffffff";
  const FONT  = "'Jost', sans-serif";

  const resolve = (href: string) => {
    if (!tenantSlug || !href.startsWith("/")) return href;
    if (href === "/") return `/demo/${tenantSlug}${isAdmin ? "/admin" : ""}`;
    return `/demo/${tenantSlug}${isAdmin ? "/admin" : ""}${href}`;
  };

  // Dekorativní "A" symbol — 1:1 Ananda_symbolA_HP_white.svg proporce
  const symbolSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 90" fill="none"><path d="M40 5 L72 80 H58 L40 35 L22 80 H8 Z" stroke="rgba(255,255,255,0.85)" stroke-width="1.5" fill="none"/><line x1="18" y1="58" x2="62" y2="58" stroke="rgba(255,255,255,0.5)" stroke-width="1"/></svg>`;
  const symbolUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(symbolSvg)}`;

  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Jost:wght@300;400;600&display=swap" />
      <style>{`        .ananda-hero-btn {
          font-family: ${FONT}; font-size: 11px; font-weight: 600;
          letter-spacing: 3px; text-transform: uppercase; text-decoration: none;
          color: ${WHITE}; display: inline-flex; align-items: center;
          padding: 14px 32px; border: 1.5px solid ${GOLD}; border-radius: 999px;
          transition: background 0.25s, color 0.25s; white-space: nowrap;
        }
        .ananda-hero-btn:hover { background: ${GOLD}; }
        @media(max-width: 600px) {
          .ananda-hero-btns { flex-direction: column !important; align-items: center !important; }
          .ananda-hero-btn { width: 220px; justify-content: center; }
        }
      `}</style>

      <section
        id="uvod"
        data-template="ananda-01"
        style={{ position: "relative", width: "100%", height: "100svh", minHeight: 580, overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#1a1208" }}
      >
        {/* Video pozadí — autoPlay muted loop, 1:1 anandaspa.cz */}
        <video
          autoPlay
          muted
          loop
          playsInline
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", zIndex: 0 }}
        >
          <source src={videoUrl} type="video/mp4" />
        </video>

        {/* Bez overlay — 1:1 anandaspa.cz (video hraje čisté) */}

        {/* Centrovaný obsah */}
        <div style={{ position: "relative", zIndex: 2, textAlign: "center", padding: "0 24px", maxWidth: 700 }}>
          <img loading="eager" src={symbolUrl} alt="" aria-hidden style={{ width: 56, height: 63, display: "block", margin: "0 auto 28px" }} />
          <h1 style={{ fontFamily: FONT, fontWeight: 300, fontSize: "clamp(32px, 5vw, 58px)", color: WHITE, margin: "0 0 40px", lineHeight: 1.2, letterSpacing: 1, whiteSpace: "pre-line" }}>
            <GenericEditableText sectionId={sectionId} field="headline" value={headline} tag="span" />
          </h1>
          <div className="ananda-hero-btns" style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
            <a href={resolve(ctaHref)} data-btn="primary" className="ananda-hero-btn"><GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" /></a>
            <a href={resolve(cta2Href)} className="ananda-hero-btn"><GenericEditableText sectionId={sectionId} field="cta2Text" value={cta2Text} tag="span" /></a>
          </div>
        </div>
      </section>
    </>
  );
}

// ── tawan-02-hero ─────────────────────────────────────────────────────────────
// 100svh, bg image s tmavým overlayem, centrovaný obsah
// H1 + subline + 2× CTA (voucher outline + rezervace filled)
// Šipka dolů na konci, font Candara/Georgia
// Ref: escapemassage.cz homepage hero
// ─────────────────────────────────────────────────────────────────────────────
function HeroTawan02({
  content,
  sectionId,
  tenantSlug,
  isAdmin,
}: {
  content: Record<string, unknown>;
  sectionId: number;
  tenantSlug?: string;
  isAdmin?: boolean;
}) {
  const headline      = String(content.headline      ?? "Nejlepší thajské masáže v Praze");
  const subline       = String(content.subline       ?? "Certifikované masérky · Otevřeno denně 10–22h · Online rezervace");
  const ctaText       = String(content.ctaText       ?? "Online rezervace");
  const ctaHref       = String(content.ctaHref       ?? "#kontakt");
  const voucherText   = String(content.voucherText   ?? "Dárkové poukazy");
  const voucherHref   = String(content.voucherHref   ?? "#voucher");
  const bgVideo       = String(content.bgVideo       ?? "/clones/escape/wp-content/themes/twentyseventeen/assets/images/homepage-desktop-2.mp4");
  const bgVideoMobile = String(content.bgVideoMobile ?? "/clones/escape/wp-content/themes/twentyseventeen/assets/images/homepage-mobile-2.mp4");
  const bgImage       = String(content.bgImage       ?? "/clones/escape/wp-content/uploads/2024/04/Escape-14-2000x1200.jpg");

  const BROWN  = "#604B3A";
  const ACCENT = "#AD8F78";
  const CREAM  = "#D8CABF";
  const WHITE  = "#ffffff";
  const FONT   = "Candara, 'Candara Regular', Georgia, serif";

  const resolve = (href: string) => {
    if (!tenantSlug || !href.startsWith("/")) return href;
    if (href === "/") return `/demo/${tenantSlug}${isAdmin ? "/admin" : ""}`;
    return `/demo/${tenantSlug}${isAdmin ? "/admin" : ""}${href}`;
  };

  return (
    <>
      <style>{`
        .t02-video-desktop { display: block; }
        .t02-video-mobile  { display: none; }
        @media(max-width: 767px) {
          .t02-video-desktop { display: none; }
          .t02-video-mobile  { display: block; }
        }
        .t02-hero-cta-btn {
          font-family: ${FONT}; font-size: 13px; font-weight: 700;
          letter-spacing: 2px; text-transform: uppercase; text-decoration: none;
          color: ${CREAM}; display: inline-block;
          padding: 0 48px; height: 50px; line-height: 48px;
          background: transparent; border: 1.5px solid ${CREAM}; border-radius: 8px;
          transition: background 0.25s;
          white-space: nowrap;
        }
        .t02-hero-cta-btn:hover { background: rgba(216,202,191,0.15); }
      `}</style>

      <section
        id="uvod"
        data-template="tawan-02"
        style={{
          position: "relative", width: "100%", height: "100svh", minHeight: 580,
          overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center",
          backgroundColor: BROWN,
        }}
      >
        {/* Video pozadí — desktop */}
        <video
          autoPlay muted loop playsInline
          className="t02-video-desktop"
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", zIndex: 0 }}
          poster={bgImage}
        >
          <source src={bgVideo} type="video/mp4" />
        </video>
        {/* Video pozadí — mobile */}
        <video
          autoPlay muted loop playsInline
          className="t02-video-mobile"
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", zIndex: 0 }}
          poster={bgImage}
        >
          <source src={bgVideoMobile} type="video/mp4" />
        </video>

        {/* Overlay — 1:1 escapemassage.cz */}
        <div aria-hidden style={{
          position: "absolute", inset: 0, zIndex: 1,
          background: "linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.3) 75%, rgba(0,0,0,0.3) 100%)",
        }} />

        {/* Centrovaný obsah */}
        <div style={{
          position: "relative", zIndex: 2, width: "100%",
          maxWidth: 820, margin: "0 auto", padding: "0 32px",
          textAlign: "center",
        }}>
          <h1 style={{
            fontFamily: "Georgia, 'Times New Roman', serif",
            fontWeight: 400, fontSize: "clamp(32px, 5vw, 62px)",
            color: WHITE, margin: "0 0 22px", letterSpacing: 1, lineHeight: 1.2,
          }}>
            <GenericEditableText sectionId={sectionId} field="headline" value={headline} tag="span" />
          </h1>
          <p style={{
            fontFamily: FONT, fontWeight: 300,
            fontSize: "clamp(13px, 1.8vw, 18px)",
            color: "rgba(217,202,191,0.9)", margin: "0 0 44px", letterSpacing: 0.5,
          }}>
            <GenericEditableText sectionId={sectionId} field="subline" value={subline} tag="span" />
          </p>
          <div style={{ display: "flex", justifyContent: "center" }}>
            <a href={resolve(ctaHref)} data-btn="primary" className="t02-hero-cta-btn"><GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" /></a>
          </div>
        </div>

        {/* Šipka dolů */}
        <div aria-hidden style={{
          position: "absolute", bottom: 32, left: "50%", transform: "translateX(-50%)",
          zIndex: 3, color: CREAM, opacity: 0.7,
          animation: "t02-bounce 2s ease-in-out infinite",
        }}>
          <svg width="28" height="16" viewBox="0 0 28 16" fill="none">
            <path d="M2 2L14 13L26 2" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <style>{`@keyframes t02-bounce { 0%,100%{transform:translateX(-50%) translateY(0)} 50%{transform:translateX(-50%) translateY(6px)} }`}</style>
      </section>
    </>
  );
}

// ── hero-tattoo-02-centered ───────────────────────────────────────────────────
// Inspirace: homietattoo.cz — zlatý H1, bílý subtitle, gold CTA + šipka,
// dark foto bg, stats bar dole.
// ─────────────────────────────────────────────────────────────────────────────
function HeroTattoo02({ content, sectionId, tenantSlug, isAdmin }: {
  content: Record<string, unknown>;
  sectionId: number;
  tenantSlug?: string;
  isAdmin?: boolean;
}) {
  const c       = content as Record<string, unknown>;
  const title   = String(c.title   ?? "Prémiové tetovací studio Praha");
  const subtitle= String(c.subtitle?? "Cena tetování od 1 800 Kč · Bezplatná konzultace");
  const ctaText = String(c.cta1Text?? "Objednejte se na bezplatnou konzultaci");
  const ctaHref = String(c.cta1Href?? "#kontakt");
  const bgImage = String(c.backgroundImage ?? "https://homietattoo.cz/wp-content/uploads/bg1-st.jpeg");

  const GOLD = "#BF8A1D";

  const stats = [
    { value: "500+", label: "spokojených zákazníků" },
    { value: "15+",  label: "zkušených tatérů" },
    { value: "8+",   label: "let zkušeností" },
    { value: "1800 Kč", label: "cena tetování od" },
  ];

  return (
    <>
      <style>{`
        @keyframes htc-fade { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:none} }
        @keyframes htc-bounce {
          0%,100%{transform:translateX(-50%) translateY(0)}
          50%{transform:translateX(-50%) translateY(7px)}
        }
        .htc-stat { text-align:center; padding:0 32px; }
        .htc-stat+.htc-stat { border-left:1px solid rgba(255,255,255,0.13); }
        .htc-cta-wrap { display:inline-flex; align-items:stretch; overflow:hidden; }
        .htc-cta-text {
          display:flex; align-items:center; padding:0 28px;
          background:${GOLD}; color:#fff;
          font-family:Arial,sans-serif; font-size:0.82rem; font-weight:700;
          letter-spacing:0.05em; text-decoration:none; height:54px;
          transition:background 0.2s;
        }
        .htc-cta-text:hover { background:#a87318; }
        .htc-cta-arrow {
          display:flex; align-items:center; justify-content:center;
          width:54px; height:54px; background:#fff; flex-shrink:0;
        }
        @media(max-width:640px){
          .htc-stat { width:50%; padding:14px 0; }
          .htc-stat+.htc-stat { border-left:none; }
          .htc-stat:nth-child(odd){ border-right:1px solid rgba(255,255,255,0.13); }
          .htc-stats-wrap { flex-wrap:wrap; }
          .htc-cta-wrap { width:100%; max-width:340px; }
          .htc-cta-text { flex:1; justify-content:center; }
        }
      `}</style>

      <section
        id="uvod"
        data-section="hero-tattoo-02"
        style={{
          position: "relative", width: "100%",
          minHeight: "100svh", overflow: "hidden",
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          backgroundColor: "#1a1a1a",
        }}
      >
        {/* Foto bg — editovatelná ve studiu */}
        <GenericEditableImage sectionId={sectionId} field="backgroundImage" src={bgImage} alt="Hero pozadí" className="absolute inset-0 w-full h-full" style={{ zIndex: 0 }}>
          <div style={{
            position: "absolute", inset: 0,
            backgroundImage: `url(${bgImage})`,
            backgroundSize: "cover", backgroundPosition: "center center",
            zIndex: 0,
          }} />
        </GenericEditableImage>

        {/* Overlay — tmavý jako originál rgba(39,39,39,0.81) */}
        <div aria-hidden style={{
          position: "absolute", inset: 0, zIndex: 1,
          background: "rgba(27,27,27,0.28)",
        }} />
        {/* Subtilní zlatý gradient dole */}
        <div aria-hidden style={{
          position: "absolute", bottom: 0, left: 0, right: 0, height: "40%", zIndex: 2,
          background: "linear-gradient(to top, rgba(15,9,0,0.55) 0%, transparent 100%)",
        }} />

        {/* Obsah — centrovaný, generózní padding jako originál */}
        <div style={{
          position: "relative", zIndex: 3,
          width: "100%", maxWidth: 820,
          margin: "0 auto",
          padding: "10vh clamp(24px,6vw,64px) 14vh",
          textAlign: "center",
          animation: "htc-fade 0.85s ease both",
        }}>
          {/* Zlatá dekorativní linka */}
          <div aria-hidden style={{
            width: 56, height: 2, backgroundColor: GOLD,
            margin: "0 auto 28px",
          }} />

          {/* H1 — zlatá, jako originál */}
          <h1 style={{
            fontFamily: "'Century Gothic', 'Avant Garde', Arial, sans-serif",
            fontWeight: 700,
            fontSize: "clamp(34px, 5vw, 58px)",
            color: GOLD,
            lineHeight: 1.1,
            letterSpacing: "0.01em",
            margin: "0 0 18px",
            textShadow: "1px 1px 12px rgba(0,0,0,0.9)",
          }}>
            <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
          </h1>

          {/* Subtitle — bílá, jako originál */}
          <p style={{
            fontFamily: "'Century Gothic', Arial, sans-serif",
            fontWeight: 400,
            fontSize: "clamp(18px, 2.8vw, 34px)",
            color: "#ffffff",
            lineHeight: 1.3,
            margin: "0 0 48px",
            textShadow: "-1px 1px 10px rgba(0,0,0,0.9)",
          }}>
            <GenericEditableText sectionId={sectionId} field="subtitle" value={subtitle} tag="span" />
          </p>

          {/* CTA — zlaté tlačítko s bílou šipkou, jako originál */}
          <div style={{ display: "flex", justifyContent: "center" }}>
            <a href={ctaHref} data-btn="primary" className="htc-cta-wrap" style={{ textDecoration: "none" }}>
              <span className="htc-cta-text">
                <GenericEditableText sectionId={sectionId} field="cta1Text" value={ctaText} tag="span" />
              </span>
              <span className="htc-cta-arrow" aria-hidden>
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path d="M3 9h12M10 5l5 4-5 4" stroke={GOLD} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </span>
            </a>
          </div>
        </div>

        {/* Stats bar — náš prémiový přídavek */}
        <div style={{
          position: "absolute", bottom: 0, left: 0, right: 0, zIndex: 4,
          background: "rgba(0,0,0,0.6)",
          backdropFilter: "blur(8px)",
          borderTop: `1px solid ${GOLD}40`,
        }}>
          <div className="htc-stats-wrap" style={{
            display: "flex", justifyContent: "center",
            maxWidth: 900, margin: "0 auto",
            padding: "16px 24px",
          }}>
            {stats.map((s, i) => (
              <div key={i} className="htc-stat">
                <div style={{
                  fontFamily: "'Arial Black', Arial, sans-serif",
                  fontWeight: 900, fontSize: "clamp(20px,2.4vw,28px)",
                  color: GOLD, lineHeight: 1.1,
                }}>{s.value}</div>
                <div style={{
                  fontFamily: "Arial, sans-serif",
                  fontSize: "0.65rem", color: "rgba(255,255,255,0.55)",
                  letterSpacing: "0.06em", marginTop: 3, textTransform: "uppercase",
                }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll šipka */}
        <div aria-hidden style={{
          position: "absolute", bottom: 80, left: "50%",
          transform: "translateX(-50%)", zIndex: 5,
          animation: "htc-bounce 2s ease-in-out infinite", opacity: 0.55,
        }}>
          <svg width="22" height="13" viewBox="0 0 22 13" fill="none">
            <path d="M1 1L11 11L21 1" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </section>
    </>
  );
}

// ── hero-tattoo-03-dark ───────────────────────────────────────────────────────
// Inspirace: magictattoo.cz — tmavý hero s bg fotkou (recepce studia),
// vlevo H1 bílý + subtitle + 2× CTA; review badge (hvězdičky + skóre)
// ─────────────────────────────────────────────────────────────────────────────
function HeroTattoo03({ content, sectionId, tenantSlug, isAdmin }: {
  content: Record<string, unknown>;
  sectionId: number;
  tenantSlug?: string;
  isAdmin?: boolean;
}) {
  const c            = content as Record<string, unknown>;
  const title        = String(c.title          ?? "Tetování Praha");
  const subtitle     = String(c.subtitle       ?? "Nejlepší tetovací studio v Praze. Otevřeno denně 10–20h i o víkendech.");
  const cta1Text     = String(c.cta1Text       ?? "Chci tetování");
  const cta1Href     = String(c.cta1Href       ?? "#kontakt");
  const cta2Text     = String(c.cta2Text       ?? "Naše práce");
  const cta2Href     = String(c.cta2Href       ?? "#galerie");
  const reviewCount  = String(c.reviewCount    ?? "1612");
  const reviewScore  = String(c.reviewScore    ?? "4.9");
  const bgImage      = String(c.backgroundImage ?? "/clones/magic/wp-content/uploads/2026/03/recepce-studia-tetovani-praha-scaled.webp");

  const ACCENT = "#D41515";
  const resolve = (href: string) => resolveDemoHref(href, tenantSlug, isAdmin);

  return (
    <>
      <style>{`
        @keyframes t03h-fade { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:none} }
        @keyframes t03h-fade2 { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:none} }
      `}</style>

      <section style={{
        position: "relative",
        width: "100%",
        minHeight: "100svh",
        display: "flex",
        alignItems: "center",
        overflow: "hidden",
        backgroundColor: "#0A0A0E",
      }}>
        {/* Background foto — zIndex: 1; content wrapper má pointerEvents:none → klik na prázdnou plochu jde sem */}
        <GenericEditableImage sectionId={sectionId} field="backgroundImage" src={bgImage} alt="" className="absolute inset-0 w-full h-full" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", zIndex: 1 }}>
          <img loading="eager" src={bgImage} alt="" aria-hidden style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center" }} />
        </GenericEditableImage>

        {/* Tmavé overlaye — 3 vrstvy (pointerEvents: none → nekradou kliky od GenericEditableText) */}
        <div aria-hidden style={{ position: "absolute", inset: 0, pointerEvents: "none", background: "linear-gradient(to right, rgba(10,10,14,0.88) 0%, rgba(10,10,14,0.55) 60%, rgba(10,10,14,0.2) 100%)" }} />
        <div aria-hidden style={{ position: "absolute", inset: 0, pointerEvents: "none", background: "linear-gradient(to top, rgba(10,10,14,0.7) 0%, transparent 50%)" }} />
        <div aria-hidden style={{ position: "absolute", inset: 0, pointerEvents: "none", background: "linear-gradient(to bottom, rgba(10,10,14,0.5) 0%, transparent 30%)" }} />

        {/* Obsah — vlevo zarovnaný */}
        {/* pointerEvents: none na wrapper → klik na prázdnou plochu propadne na bg image */}
        <div style={{
          position: "relative", zIndex: 2,
          width: "100%", maxWidth: 1360, margin: "0 auto",
          padding: "clamp(80px,12vw,160px) clamp(20px,5vw,80px)",
          pointerEvents: "none",
        }}>
          <div style={{ maxWidth: 700 }}>
            {/* Červená linka accent */}
            <div style={{ width: 48, height: 3, backgroundColor: ACCENT, marginBottom: 24 }} aria-hidden />

            <h1 style={{
              fontFamily: "Arial, Helvetica, sans-serif",
              fontWeight: 900,
              fontSize: "clamp(40px, 6vw, 80px)",
              color: "#ffffff",
              margin: "0 0 20px",
              lineHeight: 1.05,
              letterSpacing: "-0.01em",
              animation: "t03h-fade 0.8s ease both",
              pointerEvents: "auto",
            }}>
              <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
            </h1>

            <p style={{
              fontFamily: "Arial, Helvetica, sans-serif",
              fontSize: "clamp(14px, 1.8vw, 18px)",
              color: "rgba(255,255,255,0.78)",
              margin: "0 0 40px",
              lineHeight: 1.65,
              maxWidth: 560,
              animation: "t03h-fade2 0.9s 0.15s ease both",
              pointerEvents: "auto",
            }}>
              <GenericEditableText sectionId={sectionId} field="subtitle" value={subtitle} tag="span" />
            </p>

            {/* CTA tlačítka */}
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap", animation: "t03h-fade2 0.9s 0.25s ease both", pointerEvents: "auto" }}>
              <a
                href={resolve(cta1Href)}
                style={{
                  display: "inline-flex", alignItems: "center",
                  backgroundColor: ACCENT, color: "#ffffff",
                  fontFamily: "Arial, Helvetica, sans-serif",
                  fontSize: "0.9rem", fontWeight: 700,
                  letterSpacing: "0.06em",
                  padding: "14px 32px",
                  textDecoration: "none",
                  transition: "background 0.2s",
                }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#b30000")}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = ACCENT)}
              >
                <GenericEditableText sectionId={sectionId} field="cta1Text" value={cta1Text} tag="span" />
              </a>
              <a
                href={resolve(cta2Href)}
                style={{
                  display: "inline-flex", alignItems: "center",
                  border: "1.5px solid rgba(255,255,255,0.45)",
                  color: "rgba(255,255,255,0.88)",
                  fontFamily: "Arial, Helvetica, sans-serif",
                  fontSize: "0.9rem", fontWeight: 600,
                  letterSpacing: "0.05em",
                  padding: "13px 32px",
                  textDecoration: "none",
                  transition: "border-color 0.2s, color 0.2s",
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.9)"; e.currentTarget.style.color = "#fff"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.45)"; e.currentTarget.style.color = "rgba(255,255,255,0.88)"; }}
              >
                <GenericEditableText sectionId={sectionId} field="cta2Text" value={cta2Text} tag="span" />
              </a>
            </div>

            {/* Review badge */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 40, animation: "t03h-fade2 0.9s 0.35s ease both", pointerEvents: "auto" }}>
              <div style={{ display: "flex", gap: 2 }}>
                {[0,1,2,3,4].map(i => (
                  <svg key={i} width="16" height="16" viewBox="0 0 18 18" fill={ACCENT}>
                    <polygon points="9,1.5 11.5,6.5 17,7.3 13,11.2 14,17 9,14.2 4,17 5,11.2 1,7.3 6.5,6.5"/>
                  </svg>
                ))}
              </div>
              <span style={{ fontFamily: "Arial, Helvetica, sans-serif", fontSize: "0.82rem", color: "rgba(255,255,255,0.65)" }}>
                <strong style={{ color: "#ffffff" }}>
                  <GenericEditableText sectionId={sectionId} field="reviewScore" value={reviewScore} tag="span" />
                  /5.0
                </strong>
                {" — přes "}
                <GenericEditableText sectionId={sectionId} field="reviewCount" value={reviewCount} tag="span" />
                {" recenzí"}
              </span>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

// ── nails-01-hero ─────────────────────────────────────────────────────────────
// Hero sekce — soho nails 1:1
// Cream bg (#f4f1e9), min-height 100vh
// 3 portrait fotky vedle sebe (střed je 1.27× větší)
// Pod fotkami 2-col: velký H2 vlevo (48px burgundy serif) + body text vpravo
// Kulatý "SLUŽBY" badge absolutně vpravo dole
// ─────────────────────────────────────────────────────────────────────────────
function HeroNails01({
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
  const CREAM    = "#f4f1e9";
  const BURGUNDY = "#79142b";

  const title      = String(content.title      ?? "Vítejte v");
  const titleAccent = String(content.titleAccent ?? "Demo Nails & Spa");
  const body       = String(content.body        ?? "Věříme, že krása není jen vzhled, ale pocit a sebevědomí. Vytvořili jsme místo, kde si dopřejete kompletní péči.");
  const imgLeft    = String(content.imgLeft     ?? "/clones/soho/wp-content/uploads/2025/10/SOHO-Beauty-Salon-Nail-Art-Manicure-Pedicure-Hair-Styling-1x.webp");
  const imgCenter  = String(content.imgCenter   ?? "/clones/soho/wp-content/uploads/2025/10/SOHO-Beauty-Salon-Nail-Art-Manicure-Pedicure-1x.webp");
  const imgRight   = String(content.imgRight    ?? "/clones/soho/wp-content/uploads/2025/10/SOHO-Beauty-Salon-Nail-Art-Manicure-Pedicure-Hair-Styling-Near-Me-1x.webp");
  const badgeText  = String(content.badgeText   ?? "SLUŽBY");
  const badgeHref  = String(content.badgeHref   ?? "#sluzby");

  const resolvedBadgeHref = tenantSlug
    ? `/demo/${tenantSlug}${isAdmin ? "/admin" : ""}${badgeHref}`
    : badgeHref;

  // navbar is static, 40px top gap
  const PHOTOS_TOP = 40;

  return (
    <section
      data-section-type="hero"
      data-variant="nails-01-hero"
      style={{
        backgroundColor: CREAM,
        minHeight: "100vh",
        position: "relative",
        overflow: "hidden",
        paddingBottom: "5vh",
      }}
    >
      {/* Dekorativní ghost text pozadí */}
      <div
        aria-hidden="true"
        className="hidden lg:block"
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -52%)",
          fontSize: "clamp(120px, 22vw, 280px)",
          fontFamily: "Georgia, 'Times New Roman', serif",
          fontWeight: 700,
          color: BURGUNDY,
          opacity: 0.04,
          whiteSpace: "nowrap",
          userSelect: "none",
          pointerEvents: "none",
          lineHeight: 1,
          letterSpacing: "0.04em",
        }}
      >
        NAILS
      </div>

      {/* Shared outer padding — fotky i text sdílí stejné okraje */}
      <div className="hidden md:block" style={{ padding: `${PHOTOS_TOP}px clamp(24px, 4vw, 60px) clamp(36px, 5vh, 60px)` }}>

        {/* 3 portrait fotky */}
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "center", gap: 0 }}>
          {/* Levá fotka +10% → 24% */}
          <div style={{ flex: "0 0 24%", alignSelf: "flex-end" }}>
            <GenericEditableImage sectionId={sectionId} field="imgLeft" src={imgLeft} alt="Salon" className="w-full">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img loading="eager" src={imgLeft} alt="Salon" style={{ width: "100%", height: "auto", objectFit: "cover", display: "block", borderRadius: "4px 4px 0 0" }} />
            </GenericEditableImage>
          </div>

          {/* Střední fotka +10% → 29%, vyčnívá nahoru */}
          <div style={{ flex: "0 0 29%", transform: "scale(1.08)", transformOrigin: "bottom center", zIndex: 2 }}>
            <GenericEditableImage sectionId={sectionId} field="imgCenter" src={imgCenter} alt="Salon studio" className="w-full">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img loading="eager" src={imgCenter} alt="Salon studio" style={{ width: "100%", height: "auto", objectFit: "cover", display: "block", borderRadius: "4px 4px 0 0" }} />
            </GenericEditableImage>
          </div>

          {/* Pravá fotka +10% → 24% */}
          <div style={{ flex: "0 0 24%", alignSelf: "flex-end" }}>
            <GenericEditableImage sectionId={sectionId} field="imgRight" src={imgRight} alt="Salon services" className="w-full">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img loading="eager" src={imgRight} alt="Salon services" style={{ width: "100%", height: "auto", objectFit: "cover", display: "block", borderRadius: "4px 4px 0 0" }} />
            </GenericEditableImage>
          </div>
        </div>

        {/* 2-col text — maxWidth 77% = 24+29+24 = šířka skupiny fotek, centrováno */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "clamp(20px, 4vw, 48px)",
            width: "77%",
            margin: "clamp(28px, 4vh, 48px) auto 0",
            position: "relative",
            zIndex: 3,
          }}
        >
          {/* Vlevo — serif titulek */}
          <div style={{ flex: "1 1 260px", minWidth: 0 }}>
            <h2 style={{
              fontFamily: "Georgia, 'Times New Roman', serif",
              fontSize: "clamp(24px, 2.8vw, 48px)",
              fontWeight: 400,
              color: BURGUNDY,
              lineHeight: 1.2,
              margin: 0,
              letterSpacing: "0.01em",
            }}>
              <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
              <br />
              <GenericEditableText sectionId={sectionId} field="titleAccent" value={titleAccent} tag="span" />
            </h2>
          </div>

          {/* Vpravo — body text 15px/1.6em */}
          <div style={{ flex: "1 1 240px", minWidth: 0, display: "flex", alignItems: "center" }}>
            <p style={{
              fontFamily: "'Helvetica Neue', Arial, sans-serif",
              fontSize: "15px",
              color: BURGUNDY,
              lineHeight: 1.6,
              margin: 0,
              opacity: 0.8,
            }}>
              <GenericEditableText sectionId={sectionId} field="body" value={body} tag="span" />
            </p>
          </div>
        </div>

      </div>

      {/* Mobile: jedna fotka na celou šířku */}
      <div className="md:hidden" style={{ width: "100%", paddingTop: 80 }}>
        <GenericEditableImage sectionId={sectionId} field="imgCenter" src={imgCenter} alt="Salon studio" className="w-full">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img loading="eager" src={imgCenter} alt="Salon studio" style={{ width: "100%", height: 360, objectFit: "cover", objectPosition: "center top" }} />
        </GenericEditableImage>
        <div style={{ padding: "24px 20px 32px" }}>
          <h2 style={{ fontFamily: "Georgia, serif", fontSize: "28px", fontWeight: 400, color: BURGUNDY, margin: "0 0 12px" }}>
            <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
            <br />
            <GenericEditableText sectionId={sectionId} field="titleAccent" value={titleAccent} tag="span" />
          </h2>
          <p style={{ fontFamily: "sans-serif", fontSize: "15px", color: BURGUNDY, lineHeight: 1.6, margin: 0, opacity: 0.8 }}>
            <GenericEditableText sectionId={sectionId} field="body" value={body} tag="span" />
          </p>
        </div>
      </div>

      {/* Kulatý SLUŽBY badge — absolutně vpravo */}
      <a
        href={resolvedBadgeHref}
        style={{
          position: "absolute",
          bottom: "5vh",
          right: "5vw",
          width: 100,
          height: 100,
          borderRadius: "50%",
          backgroundColor: BURGUNDY,
          color: "#ffffff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "'Helvetica Neue', Arial, sans-serif",
          fontSize: "0.65rem",
          fontWeight: 700,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          textDecoration: "none",
          zIndex: 10,
          transition: "transform 0.2s, background 0.2s",
        }}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = "scale(1.08)"; }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = "scale(1)"; }}
        className="hidden md:flex"
      >
        <GenericEditableText sectionId={sectionId} field="badgeText" value={badgeText} tag="span" />
      </a>
    </section>
  );
}

// ── nails-03-hero ────────────────────────────────────────────────────────────
// maidenstudio.cz — 100vh full-bleed bg foto, dark overlay; centrovaný layout:
// velký uppercase H1 = název studia, menší italic tagline pod ním, brown CTA.
// ─────────────────────────────────────────────────────────────────────────────
function HeroNails03({
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
  const CREAM = "#FCF9F0";
  const BROWN = "#806248";

  const title   = String(content.title   ?? "Studio Krásy");
  const tagline = String(content.tagline ?? "Kde krása začíná péčí.");
  const bgImage = String(content.bgImage ?? "/templates/nails-03/hero-bg.webp");
  const ctaText = String(content.ctaText ?? "Objednat se");
  const ctaHref = String(content.ctaHref ?? "#kontakt");
  const _nails03Focus = content.__heroBgFocus as { x: number; y: number } | undefined;
  const bgFocusStyle  = _nails03Focus ? `${_nails03Focus.x}% ${_nails03Focus.y}%` : undefined;
  const _nails03FocusMobile = content.__heroBgFocusMobile as { x: number; y: number } | undefined;
  const bgFocusMobileStyle  = _nails03FocusMobile ? `${_nails03FocusMobile.x}% ${_nails03FocusMobile.y}%` : undefined;

  return (
    <section
      id="hero"
      data-section-type="hero"
      data-variant="nails-03-hero"
      style={{
        position: "relative",
        width: "100%",
        minHeight: "calc(100vh - 80px)",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <BackgroundEditableImage sectionId={sectionId} src={bgImage} priority={true} isAdmin={isAdmin} focusStyle={bgFocusStyle} focusMobileStyle={bgFocusMobileStyle} />
      {/* Dark overlay */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 10,
          background: "linear-gradient(180deg, rgba(11,9,12,0.55) 0%, rgba(11,9,12,0.40) 50%, rgba(11,9,12,0.68) 100%)",
        }}
      />
      <div
        style={{
          position: "relative",
          zIndex: 20,
          maxWidth: 860,
          width: "100%",
          padding: "80px 24px 80px",
          textAlign: "center",
          color: CREAM,
        }}
      >
        {/* Hlavní název studia — velký, uppercase */}
        <h1
          style={{
            fontFamily: "'Manrope', 'Helvetica Neue', Arial, sans-serif",
            fontWeight: 800,
            fontSize: "clamp(3rem, 7.5vw, 6.5rem)",
            lineHeight: 1.0,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            margin: 0,
            color: CREAM,
            textShadow: "0 2px 32px rgba(0,0,0,0.45)",
          }}
        >
          <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
        </h1>
        {/* Tagline — italic, menší */}
        <p
          style={{
            margin: "28px auto 0",
            maxWidth: 560,
            fontFamily: "'Manrope', 'Helvetica Neue', Arial, sans-serif",
            fontStyle: "italic",
            fontSize: "clamp(1rem, 1.6vw, 1.25rem)",
            fontWeight: 300,
            lineHeight: 1.55,
            color: "rgba(252,249,240,0.88)",
            letterSpacing: "0.03em",
          }}
        >
          <GenericEditableText sectionId={sectionId} field="tagline" value={tagline} tag="span" />
        </p>
        <a
          href={resolveDemoHref(ctaHref, tenantSlug, isAdmin)}
          data-btn="primary"
          style={{
            display: "inline-flex",
            marginTop: 52,
            padding: "16px 52px",
            backgroundColor: BROWN,
            color: CREAM,
            fontFamily: "'Manrope', 'Helvetica Neue', Arial, sans-serif",
            fontSize: "0.88rem",
            fontWeight: 700,
            letterSpacing: "0.10em",
            textDecoration: "none",
            textTransform: "uppercase",
            borderRadius: 999,
            transition: "background 0.22s, transform 0.18s",
          }}
          onMouseEnter={e => { e.currentTarget.style.backgroundColor = "#6e5238"; e.currentTarget.style.transform = "translateY(-2px)"; }}
          onMouseLeave={e => { e.currentTarget.style.backgroundColor = BROWN; e.currentTarget.style.transform = "translateY(0)"; }}
        >
          <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
        </a>
      </div>
    </section>
  );
}

// ── nails-02-hero ────────────────────────────────────────────────────────────
// Full-bleed close-up nehtové foto, tmavý overlay; navbar je absolute overlay
// nad tímto hero (žádný spacer). Centrovaný serif italic tagline + subtitle
// + taupe filled CTA. Inspirováno celebratesalon.cz "We only live once" hero.
// ─────────────────────────────────────────────────────────────────────────────
function HeroNails02({
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
  const TAUPE = "#d4a080";
  const LIGHT = "#ffffff";

  const tagline   = String(content.tagline   ?? "Elegance, která začíná u detailu.");
  const subtitle  = String(content.subtitle  ?? "Prémiové nehtové studio v srdci Prahy. Manikúra, pedikúra a originální nail design.");
  const bgImage   = String(content.bgImage   ?? "https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=2400&q=80");
  const ctaText   = String(content.ctaText   ?? "Objednat se");
  const ctaHref   = String(content.ctaHref   ?? "#kontakt");
  const _nails02Focus = content.__heroBgFocus as { x: number; y: number } | undefined;
  const bgFocusStyle  = _nails02Focus ? `${_nails02Focus.x}% ${_nails02Focus.y}%` : undefined;
  const _nails02FocusMobile = content.__heroBgFocusMobile as { x: number; y: number } | undefined;
  const bgFocusMobileStyle  = _nails02FocusMobile ? `${_nails02FocusMobile.x}% ${_nails02FocusMobile.y}%` : undefined;

  return (
    <section
      data-section-type="hero"
      data-variant="nails-02-hero"
      style={{
        position: "relative",
        width: "100%",
        minHeight: "100vh",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        // navbar (absolute) ramps over the top of this hero
      }}
    >
      <BackgroundEditableImage sectionId={sectionId} src={bgImage} priority={true} isAdmin={isAdmin} focusStyle={bgFocusStyle} focusMobileStyle={bgFocusMobileStyle} />
      {/* Dark gradient overlay — bottom-heavy for text contrast */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 10,
          background: "linear-gradient(180deg, rgba(20,12,10,0.55) 0%, rgba(20,12,10,0.35) 45%, rgba(20,12,10,0.7) 100%)",
        }}
      />
      <div
        style={{
          position: "relative",
          zIndex: 20,
          maxWidth: 980,
          width: "100%",
          padding: "120px 24px 80px",
          textAlign: "center",
          color: LIGHT,
        }}
      >
        <h1
          style={{
            fontFamily: "'Cormorant Garamond', 'Playfair Display', Georgia, serif",
            fontStyle: "italic",
            fontWeight: 500,
            fontSize: "clamp(2.6rem, 6.5vw, 5.4rem)",
            lineHeight: 1.1,
            letterSpacing: "-0.005em",
            margin: 0,
            color: LIGHT,
            textShadow: "0 2px 24px rgba(0,0,0,0.35)",
          }}
        >
          <GenericEditableText sectionId={sectionId} field="tagline" value={tagline} tag="span" />
        </h1>
        <p
          style={{
            marginTop: 28,
            fontFamily: "'Poppins', 'Helvetica Neue', Arial, sans-serif",
            fontSize: "clamp(0.98rem, 1.4vw, 1.15rem)",
            fontWeight: 300,
            lineHeight: 1.6,
            color: "rgba(255,255,255,0.88)",
            maxWidth: 620,
            margin: "28px auto 0",
            letterSpacing: "0.02em",
          }}
        >
          <GenericEditableText sectionId={sectionId} field="subtitle" value={subtitle} tag="span" />
        </p>
        <a
          href={resolveDemoHref(ctaHref, tenantSlug, isAdmin)}
          data-btn="primary"
          style={{
            display: "inline-flex",
            marginTop: 44,
            padding: "16px 44px",
            backgroundColor: TAUPE,
            color: LIGHT,
            fontFamily: "'Poppins', 'Helvetica Neue', Arial, sans-serif",
            fontSize: "0.98rem",
            fontWeight: 500,
            letterSpacing: "0.03em",
            textDecoration: "none",
            borderRadius: 999,
            transition: "background 0.2s, transform 0.2s",
          }}
          onMouseEnter={e => { e.currentTarget.style.backgroundColor = "#c08e6e"; e.currentTarget.style.transform = "translateY(-1px)"; }}
          onMouseLeave={e => { e.currentTarget.style.backgroundColor = TAUPE; e.currentTarget.style.transform = "translateY(0)"; }}
        >
          <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
        </a>
      </div>
    </section>
  );
}

// ── clinic-03-hero ────────────────────────────────────────────────────────────
// Fullbleed 100vh slider — 5 slides, autohraj 5s, fade-in/out, šipky + tečky
// Styl dle yesvisage.cz: tmavý overlay, bílý serif H1, gold CTA
// ─────────────────────────────────────────────────────────────────────────────
function HeroClinic03({ content, sectionId, tenantSlug, isAdmin }: Omit<Props, "variant">) {
  const GOLD   = "#97855F";
  const GOLD_H = "#82734f";
  const WHITE  = "#ffffff";
  const SERIF  = "'Cormorant Garamond', Georgia, serif";
  const SANS   = "'DM Sans', Arial, sans-serif";

  const ctaHref = String((content as Record<string,unknown>).ctaHref ?? "#sluzby");
  const scrollLabel = String((content as Record<string,unknown>).scrollLabel ?? "Více");

  type Slide = { kicker?: string; title?: string; sub?: string; cta?: string; bg?: string; overlay?: string };
  const rawSlides = ((content as Record<string,unknown>).slides as Slide[]) ?? [];
  const slides = rawSlides.length > 0 ? rawSlides : [
    { kicker: "Nejoblíbenější procedura", title: "Řekni YES\nsvé proměně", sub: "Přední klinika estetické medicíny v Praze.", cta: "Zjistit více", bg: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=1600&q=80", overlay: "rgba(0,0,0,0.42)" },
  ];

  const [current, setCurrent] = useState(0);
  const [animKey, setAnimKey] = useState(0);
  const total = slides.length;

  function go(idx: number) {
    setCurrent((idx + total) % total);
    setAnimKey(k => k + 1);
  }

  useEffect(() => {
    const t = setTimeout(() => go(current + 1), 6000);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current]);

  const resolve = (href: string) => resolveDemoHref(href, tenantSlug, isAdmin);
  const slide = slides[current];
  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <section
      id="hero"
      data-template="clinic-03"
      style={{
        position: "relative",
        width: "100%",
        height: "calc(100vh - 76px)",
        minHeight: 520,
        overflow: "hidden",
        backgroundColor: "#111",
      }}
    >
      {/* Slides — crossfade with subtle zoom */}
      {slides.map((s, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: `url('${s.bg}')`,
            backgroundSize: "cover",
            backgroundPosition: "center 30%",
            opacity: i === current ? 1 : 0,
            transform: i === current ? "scale(1.03)" : "scale(1)",
            transition: "opacity 1.1s ease, transform 6s ease-out",
            pointerEvents: "none",
          }}
        />
      ))}

      {/* Gradient overlay — darker bottom for readability */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          background: `linear-gradient(165deg, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0.45) 50%, rgba(0,0,0,0.62) 100%)`,
          pointerEvents: "none",
        }}
      />

      {/* Content — left-aligned */}
      <div
        key={animKey}
        style={{
          position: "relative",
          zIndex: 2,
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "center",
          padding: "0 clamp(28px, 7vw, 100px)",
          maxWidth: 720,
        }}
        className="c03-hero-content"
      >
        {/* Gold decorative line + Kicker */}
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
          <span aria-hidden style={{ display: "block", width: 32, height: 1, backgroundColor: GOLD }} />
          <GenericEditableText
            sectionId={sectionId}
            field={`slides.${current}.kicker`}
            value={slide.kicker ?? ""}
            tag="span"
            style={{
              fontFamily: SANS,
              fontSize: "0.68rem",
              fontWeight: 500,
              color: WHITE,
              letterSpacing: "0.24em",
              textTransform: "uppercase",
              opacity: 0.75,
            }}
          />
        </div>

        {/* Title — Cormorant Garamond italic */}
        <h1 style={{
          fontFamily: SERIF,
          fontSize: "clamp(2.4rem, 5.5vw, 4.2rem)",
          fontWeight: 300,
          fontStyle: "italic",
          color: WHITE,
          lineHeight: 1.15,
          margin: "0 0 24px",
          whiteSpace: "pre-line",
        }}>
          <GenericEditableText sectionId={sectionId} field={`slides.${current}.title`} value={slide.title ?? ""} tag="span" />
        </h1>

        {/* Subtitle */}
        <p style={{
          fontFamily: SANS,
          fontSize: "clamp(0.88rem, 1.1vw, 1rem)",
          fontWeight: 400,
          color: WHITE,
          lineHeight: 1.7,
          margin: "0 0 40px",
          maxWidth: 500,
          opacity: 0.8,
        }}>
          <GenericEditableText sectionId={sectionId} field={`slides.${current}.sub`} value={slide.sub ?? ""} tag="span" />
        </p>

        {/* CTA */}
        <a
          href={resolve(ctaHref)}
          className="c03-hero-cta"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 10,
            padding: "14px 36px",
            backgroundColor: GOLD,
            color: WHITE,
            fontFamily: SANS,
            fontSize: "0.7rem",
            fontWeight: 600,
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            textDecoration: "none",
            transition: "background-color 0.3s ease, transform 0.3s ease",
          }}
          onMouseEnter={e => {
            e.currentTarget.style.backgroundColor = GOLD_H;
            e.currentTarget.style.transform = "translateY(-2px)";
          }}
          onMouseLeave={e => {
            e.currentTarget.style.backgroundColor = GOLD;
            e.currentTarget.style.transform = "translateY(0)";
          }}
        >
          <GenericEditableText sectionId={sectionId} field={`slides.${current}.cta`} value={slide.cta ?? "Zjistit více"} tag="span" />
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
          </svg>
        </a>
      </div>

      {/* Slide counter — bottom left "01 / 05" */}
      <div style={{
        position: "absolute",
        bottom: 36,
        left: "clamp(28px, 7vw, 100px)",
        zIndex: 3,
        display: "flex",
        alignItems: "center",
        gap: 6,
      }}>
        <span style={{
          fontFamily: SANS,
          fontSize: "0.82rem",
          fontWeight: 600,
          color: WHITE,
          letterSpacing: "0.06em",
        }}>{pad(current + 1)}</span>
        <span style={{
          display: "inline-block",
          width: 28,
          height: 1,
          backgroundColor: "rgba(255,255,255,0.35)",
          position: "relative",
          overflow: "hidden",
        }}>
          <span
            key={`bar-${current}`}
            style={{
              position: "absolute",
              top: 0, left: 0, bottom: 0,
              backgroundColor: GOLD,
              animation: "c03Progress 6s linear both",
            }}
          />
        </span>
        <span style={{
          fontFamily: SANS,
          fontSize: "0.72rem",
          fontWeight: 400,
          color: "rgba(255,255,255,0.5)",
          letterSpacing: "0.06em",
        }}>{pad(total)}</span>

        {/* Prev/Next arrows */}
        <div style={{ display: "flex", gap: 4, marginLeft: 16 }}>
          <button
            onClick={() => go(current - 1)}
            aria-label="Předchozí"
            style={{
              width: 32, height: 32,
              display: "flex", alignItems: "center", justifyContent: "center",
              background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.2)",
              color: WHITE,
              cursor: "pointer",
              transition: "background 0.2s, border-color 0.2s",
              padding: 0,
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = "rgba(151,133,95,0.3)";
              e.currentTarget.style.borderColor = `${GOLD}66`;
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = "rgba(255,255,255,0.08)";
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)";
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <button
            onClick={() => go(current + 1)}
            aria-label="Další"
            style={{
              width: 32, height: 32,
              display: "flex", alignItems: "center", justifyContent: "center",
              background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.2)",
              color: WHITE,
              cursor: "pointer",
              transition: "background 0.2s, border-color 0.2s",
              padding: 0,
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = "rgba(151,133,95,0.3)";
              e.currentTarget.style.borderColor = `${GOLD}66`;
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = "rgba(255,255,255,0.08)";
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)";
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>
      </div>

      {/* Scroll indicator — bottom right */}
      <div className="c03-scroll-hint" style={{
        position: "absolute",
        bottom: 36,
        right: "clamp(28px, 7vw, 56px)",
        zIndex: 3,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 8,
      }}>
        <GenericEditableText
          sectionId={sectionId}
          field="scrollLabel"
          value={scrollLabel}
          tag="span"
          style={{
            fontFamily: SANS,
            fontSize: "0.58rem",
            fontWeight: 500,
            color: "rgba(255,255,255,0.55)",
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            writingMode: "vertical-rl",
          }}
        />
        <span style={{
          display: "block",
          width: 1,
          height: 32,
          backgroundColor: "rgba(255,255,255,0.25)",
          position: "relative",
          overflow: "hidden",
        }}>
          <span style={{
            position: "absolute",
            top: 0, left: 0, right: 0,
            height: "50%",
            backgroundColor: GOLD,
            animation: "c03ScrollPulse 2s ease-in-out infinite",
          }} />
        </span>
      </div>
    </section>
  );
}

// ── clinic-02-hero ────────────────────────────────────────────────────────────
// Premium editorial hero: fullbleed photo right, white/soft-gradient text plane
// left. Navy primary CTA (matches sections below), outline navy secondary,
// serif italic H1 accent word, amber decorative hairline, elegant trust bar
// with vertical dividers.
// ─────────────────────────────────────────────────────────────────────────────
function HeroClinic02({ content, sectionId, tenantSlug, isAdmin }: Omit<Props, "variant">) {
  const NAVY   = "#0F203E";
  const NAVY_D = "#081428";
  const AMBER  = "#ffa60b";
  const WHITE  = "#FFFFFF";
  const MUTED  = "#606266";
  const FONT_H = "'Poppins', Arial, sans-serif";
  const FONT_B = "'Open Sans', 'Poppins', Arial, sans-serif";
  const FONT_S = "'Cormorant Garamond', 'Playfair Display', Georgia, serif";

  const kicker     = String((content as Record<string,unknown>).kicker    ?? "Klinika doporučená dermatology · 18. rok na trhu");
  const title      = String((content as Record<string,unknown>).title     ?? "Přirozená krása v rukou špičkových lékařů");
  const accentWord = String((content as Record<string,unknown>).accentWord ?? "krása");
  const tagline    = String((content as Record<string,unknown>).tagline   ?? "Zvýrazněte svůj osobitý charakter a každý den se probouzejte s pocitem, že vypadáte přesně tak, jak se cítíte.");
  const ctaText    = String((content as Record<string,unknown>).ctaText   ?? "Online rezervace");
  const ctaHref    = String((content as Record<string,unknown>).ctaHref   ?? "/kontakt");
  const ctaSecText = String((content as Record<string,unknown>).ctaSecondaryText ?? "Konzultace zdarma");
  const ctaSecHref = String((content as Record<string,unknown>).ctaSecondaryHref ?? "/kontakt");
  const bgImage    = String((content as Record<string,unknown>).bgImage   ?? "/images/clinic-02/hero.webp");
  const trustItems = Array.isArray((content as Record<string,unknown>).trust)
    ? ((content as Record<string,unknown>).trust as string[])
    : ["5,0 ★ Google · 482 recenzí", "18 000+ spokojených klientek", "Certifikované preparáty Allergan"];

  function resolveDemoHref(href: string, slug?: string, admin?: boolean) {
    if (!href.startsWith("#") || !slug) return href;
    const base = admin ? `/demo/${slug}/admin` : `/demo/${slug}`;
    return `${base}${href}`;
  }

  // Highlight the accent word inside the title with serif italic + amber underline
  const renderTitle = () => {
    if (!accentWord || !title.toLowerCase().includes(accentWord.toLowerCase())) return title;
    const idx = title.toLowerCase().indexOf(accentWord.toLowerCase());
    const before = title.slice(0, idx);
    const match = title.slice(idx, idx + accentWord.length);
    const after = title.slice(idx + accentWord.length);
    return (<>
      {before}
      <span style={{
        fontFamily: FONT_S,
        fontStyle: "italic",
        fontWeight: 500,
        color: NAVY,
        position: "relative",
        display: "inline-block",
        padding: "0 0.06em",
      }}>
        {match}
        <span aria-hidden style={{
          position: "absolute",
          left: 0, right: 0, bottom: "0.03em",
          height: "0.14em",
          background: `linear-gradient(90deg, ${AMBER}, ${AMBER}00)`,
          borderRadius: 2,
        }} />
      </span>
      {after}
    </>);
  };

  return (
    <section
      id="uvod-clinic02"
      data-template="clinic-02"
      style={{
        position: "relative",
        width: "100%",
        minHeight: "clamp(620px, 82vh, 820px)",
        overflow: "hidden",
        fontFamily: FONT_B,
        backgroundImage: `url('${bgImage}')`,
        backgroundSize: "cover",
        backgroundPosition: "70% center",
        backgroundRepeat: "no-repeat",
        backgroundColor: WHITE,
        display: "flex",
        alignItems: "center",
      }}
    >
      {/* Soft white gradient — legible left, photo visible right */}
      <div aria-hidden style={{
        position: "absolute", inset: 0,
        background: "linear-gradient(to right, rgba(255,255,255,0.98) 0%, rgba(255,255,255,0.94) 34%, rgba(255,255,255,0.65) 54%, rgba(255,255,255,0.1) 74%, rgba(255,255,255,0) 100%)",
        pointerEvents: "none",
      }} />

      {/* Fine amber vertical hairline decoration */}
      <div aria-hidden className="c02h-hairline" style={{
        position: "absolute",
        left: "clamp(20px, 5.5vw, 74px)",
        top: "50%", transform: "translateY(-50%)",
        width: 1, height: "clamp(180px, 30vh, 260px)",
        background: `linear-gradient(180deg, ${AMBER}00 0%, ${AMBER} 45%, ${AMBER} 55%, ${AMBER}00 100%)`,
        opacity: 0.7,
        zIndex: 1,
      }} />

      {/* Content wrapper */}
      <div
        className="clinic02-hero-text"
        style={{
          position: "relative",
          zIndex: 2,
          width: "100%",
          maxWidth: 1320,
          margin: "0 auto",
          padding: "clamp(68px, 8vw, 110px) clamp(28px, 6vw, 88px) clamp(68px, 8vw, 110px) clamp(50px, 8vw, 118px)",
        }}
      >
        <div style={{ maxWidth: 680 }}>
          {/* Kicker */}
          <div style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 12,
            color: NAVY,
            padding: "6px 0",
            fontFamily: FONT_B,
            fontSize: "0.76rem",
            fontWeight: 600,
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            marginBottom: 30,
          }}>
            <span style={{ width: 28, height: 1, background: AMBER, display: "inline-block" }} />
            <GenericEditableText sectionId={sectionId} field="kicker" value={kicker} tag="span" />
          </div>

          {/* H1 — sans + italic serif accent */}
          <h1
            className="c02h-title"
            style={{
              fontFamily: FONT_H,
              fontSize: "clamp(2.4rem, 5.2vw, 4.4rem)",
              fontWeight: 600,
              color: NAVY,
              lineHeight: 1.06,
              letterSpacing: "-0.015em",
              margin: 0,
              marginBottom: 26,
            }}
          >
            <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span">
              {renderTitle()}
            </GenericEditableText>
          </h1>

          {/* Tagline */}
          <p style={{
            fontFamily: FONT_B,
            fontSize: "clamp(1.02rem, 1.35vw, 1.22rem)",
            color: MUTED,
            lineHeight: 1.7,
            margin: 0,
            marginBottom: 44,
            maxWidth: 580,
            fontWeight: 400,
          }}>
            <GenericEditableText sectionId={sectionId} field="tagline" value={tagline} tag="span" />
          </p>

          {/* CTAs — NAVY primary + navy outline secondary */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 16, marginBottom: 52 }}>
            <a
              href={resolveDemoHref(ctaHref, tenantSlug, isAdmin)}
              className="c02h-cta-primary"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 12,
                backgroundColor: NAVY,
                color: WHITE,
                textDecoration: "none",
                fontFamily: FONT_B,
                fontSize: "0.88rem",
                fontWeight: 700,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                padding: "18px 34px",
                borderRadius: 999,
                boxShadow: "0 10px 28px -8px rgba(15,32,62,0.5)",
                transition: "transform .25s ease, box-shadow .25s ease, background-color .25s ease",
              }}
            >
              <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden style={{ transition: "transform .25s ease" }}>
                <line x1="5" y1="12" x2="19" y2="12"/><polyline points="13 5 20 12 13 19"/>
              </svg>
            </a>

            <a
              href={resolveDemoHref(ctaSecHref, tenantSlug, isAdmin)}
              className="c02h-cta-secondary"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 10,
                backgroundColor: "transparent",
                color: NAVY,
                border: `1.5px solid ${NAVY}30`,
                textDecoration: "none",
                fontFamily: FONT_B,
                fontSize: "0.88rem",
                fontWeight: 600,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                padding: "16.5px 30px",
                borderRadius: 999,
                transition: "background-color .25s ease, color .25s ease, border-color .25s ease",
              }}
            >
              <GenericEditableText sectionId={sectionId} field="ctaSecondaryText" value={ctaSecText} tag="span" />
            </a>
          </div>

          {/* Trust strip — elegant with vertical dividers */}
          {trustItems.length > 0 && (
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                gap: "clamp(14px, 2vw, 24px)",
                paddingTop: 30,
                borderTop: `1px solid rgba(15,32,62,0.12)`,
                maxWidth: 640,
              }}
            >
              {trustItems.map((item, i) => (
                <React.Fragment key={`c02-trust-${i}`}>
                  {i > 0 && <span aria-hidden style={{ width: 1, height: 18, background: `${NAVY}22` }} className="c02h-tsep" />}
                  <div style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 9,
                    fontFamily: FONT_B,
                    fontSize: "0.82rem",
                    fontWeight: 600,
                    color: NAVY,
                    letterSpacing: "0.02em",
                  }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={AMBER} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                    {item}
                  </div>
                </React.Fragment>
              ))}
            </div>
          )}
        </div>
      </div>

      <style>{`
        .c02h-cta-primary:hover {
          transform: translateY(-2px);
          background-color: ${NAVY_D} !important;
          box-shadow: 0 16px 34px -8px rgba(15,32,62,0.6);
        }
        .c02h-cta-primary:hover svg { transform: translateX(3px); }
        .c02h-cta-secondary:hover {
          background-color: ${NAVY} !important;
          color: ${WHITE} !important;
          border-color: ${NAVY} !important;
        }
        @media (max-width: 900px) {
          #uvod-clinic02 { background-position: 82% center !important; min-height: clamp(560px, 90vh, 780px) !important; }
          #uvod-clinic02 .clinic02-hero-text { padding: 90px 22px 60px !important; }
          .c02h-hairline { display: none !important; }
          .c02h-tsep { display: none !important; }
        }
      `}</style>
    </section>
  );
}

// ── clinic-02-page-banner ─────────────────────────────────────────────────────
// Slim subpage banner: navy gradient bg, breadcrumb + H1 + decorative amber
// hairline (~320-400px). Used on /sluzby, /o-nas, /kontakt etc.
function HeroClinic02PageBanner({ content, sectionId, tenantSlug, isAdmin }: Omit<Props, "variant">) {
  const NAVY   = "#0F203E";
  const NAVY_D = "#0a172e";
  const AMBER  = "#ffa60b";
  const CREAM  = "#fffaf2";
  const FONT_H = "'Poppins', Arial, sans-serif";
  const FONT_B = "'Open Sans', Arial, sans-serif";

  const c = content as Record<string, unknown>;
  const title          = String(c.title          ?? "Stránka");
  const subtitle       = String(c.subtitle       ?? "");
  const breadcrumb     = String(c.breadcrumb     ?? "Domů");
  const breadcrumbHref = String(c.breadcrumbHref ?? "/");

  function resolveLink(href: string) {
    if (!tenantSlug || !href.startsWith("/")) return href;
    return `/demo/${tenantSlug}${isAdmin ? "/admin" : ""}${href}`;
  }

  return (
    <section
      data-template="clinic-02"
      style={{
        position: "relative",
        background: `linear-gradient(180deg, ${NAVY} 0%, ${NAVY_D} 100%)`,
        minHeight: "clamp(280px, 38vh, 360px)",
        overflow: "hidden",
      }}
    >
      {/* Amber radial accent */}
      <div aria-hidden style={{
        position: "absolute", top: "-180px", right: "-140px",
        width: 420, height: 420, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(255,166,11,0.18) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />
      <div aria-hidden style={{
        position: "absolute", bottom: "-200px", left: "-160px",
        width: 480, height: 480, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(255,166,11,0.10) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />

      {/* Top + bottom amber hairlines */}
      <div aria-hidden style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: "linear-gradient(90deg, transparent, rgba(255,166,11,0.45) 50%, transparent)" }} />
      <div aria-hidden style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 1, background: "linear-gradient(90deg, transparent, rgba(255,166,11,0.45) 50%, transparent)" }} />

      <div style={{
        position: "relative",
        maxWidth: 1280,
        margin: "0 auto",
        padding: "clamp(64px,8vw,96px) clamp(24px,5vw,60px)",
        textAlign: "center",
      }}>
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" style={{
          display: "inline-flex", alignItems: "center", gap: 10,
          fontFamily: FONT_B, fontSize: "0.74rem", fontWeight: 700,
          letterSpacing: "0.22em", textTransform: "uppercase",
          color: "rgba(255,250,242,0.55)", marginBottom: 22,
        }}>
          <a
            href={resolveLink(breadcrumbHref)}
            className="c02-banner-crumb"
            style={{ color: AMBER, textDecoration: "none", transition: "opacity .2s" }}
          >
            <GenericEditableText sectionId={sectionId} field="breadcrumb" value={breadcrumb} tag="span" />
          </a>
          <span aria-hidden style={{ color: "rgba(255,166,11,0.7)" }}>/</span>
          <span style={{ color: CREAM }}>
            <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
          </span>
        </nav>

        {/* H1 */}
        <h1 style={{
          fontFamily: FONT_H,
          fontSize: "clamp(2.2rem, 4.6vw, 3.6rem)",
          fontWeight: 700,
          color: CREAM,
          lineHeight: 1.08,
          letterSpacing: "-0.01em",
          margin: 0,
        }}>
          <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
        </h1>

        {/* Optional subtitle */}
        {subtitle && (
          <p style={{
            fontFamily: FONT_B,
            fontSize: "clamp(0.96rem, 1.2vw, 1.08rem)",
            color: "rgba(255,250,242,0.72)",
            lineHeight: 1.65,
            margin: "20px auto 0",
            maxWidth: 620,
          }}>
            <GenericEditableText sectionId={sectionId} field="subtitle" value={subtitle} tag="span" />
          </p>
        )}

        {/* Decorative dot ornament */}
        <div style={{ display: "inline-flex", alignItems: "center", gap: 12, marginTop: 26 }}>
          <span aria-hidden style={{ width: 36, height: 1, background: AMBER }} />
          <span aria-hidden style={{ width: 6, height: 6, borderRadius: "50%", background: AMBER }} />
          <span aria-hidden style={{ width: 36, height: 1, background: AMBER }} />
        </div>
      </div>

      <style>{`
        .c02-banner-crumb:hover { opacity: 0.75; }
      `}</style>
    </section>
  );
}

// ── hero-fitness-02-fullwidth ─────────────────────────────────────────────────
// 100vh full-bleed hero — 1:1 fitnessvictory.cz
// Bg: cover foto + rgba(0,0,0,0.55) overlay
// Content: centrovaný Archivo Black uppercase H1 bílý + pink tagline + 2× CTA
// CTA primary: outlined pink #FF5500; secondary: outlined white
// ─────────────────────────────────────────────────────────────────────────────
function HeroFitness02({ content, sectionId, tenantSlug, isAdmin }: Omit<Props, "variant">) {
  const resolve = (href: string) => resolveDemoHref(href, tenantSlug, isAdmin);

  const title         = String(content.title         ?? "Moderní fitness centra v Praze");
  const tagline       = String(content.tagline       ?? "Nejsme pouze fitness. My jsme VICTORY!");
  const body          = String(content.body          ?? "");
  const ctaText       = String(content.ctaText       ?? "Skupinové lekce");
  const ctaHref       = String(content.ctaHref       ?? "#lekce");
  const ctaSecText    = String(content.ctaSecondaryText ?? "Akce a novinky");
  const ctaSecHref    = String(content.ctaSecondaryHref ?? "#o-nas");
  const image         = String(content.image         ?? "");
  const scrollLabel   = String(content.scrollLabel   ?? "Scroll");

  const ACCENT  = "#FF5500";
  const WHITE   = "#FFFFFF";
  const MUTED   = "#C3C3C3";
  const FONT    = "'Archivo Black', sans-serif";
  const BODY    = "'Montserrat', sans-serif";

  return (
    <section
      id="uvod"
      style={{
        position: "relative",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        backgroundColor: "#000",
      }}
      data-template="fitness-02"
      data-section="fitness-02-hero"
    >
      {/* Background image */}
      {image && (
        <GenericEditableImage sectionId={sectionId} field="image" src={image} alt="Hero pozadí" className="absolute inset-0" style={{ position: "absolute", inset: 0 }}>
          <div
            className="fitness02-hero-bg"
            style={{
              position: "absolute", inset: 0,
              backgroundImage: `url(${image})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
              transform: "scale(1.05)",
            }}
          />
        </GenericEditableImage>
      )}

      {/* Cinematic gradient overlay — darker at bottom for CTA contrast */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(180deg, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.45) 40%, rgba(0,0,0,0.75) 100%)",
        }}
      />

      {/* Subtle vignette — draws eye to center */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute", inset: 0,
          background: "radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.55) 100%)",
          pointerEvents: "none",
        }}
      />

      {/* Grain texture — cinematic film feel */}
      <div
        aria-hidden="true"
        className="fitness02-grain"
        style={{ position: "absolute", inset: 0, pointerEvents: "none", opacity: 0.06, mixBlendMode: "overlay" }}
      />

      {/* Content */}
      <div
        className="fitness02-hero-content"
        style={{
          position: "relative", zIndex: 10,
          textAlign: "center",
          padding: "0 24px",
          maxWidth: 1040,
          margin: "0 auto",
        }}
      >
        {/* Tagline / kicker — with orange hairline */}
        <div className="fitness02-hero-kicker" style={{ display: "inline-flex", alignItems: "center", gap: 16, marginBottom: 28, justifyContent: "center" }}>
          <span aria-hidden="true" style={{ display: "inline-block", width: 40, height: 2, background: ACCENT }} />
          <span style={{
            fontFamily: BODY,
            fontSize: 13,
            fontWeight: 600,
            letterSpacing: "0.24em",
            textTransform: "uppercase",
            color: ACCENT,
          }}>
            <GenericEditableText sectionId={sectionId} field="tagline" value={tagline} tag="span" />
          </span>
          <span aria-hidden="true" style={{ display: "inline-block", width: 40, height: 2, background: ACCENT }} />
        </div>

        {/* H1 */}
        <h1
          className="fitness02-hero-title"
          style={{
            fontFamily: FONT,
            fontSize: "clamp(44px, 8.2vw, 96px)",
            color: WHITE,
            textTransform: "uppercase",
            lineHeight: 1.05,
            margin: 0,
            marginBottom: 28,
            letterSpacing: "-0.015em",
            textShadow: "0 4px 40px rgba(0,0,0,0.5)",
          }}
        >
          <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
        </h1>

        {/* Body — cinematic subheading */}
        {body && (
          <p
            className="fitness02-hero-body"
            style={{
              fontFamily: BODY,
              fontSize: "clamp(15px, 1.15vw, 17px)",
              fontWeight: 400,
              lineHeight: 1.65,
              color: MUTED,
              maxWidth: 640,
              margin: "0 auto 44px",
              letterSpacing: "0.01em",
            }}
          >
            <GenericEditableText sectionId={sectionId} field="body" value={body} tag="span" />
          </p>
        )}
        {!body && <div style={{ height: 12 }} />}

        {/* CTA row */}
        <div className="fitness02-hero-ctas" style={{ display: "flex", gap: 20, justifyContent: "center", flexWrap: "wrap" }}>
          <a
            href={resolve(ctaHref)}
            data-btn="inverse"
            className="fitness02-cta fitness02-hero-cta-primary"
            style={{
              display: "inline-flex", alignItems: "center", gap: 12,
              background: "transparent", color: ACCENT,
              border: `2px solid ${ACCENT}`, borderRadius: 0,
              padding: "17px 40px",
              fontSize: 13, textDecoration: "none",
              letterSpacing: "0.2em", textTransform: "uppercase",
              fontFamily: FONT,
              transition: "background 0.35s cubic-bezier(0.22,0.61,0.36,1), color 0.35s cubic-bezier(0.22,0.61,0.36,1), transform 0.35s cubic-bezier(0.22,0.61,0.36,1), box-shadow 0.35s ease",
            }}
          >
            <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
            <svg className="fitness02-cta-arrow" width="14" height="10" viewBox="0 0 14 10" fill="none" aria-hidden="true" style={{ transition: "transform 0.35s cubic-bezier(0.22,0.61,0.36,1)" }}>
              <path d="M0 5H12M12 5L8 1M12 5L8 9" stroke="currentColor" strokeWidth="2" />
            </svg>
          </a>
          <a
            href={resolve(ctaSecHref)}
            className="fitness02-hero-cta-secondary"
            style={{
              display: "inline-flex", alignItems: "center",
              background: "transparent", color: WHITE,
              border: `2px solid ${WHITE}`, borderRadius: 0,
              padding: "17px 40px",
              fontSize: 13, textDecoration: "none",
              letterSpacing: "0.2em", textTransform: "uppercase",
              fontFamily: FONT,
              transition: "background 0.35s cubic-bezier(0.22,0.61,0.36,1), color 0.35s cubic-bezier(0.22,0.61,0.36,1), transform 0.35s cubic-bezier(0.22,0.61,0.36,1)",
            }}
          >
            <GenericEditableText sectionId={sectionId} field="ctaSecondaryText" value={ctaSecText} tag="span" />
          </a>
        </div>
      </div>

      {/* Scroll indicator */}
      <div
        aria-hidden="true"
        className="fitness02-hero-scroll"
        style={{
          position: "absolute", bottom: 32, left: "50%", transform: "translateX(-50%)",
          zIndex: 10,
          display: "flex", flexDirection: "column", alignItems: "center", gap: 14,
        }}
      >
        <span style={{
          fontFamily: FONT, fontSize: 10, letterSpacing: "0.32em", textTransform: "uppercase",
          color: MUTED,
        }}>{scrollLabel}</span>
        <span className="fitness02-hero-scroll-line" style={{ display: "block", width: 1, height: 56, background: `linear-gradient(180deg, transparent 0%, ${ACCENT} 100%)`, transformOrigin: "top center" }} />
      </div>
    </section>
  );
}

// ── hero-fitness-02-page ──────────────────────────────────────────────────────
// Slim banner (~360px) for subpages — breadcrumb + H1 + orange hairline rule
// Same DNA as homepage hero (black + orange + Archivo Black) but not fullscreen
// ─────────────────────────────────────────────────────────────────────────────
function HeroFitness02Page({ content, sectionId, tenantSlug, isAdmin }: Omit<Props, "variant">) {
  const resolveHref = (href: string) => {
    if (!href) return "/";
    if (href.startsWith("http") || href.startsWith("#")) return href;
    return tenantSlug ? `/demo/${tenantSlug}${href === "/" ? "" : href}` : href;
  };
  // Silence unused variable warning
  void isAdmin;

  const title           = String(content.title           ?? "");
  const breadcrumb      = String(content.breadcrumb      ?? "Domů");
  const breadcrumbHref  = String(content.breadcrumbHref  ?? "/");
  const eyebrow         = String(content.eyebrow         ?? "");
  const image           = String(content.image           ?? "");

  const ACCENT  = "#FF5500";
  const WHITE   = "#FFFFFF";
  const MUTED   = "#C3C3C3";
  const FONT    = "'Archivo Black', sans-serif";
  const BODY    = "'Montserrat', sans-serif";

  return (
    <section
      style={{
        position: "relative",
        minHeight: 360,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        backgroundColor: "#000",
        fontFamily: BODY,
      }}
      data-template="fitness-02"
      data-section="fitness-02-hero-page"
    >
      {/* Background image (optional, subtle) */}
      {image && (
        <GenericEditableImage sectionId={sectionId} field="image" src={image} alt="Banner pozadí" className="absolute inset-0" style={{ position: "absolute", inset: 0 }}>
          <div
            style={{
              position: "absolute", inset: 0,
              backgroundImage: `url(${image})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
              opacity: 0.35,
            }}
          />
        </GenericEditableImage>
      )}

      {/* Dark gradient overlay */}
      <div aria-hidden="true" style={{
        position: "absolute", inset: 0,
        background: "linear-gradient(180deg, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.9) 100%)",
      }} />

      {/* Grain */}
      <div aria-hidden="true" className="fitness02-grain" style={{ position: "absolute", inset: 0, pointerEvents: "none", opacity: 0.05, mixBlendMode: "overlay" }} />

      {/* Content */}
      <div
        className="fitness02-page-content"
        style={{
          position: "relative", zIndex: 10,
          textAlign: "center",
          padding: "80px 24px 60px",
          maxWidth: 900,
          margin: "0 auto",
        }}
      >
        {/* Breadcrumb */}
        <nav aria-label="Drobečková navigace" style={{ marginBottom: 20 }}>
          <ol style={{ display: "inline-flex", alignItems: "center", gap: 10, listStyle: "none", margin: 0, padding: 0 }}>
            <li>
              <a href={resolveHref(breadcrumbHref)} className="fitness02-page-crumb" style={{
                fontFamily: FONT, fontSize: 11, letterSpacing: "0.32em", textTransform: "uppercase",
                color: MUTED, textDecoration: "none",
                transition: "color 0.35s ease",
              }}>
                <GenericEditableText sectionId={sectionId} field="breadcrumb" value={breadcrumb} tag="span" />
              </a>
            </li>
            <li aria-hidden="true" style={{ display: "inline-flex", alignItems: "center" }}>
              <span style={{ width: 18, height: 1, background: ACCENT, display: "inline-block" }} />
            </li>
            <li>
              <span style={{
                fontFamily: FONT, fontSize: 11, letterSpacing: "0.32em", textTransform: "uppercase",
                color: ACCENT,
              }} aria-current="page">
                {title || " "}
              </span>
            </li>
          </ol>
        </nav>

        {/* Optional eyebrow with hairlines */}
        {eyebrow && (
          <div className="fitness02-page-kicker" style={{ display: "inline-flex", alignItems: "center", gap: 14, marginBottom: 18, justifyContent: "center" }}>
            <span aria-hidden="true" style={{ display: "inline-block", width: 28, height: 2, background: ACCENT }} />
            <span style={{
              fontFamily: BODY, fontSize: 12, letterSpacing: "0.24em",
              textTransform: "uppercase", color: ACCENT, fontWeight: 600,
            }}>
              <GenericEditableText sectionId={sectionId} field="eyebrow" value={eyebrow} tag="span" />
            </span>
            <span aria-hidden="true" style={{ display: "inline-block", width: 28, height: 2, background: ACCENT }} />
          </div>
        )}

        {/* H1 */}
        <h1
          className="fitness02-page-title"
          style={{
            fontFamily: FONT,
            fontSize: "clamp(36px, 5.5vw, 68px)",
            color: WHITE,
            textTransform: "uppercase",
            lineHeight: 1.05,
            margin: 0,
            letterSpacing: "-0.015em",
            textShadow: "0 4px 24px rgba(0,0,0,0.5)",
          }}
        >
          <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
        </h1>

        {/* Decorative orange rule */}
        <div
          aria-hidden="true"
          style={{
            width: 64, height: 3, background: ACCENT,
            margin: "28px auto 0",
          }}
        />
      </div>
    </section>
  );
}

// ── hero-fyzio-01-fullbleed ───────────────────────────────────────────────────
// 2-col hero: navy bg, text vlevo, foto vpravo s clip-path šikminou
// H1 bílý Montserrat + zelený CTA + outline secondary
// Inspirováno fyziovsem.cz homepage hero
// ─────────────────────────────────────────────────────────────────────────────
function HeroFyzio01({ content, sectionId, tenantSlug, isAdmin }: Omit<Props, "variant">) {
  const c = content as Record<string, unknown>;

  const title       = String(c.title       ?? "Fyzioterapie\nv centru Prahy");
  const tagline     = String(c.tagline     ?? "Pomáháme lidem ke kvalitnějšímu životu");
  const body        = String(c.body        ?? "");
  const ctaText     = String(c.ctaText     ?? "Jak na první návštěvu");
  const ctaHref     = String(c.ctaHref     ?? "#kontakt");
  const ctaSecText  = String(c.ctaSecondaryText ?? "Naše služby");
  const ctaSecHref  = String(c.ctaSecondaryHref ?? "#sluzby");
  const image       = String(c.image       ?? "/clones/fyziovsem/wp-content/uploads/2024/10/DSC03515-1.jpg");

  const NAVY  = "#1f2d69";
  const GREEN = "#10d15d";
  const WHITE = "#ffffff";
  const MONT  = "'Montserrat', sans-serif";
  const SANS  = "'Open Sans', sans-serif";

  const resolve = (href: string) => resolveDemoHref(href, tenantSlug, isAdmin);

  const titleLines = title.split("\n");

  return (
    <section
      id="uvod"
      data-template="fyzio-01"
      style={{ backgroundColor: NAVY, overflow: "hidden", position: "relative", fontFamily: SANS, minHeight: "clamp(480px, 58vw, 660px)", display: "flex", alignItems: "center" }}
    >
      {/* ── Obrázek — přímo v section, fullbleed vpravo ── */}
      <div className="fyzio01-hero-img" style={{
        position: "absolute",
        top: 0,
        right: 0,
        bottom: 0,
        width: "55%",
        overflow: "hidden",
      }}>
        <GenericEditableImage
          sectionId={sectionId}
          field="image"
          src={image}
          alt="Fyzioterapie"
          className="absolute inset-0 w-full h-full"
        >
          <Image
            src={image}
            alt="Fyzioterapie"
            fill
            priority
            className="object-cover object-top"
            unoptimized={shouldSkipNextImageOptimization(image)}
          />
        </GenericEditableImage>

        {/* Gradient — plný navy vlevo od zelené čáry, ostrý přechod těsně za ní */}
        <div style={{
          position: "absolute",
          inset: 0,
          background: `linear-gradient(to right, ${NAVY} 0%, ${NAVY} 17%, rgba(31,45,105,0.15) 22%, transparent 32%)`,
          pointerEvents: "none",
        }} aria-hidden="true" />

      </div>

      {/* ── Textový obsah ── */}
      <div style={{
        maxWidth: 1280,
        margin: "0 auto",
        padding: "0 32px",
        width: "100%",
        position: "relative",
        zIndex: 2,
      }}>
        {/* ── Levý textový sloupec ── */}
        <div className="fyzio01-hero-text" style={{
          flex: "0 0 50%",
          maxWidth: 540,
          paddingBlock: "clamp(48px, 6vw, 80px)",
        }}>
          {/* Zelená linka / kicker */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
            <span style={{ width: 32, height: 3, backgroundColor: GREEN, borderRadius: 2, display: "inline-block" }} />
            <span style={{ fontFamily: MONT, fontSize: 11, fontWeight: 700, color: GREEN, letterSpacing: "0.18em", textTransform: "uppercase" }}>
              Fyzioterapie Praha
            </span>
          </div>

          {/* H1 */}
          <h1 style={{
            fontFamily: MONT,
            fontSize: "clamp(36px, 4.5vw, 58px)",
            fontWeight: 800,
            color: WHITE,
            lineHeight: 1.1,
            margin: 0,
            marginBottom: 20,
            letterSpacing: "-0.01em",
          }}>
            {titleLines.map((line, i) => (
              <span key={i} style={{ display: "block" }}>
                <GenericEditableText sectionId={sectionId} field={`title_line_${i}`} value={line} tag="span" />
              </span>
            ))}
          </h1>

          {/* Tagline — kurzíva */}
          <p style={{
            fontFamily: SANS,
            fontSize: "clamp(15px, 1.4vw, 18px)",
            fontStyle: "italic",
            color: "rgba(255,255,255,0.82)",
            lineHeight: 1.55,
            margin: 0,
            marginBottom: 16,
          }}>
            <GenericEditableText sectionId={sectionId} field="tagline" value={`"${tagline}"`} tag="span" />
          </p>

          {/* Body text */}
          {body && (
            <p style={{
              fontFamily: SANS,
              fontSize: "clamp(13px, 1.1vw, 15px)",
              color: "rgba(255,255,255,0.68)",
              lineHeight: 1.7,
              margin: 0,
              marginBottom: 36,
              maxWidth: 460,
            }}>
              <GenericEditableText sectionId={sectionId} field="body" value={body} tag="span" />
            </p>
          )}

          {/* CTA tlačítka */}
          <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
            <a
              href={resolve(ctaHref)}
              data-btn="primary"
              style={{
                backgroundColor: GREEN,
                color: WHITE,
                fontFamily: MONT,
                fontSize: 14,
                fontWeight: 700,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                padding: "13px 32px",
                borderRadius: 3,
                textDecoration: "none",
                transition: "background 0.2s",
                whiteSpace: "nowrap",
              }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#0dbc4f")}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = GREEN)}
            >
              <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
            </a>

            <a
              href={resolve(ctaSecHref)}
              style={{
                border: `2px solid rgba(255,255,255,0.45)`,
                color: WHITE,
                fontFamily: MONT,
                fontSize: 14,
                fontWeight: 600,
                letterSpacing: "0.05em",
                padding: "11px 28px",
                borderRadius: 3,
                textDecoration: "none",
                transition: "border-color 0.2s, background 0.2s",
                whiteSpace: "nowrap",
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = WHITE; e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.1)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.45)"; e.currentTarget.style.backgroundColor = "transparent"; }}
            >
              <GenericEditableText sectionId={sectionId} field="ctaSecondaryText" value={ctaSecText} tag="span" />
            </a>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          #uvod[data-template="fyzio-01"] .fyzio01-hero-img {
            position: relative !important; width: 100% !important; height: 280px !important;
            top: auto !important; bottom: auto !important; right: auto !important; left: auto !important;
          }
          #uvod[data-template="fyzio-01"] .fyzio01-hero-text {
            max-width: 100% !important; padding-bottom: 32px !important;
          }
          #uvod[data-template="fyzio-01"] {
            flex-direction: column !important; min-height: auto !important;
          }
        }
      `}</style>
    </section>
  );
}

// ── hero-fyzio-02-split ───────────────────────────────────────────────────────
// Fullscreen hero: bg foto pokrývá 100vh, tmavý overlay, text vlevo dole
// Navbar (fixed) floatuje nad — hero začíná od top:0, bez spaceru
// Navy #1a2e4a + Gold #c9a84c — DM Serif Display + Plus Jakarta Sans
// 1:1 resetclinic.cz
// ─────────────────────────────────────────────────────────────────────────────
function HeroFyzio02({ content, sectionId, tenantSlug, isAdmin }: Omit<Props, "variant">) {
  const c = content as Record<string, unknown>;

  const title      = String(c.title      ?? "Resetujeme ochranné vzorce,\nkteré stojí za bolestí.");
  const tagline    = String(c.tagline    ?? "Fyzioterapie s funkční neurologií");
  const body       = String(c.body       ?? "Jsme tu pro ty, kterým běžná fyzioterapie nepomohla. Pracujeme s nervovým systémem, smyslovým vnímáním a uloženými vzorci napětí.");
  const ctaText    = String(c.ctaText    ?? "Rezervovat terapii");
  const ctaHref    = String(c.ctaHref    ?? "#rezervace");
  const ctaSecText = String(c.ctaSecondaryText ?? "Poznejte náš přístup");
  const ctaSecHref = String(c.ctaSecondaryHref ?? "#o-nas");
  const image      = String(c.image      ?? "/clones/resetclinic/67eae6b510b7940c86a01571_DSC01862.avif");

  const GOLD  = "#c9a84c";
  const WHITE = "#ffffff";
  const SERIF = "'DM Serif Display', serif";
  const SANS  = "'Plus Jakarta Sans', sans-serif";

  const resolve = (href: string) => resolveDemoHref(href, tenantSlug, isAdmin);

  return (
    <section
      id="uvod"
      data-template="fyzio-02"
      style={{ position: "relative", width: "100%", minHeight: "100vh", fontFamily: SANS, overflow: "hidden" }}
    >
      {/* Bg foto — plný viewport */}
      <GenericEditableImage
        sectionId={sectionId}
        field="image"
        src={image}
        alt={tagline}
        className="relative overflow-hidden"
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
      >
        <img
          src={image}
          alt={tagline}
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center top" }}
          onError={e => { (e.currentTarget as HTMLImageElement).style.backgroundColor = "#1a2e4a"; }}
        />
      </GenericEditableImage>

      {/* Tmavý overlay — gradient zdola nahoru jako na resetclinic.cz */}
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(10,20,36,0.82) 0%, rgba(10,20,36,0.45) 50%, rgba(10,20,36,0.15) 100%)" }} />

      {/* Obsah — zarovnaný doleva dole, jako resetclinic.cz */}
      <div style={{
        position: "relative",
        zIndex: 2,
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
        padding: "clamp(48px, 8vw, 100px) clamp(24px, 6%, 96px) clamp(64px, 8vw, 100px)",
        maxWidth: "min(860px, 100%)",
      }}>
        {/* Tagline */}
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
          <span style={{ width: 28, height: 2, backgroundColor: GOLD, display: "inline-block" }} />
          <span style={{ fontFamily: SANS, fontSize: 13, fontWeight: 600, color: GOLD, letterSpacing: "0.1em", textTransform: "uppercase" }}>
            <GenericEditableText sectionId={sectionId} field="tagline" value={tagline} tag="span" />
          </span>
        </div>

        {/* H1 */}
        <h1 style={{ fontFamily: SERIF, fontSize: "clamp(2.2rem, 4.5vw, 4rem)", fontWeight: 400, color: WHITE, lineHeight: 1.15, marginBottom: 24, whiteSpace: "pre-line" }}>
          <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
        </h1>

        {/* Perex */}
        <p style={{ fontFamily: SANS, fontSize: "clamp(0.95rem, 1.3vw, 1.05rem)", color: "rgba(255,255,255,0.78)", lineHeight: 1.75, marginBottom: 40, maxWidth: 560 }}>
          <GenericEditableText sectionId={sectionId} field="body" value={body} tag="span" />
        </p>

        {/* CTA tlačítka */}
        <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
          <a
            href={resolve(ctaHref)}
            data-btn="primary"
            style={{
              display: "inline-flex", alignItems: "center",
              backgroundColor: GOLD, color: WHITE,
              fontFamily: SANS, fontSize: "0.95rem", fontWeight: 600,
              padding: "0.9rem 2rem", borderRadius: "8px",
              textDecoration: "none", transition: "background 0.15s",
            }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#b8943d")}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = GOLD)}
          >
            <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
          </a>
          <a
            href={resolve(ctaSecHref)}
            style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              color: WHITE, fontFamily: SANS, fontSize: "0.95rem", fontWeight: 500,
              textDecoration: "none", padding: "0.9rem 0",
              borderBottom: `2px solid rgba(255,255,255,0.4)`,
              transition: "border-color 0.15s",
            }}
            onMouseEnter={e => (e.currentTarget.style.borderBottomColor = GOLD)}
            onMouseLeave={e => (e.currentTarget.style.borderBottomColor = "rgba(255,255,255,0.4)")}
          >
            <GenericEditableText sectionId={sectionId} field="ctaSecondaryText" value={ctaSecText} tag="span" />
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
            </svg>
          </a>
        </div>
      </div>

      {/* Zlatá svislá čára — dekorativní levý okraj jako na resetclinic.cz */}
      <div style={{ position: "absolute", left: 0, top: "20%", bottom: "20%", width: 3, backgroundColor: GOLD, zIndex: 2 }} />
    </section>
  );
}

// ── restaurant-01-hero ────────────────────────────────────────────────────────
// Fullscreen crossfade slider s Ken Burns zoom efektem — stejný styl jako ambi.cz
// 4 prémiové Unsplash food/restaurant fotky; auto-play 7s; amber dot nav dole
// Gradient overlay vlevo; cream serif H1 + amber linka + subtitle + červené CTA
// Navbar je fixed overlay — žádný spacer
// ─────────────────────────────────────────────────────────────────────────────
function HeroRestaurant01({ content, sectionId, tenantSlug, isAdmin }: Omit<Props, "variant">) {
  const title    = String(content.title    ?? "Místo, kde jídlo\nse stává zážitkem.");
  const subtitle = String(content.subtitle ?? "Měníme jídlo v zážitek a věříme, že tou nejlepší\ningrediencí naší práce je radost.");
  const ctaText  = String(content.ctaText  ?? "Rezervovat stůl");
  const ctaHref  = String(content.ctaHref  ?? "#kontakt");
  const ctaSecondaryText = String(content.ctaSecondaryText ?? "Prohlédnout menu");
  const ctaSecondaryHref = String(content.ctaSecondaryHref ?? "/menu");

  // 4 thematické Unsplash fotky — prémiová restaurace, maso, plating, interiér
  const DEFAULT_SLIDES = [
    {
      url: "https://images.unsplash.com/photo-1544025162-d76694265947?w=1920&h=1080&fit=crop&fm=webp&q=85",
      pos: "center 40%",
    },
    {
      url: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1920&h=1080&fit=crop&fm=webp&q=85",
      pos: "center center",
    },
    {
      url: "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=1920&h=1080&fit=crop&fm=webp&q=85",
      pos: "center 60%",
    },
    {
      url: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1920&h=1080&fit=crop&fm=webp&q=85",
      pos: "center center",
    },
  ];

  type Slide = { url: string; pos?: string };
  const rawSlides = content.slides as Slide[] | undefined;
  const slides: Slide[] = rawSlides?.length ? rawSlides : DEFAULT_SLIDES;

  const DARK  = "#1a0e0a";
  const CREAM = "#f5ede0";
  const AMBER = "#c8943f";
  const RED   = "#c0392b";
  const FONT  = "Georgia, 'Times New Roman', serif";
  const SANS  = "'Helvetica Neue', Helvetica, Arial, sans-serif";
  const INTERVAL = 7000;

  const [idx, setIdx] = useState(0);
  const count = slides.length;

  useEffect(() => {
    if (count <= 1) return;
    const t = setInterval(() => setIdx(i => (i + 1) % count), INTERVAL);
    return () => clearInterval(t);
  }, [count]);

  const resolve = (href: string) => resolveDemoHref(href, tenantSlug, isAdmin);

  return (
    <section style={{ position: "relative", width: "100%", height: "100svh", minHeight: 600, overflow: "hidden", backgroundColor: DARK }}>
      {/* Ken Burns CSS */}
      <style>{`
        @keyframes r01-kb {
          0%   { transform: scale(1)    translateX(0)   translateY(0); }
          100% { transform: scale(1.08) translateX(-1%) translateY(-1%); }
        }
        @keyframes r01-kb-rev {
          0%   { transform: scale(1)    translateX(0)   translateY(0); }
          100% { transform: scale(1.08) translateX(1%)  translateY(-1%); }
        }
        .r01-slide-active img { animation: r01-kb ${INTERVAL}ms ease-out forwards; }
        .r01-slide-active:nth-child(even) img { animation-name: r01-kb-rev; }
        @media(max-width:480px){
          .r01-hero-subtitle { white-space: normal !important; }
          .r01-hero-ctas { flex-direction: column !important; }
          .r01-hero-ctas a { text-align: center !important; }
        }
      `}</style>

      {/* Slides — crossfade */}
      {slides.map((sl, i) => (
        <div
          key={i}
          className={i === idx ? "r01-slide-active" : ""}
          style={{
            position: "absolute", inset: 0,
            opacity: i === idx ? 1 : 0,
            transition: "opacity 1.4s ease",
            zIndex: i === idx ? 1 : 0,
          }}
        >
          <GenericEditableImage sectionId={sectionId} field={`slides.${i}.url`} src={sl.url} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
            <img
              src={sl.url}
              alt=""
              aria-hidden
              style={{
                width: "100%", height: "100%",
                objectFit: "cover",
                objectPosition: sl.pos ?? "center",
                display: "block",
                willChange: "transform",
              }}
            />
          </GenericEditableImage>
        </div>
      ))}

      {/* Gradient overlay: tmavé vlevo + tmavé dole */}
      <div style={{
        position: "absolute", inset: 0, zIndex: 2,
        background: "linear-gradient(90deg, rgba(26,14,10,0.85) 0%, rgba(26,14,10,0.5) 55%, rgba(26,14,10,0.1) 100%)",
      }} />
      <div style={{
        position: "absolute", inset: 0, zIndex: 2,
        background: "linear-gradient(0deg, rgba(26,14,10,0.65) 0%, transparent 45%)",
      }} />

      {/* Obsah — vlevo, vertikálně centrovaný */}
      <div style={{
        position: "absolute", inset: 0, zIndex: 3,
        display: "flex", alignItems: "center",
        padding: "0 clamp(32px, 7vw, 100px)",
        paddingTop: 92,
      }}>
        <div style={{ maxWidth: 620 }}>
          <h1 style={{
            fontFamily: FONT,
            fontSize: "clamp(34px, 4.5vw, 66px)",
            fontWeight: 400,
            lineHeight: 1.15,
            color: CREAM,
            margin: "0 0 20px",
            whiteSpace: "pre-line",
            textShadow: "0 2px 20px rgba(0,0,0,0.3)",
          }}>
            <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
          </h1>

          {/* Amber linka */}
          <div style={{ width: 48, height: 1.5, backgroundColor: AMBER, marginBottom: 20 }} />

          {/* Subtitle */}
          <p className="r01-hero-subtitle" style={{
            fontFamily: SANS,
            fontSize: "clamp(13px, 1.5vw, 16px)",
            fontWeight: 300,
            lineHeight: 1.75,
            color: `${CREAM}cc`,
            margin: "0 0 36px",
            whiteSpace: "pre-line",
          }}>
            <GenericEditableText sectionId={sectionId} field="subtitle" value={subtitle} tag="span" />
          </p>

          {/* CTA */}
          <div className="r01-hero-ctas" style={{ display: "flex", flexWrap: "wrap", gap: 14 }}>
            <a
              href={resolve(ctaHref)}
              data-btn="primary"
              style={{
                fontFamily: SANS, fontSize: 11, fontWeight: 700, letterSpacing: "0.12em",
                textTransform: "uppercase", color: "#fff", textDecoration: "none",
                padding: "14px 32px", backgroundColor: RED, borderRadius: 3,
                transition: "background-color 0.2s", display: "inline-block",
              }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#a93226")}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = RED)}
            >
              <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
            </a>
            <a
              href={resolve(ctaSecondaryHref)}
              style={{
                fontFamily: SANS, fontSize: 11, fontWeight: 500, letterSpacing: "0.12em",
                textTransform: "uppercase", color: CREAM, textDecoration: "none",
                padding: "13px 32px", border: `1px solid ${CREAM}55`, borderRadius: 3,
                transition: "border-color 0.2s, color 0.2s", display: "inline-block",
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = CREAM; e.currentTarget.style.color = "#fff"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = `${CREAM}55`; e.currentTarget.style.color = CREAM; }}
            >
              <GenericEditableText sectionId={sectionId} field="ctaSecondaryText" value={ctaSecondaryText} tag="span" />
            </a>
          </div>
        </div>
      </div>

      {/* Dot navigace — amber, dole uprostřed */}
      {count > 1 && (
        <div style={{
          position: "absolute", bottom: 32, left: "50%", transform: "translateX(-50%)",
          zIndex: 4, display: "flex", gap: 10, alignItems: "center",
        }}>
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setIdx(i)}
              aria-label={`Slide ${i + 1}`}
              style={{
                width: i === idx ? 28 : 8,
                height: 2,
                backgroundColor: i === idx ? AMBER : `${CREAM}60`,
                border: "none", cursor: "pointer", padding: 0,
                transition: "width 0.4s ease, background-color 0.3s",
                borderRadius: 2,
              }}
            />
          ))}
        </div>
      )}

      {/* Číslo slidu — pravý dolní roh */}
      <div style={{
        position: "absolute", bottom: 28, right: "clamp(28px, 5vw, 60px)",
        zIndex: 4, display: "flex", alignItems: "center", gap: 10,
      }}>
        <span style={{ fontFamily: SANS, fontSize: 11, color: `${CREAM}80`, letterSpacing: "0.1em" }}>
          {String(idx + 1).padStart(2, "0")} / {String(count).padStart(2, "0")}
        </span>
      </div>
    </section>
  );
}

// ── restaurant-02-hero ────────────────────────────────────────────────────────
// Fullscreen statický hero — jeden obrázek, tmavý overlay, jen REZERVACE button
// Navbar se překrývá přes tento hero (position: fixed overlay, bez spaceru)
// Ref: restauracehybernska.cz — hpslider s .book tlačítkem
// ─────────────────────────────────────────────────────────────────────────────
function HeroRestaurant02({ content, sectionId, tenantSlug, isAdmin }: Omit<Props, "variant">) {
  const ctaText = String(content.ctaText ?? "Rezervovat stůl");
  const ctaHref = String(content.ctaHref ?? "#kontakt");

  type Slide = { url: string; pos?: string };
  const DEFAULT_IMAGE = "https://images.unsplash.com/photo-1544025162-d76694265947?w=1920&h=1080&fit=crop&fm=webp&q=85";
  const rawSlides = content.slides as Slide[] | undefined;
  const imgUrl = rawSlides?.[0]?.url ?? DEFAULT_IMAGE;
  const imgPos = rawSlides?.[0]?.pos ?? "center 40%";

  const WHITE   = "#ffffff";
  const RED     = "#c0392b";
  const POPPINS = "'Poppins', sans-serif";

  const resolve = (href: string) => resolveDemoHref(href, tenantSlug, isAdmin);

  return (
    <section style={{ position: "relative", width: "100%", height: "100svh", minHeight: 580, overflow: "hidden", backgroundColor: "#111" }}>
      {/* Pozadí — statický obrázek */}
      <GenericEditableImage sectionId={sectionId} field="slides.0.url" src={imgUrl} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
        <img
          src={imgUrl}
          alt=""
          aria-hidden
          style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: imgPos, display: "block" }}
        />
      </GenericEditableImage>

      {/* Tmavý overlay */}
      <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.52)" }} />

      {/* REZERVACE tlačítko — centrované */}
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <a
          href={resolve(ctaHref)}
          data-btn="inverse"
          style={{
            fontFamily: POPPINS,
            fontSize: 13,
            fontWeight: 700,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: WHITE,
            textDecoration: "none",
            padding: "15px 44px",
            border: "1px solid rgba(255,255,255,0.7)",
            backgroundColor: "transparent",
            transition: "background-color 0.25s, border-color 0.25s",
            display: "inline-block",
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLAnchorElement).style.backgroundColor = RED;
            (e.currentTarget as HTMLAnchorElement).style.borderColor = RED;
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLAnchorElement).style.backgroundColor = "transparent";
            (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(255,255,255,0.7)";
          }}
        >
          <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
        </a>
      </div>
    </section>
  );
}

// ── cafe-02-hero ─────────────────────────────────────────────────────────────
// Ref: cafesavoy.ambi.cz
// 100vh fullscreen crossfade slider; tmavý overlay
// Overlay navbar nad hero (bez spaceru — navbar je fixed)
// Centrovaný: serif H1 bílý + gold ornament linka + subtitle + 2× CTA
// Auto-play 6s; dot navigace dole uprostřed + šipka vpravo dole
// ─────────────────────────────────────────────────────────────────────────────
function HeroCafe02({ content, sectionId, tenantSlug, isAdmin }: Omit<Props, "variant">) {
  const c = content as Record<string, unknown>;
  const title    = String(c.title    ?? "Vídeňská elegance\nv srdci Prahy");
  const subtitle = String(c.subtitle ?? "Od rána až do pozdního odpoledne si užijte cvrkot vídeňské kavárny.");
  const ctaText  = String(c.ctaText  ?? "Zarezervovat stůl");
  const ctaHref  = String(c.ctaHref  ?? "/rezervace");
  const ctaSecondaryText = String(c.ctaSecondaryText ?? "Prohlédnout menu");
  const ctaSecondaryHref = String(c.ctaSecondaryHref ?? "/menu");

  type Slide = { url: string; pos?: string };
  const slides: Slide[] = Array.isArray(c.slides) ? (c.slides as Slide[]) : [
    { url: "https://images.unsplash.com/photo-1559925393-8be0ec4767c8?w=1920&h=1080&fit=crop&fm=webp&q=85", pos: "center 40%" },
    { url: "https://images.unsplash.com/photo-1445116572660-236099ec97a0?w=1920&h=1080&fit=crop&fm=webp&q=85", pos: "center center" },
    { url: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=1920&h=1080&fit=crop&fm=webp&q=85", pos: "center 35%" },
    { url: "https://images.unsplash.com/photo-1521017432531-fbd92d768814?w=1920&h=1080&fit=crop&fm=webp&q=85", pos: "center center" },
  ];

  const GOLD  = "#A89B67";
  const CREAM = "#F7F4EF";
  const SANS  = "'Helvetica Neue', Helvetica, Arial, sans-serif";
  const SERIF = "Georgia, 'Times New Roman', serif";

  const [idx, setIdx] = useState(0);
  const count = slides.length;

  useEffect(() => {
    const t = setInterval(() => setIdx(i => (i + 1) % count), 6000);
    return () => clearInterval(t);
  }, [count]);

  const resolve = (href: string) => resolveDemoHref(href, tenantSlug, isAdmin);

  return (
    <section style={{
      position: "relative", width: "100%", height: "100svh", minHeight: 600,
      overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      {/* Slides */}
      {slides.map((slide, i) => (
        <div key={i} style={{
          position: "absolute", inset: 0,
          opacity: i === idx ? 1 : 0,
          transition: "opacity 1.4s ease",
          zIndex: 1,
        }} aria-hidden={i !== idx}>
          <GenericEditableImage sectionId={sectionId} field={`slides.${i}.url`} src={slide.url} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
            <img
              src={slide.url}
              alt=""
              aria-hidden
              style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: slide.pos ?? "center center" }}
            />
          </GenericEditableImage>
        </div>
      ))}

      {/* Dark overlay */}
      <div style={{
        position: "absolute", inset: 0, zIndex: 2,
        background: "linear-gradient(to bottom, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.38) 60%, rgba(0,0,0,0.55) 100%)",
      }} aria-hidden />

      {/* Centrovaný obsah */}
      <div style={{
        position: "relative", zIndex: 3,
        textAlign: "center",
        padding: "0 clamp(24px, 6vw, 120px)",
        maxWidth: 860,
        display: "flex", flexDirection: "column", alignItems: "center",
      }}>
        {/* Gold ornament */}
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 28 }}>
          <div style={{ width: 48, height: 1, backgroundColor: GOLD }} />
          <span style={{
            fontFamily: SANS, fontSize: 11, fontWeight: 500,
            letterSpacing: "0.22em", textTransform: "uppercase", color: GOLD,
          }}>Kavárna · Praha</span>
          <div style={{ width: 48, height: 1, backgroundColor: GOLD }} />
        </div>

        {/* H1 */}
        <h1 style={{
          fontFamily: SERIF, fontWeight: 400,
          fontSize: "clamp(2.4rem, 6vw, 5rem)",
          lineHeight: 1.12, color: "#ffffff",
          margin: "0 0 24px", whiteSpace: "pre-line",
          textShadow: "0 2px 24px rgba(0,0,0,0.35)",
        }}>
          <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
        </h1>

        {/* Subtitle */}
        <p style={{
          fontFamily: SANS,
          fontSize: "clamp(0.95rem, 1.6vw, 1.15rem)",
          fontWeight: 300, lineHeight: 1.65,
          color: "rgba(255,255,255,0.82)",
          margin: "0 0 40px", maxWidth: 560,
        }}>
          <GenericEditableText sectionId={sectionId} field="subtitle" value={subtitle} tag="span" />
        </p>

        {/* CTA tlačítka */}
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap", justifyContent: "center" }}>
          <a
            href={resolve(ctaHref)}
            data-btn="primary"
            style={{
              fontFamily: SANS, fontSize: 12, fontWeight: 600,
              letterSpacing: "0.12em", textTransform: "uppercase",
              color: "#ffffff", textDecoration: "none",
              padding: "14px 34px", backgroundColor: GOLD,
              transition: "background-color 0.2s",
            }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#8A7E52")}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = GOLD)}
          >
            <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
          </a>
          <a
            href={resolve(ctaSecondaryHref)}
            style={{
              fontFamily: SANS, fontSize: 12, fontWeight: 600,
              letterSpacing: "0.12em", textTransform: "uppercase",
              color: "#ffffff", textDecoration: "none",
              padding: "14px 34px",
              border: "1px solid rgba(255,255,255,0.6)",
              transition: "border-color 0.2s, background-color 0.2s",
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "#fff"; e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.08)"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.6)"; e.currentTarget.style.backgroundColor = "transparent"; }}
          >
            <GenericEditableText sectionId={sectionId} field="ctaSecondaryText" value={ctaSecondaryText} tag="span" />
          </a>
        </div>
      </div>

      {/* Dot navigace — uprostřed dole */}
      <div style={{
        position: "absolute", bottom: 32, left: "50%", transform: "translateX(-50%)",
        zIndex: 4, display: "flex", gap: 8, alignItems: "center",
      }}>
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setIdx(i)}
            aria-label={`Slide ${i + 1}`}
            style={{
              width: i === idx ? 28 : 8, height: 2,
              backgroundColor: i === idx ? GOLD : `${CREAM}60`,
              border: "none", cursor: "pointer", padding: 0,
              transition: "width 0.4s ease, background-color 0.3s",
            }}
          />
        ))}
      </div>

      {/* Šipka dolů — vpravo dole */}
      <div style={{
        position: "absolute", bottom: 36, right: "clamp(28px, 5vw, 60px)", zIndex: 4,
      }}>
        <svg width="20" height="28" viewBox="0 0 20 28" fill="none">
          <line x1="10" y1="0" x2="10" y2="22" stroke="rgba(255,255,255,0.5)" strokeWidth="1"/>
          <polyline points="4,16 10,22 16,16" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="1"/>
        </svg>
      </div>
    </section>
  );
}

// ── restaurant-03-hero ────────────────────────────────────────────────────────
// 100vh fullscreen video hero — žádný spacer (navbar je fixed overlay)
// Video: autoplay/muted/loop/playsInline + fallback poster obrázek
// Tmavý overlay 55% přes video pro čitelnost textu
// Centrum: uppercase serif H1 bílý + zlatý kicker "subtitle" + outline CTA bílé
// Ref: lacasalatina.cz — celostránkové video s "Rezervovat" tlačítkem
// ─────────────────────────────────────────────────────────────────────────────
function HeroRestaurant03({ content, sectionId, tenantSlug, isAdmin }: Omit<Props, "variant">) {
  const title      = String(content.title      ?? "Chutě Latinské Ameriky\nv srdci Prahy.");
  const subtitle   = String(content.subtitle   ?? "MEXICO · BRAZIL · ARGENTINA · PERU");
  const ctaText    = String(content.ctaText    ?? "Rezervovat stůl");
  const ctaHref    = String(content.ctaHref    ?? "#kontakt");
  const videoUrl   = String(content.videoUrl   ?? "");
  const posterUrl  = String(content.posterUrl  ?? (
    (content.slides as Array<{url:string}>)?.[0]?.url ??
    "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1920&h=1080&fit=crop&fm=webp&q=85"
  ));

  const GOLD  = "#e05e3f";
  const WHITE = "#ffffff";
  const FONT  = "Georgia, 'Times New Roman', serif";
  const SANS  = "'Helvetica Neue', Helvetica, Arial, sans-serif";

  const resolve = (href: string) => resolveDemoHref(href, tenantSlug, isAdmin);

  return (
    <section style={{ position: "relative", width: "100%", height: "100vh", overflow: "hidden", background: "#0d1b2a" }}>
      {/* Video / fallback poster */}
      <GenericEditableImage sectionId={sectionId} field="posterUrl" src={posterUrl} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
        {videoUrl ? (
          <video
            autoPlay muted loop playsInline
            poster={posterUrl}
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center" }}
          >
            <source src={videoUrl} type="video/mp4" />
          </video>
        ) : (
          <img
            src={posterUrl}
            alt=""
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center" }}
          />
        )}
      </GenericEditableImage>

      {/* Dark overlay */}
      <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.55)" }} />

      {/* Obsah — centrovaný */}
      <div style={{
        position: "relative", zIndex: 10,
        height: "100%", display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        textAlign: "center", padding: "0 clamp(24px, 6vw, 80px)",
      }}>
        {/* Kicker */}
        <p style={{
          fontFamily: SANS, fontSize: "clamp(11px, 3.2vw, 13px)", fontWeight: 500,
          letterSpacing: "0.22em", textTransform: "uppercase",
          color: GOLD, margin: "0 0 20px", lineHeight: 1,
        }}>
          <GenericEditableText sectionId={sectionId} field="subtitle" value={subtitle} tag="span" />
        </p>

        {/* H1 */}
        <h1 style={{
          fontFamily: FONT, fontSize: "clamp(36px, 6vw, 82px)", fontWeight: 400,
          color: WHITE, margin: "0 0 40px", lineHeight: 1.12,
          textTransform: "uppercase", letterSpacing: "0.04em",
          whiteSpace: "pre-line",
        }}>
          <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
        </h1>

        {/* CTA */}
        <a
          href={resolve(ctaHref)}
          data-btn="primary"
          style={{
            fontFamily: SANS, fontSize: 12, fontWeight: 700, letterSpacing: "0.16em",
            textTransform: "uppercase", color: WHITE, textDecoration: "none",
            padding: "15px 36px",
            border: `1px solid ${WHITE}`,
            transition: "background-color 0.22s, border-color 0.22s",
            display: "inline-block",
          }}
          onMouseEnter={e => {
            e.currentTarget.style.backgroundColor = GOLD;
            e.currentTarget.style.borderColor = GOLD;
          }}
          onMouseLeave={e => {
            e.currentTarget.style.backgroundColor = "transparent";
            e.currentTarget.style.borderColor = WHITE;
          }}
        >
          <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
        </a>
      </div>

      {/* Scroll indicator */}
      <div style={{
        position: "absolute", bottom: 32, left: "50%", transform: "translateX(-50%)",
        zIndex: 10, display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
      }}>
        <div style={{
          width: 1, height: 48, background: `linear-gradient(to bottom, ${WHITE}00, ${WHITE}80)`,
          animation: "r03-scroll-fade 2s ease-in-out infinite",
        }} />
      </div>
      <style>{`
        @keyframes r03-scroll-fade {
          0%,100% { opacity:0.3; transform: scaleY(0.6); }
          50% { opacity:1; transform: scaleY(1); }
        }
      `}</style>
    </section>
  );
}

// ── cafe-03-hero ──────────────────────────────────────────────────────────────
// Ref: cathedral.cz — fullscreen 3-slide autoplay slider, 5s interval
// Dark overlay rgba(0,0,0,0.30), centrovaný Great Vibes H1 + Open Sans subtitle
// + zlaté CTA Rezervace; bez spaceru (navbar je fixed overlay)
// ─────────────────────────────────────────────────────────────────────────────
function HeroCafe03({ content, sectionId, tenantSlug, isAdmin }: { content: Record<string, unknown>; sectionId: number; tenantSlug?: string; isAdmin: boolean }) {
  const GOLD    = "#C69C60";
  const GOLD_DK = "#A07840";
  const SERIF   = "'Great Vibes', cursive";
  const SANS    = "'Open Sans', sans-serif";
  const INTERVAL = 5000;

  interface Slide { url: string; alt?: string; }
  const rawSlides = (content.slides as Slide[]) ?? [];
  const slides: Slide[] = rawSlides.length > 0 ? rawSlides : [
    { url: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=1920&h=1080&fit=crop&fm=webp&q=85" },
    { url: "https://images.unsplash.com/photo-1445116572660-236099ec97a0?w=1920&h=1080&fit=crop&fm=webp&q=85" },
    { url: "https://images.unsplash.com/photo-1559925393-8be0ec4767c8?w=1920&h=1080&fit=crop&fm=webp&q=85" },
  ];

  const title    = String(content.title    ?? "Vítáme Vás v Cathedral Café");
  const subtitle = String(content.subtitle ?? "Rádi Vás přivítáme každý den od 9:00 do 21:00 hod.");
  const ctaText  = String(content.ctaText  ?? "Rezervace");
  const ctaHref  = String(content.ctaHref  ?? "/kontakt");
  const resolve  = (h: string) => resolveDemoHref(h, tenantSlug, isAdmin);

  const [active, setActive] = useState(0);

  useEffect(() => {
    if (slides.length < 2) return;
    const t = setInterval(() => setActive(a => (a + 1) % slides.length), INTERVAL);
    return () => clearInterval(t);
  }, [slides.length]);

  return (
    <section style={{ position: "relative", width: "100%", height: "100vh", minHeight: 500, overflow: "hidden", backgroundColor: "#111" }}>
      {/* Slides */}
      {slides.map((slide, i) => (
        <div
          key={i}
          style={{
            position: "absolute", inset: 0,
            opacity: i === active ? 1 : 0,
            transition: "opacity 1.2s ease",
            zIndex: i === active ? 1 : 0,
          }}
        >
          <GenericEditableImage sectionId={sectionId} field={`slides.${i}.url`} src={slide.url} alt={slide.alt ?? ""} style={{ position: "absolute", inset: 0 }}>
            <img src={slide.url} alt={slide.alt ?? ""} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center" }} loading={i === 0 ? "eager" : "lazy"} />
          </GenericEditableImage>
        </div>
      ))}

      {/* Overlay */}
      <div style={{ position: "absolute", inset: 0, backgroundColor: "rgba(0,0,0,0.30)", zIndex: 2 }} />

      {/* Content */}
      <div style={{ position: "absolute", inset: 0, zIndex: 3, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "0 clamp(20px, 5vw, 80px)" }}>
        <GenericEditableText sectionId={sectionId} field="title" value={title} tag="h1">
          <h1 style={{ fontFamily: SERIF, fontSize: "clamp(48px, 7vw, 96px)", fontWeight: 400, color: "#fff", margin: 0, lineHeight: 1.15, letterSpacing: "0.01em" }}>
            {title}
          </h1>
        </GenericEditableText>
        <GenericEditableText sectionId={sectionId} field="subtitle" value={subtitle} tag="p">
          <p style={{ fontFamily: SANS, fontSize: "clamp(14px, 2vw, 18px)", fontWeight: 300, color: "rgba(255,255,255,0.88)", margin: "20px 0 36px", maxWidth: 520, letterSpacing: "0.02em" }}>
            {subtitle}
          </p>
        </GenericEditableText>
        <a
          href={resolve(ctaHref)}
          data-btn="primary"
          style={{ fontFamily: SANS, fontSize: 12, fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase", color: "#fff", textDecoration: "none", padding: "14px 36px", backgroundColor: GOLD, display: "inline-block", transition: "background-color 0.2s" }}
          onMouseEnter={e => (e.currentTarget.style.backgroundColor = GOLD_DK)}
          onMouseLeave={e => (e.currentTarget.style.backgroundColor = GOLD)}
        >
          <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
        </a>
      </div>

      {/* Slide indicators */}
      {slides.length > 1 && (
        <div style={{ position: "absolute", bottom: 32, left: "50%", transform: "translateX(-50%)", zIndex: 4, display: "flex", gap: 10 }}>
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              aria-label={`Snímek ${i + 1}`}
              style={{ width: i === active ? 28 : 8, height: 2, border: "none", cursor: "pointer", backgroundColor: i === active ? GOLD : "rgba(255,255,255,0.5)", padding: 0, transition: "width 0.3s ease, background-color 0.3s ease" }}
            />
          ))}
        </div>
      )}

      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Great+Vibes&family=Open+Sans:wght@300;400;600&display=swap" />
      <style>{`      `}</style>
    </section>
  );
}

// ── cafe-04-hero ──────────────────────────────────────────────────────────────
// Ref: coffeeroom.cz — 100vh horizontal slider, šipky vlevo/vpravo, 5s auto-play
// Žádný tagline text; slide dots + šipky; scroll-down dole
// ─────────────────────────────────────────────────────────────────────────────
function HeroCafe04({ content, sectionId }: { content: Record<string, unknown>; sectionId: number; tenantSlug?: string; isAdmin: boolean }) {
  const rawSlides = (content.slides as Array<{ imageUrl: string; alt?: string }>) ?? [];
  const slides    = rawSlides.length ? rawSlides : [{ imageUrl: "/clones/coffeeroom/cdn/67cc82f0c6e15f8db05a46c0/67cc82f0c6e15f8db05a4779_BAB33CEE-0F29-4D78-BCED-B59C17731DB6.jpeg", alt: "Coffee Room" }];
  const scrollLabel = String(content.scrollLabel ?? "scroll down");

  const COFFEE = "#b79570";
  const FONT   = "'Montserrat', 'Helvetica Neue', Arial, sans-serif";

  const [active, setActive] = useState(0);
  const [locked, setLocked] = useState(false);

  const goTo = (idx: number) => {
    if (locked) return;
    const next = (idx + slides.length) % slides.length;
    if (next === active) return;
    setLocked(true);
    setActive(next);
    setTimeout(() => setLocked(false), 850);
  };

  useEffect(() => {
    const t = setInterval(() => goTo(active + 1), 5000);
    return () => clearInterval(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, locked, slides.length]);

  const scrollDown = () =>
    document.querySelector("section:nth-of-type(2)")?.scrollIntoView({ behavior: "smooth" });

  const arrowStyle: React.CSSProperties = {
    position: "absolute", top: "50%", transform: "translateY(-50%)",
    zIndex: 4, background: "none", border: "none", cursor: "pointer",
    padding: "16px 20px", color: "rgba(255,255,255,0.75)",
    transition: "color 0.2s",
  };

  return (
    <section style={{ position: "relative", width: "100%", height: "100vh", overflow: "hidden", minHeight: 600 }}>
      {/* Slider track */}
      <div style={{
        position: "absolute", inset: 0,
        display: "flex",
        width: `${slides.length * 100}%`,
        transform: `translateX(-${active * (100 / slides.length)}%)`,
        transition: "transform 0.85s cubic-bezier(0.77,0,0.18,1)",
        willChange: "transform",
      }}>
        {slides.map((slide, i) => (
          <div
            key={i}
            style={{
              width: `${100 / slides.length}%`,
              height: "100%",
              position: "relative",
              flexShrink: 0,
              overflow: "hidden",
            }}
          >
            <GenericEditableImage
              sectionId={sectionId}
              field={`slides.${i}.imageUrl`}
              src={slide.imageUrl}
              alt={slide.alt ?? `Slide ${i + 1}`}
              style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", display: "block" }}
            >
              <img src={slide.imageUrl} alt={slide.alt ?? `Slide ${i + 1}`} loading={i === 0 ? "eager" : "lazy"} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
            </GenericEditableImage>
          </div>
        ))}
      </div>

      {/* Dark overlay */}
      <div style={{ position: "absolute", inset: 0, backgroundColor: "rgba(0,0,0,0.36)", zIndex: 2 }} />

      {/* Left arrow */}
      <button
        onClick={() => goTo(active - 1)}
        aria-label="Předchozí slide"
        style={{ ...arrowStyle, left: "clamp(16px, 3vw, 40px)" }}
        onMouseEnter={e => (e.currentTarget.style.color = "#fff")}
        onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.75)")}
      >
        <svg width="14" height="26" viewBox="0 0 14 26" fill="none">
          <path d="M12 2L2 13L12 24" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {/* Right arrow */}
      <button
        onClick={() => goTo(active + 1)}
        aria-label="Další slide"
        style={{ ...arrowStyle, right: "clamp(16px, 3vw, 40px)" }}
        onMouseEnter={e => (e.currentTarget.style.color = "#fff")}
        onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.75)")}
      >
        <svg width="14" height="26" viewBox="0 0 14 26" fill="none">
          <path d="M2 2L12 13L2 24" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {/* Scroll down */}
      <button
        onClick={scrollDown}
        style={{ position: "absolute", bottom: 16, left: "50%", transform: "translateX(-50%)", zIndex: 4, background: "none", border: "none", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 4, fontFamily: FONT, fontSize: 9, fontWeight: 600, letterSpacing: "0.20em", textTransform: "uppercase", color: "rgba(255,255,255,0.55)" }}
      >
        <GenericEditableText sectionId={sectionId} field="scrollLabel" value={scrollLabel} tag="span" />
        <svg width="14" height="8" viewBox="0 0 14 8" fill="none">
          <path d="M1 1L7 7L13 1" stroke="rgba(255,255,255,0.55)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
    </section>
  );
}

// ── bakery-01-hero ────────────────────────────────────────────────────────────
function HeroBakery01({ content, sectionId }: { content: Record<string, unknown>; sectionId: number; tenantSlug?: string; isAdmin?: boolean }) {
  const c = content as { heading?: string; backgroundImage?: string };
  const heading = c.heading ?? "PEČEME S LÁSKOU OD ROKU 2016";
  const bgImage = c.backgroundImage ?? "https://images.unsplash.com/photo-1549931319-a545dcf3bc7e?w=1920&q=85";

  return (
    <section
      id={String(sectionId)}
      style={{
        position: "relative",
        width: "100%",
        height: "50vh",
        minHeight: 320,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        backgroundColor: "#1a1a1a",
      }}
    >
      {/* Background image — editable */}
      <GenericEditableImage sectionId={sectionId} field="backgroundImage" src={bgImage} alt={heading} style={{ position: "absolute", inset: 0, zIndex: 1, display: "block" }}>
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: `url(${bgImage})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
      </GenericEditableImage>
      {/* Dark overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundColor: "rgba(0,0,0,0.38)",
          zIndex: 2,
        }}
      />
      {/* Heading */}
      <div
        style={{
          position: "relative",
          zIndex: 3,
          textAlign: "center",
          padding: "0 clamp(24px, 6vw, 80px)",
        }}
      >
        <h1
          style={{
            fontFamily: "'Josefin Sans', 'Helvetica Neue', sans-serif",
            fontWeight: 300,
            fontSize: "clamp(0.85rem, 2.4vw, 2rem)",
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            color: "#ffffff",
            margin: 0,
            lineHeight: 1.1,
          }}
        >
          <GenericEditableText sectionId={sectionId} field="heading" value={heading} tag="span" />
        </h1>
      </div>
    </section>
  );
}

// ── reality-02-hero ───────────────────────────────────────────────────────────
// Ref: fermakleri.cz homepage hero funnel
// Light-green gradient bg (#dbf7e7 → #eafbf1), výška auto
// H1: Montserrat uppercase dark-teal, zvýrazněné slovo v green #3DCE78
// 4 property-type karty: Byt / Dům / Pozemek / Jiné — zelené CTA
// ─────────────────────────────────────────────────────────────────────────────
function HeroReality02({ content, sectionId, tenantSlug, isAdmin }: { content: Record<string, unknown>; sectionId: number; tenantSlug?: string; isAdmin: boolean }) {
  const title          = String(content.title         ?? "PRODEJTE SVOU NEMOVITOST\nZA NEJVYŠŠÍ CENU NA TRHU");
  const titleHighlight = String(content.titleHighlight ?? "NEJVYŠŠÍ CENU");
  const subtitle       = String(content.subtitle      ?? "Stačí pár kliknutí a doporučíme ověřeného makléře pro prodej vaší nemovitosti.");
  const propertyLabel  = String(content.propertyLabel ?? "Jakou nemovitost prodáváte?");
  const ctaText        = String(content.ctaText       ?? "Najít makléře");
  const ctaHref        = String(content.ctaHref       ?? "#kontakt");
  const propertyTypes  = (content.propertyTypes as Array<{ label: string; icon: string }>) ?? [
    { label: "BYT", icon: "apartment" },
    { label: "DŮM", icon: "house" },
    { label: "POZEMEK", icon: "land" },
    { label: "JINÉ", icon: "other" },
  ];

  const DARK  = "#05303a";
  const GREEN = "#3DCE78";
  const WHITE = "#ffffff";
  const FONT  = "'Montserrat', 'Helvetica Neue', Arial, sans-serif";

  const resolve = (href: string) => {
    if (!tenantSlug) return href;
    if (href === "/") return `/demo/${tenantSlug}${isAdmin ? "/admin" : ""}`;
    if (href.startsWith("#")) return href;
    return `/demo/${tenantSlug}${isAdmin ? "/admin" : ""}${href}`;
  };

  // Render title with highlighted portion in green
  const renderTitle = () => {
    if (!titleHighlight || !title.includes(titleHighlight)) {
      return <span style={{ whiteSpace: "pre-line" }}>{title}</span>;
    }
    const parts = title.split(titleHighlight);
    return (
      <span style={{ whiteSpace: "pre-line" }}>
        {parts[0]}
        <span style={{ color: GREEN }}>{titleHighlight}</span>
        {parts[1]}
      </span>
    );
  };

  const heroImage = String(content.heroImage ?? "");

  // Render title: bold words highlighted, "nejvyšší cenu" gets green underline
  const renderTitleR02 = () => {
    const boldWords = (content.titleBold as string[]) ?? [titleHighlight];
    const highlight = titleHighlight;
    const lines = title.split("\n");
    return (
      <>
        {lines.map((line, li) => {
          let remaining = line;
          const parts: React.ReactNode[] = [];
          let idx = 0;
          while (remaining.length > 0) {
            let matched = false;
            for (const word of boldWords) {
              const pos = remaining.toLowerCase().indexOf(word.toLowerCase());
              if (pos === 0) {
                const isHL = word.toLowerCase() === highlight.toLowerCase();
                parts.push(
                  <strong key={`b-${li}-${idx++}`} style={isHL ? { fontWeight: 700, background: "rgba(61,206,120,0.18)", borderRadius: 4, padding: "0 2px" } : { fontWeight: 700 }}>
                    {remaining.slice(0, word.length)}
                  </strong>
                );
                remaining = remaining.slice(word.length);
                matched = true;
                break;
              }
            }
            if (!matched) {
              const nextBoldPos = boldWords.reduce((min, w) => {
                const p = remaining.toLowerCase().indexOf(w.toLowerCase());
                return p > 0 && p < min ? p : min;
              }, remaining.length);
              parts.push(<span key={`t-${li}-${idx++}`}>{remaining.slice(0, nextBoldPos)}</span>);
              remaining = remaining.slice(nextBoldPos);
            }
          }
          return (
            <span key={`line-${li}`} style={{ display: "block" }}>
              {parts}
              {li < lines.length - 1 && <br />}
            </span>
          );
        })}
      </>
    );
  };

  const PropertyIcon = ({ type }: { type: string }) => {
    const s = 64;
    const stroke = "#3a6a74";
    const sw = "1.6";
    switch (type) {
      case "apartment":
        return (
          <svg width={s} height={s} viewBox="0 0 64 64" fill="none" aria-hidden>
            <rect x="14" y="20" width="36" height="34" rx="2" stroke={stroke} strokeWidth={sw}/>
            <path d="M14 30 H50" stroke={stroke} strokeWidth={sw}/>
            <rect x="20" y="36" width="7" height="7" rx="1" stroke={stroke} strokeWidth="1.2"/>
            <rect x="29" y="36" width="7" height="7" rx="1" stroke={stroke} strokeWidth="1.2"/>
            <rect x="38" y="36" width="7" height="7" rx="1" stroke={stroke} strokeWidth="1.2"/>
            <rect x="20" y="23" width="7" height="5" rx="1" stroke={stroke} strokeWidth="1.2"/>
            <rect x="29" y="23" width="7" height="5" rx="1" stroke={stroke} strokeWidth="1.2"/>
            <rect x="38" y="23" width="7" height="5" rx="1" stroke={stroke} strokeWidth="1.2"/>
            <rect x="26" y="43" width="12" height="11" rx="1" stroke={stroke} strokeWidth="1.2"/>
            <path d="M6 60 H58" stroke={stroke} strokeWidth={sw} strokeLinecap="round"/>
            <path d="M6 54 Q10 46 14 48" stroke={GREEN} strokeWidth="1.4" strokeLinecap="round"/>
            <path d="M50 54 Q54 46 58 48" stroke={GREEN} strokeWidth="1.4" strokeLinecap="round"/>
          </svg>
        );
      case "house":
        return (
          <svg width={s} height={s} viewBox="0 0 64 64" fill="none" aria-hidden>
            <path d="M8 30 L32 10 L56 30" stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M14 26 L14 52 L50 52 L50 26" stroke={stroke} strokeWidth={sw} strokeLinejoin="round"/>
            <rect x="24" y="38" width="16" height="14" rx="1" stroke={stroke} strokeWidth="1.4"/>
            <rect x="18" y="30" width="10" height="9" rx="1" stroke={stroke} strokeWidth="1.2"/>
            <rect x="36" y="30" width="10" height="9" rx="1" stroke={stroke} strokeWidth="1.2"/>
            <path d="M44 26 L44 16 L50 16 L50 26" stroke={stroke} strokeWidth="1.4" strokeLinejoin="round"/>
            <circle cx="52" cy="44" r="5" stroke={GREEN} strokeWidth="1.4"/>
            <path d="M52 40 L52 44 L55 44" stroke={GREEN} strokeWidth="1.4" strokeLinecap="round"/>
          </svg>
        );
      case "land":
        return (
          <svg width={s} height={s} viewBox="0 0 64 64" fill="none" aria-hidden>
            <path d="M32 10 C24 10 18 16 18 24 C18 36 32 52 32 52 C32 52 46 36 46 24 C46 16 40 10 32 10 Z" stroke={stroke} strokeWidth={sw}/>
            <circle cx="32" cy="24" r="6" stroke={stroke} strokeWidth="1.4"/>
            <path d="M8 56 H56" stroke={stroke} strokeWidth={sw} strokeLinecap="round"/>
            <path d="M8 56 Q14 48 20 50 Q26 52 32 48 Q38 44 44 46 Q50 48 56 44" stroke={GREEN} strokeWidth="1.4" fill="none" strokeLinecap="round"/>
          </svg>
        );
      default:
        return (
          <svg width={s} height={s} viewBox="0 0 64 64" fill="none" aria-hidden>
            <rect x="8" y="22" width="48" height="30" rx="2" stroke={stroke} strokeWidth={sw}/>
            <path d="M8 34 H56" stroke={stroke} strokeWidth={sw}/>
            <path d="M20 22 L20 14 L44 14 L44 22" stroke={stroke} strokeWidth={sw} strokeLinejoin="round"/>
            <rect x="16" y="38" width="12" height="10" rx="1" stroke={stroke} strokeWidth="1.2"/>
            <rect x="36" y="38" width="12" height="10" rx="1" stroke={stroke} strokeWidth="1.2"/>
            <circle cx="22" cy="24" r="2.5" fill={GREEN}/>
            <circle cx="42" cy="24" r="2.5" fill={GREEN}/>
          </svg>
        );
    }
  };

  const imgSrc = heroImage || "/templates/reality-02/hero.jpg";

  return (
    <section
      id="prodej"
      style={{ background: "#ffffff", fontFamily: FONT, padding: "clamp(40px,5vw,72px) clamp(16px,5vw,48px)" }}
    >
      {/*
        Přesný layout fermakleri.cz:
          col 1 (56%) row 1: nadpis + subtitle
          col 1 (56%) row 2: 4 property karty
          col 2 (44%) row 1+2: foto (grid-row 1/3, plná výška)
      */}
      <div data-r02-hero-grid="" style={{ maxWidth: 1200, margin: "0 auto", display: "grid", gridTemplateColumns: "56% 44%", gridTemplateRows: "1fr auto", columnGap: "clamp(24px,4vw,52px)", rowGap: "clamp(20px,3vw,32px)" }}>

        {/* Col 1 / Row 1: nadpis + subtitle */}
        <div style={{ gridColumn: 1, gridRow: 1, alignSelf: "center" }}>
          <h1 style={{ fontSize: "clamp(28px, 3.4vw, 50px)", fontWeight: 400, color: DARK, lineHeight: 1.18, marginBottom: 20 }}>
            <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span">
              {renderTitleR02()}
            </GenericEditableText>
          </h1>
          <p style={{ fontSize: "clamp(14px, 1.5vw, 16px)", color: DARK, opacity: 0.72, lineHeight: 1.72, margin: 0 }}>
            <GenericEditableText sectionId={sectionId} field="subtitle" value={subtitle} tag="span" />
          </p>
        </div>

        {/* Col 2 / Row 1+2: foto přes oba řádky */}
        <div
          data-r02-hero-img=""
          style={{ gridColumn: 2, gridRow: "1 / 3", borderRadius: 20, overflow: "hidden", minHeight: 400 }}
        >
          <GenericEditableImage sectionId={sectionId} field="heroImage" src={imgSrc} alt="Prodej nemovitosti" style={{ width: "100%", height: "100%", objectFit: "cover" }}>
            <img loading="eager" src={imgSrc} alt="Prodej nemovitosti" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
          </GenericEditableImage>
        </div>

        {/* Col 1 / Row 2: 4 property karty */}
        <div style={{ gridColumn: 1, gridRow: 2, display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12 }}>
          {propertyTypes.map((pt, i) => (
            <a
              key={`r02-pt-${i}`}
              href={resolve(ctaHref)}
              data-btn="primary"
              style={{ borderRadius: 14, overflow: "hidden", border: "1px solid #ddeae8", textDecoration: "none", display: "flex", flexDirection: "column", background: WHITE, transition: "box-shadow 0.18s, transform 0.18s" }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 8px 24px rgba(5,48,58,0.12)"; e.currentTarget.style.transform = "translateY(-3px)"; }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.transform = "none"; }}
            >
              <div style={{ padding: "28px 12px 22px", display: "flex", justifyContent: "center", alignItems: "center", flex: 1 }}>
                <PropertyIcon type={pt.icon} />
              </div>
              <div style={{ background: "#6dd5a0", padding: "11px 0", textAlign: "center" }}>
                <span style={{ color: WHITE, fontWeight: 600, fontSize: 16, letterSpacing: "0.01em" }}>
                  <GenericEditableText sectionId={sectionId} field={`propertyTypes.${i}.label`} value={pt.label} tag="span" />
                </span>
              </div>
            </a>
          ))}
        </div>

      </div>

      <style>{`
        @media (max-width: 767px) {
          [data-r02-hero-grid] {
            grid-template-columns: 1fr !important;
            grid-template-rows: auto auto auto !important;
          }
          [data-r02-hero-grid] > *:nth-child(1) { grid-column: 1 !important; grid-row: 1 !important; }
          [data-r02-hero-img]                   { grid-column: 1 !important; grid-row: 2 !important; min-height: 220px !important; }
          [data-r02-hero-grid] > *:nth-child(3) { grid-column: 1 !important; grid-row: 3 !important; }
        }
      `}</style>
    </section>
  );
}


// ── reality-04-split-hero ─────────────────────────────────────────────────────
// Ref: quantumreality.cz — welcome-wrapper sekce
// 2-sloupec split: vlevo "Nabízíte nemovitost?" / vpravo "Hledáte nemovitost?"
// Každý panel: foto (img-fluid) + H2 (text-primary #1032CF) + claim 20px + btn-success pill
// Background: bílé #ffffff, padding: 60px 0 (mt-5 pt-lg-5 originál)
// btn-success: bg #21b276 pill, padding 6px 20px, font-size 14px, černý text
// ─────────────────────────────────────────────────────────────────────────────
function HeroReality04Split({ content, sectionId, tenantSlug, isAdmin }: { content: Record<string, unknown>; sectionId: number; tenantSlug?: string; isAdmin: boolean }) {
  const panel1Title    = String(content.panel1Title    ?? "Nabízíte nemovitost?");
  const panel1Subtitle = String(content.panel1Subtitle ?? "Prodej a pronájem nemovitosti, odhad ceny zdarma");
  const panel1CtaText  = String(content.panel1CtaText  ?? "Chci více informací");
  const panel1CtaHref  = String(content.panel1CtaHref  ?? "#kontakt");
  const panel1Image    = String(content.panel1Image    ?? "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=700&h=500&fit=crop&q=80");

  const panel2Title    = String(content.panel2Title    ?? "Hledáte nemovitost?");
  const panel2Subtitle = String(content.panel2Subtitle ?? "Koupě a pronájem nemovitosti, finanční služby");
  const panel2CtaText  = String(content.panel2CtaText  ?? "Chci více informací");
  const panel2CtaHref  = String(content.panel2CtaHref  ?? "#nabidka");
  const panel2Image    = String(content.panel2Image    ?? "https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=700&h=500&fit=crop&q=80");

  const PRIMARY = "#1032CF";
  const GREEN   = "#21b276";
  const DARK    = "#241f0c";
  const WHITE   = "#ffffff";
  const SANS    = "'Helvetica Neue', Helvetica, Arial, sans-serif";

  const resolve = (href: string) => resolveDemoHref(href, tenantSlug, isAdmin);

  const Panel = ({
    title, subtitle, ctaText, ctaHref, image,
    titleField, subtitleField, ctaTextField, ctaHrefField, imageField,
  }: {
    title: string; subtitle: string; ctaText: string; ctaHref: string; image: string;
    titleField: string; subtitleField: string; ctaTextField: string; ctaHrefField: string; imageField: string;
  }) => (
    <div style={{ flex: "1 1 0", minWidth: 0 }}>
      {/* Foto */}
      <div style={{ marginBottom: 24 }}>
        <GenericEditableImage sectionId={sectionId} field={imageField} src={image} alt={title} style={{ display: "block", borderRadius: 4, overflow: "hidden" }}>
          <img loading="eager" src={image} alt={title} style={{ width: "100%", height: "auto", display: "block", borderRadius: 4 }} />
        </GenericEditableImage>
      </div>
      {/* H2 */}
      <h2 style={{ fontFamily: SANS, fontSize: "clamp(22px, 2.2vw, 30px)", fontWeight: 700, color: PRIMARY, marginBottom: 10, marginTop: 0, lineHeight: 1.2 }}>
        <GenericEditableText sectionId={sectionId} field={titleField} value={title} tag="span" />
      </h2>
      {/* Claim subtitle */}
      <p style={{ fontFamily: SANS, fontSize: 20, color: DARK, margin: "0 0 20px", lineHeight: 1.4 }}>
        <GenericEditableText sectionId={sectionId} field={subtitleField} value={subtitle} tag="span" />
      </p>
      {/* btn-success */}
      <a
        href={resolve(ctaHref)}
        data-btn="primary"
        style={{ display: "inline-block", padding: "6px 20px", backgroundColor: GREEN, color: "#000", fontFamily: SANS, fontSize: 14, fontWeight: 400, textDecoration: "none", borderRadius: 50, boxShadow: `inset 0px 0px 0px 2px ${GREEN}`, transition: "all 350ms ease" }}
        onMouseEnter={e => { e.currentTarget.style.backgroundColor = WHITE; e.currentTarget.style.color = GREEN; }}
        onMouseLeave={e => { e.currentTarget.style.backgroundColor = GREEN; e.currentTarget.style.color = "#000"; }}
      >
        <GenericEditableText sectionId={sectionId} field={ctaTextField} value={ctaText} tag="span" />
      </a>
    </div>
  );

  return (
    <section style={{ backgroundColor: WHITE, padding: "clamp(40px, 5vw, 80px) 0" }}>
      <div style={{ maxWidth: 1434, margin: "0 auto", padding: "0 clamp(16px, 3vw, 40px)" }}>
        <div className="r04-hero-grid">
          <Panel
            title={panel1Title} subtitle={panel1Subtitle} ctaText={panel1CtaText} ctaHref={panel1CtaHref} image={panel1Image}
            titleField="panel1Title" subtitleField="panel1Subtitle" ctaTextField="panel1CtaText" ctaHrefField="panel1CtaHref" imageField="panel1Image"
          />
          <Panel
            title={panel2Title} subtitle={panel2Subtitle} ctaText={panel2CtaText} ctaHref={panel2CtaHref} image={panel2Image}
            titleField="panel2Title" subtitleField="panel2Subtitle" ctaTextField="panel2CtaText" ctaHrefField="panel2CtaHref" imageField="panel2Image"
          />
        </div>
      </div>
      <style>{`
        .r04-hero-grid { display: grid; grid-template-columns: 1fr 1fr; gap: clamp(24px, 4vw, 60px); }
        @media (max-width: 640px) { .r04-hero-grid { grid-template-columns: 1fr; } }
      `}</style>
    </section>
  );
}

// ── reality-01-hero ───────────────────────────────────────────────────────────
// Video hero — ref: lexxusnorton.cz
// Video s horizontálním odsazením (container margins); search panel uvnitř dole
// ─────────────────────────────────────────────────────────────────────────────
function HeroReality01({ content, sectionId, tenantSlug, isAdmin }: { content: Record<string, unknown>; sectionId: number; tenantSlug?: string; isAdmin: boolean }) {
  const tagline          = String(content.tagline          ?? "Prémiové bydlení");
  const title            = String(content.title            ?? "Spojujeme lidi\na nemovitosti\nvíce než 33 let");
  const ctaText          = String(content.ctaText          ?? "Najít nemovitost");
  const ctaHref          = String(content.ctaHref          ?? "/vypis-nemovitosti");
  const ctaSecondaryText = String(content.ctaSecondaryText ?? "O nás");
  const ctaSecondaryHref = String(content.ctaSecondaryHref ?? "/o-nas");
  const bgImage          = String(content.bgImage          ?? "/templates/reality-01/hero-bg.jpg");
  const videoSrc         = String(content.videoSrc         ?? "/templates/reality-01/video/hero.mp4");

  const DARK       = "#1a3640";
  const GOLD       = "#d4a96e";
  const WHITE      = "#ffffff";
  const MONTSERRAT = "'Montserrat', 'Helvetica Neue', Arial, sans-serif";

  const [activeTab, setActiveTab] = useState<"sale" | "rent">("sale");

  const resolve = (href: string) => {
    if (!tenantSlug) return href;
    if (href === "/") return `/demo/${tenantSlug}${isAdmin ? "/admin" : ""}`;
    if (href.startsWith("#")) return href;
    return `/demo/${tenantSlug}${isAdmin ? "/admin" : ""}${href}`;
  };

  return (
    <section style={{ backgroundColor: WHITE }}>
      {/* Outer wrapper — same horizontal padding as lexxusnorton.cz container */}
      <div data-r01-hero-outer style={{ padding: "0 clamp(32px, 6vw, 100px)" }}>
        {/* Video container — rounded, overflow hidden */}
        <div data-r01-hero-video style={{
          position: "relative",
          height: "clamp(560px, calc(100vh - 72px), 820px)",
          overflow: "hidden",
          borderRadius: 8,
          backgroundColor: DARK,
        }}>
          {/* Poster / fallback image */}
          <GenericEditableImage sectionId={sectionId} field="bgImage" src={bgImage} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}>
            <img loading="eager" src={bgImage} alt="" aria-hidden="true" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center" }} />
          </GenericEditableImage>

          {/* Autoplay video */}
          <video
            autoPlay muted loop playsInline preload="metadata"
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
          >
            <source src={videoSrc} type="video/mp4" />
          </video>

          {/* Dark overlay */}
          <div style={{ position: "absolute", inset: 0, backgroundColor: "rgba(26,54,64,0.52)", zIndex: 2 }} />

          {/* Decorative diagonal lines */}
          <svg style={{ position: "absolute", top: 0, left: "clamp(32px,8vw,160px)", zIndex: 3, pointerEvents: "none" }} width="161" height="190" viewBox="0 0 161 190" fill="none" aria-hidden="true">
            <path d="M2.47 2.33L158.02 187.71" stroke="#294A52" strokeOpacity="0.5" strokeWidth="4" />
          </svg>
          <svg style={{ position: "absolute", bottom: 80, right: "clamp(32px,6vw,120px)", zIndex: 3, pointerEvents: "none" }} width="161" height="190" viewBox="0 0 161 190" fill="none" aria-hidden="true">
            <path d="M2.47 187.71L158.02 2.33" stroke="#C28F75" strokeOpacity="0.5" strokeWidth="4" />
          </svg>

          {/* Text content — centered, upper area */}
          <div style={{ position: "absolute", top: "clamp(48px,12vh,180px)", left: 0, right: 0, zIndex: 4, textAlign: "center", padding: "0 clamp(20px,5vw,60px)" }}>
            <GenericEditableText
              sectionId={sectionId} field="tagline" value={tagline} tag="p"
              style={{ fontFamily: MONTSERRAT, fontSize: 13, fontWeight: 600, letterSpacing: "0.18em", textTransform: "uppercase", color: WHITE, margin: "0 0 20px" }}
            />
            <div style={{ maxWidth: 640, margin: "0 auto 36px" }}>
              <GenericEditableText
                sectionId={sectionId} field="title" value={title} tag="h1"
                style={{ fontFamily: MONTSERRAT, fontSize: "clamp(28px,4.8vw,56px)", fontWeight: 700, lineHeight: 1.1, color: WHITE, margin: 0, whiteSpace: "pre-line", letterSpacing: "-0.01em" }}
              />
            </div>
            <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
              <a href={resolve(ctaHref)} data-btn="primary"
                style={{ display: "inline-flex", alignItems: "center", backgroundColor: GOLD, color: "#1a1a1a", fontFamily: MONTSERRAT, fontSize: 15, fontWeight: 600, letterSpacing: "0.04em", padding: "14px 32px", borderRadius: 4, textDecoration: "none", transition: "background 0.2s" }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = "#c49a5e"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = GOLD; }}
              >
                <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
              </a>
              <a href={resolve(ctaSecondaryHref)}
                style={{ display: "inline-flex", alignItems: "center", border: "1.5px solid rgba(255,255,255,0.65)", color: WHITE, fontFamily: MONTSERRAT, fontSize: 15, fontWeight: 500, letterSpacing: "0.04em", padding: "14px 32px", borderRadius: 4, textDecoration: "none", transition: "background 0.2s, border-color 0.2s" }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = "rgba(255,255,255,0.1)"; (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,1)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = "transparent"; (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.65)"; }}
              >
                <GenericEditableText sectionId={sectionId} field="ctaSecondaryText" value={ctaSecondaryText} tag="span" />
              </a>
            </div>
          </div>

          {/* Search panel — inside hero, bottom-center */}
          <div style={{ position: "absolute", bottom: 32, left: 0, right: 0, zIndex: 5, display: "flex", justifyContent: "center", padding: "0 clamp(20px,5vw,60px)" }}>
            <div style={{ backgroundColor: WHITE, borderRadius: 8, boxShadow: "0 4px 28px rgba(0,0,0,0.22)", width: "100%", maxWidth: 820, overflow: "hidden" }}>
              {/* Prodej / Pronájem tabs */}
              <div style={{ display: "flex", padding: "0 20px" }}>
                {(["sale", "rent"] as const).map(tab => (
                  <button key={tab} onClick={() => setActiveTab(tab)} style={{
                    padding: "13px 20px", background: "none", border: "none", cursor: "pointer",
                    fontFamily: MONTSERRAT, fontSize: 14, fontWeight: activeTab === tab ? 700 : 500,
                    color: activeTab === tab ? DARK : "#6b7280",
                    borderBottom: activeTab === tab ? `2.5px solid ${DARK}` : "2.5px solid transparent",
                    transition: "color 0.15s, border-color 0.15s",
                    marginRight: 8,
                  }}>
                    {tab === "sale" ? "Prodej" : "Pronájem"}
                  </button>
                ))}
              </div>
              {/* Divider */}
              <div style={{ height: 1, backgroundColor: "#e5e7eb", margin: "0 20px" }} />
              {/* Filter row */}
              <div data-r01-filter style={{ display: "flex", alignItems: "center", padding: "12px 20px", gap: 8 }}>
                {[
                  { label: "Nemovitost", opts: ["Byt", "Dům", "Pozemek", "Komerční"] },
                  { label: "Lokalita",   opts: ["Praha 1", "Praha 2", "Praha 3", "Praha západ"] },
                  { label: "Cena",       opts: ["do 5 mil", "5–10 mil", "10–20 mil", "20+ mil"] },
                ].map(({ label, opts }) => (
                  <button key={label} style={{
                    flex: 1, display: "flex", alignItems: "center", justifyContent: "space-between",
                    border: "none", background: "none", cursor: "pointer",
                    fontFamily: MONTSERRAT, fontSize: 14, fontWeight: 500, color: DARK,
                    padding: "8px 12px", borderRight: "1px solid #e5e7eb",
                  }}>
                    <span>{label}</span>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <path d="M16.354 10.353L12 14.707l-4.353-4.354.707-.707L12 13.293l3.646-3.647z" fill="currentColor"/>
                    </svg>
                  </button>
                ))}
                <a href={resolve(ctaHref)} data-btn="primary" style={{
                  display: "flex", alignItems: "center", gap: 8, flexShrink: 0,
                  backgroundColor: DARK, color: WHITE, borderRadius: 6,
                  padding: "10px 22px", textDecoration: "none",
                  fontFamily: MONTSERRAT, fontSize: 14, fontWeight: 600, letterSpacing: "0.02em",
                  transition: "background 0.15s", whiteSpace: "nowrap",
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = "#0d2830"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = DARK; }}
                >
                  Najít nemovitost
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 600px) {
          [data-r01-hero-outer] { padding: 0 !important; }
          [data-r01-hero-video] { border-radius: 0 !important; }
          [data-r01-filter] { flex-wrap: wrap !important; }
          [data-r01-filter] button { min-width: 40% !important; }
        }
      `}</style>
    </section>
  );
}

// ── hero-reality-03-video ─────────────────────────────────────────────────────
function HeroReality03({ content, sectionId, tenantSlug, isAdmin }: { content: Record<string, unknown>; sectionId: number; tenantSlug?: string; isAdmin: boolean }) {
  const title       = String(content.title        ?? "Rodinná realitka,\nkde se budete cítit jako doma");
  const titleAccent = String(content.titleAccent  ?? "Rodinná realitka,");
  const body        = String(content.body         ?? "");
  const bgImage     = String(content.image        ?? "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1600&h=900&fit=crop&q=80");
  const agentImage  = String(content.agentImage   ?? "");
  const ctaText     = String(content.ctaText      ?? "Naše služby");
  const ctaHref     = String(content.ctaHref      ?? "#sluzby");
  const ctaSecText  = String(content.ctaSecondaryText ?? "O nás");
  const ctaSecHref  = String(content.ctaSecondaryHref ?? "#o-nas");
  const stats = (content.stats as Array<{ number: string; label: string }>) ?? [];

  const DARK  = "#132538";
  const OCHRE = "#e38a6a";
  const WHITE = "#ffffff";
  const SANS  = "'Helvetica Neue', Helvetica, Arial, sans-serif";

  const resolve = (href: string) => {
    if (!tenantSlug) return href;
    if (href.startsWith("#")) return href;
    if (href === "/") return `/demo/${tenantSlug}${isAdmin ? "/admin" : ""}`;
    return `/demo/${tenantSlug}${isAdmin ? "/admin" : ""}${href}`;
  };

  const renderTitle = () => {
    if (!titleAccent || !title.includes(titleAccent)) {
      return <span style={{ whiteSpace: "pre-line", color: WHITE }}>{title}</span>;
    }
    const after = title.slice(titleAccent.length).replace(/^\n/, "");
    return (
      <>
        <span style={{ color: OCHRE, display: "block" }}>
          <GenericEditableText sectionId={sectionId} field="titleAccent" value={titleAccent} tag="span" />
        </span>
        <span style={{ color: WHITE, display: "block", whiteSpace: "pre-line" }}>{after}</span>
      </>
    );
  };

  return (
    <section id="hero" style={{ position: "relative", minHeight: "100vh", display: "flex", alignItems: "center", overflow: "hidden", fontFamily: SANS }}>
      <div style={{ position: "absolute", inset: 0, backgroundImage: `url(${bgImage})`, backgroundSize: "cover", backgroundPosition: "center top", zIndex: 0 }} />
      <div style={{ position: "absolute", inset: 0, backgroundColor: "rgba(19,37,56,0.62)", zIndex: 1 }} />
      <div data-r03-hero-grid style={{ position: "relative", zIndex: 2, width: "100%", maxWidth: 1320, margin: "0 auto", padding: "100px clamp(20px, 4vw, 64px) 80px", display: "grid", gridTemplateColumns: "55fr 45fr", alignItems: "center", gap: "clamp(32px, 5vw, 80px)" }}>
        <div>
          <h1 style={{ fontFamily: SANS, fontSize: "clamp(2rem, 4.5vw, 3.4rem)", fontWeight: 700, lineHeight: 1.15, margin: "0 0 24px", letterSpacing: "-0.02em" }}>
            {renderTitle()}
          </h1>
          <p style={{ fontSize: "clamp(15px, 1.5vw, 18px)", color: "rgba(255,255,255,0.80)", lineHeight: 1.65, margin: "0 0 36px", maxWidth: 520 }}>
            <GenericEditableText sectionId={sectionId} field="body" value={body} tag="span" />
          </p>
          {stats.length > 0 && (
            <div style={{ display: "flex", gap: "clamp(20px, 4vw, 48px)", marginBottom: 40, flexWrap: "wrap" }}>
              {stats.map((s, i) => (
                <div key={`r03-stat-${i}`} style={{ display: "flex", flexDirection: "column" }}>
                  <span style={{ fontFamily: SANS, fontSize: "clamp(2rem, 3.5vw, 2.8rem)", fontWeight: 700, color: WHITE, lineHeight: 1, letterSpacing: "-0.02em" }}>{s.number}</span>
                  <span style={{ fontSize: 12, fontWeight: 500, color: OCHRE, textTransform: "uppercase", letterSpacing: "1.5px", marginTop: 6, whiteSpace: "pre-line", lineHeight: 1.4 }}>{s.label}</span>
                </div>
              ))}
            </div>
          )}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 14 }}>
            <a href={resolve(ctaHref)} data-btn="primary" style={{ display: "inline-flex", alignItems: "center", padding: "14px 34px", backgroundColor: WHITE, color: DARK, fontFamily: SANS, fontSize: 14, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", textDecoration: "none", borderRadius: "99rem", transition: "all 0.2s", border: `2px solid ${WHITE}` }} onMouseEnter={e => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = WHITE; }} onMouseLeave={e => { e.currentTarget.style.backgroundColor = WHITE; e.currentTarget.style.color = DARK; }}>
              {ctaText}
            </a>
            <a href={resolve(ctaSecHref)} style={{ display: "inline-flex", alignItems: "center", padding: "14px 34px", backgroundColor: "transparent", color: WHITE, fontFamily: SANS, fontSize: 14, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", textDecoration: "none", borderRadius: "99rem", border: "2px solid rgba(255,255,255,0.55)", transition: "all 0.2s" }} onMouseEnter={e => { e.currentTarget.style.borderColor = WHITE; e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.10)"; }} onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.55)"; e.currentTarget.style.backgroundColor = "transparent"; }}>
              {ctaSecText}
            </a>
          </div>
        </div>
        {agentImage && (
          <div data-r03-portrait style={{ display: "flex", justifyContent: "center" }}>
            <div style={{ width: "clamp(260px, 32vw, 420px)", aspectRatio: "3/4", borderRadius: 12, overflow: "hidden", boxShadow: "0 24px 64px rgba(0,0,0,0.45)", border: "3px solid rgba(227,138,106,0.35)" }}>
              <GenericEditableImage sectionId={sectionId} field="agentImage" src={agentImage} alt="Realitní makléř" style={{ width: "100%", height: "100%" }}>
                <img loading="eager" src={agentImage} alt="Realitní makléř" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top center", display: "block" }} />
              </GenericEditableImage>
            </div>
          </div>
        )}
      </div>
      <style>{`
        @media (max-width: 767px) {
          [data-r03-hero-grid] { grid-template-columns: 1fr !important; padding-top: 72px !important; padding-bottom: 56px !important; }
          [data-r03-portrait]  { display: none !important; }
        }
        @media (max-width: 480px) {
          [data-r03-hero-grid] { padding-top: 60px !important; padding-bottom: 44px !important; }
        }
      `}</style>
    </section>
  );
}

// ── reality-05-hero ───────────────────────────────────────────────────────────
// Ref: ondrejkucera.com (okucera.cz)
// 100vh fullscreen foto slider; dark rgba(0,0,0,0.55) overlay
// Text pravostranně zarovnaný (text-md-right originál), bílý H2, zlatý (#CFA968) CTA button
// 2 slidy s auto-advance 5s; prev/next šipky; bez tečkové navigace
// ─────────────────────────────────────────────────────────────────────────────
function HeroReality05({ content, sectionId, tenantSlug, isAdmin }: { content: Record<string, unknown>; sectionId: number; tenantSlug?: string; isAdmin: boolean }) {
  type Slide = { bgImage: string; bgPosition: string; title: string; ctaText: string; ctaHref: string };
  const rawSlides = content.slides as Slide[] | undefined;
  const slides: Slide[] = rawSlides && rawSlides.length > 0 ? rawSlides : [
    {
      bgImage: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1600&h=900&fit=crop&q=80",
      bgPosition: "center top",
      title: "Více jak\npatnáct let zkušeností.\nJsem tu pro Vás.",
      ctaText: "Co o mně řekli klienti",
      ctaHref: "#reference",
    },
    {
      bgImage: "https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=1600&h=900&fit=crop&q=80",
      bgPosition: "center top",
      title: "Váš příběh,\nmoje péče.",
      ctaText: "Kontaktujte mě",
      ctaHref: "#kontakt",
    },
  ];

  const GOLD  = "#CFA968";
  const WHITE = "#ffffff";
  const SANS  = "'Open Sans', 'Helvetica Neue', Arial, sans-serif";

  const [current, setCurrent] = useState(0);
  const total = slides.length;

  const resolve = (href: string) => {
    if (!tenantSlug) return href;
    if (href.startsWith("#")) return href;
    if (href === "/") return `/demo/${tenantSlug}${isAdmin ? "/admin" : ""}`;
    return `/demo/${tenantSlug}${isAdmin ? "/admin" : ""}${href}`;
  };

  useEffect(() => {
    const t = setInterval(() => setCurrent(c => (c + 1) % total), 5000);
    return () => clearInterval(t);
  }, [total]);

  const slide = slides[current];

  return (
    <section style={{ position: "relative", width: "100%", height: "100vh", minHeight: 500, overflow: "hidden", backgroundColor: "#111" }} data-r05-hero>
      {/* Slides — each as GenericEditableImage so bgImage is editable */}
      {slides.map((s, i) => (
        <GenericEditableImage
          key={i}
          sectionId={sectionId}
          field={`slides.${i}.bgImage`}
          src={s.bgImage}
          alt=""
          className="absolute inset-0 z-0"
          style={{ position: "absolute", transition: "opacity 0.8s ease", opacity: i === current ? 1 : 0 }}
        >
          <img
            src={s.bgImage}
            alt=""
            aria-hidden={i !== current}
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: s.bgPosition || "center" }}
          />
        </GenericEditableImage>
      ))}

      {/* Dark overlay — pointerEvents none so clicks reach GenericEditableImage */}
      <div style={{ position: "absolute", inset: 0, backgroundColor: "rgba(0,0,0,0.55)", zIndex: 1, pointerEvents: "none" }} />

      {/* Content — pravostranně zarovnáno, center na mobilu */}
      <div className="r05-hero-cnt" style={{ position: "absolute", inset: 0, zIndex: 2, display: "flex", alignItems: "center", justifyContent: "flex-end", padding: "0 clamp(24px, 6vw, 100px)" }}>
        <div className="r05-hero-txt" style={{ maxWidth: 600, textAlign: "right" }}>
          {slide.title && (
            <GenericEditableText
              sectionId={sectionId}
              field={`slides.${current}.title`}
              value={slide.title}
              tag="h2"
              style={{ fontFamily: SANS, fontSize: "clamp(22px,3.2vw,42px)", fontWeight: 700, lineHeight: 1.25, color: WHITE, margin: "0 0 32px", whiteSpace: "pre-line" }}
            />
          )}
          <a
            href={resolve(slide.ctaHref)}
            data-btn="primary"
            style={{ display: "inline-block", padding: "14px 32px", backgroundColor: GOLD, color: WHITE, fontFamily: SANS, fontSize: 15, fontWeight: 600, textDecoration: "none", letterSpacing: "0.02em", transition: "opacity 0.2s" }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = "0.85"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = "1"; }}
          >
            <GenericEditableText sectionId={sectionId} field={`slides.${current}.ctaText`} value={slide.ctaText} tag="span" />
          </a>
        </div>
      </div>

      {/* Prev / Next šipky */}
      {total > 1 && (
        <>
          <button
            onClick={() => setCurrent(c => (c - 1 + total) % total)}
            aria-label="Předchozí slide"
            style={{ position: "absolute", left: 20, top: "50%", transform: "translateY(-50%)", zIndex: 3, background: "rgba(0,0,0,0.35)", border: "none", cursor: "pointer", color: WHITE, width: 44, height: 44, display: "flex", alignItems: "center", justifyContent: "center", transition: "background 0.18s" }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(207,169,104,0.7)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "rgba(0,0,0,0.35)"; }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <button
            onClick={() => setCurrent(c => (c + 1) % total)}
            aria-label="Následující slide"
            style={{ position: "absolute", right: 20, top: "50%", transform: "translateY(-50%)", zIndex: 3, background: "rgba(0,0,0,0.35)", border: "none", cursor: "pointer", color: WHITE, width: 44, height: 44, display: "flex", alignItems: "center", justifyContent: "center", transition: "background 0.18s" }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(207,169,104,0.7)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "rgba(0,0,0,0.35)"; }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
          </button>
        </>
      )}

      {/* Scroll-down arrow */}
      <a
        href="#o-mne"
        aria-label="Přejít níže"
        style={{ position: "absolute", bottom: 32, left: "50%", transform: "translateX(-50%)", zIndex: 3, color: WHITE, opacity: 0.7, textDecoration: "none" }}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="6 9 12 15 18 9"/></svg>
      </a>

      <style>{`
        @media (max-width: 600px) {
          [data-r05-hero] .r05-hero-cnt { justify-content: center !important; padding: 0 20px !important; }
          [data-r05-hero] .r05-hero-txt { text-align: center !important; max-width: 100% !important; }
        }
      `}</style>
    </section>
  );
}

// ── hero-reality-06-agent ──────────────────────────────────────────────────────
// Ref: srubar.cz — celostránkový hero, foto pozadí opacity 80%, foto makléře vlevo-dole,
// H1 vpravo (#263A82, 48px bold), bílá blur lišta dole přesahující -50% se 4 CTA.
// Přesné hodnoty: section max-h 650px (lg), bg object-cover object-left opacity-80,
// h1 bottom ~40% right 11%, lišta bg-white/90 backdrop-blur rounded-lg shadow-lg p-4
// ─────────────────────────────────────────────────────────────────────────────
function HeroReality06Agent({ content, sectionId, tenantSlug, isAdmin }: { content: Record<string, unknown>; sectionId: number; tenantSlug?: string; isAdmin: boolean }) {
  const agentName   = String(content.agentName   ?? "Dominik Krejčí");
  const heading     = String(content.heading     ?? "Váš osobní realitní makléř");
  const bgImage     = String(content.bgImage     ?? "/clones/srubar/images/hero-image-03.jpg");
  const agentImage  = String(content.agentImage  ?? "/clones/srubar/images/jan.png");
  const phone       = String(content.phone       ?? "704 123 456");
  const email       = String(content.email       ?? "email@demo.cz");
  const whatsapp    = String(content.whatsapp    ?? "https://wa.me/420704123456");
  const googleUrl   = String(content.googleUrl   ?? "#");
  const googleRating = String(content.googleRating ?? "5,0");
  const stats = (content.stats as Array<{ number: string; label: string }>) ?? [];

  const PRIMARY = "#263A82";
  const SANS    = "'Helvetica Neue', Helvetica, Arial, sans-serif";

  return (
    // position:relative z-index:40 — hero leží NAD about sekcí (z-index:10),
    // žádný overflow:hidden aby CTA bar mohl přetéct dolů
    <section style={{ position: "relative", width: "100%", height: "100vh", maxHeight: 650, zIndex: 40 }} data-template="reality-06-hero">
      {/* Background image — vlastní overflow:hidden wrapper aby bg nepřetékalo */}
      <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
        <GenericEditableImage sectionId={sectionId} field="bgImage" src={bgImage} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
          <img loading="eager" src={bgImage} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "left center", opacity: 0.8, pointerEvents: "none" }} />
        </GenericEditableImage>
      </div>

      <style>{`
        .r06h-content { position: absolute; bottom: 0; left: 0; right: 0; display: flex; align-items: flex-end; }
        .r06h-photo { position: relative; z-index: 2; max-height: 100%; max-width: 340px; object-fit: contain; object-position: bottom; pointer-events: none; }
        .r06h-right { position: absolute; right: clamp(16px,11%,140px); bottom: 0; z-index: 3; display: flex; flex-direction: column; gap: 16px; align-items: flex-start; padding-bottom: 80px; max-width: 46%; }
        .r06h-stats { display: flex; gap: 24px; flex-wrap: wrap; }
        .r06h-stat { display: flex; flex-direction: column; gap: 2px; }
        @media (max-width: 640px) {
          .r06h-content { flex-direction: column; align-items: center; justify-content: flex-end; }
          .r06h-photo { max-width: 200px; max-height: 260px; }
          .r06h-right { position: relative; right: auto; bottom: auto; padding-bottom: 24px; max-width: 90%; align-items: center; text-align: center; }
          .r06h-stats { justify-content: center; gap: 16px; }
        }
      `}</style>

      {/* Agent photo + H1 + stats */}
      <div className="r06h-content">
        <GenericEditableImage sectionId={sectionId} field="agentImage" src={agentImage} alt={agentName} style={{ position: "relative", zIndex: 2, flexShrink: 0 }}>
          <img loading="eager" src={agentImage} alt={agentName} className="r06h-photo" />
        </GenericEditableImage>

        <div className="r06h-right">
          {/* H1 */}
          <h1 style={{ fontFamily: SANS, fontSize: "clamp(24px, 3.5vw, 42px)", fontWeight: 700, lineHeight: 1.2, letterSpacing: "-0.01em", color: PRIMARY, margin: 0, display: "flex", flexDirection: "column", gap: 4 }}>
            <GenericEditableText sectionId={sectionId} field="agentName" value={agentName} tag="span" />
            <GenericEditableText sectionId={sectionId} field="heading" value={heading} tag="span" />
          </h1>

          {/* Stats */}
          {stats.length > 0 && (
            <div className="r06h-stats">
              {stats.map((s, i) => (
                <div key={i} className="r06h-stat">
                  <span style={{ fontFamily: SANS, fontSize: "clamp(22px,2.5vw,32px)", fontWeight: 700, color: PRIMARY, lineHeight: 1 }}>
                    <GenericEditableText sectionId={sectionId} field={`stats.${i}.number`} value={s.number} tag="span" />
                  </span>
                  <span style={{ fontFamily: SANS, fontSize: 11, fontWeight: 500, color: PRIMARY, opacity: 0.65, whiteSpace: "pre-line", lineHeight: 1.35 }}>
                    <GenericEditableText sectionId={sectionId} field={`stats.${i}.label`} value={s.label} tag="span" />
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* CTA bar — z-index:50, přetéká 50% dolů přes about sekci */}
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, zIndex: 50, display: "flex", justifyContent: "center", transform: "translateY(50%)" }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center", justifyContent: "center", background: "rgba(255,255,255,0.92)", backdropFilter: "blur(8px)", borderRadius: 12, boxShadow: "0 8px 32px rgba(38,58,130,0.13)", padding: "16px 20px", maxWidth: "calc(100% - 32px)" }}>
          <a href={`tel:+420${phone.replace(/\s/g,"")}`}
            style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "8px 16px", borderRadius: 99, background: "#F8F8F0", color: PRIMARY, fontFamily: SANS, fontSize: 14, fontWeight: 500, textDecoration: "none", boxShadow: "0 1px 4px rgba(0,0,0,0.08)", whiteSpace: "nowrap" }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"><rect x="6" y="3" width="12" height="18" rx="2"/><line x1="11" y1="4" x2="13" y2="4"/><line x1="12" y1="17" x2="12" y2="17.01"/></svg>
            Zavolat
          </a>
          <a href={`mailto:${email}`}
            style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "8px 16px", borderRadius: 99, background: "#F0F0F8", color: PRIMARY, fontFamily: SANS, fontSize: 14, fontWeight: 500, textDecoration: "none", boxShadow: "0 1px 4px rgba(0,0,0,0.08)", whiteSpace: "nowrap" }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"/><polyline points="3 7 12 13 21 7"/></svg>
            Napsat e-mail
          </a>
          <a href={whatsapp} target="_blank" rel="noopener noreferrer"
            style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "8px 16px", borderRadius: 99, background: "#F0F8F0", color: PRIMARY, fontFamily: SANS, fontSize: 14, fontWeight: 500, textDecoration: "none", boxShadow: "0 1px 4px rgba(0,0,0,0.08)", whiteSpace: "nowrap" }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21"/><path d="M9 10a.5.5 0 0 0 1 0v-1a.5.5 0 0 0-1 0v1a5 5 0 0 0 5 5h1a.5.5 0 0 0 0-1h-1a.5.5 0 0 0 0 1"/></svg>
            WhatsApp
          </a>
          <a href={googleUrl} target="_blank" rel="noopener noreferrer"
            style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "8px 16px", borderRadius: 99, background: "#F8F0F0", color: PRIMARY, fontFamily: SANS, fontSize: 14, fontWeight: 500, textDecoration: "none", boxShadow: "0 1px 4px rgba(0,0,0,0.08)", whiteSpace: "nowrap" }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M17.788 5.108a9 9 0 1 0 3.212 6.892h-8"/></svg>
            Google
            <span style={{ color: "#92400e", fontWeight: 700 }}>
              <GenericEditableText sectionId={sectionId} field="googleRating" value={googleRating} tag="span" />
            </span>
            <span style={{ display: "inline-flex", gap: 1 }}>
              {[1,2,3,4,5].map(i => (
                <svg key={i} width="14" height="14" viewBox="0 0 24 24" fill="#FBBF24" stroke="#FBBF24" strokeWidth="1"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
              ))}
            </span>
          </a>
        </div>
      </div>
    </section>
  );
}

// ── autoservis-01-hero ─────────────────────────────────────────────────────
// 2-col split: text vlevo (50%) + fullbleed foto vpravo (50%), 100svh
// H1 dark + oranžový (#FFA500) italic subtitle + tělo + 4 bullet body + 2 CTA
// 1:1 reference: bestdrive.cz — stage sekce s customercentricity.jpg
// ──────────────────────────────────────────────────────────────────────────
function HeroAutoservis01({ content, sectionId, tenantSlug, isAdmin }: { content: Record<string, unknown>; sectionId: number; tenantSlug?: string; isAdmin: boolean }) {
  const title    = String(content.title    ?? "Prémiový autoservis\npro Vaši bezpečnou jízdu");
  const subtitle = String(content.subtitle ?? "Vy jezdíte, my se staráme");
  const ctaText  = String(content.ctaText  ?? "Objednat servis");
  const ctaHref  = String(content.ctaHref  ?? "#kontakt");
  const ctaSecText = String((content.ctaSecondaryText as string | undefined) ?? "Naše služby");
  const ctaSecHref = String((content.ctaSecondaryHref as string | undefined) ?? "/sluzby");
  const image    = String(content.image    ?? "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=1200&h=900&fit=crop&fm=webp&q=85");
  const bullets  = (content.bullets as string[] | undefined) ?? [
    "Nejširší síť autoservisů a pneuservisů",
    "Komplexní péče o Vaše vozidlo",
    "Tisíce pneumatik všech rozměrů skladem",
    "Pohodlné objednání servisu online",
  ];

  const DARK    = "#111111";
  const WHITE   = "#ffffff";
  const ORANGE  = "#FFA500";
  const SURFACE = "#F0F1F3";
  const MUTED   = "#6b7280";
  const SANS    = "'Helvetica Neue', Helvetica, Arial, sans-serif";

  const resolve = (href: string) => {
    if (!tenantSlug || href.startsWith("http") || href.startsWith("mailto") || href.startsWith("tel")) return href;
    const base = isAdmin ? `/demo/${tenantSlug}/admin` : `/demo/${tenantSlug}`;
    if (href === "/") return base;
    return base + href;
  };

  return (
    <section
      style={{ position: "relative", width: "100%", minHeight: "100svh", display: "flex", backgroundColor: WHITE }}
      data-template="autoservis-01-hero"
    >
      {/* Left panel — text */}
      <div style={{ flex: "0 0 50%", display: "flex", flexDirection: "column", justifyContent: "center", padding: "clamp(40px, 8vh, 100px) clamp(24px, 5vw, 80px) clamp(40px, 8vh, 100px) clamp(24px, 6vw, 100px)", zIndex: 1 }}>

        {/* H1 */}
        <h1 style={{ fontFamily: SANS, fontSize: "clamp(32px, 3.6vw, 56px)", fontWeight: 800, color: DARK, lineHeight: 1.1, letterSpacing: "-0.02em", margin: "0 0 16px 0", whiteSpace: "pre-line" }}>
          <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
        </h1>

        {/* Subtitle — orange italic */}
        <p style={{ fontFamily: SANS, fontSize: "clamp(16px, 1.6vw, 22px)", fontWeight: 500, fontStyle: "italic", color: ORANGE, margin: "0 0 20px 0", lineHeight: 1.4 }}>
          <GenericEditableText sectionId={sectionId} field="subtitle" value={subtitle} tag="span" />
        </p>

        {/* Bullet list */}
        <ul style={{ listStyle: "none", margin: "0 0 32px 0", padding: 0, display: "flex", flexDirection: "column", gap: 10 }}>
          {bullets.map((b, i) => (
            <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, fontFamily: SANS, fontSize: "clamp(14px, 1.2vw, 16px)", color: MUTED, lineHeight: 1.4 }}>
              <span style={{ flexShrink: 0, marginTop: 3, width: 18, height: 18, borderRadius: "50%", backgroundColor: ORANGE, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="10" height="10" viewBox="0 0 12 10" fill="none" aria-hidden="true">
                  <path d="M1 5 L4.5 8.5 L11 1.5" stroke={DARK} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </span>
              <GenericEditableText sectionId={sectionId} field={`bullets.${i}`} value={b} tag="span" />
            </li>
          ))}
        </ul>

        {/* CTA buttons */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
          <a
            href={resolve(ctaHref)}
            data-btn="primary"
            style={{ display: "inline-flex", alignItems: "center", padding: "14px 28px", backgroundColor: ORANGE, color: DARK, fontFamily: SANS, fontSize: 15, fontWeight: 700, textDecoration: "none", borderRadius: 6, transition: "opacity 0.18s" }}
            onMouseEnter={e => (e.currentTarget.style.opacity = "0.85")}
            onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
          >
            <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
          </a>
          <a
            href={resolve(ctaSecHref)}
            style={{ display: "inline-flex", alignItems: "center", padding: "14px 28px", backgroundColor: "transparent", color: DARK, fontFamily: SANS, fontSize: 15, fontWeight: 600, textDecoration: "none", borderRadius: 6, border: `2px solid ${DARK}`, transition: "background-color 0.18s, color 0.18s" }}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = DARK; e.currentTarget.style.color = WHITE; }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = DARK; }}
          >
            <GenericEditableText sectionId={sectionId} field="ctaSecondaryText" value={ctaSecText} tag="span" />
          </a>
        </div>
      </div>

      {/* Right panel — image */}
      <div style={{ flex: "0 0 50%", position: "relative", overflow: "hidden" }}>
        <GenericEditableImage sectionId={sectionId} field="image" src={image} alt={title.replace(/\n/g, " ")} style={{ position: "absolute", inset: 0 }}>
          <img
            src={image}
            alt={title.replace(/\n/g, " ")}
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center" }}
            loading="eager"
          />
        </GenericEditableImage>
        {/* subtle orange accent strip */}
        <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 4, backgroundColor: ORANGE, zIndex: 1 }} />
      </div>

      {/* Mobile stacking */}
      <style>{`
        @media (max-width: 767px) {
          [data-template="autoservis-01-hero"] {
            flex-direction: column !important;
            min-height: unset !important;
          }
          [data-template="autoservis-01-hero"] > div:first-child {
            flex: unset !important;
            padding: 40px 24px !important;
          }
          [data-template="autoservis-01-hero"] > div:last-child {
            flex: unset !important;
            height: 320px !important;
          }
        }
      `}</style>
    </section>
  );
}

// ── autoservis-03-hero ───────────────────────────────────────────────────────
// Fullscreen dark hero s diagonal gradient + subtle grid pattern
// Navbar je fixed → hero zabírá celý viewport (min-height: 100vh)
// Layout: centrovano — tagline (orange) → velký heading (2 řádky) → subtitle → phone + CTA
// 1:1 referencia: autoservistomas.cz — tmavý dark BMW autoservis
// ────────────────────────────────────────────────────────────────────────────
function HeroAutoservis03({ content, sectionId, tenantSlug, isAdmin }: Omit<Props, "variant">) {
  const tagline    = String(content.tagline    ?? "BMW specializace • Profesionální přístup");
  const titleRaw   = String(content.title      ?? "AUTOSERVIS\nPNEUSERVIS");
  const subtitle   = String(content.subtitle   ?? "Moderní technologie");
  const phone      = String(content.phone      ?? "704 123 456");
  const ctaText    = String(content.ctaText    ?? "Naše služby");
  const ctaHref    = String(content.ctaHref    ?? "#sluzby");
  const cta2Text   = String(content.ctaSecondaryText ?? "Naše práce");
  const cta2Href   = String(content.ctaSecondaryHref ?? "#prace");

  const BLACK  = "#000000";
  const WHITE  = "#ffffff";
  const ORANGE = "#f97316";
  const MUTED  = "#9ca3af";
  const SANS   = "'Inter','Helvetica Neue',Helvetica,Arial,sans-serif";

  const resolve = (href: string) => resolveDemoHref(href, tenantSlug, isAdmin);

  const [line1, line2] = titleRaw.split("\n");

  return (
    <section
      style={{
        position: "relative",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        backgroundColor: BLACK,
      }}
      data-section-id={sectionId}
    >
      {/* Dark diagonal gradient background */}
      <div aria-hidden="true" style={{
        position: "absolute", inset: 0,
        background: "linear-gradient(135deg, #0f0f0f 0%, #000000 40%, #1a1a1a 100%)",
        zIndex: 0,
      }} />

      {/* Subtle grid/dot pattern overlay */}
      <div aria-hidden="true" style={{
        position: "absolute", inset: 0, zIndex: 1,
        backgroundImage: "radial-gradient(circle, rgba(249,115,22,0.08) 1px, transparent 1px)",
        backgroundSize: "40px 40px",
      }} />

      {/* Bottom fade to black */}
      <div aria-hidden="true" style={{
        position: "absolute", bottom: 0, left: 0, right: 0, height: "30%", zIndex: 2,
        background: "linear-gradient(to top, #000000 0%, transparent 100%)",
      }} />

      {/* Content — centrovano, padding-top 64px kvůli fixed navbaru */}
      <div style={{
        position: "relative", zIndex: 10,
        display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center",
        paddingTop: 64, paddingBottom: 80,
        paddingLeft: "clamp(20px,5vw,60px)", paddingRight: "clamp(20px,5vw,60px)",
        maxWidth: 900, margin: "0 auto",
      }}>

        {/* Tagline */}
        <p style={{
          fontFamily: SANS, fontSize: 13, fontWeight: 500, color: ORANGE,
          letterSpacing: "3px", textTransform: "uppercase", marginBottom: 24,
        }}>
          <GenericEditableText sectionId={sectionId} field="tagline" value={tagline} tag="span" />
        </p>

        {/* Main heading — 2 lines, very large */}
        <h1 style={{ margin: 0, lineHeight: 1.0 }}>
          <span style={{
            display: "block", fontFamily: SANS, fontWeight: 900, color: WHITE,
            fontSize: "clamp(56px, 10vw, 120px)", letterSpacing: "-2px", textTransform: "uppercase",
          }}>
            <GenericEditableText sectionId={sectionId} field="title" value={line1 ?? titleRaw} tag="span" />
          </span>
          {line2 && (
            <span style={{
              display: "block", fontFamily: SANS, fontWeight: 900,
              fontSize: "clamp(56px, 10vw, 120px)", letterSpacing: "-2px", textTransform: "uppercase",
              color: "transparent",
              WebkitTextStroke: `2px ${ORANGE}`,
            }}>
              <GenericEditableText sectionId={sectionId} field="titleLine2" value={line2} tag="span" />
            </span>
          )}
        </h1>

        {/* Subtitle */}
        <p style={{
          fontFamily: SANS, fontSize: "clamp(14px,1.6vw,18px)", fontWeight: 400, color: MUTED,
          marginTop: 24, marginBottom: 48, letterSpacing: "1px",
        }}>
          <GenericEditableText sectionId={sectionId} field="subtitle" value={subtitle} tag="span" />
        </p>

        {/* Phone — prominent */}
        <a href={`tel:${phone.replace(/\s/g, "")}`} style={{
          display: "inline-flex", alignItems: "center", gap: 10,
          fontFamily: SANS, fontSize: "clamp(22px,3vw,36px)", fontWeight: 700, color: WHITE,
          textDecoration: "none", marginBottom: 40, transition: "color 0.18s",
        }}
          onMouseEnter={e => (e.currentTarget.style.color = ORANGE)}
          onMouseLeave={e => (e.currentTarget.style.color = WHITE)}
        >
          <span style={{
            width: 42, height: 42, borderRadius: "50%",
            border: `2px solid ${ORANGE}`, display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={ORANGE} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.41 2 2 0 0 1 3.6 1.22h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 8.8a16 16 0 0 0 6.29 6.29l.95-.95a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
            </svg>
          </span>
          <GenericEditableText sectionId={sectionId} field="phone" value={phone} tag="span" />
        </a>

        {/* CTA buttons */}
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap", justifyContent: "center" }}>
          <a href={resolve(ctaHref)} data-btn="primary" style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            padding: "14px 32px",
            background: "linear-gradient(to right, #f97316, #ea6c08)",
            color: WHITE, fontFamily: SANS, fontSize: 15, fontWeight: 700,
            textDecoration: "none", borderRadius: 12, transition: "opacity 0.18s",
            boxShadow: "0 4px 20px rgba(249,115,22,0.35)",
          }}
            onMouseEnter={e => (e.currentTarget.style.opacity = "0.85")}
            onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
          >
            <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </a>
          <a href={resolve(cta2Href)} style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            padding: "14px 32px",
            border: `2px solid rgba(255,255,255,0.3)`,
            color: WHITE, fontFamily: SANS, fontSize: 15, fontWeight: 600,
            textDecoration: "none", borderRadius: 12, transition: "all 0.18s",
            backgroundColor: "transparent",
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = ORANGE; e.currentTarget.style.color = ORANGE; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.3)"; e.currentTarget.style.color = WHITE; }}
          >
            <GenericEditableText sectionId={sectionId} field="ctaSecondaryText" value={cta2Text} tag="span" />
          </a>
        </div>

      </div>

      {/* Scroll indicator */}
      <div style={{
        position: "absolute", bottom: 24, left: "50%", transform: "translateX(-50%)",
        zIndex: 10, display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
      }}>
        <div style={{ width: 1, height: 40, background: `linear-gradient(to bottom, ${ORANGE}, transparent)` }} />
      </div>

      <style>{`
        @media (max-width: 640px) {
          [data-section-id="${sectionId}"] h1 span { letter-spacing: -1px !important; }
        }
      `}</style>
    </section>
  );
}

// ── autoservis-02-hero ───────────────────────────────────────────────────────
// Fullbleed bg foto + rgba(0,0,0,0.62) overlay; bílý H1 + subtitle + 4 bullet
// (červená tečka #d82a2a) + červený filled CTA + bílý outline CTA; Open Sans
// 1:1 referencia: autoservis-garant.cz — expres autoservis Praha
// ────────────────────────────────────────────────────────────────────────────
function HeroAutoservis02({ content, sectionId, tenantSlug, isAdmin }: { content: Record<string, unknown>; sectionId: number; tenantSlug?: string; isAdmin?: boolean }) {
  const title   = String(content.title   ?? "Expres autoservis\nbez čekání");
  const subtitle = String(content.subtitle ?? "Přijeďte klidně hned — opravíme vaše auto rychle, kvalitně a za fér cenu");
  const ctaText  = String(content.ctaText  ?? "Objednat servis");
  const ctaHref  = String(content.ctaHref  ?? "#kontakt");
  const ctaSecondaryText = String(content.ctaSecondaryText ?? "Naše služby");
  const ctaSecondaryHref = String(content.ctaSecondaryHref ?? "/sluzby");
  const bullets  = (content.bullets as string[] | undefined) ?? [];
  const bgImage  = String(content.backgroundImage ?? "https://images.unsplash.com/photo-1530046339160-ce3e530c7d2f?w=1600&h=900&fit=crop&fm=webp&q=85");

  const RED  = "#d82a2a";
  const SANS = "'Open Sans', Arial, sans-serif";

  const resolve = (href: string) => {
    if (!tenantSlug || href.startsWith("#") || href.startsWith("http")) return href;
    if (isAdmin) return `/demo/${tenantSlug}/admin`;
    return `/demo/${tenantSlug}${href === "/" ? "" : href}`;
  };

  return (
    <section style={{ position: "relative", width: "100%", minHeight: 560, display: "flex", alignItems: "center" }} data-template="autoservis-02-hero">
      {/* Background image */}
      <GenericEditableImage sectionId={sectionId} field="backgroundImage" src={bgImage} alt="" style={{ position: "absolute", inset: "0" as unknown as number }}>
        <img loading="eager" src={bgImage} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center" }} />
      </GenericEditableImage>

      {/* Dark overlay */}
      <div style={{ position: "absolute", inset: 0, backgroundColor: "rgba(0,0,0,0.62)" }} aria-hidden />

      {/* Content */}
      <div style={{ position: "relative", zIndex: 2, maxWidth: 1200, margin: "0 auto", padding: "clamp(60px,10vw,100px) clamp(20px,5vw,48px)" }}>
        {/* H1 */}
        <h1 style={{ fontFamily: SANS, fontSize: "clamp(32px,5vw,56px)", fontWeight: 900, color: "#ffffff", lineHeight: 1.15, whiteSpace: "pre-line", margin: "0 0 16px", letterSpacing: "-0.5px" }}>
          <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
        </h1>

        {/* Subtitle */}
        <p style={{ fontFamily: SANS, fontSize: "clamp(15px,2vw,18px)", fontWeight: 400, color: "rgba(255,255,255,0.85)", margin: "0 0 28px", maxWidth: 560, lineHeight: 1.6 }}>
          <GenericEditableText sectionId={sectionId} field="subtitle" value={subtitle} tag="span" />
        </p>

        {/* Bullet USP */}
        {bullets.length > 0 && (
          <ul style={{ listStyle: "none", margin: "0 0 36px", padding: 0, display: "flex", flexDirection: "column", gap: 10 }}>
            {bullets.map((b, i) => (
              <li key={i} style={{ display: "flex", alignItems: "center", gap: 10, fontFamily: SANS, fontSize: "clamp(13px,1.6vw,15px)", fontWeight: 600, color: "#ffffff" }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: RED, flexShrink: 0, display: "inline-block" }} aria-hidden />
                <GenericEditableText sectionId={sectionId} field={`bullets.${i}`} value={b} tag="span" />
              </li>
            ))}
          </ul>
        )}

        {/* CTAs */}
        <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
          <a href={resolve(ctaHref)} data-btn="primary"
            style={{ display: "inline-flex", alignItems: "center", padding: "14px 28px", backgroundColor: RED, color: "#ffffff", fontFamily: SANS, fontSize: 15, fontWeight: 700, textDecoration: "none", borderRadius: 4, transition: "opacity 0.18s", whiteSpace: "nowrap" }}
            onMouseEnter={e => (e.currentTarget.style.opacity = "0.85")}
            onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
          >
            <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
          </a>
          <a href={resolve(ctaSecondaryHref)}
            style={{ display: "inline-flex", alignItems: "center", padding: "14px 28px", backgroundColor: "transparent", color: "#ffffff", fontFamily: SANS, fontSize: 15, fontWeight: 600, textDecoration: "none", border: "2px solid rgba(255,255,255,0.7)", borderRadius: 4, transition: "border-color 0.18s", whiteSpace: "nowrap" }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = "#ffffff")}
            onMouseLeave={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.7)")}
          >
            <GenericEditableText sectionId={sectionId} field="ctaSecondaryText" value={ctaSecondaryText} tag="span" />
          </a>
        </div>
      </div>
    </section>
  );
}

// ── ortho-01-hero ─────────────────────────────────────────────────────────────
// 100vh fullbleed, navbar (84px) transparentně překrývá — padding-top: 84px.
// Pozadí: fotka + rgba(0,0,0,0.45) jednoduchý overlay.
// Obsah vlevo, max-width 560px: H1 Inter 800 bílý + subtitle + Google rating badge.
// Google rating badge: Google "G" logo + hvězdičky SVG + "4,8 z 5" tučně teal + počet recenzí.
// Ref: svetrov.cz hero — levostranný layout, žádné CTA tlačítko (jen scroll dolů k promo stripu).
// ─────────────────────────────────────────────────────────────────────────────
function HeroOrtho01({ content, sectionId, tenantSlug: _t, isAdmin: _a }: Omit<Props, "variant">) {
  const TEAL  = "#00b7ad";
  const WHITE = "#ffffff";
  const FONT  = "'Inter', 'Arial', sans-serif";
  const NAVBAR_H = 92; // shoduje se s výškou NavbarOrtho01

  const c = content as Record<string, unknown>;
  const title        = String(c.title        ?? "Začněte se\nusmívat");
  const subtitle     = String(c.subtitle     ?? "Neviditelná rovnátka změní váš úsměv, a tím i život. V jakémkoli věku.");
  const bgImageRaw   = String(c.bgImage      ?? "/clones/svetrov/cdn/611f682cc4f792d63b03fe16/692fd8825f36c8de4acaac01_Mlada zena + pozadi.avif");
  const bgImage      = bgImageRaw.replace(/ /g, "%20").replace(/\+/g, "%2B");
  const googleRating = String(c.googleRating ?? "4,8 z 5");
  const googleCount  = String(c.googleReviewCount ?? "5 100+ recenzí");

  return (
    <section style={{
      position: "relative",
      width: "100%",
      minHeight: "690px",
      display: "flex",
      alignItems: "center",
      overflow: "hidden",
      fontFamily: FONT,
      backgroundColor: "#0a1520",
    }}>
      {/* Background */}
      <GenericEditableImage sectionId={sectionId} field="bgImage" src={bgImageRaw} alt="Hero pozadí" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
        <img
          src={bgImage}
          alt="Neviditelná rovnátka"
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center center" }}
        />
      </GenericEditableImage>

      {/* Overlay */}
      <div aria-hidden style={{ position: "absolute", inset: 0, backgroundColor: "rgba(0,0,0,0.47)" }} />

      {/* Content — vlevo */}
      <div style={{
        position: "relative",
        zIndex: 2,
        width: "100%",
        maxWidth: 1280,
        margin: "0 auto",
        padding: `${NAVBAR_H + 80}px clamp(20px, 6vw, 80px) 100px`,
      }}>
        <div style={{ maxWidth: 560 }}>

          {/* H1 */}
          <h1 style={{
            fontFamily: FONT,
            fontSize: "clamp(2.6rem, 6vw, 4.2rem)",
            fontWeight: 800,
            color: WHITE,
            lineHeight: 1.1,
            margin: "0 0 20px",
            whiteSpace: "pre-line",
          }}>
            <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
          </h1>

          {/* Subtitle */}
          <p style={{
            fontFamily: FONT,
            fontSize: "clamp(1rem, 2vw, 1.15rem)",
            fontWeight: 400,
            color: "rgba(255,255,255,0.88)",
            lineHeight: 1.6,
            margin: "0 0 32px",
          }}>
            <GenericEditableText sectionId={sectionId} field="subtitle" value={subtitle} tag="span" />
          </p>

          {/* Google rating badge */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            {/* Google G logo */}
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Google" style={{ flexShrink: 0 }}>
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>

            {/* Stars */}
            <svg width="90" height="18" viewBox="0 0 90 18" fill="#FBBC05" xmlns="http://www.w3.org/2000/svg" aria-hidden>
              {[0,1,2,3,4].map(i => (
                <path key={i} transform={`translate(${i*18},0)`} d="M9 1l2.06 6.26H17l-4.81 3.49L14.18 17 9 13.51 3.82 17l1.99-6.25L1 7.26h5.94z"/>
              ))}
            </svg>

            {/* Rating text */}
            <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.2 }}>
              <span style={{ fontFamily: FONT, fontSize: "0.95rem", fontWeight: 700, color: TEAL }}>
                <GenericEditableText sectionId={sectionId} field="googleRating" value={googleRating} tag="span" />
              </span>
              <span style={{ fontFamily: FONT, fontSize: "0.78rem", fontWeight: 600, color: WHITE }}>
                (<GenericEditableText sectionId={sectionId} field="googleReviewCount" value={googleCount} tag="span" />)
              </span>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

// ── dental-01-hero ────────────────────────────────────────────────────────────
// Čistá 100vh fullbleed fotka. Navbar (100px fixed) se překrývá — žádný spacer.
// Žádný text overlay, žádná CTA. Jen velká fotka jako perfect-smile.cz.
// ─────────────────────────────────────────────────────────────────────────────
function HeroDental01({ content, sectionId }: Omit<Props, "variant">) {
  const c = content as Record<string, unknown>;
  const backgroundUrl = String(c.backgroundUrl ?? "/templates/dental-01/hero-bg.webp");

  return (
    <section
      id="uvod"
      style={{
        position: "relative",
        width: "100%",
        height: "100vh",
        overflow: "hidden",
        backgroundColor: "#1a2a3a",
      }}
    >
      <GenericEditableImage
        sectionId={sectionId}
        field="backgroundUrl"
        src={backgroundUrl}
        alt="Hero pozadí"
        style={{ position: "absolute", inset: 0 }}
      >
        <Image
          src={backgroundUrl}
          alt="Dental Care"
          fill
          priority
          className="object-cover"
          sizes="100vw"
          unoptimized={shouldSkipNextImageOptimization(backgroundUrl)}
          style={{ objectPosition: "center center" }}
        />
      </GenericEditableImage>
      <div aria-hidden style={{ position: "absolute", inset: 0, backgroundColor: "rgba(0,0,0,0.38)" }} />
    </section>
  );
}

// ── ortho-02-hero ─────────────────────────────────────────────────────────────
// Fullscreen foto hero (100vh) — navbar plynule nadhore (marginBottom: -80px)
// Velká serif typografie, žádný text pod heading, žádné CTA tlačítko
// Foto: dental/ortodontic konzultace, neutrální tóny
// Reference: perfect-smile.cz
// ─────────────────────────────────────────────────────────────────────────────
interface HeroOrtho02Props {
  content: Record<string, unknown>;
  sectionId: number;
  tenantSlug?: string;
  isAdmin?: boolean;
}
function HeroOrtho02({ content, sectionId }: HeroOrtho02Props) {
  const videoSrc  = String(content.videoSrc ?? "/templates/ortho-02/hero-video.mp4");
  const posterSrc = String(content.bgImage  ?? "/templates/ortho-02/hero-bg.webp");

  return (
    <section
      id="uvod"
      style={{
        position: "relative",
        width: "100%",
        height: "100vh",
        minHeight: 560,
        overflow: "hidden",
        backgroundColor: "#b8b0a8",
      }}
    >
      {/* Hidden editable handles for video/poster */}
      <span style={{ display: "none" }}>
        <GenericEditableText sectionId={sectionId} field="videoSrc" value={videoSrc} tag="span" />
        <GenericEditableText sectionId={sectionId} field="bgImage"  value={posterSrc} tag="span" />
      </span>

      {/* Fullscreen autoplay video */}
      <video
        autoPlay
        muted
        loop
        playsInline
        poster={posterSrc}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          objectPosition: "center 20%",
        }}
      >
        <source src={videoSrc} type="video/mp4" />
      </video>

      {/* Gradient overlay — top for navbar readability + subtle bottom */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(to bottom, rgba(0,0,0,0.30) 0%, rgba(0,0,0,0.0) 35%, rgba(0,0,0,0.15) 100%)",
          pointerEvents: "none",
        }}
      />

      {/* Scroll cue */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          bottom: 36,
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 6,
          color: "rgba(255,255,255,0.7)",
        }}
      >
        <svg width="14" height="22" viewBox="0 0 14 22" fill="none" style={{ animation: "o02hero-scroll 1.6s ease-in-out infinite" }}>
          <path d="M7 1v20M1 14l6 7 6-7" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>

      <style>{`
        @keyframes o02hero-scroll { 0%,100%{transform:translateY(0)} 50%{transform:translateY(5px)} }
      `}</style>
    </section>
  );
}

function HeroLegal02({ content, sectionId: _s, tenantSlug, isAdmin: _a }: Omit<Props, "variant">) {
  const c = content as Record<string, unknown>;

  const NAVY   = "#143171";
  const ORANGE = "#EB5C2E";
  const FONT   = "'bw_gradualbold', 'Montserrat', 'Helvetica Neue', Arial, sans-serif";
  const NAV_H  = 152;

  const tagline       = (c.tagline        as string) ?? "Advokátní kancelář · Praha";
  const title         = (c.title          as string) ?? "Rozumíme právu\ni vašemu podnikání";
  const subtitle      = (c.subtitle       as string) ?? "Naším cílem je, abyste jinou advokátní kancelář už nepotřebovali.";
  const ctaText       = (c.ctaText        as string) ?? "Kontaktujte nás";
  const ctaHref       = (c.ctaHref        as string) ?? "/kontakt";
  const videoId       = (c.videoId        as string) ?? "76mKfaR1064";
  const numberTitle   = (c.numberTitle    as string) ?? "Přes 35 let se podílíme\nna rozvoji české společnosti";
  const numberBody    = (c.numberBody     as string) ?? "";
  const numberCtaText = (c.numberCtaText  as string) ?? "Více o nás";
  const numberCtaHref = (c.numberCtaHref  as string) ?? "/o-nas";
  const stats = Array.isArray(c.stats) ? (c.stats as { value: string; label: string }[]) : [
    { value: "100+", label: "právníků" },
    { value: "60+",  label: "zaměstnanců" },
    { value: "35+",  label: "let na trhu" },
    { value: "14",   label: "partnerů" },
  ];

  const resolve = (href: string) => tenantSlug ? `/demo/${tenantSlug}${href}` : href;

  return (
    <>
      <style>{`
        @font-face {
          font-family: 'bw_gradualbold';
          src: url('/templates/legal-02/bwgradual-bold-webfont.woff2') format('woff2');
          font-display: swap;
        }
        /* ── hero top ── */
        .l02h-wrap {
          max-width: 1440px; margin: 0 auto;
          padding: ${NAV_H + 64}px 80px 0;
          display: flex; align-items: flex-start;
        }
        .l02h-txt {
          width: 520px; flex-shrink: 0;
          margin-right: 100px; padding-bottom: 110px;
        }
        .l02h-vid {
          flex: 1; max-width: 600px; padding-top: 34px;
        }
        .l02h-vid-ratio {
          position: relative; width: 100%; padding-bottom: 56.25%; height: 0; overflow: hidden;
        }
        .l02h-vid-ratio iframe {
          position: absolute; top: 0; left: 0;
          width: 100%; height: 100%; border: 0;
        }
        .l02h-cta {
          display: inline-flex; align-items: center;
          border: 2px solid #EB5C2E; border-radius: 30px;
          color: #fff; padding: 14px 40px;
          font-family: 'bw_gradualbold', 'Montserrat', sans-serif;
          font-size: 18px;
          text-decoration: none; transition: border-color .2s;
        }
        .l02h-cta:hover { border-color: #fff; }
        /* ── hero bottom ── */
        .l02h-nums-wrap {
          max-width: 1440px; margin: 0 auto;
          padding: 0 80px 80px;
          display: flex; align-items: flex-start;
        }
        .l02h-stats {
          display: grid; grid-template-columns: 1fr 1fr;
          flex-shrink: 0;
        }
        .l02h-stat {
          background: #FEF2EE; padding: 44px 32px;
          aspect-ratio: 1 / 1; min-width: 200px;
          display: flex; flex-direction: column; justify-content: flex-end;
        }
        .l02h-article {
          margin-left: 95px; padding-top: 50px; flex: 1;
        }
        .l02h-ncta {
          display: inline-flex; align-items: center; gap: 10px;
          border: 2px solid #143171; border-radius: 30px;
          color: #143171; padding: 14px 40px;
          font-family: 'bw_gradualbold', 'Montserrat', sans-serif;
          font-size: 18px;
          text-decoration: none; transition: background .2s, color .2s;
        }
        .l02h-ncta:hover { background: #143171; color: #fff; }
        @media (max-width: 1024px) {
          .l02h-wrap  { flex-direction: column; padding-bottom: 0; }
          .l02h-txt   { width: 100%; margin-right: 0; padding-bottom: 40px; }
          .l02h-vid   { max-width: 100%; width: 100%; }
          .l02h-nums-wrap { flex-direction: column; }
          .l02h-article   { margin-left: 0; padding-top: 32px; }
        }
      `}</style>

      {/* ── TOP: navy section ── */}
      <section style={{ backgroundColor: NAVY }}>
        <div className="l02h-wrap">

          {/* Left: text */}
          <div className="l02h-txt">
            <p style={{
              fontFamily: FONT, fontSize: 14, letterSpacing: "0.14em",
              textTransform: "uppercase", color: ORANGE, margin: "0 0 20px",
            }}>
              {tagline}
            </p>
            <h1 style={{
              fontFamily: FONT, fontSize: 64, lineHeight: "72px",
              color: "#fff", margin: "0 0 24px", whiteSpace: "pre-line",
            }}>
              {title}
            </h1>
            <p style={{
              fontSize: 24, lineHeight: "32px",
              color: "#fff", margin: "0 0 40px",
            }}>
              {subtitle}
            </p>
            <a href={resolve(ctaHref)} data-btn="primary" className="l02h-cta">{ctaText}</a>
          </div>

          {/* Right: YouTube video flush to bottom */}
          <div className="l02h-vid">
            <div className="l02h-vid-ratio">
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&rel=0`}
                allow="autoplay; encrypted-media; picture-in-picture"
                allowFullScreen
                title="Představení kanceláře"
              />
            </div>
          </div>

        </div>

        {/* White strip — transition to numbers */}
        <div style={{ height: 51, backgroundColor: "#fff" }} />
      </section>

      {/* ── BOTTOM: white stats + article ── */}
      <section style={{ backgroundColor: "#fff" }}>
        <div className="l02h-nums-wrap">

          {/* 2×2 stat cards */}
          <div className="l02h-stats">
            {stats.map((s, i) => (
              <div key={i} className="l02h-stat">
                <strong style={{
                  fontFamily: FONT, fontSize: 64, lineHeight: 1,
                  color: ORANGE, display: "block",
                }}>
                  {s.value}
                </strong>
                <span style={{
                  fontFamily: FONT, fontSize: 20, color: "#1a1a1a",
                  marginTop: 10, display: "block",
                }}>
                  {s.label}
                </span>
              </div>
            ))}
          </div>

          {/* Article */}
          <div className="l02h-article">
            <h2 style={{
              fontFamily: FONT, fontSize: 48, lineHeight: "52px",
              color: "#1a1a1a", margin: "0 0 28px", whiteSpace: "pre-line",
            }}>
              {numberTitle}
            </h2>
            {numberBody && (
              <p style={{ fontSize: 18, lineHeight: 1.7, color: "#6b7280", margin: "0 0 44px" }}>
                {numberBody}
              </p>
            )}
            <a href={resolve(numberCtaHref)} className="l02h-ncta">
              {numberCtaText}
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </a>
          </div>

        </div>
      </section>
    </>
  );
}

// ── lawyer-01-hero ─────────────────────────────────────────────────────────────
function HeroLawyer01({ content, sectionId, tenantSlug, isAdmin }: HeroProps) {
  const NAVY    = "#141760";
  const CRIMSON = "#a70336";
  const WHITE   = "#ffffff";
  const FONT    = "'Source Sans 3','Source Sans Pro','Raleway','Helvetica Neue',Arial,sans-serif";

  const title    = String(content.title    ?? "Největší česko-slovenská advokátní kancelář s mezinárodním dosahem");
  const subtitle = String(content.subtitle ?? "Poskytujeme právní a daňové poradenství ve všech oblastech práva pro přední české, slovenské i mezinárodní klienty.");
  const ctaText  = String(content.ctaText  ?? "Zjistit více");
  const ctaHref  = String(content.ctaHref  ?? "#sluzby");
  const VIDEO    = String(content.videoUrl ?? "/templates/lawyer-01/hp-final.webm");

  void tenantSlug; void isAdmin;

  return (
    <section style={{ position:"relative", width:"100%", minHeight:"75vh", maxHeight:"800px", display:"flex", alignItems:"center", justifyContent:"center", overflow:"hidden", backgroundColor:NAVY }}>
      {/* Video bg */}
      <video autoPlay loop muted playsInline style={{ position:"absolute", inset:0, width:"100%", height:"100%", objectFit:"cover", objectPosition:"center top", zIndex:0, opacity:0.5 }}>
        <source src={VIDEO} type="video/webm" />
      </video>

      {/* Navy gradient overlay */}
      <div style={{ position:"absolute", inset:0, zIndex:1, background:"linear-gradient(170deg,rgba(20,23,96,0.30) 0%,rgba(20,23,96,0.12) 50%,rgba(20,23,96,0.28) 100%)" }} />

      {/* Content */}
      <div style={{ position:"relative", zIndex:2, maxWidth:860, margin:"0 auto", padding:"0 32px", textAlign:"center", display:"flex", flexDirection:"column", alignItems:"center" }}>
        <div style={{ width:48, height:3, backgroundColor:CRIMSON, marginBottom:28, borderRadius:2 }} />
        <h1 style={{ fontFamily:FONT, fontWeight:700, fontSize:"clamp(1.9rem,4.2vw,3.4rem)", lineHeight:1.15, color:WHITE, letterSpacing:"0.01em", textTransform:"uppercase", margin:"0 0 24px" }}>
          <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
        </h1>
        <p style={{ fontFamily:FONT, fontWeight:300, fontSize:"clamp(1rem,1.4vw,1.2rem)", lineHeight:1.7, color:"rgba(255,255,255,0.82)", margin:"0 0 44px", maxWidth:640 }}>
          <GenericEditableText sectionId={sectionId} field="subtitle" value={subtitle} tag="span" />
        </p>
        <a href={ctaHref} data-btn="primary"
          style={{ display:"inline-flex", alignItems:"center", gap:10, backgroundColor:CRIMSON, color:WHITE, fontFamily:FONT, fontWeight:700, fontSize:"0.82rem", letterSpacing:"0.12em", textTransform:"uppercase", padding:"14px 36px", textDecoration:"none", transition:"background-color 0.2s" }}
          onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.backgroundColor = "#870229"; }}
          onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.backgroundColor = CRIMSON; }}
        >
          <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
        </a>
      </div>

      {/* Scroll cue */}
      <div aria-hidden style={{ position:"absolute", bottom:32, left:"50%", transform:"translateX(-50%)", zIndex:2, color:"rgba(255,255,255,0.45)", animation:"l01hero-scroll 2s ease-in-out infinite" }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M12 5v14M5 12l7 7 7-7"/></svg>
      </div>

      <style>{`@keyframes l01hero-scroll{0%,100%{opacity:.4;transform:translateX(-50%) translateY(0)}50%{opacity:.8;transform:translateX(-50%) translateY(6px)}}`}</style>
    </section>
  );
}

// ── stavba-01-hero ────────────────────────────────────────────────────────────
function HeroStavba01({ content, sectionId, tenantSlug, isAdmin }: Omit<Props, "variant">) {
  const c = content as Record<string, unknown>;

  const ORANGE = "#FF6F0D";
  const WHITE  = "#ffffff";
  const FONT   = "'Inter', sans-serif";

  const label      = String(c.label      ?? "Stavební firma");
  const title      = String(c.title      ?? "Rekonstrukce bytů\na stavby rodinných domů");
  const subtitle   = String(c.subtitle   ?? "Stavíme tak, abychom tam sami chtěli bydlet.");
  const ctaText    = String(c.ctaText    ?? "Nezávazná konzultace");
  const ctaHref    = String(c.ctaHref    ?? "#kontakt");
  const ctaSecText = String(c.ctaSecondaryText ?? "Naše reference");
  const ctaSecHref = String(c.ctaSecondaryHref ?? "/reference");
  const image      = String(c.image ?? "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=1800&h=1000&fit=crop&fm=webp&q=90");

  const heroServices = (c.heroServices as Array<{ name: string; icon: string }>) ?? [
    { name: "Rekonstrukce bytů a domů",    icon: "house" },
    { name: "Rodinné domy na klíč",         icon: "key" },
    { name: "Revitalizace bytových domů",   icon: "revitalization" },
    { name: "Stavební práce & development", icon: "builder" },
  ];

  function resolveDemoHref(href: string) {
    if (!href || href.startsWith("http") || href.startsWith("#")) return href;
    if (tenantSlug) {
      const base = isAdmin ? `/demo/${tenantSlug}/admin` : `/demo/${tenantSlug}`;
      return base + (href.startsWith("/") ? href : "/" + href);
    }
    return href;
  }

  const ServiceIcon = ({ icon }: { icon: string }) => {
    if (icon === "house") return (
      <svg viewBox="0 0 76 73" fill="none" width="28" height="28" aria-hidden="true">
        <path d="M44.476 0H31.525a3.88 3.88 0 0 0-2.69 1.069C24.856 4.89 11.035 18.167 1.113 27.696A3.578 3.578 0 0 0 0 30.28v39.064C0 71.363 1.704 73 3.806 73h16.167c2.102 0 3.806-1.637 3.806-3.656V44.5c0-2.02 1.704-3.656 3.806-3.656h20.799c2.102 0 3.806 1.637 3.806 3.656v24.843c0 2.019 1.704 3.656 3.806 3.656h16.198C74.296 73 76 71.363 76 69.344V30.28c0-.97-.401-1.9-1.115-2.585L47.168 1.07A3.888 3.888 0 0 0 44.476 0Z" fill="currentColor"/>
      </svg>
    );
    if (icon === "key") return (
      <svg viewBox="0 0 75 73" fill="none" width="28" height="28" aria-hidden="true">
        <path d="M73.835 24.345 50.085 1.137a4.04 4.04 0 0 0-5.62 0l-13.37 13.066-10.421 10.183a3.822 3.822 0 0 0-.002 5.49l4.844 4.733a3.442 3.442 0 0 1-.064 5.007L1.112 62.232A3.46 3.46 0 0 0 0 64.766V71.8c0 .663.55 1.2 1.228 1.2H12.73c.678 0 1.228-.537 1.228-1.2v-5.88c0-.663.55-1.2 1.228-1.2h6.016c.679 0 1.229-.538 1.229-1.2v-5.88c0-.662.55-1.2 1.228-1.2h6.018c.678 0 1.228-.537 1.228-1.2v-5.88c0-.664.55-1.201 1.229-1.201h7.244v-.008l5.047 4.932a4.04 4.04 0 0 0 5.62 0l23.792-23.25a3.822 3.822 0 0 0 0-5.49h-.002Z" fill="currentColor"/>
      </svg>
    );
    if (icon === "revitalization") return (
      <svg viewBox="0 0 73 73" fill="none" width="28" height="28" aria-hidden="true">
        <path d="M70.756 17.002 37.892.372a3.439 3.439 0 0 0-3.107 0L1.92 17.001A3.523 3.523 0 0 0 0 20.15v12.625c0 1.943 1.556 3.518 3.475 3.518h65.727c1.92 0 3.475-1.575 3.475-3.518V20.15a3.523 3.523 0 0 0-1.92-3.147Zm0 36.711L37.892 37.082a3.438 3.438 0 0 0-3.107 0L1.92 53.713A3.523 3.523 0 0 0 0 56.86v12.625c0 1.943 1.556 3.518 3.475 3.518h65.727c1.92 0 3.475-1.575 3.475-3.518V56.86a3.522 3.522 0 0 0-1.92-3.147Z" fill="currentColor"/>
      </svg>
    );
    return (
      <svg viewBox="0 0 73 73" fill="none" width="28" height="28" aria-hidden="true">
        <path d="M57.129 23.183h-1.576v-4.411c0-6.56-3.938-12.2-9.578-14.689v12.444a.47.47 0 0 1-.139.334l-1.928 1.928a.472.472 0 0 1-.806-.333V3.13l-.066-.015A3.82 3.82 0 0 0 39.283 0H33.72a3.82 3.82 0 0 0-3.753 3.115l-.066.015v15.325c0 .42-.508.631-.805.334l-1.929-1.929a.473.473 0 0 1-.138-.334V4.083c-5.641 2.488-9.578 8.128-9.578 14.689v4.411h-1.577a2.133 2.133 0 0 0-2.133 2.133v6.42c0 1.178.955 2.134 2.133 2.134H57.13a2.133 2.133 0 0 0 2.133-2.134v-6.42a2.133 2.133 0 0 0-2.133-2.133Zm20.566 13.915H3.649A3.649 3.649 0 0 0 0 42.555V69.35A3.649 3.649 0 0 0 3.649 73h27.54l3.848-17.114-6.694-6.693c.705-1.7.757-1.826 1.46-3.526h13.388l1.46 3.526-6.694 6.693L41.812 73h27.54A3.649 3.649 0 0 0 73 69.35V42.556a3.649 3.649 0 0 0-3.65-3.649Z" fill="currentColor"/>
      </svg>
    );
  };

  return (
    <section
      id="uvod"
      style={{ position: "relative", minHeight: "100svh", fontFamily: FONT, display: "flex", flexDirection: "column" }}
      data-template="stavba-01"
    >
      {/* Background image */}
      <div style={{ position: "absolute", inset: 0, zIndex: 0 }}>
        <GenericEditableImage sectionId={sectionId} field="image" src={image} alt="Stavební firma" className="relative overflow-hidden w-full h-full" style={{ height: "100%" }}>
          <Image src={image} alt="Stavební firma" fill className="object-cover" sizes="100vw" unoptimized={shouldSkipNextImageOptimization(image)} priority />
        </GenericEditableImage>
        {/* Gradient: heavy left+bottom, lighter right */}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(105deg, rgba(15,15,15,0.88) 0%, rgba(15,15,15,0.60) 50%, rgba(15,15,15,0.30) 100%)" }} />
        {/* Top fade for navbar readability */}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0.35) 0%, transparent 30%)" }} />
      </div>

      {/* Content area */}
      <div style={{ position: "relative", zIndex: 1, flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", maxWidth: 1200, margin: "0 auto", padding: "140px 32px 60px", width: "100%" }}>

        {/* Orange badge */}
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, marginBottom: 24, width: "fit-content" }}>
          <span style={{ display: "block", width: 32, height: 3, backgroundColor: ORANGE, borderRadius: 2 }} />
          <span style={{ color: ORANGE, fontSize: "0.8rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase" }}>
            <GenericEditableText sectionId={sectionId} field="label" value={label} tag="span" />
          </span>
        </div>

        {/* H1 */}
        <h1 style={{ color: WHITE, fontSize: "clamp(38px, 6vw, 80px)", fontWeight: 800, lineHeight: 1.05, letterSpacing: "-0.03em", margin: "0 0 20px", maxWidth: 760, whiteSpace: "pre-line" }}>
          <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
        </h1>

        {/* Subtitle */}
        <p style={{ color: "rgba(255,255,255,0.70)", fontSize: "clamp(16px, 1.6vw, 20px)", fontWeight: 400, lineHeight: 1.65, margin: "0 0 44px", maxWidth: 520 }}>
          <GenericEditableText sectionId={sectionId} field="subtitle" value={subtitle} tag="span" />
        </p>

        {/* CTAs */}
        <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
          <a
            href={resolveDemoHref(ctaHref)}
            data-btn="primary"
            style={{ display: "inline-flex", alignItems: "center", backgroundColor: ORANGE, color: WHITE, fontFamily: FONT, fontSize: "0.95rem", fontWeight: 700, padding: "16px 36px", borderRadius: 8, textDecoration: "none", letterSpacing: "0.01em", boxShadow: "0 4px 20px rgba(255,111,13,0.40)", transition: "opacity 0.18s, transform 0.18s" }}
            onMouseEnter={e => { e.currentTarget.style.opacity = "0.9"; e.currentTarget.style.transform = "translateY(-2px)"; }}
            onMouseLeave={e => { e.currentTarget.style.opacity = "1"; e.currentTarget.style.transform = "translateY(0)"; }}
          >
            <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
          </a>
          <a
            href={resolveDemoHref(ctaSecHref)}
            style={{ display: "inline-flex", alignItems: "center", gap: 8, color: "rgba(255,255,255,0.88)", fontFamily: FONT, fontSize: "0.95rem", fontWeight: 600, padding: "16px 24px", borderRadius: 8, textDecoration: "none", border: "1px solid rgba(255,255,255,0.28)", transition: "background-color 0.18s, border-color 0.18s" }}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.10)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.50)"; }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.28)"; }}
          >
            <GenericEditableText sectionId={sectionId} field="ctaSecondaryText" value={ctaSecText} tag="span" />
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </a>
        </div>
      </div>

      {/* Services strip — dark glass bar at bottom */}
      <div style={{ position: "relative", zIndex: 1, borderTop: "1px solid rgba(255,255,255,0.12)", backgroundColor: "rgba(10,10,10,0.55)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 32px", display: "grid", gridTemplateColumns: "repeat(4,1fr)" }} className="stavba-hero-strip">
          {heroServices.map((svc, i) => (
            <div
              key={i}
              style={{ display: "flex", alignItems: "center", gap: 14, padding: "22px 0", borderRight: i < 3 ? "1px solid rgba(255,255,255,0.10)" : "none", paddingRight: i < 3 ? 24 : 0, paddingLeft: i > 0 ? 24 : 0 }}
            >
              <span style={{ color: ORANGE, flexShrink: 0 }}>
                <ServiceIcon icon={svc.icon} />
              </span>
              <span style={{ fontFamily: FONT, fontSize: "0.875rem", fontWeight: 600, color: "rgba(255,255,255,0.88)", lineHeight: 1.3 }}>
                <GenericEditableText sectionId={sectionId} field={`heroServices.${i}.name`} value={svc.name} tag="span" />
              </span>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) { .stavba-hero-strip { grid-template-columns: repeat(2,1fr) !important; } }
        @media (max-width: 480px) { .stavba-hero-strip { grid-template-columns: 1fr !important; } }
      `}</style>
    </section>
  );
}

function S02StatItem({ end, suffix, label, format, run, font, brown, white, sectionId, fieldPrefix }: {
  end: number; suffix: string; label: string; format?: (n: number) => string;
  run: boolean; isLast?: boolean; font: string; brown: string; white: string;
  sectionId: number; fieldPrefix: string;
}) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!run) return;
    const dur = 1800;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setVal(Math.round(eased * end));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [run, end]);
  const display = format ? format(val) : val.toString();
  return (
    <div style={{ textAlign: "left", padding: "0 24px 0 0" }}>
      <div style={{ fontFamily: font, fontSize: "clamp(32px, 3.8vw, 48px)", fontWeight: 800, color: brown, lineHeight: 1, letterSpacing: "-0.02em" }}>
        {display}<GenericEditableText sectionId={sectionId} field={`${fieldPrefix}.suffix`} value={suffix} tag="span" />
      </div>
      <div style={{ fontFamily: font, fontSize: "0.75rem", color: "rgba(255,255,255,0.52)", marginTop: 6, lineHeight: 1.4, textTransform: "uppercase", letterSpacing: "0.06em" }}>
        <GenericEditableText sectionId={sectionId} field={`${fieldPrefix}.label`} value={label} tag="span" />
      </div>
    </div>
  );
  void white;
}

// ── stavba-02-hero ────────────────────────────────────────────────────────────
// 3-slide auto-crossfade (3.5 s, heroZoom animation), left-aligned text
// min-h 600px/700px (not fullscreen), black/45 overlay
// CTAs: brown filled + white bg, reference link, USP white cards below (overlap via negative margin)
function HeroStavba02({ content, sectionId, tenantSlug, isAdmin }: Omit<Props, "variant">) {
  const c = content as Record<string, unknown>;
  const [slide, setSlide] = useState(0);

  const BROWN  = "#674832";
  const WHITE  = "#ffffff";
  const CREAM  = "#F8F5F0";
  const DARK   = "#2D1A0F";
  const FONT   = "'Roboto', sans-serif";

  const title       = String(c.title       ?? "Profesionální rekonstrukce bytů, bytových jader a domů na klíč");
  const subtitle    = String(c.subtitle    ?? "Rychlá, kvalitní a spolehlivá realizace.");
  const ctaText     = String(c.ctaText     ?? "Nezávazná poptávka");
  const ctaHref     = String(c.ctaHref     ?? "#kontakt");
  const ctaSecText  = String(c.ctaSecondaryText  ?? "Zobrazit realizace");
  const ctaSecHref  = String(c.ctaSecondaryHref  ?? "/fotogalerie");
  const refLinkText = String(c.refLinkText ?? "Přečtěte si reference zákazníků");
  const refLinkHref = String(c.refLinkHref ?? "/reference");

  const defaultImages = [
    "https://images.unsplash.com/photo-1556912172-45b7abe8b7e1?w=1800&h=1000&fit=crop&fm=webp&q=90",
    "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=1800&h=1000&fit=crop&fm=webp&q=90",
    "https://images.unsplash.com/photo-1502005229762-cf1b2da7c5d6?w=1800&h=1000&fit=crop&fm=webp&q=90",
  ];
  const images = ((c.images as string[]) ?? []).filter(Boolean).length >= 2
    ? (c.images as string[])
    : defaultImages;

  const uspItems = (c.uspItems as Array<{ icon: string; title: string; text?: string }>) ?? [
    { icon: "clock",  title: "Dlouholeté zkušenosti",       text: "Více než 25 let praxe v oblasti rekonstrukcí bytů a jader." },
    { icon: "shield", title: "Profesionální servis",         text: "Garantujeme vysoký standard práce a dodržení termínů." },
    { icon: "check",  title: "Kvalitní a ověřené materiály", text: "Používáme pouze prověřené materiály od spolehlivých dodavatelů." },
  ];

  const resolve = (href: string) => {
    if (!href || href.startsWith("http") || href.startsWith("#")) return href;
    if (tenantSlug) {
      const base = isAdmin ? `/demo/${tenantSlug}/admin` : `/demo/${tenantSlug}`;
      return base + (href.startsWith("/") ? href : "/" + href);
    }
    return href;
  };

  const statsRef = useRef<HTMLDivElement>(null);
  const [statsVisible, setStatsVisible] = useState(false);

  useEffect(() => {
    if (images.length < 2) return;
    const t = setInterval(() => setSlide(s => (s + 1) % images.length), 3500);
    return () => clearInterval(t);
  }, [images.length]);

  useEffect(() => {
    const el = statsRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setStatsVisible(true); obs.disconnect(); } }, { threshold: 0.3 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const UspIcon = ({ icon, size = 28 }: { icon: string; size?: number }) => {
    const s = { width: size, height: size };
    if (icon === "clock") return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={s}>
        <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
      </svg>
    );
    if (icon === "shield") return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={s}>
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      </svg>
    );
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={s}>
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="M22 4 12 14.01l-3-3"/>
      </svg>
    );
  };

  return (
    <section
      id="uvod"
      ref={statsRef}
      style={{ position: "relative", minHeight: "clamp(520px, 48vw, 640px)", display: "flex", flexDirection: "column", fontFamily: FONT, isolation: "isolate", overflow: "hidden" }}
      data-template="stavba-02"
    >
      {/* Slides */}
      {images.map((src, i) => (
        <div key={i} style={{ position: "absolute", inset: 0, opacity: i === slide ? 1 : 0, transition: "opacity 0.8s ease", animation: i === slide ? "s02HeroZoom 4s ease-out forwards" : "none" }}>
          <GenericEditableImage sectionId={sectionId} field={`images.${i}`} src={src} alt={`Rekonstrukce realizace ${i + 1}`} className="relative overflow-hidden w-full h-full" style={{ height: "100%" }}>
            <Image src={src} alt={`Rekonstrukce realizace ${i + 1}`} fill className="object-cover" sizes="100vw" unoptimized={shouldSkipNextImageOptimization(src)} priority={i === 0} />
          </GenericEditableImage>
        </div>
      ))}

      {/* Uniform overlay */}
      <div style={{ position: "absolute", inset: 0, backgroundColor: "rgba(0,0,0,0.28)", zIndex: 1 }} />

      {/* Bottom gradient — fades to dark where stats live */}
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "45%", background: "linear-gradient(to bottom, transparent 0%, rgba(20,8,2,0.82) 100%)", zIndex: 2, pointerEvents: "none" }} />

      {/* Main content — upper area */}
      <div style={{ position: "relative", zIndex: 3, flex: 1, display: "flex", alignItems: "center", maxWidth: 1200, margin: "0 auto", padding: "48px clamp(16px, 4vw, 32px) 20px", width: "100%" }}>
        <div style={{ maxWidth: 700 }}>
          <h1 style={{ color: WHITE, fontSize: "clamp(28px, 4vw, 56px)", fontWeight: 700, lineHeight: 1.15, letterSpacing: "-0.02em", margin: "0 0 18px", textShadow: "0 2px 16px rgba(0,0,0,0.45)" }}>
            <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
          </h1>
          <p style={{ color: "rgba(255,255,255,0.85)", fontSize: "clamp(14px, 1.4vw, 17px)", lineHeight: 1.65, margin: "0 0 28px", maxWidth: 480 }}>
            <GenericEditableText sectionId={sectionId} field="subtitle" value={subtitle} tag="span" />
          </p>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
            <a href={resolve(ctaHref)} data-btn="primary" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", backgroundColor: BROWN, color: WHITE, fontFamily: FONT, fontSize: "0.88rem", fontWeight: 600, padding: "12px 28px", borderRadius: 6, textDecoration: "none", whiteSpace: "nowrap", transition: "opacity 0.18s" }} onMouseEnter={e => { e.currentTarget.style.opacity = "0.88"; }} onMouseLeave={e => { e.currentTarget.style.opacity = "1"; }}>
              <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
            </a>
            <a href={resolve(ctaSecHref)} style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", backgroundColor: WHITE, color: BROWN, fontFamily: FONT, fontSize: "0.88rem", fontWeight: 600, padding: "12px 28px", borderRadius: 8, textDecoration: "none", whiteSpace: "nowrap", boxShadow: "0 2px 10px rgba(0,0,0,0.2)", transition: "opacity 0.18s" }} onMouseEnter={e => { e.currentTarget.style.opacity = "0.9"; }} onMouseLeave={e => { e.currentTarget.style.opacity = "1"; }}>
              <GenericEditableText sectionId={sectionId} field="ctaSecondaryText" value={ctaSecText} tag="span" />
            </a>
          </div>
          <div style={{ marginTop: 16 }}>
            <a href={resolve(refLinkHref)} style={{ color: "rgba(255,255,255,0.7)", fontFamily: FONT, fontSize: "0.82rem", fontWeight: 500, textDecoration: "underline", textUnderlineOffset: 4, transition: "color 0.15s" }} onMouseEnter={e => { e.currentTarget.style.color = WHITE; }} onMouseLeave={e => { e.currentTarget.style.color = "rgba(255,255,255,0.7)"; }}>
              <GenericEditableText sectionId={sectionId} field="refLinkText" value={refLinkText} tag="span" />
            </a>
          </div>
        </div>
      </div>

      {/* Stats — overlaid on the bottom gradient, inside the hero */}
      <div style={{ position: "relative", zIndex: 3, maxWidth: 1200, margin: "0 auto", width: "100%", padding: "0 clamp(16px, 4vw, 32px) 28px" }}>
        <div className="s02-stats-row">
          {(([
            { end: 46,    suffix: "+",    label: "Realizovaných projektů",      key: "stats.0" },
            { end: 12860, suffix: " m²",  label: "Postaveno a zrekonstruováno", key: "stats.1", fmt: (n: number) => n.toLocaleString("cs-CZ") },
            { end: 15,    suffix: " let", label: "Zkušeností na trhu",          key: "stats.2" },
          ]) as Array<{ end: number; suffix: string; label: string; key: string; fmt?: (n: number) => string }>).map((stat, i) => (
            <S02StatItem key={i} end={stat.end} suffix={stat.suffix} label={stat.label} format={stat.fmt} run={statsVisible} isLast={i === 2} font={FONT} brown={"#C4956A"} white={WHITE} sectionId={sectionId} fieldPrefix={stat.key} />
          ))}
        </div>
      </div>

      {/* Slide dots */}
      {images.length > 1 && (
        <div style={{ position: "absolute", bottom: 10, right: 32, zIndex: 4, display: "flex", gap: 6 }}>
          {images.map((_, i) => (
            <button key={i} onClick={() => setSlide(i)} aria-label={`Slide ${i + 1}`} style={{ width: i === slide ? 20 : 6, height: 6, borderRadius: 3, border: "none", cursor: "pointer", backgroundColor: i === slide ? WHITE : "rgba(255,255,255,0.35)", padding: 0, transition: "width 0.3s, background-color 0.3s" }} />
          ))}
        </div>
      )}

      <style>{`
        @keyframes s02HeroZoom { from { transform: scale(1); } to { transform: scale(1.07); } }
        .s02-stats-row { display: flex; gap: 0; }
        .s02-stats-row > * { flex: 1; }
        @media (max-width: 600px) { .s02-stats-row { flex-direction: column; gap: 8px; } }
      `}</style>
    </section>
  );
}

// ── stavba-03-hero ────────────────────────────────────────────────────────────
// 100vh fullscreen 3-slide crossfade (7 s auto-advance)
// Pause: pointer/touch down → resume on release
// Layout: centrovaný tag + H1 + subtitle + 2 CTA + stats bar dole
// ─────────────────────────────────────────────────────────────────────────────
function HeroStavba03({ content, sectionId, tenantSlug, isAdmin }: Omit<Props, "variant">) {
  const c = content as Record<string, unknown>;

  const ORANGE = "#fa7d19";
  const WHITE  = "#ffffff";
  const DARK   = "#1b1a1a";
  const FONT   = "'Roboto', sans-serif";
  const INTERVAL = 4500;
  const FADE_MS  = 600;

  const headline    = String(c.headline    ?? String(c.title    ?? "Rekonstrukce bytů a stavby domů v Praze bez záloh"));
  const subheadline = String(c.subheadline ?? String(c.subtitle ?? "Rodinné domy, rekonstrukce bytů, koupelen a řemeslné práce. Pracujeme po etapách, se smlouvou a jasným harmonogramem."));
  const tag         = String(c.tag         ?? "Stavební firma Praha a okolí");
  const ctaText     = String(c.ctaText     ?? "Nezávazná poptávka");
  const ctaHref     = String(c.ctaHref     ?? "#kontakt");
  const ctaSecText  = String(c.ctaSecondaryText  ?? "Naše realizace");
  const ctaSecHref  = String(c.ctaSecondaryHref  ?? "#reference");

  const defaultImages = [
    "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=1800&h=1000&fit=crop&fm=webp&q=85",
    "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1800&h=1000&fit=crop&fm=webp&q=85",
    "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=1800&h=1000&fit=crop&fm=webp&q=85",
  ];
  const rawImages = ((c.images as string[]) ?? []).filter(Boolean);
  const images = rawImages.length >= 2 ? rawImages : defaultImages;

  const statsItems = (c.statsItems as Array<{ value: string; suffix: string; label: string }>) ??
    (c.items as Array<{ value: string; suffix: string; label: string }>) ?? [
      { value: "46",      suffix: "+",   label: "Realizovaných projektů" },
      { value: "12 860",  suffix: " m²", label: "Postaveno a zrekonstruováno" },
      { value: "15",      suffix: " let", label: "Zkušeností na trhu" },
    ];

  const [slide,     setSlide]    = useState(0);
  const [prevSlide, setPrevSlide] = useState(-1);
  const [busy,      setBusy]     = useState(false);
  const [paused,    setPaused]   = useState(false);
  const intervalRef  = useRef<ReturnType<typeof setInterval> | null>(null);

  // Preload all images immediately so crossfade never shows grey
  useEffect(() => {
    images.forEach(src => {
      if (src && !src.startsWith("data:")) {
        const img = new window.Image();
        img.src = src;
      }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const statsBarRef  = useRef<HTMLDivElement>(null);
  const animatedRef  = useRef(false);
  const [counts, setCounts] = useState<number[]>(statsItems.map(() => 0));

  useEffect(() => {
    const el = statsBarRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !animatedRef.current) {
        animatedRef.current = true;
        statsItems.forEach((stat, idx) => {
          const target = parseInt(String(stat.value).replace(/[\s ]/g, ""), 10);
          if (isNaN(target) || target === 0) return;
          const duration = 1400;
          const startTime = performance.now();
          const tick = (now: number) => {
            const t = Math.min((now - startTime) / duration, 1);
            const eased = 1 - Math.pow(1 - t, 3);
            setCounts(prev => { const next = [...prev]; next[idx] = Math.round(target * eased); return next; });
            if (t < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        });
      }
    }, { threshold: 0.4 });
    obs.observe(el);
    return () => obs.disconnect();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function resolve(href: string) {
    if (!href || href.startsWith("http") || href.startsWith("#")) return href;
    if (tenantSlug) {
      const base = isAdmin ? `/demo/${tenantSlug}/admin` : `/demo/${tenantSlug}`;
      return base + (href.startsWith("/") ? href : "/" + href);
    }
    return href;
  }

  const goSlide = useCallback((dir: 1 | -1) => {
    if (busy) return;
    const next = (slide + dir + images.length) % images.length;
    setPrevSlide(slide);   // old slide stays visible underneath
    setSlide(next);        // new slide fades in on top
    setBusy(true);
    setTimeout(() => {
      setPrevSlide(-1);
      setBusy(false);
    }, FADE_MS + 50);
  }, [busy, slide, images.length]);

  const advance = useCallback(() => goSlide(1), [goSlide]);

  useEffect(() => {
    if (images.length < 2 || paused) return;
    intervalRef.current = setInterval(advance, INTERVAL);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [images.length, paused, advance]);

  const pause  = () => setPaused(true);
  const resume = () => setPaused(false);

  return (
    <section
      id="uvod"
      style={{ position: "relative", minHeight: "85vh", fontFamily: FONT, display: "flex", flexDirection: "column", userSelect: "none" }}
      data-template="stavba-03"
      onMouseDown={pause}
      onMouseUp={resume}
      onMouseLeave={resume}
      onTouchStart={pause}
      onTouchEnd={resume}
      onTouchCancel={resume}
    >
      {/* Slides — crossfade: active fades in on top, prev stays visible underneath */}
      <div style={{ position: "absolute", inset: 0, zIndex: 0, overflow: "hidden" }}>
        {images.map((src, i) => {
          const isActive = i === slide;
          const isPrev   = i === prevSlide;
          return (
            <div
              key={i}
              aria-hidden={!isActive}
              style={{
                position: "absolute", inset: 0,
                opacity: isActive || isPrev ? 1 : 0,
                zIndex: isActive ? 2 : isPrev ? 1 : 0,
                transition: isActive ? `opacity ${FADE_MS}ms ease` : "none",
              }}
            >
              <Image
                src={src}
                alt={`Stavební realizace ${i + 1}`}
                fill
                className="object-cover"
                sizes="100vw"
                unoptimized={shouldSkipNextImageOptimization(src)}
                priority
              />
            </div>
          );
        })}
        {/* Overlay */}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0.32) 0%, rgba(0,0,0,0.22) 60%, rgba(0,0,0,0.42) 100%)", zIndex: 3 }} />
      </div>

      {/* Slider arrows */}
      {images.length > 1 && (
        <>
          <button
            onClick={(e) => { e.stopPropagation(); goSlide(-1); }}
            aria-label="Předchozí snímek"
            className="stavba03-arrow-left"
            style={{
              position: "absolute", left: 20, top: "50%", transform: "translateY(-50%)",
              zIndex: 3, background: "rgba(255,255,255,0.15)", border: "2px solid rgba(255,255,255,0.5)",
              borderRadius: "50%", width: 48, height: 48, display: "flex", alignItems: "center",
              justifyContent: "center", cursor: "pointer", color: WHITE,
              transition: "background 0.2s, border-color 0.2s",
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(250,125,25,0.85)"; e.currentTarget.style.borderColor = ORANGE; }}
            onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.15)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.5)"; }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); goSlide(1); }}
            aria-label="Další snímek"
            className="stavba03-arrow-right"
            style={{
              position: "absolute", right: 20, top: "50%", transform: "translateY(-50%)",
              zIndex: 3, background: "rgba(255,255,255,0.15)", border: "2px solid rgba(255,255,255,0.5)",
              borderRadius: "50%", width: 48, height: 48, display: "flex", alignItems: "center",
              justifyContent: "center", cursor: "pointer", color: WHITE,
              transition: "background 0.2s, border-color 0.2s",
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(250,125,25,0.85)"; e.currentTarget.style.borderColor = ORANGE; }}
            onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.15)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.5)"; }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </button>
        </>
      )}

      {/* Main content */}
      <div
        style={{
          position: "relative", zIndex: 2, flex: 1, display: "flex", flexDirection: "column",
          justifyContent: "center", maxWidth: 1200, margin: "0 auto", padding: "100px 32px 60px", width: "100%",
        }}
      >
        {/* Tag */}
        <div style={{ display: "inline-flex", marginBottom: 18 }}>
          <span style={{
            display: "inline-block", backgroundColor: ORANGE, color: WHITE,
            fontFamily: FONT, fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.12em",
            textTransform: "uppercase", padding: "6px 16px", borderRadius: 2,
          }}>
            <GenericEditableText sectionId={sectionId} field="tag" value={tag} tag="span" />
          </span>
        </div>

        {/* H1 */}
        <h1 style={{ color: WHITE, fontSize: "clamp(2rem, 4.5vw, 3.6rem)", fontWeight: 700, lineHeight: 1.1, letterSpacing: "-0.01em", margin: "0 0 20px", maxWidth: 780 }}>
          <GenericEditableText sectionId={sectionId} field="headline" value={headline} tag="span" />
        </h1>

        {/* Subtitle */}
        <p style={{ color: "rgba(255,255,255,0.82)", fontSize: "clamp(15px, 1.4vw, 18px)", fontWeight: 400, lineHeight: 1.65, margin: "0 0 40px", maxWidth: 560 }}>
          <GenericEditableText sectionId={sectionId} field="subheadline" value={subheadline} tag="span" />
        </p>

        {/* CTAs */}
        <div style={{ display: "flex", gap: 14, flexWrap: "wrap", alignItems: "center" }}>
          <a
            href={resolve(ctaHref)}
            data-btn="primary"
            style={{ display: "inline-flex", alignItems: "center", gap: 8, backgroundColor: ORANGE, color: WHITE, fontFamily: FONT, fontSize: "0.9rem", fontWeight: 600, padding: "14px 30px", borderRadius: 3, textDecoration: "none", letterSpacing: "0.02em", boxShadow: "0 4px 20px rgba(250,125,25,0.40)", transition: "opacity 0.18s, transform 0.18s" }}
            onMouseEnter={e => { e.currentTarget.style.opacity = "0.9"; e.currentTarget.style.transform = "translateY(-2px)"; }}
            onMouseLeave={e => { e.currentTarget.style.opacity = "1"; e.currentTarget.style.transform = "translateY(0)"; }}
          >
            <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </a>
          <a
            href={resolve(ctaSecHref)}
            style={{ display: "inline-flex", alignItems: "center", color: "rgba(255,255,255,0.90)", fontFamily: FONT, fontSize: "0.9rem", fontWeight: 500, padding: "14px 28px", borderRadius: 3, textDecoration: "none", border: "2px solid rgba(255,255,255,0.35)", transition: "background-color 0.18s, border-color 0.18s" }}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.10)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.60)"; }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.35)"; }}
          >
            <GenericEditableText sectionId={sectionId} field="ctaSecondaryText" value={ctaSecText} tag="span" />
          </a>
        </div>

      </div>

      {/* Stats bar — animated count-up on enter */}
      <div style={{ position: "relative", zIndex: 2, backgroundColor: WHITE }}>
        <div
          ref={statsBarRef}
          style={{ maxWidth: 1200, margin: "0 auto", padding: "0 32px", display: "grid", gridTemplateColumns: `repeat(${Math.min(statsItems.length, 3)}, 1fr)` }}
          className="stavba03-stats-bar"
        >
          {statsItems.map((stat, i) => {
            const raw = parseInt(String(stat.value).replace(/[\s ]/g, ""), 10);
            const displayNum = !isNaN(raw) ? counts[i].toLocaleString("cs-CZ") : stat.value;
            return (
              <div
                key={i}
                style={{
                  padding: "28px 0",
                  borderRight: i < statsItems.length - 1 ? "1px solid #eaeaea" : "none",
                  paddingRight: i < statsItems.length - 1 ? 32 : 0,
                  paddingLeft: i > 0 ? 32 : 0,
                  display: "flex", flexDirection: "column", alignItems: "center", gap: 4, textAlign: "center",
                }}
              >
                <div style={{ fontFamily: FONT, fontSize: "clamp(28px,3.5vw,40px)", fontWeight: 700, color: ORANGE, lineHeight: 1 }}>
                  {displayNum}<span style={{ fontSize: "0.55em", fontWeight: 600, color: DARK, opacity: 0.7 }}>{stat.suffix}</span>
                </div>
                <div style={{ fontFamily: FONT, fontSize: "0.85rem", color: "#555", fontWeight: 400 }}>{stat.label}</div>
              </div>
            );
          })}
        </div>
      </div>
      <style>{`
        @media (max-width: 640px) {
          .stavba03-stats-bar { grid-template-columns: 1fr !important; padding: 0 16px !important; }
          .stavba03-stats-bar > div { border-right: none !important; padding-left: 0 !important; padding-right: 0 !important; border-bottom: 1px solid #eaeaea; }
          .stavba03-stats-bar > div:last-child { border-bottom: none; }
          .stavba03-arrow-left { left: 8px !important; }
          .stavba03-arrow-right { right: 8px !important; }
        }
      `}</style>
    </section>
  );
}

// ── elektro-01-hero ───────────────────────────────────────────────────────────
// 1:1 elektro-bohacek.cz: full-bleed foto, tmavý+červený gradient, navbar fixed overlay
// H1 uppercase, 1 CTA "KONTAKTUJTE NÁS", SVG wave dole
// ─────────────────────────────────────────────────────────────────────────────
function HeroElektro01({ content, sectionId, tenantSlug, isAdmin }: Omit<Props, "variant">) {
  const c = content as Record<string, unknown>;

  const RED  = "#dd0808";
  const WHITE = "#ffffff";
  const FONT  = "'Montserrat', sans-serif";

  const title    = String(c.title    ?? "ELEKTROINSTALACE\nHROMOSVODY");
  const subtitle = String(c.subtitle ?? "Kvalitně odvedená práce, spokojený zákazník.");
  const ctaText  = String(c.ctaText  ?? "KONTAKTUJTE NÁS");
  const ctaHref  = String(c.ctaHref  ?? "#kontakt");
  const image    = String(c.backgroundImage ?? "");

  /* elektrikář při práci — tmavé prostředí, helma, podobné elektro-bohacek.cz */
  const heroImg = image || "https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=1800&h=1000&fit=crop&crop=right&fm=webp&q=90";

  function resolve(href: string) {
    if (!href || href.startsWith("http") || href.startsWith("#")) return href;
    if (tenantSlug) {
      const base = isAdmin ? `/demo/${tenantSlug}/admin` : `/demo/${tenantSlug}`;
      return base + (href.startsWith("/") ? href : "/" + href);
    }
    return href;
  }

  return (
    <section
      id="uvod"
      style={{ position: "relative", minHeight: "100svh", fontFamily: FONT, display: "flex", flexDirection: "column" }}
      data-template="elektro-01"
    >
      {/* Background photo */}
      <div style={{ position: "absolute", inset: 0, zIndex: 0 }}>
        <GenericEditableImage
          sectionId={sectionId} field="backgroundImage" src={heroImg}
          alt="Elektroinstalace a hromosvody"
          className="relative overflow-hidden w-full h-full"
          style={{ height: "100%" }}
        >
          <Image src={heroImg} alt="Elektroinstalace a hromosvody" fill className="object-cover" sizes="100vw"
            style={{ objectPosition: "right center" }}
            unoptimized={shouldSkipNextImageOptimization(heroImg)} priority />
        </GenericEditableImage>
        {/* tmavý gradient vlevo → červený vpravo — jako na referenci */}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(80deg, rgba(0,0,0,0.88) 45%, rgba(120,0,0,0.78) 100%)" }} aria-hidden />
      </div>

      {/* Text content — vertikálně centrované, padding pro výšku navbaru */}
      <div style={{
        position: "relative", zIndex: 1, flex: 1,
        display: "flex", flexDirection: "column", justifyContent: "center",
        maxWidth: 1280, margin: "0 auto",
        padding: "clamp(100px,14vw,140px) clamp(16px,5vw,40px) clamp(60px,9vw,100px)", width: "100%",
      }}>

        {/* H1 — uppercase, bold, velký */}
        <h1 style={{
          color: WHITE,
          fontSize: "clamp(26px, 3.75vw, 52px)",
          fontWeight: 900,
          lineHeight: 1.05,
          letterSpacing: "0.01em",
          textTransform: "uppercase",
          margin: "0 0 24px",
          maxWidth: 680,
          whiteSpace: "pre-line",
          fontFamily: FONT,
        }}>
          <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
        </h1>

        {/* Subtitle */}
        <p style={{
          color: "rgba(255,255,255,0.75)",
          fontSize: "clamp(15px, 1.4vw, 18px)",
          fontWeight: 400,
          lineHeight: 1.7,
          margin: "0 0 44px",
          maxWidth: 460,
          fontFamily: "'Roboto', sans-serif",
        }}>
          <GenericEditableText sectionId={sectionId} field="subtitle" value={subtitle} tag="span" />
        </p>

        {/* Jediné CTA tlačítko — jako na referenci */}
        <div>
          <a
            href={resolve(ctaHref)}
            data-btn="primary"
            style={{
              display: "inline-flex", alignItems: "center",
              backgroundColor: RED, color: WHITE,
              fontFamily: FONT, fontSize: "0.82rem", fontWeight: 800,
              padding: "17px 44px", borderRadius: 0,
              textDecoration: "none", textTransform: "uppercase",
              letterSpacing: "0.12em",
              boxShadow: "0 4px 24px rgba(221,8,8,0.45)",
              transition: "opacity 0.18s, transform 0.18s",
            }}
            onMouseEnter={e => { e.currentTarget.style.opacity = "0.87"; e.currentTarget.style.transform = "translateY(-2px)"; }}
            onMouseLeave={e => { e.currentTarget.style.opacity = "1"; e.currentTarget.style.transform = "translateY(0)"; }}
          >
            <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
          </a>
        </div>
      </div>

      {/* SVG wave divider na spodní hraně — přechod do bílé sekce */}
      <div style={{ position: "relative", zIndex: 1, lineHeight: 0 }} aria-hidden>
        <svg viewBox="0 0 1440 72" xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
          style={{ display: "block", width: "calc(100% + 1px)", height: 72 }}>
          <path d="M0,36 C480,72 960,0 1440,36 L1440,72 L0,72 Z" fill={WHITE}/>
        </svg>
      </div>
    </section>
  );
}

// ── catering-01-hero ─────────────────────────────────────────────────────────
// Fullscreen luxury slider:
// - 100vh photo bg with Ken Burns zoom + 1.2s crossfade
// - Dark gradient overlay for legibility
// - Text bottom-left: gold badge → Fraunces italic H1 (multi-line) → sub → terracotta pill CTA
// - Dots + prev/next arrows + slide counter (01/03) bottom-right
// - Auto-play 6s
// ─────────────────────────────────────────────────────────────────────────────
function HeroCatering01({ content, sectionId, tenantSlug, isAdmin }: Omit<Props, "variant">) {
  const TERRA  = "#c4755b";
  const CREAM  = "#f8f5f0";
  const SERIF  = "'Fraunces', Georgia, serif";
  const SANS   = "'Inter', system-ui, sans-serif";

  const tagline  = String(content.tagline  ?? "Chuť,\nkterá\nosloví");
  const subtitle = String(content.subtitle ?? "Gastronomické umění pro chvíle, na které se nezapomíná");
  const badge    = String(content.badge    ?? "od roku 2007");
  const ctaText  = String(content.ctaText  ?? "Nezávazná poptávka");
  const ctaHref  = String(content.ctaHref  ?? "#kontakt");
  const slides   = (content.slides as Array<{ url: string; alt?: string }>) ?? [];

  const [active, setActive] = useState(0);
  const total = slides.length;

  useEffect(() => {
    if (total < 2) return;
    const t = setInterval(() => setActive(a => (a + 1) % total), 6000);
    return () => clearInterval(t);
  }, [total]);

  function resolveHref(href: string) {
    if (!tenantSlug || href.startsWith("http")) return href;
    const base = isAdmin ? `/demo/${tenantSlug}/admin` : `/demo/${tenantSlug}`;
    return href === "/" ? base : `${base}${href}`;
  }

  const go = (dir: 1 | -1) => setActive(a => (a + dir + total) % total);

  return (
    <section
      id="uvod"
      data-template="catering-01"
      data-variant="catering-01-hero"
    >
      <style>{`
        .ct1hero{position:relative;width:100%;height:100vh;height:100svh;min-height:600px;overflow:hidden;background:#0d1a15}
        .ct1hero-slide{position:absolute;inset:0;opacity:0;transition:opacity 1.2s ease}
        .ct1hero-slide.on{opacity:1}
        .ct1hero-slide > *{position:absolute;inset:0;width:100%;height:100%}
        .ct1hero-slide img{width:100%;height:100%;object-fit:cover;display:block;transform:scale(1);transition:transform 8s ease-out}
        .ct1hero-slide.on img{transform:scale(1.08)}
        .ct1hero-veil{position:absolute;inset:0;background:linear-gradient(180deg,rgba(13,26,21,0.15) 0%,rgba(13,26,21,0.15) 40%,rgba(13,26,21,0.55) 78%,rgba(13,26,21,0.85) 100%);pointer-events:none}
        .ct1hero-veil-side{position:absolute;inset:0;background:linear-gradient(90deg,rgba(13,26,21,0.55) 0%,rgba(13,26,21,0.15) 45%,rgba(13,26,21,0) 70%);pointer-events:none}
        .ct1hero-wrap{position:absolute;inset:0;display:flex;flex-direction:column;justify-content:flex-end;padding:0 5% 6rem;z-index:2;color:#fff}
        .ct1hero-badge{font-family:${SANS};font-size:.72rem;font-weight:600;letter-spacing:.24em;text-transform:uppercase;color:#f2c9a8;margin:0 0 1.6rem;display:flex;align-items:center;gap:.75rem}
        .ct1hero-badge::before{content:'';width:2.4rem;height:1px;background:#f2c9a8}
        .ct1hero-h1{font-family:${SERIF};font-weight:300;font-style:italic;color:${CREAM};margin:0 0 1.6rem;line-height:1.03;font-size:clamp(2.6rem,7vw,6.5rem);letter-spacing:-.02em;max-width:14ch;text-shadow:0 2px 30px rgba(0,0,0,0.35)}
        .ct1hero-sub{font-family:${SANS};font-size:clamp(0.95rem,1.15vw,1.15rem);line-height:1.65;color:rgba(255,255,255,0.88);max-width:36rem;margin:0 0 2.4rem;font-weight:400}
        .ct1hero-cta{display:inline-flex;align-items:center;gap:.7rem;align-self:flex-start;background:${TERRA};color:#fff;font-family:${SANS};font-size:.78rem;font-weight:600;letter-spacing:.14em;text-transform:uppercase;text-decoration:none;padding:1rem 2.4rem;border-radius:999px;transition:background .3s,transform .3s,box-shadow .3s;box-shadow:0 12px 32px -8px rgba(196,117,91,0.6)}
        .ct1hero-cta:hover{background:#b0634a;transform:translateY(-2px);box-shadow:0 16px 40px -8px rgba(196,117,91,0.7)}
        .ct1hero-cta svg{transition:transform .3s}
        .ct1hero-cta:hover svg{transform:translateX(4px)}

        .ct1hero-controls{position:absolute;bottom:2.2rem;right:5%;z-index:3;display:flex;align-items:center;gap:1.4rem;color:#fff;font-family:${SANS}}
        .ct1hero-arrow{width:44px;height:44px;border-radius:50%;border:1px solid rgba(255,255,255,0.35);background:rgba(255,255,255,0.06);backdrop-filter:blur(6px);cursor:pointer;display:flex;align-items:center;justify-content:center;color:#fff;transition:background .25s,border-color .25s,transform .25s}
        .ct1hero-arrow:hover{background:${TERRA};border-color:${TERRA};transform:scale(1.05)}
        .ct1hero-count{font-family:${SERIF};font-style:italic;font-size:1.05rem;letter-spacing:.05em;min-width:4ch;text-align:center}
        .ct1hero-count strong{font-weight:400;color:${CREAM};font-size:1.5rem;margin-right:.3rem}
        .ct1hero-count span.sep{opacity:.4;margin:0 .35rem}
        .ct1hero-count span.total{opacity:.65}

        .ct1hero-dots{position:absolute;bottom:2.6rem;left:5%;z-index:3;display:flex;gap:.7rem}
        .ct1hero-dot{width:32px;height:2px;border:0;background:rgba(255,255,255,0.35);padding:0;cursor:pointer;transition:background .3s,transform .3s;position:relative;overflow:hidden}
        .ct1hero-dot.on{background:rgba(255,255,255,0.85)}
        .ct1hero-dot.on::after{content:'';position:absolute;inset:0;background:${TERRA};animation:ct1prog 6s linear forwards}
        @keyframes ct1prog{from{transform:translateX(-100%)}to{transform:translateX(0)}}

        @media(max-width:768px){
          .ct1hero{min-height:560px}
          .ct1hero-wrap{padding:0 6% 8rem}
          .ct1hero-controls{bottom:2.4rem;right:6%;gap:.8rem}
          .ct1hero-arrow{width:38px;height:38px}
          .ct1hero-dots{bottom:3rem;left:6%;gap:.5rem}
          .ct1hero-dot{width:24px}
          .ct1hero-h1{font-size:clamp(2.4rem,10vw,4rem)}
          .ct1hero-sub{font-size:0.95rem}
          .ct1hero-count{display:none}
        }
      `}</style>

      <div className="ct1hero">
        {/* Slides */}
        {slides.map((sl, i) => (
          <div key={i} className={`ct1hero-slide${i === active ? " on" : ""}`}>
            <GenericEditableImage sectionId={sectionId} field={`slides.${i}.url`} src={sl.url} alt={sl.alt ?? ""}>
              <img src={sl.url} alt={sl.alt ?? ""} loading={i === 0 ? "eager" : "lazy"} />
            </GenericEditableImage>
          </div>
        ))}

        {/* Overlays */}
        <div className="ct1hero-veil" />
        <div className="ct1hero-veil-side" />

        {/* Content */}
        <div className="ct1hero-wrap">
          {badge && (
            <div className="ct1hero-badge">
              <GenericEditableText sectionId={sectionId} field="badge" value={badge} tag="span" />
            </div>
          )}
          <h1 className="ct1hero-h1">
            <GenericEditableText sectionId={sectionId} field="tagline" value={tagline} tag="span">
              {tagline.split("\n").map((line, i) => (
                <span key={i} style={{ display: "block" }}>{line}</span>
              ))}
            </GenericEditableText>
          </h1>
          <p className="ct1hero-sub">
            <GenericEditableText sectionId={sectionId} field="subtitle" value={subtitle} tag="span" />
          </p>
          <a href={resolveHref(ctaHref)} data-btn="primary" className="ct1hero-cta">
            <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </a>
        </div>

        {/* Dots progress bars */}
        {total > 1 && (
          <div className="ct1hero-dots">
            {slides.map((_, i) => (
              <button
                key={i}
                className={`ct1hero-dot${i === active ? " on" : ""}`}
                onClick={() => setActive(i)}
                aria-label={`Snímek ${i + 1}`}
              />
            ))}
          </div>
        )}

        {/* Arrows + counter */}
        {total > 1 && (
          <div className="ct1hero-controls">
            <button className="ct1hero-arrow" onClick={() => go(-1)} aria-label="Předchozí">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <line x1="19" y1="12" x2="5" y2="12" />
                <polyline points="12 19 5 12 12 5" />
              </svg>
            </button>
            <div className="ct1hero-count" aria-hidden>
              <strong>{String(active + 1).padStart(2, "0")}</strong>
              <span className="sep">/</span>
              <span className="total">{String(total).padStart(2, "0")}</span>
            </div>
            <button className="ct1hero-arrow" onClick={() => go(1)} aria-label="Další">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

// ── hero-catering-01-page (slim subpage banner) ────────────────────────────────
function HeroCatering01Page({ content, sectionId, tenantSlug, isAdmin }: Omit<Props, "variant">) {
  const c = content as Record<string, unknown>;
  const bg = String(c.backgroundImage ?? "");
  const breadcrumb = String(c.breadcrumb ?? "Domů");
  const breadcrumbHref = String(c.breadcrumbHref ?? "/");
  const title = String(c.title ?? "Stránka");
  return (
    <section
      className="relative overflow-hidden"
      style={{ minHeight: "clamp(280px, 40vh, 380px)", backgroundColor: "#2d4a3e" }}
      data-template="catering-01"
      data-variant="hero-catering-01-page"
    >
      <link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,500;0,9..144,700;1,9..144,400&family=Inter:wght@400;500;600&display=swap" rel="stylesheet" />
      {bg && (
        <div aria-hidden style={{
          position: "absolute", inset: 0,
          backgroundImage: `url(${bg})`, backgroundSize: "cover", backgroundPosition: "center",
          filter: "brightness(0.4) saturate(0.7)", zIndex: 0,
        }} />
      )}
      <div aria-hidden style={{
        position: "absolute", inset: 0, zIndex: 1, pointerEvents: "none",
        background: "linear-gradient(180deg, rgba(45,74,62,0.85) 0%, rgba(45,74,62,0.6) 100%)",
      }} />
      <div
        className="relative flex flex-col items-center justify-center text-center"
        style={{
          zIndex: 3, minHeight: "clamp(280px, 40vh, 380px)",
          paddingBlock: "120px 48px", paddingInline: "clamp(20px, 6vw, 80px)",
        }}
      >
        <nav aria-label="Breadcrumb" style={{
          display: "flex", alignItems: "center", gap: 10,
          fontFamily: "'Inter', system-ui, sans-serif",
          fontSize: "11px", fontWeight: 500, letterSpacing: "0.18em", textTransform: "uppercase",
          color: "rgba(248,245,240,0.5)", marginBottom: 20,
        }}>
          <a
            href={resolveDemoHref(breadcrumbHref, tenantSlug, isAdmin)}
            style={{ color: "rgba(248,245,240,0.65)", textDecoration: "none", transition: "color 0.3s" }}
            onMouseEnter={e => { e.currentTarget.style.color = "#c4755b"; }}
            onMouseLeave={e => { e.currentTarget.style.color = "rgba(248,245,240,0.65)"; }}
          >
            <GenericEditableText sectionId={sectionId} field="breadcrumb" value={breadcrumb} tag="span" />
          </a>
          <span aria-hidden style={{ color: "#c4755b", fontSize: "9px" }}>●</span>
          <span style={{ color: "#c4755b" }}>
            <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
          </span>
        </nav>
        <h1 style={{
          fontFamily: "'Fraunces', Georgia, serif",
          color: "#f8f5f0", fontSize: "clamp(2.2rem, 5vw, 3.6rem)",
          fontWeight: 500, fontStyle: "italic", lineHeight: 1.1,
          letterSpacing: "-0.01em", marginBottom: 16,
        }}>
          <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
        </h1>
        <div aria-hidden style={{
          width: 48, height: 2, backgroundColor: "#c4755b", borderRadius: 1,
        }} />
      </div>
    </section>
  );
}

// ── hero-peak-cut-page (slim subpage banner) ───────────────────────────────────
function HeroPeakCutPage({ content, sectionId, tenantSlug, isAdmin }: Omit<Props, "variant">) {
  const c = content as Record<string, unknown>;
  const bg = String(c.backgroundImage ?? "");
  const breadcrumb = String(c.breadcrumb ?? "Domů");
  const breadcrumbHref = String(c.breadcrumbHref ?? "/");
  const title = String(c.title ?? "Stránka");
  const OSWALD = "'Oswald', 'Bebas Neue', Impact, sans-serif";
  const MONO = "'Overpass Mono', 'JetBrains Mono', Menlo, monospace";
  const RED = "#c41e3a";
  return (
    <section
      className="relative overflow-hidden"
      style={{ minHeight: "clamp(260px, 38vh, 360px)", backgroundColor: "#1a1a1a" }}
      data-template="peak-cut"
      data-variant="hero-peak-cut-page"
    >
      <link href="https://fonts.googleapis.com/css2?family=Oswald:wght@300;400;500;600&family=Overpass+Mono:wght@400;600&display=swap" rel="stylesheet" />
      {bg && (
        <div aria-hidden style={{
          position: "absolute", inset: 0,
          backgroundImage: `url(${bg})`, backgroundSize: "cover", backgroundPosition: "center",
          filter: "brightness(0.3) contrast(1.1)", zIndex: 0,
        }} />
      )}
      <div
        className="relative flex flex-col items-center justify-center text-center"
        style={{
          zIndex: 3, minHeight: "clamp(260px, 38vh, 360px)",
          paddingBlock: "110px 44px", paddingInline: "clamp(20px, 6vw, 80px)",
        }}
      >
        <nav aria-label="Breadcrumb" style={{
          display: "flex", alignItems: "center", gap: 8,
          fontFamily: MONO, fontSize: "10px", fontWeight: 600,
          letterSpacing: "0.2em", textTransform: "uppercase",
          color: "rgba(255,255,255,0.4)", marginBottom: 18,
        }}>
          <a
            href={resolveDemoHref(breadcrumbHref, tenantSlug, isAdmin)}
            style={{ color: "rgba(255,255,255,0.55)", textDecoration: "none", transition: "color 0.3s" }}
            onMouseEnter={e => { e.currentTarget.style.color = RED; }}
            onMouseLeave={e => { e.currentTarget.style.color = "rgba(255,255,255,0.55)"; }}
          >
            <GenericEditableText sectionId={sectionId} field="breadcrumb" value={breadcrumb} tag="span" />
          </a>
          <span aria-hidden style={{ color: RED }}>/</span>
          <span style={{ color: "#fff" }}>
            <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
          </span>
        </nav>
        <h1 style={{
          fontFamily: OSWALD, color: "#ffffff",
          fontSize: "clamp(2.4rem, 5.5vw, 4rem)",
          fontWeight: 500, lineHeight: 1.05,
          letterSpacing: "0.08em", textTransform: "uppercase",
        }}>
          <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
        </h1>
        <div aria-hidden style={{
          width: 40, height: 2, backgroundColor: RED, marginTop: 16,
        }} />
      </div>
    </section>
  );
}

// ── hero-clinic-03-page (slim subpage banner) ──────────────────────────────────
function HeroClinic03Page({ content, sectionId, tenantSlug, isAdmin }: Omit<Props, "variant">) {
  const c = content as Record<string, unknown>;
  const bg = String(c.backgroundImage ?? "");
  const breadcrumb = String(c.breadcrumb ?? "Domů");
  const breadcrumbHref = String(c.breadcrumbHref ?? "/");
  const title = String(c.title ?? "Stránka");
  const GOLD = "#97855F";
  const SERIF = "'Cormorant Garamond', Georgia, serif";
  const SANS = "'DM Sans', 'Inter', Arial, sans-serif";
  return (
    <section
      className="relative overflow-hidden"
      style={{ minHeight: "clamp(280px, 40vh, 380px)", backgroundColor: "#1A1A1A" }}
      data-template="clinic-03"
      data-variant="hero-clinic-03-page"
    >
      <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400&family=DM+Sans:wght@400;500;600&display=swap" rel="stylesheet" />
      {bg && (
        <div aria-hidden style={{
          position: "absolute", inset: 0,
          backgroundImage: `url(${bg})`, backgroundSize: "cover", backgroundPosition: "center",
          filter: "brightness(0.35) saturate(0.8)", zIndex: 0,
        }} />
      )}
      <div aria-hidden style={{
        position: "absolute", inset: 0, zIndex: 1, pointerEvents: "none",
        background: "linear-gradient(180deg, rgba(26,26,26,0.7) 0%, rgba(26,26,26,0.5) 100%)",
      }} />
      <div
        className="relative flex flex-col items-center justify-center text-center"
        style={{
          zIndex: 3, minHeight: "clamp(280px, 40vh, 380px)",
          paddingBlock: "120px 48px", paddingInline: "clamp(20px, 6vw, 80px)",
        }}
      >
        <nav aria-label="Breadcrumb" style={{
          display: "flex", alignItems: "center", gap: 10,
          fontFamily: SANS, fontSize: "10.5px", fontWeight: 500,
          letterSpacing: "0.2em", textTransform: "uppercase",
          color: "rgba(255,255,255,0.45)", marginBottom: 20,
        }}>
          <a
            href={resolveDemoHref(breadcrumbHref, tenantSlug, isAdmin)}
            style={{ color: "rgba(255,255,255,0.6)", textDecoration: "none", transition: "color 0.3s" }}
            onMouseEnter={e => { e.currentTarget.style.color = GOLD; }}
            onMouseLeave={e => { e.currentTarget.style.color = "rgba(255,255,255,0.6)"; }}
          >
            <GenericEditableText sectionId={sectionId} field="breadcrumb" value={breadcrumb} tag="span" />
          </a>
          <span aria-hidden style={{ color: GOLD, fontSize: "6px" }}>◆</span>
          <span style={{ color: GOLD }}>
            <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
          </span>
        </nav>
        <h1 style={{
          fontFamily: SERIF, color: "#ffffff",
          fontSize: "clamp(2.2rem, 5vw, 3.8rem)",
          fontWeight: 400, fontStyle: "italic", lineHeight: 1.1,
          letterSpacing: "0.02em",
        }}>
          <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
        </h1>
        <div aria-hidden style={{
          width: 32, height: 1, backgroundColor: GOLD, marginTop: 18,
        }} />
      </div>
    </section>
  );
}

// ── instala-01-hero ────────────────────────────────────────────────────────────
// 1:1 instalateritopenari.cz:
// - 90vh min-height, BG foto + radial-gradient overlay (center průhledný → tmavé okraje)
// - kicker: 15px / weight 300 / uppercase / žlutá
// - H1: clamp(40px,5.5vw,72px) / weight 600 / capitalize / bílá
// - odstavec: 18px / 400 / bílá / max-width 650px
// - CTA1: žlutý pill | CTA2: outline white pill
// - navbar je fixed overlay → hero má padding-top 140px
// ─────────────────────────────────────────────────────────────────────────────
function HeroInstala01({ content, sectionId, tenantSlug, isAdmin }: Omit<Props, "variant">) {
  const c = content as Record<string, unknown>;

  const YELLOW = "#FFC527";
  const DARK   = "#1e293b";
  const WHITE  = "#ffffff";
  const FONT   = "'Outfit', sans-serif";

  const title      = String(c.title       ?? "Instalatérské, topenářské\na plynařské práce");
  const label      = String(c.label       ?? "Praha a okolí • Ihned k dispozici");
  const subtitle   = String(c.subtitle    ?? "Čeští řemeslníci s 20letou praxí. Sídlíme v Praze, práce provádíme po celé Praze a okolí. Práce menšího rozsahu řešíme nejlépe ihned.");
  const ctaText    = String(c.ctaText     ?? "Zjistit více");
  const ctaHref    = String(c.ctaHref     ?? "#sluzby");
  const ctaSecText = String(c.ctaSecondaryText ?? "Nabídka služeb");
  const ctaSecHref = String(c.ctaSecondaryHref ?? "#sluzby");
  const bgImage    = String(c.backgroundImage  ?? "/clones/instalateritopenari/wp-content/uploads/2025/07/H1-slider-01.webp");

  function resolveHref(href: string) {
    if (!href || href.startsWith("http") || href.startsWith("#")) return href;
    if (tenantSlug) {
      const base = isAdmin ? `/demo/${tenantSlug}/admin` : `/demo/${tenantSlug}`;
      return base + (href.startsWith("/") ? href : "/" + href);
    }
    return href;
  }

  return (
    <section
      id="uvod"
      style={{ position: "relative", minHeight: "90vh", fontFamily: FONT, display: "flex", flexDirection: "column", justifyContent: "center" }}
      data-template="instala-01-hero"
    >
      {/* BG + radial overlay */}
      <div style={{ position: "absolute", inset: 0, zIndex: 0 }}>
        <GenericEditableImage sectionId={sectionId} field="backgroundImage" src={bgImage} alt="Hero" className="relative overflow-hidden w-full h-full" style={{ height: "100%" }}>
          <Image src={bgImage} alt="Instalatérské práce Praha" fill className="object-cover" sizes="100vw" unoptimized={shouldSkipNextImageOptimization(bgImage)} priority />
        </GenericEditableImage>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(at center center, #00000000 50%, #000000 70%)" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0.45) 0%, transparent 28%)" }} />
      </div>

      {/* Content */}
      <div className="i01-hero-content" style={{ position: "relative", zIndex: 1, maxWidth: 1280, width: "100%", margin: "0 auto", padding: "140px 40px 80px" }}>
        {/* Kicker */}
        <div style={{ display: "inline-flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
          <span style={{ display: "block", width: 36, height: 2, backgroundColor: YELLOW, borderRadius: 2, flexShrink: 0 }} />
          <span style={{ color: YELLOW, fontSize: "15px", fontWeight: 300, letterSpacing: "0.14em", textTransform: "uppercase" }}>
            <GenericEditableText sectionId={sectionId} field="label" value={label} tag="span" />
          </span>
        </div>

        {/* H1 */}
        <h1 style={{ color: WHITE, fontSize: "clamp(40px, 5.5vw, 72px)", fontWeight: 600, lineHeight: 1.1, letterSpacing: "-0.02em", margin: "0 0 24px", maxWidth: 800, whiteSpace: "pre-line", textTransform: "capitalize" }}>
          <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
        </h1>

        {/* Paragraph */}
        <p style={{ color: "rgba(255,255,255,0.85)", fontSize: "18px", fontWeight: 400, lineHeight: 1.65, margin: "0 0 44px", maxWidth: 650 }}>
          <GenericEditableText sectionId={sectionId} field="subtitle" value={subtitle} tag="span" />
        </p>

        {/* CTAs */}
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
          <a
            href={resolveHref(ctaHref)}
            data-btn="primary"
            style={{ display: "inline-flex", alignItems: "center", backgroundColor: YELLOW, color: DARK, fontSize: "17px", fontWeight: 400, padding: "14px 36px", borderRadius: 50, textDecoration: "none", whiteSpace: "nowrap", transition: "opacity 0.18s, transform 0.18s" }}
            onMouseEnter={e => { e.currentTarget.style.opacity = "0.88"; e.currentTarget.style.transform = "translateY(-2px)"; }}
            onMouseLeave={e => { e.currentTarget.style.opacity = "1"; e.currentTarget.style.transform = "translateY(0)"; }}
          >
            <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
          </a>
          <a
            href={resolveHref(ctaSecHref)}
            style={{ display: "inline-flex", alignItems: "center", backgroundColor: "transparent", color: WHITE, border: "1px solid rgba(255,255,255,0.75)", fontSize: "17px", fontWeight: 400, padding: "14px 36px", borderRadius: 50, textDecoration: "none", whiteSpace: "nowrap", transition: "background-color 0.2s, color 0.2s" }}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = WHITE; e.currentTarget.style.color = DARK; }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = WHITE; }}
          >
            <GenericEditableText sectionId={sectionId} field="ctaSecondaryText" value={ctaSecText} tag="span" />
          </a>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .i01-hero-content { padding: 100px 24px 60px !important; }
        }
        @media (max-width: 480px) {
          .i01-hero-content { padding: 90px 20px 48px !important; }
        }
      `}</style>
    </section>
  );
}

// ── florist-01-hero ───────────────────────────────────────────────────────────
// 1:1 freja.cz hero: horizontal slide + Ken Burns ambient zoom + controls bar below
function HeroFlorist01({ content, sectionId, tenantSlug, isAdmin }: { content: Record<string, unknown>; sectionId: number; tenantSlug?: string; isAdmin: boolean }) {
  const ARIMO = "Arimo, Arial, sans-serif";
  const WHITE = "#ffffff";
  const FG = "rgb(18,18,18)";

  interface Slide { tag?: string; title?: string; subtitle?: string; ctaText?: string; ctaHref?: string; backgroundImage?: string; }

  const rawSlides = (content.slides as Slide[]) ?? [];
  const slides: Slide[] = rawSlides.length > 0 ? rawSlides : [
    { title: "Květiny s láskou —\nrozvoz po celé Praze", subtitle: "Doručíme kytici ve stanovenou dobu po celé Praze", ctaText: "Vybrat kytici", ctaHref: "#katalog", backgroundImage: "/clones/freja/img/img-flowers.jpg" },
    { tag: "JARNÍ KOLEKCE 2026", title: "Přivítejte jaro\nkrásnou kyticí", ctaText: "Prozkoumat", ctaHref: "#katalog", backgroundImage: "/clones/freja/img/img-spring.jpg" },
  ];

  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);

  const goTo = useCallback((idx: number) => {
    setCurrent(((idx % slides.length) + slides.length) % slides.length);
  }, [slides.length]);

  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => goTo(current + 1), 2000);
    return () => clearInterval(t);
  }, [current, paused, goTo]);

  const resolveHref = (href: string) => {
    if (!href || href.startsWith("#")) return href ?? "#";
    if (isAdmin) return `/demo/${tenantSlug}/admin`;
    return href;
  };

  // caret ∨ → rotate(90deg)=‹ prev, rotate(-90deg)=› next
  const Caret = ({ dir }: { dir: "prev" | "next" }) => (
    <svg viewBox="0 0 10 6" width="10" height="6" aria-hidden="true"
      style={{ display: "block", transform: dir === "prev" ? "rotate(90deg)" : "rotate(-90deg)" }}>
      <path fill="currentColor" fillRule="evenodd" d="M9.354.646a.5.5 0 0 0-.708 0L5 4.293 1.354.646a.5.5 0 0 0-.708.708l4 4a.5.5 0 0 0 .708 0l4-4a.5.5 0 0 0 0-.708" clipRule="evenodd" />
    </svg>
  );

  const btnStyle: React.CSSProperties = {
    background: "none", border: "none", cursor: "pointer", color: FG,
    display: "flex", alignItems: "center", justifyContent: "center",
    padding: "14px 16px", lineHeight: 1,
  };

  return (
    <div style={{ fontFamily: ARIMO }}>
      <style>{`
        @keyframes f01Ambient {
          0%   { transform: rotate(0deg)   translate(0.8em) rotate(0deg)   scale(1.15); }
          100% { transform: rotate(360deg) translate(0.8em) rotate(-360deg) scale(1.15); }
        }
        @media (prefers-reduced-motion: no-preference) {
          .f01-kb { animation: f01Ambient 30s linear infinite; }
        }
        .f01-hero-track { display: flex; transition: transform 0.25s cubic-bezier(0.25,0.46,0.45,0.94); }
        .f01-hero-slide { flex: 0 0 100%; width: 100%; position: relative; height: 340px; }
        @media (min-width: 750px) { .f01-hero-slide { height: 560px; } }
      `}</style>

      {/* Slider — full-bleed, slides side by side */}
      <div style={{ overflow: "hidden", position: "relative", width: "100%" }}>
        <div className="f01-hero-track" style={{ transform: `translateX(-${current * 100}%)` }}>
          {slides.map((s, i) => (
            <div key={i} className="f01-hero-slide">
              {/* Image clipping wrapper — Ken Burns stays inside */}
              <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
                {s.backgroundImage && (
                  <GenericEditableImage sectionId={sectionId} field={`slides.${i}.backgroundImage`} src={s.backgroundImage} alt={s.title ?? ""} style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
                    <img
                      src={s.backgroundImage}
                      alt={s.title ?? ""}
                      className="f01-kb"
                      style={{ position: "absolute", top: "50%", left: "50%", translate: "-50% -50%", width: "110%", height: "110%", objectFit: "cover", objectPosition: "center", transformOrigin: "center" }}
                    />
                  </GenericEditableImage>
                )}
              </div>
              {/* Dark overlay */}
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.2) 55%, rgba(0,0,0,0.0) 100%)" }} />
              {/* Text — page-width container, left-aligned */}
              <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center" }}>
                <div style={{ width: "100%", maxWidth: 1200, margin: "0 auto", padding: "0 3rem" }}>
                  {s.tag && (
                    <p style={{ color: "rgba(255,255,255,0.8)", fontSize: 11, fontWeight: 400, letterSpacing: "0.18em", textTransform: "uppercase", margin: "0 0 16px" }}>
                      <GenericEditableText sectionId={sectionId} field={`slides.${i}.tag`} value={s.tag} tag="span" />
                    </p>
                  )}
                  <h1 style={{ color: WHITE, fontSize: "clamp(28px, 4vw, 54px)", fontWeight: 400, fontFamily: "Georgia, serif", fontStyle: "italic", lineHeight: 1.18, margin: "0 0 20px", maxWidth: 560, whiteSpace: "pre-line" }}>
                    <GenericEditableText sectionId={sectionId} field={`slides.${i}.title`} value={s.title ?? ""} tag="span" />
                  </h1>
                  {s.subtitle && (
                    <p style={{ color: "rgba(255,255,255,0.85)", fontSize: 16, lineHeight: 1.6, margin: "0 0 32px", maxWidth: 420 }}>
                      <GenericEditableText sectionId={sectionId} field={`slides.${i}.subtitle`} value={s.subtitle} tag="span" />
                    </p>
                  )}
                  {s.ctaText && (
                    <a href={resolveHref(s.ctaHref ?? "#katalog")} data-btn="inverse"
                      style={{ display: "inline-flex", alignItems: "center", backgroundColor: "transparent", color: WHITE, border: `1px solid ${WHITE}`, fontSize: 15, fontWeight: 400, padding: "13px 30px", borderRadius: 2, textDecoration: "none", letterSpacing: "0.03em", transition: "background-color 0.2s, color 0.2s" }}
                      onMouseEnter={e => { e.currentTarget.style.backgroundColor = WHITE; e.currentTarget.style.color = FG; }}
                      onMouseLeave={e => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = WHITE; }}
                    >
                      <GenericEditableText sectionId={sectionId} field={`slides.${i}.ctaText`} value={s.ctaText} tag="span" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Controls bar — ‹ ○ ● › centered as one group, pause absolute right */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", borderTop: "1px solid rgba(18,18,18,0.08)", borderBottom: "1px solid rgba(18,18,18,0.08)", position: "relative", minHeight: 44 }}>
        {/* ONE centered group: prev + dots + next */}
        <div style={{ display: "flex", alignItems: "center", gap: 0 }}>
          <button style={btnStyle} aria-label="Předchozí snímek" onClick={() => goTo(current - 1)}>
            <Caret dir="prev" />
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: 6, margin: "0 12px" }}>
            {slides.map((_, i) => (
              <button key={i} onClick={() => goTo(i)} aria-label={`Snímek ${i + 1} z ${slides.length}`}
                style={{ background: "none", border: "none", cursor: "pointer", padding: "8px 4px", display: "flex", alignItems: "center" }}>
                <span style={{
                  display: "block", width: 10, height: 10, borderRadius: "50%",
                  border: `1px solid ${i === current ? FG : "rgba(18,18,18,0.5)"}`,
                  backgroundColor: i === current ? FG : "transparent",
                  transition: "background-color 0.2s, border-color 0.2s",
                }} />
              </button>
            ))}
          </div>
          <button style={btnStyle} aria-label="Další snímek" onClick={() => goTo(current + 1)}>
            <Caret dir="next" />
          </button>
        </div>

        {/* Pause — absolute far right */}
        <button
          style={{ ...btnStyle, position: "absolute", right: 0, borderLeft: "1px solid rgba(18,18,18,0.08)", alignSelf: "stretch" }}
          aria-label={paused ? "Spustit prezentaci" : "Pozastavit prezentaci"}
          onClick={() => setPaused(p => !p)}>
          {paused
            ? <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 14" width="10" height="14"><path fill="currentColor" fillRule="evenodd" d="M1.482.815A1 1 0 0 0 0 1.69v10.517a1 1 0 0 0 1.525.851L10.54 7.5a1 1 0 0 0-.043-1.728z" clipRule="evenodd" /></svg>
            : <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 8 12" width="8" height="12"><path fill="currentColor" d="M1.2.75c-.387 0-.7.235-.7.525v9.45c0 .29.313.525.7.525s.7-.235.7-.525v-9.45c0-.29-.313-.525-.7-.525m5.6 0c-.387 0-.7.235-.7.525v9.45c0 .29.313.525.7.525s.7-.235.7-.525v-9.45c0-.29-.313-.525-.7-.525" /></svg>
          }
        </button>
      </div>
    </div>
  );
}

// ── sweet-01-hero ─────────────────────────────────────────────────────────────
// Ref: ovocnysvetozor.cz — fullscreen showcase.jpg bg
// rgba(0,0,0,0.38) overlay; centrovaný bílý Roboto H2; červené (#e30613) filled CTA
// ─────────────────────────────────────────────────────────────────────────────
function HeroSweet01({ content, sectionId, tenantSlug, isAdmin }: { content: Record<string, unknown>; sectionId: number; tenantSlug?: string; isAdmin?: boolean }) {
  const title    = String(content.title    ?? "Místo pro váš sladký život!");
  const subtitle = String(content.subtitle ?? "");
  const ctaText  = String(content.ctaText  ?? "Naše produkty");
  const ctaHref  = String(content.ctaHref  ?? "#produkty");
  const bgImage  = String(content.bgImage  ?? "/clones/ovocnysvetozor/img/showcase.jpg");

  const RED  = "#e30613";
  const FONT = "'Roboto', 'Helvetica Neue', Arial, sans-serif";

  const resolve = (href: string) => isAdmin ? href : (tenantSlug ? href : href);

  return (
    <section
      id={String(sectionId)}
      style={{ position: "relative", width: "100%", height: "100vh", minHeight: 400, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", backgroundColor: "#1a1a1a" }}
    >
      {/* Background image */}
      <GenericEditableImage sectionId={sectionId} field="bgImage" src={bgImage} alt={title} style={{ position: "absolute", inset: 0, zIndex: 1, display: "block" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: `url(${bgImage})`, backgroundSize: "cover", backgroundPosition: "center" }} />
      </GenericEditableImage>

      {/* Overlay */}
      <div style={{ position: "absolute", inset: 0, backgroundColor: "rgba(0,0,0,0.38)", zIndex: 2 }} />

      {/* Content */}
      <div style={{ position: "relative", zIndex: 3, textAlign: "center", padding: "0 clamp(24px, 6vw, 80px)", display: "flex", flexDirection: "column", alignItems: "center", gap: 28 }}>
        <h2
          style={{ fontFamily: FONT, fontWeight: 700, fontSize: "clamp(1.8rem, 4vw, 3.2rem)", color: "#ffffff", margin: 0, lineHeight: 1.2, textShadow: "0 2px 12px rgba(0,0,0,0.3)" }}
        >
          <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
        </h2>
        {subtitle && (
          <p style={{ fontFamily: FONT, fontSize: "clamp(1rem, 2vw, 1.25rem)", color: "rgba(255,255,255,0.88)", margin: 0, maxWidth: 600, lineHeight: 1.5, textShadow: "0 1px 6px rgba(0,0,0,0.3)" }}>
            <GenericEditableText sectionId={sectionId} field="subtitle" value={subtitle} tag="span" />
          </p>
        )}
        <a
          href={resolve(ctaHref)}
          data-btn="primary"
          style={{ display: "inline-block", padding: "13px 32px", backgroundColor: RED, color: "#fff", fontFamily: FONT, fontSize: 14, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", textDecoration: "none", transition: "background 0.2s" }}
          onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.backgroundColor = "#f90a18"; }}
          onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.backgroundColor = RED; }}
        >
          <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
        </a>
      </div>
    </section>
  );
}

// ── bakery-02-hero ────────────────────────────────────────────────────────────
function HeroBakery02Hero({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const c = content as {
    slides?: Array<{ backgroundImage?: string; headingLine1?: string; headingLine2?: string }>;
    ctaText?: string;
    ctaHref?: string;
  };
  const slides = Array.isArray(c.slides) && c.slides.length > 0 ? c.slides : [
    { backgroundImage: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=1920&q=85", headingLine1: "PEČEME S LÁSKOU", headingLine2: "OD ROKU 2008" },
    { backgroundImage: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=1920&q=85", headingLine1: "ČERSTVÝ CHLÉB", headingLine2: "KAŽDÝ DEN" },
    { backgroundImage: "https://images.unsplash.com/photo-1568254183919-78a4f43a2877?w=1920&q=85", headingLine1: "TRADIČNÍ RECEPTURY", headingLine2: "MODERNÍ CHUŤ" },
  ];
  const ctaText = c.ctaText ?? "Naše pečivo";
  const ctaHref = c.ctaHref ?? "#pecivo";
  const count = slides.length;

  const [idx, setIdx] = useState(0);
  useEffect(() => {
    if (count < 2) return;
    const t = setInterval(() => setIdx((i) => (i + 1) % count), 5000);
    return () => clearInterval(t);
  }, [count]);

  const FONT = "'Lato','Helvetica Neue',Arial,sans-serif";

  return (
    <section
      data-template="bakery-02"
      style={{ position: "relative", width: "100%", minHeight: "100svh", overflow: "hidden", backgroundColor: "#1a1a1a" }}
    >
      <style>{`
        @keyframes b02HeroFadeUp {
          0%   { opacity: 0; transform: translateY(30px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        [data-template="bakery-02"] .b02h-line1 { animation: b02HeroFadeUp .9s cubic-bezier(.22,.61,.36,1) .1s both; }
        [data-template="bakery-02"] .b02h-line2 { animation: b02HeroFadeUp .9s cubic-bezier(.22,.61,.36,1) .3s both; }
        [data-template="bakery-02"] .b02h-cta   { animation: b02HeroFadeUp .9s cubic-bezier(.22,.61,.36,1) .5s both; }
        [data-template="bakery-02"] .b02h-cta-btn {
          display: inline-block;
          padding: 13px 40px;
          border: 1.5px solid rgba(255,255,255,0.85);
          color: #fff;
          font-family: 'Lato','Helvetica Neue',Arial,sans-serif;
          font-size: 13px;
          font-weight: 600;
          letter-spacing: 3px;
          text-transform: uppercase;
          text-decoration: none;
          background: transparent;
          transition: background 0.25s, color 0.25s;
        }
        [data-template="bakery-02"] .b02h-cta-btn:hover {
          background: #fff;
          color: #222;
        }
        [data-template="bakery-02"] .b02h-dots { display: flex; gap: 8px; }
        [data-template="bakery-02"] .b02h-dot {
          width: 7px; height: 7px; border-radius: 50%;
          border: 1.5px solid rgba(255,255,255,0.7);
          background: transparent;
          cursor: pointer; transition: background .3s;
        }
        [data-template="bakery-02"] .b02h-dot.active { background: rgba(255,255,255,0.85); }
        @media (prefers-reduced-motion: reduce) {
          [data-template="bakery-02"] .b02h-line1,
          [data-template="bakery-02"] .b02h-line2,
          [data-template="bakery-02"] .b02h-cta { animation: none; opacity: 1; transform: none; }
        }
      `}</style>

      {/* Slides — cross-fade */}
      {slides.map((s, i) => (
        <div
          key={`b02-slide-${i}`}
          style={{
            position: "absolute", inset: 0,
            opacity: i === idx ? 1 : 0,
            transition: "opacity 1s ease",
            zIndex: 0,
          }}
          aria-hidden={i !== idx}
        >
          {s.backgroundImage ? (
            <GenericEditableImage sectionId={sectionId} field={`slides.${i}.backgroundImage`} src={String(s.backgroundImage)} alt="" style={{ position: "absolute", inset: 0 }}>
              <Image
                src={String(s.backgroundImage)}
                alt=""
                fill
                priority={i === 0}
                sizes="100vw"
                style={{ objectFit: "cover", objectPosition: "center" }}
                unoptimized={shouldSkipNextImageOptimization(String(s.backgroundImage))}
              />
            </GenericEditableImage>
          ) : (
            <div style={{ position: "absolute", inset: 0, backgroundColor: "#222" }} />
          )}
        </div>
      ))}

      {/* Gradient overlay */}
      <div
        aria-hidden
        style={{
          position: "absolute", inset: 0, zIndex: 1, pointerEvents: "none",
          background: "linear-gradient(to bottom, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.1) 40%, rgba(0,0,0,0.55) 100%)",
        }}
      />

      {/* Center content — keyed for re-animation on slide change */}
      <div
        style={{
          position: "relative", zIndex: 2,
          minHeight: "100svh",
          display: "flex", alignItems: "center", justifyContent: "center",
          textAlign: "center",
          padding: "0 clamp(20px, 6vw, 80px)",
        }}
      >
        <div key={`b02-content-${idx}`} style={{ maxWidth: 760 }}>
          <p
            className="b02h-line1"
            style={{ fontFamily: FONT, fontSize: "clamp(0.75rem, 1.4vw, 0.95rem)", fontWeight: 400, letterSpacing: "5px", textTransform: "uppercase", color: "rgba(255,255,255,0.75)", margin: "0 0 18px" }}
          >
            <GenericEditableText sectionId={sectionId} field={`slides.${idx}.headingLine1`} value={slides[idx]?.headingLine1 ?? ""} tag="span" />
          </p>
          <h1
            className="b02h-line2"
            style={{ fontFamily: FONT, fontSize: "clamp(2.2rem, 5.5vw, 5rem)", fontWeight: 300, letterSpacing: "8px", textTransform: "uppercase", color: "#fff", margin: "0 0 40px", lineHeight: 1.1 }}
          >
            <GenericEditableText sectionId={sectionId} field={`slides.${idx}.headingLine2`} value={slides[idx]?.headingLine2 ?? ""} tag="span" />
          </h1>
          <div className="b02h-cta">
            <a href={ctaHref} data-btn="primary" className="b02h-cta-btn">
              <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
            </a>
          </div>
        </div>
      </div>

      {/* Dot indicators */}
      <div
        style={{ position: "absolute", bottom: 32, left: "50%", transform: "translateX(-50%)", zIndex: 3, display: "flex", gap: 8 }}
        className="b02h-dots"
      >
        {slides.map((_, i) => (
          <button
            key={`b02-dot-${i}`}
            className={`b02h-dot${i === idx ? " active" : ""}`}
            onClick={() => setIdx(i)}
            aria-label={`Slide ${i + 1}`}
            style={{}}
          />
        ))}
      </div>
    </section>
  );
}

// ── edu-01-hero ───────────────────────────────────────────────────────────────
// Premium hero: navy gradient bg + dekorativní kruhy, levá strana s nadpisem,
// search widgetem (bílá karta), quick category chipy, trust row se statistikami.
// Pravá strana: velká fotka s floating testimonial kartou.
// ─────────────────────────────────────────────────────────────────────────────
function HeroEdu01({ content, sectionId, tenantSlug, isAdmin }: Omit<Props, "variant">) {
  const c = content as Record<string, unknown>;
  const heading    = String(c.heading    ?? "Doučování na míru");
  const subheading = String(c.subheading ?? "Individuální přístup pro každého studenta. Matematika, jazyky, přijímačky a maturita.");
  const ctaHref    = String(c.ctaHref    ?? "/sluzby");

  const heroImages = (c.heroImages as string[] | undefined) ?? [
    "/clones/skolapopulo/img/large_virtual_classroom_study_space_23_2149178644_1ac594bc94.jpg",
    "/clones/skolapopulo/img/large_SP_3_2023_806_9058ffa96d.jpg",
    "/clones/skolapopulo/img/large_portrait_smiling_beautiful_blond_woman_writing_down_notes_doing_homework_studying_from_home_doing_1258_254363_5e6344dc8c.jpg",
    "/clones/skolapopulo/img/large_Skola_Populo_10_2022_Socials_741_4_7afe053e0a.jpg",
  ];

  const NAVY  = "#132339";
  const BLUE  = "#0059df";
  const LIGHT = "#91bae4";
  const FONT  = "'Libre Franklin', Arial, sans-serif";

  const resolve = (href: string) => (tenantSlug && !isAdmin) ? `/demo/${tenantSlug}${href}` : href;

  const subjects = ["Matematika", "Angličtina", "Fyzika", "Chemie", "Maturita", "Přijímačky"];
  const stats = [
    { value: "34 000+", label: "studentů" },
    { value: "96 %",    label: "úspěšnost" },
    { value: "1 300+",  label: "lektorů" },
  ];

  return (
    <>
      <style>{`
        .edu01h{position:relative;width:100%;min-height:680px;background:linear-gradient(135deg,${NAVY} 0%,#0d1b2e 100%);overflow:hidden;font-family:${FONT};display:flex;align-items:center;}
        /* dekorativní kruhy */
        .edu01h::before{content:'';position:absolute;top:-120px;left:-120px;width:500px;height:500px;border-radius:50%;border:80px solid rgba(0,89,223,0.07);pointer-events:none;}
        .edu01h::after{content:'';position:absolute;bottom:-80px;left:38%;width:320px;height:320px;border-radius:50%;border:50px solid rgba(0,89,223,0.05);pointer-events:none;}
        .edu01h-dot1{position:absolute;top:15%;right:46%;width:10px;height:10px;border-radius:50%;background:${BLUE};opacity:0.4;}
        .edu01h-dot2{position:absolute;top:60%;left:2%;width:6px;height:6px;border-radius:50%;background:${LIGHT};opacity:0.5;}
        .edu01h-inner{position:relative;z-index:2;width:100%;max-width:1280px;margin:0 auto;padding:80px 48px;display:grid;grid-template-columns:1fr 1fr;gap:48px;align-items:center;}
        /* LEFT */
        .edu01h-badge{display:inline-flex;align-items:center;gap:8px;background:rgba(0,89,223,0.15);border:1px solid rgba(0,89,223,0.3);color:${LIGHT};font-size:12px;font-weight:700;letter-spacing:1.8px;text-transform:uppercase;padding:6px 14px;border-radius:40px;margin-bottom:24px;}
        .edu01h-badge-dot{width:7px;height:7px;border-radius:50%;background:#34df51;animation:edu01hpulse 2s ease-in-out infinite;}
        @keyframes edu01hpulse{0%,100%{opacity:1;transform:scale(1);}50%{opacity:0.5;transform:scale(1.4);}}
        .edu01h h1{font-family:${FONT};font-weight:800;font-size:clamp(2.2rem,4vw,3.4rem);color:#fff;margin:0 0 16px;line-height:1.1;letter-spacing:-0.04em;}
        .edu01h-accent{color:${BLUE};}
        .edu01h-sub{font-size:clamp(1rem,1.4vw,1.1rem);color:rgba(255,255,255,0.7);line-height:1.7;margin:0 0 32px;max-width:460px;}
        /* SEARCH CARD */
        .edu01h-search{background:#fff;border-radius:16px;padding:8px 8px 8px 20px;display:flex;align-items:center;gap:8px;box-shadow:0 20px 60px rgba(0,0,0,0.3);margin-bottom:20px;}
        .edu01h-search-icon{flex-shrink:0;color:#9ca3af;}
        .edu01h-search input{flex:1;border:none;outline:none;font-family:${FONT};font-size:15px;color:#1a1a1a;background:transparent;min-width:0;}
        .edu01h-search input::placeholder{color:#9ca3af;}
        .edu01h-search-btn{flex-shrink:0;padding:12px 28px;background:${BLUE};color:#fff;font-family:${FONT};font-weight:700;font-size:15px;border:none;border-radius:10px;cursor:pointer;white-space:nowrap;transition:background 0.15s,transform 0.15s;text-decoration:none;display:inline-block;}
        .edu01h-search-btn:hover{background:#0032b2;transform:scale(1.02);}
        /* CHIPS */
        .edu01h-chips{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:36px;}
        .edu01h-chip{display:inline-block;padding:6px 14px;background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.15);color:rgba(255,255,255,0.85);font-size:13px;font-weight:500;border-radius:40px;text-decoration:none;transition:background 0.15s,border-color 0.15s;}
        .edu01h-chip:hover{background:rgba(0,89,223,0.2);border-color:rgba(0,89,223,0.5);color:#fff;}
        /* TRUST */
        .edu01h-trust{display:flex;gap:32px;padding-top:24px;border-top:1px solid rgba(255,255,255,0.1);}
        .edu01h-stat-val{font-size:1.5rem;font-weight:800;color:#fff;line-height:1;}
        .edu01h-stat-lbl{font-size:12px;color:rgba(255,255,255,0.55);margin-top:2px;}
        /* RIGHT — 4-photo 2×2 mosaic */
        .edu01h-right{position:relative;}
        .edu01h-glow{position:absolute;top:-60px;right:-60px;width:480px;height:480px;border-radius:50%;background:radial-gradient(circle,rgba(0,89,223,0.18) 0%,transparent 65%);pointer-events:none;z-index:0;}
        .edu01h-photos{position:relative;z-index:1;display:grid;grid-template-columns:1fr 1fr;grid-template-rows:54% 46%;gap:10px;height:560px;}
        .edu01h-img-a,.edu01h-img-b,.edu01h-img-c,.edu01h-img-d{position:relative;border-radius:16px;overflow:hidden;box-shadow:0 16px 48px rgba(0,0,0,0.45);}
        .edu01h-img-a img,.edu01h-img-b img,.edu01h-img-c img,.edu01h-img-d img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:block;transition:transform 0.55s ease;}
        .edu01h-img-a>*,.edu01h-img-b>*,.edu01h-img-c>*,.edu01h-img-d>*{position:absolute!important;inset:0!important;width:100%!important;height:100%!important;}
        .edu01h-img-a:hover img,.edu01h-img-b:hover img,.edu01h-img-c:hover img,.edu01h-img-d:hover img{transform:scale(1.06);}
        /* subtle dark overlay on bottom-right for card legibility */
        .edu01h-img-d::after{content:'';position:absolute;inset:0;background:rgba(13,27,46,0.18);pointer-events:none;}
        /* floating testimonial card — overlaps grid center-bottom */
        .edu01h-card{position:absolute;bottom:56px;left:50%;transform:translateX(-50%);z-index:4;background:rgba(255,255,255,0.97);backdrop-filter:blur(10px);border-radius:14px;padding:14px 20px;box-shadow:0 16px 48px rgba(0,0,0,0.3);width:230px;}
        .edu01h-card-stars{color:#f59e0b;font-size:13px;letter-spacing:2px;margin-bottom:5px;}
        .edu01h-card-text{font-size:12px;color:#374151;line-height:1.5;margin-bottom:6px;font-style:italic;}
        .edu01h-card-author{font-size:11px;font-weight:700;color:${NAVY};}
        /* count badge — top-right corner of mosaic */
        .edu01h-count{position:absolute;top:50%;right:-4px;transform:translateY(-50%);z-index:4;background:${BLUE};color:#fff;border-radius:50px;padding:10px 16px;box-shadow:0 8px 28px rgba(0,89,223,0.5);display:flex;align-items:center;gap:8px;white-space:nowrap;}
        .edu01h-count-icon{font-size:16px;}
        .edu01h-count-text{font-size:11px;font-weight:700;line-height:1.3;}
        /* RESPONSIVE */
        @media(max-width:900px){
          .edu01h-inner{grid-template-columns:1fr;padding:60px 24px 40px;}
          .edu01h-right{display:none;}
          .edu01h-trust{gap:20px;}
        }
        @media(max-width:480px){
          .edu01h h1{font-size:2rem;}
          .edu01h-search{flex-wrap:wrap;padding:12px;}
          .edu01h-search-btn{width:100%;}
        }
      `}</style>

      <section id={String(sectionId)} className="edu01h" data-template="edu-01-hero">
        <span className="edu01h-dot1" aria-hidden="true" />
        <span className="edu01h-dot2" aria-hidden="true" />
        <div className="edu01h-inner">
          {/* LEFT */}
          <div>
            <div className="edu01h-badge">
              <span className="edu01h-badge-dot" />
              Individuální doučování
            </div>
            <h1>
              <GenericEditableText sectionId={sectionId} field="heading" value={heading.replace("na míru", "")} tag="span" />
              {" "}<span className="edu01h-accent">na míru</span>
            </h1>
            <p className="edu01h-sub">
              <GenericEditableText sectionId={sectionId} field="subheading" value={subheading} tag="span" />
            </p>

            {/* Search widget */}
            <div className="edu01h-search">
              <svg className="edu01h-search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
              <input type="text" placeholder="Co potřebujete doučit?" aria-label="Hledat předmět" />
              <a href={resolve(ctaHref)} data-btn="primary" className="edu01h-search-btn">Vyhledat</a>
            </div>

            {/* Quick subject chips */}
            <div className="edu01h-chips">
              {subjects.map(s => (
                <a key={s} href={resolve(ctaHref)} data-btn="primary" className="edu01h-chip">{s}</a>
              ))}
            </div>

            {/* Trust stats */}
            <div className="edu01h-trust">
              {stats.map(st => (
                <div key={st.label}>
                  <div className="edu01h-stat-val">{st.value}</div>
                  <div className="edu01h-stat-lbl">{st.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT — 3-photo mosaic */}
          <div className="edu01h-right">
            <span className="edu01h-glow" aria-hidden="true" />
            <div className="edu01h-photos">
              <div className="edu01h-img-a">
                <GenericEditableImage sectionId={sectionId} field="heroImages.0" src={heroImages[0]} alt="">
                  <img src={heroImages[0]} alt="" loading="eager" />
                </GenericEditableImage>
              </div>
              <div className="edu01h-img-b">
                <GenericEditableImage sectionId={sectionId} field="heroImages.1" src={heroImages[1]} alt="">
                  <img src={heroImages[1]} alt="" loading="eager" />
                </GenericEditableImage>
              </div>
              <div className="edu01h-img-c">
                <GenericEditableImage sectionId={sectionId} field="heroImages.2" src={heroImages[2]} alt="">
                  <img src={heroImages[2]} alt="" loading="lazy" />
                </GenericEditableImage>
              </div>
              <div className="edu01h-img-d">
                <GenericEditableImage sectionId={sectionId} field="heroImages.3" src={heroImages[3]} alt="">
                  <img src={heroImages[3]} alt="" loading="lazy" />
                </GenericEditableImage>
              </div>
            </div>

            {/* Floating testimonial card */}
            <div className="edu01h-card" aria-hidden="true">
              <div className="edu01h-card-stars">★★★★★</div>
              <div className="edu01h-card-text">"Syn udělal maturitu z matiky na výbornou!"</div>
              <div className="edu01h-card-author">Jana N. — matka studenta</div>
            </div>

            {/* Count badge */}
            <div className="edu01h-count" aria-hidden="true">
              <span className="edu01h-count-icon">🎓</span>
              <div className="edu01h-count-text">34 000+<br/>studentů</div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

// ─── autoskola-01 Hero ────────────────────────────────────────────────────────
function HeroAutoskola01({ content, sectionId, tenantSlug, isAdmin }: Omit<Props, "variant">) {
  const c = content as Record<string, string>;
  const heading = c.heading ?? "Nejlépe hodnocená autoškola v ČR";
  const subheading = c.subheading ?? "Kurzy na míru vašim potřebám s možností splátek od 850 Kč měsíčně.";
  const ctaText = c.ctaText ?? "Chci se přihlásit";
  const ctaHref = c.ctaHref ?? "/prihlaseni";
  const ctaSecondaryText = c.ctaSecondaryText ?? "Zobrazit kurzy";
  const ctaSecondaryHref = c.ctaSecondaryHref ?? "/kurzy";
  const bgImage = c.backgroundImage ?? "/clones/nobe/img/ridicak-450x275.jpg";

  const ORANGE = "#f16823";
  const FONT = "'Roboto', sans-serif";

  const resolve = (href: string) => (tenantSlug && !isAdmin) ? `/demo/${tenantSlug}${href}` : href;

  return (
    <section
      id={String(sectionId)}
      style={{ position: "relative", width: "100%", height: "100vh", minHeight: 480, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", backgroundColor: "#333" }}
    >
      <GenericEditableImage sectionId={sectionId} field="backgroundImage" src={bgImage} alt={heading} style={{ position: "absolute", inset: 0, zIndex: 1, display: "block" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: `url(${bgImage})`, backgroundSize: "cover", backgroundPosition: "center top" }} />
      </GenericEditableImage>
      <div style={{ position: "absolute", inset: 0, backgroundColor: "rgba(0,0,0,0.52)", zIndex: 2 }} aria-hidden />
      <div style={{ position: "relative", zIndex: 3, textAlign: "center", padding: "0 clamp(24px, 6vw, 80px)", display: "flex", flexDirection: "column", alignItems: "center", gap: 24, maxWidth: 820 }}>
        <h1 style={{ fontFamily: FONT, fontWeight: 700, fontSize: "clamp(2rem, 5vw, 3.8rem)", color: "#ffffff", margin: 0, lineHeight: 1.15, textShadow: "0 2px 16px rgba(0,0,0,0.4)" }}>
          <GenericEditableText sectionId={sectionId} field="heading" value={heading} tag="span" />
        </h1>
        <p style={{ fontFamily: FONT, fontWeight: 400, fontSize: "clamp(1rem, 2vw, 1.2rem)", color: "rgba(255,255,255,0.88)", margin: 0, maxWidth: 560, lineHeight: 1.55 }}>
          <GenericEditableText sectionId={sectionId} field="subheading" value={subheading} tag="span" />
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 14, justifyContent: "center", marginTop: 8 }}>
          <a
            href={resolve(ctaHref)}
            data-btn="primary"
            style={{ display: "inline-block", padding: "14px 36px", backgroundColor: ORANGE, color: "#fff", fontFamily: FONT, fontSize: 15, fontWeight: 600, letterSpacing: "0.04em", textDecoration: "none", borderRadius: 4, transition: "background 0.2s, transform 0.15s" }}
            onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.backgroundColor = "#d85710"; (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(-1px)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.backgroundColor = ORANGE; (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(0)"; }}
          >
            <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
          </a>
          <a
            href={resolve(ctaSecondaryHref)}
            style={{ display: "inline-block", padding: "13px 34px", backgroundColor: "transparent", color: "#fff", fontFamily: FONT, fontSize: 15, fontWeight: 600, letterSpacing: "0.04em", textDecoration: "none", borderRadius: 4, border: "2px solid rgba(255,255,255,0.8)", transition: "border-color 0.2s, transform 0.15s" }}
            onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = "#fff"; (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(-1px)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(255,255,255,0.8)"; (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(0)"; }}
          >
            <GenericEditableText sectionId={sectionId} field="ctaSecondaryText" value={ctaSecondaryText} tag="span" />
          </a>
        </div>
      </div>
    </section>
  );
}

// ── kids-01-hero ──────────────────────────────────────────────────────────────
// 1:1 scioles.cz: full-bleed image from top (fixed navbar floats over it).
// Top padding = navbar height (~96px). Content: tagline + heading + CTA.
// ─────────────────────────────────────────────────────────────────────────────
function HeroKids01({
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
  const YELLOW = "#ffc107";
  const DARK   = "#212529";
  const FONT   = "'Roboto', 'Nunito', sans-serif";

  const tagline    = String(content.tagline    ?? "pro děti 6 až 15 let");
  const heading    = String(content.heading    ?? "Demo Kroužky");
  const subheading = String(content.subheading ?? "Pohybové aktivity v přírodě — překonávání překážek i sebe sama");
  const ctaText    = String(content.ctaText    ?? "Chci se přihlásit");
  const ctaHref    = String(content.ctaHref    ?? "/kontakt");
  const imageUrl   = String(content.imageUrl   ?? "");
  const imageAlt   = String(content.imageAlt   ?? "Děti v přírodě na kroužku");

  // Fade-up on load (slight delay so page paint finishes first)
  const [mounted, setMounted] = useState(false);
  useEffect(() => { const t = setTimeout(() => setMounted(true), 120); return () => clearTimeout(t); }, []);

  function resolve(href: string) {
    if (!tenantSlug) return href;
    if (href.startsWith("http")) return href;
    const base = isAdmin ? `/demo/${tenantSlug}/admin` : `/demo/${tenantSlug}`;
    return href === "/" ? base : `${base}${href}`;
  }

  return (
    <section
      data-template="kids-01-hero"
      style={{
        position: "relative",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        fontFamily: FONT,
        paddingTop: 96,
        backgroundColor: "#1a3a2a",
      }}
    >
      {imageUrl && (
        <div style={{ position: "absolute", inset: 0, zIndex: 1 }}>
          <img
            src={imageUrl}
            alt={imageAlt}
            style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center" }}
          />
        </div>
      )}
      <div style={{ position: "absolute", inset: 0, background: "rgba(0,30,10,0.32)", zIndex: 2 }} aria-hidden />

      <div style={{
        position: "relative",
        zIndex: 3,
        textAlign: "center",
        padding: "60px clamp(20px, 6vw, 80px)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 20,
        maxWidth: 860,
        width: "100%",
        opacity: mounted ? 1 : 0,
        transform: mounted ? "none" : "translateY(28px)",
        transition: "opacity .8s ease, transform .8s ease",
      }}>
        <div style={{
          fontFamily: FONT,
          fontWeight: 400,
          fontSize: "clamp(11px, 1.4vw, 14px)",
          letterSpacing: "3px",
          textTransform: "uppercase" as const,
          color: "rgba(255,255,255,0.85)",
        }}>
          <GenericEditableText sectionId={sectionId} field="tagline" value={tagline} tag="span" />
        </div>

        <h1 style={{
          fontFamily: FONT,
          fontWeight: 700,
          fontSize: "clamp(2.6rem, 7vw, 5rem)",
          color: "#ffffff",
          margin: 0,
          lineHeight: 1.1,
          textShadow: "0 2px 20px rgba(0,0,0,0.5)",
        }}>
          <GenericEditableText sectionId={sectionId} field="heading" value={heading} tag="span" />
        </h1>

        <p style={{
          fontFamily: FONT,
          fontWeight: 400,
          fontSize: "clamp(1rem, 2vw, 1.2rem)",
          color: "rgba(255,255,255,0.88)",
          margin: 0,
          maxWidth: 580,
          lineHeight: 1.6,
        }}>
          <GenericEditableText sectionId={sectionId} field="subheading" value={subheading} tag="span" />
        </p>

        <a
          href={resolve(ctaHref)}
          data-btn="primary"
          style={{
            marginTop: 12,
            display: "inline-block",
            padding: "14px 36px",
            background: YELLOW,
            color: DARK,
            fontFamily: FONT,
            fontSize: 16,
            fontWeight: 500,
            textDecoration: "none",
            borderRadius: 4,
            border: `1px solid ${YELLOW}`,
            letterSpacing: "0.5px",
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = "#e0a800"; }}
          onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = YELLOW; }}
        >
          <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
        </a>
      </div>
    </section>
  );
}

// ── lang-01-hero ──────────────────────────────────────────────────────────────
// 1:1 jipka.cz:
// - Gradient bg: linear-gradient(135deg, #fdecef 0%, #e8f3ff 100%)
// - 2-col (1.2fr 1fr): vlevo eyebrow pill + H1 62px (em červeně) + subtitle + 2 CTA
// - Vpravo bílá karta (24px radius, shadow): heading + 2×3 grid jazyků (flag + název)
// ─────────────────────────────────────────────────────────────────────────────
interface Lang01HeroContent {
  eyebrow?: string;
  heading?: string;
  headingHighlight?: string;
  subheading?: string;
  ctaText?: string;
  ctaHref?: string;
  ctaSecondaryText?: string;
  ctaSecondaryHref?: string;
  cardHeading?: string;
  cardSubheading?: string;
  languages?: Array<{ flag: string; name: string }>;
}

function HeroLang01({ content, sectionId, tenantSlug, isAdmin }: { content: Record<string, unknown>; sectionId: number; tenantSlug?: string; isAdmin?: boolean }) {
  const c = content as Lang01HeroContent;
  const RED  = "#e63946";
  const DARK = "#1a1a2e";
  const FONT = "'Inter', -apple-system, sans-serif";

  const eyebrow   = c.eyebrow  ?? "Sleva 500 Kč do konce měsíce";
  const heading   = c.heading  ?? "Naučíme vás cizí jazyk opravdu";
  const highlight = c.headingHighlight ?? "cizí jazyk";
  const sub       = c.subheading ?? "Skupinové i individuální kurzy 9 jazyků, příprava na zkoušky, firemní výuka. Pomáháme vám mluvit, ne biflovat slovíčka.";
  const ctaText   = c.ctaText  ?? "Vybrat kurz";
  const ctaHref   = c.ctaHref  ?? "/kurzy";
  const ctaSecText = c.ctaSecondaryText ?? "Otestovat úroveň";
  const ctaSecHref = c.ctaSecondaryHref ?? "/#test";
  const cardH     = c.cardHeading    ?? "Letní jazykové tábory";
  const cardSub   = c.cardSubheading ?? "Pro děti 7–16 let · Praha · Mladá Boleslav · Brno";
  const langs     = c.languages ?? [
    { flag: "🇬🇧", name: "Angličtina" },
    { flag: "🇩🇪", name: "Němčina" },
    { flag: "🇪🇸", name: "Španělština" },
    { flag: "🇫🇷", name: "Francouzština" },
    { flag: "🇮🇹", name: "Italština" },
    { flag: "🇨🇳", name: "Čínština" },
  ];

  const resolve = (href: string) => {
    if (!href || href.startsWith("http") || href.startsWith("#")) return href;
    if (isAdmin && tenantSlug) return `/demo/${tenantSlug}${href}`;
    return href;
  };

  // Split heading around the highlighted word(s)
  const buildHeading = () => {
    if (!highlight || !heading.includes(highlight)) {
      return <>{heading}</>;
    }
    const parts = heading.split(highlight);
    return <>{parts[0]}<em style={{ fontStyle: "normal", color: RED }}>{highlight}</em>{parts[1]}</>;
  };

  return (
    <>
      <style>{`
        .lang01hero{position:relative;padding:80px 40px 100px;background:linear-gradient(135deg,#fdecef 0%,#e8f3ff 100%);overflow:hidden;font-family:${FONT};}
        .lang01hero-inner{max-width:1280px;margin:0 auto;display:grid;grid-template-columns:1.2fr 1fr;gap:60px;align-items:center;}
        .lang01hero-eyebrow{display:inline-block;padding:6px 14px;background:${RED};color:#fff;font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;border-radius:20px;margin-bottom:20px;}
        .lang01hero h1{font-size:62px;line-height:1.05;margin:0 0 22px;font-weight:800;letter-spacing:-1.5px;color:${DARK};}
        .lang01hero-sub{font-size:19px;line-height:1.6;color:#3a3a4e;margin:0 0 32px;}
        .lang01hero-btns{display:flex;gap:14px;flex-wrap:wrap;}
        .lang01hero-btn{display:inline-block;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:700;font-size:15px;transition:transform 0.2s,opacity 0.2s;}
        .lang01hero-btn:hover{transform:translateY(-2px);opacity:0.9;}
        .lang01hero-btn.primary{background:${RED};color:#fff;}
        .lang01hero-btn.outline{background:#fff;color:${DARK};border:2px solid ${DARK};}
        .lang01hero-card{background:#fff;border-radius:24px;padding:36px;box-shadow:0 20px 50px rgba(0,0,0,0.10);}
        .lang01hero-card h3{font-size:24px;margin:0 0 6px;color:${DARK};font-weight:800;}
        .lang01hero-card-sub{font-size:14px;color:#666;margin:0 0 24px;}
        .lang01hero-langs{display:grid;grid-template-columns:repeat(2,1fr);gap:12px;}
        .lang01hero-lang{padding:14px;border:1px solid #eef0f3;border-radius:12px;display:flex;align-items:center;gap:10px;font-weight:600;font-size:15px;color:${DARK};}
        .lang01hero-flag{font-size:24px;}
        @media(max-width:900px){
          .lang01hero{padding:60px 20px 80px;}
          .lang01hero-inner{grid-template-columns:1fr;gap:32px;}
          .lang01hero h1{font-size:36px;}
          .lang01hero-sub{font-size:16px;}
          .lang01hero-card{padding:24px;}
        }
      `}</style>
      <section className="lang01hero" data-template="lang-01">
        <div className="lang01hero-inner">
          <div>
            <span className="lang01hero-eyebrow">
              <GenericEditableText sectionId={sectionId} field="eyebrow" value={eyebrow} tag="span" />
            </span>
            <h1>
              <GenericEditableText sectionId={sectionId} field="heading" value={heading} tag="span">
                {buildHeading()}
              </GenericEditableText>
            </h1>
            <p className="lang01hero-sub">
              <GenericEditableText sectionId={sectionId} field="subheading" value={sub} tag="span" />
            </p>
            <div className="lang01hero-btns">
              <a href={resolve(ctaHref)} data-btn="primary" className="lang01hero-btn primary">
                <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
              </a>
              <a href={resolve(ctaSecHref)} className="lang01hero-btn outline">
                <GenericEditableText sectionId={sectionId} field="ctaSecondaryText" value={ctaSecText} tag="span" />
              </a>
            </div>
          </div>
          <div className="lang01hero-card">
            <h3>
              <GenericEditableText sectionId={sectionId} field="cardHeading" value={cardH} tag="span" />
            </h3>
            <p className="lang01hero-card-sub">
              <GenericEditableText sectionId={sectionId} field="cardSubheading" value={cardSub} tag="span" />
            </p>
            <div className="lang01hero-langs">
              {langs.map((l, i) => (
                <div key={i} className="lang01hero-lang">
                  <span className="lang01hero-flag">{l.flag}</span>
                  <GenericEditableText sectionId={sectionId} field={`languages.${i}.name`} value={l.name} tag="span" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

// ── grooming-01-hero ─────────────────────────────────────────────────────────
// 1:1 cutedogs.cz Swiper:
// - Horizontal sliding track (loop), speed 600ms cubic-bezier(.25,.1,.25,1)
// - Autoplay 3000ms (Swiper default), infinite loop via clone-first/clone-last
// - Left-aligned text overlay: kicker gold + H1 94px + p + white btn
// - Pagination dots: gold border, active white; offer panel fixed bottom-right
// ─────────────────────────────────────────────────────────────────────────────
function HeroGrooming01({ content, sectionId, tenantSlug, isAdmin }: { content: Record<string, unknown>; sectionId: number; tenantSlug?: string; isAdmin: boolean }) {
  type Slide = { imageUrl?: string; imageAlt?: string };
  const slides = ((content.slides as Slide[]) ?? []).filter(s => s.imageUrl);
  const count = slides.length;

  // infinite loop track: [clone_last, ...slides, clone_first]
  // startPos = 1 means we begin at slides[0]
  const ext  = count > 1 ? [slides[count - 1], ...slides, slides[0]] : [...slides];
  const extN = ext.length;
  const startPos = count > 1 ? 1 : 0;

  const [dotIdx, setDotIdx]           = useState(0);
  const [offerDismissed, setOfferDismissed] = useState(false);
  const [offerHidden, setOfferHidden] = useState(false);

  const trackRef  = useRef<HTMLDivElement>(null);
  const posRef    = useRef(startPos);
  const animating = useRef(false);

  const GOLD  = "#d0aa57";
  const WHITE = "#ffffff";
  const FONT  = "'Hanken Grotesk', 'Inter', sans-serif";

  const slideTo = useCallback((pos: number, animate: boolean) => {
    const el = trackRef.current;
    if (!el) return;
    el.style.transition = animate ? `transform 600ms cubic-bezier(.25,.1,.25,1)` : "none";
    el.style.transform  = `translateX(-${(pos / extN) * 100}%)`;
    posRef.current = pos;
    if (count > 1) {
      const real = ((pos - startPos) % count + count) % count;
      setDotIdx(real);
    }
  }, [extN, startPos, count]);

  // init position (no animation, no flash)
  useEffect(() => { slideTo(startPos, false); }, [slideTo, startPos]);

  const goNext = useCallback(() => {
    if (animating.current || count < 2) return;
    animating.current = true;
    const next = posRef.current + 1;
    slideTo(next, true);
    setTimeout(() => {
      if (next >= count + 1) {
        // jumped past clone_first → reset to real first silently
        slideTo(startPos, false);
      }
      animating.current = false;
    }, 650);
  }, [count, slideTo, startPos]);

  useEffect(() => {
    if (count < 2) return;
    const t = setInterval(goNext, 3000);
    return () => clearInterval(t);
  }, [goNext, count]);

  useEffect(() => {
    const onScroll = () => setOfferHidden(window.scrollY > 80);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const kicker  = String(content.subheading ?? "Prémiový psí salón");
  const heading = String(content.heading    ?? "Rozmazlujte své miláčky");
  const body    = String(content.body       ?? "Prémiová péče o Vaše domácí mazlíčky v centru Prahy.");
  const ctaText = String(content.ctaText    ?? "Více o nás");
  const ctaHref = String(content.ctaHref    ?? "#salon");

  const resolve = (href: string) => {
    if (!tenantSlug || !href.startsWith("#")) return href;
    return isAdmin ? `/demo/${tenantSlug}/admin${href}` : `/demo/${tenantSlug}${href}`;
  };

  const offerImg = "/clones/cutedogs/img/offer_img01.jpg";

  return (
    <>
      <style>{`
        .gr01hero{position:relative;min-height:100vh;background:#222529;overflow:hidden;}
        .gr01hero-track{position:absolute;inset:0;display:flex;will-change:transform;}
        .gr01hero-slide{flex-shrink:0;background-size:cover;background-position:center top;}
        .gr01hero-overlay{position:absolute;inset:0;background:linear-gradient(to right,rgba(0,0,0,0.62) 0%,rgba(0,0,0,0.18) 55%,transparent 100%);z-index:1;}
        .gr01hero-inner{position:relative;z-index:2;max-width:1424px;margin:0 auto;padding:0 40px;min-height:100vh;display:flex;align-items:center;}
        .gr01hero-col{text-align:left;max-width:540px;padding:160px 0 120px;}
        .gr01hero-kicker{display:block;font-size:16px;color:${GOLD};font-weight:700;text-transform:uppercase;letter-spacing:1.6px;margin-bottom:24px;padding-left:40px;position:relative;font-family:${FONT};}
        .gr01hero-kicker::before{content:'✂';position:absolute;left:0;top:-1px;font-size:18px;color:${GOLD};}
        .gr01hero-h1{font-size:clamp(48px,7vw,94px);color:${WHITE};line-height:1;font-weight:700;margin:0 0 24px;font-family:${FONT};}
        .gr01hero-body{font-size:22px;line-height:1.55;max-width:360px;color:rgba(255,255,255,0.88);margin-bottom:40px;font-family:${FONT};}
        .gr01hero-btn{display:inline-block;background:${WHITE};color:#1e2024;border-radius:4px;padding:14px 32px;font-size:15px;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;text-decoration:none;font-family:${FONT};transition:background 0.2s,color 0.2s;}
        .gr01hero-btn:hover{background:${GOLD};color:${WHITE};text-decoration:none;}
        .gr01hero-dots{position:absolute;bottom:32px;left:50%;transform:translateX(-50%);z-index:3;display:flex;gap:10px;}
        .gr01hero-dot{width:12px;height:12px;border-radius:50%;border:2px solid ${GOLD};background:transparent;cursor:pointer;transition:background 0.3s,border-color 0.3s;padding:0;}
        .gr01hero-dot.active{background:${WHITE};border-color:${WHITE};}
        .gr01hero-offer{position:fixed;right:0;bottom:0;width:450px;z-index:50;background:#26282b;transition:transform 0.4s ease,opacity 0.4s;}
        .gr01hero-offer.hidden{transform:translateY(100%);opacity:0;pointer-events:none;}
        .gr01hero-offer-img{width:100%;height:220px;object-fit:cover;display:block;}
        .gr01hero-offer-close{position:absolute;top:10px;right:12px;background:rgba(0,0,0,0.55);border:none;color:${WHITE};font-size:22px;line-height:1;width:32px;height:32px;border-radius:50%;cursor:pointer;display:flex;align-items:center;justify-content:center;}
        @media(max-width:600px){
          .gr01hero-col{padding:140px 0 80px;}
          .gr01hero-body{font-size:18px;}
          .gr01hero-offer{width:100%;}
        }
      `}</style>

      <section id="uvod" className="gr01hero" data-template="grooming-01-hero">
        {/* sliding track — width = extN × 100% of section */}
        <div
          ref={trackRef}
          className="gr01hero-track"
          style={{ width: `${extN * 100}%` }}
        >
          {ext.map((s, i) => {
            const isReal = count > 1 ? (i >= startPos && i < startPos + count) : true;
            const realIdx = count > 1 ? i - startPos : i;
            const inner = (
              <div
                className="gr01hero-slide"
                style={{ width: "100%", height: "100%", backgroundImage: s?.imageUrl ? `url(${s.imageUrl})` : undefined, backgroundColor: "#222529" }}
                role="img"
                aria-label={s?.imageAlt ?? ""}
              />
            );
            if (isReal && s?.imageUrl) {
              return (
                <GenericEditableImage
                  key={i}
                  sectionId={sectionId}
                  field={`slides.${realIdx}.imageUrl`}
                  src={s.imageUrl}
                  style={{ width: `${100 / extN}%`, flexShrink: 0, height: "100%" }}
                >
                  {inner}
                </GenericEditableImage>
              );
            }
            return <div key={i} style={{ width: `${100 / extN}%`, flexShrink: 0, height: "100%" }}>{inner}</div>;
          })}
        </div>

        <div className="gr01hero-overlay" aria-hidden="true" />

        <div className="gr01hero-inner">
          <div className="gr01hero-col">
            <span className="gr01hero-kicker">
              <GenericEditableText sectionId={sectionId} field="subheading" value={kicker} tag="span" />
            </span>
            <h1 className="gr01hero-h1">
              <GenericEditableText sectionId={sectionId} field="heading" value={heading} tag="span" />
            </h1>
            <p className="gr01hero-body">
              <GenericEditableText sectionId={sectionId} field="body" value={body} tag="span" />
            </p>
            <a href={resolve(ctaHref)} data-btn="primary" className="gr01hero-btn">
              <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
            </a>
          </div>
        </div>

        {count > 1 && (
          <div className="gr01hero-dots" role="tablist" aria-label="Slider navigace">
            {slides.map((_, i) => (
              <button
                key={i}
                className={`gr01hero-dot${i === dotIdx ? " active" : ""}`}
                onClick={() => {
                  if (animating.current) return;
                  animating.current = true;
                  slideTo(startPos + i, true);
                  setTimeout(() => { animating.current = false; }, 650);
                }}
                role="tab"
                aria-selected={i === dotIdx}
                aria-label={`Slide ${i + 1}`}
              />
            ))}
          </div>
        )}
      </section>

      {!offerDismissed && (
        <div className={`gr01hero-offer${offerHidden ? " hidden" : ""}`} role="complementary" aria-label="Nabídka">
          <div style={{ position: "relative" }}>
            <img loading="eager" src={offerImg} alt="Aktuální nabídka" className="gr01hero-offer-img" />
            <button className="gr01hero-offer-close" onClick={() => setOfferDismissed(true)} aria-label="Zavřít nabídku">×</button>
          </div>
          <div style={{ padding: "16px 24px", color: "rgba(255,255,255,0.65)", fontSize: 13, fontFamily: FONT }}>Aktuální akce pro členy klubu</div>
        </div>
      )}
    </>
  );
}


// ── pethotel-01-hero ──────────────────────────────────────────────────────────
// Fullscreen hero 100vh — skolkapropejska.cz inspired, upgraded:
// - bg foto main-box.jpg + gradient overlay (left dark → right transparent)
// - vlevo: velký bílý H1 90px + subtitle + 2 CTA tlačítka
// - vpravo: maskot pes PNG, absolutně umístěný, fade-in s lehkým float efektem
// - Quicksand font, červená #D6123D primary CTA, tmavá #712419 secondary
// ─────────────────────────────────────────────────────────────────────────────
function HeroPethotel01({
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
  const RED    = "#D6123D";
  const DARK   = "#712419";
  const WHITE  = "#ffffff";
  const FONT   = "'Quicksand', Arial, sans-serif";

  const heading    = String(content.heading    ?? "Nenechávejte svého pejska doma samotného!");
  const subheading = String(content.subheading ?? "V naší psí školce nebo hotelu si užije legraci s ostatními psími kamarády.");
  const cta1Text   = String(content.cta1Text   ?? "Psí školka");
  const cta1Href   = String(content.cta1Href   ?? "/sluzby");
  const cta2Text   = String(content.cta2Text   ?? "Psí hotel");
  const cta2Href   = String(content.cta2Href   ?? "/sluzby");
  const imageUrl   = String(content.imageUrl   ?? "/clones/skolkapropejska/img/pes-maskot.png");
  const bgUrl      = "/clones/skolkapropejska/img/main-box.jpg";

  const [mounted, setMounted] = useState(false);
  useEffect(() => { const t = setTimeout(() => setMounted(true), 80); return () => clearTimeout(t); }, []);

  function resolve(href: string) {
    if (!tenantSlug) return href;
    if (href.startsWith("http")) return href;
    const base = isAdmin ? `/demo/${tenantSlug}/admin` : `/demo/${tenantSlug}`;
    return href === "/" ? base : `${base}${href}`;
  }

  return (
    <>
      <style>{`
        @keyframes ph01-float {
          0%,100% { transform: translateY(0px); }
          50%      { transform: translateY(-14px); }
        }
        .ph01hero { position:relative; min-height:100vh; display:flex; align-items:center; overflow:hidden; font-family:${FONT}; padding-top:72px; }
        .ph01hero-bg { position:absolute; inset:0; z-index:1; }
        .ph01hero-bg img { width:100%; height:100%; object-fit:cover; object-position:center 40%; }
        .ph01hero-overlay { position:absolute; inset:0; z-index:2; background:linear-gradient(105deg, rgba(20,6,6,0.72) 0%, rgba(20,6,6,0.48) 52%, rgba(20,6,6,0.08) 100%); }
        .ph01hero-inner { position:relative; z-index:3; max-width:1200px; margin:0 auto; width:100%; padding:60px 48px 80px; display:grid; grid-template-columns:1fr 420px; align-items:center; gap:40px; }
        .ph01hero-text { display:flex; flex-direction:column; gap:28px; }
        .ph01hero-h1 { font-family:${FONT}; font-size:clamp(39px,4.7vw,75px); font-weight:800; color:${WHITE}; line-height:1.1; margin:0; text-shadow:0 2px 20px rgba(0,0,0,0.4); letter-spacing:-0.5px; }
        .ph01hero-sub { font-family:${FONT}; font-size:clamp(15px,1.5vw,19px); font-weight:600; color:rgba(255,255,255,0.92); line-height:1.55; margin:0; text-shadow:0 1px 8px rgba(0,0,0,0.3); max-width:580px; }
        .ph01hero-ctas { display:flex; gap:16px; flex-wrap:wrap; margin-top:8px; }
        .ph01hero-cta1 { display:inline-block; padding:16px 38px; background:${RED}; color:${WHITE}; font-family:${FONT}; font-size:18px; font-weight:700; text-decoration:none; border-radius:4px; border:2px solid ${RED}; transition:background .2s,transform .2s,box-shadow .2s; box-shadow:0 4px 18px rgba(214,18,61,0.45); }
        .ph01hero-cta1:hover { background:#b80d32; border-color:#b80d32; transform:translateY(-3px); box-shadow:0 8px 28px rgba(214,18,61,0.5); }
        .ph01hero-cta2 { display:inline-block; padding:16px 38px; background:transparent; color:${WHITE}; font-family:${FONT}; font-size:18px; font-weight:700; text-decoration:none; border-radius:4px; border:2px solid rgba(255,255,255,0.7); transition:background .2s,border-color .2s,transform .2s; backdrop-filter:blur(4px); }
        .ph01hero-cta2:hover { background:rgba(255,255,255,0.15); border-color:${WHITE}; transform:translateY(-3px); }
        .ph01hero-mascot { position:relative; display:flex; justify-content:center; align-items:flex-end; }
        .ph01hero-mascot img { width:100%; max-width:480px; object-fit:contain; filter:drop-shadow(0 12px 40px rgba(0,0,0,0.5)); animation:ph01-float 4s ease-in-out infinite; }
        @media(max-width:900px){
          .ph01hero-inner { grid-template-columns:1fr; padding:48px 24px 60px; }
          .ph01hero-mascot { display:none; }
          .ph01hero-h1 { font-size:clamp(38px,8vw,60px); }
        }
      `}</style>

      <section className="ph01hero" data-template="pethotel-01-hero">
        <div className="ph01hero-bg">
          <img loading="eager" src={bgUrl} alt="" aria-hidden="true" />
        </div>
        <div className="ph01hero-overlay" aria-hidden="true" />

        <div className="ph01hero-inner">
          {/* Text vlevo */}
          <div
            className="ph01hero-text"
            style={{
              opacity: mounted ? 1 : 0,
              transform: mounted ? "none" : "translateY(32px)",
              transition: "opacity .85s ease, transform .85s ease",
            }}
          >
            <h1 className="ph01hero-h1">
              <GenericEditableText sectionId={sectionId} field="heading" value={heading} tag="span" />
            </h1>
            <p className="ph01hero-sub">
              <GenericEditableText sectionId={sectionId} field="subheading" value={subheading} tag="span" />
            </p>
            <div className="ph01hero-ctas">
              <a href={resolve(cta1Href)} className="ph01hero-cta1">
                <GenericEditableText sectionId={sectionId} field="cta1Text" value={cta1Text} tag="span" />
              </a>
              <a href={resolve(cta2Href)} className="ph01hero-cta2">
                <GenericEditableText sectionId={sectionId} field="cta2Text" value={cta2Text} tag="span" />
              </a>
            </div>
          </div>

          {/* Maskot vpravo */}
          <div
            className="ph01hero-mascot"
            style={{
              opacity: mounted ? 1 : 0,
              transform: mounted ? "none" : "translateX(40px)",
              transition: "opacity 1s ease .2s, transform 1s ease .2s",
            }}
          >
            {imageUrl && (
              <GenericEditableImage sectionId={sectionId} field="imageUrl" src={imageUrl} alt="Maskot">
                <img loading="eager" src={imageUrl} alt="Maskot psí školky" />
              </GenericEditableImage>
            )}
          </div>
        </div>
      </section>
    </>
  );
}

// ── vet-01-hero ───────────────────────────────────────────────────────────────
// 1:1 veterinafenix.cz:
// - 499px výška, autoplay 4s, fade transition
// - 3 slides: teal+psi.jpg / blue+cat.jpg / purple+savci.jpg
// - Žádný text overlay na slidech — čisté fullbleed fotky
// - Šipky vlevo/vpravo (bílé) + tečky dole uprostřed
// ─────────────────────────────────────────────────────────────────────────────
function HeroVet01({ content }: { content: Record<string, unknown>; sectionId?: number; tenantSlug?: string; isAdmin?: boolean }) {
  const DEFAULT_SLIDES = [
    { backgroundUrl: "/clones/veterinafenix/img/main-psi.jpg",  overlayColor: "#1abc9c" },
    { backgroundUrl: "/clones/veterinafenix/img/main-cat.jpg",  overlayColor: "#4054b2" },
    { backgroundUrl: "/clones/veterinafenix/img/main-savci.jpg",overlayColor: "#833ca3" },
  ];

  const rawSlides = content.slides as typeof DEFAULT_SLIDES | undefined;
  const slides = (Array.isArray(rawSlides) && rawSlides.length > 0) ? rawSlides : DEFAULT_SLIDES;

  const [current, setCurrent] = useState(0);
  const [animating, setAnimating] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const goTo = useCallback((idx: number) => {
    if (animating) return;
    setAnimating(true);
    setCurrent(idx);
    setTimeout(() => setAnimating(false), 700);
  }, [animating]);

  const next = useCallback(() => goTo((current + 1) % slides.length), [current, slides.length, goTo]);
  const prev = useCallback(() => goTo((current - 1 + slides.length) % slides.length), [current, slides.length, goTo]);

  useEffect(() => {
    timerRef.current = setTimeout(next, 4000);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [current, next]);

  const slide = slides[current];

  return (
    <section className="vet01hero" data-template="vet-01-hero" aria-label="Hero slider">
      <style>{`
        .vet01hero{position:relative;width:100%;height:499px;overflow:hidden;background:#1a1a1a;}
        @media(max-width:767px){.vet01hero{height:294px;}}
        @media(max-width:480px){.vet01hero{height:200px;}}
        /* Slide */
        .vet01hero-slide{position:absolute;inset:0;background-size:cover;background-position:center;transition:opacity 0.7s ease;opacity:0;}
        .vet01hero-slide.active{opacity:1;}
        /* Color overlay */
        .vet01hero-overlay{position:absolute;inset:0;opacity:0.32;}
        /* Arrows */
        .vet01hero-arrow{position:absolute;top:50%;transform:translateY(-50%);z-index:10;background:rgba(255,255,255,0.18);border:none;cursor:pointer;width:44px;height:44px;border-radius:50%;display:flex;align-items:center;justify-content:center;transition:background 0.2s;}
        .vet01hero-arrow:hover{background:rgba(255,255,255,0.38);}
        .vet01hero-arrow.prev{left:20px;}
        .vet01hero-arrow.next{right:20px;}
        /* Dots */
        .vet01hero-dots{position:absolute;bottom:18px;left:50%;transform:translateX(-50%);display:flex;gap:8px;z-index:10;}
        .vet01hero-dot{width:10px;height:10px;border-radius:50%;background:rgba(255,255,255,0.5);border:none;cursor:pointer;padding:0;transition:background 0.25s,transform 0.25s;}
        .vet01hero-dot.active{background:#ffffff;transform:scale(1.25);}
      `}</style>

      {slides.map((s, i) => (
        <div
          key={i}
          className={`vet01hero-slide${i === current ? " active" : ""}`}
          style={{ backgroundImage: `url(${s.backgroundUrl})` }}
          aria-hidden={i !== current}
        >
          <div className="vet01hero-overlay" style={{ background: s.overlayColor }} />
        </div>
      ))}

      <button className="vet01hero-arrow prev" onClick={prev} aria-label="Předchozí slide">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <polyline points="15 18 9 12 15 6"/>
        </svg>
      </button>
      <button className="vet01hero-arrow next" onClick={next} aria-label="Další slide">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <polyline points="9 18 15 12 9 6"/>
        </svg>
      </button>

      <div className="vet01hero-dots" role="tablist" aria-label="Výběr slidu">
        {slides.map((_, i) => (
          <button
            key={i}
            className={`vet01hero-dot${i === current ? " active" : ""}`}
            onClick={() => goTo(i)}
            role="tab"
            aria-selected={i === current}
            aria-label={`Slide ${i + 1}`}
          />
        ))}
      </div>
    </section>
  );
}

// ── ucetni-01-hero ────────────────────────────────────────────────────────────
// 1:1 ucetnictvispravne.cz (post-42.css):
// - bg: #FFFFFF, padding 4rem 0
// - 2-col layout: left (55%) content | right (45%) illustration
// - H1: 3.6rem weight 400 #202124 lineHeight 1.2em (Space Grotesk)
// - Animated SVG underline curve (155×60px stroke #202124)
// - CTA button "Začít spolupráci": #FFB500 bg, #202124 text, border-radius 8px, padding 16px 24px
// - Callout box: gradient (#F4E4FD00 → #FFEEC6), icon + text
// - Right: illustration image (300×300 removebg)
// - Floating decorative card: gradient #FFFEE8→#FFF3F3, border #FFA0A3, rotateZ(-5deg)
// ─────────────────────────────────────────────────────────────────────────────
function HeroUcetni01({ content, sectionId, tenantSlug, isAdmin }: Omit<Props, "variant">) {
  const YELLOW = "#FFB500";
  const DARK   = "#202124";
  const WHITE  = "#ffffff";
  const FONT_H = "'Space Grotesk', Sans-serif";
  const FONT_B = "'Inter', Sans-serif";

  const title        = String(content.title        ?? "Účetnictví, konzultace a daňové poradenství");
  const ctaText      = String(content.ctaText      ?? "Začít spolupráci");
  const ctaHref      = String(content.ctaHref      ?? "#kontakt");
  const subtitle     = String(content.subtitle     ?? "Vítejte v Poctivém účetnictví – vašem spolehlivém partnerovi pro bezchybné vedení účetnictví a daňové poradenství.");
  const calendarText = String(content.calendarText ?? "Klikněte na ikonku kalendáře pro výběr online termínu konzultace nebo rady.");
  const card1Text    = String(content.card1Text    ?? "✅ Daňová optimalizace");
  const card2Text    = String(content.card2Text    ?? "📊 200+ spokojených klientů");
  const imageUrl     = String(content.imageUrl     ?? content.bgImage ?? "/templates/ucetni-01/illustration.png");

  const resolveHref = (href: string) => {
    if (!tenantSlug) return href;
    if (href.startsWith("#") || href.startsWith("http")) return href;
    return `/${isAdmin ? "admin/" : ""}${tenantSlug}${href.startsWith("/") ? href : "/" + href}`;
  };

  return (
    <>
      <style>{`
        .ucn01hero-section {
          background: ${WHITE};
          padding: 4rem 0;
          font-family: ${FONT_B};
          overflow: hidden;
        }
        .ucn01hero-inner {
          max-width: 1320px;
          margin: 0 auto;
          padding: 0 20px;
          display: flex;
          align-items: center;
          gap: 40px;
        }
        .ucn01hero-left {
          flex: 0 0 55%;
          min-width: 0;
        }
        .ucn01hero-right {
          flex: 0 0 45%;
          min-width: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
        }
        .ucn01hero-h1 {
          font-family: ${FONT_H};
          font-size: 3.6rem;
          font-weight: 400;
          line-height: 1.2em;
          color: ${DARK};
          margin: 0 0 8px 0;
        }
        .ucn01hero-underline {
          display: block;
          margin: 0 0 28px 0;
          width: 155px;
          height: 60px;
        }
        .ucn01hero-subtitle {
          font-family: ${FONT_B};
          font-size: 1rem;
          color: #515151;
          margin: 0 0 32px 0;
          max-width: 480px;
          line-height: 1.6;
        }
        .ucn01hero-cta-row {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 0;
          flex-wrap: wrap;
        }
        .ucn01hero-cta {
          display: inline-flex;
          align-items: center;
          padding: 16px 24px;
          background: ${YELLOW};
          color: ${DARK};
          font-family: ${FONT_B};
          font-size: 1rem;
          font-weight: 500;
          text-decoration: none;
          border-radius: 8px;
          border: 1px solid ${YELLOW};
          transition: background 0.2s, color 0.2s;
          white-space: nowrap;
        }
        .ucn01hero-cta:hover { background: #e6a300; border-color: #e6a300; }
        .ucn01hero-callout {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 1rem;
          background: linear-gradient(270deg, #F4E4FD00 0%, #FFEEC6 100%);
          border-radius: 5px;
          max-width: 440px;
        }
        .ucn01hero-callout-icon {
          font-size: 2.4rem;
          flex-shrink: 0;
          line-height: 1;
        }
        .ucn01hero-callout-text {
          font-family: ${FONT_B};
          font-size: 0.9rem;
          color: ${DARK};
          line-height: 1.5;
        }
        .ucn01hero-img-wrap {
          position: relative;
          width: 100%;
          max-width: 560px;
        }
        .ucn01hero-group-img {
          width: 100%;
          height: auto;
          display: block;
          object-fit: contain;
          position: relative;
          z-index: 2;
        }
        .ucn01hero-illustration {
          position: absolute;
          bottom: -20px;
          left: -10px;
          width: 33%;
          object-fit: contain;
          z-index: 3;
        }
        .ucn01hero-card {
          position: absolute;
          top: 16px;
          right: -8px;
          background: linear-gradient(269deg, #FFFEE8 0%, #FFF3F3 100%);
          border: 1px solid #FFA0A3;
          border-radius: 4px;
          padding: 8px 12px;
          transform: rotateZ(-5deg);
          font-family: ${FONT_B};
          font-size: 0.8rem;
          color: ${DARK};
          z-index: 4;
          white-space: nowrap;
        }
        .ucn01hero-card2 {
          position: absolute;
          bottom: 40px;
          right: -8px;
          background: linear-gradient(269deg, #FFFBF1 0%, rgba(255,255,255,0.32) 100%);
          border-radius: 5px;
          padding: 8px 14px;
          font-family: ${FONT_B};
          font-size: 0.8rem;
          color: ${DARK};
          z-index: 4;
          box-shadow: 0 2px 8px rgba(0,0,0,0.08);
          white-space: nowrap;
        }
        @keyframes ucn01-svg-draw {
          0%   { stroke-dashoffset: 272.763; opacity: 0; }
          5%   { opacity: 1; }
          45%  { stroke-dashoffset: 0; }
          65%  { stroke-dashoffset: 0; }
          95%  { stroke-dashoffset: 272.763; opacity: 1; }
          100% { stroke-dashoffset: 272.763; opacity: 0; }
        }
        .ucn01hero-underline path {
          stroke-dasharray: 272.763;
          stroke-dashoffset: 272.763;
          animation: ucn01-svg-draw 3.5s ease-in-out infinite;
        }
        @media (max-width: 900px) {
          .ucn01hero-inner { flex-direction: column; gap: 32px; }
          .ucn01hero-left { flex: none; width: 100%; }
          .ucn01hero-right { flex: none; width: 100%; justify-content: center; }
          .ucn01hero-h1 { font-size: 2.4rem; }
          .ucn01hero-img-wrap { max-width: 420px; }
        }
        @media (max-width: 600px) {
          .ucn01hero-section { padding: 3rem 0; }
          .ucn01hero-h1 { font-size: 2rem; }
          .ucn01hero-inner { padding: 0 16px; }
          .ucn01hero-img-wrap { max-width: 320px; }
        }
      `}</style>

      <section className="ucn01hero-section" data-template="ucetni-01-hero">
        <div className="ucn01hero-inner">
          {/* Left column */}
          <div className="ucn01hero-left">
            <h1 className="ucn01hero-h1">
              <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
            </h1>

            {/* SVG animated underline — draws/erases in loop, 1:1 with original */}
            <svg className="ucn01hero-underline" xmlns="http://www.w3.org/2000/svg" width="155" height="60" viewBox="0 0 158 63" fill="none" aria-hidden="true">
              <path d="M1.5 1.5C25 11.5 49 25.5 122.183 30.1813C131.78 30.2819 149.316 30.2746 155.157 20.3363C155.857 19.1456 157.756 12.8026 155.157 12.1097C153.532 11.6764 149.838 13.0366 148.448 13.3909C141.776 15.0915 135.594 17.9181 129.533 21.1455C124.647 23.7475 109.458 30.0968 109.371 37.329C109.305 42.8004 124.609 44.3234 127.881 45.0161C129.281 45.3124 138.37 45.2795 139.5 49C140.138 51.1009 135.5 57 132 61.5" stroke={DARK} strokeWidth="2.4" strokeLinecap="round" fill="none"/>
            </svg>

            <p className="ucn01hero-subtitle">
              <GenericEditableText sectionId={sectionId} field="subtitle" value={subtitle} tag="span" />
            </p>

            <div className="ucn01hero-cta-row">
              <a href={resolveHref(ctaHref)} data-btn="primary" className="ucn01hero-cta">
                <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
              </a>
              <div className="ucn01hero-callout">
                <span className="ucn01hero-callout-icon" aria-hidden="true">📅</span>
                <span className="ucn01hero-callout-text">
                  <GenericEditableText sectionId={sectionId} field="calendarText" value={calendarText} tag="span" />
                </span>
              </div>
            </div>
          </div>

          {/* Right column — group image + illustration overlay */}
          <div className="ucn01hero-right">
            <div className="ucn01hero-img-wrap">
              {/* Floating card top-right */}
              <div className="ucn01hero-card">
                <GenericEditableText sectionId={sectionId} field="card1Text" value={card1Text} tag="span" />
              </div>
              {/* Main group image */}
              <img src="/templates/ucetni-01/group.png" alt="" className="ucn01hero-group-img" loading="eager" />
              {/* Floating card bottom-right */}
              <div className="ucn01hero-card2">
                <GenericEditableText sectionId={sectionId} field="card2Text" value={card2Text} tag="span" />
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

// ── ucetni-02-hero ────────────────────────────────────────────────────────────
// grantex.cz premium style:
// - Full-viewport split: left green content column + right full-bleed photo
// - Gold overline label, bold white H1, subtitle, gold CTA with arrow
// - Trust badges row below CTA
// - Diagonal clip between left and right columns
// ─────────────────────────────────────────────────────────────────────────────
function HeroUcetni02({ content, sectionId, tenantSlug, isAdmin }: Omit<Props, "variant">) {
  const GREEN  = "#004835";
  const GREEN2 = "#003828";
  const GOLD   = "#bca160";
  const WHITE  = "#ffffff";
  const FONT_H = "'Montserrat', 'Helvetica Neue', Arial, sans-serif";
  const FONT_B = "'Open Sans', Arial, sans-serif";

  const title      = String(content.title              ?? "Jsme vaším partnerem");
  const subtitle   = String(content.subtitle           ?? "Přinášíme vám znalosti, finance a příležitosti. Snižujeme náklady, rizika a přebíráme administrativu, abyste se mohli naplno věnovat strategickému řízení vašeho podniku.");
  const ctaText    = String(content.ctaText            ?? "Opřete se o tým odborníků");
  const ctaHref    = String(content.ctaHref            ?? "#kontakt");
  const ctaSecText = String(content.ctaSecondaryText   ?? "Naše služby");
  const ctaSecHref = String(content.ctaSecondaryHref   ?? "#sluzby");
  const imageUrl   = String(content.bgImage            ?? "");

  const resolveHref = (href: string) => {
    if (!tenantSlug) return href;
    if (href.startsWith("#") || href.startsWith("http")) return href;
    return `/${isAdmin ? "admin/" : ""}${tenantSlug}${href.startsWith("/") ? href : "/" + href}`;
  };

  return (
    <>
      <style>{`
        .ucn02hero-wrap {
          position: relative;
          min-height: 640px;
          display: flex;
          overflow: hidden;
          font-family: ${FONT_B};
        }
        /* Left green column */
        .ucn02hero-left {
          position: relative;
          z-index: 2;
          flex: 0 0 58%;
          background: ${GREEN};
          display: flex;
          align-items: center;
          padding: 80px 0 80px 0;
          /* Diagonal right edge via clip-path */
          clip-path: polygon(0 0, 100% 0, calc(100% - 80px) 100%, 0 100%);
        }
        .ucn02hero-content {
          max-width: 560px;
          padding: 0 80px 0 clamp(24px, 6vw, 96px);
          width: 100%;
        }
        /* Right photo column */
        .ucn02hero-right {
          position: absolute;
          inset: 0 0 0 50%;
          z-index: 1;
          background: ${GREEN2};
        }
        .ucn02hero-photo {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center top;
          display: block;
          filter: brightness(0.88);
        }
        /* Overline */
        .ucn02hero-overline {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          font-family: ${FONT_H};
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 3px;
          text-transform: uppercase;
          color: ${GOLD};
          margin-bottom: 22px;
        }
        .ucn02hero-overline-bar {
          display: inline-block;
          width: 32px;
          height: 2px;
          background: ${GOLD};
          flex-shrink: 0;
        }
        /* H1 */
        .ucn02hero-h1 {
          font-family: ${FONT_H};
          font-size: clamp(38px, 3.8vw, 60px);
          font-weight: 700;
          line-height: 1.12;
          color: ${WHITE};
          margin: 0 0 24px 0;
          letter-spacing: -0.5px;
        }
        /* Subtitle */
        .ucn02hero-subtitle {
          font-size: 1rem;
          line-height: 1.75;
          color: rgba(255,255,255,0.78);
          margin: 0 0 44px 0;
          max-width: 460px;
        }
        /* CTA buttons */
        .ucn02hero-ctas {
          display: flex;
          gap: 14px;
          flex-wrap: wrap;
          margin-bottom: 44px;
        }
        .ucn02hero-cta-primary {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 15px 30px;
          background: ${GOLD};
          color: ${WHITE};
          font-family: ${FONT_H};
          font-size: 0.875rem;
          font-weight: 600;
          letter-spacing: 0.5px;
          text-decoration: none;
          border-radius: 4px;
          border: 2px solid ${GOLD};
          transition: background 0.2s, border-color 0.2s, transform 0.15s;
          white-space: nowrap;
          text-transform: uppercase;
        }
        .ucn02hero-cta-primary:hover {
          background: #a9904d;
          border-color: #a9904d;
          transform: translateY(-1px);
        }
        .ucn02hero-cta-primary svg { flex-shrink: 0; }
        .ucn02hero-cta-secondary {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 15px 30px;
          background: transparent;
          color: rgba(255,255,255,0.9);
          font-family: ${FONT_H};
          font-size: 0.875rem;
          font-weight: 600;
          letter-spacing: 0.5px;
          text-decoration: none;
          border-radius: 4px;
          border: 2px solid rgba(255,255,255,0.35);
          transition: border-color 0.2s, background 0.2s;
          white-space: nowrap;
          text-transform: uppercase;
        }
        .ucn02hero-cta-secondary:hover {
          border-color: ${WHITE};
          background: rgba(255,255,255,0.07);
        }
        /* Trust badges */
        .ucn02hero-trust {
          display: flex;
          flex-wrap: wrap;
          gap: 20px;
        }
        .ucn02hero-badge {
          display: flex;
          align-items: center;
          gap: 7px;
          font-size: 0.82rem;
          color: rgba(255,255,255,0.65);
          font-family: ${FONT_H};
        }
        .ucn02hero-badge-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: ${GOLD};
          flex-shrink: 0;
        }
        /* Responsive */
        @media (max-width: 960px) {
          .ucn02hero-wrap { flex-direction: column; min-height: unset; }
          .ucn02hero-left {
            flex: none;
            width: 100%;
            clip-path: none;
            padding: 64px 24px 48px;
          }
          .ucn02hero-content { max-width: 100%; padding: 0; }
          .ucn02hero-right {
            position: relative;
            inset: unset;
            width: 100%;
            height: 300px;
          }
          .ucn02hero-trust { display: none; }
        }
        @media (max-width: 600px) {
          .ucn02hero-left { padding: 48px 20px 40px; }
          .ucn02hero-h1 { font-size: 2.1rem; }
          .ucn02hero-ctas { flex-direction: column; }
          .ucn02hero-cta-primary, .ucn02hero-cta-secondary { justify-content: center; }
        }
      `}</style>

      <section className="ucn02hero-wrap" data-template="ucetni-02-hero">
        {/* Left: content */}
        <div className="ucn02hero-left">
          <div className="ucn02hero-content">
            <div className="ucn02hero-overline">
              <span className="ucn02hero-overline-bar" />
              Daňové poradenství
            </div>

            <h1 className="ucn02hero-h1">
              <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
            </h1>

            <p className="ucn02hero-subtitle">
              <GenericEditableText sectionId={sectionId} field="subtitle" value={subtitle} tag="span" />
            </p>

            <div className="ucn02hero-ctas">
              <a href={resolveHref(ctaHref)} data-btn="primary" className="ucn02hero-cta-primary">
                <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path d="M3 8h10M9 4l4 4-4 4" stroke={WHITE} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </a>
              <a href={resolveHref(ctaSecHref)} className="ucn02hero-cta-secondary">
                <GenericEditableText sectionId={sectionId} field="ctaSecondaryText" value={ctaSecText} tag="span" />
              </a>
            </div>

            <div className="ucn02hero-trust">
              <span className="ucn02hero-badge"><span className="ucn02hero-badge-dot"/>10+ let zkušeností</span>
              <span className="ucn02hero-badge"><span className="ucn02hero-badge-dot"/>1 600+ spokojených klientů</span>
              <span className="ucn02hero-badge"><span className="ucn02hero-badge-dot"/>Certifikovaní poradci</span>
            </div>
          </div>
        </div>

        {/* Right: photo */}
        <div className="ucn02hero-right">
          {imageUrl ? (
            <img src={imageUrl} alt="" className="ucn02hero-photo" loading="eager" />
          ) : (
            <div style={{ width: "100%", height: "100%", background: GREEN2 }} />
          )}
        </div>
      </section>
    </>
  );
}

// ── ucetni-03-hero ────────────────────────────────────────────────────────────
// gpf.cz / Gepard Finance style:
// - Dark green (#002000) section, optional bg photo overlay
// - 2-col: left (52%) H1 white + subtitle + 2 CTAs + trust badges
// - right (44%): white mortgage calculator card with sliders
// ─────────────────────────────────────────────────────────────────────────────
function HeroUcetni03({ content, sectionId, tenantSlug, isAdmin }: Omit<Props, "variant">) {
  const DARK   = "#002000";
  const GREEN  = "#8ec63f";
  const WHITE  = "#ffffff";
  const FONT_H = "'Montserrat', 'Helvetica Neue', Arial, sans-serif";
  const FONT_B = "'Open Sans', 'Helvetica Neue', Arial, sans-serif";

  const title            = String(content.title            ?? "Tým, který vám zajistí ty nejlepší podmínky.");
  const subtitle         = String(content.subtitle         ?? "Jsme hypoteční specialisté s více než 20 lety zkušeností.");
  const ctaText          = String(content.ctaText          ?? "Spočítat hypotéku");
  const ctaHref          = String(content.ctaHref          ?? "#kalkulacka");
  const ctaSecondaryText = String(content.ctaSecondaryText ?? "Kontaktovat poradce");
  const ctaSecondaryHref = String(content.ctaSecondaryHref ?? "#kontakt");
  const bgImage          = String(content.bgImage          ?? "");
  const rawTrust = content.trustBadges as string[] | undefined;
  const trustBadges = rawTrust && rawTrust.length > 0
    ? rawTrust
    : ["Zdarma, bez závazků", "20+ let zkušeností", "Všechny banky ČR"];

  const resolveHref = (href: string) => {
    if (!tenantSlug) return href;
    if (href.startsWith("#") || href.startsWith("http")) return href;
    return `/${isAdmin ? "admin/" : ""}${tenantSlug}${href.startsWith("/") ? href : "/" + href}`;
  };

  const [propertyValue, setPropertyValue] = useState(4000000);
  const [loanAmount,    setLoanAmount]    = useState(3200000);
  const [loanTerm,      setLoanTerm]      = useState(30);
  const [rate,          setRate]          = useState(5.29);

  const monthlyPayment = (() => {
    const r = rate / 100 / 12;
    const n = loanTerm * 12;
    if (r === 0) return Math.round(loanAmount / n);
    return Math.round((loanAmount * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1));
  })();

  const fmt = (v: number) => v.toLocaleString("cs-CZ");

  return (
    <>
      <style>{`
        .ucn03hero-section {
          position: relative;
          background: ${DARK};
          overflow: hidden;
          font-family: ${FONT_B};
        }
        .ucn03hero-bg {
          position: absolute;
          inset: 0;
          background-size: cover;
          background-position: center;
          opacity: 0.18;
          pointer-events: none;
        }
        .ucn03hero-inner {
          position: relative;
          z-index: 1;
          max-width: 1440px;
          margin: 0 auto;
          padding: 80px 40px;
          display: flex;
          align-items: center;
          gap: 60px;
        }
        .ucn03hero-left { flex: 0 0 52%; min-width: 0; }
        .ucn03hero-tag {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(142,198,63,0.15);
          border: 1px solid rgba(142,198,63,0.4);
          border-radius: 20px;
          padding: 6px 14px;
          font-size: 0.78rem;
          font-weight: 600;
          color: ${GREEN};
          letter-spacing: 0.5px;
          text-transform: uppercase;
          margin-bottom: 24px;
        }
        .ucn03hero-tag-dot {
          width: 6px; height: 6px;
          border-radius: 50%;
          background: ${GREEN};
          flex-shrink: 0;
        }
        .ucn03hero-h1 {
          font-family: ${FONT_H};
          font-size: 2.85rem;
          font-weight: 800;
          line-height: 1.15;
          color: ${WHITE};
          margin: 0 0 24px 0;
        }
        .ucn03hero-subtitle {
          font-size: 1.05rem;
          color: rgba(255,255,255,0.75);
          line-height: 1.65;
          margin: 0 0 40px 0;
          max-width: 480px;
        }
        .ucn03hero-ctas { display: flex; gap: 16px; flex-wrap: wrap; }
        .ucn03hero-cta-primary {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 15px 30px;
          background: ${GREEN};
          color: ${DARK};
          font-family: ${FONT_H};
          font-size: 0.95rem;
          font-weight: 700;
          text-decoration: none;
          border-radius: 6px;
          transition: background 0.2s, transform 0.15s;
          white-space: nowrap;
        }
        .ucn03hero-cta-primary:hover { background: #9dd44a; transform: translateY(-1px); }
        .ucn03hero-cta-secondary {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 14px 28px;
          background: transparent;
          color: ${WHITE};
          font-family: ${FONT_H};
          font-size: 0.95rem;
          font-weight: 600;
          text-decoration: none;
          border: 1.5px solid rgba(255,255,255,0.4);
          border-radius: 6px;
          transition: border-color 0.2s, background 0.2s;
          white-space: nowrap;
        }
        .ucn03hero-cta-secondary:hover { border-color: ${WHITE}; background: rgba(255,255,255,0.07); }
        .ucn03hero-trust {
          display: flex;
          align-items: center;
          gap: 20px;
          margin-top: 36px;
          flex-wrap: wrap;
        }
        .ucn03hero-trust-item {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.82rem;
          color: rgba(255,255,255,0.6);
        }
        .ucn03hero-trust-check {
          width: 16px; height: 16px;
          border-radius: 50%;
          background: ${GREEN};
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .ucn03hero-right { flex: 0 0 44%; min-width: 0; }
        .ucn03hero-calc {
          background: ${WHITE};
          border-radius: 16px;
          padding: 36px 32px;
          box-shadow: 0 24px 60px rgba(0,0,0,0.3);
        }
        .ucn03hero-calc-title {
          font-family: ${FONT_H};
          font-size: 1.2rem;
          font-weight: 700;
          color: ${DARK};
          margin: 0 0 4px 0;
        }
        .ucn03hero-calc-sub {
          font-size: 0.82rem;
          color: #737b79;
          margin: 0 0 28px 0;
        }
        .ucn03hero-field { margin-bottom: 20px; }
        .ucn03hero-label {
          display: flex;
          justify-content: space-between;
          font-size: 0.82rem;
          font-weight: 600;
          color: #3c3d3d;
          margin-bottom: 8px;
        }
        .ucn03hero-label span { font-weight: 400; color: #737b79; }
        .ucn03hero-range {
          width: 100%;
          -webkit-appearance: none;
          appearance: none;
          height: 4px;
          border-radius: 2px;
          background: #e4e4e4;
          outline: none;
          cursor: pointer;
        }
        .ucn03hero-range::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 20px; height: 20px;
          border-radius: 50%;
          background: ${GREEN};
          cursor: pointer;
          border: 2px solid ${WHITE};
          box-shadow: 0 2px 6px rgba(0,0,0,0.2);
        }
        .ucn03hero-range::-moz-range-thumb {
          width: 20px; height: 20px;
          border-radius: 50%;
          background: ${GREEN};
          cursor: pointer;
          border: 2px solid ${WHITE};
          box-shadow: 0 2px 6px rgba(0,0,0,0.2);
        }
        .ucn03hero-rate-row {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 24px;
          font-size: 0.82rem;
          color: #737b79;
          flex-wrap: wrap;
        }
        .ucn03hero-rate-badge {
          background: #f0f7e6;
          color: #3a6b00;
          font-weight: 700;
          font-size: 0.85rem;
          padding: 4px 10px;
          border-radius: 4px;
          border: 1px solid rgba(142,198,63,0.3);
          white-space: nowrap;
        }
        .ucn03hero-result {
          background: linear-gradient(135deg, #002000 0%, #003800 100%);
          border-radius: 10px;
          padding: 22px 24px;
          text-align: center;
        }
        .ucn03hero-result-label {
          font-size: 0.8rem;
          color: rgba(255,255,255,0.6);
          margin-bottom: 6px;
          letter-spacing: 0.3px;
        }
        .ucn03hero-result-value {
          font-family: ${FONT_H};
          font-size: 2rem;
          font-weight: 800;
          color: ${GREEN};
          line-height: 1;
        }
        .ucn03hero-result-note {
          font-size: 0.75rem;
          color: rgba(255,255,255,0.4);
          margin-top: 6px;
        }
        .ucn03hero-disclaimer {
          font-size: 0.72rem;
          color: #aaa;
          margin-top: 14px;
          text-align: center;
          line-height: 1.4;
        }
        @media (max-width: 1100px) {
          .ucn03hero-inner { padding: 60px 24px; gap: 40px; }
          .ucn03hero-h1 { font-size: 2.3rem; }
        }
        @media (max-width: 900px) {
          .ucn03hero-inner { flex-direction: column; padding: 48px 20px 0; }
          .ucn03hero-left, .ucn03hero-right { flex: none; width: 100%; }
          .ucn03hero-h1 { font-size: 2rem; }
          .ucn03hero-calc { border-radius: 16px 16px 0 0; }
        }
        @media (max-width: 600px) {
          .ucn03hero-h1 { font-size: 1.7rem; }
          .ucn03hero-ctas { flex-direction: column; }
          .ucn03hero-cta-primary, .ucn03hero-cta-secondary { justify-content: center; }
          .ucn03hero-calc { padding: 24px 20px; }
        }
      `}</style>

      <section className="ucn03hero-section" data-template="ucetni-03-hero">
        {bgImage && (
          <div className="ucn03hero-bg" style={{ backgroundImage: `url(${bgImage})` }} aria-hidden="true" />
        )}
        <div className="ucn03hero-inner">

          {/* ── Left column ── */}
          <div className="ucn03hero-left">
            <div className="ucn03hero-tag">
              <span className="ucn03hero-tag-dot" aria-hidden="true" />
              Bezplatné hypoteční poradenství
            </div>

            <h1 className="ucn03hero-h1">
              <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
            </h1>

            <p className="ucn03hero-subtitle">
              <GenericEditableText sectionId={sectionId} field="subtitle" value={subtitle} tag="span" />
            </p>

            <div className="ucn03hero-ctas">
              <a href={resolveHref(ctaHref)} data-btn="primary" className="ucn03hero-cta-primary">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
              </a>
              <a href={resolveHref(ctaSecondaryHref)} className="ucn03hero-cta-secondary">
                <GenericEditableText sectionId={sectionId} field="ctaSecondaryText" value={ctaSecondaryText} tag="span" />
              </a>
            </div>

            <div className="ucn03hero-trust">
              {trustBadges.map((item, i) => (
                <div key={i} className="ucn03hero-trust-item">
                  <div className="ucn03hero-trust-check" aria-hidden="true">
                    <svg width="9" height="9" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                      <path d="M2 6l3 3 5-5" stroke={DARK} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <GenericEditableText sectionId={sectionId} field={`trustBadges.${i}`} value={item} tag="span" />
                </div>
              ))}
            </div>
          </div>

          {/* ── Right column: calculator ── */}
          <div className="ucn03hero-right">
            <div className="ucn03hero-calc">
              <div className="ucn03hero-calc-title">Hypoteční kalkulačka</div>
              <div className="ucn03hero-calc-sub">Orientační výpočet měsíční splátky</div>

              <div className="ucn03hero-field">
                <div className="ucn03hero-label">
                  Cena nemovitosti <span>{fmt(propertyValue)} Kč</span>
                </div>
                <input
                  type="range"
                  className="ucn03hero-range"
                  min={500000} max={20000000} step={100000}
                  value={propertyValue}
                  onChange={e => {
                    const v = Number(e.target.value);
                    setPropertyValue(v);
                    if (loanAmount > v * 0.9) setLoanAmount(Math.round(v * 0.8));
                  }}
                />
              </div>

              <div className="ucn03hero-field">
                <div className="ucn03hero-label">
                  Výše hypotéky <span>{fmt(loanAmount)} Kč</span>
                </div>
                <input
                  type="range"
                  className="ucn03hero-range"
                  min={200000} max={Math.round(propertyValue * 0.9)} step={50000}
                  value={Math.min(loanAmount, Math.round(propertyValue * 0.9))}
                  onChange={e => setLoanAmount(Number(e.target.value))}
                />
              </div>

              <div className="ucn03hero-field">
                <div className="ucn03hero-label">
                  Doba splatnosti <span>{loanTerm} let</span>
                </div>
                <input
                  type="range"
                  className="ucn03hero-range"
                  min={5} max={30} step={1}
                  value={loanTerm}
                  onChange={e => setLoanTerm(Number(e.target.value))}
                />
              </div>

              <div className="ucn03hero-rate-row">
                <span>Úroková sazba:</span>
                <span className="ucn03hero-rate-badge">{rate.toFixed(2)} % p.a.</span>
                <input
                  type="range"
                  className="ucn03hero-range"
                  style={{ flex: 1, minWidth: 60 }}
                  min={2} max={10} step={0.1}
                  value={rate}
                  onChange={e => setRate(Number(e.target.value))}
                />
              </div>

              <div className="ucn03hero-result">
                <div className="ucn03hero-result-label">Měsíční splátka</div>
                <div className="ucn03hero-result-value">{fmt(monthlyPayment)} Kč</div>
                <div className="ucn03hero-result-note">LTV {Math.round(loanAmount / propertyValue * 100)} % · {loanTerm} let · {rate.toFixed(2)} % p.a.</div>
              </div>

              <div className="ucn03hero-disclaimer">
                Výpočet je orientační a nezahrnuje pojištění ani poplatky. Pro přesnou nabídku kontaktujte poradce.
              </div>
            </div>
          </div>

        </div>
      </section>
    </>
  );
}

// ── arch-01-hero ──────────────────────────────────────────────────────────────
// 1:1 karesarch.cz — slick fade slider:
// - autoplay 5000ms, speed 500ms linear fade, pauseOnHover: false, dots: false
// - gradient: rgba top 0.458 → 0% middle → rgba bottom 0.655 (přesně z karesarch CSS)
// - obsah: position absolute, bottom 18%, left 52%, translateX(-50%)
// - title: 60px desktop, font-weight 500, bílá
// - 2× CTA tlačítka (detail realizace + videa realizací)
// - šipky: 3rem od kraje, 4rem výška, bold SVG ikony z klonu
// - video slides: <video autoPlay muted loop playsInline> místo <img>
// ─────────────────────────────────────────────────────────────────────────────
function HeroArch01({ content, sectionId, tenantSlug, isAdmin }: Omit<Props, "variant">) {
  type Slide = { imageUrl?: string; videoUrl?: string; alt?: string; title?: string; ctaDetailHref?: string };
  const slides = (content.slides as Slide[]) ?? [];
  const ctaText      = String(content.ctaText  ?? "Prohlédnout realizace");
  const ctaHref      = String(content.ctaHref  ?? "/realizace");
  const ctaText2     = String(content.ctaText2 ?? "Videa realizací");
  const ctaHref2     = String(content.ctaHref2 ?? "/realizace");

  const [idx, setIdx] = useState(0);
  const timerRef  = useRef<ReturnType<typeof setTimeout> | null>(null);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  const count = slides.length;

  const go = useCallback((next: number) => {
    setIdx(((next % count) + count) % count);
  }, [count]);

  // Auto-advance — pauseOnHover: false (matches original)
  useEffect(() => {
    if (count < 2) return;
    timerRef.current = setTimeout(() => go(idx + 1), 5000);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [idx, count, go]);

  // Play/pause video when slide becomes active
  useEffect(() => {
    videoRefs.current.forEach((v, i) => {
      if (!v) return;
      if (i === idx) { v.currentTime = 0; v.play().catch(() => {}); }
      else v.pause();
    });
  }, [idx]);

  if (count === 0) return null;

  const resolvedCta  = resolveDemoHref(ctaHref,  tenantSlug, isAdmin);
  const resolvedCta2 = resolveDemoHref(ctaHref2, tenantSlug, isAdmin);

  const FONT = "'Helvetica Neue', Helvetica, Arial, sans-serif";

  // Arrows: exact bold SVG paths from karesarch clone
  const ArrowLeft = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 30" width="30" height="30" aria-hidden="true">
      <path fill="#fff" d="M16.3,28.3l2.7-2.7-8.8-8.8h17v-3.8H10.1l8.8-8.8-2.7-2.7L2.9,15l13.4,13.3Z"/>
    </svg>
  );
  const ArrowRight = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 30" width="30" height="30" aria-hidden="true">
      <path fill="#fff" d="M13.74,1.68l-2.68,2.67,8.82,8.76H2.86v3.77h17.02l-8.82,8.76,2.69,2.67,13.4-13.32L13.74,1.68Z"/>
    </svg>
  );

  const styles = `
    .a01hero {
      position: relative;
      width: 100%;
      height: 100vh;
      min-height: 560px;
      overflow: hidden;
      background: #000;
    }
    /* Fade stacking — all slides absolute, only active has opacity 1 */
    .a01hero-slide {
      position: absolute;
      inset: 0;
      opacity: 0;
      transition: opacity 500ms linear;
      z-index: 1;
    }
    .a01hero-slide.a01-active {
      opacity: 1;
      z-index: 2;
    }
    .a01hero-media {
      width: 100%;
      height: 100%;
      object-fit: cover;
      object-position: 50% 50%;
      display: block;
    }
    /* Exact gradient from karesarch: dark top (0.458) → transparent 47% → dark bottom (0.655) */
    .a01hero-grad {
      position: absolute;
      inset: 0;
      z-index: 3;
      background: linear-gradient(180deg,
        rgba(0,0,0,0.458) 0%,
        rgba(0,0,0,0) 47%,
        rgba(0,0,0,0.655) 100%
      );
      pointer-events: none;
    }
    /* Content: position from karesarch — bottom 15-20%, centered around left 52% */
    .a01hero-content {
      position: absolute;
      z-index: 4;
      bottom: 18%;
      left: 52%;
      transform: translateX(-50%);
      width: min(860px, 90vw);
    }
    @media (max-width: 991px) {
      .a01hero-content { bottom: 15%; left: 50%; }
    }
    @media (max-width: 575px) {
      .a01hero-content { bottom: 12%; left: 50%; }
    }
    /* Title: 60px desktop, 500 weight — from karesarch CSS */
    .a01hero-title {
      font-family: ${FONT};
      font-size: clamp(28px, 4.5vw, 60px);
      font-weight: 500;
      color: #fff;
      margin: 0 0 24px;
      line-height: 1.1;
    }
    /* CTA buttons — bordered outline style */
    .a01hero-btns {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
    }
    .a01hero-btn {
      display: inline-block;
      padding: 10px 28px;
      border: 1px solid rgba(255,255,255,0.75);
      color: #fff;
      font-family: ${FONT};
      font-size: 13px;
      font-weight: 400;
      letter-spacing: 0.04em;
      text-decoration: none;
      background: transparent;
      transition: background 0.2s, border-color 0.2s;
      white-space: nowrap;
    }
    .a01hero-btn:hover { background: rgba(255,255,255,0.15); border-color: #fff; }
    /* Arrows — 1:1 karesarch: position absolute, 3rem from edge, height 4rem, width 3rem */
    .a01hero-arrow {
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      z-index: 5;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 48px;
      height: 64px;
      background: transparent;
      border: none;
      cursor: pointer;
      transition: transform 0.3s ease-in-out;
      padding: 0;
    }
    .a01hero-arrow-prev { left: 48px; }
    .a01hero-arrow-next { right: 48px; }
    .a01hero-arrow-prev:hover { transform: translateY(-50%) translateX(-4px); }
    .a01hero-arrow-next:hover { transform: translateY(-50%) translateX(4px); }
    @media (max-width: 1600px) {
      .a01hero-arrow-prev { left: 24px; }
      .a01hero-arrow-next { right: 24px; }
    }
    @media (max-width: 575px) {
      .a01hero-arrow { display: none; }
    }
  `;

  const currentSlide = slides[idx];

  return (
    <>
      <style>{styles}</style>
      <section className="a01hero" data-template="arch-01-hero" aria-label="Hero slider">

        {slides.map((slide, i) => (
          <div key={i} className={`a01hero-slide${i === idx ? " a01-active" : ""}`} aria-hidden={i !== idx}>
            {slide.videoUrl ? (
              <video
                ref={el => { videoRefs.current[i] = el; }}
                className="a01hero-media"
                src={slide.videoUrl}
                autoPlay={i === idx}
                muted
                loop
                playsInline
                preload="auto"
              />
            ) : (
              <GenericEditableImage
                sectionId={sectionId}
                field={`slides.${i}.imageUrl`}
                src={slide.imageUrl ?? ""}
                alt={slide.alt ?? slide.title ?? `Slide ${i + 1}`}
                style={{ width: "100%", height: "100%", display: "block" }}
              >
                <img
                  src={slide.imageUrl}
                  alt={slide.alt ?? slide.title ?? `Slide ${i + 1}`}
                  className="a01hero-media"
                />
              </GenericEditableImage>
            )}
          </div>
        ))}

        <div className="a01hero-grad" aria-hidden="true" />

        <div className="a01hero-content">
          {currentSlide?.title && (
            <h1 className="a01hero-title">
              <GenericEditableText sectionId={sectionId} field={`slides.${idx}.title`} value={currentSlide.title} tag="span" />
            </h1>
          )}
          <div className="a01hero-btns">
            <a href={currentSlide?.ctaDetailHref ? resolveDemoHref(currentSlide.ctaDetailHref, tenantSlug, isAdmin) : resolvedCta} className="a01hero-btn">
              <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
            </a>
            <a href={resolvedCta2} className="a01hero-btn">
              <GenericEditableText sectionId={sectionId} field="ctaText2" value={ctaText2} tag="span" />
            </a>
          </div>
        </div>

        {count > 1 && (
          <>
            <button className="a01hero-arrow a01hero-arrow-prev" onClick={() => go(idx - 1)} aria-label="Předchozí slide">
              <ArrowLeft />
            </button>
            <button className="a01hero-arrow a01hero-arrow-next" onClick={() => go(idx + 1)} aria-label="Další slide">
              <ArrowRight />
            </button>
          </>
        )}
      </section>
    </>
  );
}

// ── ucetni-04-hero ────────────────────────────────────────────────────────────
// 1:1 bcas.cz (Broker Consulting):
// - bílý (#ffffff) bg, padding-top clamp(124px,10vw,160px)
// - outer grid: 1fr 1.1fr (text + mosaic)
// - mosaic: imgs1 (velký h1.webp aspect 396/340 + double row h4+h3) | imgs2 (h2+h5 stacked)
// - phImg1 aspect-ratio 396/340; phImg2-5 aspect-ratio 1:1; filter: saturate(80%)
// - mobile: 1-col stacked, foto schovaná
// ─────────────────────────────────────────────────────────────────────────────
function HeroUcetni04({ content, sectionId, tenantSlug, isAdmin }: {
  content: Record<string, unknown>;
  sectionId: number;
  tenantSlug?: string;
  isAdmin: boolean;
}) {
  const NAVY  = "#003366";
  const WHITE = "#ffffff";
  const FONT  = "'Plus Jakarta Sans', Arial, 'Helvetica Neue', sans-serif";

  const headline    = String(content.headline    ?? "S námi proměníte své plány v realitu");
  const headlineEm  = String(content.headlineEm  ?? "své plány v realitu");
  const subheadline = String(content.subheadline ?? "Dopřejte si i vy péči konzultantů z oboru financí a realit s nejvyšší spokojeností klientů na trhu.");
  const cta1Text    = String(content.ctaPrimaryText    ?? "Zjistěte více");
  const cta1Href    = String(content.ctaPrimaryHref    ?? "#kontakt");
  const cta2Text    = String(content.ctaSecondaryText  ?? "Naše služby");
  const cta2Href    = String(content.ctaSecondaryHref  ?? "#sluzby");
  // mosaic: left col = big(h1) + double(h4,h3) | right col = big(h2) + double(h5,h6)
  const img1 = String(content.img1Url ?? "/templates/ucetni-04/hero/h1.webp");
  const img2 = String(content.img2Url ?? "/templates/ucetni-04/hero/h4.webp");
  const img3 = String(content.img3Url ?? "/templates/ucetni-04/hero/h3.webp");
  const img4 = String(content.img4Url ?? "/templates/ucetni-04/hero/h2.webp");
  const img5 = String(content.img5Url ?? "/templates/ucetni-04/hero/h5.webp");
  const img6 = String(content.img6Url ?? "/templates/ucetni-04/hero/h6.webp");

  const resolve = (href: string) => resolveDemoHref(href, tenantSlug, isAdmin);

  const headlineBeforeEm = headlineEm && headline.includes(headlineEm)
    ? headline.slice(0, headline.indexOf(headlineEm))
    : headline;
  const headlineAfterEm = headlineEm && headline.includes(headlineEm)
    ? headline.slice(headline.indexOf(headlineEm) + headlineEm.length)
    : "";

  const styles = `
    .ucn04hero {
      background: ${WHITE};
      font-family: ${FONT};
      overflow: hidden;
    }
    .ucn04hero-inner {
      max-width: 1296px;
      margin: 0 auto;
      padding: clamp(124px,10vw,160px) 24px clamp(56px,10vw,120px);
      display: grid;
      grid-template-columns: 1fr 1.1fr;
      gap: 16px 48px;
      align-items: start;
    }
    /* ── Text column ── */
    .ucn04hero-cont {
      display: flex;
      flex-direction: column;
      justify-self: end;
      width: 100%;
      max-width: 36em;
    }
    .ucn04hero-h1 {
      font-size: clamp(26px, 3.2vw, 52px);
      font-weight: 400;
      color: #1a1a1a;
      line-height: 1.15;
      letter-spacing: -0.02em;
      margin: 0 0 20px;
    }
    .ucn04hero-h1 strong {
      font-weight: 700;
      color: ${NAVY};
    }
    .ucn04hero-sub {
      font-size: 16px;
      color: #555555;
      line-height: 1.65;
      margin: 0 0 32px;
    }
    .ucn04hero-btns {
      display: flex;
      gap: 14px;
      flex-wrap: wrap;
    }
    .ucn04hero-btn-primary {
      display: inline-flex;
      align-items: center;
      padding: 14px 30px;
      background: ${NAVY};
      color: ${WHITE};
      font-size: 15px;
      font-weight: 600;
      font-family: ${FONT};
      border-radius: 4px;
      text-decoration: none;
      transition: background 0.15s;
    }
    .ucn04hero-btn-primary:hover { background: #002244; }
    .ucn04hero-btn-outline {
      display: inline-flex;
      align-items: center;
      padding: 14px 30px;
      background: transparent;
      color: ${NAVY};
      font-size: 15px;
      font-weight: 600;
      font-family: ${FONT};
      border: 2px solid ${NAVY};
      border-radius: 4px;
      text-decoration: none;
      transition: background 0.15s, color 0.15s;
    }
    .ucn04hero-btn-outline:hover { background: ${NAVY}; color: ${WHITE}; }
    /* ── Mosaic: flat 4-col × 2-row grid — dokonalé zarovnání ── */
    .ucn04hero-imgs {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      grid-template-rows: auto auto;
      gap: clamp(8px,1.2vw,14px);
      width: 100%;
      margin-top: -clamp(124px,10vw,160px);
    }
    /* Velké obrázky: každý span 2 sloupce, řada 1 */
    .ucn04hero-ph1 { grid-column: 1 / 3; grid-row: 1; aspect-ratio: 396 / 340; width: 100%; overflow: hidden; border-radius: 8px; position: relative; }
    .ucn04hero-ph4 { grid-column: 3 / 5; grid-row: 1; aspect-ratio: 396 / 340; width: 100%; overflow: hidden; border-radius: 8px; position: relative; }
    /* Malé obrázky: každý 1 sloupec, řada 2 */
    .ucn04hero-ph2 { grid-column: 1; grid-row: 2; aspect-ratio: 1; overflow: hidden; border-radius: 8px; position: relative; }
    .ucn04hero-ph3 { grid-column: 2; grid-row: 2; aspect-ratio: 1; overflow: hidden; border-radius: 8px; position: relative; }
    .ucn04hero-ph5 { grid-column: 3; grid-row: 2; aspect-ratio: 1; overflow: hidden; border-radius: 8px; position: relative; }
    .ucn04hero-ph6 { grid-column: 4; grid-row: 2; aspect-ratio: 1; overflow: hidden; border-radius: 8px; position: relative; }
    @media (max-width: 900px) {
      .ucn04hero-inner {
        grid-template-columns: 1fr;
        padding-top: 100px;
        padding-bottom: 48px;
        gap: 40px;
      }
      .ucn04hero-cont { justify-self: start; max-width: 100%; }
      .ucn04hero-imgs { display: none; }
    }
  `;

  const Img = ({ cls, src, field }: { cls: string; src: string; field: string }) => (
    <GenericEditableImage
      sectionId={sectionId}
      field={field}
      src={src}
      alt=""
      className={cls}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt=""
        style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", filter: "saturate(80%)" }}
      />
    </GenericEditableImage>
  );

  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700&display=swap" />
      <style>{styles}</style>
      <section className="ucn04hero" data-template="ucetni-04-hero">
        <div className="ucn04hero-inner">
          {/* Text column */}
          <div className="ucn04hero-cont">
            <h1 className="ucn04hero-h1">
              {headlineBeforeEm && <span>{headlineBeforeEm}</span>}
              {headlineEm && (
                <strong>
                  <GenericEditableText sectionId={sectionId} field="headlineEm" value={headlineEm} tag="span" />
                </strong>
              )}
              {headlineAfterEm && <span>{headlineAfterEm}</span>}
            </h1>
            <p className="ucn04hero-sub">
              <GenericEditableText sectionId={sectionId} field="subheadline" value={subheadline} tag="span" />
            </p>
            <div className="ucn04hero-btns">
              <a href={resolve(cta1Href)} className="ucn04hero-btn-primary">
                <GenericEditableText sectionId={sectionId} field="ctaPrimaryText" value={cta1Text} tag="span" />
              </a>
              <a href={resolve(cta2Href)} className="ucn04hero-btn-outline">
                <GenericEditableText sectionId={sectionId} field="ctaSecondaryText" value={cta2Text} tag="span" />
              </a>
            </div>
          </div>

          {/* Photo mosaic */}
          {/* Flat 4-col grid: ph1+ph4 = řada 1 (span 2), ph2+ph3+ph5+ph6 = řada 2 */}
          <div className="ucn04hero-imgs">
            <Img cls="ucn04hero-ph1" src={img1} field="img1Url" />
            <Img cls="ucn04hero-ph4" src={img4} field="img4Url" />
            <Img cls="ucn04hero-ph2" src={img2} field="img2Url" />
            <Img cls="ucn04hero-ph3" src={img3} field="img3Url" />
            <Img cls="ucn04hero-ph5" src={img5} field="img5Url" />
            <Img cls="ucn04hero-ph6" src={img6} field="img6Url" />
          </div>
        </div>
      </section>
    </>
  );
}

// ── solar-01-hero ─────────────────────────────────────────────────────────────
// solar-01 — Awwwards-level B2B solar hero.
// Dark navy w/ ambient orange glows + grid overlay + optional bg pan.
// Left: pill eyebrow + H1 (italic gold accent), subtitle, dual CTAs
//   (gradient shimmer + ghost with play glyph), trust checks + Google rating.
// Right: main solar photo (5:4 zoom-pan), floating savings card,
//   dark NZÚ badge, stat mini-bar (kW / years / days).
// Sequenced fade-in reveal (0.1 → 0.8s), scroll indicator.
// ─────────────────────────────────────────────────────────────────────────────
function HeroSolar01({ content, sectionId, tenantSlug, isAdmin }: {
  content: Record<string, unknown>;
  sectionId: number;
  tenantSlug?: string;
  isAdmin: boolean;
}) {
  const siteMode        = String(content.siteMode ?? "multipage");
  const eyebrow         = String(content.eyebrow ?? "Fotovoltaika & tepelná čerpadla");
  const titleLine1      = String(content.titleLine1 ?? "Solární energie");
  const titleAccent     = String(content.titleAccent ?? "pro váš dům");
  const titleLine2      = String(content.titleLine2 ?? "i firmu.");
  const subtitle        = String(content.subtitle ?? "Navrhujeme a instalujeme fotovoltaické systémy na míru. Kompletní realizace od projektu po uvedení do provozu — včetně vyřízení dotace NZÚ.");
  const ctaText         = String(content.ctaText  ?? "Spočítat úsporu");
  const ctaHref         = String(content.ctaHref  ?? "/kontakt");
  const ctaSecText      = String(content.ctaSecondaryText ?? "Podívat se na realizace");
  const ctaSecHref      = String(content.ctaSecondaryHref ?? "/sluzby");
  const heroImg         = String(content.heroImage ?? content.backgroundImage ?? "/assets/solar-01/hero-panels.webp");
  const heroImgAlt      = String(content.heroImageAlt ?? "Fotovoltaická elektrárna na střeše rodinného domu");
  // Bg image only if explicitly set via backgroundImage — otherwise clean navy.
  const bgImg           = content.backgroundImage ? String(content.backgroundImage) : "";
  const trust1          = String(content.trust1 ?? "30 let záruka výkonu");
  const trust2          = String(content.trust2 ?? "Instalace za 12 dní");
  const trust3          = String(content.trust3 ?? "NZÚ dotace zdarma");
  const starsRating     = String(content.starsRating ?? "4.8");
  const starsText       = String(content.starsText  ?? "3 800+ recenzí · Google");
  const cardValue       = String(content.cardValue ?? "18 400 Kč");
  const cardLabel       = String(content.cardLabel ?? "roční úspora / průměr");
  const badgeEyebrow    = String(content.badgeEyebrow ?? "NZÚ dotace");
  const badgeValue      = String(content.badgeValue ?? "až 200 000 Kč");
  const stat1Val        = String(content.stat1Val ?? "3 800+");
  const stat1Lbl        = String(content.stat1Lbl ?? "instalací");
  const stat2Val        = String(content.stat2Val ?? "30 let");
  const stat2Lbl        = String(content.stat2Lbl ?? "životnost");
  const stat3Val        = String(content.stat3Val ?? "12 dní");
  const stat3Lbl        = String(content.stat3Lbl ?? "montáž");
  const scrollLabel     = String(content.scrollLabel ?? "Prozkoumat");

  const resolve = (href: string) => resolveNavHref(href, siteMode, tenantSlug, isAdmin);

  const IconCheck = () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  );
  const IconArrow = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
    </svg>
  );
  const IconPlay = () => (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <polygon points="6 4 20 12 6 20"/>
    </svg>
  );
  const IconPiggy = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M19 5.5a4.5 4.5 0 0 0-3.5 1.7L12 12 8.5 7.2A4.5 4.5 0 0 0 5 5.5"/>
      <path d="M12 12v6"/>
      <path d="M8 21h8"/>
    </svg>
  );

  return (
    <section className="s01hero" data-template="solar-01">
      {bgImg ? (
        <>
          <div className="s01hero-bg" style={{ backgroundImage: `url(${bgImg})` }} aria-hidden="true" />
          <div className="s01hero-veil" aria-hidden="true" />
        </>
      ) : null}
      <div className="s01hero-grid" aria-hidden="true" />

      <div className="s01hero-inner">
        {/* Left column */}
        <div className="s01hero-copy">
          <span className="s01hero-eyebrow">
            <span className="s01hero-eyebrow-dot" />
            <GenericEditableText sectionId={sectionId} field="eyebrow" value={eyebrow} tag="span" />
          </span>

          <h1 className="s01hero-title">
            <GenericEditableText sectionId={sectionId} field="titleLine1" value={titleLine1} tag="span" />
            {" "}
            <span className="s01hero-title-accent">
              <GenericEditableText sectionId={sectionId} field="titleAccent" value={titleAccent} tag="span" />
            </span>
            {" "}
            <GenericEditableText sectionId={sectionId} field="titleLine2" value={titleLine2} tag="span" />
          </h1>

          <p className="s01hero-sub">
            <GenericEditableText sectionId={sectionId} field="subtitle" value={subtitle} tag="span" />
          </p>

          <div className="s01hero-btns">
            <a href={resolve(ctaHref)} data-btn="primary" className="s01hero-btn s01hero-btn-primary">
              <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
              <span className="s01hero-btn-arrow"><IconArrow /></span>
            </a>
            <a href={resolve(ctaSecHref)} className="s01hero-btn s01hero-btn-ghost">
              <span className="s01hero-btn-ghost-play"><IconPlay /></span>
              <GenericEditableText sectionId={sectionId} field="ctaSecondaryText" value={ctaSecText} tag="span" />
            </a>
          </div>

          <div className="s01hero-trust">
            {([
              ["trust1", trust1],
              ["trust2", trust2],
              ["trust3", trust3],
            ] as [string, string][]).map(([field, val]) => (
              <div className="s01hero-trust-item" key={field}>
                <span className="s01hero-trust-check"><IconCheck /></span>
                <GenericEditableText sectionId={sectionId} field={field} value={val} tag="span" />
              </div>
            ))}
            <div className="s01hero-trust-stars">
              <span className="s01hero-trust-stars-num">
                ★{" "}
                <GenericEditableText sectionId={sectionId} field="starsRating" value={starsRating} tag="span" />
              </span>
              <GenericEditableText sectionId={sectionId} field="starsText" value={starsText} tag="span" />
            </div>
          </div>
        </div>

        {/* Right column — visual showcase */}
        <div className="s01hero-visual">
          <div className="s01hero-main-img">
            <GenericEditableImage sectionId={sectionId} field="heroImage" src={heroImg}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={heroImg} alt={heroImgAlt} loading="eager" />
            </GenericEditableImage>
          </div>

          <div className="s01hero-card">
            <span className="s01hero-card-icon"><IconPiggy /></span>
            <span className="s01hero-card-text">
              <span className="s01hero-card-val">
                <GenericEditableText sectionId={sectionId} field="cardValue" value={cardValue} tag="span" />
              </span>
              <span className="s01hero-card-lbl">
                <GenericEditableText sectionId={sectionId} field="cardLabel" value={cardLabel} tag="span" />
              </span>
            </span>
          </div>

          <div className="s01hero-badge">
            <span className="s01hero-badge-eyebrow">
              <GenericEditableText sectionId={sectionId} field="badgeEyebrow" value={badgeEyebrow} tag="span" />
            </span>
            <span className="s01hero-badge-val">
              <GenericEditableText sectionId={sectionId} field="badgeValue" value={badgeValue} tag="span" />
            </span>
          </div>

          <div className="s01hero-stats" role="group" aria-label="Klíčové statistiky">
            <div className="s01hero-stat">
              <div className="s01hero-stat-val">
                <GenericEditableText sectionId={sectionId} field="stat1Val" value={stat1Val} tag="span" />
              </div>
              <div className="s01hero-stat-lbl">
                <GenericEditableText sectionId={sectionId} field="stat1Lbl" value={stat1Lbl} tag="span" />
              </div>
            </div>
            <div className="s01hero-stat">
              <div className="s01hero-stat-val">
                <GenericEditableText sectionId={sectionId} field="stat2Val" value={stat2Val} tag="span" />
              </div>
              <div className="s01hero-stat-lbl">
                <GenericEditableText sectionId={sectionId} field="stat2Lbl" value={stat2Lbl} tag="span" />
              </div>
            </div>
            <div className="s01hero-stat">
              <div className="s01hero-stat-val">
                <GenericEditableText sectionId={sectionId} field="stat3Val" value={stat3Val} tag="span" />
              </div>
              <div className="s01hero-stat-lbl">
                <GenericEditableText sectionId={sectionId} field="stat3Lbl" value={stat3Lbl} tag="span" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="s01hero-scroll" aria-hidden="true">
        <GenericEditableText sectionId={sectionId} field="scrollLabel" value={scrollLabel} tag="span" />
        <span className="s01hero-scroll-line" />
      </div>
    </section>
  );
}

// ── solar-01-hero-page (slim banner for subpages) ─────────────────────────────
// solar-01 — Slim page banner ~340px height for subpages.
// Dark navy w/ ambient orange glows + grid overlay.
// Centered breadcrumb + optional eyebrow + H1 (italic gold accent support)
// + subtitle + decorative gold rule.
// Sequenced fade-in reveal (0.1 → 0.48s).
// ─────────────────────────────────────────────────────────────────────────────
function HeroSolar01Page({ content, sectionId, tenantSlug, isAdmin }: {
  content: Record<string, unknown>;
  sectionId: number;
  tenantSlug?: string;
  isAdmin: boolean;
}) {
  const siteMode        = String(content.siteMode ?? "multipage");
  const breadcrumb      = String(content.breadcrumb ?? "Domů");
  const breadcrumbHref  = String(content.breadcrumbHref ?? "/");
  const currentLabel    = String(content.currentLabel ?? "");
  const eyebrow         = String(content.eyebrow ?? "");
  const title           = String(content.title ?? "");
  const titleAccent     = String(content.titleAccent ?? "");
  const subtitle        = String(content.subtitle ?? "");
  const resolve = (href: string) => resolveNavHref(href, siteMode, tenantSlug, isAdmin);

  return (
    <section className="s01hpg" data-template="solar-01">
      <div className="s01hpg-grid" aria-hidden="true" />
      <div className="s01hpg-inner">
        {(breadcrumb.trim() || currentLabel.trim()) && (
          <div className="s01hpg-crumb" aria-label="Drobečková navigace">
            {breadcrumb.trim() && (
              <a href={resolve(breadcrumbHref)}>
                <GenericEditableText sectionId={sectionId} field="breadcrumb" value={breadcrumb} tag="span" />
              </a>
            )}
            <span className="s01hpg-crumb-sep" aria-hidden="true">/</span>
            <span className="s01hpg-crumb-cur">
              <GenericEditableText sectionId={sectionId} field="currentLabel" value={currentLabel || title} tag="span" />
            </span>
          </div>
        )}

        {eyebrow.trim() && (
          <span className="s01hpg-eyebrow">
            <span className="s01hpg-eyebrow-dot" />
            <GenericEditableText sectionId={sectionId} field="eyebrow" value={eyebrow} tag="span" />
          </span>
        )}

        {title.trim() && (
          <h1 className="s01hpg-title">
            <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
            {titleAccent.trim() && (
              <>
                {" "}
                <span className="s01hpg-title-em">
                  <GenericEditableText sectionId={sectionId} field="titleAccent" value={titleAccent} tag="span" />
                </span>
              </>
            )}
          </h1>
        )}

        {subtitle.trim() && (
          <p className="s01hpg-sub">
            <GenericEditableText sectionId={sectionId} field="subtitle" value={subtitle} tag="span" />
          </p>
        )}

        <div className="s01hpg-rule" aria-hidden="true">
          <span className="s01hpg-rule-line" />
          <span className="s01hpg-rule-dot" />
          <span className="s01hpg-rule-line" />
        </div>
      </div>
    </section>
  );
}

// ── instala-02-hero ────────────────────────────────────────────────────────────
// 1:1 vestop.cz:
// - 100vh fullbleed BG foto + tmavý left gradient overlay (0.80→0.20)
// - kicker: malý červený uppercase řádek + červená linka vlevo
// - H1: Montserrat 700, bílý, clamp(38px→72px)
// - subtitle: bílá, 20px, max-w 560px
// - CTA1: červený filled | CTA2: outline white
// - stats badge dole vlevo: červené číslo + bílý label
// ─────────────────────────────────────────────────────────────────────────────
function HeroInstala02({ content, sectionId, tenantSlug, isAdmin }: Omit<Props, "variant">) {
  const c = content as Record<string, unknown>;

  const RED   = "#ee4036";
  const WHITE = "#ffffff";
  const FONT  = "'Montserrat', sans-serif";

  const label      = String(c.label       ?? "Praha a okolí • Zásah do 60 minut");
  const title      = String(c.title       ?? "Topenářství\na instalatérství\nnaplno");
  const subtitle   = String(c.subtitle    ?? "Komplexní servis vytápění a instalatérské práce. 20 let zkušeností, záruky 24 měsíců.");
  const ctaText    = String(c.ctaText     ?? "Kontakt a poptávka");
  const ctaHref    = String(c.ctaHref     ?? "/kontakt");
  const ctaSecText = String(c.ctaSecondaryText ?? "Nabídka služeb");
  const ctaSecHref = String(c.ctaSecondaryHref ?? "/sluzby");
  const statsValue = String(c.statsValue  ?? "20+");
  const statsLabel = String(c.statsLabel  ?? "let na trhu");
  const bgImage    = String(c.backgroundImage ?? "/clones/vestop/wp-content/uploads/2026/01/Vestop-topenarstvi-a-instalaterstvi.png");

  function resolveHref(href: string) {
    if (!href || href.startsWith("http") || href.startsWith("#")) return href;
    if (tenantSlug) {
      const base = isAdmin ? `/demo/${tenantSlug}/admin` : `/demo/${tenantSlug}`;
      return base + (href.startsWith("/") ? href : "/" + href);
    }
    return href;
  }

  return (
    <section
      id="uvod"
      style={{ position: "relative", minHeight: "100vh", fontFamily: FONT, display: "flex", flexDirection: "column", justifyContent: "center" }}
      data-template="instala-02-hero"
    >
      {/* BG image + left-heavy dark gradient */}
      <div style={{ position: "absolute", inset: 0, zIndex: 0 }}>
        <GenericEditableImage sectionId={sectionId} field="backgroundImage" src={bgImage} alt="Hero" className="relative overflow-hidden w-full h-full" style={{ height: "100%" }}>
          <Image src={bgImage} alt="Topenářství a instalatérství" fill className="object-cover" sizes="100vw" unoptimized={shouldSkipNextImageOptimization(bgImage)} priority />
        </GenericEditableImage>
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg, rgba(0,0,0,0.80) 0%, rgba(0,0,0,0.70) 40%, rgba(0,0,0,0.35) 75%, rgba(0,0,0,0.20) 100%)" }} aria-hidden />
      </div>

      {/* Content */}
      <div className="i02-hero-content" style={{ position: "relative", zIndex: 1, maxWidth: 1280, width: "100%", margin: "0 auto", padding: "100px 40px 80px" }}>

        {/* Kicker */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
          <span style={{ display: "block", width: 32, height: 2, backgroundColor: RED, borderRadius: 2, flexShrink: 0 }} aria-hidden />
          <span style={{ color: RED, fontSize: "13px", fontWeight: 600, letterSpacing: "0.18em", textTransform: "uppercase" }}>
            <GenericEditableText sectionId={sectionId} field="label" value={label} tag="span" />
          </span>
        </div>

        {/* H1 */}
        <h1 style={{ color: WHITE, fontFamily: FONT, fontSize: "clamp(38px, 5.5vw, 72px)", fontWeight: 700, lineHeight: 1.08, letterSpacing: "-0.01em", margin: "0 0 24px", maxWidth: 700, whiteSpace: "pre-line" }}>
          <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
        </h1>

        {/* Subtitle */}
        <p style={{ color: "rgba(255,255,255,0.88)", fontSize: "clamp(16px,2vw,20px)", fontWeight: 400, lineHeight: 1.6, margin: "0 0 40px", maxWidth: 560 }}>
          <GenericEditableText sectionId={sectionId} field="subtitle" value={subtitle} tag="span" />
        </p>

        {/* CTAs */}
        <div style={{ display: "flex", gap: 14, flexWrap: "wrap", alignItems: "center" }}>
          <a
            href={resolveHref(ctaHref)}
            data-btn="primary"
            style={{ display: "inline-flex", alignItems: "center", backgroundColor: RED, color: WHITE, fontFamily: FONT, fontSize: "15px", fontWeight: 600, padding: "14px 32px", borderRadius: 4, textDecoration: "none", letterSpacing: "0.2px", whiteSpace: "nowrap", transition: "background-color 0.18s, transform 0.18s" }}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = "#c42d2d"; e.currentTarget.style.transform = "translateY(-2px)"; }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = RED; e.currentTarget.style.transform = "translateY(0)"; }}
          >
            <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
          </a>
          <a
            href={resolveHref(ctaSecHref)}
            style={{ display: "inline-flex", alignItems: "center", backgroundColor: "transparent", color: WHITE, border: "2px solid rgba(255,255,255,0.70)", fontFamily: FONT, fontSize: "15px", fontWeight: 600, padding: "12px 28px", borderRadius: 4, textDecoration: "none", whiteSpace: "nowrap", transition: "border-color 0.2s, background-color 0.2s" }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = WHITE; e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.10)"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.70)"; e.currentTarget.style.backgroundColor = "transparent"; }}
          >
            <GenericEditableText sectionId={sectionId} field="ctaSecondaryText" value={ctaSecText} tag="span" />
          </a>
        </div>

        {/* Stats badge */}
        <div style={{ marginTop: 56, display: "inline-flex", alignItems: "center", gap: 12, backgroundColor: "rgba(0,0,0,0.40)", backdropFilter: "blur(4px)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 6, padding: "12px 20px" }}>
          <span style={{ color: RED, fontSize: "clamp(22px,3vw,32px)", fontWeight: 800, lineHeight: 1 }}>
            <GenericEditableText sectionId={sectionId} field="statsValue" value={statsValue} tag="span" />
          </span>
          <span style={{ color: "rgba(255,255,255,0.80)", fontSize: "14px", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.08em" }}>
            <GenericEditableText sectionId={sectionId} field="statsLabel" value={statsLabel} tag="span" />
          </span>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .i02-hero-content { padding: 90px 24px 60px !important; }
        }
        @media (max-width: 480px) {
          .i02-hero-content { padding: 80px 20px 48px !important; }
        }
      `}</style>
    </section>
  );
}

// ── klima-01-hero ─────────────────────────────────────────────────────────────
// 1:1 pragoclima.cz hero: horizontální slider s translateX
// - 3 slidy, horizontální přechod 700ms cubic-bezier, auto-play 6s
// - Dvouvrstvý gradient: top protection (navbar) + navy dole
// - Šipky vlevo/vpravo, tečky dole, text vlevo
// ─────────────────────────────────────────────────────────────────────────────
function HeroKlima01({ content, sectionId, tenantSlug, isAdmin }: Omit<Props, "variant">) {
  const c = content as Record<string, unknown>;
  const [current, setCurrent] = useState(0);
  const [transitioning, setTransitioning] = useState(false);

  const RED  = "#e30016";
  const FONT = "'Outfit', -apple-system, sans-serif";

  const defaultSlides = [
    {
      backgroundImage: "/clones/pragoclima/cdn/660bbe9341456f4ce30c9e29/66e32818d6ddddd24e43bbd5_bg_hero_2.jpg",
      title: "O správné klima se pro vás\nstaráme už od roku 1990",
      subtitle: "Postaráme se o vás v celém procesu návrhu i montáže. Díky našim službám i postavení na trhu garantujeme dodání na klíč včetně záruky.",
      ctaText: "Naše služby",
      ctaHref: "/sluzby",
    },
    {
      backgroundImage: "/clones/pragoclima/cdn/660bbe9341456f4ce30c9e29/664c97eae9de77d93cd34efb_bg_carousel2.jpg",
      title: "Profesionální montáž\nklimatizací a tepelných čerpadel",
      subtitle: "Zajišťujeme komplexní řešení od návrhu po montáž pro bytové i komerční objekty. Záruční i pozáruční servis.",
      ctaText: "Kontaktujte nás",
      ctaHref: "/kontakt",
    },
    {
      backgroundImage: "/clones/pragoclima/cdn/660bbe9341456f4ce30c9e29/664cd12f7049cec2d60c71a6_bg_redbox.jpg",
      title: "Více jak 3 000 realizací\ntepelných čerpadel a klimatizací",
      subtitle: "Stabilní partner na trhu od roku 1990 s vlastním týmem odborníků. Kompletní servis na klíč.",
      ctaText: "Naše reference",
      ctaHref: "/reference",
    },
  ];

  type Slide = { backgroundImage: string; title: string; subtitle: string; ctaText: string; ctaHref: string };
  const slides: Slide[] = Array.isArray(c.slides) && (c.slides as unknown[]).length > 0
    ? (c.slides as Slide[])
    : defaultSlides;
  const count = slides.length;

  const goTo = (idx: number) => {
    if (transitioning) return;
    setTransitioning(true);
    setCurrent((idx + count) % count);
    setTimeout(() => setTransitioning(false), 700);
  };

  useEffect(() => {
    if (count < 2) return;
    const id = setInterval(() => goTo(current + 1), 6000);
    return () => clearInterval(id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current, count]);

  function resolve(href: string) {
    if (!tenantSlug) return href;
    const base = `/demo/${tenantSlug}${isAdmin ? "/admin" : ""}`;
    if (href === "/" || href === "") return base;
    if (href.startsWith("http") || href.startsWith("#")) return href;
    return `${base}${href.startsWith("/") ? href : "/" + href}`;
  }

  /* Gradient: tmavé nahoře (ochrana navbar) + navy dole */
  const GRADIENT = "linear-gradient(180deg, rgba(0,0,0,0.42) 0%, rgba(0,0,0,0) 28%, rgba(0,0,0,0) 38%, rgba(24,37,69,0.80) 68%, #182545 100%)";

  return (
    <>
    <style>{`
      @media (max-width: 768px) {
        .klima-hero-section { height: 520px !important; }
        .klima-hero-text { padding: 0 20px 60px !important; }
        .klima-hero-arrow { width: 36px !important; height: 36px !important; font-size: 20px !important; }
        .klima-hero-arrow-prev { left: 10px !important; }
        .klima-hero-arrow-next { right: 10px !important; }
      }
      @media (max-width: 480px) {
        .klima-hero-section { height: 420px !important; }
      }
    `}</style>
    <section className="klima-hero-section" style={{ position: "relative", height: 780, overflow: "hidden", fontFamily: FONT }}>

      {/* Horizontal slide track — width = count × 100% section */}
      <div
        style={{
          display: "flex",
          width: `${count * 100}%`,
          height: "100%",
          transform: `translateX(-${current * (100 / count)}%)`,
          transition: "transform 0.70s cubic-bezier(0.45, 0.05, 0.55, 0.95)",
          willChange: "transform",
        }}
      >
        {slides.map((slide, i) => (
          <div
            key={i}
            style={{ position: "relative", width: `${100 / count}%`, flexShrink: 0, height: "100%" }}
          >
            <Image
              src={slide.backgroundImage}
              alt=""
              fill
              priority={i === 0}
              sizes="100vw"
              className="object-cover"
              unoptimized={shouldSkipNextImageOptimization(slide.backgroundImage)}
            />
            {/* Gradient overlay */}
            <div aria-hidden style={{ position: "absolute", inset: 0, background: GRADIENT }} />

            {/* Slide text */}
            <div className="klima-hero-text" style={{ position: "absolute", bottom: 0, left: 0, width: "100%", padding: "0 48px 90px" }}>
              <div style={{ maxWidth: 1280, margin: "0 auto" }}>
                <div style={{ maxWidth: 700 }}>
                  <h1 style={{ fontWeight: 700, fontSize: "clamp(1.9rem, 3.6vw, 2.9rem)", lineHeight: 1.22, color: "#fff", margin: "0 0 22px", whiteSpace: "pre-line" }}>
                    <GenericEditableText sectionId={sectionId} field={`slides.${i}.title`} value={slide.title} tag="span" />
                  </h1>
                  <p style={{ fontSize: "clamp(1rem, 1.35vw, 1.1rem)", lineHeight: 1.7, color: "rgba(255,255,255,0.88)", margin: "0 0 32px", maxWidth: 560 }}>
                    <GenericEditableText sectionId={sectionId} field={`slides.${i}.subtitle`} value={slide.subtitle} tag="span" />
                  </p>
                  <a
                    href={resolve(slide.ctaHref)}
                    data-btn="primary"
                    style={{ display: "inline-block", backgroundColor: RED, color: "#fff", textDecoration: "none", fontWeight: 600, fontSize: 15, padding: "13px 32px", borderRadius: 5, transition: "background-color 0.2s" }}
                    onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#b50012")}
                    onMouseLeave={e => (e.currentTarget.style.backgroundColor = RED)}
                  >
                    <GenericEditableText sectionId={sectionId} field={`slides.${i}.ctaText`} value={slide.ctaText} tag="span" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Arrow prev */}
      <button
        className="klima-hero-arrow klima-hero-arrow-prev"
        onClick={() => goTo(current - 1)}
        aria-label="Předchozí"
        style={{
          position: "absolute", left: 20, top: "50%", transform: "translateY(-50%)",
          zIndex: 10,
          width: 48, height: 48, borderRadius: "50%",
          background: "rgba(0,0,0,0.30)",
          border: "2px solid rgba(255,255,255,0.50)",
          color: "#fff", fontSize: 26, lineHeight: 1,
          cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
          transition: "background 0.2s",
        }}
        onMouseEnter={e => (e.currentTarget.style.background = "rgba(227,0,22,0.85)")}
        onMouseLeave={e => (e.currentTarget.style.background = "rgba(0,0,0,0.30)")}
      >
        ‹
      </button>

      {/* Arrow next */}
      <button
        className="klima-hero-arrow klima-hero-arrow-next"
        onClick={() => goTo(current + 1)}
        aria-label="Další"
        style={{
          position: "absolute", right: 20, top: "50%", transform: "translateY(-50%)",
          zIndex: 10,
          width: 48, height: 48, borderRadius: "50%",
          background: "rgba(0,0,0,0.30)",
          border: "2px solid rgba(255,255,255,0.50)",
          color: "#fff", fontSize: 26, lineHeight: 1,
          cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
          transition: "background 0.2s",
        }}
        onMouseEnter={e => (e.currentTarget.style.background = "rgba(227,0,22,0.85)")}
        onMouseLeave={e => (e.currentTarget.style.background = "rgba(0,0,0,0.30)")}
      >
        ›
      </button>

      {/* Dots */}
      <div
        style={{
          position: "absolute", bottom: 28, left: "50%", transform: "translateX(-50%)",
          zIndex: 10, display: "flex", gap: 8, alignItems: "center",
        }}
      >
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            aria-label={`Snímek ${i + 1}`}
            style={{
              width: i === current ? 28 : 9, height: 9,
              borderRadius: 5, border: "2px solid rgba(255,255,255,0.7)",
              cursor: "pointer", padding: 0,
              backgroundColor: i === current ? RED : "transparent",
              transition: "all 0.3s ease",
            }}
          />
        ))}
      </div>
    </section>
    </>
  );
}

// ── clean-01-hero ─────────────────────────────────────────────────────────────
// 100vh foto hero (service-nav-bg.webp), tmavý overlay (~55% opacity),
// bílý uppercase H1 uprostřed, zelené CTA tlačítko, šipka dolů
// ─────────────────────────────────────────────────────────────────────────────
function HeroClean01({ content, sectionId, tenantSlug: _ts, isAdmin: _ia }: Omit<Props, "variant">) {
  const GREEN = "#69be28";
  const FONT  = "Arial, Helvetica, sans-serif";

  const title    = String(content.title    ?? "Partner pro čistotu");
  const subtitle = String(content.subtitle ?? "Jsme významným dodavatelem komplexních úklidových a dalších doplňkových služeb.");
  const ctaText  = String(content.ctaText  ?? "Zjistit více");
  const ctaHref  = String(content.ctaHref  ?? "#sluzby");
  const bgImage  = String(content.backgroundImage ?? "/clones/cleancat/img/service-nav-bg.webp");

  const styles = `
    .c01h-wrap {
      position: relative;
      width: 100%;
      min-height: 100svh;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      font-family: ${FONT};
    }
    .c01h-bg {
      position: absolute;
      inset: 0;
      background-size: cover;
      background-position: center;
      background-repeat: no-repeat;
    }
    .c01h-overlay {
      position: absolute;
      inset: 0;
      background: rgba(0,0,0,0.55);
    }
    .c01h-inner {
      position: relative;
      z-index: 2;
      text-align: center;
      padding: 2rem 1.5rem;
      max-width: 860px;
      width: 100%;
    }
    .c01h-title {
      font-size: clamp(2rem, 5vw, 3.6rem);
      font-weight: 700;
      color: #ffffff;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      line-height: 1.15;
      margin: 0 0 1.2rem;
    }
    .c01h-subtitle {
      font-size: clamp(0.95rem, 2vw, 1.15rem);
      color: rgba(255,255,255,0.85);
      line-height: 1.65;
      margin: 0 auto 2.4rem;
      max-width: 680px;
    }
    .c01h-cta {
      display: inline-block;
      background: ${GREEN};
      color: #ffffff;
      text-decoration: none;
      font-weight: 700;
      font-size: 1rem;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      padding: 0.9rem 2.6rem;
      border-radius: 4px;
      transition: background 0.18s;
    }
    .c01h-cta:hover { background: #5aa020; }
    .c01h-arrow {
      position: absolute;
      bottom: 2rem;
      left: 50%;
      transform: translateX(-50%);
      z-index: 2;
      animation: c01hBounce 1.6s infinite;
    }
    @keyframes c01hBounce {
      0%, 100% { transform: translateX(-50%) translateY(0); }
      50%       { transform: translateX(-50%) translateY(8px); }
    }
  `;

  return (
    <section id="uvod" className="c01h-wrap">
      <style>{styles}</style>
      <GenericEditableImage sectionId={sectionId} field="backgroundImage" src={bgImage} alt="Hero pozadí" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", zIndex: 0 }}>
        <div className="c01h-bg" style={{ backgroundImage: `url(${bgImage})` }} />
      </GenericEditableImage>
      <div className="c01h-overlay" />
      <div className="c01h-inner">
        <h1 className="c01h-title">
          <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
        </h1>
        <p className="c01h-subtitle">
          <GenericEditableText sectionId={sectionId} field="subtitle" value={subtitle} tag="span" />
        </p>
        <a href={ctaHref} data-btn="primary" className="c01h-cta">
          <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
        </a>
      </div>
      <div className="c01h-arrow">
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M6 9l6 6 6-6"/>
        </svg>
      </div>
    </section>
  );
}

// ── solar-02-hero ─────────────────────────────────────────────────────────────
// Ref: greensie.cz — fullscreen 800px video hero, content margin-top 200px
// Video: web-heroshot-2.webm autoplay loop muted
// H1: Barlow 700 48px line-height 60px white max-width 650px
// Subtitle: 18px fw700 white max-width 560px mb 60px
// CTA1: green #79c44f pill | CTA2: white bg/black text → white outline on hover
// ─────────────────────────────────────────────────────────────────────────────
function HeroSolar02({ content, sectionId, tenantSlug, isAdmin }: {
  content: Record<string, unknown>;
  sectionId: number;
  tenantSlug?: string;
  isAdmin: boolean;
}) {
  const siteMode   = String(content.siteMode   ?? "multipage");
  const eyebrow    = String(content.eyebrow    ?? "Fotovoltaika · Baterie BESS · Energetický management");
  const title      = String(content.title      ?? "Zelená energie, která se skutečně vyplatí.");
  const subtitle   = String(content.subtitle   ?? "Projektujeme, stavíme a provozujeme fotovoltaické systémy pro firmy, průmyslové areály i celé obce po celé ČR.");
  const ctaText    = String(content.ctaText    ?? "Spočítat úspory zdarma");
  const ctaHref    = String(content.ctaHref    ?? "/kontakt");
  const cta2Text   = String(content.cta2Text   ?? "Prohlédnout reference");
  const cta2Href   = String(content.cta2Href   ?? "/reference");
  const image      = String(content.image      ?? "/assets/solar-02/hero.webp");
  const stat1Value = String(content.stat1Value ?? "420+");
  const stat1Label = String(content.stat1Label ?? "realizací v ČR i SK");
  const stat2Value = String(content.stat2Value ?? "14 MWp");
  const stat2Label = String(content.stat2Label ?? "instalovaný výkon");
  const stat3Value = String(content.stat3Value ?? "6 let");
  const stat3Label = String(content.stat3Label ?? "průměrná návratnost");
  const trustText  = String(content.trustText  ?? "Dotace Modernizační fond · NRB · Nová zelená úsporám");

  const resolve = (href: string) => resolveNavHref(href, siteMode, tenantSlug, isAdmin);

  return (
    <section className="s02h" data-template="solar-02">
      {/* BG image (WebP) */}
      <div className="s02h-bg" aria-hidden="true">
        <GenericEditableImage sectionId={sectionId} field="image" src={image} alt="" style={{ position: "absolute", inset: 0 }}>
          <Image src={image} alt="" fill priority sizes="100vw" style={{ objectFit: "cover" }} unoptimized={shouldSkipNextImageOptimization(image)} />
        </GenericEditableImage>
      </div>

      {/* Layered overlays: dark gradient + green tint */}
      <div className="s02h-overlay" aria-hidden="true" />
      <div className="s02h-tint"    aria-hidden="true" />

      {/* Decorative PV panel grid — top-right corner */}
      <svg className="s02h-grid s02h-grid-tr" viewBox="0 0 240 160" aria-hidden="true" preserveAspectRatio="none">
        <g stroke="rgba(121,196,79,0.28)" strokeWidth="0.8" fill="none">
          {Array.from({length: 8}).map((_, i) => <line key={`v${i}`} x1={i*30} y1="0" x2={i*30} y2="160" />)}
          {Array.from({length: 6}).map((_, i) => <line key={`h${i}`} x1="0" y1={i*30} x2="240" y2={i*30} />)}
        </g>
      </svg>
      <svg className="s02h-grid s02h-grid-bl" viewBox="0 0 240 160" aria-hidden="true" preserveAspectRatio="none">
        <g stroke="rgba(121,196,79,0.20)" strokeWidth="0.8" fill="none">
          {Array.from({length: 8}).map((_, i) => <line key={`v${i}`} x1={i*30} y1="0" x2={i*30} y2="160" />)}
          {Array.from({length: 6}).map((_, i) => <line key={`h${i}`} x1="0" y1={i*30} x2="240" y2={i*30} />)}
        </g>
      </svg>

      {/* Content */}
      <div className="s02h-inner">
        <div className="s02h-eyebrow">
          <span className="s02h-eyebrow-dot" aria-hidden="true" />
          <GenericEditableText sectionId={sectionId} field="eyebrow" value={eyebrow} tag="span" />
        </div>

        <h1 className="s02h-h1">
          <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
        </h1>

        <p className="s02h-sub">
          <GenericEditableText sectionId={sectionId} field="subtitle" value={subtitle} tag="span" />
        </p>

        <div className="s02h-ctas">
          <a href={resolve(ctaHref)} data-btn="primary" className="s02h-cta s02h-cta-primary">
            <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
            <svg className="s02h-cta-arrow" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
            </svg>
          </a>
          <a href={resolve(cta2Href)} className="s02h-cta s02h-cta-ghost">
            <GenericEditableText sectionId={sectionId} field="cta2Text" value={cta2Text} tag="span" />
            <svg className="s02h-cta-arrow" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
            </svg>
          </a>
        </div>

        <div className="s02h-trust">
          <span className="s02h-trust-dot" aria-hidden="true" />
          <GenericEditableText sectionId={sectionId} field="trustText" value={trustText} tag="span" />
        </div>
      </div>

      {/* Bottom stats strip */}
      <div className="s02h-stats">
        <div className="s02h-stat">
          <span className="s02h-stat-value"><GenericEditableText sectionId={sectionId} field="stat1Value" value={stat1Value} tag="span" /></span>
          <span className="s02h-stat-label"><GenericEditableText sectionId={sectionId} field="stat1Label" value={stat1Label} tag="span" /></span>
        </div>
        <div className="s02h-stat-sep" aria-hidden="true" />
        <div className="s02h-stat">
          <span className="s02h-stat-value"><GenericEditableText sectionId={sectionId} field="stat2Value" value={stat2Value} tag="span" /></span>
          <span className="s02h-stat-label"><GenericEditableText sectionId={sectionId} field="stat2Label" value={stat2Label} tag="span" /></span>
        </div>
        <div className="s02h-stat-sep" aria-hidden="true" />
        <div className="s02h-stat">
          <span className="s02h-stat-value"><GenericEditableText sectionId={sectionId} field="stat3Value" value={stat3Value} tag="span" /></span>
          <span className="s02h-stat-label"><GenericEditableText sectionId={sectionId} field="stat3Label" value={stat3Label} tag="span" /></span>
        </div>
      </div>
    </section>
  );
}

// ── hero-solar-02-page ─────────────────────────────────────────────────────
// Slim banner (~340px) pro subpages solar-02 — breadcrumb + eyebrow + H1 + green hairline
// DNA sdílená s homepage hero (dark #0b0f14 + green #79c44f + DM Sans + PV grid motif)
// ───────────────────────────────────────────────────────────────────────────
function HeroSolar02Page({ content, sectionId, tenantSlug, isAdmin }: {
  content: Record<string, unknown>;
  sectionId: number;
  tenantSlug?: string;
  isAdmin: boolean;
}) {
  const siteMode = String(content.siteMode ?? "multipage");
  const eyebrow  = String(content.eyebrow  ?? "");
  const title    = String(content.title    ?? "");
  const breadcrumb     = String(content.breadcrumb     ?? "Domů");
  const breadcrumbHref = String(content.breadcrumbHref ?? "/");
  const image    = String(content.image    ?? "/assets/solar-02/hero.webp");
  const resolve  = (href: string) => resolveNavHref(href, siteMode, tenantSlug, isAdmin);

  return (
    <section className="s02hp" data-template="solar-02" data-section="hero-solar-02-page">
      {/* BG image */}
      <div className="s02hp-bg" aria-hidden="true">
        <GenericEditableImage sectionId={sectionId} field="image" src={image} alt="" style={{ position: "absolute", inset: 0 }}>
          <Image src={image} alt="" fill priority sizes="100vw" style={{ objectFit: "cover" }} unoptimized={shouldSkipNextImageOptimization(image)} />
        </GenericEditableImage>
      </div>

      {/* Layered overlays */}
      <div className="s02hp-overlay" aria-hidden="true" />
      <div className="s02hp-tint"    aria-hidden="true" />

      {/* PV grid decorative motif */}
      <svg className="s02hp-motif" viewBox="0 0 300 180" aria-hidden="true" preserveAspectRatio="none">
        <g stroke="rgba(121,196,79,0.24)" strokeWidth="0.8" fill="none">
          {Array.from({length: 10}).map((_, i) => <line key={`v${i}`} x1={i*30} y1="0" x2={i*30} y2="180" />)}
          {Array.from({length: 7}).map((_, i) => <line key={`h${i}`} x1="0" y1={i*30} x2="300" y2={i*30} />)}
        </g>
      </svg>

      <div className="s02hp-inner">
        {/* Breadcrumb */}
        <nav aria-label="Drobečková navigace" className="s02hp-crumbs">
          <a href={resolve(breadcrumbHref)} className="s02hp-crumb">
            <GenericEditableText sectionId={sectionId} field="breadcrumb" value={breadcrumb} tag="span" />
          </a>
          <span aria-hidden="true" className="s02hp-crumb-sep" />
          <span className="s02hp-crumb-current" aria-current="page">{title || " "}</span>
        </nav>

        {/* Eyebrow */}
        {eyebrow && (
          <div className="s02hp-eyebrow">
            <span className="s02hp-eyebrow-dot" aria-hidden="true" />
            <GenericEditableText sectionId={sectionId} field="eyebrow" value={eyebrow} tag="span" />
          </div>
        )}

        {/* H1 */}
        <h1 className="s02hp-h1">
          <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
        </h1>

        {/* Green hairline rule */}
        <span className="s02hp-rule" aria-hidden="true" />
      </div>
    </section>
  );
}

// Local resolveNavHref — mirrors NavbarSection helper for siteMode-aware links.
function resolveNavHref(href: string, siteMode: string, tenantSlug?: string, isAdmin = false) {
  if (siteMode === "onepage") {
    if (href.startsWith("/#")) return resolveDemoHref("/", tenantSlug, isAdmin) + href.slice(1);
    if (href === "/" || href.startsWith("http") || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) return resolveDemoHref(href, tenantSlug, isAdmin);
    const slug = href.replace(/^\//, "");
    return resolveDemoHref("/", tenantSlug, isAdmin) + "#" + slug;
  }
  if (href.startsWith("/#")) {
    const anchor = href.slice(2);
    return resolveDemoHref("/" + anchor, tenantSlug, isAdmin);
  }
  return resolveDemoHref(href, tenantSlug, isAdmin);
}

// ── solar-03-hero ─────────────────────────────────────────────────────────────
// 1:1 ac-heating.cz:
// - bílý bg, min-height ~85vh
// - layout: CSS grid stack — pozadí: pravý panel 58% s image-skew (clip-path polygon, orange #ff8b00 bg)
// - foreground: vlevo text 40%: Montserrat 800 H1 uppercase #222 + oranžové check listy + CTA + badges
// - h1: "Tepelná čerpadla a fotovoltaika od českého výrobce", fontSize clamp(28px,3vw,44px)
// - list: "Pro rodinné i bytové domy | Vyřízení dotace | Vše skladem", orange checks
// - badges: "20 let na trhu" circular + Google 5★ inline
// ─────────────────────────────────────────────────────────────────────────────
function HeroSolar03({ content, sectionId, tenantSlug, isAdmin }: {
  content: Record<string, unknown>;
  sectionId: number;
  tenantSlug?: string;
  isAdmin?: boolean;
}) {
  const ORANGE    = "#ff8b00";
  const ORANGE_LT = "#ffa733";
  const DARK      = "#222222";
  const WHITE     = "#ffffff";

  const c = content as Record<string, unknown>;
  const siteMode = String(c.siteMode ?? "multipage");
  const eyebrow  = String(c.eyebrow  ?? "Tepelná čerpadla · Fotovoltaika · Rekuperace");
  const title    = String(c.title    ?? "Energetická nezávislost pro váš dům i firmu");
  const titleAccent = String(c.titleAccent ?? "");
  const subtitle = String(c.subtitle ?? "Kompletní energetická řešení od českého výrobce. Vlastní servisní síť po celé ČR, vyřízení dotace NZÚ i Nová Zelená úsporám a garantovaná návratnost do sedmi let.");
  const items    = (c.items as string[]) ?? [
    "Pro rodinné i komerční objekty",
    "Dotaci NZÚ vyřídíme za vás",
    "Vlastní servisní síť po celé ČR",
  ];
  const ctaText    = String(c.ctaText    ?? "Bezplatná konzultace");
  const ctaHref    = String(c.ctaHref    ?? "/kontakt");
  const ctaText2   = String(c.ctaText2   ?? "Prohlédnout realizace");
  const ctaHref2   = String(c.ctaHref2   ?? "/realizace");
  const image      = String(c.image      ?? "/templates/solar-03/hero.jpg");
  const badge1     = String(c.badge1     ?? "20 let na trhu");
  const badge2     = String(c.badge2     ?? "4,9 ★ Google (1 240 recenzí)");
  const badge3     = String(c.badge3     ?? "1 200+ instalací ročně");
  const specLabel  = String(c.specLabel  ?? "Úspora energií");
  const specValue  = String(c.specValue  ?? "až 78 %");
  const specNote   = String(c.specNote   ?? "měřeno v provozu 2025");
  const resolve    = (href: string) => resolveNavHref(href, siteMode, tenantSlug, isAdmin);

  const CheckIcon = () => (
    <span aria-hidden="true" style={{
      display: "inline-flex", alignItems: "center", justifyContent: "center",
      width: 26, height: 26, borderRadius: "50%",
      background: `linear-gradient(135deg, ${ORANGE} 0%, ${ORANGE_LT} 100%)`,
      boxShadow: "0 5px 14px -5px rgba(255,139,0,0.55)", flexShrink: 0,
    }}>
      <svg width="14" height="14" viewBox="0 0 18 18" fill="none">
        <path d="M4.5 9l3 3 6-6.5" stroke={WHITE} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </span>
  );

  return (
    <>
      <section className="s03h-section" data-template="solar-03">
        {/* Left-side subtle solar grid pattern */}
        <div className="s03h-textgrid" aria-hidden="true" />

        {/* Right: orange polygon panel + image */}
        <div className="s03h-bg">
          <div className="s03h-bg-grid" aria-hidden="true" />
          <div className="s03h-bg-img">
            <GenericEditableImage sectionId={sectionId} field="image" src={image} alt={title} style={{ position: "absolute", inset: 0 }}>
              <Image
                src={image}
                alt={title}
                fill
                style={{ objectFit: "cover" }}
                priority
                unoptimized={shouldSkipNextImageOptimization(image)}
              />
            </GenericEditableImage>
            <div className="s03h-bg-shade" aria-hidden="true" />
          </div>

          <svg className="s03h-corner s03h-corner-tl" width="46" height="46" viewBox="0 0 46 46" fill="none" aria-hidden="true">
            <path d="M2 16V2h14" stroke={ORANGE} strokeWidth="2" strokeLinecap="square"/>
          </svg>
          <svg className="s03h-corner s03h-corner-br" width="46" height="46" viewBox="0 0 46 46" fill="none" aria-hidden="true">
            <path d="M44 30v14H30" stroke={ORANGE} strokeWidth="2" strokeLinecap="square"/>
          </svg>

          <div className="s03h-spec">
            <span className="s03h-spec-icon" aria-hidden="true">
              <svg width="22" height="22" viewBox="0 0 24 24">
                <path d="M13 2L4 14h6l-1 8 9-12h-6l1-8z" fill={ORANGE}/>
              </svg>
            </span>
            <div className="s03h-spec-body">
              <span className="s03h-spec-label">
                <GenericEditableText sectionId={sectionId} field="specLabel" value={specLabel} tag="span" />
              </span>
              <span className="s03h-spec-value">
                <GenericEditableText sectionId={sectionId} field="specValue" value={specValue} tag="span" />
              </span>
              <span className="s03h-spec-note">
                <GenericEditableText sectionId={sectionId} field="specNote" value={specNote} tag="span" />
              </span>
            </div>
          </div>
        </div>

        {/* Left: text */}
        <div className="s03h-inner">
          <div className="s03h-text">
            <div className="s03h-eyebrow">
              <span className="s03h-eyebrow-dot" aria-hidden="true" />
              <GenericEditableText sectionId={sectionId} field="eyebrow" value={eyebrow} tag="span" />
            </div>

            <h1 className="s03h-h1">
              <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
              {titleAccent && (
                <>
                  {" "}
                  <span className="s03h-h1-accent">
                    <GenericEditableText sectionId={sectionId} field="titleAccent" value={titleAccent} tag="span" />
                  </span>
                </>
              )}
            </h1>

            <p className="s03h-sub">
              <GenericEditableText sectionId={sectionId} field="subtitle" value={subtitle} tag="span" />
            </p>

            <ul className="s03h-list">
              {items.map((item, i) => (
                <li key={i} className="s03h-list-row">
                  <CheckIcon />
                  <GenericEditableText sectionId={sectionId} field={`items.${i}`} value={item} tag="span" />
                </li>
              ))}
            </ul>

            <div className="s03h-ctas">
              <a href={resolve(ctaHref)} data-btn="primary" className="s03h-cta s03h-cta-primary">
                <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
                <span aria-hidden="true" style={{ marginLeft: 8, display: "inline-flex" }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={WHITE} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                  </svg>
                </span>
              </a>
              <a href={resolve(ctaHref2)} data-btn="ghost" className="s03h-cta s03h-cta-ghost">
                <GenericEditableText sectionId={sectionId} field="ctaText2" value={ctaText2} tag="span" />
                <span aria-hidden="true" style={{ marginLeft: 8, display: "inline-flex" }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={DARK} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                  </svg>
                </span>
              </a>
            </div>

            <div className="s03h-badges">
              <div className="s03h-badge">
                <span className="s03h-badge-dot" aria-hidden="true" />
                <GenericEditableText sectionId={sectionId} field="badge1" value={badge1} tag="span" />
              </div>
              <div className="s03h-badge">
                <span className="s03h-badge-star" aria-hidden="true">★</span>
                <GenericEditableText sectionId={sectionId} field="badge2" value={badge2} tag="span" />
              </div>
              <div className="s03h-badge">
                <span className="s03h-badge-dot" aria-hidden="true" />
                <GenericEditableText sectionId={sectionId} field="badge3" value={badge3} tag="span" />
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

// ── hero-solar-03-page (slim subpage banner) ─────────────────────────────────
function HeroSolar03Page({ content, sectionId, tenantSlug, isAdmin }: {
  content: Record<string, unknown>;
  sectionId: number;
  tenantSlug?: string;
  isAdmin?: boolean;
}) {
  const c = content as Record<string, unknown>;
  const siteMode      = String(c.siteMode      ?? "multipage");
  const eyebrow       = String(c.eyebrow       ?? "SolarPro");
  const title         = String(c.title         ?? "Podstránka");
  const subtitle      = String(c.subtitle      ?? "");
  const breadcrumb    = String(c.breadcrumb    ?? "Domů");
  const breadcrumbHref = String(c.breadcrumbHref ?? "/");
  const current       = String(c.current       ?? title);
  const resolve = (href: string) => resolveNavHref(href, siteMode, tenantSlug, isAdmin);

  return (
    <section className="s03pg-banner" data-template="solar-03">
      <div className="s03pg-bg-grid" aria-hidden="true" />
      <div className="s03pg-glow" aria-hidden="true" />
      <div className="s03pg-inner">
        <nav className="s03pg-crumbs" aria-label="Breadcrumb">
          <a href={resolve(breadcrumbHref)} className="s03pg-crumb-link">
            <GenericEditableText sectionId={sectionId} field="breadcrumb" value={breadcrumb} tag="span" />
          </a>
          <span className="s03pg-crumb-sep" aria-hidden="true">/</span>
          <span className="s03pg-crumb-current">
            <GenericEditableText sectionId={sectionId} field="current" value={current} tag="span" />
          </span>
        </nav>

        <div className="s03pg-eyebrow">
          <span className="s03pg-eyebrow-dot" aria-hidden="true" />
          <GenericEditableText sectionId={sectionId} field="eyebrow" value={eyebrow} tag="span" />
        </div>

        <h1 className="s03pg-title">
          <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
        </h1>

        {subtitle && (
          <p className="s03pg-subtitle">
            <GenericEditableText sectionId={sectionId} field="subtitle" value={subtitle} tag="span" />
          </p>
        )}

        <div className="s03pg-hairline" aria-hidden="true" />
      </div>
    </section>
  );
}

// ── floors-01-hero ────────────────────────────────────────────────────────────
// 1:1 supellex.cz hero: slider vlevo + pravý panel s 2 náhledy
// ─────────────────────────────────────────────────────────────────────────────
function HeroFloors01({ content, sectionId, tenantSlug, isAdmin }: Omit<Props, "variant">) {
  const c = content as Record<string, unknown>;
  const [current, setCurrent] = useState(0);

  const GREEN = "#007d47";
  const WHITE = "#ffffff";
  const FONT  = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif";

  type Slide    = { image: string; alt: string; text: string; ctaText: string; ctaHref: string };
  type SidePost = { image: string; alt: string; label: string; href: string };

  const defaultSlides: Slide[] = [
    { image: "/clones/supellex/user/www-supellex-cz/banners/juglans-50-lvre-3088-naturals.jpg", alt: "Prémiové vinylové podlahy", text: "Vinylové dílce s prémiovým designem a dokonalou odolností", ctaText: "Vybrat", ctaHref: "/sluzby" },
    { image: "/clones/supellex/user/www-supellex-cz/banners/aspecta.jpg", alt: "Nová kolekce podlah", text: "Nová kolekce ve třech řadách — pro každý interiér ta pravá", ctaText: "Prohlédnout", ctaHref: "/sluzby" },
    { image: "/clones/supellex/user/www-supellex-cz/banners/merit-slider-3.jpg", alt: "SPC podlahy", text: "SPC podlahy s korkovou podložkou — pohodlí a pevnost v jednom", ctaText: "Skladem", ctaHref: "/sluzby" },
    { image: "/clones/supellex/user/www-supellex-cz/banners/family.jpg", alt: "Dřevěné podlahy", text: "Evropský dub jako stabilní základ vaší rodiny a domova", ctaText: "Vybrat", ctaHref: "/sluzby" },
    { image: "/clones/supellex/user/www-supellex-cz/banners/stauf-chemie-pro-jistou-pokladku.jpg", alt: "Stavební chemie", text: "Profesionální stavební chemie pro dokonalou pokládku podlah", ctaText: "Vybrat", ctaHref: "/sluzby" },
  ];
  const defaultSidePosts: SidePost[] = [
    { image: "/clones/supellex/user/www-supellex-cz/blog/skladweb-1000x500-383x292.jpg",             alt: "Showroom podlah",    label: "Showroom podlah v Praze",                    href: "/sluzby" },
    { image: "/clones/supellex/user/www-supellex-cz/blog/pxl-20260225-120606422-10-383x292.jpg",    alt: "Vinylové podlahy",  label: "Kompletní portfolio vinylových podlah",      href: "/sluzby" },
  ];

  const slides: Slide[]       = Array.isArray(c.slides)    && (c.slides    as unknown[]).length ? (c.slides    as Slide[])    : defaultSlides;
  const sidePosts: SidePost[] = Array.isArray(c.sidePosts) && (c.sidePosts as unknown[]).length ? (c.sidePosts as SidePost[]) : defaultSidePosts;
  const count = slides.length;

  const resolve = (href: string) => {
    if (!tenantSlug) return href;
    const base = `/demo/${tenantSlug}${isAdmin ? "/admin" : ""}`;
    if (href === "/" || href === "") return base;
    if (href.startsWith("http") || href.startsWith("#")) return href;
    return `${base}${href.startsWith("/") ? href : "/" + href}`;
  };

  useEffect(() => {
    if (count < 2) return;
    const id = setInterval(() => setCurrent((p) => (p + 1) % count), 5000);
    return () => clearInterval(id);
  }, [count]);

  const H = 480;

  return (
    <>
      <style>{`
        .f01h-slide { position: absolute; inset: 0; transition: opacity 0.65s ease; }
        .f01h-side-post { overflow: hidden; position: relative; flex: 1; display: block; }
        .f01h-side-post img { width: 100%; height: 100%; object-fit: cover; display: block; transition: transform 0.4s ease; }
        .f01h-side-post:hover img { transform: scale(1.05); }
        .f01h-side-label { position: absolute; bottom: 0; left: 0; right: 0; padding: 12px 14px; background: linear-gradient(transparent, rgba(0,0,0,0.72)); color: #fff; font-size: 13px; font-weight: 600; line-height: 1.35; font-family: ${FONT}; }
        .f01h-arrow { position: absolute; top: 50%; transform: translateY(-50%); background: rgba(255,255,255,0.2); border: 1.5px solid rgba(255,255,255,0.55); color: #fff; border-radius: 50%; width: 42px; height: 42px; display: flex; align-items: center; justify-content: center; cursor: pointer; font-size: 24px; z-index: 10; transition: background 0.2s; line-height: 1; }
        .f01h-arrow:hover { background: rgba(255,255,255,0.4); }
        .f01h-dot { width: 8px; height: 8px; border-radius: 50%; border: none; cursor: pointer; padding: 0; transition: background 0.2s; }
        @media (max-width: 768px) { .f01h-side { display: none !important; } .f01h-slider { height: 300px !important; } }
      `}</style>

      <section style={{ fontFamily: FONT }}>
        <div style={{ display: "flex", height: H, overflow: "hidden", background: "#111" }}>

          {/* ── Slider ── */}
          <div className="f01h-slider" style={{ position: "relative", flex: "1 1 0", minWidth: 0, height: H }}>
            {slides.map((slide, i) => (
              <div key={i} className="f01h-slide" style={{ opacity: i === current ? 1 : 0, pointerEvents: i === current ? "auto" : "none" }}>
                <GenericEditableImage sectionId={sectionId} field={`slides.${i}.image`} src={slide.image} alt={slide.alt} style={{ position: "absolute", inset: 0 }}>
                  <img src={slide.image} alt={slide.alt} loading={i === 0 ? "eager" : "lazy"} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                </GenericEditableImage>
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.62) 0%, rgba(0,0,0,0.08) 55%, transparent 100%)" }} />
                <div style={{ position: "absolute", bottom: 56, left: 40, right: 40 }}>
                  <p style={{ color: WHITE, fontSize: 22, fontWeight: 700, margin: "0 0 18px", lineHeight: 1.35, textShadow: "0 1px 4px rgba(0,0,0,0.5)", maxWidth: 520 }}>
                    <GenericEditableText sectionId={sectionId} field={`slides.${i}.text`} value={slide.text} tag="span">{slide.text}</GenericEditableText>
                  </p>
                  <a href={resolve(slide.ctaHref)} data-btn="primary" style={{ display: "inline-block", padding: "11px 30px", background: GREEN, color: WHITE, borderRadius: 3, fontWeight: 700, fontSize: 13, textDecoration: "none", letterSpacing: "0.05em", textTransform: "uppercase" }}>
                    <GenericEditableText sectionId={sectionId} field={`slides.${i}.ctaText`} value={slide.ctaText} tag="span">{slide.ctaText}</GenericEditableText>
                  </a>
                </div>
              </div>
            ))}
            <button className="f01h-arrow" style={{ left: 14 }} onClick={() => setCurrent((p) => (p - 1 + count) % count)} aria-label="Předchozí">‹</button>
            <button className="f01h-arrow" style={{ right: 14 }} onClick={() => setCurrent((p) => (p + 1) % count)} aria-label="Další">›</button>
            <div style={{ position: "absolute", bottom: 18, left: "50%", transform: "translateX(-50%)", display: "flex", gap: 7, zIndex: 5 }}>
              {slides.map((_, i) => (
                <button key={i} className="f01h-dot" onClick={() => setCurrent(i)} aria-label={`Snímek ${i + 1}`}
                  style={{ background: i === current ? WHITE : "rgba(255,255,255,0.45)" }} />
              ))}
            </div>
          </div>

          {/* ── Right panel: 2 side posts ── */}
          <div className="f01h-side" style={{ width: 240, flexShrink: 0, display: "flex", flexDirection: "column", height: H }}>
            {sidePosts.slice(0, 2).map((post, i) => (
              <a key={i} href={resolve(post.href)} className="f01h-side-post" style={{ textDecoration: "none", borderTop: i === 1 ? "2px solid #fff" : undefined }}>
                <GenericEditableImage sectionId={sectionId} field={`sidePosts.${i}.image`} src={post.image} alt={post.alt} style={{ position: "absolute", inset: 0 }}>
                  <img src={post.image} alt={post.alt} loading="lazy" />
                </GenericEditableImage>
                <div className="f01h-side-label"><GenericEditableText sectionId={sectionId} field={`sidePosts.${i}.label`} value={post.label} tag="span">{post.label}</GenericEditableText></div>
              </a>
            ))}
          </div>

        </div>
      </section>
    </>
  );
}

// ── klempir-01-hero ───────────────────────────────────────────────────────────
// 1:1 klempirzprahy.cz:
// - 100vh height, min-height 600px
// - Video element (autoplay loop muted playsinline) přes celou sekci
// - Fallback: hero.jpeg jako poster/background
// - Overlay: radial-gradient(circle at center, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.8) 40%, rgba(0,0,0,0.95) 100%)
// - Content center: bílý H1 uppercase 48px + subtitle 20px + 2 tlačítka
// - Oba buttony: padding 12px 24px, border: 1px solid rgba(255,255,255,0.6)
//   primary: bg #3a3a3a / secondary: bg transparent, border white
// ─────────────────────────────────────────────────────────────────────────────
interface HeroProps {
  content: Record<string, unknown>;
  sectionId: number;
  tenantSlug?: string;
  isAdmin: boolean;
}

function HeroKlempir01({ content, sectionId, tenantSlug, isAdmin }: HeroProps) {
  const FONT   = "'Montserrat', sans-serif";
  const SILVER = "#c0c0c0";
  const DARK   = "#3a3a3a";
  const WHITE  = "#ffffff";

  const title      = String(content.title      ?? "PROFESIONÁLNÍ KLEMPÍŘSKÉ PRÁCE");
  const subtitle   = String(content.subtitle   ?? "Opravy, rekonstrukce a výměny klempířských, tesařských a pokrývačských prvků i celků");
  const ctaText    = String(content.ctaText    ?? "Kontaktovat");
  const ctaHref    = String(content.ctaHref    ?? "/kontakt");
  const ctaSecText = String(content.ctaSecondaryText ?? "Služby");
  const ctaSecHref = String(content.ctaSecondaryHref ?? "/sluzby");
  const bgImage    = String(content.backgroundImage  ?? "/clones/klempirzprahy/images/hero.jpeg");
  const bgVideo    = String(content.backgroundVideo  ?? "");
  const label      = String(content.label ?? "");

  const resolve = (href: string) => resolveDemoHref(href, tenantSlug, isAdmin);

  return (
    <>
      <style>{`
        @keyframes k01FadeIn {
          from { opacity:0; transform:translateY(30px); }
          to   { opacity:1; transform:translateY(0); }
        }
        .k01-hero-video {
          position:absolute;top:50%;left:50%;
          min-width:100%;min-height:100%;
          width:auto;height:auto;
          transform:translateX(-50%) translateY(-50%);
          object-fit:cover;
        }
        .k01-hero-content {
          animation: k01FadeIn 1.5s ease forwards;
        }
        .k01-btn-primary {
          background-color:${DARK};color:${WHITE};
          padding:12px 24px;font-size:16px;font-weight:600;
          border:1px solid rgba(255,255,255,0.6);
          font-family:${FONT};text-decoration:none;
          cursor:pointer;transition:all 0.3s ease;display:inline-block;
        }
        .k01-btn-primary:hover {
          background-color:#505050;
          transform:translateY(-3px);
          box-shadow:0 6px 15px rgba(0,0,0,0.2);
        }
        .k01-btn-secondary {
          background-color:transparent;color:${WHITE};
          padding:12px 24px;font-size:16px;font-weight:500;
          border:1px solid rgba(255,255,255,0.6);
          font-family:${FONT};text-decoration:none;
          cursor:pointer;transition:all 0.3s ease;display:inline-block;
        }
        .k01-btn-secondary:hover {
          background-color:${DARK};
          transform:translateY(-3px);
          box-shadow:0 6px 15px rgba(0,0,0,0.2);
        }
        @media(max-width:768px){
          .k01-hero-title  { font-size:32px!important; }
          .k01-hero-sub    { font-size:16px!important; }
          .k01-hero-btns   { flex-direction:column;align-items:center; }
          .k01-btn-primary,.k01-btn-secondary { width:100%;max-width:250px;text-align:center; }
        }
      `}</style>

      <section
        data-template="klempir-01"
        style={{
          height: "100vh", minHeight: 600, position: "relative",
          display: "flex", alignItems: "center", textAlign: "center",
          color: WHITE, overflow: "hidden", fontFamily: FONT,
        }}
      >
        {/* Video / image background */}
        <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", overflow: "hidden", zIndex: 0 }}>
          {bgVideo ? (
            <video
              autoPlay loop muted playsInline
              poster={bgImage}
              className="k01-hero-video"
            >
              <source src={bgVideo} type={bgVideo.endsWith(".webm") ? "video/webm" : "video/mp4"} />
              <img loading="eager" src={bgImage} alt="Klempíř z Prahy" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </video>
          ) : (
            <GenericEditableImage sectionId={sectionId} field="backgroundImage" src={bgImage} alt="Hero background" style={{ position: "absolute", inset: 0 }}>
              <img
                src={bgImage} alt="Hero background"
                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
              />
            </GenericEditableImage>
          )}
        </div>

        {/* Radial gradient overlay – identické s originálem */}
        <div style={{
          position: "absolute", top: 0, left: 0, width: "100%", height: "100%",
          background: "radial-gradient(circle at center, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.8) 40%, rgba(0,0,0,0.95) 100%)",
          zIndex: 1,
        }} />

        {/* Content */}
        <div className="k01-hero-content" style={{
          position: "relative", zIndex: 2,
          maxWidth: 800, margin: "0 auto", padding: "0 20px",
        }}>
          {/* Label / kicker badge */}
          {label && (
            <div style={{
              display: "inline-block", marginBottom: 20,
              background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.4)",
              padding: "6px 18px", borderRadius: 30, backdropFilter: "blur(4px)",
            }}>
              <GenericEditableText sectionId={sectionId} field="label" value={label} tag="span"
                style={{ color: WHITE, fontSize: 14, fontWeight: 500, fontFamily: FONT, letterSpacing: "0.05em" }}
              />
            </div>
          )}
          {/* backgroundVideo URL (hidden in preview, editable in studio) */}
          <div style={{ position: "absolute", width: 0, height: 0, overflow: "hidden", opacity: 0, pointerEvents: "none" }}>
            <GenericEditableText sectionId={sectionId} field="backgroundVideo" value={bgVideo} tag="span" />
          </div>
          <GenericEditableText sectionId={sectionId} field="title" value={title} tag="h1">
            <h1
              className="k01-hero-title"
              style={{
                fontSize: 48, fontWeight: 700, marginBottom: 20,
                fontFamily: FONT, color: WHITE,
                textShadow: "0 2px 8px rgba(0,0,0,0.8), 0 4px 20px rgba(0,0,0,0.6)",
                textTransform: "uppercase", lineHeight: 1.2,
                letterSpacing: "0.03em",
              }}
            >{title}</h1>
          </GenericEditableText>

          <GenericEditableText sectionId={sectionId} field="subtitle" value={subtitle} tag="p">
            <p className="k01-hero-sub" style={{
              fontSize: 20, fontWeight: 500, color: WHITE,
              textShadow: "0 1px 6px rgba(0,0,0,0.7)",
              fontFamily: FONT, maxWidth: 700, margin: "0 auto 30px",
              lineHeight: 1.6,
            }}>{subtitle}</p>
          </GenericEditableText>

          <div className="k01-hero-btns" style={{ display: "flex", justifyContent: "center", gap: 20, marginTop: 30 }}>
            <a href={resolve(ctaHref)} data-btn="primary" className="k01-btn-primary">
              <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
            </a>
            <a href={resolve(ctaSecHref)} className="k01-btn-secondary">
              <GenericEditableText sectionId={sectionId} field="ctaSecondaryText" value={ctaSecText} tag="span" />
            </a>
          </div>
        </div>
      </section>
    </>
  );
}

// ── malir-01-hero ─────────────────────────────────────────────────────────────
// 1:1 petrovomalovani.cz hero:
// - 700px výška, 4 fotky crossfade (opacity transition 3s)
// - Tmavý overlay pro čitelnost textu
// - Centrovaný amber (#E79B0E) Playfair Display 800 title, 50px, max-width 770px
// - White Raleway subtitle
// - 2 navy (#0F297B) CTA buttony s gradient, hover color #F5AA23
// - Bílý pill toggler u dna se 4 barevnými tečkami (klikatelné)
// ─────────────────────────────────────────────────────────────────────────────
function HeroMalir01({ content, sectionId, tenantSlug, isAdmin }: Omit<Props, "variant">) {
  const c = content as Record<string, unknown>;
  const [current, setCurrent] = useState(0);

  const AMBER    = "#E79B0E";
  const AMBER2   = "#F5AA23";
  const NAVY     = "#0F297B";
  const WHITE    = "#ffffff";
  const PLAYFAIR = "'Playfair Display', 'Times New Roman', serif";
  const RALEWAY  = "'Raleway', sans-serif";

  const title        = String(c.title        ?? "Dodržujeme termín a cenu,\núklid je samozřejmostí");
  const subtitle     = String(c.subtitle     ?? "Malování interiérů a lakování oken a dveří od roku 2001.");
  const ctaText      = String(c.ctaText      ?? "Chci vymalovat");
  const ctaHref      = String(c.ctaHref      ?? "#sluzby");
  const ctaSecText   = String(c.ctaSecondaryText ?? "Chci nalakovat");
  const ctaSecHref   = String(c.ctaSecondaryHref ?? "#sluzby");
  const defaultImages = [
    "/templates/malir-01/malir-top.jpg",
    "/templates/malir-01/malir-top-2.jpg",
    "/templates/malir-01/malir-top-3.jpg",
    "/templates/malir-01/malir-top-4.jpg",
  ];
  const images: string[] = Array.isArray(c.images) && (c.images as unknown[]).length
    ? (c.images as string[])
    : defaultImages;
  const count = images.length;

  const resolve = (href: string) => resolveDemoHref(href, tenantSlug, isAdmin);

  useEffect(() => {
    if (count < 2) return;
    const id = setInterval(() => setCurrent((p) => (p + 1) % count), 5000);
    return () => clearInterval(id);
  }, [count]);

  // Dot colors matching original petrovomalovani.cz toggler
  const dotColors = ["#E67B19", "#5F5F5F", "#02768F", "#AA8E67"];

  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@800&family=Raleway:wght@400;600&display=swap" />
      <style>{`        .m01h-slide { position: absolute; inset: 0; opacity: 0; transition: opacity 3s ease; }
        .m01h-slide.active { opacity: 1; }
        .m01h-slide img { width: 100%; height: 100%; object-fit: cover; object-position: center top; display: block; }
        .m01h-btn {
          display: inline-block; padding: 12px 40px; line-height: 35px;
          background: linear-gradient(270deg, transparent 0%, rgba(0,0,0,0.3) 100%), linear-gradient(0deg, ${NAVY}, ${NAVY});
          text-decoration: none; text-transform: uppercase;
          color: ${WHITE}; font-size: 14px; font-weight: 600;
          border-radius: 4px; font-family: ${RALEWAY};
          transition: color 0.3s ease, background 0.3s ease; border: none; cursor: pointer; margin: 0 10px 10px;
        }
        .m01h-btn:hover { color: ${AMBER2}; background: linear-gradient(9deg, transparent 0%, rgba(0,0,0,0.3) 100%), linear-gradient(180deg, ${NAVY}, ${NAVY}); }
        .m01h-dot { width: 20px; height: 20px; border-radius: 50%; border: none; cursor: pointer; padding: 0; transition: all 0.2s; flex-shrink: 0; }
        .m01h-dot:hover { width: 25px; height: 25px; }
        .m01h-dot.active { width: 30px; height: 30px; }
        @media (max-width: 767px) {
          .m01h-inner { height: 450px !important; padding-top: 80px !important; }
          .m01h-title { font-size: 30px !important; line-height: 40px !important; }
        }
      `}</style>

      <section style={{ position: "relative", textAlign: "center", background: "#8c7975", overflow: "hidden" }} data-template="malir-01">
        {/* Slides */}
        {images.map((src, i) => (
          <div key={i} className={`m01h-slide${i === current ? " active" : ""}`}>
            <GenericEditableImage sectionId={sectionId} field={`images.${i}`} src={src} alt={`Slide ${i + 1}`}>
              <img loading="eager" src={src} alt={`Slide ${i + 1}`} />
            </GenericEditableImage>
          </div>
        ))}

        {/* Overlay */}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0.06) 0%, rgba(0,0,0,0.15) 60%, rgba(0,0,0,0.28) 100%)" }} />

        {/* Content */}
        <div className="m01h-inner" style={{ position: "relative", zIndex: 2, height: 700, paddingTop: 180, boxSizing: "border-box" }}>
          <p className="m01h-title" style={{ fontFamily: PLAYFAIR, fontSize: 50, fontWeight: 800, lineHeight: "60px", color: AMBER, maxWidth: 770, margin: "0 auto 12px", whiteSpace: "pre-line" }}>
            <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span">{title}</GenericEditableText>
          </p>
          <p style={{ fontFamily: RALEWAY, fontSize: 16, color: WHITE, margin: "0 auto 28px", maxWidth: 560, opacity: 0.92 }}>
            <GenericEditableText sectionId={sectionId} field="subtitle" value={subtitle} tag="span">{subtitle}</GenericEditableText>
          </p>
          <div>
            <a href={resolve(ctaHref)} data-btn="primary" className="m01h-btn">
              <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span">{ctaText}</GenericEditableText>
            </a>
            <a href={resolve(ctaSecHref)} className="m01h-btn">
              <GenericEditableText sectionId={sectionId} field="ctaSecondaryText" value={ctaSecText} tag="span">{ctaSecText}</GenericEditableText>
            </a>
          </div>
        </div>

        {/* Pill toggler */}
        <div style={{
          position: "absolute", bottom: 20, left: "50%", transform: "translateX(-50%)",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          width: 140, height: 50, padding: "0 10px", borderRadius: 25,
          background: WHITE, zIndex: 3, boxSizing: "border-box",
        }}>
          {Array.from({ length: Math.min(count, 4) }).map((_, i) => (
            <button
              key={i}
              className={`m01h-dot${i === current ? " active" : ""}`}
              style={{ background: dotColors[i % dotColors.length] }}
              onClick={() => setCurrent(i)}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>
      </section>
    </>
  );
}

// ── garden-01-hero ──────────────────────────────────────────────────────────
function HeroGarden01({
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
  const c = content as {
    eyebrow?: string;
    title?: string;
    subtitle?: string;
    ctaText?: string;
    ctaHref?: string;
    phone?: string;
    backgroundImage?: string;
  };

  const bgImage = c.backgroundImage ?? "";
  const eyebrow = c.eyebrow ?? "Praha a okolí";
  const title = c.title ?? "Realizace a údržba zahrad";
  const subtitle = c.subtitle ?? "Postaráme se o vaši zahradu tak, aby byla krásná po celý rok.";
  const ctaText = c.ctaText ?? "Nezávazná poptávka";
  const ctaHref = c.ctaHref ?? "#kontakt";
  const phone = c.phone ?? "+420 704 123 456";

  return (
    <>
      <style>{`
        .g01h-section {
          position: relative;
          width: 100%;
          min-height: 100vh;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          border-radius: 0 0 150px 0;
          padding-top: 210px;
          padding-bottom: 76px;
          box-sizing: border-box;
        }
        .g01h-bg {
          position: absolute;
          inset: 0;
          z-index: 0;
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
        }
        .g01h-overlay {
          position: absolute;
          inset: 0;
          z-index: 1;
          background: rgba(32, 39, 20, 0.64);
        }
        .g01h-inner {
          position: relative;
          z-index: 2;
          padding-left: 35%;
          padding-right: 48px;
          box-sizing: border-box;
        }
        .g01h-eyebrow {
          display: block;
          color: #ffffff;
          font-family: 'Lato', Arial, sans-serif;
          font-size: 24px;
          font-weight: 100;
          line-height: 1.2;
          letter-spacing: 0.02em;
          margin-bottom: 16px;
        }
        .g01h-title {
          color: #ffffff;
          font-family: 'Cardo', Georgia, serif;
          font-size: 64px;
          font-weight: 100;
          line-height: 1.2;
          margin: 0 0 20px 0;
        }
        .g01h-subtitle {
          color: #ffffff;
          font-family: 'Inter', Arial, sans-serif;
          font-size: 19px;
          font-weight: 400;
          line-height: 1.6;
          margin: 0 180px 32px 0;
        }
        .g01h-phone {
          display: flex;
          align-items: center;
          gap: 10px;
          color: #ffffff;
          font-family: 'Lato', Arial, sans-serif;
          font-size: 18px;
          font-weight: 400;
          text-decoration: none;
          margin-bottom: 0;
        }
        .g01h-phone:hover {
          color: #e0e0e0;
        }
        .g01h-phone svg {
          flex-shrink: 0;
        }
        .g01h-cta-mobile {
          display: none;
        }

        @media (max-width: 1023px) {
          .g01h-section {
            border-radius: 0 0 80px 0;
            padding-top: 180px;
            padding-bottom: 150px;
          }
          .g01h-inner {
            padding-left: 60%;
            padding-right: 32px;
          }
          .g01h-title {
            font-size: 40px;
          }
          .g01h-subtitle {
            margin-right: 64px;
          }
        }

        @media (max-width: 767px) {
          .g01h-section {
            border-radius: 0 0 40px 0;
            padding: 120px 24px 80px 24px;
            min-height: 100svh;
          }
          .g01h-inner {
            padding-left: 0;
            padding-right: 0;
          }
          .g01h-eyebrow {
            font-size: 18px;
            margin-bottom: 12px;
          }
          .g01h-title {
            font-size: 20px;
            margin-bottom: 28px;
          }
          .g01h-subtitle {
            display: none;
          }
          .g01h-phone {
            display: none;
          }
          .g01h-cta-mobile {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            background: #6a961f;
            color: #ffffff;
            font-family: 'Lato', Arial, sans-serif;
            font-size: 14px;
            font-weight: 700;
            text-decoration: none;
            padding: 16px 32px;
            border-radius: 24px;
            letter-spacing: 0.4px;
            line-height: 1em;
            text-transform: capitalize;
          }
          .g01h-cta-mobile:hover {
            background: #5a7e18;
          }
        }
      `}</style>

      <section id="uvod" className="g01h-section">
        <GenericEditableBackground sectionId={sectionId} field="bgImage" value={bgImage}>
          <div
            className="g01h-bg"
            style={bgImage ? { backgroundImage: `url(${bgImage})` } : { background: "#202714" }}
          />
        </GenericEditableBackground>
        <div className="g01h-overlay" />
        <div className="g01h-inner">
          <GenericEditableText
            tag="span"
            className="g01h-eyebrow"
            value={eyebrow}
            sectionId={sectionId}
            field="eyebrow"
          />
          <GenericEditableText
            tag="h1"
            className="g01h-title"
            value={title}
            sectionId={sectionId}
            field="title"
          />
          <GenericEditableText
            tag="p"
            className="g01h-subtitle"
            value={subtitle}
            sectionId={sectionId}
            field="subtitle"
          />
          <a href={`tel:${phone.replace(/\s/g, "")}`} className="g01h-phone">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.7A2 2 0 012 0h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 14v2.92z"/>
            </svg>
            <GenericEditableText
              tag="span"
              value={phone}
              sectionId={sectionId}
              field="phone"
            />
          </a>
          <a href={ctaHref} data-btn="primary" className="g01h-cta-mobile">{ctaText}</a>
        </div>
      </section>
    </>
  );
}

// ── clean-02-hero ─────────────────────────────────────────────────────────────
// 1:1 modryzralok.cz: 100vh 2-foto blend, Bricolage Grotesque H1, gradient CTA + Google rating
function HeroClean02({ content, sectionId, tenantSlug, isAdmin }: { content: Record<string, unknown>; sectionId: number; tenantSlug?: string; isAdmin: boolean }) {
  const c = content as Record<string, unknown>;
  const subtitle    = String(c.subtitle    ?? "Spolehlivá úklidová firma v Praze, která se postará o vše od A do Z. Uklidíme kanceláře i společné prostory v bytových domech (SVJ). Pracujeme rychle, pečlivě a bez zbytečných řečí.");
  const ctaText     = String(c.ctaText     ?? "Nezávazně poptat úklid");
  const ctaHref     = String(c.ctaHref     ?? "#kontakt");
  const cta2Text    = String(c.ctaSecondaryText ?? "Proč s námi");
  const cta2Href    = String(c.ctaSecondaryHref ?? "#proc-s-nami");
  const badgeText   = String(c.badgeText   ?? "Pro firmy a bytové domy SVJ");
  const reviewCount = String(c.reviewCount ?? "70+");

  const BLEND_L = "/clones/modryzralok/cdn/681cb883f075d3dfa070d327_hero_blend_1.webp";
  const BLEND_R = "/clones/modryzralok/cdn/681cb882589f8948a612943b_hero_blend_2.webp";
  const GOOGLE  = "/clones/modryzralok/cdn/681ca92793f51e4291431db0_google-review.webp";
  const STAR    = "/clones/modryzralok/cdn/681ca97988683ab4a1bbc7ed_star.svg";
  const H_PIC   = "/clones/modryzralok/cdn/681ca46265a00932ff8ac77f_heading-pic.webp";
  const SHINES  = "/clones/modryzralok/cdn/68359e6ae99f26621721833a_shines%201.svg";

  const resolve = (href: string) => {
    if (!tenantSlug || href.startsWith("http") || href.startsWith("#")) return href;
    const base = isAdmin ? `/demo/${tenantSlug}/admin` : `/demo/${tenantSlug}`;
    return href === "/" ? base : `${base}${href}`;
  };

  const NAVY = "#0e0e53";
  const BLUE = "#019dff";

  return (
    <>
      <style>{`
        .c02h-section {
          position: relative; overflow: hidden;
          background: #f3f9ff;
          padding-top: 9rem; padding-bottom: 7rem;
          font-family: 'Onest', sans-serif;
        }

        /* radial glow in centre */
        .c02h-section::before {
          content: '';
          position: absolute;
          inset: 0;
          background:
            radial-gradient(ellipse 70% 55% at 50% 40%, rgba(1,157,255,0.10) 0%, transparent 70%),
            radial-gradient(ellipse 40% 30% at 80% 15%, rgba(37,89,226,0.07) 0%, transparent 60%);
          pointer-events: none; z-index: 0;
        }

        /* subtle dot grid */
        .c02h-section::after {
          content: '';
          position: absolute; inset: 0;
          background-image: radial-gradient(rgba(14,14,83,0.045) 1px, transparent 1px);
          background-size: 28px 28px;
          pointer-events: none; z-index: 0;
        }

        /* blend images */
        .c02h-blends {
          position: absolute; inset: 0;
          display: flex; justify-content: space-between; align-items: flex-end;
          pointer-events: none; z-index: 1;
        }
        .c02h-bl { width: 260px; opacity: 0.14; align-self: flex-start; margin-top: -2rem; }
        .c02h-br { width: 220px; opacity: 0.18; margin-bottom: 2rem; }

        /* content */
        .c02h-content {
          position: relative; z-index: 2;
          max-width: 54rem; margin: 0 auto; padding: 0 1.5rem;
          display: flex; flex-direction: column; align-items: center;
          text-align: center; gap: 1.75rem;
        }

        /* badge */
        .c02h-badge {
          display: inline-flex; align-items: center; gap: 0.55rem;
          background: #fff;
          border: 1px solid rgba(1,157,255,0.25);
          border-radius: 9999px;
          padding: 0.4rem 1rem 0.4rem 0.5rem;
          font-size: 0.82rem; font-weight: 600; color: ${NAVY};
          box-shadow: 0 4px 20px rgba(1,157,255,0.12), 0 1px 4px rgba(14,14,83,0.06);
          letter-spacing: 0.01em;
        }
        .c02h-badge-icon { width: 1.4rem; height: 1.4rem; flex-shrink: 0; }

        /* heading */
        .c02h-h1 {
          font-family: 'Bricolage Grotesque', sans-serif;
          font-size: clamp(2.5rem, 6.5vw, 4.75rem);
          font-weight: 800; color: ${NAVY}; line-height: 1.08;
          margin: 0; letter-spacing: -0.02em;
        }
        .c02h-blue {
          color: ${BLUE};
          background: linear-gradient(135deg, #2bbbff 0%, #2559e2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .c02h-underline {
          background-image: url(${H_PIC});
          background-size: 100% auto; background-repeat: no-repeat;
          background-position: center bottom 2px; padding-bottom: 0.25em;
        }
        .c02h-shine {
          background-image: url(${SHINES});
          background-size: auto 1.9rem; background-repeat: no-repeat;
          background-position: top right; padding-right: 2.75rem;
        }

        /* subtitle */
        .c02h-sub {
          font-size: clamp(1rem, 2.2vw, 1.15rem);
          color: #3d4d7a; line-height: 1.7; margin: 0;
          max-width: 36rem; font-weight: 400;
        }
        .c02h-sub strong { color: ${NAVY}; font-weight: 600; }

        /* buttons */
        .c02h-btns { display: flex; flex-wrap: wrap; justify-content: center; gap: 0.75rem; margin-top: 0.25rem; }
        .c02h-btn1 {
          display: inline-flex; align-items: center; gap: 0.6rem;
          padding: 1rem 2rem; border-radius: 9999px;
          background: linear-gradient(100deg, #2bbbff 0%, #1c91ff 40%, #2559e2 100%);
          color: #fff; font-weight: 700; font-size: 1rem; text-decoration: none;
          box-shadow: 0 10px 35px -8px rgba(28,120,255,0.5), 0 2px 8px rgba(28,120,255,0.2);
          transition: box-shadow 0.25s, transform 0.2s;
          letter-spacing: 0.01em;
        }
        .c02h-btn1:hover {
          transform: translateY(-2px);
          box-shadow: 0 16px 40px -8px rgba(28,120,255,0.6), 0 4px 12px rgba(28,120,255,0.25);
        }
        .c02h-btn2 {
          display: inline-flex; align-items: center; gap: 0.6rem;
          padding: 1rem 2rem; border-radius: 9999px;
          border: 2px solid rgba(14,14,83,0.18);
          background: rgba(255,255,255,0.7);
          backdrop-filter: blur(4px);
          color: ${NAVY}; font-weight: 600; font-size: 1rem; text-decoration: none;
          transition: border-color 0.2s, background 0.2s, transform 0.2s;
        }
        .c02h-btn2:hover {
          border-color: ${NAVY};
          background: rgba(255,255,255,0.95);
          transform: translateY(-2px);
        }

        /* review card */
        .c02h-review-card {
          display: inline-flex; align-items: center; gap: 1rem;
          background: #fff;
          border: 1px solid rgba(1,157,255,0.18);
          border-radius: 14px;
          padding: 0.75rem 1.4rem;
          box-shadow: 0 4px 24px rgba(14,14,83,0.06), 0 1px 4px rgba(1,157,255,0.08);
          flex-wrap: wrap; justify-content: center;
        }
        .c02h-review-divider {
          width: 1px; height: 2rem;
          background: rgba(14,14,83,0.1);
        }
        .c02h-gimg { height: 1.75rem; width: auto; }
        .c02h-stars { display: flex; align-items: center; gap: 0.3rem; }
        .c02h-simg { height: 1rem; width: auto; }
        .c02h-score { font-weight: 800; color: ${NAVY}; font-size: 1rem; }
        .c02h-rtxt { font-size: 0.83rem; color: #4b5d8a; line-height: 1.4; }
        .c02h-rtxt strong { font-weight: 700; color: ${NAVY}; }

        /* bottom wave */
        .c02h-wave {
          position: absolute; bottom: -1px; left: 0; right: 0;
          height: 60px; z-index: 2;
        }
        .c02h-wave path { fill: #ffffff; }

        @media (max-width: 640px) {
          .c02h-section { padding-top: 7rem; padding-bottom: 5rem; }
          .c02h-bl, .c02h-br { display: none; }
          .c02h-review-divider { display: none; }
          .c02h-h1 { letter-spacing: -0.01em; }
        }
      `}</style>

      <section className="c02h-section" id="uvod" data-template="clean-02-hero">
        <div className="c02h-blends" aria-hidden>
          <img loading="eager" src={BLEND_L} alt="" className="c02h-bl" />
          <img loading="eager" src={BLEND_R} alt="" className="c02h-br" />
        </div>

        <div className="c02h-content">
          <div className="c02h-badge">
            <svg className="c02h-badge-icon" viewBox="0 0 22 21" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
              <rect x="0.5" width="21" height="21" rx="10.5" fill="#F3F9FF"/>
              <path d="M19.1667 10.5C19.1667 11.1475 18.3733 11.6667 18.21 12.2792C18.0467 12.8917 18.4667 13.755 18.1517 14.2917C17.8367 14.8283 16.88 14.9042 16.4367 15.3533C15.9933 15.8025 15.9233 16.7533 15.375 17.0683C14.8267 17.3833 13.975 16.9633 13.3625 17.1267C12.75 17.29 12.2308 18.0833 11.5833 18.0833C10.9358 18.0833 10.4167 17.29 9.83333 17.1267C9.25 16.9633 8.3575 17.3833 7.82083 17.0683C7.28417 16.7533 7.20833 15.7967 6.75917 15.3533C6.31 14.91 5.35917 14.84 5.04417 14.2917C4.72917 13.7433 5.14917 12.8917 4.98583 12.2792C4.8225 11.6667 4 11.1475 4 10.5C4 9.85251 4.79333 9.33334 4.95667 8.75001C5.12 8.16667 4.7 7.27417 5.015 6.73751C5.33 6.20084 6.28667 6.09584 6.73 5.64667C7.17333 5.19751 7.24333 4.24667 7.79167 3.93167C8.34 3.61667 9.19167 4.03667 9.80417 3.87334C10.4167 3.71001 10.9358 2.91667 11.5833 2.91667C12.2308 2.91667 12.75 3.71001 13.3625 3.87334C13.975 4.03667 14.8383 3.61667 15.375 3.93167C15.9117 4.24667 15.9875 5.20334 16.4367 5.64667C16.8858 6.09001 17.8367 6.16001 18.1517 6.70834C18.4667 7.25667 18.0467 8.10834 18.21 8.72084C18.3733 9.33334 19.1667 9.85251 19.1667 10.5Z" fill="#109138"/>
              <circle cx="11.5833" cy="10.5" r="4.9167" fill="#20BF55"/>
              <path d="M11.0775 11.8825C11.02 11.8828 10.9631 11.8716 10.91 11.8495C10.8569 11.8275 10.8088 11.7951 10.7684 11.7542L9.4092 10.4183C9.32727 10.3363 9.28125 10.2251 9.28125 10.1092C9.28125 9.99323 9.32727 9.88203 9.4092 9.8C9.49123 9.71807 9.60243 9.67205 9.71837 9.67205C9.8343 9.67205 9.9455 9.71807 10.0275 9.8L11.0775 10.8383L13.1425 8.8025C13.2253 8.7205 13.3373 8.67474 13.4538 8.67529C13.5703 8.67584 13.6818 8.72264 13.7638 8.80541C13.8458 8.88818 13.8915 9.00014 13.891 9.11664C13.8904 9.23315 13.8436 9.34467 13.7609 9.42666L11.3809 11.76C11.3415 11.8002 11.2942 11.8319 11.242 11.853C11.1898 11.874 11.1338 11.8841 11.0775 11.8825Z" fill="#EDEBEA"/>
            </svg>
            <GenericEditableText sectionId={sectionId} field="badgeText" value={badgeText} tag="span" />
          </div>

          <h1 className="c02h-h1">
            <span className="c02h-shine">Profesionální</span>{" "}
            <span className="c02h-blue">úklidová firma</span>{" "}
            v{" "}
            <span className="c02h-underline">Praze</span>
          </h1>

          <p className="c02h-sub">
            <GenericEditableText sectionId={sectionId} field="subtitle" value={subtitle} tag="span" />
          </p>

          <div className="c02h-btns">
            <a href={resolve(ctaHref)} data-btn="primary" className="c02h-btn1">
              <svg width="14" height="15" viewBox="0 0 14 15" fill="none" aria-hidden>
                <g clipPath="url(#csp)">
                  <path d="M4.129 9.443H4.949C4.949 8.538 5.685 7.802 6.59 7.802V6.982C5.685 6.982 4.949 6.246 4.949 5.341H4.129C4.129 6.246 3.393 6.982 2.488 6.982V7.802C3.393 7.802 4.129 8.538 4.129 9.443Z" fill="currentColor"/>
                  <path d="M1.668 14.365H2.488C2.488 13.46 3.224 12.724 4.129 12.724V11.904C3.224 11.904 2.488 11.168 2.488 10.264H1.668C1.668 11.168 0.905 11.904 0 11.904V12.724C0.905 12.724 1.668 13.46 1.668 14.365Z" fill="currentColor"/>
                </g>
                <defs><clipPath id="csp"><rect width="14" height="14" fill="white" transform="translate(0 0.5)"/></clipPath></defs>
              </svg>
              <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
            </a>
            <a href={resolve(cta2Href)} className="c02h-btn2">
              <GenericEditableText sectionId={sectionId} field="ctaSecondaryText" value={cta2Text} tag="span" />
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </a>
          </div>

          <div className="c02h-review-card">
            <img loading="eager" src={GOOGLE} alt="Google recenze" className="c02h-gimg" />
            <div className="c02h-review-divider" aria-hidden />
            <div className="c02h-stars">
              <img loading="eager" src={STAR} alt="" className="c02h-simg" aria-hidden />
              <span className="c02h-score">5,0</span>
              <img loading="eager" src={STAR} alt="" className="c02h-simg" aria-hidden />
            </div>
            <div className="c02h-review-divider" aria-hidden />
            <span className="c02h-rtxt">
              <GenericEditableText sectionId={sectionId} field="reviewsText" value={String(c.reviewsText ?? `5,0 — Více než ${reviewCount} ověřených recenzí od zákazníků`)} tag="span" />
            </span>
          </div>
        </div>

        {/* bottom wave into next section */}
        <svg className="c02h-wave" viewBox="0 0 1440 60" preserveAspectRatio="none" aria-hidden>
          <path d="M0,30 C360,60 1080,0 1440,30 L1440,60 L0,60 Z"/>
        </svg>
      </section>
    </>
  );
}

// ── garden-02-hero ────────────────────────────────────────────────────────────
// 1:1 polgarden.cz:
// - 100vh fullbleed bg foto (hero-poster.jpg), object-cover
// - rgba(0,0,0,0.45) overlay
// - Centrovaný bílý Inter H1 + subtitle
// - 2 CTA pill tlačítka: zelené (#95c11f) filled + outline bílé
// - Scroll indicator šipka dole
// ─────────────────────────────────────────────────────────────────────────────
function HeroGarden02({
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
  const c = content as {
    title?: string;
    subtitle?: string;
    ctaText?: string;
    ctaHref?: string;
    cta2Text?: string;
    cta2Href?: string;
    backgroundImage?: string;
    videoUrl?: string;
  };

  const bgImage  = c.backgroundImage ?? "/clones/polgarden/img/hero-poster.jpg";
  const videoUrl = c.videoUrl ?? "";
  const title    = c.title    ?? "Návrhy a realizace zahrad Praha a okolí";
  const subtitle = c.subtitle ?? "Zahradní architektura, profesionální realizace a kompletní údržba zahrad v Praze a okolí";
  const ctaText  = c.ctaText  ?? "Zjistit více";
  const ctaHref  = c.ctaHref  ?? "#nabizime";
  const cta2Text = c.cta2Text ?? "Kontaktujte nás";
  const cta2Href = c.cta2Href ?? "/kontakt";

  const PRIMARY = "#95c11f";
  const WHITE   = "#ffffff";

  const videoRef = useRef<HTMLVideoElement>(null);

  const resolve = (href: string) => resolveDemoHref(href, tenantSlug, isAdmin);

  return (
    <>
      <style>{`
        .g02h-section {
          position: relative;
          width: 100%;
          min-height: 100vh;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .g02h-bg {
          position: absolute;
          inset: 0;
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
          z-index: 0;
        }
        .g02h-video {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          z-index: 0;
        }
        .g02h-overlay {
          position: absolute;
          inset: 0;
          background: rgba(0, 0, 0, 0.45);
          z-index: 1;
        }
        .g02h-content {
          position: relative;
          z-index: 2;
          text-align: center;
          padding: 0 1.25rem;
          max-width: 900px;
          width: 100%;
        }
        .g02h-title {
          color: ${WHITE};
          font-family: 'Inter', Arial, sans-serif;
          font-size: clamp(2rem, 5vw, 3.5rem);
          font-weight: 700;
          line-height: 1.15;
          margin: 0 0 1.25rem 0;
          text-shadow: 2px 2px 8px rgba(0,0,0,0.5);
        }
        .g02h-subtitle {
          color: rgba(255,255,255,0.92);
          font-family: 'Inter', Arial, sans-serif;
          font-size: clamp(1rem, 2vw, 1.35rem);
          font-weight: 400;
          line-height: 1.6;
          margin: 0 auto 2rem auto;
          max-width: 680px;
          text-shadow: 1px 1px 4px rgba(0,0,0,0.4);
        }
        .g02h-ctas {
          display: flex;
          flex-wrap: wrap;
          gap: 0.75rem;
          justify-content: center;
        }
        .g02h-btn-primary {
          display: inline-block;
          background: ${PRIMARY};
          color: ${WHITE};
          font-family: 'Inter', Arial, sans-serif;
          font-size: 1rem;
          font-weight: 600;
          text-decoration: none;
          padding: 0.8rem 2rem;
          border-radius: 9999px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          box-shadow: 0 4px 15px rgba(0,0,0,0.25);
          transition: opacity 0.2s, transform 0.2s;
        }
        .g02h-btn-primary:hover { opacity: 0.9; transform: translateY(-2px); }
        .g02h-btn-outline {
          display: inline-block;
          background: rgba(255,255,255,0.12);
          color: ${WHITE};
          font-family: 'Inter', Arial, sans-serif;
          font-size: 1rem;
          font-weight: 600;
          text-decoration: none;
          padding: 0.8rem 2rem;
          border-radius: 9999px;
          border: 2px solid rgba(255,255,255,0.85);
          text-transform: uppercase;
          letter-spacing: 0.5px;
          box-shadow: 0 4px 15px rgba(0,0,0,0.2);
          transition: background 0.2s, transform 0.2s;
        }
        .g02h-btn-outline:hover { background: rgba(255,255,255,0.22); transform: translateY(-2px); }
        .g02h-scroll {
          position: absolute;
          bottom: 1.5rem;
          left: 50%;
          transform: translateX(-50%);
          z-index: 3;
          color: rgba(255,255,255,0.75);
          font-size: 2rem;
          line-height: 1;
          text-decoration: none;
          animation: g02h-bounce 2s infinite;
        }
        @keyframes g02h-bounce {
          0%,100% { transform: translateX(-50%) translateY(0); }
          50% { transform: translateX(-50%) translateY(8px); }
        }
        @media (max-width: 48rem) {
          .g02h-title { font-size: 2rem; }
          .g02h-subtitle { font-size: 1rem; }
          .g02h-btn-primary, .g02h-btn-outline { font-size: 0.9rem; padding: 0.7rem 1.5rem; }
        }
      `}</style>

      <section className="g02h-section">
        {videoUrl ? (
          <video
            ref={videoRef}
            className="g02h-video"
            src={videoUrl}
            autoPlay
            loop
            muted
            playsInline
            poster={bgImage}
          />
        ) : (
          <div
            className="g02h-bg"
            style={{ backgroundImage: `url(${bgImage})` }}
            role="img"
            aria-label={title}
          />
        )}
        <div className="g02h-overlay" />

        <div className="g02h-content">
          <h1 className="g02h-title">
            <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
          </h1>
          <p className="g02h-subtitle">
            <GenericEditableText sectionId={sectionId} field="subtitle" value={subtitle} tag="span" />
          </p>
          <div className="g02h-ctas">
            <a href={resolve(ctaHref)} data-btn="primary" className="g02h-btn-primary">
              <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
            </a>
            <a href={resolve(cta2Href)} className="g02h-btn-outline">
              <GenericEditableText sectionId={sectionId} field="cta2Text" value={cta2Text} tag="span" />
            </a>
          </div>
        </div>

        <a href="#nabizime" className="g02h-scroll" aria-label="Scrollovat dolů">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="10"/>
            <polyline points="8 12 12 16 16 12"/>
          </svg>
        </a>
      </section>
    </>
  );
}

// ── arbo-01-hero ─────────────────────────────────────────────────────────────
// 1:1 lesarb.cz:
// - Starts BELOW the fixed navbar (margin-top = navbar height)
// - Split layout: ~40% text left / ~60% single image right
// - Background #f7f6fd (seamless with navbar scrolled state)
// - H1: dark navy #051d35, bold; green accent bar; green subtitle
// - Right: single image, object-fit cover, full height of section
// - Mobile: stacked, image below text
// ─────────────────────────────────────────────────────────────────────────────
function HeroArbo01({ content, sectionId, tenantSlug, isAdmin }: Omit<Props, "variant">) {
  const title    = String(content.title    ?? "Kompletní péče o stromy s vlastní technikou");
  const subtitle = String(content.subtitle ?? "Rizikové kácení, odborné ořezy a úpravy pozemků v Praze, Středočeském a Jihočeském kraji");

  const rawSlides = (content.slides as Array<{ url: string; alt?: string }>) ?? [];
  const heroImg = rawSlides[0] ?? { url: "/clones/lesarb/site/img-01-desktop.jpg", alt: "Arboristické práce" };

  return (
    <>
      <style>{`
        .arbo01-hero {
          background: #f7f6fd;
          margin-top: 80px;
          min-height: calc(100vh - 80px);
          display: flex;
          align-items: stretch;
          font-family: "AlanSans","Inter",system-ui,sans-serif;
        }
        @media (min-width: 960px) {
          .arbo01-hero {
            margin-top: 110px;
            min-height: calc(100vh - 110px);
          }
        }

        .arbo01-hero-grid {
          display: grid;
          grid-template-columns: 1fr;
          width: 100%;
        }
        @media (min-width: 960px) {
          .arbo01-hero-grid { grid-template-columns: 40% 60%; }
        }

        /* Left: text */
        .arbo01-hero-left {
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 2.5rem 2rem 2.5rem 2.5rem;
          gap: 1.25rem;
        }
        @media (min-width: 1200px) {
          .arbo01-hero-left { padding: 3rem 3rem 3rem 4rem; }
        }

        .arbo01-hero-h1 {
          font-size: clamp(2rem, 3.8vw, 3.6rem);
          font-weight: 700;
          line-height: 1.1;
          color: #051d35;
          margin: 0;
          -webkit-font-smoothing: antialiased;
        }
        .arbo01-hero-accent {
          width: 60px; height: 4px;
          background: #009739;
          border-radius: 2px;
          flex-shrink: 0;
        }
        .arbo01-hero-sub {
          font-size: clamp(0.875rem, 1.2vw, 1rem);
          line-height: 1.6;
          color: #009739;
          margin: 0;
          font-weight: 500;
          max-width: 36ch;
        }

        /* Right: single image */
        .arbo01-hero-right {
          overflow: hidden;
          min-height: 320px;
        }
        .arbo01-hero-right img {
          width: 100%; height: 100%;
          object-fit: cover;
          object-position: center;
          display: block;
        }
      `}</style>

      <section
        className="arbo01-hero"
        id={String(sectionId)}
        data-template="arbo-01-hero"
      >
        <div className="arbo01-hero-grid">
          {/* Left: text */}
          <div className="arbo01-hero-left">
            <h1 className="arbo01-hero-h1">
              <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
            </h1>
            <div className="arbo01-hero-accent" aria-hidden="true" />
            <p className="arbo01-hero-sub">
              <GenericEditableText sectionId={sectionId} field="subtitle" value={subtitle} tag="span" />
            </p>
          </div>

          {/* Right: single image */}
          <div className="arbo01-hero-right">
            <GenericEditableImage sectionId={sectionId} field="slides.0.url" src={heroImg.url} alt={heroImg.alt ?? "Arboristické práce"} style={{}}>
              <img loading="eager" src={heroImg.url} alt={heroImg.alt ?? "Arboristické práce"} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
            </GenericEditableImage>
          </div>
        </div>
      </section>
    </>
  );
}

// ── ddd-01-hero ───────────────────────────────────────────────────────────────
// 1:1 deratizacepraha.com:
// - Fullscreen (min-height: 100svh), navy #064e86 bg + bg foto + gradient overlay
// - Overlay: linear-gradient(180deg,#07294aed,#064e8696 48%,#07294aab)
// - H1: clamp(2rem,2.14vw+1.5714rem,3.5rem), bílá, text-shadow, max-width 100ch, center
// - Subtitle: bílý text, odstavec
// - Scroll-down arrow: animovaný pill border s bílým dot
// ─────────────────────────────────────────────────────────────────────────────
function HeroDdd01({ content, sectionId }: Omit<Props, "variant">) {
  const DARK    = "#064e86";
  const DARKER  = "#07294a";
  const FONT    = "'Figtree', system-ui, sans-serif";

  const title              = String(content.title              ?? "Hubíme nežádoucí hlodavce a hmyz");
  const subtitle           = String(content.subtitle           ?? "Zajišťujeme čistotu a bezpečí vašeho prostředí – profesionální deratizace, dezinsekce a dezinfekce pro váš klid a zdraví. Rychle a diskrétně.");
  const ctaText            = String(content.ctaText            ?? "Nezávazná konzultace");
  const ctaHref            = String(content.ctaHref            ?? "#kontakt");
  const ctaSecondaryText   = String(content.ctaSecondaryText   ?? "Naše služby");
  const ctaSecondaryHref   = String(content.ctaSecondaryHref   ?? "#sluzby");
  const bgImage            = String(content.backgroundImage    ?? "/clones/deratizace/storage/promo/large/f7b3d8c58916308fb8b6e9f3d0cd5b1e.webp");

  return (
    <>
      <style>{`
        .ddd01h-wrap {
          position: relative;
          width: 100%;
          min-height: 100svh;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          background-color: ${DARK};
          font-family: ${FONT};
        }
        .ddd01h-bg {
          position: absolute;
          inset: 0;
          background-image: var(--ddd01h-bg);
          background-size: cover;
          background-position: center 50%;
          background-repeat: no-repeat;
        }
        .ddd01h-overlay {
          position: absolute;
          inset: 0;
          background-image: linear-gradient(180deg, ${DARKER}ed, ${DARK}96 48%, ${DARKER}ab);
        }
        .ddd01h-inner {
          position: relative;
          z-index: 2;
          text-align: center;
          padding: 6rem 1.5rem 5rem;
          max-width: 100ch;
          width: 100%;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .ddd01h-h1 {
          font-size: clamp(2rem, 2.14vw + 1.5714rem, 3.5rem);
          font-weight: 700;
          color: #ffffff;
          text-shadow: 0 0 2px rgba(0,0,0,0.33);
          line-height: 1.27;
          margin: 0 0 1.75rem;
        }
        .ddd01h-text {
          font-size: clamp(1rem, 1.5vw, 1.15rem);
          color: rgba(255,255,255,0.92);
          line-height: 1.65;
          max-width: 640px;
          margin: 0 0 2.5rem;
        }
        .ddd01h-btns {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
          justify-content: center;
          margin-bottom: 3rem;
        }
        .ddd01h-cta {
          display: inline-block;
          background: #0c93eb;
          color: #ffffff;
          text-decoration: none;
          font-weight: 600;
          font-size: 1rem;
          padding: 0.85rem 2.4rem;
          border-radius: 4px;
          transition: background 0.18s;
        }
        .ddd01h-cta:hover { background: #015ba3; }
        .ddd01h-cta-secondary {
          display: inline-block;
          background: transparent;
          color: #ffffff;
          text-decoration: none;
          font-weight: 600;
          font-size: 1rem;
          padding: 0.85rem 2.4rem;
          border-radius: 4px;
          border: 2px solid rgba(255,255,255,0.55);
          transition: border-color 0.18s, background 0.18s;
        }
        .ddd01h-cta-secondary:hover { border-color: #fff; background: rgba(255,255,255,0.1); }
        /* Editable bg image trigger */
        .ddd01h-bg-edit {
          position: absolute;
          inset: 0;
          z-index: 1;
          pointer-events: none;
        }
        .ddd01h-bg-edit img { width: 100%; height: 100%; object-fit: cover; opacity: 0; }
        @media (max-width: 640px) {
          .ddd01h-inner { padding: 4rem 1.25rem 3.5rem; }
          .ddd01h-btns { flex-direction: column; align-items: center; }
          .ddd01h-cta, .ddd01h-cta-secondary { width: 100%; max-width: 300px; text-align: center; }
        }
        /* Animated scroll-down pill */
        @keyframes ddd01h-scroll {
          0%   { transform: translateY(0); opacity: 1; }
          80%  { transform: translateY(16px); opacity: 0; }
          100% { transform: translateY(0); opacity: 0; }
        }
        .ddd01h-arrow {
          display: block;
          width: 3px;
          height: 35px;
          border: 2px solid #ffffff;
          border-radius: 25px;
          padding: 10px 15px;
          box-sizing: content-box;
          opacity: 0.75;
          text-decoration: none;
          position: relative;
        }
        .ddd01h-arrow::before {
          content: "";
          display: block;
          width: 3px;
          height: 10px;
          background: #ffffff;
          border-radius: 25%;
          animation: ddd01h-scroll 2s cubic-bezier(.15,.41,.69,.94) infinite;
        }
      `}</style>

      <section
        className="ddd01h-wrap"
        id="uvod"
        data-template="ddd-01-hero"
        style={{ "--ddd01h-bg": `url('${bgImage}')` } as React.CSSProperties}
      >
        <div className="ddd01h-bg" aria-hidden="true" />
        <div className="ddd01h-overlay" aria-hidden="true" />

        {/* Neviditelný img pro editovatelnost bg obrázku ve studiu */}
        <div className="ddd01h-bg-edit" aria-hidden="true">
          <GenericEditableImage sectionId={sectionId} field="backgroundImage" src={bgImage} alt="" style={{}}>
            <img loading="eager" src={bgImage} alt="" />
          </GenericEditableImage>
        </div>

        <div className="ddd01h-inner">
          <h1 className="ddd01h-h1">
            <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
          </h1>
          <p className="ddd01h-text">
            <GenericEditableText sectionId={sectionId} field="subtitle" value={subtitle} tag="span" />
          </p>
          <div className="ddd01h-btns">
            <a href={ctaHref} data-btn="primary" className="ddd01h-cta">
              <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
            </a>
            <a href={ctaSecondaryHref} className="ddd01h-cta-secondary">
              <GenericEditableText sectionId={sectionId} field="ctaSecondaryText" value={ctaSecondaryText} tag="span" />
            </a>
          </div>
          <a className="ddd01h-arrow" href="#about" aria-label="Přejít dolů" />
        </div>
      </section>
    </>
  );
}

// ── hotel-01-hero ─────────────────────────────────────────────────────────────
function HeroHotel01({ content, sectionId, isAdmin }: { content: Record<string, unknown>; sectionId: number; tenantSlug?: string; isAdmin: boolean }) {
  const c = (content ?? {}) as Record<string, any>;
  const title     = c.title     ?? "Luxusní pobyt v srdci Prahy";
  const subtitle  = c.subtitle  ?? "";
  const ctaText   = c.ctaText   ?? "Rezervujte pobyt";
  const ctaHref   = c.ctaHref   ?? "#kontakt";
  const promoText = c.promoText ?? "";
  const promoHref = c.promoHref ?? "#nabidky";
  const slides: { url: string; alt: string }[] = Array.isArray(c.slides) && c.slides.length > 0
    ? c.slides
    : [{ url: "", alt: "" }];

  const [current, setCurrent] = useState(0);
  const [prev, setPrev]       = useState<number | null>(null);
  const [fading, setFading]   = useState(false);
  const timerRef              = useRef<ReturnType<typeof setTimeout> | null>(null);

  const goTo = useCallback((idx: number) => {
    if (fading) return;
    setPrev(current);
    setCurrent(idx);
    setFading(true);
    setTimeout(() => { setPrev(null); setFading(false); }, 900);
  }, [current, fading]);

  useEffect(() => {
    if (slides.length <= 1) return;
    timerRef.current = setInterval(() => {
      goTo((current + 1) % slides.length);
    }, 5500);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [current, slides.length, goTo]);

  const resolve = (href: string) => (isAdmin ? "#" : href ?? "#");

  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;1,400&family=Poppins:wght@300;400&display=swap" />
      <style>{`        .h01hero {
          position: relative; width: 100%; height: 100vh; min-height: 600px;
          overflow: hidden; background: #2a2520;
        }
        .h01hero-slide {
          position: absolute; inset: 0;
          background-size: cover; background-position: center;
          transition: opacity 0.9s ease;
        }
        .h01hero-slide.active  { opacity: 1; z-index: 2; }
        .h01hero-slide.prev    { opacity: 0; z-index: 3; }
        .h01hero-overlay {
          position: absolute; inset: 0; z-index: 4;
          background: linear-gradient(
            to bottom,
            rgba(30,26,22,0.30) 0%,
            rgba(30,26,22,0.15) 40%,
            rgba(30,26,22,0.55) 100%
          );
        }
        .h01hero-content {
          position: absolute; inset: 0; z-index: 5;
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          text-align: center; padding: 80px 24px 120px;
        }
        .h01hero-title {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: clamp(32px, 5vw, 64px);
          font-weight: 400; color: #fff;
          letter-spacing: 0.03em; line-height: 1.15;
          margin: 0 0 20px; text-shadow: 0 2px 16px rgba(0,0,0,0.45);
          max-width: 820px;
        }
        .h01hero-subtitle {
          font-family: 'Poppins', sans-serif;
          font-size: clamp(13px, 1.8vw, 18px);
          font-weight: 300; color: rgba(255,255,255,0.88);
          letter-spacing: 0.06em; line-height: 1.6;
          margin: 0 0 40px; max-width: 620px;
          text-shadow: 0 1px 8px rgba(0,0,0,0.4);
        }
        .h01hero-cta {
          display: inline-flex; align-items: center; justify-content: center;
          background: #879B32; color: #fff;
          font-family: 'Playfair Display', Georgia, serif;
          font-size: 13px; letter-spacing: 0.18em; text-transform: uppercase;
          padding: 15px 44px; text-decoration: none;
          transition: background 0.2s, transform 0.2s;
          box-shadow: 0 4px 20px rgba(0,0,0,0.25);
        }
        .h01hero-cta:hover { background: #6a7a28; transform: translateY(-1px); }

        /* Dots */
        .h01hero-dots {
          position: absolute; bottom: 80px; left: 50%; transform: translateX(-50%);
          z-index: 6; display: flex; gap: 10px;
        }
        .h01hero-dot {
          width: 8px; height: 8px; border-radius: 50%;
          background: rgba(255,255,255,0.4); border: none; cursor: pointer;
          padding: 0; transition: background 0.3s, transform 0.3s;
        }
        .h01hero-dot.active { background: #a98763; transform: scale(1.3); }

        /* Promo strip */
        .h01hero-promo {
          position: absolute; bottom: 0; left: 0; right: 0; z-index: 6;
          background: rgba(169,135,99,0.92);
          display: flex; align-items: center; justify-content: center;
          height: 50px; gap: 12px;
          font-family: 'Poppins', sans-serif;
          font-size: 13px; letter-spacing: 0.08em;
        }
        .h01hero-promo a {
          color: #fff; text-decoration: none;
          display: flex; align-items: center; gap: 8px;
        }
        .h01hero-promo a:hover { text-decoration: underline; }
        .h01hero-promo-icon {
          display: inline-flex; align-items: center; justify-content: center;
          width: 20px; height: 20px; border: 1.5px solid rgba(255,255,255,0.7);
          border-radius: 50%; font-size: 10px; font-weight: 600; flex-shrink: 0;
        }

        /* Arrows */
        .h01hero-arrow {
          position: absolute; top: 50%; transform: translateY(-50%);
          z-index: 6; background: rgba(0,0,0,0.25); border: none; cursor: pointer;
          width: 44px; height: 44px; display: flex; align-items: center; justify-content: center;
          color: #fff; transition: background 0.2s;
        }
        .h01hero-arrow:hover { background: rgba(169,135,99,0.8); }
        .h01hero-arrow.left  { left: 20px; }
        .h01hero-arrow.right { right: 20px; }

        @media (max-width: 600px) {
          .h01hero-content { padding: 100px 20px 100px; }
          .h01hero-arrow { display: none; }
        }
      `}</style>

      <section className="h01hero" data-template="hotel-01-hero">
        {/* Slides */}
        {slides.map((slide, i) => (
          <GenericEditableImage key={i} sectionId={sectionId} field={`slides.${i}.url`} src={slide.url} alt={slide.alt ?? ""} style={{ position: "absolute", inset: 0 }}>
            <div
              className={`h01hero-slide${i === current ? " active" : ""}${i === prev ? " prev" : ""}`}
              style={{ backgroundImage: `url('${slide.url}')` }}
              aria-hidden={i !== current}
            />
          </GenericEditableImage>
        ))}
        <div className="h01hero-overlay" aria-hidden="true" />

        {/* Content */}
        <div className="h01hero-content">
          <h1 className="h01hero-title">
            <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
          </h1>
          <p className="h01hero-subtitle">
            <GenericEditableText sectionId={sectionId} field="subtitle" value={subtitle} tag="span" />
          </p>
          <a href={resolve(ctaHref)} data-btn="primary" className="h01hero-cta">
            <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
          </a>
        </div>

        {/* Navigation arrows */}
        {slides.length > 1 && (
          <>
            <button
              className="h01hero-arrow left"
              onClick={() => goTo((current - 1 + slides.length) % slides.length)}
              aria-label="Předchozí slide"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
            </button>
            <button
              className="h01hero-arrow right"
              onClick={() => goTo((current + 1) % slides.length)}
              aria-label="Další slide"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
            </button>
          </>
        )}

        {/* Dots */}
        {slides.length > 1 && (
          <div className="h01hero-dots" role="tablist" aria-label="Slides">
            {slides.map((_, i) => (
              <button
                key={i}
                className={`h01hero-dot${i === current ? " active" : ""}`}
                onClick={() => goTo(i)}
                role="tab"
                aria-selected={i === current}
                aria-label={`Slide ${i + 1}`}
              />
            ))}
          </div>
        )}

        {/* Promo strip */}
        {promoText && (
          <div className="h01hero-promo">
            <a href={resolve(promoHref)}>
              <span className="h01hero-promo-icon">%</span>
              <GenericEditableText sectionId={sectionId} field="promoText" value={promoText} tag="span" />
            </a>
          </div>
        )}
      </section>
    </>
  );
}

// ── hotel-02-hero ─────────────────────────────────────────────────────────────
function HeroHotel02({ content, sectionId, isAdmin }: { content: Record<string, unknown>; sectionId: number; tenantSlug?: string; isAdmin: boolean }) {
  const c = (content ?? {}) as Record<string, any>;
  const title    = c.title    ?? "Ideální místo pro práci i relax nedaleko přehrady";
  const subtitle = c.subtitle ?? "Relax Hotel";
  const ctaText  = c.ctaText  ?? "O hotelu";
  const ctaHref  = c.ctaHref  ?? "#o-hotelu";
  const slides: { url: string; alt: string }[] = Array.isArray(c.slides) && c.slides.length > 0
    ? c.slides
    : [{ url: "", alt: "" }];

  const [current, setCurrent] = useState(0);
  const [prev, setPrev]       = useState<number | null>(null);
  const [fading, setFading]   = useState(false);
  const timerRef              = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [guests, setGuests]   = useState(2);

  const today = new Date().toISOString().split("T")[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0];

  const goTo = useCallback((idx: number) => {
    if (fading) return;
    setPrev(current);
    setCurrent(idx);
    setFading(true);
    setTimeout(() => { setPrev(null); setFading(false); }, 900);
  }, [current, fading]);

  useEffect(() => {
    if (slides.length <= 1) return;
    timerRef.current = setInterval(() => {
      goTo((current + 1) % slides.length);
    }, 5000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [current, slides.length, goTo]);

  const resolve = (href: string) => (isAdmin ? "#" : href ?? "#");

  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&family=Montserrat:wght@300;400;500;600&display=swap" />
      <style>{`        .h02hero {
          position: relative; width: 100%; height: 100vh; min-height: 620px;
          overflow: hidden; background: #1a2332;
        }
        .h02hero-slide {
          position: absolute; inset: 0;
          background-size: cover; background-position: center;
          transition: opacity 0.9s ease;
        }
        .h02hero-slide.active { opacity: 1; z-index: 2; }
        .h02hero-slide.prev   { opacity: 0; z-index: 3; }
        .h02hero-overlay {
          position: absolute; inset: 0; z-index: 4;
          background: rgba(0,0,0,0.22);
        }
        .h02hero-content {
          position: absolute; inset: 0; z-index: 5;
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          text-align: center; padding: 80px 24px 200px;
        }
        .h02hero-eyebrow {
          font-family: 'Montserrat', sans-serif;
          font-size: clamp(11px, 1.4vw, 14px);
          font-weight: 400; color: rgba(255,255,255,0.75);
          letter-spacing: 0.28em; text-transform: uppercase;
          margin: 0 0 20px;
        }
        .h02hero-title {
          font-family: 'Cormorant Garamond', Georgia, serif;
          font-size: clamp(36px, 5.5vw, 72px);
          font-weight: 300; font-style: italic;
          color: #fff; line-height: 1.1;
          letter-spacing: 0.01em;
          margin: 0 0 32px;
          text-shadow: 0 2px 20px rgba(0,0,0,0.4);
          max-width: 900px;
        }
        .h02hero-cta {
          display: inline-flex; align-items: center; gap: 10px;
          border: 1.5px solid rgba(255,255,255,0.75);
          color: #fff; background: transparent;
          font-family: 'Montserrat', sans-serif;
          font-size: 11px; font-weight: 500;
          letter-spacing: 0.22em; text-transform: uppercase;
          padding: 14px 36px; text-decoration: none;
          transition: background 0.2s, border-color 0.2s;
        }
        .h02hero-cta:hover {
          background: rgba(255,255,255,0.12);
          border-color: #fff;
        }

        /* Dots */
        .h02hero-dots {
          position: absolute; bottom: 168px; left: 50%; transform: translateX(-50%);
          z-index: 6; display: flex; gap: 8px;
        }
        .h02hero-dot {
          width: 7px; height: 7px; border-radius: 50%;
          background: rgba(255,255,255,0.35); border: none; cursor: pointer; padding: 0;
          transition: background 0.3s, transform 0.3s;
        }
        .h02hero-dot.active { background: #fff; transform: scale(1.35); }

        /* Booking widget */
        .h02hero-booking {
          position: absolute; bottom: 52px; left: 50%; transform: translateX(-50%);
          z-index: 7; display: flex; align-items: stretch;
          background: rgba(26,35,50,0.92); backdrop-filter: blur(8px);
          border: 1px solid rgba(150,161,172,0.25);
          min-width: min(760px, 94vw);
        }
        .h02hero-bfield {
          display: flex; flex-direction: column; justify-content: center;
          padding: 14px 22px; flex: 1; border-right: 1px solid rgba(150,161,172,0.2);
          gap: 3px; min-width: 0;
        }
        .h02hero-bfield:last-of-type { border-right: none; }
        .h02hero-blabel {
          font-family: 'Montserrat', sans-serif;
          font-size: 9px; font-weight: 600;
          letter-spacing: 0.2em; text-transform: uppercase;
          color: #96A1AC;
        }
        .h02hero-bvalue {
          font-family: 'Montserrat', sans-serif;
          font-size: 14px; font-weight: 300; color: #fff;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .h02hero-bdate {
          font-family: 'Montserrat', sans-serif;
          font-size: 14px; font-weight: 300; color: #fff;
          background: transparent; border: none; outline: none;
          cursor: pointer; width: 100%; padding: 0;
          color-scheme: dark;
        }
        .h02hero-bdate::-webkit-calendar-picker-indicator { filter: invert(0.6); }
        .h02hero-guests {
          display: flex; align-items: center; gap: 10px;
        }
        .h02hero-gcounter {
          background: transparent; border: none; color: #96A1AC;
          font-size: 18px; line-height: 1; cursor: pointer; padding: 0 2px;
          font-family: 'Montserrat', sans-serif; font-weight: 300;
          transition: color 0.15s;
        }
        .h02hero-gcounter:hover { color: #fff; }
        .h02hero-gnum {
          font-family: 'Montserrat', sans-serif;
          font-size: 14px; font-weight: 300; color: #fff;
          min-width: 16px; text-align: center;
        }
        .h02hero-submit {
          display: flex; align-items: center; justify-content: center; gap: 10px;
          background: #96A1AC; border: none; cursor: pointer;
          font-family: 'Montserrat', sans-serif;
          font-size: 11px; font-weight: 600;
          letter-spacing: 0.18em; text-transform: uppercase;
          color: #fff; padding: 0 32px;
          transition: background 0.2s;
          white-space: nowrap; min-width: 160px;
          text-decoration: none;
        }
        .h02hero-submit:hover { background: #7a8a96; }

        @media (max-width: 700px) {
          .h02hero-content { padding: 80px 20px 280px; }
          .h02hero-booking {
            flex-direction: column; min-width: 92vw;
            bottom: 16px;
          }
          .h02hero-bfield { border-right: none; border-bottom: 1px solid rgba(150,161,172,0.2); padding: 12px 18px; }
          .h02hero-submit { padding: 18px 24px; min-width: unset; }
          .h02hero-dots { display: none; }
        }
        @media (max-width: 480px) {
          .h02hero-booking { display: none; }
          .h02hero-content { padding: 80px 20px 60px; }
        }
      `}</style>

      <section className="h02hero" data-template="hotel-02-hero">
        {slides.map((slide, i) => (
          <GenericEditableImage key={i} sectionId={sectionId} field={`slides.${i}.url`} src={slide.url} alt={slide.alt ?? ""} style={{ position: "absolute", inset: 0 }}>
            <div
              className={`h02hero-slide${i === current ? " active" : ""}${i === prev ? " prev" : ""}`}
              style={{ backgroundImage: `url('${slide.url}')` }}
              aria-hidden={i !== current}
            />
          </GenericEditableImage>
        ))}
        <div className="h02hero-overlay" aria-hidden="true" />

        <div className="h02hero-content">
          <p className="h02hero-eyebrow">
            <GenericEditableText sectionId={sectionId} field="subtitle" value={subtitle} tag="span" />
          </p>
          <h1 className="h02hero-title">
            <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
          </h1>
          <a href={resolve(ctaHref)} data-btn="primary" className="h02hero-cta">
            <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
            <svg width="16" height="10" viewBox="0 0 16 10" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M1 5h14M10 1l5 4-5 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </a>
        </div>

        {slides.length > 1 && (
          <div className="h02hero-dots" role="tablist" aria-label="Slides">
            {slides.map((_, i) => (
              <button
                key={i}
                className={`h02hero-dot${i === current ? " active" : ""}`}
                onClick={() => goTo(i)}
                role="tab"
                aria-selected={i === current}
                aria-label={`Slide ${i + 1}`}
              />
            ))}
          </div>
        )}

        {/* Booking widget */}
        <div className="h02hero-booking">
          <div className="h02hero-bfield">
            <span className="h02hero-blabel">Příjezd</span>
            <input
              type="date"
              className="h02hero-bdate"
              defaultValue={today}
              aria-label="Datum příjezdu"
            />
          </div>
          <div className="h02hero-bfield">
            <span className="h02hero-blabel">Odjezd</span>
            <input
              type="date"
              className="h02hero-bdate"
              defaultValue={tomorrow}
              aria-label="Datum odjezdu"
            />
          </div>
          <div className="h02hero-bfield">
            <span className="h02hero-blabel">Hosté</span>
            <div className="h02hero-guests">
              <button
                className="h02hero-gcounter"
                onClick={() => setGuests(g => Math.max(1, g - 1))}
                aria-label="Méně hostů"
                type="button"
              >−</button>
              <span className="h02hero-gnum">{guests}</span>
              <button
                className="h02hero-gcounter"
                onClick={() => setGuests(g => Math.min(10, g + 1))}
                aria-label="Více hostů"
                type="button"
              >+</button>
            </div>
          </div>
          <a href={resolve("#kontakt")} className="h02hero-submit">
            Rezervovat
            <svg width="16" height="10" viewBox="0 0 16 10" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M1 5h14M10 1l5 4-5 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </a>
        </div>
      </section>
    </>
  );
}

// ── chalet-01-hero ────────────────────────────────────────────────────────────
function HeroChalet01({ content, sectionId, tenantSlug, isAdmin }: Omit<Props, "variant">) {
  const c = (content ?? {}) as Record<string, any>;
  const title    = String(c.title    ?? "PRONÁJEM CHATY DEMO CHALET V SRDCI KRKONOŠ");
  const subtitle = String(c.subtitle ?? "Demo Chalet je stylová chalupa k pronájmu v Malé Úpě pro rodiny, skupiny i páry.");
  const ctaText  = String(c.ctaText  ?? "VÍCE O UBYTOVÁNÍ");
  const ctaHref  = String(c.ctaHref  ?? "#ubytovani");
  const cta2Text = String(c.cta2Text ?? "REZERVACE");
  const cta2Href = String(c.cta2Href ?? "#rezervace");
  const phone    = String(c.phone    ?? "+420 704 123 456");
  const slides: { url: string; alt: string }[] = Array.isArray(c.slides) && c.slides.length > 0
    ? c.slides
    : [
        { url: "/clones/chaletmilada/images/slideshow/chalet-milada-slide-06.jpg", alt: "Horský chalet v zimě" },
        { url: "/clones/chaletmilada/images/slideshow/chalet-milada-slide-07.jpg", alt: "Horský chalet — výhled na hory" },
      ];

  const [current, setCurrent] = useState(0);
  const [prev, setPrev]       = useState<number | null>(null);
  const [fading, setFading]   = useState(false);
  const timerRef              = useRef<ReturnType<typeof setInterval> | null>(null);

  const BEIGE = "#c0bbad";
  const DARK  = "#1e2329";
  const FONT_H = "'Josefin Sans', system-ui, sans-serif";

  const goTo = useCallback((idx: number) => {
    if (fading) return;
    setPrev(current);
    setCurrent(idx);
    setFading(true);
    setTimeout(() => { setPrev(null); setFading(false); }, 1000);
  }, [current, fading]);

  useEffect(() => {
    if (slides.length <= 1) return;
    timerRef.current = setInterval(() => {
      goTo((current + 1) % slides.length);
    }, 6000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [current, slides.length, goTo]);

  const resolve = (href: string) => {
    if (isAdmin) return "#";
    if (!tenantSlug || href.startsWith("http") || href.startsWith("#")) return href;
    return `/demo/${tenantSlug}${href}`;
  };

  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Josefin+Sans:wght@300;400;600;700&display=swap" />
      <style>{`        .ch01hero {
          position: relative;
          width: 100%;
          height: 100vh;
          min-height: 600px;
          overflow: hidden;
          background: ${DARK};
        }
        .ch01hero-slide {
          position: absolute;
          inset: 0;
          background-size: cover;
          background-position: center center;
          transition: opacity 1s ease;
        }
        .ch01hero-slide.active { opacity: 1; z-index: 1; }
        .ch01hero-slide.prev   { opacity: 0; z-index: 2; }
        .ch01hero-overlay {
          position: absolute;
          inset: 0;
          z-index: 3;
          background:
            linear-gradient(to bottom,  rgba(0,0,0,0.62) 0%, rgba(0,0,0,0.0) 30%),
            linear-gradient(to top,     rgba(0,0,0,0.80) 0%, rgba(0,0,0,0.0) 45%);
        }
        .ch01hero-content {
          position: absolute;
          inset: 0;
          z-index: 4;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: flex-end;
          padding-bottom: 10vh;
          text-align: center;
          padding-left: 1.5rem;
          padding-right: 1.5rem;
        }
        .ch01hero-title {
          font-family: ${FONT_H};
          font-size: clamp(1.5rem, 4vw, 3rem);
          font-weight: 300;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: #ffffff;
          line-height: 1.25;
          margin: 0 0 1rem;
          max-width: 820px;
        }
        .ch01hero-subtitle {
          font-family: ${FONT_H};
          font-size: clamp(0.8rem, 1.4vw, 1rem);
          font-weight: 300;
          letter-spacing: 0.06em;
          color: rgba(255,255,255,0.82);
          line-height: 1.6;
          max-width: 580px;
          margin: 0 0 2rem;
        }
        .ch01hero-ctas {
          display: flex;
          align-items: center;
          gap: 1rem;
          flex-wrap: wrap;
          justify-content: center;
          margin-bottom: 1.5rem;
        }
        .ch01hero-cta-primary {
          display: inline-block;
          padding: 0.75rem 2rem;
          background: transparent;
          border: 1.5px solid #ffffff;
          color: #ffffff;
          font-family: ${FONT_H};
          font-size: 0.72rem;
          font-weight: 600;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          text-decoration: none;
          transition: background 0.25s, color 0.25s;
        }
        .ch01hero-cta-primary:hover {
          background: rgba(255,255,255,0.15);
        }
        .ch01hero-cta-secondary {
          display: inline-block;
          padding: 0.75rem 2rem;
          background: ${BEIGE};
          border: 1.5px solid ${BEIGE};
          color: ${DARK};
          font-family: ${FONT_H};
          font-size: 0.72rem;
          font-weight: 600;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          text-decoration: none;
          transition: background 0.25s, color 0.25s;
        }
        .ch01hero-cta-secondary:hover {
          background: transparent;
          color: ${BEIGE};
        }
        .ch01hero-phone {
          font-family: ${FONT_H};
          font-size: 0.78rem;
          font-weight: 400;
          letter-spacing: 0.1em;
          color: rgba(255,255,255,0.7);
          text-decoration: none;
          transition: color 0.18s;
        }
        .ch01hero-phone:hover { color: #ffffff; }
        .ch01hero-dots {
          position: absolute;
          bottom: 2rem;
          right: 2.5rem;
          z-index: 5;
          display: flex;
          gap: 0.4rem;
        }
        .ch01hero-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: rgba(255,255,255,0.4);
          border: none;
          cursor: pointer;
          padding: 0;
          transition: background 0.2s;
        }
        .ch01hero-dot.active { background: #ffffff; }
        @media (max-width: 640px) {
          .ch01hero-ctas { flex-direction: column; gap: 0.75rem; }
        }
      `}</style>

      <section className="ch01hero" data-template="chalet-01-hero">
        {/* Slides */}
        {slides.map((slide, i) => (
          <GenericEditableImage
            key={i}
            sectionId={sectionId}
            field={`slides.${i}.url`}
            src={slide.url}
            alt={slide.alt ?? ""}
            style={{ position: "absolute", inset: 0 }}
          >
            <div
              className={`ch01hero-slide${i === current ? " active" : i === prev ? " prev" : ""}`}
              style={{ backgroundImage: `url(${slide.url})` }}
              aria-hidden={i !== current}
            />
          </GenericEditableImage>
        ))}

        {/* Gradient overlay */}
        <div className="ch01hero-overlay" aria-hidden />

        {/* Content */}
        <div className="ch01hero-content">
          <h1 className="ch01hero-title">
            <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
          </h1>
          <p className="ch01hero-subtitle">
            <GenericEditableText sectionId={sectionId} field="subtitle" value={subtitle} tag="span" />
          </p>
          <div className="ch01hero-ctas">
            <a href={resolve(ctaHref)} data-btn="primary" className="ch01hero-cta-primary">
              <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
            </a>
            <a href={resolve(cta2Href)} className="ch01hero-cta-secondary">
              <GenericEditableText sectionId={sectionId} field="cta2Text" value={cta2Text} tag="span" />
            </a>
          </div>
          <a href={`tel:${phone.replace(/\s/g,"")}`} className="ch01hero-phone">
            <GenericEditableText sectionId={sectionId} field="phone" value={phone} tag="span" />
          </a>
        </div>

        {/* Slide dots */}
        {slides.length > 1 && (
          <div className="ch01hero-dots">
            {slides.map((_, i) => (
              <button
                key={i}
                className={`ch01hero-dot${i === current ? " active" : ""}`}
                onClick={() => goTo(i)}
                aria-label={`Slide ${i + 1}`}
              />
            ))}
          </div>
        )}
      </section>
    </>
  );
}

// ── malir-02-hero ─────────────────────────────────────────────────────────────
// 1:1 malirstvi-bastar.cz hero:
// - 100vh fullbleed, 3-slide JS crossfade slider (autoplay 4500ms)
// - Tmavý gradient overlay (rgba 0,0,0 0.45)
// - Levý text col (max-width 50%): H2 Poppins 700 bílý + bílý subtitle
// - Oranžový (#ff914d) filled CTA btn
// - Bottom pagination dots (bílé kroužky, aktivní = filled)
// ─────────────────────────────────────────────────────────────────────────────
function HeroMalir02({ content, sectionId, tenantSlug, isAdmin }: Omit<Props, "variant">) {
  const c = content as Record<string, unknown>;
  const [current, setCurrent] = useState(0);

  const ORANGE  = "#ff914d";
  const WHITE   = "#ffffff";
  const POPPINS = "'Poppins', sans-serif";

  type Slide = { image: string; heading: string; subheading: string; ctaLabel: string; ctaHref: string };
  const defaultSlides: Slide[] = [
    { image: "/templates/malir-02/hero-1.jpg", heading: "Váš byt v nových barvách a bez starostí.", subheading: "Malování domů, bytů, garáží i vnějších prostor.", ctaLabel: "Kontaktujte nás", ctaHref: "#kontakty" },
    { image: "/templates/malir-02/hero-2.jpg", heading: "Malířské práce Praha a okolí.", subheading: "Vymalujeme váš byt, dům, nebo komerční prostor. Hezky. Čistě. Bez starostí.", ctaLabel: "Kontaktujte nás", ctaHref: "#kontakty" },
    { image: "/templates/malir-02/hero-3.jpg", heading: "Malba komerčních a nebytových prostor.", subheading: "Vezmeme si na starost malování škol, ordinací, skladů a obchodních prostor.", ctaLabel: "Kontaktujte nás", ctaHref: "#kontakty" },
  ];
  const slides: Slide[] = Array.isArray(c.slides) && (c.slides as unknown[]).length
    ? (c.slides as Slide[])
    : defaultSlides;
  const count = slides.length;

  const resolve = (href: string) => resolveDemoHref(href, tenantSlug, isAdmin);

  useEffect(() => {
    if (count < 2) return;
    const id = setInterval(() => setCurrent((p) => (p + 1) % count), 4500);
    return () => clearInterval(id);
  }, [count]);

  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&family=Roboto:wght@400;500&display=swap" />
      <style>{`        .m02h-slide { position: absolute; inset: 0; opacity: 0; transition: opacity 1.2s ease; }
        .m02h-slide.active { opacity: 1; }
        .m02h-slide img { width: 100%; height: 100%; object-fit: cover; object-position: center; display: block; }
        .m02h-cta {
          display: inline-block; padding: 14px 36px;
          background: ${ORANGE}; color: ${WHITE};
          font-family: ${POPPINS}; font-weight: 600; font-size: 14px;
          text-decoration: none; text-transform: uppercase; letter-spacing: 0.05em;
          border-radius: 3px; border: 2px solid ${ORANGE};
          transition: background 0.2s, color 0.2s;
        }
        .m02h-cta:hover { background: transparent; color: ${WHITE}; }
        .m02h-dot { width: 10px; height: 10px; border-radius: 50%; border: 2px solid ${WHITE}; background: transparent; cursor: pointer; padding: 0; transition: background 0.2s; }
        .m02h-dot.active { background: ${WHITE}; }
        @media (max-width: 767px) {
          .m02h-content { padding-top: 90px !important; padding-left: 20px !important; padding-right: 20px !important; }
          .m02h-heading { font-size: 28px !important; line-height: 38px !important; }
          .m02h-sub { font-size: 15px !important; }
        }
        @media (min-width: 768px) and (max-width: 1023px) {
          .m02h-content { max-width: 70% !important; }
        }
      `}</style>

      <section style={{ position: "relative", height: "100vh", minHeight: 600, background: "#333", overflow: "hidden" }} data-template="malir-02">
        {/* Slides */}
        {slides.map((s, i) => (
          <div key={i} className={`m02h-slide${i === current ? " active" : ""}`}>
            <GenericEditableImage sectionId={sectionId} field={`slides.${i}.image`} src={s.image} alt={s.heading}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img loading="eager" src={s.image} alt={s.heading} />
            </GenericEditableImage>
          </div>
        ))}

        {/* Overlay */}
        <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 1 }} />

        {/* Content */}
        <div className="m02h-content" style={{
          position: "absolute", inset: 0, zIndex: 2,
          display: "flex", flexDirection: "column", justifyContent: "center",
          paddingTop: 72, paddingLeft: "calc((100vw - 1200px) / 2 + 30px)", paddingRight: "5vw",
          maxWidth: "55%", boxSizing: "border-box",
        }}>
          <h2 className="m02h-heading" style={{ fontFamily: POPPINS, fontWeight: 700, fontSize: 44, lineHeight: "54px", color: WHITE, marginBottom: 20 }}>
            <GenericEditableText sectionId={sectionId} field={`slides.${current}.heading`} value={slides[current].heading} tag="span">{slides[current].heading}</GenericEditableText>
          </h2>
          <p className="m02h-sub" style={{ fontFamily: POPPINS, fontWeight: 500, fontSize: 18, color: "rgba(255,255,255,0.90)", marginBottom: 32, lineHeight: "28px" }}>
            <GenericEditableText sectionId={sectionId} field={`slides.${current}.subheading`} value={slides[current].subheading} tag="span">{slides[current].subheading}</GenericEditableText>
          </p>
          <div>
            <a href={resolve(slides[current].ctaHref)} data-btn="primary" className="m02h-cta">
              <GenericEditableText sectionId={sectionId} field={`slides.${current}.ctaLabel`} value={slides[current].ctaLabel} tag="span">{slides[current].ctaLabel}</GenericEditableText>
            </a>
          </div>
        </div>

        {/* Pagination dots */}
        <div style={{ position: "absolute", bottom: 28, left: "50%", transform: "translateX(-50%)", display: "flex", gap: 10, zIndex: 3 }}>
          {slides.map((_, i) => (
            <button key={i} className={`m02h-dot${i === current ? " active" : ""}`} onClick={() => setCurrent(i)} aria-label={`Slide ${i + 1}`} />
          ))}
        </div>
      </section>
    </>
  );
}

// ── events-01-hero ────────────────────────────────────────────────────────────
// Prémiová event-agentura: fullscreen bg + subtle grain + radial vignette,
// gold hairline eyebrow, Playfair display H1 s italic druhou linkou (editorial
// gala swash), purple Video CTA s gold ring hover, secondary ghost link,
// refined scroll indicator (gold hairline + label). Awwwards polish 2026-07-01.
// ─────────────────────────────────────────────────────────────────────────────
function HeroEvents01({ content, sectionId, tenantSlug, isAdmin }: { content: Record<string, unknown>; sectionId: number; tenantSlug?: string; isAdmin: boolean }) {
  const [vidOpen, setVidOpen] = useState(false);
  const PURPLE = "#931789";
  const GOLD   = "#d4b896";

  const eyebrow       = String(content.eyebrow      ?? "Eventová agentura · Praha");
  const title         = String(content.title        ?? "Eventy a akce od");
  const titleLine2    = String(content.titleLine2   ?? "Perfect Events");
  const subtitle      = String(content.subtitle     ?? "");
  const imageUrl      = String(content.imageUrl     ?? "/clones/amdenevents/wp-content/uploads/2018/08/showcase-1920x1000.jpg");
  const videoUrl      = String(content.videoUrl     ?? "");
  const videoText     = String(content.videoText    ?? "Video");
  const ctaLabel      = String(content.ctaLabel     ?? "Prozkoumat portfolio");
  const ctaHref       = String(content.ctaHref      ?? "/portfolio");
  const scrollLabel   = String(content.scrollLabel  ?? "Objevte více");
  const resolve       = (href: string) => resolveDemoHref(href, tenantSlug, isAdmin);

  return (
    <>
      <style>{`
        .ev01-hero {
          position: relative;
          min-height: 100vh;
          overflow: hidden;
          background: #0a0a0a;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .ev01-hero-bg {
          position: absolute;
          inset: 0;
          background-image: url('${imageUrl}');
          background-size: cover;
          background-position: center center;
          transform: scale(1.04);
          animation: ev01heroPan 24s ease-in-out infinite alternate;
        }
        @keyframes ev01heroPan {
          from { transform: scale(1.04) translate(-8px, -6px); }
          to   { transform: scale(1.08) translate(8px, 6px); }
        }
        .ev01-hero-vid {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center;
          z-index: 1;
        }
        .ev01-hero-overlay {
          position: absolute;
          inset: 0;
          background:
            radial-gradient(circle at 50% 45%, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0.62) 65%, rgba(0,0,0,0.82) 100%),
            linear-gradient(180deg, rgba(10,10,10,0.55) 0%, rgba(10,10,10,0.35) 40%, rgba(10,10,10,0.7) 100%);
          z-index: 2;
        }
        .ev01-hero-grain {
          position: absolute;
          inset: 0;
          z-index: 3;
          pointer-events: none;
          opacity: 0.14;
          mix-blend-mode: overlay;
          background-image: url("data:image/svg+xml;utf8,<svg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix type='saturate' values='0'/></filter><rect width='100%' height='100%' filter='url(%23n)' opacity='0.55'/></svg>");
        }
        .ev01-hero-body {
          position: relative;
          z-index: 4;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          padding: 130px 40px 110px;
          width: 100%;
          max-width: 1200px;
        }
        .ev01-hero-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 16px;
          font-family: 'Inter', sans-serif;
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 4px;
          text-transform: uppercase;
          color: ${GOLD};
          margin-bottom: 40px;
          opacity: 0;
          transform: translateY(12px);
          animation: ev01Rise 1s cubic-bezier(.32,.72,0,1) 0.15s forwards;
        }
        .ev01-hero-eyebrow::before,
        .ev01-hero-eyebrow::after {
          content: "";
          display: block;
          width: 44px;
          height: 1px;
          background: linear-gradient(90deg, transparent 0%, ${GOLD} 100%);
        }
        .ev01-hero-eyebrow::after {
          background: linear-gradient(90deg, ${GOLD} 0%, transparent 100%);
        }
        .ev01-hero-h1 {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: clamp(46px, 7.5vw, 100px);
          font-weight: 400;
          color: #ffffff;
          line-height: 1.05;
          letter-spacing: -0.01em;
          margin: 0 0 28px;
          text-shadow: 0 2px 30px rgba(0,0,0,0.4);
          opacity: 0;
          transform: translateY(20px);
          animation: ev01Rise 1.1s cubic-bezier(.32,.72,0,1) 0.35s forwards;
        }
        .ev01-hero-h1-l2 {
          display: block;
          font-style: italic;
          font-weight: 400;
          color: ${GOLD};
        }
        .ev01-hero-sub {
          font-family: 'Inter', sans-serif;
          font-size: clamp(14px, 1.1vw, 16px);
          font-weight: 400;
          color: rgba(255,255,255,0.78);
          line-height: 1.7;
          max-width: 560px;
          margin: 0 auto 44px;
          letter-spacing: 0.2px;
          opacity: 0;
          transform: translateY(14px);
          animation: ev01Rise 1s cubic-bezier(.32,.72,0,1) 0.55s forwards;
        }
        .ev01-hero-actions {
          display: inline-flex;
          align-items: center;
          gap: 32px;
          flex-wrap: wrap;
          justify-content: center;
          opacity: 0;
          transform: translateY(14px);
          animation: ev01Rise 1s cubic-bezier(.32,.72,0,1) 0.75s forwards;
        }
        .ev01-hero-vidbtn {
          position: relative;
          display: inline-flex;
          align-items: center;
          gap: 12px;
          padding: 16px 34px;
          background: ${PURPLE};
          color: #ffffff;
          font-family: 'Inter', sans-serif;
          font-size: 11.5px;
          font-weight: 600;
          letter-spacing: 2.4px;
          text-transform: uppercase;
          border: none;
          cursor: pointer;
          text-decoration: none;
          transition: background 0.4s cubic-bezier(.32,.72,0,1), transform 0.4s cubic-bezier(.32,.72,0,1), box-shadow 0.4s cubic-bezier(.32,.72,0,1);
        }
        .ev01-hero-vidbtn::before {
          content: "";
          position: absolute;
          inset: -4px;
          border: 1px solid rgba(212,184,150,0);
          transition: border-color 0.5s cubic-bezier(.32,.72,0,1);
          pointer-events: none;
        }
        .ev01-hero-vidbtn:hover {
          background: #a5199a;
          transform: translateY(-2px);
          box-shadow: 0 18px 40px -12px rgba(147,23,137,0.6);
        }
        .ev01-hero-vidbtn:hover::before { border-color: rgba(212,184,150,0.65); }
        .ev01-hero-vidbtn svg { transition: transform 0.4s cubic-bezier(.32,.72,0,1); }
        .ev01-hero-vidbtn:hover svg { transform: translateX(2px); }
        .ev01-hero-ghost {
          display: inline-flex;
          align-items: center;
          gap: 12px;
          font-family: 'Playfair Display', Georgia, serif;
          font-style: italic;
          font-size: 16px;
          color: rgba(255,255,255,0.85);
          text-decoration: none;
          transition: color 0.4s cubic-bezier(.32,.72,0,1), gap 0.4s cubic-bezier(.32,.72,0,1);
          padding: 6px 0;
          border-bottom: 1px solid rgba(212,184,150,0.35);
        }
        .ev01-hero-ghost svg { transition: transform 0.4s cubic-bezier(.32,.72,0,1); }
        .ev01-hero-ghost:hover { color: ${GOLD}; gap: 16px; }
        .ev01-hero-ghost:hover svg { transform: translateX(4px); }
        .ev01-hero-arr {
          position: absolute;
          bottom: 36px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 4;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
          opacity: 0;
          animation: ev01ScrollFade 1s cubic-bezier(.32,.72,0,1) 1s forwards;
        }
        .ev01-hero-arr-label {
          font-family: 'Inter', sans-serif;
          font-size: 10px;
          font-weight: 500;
          letter-spacing: 3.5px;
          text-transform: uppercase;
          color: rgba(255,255,255,0.6);
        }
        .ev01-hero-arr-line {
          width: 1px;
          height: 46px;
          background: linear-gradient(180deg, ${GOLD} 0%, transparent 100%);
          position: relative;
          overflow: hidden;
        }
        .ev01-hero-arr-line::after {
          content: "";
          position: absolute;
          top: -46px;
          left: 0;
          width: 1px;
          height: 46px;
          background: linear-gradient(180deg, transparent 0%, #ffffff 50%, transparent 100%);
          animation: ev01scrollLine 2.4s cubic-bezier(.65,0,.35,1) infinite;
        }
        @keyframes ev01scrollLine {
          0%   { top: -46px; }
          100% { top: 46px; }
        }
        @keyframes ev01Rise {
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes ev01ScrollFade {
          to { opacity: 1; }
        }
        .ev01-vid-modal {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.94);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          z-index: 9999;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .ev01-vid-modal-inner {
          position: relative;
          width: 90vw;
          max-width: 960px;
          aspect-ratio: 16/9;
          background: #000;
          box-shadow: 0 40px 80px -20px rgba(0,0,0,0.8), 0 0 0 1px rgba(212,184,150,0.12);
        }
        .ev01-vid-modal-inner video {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }
        .ev01-vid-modal-close {
          position: absolute;
          top: -48px;
          right: 0;
          background: none;
          border: none;
          color: #fff;
          font-size: 28px;
          cursor: pointer;
          line-height: 1;
          transition: color 0.3s;
        }
        .ev01-vid-modal-close:hover { color: ${GOLD}; }
        @media (max-width: 768px) {
          .ev01-hero-body { padding: 100px 24px 90px; }
          .ev01-hero-h1 { font-size: clamp(34px, 9.5vw, 58px); }
          .ev01-hero-eyebrow { font-size: 10px; letter-spacing: 3px; gap: 12px; margin-bottom: 28px; }
          .ev01-hero-eyebrow::before, .ev01-hero-eyebrow::after { width: 28px; }
          .ev01-hero-actions { gap: 22px; }
          .ev01-hero-vidbtn { padding: 14px 26px; }
          .ev01-hero-arr { bottom: 22px; }
        }
        @media (max-width: 480px) {
          .ev01-hero-body { padding: 90px 20px 80px; }
          .ev01-hero-ghost { font-size: 14px; }
        }
      `}</style>
      <section className="ev01-hero" data-template="events-01-hero">
        <GenericEditableBackground sectionId={sectionId} field="imageUrl" value={imageUrl}>
          <div className="ev01-hero-bg" />
        </GenericEditableBackground>
        {videoUrl && (
          <video className="ev01-hero-vid" autoPlay loop muted playsInline>
            <source src={videoUrl} type="video/mp4" />
          </video>
        )}
        <div className="ev01-hero-overlay" />
        <div className="ev01-hero-grain" />
        <div className="ev01-hero-body">
          {eyebrow && (
            <div className="ev01-hero-eyebrow">
              <GenericEditableText sectionId={sectionId} field="eyebrow" value={eyebrow} tag="span">{eyebrow}</GenericEditableText>
            </div>
          )}
          <h1 className="ev01-hero-h1">
            <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span">
              <span>{title}</span>
            </GenericEditableText>
            <span className="ev01-hero-h1-l2">
              <GenericEditableText sectionId={sectionId} field="titleLine2" value={titleLine2} tag="span">
                <span>{titleLine2}</span>
              </GenericEditableText>
            </span>
          </h1>
          {subtitle && (
            <p className="ev01-hero-sub">
              <GenericEditableText sectionId={sectionId} field="subtitle" value={subtitle} tag="span">{subtitle}</GenericEditableText>
            </p>
          )}
          <div className="ev01-hero-actions">
            <button className="ev01-hero-vidbtn" onClick={() => setVidOpen(true)}>
              <svg width="13" height="13" viewBox="0 0 13 13" fill="currentColor"><path d="M2.5 1.5l9 5-9 5V1.5z"/></svg>
              <GenericEditableText sectionId={sectionId} field="videoText" value={videoText} tag="span">{videoText}</GenericEditableText>
            </button>
            {ctaLabel && (
              <a href={resolve(ctaHref)} className="ev01-hero-ghost">
                <GenericEditableText sectionId={sectionId} field="ctaLabel" value={ctaLabel} tag="span">{ctaLabel}</GenericEditableText>
                <svg width="20" height="10" viewBox="0 0 20 10" fill="none" stroke="currentColor" strokeWidth="1"><path d="M0 5h18M14 1l4 4-4 4"/></svg>
              </a>
            )}
          </div>
        </div>
        <div className="ev01-hero-arr">
          <span className="ev01-hero-arr-label">
            <GenericEditableText sectionId={sectionId} field="scrollLabel" value={scrollLabel} tag="span">{scrollLabel}</GenericEditableText>
          </span>
          <div className="ev01-hero-arr-line" />
        </div>
      </section>
      {vidOpen && videoUrl && (
        <div className="ev01-vid-modal" onClick={() => setVidOpen(false)}>
          <div className="ev01-vid-modal-inner" onClick={e => e.stopPropagation()}>
            <button className="ev01-vid-modal-close" onClick={() => setVidOpen(false)}>×</button>
            <video controls autoPlay>
              <source src={videoUrl} type="video/mp4" />
            </video>
          </div>
        </div>
      )}
    </>
  );
}

// ── hero-events-01-page ───────────────────────────────────────────────────────
// Slim page banner pro subpages events-01. Dark bg + optional bg image s dark
// overlay + grain, gold hairline breadcrumb, Playfair italic H1, subtitle,
// gold hairline dividers top+bottom. Cca 360px. Anti-flash safe (reveal inner).
// ─────────────────────────────────────────────────────────────────────────────
function HeroEvents01Page({ content, sectionId, tenantSlug, isAdmin }: { content: Record<string, unknown>; sectionId: number; tenantSlug?: string; isAdmin: boolean }) {
  const GOLD = "#d4b896";
  const title           = String(content.title ?? "Stránka");
  const subtitle        = String(content.subtitle ?? "");
  const breadcrumb      = String(content.breadcrumb ?? "Domů");
  const breadcrumbHref  = String(content.breadcrumbHref ?? "/");
  const currentLabel    = String(content.currentLabel ?? title);
  const imageUrl        = String(content.imageUrl ?? "");
  const resolve         = (href: string) => resolveDemoHref(href, tenantSlug, isAdmin);

  return (
    <>
      <style>{`
        .ev01ph {
          position: relative;
          padding: 170px 40px 90px;
          background: #0a0a0a;
          color: #fff;
          overflow: hidden;
          min-height: 340px;
          display: flex;
          align-items: center;
        }
        .ev01ph-bg {
          position: absolute;
          inset: 0;
          background-size: cover;
          background-position: center;
          transform: scale(1.05);
          animation: ev01phPan 26s ease-in-out infinite alternate;
        }
        @keyframes ev01phPan {
          from { transform: scale(1.05) translate(-6px,-4px); }
          to   { transform: scale(1.08) translate(6px, 4px); }
        }
        .ev01ph-overlay {
          position: absolute;
          inset: 0;
          background:
            radial-gradient(circle at 50% 50%, rgba(0,0,0,0.4) 0%, rgba(10,10,10,0.78) 80%),
            linear-gradient(180deg, rgba(10,10,10,0.5) 0%, rgba(10,10,10,0.7) 100%);
        }
        .ev01ph-grain {
          position: absolute;
          inset: 0;
          pointer-events: none;
          opacity: 0.1;
          mix-blend-mode: overlay;
          background-image: url("data:image/svg+xml;utf8,<svg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix type='saturate' values='0'/></filter><rect width='100%' height='100%' filter='url(%23n)' opacity='0.55'/></svg>");
        }
        .ev01ph::before,
        .ev01ph::after {
          content: "";
          position: absolute;
          left: 0; right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent 0%, rgba(212,184,150,0.28) 50%, transparent 100%);
          z-index: 2;
        }
        .ev01ph::before { top: 76px; }
        .ev01ph::after  { bottom: 0; }
        .ev01ph-inner {
          position: relative;
          z-index: 3;
          max-width: 1240px;
          margin: 0 auto;
          text-align: center;
          width: 100%;
        }
        .ev01ph-crumb {
          display: inline-flex;
          align-items: center;
          gap: 12px;
          font-family: 'Inter', sans-serif;
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 3px;
          text-transform: uppercase;
          color: rgba(255,255,255,0.55);
          margin-bottom: 26px;
          opacity: 0;
          transform: translateY(8px);
          animation: ev01phRise 0.9s cubic-bezier(.32,.72,0,1) 0.15s forwards;
        }
        .ev01ph-crumb a {
          color: ${GOLD};
          text-decoration: none;
          transition: color 0.35s cubic-bezier(.32,.72,0,1);
        }
        .ev01ph-crumb a:hover { color: #f0d9b8; }
        .ev01ph-crumb-sep {
          display: block;
          width: 22px;
          height: 1px;
          background: rgba(212,184,150,0.4);
        }
        .ev01ph-current { color: rgba(255,255,255,0.85); }
        .ev01ph h1 {
          font-family: 'Playfair Display', Georgia, serif;
          font-style: italic;
          font-size: clamp(38px, 5vw, 68px);
          font-weight: 400;
          line-height: 1.1;
          letter-spacing: -0.01em;
          margin: 0 auto;
          max-width: 900px;
          color: #fff;
          text-shadow: 0 2px 30px rgba(0,0,0,0.4);
          opacity: 0;
          transform: translateY(14px);
          animation: ev01phRise 1s cubic-bezier(.32,.72,0,1) 0.3s forwards;
        }
        .ev01ph h1 em {
          font-style: italic;
          color: ${GOLD};
        }
        .ev01ph-sub {
          font-family: 'Inter', sans-serif;
          font-size: 15px;
          color: rgba(255,255,255,0.68);
          line-height: 1.75;
          max-width: 620px;
          margin: 22px auto 0;
          letter-spacing: 0.2px;
          opacity: 0;
          transform: translateY(10px);
          animation: ev01phRise 0.9s cubic-bezier(.32,.72,0,1) 0.45s forwards;
        }
        .ev01ph-rule {
          width: 40px;
          height: 1px;
          background: ${GOLD};
          margin: 30px auto 0;
          opacity: 0;
          animation: ev01phRise 0.9s cubic-bezier(.32,.72,0,1) 0.6s forwards;
        }
        @keyframes ev01phRise { to { opacity: 1; transform: translateY(0); } }
        @media (max-width: 768px) {
          .ev01ph { padding: 130px 24px 70px; min-height: 280px; }
          .ev01ph::before { top: 68px; }
          .ev01ph-crumb { font-size: 10px; letter-spacing: 2.4px; gap: 10px; margin-bottom: 20px; }
          .ev01ph-crumb-sep { width: 16px; }
          .ev01ph h1 { font-size: clamp(28px, 8vw, 42px); }
        }
      `}</style>
      <section className="ev01ph" data-template="hero-events-01-page">
        {imageUrl && (
          <GenericEditableBackground sectionId={sectionId} field="imageUrl" value={imageUrl}>
            <div className="ev01ph-bg" style={{ backgroundImage: `url('${imageUrl}')` }} />
          </GenericEditableBackground>
        )}
        <div className="ev01ph-overlay" />
        <div className="ev01ph-grain" />
        <div className="ev01ph-inner">
          <nav className="ev01ph-crumb" aria-label="Breadcrumb">
            <a href={resolve(breadcrumbHref)}>
              <GenericEditableText sectionId={sectionId} field="breadcrumb" value={breadcrumb} tag="span">{breadcrumb}</GenericEditableText>
            </a>
            <span className="ev01ph-crumb-sep" aria-hidden="true" />
            <span className="ev01ph-current">
              <GenericEditableText sectionId={sectionId} field="currentLabel" value={currentLabel} tag="span">{currentLabel}</GenericEditableText>
            </span>
          </nav>
          <GenericEditableText sectionId={sectionId} field="title" value={title} tag="h1">
            <h1>{title}</h1>
          </GenericEditableText>
          {subtitle && (
            <p className="ev01ph-sub">
              <GenericEditableText sectionId={sectionId} field="subtitle" value={subtitle} tag="span">{subtitle}</GenericEditableText>
            </p>
          )}
          <div className="ev01ph-rule" aria-hidden="true" />
        </div>
      </section>
    </>
  );
}

// ── photo-01-hero ─────────────────────────────────────────────────────────────
// 1:1 zbiralova.cz: 3-per-view centered loop slider + hover zoom/darken + mouse drag
function HeroPhoto01({ content, sectionId, tenantSlug, isAdmin }: { content: Record<string, unknown>; sectionId: number; tenantSlug?: string; isAdmin: boolean }) {
  const title      = String(content.title ?? "Focení, které si užijete");
  const slides     = (content.slides     as Array<{ url: string; alt: string }>) ?? [];
  const categories = (content.categories as Array<{ name: string; description: string; href: string; imageUrl: string }>) ?? [];

  const N        = slides.length;
  const extended = [...slides, ...slides, ...slides]; // 3 copies; start in middle copy

  const [idx, setIdx]           = useState(N);
  const [animated, setAnimated] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const dragStartX  = useRef(0);
  const dragMoving  = useRef(false);

  const startAutoplay = useCallback(() => {
    intervalRef.current = setInterval(() => {
      setAnimated(true);
      setIdx(i => i + 1);
    }, 2000);
  }, []);

  const stopAutoplay = useCallback(() => {
    if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
  }, []);

  useEffect(() => {
    startAutoplay();
    return stopAutoplay;
  }, [startAutoplay, stopAutoplay]);

  // Seamless loop: when entering copy2 jump back to copy1; when entering copy0 jump to copy1
  const onTransitionEnd = useCallback(() => {
    setIdx(i => {
      if (i >= 2 * N) { setAnimated(false); return N + (i - 2 * N); }
      if (i < N)      { setAnimated(false); return N + i; }
      return i;
    });
  }, [N]);

  // Re-enable transition after silent jump
  useEffect(() => {
    if (!animated) {
      const raf = requestAnimationFrame(() => requestAnimationFrame(() => setAnimated(true)));
      return () => cancelAnimationFrame(raf);
    }
  }, [animated]);

  // Mouse drag handlers
  const onMouseDown = useCallback((e: React.MouseEvent) => {
    stopAutoplay();
    setDragging(true);
    dragStartX.current = e.clientX;
    dragMoving.current = false;
    setDragOffset(0);
  }, [stopAutoplay]);

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (!dragging) return;
    const delta = e.clientX - dragStartX.current;
    if (Math.abs(delta) > 3) dragMoving.current = true;
    setDragOffset(delta);
  }, [dragging]);

  const onMouseUp = useCallback(() => {
    if (!dragging) return;
    const delta = dragOffset;
    setDragging(false);
    setDragOffset(0);
    if (Math.abs(delta) > 50) {
      setAnimated(true);
      setIdx(i => delta < 0 ? i + 1 : i - 1);
    }
    startAutoplay();
  }, [dragging, dragOffset, startAutoplay]);

  const onMouseLeave = useCallback(() => {
    if (!dragging) return;
    setDragging(false);
    setDragOffset(0);
    startAutoplay();
  }, [dragging, startAutoplay]);

  // Prevent click-through after a drag
  const onClickCapture = useCallback((e: React.MouseEvent) => {
    if (dragMoving.current) e.stopPropagation();
  }, []);

  const tx = `calc(${-(idx - 1)} * var(--ph01s-w) + ${dragOffset}px)`;

  return (
    <>
      <style>{`
        :root { --ph01s-w: calc(100vw / 3); }
        @media (max-width: 900px) { :root { --ph01s-w: calc(100vw / 2); } }
        .ph01s-outer {
          overflow: hidden;
          width: 100%;
          height: 650px;
          background: #111;
          user-select: none;
        }
        .ph01s-track {
          display: flex;
          height: 100%;
          will-change: transform;
        }
        .ph01s-slide {
          position: relative;
          flex: 0 0 var(--ph01s-w);
          height: 100%;
          overflow: hidden;
        }
        .ph01s-slide img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          pointer-events: none;
          transition: transform 0.45s ease;
        }
        .ph01s-slide::after {
          content: '';
          position: absolute;
          inset: 0;
          background: rgba(0, 0, 0, 0);
          transition: background 0.35s ease;
          pointer-events: none;
        }
        .ph01s-outer:not(.ph01s-dragging) .ph01s-slide:hover img {
          transform: scale(1.07);
        }
        .ph01s-outer:not(.ph01s-dragging) .ph01s-slide:hover::after {
          background: rgba(0, 0, 0, 0.22);
        }
        .ph01hero-band {
          background: #fff;
          padding: 30px 0 0;
        }
        .ph01hero-band-inner {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 24px;
          text-align: center;
        }
        .ph01hero-h1 {
          font-family: Georgia, 'Times New Roman', serif;
          font-size: 35px;
          font-weight: 400;
          color: #1a1a1a;
          margin: 0 0 5px;
          line-height: 1.3;
        }
        .ph01hero-cols {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 24px 48px;
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
          background: #fff;
        }
        .ph01hero-col {
          display: flex;
          flex-direction: column;
          text-decoration: none;
          color: #1a1a1a;
        }
        .ph01hero-col-img {
          position: relative;
          aspect-ratio: 2 / 3;
          overflow: hidden;
          display: block;
          margin-bottom: 5px;
        }
        .ph01hero-col-img img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          transition: transform 0.45s ease;
        }
        .ph01hero-col-img::after {
          content: '';
          position: absolute;
          inset: 0;
          background: rgba(0,0,0,0);
          transition: background 0.35s ease;
          pointer-events: none;
        }
        .ph01hero-col:hover .ph01hero-col-img img { transform: scale(1.07); }
        .ph01hero-col:hover .ph01hero-col-img::after { background: rgba(0,0,0,0.18); }
        .ph01hero-col-name {
          font-family: Georgia, 'Times New Roman', serif;
          font-size: 30px;
          font-weight: 400;
          color: #1a1a1a;
          margin: 0 0 8px;
          text-align: center;
          line-height: 1.3;
        }
        .ph01hero-col-name a {
          color: inherit;
          text-decoration: none;
        }
        .ph01hero-col-name a:hover { text-decoration: underline; }
        .ph01hero-col-desc {
          font-family: 'Inter', system-ui, sans-serif;
          font-size: 13px;
          line-height: 1.6;
          color: #1a1a1a;
          margin: 0;
          text-align: center;
        }
        @media (max-width: 900px) {
          .ph01s-outer { height: 420px; }
          .ph01s-slide { flex: 0 0 calc(100vw / 2); }
          .ph01hero-h1 { font-size: 24px; }
          .ph01hero-cols { grid-template-columns: 1fr; gap: 32px; }
          .ph01hero-col-name { font-size: 22px; }
        }
      `}</style>

      <section data-template="photo-01" id="uvod">
        {slides.length > 0 && (
          <div
            className={`ph01s-outer${dragging ? " ph01s-dragging" : ""}`}
            style={{ cursor: dragging ? "grabbing" : "grab" }}
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUp}
            onMouseLeave={onMouseLeave}
            onClickCapture={onClickCapture}
          >
            <div
              className="ph01s-track"
              style={{
                transform: `translateX(${tx})`,
                transition: animated && !dragging ? "transform 300ms ease" : "none",
              }}
              onTransitionEnd={onTransitionEnd}
            >
              {extended.map((img, i) => (
                <div key={i} className="ph01s-slide">
                  <img
                    src={img.url}
                    alt={img.alt}
                    draggable={false}
                    loading={i >= N - 1 && i <= N + 3 ? "eager" : "lazy"}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* H1 + 3-col category grid — white bg, 1:1 zbiralova.cz layout */}
        <div className="ph01hero-band" style={{ background: "#fff" }}>
          <div className="ph01hero-band-inner">
            <GenericEditableText sectionId={sectionId} field="title" value={title} tag="h1">
              <h1 className="ph01hero-h1">{title}</h1>
            </GenericEditableText>
          </div>
          <div className="ph01hero-cols">
            {categories.map((cat, i) => (
              <div key={i} className="ph01hero-col">
                <div className="ph01hero-col-img">
                  <GenericEditableImage sectionId={sectionId} field={`categories.${i}.imageUrl`} src={cat.imageUrl} alt={cat.name}>
                    <img src={cat.imageUrl} alt={cat.name} loading="lazy" />
                  </GenericEditableImage>
                </div>
                <GenericEditableText sectionId={sectionId} field={`categories.${i}.name`} value={cat.name} tag="h3">
                  <h3 className="ph01hero-col-name">
                    <a href={resolveDemoHref(cat.href, tenantSlug, isAdmin)}>{cat.name}</a>
                  </h3>
                </GenericEditableText>
                <GenericEditableText sectionId={sectionId} field={`categories.${i}.description`} value={cat.description} tag="p">
                  <p className="ph01hero-col-desc">{cat.description}</p>
                </GenericEditableText>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

// ── restaurant-04-hero ────────────────────────────────────────────────────────
// 100vh fullscreen 5-slide crossfade slider, žádný navbar spacer (fixed overlay)
// Auto-play interval 5s, crossfade přechod 1s
// Dark overlay 0.6, centrovaný obsah:
// - červený kicker "ITALSKÁ RESTAURACE PRAHA"
// - Fraunces italic H1 cream (whiteSpace: pre-line)
// - subtitle (PIZZA · TĚSTOVINY · ...)
// - červené filled CTA + outline CTA
// Ref: corleone.cz homepage hero
// ─────────────────────────────────────────────────────────────────────────────
function HeroRestaurant04({ content, sectionId, tenantSlug, isAdmin }: Omit<Props, "variant">) {
  const title    = String(content.title    ?? "V restauraci\nnebo v pohodlí\ndomova?");
  const subtitle = String(content.subtitle ?? "PIZZA · TĚSTOVINY · DOMÁCÍ SPECIALITY · ROZVOZ");
  const ctaText  = String(content.ctaText  ?? "Rezervovat stůl");
  const ctaHref  = String(content.ctaHref  ?? "#kontakt");
  const cta2Text = String((content as any).cta2Text ?? "Objednat si");
  const cta2Href = String((content as any).cta2Href ?? "#objednat");
  const rawSlides = ((content.slides as Array<{ url: string; pos?: string }>) ?? []).filter(s => s?.url);

  const DARK   = "#0d1f0a";
  const RED    = "#c41c1c";
  const RED_DK = "#a01515";
  const CREAM  = "#f5f0e8";
  const SERIF  = "'Fraunces', Georgia, 'Times New Roman', serif";
  const SANS   = "'Nunito Sans', 'Helvetica Neue', Arial, sans-serif";

  const fallback = "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1920&h=1080&fit=crop&fm=webp&q=85";
  const allSlides = rawSlides.length > 0 ? rawSlides : [{ url: fallback, pos: "center center" }];

  const [activeIdx, setActiveIdx] = useState(0);
  const [arrowHov, setArrowHov] = useState<"prev"|"next"|null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const resolve = (href: string) => resolveDemoHref(href, tenantSlug, isAdmin);

  const resetTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (allSlides.length < 2) return;
    timerRef.current = setInterval(() => setActiveIdx(i => (i + 1) % allSlides.length), 5500);
  };

  useEffect(() => {
    resetTimer();
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allSlides.length]);

  const goTo = (idx: number) => {
    setActiveIdx((idx + allSlides.length) % allSlides.length);
    resetTimer();
  };

  const kbKf = `@keyframes r04-kb { from { transform: scale(1); } to { transform: scale(1.09); } }`;

  return (
    <section style={{ position: "relative", width: "100%", height: "100vh", overflow: "hidden", background: DARK }}>
      <style>{kbKf}</style>

      {/* Slides s Ken Burns zoom */}
      {allSlides.map((slide, i) => (
        <div key={i} style={{
          position: "absolute", inset: 0, overflow: "hidden",
          opacity: i === activeIdx ? 1 : 0,
          transition: "opacity 1.1s ease-in-out",
          zIndex: i === activeIdx ? 1 : 0,
        }}>
          <img
            src={slide.url}
            alt=""
            style={{
              width: "100%", height: "100%", objectFit: "cover",
              objectPosition: slide.pos ?? "center center",
              display: "block",
              animation: i === activeIdx ? "r04-kb 8s ease-out forwards" : "none",
            }}
          />
        </div>
      ))}

      {/* Dark overlay */}
      <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.58)", zIndex: 2 }} />

      {/* Červená dekorativní linka vlevo */}
      <div style={{
        position: "absolute", left: "clamp(30px, 5vw, 80px)", top: "50%", transform: "translateY(-50%)",
        width: 3, height: "clamp(60px, 12vh, 120px)", backgroundColor: RED, opacity: 0.7, zIndex: 3,
      }} />

      {/* Šipka vlevo */}
      {allSlides.length > 1 && (
        <button
          onClick={() => goTo(activeIdx - 1)}
          onMouseEnter={() => setArrowHov("prev")}
          onMouseLeave={() => setArrowHov(null)}
          aria-label="Předchozí snímek"
          style={{
            position: "absolute", left: "clamp(16px, 3vw, 48px)", top: "50%", transform: "translateY(-50%)",
            zIndex: 10, width: 48, height: 48, borderRadius: "50%",
            border: `1px solid ${CREAM}55`,
            background: arrowHov === "prev" ? RED : "rgba(0,0,0,0.38)",
            cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
            transition: "background 0.22s", outline: "none",
          }}
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M11 4L6 9L11 14" stroke={CREAM} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      )}

      {/* Šipka vpravo */}
      {allSlides.length > 1 && (
        <button
          onClick={() => goTo(activeIdx + 1)}
          onMouseEnter={() => setArrowHov("next")}
          onMouseLeave={() => setArrowHov(null)}
          aria-label="Další snímek"
          style={{
            position: "absolute", right: "clamp(16px, 3vw, 48px)", top: "50%", transform: "translateY(-50%)",
            zIndex: 10, width: 48, height: 48, borderRadius: "50%",
            border: `1px solid ${CREAM}55`,
            background: arrowHov === "next" ? RED : "rgba(0,0,0,0.38)",
            cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
            transition: "background 0.22s", outline: "none",
          }}
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M7 4L12 9L7 14" stroke={CREAM} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      )}

      {/* Obsah — centrovaný */}
      <div style={{
        position: "relative", zIndex: 5,
        height: "100%", display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        textAlign: "center", padding: "0 clamp(80px, 12vw, 160px)",
      }}>
        {/* Kicker */}
        <p style={{
          fontFamily: SANS, fontSize: "clamp(10px, 1.8vw, 12px)", fontWeight: 700,
          letterSpacing: "0.25em", textTransform: "uppercase",
          color: CREAM, margin: "0 0 24px", lineHeight: 1,
        }}>
          <GenericEditableText sectionId={sectionId} field="kicker" value="ITALSKÁ RESTAURACE PRAHA" tag="span" />
        </p>

        {/* H1 */}
        <h1 style={{
          fontFamily: SERIF, fontSize: "clamp(36px, 6.5vw, 88px)", fontWeight: 400,
          fontStyle: "italic", color: CREAM, margin: "0 0 28px", lineHeight: 1.08,
          whiteSpace: "pre-line", letterSpacing: "0.01em",
          textShadow: "0 2px 24px rgba(0,0,0,0.5)",
        }}>
          <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
        </h1>

        {/* Subtitle */}
        <p style={{
          fontFamily: SANS, fontSize: "clamp(10px, 1.6vw, 12px)", fontWeight: 500,
          letterSpacing: "0.2em", textTransform: "uppercase",
          color: `${CREAM}99`, margin: "0 0 44px", lineHeight: 1,
        }}>
          <GenericEditableText sectionId={sectionId} field="subtitle" value={subtitle} tag="span" />
        </p>

        {/* CTA tlačítka */}
        <div style={{ display: "flex", gap: 14, flexWrap: "wrap", justifyContent: "center" }}>
          <a
            href={resolve(ctaHref)}
            data-btn="primary"
            style={{
              fontFamily: SANS, fontSize: 11, fontWeight: 700, letterSpacing: "0.14em",
              textTransform: "uppercase", color: CREAM, textDecoration: "none",
              padding: "15px 36px", backgroundColor: RED, borderRadius: 2,
              transition: "background-color 0.2s",
            }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = RED_DK)}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = RED)}
          >
            <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
          </a>
          <a
            href={resolve(cta2Href)}
            style={{
              fontFamily: SANS, fontSize: 11, fontWeight: 700, letterSpacing: "0.14em",
              textTransform: "uppercase", color: CREAM, textDecoration: "none",
              padding: "15px 36px", border: `1px solid ${CREAM}77`, borderRadius: 2,
              transition: "border-color 0.2s",
            }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = CREAM)}
            onMouseLeave={e => (e.currentTarget.style.borderColor = `${CREAM}77`)}
          >
            <GenericEditableText sectionId={sectionId} field="cta2Text" value={cta2Text} tag="span" />
          </a>
        </div>
      </div>

      {/* Slide navigace — tečky */}
      {allSlides.length > 1 && (
        <div style={{
          position: "absolute", bottom: 32, left: "50%", transform: "translateX(-50%)",
          display: "flex", gap: 8, zIndex: 10,
        }}>
          {allSlides.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              aria-label={`Snímek ${i + 1}`}
              style={{
                width: i === activeIdx ? 28 : 8, height: 2,
                background: i === activeIdx ? RED : `${CREAM}55`,
                border: "none", cursor: "pointer", padding: 0, borderRadius: 1,
                transition: "width 0.3s, background 0.3s",
              }}
            />
          ))}
        </div>
      )}
    </section>
  );
}

// ── dj-01-hero ────────────────────────────────────────────────────────────────
// LUXE REDESIGN (Neon Nocturne — vasdj.cz Awwwards edition):
// - 100svh (structure preserved) midnight fullscreen s Unsplash DJ WebP bg
// - Layered overlay: dark radial gradient + orange radial glow bottom + noise texture
// - Eyebrow "01 / LIVE SET" JetBrains Mono 0.16em tracking, orange accent square
// - H1: Space Grotesk 700 clamp(2.5rem,7vw,5.5rem) uppercase s kinetic slide-up + variable letter-spacing reveal
// - Subtitle: Inter Tight 400 s fade-in delay
// - Scroll indicator = pulsing waveform 5-bar SVG + JetBrains Mono "SCROLL" label
// ──────────────────────────────────────────────────────────────────────────────
function HeroDj01({ content, sectionId, tenantSlug, isAdmin }: { content: Record<string, unknown>; sectionId: number; tenantSlug?: string; isAdmin: boolean }) {
  const ORANGE = "#f15a24";
  const AMBER  = "#ff8347";
  const WHITE  = "#ffffff";

  const eyebrow  = String(content.eyebrow  ?? "01 / LIVE SET");
  const title    = String(content.title    ?? "Půlnoc patří\nzvuku, který si pamatuješ.");
  const subtitle = String(content.subtitle ?? "Rezidentní DJ tým pro svatby, corporate večery a klubové noci — od prvního beatu do posledního tónu.");
  const ctaHref  = String(content.ctaHref  ?? "#sluzby");
  const bgImage  = String(content.bgImage  ?? "/templates/dj-01/hero-nocturne.webp");

  const resolve = (href: string) => {
    if (tenantSlug && href.startsWith("#")) return `/demo/${tenantSlug}${isAdmin ? "/admin" : ""}${href}`;
    return href;
  };

  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=JetBrains+Mono:wght@400;500;600&family=Inter+Tight:wght@300;400;500&display=swap" />
      <style>{`
        @keyframes dj01h-reveal-up {
          from { opacity: 0; transform: translateY(28px); letter-spacing: 0.14em; }
          to   { opacity: 1; transform: translateY(0);    letter-spacing: 0.02em; }
        }
        @keyframes dj01h-fade-in {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes dj01h-bar-pulse {
          0%,100% { transform: scaleY(0.35); }
          50%     { transform: scaleY(1);    }
        }
        @keyframes dj01h-scroll-nudge {
          0%,100% { transform: translateX(-50%) translateY(0); opacity: 0.85; }
          50%     { transform: translateX(-50%) translateY(6px); opacity: 1; }
        }
        @keyframes dj01h-glow-drift {
          0%,100% { transform: translate(-50%, 40%) scale(1); opacity: 0.55; }
          50%     { transform: translate(-50%, 40%) scale(1.08); opacity: 0.75; }
        }
        .dj01-hero {
          position: relative;
          min-height: 100svh;
          background-color: #08080b;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          overflow: hidden;
          isolation: isolate;
        }
        .dj01-hero-bg-wrap { position: absolute; inset: 0; z-index: 0; overflow: hidden; }
        .dj01-hero-bg {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: 50% 40%;
          transform: scale(1.06);
          filter: grayscale(0.15) contrast(1.05) brightness(0.72);
          animation: dj01h-fade-in 1400ms cubic-bezier(.2,.7,.2,1) both;
        }
        .dj01-hero-overlay {
          position: absolute;
          inset: 0;
          background:
            radial-gradient(120% 80% at 50% 0%, rgba(8,8,11,0.35) 0%, rgba(8,8,11,0.65) 60%, rgba(8,8,11,0.92) 100%),
            linear-gradient(180deg, rgba(8,8,11,0.55) 0%, rgba(8,8,11,0.25) 40%, rgba(8,8,11,0.9) 100%);
          z-index: 1;
        }
        .dj01-hero-glow {
          position: absolute;
          left: 50%; bottom: 0;
          width: 90vw; max-width: 1400px; height: 65vh;
          background: radial-gradient(closest-side, rgba(241,90,36,0.45) 0%, rgba(241,90,36,0.14) 40%, rgba(241,90,36,0) 72%);
          transform: translate(-50%, 40%);
          filter: blur(4px);
          z-index: 1;
          animation: dj01h-glow-drift 8s cubic-bezier(.4,.0,.2,1) infinite;
          pointer-events: none;
        }
        .dj01-hero-noise {
          position: absolute;
          inset: 0;
          z-index: 2;
          opacity: 0.35;
          mix-blend-mode: overlay;
          background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%25' height='100%25' filter='url(%23n)' opacity='0.5'/></svg>");
          pointer-events: none;
        }
        .dj01-hero-inner {
          position: relative;
          z-index: 3;
          padding: 0 1.5rem;
          max-width: 1100px;
          width: 100%;
        }
        .dj01-hero-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 0.75rem;
          font-family: 'JetBrains Mono', ui-monospace, 'SF Mono', Menlo, monospace;
          font-weight: 500;
          font-size: 0.78rem;
          letter-spacing: 0.34em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.7);
          margin: 0 0 2rem;
          animation: dj01h-fade-in 900ms cubic-bezier(.2,.7,.2,1) 120ms both;
        }
        .dj01-hero-eyebrow::before {
          content: "";
          display: inline-block;
          width: 8px; height: 8px;
          background: ${ORANGE};
          box-shadow: 0 0 12px rgba(241,90,36,0.7);
        }
        .dj01-hero-title {
          font-family: 'Space Grotesk', -apple-system, sans-serif;
          font-size: clamp(2.3rem, 6.5vw, 5rem);
          font-weight: 700;
          line-height: 1.02;
          color: ${WHITE};
          text-transform: uppercase;
          margin: 0 0 1.5rem;
          letter-spacing: 0.02em;
          white-space: pre-line;
          animation: dj01h-reveal-up 1100ms cubic-bezier(.2,.7,.2,1) 280ms both;
          text-shadow: 0 2px 40px rgba(0,0,0,0.4);
        }
        .dj01-hero-title .dj01-mark-dot { color: ${ORANGE}; }
        .dj01-hero-subtitle {
          font-family: 'Inter Tight', -apple-system, sans-serif;
          font-size: clamp(1rem, 1.8vw, 1.25rem);
          font-weight: 400;
          line-height: 1.6;
          color: rgba(255,255,255,0.78);
          margin: 0 auto;
          max-width: 640px;
          animation: dj01h-fade-in 900ms cubic-bezier(.2,.7,.2,1) 640ms both;
        }
        .dj01-hero-scroll {
          position: absolute;
          bottom: 2.5rem;
          left: 50%;
          transform: translateX(-50%);
          z-index: 3;
          display: inline-flex;
          flex-direction: column;
          align-items: center;
          gap: 0.85rem;
          text-decoration: none;
          color: rgba(255,255,255,0.75);
          animation: dj01h-scroll-nudge 2.6s cubic-bezier(.4,.0,.2,1) infinite;
          transition: color 240ms cubic-bezier(.2,.7,.2,1);
        }
        .dj01-hero-scroll:hover { color: ${ORANGE}; }
        .dj01-hero-scroll-label {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.7rem;
          font-weight: 500;
          letter-spacing: 0.36em;
          text-transform: uppercase;
        }
        .dj01-hero-wave {
          display: inline-flex;
          align-items: flex-end;
          gap: 4px;
          height: 28px;
        }
        .dj01-hero-wave span {
          display: block;
          width: 3px;
          height: 100%;
          background: linear-gradient(180deg, ${AMBER} 0%, ${ORANGE} 100%);
          transform-origin: bottom center;
          animation: dj01h-bar-pulse 1.2s cubic-bezier(.4,.0,.2,1) infinite;
        }
        .dj01-hero-wave span:nth-child(1) { animation-delay:   0ms; }
        .dj01-hero-wave span:nth-child(2) { animation-delay: 120ms; }
        .dj01-hero-wave span:nth-child(3) { animation-delay: 240ms; }
        .dj01-hero-wave span:nth-child(4) { animation-delay: 360ms; }
        .dj01-hero-wave span:nth-child(5) { animation-delay: 480ms; }
        @media (max-width: 640px) {
          .dj01-hero-inner   { padding: 0 1.25rem; }
          .dj01-hero-eyebrow { font-size: 0.68rem; letter-spacing: 0.28em; margin-bottom: 1.5rem; }
          .dj01-hero-title   { line-height: 1.1; }
          .dj01-hero-scroll  { bottom: 1.75rem; }
          .dj01-hero-wave    { height: 22px; }
        }
        @media (prefers-reduced-motion: reduce) {
          .dj01-hero-bg, .dj01-hero-eyebrow, .dj01-hero-title, .dj01-hero-subtitle,
          .dj01-hero-scroll, .dj01-hero-glow, .dj01-hero-wave span {
            animation: none !important;
          }
          .dj01-hero-title { letter-spacing: 0.02em; opacity: 1; transform: none; }
        }
      `}</style>

      <section className="dj01-hero" data-template="dj-01-hero">
        <div className="dj01-hero-bg-wrap">
          {bgImage && (
            <GenericEditableImage sectionId={sectionId} field="bgImage" src={bgImage} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", zIndex: 0 }}>
              <img src={bgImage} alt="" loading="eager" className="dj01-hero-bg" />
            </GenericEditableImage>
          )}
        </div>
        <div className="dj01-hero-overlay" aria-hidden />
        <div className="dj01-hero-glow" aria-hidden />
        <div className="dj01-hero-noise" aria-hidden />

        <div className="dj01-hero-inner">
          <GenericEditableText sectionId={sectionId} field="eyebrow" value={eyebrow} tag="span" className="dj01-hero-eyebrow">
            {eyebrow}
          </GenericEditableText>
          <GenericEditableText sectionId={sectionId} field="title" value={title} tag="h1" className="dj01-hero-title">
            {title}
          </GenericEditableText>
          <GenericEditableText sectionId={sectionId} field="subtitle" value={subtitle} tag="p" className="dj01-hero-subtitle">
            {subtitle}
          </GenericEditableText>
        </div>

        <a href={resolve(ctaHref)} className="dj01-hero-scroll" aria-label="Přehled setů">
          <span className="dj01-hero-wave" aria-hidden>
            <span /><span /><span /><span /><span />
          </span>
          <span className="dj01-hero-scroll-label">Scroll</span>
        </a>
      </section>
    </>
  );
}

// ── dj-01-hero-page ──────────────────────────────────────────────────────────
// Slim banner hero variant pro podstránky (Neon Nocturne):
// - Height ~360px (auto-scale) — NE fullscreen
// - Midnight bg + subtle orange radial glow bottom + noise
// - Breadcrumb (Domů › [page]) JBM Mono + Space Grotesk H1 + decorative gradient rule
// ──────────────────────────────────────────────────────────────────────────────
function HeroDj01Page({ content, sectionId, tenantSlug, isAdmin }: { content: Record<string, unknown>; sectionId: number; tenantSlug?: string; isAdmin: boolean }) {
  const ORANGE = "#f15a24";
  const AMBER  = "#ff8347";
  const WHITE  = "#ffffff";

  const eyebrow       = String(content.eyebrow       ?? "");
  const title         = String(content.title         ?? "Podstránka");
  const breadcrumb    = String(content.breadcrumb    ?? "Domů");
  const breadcrumbHref= String(content.breadcrumbHref?? "/");

  const resolve = (href: string) => {
    if (tenantSlug && (href === "/" || href.startsWith("#"))) {
      return `/demo/${tenantSlug}${isAdmin ? "/admin" : ""}${href === "/" ? "" : href}`;
    }
    return href;
  };

  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=JetBrains+Mono:wght@400;500&family=Inter+Tight:wght@300;400&display=swap" />
      <style>{`
        @keyframes dj01hp-in { from { opacity: 0; transform: translateY(18px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes dj01hp-grow { from { width: 0; } to { width: 72px; } }
        .dj01-heropage {
          position: relative;
          min-height: 360px;
          background: #08080b;
          padding: 6rem 1.5rem 3.5rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          overflow: hidden;
          isolation: isolate;
          color: ${WHITE};
        }
        .dj01-heropage::before {
          content: "";
          position: absolute;
          left: 50%; bottom: -40%;
          width: 90vw; max-width: 1200px; height: 70vh;
          background: radial-gradient(closest-side, rgba(241,90,36,0.25) 0%, rgba(241,90,36,0.04) 45%, rgba(241,90,36,0) 72%);
          transform: translateX(-50%);
          z-index: 0; pointer-events: none;
        }
        .dj01-heropage::after {
          content: "";
          position: absolute;
          inset: 0;
          background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%25' height='100%25' filter='url(%23n)' opacity='0.4'/></svg>");
          opacity: 0.2;
          mix-blend-mode: overlay;
          z-index: 1;
          pointer-events: none;
        }
        .dj01-heropage-inner {
          position: relative;
          z-index: 2;
          max-width: 900px;
        }
        .dj01-heropage-crumb {
          display: inline-flex;
          align-items: center;
          gap: 0.65rem;
          font-family: 'JetBrains Mono', ui-monospace, monospace;
          font-weight: 500;
          font-size: 0.72rem;
          letter-spacing: 0.28em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.55);
          margin: 0 0 1.5rem;
          animation: dj01hp-in 700ms cubic-bezier(.2,.7,.2,1) 60ms both;
        }
        .dj01-heropage-crumb a {
          color: rgba(255,255,255,0.7);
          text-decoration: none;
          transition: color 260ms cubic-bezier(.2,.7,.2,1);
        }
        .dj01-heropage-crumb a:hover { color: ${ORANGE}; }
        .dj01-heropage-crumb-sep {
          display: inline-block;
          width: 4px; height: 4px;
          background: ${ORANGE};
          border-radius: 0;
          box-shadow: 0 0 8px rgba(241,90,36,0.5);
        }
        .dj01-heropage-crumb-current { color: ${WHITE}; }
        .dj01-heropage-eyebrow {
          display: block;
          font-family: 'JetBrains Mono', monospace;
          font-weight: 500;
          font-size: 0.7rem;
          letter-spacing: 0.34em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.5);
          margin: 0 0 0.9rem;
          animation: dj01hp-in 700ms cubic-bezier(.2,.7,.2,1) 120ms both;
        }
        .dj01-heropage-title {
          font-family: 'Space Grotesk', -apple-system, sans-serif;
          font-size: clamp(2rem, 5vw, 3.8rem);
          font-weight: 700;
          line-height: 1.05;
          color: ${WHITE};
          text-transform: uppercase;
          margin: 0 0 1.5rem;
          letter-spacing: 0.02em;
          animation: dj01hp-in 900ms cubic-bezier(.2,.7,.2,1) 200ms both;
        }
        .dj01-heropage-rule {
          display: inline-block;
          width: 72px;
          height: 2px;
          background: linear-gradient(90deg, ${ORANGE} 0%, ${AMBER} 100%);
          animation: dj01hp-grow 700ms cubic-bezier(.2,.7,.2,1) 340ms both;
        }
        @media (max-width: 640px) {
          .dj01-heropage { min-height: 300px; padding: 5rem 1.25rem 2.75rem; }
          .dj01-heropage-crumb { font-size: 0.66rem; letter-spacing: 0.22em; }
          .dj01-heropage-title { line-height: 1.12; }
        }
        @media (prefers-reduced-motion: reduce) {
          .dj01-heropage-crumb, .dj01-heropage-eyebrow, .dj01-heropage-title, .dj01-heropage-rule {
            animation: none !important; opacity: 1 !important; transform: none !important;
          }
        }
      `}</style>

      <section className="dj01-heropage" data-template="dj-01-hero-page">
        <div className="dj01-heropage-inner">
          <div className="dj01-heropage-crumb">
            <a href={resolve(breadcrumbHref)}>
              <GenericEditableText sectionId={sectionId} field="breadcrumb" value={breadcrumb} tag="span">
                {breadcrumb}
              </GenericEditableText>
            </a>
            <span className="dj01-heropage-crumb-sep" aria-hidden />
            <span className="dj01-heropage-crumb-current">{title}</span>
          </div>
          {eyebrow && (
            <GenericEditableText sectionId={sectionId} field="eyebrow" value={eyebrow} tag="span" className="dj01-heropage-eyebrow">
              {eyebrow}
            </GenericEditableText>
          )}
          <GenericEditableText sectionId={sectionId} field="title" value={title} tag="h1" className="dj01-heropage-title">
            {title}
          </GenericEditableText>
          <div><span className="dj01-heropage-rule" /></div>
        </div>
      </section>
    </>
  );
}

/* ─────────────────────────────────────────────
   video-01-hero  — 1:1 honzakamenar.cz
   Full-width photo 700px → dark quote box at
   bottom aligned to 980px content grid →
   white text block: H1 Playfair + subtitle
   Inter 200 + gold CTA with arrow
───────────────────────────────────────────── */
function HeroVideo01({ content, sectionId, isAdmin }: {
  content: Record<string, unknown>;
  sectionId: number;
  tenantSlug?: string;
  isAdmin: boolean;
}) {
  const c = content as {
    title?: string; quote?: string; subtitle?: string; body?: string;
    ctaText?: string; ctaHref?: string; imageUrl?: string; imageAlt?: string;
  };
  const title    = c.title    ?? "Svatební filmy\no vztazích, citech a lidech";
  const quote    = c.quote    ?? "Každý pár má svůj humor, svůj rytmus a svou křehkost";
  const subtitle = c.subtitle ?? "Točím svatby tak, jak se opravdu žijí — bez přepychu a stylizace. Záleží mi na intimních okamžicích.";
  const body     = c.body     ?? "";
  const ctaText  = c.ctaText  ?? "Dostupnost termínu";
  const ctaHref  = c.ctaHref  ?? "#kontakt";
  const imageUrl = c.imageUrl ?? "";
  const imageAlt = c.imageAlt ?? "";

  return (
    <section id={String(sectionId)} style={{ background: "#ffffff" }}>
      <style>{`
        /* photo max 1246px centered = 980px content + 133px each side */
        .vd01h-photo-outer {
          padding: 0 max(0px, calc((100% - 1246px) / 2));
        }
        .vd01h-photo {
          position: relative;
          width: 100%;
          height: 700px;
          overflow: hidden;
        }
        .vd01h-photo img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center 25%;
          display: block;
        }

        /* quote: per-line inline highlight — text flows, each line gets own dark bg */
        .vd01h-quote-row {
          position: absolute;
          bottom: 64px;
          left: 133px;
          right: 0;
          max-width: 620px;
          line-height: 0;
        }
        .vd01h-quote-label {
          font-family: 'Playfair Display', Georgia, serif;
          font-style: italic;
          font-weight: 400;
          font-size: 28px;
          color: #F5F0EA;
          /* inline so background wraps each line individually */
          display: inline;
          background-color: #2E2A28;
          line-height: 1.65;
          /* tight horizontal padding per line */
          padding: 2px 10px;
          -webkit-box-decoration-break: clone;
          box-decoration-break: clone;
        }

        .vd01h-text {
          max-width: 980px;
          margin: 0 auto;
          padding: 56px 24px 72px;
          text-align: center;
        }
        .vd01h-title {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: 39px;
          font-weight: 500;
          color: #3A2E2A;
          line-height: 1.25;
          white-space: pre-line;
          max-width: 720px;
          margin: 0 auto 22px;
        }
        .vd01h-sub {
          font-family: 'Inter', system-ui, sans-serif;
          font-size: 20px;
          font-weight: 200;
          color: #6b6560;
          line-height: 1.6;
          max-width: 560px;
          margin: 0 auto 38px;
        }
        .vd01h-cta {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          background: #C49A6C;
          color: #fff;
          font-family: 'Inter', system-ui, sans-serif;
          font-size: 15px;
          font-weight: 400;
          letter-spacing: 0.04em;
          text-decoration: none;
          padding: 0 32px;
          height: 43px;
          border-radius: 0;
          transition: background 0.2s;
          min-width: 298px;
          justify-content: center;
          box-sizing: border-box;
        }
        .vd01h-cta:hover { background: #B68759; }
        @media (max-width: 1280px) {
          .vd01h-photo-outer { padding: 0; }
          .vd01h-quote-row   { left: 24px; }
        }
        @media (max-width: 768px) {
          .vd01h-photo       { height: 360px; }
          .vd01h-quote-label { font-size: 18px; }
          .vd01h-quote-row   { bottom: 20px; max-width: calc(100% - 48px); }
          .vd01h-title       { font-size: 24px; white-space: normal; }
          .vd01h-sub         { font-size: 16px; }
          .vd01h-cta         { min-width: 0; width: 100%; }
          .vd01h-text        { padding: 36px 20px 52px; }
        }
      `}</style>

      <div className="vd01h-photo-outer">
        <div className="vd01h-photo">
          {imageUrl && (isAdmin
            ? <GenericEditableImage sectionId={sectionId} field="imageUrl" src={imageUrl} alt={imageAlt}><img loading="eager" src={imageUrl} alt={imageAlt} /></GenericEditableImage>
            : <img loading="eager" src={imageUrl} alt={imageAlt} />)}
          {/* inline per-line highlight — br forces two-line split, each line gets own dark bg */}
          <div className="vd01h-quote-row">
            {(() => {
              const commaIdx = quote.indexOf(", ");
              const line1 = commaIdx > -1 ? quote.slice(0, commaIdx + 1) : quote;
              const line2 = commaIdx > -1 ? quote.slice(commaIdx + 2) : "";
              return (
                <span className="vd01h-quote-label">
                  {isAdmin
                    ? <GenericEditableText sectionId={sectionId} field="quote" value={quote} tag="span" />
                    : <>{`„${line1}`}<br />{line2 ? `${line2}"` : ""}</>}
                </span>
              );
            })()}
          </div>
        </div>
      </div>

      <div className="vd01h-text">
        <h1 className="vd01h-title">
          {isAdmin
            ? <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
            : title}
        </h1>
        <p className="vd01h-sub">
          {isAdmin
            ? <GenericEditableText sectionId={sectionId} field="subtitle" value={subtitle} tag="span" />
            : subtitle}
        </p>
        {body && (
          <p style={{ color: "#6b6560", fontFamily: "'Inter',sans-serif", fontWeight: 300, fontSize: 16, maxWidth: 560, margin: "0 auto 32px" }}>
            {isAdmin
              ? <GenericEditableText sectionId={sectionId} field="body" value={body} tag="span" />
              : body}
          </p>
        )}
        <a href={ctaHref} data-btn="primary" className="vd01h-cta">
          {isAdmin
            ? <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
            : <span>{ctaText}</span>}
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 8h10M9 4l4 4-4 4" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </a>
      </div>
    </section>
  );
}
