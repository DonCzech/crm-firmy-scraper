"use client";

import { useRef, useEffect, useState } from "react";
import Image from "next/image";
import { GenericEditableText } from "@/components/tenant/GenericEditableText";
import { GenericEditableImage } from "@/components/tenant/GenericEditableImage";
import { GenericEditableBackground } from "@/components/tenant/GenericEditableBackground";
import { shouldSkipNextImageOptimization } from "@/lib/image-source";

interface CtaContent {
  title?: string;
  subtitle?: string;
  ctaText?: string;
  ctaHref?: string;
  bookingUrl?: string;
  bookingEnabled?: boolean;
}

interface Props {
  content: Record<string, unknown>;
  variant: string;
  isAdmin: boolean;
  tenantSlug?: string;
  sectionId: number;
}

export function CtaSection({ content, variant, isAdmin, tenantSlug, sectionId }: Props) {
  if (variant === "eshop-05-club") return <CtaEshop05Club content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;
  if (variant === "eshop-05-newsletter") return <CtaEshop05Newsletter content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;
  if (variant === "eshop-08-newsletter") return <CtaEshop08Newsletter content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;
  if (variant === "eshop-08-studio") return <CtaEshop08Studio content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;
  if (variant === "eshop-02-cta") return <CtaEshop02 content={content} sectionId={sectionId} />;
  if (variant === "eshop-03-banner") return <BannerEshop03 content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;
  if (variant === "eshop-04-banner") return <BannerEshop04 content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;
  const c = content as CtaContent & { body?: string; image?: string };

  if (variant === "elektro-01-cta-form") return <CtaElektro01 content={content} sectionId={sectionId} />;
  if (variant === "stavba-01-cta") return <CtaStavba01 content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;
  if (variant === "rekonstrukce-01-cta") return <CtaRekonstrukce01 content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;
  if (variant === "instala-01-cta") return <CtaInstala01 content={content} sectionId={sectionId} />;
  if (variant === "stavba-03-cta") return <CtaStavba03 content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;
  if (variant === "nails-01-cta")        return <CtaNails01 content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;
  if (variant === "clinic-02-cta")       return <CtaClinic02 content={content} sectionId={sectionId} />;
  if (variant === "fyzio-01-cta-booking") return <CtaFyzio01 content={content} sectionId={sectionId} />;
  if (variant === "fyzio-02-cta-booking") return <CtaFyzio02 content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;
  if (variant === "restaurant-01-cta")    return <CtaRestaurant01 content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;
  if (variant === "restaurant-02-cta")    return <CtaRestaurant02 content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;
  if (variant === "restaurant-03-cta")    return <CtaRestaurant03 content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;
  if (variant === "cafe-02-cta")          return <CtaCafe02 content={content} sectionId={sectionId} />;
  if (variant === "cafe-03-cta")          return <CtaCafe03 content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;
  if (variant === "cafe-04-newsletter")   return <NewsletterCafe04 content={content} sectionId={sectionId} />;
  if (variant === "lawyer-01-cta")        return <CtaLawyer01 content={content} sectionId={sectionId} />;
  if (variant === "lang-01-cta")          return <CtaLang01 content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;
  if (variant === "reality-01-cta")       return <CtaReality01 content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;
  if (variant === "reality-02-cta")       return <CtaReality02 content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;
  if (variant === "reality-04-hotline")   return <HotlineReality04 content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;
  if (variant === "kids-01-cta")          return <CtaKids01 content={content} sectionId={sectionId} />;
  if (variant === "solar-01-cta")         return <CtaSolar01 content={content} sectionId={sectionId} />;
  if (variant === "clean-01-cta")         return <CtaClean01 content={content} sectionId={sectionId} />;
  if (variant === "clean-02-cta")         return <CtaClean02 content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;
  if (variant === "garden-02-cta")        return <CtaGarden02 content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;
  if (variant === "ddd-01-cta")           return <CtaDdd01     content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;
  if (variant === "chalet-01-cta")        return <CtaChalet01  content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;
  if (variant === "photo-01-cta")         return <CtaPhoto01   content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;
  if (variant === "events-01-cta")        return <CtaEvents01  content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;
  if (variant === "restaurant-04-cta")    return <CtaRestaurant04 content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;
  if (variant === "video-01-cta")         return <CtaVideo01      content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;

  // hair-04: žlutý bar, text vlevo, tmavé pill tlačítko s telefonem vpravo — 1:1 kim-impressive.cz
  if (variant === "hair-04-cta-phone") {
    const title     = String((content as Record<string,unknown>).title ?? "Nechcete čekat? Zkuste nám zavolat");
    const phone     = String((content as Record<string,unknown>).phone ?? "704 123 456");
    const phoneHref = String((content as Record<string,unknown>).phoneHref ?? "tel:+420704123456");
    const GOLD      = "#FFDF25";
    const DARK      = "#0d0d0d";
    const LATO      = "'Lato', sans-serif";

    return (
      <>
      <style>{`
        @media (max-width: 640px) {
          [data-template="hair-04"] .h04-cta-phone-wrap {
            flex-direction: column !important;
            align-items: center !important;
            text-align: center !important;
            padding: 28px 24px !important;
            gap: 20px !important;
          }
          [data-template="hair-04"] .h04-cta-phone-btn {
            width: 100% !important;
            text-align: center !important;
            padding: 18px 24px !important;
          }
        }
      `}</style>
      <section
        data-template="hair-04"
        style={{ backgroundColor: GOLD, padding: "0 clamp(20px, 8vw, 140px)" }}
      >
        <div
          className="h04-cta-phone-wrap"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            minHeight: 110,
            gap: 32,
          }}
        >
          <GenericEditableText
            sectionId={sectionId}
            field="title"
            value={title}
            tag="p"
            style={{
              fontFamily: LATO,
              fontSize: "clamp(18px, 2vw, 26px)",
              fontWeight: 400,
              color: DARK,
              margin: 0,
              lineHeight: 1.3,
            }}
          />
          <a
            href={phoneHref}
            className="h04-cta-phone-btn"
            style={{
              fontFamily: LATO,
              fontSize: "clamp(16px, 1.5vw, 20px)",
              fontWeight: 500,
              color: GOLD,
              backgroundColor: DARK,
              borderRadius: 50,
              padding: "16px 36px",
              textDecoration: "none",
              whiteSpace: "nowrap",
              flexShrink: 0,
              transition: "background 0.2s, color 0.2s",
              display: "block",
            }}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = "#222"; }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = DARK; }}
          >
            <GenericEditableText sectionId={sectionId} field="phone" value={phone} tag="span" />
          </a>
        </div>
      </section>
      </>
    );
  }

  // beauty-01 — Sand-Cream Editorial Wellness CTA
  // Full-bleed photo + dark gradient overlay, eyebrow mono + Fahkwang title + italic sand accent,
  // dual CTA (filled sand book + ghost-underline phone). 48px sand hairline divider.
  if (variant === "cta-beauty-01") {
    const cc = content as Record<string, unknown>;
    const bg       = String(cc.backgroundImage ?? "");
    const eyebrowRaw  = cc.eyebrow;
    const eyebrow   = eyebrowRaw === undefined ? "Rezervace" : String(eyebrowRaw);
    const title    = String(c.title    ?? "Péče, na kterou se těší.");
    const titleIta = String(cc.titleItalic ?? "Začněte ještě dnes.");
    const subtitle = String(c.subtitle ?? "Najděte si volný termín během chvilky. Pokud nenajdete to, co hledáte, zavolejte.");
    const ctaText  = String(c.ctaText  ?? "Rezervovat termín");
    const ctaHref  = String(c.ctaHref  ?? "/rezervace");
    const secText  = String(cc.secondaryText ?? "Zavolat");
    const secHref  = String(cc.secondaryHref ?? "tel:+420775321654");
    const FONT     = "'Fahkwang', Georgia, serif";
    const SANS     = "var(--font-overpass), 'Overpass', Inter, system-ui, sans-serif";
    const MONO     = "var(--font-overpass-mono), 'Overpass Mono', Menlo, monospace";
    const SAND     = "#E0BE9A";
    const INK      = "#1F1F1F";
    const resolvedCta = tenantSlug && ctaHref.startsWith("/")
      ? `/demo/${tenantSlug}${isAdmin ? "/admin" : ""}${ctaHref}` : ctaHref;
    const resolvedSec = tenantSlug && secHref.startsWith("/")
      ? `/demo/${tenantSlug}${isAdmin ? "/admin" : ""}${secHref}` : secHref;
    return (
      <section
        id="rezervace"
        className="relative flex items-center justify-center overflow-hidden"
        style={{ minHeight: 560, backgroundColor: "#2a2520" }}
        data-template="beauty-01"
      >
        {bg && (
          <Image
            src={bg}
            alt=""
            fill
            className="object-cover object-center"
            sizes="100vw"
            priority={false}
            unoptimized={shouldSkipNextImageOptimization(bg)}
          />
        )}
        <div aria-hidden className="absolute inset-0 z-[1]" style={{
          background: "linear-gradient(180deg, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.55) 100%)",
        }} />

        <div className="relative z-[2] text-center" style={{
          padding: "clamp(72px, 9vw, 120px) clamp(24px, 5vw, 64px)",
          maxWidth: 880,
        }}>
          {eyebrow.trim() && (
            <span style={{
              display: "inline-block",
              fontFamily: MONO, fontSize: 11, letterSpacing: "0.30em",
              textTransform: "uppercase", color: "rgba(255,255,255,0.75)",
              marginBottom: 24,
            }}>
              <GenericEditableText sectionId={sectionId} field="eyebrow" value={eyebrow} tag="span" />
            </span>
          )}
          <h2 style={{
            margin: 0,
            fontFamily: FONT, fontWeight: 500,
            fontSize: "clamp(32px, 5.5vw, 64px)",
            lineHeight: 1.1, letterSpacing: "0.01em",
            color: "#ffffff",
            whiteSpace: "pre-line",
            textShadow: "0 2px 24px rgba(0,0,0,0.3)",
          }}>
            <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
          </h2>
          {titleIta.trim() && (
            <p style={{
              margin: "8px 0 0",
              fontFamily: FONT, fontStyle: "italic",
              fontSize: "clamp(28px, 5vw, 56px)",
              fontWeight: 400,
              color: SAND, lineHeight: 1.1,
              letterSpacing: "0.01em",
              textShadow: "0 2px 18px rgba(0,0,0,0.25)",
            }}>
              <GenericEditableText sectionId={sectionId} field="titleItalic" value={titleIta} tag="span" />
            </p>
          )}
          <span aria-hidden="true" style={{
            display: "block", width: 48, height: 1,
            backgroundColor: "rgba(224,190,154,0.7)",
            margin: "32px auto 24px",
          }} />
          {subtitle && (
            <p style={{
              margin: "0 auto",
              fontFamily: SANS, fontWeight: 300,
              fontSize: "clamp(14px, 1.3vw, 17px)",
              color: "rgba(255,255,255,0.85)",
              lineHeight: 1.7, maxWidth: 580,
            }}>
              <GenericEditableText sectionId={sectionId} field="subtitle" value={subtitle} tag="span" />
            </p>
          )}
          <div className="b01-cta-actions" style={{
            marginTop: 36,
            display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "center",
            gap: 24,
          }}>
            {ctaText && (
              <a
                href={resolvedCta}
                data-btn="primary"
                className="b01-cta-primary inline-flex items-center"
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
                <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
                <span aria-hidden="true" className="b01-cta-arrow" style={{ marginLeft: 12, transition: "transform 0.3s ease" }}>→</span>
              </a>
            )}
            {secText && (
              <a
                href={resolvedSec}
                className="b01-cta-sec inline-flex items-center gap-2"
                style={{
                  fontFamily: FONT, fontSize: 12, fontWeight: 500,
                  letterSpacing: "0.22em", textTransform: "uppercase",
                  color: "#ffffff", textDecoration: "none",
                  paddingBottom: 4,
                  borderBottom: "1px solid rgba(255,255,255,0.4)",
                  transition: "color 0.3s ease, border-color 0.3s ease",
                }}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2A19.79 19.79 0 0 1 2.08 4.18 2 2 0 0 1 4.06 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                </svg>
                <GenericEditableText sectionId={sectionId} field="secondaryText" value={secText} tag="span" />
              </a>
            )}
          </div>
        </div>
      </section>
    );
  }

  // hair-02: beige 2-col, teal tag + H1 + lead + outline CTA, circle image right
  if (variant === "cta-hair-02-promo") {
    return <CtaHair02Promo content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;
  }

  // hair-01: cream bg, dark title, gold outline button
    if (variant === "cta-hair-01") {
    return <CtaHair01 content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;
  }

  if (variant === "barber-04-reservation-dark") {
    const title = c.title ?? "Objednejte se teď hned on-line";
    const subtitle = c.subtitle ?? "";
    const ctaText = c.ctaText ?? "vytvořit rezervaci";
    const ctaHref = resolveDemoHref(c.ctaHref ?? "#rezervace", tenantSlug, isAdmin);
    const phone = String((c as Record<string, unknown>).phone ?? "");
    const phoneHref = phone ? `tel:${phone.replace(/\s+/g, "")}` : "";
    const bgImage = c.image ?? "";
    return (
      <section
        className="relative overflow-hidden"
        style={{ padding: "clamp(96px, 12vw, 140px) 24px", backgroundColor: "#0a0806" }}
        data-template="barber-04"
      >
        {bgImage && (
          <div
            aria-hidden
            className="absolute inset-0"
            style={{
              backgroundImage: `url(${bgImage})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              opacity: 0.28,
              zIndex: 0,
              filter: "grayscale(.4)",
            }}
          />
        )}
        <div
          aria-hidden
          className="absolute inset-0"
          style={{ background: "linear-gradient(to bottom, rgba(10,8,6,.78), rgba(10,8,6,.92))", zIndex: 1 }}
        />

        {/* Top + bottom gold fade dividers — emphasizes CTA as "kotva" sekce */}
        <div aria-hidden style={{
          position: "absolute", top: 0, left: "15%", right: "15%", height: 1, zIndex: 2,
          background: "linear-gradient(90deg, transparent 0%, rgba(213,185,129,.45) 50%, transparent 100%)",
        }} />
        <div aria-hidden style={{
          position: "absolute", bottom: 0, left: "15%", right: "15%", height: 1, zIndex: 2,
          background: "linear-gradient(90deg, transparent 0%, rgba(213,185,129,.35) 50%, transparent 100%)",
        }} />

        <div className="relative max-w-[860px] mx-auto text-center" style={{ zIndex: 3 }}>
          {/* Industrial numbered eyebrow */}
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 12, marginBottom: 28,
            fontFamily: "'Lato',Helvetica,Arial,sans-serif", fontSize: 11, fontWeight: 700,
            letterSpacing: "0.32em", color: "#d5b981", textTransform: "uppercase",
          }}>
            <GenericEditableText sectionId={sectionId} field="eyebrowNum" value={String((c as Record<string, unknown>).eyebrowNum ?? "05")} tag="span" style={{ fontFamily: "'Bebas Neue','Oswald',Impact,sans-serif", fontWeight: 400, letterSpacing: "0.10em", fontSize: 14 }} />
            <span aria-hidden style={{ width: 28, height: 1, backgroundColor: "#d5b981", opacity: 0.7 }} />
            <GenericEditableText sectionId={sectionId} field="eyebrow" value={String((c as Record<string, unknown>).eyebrow ?? "Rezervace")} tag="span" />
          </div>

          <h2
            className="uppercase"
            style={{
              fontFamily: "'Bebas Neue','Oswald',Impact,sans-serif",
              fontWeight: 400,
              fontSize: "clamp(40px, 5vw, 72px)",
              letterSpacing: "0.03em",
              color: "#ffffff",
              margin: "0 auto 24px",
              lineHeight: 1.05,
            }}
          >
            <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
          </h2>
          <div
            aria-hidden
            style={{
              width: 200, height: 1,
              margin: "0 auto 32px",
              background: "linear-gradient(90deg, transparent 0%, rgba(213,185,129,.85) 50%, transparent 100%)",
            }}
          />
          {subtitle && (
            <p
              style={{
                fontFamily: "'Lato',Helvetica,Arial,sans-serif",
                fontWeight: 400,
                fontSize: "clamp(14px, 1.1vw, 17px)",
                color: "rgba(255,255,255,0.78)",
                lineHeight: 1.7,
                maxWidth: 640,
                margin: "0 auto 44px",
              }}
            >
              <GenericEditableText sectionId={sectionId} field="subtitle" value={subtitle} tag="span" />
            </p>
          )}

          <a
            href={ctaHref}
            data-btn="primary"
            className="b04-cta-outline inline-flex items-center gap-3 uppercase no-underline"
            style={{
              background: "transparent",
              color: "#d5b981",
              border: "1px solid #d5b981",
              fontFamily: "'Lato',Helvetica,Arial,sans-serif",
              fontSize: 13,
              fontWeight: 600,
              letterSpacing: "0.24em",
              padding: "16px 38px",
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

          {phone && phoneHref && (
            <div style={{ marginTop: 28, fontFamily: "'Lato',Helvetica,Arial,sans-serif", fontSize: 12, color: "rgba(255,255,255,0.55)", letterSpacing: "0.10em" }}>
              <GenericEditableText sectionId={sectionId} field="phoneCalloutLabel" value={String((c as Record<string, unknown>).phoneCalloutLabel ?? "nebo zavolejte")} tag="span" style={{ textTransform: "uppercase", marginRight: 10 }} />
              <a
                href={phoneHref}
                className="b04-topbar-link uppercase"
                style={{
                  color: "#d5b981",
                  textDecoration: "none",
                  fontWeight: 700,
                  letterSpacing: "0.14em",
                }}
              >
                <GenericEditableText sectionId={sectionId} field="phone" value={phone} tag="span" />
              </a>
            </div>
          )}
        </div>
      </section>
    );
  }

  if (variant === "eshop-15-newsletter") {
    return <NewsletterEshop15 content={c as Record<string, unknown>} sectionId={sectionId} />;
  }

  if (variant === "eshop-20-newsletter") {
    return <NewsletterEshop20 content={c as Record<string, unknown>} sectionId={sectionId} />;
  }

  if (variant === "eshop-17-newsletter") {
    return <NewsletterEshop17 content={c as Record<string, unknown>} sectionId={sectionId} />;
  }

  if (variant === "cta-barber-03-quote") {
    // Barber-03 "Barbery" — warm cinematic quote-style CTA section
    const eyebrow  = String((c as Record<string, unknown>).eyebrow  ?? "");
    const subtitle = String((c as Record<string, unknown>).subtitle ?? "");
    return (
      <section
        id="rezervace"
        className="relative overflow-hidden"
        style={{
          backgroundColor: "#1c1410",
          padding: "clamp(96px, 13vw, 150px) 24px",
          textAlign: "center",
        }}
        data-template="barber-03"
      >
        {/* Dual gold hairlines */}
        <div aria-hidden style={{ position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)", width: 180, height: 1, background: "linear-gradient(90deg, transparent, #c8a96e 50%, transparent)" }} />
        <div aria-hidden style={{ position: "absolute", bottom: 0, left: "50%", transform: "translateX(-50%)", width: 180, height: 1, background: "linear-gradient(90deg, transparent, rgba(200,169,110,0.5) 50%, transparent)" }} />
        {/* Warm radial glow */}
        <div aria-hidden style={{ position: "absolute", inset: 0, pointerEvents: "none", background: "radial-gradient(ellipse at 50% 50%, rgba(200,169,110,0.08) 0%, transparent 60%)" }} />

        <div style={{ maxWidth: 880, margin: "0 auto", position: "relative", zIndex: 1 }}>
          {/* Eyebrow */}
          {eyebrow && (
            <div style={{ display: "inline-flex", alignItems: "center", gap: 14, marginBottom: 28 }}>
              <span aria-hidden style={{ width: 42, height: 1, backgroundColor: "#c8a96e" }} />
              <span style={{
                fontFamily: "'Libre Baskerville', Georgia, serif",
                fontStyle: "italic",
                fontSize: "12px",
                letterSpacing: "0.28em",
                textTransform: "uppercase",
                color: "#c8a96e",
              }}>
                <GenericEditableText sectionId={sectionId} field="eyebrow" value={eyebrow} tag="span" />
              </span>
              <span aria-hidden style={{ width: 42, height: 1, backgroundColor: "#c8a96e" }} />
            </div>
          )}

          {/* Big opening quote mark */}
          <span aria-hidden style={{
            display: "block",
            fontFamily: "'Libre Baskerville', Georgia, serif",
            fontSize: "5.5rem",
            fontWeight: 700,
            color: "#c8a96e",
            lineHeight: 0.5,
            letterSpacing: "-0.05em",
            marginBottom: 18,
            opacity: 0.7,
          }}>&ldquo;</span>

          {/* Quote (title) — italic serif */}
          <h2 style={{
            fontFamily: "'Libre Baskerville', Georgia, serif",
            fontStyle: "italic",
            fontSize: "clamp(1.6rem, 3.4vw, 2.4rem)",
            fontWeight: 400,
            lineHeight: 1.4,
            letterSpacing: "0.01em",
            color: "#f5efe6",
            margin: "0 auto 24px",
            maxWidth: 760,
          }}>
            <GenericEditableText sectionId={sectionId} field="title" value={c.title ?? ""} tag="span" />
          </h2>

          {/* Diamond rule */}
          <div aria-hidden style={{ display: "inline-flex", alignItems: "center", gap: 14, marginBlock: 22 }}>
            <span style={{ width: 48, height: 1, backgroundColor: "rgba(200,169,110,0.55)" }} />
            <span style={{ width: 6, height: 6, backgroundColor: "#c8a96e", transform: "rotate(45deg)" }} />
            <span style={{ width: 48, height: 1, backgroundColor: "rgba(200,169,110,0.55)" }} />
          </div>

          {/* Subtitle */}
          {subtitle && (
            <p style={{
              fontFamily: "'Source Sans Pro', system-ui, sans-serif",
              fontSize: "clamp(0.95rem, 1.3vw, 1.05rem)",
              fontWeight: 300,
              color: "rgba(245,239,230,0.72)",
              lineHeight: 1.7,
              margin: "0 auto 44px",
              maxWidth: 600,
            }}>
              <GenericEditableText sectionId={sectionId} field="subtitle" value={subtitle} tag="span" />
            </p>
          )}

          {/* CTA — solid warm gold fill */}
          {c.ctaHref && (
            <a
              href={resolveDemoHref(c.ctaHref ?? "#kontakt", tenantSlug, isAdmin)}
              className="b03-cta inline-flex items-center justify-center uppercase no-underline"
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
              <span aria-hidden className="b03-cta-arrow" style={{ display: "inline-flex", transition: "transform 0.4s cubic-bezier(.22,.68,0,1.1)" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                </svg>
              </span>
            </a>
          )}
        </div>
      </section>
    );
  }

  if (variant === "barber-dark") {
    return (
      <section
        id="rezervace"
        className="px-6 text-center relative overflow-hidden"
        style={{ backgroundColor: "#0a0a0a", padding: "clamp(80px, 12vw, 130px) 24px" }}
        data-template="barber-01"
      >
        {/* Decorative scissors watermark — large, centered behind text */}
        <div aria-hidden style={{
          position: "absolute", left: "50%", top: "50%", transform: "translate(-50%, -50%) rotate(-15deg)",
          width: 420, height: 420, opacity: 0.03, zIndex: 0,
          backgroundImage: "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23C9A84C' stroke-width='0.8' stroke-linecap='round' stroke-linejoin='round'><circle cx='6' cy='6' r='3'/><circle cx='6' cy='18' r='3'/><line x1='20' y1='4' x2='8.12' y2='15.88'/><line x1='14.47' y1='14.48' x2='20' y2='20'/><line x1='8.12' y1='8.12' x2='12' y2='12'/></svg>\")",
          backgroundSize: "contain", backgroundRepeat: "no-repeat",
        }} />
        {/* Top + bottom gold hairlines */}
        <div aria-hidden style={{ position: "absolute", top: 0, left: "20%", right: "20%", height: 1, background: "linear-gradient(90deg, transparent 0%, rgba(201,168,76,0.5) 50%, transparent 100%)" }} />
        <div aria-hidden style={{ position: "absolute", bottom: 0, left: "20%", right: "20%", height: 1, background: "linear-gradient(90deg, transparent 0%, rgba(201,168,76,0.5) 50%, transparent 100%)" }} />

        <div className="max-w-2xl mx-auto" style={{ position: "relative", zIndex: 1 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 14, marginBottom: 22 }}>
            <span aria-hidden style={{ width: 36, height: 1, background: "var(--color-accent, #C9A84C)" }} />
            <GenericEditableText sectionId={sectionId} field="eyebrow" value={String((c as Record<string, unknown>).eyebrow ?? "Online rezervace")} tag="span" className="services-eyebrow" />
            <span aria-hidden style={{ width: 36, height: 1, background: "var(--color-accent, #C9A84C)" }} />
          </div>
          <h2
            className="services-title"
            style={{ fontFamily: "var(--font-heading)", color: "#F5F5F5", fontSize: "clamp(2.2rem, 4.5vw, 3.2rem)", fontWeight: 700, letterSpacing: "-0.01em", lineHeight: 1.05, margin: "0 0 22px" }}
          >
            <GenericEditableText sectionId={sectionId} field="title" value={c.title ?? "Rezervujte si termín"} tag="span" />
          </h2>
          {c.subtitle && (
            <p style={{ color: "rgba(245,245,245,0.7)", fontSize: "clamp(0.95rem, 1.1vw, 1.05rem)", lineHeight: 1.65, fontWeight: 300, marginBottom: 40 }}>
              <GenericEditableText sectionId={sectionId} field="subtitle" value={c.subtitle} tag="span" />
            </p>
          )}
          <a
            href={resolveDemoHref(c.ctaHref ?? "#kontakt", tenantSlug, isAdmin)}
            data-btn="primary"
            className="barber-cta-premium"
            style={{
              position: "relative",
              overflow: "hidden",
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
              paddingInline: 36,
              minHeight: 60,
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
              boxShadow: "0 4px 0 rgba(0,0,0,0.18)",
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 14px 36px rgba(201,168,76,0.45)"; }}
            onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 4px 0 rgba(0,0,0,0.18)"; }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0a0a0a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/>
              <line x1="20" y1="4" x2="8.12" y2="15.88"/>
              <line x1="14.47" y1="14.48" x2="20" y2="20"/>
              <line x1="8.12" y1="8.12" x2="12" y2="12"/>
            </svg>
            <GenericEditableText sectionId={sectionId} field="ctaText" value={c.ctaText ?? "Rezervovat online"} tag="span" />
            <span aria-hidden className="barber-cta-shimmer" style={{
              position: "absolute", top: 0, left: "-60%", width: "50%", height: "100%",
              background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.5) 50%, transparent 100%)",
              transform: "skewX(-20deg)", pointerEvents: "none",
            }} />
          </a>
        </div>
      </section>
    );
  }

  if (variant === "cafe-magazine") {
    const cc = c as Record<string, unknown>;
    const eyebrow = String(cc.eyebrow ?? "Magazín Vlna");
    const issue = String(cc.issue ?? "Vydání č. 24 · Léto 2026");
    return (
      <section
        className="cafe01-cta relative overflow-hidden"
        data-template="cafe-01"
      >
        <div className="cafe01-cta__decor cafe01-cta__decor--r" aria-hidden="true">
          <svg viewBox="0 0 400 400" width="440" height="440">
            <path d="M0 300 Q100 260 200 300 T400 300 L400 400 L0 400 Z" fill="rgba(255,209,184,0.14)" />
            <path d="M0 320 Q100 280 200 320 T400 320 L400 400 L0 400 Z" fill="rgba(255,209,184,0.10)" />
          </svg>
        </div>

        <div className="cafe01-cta__container">
          <div className="cafe01-cta__grid">
            <div className="cafe01-cta__content">
              <div className="cafe01-cta__eyebrow">
                <span className="cafe01-cta__eyebrow-line" aria-hidden="true" />
                <GenericEditableText sectionId={sectionId} field="eyebrow" value={eyebrow} tag="span" />
              </div>
              <h2 className="cafe01-cta__title">
                <GenericEditableText sectionId={sectionId} field="title" value={c.title ?? "Naše tištěné noviny"} tag="span" />
              </h2>
              {c.subtitle && (
                <p className="cafe01-cta__subtitle">
                  <GenericEditableText sectionId={sectionId} field="subtitle" value={c.subtitle} tag="span" />
                </p>
              )}
              {c.body && (
                <p className="cafe01-cta__body">
                  <GenericEditableText sectionId={sectionId} field="body" value={c.body} tag="span" />
                </p>
              )}
              <div className="cafe01-cta__issue">
                <span className="cafe01-cta__issue-dot" aria-hidden="true" />
                <GenericEditableText sectionId={sectionId} field="issue" value={issue} tag="span" />
              </div>
              <a
                href={resolveDemoHref(c.ctaHref ?? "#", tenantSlug, isAdmin)}
                data-btn="primary"
                className="cafe01-cta__button"
              >
                <span className="cafe01-cta__button-shine" aria-hidden="true" />
                <GenericEditableText sectionId={sectionId} field="ctaText" value={c.ctaText ?? "Číst magazín"} tag="span" />
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" className="cafe01-cta__button-arrow" aria-hidden="true">
                  <path d="M5 12h14" />
                  <path d="M13 6l6 6-6 6" />
                </svg>
              </a>
            </div>
            <div className="cafe01-cta__visual">
              <div className="cafe01-cta__mag-shadow" aria-hidden="true" />
              <div className="cafe01-cta__mag-back" aria-hidden="true" />
              {c.image ? (
                <GenericEditableImage
                  sectionId={sectionId}
                  field="image"
                  src={String(c.image)}
                  alt="Magazín"
                  className="cafe01-cta__mag"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={String(c.image)} alt="" className="cafe01-cta__mag-img" loading="lazy" />
                </GenericEditableImage>
              ) : (
                <GenericEditableImage
                  sectionId={sectionId}
                  field="image"
                  src=""
                  alt="Magazín"
                  className="cafe01-cta__mag cafe01-cta__mag--empty"
                >
                  <div className="cafe01-cta__mag-fallback">Nahrát obálku</div>
                </GenericEditableImage>
              )}
              <div className="cafe01-cta__mag-ribbon" aria-hidden="true">
                <span>ZDARMA</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      className="py-20 px-6 text-center"
      style={{ backgroundColor: "var(--color-primary, #6366f1)" }}
    >
      <div className="max-w-2xl mx-auto">
        <h2 className="text-3xl font-bold text-white mb-4" style={{ fontFamily: "var(--font-heading)" }}>
          <GenericEditableText sectionId={sectionId} field="title" value={c.title ?? "Rezervujte si termín"} tag="span" />
        </h2>
        {c.subtitle && (
          <p className="text-white/80 mb-8">
            <GenericEditableText sectionId={sectionId} field="subtitle" value={c.subtitle} tag="span" />
          </p>
        )}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {c.bookingEnabled && c.bookingUrl ? (
            <a
              href={c.bookingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-4 bg-white font-semibold rounded hover:opacity-90 transition-opacity"
              style={{ color: "var(--color-primary, #6366f1)", borderRadius: "var(--radius, 4px)" }}
            >
              <GenericEditableText sectionId={sectionId} field="ctaText" value={c.ctaText ?? "Rezervovat online"} tag="span" />
            </a>
          ) : (
            <a
              href={resolveDemoHref(c.ctaHref ?? "#kontakt", tenantSlug, isAdmin)}
              data-btn="primary"
              className="px-8 py-4 bg-white font-semibold rounded hover:opacity-90 transition-opacity"
              style={{ color: "var(--color-primary, #6366f1)", borderRadius: "var(--radius, 4px)" }}
            >
              <GenericEditableText sectionId={sectionId} field="ctaText" value={c.ctaText ?? "Kontaktujte nás"} tag="span" />
            </a>
          )}
        </div>
      </div>
    </section>
  );
}

// hair-02: beige (#ebe8e2) 2-col — left: teal h6 tag + H1 + lead + outline CTA; right: circle image
function CtaHair02Promo({ content, sectionId, tenantSlug, isAdmin }: { content: Record<string, unknown>; sectionId: number; tenantSlug?: string; isAdmin: boolean }) {
  const tag     = String(content.tag     ?? "e-shop");
  const title   = String(content.title   ?? "REVOLUCE V PÉČI O VLASY");
  const body    = String(content.body    ?? "");
  const ctaText = String(content.ctaText ?? "Zjistit více");
  const ctaHref = resolveDemoHref(String(content.ctaHref ?? "#kontakt"), tenantSlug, isAdmin);
  const image   = String(content.image   ?? "");
  const TEAL  = "#8ab2ab";
  const BEIGE = "rgb(235,232,226)";
  const FONT  = "'Montserrat', sans-serif";

  return (
    <section
      id="promo"
      style={{ backgroundColor: BEIGE, padding: "70px 0", fontFamily: FONT }}
      data-template="hair-02"
    >
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px", display: "flex", flexWrap: "wrap", alignItems: "center", gap: 48 }}>
        {/* Left — text */}
        <div style={{ flex: "1 1 380px", minWidth: 280 }}>
          {/* Teal tag */}
          <p style={{ color: TEAL, fontFamily: FONT, fontSize: 14, fontWeight: 500, margin: "0 0 20px", textTransform: "lowercase", letterSpacing: "0.03em" }}>
            <GenericEditableText sectionId={sectionId} field="tag" value={tag} tag="span" />
          </p>
          {/* H1 */}
          <h2 style={{ color: "#000000", fontFamily: FONT, fontSize: "clamp(1.75rem, 3vw, 2rem)", fontWeight: 700, lineHeight: 1.4, margin: "0 0 16px", textTransform: "uppercase" }}>
            <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
          </h2>
          {/* Lead */}
          {body && (
            <p style={{ color: "#000000", fontFamily: FONT, fontSize: 16, lineHeight: 1.7, margin: "0 0 28px" }}>
              <GenericEditableText sectionId={sectionId} field="body" value={body} tag="span" />
            </p>
          )}
          {/* Outline CTA */}
          <a
            href={ctaHref}
            data-btn="primary"
            style={{
              display: "inline-block",
              fontFamily: FONT,
              fontSize: 14,
              fontWeight: 600,
              color: TEAL,
              border: `1.5px solid ${TEAL}`,
              borderRadius: 10,
              padding: "10px 30px",
              textDecoration: "none",
              textTransform: "lowercase",
              letterSpacing: "0.02em",
              transition: "background .2s, color .2s",
            }}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = TEAL; e.currentTarget.style.color = "#fff"; }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = TEAL; }}
          >
            <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
          </a>
        </div>

        {/* Right — circle image */}
        {image && (
          <div style={{ flex: "0 0 auto", width: "min(380px, 100%)", aspectRatio: "1/1", borderRadius: "50%", overflow: "hidden", position: "relative" }}>
            <Image
              src={image}
              alt={title}
              fill
              className="object-cover"
              sizes="(max-width:768px) 100vw, 380px"
              unoptimized={shouldSkipNextImageOptimization(image)}
            />
          </div>
        )}
      </div>
    </section>
  );
}

function resolveDemoHref(href: string, tenantSlug?: string, isAdmin = false) {
  if (!tenantSlug || !href.startsWith("/")) return href;
  if (href.startsWith("/demo/")) return href;
  if (href === "/") return `/demo/${tenantSlug}${isAdmin ? "/admin" : ""}`;
  return `/demo/${tenantSlug}${isAdmin ? "/admin" : ""}${href}`;
}

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

// nails-01 · Kyoto Wabi-Sabi Beauty CTA — burgundy rituál
// Burgundy bg s subtle noir gradient + cream corner brackets + ghost Georgia italic word
// Eyebrow "04 · REZERVACE" + Georgia H2 italic accent + 2 CTAs (cream fill / cream outline phone)
// Bottom trust strip: Reservio · adresa · hodiny
function CtaNails01({ content, sectionId, tenantSlug, isAdmin }: { content: Record<string, unknown>; sectionId: number; tenantSlug?: string; isAdmin: boolean }) {
  const BURGUNDY = "#79142b";
  const CREAM    = "#f4f1e9";
  const SERIF    = "Georgia, 'Times New Roman', serif";
  const SANS     = "'Montserrat', 'Helvetica Neue', Arial, sans-serif";

  const eyebrow     = String(content.eyebrow     ?? "04 · REZERVACE");
  const title       = String(content.title       ?? "Vaše chvíle klidu");
  const titleAccent = String(content.titleAccent ?? "začíná právě teď");
  const subtitle    = String(content.subtitle    ?? "Rezervujte si termín online 24/7 nebo nám zavolejte. Odpovíme každý pracovní den do hodiny.");
  const ctaText     = String(content.ctaText     ?? "Objednat online");
  const ctaHref     = String(content.ctaHref     ?? "/kontakt");
  const phoneText   = String(content.phoneText   ?? "+420 777 123 456");
  const phoneHref   = String(content.phoneHref   ?? "tel:+420777123456");
  const trust       = String(content.trust       ?? "Reservio · Vinohradská 26, Praha 1 · Po–Ne 9:00–19:00");
  const siteMode = String(content.siteMode ?? "multipage");
  const resolvedCta = (() => {
    if (!ctaHref) return "#";
    const base = tenantSlug ? `/demo/${tenantSlug}${isAdmin ? "/admin" : ""}` : "";
    if (siteMode === "onepage") {
      if (ctaHref.startsWith("/") && ctaHref !== "/") return `${base}#${ctaHref.slice(1)}`;
      if (ctaHref.startsWith("#")) return `${base}${ctaHref}`;
      return ctaHref;
    }
    if (ctaHref.startsWith("#")) return `${base}/${ctaHref.slice(1)}`;
    if (ctaHref.startsWith("/")) return `${base}${ctaHref}`;
    return ctaHref;
  })();

  return (
    <section
      id="rezervace"
      data-template="nails-01"
      data-section-type="cta"
      data-variant="nails-01-cta"
      className="n01-cta-section"
      style={{
        backgroundColor: BURGUNDY,
        padding: "clamp(90px, 13vh, 150px) clamp(24px, 6vw, 80px)",
        position: "relative",
        overflow: "hidden",
        textAlign: "center",
      }}
    >
      {/* Deep noir gradient overlay */}
      <div aria-hidden="true" style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        background: "radial-gradient(ellipse at 30% 10%, rgba(0,0,0,0.28) 0%, transparent 55%), radial-gradient(ellipse at 70% 90%, rgba(0,0,0,0.32) 0%, transparent 60%)",
      }} />

      {/* Corner brackets — cream */}
      <span aria-hidden="true" className="n01-cta-frame n01-cta-frame-tl" />
      <span aria-hidden="true" className="n01-cta-frame n01-cta-frame-tr" />
      <span aria-hidden="true" className="n01-cta-frame n01-cta-frame-bl" />
      <span aria-hidden="true" className="n01-cta-frame n01-cta-frame-br" />

      {/* Ghost italic word */}
      <div aria-hidden="true" className="hidden lg:block" style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        fontSize: "clamp(180px, 28vw, 380px)",
        fontFamily: SERIF,
        fontStyle: "italic",
        color: CREAM,
        opacity: 0.045,
        whiteSpace: "nowrap",
        userSelect: "none",
        pointerEvents: "none",
        lineHeight: 1,
        letterSpacing: "-0.02em",
      }}>
        rituál
      </div>

      <div style={{ position: "relative", zIndex: 2, maxWidth: 820, margin: "0 auto" }}>
        {/* Eyebrow */}
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 14, marginBottom: 26,
          fontFamily: SANS, fontSize: "0.7rem", fontWeight: 300,
          letterSpacing: "0.36em", textTransform: "uppercase", color: CREAM, opacity: 0.85,
        }}>
          <span aria-hidden="true" style={{ width: 60, height: 1, background: CREAM, opacity: 0.55 }} />
          <GenericEditableText sectionId={sectionId} field="eyebrow" value={eyebrow} tag="span" />
          <span aria-hidden="true" style={{ width: 60, height: 1, background: CREAM, opacity: 0.55 }} />
        </div>

        {/* Title */}
        <h2 style={{
          fontFamily: SERIF, fontSize: "clamp(36px, 4.6vw, 68px)",
          fontWeight: 400, color: CREAM, lineHeight: 1.08,
          margin: "0 0 26px", letterSpacing: "-0.005em",
        }}>
          <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
          <br />
          <em style={{ fontStyle: "italic" }}>
            <GenericEditableText sectionId={sectionId} field="titleAccent" value={titleAccent} tag="span" />
          </em>
        </h2>

        {/* Subtitle */}
        <p style={{
          fontFamily: SANS, fontSize: "clamp(15px, 1.15vw, 17px)",
          fontWeight: 300, color: CREAM, opacity: 0.82,
          margin: "0 auto clamp(40px, 5vh, 56px)",
          maxWidth: 560, lineHeight: 1.75,
        }}>
          <GenericEditableText sectionId={sectionId} field="subtitle" value={subtitle} tag="span" />
        </p>

        {/* CTAs — cream fill + phone outline */}
        <div className="n01-cta-buttons" style={{
          display: "flex", justifyContent: "center", alignItems: "center",
          gap: 20, flexWrap: "wrap",
        }}>
          <a
            href={resolvedCta}
            data-btn="inverse"
            className="n01-cta-primary"
          >
            <span className="n01-cta-primary-label">
              <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
            </span>
            <span aria-hidden="true" className="n01-cta-primary-arrow">→</span>
          </a>
          <a
            href={phoneHref}
            className="n01-cta-phone"
          >
            <span aria-hidden="true" style={{ opacity: 0.7, marginRight: 8 }}>Nebo</span>
            <GenericEditableText sectionId={sectionId} field="phoneText" value={phoneText} tag="span" />
          </a>
        </div>

        {/* Diamond divider */}
        <div aria-hidden="true" style={{
          margin: "clamp(48px, 6vh, 68px) auto 24px",
          width: 220, height: 1,
          background: `linear-gradient(90deg, transparent, ${CREAM}70, transparent)`,
          position: "relative",
        }}>
          <span style={{
            position: "absolute", left: "50%", top: "50%",
            transform: "translate(-50%, -50%) rotate(45deg)",
            width: 6, height: 6, background: BURGUNDY,
            border: `1px solid ${CREAM}`,
          }} />
        </div>

        {/* Trust caption */}
        <div style={{
          fontFamily: SANS, fontSize: "0.68rem", fontWeight: 300,
          letterSpacing: "0.32em", textTransform: "uppercase",
          color: CREAM, opacity: 0.7,
        }}>
          <GenericEditableText sectionId={sectionId} field="trust" value={trust} tag="span" />
        </div>
      </div>
    </section>
  );
}

