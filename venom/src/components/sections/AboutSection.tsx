"use client";

import { useEffect, useRef, useState } from "react";
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
    const label = String(content.label ?? "POUŽÍVÁME PRÉMIOVÉ, CELOSVĚTOVĚ DŮVĚRYHODNÉ ZNAČKY");
    const items = (content.items as Array<{ name: string }>) ?? [];
    const CREAM  = "#FFF8F1";
    const ACCENT = "#E0BE9A";
    const DARK   = "#1F1F1F";
    const MUTED  = "#5B4D43";
    const FONT   = "'Fahkwang', serif";
    return (
      <section
        style={{
          backgroundColor: CREAM,
          padding: "44px 24px",
          borderTop: "1px solid rgba(224,190,154,0.3)",
          borderBottom: "1px solid rgba(224,190,154,0.3)",
        }}
        data-template="beauty-01"
      >
        <div style={{ maxWidth: 1040, margin: "0 auto", textAlign: "center" }}>
          {/* Label */}
          <p
            style={{
              fontFamily: FONT,
              fontSize: 11,
              fontWeight: 200,
              letterSpacing: "0.16em",
              color: MUTED,
              textTransform: "uppercase",
              marginBottom: 24,
            }}
          >
            <GenericEditableText sectionId={sectionId} field="label" value={label} tag="span" />
          </p>
          {/* Brand names — horizontal row, separated by sand dot */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              justifyContent: "center",
              gap: "12px 0",
            }}
          >
            {items.map((b, i) => (
              <div key={`brand-${i}`} style={{ display: "flex", alignItems: "center" }}>
                <span
                  style={{
                    fontFamily: FONT,
                    fontSize: 15,
                    fontWeight: 300,
                    color: DARK,
                    letterSpacing: "0.08em",
                    whiteSpace: "nowrap",
                    padding: "0 20px",
                  }}
                >
                  <GenericEditableText sectionId={sectionId} field={`items.${i}.name`} value={b.name} tag="span" />
                </span>
                {i < items.length - 1 && (
                  <span
                    aria-hidden
                    style={{ display: "inline-block", width: 4, height: 4, borderRadius: "50%", backgroundColor: ACCENT, flexShrink: 0 }}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // beauty-01: features / "Proč nás?" — 4 karty v řadě, dekorativní SVG ikona, Cormorant title, Inter desc
  // Reference: selfbeauty.cz — krémové pozadí, centrovaný header, 4-col grid
  if (variant === "about-beauty-01-features") {
    const title    = String(content.title    ?? "PROČ NÁS?");
    const subtitle = String(content.subtitle ?? "Studio postavené na tom, jak se chcete cítit.");
    const items    = (content.items as Array<{ title: string; description: string }>) ?? [];
    const CREAM    = "#FFF8F1";
    const CREAM2   = "#F5EDE4";
    const DARK     = "#1F1F1F";
    const MUTED    = "#5B4D43";
    const SAND     = "#E0BE9A";
    const FONT_H   = "'Cormorant Garamond', 'Fahkwang', Georgia, serif";
    const FONT_B   = "'Fahkwang', sans-serif";

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
      <section id="proc-nas" style={{ backgroundColor: CREAM2, padding: "80px 24px" }} data-template="beauty-01">
        {/* Header */}
        <div style={{ maxWidth: 1040, margin: "0 auto", textAlign: "center", marginBottom: 60 }}>
          <p style={{ fontFamily: FONT_B, fontSize: 11, fontWeight: 300, letterSpacing: "0.22em", color: MUTED, textTransform: "uppercase", marginBottom: 12 }}>
            <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
          </p>
          {subtitle && (
            <h2 style={{ fontFamily: FONT_H, fontSize: "clamp(24px, 3vw, 38px)", fontWeight: 400, color: DARK, lineHeight: 1.25 }}>
              <GenericEditableText sectionId={sectionId} field="subtitle" value={subtitle} tag="span" />
            </h2>
          )}
        </div>

        {/* 4-col grid */}
        <div style={{ maxWidth: 1040, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 40 }}>
          {items.map((item, i) => (
            <div key={`feat-${i}`} style={{ textAlign: "center", padding: "0 8px" }}>
              {/* Ikona */}
              <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
                {icons[i % icons.length]}
              </div>
              {/* Dekorativní čára */}
              <div style={{ width: 32, height: 1, backgroundColor: SAND, margin: "0 auto 16px" }} aria-hidden />
              {/* Title */}
              <h3 style={{ fontFamily: FONT_H, fontSize: 22, fontWeight: 400, color: DARK, marginBottom: 10, lineHeight: 1.25 }}>
                <GenericEditableText sectionId={sectionId} field={`items.${i}.title`} value={item.title} tag="span" />
              </h3>
              {/* Description */}
              <p style={{ fontFamily: FONT_B, fontSize: 14, fontWeight: 300, color: MUTED, lineHeight: 1.7 }}>
                <GenericEditableText sectionId={sectionId} field={`items.${i}.description`} value={item.description} tag="span" />
              </p>
            </div>
          ))}
        </div>
      </section>
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
