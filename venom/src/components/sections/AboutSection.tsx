"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { GenericEditableText } from "@/components/tenant/GenericEditableText";
import { GenericEditableImage } from "@/components/tenant/GenericEditableImage";
import { ResizableImage } from "@/components/core/editable/ResizableImage";
import { shouldSkipNextImageOptimization } from "@/lib/image-source";

function resolveDemoHref(href: string, tenantSlug?: string, isAdmin = false) {
  if (!tenantSlug || !href.startsWith("/")) return href;
  if (href === "/") return `/demo/${tenantSlug}${isAdmin ? "/admin" : ""}`;
  return `/demo/${tenantSlug}${isAdmin ? "/admin" : ""}${href}`;
}

interface Props {
  content: Record<string, unknown>;
  variant: string;
  isAdmin: boolean;
  sectionId: number;
  tenantSlug?: string;
}

export function AboutSection({ content, variant, sectionId, isAdmin, tenantSlug }: Props) {

  if (variant === "ananda-01-highlights")     return <HighlightsAnanda01 content={content} sectionId={sectionId} />;
  if (variant === "ananda-01-about-ayurveda") return <AboutAnanda01Ayurveda content={content} sectionId={sectionId} />;
  if (variant === "ananda-01-benefits")       return <BenefitsAnanda01 content={content} sectionId={sectionId} />;
  if (variant === "ananda-01-hotels")         return <HotelsAnanda01 content={content} sectionId={sectionId} />;
  if (variant === "ananda-01-faq")            return <FaqAnanda01 content={content} sectionId={sectionId} />;
  if (variant === "tawan-01-benefits")  return <BenefitsTawan01 content={content} sectionId={sectionId} />;
  if (variant === "tawan-01-why")       return <WhyTawan01 content={content} sectionId={sectionId} />;
  if (variant === "tawan-01-news")      return <NewsTawan01 content={content} sectionId={sectionId} />;
  if (variant === "tawan-01-branches")  return <BranchesTawan01 content={content} sectionId={sectionId} />;
  if (variant === "tawan-02-boxes")     return <BoxesTawan02 content={content} sectionId={sectionId} />;
  if (variant === "tawan-02-why")       return <WhyTawan02 content={content} sectionId={sectionId} />;
  if (variant === "tawan-02-gift")      return <GiftTawan02 content={content} sectionId={sectionId} />;
  if (variant === "tattoo-01-intro")            return <IntroTattoo01 content={content} sectionId={sectionId} />;
  if (variant === "tattoo-01-services-tattoo")  return <ServicesTattoo01 content={content} sectionId={sectionId} side="left" />;
  if (variant === "tattoo-01-services-piercing") return <ServicesTattoo01 content={content} sectionId={sectionId} side="right" />;
  if (variant === "tattoo-01-principles")       return <PrinciplesTattoo01 content={content} sectionId={sectionId} />;
  if (variant === "tattoo-02-about")            return <AboutTattoo02 content={content} sectionId={sectionId} />;
  if (variant === "tattoo-03-about")            return <AboutTattoo03 content={content} sectionId={sectionId} />;
  if (variant === "tattoo-03-process")          return <ProcessTattoo03 content={content} sectionId={sectionId} />;
  if (variant === "nails-01-about")             return <AboutNails01 content={content} sectionId={sectionId} />;
  if (variant === "nails-02-about")             return <AboutNails02 content={content} sectionId={sectionId} />;
  if (variant === "nails-03-about")             return <AboutNails03 content={content} sectionId={sectionId} />;
  if (variant === "dental-01-about")            return <AboutDental01 content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;
  if (variant === "clinic-02-about")            return <AboutClinic02 content={content} sectionId={sectionId} />;
  if (variant === "clinic-03-about")            return <AboutClinic03 content={content} sectionId={sectionId} />;
  if (variant === "restaurant-01-about")        return <AboutRestaurant01 content={content} sectionId={sectionId} />;
  if (variant === "restaurant-02-about")        return <AboutRestaurant02 content={content} sectionId={sectionId} />;
  if (variant === "restaurant-03-about")        return <AboutRestaurant03 content={content} sectionId={sectionId} />;
  if (variant === "cafe-02-about")              return <AboutCafe02 content={content} sectionId={sectionId} />;
  if (variant === "cafe-03-about")              return <AboutCafe03 content={content} sectionId={sectionId} />;
  if (variant === "cafe-04-about")              return <AboutCafe04 content={content} sectionId={sectionId} />;
  if (variant === "bakery-01-about")            return <AboutBakery01 content={content} sectionId={sectionId} />;
  if (variant === "bakery-02-mosaic")           return <MosaicBakery02 content={content} sectionId={sectionId} />;
  if (variant === "reality-01-about")           return <AboutReality01 content={content} sectionId={sectionId} />;
  if (variant === "reality-02-benefits")        return <AboutReality02Benefits content={content} sectionId={sectionId} />;
  if (variant === "reality-05-about")           return <AboutReality05 content={content} sectionId={sectionId} />;
  if (variant === "reality-04-about")           return <AboutReality04 content={content} sectionId={sectionId} />;
  if (variant === "reality-06-about")           return <AboutReality06 content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;
  if (variant === "florist-01-process")         return <ProcessFlorist01 content={content} sectionId={sectionId} />;
  if (variant === "about-fitness-01-benefits")  return null;
  if (variant === "about-fitness-01-trainer")   return <TrainerFitness01 content={content} sectionId={sectionId} />;
  if (variant === "about-fitness-02-studio")    return <AboutFitness02 content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;
  if (variant === "about-fyzio-01-2col")        return <AboutFyzio01 content={content} sectionId={sectionId} />;
  if (variant === "about-fyzio-02-features")    return <AboutFyzio02Features content={content} sectionId={sectionId} />;
  if (variant === "lawyer-01-about")            return <AboutLawyer01 content={content} sectionId={sectionId} />;
  if (variant === "legal-02-about")             return <AboutLegal02 content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;
  if (variant === "sweet-01-about")             return <AboutSweet01 content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;

  // hair-04: 2-col split — text vlevo (tmavé bg), foto vpravo edge-to-edge — 1:1 kim-impressive.cz
  if (variant === "about-hair-04-split") {
    const title  = String(content.title  ?? "Impresivní střihy. Už 10 let.");
    const body   = String(content.body   ?? "");
    const body2  = String(content.body2  ?? "");
    const image  = String(content.image  ?? "");
    const GOLD   = "#FFDF25";
    const DARK   = "#0d0d0d";
    const LATO   = "'Lato', sans-serif";
    const PLACEHOLDER = "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&h=900&fit=crop&fm=webp";

    return (
      <section
        id="o-nas"
        data-template="hair-04"
        style={{ backgroundColor: DARK, display: "flex", minHeight: 520, flexWrap: "wrap" }}
      >
        <style>{`
          @media (max-width: 768px) {
            section[data-template="hair-04"]#o-nas { flex-direction: column; }
            section[data-template="hair-04"]#o-nas > div:first-child {
              flex: 1 1 100% !important;
              padding: 48px 24px !important;
            }
            section[data-template="hair-04"]#o-nas > div:last-child {
              min-height: 280px;
              flex: 1 1 100% !important;
            }
          }
        `}</style>
        {/* Levý sloupec — text */}
        <div
          style={{
            flex: "1 1 50%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: "72px clamp(40px, 6vw, 120px)",
          }}
        >
          {/* Gold dekorační linka */}
          <div style={{ width: 48, height: 3, backgroundColor: GOLD, marginBottom: 28 }} aria-hidden />

          <h2 style={{
            fontFamily: LATO,
            fontSize: "clamp(26px, 2.8vw, 40px)",
            fontWeight: 700,
            color: "#ffffff",
            lineHeight: 1.25,
            margin: "0 0 28px",
          }}>
            <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
          </h2>

          <p style={{
            fontFamily: LATO,
            fontSize: 16,
            fontWeight: 300,
            color: "rgba(255,255,255,0.8)",
            lineHeight: 1.85,
            margin: "0 0 20px",
            maxWidth: 480,
          }}>
            <GenericEditableText sectionId={sectionId} field="body" value={body} tag="span" />
          </p>

          {body2 && (
            <p style={{
              fontFamily: LATO,
              fontSize: 16,
              fontWeight: 300,
              color: "rgba(255,255,255,0.8)",
              lineHeight: 1.85,
              margin: 0,
              maxWidth: 480,
            }}>
              <GenericEditableText sectionId={sectionId} field="body2" value={body2} tag="span" />
            </p>
          )}
        </div>

        {/* Pravý sloupec — foto edge-to-edge */}
        <div style={{ flex: "1 1 50%", position: "relative", minHeight: 420 }}>
          <GenericEditableImage
            sectionId={sectionId}
            field="image"
            src={image || PLACEHOLDER}
            alt={title}
            className="absolute inset-0 w-full h-full"
            style={{ position: "absolute" }}
          >
            <Image
              src={image || PLACEHOLDER}
              alt={title}
              fill
              className="object-cover object-center"
              sizes="(max-width: 768px) 100vw, 50vw"
              unoptimized={shouldSkipNextImageOptimization(image || PLACEHOLDER)}
            />
          </GenericEditableImage>
        </div>
      </section>
    );
  }

  // hair-02: white bg, centered col-10, teal h6 tagline + big H1 + body paragraphs + CTA + brands bar
  if (variant === "about-hair-02-story") {
    const tagline    = String(content.tagline ?? "");
    const title      = String(content.title   ?? "Hair Studio No.1");
    const body       = String(content.body    ?? "");
    const paragraphs = (content.paragraphs as string[]) ?? [];
    const ctaText    = String(content.ctaText ?? "Rezervace");
    const ctaHref    = String(content.ctaHref ?? "#kontakt");
    const brands     = (content.brands as Array<{ name: string; logo: string }>) ?? [];
    const TEAL       = "#8ab2ab";
    const FONT       = "'Montserrat', sans-serif";
    return (
      <section
        id="o-nas"
        style={{ backgroundColor: "#ffffff", padding: "60px 0", fontFamily: FONT }}
        data-template="hair-02"
      >
        {/* Main text block — centered, 10/12 wide */}
        <div style={{ maxWidth: 900, margin: "0 auto", padding: "0 24px" }}>
          {/* Tagline + mobile CTA row */}
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: -24, position: "relative" }}>
            {tagline && (
              <h6
                style={{ color: TEAL, fontFamily: FONT, fontSize: 14, fontWeight: 500,
                  letterSpacing: "0.04em", margin: 0, textTransform: "none" }}
              >
                <GenericEditableText sectionId={sectionId} field="tagline" value={tagline} tag="span" />
              </h6>
            )}
            {/* Mobile-only CTA */}
            <a
              href={ctaHref}
              data-btn="primary"
              className="md:hidden"
              style={{
                display: "inline-block",
                backgroundColor: TEAL,
                color: "#fff",
                fontFamily: FONT,
                fontSize: 13,
                fontWeight: 600,
                letterSpacing: "0.1em",
                padding: "9px 22px",
                borderRadius: 4,
                textDecoration: "none",
                textTransform: "uppercase",
              }}
            >
              <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
            </a>
          </div>

          {/* H1 title */}
          <h1
            style={{ color: "#000000", fontFamily: FONT, fontSize: "clamp(2rem, 4vw, 2.55rem)",
              fontWeight: 700, lineHeight: 1.15, margin: "28px 0 10px" }}
          >
            <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
          </h1>

          {/* Body paragraphs */}
          {(paragraphs.length > 0 ? paragraphs : body ? [body] : []).map((p, i) => (
            <p
              key={i}
              style={{ color: "rgb(0,0,0)", fontFamily: FONT, fontSize: 15, lineHeight: 1.75,
                textAlign: "justify", margin: "0 0 16px" }}
            >
              {p}
            </p>
          ))}

          {/* Desktop CTA */}
          <a
            href={ctaHref}
            data-btn="primary"
            className="hidden md:inline-block"
            style={{
              marginTop: 8,
              display: "inline-block",
              backgroundColor: TEAL,
              color: "#fff",
              fontFamily: FONT,
              fontSize: 13,
              fontWeight: 600,
              letterSpacing: "0.1em",
              padding: "11px 30px",
              borderRadius: 4,
              textDecoration: "none",
              textTransform: "uppercase",
            }}
          >
            <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
          </a>
        </div>

        {/* Brands bar — dark strip #575757 */}
        {brands.length > 0 && (
          <div
            style={{
              marginTop: 60,
              backgroundColor: "rgb(87,87,87)",
              padding: "30px 24px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 48,
              flexWrap: "wrap",
            }}
          >
            {brands.map((b, i) => (
              b.logo ? (
                <Image
                  key={i}
                  src={b.logo}
                  alt={b.name}
                  width={120}
                  height={40}
                  className="object-contain"
                  style={{ opacity: 0.9, filter: "brightness(0) invert(1)", maxHeight: 40 }}
                  unoptimized={shouldSkipNextImageOptimization(b.logo)}
                />
              ) : (
                <span
                  key={i}
                  style={{
                    color: "rgba(255,255,255,0.85)",
                    fontFamily: FONT,
                    fontSize: 13,
                    fontWeight: 600,
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                  }}
                >
                  {b.name}
                </span>
              )
            ))}
          </div>
        )}
      </section>
    );
  }

  // hair-03: white bg, 2-col — portrait foto vlevo (rounded 28px + shadow) / founder story vpravo
  // about-hair-03-founder — Petra Studio
  // Reference: foto vlevo 421×530px, žádný border-radius, žádný shadow.
  // H2: 40px Helvetica weight 400 color #2f201a. Text: 16px weight 500 color #2b2b2b.
  // Žádný gold label.
  if (variant === "about-hair-03-founder") {
    const title      = String(content.title ?? "Petra Studio");
    const body       = String(content.body ?? "");
    const paragraphs = (content.paragraphs as string[]) ?? [];
    const image      = String(content.image ?? "");
    const DARK       = "#2f201a";
    const TEXT       = "#2b2b2b";
    const SANS       = "Helvetica, Arial, sans-serif";

    return (
      <section id="o-nas" style={{ backgroundColor: "#ffffff", padding: "88px 0" }} data-template="hair-03">
        <div style={{ maxWidth: 1300, margin: "0 auto", padding: "0 75px", display: "flex", alignItems: "flex-start", gap: 66 }}>
          {/* Foto vlevo — +10%: 463×583px, ostré rohy, žádný shadow */}
          {image && (
            <div style={{ flex: "0 0 auto", width: 463, height: 583, position: "relative", flexShrink: 0 }}>
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
                  sizes="463px"
                  unoptimized={shouldSkipNextImageOptimization(image)}
                />
              </GenericEditableImage>
            </div>
          )}

          {/* Text vpravo */}
          <div style={{ flex: 1, minWidth: 0, paddingTop: 18 }}>
            <GenericEditableText
              sectionId={sectionId}
              field="title"
              value={title}
              tag="h2"
              style={{ fontFamily: SANS, fontSize: 44, fontWeight: 400, color: DARK, lineHeight: 1.2, margin: "0 0 26px 0" }}
            />
            {body && (
              <GenericEditableText
                sectionId={sectionId}
                field="body"
                value={body}
                tag="p"
                style={{ fontFamily: SANS, fontSize: 18, fontWeight: 500, color: TEXT, lineHeight: 1.75, margin: "0 0 22px 0" }}
              />
            )}
            {paragraphs.map((p, i) => (
              <p key={`h3-ab-p-${i}`} style={{ fontFamily: SANS, fontSize: 18, fontWeight: 500, color: TEXT, lineHeight: 1.75, margin: "0 0 18px 0" }}>
                <GenericEditableText sectionId={sectionId} field={`paragraphs.${i}`} value={p} tag="span" />
              </p>
            ))}
          </div>
        </div>
      </section>
    );
  }

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
              data-btn="inverse"
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

  // About — peak-cut (aka barber-05) Brutalist Atelier White
  // Asymmetric 5/7 split: portrait image LEFT (3:4, BW filter that drops on hover) + content RIGHT.
  // Editorial: eyebrow mono, HUGE Oswald title, 2-paragraph body, stat block + ghost CTA.
  if (variant === "about-peak-cut-split") {
    const OSWALD = "var(--font-oswald), 'Oswald', 'Bebas Neue', Impact, sans-serif";
    const MONO   = "var(--font-overpass-mono), 'Overpass Mono', 'JetBrains Mono', Menlo, monospace";
    const OVERPASS = "var(--font-overpass), 'Overpass', 'Inter', system-ui, sans-serif";
    const INK    = "#0a0a0a";
    const cc = content as Record<string, unknown>;
    const eyebrowRaw  = cc.eyebrow;
    const titleRaw    = cc.title;
    const bodyRaw     = cc.body;
    const eyebrow  = eyebrowRaw === undefined ? "O nás" : String(eyebrowRaw);
    const titleStr = titleRaw   === undefined ? "Atelier ostrých přechodů." : String(titleRaw);
    const body     = bodyRaw    === undefined ? "Bouček Barbershop vznikl z vášně pro klasické pánské řemeslo a osobní přístup ke každému klientovi. Sídlíme v centru Vinohrady, pracujeme s prémiovými přípravky a každý zákazník dostane čas i péči, kterou si zaslouží.\n\nAť přijdete pro fade, holení nebo úpravu vousů — odejdete přesně tak, jak jste si představovali." : String(bodyRaw);
    const showHeader = !!(eyebrow.trim() || titleStr.trim() || body.trim());
    const image = String(cc.image ?? "");
    const imageAlt = String(cc.imageAlt ?? "Bouček Barbershop");
    const statNumber = String(cc.statNumber ?? "800+");
    const statLabel  = String(cc.statLabel  ?? "spokojených klientů");
    const ctaText = String(cc.ctaText ?? "Poznejte tým");
    const ctaHref = String(cc.ctaHref ?? "/o-nas");
    const resolvedCtaHref = tenantSlug && ctaHref.startsWith("/")
      ? `/demo/${tenantSlug}${isAdmin ? "/admin" : ""}${ctaHref}`
      : ctaHref;
    return (
      <section
        id="about"
        className="relative w-full overflow-hidden"
        style={{
          backgroundColor: "#ffffff",
          padding: "clamp(72px, 9vw, 128px) clamp(24px, 5vw, 64px)",
        }}
        data-template="peak-cut"
      >
        <div className="mx-auto" style={{ maxWidth: 1320 }}>
          <div className="pc-about-grid" style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 5fr) minmax(0, 7fr)",
            gap: "clamp(32px, 5vw, 80px)",
            alignItems: "stretch",
          }}>
            {/* LEFT — portrait image, BW that drops on hover */}
            {image && (
              <div className="pc-about-img-wrap" style={{
                position: "relative",
                aspectRatio: "3 / 4",
                overflow: "hidden",
                backgroundColor: "#0a0a0a",
              }}>
                <GenericEditableImage
                  sectionId={sectionId}
                  field="image"
                  src={image}
                  alt={imageAlt}
                  className="absolute inset-0 w-full h-full"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={image}
                    alt={imageAlt}
                    loading="lazy"
                    className="pc-about-img"
                    style={{
                      width: "100%", height: "100%", objectFit: "cover",
                      filter: "grayscale(100%) contrast(1.05)",
                      transition: "filter 0.55s cubic-bezier(.4,0,.2,1), transform 0.7s cubic-bezier(.4,0,.2,1)",
                    }}
                  />
                </GenericEditableImage>
              </div>
            )}

            {/* RIGHT — content */}
            <div className="pc-about-content" style={{ display: "flex", flexDirection: "column", justifyContent: "center", gap: 24 }}>
              {showHeader && (
                <>
                  {eyebrow.trim() && (
                    <span style={{
                      display: "inline-block",
                      fontFamily: MONO, fontSize: 11, letterSpacing: "0.24em",
                      textTransform: "uppercase", color: "rgba(10,10,10,0.55)",
                    }}>
                      <GenericEditableText sectionId={sectionId} field="eyebrow" value={eyebrow} tag="span" />
                    </span>
                  )}
                  {titleStr.trim() && (
                    <h2 style={{
                      margin: 0,
                      fontFamily: OSWALD,
                      fontWeight: 700,
                      fontSize: "clamp(36px, 5.5vw, 72px)",
                      lineHeight: 1.08,
                      letterSpacing: "0.01em",
                      textTransform: "uppercase",
                      color: INK,
                      maxWidth: "14ch",
                    }}>
                      <GenericEditableText sectionId={sectionId} field="title" value={titleStr} tag="span" />
                    </h2>
                  )}
                  {body.trim() && (
                    <p style={{
                      margin: 0,
                      fontFamily: OVERPASS, fontWeight: 400,
                      fontSize: "clamp(15px, 1.2vw, 17px)",
                      lineHeight: 1.7,
                      color: "rgba(10,10,10,0.78)",
                      whiteSpace: "pre-line",
                      maxWidth: 600,
                    }}>
                      <GenericEditableText sectionId={sectionId} field="body" value={body} tag="span" />
                    </p>
                  )}
                </>
              )}

              {/* Stat block + CTA — atelier ledger */}
              <div className="pc-about-foot" style={{
                marginTop: 16,
                display: "flex", flexWrap: "wrap",
                alignItems: "flex-end", justifyContent: "space-between",
                gap: 32,
                paddingTop: 24,
                borderTop: `1px solid ${INK}`,
              }}>
                <div style={{ display: "flex", alignItems: "baseline", gap: 16 }}>
                  <span style={{
                    fontFamily: OSWALD,
                    fontWeight: 700,
                    fontSize: "clamp(40px, 5vw, 64px)",
                    letterSpacing: "0.01em",
                    color: INK,
                    lineHeight: 1,
                  }}>
                    <GenericEditableText sectionId={sectionId} field="statNumber" value={statNumber} tag="span" />
                  </span>
                  <span style={{
                    fontFamily: OVERPASS,
                    fontWeight: 400,
                    fontSize: "clamp(13px, 1vw, 15px)",
                    color: "rgba(10,10,10,0.65)",
                    maxWidth: 180,
                    lineHeight: 1.4,
                  }}>
                    <GenericEditableText sectionId={sectionId} field="statLabel" value={statLabel} tag="span" />
                  </span>
                </div>

                {ctaText && (
                  <a
                    href={resolvedCtaHref}
                    className="pc-about-cta inline-flex items-center gap-3"
                    style={{
                      fontFamily: OSWALD,
                      fontSize: 12,
                      fontWeight: 600,
                      letterSpacing: "0.22em",
                      textTransform: "uppercase",
                      color: INK,
                      textDecoration: "none",
                      paddingBottom: 4,
                      borderBottom: `1px solid ${INK}`,
                      transition: "color 0.3s ease, border-color 0.3s ease",
                    }}
                  >
                    <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
                    <span aria-hidden="true" className="pc-about-cta-arrow" style={{ transition: "transform 0.3s ease" }}>→</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // About — barber-04 (Černý Fade): centered intro + 8-image strip carousel with numbered badge
  if (variant === "about-barber-04-strip") {
    const lead = String(content.lead ?? "");
    const images = ((content.images as Array<{ url?: string; alt?: string }>) ?? []).slice(0, 12);
    const showHeader = (content as Record<string, unknown>).showHeader !== false;
    const eyebrowNum = String((content as Record<string, unknown>).eyebrowNum ?? "02");
    const eyebrow = String((content as Record<string, unknown>).eyebrow ?? "O nás");
    return (
      <AboutBarber04Strip
        title={title}
        lead={lead}
        body={body}
        images={images}
        sectionId={sectionId}
        showHeader={showHeader}
        eyebrowNum={eyebrowNum}
        eyebrow={eyebrow}
      />
    );
  }

  // beauty-01: brands strip — cream bg, centered label + brand names in a row
  // Reference: selfbeauty.cz — Inter 200 uppercase label, brands horizontally
  // ── about-massage-01-therapist ───────────────────────────────────────────────
  // 2-col: portrait foto vlevo (40%) + content vpravo (60%), dark surface #141414
  // section-label → therapist-name → role (gold) → divider → bio → stats
  // Přesná replika .therapist-section z praha-masaze.cz originálu
  if (variant === "about-massage-01-therapist") {
    const tag     = String(content.tag    ?? "O mně");
    const name    = String(content.name   ?? "Demo Masér");
    const role    = String(content.role   ?? "Certifikovaný masér & terapeut");
    const bio1    = String(content.bio1   ?? "");
    const bio2    = String(content.bio2   ?? "");
    const image   = String(content.image  ?? "");
    const stats   = (content.stats as Array<{ number: string; label: string }>) ?? [];

    const SURFACE  = "#141414";
    const BORDER   = "#2A2520";
    const GOLD     = "#C9A962";
    const TEXT     = "#F5F0E8";
    const SECONDARY= "#A09888";
    const MUTED    = "#6A6058";
    const FONT     = "'Inter', sans-serif";
    const SERIF    = "'Cormorant Garamond', serif";

    return (
      <section
        id="terapeut"
        style={{ backgroundColor: SURFACE, padding: "100px 0" }}
        data-template="massage-01"
      >
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 80px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "480px 1fr", gap: 64, alignItems: "center" }}>
            {/* Foto vlevo — 560px výška, border overlay */}
            <div style={{ position: "relative", height: 560, overflow: "hidden", flexShrink: 0 }}>
              <GenericEditableImage sectionId={sectionId} field="image" src={image} alt={name} style={{ position: "absolute", inset: 0 }}>
                <Image src={image} alt={name} fill className="object-cover object-top" sizes="480px" unoptimized={shouldSkipNextImageOptimization(image)} />
              </GenericEditableImage>
              {/* Border overlay */}
              <div aria-hidden style={{ position: "absolute", inset: 0, border: `1px solid ${BORDER}`, pointerEvents: "none" }} />
            </div>

            {/* Content vpravo */}
            <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
              {/* Section label */}
              <p style={{ display: "inline-flex", alignItems: "center", gap: 8, color: GOLD, fontFamily: FONT, fontSize: 11, fontWeight: 500, letterSpacing: 3, textTransform: "uppercase", margin: 0 }}>
                <span style={{ display: "inline-block", width: 6, height: 6, background: GOLD, borderRadius: "50%" }} />
                <GenericEditableText sectionId={sectionId} field="tag" value={tag} tag="span" />
              </p>
              {/* Jméno */}
              <h2 style={{ fontFamily: SERIF, fontSize: 44, fontWeight: 400, color: TEXT, lineHeight: 1.1, margin: 0 }}>
                <GenericEditableText sectionId={sectionId} field="name" value={name} tag="span" />
              </h2>
              {/* Role — gold */}
              <p style={{ fontFamily: FONT, fontSize: 15, color: GOLD, margin: 0 }}>
                <GenericEditableText sectionId={sectionId} field="role" value={role} tag="span" />
              </p>
              {/* Divider — 60px gold-dim */}
              <div style={{ width: 60, height: 1, background: BORDER }} />
              {/* Bio */}
              {bio1 && (
                <p style={{ fontFamily: FONT, fontSize: 15, fontWeight: 300, color: SECONDARY, lineHeight: 1.75, margin: 0 }}>
                  <GenericEditableText sectionId={sectionId} field="bio1" value={bio1} tag="span" />
                </p>
              )}
              {bio2 && (
                <p style={{ fontFamily: FONT, fontSize: 15, fontWeight: 300, color: SECONDARY, lineHeight: 1.75, margin: 0 }}>
                  <GenericEditableText sectionId={sectionId} field="bio2" value={bio2} tag="span" />
                </p>
              )}
              {/* Stats — count-up při scrollu do view */}
              {stats.length > 0 && (
                <Massage01Stats stats={stats} sectionId={sectionId} />
              )}
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (variant === "about-beauty-01-brands") {
    // beauty-01 — Sand-Cream Editorial Wellness brands row
    // Eyebrow mono label + Fahkwang italic subtitle + brand row with sand dot separators.
    // Conditional header (subpage compat). Hover: brand name color shift to sand.
    const cc = content as Record<string, unknown>;
    const eyebrowRaw  = cc.eyebrow;
    const subtitleRaw = cc.subtitle;
    const eyebrow  = eyebrowRaw  === undefined ? "Prestige produkty" : String(eyebrowRaw);
    const subtitle = subtitleRaw === undefined ? "Pracujeme jen se značkami, kterým samy věříme." : String(subtitleRaw);
    const showHeader = !!(eyebrow.trim() || subtitle.trim());
    const items = (cc.items as Array<{ name: string }>) ?? [];
    const CREAM  = "#FFF8F1";
    const ACCENT = "#E0BE9A";
    const DARK   = "#1F1F1F";
    const MUTED  = "#5B4D43";
    const FONT   = "'Fahkwang', serif";
    const MONO   = "var(--font-overpass-mono), 'Overpass Mono', Menlo, monospace";
    return (
      <section
        style={{
          backgroundColor: CREAM,
          padding: "clamp(64px, 8vw, 96px) clamp(24px, 5vw, 64px)",
          borderTop: "1px solid rgba(224,190,154,0.3)",
          borderBottom: "1px solid rgba(224,190,154,0.3)",
        }}
        data-template="beauty-01"
      >
        <div style={{ maxWidth: 1200, margin: "0 auto", textAlign: "center" }}>
          {showHeader && (
            <>
              {eyebrow.trim() && (
                <span style={{
                  display: "inline-block",
                  fontFamily: MONO,
                  fontSize: 11,
                  letterSpacing: "0.28em",
                  color: MUTED,
                  textTransform: "uppercase",
                  marginBottom: 18,
                }}>
                  <GenericEditableText sectionId={sectionId} field="eyebrow" value={eyebrow} tag="span" />
                </span>
              )}
              {subtitle.trim() && (
                <p style={{
                  fontFamily: FONT,
                  fontStyle: "italic",
                  fontSize: "clamp(20px, 2.2vw, 28px)",
                  fontWeight: 400,
                  color: DARK,
                  margin: "0 auto",
                  maxWidth: 720,
                  letterSpacing: "0.01em",
                }}>
                  <GenericEditableText sectionId={sectionId} field="subtitle" value={subtitle} tag="span" />
                </p>
              )}
              <span aria-hidden="true" style={{
                display: "block",
                width: 48, height: 1,
                backgroundColor: ACCENT,
                margin: "32px auto 40px",
              }} />
            </>
          )}
          {/* Brand names — horizontal row, sand dot separators */}
          {items.length > 0 && (
            <div className="b01-brands-row" style={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              justifyContent: "center",
              gap: "16px 0",
            }}>
              {items.map((b, i) => (
                <div key={`brand-${i}`} style={{ display: "flex", alignItems: "center" }}>
                  <span
                    className="b01-brand-name"
                    style={{
                      fontFamily: FONT,
                      fontSize: "clamp(14px, 1.4vw, 17px)",
                      fontWeight: 400,
                      color: DARK,
                      letterSpacing: "0.18em",
                      textTransform: "uppercase",
                      whiteSpace: "nowrap",
                      padding: "0 28px",
                      transition: "color 0.3s ease",
                    }}
                  >
                    <GenericEditableText sectionId={sectionId} field={`items.${i}.name`} value={b.name} tag="span" />
                  </span>
                  {i < items.length - 1 && (
                    <span
                      aria-hidden="true"
                      style={{ display: "inline-block", width: 5, height: 5, borderRadius: "50%", backgroundColor: ACCENT, flexShrink: 0 }}
                    />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    );
  }

  // beauty-01: features / "Proč nás" — Sand-Cream Editorial Wellness
  // Magazine header (eyebrow + Fahkwang title + subtitle) + 4-col card grid, sand SVG ikony,
  // hover karta = paper bg lift + icon scale.
  if (variant === "about-beauty-01-features") {
    const cc = content as Record<string, unknown>;
    const eyebrowRaw  = cc.eyebrow;
    const titleRaw    = cc.title;
    const subtitleRaw = cc.subtitle;
    const eyebrow  = eyebrowRaw  === undefined ? "Proč Atelier Lumina" : String(eyebrowRaw);
    const titleStr = titleRaw    === undefined ? "Studio postavené na tom,\njak se chcete cítit." : String(titleRaw);
    const subtitle = subtitleRaw === undefined ? "" : String(subtitleRaw);
    const showHeader = !!(eyebrow.trim() || titleStr.trim() || subtitle.trim());
    const items    = (cc.items as Array<{ title: string; description: string }>) ?? [];
    const CREAM2   = "#F5EDE4";
    const DARK     = "#1F1F1F";
    const MUTED    = "#5B4D43";
    const SAND     = "#E0BE9A";
    const FONT     = "'Fahkwang', Georgia, serif";
    const SANS     = "var(--font-overpass), 'Overpass', Inter, system-ui, sans-serif";
    const MONO     = "var(--font-overpass-mono), 'Overpass Mono', Menlo, monospace";

    // Jednoduché SVG ikonky (4 různé — lidé, hvězda, list, hodinky)
    const icons = [
      // All in one place
      <svg key="i0" width="44" height="44" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
        <circle cx="27" cy="24" r="12" stroke={SAND} strokeWidth="2.5" fill="none"/>
        <path d="M8 68c0-10.5 8.6-19 19-19h0c10.5 0 19 8.5 19 19" stroke={SAND} strokeWidth="2.5" strokeLinecap="round" fill="none"/>
        <circle cx="53" cy="24" r="12" stroke={SAND} strokeWidth="2.5" fill="none"/>
        <path d="M34 68c0-10.5 8.6-19 19-19h0c10.5 0 19 8.5 19 19" stroke={SAND} strokeWidth="2.5" strokeLinecap="round" fill="none"/>
      </svg>,
      // Expert
      <svg key="i1" width="44" height="44" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
        <circle cx="40" cy="28" r="16" stroke={SAND} strokeWidth="2.5" fill="none"/>
        <path d="M24 52c0-8.8 7.2-16 16-16s16 7.2 16 16v4H24v-4z" stroke={SAND} strokeWidth="2.5" fill="none"/>
        <path d="M30 68l5-8h10l5 8" stroke={SAND} strokeWidth="2.5" strokeLinecap="round" fill="none"/>
      </svg>,
      // Premium products
      <svg key="i2" width="44" height="44" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
        <rect x="16" y="28" width="48" height="36" rx="3" stroke={SAND} strokeWidth="2.5" fill="none"/>
        <path d="M28 28V20a12 12 0 0 1 24 0v8" stroke={SAND} strokeWidth="2.5" strokeLinecap="round" fill="none"/>
        <circle cx="40" cy="46" r="5" stroke={SAND} strokeWidth="2" fill="none"/>
      </svg>,
      // Atmosphere
      <svg key="i3" width="44" height="44" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
        <circle cx="40" cy="40" r="24" stroke={SAND} strokeWidth="2.5" fill="none"/>
        <path d="M40 20v20l12 8" stroke={SAND} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      </svg>,
    ];

    return (
      <section
        id="proc-nas"
        style={{
          backgroundColor: CREAM2,
          padding: "clamp(72px, 9vw, 128px) clamp(24px, 5vw, 64px)",
        }}
        data-template="beauty-01"
      >
        <div style={{ maxWidth: 1320, margin: "0 auto" }}>
          {showHeader && (
            <div className="b01-feat-head" style={{
              textAlign: "center",
              marginBottom: "clamp(48px, 6vw, 72px)",
            }}>
              {eyebrow.trim() && (
                <span style={{
                  display: "inline-block",
                  fontFamily: MONO, fontSize: 11, letterSpacing: "0.28em",
                  textTransform: "uppercase", color: MUTED,
                  marginBottom: 18,
                }}>
                  <GenericEditableText sectionId={sectionId} field="eyebrow" value={eyebrow} tag="span" />
                </span>
              )}
              {titleStr.trim() && (
                <h2 style={{
                  margin: "0 auto",
                  fontFamily: FONT, fontWeight: 500,
                  fontSize: "clamp(28px, 4vw, 52px)",
                  lineHeight: 1.15,
                  letterSpacing: "0.01em",
                  color: DARK,
                  whiteSpace: "pre-line",
                  maxWidth: "20ch",
                }}>
                  <GenericEditableText sectionId={sectionId} field="title" value={titleStr} tag="span" />
                </h2>
              )}
              {subtitle.trim() && (
                <p style={{
                  margin: "18px auto 0",
                  fontFamily: SANS, fontWeight: 300,
                  fontSize: "clamp(14px, 1.2vw, 17px)",
                  lineHeight: 1.65,
                  color: MUTED,
                  maxWidth: 560,
                }}>
                  <GenericEditableText sectionId={sectionId} field="subtitle" value={subtitle} tag="span" />
                </p>
              )}
            </div>
          )}

          {/* 4-col grid */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))",
            gap: "clamp(24px, 3vw, 40px)",
          }}>
            {items.map((item, i) => (
              <article
                key={`feat-${i}`}
                className="b01-feat-card"
                style={{
                  textAlign: "center",
                  padding: "clamp(28px, 3vw, 40px) clamp(20px, 2vw, 28px)",
                  backgroundColor: "#FFF8F1",
                  border: "1px solid rgba(224,190,154,0.3)",
                  transition: "border-color 0.3s ease, transform 0.3s ease, box-shadow 0.3s ease",
                }}
              >
                <div className="b01-feat-icon" style={{
                  display: "flex", justifyContent: "center", marginBottom: 20,
                  transition: "transform 0.4s cubic-bezier(.4,0,.2,1)",
                }}>
                  {icons[i % icons.length]}
                </div>
                <div style={{ width: 32, height: 1, backgroundColor: SAND, margin: "0 auto 18px" }} aria-hidden />
                <h3 style={{
                  margin: "0 0 12px",
                  fontFamily: FONT, fontSize: "clamp(18px, 1.6vw, 22px)", fontWeight: 500,
                  color: DARK, lineHeight: 1.25,
                  letterSpacing: "0.01em",
                }}>
                  <GenericEditableText sectionId={sectionId} field={`items.${i}.title`} value={item.title} tag="span" />
                </h3>
                <p style={{
                  margin: 0,
                  fontFamily: SANS, fontWeight: 400,
                  fontSize: 14, lineHeight: 1.65,
                  color: MUTED,
                }}>
                  <GenericEditableText sectionId={sectionId} field={`items.${i}.description`} value={item.description} tag="span" />
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // About — luxury barber (barber-02): lead italic + body left, photo right, cream bg
  if (variant === "about-barber-luxury") {
    const lead = String(content.lead ?? "");
    const eyebrow = String((content as Record<string, unknown>).eyebrow ?? "");
    const established = String((content as Record<string, unknown>).established ?? "");
    const textRef = useRef<HTMLDivElement>(null);
    const imgRef  = useRef<HTMLDivElement>(null);
    useEffect(() => {
      const els = [textRef.current, imgRef.current].filter(Boolean) as HTMLElement[];
      const obs = els.map((el, i) => {
        const o = new IntersectionObserver(([e]) => { if (e.isIntersecting) { el.style.animationDelay = `${i * 0.18}s`; el.classList.add("b02a-vis"); o.disconnect(); } }, { threshold: 0.1 });
        o.observe(el); return o;
      });
      return () => obs.forEach(o => o.disconnect());
    }, []);
    return (
      <section
        style={{
          padding: "clamp(80px,12vw,140px) clamp(20px,5vw,40px)",
          backgroundColor: "#f9f7f5",
          position: "relative",
          overflow: "hidden",
        }}
        data-template="barber-02"
      >
        {/* Subtle background ornament — single circle gold ring top-right (editorial detail) */}
        <div aria-hidden style={{
          position: "absolute", top: "8%", right: "-120px",
          width: 360, height: 360, borderRadius: "50%",
          border: "1px solid rgba(212,169,110,0.12)",
          zIndex: 0,
        }} />
        <div aria-hidden style={{
          position: "absolute", bottom: "10%", left: "-80px",
          width: 200, height: 200, borderRadius: "50%",
          border: "1px solid rgba(212,169,110,0.10)",
          zIndex: 0,
        }} />

        <div
          className="grid grid-cols-1 md:grid-cols-[1.05fr_1fr] items-center b02-about-grid"
          style={{ maxWidth: 1180, margin: "0 auto", gap: "clamp(40px,7vw,96px)", position: "relative", zIndex: 1 }}
        >
          {/* Text column */}
          <div ref={textRef} className="b02-about-text b02a-reveal">
            {eyebrow && (
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
                  <GenericEditableText sectionId={sectionId} field="eyebrow" value={eyebrow} tag="span" />
                </span>
              </div>
            )}

            {title && (
              <h2 style={{
                fontFamily: "'Libre Baskerville', Georgia, serif",
                fontSize: "clamp(2rem, 4vw, 3rem)",
                fontWeight: 700,
                lineHeight: 1.15,
                letterSpacing: "0.01em",
                color: "#1a1a1a",
                margin: "0 0 28px",
              }}>
                <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
              </h2>
            )}

            {lead && (
              <p style={{
                fontFamily: "'Libre Baskerville', Georgia, serif",
                fontStyle: "italic",
                fontSize: "clamp(1.1rem, 1.6vw, 1.32rem)",
                color: "#9a7a50",
                lineHeight: 1.7,
                marginBottom: 24,
                paddingLeft: 18,
                borderLeft: "2px solid #d4a96e",
              }}>
                <GenericEditableText sectionId={sectionId} field="lead" value={lead} tag="span" />
              </p>
            )}

            {body && (
              <p style={{
                fontFamily: "'Source Sans Pro', system-ui, sans-serif",
                fontSize: "1.02rem",
                fontWeight: 300,
                color: "#444",
                lineHeight: 1.85,
                marginBottom: 28,
              }}>
                <GenericEditableText sectionId={sectionId} field="body" value={body} tag="span" />
              </p>
            )}

            {/* Signature-style divider — slim gold rule + dot */}
            <div aria-hidden style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 32 }}>
              <span style={{ width: 48, height: 1, backgroundColor: "rgba(212,169,110,0.5)" }} />
              <span style={{ width: 5, height: 5, borderRadius: "50%", backgroundColor: "#d4a96e" }} />
            </div>
          </div>

          {/* Image column with refined frame */}
          {image && (
            <div ref={imgRef} className="b02-about-img-wrap b02a-reveal relative w-full">
              {/* Editorial corner accent — single TL corner, warm gold */}
              <span aria-hidden style={{
                position: "absolute", top: -14, left: -14, width: 56, height: 56,
                borderTop: "1px solid #d4a96e", borderLeft: "1px solid #d4a96e",
                zIndex: 3, pointerEvents: "none",
              }} />
              <span aria-hidden style={{
                position: "absolute", bottom: -14, right: -14, width: 56, height: 56,
                borderBottom: "1px solid #d4a96e", borderRight: "1px solid #d4a96e",
                zIndex: 3, pointerEvents: "none",
              }} />

              <div className="b02-about-img" style={{
                position: "relative",
                overflow: "hidden",
                borderRadius: 2,
                aspectRatio: "4 / 5",
                boxShadow: "0 30px 60px rgba(26,20,16,0.18), 0 8px 24px rgba(26,20,16,0.08)",
              }}>
                <GenericEditableImage
                  sectionId={sectionId}
                  field="image"
                  src={image}
                  alt={title || "Atelier"}
                  className="absolute inset-0 w-full h-full"
                >
                  <Image
                    src={image}
                    alt={title || "Atelier"}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 50vw"
                    unoptimized={shouldSkipNextImageOptimization(image)}
                  />
                </GenericEditableImage>
              </div>

              {/* Established badge — bottom-left overlay */}
              {established && (
                <div style={{
                  position: "absolute", bottom: -28, left: -28, zIndex: 4,
                  backgroundColor: "#ffffff",
                  padding: "18px 26px",
                  border: "1px solid rgba(212,169,110,0.35)",
                  boxShadow: "0 16px 40px rgba(26,20,16,0.15)",
                  textAlign: "center",
                }}>
                  <p style={{
                    margin: 0,
                    fontFamily: "'Source Sans Pro', system-ui, sans-serif",
                    fontSize: 10,
                    fontWeight: 700,
                    letterSpacing: "0.28em",
                    textTransform: "uppercase",
                    color: "#d4a96e",
                    marginBottom: 4,
                  }}><GenericEditableText sectionId={sectionId} field="establishedLabel" value={String((content as Record<string, unknown>).establishedLabel ?? "Atelier od")} tag="span" /></p>
                  <p style={{
                    margin: 0,
                    fontFamily: "'Libre Baskerville', Georgia, serif",
                    fontSize: "1.4rem",
                    fontWeight: 700,
                    color: "#1a1a1a",
                  }}>
                    <GenericEditableText sectionId={sectionId} field="established" value={established} tag="span" />
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    );
  }

  // Two-column layout (wellness)
  if (variant === "ortho-02-about") return <AboutOrtho02 content={content} sectionId={sectionId} />;
  if (variant === "stavba-01-about") return <AboutStavba01 content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;
  if (variant === "instala-01-about") return <AboutInstala01 content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;
  if (variant === "stavba-02-about") return <AboutStavba02 content={content} sectionId={sectionId} />;
  if (variant === "stavba-03-about") return <AboutStavba03 content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;
  if (variant === "autoservis-01-about")  return <AboutAutoservis01 content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;
  if (variant === "autoservis-02-about") return <AboutAutoservis02 content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;
  if (variant === "autoservis-03-about-story") return <AboutAutoservis03Story content={content} sectionId={sectionId} />;
  if (variant === "autoservis-03-about") return <AboutAutoservis03 content={content} sectionId={sectionId} />;
  if (variant === "catering-01-about") return <AboutCatering01 content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;
  if (variant === "autoskola-01-about") return <AboutAutoskola01 content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;
  if (variant === "kids-01-about")  return <AboutKids01  content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;
  if (variant === "edu-01-about")   return <AboutEdu01   content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;
  if (variant === "vet-01-about")      return <AboutVet01      content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;
  if (variant === "grooming-01-about") return <AboutGrooming01 content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;
  if (variant === "pethotel-01-about") return <AboutPethotel01 content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;
  if (variant === "arch-01-about")     return <AboutArch01     content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;
  if (variant === "ucetni-01-about")   return <AboutUcetni01   content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;
  if (variant === "ucetni-02-about")   return <AboutUcetni02   content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;
  if (variant === "ucetni-03-about")   return <AboutUcetni03   content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;
  if (variant === "ucetni-04-about")   return <AboutUcetni04   content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;
  if (variant === "instala-02-about")  return <AboutInstala02  content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;
  if (variant === "clean-01-about")    return <AboutClean01    content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;
  if (variant === "klima-01-about")    return <AboutKlima01    content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;
  if (variant === "solar-03-about")    return <AboutSolar03    content={content} sectionId={sectionId} />;
  if (variant === "solar-02-about")    return <AboutSolar02    content={content} sectionId={sectionId} isAdmin={isAdmin} />;
  if (variant === "klempir-01-about")  return <AboutKlempir01  content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;
  if (variant === "malir-01-about")    return <AboutMalir01    content={content} sectionId={sectionId} isAdmin={isAdmin} />;
  if (variant === "malir-02-about")    return <AboutMalir02    content={content} sectionId={sectionId} isAdmin={isAdmin} />;
  if (variant === "garden-01-about")  return <AboutGarden01   content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;
  if (variant === "clean-02-about")   return <AboutClean02    content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;
  if (variant === "garden-02-about")  return <AboutGarden02   content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;
  if (variant === "arbo-01-about")    return <AboutArbo01     content={content} sectionId={sectionId} />;
  if (variant === "ddd-01-about")     return <AboutDdd01      content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;
  if (variant === "hotel-01-about")   return <AboutHotel01    content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;
  if (variant === "hotel-02-about")   return <AboutHotel02    content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;
  if (variant === "chalet-01-about")  return <AboutChalet01   content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;
  if (variant === "photo-01-about")   return <AboutPhoto01    content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;
  if (variant === "events-01-process") return <ProcessEvents01 content={content} sectionId={sectionId} />;
  if (variant === "dj-01-about")       return <AboutDj01       content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;
  if (variant === "video-01-about")    return <AboutVideo01    content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;
  if (variant === "restaurant-04-about") return <AboutRestaurant04 content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;

  if (variant === "about-barber-03-luxury") {
    // Barber-03 "Barbery" — warm cinematic urban (image left + dark moody story right)
    const lead      = String(content.lead     ?? "");
    const eyebrow   = String((content as Record<string, unknown>).eyebrow   ?? "");
    const yearLabel = String((content as Record<string, unknown>).yearLabel ?? "");
    const yearValue = String((content as Record<string, unknown>).yearValue ?? "");
    const imgRef  = useRef<HTMLDivElement>(null);
    const textRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
      const els = [imgRef.current, textRef.current].filter(Boolean) as HTMLElement[];
      const obs = els.map((el, i) => {
        const o = new IntersectionObserver(([e]) => { if (e.isIntersecting) { el.style.animationDelay = `${i * 0.18}s`; el.classList.add("b03a-vis"); o.disconnect(); } }, { threshold: 0.1 });
        o.observe(el); return o;
      });
      return () => obs.forEach(o => o.disconnect());
    }, []);
    return (
      <section
        style={{
          padding: "clamp(96px, 13vw, 150px) clamp(20px, 5vw, 40px)",
          backgroundColor: "#1c1410",
          position: "relative",
          overflow: "hidden",
        }}
        data-template="barber-03"
      >
        {/* Top + bottom decorative gold hairlines */}
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

        {/* Warm radial glow accent */}
        <div aria-hidden style={{
          position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0,
          background: "radial-gradient(ellipse at 80% 30%, rgba(200,169,110,0.06) 0%, transparent 60%)",
        }} />

        <div
          className="grid grid-cols-1 md:grid-cols-[1fr_1.05fr] items-center b03a-grid"
          style={{ maxWidth: 1200, margin: "0 auto", gap: "clamp(40px, 7vw, 96px)", position: "relative", zIndex: 1 }}
        >
          {/* IMAGE LEFT — cinematic moody portrait */}
          {image && (
            <div ref={imgRef} className="b03a-reveal b03a-img-wrap relative w-full">
              {/* 4 expanding gold corner brackets (diagonal accents) */}
              <span aria-hidden className="b03a-corner b03a-corner-tl" style={{
                position: "absolute", top: -12, left: -12, width: 48, height: 48, zIndex: 3,
                borderTop: "1px solid #c8a96e", borderLeft: "1px solid #c8a96e",
                transition: "all 0.45s cubic-bezier(.22,.68,0,1.1)",
              }} />
              <span aria-hidden className="b03a-corner b03a-corner-br" style={{
                position: "absolute", bottom: -12, right: -12, width: 48, height: 48, zIndex: 3,
                borderBottom: "1px solid #c8a96e", borderRight: "1px solid #c8a96e",
                transition: "all 0.45s cubic-bezier(.22,.68,0,1.1)",
              }} />

              <div className="b03a-img" style={{
                position: "relative",
                overflow: "hidden",
                borderRadius: 2,
                aspectRatio: "4 / 5",
                boxShadow: "0 30px 60px rgba(0,0,0,0.5), 0 8px 24px rgba(0,0,0,0.35)",
              }}>
                <GenericEditableImage
                  sectionId={sectionId}
                  field="image"
                  src={image}
                  alt={title || "Studio"}
                  className="absolute inset-0 w-full h-full"
                >
                  <Image
                    src={image}
                    alt={title || "Studio"}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 50vw"
                    unoptimized={shouldSkipNextImageOptimization(image)}
                  />
                </GenericEditableImage>
                {/* Subtle warm overlay for cinematic mood */}
                <div aria-hidden style={{
                  position: "absolute", inset: 0,
                  background: "linear-gradient(180deg, rgba(28,20,16,0.1) 0%, rgba(28,20,16,0.35) 100%)",
                  pointerEvents: "none",
                }} />
              </div>

              {/* Year badge — warm dark overlapping bottom-left */}
              {yearValue && (
                <div style={{
                  position: "absolute", bottom: -28, left: -28, zIndex: 4,
                  backgroundColor: "#1c1410",
                  padding: "20px 28px",
                  border: "1px solid rgba(200,169,110,0.4)",
                  boxShadow: "0 16px 40px rgba(0,0,0,0.55)",
                  textAlign: "center",
                }}>
                  <p style={{
                    margin: 0,
                    fontFamily: "'Source Sans Pro', system-ui, sans-serif",
                    fontSize: 10,
                    fontWeight: 700,
                    letterSpacing: "0.32em",
                    textTransform: "uppercase",
                    color: "#c8a96e",
                    marginBottom: 4,
                  }}>
                    {yearLabel ? (
                      <GenericEditableText sectionId={sectionId} field="yearLabel" value={yearLabel} tag="span" />
                    ) : "Otevřeno"}
                  </p>
                  <p style={{
                    margin: 0,
                    fontFamily: "'Libre Baskerville', Georgia, serif",
                    fontSize: "1.6rem",
                    fontWeight: 700,
                    color: "#f5efe6",
                    letterSpacing: "0.04em",
                  }}>
                    <GenericEditableText sectionId={sectionId} field="yearValue" value={yearValue} tag="span" />
                  </p>
                </div>
              )}
            </div>
          )}

          {/* TEXT RIGHT — narrative + values */}
          <div ref={textRef} className="b03a-reveal">
            {eyebrow && (
              <div style={{ display: "inline-flex", alignItems: "center", gap: 12, marginBottom: 22 }}>
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
              </div>
            )}

            {title && (
              <h2 style={{
                fontFamily: "'Libre Baskerville', Georgia, serif",
                fontSize: "clamp(2rem, 4vw, 3rem)",
                fontWeight: 700,
                lineHeight: 1.12,
                letterSpacing: "0.04em",
                color: "#f5efe6",
                textTransform: "uppercase",
                margin: "0 0 30px",
              }}>
                <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
              </h2>
            )}

            {lead && (
              <p style={{
                fontFamily: "'Libre Baskerville', Georgia, serif",
                fontStyle: "italic",
                fontSize: "clamp(1.1rem, 1.6vw, 1.32rem)",
                color: "#c8a96e",
                lineHeight: 1.7,
                marginBottom: 28,
                paddingLeft: 20,
                borderLeft: "2px solid #c8a96e",
              }}>
                <GenericEditableText sectionId={sectionId} field="lead" value={lead} tag="span" />
              </p>
            )}

            {body && (
              <p style={{
                fontFamily: "'Source Sans Pro', system-ui, sans-serif",
                fontSize: "1.02rem",
                fontWeight: 300,
                color: "rgba(245,239,230,0.78)",
                lineHeight: 1.85,
                marginBottom: 28,
              }}>
                <GenericEditableText sectionId={sectionId} field="body" value={body} tag="span" />
              </p>
            )}

            {/* Signature divider */}
            <div aria-hidden style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 32 }}>
              <span style={{ width: 56, height: 1, backgroundColor: "rgba(200,169,110,0.6)" }} />
              <span style={{ width: 6, height: 6, backgroundColor: "#c8a96e", transform: "rotate(45deg)" }} />
              <span style={{ width: 56, height: 1, backgroundColor: "rgba(200,169,110,0.6)" }} />
            </div>

            {/* Values — inline grid pod signature */}
            {values.length > 0 && (
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
                gap: 20,
                marginTop: 40,
                paddingTop: 32,
                borderTop: "1px solid rgba(200,169,110,0.18)",
              }}>
                {values.map((v, i) => (
                  <div key={i} className="b03a-value">
                    {v.icon && <span style={{ fontSize: "1.5rem", color: "#c8a96e", display: "block", marginBottom: 10, transition: "transform 0.4s cubic-bezier(.22,.68,0,1.1)" }}>{v.icon}</span>}
                    <p style={{
                      fontFamily: "'Source Sans Pro', system-ui, sans-serif",
                      fontSize: "0.8rem",
                      fontWeight: 700,
                      letterSpacing: "0.2em",
                      textTransform: "uppercase",
                      color: "#f5efe6",
                      margin: "0 0 6px",
                    }}>
                      <GenericEditableText sectionId={sectionId} field={`values.${i}.title`} value={v.title} tag="span" />
                    </p>
                    <p style={{
                      fontFamily: "'Source Sans Pro', system-ui, sans-serif",
                      fontSize: "0.86rem",
                      color: "rgba(245,239,230,0.62)",
                      margin: 0,
                      lineHeight: 1.55,
                    }}>
                      <GenericEditableText sectionId={sectionId} field={`values.${i}.text`} value={v.text} tag="span" />
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <style>{`
          @media (max-width: 768px) { [data-template="barber-03"] .b03a-grid { grid-template-columns: 1fr !important; } }
        `}</style>
      </section>
    );
  }

  if (variant === "barber-dark") {
    const eyebrow  = String((content as Record<string, unknown>).eyebrow  ?? "Náš příběh");
    const highlight = String((content as Record<string, unknown>).highlight ?? "");
    return (
      <section style={{ backgroundColor: "#0a0a0a", padding: "clamp(80px, 12vh, 130px) 24px", position: "relative", overflow: "hidden" }} data-template="barber-01">
        {/* Decorative ornament */}
        <div aria-hidden style={{
          position: "absolute", top: 80, left: -80, width: 280, height: 280, opacity: 0.025, zIndex: 0,
          backgroundImage: "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23C9A84C' stroke-width='1' stroke-linecap='round' stroke-linejoin='round'><circle cx='6' cy='6' r='3'/><circle cx='6' cy='18' r='3'/><line x1='20' y1='4' x2='8.12' y2='15.88'/><line x1='14.47' y1='14.48' x2='20' y2='20'/><line x1='8.12' y1='8.12' x2='12' y2='12'/></svg>\")",
          backgroundSize: "contain", backgroundRepeat: "no-repeat", transform: "rotate(15deg)",
        }} />

        <div style={{ maxWidth: 1200, margin: "0 auto", position: "relative", zIndex: 1 }}>
          <div style={{ display: "grid", gridTemplateColumns: image ? "1fr 1fr" : "1fr", gap: "clamp(40px, 6vw, 88px)", alignItems: "center" }} className="bc-about-grid">
            {/* Image — ResizableImage lets the admin drag corners to resize */}
            {image && (
              <ResizableImage
                sectionId={sectionId}
                field="image"
                src={image}
                alt={title}
                fallbackWidth={480}
                fallbackHeight={600}
                style={{ borderRadius: 2 }}
                aspectLock={false}
              >
                {/* Gold corner brackets — positioned relative to ResizableImage box */}
                <span aria-hidden style={{ position: "absolute", top: -10, left: -10, width: 36, height: 36, borderTop: "1px solid #C9A84C", borderLeft: "1px solid #C9A84C", zIndex: 2, pointerEvents: "none" }} />
                <span aria-hidden style={{ position: "absolute", bottom: -10, right: -10, width: 36, height: 36, borderBottom: "1px solid #C9A84C", borderRight: "1px solid #C9A84C", zIndex: 2, pointerEvents: "none" }} />
                <GenericEditableImage
                  sectionId={sectionId}
                  field="image"
                  src={image}
                  alt={title}
                  className="bc-about-image overflow-hidden"
                  style={{ width: "100%", height: "100%", borderRadius: 2 }}
                >
                  <Image src={image} alt={title} fill className="object-cover" sizes="(max-width: 768px) 100vw, 50vw" unoptimized={shouldSkipNextImageOptimization(image)} />
                </GenericEditableImage>
                {/* Badge */}
                <div style={{
                  position: "absolute", bottom: 24, left: 24, zIndex: 3,
                  backgroundColor: "rgba(10,10,10,0.85)", backdropFilter: "blur(8px)",
                  border: "1px solid rgba(201,168,76,0.4)",
                  padding: "14px 20px", borderRadius: 2,
                  pointerEvents: "none",
                }}>
                  <p style={{ margin: 0, fontFamily: "var(--font-heading)", fontSize: 10, fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase", color: "#C9A84C" }}><GenericEditableText sectionId={sectionId} field="badgeYear" value={String(content.badgeYear ?? "Est. 2018")} tag="span" /></p>
                  <p style={{ margin: "4px 0 0", fontFamily: "var(--font-body)", fontSize: "0.78rem", color: "rgba(245,245,245,0.65)" }}><GenericEditableText sectionId={sectionId} field="badgeLocation" value={String(content.badgeLocation ?? "Brno, Česká republika")} tag="span" /></p>
                </div>
              </ResizableImage>
            )}

            {/* Content */}
            <div>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 14, marginBottom: 22 }}>
                <span aria-hidden style={{ width: 36, height: 1, background: "#C9A84C" }} />
                <GenericEditableText sectionId={sectionId} field="eyebrow" value={eyebrow} tag="span" className="services-eyebrow" />
              </div>
              <h2 className="services-title" style={{ fontFamily: "var(--font-heading)", fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 700, color: "#F5F5F5", margin: "0 0 28px", letterSpacing: "-0.01em", lineHeight: 1.08 }}>
                <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
              </h2>
              {body && (
                <p style={{ color: "rgba(245,245,245,0.72)", fontSize: "1rem", lineHeight: 1.7, marginBottom: 24, fontWeight: 300 }}>
                  <GenericEditableText sectionId={sectionId} field="body" value={body} tag="span" />
                </p>
              )}
              {highlight && (
                <div style={{ borderLeft: "2px solid #C9A84C", paddingLeft: 20, marginTop: 28 }}>
                  <p style={{ fontFamily: "var(--font-heading)", fontStyle: "italic", color: "#F5F5F5", fontSize: "1.05rem", lineHeight: 1.6, margin: 0 }}>
                    <GenericEditableText sectionId={sectionId} field="highlight" value={highlight} tag="span" />
                  </p>
                </div>
              )}

              {/* Values as inline icons */}
              {values.length > 0 && (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 20, marginTop: 40, paddingTop: 32, borderTop: "1px solid rgba(201,168,76,0.18)" }}>
                  {values.map((v, i) => (
                    <div key={i} className="bc-about-value">
                      {v.icon && <span style={{ fontSize: "1.4rem", color: "#C9A84C", display: "block", marginBottom: 10 }}>{v.icon}</span>}
                      <p style={{ fontFamily: "var(--font-heading)", fontSize: "0.78rem", fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: "#F5F5F5", margin: "0 0 6px" }}>
                        <GenericEditableText sectionId={sectionId} field={`values.${i}.title`} value={v.title} tag="span" />
                      </p>
                      <p style={{ fontFamily: "var(--font-body)", fontSize: "0.85rem", color: "rgba(245,245,245,0.6)", margin: 0, lineHeight: 1.55 }}>
                        <GenericEditableText sectionId={sectionId} field={`values.${i}.text`} value={v.text} tag="span" />
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <style>{`
          @media (max-width: 768px) { [data-template="barber-01"] .bc-about-grid { grid-template-columns: 1fr !important; } }
        `}</style>
      </section>
    );
  }

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
  showHeader = true,
  eyebrowNum = "02",
  eyebrow = "O nás",
}: {
  title: string;
  lead: string;
  body: string;
  images: Array<{ url?: string; alt?: string }>;
  sectionId: number;
  showHeader?: boolean;
  eyebrowNum?: string;
  eyebrow?: string;
}) {
  // Infinite carousel — desktop 4, tablet 2-3, mobil 1; auto-advance 4s.
  const [idx, setIdx] = useState(0);
  const [perView, setPerView] = useState(4);
  const [animated, setAnimated] = useState(true);
  const count = images.length;
  const touchStartX = useRef<number | null>(null);

  useEffect(() => {
    const recalc = () => {
      const w = window.innerWidth;
      setPerView(w < 640 ? 1 : w < 980 ? 2 : w < 1280 ? 3 : 4);
    };
    recalc();
    window.addEventListener("resize", recalc);
    return () => window.removeEventListener("resize", recalc);
  }, []);

  // After a jump-back (no animation), re-enable animation on next frame.
  useEffect(() => {
    if (!animated) {
      const raf = requestAnimationFrame(() => setAnimated(true));
      return () => cancelAnimationFrame(raf);
    }
  }, [animated]);

  const maxIdx = Math.max(0, count - perView);

  const advance = useCallback(() => {
    setIdx((i) => {
      if (i >= maxIdx) { setAnimated(false); return 0; }
      setAnimated(true);
      return i + 1;
    });
  }, [maxIdx]);

  const goBack = useCallback(() => {
    setIdx((i) => {
      if (i <= 0) { setAnimated(false); return maxIdx; }
      setAnimated(true);
      return i - 1;
    });
  }, [maxIdx]);

  useEffect(() => {
    if (count <= perView) return;
    const t = setInterval(advance, 4000);
    return () => clearInterval(t);
  }, [count, perView, advance]);

  function handleTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
  }
  function handleTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(dx) < 40) return;
    if (dx < 0) advance(); else goBack();
  }

  return (
    <section
      className="relative"
      style={{ padding: "clamp(80px, 10vw, 120px) 24px", backgroundColor: "#0a0806" }}
      data-template="barber-04"
    >
      {/* Industrial gold fade divider top */}
      <div aria-hidden style={{
        position: "absolute", top: 0, left: "20%", right: "20%", height: 1,
        background: "linear-gradient(90deg, transparent 0%, rgba(213,185,129,.4) 50%, transparent 100%)",
      }} />
      {showHeader && (
      <div className="max-w-[860px] mx-auto text-center">
        {/* Industrial numbered eyebrow */}
        <div
          className="b04-about-eyebrow"
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
          <GenericEditableText sectionId={sectionId} field="eyebrowNum" value={eyebrowNum} tag="span" style={{ fontFamily: "'Bebas Neue','Oswald',Impact,sans-serif", fontWeight: 400, letterSpacing: "0.10em", fontSize: 14 }} />
          <span aria-hidden style={{ width: 28, height: 1, backgroundColor: "#d5b981", opacity: 0.7 }} />
          <GenericEditableText sectionId={sectionId} field="eyebrow" value={eyebrow} tag="span" />
        </div>

        <h2
          className="uppercase"
          style={{
            fontFamily: "'Bebas Neue','Oswald',Impact,sans-serif",
            fontWeight: 400,
            fontSize: "clamp(36px, 4.5vw, 60px)",
            letterSpacing: "0.03em",
            color: "#fff",
            margin: "0 auto 24px",
            lineHeight: 1.05,
          }}
        >
          <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
        </h2>

        {/* Gold fade gradient signature line */}
        <div
          aria-hidden
          style={{
            width: 180,
            height: 1,
            margin: "0 auto 36px",
            background:
              "linear-gradient(90deg, transparent 0%, rgba(213,185,129,.85) 50%, transparent 100%)",
          }}
        />

        {lead && (
          <p
            style={{
              fontFamily: "'Lato',Helvetica,Arial,sans-serif",
              fontWeight: 500,
              fontSize: "clamp(15px, 1.15vw, 17px)",
              color: "rgba(255,255,255,0.92)",
              maxWidth: 720,
              margin: "0 auto 14px",
              lineHeight: 1.65,
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
              color: "rgba(255,255,255,0.58)",
              maxWidth: 680,
              margin: "0 auto 60px",
              lineHeight: 1.85,
            }}
          >
            <GenericEditableText sectionId={sectionId} field="body" value={body} tag="span" />
          </p>
        )}
      </div>
      )}

      {/* Carousel strip */}
      {count > 0 && (
        <div
          className="max-w-[1280px] mx-auto px-6 overflow-hidden"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          style={{ touchAction: "pan-y" }}
        >
          <div
            className="flex"
            style={{
              transform: `translateX(-${(idx * 100) / perView}%)`,
              gap: 16,
              transition: animated ? "transform 700ms ease-in-out" : "none",
            }}
          >
            {images.map((img, i) => (
              <div
                key={`strip-${i}`}
                className="b04-about-card relative shrink-0 overflow-hidden"
                style={{
                  width: `calc(${100 / perView}% - ${(16 * (perView - 1)) / perView}px)`,
                  aspectRatio: "3/4",
                  backgroundColor: "#1a1a1a",
                  border: "1px solid rgba(213,185,129,.08)",
                }}
              >
                <GenericEditableImage
                  sectionId={sectionId}
                  field={`images.${i}.url`}
                  src={String(img.url ?? "")}
                  alt={img.alt ?? `Slide ${i + 1}`}
                  style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
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
          {/* Dots — jeden per strana, ne per obrázek */}
          {maxIdx > 0 && (
            <div className="flex items-center justify-center gap-3 mt-8" aria-hidden>
              {Array.from({ length: maxIdx + 1 }).map((_, i) => (
                <button
                  key={`about-dot-${i}`}
                  type="button"
                  onClick={() => { setAnimated(true); setIdx(i); }}
                  aria-label={`Strana ${i + 1}`}
                  className="border-0 cursor-pointer"
                  style={{
                    width: i === idx ? 28 : 10,
                    height: 2,
                    backgroundColor: i === idx ? "#d5b981" : "rgba(255,255,255,0.20)",
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

// ── Massage01Stats — count-up animace při scrollu ─────────────────────────────
function Massage01Stats({ stats, sectionId }: {
  stats: Array<{ number: string; label: string }>;
  sectionId: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [counts, setCounts] = useState<number[]>(stats.map(() => 0));
  const [started, setStarted] = useState(false);

  // Parsujeme číslo a suffix ("12+" → { value: 12, suffix: "+" })
  const parsed = stats.map(s => {
    const match = s.number.match(/^(\d+)(.*)$/);
    return { value: match ? parseInt(match[1], 10) : 0, suffix: match ? match[2] : "" };
  });

  useEffect(() => {
    if (started) return;
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        obs.disconnect();
        setStarted(true);
        const duration = 1600;
        const fps = 60;
        const steps = Math.round((duration / 1000) * fps);
        let step = 0;
        const timer = setInterval(() => {
          step++;
          const progress = step / steps;
          // easeOutQuart
          const ease = 1 - Math.pow(1 - progress, 4);
          setCounts(parsed.map(p => Math.round(p.value * ease)));
          if (step >= steps) {
            clearInterval(timer);
            setCounts(parsed.map(p => p.value));
          }
        }, 1000 / fps);
      },
      { threshold: 0.3 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [started, parsed]);

  const GOLD  = "#C9A962";
  const MUTED = "#6A6058";
  const SERIF = "'Cormorant Garamond', serif";
  const FONT  = "'Inter', sans-serif";

  return (
    <div ref={ref} style={{ display: "flex", gap: 48 }}>
      {stats.map((s, i) => (
        <div key={i} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <span style={{ fontFamily: SERIF, fontSize: 36, color: GOLD, lineHeight: 1 }}>
            {counts[i]}{parsed[i].suffix}
          </span>
          <span style={{ fontFamily: FONT, fontSize: 12, color: MUTED, letterSpacing: 1, textTransform: "uppercase" }}>
            <GenericEditableText sectionId={sectionId} field={`stats.${i}.label`} value={s.label} tag="span" />
          </span>
        </div>
      ))}
    </div>
  );
}

// ── tawan-01-benefits ─────────────────────────────────────────────────────────
// 4-sloupcová mřížka "Proč TAWAN?" — bílé BG, ikona SVG + nadpis purple + text
// 1:1 tawan.cz benefits / why-us sekce
// ─────────────────────────────────────────────────────────────────────────────
function BenefitsTawan01({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  type Item = { icon: string; title: string; text: string };
  const sectionTag = String(content.sectionTag ?? "Proč TAWAN?");
  const heading    = String(content.heading    ?? "Nejvyšší úroveň služeb");
  const items      = (content.items as Item[] | undefined) ?? [];

  const PURPLE = "#393145";
  const BRONZE = "#af8c6a";
  const MUTED  = "#6b6278";
  const FONT   = "'Muli', sans-serif";

  // Scroll reveal — každá karta se zobrazí s offsetem
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            (e.target as HTMLElement).style.opacity = "1";
            (e.target as HTMLElement).style.transform = "translateY(0)";
            obs.unobserve(e.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    cardRefs.current.forEach((el) => { if (el) obs.observe(el); });
    return () => obs.disconnect();
  }, []);

  // Vlastní line-art SVG ilustrace — stejný styl jako tawan.cz, jiné motivy + animace
  const C = "#af8c6a";
  const iconSvg: Record<string, string> = {
    // Masérka masírující klienta — clone SVG z tawan.cz
    star: `<img loading="lazy" src="/clones/tawan/img/massage.svg" alt="masáž" style="width:80px;height:80px;object-fit:contain" />`,

    // Lotosový květ — lístky se rozvíjejí postupně
    leaf: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80" fill="none" stroke="${C}" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round">
      <style>
        .tw-p0{stroke-dasharray:120;stroke-dashoffset:120;animation:tw-draw 0.8s 0s ease forwards}
        .tw-p1{stroke-dasharray:120;stroke-dashoffset:120;animation:tw-draw 0.8s 0.15s ease forwards}
        .tw-p2{stroke-dasharray:120;stroke-dashoffset:120;animation:tw-draw 0.8s 0.3s ease forwards}
        .tw-p3{stroke-dasharray:120;stroke-dashoffset:120;animation:tw-draw 0.8s 0.45s ease forwards}
        .tw-p4{stroke-dasharray:120;stroke-dashoffset:120;animation:tw-draw 0.8s 0.6s ease forwards}
        @keyframes tw-draw{to{stroke-dashoffset:0}}
      </style>
      <path class="tw-p0" d="M40 65 Q30 50 32 35 Q36 22 40 18 Q44 22 48 35 Q50 50 40 65Z"/>
      <path class="tw-p1" d="M40 60 Q24 52 20 38 Q18 26 24 22 Q32 26 36 38 Q38 50 40 60Z"/>
      <path class="tw-p2" d="M40 60 Q56 52 60 38 Q62 26 56 22 Q48 26 44 38 Q42 50 40 60Z"/>
      <path class="tw-p3" d="M40 62 Q22 60 16 48 Q14 36 20 32 Q28 36 32 48 Q36 58 40 62Z"/>
      <path class="tw-p4" d="M40 62 Q58 60 64 48 Q66 36 60 32 Q52 36 48 48 Q44 58 40 62Z"/>
      <circle cx="40" cy="52" r="5" style="stroke-dasharray:32;stroke-dashoffset:32;animation:tw-draw 0.6s 0.75s ease forwards"/>
      <path d="M40 67 Q38 71 36 75" style="stroke-dasharray:20;stroke-dashoffset:20;animation:tw-draw 0.4s 0.9s ease forwards"/>
    </svg>`,

    // Šálek čaje — pára kontinuálně stoupá
    shield: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80" fill="none" stroke="${C}" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round">
      <style>
        .tw-cup{stroke-dasharray:400;stroke-dashoffset:400;animation:tw-draw 1.2s ease forwards}
        .tw-steam1{animation:tw-steam 2s 1.2s ease-in-out infinite}
        .tw-steam2{animation:tw-steam 2s 1.5s ease-in-out infinite}
        .tw-steam3{animation:tw-steam 2s 1.8s ease-in-out infinite}
        @keyframes tw-draw{to{stroke-dashoffset:0}}
        @keyframes tw-steam{0%{transform:translateY(0);opacity:0.9}100%{transform:translateY(-10px);opacity:0}}
      </style>
      <g class="tw-cup">
        <path d="M20 32 Q20 56 40 58 Q60 56 60 32Z"/>
        <line x1="20" y1="32" x2="60" y2="32"/>
        <path d="M60 37 Q70 37 70 44 Q70 51 60 51"/>
        <ellipse cx="40" cy="61" rx="26" ry="4"/>
        <path d="M34 44 Q40 39 46 44 Q40 49 34 44Z"/>
        <line x1="40" y1="39" x2="40" y2="49"/>
      </g>
      <path class="tw-steam1" d="M30 28 Q28 22 30 16 Q32 10 30 4" fill="none"/>
      <path class="tw-steam2" d="M40 26 Q38 20 40 14 Q42 8 40 2" fill="none"/>
      <path class="tw-steam3" d="M50 28 Q48 22 50 16 Q52 10 50 4" fill="none"/>
    </svg>`,

    // Bambus — stonky se kolísají
    heart: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80" fill="none" stroke="${C}" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round">
      <style>
        .tw-bam1{transform-origin:28px 75px;animation:tw-sway 3s ease-in-out infinite}
        .tw-bam2{transform-origin:40px 75px;animation:tw-sway 3s 0.4s ease-in-out infinite}
        .tw-bam3{transform-origin:52px 75px;animation:tw-sway 3s 0.8s ease-in-out infinite}
        @keyframes tw-sway{0%,100%{transform:rotate(0deg)}50%{transform:rotate(1.5deg)}}
        .tw-bdraw{stroke-dasharray:300;stroke-dashoffset:300;animation:tw-draw 1.2s ease forwards}
        @keyframes tw-draw{to{stroke-dashoffset:0}}
      </style>
      <g class="tw-bdraw">
        <path d="M18 75 Q35 72 62 75"/>
      </g>
      <g class="tw-bam1">
        <line x1="28" y1="10" x2="28" y2="74"/>
        <line x1="26" y1="25" x2="30" y2="25"/>
        <line x1="26" y1="45" x2="30" y2="45"/>
        <line x1="26" y1="62" x2="30" y2="62"/>
        <path d="M28 28 Q18 22 14 14 Q22 16 28 28Z"/>
        <path d="M28 48 Q16 44 12 36 Q20 38 28 48Z"/>
      </g>
      <g class="tw-bam2">
        <line x1="40" y1="18" x2="40" y2="74"/>
        <line x1="38" y1="33" x2="42" y2="33"/>
        <line x1="38" y1="53" x2="42" y2="53"/>
        <line x1="38" y1="68" x2="42" y2="68"/>
        <path d="M40 36 Q52 29 56 18 Q48 22 40 36Z"/>
        <path d="M40 56 Q50 51 52 40 Q44 44 40 56Z"/>
      </g>
      <g class="tw-bam3">
        <line x1="52" y1="12" x2="52" y2="74"/>
        <line x1="50" y1="28" x2="54" y2="28"/>
        <line x1="50" y1="48" x2="54" y2="48"/>
        <line x1="50" y1="64" x2="54" y2="64"/>
        <path d="M52 30 Q64 24 66 14 Q58 18 52 30Z"/>
        <path d="M52 50 Q62 46 64 36 Q56 40 52 50Z"/>
      </g>
    </svg>`,
  };

  return (
    <section
      id="o-nas"
      style={{ backgroundColor: "#ffffff", padding: "96px 32px" }}
      data-template="tawan-01"
    >
      <style>{`
        @media(max-width:768px){
          .tawan-benefits-grid { grid-template-columns: 1fr 1fr !important; gap: 32px !important; }
        }
        @media(max-width:480px){
          .tawan-benefits-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: 64 }}>
        <span style={{ fontFamily: FONT, fontSize: 12, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase", color: BRONZE, display: "block", marginBottom: 16 }}>
          <GenericEditableText sectionId={sectionId} field="sectionTag" value={sectionTag} tag="span" />
        </span>
        <h2 style={{ fontFamily: FONT, fontSize: "clamp(28px, 3vw, 44px)", fontWeight: 300, color: PURPLE, margin: 0, letterSpacing: 1 }}>
          <GenericEditableText sectionId={sectionId} field="heading" value={heading} tag="span" />
        </h2>
        <div style={{ width: 48, height: 1, backgroundColor: BRONZE, margin: "24px auto 0" }} />
      </div>

      {/* Grid */}
      <div
        className="tawan-benefits-grid"
        style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 0, maxWidth: 1200, margin: "0 auto" }}
      >
        {items.map((item, i) => (
          <div
            key={i}
            ref={el => { cardRefs.current[i] = el; }}
            style={{
              display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center",
              gap: 20, padding: "0 32px",
              borderRight: i < items.length - 1 ? `1px solid ${BRONZE}33` : "none",
              opacity: 0, transform: "translateY(28px)",
              transition: `opacity 0.6s ease ${i * 0.12}s, transform 0.6s ease ${i * 0.12}s`,
            }}
          >
            {/* Line-art SVG ikona s hover scale */}
            <div
              style={{ width: 80, height: 80, flexShrink: 0, transition: "transform 0.35s ease", cursor: "default" }}
              dangerouslySetInnerHTML={{ __html: iconSvg[item.icon] ?? iconSvg.star }}
              onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.12)")}
              onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
            />
            <h3 style={{ fontFamily: FONT, fontSize: 18, fontWeight: 700, color: PURPLE, margin: 0, letterSpacing: 0.5 }}>
              <GenericEditableText sectionId={sectionId} field={`items.${i}.title`} value={item.title} tag="span" />
            </h3>
            <p style={{ fontFamily: FONT, fontSize: 15, fontWeight: 300, color: MUTED, margin: 0, lineHeight: 1.7 }}>
              <GenericEditableText sectionId={sectionId} field={`items.${i}.text`} value={item.text} tag="span" />
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

// ── tawan-01-why ─────────────────────────────────────────────────────────────
// Dark purple BG, numbered tabs vlevo, obrázek + text vpravo — 1:1 tawan.cz
// ─────────────────────────────────────────────────────────────────────────────
function WhyTawan01({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  type Tab = { number: string; label: string; heading: string; text: string; image: string };
  const heading = String(content.heading ?? "Proč TAWAN?");
  const tabs = (content.tabs as Tab[] | undefined) ?? [];
  const [active, setActive] = useState(0);
  const hasInteracted = useRef(false);

  const PURPLE = "#393145";
  const BRONZE = "#af8c6a";
  const FONT   = "'Muli', sans-serif";

  const tab = tabs[active];

  return (
    <section id="proc-tawan" style={{ backgroundColor: PURPLE, padding: "96px 32px" }} data-template="tawan-01">
      <style>{`
        .tw-why-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 80px; max-width: 1200px; margin: 0 auto; align-items: center; }
        @media(max-width:900px){ .tw-why-grid { grid-template-columns: 1fr; gap: 48px; } }
        .tw-why-tab { cursor: pointer; display: flex; align-items: center; gap: 20px; padding: 18px 0; border-bottom: 1px solid rgba(255,255,255,0.1); transition: opacity 0.2s; }
        .tw-why-tab:hover { opacity: 1 !important; }
      `}</style>

      <div className="tw-why-grid">
        {/* Levá strana — numbered tabs */}
        <div>
          <h2 style={{ fontFamily: FONT, fontSize: "clamp(32px,4vw,52px)", fontWeight: 300, color: "#fff", margin: "0 0 48px", letterSpacing: 2 }}>
            <GenericEditableText sectionId={sectionId} field="heading" value={heading} tag="span" />
          </h2>
          {tabs.map((t, i) => (
            <div
              key={i}
              className="tw-why-tab"
              onClick={() => { hasInteracted.current = true; setActive(i); }}
              style={{ opacity: i === active ? 1 : 0.45 }}
            >
              <span style={{ fontFamily: FONT, fontSize: 32, fontWeight: 700, color: BRONZE, minWidth: 36, lineHeight: 1 }}>
                <GenericEditableText sectionId={sectionId} field={`tabs.${i}.number`} value={t.number} tag="span" />
              </span>
              <span style={{ fontFamily: FONT, fontSize: 16, fontWeight: i === active ? 700 : 300, color: "#fff", letterSpacing: 0.5 }}>
                <GenericEditableText sectionId={sectionId} field={`tabs.${i}.label`} value={t.label} tag="span" />
              </span>
            </div>
          ))}
        </div>

        {/* Pravá strana — obrázek + text */}
        {tab && (
          <div key={active} style={{ animation: hasInteracted.current ? "tw-fadein 0.4s ease" : "none" }}>
            <style>{`@keyframes tw-fadein{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}`}</style>
            <img loading="lazy" src={tab.image} alt={tab.heading} style={{ width: "100%", aspectRatio: "4/3", objectFit: "cover", marginBottom: 32 }} />
            <h3 style={{ fontFamily: FONT, fontSize: 26, fontWeight: 300, color: "#fff", margin: "0 0 16px", letterSpacing: 1 }}>
              <GenericEditableText sectionId={sectionId} field={`tabs.${active}.heading`} value={tab.heading} tag="span" />
            </h3>
            <p style={{ fontFamily: FONT, fontSize: 15, fontWeight: 300, color: "rgba(255,255,255,0.7)", lineHeight: 1.75, margin: 0 }}>
              <GenericEditableText sectionId={sectionId} field={`tabs.${active}.text`} value={tab.text} tag="span" />
            </p>
            <div style={{ marginTop: 32, width: 48, height: 1, backgroundColor: BRONZE }} />
          </div>
        )}
      </div>
    </section>
  );
}

// ── tawan-01-news ─────────────────────────────────────────────────────────────
// Akce a novinky — 2 promo karty s foto + tag + nadpis + text + datum
// Bílé BG, red tag badge, bronze CTA — 1:1 tawan.cz news sekce
// ─────────────────────────────────────────────────────────────────────────────
function NewsTawan01({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  type Item = { tag: string; image: string; title: string; text: string; date: string; href: string };
  const heading     = String(content.heading     ?? "Akce a novinky");
  const description = String(content.description ?? "");
  const ctaText     = String(content.ctaText     ?? "Všechny akce");
  const ctaHref     = String(content.ctaHref     ?? "#kontakt");
  const items       = (content.items as Item[] | undefined) ?? [];

  const PURPLE = "#393145";
  const BRONZE = "#af8c6a";
  const MUTED  = "#6b6278";
  const FONT   = "'Muli', sans-serif";
  const btnRadius = "16px 0 16px 0";

  return (
    <section id="novinky" style={{ backgroundColor: "#ffffff", padding: "96px 32px" }} data-template="tawan-01">
      <style>{`
        .tw-news-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; }
        @media(max-width:768px){ .tw-news-grid { grid-template-columns: 1fr; } }
        .tw-news-card { overflow: hidden; transition: transform 0.3s, box-shadow 0.3s; }
        .tw-news-card:hover { transform: translateY(-4px); box-shadow: 0 8px 32px rgba(57,49,69,0.12); }
        .tw-news-img img { transition: transform 0.5s ease; width: 100%; display: block; aspect-ratio: 16/9; object-fit: cover; }
        .tw-news-card:hover .tw-news-img img { transform: scale(1.04); }
      `}</style>

      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 24, marginBottom: 48 }}>
          <div>
            <span style={{ fontFamily: FONT, fontSize: 12, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase", color: BRONZE, display: "block", marginBottom: 16 }}>
              Akce a novinky
            </span>
            <h2 style={{ fontFamily: FONT, fontSize: "clamp(28px,3vw,44px)", fontWeight: 300, color: PURPLE, margin: "0 0 16px", letterSpacing: 1 }}>
              <GenericEditableText sectionId={sectionId} field="heading" value={heading} tag="span" />
            </h2>
            {description && (
              <p style={{ fontFamily: FONT, fontSize: 15, color: MUTED, margin: 0, maxWidth: 520 }}>
                <GenericEditableText sectionId={sectionId} field="description" value={description} tag="span" />
              </p>
            )}
            <div style={{ width: 48, height: 1, backgroundColor: BRONZE, marginTop: 20 }} />
          </div>
          <a href={ctaHref} data-btn="primary" style={{ fontFamily: FONT, fontSize: 13, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: "#fff", textDecoration: "none", display: "inline-block", padding: "0 32px", height: 48, lineHeight: "48px", backgroundColor: BRONZE, borderRadius: btnRadius, flexShrink: 0 }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#c19d7b")}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = BRONZE)}
          >
            <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
          </a>
        </div>

        {/* Karty */}
        <div className="tw-news-grid">
          {items.map((item, i) => (
            <a key={i} href={item.href} className="tw-news-card" style={{ textDecoration: "none", display: "block" }}>
              <div className="tw-news-img" style={{ position: "relative", overflow: "hidden" }}>
                <img loading="lazy" src={item.image} alt={item.title} />
                <span style={{ position: "absolute", top: 16, left: 16, backgroundColor: "#e53935", color: "#fff", fontFamily: FONT, fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", padding: "4px 12px" }}>
                  <GenericEditableText sectionId={sectionId} field={`items.${i}.tag`} value={item.tag} tag="span" />
                </span>
              </div>
              <div style={{ padding: "24px 0" }}>
                <h3 style={{ fontFamily: FONT, fontSize: 20, fontWeight: 700, color: PURPLE, margin: "0 0 12px" }}>
                  <GenericEditableText sectionId={sectionId} field={`items.${i}.title`} value={item.title} tag="span" />
                </h3>
                <p style={{ fontFamily: FONT, fontSize: 14, color: MUTED, lineHeight: 1.7, margin: "0 0 12px" }}>
                  <GenericEditableText sectionId={sectionId} field={`items.${i}.text`} value={item.text} tag="span" />
                </p>
                <span style={{ fontFamily: FONT, fontSize: 12, color: BRONZE, letterSpacing: 1 }}>
                  <GenericEditableText sectionId={sectionId} field={`items.${i}.date`} value={item.date} tag="span" />
                </span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── tawan-01-branches ─────────────────────────────────────────────────────────
// Salony / pobočky — horizontální slider s kartami
// Béžové BG, fullwidth fotka, city label + název salonu + adresa + CTA
// Slider s tlačítky ‹ › — 1:1 tawan.cz places sekce
// ─────────────────────────────────────────────────────────────────────────────
function BranchesTawan01({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  type Branch = { image: string; city: string; name: string; address: string; phone: string; href: string };
  const sectionTag = String(content.sectionTag ?? "Naše salony");
  const heading    = String(content.heading    ?? "Navštivte nás");
  const subtitle   = String(content.subtitle   ?? "");
  const ctaText    = String(content.ctaText    ?? "Všechny salony");
  const ctaHref    = String(content.ctaHref    ?? "#kontakt");
  const items      = (content.items as Branch[] | undefined) ?? [];

  const [idx, setIdx] = useState(0);
  const PURPLE = "#393145";
  const BRONZE = "#af8c6a";
  const MUTED  = "#6b6278";
  const FONT   = "'Muli', sans-serif";
  const btnRadius = "16px 0 16px 0";

  const prev = () => setIdx(i => (i - 1 + items.length) % items.length);
  const next = () => setIdx(i => (i + 1) % items.length);

  return (
    <section id="salony" style={{ backgroundColor: "#f8f7f5", padding: "96px 0" }} data-template="tawan-01">
      <style>{`
        .tw-br-img img { width:100%;aspect-ratio:16/9;object-fit:cover;display:block; }
        .tw-br-card-btn { display:inline-block;font-family:'Muli',sans-serif;font-size:12px;font-weight:700;letter-spacing:2px;text-transform:uppercase;text-decoration:none;padding:0 24px;height:44px;line-height:44px;transition:background 0.2s,color 0.2s; }
      `}</style>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 32px" }}>
        {/* Heading — full width, left-aligned */}
        <div style={{ marginBottom: 32 }}>
          <span style={{ fontFamily: FONT, fontSize: 12, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase", color: BRONZE, display: "block", marginBottom: 16 }}>
            <GenericEditableText sectionId={sectionId} field="sectionTag" value={sectionTag} tag="span" />
          </span>
          <h2 style={{ fontFamily: FONT, fontSize: "clamp(28px,3vw,44px)", fontWeight: 300, color: PURPLE, margin: "0 0 12px", letterSpacing: 1 }}>
            <GenericEditableText sectionId={sectionId} field="heading" value={heading} tag="span" />
          </h2>
          {subtitle && <p style={{ fontFamily: FONT, fontSize: 15, color: MUTED, margin: 0 }}>
            <GenericEditableText sectionId={sectionId} field="subtitle" value={subtitle} tag="span" />
          </p>}
          <div style={{ width: 48, height: 1, backgroundColor: BRONZE, marginTop: 20 }} />
        </div>
        {/* Šipky + counter — right-aligned, separate row */}
        <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 16, marginBottom: 40 }}>
          <span style={{ fontFamily: FONT, fontSize: 14, color: PURPLE }}>
            <strong>{idx + 1}</strong><span style={{ color: MUTED }}> / {items.length}</span>
          </span>
          <button onClick={prev} aria-label="Předchozí" style={{ width: 48, height: 48, border: `1px solid ${BRONZE}`, background: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: btnRadius }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={BRONZE} strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <button onClick={next} aria-label="Další" style={{ width: 48, height: 48, border: `1px solid ${BRONZE}`, background: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: btnRadius }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={BRONZE} strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
          </button>
        </div>
      </div>

      {/* Slider — přes celou šířku */}
      <div style={{ overflow: "hidden" }}>
        <div style={{ display: "flex", transition: "transform 0.5s ease", transform: `translateX(calc(-${idx} * (min(580px, 80vw) + 24px)))`, paddingLeft: "max(32px, calc((100vw - 1200px)/2 + 32px))", paddingRight: "max(32px, calc((100vw - 1200px)/2 + 32px))", gap: 24 }}>
          {items.map((branch, i) => (
            <div key={i} style={{ minWidth: "min(580px, 80vw)", backgroundColor: "#fff" }}>
              <div className="tw-br-img">
                <img loading="lazy" src={branch.image} alt={branch.name} />
              </div>
              <div style={{ padding: "28px 28px 32px" }}>
                <span style={{ fontFamily: FONT, fontSize: 11, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase", color: BRONZE, display: "block", marginBottom: 8 }}>
                  <GenericEditableText sectionId={sectionId} field={`items.${i}.city`} value={branch.city} tag="span" />
                </span>
                <h3 style={{ fontFamily: FONT, fontSize: 22, fontWeight: 700, color: PURPLE, margin: "0 0 12px" }}>
                  <GenericEditableText sectionId={sectionId} field={`items.${i}.name`} value={branch.name} tag="span" />
                </h3>
                <p style={{ fontFamily: FONT, fontSize: 14, color: MUTED, margin: "0 0 20px" }}>
                  <GenericEditableText sectionId={sectionId} field={`items.${i}.address`} value={branch.address} tag="span" />
                </p>
                <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                  <a href={branch.href} className="tw-br-card-btn" style={{ backgroundColor: BRONZE, color: "#fff", borderRadius: btnRadius }}
                    onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#c19d7b")}
                    onMouseLeave={e => (e.currentTarget.style.backgroundColor = BRONZE)}
                  >Rezervovat</a>
                  <a href={ctaHref} data-btn="inverse" className="tw-br-card-btn" style={{ backgroundColor: "transparent", color: PURPLE, border: `1px solid ${PURPLE}44`, borderRadius: btnRadius }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = PURPLE; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = `${PURPLE}44`; }}
                  ><GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" /></a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── ananda-01-about-ayurveda ──────────────────────────────────────────────────
// Cream bg #F2EDE4, max-width 1280px, 2-col grid XL: foto vlevo + text vpravo
// H2: gold #AA813A, Jost, ~60px, font-weight 300 (font-joly = light display)
// Body: text-lg leading-relaxed, dark slate
// CTA: gold outline pill button s šipkou → hover fill
// Ref: anandaspa.cz sekce "Co je ájurvéda"
// ─────────────────────────────────────────────────────────────────────────────
function AboutAnanda01Ayurveda({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const title   = String(content.title   ?? "Co je ájurvéda");
  const body    = String(content.body    ?? "Ájurvéda je tradiční indická medicína přinášející životní rovnováhu při zdraví těla i duše. Úspěch zaznamenává při řešení různých zdravotních potíží, duševních zátěží či chronických problémů. Spolu s ájurvédskou procedurou využívá principy stravování, přírodní oleje, byliny a doplňky stravy na bázi tisíciletých zkušeností.");
  const ctaText = String(content.ctaText ?? "Co je ájurvéda");
  const ctaHref = String(content.ctaHref ?? "#o-ayurvede");
  const image   = String(content.image   ?? "");

  const GOLD  = "#AA813A";
  const CREAM = "#F2EDE4";
  const TEXT  = "#334155";
  const FONT  = "'Jost', sans-serif";

  const placeholderSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="500" viewBox="0 0 600 500"><rect width="600" height="500" fill="#ddd4c4"/><text x="300" y="260" text-anchor="middle" font-family="Arial" font-size="18" fill="#aa813a" opacity="0.6">Foto procedury</text></svg>`;
  const imgSrc = image || `data:image/svg+xml;charset=utf-8,${encodeURIComponent(placeholderSvg)}`;

  return (
    <section id="o-ajurvede" style={{ backgroundColor: CREAM, padding: "80px 0", position: "relative" }}>
      <style>{`
        .ananda-about-grid { display: grid; grid-template-columns: 1fr; gap: 48px; max-width: 1280px; margin: 0 auto; padding: 0 32px; }
        @media(min-width: 1024px) { .ananda-about-grid { grid-template-columns: 1fr 1fr; align-items: center; } }
        .ananda-about-cta {
          display: inline-flex; align-items: center; gap: 12px;
          font-family: ${FONT}; font-size: 11px; font-weight: 600; letter-spacing: 3px;
          text-transform: uppercase; color: ${GOLD}; text-decoration: none;
          padding: 14px 32px; border: 1.5px solid ${GOLD}; border-radius: 999px;
          transition: background 0.25s, color 0.25s;
        }
        .ananda-about-cta:hover { background: ${GOLD}; color: #fff; }
        .ananda-about-cta svg { transition: transform 0.3s; }
        .ananda-about-cta:hover svg { transform: translateX(6px); }
      `}</style>

      <div className="ananda-about-grid">
        {/* Foto */}
        <div style={{ position: "relative", overflow: "hidden", aspectRatio: "6/5", minHeight: 360 }}>
          <GenericEditableImage
            sectionId={sectionId}
            field="image"
            src={imgSrc}
            alt={title}
            className="absolute inset-0 w-full h-full"
            style={{ position: "absolute" }}
          >
            <Image
              src={imgSrc}
              alt={title}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
              unoptimized={shouldSkipNextImageOptimization(imgSrc)}
            />
          </GenericEditableImage>
        </div>

        {/* Text */}
        <div style={{ display: "flex", flexDirection: "column", gap: 32, paddingTop: 0 }}>
          <h2 style={{ fontFamily: FONT, fontWeight: 300, fontSize: "clamp(40px, 5vw, 60px)", color: GOLD, margin: 0, lineHeight: 1.1 }}>
            <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
          </h2>
          <p style={{ fontFamily: FONT, fontSize: 17, lineHeight: 1.8, color: TEXT, margin: 0 }}>
            <GenericEditableText sectionId={sectionId} field="body" value={body} tag="span" />
          </p>
          <div>
            <a href={ctaHref} data-btn="primary" className="ananda-about-cta">
              <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 9" width="28" height="9" fill="none">
                <path stroke="currentColor" strokeWidth="1" d="M27.5,9l-.6-.6,3.4-3.4H0v-.9h30.3l-3.4-3.4L27.5,0,32,4.5Z"/>
              </svg>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── ananda-01-benefits ────────────────────────────────────────────────────────
// White bg, center H2 uppercase tracking-widest
// 3 feature bloky: kruhová ikona (cream #ECE4D7) + gold uppercase label
// Pořadí: Diagnostika → Procedury → Stravovací režim
// Propojeny SVG šipkou (→) na desktop
// Gold outline pill CTA dole
// Ref: anandaspa.cz "Unikátní cesta naší léčebnou procedurou"
// ─────────────────────────────────────────────────────────────────────────────
function BenefitsAnanda01({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const title   = String(content.title   ?? "UNIKÁTNÍ CESTA\nNAŠÍ LÉČEBNOU PROCEDUROU");
  const ctaText = String(content.ctaText ?? "CHCI VYZKOUŠET PROCEDURU");
  const ctaHref = String(content.ctaHref ?? "#kontakt");

  type Step = { icon: string; label: string };
  const rawSteps = (content.steps as Step[] | undefined) ?? [];
  const steps: Step[] = rawSteps.length > 0 ? rawSteps : [
    { icon: "diagnostika", label: "DIAGNOSTIKA\nÁJURVÉDSKÉHO SPECIALISTY" },
    { icon: "procedury",   label: "ÁJURVÉDSKÉ\nLÉČEBNÉ PROCEDURY" },
    { icon: "stravovani",  label: "SESTAVENÍ\nSTRAVOVACÍHO REŽIMU" },
  ];

  const GOLD   = "#AA813A";
  const CREAM2 = "#ECE4D7";
  const TEXT   = "#334155";
  const FONT   = "'Jost', sans-serif";

  // Line-art SVG ikony — gold stroke, no fill, styl anandaspa.cz
  const iconSvg: Record<string, React.ReactNode> = {
    // Otevřená dlaň s bylinkami — diagnostika
    diagnostika: (
      <svg viewBox="0 0 80 100" fill="none" stroke={GOLD} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" style={{ width: "48%", height: "48%" }}>
        {/* Bylinka: stonek */}
        <line x1="40" y1="42" x2="40" y2="16" />
        {/* Levý list */}
        <path d="M40 32 C34 28 30 20 33 14 C37 20 40 26 40 32Z" />
        {/* Pravý list */}
        <path d="M40 26 C46 22 50 14 47 8 C43 14 40 20 40 26Z" />
        {/* Malý vrchní list */}
        <path d="M40 20 C38 14 40 8 40 8 C42 14 40 20 40 20Z" />
        {/* Palec */}
        <path d="M22 66 C20 60 22 54 26 52 C30 50 33 52 33 56" />
        {/* Ukazováček */}
        <path d="M33 56 L33 44 C33 40 35 38 37 38 C39 38 41 40 41 44 L41 42" />
        {/* Prostředníček */}
        <path d="M41 42 C41 38 43 36 45 36 C47 36 49 38 49 42 L49 44" />
        {/* Prsteníček */}
        <path d="M49 44 C49 40 51 38 53 38 C55 38 57 40 57 44 L57 50" />
        {/* Malíček */}
        <path d="M57 50 C57 46 59 44 61 45 C63 46 63 50 62 54" />
        {/* Dlaň */}
        <path d="M22 66 C20 74 22 82 28 86 L52 86 C60 84 64 76 62 66 L57 50 L33 56 Z" />
      </svg>
    ),
    // Hlava zepředu s rukama na spáncích — procedury
    procedury: (
      <svg viewBox="0 0 110 90" fill="none" stroke={GOLD} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" style={{ width: "58%", height: "58%" }}>
        {/* Obrys hlavy */}
        <path d="M38 16 C38 8 72 8 72 16 L74 46 C74 60 64 72 55 72 C46 72 36 60 36 46 Z" />
        {/* Levé ucho */}
        <path d="M38 36 C32 36 30 40 30 44 C30 48 32 52 38 52" />
        {/* Pravé ucho */}
        <path d="M72 36 C78 36 80 40 80 44 C80 48 78 52 72 52" />
        {/* Krk */}
        <line x1="48" y1="72" x2="46" y2="80" />
        <line x1="62" y1="72" x2="64" y2="80" />
        {/* Levá ruka — 3 prsty svisle */}
        <path d="M8 28 L8 54 C8 58 12 60 16 58" />
        <path d="M14 26 L14 54 C14 58 18 60 22 58" />
        <path d="M20 28 L20 54 C20 58 24 60 28 58" />
        <path d="M8 58 C8 62 12 66 16 64 L22 64 C26 64 30 62 28 58" />
        {/* Pravá ruka — 3 prsty svisle */}
        <path d="M102 28 L102 54 C102 58 98 60 94 58" />
        <path d="M96 26 L96 54 C96 58 92 60 88 58" />
        <path d="M90 28 L90 54 C90 58 86 60 82 58" />
        <path d="M102 58 C102 62 98 66 94 64 L88 64 C84 64 80 62 82 58" />
        {/* Obočí */}
        <path d="M44 30 Q50 27 56 30" />
        <path d="M54 30 Q60 27 66 30" />
        {/* Oči */}
        <ellipse cx="50" cy="36" rx="4" ry="3" />
        <ellipse cx="60" cy="36" rx="4" ry="3" />
        {/* Nos */}
        <path d="M55 40 L53 50 Q55 53 57 50" />
        {/* Ústa */}
        <path d="M47 60 Q55 65 63 60" />
      </svg>
    ),
    // Miska s kopcem jídla a bylinkami — stravovani
    stravovani: (
      <svg viewBox="0 0 90 90" fill="none" stroke={GOLD} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" style={{ width: "54%", height: "54%" }}>
        {/* Tělo misky — spodní půloblouk */}
        <path d="M12 50 Q12 78 45 78 Q78 78 78 50Z" />
        {/* Horní linie */}
        <line x1="8" y1="50" x2="82" y2="50" />
        {/* Nožka */}
        <line x1="45" y1="78" x2="45" y2="84" />
        <path d="M33 84 Q45 88 57 84" />
        {/* Kopec obsahu */}
        <path d="M16 50 Q20 36 45 34 Q70 36 74 50" />
        {/* Stonek bylinky */}
        <line x1="45" y1="34" x2="45" y2="16" />
        {/* Levý list */}
        <path d="M45 28 C39 24 35 16 38 10 C41 16 45 22 45 28Z" />
        {/* Pravý list */}
        <path d="M45 24 C51 20 55 12 52 6 C49 12 45 18 45 24Z" />
        {/* Vlnky v misce — vrstva 1 */}
        <path d="M24 58 Q34 54 45 56 Q56 54 66 58" />
        {/* Vlnky v misce — vrstva 2 */}
        <path d="M18 66 Q32 62 45 64 Q58 62 72 66" />
      </svg>
    ),
  };

  const getIcon = (key: string, idx: number) => {
    const keys = ["diagnostika", "procedury", "stravovani"];
    return iconSvg[key] ?? iconSvg[keys[idx % 3]];
  };

  return (
    <section id="jak-to-funguje" style={{ backgroundColor: "#ffffff", padding: "80px 0" }}>
      <style>{`
        .ananda-benefits-wrap { max-width: 1100px; margin: 0 auto; padding: 0 32px; text-align: center; }
        .ananda-benefits-steps { display: flex; flex-direction: column; align-items: center; gap: 48px; margin: 64px 0 64px; }
        @media(min-width: 760px) {
          .ananda-benefits-steps { flex-direction: row; justify-content: center; align-items: flex-start; gap: 32px; }
        }
        .ananda-benefit-item { display: flex; flex-direction: column; align-items: center; gap: 28px; flex: 1; max-width: 300px; }
        .ananda-benefit-circle {
          width: 200px; height: 200px; border-radius: 50%;
          background-color: #ECE4D7;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
          transition: transform 0.4s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.35s ease;
        }
        .ananda-benefit-item:hover .ananda-benefit-circle {
          transform: translateY(-5px) scale(1.04);
          box-shadow: 0 14px 32px rgba(170,129,58,0.18);
        }
        .ananda-benefit-label {
          font-family: 'Jost', sans-serif; font-size: 11px; font-weight: 600;
          letter-spacing: 3px; text-transform: uppercase; text-align: center;
          color: #AA813A; margin: 0; line-height: 1.8; white-space: pre-line;
        }
        .ananda-benefits-cta {
          display: inline-flex; align-items: center; gap: 12px;
          font-family: 'Jost', sans-serif; font-size: 11px; font-weight: 600; letter-spacing: 3px;
          text-transform: uppercase; color: #AA813A; text-decoration: none;
          padding: 16px 40px; border: 1.5px solid #AA813A; border-radius: 999px;
          transition: background 0.25s, color 0.25s;
        }
        .ananda-benefits-cta:hover { background: #AA813A; color: #fff; }
      `}</style>

      <div className="ananda-benefits-wrap">
        <h2 style={{ fontFamily: FONT, fontWeight: 500, fontSize: "clamp(18px, 2.2vw, 24px)", color: TEXT, margin: 0, letterSpacing: 5, textTransform: "uppercase", whiteSpace: "pre-line", lineHeight: 1.5 }}>
          <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
        </h2>

        <div className="ananda-benefits-steps">
          {steps.map((step, i) => (
            <div key={i} className="ananda-benefit-item">
              <div className="ananda-benefit-circle">
                {getIcon(step.icon, i)}
              </div>
              <p className="ananda-benefit-label"><GenericEditableText sectionId={sectionId} field={`steps.${i}.label`} value={step.label} tag="span" /></p>
            </div>
          ))}
        </div>

        <a href={ctaHref} data-btn="primary" className="ananda-benefits-cta">
          <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 9" width="28" height="9" fill="none">
            <path stroke="currentColor" strokeWidth="1" d="M27.5,9l-.6-.6,3.4-3.4H0v-.9h30.3l-3.4-3.4L27.5,0,32,4.5Z"/>
          </svg>
        </a>
      </div>
    </section>
  );
}

// ── ananda-01-highlights ──────────────────────────────────────────────────────
// Zlaté bg #AA813A, py-8, max-w-7xl centrovaný
// 3-col grid: cream kruh #ECE4D7 (w-28 h-28) + gold SVG ikona + cream text dole
// Dole: vlnový cream divider (downward chevron → vizuálně přechod do cream sekce)
// Ref: anandaspa.cz sekce těsně pod hero videom
// ─────────────────────────────────────────────────────────────────────────────
function HighlightsAnanda01({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const GOLD  = "#AA813A";
  const CREAM = "#F2EDE4";
  const CREAM2 = "#ECE4D7";
  const FONT  = "'Jost', sans-serif";

  type Item = { icon: string; label: string };
  const rawItems = (content.items as Item[] | undefined) ?? [];
  const items: Item[] = rawItems.length > 0 ? rawItems : [
    { icon: "/templates/ananda-01/icon-a.svg",      label: "JEDINÉ ÁJURVÉDSKÉ CENTRUM\nV PRAZE" },
    { icon: "/templates/ananda-01/icon-diamant.svg", label: "EXKLUZIVNÍ PROSTŘEDÍ\nINDIVIDUÁLNÍ PŘÍSTUP" },
    { icon: "/templates/ananda-01/icon-budha.svg",  label: "KVALIFIKOVANÍ\nINDIČTÍ TERAPEUTÉ" },
  ];

  return (
    <section id="highlights" style={{ backgroundColor: GOLD, paddingTop: 48, paddingBottom: 0, position: "relative" }}>
      <style>{`
        .ananda-hl-grid { display: grid; grid-template-columns: 1fr; gap: 40px; max-width: 1280px; margin: 0 auto; padding: 0 32px 48px; }
        @media(min-width: 900px) { .ananda-hl-grid { grid-template-columns: repeat(3, 1fr); } }

        .ananda-hl-item { display: flex; flex-direction: column; align-items: center; gap: 20px; cursor: default; }

        .ananda-hl-circle {
          width: 112px; height: 112px; border-radius: 50%;
          background-color: #ECE4D7;
          display: flex; align-items: center; justify-content: center;
          padding: 20px;
          box-shadow: 0 0 0 0 rgba(242,237,228,0);
          transition: transform 0.4s cubic-bezier(0.34,1.56,0.64,1),
                      box-shadow 0.4s ease,
                      background-color 0.3s ease;
          position: relative;
        }
        .ananda-hl-circle::after {
          content: '';
          position: absolute; inset: -4px;
          border-radius: 50%;
          border: 1.5px solid rgba(242,237,228,0);
          transition: border-color 0.35s ease, inset 0.4s cubic-bezier(0.34,1.56,0.64,1);
        }
        .ananda-hl-item:hover .ananda-hl-circle {
          transform: translateY(-6px) scale(1.07);
          background-color: #fff8f0;
          box-shadow: 0 16px 36px rgba(0,0,0,0.18);
        }
        .ananda-hl-item:hover .ananda-hl-circle::after {
          border-color: rgba(242,237,228,0.7);
          inset: -7px;
        }

        .ananda-hl-icon {
          width: 100%; height: 100%; object-fit: contain;
          transition: transform 0.45s cubic-bezier(0.34,1.56,0.64,1);
          transform-origin: center;
        }
        .ananda-hl-item:hover .ananda-hl-icon {
          transform: scale(1.12) rotate(-4deg);
        }

        .ananda-hl-label {
          font-size: 11px; font-weight: 500;
          letter-spacing: 3px; text-transform: uppercase; text-align: center;
          color: #F2EDE4; margin: 0; line-height: 1.8;
          white-space: pre-line;
          transition: letter-spacing 0.35s ease, opacity 0.3s ease;
        }
        .ananda-hl-item:hover .ananda-hl-label {
          letter-spacing: 4px;
          opacity: 0.85;
        }
      `}</style>

      <div className="ananda-hl-grid">
        {items.map((item, i) => (
          <div key={i} className="ananda-hl-item">
            <div className="ananda-hl-circle">
              <img loading="lazy" src={item.icon} alt="" aria-hidden className="ananda-hl-icon" />
            </div>
            <p className="ananda-hl-label" style={{ fontFamily: FONT }}><GenericEditableText sectionId={sectionId} field={`items.${i}.label`} value={item.label} tag="span" /></p>
          </div>
        ))}
      </div>

      {/* Arch divider — cream výplň přes celou šířku, 1:1 anandaspa.cz */}
      <div style={{ lineHeight: 0, overflow: "hidden" }} aria-hidden>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 40" preserveAspectRatio="none" style={{ display: "block", width: "100%", height: 40 }} fill={CREAM}>
          <path d="M720,40C480,40,240,20,0,0L0,40L1440,40L1440,0C1200,20,960,40,720,40Z" />
        </svg>
      </div>
    </section>
  );
}

// ── ananda-01-hotels ──────────────────────────────────────────────────────────
function HotelsAnanda01({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const GOLD  = "#AA813A";
  const CREAM = "#F2EDE4";
  const DARK  = "#1a1208";

  const title    = String(content.title    ?? "NABÍDKA PARTNERSKÝCH HOTELŮ");
  const subtitle = String(content.subtitle ?? "Jako klient Anandy SPA získáte exkluzivní slevu na ubytování v našich partnerských hotelech v centru Prahy.");

  type HotelItem = { image?: string; name?: string; stars?: number; desc?: string; href?: string };
  const hotels: HotelItem[] = Array.isArray(content.hotels)
    ? (content.hotels as HotelItem[])
    : [
        { image: "/templates/ananda-01/hotel-1.jpg", name: "Hotel Praha Grand",    stars: 5, desc: "Luxusní 5* hotel v srdci Prahy, 5 minut od Anandy SPA.",    href: "#" },
        { image: "/templates/ananda-01/hotel-2.jpg", name: "Boutique Hotel Rezia", stars: 4, desc: "Klidná poloha, snídaně v ceně, exkluzivní sleva 15 %.",       href: "#" },
        { image: "/templates/ananda-01/hotel-3.jpg", name: "Hotel Yasmin Praha",   stars: 4, desc: "Design hotel s privátním wellness, 10 minut pěšky.",          href: "#" },
        { image: "/templates/ananda-01/hotel-4.jpg", name: "Art Nouveau Palace",   stars: 5, desc: "Secesní palác, historické centrum, nadstandardní apartmány.", href: "#" },
      ];

  return (
    <section id="hotely" style={{ backgroundColor: CREAM, padding: "80px 0 88px" }}>
      <style>{`
        .ana-htl-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 24px;
          max-width: 1200px;
          margin: 48px auto 0;
          padding: 0 32px;
        }
        @media (max-width: 900px) {
          .ana-htl-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 540px) {
          .ana-htl-grid { grid-template-columns: 1fr; }
        }
        .ana-htl-card {
          background: #fff;
          border-radius: 4px;
          overflow: hidden;
          box-shadow: 0 4px 18px rgba(26,18,8,0.10);
          display: flex;
          flex-direction: column;
          transition: transform 0.35s cubic-bezier(0.25,0.46,0.45,0.94), box-shadow 0.35s ease;
        }
        .ana-htl-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 12px 36px rgba(26,18,8,0.18);
        }
        .ana-htl-img-wrap {
          position: relative;
          width: 100%;
          aspect-ratio: 4/3;
          overflow: hidden;
          background: #c9bfb4;
        }
        .ana-htl-img-wrap img {
          width: 100%; height: 100%; object-fit: cover;
          transition: transform 0.5s cubic-bezier(0.25,0.46,0.45,0.94);
        }
        .ana-htl-card:hover .ana-htl-img-wrap img {
          transform: scale(1.08);
        }
        .ana-htl-body {
          padding: 20px 20px 24px;
          display: flex;
          flex-direction: column;
          flex: 1;
        }
        .ana-htl-stars {
          display: flex;
          gap: 2px;
          margin-bottom: 8px;
        }
        .ana-htl-name {
          font-family: 'Jost', sans-serif;
          font-size: 17px;
          font-weight: 500;
          color: ${DARK};
          margin: 0 0 8px;
          letter-spacing: 0.5px;
        }
        .ana-htl-desc {
          font-family: 'Jost', sans-serif;
          font-size: 13.5px;
          color: #5a4e40;
          line-height: 1.6;
          margin: 0 0 18px;
          flex: 1;
        }
        .ana-htl-cta {
          display: inline-block;
          align-self: flex-start;
          font-family: 'Jost', sans-serif;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: ${GOLD};
          border: 1px solid ${GOLD};
          border-radius: 2px;
          padding: 8px 18px;
          text-decoration: none;
          transition: background 0.25s ease, color 0.25s ease;
        }
        .ana-htl-cta:hover {
          background: ${GOLD};
          color: #fff;
        }
      `}</style>

      {/* Heading */}
      <div style={{ textAlign: "center", padding: "0 32px" }}>
        <h2 style={{
          fontFamily: "'Jost', sans-serif",
          fontSize: "clamp(22px,3vw,32px)",
          fontWeight: 300,
          letterSpacing: "5px",
          textTransform: "uppercase",
          color: GOLD,
          margin: "0 0 18px",
        }}>
          <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
        </h2>
        <p style={{
          fontFamily: "'Jost', sans-serif",
          fontSize: 15,
          color: "#5a4e40",
          maxWidth: 640,
          margin: "0 auto",
          lineHeight: 1.7,
        }}>
          <GenericEditableText sectionId={sectionId} field="subtitle" value={subtitle} tag="span" />
        </p>
      </div>

      {/* Hotel cards */}
      <div className="ana-htl-grid">
        {hotels.map((h, i) => (
          <div key={i} className="ana-htl-card">
            <div className="ana-htl-img-wrap">
              {h.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img loading="lazy" src={h.image} alt={h.name ?? "Hotel"} />
              ) : (
                <div style={{ width: "100%", height: "100%", background: `hsl(${30 + i * 15},20%,75%)` }} />
              )}
            </div>
            <div className="ana-htl-body">
              <div className="ana-htl-stars">
                {Array.from({ length: h.stars ?? 4 }).map((_, si) => (
                  <svg key={si} width="14" height="14" viewBox="0 0 24 24" fill={GOLD}>
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                ))}
              </div>
              <p className="ana-htl-name"><GenericEditableText sectionId={sectionId} field={`hotels.${i}.name`} value={h.name ?? "Hotel Praha"} tag="span" /></p>
              <p className="ana-htl-desc"><GenericEditableText sectionId={sectionId} field={`hotels.${i}.desc`} value={h.desc ?? "Luxusní ubytování v centru Prahy."} tag="span" /></p>
              <a href={h.href ?? "#"} className="ana-htl-cta">Více informací</a>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ── ananda-01-faq ─────────────────────────────────────────────────────────────
function FaqAnanda01({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const GOLD  = "#AA813A";
  const CREAM = "#F2EDE4";

  const title = String(content.title ?? "ČASTO KLADENÉ OTÁZKY");

  type FaqItem = { q?: string; a?: string };
  const items: FaqItem[] = Array.isArray(content.items)
    ? (content.items as FaqItem[])
    : [
        { q: "Co je ájurvéda a jak funguje?",
          a: "Ájurvéda je více než 5 000 let staré tradiční indické léčitelství. Pracuje s individuální konstitucí člověka (dóša) a nabízí komplexní přístup ke zdraví — od procedur přes stravování až po životní styl." },
        { q: "Musím se před první návštěvou připravovat?",
          a: "Stačí přijít v pohodlném oblečení. Naši terapeuti vás před procedurou provedou krátkým dotazníkem. Doporučujeme nepřicházet bezprostředně po jídle." },
        { q: "Jak dlouho trvá jedna ájurvédská procedura?",
          a: "Délka závisí na vybrané proceduře — pohybuje se od 45 minut (krátká relaxační masáž) až po 3 hodiny (komplexní léčebný pobyt Panchakarma)." },
        { q: "Jsou procedury vhodné i pro děti?",
          a: "Vybrané procedury lze provádět u dětí od 8 let za přítomnosti rodiče. Při rezervaci vždy upřesněte věk dítěte a my vám doporučíme vhodnou variantu." },
        { q: "Jak si mohu zarezervovat termín?",
          a: "Rezervaci provedete přes kontaktní formulář níže, telefonicky nebo e-mailem. Termíny jsou obvykle dostupné do 5 pracovních dnů." },
        { q: "Nabízíte dárkové poukazy?",
          a: "Ano! Dárkové vouchery lze zakoupit online nebo přímo v recepci studia. Jsou platné 6 měsíců od data vydání a lze je použít na jakoukoli proceduru z naší nabídky." },
      ];

  return (
    <section id="faq" style={{ backgroundColor: "#fff", padding: "80px 0" }}>
      <style>{`
        .ana-faq-wrap {
          max-width: 820px;
          margin: 0 auto;
          padding: 0 32px;
        }
        .ana-faq-item {
          border-bottom: 1px solid rgba(170,129,58,0.25);
        }
        .ana-faq-item:first-of-type {
          border-top: 1px solid rgba(170,129,58,0.25);
        }
        .ana-faq-trigger {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          background: none;
          border: none;
          cursor: pointer;
          padding: 22px 0;
          text-align: left;
          gap: 16px;
        }
        .ana-faq-q {
          font-family: 'Jost', sans-serif;
          font-size: 16px;
          font-weight: 400;
          color: #1a1208;
          letter-spacing: 0.5px;
          line-height: 1.4;
        }
        .ana-faq-chevron {
          flex-shrink: 0;
          width: 22px;
          height: 22px;
          transition: transform 0.3s ease;
        }
        .ana-faq-chevron.open {
          transform: rotate(180deg);
        }
        .ana-faq-body {
          overflow: hidden;
          max-height: 0;
          transition: max-height 0.4s cubic-bezier(0.4,0,0.2,1), padding 0.3s ease;
          padding: 0 0 0;
        }
        .ana-faq-body.open {
          max-height: 400px;
          padding: 0 0 22px;
        }
        .ana-faq-a {
          font-family: 'Jost', sans-serif;
          font-size: 14.5px;
          color: #5a4e40;
          line-height: 1.75;
          margin: 0;
        }
      `}</style>

      <div className="ana-faq-wrap">
        <h2 style={{
          fontFamily: "'Jost', sans-serif",
          fontSize: "clamp(20px,2.5vw,30px)",
          fontWeight: 300,
          letterSpacing: "5px",
          textTransform: "uppercase",
          color: GOLD,
          textAlign: "center",
          margin: "0 0 48px",
        }}>
          <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
        </h2>

        {items.map((item, i) => (
          <FaqItemRow key={i} q={item.q ?? ""} a={item.a ?? ""} gold={GOLD} sectionId={sectionId} idx={i} />
        ))}
      </div>
    </section>
  );
}

// ─── tawan-02-boxes ─────────────────────────────────────────────────────────
const T02_ICON_BASE = "/clones/escape/wp-content/themes/twentyseventeen/assets/icons";
const T02_ICONS = [
  { key: "Masáže",          default: `${T02_ICON_BASE}/masaze-default.svg`,   hover: `${T02_ICON_BASE}/masaze-hover.svg`   },
  { key: "Dárkové poukazy", default: `${T02_ICON_BASE}/darkove-default.svg`,  hover: `${T02_ICON_BASE}/darkove-hover.svg`  },
  { key: "Rezervace",       default: `${T02_ICON_BASE}/rezervace-default.svg`,hover: `${T02_ICON_BASE}/rezervace-hover.svg` },
];

function BoxesTawan02({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  type BoxItem = { title: string; desc?: string; description?: string; href?: string };
  const rawItems = Array.isArray(content.items) ? content.items : Array.isArray(content.boxes) ? content.boxes : null;
  const boxes: BoxItem[] = rawItems
    ? (rawItems as BoxItem[])
    : [
        { title: "Masáže",          desc: "Prozkoumejte nabídku relaxačních masáží.", href: "#" },
        { title: "Dárkové poukazy", desc: "Darujte únik od stresu a napětí svým blízkým.", href: "#" },
        { title: "Rezervace",       desc: "Naplánujte si chvíle odpočinku ještě dnes.", href: "#" },
      ];

  return (
    <section style={{
      padding: "120px 0",
      fontSize: 16,
      lineHeight: "20px",
      backgroundImage: "url(/clones/escape/wp-content/themes/twentyseventeen/assets/images/flower.png)",
      backgroundRepeat: "no-repeat",
      backgroundPosition: "top left",
      backgroundColor: "#fff",
      fontFamily: "Candara, 'Trebuchet MS', Arial, sans-serif",
    }}>
      <style>{`
        .t02-box { text-decoration: none; color: rgba(60,47,37,0.65); position: relative; text-align: center; cursor: default; }
        .t02-box-img { height: 106px; width: 100%; position: relative; margin-bottom: 20px; display: flex; align-items: center; justify-content: center; }
        .t02-box-img .t02-icon-default { height: 106px; width: auto; transition: opacity 0.4s; display: block; }
        .t02-box-img .t02-icon-hover   { height: 106px; width: auto; position: absolute; top: 50%; left: 50%; transform: translate(-50%,-50%); opacity: 0; transition: opacity 0.4s; display: block; }
        .t02-box:hover .t02-icon-default { opacity: 0; }
        .t02-box:hover .t02-icon-hover   { opacity: 1; }
        .t02-box h3 { margin-bottom: 10px; font-size: 22px; font-weight: 700; color: rgba(60,47,37,0.9); transition: color 0.3s; font-family: Candara, 'Trebuchet MS', Arial, sans-serif; }
        .t02-box:hover h3 { color: #927259; }
        .t02-hover-hide { transition: opacity 0.4s; }
        .t02-box:hover .t02-hover-hide { opacity: 0; visibility: hidden; }
        .t02-learn-more-wrap { position: relative; min-height: 24px; }
        .t02-learn-more { position: absolute; top: 0; left: 50%; transform: translateX(-50%); color: #3C2F25; text-decoration: none; transition: opacity 0.4s; opacity: 0; visibility: hidden; white-space: nowrap; font-size: 14px; letter-spacing: 1px; }
        .t02-learn-more::after { content: ''; display: block; width: 40px; height: 1px; background: #3C2F25; margin: 4px auto 0; }
        .t02-box:hover .t02-learn-more { opacity: 1; visibility: visible; }
      `}</style>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 40, textAlign: "center" }}>
          {boxes.map((box, i) => {
            const icon = T02_ICONS[i] ?? T02_ICONS[0];
            return (
              <div key={i} className="t02-box" style={{ padding: "0 20px" }}>
                <div className="t02-box-img">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img loading="lazy" src={icon.default} alt="" className="t02-icon-default" />
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img loading="lazy" src={icon.hover}   alt="" className="t02-icon-hover"   />
                </div>
                <h3><GenericEditableText sectionId={sectionId} field={`items.${i}.title`} value={box.title} tag="span" /></h3>
                <div className="t02-learn-more-wrap">
                  <div className="t02-hover-hide">
                    <p style={{ margin: 0, fontSize: 16, color: "rgba(60,47,37,0.65)" }}><GenericEditableText sectionId={sectionId} field={`items.${i}.desc`} value={box.desc ?? box.description ?? ""} tag="span" /></p>
                  </div>
                  <span className="t02-learn-more">Zjistit více</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ─── tawan-02-why ────────────────────────────────────────────────────────────
function WhyTawan02({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const title   = String(content.title   ?? "Proč k nám?");
  const body    = String(content.body    ?? "");
  const ctaText = String(content.ctaText ?? "Více o nás");
  const ctaHref = String(content.ctaHref ?? "#kontakt");
  const images  = Array.isArray(content.images)
    ? (content.images as string[])
    : [
        "/clones/escape/wp-content/uploads/2024/04/1.png",
        "/clones/escape/wp-content/uploads/2024/04/2.png",
      ];

  const [slide, setSlide] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setSlide(s => (s + 1) % images.length), 4000);
    return () => clearInterval(t);
  }, [images.length]);

  const FONT   = "Candara, 'Trebuchet MS', Arial, sans-serif";
  const ACCENT = "#AD8F78";
  const BROWN  = "#3C2F25";

  return (
    <section style={{
      padding: "110px 0",
      fontFamily: FONT,
      fontSize: 20,
      lineHeight: "35px",
    }}>
      <style>{`
        .t02-why-wrap {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          background: linear-gradient(90deg, rgba(173,143,120,0.5) 0%, transparent 100%);
          border-radius: 0;
        }
        .t02-why-img-block {
          width: 50%;
          position: relative;
          flex-shrink: 0;
        }
        .t02-why-img-block::before {
          content: '';
          position: absolute;
          top: -30px; bottom: -30px;
          left: 40px; right: 40px;
          background-color: ${ACCENT};
          z-index: 0;
        }
        .t02-why-img-block img {
          position: relative;
          width: 100%;
          display: block;
          z-index: 1;
          transition: opacity 0.7s ease;
        }
        .t02-why-content {
          width: 50%;
          padding: 30px 70px;
        }
        .t02-why-content h2 {
          font-size: clamp(28px, 3vw, 42px);
          font-weight: 700;
          color: ${BROWN};
          margin: 0 0 20px;
          font-family: ${FONT};
        }
        .t02-why-content p {
          color: rgba(60,47,37,0.7);
          max-width: 575px;
          margin: 0;
        }
        .t02-why-btn {
          display: inline-block;
          margin-top: 30px;
          padding: 0 32px;
          height: 48px;
          line-height: 46px;
          border: 1.5px solid ${ACCENT};
          border-radius: 8px;
          background: transparent;
          color: ${BROWN};
          font-family: ${FONT};
          font-size: 13px;
          font-weight: 700;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          text-decoration: none;
          transition: background 0.25s, color 0.25s;
        }
        .t02-why-btn:hover { background: ${ACCENT}; color: #fff; }
        @media(max-width: 768px) {
          .t02-why-wrap { flex-direction: column-reverse; background: none; }
          .t02-why-img-block { width: 100%; }
          .t02-why-img-block::before { display: none; }
          .t02-why-content { width: 100%; padding: 40px 24px; }
        }
      `}</style>

      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 24px" }}>
        <div className="t02-why-wrap">

          {/* Obrázkový slider */}
          <div className="t02-why-img-block">
            {images.map((src, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={src}
                src={src}
                alt=""
                style={{
                  opacity: i === slide ? 1 : 0,
                  position: i === 0 ? "relative" : "absolute",
                  top: i === 0 ? undefined : 0,
                  left: i === 0 ? undefined : 0,
                  width: "100%",
                }}
              />
            ))}
          </div>

          {/* Text blok */}
          <div className="t02-why-content">
            <h2><GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" /></h2>
            <p><GenericEditableText sectionId={sectionId} field="body" value={body} tag="span" /></p>
            <a href={ctaHref} data-btn="primary" className="t02-why-btn"><GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" /></a>
          </div>

        </div>
      </div>
    </section>
  );
}

// ─── tawan-02-gift ───────────────────────────────────────────────────────────
function GiftTawan02({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const title   = String(content.title   ?? "Darujte odpočinek");
  const body    = String(content.body    ?? "Chcete dopřát únik od stresu a napětí svým blízkým? Potěšte je dárkovým poukazem do našeho salonu.");
  const ctaText = String(content.ctaText ?? "Zjistit více");
  const ctaHref = String(content.ctaHref ?? "#voucher");
  const image   = String(content.image   ?? "/clones/escape/wp-content/uploads/2024/04/special-offer1.png");

  const FONT   = "Candara, 'Trebuchet MS', Arial, sans-serif";
  const ACCENT = "#AD8F78";
  const BROWN  = "#3C2F25";

  return (
    <section style={{ padding: "100px 0 0", fontFamily: FONT }}>
      <style>{`
        .t02-gift-row {
          background: rgba(173,143,120,0.15);
          display: flex;
          flex-wrap: wrap;
          align-items: flex-end;
          backgroundImage: url(/clones/escape/wp-content/themes/twentyseventeen/assets/images/special-offer-flower.png);
          background-repeat: no-repeat;
          background-position: top center;
        }
        .t02-gift-text { width: 60%; padding: 60px; font-size: 20px; line-height: 35px; }
        .t02-gift-text h2 { font-size: clamp(26px,3vw,40px); font-weight: 700; color: ${BROWN}; margin: 0 0 16px; font-family: ${FONT}; }
        .t02-gift-text p { max-width: 575px; color: rgba(60,47,37,0.7); margin: 0; }
        .t02-gift-btn {
          display: inline-block; margin-top: 28px;
          padding: 0 32px; height: 48px; line-height: 46px;
          border: 1.5px solid ${ACCENT}; border-radius: 8px;
          background: transparent; color: ${BROWN};
          font-family: ${FONT}; font-size: 13px; font-weight: 700;
          letter-spacing: 1.5px; text-transform: uppercase; text-decoration: none;
          transition: background 0.25s, color 0.25s;
        }
        .t02-gift-btn:hover { background: ${ACCENT}; color: #fff; }
        .t02-gift-img { width: 50%; margin-left: -10%; }
        .t02-gift-img img { width: 100%; display: block; }
        @media(max-width: 768px) {
          .t02-gift-row { flex-direction: column; }
          .t02-gift-text { width: 100%; padding: 30px 22px 15px; font-size: 16px; line-height: 30px; }
          .t02-gift-img { width: 100%; margin-left: 0; }
        }
      `}</style>

      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 24px" }}>
        <div className="t02-gift-row" style={{
          backgroundImage: "url(/clones/escape/wp-content/themes/twentyseventeen/assets/images/special-offer-flower.png)",
        }}>
          <div className="t02-gift-text">
            <h2><GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" /></h2>
            <p><GenericEditableText sectionId={sectionId} field="body" value={body} tag="span" /></p>
            <a href={ctaHref} data-btn="primary" className="t02-gift-btn"><GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" /></a>
          </div>
          <div className="t02-gift-img">
            <GenericEditableImage sectionId={sectionId} field="image" src={image} alt={title}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img loading="lazy" src={image} alt={title} style={{ width: "100%", display: "block" }} />
            </GenericEditableImage>
          </div>
        </div>
      </div>
    </section>
  );
}

function FaqItemRow({ q, a, gold, sectionId, idx }: { q: string; a: string; gold: string; sectionId: number; idx: number }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="ana-faq-item">
      <button className="ana-faq-trigger" onClick={() => setOpen(o => !o)} aria-expanded={open}>
        <span className="ana-faq-q"><GenericEditableText sectionId={sectionId} field={`items.${idx}.q`} value={q} tag="span" /></span>
        <svg className={`ana-faq-chevron${open ? " open" : ""}`} viewBox="0 0 24 24" fill="none" stroke={gold} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>
      <div className={`ana-faq-body${open ? " open" : ""}`}>
        <p className="ana-faq-a"><GenericEditableText sectionId={sectionId} field={`items.${idx}.a`} value={a} tag="span" /></p>
      </div>
    </div>
  );
}

// ── tattoo-01-intro ───────────────────────────────────────────────────────────
// Centrovaný citátový blok — bílé bg, serifový text, červená dekorativní linka
// Reference: tribo-demo sekce 1 — block-quote centered, height--normal
// ─────────────────────────────────────────────────────────────────────────────
function IntroTattoo01({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const title = String(content.title ?? "Profesionální tetování a piercing");
  const body  = String(content.body  ?? content.text ?? "");
  const ACCENT = "#ff5c4b";
  const SANS   = "Arial, Helvetica, sans-serif";

  return (
    <section
      id="o-nas"
      data-template="tattoo-01"
      style={{ backgroundColor: "#ffffff", padding: "clamp(56px, 8vw, 96px) clamp(24px, 6vw, 80px)" }}
    >
      <div style={{ maxWidth: 860, margin: "0 auto", textAlign: "center" }}>
        {/* Dekorativní červená linka nahoře */}
        <div style={{ width: 48, height: 3, backgroundColor: ACCENT, margin: "0 auto 32px" }} aria-hidden />

        <h2
          style={{
            fontFamily: "'Arial Black', Arial, sans-serif",
            fontSize: "clamp(1.5rem, 3vw, 2.25rem)",
            fontWeight: 900,
            color: "#0a0a0a",
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            margin: "0 0 28px",
          }}
        >
          <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
        </h2>

        {body && (
          <p
            style={{
              fontFamily: SANS,
              fontSize: "clamp(1rem, 1.6vw, 1.125rem)",
              fontWeight: 400,
              color: "#3a3a3a",
              lineHeight: 1.8,
              margin: 0,
            }}
          >
            <GenericEditableText sectionId={sectionId} field="body" value={body} tag="span" />
          </p>
        )}
      </div>
    </section>
  );
}

// ── tattoo-01-services-tattoo / tattoo-01-services-piercing ──────────────────
// 2-sloupcový layout: text vlevo + foto vpravo (nebo opačně pro piercing)
// Reference: tribo-demo sekce 2+3 — box-container--secondary, flex, 50/50
// ─────────────────────────────────────────────────────────────────────────────
function ServicesTattoo01({
  content,
  sectionId,
  side,
}: {
  content: Record<string, unknown>;
  sectionId: number;
  side: "left" | "right";
}) {
  const heading  = String(content.heading ?? content.title ?? "");
  const text     = String(content.text    ?? content.body  ?? "");
  const cta1Text = String(content.cta1Text ?? "Objednat se");
  const cta1Href = String(content.cta1Href ?? "#kontakt");
  const cta2Text = String(content.cta2Text ?? "");
  const cta2Href = String(content.cta2Href ?? "#");
  const image    = String(content.image ?? "");
  const ACCENT   = "#ff5c4b";
  const SANS     = "Arial, Helvetica, sans-serif";

  const textCol = (
    <div
      style={{
        flex: "0 0 50%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: "clamp(40px, 6vw, 72px) clamp(32px, 5vw, 64px)",
      }}
    >
      {/* Červená linka nad nadpisem */}
      <div style={{ width: 36, height: 3, backgroundColor: ACCENT, marginBottom: 20 }} aria-hidden />
      <h2
        style={{
          fontFamily: "'Arial Black', Arial, sans-serif",
          fontSize: "clamp(1.6rem, 3vw, 2.4rem)",
          fontWeight: 900,
          color: "#0a0a0a",
          textTransform: "uppercase",
          letterSpacing: "0.04em",
          margin: "0 0 20px",
        }}
      >
        <GenericEditableText sectionId={sectionId} field="heading" value={heading} tag="span" />
      </h2>
      <p
        style={{
          fontFamily: SANS,
          fontSize: "clamp(0.95rem, 1.4vw, 1.05rem)",
          fontWeight: 400,
          color: "#3a3a3a",
          lineHeight: 1.75,
          margin: "0 0 32px",
        }}
      >
        <GenericEditableText sectionId={sectionId} field="text" value={text} tag="span" />
      </p>
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
        <a
          href={cta1Href}
          style={{
            display: "inline-flex", alignItems: "center",
            backgroundColor: ACCENT, color: "#ffffff",
            fontFamily: SANS, fontSize: "0.75rem", fontWeight: 700,
            letterSpacing: "0.12em", textTransform: "uppercase",
            textDecoration: "none", padding: "12px 28px",
            transition: "background 0.2s",
          }}
          onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#d94a38")}
          onMouseLeave={e => (e.currentTarget.style.backgroundColor = ACCENT)}
        >
          <GenericEditableText sectionId={sectionId} field="cta1Text" value={cta1Text} tag="span" />
        </a>
        {cta2Text && (
          <a
            href={cta2Href}
            style={{
              display: "inline-flex", alignItems: "center",
              border: "1.5px solid #0a0a0a", color: "#0a0a0a",
              fontFamily: SANS, fontSize: "0.75rem", fontWeight: 700,
              letterSpacing: "0.12em", textTransform: "uppercase",
              textDecoration: "none", padding: "12px 28px",
              transition: "background 0.2s, color 0.2s",
            }}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = "#0a0a0a"; e.currentTarget.style.color = "#ffffff"; }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = "#0a0a0a"; }}
          >
            <GenericEditableText sectionId={sectionId} field="cta2Text" value={cta2Text} tag="span" />
          </a>
        )}
      </div>
    </div>
  );

  const photoCol = (
    <div
      style={{
        flex: "0 0 50%",
        position: "relative",
        minHeight: "clamp(300px, 40vw, 560px)",
        overflow: "hidden",
        backgroundColor: "#111",
      }}
    >
      {image && (
        <GenericEditableImage
          sectionId={sectionId}
          field="image"
          src={image}
          alt={heading}
          className="absolute inset-0 w-full h-full"
          style={{ position: "absolute" }}
        >
          <Image
            src={image}
            alt={heading}
            fill
            className="object-cover"
            sizes="50vw"
            unoptimized={shouldSkipNextImageOptimization(image)}
          />
        </GenericEditableImage>
      )}
    </div>
  );

  return (
    <>
      <style>{`
        @media (max-width: 767px) {
          [data-sec="t01-service"] { flex-direction: column !important; }
          [data-sec="t01-service"] > div { flex: 1 1 100% !important; min-height: 260px; }
        }
      `}</style>
      <section
        data-template="tattoo-01"
        data-sec="t01-service"
        style={{
          display: "flex",
          flexDirection: "row",
          backgroundColor: "#f7f7f7",
          overflow: "hidden",
        }}
      >
        {side === "left" ? <>{textCol}{photoCol}</> : <>{photoCol}{textCol}</>}
      </section>
    </>
  );
}

// ── tattoo-01-principles ─────────────────────────────────────────────────────
// 4 karty s ikonami — tmavý bg (#0a0a0a), bílý text, červené ikony
// Reference: tribo.cz — "Naše zásady" sekce
// ─────────────────────────────────────────────────────────────────────────────
function PrinciplesTattoo01({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const heading = String(content.heading ?? content.title ?? "Naše zásady");
  const items   = (content.items as Array<{ icon?: string; title?: string; text?: string }>) ?? [];
  const ACCENT  = "#ff5c4b";
  const SANS    = "Arial, Helvetica, sans-serif";

  const iconSvg = (name?: string) => {
    const base = { width: 36, height: 36, viewBox: "0 0 24 24", fill: "none", stroke: ACCENT, strokeWidth: 1.5, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
    switch (name) {
      case "hygiene":
        return <svg {...base}><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/><path d="M8 12l2.5 2.5L16 9"/></svg>;
      case "care":
        return <svg {...base}><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>;
      case "tools":
        return <svg {...base}><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>;
      case "friendly":
        return <svg {...base}><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>;
      default:
        return <svg {...base}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>;
    }
  };

  return (
    <section
      id="zasady"
      data-template="tattoo-01"
      style={{ backgroundColor: "#0a0a0a", padding: "clamp(56px, 8vw, 96px) clamp(24px, 6vw, 80px)" }}
    >
      <div style={{ maxWidth: 1280, margin: "0 auto" }}>
        {/* Heading */}
        <div style={{ textAlign: "center", marginBottom: "clamp(40px, 6vw, 64px)" }}>
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

        {/* 4 karty */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "clamp(24px, 3vw, 40px)",
          }}
        >
          {items.map((item, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                gap: 16,
                padding: "clamp(24px, 3vw, 36px)",
                border: "1px solid rgba(255,255,255,0.08)",
                backgroundColor: "rgba(255,255,255,0.03)",
              }}
            >
              <div style={{ flexShrink: 0 }}>{iconSvg(item.icon)}</div>
              <h3
                style={{
                  fontFamily: SANS,
                  fontSize: "1rem",
                  fontWeight: 700,
                  color: "#ffffff",
                  margin: 0,
                  letterSpacing: "0.02em",
                }}
              >
                <GenericEditableText sectionId={sectionId} field={`items.${i}.title`} value={item.title ?? ""} tag="span" />
              </h3>
              <p
                style={{
                  fontFamily: SANS,
                  fontSize: "0.9rem",
                  fontWeight: 400,
                  color: "rgba(255,255,255,0.6)",
                  lineHeight: 1.65,
                  margin: 0,
                }}
              >
                <GenericEditableText sectionId={sectionId} field={`items.${i}.text`} value={item.text ?? ""} tag="span" />
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── tattoo-02-about ───────────────────────────────────────────────────────────
// 2-col layout: vlevo text + stats + CTA, vpravo velká fotka studia.
// Bílé pozadí, černý nadpis, zlaté akcenty.
// ─────────────────────────────────────────────────────────────────────────────
function AboutTattoo02({ content, sectionId }: {
  content: Record<string, unknown>;
  sectionId: number;
}) {
  const c       = content as Record<string, unknown>;
  const heading = String(c.heading ?? "Nejlepší tetovací salon v Praze");
  const text    = String(c.text    ?? "");
  const text2   = String(c.text2   ?? "");
  const ctaText = String(c.ctaText ?? "Objednat se na konzultaci");
  const ctaHref = String(c.ctaHref ?? "#kontakt");
  const image   = String(c.image   ?? "/templates/tattoo-02/about.jpg");
  const stats   = (c.stats as Array<{ number: string; label: string }>) ?? [];

  const GOLD = "#BF8A1D";

  return (
    <>
      <style>{`
        .ta02-about-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          min-height: 560px;
        }
        @media (max-width: 860px) {
          .ta02-about-grid { grid-template-columns: 1fr; }
          .ta02-about-img  { min-height: 320px; order: -1; }
        }
        .ta02-stat-row { display: flex; gap: 0; flex-wrap: wrap; margin: 36px 0 40px; }
        .ta02-stat { flex: 1; min-width: 120px; padding: 20px 0; border-right: 1px solid #e8e8e8; }
        .ta02-stat:last-child { border-right: none; }
        .ta02-cta-btn {
          display: inline-flex; align-items: center; gap: 10px;
          background: ${GOLD}; color: #fff;
          font-family: Arial, sans-serif; font-size: 0.8rem; font-weight: 700;
          letter-spacing: 0.08em; text-decoration: none; text-transform: uppercase;
          padding: 0 32px; height: 50px;
          transition: background 0.2s;
        }
        .ta02-cta-btn:hover { background: #a87318; }
      `}</style>

      <section id="o-nas" data-section="about-tattoo-02" style={{ background: "#fff", paddingTop: "clamp(64px,9vw,120px)", paddingBottom: "clamp(64px,9vw,120px)" }}>
        <div className="ta02-about-grid">

          {/* Levý panel — text */}
          <div style={{
            padding: "clamp(32px,4vw,56px) clamp(28px,5vw,80px)",
            display: "flex", flexDirection: "column", justifyContent: "center",
          }}>
            {/* Eyebrow */}
            <p style={{
              fontFamily: "Arial, sans-serif", fontSize: "0.7rem", fontWeight: 700,
              color: GOLD, letterSpacing: "0.3em", textTransform: "uppercase",
              margin: "0 0 16px",
            }}>
              O nás
            </p>

            {/* Zlatá linka */}
            <div aria-hidden style={{ width: 48, height: 2, backgroundColor: GOLD, marginBottom: 24 }} />

            {/* Nadpis */}
            <h2 style={{
              fontFamily: "'Arial Black', Arial, sans-serif",
              fontWeight: 900, fontSize: "clamp(26px, 3.2vw, 40px)",
              color: "#1a1a1a", lineHeight: 1.15, margin: "0 0 24px",
            }}>
              <GenericEditableText sectionId={sectionId} field="heading" value={heading} tag="span" />
            </h2>

            {/* Text */}
            <p style={{
              fontFamily: "Arial, sans-serif", fontSize: "0.95rem",
              color: "#444", lineHeight: 1.75, margin: "0 0 16px",
            }}>
              <GenericEditableText sectionId={sectionId} field="text" value={text} tag="span" />
            </p>
            {text2 && (
              <p style={{
                fontFamily: "Arial, sans-serif", fontSize: "0.95rem",
                color: "#444", lineHeight: 1.75, margin: 0,
              }}>
                <GenericEditableText sectionId={sectionId} field="text2" value={text2} tag="span" />
              </p>
            )}

            {/* Stats */}
            {stats.length > 0 && (
              <div className="ta02-stat-row">
                {stats.map((s, i) => (
                  <div key={i} className="ta02-stat">
                    <div style={{
                      fontFamily: "'Arial Black', Arial, sans-serif",
                      fontWeight: 900, fontSize: "clamp(24px, 2.8vw, 34px)",
                      color: GOLD, lineHeight: 1,
                    }}>
                      <GenericEditableText sectionId={sectionId} field={`stats.${i}.number`} value={s.number} tag="span" />
                    </div>
                    <div style={{
                      fontFamily: "Arial, sans-serif", fontSize: "0.72rem",
                      color: "#888", letterSpacing: "0.04em",
                      textTransform: "uppercase", marginTop: 6,
                    }}>
                      <GenericEditableText sectionId={sectionId} field={`stats.${i}.label`} value={s.label} tag="span" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* CTA */}
            <div>
              <a href={ctaHref} data-btn="primary" className="ta02-cta-btn">
                <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
                <svg width="16" height="10" viewBox="0 0 16 10" fill="none" aria-hidden>
                  <path d="M1 5h14M10 1l5 4-5 4" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Pravý panel — fotka */}
          <div className="ta02-about-img" style={{ position: "relative", overflow: "hidden", minHeight: 500 }}>
            <GenericEditableImage sectionId={sectionId} field="image" src={image} alt={heading} className="relative" style={{ height: "100%" }}>
              <img
                src={image}
                alt={heading}
                style={{
                  width: "100%", height: "100%",
                  objectFit: "cover", objectPosition: "center",
                  display: "block",
                }}
              />
            </GenericEditableImage>
            {/* Zlatá dekorativní linka vlevo na fotce */}
            <div aria-hidden style={{
              position: "absolute", left: 0, top: "10%", bottom: "10%",
              width: 4, backgroundColor: GOLD, opacity: 0.85,
            }} />
          </div>

        </div>
      </section>
    </>
  );
}

// ── tattoo-03-about ───────────────────────────────────────────────────────────
// Tmavý 2-col about — magictattoo.cz inspired
// Vlevo: červená linka + H2 + body + text2 + CTA + 4 statistiky
// Vpravo: team foto edge-to-edge
// ─────────────────────────────────────────────────────────────────────────────
function AboutTattoo03({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const c       = content as Record<string, unknown>;
  const title   = String(c.title   ?? "Profesionální tetovací salon");
  const body    = String(c.body    ?? "");
  const text2   = String(c.text2   ?? "");
  const ctaText = String(c.ctaText ?? "Objednat se");
  const ctaHref = String(c.ctaHref ?? "#kontakt");
  const image   = String(c.image   ?? "/clones/magic/wp-content/uploads/2026/03/MagicTattoo-team-fotka-scaled.webp");
  const rawStats = (c.stats as Array<{ number: string; label: string }>) ?? [];

  const BG     = "#0A0A0E";
  const ACCENT = "#D41515";

  return (
    <section id="o-nas" style={{ backgroundColor: BG }}>
      <div style={{
        maxWidth: 1360, margin: "0 auto",
        display: "grid", gridTemplateColumns: "1fr 1fr",
        gap: 0,
      }} className="t03-about-grid">
        <style>{`
          @media (max-width: 768px) {
            .t03-about-grid { grid-template-columns: 1fr !important; }
            .t03-about-img  { height: 320px !important; order: -1; }
          }
        `}</style>

        {/* Levý blok — text */}
        <div style={{ padding: "clamp(48px,6vw,96px) clamp(24px,4vw,72px)" }}>
          {/* Červená linka */}
          <div style={{ width: 40, height: 3, backgroundColor: ACCENT, marginBottom: 24 }} aria-hidden />

          <h2 style={{
            fontFamily: "Arial, Helvetica, sans-serif",
            fontWeight: 900,
            fontSize: "clamp(22px, 2.8vw, 36px)",
            color: "#ffffff",
            margin: "0 0 20px",
            lineHeight: 1.2,
          }}>
            <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
          </h2>

          <p style={{
            fontFamily: "Arial, Helvetica, sans-serif",
            fontSize: "clamp(14px, 1.5vw, 16px)",
            color: "rgba(255,255,255,0.72)",
            margin: "0 0 16px",
            lineHeight: 1.75,
          }}>
            <GenericEditableText sectionId={sectionId} field="body" value={body} tag="span" />
          </p>

          {text2 && (
            <p style={{
              fontFamily: "Arial, Helvetica, sans-serif",
              fontSize: "clamp(14px, 1.5vw, 16px)",
              color: "rgba(255,255,255,0.65)",
              margin: "0 0 32px",
              lineHeight: 1.75,
            }}>
              <GenericEditableText sectionId={sectionId} field="text2" value={text2} tag="span" />
            </p>
          )}

          <a
            href={ctaHref}
            data-btn="primary"
            style={{
              display: "inline-flex", alignItems: "center",
              backgroundColor: ACCENT, color: "#ffffff",
              fontFamily: "Arial, Helvetica, sans-serif",
              fontSize: "0.82rem", fontWeight: 700,
              letterSpacing: "0.06em",
              padding: "12px 28px",
              textDecoration: "none",
              marginBottom: 48,
              transition: "background 0.2s",
            }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#b30000")}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = ACCENT)}
          >
            <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
          </a>

          {/* Statistiky */}
          {rawStats.length > 0 && (
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: "24px 32px",
              borderTop: "1px solid rgba(255,255,255,0.1)",
              paddingTop: 32,
            }}>
              {rawStats.map((s, i) => (
                <div key={i}>
                  <div style={{
                    fontFamily: "Arial, Helvetica, sans-serif",
                    fontWeight: 900,
                    fontSize: "clamp(24px, 2.5vw, 36px)",
                    color: ACCENT,
                    lineHeight: 1,
                    marginBottom: 4,
                  }}>
                    <GenericEditableText sectionId={sectionId} field={`stats.${i}.number`} value={s.number} tag="span" />
                  </div>
                  <div style={{
                    fontFamily: "Arial, Helvetica, sans-serif",
                    fontSize: "0.78rem",
                    color: "rgba(255,255,255,0.55)",
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                  }}>
                    <GenericEditableText sectionId={sectionId} field={`stats.${i}.label`} value={s.label} tag="span" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pravý blok — foto */}
        <div
          className="t03-about-img"
          style={{ position: "relative", minHeight: 480 }}
        >
          <GenericEditableImage sectionId={sectionId} field="image" src={image} alt="Tým tetovacího studia" className="absolute inset-0 w-full h-full" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
            <img loading="lazy" src={image} alt="Tým tetovacího studia" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center" }} />
          </GenericEditableImage>
        </div>
      </div>
    </section>
  );
}

// ── tattoo-03-process ─────────────────────────────────────────────────────────
// 3-krokový postup — magictattoo.cz "Jak to probíhá?"
// Tmavý bg #0e0e0e, centrovaný H2, 3 karty s červeným číslem + H3 + text
// ─────────────────────────────────────────────────────────────────────────────
function ProcessTattoo03({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const c          = content as Record<string, unknown>;
  const heading    = String(c.heading    ?? "Jak to probíhá?");
  const subheading = String(c.subheading ?? "3 jednoduché kroky k dokonalému tetování");
  const rawSteps   = (c.steps as Array<{ number: string; title: string; text: string }>) ?? [];

  const BG     = "#0e0e0e";
  const ACCENT = "#D41515";

  return (
    <section id="postup" style={{ backgroundColor: BG, padding: "clamp(48px,7vw,96px) clamp(20px,4vw,40px)" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        {/* Nadpis */}
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <h2 style={{
            fontFamily: "Arial, Helvetica, sans-serif",
            fontWeight: 900,
            fontSize: "clamp(22px, 2.8vw, 38px)",
            color: "#ffffff",
            margin: "0 0 12px",
          }}>
            <GenericEditableText sectionId={sectionId} field="heading" value={heading} tag="span" />
          </h2>
          <p style={{
            fontFamily: "Arial, Helvetica, sans-serif",
            fontSize: "clamp(13px, 1.4vw, 16px)",
            color: "rgba(255,255,255,0.55)",
          }}>
            <GenericEditableText sectionId={sectionId} field="subheading" value={subheading} tag="span" />
          </p>
        </div>

        {/* Kroky */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: 24,
        }}>
          {rawSteps.map((step, i) => (
            <div
              key={i}
              style={{
                backgroundColor: "#141414",
                border: "1px solid rgba(255,255,255,0.07)",
                padding: "36px 28px",
                position: "relative",
              }}
            >
              {/* Číslo */}
              <div style={{
                fontFamily: "Arial, Helvetica, sans-serif",
                fontWeight: 900,
                fontSize: "clamp(48px, 5vw, 72px)",
                color: ACCENT,
                lineHeight: 1,
                marginBottom: 16,
                opacity: 0.9,
              }}>
                <GenericEditableText sectionId={sectionId} field={`steps.${i}.number`} value={step.number} tag="span" />
              </div>
              <h3 style={{
                fontFamily: "Arial, Helvetica, sans-serif",
                fontWeight: 700,
                fontSize: "clamp(16px, 1.6vw, 20px)",
                color: "#ffffff",
                margin: "0 0 12px",
              }}>
                <GenericEditableText sectionId={sectionId} field={`steps.${i}.title`} value={step.title} tag="span" />
              </h3>
              <p style={{
                fontFamily: "Arial, Helvetica, sans-serif",
                fontSize: "0.88rem",
                color: "rgba(255,255,255,0.62)",
                lineHeight: 1.7,
                margin: 0,
              }}>
                <GenericEditableText sectionId={sectionId} field={`steps.${i}.text`} value={step.text} tag="span" />
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── nails-01-about ────────────────────────────────────────────────────────────
// About sekce — soho nails 1:1
// Bílé bg, 2-col: 2/5 text vlevo (H4 + body + SLUŽBY btn) + 3/5 foto vpravo
// Burgund: #79142b, section padding 80px vert
// ─────────────────────────────────────────────────────────────────────────────
function AboutNails01({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const BURGUNDY = "#79142b";

  const title   = String(content.title   ?? "The One and Only – filozofie Studia");
  const lead    = String(content.lead    ?? "Studio vzniklo z inspirace světovými metropolemi – místy, kde se potkává umění, styl a osobitost.");
  const body    = String(content.body    ?? "Filozofie studia čerpá z principů japonského wabi-sabi – z jednoduchosti, klidu a přijetí přirozené nedokonalosti. Každý detail byl vytvořen tak, aby vám přinesl harmonii a pocit opravdového luxusu.");
  const ctaText = String(content.ctaText ?? "SLUŽBY");
  const ctaHref = String(content.ctaHref ?? "#sluzby");
  const imageUrl = String(content.imageUrl ?? "/clones/soho/wp-content/uploads/2025/10/SOHO-Beauty-Salon-Nail-Art-Manicure-Pedicure-Interior-Hair-Styling-1x.webp");

  return (
    <section
      id="o-nas"
      data-section-type="about"
      data-variant="nails-01-about"
      style={{ backgroundColor: "#ffffff", padding: "clamp(60px, 8vh, 100px) 0" }}
    >
      <div style={{
        maxWidth: 1280,
        margin: "0 auto",
        padding: "0 clamp(24px, 6vw, 80px)",
        display: "flex",
        flexDirection: "row",
        flexWrap: "wrap",
        gap: "clamp(40px, 5vw, 80px)",
        alignItems: "center",
      }}>
        {/* Levý sloupec — 2/5 šířky */}
        <div style={{ flex: "2 1 280px", minWidth: 0 }}>
          <h2 style={{
            fontFamily: "Georgia, 'Times New Roman', serif",
            fontSize: "clamp(22px, 2.2vw, 30px)",
            fontWeight: 700,
            color: BURGUNDY,
            lineHeight: 1.3,
            margin: "0 0 24px",
          }}>
            <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
          </h2>

          <p style={{
            fontFamily: "'Helvetica Neue', Arial, sans-serif",
            fontSize: "clamp(14px, 1.1vw, 15px)",
            color: BURGUNDY,
            lineHeight: 1.75,
            margin: "0 0 16px",
            opacity: 0.9,
          }}>
            <GenericEditableText sectionId={sectionId} field="lead" value={lead} tag="span" />
          </p>

          <p style={{
            fontFamily: "'Helvetica Neue', Arial, sans-serif",
            fontSize: "clamp(14px, 1.1vw, 15px)",
            color: BURGUNDY,
            lineHeight: 1.75,
            margin: "0 0 36px",
            opacity: 0.75,
          }}>
            <GenericEditableText sectionId={sectionId} field="body" value={body} tag="span" />
          </p>

          {/* SLUŽBY button — outline burgundy */}
          <a
            href={ctaHref}
            data-btn="primary"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              fontFamily: "'Helvetica Neue', Arial, sans-serif",
              fontSize: "0.78rem",
              fontWeight: 700,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: BURGUNDY,
              textDecoration: "none",
              border: `1.5px solid ${BURGUNDY}`,
              padding: "12px 28px",
              transition: "background 0.2s, color 0.2s",
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.backgroundColor = BURGUNDY;
              (e.currentTarget as HTMLElement).style.color = "#ffffff";
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.backgroundColor = "transparent";
              (e.currentTarget as HTMLElement).style.color = BURGUNDY;
            }}
          >
            <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
          </a>
        </div>

        {/* Pravý sloupec — 3/5 šířky, foto */}
        <div style={{ flex: "3 1 380px", minWidth: 0 }}>
          <GenericEditableImage
            sectionId={sectionId}
            field="imageUrl"
            src={imageUrl}
            alt="Interior studia"
            className="w-full"
            style={{ display: "block" }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageUrl}
              alt="Interior studia"
              style={{ width: "100%", height: "auto", display: "block", objectFit: "cover" }}
            />
          </GenericEditableImage>
        </div>
      </div>
    </section>
  );
}

// ── nails-02-about ────────────────────────────────────────────────────────────
// Editoriální light O nás — cream #f6efe9 bg, hodně vzduchu (>=160px vertikálně),
// asymetrický 7:5 grid s 120px gap. Vlevo (01) taupe prefix + big wine serif
// italic title + taupe divider + uppercase kicker + body. Vpravo portrait foto
// menší (max 460px), zarovnaná dolů s offset, žádný stín ani box — jen klean
// hrana. Sticky-ish whitespace pro magazine feel; ladí s tmavým hero přes
// shared wine+taupe paletu a serif italic typografii.
// ─────────────────────────────────────────────────────────────────────────────
function AboutNails02({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const WINE  = "#6b3f38";
  const TAUPE = "#d4a080";
  const CREAM = "#f6efe9";
  const INK   = "#3a2a25";

  const numberPrefix = String(content.numberPrefix ?? "(01)");
  const title        = String(content.title        ?? "O nás");
  const kicker       = String(content.kicker       ?? "O studiu");
  const body         = String(content.body         ?? "Nabízíme manikúru a pedikúru všech typů – od přirozeného vzhledu po prodloužení a originální design. Naše práce skutečně vydrží a samozřejmostí je individuální přístup i váš maximální komfort.");
  const imageUrl     = String(content.imageUrl     ?? "https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=1200&q=80");

  return (
    <section
      id="o-nas"
      data-section-type="about"
      data-variant="nails-02-about"
      data-template="nails-02"
      style={{
        backgroundColor: CREAM,
        padding: "clamp(60px, 8vw, 110px) clamp(24px, 6vw, 72px) clamp(120px, 16vw, 200px)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        className="nails02-about-grid"
        style={{
          maxWidth: 1320,
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "minmax(0, 7fr) minmax(0, 5fr)",
          gap: "clamp(60px, 10vw, 140px)",
          alignItems: "center",
        }}
      >
        {/* Left: text — generous breathing */}
        <div style={{ maxWidth: 620 }}>
          <div
            style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontStyle: "italic",
              fontWeight: 400,
              fontSize: "clamp(1.5rem, 2vw, 2rem)",
              color: TAUPE,
              lineHeight: 1,
              marginBottom: 40,
              letterSpacing: "0.06em",
            }}
          >
            <GenericEditableText sectionId={sectionId} field="numberPrefix" value={numberPrefix} tag="span" />
          </div>
          <h2
            style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontWeight: 400,
              fontStyle: "italic",
              fontSize: "clamp(3.2rem, 6.8vw, 6.4rem)",
              lineHeight: 1.0,
              color: WINE,
              margin: 0,
              letterSpacing: "-0.01em",
            }}
          >
            <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
          </h2>
          <div
            aria-hidden="true"
            style={{
              width: 64,
              height: 1,
              backgroundColor: TAUPE,
              margin: "56px 0 36px",
            }}
          />
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
          <p
            style={{
              marginTop: 28,
              fontFamily: "'Poppins', 'Helvetica Neue', Arial, sans-serif",
              fontSize: "1.08rem",
              fontWeight: 300,
              lineHeight: 1.85,
              color: INK,
              maxWidth: 520,
            }}
          >
            <GenericEditableText sectionId={sectionId} field="body" value={body} tag="span" />
          </p>
        </div>

        {/* Right: clean photo — no shadow, no rounding, offset down */}
        <div
          className="nails02-about-photo"
          style={{
            position: "relative",
            width: "100%",
            maxWidth: 460,
            justifySelf: "end",
            marginTop: "clamp(0px, 4vw, 48px)",
          }}
        >
          <div
            style={{
              position: "relative",
              width: "100%",
              aspectRatio: "4 / 5",
              overflow: "hidden",
            }}
          >
            <GenericEditableImage
              sectionId={sectionId}
              field="imageUrl"
              src={imageUrl}
              alt={title}
              className="w-full"
              style={{ display: "block", width: "100%", height: "100%" }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imageUrl}
                alt={title}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  display: "block",
                  position: "absolute",
                  inset: 0,
                }}
              />
            </GenericEditableImage>
          </div>
          {/* Decorative taupe line below image — magazine feel */}
          <div
            aria-hidden="true"
            style={{
              marginTop: 28,
              width: 96,
              height: 1,
              backgroundColor: TAUPE,
              opacity: 0.5,
            }}
          />
        </div>
      </div>
      <style>{`
        @media (max-width: 900px) {
          .nails02-about-grid { grid-template-columns: 1fr !important; gap: 64px !important; }
          .nails02-about-photo { justify-self: start !important; margin-top: 0 !important; max-width: 100% !important; }
        }
      `}</style>
    </section>
  );
}

// ── nails-03-about ────────────────────────────────────────────────────────────
// maidenstudio.cz — cream #FCF9F0 bg, 2-col: foto vlevo (3:4 portrait, žádný
// rámeček), text vpravo: uppercase brown kicker "O NÁS" + velký Manrope bold
// H2 + body + brown pill CTA "Zjistit více". Mobile: 1 col.
// ─────────────────────────────────────────────────────────────────────────────
function AboutNails03({
  content,
  sectionId,
}: {
  content: Record<string, unknown>;
  sectionId: number;
}) {
  const CREAM = "#FCF9F0";
  const DARK  = "#0B090C";
  const BROWN = "#806248";
  const MUTED = "#5a5047";
  const FONT  = "'Manrope', 'Helvetica Neue', Arial, sans-serif";

  const title    = String(content.title    ?? "O nás");
  const kicker   = String(content.kicker   ?? "Studio Krásy");
  const body     = String(content.body     ?? "Studio krásy je místem, kde se krása a umění setkávají.");
  const imageUrl = String(content.imageUrl ?? "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1200&q=80");
  const ctaText  = String(content.ctaText  ?? "Zjistit více");
  const ctaHref  = String(content.ctaHref  ?? "#sluzby");

  return (
    <section
      id="o-nas"
      data-section-type="about"
      data-variant="nails-03-about"
      style={{ backgroundColor: CREAM, padding: "96px 0" }}
    >
      <div
        className="nails03-about-grid"
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "0 40px",
          display: "grid",
          gridTemplateColumns: "5fr 7fr",
          gap: 80,
          alignItems: "center",
        }}
      >
        {/* Foto vlevo */}
        <div
          className="nails03-about-photo"
          style={{ position: "relative", aspectRatio: "3/4", overflow: "hidden" }}
        >
          <GenericEditableImage
            sectionId={sectionId}
            field="imageUrl"
            src={imageUrl}
            alt={kicker}
            style={{ display: "block", width: "100%", height: "100%" }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageUrl}
              alt={kicker}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                objectPosition: "center top",
                display: "block",
                position: "absolute",
                inset: 0,
              }}
            />
          </GenericEditableImage>
        </div>

        {/* Text vpravo */}
        <div>
          {/* Uppercase kicker */}
          <p style={{
            fontFamily: FONT,
            fontWeight: 700,
            fontSize: "0.78rem",
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            color: BROWN,
            margin: "0 0 20px",
          }}>
            <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
          </p>

          {/* Nadpis — název studia */}
          <h2 style={{
            fontFamily: FONT,
            fontWeight: 800,
            fontSize: "clamp(2rem, 3.5vw, 3rem)",
            lineHeight: 1.1,
            letterSpacing: "0.01em",
            color: DARK,
            margin: "0 0 28px",
          }}>
            <GenericEditableText sectionId={sectionId} field="kicker" value={kicker} tag="span" />
          </h2>

          {/* Tenká brown linka */}
          <div style={{ width: 56, height: 2, backgroundColor: BROWN, marginBottom: 28, opacity: 0.6 }} />

          {/* Body */}
          <p style={{
            fontFamily: FONT,
            fontSize: "1rem",
            fontWeight: 400,
            lineHeight: 1.75,
            color: MUTED,
            margin: "0 0 40px",
            maxWidth: 520,
          }}>
            <GenericEditableText sectionId={sectionId} field="body" value={body} tag="span" />
          </p>

          {/* CTA */}
          <a
            href={ctaHref}
            data-btn="primary"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
              padding: "13px 36px",
              backgroundColor: BROWN,
              color: CREAM,
              fontFamily: FONT,
              fontSize: "0.88rem",
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              textDecoration: "none",
              borderRadius: 999,
              transition: "background 0.2s, transform 0.18s",
            }}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = "#6e5238"; e.currentTarget.style.transform = "translateY(-1px)"; }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = BROWN; e.currentTarget.style.transform = "translateY(0)"; }}
          >
            <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="8" x2="13" y2="8"/><polyline points="9 4 13 8 9 12"/>
            </svg>
          </a>
        </div>
      </div>

      <style>{`
        @media (max-width: 860px) {
          .nails03-about-grid { grid-template-columns: 1fr !important; gap: 48px !important; padding: 0 24px !important; }
          .nails03-about-photo { aspect-ratio: 4/3 !important; }
        }
      `}</style>
    </section>
  );
}

// ── clinic-02-about ────────────────────────────────────────────────────────
// Surface bg (#f7f6f5), 2-col: text+features+CTA left, clinic photo + floating
// signature stat card right.
function AboutClinic02({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const NAVY   = "#0F203E";
  const AMBER  = "#ffa60b";
  const MUTED  = "#606266";
  const WHITE  = "#FFFFFF";
  const FONT_H = "'Poppins', Arial, sans-serif";
  const FONT_B = "'Open Sans', Arial, sans-serif";

  const title    = String(content.title    ?? "Estetická medicína bez kompromisů");
  const kicker   = String(content.kicker   ?? "Klinika s tradicí od roku 2008");
  const body     = String(content.body     ?? "");
  const imageUrl = String(content.imageUrl ?? "/images/clinic-02/about.webp");
  const features = Array.isArray(content.features) ? (content.features as string[]) : [];
  const ctaText  = String(content.ctaText  ?? "Více o klinice");
  const ctaHref  = String(content.ctaHref  ?? "/o-nas");
  const statValue = String(content.statValue ?? "18");
  const statLabel = String(content.statLabel ?? "let zkušeností");
  const statSub   = String(content.statSub   ?? "MUDr. Marie Hladíková · vedoucí lékařka");

  return (
    <section id="o-nas" data-template="clinic-02" style={{ backgroundColor: "#f7f6f5", padding: "clamp(72px,9vw,120px) 0", position: "relative" }}>
      <div className="c02-about-inner" style={{
        maxWidth: 1200,
        margin: "0 auto",
        padding: "0 clamp(24px,5vw,60px)",
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "clamp(40px,6vw,80px)",
        alignItems: "center",
      }}>
        {/* Left: text + features + CTA */}
        <div>
          {/* Kicker — hidden on subpages */}
          {(content.showHeader !== false) && kicker && (
            <p style={{
              fontFamily: FONT_B,
              fontSize: "0.75rem",
              fontWeight: 700,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: AMBER,
              margin: "0 0 18px",
              display: "inline-flex",
              alignItems: "center",
              gap: 12,
            }}>
              <span style={{ width: 28, height: 1, backgroundColor: AMBER }} />
              <GenericEditableText sectionId={sectionId} field="kicker" value={kicker} tag="span" />
            </p>
          )}

          {/* Title — hidden on subpages */}
          {(content.showHeader !== false) && title && (
            <h2 style={{
              fontFamily: FONT_H,
              fontSize: "clamp(1.8rem, 3.4vw, 2.7rem)",
              fontWeight: 700,
              color: NAVY,
              lineHeight: 1.15,
              margin: "0 0 24px",
              letterSpacing: "-0.005em",
            }}>
              <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
            </h2>
          )}

          {/* Body */}
          <p style={{
            fontFamily: FONT_B,
            fontSize: "clamp(0.95rem, 1.18vw, 1.05rem)",
            color: MUTED,
            lineHeight: 1.78,
            margin: "0 0 36px",
          }}>
            <GenericEditableText sectionId={sectionId} field="body" value={body} tag="span" />
          </p>

          {/* Features list */}
          {features.length > 0 && (
            <ul className="c02-about-features" style={{ listStyle: "none", margin: "0 0 40px", padding: 0, display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px 28px" }}>
              {features.map((f, i) => (
                <li key={i} className="c02-feature-item" style={{
                  fontFamily: FONT_B,
                  fontSize: "0.92rem",
                  color: NAVY,
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 12,
                  lineHeight: 1.45,
                  transition: "transform .25s ease",
                }}>
                  <span style={{
                    flexShrink: 0,
                    width: 22, height: 22,
                    borderRadius: "50%",
                    backgroundColor: "rgba(255,166,11,0.16)",
                    display: "inline-flex", alignItems: "center", justifyContent: "center",
                    marginTop: 1,
                  }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={AMBER} strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  </span>
                  {f}
                </li>
              ))}
            </ul>
          )}

          {/* CTA */}
          <a
            href={ctaHref}
            className="c02-about-cta"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
              backgroundColor: NAVY,
              color: WHITE,
              textDecoration: "none",
              fontFamily: FONT_B,
              fontSize: "0.82rem",
              fontWeight: 700,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              padding: "15px 30px",
              borderRadius: 999,
              transition: "background-color .22s ease, transform .22s ease, box-shadow .22s ease",
            }}
          >
            <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="13 5 20 12 13 19"/></svg>
          </a>
        </div>

        {/* Right: clinic photo + floating stat card */}
        <div style={{ position: "relative" }}>
          <div style={{ overflow: "hidden", aspectRatio: "4/5", borderRadius: 4, boxShadow: "0 24px 60px -20px rgba(15,32,62,0.32)" }}>
            <GenericEditableImage sectionId={sectionId} field="imageUrl" src={imageUrl} alt="Klinika Aurélie" style={{ display: "flex", width: "100%", height: "100%" }}>
              <img loading="lazy" src={imageUrl} alt="Klinika Aurélie" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center", display: "block" }} />
            </GenericEditableImage>
          </div>

          {/* Floating stat card — bottom-left */}
          <div
            className="c02-about-stat"
            style={{
              position: "absolute",
              left: "-32px",
              bottom: "44px",
              backgroundColor: WHITE,
              padding: "22px 28px",
              borderRadius: 4,
              boxShadow: "0 16px 40px -8px rgba(15,32,62,0.22)",
              borderLeft: `4px solid ${AMBER}`,
              maxWidth: 260,
            }}
          >
            <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 6 }}>
              <span style={{
                fontFamily: FONT_H,
                fontSize: "2.6rem",
                fontWeight: 700,
                color: NAVY,
                lineHeight: 1,
                letterSpacing: "-0.02em",
              }}>
                <GenericEditableText sectionId={sectionId} field="statValue" value={statValue} tag="span" />
              </span>
              <span style={{
                fontFamily: FONT_B,
                fontSize: "0.86rem",
                fontWeight: 600,
                color: NAVY,
                textTransform: "lowercase",
              }}>
                <GenericEditableText sectionId={sectionId} field="statLabel" value={statLabel} tag="span" />
              </span>
            </div>
            <p style={{
              fontFamily: FONT_B,
              fontSize: "0.74rem",
              color: MUTED,
              margin: 0,
              lineHeight: 1.5,
              letterSpacing: "0.02em",
            }}>
              <GenericEditableText sectionId={sectionId} field="statSub" value={statSub} tag="span" />
            </p>
          </div>
        </div>
      </div>

      <style>{`
        .c02-feature-item:hover { transform: translateX(4px); }
        .c02-about-cta:hover {
          background-color: #1a3361 !important;
          transform: translateY(-2px);
          box-shadow: 0 10px 24px rgba(15,32,62,0.28);
        }
        @media (max-width: 768px) {
          #o-nas .c02-about-inner { grid-template-columns: 1fr !important; }
          #o-nas .c02-about-features { grid-template-columns: 1fr !important; }
          #o-nas .c02-about-stat { left: 16px !important; bottom: 16px !important; padding: 16px 20px !important; }
        }
      `}</style>
    </section>
  );
}

// ── clinic-03-about ───────────────────────────────────────────────────────────
// 2-col: vlevo gold kicker + Playfair H2 + body + 3 stats + outline CTA, vpravo foto
// Reference: yesvisage.cz — "Krása v rukou profesionálů"
// ─────────────────────────────────────────────────────────────────────────────
function AboutClinic03({ content, sectionId }: { content: Record<string,unknown>; sectionId: number }) {
  const GOLD   = "#97855F";
  const GOLD_H = "#82734f";
  const WHITE  = "#ffffff";
  const DARK   = "#1A1A1A";
  const MUTED  = "#6B6B6B";
  const SURF   = "#F7F5F0";
  const SANS   = "'DM Sans', Arial, sans-serif";
  const SERIF  = "'Cormorant Garamond', Georgia, serif";

  const eyebrowRaw = content.kicker;
  const titleRaw   = content.title;
  const eyebrow = eyebrowRaw === undefined ? "Více než 40 certifikovaných specialistů" : String(eyebrowRaw);
  const title   = titleRaw   === undefined ? "Klinika, které můžete věřit" : String(titleRaw);
  const body    = String(content.body     ?? "Diamond Look sdružuje přední odborníky české estetické medicíny a plastické chirurgie.");
  const ctaText = String(content.ctaText  ?? "Poznejte náš tým");
  const ctaHref = String(content.ctaHref  ?? "#o-nas");
  const imageUrl = String(content.imageUrl ?? "/images/clinic-03/team/team.webp");
  const showHeader = !!(eyebrow.trim() || title.trim());

  type Stat = { value: string; label: string };
  const stats = (content.stats as Stat[]) ?? [
    { value: "42", label: "Lékařů a specialistů" },
    { value: "35 000+", label: "Spokojených klientů" },
    { value: "22", label: "Let zkušeností" },
  ];

  return (
    <section id="o-nas" data-template="clinic-03" style={{ backgroundColor: SURF, padding: "clamp(64px, 8vw, 100px) 0", fontFamily: SANS }}>
      <div className="c03-about-grid" style={{ maxWidth: 1280, margin: "0 auto", padding: "0 clamp(20px, 4vw, 56px)", display: "grid", gridTemplateColumns: "1.1fr 1fr", gap: "clamp(40px, 6vw, 80px)", alignItems: "center" }}>

        {/* Left: text */}
        <div>
          {showHeader && (
            <>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
                <span aria-hidden style={{ display: "block", width: 24, height: 1, backgroundColor: GOLD }} />
                <GenericEditableText sectionId={sectionId} field="kicker" value={eyebrow} tag="p"
                  style={{ fontSize: "0.65rem", fontWeight: 500, color: GOLD, letterSpacing: "0.2em", textTransform: "uppercase", margin: 0 }}
                />
              </div>
              <GenericEditableText sectionId={sectionId} field="title" value={title} tag="h2"
                style={{ fontFamily: SERIF, fontSize: "clamp(1.6rem, 2.8vw, 2.3rem)", fontWeight: 300, fontStyle: "italic", color: DARK, margin: "0 0 24px", lineHeight: 1.2 }}
              />
            </>
          )}

          <GenericEditableText sectionId={sectionId} field="body" value={body} tag="p"
            style={{ fontFamily: SANS, fontSize: "0.92rem", color: MUTED, lineHeight: 1.8, margin: "0 0 40px" }}
          />

          {/* Stats row */}
          <div style={{ display: "flex", gap: 0, marginBottom: 40 }}>
            {stats.map((s, i) => (
              <div key={i} style={{
                flex: 1,
                textAlign: "center",
                padding: "20px 8px",
                borderLeft: i > 0 ? `1px solid ${GOLD}22` : "none",
              }}>
                <GenericEditableText sectionId={sectionId} field={`stats.${i}.value`} value={s.value} tag="div"
                  style={{ fontFamily: SERIF, fontSize: "clamp(1.8rem, 2.4vw, 2.4rem)", fontWeight: 300, fontStyle: "italic", color: GOLD, lineHeight: 1 }}
                />
                <GenericEditableText sectionId={sectionId} field={`stats.${i}.label`} value={s.label} tag="div"
                  style={{ fontFamily: SANS, fontSize: "0.68rem", color: MUTED, marginTop: 8, letterSpacing: "0.06em" }}
                />
              </div>
            ))}
          </div>

          <a
            href={ctaHref}
            className="c03-about-cta"
            style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              height: 46, padding: "0 32px",
              border: `1px solid ${GOLD}`,
              color: GOLD, fontFamily: SANS, fontSize: "0.7rem", fontWeight: 600,
              letterSpacing: "0.14em", textTransform: "uppercase",
              textDecoration: "none", transition: "all 0.3s ease",
            }}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = GOLD; e.currentTarget.style.color = WHITE; }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = GOLD; }}
          >
            <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
          </a>
        </div>

        {/* Right: photo with subtle shadow */}
        <div style={{ position: "relative" }}>
          <div style={{ overflow: "hidden", boxShadow: "0 12px 40px rgba(0,0,0,0.08)" }}>
            <GenericEditableImage sectionId={sectionId} field="imageUrl" src={imageUrl} alt="Tým kliniky" style={{ display: "block", width: "100%", aspectRatio: "4/5" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img loading="lazy" src={imageUrl} alt="Tým kliniky"
                className="c03-about-img"
                style={{ width: "100%", aspectRatio: "4/5", objectFit: "cover", display: "block", transition: "transform 0.6s cubic-bezier(.2,.7,.3,1)" }}
              />
            </GenericEditableImage>
          </div>
          {/* Decorative gold corner */}
          <div aria-hidden style={{
            position: "absolute", bottom: -8, right: -8,
            width: 48, height: 48,
            borderRight: `2px solid ${GOLD}33`,
            borderBottom: `2px solid ${GOLD}33`,
            pointerEvents: "none",
          }} />
        </div>
      </div>
    </section>
  );
}

// ── about-fitness-01-benefits ────────────────────────────────────────────────
// Ref: lindasikorova.com — beige #D9C6B9 strip directly below hero diagonal
// Left: heading + 3 overlapping avatar circles + stars + count
// Right: white rounded card with 3 icon benefits (dumbbell / calendar / chat)
// ────────────────────────────────────────────────────────────────────────────
function BenefitsFitness01({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const heading     = String(content.heading     ?? "Přidejte se k těm, kteří dělají pokroky");
  const rating      = String(content.rating      ?? "5.0");
  const ratingCount = String(content.ratingCount ?? "60+ spokojených klientů");
  const avatars     = (content.avatars as string[]) ?? [];
  const items       = (content.items as Array<{ icon: string; title: string; description: string }>) ?? [];

  const BG     = "#D9C6B9";
  const ACCENT = "#AD8A72";
  const TEXT   = "#1a1a1a";
  const MUTED  = "#5a4a3a";
  const FONT   = "'Inter', sans-serif";

  const iconMap: Record<string, React.ReactElement> = {
    dumbbell: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6.5 6.5h11M6.5 17.5h11M3 9.5h3v5H3zM18 9.5h3v5h-3z"/>
        <line x1="6.5" y1="12" x2="17.5" y2="12"/>
      </svg>
    ),
    calendar: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
      </svg>
    ),
    chat: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      </svg>
    ),
  };

  return (
    <section style={{ backgroundColor: "transparent", fontFamily: FONT, padding: "40px 0 48px", position: "relative", zIndex: 2, marginTop: "-260px" }} data-template="fitness-01">
      <div style={{ maxWidth: 1130, margin: "0 auto", padding: "0 1em", display: "flex", flexDirection: "row", alignItems: "center", gap: 32 }}>

        {/* Left: heading + avatar group + rating */}
        <div style={{ flexShrink: 0, width: "30%", minWidth: 220 }}>
          <h2 style={{ fontSize: "1.1rem", fontWeight: 700, color: TEXT, lineHeight: 1.35, margin: "0 0 20px" }}>
            <GenericEditableText sectionId={sectionId} field="heading" value={heading} tag="span" />
          </h2>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ display: "flex" }}>
              {avatars.slice(0, 3).map((src, i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img loading="lazy" key={i} src={src} alt={`klient ${i + 1}`} style={{ width: 40, height: 40, borderRadius: "50%", objectFit: "cover", border: "2px solid #D9C6B9", marginLeft: i > 0 ? -12 : 0 }} />
              ))}
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
                {[1,2,3,4,5].map(i => (
                  <svg key={i} width="13" height="13" viewBox="0 0 24 24" fill={ACCENT} aria-hidden="true">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                ))}
                <span style={{ fontSize: 13, fontWeight: 700, color: TEXT, marginLeft: 3 }}>{rating}</span>
              </div>
              <div style={{ fontSize: 11, color: MUTED, marginTop: 2, fontWeight: 500 }}>
                <GenericEditableText sectionId={sectionId} field="ratingCount" value={ratingCount} tag="span" />
              </div>
            </div>
          </div>
        </div>

        {/* Right: white card with 3 icon benefits */}
        <div style={{ flex: 1, background: "rgba(255,255,255,0.72)", borderRadius: 20, padding: "24px 32px", display: "flex", flexDirection: "row", gap: 24, alignItems: "flex-start" }}>
          {items.map((item, i) => (
            <div key={i} style={{ flex: 1, display: "flex", flexDirection: "row", alignItems: "flex-start", gap: 14 }}>
              <div style={{ width: 48, height: 48, borderRadius: "50%", background: ACCENT, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                {iconMap[item.icon] ?? iconMap.dumbbell}
              </div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: ACCENT, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 4 }}>
                  <GenericEditableText sectionId={sectionId} field={`items.${i}.title`} value={item.title} tag="span" />
                </div>
                <div style={{ fontSize: 13, color: MUTED, lineHeight: 1.5 }}>
                  <GenericEditableText sectionId={sectionId} field={`items.${i}.description`} value={item.description} tag="span" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── about-fitness-01-trainer ─────────────────────────────────────────────────
// Luxe Warm Physio Sanctuary — 2-col about
// Left: vertical rail s "02", eyebrow, H2 Inter 800 + Instrument Serif italic accent,
// subheading, 2 bio odstavce (intro larger + detail), credential row s brown hairline,
// signature italic quote, primary CTA
// Right: portrait photo v frame (hairline + shadow ramp), arc corner accent,
// floating stat card (main stat)
// Bottom: 3 stat sloupce s hairline dividers + hover glow
// ────────────────────────────────────────────────────────────────────────────
function TrainerFitness01({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const tagline       = String(content.tagline       ?? "O mně");
  const eyebrowMark   = String(content.eyebrowMark   ?? "02");
  const headingPre    = String(content.headingPre    ?? "Zkoušíte všechno,");
  const headingAccent = String(content.headingAccent ?? "ale bolest");
  const headingPost   = String(content.headingPost   ?? "se pořád vrací?");
  const subheading    = String(content.subheading    ?? "");
  const bio           = String(content.bio           ?? "");
  const bio2          = String(content.bio2          ?? "");
  const name          = String(content.name          ?? "Adam Vítek");
  const role          = String(content.role          ?? "Fyzioterapeut · Osobní trenér");
  const credential    = String(content.credential    ?? "");
  const signature     = String(content.signature     ?? "");
  const image         = String(content.image         ?? "/assets/fitness-01/about-adam.webp");
  const imageAlt      = String(content.imageAlt      ?? name);
  const ctaText       = String(content.ctaText       ?? "");
  const ctaHref       = String(content.ctaHref       ?? "/kontakt");
  const stats         = (content.stats as Array<{ number: string; suffix?: string; label: string }>) ?? [];
  const showHeader    = (content as { showHeader?: boolean }).showHeader !== false;

  return (
    <section className="fit01-about" data-template="fitness-01" id="o-mne">
      {/* Ambient warm accent glow bottom-right */}
      <div className="fit01-about-glow" aria-hidden="true" />

      <div className="fit01-about-inner">
        {/* Left: copy with rail */}
        <div className="fit01-about-copy">
          {/* Signature vertical accent rail */}
          <div className="fit01-about-rail" aria-hidden="true">
            <span className="fit01-rail-line" />
            <span className="fit01-rail-mark">{eyebrowMark}</span>
          </div>

          {showHeader && (
            <>
              <div className="fit01-about-eyebrow">
                <span className="fit01-tagline-mark" aria-hidden="true" />
                <GenericEditableText sectionId={sectionId} field="tagline" value={tagline} tag="span" />
              </div>

              <h2 className="fit01-about-h2">
                <span className="fit01-h2-line">
                  <GenericEditableText sectionId={sectionId} field="headingPre" value={headingPre} tag="span" />
                </span>
                <span className="fit01-h2-line fit01-h2-line-accent">
                  <span className="fit01-h2-accent">
                    <GenericEditableText sectionId={sectionId} field="headingAccent" value={headingAccent} tag="span" />
                  </span>{" "}
                  <span className="fit01-h2-post">
                    <GenericEditableText sectionId={sectionId} field="headingPost" value={headingPost} tag="span" />
                  </span>
                </span>
              </h2>

              {subheading && (
                <p className="fit01-about-lead">
                  <GenericEditableText sectionId={sectionId} field="subheading" value={subheading} tag="span" />
                </p>
              )}
            </>
          )}

          <div className="fit01-about-body">
            {bio && (
              <p className="fit01-about-p">
                <GenericEditableText sectionId={sectionId} field="bio" value={bio} tag="span" />
              </p>
            )}
            {bio2 && (
              <p className="fit01-about-p fit01-about-p-secondary">
                <GenericEditableText sectionId={sectionId} field="bio2" value={bio2} tag="span" />
              </p>
            )}
          </div>

          {signature && (
            <p className="fit01-about-signature">
              <span className="fit01-signature-mark" aria-hidden="true">&ldquo;</span>
              <GenericEditableText sectionId={sectionId} field="signature" value={signature.replace(/^"|"$/g, "")} tag="span" />
            </p>
          )}

          <div className="fit01-about-sign-row">
            <div className="fit01-about-name-block">
              <div className="fit01-about-name">
                <GenericEditableText sectionId={sectionId} field="name" value={name} tag="span" />
              </div>
              <div className="fit01-about-role">
                <GenericEditableText sectionId={sectionId} field="role" value={role} tag="span" />
              </div>
              {credential && (
                <div className="fit01-about-credential">
                  <GenericEditableText sectionId={sectionId} field="credential" value={credential} tag="span" />
                </div>
              )}
            </div>

            {ctaText && (
              <a href={ctaHref} className="fit01-about-cta" data-btn="primary">
                <span>
                  <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
                </span>
                <svg width="14" height="10" viewBox="0 0 14 10" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M1 5h11M8 1l4 4-4 4" />
                </svg>
              </a>
            )}
          </div>
        </div>

        {/* Right: portrait media */}
        <div className="fit01-about-media">
          <div className="fit01-about-photo-wrap">
            {image && (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img src={image} alt={imageAlt} className="fit01-about-photo" loading="lazy" />
            )}
            <svg className="fit01-photo-arc fit01-photo-arc-tr" width="60" height="60" viewBox="0 0 60 60" fill="none" aria-hidden="true">
              <path d="M 4 4 A 52 52 0 0 1 56 56" stroke="#AD8A72" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            {/* Floating stat card */}
            {stats.length > 0 && (
              <div className="fit01-about-float-stat">
                <div className="fit01-float-stat-num">
                  <GenericEditableText sectionId={sectionId} field="stats.0.number" value={stats[0].number} tag="span" />
                  {stats[0].suffix && (
                    <span className="fit01-float-stat-suffix">
                      <GenericEditableText sectionId={sectionId} field="stats.0.suffix" value={stats[0].suffix} tag="span" />
                    </span>
                  )}
                </div>
                <div className="fit01-float-stat-label">
                  <GenericEditableText sectionId={sectionId} field="stats.0.label" value={stats[0].label} tag="span" />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stats row full-width */}
      {stats.length > 0 && (
        <div className="fit01-about-stats">
          <div className="fit01-about-stats-inner">
            {stats.map((s, i) => (
              <div key={i} className="fit01-stat-cell">
                <div className="fit01-stat-num">
                  <GenericEditableText sectionId={sectionId} field={`stats.${i}.number`} value={s.number} tag="span" />
                  {s.suffix && (
                    <span className="fit01-stat-suffix">
                      <GenericEditableText sectionId={sectionId} field={`stats.${i}.suffix`} value={s.suffix} tag="span" />
                    </span>
                  )}
                </div>
                <div className="fit01-stat-label">
                  <GenericEditableText sectionId={sectionId} field={`stats.${i}.label`} value={s.label} tag="span" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

// ── about-fitness-02-studio ───────────────────────────────────────────────────
// 2-col — 1:1 fitnessvictory.cz
// Left: pink kicker + Archivo Black H2 + 2 body paragraphs + outlined pink CTA
// Right: stacked photos (main + secondary overlapping)
// Black #000000 bg, Montserrat body 300
// ─────────────────────────────────────────────────────────────────────────────
function AboutFitness02({ content, sectionId, tenantSlug, isAdmin }: { content: Record<string, unknown>; sectionId: number; tenantSlug?: string; isAdmin?: boolean }) {
  const tagline = String(content.tagline ?? "Od roku 2013");
  const title   = String(content.title   ?? "Nejsme pouze fitness. My jsme VICTORY!");
  const body    = String(content.body    ?? "");
  const body2   = String(content.body2   ?? "");
  const ctaText = String(content.ctaText ?? "Více o nás");
  const ctaHref = String(content.ctaHref ?? "#lekce");
  const image   = String(content.image   ?? "");
  const image2  = String(content.image2  ?? "");
  const showHeader = (content as { showHeader?: boolean }).showHeader !== false;
  const siteMode   = String((content as { siteMode?: string }).siteMode ?? "multipage");

  const ACCENT  = "#FF5500";
  const WHITE   = "#FFFFFF";
  const TEXT    = "#DBDBDB";
  const FONT_H  = "'Archivo Black', sans-serif";
  const FONT_B  = "'Montserrat', sans-serif";

  const resolveHref = (href: string) => {
    if (!href) return href;
    if (href.startsWith("http") || href.startsWith("mailto:") || href.startsWith("tel:") || href.startsWith("#")) return href;
    if (siteMode === "onepage") return href === "/" ? "/" : "/#" + href.replace(/^\//, "");
    return tenantSlug ? `/demo/${tenantSlug}${href}` : href;
  };

  return (
    <section
      id="o-nas"
      className="fitness02-about"
      style={{
        backgroundColor: "#000000",
        padding: "120px 0",
        fontFamily: FONT_B,
        position: "relative",
        overflow: "hidden",
      }}
      data-template="fitness-02"
      data-section="fitness-02-about"
    >
      <div aria-hidden="true" className="fitness02-grain" style={{ position: "absolute", inset: 0, pointerEvents: "none", opacity: 0.04, mixBlendMode: "overlay" }} />

      <div
        style={{
          maxWidth: 1240,
          margin: "0 auto",
          padding: "0 40px",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 96,
          alignItems: "center",
          position: "relative",
          zIndex: 1,
        }}
        className="fitness02-about-grid"
      >
        {/* Left — text */}
        <div>
          {showHeader && (
            <>
              <div className="fitness02-about-kicker" style={{ display: "inline-flex", alignItems: "center", gap: 14, marginBottom: 24 }}>
                <span aria-hidden="true" style={{ display: "inline-block", width: 40, height: 2, background: ACCENT }} />
                <span style={{
                  fontFamily: FONT_B,
                  fontSize: 12,
                  fontWeight: 600,
                  letterSpacing: "0.28em",
                  textTransform: "uppercase",
                  color: ACCENT,
                }}>
                  <GenericEditableText sectionId={sectionId} field="tagline" value={tagline} tag="span" />
                </span>
              </div>

              <h2 className="fitness02-about-title" style={{
                fontFamily: FONT_H,
                fontSize: "clamp(32px, 4vw, 56px)",
                color: WHITE,
                textTransform: "uppercase",
                lineHeight: 1.1,
                margin: 0,
                marginBottom: 32,
                letterSpacing: "-0.01em",
              }}>
                <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
              </h2>
            </>
          )}

          {body && (
            <p className="fitness02-about-body" style={{
              fontSize: 16, fontWeight: 300, color: TEXT,
              lineHeight: 1.75, marginBottom: 22, maxWidth: 560,
            }}>
              <GenericEditableText sectionId={sectionId} field="body" value={body} tag="span" />
            </p>
          )}

          {body2 && (
            <p className="fitness02-about-body" style={{
              fontSize: 16, fontWeight: 300, color: TEXT,
              lineHeight: 1.75, marginBottom: 44, maxWidth: 560,
            }}>
              <GenericEditableText sectionId={sectionId} field="body2" value={body2} tag="span" />
            </p>
          )}

          <a
            href={resolveHref(ctaHref)}
            data-btn="inverse"
            className="fitness02-cta fitness02-about-cta"
            style={{
              display: "inline-flex", alignItems: "center", gap: 12,
              background: "transparent", color: ACCENT,
              border: `2px solid ${ACCENT}`, borderRadius: 0,
              padding: "15px 34px",
              fontSize: 13, textDecoration: "none",
              letterSpacing: "0.2em", textTransform: "uppercase",
              fontFamily: FONT_H,
              transition: "background 0.35s cubic-bezier(0.22,0.61,0.36,1), color 0.35s cubic-bezier(0.22,0.61,0.36,1), transform 0.35s cubic-bezier(0.22,0.61,0.36,1), box-shadow 0.35s ease",
            }}
          >
            <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
            <svg className="fitness02-cta-arrow" width="14" height="10" viewBox="0 0 14 10" fill="none" aria-hidden="true" style={{ transition: "transform 0.35s cubic-bezier(0.22,0.61,0.36,1)" }}>
              <path d="M0 5H12M12 5L8 1M12 5L8 9" stroke="currentColor" strokeWidth="2" />
            </svg>
          </a>
        </div>

        {/* Right — photos */}
        <div className="fitness02-about-media" style={{ position: "relative" }}>
          {/* Orange corner bracket top-left — industrial "target" */}
          <span aria-hidden="true" style={{
            position: "absolute", top: -18, left: -18, width: 44, height: 44,
            borderTop: `3px solid ${ACCENT}`, borderLeft: `3px solid ${ACCENT}`,
            zIndex: 3, pointerEvents: "none",
          }} />
          {image && (
            <GenericEditableImage sectionId={sectionId} field="image" src={image} alt="O nás" className="fitness02-about-img1 relative overflow-hidden" style={{ width: "100%", aspectRatio: "4/3", display: "block" }}>
              <img
                src={image}
                alt="O nás"
                loading="lazy"
                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
              />
            </GenericEditableImage>
          )}
          {image2 && (
            <div className="fitness02-about-img2" style={{
              position: "absolute",
              bottom: -40,
              right: -28,
              width: "55%",
              aspectRatio: "4/3",
              overflow: "hidden",
              border: `3px solid ${ACCENT}`,
              boxShadow: "0 24px 60px -20px rgba(0,0,0,0.85)",
              zIndex: 2,
            }}>
              <GenericEditableImage sectionId={sectionId} field="image2" src={image2} alt="Naše centrum" className="relative overflow-hidden" style={{ width: "100%", height: "100%" }}>
                <img
                  src={image2}
                  alt="Naše centrum"
                  loading="lazy"
                  style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                />
              </GenericEditableImage>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

// ── about-fyzio-01-2col ───────────────────────────────────────────────────────
// 2-col: vlevo navy kicker + Montserrat H2 + 2 body odstavce + zelené CTA
// vpravo klinické foto s navy accent rámečkem — fyzio-01 Demo Fyzio Centrum
// ─────────────────────────────────────────────────────────────────────────────
function AboutFyzio01({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const tagline = String(content.tagline ?? "O nás");
  const title   = String(content.title   ?? "Rehabilitační lékařství a fyzioterapie");
  const body    = String(content.body    ?? "");
  const body2   = String(content.body2   ?? "");
  const ctaText = String(content.ctaText ?? "Více o nás");
  const ctaHref = String(content.ctaHref ?? "#tym");
  const image   = String(content.image   ?? "");
  const id      = String(content.id      ?? "o-nas");

  const WHITE = "#ffffff";
  const NAVY  = "#1f2d69";
  const GREEN = "#10d15d";
  const TEAL  = "#6bbea1";
  const TEXT  = "#333333";
  const MUTED = "#666666";
  const SANS  = "'Open Sans', sans-serif";
  const MONT  = "'Montserrat', sans-serif";

  return (
    <section id={id} data-template="fyzio-01" style={{ backgroundColor: WHITE, padding: "80px 24px" }}>
      <style>{`
        @media (max-width: 768px) {
          #${id}[data-template="fyzio-01"] > div { flex-direction: column !important; gap: 40px !important; padding: 0 !important; }
          #${id}[data-template="fyzio-01"] > div > div:first-child { flex: none !important; }
        }
      `}</style>
      <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", gap: 64, alignItems: "center", flexWrap: "wrap" }}>
        <div style={{ flex: "1 1 420px", minWidth: 0 }}>
          <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: TEAL, fontFamily: MONT, marginBottom: 12 }}>
            <GenericEditableText sectionId={sectionId} field="tagline" value={tagline} tag="span" />
          </div>
          <h2 style={{ fontFamily: MONT, fontSize: "clamp(1.6rem, 2.5vw, 2.2rem)", fontWeight: 700, color: NAVY, lineHeight: 1.25, marginBottom: 20 }}>
            <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
          </h2>
          {body && (
            <p style={{ fontFamily: SANS, fontSize: 15, color: TEXT, lineHeight: 1.7, marginBottom: 16 }}>
              <GenericEditableText sectionId={sectionId} field="body" value={body} tag="span" />
            </p>
          )}
          {body2 && (
            <p style={{ fontFamily: SANS, fontSize: 15, color: MUTED, lineHeight: 1.7, marginBottom: 28 }}>
              <GenericEditableText sectionId={sectionId} field="body2" value={body2} tag="span" />
            </p>
          )}
          <a href={ctaHref} data-btn="primary" style={{ display: "inline-block", backgroundColor: GREEN, color: WHITE, fontFamily: MONT, fontSize: 14, fontWeight: 600, padding: "12px 28px", borderRadius: 4, textDecoration: "none" }}>
            <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
          </a>
        </div>
        {image && (
          <div style={{ flex: "1 1 380px", position: "relative", minWidth: 0 }}>
            <GenericEditableImage sectionId={sectionId} field="image" src={image} alt={title} style={{ display: "block", width: "100%", borderRadius: 4 }}>
              <img loading="lazy" src={image} alt={title} style={{ width: "100%", height: 440, objectFit: "cover", borderRadius: 4, display: "block" }} />
            </GenericEditableImage>
          </div>
        )}
      </div>
    </section>
  );
}

// ── about-fyzio-02-features ───────────────────────────────────────────────────
// Bílé bg, teal tag + DM Serif H2 centrovaně
// 3-col benefit karty: teal ikona + H3 + popis — fyzio-02 Demo Reset Fyzio
// ─────────────────────────────────────────────────────────────────────────────
function AboutFyzio02Features({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  type Benefit = { icon?: string; title?: string; body?: string };
  const tagline  = String(content.tagline ?? "Hledáme příčiny");
  const title    = String(content.title   ?? "Jsme tu pro ty, kterým běžná fyzioterapie nepomohla.");
  const body     = String(content.body    ?? "");
  const id       = String(content.id      ?? "o-nas");
  const benefits = (content.benefits as Benefit[]) ?? [];

  const WHITE = "#ffffff";
  const DARK  = "#1a2e4a";
  const TEAL  = "#c9a84c";
  const SURF  = "#f5f3ee";
  const MUTED = "#6b7280";
  const SERIF = "'DM Serif Display', serif";
  const SANS  = "'Plus Jakarta Sans', sans-serif";

  return (
    <section id={id} data-template="fyzio-02" style={{ backgroundColor: WHITE, padding: "80px 24px" }}>
      <style>{`
        [data-template="fyzio-02"] .f02-benefit-card { transition: box-shadow 0.25s, transform 0.25s; }
        [data-template="fyzio-02"] .f02-benefit-card:hover { box-shadow: 0 8px 32px rgba(26,46,74,0.1); transform: translateY(-4px); }
        [data-template="fyzio-02"] .f02-benefits-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
        @media(max-width: 860px) { [data-template="fyzio-02"] .f02-benefits-grid { grid-template-columns: 1fr !important; } }
      `}</style>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <div style={{ display: "inline-block", backgroundColor: SURF, color: TEAL, fontFamily: SANS, fontSize: 12, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", padding: "6px 14px", borderRadius: 32, marginBottom: 16 }}>
            <GenericEditableText sectionId={sectionId} field="tagline" value={tagline} tag="span" />
          </div>
          <h2 style={{ fontFamily: SERIF, fontSize: "clamp(1.6rem, 2.8vw, 2.4rem)", fontWeight: 400, color: DARK, lineHeight: 1.3, maxWidth: 720, margin: "0 auto 16px" }}>
            <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
          </h2>
          {body && (
            <p style={{ fontFamily: SANS, fontSize: 16, color: MUTED, lineHeight: 1.7, maxWidth: 600, margin: "0 auto" }}>
              <GenericEditableText sectionId={sectionId} field="body" value={body} tag="span" />
            </p>
          )}
        </div>
        <div className="f02-benefits-grid">
          {benefits.map((b, i) => (
            <div key={i} className="f02-benefit-card" style={{ backgroundColor: SURF, borderRadius: 16, padding: "36px 28px" }}>
              <div style={{ width: 52, height: 52, backgroundColor: WHITE, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", color: TEAL, marginBottom: 20, boxShadow: "0 2px 8px rgba(201,168,76,0.2)" }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  {b.icon === "brain" ? <><path d="M12 2C8.13 2 5 5.13 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.87-3.13-7-7-7z"/></> :
                   b.icon === "user" ? <><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></> :
                   <><path d="M9 12l2 2 4-4"/><rect x="3" y="3" width="18" height="18" rx="3"/></>}
                </svg>
              </div>
              <h3 style={{ fontFamily: SERIF, fontSize: "1.15rem", fontWeight: 400, color: DARK, marginBottom: 10, lineHeight: 1.3 }}>
                <GenericEditableText sectionId={sectionId} field={`benefits.${i}.title`} value={b.title ?? ""} tag="span" />
              </h3>
              <p style={{ fontFamily: SANS, fontSize: 14, color: MUTED, lineHeight: 1.7, margin: 0 }}>
                <GenericEditableText sectionId={sectionId} field={`benefits.${i}.body`} value={b.body ?? ""} tag="span" />
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── cafe-02-about ─────────────────────────────────────────────────────────────
// Cream #F7F4EF bg; 2-col: vlevo foto (aspect 4/3) / vpravo gold kicker +
// burgundy Georgia H2 + 2 body odstavce + gold outline CTA
// ─────────────────────────────────────────────────────────────────────────────
function AboutCafe02({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const id      = String(content.id      ?? "o-nas");
  const tagline = String(content.tagline ?? "Náš příběh");
  const title   = String(content.title   ?? "Místo, kde se čas\nzastaví nad šálkem kávy.");
  const body    = String(content.body    ?? "");
  const body2   = String(content.body2   ?? "");
  const ctaText = String(content.ctaText ?? "Více o nás");
  const ctaHref = String(content.ctaHref ?? "/o-nas");
  const image   = String(content.image   ?? "");

  const BG      = "#F7F4EF";
  const GOLD    = "#A89B67";
  const BURG    = "#6C1D45";
  const TEXT    = "#1A0E0A";
  const MUTED   = "#8C7B6A";
  const FONT    = "Georgia, 'Times New Roman', serif";
  const SANS    = "'Helvetica Neue', Helvetica, Arial, sans-serif";
  const PLACEHOLDER = "https://images.unsplash.com/photo-1559925393-8be0ec4767c8?w=900&h=675&fit=crop&fm=webp&q=85";

  const secRef = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = secRef.current;
    if (!el) return;
    const items = el.querySelectorAll<HTMLElement>("[data-c02a]");
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) { (e.target as HTMLElement).classList.add("c02a-vis"); obs.unobserve(e.target); } });
    }, { threshold: 0.12 });
    items.forEach(item => obs.observe(item));
    return () => obs.disconnect();
  }, []);

  return (
    <section ref={secRef} id={id} data-variant="cafe-02-about" style={{ backgroundColor: BG, padding: "96px 0", fontFamily: SANS }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 clamp(24px, 5vw, 64px)" }}>
        <div className="c02a-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "clamp(40px, 6vw, 80px)", alignItems: "center" }}>
          <div data-c02a="0" style={{ aspectRatio: "4/3", overflow: "hidden", borderRadius: 2, boxShadow: "0 8px 32px rgba(26,14,10,0.10)" }}>
            <GenericEditableImage sectionId={sectionId} field="image" src={image || PLACEHOLDER} alt={title} style={{ width: "100%", height: "100%", display: "block" }}>
              <img
                src={image || PLACEHOLDER}
                alt={title}
                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", transition: "transform 0.6s ease" }}
                onMouseEnter={e => ((e.currentTarget as HTMLImageElement).style.transform = "scale(1.03)")}
                onMouseLeave={e => ((e.currentTarget as HTMLImageElement).style.transform = "scale(1)")}
              />
            </GenericEditableImage>
          </div>
          <div data-c02a="1" style={{ transitionDelay: "0.14s" }}>
            <p style={{ fontFamily: SANS, fontSize: 11, fontWeight: 600, letterSpacing: "0.18em", textTransform: "uppercase", color: GOLD, margin: "0 0 14px" }}>
              <GenericEditableText sectionId={sectionId} field="tagline" value={tagline} tag="span" />
            </p>
            <div style={{ width: 40, height: 1.5, backgroundColor: GOLD, marginBottom: 24 }} />
            <h2 style={{ fontFamily: FONT, fontSize: "clamp(26px, 3vw, 42px)", fontWeight: 400, lineHeight: 1.25, color: BURG, margin: "0 0 28px", whiteSpace: "pre-line" }}>
              <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
            </h2>
            <p style={{ fontFamily: SANS, fontSize: 15, fontWeight: 400, lineHeight: 1.85, color: TEXT, margin: "0 0 16px" }}>
              <GenericEditableText sectionId={sectionId} field="body" value={body} tag="span" />
            </p>
            {body2 && (
              <p style={{ fontFamily: SANS, fontSize: 15, fontWeight: 400, lineHeight: 1.85, color: MUTED, margin: "0 0 36px" }}>
                <GenericEditableText sectionId={sectionId} field="body2" value={body2} tag="span" />
              </p>
            )}
            <a
              href={ctaHref}
              data-btn="primary"
              style={{
                fontFamily: SANS, fontSize: 11, fontWeight: 600, letterSpacing: "0.12em",
                textTransform: "uppercase", color: BURG, textDecoration: "none",
                padding: "12px 28px", border: `1.5px solid ${BURG}`, borderRadius: 2,
                display: "inline-block", transition: "background-color 0.2s, color 0.2s",
              }}
              onMouseEnter={e => { e.currentTarget.style.backgroundColor = BURG; e.currentTarget.style.color = "#fff"; }}
              onMouseLeave={e => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = BURG; }}
            >
              <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
            </a>
          </div>
        </div>
      </div>
      <style>{`
        @media(max-width:768px){.c02a-grid{grid-template-columns:1fr!important}}
        [data-c02a]{opacity:0;transform:translateY(36px);transition:opacity .72s cubic-bezier(.22,1,.36,1),transform .72s cubic-bezier(.22,1,.36,1)}
        [data-c02a].c02a-vis{opacity:1;transform:translateY(0)}
      `}</style>
    </section>
  );
}

// ── restaurant-01-about ───────────────────────────────────────────────────────
// Dark #0f0a07 bg; 2-col: vlevo foto (aspect 4/3) / vpravo amber kicker + cream
// serif H2 + 2 body odstavce + amber outline CTA
// ─────────────────────────────────────────────────────────────────────────────
function AboutRestaurant01({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const id      = String(content.id      ?? "o-nas");
  const tagline = String(content.tagline ?? "Náš příběh");
  const title   = String(content.title   ?? "Gastronomie jako\numění i řemeslo.");
  const body    = String(content.body    ?? "");
  const body2   = String(content.body2   ?? "");
  const ctaText = String(content.ctaText ?? "Více o nás");
  const ctaHref = String(content.ctaHref ?? "/o-nas");
  const image   = String(content.image   ?? "");

  const DARK   = "#0f0a07";
  const CREAM  = "#f5ede0";
  const AMBER  = "#c8943f";
  const MUTED  = "#a08060";
  const FONT   = "Georgia, 'Times New Roman', serif";
  const SANS   = "'Helvetica Neue', Helvetica, Arial, sans-serif";
  const PLACEHOLDER = "https://images.unsplash.com/photo-1552566626-52f8b828add9?w=800&h=600&fit=crop&fm=webp";

  const secRef = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = secRef.current;
    if (!el) return;
    const items = el.querySelectorAll<HTMLElement>("[data-r01]");
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) { (e.target as HTMLElement).classList.add("r01-vis"); obs.unobserve(e.target); } });
    }, { threshold: 0.12 });
    items.forEach(item => obs.observe(item));
    return () => obs.disconnect();
  }, []);

  return (
    <section ref={secRef} id={id} data-variant="restaurant-01-about" style={{ backgroundColor: DARK, padding: "96px 0", fontFamily: SANS }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 clamp(24px, 5vw, 64px)" }}>
        <div className="r01-about-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "clamp(40px, 6vw, 80px)", alignItems: "center" }}>
          <div data-r01="0" style={{ aspectRatio: "4/3", overflow: "hidden", borderRadius: 2 }}>
            <GenericEditableImage sectionId={sectionId} field="image" src={image || PLACEHOLDER} alt={title} style={{ width: "100%", height: "100%", display: "block" }}>
              <img
                src={image || PLACEHOLDER}
                alt={title}
                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", transition: "transform 0.6s ease" }}
                onMouseEnter={e => ((e.currentTarget as HTMLImageElement).style.transform = "scale(1.03)")}
                onMouseLeave={e => ((e.currentTarget as HTMLImageElement).style.transform = "scale(1)")}
              />
            </GenericEditableImage>
          </div>
          <div data-r01="1" style={{ transitionDelay: "0.14s" }}>
            <p style={{ fontFamily: SANS, fontSize: 11, fontWeight: 600, letterSpacing: "0.18em", textTransform: "uppercase", color: AMBER, margin: "0 0 16px" }}>
              <GenericEditableText sectionId={sectionId} field="tagline" value={tagline} tag="span" />
            </p>
            <div style={{ width: 40, height: 1.5, backgroundColor: AMBER, marginBottom: 24 }} />
            <h2 style={{ fontFamily: FONT, fontSize: "clamp(26px, 3vw, 42px)", fontWeight: 400, lineHeight: 1.2, color: CREAM, margin: "0 0 28px", whiteSpace: "pre-line" }}>
              <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
            </h2>
            <p style={{ fontFamily: SANS, fontSize: 15, fontWeight: 300, lineHeight: 1.8, color: MUTED, margin: "0 0 16px" }}>
              <GenericEditableText sectionId={sectionId} field="body" value={body} tag="span" />
            </p>
            {body2 && (
              <p style={{ fontFamily: SANS, fontSize: 15, fontWeight: 300, lineHeight: 1.8, color: MUTED, margin: "0 0 36px" }}>
                <GenericEditableText sectionId={sectionId} field="body2" value={body2} tag="span" />
              </p>
            )}
            <a
              href={ctaHref}
              data-btn="primary"
              style={{
                fontFamily: SANS, fontSize: 11, fontWeight: 600, letterSpacing: "0.12em",
                textTransform: "uppercase", color: AMBER, textDecoration: "none",
                padding: "12px 28px", border: `1px solid ${AMBER}`, borderRadius: 3,
                display: "inline-block", transition: "background-color 0.2s, color 0.2s",
              }}
              onMouseEnter={e => { e.currentTarget.style.backgroundColor = AMBER; e.currentTarget.style.color = DARK; }}
              onMouseLeave={e => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = AMBER; }}
            >
              <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
            </a>
          </div>
        </div>
      </div>
      <style>{`
        @media(max-width:768px){.r01-about-grid{grid-template-columns:1fr!important}}
        [data-r01]{opacity:0;transform:translateY(36px);transition:opacity .72s cubic-bezier(.22,1,.36,1),transform .72s cubic-bezier(.22,1,.36,1)}
        [data-r01].r01-vis{opacity:1;transform:translateY(0)}
      `}</style>
    </section>
  );
}

// ── restaurant-02-about ───────────────────────────────────────────────────────
// 2-col split: text vlevo, foto vpravo — bílé bg, Poppins, červený tagline
// Ref: restauracehybernska.cz — sekce O nás
// ─────────────────────────────────────────────────────────────────────────────
function AboutRestaurant02({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const id      = String(content.id      ?? "o-nas");
  const tagline = String(content.tagline ?? "Náš příběh");
  const title   = String(content.title   ?? "Poctivá česká\nkuchyně od roku 1998.");
  const body    = String(content.body    ?? "");
  const body2   = String(content.body2   ?? "");
  const ctaText = String(content.ctaText ?? "Více o nás");
  const ctaHref = String(content.ctaHref ?? "/o-nas");
  const image   = String(content.image   ?? "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&h=600&fit=crop&fm=webp&q=85");

  const RED     = "#c0392b";
  const BLACK   = "#1a1a1a";
  const MUTED   = "#666666";
  const POPPINS = "'Poppins', sans-serif";

  const visRef = useRef<HTMLDivElement>(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const el = visRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVis(true); obs.disconnect(); } }, { threshold: 0.15 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <section id={id} data-template="restaurant-02" style={{ backgroundColor: "#ffffff", padding: "clamp(64px, 8vw, 112px) 0" }}>
      <div
        style={{ maxWidth: 1200, margin: "0 auto", padding: "0 clamp(20px, 5vw, 60px)", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "clamp(40px, 6vw, 96px)", alignItems: "center" }}
        className="r02-about-grid"
      >
        {/* Text vlevo */}
        <div
          ref={visRef}
          style={{ opacity: vis ? 1 : 0, transform: vis ? "translateY(0)" : "translateY(32px)", transition: "opacity 0.7s ease, transform 0.7s ease" }}
        >
          <p style={{ fontFamily: POPPINS, fontSize: 12, fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase", color: RED, margin: "0 0 14px" }}>
            <GenericEditableText sectionId={sectionId} field="tagline" value={tagline} tag="span" />
          </p>
          <h2 style={{ fontFamily: POPPINS, fontSize: "clamp(26px, 3.2vw, 42px)", fontWeight: 700, lineHeight: 1.2, color: BLACK, margin: "0 0 24px", whiteSpace: "pre-line" }}>
            <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
          </h2>
          {body && (
            <p style={{ fontFamily: POPPINS, fontSize: 15, lineHeight: 1.8, color: MUTED, margin: "0 0 16px" }}>
              <GenericEditableText sectionId={sectionId} field="body" value={body} tag="span" />
            </p>
          )}
          {body2 && (
            <p style={{ fontFamily: POPPINS, fontSize: 15, lineHeight: 1.8, color: MUTED, margin: "0 0 36px" }}>
              <GenericEditableText sectionId={sectionId} field="body2" value={body2} tag="span" />
            </p>
          )}
          <a
            href={ctaHref}
            data-btn="primary"
            style={{ fontFamily: POPPINS, fontSize: 12, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: RED, textDecoration: "none", borderBottom: `1.5px solid ${RED}`, paddingBottom: 2, transition: "opacity 0.2s", display: "inline-block" }}
            onMouseEnter={e => (e.currentTarget.style.opacity = "0.7")}
            onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
          >
            <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
          </a>
        </div>

        {/* Foto vpravo */}
        <div style={{ opacity: vis ? 1 : 0, transform: vis ? "translateX(0)" : "translateX(32px)", transition: "opacity 0.7s ease 0.15s, transform 0.7s ease 0.15s", lineHeight: 0 }}>
          <GenericEditableImage sectionId={sectionId} field="image" src={image} alt={title} style={{ display: "block", width: "100%", lineHeight: 0 }}>
            <img
              src={image}
              alt={title}
              style={{ width: "100%", aspectRatio: "4/3", objectFit: "cover", display: "block" }}
            />
          </GenericEditableImage>
        </div>
      </div>

      <style>{`
        @media(max-width:768px){
          .r02-about-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}

// ── restaurant-03-about ───────────────────────────────────────────────────────
// Dark #0c351a bg, 2-col: vlevo foto restaurace / vpravo zlatý kicker + bílý H2
// serif + 2 odstavce + zlatý divider 4px + outline CTA "Více o nás"
// Ref: lacasalatina.cz — sekce "VÍTEJTE" s bílým textem na tmavé zelené
// ─────────────────────────────────────────────────────────────────────────────
function AboutRestaurant03({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const id      = String(content.id      ?? "o-nas");
  const tagline = String(content.tagline ?? "Náš příběh");
  const title   = String(content.title   ?? "Autentická kuchyně\nčtyř kontinentů.");
  const body    = String(content.body    ?? "");
  const body2   = String(content.body2   ?? "");
  const ctaText = String(content.ctaText ?? "Více o nás");
  const ctaHref = String(content.ctaHref ?? "/o-nas");
  const image   = String(content.image   ?? "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&h=600&fit=crop&fm=webp&q=85");

  const BG   = "#0d1b2a";
  const GOLD = "#e05e3f";
  const WHITE = "#ffffff";
  const FONT = "Georgia, 'Times New Roman', serif";
  const SANS = "'Helvetica Neue', Helvetica, Arial, sans-serif";

  const secRef = useRef<HTMLElement>(null);

  return (
    <section ref={secRef} id={id} data-variant="restaurant-03-about" style={{ backgroundColor: BG, padding: "96px 0", fontFamily: SANS }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 clamp(20px, 5vw, 60px)" }}>
        <div className="r03-about-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "clamp(40px, 6vw, 80px)", alignItems: "center" }}>

          {/* Foto vlevo */}
          <div style={{ position: "relative", overflow: "hidden", borderRadius: 2 }}>
            <GenericEditableImage sectionId={sectionId} field="image" src={image} alt={title}>
              <img
                src={image}
                alt={title}
                style={{ width: "100%", aspectRatio: "4/3", objectFit: "cover", display: "block" }}
              />
            </GenericEditableImage>
            {/* Zlatý accent border vlevo dole */}
            <div style={{ position: "absolute", left: 0, bottom: 0, width: 4, height: "40%", backgroundColor: GOLD }} />
          </div>

          {/* Text vpravo */}
          <div>
            {/* Kicker */}
            <p style={{
              fontFamily: SANS, fontSize: 11, fontWeight: 600,
              letterSpacing: "0.2em", textTransform: "uppercase",
              color: GOLD, margin: "0 0 16px",
            }}>
              <GenericEditableText sectionId={sectionId} field="tagline" value={tagline} tag="span" />
            </p>

            {/* Zlatý divider */}
            <div style={{ width: "20%", height: 4, backgroundColor: GOLD, marginBottom: 24, opacity: 0.75 }} />

            {/* H2 */}
            <h2 style={{
              fontFamily: FONT, fontSize: "clamp(26px, 3.2vw, 42px)", fontWeight: 400,
              color: WHITE, margin: "0 0 24px", lineHeight: 1.2,
              whiteSpace: "pre-line",
            }}>
              <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
            </h2>

            {/* Body 1 */}
            {body && (
              <p style={{ fontFamily: SANS, fontSize: 16, lineHeight: 1.75, color: `${WHITE}bb`, margin: "0 0 16px" }}>
                <GenericEditableText sectionId={sectionId} field="body" value={body} tag="span" />
              </p>
            )}

            {/* Body 2 */}
            {body2 && (
              <p style={{ fontFamily: SANS, fontSize: 16, lineHeight: 1.75, color: `${WHITE}bb`, margin: "0 0 32px" }}>
                <GenericEditableText sectionId={sectionId} field="body2" value={body2} tag="span" />
              </p>
            )}

            {/* CTA outline zlaté */}
            <a
              href={ctaHref}
              data-btn="primary"
              style={{
                fontFamily: SANS, fontSize: 11, fontWeight: 700,
                letterSpacing: "0.14em", textTransform: "uppercase",
                color: GOLD, textDecoration: "none",
                padding: "11px 28px",
                border: `1px solid ${GOLD}`,
                display: "inline-block",
                transition: "background-color 0.2s, color 0.2s",
              }}
              onMouseEnter={e => {
                e.currentTarget.style.backgroundColor = GOLD;
                e.currentTarget.style.color = WHITE;
              }}
              onMouseLeave={e => {
                e.currentTarget.style.backgroundColor = "transparent";
                e.currentTarget.style.color = GOLD;
              }}
            >
              <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
            </a>
          </div>
        </div>
      </div>
      <style>{`
        @media(max-width:768px){
          .r03-about-grid{grid-template-columns:1fr!important}
        }
      `}</style>
    </section>
  );
}

// ── cafe-03-about ─────────────────────────────────────────────────────────────
// Ref: cathedral.cz — s-text-intro-side
// Bílé bg, 2-col: portrait foto vlevo (aspect 4/5) | zlatý kicker + Great Vibes H2 + text vpravo
// ─────────────────────────────────────────────────────────────────────────────
function AboutCafe03({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const GOLD  = "#C69C60";
  const DARK  = "#1a1a1a";
  const MUTED = "#6b6b6b";
  const SERIF = "'Great Vibes', cursive";
  const SANS  = "'Open Sans', sans-serif";

  const id      = String(content.id      ?? "o-nas");
  const tagline = String(content.tagline ?? "O NÁS");
  const title   = String(content.title   ?? "Cathedral Café Lounge & Restaurant");
  const body    = String(content.body    ?? "");
  const body2   = String(content.body2   ?? "");
  const image   = String(content.image   ?? "https://images.unsplash.com/photo-1543007630-9710e4a00a20?w=900&h=1125&fit=crop&fm=webp&q=85");

  return (
    <section id={id} style={{ backgroundColor: "#fff", padding: "clamp(48px, 8vw, 96px) 0", fontFamily: SANS }}>
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 clamp(20px, 5vw, 60px)" }}>
        <div className="c3-about-grid" style={{ display: "grid", gridTemplateColumns: "5fr 7fr", gap: "clamp(32px, 6vw, 80px)", alignItems: "center" }}>
          {/* Portrait image */}
          <div style={{ overflow: "hidden" }}>
            <GenericEditableImage sectionId={sectionId} field="image" src={image} alt={title} style={{ display: "block" }}>
              <img src={image} alt={title} style={{ width: "100%", aspectRatio: "4/5", objectFit: "cover", display: "block" }} loading="lazy" />
            </GenericEditableImage>
          </div>

          {/* Text */}
          <div>
            <GenericEditableText sectionId={sectionId} field="tagline" value={tagline} tag="p">
              <p style={{ fontFamily: SANS, fontSize: 12, fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase", color: GOLD, margin: "0 0 16px" }}>
                {tagline}
              </p>
            </GenericEditableText>
            <GenericEditableText sectionId={sectionId} field="title" value={title} tag="h2">
              <h2 style={{ fontFamily: SERIF, fontSize: "clamp(32px, 4vw, 52px)", fontWeight: 400, color: DARK, margin: "0 0 24px", lineHeight: 1.2, letterSpacing: "0.01em" }}>
                {title}
              </h2>
            </GenericEditableText>
            {body && (
              <GenericEditableText sectionId={sectionId} field="body" value={body} tag="p">
                <p style={{ fontFamily: SANS, fontSize: "clamp(14px, 1.6vw, 16px)", fontWeight: 300, color: MUTED, lineHeight: 1.75, margin: "0 0 16px" }}>
                  {body}
                </p>
              </GenericEditableText>
            )}
            {body2 && (
              <GenericEditableText sectionId={sectionId} field="body2" value={body2} tag="p">
                <p style={{ fontFamily: SANS, fontSize: "clamp(14px, 1.6vw, 16px)", fontWeight: 300, color: MUTED, lineHeight: 1.75, margin: 0 }}>
                  {body2}
                </p>
              </GenericEditableText>
            )}
          </div>
        </div>
      </div>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Great+Vibes&family=Open+Sans:wght@300;400;600&display=swap" />
      <style>{`        @media(max-width:768px){.c3-about-grid{grid-template-columns:1fr!important}}
      `}</style>
    </section>
  );
}

// ── cafe-04-about ─────────────────────────────────────────────────────────────
// Ref: coffeeroom.cz — 4 alternating blocks 1:1
// CSS extracted from Webflow CSS: .container, .div-img, .div-text, .div-text-left, .para-prod, .img-prod
// ─────────────────────────────────────────────────────────────────────────────
function AboutCafe04({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  type Block = { imageUrl: string; imageAlt: string; text: string; imageLeft: boolean };
  const blocks = (content.blocks as Block[] | undefined) ?? [];

  return (
    <section style={{ textAlign: "left", marginTop: 0, paddingTop: 100, fontFamily: "Montserrat, sans-serif", display: "block", position: "relative", overflow: "hidden", backgroundColor: "#fff" }}>
      <style>{`
        .cr04-wrap { width: 70%; margin-left: auto; margin-right: auto; display: block; position: relative; }
        .cr04-content-wrap { text-align: center; flex-direction: column; align-items: stretch; width: 100%; margin-bottom: 40px; margin-left: auto; margin-right: auto; display: flex; }
        .cr04-container { flex-direction: row; justify-content: space-between; margin-bottom: 140px; display: flex; }
        .cr04-div-img { width: 50%; padding-left: 10px; padding-right: 10px; }
        .cr04-div-img img { border-radius: 10px; margin-top: 0; margin-bottom: 0; display: block; width: 100%; }
        .cr04-div-text { justify-content: center; align-items: center; width: 50%; margin-left: 20px; margin-right: 20px; padding-left: 5%; padding-right: 0%; display: flex; }
        .cr04-div-text-left { justify-content: center; align-items: center; width: 50%; padding-left: 0%; padding-right: 5%; display: flex; }
        .cr04-para-prod { color: #1d1f2e; text-align: left; letter-spacing: 1px; font-family: 'Karla', 'Helvetica Neue', Arial, sans-serif; font-size: 19px; font-weight: 500; line-height: 30px; position: static; margin: 0; }
        @media (max-width: 828px) {
          .cr04-wrap { width: 90%; }
          .cr04-container { flex-direction: column; margin-bottom: 100px; }
          .cr04-container.cr04-_2 { flex-direction: column-reverse; }
          .cr04-div-img { width: 100%; margin-bottom: 42px; padding-left: 0; padding-right: 0; }
          .cr04-div-text { width: 100%; margin-left: 0; margin-right: 0; padding-left: 0%; padding-right: 0%; }
          .cr04-div-text-left { width: 100%; padding-right: 0%; }
          .cr04-para-prod { font-size: 17px; line-height: 28px; }
        }
      `}</style>
      <div className="cr04-wrap">
        <div className="cr04-content-wrap">
          {blocks.map((block, i) => {
            if (block.imageLeft) {
              return (
                <div key={i} className="cr04-container">
                  <div className="cr04-div-img">
                    <GenericEditableImage sectionId={sectionId} field={`blocks.${i}.imageUrl`} src={block.imageUrl} alt={block.imageAlt} style={{ display: "block", width: "100%" }}>
                      <img loading="lazy" src={block.imageUrl} alt={block.imageAlt} style={{ display: "block", width: "100%", borderRadius: 10 }} />
                    </GenericEditableImage>
                  </div>
                  <div className="cr04-div-text">
                    <p className="cr04-para-prod">
                      <GenericEditableText sectionId={sectionId} field={`blocks.${i}.text`} value={block.text} tag="span" />
                    </p>
                  </div>
                </div>
              );
            } else {
              return (
                <div key={i} className="cr04-container cr04-_2">
                  <div className="cr04-div-text-left">
                    <p className="cr04-para-prod">
                      <GenericEditableText sectionId={sectionId} field={`blocks.${i}.text`} value={block.text} tag="span" />
                    </p>
                  </div>
                  <div className="cr04-div-img">
                    <GenericEditableImage sectionId={sectionId} field={`blocks.${i}.imageUrl`} src={block.imageUrl} alt={block.imageAlt} style={{ display: "block", width: "100%" }}>
                      <img loading="lazy" src={block.imageUrl} alt={block.imageAlt} style={{ display: "block", width: "100%", borderRadius: 10 }} />
                    </GenericEditableImage>
                  </div>
                </div>
              );
            }
          })}
        </div>
      </div>
    </section>
  );
}

// ── bakery-01-about ───────────────────────────────────────────────────────────
// Panorama banner → centered intro text → 2-col image+text+CTA cards
// ─────────────────────────────────────────────────────────────────────────────
function AboutBakery01({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const DARK  = "#393939";
  const MUTED = "#666666";
  const SERIF = "'Josefin Sans', 'Helvetica Neue', sans-serif";
  const SANS  = "'Metropolis', 'Inter', sans-serif";
  const ACCENT = "#8b6030";

  const bannerImage = String(content.bannerImage ?? "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=1920&q=80");
  const heading     = String(content.heading     ?? "Demo Zrno Zrnko");
  const subheading  = String(content.subheading  ?? "Autentická řemeslná pekárna");
  const body        = String(content.body        ?? "");
  const col1Image   = String(content.col1Image   ?? "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&q=80");
  const col1Text    = String(content.col1Text    ?? "");
  const col1Cta     = String(content.col1Cta     ?? "VÍCE O PEČIVU");
  const col1CtaHref = String(content.col1CtaHref ?? "/pekarna");
  const col2Image   = String(content.col2Image   ?? "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&q=80");
  const col2Text    = String(content.col2Text    ?? "");
  const col2Cta     = String(content.col2Cta     ?? "VÍCE O KÁVĚ");
  const col2CtaHref = String(content.col2CtaHref ?? "/kava");

  return (
    <section style={{ backgroundColor: "#ffffff", fontFamily: SANS }}>

      {/* Centered intro */}
      <div style={{ maxWidth: 760, margin: "0 auto", padding: "clamp(48px, 7vw, 96px) clamp(24px, 5vw, 40px)", textAlign: "center" }}>
        <h2 style={{ fontFamily: SERIF, fontWeight: 300, fontSize: "clamp(1.8rem, 4vw, 3rem)", letterSpacing: "0.12em", textTransform: "uppercase", color: DARK, margin: "0 0 12px" }}>
          <GenericEditableText sectionId={sectionId} field="heading" value={heading} tag="span" />
        </h2>
        <p style={{ fontFamily: SERIF, fontWeight: 300, fontSize: "clamp(0.85rem, 1.4vw, 1rem)", letterSpacing: "0.1em", textTransform: "uppercase", color: ACCENT, margin: "0 0 28px" }}>
          <GenericEditableText sectionId={sectionId} field="subheading" value={subheading} tag="span" />
        </p>
        <p style={{ fontSize: "clamp(0.9rem, 1.3vw, 1rem)", lineHeight: 1.8, color: MUTED, margin: 0 }}>
          <GenericEditableText sectionId={sectionId} field="body" value={body} tag="span" />
        </p>
      </div>

      {/* 2-col cards */}
      <div
        className="b01-about-cols"
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 0,
          borderTop: "1px solid #e8e8e8",
        }}
      >
        {/* Col 1 — Pečivo */}
        <div style={{ borderRight: "1px solid #e8e8e8", padding: "clamp(32px, 5vw, 64px) clamp(24px, 5vw, 60px)" }}>
          <GenericEditableImage sectionId={sectionId} field="col1Image" src={col1Image} alt={col1Cta} style={{ display: "block" }}>
            <img src={col1Image} alt={col1Cta} loading="lazy" style={{ width: "100%", aspectRatio: "3/2", objectFit: "cover", display: "block", marginBottom: 28 }} />
          </GenericEditableImage>
          <p style={{ fontSize: "clamp(0.88rem, 1.2vw, 0.95rem)", lineHeight: 1.8, color: MUTED, margin: "0 0 24px" }}>
            <GenericEditableText sectionId={sectionId} field="col1Text" value={col1Text} tag="span" />
          </p>
          <a
            href={col1CtaHref}
            style={{
              display: "inline-block",
              fontFamily: SERIF,
              fontSize: 11,
              fontWeight: 400,
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              color: DARK,
              textDecoration: "none",
              borderBottom: `1px solid ${DARK}`,
              paddingBottom: 2,
            }}
          >
            <GenericEditableText sectionId={sectionId} field="col1Cta" value={col1Cta} tag="span" />
          </a>
        </div>

        {/* Col 2 — Káva */}
        <div style={{ padding: "clamp(32px, 5vw, 64px) clamp(24px, 5vw, 60px)" }}>
          <GenericEditableImage sectionId={sectionId} field="col2Image" src={col2Image} alt={col2Cta} style={{ display: "block" }}>
            <img src={col2Image} alt={col2Cta} loading="lazy" style={{ width: "100%", aspectRatio: "3/2", objectFit: "cover", display: "block", marginBottom: 28 }} />
          </GenericEditableImage>
          <p style={{ fontSize: "clamp(0.88rem, 1.2vw, 0.95rem)", lineHeight: 1.8, color: MUTED, margin: "0 0 24px" }}>
            <GenericEditableText sectionId={sectionId} field="col2Text" value={col2Text} tag="span" />
          </p>
          <a
            href={col2CtaHref}
            style={{
              display: "inline-block",
              fontFamily: SERIF,
              fontSize: 11,
              fontWeight: 400,
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              color: DARK,
              textDecoration: "none",
              borderBottom: `1px solid ${DARK}`,
              paddingBottom: 2,
            }}
          >
            <GenericEditableText sectionId={sectionId} field="col2Cta" value={col2Cta} tag="span" />
          </a>
        </div>
      </div>

      <style>{`
        @media (max-width: 640px) {
          .b01-about-cols { grid-template-columns: 1fr !important; }
          .b01-about-cols > div:first-child { border-right: none !important; border-bottom: 1px solid #e8e8e8; }
        }
      `}</style>
    </section>
  );
}

// ── reality-02-benefits ───────────────────────────────────────────────────────
// Ref: fermakleri.cz "Proč je fajn prodávat nemovitost s námi?" — 4 benefit karty
// ─────────────────────────────────────────────────────────────────────────────
function AboutReality02Benefits({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const title = String(content.title ?? "Proč je fajn prodávat nemovitost s námi?");
  const items = (content.items as Array<{ icon: string; title: string; text: string }>) ?? [];

  const DARK  = "#05303a";
  const GREEN = "#3DCE78";
  const FONT  = "'Montserrat', 'Helvetica Neue', Arial, sans-serif";

  // Barva a ikona pro každý benefit typ
  const ICON_CONFIGS: Record<string, { bg: string; border: string; stroke: string }> = {
    fast:     { bg: "#e8f4ff", border: "#93c5fd", stroke: "#2563eb" },
    price:    { bg: "#ecfdf5", border: "#6ee7b7", stroke: "#059669" },
    decision: { bg: "#f5f3ff", border: "#c4b5fd", stroke: "#7c3aed" },
    service:  { bg: "#fff7ed", border: "#fcd34d", stroke: "#d97706" },
  };

  const BenefitIcon = ({ type }: { type: string }) => {
    const cfg = ICON_CONFIGS[type] ?? ICON_CONFIGS.service;
    const p = { width: 34, height: 34, viewBox: "0 0 34 34", fill: "none", stroke: cfg.stroke, strokeWidth: "1.2", strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
    switch (type) {
      case "fast":
        return (
          <svg {...p} className="r02-ico-fast">
            <circle cx="17" cy="19" r="11"/>
            <g className="r02-hand" style={{ transformOrigin: "17px 19px" }}>
              <path d="M17 13 L17 19 L21 22"/>
            </g>
            <path d="M13 5 L21 5"/>
            <path d="M17 5 L17 8"/>
            <path d="M26 9 L28 7"/>
          </svg>
        );
      case "price":
        return (
          <svg {...p} className="r02-ico-price">
            <path className="r02-bar r02-bar1" d="M4 28 L4 20 L10 20 L10 28" style={{ transformOrigin: "7px 28px", transformBox: "fill-box" as const }}/>
            <path className="r02-bar r02-bar2" d="M13 28 L13 13 L19 13 L19 28" style={{ transformOrigin: "16px 28px", transformBox: "fill-box" as const }}/>
            <path className="r02-bar r02-bar3" d="M22 28 L22 7 L28 7 L28 28" style={{ transformOrigin: "25px 28px", transformBox: "fill-box" as const }}/>
            <path d="M2 28 L32 28"/>
            <path d="M25 4 L31 4 L31 10"/>
            <path d="M26 13 L31 4"/>
          </svg>
        );
      case "decision":
        return (
          <svg {...p} className="r02-ico-decision">
            <path d="M17 3 L29 8 L29 18 C29 24 23 29 17 31 C11 29 5 24 5 18 L5 8 Z"/>
            <path className="r02-check" d="M11 17 L15 21 L23 13" style={{ strokeDasharray: 20, strokeDashoffset: 0 }}/>
          </svg>
        );
      default:
        return (
          <svg {...p} className="r02-ico-service">
            <polygon className="r02-star" points="17,4 21,12 30,13 23,20 25,29 17,25 9,29 11,20 4,13 13,12" style={{ transformOrigin: "17px 17px", transformBox: "fill-box" as const }}/>
          </svg>
        );
    }
  };

  return (
    <section id="proc-s-nami" style={{ backgroundColor: "#ffffff", fontFamily: FONT }}>
      <div style={{ width: 0, height: 0, borderLeft: "60px solid transparent", borderRight: "60px solid transparent", borderTop: "44px solid #f7faf9", margin: "0 auto" }} />
      <style>{`
        @keyframes r02-tickhand { to { transform: rotate(360deg); } }
        @keyframes r02-bargrow  { from { transform: scaleY(0); } to { transform: scaleY(1); } }
        @keyframes r02-drawcheck { from { stroke-dashoffset: 20; } to { stroke-dashoffset: 0; } }
        @keyframes r02-starspin { 0%,100% { transform: rotate(0deg) scale(1); } 50% { transform: rotate(18deg) scale(1.14); } }
        @keyframes r02-iconbounce { 0%,100% { transform: scale(1); } 50% { transform: scale(1.13) rotate(-5deg); } }

        .r02-benefit-card { transition: transform 0.22s ease, box-shadow 0.22s ease; cursor: default; }
        .r02-benefit-card:hover { transform: translateY(-6px); box-shadow: 0 16px 36px rgba(5,48,58,0.13); }
        .r02-benefit-icon  { transition: transform 0.3s ease; }
        .r02-benefit-card:hover .r02-benefit-icon { animation: r02-iconbounce 0.6s ease; }

        .r02-benefit-card:hover .r02-ico-fast .r02-hand { animation: r02-tickhand 1.2s linear infinite; }
        .r02-benefit-card:hover .r02-ico-price .r02-bar  { animation: r02-bargrow 0.45s ease-out both; }
        .r02-benefit-card:hover .r02-ico-price .r02-bar2 { animation-delay: 0.07s; }
        .r02-benefit-card:hover .r02-ico-price .r02-bar3 { animation-delay: 0.14s; }
        .r02-benefit-card:hover .r02-ico-decision .r02-check { animation: r02-drawcheck 0.4s ease forwards; }
        .r02-benefit-card:hover .r02-ico-service .r02-star  { animation: r02-starspin 0.7s ease-in-out; }
        @media (max-width: 900px) { [data-r02-benefits-grid] { grid-template-columns: repeat(2,1fr) !important; } }
        @media (max-width: 480px) { [data-r02-benefits-grid] { grid-template-columns: 1fr !important; } }
      `}</style>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "clamp(48px,7vw,88px) clamp(16px,5vw,48px) clamp(56px,8vw,96px)" }}>
        <h2 style={{ fontSize: "clamp(22px,3vw,34px)", fontWeight: 700, color: DARK, marginBottom: "clamp(40px,6vw,64px)", textAlign: "center" }}>
          <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
        </h2>

        <div data-r02-benefits-grid="" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 24 }}>
          {items.map((item, i) => {
            const cfg = ICON_CONFIGS[item.icon] ?? ICON_CONFIGS.service;
            return (
              <div
                key={`r02-ben-${i}`}
                className="r02-benefit-card"
                style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 16, padding: "28px 24px", background: "#ffffff", borderRadius: 16, border: "1px solid #e4eeed", boxShadow: "0 2px 12px rgba(5,48,58,0.05)" }}
              >
                <div
                  className="r02-benefit-icon"
                  style={{ width: 64, height: 64, borderRadius: "50%", backgroundColor: cfg.bg, border: `2px solid ${cfg.border}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}
                >
                  <BenefitIcon type={item.icon} />
                </div>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: DARK, margin: 0, lineHeight: 1.3 }}>
                  <GenericEditableText sectionId={sectionId} field={`items.${i}.title`} value={item.title} tag="span" />
                </h3>
                <p style={{ fontSize: 14, color: DARK, opacity: 0.72, lineHeight: 1.68, margin: 0 }}>
                  <GenericEditableText sectionId={sectionId} field={`items.${i}.text`} value={item.text} tag="span" />
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ── reality-01-about ─────────────────────────────────────────────────────────
// Dark teal 2-col — ref: lexxusnorton.cz
// Vlevo: gold kicker + bílý H2 + text + CTA; vpravo: 2×2 stat bloky + foto
// ─────────────────────────────────────────────────────────────────────────────
function AboutReality01({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const tagline  = String(content.tagline  ?? "O nás");
  const title    = String(content.title    ?? "Exkluzivně — pro každého klienta zvlášť");
  const subtitle = String(content.subtitle ?? "Jsme tým zkušených realitních makléřů s hlubokými znalostmi pražského trhu.");
  const body     = String(content.body     ?? "S více než 33 lety zkušeností na pražském realitním trhu jsme jednou z nejdéle působících realitních kanceláří v České republice.");
  const ctaText  = String(content.ctaText  ?? "Více o nás");
  const ctaHref  = String(content.ctaHref  ?? "/o-nas");
  const image    = String(content.image    ?? "/templates/reality-01/about-bg.jpg");

  type Stat = { value: string; label: string };
  const stats = (content.stats as Stat[]) ?? [
    { value: "33+",   label: "let zkušeností" },
    { value: "2400+", label: "úspěšných transakcí" },
    { value: "98%",   label: "spokojených klientů" },
    { value: "12",    label: "odborných makléřů" },
  ];

  const DARK       = "#1a3640";
  const GOLD       = "#d4a96e";
  const WHITE      = "#ffffff";
  const MONTSERRAT = "'Montserrat', 'Helvetica Neue', Arial, sans-serif";
  const OPEN_SANS  = "'Open Sans', 'Helvetica Neue', Arial, sans-serif";

  return (
    <section style={{ backgroundColor: DARK, padding: "clamp(56px,8vw,96px) 0", position: "relative", overflow: "hidden" }}>
      {/* Decorative diagonal line */}
      <svg style={{ position: "absolute", top: 0, right: "clamp(32px,6vw,120px)", pointerEvents: "none", opacity: 0.4 }} width="161" height="190" viewBox="0 0 161 190" fill="none" aria-hidden="true">
        <path d="M2.47 2.33L158.02 187.71" stroke="#C28F75" strokeOpacity="0.5" strokeWidth="4" />
      </svg>

      <div style={{ maxWidth: 1340, margin: "0 auto", padding: "0 clamp(20px,4vw,56px)" }}>
        <div data-r01-about style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "clamp(40px,5vw,80px)", alignItems: "center" }}>

          {/* LEFT — text content */}
          <div>
            <GenericEditableText sectionId={sectionId} field="tagline" value={tagline} tag="p"
              style={{ fontFamily: MONTSERRAT, fontSize: 12, fontWeight: 600, letterSpacing: "0.2em", textTransform: "uppercase", color: GOLD, margin: "0 0 16px" }} />
            <GenericEditableText sectionId={sectionId} field="title" value={title} tag="h2"
              style={{ fontFamily: MONTSERRAT, fontSize: "clamp(24px,3vw,38px)", fontWeight: 700, lineHeight: 1.2, color: WHITE, margin: "0 0 20px" }} />
            <GenericEditableText sectionId={sectionId} field="subtitle" value={subtitle} tag="p"
              style={{ fontFamily: OPEN_SANS, fontSize: 16, color: "rgba(255,255,255,0.75)", margin: "0 0 16px", lineHeight: 1.7 }} />
            <GenericEditableText sectionId={sectionId} field="body" value={body} tag="p"
              style={{ fontFamily: OPEN_SANS, fontSize: 15, color: "rgba(255,255,255,0.6)", margin: "0 0 40px", lineHeight: 1.75 }} />
            <a href={ctaHref} data-btn="primary" style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              backgroundColor: GOLD, color: "#1a1a1a",
              fontFamily: MONTSERRAT, fontSize: 14, fontWeight: 600, letterSpacing: "0.06em",
              padding: "13px 32px", borderRadius: 4, textDecoration: "none", transition: "background 0.2s",
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = "#c49a5e"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = GOLD; }}
            >
              <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </a>
          </div>

          {/* RIGHT — stats 2×2 + photo */}
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            {/* 2×2 stat grid */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
              {stats.map((stat, i) => (
                <div key={i} style={{
                  backgroundColor: "rgba(255,255,255,0.06)",
                  padding: "28px 24px",
                  borderRadius: i === 0 ? "8px 0 0 0" : i === 1 ? "0 8px 0 0" : i === 2 ? "0 0 0 8px" : "0 0 8px 0",
                }}>
                  <GenericEditableText sectionId={sectionId} field={`stats.${i}.value`} value={stat.value} tag="div"
                    style={{ fontFamily: MONTSERRAT, fontSize: "clamp(32px,3.5vw,48px)", fontWeight: 700, color: GOLD, lineHeight: 1, marginBottom: 6 }} />
                  <GenericEditableText sectionId={sectionId} field={`stats.${i}.label`} value={stat.label} tag="div"
                    style={{ fontFamily: OPEN_SANS, fontSize: 14, color: "rgba(255,255,255,0.6)", lineHeight: 1.4 }} />
                </div>
              ))}
            </div>

            {/* Photo */}
            <div style={{ borderRadius: 8, overflow: "hidden", aspectRatio: "16/9", position: "relative" }}>
              <GenericEditableImage sectionId={sectionId} field="image" src={image} alt="O nás" style={{ position: "absolute", inset: 0 }}>
                <img loading="lazy" src={image} alt="O nás" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </GenericEditableImage>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 767px) { [data-r01-about] { grid-template-columns: 1fr !important; } }
      `}</style>
    </section>
  );
}

// ── reality-05-about ──────────────────────────────────────────────────────────
// Ref: ondrejkucera.com — sekce "O mně" + "Co Vám nabízím"
// Horní část: bílé bg, centrovaný H2 + bio text
// Spodní část: zlatý (#CFA968) bg — 2-col: vlevo H2 + 3 feature řádky (ikona + uppercase H3 + text)
//                                          vpravo: portrait foto + stats
// ─────────────────────────────────────────────────────────────────────────────
function AboutReality05({ content, sectionId }: Pick<Props, "content" | "sectionId">) {
  const title      = String(content.title      ?? "O mně");
  const body       = String(content.body       ?? "");
  const tagline    = String(content.tagline    ?? "");
  const whyTitle   = String(content.whyTitle   ?? "Co Vám nabízím");
  const image      = String(content.image      ?? "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=700&fit=crop&q=80");
  type Feature = { icon: string; title: string; body: string };
  const features   = (content.features as Feature[]) ?? [];

  const GOLD   = "#CFA968";
  const DARK   = "#1c1c1c";
  const WHITE  = "#ffffff";
  const SANS   = "'Open Sans', 'Helvetica Neue', Arial, sans-serif";

  const iconSvg = (icon: string) => {
    if (icon === "plus") return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
    );
    if (icon === "diamond") return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 22 9 12 22 2 9"/></svg>
    );
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
    );
  };

  return (
    <section style={{ fontFamily: SANS }} data-r05-about>
      {/* Horní část — bílé bg, centrovaný bio text */}
      <div style={{ backgroundColor: WHITE, padding: "72px clamp(20px, 6vw, 100px)" }}>
        <div style={{ maxWidth: 780, margin: "0 auto", textAlign: "center" }}>
          <GenericEditableText
            sectionId={sectionId} field="title" value={title} tag="h2"
            style={{ fontFamily: SANS, fontSize: "clamp(26px,3vw,38px)", fontWeight: 700, color: DARK, margin: "0 0 28px", lineHeight: 1.2 }}
          />
          {body.split("\n\n").map((para, i) => (
            <GenericEditableText
              key={i} sectionId={sectionId} field={`body_p${i}`} value={para} tag="p"
              style={{ fontSize: 16, lineHeight: 1.75, color: "#444", margin: "0 0 18px", textAlign: "justify" }}
            />
          ))}
          {tagline && (
            <p style={{ fontFamily: SANS, fontSize: 17, fontWeight: 700, color: DARK, margin: "24px 0 0" }}>
              <GenericEditableText sectionId={sectionId} field="tagline" value={tagline} tag="span" />
            </p>
          )}
        </div>
      </div>

      {/* Spodní část — zlatý bg, 2-col */}
      <div style={{ backgroundColor: GOLD, padding: "0" }}>
        <div style={{ maxWidth: 1320, margin: "0 auto", display: "grid", gridTemplateColumns: "2fr 1fr", minHeight: 480 }} data-r05-about-grid>
          {/* Levý sloupec — features */}
          <div style={{ padding: "56px clamp(24px, 5vw, 72px) 56px clamp(24px, 5vw, 72px)" }}>
            <GenericEditableText
              sectionId={sectionId} field="whyTitle" value={whyTitle} tag="h2"
              style={{ fontFamily: SANS, fontSize: "clamp(22px,2.8vw,32px)", fontWeight: 700, color: WHITE, margin: "0 0 36px" }}
            />
            <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
              {features.map((f, i) => (
                <div key={i} style={{ display: "flex", gap: 20, alignItems: "flex-start" }}>
                  {/* Ikona v kroužku */}
                  <div style={{ flexShrink: 0, width: 44, height: 44, borderRadius: "50%", backgroundColor: "rgba(255,255,255,0.25)", display: "flex", alignItems: "center", justifyContent: "center", color: WHITE }}>
                    {iconSvg(f.icon)}
                  </div>
                  <div>
                    <GenericEditableText
                      sectionId={sectionId} field={`features.${i}.title`} value={f.title} tag="h3"
                      style={{ fontFamily: SANS, fontSize: 14, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: WHITE, margin: "0 0 6px" }}
                    />
                    <GenericEditableText
                      sectionId={sectionId} field={`features.${i}.body`} value={f.body} tag="p"
                      style={{ fontSize: 15, lineHeight: 1.6, color: "rgba(255,255,255,0.88)", margin: 0 }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pravý sloupec — portrait foto */}
          <div style={{ position: "relative", overflow: "hidden", minHeight: 400 }} data-r05-about-photo>
            <GenericEditableImage sectionId={sectionId} field="image" src={image} alt="Makléř" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "top center" }}>
              <img loading="lazy" src={image} alt="Makléř" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "top center" }} />
            </GenericEditableImage>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 767px) {
          [data-r05-about-grid] { grid-template-columns: 1fr !important; }
          [data-r05-about-photo] { min-height: 300px !important; position: relative !important; }
        }
      `}</style>
    </section>
  );
}

// ── reality-04-about ─────────────────────────────────────────────────────────
// Ref: quantumreality.cz — O nás sekce
// Světlé #f8f8f8 bg; vlevo: nadpis + hlavní text + 3 feature boxy (referral /
// legal / odhad zdarma) se zaškrtnutím a modrým nadpisem; každý box má
// tenkostěnný border a hover zvednutí
// ─────────────────────────────────────────────────────────────────────────────
function AboutReality04({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const sectionAnchor      = String(content.id                ?? "o-nas");
  const title              = String(content.title             ?? "O nás");
  const body               = String(content.body              ?? "");
  const referralTitle      = String(content.referralTitle     ?? "Odměníme vás za doporučení");
  const referralBody       = String(content.referralBody      ?? "");
  const legalTitle         = String(content.legalTitle        ?? "Právní jistota");
  const legalBody          = String(content.legalBody         ?? "");
  const freeEstimateTitle  = String(content.freeEstimateTitle ?? "Odhad nemovitosti zdarma");
  const freeEstimateBody   = String(content.freeEstimateBody  ?? "");

  const PRIMARY = "#1032CF";
  const DARK    = "#241f0c";
  const MUTED   = "#666";
  const BORDER  = "#e8e8e8";
  const SANS    = "'Helvetica Neue', Helvetica, Arial, sans-serif";

  const features = [
    { titleField: "referralTitle",     bodyField: "referralBody",     title: referralTitle,     body: referralBody },
    { titleField: "legalTitle",        bodyField: "legalBody",        title: legalTitle,        body: legalBody },
    { titleField: "freeEstimateTitle", bodyField: "freeEstimateBody", title: freeEstimateTitle, body: freeEstimateBody },
  ];

  return (
    <section id={sectionAnchor} style={{ backgroundColor: "#f8f8f8", padding: "clamp(56px, 7vw, 96px) 0" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 clamp(16px, 3vw, 40px)" }}>

        <div className="r04-about-grid">
          {/* Levá část — nadpis + perex */}
          <div>
            <h2 style={{ fontFamily: SANS, fontSize: "clamp(22px, 2.5vw, 32px)", fontWeight: 700, color: DARK, marginTop: 0, marginBottom: 20 }}>
              <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
            </h2>
            <p style={{ fontFamily: SANS, fontSize: 15, color: MUTED, lineHeight: 1.75, margin: "0 0 32px" }}>
              <GenericEditableText sectionId={sectionId} field="body" value={body} tag="span" />
            </p>
          </div>

          {/* Pravá část — 3 feature boxy */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {features.map((f, i) => (
              <div key={i} style={{ backgroundColor: "#fff", border: `1px solid ${BORDER}`, borderRadius: 8, padding: "20px 22px", display: "flex", gap: 14, transition: "box-shadow 0.2s, transform 0.2s" }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.08)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.transform = "none"; }}
              >
                {/* Checkmark ikona */}
                <div style={{ width: 28, height: 28, borderRadius: "50%", backgroundColor: PRIMARY, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 2 }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                </div>
                <div>
                  <div style={{ fontFamily: SANS, fontSize: 15, fontWeight: 700, color: PRIMARY, marginBottom: 4 }}>
                    <GenericEditableText sectionId={sectionId} field={f.titleField} value={f.title} tag="span" />
                  </div>
                  <div style={{ fontFamily: SANS, fontSize: 13, color: MUTED, lineHeight: 1.6 }}>
                    <GenericEditableText sectionId={sectionId} field={f.bodyField} value={f.body} tag="span" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <style>{`
        .r04-about-grid { display: grid; grid-template-columns: 1fr 1.1fr; gap: clamp(32px, 5vw, 72px); align-items: start; }
        @media (max-width: 768px) { .r04-about-grid { grid-template-columns: 1fr; } }
      `}</style>
    </section>
  );
}

// ── reality-06-about ─────────────────────────────────────────────────────────
// Ref: jansrubar.cz — tmavě modrá sekce (bg-primary-800), bílý text, pt-32 kvůli CTA baru z hera
function AboutReality06({ content, sectionId, tenantSlug, isAdmin }: { content: Record<string, unknown>; sectionId: number; tenantSlug?: string; isAdmin: boolean }) {
  const title   = String(content.title   ?? "O mně");
  const para1   = String(content.para1   ?? "");
  const para2   = String(content.para2   ?? "");
  const para3   = String(content.para3   ?? "");
  const ctaText = String(content.ctaText ?? "Kontaktujte mě");
  const ctaHref = String(content.ctaHref ?? "#kontakt");
  const BG      = "#1C2B6B";
  const SANS    = "'Helvetica Neue', Helvetica, Arial, sans-serif";
  const resolve = (href: string) => resolveDemoHref(href, tenantSlug ?? "", isAdmin);
  return (
    <section id="o-mne" style={{ backgroundColor: BG, padding: "128px 0 80px", position: "relative", zIndex: 10 }} data-template="reality-06-about">
      <style>{`@media (max-width: 640px) { [data-template="reality-06-about"] { padding-top: 80px !important; } }`}</style>
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "0 clamp(16px, 4vw, 40px)", display: "flex", flexDirection: "column", gap: 28 }}>
        <h2 style={{ fontFamily: SANS, fontSize: 30, fontWeight: 600, color: "#ffffff", margin: 0 }}>
          <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
        </h2>
        {para1 && (
          <div style={{ fontFamily: SANS, fontSize: 17, lineHeight: 1.8, color: "rgba(255,255,255,0.82)", margin: 0 }}>
            <GenericEditableText sectionId={sectionId} field="para1" value={para1} tag="span" style={{ display: "block" }} />
          </div>
        )}
        {para2 && (
          <div style={{ fontFamily: SANS, fontSize: 17, lineHeight: 1.8, color: "rgba(255,255,255,0.82)", margin: 0 }}>
            <GenericEditableText sectionId={sectionId} field="para2" value={para2} tag="span" style={{ display: "block" }} />
          </div>
        )}
        {para3 && (
          <div style={{ fontFamily: SANS, fontSize: 17, lineHeight: 1.8, color: "rgba(255,255,255,0.82)", margin: 0 }}>
            <GenericEditableText sectionId={sectionId} field="para3" value={para3} tag="span" style={{ display: "block" }} />
          </div>
        )}
        <div style={{ paddingTop: 8 }}>
          <a href={resolve(ctaHref)} data-btn="primary"
            style={{ display: "inline-flex", alignItems: "center", padding: "11px 28px", backgroundColor: "#ffffff", color: BG, fontFamily: SANS, fontSize: 14, fontWeight: 700, textDecoration: "none", borderRadius: 99, transition: "opacity 0.18s" }}
            onMouseEnter={e => (e.currentTarget.style.opacity = "0.88")}
            onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
          >
            <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
          </a>
        </div>
      </div>
    </section>
  );
}

// ─── autoservis-02 About ────────────────────────────────────────────────────
function AboutAutoservis02({ content, sectionId, tenantSlug, isAdmin }: {
  content: Record<string, unknown>;
  sectionId: number;
  tenantSlug?: string;
  isAdmin?: boolean;
}) {
  const RED  = "#d82a2a";
  const DARK = "#1a1a1a";
  const SANS = "'Open Sans', Arial, sans-serif";

  const tagline = (content.tagline as string) || "";
  const title   = (content.title   as string) || "";
  const body    = (content.body    as string) || "";
  const ctaText = (content.ctaText as string) || "";
  const ctaHref = (content.ctaHref as string) || "#";
  const imageUrl = (content.image  as string) || "";
  const stats   = (content.stats   as Array<{ number: string; label: string }>) || [];
  const bullets = (content.bullets as string[]) || [];

  const resolve = (href: string) => resolveDemoHref(href, tenantSlug, isAdmin);

  return (
    <section id={(content.id as string) || "o-nas"} style={{ backgroundColor: "#f5f5f5", fontFamily: SANS }}>
      {/* Stats bar */}
      {stats.length > 0 && (
        <div style={{ backgroundColor: RED, padding: "20px 0" }}>
          <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px", display: "flex", justifyContent: "center", gap: 48, flexWrap: "wrap" }}>
            {stats.map((s, i) => (
              <div key={i} style={{ textAlign: "center" }}>
                <div style={{ fontSize: 32, fontWeight: 900, color: "#fff", lineHeight: 1.1 }}>
                  <GenericEditableText sectionId={sectionId} field={`stats.${i}.number`} value={s.number} tag="span" />
                </div>
                <div style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.85)", letterSpacing: 1, textTransform: "uppercase" }}>
                  <GenericEditableText sectionId={sectionId} field={`stats.${i}.label`} value={s.label} tag="span" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2-col content */}
      <div className="a02-about-grid" style={{ maxWidth: 1100, margin: "0 auto", padding: "72px 24px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 64, alignItems: "center" }}>
        {/* Left: text */}
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: RED, letterSpacing: 3, textTransform: "uppercase", marginBottom: 12 }}>
            <GenericEditableText sectionId={sectionId} field="tagline" value={tagline} tag="span" />
          </div>
          <h2 style={{ fontSize: "clamp(28px, 4vw, 42px)", fontWeight: 900, color: DARK, lineHeight: 1.15, marginBottom: 20, whiteSpace: "pre-line" }}>
            <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
          </h2>
          <p style={{ fontSize: 16, lineHeight: 1.8, color: "#444", marginBottom: 28 }}>
            <GenericEditableText sectionId={sectionId} field="body" value={body} tag="span" />
          </p>
          {bullets.length > 0 && (
            <ul style={{ listStyle: "none", padding: 0, margin: "0 0 32px 0", display: "flex", flexDirection: "column", gap: 10 }}>
              {bullets.map((b, i) => (
                <li key={i} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 15, color: DARK, fontWeight: 600 }}>
                  <span style={{ width: 20, height: 20, borderRadius: "50%", backgroundColor: RED, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <svg width="11" height="9" viewBox="0 0 11 9" fill="none"><path d="M1 4.2L4 7.5L10 1" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </span>
                  <GenericEditableText sectionId={sectionId} field={`bullets.${i}`} value={b} tag="span" />
                </li>
              ))}
            </ul>
          )}
          <a href={resolve(ctaHref)} data-btn="primary"
            style={{ display: "inline-flex", alignItems: "center", gap: 8, backgroundColor: RED, color: "#fff", fontFamily: SANS, fontSize: 15, fontWeight: 700, padding: "13px 30px", borderRadius: 4, textDecoration: "none", transition: "opacity 0.18s" }}
            onMouseEnter={e => (e.currentTarget.style.opacity = "0.85")}
            onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
          >
            <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
          </a>
        </div>

        {/* Right: photo */}
        <div style={{ borderRadius: 8, overflow: "hidden", aspectRatio: "4/3", position: "relative" }}>
          <GenericEditableImage sectionId={sectionId} field="image" src={imageUrl} alt={title} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", position: "absolute" }}>
            <img
              src={imageUrl}
              alt={title}
              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
            />
          </GenericEditableImage>
        </div>
      </div>

      <style>{`
        @media (max-width: 759px) {
          .a02-about-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}

// ── autoservis-01-about ───────────────────────────────────────────────────────
// 2-col text+foto, bílé bg, orange checkmarks, věrnostní klub
function AboutAutoservis01({ content, sectionId, tenantSlug, isAdmin }: {
  content: Record<string, unknown>;
  sectionId: number;
  tenantSlug?: string;
  isAdmin?: boolean;
}) {
  const ORANGE = "#FFA500";
  const DARK   = "#111111";
  const MUTED  = "#555555";
  const SANS   = "'Helvetica Neue', Helvetica, Arial, sans-serif";

  const tagline  = (content.tagline  as string) || "";
  const title    = (content.title    as string) || "";
  const body     = (content.body     as string) || "";
  const ctaText  = (content.ctaText  as string) || "";
  const ctaHref  = (content.ctaHref  as string) || "#";
  const imageUrl = (content.image    as string) || "";
  const bullets  = (content.bullets  as string[]) || [];

  const resolve = (href: string) => resolveDemoHref(href, tenantSlug, isAdmin);

  return (
    <section id={(content.id as string) || "o-nas"} style={{ backgroundColor: "#fff", padding: "96px 0" }} data-template="autoservis-01-about">
      <style>{`
        .a01-about-grid { display: grid; grid-template-columns: 1fr 1fr; gap: clamp(32px, 6vw, 80px); align-items: center; }
        @media (max-width: 768px) { .a01-about-grid { grid-template-columns: 1fr; } .a01-about-img { order: -1; } }
      `}</style>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 clamp(16px,4vw,48px)" }}>
        <div className="a01-about-grid">
          {/* Left: text */}
          <div>
            <p style={{ fontFamily: SANS, fontSize: 13, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: ORANGE, margin: "0 0 12px" }}>
              <GenericEditableText sectionId={sectionId} field="tagline" value={tagline} tag="span" />
            </p>
            <h2 style={{ fontFamily: SANS, fontSize: "clamp(26px,3.2vw,38px)", fontWeight: 800, color: DARK, margin: "0 0 8px", lineHeight: 1.2, whiteSpace: "pre-line" }}>
              <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
            </h2>
            <div style={{ width: 48, height: 3, backgroundColor: ORANGE, borderRadius: 2, margin: "0 0 24px" }} />
            <p style={{ fontFamily: SANS, fontSize: 16, lineHeight: 1.8, color: MUTED, margin: "0 0 28px" }}>
              <GenericEditableText sectionId={sectionId} field="body" value={body} tag="span" />
            </p>
            {bullets.length > 0 && (
              <ul style={{ listStyle: "none", padding: 0, margin: "0 0 36px", display: "flex", flexDirection: "column", gap: 12 }}>
                {bullets.map((b, i) => (
                  <li key={i} style={{ display: "flex", alignItems: "center", gap: 12, fontFamily: SANS, fontSize: 15, color: DARK, fontWeight: 600 }}>
                    <span style={{ width: 22, height: 22, borderRadius: "50%", backgroundColor: ORANGE, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <svg width="12" height="9" viewBox="0 0 12 9" fill="none"><path d="M1 4.5L4.5 8L11 1" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </span>
                    <GenericEditableText sectionId={sectionId} field={`bullets.${i}`} value={b} tag="span" />
                  </li>
                ))}
              </ul>
            )}
            {ctaText && (
              <a href={resolve(ctaHref)} data-btn="primary"
                style={{ display: "inline-flex", alignItems: "center", gap: 8, backgroundColor: ORANGE, color: "#fff", fontFamily: SANS, fontSize: 15, fontWeight: 700, padding: "13px 30px", borderRadius: 4, textDecoration: "none", transition: "opacity 0.18s" }}
                onMouseEnter={e => (e.currentTarget.style.opacity = "0.85")}
                onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
              >
                <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
              </a>
            )}
          </div>

          {/* Right: photo */}
          <div className="a01-about-img" style={{ borderRadius: 12, overflow: "hidden", aspectRatio: "4/3", position: "relative", boxShadow: "0 12px 40px rgba(0,0,0,0.12)" }}>
            <GenericEditableImage sectionId={sectionId} field="image" src={imageUrl} alt={title} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}>
              <img loading="lazy" src={imageUrl} alt={title} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
            </GenericEditableImage>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── autoservis-03-about ───────────────────────────────────────────────────────
function AboutAutoservis03({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  "use client";
  const SANS = "'Inter', 'Helvetica Neue', sans-serif";
  const ORANGE = "#f97316";

  const tagline = (content.tagline as string) || "Proč si vybrat právě nás?";
  const title = (content.title as string) || "Kvalita a spolehlivost\nna prvním místě";
  const items = (content.items as Array<{ icon: string; title: string; description: string }>) || [];

  const iconSvg: Record<string, React.ReactElement> = {
    user: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
      </svg>
    ),
    zap: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
      </svg>
    ),
    award: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="9" r="7"/><path d="M8.56 17.01L7 22l5-3 5 3-1.56-4.99"/>
      </svg>
    ),
    "check-circle": (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/><path d="M9 12l2 2 4-4"/>
      </svg>
    ),
  };

  return (
    <section
      id={(content.id as string) || "proc-my"}
      data-template="autoservis-03-about"
      style={{ backgroundColor: "#0a0a0a", padding: "100px 24px" }}
    >
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 64 }}>
          <span style={{ fontFamily: SANS, fontSize: 13, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: ORANGE }}>
            <GenericEditableText sectionId={sectionId} field="tagline" value={tagline} tag="span" />
          </span>
          <h2 style={{ fontFamily: SANS, fontSize: "clamp(28px,3.5vw,42px)", fontWeight: 900, color: "#fff", margin: "12px 0 0", lineHeight: 1.2, whiteSpace: "pre-line" }}>
            <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
          </h2>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))", gap: 24 }}>
          {items.map((item, i) => (
            <div
              key={i}
              style={{
                backgroundColor: "#111827",
                border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: 12,
                padding: "36px 28px",
                display: "flex",
                flexDirection: "column",
                gap: 16,
                transition: "border-color 0.2s, transform 0.2s",
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(249,115,22,0.5)";
                (e.currentTarget as HTMLDivElement).style.transform = "translateY(-4px)";
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(255,255,255,0.06)";
                (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
              }}
            >
              <div style={{ width: 52, height: 52, borderRadius: 10, background: `linear-gradient(135deg, ${ORANGE}, #ea6c08)`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                {iconSvg[item.icon] ?? iconSvg["check-circle"]}
              </div>
              <h3 style={{ fontFamily: SANS, fontSize: 17, fontWeight: 700, color: "#fff", margin: 0 }}>{item.title}</h3>
              <p style={{ fontFamily: SANS, fontSize: 14, lineHeight: 1.7, color: "#9ca3af", margin: 0 }}>{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── autoservis-03-about-story ─────────────────────────────────────────────────
function AboutAutoservis03Story({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  "use client";
  const SANS = "'Inter', 'Helvetica Neue', sans-serif";
  const ORANGE = "#f97316";

  const tagline  = (content.tagline as string)  || "O nás";
  const title    = (content.title as string)    || "Váš spolehlivý partner";
  const body     = (content.body as string)     || "";
  const bullets  = (content.bullets as string[]) || [];
  const ctaText  = (content.ctaText as string)  || "Objednat se";
  const ctaHref  = (content.ctaHref as string)  || "#kontakt";
  const imageUrl = (content.image as string)    || "";

  return (
    <section
      id={(content.id as string) || "o-nas"}
      data-template="autoservis-03-about-story"
      style={{ backgroundColor: "#000", padding: "100px 24px" }}
    >
      <style>{`
        .a03-story-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 64px; align-items: center; max-width: 1100px; margin: 0 auto; }
        @media (max-width: 768px) { .a03-story-grid { grid-template-columns: 1fr; gap: 40px; } }
      `}</style>
      <div className="a03-story-grid">
        {/* Left: text */}
        <div>
          <span style={{ fontFamily: SANS, fontSize: 13, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: ORANGE, display: "block", marginBottom: 12 }}>
            <GenericEditableText sectionId={sectionId} field="tagline" value={tagline} tag="span" />
          </span>
          <h2 style={{ fontFamily: SANS, fontSize: "clamp(26px,3.2vw,40px)", fontWeight: 900, color: "#fff", margin: "0 0 20px", lineHeight: 1.2, whiteSpace: "pre-line" }}>
            <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
          </h2>
          <div style={{ width: 48, height: 3, backgroundColor: ORANGE, borderRadius: 2, marginBottom: 24 }} />
          {body && (
            <p style={{ fontFamily: SANS, fontSize: 15, lineHeight: 1.8, color: "#9ca3af", margin: "0 0 28px" }}>
              <GenericEditableText sectionId={sectionId} field="body" value={body} tag="span" />
            </p>
          )}
          {bullets.length > 0 && (
            <ul style={{ listStyle: "none", padding: 0, margin: "0 0 36px", display: "flex", flexDirection: "column", gap: 12 }}>
              {bullets.map((b, i) => (
                <li key={i} style={{ display: "flex", alignItems: "center", gap: 12, fontFamily: SANS, fontSize: 14, color: "#d1d5db" }}>
                  <span style={{ width: 20, height: 20, borderRadius: "50%", background: `linear-gradient(135deg, ${ORANGE}, #ea6c08)`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4L3.5 6.5L9 1" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </span>
                  {b}
                </li>
              ))}
            </ul>
          )}
          {ctaText && (
            <a
              href={ctaHref}
              data-btn="primary"
              style={{ display: "inline-flex", alignItems: "center", gap: 8, background: `linear-gradient(135deg, ${ORANGE}, #ea6c08)`, color: "#fff", fontFamily: SANS, fontSize: 14, fontWeight: 700, padding: "13px 28px", borderRadius: 10, textDecoration: "none", transition: "opacity 0.18s" }}
              onMouseEnter={e => (e.currentTarget.style.opacity = "0.85")}
              onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
            >
              <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
            </a>
          )}
        </div>

        {/* Right: photo */}
        {imageUrl && (
          <div style={{ borderRadius: 16, overflow: "hidden", aspectRatio: "4/3", position: "relative", border: "1px solid rgba(249,115,22,0.15)" }}>
            <img loading="lazy" src={imageUrl} alt={title} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
          </div>
        )}
      </div>
    </section>
  );
}

// ── dental-01-about ──────────────────────────────────────────────────────────
// Surface #f7f9f9 bg. 2-col: text (kicker+H2+body+features+CTA+pobočky) vlevo,
// fotka vpravo. Features: 2-col mřížka s teal ✓. Teal CTA tlačítko.
// ─────────────────────────────────────────────────────────────────────────────
function AboutDental01({ content, sectionId, tenantSlug, isAdmin }: { content: Record<string, unknown>; sectionId: number; tenantSlug?: string; isAdmin: boolean }) {
  const TEAL  = "#14a2a8";
  const DARK  = "#1c2335";
  const MUTED = "#6b7280";
  const WHITE = "#ffffff";
  const FONT  = "'Montserrat', 'Arial', sans-serif";

  const kicker   = String(content.kicker   ?? "O nás");
  const heading  = String(content.heading  ?? "Stomatologická klinika Demo Dental Care");
  const body     = String(content.body     ?? "");
  const ctaText  = String(content.ctaText  ?? "Objednat se");
  const ctaHref  = String(content.ctaHref  ?? "#kontakt");
  const imageUrl = String(content.imageUrl ?? "/clones/magicsmile/wp-content/uploads/2024/03/9f70b2f7-899d-47bd-b6fc-88e0b0e7539d-1200x674.jpg");
  const features = Array.isArray(content.features) ? (content.features as string[]) : [];
  const branches = Array.isArray(content.branches)
    ? (content.branches as Array<{ name?: string; city?: string }>)
    : [];

  return (
    <section id="o-nas" style={{ backgroundColor: "#f7f9f9", padding: "clamp(64px,8vw,100px) 0", fontFamily: FONT }}>
      <div className="d01-about-grid" style={{
        maxWidth: 1200,
        margin: "0 auto",
        padding: "0 clamp(24px,5vw,64px)",
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "clamp(40px,6vw,88px)",
        alignItems: "center",
      }}>
        {/* ── Left: text ── */}
        <div>
          <p style={{ fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: TEAL, margin: "0 0 14px" }}>
            <GenericEditableText sectionId={sectionId} field="kicker" value={kicker} tag="span" />
          </p>
          <h2 style={{ fontSize: "clamp(1.6rem,3vw,2.4rem)", fontWeight: 800, color: DARK, lineHeight: 1.2, margin: "0 0 22px" }}>
            <GenericEditableText sectionId={sectionId} field="heading" value={heading} tag="span" />
          </h2>
          <p style={{ fontSize: "clamp(0.9rem,1.2vw,1rem)", color: MUTED, lineHeight: 1.85, margin: "0 0 28px" }}>
            <GenericEditableText sectionId={sectionId} field="body" value={body} tag="span" />
          </p>

          {/* Features 2-col */}
          {features.length > 0 && (
            <ul className="d01-features-grid" style={{ listStyle: "none", margin: "0 0 32px", padding: 0, display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 20px" }}>
              {features.map((f, i) => (
                <li key={i} style={{ fontSize: "0.88rem", color: DARK, display: "flex", alignItems: "flex-start", gap: 8, lineHeight: 1.4 }}>
                  <span style={{ color: TEAL, fontWeight: 800, fontSize: "1rem", flexShrink: 0, marginTop: 1 }}>✓</span>
                  <GenericEditableText sectionId={sectionId} field={`features.${i}`} value={f} tag="span" />
                </li>
              ))}
            </ul>
          )}

          {/* CTA */}
          <a
            href={resolveDemoHref(ctaHref, tenantSlug, isAdmin)}
            data-btn="primary"
            style={{
              display: "inline-flex", alignItems: "center", justifyContent: "center",
              padding: "13px 32px", backgroundColor: TEAL, color: WHITE,
              fontSize: "0.88rem", fontWeight: 700, letterSpacing: "0.06em",
              textDecoration: "none", borderRadius: 10, border: `2px solid ${TEAL}`,
              transition: "background-color 0.18s, border-color 0.18s",
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.backgroundColor = "#0e787b"; (e.currentTarget as HTMLAnchorElement).style.borderColor = "#0e787b"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.backgroundColor = TEAL; (e.currentTarget as HTMLAnchorElement).style.borderColor = TEAL; }}
          >
            <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
          </a>

          {/* Pobočky */}
          {branches.length > 0 && (
            <div style={{ marginTop: 32, display: "flex", flexWrap: "wrap", gap: 12 }}>
              {branches.map((b, i) => (
                <div key={i} style={{
                  display: "flex", alignItems: "center", gap: 8,
                  padding: "10px 18px", backgroundColor: WHITE,
                  borderRadius: 8, border: "1px solid #e5eaea",
                  fontSize: "0.85rem", fontWeight: 600, color: DARK,
                }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={TEAL} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                  </svg>
                  <GenericEditableText sectionId={sectionId} field={`branches.${i}.name`} value={b.name ?? ""} tag="span" />
                  {b.city ? <span style={{ color: MUTED }}>, {b.city}</span> : null}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Right: foto ── */}
        <div style={{ borderRadius: 12, overflow: "hidden", aspectRatio: "4/3" }}>
          <GenericEditableImage
            sectionId={sectionId}
            field="imageUrl"
            src={imageUrl}
            alt="Klinika"
            style={{ display: "flex", width: "100%", height: "100%" }}
          >
            <img
              src={imageUrl}
              alt="Demo Dental Care"
              style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center top", display: "block" }}
            />
          </GenericEditableImage>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .d01-about-grid { grid-template-columns: 1fr !important; }
          .d01-about-grid > div:last-child { aspect-ratio: 3/2 !important; }
          .d01-features-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}

// ── ortho-02-about ────────────────────────────────────────────────────────────
// cGnotation layout: text vlevo (bílý bg, 50%), velká foto vpravo (50%)
// Desktop výška: min 600px (auto proportional), foto cover
// Reference: perfectsmile.cz → cGnotation--homepage
// ─────────────────────────────────────────────────────────────────────────────
function AboutOrtho02({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const FONT  = "'Raleway', 'Helvetica Neue', Arial, sans-serif";
  const DARK  = "#1a1a1a";
  const MUTED = "#666666";

  const heading = String(content.heading ?? "Rovné zuby vytvářejí perfektní úsměv.");
  const body    = String(content.body    ?? "Jsou předpokladem pro dlouhodobě zdravý chrup, snižují riziko paradontózy a tvorby zubního kazu. Do ortodontické léčby přijímáme dospělé, teenagery i děti.");
  const subline = String(content.subline ?? "Začněte se usmívat naplno!");
  const bgImage = String(content.bgImage ?? "/templates/ortho-02/about-bg.jpg");

  return (
    <section
      id="about"
      data-section-type="about"
      data-variant="ortho-02-about"
      style={{ fontFamily: FONT }}
    >
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", minHeight: 640 }} className="o02-about-grid">
        {/* Text panel — bílé pozadí */}
        <div style={{
          backgroundColor: "#ffffff",
          display: "flex",
          alignItems: "center",
          padding: "clamp(48px, 7vw, 96px) clamp(40px, 6vw, 96px)",
        }}>
          <div style={{ maxWidth: 520 }}>
            <h2 style={{ margin: "0 0 24px", fontSize: "clamp(1.5rem, 2.8vw, 2.6rem)", fontWeight: 300, color: DARK, lineHeight: 1.3, letterSpacing: "-0.01em" }}>
              <GenericEditableText sectionId={sectionId} field="heading" value={heading} tag="span" />
            </h2>
            <p style={{ margin: "0 0 20px", fontSize: "clamp(0.9rem, 1.2vw, 1.05rem)", color: MUTED, lineHeight: 1.8 }}>
              <GenericEditableText sectionId={sectionId} field="body" value={body} tag="span" />
            </p>
            <p style={{ margin: 0, fontSize: "clamp(0.9rem, 1.2vw, 1.05rem)", color: DARK, fontWeight: 500, lineHeight: 1.6 }}>
              <GenericEditableText sectionId={sectionId} field="subline" value={subline} tag="span" />
            </p>
          </div>
        </div>

        {/* Foto vpravo — cover */}
        <div style={{ position: "relative", overflow: "hidden", minHeight: 400, backgroundColor: "#c8bfb4" }}>
          <GenericEditableImage sectionId={sectionId} field="bgImage" src={bgImage} alt={heading} style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
            <img
              src={bgImage}
              alt={heading}
              style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center" }}
            />
          </GenericEditableImage>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .o02-about-grid { grid-template-columns: 1fr !important; }
          .o02-about-grid > div:last-child { min-height: 320px !important; aspect-ratio: 4/3; }
        }
      `}</style>
    </section>
  );
}

/* ─── AboutLawyer01 ─────────────────────────────────────────── */
function AboutLawyer01({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const NAVY    = "#141760";
  const CRIMSON = "#a70336";
  const HEADING = "'Raleway','Montserrat','Helvetica Neue',Arial,sans-serif";
  const BODY    = "'Open Sans','Helvetica Neue',Arial,sans-serif";

  const title    = String(content.title    ?? "Mezinárodní dosah");
  const subtitle = String(content.subtitle ?? "Právní a daňové poradenství bez hranic");
  const lead     = String(content.lead     ?? "");
  const body     = String(content.body     ?? "");
  const ctaText  = String(content.ctaText  ?? "Více o kanceláři");
  const ctaHref  = String(content.ctaHref  ?? "/o-nas");
  const imageUrl = String(content.imageUrl ?? "");

  const photo = imageUrl || "https://images.unsplash.com/photo-1541746972996-4e0b0f43e02a?w=900&h=680&fit=crop&fm=webp&q=80";

  return (
    <section
      id="o-nas"
      data-variant="lawyer-01-about"
      style={{ backgroundColor: "#fff", padding: "88px 0 96px" }}
    >
      <style>{`
        @media (max-width: 900px) {
          .l01-about-grid { grid-template-columns: 1fr !important; }
          .l01-about-img  { aspect-ratio: 16/9 !important; min-height: 240px; }
        }
      `}</style>

      <div style={{ maxWidth: 1180, margin: "0 auto", padding: "0 32px" }}>
        <div
          className="l01-about-grid"
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "clamp(40px,6vw,96px)", alignItems: "center" }}
        >
          {/* TEXT */}
          <div>
            {/* crimson accent line */}
            <div style={{ width: 36, height: 3, backgroundColor: CRIMSON, marginBottom: 24 }} />

            <h2 style={{ fontFamily: HEADING, fontSize: "clamp(1.75rem,3.2vw,2.6rem)", fontWeight: 700, color: NAVY, margin: "0 0 10px", lineHeight: 1.18, letterSpacing: "-0.01em" }}>
              <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
            </h2>

            <p style={{ fontFamily: HEADING, fontSize: "clamp(1rem,1.4vw,1.2rem)", fontWeight: 400, color: CRIMSON, margin: "0 0 28px", lineHeight: 1.4 }}>
              <GenericEditableText sectionId={sectionId} field="subtitle" value={subtitle} tag="span" />
            </p>

            <p style={{ fontFamily: BODY, fontSize: "clamp(0.9rem,1.1vw,1rem)", color: "#374151", lineHeight: 1.75, margin: "0 0 18px" }}>
              <GenericEditableText sectionId={sectionId} field="lead" value={lead} tag="span" />
            </p>

            {body && (
              <p style={{ fontFamily: BODY, fontSize: "clamp(0.9rem,1.1vw,1rem)", color: "#374151", lineHeight: 1.75, margin: "0 0 36px" }}>
                <GenericEditableText sectionId={sectionId} field="body" value={body} tag="span" />
              </p>
            )}

            <a
              href={ctaHref}
              data-btn="primary"
              style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                backgroundColor: NAVY, color: "#fff",
                fontFamily: BODY, fontSize: "0.95rem", fontWeight: 600,
                padding: "13px 28px", borderRadius: 4, textDecoration: "none",
                letterSpacing: "0.03em", transition: "background 0.18s, transform 0.15s",
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.backgroundColor = CRIMSON; }}
              onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.backgroundColor = NAVY; }}
            >
              <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </a>
          </div>

          {/* IMAGE */}
          <div
            className="l01-about-img"
            style={{ position: "relative", aspectRatio: "4/3", borderRadius: 4, overflow: "hidden", boxShadow: "0 12px 48px rgba(20,23,96,0.14)" }}
          >
            <Image
              src={photo}
              alt={title}
              fill
              sizes="(max-width:900px) 100vw, 50vw"
              style={{ objectFit: "cover", objectPosition: "center" }}
              unoptimized={shouldSkipNextImageOptimization(photo)}
            />
            {/* subtle crimson corner accent */}
            <div style={{ position: "absolute", top: 0, left: 0, width: 4, height: "100%", backgroundColor: CRIMSON, opacity: 0.85 }} />
          </div>
        </div>
      </div>
    </section>
  );
}

function AboutLegal02({ content, sectionId, tenantSlug, isAdmin }: { content: Record<string, unknown>; sectionId: number; tenantSlug?: string; isAdmin: boolean }) {
  const c = content as Record<string, unknown>;

  const NAVY   = "#143171";
  const ORANGE = "#EB5C2E";
  const FONT_B = "'bw_gradualbold', 'Montserrat', 'Helvetica Neue', Arial, sans-serif";
  const FONT_R = "'bw_gradualregular', 'Open Sans', 'Helvetica Neue', Arial, sans-serif";

  const tagline = (c.tagline as string) ?? "O kanceláři";
  const title   = (c.title   as string) ?? "Přes 35 let se podílíme\nna rozvoji české společnosti";
  const body    = (c.body    as string) ?? "";
  const ctaText = (c.ctaText as string) ?? "Více o nás";
  const ctaHref = (c.ctaHref as string) ?? "/o-nas";
  const image   = (c.image   as string) ?? "/templates/legal-02/about-bg.jpg";

  const href = resolveDemoHref(ctaHref, tenantSlug, isAdmin);

  return (
    <section data-variant="legal-02-about" style={{ backgroundColor: "#fff", overflow: "hidden" }}>
      <style>{`
        @font-face { font-family:'bw_gradualbold';   src:url('/templates/legal-02/bwgradual-bold-webfont.woff2')    format('woff2'); font-display:swap; }
        @font-face { font-family:'bw_gradualregular'; src:url('/templates/legal-02/bwgradual-regular-webfont.woff2') format('woff2'); font-display:swap; }
        .l02a-cta {
          display: inline-flex; align-items: center; gap: 10px;
          border: 2px solid #143171; border-radius: 30px;
          color: #143171; padding: 14px 40px;
          font-family: 'bw_gradualbold', 'Montserrat', sans-serif; font-size: 17px;
          text-decoration: none; transition: background .2s, color .2s;
        }
        .l02a-cta:hover { background: #143171; color: #fff; }
        @media (max-width: 900px) {
          .l02a-row { flex-direction: column !important; }
          .l02a-txt { width: 100% !important; margin-right: 0 !important; }
          .l02a-img { width: 100% !important; min-height: 300px !important; }
          .l02a-article { margin-right: 0 !important; padding: 60px 40px !important; }
        }
      `}</style>

      {/* 50/50 row — text left, image right */}
      <div className="l02a-row" style={{ display: "flex", alignItems: "stretch" }}>

        {/* Left: text col */}
        <div className="l02a-txt" style={{ width: "50%", position: "relative" }}>
          <div
            className="l02a-article"
            style={{
              backgroundColor: "#eceff4",
              marginRight: -160,
              padding: "120px 220px 120px 80px",
              height: "100%",
              boxSizing: "border-box",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
            }}
          >
            {/* Tagline */}
            <p style={{
              fontFamily: FONT_B, fontSize: 13, letterSpacing: "0.14em",
              textTransform: "uppercase", color: ORANGE, margin: "0 0 28px",
            }}>
              <GenericEditableText sectionId={sectionId} field="tagline" value={tagline} tag="span" />
            </p>

            {/* H2 */}
            <h2 style={{
              fontFamily: FONT_B, fontSize: 48, lineHeight: "56px",
              color: NAVY, margin: "0 0 24px", whiteSpace: "pre-line",
            }}>
              <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
            </h2>

            {/* Body */}
            {body && (
              <p style={{
                fontFamily: FONT_R, fontSize: 18, lineHeight: 1.7,
                color: "#4b5563", margin: "0 0 44px",
              }}>
                <GenericEditableText sectionId={sectionId} field="body" value={body} tag="span" />
              </p>
            )}

            {/* CTA */}
            <a href={href} className="l02a-cta">
              {ctaText}
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </a>
          </div>
        </div>

        {/* Right: image col */}
        <div className="l02a-img" style={{ width: "50%", position: "relative", minHeight: 500 }}>
          <GenericEditableImage
            sectionId={sectionId}
            field="image"
            src={image}
            alt={title}
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
          >
            <Image
              src={image}
              alt={title}
              fill
              style={{ objectFit: "cover", objectPosition: "center" }}
              unoptimized={shouldSkipNextImageOptimization(image)}
            />
          </GenericEditableImage>
        </div>

      </div>
    </section>
  );
}

// ─── Stavba-01 About ─────────────────────────────────────────────────────────
function AboutStavba01({ content, sectionId, tenantSlug, isAdmin }: Pick<Props, "content" | "sectionId" | "tenantSlug" | "isAdmin">) {
  const ORANGE = "#FF6F0D";
  const DARK   = "#1a1a1a";
  const GRAY   = "#6b6b6b";
  const BG     = "#ffffff";
  const FONT   = "'Inter', sans-serif";

  interface Step { number: string; title: string; desc: string; }
  interface Stat { value: string; label: string; }

  const tagline = String(content.tagline ?? "Náš model spolupráce");
  const title   = String(content.title   ?? "O vaši zakázku se\nstaráme 3 odborníci");
  const body    = String(content.body    ?? "");
  const ctaText = String(content.ctaText ?? "Proč s námi?");
  const ctaHref = String(content.ctaHref ?? "/o-nas");
  const image   = String(content.image   ?? "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&h=600&fit=crop&fm=webp&q=85");
  const steps   = (content.steps as Step[]) ?? [];
  const stats   = (content.stats as Stat[]) ?? [];

  const resolve = (href: string) => resolveDemoHref(href, tenantSlug, isAdmin);

  return (
    <section id={String(content.id ?? "o-nas")} style={{ backgroundColor: BG, fontFamily: FONT, padding: "clamp(64px,9vw,112px) 0" }} data-template="stavba-01">
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 32px" }}>
        <div className="stavba-about-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "center" }}>

          {/* Left — photo + stats */}
          <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
            {/* Photo */}
            <div style={{ position: "relative", borderRadius: 16, overflow: "hidden", aspectRatio: "4/3" }}>
              <GenericEditableImage sectionId={sectionId} field="image" src={image} alt={title} className="relative overflow-hidden w-full h-full" style={{ height: "100%" }}>
                <Image src={image} alt={title} fill className="object-cover" sizes="(max-width:768px) 100vw, 50vw" unoptimized={shouldSkipNextImageOptimization(image)} />
              </GenericEditableImage>
              {/* Orange accent corner */}
              <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 4, backgroundColor: ORANGE }} />
            </div>

            {/* Stats row */}
            {stats.length > 0 && (
              <div style={{ display: "grid", gridTemplateColumns: `repeat(${stats.length}, 1fr)`, gap: 1, backgroundColor: "#e8e8e8", borderRadius: 12, overflow: "hidden" }}>
                {stats.map((s, i) => (
                  <div key={i} style={{ backgroundColor: BG, padding: "20px 16px", textAlign: "center" }}>
                    <div style={{ color: ORANGE, fontSize: "clamp(22px,3vw,32px)", fontWeight: 800, lineHeight: 1, marginBottom: 4, letterSpacing: "-0.02em" }}>
                      <GenericEditableText sectionId={sectionId} field={`stats.${i}.value`} value={s.value} tag="span" />
                    </div>
                    <div style={{ color: GRAY, fontSize: "0.78rem", fontWeight: 500, lineHeight: 1.3 }}>
                      <GenericEditableText sectionId={sectionId} field={`stats.${i}.label`} value={s.label} tag="span" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right — text + steps + CTA */}
          <div>
            {/* Tagline */}
            <p style={{ color: ORANGE, fontSize: "0.78rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", margin: "0 0 12px" }}>
              <GenericEditableText sectionId={sectionId} field="tagline" value={tagline} tag="span" />
            </p>

            {/* Title */}
            <h2 style={{ color: DARK, fontSize: "clamp(26px,3.5vw,44px)", fontWeight: 800, lineHeight: 1.1, letterSpacing: "-0.02em", margin: "0 0 20px", whiteSpace: "pre-line" }}>
              <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
            </h2>

            {/* Body */}
            {body && (
              <p style={{ color: GRAY, fontSize: "0.95rem", lineHeight: 1.75, margin: "0 0 36px" }}>
                <GenericEditableText sectionId={sectionId} field="body" value={body} tag="span" />
              </p>
            )}

            {/* Steps */}
            {steps.length > 0 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 0, marginBottom: 36 }}>
                {steps.map((step, i) => (
                  <div key={i} style={{ display: "flex", gap: 20, paddingBottom: i < steps.length - 1 ? 28 : 0, position: "relative" }}>
                    {/* Line */}
                    {i < steps.length - 1 && (
                      <div style={{ position: "absolute", left: 19, top: 40, bottom: 0, width: 2, backgroundColor: "#f0f0f0" }} />
                    )}
                    {/* Number circle */}
                    <div style={{ flexShrink: 0, width: 40, height: 40, borderRadius: "50%", backgroundColor: ORANGE, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.75rem", fontWeight: 800, letterSpacing: "0.02em", zIndex: 1 }}>
                      <GenericEditableText sectionId={sectionId} field={`steps.${i}.number`} value={step.number} tag="span" />
                    </div>
                    <div style={{ paddingTop: 8 }}>
                      <div style={{ color: DARK, fontSize: "0.95rem", fontWeight: 700, marginBottom: 4 }}>
                        <GenericEditableText sectionId={sectionId} field={`steps.${i}.title`} value={step.title} tag="span" />
                      </div>
                      <div style={{ color: GRAY, fontSize: "0.875rem", lineHeight: 1.6 }}>
                        <GenericEditableText sectionId={sectionId} field={`steps.${i}.desc`} value={step.desc} tag="span" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* CTA */}
            <a
              href={resolve(ctaHref)}
              data-btn="primary"
              style={{ display: "inline-flex", alignItems: "center", gap: 8, backgroundColor: DARK, color: "#fff", fontFamily: FONT, fontSize: "0.9rem", fontWeight: 600, padding: "13px 28px", borderRadius: 8, textDecoration: "none", transition: "background-color 0.18s, transform 0.18s" }}
              onMouseEnter={e => { e.currentTarget.style.backgroundColor = ORANGE; e.currentTarget.style.transform = "translateY(-1px)"; }}
              onMouseLeave={e => { e.currentTarget.style.backgroundColor = DARK; e.currentTarget.style.transform = "translateY(0)"; }}
            >
              <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </a>
          </div>

        </div>
      </div>

      <style>{`
        @media (max-width: 768px) { .stavba-about-grid { grid-template-columns: 1fr !important; gap: 40px !important; } }
      `}</style>
    </section>
  );
}

// ── stavba-03-about ───────────────────────────────────────────────────────────
// 1:1 baurekstav.cz: světle-šedé bg #f4f4f4, 2-col grid
// Vlevo: oranžový kicker + tmavý H2 + perex + 4× bullet (✓ oranžový + text) + oranžový CTA
// Vpravo: foto realizace (aspect 4/3, shadow)
// ─────────────────────────────────────────────────────────────────────────────
function AboutStavba03({ content, sectionId, tenantSlug, isAdmin }: Pick<Props, "content" | "sectionId" | "tenantSlug" | "isAdmin">) {
  const ORANGE = "#fa7d19";
  const DARK   = "#1b1a1a";
  const GRAY   = "#555555";
  const FONT   = "'Roboto', sans-serif";

  const kicker  = String(content.kicker   ?? "O nás");
  const heading = String(content.heading  ?? "Kompletní stavební servis na míru vašim potřebám");
  const body    = String(content.body     ?? "");
  const bullets = (content.bullets as string[]) ?? [];
  const ctaText = String(content.ctaText  ?? "Zjistit více");
  const ctaHref = String(content.ctaHref  ?? "/o-nas");
  const imageUrl = String(content.imageUrl ?? "");

  const resolve = (href: string) => resolveDemoHref(href, tenantSlug, isAdmin);

  const defaultImg = "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=900&h=675&fit=crop&fm=webp&q=85";
  const imgSrc = imageUrl || defaultImg;

  return (
    <section style={{ backgroundColor: "#f4f4f4", fontFamily: FONT, padding: "80px 0" }}>
      <div
        className="stavba03-about-grid"
        style={{ maxWidth: 1200, margin: "0 auto", padding: "0 32px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 64, alignItems: "center" }}
      >
        {/* Left: text */}
        <div>
          {/* Kicker */}
          <div style={{ color: ORANGE, fontFamily: FONT, fontSize: "0.8rem", fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", marginBottom: 14 }}>
            <GenericEditableText sectionId={sectionId} field="kicker" value={kicker} tag="span" />
          </div>

          {/* Heading */}
          <h2 style={{ fontFamily: FONT, fontWeight: 700, fontSize: "clamp(1.6rem, 2.4vw, 2.1rem)", color: DARK, lineHeight: 1.25, margin: "0 0 20px" }}>
            <GenericEditableText sectionId={sectionId} field="heading" value={heading} tag="span" />
          </h2>

          {/* Body */}
          {body && (
            <p style={{ fontFamily: FONT, fontSize: "0.95rem", color: GRAY, lineHeight: 1.75, margin: "0 0 28px" }}>
              <GenericEditableText sectionId={sectionId} field="body" value={body} tag="span" />
            </p>
          )}

          {/* Bullets */}
          {bullets.length > 0 && (
            <ul style={{ listStyle: "none", padding: 0, margin: "0 0 32px", display: "flex", flexDirection: "column", gap: 12 }}>
              {bullets.map((b, i) => (
                <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                  <span style={{ color: ORANGE, flexShrink: 0, marginTop: 2 }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  </span>
                  <span style={{ fontFamily: FONT, fontSize: "0.92rem", color: DARK, lineHeight: 1.5 }}>
                    <GenericEditableText sectionId={sectionId} field={`bullets.${i}`} value={b} tag="span" />
                  </span>
                </li>
              ))}
            </ul>
          )}

          {/* CTA */}
          <a
            href={resolve(ctaHref)}
            data-btn="primary"
            style={{ display: "inline-flex", alignItems: "center", gap: 8, backgroundColor: ORANGE, color: "#fff", fontFamily: FONT, fontSize: "0.9rem", fontWeight: 700, padding: "13px 28px", textDecoration: "none", borderRadius: 2, letterSpacing: "0.3px", transition: "opacity 0.18s" }}
            onMouseEnter={e => { e.currentTarget.style.opacity = "0.88"; }}
            onMouseLeave={e => { e.currentTarget.style.opacity = "1"; }}
          >
            <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </a>
        </div>

        {/* Right: photo */}
        <div style={{ position: "relative", aspectRatio: "4/3", borderRadius: 3, overflow: "hidden", boxShadow: "0 8px 40px rgba(0,0,0,0.13)" }}>
          <GenericEditableImage sectionId={sectionId} field="imageUrl" src={imgSrc} alt={heading} className="relative overflow-hidden w-full h-full" style={{ height: "100%" }}>
            <Image src={imgSrc} alt={heading} fill className="object-cover" sizes="(max-width: 768px) 100vw, 50vw" unoptimized={shouldSkipNextImageOptimization(imgSrc)} />
          </GenericEditableImage>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .stavba03-about-grid { grid-template-columns: 1fr !important; gap: 40px !important; }
        }
      `}</style>
    </section>
  );
}

// ── stavba-02-about ───────────────────────────────────────────────────────────
// White bg, 2-col: left = kicker + H2 + text + 4 bullet checkmarks; right = photo
// ─────────────────────────────────────────────────────────────────────────────
function AboutStavba02({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const BROWN = "#674832";
  const DARK  = "#2D1A0F";
  const MUTED = "#7A6454";
  const FONT  = "'Roboto', sans-serif";

  const sectionId2 = String(content.id      ?? "o-nas");
  const kicker     = String(content.kicker  ?? "Proč si vybrat právě nás?");
  const title      = String(content.title   ?? "Jsme tým zkušených profesionálů");
  const text       = String(content.text    ?? "");
  const image      = String(content.image   ?? "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&h=600&fit=crop&fm=webp&q=85");
  const bullets    = Array.isArray(content.bullets) ? (content.bullets as unknown[]).map(b => String(b)) : [
    "Rychlá a precizní realizace",
    "Transparentní ceny bez skrytých poplatků",
    "Osobní přístup ke každému klientovi",
    "Zkušený tým řemeslníků s praxí",
  ];

  return (
    <section id={sectionId2} style={{ backgroundColor: "#fff", fontFamily: FONT, padding: "clamp(64px, 8vw, 100px) 0" }} data-template="stavba-02">
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 32px" }}>
        <div className="s02-about-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "clamp(40px, 6vw, 80px)", alignItems: "center" }}>

          {/* Left — text */}
          <div>
            {/* Kicker */}
            <p style={{ color: BROWN, fontSize: "0.78rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", margin: "0 0 14px" }}>
              <GenericEditableText sectionId={sectionId} field="kicker" value={kicker} tag="span" />
            </p>

            {/* Title */}
            <h2 style={{ color: DARK, fontSize: "clamp(24px, 3.2vw, 40px)", fontWeight: 700, lineHeight: 1.15, letterSpacing: "-0.02em", margin: "0 0 20px" }}>
              <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
            </h2>

            {/* Body text */}
            {text && (
              <p style={{ color: MUTED, fontSize: "clamp(14px, 1.3vw, 16px)", lineHeight: 1.75, margin: "0 0 32px" }}>
                <GenericEditableText sectionId={sectionId} field="text" value={text} tag="span" />
              </p>
            )}

            {/* Bullet list */}
            <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 14 }}>
              {bullets.map((b, i) => (
                <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                  {/* Checkmark circle */}
                  <span style={{ flexShrink: 0, width: 22, height: 22, borderRadius: "50%", backgroundColor: BROWN, display: "inline-flex", alignItems: "center", justifyContent: "center", marginTop: 1 }}>
                    <svg width="11" height="11" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                      <path d="M2 6l3 3 5-5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </span>
                  <span style={{ color: DARK, fontSize: "0.92rem", lineHeight: 1.55, fontWeight: 500 }}>
                    <GenericEditableText sectionId={sectionId} field={`bullets.${i}`} value={b} tag="span" />
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Right — photo */}
          <div style={{ position: "relative", borderRadius: 14, overflow: "hidden", aspectRatio: "4/3", boxShadow: "0 10px 48px rgba(45,26,15,0.13)" }}>
            <GenericEditableImage sectionId={sectionId} field="image" src={image} alt={title} className="relative overflow-hidden w-full h-full" style={{ height: "100%" }}>
              <Image src={image} alt={title} fill className="object-cover" sizes="(max-width:768px) 100vw, 50vw" unoptimized={shouldSkipNextImageOptimization(image)} />
            </GenericEditableImage>
            {/* Brown accent bar */}
            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 4, backgroundColor: BROWN }} />
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .s02-about-grid { grid-template-columns: 1fr !important; gap: 40px !important; }
          .s02-about-grid > div:last-child { order: -1; }
        }
      `}</style>
    </section>
  );
}

// ── instala-01-about ───────────────────────────────────────────────────────────
// 1:1 instalateritopenari.cz:
// - 2 sloupce: obraz vlevo (border-radius 30px, min-height 600px) | text vpravo
// - kicker: 24px / 300 / uppercase / #222222
// - H2: 600 / capitalize / #222222
// - odstavec: 17px / #434343
// - stats: 3 hodnoty žlutě + šedý popis
// - feature boxy: #EDEDED kruhová ikona + tučný název + popis
// ─────────────────────────────────────────────────────────────────────────────
function AboutInstala01({ content, sectionId }: Pick<Props, "content" | "sectionId"> & { tenantSlug?: string; isAdmin?: boolean }) {
  const c = content as Record<string, unknown>;

  const YELLOW = "#FFC527";
  const WHITE  = "#ffffff";
  const FONT   = "'Outfit', sans-serif";

  const kicker   = String(c.kicker   ?? "Pohotovostní služby");
  const title    = String(c.title    ?? "Práce menšího rozsahu řešíme nejlépe ihned");
  const body     = String(c.body     ?? "Zakládáme si na osobním přístupu a profesionalitě. Preferujeme kvalitní materiály. Práce menšího rozsahu řešíme nejlépe ihned, ještě tentýž den od nahlášení.");
  const image    = String(c.image    ?? "/clones/instalateritopenari/wp-content/uploads/2025/05/h1-about-img-03.jpg");
  const features = (c.features as Array<{ title: string; description: string; icon: string }>) ?? [];
  const stats    = (c.stats    as Array<{ value: string; label: string }>) ?? [];

  const IconBox = ({ icon }: { icon: string }) => {
    const d: Record<string, React.ReactNode> = {
      star:     <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="#1e293b"/>,
      shield:   <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" fill="none" stroke="#1e293b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>,
      settings: <><circle cx="12" cy="12" r="3" fill="none" stroke="#1e293b" strokeWidth="2"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" fill="none" stroke="#1e293b" strokeWidth="2"/></>,
      clock:    <><circle cx="12" cy="12" r="10" fill="none" stroke="#1e293b" strokeWidth="2"/><polyline points="12 6 12 12 16 14" fill="none" stroke="#1e293b" strokeWidth="2" strokeLinecap="round"/></>,
    };
    return (
      <div style={{ width: 48, height: 48, borderRadius: "50%", backgroundColor: "#EDEDED", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          {d[icon] ?? d.star}
        </svg>
      </div>
    );
  };

  return (
    <section id="o-nas" style={{ backgroundColor: WHITE, fontFamily: FONT, padding: "80px 0" }} data-template="instala-01-about">
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 40px" }}>
        <div className="i01-about-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "60px", alignItems: "center" }}>

          {/* Left — image */}
          <div style={{ borderRadius: 30, overflow: "hidden", minHeight: 600, position: "relative" }}>
            <GenericEditableImage sectionId={sectionId} field="image" src={image} alt="O nás" className="relative overflow-hidden w-full h-full" style={{ height: "100%", minHeight: 600 }}>
              <Image src={image} alt="Instalatérské práce" fill className="object-cover" sizes="50vw" unoptimized={shouldSkipNextImageOptimization(image)} />
            </GenericEditableImage>
          </div>

          {/* Right — content */}
          <div>
            {/* Kicker */}
            <p style={{ fontSize: "24px", fontWeight: 300, textTransform: "uppercase", color: "#222222", margin: "0 0 8px", letterSpacing: "0.04em" }}>
              <GenericEditableText sectionId={sectionId} field="kicker" value={kicker} tag="span" />
            </p>

            {/* H2 */}
            <h2 style={{ fontSize: "clamp(26px,3vw,40px)", fontWeight: 600, textTransform: "capitalize", color: "#222222", lineHeight: 1.2, margin: "0 0 20px", maxWidth: 650 }}>
              <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
            </h2>

            {/* Body */}
            <p style={{ fontSize: "17px", fontWeight: 400, color: "#434343", lineHeight: 1.65, margin: "0 0 32px", maxWidth: 600 }}>
              <GenericEditableText sectionId={sectionId} field="body" value={body} tag="span" />
            </p>

            {/* Stats */}
            {stats.length > 0 && (
              <div style={{ display: "flex", gap: 32, margin: "0 0 28px", flexWrap: "wrap" }}>
                {stats.map((s, i) => (
                  <div key={i}>
                    <div style={{ fontSize: "clamp(28px,3vw,40px)", fontWeight: 700, color: YELLOW, lineHeight: 1 }}>
                      <GenericEditableText sectionId={sectionId} field={`stats.${i}.value`} value={s.value} tag="span" />
                    </div>
                    <div style={{ fontSize: "14px", color: "#64748b", marginTop: 4 }}>
                      <GenericEditableText sectionId={sectionId} field={`stats.${i}.label`} value={s.label} tag="span" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div style={{ width: "100%", height: 1, backgroundColor: "#e2e8f0", margin: "0 0 28px" }} />

            {/* Features */}
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              {features.map((f, i) => (
                <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
                  <IconBox icon={f.icon} />
                  <div>
                    <div style={{ fontSize: "18px", fontWeight: 600, color: "#222222", marginBottom: 4 }}>
                      <GenericEditableText sectionId={sectionId} field={`features.${i}.title`} value={f.title} tag="span" />
                    </div>
                    <div style={{ fontSize: "16px", color: "#222222", lineHeight: 1.5 }}>
                      <GenericEditableText sectionId={sectionId} field={`features.${i}.description`} value={f.description} tag="span" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .i01-about-grid { grid-template-columns: 1fr !important; gap: 40px !important; }
        }
      `}</style>
    </section>
  );
}

// ─── florist-01 Process / Jak objednat ──────────────────────────────────────
function ProcessFlorist01({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const title = (content.title as string) ?? "Jak objednat kytici?";
  const steps = (content.steps as Array<{ number: string; title: string; description: string }>) ?? [];

  const FONT = "'Arimo', Arial, sans-serif";

  return (
    <section style={{ backgroundColor: "#f9f9f9", padding: "72px 0", fontFamily: FONT }}>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Arimo:wght@400;500;700&display=swap" />
      <style>{`        .f01-proc-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 40px; }
        @media (max-width: 768px) { .f01-proc-grid { grid-template-columns: 1fr; gap: 32px; } }
        .f01-proc-step { display: flex; flex-direction: column; align-items: flex-start; }
        .f01-proc-number {
          font-size: 48px;
          font-weight: 700;
          color: rgba(18,18,18,0.08);
          font-family: 'Arimo', Arial, sans-serif;
          line-height: 1;
          margin-bottom: 16px;
        }
        .f01-proc-divider { width: 40px; height: 2px; background: #121212; margin-bottom: 20px; }
        .f01-proc-step-title { font-size: 17px; font-weight: 700; color: #121212; margin-bottom: 10px; font-family: 'Arimo', Arial, sans-serif; }
        .f01-proc-step-desc { font-size: 14px; color: rgba(18,18,18,0.65); line-height: 1.6; font-family: 'Arimo', Arial, sans-serif; }
        .f01-proc-section-title { font-size: 28px; font-weight: 700; color: #121212; font-family: 'Arimo', Arial, sans-serif; text-align: center; margin-bottom: 48px; }
        @media (max-width: 600px) { .f01-proc-section-title { font-size: 22px; margin-bottom: 36px; } }
      `}</style>

      <div style={{ maxWidth: 1280, margin: "0 auto", paddingLeft: 24, paddingRight: 24 }}>
        <div className="f01-proc-section-title">
          <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
        </div>

        <div className="f01-proc-grid">
          {steps.map((step, i) => (
            <div key={i} className="f01-proc-step">
              <div className="f01-proc-number">{step.number}</div>
              <div className="f01-proc-divider" />
              <div className="f01-proc-step-title">
                <GenericEditableText sectionId={sectionId} field={`steps.${i}.title`} value={step.title} tag="span" />
              </div>
              <div className="f01-proc-step-desc">
                <GenericEditableText sectionId={sectionId} field={`steps.${i}.description`} value={step.description} tag="span" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}


// ── catering-01-about ─────────────────────────────────────────────────────────
// Cream/sand bg, split: left large italic title + kicker, right two paragraphs + CTA
// ─────────────────────────────────────────────────────────────────────────────
// ── catering-01-about ─────────────────────────────────────────────────────────
// Nordic Minimal Gastro:
// - 2-col split: left Fraunces italic title + terracotta line, right Inter body + CTA
// - Stone surface bg, forest green text, terracotta accents
// - Conditional header for subpages
// ─────────────────────────────────────────────────────────────────────────────
function AboutCatering01({ content, sectionId, tenantSlug, isAdmin }: { content: Record<string, unknown>; sectionId: number; tenantSlug?: string; isAdmin: boolean }) {
  const GREEN  = "#2d4a3e";
  const TERRA  = "#c4755b";
  const WARM   = "#f8f5f0";
  const STONE  = "#e8e2d8";
  const SERIF  = "'Fraunces', Georgia, serif";
  const SANS   = "'Inter', system-ui, sans-serif";

  const kickerRaw  = content.kicker;
  const titleRaw   = content.title;
  const kicker  = kickerRaw === undefined ? "kdo stojí za Saveur & Co." : String(kickerRaw);
  const title   = titleRaw === undefined ? "Vaříme s vášní,\nservírujeme s pokorou" : String(titleRaw);
  const text    = String(content.text    ?? "");
  const text2   = String(content.text2   ?? "");
  const ctaText = String(content.ctaText ?? "Poznat tým");
  const ctaHref = String(content.ctaHref ?? "/o-nas");

  const showHeader = !!(kicker.trim() || title.trim());

  function resolveHref(href: string) {
    if (!tenantSlug || href.startsWith("http")) return href;
    const base = isAdmin ? `/demo/${tenantSlug}/admin` : `/demo/${tenantSlug}`;
    return href === "/" ? base : `${base}${href}`;
  }

  return (
    <section
      id="o-nas"
      data-template="catering-01"
      data-variant="catering-01-about"
      style={{ background: STONE, padding: "6rem 0 7rem" }}
    >
      <style>{`
        .ct1ab-wrap{max-width:1200px;margin:0 auto;padding:0 1.5rem;display:flex;flex-direction:column;gap:2.5rem}
        .ct1ab-kicker{font-family:${SANS};font-size:.65rem;font-weight:600;letter-spacing:.18em;text-transform:uppercase;color:${TERRA};display:flex;align-items:center;gap:.8rem;margin-bottom:1rem}
        .ct1ab-kicker::before{content:'';width:2rem;height:1px;background:${TERRA}}
        .ct1ab-title{font-family:${SERIF};font-weight:300;font-style:italic;font-size:clamp(1.8rem,3.5vw,2.8rem);line-height:1.15;color:${GREEN};margin:0;letter-spacing:-.01em}
        .ct1ab-line{width:3rem;height:2px;background:${TERRA};margin-top:1.5rem;opacity:.6}
        .ct1ab-right{display:flex;flex-direction:column;gap:1.2rem}
        .ct1ab-p{font-family:${SANS};font-size:.95rem;line-height:1.8;color:#555;margin:0}
        .ct1ab-cta{display:inline-flex;align-items:center;align-self:flex-start;margin-top:.8rem;background:${GREEN};color:#fff;font-family:${SANS};font-size:.72rem;font-weight:600;letter-spacing:.1em;text-transform:uppercase;text-decoration:none;padding:.75rem 2rem;border-radius:999px;transition:background .25s,transform .25s}
        .ct1ab-cta:hover{background:#1e3a30;transform:translateY(-2px)}
        @media(min-width:900px){
          .ct1ab-wrap{flex-direction:row;align-items:flex-start;gap:5%}
          .ct1ab-left{flex:0 0 42%}
          .ct1ab-right{flex:1;padding-top:.5rem}
          .ct1ab-p{font-size:1rem}
        }
      `}</style>

      <div className="ct1ab-wrap">
        {showHeader && (
          <div className="ct1ab-left">
            {kicker.trim() && (
              <div className="ct1ab-kicker">
                <GenericEditableText sectionId={sectionId} field="kicker" value={kicker} tag="span" />
              </div>
            )}
            {title.trim() && (
              <h2 className="ct1ab-title">
                <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span">
                  {title.split("\n").map((line, i) => (
                    <span key={i} style={{ display: "block" }}>{line}</span>
                  ))}
                </GenericEditableText>
              </h2>
            )}
            <div className="ct1ab-line" />
          </div>
        )}
        <div className="ct1ab-right">
          {text && (
            <p className="ct1ab-p">
              <GenericEditableText sectionId={sectionId} field="text" value={text} tag="span" />
            </p>
          )}
          {text2 && (
            <p className="ct1ab-p">
              <GenericEditableText sectionId={sectionId} field="text2" value={text2} tag="span" />
            </p>
          )}
          <a href={resolveHref(ctaHref)} data-btn="primary" className="ct1ab-cta">
            <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
          </a>
        </div>
      </div>
    </section>
  );
}

// ── bakery-02-mosaic ─────────────────────────────────────────────────────────
function MosaicBakery02({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const c = content as {
    heading?: string;
    items?: Array<{ image?: string; text?: string; linkLabel?: string; linkHref?: string }>;
  };
  const heading = c.heading ?? "Pojďte dál";
  const rawItems = Array.isArray(c.items) && c.items.length > 0 ? c.items : [
    { image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=900&q=85", text: "K čerstvému pečivu z pece si dejte dobrou kávu.", linkLabel: "NAŠE PEČIVO A KÁVA", linkHref: "/nase-pecivo" },
    { image: "https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=900&q=85", text: "Co čerstvého máme tento týden?", linkLabel: "AKTUÁLNÍ NABÍDKA", linkHref: "/aktualni-nabidka" },
    { image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=900&q=85", text: "Najdete nás na třech místech v Praze!", linkLabel: "KDE NÁS NAJDETE", linkHref: "/pobocky" },
  ];
  const items = rawItems.slice(0, 3);
  const FONT = "'Lato','Helvetica Neue',Arial,sans-serif";

  return (
    <section
      data-template="bakery-02"
      data-variant="bakery-02-mosaic"
      style={{ backgroundColor: "#f7f5f0", padding: "clamp(56px, 7vw, 104px) clamp(24px, 6vw, 72px)" }}
    >
      <style>{`
        [data-variant="bakery-02-mosaic"] .b02m-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: clamp(28px, 4vw, 48px);
          max-width: 1200px;
          margin: 0 auto;
        }
        @media (min-width: 640px) {
          [data-variant="bakery-02-mosaic"] .b02m-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }
        [data-variant="bakery-02-mosaic"] .b02m-card {
          display: flex;
          flex-direction: column;
          gap: 20px;
          text-decoration: none;
          color: inherit;
        }
        [data-variant="bakery-02-mosaic"] .b02m-photo {
          position: relative;
          overflow: hidden;
          aspect-ratio: 3 / 4;
          background: #e0ddd6;
        }
        [data-variant="bakery-02-mosaic"] .b02m-photo img {
          transition: transform 0.7s cubic-bezier(.25,.46,.45,.94);
        }
        [data-variant="bakery-02-mosaic"] .b02m-card:hover .b02m-photo img {
          transform: scale(1.05);
        }
        [data-variant="bakery-02-mosaic"] .b02m-body {
          display: flex;
          flex-direction: column;
          gap: 10px;
          padding: 0 2px;
        }
        [data-variant="bakery-02-mosaic"] .b02m-card-text {
          font-family: 'Lato','Helvetica Neue',Arial,sans-serif;
          font-size: clamp(0.88rem, 1.1vw, 1rem);
          font-weight: 300;
          color: #444;
          line-height: 1.65;
          margin: 0;
        }
        [data-variant="bakery-02-mosaic"] .b02m-cta {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-family: 'Lato','Helvetica Neue',Arial,sans-serif;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 3px;
          text-transform: uppercase;
          color: #222;
          transition: gap 0.25s;
        }
        [data-variant="bakery-02-mosaic"] .b02m-card:hover .b02m-cta { gap: 14px; }
        [data-variant="bakery-02-mosaic"] .b02m-cta-arrow {
          display: block;
          width: 28px;
          height: 1px;
          background: #222;
          position: relative;
          transition: width 0.25s;
        }
        [data-variant="bakery-02-mosaic"] .b02m-card:hover .b02m-cta-arrow { width: 40px; }
        [data-variant="bakery-02-mosaic"] .b02m-cta-arrow::after {
          content: '';
          position: absolute;
          right: 0; top: -3px;
          width: 7px; height: 7px;
          border-right: 1px solid #222;
          border-top: 1px solid #222;
          transform: rotate(45deg);
        }
      `}</style>

      {/* Heading */}
      <p style={{
        fontFamily: FONT, fontSize: "clamp(0.65rem, 1vw, 0.78rem)", fontWeight: 700,
        letterSpacing: "5px", textTransform: "uppercase", color: "#aaa",
        textAlign: "center", margin: "0 0 clamp(36px, 5vw, 64px)",
      }}>
        <GenericEditableText sectionId={sectionId} field="heading" value={heading} tag="span" />
      </p>

      <div className="b02m-grid">
        {items.map((item, i) => {
          const img = item.image ?? "";
          const text = item.text ?? "";
          const label = item.linkLabel ?? "";
          const href = item.linkHref ?? "#";
          return (
            <a href={href} className="b02m-card" key={`b02m-${i}`}>
              {/* Photo */}
              <div className="b02m-photo">
                <GenericEditableImage sectionId={sectionId} field={`items.${i}.image`} src={img} alt={text} style={{ position: "absolute", inset: 0 }}>
                  <Image
                    src={img} alt={text} fill
                    sizes="(max-width: 640px) 90vw, 33vw"
                    style={{ objectFit: "cover", objectPosition: "center" }}
                    unoptimized={shouldSkipNextImageOptimization(img)}
                  />
                </GenericEditableImage>
              </div>
              {/* Text below */}
              <div className="b02m-body">
                <p className="b02m-card-text">
                  <GenericEditableText sectionId={sectionId} field={`items.${i}.text`} value={text} tag="span" />
                </p>
                <span className="b02m-cta">
                  <GenericEditableText sectionId={sectionId} field={`items.${i}.linkLabel`} value={label} tag="span" />
                  <span className="b02m-cta-arrow" aria-hidden />
                </span>
              </div>
            </a>
          );
        })}
      </div>
    </section>
  );
}

// ─── autoskola-01 About — 2-col foto + text + stats bar ──────────────────────
function AboutAutoskola01({ content, sectionId, tenantSlug, isAdmin }: { content: Record<string, unknown>; sectionId: number; tenantSlug?: string; isAdmin?: boolean }) {
  const heading     = String(content.heading    ?? "O naší autoškole");
  const subheading  = String(content.subheading ?? "Největší autoškola pro skupinu B v ČR");
  const body        = String(content.body       ?? "");
  const body2       = String(content.body2      ?? "");
  const imageUrl    = String(content.imageUrl   ?? "/clones/nobe/img/office-620822_1920-1024x680.jpg");
  const imageAlt    = String(content.imageAlt   ?? "O nás");
  const ctaText     = String(content.ctaText    ?? "Více o nás");
  const ctaHref     = String(content.ctaHref    ?? "/o-nas");
  const statsItems  = ((content.statsItems as { value?: string; label?: string }[]) ?? []);

  const ORANGE = "#f16823";
  const DARK   = "#484848";
  const FONT   = "'Roboto', sans-serif";

  const resolve = (href: string) => (tenantSlug && !isAdmin) ? `/demo/${tenantSlug}${href}` : href;

  return (
    <section id={String(sectionId)} style={{ backgroundColor: "#fff", padding: "80px clamp(24px, 6vw, 80px)" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "clamp(32px, 5vw, 72px)", alignItems: "center" }}>

        {/* Foto vlevo */}
        <div style={{ position: "relative", borderRadius: 4, overflow: "hidden", lineHeight: 0 }}>
          <GenericEditableImage sectionId={sectionId} field="imageUrl" src={imageUrl} alt={imageAlt} style={{ display: "block", width: "100%", aspectRatio: "4/3", objectFit: "cover" }}>
            <img loading="lazy" src={imageUrl} alt={imageAlt} style={{ display: "block", width: "100%", aspectRatio: "4/3", objectFit: "cover" }} />
          </GenericEditableImage>
          {/* Oranžový akcent roh */}
          <div style={{ position: "absolute", bottom: 0, left: 0, width: 60, height: 4, backgroundColor: ORANGE }} />
        </div>

        {/* Text vpravo */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div>
            <p style={{ fontFamily: FONT, fontWeight: 400, fontSize: 13, letterSpacing: "0.14em", textTransform: "uppercase", color: ORANGE, margin: "0 0 8px" }}>
              <GenericEditableText sectionId={sectionId} field="subheading" value={subheading} tag="span" />
            </p>
            <h2 style={{ fontFamily: FONT, fontWeight: 700, fontSize: "clamp(1.6rem, 2.5vw, 2.2rem)", color: DARK, margin: 0, lineHeight: 1.2 }}>
              <GenericEditableText sectionId={sectionId} field="heading" value={heading} tag="span" />
            </h2>
          </div>

          <div style={{ width: 48, height: 3, backgroundColor: ORANGE, borderRadius: 2 }} />

          {body && (
            <p style={{ fontFamily: FONT, fontWeight: 400, fontSize: "clamp(0.9rem, 1.2vw, 1rem)", color: DARK, lineHeight: 1.75, margin: 0 }}>
              <GenericEditableText sectionId={sectionId} field="body" value={body} tag="span" />
            </p>
          )}
          {body2 && (
            <p style={{ fontFamily: FONT, fontWeight: 400, fontSize: "clamp(0.9rem, 1.2vw, 1rem)", color: "#666", lineHeight: 1.75, margin: 0 }}>
              <GenericEditableText sectionId={sectionId} field="body2" value={body2} tag="span" />
            </p>
          )}

          {/* Stats bar */}
          {statsItems.length > 0 && (
            <div style={{ display: "flex", gap: 0, borderTop: "1px solid #e8e8e8", marginTop: 8, paddingTop: 24 }}>
              {statsItems.map((item, i) => (
                <div key={i} style={{ flex: 1, textAlign: "center", borderRight: i < statsItems.length - 1 ? "1px solid #e8e8e8" : "none", padding: "0 16px" }}>
                  <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: "clamp(1.3rem, 2vw, 1.7rem)", color: ORANGE, lineHeight: 1.1 }}>
                    <GenericEditableText sectionId={sectionId} field={`statsItems.${i}.value`} value={String(item.value ?? "")} tag="span" />
                  </div>
                  <div style={{ fontFamily: FONT, fontWeight: 400, fontSize: 12, color: "#999", marginTop: 4, letterSpacing: "0.04em" }}>
                    <GenericEditableText sectionId={sectionId} field={`statsItems.${i}.label`} value={String(item.label ?? "")} tag="span" />
                  </div>
                </div>
              ))}
            </div>
          )}

          <a
            href={resolve(ctaHref)}
            data-btn="primary"
            style={{ display: "inline-block", alignSelf: "flex-start", padding: "12px 28px", backgroundColor: ORANGE, color: "#fff", fontFamily: FONT, fontSize: 14, fontWeight: 600, letterSpacing: "0.04em", textDecoration: "none", borderRadius: 4, transition: "background 0.2s" }}
            onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.backgroundColor = "#d85710"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.backgroundColor = ORANGE; }}
          >
            <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
          </a>
        </div>
      </div>

      {/* Mobile responsive */}
      <style>{`
        @media (max-width: 768px) {
          [id="${sectionId}"] > div { grid-template-columns: 1fr !important; }
          [id="${sectionId}"] > div > div:first-child { aspect-ratio: 4/3; width: 100%; }
        }
      `}</style>
    </section>
  );
}

// ─── sweet-01 About — 2-col text + image, white bg ───────────────────────────
function AboutSweet01({
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
  const kicker  = String(content.kicker  ?? "O NÁS");
  const title   = String(content.title   ?? "Sladký svět Světozoru");
  const body    = String(content.body    ?? "");
  const ctaText = String(content.ctaText ?? "Zjistit více");
  const ctaHref = String(content.ctaHref ?? "/o-nas");
  const image   = String(content.image   ?? "/clones/ovocnysvetozor/img/ochutnejte.jpg");
  const imageAlt = String(content.imageAlt ?? "");

  const RED  = "#E2001A";
  const DARK = "#0a0a0a";
  const FONT = "'Roboto','Helvetica Neue',Arial,sans-serif";

  const resolvedHref = resolveDemoHref(ctaHref, tenantSlug, isAdmin);

  return (
    <section
      data-variant="sweet-01-about"
      style={{ background: "#fefefe", padding: "80px 0", overflow: "hidden" }}
    >
      <style>{`
        .sw01-about-grid { display: grid; grid-template-columns: 1fr 1fr; max-width: 1200px; margin: 0 auto; padding: 0 24px; gap: 64px; align-items: center; }
        .sw01-about-text { display: flex; flex-direction: column; gap: 24px; }
        .sw01-about-img-wrap { position: relative; width: 100%; min-height: 380px; border-radius: 4px; overflow: hidden; }
        @media (max-width: 860px) {
          .sw01-about-grid { grid-template-columns: 1fr; gap: 40px; }
          .sw01-about-img-wrap { order: -1; }
        }
      `}</style>

      <div className="sw01-about-grid">
        {/* Text column */}
        <div className="sw01-about-text">
          <p style={{ fontFamily: FONT, fontSize: "0.75rem", fontWeight: 700, letterSpacing: "3px", color: RED, textTransform: "uppercase", margin: 0 }}>
            <GenericEditableText sectionId={sectionId} field="kicker" value={kicker} tag="span" />
          </p>
          <h2 style={{ fontFamily: FONT, fontSize: "clamp(1.8rem,3.5vw,2.8rem)", fontWeight: 700, color: DARK, margin: 0, lineHeight: 1.15 }}>
            <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
          </h2>
          {body && (
            <div style={{ fontFamily: FONT, fontSize: "1rem", color: "#444", lineHeight: 1.75, whiteSpace: "pre-line" }}>
              <GenericEditableText sectionId={sectionId} field="body" value={body} tag="span" />
            </div>
          )}
          <a
            href={resolvedHref}
            style={{
              display: "inline-block",
              padding: "12px 32px",
              background: RED,
              color: "#fff",
              fontFamily: FONT,
              fontSize: "0.875rem",
              fontWeight: 700,
              letterSpacing: "1.5px",
              textTransform: "uppercase",
              textDecoration: "none",
              alignSelf: "flex-start",
              borderRadius: 2,
            }}
          >
            <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
          </a>
        </div>

        {/* Image column */}
        <div className="sw01-about-img-wrap">
          <GenericEditableImage sectionId={sectionId} field="image" src={image} alt={imageAlt}
            style={{ position: "absolute", inset: 0 }}
          >
            <Image
              src={image}
              alt={imageAlt}
              fill
              sizes="(max-width: 860px) 100vw, 50vw"
              style={{ objectFit: "cover", objectPosition: "center" }}
              unoptimized={shouldSkipNextImageOptimization(image)}
            />
          </GenericEditableImage>
        </div>
      </div>
    </section>
  );
}

// ── kids-01-about ─────────────────────────────────────────────────────────────
// 1:1 scioles.cz: zelené bg (#2d7a4d), layout 70-30
// Vlevo: velký obrázek + tagline (světle zelená)
// Vpravo: H1 "Pro koho jsou…" + bullet list + citát
// Animace: obrázek slide-in zleva, text fade-up zprava (stagger)
// ─────────────────────────────────────────────────────────────────────────────
function AboutKids01({
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
  const GREEN      = "#2d7a4d";
  const GREEN_LIGHT = "#baeb92";
  const WHITE      = "#ffffff";
  const FONT       = "'Roboto', 'Nunito', sans-serif";

  const heading  = String(content.heading  ?? "Pro koho jsou Demo Kroužky?");
  const tagline  = String(content.tagline  ?? "Demo Kroužky jsou o překonávání překážek i sebe sama.");
  const quote    = String(content.quote    ?? "Život začíná za komfortní zónou.");
  const imageUrl = String(content.imageUrl ?? "/clones/scioles/img/scioles-intro-23.jpg");
  const imageAlt = String(content.imageAlt ?? "Děti při outdoorových aktivitách");
  const items    = (content.items as string[]) ?? [];

  void tenantSlug; void isAdmin;

  const imgRef  = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const [imgVis,  setImgVis]  = useState(false);
  const [textVis, setTextVis] = useState(false);

  useEffect(() => {
    const makeObs = (el: Element | null, set: (v: boolean) => void) => {
      if (!el) return;
      const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { set(true); obs.disconnect(); } }, { threshold: 0.1 });
      obs.observe(el);
      return obs;
    };
    const o1 = makeObs(imgRef.current,  setImgVis);
    const o2 = makeObs(textRef.current, setTextVis);
    return () => { o1?.disconnect(); o2?.disconnect(); };
  }, []);

  return (
    <section data-template="kids-01-about" style={{ background: GREEN, padding: "72px 0", fontFamily: FONT }}>
      <style>{`
        .k01about-inner{max-width:1140px;margin:0 auto;padding:0 32px;display:grid;grid-template-columns:2fr 1fr;gap:56px;align-items:start;}
        .k01about-img-wrap{overflow:hidden;border-radius:4px;}
        .k01about-img{width:100%;border-radius:4px;display:block;object-fit:cover;max-height:520px;transition:transform .5s ease,filter .5s ease;}
        .k01about-img-wrap:hover .k01about-img{transform:scale(1.04);filter:brightness(1.07);}
        .k01about-tagline{margin-top:20px;font-size:1.15rem;font-weight:600;color:${GREEN_LIGHT};line-height:1.5;}
        .k01about-heading{font-size:clamp(1.5rem,2.8vw,2rem);font-weight:700;color:${WHITE};margin:0 0 24px;}
        .k01about-list{list-style:square;padding-left:22px;margin:0 0 28px;display:flex;flex-direction:column;gap:10px;}
        .k01about-list li{color:${WHITE};font-size:1rem;line-height:1.55;transition:color .2s;}
        .k01about-list li:hover{color:${GREEN_LIGHT};}
        .k01about-quote{font-size:1.05rem;font-weight:600;color:${GREEN_LIGHT};line-height:1.55;border-left:3px solid ${GREEN_LIGHT};padding-left:14px;margin:0;transition:border-color .25s,padding-left .25s;}
        .k01about-quote:hover{border-left-color:#fff;padding-left:20px;}
        @media(max-width:768px){
          .k01about-inner{grid-template-columns:1fr;}
          .k01about-img{max-height:300px;}
        }
      `}</style>
      <div className="k01about-inner">
        {/* LEFT — image + tagline */}
        <div
          ref={imgRef}
          style={{ opacity: imgVis ? 1 : 0, transform: imgVis ? "none" : "translateX(-32px)", transition: "opacity .7s ease, transform .7s ease" }}
        >
          <div className="k01about-img-wrap">
            <GenericEditableImage sectionId={sectionId} field="imageUrl" src={imageUrl} alt={imageAlt} style={{ width: "100%", maxHeight: 520, overflow: "hidden" }}>
              <img src={imageUrl} alt={imageAlt} className="k01about-img" loading="lazy" />
            </GenericEditableImage>
          </div>
          <p className="k01about-tagline">
            <GenericEditableText sectionId={sectionId} field="tagline" value={tagline} tag="span" />
          </p>
        </div>
        {/* RIGHT — heading + bullets + quote */}
        <div
          ref={textRef}
          style={{ opacity: textVis ? 1 : 0, transform: textVis ? "none" : "translateX(24px)", transition: "opacity .7s ease .15s, transform .7s ease .15s" }}
        >
          <h2 className="k01about-heading">
            <GenericEditableText sectionId={sectionId} field="heading" value={heading} tag="span" />
          </h2>
          {items.length > 0 && (
            <ul className="k01about-list">
              {items.map((item, i) => (
                <li key={i}>
                  <GenericEditableText sectionId={sectionId} field={`items.${i}`} value={item} tag="span" />
                </li>
              ))}
            </ul>
          )}
          <p className="k01about-quote">
            <GenericEditableText sectionId={sectionId} field="quote" value={quote} tag="span" />
          </p>
        </div>
      </div>
    </section>
  );
}

// ── edu-01-about ──────────────────────────────────────────────────────────────
// Split layout: vlevo fotka se floating badge + ikony výhod,
// vpravo text (nadpis, 2 odstavce, CTA link). Navy/blue téma.
// ─────────────────────────────────────────────────────────────────────────────
function AboutEdu01({ content, sectionId, tenantSlug, isAdmin }: { content: Record<string, unknown>; sectionId: number; tenantSlug?: string; isAdmin: boolean }) {
  const NAVY = "#132339";
  const BLUE = "#0059df";
  const FONT = "'Libre Franklin', Arial, sans-serif";

  const heading    = String(content.heading    ?? "Vzdělávání, které funguje");
  const subheading = String(content.subheading ?? "Jedno dítě, jeden lektor, individuální plán");
  const body       = String(content.body       ?? "Demo Akademie stojí na jednoduché myšlence: každý student má svůj vlastní rytmus. Proto pracujeme výhradně v individuálním nebo malém skupinovém formátu.");
  const body2      = String(content.body2      ?? "Na základě vstupního testu vytvoříme personalizovaný studijní plán. Doučování probíhá prezenčně v našich učebnách nebo online.");
  const imageUrl   = String(content.imageUrl   ?? "/clones/skolapopulo/img/large_DSC_00123_42c323f1ab_1_fad7c99af9.jpeg");
  const imageAlt   = String(content.imageAlt   ?? "Lektor a student při individuálním doučování");
  const ctaText    = String(content.ctaText    ?? "Zjistit více");
  const ctaHref    = String(content.ctaHref    ?? "/o-nas");

  const resolve = (href: string) => (tenantSlug && !isAdmin) ? `/demo/${tenantSlug}${href}` : href;

  const perks = [
    { icon: "✓", label: "Vstupní diagnostický test zdarma" },
    { icon: "✓", label: "Personalizovaný studijní plán" },
    { icon: "✓", label: "Prezenčně i online — dle vaší preference" },
    { icon: "✓", label: "Průběžný reporting výsledků" },
  ];

  return (
    <>
      <style>{`
        .edu01ab{padding:100px 40px;background:#f3f6fb;font-family:${FONT};overflow:hidden;}
        .edu01ab-inner{max-width:1280px;margin:0 auto;display:grid;grid-template-columns:1fr 1fr;gap:72px;align-items:stretch;}
        /* LEFT — photo */
        .edu01ab-photo{position:relative;display:flex;flex-direction:column;}
        .edu01ab-img{flex:1;border-radius:20px;overflow:hidden;box-shadow:0 32px 80px rgba(0,0,0,0.15);min-height:480px;}
        .edu01ab-img img{width:100%;height:100%;object-fit:cover;object-position:center top;display:block;}
        .edu01ab-img>*{width:100%!important;height:100%!important;position:absolute!important;inset:0!important;}
        .edu01ab-img{position:relative;}
        /* floating experience badge */
        .edu01ab-badge{position:absolute;bottom:32px;right:-24px;background:#fff;border-radius:16px;padding:16px 22px;box-shadow:0 12px 40px rgba(0,0,0,0.12);display:flex;align-items:center;gap:14px;z-index:2;}
        .edu01ab-badge-circle{width:52px;height:52px;border-radius:50%;background:${BLUE};color:#fff;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:18px;font-weight:800;line-height:1;}
        .edu01ab-badge-text{font-size:13px;color:#6b7280;line-height:1.4;}
        .edu01ab-badge-text strong{display:block;font-size:16px;font-weight:800;color:${NAVY};}
        /* decorative dot pattern */
        .edu01ab-dots{position:absolute;top:-20px;left:-20px;width:100px;height:100px;background-image:radial-gradient(${BLUE} 1.5px,transparent 1.5px);background-size:14px 14px;opacity:0.18;border-radius:4px;pointer-events:none;z-index:0;}
        /* RIGHT — text */
        .edu01ab-content{display:flex;flex-direction:column;justify-content:center;}
        .edu01ab-eyebrow{display:inline-block;color:${BLUE};font-size:12px;font-weight:700;letter-spacing:2.5px;text-transform:uppercase;margin-bottom:12px;}
        .edu01ab-content h2{font-family:${FONT};font-size:clamp(1.8rem,3vw,2.6rem);font-weight:800;color:${NAVY};margin:0 0 8px;letter-spacing:-0.04em;line-height:1.15;}
        .edu01ab-accent{color:${BLUE};}
        .edu01ab-kicker{font-size:16px;font-weight:600;color:#374151;margin:0 0 24px;font-style:italic;}
        .edu01ab-body{font-size:15px;color:#6b7280;line-height:1.75;margin:0 0 16px;}
        /* perks list */
        .edu01ab-perks{list-style:none;margin:24px 0 32px;padding:0;display:flex;flex-direction:column;gap:10px;}
        .edu01ab-perk{display:flex;align-items:center;gap:12px;font-size:14px;color:#374151;font-weight:500;}
        .edu01ab-perk-icon{width:22px;height:22px;border-radius:50%;background:rgba(0,89,223,0.1);color:${BLUE};display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:800;flex-shrink:0;}
        /* CTA */
        .edu01ab-cta{display:inline-flex;align-items:center;gap:8px;padding:13px 32px;background:${NAVY};color:#fff;font-family:${FONT};font-size:15px;font-weight:700;border-radius:62px;text-decoration:none;transition:background 0.15s,transform 0.15s;}
        .edu01ab-cta:hover{background:${BLUE};transform:translateY(-2px);}
        @media(max-width:900px){
          .edu01ab-inner{grid-template-columns:1fr;gap:48px;}
          .edu01ab-photo{max-width:480px;margin:0 auto;}
          .edu01ab-badge{right:0;}
          .edu01ab{padding:72px 24px;}
        }
      `}</style>

      <section id={String(sectionId)} className="edu01ab" data-template="edu-01-about">
        <div className="edu01ab-inner">
          {/* LEFT — photo */}
          <div className="edu01ab-photo">
            <span className="edu01ab-dots" aria-hidden="true" />
            <div className="edu01ab-img">
              <GenericEditableImage sectionId={sectionId} field="imageUrl" src={imageUrl} alt={imageAlt}>
                <img src={imageUrl} alt={imageAlt} loading="lazy" />
              </GenericEditableImage>
            </div>
            <div className="edu01ab-badge" aria-hidden="true">
              <div className="edu01ab-badge-circle">10+</div>
              <div className="edu01ab-badge-text">
                <strong>let zkušeností</strong>
                ve vzdělávání
              </div>
            </div>
          </div>

          {/* RIGHT — content */}
          <div className="edu01ab-content">
            <span className="edu01ab-eyebrow">O nás</span>
            <h2>
              <GenericEditableText sectionId={sectionId} field="heading" value={heading} tag="span" />
            </h2>
            <p className="edu01ab-kicker">
              <GenericEditableText sectionId={sectionId} field="subheading" value={subheading} tag="span" />
            </p>
            <p className="edu01ab-body">
              <GenericEditableText sectionId={sectionId} field="body" value={body} tag="span" />
            </p>
            <p className="edu01ab-body">
              <GenericEditableText sectionId={sectionId} field="body2" value={body2} tag="span" />
            </p>

            <ul className="edu01ab-perks">
              {perks.map((p, i) => (
                <li key={i} className="edu01ab-perk">
                  <span className="edu01ab-perk-icon">{p.icon}</span>
                  {p.label}
                </li>
              ))}
            </ul>

            <a href={resolve(ctaHref)} data-btn="primary" className="edu01ab-cta">
              <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
            </a>
          </div>
        </div>
      </section>
    </>
  );
}

// ── vet-01-about ──────────────────────────────────────────────────────────────
// Surface #DCE9EE bg, 2-col: text+features vlevo / foto vpravo
// Forum H2, Roboto Condensed body, teal #286C7E checklisty + CTA
// ─────────────────────────────────────────────────────────────────────────────
function AboutVet01({
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
  const kicker   = String(content.kicker   ?? "O nás");
  const heading  = String(content.heading  ?? "Naše klinika");
  const body     = String(content.body     ?? "");
  const imageUrl = String(content.imageUrl ?? "/clones/veterinafenix/img/dog.jpg");
  const ctaText  = String(content.ctaText  ?? "Více o nás");
  const ctaHref  = String(content.ctaHref  ?? "#kontakt");
  const features = (content.features as string[]) ?? [];

  const TEAL   = "#286C7E";
  const TEAL_L = "#42aaba";
  const SURF   = "#DCE9EE";
  const DARK   = "#1a2c33";
  const FONT_H = "'Forum', 'Georgia', serif";
  const FONT_B = "'Roboto Condensed', 'Roboto', sans-serif";

  const resolve = (href: string) =>
    tenantSlug && !isAdmin ? `/demo/${tenantSlug}${href}` : href;

  return (
    <section
      id={String(sectionId)}
      data-variant="vet-01-about"
      style={{ background: SURF, padding: "clamp(56px,7vw,96px) clamp(20px,5vw,40px)" }}
    >
      <style>{`
        .v01ab-inner { display: grid; grid-template-columns: 1fr 1fr; gap: clamp(40px,6vw,80px); max-width: 1140px; margin: 0 auto; align-items: center; }
        .v01ab-features { list-style: none; margin: 24px 0; padding: 0; display: flex; flex-direction: column; gap: 10px; }
        .v01ab-feature  { display: flex; align-items: flex-start; gap: 10px; font-family: ${FONT_B}; font-size: 15px; color: ${DARK}; line-height: 1.4; }
        .v01ab-check    { width: 20px; height: 20px; border-radius: 50%; background: ${TEAL}; color: #fff; display: flex; align-items: center; justify-content: center; flex-shrink: 0; margin-top: 1px; }
        .v01ab-img-wrap { position: relative; width: 100%; border-radius: 4px; overflow: hidden; line-height: 0; }
        .v01ab-img-wrap img { display: block; width: 100%; aspect-ratio: 4/3; object-fit: cover; }
        .v01ab-cta {
          display: inline-block; padding: 12px 32px; background: ${TEAL}; color: #fff;
          font-family: ${FONT_B}; font-size: 15px; font-weight: 700; letter-spacing: 0.04em;
          text-decoration: none; border-radius: 3px; margin-top: 8px; transition: background 0.2s;
        }
        .v01ab-cta:hover { background: ${TEAL_L}; }
        @media (max-width: 820px) {
          .v01ab-inner { grid-template-columns: 1fr; gap: 40px; }
          .v01ab-img-wrap { order: -1; }
        }
      `}</style>

      <div className="v01ab-inner">
        {/* Text column */}
        <div>
          <p style={{ fontFamily: FONT_B, fontWeight: 700, fontSize: 12, letterSpacing: "0.18em", textTransform: "uppercase", color: TEAL_L, margin: "0 0 10px" }}>
            <GenericEditableText sectionId={sectionId} field="kicker" value={kicker} tag="span" />
          </p>
          <h2 style={{ fontFamily: FONT_H, fontWeight: 400, fontSize: "clamp(1.9rem,3vw,2.6rem)", color: DARK, margin: "0 0 20px", lineHeight: 1.2 }}>
            <GenericEditableText sectionId={sectionId} field="heading" value={heading} tag="span" />
          </h2>
          {body && (
            <p style={{ fontFamily: FONT_B, fontSize: 16, color: "#3a5560", lineHeight: 1.75, margin: "0 0 4px" }}>
              <GenericEditableText sectionId={sectionId} field="body" value={body} tag="span" />
            </p>
          )}

          {features.length > 0 && (
            <ul className="v01ab-features">
              {features.map((feat, i) => (
                <li key={i} className="v01ab-feature">
                  <span className="v01ab-check" aria-hidden="true">
                    <svg width="11" height="11" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </span>
                  <GenericEditableText sectionId={sectionId} field={`features.${i}`} value={feat} tag="span" />
                </li>
              ))}
            </ul>
          )}

          <a href={resolve(ctaHref)} data-btn="primary" className="v01ab-cta">
            <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
          </a>
        </div>

        {/* Image column */}
        <div className="v01ab-img-wrap">
          <GenericEditableImage sectionId={sectionId} field="imageUrl" src={imageUrl} alt={heading}>
            <img src={imageUrl} alt={heading} loading="lazy" />
          </GenericEditableImage>
        </div>
      </div>
    </section>
  );
}

// ── grooming-01-about ─────────────────────────────────────────────────────────
// Čisté edge-to-edge 2-sloupcové rozložení:
// - Vlevo (38%): tmavý #101417 plná výška, about_bg.jpg fullcover, adresa bílým textem dole
// - Vpravo (62%): bílé bg, kicker + H2 + lead + body + badge; 2 foto thumbnaily dole
// ─────────────────────────────────────────────────────────────────────────────
function AboutGrooming01({ content, sectionId, tenantSlug: _t, isAdmin: _a }: { content: Record<string, unknown>; sectionId: number; tenantSlug?: string; isAdmin: boolean }) {
  const GOLD = "#d0aa57";
  const DARK = "#101417";
  const FONT = "'Hanken Grotesk', 'Inter', sans-serif";

  type ImgItem = { url?: string; alt?: string };
  const images = ((content.images as ImgItem[]) ?? []).filter(i => i.url);

  const heading   = String(content.heading   ?? "O nás");
  const kicker    = String(content.kicker    ?? "Kdo jsme");
  const body      = String(content.body      ?? "");
  const bodyExtra = String(content.bodyExtra ?? "");
  const badge     = String(content.badge     ?? "");
  const bgImage   = String(content.bgImage   ?? "/clones/cutedogs/img/about_bg.jpg");
  const addrObj   = (content.address as Record<string, string>) ?? {};
  const street    = String(addrObj.street ?? "");
  const city      = String(addrObj.city   ?? "");

  return (
    <section id="salon" data-template="grooming-01-about" style={{ fontFamily: FONT }}>
      <style>{`
        .gr01ab-wrap{display:flex;min-height:640px;}
        /* Left — dark photo column */
        .gr01ab-left{flex:0 0 38%;position:relative;overflow:hidden;background:${DARK};}
        .gr01ab-left-bg{position:absolute;inset:0;background-size:cover;background-position:center top;}
        .gr01ab-left-bg::after{content:'';position:absolute;inset:0;background:linear-gradient(to bottom,rgba(16,20,23,0.45) 0%,rgba(16,20,23,0.75) 60%,rgba(16,20,23,0.95) 100%);}
        .gr01ab-left-content{position:relative;z-index:1;height:100%;display:flex;flex-direction:column;justify-content:flex-end;padding:56px 48px;}
        .gr01ab-left h3{color:rgba(255,255,255,0.55);font-size:12px;font-weight:600;letter-spacing:3px;text-transform:uppercase;margin:0 0 10px;}
        .gr01ab-left p{color:#fff;font-size:18px;font-weight:500;line-height:1.5;margin:0;}
        /* Right — white content column */
        .gr01ab-right{flex:1;background:#fff;display:flex;flex-direction:column;justify-content:center;padding:80px 72px 64px;}
        .gr01ab-kicker{font-size:12px;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:${GOLD};margin:0 0 14px;}
        .gr01ab-h2{font-size:clamp(32px,3.5vw,50px);font-weight:700;color:${DARK};margin:0 0 28px;line-height:1.05;}
        .gr01ab-lead{font-size:18px;font-weight:500;color:${DARK};line-height:1.65;margin:0 0 20px;}
        .gr01ab-body{font-size:16px;color:#555;line-height:1.75;margin:0 0 0;}
        .gr01ab-badge{display:flex;align-items:center;gap:12px;border-top:1px solid #eee;padding-top:24px;margin-top:32px;color:${DARK};font-weight:600;font-size:15px;}
        .gr01ab-badge-icon{color:${GOLD};font-size:20px;flex-shrink:0;}
        /* Photo thumbnails row */
        .gr01ab-thumbs{display:flex;gap:12px;margin-top:36px;}
        .gr01ab-thumb{flex:1;height:160px;background-size:cover;background-position:center;border-radius:4px;overflow:hidden;position:relative;}
        .gr01ab-thumb-label{position:absolute;bottom:0;left:0;right:0;padding:8px 12px;background:linear-gradient(transparent,rgba(0,0,0,0.55));color:#fff;font-size:11px;font-weight:600;letter-spacing:1.2px;text-transform:uppercase;}
        @media(max-width:900px){
          .gr01ab-wrap{flex-direction:column;}
          .gr01ab-left{min-height:320px;flex:none;}
          .gr01ab-left-content{padding:40px 32px;}
          .gr01ab-right{padding:56px 32px 48px;}
          .gr01ab-thumbs{gap:8px;}
          .gr01ab-thumb{height:120px;}
        }
      `}</style>

      <div className="gr01ab-wrap">
        {/* Left — foto + adresa */}
        <div className="gr01ab-left">
          <GenericEditableImage
            sectionId={sectionId}
            field="bgImage"
            src={bgImage}
            style={{ position: "absolute", inset: 0 }}
          >
            <div className="gr01ab-left-bg" style={{ backgroundImage: `url(${bgImage})` }} aria-hidden="true" />
          </GenericEditableImage>
          <div className="gr01ab-left-content">
            <h3>Pobočka</h3>
            <p>
              <GenericEditableText sectionId={sectionId} field="address.street" value={street} tag="span" />
              {street && city && <><br /></>}
              <GenericEditableText sectionId={sectionId} field="address.city" value={city} tag="span" />
            </p>
          </div>
        </div>

        {/* Right — text */}
        <div className="gr01ab-right">
          <p className="gr01ab-kicker">
            <GenericEditableText sectionId={sectionId} field="kicker" value={kicker} tag="span" />
          </p>
          <h2 className="gr01ab-h2">
            <GenericEditableText sectionId={sectionId} field="heading" value={heading} tag="span" />
          </h2>
          <p className="gr01ab-lead">
            <GenericEditableText sectionId={sectionId} field="body" value={body} tag="span" />
          </p>
          {bodyExtra && (
            <p className="gr01ab-body">
              <GenericEditableText sectionId={sectionId} field="bodyExtra" value={bodyExtra} tag="span" />
            </p>
          )}
          {badge && (
            <div className="gr01ab-badge">
              <span className="gr01ab-badge-icon">✂</span>
              <GenericEditableText sectionId={sectionId} field="badge" value={badge} tag="span" />
            </div>
          )}
          {images.length > 0 && (
            <div className="gr01ab-thumbs">
              {images.map((img, i) => (
                <GenericEditableImage
                  key={i}
                  sectionId={sectionId}
                  field={`images.${i}.url`}
                  src={img.url ?? ""}
                  style={{ flex: 1, height: 160, borderRadius: 4, overflow: "hidden" }}
                >
                  <div
                    style={{ width: "100%", height: "100%", backgroundImage: `url(${img.url})`, backgroundSize: "cover", backgroundPosition: "center", position: "relative" }}
                    role="img"
                    aria-label={img.alt ?? ""}
                  >
                    <div className="gr01ab-thumb-label">0{i + 1} Grooming v akci</div>
                  </div>
                </GenericEditableImage>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}


// ── pethotel-01-about ─────────────────────────────────────────────────────────
// Cream bg, 2-col layout: left = dark decorative panel with big paw SVG,
// right = H2 + body + CTA. Below: 4 stats in a row.
// Anchor id from content.id (default "o-nas").
// ─────────────────────────────────────────────────────────────────────────────
function AboutPethotel01({
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
  const id       = String(content.id      ?? "o-nas");
  const heading  = String(content.heading ?? "I my jsme pejskaři!");
  const body     = String(content.body    ?? "");
  const ctaText  = String(content.ctaText ?? "Poznejte nás lépe!");
  const ctaHref  = String(content.ctaHref ?? "/kontakt");
  const stats    = (content.stats as Array<{ value: string; label: string }>) ?? [];

  const BROWN = "#712419";
  const RED   = "#D6123D";
  const CREAM = "#fff5ee";
  const BEIGE = "#EEDEC3";
  const FONT  = "'Quicksand', Arial, sans-serif";

  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } }, { threshold: 0.15 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const BigPawSvg = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 120 120" aria-hidden="true" style={{ opacity: 0.18 }}>
      <circle cx="36" cy="26" r="12" fill="#fff"/>
      <circle cx="60" cy="16" r="12" fill="#fff"/>
      <circle cx="84" cy="26" r="12" fill="#fff"/>
      <ellipse cx="60" cy="68" rx="26" ry="22" fill="#fff"/>
      <circle cx="46" cy="88" r="10" fill="#fff"/>
      <circle cx="74" cy="88" r="10" fill="#fff"/>
    </svg>
  );

  const SmallPawSvg = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 120 120" aria-hidden="true" style={{ opacity: 0.22, flexShrink: 0 }}>
      <circle cx="36" cy="26" r="12" fill={BROWN}/>
      <circle cx="60" cy="16" r="12" fill={BROWN}/>
      <circle cx="84" cy="26" r="12" fill={BROWN}/>
      <ellipse cx="60" cy="68" rx="26" ry="22" fill={BROWN}/>
      <circle cx="46" cy="88" r="10" fill={BROWN}/>
      <circle cx="74" cy="88" r="10" fill={BROWN}/>
    </svg>
  );

  return (
    <>
      <style>{`
        .ph01ab { background: ${CREAM}; padding: 110px 0 0; font-family: ${FONT}; }
        .ph01ab-inner { max-width: 1100px; margin: 0 auto; padding: 0 32px; }

        /* 2-col */
        .ph01ab-cols { display: grid; grid-template-columns: 1fr 1fr; gap: 60px; align-items: center; }
        @media(max-width:720px){ .ph01ab-cols { grid-template-columns:1fr; gap:40px; } }

        /* Left decorative panel */
        .ph01ab-deco {
          background: ${BROWN}; border-radius: 12px;
          aspect-ratio: 1/1; max-width: 440px; width: 100%;
          display: flex; align-items: center; justify-content: center;
          position: relative; overflow: hidden;
          opacity: 0; transform: translateX(-30px);
          transition: opacity 0.7s ease, transform 0.7s ease;
        }
        .ph01ab-deco.ph01ab-vis { opacity: 1; transform: translateX(0); }

        /* Corner paw decorations */
        .ph01ab-deco-paw {
          position: absolute; opacity: 0.12;
        }
        .ph01ab-deco-paw-tl { top: 16px; left: 16px; }
        .ph01ab-deco-paw-br { bottom: 16px; right: 16px; transform: rotate(180deg); }

        /* Right text */
        .ph01ab-text {
          opacity: 0; transform: translateX(30px);
          transition: opacity 0.7s ease 0.15s, transform 0.7s ease 0.15s;
        }
        .ph01ab-text.ph01ab-vis { opacity: 1; transform: translateX(0); }
        .ph01ab-label { font-size: 12px; font-weight: 700; letter-spacing: 0.2em; text-transform: uppercase; color: ${RED}; margin: 0 0 16px; display: flex; align-items: center; gap: 10px; }
        .ph01ab-h2 { color: ${BROWN}; font-size: clamp(28px,3.5vw,46px); font-weight: 800; margin: 0 0 24px; line-height: 1.15; font-family: ${FONT}; }
        .ph01ab-body { color: #7a4530; font-size: clamp(15px,1.6vw,18px); font-weight: 500; line-height: 1.7; margin: 0 0 36px; }
        .ph01ab-cta {
          display: inline-block; padding: 15px 40px; background: ${RED}; color: #fff;
          font-family: ${FONT}; font-size: 16px; font-weight: 700;
          text-decoration: none; border-radius: 4px; border: 2px solid ${RED};
          transition: background 0.25s, border-color 0.25s, transform 0.2s;
        }
        .ph01ab-cta:hover { background: #b80d32; border-color: #b80d32; transform: translateY(-2px); }

        /* Stats strip */
        .ph01ab-stats {
          display: grid; grid-template-columns: repeat(4, 1fr); gap: 0;
          background: ${BEIGE}; margin-top: 80px; border-radius: 0;
        }
        @media(max-width:600px){ .ph01ab-stats { grid-template-columns: repeat(2,1fr); } }
        .ph01ab-stat {
          text-align: center; padding: 48px 24px;
          border-right: 1px solid rgba(113,36,25,0.12);
        }
        .ph01ab-stat:last-child { border-right: none; }
        .ph01ab-stat-val { display: block; font-size: clamp(28px,3.5vw,46px); font-weight: 800; color: ${RED}; font-family: ${FONT}; line-height: 1; margin-bottom: 10px; }
        .ph01ab-stat-lbl { display: block; font-size: 14px; font-weight: 600; color: ${BROWN}; text-transform: uppercase; letter-spacing: 0.08em; }
      `}</style>

      <section id={id} className="ph01ab" data-template="pethotel-01-about" ref={ref}>
        <div className="ph01ab-inner">

          <div className="ph01ab-cols">
            {/* Left: decorative dark panel with big paw */}
            <div className={`ph01ab-deco${visible ? " ph01ab-vis" : ""}`}>
              <div className="ph01ab-deco-paw ph01ab-deco-paw-tl"><BigPawSvg /></div>
              <div className="ph01ab-deco-paw ph01ab-deco-paw-br"><BigPawSvg /></div>
              <BigPawSvg />
            </div>

            {/* Right: text */}
            <div className={`ph01ab-text${visible ? " ph01ab-vis" : ""}`}>
              <p className="ph01ab-label">
                <SmallPawSvg />
                O nás
              </p>
              <h2 className="ph01ab-h2">
                <GenericEditableText sectionId={sectionId} field="heading" value={heading} tag="span" />
              </h2>
              <p className="ph01ab-body">
                <GenericEditableText sectionId={sectionId} field="body" value={body} tag="span" />
              </p>
              <a
                href={resolveDemoHref(ctaHref, tenantSlug, isAdmin)}
                data-btn="primary"
                className="ph01ab-cta"
              >
                <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
              </a>
            </div>
          </div>

          {/* Stats strip */}
          {stats.length > 0 && (
            <div className="ph01ab-stats">
              {stats.map((s, i) => (
                <div key={i} className="ph01ab-stat">
                  <strong className="ph01ab-stat-val">
                    <GenericEditableText sectionId={sectionId} field={`stats.${i}.value`} value={s.value} tag="span" />
                  </strong>
                  <span className="ph01ab-stat-lbl">
                    <GenericEditableText sectionId={sectionId} field={`stats.${i}.label`} value={s.label} tag="span" />
                  </span>
                </div>
              ))}
            </div>
          )}

        </div>
      </section>
    </>
  );
}

// ── ucetni-02-about ───────────────────────────────────────────────────────────
// grantex.cz style: very light surface bg, photo LEFT + text RIGHT
// - Floating gold badge on photo corner
// - Green kicker subtitle, bold dark H2, lead + body, gold CTA
// ─────────────────────────────────────────────────────────────────────────────
function AboutUcetni02({ content, sectionId, tenantSlug, isAdmin }: { content: Record<string, unknown>; sectionId: number; tenantSlug?: string; isAdmin: boolean }) {
  const GREEN  = "#004835";
  const GOLD   = "#bca160";
  const FONT_H = "'Montserrat', 'Helvetica Neue', Arial, sans-serif";
  const FONT_B = "'Open Sans', Arial, sans-serif";

  const title      = String(content.title      ?? "Již více než 10 let");
  const subtitle   = String(content.subtitle   ?? "Váš spolehlivý partner v oblasti daní a účetnictví");
  const lead       = String(content.lead       ?? "Jsme tým zkušených daňových poradců a účetních, kteří pomáhají podnikatelům a firmám po celé České republice.");
  const body       = String(content.body       ?? "Rozšiřujeme neustále portfolio služeb o poradenství v oblasti daní, účetnictví, práva, auditu a pojištění.");
  const ctaText    = String(content.ctaText    ?? "Více o nás");
  const ctaHref    = String(content.ctaHref    ?? "/o-nas");
  const imageUrl   = String(content.imageUrl   ?? "");
  const badgeValue = String(content.badgeValue ?? "10+");
  const badgeLabel = String(content.badgeLabel ?? "let zkušeností");
  const checks     = (content.checks as string[]) ?? [
    "Daňové poradenství a optimalizace",
    "Vedení účetnictví a mezd",
    "Audit, právo a pojištění",
  ];

  const resolvedHref = resolveDemoHref(ctaHref, tenantSlug, isAdmin);

  return (
    <>
      <style>{`
        .ucn02about-section {
          background: #f4f7f5;
          padding: 88px 24px;
          font-family: ${FONT_B};
        }
        .ucn02about-inner {
          max-width: 1200px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 72px;
          align-items: center;
        }
        /* Photo side */
        .ucn02about-img-wrap {
          position: relative;
          border-radius: 12px;
          overflow: hidden;
          aspect-ratio: 4/3;
          background: #d8e8e3;
          flex-shrink: 0;
        }
        .ucn02about-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }
        .ucn02about-badge {
          position: absolute;
          bottom: 24px;
          right: 24px;
          background: ${GREEN};
          color: #fff;
          font-family: ${FONT_H};
          font-size: 0.82rem;
          font-weight: 600;
          padding: 12px 18px;
          border-radius: 8px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2px;
          text-align: center;
          box-shadow: 0 8px 24px rgba(0,72,53,0.3);
        }
        .ucn02about-badge-num {
          font-size: 1.5rem;
          font-weight: 700;
          color: ${GOLD};
          line-height: 1;
        }
        /* Text side */
        .ucn02about-kicker {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          font-family: ${FONT_H};
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 2.5px;
          text-transform: uppercase;
          color: ${GOLD};
          margin-bottom: 18px;
        }
        .ucn02about-kicker-bar {
          display: inline-block;
          width: 28px;
          height: 2px;
          background: ${GOLD};
        }
        .ucn02about-h2 {
          font-family: ${FONT_H};
          font-size: clamp(1.8rem, 2.8vw, 2.6rem);
          font-weight: 700;
          color: ${GREEN};
          line-height: 1.15;
          margin: 0 0 24px 0;
        }
        .ucn02about-lead {
          font-size: 1.05rem;
          font-weight: 600;
          color: #2d3d38;
          line-height: 1.7;
          margin: 0 0 16px 0;
        }
        .ucn02about-body {
          font-size: 0.95rem;
          color: #5a6b66;
          line-height: 1.8;
          margin: 0 0 36px 0;
        }
        .ucn02about-cta {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 14px 28px;
          background: ${GOLD};
          color: #fff;
          font-family: ${FONT_H};
          font-size: 0.875rem;
          font-weight: 600;
          letter-spacing: 0.5px;
          text-decoration: none;
          border-radius: 4px;
          text-transform: uppercase;
          transition: background 0.2s, transform 0.15s;
        }
        .ucn02about-cta:hover { background: #a9904d; transform: translateY(-1px); }
        /* Checkmarks */
        .ucn02about-checks {
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin-bottom: 36px;
        }
        .ucn02about-check {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          font-size: 0.92rem;
          color: #2d3d38;
          line-height: 1.5;
        }
        .ucn02about-check-icon {
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: ${GREEN};
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          margin-top: 2px;
        }
        @media (max-width: 900px) {
          .ucn02about-inner { grid-template-columns: 1fr; gap: 40px; }
          .ucn02about-section { padding: 56px 20px; }
        }
      `}</style>

      <section className="ucn02about-section" data-template="ucetni-02-about">
        <div className="ucn02about-inner">
          {/* Left: photo */}
          <div className="ucn02about-img-wrap">
            {imageUrl ? (
              <img src={imageUrl} alt="" className="ucn02about-img" loading="lazy" />
            ) : (
              <div style={{ width: "100%", height: "100%", background: "#d8e8e3", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke={GREEN} strokeWidth="1.5" aria-hidden="true">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                </svg>
              </div>
            )}
            <div className="ucn02about-badge">
              <span className="ucn02about-badge-num">
                <GenericEditableText sectionId={sectionId} field="badgeValue" value={badgeValue} tag="span" />
              </span>
              <span>
                <GenericEditableText sectionId={sectionId} field="badgeLabel" value={badgeLabel} tag="span" />
              </span>
            </div>
          </div>

          {/* Right: text */}
          <div>
            <div className="ucn02about-kicker">
              <span className="ucn02about-kicker-bar" aria-hidden />
              <GenericEditableText sectionId={sectionId} field="subtitle" value={subtitle} tag="span" />
            </div>
            <h2 className="ucn02about-h2">
              <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
            </h2>
            <p className="ucn02about-lead">
              <GenericEditableText sectionId={sectionId} field="lead" value={lead} tag="span" />
            </p>
            <div className="ucn02about-checks">
              {checks.map((txt, i) => (
                <div key={i} className="ucn02about-check">
                  <span className="ucn02about-check-icon" aria-hidden="true">
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                      <path d="M2 5l2.5 2.5L8 3" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </span>
                  <GenericEditableText sectionId={sectionId} field={`checks.${i}`} value={txt} tag="span" />
                </div>
              ))}
            </div>
            <p className="ucn02about-body">
              <GenericEditableText sectionId={sectionId} field="body" value={body} tag="span" />
            </p>
            <a href={resolvedHref} className="ucn02about-cta">
              <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M3 8h10M9 4l4 4-4 4" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </a>
          </div>
        </div>
      </section>
    </>
  );
}

// ── ucetni-03-about ───────────────────────────────────────────────────────────
// gpf.cz style: white bg, 2-col 50/50
// Left: green kicker + dark H2 + lead bold + body text + green CTA
// Right: photo cover border-radius 12px
// ─────────────────────────────────────────────────────────────────────────────
function AboutUcetni03({ content, sectionId, tenantSlug, isAdmin }: { content: Record<string, unknown>; sectionId: number; tenantSlug?: string; isAdmin: boolean }) {
  const DARK   = "#002000";
  const GREEN  = "#8ec63f";
  const FONT_H = "'Montserrat', 'Helvetica Neue', Arial, sans-serif";
  const FONT_B = "'Open Sans', 'Helvetica Neue', Arial, sans-serif";

  const title    = String(content.title    ?? "Jsme tým sehraných profesionálů");
  const subtitle = String(content.subtitle ?? "Rádi vám poradíme zdarma");
  const lead     = String(content.lead     ?? "Demo Hypoteční Poradce je největší hypoteční zprostředkovatel v České republice s více než 20 lety zkušeností na trhu.");
  const body     = String(content.body     ?? "Naši poradci vám bezplatně pomohou vybrat nejvýhodnější hypotéku, připravit všechnu potřebnou dokumentaci a vyjednat nejlepší podmínky s bankami.");
  const ctaText  = String(content.ctaText  ?? "Více o nás");
  const ctaHref  = String(content.ctaHref  ?? "/o-nas");
  const imageUrl = String(content.imageUrl ?? "");

  const resolvedHref = resolveDemoHref(ctaHref, tenantSlug, isAdmin);

  return (
    <>
      <style>{`
        .ucn03about-section {
          background: #ffffff;
          padding: 88px 40px;
          font-family: ${FONT_B};
        }
        .ucn03about-inner {
          max-width: 1200px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 72px;
          align-items: center;
        }
        .ucn03about-kicker {
          display: inline-block;
          font-size: 0.78rem;
          font-weight: 700;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          color: ${GREEN};
          margin-bottom: 12px;
        }
        .ucn03about-h2 {
          font-family: ${FONT_H};
          font-size: clamp(1.7rem, 2.8vw, 2.4rem);
          font-weight: 800;
          color: ${DARK};
          line-height: 1.15;
          margin: 0 0 24px 0;
        }
        .ucn03about-lead {
          font-size: 1.05rem;
          font-weight: 600;
          color: #3c3d3d;
          line-height: 1.65;
          margin: 0 0 16px 0;
        }
        .ucn03about-body {
          font-size: 0.95rem;
          color: #737b79;
          line-height: 1.75;
          margin: 0 0 36px 0;
        }
        .ucn03about-cta {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 14px 28px;
          background: ${GREEN};
          color: ${DARK};
          font-family: ${FONT_H};
          font-size: 0.92rem;
          font-weight: 700;
          text-decoration: none;
          border-radius: 6px;
          transition: background 0.2s, transform 0.15s;
        }
        .ucn03about-cta:hover { background: #9dd44a; transform: translateY(-1px); }
        .ucn03about-img-wrap {
          position: relative;
          border-radius: 12px;
          overflow: hidden;
          aspect-ratio: 4/3;
          background: #f0f7e6;
        }
        .ucn03about-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }
        .ucn03about-img-badge {
          position: absolute;
          bottom: 24px;
          left: 24px;
          background: ${DARK};
          color: #fff;
          font-family: ${FONT_H};
          font-size: 0.82rem;
          font-weight: 600;
          padding: 10px 16px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .ucn03about-img-badge-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: ${GREEN};
          flex-shrink: 0;
        }
        @media (max-width: 900px) {
          .ucn03about-inner { grid-template-columns: 1fr; gap: 40px; }
          .ucn03about-section { padding: 64px 20px; }
        }
      `}</style>

      <section className="ucn03about-section" data-template="ucetni-03-about">
        <div className="ucn03about-inner">
          {/* Left: text */}
          <div>
            <span className="ucn03about-kicker">
              <GenericEditableText sectionId={sectionId} field="subtitle" value={subtitle} tag="span" />
            </span>
            <h2 className="ucn03about-h2">
              <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
            </h2>
            <p className="ucn03about-lead">
              <GenericEditableText sectionId={sectionId} field="lead" value={lead} tag="span" />
            </p>
            <p className="ucn03about-body">
              <GenericEditableText sectionId={sectionId} field="body" value={body} tag="span" />
            </p>
            <a href={resolvedHref} className="ucn03about-cta">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
            </a>
          </div>

          {/* Right: photo */}
          <div className="ucn03about-img-wrap">
            {imageUrl ? (
              <img src={imageUrl} alt="" className="ucn03about-img" loading="lazy" />
            ) : (
              <div style={{ width: "100%", height: "100%", background: "linear-gradient(135deg, #e8f4d4 0%, #c8e89a 100%)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke={GREEN} strokeWidth="1.5" aria-hidden="true"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              </div>
            )}
            <div className="ucn03about-img-badge">
              <span className="ucn03about-img-badge-dot" aria-hidden="true" />
              20+ let na trhu
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

// ─── ucetni-01-about ─────────────────────────────────────────────────────────
// 1:1 ucetnictvispravne.cz section 08efe2f / 06875e1
// - Outer: white bg, padding 5rem 0
// - Inner card: gradient(269deg, #FFFBF1 0%, #FFFFFF52 100%), border-radius 8px
// - Left (50%): about-vector.png (520×360), vertically centered
// - Right (50%): floating badge + H3 kicker #FFB500 + H2 3rem #202124 + body #515151 + yellow CTA
function AboutUcetni01({ content, sectionId, tenantSlug, isAdmin }: { content: Record<string, unknown>; sectionId: number; tenantSlug?: string; isAdmin?: boolean }) {
  const YELLOW = "#FFB500";
  const DARK   = "#202124";
  const MUTED  = "#515151";
  const FONT   = "'Space Grotesk', 'Inter', Arial, sans-serif";

  const title     = String(content.title     ?? "Pomáháme vám růst");
  const subtitle  = String(content.subtitle  ?? "Odbornost, spolehlivost, pečlivost");
  const lead      = String(content.lead      ?? "S námi budete mít účetnictví pod kontrolou. Jsme tým zkušených účetních a daňových poradců s více než 15 lety praxe.");
  const body      = String(content.body      ?? "Nabízíme komplexní účetní a daňové služby pro živnostníky, malé a střední firmy i velké korporace. Naším cílem je, abyste se mohli soustředit na svůj byznys – o zbytek se postaráme my.");
  const badgeText = String(content.badgeText ?? "👍 S námi budete mít účetnictví správně");
  const ctaText   = String(content.ctaText   ?? "Zjistit více");
  const ctaHref   = String(content.ctaHref   ?? "/o-nas");

  const resolveHref = (href: string) => {
    if (!tenantSlug) return href;
    if (href.startsWith("#") || href.startsWith("http")) return href;
    return `/${isAdmin ? "admin/" : ""}${tenantSlug}${href.startsWith("/") ? href : "/" + href}`;
  };

  return (
    <section id="o-nas" style={{ backgroundColor: "#ffffff", padding: "5rem 0", fontFamily: FONT }}>
      <style>{`
        .uc01about-inner {
          max-width: 1320px;
          margin: 0 auto;
          padding: 0 20px;
        }
        .uc01about-card {
          background: linear-gradient(269deg, #FFFBF1 0%, rgba(255,255,255,0.32) 100%);
          border-radius: 8px;
          display: flex;
          align-items: center;
          padding: 80px 70px;
          gap: 60px;
        }
        .uc01about-left {
          flex: 0 0 50%;
          min-width: 0;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .uc01about-left img {
          width: 100%;
          max-width: 520px;
          height: auto;
          display: block;
        }
        .uc01about-right {
          flex: 0 0 50%;
          min-width: 0;
          position: relative;
        }
        .uc01about-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: linear-gradient(269deg, #FFFEE8 0%, #FFF3F3 100%);
          border: 1px solid #FFA0A3;
          border-radius: 4px;
          padding: 5px 10px;
          transform: rotateZ(-2deg);
          font-family: ${FONT};
          font-size: 0.88rem;
          color: #F90000;
          margin-bottom: 28px;
          display: inline-block;
        }
        .uc01about-kicker {
          font-family: ${FONT};
          font-size: 1.5rem;
          font-weight: 500;
          color: ${YELLOW};
          margin: 0 0 12px;
          line-height: 1.2;
        }
        .uc01about-h2 {
          font-family: ${FONT};
          font-size: 3rem;
          font-weight: 400;
          color: ${DARK};
          margin: 0 0 24px;
          line-height: 1.2;
        }
        .uc01about-body {
          font-family: ${FONT};
          font-size: 1rem;
          color: ${MUTED};
          margin: 0 0 32px;
          line-height: 1.65;
        }
        .uc01about-cta {
          display: inline-flex;
          align-items: center;
          padding: 16px 24px;
          background: ${YELLOW};
          color: ${DARK};
          font-family: ${FONT};
          font-size: 1rem;
          font-weight: 500;
          text-decoration: none;
          border-radius: 8px;
          border: 1px solid ${YELLOW};
          transition: background 0.2s;
          white-space: nowrap;
        }
        .uc01about-cta:hover { background: #e6a300; border-color: #e6a300; }
        @media (max-width: 900px) {
          .uc01about-card { flex-direction: column; padding: 40px 24px; gap: 32px; }
          .uc01about-left, .uc01about-right { flex: none; width: 100%; }
          .uc01about-h2 { font-size: 2rem; }
        }
        @media (max-width: 600px) {
          .uc01about-h2 { font-size: 1.7rem; }
          .uc01about-kicker { font-size: 1.2rem; }
        }
      `}</style>
      <div className="uc01about-inner">
        <div className="uc01about-card">
          {/* Left — vector illustration */}
          <div className="uc01about-left">
            <img src="/templates/ucetni-01/about-vector.png" alt="" loading="lazy" />
          </div>

          {/* Right — text content */}
          <div className="uc01about-right">
            <div className="uc01about-badge">
              <GenericEditableText sectionId={sectionId} field="badgeText" value={badgeText} tag="span" />
            </div>
            <h3 className="uc01about-kicker">
              <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
            </h3>
            <h2 className="uc01about-h2">
              <GenericEditableText sectionId={sectionId} field="subtitle" value={subtitle} tag="span" />
            </h2>
            <p className="uc01about-body">
              <GenericEditableText sectionId={sectionId} field="lead" value={lead} tag="span" />
            </p>
            <p className="uc01about-body">
              <GenericEditableText sectionId={sectionId} field="body" value={body} tag="span" />
            </p>
            <a href={resolveHref(ctaHref)} data-btn="primary" className="uc01about-cta">
              <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── arch-01-about ─────────────────────────────────────────────────────────────
// 1:1 karesarch.cz about/ateliér sekce:
// - fullscreen 100vh parallax bg image (background-attachment: fixed)
// - gradient-bottom: rgba(0,0,0,0.84) bottom → transparent top
// - centered white text: nadpis "ARCHITEKTA | ateliér" + perex + CTA
// - text container má 25% margin vlevo i vpravo (50% šířka, centrováno)
// ─────────────────────────────────────────────────────────────────────────────
function AboutArch01({ content, sectionId, tenantSlug, isAdmin }: { content: Record<string, unknown>; sectionId: number; tenantSlug?: string; isAdmin?: boolean }) {
  const heading    = String(content.heading    ?? "ARCHITEKTA | ateliér");
  const body       = String(content.body       ?? "");
  const ctaText    = String(content.ctaText    ?? "Objevte více");
  const ctaHref    = String(content.ctaHref    ?? "/atelier");
  const imageUrl   = String(content.imageUrl   ?? "");

  const FONT  = "'Helvetica Neue', Helvetica, Arial, sans-serif";
  const WHITE = "#ffffff";

  const resolvedCta = resolveDemoHref(ctaHref, tenantSlug, isAdmin);

  const styles = `
    .a01ab {
      position: relative;
      width: 100%;
      height: 100vh;
      min-height: 560px;
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .a01ab-bg {
      position: absolute;
      inset: 0;
      background-size: cover;
      background-position: 50% 50%;
      background-attachment: fixed;
      background-repeat: no-repeat;
    }
    /* gradient-bottom: dark at bottom, transparent at top */
    .a01ab-grad {
      position: absolute;
      inset: 0;
      background: linear-gradient(0deg, rgba(0,0,0,0.84) 0%, rgba(0,0,0,0) 100%);
      z-index: 1;
    }
    .a01ab-inner {
      position: relative;
      z-index: 2;
      width: 50%;
      max-width: 760px;
      text-align: center;
      padding: 0 24px;
    }
    @media (max-width: 991px) { .a01ab-inner { width: 80%; } }
    @media (max-width: 575px) {
      .a01ab-inner { width: 92%; }
      .a01ab-bg { background-attachment: scroll; }
    }
    .a01ab-heading {
      font-family: ${FONT};
      font-size: clamp(22px, 3vw, 42px);
      font-weight: 400;
      color: ${WHITE};
      margin: 0 0 28px;
      letter-spacing: 0.04em;
      line-height: 1.2;
    }
    .a01ab-heading strong {
      font-weight: 700;
      position: relative;
      top: -1px;
    }
    .a01ab-body {
      font-family: ${FONT};
      font-size: clamp(14px, 1.5vw, 17px);
      font-weight: 300;
      color: rgba(255,255,255,0.85);
      line-height: 1.75;
      margin: 0 0 36px;
    }
    .a01ab-cta {
      display: inline-block;
      padding: 12px 40px;
      border: 1px solid rgba(255,255,255,0.7);
      color: ${WHITE};
      font-family: ${FONT};
      font-size: 12px;
      font-weight: 400;
      letter-spacing: 0.2em;
      text-transform: uppercase;
      text-decoration: none;
      transition: background 0.2s, border-color 0.2s;
    }
    .a01ab-cta:hover { background: rgba(255,255,255,0.12); border-color: ${WHITE}; }
  `;

  return (
    <>
      <style>{styles}</style>
      <section className="a01ab" data-template="arch-01-about">
        <GenericEditableImage
          sectionId={sectionId}
          field="imageUrl"
          src={imageUrl}
          alt={heading}
          style={{ position: "absolute", inset: 0 }}
        >
          <div
            className="a01ab-bg"
            style={{ backgroundImage: imageUrl ? `url(${imageUrl})` : undefined }}
            aria-hidden="true"
          />
        </GenericEditableImage>

        <div className="a01ab-grad" aria-hidden="true" />

        <div className="a01ab-inner">
          <h2 className="a01ab-heading">
            <GenericEditableText sectionId={sectionId} field="heading" value={heading} tag="span" />
          </h2>
          {body && (
            <p className="a01ab-body">
              <GenericEditableText sectionId={sectionId} field="body" value={body} tag="span" />
            </p>
          )}
          <a href={resolvedCta} className="a01ab-cta">
            <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
          </a>
        </div>
      </section>
    </>
  );
}

// ── ucetni-04-about ───────────────────────────────────────────────────────────
// 1:1 bcas.cz photoText:
// - full-width foto (min-height 30em, object-fit cover)
// - absolutně pozicovaný bílý content-card vpravo: padding clamp(32px,4vw,40px),
//   max-width 30.75em, flex col, gap 1.5rem
// - eyebrow (navy uppercase), H2 (dark bold), 2x body text (muted), CTA btn (navy)
// - slide-in zleva + fade animace při vstupu do viewportu
// ─────────────────────────────────────────────────────────────────────────────
function AboutUcetni04({ content, sectionId, tenantSlug, isAdmin }: {
  content: Record<string, unknown>;
  sectionId: number;
  tenantSlug?: string;
  isAdmin: boolean;
}) {
  const NAVY  = "#003366";
  const DARK  = "#171F22";
  const MUTED = "#486A72";
  const FONT  = "'Plus Jakarta Sans', Arial, 'Helvetica Neue', sans-serif";

  const kicker  = String(content.kicker  ?? "O nás");
  const heading = String(content.heading ?? "Když finance a reality tvoří jeden celek");
  const body1   = String(content.body1   ?? "V životě všechno souvisí – nové bydlení, zajištění rodiny, spoření na penzi. Naši konzultanti vás provázejí všemi životními etapami a hledají řešení na míru vašim potřebám a možnostem.");
  const body2   = String(content.body2   ?? "Nejsme vázáni jedním poskytovatelem. Naším cílem není prodat konkrétní produkt, ale porozumět vašim potřebám a najít to nejlepší řešení z celého trhu.");
  const ctaText = String(content.ctaText ?? "Zjistit více o nás");
  const ctaHref = String(content.ctaHref ?? "/o-nas");
  const imageUrl = String(content.imageUrl ?? "/templates/ucetni-04/about.webp");

  const sectionRef = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } }, { threshold: 0.1 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const resolve = (href: string) => {
    if (!href.startsWith("#") && tenantSlug) {
      return isAdmin ? `/demo/${tenantSlug}${href}/admin` : `/demo/${tenantSlug}${href}`;
    }
    return href;
  };

  return (
    <>
      <style>{`
        .ucn04about {
          position: relative;
          padding: 8px 0;
          font-family: ${FONT};
          overflow: hidden;
        }
        .ucn04about-img {
          width: 100%;
          min-height: 30em;
          height: clamp(420px, 55vw, 680px);
          object-fit: cover;
          display: block;
          filter: saturate(85%);
        }
        .ucn04about-overlay {
          position: absolute;
          inset: 8px 0 8px 0;
          display: flex;
          justify-content: flex-end;
          align-items: center;
          padding: clamp(24px, 4vw, 48px);
        }
        .ucn04about-card {
          background: white;
          padding: clamp(28px, 4vw, 40px);
          max-width: 30.75em;
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
          opacity: 0;
          transform: translateX(40px);
          transition: opacity 0.6s ease, transform 0.6s ease;
        }
        .ucn04about-card.ucn04about-vis {
          opacity: 1;
          transform: translateX(0);
        }
        .ucn04about-kicker {
          font-size: 12px;
          font-weight: 600;
          color: ${NAVY};
          text-transform: uppercase;
          letter-spacing: 0.1em;
          margin: 0;
        }
        .ucn04about-h2 {
          font-size: clamp(20px, 2.2vw, 28px);
          font-weight: 700;
          color: ${DARK};
          letter-spacing: -0.02em;
          line-height: 1.25;
          margin: 0;
        }
        .ucn04about-body {
          font-size: 15px;
          color: ${MUTED};
          line-height: 1.65;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 0.75em;
        }
        .ucn04about-cta {
          display: inline-flex;
          align-items: center;
          padding: 12px 24px;
          background: ${NAVY};
          color: white;
          font-size: 14px;
          font-weight: 600;
          font-family: ${FONT};
          border-radius: 2px;
          text-decoration: none;
          align-self: flex-start;
          transition: background 0.15s;
        }
        .ucn04about-cta:hover { background: #002244; }
        @media (max-width: 768px) {
          .ucn04about-overlay {
            position: static;
            padding: 24px 16px;
            justify-content: stretch;
          }
          .ucn04about-card {
            max-width: 100%;
            opacity: 1;
            transform: none;
          }
        }
      `}</style>
      <section ref={sectionRef} className="ucn04about" data-template="ucetni-04-about">
        <GenericEditableImage
          sectionId={sectionId}
          field="imageUrl"
          src={imageUrl}
          alt=""
          className="ucn04about-img-wrap"
          style={{ display: "block", position: "relative" }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img loading="lazy" src={imageUrl} alt="" className="ucn04about-img" />
        </GenericEditableImage>
        <div className="ucn04about-overlay">
          <div className={`ucn04about-card${visible ? " ucn04about-vis" : ""}`}>
            <p className="ucn04about-kicker">
              <GenericEditableText sectionId={sectionId} field="kicker" value={kicker} tag="span" />
            </p>
            <h2 className="ucn04about-h2">
              <GenericEditableText sectionId={sectionId} field="heading" value={heading} tag="span" />
            </h2>
            <div className="ucn04about-body">
              <span>
                <GenericEditableText sectionId={sectionId} field="body1" value={body1} tag="span" />
              </span>
              <span>
                <GenericEditableText sectionId={sectionId} field="body2" value={body2} tag="span" />
              </span>
            </div>
            <a href={resolve(ctaHref)} data-btn="primary" className="ucn04about-cta">
              <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
            </a>
          </div>
        </div>
      </section>
    </>
  );
}


// ─── instala-02 About ────────────────────────────────────────────────────────
function AboutInstala02({ content, sectionId, tenantSlug, isAdmin }: { content: Record<string, unknown>; sectionId: number; tenantSlug?: string; isAdmin?: boolean }) {
  const c = content as Record<string, unknown>;
  const resolveHref = (href: string) => {
    if (!href || href.startsWith("http") || href.startsWith("#")) return href;
    if (tenantSlug) { const base = isAdmin ? `/demo/${tenantSlug}/admin` : `/demo/${tenantSlug}`; return base + (href.startsWith("/") ? href : "/" + href); }
    return href;
  };

  const RED    = "#ee4036";
  const DARK   = "#111111";
  const WHITE  = "#ffffff";
  const FONT_H = "'Montserrat', sans-serif";
  const FONT_B = "'Roboto', sans-serif";

  const kicker     = String(c.kicker     ?? "O nás");
  const title      = String(c.title      ?? "Instalatér i topenář v jednom");
  const body       = String(c.body       ?? "Jsme rodinná firma specializující se na komplexní topenářské a instalatérské práce.");
  const image      = String(c.image      ?? "/clones/vestop/wp-content/uploads/2026/01/Vestop-vodo-topo-1.jpg");
  const phone      = String(c.phone      ?? "+420 704 123 456");
  const phoneLabel = String(c.phoneLabel ?? "Volejte kdykoliv");
  const ctaText    = String(c.ctaText    ?? "Kontakt a poptávka");
  const ctaHref    = String(c.ctaHref    ?? "/kontakt");
  const features   = (c.features as Array<{ title: string; description: string; icon: string }>) ?? [];
  const stats      = (c.stats    as Array<{ value: string; label: string }>) ?? [];

  // Icon SVG paths (white on red)
  const iconPaths: Record<string, React.ReactNode> = {
    star:    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill={WHITE}/>,
    shield:  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" fill="none" stroke={WHITE} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>,
    zap:     <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" fill="none" stroke={WHITE} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>,
    truck:   <><rect x="1" y="3" width="15" height="13" rx="1" fill="none" stroke={WHITE} strokeWidth="2"/><path d="M16 8h4l3 5v3h-7V8z" fill="none" stroke={WHITE} strokeWidth="2" strokeLinejoin="round"/><circle cx="5.5" cy="18.5" r="2.5" fill="none" stroke={WHITE} strokeWidth="2"/><circle cx="18.5" cy="18.5" r="2.5" fill="none" stroke={WHITE} strokeWidth="2"/></>,
    wrench:  <><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" fill="none" stroke={WHITE} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></>,
  };

  const FeatIcon = ({ icon }: { icon: string }) => (
    <div style={{ width: 40, height: 40, background: RED, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        {iconPaths[icon] ?? iconPaths.wrench}
      </svg>
    </div>
  );

  const badge = stats[0];

  return (
    <section
      id="o-nas"
      data-template="instala-02-about"
      style={{ backgroundColor: WHITE, fontFamily: FONT_B, padding: "100px 0 120px" }}
    >
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Montserrat:wght@600;700;800&family=Roboto:wght@400;500&display=swap" />
      <style>{`        .i2a-outer       { max-width: 1280px; margin: 0 auto; padding: 0 48px; }
        .i2a-grid        { display: grid; grid-template-columns: 52fr 48fr; gap: 88px; align-items: center; }

        /* image column */
        .i2a-imgcol      { position: relative; padding-bottom: 40px; }
        .i2a-imgwrap     { position: relative; z-index: 1; border-radius: 18px; overflow: hidden; height: 580px; box-shadow: 0 24px 64px rgba(0,0,0,0.18); }
        .i2a-badge       { position: absolute; bottom: 0; right: 32px; z-index: 3; background: ${DARK}; border-radius: 14px; padding: 20px 28px; display: flex; align-items: center; gap: 18px; box-shadow: 0 16px 48px rgba(0,0,0,0.32); min-width: 220px; }
        .i2a-badge-icon  { width: 52px; height: 52px; background: ${RED}; border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .i2a-badge-num   { font-family: ${FONT_H}; font-size: 36px; font-weight: 800; color: ${RED}; line-height: 1; }
        .i2a-badge-lbl   { font-size: 12px; color: #aaa; margin-top: 3px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.06em; }

        /* content column */
        .i2a-kicker      { font-family: ${FONT_H}; font-size: 11px; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: ${RED}; margin: 0 0 18px; display: flex; align-items: center; gap: 12px; }
        .i2a-kicker-line { display: inline-block; width: 36px; height: 2px; background: ${RED}; flex-shrink: 0; }
        .i2a-h2          { font-family: ${FONT_H}; font-size: clamp(28px, 3.4vw, 48px); font-weight: 800; color: ${DARK}; line-height: 1.1; margin: 0 0 20px; }
        .i2a-body        { font-size: 16px; line-height: 1.75; color: #555; margin: 0 0 36px; }

        /* stats box */
        .i2a-statsbox    { display: flex; border: 1.5px solid #e8e8e8; border-radius: 12px; overflow: hidden; margin-bottom: 36px; }
        .i2a-stat        { flex: 1; padding: 20px 16px; text-align: center; }
        .i2a-stat + .i2a-stat { border-left: 1.5px solid #e8e8e8; }
        .i2a-stat-val    { font-family: ${FONT_H}; font-size: clamp(24px, 2.8vw, 34px); font-weight: 800; color: ${RED}; line-height: 1; }
        .i2a-stat-lbl    { font-size: 11px; color: #999; margin-top: 5px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.05em; }

        /* features 2×2 */
        .i2a-feats       { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 36px; }
        .i2a-feat        { display: flex; align-items: flex-start; gap: 12px; padding: 16px; background: #f7f7f7; border-radius: 12px; border: 1px solid #eee; transition: box-shadow .2s; }
        .i2a-feat:hover  { box-shadow: 0 6px 20px rgba(0,0,0,0.08); }
        .i2a-feat-title  { font-family: ${FONT_H}; font-size: 13px; font-weight: 700; color: ${DARK}; margin: 0 0 4px; line-height: 1.2; }
        .i2a-feat-desc   { font-size: 12px; color: #777; line-height: 1.5; margin: 0; }

        /* CTA */
        .i2a-cta-row     { display: flex; align-items: center; gap: 20px; flex-wrap: wrap; }
        .i2a-btn         { display: inline-flex; align-items: center; gap: 8px; background: ${RED}; color: ${WHITE}; font-family: ${FONT_H}; font-size: 14px; font-weight: 700; letter-spacing: 0.03em; padding: 14px 28px; border-radius: 6px; text-decoration: none; transition: background .2s; }
        .i2a-btn:hover   { background: #c42d2d; }
        .i2a-phone       { font-family: ${FONT_H}; font-size: 14px; font-weight: 700; color: ${DARK}; text-decoration: none; display: flex; align-items: center; gap: 6px; }
        .i2a-phone-lbl   { font-size: 11px; color: #999; font-weight: 500; text-transform: uppercase; letter-spacing: 0.05em; margin-right: 2px; }

        /* mobile */
        @media (max-width: 960px) {
          .i2a-outer  { padding: 0 20px !important; }
          .i2a-grid   { grid-template-columns: 1fr !important; gap: 40px !important; }
          .i2a-imgwrap { height: 340px !important; }

          .i2a-badge  { right: 16px; padding: 14px 20px; min-width: 0; }
          .i2a-feats  { grid-template-columns: 1fr !important; }
        }
      `}</style>

      <div className="i2a-outer">
        <div className="i2a-grid">

          {/* ── Left: image column ── */}
          <div className="i2a-imgcol">
            <div className="i2a-imgwrap">
              <GenericEditableImage
                sectionId={sectionId} field="image" src={image} alt="O nás"
                className="relative overflow-hidden w-full h-full" style={{ height: "100%", minHeight: 580 }}
              >
                <Image
                  src={image} alt="Topenářství a instalatérství"
                  fill className="object-cover" sizes="(max-width:960px) 100vw, 52vw"
                  unoptimized={shouldSkipNextImageOptimization(image)}
                />
              </GenericEditableImage>
            </div>

            {/* Floating dark badge with first stat */}
            {badge && (
              <div className="i2a-badge">
                <div className="i2a-badge-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" fill="none" stroke={WHITE} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div>
                  <div className="i2a-badge-num">
                    <GenericEditableText sectionId={sectionId} field="stats.0.value" value={badge.value} tag="span" />
                  </div>
                  <div className="i2a-badge-lbl">
                    <GenericEditableText sectionId={sectionId} field="stats.0.label" value={badge.label} tag="span" />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ── Right: content column ── */}
          <div>
            {/* Kicker */}
            <p className="i2a-kicker">
              <span className="i2a-kicker-line" />
              <GenericEditableText sectionId={sectionId} field="kicker" value={kicker} tag="span" />
            </p>

            {/* H2 */}
            <h2 className="i2a-h2">
              <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
            </h2>

            {/* Body */}
            <p className="i2a-body">
              <GenericEditableText sectionId={sectionId} field="body" value={body} tag="span" />
            </p>

            {/* Stats box (skip first — shown in badge) */}
            {stats.length > 1 && (
              <div className="i2a-statsbox">
                {stats.slice(1).map((s, i) => (
                  <div key={i} className="i2a-stat">
                    <div className="i2a-stat-val">
                      <GenericEditableText sectionId={sectionId} field={`stats.${i + 1}.value`} value={s.value} tag="span" />
                    </div>
                    <div className="i2a-stat-lbl">
                      <GenericEditableText sectionId={sectionId} field={`stats.${i + 1}.label`} value={s.label} tag="span" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Features 2×2 */}
            {features.length > 0 && (
              <div className="i2a-feats">
                {features.map((f, i) => (
                  <div key={i} className="i2a-feat">
                    <FeatIcon icon={f.icon} />
                    <div>
                      <p className="i2a-feat-title">
                        <GenericEditableText sectionId={sectionId} field={`features.${i}.title`} value={f.title} tag="span" />
                      </p>
                      <p className="i2a-feat-desc">
                        <GenericEditableText sectionId={sectionId} field={`features.${i}.description`} value={f.description} tag="span" />
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* CTA row */}
            <div className="i2a-cta-row">
              <a href={resolveHref(ctaHref)} data-btn="primary" className="i2a-btn">
                <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M5 12h14M12 5l7 7-7 7" stroke={WHITE} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </a>
              <a href={`tel:${phone.replace(/\s/g,"")}`} className="i2a-phone">
                <span className="i2a-phone-lbl">
                  <GenericEditableText sectionId={sectionId} field="phoneLabel" value={phoneLabel} tag="span" />:
                </span>
                <GenericEditableText sectionId={sectionId} field="phone" value={phone} tag="span" />
              </a>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

// ── clean-01-about ────────────────────────────────────────────────────────────
// 2-col layout: vlevo foto na celou výšku (static-bg-services-info.webp),
// vpravo bílý text panel — nadpis, perex, body text, zelené CTA tlačítko.
// Na mobile single-col (foto nahoře, text dole).
// ─────────────────────────────────────────────────────────────────────────────
function AboutClean01({ content, sectionId, tenantSlug: _ts, isAdmin: _ia }: { content: Record<string, unknown>; sectionId: number; tenantSlug?: string; isAdmin?: boolean }) {
  const GREEN = "#69be28";
  const DARK  = "#0d1a20";
  const FONT  = "Arial, Helvetica, sans-serif";

  const title    = String(content.title    ?? "Co děláme");
  const subtitle = String(content.subtitle ?? "Jsme významným dodavatelem komplexních úklidových a dalších doplňkových služeb pro průmyslové provozy, kanceláře, správní budovy, školy, nemocnice, banky, hotely a další instituce.");
  const body     = String(content.body     ?? "Kromě kompletního úklidu se zabýváme také celou řadou dalších činností. Od komplexní správy budov (facility management) až po bezpečnostní služby.");
  const ctaText  = String(content.ctaText  ?? "Zjistit více");
  const ctaHref  = String(content.ctaHref  ?? "#sluzby");
  const image    = String(content.image    ?? "/clones/cleancat/img/static-bg-services-info.webp");

  const styles = `
    .c01ab-wrap {
      display: grid;
      grid-template-columns: 1fr 1fr;
      min-height: 520px;
      font-family: ${FONT};
    }
    @media (max-width: 47.99rem) {
      .c01ab-wrap { grid-template-columns: 1fr; }
    }
    .c01ab-img {
      position: relative;
      min-height: 320px;
      overflow: hidden;
    }
    .c01ab-img img {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .c01ab-text {
      background: ${DARK};
      display: flex;
      flex-direction: column;
      justify-content: center;
      padding: 4rem 3.5rem;
    }
    @media (max-width: 63.99rem) {
      .c01ab-text { padding: 3rem 2rem; }
    }
    .c01ab-title {
      font-size: clamp(1.6rem, 2.8vw, 2.4rem);
      font-weight: 700;
      color: #ffffff;
      margin: 0 0 1.2rem;
      line-height: 1.2;
    }
    .c01ab-title span { color: ${GREEN}; }
    .c01ab-subtitle {
      font-size: 0.97rem;
      color: rgba(255,255,255,0.75);
      line-height: 1.7;
      margin: 0 0 1rem;
    }
    .c01ab-body {
      font-size: 0.92rem;
      color: rgba(255,255,255,0.55);
      line-height: 1.7;
      margin: 0 0 2rem;
    }
    .c01ab-cta {
      display: inline-block;
      background: ${GREEN};
      color: #ffffff;
      text-decoration: none;
      font-weight: 700;
      font-size: 0.92rem;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      padding: 0.8rem 2.2rem;
      border-radius: 4px;
      align-self: flex-start;
      transition: background 0.18s;
    }
    .c01ab-cta:hover { background: #5aa020; }
  `;

  return (
    <section id="onas" className="c01ab-wrap">
      <style>{styles}</style>
      <div className="c01ab-img">
        <GenericEditableImage sectionId={sectionId} field="image" src={image} alt={title} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img loading="lazy" src={image} alt={title} />
        </GenericEditableImage>
      </div>
      <div className="c01ab-text">
        <h2 className="c01ab-title">
          <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
        </h2>
        <p className="c01ab-subtitle">
          <GenericEditableText sectionId={sectionId} field="subtitle" value={subtitle} tag="span" />
        </p>
        <p className="c01ab-body">
          <GenericEditableText sectionId={sectionId} field="body" value={body} tag="span" />
        </p>
        <a href={ctaHref} data-btn="primary" className="c01ab-cta">
          <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
        </a>
      </div>
    </section>
  );
}

// ── klima-01-about ────────────────────────────────────────────────────────────
// 1:1 pragoclima.cz „Proč my": šedé bg, 2 sloupce
// Vlevo: eyebrow (červený) + h2 (navy) + body + 2×3 grid featur + CTA
// Vpravo: foto produktu/realizace
// ─────────────────────────────────────────────────────────────────────────────
function AboutKlima01({ content, sectionId, tenantSlug, isAdmin }: { content: Record<string, unknown>; sectionId: number; tenantSlug?: string; isAdmin?: boolean }) {
  type Feature = { title?: string; desc?: string };

  const eyebrow  = String(content.eyebrow  ?? "Proč my");
  const title    = String(content.title    ?? "Jsme odborníci na návrh řešení i technologie");
  const body     = String(content.body     ?? "");
  const image    = String(content.image    ?? "");
  const ctaText  = String(content.ctaText  ?? "O naší firmě");
  const ctaHref  = String(content.ctaHref  ?? "/#onas");
  const features = ((content.features as Feature[]) ?? []).slice(0, 6);

  const RED  = "#e30016";
  const NAVY = "#182545";
  const FONT = "'Outfit', -apple-system, sans-serif";

  const resolve = (href: string) => resolveDemoHref(href, tenantSlug, isAdmin);

  /* Checkmark SVG */
  const Check = () => (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" style={{ flexShrink: 0, marginTop: 2 }}>
      <circle cx="9" cy="9" r="9" fill={RED} />
      <path d="M5 9l3 3 5-5" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );

  return (
    <>
    <style>{`
      @media (max-width: 768px) {
        .klima-about-row { flex-direction: column !important; gap: 40px !important; }
        .klima-about-photo { flex: none !important; max-width: 100% !important; width: 100% !important; }
        .klima-about-features { grid-template-columns: 1fr !important; }
      }
    `}</style>
    <section
      id="onas"
      style={{ backgroundColor: "#f7f7f7", padding: "88px 24px", fontFamily: FONT }}
      data-template="klima-01"
    >
      <div className="klima-about-row" style={{ maxWidth: 1200, margin: "0 auto", display: "flex", alignItems: "center", gap: 72 }}>

        {/* Vlevo: text */}
        <div style={{ flex: "1 1 0", minWidth: 0 }}>
          <p style={{ fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.12em", color: RED, margin: "0 0 12px" }}>
            <GenericEditableText sectionId={sectionId} field="eyebrow" value={eyebrow} tag="span" />
          </p>
          <h2 style={{ fontSize: "clamp(1.6rem, 2.4vw, 2.2rem)", fontWeight: 700, color: NAVY, lineHeight: 1.22, margin: "0 0 20px" }}>
            <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
          </h2>
          <p style={{ fontSize: 15, lineHeight: 1.75, color: "#555", margin: "0 0 36px" }}>
            <GenericEditableText sectionId={sectionId} field="body" value={body} tag="span" />
          </p>

          {/* 2×3 feature grid */}
          <div className="klima-about-features" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "18px 32px", marginBottom: 40 }}>
            {features.map((f, i) => (
              <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                <Check />
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: NAVY, marginBottom: 2 }}>
                    <GenericEditableText sectionId={sectionId} field={`features.${i}.title`} value={String(f.title ?? "")} tag="span" />
                  </div>
                  <div style={{ fontSize: 13, color: "#666", lineHeight: 1.5 }}>
                    <GenericEditableText sectionId={sectionId} field={`features.${i}.desc`} value={String(f.desc ?? "")} tag="span" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <a
            href={resolve(ctaHref)}
            data-btn="primary"
            style={{
              display: "inline-block",
              backgroundColor: RED, color: "#fff",
              textDecoration: "none", fontWeight: 600, fontSize: 15,
              padding: "13px 30px", borderRadius: 5,
              transition: "background-color 0.2s",
            }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#b50012")}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = RED)}
          >
            <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
          </a>
        </div>

        {/* Vpravo: foto */}
        <div className="klima-about-photo" style={{ flex: "0 0 440px", maxWidth: 440 }}>
          <GenericEditableImage sectionId={sectionId} field="image" src={image} alt={title} className="relative" style={{ borderRadius: 12, overflow: "hidden", display: "block" }}>
            <Image
              src={image}
              alt={title}
              width={440}
              height={520}
              style={{ width: "100%", height: "auto", display: "block", borderRadius: 12, objectFit: "cover" }}
              unoptimized={shouldSkipNextImageOptimization(image)}
            />
          </GenericEditableImage>
        </div>

      </div>
    </section>
    </>
  );
}

// ── solar-03-about ────────────────────────────────────────────────────────────
function AboutSolar03({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  type Item = { title?: string; description?: string };
  const eyebrow  = String(content.eyebrow  ?? "Proč SolarPro");
  const title    = String(content.title    ?? "Deset důvodů, které mluví za nás");
  const subtitle = String(content.subtitle ?? "Nejsme montážní firma bez odpovědnosti. Jsme český výrobce s dvacetiletou historií, vlastní servisní sítí a jasnou odpovědností za výsledek — od návrhu až po poslední den záruky.");
  const items: Item[] = Array.isArray(content.items) ? (content.items as Item[]) : [];

  return (
    <section id="onas" className="s03ab-section" data-template="solar-03">
      <div className="s03ab-bg-grid" aria-hidden="true" />
      <div className="s03ab-inner">
        <div className="s03ab-header">
          <div className="s03ab-eyebrow">
            <span className="s03ab-eyebrow-dot" aria-hidden="true" />
            <GenericEditableText sectionId={sectionId} field="eyebrow" value={eyebrow} tag="span" />
          </div>
          <h2 className="s03ab-h2">
            <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
          </h2>
          <p className="s03ab-sub-lead">
            <GenericEditableText sectionId={sectionId} field="subtitle" value={subtitle} tag="span" />
          </p>
        </div>

        <div className="s03ab-grid">
          {items.map((item, i) => (
            <article className="s03ab-item" key={i}>
              <span className="s03ab-item-rail" aria-hidden="true" />
              <span className="s03ab-item-icon" aria-hidden="true">
                <svg width="15" height="15" viewBox="0 0 18 18" fill="none">
                  <path d="M4.5 9l3 3 6-6.5" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </span>
              <div className="s03ab-item-body">
                <h3 className="s03ab-item-h3">
                  <GenericEditableText sectionId={sectionId} field={`items.${i}.title`} value={String(item.title ?? "")} tag="span" />
                </h3>
                <p className="s03ab-item-p">
                  <GenericEditableText sectionId={sectionId} field={`items.${i}.description`} value={String(item.description ?? "")} tag="span" />
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── AboutSolar02 ─── solar-02 Greenia partner 3-kroky (luxe) ─────────── */
function AboutSolar02({ content, sectionId, isAdmin }: { content: Record<string, unknown>; sectionId: number; isAdmin?: boolean }) {
  const showHeader = content.showHeader !== false;
  const eyebrow  = String(content.eyebrow  ?? "Váš energetický partner");
  const title    = String(content.title    ?? "Váš partner od projektu až po servis");
  const subtitle = String(content.subtitle ?? "Neprodáváme panely. Budujeme funkční energetické systémy a přebíráme za ně plnou odpovědnost — technickou, dotační i provozní. U každého projektu jsme od prvního hovoru až po konec záruky.");
  const cards = (content.cards as Array<{ icon: string; title: string; description: string }> | undefined) ?? [
    { icon: "analyze", title: "Zanalyzujeme", description: "Provedeme podrobnou analýzu spotřeby, střechy i sítě. Na základě dat navrhneme systém s nejkratší dobou návratnosti a maximálním výnosem." },
    { icon: "build",   title: "Postavíme",   description: "Kompletní realizace na klíč — projekt, stavební povolení, připojení k síti, vyřízení dotací a montáž vlastní certifikovanou partou." },
    { icon: "service", title: "Staráme se",   description: "Online monitoring výkonu, pravidelná údržba a 24/7 podpora po celou dobu životnosti systému. Servisní zásah do 48 hodin." },
  ];

  const IconAnalyze = () => (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 3v18h18"/><path d="M7 15l4-4 4 4 5-6"/><circle cx="7" cy="15" r="1" fill="currentColor"/><circle cx="11" cy="11" r="1" fill="currentColor"/><circle cx="15" cy="15" r="1" fill="currentColor"/><circle cx="20" cy="9" r="1" fill="currentColor"/>
    </svg>
  );
  const IconBuild = () => (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 21V9l8-5 8 5v12"/><rect x="7" y="12" width="4" height="4"/><rect x="13" y="12" width="4" height="4"/><line x1="4" y1="9" x2="20" y2="9"/><line x1="4" y1="14" x2="20" y2="14"/>
    </svg>
  );
  const IconService = () => (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 2l8 4v6c0 5-3.5 9-8 10-4.5-1-8-5-8-10V6l8-4z"/><polyline points="9 12 11 14 15 10"/>
    </svg>
  );
  const iconFor = (key: string) => {
    if (key === "build")   return <IconBuild />;
    if (key === "service") return <IconService />;
    return <IconAnalyze />;
  };

  return (
    <section className="s02ab" id="partnerstvi" data-template="solar-02">
      {/* Decorative subtle green glow */}
      <div className="s02ab-glow" aria-hidden="true" />

      <div className="s02ab-inner">
        {showHeader && (
          <div className="s02ab-head">
            <div className="s02ab-eyebrow">
              <span className="s02ab-eyebrow-dot" aria-hidden="true" />
              <GenericEditableText sectionId={sectionId} field="eyebrow" value={eyebrow} tag="span" />
            </div>
            <h2 className="s02ab-h2">
              <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
            </h2>
            <p className="s02ab-sub">
              <GenericEditableText sectionId={sectionId} field="subtitle" value={subtitle} tag="span" />
            </p>
          </div>
        )}

        <div className="s02ab-grid">
          {cards.map((card, i) => (
            <div className="s02ab-card" key={i}>
              <div className="s02ab-icon" aria-hidden="true">
                {iconFor(card.icon)}
              </div>
              <h3 className="s02ab-card-h3">
                <GenericEditableText sectionId={sectionId} field={`cards.${i}.title`} value={card.title} tag="span" />
              </h3>
              <p className="s02ab-card-p">
                <GenericEditableText sectionId={sectionId} field={`cards.${i}.description`} value={card.description} tag="span" />
              </p>
              <div className="s02ab-card-hairline" aria-hidden="true" />
              {i < cards.length - 1 && (
                <svg className="s02ab-arrow" width="42" height="18" viewBox="0 0 42 18" fill="none" aria-hidden="true">
                  <path d="M2 9h34m0 0l-7-7m7 7l-7 7" stroke="rgba(121,196,79,0.55)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── klempir-01-about ─────────────────────────────────────────────────────────
// 1:1 klempirzprahy.cz:
// - White bg, section padding 80px 0
// - H2 "O mně" centered 36px + silver underline
// - 2-col: left 38% portrait photo (border-radius 8px, box-shadow) | right 58% text
//   - body paragraph, highlights list (4 items: label bold + value), about-cta paragraph
// ─────────────────────────────────────────────────────────────────────────────
interface AboutK01Props {
  content: Record<string, unknown>;
  sectionId: number;
  tenantSlug?: string;
  isAdmin: boolean;
}

function AboutKlempir01({ content, sectionId, tenantSlug, isAdmin }: AboutK01Props) {
  const FONT   = "'Montserrat', sans-serif";
  const SILVER = "#c0c0c0";
  const DARK   = "#1a1a1a";
  const MEDIUM = "#3a3a3a";

  const kicker    = String(content.kicker    ?? "O mně");
  const title     = String(content.title     ?? "Řemeslo s tradicí a precizností");
  const body      = String(content.body      ?? "");
  const image     = String(content.image     ?? "/clones/klempirzprahy/images/klempir-portrait.jpg");
  const phone     = String(content.phone     ?? "+420 704 123 456");
  const phoneLabel = String(content.phoneLabel ?? "Osobní přístup k projektu");
  const rawStats  = Array.isArray(content.stats) ? content.stats as Array<{ label: string; value: string }> : [];

  return (
    <>
      <style>{`
        .k01-about { background: #ffffff; padding: 80px 0; position: relative; font-family: ${FONT}; }
        .k01-about::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 1px; background: rgba(0,0,0,0.05); }
        .k01-about-container { width: 90%; max-width: 1200px; margin: 0 auto; padding: 0 15px; }
        .k01-about-h2 { font-size: 36px; font-weight: 600; color: ${DARK}; text-align: center; margin-bottom: 50px; position: relative; font-family: ${FONT}; }
        .k01-about-h2::after { content: ''; display: block; width: 80px; height: 3px; background: ${SILVER}; margin: 15px auto 0; }
        .k01-about-content { display: flex; align-items: flex-start; gap: 50px; }
        .k01-about-img-wrap { flex: 0 0 38%; }
        .k01-about-portrait { border-radius: 8px; box-shadow: 0 4px 20px rgba(0,0,0,0.12); display: block; width: 100%; height: auto; }
        .k01-about-text { flex: 0 0 58%; display: flex; flex-direction: column; justify-content: center; }
        .k01-about-text h3 { font-size: 24px; font-weight: 600; color: ${DARK}; margin-bottom: 20px; font-family: ${FONT}; position: relative; display: inline-block; }
        .k01-about-text h3::after { content: ''; position: absolute; bottom: -10px; left: 0; width: 60px; height: 3px; background: ${SILVER}; border-radius: 2px; }
        .k01-about-body { margin-bottom: 25px; line-height: 1.8; color: #444; font-size: 15px; }
        .k01-about-highlights { list-style: none; padding: 0; margin: 30px 0; }
        .k01-about-highlights li { position: relative; padding-left: 20px; margin-bottom: 15px; line-height: 1.5; font-size: 15px; color: #444; }
        .k01-about-highlights li::before { content: '▪'; position: absolute; left: 0; color: ${SILVER}; font-size: 14px; top: 0; }
        .k01-about-hl-title { font-weight: 600; color: ${MEDIUM}; }
        .k01-about-cta-text { font-weight: 500; font-size: 15px; color: #444; line-height: 1.7; margin-top: 10px; }
        .k01-about-phone { display: flex; align-items: center; gap: 14px; margin-top: 28px; padding-top: 24px; border-top: 1px solid rgba(0,0,0,0.1); }
        .k01-about-phone-label { font-size: 13px; color: #777; font-weight: 500; }
        .k01-about-phone-num { font-size: 20px; font-weight: 700; color: ${MEDIUM}; text-decoration: none; }
        .k01-about-phone-num:hover { color: ${SILVER}; }
        @media (max-width: 900px) {
          .k01-about-content { flex-direction: column; }
          .k01-about-img-wrap { flex: none; width: 100%; max-width: 380px; margin: 0 auto 30px; }
          .k01-about-text { flex: none; width: 100%; }
        }
      `}</style>

      <section id="o-mne" className="k01-about" data-template="klempir-01">
        <div className="k01-about-container">
          <h2 className="k01-about-h2">
            <GenericEditableText sectionId={sectionId} field="kicker" value={kicker} tag="span" />
          </h2>

          <div className="k01-about-content">
            {/* Left: portrait */}
            <div className="k01-about-img-wrap">
              <GenericEditableImage sectionId={sectionId} field="image" src={image} alt="Klempíř z Prahy" style={{}}>
                <img loading="lazy" src={image} alt="Klempíř z Prahy" className="k01-about-portrait" />
              </GenericEditableImage>
            </div>

            {/* Right: text */}
            <div className="k01-about-text">
              <h3>
                <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
              </h3>

              <p className="k01-about-body" style={{ marginTop: 30 }}>
                <GenericEditableText sectionId={sectionId} field="body" value={body} tag="span" />
              </p>

              {rawStats.length > 0 && (
                <ul className="k01-about-highlights">
                  {rawStats.map((s, i) => (
                    <li key={i}>
                      <span className="k01-about-hl-title">
                        <GenericEditableText sectionId={sectionId} field={`stats.${i}.label`} value={s.label} tag="span" />
                        :
                      </span>{" "}
                      <GenericEditableText sectionId={sectionId} field={`stats.${i}.value`} value={s.value} tag="span" />
                    </li>
                  ))}
                </ul>
              )}

              {/* Phone CTA */}
              <div className="k01-about-phone">
                <div>
                  <div className="k01-about-phone-label">
                    <GenericEditableText sectionId={sectionId} field="phoneLabel" value={phoneLabel} tag="span" />
                  </div>
                  <a href={`tel:${phone.replace(/\s/g, "")}`} className="k01-about-phone-num">
                    <GenericEditableText sectionId={sectionId} field="phone" value={phone} tag="span" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

// ── malir-01-about ────────────────────────────────────────────────────────────
// 1:1 petrovomalovani.cz description sekce:
// - Bílé pozadí, padding 100px 30px
// - Centrovaný blok max-width 770px
// - Amber tagline Raleway uppercase small
// - Playfair Display H2 tmavý, 40px, tučný
// - Amber dekorativní linka pod H2
// - 2 odstavce body text Raleway
// ─────────────────────────────────────────────────────────────────────────────
function AboutMalir01({ content, sectionId }: { content: Record<string, unknown>; sectionId: number; isAdmin: boolean }) {
  const AMBER    = "#E79B0E";
  const DARK     = "#1a1a1a";
  const MUTED    = "#444444";
  const PLAYFAIR = "'Playfair Display', 'Times New Roman', serif";
  const RALEWAY  = "'Raleway', sans-serif";

  const tagline = String(content.tagline ?? "O nás");
  const title   = String(content.title   ?? "Preciznost od začátku\ndo posledního detailu");
  const body    = String(content.body    ?? "");
  const paragraphs = body.split(/\n\n+/).filter(Boolean);

  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;800&family=Raleway:wght@400;500;600&display=swap" />
      <style>{`        .m01a-section { background: #ffffff; padding: 100px 30px; font-family: ${RALEWAY}; }
        .m01a-inner { max-width: 770px; margin: 0 auto; text-align: center; }
        .m01a-tagline { font-family: ${RALEWAY}; font-size: 13px; font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase; color: ${AMBER}; margin-bottom: 16px; }
        .m01a-title { font-family: ${PLAYFAIR}; font-size: 40px; font-weight: 800; color: ${DARK}; line-height: 1.25; margin: 0 0 20px; white-space: pre-line; }
        .m01a-divider { width: 56px; height: 3px; background: ${AMBER}; margin: 0 auto 32px; border-radius: 2px; }
        .m01a-body { font-size: 16px; line-height: 1.85; color: ${MUTED}; margin: 0 0 20px; }
        .m01a-body:last-child { margin-bottom: 0; }
        @media (max-width: 600px) { .m01a-section { padding: 70px 20px; } .m01a-title { font-size: 28px; } }
      `}</style>

      <section id="o-nas" className="m01a-section" data-template="malir-01">
        <div className="m01a-inner">
          <p className="m01a-tagline">
            <GenericEditableText sectionId={sectionId} field="tagline" value={tagline} tag="span">{tagline}</GenericEditableText>
          </p>
          <h2 className="m01a-title">
            <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span">{title}</GenericEditableText>
          </h2>
          <div className="m01a-divider" />
          {paragraphs.length > 0
            ? paragraphs.map((p, i) => (
                <p key={i} className="m01a-body">
                  <GenericEditableText sectionId={sectionId} field={i === 0 ? "body" : `body_p${i}`} value={p} tag="span">{p}</GenericEditableText>
                </p>
              ))
            : <p className="m01a-body"><GenericEditableText sectionId={sectionId} field="body" value={body} tag="span">{body}</GenericEditableText></p>
          }
        </div>
      </section>
    </>
  );
}

// ── garden-01-about ──────────────────────────────────────────────────────────
const GARDEN01_ICONS: Record<string, React.ReactNode> = {
  clock: (
    <svg viewBox="0 0 448 512" fill="currentColor" width="28" height="28" aria-hidden="true">
      <path d="M272 0C289.7 0 304 14.33 304 32C304 49.67 289.7 64 272 64H256V98.45C293.5 104.2 327.7 120 355.7 143L377.4 121.4C389.9 108.9 410.1 108.9 422.6 121.4C435.1 133.9 435.1 154.1 422.6 166.6L398.5 190.8C419.7 223.3 432 262.2 432 304C432 418.9 338.9 512 224 512C109.1 512 16 418.9 16 304C16 200 92.32 113.8 192 98.45V64H176C158.3 64 144 49.67 144 32C144 14.33 158.3 0 176 0L272 0zM248 192C248 178.7 237.3 168 224 168C210.7 168 200 178.7 200 192V320C200 333.3 210.7 344 224 344C237.3 344 248 333.3 248 320V192z"/>
    </svg>
  ),
  home: (
    <svg viewBox="0 0 576 512" fill="currentColor" width="28" height="28" aria-hidden="true">
      <path d="M575.8 255.5C575.8 273.5 560.8 287.6 543.8 287.6H511.8L512.5 447.7C512.5 450.5 512.3 453.1 512 455.8V472C512 494.1 494.1 512 472 512H456C454.9 512 453.8 511.1 452.7 511.9C451.3 511.1 449.9 512 448.5 512H392C369.9 512 352 494.1 352 472V384C352 366.3 337.7 352 320 352H256C238.3 352 224 366.3 224 384V472C224 494.1 206.1 512 184 512H128.1C126.6 512 125.1 511.9 123.6 511.8C122.4 511.9 121.2 512 120 512H104C81.91 512 64 494.1 64 472V360C64 359.1 64.03 358.1 64.09 357.2V287.6H32.05C14.02 287.6 0 273.5 0 255.5C0 246.5 3.004 238.5 10.01 231.5L266.4 8.016C273.4 1.002 281.4 0 288.4 0C295.4 0 303.4 2.004 309.5 7.014L564.8 231.5C572.8 238.5 576.9 246.5 575.8 255.5z"/>
    </svg>
  ),
  edit: (
    <svg viewBox="0 0 512 512" fill="currentColor" width="28" height="28" aria-hidden="true">
      <path d="M490.3 40.4C512.2 62.27 512.2 97.73 490.3 119.6L460.3 149.7L362.3 51.72L392.4 21.66C414.3-.2135 449.7-.2135 471.6 21.66L490.3 40.4zM172.4 241.7L339.7 74.34L437.7 172.3L270.3 339.6C264.2 345.8 256.7 350.4 248.4 353.2L159.6 382.8C150.1 385.8 141.5 383.4 135.1 376.1C128.6 370.5 126.2 361 129.2 352.4L158.8 263.6C161.6 255.3 166.2 247.8 172.4 241.7V241.7zM192 63.1C209.7 63.1 224 78.33 224 95.1C224 113.7 209.7 127.1 192 127.1H96C78.33 127.1 64 142.3 64 159.1V416C64 433.7 78.33 448 96 448H352C369.7 448 384 433.7 384 416V319.1C384 302.3 398.3 287.1 416 287.1C433.7 287.1 448 302.3 448 319.1V416C448 469 405 512 352 512H96C42.98 512 0 469 0 416V159.1C0 106.1 42.98 63.1 96 63.1H192z"/>
    </svg>
  ),
  check: (
    <svg viewBox="0 0 512 512" fill="currentColor" width="28" height="28" aria-hidden="true">
      <path d="M243.8 339.8C232.9 350.7 215.1 350.7 204.2 339.8L140.2 275.8C129.3 264.9 129.3 247.1 140.2 236.2C151.1 225.3 168.9 225.3 179.8 236.2L224 280.4L332.2 172.2C343.1 161.3 360.9 161.3 371.8 172.2C382.7 183.1 382.7 200.9 371.8 211.8L243.8 339.8zM512 256C512 397.4 397.4 512 256 512C114.6 512 0 397.4 0 256C0 114.6 114.6 0 256 0C397.4 0 512 114.6 512 256zM256 48C141.1 48 48 141.1 48 256C48 370.9 141.1 464 256 464C370.9 464 464 370.9 464 256C464 141.1 370.9 48 256 48z"/>
    </svg>
  ),
};

function AboutGarden01({
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
  const title    = String(content.title    ?? "Proč si vybrat právě nás");
  const subtitle = String(content.subtitle ?? "Máme za sebou roky práce v terénu.");
  const items = Array.isArray(content.items)
    ? (content.items as Array<{ icon?: string; title?: string; description?: string }>)
    : [];

  return (
    <>
      <style>{`
        .g01a-section {
          background: #ffffff;
          padding: 80px 48px;
          box-sizing: border-box;
        }
        .g01a-header {
          max-width: 860px;
          margin: 0 auto 48px auto;
          text-align: left;
        }
        .g01a-title {
          font-family: 'Cardo', Georgia, serif;
          font-size: 38px;
          font-weight: 700;
          color: #202714;
          margin: 0 0 12px 0;
          line-height: 1.2;
        }
        .g01a-hr {
          border: none;
          border-top: 2px solid #6a961f;
          width: 60px;
          margin: 0 0 16px 0;
        }
        .g01a-subtitle {
          font-family: 'Inter', Arial, sans-serif;
          font-size: 16px;
          color: #5a5a5a;
          margin: 0;
          line-height: 1.6;
        }
        .g01a-grid {
          display: flex;
          flex-direction: row;
          flex-wrap: nowrap;
          gap: 34px;
          max-width: 1200px;
          margin: 0 auto;
          align-items: stretch;
        }
        .g01a-card {
          flex: 1;
          border: 2px solid #f2f2f2;
          border-radius: 16px;
          padding: 30px 20px;
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 14px;
          transition: box-shadow 0.25s ease;
        }
        .g01a-card:hover {
          box-shadow: 0 8px 10px 0 #abb8c3;
        }
        .g01a-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 56px;
          height: 56px;
          border-radius: 50%;
          background: #f2f2f2;
          color: #6a961f;
          flex-shrink: 0;
        }
        .g01a-card-title {
          font-family: 'Cardo', Georgia, serif;
          font-size: 18px;
          font-weight: 700;
          color: #202714;
          margin: 0;
          line-height: 1.3;
        }
        .g01a-card-desc {
          font-family: 'Inter', Arial, sans-serif;
          font-size: 15px;
          color: #5a5a5a;
          margin: 0;
          line-height: 1.6;
        }

        @media (max-width: 1023px) {
          .g01a-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 26px;
          }
          .g01a-card { padding: 24px; }
        }
        @media (max-width: 767px) {
          .g01a-section { padding: 60px 20px; }
          .g01a-grid {
            display: flex;
            flex-direction: column;
            gap: 16px;
          }
          .g01a-title { font-size: 28px; }
        }
      `}</style>

      <section id="onas" className="g01a-section">
        <div className="g01a-header">
          <GenericEditableText
            tag="h2"
            className="g01a-title"
            value={title}
            sectionId={sectionId}
            field="title"
          />
          <hr className="g01a-hr" />
          <GenericEditableText
            tag="p"
            className="g01a-subtitle"
            value={subtitle}
            sectionId={sectionId}
            field="subtitle"
          />
        </div>

        <div className="g01a-grid">
          {items.map((item, i) => (
            <div key={i} className="g01a-card">
              <div className="g01a-icon">
                {GARDEN01_ICONS[item.icon ?? ""] ?? GARDEN01_ICONS.check}
              </div>
              <GenericEditableText
                tag="h3"
                className="g01a-card-title"
                value={item.title ?? ""}
                sectionId={sectionId}
                field={`items[${i}].title`}
              />
              <GenericEditableText
                tag="p"
                className="g01a-card-desc"
                value={item.description ?? ""}
                sectionId={sectionId}
                field={`items[${i}].description`}
              />
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

// ── clean-02-about ─────────────────────────────────────────────────────────────
function AboutClean02({ content, sectionId, tenantSlug, isAdmin }: { content: Record<string, unknown>; sectionId: number; tenantSlug?: string; isAdmin: boolean }) {
  const eyebrow   = String(content.eyebrow   ?? "Poznejte nás");
  const title     = String(content.title     ?? "Lidský přístup a poctivá práce jsou u nás standard");
  const body      = String(content.body      ?? "Za naší firmou stojí stabilní tým lidí, kteří dělají svou práci poctivě a srdcem. Každý zákazník je pro nás důležitý — přistupujeme k němu individuálně, nasloucháme potřebám a hledáme řešení na míru.");
  const ctaText   = String(content.ctaText   ?? "Nezávazně poptat úklid");
  const ctaHref   = String(content.ctaHref   ?? "#kontakt");
  const image     = String(content.image     ?? "/clones/modryzralok/cdn/6839af21457c3480d654bb81_modry_zralok_onas_spolecne.webp");
  const feat1Title = String(content.feat1Title ?? "Zkušený tým");
  const feat1Desc  = String(content.feat1Desc  ?? "Naše dámy na úklid mají praxi, oko pro detail a práci berou s maximální zodpovědností.");
  const feat2Title = String(content.feat2Title ?? "Osobní přístup");
  const feat2Desc  = String(content.feat2Desc  ?? "Přijedeme za Vámi osobně, probereme vaše potřeby a navrhneme řešení na míru.");
  const LOGO    = "/clones/modryzralok/cdn/681ca1020afd3d03c53094e1_modry-zralok-logo.svg";

  const NAVY = "#0e0e53";
  const BLUE = "#019dff";

  const resolve = (href: string) => {
    if (!tenantSlug || href.startsWith("http") || href.startsWith("#")) return href;
    const base = isAdmin ? `/demo/${tenantSlug}/admin` : `/demo/${tenantSlug}`;
    return href === "/" ? base : `${base}${href}`;
  };

  return (
    <>
      <style>{`
        .c02ab-section {
          background: #fff;
          padding: 6rem 5%;
          font-family: 'Onest', sans-serif;
        }
        .c02ab-inner {
          max-width: 80rem; margin: 0 auto;
          display: grid; grid-template-columns: 1fr 1fr;
          gap: 5rem; align-items: center;
        }

        /* left: photo */
        .c02ab-photo-wrap {
          position: relative; border-radius: 16px; overflow: hidden;
          aspect-ratio: 4/3;
          box-shadow: 0 24px 60px -12px rgba(14,14,83,0.18);
        }
        .c02ab-photo-wrap img {
          width: 100%; height: 100%; object-fit: cover; display: block;
        }
        .c02ab-logo-badge {
          position: absolute; bottom: 1.25rem; left: 1.25rem;
          background: #fff; border-radius: 10px;
          padding: 0.6rem 1rem;
          box-shadow: 0 4px 20px rgba(14,14,83,0.15);
        }
        .c02ab-logo-badge img { height: 2rem; width: auto; display: block; }

        /* right: text */
        .c02ab-tagline {
          display: inline-flex; align-items: center; gap: 0.5rem;
          font-size: 0.78rem; font-weight: 700; letter-spacing: 0.12em;
          text-transform: uppercase; color: ${BLUE};
          margin-bottom: 0.85rem;
        }
        .c02ab-tagline-dot { width: 6px; height: 6px; border-radius: 50%; background: ${BLUE}; }
        .c02ab-h2 {
          font-family: 'Bricolage Grotesque', sans-serif;
          font-size: clamp(1.6rem, 3vw, 2.4rem);
          font-weight: 800; color: ${NAVY};
          line-height: 1.15; margin: 0 0 1.25rem;
          letter-spacing: -0.02em;
        }
        .c02ab-h2 span { color: ${BLUE}; }
        .c02ab-body {
          font-size: 1.05rem; color: #3d4d7a;
          line-height: 1.75; margin: 0 0 2rem;
        }
        .c02ab-body strong { color: ${NAVY}; font-weight: 600; }

        /* 2 mini feature items */
        .c02ab-features {
          display: grid; grid-template-columns: 1fr 1fr;
          gap: 1.25rem; margin-bottom: 2.25rem;
        }
        .c02ab-feat {
          border: 1px solid #dfecff; border-radius: 10px;
          padding: 1.1rem 1.25rem;
          background: #f8fbff;
        }
        .c02ab-feat-title {
          font-family: 'Bricolage Grotesque', sans-serif;
          font-size: 0.95rem; font-weight: 700;
          color: ${NAVY}; margin: 0 0 0.35rem;
        }
        .c02ab-feat-desc {
          font-size: 0.85rem; color: #4b5d8a;
          line-height: 1.55; margin: 0;
        }

        .c02ab-cta {
          display: inline-flex; align-items: center; gap: 0.6rem;
          padding: 0.9rem 2rem; border-radius: 9999px;
          background: linear-gradient(100deg, #2bbbff, #1c91ff 40%, #2559e2);
          color: #fff; font-weight: 700; font-size: 0.95rem;
          text-decoration: none;
          box-shadow: 0 8px 28px -8px rgba(28,120,255,0.45);
          transition: box-shadow 0.2s, transform 0.2s;
        }
        .c02ab-cta:hover { transform: translateY(-2px); box-shadow: 0 14px 36px -8px rgba(28,120,255,0.55); }

        @media (max-width: 900px) {
          .c02ab-inner { grid-template-columns: 1fr; gap: 3rem; }
          .c02ab-photo-wrap { aspect-ratio: 16/9; }
        }
        @media (max-width: 500px) {
          .c02ab-features { grid-template-columns: 1fr; }
        }
      `}</style>

      <section className="c02ab-section" id="onas" data-template="clean-02-about">
        <div className="c02ab-inner">

          {/* left: team photo */}
          <div className="c02ab-photo-wrap">
            <img src={image} alt="Tým Clean Garden" loading="lazy" />
            <div className="c02ab-logo-badge">
              <img loading="lazy" src={LOGO} alt="Logo" />
            </div>
          </div>

          {/* right: text */}
          <div>
            <div className="c02ab-tagline">
              <span className="c02ab-tagline-dot" aria-hidden />
              <GenericEditableText sectionId={sectionId} field="eyebrow" value={eyebrow} tag="span" />
            </div>

            <h2 className="c02ab-h2">
              Lidský přístup a poctivá práce jsou{" "}
              <span>u nás standard</span>
            </h2>

            <p className="c02ab-body">
              <GenericEditableText sectionId={sectionId} field="body" value={body} tag="span" />
            </p>

            <div className="c02ab-features">
              <div className="c02ab-feat">
                <p className="c02ab-feat-title"><GenericEditableText sectionId={sectionId} field="feat1Title" value={feat1Title} tag="span" /></p>
                <p className="c02ab-feat-desc"><GenericEditableText sectionId={sectionId} field="feat1Desc" value={feat1Desc} tag="span" /></p>
              </div>
              <div className="c02ab-feat">
                <p className="c02ab-feat-title"><GenericEditableText sectionId={sectionId} field="feat2Title" value={feat2Title} tag="span" /></p>
                <p className="c02ab-feat-desc"><GenericEditableText sectionId={sectionId} field="feat2Desc" value={feat2Desc} tag="span" /></p>
              </div>
            </div>

            <a href={resolve(ctaHref)} data-btn="primary" className="c02ab-cta">
              <svg width="14" height="15" viewBox="0 0 14 15" fill="none" aria-hidden>
                <g clipPath="url(#cab)">
                  <path d="M4.129 9.443H4.949C4.949 8.538 5.685 7.802 6.59 7.802V6.982C5.685 6.982 4.949 6.246 4.949 5.341H4.129C4.129 6.246 3.393 6.982 2.488 6.982V7.802C3.393 7.802 4.129 8.538 4.129 9.443Z" fill="currentColor"/>
                  <path d="M1.668 14.365H2.488C2.488 13.46 3.224 12.724 4.129 12.724V11.904C3.224 11.904 2.488 11.168 2.488 10.264H1.668C1.668 11.168 0.905 11.904 0 11.904V12.724C0.905 12.724 1.668 13.46 1.668 14.365Z" fill="currentColor"/>
                </g>
                <defs><clipPath id="cab"><rect width="14" height="14" fill="white" transform="translate(0 0.5)"/></clipPath></defs>
              </svg>
              <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
            </a>
          </div>

        </div>
      </section>
    </>
  );
}

/* ─── garden-02: About — 2-col personal story + photo stack ───────────────── */
function AboutGarden02({ content, sectionId, tenantSlug, isAdmin }: { content: Record<string, unknown>; sectionId: number; tenantSlug?: string; isAdmin: boolean }) {
  function resolve(href: string) {
    if (!tenantSlug || !href.startsWith("/")) return href;
    if (href === "/") return `/demo/${tenantSlug}${isAdmin ? "/admin" : ""}`;
    return `/demo/${tenantSlug}${isAdmin ? "/admin" : ""}${href}`;
  }

  const title   = (content.title  as string) ?? "";
  const body    = (content.body   as string) ?? "";
  const body2   = (content.body2  as string) ?? "";
  const photos  = ((content.photos as Array<{ url: string; alt: string }>) ?? []).slice(0, 3);
  const cta1Text = (content.cta1Text as string) ?? "";
  const cta1Sub  = (content.cta1Sub  as string) ?? "";
  const cta1Href = (content.cta1Href as string) ?? "/";
  const cta2Text = (content.cta2Text as string) ?? "";
  const cta2Sub  = (content.cta2Sub  as string) ?? "";
  const cta2Href = (content.cta2Href as string) ?? "/";

  const PRIMARY = "#95c11f";
  const DARK    = "#1a2a0a";
  const FONT    = "'Inter', Arial, sans-serif";

  return (
    <>
      <style>{`
        .g02ab-section { background: #fff; padding: 96px 0; font-family: ${FONT}; }
        .g02ab-inner   { max-width: 1140px; margin: 0 auto; padding: 0 24px; display: grid; grid-template-columns: 1fr 1fr; gap: 64px; align-items: center; }
        @media (max-width: 900px) { .g02ab-inner { grid-template-columns: 1fr; gap: 40px; } }
        .g02ab-kicker  { display: inline-flex; align-items: center; gap: 8px; font-size: 0.78rem; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: ${PRIMARY}; margin-bottom: 16px; }
        .g02ab-kicker::before, .g02ab-kicker::after { content: ""; display: block; width: 24px; height: 2px; background: ${PRIMARY}; }
        .g02ab-h2      { font-size: clamp(1.6rem, 3vw, 2.2rem); font-weight: 800; color: ${DARK}; margin: 0 0 20px; line-height: 1.25; }
        .g02ab-p       { font-size: 1rem; color: #555; line-height: 1.75; margin: 0 0 16px; }
        .g02ab-ctas    { display: flex; flex-direction: column; gap: 14px; margin-top: 36px; }
        .g02ab-cta     { display: flex; flex-direction: column; text-decoration: none; padding: 16px 20px; border: 2px solid #e0e0d8; border-radius: 10px; transition: border-color 0.2s, box-shadow 0.2s; }
        .g02ab-cta:hover { border-color: ${PRIMARY}; box-shadow: 0 2px 12px rgba(149,193,31,0.15); }
        .g02ab-cta-label { font-size: 0.95rem; font-weight: 700; color: ${DARK}; }
        .g02ab-cta-sub   { font-size: 0.82rem; color: #888; margin-top: 2px; }
        .g02ab-photos  { position: relative; display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .g02ab-photo-main  { grid-column: 1 / 3; border-radius: 12px; overflow: hidden; aspect-ratio: 4/3; }
        .g02ab-photo-main img  { width: 100%; height: 100%; object-fit: cover; display: block; }
        .g02ab-photo-small { border-radius: 10px; overflow: hidden; aspect-ratio: 1; }
        .g02ab-photo-small img { width: 100%; height: 100%; object-fit: cover; display: block; }
        @media (max-width: 480px) { .g02ab-photo-small { aspect-ratio: 4/3; } }
        .g02ab-badge   { display: inline-flex; align-items: center; gap: 8px; background: ${PRIMARY}; color: #fff; font-size: 0.8rem; font-weight: 700; border-radius: 8px; padding: 8px 14px; margin-top: 12px; }
      `}</style>
      <section className="g02ab-section">
        <div className="g02ab-inner">
          {/* Left — text */}
          <div>
            <div className="g02ab-kicker">O nás</div>
            <h2 className="g02ab-h2"><GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" /></h2>
            <p className="g02ab-p"><GenericEditableText sectionId={sectionId} field="body" value={body} tag="span" /></p>
            {body2 && <p className="g02ab-p"><GenericEditableText sectionId={sectionId} field="body2" value={body2} tag="span" /></p>}
            <div className="g02ab-ctas">
              <a href={resolve(cta1Href)} className="g02ab-cta">
                <span className="g02ab-cta-label"><GenericEditableText sectionId={sectionId} field="cta1Text" value={cta1Text} tag="span" /></span>
                {cta1Sub && <span className="g02ab-cta-sub"><GenericEditableText sectionId={sectionId} field="cta1Sub" value={cta1Sub} tag="span" /></span>}
              </a>
              <a href={resolve(cta2Href)} className="g02ab-cta">
                <span className="g02ab-cta-label"><GenericEditableText sectionId={sectionId} field="cta2Text" value={cta2Text} tag="span" /></span>
                {cta2Sub && <span className="g02ab-cta-sub"><GenericEditableText sectionId={sectionId} field="cta2Sub" value={cta2Sub} tag="span" /></span>}
              </a>
            </div>
          </div>
          {/* Right — photo collage */}
          {photos.length > 0 && (
            <div className="g02ab-photos">
              <div className="g02ab-photo-main">
                <GenericEditableImage sectionId={sectionId} field="photos.0.url" src={photos[0]?.url ?? ""} alt={photos[0]?.alt ?? ""} style={{ width: "100%", height: "100%" }}>
                  <img src={photos[0]?.url ?? ""} alt={photos[0]?.alt ?? ""} loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                </GenericEditableImage>
              </div>
              {photos[1] && (
                <div className="g02ab-photo-small">
                  <GenericEditableImage sectionId={sectionId} field="photos.1.url" src={photos[1].url} alt={photos[1].alt} style={{ width: "100%", height: "100%" }}>
                    <img src={photos[1].url} alt={photos[1].alt} loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                  </GenericEditableImage>
                </div>
              )}
              {photos[2] && (
                <div className="g02ab-photo-small">
                  <GenericEditableImage sectionId={sectionId} field="photos.2.url" src={photos[2].url} alt={photos[2].alt} style={{ width: "100%", height: "100%" }}>
                    <img src={photos[2].url} alt={photos[2].alt} loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                  </GenericEditableImage>
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </>
  );
}

// ── arbo-01-about ─────────────────────────────────────────────────────────────
// 1:1 lesarb.cz:
// - Light #f7f6fd bg, 2-col desktop (text+stats left / photo right)
// - Heading dark navy, body text, 4 stats (value+label), cert logos row
// - CTA green button
// - Mobile: stacked, photo first then text
// ─────────────────────────────────────────────────────────────────────────────
function AboutArbo01({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const title    = String(content.title    ?? "Bezpečnost podložená odborností");
  const subtitle = String(content.subtitle ?? "");
  const body     = String(content.body     ?? "");
  const ctaText  = String(content.ctaText  ?? "Více o Lesarb");
  const ctaHref  = String(content.ctaHref  ?? "#onas");
  const image    = String(content.image    ?? "/clones/lesarb/site/bg-team-desktop.jpg");
  const stats    = (content.stats as Array<{ value: string; label: string }>) ?? [];
  const certLogos = (content.certLogos as Array<{ url: string; alt: string }>) ?? [];

  return (
    <>
      <style>{`
        .arbo01-ab {
          background: #f7f6fd;
          padding: 5rem 1.5rem;
          font-family: "AlanSans","Inter",system-ui,sans-serif;
        }
        .arbo01-ab-inner {
          max-width: 1370px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1fr;
          gap: 3rem;
          align-items: center;
        }
        @media (min-width: 960px) {
          .arbo01-ab-inner { grid-template-columns: 1fr 1fr; }
        }

        /* Photo — mobile: order 0, desktop: order 1 (right) */
        .arbo01-ab-photo {
          order: 0;
          border-radius: 10px;
          overflow: hidden;
          aspect-ratio: 4/3;
        }
        @media (min-width: 960px) {
          .arbo01-ab-photo { order: 1; aspect-ratio: unset; height: 100%; min-height: 480px; }
        }
        .arbo01-ab-photo img {
          width: 100%; height: 100%;
          object-fit: cover;
          display: block;
        }

        /* Text — order 1 mobile, order 0 desktop */
        .arbo01-ab-text {
          order: 1;
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }
        @media (min-width: 960px) { .arbo01-ab-text { order: 0; } }

        .arbo01-ab-title {
          font-size: clamp(1.6rem, 2.8vw, 2.4rem);
          font-weight: 700;
          color: #051d35;
          margin: 0;
          line-height: 1.15;
        }
        .arbo01-ab-subtitle {
          font-size: 1rem;
          color: #009739;
          font-weight: 500;
          margin: 0;
          line-height: 1.5;
        }
        .arbo01-ab-body {
          font-size: 0.95rem;
          color: #3d4d5c;
          line-height: 1.7;
          margin: 0;
        }

        /* Stats grid */
        .arbo01-ab-stats {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1rem 1.5rem;
          padding: 1.25rem 0;
          border-top: 1px solid #e0dff5;
          border-bottom: 1px solid #e0dff5;
        }
        .arbo01-ab-stat-value {
          font-size: 1.6rem;
          font-weight: 700;
          color: #009739;
          line-height: 1;
        }
        .arbo01-ab-stat-label {
          font-size: 0.8rem;
          color: #6b7a8d;
          margin-top: 0.2rem;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }

        /* Cert logos */
        .arbo01-ab-certs {
          display: flex;
          align-items: center;
          gap: 1.5rem;
          flex-wrap: wrap;
        }
        .arbo01-ab-certs img {
          height: 44px;
          width: auto;
          object-fit: contain;
          display: block;
          opacity: 0.85;
        }

        /* CTA */
        .arbo01-ab-cta {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: #009739;
          color: #fff;
          font-size: 0.9rem;
          font-weight: 700;
          text-decoration: none;
          padding: 0.7rem 1.4rem;
          border-radius: 6px;
          align-self: flex-start;
          transition: background 0.2s;
        }
        .arbo01-ab-cta:hover { background: #15472a; }
      `}</style>

      <section className="arbo01-ab" id={String(sectionId)} data-template="arbo-01-about">
        <div className="arbo01-ab-inner">
          {/* Left: text + stats */}
          <div className="arbo01-ab-text">
            <h2 className="arbo01-ab-title">
              <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
            </h2>
            {subtitle && (
              <p className="arbo01-ab-subtitle">
                <GenericEditableText sectionId={sectionId} field="subtitle" value={subtitle} tag="span" />
              </p>
            )}
            {body && (
              <p className="arbo01-ab-body">
                <GenericEditableText sectionId={sectionId} field="body" value={body} tag="span" />
              </p>
            )}

            {stats.length > 0 && (
              <div className="arbo01-ab-stats">
                {stats.map((s, i) => (
                  <div key={i}>
                    <div className="arbo01-ab-stat-value">
                      <GenericEditableText sectionId={sectionId} field={`stats.${i}.value`} value={s.value} tag="span" />
                    </div>
                    <div className="arbo01-ab-stat-label">
                      <GenericEditableText sectionId={sectionId} field={`stats.${i}.label`} value={s.label} tag="span" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {certLogos.length > 0 && (
              <div className="arbo01-ab-certs">
                {certLogos.map((logo, i) => (
                  <img loading="lazy" key={i} src={logo.url} alt={logo.alt} />
                ))}
              </div>
            )}

            <a href={ctaHref} data-btn="primary" className="arbo01-ab-cta">
              <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
              <span aria-hidden="true">→</span>
            </a>
          </div>

          {/* Right: photo */}
          <div className="arbo01-ab-photo">
            <GenericEditableImage sectionId={sectionId} field="image" src={image} alt="Tým" style={{}}>
              <img loading="lazy" src={image} alt="Tým" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
            </GenericEditableImage>
          </div>
        </div>
      </section>
    </>
  );
}

// ── ddd-01-about ──────────────────────────────────────────────────────────────
// 1:1 deratizacepraha.com:
// - Bílé bg, py-16 sekce
// - 2-col (flex row): LEFT = koláž 2 fotek (2. offset margin-left:30% + box-shadow)
//   RIGHT = eyebrow uppercase #0c93eb letter-spacing + H2 uppercase #015ba3 + 2 odst. + CTA pill
// - CTA: #0c93eb bg, bílý text, border-radius 25px, uppercase, Figtree
// ─────────────────────────────────────────────────────────────────────────────
function AboutDdd01({ content, sectionId, tenantSlug, isAdmin }: Omit<Props, "variant">) {
  const PRIMARY  = "#0c93eb";
  const DARK     = "#015ba3";
  const FONT     = "'Figtree', system-ui, sans-serif";

  const eyebrow  = String(content.eyebrow  ?? "DDD služby se zárukou kvality");
  const title    = String(content.title    ?? "Profesionální deratizace a dezinsekce");
  const body     = String(content.body     ?? "Služby, které naše společnost poskytuje, se opírají o zásadu dlouhodobé spokojenosti zákazníků a jsou založeny na bohatých odborných znalostech a mnohaleté praxi našich techniků, kteří mají zákonné oprávnění vykonávat práce v oblasti DDD.");
  const body2    = String(content.body2    ?? "Cílem je poskytovat efektivní a kvalitní řešení, která přinášejí nejen ekonomický užitek našim zákazníkům.");
  const ctaText  = String(content.ctaText  ?? "Naše služby");
  const ctaHref  = String(content.ctaHref  ?? "#sluzby");
  const images   = (content.images as Array<{ url: string; alt?: string }>) ?? [];
  const img1     = images[0] ?? { url: "/clones/deratizace/storage/promo/large/f7b3d8c58916308fb8b6e9f3d0cd5b1e.webp", alt: "Dezinsekce štěnic" };
  const img2     = images[1] ?? { url: "/clones/deratizace/storage/promo/large/767450d489c79107d2bcb36ec2d63609.webp", alt: "Deratizace hlodavců" };

  const resolve  = (href: string) => resolveDemoHref(href, tenantSlug, isAdmin);

  return (
    <>
      <style>{`
        .ddd01a-wrap {
          font-family: ${FONT};
          background: #ffffff;
          padding: 4.5rem 1.5rem;
        }
        .ddd01a-inner {
          max-width: 80rem;
          margin: 0 auto;
        }
        .ddd01a-grid {
          display: flex;
          flex-direction: row;
          align-items: center;
          gap: clamp(2rem, 5vw, 5rem);
        }
        /* LEFT — koláž */
        .ddd01a-collage {
          flex: 0 0 clamp(260px, 38%, 440px);
          max-width: 27.5rem;
          display: flex;
          flex-direction: column;
          gap: 0;
        }
        .ddd01a-collage-img {
          display: block;
          width: 70%;
          height: auto;
          box-shadow: 4px 4px 17px rgba(0,0,0,0.21);
          margin-left: 30%;
        }
        .ddd01a-collage-img:first-child {
          margin-left: 0;
          margin-bottom: -2rem;
          position: relative;
          z-index: 1;
        }
        /* RIGHT — text */
        .ddd01a-text {
          flex: 1;
          text-align: left;
        }
        .ddd01a-eyebrow {
          display: inline-block;
          color: ${PRIMARY};
          font-size: clamp(0.84rem, 0.32vw + 0.77rem, 1.06rem);
          font-weight: 400;
          letter-spacing: 0.375rem;
          text-transform: uppercase;
          margin-bottom: 0.75rem;
          line-height: 1.4;
        }
        .ddd01a-h2 {
          color: ${DARK};
          font-size: clamp(1.625rem, 0.89vw + 1.45rem, 2.25rem);
          font-weight: 700;
          line-height: 1.33;
          margin: 0 0 1.25rem;
          text-transform: uppercase;
          word-spacing: 0.125em;
        }
        .ddd01a-body {
          color: #3a3a3a;
          font-size: 1rem;
          line-height: 1.7;
          margin: 0 0 1rem;
        }
        .ddd01a-cta {
          display: inline-block;
          background: ${PRIMARY};
          color: #ffffff;
          text-decoration: none;
          font-size: 0.9375rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          padding: 0.85em 1.5em 0.7em;
          border-radius: 25px;
          border: 1px solid ${PRIMARY};
          margin-top: 1.5rem;
          transition: background 0.15s, border-color 0.15s;
        }
        .ddd01a-cta:hover { background: ${DARK}; border-color: ${DARK}; }

        @media (max-width: 768px) {
          .ddd01a-grid { flex-direction: column; }
          .ddd01a-collage { max-width: 100%; width: 100%; }
          .ddd01a-collage-img { width: 65%; }
          .ddd01a-collage-img:first-child { margin-bottom: -1.5rem; }
        }
      `}</style>

      <section className="ddd01a-wrap" id="about" data-template="ddd-01-about">
        <div className="ddd01a-inner">
          <div className="ddd01a-grid">

            {/* LEFT: koláž 2 fotek */}
            <div className="ddd01a-collage">
              <GenericEditableImage sectionId={sectionId} field="images.0.url" src={img1.url} alt={img1.alt ?? ""} style={{}}>
                <img className="ddd01a-collage-img" src={img1.url} alt={img1.alt ?? ""} loading="lazy" decoding="async" />
              </GenericEditableImage>
              <GenericEditableImage sectionId={sectionId} field="images.1.url" src={img2.url} alt={img2.alt ?? ""} style={{}}>
                <img className="ddd01a-collage-img" src={img2.url} alt={img2.alt ?? ""} loading="lazy" decoding="async" />
              </GenericEditableImage>
            </div>

            {/* RIGHT: text */}
            <div className="ddd01a-text">
              <span className="ddd01a-eyebrow">
                <GenericEditableText sectionId={sectionId} field="eyebrow" value={eyebrow} tag="span" />
              </span>
              <h2 className="ddd01a-h2">
                <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
              </h2>
              <p className="ddd01a-body">
                <GenericEditableText sectionId={sectionId} field="body" value={body} tag="span" />
              </p>
              {body2 && (
                <p className="ddd01a-body">
                  <GenericEditableText sectionId={sectionId} field="body2" value={body2} tag="span" />
                </p>
              )}
              <a href={resolve(ctaHref)} data-btn="primary" className="ddd01a-cta">
                <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
              </a>
            </div>

          </div>
        </div>
      </section>
    </>
  );
}

// ── hotel-01-about ────────────────────────────────────────────────────────────
function AboutHotel01({ content, sectionId, isAdmin }: { content: Record<string, unknown>; sectionId: number; tenantSlug?: string; isAdmin: boolean }) {
  const c        = (content ?? {}) as Record<string, any>;
  const eyebrow  = c.eyebrow  ?? "O hotelu";
  const title    = c.title    ?? "Elegance Art Nouveau v centru Prahy";
  const body     = c.body     ?? "";
  const body2    = c.body2    ?? "";
  const cta1Text = c.cta1Text ?? "O hotelu";
  const cta1Href = c.cta1Href ?? "#o-hotelu";
  const cta2Text = c.cta2Text ?? "Naše pokoje";
  const cta2Href = c.cta2Href ?? "#pokoje";
  const imageUrl = c.imageUrl ?? "";
  const imageAlt = c.imageAlt ?? "";

  const resolve = (href: string) => (isAdmin ? "#" : href ?? "#");

  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;1,400&family=Poppins:wght@300;400;500&display=swap" />
      <style>{`        .h01about {
          background: #fff;
          padding: clamp(60px,8vw,110px) clamp(20px,5vw,80px);
          font-family: 'Poppins', sans-serif;
        }
        .h01about-inner {
          max-width: 1200px; margin: 0 auto;
          display: grid; grid-template-columns: 1fr 1fr; gap: 80px; align-items: center;
        }
        .h01about-eyebrow {
          font-size: 11px; letter-spacing: 0.22em; text-transform: uppercase;
          color: #a98763; margin: 0 0 18px;
          font-family: 'Poppins', sans-serif; font-weight: 500;
        }
        .h01about-title {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: clamp(26px, 3vw, 40px); font-weight: 400; color: #3e3e3e;
          line-height: 1.25; margin: 0 0 28px;
        }
        .h01about-body {
          font-size: 15px; line-height: 1.85; color: #5D5D5D;
          font-weight: 300; margin: 0 0 18px;
        }
        .h01about-ctas {
          display: flex; flex-wrap: wrap; gap: 14px; margin-top: 36px;
        }
        .h01about-cta1 {
          display: inline-flex; align-items: center; justify-content: center;
          border: 1.5px solid #a98763; color: #a98763;
          font-family: 'Playfair Display', Georgia, serif;
          font-size: 12px; letter-spacing: 0.14em; text-transform: uppercase;
          padding: 12px 32px; text-decoration: none; transition: background 0.2s, color 0.2s;
        }
        .h01about-cta1:hover { background: #a98763; color: #fff; }
        .h01about-cta2 {
          display: inline-flex; align-items: center; justify-content: center;
          background: #879B32; color: #fff;
          font-family: 'Playfair Display', Georgia, serif;
          font-size: 12px; letter-spacing: 0.14em; text-transform: uppercase;
          padding: 12px 32px; text-decoration: none; transition: background 0.2s;
        }
        .h01about-cta2:hover { background: #6a7a28; }
        .h01about-img-wrap {
          position: relative; width: 100%; aspect-ratio: 4/5; overflow: hidden;
        }
        .h01about-img {
          width: 100%; height: 100%; object-fit: cover; display: block;
          transition: transform 0.6s ease;
        }
        .h01about-img-wrap:hover .h01about-img { transform: scale(1.03); }
        .h01about-text { position: relative; padding-left: 28px; }
        .h01about-text::before {
          content: ''; position: absolute; left: 0; top: 8px;
          width: 3px; height: 56px; background: #a98763;
        }
        @media (max-width: 860px) {
          .h01about-inner { grid-template-columns: 1fr; gap: 40px; }
          .h01about-text { padding-left: 0; }
          .h01about-text::before { display: none; }
          .h01about-img-wrap { aspect-ratio: 16/9; }
        }
      `}</style>

      <section className="h01about" id="o-hotelu" data-template="hotel-01-about">
        <div className="h01about-inner">
          <div className="h01about-text">
            <p className="h01about-eyebrow">
              <GenericEditableText sectionId={sectionId} field="eyebrow" value={eyebrow} tag="span" />
            </p>
            <h2 className="h01about-title">
              <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
            </h2>
            <p className="h01about-body">
              <GenericEditableText sectionId={sectionId} field="body" value={body} tag="span" />
            </p>
            {body2 && (
              <p className="h01about-body">
                <GenericEditableText sectionId={sectionId} field="body2" value={body2} tag="span" />
              </p>
            )}
            <div className="h01about-ctas">
              <a href={resolve(cta1Href)} className="h01about-cta1">
                <GenericEditableText sectionId={sectionId} field="cta1Text" value={cta1Text} tag="span" />
              </a>
              <a href={resolve(cta2Href)} className="h01about-cta2">
                <GenericEditableText sectionId={sectionId} field="cta2Text" value={cta2Text} tag="span" />
              </a>
            </div>
          </div>

          <div className="h01about-img-wrap">
            <GenericEditableImage sectionId={sectionId} field="imageUrl" src={imageUrl || "/placeholder.jpg"} alt={imageAlt} style={{ width: "100%", height: "100%" }}>
              <img src={imageUrl || "/placeholder.jpg"} alt={imageAlt} className="h01about-img" loading="lazy" />
            </GenericEditableImage>
          </div>
        </div>
      </section>
    </>
  );
}

// ── hotel-02-about ────────────────────────────────────────────────────────────
function AboutHotel02({ content, sectionId, isAdmin }: { content: Record<string, unknown>; sectionId: number; tenantSlug?: string; isAdmin: boolean }) {
  const c       = (content ?? {}) as Record<string, any>;
  const eyebrow = c.eyebrow ?? "O hotelu";
  const title   = c.title   ?? "Vaše ideální místo pro relax i práci nedaleko přehrady";
  const body    = c.body    ?? "";
  const body2   = c.body2   ?? "";
  const imageUrl = c.imageUrl ?? "";
  const imageAlt = c.imageAlt ?? "";

  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=Montserrat:wght@300;400;500&display=swap" />
      <style>{`        .h02ab {
          background: #fff;
          padding: clamp(70px,9vw,120px) clamp(20px,5vw,80px);
          font-family: 'Montserrat', sans-serif;
        }
        .h02ab-inner {
          max-width: 1240px; margin: 0 auto;
          display: grid; grid-template-columns: 5fr 6fr; gap: clamp(48px,6vw,100px);
          align-items: center;
        }
        /* Image side */
        .h02ab-img-wrap {
          position: relative; width: 100%; aspect-ratio: 4/5;
          overflow: hidden;
        }
        .h02ab-img-wrap::before {
          content: ''; position: absolute;
          inset: -18px -18px auto auto;
          width: 45%; height: 45%;
          border: 1.5px solid #96A1AC;
          z-index: 0; pointer-events: none;
        }
        .h02ab-img {
          position: relative; z-index: 1;
          width: 100%; height: 100%; object-fit: cover; display: block;
          transition: transform 0.65s ease;
        }
        .h02ab-img-wrap:hover .h02ab-img { transform: scale(1.04); }
        /* Text side */
        .h02ab-eyebrow {
          font-family: 'Montserrat', sans-serif;
          font-size: 10px; font-weight: 500; letter-spacing: 0.28em;
          text-transform: uppercase; color: #96A1AC;
          margin: 0 0 20px; display: block;
        }
        .h02ab-title {
          font-family: 'Cormorant Garamond', Georgia, serif;
          font-size: clamp(28px, 3.2vw, 46px);
          font-weight: 300; font-style: italic;
          color: #1a2332; line-height: 1.2;
          margin: 0 0 32px;
        }
        .h02ab-rule {
          width: 48px; height: 1.5px; background: #96A1AC;
          margin: 0 0 28px; border: none;
        }
        .h02ab-body {
          font-size: 15px; line-height: 1.9; color: #4b5563;
          font-weight: 300; margin: 0 0 18px;
        }
        @media (max-width: 860px) {
          .h02ab-inner { grid-template-columns: 1fr; }
          .h02ab-img-wrap { aspect-ratio: 16/9; order: -1; }
          .h02ab-img-wrap::before { display: none; }
        }
      `}</style>

      <section className="h02ab" id="o-hotelu" data-template="hotel-02-about">
        <div className="h02ab-inner">
          <div className="h02ab-img-wrap">
            <GenericEditableImage sectionId={sectionId} field="imageUrl" src={imageUrl || "/placeholder.jpg"} alt={imageAlt} style={{ width: "100%", height: "100%" }}>
              <img src={imageUrl || "/placeholder.jpg"} alt={imageAlt} className="h02ab-img" loading="lazy" />
            </GenericEditableImage>
          </div>

          <div className="h02ab-text">
            <span className="h02ab-eyebrow">
              <GenericEditableText sectionId={sectionId} field="eyebrow" value={eyebrow} tag="span" />
            </span>
            <h2 className="h02ab-title">
              <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
            </h2>
            <hr className="h02ab-rule" />
            <p className="h02ab-body">
              <GenericEditableText sectionId={sectionId} field="body" value={body} tag="span" />
            </p>
            {body2 && (
              <p className="h02ab-body">
                <GenericEditableText sectionId={sectionId} field="body2" value={body2} tag="span" />
              </p>
            )}
          </div>
        </div>
      </section>
    </>
  );
}

// ── chalet-01-about ───────────────────────────────────────────────────────────
function AboutChalet01({ content, sectionId, tenantSlug, isAdmin }: { content: Record<string, unknown>; sectionId: number; tenantSlug?: string; isAdmin: boolean }) {
  const c = (content ?? {}) as Record<string, any>;
  const kicker  = String(c.kicker  ?? "Vítejte u nás v Krkonoších");
  const title   = String(c.title   ?? "Horský chalet pro 19 hostů na prahu přírody, hor a lesů");
  const body    = String(c.body    ?? "");
  const note    = String(c.note    ?? "");
  const ctaText = String(c.ctaText ?? "Zjistit více");
  const ctaHref = String(c.ctaHref ?? "#galerie");
  const image   = String(c.image   ?? "/clones/chaletmilada/templates/yootheme/cache/9c/ADR_Milada_Mala_Upa_BoysPlayNice_01-9ca458d5.jpeg");

  const BEIGE  = "#c0bbad";
  const DARK   = "#1e2329";
  const SURF   = "#f5f3f0";
  const FONT_H = "'Josefin Sans', system-ui, sans-serif";
  const FONT_B = "'Plus Jakarta Sans', system-ui, sans-serif";

  const resolve = (href: string) => resolveDemoHref(href, tenantSlug, isAdmin);

  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Josefin+Sans:wght@300;400;600&family=Plus+Jakarta+Sans:wght@400;500;600&display=swap" />
      <style>{`        .ch01ab {
          background: ${SURF};
          padding: clamp(4rem, 8vw, 7rem) 1.5rem;
        }
        .ch01ab-inner {
          max-width: 1200px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: clamp(2.5rem, 6vw, 6rem);
          align-items: center;
        }
        /* ── left text ── */
        .ch01ab-text {}
        .ch01ab-kicker {
          display: block;
          font-family: ${FONT_H};
          font-size: 0.68rem;
          font-weight: 400;
          letter-spacing: 0.28em;
          text-transform: uppercase;
          color: ${BEIGE};
          margin-bottom: 1rem;
        }
        .ch01ab-title {
          font-family: ${FONT_H};
          font-size: clamp(1.5rem, 3vw, 2.2rem);
          font-weight: 300;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: ${DARK};
          line-height: 1.3;
          margin: 0 0 1.5rem;
        }
        .ch01ab-divider {
          width: 40px;
          height: 1px;
          background: ${BEIGE};
          margin-bottom: 1.5rem;
        }
        .ch01ab-body {
          font-family: ${FONT_B};
          font-size: 0.95rem;
          line-height: 1.8;
          color: #555;
          margin: 0 0 1.25rem;
        }
        .ch01ab-note {
          font-family: ${FONT_B};
          font-size: 0.85rem;
          line-height: 1.7;
          color: #888;
          font-style: italic;
          margin: 0 0 2rem;
          padding-left: 1rem;
          border-left: 2px solid ${BEIGE};
        }
        .ch01ab-cta {
          display: inline-block;
          padding: 0.72rem 2rem;
          border: 1.5px solid ${DARK};
          color: ${DARK};
          font-family: ${FONT_H};
          font-size: 0.7rem;
          font-weight: 600;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          text-decoration: none;
          transition: background 0.22s, color 0.22s;
        }
        .ch01ab-cta:hover {
          background: ${DARK};
          color: #fff;
        }
        /* ── right image ── */
        .ch01ab-img-wrap {
          position: relative;
          aspect-ratio: 4/5;
          overflow: hidden;
        }
        .ch01ab-img-wrap img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          transition: transform 0.6s ease;
        }
        .ch01ab-img-wrap:hover img { transform: scale(1.03); }
        /* decorative corner accent */
        .ch01ab-img-wrap::after {
          content: '';
          position: absolute;
          bottom: -12px;
          right: -12px;
          width: 60px;
          height: 60px;
          border-bottom: 2px solid ${BEIGE};
          border-right: 2px solid ${BEIGE};
          pointer-events: none;
        }
        @media (max-width: 768px) {
          .ch01ab-inner {
            grid-template-columns: 1fr;
          }
          .ch01ab-img-wrap {
            aspect-ratio: 16/9;
            order: -1;
          }
          .ch01ab-img-wrap::after { display: none; }
        }
      `}</style>

      <section className="ch01ab" id="ubytovani" data-template="chalet-01-about">
        <div className="ch01ab-inner">
          <div className="ch01ab-text">
            <span className="ch01ab-kicker">
              <GenericEditableText sectionId={sectionId} field="kicker" value={kicker} tag="span" />
            </span>
            <h2 className="ch01ab-title">
              <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
            </h2>
            <div className="ch01ab-divider" />
            {body && (
              <p className="ch01ab-body">
                <GenericEditableText sectionId={sectionId} field="body" value={body} tag="span" />
              </p>
            )}
            {note && (
              <p className="ch01ab-note">
                <GenericEditableText sectionId={sectionId} field="note" value={note} tag="span" />
              </p>
            )}
            <a href={resolve(ctaHref)} data-btn="primary" className="ch01ab-cta">
              <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
            </a>
          </div>

          <div className="ch01ab-img-wrap">
            <GenericEditableImage
              sectionId={sectionId}
              field="image"
              src={image}
              alt={title}
              className="relative overflow-hidden w-full h-full"
              style={{}}
            >
              <img src={image} alt={title} loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </GenericEditableImage>
          </div>
        </div>
      </section>
    </>
  );
}

// ── malir-02-about ────────────────────────────────────────────────────────────
// 1:1 malirstvi-bastar.cz — sekce důvěrobody:
// - #fafafa bg, py-14
// - 5 sloupců horizontálně: oranžová (#ff914d) SVG ikona 40px + Poppins 600 label uppercase
// - Mobile: 2–3 sloupce (wrap)
// ─────────────────────────────────────────────────────────────────────────────
function AboutMalir02({ content, sectionId, isAdmin }: { content: Record<string, unknown>; sectionId: number; isAdmin?: boolean }) {
  const ORANGE = "#ff914d";
  const DARK   = "#232323";

  type Item = { icon: string; label: string };
  const defaultItems: Item[] = [
    { icon: "target",     label: "Pečlivost" },
    { icon: "person",     label: "Profesionalita" },
    { icon: "broom",      label: "Čistota" },
    { icon: "clock",      label: "Rychlost" },
    { icon: "handshake",  label: "Férová cena" },
  ];
  const items: Item[] = Array.isArray(content.items) && (content.items as unknown[]).length
    ? (content.items as Item[])
    : defaultItems;

  const icons: Record<string, React.ReactNode> = {
    target: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="40" height="40">
        <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>
      </svg>
    ),
    person: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="40" height="40">
        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
      </svg>
    ),
    broom: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="40" height="40">
        <path d="M2 22l10-10"/><path d="M16 8l-8 8 6 2 4-4-2-6z"/><path d="M16 8l2-2 2 2-2 2-2-2z"/>
      </svg>
    ),
    clock: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="40" height="40">
        <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
      </svg>
    ),
    handshake: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="40" height="40">
        <path d="M11 17l-5-5 1.5-1.5L11 14l7.5-7.5L20 8z"/><path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
      </svg>
    ),
  };

  return (
    <>
      <style>{`
        .m02about-item { display: flex; flex-direction: column; align-items: center; text-align: center; padding: 28px 16px; transition: background 0.2s; border-radius: 4px; }
        .m02about-item:hover { background: rgba(255,145,77,0.07); }
        @media (max-width: 600px) {
          .m02about-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (min-width: 601px) and (max-width: 900px) {
          .m02about-grid { grid-template-columns: repeat(3, 1fr) !important; }
        }
      `}</style>
      <section style={{ background: "#fafafa", padding: "56px 0" }} data-template="malir-02">
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px" }}>
          <div className="m02about-grid" style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 8 }}>
            {items.map((item, i) => (
              <div key={i} className="m02about-item">
                <span style={{ color: ORANGE, marginBottom: 14, display: "block" }}>
                  {icons[item.icon] ?? icons.target}
                </span>
                <GenericEditableText sectionId={sectionId} field={`items.${i}.label`} value={item.label} tag="span">
                  <span style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 600, fontSize: 13, color: DARK, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                    {item.label}
                  </span>
                </GenericEditableText>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

// ── photo-01-about ────────────────────────────────────────────────────────────
// 1:1 zbiralova.cz: cream bg, 2-col (portrait foto vlevo, bio text vpravo)
function AboutPhoto01({ content, sectionId }: { content: Record<string, unknown>; sectionId: number; tenantSlug?: string; isAdmin?: boolean }) {
  const eyebrow  = String(content.eyebrow  ?? "O mně");
  const title    = String(content.title    ?? "");
  const subtitle = String(content.subtitle ?? "");
  const body     = String(content.body     ?? "");
  const body2    = String(content.body2    ?? "");
  const imageUrl = String(content.imageUrl ?? "");
  const imageAlt = String(content.imageAlt ?? title);

  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500&family=Inter:wght@300;400;500&display=swap" />
      <style>{`        .ph01ab {
          background: #f5f0eb;
          padding: 80px 0;
        }
        .ph01ab-inner {
          max-width: 90%;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 64px;
          align-items: center;
        }
        .ph01ab-img-wrap {
          position: relative;
          overflow: hidden;
        }
        .ph01ab-img-wrap img {
          width: 100%;
          height: auto;
          display: block;
          object-fit: cover;
        }
        .ph01ab-text {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }
        .ph01ab-eyebrow {
          font-family: 'Inter', sans-serif;
          font-size: 0.75rem;
          font-weight: 500;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: #8b7355;
          margin: 0;
        }
        .ph01ab-title {
          font-family: 'Cinzel', Georgia, serif;
          font-size: 2rem;
          font-weight: 400;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: #1a1a1a;
          margin: 0;
          line-height: 1.25;
        }
        .ph01ab-divider {
          width: 40px;
          height: 1px;
          background: #8b7355;
          border: none;
          margin: 0;
        }
        .ph01ab-body {
          font-family: 'Inter', sans-serif;
          font-size: 1rem;
          line-height: 1.8;
          color: #4a4a4a;
          margin: 0;
        }
        @media (max-width: 860px) {
          .ph01ab-inner {
            grid-template-columns: 1fr;
            gap: 40px;
            max-width: 92%;
          }
          .ph01ab { padding: 56px 0; }
          .ph01ab-title { font-size: 1.5rem; }
        }
      `}</style>

      <section className="ph01ab" id="o-mne" data-template="photo-01-about">
        <div className="ph01ab-inner">
          {/* Portrait photo */}
          <div className="ph01ab-img-wrap">
            <GenericEditableImage sectionId={sectionId} field="imageUrl" src={imageUrl} alt={imageAlt}>
              <img src={imageUrl} alt={imageAlt} loading="lazy" />
            </GenericEditableImage>
          </div>

          {/* Bio text */}
          <div className="ph01ab-text">
            <GenericEditableText sectionId={sectionId} field="eyebrow" value={eyebrow} tag="p">
              <p className="ph01ab-eyebrow">{eyebrow}</p>
            </GenericEditableText>

            <GenericEditableText sectionId={sectionId} field="title" value={title} tag="h2">
              <h2 className="ph01ab-title">{title}</h2>
            </GenericEditableText>

            {subtitle && (
              <GenericEditableText sectionId={sectionId} field="subtitle" value={subtitle} tag="p">
                <p className="ph01ab-body" style={{ fontStyle: "italic", color: "#8b7355", marginTop: "-0.5rem" }}>{subtitle}</p>
              </GenericEditableText>
            )}

            <hr className="ph01ab-divider" />

            <GenericEditableText sectionId={sectionId} field="body" value={body} tag="p">
              <p className="ph01ab-body">{body}</p>
            </GenericEditableText>

            {body2 && (
              <GenericEditableText sectionId={sectionId} field="body2" value={body2} tag="p">
                <p className="ph01ab-body">{body2}</p>
              </GenericEditableText>
            )}
          </div>
        </div>
      </section>
    </>
  );
}


// ── events-01-process ─────────────────────────────────────────────────────────
// Prémiová event-agentura: 4-col dark grid, Playfair italic gold číslice (01→04),
// gold hairline connector mezi kroky, hover: ring kolem číslice + gold title,
// stagger fade-in reveal (anti-flash na kroky). Awwwards polish 2026-07-01.
// ─────────────────────────────────────────────────────────────────────────────
function ProcessEvents01({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const GOLD = "#d4b896";
  const DARK = "#0a0a0a";
  const showHeader = content.showHeader !== false;
  const eyebrow    = String(content.eyebrow ?? "Náš postup");
  const title      = String(content.title   ?? "Od myšlenky k nezapomenutelné akci");
  const steps      = (content.steps as Array<{ number: string; title: string; description: string }>) ?? [];

  return (
    <>
      <style>{`
        .ev01proc {
          position: relative;
          padding: 140px 40px 140px;
          background: ${DARK};
          overflow: hidden;
        }
        .ev01proc::before {
          content: "";
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent 0%, rgba(212,184,150,0.14) 50%, transparent 100%);
        }
        .ev01proc-inner { max-width: 1240px; margin: 0 auto; }
        .ev01proc-head { text-align: center; margin-bottom: 100px; }
        .ev01proc-eyebrow {
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
        .ev01proc-eyebrow::before,
        .ev01proc-eyebrow::after {
          content: "";
          display: block;
          width: 44px;
          height: 1px;
          background: linear-gradient(90deg, transparent 0%, ${GOLD} 100%);
        }
        .ev01proc-eyebrow::after {
          background: linear-gradient(90deg, ${GOLD} 0%, transparent 100%);
        }
        .ev01proc-h2 {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: clamp(34px, 4vw, 56px);
          font-weight: 400;
          margin: 0;
          color: #fff;
          letter-spacing: -0.01em;
          line-height: 1.1;
          max-width: 780px;
          margin-left: auto;
          margin-right: auto;
        }
        .ev01proc-grid {
          position: relative;
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 32px;
          color: #fff;
        }
        .ev01proc-connector {
          position: absolute;
          top: 46px;
          left: 12%;
          right: 12%;
          height: 1px;
          background: linear-gradient(90deg, transparent 0%, rgba(212,184,150,0.35) 15%, rgba(212,184,150,0.35) 85%, transparent 100%);
          z-index: 0;
          pointer-events: none;
        }
        .ev01proc-step {
          position: relative;
          padding-top: 8px;
          opacity: 0;
          transform: translateY(20px);
          animation: ev01procReveal 1s cubic-bezier(.32,.72,0,1) forwards;
        }
        .ev01proc-step:nth-child(1) { animation-delay: 0.15s; }
        .ev01proc-step:nth-child(2) { animation-delay: 0.3s; }
        .ev01proc-step:nth-child(3) { animation-delay: 0.45s; }
        .ev01proc-step:nth-child(4) { animation-delay: 0.6s; }
        @keyframes ev01procReveal {
          to { opacity: 1; transform: translateY(0); }
        }
        .ev01proc-num-wrap {
          position: relative;
          width: 88px;
          height: 88px;
          margin-bottom: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: ${DARK};
        }
        .ev01proc-num-ring {
          position: absolute;
          inset: 0;
          border-radius: 50%;
          border: 1px solid rgba(212,184,150,0.18);
          transform: scale(0.85);
          opacity: 0;
          transition: transform 0.6s cubic-bezier(.32,.72,0,1), opacity 0.6s cubic-bezier(.32,.72,0,1), border-color 0.6s cubic-bezier(.32,.72,0,1);
        }
        .ev01proc-step:hover .ev01proc-num-ring {
          transform: scale(1);
          opacity: 1;
          border-color: rgba(212,184,150,0.5);
        }
        .ev01proc-num {
          font-family: 'Playfair Display', Georgia, serif;
          font-style: italic;
          font-size: 68px;
          font-weight: 400;
          color: ${GOLD};
          line-height: 1;
          letter-spacing: -0.02em;
          transition: color 0.5s cubic-bezier(.32,.72,0,1), transform 0.5s cubic-bezier(.32,.72,0,1);
        }
        .ev01proc-step:hover .ev01proc-num {
          color: #f0d9b8;
          transform: translateY(-2px);
        }
        .ev01proc-step h3 {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: 22px;
          font-weight: 500;
          margin: 0 0 16px;
          color: #fff;
          letter-spacing: -0.005em;
          transition: color 0.4s cubic-bezier(.32,.72,0,1);
        }
        .ev01proc-step:hover h3 { color: ${GOLD}; }
        .ev01proc-step p {
          font-family: 'Inter', sans-serif;
          font-size: 14.5px;
          color: rgba(255,255,255,0.6);
          line-height: 1.75;
          margin: 0;
          letter-spacing: 0.1px;
        }
        @media (max-width: 900px) {
          .ev01proc { padding: 90px 24px 90px; }
          .ev01proc-grid { grid-template-columns: repeat(2, 1fr); gap: 48px; }
          .ev01proc-connector { display: none; }
          .ev01proc-head { margin-bottom: 60px; }
        }
        @media (max-width: 480px) {
          .ev01proc-grid { grid-template-columns: 1fr; gap: 40px; }
        }
      `}</style>
      <section className="ev01proc" id="proces" data-template="events-01-process">
        <div className="ev01proc-inner">
          {showHeader && (
            <div className="ev01proc-head">
              {eyebrow && (
                <div className="ev01proc-eyebrow">
                  <GenericEditableText sectionId={sectionId} field="eyebrow" value={eyebrow} tag="span">{eyebrow}</GenericEditableText>
                </div>
              )}
              {title && (
                <GenericEditableText sectionId={sectionId} field="title" value={title} tag="h2">
                  <h2 className="ev01proc-h2">{title}</h2>
                </GenericEditableText>
              )}
            </div>
          )}
          <div className="ev01proc-grid">
            <div className="ev01proc-connector" aria-hidden="true" />
            {steps.map((step, i) => (
              <div className="ev01proc-step" key={i}>
                <div className="ev01proc-num-wrap">
                  <div className="ev01proc-num-ring" />
                  <span className="ev01proc-num">
                    <GenericEditableText sectionId={sectionId} field={`steps.${i}.number`} value={step.number} tag="span">{step.number}</GenericEditableText>
                  </span>
                </div>
                <GenericEditableText sectionId={sectionId} field={`steps.${i}.title`} value={step.title} tag="h3"><h3>{step.title}</h3></GenericEditableText>
                <GenericEditableText sectionId={sectionId} field={`steps.${i}.description`} value={step.description} tag="p"><p>{step.description}</p></GenericEditableText>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

// ── restaurant-04-about ───────────────────────────────────────────────────────
// 2-col layout: text vlevo, foto vpravo. Tmavé pozadí #0d1f0a.
// Červený kicker, Fraunces italic H2, Nunito Sans body, červené CTA tlačítko.
// ─────────────────────────────────────────────────────────────────────────────
function AboutRestaurant04({ content, sectionId, tenantSlug, isAdmin }: { content: Record<string, unknown>; sectionId: number; tenantSlug?: string; isAdmin?: boolean }) {
  const tagline  = String(content.tagline  ?? "Rodinná restaurace");
  const title    = String(content.title    ?? "Autentická italská kuchyně,\npečlivě vybrané suroviny.");
  const body     = String(content.body     ?? "");
  const body2    = String((content as any).body2 ?? "");
  const ctaText  = String(content.ctaText  ?? "Více o nás");
  const ctaHref  = String(content.ctaHref  ?? "/o-nas");
  const image    = String(content.image    ?? "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&h=600&fit=crop&fm=webp&q=85");

  const DARK  = "#0d1f0a";
  const SURF  = "#152d11";
  const RED   = "#c41c1c";
  const CREAM = "#f5f0e8";
  const MUTED = "#8fa889";
  const SERIF = "'Fraunces', Georgia, 'Times New Roman', serif";
  const SANS  = "'Nunito Sans', 'Helvetica Neue', Arial, sans-serif";

  const resolve = (href: string) => {
    if (!tenantSlug || !href.startsWith("/")) return href;
    return isAdmin ? `/demo/${tenantSlug}/admin/page${href}` : `/demo/${tenantSlug}${href}`;
  };

  return (
    <section style={{ background: DARK, padding: "clamp(64px, 10vw, 120px) clamp(24px, 6vw, 80px)" }}>
      <div style={{
        maxWidth: 1180, margin: "0 auto",
        display: "grid", gridTemplateColumns: "1fr 1fr", gap: "clamp(40px, 7vw, 100px)",
        alignItems: "center",
      }}
        className="r04-about-grid"
      >
        {/* Text sloupec */}
        <div>
          {/* Kicker */}
          <p style={{
            fontFamily: SANS, fontSize: 11, fontWeight: 700,
            letterSpacing: "0.22em", textTransform: "uppercase",
            color: RED, margin: "0 0 20px",
          }}>
            <GenericEditableText sectionId={sectionId} field="tagline" value={tagline} tag="span" />
          </p>

          {/* H2 */}
          <h2 style={{
            fontFamily: SERIF, fontSize: "clamp(28px, 4vw, 50px)", fontWeight: 400,
            fontStyle: "italic", color: CREAM, margin: "0 0 28px", lineHeight: 1.12,
            whiteSpace: "pre-line",
          }}>
            <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
          </h2>

          {/* Červená oddělovací linka */}
          <div style={{ width: 44, height: 2, background: RED, marginBottom: 28 }} />

          {/* Body */}
          {body && (
            <p style={{
              fontFamily: SANS, fontSize: "clamp(15px, 1.5vw, 17px)", fontWeight: 400,
              color: MUTED, lineHeight: 1.75, margin: "0 0 18px",
            }}>
              <GenericEditableText sectionId={sectionId} field="body" value={body} tag="span" />
            </p>
          )}
          {body2 && (
            <p style={{
              fontFamily: SANS, fontSize: "clamp(15px, 1.5vw, 17px)", fontWeight: 400,
              color: MUTED, lineHeight: 1.75, margin: "0 0 36px",
            }}>
              <GenericEditableText sectionId={sectionId} field="body2" value={body2} tag="span" />
            </p>
          )}

          {/* CTA */}
          <a
            href={resolve(ctaHref)}
            data-btn="primary"
            style={{
              display: "inline-block", fontFamily: SANS, fontSize: 11, fontWeight: 700,
              letterSpacing: "0.14em", textTransform: "uppercase",
              color: CREAM, textDecoration: "none",
              padding: "14px 32px", backgroundColor: RED, borderRadius: 2,
              transition: "background-color 0.2s",
            }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#a01515")}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = RED)}
          >
            <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
          </a>
        </div>

        {/* Foto sloupec */}
        <div style={{ position: "relative" }}>
          {/* Dekorativní rámeček */}
          <div style={{
            position: "absolute", top: -16, right: -16, bottom: 16, left: 16,
            border: `1px solid ${SURF}`, borderRadius: 2, zIndex: 0,
          }} />
          <img
            src={image}
            alt=""
            style={{
              position: "relative", zIndex: 1,
              width: "100%", aspectRatio: "4/3", objectFit: "cover",
              borderRadius: 2, display: "block",
            }}
          />
          {/* Červená linka dole vlevo */}
          <div style={{
            position: "absolute", bottom: -8, left: 0, width: 60, height: 3,
            background: RED, zIndex: 2,
          }} />
        </div>
      </div>

      {/* Mobile responsive */}
      <style>{`
        @media (max-width: 768px) {
          .r04-about-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}

// ── dj-01-about ──────────────────────────────────────────────────────────────
// LUXE REDESIGN (Neon Nocturne — vasdj.cz Awwwards edition):
// - Preserved: dark bg + clip-path diamond top/bottom cuts, centered content, team foto full-width níže
// - Enhanced: midnight #08080b bg + subtle orange radial glow bottom + noise + JBM eyebrow "02 / STUDIO"
// - H2 Space Grotesk 700 kinetic reveal, subheading = JBM mono uppercase small label
// - Inter Tight body s vylepšenou typografií, closing = italic pull-quote s levým orange border
// - Team foto: Unsplash DJ studio WebP + border-top orange gradient + subtle brightness/scale animation on scroll
// ──────────────────────────────────────────────────────────────────────────────
function AboutDj01({ content, sectionId, tenantSlug, isAdmin }: { content: Record<string, unknown>; sectionId: number; tenantSlug?: string; isAdmin: boolean }) {
  const ORANGE = "#f15a24";
  const AMBER  = "#ff8347";
  const WHITE  = "#ffffff";

  const eyebrow      = String(content.eyebrow    ?? "02 / STUDIO");
  const heading      = String(content.title      ?? content.heading   ?? "Rezidenti půlnočního zvuku");
  const subheading   = String(content.subheading ?? "Nokturn Sound Collective");
  const body         = String(content.body       ?? "");
  const closing      = String(content.closing    ?? "");
  const teamImageUrl = String(content.teamImageUrl ?? "/templates/dj-01/about-studio.webp");
  const teamImageAlt = String(content.teamImageAlt ?? "Nokturn studio");

  const paragraphs = body.split("\n\n").filter(Boolean);

  return (
    <>
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=JetBrains+Mono:wght@400;500&family=Inter+Tight:wght@300;400;500&display=swap" />
      <style>{`
        @keyframes dj01ab-reveal-up { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes dj01ab-h2-in     { from { opacity: 0; transform: translateY(28px); letter-spacing: 0.1em; } to { opacity: 1; transform: translateY(0); letter-spacing: 0.02em; } }
        .dj01about-wrap {
          position: relative;
          z-index: 0;
          background: #f7f5f0;
        }
        .dj01about {
          position: relative;
          background-color: #08080b;
          color: rgba(255,255,255,0.78);
          text-align: center;
          margin-top: -3.5rem;
          padding: calc(5vw + 4.5rem) 1.5rem calc(5vw + 2rem);
          clip-path: polygon(0 0, 50% 5vw, 100% 0, 100% calc(100% - 5vw), 50% 100%, 0 calc(100% - 5vw));
          overflow: hidden;
          isolation: isolate;
        }
        .dj01about::before {
          content: "";
          position: absolute;
          left: 50%; bottom: -20%;
          width: 100vw; max-width: 1400px; height: 55vh;
          background: radial-gradient(closest-side, rgba(241,90,36,0.28) 0%, rgba(241,90,36,0.05) 45%, rgba(241,90,36,0) 72%);
          transform: translateX(-50%);
          filter: blur(6px);
          z-index: 0;
          pointer-events: none;
        }
        .dj01about::after {
          content: "";
          position: absolute;
          inset: 0;
          background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%25' height='100%25' filter='url(%23n)' opacity='0.4'/></svg>");
          opacity: 0.25;
          mix-blend-mode: overlay;
          z-index: 1;
          pointer-events: none;
        }
        .dj01about-inner {
          position: relative;
          z-index: 2;
          max-width: 820px;
          margin: 0 auto;
        }
        .dj01about-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 0.7rem;
          font-family: 'JetBrains Mono', ui-monospace, monospace;
          font-weight: 500;
          font-size: 0.78rem;
          letter-spacing: 0.34em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.6);
          margin: 0 0 1.75rem;
          animation: dj01ab-reveal-up 900ms cubic-bezier(.2,.7,.2,1) 60ms both;
        }
        .dj01about-eyebrow::before {
          content: "";
          display: inline-block;
          width: 8px; height: 8px;
          background: ${ORANGE};
          box-shadow: 0 0 12px rgba(241,90,36,0.7);
        }
        .dj01about h2 {
          color: ${WHITE};
          font-family: 'Space Grotesk', -apple-system, sans-serif;
          font-size: clamp(1.7rem, 4.2vw, 3.4rem);
          font-weight: 700;
          line-height: 1.08;
          margin: 0 0 1.5rem;
          text-transform: uppercase;
          letter-spacing: 0.02em;
          animation: dj01ab-h2-in 1000ms cubic-bezier(.2,.7,.2,1) 180ms both;
        }
        .dj01about h3 {
          color: rgba(255,255,255,0.55);
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.82rem;
          font-weight: 500;
          line-height: 1.4;
          margin: 0 0 3rem;
          text-transform: uppercase;
          letter-spacing: 0.3em;
          animation: dj01ab-reveal-up 900ms cubic-bezier(.2,.7,.2,1) 320ms both;
        }
        .dj01about h3::before {
          content: "— ";
          color: ${ORANGE};
        }
        .dj01about p {
          color: rgba(255,255,255,0.72);
          font-family: 'Inter Tight', sans-serif;
          font-weight: 400;
          margin: 0 0 1.4rem;
          font-size: clamp(0.96rem, 1.15vw, 1.06rem);
          line-height: 1.7;
          animation: dj01ab-reveal-up 900ms cubic-bezier(.2,.7,.2,1) both;
        }
        .dj01about p:nth-of-type(1) { animation-delay: 420ms; }
        .dj01about p:nth-of-type(2) { animation-delay: 500ms; }
        .dj01about p:nth-of-type(3) { animation-delay: 580ms; }
        .dj01about p:nth-of-type(4) { animation-delay: 660ms; }
        .dj01about p:last-of-type { margin-bottom: 0; }
        .dj01about .dj01about-closing {
          position: relative;
          color: ${WHITE};
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 500;
          font-style: italic;
          font-size: clamp(1.05rem, 1.5vw, 1.3rem);
          line-height: 1.5;
          margin: 2.5rem auto 0;
          padding: 1rem 0 1rem 1.75rem;
          max-width: 720px;
          text-align: left;
          border-left: 2px solid ${ORANGE};
          animation-delay: 740ms;
        }
        .dj01about .dj01about-closing::before {
          content: "";
          position: absolute;
          top: 0; left: -2px;
          width: 2px; height: 0;
          background: linear-gradient(180deg, ${ORANGE} 0%, ${AMBER} 100%);
          animation: dj01ab-border-grow 700ms cubic-bezier(.2,.7,.2,1) 900ms forwards;
        }
        @keyframes dj01ab-border-grow { to { height: 100%; } }
        .dj01about a { color: ${ORANGE}; text-decoration: none; transition: color 240ms cubic-bezier(.2,.7,.2,1); }
        .dj01about a:hover { color: ${AMBER}; }

        .dj01team {
          position: relative;
          overflow: hidden;
          z-index: 1;
          background: #08080b;
          isolation: isolate;
        }
        .dj01team::before {
          content: "";
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 2px;
          background: linear-gradient(90deg, transparent 0%, ${ORANGE} 50%, transparent 100%);
          z-index: 4;
          pointer-events: none;
        }
        .dj01team::after {
          content: "";
          position: absolute;
          inset: 0;
          background:
            linear-gradient(180deg, rgba(8,8,11,0.4) 0%, rgba(8,8,11,0) 30%, rgba(8,8,11,0) 65%, rgba(8,8,11,0.55) 100%),
            radial-gradient(70% 45% at 50% 100%, rgba(241,90,36,0.25) 0%, rgba(241,90,36,0) 70%);
          z-index: 2;
          pointer-events: none;
        }
        .dj01team-imgwrap {
          position: relative;
          z-index: 1;
          overflow: hidden;
        }
        .dj01team img {
          display: block;
          width: 100%;
          max-height: 520px;
          object-fit: cover;
          object-position: center 45%;
          transform: scale(1.02);
          filter: grayscale(0.15) contrast(1.05) brightness(0.85);
          transition: transform 1400ms cubic-bezier(.2,.7,.2,1), filter 700ms cubic-bezier(.2,.7,.2,1);
        }
        .dj01team:hover img {
          transform: scale(1.06);
          filter: grayscale(0) contrast(1.1) brightness(0.95);
        }
        .dj01team-caption {
          position: absolute;
          left: 50%; bottom: 1.5rem;
          transform: translateX(-50%);
          z-index: 3;
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.7rem;
          font-weight: 500;
          letter-spacing: 0.3em;
          color: rgba(255,255,255,0.7);
          text-transform: uppercase;
          padding: 0.5rem 1rem;
          border: 1px solid rgba(255,255,255,0.15);
          background: rgba(8,8,11,0.65);
          -webkit-backdrop-filter: blur(8px);
          backdrop-filter: blur(8px);
          white-space: nowrap;
        }
        .dj01team-caption .dj01team-caption-dot { color: ${ORANGE}; }

        @media (max-width: 700px) {
          .dj01about { padding: calc(7vw + 2.5rem) 1.25rem calc(7vw + 1.25rem); }
          .dj01about-eyebrow { font-size: 0.7rem; letter-spacing: 0.28em; margin-bottom: 1.25rem; }
          .dj01about h2 { line-height: 1.15; }
          .dj01about h3 { font-size: 0.72rem; letter-spacing: 0.24em; margin-bottom: 2rem; }
          .dj01about .dj01about-closing { padding-left: 1.25rem; }
          .dj01team img { max-height: 340px; }
        }
        @media (max-width: 480px) {
          .dj01about {
            clip-path: polygon(0 0, 50% 7vw, 100% 0, 100% calc(100% - 7vw), 50% 100%, 0 calc(100% - 7vw));
            padding: calc(9vw + 2rem) 1.15rem calc(9vw + 1rem);
          }
          .dj01team img { max-height: 260px; }
          .dj01team-caption { font-size: 0.6rem; letter-spacing: 0.24em; padding: 0.4rem 0.75rem; }
        }
        @media (prefers-reduced-motion: reduce) {
          .dj01about-eyebrow, .dj01about h2, .dj01about h3, .dj01about p, .dj01about-closing::before, .dj01team img {
            animation: none !important; transition: none !important; opacity: 1 !important; transform: none !important;
          }
        }
      `}</style>

      <div className="dj01about-wrap" id="o-nas" data-template="dj-01-about">
        <div className="dj01about">
          <div className="dj01about-inner">
            {eyebrow && (
              <GenericEditableText sectionId={sectionId} field="eyebrow" value={eyebrow} tag="span" className="dj01about-eyebrow">
                {eyebrow}
              </GenericEditableText>
            )}
            {heading && (
              <GenericEditableText sectionId={sectionId} field="title" value={heading} tag="h2">
                {heading}
              </GenericEditableText>
            )}
            {subheading && (
              <GenericEditableText sectionId={sectionId} field="subheading" value={subheading} tag="h3">
                {subheading}
              </GenericEditableText>
            )}
            {paragraphs.map((p, i) => (
              <GenericEditableText key={i} sectionId={sectionId} field={`body_p${i}`} value={p} tag="p">
                {p}
              </GenericEditableText>
            ))}
            {closing && (
              <GenericEditableText sectionId={sectionId} field="closing" value={closing} tag="p" className="dj01about-closing">
                {closing}
              </GenericEditableText>
            )}
          </div>
        </div>

        {teamImageUrl && (
          <div className="dj01team">
            <div className="dj01team-imgwrap">
              <GenericEditableImage
                sectionId={sectionId}
                field="teamImageUrl"
                src={teamImageUrl}
                alt={teamImageAlt}
                style={{ position: "relative", display: "block", width: "100%" }}
              >
                <img src={teamImageUrl} alt={teamImageAlt} loading="lazy" />
              </GenericEditableImage>
            </div>
            <span className="dj01team-caption">
              Studio Nokturn <span className="dj01team-caption-dot">●</span> Praha
            </span>
          </div>
        )}
      </div>
    </>
  );
}

/* ─────────────────────────────────────────────
   video-01-about  — 1:1 honzakamenar.cz
   Dark bg section with background image + overlay
   Photo LEFT b&w portrait | text RIGHT white
   "Ahoj!" large Playfair → heading normal+bold →
   italic body paragraphs → gold border CTA button
───────────────────────────────────────────── */
function AboutVideo01({ content, sectionId, tenantSlug, isAdmin }: {
  content: Record<string, unknown>;
  sectionId: number;
  tenantSlug?: string;
  isAdmin: boolean;
}) {
  const c = content as {
    eyebrow?: string; titleNormal?: string; titleBold?: string;
    body?: string; body2?: string;
    ctaText?: string; ctaHref?: string;
    imageUrl?: string; imageAlt?: string; imageCaption?: string;
    bgImageUrl?: string;
  };
  const eyebrow      = c.eyebrow      ?? "Ahoj!";
  const titleNormal  = c.titleNormal  ?? "Jsem Demo Kameraman, snílek, táta, manžel a taky";
  const titleBold    = c.titleBold    ?? "svatební kameraman";
  const body         = c.body         ?? "Baví mě lidi a jejich vztahy. S láskou a maximální empatií natáčím svatební filmy a svatební videa po celé České republice.";
  const body2        = c.body2        ?? "Miluju okamžiky, které trvají jen pár vteřin, ale ve videu zůstanou navždy - pro vás, vaše děti a třeba i vnoučata. Svatební video pro mě není jen o dokonalém záběru či střihu, je o tom, zachytit pocit - jak se smějete, jak se držíte za ruce, jak dýcháte jeden pro druhého.";
  const ctaText      = c.ctaText      ?? "Pojďme se více poznat";
  const ctaHref      = c.ctaHref      ?? "#kontakt";
  const imageUrl     = c.imageUrl     ?? "";
  const imageAlt     = c.imageAlt     ?? "";
  const imageCaption = c.imageCaption ?? "";
  const bgImageUrl   = c.bgImageUrl   ?? "";

  const bgStyle = bgImageUrl
    ? { backgroundImage: `linear-gradient(rgba(20,16,14,0.72) 0%, rgba(20,16,14,0.72) 100%), url(${bgImageUrl})`, backgroundSize: "cover", backgroundPosition: "center" }
    : { background: "#1a1410" };

  return (
    <section id={String(sectionId)} style={{ ...bgStyle, position: "relative" }}>
      <style>{`
        .vd01ab-wrap {
          max-width: 980px;
          margin: 0 auto;
          padding: 80px 24px 88px;
          display: grid;
          grid-template-columns: 390px 1fr;
          gap: 72px;
          align-items: center;
        }
        /* photo — left, b&w portrait */
        .vd01ab-photo-col { display: flex; flex-direction: column; gap: 10px; }
        .vd01ab-img {
          width: 100%;
          aspect-ratio: 390 / 500;
          overflow: hidden;
        }
        .vd01ab-img img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center top;
          display: block;
          filter: grayscale(100%);
        }
        .vd01ab-caption {
          font-family: 'Inter', system-ui, sans-serif;
          font-size: 12px;
          font-weight: 300;
          color: rgba(255,255,255,0.45);
          letter-spacing: 0.03em;
        }
        /* text — right */
        .vd01ab-text { display: flex; flex-direction: column; }
        .vd01ab-eyebrow {
          font-family: 'Playfair Display', Georgia, serif;
          font-weight: 400;
          font-size: 56px;
          color: #ffffff;
          margin: 0 0 20px;
          line-height: 1;
        }
        .vd01ab-heading {
          font-family: 'Inter', system-ui, sans-serif;
          font-size: 18px;
          font-weight: 300;
          color: #ffffff;
          line-height: 1.45;
          margin: 0 0 28px;
        }
        .vd01ab-heading strong {
          font-weight: 700;
          color: #ffffff;
        }
        .vd01ab-body {
          font-family: 'Inter', system-ui, sans-serif;
          font-size: 15px;
          font-weight: 300;
          font-style: italic;
          color: rgba(255,255,255,0.78);
          line-height: 1.8;
          margin: 0 0 16px;
        }
        .vd01ab-body strong { font-style: normal; font-weight: 700; color: #fff; }
        .vd01ab-cta {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          margin-top: 28px;
          font-family: 'Inter', system-ui, sans-serif;
          font-size: 13px;
          font-weight: 400;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #C49A6C;
          text-decoration: none;
          border: 1px solid #C49A6C;
          padding: 14px 28px;
          transition: background 0.2s, color 0.2s;
          width: fit-content;
        }
        .vd01ab-cta:hover { background: #C49A6C; color: #fff; }
        @media (max-width: 820px) {
          .vd01ab-wrap {
            grid-template-columns: 1fr;
            gap: 36px;
            padding: 52px 20px 60px;
          }
          .vd01ab-img { aspect-ratio: 4/3; }
          .vd01ab-eyebrow { font-size: 42px; }
          .vd01ab-heading { font-size: 17px; }
        }
      `}</style>

      {isAdmin && (
        <div style={{ position: "absolute", top: 12, right: 12, zIndex: 10 }}>
          <GenericEditableImage sectionId={sectionId} field="bgImageUrl" src={bgImageUrl} alt="pozadí sekce">
            <div style={{ background: "rgba(0,0,0,0.55)", color: "#fff", padding: "5px 10px", fontSize: 11, letterSpacing: "0.06em", cursor: "pointer", border: "1px solid rgba(255,255,255,0.3)" }}>
              &#128247; Pozadí
            </div>
          </GenericEditableImage>
        </div>
      )}
      <div className="vd01ab-wrap">
        {/* photo — left column, b&w */}
        <div className="vd01ab-photo-col">
          <div className="vd01ab-img">
            {imageUrl
              ? (isAdmin
                  ? <GenericEditableImage sectionId={sectionId} field="imageUrl" src={imageUrl} alt={imageAlt}><img src={imageUrl} alt={imageAlt} loading="lazy" /></GenericEditableImage>
                  : <img src={imageUrl} alt={imageAlt} loading="lazy" />)
              : null}
          </div>
          {imageCaption && (
            <span className="vd01ab-caption">
              {isAdmin ? <GenericEditableText sectionId={sectionId} field="imageCaption" value={imageCaption} tag="span" /> : imageCaption}
            </span>
          )}
        </div>

        {/* text — right column */}
        <div className="vd01ab-text">
          <span className="vd01ab-eyebrow">
            {isAdmin ? <GenericEditableText sectionId={sectionId} field="eyebrow" value={eyebrow} tag="span" /> : eyebrow}
          </span>
          <p className="vd01ab-heading">
            {isAdmin
              ? <><GenericEditableText sectionId={sectionId} field="titleNormal" value={titleNormal} tag="span" /> <strong><GenericEditableText sectionId={sectionId} field="titleBold" value={titleBold} tag="span" /></strong>.</>
              : <>{titleNormal} <strong>{titleBold}</strong>.</>}
          </p>
          <p className="vd01ab-body">
            {isAdmin ? <GenericEditableText sectionId={sectionId} field="body" value={body} tag="span" /> : body}
          </p>
          {body2 && (
            <p className="vd01ab-body">
              {isAdmin ? <GenericEditableText sectionId={sectionId} field="body2" value={body2} tag="span" /> : body2}
            </p>
          )}
          <a href={ctaHref} data-btn="primary" className="vd01ab-cta">
            {isAdmin ? <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" /> : <span>{ctaText}</span>}
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </a>
        </div>
      </div>
    </section>
  );
}