// ── clinic-02-cta ──────────────────────────────────────────────────────────
// Cream bg, centered newsletter CTA with hero email card on amber accent
function CtaClinic02({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const NAVY    = "#0F203E";
  const NAVY_D  = "#0a172e";
  const AMBER   = "#ffa60b";
  const CREAM   = "#fffaf2";
  const FONT_H  = "'Poppins', Arial, sans-serif";
  const FONT_B  = "'Open Sans', Arial, sans-serif";

  const kicker      = String(content.kicker  ?? "Newsletter Aurélie");
  const title       = String(content.title   ?? "Sleva 10 % na první ošetření");
  const message     = String(content.message ?? "");
  const ctaText     = String(content.ctaText ?? "Přihlásit k odběru");
  const ctaHref     = String(content.ctaHref ?? "/kontakt");
  const placeholder = String((content as Record<string,unknown>).inputPlaceholder ?? "Vaše e-mailová adresa");
  const gdprNote    = String((content as Record<string,unknown>).gdprNote ?? "Souhlasím se zpracováním osobních údajů. Odhlášení kdykoli.");

  return (
    <section
      id="newsletter"
      data-template="clinic-02"
      style={{
        backgroundColor: NAVY,
        padding: "clamp(72px,9vw,120px) 0",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Decorative diagonal amber band */}
      <div aria-hidden style={{
        position: "absolute", inset: 0,
        background: `linear-gradient(135deg, ${NAVY_D} 0%, ${NAVY} 50%, ${NAVY_D} 100%)`,
        pointerEvents: "none",
      }} />
      <div aria-hidden style={{
        position: "absolute", top: "-120px", left: "-120px",
        width: 380, height: 380, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(255,166,11,0.16) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />
      <div aria-hidden style={{
        position: "absolute", bottom: "-180px", right: "-160px",
        width: 480, height: 480, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(255,166,11,0.10) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />

      <div style={{
        position: "relative",
        maxWidth: 760,
        margin: "0 auto",
        padding: "0 clamp(24px,5vw,60px)",
        textAlign: "center",
      }}>
        {/* Discount badge */}
        <div style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 10,
          backgroundColor: "rgba(255,166,11,0.16)",
          border: "1px solid rgba(255,166,11,0.5)",
          color: AMBER,
          padding: "10px 20px",
          borderRadius: 999,
          fontFamily: FONT_B,
          fontSize: "0.74rem",
          fontWeight: 700,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          marginBottom: 28,
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="5" x2="5" y2="19"/><circle cx="6.5" cy="6.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/></svg>
          <GenericEditableText sectionId={sectionId} field="kicker" value={kicker} tag="span" />
        </div>

        <h2 style={{
          fontFamily: FONT_H, fontSize: "clamp(2rem,4vw,3rem)", fontWeight: 700,
          color: CREAM, margin: "0 0 22px", lineHeight: 1.12, letterSpacing: "-0.01em",
        }}>
          <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
        </h2>
        <p style={{
          fontFamily: FONT_B, fontSize: "clamp(0.96rem,1.2vw,1.08rem)",
          color: "rgba(255,250,242,0.78)", lineHeight: 1.75, margin: "0 0 44px",
          maxWidth: 580, marginLeft: "auto", marginRight: "auto",
        }}>
          <GenericEditableText sectionId={sectionId} field="message" value={message} tag="span" />
        </p>

        {/* Email row — pill style */}
        <form
          onSubmit={(e) => { e.preventDefault(); window.location.href = ctaHref; }}
          className="c02-cta-form"
          style={{
            display: "flex", gap: 8,
            maxWidth: 560, margin: "0 auto",
            backgroundColor: "rgba(255,255,255,0.08)",
            border: "1px solid rgba(255,166,11,0.32)",
            borderRadius: 999,
            padding: 6,
            boxShadow: "0 12px 40px rgba(0,0,0,0.32)",
          }}
        >
          <input
            type="email"
            placeholder={placeholder}
            style={{
              flex: 1,
              backgroundColor: "transparent",
              border: "none",
              outline: "none",
              padding: "0 22px",
              fontFamily: FONT_B,
              fontSize: "0.92rem",
              color: CREAM,
              minWidth: 0,
            }}
          />
          <button
            type="submit"
            className="c02-cta-btn"
            style={{
              flexShrink: 0,
              display: "inline-flex", alignItems: "center", gap: 10,
              padding: "14px 26px",
              backgroundColor: AMBER, color: NAVY,
              border: "none", cursor: "pointer",
              fontFamily: FONT_B, fontSize: "0.82rem", fontWeight: 700,
              letterSpacing: "0.12em", textTransform: "uppercase",
              borderRadius: 999,
              boxShadow: "0 4px 14px rgba(255,166,11,0.42)",
              transition: "transform .22s ease, background-color .22s ease, box-shadow .22s ease",
            }}
          >
            <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="13 5 20 12 13 19"/></svg>
          </button>
        </form>

        <p style={{
          fontFamily: FONT_B, fontSize: "0.74rem",
          color: "rgba(255,250,242,0.5)", margin: "20px 0 0",
          letterSpacing: "0.02em",
        }}>
          <GenericEditableText sectionId={sectionId} field="gdprNote" value={gdprNote} tag="span" />
        </p>
      </div>

      <style>{`
        .c02-cta-form input::placeholder { color: rgba(255,250,242,0.5); }
        .c02-cta-btn:hover {
          background-color: #ffb73a !important;
          transform: translateY(-2px);
          box-shadow: 0 10px 22px rgba(255,166,11,0.55);
        }
        @media (max-width: 600px) {
          .c02-cta-form { flex-direction: column !important; border-radius: 12px !important; padding: 12px !important; }
          .c02-cta-form input { padding: 12px 16px !important; }
          .c02-cta-btn { justify-content: center; }
        }
      `}</style>
    </section>
  );
}

// ── fyzio-01-cta-booking ──────────────────────────────────────────────────────
// Navy #1f2d69 bg, centrovaný bílý kicker + Montserrat H2 + popis
// Zelené filled CTA "Rezervační systém" + outline sekundární CTA "Zavolat nám"
// Inspirováno fyziovsem.cz — sekce "Objednejte se ještě dnes"
// ─────────────────────────────────────────────────────────────────────────────
function CtaFyzio01({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const tagline        = String(content.tagline        ?? "Objednejte se");
  const title          = String(content.title          ?? "Udělejte první krok\nk životu bez bolesti");
  const body           = String(content.body           ?? "");
  const ctaText        = String(content.ctaText        ?? "Objednat se online");
  const ctaHref        = String(content.ctaHref        ?? "#kontakt");
  const ctaSecondaryText = String(content.ctaSecondaryText ?? "704 123 456");
  const ctaSecondaryHref = String(content.ctaSecondaryHref ?? "tel:704123456");

  const chipsRaw = content.chips as string[] | undefined;
  const chips = Array.isArray(chipsRaw) && chipsRaw.length ? chipsRaw
    : ["Termíny do 48 hodin", "Bez doporučení od lékaře", "Smlouvy se zdravotními pojišťovnami"];

  const WHITE = "#ffffff";
  const GREEN = "#10d15d";
  const MONT  = "'Montserrat', sans-serif";
  const SANS  = "'Open Sans', sans-serif";
  const titleLines = title.split("\n");

  return (
    <section id="rezervace" data-template="fyzio-01" className="fyzio01-ct" style={{ fontFamily: SANS, textAlign: "center" }}>
      <div className="fyzio01-ct-glow" aria-hidden="true" />
      <svg className="fyzio01-ct-ecg" viewBox="0 0 1200 160" preserveAspectRatio="none" aria-hidden="true">
        <path d="M0,80 L440,80 L462,80 L478,34 L496,126 L514,22 L532,120 L548,80 L590,80 L1200,80" fill="none" stroke="#10d15d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <div className="fyzio01-ct-inner">
        <div className="fyzio01-ct-kicker">
          <span className="fyzio01-ct-kicker-dash" aria-hidden="true" />
          <GenericEditableText sectionId={sectionId} field="tagline" value={tagline} tag="span"
            style={{ fontFamily: MONT, fontSize: 11, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: GREEN }} />
          <span className="fyzio01-ct-kicker-dash" aria-hidden="true" />
        </div>
        <h2 style={{ fontFamily: MONT, fontSize: "clamp(28px,4vw,46px)", fontWeight: 800, color: WHITE, margin: "18px 0 20px", lineHeight: 1.15, letterSpacing: "-0.01em" }}>
          {titleLines.map((line, i) => (
            <span key={i} style={{ display: "block" }}>
              <GenericEditableText sectionId={sectionId} field={`title_line_${i}`} value={line} tag="span" />
            </span>
          ))}
        </h2>
        {body && (
          <p style={{ fontSize: 16, color: "rgba(255,255,255,0.75)", lineHeight: 1.8, margin: "0 auto 36px", maxWidth: 560 }}>
            <GenericEditableText sectionId={sectionId} field="body" value={body} tag="span" />
          </p>
        )}
        <div className="fyzio01-ct-actions">
          <a href={ctaHref} data-btn="primary" className="fyzio01-ct-cta"
            style={{ backgroundColor: GREEN, color: WHITE, fontFamily: MONT, fontSize: 15, fontWeight: 700, padding: "16px 38px", borderRadius: 999, textDecoration: "none", letterSpacing: "0.03em", display: "inline-flex", alignItems: "center", gap: 10 }}>
            <span className="fyzio01-ct-cta-dot" aria-hidden="true" />
            <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
            <svg className="fyzio01-ct-cta-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
          </a>
          {ctaSecondaryText && (
            <a href={ctaSecondaryHref} className="fyzio01-ct-ghost"
              style={{ color: WHITE, border: "2px solid rgba(255,255,255,0.34)", fontFamily: MONT, fontSize: 15, fontWeight: 600, padding: "14px 32px", borderRadius: 999, textDecoration: "none", letterSpacing: "0.03em", display: "inline-flex", alignItems: "center", gap: 10 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.9.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
              <GenericEditableText sectionId={sectionId} field="ctaSecondaryText" value={ctaSecondaryText} tag="span" />
            </a>
          )}
        </div>
        <div className="fyzio01-ct-chips">
          {chips.map((chip, i) => (
            <span key={i} className="fyzio01-ct-chip">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#10d15d" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12" /></svg>
              <GenericEditableText sectionId={sectionId} field={`chips.${i}`} value={chip} tag="span" />
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── fyzio-02-cta-booking ──────────────────────────────────────────────────────
// Navy #092029 band, teal glow + rotující orbit ring, DM Serif H2 bílý,
// teal pill CTA + ghost phone, trust chips row. Movia booking.
// ─────────────────────────────────────────────────────────────────────────────
function CtaFyzio02({ content, sectionId, tenantSlug, isAdmin }: { content: Record<string, unknown>; sectionId: number; tenantSlug?: string; isAdmin?: boolean }) {
  const id               = String(content.id               ?? "rezervace");
  const tagline          = String(content.tagline          ?? "Objednání");
  const title            = String(content.title            ?? "Uděláte první krok — o zbytek se postaráme my.");
  const body             = String(content.body             ?? "Vstupní vyšetření trvá 60 minut. Odejdete s jasným plánem terapie a prvními cviky, ne jen s doporučením.");
  const ctaText          = String(content.ctaText          ?? "Objednat se online");
  const ctaHref          = String(content.ctaHref          ?? "/kontakt");
  const ctaSecondaryText = String(content.ctaSecondaryText ?? "725 480 190");
  const ctaSecondaryHref = String(content.ctaSecondaryHref ?? "tel:+420725480190");
  const chipsRaw         = content.chips as string[] | undefined;
  const chips = Array.isArray(chipsRaw) && chipsRaw.length ? chipsRaw : ["Termíny do 48 hodin", "Bez doporučení od lékaře", "Smlouvy se zdravotními pojišťovnami"];

  const siteMode = String(content.siteMode ?? "multipage");
  const resolve = (href: string) => resolveNavHref(href, siteMode, tenantSlug, isAdmin);

  const secRef = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = secRef.current;
    if (!el) return;
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) { (e.target as HTMLElement).classList.add("fz2-vis"); obs.unobserve(e.target); } });
    }, { threshold: 0.2 });
    el.querySelectorAll<HTMLElement>("[data-fz2cta]").forEach(i => obs.observe(i));
    return () => obs.disconnect();
  }, []);

  return (
    <section ref={secRef} id={id} data-template="fyzio-02" className="fz2-cta">
      <div className="fz2-cta-glow" aria-hidden="true" />
      <div className="fz2-cta-orbit" aria-hidden="true" />

      <div className="fz2-cta-inner">
        <div className="fz2-cta-head fz2-reveal" data-fz2cta>
          <span className="fz2-cta-pill">
            <span className="fz2-cta-pill-dot" aria-hidden="true" />
            <GenericEditableText sectionId={sectionId} field="tagline" value={tagline} tag="span" />
          </span>
          <h2 className="fz2-cta-title">
            <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
          </h2>
          <p className="fz2-cta-body">
            <GenericEditableText sectionId={sectionId} field="body" value={body} tag="span" />
          </p>

          <div className="fz2-cta-btns">
            <a href={resolve(ctaHref)} data-btn="primary" className="fz2-cta-primary">
              <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
              <svg width="15" height="11" viewBox="0 0 15 11" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M1 5.5h12M9 1l4 4.5L9 10" /></svg>
            </a>
            <a href={ctaSecondaryHref} className="fz2-cta-ghost">
              <span className="fz2-cta-ghost-ico" aria-hidden="true">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.18h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.75a16 16 0 0 0 6.29 6.29l.95-.95a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7a2 2 0 0 1 1.72 2.03z"/></svg>
              </span>
              <GenericEditableText sectionId={sectionId} field="ctaSecondaryText" value={ctaSecondaryText} tag="span" />
            </a>
          </div>

          <div className="fz2-cta-chips">
            {chips.map((chip, i) => (
              <span key={i} className="fz2-cta-chip">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>
                <GenericEditableText sectionId={sectionId} field={`chips.${i}`} value={chip} tag="span" />
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
// ── restaurant-01-cta ─────────────────────────────────────────────────────────
// Dark bg #0f0a07, fullbleed atmosferické foto s overlay
// Centrovaný cream serif H2 + podtitulek + červené filled CTA + outline CTA
// ─────────────────────────────────────────────────────────────────────────────
function CtaRestaurant01({ content, sectionId, tenantSlug, isAdmin }: { content: Record<string, unknown>; sectionId: number; tenantSlug?: string; isAdmin?: boolean }) {
  const secRef = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = secRef.current;
    if (!el) return;
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) { (e.target as HTMLElement).classList.add("r01-vis"); obs.unobserve(e.target); } });
    }, { threshold: 0.15 });
    el.querySelectorAll<HTMLElement>("[data-r01]").forEach(i => obs.observe(i));
    return () => obs.disconnect();
  }, []);

  const id       = String(content.id      ?? "rezervace");
  const tagline  = String(content.tagline ?? "Soukromá událost");
  const title    = String(content.title   ?? "Večer, na který\nse nezapomíná.");
  const body     = String(content.body    ?? "");
  const ctaText  = String(content.ctaText ?? "Rezervovat stůl");
  const ctaHref  = String(content.ctaHref ?? "#kontakt");
  const ctaSecondaryText = String(content.ctaSecondaryText ?? "Jídelní lístek");
  const ctaSecondaryHref = String(content.ctaSecondaryHref ?? "/menu");
  const PLACEHOLDER = "/templates/restaurant-01/cta-bg.webp";
  const image    = String(content.image   ?? PLACEHOLDER);
  const siteMode = String((content as { siteMode?: string }).siteMode ?? "multipage");

  const resolve = (href: string) => resolveNavHref(href, siteMode, tenantSlug, isAdmin);

  const CREAM  = "#f5ede0";
  const AMBER  = "#c8943f";
  const RED    = "#c0392b";
  const DARK   = "#1a0e0a";
  const FONT   = "Georgia, 'Times New Roman', serif";
  const SANS   = "'Helvetica Neue', Helvetica, Arial, sans-serif";

  return (
    <section ref={secRef} id={id} data-template="restaurant-01" data-variant="restaurant-01-cta" className="r01-cta" style={{ position: "relative", overflow: "hidden", padding: "clamp(96px, 12vw, 152px) 0", fontFamily: SANS, backgroundColor: "#0f0a07" }}>
      {/* Bg foto — slow zoom on section hover */}
      <GenericEditableImage sectionId={sectionId} field="image" src={image || PLACEHOLDER} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
        <img
          className="r01-cta-bg"
          src={image || PLACEHOLDER}
          alt=""
          aria-hidden
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center", transition: "transform 6s ease-out" }}
        />
      </GenericEditableImage>
      {/* Overlay — radiální ztmavení pro čitelnost středu */}
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at center, rgba(15,10,7,0.68) 0%, rgba(15,10,7,0.86) 100%)" }} />

      {/* Amber hairlines nahoře + dole */}
      <div aria-hidden style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: `linear-gradient(to right, ${AMBER}00, ${AMBER}88, ${AMBER}00)` }} />
      <div aria-hidden style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 1, background: `linear-gradient(to right, ${AMBER}00, ${AMBER}88, ${AMBER}00)` }} />

      <div style={{ position: "relative", zIndex: 2, maxWidth: 720, margin: "0 auto", padding: "0 clamp(24px, 5vw, 64px)", textAlign: "center" }}>
        <div data-r01="0">
          <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.2em", textTransform: "uppercase", color: AMBER, margin: "0 0 18px" }}>
            <GenericEditableText sectionId={sectionId} field="tagline" value={tagline} tag="span" />
          </p>
          <div aria-hidden style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, margin: "0 auto 26px" }}>
            <span style={{ width: 40, height: 1, background: `${AMBER}66` }} />
            <span style={{ width: 6, height: 6, transform: "rotate(45deg)", background: AMBER }} />
            <span style={{ width: 40, height: 1, background: `${AMBER}66` }} />
          </div>
          <h2 style={{ fontFamily: FONT, fontSize: "clamp(32px, 4.2vw, 56px)", fontWeight: 400, lineHeight: 1.15, color: CREAM, margin: "0 0 22px", whiteSpace: "pre-line", textShadow: "0 2px 28px rgba(0,0,0,0.4)" }}>
            <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
          </h2>
          {body && (
            <p style={{ fontSize: 16, fontWeight: 300, lineHeight: 1.8, color: `${CREAM}cc`, margin: "0 auto 42px", maxWidth: 540 }}>
              <GenericEditableText sectionId={sectionId} field="body" value={body} tag="span" />
            </p>
          )}
          <div style={{ display: "flex", justifyContent: "center", flexWrap: "wrap", gap: 16 }}>
            <a href={resolve(ctaHref)} data-btn="primary" style={{ fontFamily: SANS, fontSize: 12, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#fff", textDecoration: "none", padding: "15px 40px", backgroundColor: RED, borderRadius: 3, display: "inline-block", transition: "background-color 0.25s ease, transform 0.25s ease, box-shadow 0.25s ease" }}
              onMouseEnter={e => { e.currentTarget.style.backgroundColor = "#a93226"; e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 28px rgba(192,57,43,0.45)"; }}
              onMouseLeave={e => { e.currentTarget.style.backgroundColor = RED; e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}
            >
              <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
            </a>
            <a href={resolve(ctaSecondaryHref)} style={{ fontFamily: SANS, fontSize: 12, fontWeight: 500, letterSpacing: "0.12em", textTransform: "uppercase", color: CREAM, textDecoration: "none", padding: "14px 40px", border: `1px solid ${CREAM}55`, borderRadius: 3, display: "inline-block", transition: "border-color 0.25s ease, color 0.25s ease, background-color 0.25s ease" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = CREAM; e.currentTarget.style.color = DARK; e.currentTarget.style.backgroundColor = `${CREAM}ee`; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = `${CREAM}55`; e.currentTarget.style.color = CREAM; e.currentTarget.style.backgroundColor = "transparent"; }}
            >
              <GenericEditableText sectionId={sectionId} field="ctaSecondaryText" value={ctaSecondaryText} tag="span" />
            </a>
          </div>
        </div>
      </div>
      <style>{`
        [data-variant="restaurant-01-cta"]:hover .r01-cta-bg{transform:scale(1.06)}
        [data-r01]{opacity:0;transform:translateY(36px);transition:opacity .72s cubic-bezier(.22,1,.36,1),transform .72s cubic-bezier(.22,1,.36,1)}[data-r01].r01-vis{opacity:1;transform:translateY(0)}
      `}</style>
    </section>
  );
}

// ── cafe-02-cta ────────────────────────────────────────────────────────────────
// Fullbleed atmosferické foto, tmavý overlay, centrovaný obsah
// Gold kicker + burgundy/cream serif H2 + body + 2 CTA tlačítka (burg filled + cream outline)
// ─────────────────────────────────────────────────────────────────────────────
function CtaCafe02({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const secRef = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = secRef.current;
    if (!el) return;
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) { (e.target as HTMLElement).classList.add("c02cta-vis"); obs.unobserve(e.target); } });
    }, { threshold: 0.15 });
    el.querySelectorAll<HTMLElement>("[data-c02cta]").forEach(i => obs.observe(i));
    return () => obs.disconnect();
  }, []);

  const id            = String(content.id       ?? "rezervace");
  const eyebrow       = String(content.eyebrow  ?? content.tagline ?? "Rezervujte si stůl");
  const title         = String(content.title    ?? "Udělejte si\nvelkolepou chvíli.");
  const body          = String(content.body     ?? "Salon Belvedere vítá hosty od časných snídaní až do noci. Rezervace předem jistí stůl u okna, čerstvý závin i vlastní čas mezi svícny.");
  const ctaText       = String(content.ctaText  ?? "Rezervovat stůl");
  const ctaHref       = String(content.ctaHref  ?? "/rezervace");
  const ctaSecondaryText = String(content.ctaSecondaryText ?? "Prohlédnout menu");
  const ctaSecondaryHref = String(content.ctaSecondaryHref ?? "/menu");
  const PLACEHOLDER = "https://images.unsplash.com/photo-1550966871-3ed3cbe818b0?w=1920&h=1200&fit=crop&fm=webp&q=88";
  const image       = String(content.image      ?? PLACEHOLDER);
  const hoursLabel  = String(content.hoursLabel ?? "Otevřeno denně");
  const hoursValue  = String(content.hoursValue ?? "8:00 – 23:00");
  const phoneLabel  = String(content.phoneLabel ?? "Rezervace telefonicky");
  const phoneValue  = String(content.phoneValue ?? "+420 700 111 222");

  return (
    <section
      ref={secRef}
      id={id}
      data-template="cafe-02"
      data-variant="cafe-02-cta"
      className="cafe02-cta"
      aria-label="Rezervace"
    >
      <div className="cafe02-cta__bg" aria-hidden>
        <GenericEditableImage sectionId={sectionId} field="image" src={image || PLACEHOLDER} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
          <img
            loading="lazy"
            src={image || PLACEHOLDER}
            alt=""
            aria-hidden
            className="cafe02-cta__bg-img"
          />
        </GenericEditableImage>
      </div>
      <div className="cafe02-cta__overlay" aria-hidden />
      <div className="cafe02-cta__glow" aria-hidden />

      {(["tl","tr","bl","br"] as const).map(pos => (
        <span key={pos} className={`cafe02-cta__corner cafe02-cta__corner--${pos}`} aria-hidden>
          <svg viewBox="0 0 40 40" fill="none">
            <path d="M0 0 H26 M0 0 V26" stroke="currentColor" strokeWidth="1"/>
            <circle cx="30" cy="30" r="1.6" fill="currentColor"/>
          </svg>
        </span>
      ))}

      <div className="cafe02-cta__inner" data-c02cta="0">
        <div className="cafe02-cta__eyebrow">
          <span className="cafe02-cta__eyebrow-rule" />
          <GenericEditableText sectionId={sectionId} field="eyebrow" value={eyebrow} tag="span" />
          <span className="cafe02-cta__eyebrow-rule" />
        </div>

        <h2 className="cafe02-cta__title">
          <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
        </h2>

        <div className="cafe02-cta__rule" aria-hidden><span /></div>

        {body && (
          <p className="cafe02-cta__body">
            <GenericEditableText sectionId={sectionId} field="body" value={body} tag="span" />
          </p>
        )}

        <div className="cafe02-cta__ctas">
          <a href={ctaHref} data-btn="primary" className="cafe02-cta__btn cafe02-cta__btn--gold">
            <span className="cafe02-nav__cta-shine" aria-hidden />
            <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
          </a>
          <a href={ctaSecondaryHref} className="cafe02-cta__btn cafe02-cta__btn--ghost">
            <GenericEditableText sectionId={sectionId} field="ctaSecondaryText" value={ctaSecondaryText} tag="span" />
            <svg width="16" height="10" viewBox="0 0 16 10" fill="none" aria-hidden className="cafe02-cta__arrow">
              <path d="M1 5H15M10 1L15 5L10 9" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </a>
        </div>

        <ul className="cafe02-cta__trust">
          <li>
            <span className="cafe02-cta__trust-label">
              <GenericEditableText sectionId={sectionId} field="hoursLabel" value={hoursLabel} tag="span" />
            </span>
            <span className="cafe02-cta__trust-value">
              <GenericEditableText sectionId={sectionId} field="hoursValue" value={hoursValue} tag="span" />
            </span>
          </li>
          <li className="cafe02-cta__trust-sep" aria-hidden />
          <li>
            <span className="cafe02-cta__trust-label">
              <GenericEditableText sectionId={sectionId} field="phoneLabel" value={phoneLabel} tag="span" />
            </span>
            <a href={"tel:" + phoneValue.replace(/\s+/g, "")} className="cafe02-cta__trust-value cafe02-cta__trust-link">
              <GenericEditableText sectionId={sectionId} field="phoneValue" value={phoneValue} tag="span" />
            </a>
          </li>
        </ul>
      </div>
    </section>
  );
}

