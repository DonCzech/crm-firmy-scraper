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
  const c = content as CtaContent & { body?: string; image?: string };

  if (variant === "elektro-01-cta-form") return <CtaElektro01 content={content} sectionId={sectionId} />;
  if (variant === "stavba-01-cta") return <CtaStavba01 content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;
  if (variant === "instala-01-cta") return <CtaInstala01 content={content} sectionId={sectionId} />;
  if (variant === "stavba-03-cta") return <CtaStavba03 content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;
  if (variant === "nails-01-cta")        return <CtaNails01 content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;
  if (variant === "clinic-02-cta")       return <CtaClinic02 content={content} sectionId={sectionId} />;
  if (variant === "fyzio-01-cta-booking") return <CtaFyzio01 content={content} sectionId={sectionId} />;
  if (variant === "fyzio-02-cta-booking") return <CtaFyzio02 content={content} sectionId={sectionId} />;
  if (variant === "restaurant-01-cta")    return <CtaRestaurant01 content={content} sectionId={sectionId} />;
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
    const MONO = "'Montserrat',sans-serif";
    const GOLD = "#8a6f28";
    const title = c.title ?? "Zobrazit všechny služby";
    const subtitle = c.subtitle ?? "";
    const ctaText = c.ctaText ?? "Zobrazit";
    const ctaHref = resolveDemoHref(c.ctaHref ?? "#sluzby", tenantSlug, isAdmin);
    return (
      <section
        data-template="hair-01"
        style={{ backgroundColor: "#f5f1f0", padding: "clamp(60px,8vw,100px) clamp(20px,5vw,60px)", textAlign: "center", fontFamily: MONO }}
      >
        <h2 style={{ color: "#1e1e1e", fontSize: "clamp(20px,2.5vw,34px)", fontWeight: 300, letterSpacing: "0.06em", marginBottom: subtitle ? 16 : 32 }}>
          <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
        </h2>
        {subtitle && (
          <p style={{ color: "#605f5f", fontSize: 14, fontWeight: 300, lineHeight: 1.75, maxWidth: 560, margin: "0 auto 32px" }}>
            <GenericEditableText sectionId={sectionId} field="subtitle" value={subtitle} tag="span" />
          </p>
        )}
        <a
          href={ctaHref}
          data-btn="inverse"
          style={{
            display: "inline-block",
            border: `1.5px solid ${GOLD}`,
            color: GOLD,
            backgroundColor: "transparent",
            fontFamily: MONO,
            fontSize: 10,
            fontWeight: 600,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            padding: "14px 36px",
            textDecoration: "none",
          }}
        >
          <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
        </a>
      </section>
    );
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
  if (href === "/") return `/demo/${tenantSlug}${isAdmin ? "/admin" : ""}`;
  return `/demo/${tenantSlug}${isAdmin ? "/admin" : ""}${href}`;
}

// nails-01: burgundy bg, centered H2 + cream CTA button — 1:1 soho-nails.cz section_16
function CtaNails01({ content, sectionId, tenantSlug, isAdmin }: { content: Record<string, unknown>; sectionId: number; tenantSlug?: string; isAdmin: boolean }) {
  const BURGUNDY = "#79142b";
  const CREAM    = "#f4f1e9";
  const SERIF    = "Georgia, 'Times New Roman', serif";
  const SANS     = "'Helvetica Neue', Arial, sans-serif";

  const title   = (content.title   as string) ?? "Rezervujte si svou návštěvu ještě dnes";
  const ctaText = (content.ctaText as string) ?? "Objednat se online";
  const ctaHref = (content.ctaHref as string) ?? "#kontakt";

  return (
    <section
      id="rezervace"
      data-template="nails-01"
      style={{
        backgroundColor: BURGUNDY,
        padding: "clamp(60px, 9vh, 100px) clamp(24px, 6vw, 80px)",
        textAlign: "center",
      }}
    >
      <h2 style={{
        fontFamily: SERIF,
        fontSize: "clamp(24px, 3vw, 42px)",
        fontWeight: 400,
        color: CREAM,
        margin: "0 0 clamp(28px, 4vh, 48px)",
        lineHeight: 1.25,
        maxWidth: 700,
        marginLeft: "auto",
        marginRight: "auto",
      }}>
        <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
      </h2>
      <a
        href={resolveDemoHref(ctaHref, tenantSlug, isAdmin)}
        data-btn="inverse"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          border: `1.5px solid ${CREAM}`,
          color: CREAM,
          backgroundColor: "transparent",
          fontFamily: SANS,
          fontSize: "0.9rem",
          fontWeight: 600,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          textDecoration: "none",
          padding: "14px 40px",
          borderRadius: 999,
          transition: "background 0.2s, color 0.2s",
        }}
        onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.backgroundColor = CREAM; (e.currentTarget as HTMLAnchorElement).style.color = BURGUNDY; }}
        onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.backgroundColor = "transparent"; (e.currentTarget as HTMLAnchorElement).style.color = CREAM; }}
      >
        <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
        <span style={{ fontSize: "0.85em" }}>↗</span>
      </a>
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
  const title          = String(content.title          ?? "Objednejte se ještě dnes");
  const body           = String(content.body           ?? "");
  const ctaText        = String(content.ctaText        ?? "Rezervační systém");
  const ctaHref        = String(content.ctaHref        ?? "#kontakt");
  const ctaSecondaryText = String(content.ctaSecondaryText ?? "Zavolat nám");
  const ctaSecondaryHref = String(content.ctaSecondaryHref ?? "tel:704123456");

  const NAVY  = "#1f2d69";
  const GREEN = "#10d15d";
  const WHITE = "#ffffff";
  const MONT  = "'Montserrat', sans-serif";
  const SANS  = "'Open Sans', sans-serif";

  return (
    <section id="rezervace" data-template="fyzio-01" style={{ backgroundColor: NAVY, padding: "96px 24px", fontFamily: SANS, textAlign: "center" }}>
      <div style={{ maxWidth: 700, margin: "0 auto" }}>
        <p style={{ fontFamily: MONT, fontSize: 12, fontWeight: 600, letterSpacing: "0.2em", textTransform: "uppercase", color: GREEN, marginBottom: 16 }}>
          <GenericEditableText sectionId={sectionId} field="tagline" value={tagline} tag="span" />
        </p>
        <h2 style={{ fontFamily: MONT, fontSize: "clamp(26px,3.5vw,42px)", fontWeight: 800, color: WHITE, marginBottom: 20, lineHeight: 1.2 }}>
          <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
        </h2>
        {body && (
          <p style={{ fontSize: 16, color: "rgba(255,255,255,0.75)", lineHeight: 1.8, marginBottom: 40 }}>
            <GenericEditableText sectionId={sectionId} field="body" value={body} tag="span" />
          </p>
        )}
        <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
          <a href={ctaHref} data-btn="primary" style={{ display: "inline-block", backgroundColor: GREEN, color: WHITE, fontFamily: MONT, fontSize: 15, fontWeight: 700, padding: "14px 36px", borderRadius: 4, textDecoration: "none", letterSpacing: "0.04em", transition: "opacity 0.2s" }}
            onMouseEnter={e => (e.currentTarget.style.opacity = "0.88")}
            onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
          >
            <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
          </a>
          {ctaSecondaryText && (
            <a href={ctaSecondaryHref} style={{ display: "inline-block", backgroundColor: "transparent", color: WHITE, border: `2px solid ${WHITE}`, fontFamily: MONT, fontSize: 15, fontWeight: 600, padding: "12px 34px", borderRadius: 4, textDecoration: "none", letterSpacing: "0.04em", transition: "background 0.2s, color 0.2s" }}
              onMouseEnter={e => { e.currentTarget.style.backgroundColor = WHITE; e.currentTarget.style.color = NAVY; }}
              onMouseLeave={e => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = WHITE; }}
            >
              <GenericEditableText sectionId={sectionId} field="ctaSecondaryText" value={ctaSecondaryText} tag="span" />
            </a>
          )}
        </div>
      </div>
    </section>
  );
}

