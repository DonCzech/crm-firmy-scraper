"use client";

import type { JSX } from "react";
import { useState, useEffect, useRef, Fragment } from "react";
import { GenericEditableText } from "@/components/tenant/GenericEditableText";
import { GenericEditableImage } from "@/components/tenant/GenericEditableImage";
import { OptimizedPicture } from "@/components/OptimizedPicture";

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
  if (variant === "eshop-16-partners") return <PartnersEshop16 content={content} sectionId={sectionId} />;
  if (variant === "eshop-17-calendar") return <CalendarEshop17 content={content} sectionId={sectionId} />;
  if (variant === "eshop-18-network")  return <NetworkEshop18 content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;
  if (variant === "eshop-16-app")      return <AppBannerEshop16 content={content} sectionId={sectionId} />;
  if (variant === "eshop-16-recipes")  return <RecipesEshop16 content={content} sectionId={sectionId} />;
  if (variant === "eshop-20-tiles")    return <TilesEshop20 content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;
  if (variant === "eshop-20-links")    return <LinksEshop20 content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;
  if (variant === "eshop-20-linkhub")  return <LinkHubEshop20 content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;
  if (variant === "eshop-19-picks")    return <PicksEshop19 content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;
  if (variant === "eshop-19-brands")   return <BrandsEshop19 content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;
  if (variant === "eshop-19-links")    return <LinksEshop19 content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;
  if (variant === "nails-01-products") return <ProductsNails01 content={content} sectionId={sectionId} />;
  if (variant === "nails-02-marquee")  return <MarqueeNails02 content={content} sectionId={sectionId} />;
  if (variant === "nails-03-promo")    return <PromoNails03 content={content} sectionId={sectionId} />;
  if (variant === "ortho-01-promo")    return <PromoOrtho01 content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;
  if (variant === "ortho-02-process")  return <ProcessOrtho02 content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;
  if (variant === "dental-01-promo")   return <PromoDental01 content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;
  if (variant === "clinic-02-promo")   return <PromoClinic02 content={content} sectionId={sectionId} />;
  if (variant === "clinic-03-promo")   return <PromoClinic03 content={content} sectionId={sectionId} />;
  if (variant === "cafe-03-promo")     return <PromoCafe03 content={content} sectionId={sectionId} />;
  if (variant === "reality-02-steps")    return <PromoReality02Steps content={content} sectionId={sectionId} />;
  if (variant === "reality-03-listings") return <PromoReality03Listings content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;
  if (variant === "reality-04-ratings")  return <RatingsReality04 content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;
  if (variant === "reality-04-listings") return <ListingsReality04 content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;
  if (variant === "reality-04-detail")   return <DetailReality04 content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;
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
  if (variant === "hotel-01-gastro")      return <PromoHotel01Gastro content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;
  if (variant === "hotel-02-packages")    return <PromoHotel02Packages content={content} sectionId={sectionId} isAdmin={isAdmin} />;
  if (variant === "chalet-01-activities") return <ActivitiesChalet01  content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;
  if (variant === "garden-02-tv")         return <TvGarden02       content={content} sectionId={sectionId} />;
  if (variant === "garden-02-media")      return <MediaGarden02    content={content} sectionId={sectionId} />;
  if (variant === "dj-01-whyus")          return <WhyusDj01        content={content} sectionId={sectionId} />;
  if (variant === "dj-01-references")     return <ReferencesDj01   content={content} sectionId={sectionId} />;
  if (variant === "eshop-15-pro")         return <ProEshop15       content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;
  if (variant === "eshop-15-brands")      return <BrandsEshop15    content={content} sectionId={sectionId} />;
  if (variant === "eshop-15-app")         return <AppEshop15       content={content} sectionId={sectionId} />;
  if (variant === "artist-01-album")      return <AlbumArtist01    content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;
  if (variant === "artist-01-instagram")  return <InstagramArtist01 content={content} sectionId={sectionId} />;
  if (variant === "artist-01-discography") return <DiscographyArtist01 content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;

  if (variant === "promo-2cards") return <Promo2Cards content={content} sectionId={sectionId} />;

  return null;
}

// barber-03 promo. Vlastní komponenta, aby se hooks nevolaly až za early
// returny dispatcheru — jinak změna varianty za běhu mění počet hooks.
function Promo2Cards({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const cards = ((content.cards as PromoCard[]) ?? []).slice(0, 2);

  {
    const eyebrow  = String((content as Record<string, unknown>).eyebrow  ?? "");
    const title    = String((content as Record<string, unknown>).title    ?? "");
    const subtitle = String((content as Record<string, unknown>).subtitle ?? "");
    const sectionRef = useRef<HTMLElement>(null);
    const headerRef  = useRef<HTMLDivElement>(null);
    useEffect(() => {
      const els = [headerRef.current, sectionRef.current].filter(Boolean) as HTMLElement[];
      const obs = els.map((el, i) => {
        const o = new IntersectionObserver(([e]) => { if (e.isIntersecting) { el.style.animationDelay = `${i * 0.15}s`; el.classList.add("b03p-vis"); o.disconnect(); } }, { threshold: 0.1 });
        o.observe(el); return o;
      });
      return () => obs.forEach(o => o.disconnect());
    }, []);
    return (
      <section
        ref={sectionRef}
        className="relative w-full b03-promo"
        style={{
          backgroundColor: "#1c1410",
          padding: "clamp(80px, 12vw, 130px) 0",
          position: "relative",
          overflow: "hidden",
        }}
        data-template="barber-03"
      >
        <style>{`
          @keyframes b03PromoFadeUp { from { opacity:0; transform:translateY(28px); } to { opacity:1; transform:translateY(0); } }
          .b03p-reveal { opacity: 0; }
          .b03p-reveal.b03p-vis { animation: b03PromoFadeUp 0.85s cubic-bezier(.22,.68,0,1.1) forwards; }
        `}</style>

        {/* Top + bottom decorative gold hairlines — clearly separate from hero */}
        <div aria-hidden style={{
          position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)",
          width: 180, height: 1, zIndex: 2,
          background: "linear-gradient(90deg, transparent, #c8a96e 50%, transparent)",
        }} />
        <div aria-hidden style={{
          position: "absolute", bottom: 0, left: "50%", transform: "translateX(-50%)",
          width: 180, height: 1, zIndex: 2,
          background: "linear-gradient(90deg, transparent, rgba(200,169,110,0.5) 50%, transparent)",
        }} />

        {/* Optional header (conditional — pokud má content nějakou hodnotu) */}
        {(eyebrow || title || subtitle) && (
          <div
            ref={headerRef}
            className="b03p-reveal"
            style={{
              textAlign: "center",
              maxWidth: 720,
              margin: "0 auto",
              padding: "0 24px",
              marginBottom: "clamp(56px, 8vw, 80px)",
              position: "relative",
              zIndex: 1,
            }}
          >
            {eyebrow && (
              <div style={{ display: "inline-flex", alignItems: "center", gap: 14, marginBottom: 22 }}>
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
            {title && (
              <h2 style={{
                fontFamily: "'Libre Baskerville', Georgia, serif",
                fontSize: "clamp(2rem, 4.2vw, 3rem)",
                fontWeight: 700,
                lineHeight: 1.12,
                letterSpacing: "0.04em",
                color: "#f5efe6",
                textTransform: "uppercase",
                margin: "0 auto 18px",
                maxWidth: 720,
              }}>
                <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
              </h2>
            )}
            {subtitle && (
              <p style={{
                fontFamily: "'Libre Baskerville', Georgia, serif",
                fontStyle: "italic",
                fontSize: "clamp(0.98rem, 1.4vw, 1.1rem)",
                color: "rgba(245,239,230,0.75)",
                lineHeight: 1.7,
                margin: "0 auto",
                maxWidth: 580,
              }}>
                <GenericEditableText sectionId={sectionId} field="subtitle" value={subtitle} tag="span" />
              </p>
            )}
          </div>
        )}

        <div
          className="max-w-[1280px] mx-auto px-6 lg:px-10 grid"
          style={{
            gap: "clamp(20px, 2.5vw, 32px)",
            gridTemplateColumns: "repeat(auto-fit, minmax(min(360px, 100%), 1fr))",
            position: "relative",
            zIndex: 1,
          }}
        >
          {cards.map((card, i) => {
            const bgFocus = (content as Record<string, unknown>)[`cards.${i}.bgImageFocus`] as { x: number; y: number } | undefined;
            const bgObjPos = bgFocus ? `${bgFocus.x}% ${bgFocus.y}%` : undefined;
            const num = String(i + 1).padStart(2, "0");
            return (
            <div
              key={i}
              className="b03p-card relative overflow-hidden flex flex-col justify-between"
              style={{
                minHeight: 360,
                borderRadius: 4,
                boxShadow: "0 10px 30px rgba(0,0,0,0.4)",
                animation: `b03PromoFadeUp 0.85s cubic-bezier(.22,.68,0,1.1) ${0.3 + i * 0.12}s both`,
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
                    style={{ background: "linear-gradient(180deg, rgba(15,10,7,0.42) 0%, rgba(15,10,7,0.55) 55%, rgba(15,10,7,0.85) 100%)" }}
                  />
                </div>
              )}

              {/* Card number badge top-left — cinematic numbered series */}
              <div aria-hidden style={{
                position: "absolute", top: 22, left: 28, zIndex: 3,
                display: "flex", alignItems: "center", gap: 10,
              }}>
                <span style={{
                  fontFamily: "'Libre Baskerville', Georgia, serif",
                  fontStyle: "italic",
                  fontSize: 13,
                  fontWeight: 400,
                  letterSpacing: "0.2em",
                  color: "#c8a96e",
                }}>{num}</span>
                <span style={{ width: 28, height: 1, backgroundColor: "#c8a96e" }} />
              </div>

              {/* Gold corner accent — top-right, expands on hover */}
              <span aria-hidden className="b03p-corner-tr" style={{
                position: "absolute", top: 18, right: 18, width: 24, height: 24, zIndex: 3,
                borderTop: "1px solid #c8a96e", borderRight: "1px solid #c8a96e",
                transition: "all 0.4s cubic-bezier(.22,.68,0,1.1)",
              }} />
              <span aria-hidden className="b03p-corner-bl" style={{
                position: "absolute", bottom: 18, left: 18, width: 24, height: 24, zIndex: 3,
                borderBottom: "1px solid #c8a96e", borderLeft: "1px solid #c8a96e",
                transition: "all 0.4s cubic-bezier(.22,.68,0,1.1)",
              }} />

              <div className="relative z-10 flex flex-col gap-6 justify-between" style={{
                minHeight: 360,
                padding: "60px 36px 36px",
              }}>
                <ul className="flex flex-col gap-2" style={{
                  color: "#c8a96e",
                  fontFamily: "'Libre Baskerville', Georgia, serif",
                  fontSize: "1.85rem",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  fontWeight: 700,
                  lineHeight: 1.15,
                }}>
                  {(card.bullets ?? []).map((b, bi) => (
                    <li key={bi}>
                      <GenericEditableText sectionId={sectionId} field={`cards.${i}.bullets.${bi}`} value={b} tag="span" />
                    </li>
                  ))}
                </ul>

                <div>
                  {/* Decorative rule before description */}
                  <span aria-hidden style={{
                    display: "block",
                    width: 36, height: 1,
                    backgroundColor: "rgba(200,169,110,0.55)",
                    marginBottom: 16,
                  }} />
                  <p style={{
                    color: "rgba(245,239,230,0.92)",
                    fontFamily: "'Source Sans Pro', system-ui, sans-serif",
                    fontSize: "1rem",
                    lineHeight: 1.6,
                    letterSpacing: "0.02em",
                    fontWeight: 300,
                    maxWidth: 320,
                    margin: 0,
                  }}>
                    <GenericEditableText sectionId={sectionId} field={`cards.${i}.desc`} value={card.desc ?? ""} tag="span" />
                  </p>
                </div>
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

// nails-01 · Kyoto Wabi-Sabi Beauty products — editorial brand rail
// White bg · eyebrow "03 · PARTNEŘI KVALITY" + Georgia H2 s italic accent
// 4-col brand rail s hairline vertical rules · Georgia italic wordmark + tagline
// Burgundy slide-up hover — wordmark → cream
function ProductsNails01({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const BURGUNDY = "#79142b";
  const SERIF    = "Georgia, 'Times New Roman', serif";
  const SANS     = "'Montserrat', 'Helvetica Neue', Arial, sans-serif";

  const eyebrow  = String(content.eyebrow     ?? "03 · PARTNEŘI KVALITY");
  const title    = String(content.title       ?? "Jen to nejlepší");
  const titleAc  = String(content.titleAccent ?? "pro vaše ruce");
  const subtitle = String(content.subtitle    ?? "Značky, kterým věříme — profesionální systémy vybírané roky pečlivě podle složení, výdrže a šetrnosti k nehtům.");
  const trust    = String(content.trust       ?? "Certifikované · cruelty-free · testované ve studiu");
  const brands   = (content.brands as Array<{ name: string; tagline?: string; logoUrl?: string }>) ?? [
    { name: "OPI",         tagline: "profi lakový systém",     logoUrl: "" },
    { name: "CND Shellac", tagline: "hybridní gel · manikúra", logoUrl: "" },
    { name: "Footlogix",   tagline: "medicinální pedikúra",    logoUrl: "" },
    { name: "Kaeso",       tagline: "organic aromaterapie",    logoUrl: "" },
  ];

  return (
    <section
      id="produkty"
      data-template="nails-01"
      data-section-type="products"
      data-variant="nails-01-products"
      className="n01-products"
      style={{ backgroundColor: "#ffffff", padding: "clamp(80px, 11vh, 130px) clamp(24px, 6vw, 80px)", position: "relative", overflow: "hidden" }}
    >
      <div aria-hidden="true" style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        background: "radial-gradient(ellipse at 50% 100%, rgba(121,20,43,0.025), transparent 55%)",
      }} />

      <div style={{ maxWidth: 1180, margin: "0 auto", position: "relative" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "clamp(48px, 6vh, 72px)" }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 14, marginBottom: 22,
            fontFamily: SANS, fontSize: "0.7rem", fontWeight: 300,
            letterSpacing: "0.36em", textTransform: "uppercase", color: BURGUNDY,
          }}>
            <span aria-hidden="true" style={{ width: 60, height: 1, background: BURGUNDY, opacity: 0.5 }} />
            <GenericEditableText sectionId={sectionId} field="eyebrow" value={eyebrow} tag="span" />
            <span aria-hidden="true" style={{ width: 60, height: 1, background: BURGUNDY, opacity: 0.5 }} />
          </div>
          <h2 style={{
            fontFamily: SERIF, fontSize: "clamp(32px, 3.6vw, 52px)",
            fontWeight: 400, color: BURGUNDY, margin: "0 0 22px",
            lineHeight: 1.08, letterSpacing: "-0.005em",
          }}>
            <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
            <span style={{ margin: "0 0.28em", opacity: 0.5, fontStyle: "italic" }}>·</span>
            <em style={{ fontStyle: "italic" }}>
              <GenericEditableText sectionId={sectionId} field="titleAccent" value={titleAc} tag="span" />
            </em>
          </h2>
          <p style={{
            fontFamily: SANS, fontSize: "clamp(14px, 1.05vw, 16px)",
            fontWeight: 300, color: BURGUNDY, opacity: 0.75,
            margin: "0 auto", maxWidth: 620, lineHeight: 1.7,
          }}>
            <GenericEditableText sectionId={sectionId} field="subtitle" value={subtitle} tag="span" />
          </p>
        </div>

        {/* Brand rail — 4-col */}
        <div
          className="n01-products-rail"
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${brands.length}, 1fr)`,
            borderTop: `1px solid rgba(121,20,43,0.28)`,
            borderBottom: `1px solid rgba(121,20,43,0.28)`,
          }}
        >
          {brands.map((b, i) => (
            <div
              key={`n01-brand-${i}`}
              className="n01-brand"
              style={{
                position: "relative",
                padding: "44px 20px",
                textAlign: "center",
                borderLeft: i === 0 ? "none" : `1px solid rgba(121,20,43,0.14)`,
                overflow: "hidden",
              }}
            >
              <span aria-hidden="true" className="n01-brand-swipe" />

              <GenericEditableImage
                sectionId={sectionId}
                field={`brands.${i}.logoUrl`}
                src={b.logoUrl ?? ""}
                alt={b.name}
                style={{ display: "block", position: "relative", zIndex: 1 }}
              >
                {b.logoUrl ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={b.logoUrl}
                    alt={b.name}
                    className="n01-brand-logo"
                    style={{ maxHeight: 46, maxWidth: 160, width: "auto", margin: "0 auto", objectFit: "contain", display: "block" }}
                  />
                ) : (
                  <div className="n01-brand-wordmark" style={{
                    fontFamily: SERIF, fontStyle: "italic",
                    fontSize: "clamp(1.5rem, 2.4vw, 2.1rem)",
                    fontWeight: 400, color: BURGUNDY,
                    lineHeight: 1, letterSpacing: "0.01em",
                  }}>
                    <GenericEditableText sectionId={sectionId} field={`brands.${i}.name`} value={b.name} tag="span" />
                  </div>
                )}
              </GenericEditableImage>

              <div className="n01-brand-tagline" style={{
                marginTop: 14, position: "relative", zIndex: 1,
                fontFamily: SANS, fontSize: "0.66rem",
                fontWeight: 300, letterSpacing: "0.28em",
                textTransform: "uppercase", color: BURGUNDY,
                opacity: 0.7,
              }}>
                <GenericEditableText sectionId={sectionId} field={`brands.${i}.tagline`} value={b.tagline ?? ""} tag="span" />
              </div>
            </div>
          ))}
        </div>

        {/* Trust caption */}
        <div style={{
          marginTop: "clamp(28px, 4vh, 44px)",
          textAlign: "center",
          fontFamily: SERIF, fontStyle: "italic",
          fontSize: "0.95rem", color: BURGUNDY,
          opacity: 0.68,
        }}>
          <span aria-hidden="true" style={{ display: "inline-block", width: 22, height: 1, background: BURGUNDY, verticalAlign: "middle", marginRight: 12, opacity: 0.5 }} />
          <GenericEditableText sectionId={sectionId} field="trust" value={trust} tag="span" />
          <span aria-hidden="true" style={{ display: "inline-block", width: 22, height: 1, background: BURGUNDY, verticalAlign: "middle", marginLeft: 12, opacity: 0.5 }} />
        </div>
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
  const SERIF = "'Cormorant Garamond', Georgia, 'Times New Roman', serif";
  const SANS  = "'Helvetica Neue', Arial, sans-serif";

  const decorNumber   = String(content.decorNumber   ?? "10%");
  const label         = String(content.label         ?? "Nová klientka");
  const message       = String(content.message       ?? "Věnujeme vám 10% slevu na první návštěvu — manikúru, pedikúru nebo podpisový nail design v Premium Nails.");
  const ctaText       = String(content.ctaText       ?? "Rezervovat termín");
  const ctaHref       = String(content.ctaHref       ?? "/kontakt");
  const secondaryText = String(content.secondaryText ?? "Prohlédnout ceník");
  const secondaryHref = String(content.secondaryHref ?? "/cenik");
  const signature     = String(content.signature     ?? "— Nová kolekce 2026");

  return (
    <section
      data-section-type="promo"
      data-variant="nails-02-marquee"
      data-template="nails-02"
      style={{
        position: "relative",
        backgroundColor: WINE,
        padding: "clamp(64px, 9vw, 120px) clamp(24px, 6vw, 72px)",
        overflow: "hidden",
      }}
    >
      {/* Double hairline top border with diamond ornament */}
      <div aria-hidden="true" style={{
        position: "absolute", top: 0, left: 0, right: 0,
        display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
        paddingTop: 24,
      }}>
        <div style={{ width: "100%", height: 1, backgroundColor: `${TAUPE}44` }} />
        <div style={{ width: "100%", height: 1, backgroundColor: `${TAUPE}44` }} />
      </div>
      <div aria-hidden="true" style={{
        position: "absolute", top: 18, left: "50%", transform: "translateX(-50%) rotate(45deg)",
        width: 12, height: 12, backgroundColor: WINE, border: `1px solid ${TAUPE}`,
      }} />

      {/* Bottom mirror */}
      <div aria-hidden="true" style={{
        position: "absolute", bottom: 0, left: 0, right: 0,
        display: "flex", flexDirection: "column-reverse", alignItems: "center", gap: 4,
        paddingBottom: 24,
      }}>
        <div style={{ width: "100%", height: 1, backgroundColor: `${TAUPE}44` }} />
        <div style={{ width: "100%", height: 1, backgroundColor: `${TAUPE}44` }} />
      </div>
      <div aria-hidden="true" style={{
        position: "absolute", bottom: 18, left: "50%", transform: "translateX(-50%) rotate(45deg)",
        width: 12, height: 12, backgroundColor: WINE, border: `1px solid ${TAUPE}`,
      }} />

      {/* Decorative giant 10% */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%,-50%)",
          fontFamily: SERIF,
          fontStyle: "italic",
          fontWeight: 300,
          fontSize: "clamp(12rem, 32vw, 32rem)",
          lineHeight: 0.85,
          color: "transparent",
          WebkitTextStroke: `1px ${TAUPE}`,
          opacity: 0.1,
          pointerEvents: "none",
          userSelect: "none",
          letterSpacing: "-0.03em",
          zIndex: 1,
          whiteSpace: "nowrap",
        }}
      >
        {decorNumber}
      </div>

      {/* Main content */}
      <div
        style={{
          position: "relative",
          zIndex: 2,
          maxWidth: 880,
          margin: "0 auto",
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 22,
        }}
      >
        {/* Kicker row: crescent + label + crescent */}
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M20 12A8 8 0 1 1 12 4a6 6 0 0 0 8 8Z" stroke={TAUPE} strokeWidth="1.2" fill="none"/>
          </svg>
          <span
            style={{
              fontFamily: SANS,
              fontSize: "0.72rem",
              fontWeight: 600,
              color: TAUPE,
              textTransform: "uppercase",
              letterSpacing: "0.4em",
            }}
          >
            <GenericEditableText sectionId={sectionId} field="label" value={label} tag="span" />
          </span>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true" style={{ transform: "scaleX(-1)" }}>
            <path d="M20 12A8 8 0 1 1 12 4a6 6 0 0 0 8 8Z" stroke={TAUPE} strokeWidth="1.2" fill="none"/>
          </svg>
        </div>

        {/* Serif italic message */}
        <p
          style={{
            margin: 0,
            fontFamily: SERIF,
            fontStyle: "italic",
            fontWeight: 400,
            fontSize: "clamp(1.8rem, 3.2vw, 2.8rem)",
            lineHeight: 1.25,
            color: CREAM,
            letterSpacing: "-0.005em",
            maxWidth: 780,
          }}
        >
          <GenericEditableText sectionId={sectionId} field="message" value={message} tag="span" />
        </p>

        {/* Dual CTA row */}
        <div style={{ marginTop: 14, display: "flex", alignItems: "center", gap: 28, flexWrap: "wrap", justifyContent: "center" }}>
          <a
            href={ctaHref}
            data-btn="primary"
            className="n02-promo-cta"
            style={{
              position: "relative",
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
              fontFamily: SANS,
              fontSize: "0.78rem",
              fontWeight: 600,
              color: TAUPE,
              textTransform: "uppercase",
              letterSpacing: "0.28em",
              textDecoration: "none",
              paddingBottom: 8,
              borderBottom: `1px solid ${TAUPE}`,
              transition: "color 0.3s ease, border-color 0.3s ease, letter-spacing 0.3s ease",
            }}
          >
            <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
            <span aria-hidden="true" className="n02-promo-cta-arrow" style={{ display: "inline-block", transition: "transform 0.3s ease" }}>→</span>
          </a>
          <a
            href={secondaryHref}
            className="n02-promo-secondary"
            style={{
              fontFamily: SERIF,
              fontStyle: "italic",
              fontWeight: 400,
              fontSize: "1rem",
              color: CREAM,
              textDecoration: "none",
              opacity: 0.75,
              transition: "opacity 0.3s ease",
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <GenericEditableText sectionId={sectionId} field="secondaryText" value={secondaryText} tag="span" />
            <span aria-hidden="true">→</span>
          </a>
        </div>

        {/* Bottom signature */}
        <div style={{
          marginTop: 8,
          fontFamily: SERIF,
          fontStyle: "italic",
          fontWeight: 400,
          fontSize: "0.92rem",
          color: TAUPE,
          opacity: 0.75,
          letterSpacing: "0.05em",
        }}>
          <GenericEditableText sectionId={sectionId} field="signature" value={signature} tag="span" />
        </div>
      </div>

      <style>{`
        .n02-promo-cta:hover { color: ${CREAM}; border-bottom-color: ${CREAM}; letter-spacing: 0.32em; }
        .n02-promo-cta:hover .n02-promo-cta-arrow { transform: translateX(6px); }
        .n02-promo-secondary:hover { opacity: 1; color: ${TAUPE}; }
      `}</style>
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

  const detail   = String(content.detail ?? "Konzultace zahrnuje Derma SkinScan (3D analýza pleti), individuální doporučení a cenovou kalkulaci.");
  const badgeText = String((content as Record<string,unknown>).badgeText ?? "ZDARMA");
  const badgeSub  = String((content as Record<string,unknown>).badgeSub  ?? "45 minut s lékařem");

  return (
    <section id="konzultace" data-template="clinic-02" style={{ backgroundColor: "#f7f6f5", padding: "clamp(72px,9vw,120px) 0", position: "relative", overflow: "hidden" }}>
      {/* Subtle amber radial accent */}
      <div aria-hidden style={{
        position: "absolute", top: "-180px", right: "-160px",
        width: 480, height: 480, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(255,166,11,0.10) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />

      <div className="c02-promo-inner" style={{
        position: "relative",
        maxWidth: 1200,
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
            fontFamily: FONT_B, fontSize: "0.75rem", fontWeight: 700,
            letterSpacing: "0.22em", textTransform: "uppercase",
            color: AMBER, margin: "0 0 18px",
            display: "inline-flex", alignItems: "center", gap: 12,
          }}>
            <span style={{ width: 28, height: 1, backgroundColor: AMBER }} />
            <GenericEditableText sectionId={sectionId} field="kicker" value={kicker} tag="span" />
          </p>
          <h2 style={{
            fontFamily: FONT_H, fontSize: "clamp(2rem,4vw,3.1rem)", fontWeight: 700,
            color: NAVY, margin: "0 0 24px", lineHeight: 1.08, letterSpacing: "-0.01em",
          }}>
            <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
          </h2>
          <p style={{
            fontFamily: FONT_B, fontSize: "clamp(0.96rem,1.2vw,1.05rem)",
            color: "#606266", lineHeight: 1.8, margin: 0,
          }}>
            <GenericEditableText sectionId={sectionId} field="message" value={message} tag="span" />
          </p>
        </div>

        {/* Right: CTA card with floating badge */}
        <div className="c02-promo-card" style={{
          position: "relative",
          backgroundColor: "#FFFFFF",
          borderRadius: 6,
          borderTop: `4px solid ${AMBER}`,
          padding: "clamp(36px,4vw,52px)",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          gap: 26,
          boxShadow: "0 24px 60px -20px rgba(15,32,62,0.18)",
          transition: "transform .3s ease, box-shadow .3s ease",
        }}>
          {/* Floating "ZDARMA" badge */}
          <div style={{
            position: "absolute",
            top: -22, right: 28,
            backgroundColor: AMBER,
            color: NAVY,
            padding: "10px 18px",
            borderRadius: 999,
            fontFamily: FONT_B,
            fontSize: "0.78rem",
            fontWeight: 800,
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            boxShadow: "0 8px 20px rgba(255,166,11,0.42)",
            display: "inline-flex", alignItems: "center", gap: 8,
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
            <GenericEditableText sectionId={sectionId} field="badgeText" value={badgeText} tag="span" />
          </div>

          {/* Sub-badge "45 min s lékařem" */}
          <p style={{
            fontFamily: FONT_B, fontSize: "0.74rem", fontWeight: 700,
            letterSpacing: "0.18em", textTransform: "uppercase",
            color: NAVY, margin: 0,
            display: "inline-flex", alignItems: "center", gap: 8,
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={AMBER} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            <GenericEditableText sectionId={sectionId} field="badgeSub" value={badgeSub} tag="span" />
          </p>

          <p style={{
            fontFamily: FONT_B, fontSize: "0.96rem", color: "#606266", lineHeight: 1.75, margin: 0,
          }}>
            <GenericEditableText sectionId={sectionId} field="detail" value={detail} tag="span" />
          </p>

          <a
            href={ctaHref}
            className="c02-promo-cta"
            style={{
              display: "inline-flex", alignItems: "center", gap: 10,
              padding: "16px 32px",
              backgroundColor: NAVY,
              color: "#FFFFFF",
              fontFamily: FONT_B,
              fontSize: "0.84rem",
              fontWeight: 700,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              textDecoration: "none",
              borderRadius: 999,
              transition: "background-color .22s ease, transform .22s ease, box-shadow .22s ease",
            }}
          >
            <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="13 5 20 12 13 19"/></svg>
          </a>
        </div>
      </div>

      <style>{`
        .c02-promo-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 32px 70px -18px rgba(15,32,62,0.26);
        }
        .c02-promo-cta:hover {
          background-color: #1a3361 !important;
          transform: translateY(-2px);
          box-shadow: 0 10px 24px rgba(15,32,62,0.28);
        }
        @media (max-width: 768px) {
          #konzultace .c02-promo-inner { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}

// ── clinic-03-promo ────────────────────────────────────────────────────────
// Dark #2D2D2D bg, centrovaný bílý H2 + kicker + body + email input + gold CTA
// Pod tím 3 badges (Superbrand / Nejdůvěryhodnější značka)
// Reference: diamond-look.cz — footer newsletter + ocenění sekce
// ─────────────────────────────────────────────────────────────────────────────
function PromoClinic03({ content, sectionId }: { content: Record<string,unknown>; sectionId: number }) {
  const GOLD   = "#97855F";
  const GOLD_H = "#82734f";
  const WHITE  = "#ffffff";
  const BG     = "#1A1A1A";
  const MUTED  = "rgba(255,255,255,0.6)";
  const SANS   = "'DM Sans', Arial, sans-serif";
  const SERIF  = "'Cormorant Garamond', Georgia, serif";

  const title       = String(content.title       ?? "Získejte exkluzivní nabídky");
  const kicker      = String(content.kicker      ?? "Držitel mezinárodních ocenění kvality");
  const body        = String(content.body        ?? "Přihlaste se k odběru novinek a získejte přístup ke speciálním akcím.");
  const placeholder = String(content.inputPlaceholder ?? "Zadejte váš e-mail");
  const ctaText     = String(content.ctaText     ?? "Odebírat novinky");
  const ctaHref = String(content.ctaHref ?? "#kontakt");
  const badges      = (content.badges as string[]) ?? ["Nejdůvěryhodnější klinika 2025", "Klinika roku ČR & SR", "ISO 9001 certifikace"];

  return (
    <section id="newsletter" data-template="clinic-03" style={{ backgroundColor: BG, padding: "clamp(64px, 8vw, 100px) 0", fontFamily: SANS, position: "relative", overflow: "hidden" }}>
      {/* Subtle diamond pattern bg */}
      <div aria-hidden style={{
        position: "absolute", inset: 0, opacity: 0.03, pointerEvents: "none",
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M20 2 L38 20 L20 38 L2 20 Z' fill='none' stroke='%23ffffff' stroke-width='0.5'/%3E%3C/svg%3E")`,
        backgroundSize: "40px 40px",
      }} />

      <div style={{ position: "relative", maxWidth: 620, margin: "0 auto", padding: "0 clamp(20px, 4vw, 40px)", textAlign: "center" }}>

        {/* Diamond icon */}
        <svg width="24" height="24" viewBox="0 0 30 30" style={{ marginBottom: 20, opacity: 0.35 }} aria-hidden>
          <path d="M15 2 L28 15 L15 28 L2 15 Z" fill="none" stroke={GOLD} strokeWidth="1" />
          <path d="M15 10 L20 15 L15 20 L10 15 Z" fill={GOLD} opacity="0.5" />
        </svg>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, marginBottom: 16 }}>
          <span aria-hidden style={{ display: "block", width: 24, height: 1, backgroundColor: `${GOLD}66` }} />
          <GenericEditableText sectionId={sectionId} field="kicker" value={kicker} tag="p"
            style={{ fontSize: "0.62rem", fontWeight: 500, color: GOLD, letterSpacing: "0.22em", textTransform: "uppercase", margin: 0 }}
          />
          <span aria-hidden style={{ display: "block", width: 24, height: 1, backgroundColor: `${GOLD}66` }} />
        </div>

        <GenericEditableText sectionId={sectionId} field="title" value={title} tag="h2"
          style={{ fontFamily: SERIF, fontSize: "clamp(1.6rem, 2.6vw, 2.2rem)", fontWeight: 300, fontStyle: "italic", color: WHITE, margin: "0 0 16px", lineHeight: 1.2 }}
        />

        <GenericEditableText sectionId={sectionId} field="body" value={body} tag="p"
          style={{ fontFamily: SANS, fontSize: "0.88rem", color: MUTED, lineHeight: 1.7, margin: "0 0 36px" }}
        />

        {/* Email input + CTA */}
        <div style={{ display: "flex", gap: 0, maxWidth: 460, margin: "0 auto 44px" }}>
          <input
            type="email"
            placeholder={placeholder}
            style={{
              flexGrow: 1, height: 48, padding: "0 18px",
              border: `1px solid ${GOLD}33`, borderRight: "none",
              fontSize: "0.82rem", fontFamily: SANS,
              outline: "none", backgroundColor: "rgba(255,255,255,0.05)", color: WHITE,
            }}
          />
          <a href={ctaHref}
            style={{
              display: "inline-flex", alignItems: "center", height: 48, padding: "0 24px",
              backgroundColor: GOLD, color: WHITE, fontFamily: SANS,
              fontSize: "0.68rem", fontWeight: 600, letterSpacing: "0.14em",
              textTransform: "uppercase", textDecoration: "none", whiteSpace: "nowrap",
              transition: "background-color 0.3s ease",
            }}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = GOLD_H; }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = GOLD; }}
          >
            <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
          </a>
        </div>

        {/* Award badges */}
        <div style={{ display: "flex", justifyContent: "center", gap: 10, flexWrap: "wrap" }}>
          {badges.map((b, i) => (
            <span key={i} className="c03-badge" style={{
              display: "inline-flex", alignItems: "center", gap: 7,
              padding: "7px 16px",
              border: `1px solid ${GOLD}30`,
              color: MUTED, fontFamily: SANS, fontSize: "0.68rem",
              letterSpacing: "0.04em",
              transition: "border-color 0.3s ease, color 0.3s ease",
            }}>
              <svg width="10" height="10" viewBox="0 0 12 12" fill={GOLD} style={{ flexShrink: 0 }} aria-hidden>
                <polygon points="6,0 7.5,4 12,4 8.5,6.5 10,11 6,8.5 2,11 3.5,6.5 0,4 4.5,4"/>
              </svg>
              <GenericEditableText sectionId={sectionId} field={`badges.${i}`} value={b} tag="span" />
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── cafe-03-promo ─────────────────────────────────────────────────────────────
// Cathedral Directory Promo — luxe redesign (2026-07-02)
// Noir bg (#0d0d0d), gold-hairline eyebrow + Great Vibes H2, 3 karty s gotickým
// pointed-arch tvarem (SVG clip-path), Cormorant italic číslice 01/02/03,
// hover reveal subtitle + gold border animace, "→ Otevřít" microlink.
// ─────────────────────────────────────────────────────────────────────────────
function PromoCafe03({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const GOLD    = "#C69C60";
  const GOLD_LT = "#D8B57A";
  const GOLD_DK = "#8F6A38";
  const NOIR    = "#0d0d0d";
  const NOIR_D  = "#050505";
  const CREAM   = "#F5EFE4";
  const SCRIPT  = "'Great Vibes', cursive";
  const ITAL    = "'Cormorant Garamond', 'Playfair Display', Georgia, serif";
  const SANS    = "'Inter', 'Open Sans', system-ui, sans-serif";

  const eyebrow = String(content.eyebrow ?? "OBJEVTE");
  const title   = String(content.title   ?? "Tři cesty do Cathedral");
  const kicker  = String(content.kicker  ?? "menu · události · rezervace");
  const items   = (content.items as Array<{ label: string; subtitle?: string; href: string; image: string }>) ?? [];

  const defaultItems = [
    { label: "Akce & večery",     subtitle: "Živá hudba, degustace, klavírní soirée", href: "/",           image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=900&h=1200&fit=crop&fm=webp&q=88" },
    { label: "Naše menu",         subtitle: "Snídaně, obědové menu, večerní bistro",   href: "/nase-menu",  image: "https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=900&h=1200&fit=crop&fm=webp&q=88" },
    { label: "Rezervace stolu",   subtitle: "Zaručený stůl kdykoli mezi 9:00 — 22:00", href: "/kontakt",    image: "https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?w=900&h=1200&fit=crop&fm=webp&q=88" },
  ];
  const cards = items.length > 0 ? items : defaultItems;

  return (
    <section data-template="cafe-03" className="c3promo" style={{ backgroundColor: NOIR, backgroundImage: `linear-gradient(180deg, ${NOIR} 0%, ${NOIR_D} 100%)`, padding: "clamp(80px, 10vw, 140px) 0", fontFamily: SANS, position: "relative", overflow: "hidden" }}>
      {/* Gothic arch watermark corners */}
      <svg aria-hidden width="240" height="360" viewBox="0 0 240 360" style={{ position: "absolute", left: -60, top: 40, opacity: 0.05, pointerEvents: "none" }}>
        <path d="M20 340 V 140 A 100 100 0 0 1 220 140 V 340" stroke={GOLD} strokeWidth="1" fill="none" />
      </svg>

      {/* SVG defs for arch clip */}
      <svg aria-hidden width="0" height="0" style={{ position: "absolute" }}>
        <defs>
          <clipPath id="c3promoArch" clipPathUnits="objectBoundingBox">
            <path d="M0,1 L0,0.28 C0,0.12 0.22,0 0.5,0 C0.78,0 1,0.12 1,0.28 L1,1 Z" />
          </clipPath>
        </defs>
      </svg>

      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 clamp(20px, 5vw, 60px)", position: "relative", zIndex: 1 }}>
        {/* Header */}
        <header style={{ textAlign: "center", marginBottom: "clamp(48px, 6vw, 80px)" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 14, marginBottom: 18 }}>
            <span aria-hidden style={{ display: "inline-block", width: 32, height: 1, backgroundColor: GOLD }} />
            <GenericEditableText sectionId={sectionId} field="eyebrow" value={eyebrow} tag="span">
              <span style={{ fontFamily: SANS, fontSize: 11, fontWeight: 500, letterSpacing: "0.36em", textTransform: "uppercase", color: GOLD_LT }}>{eyebrow}</span>
            </GenericEditableText>
            <span aria-hidden style={{ display: "inline-block", width: 32, height: 1, backgroundColor: GOLD }} />
          </div>
          <GenericEditableText sectionId={sectionId} field="title" value={title} tag="h2">
            <h2 style={{ fontFamily: SCRIPT, fontSize: "clamp(44px, 6vw, 76px)", fontWeight: 400, color: CREAM, margin: 0, lineHeight: 1.05, letterSpacing: "0.005em" }}>{title}</h2>
          </GenericEditableText>
          <GenericEditableText sectionId={sectionId} field="kicker" value={kicker} tag="p">
            <p style={{ fontFamily: ITAL, fontStyle: "italic", fontSize: "clamp(15px, 1.4vw, 18px)", color: GOLD_DK, margin: "10px 0 0", letterSpacing: "0.04em" }}>— {kicker}</p>
          </GenericEditableText>
        </header>

        {/* Cards grid */}
        <div className="c3promo-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "clamp(20px, 3vw, 36px)" }}>
          {cards.map((card, i) => (
            <a
              key={i}
              href={card.href}
              aria-label={card.label}
              className="c3promo-card"
              style={{ display: "block", position: "relative", textDecoration: "none", color: CREAM, transition: "transform 0.4s ease" }}
            >
              {/* Number Cormorant italic */}
              <div className="c3promo-num" style={{ position: "absolute", top: -8, left: 0, zIndex: 3, fontFamily: ITAL, fontStyle: "italic", fontSize: 22, color: GOLD_LT, letterSpacing: "0.05em" }}>
                <span style={{ display: "inline-block", width: 18, height: 1, backgroundColor: GOLD, verticalAlign: "middle", marginRight: 8 }} />
                {String(i + 1).padStart(2, "0")}
              </div>

              {/* Image with gothic arch clip */}
              <div className="c3promo-imgwrap" style={{ position: "relative", aspectRatio: "3/4", overflow: "hidden", clipPath: "url(#c3promoArch)", backgroundColor: NOIR_D }}>
                <GenericEditableImage sectionId={sectionId} field={`items.${i}.image`} src={card.image} alt={card.label} style={{ position: "absolute", inset: 0 }}>
                  <img src={card.image} alt={card.label} className="c3promo-img" style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.9s cubic-bezier(.25,.1,.25,1), filter 0.5s ease" }} loading="lazy" />
                </GenericEditableImage>
                {/* Overlay veil */}
                <div className="c3promo-veil" aria-hidden style={{ position: "absolute", inset: 0, background: `linear-gradient(to top, rgba(13,13,13,0.85) 0%, rgba(13,13,13,0.35) 45%, rgba(13,13,13,0.1) 100%)`, transition: "opacity 0.4s ease" }} />
                {/* Gold arch stroke overlay */}
                <svg aria-hidden viewBox="0 0 100 133.33" preserveAspectRatio="none" className="c3promo-arch-stroke" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", opacity: 0.35, transition: "opacity 0.35s ease" }}>
                  <path d="M0,133.33 L0,37.33 C0,16 29.33,0 50,0 C70.67,0 100,16 100,37.33 L100,133.33" fill="none" stroke={GOLD} strokeWidth="0.6" vectorEffect="non-scaling-stroke" />
                </svg>

                {/* Card content overlay bottom */}
                <div className="c3promo-content" style={{ position: "absolute", left: 0, right: 0, bottom: 0, padding: "clamp(18px, 3%, 32px)", zIndex: 2 }}>
                  <GenericEditableText sectionId={sectionId} field={`items.${i}.label`} value={card.label} tag="div">
                    <div style={{ fontFamily: SCRIPT, fontSize: "clamp(28px, 3.4vw, 44px)", fontWeight: 400, color: "#fff", lineHeight: 1.1, letterSpacing: "0.005em" }}>{card.label}</div>
                  </GenericEditableText>
                  {card.subtitle && (
                    <div className="c3promo-subtitle" style={{ maxHeight: 0, overflow: "hidden", transition: "max-height 0.5s cubic-bezier(.4,0,.2,1), margin-top 0.4s ease" }}>
                      <GenericEditableText sectionId={sectionId} field={`items.${i}.subtitle`} value={card.subtitle} tag="p">
                        <p style={{ fontFamily: ITAL, fontStyle: "italic", fontSize: "clamp(14px, 1.2vw, 16px)", color: "rgba(245,239,228,0.9)", margin: "10px 0 0", lineHeight: 1.5, letterSpacing: "0.02em" }}>{card.subtitle}</p>
                      </GenericEditableText>
                    </div>
                  )}
                  <div className="c3promo-more" style={{ marginTop: 14, display: "inline-flex", alignItems: "center", gap: 8, fontFamily: SANS, fontSize: 10, fontWeight: 600, letterSpacing: "0.28em", textTransform: "uppercase", color: GOLD_LT, opacity: 0, transform: "translateY(6px)", transition: "opacity 0.4s ease 0.1s, transform 0.4s ease 0.1s" }}>
                    Otevřít
                    <span aria-hidden style={{ display: "inline-block", width: 22, height: 1, backgroundColor: GOLD_LT }} />
                  </div>
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>

      <style>{`
        [data-template="cafe-03"].c3promo .c3promo-card:hover .c3promo-img { transform: scale(1.08); }
        [data-template="cafe-03"].c3promo .c3promo-card:hover .c3promo-veil { opacity: 0.85; }
        [data-template="cafe-03"].c3promo .c3promo-card:hover .c3promo-arch-stroke { opacity: 0.85; }
        [data-template="cafe-03"].c3promo .c3promo-card:hover .c3promo-subtitle { max-height: 120px; }
        [data-template="cafe-03"].c3promo .c3promo-card:hover .c3promo-more { opacity: 1 !important; transform: none !important; }
        [data-template="cafe-03"].c3promo .c3promo-card:hover .c3promo-num { color: ${GOLD} !important; }
        @media (max-width: 900px) { [data-template="cafe-03"].c3promo .c3promo-grid { grid-template-columns: 1fr !important; max-width: 480px; margin-left: auto; margin-right: auto; } }
      `}</style>
    </section>
  );
}

// ── reality-02-steps ──────────────────────────────────────────────────────────
// Ref: realitni-pruvodce.cz "Jak fungujeme?" — 4-step numbered process
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
function PromoReality03Listings({ content, sectionId, tenantSlug, isAdmin }: { content: Record<string, unknown>; sectionId: number; tenantSlug?: string; isAdmin?: boolean }) {
  const eyebrowRaw = (content as Record<string, unknown>).eyebrow;
  const titleRaw   = (content as Record<string, unknown>).title;
  const eyebrow = eyebrowRaw === undefined ? "Aktuální nabídka" : String(eyebrowRaw);
  const title   = titleRaw   === undefined ? "Novinky v nabídce" : String(titleRaw);
  const showHeader = !!(eyebrow.trim() || title.trim());
  const allLabel = String(content.allLabel ?? "Všechny nemovitosti");
  const allHref  = String(content.allHref ?? "/nabidka");
  const detailLabel = String(content.detailLabel ?? "Zobrazit detail");
  const items = (content.items as Array<{
    title: string; price: string; location: string; image: string; type?: string;
    disposition?: string; area?: string; id?: number;
  }>) ?? [];
  const siteMode = String(content.siteMode ?? "multipage");
  const showFilters = !!content.showFilters;
  const tabAll  = String(content.tabAllLabel  ?? "Vše");
  const tabSale = String(content.tabSaleLabel ?? "Prodej");
  const tabRent = String(content.tabRentLabel ?? "Pronájem");
  const cols    = Number(content.columns ?? 4);

  const DARK  = "#132538";
  const OCHRE = "#e38a6a";
  const WHITE = "#ffffff";
  const SANS  = "'Helvetica Neue', Helvetica, Arial, sans-serif";

  const detailHref = (i: number) => resolveDemoHref(`/nemovitost?id=${i}`, tenantSlug, isAdmin ?? false);
  const navHref = (href: string) => resolveNavHref(href, siteMode, tenantSlug, isAdmin ?? false);

  const sectionRef = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);
  const [hovered, setHovered] = useState<number | null>(null);
  const [tab, setTab] = useState<"all" | "prodej" | "pronajem">("all");
  const indexed = items.map((it, i) => ({ ...it, _idx: i }));
  const filtered = tab === "all" ? indexed : indexed.filter(it => (it.type ?? "prodej") === tab);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } }, { threshold: 0.08 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const formatPrice = (price: string, type?: string) => {
    const isRent = type === "pronajem";
    return isRent ? `${price} Kč/měs.` : `${price} Kč`;
  };

  return (
    <section ref={sectionRef} id="nabidka" data-template="reality-03" style={{ backgroundColor: DARK, fontFamily: SANS, padding: "clamp(64px, 9vw, 110px) clamp(20px, 4vw, 64px)", overflow: "hidden" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto" }}>

        {/* Heading */}
        {showHeader && (
        <div style={{
          display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: 16,
          marginBottom: "clamp(36px, 5vw, 60px)",
          opacity: visible ? 1 : 0, transform: visible ? "none" : "translateY(24px)",
          transition: "opacity 0.6s ease, transform 0.6s ease",
        }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
              <span aria-hidden style={{ width: 34, height: 2, background: OCHRE }} />
              <GenericEditableText sectionId={sectionId} field="eyebrow" value={eyebrow} tag="span" style={{ fontSize: 11, fontWeight: 700, color: OCHRE, letterSpacing: "4px", textTransform: "uppercase" }} />
            </div>
            <h2 style={{ fontSize: "clamp(1.8rem, 3vw, 2.5rem)", fontWeight: 700, color: WHITE, margin: 0, letterSpacing: "-0.03em", lineHeight: 1.15 }}>
              <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
            </h2>
          </div>
          <a href={navHref(allHref)} className="r03-listings-all" style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 600, color: OCHRE, textDecoration: "none", letterSpacing: "0.08em", textTransform: "uppercase", whiteSpace: "nowrap", paddingBottom: 4, borderBottom: `1px solid rgba(227,138,106,0.4)`, transition: "border-color 0.2s, gap 0.25s" }}>
            <GenericEditableText sectionId={sectionId} field="allLabel" value={allLabel} tag="span" />
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </a>
        </div>
        )}

        {/* Filter tabs */}
        {showFilters && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 34 }}>
            {([["all", tabAll], ["prodej", tabSale], ["pronajem", tabRent]] as const).map(([key, label]) => {
              const active = tab === key;
              return (
                <button key={key} onClick={() => setTab(key)} className="r03-listings-tab" style={{
                  padding: "10px 22px", borderRadius: 99, cursor: "pointer",
                  fontFamily: SANS, fontSize: 13, fontWeight: 600, letterSpacing: "0.04em",
                  border: `1px solid ${active ? OCHRE : "rgba(255,255,255,0.22)"}`,
                  background: active ? OCHRE : "transparent",
                  color: active ? WHITE : "rgba(255,255,255,0.75)",
                  transition: "all 0.25s cubic-bezier(.4,0,.2,1)",
                }}>{label}</button>
              );
            })}
          </div>
        )}

        {/* Grid */}
        <div data-r03-listings-grid style={{ display: "grid", gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 18 }}>
          {filtered.map((item) => {
            const i = item._idx;
            const hov = hovered === i;
            const isRent = item.type === "pronajem";
            const delay = `${(filtered.indexOf(item)) * 0.08}s`;
            return (
              <a
                key={`r03-listing-${i}`}
                href={detailHref(typeof item.id === "number" ? item.id : i)}
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
                className="r03-listing-card"
                style={{
                  display: "block", textDecoration: "none",
                  backgroundColor: WHITE,
                  borderRadius: 10,
                  overflow: "hidden",
                  transition: "transform 0.35s cubic-bezier(.4,0,.2,1), box-shadow 0.35s ease",
                  transform: hov ? "translateY(-8px)" : "none",
                  boxShadow: hov ? "0 26px 56px rgba(0,0,0,0.42)" : "0 4px 16px rgba(0,0,0,0.2)",
                  opacity: visible ? 1 : 0,
                  animation: visible ? `r03ListingFadeUp 0.6s ease ${delay} both` : "none",
                }}
              >
                {/* Image */}
                <div style={{ position: "relative", paddingTop: "68%", overflow: "hidden" }}>
                  <img
                    src={item.image}
                    alt={item.title}
                    style={{
                      position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover",
                      transition: "transform 0.55s cubic-bezier(.4,0,.2,1)",
                      transform: hov ? "scale(1.09)" : "scale(1)",
                    }}
                  />
                  {/* Gradient for legibility */}
                  <span aria-hidden style={{ position: "absolute", inset: 0, background: "linear-gradient(0deg, rgba(19,37,56,0.34) 0%, rgba(19,37,56,0) 42%)" }} />
                  {/* Type badge */}
                  <span style={{
                    position: "absolute", top: 14, left: 14,
                    backgroundColor: isRent ? OCHRE : DARK,
                    color: WHITE,
                    fontSize: 10, fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase",
                    padding: "6px 11px", borderRadius: 4,
                  }}>
                    {isRent ? "Pronájem" : "Prodej"}
                  </span>
                  {/* Detail reveal chip */}
                  <span className="r03-listing-detail" style={{
                    position: "absolute", bottom: 14, right: 14,
                    display: "inline-flex", alignItems: "center", gap: 6,
                    background: OCHRE, color: WHITE,
                    fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase",
                    padding: "8px 13px", borderRadius: 99,
                    opacity: hov ? 1 : 0, transform: hov ? "translateY(0)" : "translateY(8px)",
                    transition: "opacity 0.3s ease, transform 0.3s ease",
                  }}>
                    {detailLabel}
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                  </span>
                </div>

                {/* Info */}
                <div style={{ padding: "20px 20px 24px" }}>
                  <p style={{ fontSize: "clamp(1rem, 1.4vw, 1.15rem)", fontWeight: 700, color: DARK, margin: "0 0 8px", lineHeight: 1.3 }}>
                    {item.title}
                  </p>
                  <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 14 }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#9aa4ae" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
                    <span style={{ fontSize: 13, color: "#8a929b" }}>{item.location}</span>
                  </div>
                  {/* Feature chips */}
                  {(item.disposition || item.area) && (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginBottom: 16 }}>
                      {item.disposition && (
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 5, background: "#f2f4f6", color: DARK, fontSize: 11.5, fontWeight: 600, padding: "5px 10px", borderRadius: 6 }}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={OCHRE} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
                          {item.disposition}
                        </span>
                      )}
                      {item.area && (
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 5, background: "#f2f4f6", color: DARK, fontSize: 11.5, fontWeight: 600, padding: "5px 10px", borderRadius: 6 }}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={OCHRE} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 3h-6M21 3v6M21 3l-7 7M3 21h6M3 21v-6M3 21l7-7"/></svg>
                          {item.area}
                        </span>
                      )}
                    </div>
                  )}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: "1px solid #eef0f2", paddingTop: 14 }}>
                    <span style={{ fontSize: "clamp(1rem, 1.3vw, 1.1rem)", fontWeight: 700, color: OCHRE, letterSpacing: "-0.01em" }}>
                      {formatPrice(item.price, item.type)}
                    </span>
                    <span className="r03-listing-arrow" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 32, height: 32, borderRadius: "50%", background: hov ? OCHRE : "#f2f4f6", color: hov ? WHITE : DARK, transition: "background 0.25s, color 0.25s" }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                    </span>
                  </div>
                </div>
              </a>
            );
          })}
        </div>
      </div>

      <style>{`
        @keyframes r03ListingFadeUp {
          from { opacity: 0; transform: translateY(36px); }
          to   { opacity: 1; transform: none; }
        }
        [data-template="reality-03"] .r03-listings-all:hover { gap: 14px !important; border-color: #e38a6a !important; }
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
function RatingsReality04({ content, sectionId, tenantSlug, isAdmin }: { content: Record<string, unknown>; sectionId: number; tenantSlug?: string; isAdmin?: boolean }) {
  const siteMode = String(content.siteMode ?? "multipage");
  const eyebrow = String(content.eyebrow ?? "Reference");
  const title   = String(content.title   ?? "Klienti nám důvěřují");
  const subtitle = String(content.subtitle ?? "Hodnocení z nezávislých platforem, na kterých si nás zákazníci sami vyhledali.");
  const ctaText = String(content.ctaText ?? "Chci být dalším spokojeným klientem");
  const ctaHref = String(content.ctaHref ?? "/kontakt");
  const items   = (content.items as Array<{ platform: string; score: string; count: string; color: string }>) ?? [];

  const PRIMARY = "#1032CF";
  const DARK    = "#141414";
  const MUTED   = "#6b7280";
  const GREEN   = "#21b276";
  const GOLD    = "#f5a623";
  const SANS    = "'Helvetica Neue', Helvetica, Arial, sans-serif";
  const resolve = (href: string) => resolveNavHref(href, siteMode, tenantSlug, isAdmin);

  const PlatformLogo = ({ platform }: { platform: string }) => {
    if (platform === "Google") return (
      <svg height="26" viewBox="0 0 74 24" fill="none" aria-label="Google" style={{ display: "block" }}>
        <path d="M9.24 8.19v2.46h5.88c-.18 1.39-.73 2.43-1.51 3.12-.98.88-2.44 1.83-4.37 1.83-3.49 0-6.22-2.82-6.22-6.31s2.73-6.31 6.22-6.31c1.87 0 3.24.74 4.24 1.67l1.74-1.74C13.71 1.73 11.82.84 9.24.84 4.44.84.5 4.78.5 9.58s3.94 8.74 8.74 8.74c2.56 0 4.49-.84 5.99-2.41 1.54-1.54 2.02-3.7 2.02-5.45 0-.54-.04-1.04-.13-1.46H9.24v-.81z" fill="#4285F4"/>
        <text x="22" y="17" fontFamily="Arial,sans-serif" fontSize="15" fontWeight="600" fill="#5f6368">Google</text>
      </svg>
    );
    if (platform === "Seznam") return (
      <svg height="26" viewBox="0 0 80 24" fill="none" aria-label="Seznam" style={{ display: "block" }}>
        <rect x="0" y="2" width="20" height="20" rx="5" fill="#cc0000"/>
        <text x="5" y="17" fontFamily="Arial,sans-serif" fontWeight="900" fontSize="14" fill="#fff">S</text>
        <text x="26" y="17" fontFamily="Arial,sans-serif" fontSize="15" fontWeight="600" fill="#5f6368">Seznam</text>
      </svg>
    );
    if (platform === "Facebook") return (
      <svg height="26" viewBox="0 0 96 24" fill="none" aria-label="Facebook" style={{ display: "block" }}>
        <path d="M12 0C5.37 0 0 5.37 0 12c0 5.99 4.39 10.96 10.13 11.85V15.5H7.08V12h3.05V9.35c0-3.01 1.79-4.67 4.53-4.67 1.31 0 2.68.23 2.68.23v2.95H15.8c-1.49 0-1.95.93-1.95 1.88V12h3.33l-.53 3.5H13.85v8.35C19.61 22.96 24 17.99 24 12 24 5.37 18.63 0 12 0z" fill="#1877F2"/>
        <text x="30" y="17" fontFamily="Arial,sans-serif" fontSize="15" fontWeight="600" fill="#5f6368">Facebook</text>
      </svg>
    );
    return <span style={{ fontFamily: SANS, fontSize: 14, fontWeight: 600, color: MUTED, letterSpacing: 1, textTransform: "uppercase" }}>{platform}</span>;
  };

  return (
    <section id="reference" style={{ backgroundColor: "#f6f7fb", padding: "clamp(56px, 6vw, 92px) 0" }} data-template="reality-04">
      <div style={{ maxWidth: 1160, margin: "0 auto", padding: "0 clamp(16px, 3vw, 40px)" }}>

        {/* Header */}
        <div style={{ textAlign: "center", maxWidth: 640, margin: "0 auto clamp(36px, 4vw, 52px)" }}>
          <GenericEditableText sectionId={sectionId} field="eyebrow" value={eyebrow} tag="p"
            style={{ fontFamily: SANS, fontSize: 12.5, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: GREEN, margin: "0 0 12px" }} />
          <h2 style={{ fontFamily: SANS, fontSize: "clamp(26px, 3vw, 38px)", fontWeight: 700, color: DARK, margin: "0 0 14px", lineHeight: 1.15, letterSpacing: "-0.01em" }}>
            <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
          </h2>
          <p style={{ fontFamily: SANS, fontSize: 16.5, color: MUTED, margin: 0, lineHeight: 1.6 }}>
            <GenericEditableText sectionId={sectionId} field="subtitle" value={subtitle} tag="span" />
          </p>
        </div>

        {/* Rating cards */}
        <div className="r04-rate-grid">
          {items.map((item, i) => (
            <div key={i} className="r04-rate-card">
              <div style={{ height: 28, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 18 }}>
                <PlatformLogo platform={item.platform} />
              </div>
              <div style={{ display: "flex", alignItems: "baseline", justifyContent: "center", gap: 4 }}>
                <span style={{ fontFamily: SANS, fontSize: 56, fontWeight: 800, color: PRIMARY, lineHeight: 1, letterSpacing: "-0.02em" }}>
                  <GenericEditableText sectionId={sectionId} field={`items.${i}.score`} value={item.score} tag="span" />
                </span>
                <span style={{ fontFamily: SANS, fontSize: 20, fontWeight: 600, color: "#b9bfd0" }}>/5</span>
              </div>
              <div style={{ color: GOLD, fontSize: 20, letterSpacing: 4, lineHeight: 1, margin: "12px 0 8px" }}>★★★★★</div>
              <div style={{ fontFamily: SANS, fontSize: 14, color: MUTED }}>
                <GenericEditableText sectionId={sectionId} field={`items.${i}.count`} value={item.count} tag="span" />
              </div>
            </div>
          ))}
        </div>

        {/* CTA pill */}
        <div style={{ textAlign: "center", marginTop: "clamp(36px, 4vw, 52px)" }}>
          <a
            href={resolve(ctaHref)}
            data-btn="primary"
            className="r04-rate-cta"
            style={{ display: "inline-flex", alignItems: "center", gap: 9, padding: "14px 32px", backgroundColor: GREEN, color: "#fff", fontFamily: SANS, fontSize: 15, fontWeight: 600, textDecoration: "none", borderRadius: 50, transition: "background-color 300ms ease" }}
          >
            <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
            <svg className="r04-rate-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true" style={{ transition: "transform 300ms ease" }}>
              <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
        </div>
      </div>

      <style>{`
        .r04-rate-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: clamp(16px, 2vw, 28px);
        }
        @media (max-width: 720px) { .r04-rate-grid { grid-template-columns: 1fr; } }
      `}</style>
    </section>
  );
}

// ── reality-04-listings ───────────────────────────────────────────────────────
// Nabídka nemovitostí — filtr taby (Vše/Prodej/Pronájem/Byty/Domy) + grid karet.
// Karta: foto (zoom hover) + badge Prodej/Pronájem + cena + dispozice/plocha/lokalita.
// Proklik na detail nemovitosti /nemovitost-{slug}. Conditional header.
// ─────────────────────────────────────────────────────────────────────────────
type R04Listing = {
  slug: string; title: string; price: string; type: string; category: string;
  disposition: string; area: string; location: string; image: string; badge?: string;
};
function ListingsReality04({ content, sectionId, tenantSlug, isAdmin }: { content: Record<string, unknown>; sectionId: number; tenantSlug?: string; isAdmin?: boolean }) {
  const siteMode = String(content.siteMode ?? "multipage");
  const eyebrowRaw  = (content as Record<string, unknown>).eyebrow;
  const titleRaw    = (content as Record<string, unknown>).title;
  const subtitleRaw = (content as Record<string, unknown>).subtitle;
  const eyebrow  = eyebrowRaw  === undefined ? "Nabídka" : String(eyebrowRaw);
  const title    = titleRaw    === undefined ? "Nemovitosti v nabídce" : String(titleRaw);
  const subtitle = subtitleRaw === undefined ? "Vyberte si z aktuální nabídky. Klikněte na nemovitost pro detail a fotogalerii." : String(subtitleRaw);
  const showHeader = !!(eyebrow.trim() || title.trim() || subtitle.trim());
  const items = (content.items as R04Listing[]) ?? [];

  const PRIMARY = "#1032CF";
  const GREEN   = "#21b276";
  const DARK    = "#141414";
  const MUTED   = "#6b7280";
  const SANS    = "'Helvetica Neue', Helvetica, Arial, sans-serif";
  const resolve = (href: string) => resolveNavHref(href, siteMode, tenantSlug, isAdmin);

  const filters = [
    { key: "all",     label: "Vše" },
    { key: "prodej",  label: "Prodej" },
    { key: "pronajem",label: "Pronájem" },
    { key: "byt",     label: "Byty" },
    { key: "dum",     label: "Domy" },
  ];
  const [active, setActive] = useState("all");
  const shown = items.filter(it => active === "all" || it.type === active || it.category === active);

  const MetaIcon = ({ d }: { d: string }) => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={PRIMARY} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flexShrink: 0 }}>{<path d={d} />}</svg>
  );

  return (
    <section id="nabidka" style={{ backgroundColor: "#fff", padding: "clamp(48px, 6vw, 84px) 0" }} data-template="reality-04">
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 clamp(16px, 3vw, 40px)" }}>

        {showHeader && (
          <div style={{ maxWidth: 640, marginBottom: "clamp(24px, 3vw, 36px)" }}>
            {eyebrow.trim() && (
              <GenericEditableText sectionId={sectionId} field="eyebrow" value={eyebrow} tag="p"
                style={{ fontFamily: SANS, fontSize: 12.5, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: GREEN, margin: "0 0 12px" }} />
            )}
            {title.trim() && (
              <h2 style={{ fontFamily: SANS, fontSize: "clamp(24px, 2.8vw, 34px)", fontWeight: 700, color: DARK, margin: "0 0 14px", lineHeight: 1.18, letterSpacing: "-0.01em" }}>
                <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
              </h2>
            )}
            {subtitle.trim() && (
              <p style={{ fontFamily: SANS, fontSize: 16.5, color: MUTED, margin: 0, lineHeight: 1.6 }}>
                <GenericEditableText sectionId={sectionId} field="subtitle" value={subtitle} tag="span" />
              </p>
            )}
          </div>
        )}

        {/* Filter tabs */}
        <div className="r04-list-filters">
          {filters.map(f => (
            <button key={f.key} onClick={() => setActive(f.key)} className={`r04-list-tab${active === f.key ? " is-active" : ""}`}>
              {f.label}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="r04-list-grid">
          {shown.map((it, i) => {
            const isRent = it.type === "pronajem";
            return (
              <a key={it.slug || i} href={resolve(`/nemovitost-${it.slug}`)} className="r04-list-card">
                <div className="r04-list-imgwrap">
                  <img loading="lazy" src={it.image} alt={it.title} />
                  <span className="r04-list-badge" style={{ backgroundColor: isRent ? GREEN : PRIMARY }}>{isRent ? "Pronájem" : "Prodej"}</span>
                  {it.badge && <span className="r04-list-tag">{it.badge}</span>}
                  <span className="r04-list-view">Zobrazit detail</span>
                </div>
                <div className="r04-list-body">
                  <div className="r04-list-price">{it.price}</div>
                  <div className="r04-list-title">{it.title}</div>
                  <div className="r04-list-meta">
                    <span><MetaIcon d="M3 21h18M5 21V7l7-4 7 4v14M9 21v-6h6v6" /> {it.disposition}</span>
                    <span><MetaIcon d="M4 4h16v16H4zM4 12h16M12 4v16" /> {it.area}</span>
                    <span><MetaIcon d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z M12 9.5a2.5 2.5 0 100-.01" /> {it.location}</span>
                  </div>
                </div>
              </a>
            );
          })}
        </div>
      </div>

      <style>{`
        .r04-list-filters { display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: clamp(24px,3vw,36px); }
        .r04-list-tab { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 14px; font-weight: 600; color: #1f2430; background: #f2f4f9; border: 1px solid #e8ebf2; border-radius: 50px; padding: 9px 20px; cursor: pointer; transition: all 0.2s ease; }
        .r04-list-tab:hover { border-color: #1032CF; color: #1032CF; }
        .r04-list-tab.is-active { background: #1032CF; border-color: #1032CF; color: #fff; }
        .r04-list-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: clamp(18px, 2.2vw, 28px); }
        @media (max-width: 900px) { .r04-list-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 560px) { .r04-list-grid { grid-template-columns: 1fr; } }
      `}</style>
    </section>
  );
}

// ── reality-04-detail ─────────────────────────────────────────────────────────
// Detail nemovitosti: galerie (klik → pop-up lightbox) + parametry + popis + makléř.
// ─────────────────────────────────────────────────────────────────────────────
function DetailReality04({ content, sectionId, tenantSlug, isAdmin }: { content: Record<string, unknown>; sectionId: number; tenantSlug?: string; isAdmin?: boolean }) {
  const siteMode = String(content.siteMode ?? "multipage");
  const title       = String(content.title       ?? "Nemovitost");
  const price       = String(content.price       ?? "");
  const priceNote   = String(content.priceNote   ?? "vč. provize a právního servisu");
  const type        = String(content.type        ?? "prodej");
  const location    = String(content.location    ?? "");
  const badge       = String(content.badge       ?? "");
  const descTitle   = String(content.descTitle   ?? "Popis nemovitosti");
  const description = String(content.description  ?? "");
  const paramsTitle = String(content.paramsTitle ?? "Parametry");
  const agentName   = String(content.agentName   ?? "Petr Novotný");
  const agentRole   = String(content.agentRole   ?? "Realitní makléř");
  const agentPhone  = String(content.agentPhone  ?? "704 123 456");
  const agentEmail  = String(content.agentEmail  ?? "makler@rezido.cz");
  const agentPhoto  = String(content.agentPhoto  ?? "/templates/reality-04/img/agent.webp");
  const ctaText     = String(content.ctaText     ?? "Mám zájem o prohlídku");
  const ctaHref     = String(content.ctaHref     ?? "/kontakt");
  const backLabel   = String(content.backLabel   ?? "Zpět na nabídku");
  const backHref    = String(content.backHref    ?? "/nabidka");
  const images = (content.images as Array<{ url: string; alt?: string }>) ?? [];
  const params = (content.params as Array<{ label: string; value: string }>) ?? [];

  const PRIMARY = "#1032CF";
  const GREEN   = "#21b276";
  const DARK    = "#141414";
  const MUTED   = "#6b7280";
  const SANS    = "'Helvetica Neue', Helvetica, Arial, sans-serif";
  const isRent  = type === "pronajem";
  const resolve = (href: string) => resolveNavHref(href, siteMode, tenantSlug, isAdmin);

  const [lbOpen, setLbOpen] = useState(false);
  const [lbIndex, setLbIndex] = useState(0);
  const openLb = (i: number) => { setLbIndex(i); setLbOpen(true); };
  const close = () => setLbOpen(false);
  const prev = () => setLbIndex(i => (i - 1 + images.length) % images.length);
  const next = () => setLbIndex(i => (i + 1) % images.length);

  useEffect(() => {
    if (!lbOpen) return;
    const h = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      else if (e.key === "ArrowLeft") prev();
      else if (e.key === "ArrowRight") next();
    };
    document.addEventListener("keydown", h);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", h); document.body.style.overflow = ""; };
  }, [lbOpen, images.length]);

  const main = images[0];
  const rest = images.slice(1, 5);
  const extra = images.length - 5;

  return (
    <section style={{ backgroundColor: "#fff", padding: "clamp(36px, 4vw, 56px) 0 clamp(56px, 7vw, 88px)" }} data-template="reality-04">
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 clamp(16px, 3vw, 40px)" }}>

        {/* Back link */}
        <a href={resolve(backHref)} className="r04-foot-link" style={{ display: "inline-flex", alignItems: "center", gap: 7, fontFamily: SANS, fontSize: 14, fontWeight: 600, color: PRIMARY, textDecoration: "none", marginBottom: 22 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M19 12H5M11 18l-6-6 6-6" /></svg>
          <GenericEditableText sectionId={sectionId} field="backLabel" value={backLabel} tag="span" />
        </a>

        {/* Gallery mosaic */}
        {main && (
          <div className="r04-detail-gallery">
            <button type="button" className="r04-dg-main" onClick={() => openLb(0)} aria-label="Otevřít galerii">
              <img loading="eager" src={main.url} alt={main.alt || title} />
              <span className="r04-dg-badge" style={{ backgroundColor: isRent ? GREEN : PRIMARY }}>{isRent ? "Pronájem" : "Prodej"}</span>
            </button>
            <div className="r04-dg-side">
              {rest.map((im, i) => (
                <button type="button" key={i} className="r04-dg-thumb" onClick={() => openLb(i + 1)} aria-label={`Fotka ${i + 2}`}>
                  <img loading="lazy" src={im.url} alt={im.alt || title} />
                  {i === rest.length - 1 && extra > 0 && <span className="r04-dg-more">+{extra} fotek</span>}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Title row */}
        <div className="r04-detail-head">
          <div>
            {badge && <span style={{ display: "inline-block", fontFamily: SANS, fontSize: 12, fontWeight: 700, color: GREEN, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8 }}>{badge}</span>}
            <h1 style={{ fontFamily: SANS, fontSize: "clamp(24px, 3vw, 36px)", fontWeight: 800, color: DARK, margin: "0 0 8px", lineHeight: 1.12, letterSpacing: "-0.015em" }}>
              <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
            </h1>
            <p style={{ fontFamily: SANS, fontSize: 15.5, color: MUTED, margin: 0, display: "flex", alignItems: "center", gap: 7 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={PRIMARY} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
              <GenericEditableText sectionId={sectionId} field="location" value={location} tag="span" />
            </p>
          </div>
        </div>

        {/* Two-col */}
        <div className="r04-detail-grid">
          {/* Left */}
          <div>
            {/* Params */}
            <div style={{ fontFamily: SANS, fontSize: 18, fontWeight: 700, color: DARK, margin: "8px 0 16px" }}>
              <GenericEditableText sectionId={sectionId} field="paramsTitle" value={paramsTitle} tag="span" />
            </div>
            <div className="r04-detail-params">
              {params.map((p, i) => (
                <div key={i} className="r04-param">
                  <span style={{ fontFamily: SANS, fontSize: 13.5, color: MUTED }}>
                    <GenericEditableText sectionId={sectionId} field={`params.${i}.label`} value={p.label} tag="span" />
                  </span>
                  <span style={{ fontFamily: SANS, fontSize: 15, fontWeight: 700, color: DARK }}>
                    <GenericEditableText sectionId={sectionId} field={`params.${i}.value`} value={p.value} tag="span" />
                  </span>
                </div>
              ))}
            </div>

            {/* Description */}
            <div style={{ fontFamily: SANS, fontSize: 18, fontWeight: 700, color: DARK, margin: "34px 0 14px" }}>
              <GenericEditableText sectionId={sectionId} field="descTitle" value={descTitle} tag="span" />
            </div>
            <GenericEditableText sectionId={sectionId} field="description" value={description} tag="p"
              style={{ fontFamily: SANS, fontSize: 16, color: "#33383f", lineHeight: 1.85, margin: 0, whiteSpace: "pre-line" }} />
          </div>

          {/* Right sidebar */}
          <aside className="r04-detail-aside">
            <div className="r04-detail-card">
              <div style={{ fontFamily: SANS, fontSize: 13, color: MUTED, marginBottom: 4 }}>{isRent ? "Cena nájmu" : "Cena"}</div>
              <div style={{ fontFamily: SANS, fontSize: 30, fontWeight: 800, color: PRIMARY, letterSpacing: "-0.01em", lineHeight: 1.1 }}>
                <GenericEditableText sectionId={sectionId} field="price" value={price} tag="span" />
              </div>
              <GenericEditableText sectionId={sectionId} field="priceNote" value={priceNote} tag="p"
                style={{ fontFamily: SANS, fontSize: 12.5, color: MUTED, margin: "6px 0 20px" }} />

              {/* Agent */}
              <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "16px 0", borderTop: "1px solid #eef0f4", borderBottom: "1px solid #eef0f4", marginBottom: 18 }}>
                <GenericEditableImage sectionId={sectionId} field="agentPhoto" src={agentPhoto} alt={agentName} style={{ width: 56, height: 56, borderRadius: "50%", overflow: "hidden", flexShrink: 0 }}>
                  <img loading="lazy" src={agentPhoto} alt={agentName} style={{ width: 56, height: 56, borderRadius: "50%", objectFit: "cover", display: "block" }} />
                </GenericEditableImage>
                <div>
                  <div style={{ fontFamily: SANS, fontSize: 15.5, fontWeight: 700, color: DARK }}>
                    <GenericEditableText sectionId={sectionId} field="agentName" value={agentName} tag="span" />
                  </div>
                  <div style={{ fontFamily: SANS, fontSize: 13, color: MUTED }}>
                    <GenericEditableText sectionId={sectionId} field="agentRole" value={agentRole} tag="span" />
                  </div>
                </div>
              </div>

              <a href={`tel:${agentPhone.replace(/\s/g, "")}`} style={{ display: "flex", alignItems: "center", gap: 9, fontFamily: SANS, fontSize: 15, fontWeight: 600, color: DARK, textDecoration: "none", marginBottom: 10 }}>
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={PRIMARY} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.38 2 2 0 0 1 3.6 1.22h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 8.81a16 16 0 0 0 6.29 6.29l.95-.95a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                <GenericEditableText sectionId={sectionId} field="agentPhone" value={agentPhone} tag="span" />
              </a>
              <a href={`mailto:${agentEmail}`} style={{ display: "flex", alignItems: "center", gap: 9, fontFamily: SANS, fontSize: 15, fontWeight: 600, color: DARK, textDecoration: "none", marginBottom: 20 }}>
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={PRIMARY} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"/><polyline points="3 7 12 13 21 7"/></svg>
                <GenericEditableText sectionId={sectionId} field="agentEmail" value={agentEmail} tag="span" />
              </a>

              <a href={resolve(ctaHref)} data-btn="primary" className="r04-hotline-cta" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 9, padding: "14px 24px", backgroundColor: GREEN, color: "#fff", fontFamily: SANS, fontSize: 15, fontWeight: 600, textDecoration: "none", borderRadius: 50, transition: "background-color 300ms ease, transform 300ms ease" }}>
                <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
                <svg className="r04-hotline-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true" style={{ transition: "transform 300ms ease" }}><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </a>
            </div>
          </aside>
        </div>
      </div>

      {/* Lightbox */}
      {lbOpen && images[lbIndex] && (
        <div className="r04-lightbox" onClick={close} role="dialog" aria-modal="true" aria-label="Fotogalerie">
          <button type="button" className="r04-lb-close" onClick={close} aria-label="Zavřít">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
          <button type="button" className="r04-lb-nav r04-lb-prev" onClick={e => { e.stopPropagation(); prev(); }} aria-label="Předchozí">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
          </button>
          <img className="r04-lb-img" src={images[lbIndex].url} alt={images[lbIndex].alt || title} onClick={e => e.stopPropagation()} />
          <button type="button" className="r04-lb-nav r04-lb-next" onClick={e => { e.stopPropagation(); next(); }} aria-label="Další">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg>
          </button>
          <div className="r04-lb-counter">{String(lbIndex + 1).padStart(2, "0")} / {String(images.length).padStart(2, "0")}</div>
        </div>
      )}
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
// Porcelain V3: wash pás (#E9F4F1) — Young Serif title + message vlevo, teal pill CTA vpravo.
function PromoOrtho01({ content, sectionId, tenantSlug, isAdmin }: { content: Record<string, unknown>; sectionId: number; tenantSlug?: string; isAdmin?: boolean }) {
  const title   = String(content.title   ?? "Objednejte se na konzultaci zdarma");
  const message = String(content.message ?? "Uděláme scan vašich zubů, navrhneme vám možnosti léčby a stanovíme cenu.");
  const ctaText = String(content.ctaText ?? "Objednat se");
  const ctaHref = String(content.ctaHref ?? "/kontakt");

  return (
    <section id="konzultace" data-section-type="promo" data-variant="ortho-01-promo" className="o01p-strip">
      <style>{`
        .o01p-strip {
          background: #E9F4F1;
          border-top: 1px solid var(--color-border, #E4E7E3);
          border-bottom: 1px solid var(--color-border, #E4E7E3);
          padding: clamp(2.4rem, 5vw, 3.6rem) 0;
          font-family: 'Outfit', sans-serif;
        }
        .o01p-inner {
          max-width: 76rem; margin: 0 auto; padding: 0 clamp(1.25rem, 4vw, 2.5rem);
          display: flex; align-items: center; justify-content: space-between;
          gap: clamp(1.5rem, 4vw, 3rem); flex-wrap: wrap;
        }
        .o01p-title {
          font-family: 'Young Serif', serif; font-weight: 400;
          font-size: clamp(1.5rem, 2.6vw, 2.1rem); color: var(--color-text, #14201E);
          line-height: 1.15; margin: 0 0 0.55rem; text-wrap: balance;
        }
        .o01p-msg {
          font-size: clamp(0.95rem, 1.4vw, 1.05rem); color: var(--color-text-muted, #5F6B68);
          line-height: 1.6; margin: 0; max-width: 36rem;
        }
        .o01p-cta {
          display: inline-flex; align-items: center; gap: 0.55rem; flex-shrink: 0;
          padding: 0.95rem 1.9rem; border-radius: 9999px;
          background: var(--color-primary, #0F766E); color: #fff;
          font-size: 1rem; font-weight: 600; text-decoration: none;
          box-shadow: 0 10px 24px -12px rgba(15,118,110,0.55);
          transition: background 0.25s, transform 0.25s;
        }
        .o01p-cta:hover { background: var(--color-accent, #0B5D57); transform: translateY(-2px); }
      `}</style>
      <div className="o01p-inner">
        <div>
          <h2 className="o01p-title" style={{ fontFamily: "'Young Serif', serif", color: "var(--color-text, #14201E)" }}>
            <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
          </h2>
          <p className="o01p-msg">
            <GenericEditableText sectionId={sectionId} field="message" value={message} tag="span" />
          </p>
        </div>
        <a href={resolveDemoHref(ctaHref, tenantSlug, isAdmin)} data-btn="primary" className="o01p-cta">
          <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden><path d="M5 12h14M13 6l6 6-6 6"/></svg>
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
function ProcessOrtho02({ content, sectionId, tenantSlug, isAdmin }: { content: Record<string, unknown>; sectionId: number; tenantSlug?: string; isAdmin?: boolean }) {
  const FONT  = "'Raleway', 'Helvetica Neue', Arial, sans-serif";
  const FONT_B = "'Open Sans', 'Raleway', Arial, sans-serif";
  const DARK  = "#1a1a1a";
  const MUTED = "#777777";
  const BEIGE = "#B7B3A5";
  const GOLD  = "#b39f6b";

  const siteMode = String(content.siteMode ?? "multipage");
  const resolve  = (href: string) => resolveNavHref(href, siteMode, tenantSlug, isAdmin);

  const eyebrowRaw  = (content as Record<string,unknown>).subheading;
  const titleRaw    = (content as Record<string,unknown>).heading;
  const eyebrow  = eyebrowRaw === undefined ? "Jak to funguje" : String(eyebrowRaw);
  const title    = titleRaw   === undefined ? "Od první návštěvy k zářivému úsměvu ve čtyřech srozumitelných krocích" : String(titleRaw);
  const showHeader = !!(eyebrow.trim() || title.trim());

  type Step = { number?: string; title?: string; description?: string };
  const steps = ((content.steps as Step[]) ?? []).slice(0, 4);

  const cta1Text = String(content.cta1Text ?? "Naše služby");
  const cta1Href = String(content.cta1Href ?? "/sluzby");
  const cta2Text = String(content.cta2Text ?? "Sjednat konzultaci");
  const cta2Href = String(content.cta2Href ?? "/kontakt");

  const defaultSteps: Step[] = [
    { number: "01", title: "Úvodní konzultace",      description: "Důkladné vyšetření chrupu, digitální sken a rozbor možností léčby — vše bez závazků" },
    { number: "02", title: "Osobní léčebný plán",     description: "Na míru sestavený postup s přesným harmonogramem, typem rovnátek a transparentní cenou" },
    { number: "03", title: "Aktivní fáze léčby",      description: "Nasazení rovnátek a pravidelné kontroly každých šest až osm týdnů s průběžným sledováním pokroku" },
    { number: "04", title: "Výsledek a retence",      description: "Sejmutí rovnátek a aplikace retaineru, který udrží váš nový úsměv na celý život" },
  ];

  const rows = steps.length > 0 ? steps : defaultSteps;

  return (
    <section
      id="proces"
      data-template="ortho-02"
      style={{ backgroundColor: "#f7f6f3", fontFamily: FONT, padding: "clamp(72px, 9vw, 120px) clamp(32px, 6vw, 96px)" }}
    >
      {showHeader && (
        <div style={{ textAlign: "center", maxWidth: 780, margin: "0 auto clamp(48px, 6vw, 72px)" }}>
          <p style={{ margin: "0 0 16px", fontSize: "0.78rem", fontWeight: 600, color: GOLD, letterSpacing: "0.14em", textTransform: "uppercase" }}>
            <GenericEditableText sectionId={sectionId} field="subheading" value={eyebrow} tag="span" />
          </p>
          <h2 style={{ margin: 0, fontSize: "clamp(1.4rem, 2.8vw, 2.2rem)", fontWeight: 300, color: DARK, lineHeight: 1.4, letterSpacing: "-0.01em" }}>
            <GenericEditableText sectionId={sectionId} field="heading" value={title} tag="span" />
          </h2>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "clamp(20px, 3vw, 40px)", maxWidth: 1200, margin: "0 auto clamp(48px, 6vw, 72px)" }} className="o02-proc-grid">
        {rows.map((step, i) => {
          const num   = step.number      ?? defaultSteps[i]?.number ?? String(i + 1);
          const t     = step.title       ?? defaultSteps[i]?.title  ?? "";
          const desc  = step.description ?? defaultSteps[i]?.description ?? "";
          return (
            <div key={i} className="o02-proc-step" style={{
              display: "flex",
              flexDirection: "column",
              position: "relative",
              padding: "32px 28px 36px",
              backgroundColor: "#ffffff",
              borderRadius: 4,
              border: "1px solid #edeae5",
              transition: "transform 0.4s ease, box-shadow 0.4s ease",
            }}>
              <div style={{
                fontSize: "clamp(2.8rem, 5vw, 4rem)",
                fontWeight: 200,
                color: BEIGE,
                lineHeight: 1,
                marginBottom: 20,
                letterSpacing: "-0.02em",
                fontFamily: FONT,
              }}>
                <GenericEditableText sectionId={sectionId} field={`steps.${i}.number`} value={num} tag="span" />
              </div>
              <div aria-hidden style={{ width: 28, height: 1.5, backgroundColor: GOLD, marginBottom: 18, opacity: 0.5 }} />
              <h3 style={{ margin: "0 0 10px", fontSize: "clamp(0.95rem, 1.3vw, 1.08rem)", fontWeight: 600, color: DARK, lineHeight: 1.35, fontFamily: FONT }}>
                <GenericEditableText sectionId={sectionId} field={`steps.${i}.title`} value={t} tag="span" />
              </h3>
              <p style={{ margin: 0, fontSize: "0.88rem", color: MUTED, lineHeight: 1.7, fontFamily: FONT_B }}>
                <GenericEditableText sectionId={sectionId} field={`steps.${i}.description`} value={desc} tag="span" />
              </p>
            </div>
          );
        })}
      </div>

      <div style={{ display: "flex", justifyContent: "center", gap: 16, flexWrap: "wrap" }}>
        <a
          href={resolve(cta1Href)}
          className="o02-proc-cta1"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "13px 32px",
            border: "1px solid " + DARK,
            color: DARK,
            backgroundColor: "transparent",
            fontFamily: FONT,
            fontSize: "0.82rem",
            fontWeight: 600,
            letterSpacing: "0.06em",
            textTransform: "uppercase" as const,
            textDecoration: "none",
            borderRadius: 999,
            transition: "background-color 0.3s, color 0.3s",
          }}
        >
          <GenericEditableText sectionId={sectionId} field="cta1Text" value={cta1Text} tag="span" />
        </a>
        <a
          href={resolve(cta2Href)}
          className="o02-proc-cta2"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "13px 32px",
            backgroundColor: GOLD,
            color: "#ffffff",
            fontFamily: FONT,
            fontSize: "0.82rem",
            fontWeight: 600,
            letterSpacing: "0.06em",
            textTransform: "uppercase" as const,
            textDecoration: "none",
            borderRadius: 999,
            border: "1px solid " + GOLD,
            transition: "background-color 0.3s, transform 0.3s, box-shadow 0.3s",
          }}
        >
          <GenericEditableText sectionId={sectionId} field="cta2Text" value={cta2Text} tag="span" />
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
        </a>
      </div>
    </section>
  );
}

// ─── florist-01 Products / Bestsellers ──────────────────────────────────────
// Botanical Atelier Editorial luxe product grid:
// - Warm ivory bg + editorial header (moss eyebrow + Georgia italic H2 + moss ghost CTA "Zobrazit vše")
// - 4-col grid × 2 rows, 8 produktů
// - Karta: cover image aspect 4/5 s botanickými corner brackets on hover
//   + floating heart wishlist top-right + kategori kicker + Georgia italic name
//   + olive-gold hairline separator + row (Inter tracked "OD" + Georgia italic gold price + "Do košíku" link)
// - Hover: image scale, whole card lift -4px, name → moss, hairline expand, arrow slide
function ProductsFlorist01({ content, sectionId, tenantSlug, isAdmin }: { content: Record<string, unknown>; sectionId: number; tenantSlug?: string; isAdmin?: boolean }) {
  const MOSS   = "#2f4a3a";
  const SAGE   = "#5c8a6a";
  const IVORY  = "#faf7f2";
  const IVORY2 = "#f4efe6";
  const INK    = "#2a1a0a";
  const INK70  = "rgba(42,26,10,0.72)";
  const GOLD   = "#c9b78a";
  const BLUSH  = "#e8c5c0";
  const GEORGIA = "Georgia, 'Times New Roman', serif";
  const INTER   = "Inter, system-ui, sans-serif";

  const title    = (content.title    as string) ?? "Nejčastěji objednávané tento týden";
  const eyebrow  = (content.eyebrow  as string) ?? "03 · BESTSELLERY";
  const kicker   = (content.kicker   as string) ?? "Osm ateliérových kytic, které v posledních dnech odcestovaly nejčastěji.";
  const ctaText  = (content.ctaText  as string) ?? "Zobrazit vše";
  const ctaHref  = (content.ctaHref  as string) ?? "/katalog";
  const rawItems = (content.items    as Array<{ name: string; price: string; category?: string; badge?: string; image?: string; href?: string }>) ?? [];
  const items = rawItems.length > 0 ? rawItems : [
    { name: "Zlatá hodina",     category: "Kytice", price: "2 890 Kč", badge: "Signature", image: "https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&w=900&q=85", href: "/katalog" },
    { name: "Letní vítr",       category: "Kytice", price: "Od 1 750 Kč", badge: "Bestseller", image: "https://images.unsplash.com/photo-1502977249166-824b3a8a4d6d?auto=format&fit=crop&w=900&q=85", href: "/katalog" },
    { name: "Červené tulipány", category: "Kytice", price: "Od 1 850 Kč", image: "https://images.unsplash.com/photo-1520302519878-3fc7c633b95d?auto=format&fit=crop&w=900&q=85", href: "/katalog" },
    { name: "Ranní rosa",       category: "Kytice", price: "Od 2 100 Kč", badge: "Novinka", image: "https://images.unsplash.com/photo-1567696911980-2eed69a46042?auto=format&fit=crop&w=900&q=85", href: "/katalog" },
    { name: "Hedvábný oblak",   category: "Signature", price: "Od 2 490 Kč", badge: "Edice 30 ks", image: "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=900&q=85", href: "/katalog" },
    { name: "Pivoňky se stuhou", category: "Sezónní", price: "Od 2 350 Kč", image: "https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&w=900&q=85", href: "/katalog" },
    { name: "Fialový soumrak",  category: "Kytice", price: "Od 1 490 Kč", image: "https://images.unsplash.com/photo-1508610048659-a06b669e3321?auto=format&fit=crop&w=900&q=85", href: "/katalog" },
    { name: "Jarní ráno",       category: "Kytice", price: "1 550 Kč",    image: "https://images.unsplash.com/photo-1487530811176-3780de880c2d?auto=format&fit=crop&w=900&q=85", href: "/katalog" },
  ];

  const resolve = (href: string) => {
    if (!href) return "#";
    if (href.startsWith("http") || href.startsWith("#") || href.startsWith("tel") || href.startsWith("mailto")) return href;
    if (isAdmin) return `/demo/${tenantSlug}/admin${href}`;
    if (tenantSlug) return `/demo/${tenantSlug}${href}`;
    return href;
  };

  return (
    <section data-template="florist-01" className="f01prod" style={{ background: IVORY2, fontFamily: INTER, padding: "96px 24px 108px" }}>
      <style>{`
        .f01prod-inner { max-width: 1280px; margin: 0 auto; }
        .f01prod-head { display:grid; grid-template-columns: 1fr auto; gap: 32px; align-items:flex-end; padding-bottom: 32px; margin-bottom: 48px; border-bottom: 1px solid ${GOLD}; }
        .f01prod-head-l { display:flex; flex-direction:column; gap:14px; max-width:640px; }
        .f01prod-eye { display:inline-flex; align-items:center; gap:14px; font-family:${INTER}; font-weight:500; font-size:11px; letter-spacing:0.34em; text-transform:uppercase; color:${MOSS}; }
        .f01prod-eye i { width:26px; height:1px; background:${GOLD}; display:inline-block; }
        .f01prod-h { font-family:${GEORGIA}; font-style:italic; font-weight:400; font-size:clamp(28px, 3.2vw, 40px); line-height:1.12; color:${INK}; margin:0; letter-spacing:-0.012em; }
        .f01prod-k { font-family:${INTER}; font-weight:300; font-size:14.5px; line-height:1.7; color:${INK70}; margin:0; max-width:560px; }
        .f01prod-cta { position:relative; display:inline-flex; align-items:center; gap:12px; padding:14px 26px; background:transparent; color:${MOSS}; font-family:${INTER}; font-weight:500; font-size:12.5px; letter-spacing:0.24em; text-transform:uppercase; text-decoration:none; border:1px solid ${MOSS}; transition: background 0.4s ease, color 0.4s ease; flex-shrink:0; }
        .f01prod-cta:hover { background:${MOSS}; color:${IVORY}; }
        .f01prod-cta .arr { transition: transform 0.4s ease; }
        .f01prod-cta:hover .arr { transform: translateX(4px); }

        .f01prod-grid { display:grid; grid-template-columns: repeat(4, 1fr); gap: 32px 24px; }
        .f01prod-card { position:relative; display:flex; flex-direction:column; gap:14px; text-decoration:none; color:${INK};
          transition: transform 0.6s cubic-bezier(.6,.05,.35,1); }
        .f01prod-card:hover { transform: translateY(-4px); }

        .f01prod-img { position:relative; aspect-ratio: 4/5; overflow:hidden; background:${IVORY}; border: 1px solid rgba(0,0,0,0.05); }
        .f01prod-img img { width:100%; height:100%; object-fit:cover; display:block; transition: transform 1.1s cubic-bezier(.2,.7,.2,1), filter 0.6s ease; filter: brightness(0.98) saturate(1); }
        .f01prod-card:hover .f01prod-img img { transform: scale(1.07); }

        /* Corner brackets olive-gold, fade on hover */
        .f01prod-brk::before, .f01prod-brk::after,
        .f01prod-brk span::before, .f01prod-brk span::after {
          content:""; position:absolute; width:24px; height:24px; opacity:0; transition: opacity 0.5s ease, transform 0.5s ease; transform: scale(0.85);
          border: 0 solid ${GOLD};
        }
        .f01prod-brk::before { top:10px; left:10px; border-top-width:1px; border-left-width:1px; }
        .f01prod-brk::after  { top:10px; right:10px; border-top-width:1px; border-right-width:1px; }
        .f01prod-brk span::before { bottom:10px; left:10px; border-bottom-width:1px; border-left-width:1px; }
        .f01prod-brk span::after  { bottom:10px; right:10px; border-bottom-width:1px; border-right-width:1px; }
        .f01prod-card:hover .f01prod-brk::before,
        .f01prod-card:hover .f01prod-brk::after,
        .f01prod-card:hover .f01prod-brk span::before,
        .f01prod-card:hover .f01prod-brk span::after { opacity:1; transform: scale(1); }

        .f01prod-badge { position:absolute; top:14px; left:14px; z-index:2; background:${IVORY}; color:${MOSS};
          font-family:${GEORGIA}; font-style:italic; font-size:12px; padding: 6px 14px 6px; letter-spacing: 0.02em;
          border: 1px solid ${GOLD}; }
        .f01prod-heart { position:absolute; top:14px; right:14px; z-index:2; width:38px; height:38px; border-radius:50%; background:${IVORY};
          border:1px solid rgba(0,0,0,0.06); display:flex; align-items:center; justify-content:center; color:${INK70};
          transition: color 0.35s ease, background 0.35s ease, transform 0.35s ease; cursor:pointer; }
        .f01prod-card:hover .f01prod-heart { color:${BLUSH}; }
        .f01prod-heart:hover { transform: scale(1.08); }

        .f01prod-cat { font-family:${INTER}; font-weight:500; font-size:10.5px; letter-spacing:0.28em; text-transform:uppercase; color:${INK70}; }
        .f01prod-name { font-family:${GEORGIA}; font-style:italic; font-weight:400; font-size:22px; line-height:1.2; color:${INK}; margin:0; transition: color 0.35s ease; letter-spacing:-0.005em; }
        .f01prod-card:hover .f01prod-name { color:${MOSS}; }

        .f01prod-rule { height:1px; background: ${GOLD}; opacity:0.5; width:26px; transition: width 0.5s cubic-bezier(.6,.05,.35,1), background 0.4s ease; margin-top: 4px; }
        .f01prod-card:hover .f01prod-rule { width: 90px; background: ${MOSS}; opacity: 1; }

        .f01prod-row { display:flex; align-items:baseline; justify-content:space-between; gap: 12px; margin-top: 6px; }
        .f01prod-price-lbl { font-family:${INTER}; font-weight:500; font-size:10.5px; letter-spacing:0.24em; text-transform:uppercase; color:${INK70}; margin-right:8px; }
        .f01prod-price { font-family:${GEORGIA}; font-style:italic; font-size:20px; color:${MOSS}; letter-spacing:-0.005em; }
        .f01prod-add { display:inline-flex; align-items:center; gap:8px; font-family:${INTER}; font-weight:500; font-size:11.5px; letter-spacing:0.22em; text-transform:uppercase; color:${INK70}; text-decoration:none; transition: color 0.35s ease; padding: 4px 0; position:relative; }
        .f01prod-add::after { content:""; position:absolute; left:0; right:0; bottom:-2px; height:1px; background:${MOSS}; transform: scaleX(0); transform-origin: right; transition: transform 0.5s cubic-bezier(.6,.05,.35,1); }
        .f01prod-card:hover .f01prod-add { color:${MOSS}; }
        .f01prod-card:hover .f01prod-add::after { transform: scaleX(1); transform-origin: left; }
        .f01prod-add .arr { transition: transform 0.35s ease; }
        .f01prod-card:hover .f01prod-add .arr { transform: translateX(3px); }

        @media(max-width:1024px){ .f01prod-grid { grid-template-columns: repeat(3, 1fr); } }
        @media(max-width:720px){
          .f01prod { padding: 64px 20px 76px; }
          .f01prod-head { grid-template-columns: 1fr; align-items:flex-start; }
          .f01prod-grid { grid-template-columns: repeat(2, 1fr); gap: 24px 16px; }
          .f01prod-name { font-size: 18px; }
          .f01prod-price { font-size: 17px; }
          .f01prod-add { display:none; }
        }
      `}</style>

      <div className="f01prod-inner">
        <header className="f01prod-head">
          <div className="f01prod-head-l">
            <span className="f01prod-eye"><i />
              <GenericEditableText sectionId={sectionId} field="eyebrow" value={eyebrow} tag="span" />
              <i />
            </span>
            <h2 className="f01prod-h">
              <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
            </h2>
            <p className="f01prod-k">
              <GenericEditableText sectionId={sectionId} field="kicker" value={kicker} tag="span" />
            </p>
          </div>
          <a href={resolve(ctaHref)} className="f01prod-cta">
            <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
            <span className="arr" aria-hidden>→</span>
          </a>
        </header>

        <div className="f01prod-grid">
          {items.map((item, i) => (
            <a key={i} href={resolve(item.href ?? "/katalog")} className="f01prod-card">
              <div className="f01prod-img">
                <span className="f01prod-brk" aria-hidden><span /></span>
                {item.image && (
                  <GenericEditableImage sectionId={sectionId} field={`items.${i}.image`} src={item.image} alt={item.name} style={{ display: "block", width: "100%", height: "100%" }}>
                    <OptimizedPicture src={item.image} alt={item.name} width={700} height={875} />
                  </GenericEditableImage>
                )}
                {item.badge && (
                  <span className="f01prod-badge">
                    <GenericEditableText sectionId={sectionId} field={`items.${i}.badge`} value={item.badge} tag="span" />
                  </span>
                )}
                <span className="f01prod-heart" aria-label="Přidat do oblíbených">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.65A4 4 0 0 1 19 10c0 5.5-7 10-7 10z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
                  </svg>
                </span>
              </div>

              <span className="f01prod-cat">
                <GenericEditableText sectionId={sectionId} field={`items.${i}.category`} value={item.category ?? ""} tag="span" />
              </span>
              <h3 className="f01prod-name">
                <GenericEditableText sectionId={sectionId} field={`items.${i}.name`} value={item.name} tag="span" />
              </h3>
              <span className="f01prod-rule" aria-hidden />

              <div className="f01prod-row">
                <span>
                  <span className="f01prod-price-lbl">Cena</span>
                  <span className="f01prod-price">
                    <GenericEditableText sectionId={sectionId} field={`items.${i}.price`} value={item.price} tag="span" />
                  </span>
                </span>
                <span className="f01prod-add">
                  Do košíku <span className="arr" aria-hidden>→</span>
                </span>
              </div>
            </a>
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
function PromoLang01({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
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
// Luxe povýšení: bílé bg, teal kicker + Forum H2, 3-col grid oborů s ikonami
// v teal badge, hover lift + rostoucí left accent + icon fill. Conditional header.
// ─────────────────────────────────────────────────────────────────────────────
function SpecsVet01({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const kickerRaw  = content.kicker;
  const headingRaw = content.heading;
  const kicker  = kickerRaw  === undefined ? "Specializace" : String(kickerRaw);
  const heading = headingRaw === undefined ? "Oblasti naší odbornosti" : String(headingRaw);
  const showHeader = !!(kicker.trim() || heading.trim());
  const items   = (content.items as Array<{ title?: string; description?: string }>) ?? [];

  const TEAL   = "#0d7486";
  const PRIMARY= "#286C7E";
  const TEAL_L = "#42aaba";
  const DARK   = "#1a2c33";
  const FONT_H = "'Forum', 'Georgia', serif";
  const FONT_B = "'Roboto Condensed', 'Roboto', sans-serif";

  // Ikony oborů (cyklují dle indexu — prevence/kardio/derma/chirurgie/oftalmo/stomato/felinní/exotická/senior)
  const ICONS: JSX.Element[] = [
    (<><path d="M12 3l7 3v5c0 4.5-3 8-7 9.5C8 19 5 15.5 5 11V6z"/><path d="M9.5 11.5l2 2 3.5-3.5"/></>),
    (<><path d="M20.8 8.6a4.6 4.6 0 0 0-8-3.1 4.6 4.6 0 0 0-8 3.1C4.8 13 12 19 12 19s7.2-6 8.8-10.4z"/></>),
    (<><path d="M5 8c3-4 11-4 14 0"/><path d="M4 13c4-5 12-5 16 0"/><path d="M6 18c3-3 9-3 12 0"/></>),
    (<><path d="M3 12h4l2.5 6 4-13 2.5 7H21"/></>),
    (<><path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6z"/><circle cx="12" cy="12" r="2.5"/></>),
    (<><path d="M9 3c-2.5 0-4.5 2-4.5 5 0 2 .5 4 1 7 .4 2.5 1 4 2 4s1.3-3 2-3 1 3 2 3 1.6-1.5 2-4c.5-3 1-5 1-7 0-3-2-5-4.5-5-1 0-1.5.6-2 .6S10 3 9 3z"/></>),
    (<><path d="M4 8l-1-4 4 2c1.5-1 3.5-1 5-1s3.5 0 5 1l4-2-1 4c1 1.5 1 3.5 0 5 0 4-3.5 6-8 6s-8-2-8-6c-1-1.5-1-3.5 0-5z"/><path d="M9 12h.01M15 12h.01"/></>),
    (<><circle cx="12" cy="10" r="4"/><circle cx="6.5" cy="7" r="1.6"/><circle cx="17.5" cy="7" r="1.6"/><circle cx="5" cy="12.5" r="1.6"/><circle cx="19" cy="12.5" r="1.6"/></>),
    (<><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2"/></>),
  ];

  return (
    <section
      id="specializace"
      data-template="vet-01-specs"
      style={{ background: "#fff", padding: "clamp(64px,8vw,104px) clamp(20px,5vw,40px)" }}
    >
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Forum&family=Roboto+Condensed:wght@400;500;700&display=swap" />
      <style>{`
        .v01sp-inner { max-width: 1180px; margin: 0 auto; }
        .v01sp-header { text-align: center; margin-bottom: 56px; }
        .v01sp-kicker { display:inline-flex; align-items:center; gap:9px; font-family: ${FONT_B}; font-size: 13px; font-weight: 700; letter-spacing: 0.2em; text-transform: uppercase; color: ${TEAL}; margin: 0 0 14px; }
        .v01sp-kicker svg { color:${TEAL_L}; }
        .v01sp-heading { font-family: ${FONT_H}; font-weight: 400; font-size: clamp(2rem,3.4vw,2.9rem); color: ${DARK}; margin: 0 0 16px; line-height:1.12; }
        .v01sp-rule { width:60px; height:3px; background:linear-gradient(90deg,${TEAL},${TEAL_L}); border-radius:2px; margin:0 auto; }
        .v01sp-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
        .v01sp-card { position:relative; display:flex; gap:18px; align-items:flex-start; padding: 24px 24px 24px 22px; background: #f6fbfc; border-radius: 14px; overflow:hidden; transition: transform 0.32s cubic-bezier(.4,0,.2,1), box-shadow 0.32s, background 0.32s; }
        .v01sp-card::before { content:''; position:absolute; top:0; left:0; bottom:0; width:3px; background:linear-gradient(180deg,${TEAL},${TEAL_L}); transform:scaleY(0); transform-origin:top; transition:transform 0.36s cubic-bezier(.4,0,.2,1); }
        .v01sp-card:hover { transform:translateY(-5px); background:#fff; box-shadow:0 14px 36px rgba(13,116,134,0.15); }
        .v01sp-card:hover::before { transform:scaleY(1); }
        .v01sp-badge { width:46px; height:46px; border-radius:13px; flex-shrink:0; display:flex; align-items:center; justify-content:center; background:linear-gradient(140deg,#e6f3f5,#d4e9ee); color:${TEAL}; transition:background 0.32s, color 0.32s, transform 0.36s cubic-bezier(.34,1.4,.64,1); }
        .v01sp-card:hover .v01sp-badge { background:linear-gradient(140deg,${TEAL},${PRIMARY}); color:#fff; transform:rotate(-6deg) scale(1.08); }
        .v01sp-card h3 { font-family: ${FONT_H}; font-size: 1.22rem; font-weight: 400; color: ${TEAL}; margin: 2px 0 7px; }
        .v01sp-card p  { font-family: ${FONT_B}; font-size: 14.5px; color: #4a6670; line-height: 1.55; margin: 0; }
        @media (max-width: 820px) { .v01sp-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 520px) { .v01sp-grid { grid-template-columns: 1fr; } }
      `}</style>

      <div className="v01sp-inner">
        {showHeader && (
          <div className="v01sp-header">
            <p className="v01sp-kicker">
              <svg width="15" height="15" viewBox="0 0 60 60" fill="currentColor" aria-hidden="true"><circle cx="18" cy="14" r="6"/><circle cx="30" cy="9" r="6"/><circle cx="42" cy="14" r="6"/><ellipse cx="30" cy="34" rx="13" ry="11"/><circle cx="23" cy="45" r="5"/><circle cx="37" cy="45" r="5"/></svg>
              <GenericEditableText sectionId={sectionId} field="kicker" value={kicker} tag="span" />
            </p>
            <h2 className="v01sp-heading">
              <GenericEditableText sectionId={sectionId} field="heading" value={heading} tag="span" />
            </h2>
            <div className="v01sp-rule" />
          </div>
        )}

        <div className="v01sp-grid">
          {items.map((item, i) => (
            <div key={i} className="v01sp-card">
              <span className="v01sp-badge" aria-hidden="true">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">{ICONS[i % ICONS.length]}</svg>
              </span>
              <div>
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

// ── vet-01-certs ─────────────────────────────────────────────────────────────
// Surface #DCE9EE bg, teal kicker + Forum H2, 2-col karta s PNG ikonou + popis
// ─────────────────────────────────────────────────────────────────────────────
function CertsVet01({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const kickerRaw  = content.kicker;
  const headingRaw = content.heading;
  const kicker  = kickerRaw  === undefined ? "Ověřená kvalita" : String(kickerRaw);
  const heading = headingRaw === undefined ? "Certifikace a ocenění" : String(headingRaw);
  const showHeader = !!(kicker.trim() || heading.trim());
  const items   = (content.items as Array<{ title?: string; description?: string; imageUrl?: string }>) ?? [];

  const TEAL   = "#0d7486";
  const PRIMARY= "#286C7E";
  const TEAL_L = "#42aaba";
  const SURF   = "#DCE9EE";
  const DARK   = "#1a2c33";
  const FONT_H = "'Forum', 'Georgia', serif";
  const FONT_B = "'Roboto Condensed', 'Roboto', sans-serif";

  // Custom teal pečetě (žádná reálná cert-loga): 0=rabbit-friendly, 1=cat-friendly
  const SEALS: JSX.Element[] = [
    // Králík
    (<><ellipse cx="30" cy="34" rx="9" ry="10"/><ellipse cx="24" cy="16" rx="3.4" ry="9" transform="rotate(-12 24 16)"/><ellipse cx="36" cy="16" rx="3.4" ry="9" transform="rotate(12 36 16)"/><circle cx="26.5" cy="32" r="1.4" fill="currentColor"/><circle cx="33.5" cy="32" r="1.4" fill="currentColor"/><path d="M30 35v2M27.5 38.5c1.5 1 3.5 1 5 0"/></>),
    // Kočka
    (<><path d="M20 20l-2-8 7 4c3-1.4 7-1.4 10 0l7-4-2 8c1.6 2.4 1.6 5.6 0 8 0 6-5 9-10 9s-10-3-10-9c-1.6-2.4-1.6-5.6 0-8z"/><circle cx="26" cy="30" r="1.5" fill="currentColor"/><circle cx="34" cy="30" r="1.5" fill="currentColor"/><path d="M30 33v2M18 30h5M37 30h5"/></>),
  ];

  return (
    <section
      id="certifikace"
      data-template="vet-01-certs"
      style={{ background: `linear-gradient(180deg,${SURF},#eaf3f5)`, padding: "clamp(64px,8vw,104px) clamp(20px,5vw,40px)" }}
    >
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Forum&family=Roboto+Condensed:wght@400;500;700&display=swap" />
      <style>{`
        .v01ct-inner  { max-width: 1140px; margin: 0 auto; }
        .v01ct-header { text-align: center; margin-bottom: 52px; }
        .v01ct-kicker { display:inline-flex; align-items:center; gap:9px; font-family: ${FONT_B}; font-size: 13px; font-weight: 700; letter-spacing: 0.2em; text-transform: uppercase; color: ${TEAL}; margin: 0 0 14px; }
        .v01ct-kicker svg { color:${TEAL_L}; }
        .v01ct-heading{ font-family: ${FONT_H}; font-weight: 400; font-size: clamp(2rem,3.4vw,2.9rem); color: ${DARK}; margin: 0 0 16px; line-height:1.12; }
        .v01ct-rule { width:60px; height:3px; background:linear-gradient(90deg,${TEAL},${TEAL_L}); border-radius:2px; margin:0 auto; }
        .v01ct-grid   { display: grid; grid-template-columns: repeat(2, 1fr); gap: 28px; }
        .v01ct-card   { position:relative; background: #fff; border-radius: 18px; padding: 38px 34px; display: flex; gap: 26px; align-items: flex-start; box-shadow: 0 6px 24px rgba(40,108,126,0.1); overflow:hidden; transition: transform 0.34s cubic-bezier(.4,0,.2,1), box-shadow 0.34s; }
        .v01ct-card::after { content:''; position:absolute; top:-40px; right:-40px; width:120px; height:120px; border-radius:50%; background:radial-gradient(circle,#e6f3f5,transparent 70%); opacity:0.8; transition:transform 0.5s ease; }
        .v01ct-card:hover { transform:translateY(-6px); box-shadow:0 20px 46px rgba(40,108,126,0.2); }
        .v01ct-card:hover::after { transform:scale(1.4); }
        .v01ct-seal { position:relative; z-index:1; width:96px; height:96px; border-radius:50%; flex-shrink:0; display:flex; align-items:center; justify-content:center; background:linear-gradient(140deg,#eaf5f7,#d4e9ee); border:2px solid ${TEAL_L}; color:${TEAL}; box-shadow:0 6px 18px rgba(13,116,134,0.16); transition:transform 0.5s cubic-bezier(.34,1.4,.64,1), background 0.4s, color 0.4s, border-color 0.4s; }
        .v01ct-card:hover .v01ct-seal { transform:rotate(-8deg) scale(1.06); background:linear-gradient(140deg,${TEAL},${PRIMARY}); color:#fff; border-color:${TEAL}; }
        .v01ct-text { position:relative; z-index:1; }
        .v01ct-text h3{ font-family: ${FONT_H}; font-size: 1.35rem; font-weight: 400; color: ${TEAL}; margin: 4px 0 12px; }
        .v01ct-text p { font-family: ${FONT_B}; font-size: 15px; color: #3a5560; line-height: 1.65; margin: 0; }
        .v01ct-ribbon { display:inline-flex; align-items:center; gap:6px; font-family:${FONT_B}; font-size:11px; font-weight:700; letter-spacing:0.14em; text-transform:uppercase; color:${TEAL}; background:#e6f3f5; padding:5px 12px; border-radius:50px; margin-bottom:10px; }
        @media (max-width: 720px) {
          .v01ct-grid { grid-template-columns: 1fr; }
          .v01ct-card { flex-direction: column; align-items: center; text-align: center; }
        }
      `}</style>

      <div className="v01ct-inner">
        {showHeader && (
          <div className="v01ct-header">
            <p className="v01ct-kicker">
              <svg width="15" height="15" viewBox="0 0 60 60" fill="currentColor" aria-hidden="true"><circle cx="18" cy="14" r="6"/><circle cx="30" cy="9" r="6"/><circle cx="42" cy="14" r="6"/><ellipse cx="30" cy="34" rx="13" ry="11"/><circle cx="23" cy="45" r="5"/><circle cx="37" cy="45" r="5"/></svg>
              <GenericEditableText sectionId={sectionId} field="kicker" value={kicker} tag="span" />
            </p>
            <h2 className="v01ct-heading">
              <GenericEditableText sectionId={sectionId} field="heading" value={heading} tag="span" />
            </h2>
            <div className="v01ct-rule" />
          </div>
        )}

        <div className="v01ct-grid">
          {items.map((item, i) => (
            <div key={i} className="v01ct-card">
              <span className="v01ct-seal" aria-hidden="true">
                <svg width="54" height="54" viewBox="0 0 60 60" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{SEALS[i % SEALS.length]}</svg>
              </span>
              <div className="v01ct-text">
                <span className="v01ct-ribbon">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>
                  <GenericEditableText sectionId={sectionId} field="ribbonLabel" value={String(content.ribbonLabel ?? "Certifikováno")} tag="span" />
                </span>
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
  const DARK  = "#101417";
  const FONT  = "'Hanken Grotesk', 'Inter', sans-serif";

  type Benefit = { title?: string; description?: string };
  const eyebrowRaw = (content as Record<string, unknown>).kicker;
  const titleRaw   = (content as Record<string, unknown>).heading;
  const kicker   = eyebrowRaw === undefined ? "Výhody členství" : String(eyebrowRaw);
  const heading  = titleRaw   === undefined ? "Klub Tlapka & Styl" : String(titleRaw);
  const showHeader = !!(kicker.trim() || heading.trim());
  const body     = String(content.body     ?? "Staňte se členem věrnostního klubu a užívejte si exkluzivní výhody při každé návštěvě. Čím častěji přicházíte, tím více získáváte.");
  const ctaText  = String(content.ctaText  ?? "Chci se přidat");
  const rawHref  = String(content.ctaHref  ?? "/kontakt");
  const siteMode = String(content.siteMode ?? "multipage");
  const ctaHref  = tenantSlug ? resolveNavHref(rawHref, siteMode, tenantSlug, isAdmin ?? false) : rawHref;
  const benefits = (content.benefits as Benefit[]) ?? [];

  const benefitIcon = (i: number) => {
    const p = { width: 20, height: 20, viewBox: "0 0 24 24", fill: "none", stroke: DARK, strokeWidth: 2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true as const };
    if (i === 0) return <svg {...p}><line x1="19" y1="5" x2="5" y2="19"/><circle cx="6.5" cy="6.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/></svg>; // percent
    if (i === 1) return <svg {...p}><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><path d="M12 13l1.2 2.4 2.6.3-1.9 1.8.5 2.6-2.4-1.3-2.4 1.3.5-2.6-1.9-1.8 2.6-.3z" fill={DARK} stroke="none"/></svg>; // calendar-star
    if (i === 2) return <svg {...p}><polyline points="20 12 20 22 4 22 4 12"/><rect x="2" y="7" width="20" height="5"/><line x1="12" y1="22" x2="12" y2="7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/></svg>; // gift
    return <svg {...p}><path d="M4 9l4 4 8-8"/></svg>;
  };

  return (
    <section id="klub" data-template="grooming-01-club" style={{ background: "#f6f6f6", fontFamily: FONT }}>
      <div className="gr01cl-wrap">
        <div className="gr01cl-left">
          <svg className="gr01cl-paw" viewBox="0 0 32 32" fill="currentColor" aria-hidden="true"><ellipse cx="16" cy="21" rx="8.5" ry="6.5"/><ellipse cx="8.5" cy="14" rx="3.2" ry="4.2"/><ellipse cx="23.5" cy="14" rx="3.2" ry="4.2"/><ellipse cx="12.5" cy="11" rx="2.3" ry="3"/><ellipse cx="19.5" cy="11" rx="2.3" ry="3"/></svg>
          {showHeader && (
            <>
              <p className="gr01cl-kicker">
                <GenericEditableText sectionId={sectionId} field="kicker" value={kicker} tag="span" />
              </p>
              <h2 className="gr01cl-h2">
                <GenericEditableText sectionId={sectionId} field="heading" value={heading} tag="span" />
              </h2>
            </>
          )}
          <p className="gr01cl-body">
            <GenericEditableText sectionId={sectionId} field="body" value={body} tag="span" />
          </p>
          <a href={ctaHref} data-btn="primary" className="gr01cl-cta">
            <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
          </a>
        </div>
        <div className="gr01cl-right">
          {benefits.map((b, i) => (
            <div key={i} className="gr01cl-benefit">
              <div className="gr01cl-icon">{benefitIcon(i)}</div>
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
// solar-01 — 4-step process timeline on dark navy.
// Ambient orange glows + subtle grid overlay.
// Editorial header (conditional showHeader) w/ italic gold accent.
// Each step: 84px gradient orange node w/ custom icon + numbered badge
// (top-right), title + description, hover node lift+rotate.
// Continuous orange gradient line connects nodes + shimmer flow animation.
// Sequenced fade-up reveal (staggered 0.12 → 0.48s).
// ─────────────────────────────────────────────────────────────────────────────
function ProcessSolar01({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  type Step = { number?: string; title?: string; description?: string; icon?: string };
  const rawSteps = ((content.steps as Step[]) ?? []).slice(0, 4);
  const steps: Step[] = rawSteps.length > 0 ? rawSteps : [
    { number: "01", title: "Bezplatná konzultace",      description: "Zavolejte nebo vyplňte formulář — do 24 hodin vám pošleme předběžný návrh a odhad úspory.", icon: "phone" },
    { number: "02", title: "Projekt na míru",           description: "Technik přijede na obhlídku, zaměří střechu a připraví kompletní projekt pro stavební povolení.",     icon: "clipboard" },
    { number: "03", title: "Zajištění dotace NZÚ",      description: "Vyřídíme žádost o dotaci Nová zelená úsporám, smlouvy s distributorem a veškerá potřebná povolení.",    icon: "document" },
    { number: "04", title: "Montáž a spuštění",         description: "Certifikovaný tým provede montáž za 1–3 dny, otestuje systém a předá vám přístup do mobilní aplikace.", icon: "plug" },
  ];

  const eyebrowRaw  = (content as Record<string, unknown>).eyebrow;
  const titleRaw    = (content as Record<string, unknown>).title;
  const subtitleRaw = (content as Record<string, unknown>).subtitle;
  const eyebrow     = eyebrowRaw  === undefined ? "Postup spolupráce" : String(eyebrowRaw);
  const title       = titleRaw    === undefined ? "Cesta k energetické nezávislosti" : String(titleRaw);
  const subtitle    = subtitleRaw === undefined ? "Postaráme se o vše od prvního kontaktu až po předání funkčního systému. Vy se soustředíte na to, na čem záleží." : String(subtitleRaw);
  const showHeader  = !!(eyebrow.trim() || title.trim() || subtitle.trim());

  const iconFor = (key?: string) => {
    switch (key) {
      case "phone":
        return (
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.37 1.9.72 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.35 1.85.59 2.81.72a2 2 0 0 1 1.72 2z"/>
          </svg>
        );
      case "clipboard":
        return (
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M9 2h6a2 2 0 0 1 2 2v2h1a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h1V4a2 2 0 0 1 2-2z"/>
            <path d="M9 4h6v2H9z" fill="currentColor"/>
            <line x1="8" y1="12" x2="16" y2="12"/>
            <line x1="8" y1="16" x2="13" y2="16"/>
          </svg>
        );
      case "document":
        return (
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
            <polyline points="9 13 11 15 15 11"/>
          </svg>
        );
      case "plug":
        return (
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polyline points="13 2 4 14 12 14 11 22 20 10 12 10 13 2"/>
          </svg>
        );
      default:
        return (
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="4"/>
            <path d="M12 2v3m0 14v3M4.22 4.22l2.12 2.12m11.32 11.32l2.12 2.12M2 12h3m14 0h3M4.22 19.78l2.12-2.12m11.32-11.32l2.12-2.12"/>
          </svg>
        );
    }
  };

  return (
    <section className="s01pr" data-template="solar-01">
      <div className="s01pr-bg-grid" aria-hidden="true" />
      <div className="s01pr-inner">
        {showHeader && (
          <div className="s01pr-head">
            {eyebrow.trim() && (
              <span className="s01pr-eyebrow">
                <span className="s01pr-eyebrow-dot" />
                <GenericEditableText sectionId={sectionId} field="eyebrow" value={eyebrow} tag="span" />
              </span>
            )}
            {title.trim() && (
              <h2 className="s01pr-title">
                <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
              </h2>
            )}
            {subtitle.trim() && (
              <p className="s01pr-sub">
                <GenericEditableText sectionId={sectionId} field="subtitle" value={subtitle} tag="span" />
              </p>
            )}
          </div>
        )}

        <ol className="s01pr-timeline" aria-label="Postup spolupráce">
          {steps.map((s, i) => (
            <li className="s01pr-step" key={i}>
              <div className="s01pr-node">
                {iconFor(s.icon)}
                <span className="s01pr-node-num">
                  <GenericEditableText sectionId={sectionId} field={`steps.${i}.number`} value={String(s.number ?? `0${i + 1}`.slice(-2))} tag="span" />
                </span>
              </div>
              <h3 className="s01pr-step-title">
                <GenericEditableText sectionId={sectionId} field={`steps.${i}.title`} value={s.title ?? ""} tag="span" />
              </h3>
              <p className="s01pr-step-desc">
                <GenericEditableText sectionId={sectionId} field={`steps.${i}.description`} value={s.description ?? ""} tag="span" />
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
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
  const ctaText = String(content.ctaText ?? "");
  const ctaHref = String(content.ctaHref ?? "");
  const siteMode = String(content.siteMode ?? "multipage");

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
    .a01med-heading-link {
      display: inline-flex; align-items: center; color: inherit;
      text-decoration: none; transition: transform 0.3s ease, opacity 0.3s ease;
    }
    .a01med-heading-link:hover { transform: translateX(6px); opacity: 0.75; }
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
              {ctaHref ? (
                <a
                  href={resolveNavHref(ctaHref, siteMode, tenantSlug, isAdmin)}
                  className="a01med-heading-link"
                  aria-label={ctaText || heading}
                  title={ctaText || undefined}
                >
                  <NewsArrow />
                </a>
              ) : (
                <NewsArrow />
              )}
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
function PromoKlima01Catalog({ content, sectionId, tenantSlug, isAdmin }: { content: Record<string, unknown>; sectionId: number; tenantSlug?: string; isAdmin?: boolean }) {
  const eyebrow  = String(content.eyebrow  ?? "Naše řešení");
  const title    = String(content.title    ?? "Katalog produktů a řešení");
  const subtitle = String(content.subtitle ?? "Kompletní nabídka klimatizačních jednotek, tepelných čerpadel a příslušenství pro každý typ prostoru.");
  const ctaText  = String(content.ctaText  ?? "Stáhnout katalog");
  const ctaHref  = String(content.ctaHref  ?? "#");
  const siteMode = String(content.siteMode ?? "multipage");

  const resolve = (href: string) => resolveNavHref(href, siteMode, tenantSlug, isAdmin);

  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); io.disconnect(); } }, { threshold: 0.15 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const katalogy = [
    { img: "/assets/klima-01/cat-klima.webp",    label: "Klimatizace",       desc: "Nástěnné, kazetové a parapetní jednotky" },
    { img: "/assets/klima-01/cat-cerpadla.webp",  label: "Tepelná čerpadla",  desc: "Vzduch–voda, vzduch–vzduch systémy" },
    { img: "/assets/klima-01/cat-komercni.webp",  label: "Komerční řešení",   desc: "Kanceláře, obchody a průmyslové haly" },
    { img: "/assets/klima-01/cat-chlazeni.webp",  label: "Chlazení",          desc: "Chladící systémy a VRF technologie" },
    { img: "/assets/klima-01/cat-cisticka.webp",  label: "Čističky vzduchu",  desc: "Filtrace a rekuperace pro zdravý vzduch" },
  ];

  return (
    <section ref={ref} className="kl01-catalog" id="katalog" data-template="klima-01">
      <div className="kl01-catalog-wrap">
        <div className="kl01-catalog-head">
          <div className="kl01-catalog-text">
            <p className="kl01-catalog-eyebrow">
              <span className="kl01-catalog-eline" aria-hidden="true" />
              <GenericEditableText sectionId={sectionId} field="eyebrow" value={eyebrow} tag="span" />
            </p>
            <h2 className="kl01-catalog-title">
              <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
            </h2>
            <p className="kl01-catalog-sub">
              <GenericEditableText sectionId={sectionId} field="subtitle" value={subtitle} tag="span" />
            </p>
          </div>
          <a href={resolve(ctaHref)} className="kl01-catalog-cta">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
          </a>
        </div>

        <div className="kl01-catalog-grid">
          {katalogy.map((k, i) => (
            <div key={i} className="kl01-catalog-card" style={{
              opacity: visible ? 1 : 0,
              transform: visible ? "translateY(0)" : "translateY(20px)",
              transition: `opacity 0.6s ease ${i * 100}ms, transform 0.6s cubic-bezier(0.4,0,0.2,1) ${i * 100}ms`,
            }}>
              <div className="kl01-catalog-card-img">
                <OptimizedPicture src={k.img} alt={k.label} width={320} height={240}
                  style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
              </div>
              <div className="kl01-catalog-card-body">
                <span className="kl01-catalog-card-label">{k.label}</span>
                <span className="kl01-catalog-card-desc">{k.desc}</span>
              </div>
              <span className="kl01-catalog-card-arrow" aria-hidden="true">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── floors-01-showrooms ───────────────────────────────────────────────────────
// Zelený pruh: obrázek vlevo + text s lokacemi showroomů vpravo
// ─────────────────────────────────────────────────────────────────────────────
function ShowroomsFloors01({ content, sectionId, tenantSlug, isAdmin }: { content: Record<string, unknown>; sectionId: number; tenantSlug?: string; isAdmin?: boolean }) {
  const GREEN = "#007d47";
  const WHITE = "#ffffff";
  const FONT  = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif";
  const siteMode = String(content.siteMode ?? "multipage");

  const image     = content.image !== undefined ? String(content.image) : "/templates/floors-01/showroom.webp";
  const eyebrow   = String(content.eyebrow ?? "5 showroomů po celé ČR");
  const title     = String(content.title ?? "Osahejte si podlahy naživo");
  const navLabel  = String(content.navLabel ?? "Navštivte nás");
  const badgeNum  = String(content.badgeNum ?? "800+");
  const badgeText = String(content.badgeText ?? "vzorků na jednom místě");
  const bullets   = (content.bullets   as string[]) ?? [
    "Zkušení poradci vám pomohou vybrat podlahu přesně na míru vašemu prostoru i rozpočtu.",
    "Fyzicky si osaháte přes 800 vzorků podlah, koberců a teras — vše na jednom místě.",
  ];
  const locations = (content.locations as Array<{ label: string; href: string }>) ?? [
    { label: "Praha – Západ",       href: "/kontakt" },
    { label: "Brno – Centrum",      href: "/kontakt" },
    { label: "Olomouc",             href: "/kontakt" },
    { label: "České Budějovice",    href: "/kontakt" },
    { label: "Liberec",             href: "/kontakt" },
  ];

  const resolve = (href: string) => resolveNavHref(href, siteMode, tenantSlug, isAdmin);

  const PinIcon = () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z" /><circle cx="12" cy="9.5" r="2.5" />
    </svg>
  );

  return (
    <section data-template="floors-01" style={{ fontFamily: FONT }}>
      <div className="f01s-section">
        <div className="f01s-layout">
          {/* Left image panel */}
          <div className="f01s-img">
            <GenericEditableImage sectionId={sectionId} field="image" src={image} alt="Vzorkový showroom podlah" style={{ position: "absolute", inset: 0 }}>
              <img src={image} alt="Vzorkový showroom podlah" loading="lazy" />
            </GenericEditableImage>
            <div className="f01s-img-shade" aria-hidden="true" />
            <div className="f01s-badge">
              <b><GenericEditableText sectionId={sectionId} field="badgeNum" value={badgeNum} tag="span" /></b>
              <GenericEditableText sectionId={sectionId} field="badgeText" value={badgeText} tag="span" />
            </div>
          </div>

          {/* Right content */}
          <div className="f01s-body">
            <span className="f01s-eyebrow">
              <GenericEditableText sectionId={sectionId} field="eyebrow" value={eyebrow} tag="span" />
            </span>
            <h2 className="f01s-title">
              <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
            </h2>

            <div className="f01s-bullets">
              {bullets.map((b, i) => (
                <div key={i} className="f01s-bullet">
                  <span className="f01s-check" aria-hidden="true">
                    <svg width="13" height="13" viewBox="0 0 18 18" fill="none"><path d="M4 9.2l3 3 7-7.4" stroke={WHITE} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  </span>
                  <p><GenericEditableText sectionId={sectionId} field={`bullets.${i}`} value={b} tag="span">{b}</GenericEditableText></p>
                </div>
              ))}
            </div>

            <div>
              <p className="f01s-navlabel"><GenericEditableText sectionId={sectionId} field="navLabel" value={navLabel} tag="span" /></p>
              <div className="f01s-locs">
                {locations.map((loc, i) => (
                  <a key={i} href={resolve(loc.href)} className="f01s-loc">
                    <PinIcon />
                    <GenericEditableText sectionId={sectionId} field={`locations.${i}.label`} value={loc.label} tag="span">{loc.label}</GenericEditableText>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── floors-01-benefits ────────────────────────────────────────────────────────
// 4-sloupcový grid s ikonami — proč nakupovat u nás
// ─────────────────────────────────────────────────────────────────────────────
function BenefitsFloors01({ content, sectionId, tenantSlug, isAdmin }: { content: Record<string, unknown>; sectionId: number; tenantSlug?: string; isAdmin?: boolean }) {
  const FONT   = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif";
  const siteMode = String(content.siteMode ?? "multipage");

  const eyebrowRaw = (content as Record<string, unknown>).eyebrow;
  const titleRaw   = (content as Record<string, unknown>).title;
  const eyebrow = eyebrowRaw === undefined ? "Proč PARKETO" : String(eyebrowRaw);
  const title   = titleRaw   === undefined ? "S námi to máte jednoduché" : String(titleRaw);
  const showHeader = !!(eyebrow.trim() || title.trim());

  const items = (content.items as Array<{ icon: string; title: string; text: string; href: string }>) ?? [
    { icon: "award",    title: "18 let praxe",    text: "Přes 12 000 spokojených zákazníků a tisíce úspěšných realizací po celé ČR.", href: "/sluzby" },
    { icon: "install",  title: "Montáž na klíč",  text: "Zajistíme pokládku od přípravy podkladu až po finální lišty — vy jen vybíráte.", href: "/sluzby" },
    { icon: "measure",  title: "Měření zdarma",   text: "Technik přijede zaměřit prostor a poradí s výběrem materiálu přímo u vás doma.", href: "/sluzby" },
    { icon: "warranty", title: "Záruka 5 let",    text: "Na všechny podlahy i provedenou montáž poskytujeme pětiletou záruku kvality.", href: "/sluzby" },
  ];

  const resolve = (href: string) => resolveNavHref(href, siteMode, tenantSlug, isAdmin);

  const iconFor = (key: string) => {
    const p = { width: 28, height: 28, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true };
    switch (key) {
      case "award":    return (<svg {...p}><circle cx="12" cy="8" r="6" /><path d="M8.21 13.89 7 22l5-3 5 3-1.21-8.11" /></svg>);
      case "install":  return (<svg {...p}><path d="M14.7 6.3a4 4 0 0 0-5.6 5.6L3 18l3 3 6.1-6.1a4 4 0 0 0 5.6-5.6l-2.9 2.9-2.1-2.1 2.9-2.9z" /></svg>);
      case "measure":  return (<svg {...p}><path d="M21.3 15.3 8.7 2.7a1 1 0 0 0-1.4 0L2.7 7.3a1 1 0 0 0 0 1.4l12.6 12.6a1 1 0 0 0 1.4 0l4.6-4.6a1 1 0 0 0 0-1.4z" /><path d="M7 9l1.5 1.5M10 6l2 2M13.5 9.5l1.5 1.5M16 6l2 2" /></svg>);
      case "warranty": return (<svg {...p}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><path d="M9 12l2 2 4-4" /></svg>);
      default:         return (<span style={{ fontSize: 28 }}>{key}</span>);
    }
  };

  return (
    <section data-template="floors-01" style={{ fontFamily: FONT }}>
      <div className="f01b-section">
        <div className="f01b-wrap">
          {showHeader && (
            <div className="f01b-head">
              {eyebrow.trim() && (
                <span className="f01b-eyebrow"><GenericEditableText sectionId={sectionId} field="eyebrow" value={eyebrow} tag="span" /></span>
              )}
              <GenericEditableText sectionId={sectionId} field="title" value={title} tag="h2" className="f01b-title" />
            </div>
          )}
          <div className="f01b-grid">
            {items.map((item, i) => (
              <a key={i} href={resolve(item.href)} className="f01b-card">
                <span className="f01b-badge">{iconFor(String(item.icon))}</span>
                <GenericEditableText sectionId={sectionId} field={`items.${i}.title`} value={item.title} tag="h3" className="f01b-name" />
                <GenericEditableText sectionId={sectionId} field={`items.${i}.text`} value={item.text} tag="p" className="f01b-text" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ── solar-03-process ──────────────────────────────────────────────────────────
function ProcessSolar03({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  type Step = { title?: string; description?: string };
  const eyebrow  = String(content.eyebrow  ?? "Jak to u nás funguje");
  const title    = String(content.title    ?? "Postaráme se o vás od konzultace až po dohled nad provozem");
  const subtitle = String(content.subtitle ?? "Čtyři kroky, jasné termíny, jeden partner. Bez subdodavatelů, bez přehazování zodpovědnosti — dodáváme přesně to, co si odsouhlasíme na první schůzce.");
  const image    = String(content.image    ?? "/templates/solar-03/process.webp");
  const specValue = String(content.specValue ?? "48 h");
  const specLabel = String(content.specLabel ?? "reakční doba na první poptávku");
  const steps: Step[] = Array.isArray(content.steps) ? (content.steps as Step[]) : [];

  return (
    <section className="s03pr-section" data-template="solar-03" id="proces">
      <div className="s03pr-bg-grid" aria-hidden="true" />
      <div className="s03pr-inner">
        <div className="s03pr-header">
          <div className="s03pr-eyebrow">
            <span className="s03pr-eyebrow-dot" aria-hidden="true" />
            <GenericEditableText sectionId={sectionId} field="eyebrow" value={eyebrow} tag="span" />
          </div>
          <h2 className="s03pr-h2">
            <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
          </h2>
          <p className="s03pr-sub-lead">
            <GenericEditableText sectionId={sectionId} field="subtitle" value={subtitle} tag="span" />
          </p>
        </div>

        <div className="s03pr-row">
          <div className="s03pr-left">
            <div className="s03pr-rail" aria-hidden="true" />
            {steps.map((step, i) => (
              <div className="s03pr-step" key={i}>
                <div className="s03pr-num">
                  <span className="s03pr-num-label">Krok</span>
                  <span className="s03pr-num-value">{String(i + 1).padStart(2, "0")}</span>
                </div>
                <div className="s03pr-step-body">
                  <h3 className="s03pr-step-h3">
                    <GenericEditableText sectionId={sectionId} field={`steps.${i}.title`} value={String(step.title ?? "")} tag="span" />
                  </h3>
                  <p className="s03pr-step-p">
                    <GenericEditableText sectionId={sectionId} field={`steps.${i}.description`} value={String(step.description ?? "")} tag="span" />
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="s03pr-right">
            <div className="s03pr-image-frame">
              <GenericEditableImage sectionId={sectionId} field="image" src={image} alt={title} style={{ width: "100%", height: "100%" }}>
                <img src={image} alt={title} loading="lazy" className="s03pr-img" />
              </GenericEditableImage>
              <div className="s03pr-image-shade" aria-hidden="true" />
              <svg className="s03pr-corner s03pr-corner-tl" width="46" height="46" viewBox="0 0 46 46" fill="none" aria-hidden="true">
                <path d="M2 16V2h14" stroke="#ff8b00" strokeWidth="2" strokeLinecap="square"/>
              </svg>
              <svg className="s03pr-corner s03pr-corner-br" width="46" height="46" viewBox="0 0 46 46" fill="none" aria-hidden="true">
                <path d="M44 30v14H30" stroke="#ff8b00" strokeWidth="2" strokeLinecap="square"/>
              </svg>
              <div className="s03pr-spec">
                <span className="s03pr-spec-value">
                  <GenericEditableText sectionId={sectionId} field="specValue" value={specValue} tag="span" />
                </span>
                <span className="s03pr-spec-label">
                  <GenericEditableText sectionId={sectionId} field="specLabel" value={specLabel} tag="span" />
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── ProcessSolar02 ─── solar-02 Greenia 5-step how-it-works ───────────── */
function ProcessSolar02({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const showHeader = content.showHeader !== false;
  const eyebrow  = String(content.eyebrow  ?? "Jak projekt probíhá");
  const title    = String(content.title    ?? "Transparentní postup bez překvapení");
  const subtitle = String(content.subtitle ?? "Od prvního kontaktu po předání hotového systému — pět jasně definovaných kroků s garantovanými termíny.");
  const steps = (content.steps as Array<{ title: string; description: string }> | undefined) ?? [
    { title: "Úvodní hovor",      description: "Zavoláme vám do 24 hodin. Zjistíme základní parametry objektu a spotřeby, abychom mohli připravit předběžnou kalkulaci." },
    { title: "Energetický audit", description: "Navštívíme váš objekt, změříme spotřebu a provedeme technický průzkum střechy i rozvodů." },
    { title: "Návrh a smlouva",   description: "Zpracujeme projektovou dokumentaci a cenovou nabídku na míru. Po podpisu smlouvy zahajujeme vyřizování povolení a dotací." },
    { title: "Výstavba",          description: "Montáž provádí naše certifikovaná parta. Průměrná délka výstavby systému do 500 kWp je 10–14 pracovních dní." },
    { title: "Spuštění a servis", description: "Systém uvádíme do provozu, zaškolíme obsluhu a nastavíme vzdálený monitoring. Servisní smlouva je součástí dodávky." },
  ];

  return (
    <section className="s02proc" id="jak-to-funguje" data-template="solar-02">
      {/* Decorative PV grid motif in corner */}
      <svg className="s02proc-motif" viewBox="0 0 300 200" aria-hidden="true" preserveAspectRatio="none">
        <g stroke="rgba(121,196,79,0.18)" strokeWidth="0.6" fill="none">
          {Array.from({length: 10}).map((_, i) => <line key={`v${i}`} x1={i*30} y1="0" x2={i*30} y2="200" />)}
          {Array.from({length: 7}).map((_, i) => <line key={`h${i}`} x1="0" y1={i*30} x2="300" y2={i*30} />)}
        </g>
      </svg>

      <div className="s02proc-inner">
        {showHeader && (
          <div className="s02proc-head">
            <div className="s02proc-eyebrow">
              <span className="s02proc-eyebrow-dot" aria-hidden="true" />
              <GenericEditableText sectionId={sectionId} field="eyebrow" value={eyebrow} tag="span" />
            </div>
            <h2 className="s02proc-h2">
              <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
            </h2>
            <p className="s02proc-sub">
              <GenericEditableText sectionId={sectionId} field="subtitle" value={subtitle} tag="span" />
            </p>
          </div>
        )}

        <div className="s02proc-steps">
          <div className="s02proc-rail" aria-hidden="true" />
          {steps.map((step, i) => (
            <div className="s02proc-step" key={i}>
              <div className="s02proc-badge" aria-hidden="true">
                <span className="s02proc-badge-ring" aria-hidden="true" />
                <span className="s02proc-badge-num">{String(i + 1).padStart(2, "0")}</span>
              </div>
              <h3 className="s02proc-h3">
                <GenericEditableText sectionId={sectionId} field={`steps.${i}.title`} value={step.title} tag="span" />
              </h3>
              <p className="s02proc-p">
                <GenericEditableText sectionId={sectionId} field={`steps.${i}.description`} value={step.description} tag="span" />
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── klempir-01-historical ──────────────────────────────────────────────────────
// Copper & Slate: tmavá slate sekce — grid 6/6: vlevo Fraunces statement +
// body + badge „Spolupráce s památkáři"; vpravo velké foto s copper rámem.
interface HistoricalK01Props {
  content: Record<string, unknown>;
  sectionId: number;
  tenantSlug?: string;
  isAdmin: boolean;
}

function HistoricalKlempir01({ content, sectionId, tenantSlug: _tenantSlug, isAdmin: _isAdmin }: HistoricalK01Props) {
  const title = String(content.title ?? "Historické opravy jsou moje vášeň");
  const subtitle = String(content.subtitle ?? "Řemeslná tradice v moderním provedení");
  const body = String(content.body ?? "");
  const badge = String(content.badge ?? "Spolupracuji s památkáři a architekty");
  const images = (content.images as Array<{ url?: string; alt?: string }>) ?? [];
  const mainImage = String(content.mainImage ?? images[0]?.url ?? "https://images.unsplash.com/photo-1519677100203-a0e668c92439?w=1200&h=1400&fit=crop&auto=format&q=80");

  return (
    <>
      <style>{`
        .k01hi-section { background: #14171A; padding: clamp(4rem, 8vw, 7rem) 0; font-family: 'Manrope', sans-serif; }
        .k01hi-inner {
          max-width: 76rem; margin: 0 auto; padding: 0 clamp(1.25rem, 4vw, 2.5rem);
          display: grid; grid-template-columns: minmax(0, 6fr) minmax(0, 6fr);
          gap: clamp(2.5rem, 6vw, 5rem); align-items: center;
        }
        .k01hi-kicker {
          display: inline-flex; align-items: center; gap: 0.6rem;
          font-size: 0.8rem; font-weight: 700; letter-spacing: 0.16em; text-transform: uppercase;
          color: #D98E55; margin-bottom: 1.2rem;
        }
        .k01hi-kicker::before { content: ""; width: 26px; height: 2px; background: #B4622D; }
        .k01hi-h2 {
          font-family: 'Fraunces', serif;
          font-size: clamp(2rem, 3.8vw, 3.1rem); font-weight: 600;
          color: #F7F4EF; line-height: 1.08; margin: 0 0 1.4rem; letter-spacing: -0.02em; text-wrap: balance;
        }
        .k01hi-body { font-size: 1rem; color: rgba(247,244,239,0.72); line-height: 1.78; margin: 0 0 1.9rem; white-space: pre-line; }
        .k01hi-badge {
          display: inline-flex; align-items: center; gap: 0.7rem;
          border: 1px solid rgba(217,142,85,0.4); border-radius: 4px;
          padding: 0.8rem 1.1rem; font-size: 0.9rem; font-weight: 600; color: #D98E55;
        }
        .k01hi-badge svg { flex-shrink: 0; }
        .k01hi-media { position: relative; }
        .k01hi-photo {
          position: relative; overflow: hidden; border-radius: 6px;
          aspect-ratio: 4/4.6; background: #23262A;
          box-shadow: 0 34px 70px -38px rgba(0,0,0,0.7);
        }
        .k01hi-photo img { width: 100%; height: 100%; object-fit: cover; display: block; }
        .k01hi-photo::after { content: ""; position: absolute; left: 0; right: 0; bottom: 0; height: 5px; background: #B4622D; }
        @media (max-width: 900px) {
          .k01hi-inner { grid-template-columns: 1fr; gap: 2.4rem; }
          .k01hi-photo { aspect-ratio: 16/11; }
        }
      `}</style>

      <section className="k01hi-section" id="historicke" data-template="klempir-01-historical">
        <div className="k01hi-inner">
          <div>
            <p className="k01hi-kicker"><GenericEditableText sectionId={sectionId} field="subtitle" value={subtitle} tag="span" /></p>
            <h2 className="k01hi-h2"><GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" /></h2>
            <p className="k01hi-body"><GenericEditableText sectionId={sectionId} field="body" value={body} tag="span" /></p>
            <span className="k01hi-badge">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 2l8 3.5v5.1c0 5-3.4 9.6-8 10.9-4.6-1.3-8-5.9-8-10.9V5.5L12 2z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/></svg>
              <GenericEditableText sectionId={sectionId} field="badge" value={badge} tag="span" />
            </span>
          </div>
          <div className="k01hi-media">
            <div className="k01hi-photo">
              <GenericEditableImage sectionId={sectionId} field="mainImage" src={mainImage} alt="Historické střechy" className="absolute inset-0 w-full h-full" style={{ position: "absolute" }}>
                <img src={mainImage} alt="Historické střechy" loading="lazy" />
              </GenericEditableImage>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}


// ── malir-01-promo ────────────────────────────────────────────────────────────
// VYLEPŠENO (luxe malíř):
// - Surface bg #f8f7f5, 5 benefit karet v gridu
// - Amber icon circles (SVG ikony místo emoji) + hover lift+glow
// - Amber eyebrow + Playfair title + amber rule, conditional header
// - Staggered reveal animace
// ─────────────────────────────────────────────────────────────────────────────
function PromoMalir01({ content, sectionId, isAdmin: _isAdmin }: { content: Record<string, unknown>; sectionId: number; isAdmin: boolean }) {
  const AMBER    = "#E79B0E";
  const DARK     = "#1a1a1a";
  const MUTED    = "#555555";
  const SURFACE  = "#f8f7f5";
  const FONT_H   = "'Playfair Display', Georgia, serif";
  const FONT_B   = "'Raleway', sans-serif";

  const eyebrow = String(content.eyebrow ?? content.tagline ?? "Proč právě my");
  const title   = String(content.title ?? "5 důvodů, proč nám svěřit váš interiér");
  const subtitle = String(content.subtitle ?? "");
  const showHeader = !!(eyebrow.trim() || title.trim() || subtitle.trim());

  type BenefitItem = { icon: string; title: string; description: string };
  const defaultItems: BenefitItem[] = [
    { icon: "📅", title: "Přesný termín", description: "Domluvený den zahájení i dokončení dodržujeme. Žádné posouvání bez domluvy." },
    { icon: "🎨", title: "Prémiové materiály", description: "Pracujeme výhradně s barvami Primalex Polar a Dulux — bez žloutnutí po letech." },
    { icon: "🧹", title: "Kompletní úklid", description: "Zakryjeme podlahy i nábytek, po dokončení vše odkryjeme a uklidíme do posledního detailu." },
    { icon: "🛡️", title: "Záruka 2 roky", description: "Na veškeré práce poskytujeme dvouletou záruku. Případné nedostatky řešíme okamžitě." },
    { icon: "💡", title: "Poradenství zdarma", description: "Pomůžeme s výběrem odstínu i typu nátěru — ať barva ladí s vaším interiérem." },
  ];
  const items: BenefitItem[] = Array.isArray(content.items) && (content.items as unknown[]).length
    ? (content.items as BenefitItem[])
    : defaultItems;

  return (
    <section id="benefity" data-template="malir-01" style={{
      background: SURFACE, padding: "clamp(60px, 10vw, 110px) 0", fontFamily: FONT_B,
    }}>
      <div style={{ maxWidth: 1140, margin: "0 auto", padding: "0 30px" }}>
        {/* Header */}
        {showHeader && (
          <div style={{ textAlign: "center", marginBottom: "clamp(36px, 5vw, 56px)" }}>
            <div className="m01p-reveal" style={{ display: "flex", alignItems: "center", gap: 12, justifyContent: "center", marginBottom: 14 }}>
              <span style={{ width: 32, height: 1, background: AMBER }} />
              <GenericEditableText sectionId={sectionId} field="eyebrow" value={eyebrow} tag="span" style={{
                fontFamily: FONT_B, fontWeight: 600, fontSize: 12, color: AMBER,
                letterSpacing: "0.14em", textTransform: "uppercase" as const,
              }} />
              <span style={{ width: 32, height: 1, background: AMBER }} />
            </div>
            <div className="m01p-reveal" style={{ animationDelay: "0.1s" }}>
              <GenericEditableText sectionId={sectionId} field="title" value={title} tag="h2" style={{
                fontFamily: FONT_H, fontWeight: 800,
                fontSize: "clamp(26px, 3.5vw, 40px)", lineHeight: 1.2,
                color: DARK, margin: "0 auto", maxWidth: 600,
              }} />
            </div>
            <div className="m01p-reveal" style={{ animationDelay: "0.15s" }}>
              <div style={{ width: 48, height: 3, background: AMBER, borderRadius: 2, margin: "18px auto 0" }} />
            </div>
          </div>
        )}

        {/* Benefit grid */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "clamp(20px, 3vw, 32px)",
        }}>
          {items.map((item, i) => (
            <div key={i} className="m01p-card m01p-reveal" style={{
              animationDelay: `${0.1 + i * 0.08}s`,
              background: "#ffffff", borderRadius: 6,
              padding: "clamp(24px, 3vw, 36px) clamp(20px, 2.5vw, 28px)",
              textAlign: "center",
              boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
              border: "1px solid rgba(0,0,0,0.04)",
              transition: "all 0.35s cubic-bezier(.4,0,.2,1)",
            }}>
              {/* Icon circle */}
              <div style={{
                width: 56, height: 56, borderRadius: "50%",
                background: `${AMBER}14`, border: `1.5px solid ${AMBER}30`,
                display: "flex", alignItems: "center", justifyContent: "center",
                margin: "0 auto 18px", fontSize: 26, lineHeight: 1,
                transition: "all 0.35s cubic-bezier(.4,0,.2,1)",
              }} className="m01p-icon-circle">
                <GenericEditableText sectionId={sectionId} field={`items.${i}.icon`} value={item.icon} tag="span" />
              </div>
              <GenericEditableText sectionId={sectionId} field={`items.${i}.title`} value={item.title} tag="h3" style={{
                fontFamily: FONT_B, fontSize: 16, fontWeight: 700,
                color: DARK, margin: "0 0 10px", lineHeight: 1.3,
              }} />
              <GenericEditableText sectionId={sectionId} field={`items.${i}.description`} value={item.description} tag="p" style={{
                fontFamily: FONT_B, fontSize: 14, lineHeight: 1.75,
                color: MUTED, margin: 0,
              }} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── clean-02-promo (výhody) ──────────────────────────────────────────────────
// Arctic Editorial: editorial header (eyebrow + H2 + subtitle) a 4-col grid
// bez kartových boxů — hairline dělítka, indexy 01–04, ink hover akcent.
function PromoClean02({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const eyebrow = String(content.eyebrow ?? "Proč s námi");
  const title   = String(content.title   ?? "Úklid bez starostí od začátku do konce");
  const sub     = String(content.subtitle ?? "Nemusíte se o nic starat — vše zařídíme za vás. Od prvního kontaktu až po finální kontrolu. Pevné procesy, vyškolený tým a férový přístup.");
  const items   = (content.items as Array<{ icon?: string; title?: string; description?: string }>) ?? [];

  return (
    <>
      <style>{`
        .c02p-section {
          background: #fff;
          padding: clamp(4rem, 8vw, 7rem) 0;
          font-family: 'Onest', sans-serif;
        }
        .c02p-inner { max-width: 76rem; margin: 0 auto; padding: 0 clamp(1.25rem, 4vw, 2.5rem); }
        .c02p-header {
          display: grid; grid-template-columns: minmax(0, 7fr) minmax(0, 5fr);
          gap: 2rem 4rem; align-items: end;
          margin-bottom: clamp(2.5rem, 5vw, 4rem);
        }
        .c02p-tagline {
          display: inline-flex; align-items: center; gap: 0.55rem;
          font-size: 0.8rem; font-weight: 700; letter-spacing: 0.14em;
          text-transform: uppercase; color: var(--color-primary, #1B5BFF);
          margin-bottom: 1.1rem;
        }
        .c02p-tagline::before { content: ""; width: 22px; height: 2px; background: var(--color-primary, #1B5BFF); border-radius: 2px; }
        .c02p-h2 {
          font-family: 'Bricolage Grotesque', sans-serif;
          font-size: clamp(1.9rem, 3.4vw, 2.9rem);
          font-weight: 750; color: var(--color-secondary, #0B1526);
          line-height: 1.08; margin: 0;
          letter-spacing: -0.03em; text-wrap: balance;
        }
        .c02p-sub {
          font-size: 1.02rem; color: var(--color-text-muted, #5B6577);
          line-height: 1.7; margin: 0 0 0.3rem;
        }
        .c02p-grid {
          display: grid; grid-template-columns: repeat(4, 1fr);
          border-top: 1px solid var(--color-border, #E2E8F1);
        }
        .c02p-item {
          padding: 1.9rem 1.6rem 0.4rem 0;
          border-right: 1px solid var(--color-border, #E2E8F1);
          position: relative;
        }
        .c02p-item + .c02p-item { padding-left: 1.6rem; }
        .c02p-item:last-child { border-right: none; padding-right: 0; }
        .c02p-index {
          font-family: 'Bricolage Grotesque', sans-serif;
          font-size: 0.86rem; font-weight: 700; color: var(--color-primary, #1B5BFF);
          letter-spacing: 0.04em; display: block; margin-bottom: 1.15rem;
          font-variant-numeric: tabular-nums;
        }
        .c02p-item-title {
          font-family: 'Bricolage Grotesque', sans-serif;
          font-size: 1.16rem; font-weight: 700; letter-spacing: -0.015em;
          color: var(--color-secondary, #0B1526); margin: 0 0 0.55rem;
        }
        .c02p-item-desc {
          font-size: 0.92rem; color: var(--color-text-muted, #5B6577);
          line-height: 1.68; margin: 0;
        }
        @media (max-width: 960px) {
          .c02p-header { grid-template-columns: 1fr; gap: 1.2rem; }
          .c02p-grid { grid-template-columns: 1fr 1fr; row-gap: 0.6rem; }
          .c02p-item:nth-child(2n) { border-right: none; }
          .c02p-item:nth-child(n+3) { border-top: 1px solid var(--color-border, #E2E8F1); }
          .c02p-grid { border-top: none; }
          .c02p-item { padding: 1.4rem 1.2rem 0.6rem 0; }
          .c02p-item + .c02p-item { padding-left: 1.2rem; }
          .c02p-item:nth-child(3) { padding-left: 0; }
        }
        @media (max-width: 500px) {
          .c02p-grid { grid-template-columns: 1fr; }
          .c02p-item { border-right: none !important; padding: 1.3rem 0 0.5rem !important; }
          .c02p-item:nth-child(n+2) { border-top: 1px solid var(--color-border, #E2E8F1); }
        }
      `}</style>

      <section className="c02p-section" id="proc-s-nami" data-template="clean-02-promo">
        <div className="c02p-inner">
          <div className="c02p-header">
            <div>
              <div className="c02p-tagline">
                <GenericEditableText sectionId={sectionId} field="eyebrow" value={eyebrow} tag="span" />
              </div>
              <h2 className="c02p-h2">
                <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
              </h2>
            </div>
            <p className="c02p-sub">
              <GenericEditableText sectionId={sectionId} field="subtitle" value={sub} tag="span" />
            </p>
          </div>

          <div className="c02p-grid">
            {items.map((item, i) => (
              <div key={i} className="c02p-item">
                <span className="c02p-index">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="c02p-item-title">
                  <GenericEditableText sectionId={sectionId} field={`items.${i}.title`} value={item.title ?? ""} tag="span" />
                </h3>
                <p className="c02p-item-desc">
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
  const eyebrow      = String((content as Record<string,unknown>).eyebrow      ?? "Viděli jste nás v TV?");
  const title        = String((content as Record<string,unknown>).title        ?? "Naši práci ocenila i Česká televize");
  const subtitle     = String((content as Record<string,unknown>).subtitle     ?? "Podívejte se na reportáž z pořadu Polopatě, kde ukazujeme, jak vzniká zahrada od prvního náčrtu až po předání.");
  const videoUrl     = String((content as Record<string,unknown>).videoUrl     ?? "");
  const videoTitle   = String((content as Record<string,unknown>).videoTitle   ?? "Reportáž ČT — EdenPro");
  const thumbnailUrl = String((content as Record<string,unknown>).thumbnailUrl ?? "/assets/garden-02/tv-thumb.webp");
  const thumbnailAlt = String((content as Record<string,unknown>).thumbnailAlt ?? "Reportáž České televize — EdenPro");

  const [playing, setPlaying] = useState(false);

  const PRIMARY = "#95c11f";
  const DARK    = "#1a2a0a";
  const SURFACE = "#f5f5f0";
  const FONT    = "'Inter', Arial, sans-serif";

  return (
    <>
      <style>{`
        .g02tv-section {
          background: ${SURFACE}; padding: 100px 0;
          font-family: ${FONT}; position: relative; overflow: hidden;
        }
        .g02tv-section::before {
          content: ""; position: absolute; top: -60px; right: -40px;
          width: 200px; height: 200px; border-radius: 50%;
          background: radial-gradient(circle, rgba(149,193,31,0.08) 0%, transparent 70%);
          pointer-events: none;
        }
        .g02tv-inner {
          max-width: 920px; margin: 0 auto; padding: 0 1.5rem;
          text-align: center; position: relative; z-index: 1;
        }
        .g02tv-eyebrow {
          display: inline-flex; align-items: center; gap: 0.6rem;
          font-size: 0.7rem; font-weight: 600;
          letter-spacing: 0.16em; text-transform: uppercase;
          color: ${PRIMARY}; margin-bottom: 1rem;
        }
        .g02tv-eyebrow-line {
          width: 32px; height: 1.5px; background: ${PRIMARY}; opacity: 0.5;
        }
        .g02tv-h2 {
          font-size: clamp(1.6rem, 3.5vw, 2.4rem); font-weight: 800;
          color: ${DARK}; margin: 0 0 0.8rem; line-height: 1.15;
          letter-spacing: -0.02em;
        }
        .g02tv-sub {
          font-size: 1.05rem; color: #555; max-width: 640px;
          margin: 0 auto 2.5rem; line-height: 1.7;
        }
        .g02tv-wrap {
          position: relative; padding-bottom: 56.25%; height: 0;
          border-radius: 16px; overflow: hidden;
          box-shadow: 0 12px 48px rgba(26,42,10,0.14);
          cursor: pointer; transition: box-shadow 0.4s ease, transform 0.4s ease;
        }
        .g02tv-wrap:hover {
          box-shadow: 0 18px 56px rgba(26,42,10,0.22);
          transform: translateY(-4px);
        }
        .g02tv-wrap iframe {
          position: absolute; inset: 0; width: 100%; height: 100%; border: none;
        }
        .g02tv-thumb { position: absolute; inset: 0; }
        .g02tv-thumb img {
          width: 100%; height: 100%; object-fit: cover; display: block;
          transition: transform 0.6s ease;
        }
        .g02tv-wrap:hover .g02tv-thumb img { transform: scale(1.04); }
        .g02tv-play {
          position: absolute; inset: 0;
          display: flex; align-items: center; justify-content: center;
          background: rgba(26,42,10,0.35);
          transition: background 0.3s;
        }
        .g02tv-wrap:hover .g02tv-play { background: rgba(26,42,10,0.50); }
        .g02tv-play-btn {
          width: 78px; height: 78px; background: ${PRIMARY};
          border-radius: 50%; display: flex; align-items: center; justify-content: center;
          box-shadow: 0 6px 24px rgba(149,193,31,0.40);
          transition: transform 0.35s cubic-bezier(.22,.68,0,1.1), box-shadow 0.35s ease;
        }
        .g02tv-wrap:hover .g02tv-play-btn {
          transform: scale(1.12);
          box-shadow: 0 10px 32px rgba(149,193,31,0.55);
        }
        .g02tv-badge {
          position: absolute; top: 1rem; left: 1rem; z-index: 2;
          background: rgba(255,255,255,0.92); backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          padding: 0.4rem 0.9rem; border-radius: 8px;
          font-size: 0.7rem; font-weight: 700; color: ${DARK};
          letter-spacing: 0.06em; text-transform: uppercase;
          box-shadow: 0 2px 8px rgba(0,0,0,0.08);
        }
        @media (max-width: 640px) {
          .g02tv-section { padding: 64px 0; }
          .g02tv-play-btn { width: 60px; height: 60px; }
        }
      `}</style>
      <section className="g02tv-section" data-template="garden-02" id="tv">
        <div className="g02tv-inner">
          <div className="g02tv-eyebrow">
            <span className="g02tv-eyebrow-line" aria-hidden="true" />
            <GenericEditableText sectionId={sectionId} field="eyebrow" value={eyebrow} tag="span" />
            <span className="g02tv-eyebrow-line" aria-hidden="true" />
          </div>
          <h2 className="g02tv-h2"><GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" /></h2>
          {subtitle && <p className="g02tv-sub"><GenericEditableText sectionId={sectionId} field="subtitle" value={subtitle} tag="span" /></p>}
          {videoUrl && (
            <div className="g02tv-wrap" onClick={() => !playing && setPlaying(true)}>
              <span className="g02tv-badge">
                <GenericEditableText sectionId={sectionId} field="videoTitle" value={videoTitle} tag="span" />
              </span>
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
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="white" aria-hidden="true"><polygon points="6,3 20,12 6,21" /></svg>
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
  const eyebrow  = String((content as Record<string,unknown>).eyebrow  ?? "Média o nás");
  const title    = String((content as Record<string,unknown>).title    ?? "Píší a mluví o naší práci");
  const subtitle = String((content as Record<string,unknown>).subtitle ?? "EdenPro se objevil v tuzemských médiích — podívejte se sami.");
  const items = ((content.items as Array<{
    badge?: string; badgeColor?: string;
    thumbnailUrl?: string; thumbnailAlt?: string;
    videoUrl?: string; videoTitle?: string;
  }>) ?? []).slice(0, 4);

  const [active, setActive] = useState<number | null>(null);

  const PRIMARY = "#95c11f";
  const DARK    = "#1a2a0a";
  const FONT    = "'Inter', Arial, sans-serif";

  return (
    <>
      <style>{`
        .g02med-section {
          background: linear-gradient(170deg, ${DARK} 0%, #0d1605 100%);
          padding: 100px 0; font-family: ${FONT};
          position: relative; overflow: hidden;
        }
        .g02med-section::before {
          content: ""; position: absolute; bottom: -80px; left: -60px;
          width: 240px; height: 240px; border-radius: 50%;
          background: radial-gradient(circle, rgba(149,193,31,0.06) 0%, transparent 70%);
          pointer-events: none;
        }
        .g02med-inner { max-width: 1120px; margin: 0 auto; padding: 0 1.5rem; position: relative; z-index: 1; }
        .g02med-head { text-align: center; margin-bottom: 3rem; }
        .g02med-eyebrow {
          display: inline-flex; align-items: center; gap: 0.6rem;
          font-size: 0.7rem; font-weight: 600;
          letter-spacing: 0.16em; text-transform: uppercase;
          color: ${PRIMARY}; margin-bottom: 1rem;
        }
        .g02med-eyebrow-line {
          width: 32px; height: 1.5px; background: ${PRIMARY}; opacity: 0.5;
        }
        .g02med-h2 {
          font-size: clamp(1.6rem, 3.5vw, 2.4rem); font-weight: 800;
          color: #fff; margin: 0 0 0.8rem; line-height: 1.15;
          letter-spacing: -0.02em;
        }
        .g02med-sub {
          font-size: 1rem; color: rgba(255,255,255,0.55);
          max-width: 580px; margin: 0 auto; line-height: 1.7;
        }
        .g02med-grid {
          display: grid; gap: 1.5rem;
          grid-template-columns: repeat(auto-fit, minmax(min(440px,100%), 1fr));
        }
        .g02med-card {
          position: relative; border-radius: 16px; overflow: hidden;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(149,193,31,0.10);
          cursor: pointer;
          transition: border-color 0.35s ease, box-shadow 0.35s ease, transform 0.35s ease;
        }
        .g02med-card:hover {
          border-color: rgba(149,193,31,0.30);
          box-shadow: 0 12px 40px rgba(0,0,0,0.30);
          transform: translateY(-4px);
        }
        .g02med-thumb {
          position: relative; padding-bottom: 56.25%; background: #0a0f04;
        }
        .g02med-thumb img {
          position: absolute; inset: 0; width: 100%; height: 100%;
          object-fit: cover; display: block;
          transition: transform 0.6s ease, filter 0.6s ease;
          filter: brightness(0.85);
        }
        .g02med-card:hover .g02med-thumb img {
          transform: scale(1.05); filter: brightness(1);
        }
        .g02med-play {
          position: absolute; inset: 0;
          display: flex; align-items: center; justify-content: center;
          background: rgba(26,42,10,0.35);
          transition: background 0.3s;
        }
        .g02med-card:hover .g02med-play { background: rgba(26,42,10,0.50); }
        .g02med-play-btn {
          width: 68px; height: 68px; background: ${PRIMARY};
          border-radius: 50%; display: flex; align-items: center; justify-content: center;
          box-shadow: 0 6px 20px rgba(149,193,31,0.35);
          transition: transform 0.35s cubic-bezier(.22,.68,0,1.1), box-shadow 0.35s ease;
        }
        .g02med-card:hover .g02med-play-btn {
          transform: scale(1.12);
          box-shadow: 0 8px 28px rgba(149,193,31,0.50);
        }
        .g02med-badge {
          position: absolute; top: 0.8rem; left: 0.8rem; z-index: 2;
          font-size: 0.65rem; font-weight: 700;
          letter-spacing: 0.08em; text-transform: uppercase;
          color: #fff; padding: 0.35rem 0.75rem; border-radius: 8px;
          backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px);
          background: rgba(0,0,0,0.45);
          border: 1px solid rgba(255,255,255,0.1);
        }
        .g02med-iframe {
          position: absolute; inset: 0; width: 100%; height: 100%; border: none;
        }
        @media (max-width: 640px) {
          .g02med-section { padding: 64px 0; }
          .g02med-play-btn { width: 56px; height: 56px; }
        }
      `}</style>
      <section className="g02med-section" data-template="garden-02" id="media">
        <div className="g02med-inner">
          <div className="g02med-head">
            <div className="g02med-eyebrow">
              <span className="g02med-eyebrow-line" aria-hidden="true" />
              <GenericEditableText sectionId={sectionId} field="eyebrow" value={eyebrow} tag="span" />
              <span className="g02med-eyebrow-line" aria-hidden="true" />
            </div>
            <h2 className="g02med-h2"><GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" /></h2>
            {subtitle.trim() && <p className="g02med-sub"><GenericEditableText sectionId={sectionId} field="subtitle" value={subtitle} tag="span" /></p>}
          </div>
          <div className="g02med-grid">
            {items.map((item, i) => (
              <div key={i} className="g02med-card" onClick={() => setActive(active === i ? null : i)}>
                <div className="g02med-thumb">
                  {active === i && item.videoUrl ? (
                    <iframe className="g02med-iframe" src={`${item.videoUrl}${item.videoUrl.includes("?") ? "&" : "?"}autoplay=1`} title={item.videoTitle ?? ""} allow="autoplay; fullscreen" allowFullScreen />
                  ) : (
                    <>
                      {item.thumbnailUrl && (
                        <GenericEditableImage sectionId={sectionId} field={`items.${i}.thumbnailUrl`} src={item.thumbnailUrl} alt={item.thumbnailAlt ?? ""} style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
                          <img src={item.thumbnailUrl} alt={item.thumbnailAlt ?? ""} loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                        </GenericEditableImage>
                      )}
                      <div className="g02med-play">
                        <div className="g02med-play-btn">
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="white" aria-hidden="true"><polygon points="6,3 20,12 6,21" /></svg>
                        </div>
                      </div>
                      {item.badge && (
                        <span className="g02med-badge">
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
function PromoHotel01Gastro({ content, sectionId, tenantSlug, isAdmin }: { content: Record<string, unknown>; sectionId: number; tenantSlug?: string; isAdmin: boolean }) {
  const c              = (content ?? {}) as Record<string, any>;
  const showHeader     = c.showHeader !== false;
  const eyebrow        = c.eyebrow        ?? "Gastronomie · À la carte";
  const title          = c.title          ?? "Bistro Aurora";
  const titleAccent    = c.titleAccent    ?? "Aurora";
  const tagline        = c.tagline        ?? "Sezónní kuchyně jižní Moravy";
  const body           = c.body           ?? "";
  const chefName       = c.chefName       ?? "Jan Novák";
  const chefTitle      = c.chefTitle      ?? "Executive chef · 15 let s Michelin";
  const openingLabel   = c.openingLabel   ?? "Otevřeno denně";
  const openingHours   = c.openingHours   ?? "7:00 – 23:00";
  const featureLabel1  = c.featureLabel1  ?? "Snídaně";
  const featureLabel2  = c.featureLabel2  ?? "À la carte";
  const featureLabel3  = c.featureLabel3  ?? "Vinný sklep";
  const featureHours1  = c.featureHours1  ?? "7:00 – 10:30";
  const featureHours2  = c.featureHours2  ?? "12:00 – 22:30";
  const featureHours3  = c.featureHours3  ?? "16:00 – 24:00";
  const cta1Text       = c.cta1Text       ?? "Zobrazit menu";
  const cta1Href       = c.cta1Href       ?? "/gastro";
  const cta2Text       = c.cta2Text       ?? "Rezervovat stůl";
  const cta2Href       = c.cta2Href       ?? "/kontakt";
  const backgroundImage = c.backgroundImage ?? "";

  const href = (h: string) => resolveDemoHref(h ?? "#", tenantSlug, isAdmin);

  const renderTitle = () => {
    if (!titleAccent || !title.includes(titleAccent)) {
      return <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />;
    }
    const parts = title.split(titleAccent);
    return (
      <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span">
        <>{parts[0]}<em className="h01gastro-accent">{titleAccent}</em>{parts.slice(1).join(titleAccent)}</>
      </GenericEditableText>
    );
  };

  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;1,400;1,500;1,600&family=Poppins:wght@300;400;500&display=swap" />
      <style>{`
        .h01gastro {
          position: relative; overflow: hidden;
          min-height: 640px;
          display: flex; align-items: center;
          font-family: 'Poppins', sans-serif;
        }
        .h01gastro-bg {
          position: absolute; inset: 0;
          background-size: cover; background-position: center;
          transform: scale(1.06); transition: transform 12s linear;
          filter: sepia(.06) contrast(1.02) saturate(1.05);
        }
        .h01gastro:hover .h01gastro-bg { transform: scale(1); }
        .h01gastro-overlay {
          position: absolute; inset: 0; z-index: 1;
          background:
            linear-gradient(105deg, rgba(20,17,14,0.94) 0%, rgba(20,17,14,0.82) 42%, rgba(20,17,14,0.35) 78%, rgba(20,17,14,0.15) 100%),
            radial-gradient(ellipse 60% 100% at 15% 50%, rgba(169,135,99,.14), transparent 60%);
          pointer-events: none;
        }
        .h01gastro-hairline {
          position: absolute; top: 32px; bottom: 32px; left: 40px; z-index: 2;
          width: 1px; background: linear-gradient(180deg, transparent, rgba(169,135,99,.35) 20%, rgba(169,135,99,.4) 80%, transparent);
          pointer-events: none;
        }
        .h01gastro-frame-tl, .h01gastro-frame-tr, .h01gastro-frame-bl, .h01gastro-frame-br {
          position: absolute; width: 42px; height: 42px; z-index: 2;
          color: rgba(169,135,99,.6); pointer-events: none;
        }
        .h01gastro-frame-tl { top: 28px; left: 28px; }
        .h01gastro-frame-tr { top: 28px; right: 28px; transform: scaleX(-1); }
        .h01gastro-frame-bl { bottom: 28px; left: 28px; transform: scaleY(-1); }
        .h01gastro-frame-br { bottom: 28px; right: 28px; transform: scale(-1,-1); }

        .h01gastro-inner {
          position: relative; z-index: 3;
          max-width: 1240px; margin: 0 auto; width: 100%;
          padding: clamp(80px,10vw,140px) clamp(24px,5vw,80px);
        }
        .h01gastro-content {
          max-width: 640px;
        }

        .h01gastro-eyebrow {
          font-family: 'Playfair Display', Georgia, serif;
          font-style: italic; font-weight: 400;
          font-size: 13px; letter-spacing: 0.28em; text-transform: uppercase;
          color: #d4b088; margin: 0 0 26px;
          display: inline-flex; align-items: center; gap: 18px;
        }
        .h01gastro-eyebrow::before {
          content: ''; display: inline-block; width: 40px; height: 1px; background: #a98763;
        }

        .h01gastro-title {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: clamp(40px, 5.5vw, 78px); font-weight: 400;
          color: #fff; margin: 0 0 12px; line-height: 1.05;
          letter-spacing: 0.005em;
        }
        .h01gastro-accent {
          font-style: italic; font-weight: 500; color: #d4b088;
        }
        .h01gastro-tagline {
          font-family: 'Playfair Display', Georgia, serif;
          font-style: italic; font-weight: 400;
          font-size: clamp(15px, 1.6vw, 20px);
          color: rgba(255,255,255,.72); margin: 0 0 28px;
          letter-spacing: 0.02em;
        }
        .h01gastro-rule {
          width: 60px; height: 1px; background: #a98763; margin: 0 0 30px;
        }
        .h01gastro-body {
          font-size: 15.5px; line-height: 1.9; color: rgba(255,255,255,0.82);
          font-weight: 300; margin: 0 0 40px; max-width: 560px;
        }

        .h01gastro-chef {
          display: flex; align-items: center; gap: 16px; margin: 0 0 36px;
          padding-bottom: 30px; border-bottom: 1px solid rgba(169,135,99,.28);
        }
        .h01gastro-chef-mark {
          width: 46px; height: 46px; border-radius: 50%;
          background: rgba(212,176,136,.12); border: 1px solid rgba(212,176,136,.4);
          display: inline-flex; align-items: center; justify-content: center;
          font-family: 'Playfair Display', Georgia, serif;
          font-style: italic; font-weight: 500; font-size: 20px;
          color: #d4b088; flex-shrink: 0;
        }
        .h01gastro-chef-info {
          display: flex; flex-direction: column; gap: 3px;
        }
        .h01gastro-chef-name {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: 16px; color: #fff; font-weight: 400;
          letter-spacing: 0.02em;
        }
        .h01gastro-chef-title {
          font-family: 'Poppins', sans-serif; font-weight: 300;
          font-size: 11px; letter-spacing: 0.18em; text-transform: uppercase;
          color: rgba(212,176,136,.75);
        }

        .h01gastro-features {
          display: grid; grid-template-columns: repeat(3, 1fr);
          gap: 24px; margin: 0 0 40px;
        }
        .h01gastro-feat { position: relative; padding-left: 16px; }
        .h01gastro-feat::before {
          content: ''; position: absolute; left: 0; top: 4px; bottom: 4px;
          width: 1px; background: rgba(169,135,99,.4);
        }
        .h01gastro-feat-lbl {
          font-family: 'Playfair Display', Georgia, serif;
          font-style: italic; font-size: 12px; letter-spacing: 0.24em;
          text-transform: uppercase; color: #d4b088; margin: 0 0 6px;
          font-weight: 400;
        }
        .h01gastro-feat-val {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: 17px; color: #fff; font-weight: 400;
          letter-spacing: 0.02em;
        }

        .h01gastro-ctas {
          display: flex; gap: 14px; flex-wrap: wrap;
        }
        .h01gastro-cta1, .h01gastro-cta2 {
          position: relative; overflow: hidden;
          display: inline-flex; align-items: center; gap: 10px;
          font-family: 'Playfair Display', Georgia, serif;
          font-size: 12px; letter-spacing: 0.22em; text-transform: uppercase;
          padding: 15px 34px; text-decoration: none;
          transition: color .35s, border-color .35s;
        }
        .h01gastro-cta1 { background: transparent; color: #fff; border: 1px solid rgba(255,255,255,.5); }
        .h01gastro-cta1::before {
          content: ''; position: absolute; inset: 0;
          background: linear-gradient(135deg,#a98763 0%,#c4a274 100%);
          transform: translateY(101%); transition: transform .55s cubic-bezier(.22,.68,0,1.1);
          z-index: 0;
        }
        .h01gastro-cta1:hover { border-color: #c4a274; }
        .h01gastro-cta1:hover::before { transform: translateY(0); }
        .h01gastro-cta1 > * { position: relative; z-index: 1; }

        .h01gastro-cta2 {
          background: transparent; color: #fff; border: 1px solid #a98763;
          background: rgba(169,135,99,.08);
        }
        .h01gastro-cta2::before {
          content: ''; position: absolute; inset: 0;
          background: #fff; transform: translateY(101%);
          transition: transform .55s cubic-bezier(.22,.68,0,1.1); z-index: 0;
        }
        .h01gastro-cta2:hover { color: #1a1714; border-color: #fff; }
        .h01gastro-cta2:hover::before { transform: translateY(0); }
        .h01gastro-cta2 > * { position: relative; z-index: 1; }
        .h01gastro-cta1 .arrow, .h01gastro-cta2 .arrow {
          transition: transform .35s cubic-bezier(.22,.68,0,1.1);
        }
        .h01gastro-cta1:hover .arrow, .h01gastro-cta2:hover .arrow { transform: translateX(6px); }

        .h01gastro-vertical {
          position: absolute; right: 60px; top: 50%; transform: translateY(-50%) rotate(-90deg);
          transform-origin: center; z-index: 3;
          font-family: 'Playfair Display', Georgia, serif;
          font-style: italic; font-size: 13px; letter-spacing: 0.36em;
          color: rgba(212,176,136,.55); text-transform: uppercase;
          white-space: nowrap;
          display: flex; align-items: center; gap: 20px;
        }
        .h01gastro-vertical::before, .h01gastro-vertical::after {
          content: ''; display: inline-block; width: 40px; height: 1px; background: rgba(212,176,136,.4);
        }

        @media (max-width: 900px) {
          .h01gastro-vertical { display: none; }
          .h01gastro-features { grid-template-columns: 1fr; gap: 14px; }
          .h01gastro-feat { padding-left: 14px; }
          .h01gastro-hairline { display: none; }
          .h01gastro-frame-tl, .h01gastro-frame-tr, .h01gastro-frame-bl, .h01gastro-frame-br { display: none; }
        }
        @media (max-width: 640px) {
          .h01gastro-overlay { background: linear-gradient(180deg, rgba(20,17,14,.9) 0%, rgba(20,17,14,.8) 100%); }
          .h01gastro-inner { padding: 100px 22px 100px; }
          .h01gastro-title { font-size: clamp(34px,10vw,50px); }
          .h01gastro-cta1, .h01gastro-cta2 { padding: 14px 24px; font-size: 11px; letter-spacing: 0.18em; }
        }
      `}</style>

      <section className="h01gastro" id="gastro" data-template="hotel-01-gastro">
        <GenericEditableImage sectionId={sectionId} field="backgroundImage" src={backgroundImage || "/placeholder.jpg"} alt="" style={{ position: "absolute", inset: 0 }}>
          <div className="h01gastro-bg" style={{ backgroundImage: `url('${backgroundImage || "/placeholder.jpg"}')` }} aria-hidden="true" />
        </GenericEditableImage>
        <div className="h01gastro-overlay" aria-hidden="true" />

        <div className="h01gastro-hairline" aria-hidden="true" />
        <svg className="h01gastro-frame-tl" viewBox="0 0 42 42" fill="none" aria-hidden="true">
          <path d="M2 18 L2 2 L18 2" stroke="currentColor" strokeWidth="1"/>
          <path d="M6 12 L6 6 L12 6" stroke="currentColor" strokeWidth="0.6" opacity="0.6"/>
        </svg>
        <svg className="h01gastro-frame-tr" viewBox="0 0 42 42" fill="none" aria-hidden="true">
          <path d="M2 18 L2 2 L18 2" stroke="currentColor" strokeWidth="1"/>
          <path d="M6 12 L6 6 L12 6" stroke="currentColor" strokeWidth="0.6" opacity="0.6"/>
        </svg>
        <svg className="h01gastro-frame-bl" viewBox="0 0 42 42" fill="none" aria-hidden="true">
          <path d="M2 18 L2 2 L18 2" stroke="currentColor" strokeWidth="1"/>
          <path d="M6 12 L6 6 L12 6" stroke="currentColor" strokeWidth="0.6" opacity="0.6"/>
        </svg>
        <svg className="h01gastro-frame-br" viewBox="0 0 42 42" fill="none" aria-hidden="true">
          <path d="M2 18 L2 2 L18 2" stroke="currentColor" strokeWidth="1"/>
          <path d="M6 12 L6 6 L12 6" stroke="currentColor" strokeWidth="0.6" opacity="0.6"/>
        </svg>

        <div className="h01gastro-vertical" aria-hidden="true">
          <GenericEditableText sectionId={sectionId} field="openingLabel" value={openingLabel} tag="span" /> · <GenericEditableText sectionId={sectionId} field="openingHours" value={openingHours} tag="span" />
        </div>

        <div className="h01gastro-inner">
          <div className="h01gastro-content">
            {showHeader && (
              <div className="h01gastro-eyebrow">
                <GenericEditableText sectionId={sectionId} field="eyebrow" value={eyebrow} tag="span" />
              </div>
            )}
            <h2 className="h01gastro-title">{renderTitle()}</h2>
            <div className="h01gastro-tagline">
              <GenericEditableText sectionId={sectionId} field="tagline" value={tagline} tag="span" />
            </div>
            <div className="h01gastro-rule" aria-hidden="true" />
            <p className="h01gastro-body">
              <GenericEditableText sectionId={sectionId} field="body" value={body} tag="span" />
            </p>

            <div className="h01gastro-chef">
              <div className="h01gastro-chef-mark" aria-hidden="true">{chefName.split(" ").map((w: string) => w[0]).join("")}</div>
              <div className="h01gastro-chef-info">
                <span className="h01gastro-chef-name">
                  <GenericEditableText sectionId={sectionId} field="chefName" value={chefName} tag="span" />
                </span>
                <span className="h01gastro-chef-title">
                  <GenericEditableText sectionId={sectionId} field="chefTitle" value={chefTitle} tag="span" />
                </span>
              </div>
            </div>

            <div className="h01gastro-features">
              <div className="h01gastro-feat">
                <div className="h01gastro-feat-lbl">
                  <GenericEditableText sectionId={sectionId} field="featureLabel1" value={featureLabel1} tag="span" />
                </div>
                <div className="h01gastro-feat-val">
                  <GenericEditableText sectionId={sectionId} field="featureHours1" value={featureHours1} tag="span" />
                </div>
              </div>
              <div className="h01gastro-feat">
                <div className="h01gastro-feat-lbl">
                  <GenericEditableText sectionId={sectionId} field="featureLabel2" value={featureLabel2} tag="span" />
                </div>
                <div className="h01gastro-feat-val">
                  <GenericEditableText sectionId={sectionId} field="featureHours2" value={featureHours2} tag="span" />
                </div>
              </div>
              <div className="h01gastro-feat">
                <div className="h01gastro-feat-lbl">
                  <GenericEditableText sectionId={sectionId} field="featureLabel3" value={featureLabel3} tag="span" />
                </div>
                <div className="h01gastro-feat-val">
                  <GenericEditableText sectionId={sectionId} field="featureHours3" value={featureHours3} tag="span" />
                </div>
              </div>
            </div>

            <div className="h01gastro-ctas">
              <a href={href(cta1Href)} className="h01gastro-cta1">
                <GenericEditableText sectionId={sectionId} field="cta1Text" value={cta1Text} tag="span" />
              </a>
              <a href={href(cta2Href)} className="h01gastro-cta2">
                <GenericEditableText sectionId={sectionId} field="cta2Text" value={cta2Text} tag="span" />
                <span className="arrow" aria-hidden="true">→</span>
              </a>
            </div>
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
  const ORANGE  = "var(--color-primary, #ff914d)";
  const DARK    = "var(--color-text, #232323)";
  const POPPINS = "var(--font-body, 'Rubik', sans-serif)";

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
      <section style={{ background: "#ffffff", padding: "80px 0", borderTop: "1px solid var(--color-border, #e4e4e4)" }} data-template="malir-02">
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
              <p style={{ fontFamily: POPPINS, fontSize: 15, color: "var(--color-text-muted, #828282)", margin: 0 }}>
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
  const showHeader = c.showHeader !== false;
  const eyebrow = c.eyebrow ?? "Dárky, na které se nezapomíná";
  const title   = c.title   ?? "Obdarujte blízké pobytem plným zážitků";
  const subtitle = c.subtitle ?? "Vyberte si z pečlivě sestavených balíčků nebo obdarujte poukazem — pobyt v našem hotelu potěší v každém věku.";
  const detailLabel = c.detailLabel ?? "Detail balíčku";
  const bookLabel = c.bookLabel ?? "Rezervovat";
  const items: { name: string; validity: string; image: string; detailHref: string; bookHref: string; price?: string; nights?: string; includes?: string[] }[] = Array.isArray(c.items) ? c.items : [];

  const resolve = (href: string) => (isAdmin ? "#" : href ?? "#");

  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400;1,500&family=Montserrat:wght@300;400;500;600&display=swap" />
      <style>{`        .h02pkg {
          position: relative;
          background: #0f1622;
          padding: clamp(90px,10vw,140px) clamp(20px,5vw,80px);
          font-family: 'Montserrat', sans-serif;
          overflow: hidden;
          color: #fff;
        }
        .h02pkg::before {
          content: ""; position: absolute; top: 0; left: 0; right: 0; height: 1px;
          background: linear-gradient(to right, transparent, rgba(150,161,172,0.35), transparent);
        }
        .h02pkg::after {
          content: ""; position: absolute; inset: 0;
          background: radial-gradient(ellipse at 20% 10%, rgba(91,122,142,0.14), transparent 55%),
                      radial-gradient(ellipse at 80% 90%, rgba(91,122,142,0.10), transparent 55%);
          pointer-events: none;
        }
        .h02pkg-inner { position: relative; z-index: 1; max-width: 1240px; margin: 0 auto; }
        .h02pkg-header {
          text-align: center; max-width: 720px; margin: 0 auto clamp(56px,7vw,84px);
        }
        .h02pkg-ornament {
          font-family: 'Cormorant Garamond', Georgia, serif;
          font-style: italic; font-size: 56px; line-height: 1;
          color: rgba(150,161,172,0.5); margin: 0 0 22px; display: block;
        }
        .h02pkg-eyebrow {
          display: inline-flex; align-items: center; gap: 16px;
          font-size: 10px; font-weight: 600; letter-spacing: 0.32em;
          text-transform: uppercase; color: #96A1AC; margin: 0 0 20px;
        }
        .h02pkg-eyebrow::before,
        .h02pkg-eyebrow::after {
          content: ""; width: 34px; height: 1px; background: #96A1AC;
        }
        .h02pkg-title {
          font-family: 'Cormorant Garamond', Georgia, serif;
          font-size: clamp(30px,3.4vw,50px); font-weight: 400; font-style: italic;
          color: #fff; line-height: 1.12; letter-spacing: -0.005em;
          margin: 0 0 20px;
        }
        .h02pkg-subtitle {
          font-size: 15px; color: rgba(255,255,255,0.7); font-weight: 400;
          max-width: 620px; margin: 0 auto; line-height: 1.8;
        }
        .h02pkg-grid {
          display: grid; grid-template-columns: repeat(auto-fit, minmax(340px, 1fr));
          gap: 32px;
        }
        .h02pkg-card {
          position: relative;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(150,161,172,0.20);
          display: flex; flex-direction: column;
          transition: transform 0.5s cubic-bezier(.22,.68,0,1), border-color 0.4s, background 0.4s;
          overflow: hidden;
        }
        .h02pkg-card::before,
        .h02pkg-card::after {
          content: ""; position: absolute; width: 16px; height: 16px;
          border-color: #96A1AC; border-style: solid; border-width: 0;
          z-index: 2;
          opacity: 0.55; transition: opacity 0.4s, width 0.4s, height 0.4s;
        }
        .h02pkg-card::before {
          top: -1px; left: -1px; border-top-width: 1px; border-left-width: 1px;
        }
        .h02pkg-card::after {
          bottom: -1px; right: -1px; border-bottom-width: 1px; border-right-width: 1px;
        }
        .h02pkg-card:hover {
          transform: translateY(-6px);
          border-color: rgba(150,161,172,0.45);
          background: rgba(255,255,255,0.05);
        }
        .h02pkg-card:hover::before,
        .h02pkg-card:hover::after {
          opacity: 1; width: 26px; height: 26px;
        }

        .h02pkg-img-wrap {
          position: relative; overflow: hidden; aspect-ratio: 16/11;
        }
        .h02pkg-img {
          width: 100%; height: 100%; object-fit: cover; display: block;
          transition: transform 0.9s cubic-bezier(.4,0,.2,1);
          filter: saturate(0.95);
        }
        .h02pkg-card:hover .h02pkg-img { transform: scale(1.08); filter: saturate(1.05); }
        .h02pkg-img-gradient {
          position: absolute; inset: 0;
          background: linear-gradient(to top, rgba(15,22,34,0.65), transparent 60%);
          pointer-events: none;
        }
        .h02pkg-price-tag {
          position: absolute; top: 22px; right: 22px;
          padding: 10px 16px 8px;
          background: rgba(15,22,34,0.82);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          border: 1px solid rgba(150,161,172,0.35);
          display: flex; flex-direction: column; align-items: flex-end; line-height: 1;
        }
        .h02pkg-price-label {
          font-size: 8px; font-weight: 600; letter-spacing: 0.28em; text-transform: uppercase;
          color: #96A1AC; margin-bottom: 4px;
        }
        .h02pkg-price {
          font-family: 'Cormorant Garamond', Georgia, serif;
          font-style: italic; font-weight: 500; font-size: 22px; color: #fff;
        }

        .h02pkg-body { padding: 32px 32px 34px; flex: 1; display: flex; flex-direction: column; }
        .h02pkg-meta {
          display: inline-flex; gap: 14px; align-items: center;
          font-size: 9px; font-weight: 600; letter-spacing: 0.24em;
          text-transform: uppercase; color: #96A1AC; margin: 0 0 16px;
        }
        .h02pkg-meta .dot { width: 3px; height: 3px; background: #5B7A8E; border-radius: 999px; }
        .h02pkg-name {
          font-family: 'Cormorant Garamond', Georgia, serif;
          font-size: clamp(22px,2.2vw,30px); font-weight: 500; font-style: italic;
          color: #fff; line-height: 1.2; letter-spacing: -0.005em;
          margin: 0 0 22px;
        }
        .h02pkg-includes {
          list-style: none; padding: 0; margin: 0 0 28px; flex: 1;
        }
        .h02pkg-includes li {
          font-family: 'Montserrat', sans-serif;
          font-size: 13px; color: rgba(255,255,255,0.78); font-weight: 400;
          padding: 10px 0; display: inline-flex; align-items: center; gap: 12px;
          border-bottom: 1px solid rgba(150,161,172,0.15);
          width: 100%;
        }
        .h02pkg-includes li:last-child { border-bottom: none; }
        .h02pkg-includes li svg {
          width: 14px; height: 14px; color: #96A1AC; flex-shrink: 0;
        }
        .h02pkg-ctas { display: flex; gap: 14px; flex-wrap: wrap; align-items: center; }
        .h02pkg-detail {
          position: relative;
          display: inline-flex; align-items: center; gap: 8px;
          color: rgba(255,255,255,0.9); background: transparent; border: none;
          font-family: 'Montserrat', sans-serif;
          font-size: 11px; font-weight: 600; letter-spacing: 0.22em; text-transform: uppercase;
          padding: 12px 0; text-decoration: none;
        }
        .h02pkg-detail::after {
          content: ""; position: absolute; left: 0; right: 0; bottom: 8px;
          height: 1px; background: currentColor; transform-origin: right;
          transition: transform 0.4s cubic-bezier(.22,.68,0,1);
        }
        .h02pkg-detail:hover::after { transform-origin: left; transform: scaleX(1.12); }
        .h02pkg-detail-arrow { transition: transform 0.4s cubic-bezier(.22,.68,0,1); }
        .h02pkg-detail:hover .h02pkg-detail-arrow { transform: translateX(3px); }

        .h02pkg-book {
          position: relative; overflow: hidden; isolation: isolate;
          display: inline-flex; align-items: center; gap: 10px;
          background: #96A1AC; color: #0f1622; border: 1px solid #96A1AC;
          font-family: 'Montserrat', sans-serif;
          font-size: 11px; font-weight: 600; letter-spacing: 0.22em; text-transform: uppercase;
          padding: 14px 26px; text-decoration: none;
          transition: color 0.35s, border-color 0.35s;
        }
        .h02pkg-book::before {
          content: ""; position: absolute; inset: 0; z-index: -1;
          background: #fff; transform: translateY(101%);
          transition: transform 0.5s cubic-bezier(.22,.68,0,1);
        }
        .h02pkg-book:hover::before { transform: translateY(0); }
        .h02pkg-book:hover { color: #0f1622; border-color: #fff; }
        .h02pkg-book-arrow { transition: transform 0.4s cubic-bezier(.22,.68,0,1); }
        .h02pkg-book:hover .h02pkg-book-arrow { transform: translate(3px,-3px); }

        @media (max-width: 700px) {
          .h02pkg-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <section className="h02pkg" id="balicky" data-template="hotel-02-packages">
        <div className="h02pkg-inner">
          {showHeader && (
            <div className="h02pkg-header">
              <span className="h02pkg-ornament" aria-hidden="true">&</span>
              <span className="h02pkg-eyebrow">
                <GenericEditableText sectionId={sectionId} field="eyebrow" value={eyebrow} tag="span" />
              </span>
              <h2 className="h02pkg-title">
                <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
              </h2>
              {subtitle && (
                <p className="h02pkg-subtitle">
                  <GenericEditableText sectionId={sectionId} field="subtitle" value={subtitle} tag="span" />
                </p>
              )}
            </div>
          )}

          <div className="h02pkg-grid">
            {items.map((item, i) => {
              const includes = Array.isArray(item.includes) ? item.includes : [];
              return (
                <div key={i} className="h02pkg-card">
                  <div className="h02pkg-img-wrap">
                    <GenericEditableImage sectionId={sectionId} field={`items.${i}.image`} src={item.image || "/placeholder.jpg"} alt={item.name} style={{ width: "100%", height: "100%" }}>
                      <img src={item.image || "/placeholder.jpg"} alt={item.name} className="h02pkg-img" loading="lazy" />
                    </GenericEditableImage>
                    <div className="h02pkg-img-gradient" aria-hidden="true" />
                    {item.price && (
                      <div className="h02pkg-price-tag">
                        <span className="h02pkg-price-label">od</span>
                        <span className="h02pkg-price">
                          <GenericEditableText sectionId={sectionId} field={`items.${i}.price`} value={item.price} tag="span" />
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="h02pkg-body">
                    <div className="h02pkg-meta">
                      <span>
                        <GenericEditableText sectionId={sectionId} field={`items.${i}.validity`} value={item.validity} tag="span" />
                      </span>
                      {item.nights && (
                        <>
                          <span className="dot" />
                          <span>
                            <GenericEditableText sectionId={sectionId} field={`items.${i}.nights`} value={item.nights} tag="span" />
                          </span>
                        </>
                      )}
                    </div>
                    <h3 className="h02pkg-name">
                      <GenericEditableText sectionId={sectionId} field={`items.${i}.name`} value={item.name} tag="span" />
                    </h3>
                    {includes.length > 0 && (
                      <ul className="h02pkg-includes">
                        {includes.map((inc, j) => (
                          <li key={j}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>
                            <GenericEditableText sectionId={sectionId} field={`items.${i}.includes.${j}`} value={inc} tag="span" />
                          </li>
                        ))}
                      </ul>
                    )}
                    <div className="h02pkg-ctas">
                      <a href={resolve(item.detailHref)} className="h02pkg-detail">
                        <GenericEditableText sectionId={sectionId} field="detailLabel" value={detailLabel} tag="span" />
                        <svg className="h02pkg-detail-arrow" width="14" height="9" viewBox="0 0 14 9" fill="none"><path d="M1 4.5h12M9 1l4 3.5L9 8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      </a>
                      <a href={resolve(item.bookHref)} className="h02pkg-book">
                        <GenericEditableText sectionId={sectionId} field="bookLabel" value={bookLabel} tag="span" />
                        <svg className="h02pkg-book-arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/></svg>
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}



// ── dj-01-whyus ──────────────────────────────────────────────────────────────
// LUXE REDESIGN (Neon Nocturne — vasdj.cz Awwwards edition):
// - Preserved: light bg + centered header + hairline separator + 7 numbered rows structure
// - Enhanced: warm off-white #f7f5f0 bg, JBM eyebrow '03 / MANIFEST', Space Grotesk H2 kinetic reveal
// - Numbers: Space Grotesk 700 clamp s orange→amber gradient text fill + JBM 'STEP' micro-label above
// - Rows: hover shift to white surface + orange gradient border-left slides in + text lifts + counter shifts left
// - IntersectionObserver stagger preserved
// ──────────────────────────────────────────────────────────────────────────────
function WhyusDj01({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const ORANGE = "#f15a24";
  const AMBER  = "#ff8347";
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

  const eyebrow = String(content.eyebrow ?? "03 / MANIFEST");
  const heading = String(content.heading ?? "Proč Nokturn");
  const items   = (content.items ?? []) as string[];

  return (
    <>
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=JetBrains+Mono:wght@400;500&family=Inter+Tight:wght@300;400&display=swap" />
      <style>{`
        @keyframes dj01why-fade-down { from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes dj01why-slide-in  { from { opacity: 0; transform: translateX(-32px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes dj01why-num-pop {
          0%   { transform: scale(0.55); opacity: 0; letter-spacing: 0.1em; }
          60%  { transform: scale(1.06); opacity: 1; letter-spacing: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        .dj01why {
          position: relative;
          background: #f7f5f0;
          padding: 6rem 1.5rem 6.5rem;
          overflow: hidden;
        }
        .dj01why::before, .dj01why::after {
          content: "";
          position: absolute;
          left: 0; right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent 0%, rgba(10,10,12,0.14) 50%, transparent 100%);
        }
        .dj01why::before { top: 0; }
        .dj01why::after  { bottom: 0; }
        .dj01why-inner {
          max-width: 900px;
          margin: 0 auto;
          position: relative;
        }
        .dj01why-header {
          text-align: center;
          margin-bottom: 4rem;
          animation: dj01why-fade-down 0.75s cubic-bezier(.2,.7,.2,1) both;
          animation-play-state: paused;
        }
        .dj01why-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 0.7rem;
          font-family: 'JetBrains Mono', ui-monospace, monospace;
          font-weight: 500;
          font-size: 0.75rem;
          letter-spacing: 0.34em;
          text-transform: uppercase;
          color: rgba(10,10,12,0.55);
          margin: 0 0 1.5rem;
        }
        .dj01why-eyebrow::before {
          content: "";
          display: inline-block;
          width: 8px; height: 8px;
          background: ${ORANGE};
          box-shadow: 0 0 12px rgba(241,90,36,0.5);
        }
        .dj01why-header h2 {
          font-family: 'Space Grotesk', -apple-system, sans-serif;
          font-size: clamp(1.9rem, 4.2vw, 3.2rem);
          font-weight: 700;
          color: #0a0a0c;
          margin: 0 0 1.25rem;
          letter-spacing: 0.02em;
          text-transform: uppercase;
          line-height: 1.1;
        }
        .dj01why-header-line {
          display: inline-block;
          width: 72px;
          height: 2px;
          background: linear-gradient(90deg, ${ORANGE} 0%, ${AMBER} 100%);
        }
        .dj01why-list {
          list-style: none;
          margin: 0; padding: 0;
        }
        .dj01why-row {
          position: relative;
          display: grid;
          grid-template-columns: minmax(5.5rem, auto) 1fr;
          align-items: flex-start;
          gap: 2rem;
          padding: 1.75rem 1.25rem 1.75rem 1.75rem;
          border-bottom: 1px solid rgba(10,10,12,0.08);
          animation: dj01why-slide-in 0.6s cubic-bezier(.2,.7,.2,1) both;
          animation-play-state: paused;
          transition: background 320ms cubic-bezier(.2,.7,.2,1);
        }
        .dj01why-row:first-child { border-top: 1px solid rgba(10,10,12,0.08); }
        .dj01why-row::before {
          content: "";
          position: absolute;
          left: 0; top: 20%; bottom: 20%;
          width: 2px;
          background: linear-gradient(180deg, ${ORANGE} 0%, ${AMBER} 100%);
          transform: scaleY(0);
          transform-origin: center top;
          transition: transform 420ms cubic-bezier(.2,.7,.2,1);
        }
        .dj01why-row:hover { background: rgba(255,255,255,0.65); }
        .dj01why-row:hover::before { transform: scaleY(1); }
        .dj01why-numcell {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 0.4rem;
          min-width: 4.5rem;
        }
        .dj01why-step {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.62rem;
          font-weight: 500;
          letter-spacing: 0.3em;
          color: rgba(10,10,12,0.45);
          text-transform: uppercase;
          transition: color 260ms cubic-bezier(.2,.7,.2,1);
        }
        .dj01why-num {
          font-family: 'Space Grotesk', sans-serif;
          font-size: clamp(2rem, 4.2vw, 3.25rem);
          font-weight: 700;
          line-height: 0.9;
          background: linear-gradient(180deg, ${AMBER} 0%, ${ORANGE} 100%);
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: dj01why-num-pop 0.6s cubic-bezier(0.34,1.56,0.64,1) both;
          animation-play-state: paused;
          transition: transform 380ms cubic-bezier(.2,.7,.2,1);
        }
        .dj01why-row:hover .dj01why-step { color: ${ORANGE}; }
        .dj01why-row:hover .dj01why-num  { transform: translateX(-3px); }
        .dj01why-text {
          font-family: 'Inter Tight', sans-serif;
          font-size: clamp(0.96rem, 1.15vw, 1.08rem);
          color: rgba(10,10,12,0.72);
          line-height: 1.7;
          padding-top: 0.35rem;
          margin: 0;
          transition: color 300ms cubic-bezier(.2,.7,.2,1), transform 380ms cubic-bezier(.2,.7,.2,1);
        }
        .dj01why-row:hover .dj01why-text {
          color: #0a0a0c;
          transform: translateX(4px);
        }
        @media (max-width: 640px) {
          .dj01why { padding: 4rem 1.15rem 4.5rem; }
          .dj01why-header { margin-bottom: 2.75rem; }
          .dj01why-row {
            grid-template-columns: minmax(3.25rem, auto) 1fr;
            gap: 1.15rem;
            padding: 1.4rem 0.5rem 1.4rem 1rem;
          }
          .dj01why-numcell { min-width: 3.25rem; }
          .dj01why-step { font-size: 0.58rem; letter-spacing: 0.26em; }
        }
        @media (prefers-reduced-motion: reduce) {
          .dj01why-header, .dj01why-row, .dj01why-num { animation: none !important; opacity: 1 !important; transform: none !important; }
        }
      `}</style>

      <section className="dj01why" id="proc-my" data-template="dj-01-whyus" ref={ref}>
        <div className="dj01why-inner">
          <div className="dj01why-header dj01why-animate">
            {eyebrow && (
              <GenericEditableText sectionId={sectionId} field="eyebrow" value={eyebrow} tag="span" className="dj01why-eyebrow">
                {eyebrow}
              </GenericEditableText>
            )}
            {heading && (
              <GenericEditableText sectionId={sectionId} field="heading" value={heading} tag="h2">
                {heading}
              </GenericEditableText>
            )}
            {(eyebrow || heading) && <div><span className="dj01why-header-line" /></div>}
          </div>
          <ol className="dj01why-list">
            {items.map((item, i) => (
              <li key={i} className="dj01why-row dj01why-animate" style={{ animationDelay: `${i * 0.08}s` }}>
                <div className="dj01why-numcell">
                  <span className="dj01why-step">Step</span>
                  <span className="dj01why-num dj01why-animate" style={{ animationDelay: `${i * 0.08 + 0.1}s` }}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </div>
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
// LUXE REDESIGN (Neon Nocturne — vasdj.cz Awwwards edition):
// - Preserved: dark bg + 5×2 logo grid + filter/opacity treatment + orange separator + hover glow
// - Enhanced: midnight #08080b + JBM eyebrow '04 / KLIENTI' + Space Grotesk H2 + orange→amber gradient rule
// - Grid: warm rgba borders + JBM cell counter corner + orange radial glow hover + logo tilts on hover
// - IntersectionObserver stagger preserved
// ──────────────────────────────────────────────────────────────────────────────
function ReferencesDj01({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const ORANGE = "#f15a24";
  const AMBER  = "#ff8347";
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

  const eyebrow = String(content.eyebrow ?? "04 / KLIENTI");
  const heading = String(content.heading ?? "Klienti");
  const items   = (content.items ?? []) as Array<{ name: string; logoUrl: string }>;

  return (
    <>
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" />
      <style>{`
        @keyframes dj01ref-fade-up { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes dj01ref-pop {
          0%   { opacity: 0; transform: scale(0.85) translateY(12px); }
          70%  { transform: scale(1.03) translateY(0); opacity: 1; }
          100% { transform: scale(1) translateY(0); opacity: 1; }
        }
        .dj01ref {
          position: relative;
          background: #08080b;
          padding: 6rem 0 5.5rem;
          overflow: hidden;
          isolation: isolate;
        }
        .dj01ref::before {
          content: "";
          position: absolute;
          left: 50%; bottom: -40%;
          width: 90vw; max-width: 1200px; height: 60vh;
          background: radial-gradient(closest-side, rgba(241,90,36,0.2) 0%, rgba(241,90,36,0.03) 45%, rgba(241,90,36,0) 72%);
          transform: translateX(-50%);
          z-index: 0;
          pointer-events: none;
        }
        .dj01ref-inner {
          position: relative;
          z-index: 1;
          max-width: 1200px;
          margin: 0 auto;
          text-align: center;
          padding: 0 1.5rem;
        }
        .dj01ref-header {
          margin-bottom: 3.75rem;
          animation: dj01ref-fade-up 0.75s cubic-bezier(.2,.7,.2,1) both;
          animation-play-state: paused;
        }
        .dj01ref-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 0.7rem;
          font-family: 'JetBrains Mono', ui-monospace, monospace;
          font-weight: 500;
          font-size: 0.75rem;
          letter-spacing: 0.34em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.6);
          margin: 0 0 1.5rem;
        }
        .dj01ref-eyebrow::before {
          content: "";
          display: inline-block;
          width: 8px; height: 8px;
          background: ${ORANGE};
          box-shadow: 0 0 12px rgba(241,90,36,0.55);
        }
        .dj01ref-header h2 {
          font-family: 'Space Grotesk', -apple-system, sans-serif;
          font-size: clamp(1.9rem, 4.2vw, 3.2rem);
          font-weight: 700;
          color: #fff;
          margin: 0 0 1.25rem;
          letter-spacing: 0.02em;
          line-height: 1.1;
          text-transform: uppercase;
        }
        .dj01ref-accent {
          display: inline-block;
          width: 72px; height: 2px;
          background: linear-gradient(90deg, ${ORANGE} 0%, ${AMBER} 100%);
        }
        .dj01ref-grid {
          position: relative;
          z-index: 1;
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          list-style: none; margin: 0 auto; padding: 0;
          max-width: 1200px;
          border-top: 1px solid rgba(255,255,255,0.08);
          border-left: 1px solid rgba(255,255,255,0.08);
        }
        .dj01ref-item {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 3rem 1.75rem;
          border-right: 1px solid rgba(255,255,255,0.08);
          border-bottom: 1px solid rgba(255,255,255,0.08);
          box-sizing: border-box;
          position: relative;
          overflow: hidden;
          cursor: default;
          animation: dj01ref-pop 0.6s cubic-bezier(0.34,1.56,0.64,1) both;
          animation-play-state: paused;
          transition: background 320ms cubic-bezier(.2,.7,.2,1), border-color 320ms cubic-bezier(.2,.7,.2,1);
        }
        .dj01ref-item::after {
          content: "";
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at center, rgba(241,90,36,0.14) 0%, transparent 68%);
          opacity: 0;
          transition: opacity 380ms cubic-bezier(.2,.7,.2,1);
          pointer-events: none;
        }
        .dj01ref-counter {
          position: absolute;
          top: 0.7rem; left: 0.85rem;
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.58rem;
          font-weight: 500;
          letter-spacing: 0.24em;
          color: rgba(255,255,255,0.28);
          text-transform: uppercase;
          transition: color 260ms cubic-bezier(.2,.7,.2,1);
        }
        .dj01ref-item:hover {
          background: rgba(255,255,255,0.03);
          border-color: rgba(241,90,36,0.35);
        }
        .dj01ref-item:hover::after { opacity: 1; }
        .dj01ref-item:hover .dj01ref-counter { color: ${ORANGE}; }
        .dj01ref-imgwrap {
          position: relative;
          z-index: 1;
          transition: transform 380ms cubic-bezier(.2,.7,.2,1);
        }
        .dj01ref-item:hover .dj01ref-imgwrap { transform: translateY(-2px); }
        .dj01ref-item img {
          display: block;
          height: 48px;
          max-width: 130px;
          width: auto;
          object-fit: contain;
          filter: brightness(0) invert(1) opacity(0.32);
          transition: filter 380ms cubic-bezier(.2,.7,.2,1), transform 380ms cubic-bezier(.2,.7,.2,1);
        }
        .dj01ref-item:hover img {
          filter: brightness(0) invert(1) opacity(0.95);
          transform: scale(1.06);
        }
        @media (max-width: 900px) {
          .dj01ref-grid { grid-template-columns: repeat(4, 1fr); }
        }
        @media (max-width: 640px) {
          .dj01ref { padding: 4rem 0 4rem; }
          .dj01ref-grid { grid-template-columns: repeat(3, 1fr); }
          .dj01ref-item { padding: 2rem 1rem; }
          .dj01ref-item img { height: 38px; max-width: 100px; }
          .dj01ref-counter { font-size: 0.54rem; }
        }
        @media (max-width: 380px) {
          .dj01ref-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (prefers-reduced-motion: reduce) {
          .dj01ref-header, .dj01ref-item { animation: none !important; opacity: 1 !important; transform: none !important; }
        }
      `}</style>

      <section className="dj01ref" id="reference" data-template="dj-01-references" ref={ref}>
        <div className="dj01ref-inner">
          {(eyebrow || heading) && (
            <div className="dj01ref-header dj01ref-animate">
              {eyebrow && (
                <GenericEditableText sectionId={sectionId} field="eyebrow" value={eyebrow} tag="span" className="dj01ref-eyebrow">
                  {eyebrow}
                </GenericEditableText>
              )}
              {heading && (
                <GenericEditableText sectionId={sectionId} field="heading" value={heading} tag="h2">
                  {heading}
                </GenericEditableText>
              )}
              <div><span className="dj01ref-accent" /></div>
            </div>
          )}
        </div>
        <ul className="dj01ref-grid">
          {items.map((item, i) => (
            <li key={i} className="dj01ref-item dj01ref-animate" style={{ animationDelay: `${i * 0.06}s` }}>
              <span className="dj01ref-counter">{String(i + 1).padStart(2, "0")}</span>
              <div className="dj01ref-imgwrap">
                <GenericEditableImage
                  sectionId={sectionId}
                  field={`items.${i}.logoUrl`}
                  src={item.logoUrl}
                  alt={item.name}
                  style={{ position: "relative", display: "block" }}
                >
                  <img src={item.logoUrl} alt={item.name} loading="lazy" title={item.name} />
                </GenericEditableImage>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}

// ── eshop-15-pro ────────────────────────────────────────────────────────────────
// Apatyka PRO pás — pilulka DNA 1:1. Světle mátový zaoblený panel: vlevo velký
// tmavě zelený titulek + wordmark s PRO badge, uprostřed benefity s tučnými
// zvýrazněními (**bold** markup) + drobná poznámka, vpravo tmavě zelená pill CTA.
// ──────────────────────────────────────────────────────────────────────────────
function Es15Bold({ text }: { text: string }) {
  const parts = text.split(/\*\*(.+?)\*\*/g);
  return <>{parts.map((p, i) => (i % 2 === 1 ? <strong key={i} style={{ fontWeight: 800 }}>{p}</strong> : <Fragment key={i}>{p}</Fragment>))}</>;
}

function ProEshop15({ content, tenantSlug, isAdmin }: { content: Record<string, unknown>; sectionId: number; tenantSlug?: string; isAdmin: boolean }) {
  const GREEN = "#064740";
  const GREEN_DK = "#03332e";
  const PANEL = "#d9f2de";
  const SYS = "-apple-system, 'system-ui', 'Segoe UI', Roboto, Arial, sans-serif";

  const siteMode = String(content.siteMode ?? "multipage");
  const resolve = (href: string) => resolveNavHref(href, siteMode, tenantSlug, isAdmin);

  const title = String(content.title ?? "");
  const brand = String(content.brand ?? "");
  const badge = String(content.badge ?? "PRO");
  const benefits = ((content.benefits as string[]) ?? []).slice(0, 6);
  const note = String(content.note ?? "");
  const ctaText = String(content.ctaText ?? "");
  const ctaHref = String(content.ctaHref ?? "/obchod");

  if (!title) return null;

  return (
    <section data-variant="eshop-15-pro" style={{ fontFamily: SYS, background: "#fff", padding: "18px 0 10px" }}>
      <style>{`
        .es15p-panel { background: ${PANEL}; border-radius: 22px; padding: 46px 54px;
          display: grid; grid-template-columns: minmax(0, 5fr) minmax(0, 6fr) auto; gap: 48px; align-items: center; }
        @media (max-width: 1023px) { .es15p-panel { grid-template-columns: 1fr; gap: 26px; padding: 34px 28px; } }
        .es15p-cta { display: inline-flex; align-items: center; justify-content: center; text-align: center;
          background: ${GREEN}; color: #fff; text-decoration: none; font-size: 14.5px; font-weight: 700; line-height: 1.3;
          padding: 15px 27px; border-radius: 999px; max-width: 190px; box-shadow: 0 10px 24px rgba(6,71,64,0.22);
          transition: background 0.16s, transform 0.14s; }
        .es15p-cta:hover { background: ${GREEN_DK}; transform: translateY(-1px); }
        @media (prefers-reduced-motion: reduce) { .es15p-cta { transition: none; } }
      `}</style>

      <div style={{ maxWidth: 1420, margin: "0 auto", padding: "0 28px" }}>
        <div className="es15p-panel">
          {/* Titulek + brand */}
          <div>
            <h2 style={{ margin: 0, fontFamily: SYS, fontSize: "clamp(27px, 2.6vw, 37px)", fontWeight: 800, lineHeight: 1.16, letterSpacing: "-0.015em", color: GREEN }}>{title}</h2>
            {brand && (
              <div style={{ display: "inline-flex", alignItems: "center", gap: 9, marginTop: 22 }}>
                <span style={{ fontWeight: 800, fontSize: 25, letterSpacing: "-0.02em", color: GREEN, lineHeight: 1, textTransform: "lowercase" }}>{brand}</span>
                <span style={{ background: GREEN, color: "#fff", fontSize: 11, fontWeight: 800, letterSpacing: "0.05em", padding: "5px 10px", borderRadius: 999, lineHeight: 1 }}>{badge}</span>
              </div>
            )}
          </div>

          {/* Benefity */}
          <div>
            {benefits.map((b, i) => (
              <p key={i} style={{ margin: i === 0 ? 0 : "13px 0 0", fontSize: 16.5, lineHeight: 1.45, color: GREEN }}><Es15Bold text={b} /></p>
            ))}
            {note && <p style={{ margin: "15px 0 0", fontSize: 15, lineHeight: 1.5, color: GREEN, opacity: 0.88 }}>{note}</p>}
          </div>

          {/* CTA */}
          {ctaText && (
            <div>
              <a href={resolve(ctaHref)} className="es15p-cta">{ctaText}</a>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

// ── eshop-16-partners ───────────────────────────────────────────────────────────
// Spížka (kosik.cz DNA): „Od našich partnerů" — řada širokých reklamních
// bannerů (radius 14, ~2.4:1): vlastní barevný gradient per banner, chip se
// jménem značky, Bricolage titulek + tagline vlevo, foto vpravo s měkkým
// prolnutím, dekorativní kruhové play tlačítko vlevo dole (kosik konvence).
// Scroll-snap, 3 na desktopu, šipky mizí na krajích.
// content: heading / items[{brand,title,text,image,from,to,dark?}].
// ──────────────────────────────────────────────────────────────────────────────
type Es16Partner = { brand?: string; title?: string; text?: string; image?: string; from?: string; to?: string; dark?: boolean };

function PartnersEshop16({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const HEAD = "'Bricolage Grotesque', 'Segoe UI', sans-serif";
  const SANS = "'Figtree', 'Segoe UI', system-ui, sans-serif";
  const FIG = "#56203d";
  const INK = "#241a20";
  const CREAM = "#fbf7f1";
  const LINE = "#e9dfe0";

  const heading = String(content.heading ?? "Od našich partnerů");
  const items = ((content.items as Es16Partner[]) ?? []).slice(0, 8);
  const railRef = useRef<HTMLDivElement>(null);
  const [canL, setCanL] = useState(false);
  const [canR, setCanR] = useState(true);

  const updateArrows = () => {
    const el = railRef.current;
    if (!el) return;
    setCanL(el.scrollLeft > 8);
    setCanR(el.scrollLeft < el.scrollWidth - el.clientWidth - 8);
  };
  const scrollBy = (dir: number) => {
    const el = railRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * Math.round(el.clientWidth * 0.75), behavior: "smooth" });
  };

  if (!items.length) return null;

  return (
    <section data-variant="eshop-16-partners" style={{ fontFamily: SANS, background: CREAM, padding: "26px 0 12px" }}>
      <style>{`
        .es16pa-rail { display: flex; gap: 14px; overflow-x: auto; scroll-snap-type: x mandatory; scrollbar-width: none; -ms-overflow-style: none; padding: 4px 2px 14px; }
        .es16pa-rail::-webkit-scrollbar { display: none; }
        .es16pa-card { scroll-snap-align: start; flex: 0 0 calc(33.333% - 9.4px); min-width: 380px; aspect-ratio: 2.4 / 1; border-radius: 14px; overflow: hidden;
          position: relative; display: flex; align-items: stretch; transition: transform 0.18s, box-shadow 0.18s; }
        .es16pa-card:hover { transform: translateY(-3px); box-shadow: 0 18px 36px rgba(36,26,32,0.16); }
        .es16pa-body { position: relative; z-index: 2; flex: 0 0 58%; padding: 20px 4px 20px 22px; display: flex; flex-direction: column; align-items: flex-start; justify-content: center; }
        .es16pa-chip { font-size: 10.5px; font-weight: 800; letter-spacing: 0.09em; text-transform: uppercase; padding: 4px 10px; border-radius: 999px; line-height: 1.2; }
        .es16pa-title { color: inherit; font-family: ${HEAD}; font-weight: 800; font-size: clamp(18px, 1.5vw, 22px); letter-spacing: -0.015em; line-height: 1.15; margin: 9px 0 0; text-shadow: 0 1px 16px rgba(0,0,0,0.3); }
        .es16pa-text { color: inherit; margin: 5px 0 0; font-size: 12.5px; font-weight: 500; opacity: 0.88; line-height: 1.4; text-shadow: 0 1px 12px rgba(0,0,0,0.3); }
        .es16pa-photo { position: absolute; inset: 0 0 0 42%; z-index: 1; }
        .es16pa-photo img { width: 100%; height: 100%; object-fit: cover; display: block; transition: transform 0.5s cubic-bezier(0.16,1,0.3,1); }
        .es16pa-card:hover .es16pa-photo img { transform: scale(1.05); }
        .es16pa-fade { position: absolute; inset: 0; z-index: 1; pointer-events: none; }
        .es16pa-play { position: absolute; z-index: 3; left: 16px; bottom: 14px; width: 30px; height: 30px; border-radius: 999px;
          display: inline-flex; align-items: center; justify-content: center; backdrop-filter: blur(2px); }
        .es16pa-arrow { position: absolute; top: 50%; transform: translateY(-50%); z-index: 5; width: 44px; height: 44px; border-radius: 999px;
          border: 1px solid ${LINE}; background: #fff; color: ${FIG}; cursor: pointer; display: inline-flex; align-items: center; justify-content: center;
          box-shadow: 0 10px 24px rgba(36,26,32,0.12); transition: background 0.15s, opacity 0.18s; }
        .es16pa-arrow:hover { background: ${FIG}; color: #fff; }
        .es16pa-arrow:disabled { opacity: 0; pointer-events: none; }
        @media (max-width: 640px) { .es16pa-card { min-width: 320px; } .es16pa-arrow { display: none; } }
      `}</style>
      <div style={{ maxWidth: 1420, margin: "0 auto", padding: "0 28px" }}>
        <GenericEditableText sectionId={sectionId} field="heading" value={heading} tag="h2" style={{
          fontFamily: HEAD, fontWeight: 800, fontSize: "clamp(20px, 2vw, 26px)", letterSpacing: "-0.015em", color: INK, margin: "0 0 14px",
        }} />
        <div style={{ position: "relative" }}>
          <button className="es16pa-arrow" style={{ left: -14 }} onClick={() => scrollBy(-1)} disabled={!canL} aria-label="Posunout doleva">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 6-6 6 6 6"/></svg>
          </button>
          <div className="es16pa-rail" ref={railRef} onScroll={updateArrows}>
            {items.map((b, i) => {
              const from = b.from ?? "#56203d";
              const to = b.to ?? "#3f152c";
              const dark = b.dark !== false; // default tmavé pozadí → bílý text
              const fg = dark ? "#fff" : "#241a20";
              return (
                <div key={i} className="es16pa-card" style={{ background: `linear-gradient(105deg, ${from} 0%, ${to} 100%)`, color: fg }}>
                  <div className="es16pa-photo">
                    {b.image && <img src={b.image} alt={b.brand ?? ""} loading="lazy" />}
                  </div>
                  <div className="es16pa-fade" style={{ background: `linear-gradient(90deg, ${from} 58%, ${to}00 88%)` }} />
                  <div className="es16pa-body">
                    <span className="es16pa-chip" style={{ background: dark ? "rgba(255,255,255,0.16)" : "rgba(36,26,32,0.1)", color: fg }}>{b.brand}</span>
                    <h3 className="es16pa-title">{b.title}</h3>
                    <p className="es16pa-text">{b.text}</p>
                  </div>
                  <span className="es16pa-play" style={{ background: dark ? "rgba(255,255,255,0.2)" : "rgba(36,26,32,0.15)", color: fg }} aria-hidden>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5.5v13l11-6.5-11-6.5Z"/></svg>
                  </span>
                </div>
              );
            })}
          </div>
          <button className="es16pa-arrow" style={{ right: -14 }} onClick={() => scrollBy(1)} disabled={!canR} aria-label="Posunout doprava">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 6 6 6-6 6"/></svg>
          </button>
        </div>
      </div>
    </section>
  );
}

// ── eshop-16-app ────────────────────────────────────────────────────────────────
// Spížka (kosik.cz DNA): app banner — pastelově fíková dlaždice (radius 18):
// vlevo Bricolage fíkový titulek + store pill badge (Google Play / App Store,
// kreslené, demo) + rating pill s meruňkovou hvězdou; vpravo CSS mockup
// telefonu s mini app UI (řádky kategorií) a bílá QR karta (deterministický
// demo QR pattern v SVG). content: appBanner{title,text,rating}.
// ──────────────────────────────────────────────────────────────────────────────
function Es16DemoQr() {
  // deterministický pseudo-QR (demo — nikam nevede)
  const cells: JSX.Element[] = [];
  let seed = 7;
  for (let y = 0; y < 21; y++) {
    for (let x = 0; x < 21; x++) {
      const inFinder = (x < 7 && y < 7) || (x > 13 && y < 7) || (x < 7 && y > 13);
      if (inFinder) continue;
      seed = (seed * 73 + x * 31 + y * 17 + 13) % 97;
      if (seed % 2 === 0) cells.push(<rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" />);
    }
  }
  const finder = (fx: number, fy: number) => (
    <g key={`f${fx}${fy}`}>
      <path d={`M${fx} ${fy}h7v7h-7zM${fx + 1} ${fy + 1}v5h5v-5z`} fillRule="evenodd" />
      <rect x={fx + 2} y={fy + 2} width="3" height="3" />
    </g>
  );
  return (
    <svg viewBox="0 0 21 21" width="76" height="76" fill="#241a20" aria-hidden>
      {finder(0, 0)}{finder(14, 0)}{finder(0, 14)}
      {cells}
    </svg>
  );
}

function AppBannerEshop16({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const HEAD = "'Bricolage Grotesque', 'Segoe UI', sans-serif";
  const SANS = "'Figtree', 'Segoe UI', system-ui, sans-serif";
  const FIG = "#56203d";
  const FIG_DK = "#3f152c";
  const APRICOT = "#f2a541";
  const INK = "#241a20";
  const CREAM = "#fbf7f1";

  const title = String(content.title ?? "Spížka v kapse — nákup hotový za pár minut");
  const text = String(content.text ?? "Skenujte, objednávejte, sledujte kurýra. Appka si pamatuje váš košík i oblíbené.");
  const rating = String(content.rating ?? "4,8/5");

  const appRows = [
    { label: "Ovoce a zelenina", w: 72, c: "#3e9b4f" },
    { label: "Pekárna a cukrárna", w: 84, c: APRICOT },
    { label: "Mléčné a chlazené", w: 66, c: "#7fb3d5" },
    { label: "Maso a ryby", w: 58, c: "#d23c55" },
    { label: "Nápoje", w: 76, c: FIG },
  ];

  return (
    <section data-variant="eshop-16-app" style={{ fontFamily: SANS, background: CREAM, padding: "26px 0 12px" }}>
      <style>{`
        .es16app-tile { position: relative; overflow: hidden; border-radius: 18px; background: linear-gradient(115deg, #f0dfe9 0%, #e9d3e0 55%, #e2c6d6 100%);
          display: flex; align-items: center; gap: 26px; padding: 30px 34px; min-height: 190px; }
        .es16app-left { flex: 1 1 auto; min-width: 0; position: relative; z-index: 2; }
        .es16app-title { color: ${FIG_DK}; font-family: ${HEAD}; font-weight: 800; font-size: clamp(21px, 2.2vw, 30px); letter-spacing: -0.02em; line-height: 1.14; margin: 0 0 16px; max-width: 560px; }
        .es16app-badges { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
        .es16app-store { display: inline-flex; align-items: center; gap: 9px; background: ${INK}; color: #fff; border-radius: 10px; padding: 8px 14px; text-decoration: none; transition: transform 0.14s, background 0.15s; }
        .es16app-store:hover { transform: translateY(-2px); background: #000; }
        .es16app-store small { display: block; font-size: 8.5px; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase; opacity: 0.75; line-height: 1.2; }
        .es16app-store b { display: block; font-size: 13.5px; font-weight: 700; line-height: 1.15; }
        .es16app-rating { display: inline-flex; align-items: center; gap: 7px; background: #fff; color: ${INK}; border-radius: 999px; padding: 8px 14px; font-size: 13px; font-weight: 800; }
        .es16app-text { margin: 12px 0 0; font-size: 13.5px; font-weight: 500; color: rgba(63,21,44,0.72); max-width: 460px; line-height: 1.5; }

        .es16app-phone { position: relative; z-index: 2; flex: 0 0 auto; width: 172px; background: #fff; border-radius: 22px; box-shadow: 0 24px 48px rgba(63,21,44,0.28);
          padding: 12px 12px 0; align-self: flex-end; margin-bottom: -52px; border: 5px solid ${FIG_DK}; border-bottom: none; border-radius: 26px 26px 0 0; }
        .es16app-notch { width: 54px; height: 5px; border-radius: 999px; background: #e6dee2; margin: 0 auto 10px; }
        .es16app-appbar { font-family: ${HEAD}; font-weight: 800; font-size: 13px; color: ${FIG}; margin-bottom: 8px; }
        .es16app-appbar i { color: ${APRICOT}; font-style: normal; }
        .es16app-row { display: flex; align-items: center; gap: 7px; padding: 6px 0; border-top: 1px solid #f3edf0; }
        .es16app-dot { width: 18px; height: 18px; border-radius: 6px; flex: 0 0 auto; }
        .es16app-bar { height: 6px; border-radius: 999px; background: #eee4ea; }

        .es16app-qr { position: relative; z-index: 2; flex: 0 0 auto; background: #fff; border-radius: 14px; padding: 10px 10px 7px; text-align: center;
          box-shadow: 0 14px 30px rgba(63,21,44,0.18); }
        .es16app-qr span { display: block; font-size: 9.5px; font-weight: 700; letter-spacing: 0.05em; text-transform: uppercase; color: ${FIG}; margin-top: 3px; }
        .es16app-mark { position: absolute; right: 210px; top: -46px; font-family: ${HEAD}; font-weight: 800; font-size: 200px; line-height: 1; color: rgba(86,32,61,0.07); pointer-events: none; z-index: 1; }
        @media (max-width: 900px) {
          .es16app-tile { flex-wrap: wrap; padding: 24px 22px; }
          .es16app-phone { display: none; }
          .es16app-mark { display: none; }
        }
      `}</style>
      <div style={{ maxWidth: 1420, margin: "0 auto", padding: "0 28px" }}>
        <div className="es16app-tile">
          <span className="es16app-mark" aria-hidden>Spížka.</span>
          <div className="es16app-left">
            <GenericEditableText sectionId={sectionId} field="title" value={title} tag="h2" className="es16app-title" />
            <div className="es16app-badges">
              <a href="#" className="es16app-store" onClick={(e) => e.preventDefault()} aria-label="Google Play (demo)">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M4 3.5v17c0 .4.5.7.8.4l9.6-8.2c.3-.2.3-.6 0-.8L4.8 3.1c-.3-.3-.8 0-.8.4Zm12.2 6.1 2.9 2.1c.4.3.4.9 0 1.2l-2.9 2.1-2.6-2.7 2.6-2.7Z"/></svg>
                <span><small>Rozjeďte to</small><b>Google Play</b></span>
              </a>
              <a href="#" className="es16app-store" onClick={(e) => e.preventDefault()} aria-label="App Store (demo)">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M16.4 12.7c0-2.4 2-3.6 2.1-3.7-1.1-1.7-2.9-1.9-3.5-1.9-1.5-.2-2.9.9-3.7.9-.8 0-1.9-.9-3.2-.8-1.6 0-3.1 1-4 2.4-1.7 3-0.4 7.4 1.2 9.8.8 1.2 1.8 2.5 3.1 2.4 1.2-.1 1.7-.8 3.2-.8s1.9.8 3.2.8c1.3 0 2.2-1.2 3-2.4.9-1.4 1.3-2.7 1.3-2.8-.1 0-2.6-1-2.7-3.9ZM14 5.6c.7-.8 1.1-1.9 1-3.1-1 0-2.2.7-2.9 1.5-.6.7-1.2 1.9-1 3 1.1.1 2.2-.6 2.9-1.4Z"/></svg>
                <span><small>Stáhnout v</small><b>App Store</b></span>
              </a>
              <span className="es16app-rating">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="#f2a541" aria-hidden><path d="m12 2 3 6.6 7 .8-5.2 4.8L18.2 21 12 17.5 5.8 21l1.4-6.8L2 9.4l7-.8L12 2Z"/></svg>
                {rating}
              </span>
            </div>
            <p className="es16app-text">{text}</p>
          </div>

          <div className="es16app-phone" aria-hidden>
            <div className="es16app-notch" />
            <div className="es16app-appbar">Spížka<i>.</i></div>
            {appRows.map((r, i) => (
              <div key={i} className="es16app-row">
                <span className="es16app-dot" style={{ background: `${r.c}22`, border: `1.5px solid ${r.c}` }} />
                <span className="es16app-bar" style={{ width: `${r.w}%` }} />
              </div>
            ))}
          </div>

          <div className="es16app-qr" aria-hidden>
            <Es16DemoQr />
            <span>Namiřte foťák</span>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── eshop-15-brands ─────────────────────────────────────────────────────────────
// Apatyka pás partnerských značek — pilulka DNA 1:1. Bílý zaoblený panel s jemným
// rámečkem, 6–7 textových wordmarků demo značek v různých stylech (CSS, bez obrázků).
// ──────────────────────────────────────────────────────────────────────────────
function BrandsEshop15({ content }: { content: Record<string, unknown>; sectionId: number }) {
  const LINE = "#e8e8e6";
  const SYS = "-apple-system, 'system-ui', 'Segoe UI', Roboto, Arial, sans-serif";
  const brands = ((content.brands as Array<{ name?: string; style?: string; color?: string }>) ?? []).slice(0, 8);
  if (!brands.length) return null;

  const styleFor = (b: { style?: string; color?: string }): React.CSSProperties => {
    const base: React.CSSProperties = { color: b.color ?? "#3a4440", lineHeight: 1, whiteSpace: "nowrap" };
    switch (b.style) {
      case "lower-bold": return { ...base, fontWeight: 800, fontSize: 27, letterSpacing: "-0.03em", textTransform: "lowercase", fontFamily: SYS };
      case "serif": return { ...base, fontWeight: 600, fontSize: 23, letterSpacing: "0.14em", textTransform: "uppercase", fontFamily: "Georgia, 'Times New Roman', serif" };
      case "italic": return { ...base, fontWeight: 700, fontSize: 24, fontStyle: "italic", letterSpacing: "-0.01em", fontFamily: SYS };
      case "heavy-italic": return { ...base, fontWeight: 900, fontSize: 24, fontStyle: "italic", letterSpacing: "-0.02em", textTransform: "uppercase", fontFamily: SYS };
      case "mono": return { ...base, fontWeight: 700, fontSize: 21, letterSpacing: "0.08em", fontFamily: "'SF Mono', Menlo, Consolas, monospace" };
      case "rounded": return { ...base, fontWeight: 800, fontSize: 25, letterSpacing: "0.01em", fontFamily: SYS };
      default: return { ...base, fontWeight: 700, fontSize: 23, fontFamily: SYS };
    }
  };

  return (
    <section data-variant="eshop-15-brands" style={{ fontFamily: SYS, background: "#fff", padding: "14px 0" }}>
      <style>{`
        .es15br-panel { border: 1px solid ${LINE}; border-radius: 16px; padding: 30px 40px;
          display: flex; align-items: center; justify-content: space-between; gap: 34px; overflow-x: auto;
          scrollbar-width: none; -ms-overflow-style: none; }
        .es15br-panel::-webkit-scrollbar { display: none; }
        .es15br-item { flex: 0 0 auto; opacity: 0.82; transition: opacity 0.16s, transform 0.2s; }
        .es15br-item:hover { opacity: 1; transform: translateY(-2px); }
        @media (prefers-reduced-motion: reduce) { .es15br-item { transition: none; } }
      `}</style>
      <div style={{ maxWidth: 1420, margin: "0 auto", padding: "0 28px" }}>
        <div className="es15br-panel">
          {brands.map((b, i) => (
            <span key={i} className="es15br-item" style={styleFor(b)}>{b.name}</span>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── eshop-15-app ────────────────────────────────────────────────────────────────
// Apatyka app banner — pilulka DNA 1:1. Bílá zaoblená karta: vlevo zelený nadpis
// „Jednodušší nakupování s aplikací Apatyka" + 3 odrážky se zelenými checky,
// uprostřed pseudo-QR (SVG) + badges Google Play / App Store, vpravo nakloněný
// CSS telefon s mini náhledem aplikace.
// ──────────────────────────────────────────────────────────────────────────────
function AppEshop15({ content }: { content: Record<string, unknown>; sectionId: number }) {
  const GREEN = "#064740";
  const MINT = "#cdeed9";
  const LIME = "#7efd92";
  const LINE = "#e8e8e6";
  const INK = "#1c1c1c";
  const SEARCH_BG = "#edf1f4";
  const SYS = "-apple-system, 'system-ui', 'Segoe UI', Roboto, Arial, sans-serif";

  const heading = String(content.heading ?? "");
  const bullets = ((content.bullets as string[]) ?? []).slice(0, 4);
  const qrNote = String(content.qrNote ?? "");
  const appName = String(content.appName ?? "apatyka");
  const googleLabel = String(content.googleLabel ?? "Google Play");
  const appleLabel = String(content.appleLabel ?? "App Store");
  const storePrefix = String(content.storePrefix ?? "Stáhnout na");

  if (!heading) return null;

  // deterministický pseudo-QR (SVG mřížka 17×17)
  const qrCells: Array<[number, number]> = [];
  let seed = 41;
  for (let y = 0; y < 17; y++) for (let x = 0; x < 17; x++) {
    seed = (seed * 73 + x * 7 + y * 13 + 29) % 97;
    const inFinder = (x < 5 && y < 5) || (x > 11 && y < 5) || (x < 5 && y > 11);
    if (!inFinder && seed % 5 < 2) qrCells.push([x, y]);
  }

  return (
    <section data-variant="eshop-15-app" style={{ fontFamily: SYS, background: "#fff", padding: "48px 0 52px" }}>
      <style>{`
        .es15app-panel { position: relative; border: 1px solid ${LINE}; border-radius: 22px; padding: 52px 330px 52px 50px; min-height: 320px;
          display: flex; align-items: center; gap: 56px; flex-wrap: wrap; box-shadow: 0 12px 34px rgba(6,71,64,0.05); }
        .es15app-badge { display: inline-flex; align-items: center; gap: 10px; color: ${INK}; text-decoration: none; }
        .es15app-badge:hover { opacity: 0.7; }
        .es15app-phone { position: absolute; right: 66px; top: 50%; transform: translateY(-50%) rotate(9deg); width: 196px; height: 396px;
          border-radius: 34px; background: #0d1f1b; padding: 9px; box-shadow: 24px 34px 60px rgba(6,71,64,0.28); }
        .es15app-screen { width: 100%; height: 100%; border-radius: 26px; background: #fff; overflow: hidden; display: flex; flex-direction: column; }
        @media (max-width: 1180px) { .es15app-panel { padding: 40px 34px; } .es15app-phone { display: none; } }
      `}</style>
      <div style={{ maxWidth: 1420, margin: "0 auto", padding: "0 28px" }}>
        <div className="es15app-panel">
          {/* Text + odrážky */}
          <div style={{ flex: "1 1 340px", minWidth: 280 }}>
            <h2 style={{ margin: 0, fontFamily: SYS, fontSize: "clamp(22px, 2.1vw, 28px)", fontWeight: 800, letterSpacing: "-0.015em", color: GREEN }}>{heading}</h2>
            <div style={{ marginTop: 20 }}>
              {bullets.map((b, i) => (
                <p key={i} style={{ display: "flex", alignItems: "center", gap: 10, margin: i === 0 ? 0 : "12px 0 0", fontSize: 15.5, color: "#2b2b2b" }}>
                  <span style={{ flexShrink: 0, width: 20, height: 20, borderRadius: 999, background: "#2fb26a", color: "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                  </span>
                  {b}
                </p>
              ))}
            </div>
          </div>

          {/* QR + badges */}
          <div style={{ display: "flex", alignItems: "center", gap: 40, flexWrap: "wrap" }}>
            <div style={{ textAlign: "center" }}>
              <svg width="112" height="112" viewBox="0 0 17 17" style={{ display: "block", border: `1px solid ${LINE}`, borderRadius: 8, padding: 6, background: "#fff" }} aria-label={qrNote || "QR kód aplikace"}>
                {[[0,0],[12,0],[0,12]].map(([fx,fy], i) => (
                  <g key={i} fill={INK}>
                    <rect x={fx} y={fy} width="5" height="5" rx="0.8" fill="none" stroke={INK} strokeWidth="1"/>
                    <rect x={fx+1.6} y={fy+1.6} width="1.8" height="1.8"/>
                  </g>
                ))}
                {qrCells.map(([x,y], i) => <rect key={i} x={x} y={y} width="0.92" height="0.92" fill={INK}/>)}
              </svg>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <a href="#" onClick={(e) => e.preventDefault()} className="es15app-badge">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M4 3.5v17c0 .4.45.65.8.43l2.1-1.2L13.2 12 6.9 4.27l-2.1-1.2A.5.5 0 0 0 4 3.5Zm11.5 5.1L8.6 4.9l5.5 6.2 1.4-2.5Zm0 6.8-1.4-2.5-5.5 6.2 6.9-3.7Zm1.8-5.8 2.3 1.25a.9.9 0 0 1 0 1.6l-2.3 1.25L15.6 12l1.7-2.4Z"/></svg>
                <span style={{ textAlign: "left" }}>
                  <span style={{ display: "block", fontSize: 11, color: "#6f6f6f" }}>{storePrefix}</span>
                  <span style={{ display: "block", fontSize: 17, fontWeight: 700, letterSpacing: "-0.01em" }}>{googleLabel}</span>
                </span>
              </a>
              <a href="#" onClick={(e) => e.preventDefault()} className="es15app-badge">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M16.4 12.7c0-2.3 1.9-3.4 2-3.5-1.1-1.6-2.8-1.8-3.4-1.8-1.4-.15-2.8.85-3.5.85-.75 0-1.85-.83-3.05-.8-1.55.02-3 .9-3.8 2.3-1.65 2.85-.42 7.05 1.16 9.35.8 1.13 1.72 2.4 2.94 2.35 1.18-.05 1.63-.76 3.06-.76 1.42 0 1.83.76 3.07.73 1.27-.02 2.07-1.14 2.84-2.28.9-1.3 1.26-2.57 1.28-2.64-.03-.01-2.45-.94-2.6-3.75ZM14.1 5.9c.64-.8 1.08-1.9.96-3-.93.04-2.07.62-2.74 1.42-.6.7-1.13 1.83-.99 2.9 1.04.08 2.11-.52 2.77-1.32Z"/></svg>
                <span style={{ textAlign: "left" }}>
                  <span style={{ display: "block", fontSize: 11, color: "#6f6f6f" }}>{storePrefix}</span>
                  <span style={{ display: "block", fontSize: 17, fontWeight: 700, letterSpacing: "-0.01em" }}>{appleLabel}</span>
                </span>
              </a>
            </div>
          </div>

          {/* Telefon mockup */}
          <div className="es15app-phone" aria-hidden>
            <div className="es15app-screen">
              <div style={{ background: GREEN, padding: "16px 14px 12px" }}>
                <span style={{ color: "#fff", fontWeight: 800, fontSize: 19, letterSpacing: "-0.02em", textTransform: "lowercase" }}>{appName}</span>
                <div style={{ marginTop: 10, height: 30, borderRadius: 999, background: "rgba(255,255,255,0.94)" }} />
              </div>
              <div style={{ padding: 12, flex: 1, background: "#fff" }}>
                <div style={{ height: 84, borderRadius: 12, background: `linear-gradient(135deg, ${MINT}, ${LIME})`, marginBottom: 10 }} />
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  {[0,1,2,3].map((i) => (
                    <div key={i} style={{ height: 54, borderRadius: 10, background: i % 2 ? SEARCH_BG : "#f0efe6" }} />
                  ))}
                </div>
                <div style={{ marginTop: 10, height: 12, borderRadius: 6, background: SEARCH_BG, width: "70%" }} />
                <div style={{ marginTop: 7, height: 12, borderRadius: 6, background: SEARCH_BG, width: "50%" }} />
              </div>
              <div style={{ borderTop: `1px solid ${LINE}`, padding: "9px 16px", display: "flex", justifyContent: "space-between" }}>
                {[0,1,2,3].map((i) => <span key={i} style={{ width: 22, height: 22, borderRadius: 7, background: i === 0 ? MINT : SEARCH_BG }} />)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── eshop-16-recipes ────────────────────────────────────────────────────────────
// Spížka (kosik.cz DNA „Inspirace"): recepty — grid 4 karet (mobil: scroll-snap
// rail): foto 4:3 s meruňkovým čas-chipem (hodiny), Bricolage titulek, muted
// meta „N surovin • obtížnost". Karty jsou demo (bez prokliku). content:
// heading / subheading / items[{image,title,time,meta}].
// ──────────────────────────────────────────────────────────────────────────────
type Es16Recipe = { image?: string; title?: string; time?: string; meta?: string };

function RecipesEshop16({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const HEAD = "'Bricolage Grotesque', 'Segoe UI', sans-serif";
  const SANS = "'Figtree', 'Segoe UI', system-ui, sans-serif";
  const FIG = "#56203d";
  const APRICOT = "#f2a541";
  const INK = "#241a20";
  const MUTED = "#7a6c74";
  const CREAM = "#fbf7f1";
  const LINE = "#e9dfe0";

  const heading = String(content.heading ?? "Inspirace do kuchyně");
  const subheading = content.subheading === undefined ? "" : String(content.subheading);
  const items = ((content.items as Es16Recipe[]) ?? []).slice(0, 8);

  if (!items.length) return null;

  return (
    <section data-variant="eshop-16-recipes" style={{ fontFamily: SANS, background: CREAM, padding: "26px 0 12px" }}>
      <style>{`
        .es16r-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; }
        .es16r-card { background: #fff; border: 1px solid ${LINE}; border-radius: 16px; overflow: hidden; display: flex; flex-direction: column;
          transition: transform 0.18s, box-shadow 0.18s, border-color 0.16s; }
        .es16r-card:hover { transform: translateY(-4px); box-shadow: 0 18px 36px rgba(86,32,61,0.13); border-color: transparent; }
        .es16r-media { position: relative; aspect-ratio: 4/3; overflow: hidden; background: ${CREAM}; }
        .es16r-media img { width: 100%; height: 100%; object-fit: cover; display: block; transition: transform 0.5s cubic-bezier(0.16,1,0.3,1); }
        .es16r-card:hover .es16r-media img { transform: scale(1.06); }
        .es16r-time { position: absolute; left: 10px; bottom: 10px; display: inline-flex; align-items: center; gap: 5px; background: ${APRICOT}; color: #3f152c;
          font-size: 11.5px; font-weight: 800; padding: 5px 10px; border-radius: 999px; line-height: 1.2; }
        .es16r-body { padding: 13px 15px 16px; }
        .es16r-title { color: ${INK}; font-family: ${HEAD}; font-weight: 800; font-size: 16px; letter-spacing: -0.01em; line-height: 1.25; margin: 0; transition: color 0.14s; }
        .es16r-card:hover .es16r-title { color: ${FIG}; }
        .es16r-meta { margin: 6px 0 0; font-size: 12.5px; font-weight: 500; color: ${MUTED}; }
        @media (max-width: 1000px) { .es16r-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 640px) {
          .es16r-grid { display: flex; gap: 12px; overflow-x: auto; scroll-snap-type: x mandatory; scrollbar-width: none; -ms-overflow-style: none; padding-bottom: 12px; }
          .es16r-grid::-webkit-scrollbar { display: none; }
          .es16r-card { flex: 0 0 72%; scroll-snap-align: start; }
        }
      `}</style>
      <div style={{ maxWidth: 1420, margin: "0 auto", padding: "0 28px" }}>
        <div style={{ marginBottom: 14 }}>
          <GenericEditableText sectionId={sectionId} field="heading" value={heading} tag="h2" style={{
            fontFamily: HEAD, fontWeight: 800, fontSize: "clamp(20px, 2vw, 26px)", letterSpacing: "-0.015em", color: INK, margin: 0,
          }} />
          {subheading.trim() !== "" && (
            <GenericEditableText sectionId={sectionId} field="subheading" value={subheading} tag="p" style={{
              margin: "3px 0 0", fontSize: 13.5, fontWeight: 500, color: MUTED, lineHeight: 1.4,
            }} />
          )}
        </div>
        <div className="es16r-grid">
          {items.map((r, i) => (
            <div key={i} className="es16r-card">
              <span className="es16r-media">
                {r.image && <img src={r.image} alt={r.title ?? ""} loading="lazy" />}
                {r.time && (
                  <span className="es16r-time">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>
                    {r.time}
                  </span>
                )}
              </span>
              <span className="es16r-body">
                <h3 className="es16r-title">{r.title}</h3>
                <p className="es16r-meta">{r.meta}</p>
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── eshop-17-calendar ───────────────────────────────────────────────────────────
// Rozkvět (florea.cz DNA) — krémový pruh „kalendář jmenin" pod hero: řada
// trhacích kalendářových lístků (bílá karta radius 12, dvě perforační dírky
// nahoře, datum Instrument Sans, jméno Fraunces bordó; hover lift + zlatý
// kvítek), vpravo citátový blok (Fraunces italic citát, jméno + role, kulatý
// portrét s krémovým prstencem). Mobil: lístky scroll-snap, citát pod nimi.
// content: kicker / items[{date,name,today?}] / quote{text,author,role,image}.
// ──────────────────────────────────────────────────────────────────────────────
type Es17CalItem = { date?: string; name?: string; today?: boolean };
type Es17CalQuote = { text?: string; author?: string; role?: string; image?: string };

function CalendarEshop17({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const HEAD = "'Fraunces', Georgia, serif";
  const SANS = "'Instrument Sans', 'Segoe UI', system-ui, sans-serif";
  const BORDO = "#8f1d3d";
  const GOLD = "#c9a24b";
  const INK = "#241a1d";
  const MUTED = "#7d6d72";
  const CREAM = "#f7f1e8";
  const LINE = "#eadfd6";

  const kicker = String(content.kicker ?? "");
  const items = ((content.items as Es17CalItem[]) ?? []).slice(0, 7);
  const quote = (content.quote as Es17CalQuote) ?? {};

  if (!items.length && !quote.text) return null;

  return (
    <section data-variant="eshop-17-calendar" style={{ fontFamily: SANS, background: CREAM, borderTop: `1px solid ${LINE}`, borderBottom: `1px solid ${LINE}`, padding: "26px 0" }}>
      <style>{`
        .es17c-rail { display: flex; gap: 12px; overflow-x: auto; scroll-snap-type: x proximity; scrollbar-width: none; -ms-overflow-style: none; padding: 6px 2px 8px; }
        .es17c-rail::-webkit-scrollbar { display: none; }
        .es17c-card { scroll-snap-align: start; flex: 1 0 108px; min-width: 108px; background: #fff; border: 1px solid ${LINE}; border-radius: 12px;
          padding: 15px 10px 14px; text-align: center; position: relative; transition: transform 0.18s, box-shadow 0.18s, border-color 0.18s; }
        .es17c-card:hover { transform: translateY(-3px); box-shadow: 0 14px 28px rgba(46,10,24,0.1); border-color: #ddc9b4; }
        .es17c-card::before, .es17c-card::after { content: ""; position: absolute; top: 7px; width: 7px; height: 7px; border-radius: 50%;
          background: ${CREAM}; box-shadow: inset 0 1px 2px rgba(46,10,24,0.22); }
        .es17c-card::before { left: 26%; }
        .es17c-card::after { right: 26%; }
        .es17c-card.es17c-today { border-color: ${GOLD}; box-shadow: 0 10px 24px rgba(201,162,75,0.22); }
        .es17c-grid { display: grid; grid-template-columns: minmax(0, 1fr) minmax(300px, 400px); gap: clamp(20px, 3vw, 48px); align-items: center; }
        @media (max-width: 980px) { .es17c-grid { grid-template-columns: 1fr; } }
      `}</style>

      <div style={{ maxWidth: 1420, margin: "0 auto", padding: "0 28px" }}>
        <div className="es17c-grid">
          <div>
            {kicker && (
              <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: MUTED, marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
                <Es17cFlower size={13} />
                {kicker}
              </div>
            )}
            {items.length > 0 && (
              <div className="es17c-rail">
                {items.map((it, i) => (
                  <div key={i} className={`es17c-card${it.today ? " es17c-today" : ""}`}>
                    {it.today && (
                      <span style={{ position: "absolute", top: -9, left: "50%", transform: "translateX(-50%)", background: GOLD, color: "#fff", fontSize: 9.5, fontWeight: 700, letterSpacing: "0.08em", borderRadius: 999, padding: "2.5px 9px", whiteSpace: "nowrap" }}>DNES</span>
                    )}
                    <span style={{ display: "block", fontSize: 13.5, fontWeight: 600, color: MUTED, borderBottom: `1px solid ${LINE}`, paddingBottom: 8, marginBottom: 9 }}>{it.date}</span>
                    <span style={{ display: "block", fontFamily: HEAD, fontWeight: 600, fontSize: 17.5, letterSpacing: "-0.005em", color: BORDO, lineHeight: 1.2 }}>{it.name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {quote.text && (
            <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
              <div style={{ flex: 1 }}>
                <svg width="26" height="20" viewBox="0 0 26 20" fill={GOLD} aria-hidden="true" style={{ display: "block", marginBottom: 8, opacity: 0.8 }}>
                  <path d="M0 20V12.6C0 5.9 3.6 1.4 10.2 0l1.3 2.9C7 4.4 5.1 6.8 4.9 9.8H11V20H0Zm15 0V12.6C15 5.9 18.6 1.4 25.2 0l1.3 2.9C22 4.4 20.1 6.8 19.9 9.8H26V20H15Z" transform="scale(0.85)" />
                </svg>
                <p style={{ fontFamily: HEAD, fontStyle: "italic", fontWeight: 500, fontSize: "clamp(14.5px, 1.25vw, 16.5px)", lineHeight: 1.5, color: INK, margin: 0 }}>{quote.text}</p>
                {(quote.author || quote.role) && (
                  <p style={{ margin: "10px 0 0", fontSize: 13.5 }}>
                    <strong style={{ fontWeight: 700, color: INK }}>{quote.author}</strong>
                    {quote.role && <span style={{ color: MUTED }}> — {quote.role}</span>}
                  </p>
                )}
              </div>
              {quote.image && (
                <img src={quote.image} alt={quote.author ?? ""} loading="lazy" style={{ width: 96, height: 96, borderRadius: "50%", objectFit: "cover", flexShrink: 0, border: "3px solid #fff", boxShadow: `0 0 0 1px ${LINE}, 0 12px 26px rgba(46,10,24,0.14)` }} />
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function Es17cFlower({ size = 13, color = "#c9a24b" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} aria-hidden="true">
      <circle cx="12" cy="12" r="2.6" fill="#8f1d3d" />
      <ellipse cx="12" cy="5.4" rx="3" ry="4.1" />
      <ellipse cx="12" cy="18.6" rx="3" ry="4.1" />
      <ellipse cx="5.4" cy="12" rx="4.1" ry="3" />
      <ellipse cx="18.6" cy="12" rx="4.1" ry="3" />
    </svg>
  );
}

// ── eshop-19-picks ──────────────────────────────────────────────────────────────
// Grunt (dek.cz DNA): „Vybrali jsme pro vás" — 4 promo karty (DEK vzor: čtvercové
// bannery 5 způsobů / půjčovna v kapse / Grunt Drive / Katalogy), vylepšeno:
// foto karta s grafitovým gradientem zdola, badge chip nahoře, Space Grotesk
// titulek, hover lift + zoom. Mobil 2 sloupce, scroll-snap na úzkých displejích.
// ──────────────────────────────────────────────────────────────────────────────
function PicksEshop19({ content, sectionId, tenantSlug, isAdmin }: { content: Record<string, unknown>; sectionId: number; tenantSlug?: string; isAdmin: boolean }) {
  const HEAD = "'Space Grotesk', 'Arial', sans-serif";
  const SANS = "'Inter', 'Segoe UI', system-ui, sans-serif";
  const RED = "#d5232c";
  const INK = "#1d1f23";

  const heading = String(content.heading ?? "Vybrali jsme pro vás");
  const items = (content.items as Array<{ title?: string; sub?: string; href?: string; image?: string; badge?: string }> ?? []).slice(0, 4);
  const resolve = (href?: string) => {
    const h = href ?? "/obchod";
    return isAdmin ? "#" : (tenantSlug ? `/demo/${tenantSlug}${h.startsWith("/") ? h : "/obchod"}` : h);
  };

  if (!items.length && !isAdmin) return null;

  return (
    <section data-variant="eshop-19-picks" style={{ fontFamily: SANS, background: "#fff", padding: "26px 0 40px" }}>
      <style>{`
        .es19pk-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
        @media (max-width: 1020px) { .es19pk-grid { grid-template-columns: repeat(2, 1fr); gap: 12px; } }

        .es19pk-card { position: relative; display: block; text-decoration: none; border-radius: 10px; overflow: hidden; aspect-ratio: 1/1;
          background: #212428; transition: transform 0.18s cubic-bezier(0.16,1,0.3,1), box-shadow 0.2s; }
        .es19pk-card:hover { transform: translateY(-4px); box-shadow: 0 20px 42px rgba(23,25,28,0.2); }
        .es19pk-card img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; transition: transform 0.55s cubic-bezier(0.16,1,0.3,1); opacity: 0.92; }
        .es19pk-card:hover img { transform: scale(1.06); }
        .es19pk-shade { position: absolute; inset: 0; background: linear-gradient(178deg, rgba(23,25,28,0.06) 38%, rgba(23,25,28,0.86) 88%); }

        .es19pk-badge { position: absolute; left: 14px; top: 14px; background: #d5232c; color: #fff; font-size: 10.5px; font-weight: 800;
          letter-spacing: 0.09em; text-transform: uppercase; padding: 5px 11px; border-radius: 4px; }

        .es19pk-arrow { position: absolute; right: 14px; bottom: 14px; width: 34px; height: 34px; border-radius: 7px; background: rgba(255,255,255,0.16);
          color: #fff; display: inline-flex; align-items: center; justify-content: center; backdrop-filter: blur(4px);
          transition: background 0.18s, transform 0.18s; }
        .es19pk-card:hover .es19pk-arrow { background: #d5232c; transform: translateX(2px); }
      `}</style>
      <div style={{ maxWidth: 1420, margin: "0 auto", padding: "0 28px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, margin: "0 0 18px" }}>
          <span aria-hidden="true" style={{ width: 10, height: 26, background: RED, borderRadius: 2, flexShrink: 0 }} />
          <GenericEditableText sectionId={sectionId} field="heading" value={heading} tag="h2" style={{
            fontFamily: HEAD, fontWeight: 700, fontSize: "clamp(20px, 1.9vw, 26px)", letterSpacing: "0.02em",
            textTransform: "uppercase", color: INK, margin: 0,
          }} />
        </div>
        <div className="es19pk-grid">
          {items.map((it, i) => (
            <a key={i} className="es19pk-card" href={resolve(it.href)}>
              {it.image && <img src={it.image} alt={it.title ?? ""} loading="lazy" />}
              <span className="es19pk-shade" aria-hidden="true" />
              {it.badge && <span className="es19pk-badge">{it.badge}</span>}
              <span style={{ position: "absolute", left: 16, right: 60, bottom: 16 }}>
                <span style={{ display: "block", fontFamily: HEAD, fontWeight: 700, fontSize: "clamp(17px, 1.5vw, 21px)", lineHeight: 1.15, letterSpacing: "0.01em", color: "#fff" }}>{it.title}</span>
                {it.sub && <span style={{ display: "block", marginTop: 5, fontSize: 12.5, fontWeight: 500, color: "rgba(255,255,255,0.75)", lineHeight: 1.4 }}>{it.sub}</span>}
              </span>
              <span className="es19pk-arrow" aria-hidden="true">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── eshop-19-brands ─────────────────────────────────────────────────────────────
// Grunt (dek.cz DNA): „Stovky kvalitních výrobců" — centrovaný nadpis +
// podtitulek, papírový pás s CSS wordmarky demo značek (každá vlastní
// typografický styl, šedá → barva na hover, DEK vzor pásu log) a outline chip
// „Všechny značky". Mobil: horizontální scroll.
// ──────────────────────────────────────────────────────────────────────────────
function BrandsEshop19({ content, sectionId, tenantSlug, isAdmin }: { content: Record<string, unknown>; sectionId: number; tenantSlug?: string; isAdmin: boolean }) {
  const HEAD = "'Space Grotesk', 'Arial', sans-serif";
  const SANS = "'Inter', 'Segoe UI', system-ui, sans-serif";
  const INK = "#1d1f23";
  const MUTED = "#6b6f76";
  const PAPER = "#f4f3ef";
  const LINE = "#e6e5e0";

  const heading = String(content.heading ?? "Stovky kvalitních výrobců");
  const subheading = String(content.subheading ?? "");
  const ctaText = String(content.ctaText ?? "");
  const ctaHref = String(content.ctaHref ?? "/obchod");
  const brands = (content.brands as Array<{ name?: string; style?: string }> ?? []).slice(0, 10);
  const resolve = (h: string) => (isAdmin ? "#" : (tenantSlug ? `/demo/${tenantSlug}${h.startsWith("/") ? h : "/obchod"}` : h));

  const markStyle = (style?: string): React.CSSProperties => {
    switch (style) {
      case "slab": return { fontFamily: HEAD, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" };
      case "soft": return { fontFamily: SANS, fontWeight: 800, letterSpacing: "-0.01em" };
      case "mono": return { fontFamily: "'Courier New', monospace", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase" };
      case "script": return { fontFamily: "Georgia, serif", fontStyle: "italic", fontWeight: 700, letterSpacing: "0.01em" };
      case "steel": return { fontFamily: HEAD, fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase" };
      case "electric": return { fontFamily: SANS, fontWeight: 900, fontStyle: "italic", letterSpacing: "0.02em", textTransform: "uppercase" };
      case "wave": return { fontFamily: SANS, fontWeight: 600, letterSpacing: "0.06em" };
      case "brand": return { fontFamily: HEAD, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", color: "#d5232c" };
      default: return { fontFamily: SANS, fontWeight: 700 };
    }
  };

  if (!brands.length && !isAdmin) return null;

  return (
    <section data-variant="eshop-19-brands" style={{ fontFamily: SANS, background: "#fff", padding: "50px 0 26px" }}>
      <style>{`
        .es19b-rail { display: flex; align-items: center; justify-content: space-between; gap: 30px; flex-wrap: nowrap; overflow-x: auto;
          background: #f4f3ef; border: 1.5px solid #e6e5e0; border-radius: 10px; padding: 26px 34px; scrollbar-width: none; }
        .es19b-rail::-webkit-scrollbar { display: none; }
        .es19b-mark { flex-shrink: 0; font-size: clamp(17px, 1.5vw, 21px); color: #9a9ea3; filter: grayscale(1); cursor: default;
          transition: color 0.18s, transform 0.16s, filter 0.18s; white-space: nowrap; }
        .es19b-mark:hover { color: #1d1f23; filter: none; transform: translateY(-2px); }
        .es19b-cta { display: inline-flex; align-items: center; gap: 8px; border: 1.5px solid #1d1f23; border-radius: 6px; background: #fff;
          color: #1d1f23; font-size: 12.5px; font-weight: 800; letter-spacing: 0.05em; text-transform: uppercase; padding: 11px 22px;
          text-decoration: none; transition: background 0.15s, color 0.15s; }
        .es19b-cta:hover { background: #1d1f23; color: #fff; }
      `}</style>
      <div style={{ maxWidth: 1420, margin: "0 auto", padding: "0 28px", textAlign: "center" }}>
        <GenericEditableText sectionId={sectionId} field="heading" value={heading} tag="h2" style={{
          fontFamily: HEAD, fontWeight: 700, fontSize: "clamp(22px, 2.2vw, 30px)", letterSpacing: "0.03em",
          textTransform: "uppercase", color: INK, margin: "0 0 8px",
        }} />
        {subheading && (
          <GenericEditableText sectionId={sectionId} field="subheading" value={subheading} tag="p" style={{
            fontSize: 14, color: MUTED, margin: "0 0 26px",
          }} />
        )}
        <div className="es19b-rail">
          {brands.map((b, i) => (
            <span key={i} className="es19b-mark" style={markStyle(b.style)}>{b.name}</span>
          ))}
        </div>
        {ctaText && (
          <div style={{ marginTop: 22 }}>
            <a href={resolve(ctaHref)} className="es19b-cta">{ctaText}</a>
          </div>
        )}
      </div>
    </section>
  );
}

// ── eshop-19-links ──────────────────────────────────────────────────────────────
// Grunt (dek.cz DNA): „Užitečné odkazy" — nenápadná lišta 4 outline tlačítek
// nad footerem (DEK vzor: Kalkulátory / Jak poptat a objednat / Katalogy ke
// stažení / …). Mobil 2 sloupce.
// ──────────────────────────────────────────────────────────────────────────────
function LinksEshop19({ content, sectionId, tenantSlug, isAdmin }: { content: Record<string, unknown>; sectionId: number; tenantSlug?: string; isAdmin: boolean }) {
  const SANS = "'Inter', 'Segoe UI', system-ui, sans-serif";
  const MUTED = "#6b6f76";

  const heading = String(content.heading ?? "Užitečné odkazy");
  const links = (content.links as Array<{ label?: string; href?: string }> ?? []).slice(0, 6);
  const resolve = (h?: string) => (isAdmin ? "#" : (tenantSlug ? `/demo/${tenantSlug}${(h ?? "/obchod").startsWith("/") ? h : "/obchod"}` : (h ?? "/obchod")));

  if (!links.length && !isAdmin) return null;

  return (
    <section data-variant="eshop-19-links" style={{ fontFamily: SANS, background: "#fff", padding: "8px 0 46px" }}>
      <style>{`
        .es19l-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
        @media (max-width: 900px) { .es19l-grid { grid-template-columns: repeat(2, 1fr); } }
        .es19l-btn { display: inline-flex; align-items: center; justify-content: center; gap: 8px; border: 1.5px solid #e6e5e0; border-radius: 6px;
          background: #fff; color: #1d1f23; font-size: 13px; font-weight: 700; padding: 13px 16px; text-decoration: none; text-align: center;
          transition: border-color 0.15s, background 0.15s, color 0.15s; }
        .es19l-btn:hover { border-color: #d5232c; color: #d5232c; background: #fdf6f6; }
      `}</style>
      <div style={{ maxWidth: 1420, margin: "0 auto", padding: "0 28px" }}>
        <GenericEditableText sectionId={sectionId} field="heading" value={heading} tag="p" style={{
          textAlign: "center", fontSize: 13, fontWeight: 600, color: MUTED, margin: "0 0 14px",
        }} />
        <div className="es19l-grid">
          {links.map((l, i) => (
            <a key={i} className="es19l-btn" href={resolve(l.href)}>{l.label}</a>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── eshop-18-network ────────────────────────────────────────────────────────────
// Oktan (autokelly.cz DNA) — pás „Prodejní a servisní síť + zákaznická linka +
// registrace" (AK sidebar povýšený na plnohodnotnou sekci). Grid 1.55fr/1fr/1fr:
// (1) bílá karta se stylizovanou SVG mapou ČR (grid pattern, papírový blob,
// karbonové piny se žlutým pulzem, města) + stats řádek (Archivo čísla) + chip
// „Najít nejbližší pobočku"; (2) karbonová karta zákaznické linky (žlutý kicker,
// kulatý avatar technika, Archivo číslo, hodiny, text); (3) žlutá karta
// registrace (benefity s karbonovými checky, karbonová CTA). Mobil: sloupec.
// ──────────────────────────────────────────────────────────────────────────────
type Es18nStat = { value: string; label: string };
type Es18nCity = { label: string; x: number; y: number };

function NetworkEshop18({ content, sectionId, tenantSlug, isAdmin }: { content: Record<string, unknown>; sectionId: number; tenantSlug?: string; isAdmin: boolean }) {
  const HEAD = "'Archivo', 'Arial Black', sans-serif";
  const SANS = "'Inter', 'Segoe UI', system-ui, sans-serif";
  const CARBON = "#131417";
  const CARBON_DK = "#0b0c0e";
  const YELLOW = "#ffd400";
  const YELLOW_DK = "#eec500";
  const INK = "#16171a";
  const MUTED = "#6a6e75";
  const PAPER = "#f5f5f2";
  const LINE = "#e4e5e0";

  const siteMode = String(content.siteMode ?? "multipage");
  const resolve = (href: string) => resolveNavHref(href, siteMode, tenantSlug, isAdmin);

  const map = (content.map as { heading?: string; text?: string; linkText?: string; href?: string; stats?: Es18nStat[]; cities?: Es18nCity[]; pins?: Array<{ x: number; y: number }> }) ?? {};
  const phone = (content.phone as { kicker?: string; number?: string; hours?: string; text?: string; image?: string }) ?? {};
  const register = (content.register as { kicker?: string; title?: string; benefits?: string[]; ctaText?: string; href?: string }) ?? {};

  const stats = map.stats ?? [];
  const cities = map.cities ?? [
    { label: "Praha", x: 63, y: 33 },
    { label: "Plzeň", x: 38, y: 48 },
    { label: "Brno", x: 121, y: 60 },
    { label: "Ostrava", x: 152, y: 34 },
  ];
  const pins = map.pins ?? [
    { x: 55, y: 27 }, { x: 74, y: 42 }, { x: 30, y: 40 }, { x: 96, y: 30 },
    { x: 112, y: 52 }, { x: 133, y: 42 }, { x: 148, y: 27 }, { x: 88, y: 62 },
    { x: 46, y: 56 }, { x: 68, y: 20 },
  ];

  if (!map.heading && !phone.number && !register.title) return null;

  return (
    <section data-variant="eshop-18-network" style={{ fontFamily: SANS, background: PAPER, padding: "26px 0 12px" }}>
      <style>{`
        @keyframes es18nPulse { 0% { transform: scale(0.55); opacity: 0.85; } 70% { transform: scale(1.9); opacity: 0; } 100% { transform: scale(1.9); opacity: 0; } }
        .es18n-pin-ring { transform-origin: center; transform-box: fill-box; animation: es18nPulse 2.6s ease-out infinite; }

        .es18n-grid { display: grid; grid-template-columns: minmax(0, 1.55fr) minmax(0, 1fr) minmax(0, 1fr); gap: 14px; align-items: stretch; }
        @media (max-width: 1100px) { .es18n-grid { grid-template-columns: 1fr 1fr; } .es18n-map { grid-column: 1 / -1; } }
        @media (max-width: 680px) { .es18n-grid { grid-template-columns: 1fr; } }

        .es18n-card { border-radius: 18px; padding: clamp(20px, 1.8vw, 26px); display: flex; flex-direction: column; position: relative; overflow: hidden; }

        .es18n-chip { display: inline-flex; align-items: center; gap: 8px; height: 40px; padding: 0 19px; border: 1.5px solid ${CARBON}; border-radius: 11px;
          color: ${INK}; font-size: 12.5px; font-weight: 800; letter-spacing: 0.05em; text-transform: uppercase; text-decoration: none;
          background: #fff; transition: background 0.15s, color 0.15s, gap 0.16s; align-self: flex-start; }
        .es18n-chip:hover { background: ${CARBON}; color: ${YELLOW}; gap: 12px; }

        .es18n-cta { display: inline-flex; align-items: center; justify-content: center; gap: 9px; background: ${CARBON}; color: ${YELLOW}; text-decoration: none;
          font-size: 13px; font-weight: 800; letter-spacing: 0.06em; text-transform: uppercase; padding: 14px 24px; border-radius: 11px;
          transition: background 0.16s, gap 0.18s, transform 0.15s; align-self: flex-start; }
        .es18n-cta:hover { background: ${CARBON_DK}; gap: 13px; transform: translateY(-2px); }

        .es18n-tel { text-decoration: none; transition: opacity 0.15s; }
        .es18n-tel:hover { opacity: 0.85; }
      `}</style>

      <div style={{ maxWidth: 1420, margin: "0 auto", padding: "0 28px" }}>
        <div className="es18n-grid">
          {/* ═══ MAPA SÍTĚ ═══ */}
          <div className="es18n-card es18n-map" style={{ background: "#fff", border: `1.5px solid ${LINE}` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span aria-hidden="true" style={{ width: 10, height: 24, background: YELLOW, transform: "skewX(-14deg)", flexShrink: 0 }} />
              <GenericEditableText sectionId={sectionId} field="map.heading" value={String(map.heading ?? "Prodejní a servisní síť")} tag="h2" style={{
                fontFamily: HEAD, fontWeight: 900, fontStyle: "italic", fontStretch: "115%", fontSize: "clamp(19px, 1.7vw, 24px)",
                letterSpacing: "0.01em", textTransform: "uppercase", color: INK, margin: 0,
              }} />
            </div>
            {map.text && <p style={{ margin: "10px 0 0", fontSize: 14, lineHeight: 1.55, color: MUTED, maxWidth: 520 }}>{map.text}</p>}

            {stats.length > 0 && (
              <div style={{ display: "flex", gap: "clamp(18px, 2.4vw, 40px)", margin: "16px 0 4px", flexWrap: "wrap" }}>
                {stats.slice(0, 3).map((st) => (
                  <span key={st.label} style={{ display: "inline-flex", flexDirection: "column", lineHeight: 1 }}>
                    <span style={{ fontFamily: HEAD, fontWeight: 900, fontStyle: "italic", fontStretch: "112%", fontSize: "clamp(22px, 2vw, 28px)", color: INK }}>{st.value}</span>
                    <span style={{ marginTop: 5, fontSize: 11.5, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: MUTED }}>{st.label}</span>
                  </span>
                ))}
              </div>
            )}

            <div style={{ margin: "14px 0 16px", borderRadius: 14, overflow: "hidden", border: `1px solid ${LINE}`, background: "#fafaf8" }}>
              <svg viewBox="0 0 180 90" style={{ display: "block", width: "100%", height: "auto" }} role="img" aria-label="Mapa prodejní a servisní sítě po celé ČR">
                <defs>
                  <pattern id="es18nGrid" width="10" height="10" patternUnits="userSpaceOnUse">
                    <path d="M 10 0 L 0 0 0 10" fill="none" stroke="#ebebe6" strokeWidth="0.5" />
                  </pattern>
                </defs>
                <rect width="180" height="90" fill="url(#es18nGrid)" />
                <path
                  d="M 18 38 C 14 28 22 18 34 16 C 44 10 58 8 70 12 C 84 8 104 10 116 16 C 130 14 146 20 152 30 C 162 34 166 44 160 52 C 156 62 144 66 132 64 C 124 72 108 76 96 70 C 84 76 66 74 56 66 C 42 68 28 62 24 52 C 18 48 16 44 18 38 Z"
                  fill="#eceae4" stroke="#d8d6cd" strokeWidth="1"
                />
                {cities.map((ct) => (
                  <g key={ct.label}>
                    <circle cx={ct.x} cy={ct.y} r="1.6" fill="#8a8e95" />
                    <text x={ct.x + 3.5} y={ct.y + 1.5} fontSize="5.5" fontFamily={SANS} fontWeight="600" fill="#7d8188">{ct.label}</text>
                  </g>
                ))}
                {pins.map((p, pi) => (
                  <g key={pi}>
                    <circle className="es18n-pin-ring" cx={p.x} cy={p.y} r="4.5" fill="none" stroke="#d4af00" strokeWidth="0.9" style={{ animationDelay: `${(pi % 5) * 0.5}s` }} />
                    <circle cx={p.x} cy={p.y} r="3.4" fill={CARBON} />
                    <path transform={`translate(${p.x - 1.7}, ${p.y - 2.1}) scale(0.18)`} d="M13 2 4.5 13.5h6L10 22l8.5-11.5h-6L13 2Z" fill={YELLOW} />
                  </g>
                ))}
              </svg>
            </div>

            {map.linkText && (
              <a href={resolve(map.href ?? "/obchod")} className="es18n-chip" style={{ marginTop: "auto" }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 21s-7-5.5-7-11a7 7 0 0 1 14 0c0 5.5-7 11-7 11Z"/><circle cx="12" cy="10" r="2.6"/></svg>
                {map.linkText}
              </a>
            )}
          </div>

          {/* ═══ ZÁKAZNICKÁ LINKA ═══ */}
          <div className="es18n-card" style={{ background: CARBON }}>
            <span aria-hidden="true" style={{ position: "absolute", right: -22, bottom: -40, opacity: 0.08, pointerEvents: "none", transform: "rotate(10deg)" }}>
              <Es18nMark height={170} />
            </span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 7, fontSize: 11.5, fontWeight: 800, letterSpacing: "0.16em", textTransform: "uppercase", color: YELLOW }}>
              <span style={{ width: 7, height: 7, borderRadius: 999, background: YELLOW, boxShadow: "0 0 0 3px rgba(255,212,0,0.22)" }} />
              {phone.kicker ?? "Zákaznická linka"}
            </span>
            {phone.image && (
              <img src={phone.image} alt="" loading="lazy" style={{ width: 58, height: 58, borderRadius: 999, objectFit: "cover", border: `2.5px solid ${YELLOW}`, marginTop: 16 }} />
            )}
            {phone.number && (
              <a href={`tel:${phone.number.replace(/\s/g, "")}`} className="es18n-tel" style={{ marginTop: 13, fontFamily: HEAD, fontWeight: 900, fontStyle: "italic", fontStretch: "112%", fontSize: "clamp(24px, 2vw, 30px)", lineHeight: 1, color: "#fff", letterSpacing: "0.01em" }}>{phone.number}</a>
            )}
            {phone.hours && <span style={{ marginTop: 8, fontSize: 12.5, fontWeight: 700, color: "rgba(255,255,255,0.55)" }}>{phone.hours}</span>}
            {phone.text && <p style={{ margin: "12px 0 0", fontSize: 13.5, lineHeight: 1.55, color: "rgba(255,255,255,0.72)", maxWidth: 280 }}>{phone.text}</p>}
          </div>

          {/* ═══ REGISTRACE ═══ */}
          <div className="es18n-card" style={{ background: YELLOW }}>
            <span aria-hidden="true" style={{ position: "absolute", right: -30, top: -42, fontFamily: HEAD, fontWeight: 900, fontStyle: "italic", fontStretch: "115%", fontSize: 150, lineHeight: 1, color: "rgba(19,20,23,0.06)", pointerEvents: "none", userSelect: "none" }}>%</span>
            <span style={{ fontSize: 11.5, fontWeight: 800, letterSpacing: "0.16em", textTransform: "uppercase", color: "rgba(19,20,23,0.6)" }}>{register.kicker ?? "Oktan výhody"}</span>
            <span style={{ marginTop: 10, fontFamily: HEAD, fontWeight: 900, fontStyle: "italic", fontStretch: "112%", fontSize: "clamp(19px, 1.6vw, 23px)", lineHeight: 1.12, textTransform: "uppercase", color: CARBON, maxWidth: 280 }}>{register.title}</span>
            {(register.benefits ?? []).length > 0 && (
              <ul style={{ listStyle: "none", margin: "14px 0 18px", padding: 0, display: "flex", flexDirection: "column", gap: 8 }}>
                {(register.benefits ?? []).slice(0, 4).map((btext) => (
                  <li key={btext} style={{ display: "flex", alignItems: "flex-start", gap: 9, fontSize: 13.5, fontWeight: 600, lineHeight: 1.4, color: "rgba(19,20,23,0.82)" }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={CARBON} strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 2 }}><path d="m4.5 12.5 5 5 10-11"/></svg>
                    {btext}
                  </li>
                ))}
              </ul>
            )}
            {register.ctaText && (
              <a href={resolve(register.href ?? "/obchod")} className="es18n-cta" style={{ marginTop: "auto" }}>
                {register.ctaText}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function Es18nMark({ height = 20 }: { height?: number }) {
  const w = Math.round(height * 0.86);
  return (
    <svg width={w} height={height} viewBox="0 0 26 30" aria-hidden="true" style={{ display: "block" }}>
      <path d="M7 0h19l-7 30H0L7 0Z" fill="#ffffff" />
      <path d="M15.4 4.5 9 16.6h4.2l-2.4 8.9 7.6-12.7h-4.3l3.3-8.3h-2Z" fill="#131417" />
    </svg>
  );
}

// ── eshop-20-tiles ──────────────────────────────────────────────────────────────
// Vykuk — dedoles.cz DNA: 4 promo dlaždice výprodejů (DÁMSKÝ / PÁNSKÝ / PRO DĚTI
// / POMOCNÍK S DÁRKY): foto nahoře (hover zoom), kakaový label bar dole s Baloo
// uppercase textem + šipkou vysouvající se na hover, červený rotovaný sticker
// „−70 %“ (červená jen slevy). Hover lift + stín. Mobil: grid 2 sloupce.
// ──────────────────────────────────────────────────────────────────────────────
type Es20Tile = { label?: string; badge?: string; href?: string; img?: string };

function TilesEshop20({ content, sectionId, tenantSlug, isAdmin }: { content: Record<string, unknown>; sectionId: number; tenantSlug?: string; isAdmin: boolean }) {
  const HEAD = "'Baloo 2', 'Arial Rounded MT Bold', sans-serif";
  const SANS = "'Figtree', 'Segoe UI', system-ui, sans-serif";
  const COCOA = "#4b2413";
  const COCOA_DK = "#38190c";
  const CREAM = "#fdf8f0";
  const RED = "#e03131";

  const siteMode = String(content.siteMode ?? "multipage");
  const resolve = (href: string) => resolveNavHref(href, siteMode, tenantSlug, isAdmin);

  const tiles = ((content.tiles as Es20Tile[]) ?? []).slice(0, 4);
  if (!tiles.length) return null;

  return (
    <section data-variant="eshop-20-tiles" style={{ fontFamily: SANS, background: CREAM, padding: "clamp(28px, 4vw, 52px) 0 10px" }}>
      <style>{`
        .es20t-card { position: relative; display: block; text-decoration: none; border-radius: 22px; overflow: hidden; background: #fff;
          box-shadow: 0 2px 10px rgba(56,25,12,0.07); transition: transform 0.2s cubic-bezier(0.16,1,0.3,1), box-shadow 0.2s; }
        .es20t-card:hover { transform: translateY(-5px); box-shadow: 0 18px 36px rgba(56,25,12,0.16); }
        .es20t-card img { transition: transform 0.5s cubic-bezier(0.16,1,0.3,1); }
        .es20t-card:hover img { transform: scale(1.06); }
        .es20t-bar { display: flex; align-items: center; justify-content: center; gap: 8px; background: ${COCOA}; min-height: 74px; padding: 12px 16px; transition: background 0.18s; }
        .es20t-card:hover .es20t-bar { background: ${COCOA_DK}; }
        .es20t-arrow { display: inline-flex; width: 0; overflow: hidden; opacity: 0; transform: translateX(-6px); transition: width 0.2s cubic-bezier(0.16,1,0.3,1), opacity 0.18s, transform 0.2s; color: #f6a7d7; }
        .es20t-card:hover .es20t-arrow { width: 17px; opacity: 1; transform: translateX(0); }
      `}</style>
      <div className="px-4 md:px-7" style={{ maxWidth: 1420, margin: "0 auto" }}>
        {content.heading ? (
          <div style={{ textAlign: "center", margin: "0 0 18px" }}>
            <GenericEditableText sectionId={sectionId} field="heading" value={String(content.heading)} tag="h2" style={{
              display: "inline-block", fontFamily: HEAD, fontWeight: 800, fontSize: "clamp(21px, 2.2vw, 30px)",
              letterSpacing: "0.03em", textTransform: "uppercase", color: COCOA, margin: 0, paddingBottom: 10,
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='5' viewBox='0 0 20 5'%3E%3Cpath d='M0 3.5c2.5 0 2.5-2.5 5-2.5s2.5 2.5 5 2.5 2.5-2.5 5-2.5 2.5 2.5 5 2.5' fill='none' stroke='%23f6a7d7' stroke-width='1.8' stroke-linecap='round'/%3E%3C/svg%3E")`,
              backgroundRepeat: "repeat-x", backgroundPosition: "center bottom",
            }} />
          </div>
        ) : null}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-5">
          {tiles.map((t, i) => (
            <a key={i} href={resolve(t.href ?? "/obchod")} className="es20t-card">
              <div className="aspect-[4/3] sm:aspect-[1/1.02]" style={{ position: "relative", overflow: "hidden", background: "#efe4d5" }}>
                {t.img && <img src={t.img} alt={t.label ?? ""} loading="lazy" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", display: "block" }} />}
                {t.badge && (
                  <span style={{ position: "absolute", top: 14, right: 12, background: RED, color: "#fff", fontFamily: HEAD, fontWeight: 800, fontSize: "clamp(13px, 1.2vw, 16px)", letterSpacing: "0.03em", padding: "6px 13px", borderRadius: 12, transform: "rotate(6deg)", boxShadow: "0 6px 16px rgba(224,49,49,0.35)" }}>{t.badge}</span>
                )}
              </div>
              <div className="es20t-bar">
                <span style={{ fontFamily: HEAD, fontWeight: 800, fontSize: "clamp(13.5px, 1.25vw, 17px)", lineHeight: 1.2, letterSpacing: "0.05em", textTransform: "uppercase", color: "#fff", textAlign: "center" }}>{t.label}</span>
                <span className="es20t-arrow">
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
                </span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── eshop-20-links ──────────────────────────────────────────────────────────────
// Vykuk (dedoles.cz DNA): story odkazy — 4 krémové karty (VYKUK PŘÍBĚH /
// UDRŽITELNOST / VYKUK POMÁHÁ / VYKUK DROBNÉ): line ikona v bílém kruhu vlevo
// + Baloo uppercase label, hover lift + růžový kruh. Demo odkazy. Mobil 2 sloupce.
// ──────────────────────────────────────────────────────────────────────────────
type Es20Link = { label?: string; icon?: string; href?: string };

function Es20LinkIcon({ name, size = 22 }: { name?: string; size?: number }) {
  const p = { width: size, height: size, viewBox: "0 0 24 24", fill: "none" as const, stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true as const };
  switch (name) {
    case "story": return (<svg {...p}><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15.5H6.5A2.5 2.5 0 0 0 4 21V5.5Z"/><path d="M20 18.5v2.5H6.5A2.5 2.5 0 0 1 4 18.5"/><path d="M9 8h7M9 11.5h5"/></svg>);
    case "leaf": return (<svg {...p}><path d="M5 20c0-8 4-14 14-15-.5 10-6 14-12 14"/><path d="M5 20c2-5 6-9 11-11"/></svg>);
    case "help": return (<svg {...p}><path d="M12 20.5s-8-4.9-8-11a4.6 4.6 0 0 1 8-3.1 4.6 4.6 0 0 1 8 3.1c0 6.1-8 11-8 11Z"/><path d="M8.5 12h2l1-2 1.5 3.5 1-1.5h1.5"/></svg>);
    case "coins": return (<svg {...p}><ellipse cx="12" cy="6.5" rx="7" ry="3"/><path d="M5 6.5v5c0 1.7 3.1 3 7 3s7-1.3 7-3v-5"/><path d="M5 11.5v5c0 1.7 3.1 3 7 3s7-1.3 7-3v-5"/></svg>);
    default: return (<svg {...p}><circle cx="12" cy="12" r="9"/></svg>);
  }
}

function LinksEshop20({ content, tenantSlug, isAdmin }: { content: Record<string, unknown>; sectionId: number; tenantSlug?: string; isAdmin: boolean }) {
  const HEAD = "'Baloo 2', 'Arial Rounded MT Bold', sans-serif";
  const SANS = "'Figtree', 'Segoe UI', system-ui, sans-serif";
  const COCOA = "#4b2413";
  const PINK = "#f6a7d7";
  const CREAM = "#fdf8f0";
  const LINE = "#efe4d5";

  const siteMode = String(content.siteMode ?? "multipage");
  const resolve = (href: string) => resolveNavHref(href, siteMode, tenantSlug, isAdmin);

  const links = ((content.links as Es20Link[]) ?? []).slice(0, 4);
  if (!links.length) return null;

  return (
    <section data-variant="eshop-20-links" style={{ fontFamily: SANS, background: CREAM, padding: "clamp(10px, 1.6vw, 22px) 0 clamp(22px, 3vw, 40px)" }}>
      <style>{`
        .es20l-card { display: flex; align-items: center; gap: 13px; background: #fff; border: 1.5px solid ${LINE}; border-radius: 18px; padding: 17px 19px;
          text-decoration: none; transition: transform 0.18s cubic-bezier(0.16,1,0.3,1), box-shadow 0.2s, border-color 0.18s; }
        .es20l-card:hover { transform: translateY(-3px); box-shadow: 0 14px 28px rgba(56,25,12,0.11); border-color: ${PINK}; }
        .es20l-icon { width: 44px; height: 44px; border-radius: 999px; background: ${CREAM}; color: ${COCOA}; display: inline-flex; align-items: center; justify-content: center;
          flex-shrink: 0; transition: background 0.16s; }
        .es20l-card:hover .es20l-icon { background: ${PINK}; }
      `}</style>
      <div className="px-4 md:px-7" style={{ maxWidth: 1420, margin: "0 auto" }}>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-5">
          {links.map((l, i) => (
            <a key={i} href={l.href ? resolve(l.href) : "#"} onClick={l.href ? undefined : (e) => e.preventDefault()} className="es20l-card">
              <span className="es20l-icon"><Es20LinkIcon name={l.icon} /></span>
              <span style={{ fontFamily: HEAD, fontWeight: 700, fontSize: "clamp(13px, 1.15vw, 15.5px)", letterSpacing: "0.05em", textTransform: "uppercase", color: COCOA, lineHeight: 1.25 }}>{l.label}</span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── eshop-20-linkhub ────────────────────────────────────────────────────────────
// Vykuk (dedoles.cz DNA „Top kategorie" link hub nad footerem): bílý pás,
// centrovaný Baloo nadpis s vlnitým podtrhem, 4 sloupce (Ženské / Pánské /
// Dětské kategorie / Kolekce) — Baloo uppercase titulek sloupce + podtržené
// odkazy s hover posunem. Mobil: 2 sloupce.
// ──────────────────────────────────────────────────────────────────────────────
type Es20HubColumn = { title?: string; links?: Array<{ label: string; href?: string; slug?: string }> };

function LinkHubEshop20({ content, sectionId, tenantSlug, isAdmin }: { content: Record<string, unknown>; sectionId: number; tenantSlug?: string; isAdmin: boolean }) {
  const HEAD = "'Baloo 2', 'Arial Rounded MT Bold', sans-serif";
  const SANS = "'Figtree', 'Segoe UI', system-ui, sans-serif";
  const COCOA = "#4b2413";
  const INK = "#3c2010";
  const LINE = "#efe4d5";

  const siteMode = String(content.siteMode ?? "multipage");
  const resolve = (href: string) => resolveNavHref(href, siteMode, tenantSlug, isAdmin);
  const linkHref = (l: { href?: string; slug?: string }) => l.href ? resolve(l.href) : resolve(l.slug ? `/obchod?kategorie=${l.slug}` : "/obchod");

  const heading = String(content.heading ?? "Top kategorie");
  const columns = ((content.columns as Es20HubColumn[]) ?? []).slice(0, 4);
  if (!columns.length) return null;

  return (
    <section data-variant="eshop-20-linkhub" style={{ fontFamily: SANS, background: "#fff", padding: "clamp(34px, 4.5vw, 60px) 0 clamp(30px, 4vw, 52px)", borderTop: `1px solid ${LINE}` }}>
      <style>{`
        .es20lh-link { display: inline-block; padding: 5.5px 0; font-size: 14px; font-weight: 600; color: ${INK}; text-decoration: underline;
          text-decoration-color: rgba(75,36,19,0.28); text-underline-offset: 4px; transition: color 0.14s, text-decoration-color 0.14s, padding-left 0.16s; }
        .es20lh-link:hover { color: #e0559f; text-decoration-color: #f6a7d7; padding-left: 4px; }
      `}</style>
      <div className="px-4 md:px-7" style={{ maxWidth: 1180, margin: "0 auto" }}>
        <div style={{ textAlign: "center", margin: "0 0 26px" }}>
          <GenericEditableText sectionId={sectionId} field="heading" value={heading} tag="h2" style={{
            display: "inline-block", fontFamily: HEAD, fontWeight: 800, fontSize: "clamp(21px, 2.2vw, 30px)",
            letterSpacing: "0.03em", textTransform: "uppercase", color: COCOA, margin: 0, paddingBottom: 10,
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='5' viewBox='0 0 20 5'%3E%3Cpath d='M0 3.5c2.5 0 2.5-2.5 5-2.5s2.5 2.5 5 2.5 2.5-2.5 5-2.5 2.5 2.5 5 2.5' fill='none' stroke='%23f6a7d7' stroke-width='1.8' stroke-linecap='round'/%3E%3C/svg%3E")`,
            backgroundRepeat: "repeat-x", backgroundPosition: "center bottom",
          }} />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-8">
          {columns.map((col, i) => (
            <div key={i}>
              <div style={{ fontFamily: HEAD, fontWeight: 700, fontSize: 14.5, letterSpacing: "0.07em", textTransform: "uppercase", color: COCOA, marginBottom: 10 }}>{col.title}</div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
                {(col.links ?? []).slice(0, 8).map((l) => (
                  <a key={l.label} href={linkHref(l)} className="es20lh-link">{l.label}</a>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── artist-01-album (Poslední album) ─────────────────────────────────────────────
// 1:1 luciebila.com #newAlbum layout: h2 color-red centered, 3 sloupce —
// albumCover (left) + albumInfo (perex + red pill "Celé album") + albumPlay
// (play icon + "Přehrát ukázku"). Elevace na award level: cover 3D tilt + garnet
// glow + vinyl kotouč vyjíždějící zpoza obalu při hoveru, animated equalizer
// u play tlačítka, spinning vinyl na play ikoně, jemné reveal.
// ─────────────────────────────────────────────────────────────────────────────
function AlbumArtist01({ content, sectionId, tenantSlug, isAdmin }: { content: Record<string, unknown>; sectionId: number; tenantSlug?: string; isAdmin: boolean }) {
  const siteMode = String(content.siteMode ?? "multipage");
  const resolve  = (href: string) => resolveNavHref(href, siteMode, tenantSlug, isAdmin);

  const eyebrow   = String(content.eyebrow ?? "Nové album");
  const title     = String(content.title ?? "Poslední album");
  const albumName = String(content.albumName ?? "Střepy a světlo");
  const year      = String(content.year ?? "2026");
  const perex     = String(content.perex ?? "Deset písní o pádech a návratech. Viktorie Lánská se na svém pátém studiovém albu vrací k tomu nejosobnějšímu — křehké klavírní balady se střídají s velkými symfonickými vrcholy. Nahráno s Českým národním orchestrem v pražském Rudolfinu, s texty, které píše sama.");
  const cover     = String(content.coverImage ?? "/templates/artist-01/album-cover.webp");
  const coverAlt  = String(content.coverAlt ?? `Obal alba ${albumName}`);
  const ctaText   = String(content.ctaText ?? "Celé album");
  const ctaHref   = String(content.ctaHref ?? "/diskografie");
  const playText  = String(content.playText ?? "Přehrát ukázku");
  const playHref  = String(content.playHref ?? "/diskografie");

  const RED = "#9b1c31";

  return (
    <>
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;1,500&family=Roboto:wght@300;400;500;700&display=swap" />
      <style>{`
        .ar01-album {
          background: #fff;
          padding: 96px 40px;
        }
        .ar01-album-wrap { max-width: 1180px; margin: 0 auto; }
        .ar01-album-eyebrow {
          display: block; text-align: center;
          font-family: 'Roboto', sans-serif;
          font-size: 13px; font-weight: 500; letter-spacing: .34em; text-transform: uppercase;
          color: ${RED}; margin-bottom: 14px;
        }
        .ar01-album-h2 {
          text-align: center;
          font-family: 'Cormorant Garamond', Georgia, serif;
          font-size: clamp(38px, 5vw, 60px); font-weight: 600; font-style: italic;
          color: #14100e; margin: 0 0 8px; line-height: 1.02;
        }
        .ar01-album-rule {
          width: 64px; height: 2px; background: ${RED};
          margin: 20px auto 64px; opacity: .85;
        }
        .ar01-album-grid {
          display: grid;
          grid-template-columns: minmax(300px, 400px) 1fr 220px;
          gap: 56px;
          align-items: center;
        }
        /* COVER */
        .ar01-album-cover {
          position: relative;
          perspective: 1200px;
        }
        .ar01-album-cover-inner {
          position: relative;
          display: block;
          transition: transform .6s cubic-bezier(.32,.72,0,1), box-shadow .6s cubic-bezier(.32,.72,0,1);
          transform-style: preserve-3d;
          box-shadow: 0 26px 60px -26px rgba(20,16,14,.55);
          z-index: 2;
        }
        .ar01-album-cover-inner img {
          display: block; width: 100%; height: auto; aspect-ratio: 1/1; object-fit: cover;
        }
        .ar01-album-cover-frame {
          position: absolute; inset: 0;
          box-shadow: inset 0 0 0 1px rgba(255,255,255,.14);
          pointer-events: none; z-index: 3;
        }
        .ar01-album-vinyl {
          position: absolute;
          top: 50%; right: 6%;
          width: 82%; aspect-ratio: 1/1;
          border-radius: 50%;
          background:
            radial-gradient(circle at center, #1a1a1a 0 18%, #0c0c0c 18.5% 20%, #161616 20.5% 26%, #0c0c0c 26.5% 28%, #171717 28.5% 40%, #0d0d0d 40.5% 42%, #151515 42.5% 100%);
          transform: translate(0, -50%) translateX(0);
          transition: transform .7s cubic-bezier(.32,.72,0,1);
          z-index: 1;
          box-shadow: 0 20px 44px -18px rgba(0,0,0,.6);
        }
        .ar01-album-vinyl::after {
          content: ""; position: absolute; top: 50%; left: 50%;
          width: 30%; aspect-ratio: 1/1; border-radius: 50%;
          transform: translate(-50%, -50%);
          background: ${RED};
          box-shadow: inset 0 0 0 3px rgba(255,255,255,.15);
        }
        .ar01-album-cover:hover .ar01-album-cover-inner {
          transform: rotateY(-8deg) rotateX(2deg) translateZ(10px);
          box-shadow: 0 40px 80px -28px rgba(20,16,14,.6);
        }
        .ar01-album-cover:hover .ar01-album-vinyl {
          transform: translate(0, -50%) translateX(38%) rotate(22deg);
          animation: ar01Spin 8s linear infinite .1s;
        }
        @keyframes ar01Spin { to { transform: translate(0,-50%) translateX(38%) rotate(382deg); } }
        /* INFO */
        .ar01-album-info { text-align: left; }
        .ar01-album-name {
          font-family: 'Cormorant Garamond', Georgia, serif;
          font-size: clamp(30px, 3.4vw, 44px); font-weight: 600; font-style: italic;
          color: #14100e; margin: 0 0 6px; line-height: 1.05;
        }
        .ar01-album-year {
          display: inline-block;
          font-family: 'Roboto', sans-serif; font-size: 13px; font-weight: 500;
          letter-spacing: .28em; text-transform: uppercase; color: ${RED};
          margin-bottom: 26px;
        }
        .ar01-album-perex {
          font-family: 'Roboto', sans-serif;
          font-size: 17px; line-height: 30px; font-weight: 400; color: #4b423d;
          margin: 0 0 34px; max-width: 460px;
        }
        .ar01-album-btn {
          position: relative; overflow: hidden;
          display: inline-block;
          font-family: 'Roboto', sans-serif; font-size: 15px; font-weight: 700;
          letter-spacing: .14em; text-transform: uppercase;
          color: #fff; text-decoration: none;
          padding: 15px 40px; border-radius: 50px;
          background: ${RED};
          transition: color .4s cubic-bezier(.32,.72,0,1), box-shadow .4s cubic-bezier(.32,.72,0,1);
          box-shadow: 0 12px 26px -12px rgba(155,28,49,.7);
        }
        .ar01-album-btn::before {
          content: ""; position: absolute; inset: 0; background: #14100e;
          transform: translateX(-101%); transition: transform .45s cubic-bezier(.32,.72,0,1); z-index: -1;
        }
        .ar01-album-btn:hover { box-shadow: 0 16px 34px -12px rgba(20,16,14,.55); }
        .ar01-album-btn:hover::before { transform: translateX(0); }
        /* PLAY */
        .ar01-album-play { text-align: center; }
        .ar01-album-play a {
          display: inline-flex; flex-direction: column; align-items: center; gap: 20px;
          text-decoration: none; color: #14100e;
          transition: color .3s linear;
        }
        .ar01-album-play a:hover { color: ${RED}; }
        .ar01-album-disc {
          position: relative;
          width: 96px; height: 96px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          border: 1.5px solid rgba(20,16,14,.16);
          transition: border-color .4s cubic-bezier(.32,.72,0,1), transform .5s cubic-bezier(.32,.72,0,1);
        }
        .ar01-album-play a:hover .ar01-album-disc { border-color: ${RED}; transform: scale(1.06); }
        .ar01-album-disc::before {
          content: ""; position: absolute; inset: 0; border-radius: 50%;
          border: 1.5px solid ${RED};
          transform: scale(1); opacity: 0;
          transition: transform .6s cubic-bezier(.32,.72,0,1), opacity .6s;
        }
        .ar01-album-play a:hover .ar01-album-disc::before { animation: ar01Ripple 1.6s ease-out infinite; }
        @keyframes ar01Ripple { 0% { transform: scale(1); opacity: .6; } 100% { transform: scale(1.4); opacity: 0; } }
        .ar01-album-disc svg { transition: transform .4s cubic-bezier(.32,.72,0,1); }
        .ar01-album-play a:hover .ar01-album-disc svg { transform: scale(1.12); }
        .ar01-album-play span {
          font-family: 'Roboto', sans-serif; font-size: 16px; font-weight: 500;
          letter-spacing: .04em;
        }
        .ar01-album-eq { display: inline-flex; align-items: flex-end; gap: 3px; height: 14px; }
        .ar01-album-eq i {
          width: 2.5px; background: currentColor; border-radius: 2px;
          animation: ar01Eq 1s ease-in-out infinite;
        }
        .ar01-album-eq i:nth-child(1){ height: 40%; animation-delay: 0s; }
        .ar01-album-eq i:nth-child(2){ height: 100%; animation-delay: .2s; }
        .ar01-album-eq i:nth-child(3){ height: 60%; animation-delay: .4s; }
        .ar01-album-eq i:nth-child(4){ height: 85%; animation-delay: .1s; }
        @keyframes ar01Eq { 0%,100% { transform: scaleY(.4); } 50% { transform: scaleY(1); } }
        @media (max-width: 1000px) {
          .ar01-album-grid { grid-template-columns: 1fr; gap: 44px; max-width: 460px; margin: 0 auto; }
          .ar01-album-cover { max-width: 380px; margin: 0 auto; }
          .ar01-album-info { text-align: center; }
          .ar01-album-perex { margin-left: auto; margin-right: auto; }
        }
        @media (max-width: 560px) {
          .ar01-album { padding: 64px 22px; }
        }
        @media (prefers-reduced-motion: reduce) {
          .ar01-album-vinyl, .ar01-album-eq i, .ar01-album-disc::before { animation: none !important; }
        }
      `}</style>

      <section className="ar01-album" data-template="artist-01" id="album">
        <div className="ar01-album-wrap">
          <GenericEditableText sectionId={sectionId} field="eyebrow" value={eyebrow} tag="span" className="ar01-album-eyebrow" />
          <GenericEditableText sectionId={sectionId} field="title" value={title} tag="h2" className="ar01-album-h2" />
          <div className="ar01-album-rule" aria-hidden="true" />

          <div className="ar01-album-grid">
            {/* COVER */}
            <div className="ar01-album-cover">
              <span className="ar01-album-vinyl" aria-hidden="true" />
              <GenericEditableImage sectionId={sectionId} field="coverImage" src={cover} alt={coverAlt} className="ar01-album-cover-inner">
                <img src={cover} alt={coverAlt} />
                <span className="ar01-album-cover-frame" aria-hidden="true" />
              </GenericEditableImage>
            </div>

            {/* INFO */}
            <div className="ar01-album-info">
              <GenericEditableText sectionId={sectionId} field="albumName" value={albumName} tag="h3" className="ar01-album-name" />
              <GenericEditableText sectionId={sectionId} field="year" value={year} tag="span" className="ar01-album-year" />
              <GenericEditableText sectionId={sectionId} field="perex" value={perex} tag="p" className="ar01-album-perex" />
              <a href={resolve(ctaHref)} className="ar01-album-btn">
                <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span">{ctaText}</GenericEditableText>
              </a>
            </div>

            {/* PLAY */}
            <div className="ar01-album-play">
              <a href={resolve(playHref)}>
                <span className="ar01-album-disc" aria-hidden="true">
                  <svg width="30" height="30" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5.14v13.72a1 1 0 0 0 1.5.86l11-6.86a1 1 0 0 0 0-1.72l-11-6.86A1 1 0 0 0 8 5.14z" /></svg>
                </span>
                <span>
                  <GenericEditableText sectionId={sectionId} field="playText" value={playText} tag="span">{playText}</GenericEditableText>
                </span>
                <span className="ar01-album-eq" aria-hidden="true"><i /><i /><i /><i /></span>
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

// ── artist-01-instagram (Instagram feed) ─────────────────────────────────────────
// 1:1 luciebila.com #instagramFeed: edge-to-edge row 4 čtvercových dlaždic,
// hover overlay reveal s granátovou IG ikonou. Elevace: image zoom 1.08,
// granátový gradient overlay, IG handle + ikona slide-up, jemný "@" caption.
// Nadpis "Sledujte mě" nad stripem.
// ─────────────────────────────────────────────────────────────────────────────
type Ar01Insta = { image?: string; href?: string; alt?: string };

function InstagramArtist01({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const eyebrowRaw = (content as Record<string, unknown>).eyebrow;
  const titleRaw   = (content as Record<string, unknown>).title;
  const eyebrow = eyebrowRaw === undefined ? "Instagram" : String(eyebrowRaw);
  const title   = titleRaw   === undefined ? "Sledujte mě" : String(titleRaw);
  const showHeader = !!(eyebrow.trim() || title.trim());

  const handle   = String(content.handle ?? "@viktorielanska");
  const profile  = String(content.profileHref ?? "https://instagram.com/demo");

  const tiles = (content.tiles as Ar01Insta[]) ?? [
    { image: "/templates/artist-01/insta-1.webp", alt: "Portrét" },
    { image: "/templates/artist-01/insta-2.webp", alt: "V zákulisí" },
    { image: "/templates/artist-01/insta-3.webp", alt: "U klavíru" },
    { image: "/templates/artist-01/insta-4.webp", alt: "Vinyl" },
  ];

  const RED = "#9b1c31";

  return (
    <>
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;1,500&family=Roboto:wght@300;400;500;700&display=swap" />
      <style>{`
        .ar01-ig { background: #faf7f2; padding: 90px 0 0; }
        .ar01-ig-head { text-align: center; padding: 0 40px 46px; }
        .ar01-ig-eyebrow {
          display: inline-flex; align-items: center; gap: 9px;
          font-family: 'Roboto', sans-serif; font-size: 13px; font-weight: 500;
          letter-spacing: .34em; text-transform: uppercase; color: ${RED}; margin-bottom: 14px;
        }
        .ar01-ig-title {
          font-family: 'Cormorant Garamond', Georgia, serif; font-style: italic;
          font-size: clamp(34px, 4.4vw, 52px); font-weight: 600; color: #14100e; margin: 0 0 10px; line-height: 1.03;
        }
        .ar01-ig-handle {
          display: inline-block; font-family: 'Roboto', sans-serif; font-size: 15px; font-weight: 500;
          letter-spacing: .06em; color: #6b6258; text-decoration: none; transition: color .3s linear;
        }
        .ar01-ig-handle:hover { color: ${RED}; }
        .ar01-ig-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 0; }
        .ar01-ig-tile {
          position: relative; display: block; overflow: hidden; aspect-ratio: 1/1;
          background: #14100e; text-decoration: none;
        }
        .ar01-ig-tile img {
          width: 100%; height: 100%; object-fit: cover; display: block;
          transition: transform 1.1s cubic-bezier(.32,.72,0,1), filter 1.1s;
        }
        .ar01-ig-tile:hover img { transform: scale(1.09); filter: brightness(.55) saturate(1.05); }
        .ar01-ig-ov {
          position: absolute; inset: 0; z-index: 2;
          display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px;
          background: rgba(120,18,36,.34);
          opacity: 0; transition: opacity .45s cubic-bezier(.32,.72,0,1);
        }
        .ar01-ig-tile:hover .ar01-ig-ov { opacity: 1; }
        .ar01-ig-ov svg {
          color: #fff; transform: translateY(10px) scale(.85);
          transition: transform .5s cubic-bezier(.32,.72,0,1);
        }
        .ar01-ig-tile:hover .ar01-ig-ov svg { transform: translateY(0) scale(1); }
        .ar01-ig-ov span {
          font-family: 'Roboto', sans-serif; font-size: 13px; font-weight: 600; letter-spacing: .12em;
          color: #fff; opacity: 0; transform: translateY(8px);
          transition: opacity .5s cubic-bezier(.32,.72,0,1) .08s, transform .5s cubic-bezier(.32,.72,0,1) .08s;
        }
        .ar01-ig-tile:hover .ar01-ig-ov span { opacity: 1; transform: translateY(0); }
        @media (max-width: 900px) { .ar01-ig-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 560px) { .ar01-ig { padding-top: 62px; } }
      `}</style>

      <section className="ar01-ig" data-template="artist-01" id="instagram">
        {showHeader && (
          <div className="ar01-ig-head">
            <span className="ar01-ig-eyebrow">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5zm0 2a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3H7zm5 3.5A4.5 4.5 0 1 1 7.5 12 4.5 4.5 0 0 1 12 7.5zm0 2A2.5 2.5 0 1 0 14.5 12 2.5 2.5 0 0 0 12 9.5zM17.5 6a1 1 0 1 1-1 1 1 1 0 0 1 1-1z"/></svg>
              <GenericEditableText sectionId={sectionId} field="eyebrow" value={eyebrow} tag="span">{eyebrow}</GenericEditableText>
            </span>
            <GenericEditableText sectionId={sectionId} field="title" value={title} tag="h2" className="ar01-ig-title" />
            <br />
            <a href={profile} target="_blank" rel="noopener" className="ar01-ig-handle">
              <GenericEditableText sectionId={sectionId} field="handle" value={handle} tag="span">{handle}</GenericEditableText>
            </a>
          </div>
        )}

        <div className="ar01-ig-grid">
          {tiles.map((t, i) => (
            <a className="ar01-ig-tile" key={i} href={String(t.href ?? profile)} target="_blank" rel="noopener">
              <GenericEditableImage sectionId={sectionId} field={`tiles.${i}.image`} src={String(t.image ?? "")} alt={String(t.alt ?? "Instagram")} className="ar01-ig-imgwrap">
                <img src={String(t.image ?? "")} alt={String(t.alt ?? "Instagram")} />
              </GenericEditableImage>
              <span className="ar01-ig-ov" aria-hidden="true">
                <svg width="34" height="34" viewBox="0 0 24 24" fill="currentColor"><path d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5zm0 2a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3H7zm5 3.5A4.5 4.5 0 1 1 7.5 12 4.5 4.5 0 0 1 12 7.5zm0 2A2.5 2.5 0 1 0 14.5 12 2.5 2.5 0 0 0 12 9.5zM17.5 6a1 1 0 1 1-1 1 1 1 0 0 1 1-1z"/></svg>
                <span>{handle}</span>
              </span>
            </a>
          ))}
        </div>
      </section>
    </>
  );
}

// ── artist-01-discography (Diskografie) ──────────────────────────────────────────
// Grid alb: obal (hover zoom + play overlay + granátový rám), rok, titul,
// počet skladeb, "Poslechnout" link. Nejnovější album zvýrazněné. Award-level.
// ─────────────────────────────────────────────────────────────────────────────
type Ar01Album = { cover?: string; year?: string; title?: string; tracks?: string; href?: string; latest?: boolean };

function DiscographyArtist01({ content, sectionId, tenantSlug, isAdmin }: { content: Record<string, unknown>; sectionId: number; tenantSlug?: string; isAdmin: boolean }) {
  const siteMode = String(content.siteMode ?? "multipage");
  const resolve  = (href: string) => resolveNavHref(href, siteMode, tenantSlug, isAdmin);

  const eyebrowRaw = (content as Record<string, unknown>).eyebrow;
  const titleRaw   = (content as Record<string, unknown>).title;
  const subtitleRaw = (content as Record<string, unknown>).subtitle;
  const eyebrow = eyebrowRaw === undefined ? "Diskografie" : String(eyebrowRaw);
  const title   = titleRaw   === undefined ? "Alba" : String(titleRaw);
  const subtitle = subtitleRaw === undefined ? "" : String(subtitleRaw);
  const showHeader = !!(eyebrow.trim() || title.trim() || subtitle.trim());
  const listenLabel = String(content.listenLabel ?? "Poslechnout");
  const latestBadge = String(content.latestBadge ?? "Nové");

  const albums = (content.albums as Ar01Album[]) ?? [
    { cover:"/templates/artist-01/album-1.webp", year:"2026", title:"Střepy a světlo", tracks:"10 skladeb", href:"/diskografie", latest:true },
    { cover:"/templates/artist-01/album-2.webp", year:"2022", title:"Tichá řeka", tracks:"12 skladeb", href:"/diskografie" },
    { cover:"/templates/artist-01/album-3.webp", year:"2019", title:"Do tmy a zpět", tracks:"11 skladeb", href:"/diskografie" },
    { cover:"/templates/artist-01/album-4.webp", year:"2015", title:"Bílá místa", tracks:"13 skladeb", href:"/diskografie" },
    { cover:"/templates/artist-01/album-5.webp", year:"2011", title:"První ráno", tracks:"10 skladeb", href:"/diskografie" },
  ];

  const RED = "#9b1c31";

  return (
    <>
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;1,500&family=Roboto:wght@300;400;500;700&display=swap" />
      <style>{`
        .ar01-disc { background: #fff; padding: 96px 40px; }
        .ar01-disc-wrap { max-width: 1180px; margin: 0 auto; }
        .ar01-disc-head { text-align: center; margin-bottom: 58px; }
        .ar01-disc-eyebrow { display: block; font-family: 'Roboto', sans-serif; font-size: 13px; font-weight: 500; letter-spacing: .34em; text-transform: uppercase; color: ${RED}; margin-bottom: 14px; }
        .ar01-disc-title { font-family: 'Cormorant Garamond', Georgia, serif; font-style: italic; font-size: clamp(38px,5vw,60px); font-weight: 600; color: #14100e; margin: 0 0 14px; line-height: 1.02; }
        .ar01-disc-sub { font-family: 'Roboto', sans-serif; font-size: 17px; line-height: 28px; color: #6b6258; max-width: 560px; margin: 0 auto; }
        .ar01-disc-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 40px 34px; }
        .ar01-disc-card { text-align: left; }
        .ar01-disc-cover { position: relative; overflow: hidden; aspect-ratio: 1/1; background: #14100e; display: block; box-shadow: 0 22px 50px -30px rgba(20,16,14,.55); }
        .ar01-disc-cover img { width: 100%; height: 100%; object-fit: cover; display: block; transition: transform 1.1s cubic-bezier(.32,.72,0,1), filter 1.1s; }
        .ar01-disc-card:hover .ar01-disc-cover img { transform: scale(1.07); filter: brightness(.6); }
        .ar01-disc-cover::after { content: ""; position: absolute; inset: 0; box-shadow: inset 0 0 0 1px rgba(255,255,255,.1); pointer-events: none; }
        .ar01-disc-badge { position: absolute; top: 14px; left: 14px; z-index: 3; font-family: 'Roboto', sans-serif; font-size: 11px; font-weight: 700; letter-spacing: .18em; text-transform: uppercase; color: #fff; background: ${RED}; padding: 6px 12px; }
        .ar01-disc-play { position: absolute; inset: 0; z-index: 2; display: flex; align-items: center; justify-content: center; opacity: 0; transition: opacity .45s cubic-bezier(.32,.72,0,1); }
        .ar01-disc-card:hover .ar01-disc-play { opacity: 1; }
        .ar01-disc-play span { width: 66px; height: 66px; border-radius: 50%; border: 1.5px solid #fff; display: flex; align-items: center; justify-content: center; color: #fff; transform: scale(.8); transition: transform .5s cubic-bezier(.32,.72,0,1), background-color .4s, border-color .4s; }
        .ar01-disc-card:hover .ar01-disc-play span { transform: scale(1); }
        .ar01-disc-play span:hover { background: ${RED}; border-color: ${RED}; }
        .ar01-disc-year { font-family: 'Roboto', sans-serif; font-size: 12px; font-weight: 500; letter-spacing: .2em; text-transform: uppercase; color: ${RED}; margin: 20px 0 6px; }
        .ar01-disc-name { font-family: 'Cormorant Garamond', Georgia, serif; font-style: italic; font-size: 27px; font-weight: 600; color: #14100e; margin: 0 0 4px; line-height: 1.1; }
        .ar01-disc-tracks { font-family: 'Roboto', sans-serif; font-size: 14px; color: #9a8f84; margin: 0 0 12px; }
        .ar01-disc-listen { display: inline-flex; align-items: center; gap: 8px; font-family: 'Roboto', sans-serif; font-size: 13px; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; color: #14100e; text-decoration: none; border-bottom: 1.5px solid transparent; padding-bottom: 3px; transition: color .35s cubic-bezier(.32,.72,0,1), border-color .35s; }
        .ar01-disc-listen svg { transition: transform .35s cubic-bezier(.32,.72,0,1); }
        .ar01-disc-listen:hover { color: ${RED}; border-color: ${RED}; }
        .ar01-disc-listen:hover svg { transform: translateX(4px); }
        @media (max-width: 900px) { .ar01-disc-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 560px) { .ar01-disc { padding: 64px 22px; } .ar01-disc-grid { grid-template-columns: 1fr; max-width: 340px; margin: 0 auto; } }
      `}</style>

      <section className="ar01-disc" data-template="artist-01" id="diskografie">
        <div className="ar01-disc-wrap">
          {showHeader && (
            <div className="ar01-disc-head">
              <GenericEditableText sectionId={sectionId} field="eyebrow" value={eyebrow} tag="span" className="ar01-disc-eyebrow" />
              <GenericEditableText sectionId={sectionId} field="title" value={title} tag="h2" className="ar01-disc-title" />
              {subtitle.trim() && <GenericEditableText sectionId={sectionId} field="subtitle" value={subtitle} tag="p" className="ar01-disc-sub" />}
            </div>
          )}
          <div className="ar01-disc-grid">
            {albums.map((a, i) => (
              <div className="ar01-disc-card" key={i}>
                <a href={resolve(String(a.href ?? "/diskografie"))} className="ar01-disc-cover">
                  <GenericEditableImage sectionId={sectionId} field={`albums.${i}.cover`} src={String(a.cover ?? "")} alt={String(a.title ?? "")} className="ar01-disc-coverimg" style={{ position: "absolute", inset: 0 }}>
                    <img src={String(a.cover ?? "")} alt={String(a.title ?? "")} />
                  </GenericEditableImage>
                  {a.latest && <span className="ar01-disc-badge">{latestBadge}</span>}
                  <span className="ar01-disc-play" aria-hidden="true"><span><svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5.14v13.72a1 1 0 0 0 1.5.86l11-6.86a1 1 0 0 0 0-1.72l-11-6.86A1 1 0 0 0 8 5.14z"/></svg></span></span>
                </a>
                <div className="ar01-disc-year"><GenericEditableText sectionId={sectionId} field={`albums.${i}.year`} value={String(a.year ?? "")} tag="span">{a.year}</GenericEditableText></div>
                <GenericEditableText sectionId={sectionId} field={`albums.${i}.title`} value={String(a.title ?? "")} tag="h3" className="ar01-disc-name" />
                <GenericEditableText sectionId={sectionId} field={`albums.${i}.tracks`} value={String(a.tracks ?? "")} tag="p" className="ar01-disc-tracks" />
                <a href={resolve(String(a.href ?? "/diskografie"))} className="ar01-disc-listen">
                  {listenLabel}
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