// ── restaurant-02-cta ─────────────────────────────────────────────────────────
// Fullscreen tmavá sekce s foto bg, centrovaný text + 2× CTA — ref: hybernska.cz
// ─────────────────────────────────────────────────────────────────────────────
function CtaRestaurant02({ content, sectionId, tenantSlug, isAdmin }: { content: Record<string, unknown>; sectionId: number; tenantSlug?: string; isAdmin?: boolean }) {
  const id                = String(content.id                ?? "rezervace");
  const tagline           = String(content.tagline           ?? "Rezervujte si místo");
  const title             = String(content.title             ?? "Přijďte ochutnat\npravou českou kuchyni.");
  const body              = String(content.body              ?? "");
  const ctaText           = String(content.ctaText           ?? "Rezervovat stůl");
  const ctaHref           = String(content.ctaHref           ?? "/kontakt");
  const ctaSecondaryText  = String(content.ctaSecondaryText  ?? "Jídelní lístek");
  const ctaSecondaryHref  = String(content.ctaSecondaryHref  ?? "/menu");
  const image             = String(content.image             ?? "/templates/restaurant-02/cta-bg.webp");
  const siteMode          = String(content.siteMode          ?? "multipage");

  const RED     = "#c0392b";
  const WHITE   = "#ffffff";
  const POPPINS = "'Poppins', sans-serif";

  const secRef = useRef<HTMLElement>(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const el = secRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVis(true); obs.disconnect(); } }, { threshold: 0.15 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const resolve = (href: string) => resolveNavHref(href, siteMode, tenantSlug, isAdmin);
  const rise = (d: number): React.CSSProperties => ({
    opacity: vis ? 1 : 0,
    transform: vis ? "translateY(0)" : "translateY(24px)",
    transition: `opacity 0.7s cubic-bezier(.2,.7,.2,1) ${d}s, transform 0.7s cubic-bezier(.2,.7,.2,1) ${d}s`,
  });

  return (
    <section ref={secRef} id={id} data-template="restaurant-02" style={{ position: "relative", overflow: "hidden", padding: "clamp(88px, 11vw, 150px) 0", fontFamily: POPPINS, backgroundColor: "#111" }}>
      {/* Foto pozadí — jemný Ken Burns */}
      <GenericEditableImage sectionId={sectionId} field="image" src={image} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
        <img loading="lazy" src={image} alt="" aria-hidden className="r02-cta-bg" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center", display: "block" }} />
      </GenericEditableImage>
      {/* Overlay — gradient pro hloubku */}
      <div aria-hidden style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.58) 50%, rgba(0,0,0,0.78) 100%)" }} />
      {/* Jemné červené hairline pásky nahoře/dole */}
      <span aria-hidden style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: RED, opacity: 0.85 }} />

      {/* Obsah */}
      <div style={{ position: "relative", zIndex: 1, maxWidth: 760, margin: "0 auto", padding: "0 clamp(24px, 6vw, 60px)", textAlign: "center" }}>
        <p style={{ ...rise(0), fontSize: 11.5, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "#f0c4bd", margin: "0 0 14px" }}>
          <GenericEditableText sectionId={sectionId} field="tagline" value={tagline} tag="span" />
        </p>
        <span className="r02-cta-rule" aria-hidden style={{ ...rise(0.06), display: "block", width: 48, height: 3, backgroundColor: RED, margin: "0 auto 24px", borderRadius: 2 }} />
        <h2 style={{ ...rise(0.12), fontSize: "clamp(30px, 3.8vw, 54px)", fontWeight: 700, lineHeight: 1.13, color: WHITE, margin: "0 0 20px", whiteSpace: "pre-line", textShadow: "0 2px 24px rgba(0,0,0,0.4)" }}>
          <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
        </h2>
        {body && (
          <p style={{ ...rise(0.18), fontSize: 15, lineHeight: 1.8, color: "rgba(255,255,255,0.78)", margin: "0 auto 40px", maxWidth: 600 }}>
            <GenericEditableText sectionId={sectionId} field="body" value={body} tag="span" />
          </p>
        )}
        <div className="r02-cta-btns" style={{ ...rise(0.26), display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
          <a
            href={resolve(ctaHref)}
            className="r02-cta-primary"
            style={{ fontSize: 12.5, fontWeight: 700, letterSpacing: "0.11em", textTransform: "uppercase", color: WHITE, textDecoration: "none", padding: "16px 42px", backgroundColor: RED, display: "inline-block", position: "relative", overflow: "hidden" }}
          >
            <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
          </a>
          <a
            href={resolve(ctaSecondaryHref)}
            className="r02-cta-ghost"
            style={{ fontSize: 12.5, fontWeight: 600, letterSpacing: "0.11em", textTransform: "uppercase", color: WHITE, textDecoration: "none", padding: "15px 42px", border: "1px solid rgba(255,255,255,0.55)", display: "inline-block" }}
          >
            <GenericEditableText sectionId={sectionId} field="ctaSecondaryText" value={ctaSecondaryText} tag="span" />
          </a>
        </div>
      </div>
    </section>
  );
}

// ── restaurant-03-cta ─────────────────────────────────────────────────────────
// La Casa Dorada — luxe zlatý pás. Bohatý zlatý gradient (#b97d26→#a06b1a) +
// vnitřní deep-green hairline rám s rohovými diamanty + faint ◆ watermark.
// Deep-green serif H2, ornament divider, dual CTA (green fill + green outline).
// ─────────────────────────────────────────────────────────────────────────────
function CtaRestaurant03({
  content, sectionId, tenantSlug, isAdmin,
}: { content: Record<string, unknown>; sectionId: number; tenantSlug?: string; isAdmin: boolean }) {
  const id       = String(content.id       ?? "rezervace");
  const tagline  = String(content.tagline  ?? "Rezervujte si místo");
  const title    = String(content.title    ?? "Samba, Salsa, Bachata\na skvělé jídlo.");
  const body     = String(content.body     ?? "");
  const ctaText  = String(content.ctaText  ?? "Rezervovat stůl");
  const ctaHref  = String(content.ctaHref  ?? "/kontakt");
  const cta2Text = String(content.ctaSecondaryText ?? "Prohlédnout menu");
  const cta2Href = String(content.ctaSecondaryHref ?? "/menu");
  const siteMode = String(content.siteMode ?? "multipage");

  const GREEN   = "#0c351a";
  const GREEN_2 = "#0a2d15";
  const GOLD    = "#b97d26";
  const FONT  = "Georgia, 'Times New Roman', serif";
  const SANS  = "'Helvetica Neue', Helvetica, Arial, sans-serif";

  const resolve = (href: string) => resolveNavHref(href, siteMode, tenantSlug, isAdmin);

  return (
    <section
      id={id}
      data-template="restaurant-03"
      data-variant="restaurant-03-cta"
      style={{
        background: `linear-gradient(135deg, #c68a2e 0%, ${GOLD} 42%, #a06b1a 100%)`,
        padding: "clamp(64px,8vw,104px) clamp(24px, 6vw, 80px)", fontFamily: SANS,
        textAlign: "center", position: "relative", overflow: "hidden",
      }}
    >
      {/* Radiální highlight + faint watermark */}
      <span aria-hidden style={{ position: "absolute", inset: 0, background: "radial-gradient(60% 120% at 50% 0%, rgba(255,255,255,0.18), rgba(255,255,255,0) 60%)", pointerEvents: "none" }} />
      <span aria-hidden style={{ position: "absolute", left: "50%", top: "50%", transform: "translate(-50%,-50%)", fontFamily: FONT, fontSize: "clamp(220px,32vw,420px)", lineHeight: 1, color: "rgba(12,53,26,0.06)", pointerEvents: "none", userSelect: "none" }}>◆</span>

      {/* Vnitřní hairline rám */}
      <div style={{ position: "relative", maxWidth: 780, margin: "0 auto", padding: "clamp(28px,5vw,52px) clamp(20px,5vw,56px)", border: `1px solid rgba(12,53,26,0.35)` }}>
        {(["tl","tr","bl","br"] as const).map(p => (
          <span key={p} aria-hidden style={{
            position: "absolute", width: 8, height: 8, background: GREEN, transform: "rotate(45deg)",
            top: p[0] === "t" ? -4 : undefined, bottom: p[0] === "b" ? -4 : undefined,
            left: p[1] === "l" ? -4 : undefined, right: p[1] === "r" ? -4 : undefined,
          }} />
        ))}

        {/* Kicker */}
        <p style={{ fontFamily: SANS, fontSize: 11.5, fontWeight: 700, letterSpacing: "0.26em", textTransform: "uppercase", color: GREEN, margin: "0 0 18px" }}>
          <GenericEditableText sectionId={sectionId} field="tagline" value={tagline} tag="span" />
        </p>

        {/* H2 */}
        <h2 style={{ fontFamily: FONT, fontSize: "clamp(28px, 4.4vw, 54px)", fontWeight: 400, color: GREEN, margin: "0 0 18px", lineHeight: 1.14, textTransform: "uppercase", letterSpacing: "0.03em", whiteSpace: "pre-line" }}>
          <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
        </h2>

        {/* Ornament divider */}
        <div aria-hidden style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, margin: "0 0 22px" }}>
          <span style={{ width: 44, height: 1, background: `linear-gradient(to right, ${GREEN}00, ${GREEN}88)` }} />
          <span style={{ width: 7, height: 7, background: GREEN, transform: "rotate(45deg)" }} />
          <span style={{ width: 44, height: 1, background: `linear-gradient(to left, ${GREEN}00, ${GREEN}88)` }} />
        </div>

        {/* Body */}
        {body && (
          <p style={{ fontFamily: SANS, fontSize: 16, lineHeight: 1.75, color: "rgba(12,53,26,0.82)", margin: "0 auto 34px", maxWidth: 560 }}>
            <GenericEditableText sectionId={sectionId} field="body" value={body} tag="span" />
          </p>
        )}

        {/* CTAs */}
        <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap", marginTop: body ? 0 : 30 }}>
          <a
            href={resolve(ctaHref)}
            data-btn="primary"
            style={{
              fontFamily: SANS, fontSize: 12, fontWeight: 600, letterSpacing: "0.16em",
              textTransform: "uppercase", color: "#f4e6c8", textDecoration: "none",
              padding: "15px 40px", backgroundColor: GREEN, borderRadius: 2,
              display: "inline-flex", alignItems: "center", gap: 10,
              boxShadow: "0 10px 30px rgba(12,53,26,0.35)",
              transition: "background-color 0.3s, transform 0.3s, box-shadow 0.3s",
            }}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = GREEN_2; e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 16px 40px rgba(12,53,26,0.45)"; }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = GREEN; e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 10px 30px rgba(12,53,26,0.35)"; }}
          >
            <span aria-hidden style={{ width: 6, height: 6, background: "currentColor", transform: "rotate(45deg)" }} />
            <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
          </a>
          {cta2Text && (
            <a
              href={resolve(cta2Href)}
              style={{
                fontFamily: SANS, fontSize: 12, fontWeight: 600, letterSpacing: "0.16em",
                textTransform: "uppercase", color: GREEN, textDecoration: "none",
                padding: "15px 40px", border: `1px solid ${GREEN}`, borderRadius: 2,
                transition: "background-color 0.3s, color 0.3s",
              }}
              onMouseEnter={e => { e.currentTarget.style.backgroundColor = GREEN; e.currentTarget.style.color = "#f4e6c8"; }}
              onMouseLeave={e => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = GREEN; }}
            >
              <GenericEditableText sectionId={sectionId} field="ctaSecondaryText" value={cta2Text} tag="span" />
            </a>
          )}
        </div>
      </div>
    </section>
  );
}