// ── fyzio-02-cta-booking ──────────────────────────────────────────────────────
// Navy #1a2e4a bg, centrovaný DM Serif H2 bílý, zlaté CTA + stat badge
// ─────────────────────────────────────────────────────────────────────────────
function CtaFyzio02({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const title            = String(content.title            ?? "Chcete poznat, jak pracujeme?");
  const body             = String(content.body             ?? "Objednejte se na vstupní vyšetření a zjistěte, proč vaše tělo bolí.");
  const ctaText          = String(content.ctaText          ?? "Rezervovat terapii");
  const ctaHref          = String(content.ctaHref          ?? "#kontakt");
  const ctaSecondaryText = String(content.ctaSecondaryText ?? "Zavolat nám");
  const ctaSecondaryHref = String(content.ctaSecondaryHref ?? "tel:+420704123456");
  const statsCount       = String(content.statsCount       ?? "800+");
  const statsLabel       = String(content.statsLabel       ?? "spokojených klientů");
  const id               = String(content.id               ?? "rezervace");

  const NAVY  = "#1a2e4a";
  const GOLD  = "#c9a84c";
  const WHITE = "#ffffff";
  const SERIF = "'DM Serif Display', serif";
  const SANS  = "'Plus Jakarta Sans', sans-serif";

  return (
    <section
      id={id}
      data-template="fyzio-02"
      style={{ backgroundColor: NAVY, padding: "clamp(56px, 10vw, 96px) 24px", fontFamily: SANS, position: "relative", overflow: "hidden" }}
    >
      <div style={{ position: "absolute", right: "-80px", top: "-80px", width: 320, height: 320, borderRadius: "50%", border: "1px solid rgba(201,168,76,0.15)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", right: "-40px", top: "-40px", width: 200, height: 200, borderRadius: "50%", border: "1px solid rgba(201,168,76,0.1)", pointerEvents: "none" }} />

      <div style={{ maxWidth: 760, margin: "0 auto", textAlign: "center", position: "relative", zIndex: 1 }}>
        <div style={{ display: "inline-flex", alignItems: "baseline", gap: 8, marginBottom: 32, backgroundColor: "rgba(201,168,76,0.12)", borderRadius: 32, padding: "8px 20px" }}>
          <span style={{ fontFamily: SERIF, fontSize: "1.6rem", fontWeight: 400, color: GOLD }}>
            <GenericEditableText sectionId={sectionId} field="statsCount" value={statsCount} tag="span" />
          </span>
          <span style={{ fontFamily: SANS, fontSize: 13, fontWeight: 500, color: "rgba(255,255,255,0.7)" }}>
            <GenericEditableText sectionId={sectionId} field="statsLabel" value={statsLabel} tag="span" />
          </span>
        </div>

        <h2 style={{ fontFamily: SERIF, fontSize: "clamp(1.8rem, 3.5vw, 3rem)", fontWeight: 400, color: WHITE, marginBottom: 20, lineHeight: 1.2 }}>
          <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
        </h2>

        {body && (
          <p style={{ fontFamily: SANS, fontSize: "1rem", color: "rgba(255,255,255,0.7)", lineHeight: 1.8, marginBottom: 44, maxWidth: 560, margin: "0 auto 44px" }}>
            <GenericEditableText sectionId={sectionId} field="body" value={body} tag="span" />
          </p>
        )}

        <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
          <a
            href={ctaHref}
            data-btn="primary"
            style={{ display: "inline-block", backgroundColor: GOLD, color: WHITE, fontFamily: SANS, fontSize: "0.95rem", fontWeight: 600, padding: "0.9rem 2.2rem", borderRadius: 8, textDecoration: "none", transition: "background 0.15s" }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#b8943d")}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = GOLD)}
          >
            <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
          </a>
          {ctaSecondaryText && (
            <a
              href={ctaSecondaryHref}
              style={{ display: "inline-block", backgroundColor: "transparent", color: WHITE, border: "1.5px solid rgba(255,255,255,0.35)", fontFamily: SANS, fontSize: "0.95rem", fontWeight: 500, padding: "0.9rem 2.2rem", borderRadius: 8, textDecoration: "none", transition: "border-color 0.15s" }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = GOLD)}
              onMouseLeave={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.35)")}
            >
              <GenericEditableText sectionId={sectionId} field="ctaSecondaryText" value={ctaSecondaryText} tag="span" />
            </a>
          )}
        </div>
      </div>
    </section>
  );
}
// ── restaurant-01-cta ─────────────────────────────────────────────────────────
// Dark bg #0f0a07, fullbleed atmosferické foto s overlay
// Centrovaný cream serif H2 + podtitulek + červené filled CTA + outline CTA
// ─────────────────────────────────────────────────────────────────────────────
function CtaRestaurant01({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
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
  const tagline  = String(content.tagline ?? "Rezervujte si místo");
  const title    = String(content.title   ?? "Udělejte si večer\njedinečným.");
  const body     = String(content.body    ?? "");
  const ctaText  = String(content.ctaText ?? "Rezervovat stůl");
  const ctaHref  = String(content.ctaHref ?? "#kontakt");
  const ctaSecondaryText = String(content.ctaSecondaryText ?? "Prohlédnout menu");
  const ctaSecondaryHref = String(content.ctaSecondaryHref ?? "/menu");
  const PLACEHOLDER = "https://images.unsplash.com/photo-1550966871-3ed3cbe818b0?w=1920&h=1080&fit=crop&fm=webp&q=85";
  const image    = String(content.image   ?? PLACEHOLDER);

  const CREAM  = "#f5ede0";
  const AMBER  = "#c8943f";
  const RED    = "#c0392b";
  const FONT   = "Georgia, 'Times New Roman', serif";
  const SANS   = "'Helvetica Neue', Helvetica, Arial, sans-serif";

  return (
    <section ref={secRef} id={id} data-variant="restaurant-01-cta" style={{ position: "relative", overflow: "hidden", padding: "120px 0", fontFamily: SANS, backgroundColor: "#0f0a07" }}>
      {/* Bg foto */}
      <GenericEditableImage sectionId={sectionId} field="image" src={image || PLACEHOLDER} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
        <img
          src={image || PLACEHOLDER}
          alt=""
          aria-hidden
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center" }}
        />
      </GenericEditableImage>
      {/* Overlay */}
      <div style={{ position: "absolute", inset: 0, backgroundColor: "rgba(15,10,7,0.75)" }} />

      <div style={{ position: "relative", zIndex: 2, maxWidth: 700, margin: "0 auto", padding: "0 clamp(24px, 5vw, 64px)", textAlign: "center" }}>
        <div data-r01="0">
          <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.18em", textTransform: "uppercase", color: AMBER, margin: "0 0 16px" }}>
            <GenericEditableText sectionId={sectionId} field="tagline" value={tagline} tag="span" />
          </p>
          <div style={{ width: 40, height: 1.5, backgroundColor: AMBER, margin: "0 auto 28px" }} />
          <h2 style={{ fontFamily: FONT, fontSize: "clamp(30px, 4vw, 52px)", fontWeight: 400, lineHeight: 1.2, color: CREAM, margin: "0 0 20px", whiteSpace: "pre-line" }}>
            <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
          </h2>
          {body && (
            <p style={{ fontSize: 15, fontWeight: 300, lineHeight: 1.8, color: `${CREAM}bb`, margin: "0 0 40px" }}>
              <GenericEditableText sectionId={sectionId} field="body" value={body} tag="span" />
            </p>
          )}
          <div style={{ display: "flex", justifyContent: "center", flexWrap: "wrap", gap: 16 }}>
            <a href={ctaHref} data-btn="primary" style={{ fontFamily: SANS, fontSize: 12, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "#fff", textDecoration: "none", padding: "14px 36px", backgroundColor: RED, borderRadius: 3, display: "inline-block", transition: "background-color 0.2s" }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#a93226")}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = RED)}
            >
              <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
            </a>
            <a href={ctaSecondaryHref} style={{ fontFamily: SANS, fontSize: 12, fontWeight: 500, letterSpacing: "0.1em", textTransform: "uppercase", color: CREAM, textDecoration: "none", padding: "13px 36px", border: `1px solid ${CREAM}60`, borderRadius: 3, display: "inline-block", transition: "border-color 0.2s" }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = CREAM)}
              onMouseLeave={e => (e.currentTarget.style.borderColor = `${CREAM}60`)}
            >
              <GenericEditableText sectionId={sectionId} field="ctaSecondaryText" value={ctaSecondaryText} tag="span" />
            </a>
          </div>
        </div>
      </div>
      <style>{`[data-r01]{opacity:0;transform:translateY(36px);transition:opacity .72s cubic-bezier(.22,1,.36,1),transform .72s cubic-bezier(.22,1,.36,1)}[data-r01].r01-vis{opacity:1;transform:translateY(0)}`}</style>
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

  const id      = String(content.id      ?? "rezervace");
  const tagline = String(content.tagline ?? "Rezervujte si stůl");
  const title   = String(content.title   ?? "Udělejte si\nvelkolepost ze dne.");
  const body    = String(content.body    ?? "");
  const ctaText = String(content.ctaText ?? "Zarezervovat stůl");
  const ctaHref = String(content.ctaHref ?? "/rezervace");
  const ctaSecondaryText = String(content.ctaSecondaryText ?? "Prohlédnout menu");
  const ctaSecondaryHref = String(content.ctaSecondaryHref ?? "/menu");
  const PLACEHOLDER = "https://images.unsplash.com/photo-1550966871-3ed3cbe818b0?w=1920&h=1080&fit=crop&fm=webp&q=85";
  const image   = String(content.image   ?? PLACEHOLDER);

  const GOLD  = "#A89B67";
  const BURG  = "#6C1D45";
  const CREAM = "#f7f0e8";
  const FONT  = "Georgia, 'Times New Roman', serif";
  const SANS  = "'Helvetica Neue', Helvetica, Arial, sans-serif";

  return (
    <section ref={secRef} id={id} data-variant="cafe-02-cta" style={{ position: "relative", overflow: "hidden", padding: "120px 0", fontFamily: SANS, backgroundColor: "#1A0E0A" }}>
      <GenericEditableImage sectionId={sectionId} field="image" src={image || PLACEHOLDER} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
        <img loading="lazy" src={image || PLACEHOLDER} alt="" aria-hidden style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center" }} />
      </GenericEditableImage>
      <div style={{ position: "absolute", inset: 0, backgroundColor: "rgba(26,14,10,0.72)" }} />

      <div style={{ position: "relative", zIndex: 2, maxWidth: 700, margin: "0 auto", padding: "0 clamp(24px, 5vw, 64px)", textAlign: "center" }}>
        <div data-c02cta="0">
          <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.18em", textTransform: "uppercase", color: GOLD, margin: "0 0 14px" }}>
            <GenericEditableText sectionId={sectionId} field="tagline" value={tagline} tag="span" />
          </p>
          <div style={{ width: 40, height: 1.5, backgroundColor: GOLD, margin: "0 auto 28px" }} />
          <h2 style={{ fontFamily: FONT, fontSize: "clamp(30px, 4vw, 52px)", fontWeight: 400, lineHeight: 1.2, color: CREAM, margin: "0 0 20px", whiteSpace: "pre-line" }}>
            <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
          </h2>
          {body && (
            <p style={{ fontSize: 15, fontWeight: 400, lineHeight: 1.8, color: `${CREAM}bb`, margin: "0 0 40px" }}>
              <GenericEditableText sectionId={sectionId} field="body" value={body} tag="span" />
            </p>
          )}
          <div style={{ display: "flex", justifyContent: "center", flexWrap: "wrap", gap: 16 }}>
            <a href={ctaHref} data-btn="primary"
              style={{ fontFamily: SANS, fontSize: 12, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "#fff", textDecoration: "none", padding: "14px 36px", backgroundColor: BURG, borderRadius: 2, display: "inline-block", transition: "background-color 0.2s" }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#541636")}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = BURG)}
            >
              <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
            </a>
            <a href={ctaSecondaryHref}
              style={{ fontFamily: SANS, fontSize: 12, fontWeight: 500, letterSpacing: "0.1em", textTransform: "uppercase", color: CREAM, textDecoration: "none", padding: "13px 36px", border: `1.5px solid ${GOLD}80`, borderRadius: 2, display: "inline-block", transition: "border-color 0.2s" }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = GOLD)}
              onMouseLeave={e => (e.currentTarget.style.borderColor = `${GOLD}80`)}
            >
              <GenericEditableText sectionId={sectionId} field="ctaSecondaryText" value={ctaSecondaryText} tag="span" />
            </a>
          </div>
        </div>
      </div>
      <style>{`[data-c02cta]{opacity:0;transform:translateY(36px);transition:opacity .72s cubic-bezier(.22,1,.36,1),transform .72s cubic-bezier(.22,1,.36,1)}[data-c02cta].c02cta-vis{opacity:1;transform:translateY(0)}`}</style>
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
  const ctaHref           = String(content.ctaHref           ?? "#kontakt");
  const ctaSecondaryText  = String(content.ctaSecondaryText  ?? "Jídelní lístek");
  const ctaSecondaryHref  = String(content.ctaSecondaryHref  ?? "/menu");
  const image             = String(content.image             ?? "https://images.unsplash.com/photo-1550966871-3ed3cbe818b0?w=1920&h=1080&fit=crop&fm=webp&q=85");

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

  const resolve = (href: string) => resolveDemoHref(href, tenantSlug, isAdmin);

  return (
    <section ref={secRef} id={id} data-template="restaurant-02" style={{ position: "relative", overflow: "hidden", padding: "clamp(80px, 10vw, 140px) 0", fontFamily: POPPINS, backgroundColor: "#111" }}>
      {/* Foto pozadí */}
      <GenericEditableImage sectionId={sectionId} field="image" src={image} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
        <img loading="lazy" src={image} alt="" aria-hidden style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center", display: "block" }} />
      </GenericEditableImage>
      {/* Overlay */}
      <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.68)" }} />

      {/* Obsah */}
      <div style={{ position: "relative", zIndex: 1, maxWidth: 760, margin: "0 auto", padding: "0 clamp(24px, 6vw, 60px)", textAlign: "center", opacity: vis ? 1 : 0, transform: vis ? "translateY(0)" : "translateY(28px)", transition: "opacity 0.7s ease, transform 0.7s ease" }}>
        <p style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase", color: RED, margin: "0 0 16px" }}>
          <GenericEditableText sectionId={sectionId} field="tagline" value={tagline} tag="span" />
        </p>
        <h2 style={{ fontSize: "clamp(28px, 3.6vw, 52px)", fontWeight: 700, lineHeight: 1.15, color: WHITE, margin: "0 0 20px", whiteSpace: "pre-line" }}>
          <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
        </h2>
        {body && (
          <p style={{ fontSize: 15, lineHeight: 1.8, color: "rgba(255,255,255,0.75)", margin: "0 0 40px" }}>
            <GenericEditableText sectionId={sectionId} field="body" value={body} tag="span" />
          </p>
        )}
        <div className="r02-cta-btns" style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
          <a
            href={resolve(ctaHref)}
            data-btn="primary"
            style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: WHITE, textDecoration: "none", padding: "14px 40px", backgroundColor: RED, display: "inline-block", transition: "background-color 0.2s" }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#a93226")}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = RED)}
          >
            <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
          </a>
          <a
            href={resolve(ctaSecondaryHref)}
            style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: WHITE, textDecoration: "none", padding: "13px 40px", border: "1px solid rgba(255,255,255,0.5)", display: "inline-block", transition: "border-color 0.2s" }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = WHITE)}
            onMouseLeave={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.5)")}
          >
            <GenericEditableText sectionId={sectionId} field="ctaSecondaryText" value={ctaSecondaryText} tag="span" />
          </a>
        </div>
      </div>
      <style>{`@media(max-width:480px){.r02-cta-btns{flex-direction:column!important;align-items:center!important}}`}</style>
    </section>
  );
}

