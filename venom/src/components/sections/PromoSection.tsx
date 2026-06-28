"use client";

import { useState, useEffect, useRef } from "react";
import { GenericEditableText } from "@/components/tenant/GenericEditableText";
import { GenericEditableImage } from "@/components/tenant/GenericEditableImage";
import { OptimizedPicture } from "@/components/OptimizedPicture";

function resolveDemoHref(href: string, tenantSlug?: string, isAdmin = false) {
  if (!tenantSlug || !href.startsWith("/")) return href;
  if (href === "/") return `/demo/${tenantSlug}${isAdmin ? "/admin" : ""}`;
  return `/demo/${tenantSlug}${isAdmin ? "/admin" : ""}${href}`;
}

interface PromoCard {
  bgImage?: string;
  bullets?: string[];
  desc?: string;
}

interface Props {
  content: Record<string, unknown>;
  variant: string;
  isAdmin: boolean;
  tenantSlug?: string;
  sectionId: number;
}

export function PromoSection({ content, variant, sectionId, isAdmin, tenantSlug }: Props) {
  if (variant === "nails-01-products") return <ProductsNails01 content={content} sectionId={sectionId} />;
  if (variant === "nails-02-marquee")  return <MarqueeNails02 content={content} sectionId={sectionId} />;
  if (variant === "nails-03-promo")    return <PromoNails03 content={content} sectionId={sectionId} />;
  if (variant === "ortho-01-promo")    return <PromoOrtho01 content={content} sectionId={sectionId} />;
  if (variant === "ortho-02-process")  return <ProcessOrtho02 content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;
  if (variant === "dental-01-promo")   return <PromoDental01 content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;
  if (variant === "clinic-02-promo")   return <PromoClinic02 content={content} sectionId={sectionId} />;
  if (variant === "clinic-03-promo")   return <PromoClinic03 content={content} sectionId={sectionId} />;
  if (variant === "cafe-03-promo")     return <PromoCafe03 content={content} sectionId={sectionId} />;
  if (variant === "reality-02-steps")    return <PromoReality02Steps content={content} sectionId={sectionId} />;
  if (variant === "reality-03-listings") return <PromoReality03Listings content={content} sectionId={sectionId} />;
  if (variant === "reality-04-ratings")  return <RatingsReality04 content={content} sectionId={sectionId} />;
  if (variant === "reality-06-listings") return <PromoReality06Listings content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;
  if (variant === "florist-01-products") return <ProductsFlorist01 content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;
  if (variant === "autoskola-01-promo") return <PromoAutoskola01 content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;
  if (variant === "lang-01-promo")     return <PromoLang01 content={content} sectionId={sectionId} />;
  if (variant === "kids-01-pillars")   return <PillarsKids01 content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;
  if (variant === "kids-01-benefits")  return <BenefitsKids01 content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;
  if (variant === "pethotel-01-year")  return <YearPethotel01 content={content} sectionId={sectionId} />;
  if (variant === "pethotel-01-whyus") return <WhyusPethotel01 content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;
  if (variant === "vet-01-specs")      return <SpecsVet01 content={content} sectionId={sectionId} />;
  if (variant === "vet-01-certs")      return <CertsVet01 content={content} sectionId={sectionId} />;
  if (variant === "grooming-01-club")  return <ClubGrooming01 content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;
  if (variant === "solar-01-process")  return <ProcessSolar01 content={content} sectionId={sectionId} />;
  if (variant === "arch-01-media")     return <PromoArch01Media content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;
  if (variant === "clean-01-promo")       return <PromoClean01 content={content} sectionId={sectionId} />;
  if (variant === "klima-01-catalog")     return <PromoKlima01Catalog content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;
  if (variant === "solar-03-process")     return <ProcessSolar03 content={content} sectionId={sectionId} />;
  if (variant === "solar-02-process")     return <ProcessSolar02 content={content} sectionId={sectionId} />;
  if (variant === "floors-01-showrooms")  return <ShowroomsFloors01 content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;
  if (variant === "floors-01-benefits")   return <BenefitsFloors01 content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;
  if (variant === "klempir-01-historical") return <HistoricalKlempir01 content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;
  if (variant === "malir-01-promo")       return <PromoMalir01     content={content} sectionId={sectionId} isAdmin={isAdmin} />;
  if (variant === "malir-02-promo")       return <PromoMalir02     content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;
  if (variant === "clean-02-promo")       return <PromoClean02     content={content} sectionId={sectionId} />;
  if (variant === "hotel-01-gastro")      return <PromoHotel01Gastro content={content} sectionId={sectionId} isAdmin={isAdmin} />;
  if (variant === "hotel-02-packages")    return <PromoHotel02Packages content={content} sectionId={sectionId} isAdmin={isAdmin} />;
  if (variant === "chalet-01-activities") return <ActivitiesChalet01  content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;
  if (variant === "garden-02-tv")         return <TvGarden02       content={content} sectionId={sectionId} />;
  if (variant === "garden-02-media")      return <MediaGarden02    content={content} sectionId={sectionId} />;
  if (variant === "dj-01-whyus")          return <WhyusDj01        content={content} sectionId={sectionId} />;
  if (variant === "dj-01-references")     return <ReferencesDj01   content={content} sectionId={sectionId} />;

  const cards = ((content.cards as PromoCard[]) ?? []).slice(0, 2);

  if (variant === "promo-2cards") {
    const sectionRef = useRef<HTMLElement>(null);
    useEffect(() => {
      const el = sectionRef.current;
      if (!el) return;
      const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { el.classList.add("b03p-vis"); obs.disconnect(); } }, { threshold: 0.1 });
      obs.observe(el);
      return () => obs.disconnect();
    }, []);
    return (
      <section
        ref={sectionRef}
        className="relative w-full b03p-reveal"
        style={{ backgroundColor: "#1c1410", padding: "60px 0" }}
        data-template="barber-03"
      >
        <style>{`
          @keyframes b03FadeUp { from { opacity:0; transform:translateY(32px); } to { opacity:1; transform:translateY(0); } }
          .b03p-reveal { opacity: 0; }
          .b03p-reveal.b03p-vis { animation: b03FadeUp 0.72s cubic-bezier(.22,.68,0,1.2) forwards; }
          .b03p-card { transition: transform 0.35s ease, box-shadow 0.35s ease; }
          .b03p-card:hover { transform: translateY(-8px) !important; box-shadow: 0 24px 56px rgba(0,0,0,0.55), 0 0 0 1.5px rgba(200,169,110,0.4) !important; }
          .b03p-card:hover .b03p-img { transform: scale(1.06) !important; }
          .b03p-img { transition: transform 0.55s ease; }
        `}</style>
        <div className="max-w-[1280px] mx-auto px-6 lg:px-10 grid gap-6 lg:gap-8" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(min(340px, 100%), 1fr))" }}>
          {cards.map((card, i) => {
            const bgFocus = (content as Record<string, unknown>)[`cards.${i}.bgImageFocus`] as { x: number; y: number } | undefined;
            const bgObjPos = bgFocus ? `${bgFocus.x}% ${bgFocus.y}%` : undefined;
            return (
            <div
              key={i}
              className="b03p-card relative overflow-hidden flex flex-col justify-between"
              style={{
                minHeight: 320,
                borderRadius: 4,
                boxShadow: "0 8px 24px rgba(0,0,0,0.35)",
              }}
            >
              {card.bgImage && (
                <div className="absolute inset-0 overflow-hidden">
                  <GenericEditableImage
                    sectionId={sectionId}
                    field={`cards.${i}.bgImage`}
                    src={card.bgImage}
                    alt=""
                    className="absolute inset-0 w-full h-full"
                  >
                    <OptimizedPicture src={card.bgImage} alt="" imgStyle={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: bgObjPos }} className="b03p-img" />
                  </GenericEditableImage>
                  <div
                    aria-hidden
                    className="absolute inset-0"
                    style={{ background: "linear-gradient(180deg, rgba(15,10,7,0.45) 0%, rgba(15,10,7,0.72) 100%)" }}
                  />
                </div>
              )}
              <div className="relative z-10 p-8 lg:p-10 flex flex-col gap-6 justify-between" style={{ minHeight: 320 }}>
                <ul className="flex flex-col gap-2" style={{ color: "#c8a96e", fontFamily: "var(--font-heading)", fontSize: "1.6rem", letterSpacing: "0.06em", textTransform: "uppercase", fontWeight: 700, lineHeight: 1.2 }}>
                  {(card.bullets ?? []).map((b, bi) => (
                    <li key={bi}>
                      <GenericEditableText sectionId={sectionId} field={`cards.${i}.bullets.${bi}`} value={b} tag="span" />
                    </li>
                  ))}
                </ul>
                <p style={{ color: "#fff", fontFamily: "var(--font-body)", fontSize: "1.05rem", lineHeight: 1.5, letterSpacing: "0.04em", maxWidth: 320 }}>
                  <GenericEditableText sectionId={sectionId} field={`cards.${i}.desc`} value={card.desc ?? ""} tag="span" />
                </p>
              </div>
            </div>
            );
          })}
        </div>
      </section>
    );
  }

  return null;
}

// nails-01: centered H1 + subtitle + 4 brand logo images (uploadable)
function ProductsNails01({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const BURGUNDY = "#79142b";
  const SERIF    = "Georgia, 'Times New Roman', serif";
  const SANS     = "'Helvetica Neue', Arial, sans-serif";

  const title    = (content.title    as string) ?? "Jen to nejlepší pro vás";
  const subtitle = (content.subtitle as string) ?? "Pečlivě jsme pro vás vybrali pouze produkty té nejvyšší kvality";
  const brands   = (content.brands   as Array<{ name: string; logoUrl: string }>) ?? [
    { name: "Blazingstar", logoUrl: "" },
    { name: "OPI",         logoUrl: "" },
    { name: "CNDC",        logoUrl: "" },
    { name: "Footlogix",   logoUrl: "" },
  ];

  return (
    <section
      id="produkty"
      data-template="nails-01"
      style={{ backgroundColor: "#ffffff", padding: "clamp(60px, 8vh, 96px) clamp(24px, 6vw, 80px)" }}
    >
      {/* Heading */}
      <div style={{ textAlign: "center", marginBottom: "clamp(40px, 5vh, 64px)" }}>
        <h2 style={{
          fontFamily: SERIF,
          fontSize: "clamp(26px, 3vw, 42px)",
          fontWeight: 400,
          color: BURGUNDY,
          margin: "0 0 16px",
          lineHeight: 1.2,
        }}>
          <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
        </h2>
        <p style={{
          fontFamily: SANS,
          fontSize: "clamp(14px, 1.2vw, 18px)",
          color: BURGUNDY,
          opacity: 0.75,
          margin: 0,
          lineHeight: 1.5,
        }}>
          <GenericEditableText sectionId={sectionId} field="subtitle" value={subtitle} tag="span" />
        </p>
      </div>

      {/* Brand logo images — klikatelné pro upload */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "clamp(24px, 5vw, 72px)",
        flexWrap: "wrap",
      }}>
        {brands.map((b, i) => (
          <GenericEditableImage
            key={b.name}
            sectionId={sectionId}
            field={`brands.${i}.logoUrl`}
            src={b.logoUrl}
            alt={b.name}
            style={{ display: "flex", alignItems: "center", justifyContent: "center" }}
          >
            {b.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={b.logoUrl}
                alt={b.name}
                style={{
                  maxHeight: "clamp(32px, 3.5vw, 52px)",
                  maxWidth: "clamp(80px, 10vw, 160px)",
                  width: "auto",
                  objectFit: "contain",
                  opacity: 0.6,
                  filter: "grayscale(1)",
                  transition: "opacity 0.2s, filter 0.2s",
                  display: "block",
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLImageElement).style.opacity = "1";
                  (e.currentTarget as HTMLImageElement).style.filter = "none";
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLImageElement).style.opacity = "0.6";
                  (e.currentTarget as HTMLImageElement).style.filter = "grayscale(1)";
                }}
              />
            ) : (
              /* Fallback: text placeholder do doby, než admin nahraje logo */
              <div style={{
                width: "clamp(80px, 10vw, 150px)",
                height: "clamp(32px, 3.5vw, 52px)",
                border: `1.5px dashed ${BURGUNDY}44`,
                borderRadius: 4,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: SANS,
                fontSize: "clamp(10px, 1vw, 13px)",
                fontWeight: 600,
                letterSpacing: "0.16em",
                color: `${BURGUNDY}55`,
                textTransform: "uppercase",
                userSelect: "none",
              }}>
                {b.name}
              </div>
            )}
          </GenericEditableImage>
        ))}
      </div>
    </section>
  );
}