// ── cafe-03-cta ───────────────────────────────────────────────────────────────
// Cathedral Reservation Banner — luxe redesign (2026-07-02)
// Fixed-attachment parallax background photo, deep noir vignette overlay,
// gold hairline frame kolem obsahu, Great Vibes H2 vrstvený s Cormorant italic
// subtitle + diamond divider, dual CTAs (gold-fill + phone ghost), utility rail
// dole s otvíracími hodinami · adresou · telefonem.
// ─────────────────────────────────────────────────────────────────────────────
function CtaCafe03({ content, sectionId, tenantSlug, isAdmin }: { content: Record<string, unknown>; sectionId: number; tenantSlug?: string; isAdmin: boolean }) {
  const GOLD    = "#C69C60";
  const GOLD_LT = "#D8B57A";
  const GOLD_DK = "#8F6A38";
  const NOIR    = "#0d0d0d";
  const CREAM   = "#F5EFE4";
  const SCRIPT  = "'Great Vibes', cursive";
  const ITAL    = "'Cormorant Garamond', 'Playfair Display', Georgia, serif";
  const SANS    = "'Inter', 'Open Sans', system-ui, sans-serif";

  const eyebrow  = String(content.eyebrow  ?? "REZERVUJTE STŮL");
  const kicker   = String(content.kicker   ?? "otevřeno denně · 9:00 — 22:00");
  const title    = String(content.title    ?? "Katedrální večeře");
  const subtitle = String(content.subtitle ?? "vína · sezónní menu · svícený sál");
  const body     = String(content.body     ?? "Stůl pro dva pod klenutými stropy, tichá klavírní jazz linka a sklenka moravského ryzlinku — Cathedral Café je místem, kam se vracejí ti, kteří vědí, že večer začíná dobře prostřeným stolem.");
  const ctaText  = String(content.ctaText  ?? "Rezervace stolu");
  const ctaHref  = String(content.ctaHref  ?? "/kontakt");
  const phone    = String(content.phone    ?? "+420 704 218 640");
  const phoneHref = String(content.phoneHref ?? "tel:+420704218640");
  const address  = String(content.address  ?? "Melantrichova 15 · Praha 1");
  const hours    = String(content.hours    ?? "9:00 — 22:00");
  const bgImage  = String(content.backgroundImage ?? "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=2000&h=1200&fit=crop&fm=webp&q=88");
  const siteMode = String(content.siteMode ?? "multipage");

  // Local resolveNavHref (multipage/onepage compat) — matches NavbarSection helper.
  const resolve = (href: string): string => {
    if (!href) return "#";
    if (siteMode === "onepage") {
      if (href.startsWith("/") && href !== "/") {
        const slug = href.replace(/^\//, "");
        return tenantSlug ? (isAdmin ? `/demo/${tenantSlug}/admin#${slug}` : `/demo/${tenantSlug}#${slug}`) : `/#${slug}`;
      }
      if (href.startsWith("#")) {
        return tenantSlug ? (isAdmin ? `/demo/${tenantSlug}/admin${href}` : `/demo/${tenantSlug}${href}`) : href;
      }
      return href;
    }
    if (href.startsWith("#")) {
      const slug = href.replace(/^#/, "");
      return tenantSlug ? (isAdmin ? `/demo/${tenantSlug}/${slug}/admin` : `/demo/${tenantSlug}/${slug}`) : `/${slug}`;
    }
    if (href.startsWith("/") && tenantSlug) {
      return isAdmin ? `/demo/${tenantSlug}${href === "/" ? "" : href}/admin` : `/demo/${tenantSlug}${href === "/" ? "" : href}`;
    }
    return href;
  };

  return (
    <section data-template="cafe-03" className="c3cta" style={{ position: "relative", overflow: "hidden", padding: "clamp(96px, 14vw, 180px) clamp(20px, 5vw, 60px)", textAlign: "center", fontFamily: SANS, color: CREAM, backgroundColor: NOIR }}>
      {/* Parallax background */}
      <div aria-hidden style={{ position: "absolute", inset: 0, backgroundImage: `url("${bgImage}")`, backgroundSize: "cover", backgroundPosition: "center", backgroundAttachment: "fixed", transform: "scale(1.05)" }} />
      <GenericEditableImage sectionId={sectionId} field="backgroundImage" src={bgImage} alt="" style={{ position: "absolute", inset: 0, opacity: 0, pointerEvents: "none" }}>
        <img src={bgImage} alt="" style={{ display: "none" }} />
      </GenericEditableImage>

      {/* Deep noir vignette */}
      <div aria-hidden style={{ position: "absolute", inset: 0, backgroundImage: `radial-gradient(ellipse at center, rgba(13,13,13,0.55) 0%, rgba(13,13,13,0.82) 70%, rgba(5,5,5,0.94) 100%), linear-gradient(180deg, rgba(13,13,13,0.4) 0%, rgba(5,5,5,0.7) 100%)` }} />

      {/* Gold hairline frame */}
      <div aria-hidden className="c3cta-frame" style={{ position: "absolute", inset: "clamp(28px, 5vw, 56px)", border: `1px solid ${GOLD}55`, pointerEvents: "none" }}>
        <span style={{ position: "absolute", top: -6, left: -6, width: 24, height: 24, borderTop: `1.5px solid ${GOLD}`, borderLeft: `1.5px solid ${GOLD}` }} />
        <span style={{ position: "absolute", top: -6, right: -6, width: 24, height: 24, borderTop: `1.5px solid ${GOLD}`, borderRight: `1.5px solid ${GOLD}` }} />
        <span style={{ position: "absolute", bottom: -6, left: -6, width: 24, height: 24, borderBottom: `1.5px solid ${GOLD}`, borderLeft: `1.5px solid ${GOLD}` }} />
        <span style={{ position: "absolute", bottom: -6, right: -6, width: 24, height: 24, borderBottom: `1.5px solid ${GOLD}`, borderRight: `1.5px solid ${GOLD}` }} />
      </div>

      {/* Content */}
      <div style={{ position: "relative", zIndex: 2, maxWidth: 780, margin: "0 auto" }}>
        {/* Eyebrow */}
        <div style={{ display: "inline-flex", alignItems: "center", gap: 14, marginBottom: 18 }}>
          <span aria-hidden style={{ display: "inline-block", width: 32, height: 1, backgroundColor: GOLD }} />
          <GenericEditableText sectionId={sectionId} field="eyebrow" value={eyebrow} tag="span">
            <span style={{ fontFamily: SANS, fontSize: 11, fontWeight: 500, letterSpacing: "0.36em", textTransform: "uppercase", color: GOLD_LT }}>{eyebrow}</span>
          </GenericEditableText>
          <span aria-hidden style={{ display: "inline-block", width: 32, height: 1, backgroundColor: GOLD }} />
        </div>

        {/* Kicker */}
        <GenericEditableText sectionId={sectionId} field="kicker" value={kicker} tag="p">
          <p style={{ fontFamily: ITAL, fontStyle: "italic", fontSize: "clamp(15px, 1.4vw, 18px)", color: CREAM, opacity: 0.75, margin: "0 0 4px", letterSpacing: "0.04em" }}>{kicker}</p>
        </GenericEditableText>

        {/* H2 Great Vibes */}
        <GenericEditableText sectionId={sectionId} field="title" value={title} tag="h2">
          <h2 style={{ fontFamily: SCRIPT, fontSize: "clamp(56px, 8vw, 118px)", fontWeight: 400, color: "#fff", margin: 0, lineHeight: 1.05, letterSpacing: "0.01em", textShadow: "0 4px 30px rgba(0,0,0,0.5)" }}>
            {title}
          </h2>
        </GenericEditableText>

        {/* Cormorant italic subtitle */}
        <GenericEditableText sectionId={sectionId} field="subtitle" value={subtitle} tag="p">
          <p style={{ fontFamily: ITAL, fontStyle: "italic", fontSize: "clamp(18px, 1.9vw, 24px)", fontWeight: 500, color: GOLD_LT, margin: "8px 0 24px", letterSpacing: "0.02em" }}>— {subtitle}</p>
        </GenericEditableText>

        {/* Diamond divider */}
        <div aria-hidden style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, marginBottom: 24 }}>
          <span style={{ display: "inline-block", width: 60, height: 1, backgroundColor: GOLD }} />
          <span style={{ display: "inline-block", width: 6, height: 6, transform: "rotate(45deg)", border: `1px solid ${GOLD}` }} />
          <span style={{ display: "inline-block", width: 60, height: 1, backgroundColor: GOLD }} />
        </div>

        {/* Body */}
        <GenericEditableText sectionId={sectionId} field="body" value={body} tag="p">
          <p style={{ fontFamily: SANS, fontSize: "clamp(15px, 1.2vw, 17px)", fontWeight: 400, color: "rgba(245,239,228,0.82)", margin: "0 auto 40px", maxWidth: 620, lineHeight: 1.75 }}>
            {body}
          </p>
        </GenericEditableText>

        {/* Dual CTAs */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 16, justifyContent: "center" }}>
          <a
            href={resolve(ctaHref)}
            data-btn="primary"
            className="c3cta-primary"
            style={{ fontFamily: SANS, fontSize: 12, fontWeight: 600, letterSpacing: "0.24em", textTransform: "uppercase", color: NOIR, textDecoration: "none", padding: "16px 36px", backgroundColor: GOLD, display: "inline-flex", alignItems: "center", gap: 10, transition: "background-color 0.28s ease, letter-spacing 0.28s ease" }}
          >
            <span style={{ fontFamily: ITAL, fontStyle: "italic", textTransform: "none", letterSpacing: "0.02em", fontSize: 16, fontWeight: 500 }}>~</span>
            <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
          </a>
          <a
            href={phoneHref}
            data-btn="ghost"
            className="c3cta-phone"
            style={{ fontFamily: SANS, fontSize: 12, fontWeight: 600, letterSpacing: "0.24em", textTransform: "uppercase", color: GOLD_LT, textDecoration: "none", padding: "16px 36px", border: `1px solid ${GOLD}88`, backgroundColor: "transparent", display: "inline-flex", alignItems: "center", gap: 10, transition: "background-color 0.28s ease, color 0.28s ease, border-color 0.28s ease" }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
            <GenericEditableText sectionId={sectionId} field="phone" value={phone} tag="span" />
          </a>
        </div>

        {/* Utility rail */}
        <div className="c3cta-rail" style={{ display: "flex", justifyContent: "center", alignItems: "center", flexWrap: "wrap", gap: 24, marginTop: 48, paddingTop: 28, borderTop: `1px solid ${GOLD}44`, maxWidth: 620, marginInline: "auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, color: GOLD_LT }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            <span style={{ fontFamily: ITAL, fontStyle: "italic", fontSize: 15 }}>
              <GenericEditableText sectionId={sectionId} field="hours" value={hours} tag="span" />
            </span>
          </div>
          <span aria-hidden style={{ width: 1, height: 16, backgroundColor: `${GOLD}55` }} />
          <div style={{ display: "flex", alignItems: "center", gap: 10, color: GOLD_LT }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round"><path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/></svg>
            <span style={{ fontFamily: ITAL, fontStyle: "italic", fontSize: 15 }}>
              <GenericEditableText sectionId={sectionId} field="address" value={address} tag="span" />
            </span>
          </div>
        </div>
      </div>

      <style>{`
        [data-template="cafe-03"].c3cta .c3cta-primary:hover { background-color: ${GOLD_LT} !important; letter-spacing: 0.28em !important; }
        [data-template="cafe-03"].c3cta .c3cta-phone:hover { background-color: ${GOLD} !important; color: ${NOIR} !important; border-color: ${GOLD} !important; }
        @media (max-width: 767px) {
          [data-template="cafe-03"].c3cta .c3cta-rail { flex-direction: column; gap: 14px; }
          [data-template="cafe-03"].c3cta .c3cta-rail > span { display: none; }
        }
        @media (hover: none) { [data-template="cafe-03"].c3cta > div[aria-hidden]:first-of-type { background-attachment: scroll !important; } }
      `}</style>
    </section>
  );
}

// ── cafe-04-newsletter ────────────────────────────────────────────────────────
// Editorial newsletter — parallax bg, cinematic dark veil, kinetic reveal,
// integrated inline form s coffee-gold underline focus + micro-privacy copy
// ─────────────────────────────────────────────────────────────────────────────
function NewsletterCafe04({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const eyebrow          = String(content.eyebrow          ?? "Newsletter");
  const heading          = String(content.heading          ?? "Don't miss anything.");
  const subheading       = String(content.subheading       ?? "Přihlaste se k odběru novinek a buďte první, kdo se dozví o nových kávách, ochutnávkách a příbězích z pražírny.");
  const inputPlaceholder = String(content.inputPlaceholder ?? "vaše e-mailová adresa");
  const ctaText          = String(content.ctaText          ?? "Přihlásit se");
  const successText      = String(content.successText      ?? "Díky, brzy se ozveme!");
  const privacyText      = String(content.privacyText      ?? "Žádný spam. Odhlásit se můžete kdykoliv.");
  const bgImage          = String(content.backgroundImage  ?? "/assets/cafe-04/newsletter-bg.webp");

  const [submitted, setSubmitted] = useState(false);
  const [email, setEmail] = useState("");

  return (
    <section className="cr04-nl" data-template="cafe-04">
      <GenericEditableImage
        sectionId={sectionId}
        field="backgroundImage"
        src={bgImage}
        alt=""
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", display: "block" }}
      >
        <img src={bgImage} alt="" loading="lazy" className="cr04-nl-bg" />
      </GenericEditableImage>
      <div className="cr04-nl-veil" aria-hidden />

      <div className="cr04-nl-inner">
        <span className="cr04-nl-eyebrow">
          <span className="cr04-nl-eyebrow-rule" aria-hidden />
          <GenericEditableText sectionId={sectionId} field="eyebrow" value={eyebrow} tag="span" />
          <span className="cr04-nl-eyebrow-rule" aria-hidden />
        </span>

        <h2 className="cr04-nl-title">
          <GenericEditableText sectionId={sectionId} field="heading" value={heading} tag="span" />
        </h2>

        <p className="cr04-nl-sub">
          <GenericEditableText sectionId={sectionId} field="subheading" value={subheading} tag="span" />
        </p>

        {!submitted ? (
          <form
            className="cr04-nl-form"
            onSubmit={(e) => { e.preventDefault(); if (email) setSubmitted(true); }}
          >
            <label className="cr04-nl-field">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={inputPlaceholder}
                className="cr04-nl-input"
                aria-label={inputPlaceholder}
              />
              <span className="cr04-nl-input-rule" aria-hidden />
            </label>
            <button type="submit" className="cr04-nl-btn">
              <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
              <svg width="16" height="10" viewBox="0 0 16 10" fill="none" aria-hidden>
                <path d="M1 5H15M10 1L15 5L10 9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </form>
        ) : (
          <p className="cr04-nl-success">
            <GenericEditableText sectionId={sectionId} field="successText" value={successText} tag="span" />
          </p>
        )}

        <p className="cr04-nl-privacy">
          <GenericEditableText sectionId={sectionId} field="privacyText" value={privacyText} tag="span" />
        </p>
      </div>
    </section>
  );
}

// ── reality-02-cta ────────────────────────────────────────────────────────────
// Ref: realitni-pruvodce.cz "Prodejte svou nemovitost výhodněji než ostatní"
// Bílé bg, centrovaný H2 + subtitle + zelené filled pill CTA
// ─────────────────────────────────────────────────────────────────────────────
function CtaReality02({ content, sectionId, tenantSlug, isAdmin }: { content: Record<string, unknown>; sectionId: number; tenantSlug?: string; isAdmin: boolean }) {
  const title    = String(content.title    ?? "Prodejte svou nemovitost výhodněji než ostatní");
  const subtitle = String(content.subtitle ?? "Zjistěte, za kolik můžete s dobrým makléřem prodat svůj byt, dům či pozemek.");
  const ctaText  = String(content.ctaText  ?? "Zjistit");
  const ctaHref  = String(content.ctaHref  ?? "#prodej");

  const DARK  = "#05303a";
  const GREEN = "#3DCE78";
  const FONT  = "'Montserrat', 'Helvetica Neue', Arial, sans-serif";

  const resolve = (href: string) => {
    if (!tenantSlug) return href;
    if (href.startsWith("#")) return href;
    if (href === "/") return `/demo/${tenantSlug}${isAdmin ? "/admin" : ""}`;
    return `/demo/${tenantSlug}${isAdmin ? "/admin" : ""}${href}`;
  };

  return (
    <section id="cta" style={{ backgroundColor: "#ffffff", fontFamily: FONT, textAlign: "center", position: "relative" }}>
      {/* teal trojúhelník nahoře — přechod z teal sekce výše */}
      <div style={{ width: 0, height: 0, borderLeft: "60px solid transparent", borderRight: "60px solid transparent", borderTop: "44px solid #e8efee", margin: "0 auto" }} />
      <div style={{ padding: "clamp(48px,7vw,88px) clamp(16px,5vw,48px) clamp(56px,9vw,104px)" }}>
        <h2 style={{ fontSize: "clamp(22px,3.5vw,36px)", fontWeight: 800, color: DARK, maxWidth: 700, margin: "0 auto 16px" }}>
          <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
        </h2>
        <p style={{ fontSize: 16, color: DARK, opacity: 0.75, maxWidth: 560, margin: "0 auto 40px", lineHeight: 1.6 }}>
          <GenericEditableText sectionId={sectionId} field="subtitle" value={subtitle} tag="span" />
        </p>
        <a
          href={resolve(ctaHref)}
          data-btn="primary"
          style={{ display: "inline-block", padding: "14px 48px", backgroundColor: GREEN, color: "#ffffff", fontSize: 14, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", textDecoration: "none", borderRadius: 6, transition: "background 0.2s" }}
          onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#2db868")}
          onMouseLeave={e => (e.currentTarget.style.backgroundColor = GREEN)}
        >
          <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
        </a>
      </div>
    </section>
  );
}

// ── reality-01-cta ────────────────────────────────────────────────────────────
function CtaReality01({ content, sectionId, tenantSlug, isAdmin }: { content: Record<string, unknown>; sectionId: number; tenantSlug?: string; isAdmin: boolean }) {
  const title            = String(content.title            ?? "Prodáváte, kupujete\nči jen zvažujete?");
  const subtitle         = String(content.subtitle         ?? "Zavolejte nám nebo napište — nezávazně poradíme, co je pro vás v danou chvíli nejlepší krok.");
  const ctaText          = String(content.ctaText          ?? "Domluvit schůzku");
  const ctaHref          = String(content.ctaHref          ?? "/kontakt");
  const ctaSecondaryText = String(content.ctaSecondaryText ?? "Celá nabídka");
  const ctaSecondaryHref = String(content.ctaSecondaryHref ?? "/vypis-nemovitosti");
  const siteMode         = String(content.siteMode         ?? "multipage");

  const DARK = "#1a3640";
  const GOLD = "#d4a96e";
  const WHITE = "#ffffff";
  const SURFACE = "#f4ebe5";
  const FONT = "'Montserrat', 'Helvetica Neue', Arial, sans-serif";
  const BODY = "'Open Sans', 'Helvetica Neue', Arial, sans-serif";

  // Local resolveNavHref (multipage/onepage compat)
  const resolve = (href: string): string => {
    if (!href) return "#";
    if (siteMode === "onepage") {
      if (href.startsWith("/") && href !== "/") {
        const slug = href.replace(/^\//, "");
        return tenantSlug ? (isAdmin ? `/demo/${tenantSlug}/admin#${slug}` : `/demo/${tenantSlug}#${slug}`) : `/#${slug}`;
      }
      if (href.startsWith("#")) {
        return tenantSlug ? (isAdmin ? `/demo/${tenantSlug}/admin${href}` : `/demo/${tenantSlug}${href}`) : href;
      }
      return href;
    }
    if (href.startsWith("#")) {
      const slug = href.replace(/^#/, "");
      return tenantSlug ? (isAdmin ? `/demo/${tenantSlug}/${slug}/admin` : `/demo/${tenantSlug}/${slug}`) : `/${slug}`;
    }
    if (href.startsWith("/") && tenantSlug) {
      return isAdmin ? `/demo/${tenantSlug}${href === "/" ? "" : href}/admin` : `/demo/${tenantSlug}${href === "/" ? "" : href}`;
    }
    return href;
  };

  return (
    <section data-template="reality-01" id="cta" style={{ backgroundColor: SURFACE, padding: "clamp(72px,10vw,120px) 0", position: "relative", overflow: "hidden" }}>
      {/* Gold separator lines top+bottom */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: `linear-gradient(90deg, transparent 10%, ${GOLD} 50%, transparent 90%)`, opacity: 0.25 }} aria-hidden="true" />
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 1, background: `linear-gradient(90deg, transparent 10%, ${GOLD} 50%, transparent 90%)`, opacity: 0.25 }} aria-hidden="true" />

      <div style={{ maxWidth: 720, margin: "0 auto", padding: "0 clamp(20px,4vw,56px)", textAlign: "center", position: "relative", zIndex: 1 }}>
        {/* Gold diamond ornament */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 28 }}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill={GOLD} opacity={0.45} aria-hidden="true"><rect x="7" y="0" width="7" height="7" transform="rotate(45 7 0)"/></svg>
        </div>

        <GenericEditableText sectionId={sectionId} field="title" value={title} tag="h2"
          style={{ fontFamily: FONT, fontSize: "clamp(28px,4.2vw,48px)", fontWeight: 700, lineHeight: 1.15, color: DARK, margin: "0 0 20px", letterSpacing: "-0.02em", whiteSpace: "pre-line" }} />
        <GenericEditableText sectionId={sectionId} field="subtitle" value={subtitle} tag="p"
          style={{ fontFamily: BODY, fontSize: 17, color: "#6b7280", margin: "0 0 44px", lineHeight: 1.7, maxWidth: 560, marginLeft: "auto", marginRight: "auto" }} />
        <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
          <a href={resolve(ctaHref)} className="r01-cta-primary" style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            backgroundColor: DARK, color: WHITE,
            fontFamily: FONT, fontSize: 13, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase" as const,
            padding: "15px 38px", borderRadius: 4, textDecoration: "none",
            transition: "background 0.25s, transform 0.25s, box-shadow 0.25s",
            boxShadow: "0 4px 20px rgba(26,54,64,0.15)",
          }}>
            <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14m-7-7 7 7-7 7"/></svg>
          </a>
          <a href={resolve(ctaSecondaryHref)} className="r01-cta-ghost" style={{
            display: "inline-flex", alignItems: "center",
            border: `1.5px solid ${DARK}`, color: DARK,
            fontFamily: FONT, fontSize: 13, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" as const,
            padding: "15px 38px", borderRadius: 4, textDecoration: "none",
            transition: "background 0.25s, color 0.25s",
          }}>
            <GenericEditableText sectionId={sectionId} field="ctaSecondaryText" value={ctaSecondaryText} tag="span" />
          </a>
        </div>
      </div>
    </section>
  );
}

// ── reality-04-hotline ────────────────────────────────────────────────────────
// Světlé #f2f2f2 bg; horizontální lišta: vlevo telefon + claim (jedno slovo
// akcentované modrou #1032CF); vpravo zelené pill CTA. Na mobilu stacked.
// ─────────────────────────────────────────────────────────────────────────────
function HotlineReality04({ content, sectionId, tenantSlug, isAdmin }: { content: Record<string, unknown>; sectionId: number; tenantSlug?: string; isAdmin: boolean }) {
  const siteMode     = String(content.siteMode ?? "multipage");
  const eyebrow      = String(content.eyebrow      ?? "Infolinka");
  const phone        = String(content.phone        ?? "704 123 456");
  const claim        = String(content.claim        ?? "Zeptejte se na cokoliv, jsme tu pro vás každý všední den 8–20 h.");
  const claimAccent  = String(content.claimAccent  ?? "cokoliv");
  const ctaText      = String(content.ctaText      ?? "Chci více informací");
  const ctaHref      = String(content.ctaHref      ?? "/kontakt");

  const GREEN   = "#21b276";
  const WHITE   = "#ffffff";
  const SANS    = "'Helvetica Neue', Helvetica, Arial, sans-serif";

  const resolve = (href: string) => resolveNavHref(href, siteMode, tenantSlug, isAdmin);

  const renderClaim = () => {
    if (!claimAccent || !claim.includes(claimAccent)) {
      return <GenericEditableText sectionId={sectionId} field="claim" value={claim} tag="span" />;
    }
    const parts = claim.split(claimAccent);
    return (
      <span>
        {parts[0]}
        <span style={{ color: "#8ff0c4", fontWeight: 700 }}>{claimAccent}</span>
        {parts[1]}
      </span>
    );
  };

  return (
    <section style={{ backgroundColor: "#fff", padding: "clamp(24px, 4vw, 56px) 0" }} data-template="reality-04">
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 clamp(16px, 3vw, 40px)" }}>
        <div className="r04-hotline-card">
          {/* decorative watermark */}
          <svg className="r04-hotline-wm" width="220" height="220" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M4 11L12 4.5l8 6.5" stroke="#fff" strokeWidth="0.7" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M6 10v9h12v-9" stroke="#fff" strokeWidth="0.7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>

          {/* Levá část */}
          <div style={{ display: "flex", alignItems: "center", gap: "clamp(18px, 2.5vw, 32px)", flexWrap: "wrap", position: "relative", zIndex: 2 }}>
            <div className="r04-hotline-phoneicon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1032CF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.38 2 2 0 0 1 3.6 1.22h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 8.81a16 16 0 0 0 6.29 6.29l.95-.95a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
              </svg>
            </div>
            <div>
              <GenericEditableText sectionId={sectionId} field="eyebrow" value={eyebrow} tag="p"
                style={{ fontFamily: SANS, fontSize: 12, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(255,255,255,0.7)", margin: "0 0 4px" }} />
              <a href={`tel:${phone.replace(/\s/g, "")}`} style={{ textDecoration: "none" }}>
                <span style={{ fontFamily: SANS, fontSize: "clamp(22px, 2.4vw, 30px)", fontWeight: 800, color: WHITE, letterSpacing: "-0.3px", display: "block" }}>
                  <GenericEditableText sectionId={sectionId} field="phone" value={phone} tag="span" />
                </span>
              </a>
              <p style={{ fontFamily: SANS, fontSize: "clamp(13.5px, 1.3vw, 15px)", color: "rgba(255,255,255,0.82)", margin: "6px 0 0", lineHeight: 1.45, maxWidth: 460 }}>
                {renderClaim()}
              </p>
            </div>
          </div>

          {/* CTA */}
          <a
            href={resolve(ctaHref)}
            data-btn="primary"
            className="r04-hotline-cta"
            style={{ display: "inline-flex", alignItems: "center", gap: 9, padding: "14px 32px", backgroundColor: GREEN, color: WHITE, fontFamily: SANS, fontSize: 15, fontWeight: 600, textDecoration: "none", borderRadius: 50, whiteSpace: "nowrap", flexShrink: 0, position: "relative", zIndex: 2, transition: "background-color 300ms ease, transform 300ms ease" }}
          >
            <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
            <svg className="r04-hotline-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true" style={{ transition: "transform 300ms ease" }}>
              <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}

/* ─── CtaLawyer01 — newsletter strip ────────────────────────── */
function CtaLawyer01({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const NAVY    = "#141760";
  const CRIMSON = "#a70336";
  const HEADING = "'Raleway','Montserrat','Helvetica Neue',Arial,sans-serif";
  const BODY    = "'Open Sans','Helvetica Neue',Arial,sans-serif";

  const eyebrowRaw = content.eyebrow;
  const titleRaw   = content.title;
  const eyebrow  = eyebrowRaw === undefined ? "Newsletter" : String(eyebrowRaw);
  const title    = titleRaw   === undefined ? "Buďte stále v obraze" : String(titleRaw);
  const message     = String(content.message          ?? "Vyplňte svůj e-mail a budeme vám zasílat pravidelné informace ze světa práva a podnikání.");
  const ctaText     = String(content.ctaText          ?? "Odebírat");
  const placeholder = String(content.inputPlaceholder ?? "Zadejte váš e-mail");
  const consent     = String(content.consentText      ?? "Odesláním souhlasíte se zpracováním osobních údajů. Odhlásit se můžete kdykoliv.");
  const showHeader  = !!(eyebrow.trim() || title.trim());

  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { el.classList.add("l01cta-on"); obs.disconnect(); } }, { threshold: 0.3 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <section
      ref={ref}
      id="newsletter"
      data-template="lawyer-01"
      data-variant="lawyer-01-cta"
      style={{ position: "relative", background: `linear-gradient(135deg, ${NAVY} 0%, #0e1048 100%)`, padding: "clamp(60px,8vw,92px) 32px", overflow: "hidden", borderTop: `3px solid ${CRIMSON}` }}
    >
      <style>{`
        .l01cta-rise{opacity:0;transform:translateY(22px);transition:opacity .75s cubic-bezier(.2,.7,.2,1),transform .75s cubic-bezier(.2,.7,.2,1);}
        .l01cta-on .l01cta-rise{opacity:1;transform:translateY(0);}
        .l01cta-on .l01cta-rise.d2{transition-delay:.12s;}
        .l01cta-input{flex:1;padding:16px 22px;font-family:${BODY};font-size:.95rem;color:#1a1a1a;border:2px solid transparent;border-right:none;border-radius:2px 0 0 2px;outline:none;background:#fff;transition:box-shadow .22s ease;}
        .l01cta-input:focus{box-shadow:0 0 0 3px rgba(167,3,54,.35);}
        .l01cta-btn{position:relative;display:inline-flex;align-items:center;gap:8px;padding:16px 28px;background:${CRIMSON};color:#fff;font-family:${BODY};font-size:.92rem;font-weight:700;letter-spacing:.05em;border:none;border-radius:0 2px 2px 0;cursor:pointer;white-space:nowrap;overflow:hidden;transition:transform .2s ease;}
        .l01cta-btn::before{content:"";position:absolute;inset:0;background:#7d0225;transform:translateX(-101%);transition:transform .34s cubic-bezier(.4,0,.2,1);z-index:0;}
        .l01cta-btn > *{position:relative;z-index:1;}
        .l01cta-btn:hover::before{transform:translateX(0);}
        .l01cta-btn svg{transition:transform .3s ease;}
        .l01cta-btn:hover svg{transform:translateX(4px);}
        @media (max-width: 760px) {
          .l01-cta-inner  { flex-direction: column !important; align-items: flex-start !important; gap: 30px !important; }
          .l01-cta-formwrap { width: 100% !important; }
          .l01-cta-form   { flex-direction: column !important; }
          .l01cta-input   { width: 100% !important; border-right: 2px solid transparent !important; border-radius: 2px !important; }
          .l01cta-btn     { width: 100% !important; border-radius: 2px !important; justify-content: center; }
        }
      `}</style>

      {/* Decorative paper-plane / envelope motif */}
      <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="0.7" strokeLinecap="round" strokeLinejoin="round"
        style={{ position: "absolute", right: "3%", top: "50%", transform: "translateY(-50%) rotate(-12deg)", width: 260, height: 260, pointerEvents: "none" }}>
        <path d="M22 2 11 13M22 2l-7 20-4-9-9-4 20-7z"/>
      </svg>

      <div
        className="l01-cta-inner"
        style={{ position: "relative", zIndex: 1, maxWidth: 1100, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 48 }}
      >
        {/* Text */}
        <div className="l01cta-rise" style={{ flex: "1 1 340px" }}>
          {showHeader && eyebrow.trim() && (
            <div style={{ display: "inline-flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
              <span style={{ display: "block", width: 28, height: 2, background: CRIMSON }} />
              <GenericEditableText sectionId={sectionId} field="eyebrow" value={eyebrow} tag="span"
                style={{ fontFamily: BODY, fontWeight: 700, fontSize: "0.74rem", letterSpacing: "0.22em", textTransform: "uppercase", color: "#f4b8cb" }} />
            </div>
          )}
          {showHeader && title.trim() && (
            <h2 style={{ fontFamily: HEADING, fontSize: "clamp(1.55rem,2.5vw,2.15rem)", fontWeight: 700, color: "#fff", margin: "0 0 12px", lineHeight: 1.2, letterSpacing: "-0.01em" }}>
              <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
            </h2>
          )}
          <p style={{ fontFamily: BODY, fontSize: "clamp(0.9rem,1vw,1rem)", color: "rgba(255,255,255,0.78)", margin: 0, lineHeight: 1.65, maxWidth: 420 }}>
            <GenericEditableText sectionId={sectionId} field="message" value={message} tag="span" />
          </p>
        </div>

        {/* Form */}
        <div className="l01-cta-formwrap l01cta-rise d2" style={{ flex: "0 0 auto", maxWidth: 460, width: "100%" }}>
          <div className="l01-cta-form" style={{ display: "flex", gap: 0 }}>
            <input type="email" className="l01cta-input" placeholder={placeholder} aria-label={placeholder} />
            <button type="submit" className="l01cta-btn">
              <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
            </button>
          </div>
          <p style={{ fontFamily: BODY, fontSize: "0.74rem", color: "rgba(255,255,255,0.5)", margin: "12px 0 0", lineHeight: 1.5 }}>
            <GenericEditableText sectionId={sectionId} field="consentText" value={consent} tag="span" />
          </p>
        </div>
      </div>
    </section>
  );
}

// ─── Stavba-01 CTA ───────────────────────────────────────────────────────────
function CtaStavba01({ content, sectionId, tenantSlug, isAdmin }: Pick<Props, "content" | "sectionId" | "tenantSlug" | "isAdmin">) {
  const ORANGE = "#FF6F0D";
  const DARK   = "#1a1a1a";
  const WHITE  = "#ffffff";
  const FONT   = "'Inter', sans-serif";

  const taglineRaw = content.tagline;
  const titleRaw   = content.title;
  const tagline    = taglineRaw === undefined ? "Zdarma a nezávazně" : String(taglineRaw);
  const title      = titleRaw   === undefined ? "Zvažujete rekonstrukci?" : String(titleRaw);
  const showHeader = !!(tagline.trim() || title.trim());
  const subtitle   = String(content.subtitle   ?? "Zavolejte nebo napište — rádi Vám poradíme s rozsahem, termíny i financováním vaší stavby.");
  const ctaText    = String(content.ctaText    ?? "Nezávazná konzultace");
  const ctaHref    = String(content.ctaHref    ?? "/kontakt");
  const ctaSecText = String(content.ctaSecondaryText ?? "");
  const ctaSecHref = String(content.ctaSecondaryHref ?? "");
  const siteMode   = String(content.siteMode ?? "multipage");

  const resolve = (href: string) => {
    if (!href || href.startsWith("http") || href.startsWith("tel:") || href.startsWith("mailto:")) return href;
    return resolveNavHref(href, siteMode, tenantSlug, isAdmin);
  };

  const secRef = useRef<HTMLElement>(null);
  useEffect(() => {
    const sec = secRef.current;
    if (!sec) return;
    const els = Array.from(sec.querySelectorAll<HTMLElement>(".s01-cta-reveal"));
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { (e.target as HTMLElement).classList.add("s01-cta-vis"); obs.unobserve(e.target); }
      });
    }, { threshold: 0.2 });
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  return (
    <section ref={secRef} id={String(content.id ?? "cta-konzultace")} className="s01-cta-band" style={{ backgroundColor: DARK, fontFamily: FONT, padding: "clamp(56px,8vw,96px) 0", borderTop: `3px solid ${ORANGE}` }} data-template="stavba-01">
      <div className="stavba-cta-inner" style={{ position: "relative", zIndex: 1, maxWidth: 1200, margin: "0 auto", padding: "0 32px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 40, flexWrap: "wrap" }}>

        {/* Left text */}
        <div className="s01-cta-reveal" style={{ flex: "1 1 400px" }}>
          {showHeader && tagline.trim() && (
            <div style={{ display: "inline-flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
              <span style={{ display: "block", width: 30, height: 3, backgroundColor: ORANGE, borderRadius: 2 }} />
              <GenericEditableText sectionId={sectionId} field="tagline" value={tagline} tag="p"
                style={{ color: ORANGE, fontSize: "0.78rem", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", margin: 0 }} />
            </div>
          )}
          {showHeader && title.trim() && (
            <h2 style={{ color: WHITE, fontSize: "clamp(24px,3vw,40px)", fontWeight: 800, lineHeight: 1.1, letterSpacing: "-0.02em", margin: "0 0 14px" }}>
              <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
            </h2>
          )}
          <p style={{ color: "rgba(255,255,255,0.60)", fontSize: "0.95rem", lineHeight: 1.7, margin: 0, maxWidth: 520 }}>
            <GenericEditableText sectionId={sectionId} field="subtitle" value={subtitle} tag="span" />
          </p>
        </div>

        {/* Right buttons */}
        <div className="stavba-cta-btns s01-cta-reveal s01-cta-reveal-2" style={{ display: "flex", gap: 14, flexWrap: "wrap", flexShrink: 0 }}>
          <a
            href={resolve(ctaHref)}
            data-btn="primary"
            className="s01-cta"
            style={{ display: "inline-flex", alignItems: "center", backgroundColor: ORANGE, color: WHITE, fontFamily: FONT, fontSize: "0.95rem", fontWeight: 700, padding: "15px 32px", borderRadius: 8, textDecoration: "none", boxShadow: "0 4px 20px rgba(255,111,13,0.35)" }}
          >
            <span><GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" /></span>
          </a>
          {ctaSecText && (
            <a
              href={resolve(ctaSecHref)}
              className="s01-cta-phone"
              style={{ display: "inline-flex", alignItems: "center", gap: 8, color: "rgba(255,255,255,0.75)", fontFamily: FONT, fontSize: "0.95rem", fontWeight: 600, padding: "15px 24px", borderRadius: 8, textDecoration: "none", border: "1px solid rgba(255,255,255,0.20)" }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.5 12.25 19.79 19.79 0 0 1 1.17 3.63 2 2 0 0 1 3.15 1.45h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 21 16.92z"/>
              </svg>
              <GenericEditableText sectionId={sectionId} field="ctaSecondaryText" value={ctaSecText} tag="span" />
            </a>
          )}
        </div>

      </div>
      <style>{`
        @media (max-width: 640px) {
          .stavba-cta-inner { flex-direction: column !important; align-items: flex-start !important; }
          .stavba-cta-btns  { width: 100%; }
          .stavba-cta-btns a { justify-content: center !important; }
        }
      `}</style>
    </section>
  );
}

// ── stavba-03-cta ─────────────────────────────────────────────────────────────
// světle-šedé #f9f9f9 bg, 2-col: vlevo H2 + subtitle, vpravo 2 CTA tlačítka
// ─────────────────────────────────────────────────────────────────────────────
function CtaStavba03({ content, sectionId, tenantSlug, isAdmin }: { content: Record<string, unknown>; sectionId: number; tenantSlug?: string; isAdmin?: boolean }) {
  const ORANGE = "#fa7d19";
  const DARK   = "#1b1a1a";
  const GRAY   = "#666666";
  const FONT   = "'Roboto', sans-serif";

  const heading          = String(content.heading          ?? "Nenechávejte své bydlení snů nedokončené");
  const subtitle         = String(content.subtitle         ?? "Nabízíme komplexní stavební práce a servis. Naši odborníci vám poskytnou profesionální služby.");
  const ctaText          = String(content.ctaText          ?? "Nezávazná poptávka");
  const ctaHref          = String(content.ctaHref          ?? "#kontakt");
  const ctaSecondaryText = String(content.ctaSecondaryText ?? "Naše realizace");
  const ctaSecondaryHref = String(content.ctaSecondaryHref ?? "/reference");

  const resolve = (href: string) => {
    if (!tenantSlug || !href.startsWith("/")) return href;
    const base = isAdmin ? `/demo/${tenantSlug}/admin` : `/demo/${tenantSlug}`;
    return base + href;
  };

  return (
    <section style={{ backgroundColor: "#f9f9f9", fontFamily: FONT, padding: "72px 0", borderTop: "1px solid #eaeaea", borderBottom: "1px solid #eaeaea" }}>
      <div
        className="stavba03-cta-inner"
        style={{ maxWidth: 1200, margin: "0 auto", padding: "0 32px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 48 }}
      >
        {/* Left: text */}
        <div style={{ flex: 1 }}>
          <h2 style={{ fontFamily: FONT, fontWeight: 700, fontSize: "clamp(1.4rem, 2.2vw, 1.9rem)", color: DARK, lineHeight: 1.25, margin: "0 0 12px" }}>
            <GenericEditableText sectionId={sectionId} field="heading" value={heading} tag="span" />
          </h2>
          <p style={{ fontFamily: FONT, fontSize: "0.95rem", color: GRAY, lineHeight: 1.7, margin: 0 }}>
            <GenericEditableText sectionId={sectionId} field="subtitle" value={subtitle} tag="span" />
          </p>
        </div>

        {/* Right: buttons */}
        <div className="stavba03-cta-btns" style={{ display: "flex", flexDirection: "column", gap: 12, flexShrink: 0 }}>
          <a
            href={resolve(ctaHref)}
            data-btn="primary"
            style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, backgroundColor: ORANGE, color: "#fff", fontFamily: FONT, fontSize: "0.9rem", fontWeight: 700, padding: "14px 32px", textDecoration: "none", borderRadius: 2, letterSpacing: "0.3px", whiteSpace: "nowrap", transition: "opacity 0.18s" }}
            onMouseEnter={e => { e.currentTarget.style.opacity = "0.88"; }}
            onMouseLeave={e => { e.currentTarget.style.opacity = "1"; }}
          >
            <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </a>
          <a
            href={resolve(ctaSecondaryHref)}
            style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, backgroundColor: "transparent", color: DARK, fontFamily: FONT, fontSize: "0.9rem", fontWeight: 600, padding: "13px 32px", textDecoration: "none", borderRadius: 2, border: `2px solid #d0d0d0`, whiteSpace: "nowrap", transition: "border-color 0.18s, color 0.18s" }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = ORANGE; e.currentTarget.style.color = ORANGE; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "#d0d0d0"; e.currentTarget.style.color = DARK; }}
          >
            <GenericEditableText sectionId={sectionId} field="ctaSecondaryText" value={ctaSecondaryText} tag="span" />
          </a>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .stavba03-cta-inner { flex-direction: column !important; align-items: flex-start !important; }
          .stavba03-cta-btns { width: 100%; }
          .stavba03-cta-btns a { width: 100%; box-sizing: border-box; }
        }
      `}</style>
    </section>
  );
}

// ── elektro-01-cta-form ───────────────────────────────────────────────────────
// Tmavé bg, vlevo nadpis + výhody, vpravo rychlý poptávkový formulář
// ─────────────────────────────────────────────────────────────────────────────
function CtaElektro01({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const RED   = "#dd0808";
  const DARK  = "#141414";
  const WHITE = "#ffffff";
  const FONT  = "'Montserrat', Arial, sans-serif";

  const title      = String(content.title      ?? "Nezávazná poptávka");
  const subtitle   = String(content.subtitle   ?? "Kontaktujte mě — co nejdříve se Vám ozvu.");
  const formTitle  = String(content.formTitle  ?? "Odeslat poptávku");
  const kicker     = String(content.kicker     ?? "Elektroinstalace & Hromosvody");
  const submitText = String(content.submitText ?? "Odeslat poptávku");

  const rawBenefits = content.benefits as string[] | undefined;
  const benefits = rawBenefits ?? [
    "Bezplatná cenová nabídka",
    "Práce dle norem ČSN",
    "Revizní zpráva v ceně",
    "Praha a Středočeský kraj",
  ];

  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", message: "" });

  const inp: React.CSSProperties = {
    width: "100%", boxSizing: "border-box",
    padding: "12px 14px", border: "none",
    borderBottom: "2px solid rgba(255,255,255,0.18)",
    backgroundColor: "transparent",
    color: WHITE, fontFamily: "'Roboto',sans-serif", fontSize: "0.92rem",
    outline: "none", transition: "border-color 0.18s",
  };

  return (
    <section data-template="elektro-01" style={{ backgroundColor: DARK, fontFamily: FONT, padding: "clamp(64px,9vw,104px) 0" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 32px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 64, alignItems: "center" }} className="elektro-cta-grid">

        {/* Levá strana — text + výhody */}
        <div>
          <p style={{ color: RED, fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", margin: "0 0 14px" }}>
            <GenericEditableText sectionId={sectionId} field="kicker" value={kicker} tag="span" />
          </p>
          <h2 style={{ color: WHITE, fontSize: "clamp(28px,3.5vw,46px)", fontWeight: 800, lineHeight: 1.1, letterSpacing: "0.01em", textTransform: "uppercase", margin: "0 0 18px" }}>
            <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
          </h2>
          <p style={{ color: "rgba(255,255,255,0.60)", fontSize: "0.95rem", lineHeight: 1.7, margin: "0 0 36px", maxWidth: 420 }}>
            <GenericEditableText sectionId={sectionId} field="subtitle" value={subtitle} tag="span" />
          </p>
          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 12 }}>
            {benefits.map((b, bi) => (
              <li key={bi} style={{ display: "flex", alignItems: "center", gap: 12, color: "rgba(255,255,255,0.80)", fontFamily: "'Roboto',sans-serif", fontSize: "0.9rem" }}>
                <span style={{ width: 20, height: 20, borderRadius: "50%", backgroundColor: RED, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <svg width="10" height="8" viewBox="0 0 10 8" fill="none" aria-hidden="true">
                    <path d="M1 4l2.5 2.5L9 1" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </span>
                <GenericEditableText sectionId={sectionId} field={`benefits.${bi}`} value={b} tag="span" />
              </li>
            ))}
          </ul>
        </div>

        {/* Pravá strana — formulář */}
        <div style={{ backgroundColor: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", padding: "40px 36px" }}>
          <h3 style={{ color: WHITE, fontFamily: FONT, fontSize: "1.05rem", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", margin: "0 0 28px" }}>
            <GenericEditableText sectionId={sectionId} field="formTitle" value={formTitle} tag="span" />
          </h3>
          {sent ? (
            <div style={{ textAlign: "center", padding: "32px 0" }}>
              <div style={{ width: 48, height: 48, borderRadius: "50%", backgroundColor: RED, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                <svg width="22" height="18" viewBox="0 0 22 18" fill="none" aria-hidden="true">
                  <path d="M1 9l6 6L21 1" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <p style={{ color: WHITE, fontFamily: FONT, fontWeight: 600, fontSize: "1rem", margin: 0 }}>Poptávka odeslána!</p>
              <p style={{ color: "rgba(255,255,255,0.55)", fontSize: "0.85rem", margin: "8px 0 0" }}>Ozvu se co nejdříve.</p>
            </div>
          ) : (
            <form onSubmit={e => { e.preventDefault(); setSent(true); }} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <div>
                <label style={{ display: "block", color: "rgba(255,255,255,0.45)", fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 4 }}>Jméno *</label>
                <input required placeholder="Jan Novák" value={form.name}
                  onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                  style={inp}
                  onFocus={e => { e.currentTarget.style.borderBottomColor = RED; }}
                  onBlur={e  => { e.currentTarget.style.borderBottomColor = "rgba(255,255,255,0.18)"; }}
                />
              </div>
              <div>
                <label style={{ display: "block", color: "rgba(255,255,255,0.45)", fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 4 }}>Telefon *</label>
                <input required placeholder="604 123 456" value={form.phone}
                  onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                  style={inp}
                  onFocus={e => { e.currentTarget.style.borderBottomColor = RED; }}
                  onBlur={e  => { e.currentTarget.style.borderBottomColor = "rgba(255,255,255,0.18)"; }}
                />
              </div>
              <div>
                <label style={{ display: "block", color: "rgba(255,255,255,0.45)", fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 4 }}>Popis práce</label>
                <textarea placeholder="Co potřebujete udělat?" rows={4} value={form.message}
                  onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
                  style={{ ...inp, resize: "vertical" }}
                  onFocus={e => { e.currentTarget.style.borderBottomColor = RED; }}
                  onBlur={e  => { e.currentTarget.style.borderBottomColor = "rgba(255,255,255,0.18)"; }}
                />
              </div>
              <button type="submit" style={{ backgroundColor: RED, color: WHITE, border: "none", cursor: "pointer", fontFamily: FONT, fontSize: "0.78rem", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", padding: "16px 0", transition: "opacity 0.15s" }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.opacity = "0.86"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.opacity = "1"; }}
              >
                <GenericEditableText sectionId={sectionId} field="submitText" value={submitText} tag="span" />
              </button>
            </form>
          )}
        </div>

      </div>
      <style>{`
        @media (max-width: 820px) {
          .elektro-cta-grid { grid-template-columns: 1fr !important; gap: 48px !important; }
        }
      `}</style>
    </section>
  );
}

// ── instala-01-cta ─────────────────────────────────────────────────────────────
// 1:1 instalateritopenari.cz:
// - světlá sekce (#F2F5F7), 2 sloupce: vlevo intro, vpravo formulář
// - kicker: 24px / 300 / uppercase / #222222
// - H2: 600 / capitalize / #222222
// - formulář: Jméno, E-mail, Telefon, Předmět, Zpráva + žluté CTA tlačítko
// ─────────────────────────────────────────────────────────────────────────────
function CtaInstala01({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const [sent, setSent] = useState(false);

  const YELLOW = "#FFC527";
  const DARK   = "#1e293b";
  const FONT   = "'Outfit', sans-serif";

  const kicker     = String(content.kicker     ?? "Cenová nabídka zdarma");
  const title      = String(content.title      ?? "Poptat služby");
  const subtitle   = String(content.subtitle   ?? "Vyplňte formulář a my vás kontaktujeme s nezávaznou nabídkou.");
  const submitText = String(content.submitText ?? "Odeslat");

  const inputStyle: React.CSSProperties = {
    width: "100%",
    fontFamily: FONT,
    fontSize: "16px",
    padding: "12px 16px",
    border: "1px solid #e2e8f0",
    borderRadius: 6,
    outline: "none",
    backgroundColor: "#ffffff",
    color: DARK,
    boxSizing: "border-box",
  };

  return (
    <section id="poptavka" style={{ backgroundColor: "#F2F5F7", fontFamily: FONT, padding: "80px 0" }} data-template="instala-01-cta">
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 40px" }}>
        <div className="i01-cta-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 64, alignItems: "start" }}>

          {/* Left — intro */}
          <div style={{ paddingTop: 8 }}>
            <p style={{ fontSize: "24px", fontWeight: 300, textTransform: "uppercase", color: "#222222", margin: "0 0 10px", letterSpacing: "0.04em" }}>
              <GenericEditableText sectionId={sectionId} field="kicker" value={kicker} tag="span" />
            </p>
            <h2 style={{ fontSize: "clamp(28px,3vw,42px)", fontWeight: 600, textTransform: "capitalize", color: "#222222", lineHeight: 1.2, margin: "0 0 20px" }}>
              <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
            </h2>
            <p style={{ fontSize: "17px", color: "#434343", lineHeight: 1.65, margin: "0 0 32px" }}>
              <GenericEditableText sectionId={sectionId} field="subtitle" value={subtitle} tag="span" />
            </p>

            {/* Contact info pills */}
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {(content.phone as string) && (
                <a href={`tel:${String(content.phone).replace(/\s/g, "")}`} style={{ display: "inline-flex", alignItems: "center", gap: 12, textDecoration: "none", color: DARK }}>
                  <span style={{ width: 40, height: 40, borderRadius: "50%", backgroundColor: YELLOW, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={DARK} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.5 12.25 19.79 19.79 0 0 1 1.17 3.63 2 2 0 0 1 3.15 1.45h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 21 16.92z"/></svg>
                  </span>
                  <span style={{ fontSize: "16px", fontWeight: 500 }}>
                    <GenericEditableText sectionId={sectionId} field="phone" value={String(content.phone)} tag="span" />
                  </span>
                </a>
              )}
              {(content.email as string) && (
                <a href={`mailto:${content.email}`} style={{ display: "inline-flex", alignItems: "center", gap: 12, textDecoration: "none", color: DARK }}>
                  <span style={{ width: 40, height: 40, borderRadius: "50%", backgroundColor: YELLOW, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={DARK} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                  </span>
                  <span style={{ fontSize: "16px", fontWeight: 500 }}>
                    <GenericEditableText sectionId={sectionId} field="email" value={String(content.email)} tag="span" />
                  </span>
                </a>
              )}
            </div>
          </div>

          {/* Right — form */}
          <div style={{ backgroundColor: "#ffffff", borderRadius: 12, padding: "40px 36px", boxShadow: "0 2px 24px rgba(0,0,0,0.07)" }}>
            {sent ? (
              <div style={{ textAlign: "center", padding: "40px 0" }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>✓</div>
                <p style={{ fontSize: "18px", fontWeight: 600, color: DARK }}>Zpráva odeslána!</p>
                <p style={{ fontSize: "15px", color: "#64748b", marginTop: 8 }}>Ozveme se vám co nejdříve.</p>
              </div>
            ) : (
              <form onSubmit={e => { e.preventDefault(); setSent(true); }} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div className="i01-cta-form-row" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <div>
                    <label style={{ display: "block", fontSize: "14px", fontWeight: 500, color: "#374151", marginBottom: 6 }}>Jméno *</label>
                    <input type="text" required placeholder="Jan Novák" style={inputStyle} />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "14px", fontWeight: 500, color: "#374151", marginBottom: 6 }}>E-mail *</label>
                    <input type="email" required placeholder="jan@email.cz" style={inputStyle} />
                  </div>
                </div>
                <div className="i01-cta-form-row" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <div>
                    <label style={{ display: "block", fontSize: "14px", fontWeight: 500, color: "#374151", marginBottom: 6 }}>Telefon</label>
                    <input type="tel" placeholder="+420 700 000 000" style={inputStyle} />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "14px", fontWeight: 500, color: "#374151", marginBottom: 6 }}>Předmět</label>
                    <input type="text" placeholder="Poptávka služby" style={inputStyle} />
                  </div>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "14px", fontWeight: 500, color: "#374151", marginBottom: 6 }}>Zpráva</label>
                  <textarea rows={5} placeholder="Popište váš požadavek..." style={{ ...inputStyle, resize: "vertical", height: "auto" }} />
                </div>
                <button
                  type="submit"
                  style={{ backgroundColor: YELLOW, color: DARK, fontFamily: FONT, fontSize: "17px", fontWeight: 600, padding: "14px 36px", borderRadius: 50, border: "none", cursor: "pointer", alignSelf: "flex-start", transition: "opacity 0.18s" }}
                  onMouseEnter={e => { e.currentTarget.style.opacity = "0.85"; }}
                  onMouseLeave={e => { e.currentTarget.style.opacity = "1"; }}
                >
                  <GenericEditableText sectionId={sectionId} field="submitText" value={submitText} tag="span" />
                </button>
              </form>
            )}
          </div>

        </div>
      </div>
      <style>{`
        @media (max-width: 820px) {
          .i01-cta-grid { grid-template-columns: 1fr !important; gap: 40px !important; }
          .i01-cta-form-row { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}

// ── lang-01-cta ───────────────────────────────────────────────────────────────
// 1:1 jipka.cz test sekce:
// - background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)
// - padding 80px 40px, text-align center, bílý text
// - H2 48px weight 800, letter-spacing -1px
// - Subtitle 18px, color #a0b0c0
// - Červené filled CTA 16px, padding 16px 36px, border-radius 8px
// ─────────────────────────────────────────────────────────────────────────────
function CtaLang01({ content, sectionId, tenantSlug, isAdmin }: { content: Record<string, unknown>; sectionId: number; tenantSlug?: string; isAdmin?: boolean }) {
  const FONT = "'Inter', -apple-system, sans-serif";
  const RED  = "#e63946";

  const heading    = String(content.heading    ?? "Znáte svou úroveň?");
  const subheading = String(content.subheading ?? "Otestujte se zdarma za 10 minut. Doporučíme vám kurz na míru.");
  const ctaText    = String(content.ctaText    ?? "Spustit test");
  const ctaHref    = String(content.ctaHref    ?? "/#test");

  const resolve = (href: string) => {
    if (!href || href.startsWith("http") || href.startsWith("#") || href.startsWith("/#")) return href;
    if (isAdmin && tenantSlug) return `/demo/${tenantSlug}${href}`;
    return href;
  };

  return (
    <>
      <style>{`
        .lang01cta{padding:80px 40px;background:linear-gradient(135deg,#1a1a2e 0%,#16213e 100%);text-align:center;font-family:${FONT};}
        .lang01cta h2{font-size:48px;font-weight:800;color:#fff;margin:0 0 16px;letter-spacing:-1px;line-height:1.05;}
        .lang01cta-sub{font-size:18px;color:#a0b0c0;margin:0 0 36px;}
        .lang01cta-btn{display:inline-block;background:${RED};color:#fff;text-decoration:none;font-size:16px;font-weight:700;padding:16px 36px;border-radius:8px;transition:opacity 0.2s,transform 0.2s;}
        .lang01cta-btn:hover{opacity:0.88;transform:translateY(-2px);}
        @media(max-width:700px){.lang01cta{padding:60px 20px;}.lang01cta h2{font-size:32px;}.lang01cta-sub{font-size:16px;}}
      `}</style>
      <section className="lang01cta" id="test" data-template="lang-01">
        <h2>
          <GenericEditableText sectionId={sectionId} field="heading" value={heading} tag="span" />
        </h2>
        <p className="lang01cta-sub">
          <GenericEditableText sectionId={sectionId} field="subheading" value={subheading} tag="span" />
        </p>
        <a href={resolve(ctaHref)} data-btn="primary" className="lang01cta-btn">
          <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
        </a>
      </section>
    </>
  );
}

/* ─── kids-01-cta ──────────────────────────────────────────────────────── */
function CtaKids01({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const heading    = String((content as any).heading    ?? "Vyzkoušejte Demo Kroužky");
  const subheading = String((content as any).subheading ?? "Stačí vyplnit předběžnou přihlášku. Těšíme se na nové dobrodruhy!");
  const ctaText    = String((content as any).ctaText    ?? "PŘEDBĚŽNÁ PŘIHLÁŠKA");
  const ctaHref    = String((content as any).ctaHref    ?? "/kontakt");
  const note       = String((content as any).note       ?? "Budeme vám držet místo!");

  const sRef = useRef<HTMLElement>(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const el = sRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVis(true); obs.disconnect(); } }, { threshold: 0.15 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const FONT = "'Gotham Rounded', 'Nunito', 'Trebuchet MS', sans-serif";
  const YELLOW = "#ffc107";
  const BLUE   = "#009BDE";

  return (
    <section
      ref={sRef}
      id={`section-${sectionId}`}
      style={{
        background: `linear-gradient(135deg, ${BLUE} 0%, #0078b0 100%)`,
        padding: "96px 24px",
        textAlign: "center",
        fontFamily: FONT,
        position: "relative",
        overflow: "hidden",
      }}
    >
      <style>{`
        .k01cta-inner {
          opacity: 0;
          transform: translateY(28px);
          transition: opacity 0.6s ease, transform 0.6s ease;
        }
        .k01cta-inner.vis {
          opacity: 1;
          transform: translateY(0);
        }
        .k01cta-btn {
          display: inline-block;
          background: ${YELLOW};
          color: #1a1a1a;
          font-family: ${FONT};
          font-weight: 800;
          font-size: 1rem;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          padding: 18px 48px;
          border-radius: 4px;
          text-decoration: none;
          margin-top: 36px;
          transition: transform 0.22s ease, box-shadow 0.22s ease;
        }
        .k01cta-btn:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 24px rgba(255,193,7,0.5);
        }
        .k01cta-bg-circle {
          position: absolute;
          border-radius: 50%;
          background: rgba(255,255,255,0.05);
          pointer-events: none;
        }
      `}</style>

      {/* Decorative background circles */}
      <div className="k01cta-bg-circle" style={{ width: 400, height: 400, top: -120, right: -80 }} />
      <div className="k01cta-bg-circle" style={{ width: 250, height: 250, bottom: -60, left: -40 }} />

      <div className={`k01cta-inner${vis ? " vis" : ""}`} style={{ position: "relative", zIndex: 1, maxWidth: 700, margin: "0 auto" }}>
        <h2 style={{ color: "#fff", fontSize: "clamp(1.8rem, 3.5vw, 2.6rem)", fontWeight: 800, margin: "0 0 16px" }}>
          <GenericEditableText sectionId={sectionId} field="heading" value={heading} tag="span" />
        </h2>
        <p style={{ color: "rgba(255,255,255,0.88)", fontSize: "1.1rem", lineHeight: 1.7, margin: 0 }}>
          <GenericEditableText sectionId={sectionId} field="subheading" value={subheading} tag="span" />
        </p>

        <div>
          <a href={ctaHref} data-btn="primary" className="k01cta-btn">
            <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
          </a>
        </div>

        {note && (
          <p style={{ color: "rgba(255,255,255,0.65)", fontSize: "0.85rem", marginTop: 16, fontStyle: "italic" }}>
            <GenericEditableText sectionId={sectionId} field="note" value={note} tag="span" />
          </p>
        )}
      </div>
    </section>
  );
}

// ── solar-01-cta ──────────────────────────────────────────────────────────────
// solar-01 — Dramatic orange gradient CTA card on light section bg.
// Rotating radial sun-ray pattern (60s), soft glow blobs.
// Left column: eyebrow pill + H2 (italic accent) + subtitle + primary/ghost CTAs.
// Right column: frosted glass trust panel — 3 contact items (phone / email /
// hours) w/ icon boxes + label + value + hover slide.
// ─────────────────────────────────────────────────────────────────────────────
function CtaSolar01({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const eyebrow          = String(content.eyebrow ?? "Zdarma & bez závazku");
  const title            = String(content.title ?? "Začněte šetřit");
  const titleAccent      = String(content.titleAccent ?? "už dnes");
  const subtitle         = String(content.subtitle ?? "Do 24 hodin vám zašleme přesný výpočet úspory i doby návratnosti — bez závazků, bez vtíravých telefonátů.");
  const ctaText          = String(content.ctaText ?? "Chci bezplatnou kalkulaci");
  const ctaHref          = String(content.ctaHref ?? "/kontakt");
  const ctaSecondaryText = String(content.ctaSecondaryText ?? "Prohlédnout služby");
  const ctaSecondaryHref = String(content.ctaSecondaryHref ?? "/sluzby");
  const panelTitle       = String(content.panelTitle ?? "Nebo nám rovnou napište");
  const phone            = String(content.phone ?? "800 123 456");
  const phoneLabel       = String(content.phoneLabel ?? "Volejte zdarma");
  const email            = String(content.email ?? "info@heliostech-demo.cz");
  const emailLabel       = String(content.emailLabel ?? "Napište nám");
  const hoursValue       = String(content.hoursValue ?? "Po–Pá 8:00–17:00");
  const hoursLabel       = String(content.hoursLabel ?? "Otevírací doba");

  const phoneTel = phone.replace(/\s+/g, "");

  const IconArrow = ({ size = 16 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
    </svg>
  );
  const IconPhone = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.37 1.9.72 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.35 1.85.59 2.81.72a2 2 0 0 1 1.72 2z"/>
    </svg>
  );
  const IconMail = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="4" width="20" height="16" rx="2"/><polyline points="22,6 12,13 2,6"/>
    </svg>
  );
  const IconClock = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
    </svg>
  );

  return (
    <section className="s01ct" id="kontakt" data-template="solar-01">
      <div className="s01ct-card">
        <div className="s01ct-inner">
          <div className="s01ct-copy">
            <span className="s01ct-eyebrow">
              <span className="s01ct-eyebrow-dot" />
              <GenericEditableText sectionId={sectionId} field="eyebrow" value={eyebrow} tag="span" />
            </span>
            <h2 className="s01ct-title">
              <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
              {" "}
              <span className="s01ct-title-em">
                <GenericEditableText sectionId={sectionId} field="titleAccent" value={titleAccent} tag="span" />
              </span>
            </h2>
            <p className="s01ct-sub">
              <GenericEditableText sectionId={sectionId} field="subtitle" value={subtitle} tag="span" />
            </p>
            <div className="s01ct-btns">
              <a href={ctaHref} data-btn="primary" className="s01ct-btn s01ct-btn-primary">
                <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
                <span className="s01ct-btn-arrow"><IconArrow /></span>
              </a>
              <a href={ctaSecondaryHref} className="s01ct-btn s01ct-btn-ghost">
                <GenericEditableText sectionId={sectionId} field="ctaSecondaryText" value={ctaSecondaryText} tag="span" />
              </a>
            </div>
          </div>

          <aside className="s01ct-panel" aria-label="Kontaktní informace">
            <h3 className="s01ct-panel-title">
              <GenericEditableText sectionId={sectionId} field="panelTitle" value={panelTitle} tag="span" />
            </h3>
            <a href={`tel:${phoneTel}`} className="s01ct-item">
              <span className="s01ct-item-icon"><IconPhone /></span>
              <span className="s01ct-item-text">
                <span className="s01ct-item-lbl">
                  <GenericEditableText sectionId={sectionId} field="phoneLabel" value={phoneLabel} tag="span" />
                </span>
                <span className="s01ct-item-val">
                  <GenericEditableText sectionId={sectionId} field="phone" value={phone} tag="span" />
                </span>
              </span>
            </a>
            <a href={`mailto:${email}`} className="s01ct-item">
              <span className="s01ct-item-icon"><IconMail /></span>
              <span className="s01ct-item-text">
                <span className="s01ct-item-lbl">
                  <GenericEditableText sectionId={sectionId} field="emailLabel" value={emailLabel} tag="span" />
                </span>
                <span className="s01ct-item-val">
                  <GenericEditableText sectionId={sectionId} field="email" value={email} tag="span" />
                </span>
              </span>
            </a>
            <div className="s01ct-item" style={{ cursor: "default" }}>
              <span className="s01ct-item-icon"><IconClock /></span>
              <span className="s01ct-item-text">
                <span className="s01ct-item-lbl">
                  <GenericEditableText sectionId={sectionId} field="hoursLabel" value={hoursLabel} tag="span" />
                </span>
                <span className="s01ct-item-val">
                  <GenericEditableText sectionId={sectionId} field="hoursValue" value={hoursValue} tag="span" />
                </span>
              </span>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}

// ── clean-01-cta ──────────────────────────────────────────────────────────────
// 3-box CTA: světlé pozadí, centrovaný nadpis + podtitulek,
// dva zelená tlačítka (email + telefon) vedle sebe.
// ─────────────────────────────────────────────────────────────────────────────
function CtaClean01({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const GREEN = "#69be28";
  const DARK  = "#0d1a20";
  const FONT  = "Arial, Helvetica, sans-serif";

  const eyebrow          = String(content.eyebrow          ?? "Kontakt");
  const title            = String(content.title            ?? "Zájem o spolupráci?");
  const subtitle         = String(content.subtitle         ?? "Kontaktujte nás a domluvíme se na podmínkách spolupráce.");
  const ctaText          = String(content.ctaText          ?? "Napsat nám");
  const ctaHref          = String(content.ctaHref          ?? "mailto:email@demo.cz");
  const ctaSecondaryText = String(content.ctaSecondaryText ?? "Zavolat");
  const ctaSecondaryHref = String(content.ctaSecondaryHref ?? "tel:+420704123456");

  const styles = `
    .c01cta-section {
      background: #f5f5f5;
      font-family: ${FONT};
      padding: 5.5rem 1.5rem;
      text-align: center;
    }
    .c01cta-eyebrow {
      display: inline-block;
      font-size: 0.78rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.14em;
      color: ${GREEN};
      margin-bottom: 0.75rem;
    }
    .c01cta-title {
      font-size: clamp(1.8rem, 3.5vw, 2.8rem);
      font-weight: 700;
      color: ${DARK};
      margin: 0 0 1rem;
      line-height: 1.2;
    }
    .c01cta-subtitle {
      font-size: 1.05rem;
      color: #555;
      max-width: 560px;
      margin: 0 auto 2.8rem;
      line-height: 1.65;
    }
    .c01cta-btns {
      display: flex;
      flex-wrap: wrap;
      gap: 1rem;
      justify-content: center;
    }
    .c01cta-btn {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      background: ${GREEN};
      color: #ffffff;
      text-decoration: none;
      font-weight: 700;
      font-size: 1rem;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      padding: 0.95rem 2.4rem;
      border-radius: 4px;
      transition: background 0.18s;
    }
    .c01cta-btn:hover { background: #5aa020; }
    .c01cta-btn--outline {
      background: transparent;
      color: ${GREEN};
      border: 2px solid ${GREEN};
    }
    .c01cta-btn--outline:hover {
      background: ${GREEN};
      color: #ffffff;
    }
  `;

  return (
    <section id="kontakt" className="c01cta-section">
      <style>{styles}</style>
      <span className="c01cta-eyebrow">
        <GenericEditableText sectionId={sectionId} field="eyebrow" value={eyebrow} tag="span" />
      </span>
      <h2 className="c01cta-title">
        <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
      </h2>
      <p className="c01cta-subtitle">
        <GenericEditableText sectionId={sectionId} field="subtitle" value={subtitle} tag="span" />
      </p>
      <div className="c01cta-btns">
        <a href={ctaHref} data-btn="primary" className="c01cta-btn">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
            <rect x="2" y="4" width="14" height="10" rx="2" stroke="#fff" strokeWidth="1.5"/>
            <path d="M2 6l7 5 7-5" stroke="#fff" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
        </a>
        <a href={ctaSecondaryHref} className="c01cta-btn c01cta-btn--outline">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
            <path d="M13.5 11.5c-.8-.8-1.9-.8-2.7 0l-.8.8c-1.4-.8-2.7-2-3.5-3.4l.8-.8c.8-.8.8-1.9 0-2.7L6 4.1C5.2 3.3 4.1 3.3 3.3 4l-.5.5C1.6 5.8 2 8 3.5 10c1.4 1.9 3.3 3.5 5.4 4.4 1.8.8 3.8.6 5-.6l.5-.5c.8-.8.8-1.9-.9-1.8Z" stroke="${GREEN}" strokeWidth="1.4" fill="none"/>
          </svg>
          <GenericEditableText sectionId={sectionId} field="ctaSecondaryText" value={ctaSecondaryText} tag="span" />
        </a>
      </div>
    </section>
  );
}

// ── clean-02-cta (process steps) ─────────────────────────────────────────────
// Arctic Editorial: jediná tmavá (ink) sekce stránky — postup ve 4 krocích
// jako editorial timeline s hairline dělítky + CTA řádek s telefonem.
function CtaClean02({ content, sectionId, tenantSlug, isAdmin }: { content: Record<string, unknown>; sectionId: number; tenantSlug?: string; isAdmin: boolean }) {
  const eyebrow = String(content.eyebrow ?? "Postup spolupráce");
  const title   = String(content.title ?? "Od poptávky k pravidelnému úklidu ve čtyřech krocích");
  const ctaText = String(content.ctaText ?? "Nezávazně poptat úklid");
  const ctaHref = String(content.ctaHref ?? "#kontakt");
  const ctaNote = String(content.ctaNote ?? "Ozveme se do 24 hodin v pracovní dny.");
  const steps   = (content.steps as Array<{ number?: string; title?: string; description?: string }>) ?? [];
  const resolve = (href: string) => {
    if (!tenantSlug || href.startsWith("http") || href.startsWith("#")) return href;
    const base = isAdmin ? `/demo/${tenantSlug}/admin` : `/demo/${tenantSlug}`;
    return href === "/" ? base : `${base}${href}`;
  };
  return (
    <>
      <style>{`
        .c02ct-section { background: var(--color-secondary, #0B1526); padding: clamp(4rem, 8vw, 7rem) 0; font-family: 'Onest',sans-serif; }
        .c02ct-inner { max-width: 76rem; margin: 0 auto; padding: 0 clamp(1.25rem, 4vw, 2.5rem); }
        .c02ct-kicker {
          display: inline-flex; align-items: center; gap: .55rem;
          font-size: .8rem; font-weight: 700; letter-spacing: .14em; text-transform: uppercase;
          color: #6E9BFF; margin-bottom: 1.1rem;
        }
        .c02ct-kicker::before { content: ''; width: 22px; height: 2px; background: #6E9BFF; border-radius: 2px; }
        .c02ct-h2 {
          font-family: 'Bricolage Grotesque',sans-serif;
          font-size: clamp(1.9rem, 3.4vw, 2.9rem); font-weight: 750; color: #fff;
          margin: 0 0 clamp(2.4rem, 5vw, 3.8rem); line-height: 1.1; letter-spacing: -0.03em;
          max-width: 46rem; text-wrap: balance;
        }
        .c02ct-steps {
          display: grid; grid-template-columns: repeat(4, 1fr);
          border-top: 1px solid rgba(255,255,255,0.14);
          margin-bottom: clamp(2.4rem, 5vw, 3.6rem);
        }
        .c02ct-step {
          padding: 1.8rem 1.6rem 0.4rem 0;
          border-right: 1px solid rgba(255,255,255,0.14);
        }
        .c02ct-step + .c02ct-step { padding-left: 1.6rem; }
        .c02ct-step:last-child { border-right: none; padding-right: 0; }
        .c02ct-num {
          font-family: 'Bricolage Grotesque',sans-serif;
          font-size: .86rem; font-weight: 700; color: #6E9BFF;
          display: block; margin-bottom: 1.1rem; letter-spacing: .04em;
          font-variant-numeric: tabular-nums;
        }
        .c02ct-step h3 {
          font-family: 'Bricolage Grotesque',sans-serif;
          font-size: 1.14rem; font-weight: 700; color: #fff;
          margin: 0 0 .55rem; line-height: 1.3; letter-spacing: -0.015em;
        }
        .c02ct-step p { font-size: .9rem; color: #9AA7BC; margin: 0; line-height: 1.68; }
        .c02ct-foot { display: flex; align-items: center; gap: 1.3rem; flex-wrap: wrap; }
        .c02ct-btn {
          display: inline-flex; align-items: center; gap: .55rem;
          padding: 1rem 2rem; border-radius: 9999px;
          background: var(--color-primary, #1B5BFF); color: #fff; font-weight: 700; font-size: 1rem; text-decoration: none;
          transition: background .25s, transform .25s;
          box-shadow: 0 16px 34px -16px rgba(27,91,255,.7);
        }
        .c02ct-btn:hover { background: #3D74FF; transform: translateY(-2px); }
        .c02ct-btn svg { width: 16px; height: 16px; }
        .c02ct-note { font-size: .9rem; color: #9AA7BC; }
        @media (max-width: 960px) {
          .c02ct-steps { grid-template-columns: 1fr 1fr; border-top: none; }
          .c02ct-step { border-top: 1px solid rgba(255,255,255,0.14); padding: 1.4rem 1.2rem 0.6rem 0; }
          .c02ct-step:nth-child(2n) { border-right: none; }
          .c02ct-step + .c02ct-step { padding-left: 1.2rem; }
          .c02ct-step:nth-child(3) { padding-left: 0; }
        }
        @media (max-width: 520px) {
          .c02ct-steps { grid-template-columns: 1fr; }
          .c02ct-step { border-right: none !important; padding: 1.3rem 0 0.5rem !important; }
        }
        @media (prefers-reduced-motion: reduce) { .c02ct-btn { transition: none; } }
      `}</style>
      <section className="c02ct-section" id="postup" data-template="clean-02-cta">
        <div className="c02ct-inner">
          <p className="c02ct-kicker"><GenericEditableText sectionId={sectionId} field="eyebrow" value={eyebrow} tag="span" /></p>
          <h2 className="c02ct-h2"><GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" /></h2>
          <div className="c02ct-steps">
            {steps.map((step, i) => (
              <div key={i} className="c02ct-step">
                <span className="c02ct-num">{step.number ?? String(i + 1).padStart(2, "0")}</span>
                <h3><GenericEditableText sectionId={sectionId} field={`steps.${i}.title`} value={step.title ?? ""} tag="span" /></h3>
                <p><GenericEditableText sectionId={sectionId} field={`steps.${i}.description`} value={step.description ?? ""} tag="span" /></p>
              </div>
            ))}
          </div>
          <div className="c02ct-foot">
            <a href={resolve(ctaHref)} data-btn="primary" className="c02ct-btn">
              <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
              <svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </a>
            <span className="c02ct-note"><GenericEditableText sectionId={sectionId} field="ctaNote" value={ctaNote} tag="span" /></span>
          </div>
        </div>
      </section>
    </>
  );
}

/* ─── garden-02: CTA ──────────────────────────────────────────────────────── */
function CtaGarden02({ content, sectionId, tenantSlug, isAdmin }: { content: Record<string, unknown>; sectionId: number; tenantSlug?: string; isAdmin: boolean }) {
  const siteMode = String((content as Record<string,unknown>).siteMode ?? "multipage");
  const resolve  = (href: string) => resolveNavHref(href, siteMode, tenantSlug, isAdmin);

  const eyebrow   = String((content as Record<string,unknown>).eyebrow   ?? "Připraveni začít?");
  const title     = String((content as Record<string,unknown>).title     ?? "Představte si zahradu, která vás každý den potěší");
  const subtitle  = String((content as Record<string,unknown>).subtitle  ?? "Ozvěte se nám — první konzultace a návrh jsou zdarma. Rádi se přijedeme podívat a poradíme, co je pro váš pozemek nejlepší.");
  const ctaText   = String((content as Record<string,unknown>).ctaText   ?? "Nezávazná poptávka");
  const ctaHref   = String((content as Record<string,unknown>).ctaHref   ?? "/kontakt");
  const cta2Text  = String((content as Record<string,unknown>).cta2Text  ?? "Zavolat");
  const cta2Href  = String((content as Record<string,unknown>).cta2Href  ?? "tel:+420608345789");
  const phone     = String((content as Record<string,unknown>).phone     ?? "+420 608 345 789");
  const phoneLabel= String((content as Record<string,unknown>).phoneLabel?? "nebo zavolejte přímo");

  const PRIMARY = "#95c11f";
  const PRIM_H  = "#7fa318";
  const DARK    = "#1a2a0a";
  const FONT    = "'Inter', Arial, sans-serif";

  return (
    <>
      <style>{`
        .g02ct-section {
          background: linear-gradient(170deg, ${DARK} 0%, #0d1605 100%);
          padding: 100px 1.5rem; font-family: ${FONT};
          text-align: center; position: relative; overflow: hidden;
        }
        .g02ct-section::before {
          content: ""; position: absolute; top: 50%; left: 50%;
          transform: translate(-50%, -50%);
          width: 500px; height: 500px; border-radius: 50%;
          background: radial-gradient(circle, rgba(149,193,31,0.06) 0%, transparent 60%);
          pointer-events: none;
        }
        .g02ct-deco-tl {
          position: absolute; top: -20px; left: -20px;
          opacity: 0.06; pointer-events: none;
        }
        .g02ct-deco-br {
          position: absolute; bottom: -20px; right: -20px;
          opacity: 0.06; pointer-events: none; transform: rotate(180deg);
        }
        .g02ct-inner { max-width: 720px; margin: 0 auto; position: relative; z-index: 1; }
        .g02ct-eyebrow {
          display: inline-flex; align-items: center; gap: 0.6rem;
          font-size: 0.7rem; font-weight: 600;
          letter-spacing: 0.16em; text-transform: uppercase;
          color: ${PRIMARY}; margin-bottom: 1.2rem;
        }
        .g02ct-eyebrow-line {
          width: 32px; height: 1.5px; background: ${PRIMARY}; opacity: 0.5;
        }
        .g02ct-h2 {
          font-size: clamp(1.7rem, 4vw, 2.6rem); font-weight: 800;
          color: #fff; margin: 0 0 1rem; line-height: 1.12;
          letter-spacing: -0.02em;
        }
        .g02ct-sub {
          font-size: 1.05rem; color: rgba(255,255,255,0.60);
          margin: 0 0 2.2rem; line-height: 1.7;
        }
        .g02ct-btns {
          display: flex; gap: 0.9rem; justify-content: center;
          flex-wrap: wrap; margin-bottom: 1.2rem;
        }
        .g02ct-btn-primary {
          display: inline-flex; align-items: center; gap: 0.5rem;
          background: ${PRIMARY}; color: #fff;
          font-family: ${FONT}; font-size: 0.95rem; font-weight: 600;
          text-decoration: none; padding: 0.9rem 2.2rem;
          border-radius: 9999px; letter-spacing: 0.02em;
          box-shadow: 0 6px 22px rgba(149,193,31,0.35);
          transition: background 0.3s ease, transform 0.3s cubic-bezier(.22,.68,0,1.1),
                      box-shadow 0.3s ease;
        }
        .g02ct-btn-primary:hover {
          background: ${PRIM_H}; transform: translateY(-3px);
          box-shadow: 0 10px 30px rgba(149,193,31,0.50);
        }
        .g02ct-btn-outline {
          display: inline-flex; align-items: center; gap: 0.5rem;
          background: rgba(255,255,255,0.06); color: #fff;
          font-family: ${FONT}; font-size: 0.95rem; font-weight: 600;
          text-decoration: none; padding: 0.9rem 2.2rem;
          border-radius: 9999px; letter-spacing: 0.02em;
          border: 1.5px solid rgba(255,255,255,0.25);
          backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px);
          transition: background 0.3s ease, transform 0.3s cubic-bezier(.22,.68,0,1.1),
                      border-color 0.3s ease;
        }
        .g02ct-btn-outline:hover {
          background: rgba(255,255,255,0.12); transform: translateY(-3px);
          border-color: rgba(255,255,255,0.5);
        }
        .g02ct-phone {
          display: flex; align-items: center; justify-content: center;
          gap: 0.5rem;
        }
        .g02ct-phone-label {
          font-size: 0.8rem; color: rgba(255,255,255,0.40);
        }
        .g02ct-phone-link {
          font-size: 0.85rem; font-weight: 600; color: ${PRIMARY};
          text-decoration: none; transition: color 0.2s;
        }
        .g02ct-phone-link:hover { color: #b5e030; }
        @media (max-width: 640px) {
          .g02ct-section { padding: 64px 1.25rem; }
          .g02ct-btns { flex-direction: column; align-items: center; }
          .g02ct-btn-primary, .g02ct-btn-outline { width: 100%; max-width: 300px; justify-content: center; }
        }
      `}</style>
      <section className="g02ct-section" data-template="garden-02" id="cta">
        <svg className="g02ct-deco-tl" width="160" height="160" viewBox="0 0 160 160" fill="none" aria-hidden="true">
          <path d="M15 145C15 70 50 15 140 8C125 80 70 135 15 145Z" fill={PRIMARY}/>
        </svg>
        <svg className="g02ct-deco-br" width="120" height="120" viewBox="0 0 120 120" fill="none" aria-hidden="true">
          <path d="M10 110C10 50 35 10 110 6C98 60 50 102 10 110Z" fill={PRIMARY}/>
        </svg>

        <div className="g02ct-inner">
          <div className="g02ct-eyebrow">
            <span className="g02ct-eyebrow-line" aria-hidden="true" />
            <GenericEditableText sectionId={sectionId} field="eyebrow" value={eyebrow} tag="span" />
            <span className="g02ct-eyebrow-line" aria-hidden="true" />
          </div>
          <h2 className="g02ct-h2">
            <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
          </h2>
          <p className="g02ct-sub">
            <GenericEditableText sectionId={sectionId} field="subtitle" value={subtitle} tag="span" />
          </p>
          <div className="g02ct-btns">
            <a href={resolve(ctaHref)} className="g02ct-btn-primary">
              <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
            </a>
            <a href={cta2Href} className="g02ct-btn-outline">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.58 3.18 2 2 0 0 1 3.55 1h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 8.72A16 16 0 0 0 15.27 16.08l.89-.89a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
              </svg>
              <GenericEditableText sectionId={sectionId} field="cta2Text" value={cta2Text} tag="span" />
            </a>
          </div>
          <div className="g02ct-phone">
            <GenericEditableText sectionId={sectionId} field="phoneLabel" value={phoneLabel} tag="span" className="g02ct-phone-label" />
            <a href={`tel:${phone.replace(/\s/g, "")}`} className="g02ct-phone-link">
              <GenericEditableText sectionId={sectionId} field="phone" value={phone} tag="span" />
            </a>
          </div>
        </div>
      </section>
    </>
  );
}

// ─── ddd-01-cta ────────────────────────────────────────────────────────────
function CtaDdd01({ content, sectionId, tenantSlug, isAdmin }: {
  content: Record<string, unknown>;
  sectionId: number;
  tenantSlug?: string;
  isAdmin: boolean;
}) {
  const c = content as {
    eyebrow?: string; title?: string; subtitle?: string;
    ctaText?: string; ctaHref?: string;
    ctaSecondaryText?: string; ctaSecondaryHref?: string;
  };
  const eyebrow          = c.eyebrow          ?? "Kontakt";
  const title            = c.title            ?? "Zavolejte nám — přijedeme do 24 hodin";
  const subtitle         = c.subtitle         ?? "";
  const ctaText          = c.ctaText          ?? "Zavolat hned";
  const ctaHref          = c.ctaHref          ?? "tel:+420704123456";
  const ctaSecondaryText = c.ctaSecondaryText ?? "Napsat e-mail";
  const ctaSecondaryHref = c.ctaSecondaryHref ?? "mailto:info@demo.cz";

  const PRIMARY = "#0c93eb";
  const DARK    = "#064e86";
  const DARK2   = "#07294a";
  const FONT    = "'Figtree', system-ui, sans-serif";

  return (
    <>
      <style>{`
        .ddd01ct-section {
          background: ${DARK};
          padding: 96px 24px;
          font-family: ${FONT};
          text-align: center;
        }
        .ddd01ct-inner { max-width: 740px; margin: 0 auto; }
        .ddd01ct-eyebrow {
          display: inline-block;
          font-size: 0.75rem;
          font-weight: 700;
          letter-spacing: 0.35em;
          text-transform: uppercase;
          color: ${PRIMARY};
          margin-bottom: 18px;
        }
        .ddd01ct-h2 {
          font-family: 'Figtree', system-ui, sans-serif;
          font-size: clamp(1.7rem, 3.5vw, 2.6rem);
          font-weight: 800;
          color: #fff;
          margin: 0 0 16px;
          line-height: 1.2;
        }
        .ddd01ct-sub {
          font-size: 1.05rem;
          color: rgba(255,255,255,0.72);
          margin: 0 0 40px;
          line-height: 1.65;
        }
        .ddd01ct-btns {
          display: flex;
          gap: 16px;
          justify-content: center;
          flex-wrap: wrap;
        }
        .ddd01ct-btn-primary {
          display: inline-block;
          background: ${PRIMARY};
          color: #fff;
          font-size: 1rem;
          font-weight: 700;
          text-decoration: none;
          padding: 16px 40px;
          border-radius: 9999px;
          transition: opacity 0.2s, transform 0.15s;
        }
        .ddd01ct-btn-primary:hover { opacity: 0.88; transform: translateY(-1px); }
        .ddd01ct-btn-secondary {
          display: inline-block;
          background: transparent;
          color: #fff;
          font-size: 1rem;
          font-weight: 600;
          text-decoration: none;
          padding: 15px 38px;
          border-radius: 9999px;
          border: 2px solid rgba(255,255,255,0.45);
          transition: border-color 0.2s, background 0.2s, transform 0.15s;
        }
        .ddd01ct-btn-secondary:hover {
          border-color: #fff;
          background: rgba(255,255,255,0.08);
          transform: translateY(-1px);
        }
        @media (max-width: 640px) {
          .ddd01ct-section { padding: 64px 20px; }
          .ddd01ct-btns { flex-direction: column; align-items: center; }
          .ddd01ct-btn-primary, .ddd01ct-btn-secondary { width: 100%; max-width: 320px; text-align: center; }
        }
      `}</style>
      <section className="ddd01ct-section">
        <div className="ddd01ct-inner">
          <span className="ddd01ct-eyebrow">
            <GenericEditableText sectionId={sectionId} field="eyebrow" value={eyebrow} tag="span" />
          </span>
          <h2 className="ddd01ct-h2">
            <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
          </h2>
          {subtitle && (
            <p className="ddd01ct-sub">
              <GenericEditableText sectionId={sectionId} field="subtitle" value={subtitle} tag="span" />
            </p>
          )}
          <div className="ddd01ct-btns">
            <a href={ctaHref} data-btn="primary" className="ddd01ct-btn-primary">
              <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
            </a>
            <a href={ctaSecondaryHref} className="ddd01ct-btn-secondary">
              <GenericEditableText sectionId={sectionId} field="ctaSecondaryText" value={ctaSecondaryText} tag="span" />
            </a>
          </div>
        </div>
      </section>
    </>
  );
}

// ── chalet-01-cta ─────────────────────────────────────────────────────────────
function CtaChalet01({ content, sectionId, tenantSlug, isAdmin }: { content: Record<string, unknown>; sectionId: number; tenantSlug?: string; isAdmin: boolean }) {
  const c = (content ?? {}) as Record<string, any>;
  const title    = String(c.title    ?? "Přejeme vám krásnou dovolenou!");
  const subtitle = String(c.subtitle ?? "Přijeďte objevit nezaměnitelný půvab Horní Malé Úpy přímo k nám, na Demo Chalet, který je připraven právě pro vás.");
  const ctaText  = String(c.ctaText  ?? "Rezervujte termín");
  const ctaHref  = String(c.ctaHref  ?? "#rezervace");
  const phone    = String(c.phone    ?? "+420 704 123 456");
  const email    = String(c.email    ?? "email@demo.cz");

  const BEIGE  = "#c0bbad";
  const DARK   = "#1e2329";
  const FONT_H = "'Josefin Sans', system-ui, sans-serif";
  const FONT_B = "'Plus Jakarta Sans', system-ui, sans-serif";

  const resolve = (href: string) => resolveDemoHref(href, tenantSlug, isAdmin);

  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Josefin+Sans:wght@300;400;600&family=Plus+Jakarta+Sans:wght@400;500;600&display=swap" />
      <style>{`        .ch01cta {
          position: relative;
          background: ${DARK};
          overflow: hidden;
          padding: clamp(5rem, 10vw, 9rem) 1.5rem;
          text-align: center;
        }
        /* subtle béžový pattern přes pozadí */
        .ch01cta::before {
          content: '';
          position: absolute;
          inset: 0;
          background:
            radial-gradient(ellipse 70% 60% at 20% 50%, rgba(192,187,173,0.08) 0%, transparent 70%),
            radial-gradient(ellipse 50% 80% at 80% 50%, rgba(192,187,173,0.06) 0%, transparent 60%);
          pointer-events: none;
        }
        .ch01cta-inner {
          position: relative;
          z-index: 1;
          max-width: 720px;
          margin: 0 auto;
        }
        .ch01cta-ornament {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 1rem;
          margin-bottom: 2rem;
        }
        .ch01cta-ornament-line {
          width: 60px;
          height: 1px;
          background: linear-gradient(to right, transparent, ${BEIGE});
        }
        .ch01cta-ornament-line:last-child {
          background: linear-gradient(to left, transparent, ${BEIGE});
        }
        .ch01cta-ornament-diamond {
          width: 6px;
          height: 6px;
          background: ${BEIGE};
          transform: rotate(45deg);
          flex-shrink: 0;
        }
        .ch01cta-title {
          font-family: ${FONT_H};
          font-size: clamp(1.6rem, 4vw, 2.8rem);
          font-weight: 300;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #ffffff;
          line-height: 1.25;
          margin: 0 0 1.25rem;
        }
        .ch01cta-subtitle {
          font-family: ${FONT_B};
          font-size: clamp(0.82rem, 1.8vw, 0.95rem);
          line-height: 1.8;
          color: rgba(255,255,255,0.58);
          margin: 0 0 2.5rem;
          max-width: 560px;
          margin-left: auto;
          margin-right: auto;
        }
        .ch01cta-btn {
          display: inline-block;
          padding: 0.9rem 2.8rem;
          background: ${BEIGE};
          color: ${DARK};
          font-family: ${FONT_H};
          font-size: 0.72rem;
          font-weight: 700;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          text-decoration: none;
          margin-bottom: 2.5rem;
          transition: background 0.22s, color 0.22s;
        }
        .ch01cta-btn:hover {
          background: #aba49a;
        }
        .ch01cta-contacts {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 2.5rem;
          flex-wrap: wrap;
        }
        .ch01cta-contact-item {
          display: flex;
          align-items: center;
          gap: 0.55rem;
          font-family: ${FONT_B};
          font-size: 0.85rem;
          color: rgba(255,255,255,0.55);
          text-decoration: none;
          transition: color 0.18s;
        }
        .ch01cta-contact-item:hover { color: ${BEIGE}; }
        .ch01cta-contact-item svg { color: ${BEIGE}; flex-shrink: 0; }
        .ch01cta-sep {
          width: 1px;
          height: 20px;
          background: rgba(192,187,173,0.25);
        }
        @media (max-width: 480px) {
          .ch01cta-contacts { gap: 1.25rem; }
          .ch01cta-sep { display: none; }
        }
      `}</style>

      <section className="ch01cta" id="rezervace" data-template="chalet-01-cta">
        <div className="ch01cta-inner">
          <div className="ch01cta-ornament">
            <span className="ch01cta-ornament-line" />
            <span className="ch01cta-ornament-diamond" />
            <span className="ch01cta-ornament-line" />
          </div>

          <h2 className="ch01cta-title">
            <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
          </h2>
          <p className="ch01cta-subtitle">
            <GenericEditableText sectionId={sectionId} field="subtitle" value={subtitle} tag="span" />
          </p>

          <a href={resolve(ctaHref)} data-btn="primary" className="ch01cta-btn">
            <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
          </a>

          <div className="ch01cta-contacts">
            <a href={`tel:${phone.replace(/\s/g, "")}`} className="ch01cta-contact-item">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6.6 10.8a15.5 15.5 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1.02-.24 11.4 11.4 0 0 0 3.58.58 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.45.57 3.57a1 1 0 0 1-.25 1.03Z"/>
              </svg>
              <GenericEditableText sectionId={sectionId} field="phone" value={phone} tag="span" />
            </a>
            <span className="ch01cta-sep" />
            <a href={`mailto:${email}`} className="ch01cta-contact-item">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
              </svg>
              <GenericEditableText sectionId={sectionId} field="email" value={email} tag="span" />
            </a>
          </div>
        </div>
      </section>
    </>
  );
}

// ─── photo-01 CTA ────────────────────────────────────────────────────────────
function CtaPhoto01({ content, sectionId, tenantSlug, isAdmin }: { content: Record<string, unknown>; sectionId: number; tenantSlug?: string; isAdmin?: boolean }) {
  const c       = content as Record<string, unknown>;
  const eyebrow = (c.eyebrow  as string) ?? "";
  const title   = (c.title    as string) ?? "";
  const subtitle= (c.subtitle as string) ?? "";
  const bullets = (c.bullets  as string[]) ?? [];
  const ctaText = (c.ctaText  as string) ?? "Objednat poukaz";
  const ctaHref = (c.ctaHref  as string) ?? "#kontakt";
  const imageUrl= (c.imageUrl as string) ?? "";
  const imageAlt= (c.imageAlt as string) ?? "";

  function resolve(href: string) {
    if (!href || href.startsWith("#") || href.startsWith("http")) return href;
    return `/${tenantSlug}${href.startsWith("/") ? href : `/${href}`}`;
  }

  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700&family=Inter:wght@400;500&display=swap" />
      <style>{`        .ph01cta { background: #faf5f0; padding: 80px 5%; }
        .ph01cta-inner {
          max-width: 1100px; margin: 0 auto;
          display: grid; grid-template-columns: 36% auto;
          gap: 60px; align-items: center;
        }
        .ph01cta-img-wrap { position: relative; overflow: hidden; }
        .ph01cta-img-wrap img { width: 100%; height: 100%; object-fit: cover; display: block; }
        .ph01cta-right {}
        .ph01cta-eyebrow {
          font-family: 'Inter', sans-serif; font-size: 0.75rem; letter-spacing: 0.15em;
          text-transform: uppercase; color: #8b7355; margin-bottom: 12px;
        }
        .ph01cta-title {
          font-family: Georgia, 'Times New Roman', serif; font-size: 35px;
          font-weight: 400; color: #1a1a1a; margin: 0 0 8px;
          line-height: 1.2;
        }
        .ph01cta-title strong { font-weight: 700; }
        .ph01cta-divider { border: none; border-top: 1px solid #c9b99a; margin: 20px 0; }
        .ph01cta-bullets { list-style: none; padding: 0; margin: 0 0 28px; }
        .ph01cta-bullets li {
          font-family: 'Inter', sans-serif; font-size: 13px; color: #444;
          padding: 5px 0; display: flex; align-items: flex-start; gap: 8px;
        }
        .ph01cta-bullets li::before { content: "•"; color: #8b7355; font-size: 16px; line-height: 1; flex-shrink: 0; }
        .ph01cta-btn {
          display: inline-block; background: #1a1a1a; color: #fff;
          font-family: 'Inter', sans-serif; font-size: 13px; font-weight: 500;
          letter-spacing: 0.12em; text-transform: uppercase;
          padding: 14px 32px; text-decoration: none;
          transition: background 0.2s;
        }
        .ph01cta-btn:hover { background: #333; }
        @media (max-width: 768px) {
          .ph01cta-inner { grid-template-columns: 1fr; gap: 32px; }
          .ph01cta-title { font-size: 28px; }
        }
      `}</style>

      <section className="ph01cta" id="poukaz" data-template="photo-01-cta">
        <div className="ph01cta-inner">
          <div className="ph01cta-img-wrap">
            <GenericEditableImage
              sectionId={sectionId}
              field="imageUrl"
              src={imageUrl}
            >
              <img loading="lazy" src={imageUrl} alt={imageAlt} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
            </GenericEditableImage>
          </div>

          <div className="ph01cta-right">
            {eyebrow && (
              <p className="ph01cta-eyebrow">
                <GenericEditableText sectionId={sectionId} field="eyebrow" value={eyebrow} tag="span" />
              </p>
            )}
            <h2 className="ph01cta-title">
              <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
              {subtitle && (
                <><br /><strong><GenericEditableText sectionId={sectionId} field="subtitle" value={subtitle} tag="span" /></strong></>
              )}
            </h2>
            <hr className="ph01cta-divider" />
            {bullets.length > 0 && (
              <ul className="ph01cta-bullets">
                {bullets.map((b, i) => (
                  <li key={i}>
                    <GenericEditableText sectionId={sectionId} field={`bullets.${i}`} value={b} tag="span" />
                  </li>
                ))}
              </ul>
            )}
            <a href={resolve(ctaHref)} data-btn="primary" className="ph01cta-btn">
              <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
            </a>
          </div>
        </div>
      </section>
    </>
  );
}

// ── events-01-cta ─────────────────────────────────────────────────────────────
// Prémiová event-agentura: fullscreen bg + grain + vignette overlay,
// diamond ornament, Playfair italic H2 accent, purple primary CTA s gold ring
// hover, elegant ghost secondary, contact grid s gold ring icons. Awwwards.
// ─────────────────────────────────────────────────────────────────────────────
function CtaEvents01({ content, sectionId, tenantSlug, isAdmin }: { content: Record<string, unknown>; sectionId: number; tenantSlug?: string; isAdmin: boolean }) {
  const GOLD   = "#d4b896";
  const PURPLE = "#931789";
  const eyebrow       = String(content.eyebrow       ?? "Pojďme na to společně");
  const title         = String(content.title         ?? "Máte akci na obzoru?");
  const subtitle      = String(content.subtitle      ?? "Rádi se potkáme na kávě a probereme, jak vám pomoci. Nezávazná konzultace zdarma.");
  const ctaText       = String(content.ctaText       ?? "Napište nám");
  const ctaHref       = String(content.ctaHref       ?? "mailto:email@demo.cz");
  const ctaSecondary  = String(content.ctaSecondaryText ?? "Zavolat nám");
  const phone         = String(content.phone         ?? "+420 704 123 456");
  const email         = String(content.email         ?? "email@demo.cz");
  const phoneLabel    = String(content.phoneLabel    ?? "Telefon");
  const emailLabel    = String(content.emailLabel    ?? "E-mail");
  const imageUrl      = String(content.imageUrl      ?? "/clones/amdenevents/wp-content/uploads/2026/04/Vanoce.jpg");
  const resolve       = (href: string) => resolveDemoHref(href, tenantSlug, isAdmin);
  return (
    <>
      <style>{`
        .ev01cta {
          position: relative;
          padding: 170px 40px;
          text-align: center;
          color: #fff;
          overflow: hidden;
        }
        .ev01cta-bg {
          position: absolute;
          inset: 0;
          background-image: url('${imageUrl}');
          background-size: cover;
          background-position: center;
          transform: scale(1.06);
          animation: ev01ctaPan 26s ease-in-out infinite alternate;
        }
        @keyframes ev01ctaPan {
          from { transform: scale(1.06) translate(-10px, -6px); }
          to   { transform: scale(1.1)  translate(10px,  6px); }
        }
        .ev01cta-overlay {
          position: absolute;
          inset: 0;
          background:
            radial-gradient(circle at 50% 50%, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.85) 75%, rgba(0,0,0,0.94) 100%),
            linear-gradient(135deg, rgba(10,0,15,0.35) 0%, rgba(0,0,0,0.35) 100%);
        }
        .ev01cta-grain {
          position: absolute;
          inset: 0;
          z-index: 1;
          pointer-events: none;
          opacity: 0.12;
          mix-blend-mode: overlay;
          background-image: url("data:image/svg+xml;utf8,<svg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix type='saturate' values='0'/></filter><rect width='100%' height='100%' filter='url(%23n)' opacity='0.55'/></svg>");
        }
        .ev01cta-inner {
          position: relative;
          z-index: 2;
          max-width: 820px;
          margin: 0 auto;
        }
        .ev01cta-ornament {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 18px;
          margin-bottom: 38px;
          opacity: 0;
          transform: translateY(10px);
          animation: ev01ctaRise 0.9s cubic-bezier(.32,.72,0,1) 0.15s forwards;
        }
        .ev01cta-ornament-line {
          width: 64px;
          height: 1px;
          background: linear-gradient(90deg, transparent 0%, ${GOLD} 100%);
        }
        .ev01cta-ornament-line + .ev01cta-ornament-line,
        .ev01cta-ornament-diamond ~ .ev01cta-ornament-line {
          background: linear-gradient(90deg, ${GOLD} 0%, transparent 100%);
        }
        .ev01cta-ornament-diamond {
          width: 8px;
          height: 8px;
          border: 1px solid ${GOLD};
          background: ${GOLD};
          transform: rotate(45deg);
          flex-shrink: 0;
          box-shadow: 0 0 0 3px rgba(212,184,150,0.12);
        }
        .ev01cta-eyebrow {
          display: block;
          font-family: 'Inter', sans-serif;
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 4.5px;
          text-transform: uppercase;
          color: ${GOLD};
          margin-bottom: 26px;
          opacity: 0;
          transform: translateY(10px);
          animation: ev01ctaRise 0.9s cubic-bezier(.32,.72,0,1) 0.3s forwards;
        }
        .ev01cta h2 {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: clamp(40px, 5.5vw, 76px);
          font-weight: 400;
          margin: 0 0 28px;
          line-height: 1.08;
          letter-spacing: -0.01em;
          color: #fff;
          text-shadow: 0 2px 30px rgba(0,0,0,0.4);
          opacity: 0;
          transform: translateY(14px);
          animation: ev01ctaRise 1s cubic-bezier(.32,.72,0,1) 0.45s forwards;
        }
        .ev01cta h2 em {
          font-style: italic;
          color: ${GOLD};
        }
        .ev01cta-sub {
          font-family: 'Inter', sans-serif;
          font-size: 16px;
          color: rgba(255,255,255,0.72);
          margin: 0 auto 56px;
          line-height: 1.75;
          max-width: 580px;
          display: block;
          letter-spacing: 0.2px;
          opacity: 0;
          transform: translateY(10px);
          animation: ev01ctaRise 0.9s cubic-bezier(.32,.72,0,1) 0.6s forwards;
        }
        .ev01cta-actions {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 20px;
          flex-wrap: wrap;
          margin-bottom: 60px;
          opacity: 0;
          transform: translateY(10px);
          animation: ev01ctaRise 0.9s cubic-bezier(.32,.72,0,1) 0.75s forwards;
        }
        .ev01cta-btn-primary {
          position: relative;
          display: inline-flex;
          align-items: center;
          gap: 12px;
          padding: 18px 44px;
          background: ${PURPLE};
          color: #fff;
          text-decoration: none;
          font-family: 'Inter', sans-serif;
          font-weight: 600;
          font-size: 11.5px;
          letter-spacing: 2.6px;
          text-transform: uppercase;
          transition: background 0.4s cubic-bezier(.32,.72,0,1), transform 0.4s cubic-bezier(.32,.72,0,1), box-shadow 0.4s cubic-bezier(.32,.72,0,1);
        }
        .ev01cta-btn-primary::before {
          content: "";
          position: absolute;
          inset: -4px;
          border: 1px solid rgba(212,184,150,0);
          transition: border-color 0.5s cubic-bezier(.32,.72,0,1);
          pointer-events: none;
        }
        .ev01cta-btn-primary:hover {
          background: #a5199a;
          transform: translateY(-2px);
          box-shadow: 0 22px 44px -12px rgba(147,23,137,0.65);
        }
        .ev01cta-btn-primary:hover::before { border-color: rgba(212,184,150,0.65); }
        .ev01cta-btn-primary svg { transition: transform 0.4s cubic-bezier(.32,.72,0,1); }
        .ev01cta-btn-primary:hover svg { transform: translateX(3px); }
        .ev01cta-btn-secondary {
          position: relative;
          display: inline-flex;
          align-items: center;
          gap: 12px;
          padding: 17px 36px;
          background: transparent;
          color: #fff;
          text-decoration: none;
          font-family: 'Inter', sans-serif;
          font-weight: 500;
          font-size: 11.5px;
          letter-spacing: 2.6px;
          text-transform: uppercase;
          border: 1px solid rgba(255,255,255,0.3);
          transition: border-color 0.4s cubic-bezier(.32,.72,0,1), color 0.4s cubic-bezier(.32,.72,0,1), transform 0.4s cubic-bezier(.32,.72,0,1), background 0.4s cubic-bezier(.32,.72,0,1);
        }
        .ev01cta-btn-secondary:hover {
          border-color: ${GOLD};
          color: ${GOLD};
          background: rgba(212,184,150,0.06);
          transform: translateY(-2px);
        }
        .ev01cta-divider {
          width: 48px;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(212,184,150,0.55), transparent);
          margin: 0 auto 34px;
          opacity: 0;
          animation: ev01ctaRise 0.9s cubic-bezier(.32,.72,0,1) 0.9s forwards;
        }
        .ev01cta-contacts {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 56px;
          flex-wrap: wrap;
          opacity: 0;
          transform: translateY(10px);
          animation: ev01ctaRise 0.9s cubic-bezier(.32,.72,0,1) 1.05s forwards;
        }
        .ev01cta-contact-item {
          display: flex;
          align-items: center;
          gap: 14px;
          transition: transform 0.4s cubic-bezier(.32,.72,0,1);
        }
        .ev01cta-contact-item:hover { transform: translateY(-2px); }
        .ev01cta-contact-icon {
          width: 44px;
          height: 44px;
          border: 1px solid rgba(212,184,150,0.32);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          color: ${GOLD};
          transition: border-color 0.4s cubic-bezier(.32,.72,0,1), background 0.4s cubic-bezier(.32,.72,0,1), box-shadow 0.4s cubic-bezier(.32,.72,0,1);
        }
        .ev01cta-contact-item:hover .ev01cta-contact-icon {
          border-color: ${GOLD};
          background: rgba(212,184,150,0.08);
          box-shadow: 0 0 0 4px rgba(212,184,150,0.08);
        }
        .ev01cta-contact-text { text-align: left; }
        .ev01cta-contact-label {
          display: block;
          font-family: 'Inter', sans-serif;
          font-size: 10px;
          font-weight: 500;
          letter-spacing: 2.5px;
          text-transform: uppercase;
          color: rgba(255,255,255,0.45);
          margin-bottom: 3px;
        }
        .ev01cta-contact-val {
          font-family: 'Inter', sans-serif;
          font-size: 15px;
          font-weight: 500;
          color: #fff;
          text-decoration: none;
          transition: color 0.3s cubic-bezier(.32,.72,0,1);
        }
        .ev01cta-contact-item:hover .ev01cta-contact-val { color: ${GOLD}; }
        @keyframes ev01ctaRise { to { opacity: 1; transform: translateY(0); } }
        @media (max-width: 768px) {
          .ev01cta { padding: 100px 24px; }
          .ev01cta-contacts { flex-direction: column; gap: 24px; }
          .ev01cta-actions { flex-direction: column; align-items: center; gap: 14px; }
          .ev01cta-btn-primary, .ev01cta-btn-secondary { width: 100%; max-width: 280px; justify-content: center; }
          .ev01cta-ornament-line { width: 44px; }
        }
        @media (max-width: 480px) {
          .ev01cta { padding: 80px 20px; }
        }
      `}</style>
      <section className="ev01cta" id="kontakt" data-template="events-01-cta">
        <GenericEditableBackground sectionId={sectionId} field="imageUrl" value={imageUrl}>
          <div className="ev01cta-bg" />
        </GenericEditableBackground>
        <div className="ev01cta-overlay" />
        <div className="ev01cta-grain" />
        <div className="ev01cta-inner">
          <div className="ev01cta-ornament" aria-hidden="true">
            <div className="ev01cta-ornament-line" />
            <div className="ev01cta-ornament-diamond" />
            <div className="ev01cta-ornament-line" />
          </div>
          <GenericEditableText sectionId={sectionId} field="eyebrow" value={eyebrow} tag="span">
            <span className="ev01cta-eyebrow">{eyebrow}</span>
          </GenericEditableText>
          <GenericEditableText sectionId={sectionId} field="title" value={title} tag="h2"><h2>{title}</h2></GenericEditableText>
          <GenericEditableText sectionId={sectionId} field="subtitle" value={subtitle} tag="span">
            <span className="ev01cta-sub">{subtitle}</span>
          </GenericEditableText>
          <div className="ev01cta-actions">
            <a href={resolve(ctaHref)} data-btn="primary" className="ev01cta-btn-primary">
              <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span">{ctaText}</GenericEditableText>
              <svg width="16" height="10" viewBox="0 0 16 10" fill="none" stroke="currentColor" strokeWidth="1.2"><path d="M0 5h14M11 1l4 4-4 4"/></svg>
            </a>
            <a href={`tel:${phone.replace(/\s/g, "")}`} className="ev01cta-btn-secondary">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>
              <GenericEditableText sectionId={sectionId} field="ctaSecondaryText" value={ctaSecondary} tag="span">{ctaSecondary}</GenericEditableText>
            </a>
          </div>
          <div className="ev01cta-divider" aria-hidden="true" />
          <div className="ev01cta-contacts">
            <div className="ev01cta-contact-item">
              <div className="ev01cta-contact-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>
              </div>
              <div className="ev01cta-contact-text">
                <span className="ev01cta-contact-label">
                  <GenericEditableText sectionId={sectionId} field="phoneLabel" value={phoneLabel} tag="span">{phoneLabel}</GenericEditableText>
                </span>
                <a href={`tel:${phone.replace(/\s/g, "")}`} className="ev01cta-contact-val">
                  <GenericEditableText sectionId={sectionId} field="phone" value={phone} tag="span">{phone}</GenericEditableText>
                </a>
              </div>
            </div>
            <div className="ev01cta-contact-item">
              <div className="ev01cta-contact-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
              </div>
              <div className="ev01cta-contact-text">
                <span className="ev01cta-contact-label">
                  <GenericEditableText sectionId={sectionId} field="emailLabel" value={emailLabel} tag="span">{emailLabel}</GenericEditableText>
                </span>
                <a href={`mailto:${email}`} className="ev01cta-contact-val">
                  <GenericEditableText sectionId={sectionId} field="email" value={email} tag="span">{email}</GenericEditableText>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

// ── restaurant-04-cta ────────────────────────────────────────────────────────
// Polední menu sekce: fullwidth food foto bg + tmavý overlay, centrovaný obsah.
// Kicker (tagline), Fraunces italic H2, body text, 2 CTA tlačítka.
// ─────────────────────────────────────────────────────────────────────────────
function CtaRestaurant04({ content, sectionId, tenantSlug, isAdmin }: { content: Record<string, unknown>; sectionId: number; tenantSlug?: string; isAdmin?: boolean }) {
  const tagline  = String(content.tagline  ?? "Každý všední den 11:00 – 15:00");
  const title    = String(content.title    ?? "Polední menu\nplné chutí Itálie.");
  const body     = String(content.body     ?? "");
  const ctaText  = String(content.ctaText  ?? "Přihlásit se k odběru menu");
  const ctaHref  = String(content.ctaHref  ?? "#kontakt");
  const cta2Text = String((content as any).ctaSecondaryText ?? "Zobrazit menu");
  const cta2Href = String((content as any).ctaSecondaryHref ?? "/menu");
  const image    = String(content.image    ?? "/templates/restaurant-04/cta-bg.webp");
  const sectionId2 = String((content as any).id ?? "poledni-menu");
  const siteMode = String(content.siteMode ?? "multipage");

  const RED   = "#c41c1c";
  const CREAM = "#f5f0e8";
  const DARK  = "#0d1f0a";
  const SERIF = "'Fraunces', Georgia, 'Times New Roman', serif";
  const SANS  = "'Nunito Sans', 'Helvetica Neue', Arial, sans-serif";

  const resolve = (href: string) => resolveNavHref(href, siteMode, tenantSlug, isAdmin ?? false);

  return (
    <section
      id={sectionId2}
      data-template="restaurant-04"
      style={{
        position: "relative", overflow: "hidden",
        padding: "clamp(100px, 16vw, 200px) clamp(24px, 8vw, 120px)",
        textAlign: "center",
      }}
    >
      {/* BG foto — Ken Burns slow zoom */}
      <div className="r04-cta-bg" style={{ position: "absolute", inset: "-8%", width: "116%", height: "116%" }}>
        <img
          src={image}
          alt=""
          loading="lazy"
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
        />
      </div>

      {/* Multi-layer overlay */}
      <div style={{
        position: "absolute", inset: 0,
        background: `linear-gradient(180deg, ${DARK}f0 0%, ${DARK}c0 40%, ${DARK}c8 60%, ${DARK}f0 100%)`,
      }} />
      <div style={{
        position: "absolute", inset: 0,
        background: `radial-gradient(ellipse 60% 50% at 50% 50%, ${RED}18 0%, transparent 70%)`,
      }} />

      {/* Corner brackets */}
      <div style={{ position: "absolute", top: "clamp(24px, 4vw, 56px)", left: "clamp(24px, 4vw, 56px)", width: 48, height: 48, borderTop: `1px solid ${CREAM}25`, borderLeft: `1px solid ${CREAM}25` }} />
      <div style={{ position: "absolute", top: "clamp(24px, 4vw, 56px)", right: "clamp(24px, 4vw, 56px)", width: 48, height: 48, borderTop: `1px solid ${CREAM}25`, borderRight: `1px solid ${CREAM}25` }} />
      <div style={{ position: "absolute", bottom: "clamp(24px, 4vw, 56px)", left: "clamp(24px, 4vw, 56px)", width: 48, height: 48, borderBottom: `1px solid ${CREAM}25`, borderLeft: `1px solid ${CREAM}25` }} />
      <div style={{ position: "absolute", bottom: "clamp(24px, 4vw, 56px)", right: "clamp(24px, 4vw, 56px)", width: 48, height: 48, borderBottom: `1px solid ${CREAM}25`, borderRight: `1px solid ${CREAM}25` }} />

      {/* Content */}
      <div style={{ position: "relative", zIndex: 2, maxWidth: 720, margin: "0 auto" }}>
        {/* Kicker with dot ornaments */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 14, margin: "0 0 28px" }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: RED, opacity: 0.7 }} />
          <p style={{
            fontFamily: SANS, fontSize: 11, fontWeight: 700,
            letterSpacing: "0.24em", textTransform: "uppercase",
            color: RED, margin: 0,
          }}>
            <GenericEditableText sectionId={sectionId} field="tagline" value={tagline} tag="span" />
          </p>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: RED, opacity: 0.7 }} />
        </div>

        {/* Decorative line */}
        <div style={{ width: 44, height: 2, background: `linear-gradient(90deg, transparent, ${RED}, transparent)`, margin: "0 auto 32px" }} />

        {/* H2 */}
        <h2 style={{
          fontFamily: SERIF, fontSize: "clamp(32px, 5.5vw, 64px)", fontWeight: 400,
          fontStyle: "italic", color: CREAM, margin: "0 0 28px", lineHeight: 1.08,
          whiteSpace: "pre-line",
        }}>
          <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
        </h2>

        {/* Body */}
        {body && (
          <p style={{
            fontFamily: SANS, fontSize: "clamp(14px, 1.4vw, 17px)", fontWeight: 400,
            color: `${CREAM}bb`, lineHeight: 1.8, margin: "0 auto 48px", maxWidth: 540,
          }}>
            <GenericEditableText sectionId={sectionId} field="body" value={body} tag="span" />
          </p>
        )}

        {/* CTA buttons */}
        <div className="r04-cta-btns" style={{ display: "flex", gap: 16, flexWrap: "wrap", justifyContent: "center" }}>
          <a
            href={resolve(ctaHref)}
            data-btn="primary"
            className="r04-cta1"
            style={{
              display: "inline-block", fontFamily: SANS, fontSize: 11, fontWeight: 700,
              letterSpacing: "0.14em", textTransform: "uppercase",
              color: CREAM, textDecoration: "none",
              padding: "16px 40px", backgroundColor: RED, borderRadius: 2,
            }}
          >
            <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
          </a>
          <a
            href={resolve(cta2Href)}
            className="r04-cta2"
            style={{
              display: "inline-block", fontFamily: SANS, fontSize: 11, fontWeight: 700,
              letterSpacing: "0.14em", textTransform: "uppercase",
              color: CREAM, textDecoration: "none",
              padding: "16px 40px", border: `1px solid ${CREAM}44`, borderRadius: 2,
            }}
          >
            <GenericEditableText sectionId={sectionId} field="ctaSecondaryText" value={cta2Text} tag="span" />
          </a>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   video-01-cta  — Nabídka
   Light bg split: text left + square photo right
   eyebrow → large Playfair heading → bullet list
   → gold filled CTA button "Napište mi"
───────────────────────────────────────────── */
function CtaVideo01({ content, sectionId, isAdmin }: {
  content: Record<string, unknown>;
  sectionId: number;
  tenantSlug?: string;
  isAdmin: boolean;
}) {
  const c = content as {
    eyebrow?: string; title?: string; subtitle?: string;
    bullets?: string[];
    ctaText?: string; ctaHref?: string;
    imageUrl?: string; imageAlt?: string;
  };
  const eyebrow  = c.eyebrow  ?? "Nabídka";
  const title    = c.title    ?? "Vy prožijte svůj den. Já ho pro vás uchovám.";
  const subtitle = c.subtitle ?? "Jak může vypadat vaše svatební video";
  const bullets  = c.bullets  ?? [];
  const ctaText  = c.ctaText  ?? "Napište mi";
  const ctaHref  = c.ctaHref  ?? "#kontakt";
  const imageUrl = c.imageUrl ?? "";
  const imageAlt = c.imageAlt ?? "";

  return (
    <section id={String(sectionId)} style={{ background: "#f9f7f5" }}>
      <style>{`
        .vd01cta-wrap {
          max-width: 980px;
          margin: 0 auto;
          padding: 88px 24px 96px;
          display: grid;
          grid-template-columns: 1fr 420px;
          gap: 80px;
          align-items: center;
        }
        .vd01cta-eyebrow {
          font-family: 'Inter', system-ui, sans-serif;
          font-size: 11px;
          font-weight: 400;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: #C49A6C;
          margin: 0 0 20px;
          display: block;
        }
        .vd01cta-title {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: 34px;
          font-weight: 500;
          color: #2E2A28;
          line-height: 1.25;
          margin: 0 0 18px;
        }
        .vd01cta-subtitle {
          font-family: 'Inter', system-ui, sans-serif;
          font-size: 14px;
          font-weight: 400;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: #9a928c;
          margin: 0 0 24px;
        }
        .vd01cta-bullets {
          list-style: none;
          margin: 0 0 36px;
          padding: 0;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .vd01cta-bullets li {
          font-family: 'Inter', system-ui, sans-serif;
          font-size: 15px;
          font-weight: 300;
          color: #5a5450;
          line-height: 1.6;
          padding-left: 20px;
          position: relative;
        }
        .vd01cta-bullets li::before {
          content: "";
          position: absolute;
          left: 0;
          top: 10px;
          width: 8px;
          height: 1px;
          background: #C49A6C;
        }
        .vd01cta-btn {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          background: #C49A6C;
          color: #fff;
          font-family: 'Inter', system-ui, sans-serif;
          font-size: 13px;
          font-weight: 400;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          text-decoration: none;
          padding: 15px 36px;
          border: 1px solid #C49A6C;
          transition: background 0.2s, color 0.2s;
        }
        .vd01cta-btn:hover { background: transparent; color: #C49A6C; }
        .vd01cta-img {
          width: 100%;
          aspect-ratio: 1 / 1;
          overflow: hidden;
        }
        .vd01cta-img img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center;
          display: block;
        }
        @media (max-width: 820px) {
          .vd01cta-wrap {
            grid-template-columns: 1fr;
            gap: 40px;
            padding: 56px 20px 64px;
          }
          .vd01cta-img { aspect-ratio: 4/3; order: -1; }
          .vd01cta-title { font-size: 26px; }
        }
      `}</style>

      <div className="vd01cta-wrap">
        <div>
          <span className="vd01cta-eyebrow">
            {isAdmin ? <GenericEditableText sectionId={sectionId} field="eyebrow" value={eyebrow} tag="span" /> : eyebrow}
          </span>
          <h2 className="vd01cta-title">
            {isAdmin ? <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" /> : title}
          </h2>
          <p className="vd01cta-subtitle">
            {isAdmin ? <GenericEditableText sectionId={sectionId} field="subtitle" value={subtitle} tag="span" /> : subtitle}
          </p>
          {bullets.length > 0 && (
            <ul className="vd01cta-bullets">
              {bullets.map((b, i) => (
                <li key={i}>
                  {isAdmin ? <GenericEditableText sectionId={sectionId} field={`bullets.${i}`} value={b} tag="span" /> : b}
                </li>
              ))}
            </ul>
          )}
          <a href={ctaHref} data-btn="primary" className="vd01cta-btn">
            {isAdmin ? <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" /> : <span>{ctaText}</span>}
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </a>
        </div>

        <div className="vd01cta-img">
          {imageUrl
            ? (isAdmin
                ? <GenericEditableImage sectionId={sectionId} field="imageUrl" src={imageUrl} alt={imageAlt}><img src={imageUrl} alt={imageAlt} loading="lazy" /></GenericEditableImage>
                : <img src={imageUrl} alt={imageAlt} loading="lazy" />)
            : null}
        </div>
      </div>
    </section>
  );
}

/* ============================================================
 * eshop-02 "Modrý Košík" — Shoptet Classic DNA
 * Newsletter CTA: modrý gradient banner, e-mail input + oranžové
 * tlačítko, sleva za přihlášení. Demo submit (bez backendu).
 * ============================================================ */

function CtaEshop02({ content, sectionId }: {
  content: Record<string, unknown>;
  sectionId: number;
}) {
  const BLUE = "#1266cc";
  const BLUE_DARK = "#0e51a3";
  const ACCENT = "#f0803c";
  const SANS = "'Open Sans', 'Segoe UI', Arial, sans-serif";

  const eyebrow = content.eyebrow === undefined ? "Newsletter" : String(content.eyebrow);
  const heading = content.heading === undefined ? "Slevy a novinky přímo do schránky" : String(content.heading);
  const text = content.text === undefined ? "" : String(content.text);
  const placeholder = content.placeholder === undefined ? "vas@email.cz" : String(content.placeholder);
  const buttonText = content.buttonText === undefined ? "Chci odebírat" : String(content.buttonText);
  const note = content.note === undefined ? "Odhlásit se můžete kdykoli jedním kliknutím." : String(content.note);
  const successText = content.successText === undefined ? "Děkujeme! Potvrzení jsme poslali na váš e-mail." : String(content.successText);

  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);

  return (
    <section className="wc2n" data-variant="eshop-02-cta" id={typeof content.anchorId === "string" ? content.anchorId : "newsletter"}>
      <style>{`
        .wc2n { background: linear-gradient(120deg, ${BLUE} 0%, ${BLUE_DARK} 100%); color: #fff; font-family: ${SANS}; position: relative; overflow: hidden; }
        .wc2n::before { content: ""; position: absolute; right: -120px; top: -120px; width: 380px; height: 380px; border-radius: 999px; background: rgba(255,255,255,0.07); }
        .wc2n::after { content: ""; position: absolute; right: 60px; bottom: -160px; width: 300px; height: 300px; border-radius: 999px; background: rgba(255,255,255,0.05); }
        .wc2n-inner { position: relative; z-index: 1; max-width: 1280px; margin: 0 auto; padding: clamp(44px,5.5vw,72px) 24px; display: grid; grid-template-columns: minmax(0,6fr) minmax(0,6fr); gap: clamp(24px,4vw,56px); align-items: center; }
        @media (max-width: 860px) { .wc2n-inner { grid-template-columns: 1fr; } }
        .wc2n-eyebrow { display: inline-flex; align-items: center; gap: 8px; font-size: 12px; font-weight: 700; letter-spacing: .16em; text-transform: uppercase; color: rgba(255,255,255,0.85); margin: 0 0 10px; }
        .wc2n-title { font-size: clamp(24px,3vw,36px); font-weight: 700; letter-spacing: -0.02em; line-height: 1.12; margin: 0 0 10px; color: #fff; }
        .wc2n-text { font-size: 15px; line-height: 1.65; color: rgba(255,255,255,0.82); margin: 0; max-width: 480px; }
        .wc2n-form { display: flex; gap: 10px; background: #fff; border-radius: 12px; padding: 8px; box-shadow: 0 18px 44px rgba(0,0,0,0.22); }
        @media (max-width: 520px) { .wc2n-form { flex-direction: column; padding: 10px; } }
        .wc2n-input { flex: 1; min-width: 0; border: 0; outline: none; background: none; font-family: inherit; font-size: 15px; color: #142b45; padding: 12px 14px; }
        .wc2n-input::placeholder { color: #94a3b8; }
        .wc2n-btn { flex-shrink: 0; border: 0; cursor: pointer; font-family: inherit; font-size: 15px; font-weight: 700; color: #fff; background: ${ACCENT}; border-radius: 9px; padding: 13px 26px; transition: filter .2s, transform .15s; }
        .wc2n-btn:hover { filter: brightness(1.08); transform: translateY(-1px); }
        .wc2n-note { display: block; font-size: 12.5px; color: rgba(255,255,255,0.65); margin-top: 12px; }
        .wc2n-done { display: flex; align-items: center; gap: 12px; background: rgba(255,255,255,0.14); border: 1px solid rgba(255,255,255,0.35); border-radius: 12px; padding: 18px 20px; font-size: 15px; font-weight: 600; }
        .wc2n-done-ico { flex-shrink: 0; width: 34px; height: 34px; border-radius: 999px; background: #2ec573; display: grid; place-items: center; }
      `}</style>
      <div className="wc2n-inner">
        <div>
          <p className="wc2n-eyebrow">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 6L2 7"/></svg>
            <GenericEditableText sectionId={sectionId} field="eyebrow" value={eyebrow} tag="span" />
          </p>
          <GenericEditableText sectionId={sectionId} field="heading" value={heading} tag="h2" className="wc2n-title" />
          {text.trim() !== "" && (
            <GenericEditableText sectionId={sectionId} field="text" value={text} tag="p" className="wc2n-text" />
          )}
        </div>
        <div>
          {done ? (
            <div className="wc2n-done" role="status">
              <span className="wc2n-done-ico" aria-hidden>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 13l4 4L19 7"/></svg>
              </span>
              {successText}
            </div>
          ) : (
            <form
              className="wc2n-form"
              onSubmit={(e) => {
                e.preventDefault();
                if (email.trim() !== "") setDone(true);
              }}
            >
              <input
                type="email"
                required
                className="wc2n-input"
                placeholder={placeholder}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                aria-label="E-mailová adresa"
              />
              <button type="submit" className="wc2n-btn">
                <GenericEditableText sectionId={sectionId} field="buttonText" value={buttonText} tag="span" />
              </button>
            </form>
          )}
          <GenericEditableText sectionId={sectionId} field="note" value={note} tag="span" className="wc2n-note" />
        </div>
      </div>
    </section>
  );
}

// ── eshop-03-banner ─────────────────────────────────────────────────────────────
// Shoptet Disco promo banner: full-width flat foto pás (radius 0) s bílým
// gradient panelem vlevo, Nunito 900 headline a žlutým uppercase CTA.
// ──────────────────────────────────────────────────────────────────────────────
function BannerEshop03({ content, sectionId, tenantSlug, isAdmin }: {
  content: Record<string, unknown>;
  sectionId: number;
  tenantSlug?: string;
  isAdmin: boolean;
}) {
  const c = content as { image?: string; imageAlt?: string; badge?: string; heading?: string; text?: string; ctaText?: string; ctaHref?: string; siteMode?: string };
  const siteMode = String(c.siteMode ?? "multipage");
  const base = tenantSlug ? `/demo/${tenantSlug}${isAdmin ? "/admin" : ""}` : "";
  const resolve = (href: string) => {
    if (siteMode === "onepage") {
      if (href.startsWith("/") && href !== "/") return `${base}#${href.slice(1)}`;
      if (href.startsWith("#")) return `${base}${href}`;
      return href;
    }
    if (href.startsWith("#")) return `${base}/${href.slice(1)}`;
    if (href.startsWith("/")) return `${base}${href}`;
    return href;
  };
  const SANS = "'Nunito', 'Segoe UI', Arial, sans-serif";

  return (
    <section data-variant="eshop-03-banner" style={{ background: "#fff", fontFamily: SANS }}>
      <style>{`
        .es03-banner { max-width: 1280px; margin: 0 auto; padding: clamp(10px,1.5vw,20px) 20px; }
        .es03-banner-frame { position: relative; overflow: hidden; height: clamp(240px, 26vw, 340px); background: #f6f6f6; }
        .es03-banner-frame img { width: 100%; height: 100%; object-fit: cover; display: block; }
        .es03-banner-shade { position: absolute; inset: 0; background: linear-gradient(90deg, rgba(255,255,255,0.94) 0%, rgba(255,255,255,0.8) 36%, rgba(255,255,255,0) 64%); }
        .es03-banner-panel { position: absolute; inset: 0; display: flex; flex-direction: column; justify-content: center; padding: clamp(22px, 4vw, 56px); max-width: 560px; }
        .es03-banner-cta { display: inline-flex; align-items: center; gap: 8px; height: 48px; padding: 0 24px; background: #FFC500; color: #000; text-decoration: none; font-size: 14px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.04em; transition: background 0.2s; align-self: flex-start; }
        .es03-banner-cta:hover { background: #e6b200; }
        @media (max-width: 720px) {
          .es03-banner-shade { background: linear-gradient(180deg, rgba(255,255,255,0.94) 0%, rgba(255,255,255,0.7) 100%); }
        }
      `}</style>
      <div className="es03-banner">
        <div className="es03-banner-frame">
          <GenericEditableImage sectionId={sectionId} field="image" src={String(c.image ?? "")} alt={String(c.imageAlt ?? c.heading ?? "")} className="h-full w-full">
            {c.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={String(c.image)} alt={String(c.imageAlt ?? c.heading ?? "")} loading="lazy" />
            ) : (
              <div style={{ width: "100%", height: "100%", background: "#f6f6f6" }} />
            )}
          </GenericEditableImage>
          <div className="es03-banner-shade" />
          <div className="es03-banner-panel">
            {c.badge && (
              <span style={{ display: "inline-flex", alignSelf: "flex-start", padding: "4px 11px", marginBottom: 12, background: "#000", color: "#fff", fontSize: 12, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                <GenericEditableText sectionId={sectionId} field="badge" value={String(c.badge)} tag="span" />
              </span>
            )}
            <GenericEditableText
              sectionId={sectionId} field="heading" value={String(c.heading ?? "")} tag="h2"
              style={{ fontSize: "clamp(24px, 2.8vw, 36px)", fontWeight: 900, color: "#000", lineHeight: 1.12, letterSpacing: "-0.01em", margin: 0 }}
            />
            {c.text && (
              <GenericEditableText
                sectionId={sectionId} field="text" value={String(c.text)} tag="p"
                style={{ fontSize: "clamp(13.5px, 1.3vw, 16px)", color: "#1f1f1f", lineHeight: 1.55, margin: "10px 0 0", maxWidth: 420 }}
              />
            )}
            {(c.ctaText ?? "") !== "" && (
              <div style={{ marginTop: 20 }}>
                <a href={resolve(String(c.ctaHref ?? "/obchod"))} className="es03-banner-cta">
                  <GenericEditableText sectionId={sectionId} field="ctaText" value={String(c.ctaText)} tag="span" />
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

// ── eshop-04-banner ─────────────────────────────────────────────────────────────
// Shoptet Samba extended banner 1:1: full-bleed foto s bílým caption panelem
// ukotveným vlevo dole (zaoblené horní rohy, titulek až 40 px/700, text,
// periwinkle link „Přejít do nabídky" se šipkou). Celý banner proklikávací.
// ──────────────────────────────────────────────────────────────────────────────
function BannerEshop04({ content, sectionId, tenantSlug, isAdmin }: {
  content: Record<string, unknown>;
  sectionId: number;
  tenantSlug?: string;
  isAdmin: boolean;
}) {
  const c = content as { image?: string; imageAlt?: string; heading?: string; text?: string; ctaText?: string; ctaHref?: string; siteMode?: string; badge?: string; };
  const siteMode = String(c.siteMode ?? "multipage");
  const base = tenantSlug ? `/demo/${tenantSlug}${isAdmin ? "/admin" : ""}` : "";
  const resolve = (href: string) => {
    if (siteMode === "onepage") {
      if (href.startsWith("/") && href !== "/") return `${base}#${href.slice(1)}`;
      if (href.startsWith("#")) return `${base}${href}`;
      return href;
    }
    if (href.startsWith("#")) return `${base}/${href.slice(1)}`;
    if (href.startsWith("/")) return `${base}${href}`;
    return href;
  };
  const SANS = "'Raleway', 'Segoe UI', Arial, sans-serif";

  return (
    <section data-variant="eshop-04-banner" style={{ background: "#fff", fontFamily: SANS }}>
      <style>{`
        .es04b-frame { position: relative; overflow: hidden; width: 100%; height: clamp(280px, 32vw, 460px); background: #f9f9f9; }
        .es04b-frame img { width: 100%; height: 100%; object-fit: cover; display: block; }
        .es04b-caption {
          position: absolute; left: clamp(24px, 4.5vw, 64px); bottom: 0;
          max-width: min(520px, calc(100% - 48px)); max-height: 90%;
          background: #fff; border-radius: 8px 8px 0 0;
          padding: clamp(22px, 2.8vw, 40px);
          display: flex; flex-flow: column; justify-content: center; align-items: flex-start;
        }
        .es04b-link { display: inline-flex; align-items: center; font-size: 14px; font-weight: 600; color: #6883ba; transition: color 0.3s; }
        .es04b-frame a:hover .es04b-link { color: #7999d9; }
        @media (max-width: 720px) { .es04b-caption { left: 16px; max-width: calc(100% - 32px); } }
      `}</style>
      <div className="es04b-frame">
        <a href={isAdmin ? undefined : resolve(String(c.ctaHref ?? "/obchod"))} style={{ display: "block", height: "100%", textDecoration: "none" }}>
          {c.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={String(c.image)} alt={String(c.imageAlt ?? c.heading ?? "")} loading="lazy" />
          ) : (
            <div style={{ width: "100%", height: "100%", background: "#f9f9f9" }} />
          )}
          <span className="es04b-caption">
            {c.badge ? (
              <GenericEditableText
                sectionId={sectionId} field="badge" value={String(c.badge)} tag="span"
                style={{ display: "inline-block", alignSelf: "flex-start", padding: "5px 12px", marginBottom: 12, borderRadius: 999, background: "#161616", color: "#fff", fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}
              />
            ) : null}
            <GenericEditableText
              sectionId={sectionId} field="heading" value={String(c.heading ?? "")} tag="span"
              style={{ display: "block", fontSize: "clamp(24px, 2.6vw, 40px)", fontWeight: 700, color: "#161616", lineHeight: 1.18, marginBottom: 12 }}
            />
            {c.text && (
              <GenericEditableText
                sectionId={sectionId} field="text" value={String(c.text)} tag="span"
                style={{ display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden", fontSize: "clamp(14px, 1.2vw, 16px)", color: "#161616", lineHeight: 1.5, letterSpacing: "0.8px", marginBottom: 24 }}
              />
            )}
            <span className="es04b-link">
              <GenericEditableText sectionId={sectionId} field="ctaText" value={String(c.ctaText ?? "Přejít do nabídky")} tag="span" />
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" style={{ marginLeft: "1em" }}><path d="M5 12h14M13 6l6 6-6 6"/></svg>
            </span>
          </span>
        </a>
      </div>
    </section>
  );
}

// ──────────────────────────────────────────────────────────────────────────────


/* ═══════════════════════════════════════════════════════════
 * eshop-05 "Hračkolandia" — CTA sections (club + newsletter)
 * Pompo DNA: navy club box with mascot + white button; white newsletter
 * ═══════════════════════════════════════════════════════════ */

/* ─── CLUB BOX — navy rounded box: mascot left, text + WHITE button right ─── */
function CtaEshop05Club({ content, sectionId, tenantSlug, isAdmin }: { content: Record<string, unknown>; sectionId: number; tenantSlug?: string; isAdmin: boolean }) {
  const c = content as { heading?: string; subheading?: string; text?: string; ctaText?: string; ctaHref?: string; siteMode?: string };
  const NAVY = "#0e1b2c";
  const RED = "#ff3b5c";
  const YELLOW = "#ffc233";
  const SANS = "'Nunito Sans','Segoe UI',Arial,sans-serif";
  const resolve = (href: string) => resolveNavHref(href, String(c.siteMode ?? "multipage"), tenantSlug, isAdmin);

  return (
    <section data-variant="eshop-05-club" style={{ fontFamily: SANS, background: "#fff", padding: "24px 0 40px" }}>
      <style>{`
        .es05-club-box { position: relative; display: grid; grid-template-columns: 1fr 1.3fr; align-items: center; gap: 40px; padding: 52px 60px; border-radius: 14px; background: linear-gradient(120deg, #123157 0%, ${NAVY} 100%); overflow: hidden; }
        .es05-club-o { position: absolute; left: 16%; top: -40%; width: 380px; height: 380px; border-radius: 50%; border: 60px solid rgba(28,145,255,0.18); }
        .es05-club-btn { display: inline-flex; align-items: center; justify-content: center; height: 54px; padding: 0 34px; background: #fff; color: ${NAVY}; border-radius: 6px; font-size: 15px; font-weight: 800; text-decoration: none; transition: background 0.18s, transform 0.15s; }
        .es05-club-btn:hover { background: ${YELLOW}; transform: translateY(-2px); }
        @media (max-width: 900px) { .es05-club-box { grid-template-columns: 1fr; padding: 40px 30px; text-align: center; } .es05-club-mark { justify-content: center; } }
      `}</style>
      <div style={{ maxWidth: 1580, margin: "0 auto", padding: "0 14px" }}>
        <div className="es05-club-box">
          <span className="es05-club-o" aria-hidden />
          {/* Mascot / klub mark */}
          <div className="es05-club-mark" style={{ position: "relative", zIndex: 1, display: "flex", alignItems: "center", gap: 22 }}>
            <span style={{
              width: 110, height: 110, borderRadius: 32, flexShrink: 0, transform: "rotate(-5deg)",
              background: `linear-gradient(135deg, ${RED} 0%, #ff6b4a 100%)`,
              display: "inline-flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 14px 34px rgba(255,59,92,0.4)",
            }}>
              <svg width="60" height="60" viewBox="0 0 24 24" fill="none">
                <path d="M12 2.5l2.4 4.9 5.4.8-3.9 3.8.9 5.4-4.8-2.5-4.8 2.5.9-5.4L4.2 8.2l5.4-.8L12 2.5z" fill="#fff"/>
              </svg>
            </span>
            <span style={{ display: "flex", flexDirection: "column", lineHeight: 1 }}>
              <span style={{ fontSize: 30, fontWeight: 1000 as unknown as number, color: "#fff", letterSpacing: "-0.02em" }}>Hračkolandia</span>
              <span style={{ fontSize: 16, fontWeight: 800, color: YELLOW, letterSpacing: "0.28em", textTransform: "uppercase", marginTop: 6 }}>klub</span>
            </span>
          </div>
          {/* Text + CTA */}
          <div style={{ position: "relative", zIndex: 1 }}>
            <h2 style={{ fontSize: "clamp(22px, 2vw, 30px)", fontWeight: 900, color: "#fff", lineHeight: 1.2, margin: "0 0 16px" }}>
              <GenericEditableText sectionId={sectionId} field="heading" value={c.heading ?? "Máte rádi výhody?"} tag="span" style={{ display: "block" }} />
              <GenericEditableText sectionId={sectionId} field="subheading" value={c.subheading ?? "Staňte se členy našeho klubu!"} tag="span" style={{ display: "block" }} />
            </h2>
            <GenericEditableText sectionId={sectionId} field="text" value={c.text ?? ""} tag="p" style={{ fontSize: 15, fontWeight: 600, color: "rgba(255,255,255,0.82)", lineHeight: 1.6, margin: "0 0 26px", maxWidth: 560 }} />
            {c.ctaText && <a href={resolve(c.ctaHref ?? "/o-nas")} className="es05-club-btn">{c.ctaText}</a>}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── NEWSLETTER — white bg: heading + text left, input + red square button right ─── */
function CtaEshop05Newsletter({ content, sectionId, tenantSlug, isAdmin }: { content: Record<string, unknown>; sectionId: number; tenantSlug?: string; isAdmin: boolean }) {
  const c = content as { heading?: string; text?: string; linkText?: string; linkHref?: string; placeholder?: string; consent?: string; siteMode?: string };
  const RED = "#ff3b5c";
  const NAVY = "#0e1b2c";
  const MUTED = "#64748b";
  const SURFACE = "#f2f4f7";
  const BORDER = "#e7eaee";
  const SANS = "'Nunito Sans','Segoe UI',Arial,sans-serif";
  const [email, setEmail] = useState("");
  const resolve = (href: string) => resolveNavHref(href, String(c.siteMode ?? "multipage"), tenantSlug, isAdmin);

  return (
    <section data-variant="eshop-05-newsletter" style={{ fontFamily: SANS, background: "#fff", borderBottom: `1px solid ${BORDER}` }}>
      <style>{`
        .es05-nl-wrap { display: grid; grid-template-columns: 1.2fr 1fr; align-items: center; gap: 48px; padding: 52px 0; }
        .es05-nl-input { height: 60px; flex: 1; min-width: 0; border: none; border-radius: 6px 0 0 6px; background: ${SURFACE}; color: ${NAVY}; padding: 0 22px; font-size: 15px; font-weight: 600; font-family: inherit; }
        .es05-nl-input::placeholder { color: ${MUTED}; }
        .es05-nl-input:focus { outline: 2px solid ${RED}; outline-offset: -2px; }
        .es05-nl-btn { width: 64px; height: 60px; flex-shrink: 0; border: none; border-radius: 0 6px 6px 0; background: ${RED}; color: #fff; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: background 0.2s; }
        .es05-nl-btn:hover { background: #e62b4c; }
        .es05-nl-link { color: ${NAVY}; font-size: 13.5px; font-weight: 700; text-decoration: underline; text-underline-offset: 3px; }
        .es05-nl-link:hover { color: ${RED}; }
        @media (max-width: 900px) { .es05-nl-wrap { grid-template-columns: 1fr; gap: 24px; padding: 40px 0; } }
      `}</style>
      <div style={{ maxWidth: 1580, margin: "0 auto", padding: "0 14px" }}>
        <div className="es05-nl-wrap">
          <div>
            <GenericEditableText sectionId={sectionId} field="heading" value={c.heading ?? "Ať vám nic neunikne"} tag="h2" style={{ fontSize: 28, fontWeight: 900, color: NAVY, lineHeight: 1.15, margin: "0 0 12px", letterSpacing: "-0.02em" }} />
            <GenericEditableText sectionId={sectionId} field="text" value={c.text ?? ""} tag="p" style={{ fontSize: 15, fontWeight: 600, color: MUTED, lineHeight: 1.6, margin: "0 0 12px", maxWidth: 620 }} />
            {c.linkText && <a href={resolve(c.linkHref ?? "/o-nas")} className="es05-nl-link">{c.linkText}</a>}
          </div>
          <div>
            <div style={{ display: "flex" }}>
              <input className="es05-nl-input" type="email" placeholder={c.placeholder ?? "Vaše e-mailová adresa"} value={email} onChange={(e) => setEmail(e.target.value)} />
              <button className="es05-nl-btn" type="button" aria-label="Přihlásit se k odběru">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round"><rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></svg>
              </button>
            </div>
            {c.consent && <div style={{ fontSize: 11.5, fontWeight: 600, color: MUTED, marginTop: 10, lineHeight: 1.4 }}>{c.consent}</div>}
          </div>
        </div>
      </div>
    </section>
  );
}

// ── eshop-08-newsletter — zelený newsletter bar ─────────────────────────────
function CtaEshop08Newsletter({ content }: { content: Record<string, unknown>; sectionId: number; tenantSlug?: string; isAdmin: boolean }) {
  const SANS = "'Inter', 'Segoe UI', Arial, sans-serif";
  const GREEN = "#5a8a2d";
  const GREEN_DARK = "#4a7523";
  const c = content as Record<string, unknown>;
  const heading = String(c.heading ?? "");
  const text = String(c.text ?? "");
  const placeholder = String(c.placeholder ?? "Váš e-mail *");
  const buttonText = String(c.buttonText ?? "Odeslat");
  return (
    <section data-variant="eshop-08-newsletter" style={{ fontFamily: SANS, background: GREEN, padding: "28px 0" }}>
      <style>{`
        .es08-nl-btn { transition: background 0.18s; }
        .es08-nl-btn:hover { background: ${GREEN_DARK} !important; }
      `}</style>
      <div style={{ maxWidth: 1320, margin: "0 auto", padding: "0 24px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 20 }}>
        <div>
          {heading && <span style={{ display: "block", fontSize: 20, fontWeight: 800, color: "#fff" }}>{heading}</span>}
          {text && <span style={{ display: "block", fontSize: 14, fontWeight: 500, color: "rgba(255,255,255,0.85)", marginTop: 4 }}>{text}</span>}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 0, flex: 1, maxWidth: 440 }}>
          <input type="email" placeholder={placeholder} style={{
            flex: 1, height: 46, border: "none", borderRadius: "4px 0 0 4px", padding: "0 16px",
            fontSize: 14, fontWeight: 500, background: "#fff", color: "#1a1a1a", fontFamily: SANS, outline: "none",
          }} />
          <button className="es08-nl-btn" style={{
            height: 46, padding: "0 24px", border: "none", borderRadius: "0 4px 4px 0",
            background: "#1a1a1a", color: "#fff", fontFamily: SANS, fontSize: 13, fontWeight: 800,
            textTransform: "uppercase", letterSpacing: "0.04em", cursor: "pointer",
          }}>{buttonText}</button>
        </div>
      </div>
    </section>
  );
}

// ── eshop-08-studio ─────────────────────────────────────────────────────────
// Domea (bonami.cz DNA): "Domea Home Studio" — světlý box s textem, CTA
// a fotkou vpravo.
// ─────────────────────────────────────────────────────────────────────────────
function CtaEshop08Studio({ content, tenantSlug, isAdmin }: { content: Record<string, unknown>; sectionId: number; tenantSlug?: string; isAdmin: boolean }) {
  const SANS = "'DM Sans', 'Segoe UI', Arial, sans-serif";
  const INK = "#2b2b2b";
  const GREEN = "#3d9a50";
  const GREEN_DARK = "#2f7d3f";

  const siteMode = String(content.siteMode ?? "multipage");
  const resolve = (href: string) => resolveNavHref(href, siteMode, tenantSlug, isAdmin);
  const c = content as Record<string, unknown>;
  const title = String(c.title ?? "");
  const text = String(c.text ?? "");
  const ctaText = String(c.ctaText ?? "");
  const ctaHref = String(c.ctaHref ?? "/kontakt");
  const image = String(c.image ?? "");

  return (
    <section data-variant="eshop-08-studio" style={{ fontFamily: SANS, background: "#fff", padding: "26px 0 8px" }}>
      <style>{`
        .es08st-box { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1.1fr); border-radius: 16px; overflow: hidden; background: #f4f4f2; }
        @media (max-width: 860px) { .es08st-box { grid-template-columns: 1fr; } }
        .es08st-cta { transition: background 0.16s, transform 0.16s; }
        .es08st-cta:hover { background: ${GREEN_DARK} !important; transform: translateY(-1px); }
      `}</style>
      <div style={{ maxWidth: 1360, margin: "0 auto", padding: "0 24px" }}>
        <div className="es08st-box">
          <div style={{ padding: "clamp(28px, 4vw, 48px)", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "flex-start" }}>
            <h2 style={{ margin: 0, fontSize: "clamp(22px, 2.6vw, 32px)", fontWeight: 800, letterSpacing: "-0.02em", color: INK }}>{title}</h2>
            {text && <p style={{ margin: "12px 0 0", fontSize: 14.5, fontWeight: 500, lineHeight: 1.6, color: "#5c5c58", maxWidth: 460 }}>{text}</p>}
            {ctaText && (
              <a href={resolve(ctaHref)} className="es08st-cta" style={{
                display: "inline-flex", alignItems: "center", gap: 9, marginTop: 22, height: 46, padding: "0 24px",
                borderRadius: 23, background: GREEN, color: "#fff", textDecoration: "none",
                fontSize: 13.5, fontWeight: 800, letterSpacing: "0.04em",
              }}>
                {ctaText}
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
              </a>
            )}
          </div>
          {image && (
            <div style={{ minHeight: 260, position: "relative" }}>
              <img src={image} alt="" loading="lazy" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

// ── eshop-15-newsletter ─────────────────────────────────────────────────────────
// Apatyka newsletter pás — pilulka DNA 1:1. Střední zelená #166154 full-width,
// vlevo růžový display nadpis (2 řádky), uprostřed bílá pill s mail ikonou,
// placeholderem a světle zeleným pill tlačítkem Odebírat, vpravo tečkovaná
// spirálová dekorace (SVG). Fake submit → success stav.
// ──────────────────────────────────────────────────────────────────────────────
function NewsletterEshop15({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const BAR = "#166154";
  const GREEN = "#064740";
  const PINK = "#f9a8d4";
  const LIME_SOFT = "#c6f9ae";
  const SYS = "-apple-system, 'system-ui', 'Segoe UI', Roboto, Arial, sans-serif";
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);

  const heading = String(content.heading ?? "");
  const placeholder = String(content.placeholder ?? "Zadejte váš e-mail");
  const buttonText = String(content.buttonText ?? "Odebírat");
  const successText = String(content.successText ?? "Děkujeme! Potvrzení najdete ve schránce.");

  if (!heading) return null;

  const dots: Array<[string, string, string]> = [];
  for (let ring = 1; ring <= 7; ring++) {
    const n = 6 + ring * 5;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 + ring * 0.5;
      dots.push([
        (130 + Math.cos(a) * ring * 17).toFixed(1),
        (130 + Math.sin(a) * ring * 17).toFixed(1),
        Math.max(0.8, 2.6 - ring * 0.22).toFixed(2),
      ]);
    }
  }

  return (
    <section data-variant="eshop-15-newsletter" style={{ fontFamily: SYS, background: BAR, overflow: "hidden", position: "relative" }}>
      <style>{`
        .es15nl-inner { max-width: 1420px; margin: 0 auto; padding: 58px 28px; display: flex; align-items: center; gap: 54px; flex-wrap: wrap; position: relative; }
        .es15nl-form { flex: 1 1 420px; max-width: 560px; display: flex; align-items: center; gap: 12px; height: 62px;
          background: #fff; border-radius: 999px; padding: 0 8px 0 22px; }
        .es15nl-form input { flex: 1; min-width: 0; border: none; outline: none; font-size: 15.5px; color: #1c1c1c; font-family: ${SYS}; background: none; }
        .es15nl-form input::placeholder { color: #4a5a55; }
        .es15nl-btn { flex-shrink: 0; height: 46px; padding: 0 30px; border: none; border-radius: 999px; background: ${LIME_SOFT}; color: ${GREEN};
          font-size: 15px; font-weight: 700; cursor: pointer; font-family: ${SYS}; transition: filter 0.15s, transform 0.13s; }
        .es15nl-btn:hover { filter: brightness(0.95); transform: translateY(-1px); }
        @media (prefers-reduced-motion: reduce) { .es15nl-btn { transition: none; } }
      `}</style>
      <svg aria-hidden width="260" height="260" viewBox="0 0 260 260" style={{ position: "absolute", right: 40, top: "50%", transform: "translateY(-50%)", opacity: 0.55 }}>
        {dots.map(([x, y, r], i) => <circle key={i} cx={x} cy={y} r={r} fill="#2e8b72" />)}
      </svg>
      <div className="es15nl-inner">
        <GenericEditableText sectionId={sectionId} field="heading" value={heading} tag="h2" style={{
          margin: 0, flex: "1 1 340px", maxWidth: 480, fontFamily: SYS, fontSize: "clamp(28px, 2.9vw, 40px)",
          fontWeight: 800, letterSpacing: "-0.01em", lineHeight: 1.15, color: PINK,
        }} />
        {done ? (
          <div style={{ flex: "1 1 420px", maxWidth: 560, display: "flex", alignItems: "center", gap: 12, color: "#fff", fontSize: 16.5, fontWeight: 600 }}>
            <span style={{ width: 26, height: 26, borderRadius: 999, background: LIME_SOFT, color: GREEN, display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
            </span>
            {successText}
          </div>
        ) : (
          <form className="es15nl-form" onSubmit={(e) => { e.preventDefault(); if (email.trim()) setDone(true); }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4a5a55" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><rect x="3" y="5.5" width="18" height="13" rx="2"/><path d="m3.5 7 8.5 6 8.5-6"/></svg>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder={placeholder} aria-label={placeholder} />
            <button type="submit" className="es15nl-btn">{buttonText}</button>
          </form>
        )}
      </div>
    </section>
  );
}

// ── eshop-17-newsletter ─────────────────────────────────────────────────────────
// Rozkvět (florea.cz DNA): krémový newsletter pás — bordó headline uprostřed,
// obálková ikona se zlatým kvítkem, pill e-mail input + zelené pill tlačítko
// Přihlásit se, consent řádek s bordó odkazem. Po odeslání zelené poděkování.
// content: heading / placeholder / buttonText / consentText / consentLink / successText.
// ──────────────────────────────────────────────────────────────────────────────
function NewsletterEshop17({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const HEAD = "'Fraunces', Georgia, serif";
  const SANS = "'Instrument Sans', 'Segoe UI', system-ui, sans-serif";
  const BORDO = "#8f1d3d";
  const GOLD = "#c9a24b";
  const GREEN = "#3c7d46";
  const GREEN_DK = "#2f6238";
  const INK = "#241a1d";
  const MUTED = "#7d6d72";
  const CREAM = "#f7f1e8";
  const LINE = "#eadfd6";

  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);

  const heading = String(content.heading ?? "");
  const placeholder = String(content.placeholder ?? "Zadejte e-mail");
  const buttonText = String(content.buttonText ?? "Přihlásit se");
  const consentText = String(content.consentText ?? "Přihlášením souhlasíte se");
  const consentLink = String(content.consentLink ?? "zpracováním osobních údajů");
  const successText = String(content.successText ?? "Děkujeme! První kytice inspirace dorazí brzy.");

  if (!heading) return null;

  return (
    <section data-variant="eshop-17-newsletter" style={{ fontFamily: SANS, background: CREAM, borderTop: `1px solid ${LINE}`, padding: "34px 0 36px" }}>
      <style>{`
        .es17n-input { flex: 1; min-width: 0; height: 50px; border: 1.5px solid ${LINE}; border-radius: 999px; background: #fff;
          padding: 0 22px; font-size: 15px; color: ${INK}; font-family: ${SANS}; outline: none; transition: border-color 0.16s, box-shadow 0.16s; }
        .es17n-input::placeholder { color: #a89aa0; }
        .es17n-input:focus { border-color: ${BORDO}; box-shadow: 0 0 0 4px rgba(143,29,61,0.09); }
        .es17n-btn { height: 50px; padding: 0 26px; border: none; border-radius: 999px; background: ${GREEN}; color: #fff;
          font-family: ${SANS}; font-size: 14.5px; font-weight: 700; cursor: pointer; white-space: nowrap;
          transition: background 0.16s, transform 0.14s; }
        .es17n-btn:hover { background: ${GREEN_DK}; transform: translateY(-1px); }
        .es17n-consent a { color: ${BORDO}; }
      `}</style>
      <div style={{ maxWidth: 760, margin: "0 auto", padding: "0 28px", textAlign: "center" }}>
        <GenericEditableText sectionId={sectionId} field="heading" value={heading} tag="h2" style={{
          fontFamily: HEAD, fontWeight: 600, fontSize: "clamp(17px, 1.6vw, 21px)", lineHeight: 1.4, letterSpacing: "-0.005em", color: BORDO, margin: "0 0 18px",
        }} />
        {done ? (
          <p style={{ display: "inline-flex", alignItems: "center", gap: 9, margin: 0, fontSize: 15, fontWeight: 700, color: GREEN_DK }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
            {successText}
          </p>
        ) : (
          <form
            onSubmit={(e) => { e.preventDefault(); if (email.trim()) setDone(true); }}
            style={{ display: "flex", alignItems: "center", gap: 10, maxWidth: 560, margin: "0 auto" }}
          >
            <span aria-hidden style={{ flexShrink: 0, color: BORDO, display: "inline-flex" }}>
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2.5" y="5" width="19" height="14" rx="2.5"/><path d="m3.5 6.5 8.5 6.5 8.5-6.5"/></svg>
            </span>
            <input
              className="es17n-input" type="email" required value={email}
              onChange={(e) => setEmail(e.target.value)} placeholder={placeholder} aria-label={placeholder}
            />
            <button className="es17n-btn" type="submit">{buttonText}</button>
          </form>
        )}
        {!done && (
          <p className="es17n-consent" style={{ margin: "12px 0 0", fontSize: 12.5, color: MUTED }}>
            {consentText} <a href="#" onClick={(e) => e.preventDefault()}>{consentLink}</a>.
          </p>
        )}
      </div>
    </section>
  );
}

// ── eshop-20-newsletter ─────────────────────────────────────────────────────────
// Vykuk (dedoles.cz DNA „Získej 15% slevu"): limetkový full-width pás — velký
// maskot vykukuje zleva zpoza spodního okraje, centrovaný Baloo uppercase nadpis
// + text, bílá pill e-mail input, dvě outline pill volby ŽENA / MUŽ (fake submit
// → success stav se zeleným checkem), GDPR poznámka. Kakaový text na limetce.
// ──────────────────────────────────────────────────────────────────────────────
function NewsletterEshop20({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const HEAD = "'Baloo 2', 'Arial Rounded MT Bold', sans-serif";
  const SANS = "'Figtree', 'Segoe UI', system-ui, sans-serif";
  const COCOA = "#4b2413";
  const LIME = "#d6e84a";
  const GREEN = "#2f9e44";
  const PINK = "#f6a7d7";

  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);

  const heading = String(content.heading ?? "Získej 15% slevu");
  const text = String(content.text ?? "");
  const placeholder = String(content.placeholder ?? "tvůj e-mail…");
  const optionA = String(content.optionA ?? "Žena");
  const optionB = String(content.optionB ?? "Muž");
  const successText = String(content.successText ?? "Hotovo! Sleva 15 % ti letí do e-mailu.");
  const disclaimer = String(content.disclaimer ?? "");

  const submit = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!email.includes("@")) return;
    setDone(true);
  };

  return (
    <section data-variant="eshop-20-newsletter" style={{ fontFamily: SANS, background: LIME, position: "relative", overflow: "hidden" }}>
      <style>{`
        @keyframes es20nPeek { 0%, 100% { transform: translateY(16%) rotate(-8deg); } 50% { transform: translateY(6%) rotate(-8deg); } }
        .es20n-mascot { animation: es20nPeek 6s ease-in-out infinite; }
        .es20n-input { width: 100%; height: 52px; border: none; border-radius: 999px; padding: 0 24px; font-size: 15px; font-weight: 500; font-family: ${SANS};
          color: ${COCOA}; background: #fff; outline: none; box-shadow: 0 4px 14px rgba(56,25,12,0.12); transition: box-shadow 0.16s; }
        .es20n-input::placeholder { color: #b3a190; }
        .es20n-input:focus { box-shadow: 0 4px 14px rgba(56,25,12,0.12), 0 0 0 4px rgba(75,36,19,0.22); }
        .es20n-pill { flex: 1; height: 50px; border: 2px solid ${COCOA}; border-radius: 999px; background: transparent; color: ${COCOA}; cursor: pointer;
          font-family: ${SANS}; font-size: 15px; font-weight: 800; transition: background 0.16s, color 0.16s, transform 0.14s; }
        .es20n-pill:hover { background: ${COCOA}; color: ${LIME}; transform: translateY(-2px); }
      `}</style>

      <div className="es20n-mascot hidden md:block" aria-hidden="true" style={{ position: "absolute", left: "6%", bottom: -26, opacity: 0.9 }}>
        <svg width="190" height="158" viewBox="0 0 36 30" style={{ display: "block" }} aria-hidden="true">
          <circle cx="9.5" cy="9" r="3.6" fill={COCOA} />
          <circle cx="26.5" cy="9" r="3.6" fill={COCOA} />
          <path d="M5.5 22a12.5 11.5 0 0 1 25 0Z" fill={COCOA} />
          <rect x="0" y="21" width="36" height="9" rx="4.5" fill={PINK} />
          <rect x="6.5" y="18.6" width="5" height="4.8" rx="2.4" fill={COCOA} />
          <rect x="24.5" y="18.6" width="5" height="4.8" rx="2.4" fill={COCOA} />
          <circle cx="13" cy="15.6" r="3.1" fill="#fff" />
          <circle cx="23" cy="15.6" r="3.1" fill="#fff" />
          <circle cx="13.7" cy="16.2" r="1.4" fill={COCOA} />
          <circle cx="22.3" cy="16.2" r="1.4" fill={COCOA} />
        </svg>
      </div>

      <div style={{ maxWidth: 620, margin: "0 auto", padding: "clamp(44px, 6vw, 76px) 20px", textAlign: "center", position: "relative" }}>
        <GenericEditableText sectionId={sectionId} field="heading" value={heading} tag="h2" style={{
          fontFamily: HEAD, fontWeight: 800, fontSize: "clamp(26px, 3vw, 40px)", letterSpacing: "0.02em",
          textTransform: "uppercase", color: COCOA, margin: 0, lineHeight: 1.1,
        }} />
        {text && (
          <GenericEditableText sectionId={sectionId} field="text" value={text} tag="p" style={{
            margin: "14px auto 0", fontSize: 15, fontWeight: 600, color: "rgba(60,32,16,0.8)", lineHeight: 1.55, maxWidth: 520,
          }} />
        )}

        {done ? (
          <div style={{ marginTop: 28, display: "inline-flex", alignItems: "center", gap: 10, background: "#fff", borderRadius: 999, padding: "15px 28px", boxShadow: "0 4px 14px rgba(56,25,12,0.12)" }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={GREEN} strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round"><path d="m4.5 12.5 5 5 10-11"/></svg>
            <span style={{ fontSize: 15, fontWeight: 700, color: COCOA }}>{successText}</span>
          </div>
        ) : (
          <div style={{ marginTop: 26 }}>
            <input
              className="es20n-input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={placeholder}
              aria-label="E-mail"
            />
            <div style={{ display: "flex", gap: 12, marginTop: 14 }}>
              <button className="es20n-pill" onClick={submit}>{optionA}</button>
              <button className="es20n-pill" onClick={submit}>{optionB}</button>
            </div>
          </div>
        )}

        {disclaimer && (
          <p style={{ margin: "18px auto 0", fontSize: 11.5, fontWeight: 500, color: "rgba(60,32,16,0.6)", lineHeight: 1.5, maxWidth: 480 }}>{disclaimer}</p>
        )}
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// rekonstrukce-01 — Byty & Jádra CTA poptávka
// - grafitový pás #1F1B17 s ambrovým top borderem #C2622B, Inter font
// - vlevo H2 + subtitle, vpravo ambrové CTA tlačítko + telefon s ikonou
// ─────────────────────────────────────────────────────────────────────────────
function CtaRekonstrukce01({ content, sectionId, tenantSlug, isAdmin }: Pick<Props, "content" | "sectionId" | "tenantSlug" | "isAdmin">) {
  const FONT  = "'Inter', sans-serif";
  const AMBER = "#C2622B";
  const DARK  = "#1F1B17";

  const title    = String(content.title    ?? "Plánujete rekonstrukci? Ozvěte se nám.");
  const subtitle = String(content.subtitle ?? "");
  const ctaText  = String(content.ctaText  ?? "Nezávazná poptávka");
  const ctaHref  = String(content.ctaHref  ?? "/kontakt");
  const phone    = String(content.phone    ?? "");
  const siteMode = String(content.siteMode ?? "multipage");

  const resolve = (href: string) => {
    if (!href || href.startsWith("http") || href.startsWith("tel:") || href.startsWith("mailto:")) return href;
    return resolveNavHref(href, siteMode, tenantSlug, isAdmin);
  };

  return (
    <>
      <style>{`
        .r01-cta { background: ${DARK}; border-top: 3px solid ${AMBER}; padding: clamp(56px, 8vw, 92px) 0; font-family: ${FONT}; }
        .r01-cta-inner { max-width: 1200px; margin: 0 auto; padding: 0 24px; display: flex; align-items: center; justify-content: space-between; gap: 40px; flex-wrap: wrap; }
        .r01-cta-h2 { color: #fff; font-size: clamp(24px, 3vw, 38px); font-weight: 800; letter-spacing: -0.02em; line-height: 1.15; margin: 0 0 12px; }
        .r01-cta-sub { color: rgba(255,255,255,0.62); font-size: 15.5px; line-height: 1.7; margin: 0; max-width: 540px; }
        .r01-cta-actions { display: flex; align-items: center; gap: 26px; flex-wrap: wrap; }
        .r01-cta-btn { display: inline-block; background: ${AMBER}; color: #fff; text-decoration: none; font-weight: 700; font-size: 15px; letter-spacing: 0.02em; padding: 16px 34px; border-radius: 8px; transition: filter 0.22s ease, transform 0.22s ease; }
        .r01-cta-btn:hover { filter: brightness(1.1); transform: translateY(-2px); }
        .r01-cta-phone { display: inline-flex; align-items: center; gap: 10px; color: #fff; text-decoration: none; font-weight: 700; font-size: 17px; }
        .r01-cta-phone svg { color: ${AMBER}; }
      `}</style>

      <section id="cta-poptavka" className="r01-cta" data-template="rekonstrukce-01">
        <div className="r01-cta-inner">
          <div style={{ flex: "1 1 400px" }}>
            <h2 className="r01-cta-h2">
              <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
            </h2>
            {subtitle.trim() && (
              <p className="r01-cta-sub">
                <GenericEditableText sectionId={sectionId} field="subtitle" value={subtitle} tag="span" />
              </p>
            )}
          </div>
          <div className="r01-cta-actions">
            <a href={resolve(ctaHref)} className="r01-cta-btn">
              <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
            </a>
            {phone.trim() && (
              <a href={`tel:${phone.replace(/\s/g, "")}`} className="r01-cta-phone">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                </svg>
                <GenericEditableText sectionId={sectionId} field="phone" value={phone} tag="span" />
              </a>
            )}
          </div>
        </div>
      </section>
    </>
  );
}

// ── hair-01-cta ───────────────────────────────────────────────────────────────
// V3 Ivory & Brass: úzký wash pás s hairline okraji — Libre Caslon title + CTA.
function CtaHair01({ content, sectionId, tenantSlug, isAdmin }: { content: Record<string, unknown>; sectionId: number; tenantSlug?: string; isAdmin?: boolean }) {
  const title = String(content.title ?? "Zobrazit všechny služby");
  const subtitle = String(content.subtitle ?? "");
  const ctaText = String(content.ctaText ?? "Zobrazit");
  const ctaHref = resolveDemoHref(String(content.ctaHref ?? "/sluzby"), tenantSlug, isAdmin);

  return (
    <section data-section-type="cta" data-variant="cta-hair-01" className="ha1c-section">
      <style>{`
        .ha1c-section {
          background: var(--color-bg, #F6F3EE);
          border-top: 1px solid var(--color-border, #E6DDD0);
          border-bottom: 1px solid var(--color-border, #E6DDD0);
          padding: clamp(2.4rem, 5vw, 3.6rem) 0;
          font-family: 'Hanken Grotesk', sans-serif;
        }
        .ha1c-inner {
          max-width: 78rem; margin: 0 auto; padding: 0 clamp(1.25rem, 4vw, 2.5rem);
          display: flex; align-items: center; justify-content: space-between;
          gap: clamp(1.5rem, 4vw, 3rem); flex-wrap: wrap;
        }
        .ha1c-title {
          font-family: 'Libre Caslon Display', serif; font-weight: 400;
          font-size: clamp(1.5rem, 2.6vw, 2.1rem); color: var(--color-text, #16110C);
          line-height: 1.15; margin: 0 0 0.5rem; text-wrap: balance;
        }
        .ha1c-sub { font-size: 0.95rem; color: var(--color-text-muted, #756A5D); line-height: 1.6; margin: 0; max-width: 36rem; }
        .ha1c-cta {
          display: inline-flex; align-items: center; gap: 0.55rem; flex-shrink: 0;
          padding: 0.95rem 2rem; border-radius: 2px;
          background: var(--color-primary, #A07C33); color: #fff;
          font-size: 0.88rem; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase;
          text-decoration: none; transition: background 0.25s, transform 0.25s;
        }
        .ha1c-cta:hover { background: var(--color-accent, #7D6026); transform: translateY(-2px); }
      `}</style>
      <div className="ha1c-inner">
        <div>
          <h2 className="ha1c-title" style={{ fontFamily: "'Libre Caslon Display', serif", color: "var(--color-text, #16110C)" }}>
            <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
          </h2>
          {subtitle && (
            <p className="ha1c-sub"><GenericEditableText sectionId={sectionId} field="subtitle" value={subtitle} tag="span" /></p>
          )}
        </div>
        <a href={ctaHref} data-btn="primary" className="ha1c-cta">
          <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden><path d="M5 12h14M13 6l6 6-6 6"/></svg>
        </a>
      </div>
    </section>
  );
}