// ── restaurant-03-cta ─────────────────────────────────────────────────────────
// Zlatý (#b97d26) fullbleed pás — inspirováno zlatou CTA lištou lacasalatina.cz
// Centrovaný bílý serif H2 uppercase + podtitulek + 2 CTA tlačítka
// Primární: bílé filled "Rezervovat stůl" | Sekundární: tmavé outline "Menu"
// ─────────────────────────────────────────────────────────────────────────────
function CtaRestaurant03({
  content, sectionId, tenantSlug, isAdmin,
}: { content: Record<string, unknown>; sectionId: number; tenantSlug?: string; isAdmin: boolean }) {
  const id       = String(content.id       ?? "rezervace");
  const tagline  = String(content.tagline  ?? "Rezervujte si místo");
  const title    = String(content.title    ?? "Samba, Salsa, Bachata\na skvělé jídlo.");
  const body     = String(content.body     ?? "");
  const ctaText  = String(content.ctaText  ?? "Rezervovat stůl");
  const ctaHref  = String(content.ctaHref  ?? "#kontakt");
  const cta2Text = String(content.ctaSecondaryText ?? "Prohlédnout menu");
  const cta2Href = String(content.ctaSecondaryHref ?? "/menu");

  const GOLD  = "#e05e3f";
  const DARK  = "#0d1b2a";
  const WHITE = "#ffffff";
  const FONT  = "Georgia, 'Times New Roman', serif";
  const SANS  = "'Helvetica Neue', Helvetica, Arial, sans-serif";

  const resolve = (href: string) => resolveDemoHref(href, tenantSlug, isAdmin);

  return (
    <section id={id} data-variant="restaurant-03-cta" style={{ backgroundColor: GOLD, padding: "80px clamp(24px, 6vw, 80px)", fontFamily: SANS, textAlign: "center" }}>
      {/* Kicker */}
      <p style={{
        fontFamily: SANS, fontSize: 11, fontWeight: 700,
        letterSpacing: "0.22em", textTransform: "uppercase",
        color: `${WHITE}cc`, margin: "0 0 16px",
      }}>
        <GenericEditableText sectionId={sectionId} field="tagline" value={tagline} tag="span" />
      </p>

      {/* H2 */}
      <h2 style={{
        fontFamily: FONT, fontSize: "clamp(28px, 4.5vw, 56px)", fontWeight: 400,
        color: WHITE, margin: "0 0 20px", lineHeight: 1.15,
        textTransform: "uppercase", letterSpacing: "0.04em",
        whiteSpace: "pre-line",
      }}>
        <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
      </h2>

      {/* Body */}
      {body && (
        <p style={{ fontFamily: SANS, fontSize: 16, lineHeight: 1.7, color: `${WHITE}dd`, margin: "0 auto 36px", maxWidth: 560 }}>
          <GenericEditableText sectionId={sectionId} field="body" value={body} tag="span" />
        </p>
      )}

      {/* CTAs */}
      <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap", marginTop: body ? 0 : 32 }}>
        <a
          href={resolve(ctaHref)}
          data-btn="primary"
          style={{
            fontFamily: SANS, fontSize: 12, fontWeight: 700, letterSpacing: "0.14em",
            textTransform: "uppercase", color: DARK, textDecoration: "none",
            padding: "14px 36px", backgroundColor: WHITE, borderRadius: 2,
            transition: "opacity 0.2s",
          }}
          onMouseEnter={e => (e.currentTarget.style.opacity = "0.88")}
          onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
        >
          <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
        </a>
        {cta2Text && (
          <a
            href={resolve(cta2Href)}
            style={{
              fontFamily: SANS, fontSize: 12, fontWeight: 600, letterSpacing: "0.14em",
              textTransform: "uppercase", color: WHITE, textDecoration: "none",
              padding: "14px 36px", border: `1px solid ${WHITE}99`, borderRadius: 2,
              transition: "border-color 0.2s",
            }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = WHITE)}
            onMouseLeave={e => (e.currentTarget.style.borderColor = `${WHITE}99`)}
          >
            <GenericEditableText sectionId={sectionId} field="ctaSecondaryText" value={cta2Text} tag="span" />
          </a>
        )}
      </div>
    </section>
  );
}