// ── nails-02-marquee ──────────────────────────────────────────────────────────
// Editoriální promo banner — wine #6b3f38 bg, centrovaný hierarchický layout:
// malý uppercase taupe label (kicker) → klean serif italic message → underline
// taupe CTA link. Žádný scroll, žádné dekorativní separátory; tasteful jako
// Aesop/Glossier strip. Tenké taupe linky nahoře/dole jako rámec.
// ─────────────────────────────────────────────────────────────────────────────
function MarqueeNails02({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const WINE  = "#6b3f38";
  const TAUPE = "#d4a080";
  const CREAM = "#f6efe9";

  const label   = String(content.label   ?? "Nová klientka");
  const message = String(content.message ?? "10% sleva na vaši první návštěvu — manikúra, pedikúra a nail design v Premium Nails.");
  const ctaText = String(content.ctaText ?? "Rezervovat termín");
  const ctaHref = String(content.ctaHref ?? "#kontakt");

  return (
    <section
      data-section-type="promo"
      data-variant="nails-02-marquee"
      data-template="nails-02"
      style={{
        backgroundColor: WINE,
        borderTop: `1px solid rgba(212,160,128,0.28)`,
        borderBottom: `1px solid rgba(212,160,128,0.28)`,
        padding: "clamp(48px, 7vw, 88px) clamp(24px, 6vw, 72px)",
      }}
    >
      <div
        style={{
          maxWidth: 820,
          margin: "0 auto",
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 18,
        }}
      >
        <span
          style={{
            fontFamily: "'Poppins', 'Helvetica Neue', Arial, sans-serif",
            fontSize: "0.72rem",
            fontWeight: 600,
            color: TAUPE,
            textTransform: "uppercase",
            letterSpacing: "0.4em",
          }}
        >
          <GenericEditableText sectionId={sectionId} field="label" value={label} tag="span" />
        </span>
        <p
          style={{
            margin: 0,
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontStyle: "italic",
            fontWeight: 400,
            fontSize: "clamp(1.6rem, 2.8vw, 2.4rem)",
            lineHeight: 1.3,
            color: CREAM,
            letterSpacing: "0.005em",
          }}
        >
          <GenericEditableText sectionId={sectionId} field="message" value={message} tag="span" />
        </p>
        <a
          href={ctaHref}
          data-btn="primary"
          style={{
            marginTop: 6,
            display: "inline-block",
            fontFamily: "'Poppins', 'Helvetica Neue', Arial, sans-serif",
            fontSize: "0.78rem",
            fontWeight: 500,
            color: TAUPE,
            textTransform: "uppercase",
            letterSpacing: "0.28em",
            textDecoration: "none",
            paddingBottom: 4,
            borderBottom: `1px solid ${TAUPE}`,
            transition: "color 0.2s, border-color 0.2s",
          }}
          onMouseEnter={e => { e.currentTarget.style.color = CREAM; e.currentTarget.style.borderBottomColor = CREAM; }}
          onMouseLeave={e => { e.currentTarget.style.color = TAUPE; e.currentTarget.style.borderBottomColor = TAUPE; }}
        >
          <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
          <span aria-hidden="true" style={{ marginLeft: 8 }}>→</span>
        </a>
      </div>
    </section>
  );
}

// ── nails-03-promo ─────────────────────────────────────────────────────────────
// maidenstudio.cz cashback banner — dark #0B090C bg, centrovaný:
// cream uppercase kicker → velký Manrope bold H2 → body → brown outline CTA pill.
// ──────────────────────────────────────────────────────────────────────────────
function PromoNails03({
  content,
  sectionId,
}: {
  content: Record<string, unknown>;
  sectionId: number;
}) {
  const DARK  = "#0B090C";
  const CREAM = "#FCF9F0";
  const BROWN = "#806248";
  const FONT  = "'Manrope', 'Helvetica Neue', Arial, sans-serif";

  const kicker  = String(content.kicker  ?? "Věrnostní program");
  const title   = String(content.title   ?? "CASHBACK PROGRAM");
  const message = String(content.message ?? "Sbírejte cashback za každou návštěvu a užívejte si exkluzivní výhody našeho salonu.");
  const ctaText = String(content.ctaText ?? "Zjistit více");
  const ctaHref = String(content.ctaHref ?? "#kontakt");

  return (
    <section
      data-section-type="promo"
      data-variant="nails-03-promo"
      style={{
        backgroundColor: DARK,
        padding: "80px 24px",
        textAlign: "center",
      }}
    >
      {/* Tenká brown linka nahoře */}
      <div aria-hidden="true" style={{ width: 48, height: 1, backgroundColor: BROWN, opacity: 0.5, margin: "0 auto 32px" }} />

      {/* Kicker */}
      <p style={{
        fontFamily: FONT,
        fontWeight: 700,
        fontSize: "0.72rem",
        letterSpacing: "0.28em",
        textTransform: "uppercase",
        color: BROWN,
        margin: "0 0 20px",
      }}>
        <GenericEditableText sectionId={sectionId} field="kicker" value={kicker} tag="span" />
      </p>

      {/* H2 */}
      <h2 style={{
        fontFamily: FONT,
        fontWeight: 800,
        fontSize: "clamp(1.8rem, 4vw, 3.2rem)",
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        color: CREAM,
        margin: "0 0 24px",
        lineHeight: 1.1,
      }}>
        <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
      </h2>

      {/* Body */}
      <p style={{
        fontFamily: FONT,
        fontSize: "1rem",
        fontWeight: 300,
        lineHeight: 1.7,
        color: "rgba(252,249,240,0.72)",
        margin: "0 auto 40px",
        maxWidth: 520,
      }}>
        <GenericEditableText sectionId={sectionId} field="message" value={message} tag="span" />
      </p>

      {/* CTA — outline pill */}
      <a
        href={ctaHref}
        data-btn="primary"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 10,
          padding: "13px 40px",
          border: `1.5px solid ${BROWN}`,
          color: BROWN,
          fontFamily: FONT,
          fontSize: "0.85rem",
          fontWeight: 700,
          letterSpacing: "0.10em",
          textTransform: "uppercase",
          textDecoration: "none",
          borderRadius: 999,
          transition: "background 0.22s, color 0.22s",
        }}
        onMouseEnter={e => { e.currentTarget.style.backgroundColor = BROWN; e.currentTarget.style.color = CREAM; }}
        onMouseLeave={e => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = BROWN; }}
      >
        <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
        <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="3" y1="8" x2="13" y2="8"/><polyline points="9 4 13 8 9 12"/>
        </svg>
      </a>

      {/* Tenká brown linka dole */}
      <div aria-hidden="true" style={{ width: 48, height: 1, backgroundColor: BROWN, opacity: 0.5, margin: "32px auto 0" }} />
    </section>
  );
}
// ── clinic-02-promo ────────────────────────────────────────────────────────
// Navy bg left | white bg right — "Konzultace ZDARMA" split layout
function PromoClinic02({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const NAVY   = "#0F203E";
  const AMBER  = "#ffa60b";
  const FONT_H = "'Poppins', Arial, sans-serif";
  const FONT_B = "'Open Sans', Arial, sans-serif";

  const kicker  = String(content.kicker  ?? "Nezávazná konzultace");
  const title   = String(content.title   ?? "Konzultace ZDARMA");
  const message = String(content.message ?? "");
  const ctaText = String(content.ctaText ?? "Objednat konzultaci");
  const ctaHref = String(content.ctaHref ?? "#kontakt");

  return (
    <section style={{ backgroundColor: "#f7f6f5", padding: "clamp(56px,7vw,88px) 0" }}>
      <div style={{
        maxWidth: 1140,
        margin: "0 auto",
        padding: "0 clamp(24px,5vw,60px)",
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "clamp(48px,6vw,80px)",
        alignItems: "center",
      }}>
        {/* Left: text */}
        <div>
          <p style={{
            fontFamily: FONT_B, fontSize: "0.72rem", fontWeight: 600,
            letterSpacing: "0.2em", textTransform: "uppercase",
            color: AMBER, margin: "0 0 14px",
          }}>
            <GenericEditableText sectionId={sectionId} field="kicker" value={kicker} tag="span" />
          </p>
          <h2 style={{
            fontFamily: FONT_H, fontSize: "clamp(1.8rem,3.5vw,2.8rem)", fontWeight: 700,
            color: NAVY, margin: "0 0 20px", lineHeight: 1.15,
          }}>
            <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
          </h2>
          <p style={{
            fontFamily: FONT_B, fontSize: "clamp(0.9rem,1.2vw,1rem)",
            color: "#606266", lineHeight: 1.8, margin: 0,
          }}>
            <GenericEditableText sectionId={sectionId} field="message" value={message} tag="span" />
          </p>
        </div>

        {/* Right: CTA card — white with navy border accent */}
        <div style={{
          backgroundColor: "#FFFFFF",
          borderRadius: 4,
          borderLeft: `4px solid ${AMBER}`,
          padding: "clamp(28px,4vw,48px)",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          gap: 24,
          boxShadow: "0 4px 24px rgba(15,32,62,0.07)",
        }}>
          <p style={{
            fontFamily: FONT_B, fontSize: "0.95rem", color: "#606266", lineHeight: 1.75, margin: 0,
          }}>
            <GenericEditableText sectionId={sectionId} field="detail" value={String(content.detail ?? "Přijďte a zjistěte, která procedura je přímo pro vás. Naši lékaři vám vše trpělivě vysvětlí a navrhnou optimální plán ošetření.")} tag="span" />
          </p>
          <a href={ctaHref} data-btn="primary" style={{
            display: "inline-block",
            padding: "14px 36px",
            backgroundColor: NAVY,
            color: "#FFFFFF",
            fontFamily: FONT_H,
            fontSize: "0.85rem",
            fontWeight: 700,
            letterSpacing: "0.06em",
            textDecoration: "none",
            borderRadius: 2,
          }}
          onMouseEnter={e => (e.currentTarget.style.opacity = "0.85")}
          onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
          >
            <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
          </a>
        </div>
      </div>

      <style>{`
        @media (max-width: 700px) {
          #konzultace > div { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}

// ── clinic-03-promo ────────────────────────────────────────────────────────
// Dark #2D2D2D bg, centrovaný bílý H2 + kicker + body + email input + gold CTA
// Pod tím 3 badges (Superbrand / Nejdůvěryhodnější značka)
// Reference: yesvisage.cz — footer newsletter + ocenění sekce
// ─────────────────────────────────────────────────────────────────────────────
function PromoClinic03({ content, sectionId }: { content: Record<string,unknown>; sectionId: number }) {
  const GOLD   = "#97855F";
  const GOLD_H = "#716448";
  const WHITE  = "#ffffff";
  const BG     = "#2D2D2D";
  const MUTED  = "rgba(255,255,255,0.65)";
  const FONT   = "'DM Sans', Arial, sans-serif";
  const SERIF  = "'Playfair Display', Georgia, serif";

  const title       = String(content.title       ?? "Nejdůvěryhodnější značka");
  const kicker      = String(content.kicker      ?? "Mezinárodní ocenění SUPERBRANDS");
  const body        = String(content.body        ?? "Získejte novinky, slevy a proměny zdarma do vašeho emailu.");
  const placeholder = String(content.inputPlaceholder ?? "Váš e-mail");
  const ctaText     = String(content.ctaText     ?? "Odebírat novinky");
  const badges      = (content.badges as string[]) ?? ["Nejdůvěryhodnější značka 2020", "Superbrand ČR & SR", "Mezinárodní pečeť kvality"];

  return (
    <section id="newsletter" data-variant="clinic-03-promo" style={{ backgroundColor: BG, padding: "80px 0", fontFamily: FONT }}>
      <div style={{ maxWidth: 640, margin: "0 auto", padding: "0 clamp(20px, 4vw, 40px)", textAlign: "center" }}>

        <p style={{ fontSize: "0.72rem", fontWeight: 400, color: GOLD, letterSpacing: "0.2em", textTransform: "uppercase", margin: "0 0 14px", fontFamily: FONT }}>
          <GenericEditableText sectionId={sectionId} field="kicker" value={kicker} tag="span" />
        </p>
        <h2 style={{ fontFamily: SERIF, fontSize: "clamp(1.5rem, 2.4vw, 2rem)", fontWeight: 400, color: WHITE, margin: "0 0 18px", lineHeight: 1.25 }}>
          <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
        </h2>
        <p style={{ fontFamily: FONT, fontSize: "0.95rem", color: MUTED, lineHeight: 1.7, margin: "0 0 36px" }}>
          <GenericEditableText sectionId={sectionId} field="body" value={body} tag="span" />
        </p>

        {/* Email + CTA */}
        <div style={{ display: "flex", gap: 0, maxWidth: 480, margin: "0 auto 48px" }}>
          <input
            type="email"
            placeholder={placeholder}
            style={{ flexGrow: 1, height: 50, padding: "0 18px", border: "none", fontSize: "0.9rem", fontFamily: FONT, outline: "none", backgroundColor: "rgba(255,255,255,0.1)", color: WHITE }}
          />
          <a href="#kontakt"
            style={{ display: "inline-flex", alignItems: "center", height: 50, padding: "0 24px", backgroundColor: GOLD, color: WHITE, fontFamily: FONT, fontSize: "0.82rem", fontWeight: 400, letterSpacing: "0.1em", textTransform: "uppercase", textDecoration: "none", whiteSpace: "nowrap", transition: "background-color 0.18s" }}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = GOLD_H; }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = GOLD; }}
          >
            <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
          </a>
        </div>

        {/* Award badges */}
        <div style={{ display: "flex", justifyContent: "center", gap: 12, flexWrap: "wrap" }}>
          {badges.map((b, i) => (
            <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 18px", border: `1px solid rgba(151,133,95,0.4)`, color: MUTED, fontFamily: FONT, fontSize: "0.75rem", letterSpacing: "0.06em" }}>
              <svg width="12" height="12" viewBox="0 0 12 12" fill={GOLD} style={{ flexShrink: 0 }}>
                <polygon points="6,0 7.5,4 12,4 8.5,6.5 10,11 6,8.5 2,11 3.5,6.5 0,4 4.5,4"/>
              </svg>
              {b}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── cafe-03-promo ─────────────────────────────────────────────────────────────
// Ref: cathedral.cz — s-directory-images-slider
// Bílé bg, zlatý kicker + Great Vibes H2 + 3 čtvercové karty s tmavým overlay + bílý nadpis
// Každá karta je odkaz na Akce / Menu / Rezervace
// ─────────────────────────────────────────────────────────────────────────────
function PromoCafe03({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const GOLD  = "#C69C60";
  const SERIF = "'Great Vibes', cursive";
  const SANS  = "'Open Sans', sans-serif";

  const tagline = String(content.tagline ?? "Co o nás musíte vědět");
  const title   = String(content.title   ?? "Nepřehlédněte");
  const items   = (content.items as Array<{ label: string; href: string; image: string }>) ?? [];

  const defaultItems = [
    { label: "Akce",      href: "/",          image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&h=600&fit=crop&fm=webp&q=85" },
    { label: "Menu",      href: "/nase-menu", image: "https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=600&h=600&fit=crop&fm=webp&q=85" },
    { label: "Rezervace", href: "/kontakt",   image: "https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?w=600&h=600&fit=crop&fm=webp&q=85" },
  ];
  const cards = items.length > 0 ? items : defaultItems;

  return (
    <section style={{ backgroundColor: "#fff", padding: "clamp(48px, 8vw, 96px) 0", fontFamily: SANS }}>
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 clamp(20px, 5vw, 60px)" }}>
        <header style={{ textAlign: "center", marginBottom: "clamp(32px, 5vw, 64px)" }}>
          <GenericEditableText sectionId={sectionId} field="tagline" value={tagline} tag="p">
            <p style={{ fontFamily: SANS, fontSize: 11, fontWeight: 600, letterSpacing: "0.16em", textTransform: "uppercase", color: GOLD, margin: "0 0 12px" }}>{tagline}</p>
          </GenericEditableText>
          <GenericEditableText sectionId={sectionId} field="title" value={title} tag="h2">
            <h2 style={{ fontFamily: SERIF, fontSize: "clamp(32px, 4vw, 52px)", fontWeight: 400, color: "#1a1a1a", margin: 0, letterSpacing: "0.01em" }}>{title}</h2>
          </GenericEditableText>
        </header>
        <div className="c3-promo-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "clamp(12px, 2vw, 24px)" }}>
          {cards.map((card, i) => (
            <a
              key={i}
              href={card.href}
              aria-label={card.label}
              style={{ display: "block", position: "relative", overflow: "hidden", aspectRatio: "1/1", textDecoration: "none" }}
            >
              <GenericEditableImage sectionId={sectionId} field={`items.${i}.image`} src={card.image} alt={card.label} style={{ position: "absolute", inset: 0 }}>
                <img src={card.image} alt={card.label} style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.5s ease" }} loading="lazy"
                  onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.06)")}
                  onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
                />
              </GenericEditableImage>
              {/* Overlay */}
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.15) 50%, transparent 100%)" }} />
              {/* Label */}
              <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "clamp(16px, 4%, 32px)", display: "flex", alignItems: "flex-end" }}>
                <GenericEditableText sectionId={sectionId} field={`items.${i}.label`} value={card.label} tag="span">
                  <strong style={{ fontFamily: SERIF, fontSize: "clamp(24px, 3vw, 38px)", fontWeight: 400, color: "#fff", lineHeight: 1.1 }}>{card.label}</strong>
                </GenericEditableText>
              </div>
            </a>
          ))}
        </div>
      </div>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Great+Vibes&family=Open+Sans:wght@300;400;600&display=swap" />
      <style>{`        @media(max-width:640px){.c3-promo-grid{grid-template-columns:1fr!important}}
      `}</style>
    </section>
  );
}

// ── reality-02-steps ──────────────────────────────────────────────────────────
// Ref: fermakleri.cz "Jak fungujeme?" — 4-step numbered process
// ─────────────────────────────────────────────────────────────────────────────
function PromoReality02Steps({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const title    = String(content.title    ?? "Jak fungujeme?");
  const footnote = String(content.footnote ?? "");
  const items    = (content.items as Array<{ number: string; text: string }>) ?? [];

  const DARK  = "#05303a";
  const GREEN = "#3DCE78";
  const LIGHT = "#f7faf9";
  const FONT  = "'Montserrat', 'Helvetica Neue', Arial, sans-serif";

  return (
    <section id="jak-fungujeme" style={{ backgroundColor: LIGHT, fontFamily: FONT }}>
      <div style={{ width: 0, height: 0, borderLeft: "60px solid transparent", borderRight: "60px solid transparent", borderTop: "44px solid #ffffff", margin: "0 auto" }} />
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "clamp(48px,7vw,88px) clamp(16px,5vw,48px) clamp(56px,8vw,96px)" }}>

        <h2 style={{ fontSize: "clamp(22px,3vw,34px)", fontWeight: 700, color: DARK, marginBottom: "clamp(40px,6vw,64px)", textAlign: "center" }}>
          <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
        </h2>

        {/* Steps grid — číslo nahoře se spojnicí, text dole */}
        <div data-r02-steps-grid="" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "0 24px" }}>

          {/* Řádek 1: čísla + spojovací čáry */}
          {items.map((item, i) => (
            <div key={`r02-step-num-${i}`} style={{ display: "flex", alignItems: "center", marginBottom: 20 }}>
              {/* Číselný kroužek */}
              <div style={{ width: 48, height: 48, borderRadius: "50%", backgroundColor: GREEN, color: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, fontWeight: 700, flexShrink: 0, zIndex: 1, position: "relative" }}>
                {item.number}
              </div>
              {/* Spojovací čárka (ne u posledního) */}
              {i < items.length - 1 && (
                <div style={{ flex: 1, height: 2, backgroundColor: "#cce8d9", marginLeft: 0 }} />
              )}
            </div>
          ))}

          {/* Řádek 2: texty */}
          {items.map((item, i) => (
            <p key={`r02-step-txt-${i}`} style={{ fontSize: 14, lineHeight: 1.7, color: DARK, margin: 0, paddingRight: 8, opacity: 0.88 }}>
              <GenericEditableText sectionId={sectionId} field={`items.${i}.text`} value={item.text} tag="span" />
            </p>
          ))}

        </div>

        {footnote && (
          <p style={{ marginTop: 48, fontSize: 14, color: DARK, opacity: 0.65, maxWidth: 660, margin: "48px auto 0", lineHeight: 1.7, textAlign: "center", fontStyle: "italic" }}>
            <GenericEditableText sectionId={sectionId} field="footnote" value={footnote} tag="span" />
          </p>
        )}
      </div>

      <style>{`
        @media (max-width: 767px) {
          [data-r02-steps-grid] {
            grid-template-columns: 1fr 1fr !important;
            gap: 24px 16px !important;
          }
        }
        @media (max-width: 480px) {
          [data-r02-steps-grid] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </section>
  );
}

// ── reality-03-listings ───────────────────────────────────────────────────────
// Sekce nemovitostí v nabídce — 4 karty v gridu
// Tmavý navy bg (#132538), karty bílé s hover efektem (zoom foto + lift)
// Badge: PRODEJ (navy) / PRONÁJEM (ochre), cena v ochre, lokace s pin ikonou
// Scroll entrance: karty stagger fade-up
// ─────────────────────────────────────────────────────────────────────────────
function PromoReality03Listings({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const title = String(content.title ?? "Novinky v nabídce");
  const items = (content.items as Array<{
    title: string; price: string; location: string; image: string; type?: string;
  }>) ?? [];

  const DARK  = "#132538";
  const OCHRE = "#e38a6a";
  const WHITE = "#ffffff";
  const SANS  = "'Helvetica Neue', Helvetica, Arial, sans-serif";

  const sectionRef = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);
  const [hovered, setHovered] = useState<number | null>(null);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } }, { threshold: 0.08 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const formatPrice = (price: string, type?: string) => {
    const num = price.replace(/\s/g, "");
    const isRent = type === "pronajem";
    return isRent ? `${price} Kč/měs.` : `${price} Kč`;
  };

  return (
    <section ref={sectionRef} id="nabidka" style={{ backgroundColor: DARK, fontFamily: SANS, padding: "clamp(64px, 9vw, 110px) clamp(20px, 4vw, 64px)" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto" }}>

        {/* Heading */}
        <div style={{
          display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: 16,
          marginBottom: "clamp(36px, 5vw, 60px)",
          opacity: visible ? 1 : 0, transform: visible ? "none" : "translateY(24px)",
          transition: "opacity 0.6s ease, transform 0.6s ease",
        }}>
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, color: OCHRE, letterSpacing: "4px", textTransform: "uppercase", margin: "0 0 12px" }}>Aktuální nabídka</p>
            <h2 style={{ fontSize: "clamp(1.8rem, 3vw, 2.5rem)", fontWeight: 700, color: WHITE, margin: 0, letterSpacing: "-0.03em", lineHeight: 1.15 }}>
              <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
            </h2>
          </div>
          <a href="#kontakt" style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 600, color: OCHRE, textDecoration: "none", letterSpacing: "0.08em", textTransform: "uppercase", whiteSpace: "nowrap", paddingBottom: 4, borderBottom: `1px solid rgba(227,138,106,0.4)`, transition: "border-color 0.2s" }}>
            Všechny nemovitosti
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </a>
        </div>

        {/* Grid */}
        <div data-r03-listings-grid style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
          {items.map((item, i) => {
            const hov = hovered === i;
            const isRent = item.type === "pronajem";
            const delay = `${i * 0.1}s`;
            return (
              <article
                key={`r03-listing-${i}`}
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
                style={{
                  backgroundColor: WHITE,
                  borderRadius: 8,
                  overflow: "hidden",
                  cursor: "pointer",
                  transition: "transform 0.35s ease, box-shadow 0.35s ease",
                  transform: hov ? "translateY(-8px)" : "none",
                  boxShadow: hov ? "0 24px 52px rgba(0,0,0,0.4)" : "0 4px 16px rgba(0,0,0,0.2)",
                  opacity: visible ? 1 : 0,
                  animation: visible ? `r03ListingFadeUp 0.6s ease ${delay} both` : "none",
                }}
              >
                {/* Image */}
                <div style={{ position: "relative", paddingTop: "66%", overflow: "hidden" }}>
                  <img
                    src={item.image}
                    alt={item.title}
                    style={{
                      position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover",
                      transition: "transform 0.5s ease",
                      transform: hov ? "scale(1.08)" : "scale(1)",
                    }}
                  />
                  {/* Type badge */}
                  <span style={{
                    position: "absolute", top: 14, left: 14,
                    backgroundColor: isRent ? OCHRE : DARK,
                    color: WHITE,
                    fontSize: 10, fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase",
                    padding: "5px 10px", borderRadius: 3,
                  }}>
                    {isRent ? "Pronájem" : "Prodej"}
                  </span>
                </div>

                {/* Info */}
                <div style={{ padding: "20px 20px 24px" }}>
                  <p style={{ fontSize: "clamp(1rem, 1.4vw, 1.15rem)", fontWeight: 700, color: DARK, margin: "0 0 6px", lineHeight: 1.3 }}>
                    {item.title}
                  </p>
                  <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 14 }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
                    <span style={{ fontSize: 13, color: "#888" }}>{item.location}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ fontSize: "clamp(1rem, 1.3vw, 1.1rem)", fontWeight: 700, color: OCHRE, letterSpacing: "-0.01em" }}>
                      {formatPrice(item.price, item.type)}
                    </span>
                    <span style={{ fontSize: 12, fontWeight: 600, color: hov ? OCHRE : "#bbb", textTransform: "uppercase", letterSpacing: "0.08em", transition: "color 0.2s" }}>
                      Detail →
                    </span>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>

      <style>{`
        @keyframes r03ListingFadeUp {
          from { opacity: 0; transform: translateY(36px); }
          to   { opacity: 1; transform: none; }
        }
        @media (max-width: 1023px) { [data-r03-listings-grid] { grid-template-columns: repeat(2, 1fr) !important; } }
        @media (max-width: 559px)  { [data-r03-listings-grid] { grid-template-columns: 1fr !important; } }
      `}</style>
    </section>
  );
}

// ── reality-04-ratings ────────────────────────────────────────────────────────
// Čistý trust-strip: bílé bg, tenký border nahoře/dole, 3 blogy oddělené svislou
// linkou. Každý blok: název platformy malými písmeny + velké skóre modré #1032CF
// + zlaté hvězdičky + počet recenzí. Pod tím jednoduché CTA jako text-link.
// ─────────────────────────────────────────────────────────────────────────────
function RatingsReality04({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const title   = String(content.title   ?? "Hodnocení našich klientů");
  const ctaText = String(content.ctaText ?? "Chci být dalším spokojeným zákazníkem");
  const ctaHref = String(content.ctaHref ?? "#kontakt");
  const items   = (content.items as Array<{ platform: string; score: string; count: string; color: string }>) ?? [];

  const PRIMARY = "#1032CF";
  const DARK    = "#241f0c";
  const MUTED   = "#888";
  const BORDER  = "#e8e8e8";
  const GREEN   = "#21b276";
  const GOLD    = "#f5a623";
  const SANS    = "'Helvetica Neue', Helvetica, Arial, sans-serif";

  // Inline SVG loga platforem — diskrétní, jednobarevná verze
  const PlatformLogo = ({ platform }: { platform: string }) => {
    if (platform === "Google") return (
      <svg height="22" viewBox="0 0 74 24" fill="none" aria-label="Google" style={{ display: "block" }}>
        <path d="M9.24 8.19v2.46h5.88c-.18 1.39-.73 2.43-1.51 3.12-.98.88-2.44 1.83-4.37 1.83-3.49 0-6.22-2.82-6.22-6.31s2.73-6.31 6.22-6.31c1.87 0 3.24.74 4.24 1.67l1.74-1.74C13.71 1.73 11.82.84 9.24.84 4.44.84.5 4.78.5 9.58s3.94 8.74 8.74 8.74c2.56 0 4.49-.84 5.99-2.41 1.54-1.54 2.02-3.7 2.02-5.45 0-.54-.04-1.04-.13-1.46H9.24v-.81z" fill="#4285F4"/>
        <path d="M73.5 8.19H70v3.5h-3.5v3.5H70v3.5h3.5v-3.5H77v-3.5h-3.5V8.19z" fill="#34A853"/>
        <text x="22" y="17" fontFamily="Arial,sans-serif" fontSize="14" fontWeight="500" fill="#5f6368">Google</text>
      </svg>
    );
    if (platform === "Seznam") return (
      <svg height="22" viewBox="0 0 80 24" fill="none" aria-label="Seznam" style={{ display: "block" }}>
        <rect x="0" y="2" width="20" height="20" rx="4" fill="#e4521e"/>
        <text x="5" y="17" fontFamily="Arial,sans-serif" fontWeight="900" fontSize="14" fill="#fff">S</text>
        <text x="26" y="17" fontFamily="Arial,sans-serif" fontSize="14" fontWeight="500" fill="#5f6368">Seznam</text>
      </svg>
    );
    if (platform === "Facebook") return (
      <svg height="22" viewBox="0 0 96 24" fill="none" aria-label="Facebook" style={{ display: "block" }}>
        <path d="M12 0C5.37 0 0 5.37 0 12c0 5.99 4.39 10.96 10.13 11.85V15.5H7.08V12h3.05V9.35c0-3.01 1.79-4.67 4.53-4.67 1.31 0 2.68.23 2.68.23v2.95H15.8c-1.49 0-1.95.93-1.95 1.88V12h3.33l-.53 3.5H13.85v8.35C19.61 22.96 24 17.99 24 12 24 5.37 18.63 0 12 0z" fill="#1877F2"/>
        <text x="30" y="17" fontFamily="Arial,sans-serif" fontSize="14" fontWeight="500" fill="#5f6368">Facebook</text>
      </svg>
    );
    return <span style={{ fontFamily: SANS, fontSize: 14, fontWeight: 600, color: MUTED, letterSpacing: 1, textTransform: "uppercase" }}>{platform}</span>;
  };

  return (
    <section style={{ backgroundColor: "#fff", borderTop: `1px solid ${BORDER}`, borderBottom: `1px solid ${BORDER}` }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 clamp(16px, 3vw, 40px)" }}>

        {/* Nadpis */}
        <p style={{ fontFamily: SANS, fontSize: 13, fontWeight: 500, color: MUTED, letterSpacing: "0.08em", textTransform: "uppercase", textAlign: "center", margin: "32px 0 0", padding: 0 }}>
          <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
        </p>

        {/* Trust strip */}
        <div className="r04-trust-strip">
          {items.map((item, i) => (
            <div key={i} className="r04-trust-item">
              {/* Název platformy s logem */}
              <PlatformLogo platform={item.platform} />
              {/* Skóre */}
              <div style={{ fontFamily: SANS, fontSize: 52, fontWeight: 800, color: PRIMARY, lineHeight: 1, margin: "10px 0 4px" }}>
                <GenericEditableText sectionId={sectionId} field={`items.${i}.score`} value={item.score} tag="span" />
              </div>
              {/* Hvězdičky */}
              <div style={{ color: GOLD, fontSize: 18, letterSpacing: 3, lineHeight: 1 }}>★★★★★</div>
              {/* Počet */}
              <div style={{ fontFamily: SANS, fontSize: 13, color: MUTED, marginTop: 6 }}>
                <GenericEditableText sectionId={sectionId} field={`items.${i}.count`} value={item.count} tag="span" />
              </div>
            </div>
          ))}
        </div>

        {/* CTA — prostý text-link */}
        <p style={{ textAlign: "center", margin: "0 0 32px", fontFamily: SANS, fontSize: 14 }}>
          <a
            href={ctaHref}
            data-btn="primary"
            style={{ color: GREEN, textDecoration: "none", fontWeight: 500, borderBottom: `1px solid ${GREEN}`, paddingBottom: 1, transition: "opacity 0.2s" }}
            onMouseEnter={e => (e.currentTarget.style.opacity = "0.7")}
            onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
          >
            <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
            {" →"}
          </a>
        </p>
      </div>

      <style>{`
        .r04-trust-strip {
          display: flex;
          align-items: stretch;
          margin: 16px 0 24px;
        }
        .r04-trust-item {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: clamp(20px, 3vw, 40px) 16px;
          border-left: 1px solid ${BORDER};
        }
        .r04-trust-item:first-child { border-left: none; }
        @media (max-width: 600px) {
          .r04-trust-strip { flex-direction: column; }
          .r04-trust-item { border-left: none; border-top: 1px solid ${BORDER}; }
          .r04-trust-item:first-child { border-top: none; }
        }
      `}</style>
    </section>
  );
}

// ── reality-06-listings ───────────────────────────────────────────────────────
// Ref: srubar.cz — "Nemovitosti v nabídce"
// Bílé bg py-24; H2 #263A82 text-3xl + "Zobrazit vše" link vpravo;
// 3-col grid (1 col mobile, 2 md, 3 lg); karta: aspect-video foto rounded-lg,
// top-left badge Prodej/Pronájem (primary bg + green dot), title text-sm, cena bold
// ─────────────────────────────────────────────────────────────────────────────
function PromoReality06Listings({ content, sectionId, tenantSlug, isAdmin }: { content: Record<string, unknown>; sectionId: number; tenantSlug?: string; isAdmin: boolean }) {
  const title    = String(content.title    ?? "Nemovitosti v nabídce");
  const allHref  = String(content.allHref  ?? "#nemovitosti");
  const allLabel = String(content.allLabel ?? "Zobrazit všechny nabídky");
  const items = (content.items as Array<{
    title: string; price: string; image: string; type?: string; area?: string; location?: string;
  }>) ?? [];

  const PRIMARY = "#263A82";
  const DARK    = "#141414";
  const MUTED   = "#6b7280";
  const SANS    = "'Helvetica Neue', Helvetica, Arial, sans-serif";
  const [hovered, setHovered] = useState<number | null>(null);
  const resolve = (href: string) => resolveDemoHref(href, tenantSlug ?? "", isAdmin);

  return (
    <section id="nemovitosti" style={{ backgroundColor: "#ffffff", padding: "80px 0" }} data-template="reality-06-listings">
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 clamp(16px, 4vw, 40px)", display: "flex", flexDirection: "column", gap: 32 }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <h2 style={{ fontFamily: SANS, fontSize: 30, fontWeight: 600, color: PRIMARY, margin: 0 }}>
            <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
          </h2>
          <a href={resolve(allHref)} style={{ fontFamily: SANS, fontSize: 14, fontWeight: 600, color: PRIMARY, textDecoration: "underline" }}>
            <GenericEditableText sectionId={sectionId} field="allLabel" value={allLabel} tag="span" />
          </a>
        </div>

        {/* Grid */}
        <div className="r06-listings-grid">
          {items.map((item, i) => (
            <a key={i} href={resolve(allHref)} style={{ textDecoration: "none", display: "block", borderRadius: 8, overflow: "hidden", transition: "box-shadow 0.2s", boxShadow: hovered === i ? "0 8px 32px rgba(38,58,130,0.14)" : "none" }}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
            >
              {/* Photo */}
              <div style={{ position: "relative", aspectRatio: "16/9", overflow: "hidden", borderRadius: 8, backgroundColor: "#f3f4f6" }}>
                <GenericEditableImage sectionId={sectionId} field={`items.${i}.image`} src={item.image} alt={item.title} style={{ display: "block", width: "100%", height: "100%" }}>
                  <img
                    src={item.image}
                    alt={item.title}
                    style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", transform: hovered === i ? "scale(1.04)" : "scale(1)", transition: "transform 0.35s" }}
                  />
                </GenericEditableImage>
                {/* Type badge top-left */}
                <span style={{ position: "absolute", top: 8, left: 8, display: "inline-flex", alignItems: "center", gap: 6, backgroundColor: PRIMARY, color: "#fff", fontFamily: SANS, fontSize: 11, fontWeight: 600, padding: "4px 8px", borderRadius: 4 }}>
                  <span style={{ position: "relative", display: "inline-flex", width: 8, height: 8 }}>
                    <span style={{ position: "absolute", inset: 0, borderRadius: "50%", backgroundColor: "#4ade80", opacity: 0.75, animation: "r06-ping 1.5s ease-in-out infinite" }} />
                    <span style={{ position: "relative", display: "inline-flex", width: 8, height: 8, borderRadius: "50%", backgroundColor: "#4ade80" }} />
                  </span>
                  {(item.type ?? "prodej") === "pronajem" ? "Pronájem" : "Prodej"}
                </span>
                {item.area && (
                  <span style={{ position: "absolute", top: 8, right: 8, backgroundColor: "#fff", color: PRIMARY, fontFamily: SANS, fontSize: 11, fontWeight: 600, padding: "4px 8px", borderRadius: 4 }}>
                    {item.area}
                  </span>
                )}
              </div>

              {/* Info */}
              <div style={{ padding: "12px 4px 8px", display: "grid", gap: 4 }}>
                <p style={{ fontFamily: SANS, fontSize: 13, fontWeight: 500, color: DARK, margin: 0, lineHeight: 1.4 }}>
                  <GenericEditableText sectionId={sectionId} field={`items.${i}.title`} value={item.title} tag="span" />
                </p>
                {item.location && (
                  <p style={{ fontFamily: SANS, fontSize: 12, color: MUTED, margin: 0 }}>
                    <GenericEditableText sectionId={sectionId} field={`items.${i}.location`} value={item.location} tag="span" />
                  </p>
                )}
                <p style={{ fontFamily: SANS, fontSize: 14, fontWeight: 700, color: PRIMARY, margin: 0 }}>
                  <GenericEditableText sectionId={sectionId} field={`items.${i}.price`} value={item.price} tag="span" /> {(item.type ?? "prodej") === "pronajem" ? "Kč/měs." : "Kč"}
                </p>
              </div>
            </a>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes r06-ping { 0%, 100% { transform: scale(1); opacity: 0.75; } 50% { transform: scale(1.6); opacity: 0; } }
        .r06-listings-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 32px 40px; }
        @media (max-width: 640px) { .r06-listings-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </section>
  );
}

// ── ortho-01-promo ─────────────────────────────────────────────────────────────
// Teal horizontal CTA strip: icon + title + perex vlevo, white pill CTA vpravo
// ──────────────────────────────────────────────────────────────────────────────
function PromoOrtho01({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const TEAL  = "#00b7ad";
  const SLATE = "#244757";
  const FONT  = "'Inter', 'DM Sans', Arial, sans-serif";

  const title   = String(content.title   ?? "Objednejte se na konzultaci zdarma");
  const message = String(content.message ?? "Uděláme scan vašich zubů, navrhneme vám možnosti léčby a stanovíme cenu.");
  const ctaText = String(content.ctaText ?? "Objednat se");
  const ctaHref = String(content.ctaHref ?? "#kontakt");

  return (
    <section
      id="konzultace"
      data-section-type="promo"
      data-variant="ortho-01-promo"
      style={{ backgroundColor: TEAL, padding: "clamp(28px, 3.5vw, 40px) 0", fontFamily: FONT }}
    >
      <div style={{
        maxWidth: 1200,
        margin: "0 auto",
        padding: "0 clamp(20px, 5vw, 60px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "clamp(20px, 4vw, 48px)",
        flexWrap: "wrap",
      }}>
        {/* Icon + text */}
        <div style={{ display: "flex", alignItems: "center", gap: "clamp(16px, 2vw, 24px)", flexShrink: 1, minWidth: 0 }}>
          {/* Tooth icon */}
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none" style={{ flexShrink: 0 }}>
            <circle cx="24" cy="24" r="22" fill="rgba(255,255,255,0.18)" />
            <path d="M24 10c-3 0-5.5 1.2-7 3.2-1.5-2-4-3.2-7-3.2C6.3 10 3 13.5 3 18c0 4.2 2 8 4.5 11 2.5 3 4.5 9 5.5 11 .5 1.5 1.5 1.5 2 0 .8-2.5 2-5 3-6.5.5-.8 1.5-1.5 3-1.5s2.5.7 3 1.5c1 1.5 2.2 4 3 6.5.5 1.5 1.5 1.5 2 0 1-2 3-8 5.5-11C43 26 45 22.2 45 18c0-4.5-3.3-8-7-8-3 0-5.5 1.2-7 3.2C29.5 11.2 27 10 24 10z" fill="white" opacity="0.95"/>
          </svg>
          <div>
            <h2 style={{ fontSize: "clamp(1.05rem, 2vw, 1.35rem)", fontWeight: 700, color: "#fff", margin: "0 0 6px", lineHeight: 1.2 }}>
              <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
            </h2>
            <p style={{ fontSize: "clamp(0.82rem, 1.2vw, 0.95rem)", color: "rgba(255,255,255,0.88)", margin: 0, lineHeight: 1.5 }}>
              <GenericEditableText sectionId={sectionId} field="message" value={message} tag="span" />
            </p>
          </div>
        </div>

        {/* CTA */}
        <a
          href={ctaHref}
          data-btn="primary"
          style={{
            display: "inline-flex", alignItems: "center",
            padding: "14px 36px",
            backgroundColor: "#fff",
            color: SLATE,
            fontFamily: FONT, fontSize: "0.95rem", fontWeight: 700,
            borderRadius: "100px",
            textDecoration: "none",
            whiteSpace: "nowrap",
            flexShrink: 0,
            transition: "background-color 0.18s, color 0.18s",
          }}
          onMouseEnter={e => { e.currentTarget.style.backgroundColor = SLATE; e.currentTarget.style.color = "#fff"; }}
          onMouseLeave={e => { e.currentTarget.style.backgroundColor = "#fff"; e.currentTarget.style.color = SLATE; }}
        >
          <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
        </a>
      </div>
    </section>
  );
}

function PromoDental01({
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
  const TEAL = "#14a2a8";
  const FONT = "'Montserrat', 'Arial', sans-serif";

  const heading       = String(content.heading       ?? "Pro své pacienty jsme tu od roku 2010");
  const body          = String(content.body          ?? "");
  const ctaText       = String(content.ctaText       ?? "Objednat se online");
  const ctaHref       = String(content.ctaHref       ?? "#kontakt");
  const backgroundUrl = String(content.backgroundUrl ?? "/templates/dental-01/hero-bg.webp");

  const resolvedHref = ctaHref.startsWith("#")
    ? resolveDemoHref(ctaHref.replace(/^#/, "/"), tenantSlug, isAdmin).replace(/\/([^/]+)$/, "#$1")
    : ctaHref;

  return (
    <section
      id="promo"
      data-section-type="promo"
      data-variant="dental-01-promo"
      style={{ position: "relative", overflow: "hidden", fontFamily: FONT }}
    >
      {/* Background image */}
      <GenericEditableImage
        sectionId={sectionId}
        field="backgroundUrl"
        src={backgroundUrl}
        alt="Promo pozadí"
        style={{ position: "absolute", inset: 0 }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={backgroundUrl}
          alt=""
          aria-hidden
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 30%" }}
        />
      </GenericEditableImage>

      {/* Overlay: teal-to-dark gradient for brand consistency */}
      <div aria-hidden style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, rgba(20,162,168,0.82) 0%, rgba(28,35,53,0.88) 100%)" }} />

      {/* Content */}
      <div style={{
        position: "relative",
        zIndex: 1,
        maxWidth: 860,
        margin: "0 auto",
        padding: "clamp(64px, 9vw, 110px) clamp(24px, 6vw, 60px)",
        textAlign: "center",
      }}>
        <div aria-hidden style={{ width: 48, height: 3, background: "#fff", borderRadius: 2, margin: "0 auto 28px", opacity: 0.7 }} />

        <h2 style={{
          fontSize: "clamp(1.55rem, 3.5vw, 2.4rem)",
          fontWeight: 800,
          color: "#fff",
          margin: "0 0 20px",
          lineHeight: 1.2,
          letterSpacing: "-0.01em",
        }}>
          <GenericEditableText sectionId={sectionId} field="heading" value={heading} tag="span" />
        </h2>

        <p style={{
          fontSize: "clamp(0.9rem, 1.5vw, 1.05rem)",
          color: "rgba(255,255,255,0.88)",
          margin: "0 auto 36px",
          lineHeight: 1.7,
          maxWidth: 640,
        }}>
          <GenericEditableText sectionId={sectionId} field="body" value={body} tag="span" />
        </p>

        <a
          href={resolvedHref}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 10,
            padding: "16px 44px",
            backgroundColor: "#fff",
            color: TEAL,
            fontFamily: FONT,
            fontSize: "0.95rem",
            fontWeight: 700,
            letterSpacing: "0.04em",
            borderRadius: 10,
            textDecoration: "none",
            textTransform: "uppercase",
            transition: "background-color 0.18s, color 0.18s, box-shadow 0.18s",
            boxShadow: "0 4px 20px rgba(0,0,0,0.18)",
          }}
          onMouseEnter={e => {
            e.currentTarget.style.backgroundColor = TEAL;
            e.currentTarget.style.color = "#fff";
            e.currentTarget.style.boxShadow = "0 6px 28px rgba(0,0,0,0.28)";
          }}
          onMouseLeave={e => {
            e.currentTarget.style.backgroundColor = "#fff";
            e.currentTarget.style.color = TEAL;
            e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,0.18)";
          }}
        >
          <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
            <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </a>
      </div>
    </section>
  );
}

// ── ortho-02-process ──────────────────────────────────────────────────────────
// Průvodce léčbou — #f5f5f5 bg, centrováno
// Kicker + H2, 4 kroky (velké číslo + název + popis), 2 CTA tlačítka
// Reference: perfectsmile.cz → row--process, cText number-X
// ─────────────────────────────────────────────────────────────────────────────
function ProcessOrtho02({ content, sectionId, tenantSlug, isAdmin }: { content: Record<string, unknown>; sectionId: number; tenantSlug?: string; isAdmin?: boolean }) {
  const FONT  = "'Raleway', 'Helvetica Neue', Arial, sans-serif";
  const DARK  = "#1a1a1a";
  const MUTED = "#888888";
  const BEIGE = "#B7B3A5";

  type Step = { number?: string; title?: string; description?: string };

  const heading    = String(content.heading    ?? "Co vás čeká, pokud se rozhodnete pro ortodontickou léčbu rovnátky, jsme shrnuli do několika bodů.");
  const subheading = String(content.subheading ?? "Průvodce léčbou");
  const steps      = ((content.steps as Step[]) ?? []).slice(0, 4);
  const cta1Text   = String(content.cta1Text   ?? "Zjistit více");
  const cta1Href   = String(content.cta1Href   ?? "#sluzby");
  const cta2Text   = String(content.cta2Text   ?? "Objednejte se online");
  const cta2Href   = String(content.cta2Href   ?? "#kontakt");

  const defaultSteps: Step[] = [
    { number: "1", title: "Konzultace",                         description: "Nezávazná prohlídka a návrh léčebného postupu" },
    { number: "2", title: "Léčebný plán",                      description: "Představení a odsouhlasení individuálního léčebného postupu lékařem" },
    { number: "3", title: "Aplikace rovnátek a aktivní léčba", description: "Nasadíme vám připravená rovnátka, začíná aktivní léčba a rovnání zubů" },
    { number: "4", title: "Sejmutí rovnátek a retenční fáze",  description: "Zuby srovnány, úsměv perfektní a na řadě je fixace výsledku" },
  ];

  const rows = steps.length > 0 ? steps : defaultSteps;
  const resolve = (href: string) => resolveDemoHref(href, tenantSlug, isAdmin);

  return (
    <section
      id="proces"
      data-section-type="promo"
      data-variant="ortho-02-process"
      style={{ backgroundColor: "#f5f5f5", fontFamily: FONT, padding: "clamp(56px, 7vw, 96px) clamp(32px, 6vw, 96px)" }}
    >
      {/* Kicker + Heading — centrováno */}
      <div style={{ textAlign: "center", maxWidth: 760, margin: "0 auto clamp(48px, 6vw, 72px)" }}>
        <p style={{ margin: "0 0 16px", fontSize: "clamp(0.72rem, 1vw, 0.82rem)", fontWeight: 500, color: MUTED, letterSpacing: "0.12em", textTransform: "uppercase" }}>
          <GenericEditableText sectionId={sectionId} field="subheading" value={subheading} tag="span" />
        </p>
        <h2 style={{ margin: 0, fontSize: "clamp(1.4rem, 2.8vw, 2.2rem)", fontWeight: 300, color: DARK, lineHeight: 1.4, letterSpacing: "-0.01em" }}>
          <GenericEditableText sectionId={sectionId} field="heading" value={heading} tag="span" />
        </h2>
      </div>

      {/* 4 kroky */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "clamp(24px, 4vw, 48px)", maxWidth: 1200, margin: "0 auto clamp(40px, 5vw, 64px)" }} className="o02-process-grid">
        {rows.map((step, i) => {
          const num   = step.number ?? String(i + 1);
          const title = step.title  ?? defaultSteps[i]?.title ?? "";
          const desc  = step.description ?? defaultSteps[i]?.description ?? "";
          return (
            <div key={i} style={{ display: "flex", flexDirection: "column" }}>
              <div style={{ fontSize: "clamp(3.5rem, 6vw, 5.5rem)", fontWeight: 200, color: BEIGE, lineHeight: 1, marginBottom: 16, letterSpacing: "-0.02em" }}>
                <GenericEditableText sectionId={sectionId} field={`steps.${i}.number`} value={num} tag="span" />
              </div>
              <h3 style={{ margin: "0 0 12px", fontSize: "clamp(0.95rem, 1.4vw, 1.1rem)", fontWeight: 600, color: DARK, lineHeight: 1.3 }}>
                <GenericEditableText sectionId={sectionId} field={`steps.${i}.title`} value={title} tag="span" />
              </h3>
              <p style={{ margin: 0, fontSize: "clamp(0.82rem, 1.1vw, 0.92rem)", color: MUTED, lineHeight: 1.7 }}>
                <GenericEditableText sectionId={sectionId} field={`steps.${i}.description`} value={desc} tag="span" />
              </p>
            </div>
          );
        })}
      </div>

      {/* 2 CTA tlačítka */}
      <div style={{ display: "flex", justifyContent: "center", gap: 16, flexWrap: "wrap" }}>
        <a
          href={resolve(cta1Href)}
          style={{ display: "inline-flex", alignItems: "center", padding: "13px 32px", border: "1px solid #1a1a1a", color: DARK, backgroundColor: "transparent", fontFamily: FONT, fontSize: "0.85rem", fontWeight: 500, letterSpacing: "0.06em", textDecoration: "none", transition: "background-color 0.2s, color 0.2s" }}
          onMouseEnter={e => { e.currentTarget.style.backgroundColor = DARK; e.currentTarget.style.color = "#fff"; }}
          onMouseLeave={e => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = DARK; }}
        >
          <GenericEditableText sectionId={sectionId} field="cta1Text" value={cta1Text} tag="span" />
        </a>
        <a
          href={resolve(cta2Href)}
          style={{ display: "inline-flex", alignItems: "center", padding: "13px 32px", border: "1px solid #1a1a1a", color: DARK, backgroundColor: "transparent", fontFamily: FONT, fontSize: "0.85rem", fontWeight: 500, letterSpacing: "0.06em", textDecoration: "none", transition: "background-color 0.2s, color 0.2s" }}
          onMouseEnter={e => { e.currentTarget.style.backgroundColor = DARK; e.currentTarget.style.color = "#fff"; }}
          onMouseLeave={e => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = DARK; }}
        >
          <GenericEditableText sectionId={sectionId} field="cta2Text" value={cta2Text} tag="span" />
        </a>
      </div>

      <style>{`
        @media (max-width: 768px) { .o02-process-grid { grid-template-columns: repeat(2, 1fr) !important; } }
        @media (max-width: 480px) { .o02-process-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </section>
  );
}

// ─── florist-01 Products / Bestsellers ──────────────────────────────────────
function ProductsFlorist01({ content, sectionId, tenantSlug, isAdmin }: { content: Record<string, unknown>; sectionId: number; tenantSlug?: string; isAdmin?: boolean }) {
  const title    = (content.title    as string) ?? "Bestsellery";
  const kicker   = (content.kicker   as string) ?? "BESTSELLERY";
  const ctaText  = (content.ctaText  as string) ?? "Zobrazit vše";
  const ctaHref  = (content.ctaHref  as string) ?? "#katalog";
  const items    = (content.items    as Array<{ name: string; price: string; badge?: string; image?: string }>) ?? [];

  const FONT = "'Arimo', Arial, sans-serif";
  const DARK = "#121212";

  const resolve = (href: string) => {
    if (!tenantSlug || !href.startsWith("#")) return href;
    return isAdmin ? `/demo/${tenantSlug}/admin${href}` : `/demo/${tenantSlug}${href}`;
  };

  return (
    <section style={{ backgroundColor: "#fff", padding: "60px 0" }}>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Arimo:wght@400;500;700&display=swap" />
      <style>{`        .f01-prod-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 24px; }
        @media (max-width: 900px) { .f01-prod-grid { grid-template-columns: repeat(2, 1fr); gap: 16px; } }
        @media (max-width: 480px) { .f01-prod-grid { grid-template-columns: repeat(2, 1fr); gap: 12px; } }
        .f01-prod-img-wrap { position: relative; width: 100%; aspect-ratio: 1; overflow: hidden; background: #f5f5f5; }
        .f01-prod-img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.5s ease; display: block; }
        .f01-prod-img-wrap:hover .f01-prod-img { transform: scale(1.06); }
        .f01-prod-badge { position: absolute; top: 10px; left: 10px; background: #121212; color: #fff; font-size: 10px; font-weight: 600; letter-spacing: 0.08em; padding: 3px 8px; text-transform: uppercase; font-family: 'Arimo', Arial, sans-serif; }
        .f01-prod-name { font-size: 13px; font-weight: 500; color: #121212; font-family: 'Arimo', Arial, sans-serif; margin-top: 10px; line-height: 1.4; }
        .f01-prod-price { font-size: 13px; color: #121212; font-family: 'Arimo', Arial, sans-serif; margin-top: 4px; }
        .f01-prod-header { display: flex; align-items: flex-end; justify-content: space-between; margin-bottom: 24px; }
        .f01-prod-cta { display: inline-flex; align-items: center; padding: 10px 28px; border: 1px solid #121212; color: #121212; background: transparent; font-family: 'Arimo', Arial, sans-serif; font-size: 13px; font-weight: 500; letter-spacing: 0.06em; text-decoration: none; transition: background 0.2s, color 0.2s; cursor: pointer; }
        .f01-prod-cta:hover { background: #121212; color: #fff; }
        .f01-prod-kicker { font-size: 11px; font-weight: 700; letter-spacing: 0.12em; color: rgba(18,18,18,0.5); text-transform: uppercase; font-family: 'Arimo', Arial, sans-serif; margin-bottom: 6px; }
        .f01-prod-title { font-size: 26px; font-weight: 700; color: #121212; font-family: 'Arimo', Arial, sans-serif; line-height: 1.2; }
        @media (max-width: 600px) { .f01-prod-header { flex-direction: column; align-items: flex-start; gap: 16px; } .f01-prod-title { font-size: 22px; } }
      `}</style>

      <div style={{ maxWidth: 1280, margin: "0 auto", paddingLeft: 24, paddingRight: 24 }}>
        {/* Header row */}
        <div className="f01-prod-header">
          <div>
            <div className="f01-prod-kicker">
              <GenericEditableText sectionId={sectionId} field="kicker" value={kicker} tag="span" />
            </div>
            <div className="f01-prod-title">
              <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
            </div>
          </div>
          <a href={resolve(ctaHref)} data-btn="primary" className="f01-prod-cta">
            <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
          </a>
        </div>

        {/* Product grid */}
        <div className="f01-prod-grid">
          {items.map((item, i) => (
            <div key={i}>
              <div className="f01-prod-img-wrap">
                <GenericEditableImage sectionId={sectionId} field={`items.${i}.image`} src={item.image ?? ""} alt={item.name} style={{ display: "block", width: "100%", height: "100%" }}>
                  <OptimizedPicture
                    src={item.image ?? ""}
                    alt={item.name}
                    width={600}
                    height={600}
                    className="f01-prod-img"
                  />
                </GenericEditableImage>
                {item.badge && <span className="f01-prod-badge">{item.badge}</span>}
              </div>
              <div className="f01-prod-name">
                <GenericEditableText sectionId={sectionId} field={`items.${i}.name`} value={item.name} tag="span" />
              </div>
              <div className="f01-prod-price">
                <GenericEditableText sectionId={sectionId} field={`items.${i}.price`} value={item.price} tag="span" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── autoskola-01 Promo — Proč GENIUS? 6 výhod v mřížce ──────────────────────
function PromoAutoskola01({ content, sectionId, tenantSlug, isAdmin }: { content: Record<string, unknown>; sectionId: number; tenantSlug?: string; isAdmin?: boolean }) {
  const heading    = String(content.heading    ?? "Proč si vybrat nás?");
  const subheading = String(content.subheading ?? "Výhody, které oceníte");
  const ctaText    = String(content.ctaText    ?? "Chci se přihlásit");
  const ctaHref    = String(content.ctaHref    ?? "/prihlaseni");
  const items      = ((content.items as Record<string, unknown>[]) ?? []);

  const ORANGE = "#f16823";
  const DARK   = "#484848";
  const FONT   = "'Roboto', sans-serif";

  const resolve = (href: string) => (tenantSlug && !isAdmin) ? `/demo/${tenantSlug}${href}` : href;

  const IconSVG = ({ type }: { type: string }) => {
    const s = { width: 26, height: 26, fill: "none", stroke: ORANGE, strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, viewBox: "0 0 24 24" };
    switch (type) {
      case "star":        return <svg {...s}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>;
      case "credit-card": return <svg {...s}><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>;
      case "monitor":     return <svg {...s}><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>;
      case "car":         return <svg {...s}><path d="M5 17H3a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h14l4 4v4a2 2 0 0 1-2 2h-2"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/><line x1="1" y1="9" x2="19" y2="9"/></svg>;
      case "users":       return <svg {...s}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
      default:            return <svg {...s}><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/><circle cx="12" cy="9" r="2.5"/></svg>;
    }
  };

  return (
    <section id={String(sectionId)} style={{ backgroundColor: "#fff", padding: "80px clamp(24px, 6vw, 80px)" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <p style={{ fontFamily: FONT, fontWeight: 400, fontSize: 12, letterSpacing: "0.2em", textTransform: "uppercase", color: ORANGE, margin: "0 0 10px" }}>
            <GenericEditableText sectionId={sectionId} field="subheading" value={subheading} tag="span" />
          </p>
          <h2 style={{ fontFamily: FONT, fontWeight: 700, fontSize: "clamp(1.5rem, 2.5vw, 2.2rem)", color: DARK, margin: "0 0 20px" }}>
            <GenericEditableText sectionId={sectionId} field="heading" value={heading} tag="span" />
          </h2>
          <div style={{ width: 48, height: 3, backgroundColor: ORANGE, borderRadius: 2, margin: "0 auto" }} />
        </div>

        {/* 6-item mřížka */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 2, marginBottom: 52 }}>
          {items.map((item, i) => {
            const title       = String(item.title       ?? "");
            const description = String(item.description ?? "");
            const iconType    = String(item.iconType    ?? "map-pin");
            return (
              <div
                key={i}
                style={{ display: "flex", gap: 20, alignItems: "flex-start", padding: "28px 24px", backgroundColor: "#f9f9f9", transition: "background 0.2s" }}
                onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.backgroundColor = "#fff3ec"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.backgroundColor = "#f9f9f9"; }}
              >
                <div style={{ flexShrink: 0, width: 48, height: 48, borderRadius: "50%", backgroundColor: "#fff", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 8px rgba(241,104,35,0.15)" }}>
                  <IconSVG type={iconType} />
                </div>
                <div>
                  <h3 style={{ fontFamily: FONT, fontWeight: 700, fontSize: "1rem", color: DARK, margin: "0 0 6px" }}>
                    <GenericEditableText sectionId={sectionId} field={`items.${i}.title`} value={title} tag="span" />
                  </h3>
                  <p style={{ fontFamily: FONT, fontWeight: 400, fontSize: "0.875rem", color: "#777", margin: 0, lineHeight: 1.65 }}>
                    <GenericEditableText sectionId={sectionId} field={`items.${i}.description`} value={description} tag="span" />
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA */}
        <div style={{ textAlign: "center" }}>
          <a
            href={resolve(ctaHref)}
            data-btn="primary"
            style={{ display: "inline-block", padding: "14px 40px", backgroundColor: ORANGE, color: "#fff", fontFamily: FONT, fontSize: 15, fontWeight: 600, letterSpacing: "0.04em", textDecoration: "none", borderRadius: 4, transition: "background 0.2s, transform 0.15s" }}
            onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.backgroundColor = "#d85710"; (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(-1px)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.backgroundColor = ORANGE; (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(0)"; }}
          >
            <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
          </a>
        </div>
      </div>
    </section>
  );
}

// ── kids-01-pillars ───────────────────────────────────────────────────────────
// 1:1 scioles.cz: bílá sekce, 3 sloupce, kruhový obrázek + POHYB/ZÁŽITKY/VOLNOST
// Animace: heading fade-up, pilíře stagger fade-up (0 / 120 / 240 ms)
// ─────────────────────────────────────────────────────────────────────────────
const PILLAR_IMAGES = [
  "/clones/scioles/img/4.jpg",
  "/clones/scioles/img/2.jpg",
  "/clones/scioles/img/1.jpg",
];

function useK01Reveal(threshold = 0.12) {
  const ref = useRef<HTMLDivElement>(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVis(true); obs.disconnect(); } }, { threshold });
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, vis };
}

function PillarsKids01({
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
  const BLUE = "#009BDE";
  const DARK = "#212529";
  const FONT = "'Roboto', 'Nunito', sans-serif";

  const heading = String(content.heading ?? "Co u nás zažiješ?");
  const items = (content.items as Array<{
    icon?: string; title: string; description: string; linkText?: string; linkHref?: string; imageUrl?: string;
  }>) ?? [];

  const headRef = useK01Reveal(0.2);
  const gridRef = useK01Reveal(0.08);

  function resolve(href: string) {
    if (!tenantSlug || href.startsWith("http")) return href;
    const base = isAdmin ? `/demo/${tenantSlug}/admin` : `/demo/${tenantSlug}`;
    return href === "/" ? base : `${base}${href}`;
  }

  return (
    <section data-template="kids-01-pillars" style={{ background: "#fff", padding: "64px 0", fontFamily: FONT }}>
      <style>{`
        .k01pillars-inner{max-width:1140px;margin:0 auto;padding:0 32px;}
        .k01pillars-head{text-align:center;margin-bottom:48px;}
        .k01pillars-head h2{font-size:clamp(1.6rem,3vw,2.2rem);font-weight:700;color:${DARK};margin:0;}
        .k01pillars-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:40px;}
        .k01pillar{text-align:center;display:flex;flex-direction:column;align-items:center;gap:16px;transition:opacity .65s ease,transform .65s ease;}
        .k01pillar:hover{transform:translateY(-6px) !important;}
        .k01pillar-img{width:240px;height:240px;border-radius:50%;object-fit:cover;object-position:center;transition:transform .4s ease,box-shadow .4s ease;}
        .k01pillar:hover .k01pillar-img{transform:scale(1.06);box-shadow:0 12px 32px rgba(0,155,222,0.22);}
        .k01pillar-title{font-size:1.4rem;font-weight:700;color:${DARK};letter-spacing:0.5px;margin:0;transition:color .25s;}
        .k01pillar:hover .k01pillar-title{color:${BLUE};}
        .k01pillar-desc{font-size:1rem;color:#444;line-height:1.6;margin:0;max-width:260px;}
        .k01pillar-link{display:inline-block;color:${BLUE};font-weight:600;font-size:0.95rem;text-decoration:none;letter-spacing:0.5px;position:relative;}
        .k01pillar-link::after{content:'';position:absolute;bottom:-2px;left:0;width:0;height:2px;background:${BLUE};transition:width .25s ease;}
        .k01pillar-link:hover::after{width:100%;}
        @media(max-width:768px){
          .k01pillars-grid{grid-template-columns:1fr;gap:48px;}
          .k01pillar-img{width:200px;height:200px;}
        }
      `}</style>
      <div className="k01pillars-inner">
        {heading && (
          <div
            className="k01pillars-head"
            ref={headRef.ref}
            style={{ opacity: headRef.vis ? 1 : 0, transform: headRef.vis ? "none" : "translateY(24px)", transition: "opacity .6s ease, transform .6s ease" }}
          >
            <h2><GenericEditableText sectionId={sectionId} field="heading" value={heading} tag="span" /></h2>
          </div>
        )}
        <div className="k01pillars-grid" ref={gridRef.ref}>
          {items.map((item, i) => {
            const imgSrc = item.imageUrl || PILLAR_IMAGES[i] || "";
            return (
              <div
                key={i}
                className="k01pillar"
                style={{ opacity: gridRef.vis ? 1 : 0, transform: gridRef.vis ? "none" : "translateY(32px)", transitionDelay: `${i * 130}ms` }}
              >
                {imgSrc && (
                  <GenericEditableImage sectionId={sectionId} field={`items.${i}.imageUrl`} src={imgSrc} alt={item.title} style={{ width: 240, height: 240, borderRadius: "50%", overflow: "hidden", flexShrink: 0 }}>
                    <img src={imgSrc} alt={item.title} className="k01pillar-img" loading="lazy" />
                  </GenericEditableImage>
                )}
                <h3 className="k01pillar-title">
                  <GenericEditableText sectionId={sectionId} field={`items.${i}.title`} value={item.title} tag="span" />
                </h3>
                <p className="k01pillar-desc">
                  <GenericEditableText sectionId={sectionId} field={`items.${i}.description`} value={item.description} tag="span" />
                </p>
                {item.linkText && item.linkHref && (
                  <a href={resolve(item.linkHref)} className="k01pillar-link">
                    <GenericEditableText sectionId={sectionId} field={`items.${i}.linkText`} value={item.linkText} tag="span" />
                  </a>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ── kids-01-benefits ─────────────────────────────────────────────────────────
function BenefitsKids01({
  content,
  sectionId,
}: {
  content: Record<string, unknown>;
  sectionId: number;
  tenantSlug?: string;
  isAdmin: boolean;
}) {
  const heading          = String((content as any).heading          ?? "Skutečné benefity");
  const imageUrl         = String((content as any).imageUrl         ?? "");
  const imageAlt         = String((content as any).imageAlt         ?? "");
  const tagline          = String((content as any).tagline          ?? "");
  const items            = ((content as any).items          as string[]) ?? [];
  const practicalHeading = String((content as any).practicalHeading ?? "Praktické informace");
  const practicalItems   = ((content as any).practicalItems as string[]) ?? [];

  const sRef = useRef<HTMLElement>(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const el = sRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVis(true); obs.disconnect(); } }, { threshold: 0.1 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const GREEN  = "#2d7a4d";
  const LGREEN = "#baeb92";
  const DARK   = "#1a2a1a";
  const FONT   = "'Gotham Rounded', 'Nunito', 'Trebuchet MS', sans-serif";

  return (
    <section
      ref={sRef}
      id={`section-${sectionId}`}
      style={{ background: "#fff", padding: "80px 24px 96px", fontFamily: FONT }}
    >
      <style>{`
        .k01ben-heading {
          opacity: 0; transform: translateY(20px);
          transition: opacity 0.55s ease, transform 0.55s ease;
        }
        .k01ben-heading.vis { opacity: 1; transform: translateY(0); }
        .k01ben-left {
          opacity: 0; transform: translateX(-32px);
          transition: opacity 0.6s ease, transform 0.6s ease;
        }
        .k01ben-left.vis { opacity: 1; transform: translateX(0); }
        .k01ben-right {
          opacity: 0; transform: translateX(24px);
          transition: opacity 0.6s ease 0.15s, transform 0.6s ease 0.15s;
        }
        .k01ben-right.vis { opacity: 1; transform: translateX(0); }
        .k01ben-img-wrap { overflow: hidden; border-radius: 12px; }
        .k01ben-img-wrap img {
          width: 100%; height: 100%; object-fit: cover;
          transition: transform 0.4s ease, filter 0.3s ease;
        }
        .k01ben-img-wrap:hover img {
          transform: scale(1.04);
          filter: brightness(1.07);
        }
        .k01ben-item {
          display: flex; align-items: flex-start; gap: 10px;
          padding: 10px 0;
          border-bottom: 1px solid #f0f0f0;
          transition: color 0.22s ease;
        }
        .k01ben-item:last-child { border-bottom: none; }
        .k01ben-item:hover { color: ${GREEN}; }
        .k01ben-check { color: ${GREEN}; font-weight: 700; flex-shrink: 0; margin-top: 1px; }
        .k01ben-prac-item {
          display: flex; align-items: flex-start; gap: 10px;
          padding: 8px 0;
          color: #444; font-size: 0.9rem; line-height: 1.6;
        }
        .k01ben-prac-dot { color: ${GREEN}; font-weight: 700; flex-shrink: 0; }
        @media (max-width: 768px) {
          .k01ben-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        {/* Title */}
        <div className={`k01ben-heading${vis ? " vis" : ""}`} style={{ textAlign: "center", marginBottom: 52 }}>
          <h2 style={{ color: DARK, fontSize: "clamp(1.8rem, 3vw, 2.4rem)", fontWeight: 800, margin: 0 }}>
            <GenericEditableText sectionId={sectionId} field="heading" value={heading} tag="span" />
          </h2>
        </div>

        <div className="k01ben-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "52px", alignItems: "start" }}>
          {/* Left — image + tagline */}
          <div className={`k01ben-left${vis ? " vis" : ""}`}>
            {imageUrl && (
              <div className="k01ben-img-wrap" style={{ height: 380, marginBottom: 24 }}>
                <GenericEditableImage sectionId={sectionId} field="imageUrl" src={imageUrl} alt={imageAlt} style={{ width: "100%", height: "100%", overflow: "hidden" }}>
                  <img src={imageUrl} alt={imageAlt} loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </GenericEditableImage>
              </div>
            )}
            {tagline && (
              <p style={{ color: GREEN, fontWeight: 700, fontSize: "1.05rem", lineHeight: 1.65, margin: 0 }}>
                <GenericEditableText sectionId={sectionId} field="tagline" value={tagline} tag="span" />
              </p>
            )}
          </div>

          {/* Right — benefits + practical */}
          <div className={`k01ben-right${vis ? " vis" : ""}`}>
            {items.length > 0 && (
              <div style={{ marginBottom: 36 }}>
                {items.map((item, i) => (
                  <div key={i} className="k01ben-item">
                    <span className="k01ben-check">✓</span>
                    <span style={{ color: DARK, fontSize: "0.95rem", lineHeight: 1.65 }}>
                      <GenericEditableText sectionId={sectionId} field={`items.${i}`} value={item} tag="span" />
                    </span>
                  </div>
                ))}
              </div>
            )}

            {practicalHeading && (
              <h3 style={{ color: GREEN, fontSize: "1rem", fontWeight: 800, letterSpacing: "0.05em", textTransform: "uppercase", margin: "0 0 14px" }}>
                <GenericEditableText sectionId={sectionId} field="practicalHeading" value={practicalHeading} tag="span" />
              </h3>
            )}
            {practicalItems.length > 0 && (
              <div>
                {practicalItems.map((item, i) => (
                  <div key={i} className="k01ben-prac-item">
                    <span className="k01ben-prac-dot">→</span>
                    <span>
                      <GenericEditableText sectionId={sectionId} field={`practicalItems.${i}`} value={item} tag="span" />
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

// ── lang-01-promo ─────────────────────────────────────────────────────────────
// 1:1 jipka.cz process sekce:
// - #f8f9fc bg, padding 100px 40px
// - Centrovaný eyebrow kicker + H2 44px
// - 4-col grid kroků: červený kruh 56px s číslem + H3 18px + popis 14px
// ─────────────────────────────────────────────────────────────────────────────
function PromoLang01({ content, sectionId }: { content: Record<string, unknown>; sectionId: string }) {
  const FONT = "'Inter', -apple-system, sans-serif";
  const RED  = "#e63946";
  const DARK = "#1a1a2e";

  const eyebrow = String(content.eyebrow ?? "Jak to funguje");
  const heading = String(content.heading ?? "Od přihlášky k plynulé konverzaci");
  const items   = (content.items as Array<{ step?: string; title: string; description: string }>) ?? [
    { step: "1", title: "Test úrovně",  description: "Online za 10 minut zjistíme vaši aktuální úroveň A1–C2." },
    { step: "2", title: "Výběr kurzu", description: "Doporučíme kurz s ohledem na cíl, čas i preference." },
    { step: "3", title: "Výuka",       description: "Začnete v termínu, který vám sedí. Lektor je rodilý mluvčí nebo certifikovaný metodik." },
    { step: "4", title: "Certifikace", description: "Připravíme vás na zkoušky FCE, IELTS, ÖSD i další." },
  ];

  return (
    <>
      <style>{`
        .lang01promo{padding:100px 40px;background:#f8f9fc;font-family:${FONT};}
        .lang01promo-inner{max-width:1280px;margin:0 auto;}
        .lang01promo-head{text-align:center;margin-bottom:60px;}
        .lang01promo-eyebrow{color:${RED};font-size:13px;letter-spacing:4px;text-transform:uppercase;font-weight:700;display:block;margin-bottom:10px;}
        .lang01promo-head h2{font-size:44px;font-weight:800;margin:0;color:${DARK};letter-spacing:-1px;}
        .lang01promo-steps{display:grid;grid-template-columns:repeat(4,1fr);gap:32px;}
        .lang01promo-step{text-align:center;}
        .lang01promo-num{width:56px;height:56px;border-radius:50%;background:${RED};color:#fff;font-weight:800;font-size:22px;display:flex;align-items:center;justify-content:center;margin:0 auto 18px;}
        .lang01promo-step h3{font-size:18px;font-weight:700;margin:0 0 8px;color:${DARK};}
        .lang01promo-step p{font-size:14px;color:#555;line-height:1.6;margin:0;}
        @media(max-width:900px){
          .lang01promo-steps{grid-template-columns:repeat(2,1fr);}
          .lang01promo{padding:60px 20px;}
          .lang01promo-head h2{font-size:32px;}
        }
      `}</style>
      <section className="lang01promo" id="jak-to-funguje" data-template="lang-01">
        <div className="lang01promo-inner">
          <div className="lang01promo-head">
            <span className="lang01promo-eyebrow">
              <GenericEditableText sectionId={sectionId} field="eyebrow" value={eyebrow} tag="span" />
            </span>
            <h2>
              <GenericEditableText sectionId={sectionId} field="heading" value={heading} tag="span" />
            </h2>
          </div>
          <div className="lang01promo-steps">
            {items.map((item, i) => (
              <div key={i} className="lang01promo-step">
                <div className="lang01promo-num">
                  <GenericEditableText sectionId={sectionId} field={`items.${i}.step`} value={item.step ?? String(i + 1)} tag="span" />
                </div>
                <h3>
                  <GenericEditableText sectionId={sectionId} field={`items.${i}.title`} value={item.title} tag="span" />
                </h3>
                <p>
                  <GenericEditableText sectionId={sectionId} field={`items.${i}.description`} value={item.description} tag="span" />
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

// ── vet-01-specs ─────────────────────────────────────────────────────────────
// Bílé bg, teal kicker + Forum H2 centrovaně, 3-col grid pilířů s left-border
// ─────────────────────────────────────────────────────────────────────────────
function SpecsVet01({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const kicker  = String(content.kicker  ?? "Odbornost");
  const heading = String(content.heading ?? "Specializujeme se na tyto obory");
  const items   = (content.items as Array<{ title?: string; description?: string }>) ?? [];

  const TEAL   = "#286C7E";
  const TEAL_L = "#42aaba";
  const DARK   = "#1a2c33";
  const FONT_H = "'Forum', 'Georgia', serif";
  const FONT_B = "'Roboto Condensed', 'Roboto', sans-serif";

  return (
    <section
      id={String(sectionId)}
      data-variant="vet-01-specs"
      style={{ background: "#fff", padding: "clamp(56px,7vw,96px) clamp(20px,5vw,40px)" }}
    >
      <style>{`
        .v01sp-inner { max-width: 1140px; margin: 0 auto; }
        .v01sp-header { text-align: center; margin-bottom: 48px; }
        .v01sp-kicker { font-family: ${FONT_B}; font-size: 12px; font-weight: 700; letter-spacing: 0.2em; text-transform: uppercase; color: ${TEAL_L}; margin: 0 0 10px; }
        .v01sp-heading { font-family: ${FONT_H}; font-weight: 400; font-size: clamp(1.8rem,3vw,2.5rem); color: ${DARK}; margin: 0; }
        .v01sp-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
        .v01sp-card { border-left: 3px solid ${TEAL}; padding: 20px 24px; background: #f7fbfc; border-radius: 0 4px 4px 0; }
        .v01sp-card h3 { font-family: ${FONT_H}; font-size: 1.2rem; font-weight: 400; color: ${TEAL}; margin: 0 0 8px; }
        .v01sp-card p  { font-family: ${FONT_B}; font-size: 14px; color: #4a6670; line-height: 1.5; margin: 0; }
        @media (max-width: 820px) { .v01sp-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 520px) { .v01sp-grid { grid-template-columns: 1fr; } }
      `}</style>

      <div className="v01sp-inner">
        <div className="v01sp-header">
          <p className="v01sp-kicker">
            <GenericEditableText sectionId={sectionId} field="kicker" value={kicker} tag="span" />
          </p>
          <h2 className="v01sp-heading">
            <GenericEditableText sectionId={sectionId} field="heading" value={heading} tag="span" />
          </h2>
        </div>

        <div className="v01sp-grid">
          {items.map((item, i) => (
            <div key={i} className="v01sp-card">
              <h3>
                <GenericEditableText sectionId={sectionId} field={`items.${i}.title`} value={item.title ?? ""} tag="span" />
              </h3>
              <p>
                <GenericEditableText sectionId={sectionId} field={`items.${i}.description`} value={item.description ?? ""} tag="span" />
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── vet-01-certs ─────────────────────────────────────────────────────────────
// Surface #DCE9EE bg, teal kicker + Forum H2, 2-col karta s PNG ikonou + popis
// ─────────────────────────────────────────────────────────────────────────────
function CertsVet01({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const kicker  = String(content.kicker  ?? "Kvalita ověřená certifikáty");
  const heading = String(content.heading ?? "Certifikace a ocenění");
  const items   = (content.items as Array<{ title?: string; description?: string; imageUrl?: string }>) ?? [];

  const TEAL   = "#286C7E";
  const TEAL_L = "#42aaba";
  const SURF   = "#DCE9EE";
  const DARK   = "#1a2c33";
  const FONT_H = "'Forum', 'Georgia', serif";
  const FONT_B = "'Roboto Condensed', 'Roboto', sans-serif";

  return (
    <section
      id={String(sectionId)}
      data-variant="vet-01-certs"
      style={{ background: SURF, padding: "clamp(56px,7vw,96px) clamp(20px,5vw,40px)" }}
    >
      <style>{`
        .v01ct-inner  { max-width: 1140px; margin: 0 auto; }
        .v01ct-header { text-align: center; margin-bottom: 48px; }
        .v01ct-kicker { font-family: ${FONT_B}; font-size: 12px; font-weight: 700; letter-spacing: 0.2em; text-transform: uppercase; color: ${TEAL_L}; margin: 0 0 10px; }
        .v01ct-heading{ font-family: ${FONT_H}; font-weight: 400; font-size: clamp(1.8rem,3vw,2.5rem); color: ${DARK}; margin: 0; }
        .v01ct-grid   { display: grid; grid-template-columns: repeat(2, 1fr); gap: 32px; }
        .v01ct-card   { background: #fff; border-radius: 8px; padding: 36px 32px; display: flex; gap: 28px; align-items: flex-start; box-shadow: 0 2px 16px rgba(40,108,126,0.08); }
        .v01ct-img    { width: 100px; height: 100px; object-fit: contain; flex-shrink: 0; }
        .v01ct-text h3{ font-family: ${FONT_H}; font-size: 1.25rem; font-weight: 400; color: ${TEAL}; margin: 0 0 12px; }
        .v01ct-text p { font-family: ${FONT_B}; font-size: 15px; color: #3a5560; line-height: 1.65; margin: 0; }
        @media (max-width: 720px) {
          .v01ct-grid { grid-template-columns: 1fr; }
          .v01ct-card { flex-direction: column; align-items: center; text-align: center; }
        }
      `}</style>

      <div className="v01ct-inner">
        <div className="v01ct-header">
          <p className="v01ct-kicker">
            <GenericEditableText sectionId={sectionId} field="kicker" value={kicker} tag="span" />
          </p>
          <h2 className="v01ct-heading">
            <GenericEditableText sectionId={sectionId} field="heading" value={heading} tag="span" />
          </h2>
        </div>

        <div className="v01ct-grid">
          {items.map((item, i) => (
            <div key={i} className="v01ct-card">
              {item.imageUrl && (
                <GenericEditableImage sectionId={sectionId} field={`items.${i}.imageUrl`} src={item.imageUrl} alt={item.title ?? ""}>
                  <img src={item.imageUrl} alt={item.title ?? ""} className="v01ct-img" loading="lazy" />
                </GenericEditableImage>
              )}
              <div className="v01ct-text">
                <h3>
                  <GenericEditableText sectionId={sectionId} field={`items.${i}.title`} value={item.title ?? ""} tag="span" />
                </h3>
                <p>
                  <GenericEditableText sectionId={sectionId} field={`items.${i}.description`} value={item.description ?? ""} tag="span" />
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}


// ── pethotel-01-year ──────────────────────────────────────────────────────────
// 1:1 skolkapropejska.cz .year section:
// - Červené #D7123D bg, bílý text, uppercase, 40px
// - Dekorativní tlapky vlevo/vpravo (SVG náhrada za year-span.png)
// ─────────────────────────────────────────────────────────────────────────────
function YearPethotel01({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const text = String(content.text ?? "Vaše psí parťáky hlídáme již od roku 2012");
  const FONT = "'Quicksand', Arial, sans-serif";

  const PawSvg = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 60 60" aria-hidden="true" style={{ opacity: 0.85 }}>
      <circle cx="18" cy="13" r="6" fill="rgba(255,255,255,0.9)"/>
      <circle cx="30" cy="8"  r="6" fill="rgba(255,255,255,0.9)"/>
      <circle cx="42" cy="13" r="6" fill="rgba(255,255,255,0.9)"/>
      <ellipse cx="30" cy="34" rx="13" ry="11" fill="rgba(255,255,255,0.9)"/>
      <circle cx="23" cy="44" r="5"  fill="rgba(255,255,255,0.9)"/>
      <circle cx="37" cy="44" r="5"  fill="rgba(255,255,255,0.9)"/>
    </svg>
  );

  return (
    <>
      <style>{`
        .ph01yr { background:#D7123D; color:#fff; padding:60px 16px; text-align:center; font-family:${FONT}; }
        .ph01yr-row { display:inline-flex; align-items:center; gap:28px; flex-wrap:wrap; justify-content:center; }
        .ph01yr-text { font-size:clamp(20px,3vw,38px); font-weight:800; text-transform:uppercase; letter-spacing:0.04em; line-height:1.2; }
      `}</style>
      <section className="ph01yr" data-template="pethotel-01-year">
        <div className="ph01yr-row">
          <PawSvg />
          <span className="ph01yr-text">
            <GenericEditableText sectionId={sectionId} field="text" value={text} tag="span" />
          </span>
          <PawSvg />
        </div>
      </section>
    </>
  );
}


// ── pethotel-01-whyus ─────────────────────────────────────────────────────────
// 1:1 skolkapropejska.cz .whyus section:
// - Žluté #F9C93D bg, 130px 0 90px padding
// - Centrovaný H2 #712419
// - 4 boxy 2×2 grid, každý: H3 uppercase #712419 + popis
// - "Breathing" červené CTA dole
// ─────────────────────────────────────────────────────────────────────────────
function WhyusPethotel01({
  content,
  sectionId,
  tenantSlug,
  isAdmin,
}: { content: Record<string, unknown>; sectionId: number; tenantSlug?: string; isAdmin: boolean }) {
  const PRIMARY = "#712419";
  const RED     = "#D6123D";
  const FONT    = "'Quicksand', Arial, sans-serif";

  const heading = String(content.heading ?? "Proč se u nás pejskům líbí?");
  const ctaText = String(content.ctaText ?? "Poznejte nás");
  const ctaHref = String(content.ctaHref ?? "/#o-nas");
  const items   = (content.items as Array<{ title: string; description: string }>) ?? [];

  function resolve(href: string) {
    if (!tenantSlug || href.startsWith("http")) return href;
    const base = isAdmin ? `/demo/${tenantSlug}/admin` : `/demo/${tenantSlug}`;
    return href === "/" ? base : `${base}${href}`;
  }

  return (
    <>
      <style>{`
        @keyframes ph01-breathing {
          0%,100%{ box-shadow:0 0 0 0 rgba(214,18,61,0.5); }
          50%    { box-shadow:0 0 0 14px rgba(214,18,61,0); }
        }
        .ph01why { background:#F9C93D; padding:130px 0 90px; font-family:${FONT}; }
        .ph01why-inner { max-width:900px; margin:0 auto; padding:0 32px; }
        .ph01why-title { text-align:center; color:${PRIMARY}; font-size:clamp(26px,3.2vw,46px); font-weight:800; margin:0 0 64px; font-family:${FONT}; line-height:1.2; }
        .ph01why-grid { display:grid; grid-template-columns:1fr 1fr; gap:40px 60px; }
        .ph01why-box { text-align:center; }
        .ph01why-box h3 { color:${PRIMARY}; font-size:clamp(18px,2vw,28px); text-transform:uppercase; font-weight:800; margin:0 0 14px; font-family:${FONT}; line-height:1.2; padding-bottom:20px; border-bottom:3px solid rgba(113,36,25,0.2); }
        .ph01why-box p { color:${PRIMARY}; font-size:17px; line-height:1.55; margin:14px 0 0; font-weight:500; }
        .ph01why-cta-wrap { text-align:center; margin-top:64px; }
        .ph01why-cta { display:inline-block; padding:16px 44px; background:${RED}; color:#fff; font-family:${FONT}; font-size:17px; font-weight:700; text-decoration:none; border-radius:4px; border:2px solid ${RED}; animation:ph01-breathing 2s ease-out infinite; }
        .ph01why-cta:hover { background:#b80d32; border-color:#b80d32; animation:none; }
        @media(max-width:600px){ .ph01why-grid { grid-template-columns:1fr; gap:32px; } .ph01why { padding:72px 0 60px; } }
      `}</style>
      <section className="ph01why" data-template="pethotel-01-whyus">
        <div className="ph01why-inner">
          <h2 className="ph01why-title">
            <GenericEditableText sectionId={sectionId} field="heading" value={heading} tag="span" />
          </h2>
          <div className="ph01why-grid">
            {items.map((item, i) => (
              <div className="ph01why-box" key={i}>
                <h3>
                  <GenericEditableText sectionId={sectionId} field={`items.${i}.title`} value={item.title} tag="span" />
                </h3>
                <p>
                  <GenericEditableText sectionId={sectionId} field={`items.${i}.description`} value={item.description} tag="span" />
                </p>
              </div>
            ))}
          </div>
          <div className="ph01why-cta-wrap">
            <a href={resolve(ctaHref)} data-btn="primary" className="ph01why-cta">
              <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
            </a>
          </div>
        </div>
      </section>
    </>
  );
}

function ClubGrooming01({ content, sectionId, tenantSlug, isAdmin }: { content: Record<string, unknown>; sectionId: number; tenantSlug?: string; isAdmin?: boolean }) {
  const GOLD  = "#d0aa57";
  const DARK  = "#101417";
  const FONT  = "'Hanken Grotesk', 'Inter', sans-serif";

  type Benefit = { title?: string; description?: string };
  const heading  = String(content.heading  ?? "Psí Salón Klub");
  const kicker   = String(content.kicker   ?? "Výhody členství");
  const body     = String(content.body     ?? "");
  const ctaText  = String(content.ctaText  ?? "Chci se přidat");
  const rawHref  = String(content.ctaHref  ?? "#kontakt");
  const ctaHref  = tenantSlug ? resolveDemoHref(rawHref, tenantSlug, isAdmin) : rawHref;
  const benefits = (content.benefits as Benefit[]) ?? [];

  return (
    <section id="klub" data-template="grooming-01-club" style={{ background: "#f6f6f6", fontFamily: FONT }}>
      <style>{`
        .gr01cl-wrap{display:grid;grid-template-columns:1fr 1fr;min-height:520px;}
        .gr01cl-left{background:${DARK};padding:clamp(56px,8vw,100px) clamp(32px,6vw,80px);display:flex;flex-direction:column;justify-content:center;}
        .gr01cl-kicker{font-size:11px;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:${GOLD};margin:0 0 16px;}
        .gr01cl-h2{font-size:clamp(28px,3.5vw,44px);font-weight:700;color:#fff;margin:0 0 24px;line-height:1.15;}
        .gr01cl-body{font-size:16px;color:rgba(255,255,255,0.72);line-height:1.7;margin:0 0 40px;max-width:480px;}
        .gr01cl-cta{display:inline-block;background:${GOLD};color:${DARK};font-size:14px;font-weight:700;letter-spacing:1.2px;text-transform:uppercase;padding:16px 36px;text-decoration:none;transition:opacity 0.2s;}
        .gr01cl-cta:hover{opacity:0.85;}
        .gr01cl-right{background:#fff;padding:clamp(56px,8vw,100px) clamp(32px,6vw,80px);display:flex;flex-direction:column;justify-content:center;gap:0;}
        .gr01cl-benefit{display:flex;align-items:flex-start;gap:20px;padding:28px 0;border-bottom:1px solid #eeeeee;}
        .gr01cl-benefit:first-child{padding-top:0;}
        .gr01cl-benefit:last-child{border-bottom:none;padding-bottom:0;}
        .gr01cl-icon{width:40px;height:40px;border-radius:50%;background:${GOLD};display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:2px;}
        .gr01cl-btext{flex:1;}
        .gr01cl-btitle{font-size:17px;font-weight:700;color:${DARK};margin:0 0 6px;}
        .gr01cl-bdesc{font-size:14px;color:#666;line-height:1.55;margin:0;}
        @media(max-width:800px){
          .gr01cl-wrap{grid-template-columns:1fr;}
          .gr01cl-left,.gr01cl-right{padding:56px 28px;}
        }
      `}</style>
      <div className="gr01cl-wrap">
        <div className="gr01cl-left">
          <p className="gr01cl-kicker">
            <GenericEditableText sectionId={sectionId} field="kicker" value={kicker} tag="span" />
          </p>
          <h2 className="gr01cl-h2">
            <GenericEditableText sectionId={sectionId} field="heading" value={heading} tag="span" />
          </h2>
          <p className="gr01cl-body">
            <GenericEditableText sectionId={sectionId} field="body" value={body} tag="span" />
          </p>
          <a href={ctaHref} data-btn="primary" className="gr01cl-cta">
            <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
          </a>
        </div>
        <div className="gr01cl-right">
          {benefits.map((b, i) => (
            <div key={i} className="gr01cl-benefit">
              <div className="gr01cl-icon">
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                  <path d="M3 9l4 4 8-8" stroke={DARK} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className="gr01cl-btext">
                <p className="gr01cl-btitle">
                  <GenericEditableText sectionId={sectionId} field={`benefits.${i}.title`} value={b.title ?? ""} tag="span" />
                </p>
                <p className="gr01cl-bdesc">
                  <GenericEditableText sectionId={sectionId} field={`benefits.${i}.description`} value={b.description ?? ""} tag="span" />
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── solar-01-process ──────────────────────────────────────────────────────────
function ProcessSolar01({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  type Step = { number?: string; title?: string; description?: string };
  const title    = String(content.title    ?? "Jak probíhá spolupráce");
  const subtitle = String(content.subtitle ?? "Od první kalkulace po spuštění elektrárny vám pomůžeme se vším.");
  const eyebrow  = String(content.eyebrow  ?? "Postup spolupráce");
  const steps    = ((content.steps as Step[]) ?? []).slice(0, 4);

  const CSS = `
    .pr01{background:#071c28;padding:80px 40px;font-family:'Inter',-apple-system,sans-serif;}
    .pr01-head{text-align:center;max-width:600px;margin:0 auto 64px;}
    .pr01-eyebrow{display:inline-block;font-size:12px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:#ff7a00;margin-bottom:12px;}
    .pr01-title{font-size:clamp(1.8rem,3vw,2.4rem);font-weight:800;color:#fff;letter-spacing:-0.5px;margin:0 0 14px;}
    .pr01-sub{font-size:16px;color:rgba(255,255,255,0.6);line-height:1.6;margin:0;}
    .pr01-steps{max-width:1100px;margin:0 auto;display:grid;grid-template-columns:repeat(4,1fr);gap:0;position:relative;}
    .pr01-steps::before{content:'';position:absolute;top:36px;left:calc(12.5% + 24px);right:calc(12.5% + 24px);height:1px;background:linear-gradient(90deg,rgba(255,122,0,0.5),rgba(255,122,0,0.15));pointer-events:none;}
    .pr01-step{text-align:center;padding:0 20px;position:relative;}
    .pr01-num-wrap{display:flex;justify-content:center;margin-bottom:24px;}
    .pr01-num{width:56px;height:56px;border-radius:50%;background:linear-gradient(135deg,#ffb347,#ff7a00);display:flex;align-items:center;justify-content:center;font-size:20px;font-weight:800;color:#fff;box-shadow:0 4px 20px rgba(255,122,0,0.4);position:relative;z-index:1;}
    .pr01-step-title{font-size:16px;font-weight:700;color:#fff;margin:0 0 10px;}
    .pr01-step-desc{font-size:14px;color:rgba(255,255,255,0.55);line-height:1.65;}
    @media(max-width:800px){
      .pr01{padding:60px 20px;}
      .pr01-steps{grid-template-columns:repeat(2,1fr);gap:40px 20px;}
      .pr01-steps::before{display:none;}
    }
    @media(max-width:480px){
      .pr01-steps{grid-template-columns:1fr;}
    }
  `;

  return (
    <>
      <style>{CSS}</style>
      <section className="pr01" data-template="solar-01">
        <div className="pr01-head">
          <span className="pr01-eyebrow">
            <GenericEditableText sectionId={sectionId} field="eyebrow" value={eyebrow} tag="span" />
          </span>
          <h2 className="pr01-title">
            <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
          </h2>
          <p className="pr01-sub">
            <GenericEditableText sectionId={sectionId} field="subtitle" value={subtitle} tag="span" />
          </p>
        </div>

        <div className="pr01-steps">
          {steps.map((step, i) => (
            <div className="pr01-step" key={i}>
              <div className="pr01-num-wrap">
                <div className="pr01-num">
                  <GenericEditableText sectionId={sectionId} field={`steps.${i}.number`} value={step.number ?? String(i + 1)} tag="span" />
                </div>
              </div>
              <h3 className="pr01-step-title">
                <GenericEditableText sectionId={sectionId} field={`steps.${i}.title`} value={step.title ?? ""} tag="span" />
              </h3>
              <p className="pr01-step-desc">
                <GenericEditableText sectionId={sectionId} field={`steps.${i}.description`} value={step.description ?? ""} tag="span" />
              </p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

// ── arch-01-media ─────────────────────────────────────────────────────────────
// 1:1 karesarch.cz sekce Média:
// - černé pozadí, nadpis "Média" vlevo + news-arrow vpravo
// - slider 4 magazine covers visible (portrait ~2:3)
// - effect-border-slide: bílý 8px border slide zdola on hover
// - caption: name (vlevo) + date (vpravo), 16px, flex space-between
// - prev/next chevron arrows
// ─────────────────────────────────────────────────────────────────────────────
function PromoArch01Media({ content, sectionId, tenantSlug, isAdmin }: { content: Record<string, unknown>; sectionId: number; tenantSlug?: string; isAdmin?: boolean }) {
  type Item = { title?: string; issue?: string; imageUrl?: string; href?: string };
  const items   = (content.items as Item[]) ?? [];
  const heading = String(content.heading ?? "Média");

  const FONT  = "'Helvetica Neue', Helvetica, Arial, sans-serif";
  const WHITE = "#ffffff";
  const VISIBLE = 4;

  const [idx, setIdx] = useState(0);
  const maxIdx = Math.max(0, items.length - VISIBLE);

  useEffect(() => {
    if (items.length <= VISIBLE) return;
    const t = setInterval(() => setIdx(i => (i >= maxIdx ? 0 : i + 1)), 5000);
    return () => clearInterval(t);
  }, [maxIdx, items.length]);

  const prev = () => setIdx(i => (i <= 0 ? maxIdx : i - 1));
  const next = () => setIdx(i => (i >= maxIdx ? 0 : i + 1));

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
    .a01med {
      background: #000;
      padding: 80px 0 60px;
      color: ${WHITE};
      overflow: hidden;
    }
    .a01med-padded {
      padding: 0 3.5rem;
    }
    .a01med-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 48px;
    }
    .a01med-heading {
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
    .a01med-slider-outer {
      position: relative;
    }
    .a01med-slider-wrap {
      overflow: hidden;
    }
    .a01med-track {
      display: flex;
      width: 100%;
      transition: transform 0.5s ease;
    }
    .a01med-slide {
      flex: 0 0 25%;
      min-width: 0;
      padding-right: 1rem;
    }
    .a01med-card {
      display: block;
      text-decoration: none;
      color: ${WHITE};
      margin-bottom: 2.25rem;
    }
    .a01med-img-wrap {
      overflow: hidden;
      aspect-ratio: 2/3;
      background: #111;
      position: relative;
    }
    .a01med-img-wrap::after {
      content: "";
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 8px;
      background-color: ${WHITE};
      width: 0%;
      transition: width 0.3s ease-in-out;
      z-index: 2;
    }
    .a01med-card:hover .a01med-img-wrap::after { width: 100%; }
    .a01med-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      object-position: center top;
      display: block;
      transition: transform 0.3s ease-in-out;
    }
    .a01med-card:hover .a01med-img { transform: scale(1.03); }
    .a01med-caption {
      padding-top: 1rem;
      display: flex;
      flex-wrap: nowrap;
      justify-content: space-between;
      align-items: flex-start;
      gap: 8px;
    }
    .a01med-name {
      font-family: ${FONT};
      font-size: 16px;
      font-weight: 300;
      color: ${WHITE};
      margin: 0;
      line-height: 1.4;
    }
    .a01med-issue {
      font-family: ${FONT};
      font-size: 13px;
      font-weight: 400;
      color: rgba(255,255,255,0.5);
      margin: 0;
      white-space: nowrap;
      padding-top: 2px;
    }
    .a01med-btn-prev, .a01med-btn-next {
      position: absolute;
      top: 33%;
      transform: translateY(-50%);
      background: transparent;
      border: none;
      cursor: pointer;
      z-index: 3;
      padding: 16px 0;
      display: flex;
      align-items: center;
      justify-content: center;
      color: ${WHITE};
      transition: opacity 0.2s;
    }
    .a01med-btn-prev { left: -2rem; }
    .a01med-btn-next { right: -2rem; }
    .a01med-btn-prev:hover, .a01med-btn-next:hover { opacity: 0.65; }
    @media (max-width: 900px) {
      .a01med-slide { flex: 0 0 33.333%; }
      .a01med-padded { padding: 0 2rem; }
    }
    @media (max-width: 600px) {
      .a01med-slide { flex: 0 0 50%; }
      .a01med-padded { padding: 0 1rem; }
    }
    @media (max-width: 380px) {
      .a01med-slide { flex: 0 0 100%; }
    }
  `;

  const trackShift = -(idx * 25);

  return (
    <>
      <style>{styles}</style>
      <section className="a01med" data-template="arch-01-media">
        <div className="a01med-padded">
          <div className="a01med-header">
            <h2 className="a01med-heading">
              <GenericEditableText sectionId={sectionId} field="heading" value={heading} tag="span" />
              <NewsArrow />
            </h2>
          </div>
          <div className="a01med-slider-outer">
            <div className="a01med-slider-wrap">
              <div className="a01med-track" style={{ transform: `translateX(${trackShift}%)` }}>
                {items.map((item, i) => (
                  <div key={i} className="a01med-slide">
                    <a
                      href={item.href ?? "#"}
                      className="a01med-card"
                      target={item.href?.endsWith(".pdf") ? "_blank" : undefined}
                      rel={item.href?.endsWith(".pdf") ? "noopener noreferrer" : undefined}
                    >
                      <div className="a01med-img-wrap">
                        <GenericEditableImage
                          sectionId={sectionId}
                          field={`items.${i}.imageUrl`}
                          src={item.imageUrl ?? ""}
                          alt={item.title ?? `Média ${i + 1}`}
                          style={{ width: "100%", height: "100%", display: "block" }}
                        >
                          <img src={item.imageUrl} alt={item.title ?? `Média ${i + 1}`} loading="lazy" className="a01med-img" />
                        </GenericEditableImage>
                      </div>
                      <div className="a01med-caption">
                        <p className="a01med-name">
                          <GenericEditableText sectionId={sectionId} field={`items.${i}.title`} value={item.title ?? ""} tag="span" />
                        </p>
                        {item.issue && (
                          <p className="a01med-issue">
                            <GenericEditableText sectionId={sectionId} field={`items.${i}.issue`} value={item.issue} tag="span" />
                          </p>
                        )}
                      </div>
                    </a>
                  </div>
                ))}
              </div>
            </div>
            {items.length > VISIBLE && (
              <>
                <button className="a01med-btn-prev" onClick={prev} aria-label="Předchozí média"><ChevronLeft /></button>
                <button className="a01med-btn-next" onClick={next} aria-label="Další média"><ChevronRight /></button>
              </>
            )}
          </div>
        </div>
      </section>
    </>
  );
}

// ── clean-01-promo ────────────────────────────────────────────────────────────
// Benefit grid: světlé pozadí #f5f5f5, eyebrow + nadpis centrovaně,
// 4 karty ve 2×2 gridu (desktop 4-col) — ikona emoji, tučný titulek, popis.
// ─────────────────────────────────────────────────────────────────────────────
function PromoClean01({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const GREEN = "#69be28";
  const DARK  = "#0d1a20";
  const FONT  = "Arial, Helvetica, sans-serif";

  const title   = String(content.title   ?? "Proč si vybrat nás?");
  const subtitle= String(content.subtitle?? "Kvalita našich služeb je za každých okolností vidět.");
  const eyebrow = String(content.eyebrow ?? "Naše výhody");

  type Item = { icon?: string; title?: string; description?: string };
  const items = (content.items as Item[] | undefined) ?? [];

  const styles = `
    .c01pr-section {
      background: #f5f5f5;
      font-family: ${FONT};
      padding: 5rem 1.5rem;
    }
    .c01pr-header {
      text-align: center;
      margin-bottom: 3.5rem;
    }
    .c01pr-eyebrow {
      display: inline-block;
      font-size: 0.78rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.14em;
      color: ${GREEN};
      margin-bottom: 0.75rem;
    }
    .c01pr-title {
      font-size: clamp(1.6rem, 3vw, 2.4rem);
      font-weight: 700;
      color: ${DARK};
      margin: 0 0 0.75rem;
    }
    .c01pr-subtitle {
      font-size: 1rem;
      color: #666;
      max-width: 560px;
      margin: 0 auto;
      line-height: 1.6;
    }
    .c01pr-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 1.5rem;
      max-width: 1100px;
      margin: 0 auto;
    }
    @media (max-width: 63.99rem) {
      .c01pr-grid { grid-template-columns: repeat(2, 1fr); }
    }
    @media (max-width: 39.99rem) {
      .c01pr-grid { grid-template-columns: 1fr; }
    }
    .c01pr-card {
      background: #ffffff;
      border-radius: 6px;
      padding: 2.2rem 1.8rem;
      box-shadow: 0 2px 12px rgba(0,0,0,0.06);
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      transition: box-shadow 0.2s, transform 0.2s;
    }
    .c01pr-card:hover {
      box-shadow: 0 6px 24px rgba(0,0,0,0.12);
      transform: translateY(-3px);
    }
    .c01pr-icon {
      font-size: 2.4rem;
      margin-bottom: 1rem;
      line-height: 1;
    }
    .c01pr-card-title {
      font-size: 1.05rem;
      font-weight: 700;
      color: ${DARK};
      margin-bottom: 0.6rem;
    }
    .c01pr-card-desc {
      font-size: 0.88rem;
      color: #666;
      line-height: 1.6;
    }
    .c01pr-card-bar {
      display: block;
      width: 2.5rem;
      height: 3px;
      background: ${GREEN};
      border-radius: 2px;
      margin-bottom: 1rem;
    }
  `;

  return (
    <section id="vyhody" className="c01pr-section">
      <style>{styles}</style>
      <div className="c01pr-header">
        <span className="c01pr-eyebrow">
          <GenericEditableText sectionId={sectionId} field="eyebrow" value={eyebrow} tag="span" />
        </span>
        <h2 className="c01pr-title">
          <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
        </h2>
        <p className="c01pr-subtitle">
          <GenericEditableText sectionId={sectionId} field="subtitle" value={subtitle} tag="span" />
        </p>
      </div>
      <div className="c01pr-grid">
        {items.map((item, i) => (
          <div key={i} className="c01pr-card">
            <span className="c01pr-icon">
              <GenericEditableText sectionId={sectionId} field={`items.${i}.icon`} value={String(item.icon ?? "⭐")} tag="span" />
            </span>
            <span className="c01pr-card-bar" />
            <div className="c01pr-card-title">
              <GenericEditableText sectionId={sectionId} field={`items.${i}.title`} value={String(item.title ?? "")} tag="span" />
            </div>
            <div className="c01pr-card-desc">
              <GenericEditableText sectionId={sectionId} field={`items.${i}.description`} value={String(item.description ?? "")} tag="span" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ── klima-01-catalog ──────────────────────────────────────────────────────────
// 1:1 pragoclima.cz: světlé pozadí, eyebrow + title vlevo, 5 karet vpravo
// Červená pouze jako akcent (ikona, hover border, CTA tlačítko)
// ─────────────────────────────────────────────────────────────────────────────
function PromoKlima01Catalog({ content, sectionId, tenantSlug, isAdmin }: { content: Record<string, unknown>; sectionId: number; tenantSlug?: string; isAdmin?: boolean }) {
  const eyebrow = String(content.eyebrow ?? "Ke stažení");
  const title   = String(content.title   ?? "Produktový katalog");
  const subtitle= String(content.subtitle ?? "Prohlédněte si kompletní nabídku klimatizačních jednotek a tepelných čerpadel.");
  const ctaText = String(content.ctaText ?? "Stáhnout katalog");
  const ctaHref = String(content.ctaHref ?? "#");

  const RED  = "#e30016";
  const NAVY = "#182545";
  const FONT = "'Outfit', -apple-system, sans-serif";

  const resolve = (href: string) => resolveDemoHref(href, tenantSlug, isAdmin);

  const katalogy = [
    { img: "/clones/pragoclima/cdn/660bbe9341456f4ce30c9e29/66543f947c64528e698eccd4_Katalog_img_klimatizace.jpg", label: "Klimatizace" },
    { img: "/clones/pragoclima/cdn/660bbe9341456f4ce30c9e29/66543f9423f69ee06866c8a4_Katalog_img_cerpadla.jpg",    label: "Tepelná čerpadla" },
    { img: "/clones/pragoclima/cdn/660bbe9341456f4ce30c9e29/6654541e4472e6df27fcda68_Katalog_img_komercni.jpg",    label: "Komerční" },
    { img: "/clones/pragoclima/cdn/660bbe9341456f4ce30c9e29/66545421e2ba523991b59d73_Katalog_img_chlazeni.jpg",    label: "Chlazení" },
    { img: "/clones/pragoclima/cdn/660bbe9341456f4ce30c9e29/66543f944bfa19bc5e3dacd2_Katalog_img_cisticka.jpg",    label: "Čističky vzduchu" },
  ];

  /* Ikona stažení */
  const DownloadIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 8, verticalAlign: "middle" }}>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
    </svg>
  );

  return (
    <>
    <style>{`
      @media (max-width: 768px) {
        .klima-catalog-header { flex-direction: column !important; align-items: flex-start !important; gap: 24px !important; }
        .klima-catalog-grid { grid-template-columns: repeat(2, 1fr) !important; }
      }
      @media (max-width: 480px) {
        .klima-catalog-grid { grid-template-columns: 1fr !important; }
      }
    `}</style>
    <section
      id="katalog"
      style={{ backgroundColor: "#f7f7f7", padding: "72px 24px", fontFamily: FONT }}
      data-template="klima-01"
    >
      <div style={{ maxWidth: 1280, margin: "0 auto" }}>

        {/* Horní řádek: eyebrow + title + subtitle + CTA */}
        <div className="klima-catalog-header" style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 40, marginBottom: 48 }}>
          <div style={{ maxWidth: 560 }}>
            <p style={{ fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.12em", color: RED, margin: "0 0 10px" }}>
              <GenericEditableText sectionId={sectionId} field="eyebrow" value={eyebrow} tag="span" />
            </p>
            <h2 style={{ fontSize: "clamp(1.6rem, 2.4vw, 2.2rem)", fontWeight: 700, color: NAVY, lineHeight: 1.2, margin: "0 0 14px" }}>
              <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
            </h2>
            <p style={{ fontSize: 15, lineHeight: 1.7, color: "#555", margin: 0 }}>
              <GenericEditableText sectionId={sectionId} field="subtitle" value={subtitle} tag="span" />
            </p>
          </div>
          <a
            href={resolve(ctaHref)}
            data-btn="primary"
            style={{
              flexShrink: 0,
              display: "inline-flex", alignItems: "center",
              backgroundColor: RED, color: "#fff",
              textDecoration: "none", fontWeight: 600, fontSize: 15,
              padding: "13px 28px", borderRadius: 5,
              transition: "background-color 0.2s",
              whiteSpace: "nowrap",
            }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#b50012")}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = RED)}
          >
            <DownloadIcon />
            <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
          </a>
        </div>

        {/* Katalogové karty */}
        <div className="klima-catalog-grid" style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 20 }}>
          {katalogy.map((k, i) => (
            <div
              key={i}
              style={{
                backgroundColor: "#fff",
                borderRadius: 10,
                overflow: "hidden",
                border: "1px solid #e8e8e8",
                cursor: "pointer",
                transition: "transform 0.22s ease, border-color 0.22s ease, box-shadow 0.22s ease",
              }}
              onMouseEnter={e => {
                const el = e.currentTarget as HTMLDivElement;
                el.style.transform = "translateY(-6px)";
                el.style.borderColor = RED;
                el.style.boxShadow = "0 12px 32px rgba(0,0,0,0.10)";
              }}
              onMouseLeave={e => {
                const el = e.currentTarget as HTMLDivElement;
                el.style.transform = "translateY(0)";
                el.style.borderColor = "#e8e8e8";
                el.style.boxShadow = "none";
              }}
            >
              <div style={{ width: "100%", aspectRatio: "4/3", overflow: "hidden" }}>
                <OptimizedPicture
                  src={k.img}
                  alt={k.label}
                  width={260} height={195}
                  style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                />
              </div>
              <div style={{ padding: "14px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: NAVY }}>{k.label}</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={RED} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
    </>
  );
}

// ── floors-01-showrooms ───────────────────────────────────────────────────────
// Zelený pruh: obrázek vlevo + text s lokacemi showroomů vpravo
// ─────────────────────────────────────────────────────────────────────────────
function ShowroomsFloors01({ content, sectionId, tenantSlug, isAdmin }: { content: Record<string, unknown>; sectionId: number; tenantSlug?: string; isAdmin?: boolean }) {
  const GREEN = "#007d47";
  const WHITE = "#ffffff";
  const FONT  = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif";

  const image     = String(content.image ?? "/clones/supellex/user/templates/supellex/assets/images/showroomy3.jpg");
  const bullets   = (content.bullets   as string[]) ?? ["Naši produktoví konzultanti jsou připraveni Vám pomoci s řešením podlahy od A do Z.", "Přehledný a rozsáhlý sortiment, ze kterého si vybere opravdu každý."];
  const locations = (content.locations as Array<{ label: string; href: string }>) ?? [
    { label: "Praha – Letňany", href: "/kontakt" },
    { label: "Brno",            href: "/kontakt" },
    { label: "Plzeň",           href: "/kontakt" },
    { label: "Velká Bíteš",     href: "/kontakt" },
    { label: "Ostrava",         href: "/kontakt" },
  ];

  const resolve = (href: string) => {
    if (!tenantSlug) return href;
    const base = `/demo/${tenantSlug}${isAdmin ? "/admin" : ""}`;
    if (href.startsWith("http") || href.startsWith("#")) return href;
    return `${base}${href.startsWith("/") ? href : "/" + href}`;
  };

  return (
    <>
      <style>{`
        .f01s-loc:hover { background: rgba(255,255,255,0.18) !important; }
        @media (max-width: 768px) { .f01s-layout { flex-direction: column !important; } .f01s-img { height: 220px !important; width: 100% !important; } }
      `}</style>
      <section style={{ background: GREEN, fontFamily: FONT }}>
        <div className="f01s-layout" style={{ maxWidth: 1280, margin: "0 auto", display: "flex", alignItems: "stretch", minHeight: 340 }}>

          {/* Dekorativní panel — parketový vzor + pin ikony */}
          <div className="f01s-img" style={{ width: 380, flexShrink: 0, overflow: "hidden", position: "relative", background: "rgba(0,0,0,0.18)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            {/* Pokud admin nahraje vlastní obrázek, zobrazí se přes SVG */}
            {content.image ? (
              <GenericEditableImage sectionId={sectionId} field="image" src={String(content.image)} alt="Showroom podlah" className="w-full h-full object-cover">
                <img src={String(content.image)} alt="Showroom podlah" loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
              </GenericEditableImage>
            ) : (
              <svg width="320" height="260" viewBox="0 0 320 260" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                {/* Parketový vzor — rybí kost */}
                <g opacity="0.22">
                  {/* Řada 1 */}
                  {[0,1,2,3,4,5].map(col => [0,1,2,3].map(row => (
                    <rect key={`p-${col}-${row}`}
                      x={col * 52 + (row % 2) * 26}
                      y={row * 52 + 10}
                      width={48} height={22}
                      rx="2" fill={WHITE}
                    />
                  )))}
                  {[0,1,2,3,4,5].map(col => [0,1,2,3].map(row => (
                    <rect key={`q-${col}-${row}`}
                      x={col * 52 + (row % 2) * 26}
                      y={row * 52 + 34}
                      width={22} height={48}
                      rx="2" fill={WHITE}
                    />
                  )))}
                </g>
                {/* Showroom building outline */}
                <g transform="translate(80, 60)">
                  {/* Budova */}
                  <rect x="20" y="50" width="120" height="90" rx="2" fill="none" stroke={WHITE} strokeWidth="3" opacity="0.9"/>
                  {/* Střecha */}
                  <path d="M10 52 L80 10 L150 52" stroke={WHITE} strokeWidth="3" fill="none" strokeLinejoin="round" opacity="0.9"/>
                  {/* Dveře */}
                  <rect x="65" y="100" width="30" height="40" rx="2" fill="none" stroke={WHITE} strokeWidth="2.5" opacity="0.9"/>
                  {/* Okna */}
                  <rect x="28" y="68" width="28" height="22" rx="2" fill="none" stroke={WHITE} strokeWidth="2" opacity="0.8"/>
                  <rect x="104" y="68" width="28" height="22" rx="2" fill="none" stroke={WHITE} strokeWidth="2" opacity="0.8"/>
                  {/* Nápis SHOWROOM */}
                  <text x="80" y="158" textAnchor="middle" fill={WHITE} fontSize="13" fontWeight="700" opacity="0.85" fontFamily="-apple-system, sans-serif" letterSpacing="2">SHOWROOM</text>
                  {/* Location pin */}
                  <circle cx="80" cy="190" r="12" fill={WHITE} opacity="0.95"/>
                  <path d="M80 184 C75 184 71 188 71 193 C71 199 80 208 80 208 C80 208 89 199 89 193 C89 188 85 184 80 184Z" fill={GREEN}/>
                  <circle cx="80" cy="193" r="3" fill={WHITE}/>
                </g>
              </svg>
            )}
          </div>

          {/* Text + lokace */}
          <div style={{ flex: 1, padding: "44px 48px", display: "flex", flexDirection: "column", justifyContent: "center", gap: 20 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {bullets.map((b, i) => (
                <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                  <span style={{ color: WHITE, fontSize: 18, lineHeight: 1.4, flexShrink: 0, marginTop: 1 }}>✓</span>
                  <p style={{ color: WHITE, fontSize: 15, lineHeight: 1.6, margin: 0, opacity: 0.92 }}>
                    <GenericEditableText sectionId={sectionId} field={`bullets.${i}`} value={b} tag="span">{b}</GenericEditableText>
                  </p>
                </div>
              ))}
            </div>

            <div style={{ marginTop: 8 }}>
              <p style={{ color: "rgba(255,255,255,0.75)", fontSize: 12, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", margin: "0 0 12px" }}>
                Navštivte nás
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {locations.map((loc, i) => (
                  <a
                    key={i}
                    href={resolve(loc.href)}
                    className="f01s-loc"
                    style={{
                      display: "inline-block", padding: "8px 18px",
                      border: "1.5px solid rgba(255,255,255,0.55)",
                      borderRadius: 3, color: WHITE,
                      fontSize: 13, fontWeight: 600,
                      textDecoration: "none",
                      background: "rgba(255,255,255,0.08)",
                      transition: "background 0.15s",
                    }}
                  >
                    <GenericEditableText sectionId={sectionId} field={`locations.${i}.label`} value={loc.label} tag="span">{loc.label}</GenericEditableText>
                  </a>
                ))}
              </div>
            </div>
          </div>

        </div>
      </section>
    </>
  );
}

// ── floors-01-benefits ────────────────────────────────────────────────────────
// 4-sloupcový grid s ikonami — proč nakupovat u nás
// ─────────────────────────────────────────────────────────────────────────────
function BenefitsFloors01({ content, sectionId, tenantSlug, isAdmin }: { content: Record<string, unknown>; sectionId: number; tenantSlug?: string; isAdmin?: boolean }) {
  const GREEN  = "#007d47";
  const DARK   = "#212529";
  const BORDER = "#e9ecef";
  const FONT   = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif";

  const title = String(content.title ?? "Proč si vybrat naše podlahy?");
  const items = (content.items as Array<{ icon: string; title: string; text: string; href: string }>) ?? [
    { icon: "🏆", title: "Zkušenosti",  text: "Profesionální produktoví konzultanti s léty zkušeností", href: "/sluzby" },
    { icon: "✨", title: "Inspirace",   text: "Rozsáhlý výběr v 6 showroomech po celé ČR",              href: "/sluzby" },
    { icon: "💎", title: "Jedinečnost", text: "Privátní kolekce, které jinde nenajdete",                href: "/sluzby" },
    { icon: "🔧", title: "Odbornost",   text: "Doporučíme vhodného realizátora pro vaši podlahu",       href: "/sluzby" },
  ];

  const resolve = (href: string) => {
    if (!tenantSlug) return href;
    const base = `/demo/${tenantSlug}${isAdmin ? "/admin" : ""}`;
    if (href.startsWith("http") || href.startsWith("#")) return href;
    return `${base}${href.startsWith("/") ? href : "/" + href}`;
  };

  return (
    <>
      <style>{`
        .f01b-card:hover { box-shadow: 0 4px 20px rgba(0,125,71,0.12); transform: translateY(-2px); }
        .f01b-card { transition: box-shadow 0.2s, transform 0.2s; }
        @media (max-width: 768px) {
          .f01b-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 480px) {
          .f01b-grid { grid-template-columns: 1fr !important; }
          .f01b-section { padding: 40px 16px !important; }
        }
      `}</style>
      <section className="f01b-section" style={{ background: "#f8faf9", padding: "64px 20px", fontFamily: FONT }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <GenericEditableText sectionId={sectionId} field="title" value={title} tag="h2" style={{ textAlign: "center", fontSize: 28, fontWeight: 800, color: DARK, margin: "0 0 48px", letterSpacing: "-0.01em" }}>
            {title}
          </GenericEditableText>
          <div className="f01b-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 24 }}>
            {items.map((item, i) => (
              <a
                key={i}
                href={resolve(item.href)}
                className="f01b-card"
                style={{
                  display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center",
                  padding: "36px 24px", background: "#ffffff",
                  border: `1px solid ${BORDER}`, borderRadius: 8,
                  textDecoration: "none",
                }}
              >
                <span style={{ fontSize: 40, marginBottom: 16 }}>{item.icon}</span>
                <GenericEditableText sectionId={sectionId} field={`items.${i}.title`} value={item.title} tag="span" style={{ fontSize: 16, fontWeight: 700, color: GREEN, marginBottom: 10, display: "block" }}>{item.title}</GenericEditableText>
                <GenericEditableText sectionId={sectionId} field={`items.${i}.text`} value={item.text} tag="span" style={{ fontSize: 14, color: "#6c757d", lineHeight: 1.55, display: "block" }}>{item.text}</GenericEditableText>
              </a>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

// ── solar-03-process ──────────────────────────────────────────────────────────
function ProcessSolar03({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const FONT_M = "'Montserrat', 'Inter', sans-serif";
  const ORANGE = "#ff8b00";
  const DARK   = "#222222";
  const GRAY   = "#575757";

  type Step = { title?: string; description?: string };
  const title  = String(content.title  ?? "Postaráme se o Vás");
  const image  = String(content.image  ?? "/templates/solar-03/process.jpg");
  const steps: Step[] = Array.isArray(content.steps) ? (content.steps as Step[]) : [];

  return (
    <>
      <style>{`
        @media (max-width: 768px) {
          .s03pr-row { flex-direction: column !important; }
          .s03pr-left { max-width: 100% !important; }
          .s03pr-right { display: none !important; }
        }
      `}</style>
      <section style={{ background: "#fff", padding: "72px 0 80px" }} data-template="solar-03">
        <div style={{ maxWidth: 1160, margin: "0 auto", padding: "0 24px" }}>
          <h2 style={{ fontFamily: FONT_M, fontWeight: 800, fontSize: "clamp(20px,2.2vw,30px)", color: DARK, textTransform: "uppercase", letterSpacing: "0.02em", margin: "0 0 48px" }}>
            <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
          </h2>
          <div className="s03pr-row" style={{ display: "flex", gap: 56, alignItems: "flex-start" }}>
            {/* Left: steps */}
            <div className="s03pr-left" style={{ flex: "0 0 55%", maxWidth: "55%" }}>
              {steps.map((step, i) => (
                <div key={i} style={{ display: "flex", gap: 20, paddingBottom: i < steps.length - 1 ? 28 : 0, marginBottom: i < steps.length - 1 ? 28 : 0, borderBottom: i < steps.length - 1 ? "1px solid #ebebeb" : "none" }}>
                  <div style={{ flexShrink: 0, width: 38, height: 38, borderRadius: "50%", background: ORANGE, color: "#fff", fontFamily: FONT_M, fontWeight: 800, fontSize: 17, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {i + 1}
                  </div>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontFamily: FONT_M, fontWeight: 700, fontSize: 17, color: DARK, margin: "0 0 8px", lineHeight: 1.3 }}>
                      <GenericEditableText sectionId={sectionId} field={`steps.${i}.title`} value={String(step.title ?? "")} tag="span" />
                    </h3>
                    <p style={{ fontSize: 14, color: GRAY, margin: 0, lineHeight: 1.65 }}>
                      <GenericEditableText sectionId={sectionId} field={`steps.${i}.description`} value={String(step.description ?? "")} tag="span" />
                    </p>
                  </div>
                </div>
              ))}
            </div>
            {/* Right: photo */}
            <div className="s03pr-right" style={{ flex: 1, alignSelf: "stretch", minHeight: 320 }}>
              <GenericEditableImage sectionId={sectionId} field="image" src={image} alt={title} style={{ width: "100%", height: "100%", borderRadius: 6 }}>
                <img src={image} alt={title} loading="lazy" style={{ width: "100%", height: "100%", borderRadius: 6, display: "block", objectFit: "cover" }} />
              </GenericEditableImage>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

/* ─── ProcessSolar02 ─── solar-02 Greenia 5-step how-it-works ───────────── */
function ProcessSolar02({ content, sectionId }: { content: Record<string, unknown>; sectionId: string }) {
  const title    = String(content.title    ?? "Jak to funguje?");
  const subtitle = String(content.subtitle ?? "Od první konzultace po dlouhodobý provoz — vše zařídíme za vás.");
  const steps = (content.steps as Array<{ title: string; description: string }> | undefined) ?? [
    { title: "Konzultace",      description: "Bezplatná úvodní konzultace a zhodnocení objektu. Zjistíme vaši spotřebu a potenciál úspor." },
    { title: "Energetická analýza", description: "Detailní energetický model a výpočet návratnosti. Navrhneme optimální výkon a konfiguraci systému." },
    { title: "Návrh a smlouva", description: "Předložíme konkrétní nabídku na míru. Po odsouhlasení podepíšeme smlouvu a zahájíme projekt." },
    { title: "Realizace",       description: "Zajistíme projekt, povolení, dotace i samotnou montáž certifikovanými partnery. Bez starostí." },
    { title: "Provoz a servis", description: "Monitoring 24/7, pravidelný servis a reporting. Máte přehled o výkonu a úsporách kdykoli online." },
  ];

  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&display=swap" />
      <style>{`        .s02proc { background: #0a2535; padding: 80px 0; }
        .s02proc-inner { max-width: 1160px; margin: 0 auto; padding: 0 24px; }
        .s02proc-head { text-align: center; margin-bottom: 60px; }
        .s02proc-h2 { font-family: 'DM Sans', sans-serif; font-weight: 700; font-size: 38px; color: #fff; margin: 0 0 14px; letter-spacing: -0.5px; line-height: 1.15; }
        .s02proc-sub { font-family: 'DM Sans', sans-serif; font-size: 17px; color: #8fa8b8; max-width: 600px; margin: 0 auto; line-height: 1.6; }
        .s02proc-steps { display: grid; grid-template-columns: repeat(5, 1fr); gap: 0; position: relative; }
        .s02proc-steps::before { content: ''; position: absolute; top: 28px; left: calc(10% + 14px); right: calc(10% + 14px); height: 2px; background: rgba(121,196,79,0.3); z-index: 0; }
        .s02proc-step { display: flex; flex-direction: column; align-items: center; text-align: center; padding: 0 12px; position: relative; z-index: 1; }
        .s02proc-num { width: 56px; height: 56px; border-radius: 50%; background: #79c44f; display: flex; align-items: center; justify-content: center; font-family: 'DM Sans', sans-serif; font-weight: 700; font-size: 20px; color: #fff; margin-bottom: 20px; flex-shrink: 0; box-shadow: 0 0 0 6px rgba(121,196,79,0.15); }
        .s02proc-h3 { font-family: 'DM Sans', sans-serif; font-weight: 700; font-size: 15px; color: #fff; margin: 0 0 8px; line-height: 1.3; }
        .s02proc-p { font-family: 'DM Sans', sans-serif; font-size: 13px; color: #8fa8b8; margin: 0; line-height: 1.6; }
        @media (max-width: 860px) {
          .s02proc-steps { grid-template-columns: 1fr; gap: 32px; }
          .s02proc-steps::before { display: none; }
          .s02proc-step { flex-direction: row; text-align: left; gap: 20px; align-items: flex-start; }
          .s02proc-num { flex-shrink: 0; }
          .s02proc-h2 { font-size: 26px; }
        }
      `}</style>
      <section className="s02proc" id="jak-to-funguje">
        <div className="s02proc-inner">
          <div className="s02proc-head">
            <h2 className="s02proc-h2">
              <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
            </h2>
            <p className="s02proc-sub">
              <GenericEditableText sectionId={sectionId} field="subtitle" value={subtitle} tag="span" />
            </p>
          </div>
          <div className="s02proc-steps">
            {steps.map((step, i) => (
              <div className="s02proc-step" key={i}>
                <div className="s02proc-num">{i + 1}</div>
                <div>
                  <h3 className="s02proc-h3">
                    <GenericEditableText sectionId={sectionId} field={`steps.${i}.title`} value={step.title} tag="span" />
                  </h3>
                  <p className="s02proc-p">
                    <GenericEditableText sectionId={sectionId} field={`steps.${i}.description`} value={step.description} tag="span" />
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

// ── klempir-01-historical ──────────────────────────────────────────────────────
// 1:1 klempirzprahy.cz historical-gallery section:
// - #f5f5f5 bg, padding 80px 0
// - H2 "Specialista na historické opravy" centered + silver underline
// - Section-intro: h3 subtitle centered, p body text (max-width 800px)
// - Gallery grid: repeat(auto-fill, minmax(300px, 1fr)), gap 20px
//   Each item: 250px height, radius 8px, shadow, hover lift + scale(1.08)
// - Footer: italic quote with CSS ::before/::after decorative lines
// ─────────────────────────────────────────────────────────────────────────────
interface HistoricalK01Props {
  content: Record<string, unknown>;
  sectionId: number;
  tenantSlug?: string;
  isAdmin: boolean;
}
type K01HistImg = { url?: string; alt?: string };

function HistoricalKlempir01({ content, sectionId, tenantSlug, isAdmin }: HistoricalK01Props) {
  const FONT   = "'Montserrat', sans-serif";
  const SILVER = "#c0c0c0";
  const DARK   = "#1a1a1a";
  const MEDIUM = "#3a3a3a";
  const GRAY   = "#717171";

  const title    = String(content.title    ?? "Specialista na historické opravy");
  const subtitle = String(content.subtitle ?? "Tradice a preciznost v každém detailu");
  const body     = String(content.body     ?? "");
  const footer   = "Každý projekt je jedinečný a vyžaduje individuální přístup";
  const images   = (Array.isArray(content.images) ? content.images : []) as K01HistImg[];

  return (
    <>
      <style>{`
        .k01-hist { background: #f5f5f5; padding: 80px 0; position: relative; font-family: ${FONT}; }
        .k01-hist::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 1px; background: rgba(0,0,0,0.05); }
        .k01-hist-container { width: 90%; max-width: 1200px; margin: 0 auto; padding: 0 15px; }
        .k01-hist-h2 { font-size: 36px; font-weight: 600; color: ${DARK}; text-align: center; margin-bottom: 50px; position: relative; font-family: ${FONT}; }
        .k01-hist-h2::after { content: ''; display: block; width: 80px; height: 3px; background: ${SILVER}; margin: 15px auto 0; }
        .k01-hist-intro { text-align: center; max-width: 800px; margin: 0 auto 50px; }
        .k01-hist-intro h3 { font-size: 22px; color: ${MEDIUM}; margin-bottom: 15px; font-weight: 600; font-family: ${FONT}; }
        .k01-hist-intro p { color: ${GRAY}; font-size: 16px; line-height: 1.7; white-space: pre-line; }
        .k01-hist-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px; margin-bottom: 40px; }
        .k01-hist-item { border-radius: 8px; overflow: hidden; box-shadow: 0 5px 15px rgba(0,0,0,0.1); position: relative; height: 250px; transition: all 0.3s ease; }
        .k01-hist-item:hover { transform: translateY(-5px); box-shadow: 0 12px 25px rgba(0,0,0,0.15); }
        .k01-hist-item img { width: 100%; height: 100%; object-fit: cover; transition: all 0.5s ease; display: block; }
        .k01-hist-item:hover img { transform: scale(1.08); }
        .k01-hist-footer { text-align: center; margin-top: 40px; }
        .k01-hist-footer p { font-style: italic; color: ${GRAY}; position: relative; display: inline-block; padding: 0 20px; font-size: 18px; line-height: 1.5; }
        .k01-hist-footer p::before, .k01-hist-footer p::after { content: ''; display: inline-block; width: 40px; height: 1px; background: ${GRAY}; vertical-align: middle; margin: 0 15px; }
        @media (max-width: 992px) {
          .k01-hist-grid { grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); }
        }
        @media (max-width: 768px) {
          .k01-hist-grid { grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); }
          .k01-hist-item { height: 200px; }
        }
      `}</style>

      <section id="historicke" className="k01-hist" data-template="klempir-01">
        <div className="k01-hist-container">
          <h2 className="k01-hist-h2">
            <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
          </h2>

          <div className="k01-hist-intro">
            <h3>
              <GenericEditableText sectionId={sectionId} field="subtitle" value={subtitle} tag="span" />
            </h3>
            <p>
              <GenericEditableText sectionId={sectionId} field="body" value={body} tag="span" />
            </p>
          </div>

          <div className="k01-hist-grid">
            {images.map((img, i) => {
              const src = String(img.url ?? "");
              const alt = String(img.alt ?? "");
              return (
                <div key={i} className="k01-hist-item">
                  <GenericEditableImage sectionId={sectionId} field={`images.${i}.url`} src={src} alt={alt} style={{}}>
                    <img src={src} alt={alt} loading="lazy" />
                  </GenericEditableImage>
                </div>
              );
            })}
          </div>

          <div className="k01-hist-footer">
            <p>{footer}</p>
          </div>
        </div>
      </section>
    </>
  );
}

// ── malir-01-promo ────────────────────────────────────────────────────────────
function PromoMalir01({ content, sectionId, isAdmin: _isAdmin }: { content: Record<string, unknown>; sectionId: number; isAdmin: boolean }) {
  const AMBER    = "#E79B0E";
  const DARK     = "#1a1a1a";
  const MUTED    = "#555555";
  const PLAYFAIR = "'Playfair Display', 'Times New Roman', serif";
  const RALEWAY  = "'Raleway', sans-serif";

  const tagline = String(content.tagline ?? "Proč si vybrat nás");
  const title   = String(content.title   ?? "Naše benefity");

  type BenefitItem = { icon: string; title: string; description: string };
  const defaultItems: BenefitItem[] = [
    { icon: "⚡", title: "Rychlé provedení",  description: "Zakázky řešíme rychle a vždy od nás uslyšíte konkrétní termín." },
    { icon: "✨", title: "Dokonalá bělost",   description: "Používáme jen kvalitní barvy Primalex a Dulux. Díky nim budou vaše zdi na dlouho čistě bílé." },
    { icon: "🧹", title: "Úklid",             description: "V rámci zakázky garantujeme i pečlivý úklid." },
    { icon: "🛡️", title: "Záruka 1 rok",      description: "Za svojí prací si stojíme. Proto poskytujeme záruku 1 rok." },
    { icon: "🎨", title: "Návrh designu",     description: "Pomůžeme vám nejenom s výběrem barev a odstínů." },
  ];
  const items: BenefitItem[] = Array.isArray(content.items) && (content.items as unknown[]).length
    ? (content.items as BenefitItem[])
    : defaultItems;

  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@800&family=Raleway:wght@400;600;700&display=swap" />
      <style>{`        .m01p-section { background: #ffffff; padding: 80px 30px; font-family: ${RALEWAY}; }
        .m01p-header { text-align: center; margin-bottom: 52px; }
        .m01p-tagline { font-size: 13px; font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase; color: ${AMBER}; margin-bottom: 12px; }
        .m01p-title { font-family: ${PLAYFAIR}; font-size: 36px; font-weight: 800; color: ${DARK}; margin: 0; }
        .m01p-grid { display: flex; gap: 24px; justify-content: center; flex-wrap: wrap; max-width: 1100px; margin: 0 auto; }
        .m01p-card { flex: 1 1 160px; max-width: 200px; text-align: center; padding: 8px 12px; }
        .m01p-icon { font-size: 44px; line-height: 1; margin-bottom: 16px; display: block; }
        .m01p-name { font-family: ${RALEWAY}; font-size: 15px; font-weight: 700; color: ${DARK}; margin: 0 0 10px; }
        .m01p-desc { font-size: 14px; line-height: 1.7; color: ${MUTED}; margin: 0; }
        @media (max-width: 600px) { .m01p-section { padding: 60px 20px; } .m01p-card { flex: 1 1 140px; max-width: 160px; } .m01p-icon { font-size: 36px; } }
      `}</style>

      <section id="benefity" className="m01p-section" data-template="malir-01">
        <div className="m01p-header">
          <p className="m01p-tagline">
            <GenericEditableText sectionId={sectionId} field="tagline" value={tagline} tag="span">{tagline}</GenericEditableText>
          </p>
          <h2 className="m01p-title">
            <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span">{title}</GenericEditableText>
          </h2>
        </div>
        <div className="m01p-grid">
          {items.map((item, i) => (
            <div key={i} className="m01p-card">
              <span className="m01p-icon">
                <GenericEditableText sectionId={sectionId} field={`items.${i}.icon`} value={item.icon} tag="span">{item.icon}</GenericEditableText>
              </span>
              <h3 className="m01p-name">
                <GenericEditableText sectionId={sectionId} field={`items.${i}.title`} value={item.title} tag="span">{item.title}</GenericEditableText>
              </h3>
              <p className="m01p-desc">
                <GenericEditableText sectionId={sectionId} field={`items.${i}.description`} value={item.description} tag="span">{item.description}</GenericEditableText>
              </p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

// ── clean-02-promo (benefit cards) ────────────────────────────────────────────
function PromoClean02({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const eyebrow = String(content.eyebrow ?? "Naše výhody");
  const title   = String(content.title   ?? "Výhody Modrého žraloka");
  const sub     = String(content.subtitle ?? "Nemusíte se o nic starat – vše zařídíme za vás. Od prvotního kontaktu až po finální kontrolu úklidu. Díky pevným procesům, vyškolenému týmu a férovému přístupu.");
  const items   = (content.items as Array<{ icon?: string; title?: string; description?: string }>) ?? [];

  const NAVY = "#0e0e53";
  const BLUE = "#019dff";

  return (
    <>
      <style>{`
        .c02p-section {
          background: #fff;
          padding: 5.5rem 5%;
          font-family: 'Onest', sans-serif;
        }
        .c02p-inner { max-width: 80rem; margin: 0 auto; }

        /* 2-col header */
        .c02p-header {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 3rem;
          align-items: end;
          margin-bottom: 3.5rem;
        }
        .c02p-tagline {
          display: inline-flex; align-items: center; gap: 0.5rem;
          font-size: 0.78rem; font-weight: 700; letter-spacing: 0.12em;
          text-transform: uppercase; color: ${BLUE};
          margin-bottom: 0.85rem;
        }
        .c02p-tagline-dot {
          width: 6px; height: 6px; border-radius: 50%;
          background: ${BLUE}; flex-shrink: 0;
        }
        .c02p-h2 {
          font-family: 'Bricolage Grotesque', sans-serif;
          font-size: clamp(1.75rem, 3.5vw, 2.5rem);
          font-weight: 800; color: ${NAVY};
          line-height: 1.15; margin: 0;
          letter-spacing: -0.02em;
        }
        .c02p-h2 span { color: ${BLUE}; }
        .c02p-sub {
          font-size: 1.05rem; color: #3d4d7a;
          line-height: 1.7; margin: 0;
        }
        .c02p-sub strong { color: ${NAVY}; font-weight: 600; }

        /* 4-col grid */
        .c02p-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1.5rem;
        }
        .c02p-card {
          border: 1px solid #dfecff;
          border-radius: 12px;
          padding: 1.75rem 1.5rem;
          background: #fff;
          transition: box-shadow 0.25s, transform 0.2s, border-color 0.2s;
        }
        .c02p-card:hover {
          box-shadow: 0 12px 40px -12px rgba(1,157,255,0.18);
          transform: translateY(-3px);
          border-color: rgba(1,157,255,0.35);
        }
        .c02p-img-wrap {
          width: 72px; height: 72px;
          border-radius: 10px; overflow: hidden;
          margin-bottom: 1.25rem;
          box-shadow: 0 4px 16px rgba(14,14,83,0.08);
        }
        .c02p-img-wrap img {
          width: 100%; height: 100%; object-fit: cover; display: block;
        }
        .c02p-card-title {
          font-family: 'Bricolage Grotesque', sans-serif;
          font-size: 1.1rem; font-weight: 700;
          color: ${NAVY}; margin: 0 0 0.6rem;
        }
        .c02p-card-desc {
          font-size: 0.9rem; color: #4b5d8a;
          line-height: 1.65; margin: 0;
        }
        .c02p-card-desc strong { color: ${NAVY}; font-weight: 600; }

        @media (max-width: 960px) {
          .c02p-header { grid-template-columns: 1fr; gap: 1.5rem; }
          .c02p-grid   { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 500px) {
          .c02p-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <section className="c02p-section" id="proc-s-nami" data-template="clean-02-promo">
        <div className="c02p-inner">

          {/* 2-col header */}
          <div className="c02p-header">
            <div>
              <div className="c02p-tagline">
                <span className="c02p-tagline-dot" aria-hidden />
                <GenericEditableText sectionId={sectionId} field="eyebrow" value={eyebrow} tag="span" />
              </div>
              <h2 className="c02p-h2">
                Úklid <span>bez starostí</span> od začátku do konce
              </h2>
            </div>
            <p className="c02p-sub">
              <GenericEditableText sectionId={sectionId} field="subtitle" value={sub} tag="span" />
            </p>
          </div>

          {/* benefit cards */}
          <div className="c02p-grid">
            {items.map((item, i) => (
              <div key={i} className="c02p-card">
                {item.icon && (
                  <div className="c02p-img-wrap">
                    <img src={item.icon} alt="" loading="lazy" />
                  </div>
                )}
                <h3 className="c02p-card-title">
                  <GenericEditableText sectionId={sectionId} field={`items.${i}.title`} value={item.title ?? ""} tag="span" />
                </h3>
                <p className="c02p-card-desc">
                  <GenericEditableText sectionId={sectionId} field={`items.${i}.description`} value={item.description ?? ""} tag="span" />
                </p>
              </div>
            ))}
          </div>

        </div>
      </section>
    </>
  );
}

/* ─── garden-02: TV / Vimeo promo ─────────────────────────────────────────── */
function TvGarden02({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const title        = (content.title        as string) ?? "";
  const subtitle     = (content.subtitle     as string) ?? "";
  const videoUrl     = (content.videoUrl     as string) ?? "";
  const videoTitle   = (content.videoTitle   as string) ?? "";
  const thumbnailUrl = (content.thumbnailUrl as string) ?? "";
  const thumbnailAlt = (content.thumbnailAlt as string) ?? "";

  const [playing, setPlaying] = useState(false);

  return (
    <>
      <style>{`
        .g02tv-section { background: #f5f5f0; padding: 80px 0; font-family: 'Inter', Arial, sans-serif; }
        .g02tv-inner   { max-width: 900px; margin: 0 auto; padding: 0 24px; text-align: center; }
        .g02tv-kicker  { display: inline-flex; align-items: center; gap: 8px; font-size: 0.8rem; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: #95c11f; margin-bottom: 16px; }
        .g02tv-kicker::before, .g02tv-kicker::after { content: ""; display: block; width: 28px; height: 2px; background: #95c11f; }
        .g02tv-h2      { font-size: clamp(1.5rem, 3vw, 2.1rem); font-weight: 800; color: #1a2a0a; margin: 0 0 12px; line-height: 1.2; }
        .g02tv-sub     { font-size: 1.05rem; color: #555; max-width: 680px; margin: 0 auto 36px; line-height: 1.6; }
        .g02tv-wrap    { position: relative; padding-bottom: 56.25%; height: 0; border-radius: 12px; overflow: hidden; box-shadow: 0 8px 40px rgba(0,0,0,0.13); cursor: pointer; }
        .g02tv-wrap iframe { position: absolute; inset: 0; width: 100%; height: 100%; border: none; }
        .g02tv-thumb   { position: absolute; inset: 0; }
        .g02tv-thumb img { width: 100%; height: 100%; object-fit: cover; display: block; }
        .g02tv-play    { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; background: rgba(0,0,0,0.3); transition: background 0.2s; }
        .g02tv-wrap:hover .g02tv-play { background: rgba(0,0,0,0.45); }
        .g02tv-play-btn { width: 72px; height: 72px; background: #95c11f; border-radius: 50%; display: flex; align-items: center; justify-content: center; transition: transform 0.2s; }
        .g02tv-wrap:hover .g02tv-play-btn { transform: scale(1.1); }
        @media (max-width: 640px) { .g02tv-section { padding: 56px 0; } }
      `}</style>
      <section className="g02tv-section">
        <div className="g02tv-inner">
          <div className="g02tv-kicker">TV</div>
          <h2 className="g02tv-h2"><GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" /></h2>
          {subtitle && <p className="g02tv-sub"><GenericEditableText sectionId={sectionId} field="subtitle" value={subtitle} tag="span" /></p>}
          {videoUrl && (
            <div className="g02tv-wrap" onClick={() => setPlaying(true)}>
              {playing ? (
                <iframe
                  src={`${videoUrl}${videoUrl.includes("?") ? "&" : "?"}autoplay=1`}
                  title={videoTitle}
                  allow="autoplay; fullscreen; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <>
                  {thumbnailUrl && (
                    <div className="g02tv-thumb">
                      <GenericEditableImage sectionId={sectionId} field="thumbnailUrl" src={thumbnailUrl} alt={thumbnailAlt} style={{ width: "100%", height: "100%" }}>
                        <img src={thumbnailUrl} alt={thumbnailAlt} loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                      </GenericEditableImage>
                    </div>
                  )}
                  <div className="g02tv-play">
                    <div className="g02tv-play-btn">
                      <svg width="26" height="26" viewBox="0 0 24 24" fill="white"><polygon points="5,3 19,12 5,21" /></svg>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </section>
    </>
  );
}

/* ─── garden-02: Media (dark, 2 video embeds) ─────────────────────────────── */
function MediaGarden02({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const title    = (content.title    as string) ?? "";
  const subtitle = (content.subtitle as string) ?? "";
  const items = ((content.items as Array<{
    badge?: string; badgeColor?: string;
    thumbnailUrl?: string; thumbnailAlt?: string;
    videoUrl?: string; videoTitle?: string;
  }>) ?? []).slice(0, 4);

  const [active, setActive] = useState<number | null>(null);

  return (
    <>
      <style>{`
        .g02med-section  { background: linear-gradient(160deg, #1a2a0a 0%, #0f1a06 100%); padding: 80px 0; font-family: 'Inter', Arial, sans-serif; }
        .g02med-inner    { max-width: 1100px; margin: 0 auto; padding: 0 24px; }
        .g02med-head     { text-align: center; margin-bottom: 48px; }
        .g02med-kicker   { display: inline-flex; align-items: center; gap: 8px; font-size: 0.8rem; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: #95c11f; margin-bottom: 16px; }
        .g02med-kicker::before, .g02med-kicker::after { content: ""; display: block; width: 28px; height: 2px; background: #95c11f; }
        .g02med-h2       { font-size: clamp(1.5rem, 3vw, 2.1rem); font-weight: 800; color: #fff; margin: 0 0 12px; line-height: 1.2; }
        .g02med-sub      { font-size: 1rem; color: rgba(255,255,255,0.65); max-width: 640px; margin: 0 auto; line-height: 1.6; }
        .g02med-grid     { display: grid; gap: 24px; grid-template-columns: repeat(auto-fit, minmax(min(440px,100%), 1fr)); }
        .g02med-card     { position: relative; border-radius: 12px; overflow: hidden; background: rgba(255,255,255,0.05); cursor: pointer; }
        .g02med-thumb    { position: relative; padding-bottom: 56.25%; background: #111; }
        .g02med-thumb img{ position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; transition: opacity 0.3s; }
        .g02med-play     { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; background: rgba(0,0,0,0.35); transition: background 0.2s; }
        .g02med-card:hover .g02med-play { background: rgba(0,0,0,0.5); }
        .g02med-play-btn { width: 64px; height: 64px; background: #95c11f; border-radius: 50%; display: flex; align-items: center; justify-content: center; transition: transform 0.2s; }
        .g02med-card:hover .g02med-play-btn { transform: scale(1.1); }
        .g02med-badge    { position: absolute; top: 14px; left: 14px; font-size: 0.72rem; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: #fff; padding: 4px 10px; border-radius: 4px; }
        .g02med-iframe   { position: absolute; inset: 0; width: 100%; height: 100%; border: none; }
        @media (max-width: 640px) { .g02med-section { padding: 56px 0; } }
      `}</style>
      <section className="g02med-section">
        <div className="g02med-inner">
          <div className="g02med-head">
            <div className="g02med-kicker">Média</div>
            <h2 className="g02med-h2"><GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" /></h2>
            {subtitle && <p className="g02med-sub"><GenericEditableText sectionId={sectionId} field="subtitle" value={subtitle} tag="span" /></p>}
          </div>
          <div className="g02med-grid">
            {items.map((item, i) => (
              <div key={i} className="g02med-card" onClick={() => setActive(active === i ? null : i)}>
                <div className="g02med-thumb">
                  {active === i && item.videoUrl ? (
                    <iframe className="g02med-iframe" src={`${item.videoUrl}${item.videoUrl.includes("youtube") ? "&autoplay=1" : "?autoplay=1"}`} title={item.videoTitle ?? ""} allow="autoplay; fullscreen" allowFullScreen />
                  ) : (
                    <>
                      {item.thumbnailUrl && <img src={item.thumbnailUrl} alt={item.thumbnailAlt ?? ""} loading="lazy" />}
                      <div className="g02med-play">
                        <div className="g02med-play-btn">
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="white"><polygon points="5,3 19,12 5,21" /></svg>
                        </div>
                      </div>
                      {item.badge && (
                        <span className="g02med-badge" style={{ background: item.badgeColor ?? "#333" }}>
                          <GenericEditableText sectionId={sectionId} field={`items.${i}.badge`} value={item.badge} tag="span" />
                        </span>
                      )}
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

// ── hotel-01-gastro ───────────────────────────────────────────────────────────
function PromoHotel01Gastro({ content, sectionId, isAdmin }: { content: Record<string, unknown>; sectionId: number; isAdmin: boolean }) {
  const c              = (content ?? {}) as Record<string, any>;
  const eyebrow        = c.eyebrow        ?? "Gastronomie";
  const title          = c.title          ?? "Café Palace";
  const body           = c.body           ?? "";
  const cta1Text       = c.cta1Text       ?? "Prohlédnout menu";
  const cta1Href       = c.cta1Href       ?? "#gastro";
  const cta2Text       = c.cta2Text       ?? "Naše gastronomie";
  const cta2Href       = c.cta2Href       ?? "#gastro";
  const backgroundImage = c.backgroundImage ?? "";

  const resolve = (href: string) => (isAdmin ? "#" : href ?? "#");

  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;1,400&family=Poppins:wght@300;400;500&display=swap" />
      <style>{`        .h01gastro {
          position: relative; overflow: hidden;
          min-height: 520px;
          display: flex; align-items: center;
          font-family: 'Poppins', sans-serif;
        }
        .h01gastro-bg {
          position: absolute; inset: 0;
          background-size: cover; background-position: center;
          transform: scale(1.04); transition: transform 8s ease;
        }
        .h01gastro:hover .h01gastro-bg { transform: scale(1); }
        .h01gastro-overlay {
          position: absolute; inset: 0;
          background: linear-gradient(
            to right,
            rgba(30,26,22,0.88) 0%,
            rgba(30,26,22,0.72) 50%,
            rgba(30,26,22,0.18) 100%
          );
        }
        .h01gastro-inner {
          position: relative; z-index: 2;
          max-width: 1200px; margin: 0 auto; width: 100%;
          padding: clamp(60px,8vw,100px) clamp(24px,5vw,80px);
          max-width: 560px;
        }
        .h01gastro-eyebrow {
          font-size: 11px; letter-spacing: 0.22em; text-transform: uppercase;
          color: #a98763; font-weight: 500; margin: 0 0 18px;
        }
        .h01gastro-title {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: clamp(28px, 3.5vw, 48px); font-weight: 400;
          color: #fff; margin: 0 0 24px; line-height: 1.2;
          font-style: italic;
        }
        .h01gastro-body {
          font-size: 15px; line-height: 1.85; color: rgba(255,255,255,0.82);
          font-weight: 300; margin: 0 0 40px;
        }
        .h01gastro-ctas {
          display: flex; gap: 14px; flex-wrap: wrap;
        }
        .h01gastro-cta1 {
          display: inline-flex; align-items: center; justify-content: center;
          border: 1.5px solid rgba(255,255,255,0.6); color: #fff;
          font-family: 'Playfair Display', Georgia, serif;
          font-size: 12px; letter-spacing: 0.14em; text-transform: uppercase;
          padding: 13px 32px; text-decoration: none;
          transition: border-color 0.2s, background 0.2s;
        }
        .h01gastro-cta1:hover { border-color: #a98763; background: rgba(169,135,99,0.15); }
        .h01gastro-cta2 {
          display: inline-flex; align-items: center; justify-content: center;
          background: #879B32; color: #fff;
          font-family: 'Playfair Display', Georgia, serif;
          font-size: 12px; letter-spacing: 0.14em; text-transform: uppercase;
          padding: 13px 32px; text-decoration: none; transition: background 0.2s;
        }
        .h01gastro-cta2:hover { background: #6a7a28; }
        @media (max-width: 640px) {
          .h01gastro-inner { max-width: 100%; }
          .h01gastro-overlay {
            background: linear-gradient(to bottom, rgba(30,26,22,0.82), rgba(30,26,22,0.72));
          }
        }
      `}</style>

      <section className="h01gastro" id="gastro" data-template="hotel-01-gastro">
        <GenericEditableImage sectionId={sectionId} field="backgroundImage" src={backgroundImage || "/placeholder.jpg"} alt="" style={{ position: "absolute", inset: 0 }}>
          <div
            className="h01gastro-bg"
            style={{ backgroundImage: `url('${backgroundImage || "/placeholder.jpg"}')` }}
            aria-hidden="true"
          />
        </GenericEditableImage>
        <div className="h01gastro-overlay" aria-hidden="true" />

        <div className="h01gastro-inner">
          <p className="h01gastro-eyebrow">
            <GenericEditableText sectionId={sectionId} field="eyebrow" value={eyebrow} tag="span" />
          </p>
          <h2 className="h01gastro-title">
            <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
          </h2>
          <p className="h01gastro-body">
            <GenericEditableText sectionId={sectionId} field="body" value={body} tag="span" />
          </p>
          <div className="h01gastro-ctas">
            <a href={resolve(cta1Href)} className="h01gastro-cta1">
              <GenericEditableText sectionId={sectionId} field="cta1Text" value={cta1Text} tag="span" />
            </a>
            <a href={resolve(cta2Href)} className="h01gastro-cta2">
              <GenericEditableText sectionId={sectionId} field="cta2Text" value={cta2Text} tag="span" />
            </a>
          </div>
        </div>
      </section>
    </>
  );
}

// ── chalet-01-activities ──────────────────────────────────────────────────────
function ActivitiesChalet01({ content, sectionId, tenantSlug, isAdmin }: { content: Record<string, unknown>; sectionId: number; tenantSlug?: string; isAdmin: boolean }) {
  const c = (content ?? {}) as Record<string, any>;
  const kicker  = String(c.kicker  ?? "O zážitky není nouze");
  const title   = String(c.title   ?? "Hory nejsou jen o lyžích");
  const body    = String(c.body    ?? "");
  const body2   = String(c.body2   ?? "");
  const ctaText = String(c.ctaText ?? "Aktivity v okolí");
  const ctaHref = String(c.ctaHref ?? "#aktivity");
  const image   = String(c.image   ?? "/clones/chaletmilada/images/galerie/2024-07/Milada-panorama.jpg");

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
      <style>{`        .ch01act {
          background: ${DARK};
          overflow: hidden;
        }
        .ch01act-inner {
          max-width: 1400px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1fr 1fr;
          min-height: 580px;
        }
        /* ── left: text ── */
        .ch01act-text {
          padding: clamp(3.5rem, 7vw, 6rem) clamp(2rem, 6vw, 5rem);
          display: flex;
          flex-direction: column;
          justify-content: center;
        }
        .ch01act-kicker {
          display: block;
          font-family: ${FONT_H};
          font-size: 0.65rem;
          font-weight: 400;
          letter-spacing: 0.32em;
          text-transform: uppercase;
          color: ${BEIGE};
          margin-bottom: 1rem;
        }
        .ch01act-title {
          font-family: ${FONT_H};
          font-size: clamp(1.6rem, 3.2vw, 2.4rem);
          font-weight: 300;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #fff;
          line-height: 1.25;
          margin: 0 0 1.25rem;
        }
        .ch01act-divider {
          width: 40px;
          height: 1px;
          background: ${BEIGE};
          margin-bottom: 1.5rem;
        }
        .ch01act-body {
          font-family: ${FONT_B};
          font-size: 0.92rem;
          line-height: 1.8;
          color: rgba(255,255,255,0.62);
          margin: 0 0 1rem;
        }
        .ch01act-body + .ch01act-body { margin-top: 0; }
        .ch01act-cta {
          display: inline-flex;
          align-items: center;
          gap: 0.6rem;
          margin-top: 2rem;
          padding: 0.72rem 2rem;
          border: 1.5px solid ${BEIGE};
          color: ${BEIGE};
          font-family: ${FONT_H};
          font-size: 0.7rem;
          font-weight: 600;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          text-decoration: none;
          transition: background 0.22s, color 0.22s;
          align-self: flex-start;
        }
        .ch01act-cta:hover {
          background: ${BEIGE};
          color: ${DARK};
        }
        .ch01act-cta svg { transition: transform 0.22s; }
        .ch01act-cta:hover svg { transform: translateX(4px); }
        /* ── right: image ── */
        .ch01act-img-wrap {
          position: relative;
          overflow: hidden;
        }
        .ch01act-img-wrap img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          transition: transform 0.8s ease;
        }
        .ch01act-img-wrap:hover img { transform: scale(1.04); }
        /* subtle dark-left gradient over image */
        .ch01act-img-wrap::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(to right, rgba(30,35,41,0.45) 0%, rgba(30,35,41,0) 40%);
          pointer-events: none;
        }
        @media (max-width: 768px) {
          .ch01act-inner {
            grid-template-columns: 1fr;
          }
          .ch01act-img-wrap {
            min-height: 320px;
            order: -1;
          }
          .ch01act-img-wrap::after { display: none; }
        }
      `}</style>

      <section className="ch01act" id="aktivity" data-template="chalet-01-activities">
        <div className="ch01act-inner">
          <div className="ch01act-text">
            <span className="ch01act-kicker">
              <GenericEditableText sectionId={sectionId} field="kicker" value={kicker} tag="span" />
            </span>
            <h2 className="ch01act-title">
              <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
            </h2>
            <div className="ch01act-divider" />
            {body && (
              <p className="ch01act-body">
                <GenericEditableText sectionId={sectionId} field="body" value={body} tag="span" />
              </p>
            )}
            {body2 && (
              <p className="ch01act-body">
                <GenericEditableText sectionId={sectionId} field="body2" value={body2} tag="span" />
              </p>
            )}
            <a href={resolve(ctaHref)} data-btn="primary" className="ch01act-cta">
              <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </a>
          </div>

          <div className="ch01act-img-wrap">
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

// ── malir-02-promo ────────────────────────────────────────────────────────────
// 1:1 malirstvi-bastar.cz — sekce "Zdarma":
// - Bílé bg, py-80px
// - 3-col layout: velký oranžový tagline "Zdarma." vlevo + H3 uprostřed + text + CTA vpravo
// - Font: Poppins
// ─────────────────────────────────────────────────────────────────────────────
function PromoMalir02({ content, sectionId, tenantSlug, isAdmin }: { content: Record<string, unknown>; sectionId: number; tenantSlug?: string; isAdmin?: boolean }) {
  const ORANGE  = "#ff914d";
  const DARK    = "#232323";
  const POPPINS = "'Poppins', sans-serif";

  const tagline    = String(content.tagline    ?? "Zdarma.");
  const heading    = String(content.heading    ?? "Získejte nezávaznou kalkulaci.");
  const subheading = String(content.subheading ?? "Kontaktujte nás ještě dnes.");
  const ctaLabel   = String(content.ctaLabel   ?? "Napište nám ZDE");
  const ctaHref    = String(content.ctaHref    ?? "#kontakty");

  const resolve = (href: string) => href?.startsWith("#") ? (isAdmin ? "#" : href) : href ?? "#";

  return (
    <>
      <style>{`
        @media (max-width: 900px) {
          .m02promo-grid { grid-template-columns: 1fr !important; text-align: center !important; }
          .m02promo-grid > * { align-items: center !important; }
        }
      `}</style>
      <section style={{ background: "#ffffff", padding: "80px 0", borderTop: "1px solid #e4e4e4" }} data-template="malir-02">
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 30px" }}>
          <div className="m02promo-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1.4fr 1fr", gap: 40, alignItems: "end" }}>
            {/* Tagline */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
              <span style={{ fontFamily: POPPINS, fontWeight: 700, fontSize: 72, lineHeight: 1, color: ORANGE, letterSpacing: "-3px" }}>
                <GenericEditableText sectionId={sectionId} field="tagline" value={tagline} tag="span">{tagline}</GenericEditableText>
              </span>
            </div>
            {/* Heading */}
            <div>
              <h3 style={{ fontFamily: POPPINS, fontWeight: 600, fontSize: 28, color: DARK, lineHeight: 1.3, margin: 0, textTransform: "uppercase", letterSpacing: "-0.5px" }}>
                <GenericEditableText sectionId={sectionId} field="heading" value={heading} tag="span">{heading}</GenericEditableText>
              </h3>
            </div>
            {/* CTA */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 12 }}>
              <p style={{ fontFamily: POPPINS, fontSize: 15, color: "#828282", margin: 0 }}>
                <GenericEditableText sectionId={sectionId} field="subheading" value={subheading} tag="span">{subheading}</GenericEditableText>
              </p>
              <a href={resolve(ctaHref)} data-btn="primary" style={{
                fontFamily: POPPINS, fontWeight: 700, fontSize: 15, color: DARK,
                textDecoration: "none", textTransform: "uppercase", letterSpacing: "0.04em",
                borderBottom: `2px solid ${ORANGE}`, paddingBottom: 2,
                transition: "color 0.2s",
              }}
              onMouseEnter={e => (e.currentTarget.style.color = ORANGE)}
              onMouseLeave={e => (e.currentTarget.style.color = DARK)}
              >
                <GenericEditableText sectionId={sectionId} field="ctaLabel" value={ctaLabel} tag="span">{ctaLabel}</GenericEditableText>
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

// ── hotel-02-packages ─────────────────────────────────────────────────────────
function PromoHotel02Packages({ content, sectionId, isAdmin }: { content: Record<string, unknown>; sectionId: number; isAdmin: boolean }) {
  const c       = (content ?? {}) as Record<string, any>;
  const eyebrow = c.eyebrow ?? "Nejlepší dárek je zážitek!";
  const title   = c.title   ?? "Darujte jeden z našich výhodných balíčků";
  const items: { name: string; validity: string; image: string; detailHref: string; bookHref: string }[] = Array.isArray(c.items) ? c.items : [];

  const resolve = (href: string) => (isAdmin ? "#" : href ?? "#");

  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300&family=Montserrat:wght@300;400;500;600&display=swap" />
      <style>{`        .h02pkg {
          background: #f7f8f9;
          padding: clamp(70px,9vw,110px) clamp(20px,5vw,80px);
          font-family: 'Montserrat', sans-serif;
        }
        .h02pkg-header {
          text-align: center; max-width: 680px; margin: 0 auto clamp(48px,6vw,72px);
        }
        .h02pkg-eyebrow {
          font-size: 10px; font-weight: 500; letter-spacing: 0.28em;
          text-transform: uppercase; color: #96A1AC; margin: 0 0 16px; display: block;
        }
        .h02pkg-title {
          font-family: 'Cormorant Garamond', Georgia, serif;
          font-size: clamp(26px,3vw,42px); font-weight: 300;
          color: #1a2332; line-height: 1.2; margin: 0;
        }
        .h02pkg-grid {
          max-width: 900px; margin: 0 auto;
          display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 28px;
        }
        .h02pkg-card {
          background: #fff;
          box-shadow: 0 4px 24px rgba(26,35,50,0.07);
          display: flex; flex-direction: column;
          transition: box-shadow 0.25s, transform 0.25s;
        }
        .h02pkg-card:hover {
          box-shadow: 0 10px 40px rgba(26,35,50,0.13);
          transform: translateY(-4px);
        }
        .h02pkg-img-wrap { overflow: hidden; aspect-ratio: 16/11; }
        .h02pkg-img {
          width: 100%; height: 100%; object-fit: cover; display: block;
          transition: transform 0.6s ease;
        }
        .h02pkg-card:hover .h02pkg-img { transform: scale(1.05); }
        .h02pkg-body { padding: 28px 28px 32px; flex: 1; display: flex; flex-direction: column; }
        .h02pkg-validity {
          font-size: 10px; font-weight: 500; letter-spacing: 0.22em;
          text-transform: uppercase; color: #96A1AC; margin: 0 0 10px;
        }
        .h02pkg-name {
          font-family: 'Cormorant Garamond', Georgia, serif;
          font-size: clamp(20px,2vw,26px); font-weight: 400;
          color: #1a2332; line-height: 1.2; margin: 0 0 24px; flex: 1;
        }
        .h02pkg-ctas { display: flex; gap: 10px; flex-wrap: wrap; }
        .h02pkg-detail {
          display: inline-flex; align-items: center;
          border: 1.5px solid #96A1AC; color: #96A1AC; background: transparent;
          font-family: 'Montserrat', sans-serif;
          font-size: 10px; font-weight: 600; letter-spacing: 0.18em; text-transform: uppercase;
          padding: 10px 20px; text-decoration: none; transition: background 0.2s, color 0.2s;
        }
        .h02pkg-detail:hover { background: #96A1AC; color: #fff; }
        .h02pkg-book {
          display: inline-flex; align-items: center; gap: 8px;
          background: #1a2332; color: #fff;
          font-family: 'Montserrat', sans-serif;
          font-size: 10px; font-weight: 600; letter-spacing: 0.18em; text-transform: uppercase;
          padding: 10px 20px; text-decoration: none; transition: background 0.2s;
        }
        .h02pkg-book:hover { background: #2d3f57; }
        @media (max-width: 640px) {
          .h02pkg-grid { grid-template-columns: 1fr; max-width: 460px; }
        }
      `}</style>

      <section className="h02pkg" id="balicky" data-template="hotel-02-packages">
        <div className="h02pkg-header">
          <span className="h02pkg-eyebrow">
            <GenericEditableText sectionId={sectionId} field="eyebrow" value={eyebrow} tag="span" />
          </span>
          <h2 className="h02pkg-title">
            <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
          </h2>
        </div>

        <div className="h02pkg-grid">
          {items.map((item, i) => (
            <div key={i} className="h02pkg-card">
              <div className="h02pkg-img-wrap">
                <GenericEditableImage sectionId={sectionId} field={`items.${i}.image`} src={item.image || "/placeholder.jpg"} alt={item.name} style={{ width: "100%", height: "100%" }}>
                  <img src={item.image || "/placeholder.jpg"} alt={item.name} className="h02pkg-img" loading="lazy" />
                </GenericEditableImage>
              </div>
              <div className="h02pkg-body">
                <p className="h02pkg-validity">
                  <GenericEditableText sectionId={sectionId} field={`items.${i}.validity`} value={item.validity} tag="span" />
                </p>
                <h3 className="h02pkg-name">
                  <GenericEditableText sectionId={sectionId} field={`items.${i}.name`} value={item.name} tag="span" />
                </h3>
                <div className="h02pkg-ctas">
                  <a href={resolve(item.detailHref)} className="h02pkg-detail">Detail</a>
                  <a href={resolve(item.bookHref)} className="h02pkg-book">
                    Rezervovat
                    <svg width="13" height="8" viewBox="0 0 13 8" fill="none"><path d="M1 4h11M8 1l3.5 3L8 7" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}



// ── dj-01-whyus ──────────────────────────────────────────────────────────────
// Elegantní číslovaný list s IntersectionObserver animacemi
// Header fade-down, každý řádek slide-in zleva se stagger delay
// ─────────────────────────────────────────────────────────────────────────────
function WhyusDj01({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const ORANGE = "#f15a24";
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const targets = el.querySelectorAll<HTMLElement>(".dj01why-animate");
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          (entry.target as HTMLElement).style.animationPlayState = "running";
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    targets.forEach((t) => obs.observe(t));
    return () => obs.disconnect();
  }, []);

  const heading = String(content.heading ?? "Proč zvolit DJ Agosto?");
  const items   = (content.items ?? []) as string[];

  return (
    <>
      <style>{`
        @keyframes dj01why-fade-down {
          from { opacity: 0; transform: translateY(-20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes dj01why-slide-in {
          from { opacity: 0; transform: translateX(-40px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes dj01why-num-pop {
          0%   { transform: scale(0.6); opacity: 0; }
          60%  { transform: scale(1.08); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
        .dj01why {
          background: #fff;
          padding: 5rem 1.25rem 5.5rem;
        }
        .dj01why-inner {
          max-width: 820px;
          margin: 0 auto;
        }
        .dj01why-header {
          text-align: center;
          margin-bottom: 3.5rem;
          animation: dj01why-fade-down 0.7s ease both;
          animation-play-state: paused;
        }
        .dj01why-header h2 {
          font-size: clamp(1.75rem, 3.5vw, 2.75rem);
          font-weight: 700;
          color: #111;
          margin: 0 0 0.75rem;
          letter-spacing: -0.01em;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
        }
        .dj01why-header-line {
          display: inline-block;
          width: 56px;
          height: 3px;
          background: ${ORANGE};
          border-radius: 2px;
        }
        .dj01why-list {
          list-style: none;
          margin: 0; padding: 0;
        }
        .dj01why-row {
          display: flex;
          align-items: flex-start;
          gap: 1.75rem;
          padding: 1.75rem 0;
          border-bottom: 1px solid #f0f0f0;
          animation: dj01why-slide-in 0.55s cubic-bezier(0.25,0.46,0.45,0.94) both;
          animation-play-state: paused;
        }
        .dj01why-row:first-child { border-top: 1px solid #f0f0f0; }
        .dj01why-num {
          flex-shrink: 0;
          font-size: clamp(2rem, 4.5vw, 3.25rem);
          font-weight: 800;
          color: ${ORANGE};
          line-height: 1;
          min-width: 3.25rem;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
          animation: dj01why-num-pop 0.5s cubic-bezier(0.34,1.56,0.64,1) both;
          animation-play-state: paused;
        }
        .dj01why-text {
          font-size: 1.0625rem;
          color: #444;
          line-height: 1.7;
          padding-top: 0.4rem;
          margin: 0;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
        }
        @media (max-width: 540px) {
          .dj01why-num { font-size: 1.75rem; min-width: 2.5rem; gap: 1rem; }
          .dj01why-text { font-size: 0.9375rem; }
          .dj01why { padding: 3.5rem 1.25rem; }
          .dj01why-row { gap: 1rem; }
        }
      `}</style>

      <section className="dj01why" id="proc-my" data-template="dj-01-whyus" ref={ref}>
        <div className="dj01why-inner">
          <div className="dj01why-header dj01why-animate">
            <GenericEditableText sectionId={sectionId} field="heading" value={heading} tag="h2">
              {heading}
            </GenericEditableText>
            <span className="dj01why-header-line" />
          </div>
          <ol className="dj01why-list">
            {items.map((item, i) => (
              <li key={i} className="dj01why-row dj01why-animate" style={{ animationDelay: `${i * 0.08}s` }}>
                <span className="dj01why-num dj01why-animate" style={{ animationDelay: `${i * 0.08 + 0.1}s` }}>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <GenericEditableText sectionId={sectionId} field={`items.${i}`} value={item} tag="p" className="dj01why-text">
                  {item}
                </GenericEditableText>
              </li>
            ))}
          </ol>
        </div>
      </section>
    </>
  );
}

// ── dj-01-references ─────────────────────────────────────────────────────────
// Tmavý #0f0f0f bg + mřížka log s stagger pop-in animací + hover glow efekt
// ─────────────────────────────────────────────────────────────────────────────
function ReferencesDj01({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const ORANGE = "#f15a24";
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const targets = el.querySelectorAll<HTMLElement>(".dj01ref-animate");
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          (entry.target as HTMLElement).style.animationPlayState = "running";
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });
    targets.forEach((t) => obs.observe(t));
    return () => obs.disconnect();
  }, []);

  const heading = String(content.heading ?? "Reference");
  const items   = (content.items ?? []) as Array<{ name: string; logoUrl: string }>;

  return (
    <>
      <style>{`
        @keyframes dj01ref-fade-up {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes dj01ref-pop {
          0%   { opacity: 0; transform: scale(0.75); }
          70%  { transform: scale(1.04); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
        .dj01ref {
          background: #0c0c0c;
          padding: 5rem 0 4.5rem;
          overflow: hidden;
        }
        .dj01ref-inner {
          max-width: 1100px;
          margin: 0 auto;
          text-align: center;
          padding: 0 1.25rem;
        }
        .dj01ref-header {
          margin-bottom: 3.5rem;
          animation: dj01ref-fade-up 0.7s ease both;
          animation-play-state: paused;
        }
        .dj01ref-header h2 {
          font-size: clamp(1.75rem, 3.5vw, 2.75rem);
          font-weight: 700;
          color: #fff;
          margin: 0 0 0.75rem;
          letter-spacing: -0.01em;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
        }
        .dj01ref-accent {
          display: inline-block;
          width: 56px; height: 3px;
          background: ${ORANGE};
          border-radius: 2px;
        }
        .dj01ref-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          list-style: none; margin: 0; padding: 0;
          border-top: 1px solid #1e1e1e;
          border-left: 1px solid #1e1e1e;
        }
        .dj01ref-item {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2.5rem 1.5rem;
          border-right: 1px solid #1e1e1e;
          border-bottom: 1px solid #1e1e1e;
          box-sizing: border-box;
          position: relative;
          overflow: hidden;
          cursor: default;
          animation: dj01ref-pop 0.55s cubic-bezier(0.34,1.56,0.64,1) both;
          animation-play-state: paused;
          transition: background 250ms ease;
        }
        .dj01ref-item::after {
          content: "";
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at center, rgba(241,90,36,0.07) 0%, transparent 70%);
          opacity: 0;
          transition: opacity 300ms ease;
        }
        .dj01ref-item:hover { background: #161616; }
        .dj01ref-item:hover::after { opacity: 1; }
        .dj01ref-item img {
          display: block;
          height: 52px;
          max-width: 120px;
          width: auto;
          object-fit: contain;
          filter: brightness(0) invert(1) opacity(0.35);
          transition: filter 300ms ease, transform 300ms ease;
          position: relative;
          z-index: 1;
        }
        .dj01ref-item:hover img {
          filter: brightness(0) invert(1) opacity(0.95);
          transform: scale(1.08);
        }
        @media (max-width: 700px) {
          .dj01ref-grid { grid-template-columns: repeat(4, 1fr); }
        }
        @media (max-width: 480px) {
          .dj01ref-grid { grid-template-columns: repeat(3, 1fr); }
          .dj01ref-item { padding: 1.5rem 1rem; }
          .dj01ref-item img { height: 38px; max-width: 90px; }
        }
      `}</style>

      <section className="dj01ref" id="reference" data-template="dj-01-references" ref={ref}>
        <div className="dj01ref-inner">
          <div className="dj01ref-header dj01ref-animate">
            <GenericEditableText sectionId={sectionId} field="heading" value={heading} tag="h2">
              {heading}
            </GenericEditableText>
            <span className="dj01ref-accent" />
          </div>
        </div>
        <ul className="dj01ref-grid" style={{ maxWidth: "1100px", margin: "0 auto" }}>
          {items.map((item, i) => (
            <li key={i} className="dj01ref-item dj01ref-animate" style={{ animationDelay: `${i * 0.06}s` }}>
              <GenericEditableImage sectionId={sectionId} field={`items.${i}.logoUrl`} src={item.logoUrl} alt={item.name} className="">
                <img src={item.logoUrl} alt={item.name} loading="lazy" title={item.name} />
              </GenericEditableImage>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