// ── cafe-03-cta ───────────────────────────────────────────────────────────────
// Ref: cathedral.cz — rezervace sekce
// Dark foto bg s rgba(0,0,0,0.55) overlay; centrovaný Great Vibes H2 + Open Sans subtitle
// + zlaté CTA tlačítko
// ─────────────────────────────────────────────────────────────────────────────
function CtaCafe03({ content, sectionId, tenantSlug, isAdmin }: { content: Record<string, unknown>; sectionId: number; tenantSlug?: string; isAdmin: boolean }) {
  const GOLD    = "#C69C60";
  const GOLD_DK = "#A07840";
  const SERIF   = "'Great Vibes', cursive";
  const SANS    = "'Open Sans', sans-serif";

  const title   = String(content.title   ?? "Zarezervujte si stůl");
  const subtitle = String(content.subtitle ?? "Otevřeno každý den od 9:00 do 21:00 hod.");
  const ctaText  = String(content.ctaText  ?? "Zarezervovat stůl");
  const ctaHref  = String(content.ctaHref  ?? "/kontakt");
  const bgImage  = String(content.backgroundImage ?? "https://images.unsplash.com/photo-1559925393-8be0ec4767c8?w=1920&h=800&fit=crop&fm=webp&q=80");

  const resolve = (h: string) => {
    if (!tenantSlug) return h;
    const base = isAdmin ? `/admin/${tenantSlug}` : `/demo/${tenantSlug}`;
    return h.startsWith("/") ? `${base}${h}` : h;
  };

  return (
    <section style={{ position: "relative", overflow: "hidden", padding: "clamp(80px, 12vw, 140px) clamp(20px, 5vw, 60px)", textAlign: "center", fontFamily: SANS }}>
      {/* Background */}
      <GenericEditableImage sectionId={sectionId} field="backgroundImage" src={bgImage} alt="" style={{ position: "absolute", inset: 0 }}>
        <img src={bgImage} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} loading="lazy" />
      </GenericEditableImage>
      <div style={{ position: "absolute", inset: 0, backgroundColor: "rgba(0,0,0,0.55)" }} />

      {/* Content */}
      <div style={{ position: "relative", zIndex: 1, maxWidth: 640, margin: "0 auto" }}>
        <GenericEditableText sectionId={sectionId} field="title" value={title} tag="h2">
          <h2 style={{ fontFamily: SERIF, fontSize: "clamp(36px, 5vw, 64px)", fontWeight: 400, color: "#fff", margin: "0 0 16px", lineHeight: 1.2 }}>
            {title}
          </h2>
        </GenericEditableText>
        <GenericEditableText sectionId={sectionId} field="subtitle" value={subtitle} tag="p">
          <p style={{ fontFamily: SANS, fontSize: "clamp(14px, 1.8vw, 17px)", fontWeight: 300, color: "rgba(255,255,255,0.85)", margin: "0 0 36px", letterSpacing: "0.02em" }}>
            {subtitle}
          </p>
        </GenericEditableText>
        <a
          href={resolve(ctaHref)}
          data-btn="primary"
          style={{ fontFamily: SANS, fontSize: 12, fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase", color: "#fff", textDecoration: "none", padding: "14px 40px", backgroundColor: GOLD, display: "inline-block", transition: "background-color 0.2s" }}
          onMouseEnter={e => (e.currentTarget.style.backgroundColor = GOLD_DK)}
          onMouseLeave={e => (e.currentTarget.style.backgroundColor = GOLD)}
        >
          <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
        </a>
      </div>

      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Great+Vibes&family=Open+Sans:wght@300;600&display=swap" />
      <style>{`      `}</style>
    </section>
  );
}

// ── cafe-04-newsletter ────────────────────────────────────────────────────────
// Ref: coffeeroom.cz — parallax bg, "don't miss anything" + email subscribe
// .parallax_home: fixed bg, height 460px; .white-button: coffeebrown border
// ─────────────────────────────────────────────────────────────────────────────
function NewsletterCafe04({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const heading          = String(content.heading          ?? "don't miss anything");
  const subheading       = String(content.subheading       ?? "");
  const inputPlaceholder = String(content.inputPlaceholder ?? "your email address");
  const ctaText          = String(content.ctaText          ?? "Subscribe");
  const successText      = String(content.successText      ?? "Thank you!");
  const BG_IMG = "/clones/coffeeroom/cdn/67cc82f0c6e15f8db05a46c0/67cc82f0c6e15f8db05a4785_DSC05499.jpeg";

  const [submitted, setSubmitted] = useState(false);
  const [email, setEmail] = useState("");

  return (
    <section
      style={{
        backgroundImage: `url("${BG_IMG}")`,
        backgroundPosition: "50%",
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover",
        backgroundAttachment: "fixed",
        height: 460,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Dark overlay */}
      <div style={{ position: "absolute", inset: 0, backgroundColor: "rgba(29,31,46,0.55)" }} aria-hidden />

      <div style={{ position: "relative", zIndex: 1, textAlign: "center", color: "#fff", width: "100%", maxWidth: 640, padding: "0 24px" }}>
        {/* "don't miss anything" label with deco lines */}
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", marginBottom: 50 }}>
          <div style={{ backgroundColor: "rgba(255,255,255,0.8)", width: 30, height: 1, display: "inline-block" }} />
          <span style={{ opacity: 0.9, color: "#fff", letterSpacing: 2, textTransform: "uppercase", fontSize: 12, fontWeight: 700, lineHeight: "18px", fontFamily: "Montserrat, sans-serif", margin: "0 15px" }}>
            <GenericEditableText sectionId={sectionId} field="heading" value={heading} tag="span" />
          </span>
          <div style={{ backgroundColor: "rgba(255,255,255,0.8)", width: 30, height: 1, display: "inline-block" }} />
        </div>

        {/* Subheading */}
        {subheading && (
          <p style={{ fontFamily: "'Karla', sans-serif", fontSize: 16, fontWeight: 400, color: "rgba(255,255,255,0.85)", marginBottom: 32, lineHeight: 1.6 }}>
            <GenericEditableText sectionId={sectionId} field="subheading" value={subheading} tag="span" />
          </p>
        )}

        {/* Form */}
        {!submitted ? (
          <form
            onSubmit={e => { e.preventDefault(); if (email) setSubmitted(true); }}
            style={{ display: "flex", justifyContent: "center", alignItems: "center", flexWrap: "wrap", gap: 10 }}
          >
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder={inputPlaceholder}
              required
              style={{
                border: "1px solid #fff",
                color: "#1d1f2e",
                textAlign: "left",
                backgroundColor: "#fff",
                width: 300,
                padding: "18px 24px",
                fontSize: 12,
                fontWeight: 400,
                letterSpacing: "1px",
                fontFamily: "Montserrat, sans-serif",
                outline: "none",
                borderRadius: 0,
              }}
            />
            <button
              type="submit"
              style={{
                border: "1px solid #b79570",
                color: "#b79570",
                backgroundColor: "transparent",
                padding: "18px 24px",
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: 2,
                textTransform: "uppercase",
                fontFamily: "Montserrat, sans-serif",
                cursor: "pointer",
                borderRadius: 0,
                transition: "background-color .4s, color .4s",
              }}
              onMouseEnter={e => { e.currentTarget.style.backgroundColor = "#b79570"; e.currentTarget.style.color = "#fff"; }}
              onMouseLeave={e => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = "#b79570"; }}
            >
              <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
            </button>
          </form>
        ) : (
          <p style={{ fontFamily: "Montserrat, sans-serif", fontSize: 14, fontWeight: 600, color: "#fff", letterSpacing: 1 }}>
            <GenericEditableText sectionId={sectionId} field="successText" value={successText} tag="span" />
          </p>
        )}
      </div>
    </section>
  );
}

// ── reality-02-cta ────────────────────────────────────────────────────────────
// Ref: fermakleri.cz "Prodejte svou nemovitost výhodněji než ostatní"
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
// Dark teal centrovaný CTA — ref: lexxusnorton.cz
// #1a3640 bg; bílý H2 + subtitle; zlaté pill CTA + outline sekundární
// ─────────────────────────────────────────────────────────────────────────────
function CtaReality01({ content, sectionId, tenantSlug, isAdmin }: { content: Record<string, unknown>; sectionId: number; tenantSlug?: string; isAdmin: boolean }) {
  const title    = String(content.title    ?? "Hledáte svůj vysněný domov?");
  const subtitle = String(content.subtitle ?? "Kontaktujte nás ještě dnes. Pomůžeme vám najít nebo prodat nemovitost za nejlepší cenu.");
  const ctaText          = String(content.ctaText          ?? "Nezávazná konzultace");
  const ctaHref          = String(content.ctaHref          ?? "/kontakt");
  const ctaSecondaryText = String(content.ctaSecondaryText ?? "Prohlédnout nabídku");
  const ctaSecondaryHref = String(content.ctaSecondaryHref ?? "/vypis-nemovitosti");

  const DARK       = "#1a3640";
  const GOLD       = "#d4a96e";
  const WHITE      = "#ffffff";
  const MONTSERRAT = "'Montserrat', 'Helvetica Neue', Arial, sans-serif";
  const OPEN_SANS  = "'Open Sans', 'Helvetica Neue', Arial, sans-serif";

  const resolve = (href: string) => {
    if (!tenantSlug) return href;
    if (href.startsWith("#")) return href;
    return `/demo/${tenantSlug}${isAdmin ? "/admin" : ""}${href}`;
  };

  return (
    <section style={{ backgroundColor: DARK, padding: "clamp(64px,9vw,112px) 0", position: "relative", overflow: "hidden" }}>
      {/* Subtle diagonal decorations */}
      <svg style={{ position: "absolute", bottom: 0, left: "clamp(20px,5vw,80px)", pointerEvents: "none" }} width="120" height="142" viewBox="0 0 161 190" fill="none" aria-hidden="true">
        <path d="M2.47 187.71L158.02 2.33" stroke="#C28F75" strokeOpacity="0.25" strokeWidth="4" />
      </svg>
      <svg style={{ position: "absolute", top: 0, right: "clamp(20px,5vw,80px)", pointerEvents: "none" }} width="120" height="142" viewBox="0 0 161 190" fill="none" aria-hidden="true">
        <path d="M2.47 2.33L158.02 187.71" stroke="#294A52" strokeOpacity="0.4" strokeWidth="4" />
      </svg>

      <div style={{ maxWidth: 720, margin: "0 auto", padding: "0 clamp(20px,4vw,56px)", textAlign: "center", position: "relative", zIndex: 1 }}>
        <GenericEditableText sectionId={sectionId} field="title" value={title} tag="h2"
          style={{ fontFamily: MONTSERRAT, fontSize: "clamp(28px,4vw,48px)", fontWeight: 700, lineHeight: 1.2, color: WHITE, margin: "0 0 20px", letterSpacing: "-0.01em" }} />
        <GenericEditableText sectionId={sectionId} field="subtitle" value={subtitle} tag="p"
          style={{ fontFamily: OPEN_SANS, fontSize: 17, color: "rgba(255,255,255,0.7)", margin: "0 0 48px", lineHeight: 1.7 }} />
        <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
          <a href={resolve(ctaHref)} data-btn="primary" style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            backgroundColor: GOLD, color: "#1a1a1a",
            fontFamily: MONTSERRAT, fontSize: 15, fontWeight: 600, letterSpacing: "0.05em",
            padding: "15px 40px", borderRadius: 999, textDecoration: "none", transition: "background 0.2s, transform 0.15s",
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = "#c49a5e"; (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)"; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = GOLD; (e.currentTarget as HTMLElement).style.transform = "none"; }}
          >
            <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
          </a>
          <a href={resolve(ctaSecondaryHref)} style={{
            display: "inline-flex", alignItems: "center",
            border: "1.5px solid rgba(255,255,255,0.5)", color: WHITE,
            fontFamily: MONTSERRAT, fontSize: 15, fontWeight: 500, letterSpacing: "0.05em",
            padding: "15px 40px", borderRadius: 999, textDecoration: "none", transition: "border-color 0.2s, background 0.2s",
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = "rgba(255,255,255,0.08)"; (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.9)"; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = "transparent"; (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.5)"; }}
          >
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
  const phone        = String(content.phone        ?? "704 123 456");
  const claim        = String(content.claim        ?? "Zeptejte se na cokoliv, jsme tu pro Vás.");
  const claimAccent  = String(content.claimAccent  ?? "cokoliv");
  const ctaText      = String(content.ctaText      ?? "Chci více informací");
  const ctaHref      = String(content.ctaHref      ?? "#kontakt");

  const PRIMARY = "#1032CF";
  const GREEN   = "#21b276";
  const DARK    = "#241f0c";
  const WHITE   = "#ffffff";
  const SANS    = "'Helvetica Neue', Helvetica, Arial, sans-serif";

  const resolve = (href: string) => resolveDemoHref(href, tenantSlug, isAdmin);

  // Zvýrazní slovo claimAccent modrou barvou uvnitř claim textu
  const renderClaim = () => {
    if (!claimAccent || !claim.includes(claimAccent)) {
      return <GenericEditableText sectionId={sectionId} field="claim" value={claim} tag="span" />;
    }
    const parts = claim.split(claimAccent);
    return (
      <span>
        {parts[0]}
        <span style={{ color: PRIMARY, fontWeight: 700 }}>{claimAccent}</span>
        {parts[1]}
      </span>
    );
  };

  return (
    <section style={{ backgroundColor: "#f2f2f2", borderTop: "1px solid #e8e8e8", borderBottom: "1px solid #e8e8e8" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "clamp(28px, 3.5vw, 44px) clamp(16px, 3vw, 40px)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 24, flexWrap: "wrap" }}>

        {/* Levá část: telefon + claim */}
        <div style={{ display: "flex", alignItems: "center", gap: "clamp(20px, 3vw, 48px)", flexWrap: "wrap" }}>
          {/* Telefon s ikonou */}
          <a href={`tel:${phone.replace(/\s/g, "")}`} style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none", flexShrink: 0 }}>
            <div style={{ width: 40, height: 40, borderRadius: "50%", backgroundColor: PRIMARY, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={WHITE} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.38 2 2 0 0 1 3.6 1.22h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 8.81a16 16 0 0 0 6.29 6.29l.95-.95a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
              </svg>
            </div>
            <span style={{ fontFamily: SANS, fontSize: "clamp(18px, 2vw, 24px)", fontWeight: 700, color: DARK, letterSpacing: "-0.3px" }}>
              <GenericEditableText sectionId={sectionId} field="phone" value={phone} tag="span" />
            </span>
          </a>

          {/* Claim */}
          <p style={{ fontFamily: SANS, fontSize: "clamp(14px, 1.3vw, 16px)", color: DARK, margin: 0, lineHeight: 1.4 }}>
            {renderClaim()}
          </p>
        </div>

        {/* Pravá část: CTA */}
        <a
          href={resolve(ctaHref)}
          data-btn="primary"
          style={{ padding: "11px 28px", backgroundColor: GREEN, color: WHITE, fontFamily: SANS, fontSize: 15, fontWeight: 500, textDecoration: "none", borderRadius: 50, boxShadow: `inset 0 0 0 2px ${GREEN}`, transition: "all 350ms ease", whiteSpace: "nowrap", flexShrink: 0 }}
          onMouseEnter={e => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = GREEN; }}
          onMouseLeave={e => { e.currentTarget.style.backgroundColor = GREEN; e.currentTarget.style.color = WHITE; }}
        >
          <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
        </a>
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

  const title       = String(content.title            ?? "Buďte stále v obraze");
  const message     = String(content.message          ?? "Vyplňte svůj e-mail a budeme vám zasílat pravidelné informace ze světa práva a podnikání.");
  const ctaText     = String(content.ctaText          ?? "Odebírat");
  const placeholder = String(content.inputPlaceholder ?? "Zadejte váš e-mail");

  return (
    <section
      data-variant="lawyer-01-cta"
      style={{ backgroundColor: NAVY, padding: "72px 32px" }}
    >
      <style>{`
        @media (max-width: 700px) {
          .l01-cta-inner  { flex-direction: column !important; align-items: flex-start !important; gap: 32px !important; }
          .l01-cta-form   { flex-direction: column !important; width: 100% !important; }
          .l01-cta-form input  { width: 100% !important; border-right: 2px solid transparent !important; border-radius: 4px !important; }
          .l01-cta-form button { width: 100% !important; border-radius: 4px !important; }
        }
      `}</style>

      <div
        className="l01-cta-inner"
        style={{ maxWidth: 1100, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 48 }}
      >
        {/* Text */}
        <div style={{ flex: "1 1 320px" }}>
          <div style={{ width: 36, height: 3, backgroundColor: CRIMSON, marginBottom: 20 }} />
          <h2 style={{ fontFamily: HEADING, fontSize: "clamp(1.5rem,2.4vw,2rem)", fontWeight: 700, color: "#fff", margin: "0 0 12px", lineHeight: 1.2 }}>
            <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
          </h2>
          <p style={{ fontFamily: BODY, fontSize: "clamp(0.88rem,1vw,0.97rem)", color: "rgba(255,255,255,0.75)", margin: 0, lineHeight: 1.65 }}>
            <GenericEditableText sectionId={sectionId} field="message" value={message} tag="span" />
          </p>
        </div>

        {/* Form */}
        <div
          className="l01-cta-form"
          style={{ flex: "0 0 auto", display: "flex", gap: 0, maxWidth: 440, width: "100%" }}
        >
          <input
            type="email"
            placeholder={placeholder}
            style={{
              flex: 1, padding: "14px 20px",
              fontFamily: BODY, fontSize: "0.93rem", color: "#1a1a1a",
              border: "2px solid transparent", borderRight: "none",
              borderRadius: "4px 0 0 4px", outline: "none",
              background: "#fff",
            }}
          />
          <button
            type="submit"
            style={{
              padding: "14px 24px", backgroundColor: CRIMSON, color: "#fff",
              fontFamily: BODY, fontSize: "0.93rem", fontWeight: 600,
              border: "2px solid " + CRIMSON, borderRadius: "0 4px 4px 0",
              cursor: "pointer", whiteSpace: "nowrap", letterSpacing: "0.03em",
              transition: "background 0.18s",
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#8a0228"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = CRIMSON; }}
          >
            <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
          </button>
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

  const tagline    = String(content.tagline    ?? "Zdarma a nezávazně");
  const title      = String(content.title      ?? "Zvažujete rekonstrukci?");
  const subtitle   = String(content.subtitle   ?? "Zavolejte nebo napište — rádi Vám poradíme s rozsahem, termíny i financováním vaší stavby.");
  const ctaText    = String(content.ctaText    ?? "Nezávazná konzultace");
  const ctaHref    = String(content.ctaHref    ?? "#kontakt");
  const ctaSecText = String(content.ctaSecondaryText ?? "");
  const ctaSecHref = String(content.ctaSecondaryHref ?? "");

  const resolve = (href: string) => {
    if (!href || href.startsWith("http") || href.startsWith("#") || href.startsWith("tel:")) return href;
    if (tenantSlug) {
      const base = isAdmin ? `/demo/${tenantSlug}/admin` : `/demo/${tenantSlug}`;
      return base + (href.startsWith("/") ? href : "/" + href);
    }
    return href;
  };

  return (
    <section id={String(content.id ?? "cta-konzultace")} style={{ backgroundColor: DARK, fontFamily: FONT, padding: "clamp(56px,8vw,96px) 0" }} data-template="stavba-01">
      <div className="stavba-cta-inner" style={{ maxWidth: 1200, margin: "0 auto", padding: "0 32px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 40, flexWrap: "wrap" }}>

        {/* Left text */}
        <div style={{ flex: "1 1 400px" }}>
          <p style={{ color: ORANGE, fontSize: "0.78rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", margin: "0 0 12px" }}>
            <GenericEditableText sectionId={sectionId} field="tagline" value={tagline} tag="span" />
          </p>
          <h2 style={{ color: WHITE, fontSize: "clamp(24px,3vw,40px)", fontWeight: 800, lineHeight: 1.1, letterSpacing: "-0.02em", margin: "0 0 14px" }}>
            <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
          </h2>
          <p style={{ color: "rgba(255,255,255,0.60)", fontSize: "0.95rem", lineHeight: 1.7, margin: 0, maxWidth: 520 }}>
            <GenericEditableText sectionId={sectionId} field="subtitle" value={subtitle} tag="span" />
          </p>
        </div>

        {/* Right buttons */}
        <div className="stavba-cta-btns" style={{ display: "flex", gap: 14, flexWrap: "wrap", flexShrink: 0 }}>
          <a
            href={resolve(ctaHref)}
            data-btn="primary"
            style={{ display: "inline-flex", alignItems: "center", backgroundColor: ORANGE, color: WHITE, fontFamily: FONT, fontSize: "0.95rem", fontWeight: 700, padding: "15px 32px", borderRadius: 8, textDecoration: "none", boxShadow: "0 4px 20px rgba(255,111,13,0.35)", transition: "opacity 0.18s, transform 0.18s" }}
            onMouseEnter={e => { e.currentTarget.style.opacity = "0.9"; e.currentTarget.style.transform = "translateY(-1px)"; }}
            onMouseLeave={e => { e.currentTarget.style.opacity = "1"; e.currentTarget.style.transform = "translateY(0)"; }}
          >
            <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
          </a>
          {ctaSecText && (
            <a
              href={resolve(ctaSecHref)}
              style={{ display: "inline-flex", alignItems: "center", gap: 8, color: "rgba(255,255,255,0.75)", fontFamily: FONT, fontSize: "0.95rem", fontWeight: 600, padding: "15px 24px", borderRadius: 8, textDecoration: "none", border: "1px solid rgba(255,255,255,0.20)", transition: "color 0.18s, border-color 0.18s" }}
              onMouseEnter={e => { e.currentTarget.style.color = WHITE; e.currentTarget.style.borderColor = "rgba(255,255,255,0.50)"; }}
              onMouseLeave={e => { e.currentTarget.style.color = "rgba(255,255,255,0.75)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.20)"; }}
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
function CtaClean02({ content, sectionId, tenantSlug, isAdmin }: { content: Record<string, unknown>; sectionId: number; tenantSlug?: string; isAdmin: boolean }) {
  const eyebrow = String(content.eyebrow ?? "Postup spolupráce");
  const title   = String(content.title ?? "Jak probíhá spolupráce s námi?");
  const ctaText = String(content.ctaText ?? "Nezávazně poptat úklid");
  const ctaHref = String(content.ctaHref ?? "#kontakt");
  const steps   = (content.steps as Array<{ number?: string; title?: string; description?: string }>) ?? [];
  const NAVY = "#0e0e53"; const BLUE = "#019dff";
  const resolve = (href: string) => {
    if (!tenantSlug || href.startsWith("http") || href.startsWith("#")) return href;
    const base = isAdmin ? `/demo/${tenantSlug}/admin` : `/demo/${tenantSlug}`;
    return href === "/" ? base : `${base}${href}`;
  };
  return (
    <>
      <style>{`
        .c02ct-section { background: ${NAVY}; padding: 5.5rem 5%; font-family: 'Onest',sans-serif; position: relative; overflow: hidden; }
        .c02ct-section::before { content: ''; position: absolute; inset: 0; background: radial-gradient(ellipse 70% 60% at 50% 110%, rgba(1,157,255,.18) 0%, transparent 70%); pointer-events: none; }
        .c02ct-inner { max-width: 80rem; margin: 0 auto; text-align: center; position: relative; z-index: 1; }
        .c02ct-kicker { display: inline-flex; align-items: center; gap: .45rem; font-size: .72rem; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; color: ${BLUE}; margin-bottom: .75rem; }
        .c02ct-kicker::before { content: ''; display: inline-block; width: 6px; height: 6px; border-radius: 50%; background: ${BLUE}; }
        .c02ct-h2 { font-family: 'Bricolage Grotesque',sans-serif; font-size: clamp(1.65rem,3.2vw,2.5rem); font-weight: 800; color: #fff; margin: 0 0 3.5rem; line-height: 1.2; }
        .c02ct-steps { display: grid; grid-template-columns: repeat(4,1fr); gap: 0; margin-bottom: 3.5rem; position: relative; }
        .c02ct-steps::before { content: ''; position: absolute; top: 2.25rem; left: calc(12.5% + 1.5rem); right: calc(12.5% + 1.5rem); height: 2px; background: linear-gradient(90deg, rgba(1,157,255,.6), rgba(37,89,226,.6)); pointer-events: none; }
        .c02ct-step { display: flex; flex-direction: column; align-items: center; text-align: center; padding: 0 1.25rem; }
        .c02ct-circle { width: 4.5rem; height: 4.5rem; border-radius: 50%; background: linear-gradient(135deg,#2bbbff,#2559e2); display: flex; align-items: center; justify-content: center; margin-bottom: 1.25rem; position: relative; z-index: 2; flex-shrink: 0; box-shadow: 0 0 0 6px rgba(1,157,255,.15); }
        .c02ct-num { font-family: 'Bricolage Grotesque',sans-serif; font-size: 1.3rem; font-weight: 800; color: #fff; line-height: 1; }
        .c02ct-step h3 { font-family: 'Bricolage Grotesque',sans-serif; font-size: 1rem; font-weight: 700; color: #fff; margin: 0 0 .6rem; line-height: 1.3; }
        .c02ct-step p { font-size: .85rem; color: rgba(255,255,255,.62); margin: 0; line-height: 1.65; }
        .c02ct-btn { display: inline-flex; align-items: center; gap: .5rem; padding: .9rem 2.25rem; border-radius: 9999px; background: linear-gradient(100deg,#2bbbff,#1c91ff 40%,#2559e2); color: #fff; font-weight: 700; font-size: 1rem; text-decoration: none; transition: opacity .2s, transform .15s; box-shadow: 0 8px 28px -6px rgba(1,157,255,.55); }
        .c02ct-btn:hover { opacity: .9; transform: translateY(-2px); }
        .c02ct-btn svg { width: 18px; height: 18px; }
        @media(max-width:900px) { .c02ct-steps { grid-template-columns: repeat(2,1fr); gap: 2rem; } .c02ct-steps::before { display: none; } }
        @media(max-width:500px) { .c02ct-steps { grid-template-columns: 1fr; } }
      `}</style>
      <section className="c02ct-section" id="postup" data-template="clean-02-cta">
        <div className="c02ct-inner">
          <p className="c02ct-kicker"><GenericEditableText sectionId={sectionId} field="eyebrow" value={eyebrow} tag="span" /></p>
          <h2 className="c02ct-h2"><GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" /></h2>
          <div className="c02ct-steps">
            {steps.map((step, i) => (
              <div key={i} className="c02ct-step">
                <div className="c02ct-circle">
                  <span className="c02ct-num">{step.number ?? String(i + 1).padStart(2, "0")}</span>
                </div>
                <h3><GenericEditableText sectionId={sectionId} field={`steps.${i}.title`} value={step.title ?? ""} tag="span" /></h3>
                <p><GenericEditableText sectionId={sectionId} field={`steps.${i}.description`} value={step.description ?? ""} tag="span" /></p>
              </div>
            ))}
          </div>
          <a href={resolve(ctaHref)} data-btn="primary" className="c02ct-btn">
            <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
          </a>
        </div>
      </section>
    </>
  );
}

/* ─── garden-02: CTA ──────────────────────────────────────────────────────── */
function CtaGarden02({ content, sectionId, tenantSlug, isAdmin }: { content: Record<string, unknown>; sectionId: number; tenantSlug?: string; isAdmin: boolean }) {
  function resolve(href: string) {
    if (!tenantSlug || !href.startsWith("/")) return href;
    if (href === "/") return `/demo/${tenantSlug}${isAdmin ? "/admin" : ""}`;
    return `/demo/${tenantSlug}${isAdmin ? "/admin" : ""}${href}`;
  }

  const title    = (content.title    as string) ?? "";
  const subtitle = (content.subtitle as string) ?? "";
  const ctaText  = (content.ctaText  as string) ?? "";
  const ctaHref  = (content.ctaHref  as string) ?? "/kontakt";

  const PRIMARY = "#95c11f";
  const DARK    = "#1a2a0a";
  const FONT    = "'Inter', Arial, sans-serif";

  return (
    <>
      <style>{`
        .g02ct-section { background: ${DARK}; padding: 88px 24px; font-family: ${FONT}; text-align: center; }
        .g02ct-inner   { max-width: 720px; margin: 0 auto; }
        .g02ct-kicker  { display: inline-flex; align-items: center; gap: 8px; font-size: 0.78rem; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: ${PRIMARY}; margin-bottom: 16px; }
        .g02ct-kicker::before, .g02ct-kicker::after { content: ""; display: block; width: 24px; height: 2px; background: ${PRIMARY}; }
        .g02ct-h2      { font-size: clamp(1.6rem, 3.5vw, 2.4rem); font-weight: 800; color: #fff; margin: 0 0 14px; line-height: 1.2; }
        .g02ct-sub     { font-size: 1.05rem; color: rgba(255,255,255,0.7); margin: 0 0 36px; line-height: 1.65; }
        .g02ct-btn     { display: inline-block; background: ${PRIMARY}; color: #fff; font-size: 1rem; font-weight: 700; text-decoration: none; padding: 16px 40px; border-radius: 9999px; transition: opacity 0.2s, transform 0.15s; }
        .g02ct-btn:hover { opacity: 0.88; transform: translateY(-1px); }
        @media (max-width: 640px) { .g02ct-section { padding: 64px 20px; } }
      `}</style>
      <section className="g02ct-section">
        <div className="g02ct-inner">
          <div className="g02ct-kicker">Kontakt</div>
          <h2 className="g02ct-h2"><GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" /></h2>
          {subtitle && <p className="g02ct-sub"><GenericEditableText sectionId={sectionId} field="subtitle" value={subtitle} tag="span" /></p>}
          <a href={resolve(ctaHref)} data-btn="primary" className="g02ct-btn">
            <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
          </a>
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
  const image    = String(content.image    ?? "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1920&h=1080&fit=crop&fm=webp&q=85");
  const sectionId2 = String((content as any).id ?? "poledni-menu");

  const RED   = "#c41c1c";
  const RED_DK = "#a01515";
  const CREAM = "#f5f0e8";
  const SERIF = "'Fraunces', Georgia, 'Times New Roman', serif";
  const SANS  = "'Nunito Sans', 'Helvetica Neue', Arial, sans-serif";

  const resolve = (href: string) => {
    if (!href.startsWith("/")) return href;
    if (!tenantSlug) return href;
    return isAdmin ? `/demo/${tenantSlug}/admin/page${href}` : `/demo/${tenantSlug}${href}`;
  };

  return (
    <section
      id={sectionId2}
      style={{
        position: "relative", overflow: "hidden",
        padding: "clamp(80px, 14vw, 160px) clamp(24px, 8vw, 120px)",
        textAlign: "center",
      }}
    >
      {/* BG foto */}
      <img
        src={image}
        alt=""
        style={{
          position: "absolute", inset: 0,
          width: "100%", height: "100%", objectFit: "cover",
          display: "block",
        }}
      />
      {/* Dark overlay s gradient */}
      <div style={{
        position: "absolute", inset: 0,
        background: "linear-gradient(to bottom, rgba(13,31,10,0.88) 0%, rgba(13,31,10,0.72) 50%, rgba(13,31,10,0.88) 100%)",
      }} />

      {/* Obsah */}
      <div style={{ position: "relative", zIndex: 2, maxWidth: 700, margin: "0 auto" }}>
        {/* Kicker */}
        <p style={{
          fontFamily: SANS, fontSize: 11, fontWeight: 700,
          letterSpacing: "0.24em", textTransform: "uppercase",
          color: RED, margin: "0 0 20px",
        }}>
          <GenericEditableText sectionId={sectionId} field="tagline" value={tagline} tag="span" />
        </p>

        {/* Dekorativní linka */}
        <div style={{ width: 44, height: 2, background: RED, margin: "0 auto 28px" }} />

        {/* H2 */}
        <h2 style={{
          fontFamily: SERIF, fontSize: "clamp(30px, 5vw, 60px)", fontWeight: 400,
          fontStyle: "italic", color: CREAM, margin: "0 0 28px", lineHeight: 1.1,
          whiteSpace: "pre-line",
        }}>
          <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
        </h2>

        {/* Body */}
        {body && (
          <p style={{
            fontFamily: SANS, fontSize: "clamp(14px, 1.5vw, 17px)", fontWeight: 400,
            color: `${CREAM}bb`, lineHeight: 1.75, margin: "0 auto 44px", maxWidth: 560,
          }}>
            <GenericEditableText sectionId={sectionId} field="body" value={body} tag="span" />
          </p>
        )}

        {/* CTA tlačítka */}
        <div className="r04-cta-btns" style={{ display: "flex", gap: 14, flexWrap: "wrap", justifyContent: "center" }}>
          <a
            href={ctaHref.startsWith("#") ? `#${ctaHref.replace(/^#/, "")}` : resolve(ctaHref)}
            data-btn="primary"
            style={{
              display: "inline-block", fontFamily: SANS, fontSize: 11, fontWeight: 700,
              letterSpacing: "0.14em", textTransform: "uppercase",
              color: CREAM, textDecoration: "none",
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
              display: "inline-block", fontFamily: SANS, fontSize: 11, fontWeight: 700,
              letterSpacing: "0.14em", textTransform: "uppercase",
              color: CREAM, textDecoration: "none",
              padding: "15px 36px", border: `1px solid ${CREAM}66`, borderRadius: 2,
              transition: "border-color 0.2s",
            }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = CREAM)}
            onMouseLeave={e => (e.currentTarget.style.borderColor = `${CREAM}66`)}
          >
            <GenericEditableText sectionId={sectionId} field="ctaSecondaryText" value={cta2Text} tag="span" />
          </a>
        </div>
      </div>
    <style>{`
        @media (max-width: 600px) {
          .r04-cta-btns { flex-direction: column !important; align-items: center !important; }
          .r04-cta-btns a { width: 100%; max-width: 320px; text-align: center; }
        }
      `}</style>
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
