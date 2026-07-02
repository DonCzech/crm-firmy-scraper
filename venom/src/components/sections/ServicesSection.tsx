"use client";
import type { JSX } from "react";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { GenericEditableText } from "@/components/tenant/GenericEditableText";
import { GenericEditableImage } from "@/components/tenant/GenericEditableImage";
import { GenericSortableList } from "@/components/tenant/GenericSortableList";
import { shouldSkipNextImageOptimization } from "@/lib/image-source";

function resolveDemoHref(href: string, tenantSlug?: string, isAdmin = false) {
  if (!tenantSlug || !href.startsWith("/")) return href;
  if (href === "/") return `/demo/${tenantSlug}${isAdmin ? "/admin" : ""}`;
  if (href.startsWith("/#")) return href.slice(1);
  return `/demo/${tenantSlug}${isAdmin ? "/admin" : ""}${href}`;
}

interface Service {
  name: string;
  description: string;
  price?: string;
  duration?: string;
  icon?: string;
}

interface Props {
  content: Record<string, unknown>;
  variant: string;
  isAdmin: boolean;
  sectionId: number;
  tenantSlug?: string;
}

export function ServicesSection({ content, variant, sectionId, tenantSlug, isAdmin }: Props) {

  if (variant === "ananda-01-services") return <ServicesAnanda01 content={content} sectionId={sectionId} />;
  if (variant === "tawan-01-services")  return <ServicesTawan01 content={content} sectionId={sectionId} />;
  if (variant === "tawan-02-services")  return <ServicesTawan02 content={content} sectionId={sectionId} />;
  if (variant === "tattoo-03-services") return <ServicesTattoo03 content={content} sectionId={sectionId} />;
  if (variant === "nails-01-services")  return <ServicesNails01 content={content} sectionId={sectionId} />;
  if (variant === "nails-02-pricing")   return <PricingNails02 content={content} sectionId={sectionId} />;
  if (variant === "nails-03-services")  return <ServicesNails03 content={content} sectionId={sectionId} />;
  if (variant === "clinic-02-services") return <ServicesClinic02 content={content} sectionId={sectionId} />;
  if (variant === "clinic-03-services") return <ServicesClinic03 content={content} sectionId={sectionId} />;
  if (variant === "clinic-03-pricing")  return <PricingClinic03 content={content} sectionId={sectionId} />;
  if (variant === "restaurant-01-menu") return <ServicesRestaurant01 content={content} sectionId={sectionId} />;
  if (variant === "restaurant-02-menu") return <ServicesRestaurant02 content={content} sectionId={sectionId} />;
  if (variant === "restaurant-03-menu") return <ServicesRestaurant03 content={content} sectionId={sectionId} />;
  if (variant === "cafe-02-menu")       return <ServicesCafe02 content={content} sectionId={sectionId} />;
  if (variant === "cafe-03-menu")       return <ServicesCafe03 content={content} sectionId={sectionId} />;
  if (variant === "cafe-04-menu")       return <ServicesCafe04 content={content} sectionId={sectionId} />;
  if (variant === "bakery-01-promo-2col") return <ServicesBakery01 content={content} sectionId={sectionId} />;
  if (variant === "bakery-02-delivery")   return <DeliveryBakery02 content={content} sectionId={sectionId} />;
  if (variant === "bakery-02-locations")  return <LocationsBakery02 content={content} sectionId={sectionId} />;
  if (variant === "reality-01-listings")    return <ServicesReality01Listings content={content} sectionId={sectionId} />;
  if (variant === "reality-02-agents")      return <ServicesReality02Agents content={content} sectionId={sectionId} />;
  if (variant === "reality-03-services-4grid") return <ServicesReality03Grid content={content} sectionId={sectionId} />;
  if (variant === "reality-04-why-us")         return <WhyUsReality04 content={content} sectionId={sectionId} />;
  if (variant === "reality-06-services")       return <ServicesReality06 content={content} sectionId={sectionId} />;
  if (variant === "autoservis-01-services")    return <ServicesAutoservis01 content={content} sectionId={sectionId} />;
  if (variant === "autoservis-02-services")    return <ServicesAutoservis02 content={content} sectionId={sectionId} />;
  if (variant === "autoservis-03-stats")       return <StatsAutoservis03 content={content} sectionId={sectionId} />;
  if (variant === "autoservis-03-services")    return <ServicesAutoservis03 content={content} sectionId={sectionId} />;
  if (variant === "autoservis-03-pricing")     return <PricingAutoservis03 content={content} sectionId={sectionId} />;
  if (variant === "fyzio-01-services-grid") return <ServicesFyzio01 content={content} sectionId={sectionId} />;
  if (variant === "fyzio-02-services-list") return <ServicesFyzio02 content={content} sectionId={sectionId} />;
  if (variant === "dental-01-services")     return <ServicesDental01 content={content} sectionId={sectionId} />;
  if (variant === "lawyer-01-services")    return <ServicesLawyer01 content={content} sectionId={sectionId} />;
  if (variant === "legal-02-services")     return <ServicesLegal02 content={content} sectionId={sectionId} />;
  if (variant === "ucetni-01-services")    return <ServicesUcetni01 content={content} sectionId={sectionId} />;
  if (variant === "ucetni-02-services")    return <ServicesUcetni02 content={content} sectionId={sectionId} />;
  if (variant === "ucetni-03-services")    return <ServicesUcetni03 content={content} sectionId={sectionId} />;
  if (variant === "ortho-01-services")      return <ServicesOrtho01 content={content} sectionId={sectionId} />;
  if (variant === "ortho-02-services")      return <ServicesOrtho02 content={content} sectionId={sectionId} />;
  if (variant === "solar-01-services")      return <ServicesSolar01 content={content} sectionId={sectionId} />;
  if (variant === "ucetni-04-services")     return <ServicesUcetni04 content={content} sectionId={sectionId} />;
  if (variant === "klima-01-services")      return <ServicesKlima01 content={content} sectionId={sectionId} />;
  if (variant === "solar-03-services")      return <ServicesSolar03 content={content} sectionId={sectionId} />;
  if (variant === "solar-02-segments")      return <SegmentsSolar02 content={content} sectionId={sectionId} />;
  if (variant === "solar-02-services")      return <ServicesSolar02 content={content} sectionId={sectionId} />;
  if (variant === "klempir-01-services")   return <ServicesKlempir01 content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;
  if (variant === "malir-01-services")    return <ServicesMalir01   content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;
  if (variant === "malir-02-services")    return <ServicesMalir02   content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;
  if (variant === "malir-02-pricing")     return <PricingMalir02    content={content} sectionId={sectionId} />;
  if (variant === "arbo-01-services")     return <ServicesArbo01    content={content} sectionId={sectionId} />;
  if (variant === "ddd-01-services")      return <ServicesDdd01     content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;

  // hair-04: 3-col, diamond foto s gold borderem, tmavé bg, gold nadpisy — 1:1 kim-impressive.cz
  if (variant === "hair-04-service-cards") {
    type Item04 = { title?: string; body?: string; image?: string };
    const items = (content.items as Item04[]) ?? [];
    const GOLD  = "#FFDF25";
    const LATO  = "'Lato', sans-serif";
    const PLACEHOLDERS = [
      "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=400&h=400&fit=crop&crop=face&fm=webp",
      "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400&h=400&fit=crop&crop=face&fm=webp",
      "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=400&h=400&fit=crop&crop=face&fm=webp",
    ];

    return (
      <section
        id="sluzby"
        data-template="hair-04"
        style={{ backgroundColor: "#0d0d0d", padding: "80px 24px 90px" }}
      >
        <style>{`
          [data-template="hair-04"] .h04-card {
            transition: transform 0.35s cubic-bezier(.22,.61,.36,1);
          }
          [data-template="hair-04"] .h04-card:hover {
            transform: translateY(-10px);
          }
          [data-template="hair-04"] .h04-diamond {
            transition: box-shadow 0.35s ease, border-color 0.35s ease;
          }
          [data-template="hair-04"] .h04-card:hover .h04-diamond {
            box-shadow: 0 0 32px rgba(255,223,37,0.45), 0 0 8px rgba(255,223,37,0.25);
            border-color: #fff;
          }
          [data-template="hair-04"] .h04-title {
            transition: color 0.3s ease;
          }
          [data-template="hair-04"] .h04-card:hover .h04-title {
            color: #ffffff;
          }
        `}</style>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "clamp(40px, 6vw, 100px)",
            flexWrap: "wrap",
            maxWidth: 1200,
            margin: "0 auto",
          }}
        >
          {items.map((it, i) => {
            const imgSrc = it.image || PLACEHOLDERS[i] || "";
            return (
              <div
                key={i}
                className="h04-card"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  textAlign: "center",
                  flex: "1 1 260px",
                  maxWidth: 320,
                }}
              >
                {/* Diamond foto */}
                <div
                  className="h04-diamond"
                  style={{
                    width: 190,
                    height: 190,
                    transform: "rotate(45deg)",
                    overflow: "hidden",
                    border: `2px solid ${GOLD}`,
                    flexShrink: 0,
                    marginBottom: 56,
                    position: "relative",
                  }}
                >
                  <GenericEditableImage
                    sectionId={sectionId}
                    field={`items.${i}.image`}
                    src={imgSrc}
                    alt={it.title ?? ""}
                    className="absolute inset-0"
                    style={{ position: "absolute", inset: 0 }}
                  >
                    {imgSrc ? (
                      <Image
                        src={imgSrc}
                        alt={it.title ?? ""}
                        fill
                        sizes="270px"
                        className="object-cover"
                        style={{ transform: "rotate(-45deg) scale(1.45)", transformOrigin: "center" }}
                        unoptimized={shouldSkipNextImageOptimization(imgSrc)}
                      />
                    ) : (
                      <div style={{ position: "absolute", inset: 0, backgroundColor: "#1a1a1a" }} />
                    )}
                  </GenericEditableImage>
                </div>

                {/* Název — gold */}
                <h3 className="h04-title" style={{
                  fontFamily: LATO,
                  fontSize: 22,
                  fontWeight: 600,
                  color: GOLD,
                  margin: "0 0 16px",
                  lineHeight: 1.3,
                }}>
                  <GenericEditableText sectionId={sectionId} field={`items.${i}.title`} value={it.title ?? ""} tag="span" />
                </h3>

                {/* Popis — bílý */}
                <p style={{
                  fontFamily: LATO,
                  fontSize: 15,
                  fontWeight: 300,
                  color: "rgba(255,255,255,0.85)",
                  lineHeight: 1.75,
                  margin: 0,
                  maxWidth: 280,
                }}>
                  <GenericEditableText sectionId={sectionId} field={`items.${i}.body`} value={it.body ?? ""} tag="span" />
                </p>
              </div>
            );
          })}
        </div>
      </section>
    );
  }

  if (variant === "beauty-01-services-3col") return <Beauty01Services3col content={content} sectionId={sectionId} />;
  if (variant === "beauty-01-pricing-detail") return <Beauty01PricingDetail content={content} sectionId={sectionId} />;
  if (variant === "massage-01-services-3col") return <Massage01Services3col content={content} sectionId={sectionId} />;
  if (variant === "fitness-02-services-grid") return <ServicesFitness02 content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;
  if (variant === "fitness-01-services-carousel") return <ServicesFitness01Carousel content={content} sectionId={sectionId} />;
  if (variant === "fitness-01-pricing-3col") return <PricingFitness01 content={content} sectionId={sectionId} />;
  if (variant === "stavba-01-services") return <ServicesStavba01 content={content} sectionId={sectionId} />;
  if (variant === "stavba-03-services") return <ServicesStavba03 content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;
  if (variant === "stavba-02-services") return <ServicesStavba02 content={content} sectionId={sectionId} />;
  if (variant === "elektro-01-services") return <ServicesElektro01 content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;
  if (variant === "elektro-01-services-detail") return <ServicesDetailElektro01 content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;
  if (variant === "instala-01-services") return <ServicesInstala01 content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;
  if (variant === "instala-02-services") return <ServicesInstala02 content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;
  if (variant === "catering-01-services") return <ServicesCatering01 content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;
  if (variant === "autoskola-01-services") return <ServicesAutoskola01 content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;
  if (variant === "lang-01-services")      return <ServicesLang01 content={content} sectionId={sectionId} />;
  if (variant === "edu-01-services")       return <ServicesEdu01 content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;
  if (variant === "kids-01-services")      return <ServicesKids01 content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;
  if (variant === "pethotel-01-services")  return <ServicesPethotel01 content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;
  if (variant === "sweet-01-products")     return <ProductsSweet01 content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;
  if (variant === "vet-01-services")       return <ServicesVet01 content={content} sectionId={sectionId} />;
  if (variant === "grooming-01-pricing")   return <PricingGrooming01 content={content} sectionId={sectionId} />;
  if (variant === "clean-01-services")     return <ServicesClean01 content={content} sectionId={sectionId} />;
  if (variant === "clean-02-services")     return <ServicesClean02 content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;
  if (variant === "hotel-01-rooms")        return <ServicesHotel01Rooms content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;
  if (variant === "hotel-02-rooms")        return <ServicesHotel02Rooms content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;
  if (variant === "chalet-01-amenities")   return <AmenitiesChalet01 content={content} sectionId={sectionId} />;
  if (variant === "events-01-services")    return <ServicesEvents01  content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;
  if (variant === "dj-01-services")        return <ServicesDj01      content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;
  if (variant === "restaurant-04-menu")    return <ServicesRestaurant04 content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;

  // hair-01: 4 numbered cards (01–04), gold číslo, Montserrat, cream bg
  if (variant === "hair-numbered-cards") {
    interface HairItem { number?: string; name: string; description: string; ctaText?: string; ctaHref?: string; }
    const items = (content.items as HairItem[]) ?? (content.services as HairItem[]) ?? [];
    const MONO = "'Montserrat',sans-serif";
    const GOLD = "#8a6f28";
    const CREAM = "#f5f1f0";
    return (
      <section id="sluzby" data-template="hair-01" style={{ backgroundColor: CREAM, padding: "clamp(60px,8vw,100px) clamp(20px,5vw,60px)", fontFamily: MONO }}>
        <div
          className="max-w-[1280px] mx-auto grid gap-8"
          style={{ gridTemplateColumns: "repeat(auto-fit, minmax(min(260px,100%), 1fr))" }}
        >
          {items.map((it, i) => (
            <div
              key={i}
              style={{ backgroundColor: "#fff", padding: "40px 32px 36px", display: "flex", flexDirection: "column", gap: 16 }}
            >
              <span style={{ color: GOLD, fontSize: 28, fontWeight: 200, letterSpacing: "0.04em", lineHeight: 1 }}>
                <GenericEditableText sectionId={sectionId} field={`items.${i}.number`} value={it.number ?? `0${i+1}.`} tag="span" />
              </span>
              <p style={{ color: "#1e1e1e", fontSize: "clamp(15px,1.3vw,18px)", fontWeight: 600, lineHeight: 1.3, margin: 0 }}>
                <GenericEditableText sectionId={sectionId} field={`items.${i}.name`} value={it.name} tag="span" />
              </p>
              <p style={{ color: "#605f5f", fontSize: 14, fontWeight: 300, lineHeight: 1.7, flex: 1, margin: 0 }}>
                <GenericEditableText sectionId={sectionId} field={`items.${i}.description`} value={it.description} tag="span" />
              </p>
              {it.ctaText && (
                <a
                  href={it.ctaHref ?? "#rezervace"}
                  data-btn="inverse"
                  style={{
                    display: "inline-block",
                    marginTop: 8,
                    border: `1.5px solid ${GOLD}`,
                    color: GOLD,
                    backgroundColor: "transparent",
                    fontFamily: MONO,
                    fontSize: 10,
                    fontWeight: 600,
                    letterSpacing: "0.18em",
                    textTransform: "uppercase",
                    padding: "12px 24px",
                    textDecoration: "none",
                    alignSelf: "flex-start",
                    transition: "background 0.2s, color 0.2s",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.backgroundColor = GOLD; e.currentTarget.style.color = "#fff"; }}
                  onMouseLeave={e => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = GOLD; }}
                >
                  <GenericEditableText sectionId={sectionId} field={`items.${i}.ctaText`} value={it.ctaText} tag="span" />
                </a>
              )}
            </div>
          ))}
        </div>
      </section>
    );
  }

  // Support both field name conventions: services[] and items[] (generator/pricing section)
  const services = (
    (content as { services?: Service[] }).services ??
    (content as { items?: Service[] }).items ??
    []
  );
  const title = String(content.title ?? (variant === "pricing-list" ? "Ceník služeb" : "Naše služby"));

  if (variant === "barber-04-pricing-flat") {
    // barber-04 (Černý Fade) — industrial dark pricing list s podporou kategorií.
    type PricingItem = Service & { category?: string };
    const items = services as PricingItem[];
    const grouped: { category: string; items: PricingItem[] }[] = [];
    items.forEach((it) => {
      const cat = it.category ?? "default";
      let g = grouped.find((x) => x.category === cat);
      if (!g) {
        g = { category: cat, items: [] };
        grouped.push(g);
      }
      g.items.push(it);
    });
    let itemIdx = 0;
    const pEyebrow = String((content as Record<string, unknown>).eyebrow ?? "Transparentní ceník");
    const pTitle = String(content.title ?? "Ceník služeb");
    const pLead = String((content as Record<string, unknown>).lead ?? "");
    const pShowHeader = (content as Record<string, unknown>).showHeader !== false;
    const pFootnote = String((content as Record<string, unknown>).footnote ?? "");
    return (
      <section
        className="relative"
        style={{ padding: "clamp(80px,10vw,120px) 24px", backgroundColor: "#0a0806" }}
        data-template="barber-04"
      >
        {pShowHeader && (
          <div className="max-w-[860px] mx-auto text-center" style={{ marginBottom: "clamp(56px, 7vw, 80px)" }}>
            {pEyebrow && (
              <div style={{
                display: "inline-flex", alignItems: "center", gap: 12, marginBottom: 24,
                fontFamily: "'Lato',Helvetica,Arial,sans-serif", fontSize: 11, fontWeight: 700,
                letterSpacing: "0.32em", color: "#d5b981", textTransform: "uppercase",
              }}>
                <span aria-hidden style={{ width: 28, height: 1, backgroundColor: "#d5b981", opacity: 0.7 }} />
                <GenericEditableText sectionId={sectionId} field="eyebrow" value={pEyebrow} tag="span" />
                <span aria-hidden style={{ width: 28, height: 1, backgroundColor: "#d5b981", opacity: 0.7 }} />
              </div>
            )}
            <h2
              className="uppercase"
              style={{
                fontFamily: "'Bebas Neue','Oswald',Impact,sans-serif",
                fontWeight: 400, fontSize: "clamp(32px, 4vw, 56px)", letterSpacing: "0.03em",
                color: "#fff", margin: "0 auto 20px", lineHeight: 1.05,
              }}
            >
              <GenericEditableText sectionId={sectionId} field="title" value={pTitle} tag="span" />
            </h2>
            <div aria-hidden style={{
              width: 180, height: 1, margin: "0 auto",
              background: "linear-gradient(90deg, transparent 0%, rgba(213,185,129,.85) 50%, transparent 100%)",
            }} />
            {pLead && (
              <p style={{
                fontFamily: "'Lato',Helvetica,Arial,sans-serif",
                fontWeight: 400, fontSize: "clamp(14px, 1.05vw, 16px)",
                color: "rgba(255,255,255,0.65)",
                maxWidth: 640, margin: "28px auto 0", lineHeight: 1.75,
              }}>
                <GenericEditableText sectionId={sectionId} field="lead" value={pLead} tag="span" />
              </p>
            )}
          </div>
        )}
        <div className="max-w-[860px] mx-auto">
          {grouped.map((g, gi) => (
            <div key={`grp-${gi}`} style={{ marginTop: gi > 0 ? 60 : 0 }}>
              {g.category !== "default" && (
                <div style={{ textAlign: "center", marginBottom: 36 }}>
                  <h3
                    className="uppercase"
                    style={{
                      fontFamily: "'Bebas Neue','Oswald',Impact,sans-serif",
                      fontWeight: 400, fontSize: "clamp(22px, 2.2vw, 30px)",
                      letterSpacing: "0.12em", color: "#d5b981",
                      margin: "0 auto 14px", lineHeight: 1.2,
                    }}
                  >
                    {g.category}
                  </h3>
                  <div aria-hidden style={{
                    width: 80, height: 1, margin: "0 auto",
                    background: "linear-gradient(90deg, transparent 0%, rgba(213,185,129,.6) 50%, transparent 100%)",
                  }} />
                </div>
              )}
              {g.items.map((it) => {
                const idx = itemIdx++;
                return (
                  <div
                    key={`pi-${idx}`}
                    className="b04-price-row"
                    style={{
                      display: "flex", alignItems: "baseline", justifyContent: "space-between",
                      gap: 24, padding: "20px 4px",
                      borderBottom: "1px solid rgba(213,185,129,0.08)",
                      transition: "border-color .25s ease, padding-left .25s ease",
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <p
                        className="b04-price-name"
                        style={{
                          fontFamily: "'Bebas Neue','Oswald',Impact,sans-serif",
                          fontSize: "clamp(17px, 1.4vw, 22px)", fontWeight: 400,
                          letterSpacing: "0.06em", color: "#fff",
                          textTransform: "uppercase", margin: 0,
                          transition: "color .2s ease",
                        }}
                      >
                        <GenericEditableText sectionId={sectionId} field={`services.${idx}.name`} value={it.name} tag="span" />
                      </p>
                      {it.description && (
                        <p
                          style={{
                            fontFamily: "'Lato',Helvetica,Arial,sans-serif",
                            fontSize: 13, color: "rgba(255,255,255,0.55)",
                            lineHeight: 1.6, margin: "6px 0 0",
                          }}
                        >
                          <GenericEditableText sectionId={sectionId} field={`services.${idx}.description`} value={it.description} tag="span" />
                        </p>
                      )}
                    </div>
                    {it.price && (
                      <span
                        style={{
                          fontFamily: "'Bebas Neue','Oswald',Impact,sans-serif",
                          fontSize: "clamp(20px, 1.6vw, 26px)", fontWeight: 400,
                          letterSpacing: "0.04em", color: "#d5b981",
                          whiteSpace: "nowrap",
                        }}
                      >
                        <GenericEditableText sectionId={sectionId} field={`services.${idx}.price`} value={it.price} tag="span" />
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
          {pFootnote && (
            <p style={{
              fontFamily: "'Lato',Helvetica,Arial,sans-serif",
              fontSize: 12, color: "rgba(255,255,255,0.42)",
              textAlign: "center", marginTop: 48, lineHeight: 1.7,
              maxWidth: 560, marginInline: "auto",
              fontStyle: "italic",
            }}>
              <GenericEditableText sectionId={sectionId} field="footnote" value={pFootnote} tag="span" />
            </p>
          )}
        </div>
      </section>
    );
  }

  if (variant === "barber-04-services-cards") {
    const b04Eyebrow = String((content as Record<string, unknown>).eyebrow ?? "Co u nás najdete");
    const b04Title = String(title ?? "Naše služby");
    const b04Lead = String((content as Record<string, unknown>).lead ?? "");
    const showHeader = (content as Record<string, unknown>).showHeader !== false;
    return (
      <ServicesBarber04Cards
        services={services}
        sectionId={sectionId}
        eyebrow={b04Eyebrow}
        title={b04Title}
        lead={b04Lead}
        showHeader={showHeader}
      />
    );
  }

  if (variant === "barber-dark-pricing") {
    return <PricingBarberDark content={content} sectionId={sectionId} services={services} title={title} />;
  }

  if (variant === "pricing-list") {
    const eyebrow  = String((content as Record<string, unknown>).eyebrow  ?? "Klasika & precizní řemeslo");
    const subtitle = String((content as Record<string, unknown>).subtitle ?? "Každý zákrok provádíme s důrazem na detail, čisté linie a péči o váš osobní styl. Ceny jsou konečné, bez skrytých poplatků.");
    const footnote = String((content as Record<string, unknown>).footnote ?? "Ceny jsou orientační — finální cena závisí na délce vlasů a vousů. Rezervace minimálně 24h předem.");
    return (
      <section
        id="sluzby"
        className="relative overflow-hidden"
        style={{
          backgroundColor: "var(--color-bg, #111)",
          paddingBlock: "clamp(80px, 12vh, 140px)",
          paddingInline: "clamp(20px, 6vw, 80px)",
        }}
        data-template="barber-01"
      >
        {/* Decorative side ornaments */}
        <div aria-hidden style={{
          position: "absolute", top: 60, right: 60, width: 120, height: 120, opacity: 0.04, zIndex: 0,
          backgroundImage: "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23C9A84C' stroke-width='1' stroke-linecap='round' stroke-linejoin='round'><circle cx='6' cy='6' r='3'/><circle cx='6' cy='18' r='3'/><line x1='20' y1='4' x2='8.12' y2='15.88'/><line x1='14.47' y1='14.48' x2='20' y2='20'/><line x1='8.12' y1='8.12' x2='12' y2='12'/></svg>\")",
          backgroundSize: "contain", backgroundRepeat: "no-repeat",
        }} />

        <div style={{ position: "relative", zIndex: 1, maxWidth: 1180, marginInline: "auto" }}>
          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: 64, maxWidth: 720, marginInline: "auto" }}>
            {/* Eyebrow */}
            <div style={{ display: "inline-flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
              <span aria-hidden style={{ width: 32, height: 1, backgroundColor: "var(--color-accent, #C9A84C)" }} />
              <GenericEditableText
                sectionId={sectionId}
                field="eyebrow"
                value={eyebrow}
                tag="span"
                className="services-eyebrow"
              />
              <span aria-hidden style={{ width: 32, height: 1, backgroundColor: "var(--color-accent, #C9A84C)" }} />
            </div>

            <h2
              className="services-title"
              style={{
                fontFamily: "var(--font-heading)",
                color: "#F5F5F5",
                fontSize: "clamp(2rem, 4.5vw, 3.4rem)",
                fontWeight: 700,
                letterSpacing: "-0.01em",
                lineHeight: 1.05,
                marginBottom: 18,
              }}
            >
              <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
            </h2>

            <p style={{
              color: "rgba(245,245,245,0.7)",
              fontSize: "clamp(0.95rem, 1.1vw, 1.05rem)",
              lineHeight: 1.6,
              fontWeight: 300,
            }}>
              <GenericEditableText sectionId={sectionId} field="subtitle" value={subtitle} tag="span" />
            </p>
          </div>

          {/* Pricing two-column grid (1 col mobile, 2 col desktop) */}
          <div
            className="pricing-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 460px), 1fr))",
              columnGap: 64,
              rowGap: 8,
              padding: "32px 0",
              borderTop: "1px solid rgba(201,168,76,0.18)",
              borderBottom: "1px solid rgba(201,168,76,0.18)",
            }}
          >
            <GenericSortableList sectionId={sectionId} field="services" items={services as unknown as Record<string, unknown>[]}>
              {(s, i, handle) => {
                const sv = s as unknown as Service;
                return (
                  <div
                    className="pricing-row group"
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 14,
                      paddingBlock: 22,
                      paddingInline: 16,
                      borderBottom: "1px dashed rgba(201,168,76,0.14)",
                      position: "relative",
                      transition: "background-color 0.2s ease, padding-left 0.25s ease",
                    }}
                  >
                    {handle}
                    {/* Gold left bar — hover indicator */}
                    <span aria-hidden className="pricing-row-bar" style={{
                      position: "absolute", left: 0, top: 16, bottom: 16, width: 2,
                      backgroundColor: "var(--color-accent, #C9A84C)",
                      transform: "scaleY(0)", transformOrigin: "center",
                      transition: "transform 0.25s ease",
                    }} />

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 6 }}>
                        <span style={{
                          color: "#F5F5F5",
                          fontFamily: "var(--font-heading)",
                          fontSize: "1.05rem",
                          fontWeight: 700,
                          letterSpacing: "0.01em",
                        }}>
                          <GenericEditableText sectionId={sectionId} field={`services.${i}.name`} value={sv.name} tag="span" />
                        </span>
                        {/* Dotted leader line — classic menu */}
                        <span aria-hidden style={{
                          flex: 1, height: 1, marginInline: 4, marginBottom: 4,
                          borderBottom: "1px dotted rgba(201,168,76,0.32)",
                        }} />
                        {sv.price && (
                          <span style={{
                            color: "var(--color-accent, #C9A84C)",
                            fontFamily: "var(--font-heading)",
                            fontSize: "1.05rem",
                            fontWeight: 700,
                            whiteSpace: "nowrap",
                            letterSpacing: "0.02em",
                          }}>
                            <GenericEditableText sectionId={sectionId} field={`services.${i}.price`} value={sv.price} tag="span" />
                          </span>
                        )}
                      </div>
                      <p style={{
                        fontSize: "0.875rem",
                        color: "rgba(245,245,245,0.55)",
                        lineHeight: 1.55,
                        fontWeight: 300,
                      }}>
                        <GenericEditableText sectionId={sectionId} field={`services.${i}.description`} value={sv.description} tag="span" />
                        {sv.duration && (
                          <span style={{ color: "rgba(201,168,76,0.65)", marginLeft: 8, fontWeight: 500, letterSpacing: "0.05em", textTransform: "uppercase", fontSize: "0.72rem" }}>
                            · {sv.duration}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                );
              }}
            </GenericSortableList>
          </div>

          {/* Footnote + CTA */}
          <div style={{
            display: "flex", flexWrap: "wrap", gap: 24, alignItems: "center", justifyContent: "space-between",
            marginTop: 40,
          }}>
            <p style={{
              color: "rgba(245,245,245,0.5)",
              fontSize: "0.78rem",
              maxWidth: 540,
              lineHeight: 1.55,
              fontStyle: "italic",
            }}>
              <GenericEditableText sectionId={sectionId} field="footnote" value={footnote} tag="span" />
            </p>
            <a
              href="#rezervace"
              className="barber-cta-premium"
              style={{
                position: "relative",
                overflow: "hidden",
                display: "inline-flex",
                alignItems: "center",
                gap: 10,
                paddingInline: 28,
                minHeight: 50,
                fontSize: "11px",
                fontWeight: 700,
                letterSpacing: "0.22em",
                textTransform: "uppercase",
                color: "#0a0a0a",
                backgroundColor: "var(--color-accent, #C9A84C)",
                border: "1px solid var(--color-accent, #C9A84C)",
                borderRadius: 2,
                textDecoration: "none",
                transition: "transform 0.25s ease, box-shadow 0.25s ease",
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 10px 26px rgba(201,168,76,0.35)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "none"; }}
            >
              Rezervovat termín
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#0a0a0a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
              </svg>
              <span aria-hidden className="barber-cta-shimmer" style={{
                position: "absolute", top: 0, left: "-60%", width: "50%", height: "100%",
                background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.45) 50%, transparent 100%)",
                transform: "skewX(-20deg)", pointerEvents: "none",
              }} />
            </a>
          </div>
        </div>
      </section>
    );
  }

  if (variant === "pricing-urban") {
    return (
      <section
        className="py-24 px-6"
        style={{ backgroundColor: "var(--color-bg, #1e1e1e)" }}
      >
        <div className="max-w-3xl mx-auto">
          <h2
            className="text-4xl font-black uppercase mb-2"
            style={{
              fontFamily: "var(--font-heading)",
              color: "var(--color-text, #f4f4f4)",
              letterSpacing: "0.04em",
            }}
          >
            <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
          </h2>
          <div
            style={{
              width: 40,
              height: 3,
              backgroundColor: "var(--color-primary, #ff5268)",
              marginBottom: "3rem",
            }}
          />
          <GenericSortableList sectionId={sectionId} field="services" items={services as unknown as Record<string, unknown>[]}>
            {(s, i, handle) => {
              const sv = s as unknown as Service;
              return (
                <div
                  className="flex items-start gap-4 py-6"
                  style={{ borderBottom: "1px solid var(--color-border, #2a2a2a)" }}
                >
                  {handle}
                  <span
                    className="select-none"
                    style={{
                      fontSize: "2.5rem",
                      fontWeight: 900,
                      fontFamily: "var(--font-heading)",
                      color: "var(--color-primary, #ff5268)",
                      opacity: 0.22,
                      lineHeight: 1,
                      minWidth: "3rem",
                      flexShrink: 0,
                    }}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p
                      className="font-bold text-lg"
                      style={{ color: "var(--color-text, #f4f4f4)", fontFamily: "var(--font-heading)" }}
                    >
                      <GenericEditableText sectionId={sectionId} field={`services.${i}.name`} value={sv.name} tag="span" />
                    </p>
                    {sv.description && (
                      <p
                        className="text-sm mt-1"
                        style={{ color: "var(--color-text-muted, #888)", lineHeight: 1.6 }}
                      >
                        <GenericEditableText sectionId={sectionId} field={`services.${i}.description`} value={sv.description} tag="span" />
                      </p>
                    )}
                  </div>
                  {sv.price && (
                    <span
                      className="font-bold text-base whitespace-nowrap flex-shrink-0"
                      style={{ color: "var(--color-primary, #ff5268)" }}
                    >
                      <GenericEditableText sectionId={sectionId} field={`services.${i}.price`} value={sv.price} tag="span" />
                    </span>
                  )}
                </div>
              );
            }}
          </GenericSortableList>
        </div>
      </section>
    );
  }

  if (variant === "pricing-cols") {
    interface PricingItem { name: string; price: string; }
    interface PricingCategory { name: string; subtitle?: string; items: PricingItem[]; }
    const categories = (content as { categories?: PricingCategory[] }).categories ?? [];
    const bgImage = String((content as { backgroundImage?: string }).backgroundImage ?? "");
    const catTitle = String(content.title ?? "Ceník");
    const eyebrow  = String((content as Record<string, unknown>).eyebrow  ?? "");
    const subtitle = String((content as Record<string, unknown>).subtitle ?? "");
    const footnote = String((content as Record<string, unknown>).footnote ?? "");
    const ctaText  = String((content as Record<string, unknown>).ctaText  ?? "");
    const ctaHref  = String((content as Record<string, unknown>).ctaHref  ?? "");
    return (
      <section
        id="cenik"
        className="relative overflow-hidden b02-pricing"
        style={{
          backgroundColor: "#f9f7f5",
          paddingBlock: "clamp(96px, 14vh, 160px)",
          paddingInline: "clamp(20px, 5vw, 40px)",
        }}
        data-template="barber-02"
      >
        {/* Subtle background ornament — two warm rings (matching about) */}
        <div aria-hidden style={{
          position: "absolute", top: "10%", left: "-100px",
          width: 320, height: 320, borderRadius: "50%",
          border: "1px solid rgba(212,169,110,0.10)",
          zIndex: 0,
        }} />
        <div aria-hidden style={{
          position: "absolute", bottom: "12%", right: "-90px",
          width: 220, height: 220, borderRadius: "50%",
          border: "1px solid rgba(212,169,110,0.08)",
          zIndex: 0,
        }} />

        <div className="relative z-10 mx-auto" style={{ maxWidth: 1180 }}>
          {/* Editorial header */}
          <div style={{ textAlign: "center", marginBottom: "clamp(60px, 9vw, 96px)" }}>
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
                <span aria-hidden style={{ width: 36, height: 1, backgroundColor: "#d4a96e" }} />
              </div>
            )}
            <h2 style={{
              fontFamily: "'Libre Baskerville', Georgia, serif",
              fontSize: "clamp(2.2rem, 4.5vw, 3.2rem)",
              fontWeight: 700,
              lineHeight: 1.1,
              letterSpacing: "0.02em",
              color: "#1a1a1a",
              margin: "0 auto 18px",
              maxWidth: 760,
            }}>
              <GenericEditableText sectionId={sectionId} field="title" value={catTitle} tag="span" />
            </h2>
            {subtitle && (
              <p style={{
                fontFamily: "'Source Sans Pro', system-ui, sans-serif",
                fontSize: "clamp(0.98rem, 1.4vw, 1.1rem)",
                fontWeight: 300,
                color: "#666",
                lineHeight: 1.7,
                margin: "0 auto",
                maxWidth: 620,
              }}>
                <GenericEditableText sectionId={sectionId} field="subtitle" value={subtitle} tag="span" />
              </p>
            )}
            {/* Bottom decorative rule */}
            <div aria-hidden style={{ display: "inline-flex", alignItems: "center", gap: 14, marginTop: 28 }}>
              <span style={{ width: 48, height: 1, backgroundColor: "rgba(212,169,110,0.55)" }} />
              <span style={{ width: 5, height: 5, borderRadius: "50%", backgroundColor: "#d4a96e" }} />
              <span style={{ width: 48, height: 1, backgroundColor: "rgba(212,169,110,0.55)" }} />
            </div>
          </div>

          {/* Categories grid */}
          <div
            data-pricing-cols
            className="grid"
            style={{
              gap: "clamp(36px, 5vw, 64px)",
              gridTemplateColumns: `repeat(${Math.min(categories.length, 3)}, 1fr)`,
            }}
          >
            {categories.map((cat, ci) => (
              <div key={ci} className="b02-pricing-cat" style={{
                position: "relative",
                paddingTop: 28,
                paddingInline: 4,
              }}>
                {/* Top thin gold accent above category */}
                <span aria-hidden style={{
                  position: "absolute", top: 0, left: 0,
                  width: 36, height: 2,
                  backgroundColor: "#d4a96e",
                  transition: "width 0.5s cubic-bezier(.22,.68,0,1.1)",
                }} className="b02-pricing-cat-bar" />

                <p style={{
                  fontFamily: "'Libre Baskerville', Georgia, serif",
                  fontSize: "1.4rem",
                  fontWeight: 700,
                  letterSpacing: "0.02em",
                  color: "#1a1a1a",
                  margin: "0 0 6px",
                }}>
                  <GenericEditableText sectionId={sectionId} field={`categories.${ci}.name`} value={cat.name} tag="span" />
                </p>
                {cat.subtitle && (
                  <p style={{
                    fontFamily: "'Libre Baskerville', Georgia, serif",
                    fontStyle: "italic",
                    fontSize: "0.92rem",
                    color: "#9a7a50",
                    margin: "0 0 24px",
                  }}>
                    <GenericEditableText sectionId={sectionId} field={`categories.${ci}.subtitle`} value={cat.subtitle} tag="span" />
                  </p>
                )}

                <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
                  {cat.items.map((item, ii) => (
                    <li
                      key={ii}
                      className="b02-pricing-item"
                      style={{
                        display: "flex",
                        alignItems: "baseline",
                        gap: 12,
                        paddingBlock: 14,
                        paddingInline: 8,
                        borderBottom: "1px dashed rgba(154,122,80,0.28)",
                        position: "relative",
                        transition: "padding-left 0.3s ease, background-color 0.3s ease",
                      }}
                    >
                      {/* Gold left bar — hover indicator */}
                      <span aria-hidden className="b02-pricing-item-bar" style={{
                        position: "absolute", left: 0, top: 12, bottom: 12, width: 2,
                        backgroundColor: "#d4a96e",
                        transform: "scaleY(0)", transformOrigin: "center",
                        transition: "transform 0.3s ease",
                      }} />
                      <span style={{
                        fontFamily: "'Source Sans Pro', system-ui, sans-serif",
                        fontSize: "0.95rem",
                        fontWeight: 400,
                        color: "#444",
                        letterSpacing: "0.01em",
                      }}>
                        <GenericEditableText sectionId={sectionId} field={`categories.${ci}.items.${ii}.name`} value={item.name} tag="span" />
                      </span>
                      {/* Dotted leader — classic menu pattern */}
                      <span aria-hidden style={{
                        flex: 1, height: 1, marginInline: 4, marginBottom: 3,
                        borderBottom: "1px dotted rgba(154,122,80,0.45)",
                      }} />
                      <span style={{
                        fontFamily: "'Libre Baskerville', Georgia, serif",
                        fontSize: "0.95rem",
                        fontWeight: 700,
                        color: "#9a7a50",
                        whiteSpace: "nowrap",
                        letterSpacing: "0.02em",
                      }}>
                        <GenericEditableText sectionId={sectionId} field={`categories.${ci}.items.${ii}.price`} value={item.price} tag="span" />
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Footnote + CTA */}
          {(footnote || ctaText) && (
            <div style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 28,
              alignItems: "center",
              justifyContent: "space-between",
              marginTop: "clamp(56px, 7vw, 80px)",
              paddingTop: 40,
              borderTop: "1px solid rgba(154,122,80,0.22)",
            }}>
              {footnote && (
                <p style={{
                  fontFamily: "'Libre Baskerville', Georgia, serif",
                  fontStyle: "italic",
                  fontSize: "0.86rem",
                  color: "#7a7066",
                  lineHeight: 1.65,
                  maxWidth: 560,
                  margin: 0,
                }}>
                  <GenericEditableText sectionId={sectionId} field="footnote" value={footnote} tag="span" />
                </p>
              )}
              {ctaText && (
                <a
                  href={ctaHref || "#rezervace"}
                  className="b02-pricing-cta inline-flex items-center justify-center uppercase no-underline"
                  style={{
                    gap: 10,
                    border: "1px solid #d4a96e",
                    color: "#9a7a50",
                    fontFamily: "'Source Sans Pro', system-ui, sans-serif",
                    fontWeight: 600,
                    fontSize: 11,
                    letterSpacing: "0.24em",
                    paddingInline: 32,
                    paddingBlock: 14,
                    borderRadius: 50,
                    backgroundColor: "transparent",
                    transition: "background 0.4s cubic-bezier(.4,0,.2,1), color 0.4s ease, box-shadow 0.4s ease, transform 0.4s ease",
                  }}
                >
                  <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
                  <span aria-hidden className="b02-pricing-cta-arrow" style={{
                    display: "inline-flex",
                    transition: "transform 0.4s cubic-bezier(.22,.68,0,1.1)",
                  }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                    </svg>
                  </span>
                </a>
              )}
            </div>
          )}
        </div>
        <style>{`
          @media(max-width:900px){[data-pricing-cols]{grid-template-columns:1fr !important;gap:2.5rem !important;}}
        `}</style>
      </section>
    );
  }

  if (variant === "peak-cut-pricing") {
    // peak-cut (aka barber-05) — Brutalist Atelier White services/ceník
    // White section, magazine 2-col header (eyebrow+title L, subtitle R), 2-col hairline ledger of services.
    // Each row: name + description left, duration + price right; hover = red left bar slide + price flash red.
    const OSWALD = "var(--font-oswald), 'Oswald', 'Bebas Neue', Impact, sans-serif";
    const MONO   = "var(--font-overpass-mono), 'Overpass Mono', 'JetBrains Mono', Menlo, monospace";
    const OVERPASS = "var(--font-overpass), 'Overpass', 'Inter', system-ui, sans-serif";
    const INK    = "#0a0a0a";
    const cc = content as Record<string, unknown>;
    // Header — eyebrow optional, title + subtitle editable, conditional header for subpages
    const eyebrowRaw  = cc.eyebrow;
    const titleRaw    = cc.title;
    const subtitleRaw = cc.subtitle;
    const eyebrow  = eyebrowRaw  === undefined ? "Ceník služeb" : String(eyebrowRaw);
    const titleStr = titleRaw    === undefined ? "Naše péče.\nVaše proměna." : String(titleRaw);
    const subtitle = subtitleRaw === undefined ? "Každá služba je řemeslo. Ceny zahrnují konzultaci, prémiové produkty a finální styling — bez skrytých příplatků." : String(subtitleRaw);
    const showHeader = !!(eyebrow.trim() || titleStr.trim() || subtitle.trim());
    const footerNote = String(cc.footerNote ?? "Ceny jsou orientační. Závazné jsou ceny domluvené při rezervaci.");
    const footerCtaText = String(cc.footerCtaText ?? "Rezervovat termín");
    const footerCtaHref = String(cc.footerCtaHref ?? "#");
    return (
      <section
        id="services"
        className="relative w-full overflow-hidden"
        style={{
          backgroundColor: "#ffffff",
          padding: "clamp(72px, 9vw, 128px) clamp(24px, 5vw, 64px)",
        }}
        data-template="peak-cut"
      >
        <div className="mx-auto" style={{ maxWidth: 1320 }}>
          {/* Magazine 2-col header */}
          {showHeader && (
            <div className="pc-srv-head" style={{
              display: "grid",
              gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)",
              gap: "clamp(24px, 4vw, 64px)",
              alignItems: "end",
              paddingBottom: "clamp(40px, 5vw, 64px)",
              borderBottom: `1px solid ${INK}`,
              marginBottom: "clamp(28px, 3vw, 48px)",
            }}>
              <div>
                {eyebrow.trim() && (
                  <span style={{
                    display: "inline-block",
                    fontFamily: MONO, fontSize: 11, letterSpacing: "0.24em",
                    textTransform: "uppercase", color: "rgba(10,10,10,0.55)",
                    marginBottom: 18,
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
                    lineHeight: 1.05,
                    letterSpacing: "0.01em",
                    textTransform: "uppercase",
                    color: INK,
                    whiteSpace: "pre-line",
                    maxWidth: "12ch",
                  }}>
                    <GenericEditableText sectionId={sectionId} field="title" value={titleStr} tag="span" />
                  </h2>
                )}
              </div>
              {subtitle.trim() && (
                <p style={{
                  margin: 0,
                  fontFamily: OVERPASS,
                  fontWeight: 300,
                  fontSize: "clamp(14px, 1.2vw, 17px)",
                  lineHeight: 1.65,
                  color: "rgba(10,10,10,0.7)",
                  maxWidth: 460,
                  justifySelf: "end",
                }}>
                  <GenericEditableText sectionId={sectionId} field="subtitle" value={subtitle} tag="span" />
                </p>
              )}
            </div>
          )}

          {/* 2-col hairline grid of services */}
          <div className="pc-srv-grid" style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 480px), 1fr))",
            columnGap: "clamp(32px, 5vw, 72px)",
            rowGap: 0,
          }}>
            {services.map((s, i) => (
              <div
                key={`pc-srv-${i}`}
                className="pc-srv-row relative"
                style={{
                  display: "grid",
                  gridTemplateColumns: "minmax(0, 1fr) auto",
                  columnGap: 24,
                  alignItems: "baseline",
                  padding: "22px 0 22px 18px",
                  borderBottom: `1px solid rgba(10,10,10,0.12)`,
                  transition: "background-color 0.3s ease",
                }}
              >
                {/* Red left bar — slides in on hover */}
                <span aria-hidden="true" className="pc-srv-bar" style={{
                  position: "absolute", left: 0, top: 22, bottom: 22, width: 2,
                  backgroundColor: "#c41e3a",
                  transform: "scaleY(0)",
                  transformOrigin: "top",
                  transition: "transform 0.35s cubic-bezier(.4,0,.2,1)",
                }} />

                <div style={{ minWidth: 0 }}>
                  <div style={{
                    display: "flex", alignItems: "baseline", gap: 16, flexWrap: "wrap",
                    marginBottom: s.description ? 8 : 0,
                  }}>
                    <span
                      className="pc-srv-name"
                      style={{
                        fontFamily: OSWALD,
                        fontWeight: 600,
                        fontSize: "clamp(16px, 1.5vw, 20px)",
                        letterSpacing: "0.10em",
                        textTransform: "uppercase",
                        color: INK,
                      }}
                    >
                      <GenericEditableText sectionId={sectionId} field={`services.${i}.name`} value={s.name} tag="span" />
                    </span>
                    {s.duration && (
                      <span style={{
                        fontFamily: MONO, fontSize: 11, letterSpacing: "0.12em",
                        color: "rgba(10,10,10,0.5)",
                      }}>
                        <GenericEditableText sectionId={sectionId} field={`services.${i}.duration`} value={s.duration} tag="span" />
                      </span>
                    )}
                  </div>
                  {s.description && (
                    <p style={{
                      margin: 0,
                      fontFamily: OVERPASS, fontWeight: 400,
                      fontSize: 14, lineHeight: 1.55,
                      color: "rgba(10,10,10,0.65)",
                      maxWidth: 480,
                    }}>
                      <GenericEditableText sectionId={sectionId} field={`services.${i}.description`} value={s.description} tag="span" />
                    </p>
                  )}
                </div>

                {s.price && (
                  <span
                    className="pc-srv-price"
                    style={{
                      fontFamily: OSWALD,
                      fontWeight: 700,
                      fontSize: "clamp(17px, 1.6vw, 22px)",
                      letterSpacing: "0.04em",
                      color: INK,
                      whiteSpace: "nowrap",
                      transition: "color 0.3s ease",
                    }}
                  >
                    <GenericEditableText sectionId={sectionId} field={`services.${i}.price`} value={s.price} tag="span" />
                  </span>
                )}
              </div>
            ))}
          </div>

          {/* Footer note + CTA */}
          {(footerNote || footerCtaText) && (
            <div className="pc-srv-foot" style={{
              display: "flex", flexWrap: "wrap",
              alignItems: "center", justifyContent: "space-between",
              gap: 24,
              marginTop: "clamp(40px, 5vw, 64px)",
            }}>
              {footerNote && (
                <p style={{
                  margin: 0,
                  fontFamily: MONO, fontSize: 12, letterSpacing: "0.06em",
                  color: "rgba(10,10,10,0.55)",
                  maxWidth: 540,
                }}>
                  <GenericEditableText sectionId={sectionId} field="footerNote" value={footerNote} tag="span" />
                </p>
              )}
              {footerCtaText && (
                <a
                  href={
                    tenantSlug && footerCtaHref.startsWith("/")
                      ? `/demo/${tenantSlug}${isAdmin ? "/admin" : ""}${footerCtaHref}`
                      : footerCtaHref
                  }
                  className="pc-srv-foot-cta inline-flex items-center gap-3"
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
                  <GenericEditableText sectionId={sectionId} field="footerCtaText" value={footerCtaText} tag="span" />
                  <span aria-hidden="true" className="pc-srv-foot-arrow" style={{ transition: "transform 0.3s ease" }}>→</span>
                </a>
              )}
            </div>
          )}
        </div>
      </section>
    );
  }

  if (variant === "pricing-rows") {
    return (
      <section className="py-20 px-6" style={{ backgroundColor: "var(--color-bg, #fff)" }}>
        <div className="max-w-2xl mx-auto">
          <h2
            className="font-bold mb-2 uppercase"
            style={{
              fontFamily: "var(--font-heading)",
              color: "var(--color-text, #000)",
              fontSize: "clamp(1.5rem, 4vw, 2.5rem)",
              letterSpacing: "0.02em",
            }}
          >
            <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
          </h2>
          {/* Gradient rule under heading — peak-cut visual signature */}
          <div
            className="mb-12"
            style={{ height: 1, background: "linear-gradient(90deg,#000,transparent)", width: "100%" }}
          />
          <div>
            {services.map((s, i) => (
              <div
                key={i}
                className="flex justify-between items-start py-5"
                style={{
                  borderTop: i > 0 ? "none" : undefined,
                  position: "relative",
                }}
              >
                {i > 0 && (
                  <div
                    aria-hidden
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      height: 1,
                      background: "linear-gradient(90deg,#000,transparent)",
                    }}
                  />
                )}
                <div className="pr-4">
                  <p
                    className="font-medium mb-1 uppercase"
                    style={{
                      fontFamily: "var(--font-heading)",
                      color: "var(--color-text, #000)",
                      fontSize: "1.25rem",
                      letterSpacing: "0.02em",
                    }}
                  >
                    <GenericEditableText sectionId={sectionId} field={`services.${i}.name`} value={s.name} tag="span" />
                  </p>
                  <p
                    className="text-sm"
                    style={{ color: "var(--color-text-muted, #666)", fontFamily: "var(--font-body)", fontWeight: 200 }}
                  >
                    <GenericEditableText sectionId={sectionId} field={`services.${i}.description`} value={s.description} tag="span" />
                    {s.duration && <span style={{ opacity: 0.6 }}> · {s.duration}</span>}
                  </p>
                </div>
                {s.price && (
                  <span
                    className="font-semibold shrink-0"
                    style={{
                      color: "var(--color-primary, #004679)",
                      fontFamily: "var(--font-heading)",
                      fontSize: "1.125rem",
                      letterSpacing: "0.02em",
                    }}
                  >
                    <GenericEditableText sectionId={sectionId} field={`services.${i}.price`} value={s.price} tag="span" />
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (variant === "pricing-table-video") {
    const videoPoster = String(content.videoPoster ?? "");
    const leftTitle = String(content.leftTitle ?? "");
    const rightTitle = String(content.rightTitle ?? title);
    const eyebrow  = String((content as Record<string, unknown>).eyebrow  ?? "");
    const subtitle = String((content as Record<string, unknown>).subtitle ?? "");
    const columns = (content.columns as string[]) ?? [];
    const rows = (content.rows as Array<{ service: string; prices: string[] }>) ?? [];
    const notes = (content.notes as string[]) ?? [];
    const ctas = (content.ctas as Array<{ label: string; href: string; primary?: boolean }>) ?? [];
    const headerRef = useRef<HTMLDivElement>(null);
    const leftRef   = useRef<HTMLDivElement>(null);
    const rightRef  = useRef<HTMLDivElement>(null);
    useEffect(() => {
      const els = [headerRef.current, leftRef.current, rightRef.current].filter(Boolean) as HTMLElement[];
      const obs = els.map((el, i) => {
        const o = new IntersectionObserver(([e]) => { if (e.isIntersecting) { el.style.animationDelay = `${i * 0.15}s`; el.classList.add("b03s-vis"); o.disconnect(); } }, { threshold: 0.08 });
        o.observe(el); return o;
      });
      return () => obs.forEach(o => o.disconnect());
    }, []);
    return (
      <section
        id="cenik"
        className="relative overflow-hidden"
        style={{
          backgroundColor: "#0f0a07",
          padding: "clamp(96px, 13vw, 150px) 0",
        }}
        data-template="barber-03"
      >
        <style>{`
          @keyframes b03SFadeUp { from { opacity:0; transform:translateY(28px); } to { opacity:1; transform:translateY(0); } }
          .b03s-reveal { opacity: 0; }
          .b03s-reveal.b03s-vis { animation: b03SFadeUp 0.85s cubic-bezier(.22,.68,0,1.1) forwards; }
        `}</style>

        {/* Top + bottom gold hairlines */}
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

        {/* Warm radial ambient glow */}
        <div aria-hidden style={{
          position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0,
          background: "radial-gradient(ellipse at 30% 20%, rgba(200,169,110,0.07) 0%, transparent 55%)",
        }} />

        {/* Editorial centered header */}
        {(eyebrow || subtitle || title) && (
          <div
            ref={headerRef}
            className="b03s-reveal text-center max-w-[760px] mx-auto px-6"
            style={{ marginBottom: "clamp(56px, 8vw, 88px)", position: "relative", zIndex: 1 }}
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
                margin: "0 auto 22px",
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
                color: "rgba(245,239,230,0.72)",
                lineHeight: 1.7,
                margin: "0 auto",
                maxWidth: 600,
              }}>
                <GenericEditableText sectionId={sectionId} field="subtitle" value={subtitle} tag="span" />
              </p>
            )}
            {/* Decorative rule with diamond */}
            <div aria-hidden style={{ display: "inline-flex", alignItems: "center", gap: 14, marginTop: 28 }}>
              <span style={{ width: 48, height: 1, backgroundColor: "rgba(200,169,110,0.55)" }} />
              <span style={{ width: 6, height: 6, backgroundColor: "#c8a96e", transform: "rotate(45deg)" }} />
              <span style={{ width: 48, height: 1, backgroundColor: "rgba(200,169,110,0.55)" }} />
            </div>
          </div>
        )}

        <div className="max-w-[1280px] mx-auto px-6 lg:px-10 grid b03s-grid"
          style={{
            gap: "clamp(40px, 5vw, 72px)",
            gridTemplateColumns: "repeat(auto-fit, minmax(min(420px, 100%), 1fr))",
            position: "relative",
            zIndex: 1,
          }}
        >
          {/* LEFT — video showcase */}
          {videoPoster && (
            <div ref={leftRef} className="b03s-reveal b03s-video-col">
              {leftTitle && (
                <div style={{ marginBottom: 28 }}>
                  <div style={{ display: "inline-flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                    <span aria-hidden style={{ width: 36, height: 1, backgroundColor: "#c8a96e" }} />
                    <span style={{
                      fontFamily: "'Source Sans Pro', system-ui, sans-serif",
                      fontSize: 10,
                      fontWeight: 700,
                      letterSpacing: "0.32em",
                      textTransform: "uppercase",
                      color: "#c8a96e",
                    }}>
                      Showcase
                    </span>
                  </div>
                  <h3 style={{
                    fontFamily: "'Libre Baskerville', Georgia, serif",
                    color: "#f5efe6",
                    fontWeight: 700,
                    fontSize: "clamp(1.5rem, 2.8vw, 2.2rem)",
                    letterSpacing: "0.04em",
                    lineHeight: 1.15,
                    margin: 0,
                    textTransform: "uppercase",
                  }}>
                    <GenericEditableText sectionId={sectionId} field="leftTitle" value={leftTitle} tag="span" />
                  </h3>
                </div>
              )}
              <div className="b03s-video relative overflow-hidden" style={{
                aspectRatio: "16/9",
                borderRadius: 2,
                backgroundColor: "#1c1410",
                boxShadow: "0 24px 56px rgba(0,0,0,0.55)",
              }}>
                {/* Gold corner brackets */}
                <span aria-hidden className="b03s-video-corner b03s-video-corner-tl" style={{
                  position: "absolute", top: 14, left: 14, width: 28, height: 28, zIndex: 3,
                  borderTop: "1.5px solid #c8a96e", borderLeft: "1.5px solid #c8a96e",
                  transition: "all 0.4s cubic-bezier(.22,.68,0,1.1)",
                }} />
                <span aria-hidden className="b03s-video-corner b03s-video-corner-br" style={{
                  position: "absolute", bottom: 14, right: 14, width: 28, height: 28, zIndex: 3,
                  borderBottom: "1.5px solid #c8a96e", borderRight: "1.5px solid #c8a96e",
                  transition: "all 0.4s cubic-bezier(.22,.68,0,1.1)",
                }} />
                <GenericEditableImage sectionId={sectionId} field="videoPoster" src={videoPoster} alt={leftTitle} className="absolute inset-0 w-full h-full">
                  <Image src={videoPoster} alt={leftTitle} fill className="object-cover b03s-video-img" sizes="(max-width: 1024px) 100vw, 50vw" unoptimized={shouldSkipNextImageOptimization(videoPoster)} />
                </GenericEditableImage>
                <div aria-hidden className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(28,20,16,0.15) 0%, rgba(28,20,16,0.4) 100%)" }} />
                <div aria-hidden className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="b03s-play" style={{
                    width: 84, height: 84, borderRadius: 50,
                    border: "1.5px solid #c8a96e",
                    backgroundColor: "rgba(28,20,16,0.55)",
                    backdropFilter: "blur(4px)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "#c8a96e",
                    transition: "transform 0.45s cubic-bezier(.22,.68,0,1.1), background 0.3s ease",
                  }}>
                    <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* RIGHT — pricing table */}
          <div ref={rightRef} className="b03s-reveal">
            {rightTitle && (
              <div style={{ marginBottom: 28 }}>
                <div style={{ display: "inline-flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                  <span aria-hidden style={{ width: 36, height: 1, backgroundColor: "#c8a96e" }} />
                  <span style={{
                    fontFamily: "'Source Sans Pro', system-ui, sans-serif",
                    fontSize: 10,
                    fontWeight: 700,
                    letterSpacing: "0.32em",
                    textTransform: "uppercase",
                    color: "#c8a96e",
                  }}>
                    Ceník
                  </span>
                </div>
                <h3 style={{
                  fontFamily: "'Libre Baskerville', Georgia, serif",
                  color: "#f5efe6",
                  fontWeight: 700,
                  fontSize: "clamp(1.5rem, 2.8vw, 2.2rem)",
                  letterSpacing: "0.04em",
                  lineHeight: 1.15,
                  margin: 0,
                  textTransform: "uppercase",
                }}>
                  <GenericEditableText sectionId={sectionId} field="rightTitle" value={rightTitle} tag="span" />
                </h3>
              </div>
            )}
            <div className="overflow-x-auto">
              <table className="w-full b03s-table" style={{ borderCollapse: "collapse", color: "rgba(245,239,230,0.92)", fontFamily: "'Source Sans Pro', system-ui, sans-serif", fontSize: "0.94rem" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid rgba(200,169,110,0.45)" }}>
                    <th style={{ textAlign: "left", padding: "14px 8px", color: "#c8a96e", textTransform: "uppercase", letterSpacing: "0.16em", fontSize: "0.74rem", fontWeight: 700 }}><GenericEditableText sectionId={sectionId} field="serviceColumnLabel" value={String((content as Record<string, unknown>).serviceColumnLabel ?? "Služba")} tag="span" /></th>
                    {columns.map((col, ci) => (
                      <th key={ci} style={{ textAlign: "right", padding: "14px 8px", color: "#c8a96e", textTransform: "uppercase", letterSpacing: "0.16em", fontSize: "0.74rem", fontWeight: 700 }}>
                        <GenericEditableText sectionId={sectionId} field={`columns.${ci}`} value={col} tag="span" />
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, ri) => (
                    <tr key={ri} className="b03s-tr" style={{ borderBottom: "1px dashed rgba(200,169,110,0.16)", position: "relative" }}>
                      <td style={{
                        padding: "16px 8px",
                        fontFamily: "'Libre Baskerville', Georgia, serif",
                        fontStyle: "italic",
                        transition: "color 0.3s ease, padding-left 0.3s ease",
                      }}>
                        <GenericEditableText sectionId={sectionId} field={`rows.${ri}.service`} value={row.service} tag="span" />
                      </td>
                      {row.prices.map((p, pi) => (
                        <td key={pi} style={{
                          padding: "16px 8px",
                          textAlign: "right",
                          color: "#c8a96e",
                          fontWeight: 700,
                          letterSpacing: "0.02em",
                          fontFamily: "'Libre Baskerville', Georgia, serif",
                        }}>
                          <GenericEditableText sectionId={sectionId} field={`rows.${ri}.prices.${pi}`} value={p} tag="span" />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {notes.length > 0 && (
              <div className="mt-7" style={{ color: "rgba(245,239,230,0.55)", fontSize: "0.85rem", lineHeight: 1.7, fontStyle: "italic", fontFamily: "'Libre Baskerville', Georgia, serif" }}>
                {notes.map((n, ni) => (
                  <p key={ni} style={{ margin: "4px 0" }}>
                    <GenericEditableText sectionId={sectionId} field={`notes.${ni}`} value={n} tag="span" />
                  </p>
                ))}
              </div>
            )}
            {ctas.length > 0 && (
              <div className="mt-8 flex flex-wrap gap-4">
                {ctas.map((cta, ci) => {
                  const isPrimary = cta.primary !== false;
                  return (
                    <a
                      key={ci}
                      href={cta.href}
                      data-btn={isPrimary ? "primary" : "inverse"}
                      className={`inline-flex items-center justify-center uppercase no-underline ${isPrimary ? "b03s-cta-primary" : "b03s-cta-secondary"}`}
                      style={{
                        gap: 10,
                        border: isPrimary ? "1px solid #c8a96e" : "1px solid rgba(245,239,230,0.4)",
                        backgroundColor: isPrimary ? "#c8a96e" : "transparent",
                        color: isPrimary ? "#1c1410" : "#f5efe6",
                        fontFamily: "'Source Sans Pro', system-ui, sans-serif",
                        fontSize: 11.5,
                        fontWeight: 700,
                        letterSpacing: "0.24em",
                        padding: "15px 30px",
                        transition: "background 0.4s ease, border-color 0.4s ease, color 0.4s ease, box-shadow 0.4s ease, transform 0.3s ease",
                        boxShadow: isPrimary ? "0 6px 20px rgba(200,169,110,0.32)" : "none",
                      }}
                    >
                      <GenericEditableText sectionId={sectionId} field={`ctas.${ci}.label`} value={cta.label} tag="span" />
                      <span aria-hidden className="b03s-cta-arrow" style={{ display: "inline-flex", transition: "transform 0.4s cubic-bezier(.22,.68,0,1.1)" }}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                      </span>
                    </a>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </section>
    );
  }

  // Default: cards-grid
  return (
    <section className="py-20 px-6" style={{ backgroundColor: "var(--color-bg, #fff)" }}>
      <div className="max-w-5xl mx-auto">
        <h2
          className="text-3xl font-bold text-center mb-12"
          style={{ fontFamily: "var(--font-heading)", color: "var(--color-text, #111)" }}
        >
          <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((s, i) => (
            <div
              key={i}
              className="p-6 rounded-xl"
              style={{
                backgroundColor: "var(--color-surface, #f9fafb)",
                borderRadius: "var(--radius, 8px)",
              }}
            >
              {s.icon && <div className="text-3xl mb-3">{iconEmoji(s.icon)}</div>}
              <h3 className="font-bold mb-2" style={{ color: "var(--color-text, #111)" }}>
                <GenericEditableText sectionId={sectionId} field={`services.${i}.name`} value={s.name} tag="span" />
              </h3>
              <p className="text-sm" style={{ color: "var(--color-text-muted, #666)" }}>
                <GenericEditableText sectionId={sectionId} field={`services.${i}.description`} value={s.description} tag="span" />
              </p>
              {s.price && (
                <p className="font-semibold mt-3" style={{ color: "var(--color-primary, #6366f1)" }}>
                  <GenericEditableText sectionId={sectionId} field={`services.${i}.price`} value={s.price} tag="span" />
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// beauty-01: 3 service cards — portrait foto, name, price, desc, 2 CTA links
// Reference: selfbeauty.cz — krémové pozadí, Cormorant Garamond 30px name, Inter light desc
function Beauty01Services3col({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  // beauty-01 — Sand-Cream Editorial Wellness services 3-col
  // Magazine asymmetric header (eyebrow + Fahkwang H2 + subtitle), 3-col card grid with
  // portrait photo (zoom on hover), Fahkwang service name (sand color on hover), price + body + dual CTA.
  const cc = content as Record<string, unknown>;
  const eyebrowRaw  = cc.eyebrow;
  const titleRaw    = cc.title;
  const subtitleRaw = cc.subtitle;
  const eyebrow  = eyebrowRaw  === undefined ? "Naše služby" : String(eyebrowRaw);
  const titleStr = titleRaw    === undefined ? "Tři obory,\njeden rituál." : String(titleRaw);
  const subtitle = subtitleRaw === undefined ? "Holičství, manikúra a péče o pleť — každá disciplína v rukou specialisty, ale pod jednou střechou." : String(subtitleRaw);
  const showHeader = !!(eyebrow.trim() || titleStr.trim() || subtitle.trim());
  const items    = (cc.items as Array<{
    name: string; price?: string; description?: string; image?: string;
    ctaReservation?: string; ctaReservationHref?: string;
    ctaPricing?: string; ctaPricingHref?: string;
  }>) ?? [];

  const CREAM  = "#FFF8F1";
  const DARK   = "#1F1F1F";
  const MUTED  = "#5B4D43";
  const SAND   = "#E0BE9A";
  const FONT   = "'Fahkwang', Georgia, serif";
  const SANS   = "var(--font-overpass), 'Overpass', Inter, system-ui, sans-serif";
  const MONO   = "var(--font-overpass-mono), 'Overpass Mono', Menlo, monospace";

  return (
    <section
      id="sluzby"
      style={{
        backgroundColor: CREAM,
        padding: "clamp(72px, 9vw, 128px) clamp(24px, 5vw, 64px)",
      }}
      data-template="beauty-01"
    >
      <div style={{ maxWidth: 1320, margin: "0 auto" }}>
        {/* Magazine 2-col header — eyebrow + title L, subtitle R */}
        {showHeader && (
          <div className="b01-svc-head" style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)",
            gap: "clamp(24px, 4vw, 64px)",
            alignItems: "end",
            paddingBottom: "clamp(40px, 5vw, 64px)",
            borderBottom: `1px solid ${DARK}`,
            marginBottom: "clamp(40px, 5vw, 64px)",
          }}>
            <div>
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
                  margin: 0,
                  fontFamily: FONT, fontWeight: 500,
                  fontSize: "clamp(36px, 5.5vw, 72px)",
                  lineHeight: 1.08,
                  letterSpacing: "0.01em",
                  color: DARK,
                  whiteSpace: "pre-line",
                  maxWidth: "13ch",
                }}>
                  <GenericEditableText sectionId={sectionId} field="title" value={titleStr} tag="span" />
                </h2>
              )}
            </div>
            {subtitle.trim() && (
              <p style={{
                margin: 0,
                fontFamily: SANS, fontWeight: 300,
                fontSize: "clamp(14px, 1.2vw, 17px)",
                lineHeight: 1.65,
                color: MUTED,
                maxWidth: 460,
                justifySelf: "end",
              }}>
                <GenericEditableText sectionId={sectionId} field="subtitle" value={subtitle} tag="span" />
              </p>
            )}
          </div>
        )}

        {/* 3-col grid */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "clamp(24px, 3vw, 40px)",
        }}>
          {items.map((item, i) => (
            <article key={`svc-${i}`} className="b01-svc-card" style={{ display: "flex", flexDirection: "column" }}>
              {item.image && (
                <div className="b01-svc-img-wrap" style={{
                  width: "100%",
                  aspectRatio: "4 / 5",
                  position: "relative",
                  overflow: "hidden",
                  marginBottom: 24,
                  backgroundColor: "#f0e8df",
                }}>
                  <GenericEditableImage
                    sectionId={sectionId}
                    field={`items.${i}.image`}
                    src={item.image}
                    alt={item.name}
                    className="absolute inset-0 w-full h-full"
                    style={{ position: "absolute" }}
                  >
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="b01-svc-img object-cover object-center"
                      sizes="(max-width: 768px) 100vw, 33vw"
                      unoptimized={shouldSkipNextImageOptimization(item.image)}
                      style={{ transition: "transform 0.7s cubic-bezier(.4,0,.2,1)" }}
                    />
                  </GenericEditableImage>
                </div>
              )}

              <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12, marginBottom: 12 }}>
                <h3 className="b01-svc-name" style={{
                  margin: 0,
                  fontFamily: FONT, fontSize: "clamp(22px, 2vw, 28px)", fontWeight: 500,
                  color: DARK, lineHeight: 1.2,
                  letterSpacing: "0.01em",
                  transition: "color 0.3s ease",
                }}>
                  <GenericEditableText sectionId={sectionId} field={`items.${i}.name`} value={item.name} tag="span" />
                </h3>
                {item.price && (
                  <span style={{
                    fontFamily: MONO, fontSize: 13, fontWeight: 400,
                    color: DARK, letterSpacing: "0.04em", whiteSpace: "nowrap",
                  }}>
                    <GenericEditableText sectionId={sectionId} field={`items.${i}.price`} value={item.price} tag="span" />
                  </span>
                )}
              </div>

              {item.description && (
                <p style={{
                  margin: "0 0 24px",
                  fontFamily: SANS, fontWeight: 400,
                  fontSize: 14, lineHeight: 1.65,
                  color: MUTED,
                  flex: 1,
                }}>
                  <GenericEditableText sectionId={sectionId} field={`items.${i}.description`} value={item.description} tag="span" />
                </p>
              )}

              <div style={{ display: "flex", alignItems: "center", gap: 24, marginTop: "auto" }}>
                {item.ctaReservation && (
                  <a
                    href={item.ctaReservationHref ?? "/rezervace"}
                    className="b01-svc-cta-primary inline-flex items-center gap-2"
                    style={{
                      fontFamily: FONT, fontSize: 12, fontWeight: 500,
                      letterSpacing: "0.20em", textTransform: "uppercase",
                      color: DARK, textDecoration: "none",
                      borderBottom: `1px solid ${DARK}`,
                      paddingBottom: 3,
                      transition: "color 0.3s ease, border-color 0.3s ease",
                    }}
                  >
                    <GenericEditableText sectionId={sectionId} field={`items.${i}.ctaReservation`} value={item.ctaReservation} tag="span" />
                    <span aria-hidden="true" className="b01-svc-arrow" style={{ transition: "transform 0.3s ease" }}>→</span>
                  </a>
                )}
                {item.ctaPricing && (
                  <a
                    href={item.ctaPricingHref ?? "/cenik"}
                    className="b01-svc-cta-sec inline-flex items-center gap-2"
                    style={{
                      fontFamily: FONT, fontSize: 12, fontWeight: 400,
                      letterSpacing: "0.20em", textTransform: "uppercase",
                      color: MUTED, textDecoration: "none",
                      paddingBottom: 3,
                      transition: "color 0.3s ease",
                    }}
                  >
                    <GenericEditableText sectionId={sectionId} field={`items.${i}.ctaPricing`} value={item.ctaPricing} tag="span" />
                  </a>
                )}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── massage-01-services-3col ──────────────────────────────────────────────────
// 3-col grid, dark surface karty, 200px foto nahoře, Cormorant h3, gold cena
// Přesná replika .services-grid z praha-masaze.cz originálu
// ─────────────────────────────────────────────────────────────────────────────
function Massage01Services3col({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const sectionTag = String(content.sectionTag ?? "Naše služby");
  const heading    = String(content.heading    ?? "Masážní terapie");
  const subtitle   = String(content.subtitle   ?? "Každé sezení je přizpůsobeno jedinečným potřebám vašeho těla");
  const ctaText    = String(content.ctaText    ?? "Zobrazit kompletní nabídku");
  const ctaHref    = String(content.ctaHref    ?? "#rezervace");
  const items      = (content.items as Array<{
    image: string; title: string; description: string; price: string;
  }>) ?? [];

  const BG       = "#0A0A0A";
  const SURFACE  = "#141414";
  const BORDER   = "#2A2520";
  const GOLD     = "#C9A962";
  const GOLDDIM  = "rgba(201,169,98,0.25)";
  const TEXT     = "#F5F0E8";
  const SECONDARY= "#A09888";
  const FONT     = "'Inter', sans-serif";
  const SERIF    = "'Cormorant Garamond', serif";

  return (
    <section
      id="sluzby"
      style={{ backgroundColor: BG, padding: "100px 0" }}
      data-template="massage-01"
    >
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 80px" }}>
        {/* Section header */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, textAlign: "center", marginBottom: 56 }}>
          <p style={{ display: "inline-flex", alignItems: "center", gap: 8, color: GOLD, fontFamily: FONT, fontSize: 11, fontWeight: 500, letterSpacing: 3, textTransform: "uppercase", margin: 0 }}>
            <span style={{ display: "inline-block", width: 6, height: 6, background: GOLD, borderRadius: "50%" }} />
            <GenericEditableText sectionId={sectionId} field="sectionTag" value={sectionTag} tag="span" />
          </p>
          <h2 style={{ fontFamily: SERIF, fontSize: 44, fontWeight: 400, color: TEXT, lineHeight: 1.1, margin: 0 }}>
            <GenericEditableText sectionId={sectionId} field="heading" value={heading} tag="span" />
          </h2>
          <p style={{ fontFamily: FONT, fontSize: 15, fontWeight: 300, color: SECONDARY, maxWidth: 540, margin: 0 }}>
            <GenericEditableText sectionId={sectionId} field="subtitle" value={subtitle} tag="span" />
          </p>
        </div>

        {/* 3-col grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 24, marginBottom: 56 }}>
          {items.map((item, i) => (
            <div
              key={i}
              style={{ background: SURFACE, border: `1px solid ${BORDER}`, overflow: "hidden", display: "flex", flexDirection: "column", transition: "border-color 0.25s, transform 0.25s" }}
              onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = GOLDDIM; (e.currentTarget as HTMLDivElement).style.transform = "translateY(-4px)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = BORDER; (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)"; }}
            >
              {/* Foto */}
              <div style={{ height: 200, overflow: "hidden", flexShrink: 0 }}>
                <GenericEditableImage sectionId={sectionId} field={`items.${i}.image`} src={item.image} alt={item.title} style={{ width: "100%", height: "100%" }}>
                  <img loading="lazy" src={item.image} alt={item.title} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", transition: "transform 0.5s" }}
                    onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.04)"; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; }}
                  />
                </GenericEditableImage>
              </div>
              {/* Body */}
              <div style={{ padding: 28, display: "flex", flexDirection: "column", gap: 12, flex: 1 }}>
                <h3 style={{ fontFamily: SERIF, fontSize: 22, fontWeight: 500, color: TEXT, margin: 0 }}>
                  <GenericEditableText sectionId={sectionId} field={`items.${i}.title`} value={item.title} tag="span" />
                </h3>
                <p style={{ fontFamily: FONT, fontSize: 13, fontWeight: 300, color: SECONDARY, lineHeight: 1.6, margin: 0, flex: 1 }}>
                  <GenericEditableText sectionId={sectionId} field={`items.${i}.description`} value={item.description} tag="span" />
                </p>
                <p style={{ fontFamily: FONT, fontSize: 13, fontWeight: 700, color: GOLD, margin: 0 }}>
                  <GenericEditableText sectionId={sectionId} field={`items.${i}.price`} value={item.price} tag="span" />
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA — outline */}
        <div style={{ display: "flex", justifyContent: "center" }}>
          <a
            href={ctaHref}
            data-btn="primary"
            style={{ display: "inline-flex", alignItems: "center", padding: "18px 40px", fontFamily: FONT, fontSize: 14, fontWeight: 500, color: GOLD, border: `1px solid ${GOLDDIM}`, textDecoration: "none", transition: "border-color 0.25s" }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = GOLD; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = GOLDDIM; }}
          >
            <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
          </a>
        </div>
      </div>
    </section>
  );
}

function iconEmoji(icon: string): string {
  const map: Record<string, string> = {
    briefcase: "💼", users: "👥", home: "🏠", building: "🏛️",
  };
  return map[icon] ?? "📋";
}

// ── tawan-01-services ─────────────────────────────────────────────────────────
// 4-sloupcová mřížka masáží — foto nahoře, název + popis + cena dole
// BG #f8f7f5 (teplá béžová), karty bílé, bronze akcenty — 1:1 tawan.cz
// ─────────────────────────────────────────────────────────────────────────────
function ServicesTawan01({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  type Item = { image: string; title: string; description: string; price: string };
  const sectionTag = String(content.sectionTag ?? "Naše masáže");
  const heading    = String(content.heading    ?? "Vyberte si svou masáž");
  const subtitle   = String(content.subtitle   ?? "");
  const items      = (content.items as Item[] | undefined) ?? [];
  const ctaText    = String(content.ctaText    ?? "Zobrazit všechny masáže");
  const ctaHref    = String(content.ctaHref    ?? "#kontakt");

  const PURPLE = "#393145";
  const BRONZE = "#af8c6a";
  const MUTED  = "#6b6278";
  const FONT   = "'Muli', sans-serif";
  const btnRadius = "16px 0 16px 0";

  return (
    <section
      id="sluzby"
      style={{ backgroundColor: "#f8f7f5", padding: "96px 32px" }}
      data-template="tawan-01"
    >
      <style>{`
        .tw-srv-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 24px; }
        @media(max-width:900px){ .tw-srv-grid { grid-template-columns: repeat(2,1fr); } }
        @media(max-width:500px){ .tw-srv-grid { grid-template-columns: 1fr; } }
        .tw-srv-card { background:#fff; overflow:hidden; transition:box-shadow 0.3s, transform 0.3s; }
        .tw-srv-card:hover { box-shadow:0 8px 32px rgba(57,49,69,0.12); transform:translateY(-4px); }
        .tw-srv-img { overflow:hidden; }
        .tw-srv-img img { transition:transform 0.5s ease; width:100%; display:block; aspect-ratio:4/3; object-fit:cover; }
        .tw-srv-card:hover .tw-srv-img img { transform:scale(1.06); }
      `}</style>

      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: 56 }}>
        <span style={{ fontFamily: FONT, fontSize: 12, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase", color: BRONZE, display: "block", marginBottom: 16 }}>
          <GenericEditableText sectionId={sectionId} field="sectionTag" value={sectionTag} tag="span" />
        </span>
        <h2 style={{ fontFamily: FONT, fontSize: "clamp(28px,3vw,44px)", fontWeight: 300, color: PURPLE, margin: "0 0 16px", letterSpacing: 1 }}>
          <GenericEditableText sectionId={sectionId} field="heading" value={heading} tag="span" />
        </h2>
        {subtitle && (
          <p style={{ fontFamily: FONT, fontSize: 16, fontWeight: 300, color: MUTED, margin: 0 }}>
            <GenericEditableText sectionId={sectionId} field="subtitle" value={subtitle} tag="span" />
          </p>
        )}
        <div style={{ width: 48, height: 1, backgroundColor: BRONZE, margin: "20px auto 0" }} />
      </div>

      {/* Karty */}
      <div className="tw-srv-grid" style={{ maxWidth: 1200, margin: "0 auto 56px" }}>
        {items.map((item, i) => (
          <div key={i} className="tw-srv-card">
            {/* Fotka */}
            <div className="tw-srv-img">
              <GenericEditableImage sectionId={sectionId} field={`items.${i}.image`} src={item.image} alt={item.title}>
                <img loading="lazy" src={item.image} alt={item.title} />
              </GenericEditableImage>
            </div>
            {/* Obsah */}
            <div style={{ padding: "24px 20px 28px" }}>
              <h3 style={{ fontFamily: FONT, fontSize: 17, fontWeight: 700, color: PURPLE, margin: "0 0 10px", letterSpacing: 0.3 }}>
                <GenericEditableText sectionId={sectionId} field={`items.${i}.title`} value={item.title} tag="span" />
              </h3>
              <p style={{ fontFamily: FONT, fontSize: 14, fontWeight: 300, color: MUTED, margin: "0 0 16px", lineHeight: 1.65 }}>
                <GenericEditableText sectionId={sectionId} field={`items.${i}.description`} value={item.description} tag="span" />
              </p>
              {/* Cena + linka */}
              <div style={{ borderTop: `1px solid ${BRONZE}33`, paddingTop: 14, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontFamily: FONT, fontSize: 15, fontWeight: 700, color: BRONZE, letterSpacing: 0.5 }}>
                  <GenericEditableText sectionId={sectionId} field={`items.${i}.price`} value={item.price} tag="span" />
                </span>
                <a href={ctaHref} data-btn="primary" style={{ fontFamily: FONT, fontSize: 12, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", color: PURPLE, textDecoration: "none", opacity: 0.6, transition: "opacity 0.2s" }}
                  onMouseEnter={e => (e.currentTarget.style.opacity = "1")}
                  onMouseLeave={e => (e.currentTarget.style.opacity = "0.6")}
                >
                  Rezervovat →
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* CTA tlačítko */}
      <div style={{ textAlign: "center" }}>
        <a
          href={ctaHref}
          data-btn="primary"
          style={{
            fontFamily: FONT, fontSize: 13, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase",
            color: "#fff", textDecoration: "none",
            display: "inline-block", padding: "0 40px", height: 52, lineHeight: "52px",
            backgroundColor: BRONZE, borderRadius: btnRadius, transition: "background 0.2s",
          }}
          onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#c19d7b")}
          onMouseLeave={e => (e.currentTarget.style.backgroundColor = BRONZE)}
        >
          <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
        </a>
      </div>
    </section>
  );
}

// ── ananda-01-services ────────────────────────────────────────────────────────
// Cream bg, centered gold H2 + subtitle, 4-col karty
// Karta: foto s tmavým overlay + arch clip na vrcholu + bílý titulek + popis + "VÍCE ZDE →"
// Hover: foto zoom + overlay zesvětlí + CTA podtržení
// Ref: anandaspa.cz "Nabídka procedur a programů"
// ─────────────────────────────────────────────────────────────────────────────
function ServicesAnanda01({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const title    = String(content.title    ?? "NABÍDKA PROCEDUR A PROGRAMŮ");
  const ctaText  = String(content.ctaText  ?? "VÍCE ZDE");

  type Card = { image: string; title: string; description: string; href: string };
  const rawCards = (content.cards as Card[] | undefined) ?? [];
  const cards: Card[] = rawCards.length > 0 ? rawCards : [
    { image: "/templates/ananda-01/service-1.jpg", title: "ÁJURVÉDSKÉ PROCEDURY",  description: "Jednotlivé ájurvédské terapie a procedury",    href: "#sluzby" },
    { image: "/templates/ananda-01/service-2.jpg", title: "DIAGNOSTIKA",            description: "Konzultace s ájurvédským lékařem a specialisty", href: "#sluzby" },
    { image: "/templates/ananda-01/service-3.jpg", title: "LÉČEBNÉ PROGRAMY",       description: "Komplexní balíčky ájurvédských procedur",        href: "#sluzby" },
    { image: "/templates/ananda-01/service-4.jpg", title: "SPA & BODY RELAX",       description: "Neájurvédské relaxační rituály a wellness",       href: "#sluzby" },
  ];

  const GOLD  = "#AA813A";
  const CREAM = "#F2EDE4";
  const FONT  = "'Jost', sans-serif";

  return (
    <section id="sluzby" style={{ backgroundColor: CREAM, padding: "80px 0" }}>
      <style>{`
        .ana-srv-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 24px;
          max-width: 1280px;
          margin: 56px auto 0;
          padding: 0 32px;
        }
        @media(max-width: 900px) { .ana-srv-grid { grid-template-columns: repeat(2, 1fr); } }
        @media(max-width: 540px) { .ana-srv-grid { grid-template-columns: 1fr; } }

        .ana-srv-card {
          position: relative;
          overflow: hidden;
          cursor: pointer;
          border-radius: 2px;
          aspect-ratio: 3/4;
          background: #1a1208;
        }
        /* Arch clip — pointed arch at top (clip-path polygon) */
        .ana-srv-card::before {
          content: '';
          position: absolute;
          inset: 0;
          z-index: 3;
          background: ${CREAM};
          clip-path: polygon(
            0% 0%,
            100% 0%,
            100% 12%,
            50% 0%,
            0% 12%
          );
        }

        .ana-srv-img {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.45s cubic-bezier(0.25, 0.46, 0.45, 0.94);
          z-index: 0;
        }
        .ana-srv-card:hover .ana-srv-img { transform: scale(1.13); }

        /* Dark gradient overlay */
        .ana-srv-overlay {
          position: absolute;
          inset: 0;
          z-index: 1;
          background: linear-gradient(to top, rgba(0,0,0,0.78) 0%, rgba(0,0,0,0.25) 55%, transparent 100%);
          transition: background 0.4s ease;
        }
        .ana-srv-card:hover .ana-srv-overlay {
          background: linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.38) 55%, transparent 100%);
        }

        .ana-srv-body {
          position: absolute;
          bottom: 0; left: 0; right: 0;
          z-index: 2;
          padding: 28px 24px 32px;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .ana-srv-title {
          font-family: ${FONT};
          font-size: 13px;
          font-weight: 600;
          letter-spacing: 3px;
          text-transform: uppercase;
          color: #ffffff;
          margin: 0;
          line-height: 1.5;
        }
        .ana-srv-desc {
          font-family: ${FONT};
          font-size: 13px;
          font-weight: 300;
          color: rgba(255,255,255,0.75);
          margin: 0;
          line-height: 1.6;
        }
        .ana-srv-cta {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-family: ${FONT};
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 3px;
          text-transform: uppercase;
          color: ${GOLD};
          text-decoration: none;
          margin-top: 6px;
          border-bottom: 1px solid transparent;
          transition: border-color 0.25s, gap 0.25s;
          width: fit-content;
        }
        .ana-srv-card:hover .ana-srv-cta {
          border-bottom-color: ${GOLD};
          gap: 14px;
        }
      `}</style>

      {/* Header */}
      <div style={{ textAlign: "center", padding: "0 32px" }}>
        <h2 style={{ fontFamily: FONT, fontSize: "clamp(16px, 2vw, 20px)", fontWeight: 500, color: GOLD, letterSpacing: 5, textTransform: "uppercase", margin: 0 }}>
          <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
        </h2>
      </div>

      {/* Grid karet */}
      <div className="ana-srv-grid">
        {cards.map((card, i) => (
          <a key={i} href={card.href} className="ana-srv-card" style={{ textDecoration: "none" }}>
            {/* Fotka */}
            <GenericEditableImage
              sectionId={sectionId}
              field={`cards.${i}.image`}
              src={card.image}
              alt={card.title}
              style={{ position: "absolute", inset: 0 }}
            >
              <Image
                src={card.image}
                alt={card.title}
                fill
                className="ana-srv-img"
                sizes="(max-width: 540px) 100vw, (max-width: 900px) 50vw, 25vw"
                unoptimized={shouldSkipNextImageOptimization(card.image)}
              />
            </GenericEditableImage>

            {/* Overlay */}
            <div className="ana-srv-overlay" aria-hidden />

            {/* Text */}
            <div className="ana-srv-body">
              <p className="ana-srv-title">
                <GenericEditableText sectionId={sectionId} field={`cards.${i}.title`} value={card.title} tag="span" />
              </p>
              <p className="ana-srv-desc">
                <GenericEditableText sectionId={sectionId} field={`cards.${i}.description`} value={card.description} tag="span" />
              </p>
              <span className="ana-srv-cta">
                {ctaText}
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 6" width="20" height="6" fill="none">
                  <path stroke="currentColor" strokeWidth="1" d="M20,6l-.4-.4,2.4-2.4H0v-.6h22l-2.4-2.4L20,0l4,3Z"/>
                </svg>
              </span>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}

// ─── tawan-02-services ───────────────────────────────────────────────────────
function ServicesTawan02({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  type CardItem = { title?: string; desc?: string; image?: string; duration?: string; price?: string; badges?: string[] };
  const title = String(content.title ?? "Oblíbené masáže");
  const items = (content.items as CardItem[]) ?? [];

  const CLONES = 4;
  // Clone last N cards to the front, first N to the back → infinite loop
  const all = [...items.slice(-CLONES), ...items, ...items.slice(0, CLONES)];

  const trackRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const GAP = 24;

  const cardW = () => {
    const t = trackRef.current;
    const c = t?.querySelector<HTMLElement>(".t02-svc-card");
    return c ? c.offsetWidth + GAP : 0;
  };

  // On mount: jump to first real card (skip leading clones), instant — no animation
  useEffect(() => {
    const t = trackRef.current;
    if (!t) return;
    // rAF ensures cards are laid out before we measure
    requestAnimationFrame(() => {
      const w = cardW();
      if (w) t.scrollLeft = w * CLONES;
    });
  }, []);

  // After scroll settles, teleport from clone zone to real zone (invisible)
  const handleScroll = () => {
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      const t = trackRef.current;
      if (!t) return;
      const w = cardW();
      if (!w) return;
      const realStart = w * CLONES;
      const realEnd   = w * (CLONES + items.length);
      if (t.scrollLeft >= realEnd)          t.scrollLeft = realStart + (t.scrollLeft - realEnd);
      else if (t.scrollLeft < realStart)    t.scrollLeft = realEnd   + (t.scrollLeft - realStart);
    }, 120);
  };

  const scrollByCard = (dir: 1 | -1) => {
    const w = cardW();
    if (!w) return;
    trackRef.current?.scrollBy({ left: dir * w, behavior: "smooth" });
  };

  const FONT = "Candara, 'Trebuchet MS', Arial, sans-serif";

  return (
    <section style={{ backgroundColor: "#fff", padding: "80px 0 100px", fontFamily: FONT }}>
      <style>{`
        .t02-svc-track {
          display: flex;
          gap: ${GAP}px;
          overflow-x: auto;
          scroll-snap-type: x mandatory;
          -webkit-overflow-scrolling: touch;
          scrollbar-width: none;
          padding-bottom: 4px;
        }
        .t02-svc-track::-webkit-scrollbar { display: none; }
        .t02-svc-card {
          flex: 0 0 calc((100% - ${GAP * 2}px) / 3.15);
          min-width: 280px;
          scroll-snap-align: start;
          background: linear-gradient(180deg, #AD8F78 0%, #EAE3DE 76%, #EAE3DE 100%);
          border-radius: 20px;
          box-shadow: 2px 2px 18px rgba(146,114,89,0.22);
          display: flex; flex-direction: column;
          color: rgba(60,47,37,0.65);
          text-decoration: none;
          position: relative;
          overflow: hidden;
          transition: box-shadow 0.35s, transform 0.35s;
        }
        .t02-svc-card:hover { box-shadow: 4px 6px 28px rgba(146,114,89,0.38); transform: translateY(-4px); }
        .t02-svc-media { display: block; width: 100%; padding-top: 66%; position: relative; overflow: hidden; border-radius: 20px 20px 0 0; }
        .t02-svc-media img { position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: cover; border-radius: 20px 20px 0 0; transition: transform 1.3s cubic-bezier(.22,1,.36,1); }
        .t02-svc-card:hover .t02-svc-media img { transform: scale(1.08); }
        .t02-svc-badge { position: absolute; background: #927259; color: #fff; font-size: 12px; font-weight: 700; z-index: 1; top: 16px; left: 16px; padding: 4px 11px; border-radius: 4px; letter-spacing: 0.5px; }
        .t02-svc-body { padding: 22px 22px 0; }
        .t02-svc-body h3 { font-size: 22px; font-weight: 700; color: rgba(60,47,37,0.92); margin: 0 0 8px; font-family: Candara,'Trebuchet MS',Arial,sans-serif; }
        .t02-svc-body p { margin: 0; line-height: 26px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; font-size: 14px; }
        .t02-svc-info { padding: 16px 22px 22px; margin-top: auto; }
        .t02-svc-price-row { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 16px; }
        .t02-dur  { font-size: 17px; color: #3C2F25; }
        .t02-price { font-size: 21px; font-weight: 700; color: #3C2F25; }
        .t02-svc-btn { background: #CFBDB0; width: 100%; color: #3C2F25; padding: 10px 0; border: none; border-radius: 8px; font-family: Candara,'Trebuchet MS',Arial,sans-serif; font-size: 13px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; cursor: pointer; transition: background 0.25s, color 0.25s; }
        .t02-svc-btn:hover, .t02-svc-card:hover .t02-svc-btn { background: #927259; color: #fff; }
        .t02-svc-arrow { width: 46px; height: 46px; border-radius: 50%; border: 1.5px solid #AD8F78; background: #fff; cursor: pointer; display: flex; align-items: center; justify-content: center; color: #AD8F78; transition: background 0.2s, color 0.2s, box-shadow 0.2s; flex-shrink: 0; box-shadow: 0 2px 8px rgba(146,114,89,0.15); }
        .t02-svc-arrow:hover { background: #AD8F78; color: #fff; box-shadow: 0 4px 12px rgba(146,114,89,0.3); }
        @media(max-width: 900px) {
          .t02-svc-card { flex: 0 0 calc((100% - ${GAP}px) / 2.15); }
        }
        @media(max-width: 580px) {
          .t02-svc-card { flex: 0 0 85%; }
        }
      `}</style>

      {/* Nadpis */}
      <div style={{ textAlign: "center", marginBottom: 48 }}>
        <h2 style={{ fontFamily: FONT, fontSize: "clamp(26px,3.5vw,38px)", fontWeight: 700, color: "#3C2F25", margin: 0 }}><GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" /></h2>
      </div>

      {/* Slider + arrows */}
      <div style={{ maxWidth: 1360, margin: "0 auto", padding: "0 32px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>

          {/* Prev */}
          <button className="t02-svc-arrow" onClick={() => scrollByCard(-1)} aria-label="Předchozí">
            <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
              <path d="M7 1.5L3 5.5L7 9.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          {/* Track — all = leading clones + real + trailing clones */}
          <div ref={trackRef} className="t02-svc-track" style={{ flex: 1 }} onScroll={handleScroll}>
            {all.map((item, i) => {
              const realIdx = i - CLONES;
              const isReal = realIdx >= 0 && realIdx < items.length;
              return (
              <div key={i} className="t02-svc-card">
                <div className="t02-svc-media">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.image ?? ""} alt={item.title ?? ""} loading="lazy" />
                  {item.badges && item.badges.length > 0 && (
                    <span className="t02-svc-badge">{item.badges[0]}</span>
                  )}
                </div>
                <div className="t02-svc-body">
                  <h3>{isReal ? <GenericEditableText sectionId={sectionId} field={`items.${realIdx}.title`} value={item.title ?? ""} tag="span" /> : item.title}</h3>
                  <p>{isReal ? <GenericEditableText sectionId={sectionId} field={`items.${realIdx}.desc`} value={item.desc ?? ""} tag="span" /> : item.desc}</p>
                </div>
                <div className="t02-svc-info">
                  <div className="t02-svc-price-row">
                    <span className="t02-dur">{isReal ? <GenericEditableText sectionId={sectionId} field={`items.${realIdx}.duration`} value={item.duration ?? ""} tag="span" /> : item.duration}</span>
                    <span className="t02-price">{isReal ? <GenericEditableText sectionId={sectionId} field={`items.${realIdx}.price`} value={item.price ?? ""} tag="span" /> : item.price}</span>
                  </div>
                  <button className="t02-svc-btn">Detail</button>
                </div>
              </div>
              );
            })}
          </div>

          {/* Next */}
          <button className="t02-svc-arrow" onClick={() => scrollByCard(1)} aria-label="Další">
            <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
              <path d="M4 1.5L8 5.5L4 9.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

        </div>
      </div>
    </section>
  );
}

// ── tattoo-03-services ────────────────────────────────────────────────────────
// 4 service karty — magictattoo.cz "Na co se specializujeme"
// Tmavý bg #0e0e0e, 4-col grid, portrait foto (3/4) + červená linka + název + text + CTA
// ─────────────────────────────────────────────────────────────────────────────
function ServicesTattoo03({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const c          = content as Record<string, unknown>;
  const heading    = String(c.heading    ?? "Na co se specializujeme");
  const subheading = String(c.subheading ?? "Co děláme");
  const rawItems   = (c.items as Array<{ title: string; text: string; image: string; href: string }>) ?? [];

  const BG     = "#0e0e0e";
  const ACCENT = "#D41515";

  return (
    <section id="sluzby" style={{ backgroundColor: BG, padding: "clamp(48px,7vw,96px) clamp(20px,4vw,40px)" }}>
      <div style={{ maxWidth: 1360, margin: "0 auto" }}>
        {/* Nadpis */}
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <p style={{
            fontFamily: "Arial, Helvetica, sans-serif",
            fontSize: "0.75rem",
            fontWeight: 700,
            color: ACCENT,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            margin: "0 0 8px",
          }}>
            <GenericEditableText sectionId={sectionId} field="subheading" value={subheading} tag="span" />
          </p>
          <h2 style={{
            fontFamily: "Arial, Helvetica, sans-serif",
            fontWeight: 900,
            fontSize: "clamp(22px, 2.8vw, 38px)",
            color: "#ffffff",
            margin: 0,
          }}>
            <GenericEditableText sectionId={sectionId} field="heading" value={heading} tag="span" />
          </h2>
        </div>

        {/* 4-col karty */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: 24,
        }}>
          {rawItems.map((item, i) => (
            <div
              key={i}
              style={{
                backgroundColor: "#141414",
                border: "1px solid rgba(255,255,255,0.06)",
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
              }}
            >
              {/* Foto */}
              <div style={{ aspectRatio: "3/4", overflow: "hidden", position: "relative" }}>
                <GenericEditableImage sectionId={sectionId} field={`items.${i}.image`} src={item.image} alt={item.title} className="w-full h-full" style={{ width: "100%", height: "100%" }}>
                  <img
                    src={item.image}
                    alt={item.title}
                    style={{
                      width: "100%", height: "100%",
                      objectFit: "cover", objectPosition: "center",
                      transition: "transform 0.4s ease",
                    }}
                    onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.04)")}
                    onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
                  />
                </GenericEditableImage>
              </div>

              {/* Červená linka */}
              <div style={{ height: 3, backgroundColor: ACCENT }} />

              {/* Obsah */}
              <div style={{ padding: "24px 24px 28px", flex: 1, display: "flex", flexDirection: "column" }}>
                <h3 style={{
                  fontFamily: "Arial, Helvetica, sans-serif",
                  fontWeight: 700,
                  fontSize: "clamp(16px, 1.5vw, 19px)",
                  color: "#ffffff",
                  margin: "0 0 10px",
                  lineHeight: 1.3,
                }}>
                  <GenericEditableText sectionId={sectionId} field={`items.${i}.title`} value={item.title} tag="span" />
                </h3>
                <p style={{
                  fontFamily: "Arial, Helvetica, sans-serif",
                  fontSize: "0.84rem",
                  color: "rgba(255,255,255,0.62)",
                  lineHeight: 1.7,
                  margin: "0 0 20px",
                  flex: 1,
                }}>
                  <GenericEditableText sectionId={sectionId} field={`items.${i}.text`} value={item.text} tag="span" />
                </p>
                <a
                  href={item.href || "#kontakt"}
                  style={{
                    display: "inline-flex", alignItems: "center",
                    fontSize: "0.78rem",
                    fontWeight: 700,
                    color: ACCENT,
                    textDecoration: "none",
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                  }}
                >
                  Zjistit více →
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// nails-01: 2×2 grid, square images, service name + arrow + right-aligned list — 1:1 soho-nails.cz
function ServicesNails01({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const BURGUNDY = "#79142b";
  const SERIF    = "Georgia, 'Times New Roman', serif";
  const SANS     = "'Montserrat', 'Helvetica Neue', Arial, sans-serif";

  type ServiceItem = { name?: string; description?: string; imageUrl?: string };
  const items   = (content.items as ServiceItem[]) ?? [];
  const title   = (content.title as string)       ?? "Objevte naše";
  const titleAc = (content.titleAccent as string) ?? "jedinečné služby";

  return (
    <section
      id="sluzby"
      data-template="nails-01"
      style={{ backgroundColor: "#ffffff", padding: "clamp(60px, 8vh, 96px) clamp(24px, 6vw, 80px)" }}
    >
      <style>{`
        .n01-services-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: clamp(24px, 3vw, 48px); max-width: 960px; margin: 0 auto; }
        @media (max-width: 600px) { .n01-services-grid { grid-template-columns: 1fr; } }
      `}</style>

      {/* Heading */}
      <div style={{ textAlign: "center", marginBottom: "clamp(40px, 5vh, 64px)" }}>
        <h2 style={{ fontFamily: SERIF, fontSize: "clamp(26px, 3vw, 40px)", fontWeight: 400, color: BURGUNDY, lineHeight: 1.2, margin: 0 }}>
          <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
          <br />
          <GenericEditableText sectionId={sectionId} field="titleAccent" value={titleAc} tag="span" />
        </h2>
      </div>

      {/* 2×2 grid → 1-col na mobilu */}
      <div className="n01-services-grid">
        {items.map((item, i) => (
          <div key={i} style={{ display: "flex", flexDirection: "column" }}>
            {/* Square image */}
            <GenericEditableImage
              sectionId={sectionId}
              field={`items.${i}.imageUrl`}
              src={item.imageUrl ?? ""}
              alt={item.name ?? ""}
              style={{ width: "100%", aspectRatio: "1 / 1", overflow: "hidden", borderRadius: "2px" }}
            >
              {item.imageUrl ? (
                <img loading="lazy" src={item.imageUrl} alt={item.name ?? ""} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
              ) : (
                <div style={{ width: "100%", height: "100%", backgroundColor: "#f0ece4" }} />
              )}
            </GenericEditableImage>

            {/* Name + arrow */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "14px" }}>
              <h4 style={{ fontFamily: SERIF, fontSize: "clamp(16px, 1.4vw, 20px)", fontWeight: 600, color: BURGUNDY, margin: 0 }}>
                <GenericEditableText sectionId={sectionId} field={`items.${i}.name`} value={item.name ?? ""} tag="span" />
              </h4>
              <a href="#cenik" aria-label={`Ceník – ${item.name}`} style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 36, height: 36, borderRadius: "50%", border: `1.5px solid ${BURGUNDY}`, color: BURGUNDY, textDecoration: "none", flexShrink: 0, fontSize: "1rem" }}>↗</a>
            </div>

            {/* Description — celé pole editovatelné */}
            <div style={{ marginTop: "10px", textAlign: "right" }}>
              <GenericEditableText
                sectionId={sectionId}
                field={`items.${i}.description`}
                value={item.description ?? ""}
                tag="p"
                style={{ fontFamily: SANS, fontSize: "clamp(12px, 1vw, 14px)", color: "#555", margin: 0, lineHeight: 1.7, whiteSpace: "pre-line" } as React.CSSProperties}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ── nails-02-pricing ──────────────────────────────────────────────────────────
// Editoriální ceník — cream bg, (02) prefix + serif italic "Ceník" + taupe linka
// + intro. Skupiny služeb (Manikúra, Pedikúra, Nail design) s názvem skupiny
// jako podtitulek a 2-col tabulkou (name — taupe dotted line — price Kč).
// ─────────────────────────────────────────────────────────────────────────────
interface PricingItem { name: string; price: string; note?: string }
interface PricingGroup { title: string; items: PricingItem[] }

function PricingNails02({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const WINE  = "#6b3f38";
  const TAUPE = "#d4a080";
  const CREAM = "#f6efe9";
  const INK   = "#3a2a25";

  const numberPrefix = String(content.numberPrefix ?? "(02)");
  const title        = String(content.title        ?? "Ceník");
  const lead         = String(content.lead         ?? "Demonstrační ceník — všechny ceny v Kč včetně DPH. Skutečné ceny upraví majitel přes editor.");
  const groups       = (content.groups as PricingGroup[]) ?? [];

  return (
    <section
      id="cenik"
      data-section-type="services"
      data-variant="nails-02-pricing"
      data-template="nails-02"
      style={{
        backgroundColor: CREAM,
        padding: "clamp(80px, 12vw, 160px) clamp(24px, 6vw, 72px)",
      }}
    >
      <div style={{ maxWidth: 1080, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ marginBottom: "clamp(56px, 8vw, 96px)" }}>
          <div
            style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontStyle: "italic",
              fontSize: "clamp(1.5rem, 2vw, 2rem)",
              color: TAUPE,
              letterSpacing: "0.06em",
              marginBottom: 28,
            }}
          >
            <GenericEditableText sectionId={sectionId} field="numberPrefix" value={numberPrefix} tag="span" />
          </div>
          <h2
            style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontStyle: "italic",
              fontWeight: 400,
              fontSize: "clamp(3.2rem, 6.8vw, 6.4rem)",
              lineHeight: 1,
              color: WINE,
              margin: 0,
              letterSpacing: "-0.01em",
            }}
          >
            <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
          </h2>
          <div aria-hidden="true" style={{ width: 64, height: 1, backgroundColor: TAUPE, margin: "40px 0 28px" }} />
          <p
            style={{
              fontFamily: "'Poppins', 'Helvetica Neue', Arial, sans-serif",
              fontSize: "1rem",
              fontWeight: 300,
              lineHeight: 1.7,
              color: INK,
              maxWidth: 580,
              margin: 0,
            }}
          >
            <GenericEditableText sectionId={sectionId} field="lead" value={lead} tag="span" />
          </p>
        </div>

        {/* Pricing groups — 2-col on desktop, stacked on mobile */}
        <div
          className="nails02-pricing-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
            columnGap: "clamp(48px, 7vw, 96px)",
            rowGap: "clamp(56px, 7vw, 80px)",
          }}
        >
          {groups.map((group, gi) => (
            <div key={`pg-${gi}`}>
              <h3
                style={{
                  fontFamily: "'Cormorant Garamond', Georgia, serif",
                  fontStyle: "italic",
                  fontWeight: 500,
                  fontSize: "1.85rem",
                  color: WINE,
                  margin: "0 0 28px",
                  letterSpacing: "0.005em",
                }}
              >
                <GenericEditableText sectionId={sectionId} field={`groups.${gi}.title`} value={group.title} tag="span" />
              </h3>
              <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 18 }}>
                {(group.items ?? []).map((item, ii) => (
                  <li
                    key={`pg-${gi}-it-${ii}`}
                    style={{
                      display: "flex",
                      alignItems: "baseline",
                      gap: 12,
                      fontFamily: "'Poppins', 'Helvetica Neue', Arial, sans-serif",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "1rem",
                        fontWeight: 400,
                        color: INK,
                        whiteSpace: "nowrap",
                        flexShrink: 0,
                        maxWidth: "60%",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      <GenericEditableText sectionId={sectionId} field={`groups.${gi}.items.${ii}.name`} value={item.name} tag="span" />
                    </span>
                    <span
                      aria-hidden="true"
                      style={{
                        flex: 1,
                        height: 1,
                        marginBottom: 4,
                        borderBottom: `1px dotted ${TAUPE}`,
                        opacity: 0.7,
                      }}
                    />
                    <span
                      style={{
                        fontSize: "1rem",
                        fontWeight: 500,
                        color: WINE,
                        whiteSpace: "nowrap",
                        letterSpacing: "0.02em",
                      }}
                    >
                      <GenericEditableText sectionId={sectionId} field={`groups.${gi}.items.${ii}.price`} value={item.price} tag="span" />
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
      <style>{`
        @media (max-width: 768px) {
          .nails02-pricing-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}

// ── nails-03-services ─────────────────────────────────────────────────────────
// maidenstudio.cz — cream #FCF9F0 bg; centrovaný kicker + H2; 4 tab tlačítka
// (Manikúra / Pedikúra / Kosmetika / Obočí); aktivní = brown pill;
// pod taby: seznam název + dotted + cena; CTA "Objednat se" dole.
// ─────────────────────────────────────────────────────────────────────────────
function ServicesNails03({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const CREAM = "#FCF9F0";
  const DARK  = "#0B090C";
  const BROWN = "#806248";
  const MUTED = "#5a5047";
  const SURF  = "#f3ede3";
  const FONT  = "'Manrope', 'Helvetica Neue', Arial, sans-serif";

  const title   = String(content.title   ?? "Naše služby");
  const kicker  = String(content.kicker  ?? "Péče pro dokonalý vzhled");
  const ctaText = String(content.ctaText ?? "Objednat se");

  interface ServiceItem { name: string; price: string; }
  interface ServiceGroup { title: string; icon?: string; items: ServiceItem[]; }

  const groups: ServiceGroup[] = (content.groups as ServiceGroup[]) ?? [
    { title: "Manikúra", items: [{ name: "Klasická manikúra", price: "550 Kč" }] },
  ];

  const [active, setActive] = useState(0);
  const activeGroup = groups[active] ?? groups[0];

  return (
    <section
      id="sluzby"
      data-section-type="services"
      data-variant="nails-03-services"
      style={{ backgroundColor: CREAM, padding: "96px 24px" }}
    >
      <div style={{ maxWidth: 860, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <p style={{
            fontFamily: FONT, fontWeight: 700, fontSize: "0.72rem",
            letterSpacing: "0.28em", textTransform: "uppercase",
            color: BROWN, margin: "0 0 16px",
          }}>
            <GenericEditableText sectionId={sectionId} field="kicker" value={kicker} tag="span" />
          </p>
          <h2 style={{
            fontFamily: FONT, fontWeight: 800,
            fontSize: "clamp(1.9rem, 3.5vw, 2.8rem)",
            color: DARK, margin: 0, lineHeight: 1.1,
          }}>
            <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
          </h2>
        </div>

        {/* Tab tlačítka */}
        <div style={{
          display: "flex", flexWrap: "wrap", justifyContent: "center",
          gap: 10, marginBottom: 48,
        }}>
          {groups.map((g, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              style={{
                padding: "10px 28px",
                borderRadius: 999,
                border: i === active ? "none" : `1.5px solid rgba(128,98,72,0.35)`,
                backgroundColor: i === active ? BROWN : "transparent",
                color: i === active ? CREAM : MUTED,
                fontFamily: FONT,
                fontSize: "0.88rem",
                fontWeight: i === active ? 700 : 500,
                letterSpacing: "0.04em",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
            >
              {g.title}
            </button>
          ))}
        </div>

        {/* Aktivní skupina — seznam */}
        <div className="nails03-services-card" style={{
          backgroundColor: "#fff",
          borderRadius: 12,
          padding: "40px 48px",
          boxShadow: "0 2px 20px rgba(11,9,12,0.06)",
        }}>
          <h3 style={{
            fontFamily: FONT, fontWeight: 800,
            fontSize: "1.1rem", letterSpacing: "0.06em",
            textTransform: "uppercase", color: BROWN,
            margin: "0 0 28px",
          }}>
            <GenericEditableText sectionId={sectionId} field={`groups.${active}.title`} value={activeGroup.title} tag="span" />
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {activeGroup.items.map((item, j) => (
              <div
                key={j}
                style={{
                  display: "flex",
                  alignItems: "baseline",
                  padding: "13px 0",
                  borderBottom: j < activeGroup.items.length - 1 ? `1px solid rgba(11,9,12,0.07)` : "none",
                }}
              >
                <span style={{ fontFamily: FONT, fontSize: "0.97rem", fontWeight: 400, color: DARK, flex: 1 }}>
                  <GenericEditableText sectionId={sectionId} field={`groups.${active}.items.${j}.name`} value={item.name} tag="span" />
                </span>
                <span style={{
                  flex: "0 0 auto",
                  fontFamily: FONT, fontSize: "0.97rem", fontWeight: 700,
                  color: BROWN, marginLeft: 24, whiteSpace: "nowrap",
                }}>
                  <GenericEditableText sectionId={sectionId} field={`groups.${active}.items.${j}.price`} value={item.price} tag="span" />
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div style={{ textAlign: "center", marginTop: 48 }}>
          <a
            href="#kontakt"
            style={{
              display: "inline-flex", alignItems: "center", gap: 10,
              padding: "14px 44px",
              backgroundColor: BROWN, color: CREAM,
              fontFamily: FONT, fontSize: "0.88rem", fontWeight: 700,
              letterSpacing: "0.08em", textTransform: "uppercase",
              textDecoration: "none", borderRadius: 999,
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
        @media (max-width: 600px) {
          .nails03-services-card { padding: 28px 20px !important; }
        }
      `}</style>
    </section>
  );
}

// ── clinic-03-services ─────────────────────────────────────────────────────
// Infinite horizontal carousel: tripled array + snap-back, 4 visible desktop
// Reference: yesvisage.cz
// ─────────────────────────────────────────────────────────────────────────────
function ServicesClinic03({ content, sectionId }: { content: Record<string,unknown>; sectionId: number }) {
  const GOLD   = "#97855F";
  const GOLD_H = "#82734f";
  const WHITE  = "#ffffff";
  const DARK   = "#1A1A1A";
  const MUTED  = "#6B6B6B";
  const SURF   = "#F7F5F0";
  const SANS   = "'DM Sans', Arial, sans-serif";
  const SERIF  = "'Cormorant Garamond', Georgia, serif";
  const GAP    = 16;

  const eyebrowRaw  = content.kicker;
  const titleRaw    = content.title;
  const eyebrow = eyebrowRaw === undefined ? "Vyberte si z nejžádanějších zákroků" : String(eyebrowRaw);
  const title   = titleRaw   === undefined ? "Naše specializace" : String(titleRaw);
  const ctaText = String(content.ctaText ?? "Kompletní nabídka zákroků");
  const showHeader = !!(eyebrow.trim() || title.trim());

  type Svc = { name: string; description: string; imageUrl?: string; ctaText?: string; ctaHref?: string };
  const base = (content.services as Svc[]) ?? [];
  const n = base.length;
  const items = [...base, ...base, ...base];

  const [idx, setIdx] = useState(n);
  const [animated, setAnimated] = useState(true);
  const busy = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerW, setContainerW] = useState(0);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(entries => setContainerW(entries[0].contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const visible = containerW > 1000 ? 4 : containerW > 700 ? 3 : containerW > 480 ? 2 : 1;
  const cardW = containerW > 0 ? (containerW - GAP * (visible - 1)) / visible : 0;
  const step  = cardW + GAP;

  function go(dir: 1 | -1) {
    if (busy.current) return;
    busy.current = true;
    setAnimated(true);
    setIdx(i => i + dir);
  }

  useEffect(() => {
    if (!animated || n === 0) return;
    const t = setTimeout(() => {
      setIdx(i => {
        const needsSnap = i >= n * 2 || i < n;
        if (needsSnap) setAnimated(false);
        if (i >= n * 2) return i - n;
        if (i < n)      return i + n;
        return i;
      });
      busy.current = false;
    }, 460);
    return () => clearTimeout(t);
  }, [idx, animated, n]);

  useEffect(() => {
    if (!animated) {
      const t = setTimeout(() => { setAnimated(true); busy.current = false; }, 30);
      return () => clearTimeout(t);
    }
  }, [animated]);

  return (
    <section id="sluzby" data-template="clinic-03" style={{ backgroundColor: WHITE, padding: "clamp(64px, 8vw, 100px) 0", fontFamily: SANS }}>
      <div style={{ maxWidth: 1400, margin: "0 auto", padding: "0 clamp(20px, 4vw, 56px)" }}>

        {/* Header */}
        {showHeader && (
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 44, flexWrap: "wrap", gap: 16 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                <span aria-hidden style={{ display: "block", width: 24, height: 1, backgroundColor: GOLD }} />
                <GenericEditableText sectionId={sectionId} field="kicker" value={eyebrow} tag="p"
                  style={{ fontSize: "0.65rem", fontWeight: 500, color: GOLD, letterSpacing: "0.2em", textTransform: "uppercase", margin: 0 }}
                />
              </div>
              <GenericEditableText sectionId={sectionId} field="title" value={title} tag="h2"
                style={{ fontFamily: SERIF, fontSize: "clamp(1.6rem, 2.6vw, 2.2rem)", fontWeight: 300, fontStyle: "italic", color: DARK, margin: 0 }}
              />
            </div>

            <div style={{ display: "flex", gap: 6 }}>
              {([[-1, "15 18 9 12 15 6"], [1, "9 18 15 12 9 6"]] as [1|-1, string][]).map(([dir, pts]) => (
                <button key={dir} onClick={() => go(dir)}
                  style={{ width: 40, height: 40, border: `1px solid ${GOLD}44`, background: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: MUTED, transition: "all 0.25s" }}
                  onMouseEnter={e => { e.currentTarget.style.background = GOLD; e.currentTarget.style.color = WHITE; e.currentTarget.style.borderColor = GOLD; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "none"; e.currentTarget.style.color = MUTED; e.currentTarget.style.borderColor = `${GOLD}44`; }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><polyline points={pts}/></svg>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Carousel */}
        <div ref={containerRef} style={{ overflow: "hidden" }}>
          <div style={{
            display: "flex",
            gap: GAP,
            transform: cardW > 0 ? `translateX(-${idx * step}px)` : undefined,
            transition: animated ? "transform 0.45s cubic-bezier(0.4,0,0.2,1)" : "none",
            willChange: "transform",
          }}>
            {items.map((s, i) => (
              <a
                key={i}
                href={s.ctaHref ?? "#kontakt"}
                className="c03-svc-card"
                style={{ textDecoration: "none", display: "flex", flexDirection: "column", cursor: "pointer", flexShrink: 0, width: cardW > 0 ? cardW : `calc((100% - ${GAP * (visible - 1)}px) / ${visible})` }}
              >
                <div style={{ position: "relative", aspectRatio: "3/4", overflow: "hidden", backgroundColor: SURF }}>
                  {s.imageUrl && (
                    <GenericEditableImage sectionId={sectionId} field={`services.${i % n}.imageUrl`} src={s.imageUrl} alt={s.name ?? ""} style={{ display: "block", width: "100%", height: "100%" }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img loading="lazy" src={s.imageUrl} alt={s.name}
                        className="c03-svc-img"
                        style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", transition: "transform 0.6s cubic-bezier(.2,.7,.3,1), filter 0.6s ease" }}
                      />
                    </GenericEditableImage>
                  )}
                  {/* Hover overlay with gold accent line */}
                  <div className="c03-svc-overlay" style={{
                    position: "absolute", inset: 0,
                    background: "linear-gradient(to top, rgba(26,26,26,0.6) 0%, transparent 50%)",
                    opacity: 0,
                    transition: "opacity 0.4s ease",
                    display: "flex", alignItems: "flex-end", padding: 20,
                  }}>
                    <p style={{ fontFamily: SANS, fontSize: "0.72rem", color: WHITE, lineHeight: 1.5, margin: 0, opacity: 0.9 }}>
                      {s.description}
                    </p>
                  </div>
                </div>
                <div style={{ padding: "14px 2px 0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <GenericEditableText sectionId={sectionId} field={`services.${i % n}.name`} value={s.name ?? ""} tag="h3"
                    style={{ fontFamily: SERIF, fontSize: "1.08rem", fontWeight: 400, color: DARK, margin: 0 }}
                  />
                  <span style={{ fontFamily: SANS, fontSize: "0.65rem", color: GOLD, letterSpacing: "0.06em", flexShrink: 0 }}>
                    <GenericEditableText sectionId={sectionId} field={`services.${i % n}.ctaText`} value={s.ctaText ?? "Detail"} tag="span" />
                    <span style={{ marginLeft: 4 }}>→</span>
                  </span>
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div style={{ textAlign: "center", marginTop: 52 }}>
          <a href="#kontakt" className="c03-svc-bottom-cta"
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
      </div>
    </section>
  );
}

// ── clinic-03-pricing ──────────────────────────────────────────────────────
function PricingClinic03({ content, sectionId }: { content: Record<string,unknown>; sectionId: number }) {
  const GOLD  = "#97855F";
  const WHITE = "#ffffff";
  const DARK  = "#1A1A1A";
  const MUTED = "#6B6B6B";
  const SURF  = "#F7F5F0";
  const SANS  = "'DM Sans', Arial, sans-serif";
  const SERIF = "'Cormorant Garamond', Georgia, serif";

  const eyebrowRaw = content.kicker;
  const titleRaw   = content.title;
  const eyebrow = eyebrowRaw === undefined ? "Transparentní ceny bez skrytých poplatků" : String(eyebrowRaw);
  const title   = titleRaw   === undefined ? "Ceník zákroků" : String(titleRaw);
  const subtitle = String(content.subtitle ?? "Ceny jsou orientační. Přesnou kalkulaci obdržíte po bezplatné konzultaci s lékařem.");
  const showHeader = !!(eyebrow.trim() || title.trim());

  type PriceItem = { name: string; price: string; note?: string };
  type PriceCategory = { title: string; items: PriceItem[] };
  const categories = (content.categories as PriceCategory[]) ?? [
    { title: "Obličej", items: [
      { name: "Botulotoxin — čelo", price: "od 3 500 Kč" },
      { name: "Botulotoxin — mračivá vráska", price: "od 2 900 Kč" },
      { name: "Výplň kyselinou hyaluronovou 1 ml", price: "od 8 900 Kč" },
      { name: "Liquid facelift", price: "od 15 900 Kč" },
      { name: "Neinvazivní lifting HIFU", price: "od 12 000 Kč" },
    ]},
    { title: "Tělo", items: [
      { name: "Kryolipolýza — 1 zóna", price: "od 4 500 Kč" },
      { name: "Liposukce — 1 oblast", price: "od 35 000 Kč" },
      { name: "Tvarování postavy EMSCULPT", price: "od 6 000 Kč" },
      { name: "Laserová epilace — malá zóna", price: "od 1 200 Kč" },
    ]},
    { title: "Chirurgie", items: [
      { name: "Zvětšení prsou — implantáty", price: "od 69 000 Kč" },
      { name: "Korekce očních víček", price: "od 25 000 Kč" },
      { name: "Rhinoplastika", price: "od 55 000 Kč" },
      { name: "Abdominoplastika", price: "od 65 000 Kč" },
    ]},
    { title: "Dermatologie & Laser", items: [
      { name: "Chemický peeling", price: "od 2 500 Kč" },
      { name: "Laserové odstranění pigmentací", price: "od 3 000 Kč" },
      { name: "Mezoterapie — obličej", price: "od 4 500 Kč" },
      { name: "PRP terapie (vampíří lifting)", price: "od 5 500 Kč" },
      { name: "Fotodynamická terapie", price: "od 3 800 Kč" },
    ]},
  ];

  const ctaText = String(content.ctaText ?? "Sjednat bezplatnou konzultaci");

  return (
    <section id="cenik" data-template="clinic-03" style={{ backgroundColor: WHITE, padding: "clamp(64px, 8vw, 100px) 0", fontFamily: SANS }}>
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 clamp(20px, 4vw, 56px)" }}>

        {showHeader && (
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, justifyContent: "center", marginBottom: 14 }}>
              <span aria-hidden style={{ display: "block", width: 24, height: 1, backgroundColor: GOLD }} />
              <GenericEditableText sectionId={sectionId} field="kicker" value={eyebrow} tag="p"
                style={{ fontSize: "0.65rem", fontWeight: 500, color: GOLD, letterSpacing: "0.2em", textTransform: "uppercase", margin: 0 }}
              />
              <span aria-hidden style={{ display: "block", width: 24, height: 1, backgroundColor: GOLD }} />
            </div>
            <GenericEditableText sectionId={sectionId} field="title" value={title} tag="h2"
              style={{ fontFamily: SERIF, fontSize: "clamp(1.6rem, 2.8vw, 2.3rem)", fontWeight: 300, fontStyle: "italic", color: DARK, margin: "0 0 12px", lineHeight: 1.2 }}
            />
            <GenericEditableText sectionId={sectionId} field="subtitle" value={subtitle} tag="p"
              style={{ fontSize: "0.82rem", color: MUTED, margin: 0, maxWidth: 520, marginLeft: "auto", marginRight: "auto", lineHeight: 1.6 }}
            />
          </div>
        )}

        <div className="c03-pricing-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "clamp(24px, 3vw, 40px)" }}>
          {categories.map((cat, ci) => (
            <div key={ci} style={{ backgroundColor: SURF, padding: "clamp(24px, 3vw, 36px)" }}>
              {/* Category header */}
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
                <svg width="14" height="14" viewBox="0 0 30 30" aria-hidden>
                  <path d="M15 2 L28 15 L15 28 L2 15 Z" fill="none" stroke={GOLD} strokeWidth="1.2" />
                  <path d="M15 11 L19 15 L15 19 L11 15 Z" fill={GOLD} />
                </svg>
                <GenericEditableText sectionId={sectionId} field={`categories.${ci}.title`} value={cat.title} tag="h3"
                  style={{ fontFamily: SERIF, fontSize: "1.15rem", fontWeight: 400, fontStyle: "italic", color: DARK, margin: 0 }}
                />
              </div>

              {/* Price rows */}
              <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                {cat.items.map((item, ii) => (
                  <div key={ii} className="c03-price-row" style={{
                    display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12,
                    padding: "13px 0",
                    borderBottom: `1px solid ${GOLD}12`,
                    transition: "padding-left 0.2s ease, background-color 0.2s ease",
                  }}>
                    <GenericEditableText sectionId={sectionId} field={`categories.${ci}.items.${ii}.name`} value={item.name} tag="span"
                      style={{ fontSize: "0.82rem", color: DARK, lineHeight: 1.4 }}
                    />
                    <span style={{ flexShrink: 0, display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ display: "block", height: 1, width: 20, backgroundColor: `${GOLD}25`, flexShrink: 0 }} />
                      <GenericEditableText sectionId={sectionId} field={`categories.${ci}.items.${ii}.price`} value={item.price} tag="span"
                        style={{ fontFamily: SERIF, fontSize: "0.92rem", fontWeight: 400, fontStyle: "italic", color: GOLD, whiteSpace: "nowrap" }}
                      />
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div style={{ textAlign: "center", marginTop: 48 }}>
          <a href="#kontakt" className="c03-pricing-cta"
            style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              height: 48, padding: "0 36px",
              backgroundColor: GOLD, color: WHITE,
              fontFamily: SANS, fontSize: "0.68rem", fontWeight: 600,
              letterSpacing: "0.16em", textTransform: "uppercase",
              textDecoration: "none",
              transition: "background-color 0.3s ease, transform 0.3s ease",
            }}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = "#82734f"; e.currentTarget.style.transform = "translateY(-1px)"; }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = GOLD; e.currentTarget.style.transform = "translateY(0)"; }}
          >
            <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
              <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}

// ── clinic-02-services ─────────────────────────────────────────────────────
// Professional slider: large photo left (crossfade), content panel right
function ServicesClinic02({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const NAVY   = "#0F203E";
  const AMBER  = "#ffa60b";
  const MUTED  = "#606266";
  const FONT_H = "'Poppins', Arial, sans-serif";
  const FONT_B = "'Open Sans', Arial, sans-serif";

  const title    = String(content.title    ?? "Oblíbená ošetření");
  const kicker   = String(content.kicker   ?? "Naše nejpopulárnější procedury");
  const services = Array.isArray(content.services)
    ? (content.services as Array<{ name?: string; description?: string; imageUrl?: string; price?: string; ctaText?: string; ctaHref?: string }>)
    : [];

  const [idx, setIdx] = useState(0);
  const count = Math.max(services.length, 1);
  const prev = () => setIdx(i => (i - 1 + count) % count);
  const next = () => setIdx(i => (i + 1) % count);
  const current = services[idx] ?? {};

  return (
    <section id="sluzby" data-template="clinic-02" style={{ backgroundColor: "#FFFFFF", padding: "clamp(72px,9vw,120px) 0" }}>
      {/* Header — hidden on subpages where slim banner already shows H1 */}
      {(content.showHeader !== false) && (kicker || title) && (
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 clamp(24px,5vw,60px)", textAlign: "center", marginBottom: "clamp(44px,5.5vw,64px)" }}>
          {kicker && (
            <p style={{
              fontFamily: FONT_B, fontSize: "0.75rem", fontWeight: 700,
              letterSpacing: "0.22em", textTransform: "uppercase", color: AMBER, margin: "0 0 16px",
              display: "inline-flex", alignItems: "center", gap: 12, justifyContent: "center",
            }}>
              <span style={{ width: 28, height: 1, backgroundColor: AMBER }} />
              <GenericEditableText sectionId={sectionId} field="kicker" value={kicker} tag="span" />
              <span style={{ width: 28, height: 1, backgroundColor: AMBER }} />
            </p>
          )}
          {title && (
            <h2 style={{ fontFamily: FONT_H, fontSize: "clamp(1.8rem,3.4vw,2.7rem)", fontWeight: 700, color: NAVY, margin: 0, letterSpacing: "-0.005em" }}>
              <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
            </h2>
          )}
        </div>
      )}

      {/* Slider card */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 clamp(16px,4vw,48px)" }}>
        <div className="clinic02-slider" style={{
          display: "grid",
          gridTemplateColumns: "1.1fr 1fr",
          minHeight: 500,
          boxShadow: "0 12px 56px rgba(15,32,62,0.12)",
          borderRadius: 4,
          overflow: "hidden",
        }}>
          {/* Left: crossfade photo stack */}
          <div style={{ position: "relative", overflow: "hidden", minHeight: 420 }}>
            {services.map((s, i) => (
              <div key={i} style={{
                position: "absolute", inset: 0,
                opacity: i === idx ? 1 : 0,
                transition: "opacity 0.6s ease",
                zIndex: i === idx ? 1 : 0,
              }}>
                <GenericEditableImage sectionId={sectionId} field={`services.${i}.imageUrl`} src={s.imageUrl ?? ""} alt={s.name ?? ""} style={{ display: "flex", width: "100%", height: "100%" }}>
                  <img loading="lazy" src={s.imageUrl ?? ""} alt={s.name ?? ""} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                </GenericEditableImage>
                <div style={{
                  position: "absolute", inset: 0,
                  background: "linear-gradient(to top, rgba(15,32,62,0.4) 0%, transparent 50%)",
                }} />
              </div>
            ))}
            {/* Counter */}
            <div style={{
              position: "absolute", bottom: 24, left: 28, zIndex: 10,
              fontFamily: FONT_H, fontSize: "0.78rem", fontWeight: 600,
              color: "rgba(255,255,255,0.85)", letterSpacing: "0.14em",
            }}>
              {String(idx + 1).padStart(2, "0")} / {String(count).padStart(2, "0")}
            </div>
          </div>

          {/* Right: content panel */}
          <div style={{
            backgroundColor: "#f7f6f5",
            padding: "clamp(40px,5vw,68px) clamp(32px,4vw,60px)",
            display: "flex", flexDirection: "column", justifyContent: "space-between",
          }}>
            <div>
              <div style={{ width: 40, height: 3, backgroundColor: AMBER, marginBottom: 32 }} />
              <h3 style={{
                fontFamily: FONT_H, fontSize: "clamp(1.3rem,2.2vw,1.8rem)", fontWeight: 700,
                color: NAVY, margin: "0 0 18px", lineHeight: 1.2,
              }}>
                {current.name}
              </h3>
              <p style={{
                fontFamily: FONT_B, fontSize: "clamp(0.875rem,1.1vw,1rem)", color: MUTED,
                lineHeight: 1.85, margin: "0 0 28px",
              }}>
                {current.description}
              </p>
              {current.price && (
                <div style={{
                  display: "inline-flex", alignItems: "center",
                  backgroundColor: NAVY, color: "#fff",
                  fontFamily: FONT_H, fontSize: "0.9rem", fontWeight: 600,
                  padding: "9px 22px", borderRadius: 2, marginBottom: 28,
                }}>
                  {current.price}
                </div>
              )}
              {current.ctaHref && (
                <div>
                  <a
                    href={current.ctaHref}
                    className="c02-svc-cta"
                    data-btn="primary"
                    style={{
                      display: "inline-flex", alignItems: "center", gap: 10,
                      padding: "14px 30px",
                      backgroundColor: AMBER, color: NAVY,
                      fontFamily: FONT_B, fontSize: "0.82rem", fontWeight: 700,
                      letterSpacing: "0.12em", textTransform: "uppercase",
                      textDecoration: "none", borderRadius: 999,
                      boxShadow: "0 4px 16px rgba(255,166,11,0.32)",
                      transition: "transform .22s ease, box-shadow .22s ease, background-color .22s ease",
                    }}
                  >
                    {current.ctaText ?? "Zjistit více"}
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="13 5 20 12 13 19"/></svg>
                  </a>
                </div>
              )}
            </div>

            {/* Navigation row */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 40 }}>
              <button onClick={prev} aria-label="Předchozí" style={{
                width: 44, height: 44, borderRadius: "50%",
                border: `2px solid ${NAVY}`, backgroundColor: "transparent",
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer", color: NAVY, flexShrink: 0,
              }}
              onMouseEnter={e => { const b = e.currentTarget; b.style.backgroundColor = NAVY; b.style.color = "#fff"; }}
              onMouseLeave={e => { const b = e.currentTarget; b.style.backgroundColor = "transparent"; b.style.color = NAVY; }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
              </button>
              <button onClick={next} aria-label="Další" style={{
                width: 44, height: 44, borderRadius: "50%",
                border: `2px solid ${NAVY}`, backgroundColor: NAVY,
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer", color: "#fff", flexShrink: 0,
              }}
              onMouseEnter={e => (e.currentTarget.style.opacity = "0.75")}
              onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
              </button>
              <div style={{ display: "flex", gap: 6, marginLeft: 8 }}>
                {services.map((_, i) => (
                  <button key={i} onClick={() => setIdx(i)} aria-label={`Slide ${i + 1}`} style={{
                    width: i === idx ? 28 : 8, height: 8, borderRadius: 4,
                    border: "none", padding: 0, cursor: "pointer",
                    backgroundColor: i === idx ? NAVY : "rgba(15,32,62,0.2)",
                    transition: "width 0.35s ease, background-color 0.25s",
                  }} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .c02-svc-cta:hover {
          transform: translateY(-2px);
          background-color: #ffb73a !important;
          box-shadow: 0 10px 26px rgba(255,166,11,0.46);
        }
        @media (max-width: 720px) {
          #sluzby .clinic02-slider { grid-template-columns: 1fr !important; }
          #sluzby .clinic02-slider > div:first-child { min-height: 260px !important; }
        }
      `}</style>
    </section>
  );
}

// ── fitness-02-services-grid ──────────────────────────────────────────────────
// 3-col photo grid of group classes — 1:1 fitnessvictory.cz
// Black bg, pink kicker + Archivo Black H2 centered
// Cards: full-width photo cover, hover overlay + zoom, tag badge (pink), title white, desc muted
// Bottom CTA outlined pink
// ─────────────────────────────────────────────────────────────────────────────
type Fitness02ServiceItem = { title?: string; description?: string; image?: string; tag?: string };

function ServicesFitness02({ content, sectionId, tenantSlug, isAdmin }: { content: Record<string, unknown>; sectionId: number; tenantSlug?: string; isAdmin?: boolean }) {
  const tagline = String(content.tagline ?? "Skupinové lekce");
  const title   = String(content.title   ?? "Cvičení pro každého");
  const body    = String(content.body    ?? "");
  const ctaText = String(content.ctaText ?? "Rezervovat lekci");
  const ctaHref = String(content.ctaHref ?? "/kontakt");
  const items   = ((content.items as Fitness02ServiceItem[]) ?? []).slice(0, 6);
  const showHeader = (content as { showHeader?: boolean }).showHeader !== false;
  const siteMode   = String((content as { siteMode?: string }).siteMode ?? "multipage");

  const ACCENT = "#FF5500";
  const WHITE  = "#FFFFFF";
  const TEXT   = "#DBDBDB";
  const FONT_H = "'Archivo Black', sans-serif";
  const FONT_B = "'Montserrat', sans-serif";

  const resolveHref = (href: string) => {
    if (!href) return href;
    if (href.startsWith("http") || href.startsWith("mailto:") || href.startsWith("tel:") || href.startsWith("#")) return href;
    if (siteMode === "onepage") return href === "/" ? "/" : "/#" + href.replace(/^\//, "");
    return tenantSlug ? `/demo/${tenantSlug}${href}` : href;
  };

  return (
    <section
      id="lekce"
      className="fitness02-services"
      style={{ backgroundColor: "#000000", padding: "120px 0", fontFamily: FONT_B, position: "relative", overflow: "hidden" }}
      data-template="fitness-02"
      data-section="fitness-02-services"
    >
      <div aria-hidden="true" className="fitness02-grain" style={{ position: "absolute", inset: 0, pointerEvents: "none", opacity: 0.04, mixBlendMode: "overlay" }} />

      <div style={{ maxWidth: 1240, margin: "0 auto", padding: "0 40px", position: "relative", zIndex: 1 }}>
        {/* Header */}
        {showHeader && (
          <div style={{ textAlign: "center", marginBottom: 72 }}>
            <div className="fitness02-services-kicker" style={{ display: "inline-flex", alignItems: "center", gap: 16, marginBottom: 26, justifyContent: "center" }}>
              <span aria-hidden="true" style={{ display: "inline-block", width: 40, height: 2, background: ACCENT }} />
              <span style={{
                fontSize: 12, fontWeight: 600, letterSpacing: "0.28em",
                textTransform: "uppercase", color: ACCENT, fontFamily: FONT_B,
              }}>
                <GenericEditableText sectionId={sectionId} field="tagline" value={tagline} tag="span" />
              </span>
              <span aria-hidden="true" style={{ display: "inline-block", width: 40, height: 2, background: ACCENT }} />
            </div>
            <h2 className="fitness02-services-title" style={{
              fontFamily: FONT_H, fontSize: "clamp(32px, 4vw, 56px)",
              color: WHITE, textTransform: "uppercase", lineHeight: 1.1, margin: 0,
              marginBottom: body ? 22 : 0, letterSpacing: "-0.01em",
            }}>
              <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
            </h2>
            {body && (
              <p style={{ fontSize: 16, fontWeight: 400, color: TEXT, maxWidth: 640, margin: "0 auto", lineHeight: 1.65 }}>
                <GenericEditableText sectionId={sectionId} field="body" value={body} tag="span" />
              </p>
            )}
          </div>
        )}

        {/* Grid */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 6,
          marginBottom: 64,
        }} className="fitness02-services-grid">
          {items.map((item, i) => (
            <div
              key={i}
              className="fitness02-service-card"
              style={{ position: "relative", overflow: "hidden", cursor: "pointer" }}
            >
              {/* Photo */}
              <div style={{ aspectRatio: "4/3", overflow: "hidden", background: "#0a0a0a" }}>
                <img
                  src={item.image ?? ""}
                  alt={item.title ?? ""}
                  className="fitness02-service-img"
                  loading="lazy"
                  style={{
                    width: "100%", height: "100%", objectFit: "cover",
                    display: "block", transition: "transform 0.8s cubic-bezier(0.22,0.61,0.36,1)",
                  }}
                />
              </div>

              {/* Hover orange overlay */}
              <div
                className="fitness02-service-overlay"
                aria-hidden="true"
                style={{
                  position: "absolute", inset: 0,
                  background: "rgba(255,85,0,0.18)",
                  opacity: 0, transition: "opacity 0.35s ease",
                  pointerEvents: "none",
                  mixBlendMode: "multiply",
                }}
              />

              {/* Orange corner bracket — top-right, appears on hover */}
              <span aria-hidden="true" className="fitness02-service-bracket" style={{
                position: "absolute", top: 12, right: 12, width: 32, height: 32,
                borderTop: `2px solid ${ACCENT}`, borderRight: `2px solid ${ACCENT}`,
                opacity: 0, transition: "opacity 0.35s ease, transform 0.45s cubic-bezier(0.22,0.61,0.36,1)",
                transform: "translate(6px, -6px)",
                pointerEvents: "none",
              }} />

              {/* Tag */}
              {item.tag && (
                <span className="fitness02-service-tag" style={{
                  position: "absolute", top: 16, left: 16,
                  background: ACCENT, color: "#000000",
                  fontFamily: FONT_H, fontSize: 11,
                  letterSpacing: "0.24em", textTransform: "uppercase",
                  padding: "5px 12px",
                  transition: "transform 0.35s cubic-bezier(0.22,0.61,0.36,1)",
                }}>
                  {item.tag}
                </span>
              )}

              {/* Card info */}
              <div className="fitness02-service-info" style={{
                position: "absolute", bottom: 0, left: 0, right: 0,
                background: "linear-gradient(0deg, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.6) 55%, transparent 100%)",
                padding: "56px 22px 22px",
              }}>
                <h3 className="fitness02-service-h3" style={{
                  fontFamily: FONT_H, fontSize: 22,
                  color: WHITE, textTransform: "uppercase", margin: 0, marginBottom: 8,
                  letterSpacing: "-0.005em", lineHeight: 1.15,
                }}>
                  <GenericEditableText sectionId={sectionId} field={`items.${i}.title`} value={item.title ?? ""} tag="span" />
                </h3>
                {item.description && (
                  <p className="fitness02-service-desc" style={{
                    fontSize: 13.5, fontWeight: 400, color: TEXT, lineHeight: 1.55, margin: 0,
                    opacity: 0.85,
                  }}>
                    <GenericEditableText sectionId={sectionId} field={`items.${i}.description`} value={item.description} tag="span" />
                  </p>
                )}
              </div>

              {/* Growing orange bottom rule */}
              <span aria-hidden="true" className="fitness02-service-rule" style={{
                position: "absolute", left: 0, bottom: 0, height: 3, width: "100%", background: ACCENT,
                transform: "scaleX(0)", transformOrigin: "left center",
                transition: "transform 0.5s cubic-bezier(0.22,0.61,0.36,1)",
                pointerEvents: "none",
              }} />
            </div>
          ))}
        </div>

        {/* CTA */}
        <div style={{ textAlign: "center" }}>
          <a
            href={resolveHref(ctaHref)}
            data-btn="inverse"
            className="fitness02-cta fitness02-services-cta"
            style={{
              display: "inline-flex", alignItems: "center", gap: 12,
              background: "transparent", color: ACCENT,
              border: `2px solid ${ACCENT}`, borderRadius: 0,
              padding: "17px 44px",
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
      </div>
    </section>
  );
}

// ── fitness-01-services-carousel ──────────────────────────────────────────────
// Luxe Warm Physio Sanctuary — 4-per-page carousel s editorial kartami
// Header: vertical rail 03 + eyebrow + H2 s italic accent + subheading + prev/next
// Karty: photo 3/4 + hover zoom + warm overlay + arc corner on hover, title Inter 700,
// description body, location tag s pin icon, chevron reveal on hover
// ────────────────────────────────────────────────────────────────────────────
function ServicesFitness01Carousel({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const items = ((content as { items?: Array<{ title?: string; name?: string; description?: string; image?: string; location?: string }> }).items ?? []);
  const sectionTag    = String(content.sectionTag    ?? "Specializace");
  const eyebrowMark   = String(content.eyebrowMark   ?? "03");
  const headingPre    = String(content.headingPre    ?? "Komplexní tréninky");
  const headingAccent = String(content.headingAccent ?? "na míru");
  const headingPost   = String(content.headingPost   ?? "vašemu tělu");
  const subheading    = String(content.subheading    ?? "");
  const ctaText       = String(content.ctaText       ?? "Rezervovat úvodní konzultaci");
  const ctaHref       = String(content.ctaHref       ?? "/kontakt");
  const showHeader    = (content as { showHeader?: boolean }).showHeader !== false;

  const [idx, setIdx] = useState(0);
  const perPage = 4;
  const total = items.length;
  const pages = Math.max(1, Math.ceil(total / perPage));
  const prev = () => setIdx(i => Math.max(0, i - 1));
  const next = () => setIdx(i => Math.min(pages - 1, i + 1));
  const visible = items.slice(idx * perPage, idx * perPage + perPage);

  return (
    <section id="sluzby" className="fit01-services" data-template="fitness-01">
      <div className="fit01-services-inner">
        {showHeader && (
          <div className="fit01-services-header">
            <div className="fit01-services-copy">
              <div className="fit01-services-rail" aria-hidden="true">
                <span className="fit01-rail-line" />
                <span className="fit01-rail-mark">{eyebrowMark}</span>
              </div>
              <div className="fit01-services-eyebrow">
                <span className="fit01-tagline-mark" aria-hidden="true" />
                <GenericEditableText sectionId={sectionId} field="sectionTag" value={sectionTag} tag="span" />
              </div>
              <h2 className="fit01-services-h2">
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
                <p className="fit01-services-sub">
                  <GenericEditableText sectionId={sectionId} field="subheading" value={subheading} tag="span" />
                </p>
              )}
            </div>
            {pages > 1 && (
              <div className="fit01-services-nav">
                <div className="fit01-services-count">
                  <span className="fit01-count-current">{String(idx + 1).padStart(2, "0")}</span>
                  <span className="fit01-count-sep">/</span>
                  <span className="fit01-count-total">{String(pages).padStart(2, "0")}</span>
                </div>
                <button onClick={prev} disabled={idx === 0} aria-label="Předchozí" className="fit01-nav-btn fit01-nav-btn-prev">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M10 12 6 8l4-4"/></svg>
                </button>
                <button onClick={next} disabled={idx >= pages - 1} aria-label="Další" className="fit01-nav-btn fit01-nav-btn-next">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M6 4l4 4-4 4"/></svg>
                </button>
              </div>
            )}
          </div>
        )}

        <div className="fit01-services-grid">
          {visible.map((item, i) => (
            <article key={idx * perPage + i} className="fit01-service-card" style={{ ["--i" as string]: i }}>
              <div className="fit01-service-media">
                {item.image && (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={item.image} alt={item.title ?? item.name ?? ""} className="fit01-service-photo" loading="lazy" />
                )}
                <div className="fit01-service-overlay" aria-hidden="true" />
                <svg className="fit01-service-arc" width="44" height="44" viewBox="0 0 44 44" fill="none" aria-hidden="true">
                  <path d="M 4 40 A 36 36 0 0 1 40 4" stroke="#FFF9F7" strokeWidth="1.4" strokeLinecap="round" />
                </svg>
              </div>
              <div className="fit01-service-body">
                <h3 className="fit01-service-title">{item.title ?? item.name ?? ""}</h3>
                {item.description && <p className="fit01-service-desc">{item.description}</p>}
                <div className="fit01-service-foot">
                  {item.location && (
                    <span className="fit01-service-loc">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                      {item.location}
                    </span>
                  )}
                  <span className="fit01-service-arrow" aria-hidden="true">
                    <svg width="14" height="10" viewBox="0 0 14 10" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M1 5h11M8 1l4 4-4 4"/></svg>
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="fit01-services-cta-wrap">
          <a href={ctaHref} className="fit01-services-cta" data-btn="primary">
            <span>
              <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
            </span>
            <svg width="14" height="10" viewBox="0 0 14 10" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M1 5h11M8 1l4 4-4 4"/></svg>
          </a>
        </div>
      </div>
    </section>
  );
}

// ── fitness-01-pricing-3col ───────────────────────────────────────────────────
// Luxe Warm Physio Sanctuary — 3 plánů grid s featured center
// Centered header s rail 04, H2 italic accent, subheading
// Karty: featured plan cocoa-dark bg (invert) + neutral outer 2, highlight badge,
// hairline dividers, check icons brown, price Inter 800 + italic serif unit
// ────────────────────────────────────────────────────────────────────────────
function PricingFitness01({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  interface Plan {
    name: string; period?: string; price: string; unit?: string; perPeriod?: string;
    featured?: boolean; highlight?: string; features?: string[]; ctaText?: string; ctaHref?: string;
  }
  const plans         = ((content as { plans?: Plan[] }).plans ?? []) as Plan[];
  const sectionTag    = String(content.sectionTag    ?? "Ceník");
  const eyebrowMark   = String(content.eyebrowMark   ?? "04");
  const headingPre    = String(content.headingPre    ?? "Programy,");
  const headingAccent = String(content.headingAccent ?? "které dávají");
  const headingPost   = String(content.headingPost   ?? "výsledek");
  const subheading    = String(content.subheading    ?? "");
  const note          = String(content.note          ?? "");
  const showHeader    = (content as { showHeader?: boolean }).showHeader !== false;

  return (
    <section id="cenik" className="fit01-pricing" data-template="fitness-01">
      <div className="fit01-pricing-inner">
        {showHeader && (
          <div className="fit01-pricing-header">
            <div className="fit01-pricing-rail" aria-hidden="true">
              <span className="fit01-rail-line" />
              <span className="fit01-rail-mark">{eyebrowMark}</span>
            </div>
            <div className="fit01-pricing-eyebrow">
              <span className="fit01-tagline-mark" aria-hidden="true" />
              <GenericEditableText sectionId={sectionId} field="sectionTag" value={sectionTag} tag="span" />
              <span className="fit01-tagline-mark fit01-tagline-mark-flip" aria-hidden="true" />
            </div>
            <h2 className="fit01-pricing-h2">
              <span className="fit01-h2-line">
                <GenericEditableText sectionId={sectionId} field="headingPre" value={headingPre} tag="span" />
              </span>
              <span className="fit01-h2-line fit01-h2-line-accent-center">
                <span className="fit01-h2-accent">
                  <GenericEditableText sectionId={sectionId} field="headingAccent" value={headingAccent} tag="span" />
                </span>{" "}
                <span className="fit01-h2-post">
                  <GenericEditableText sectionId={sectionId} field="headingPost" value={headingPost} tag="span" />
                </span>
              </span>
            </h2>
            {subheading && (
              <p className="fit01-pricing-sub">
                <GenericEditableText sectionId={sectionId} field="subheading" value={subheading} tag="span" />
              </p>
            )}
          </div>
        )}

        <div className="fit01-pricing-grid">
          {plans.map((plan, i) => (
            <article key={i} className={`fit01-plan${plan.featured ? " fit01-plan-featured" : ""}`} style={{ ["--i" as string]: i }}>
              {plan.highlight && (
                <div className="fit01-plan-highlight">
                  <span className="fit01-plan-highlight-dot" aria-hidden="true" />
                  <GenericEditableText sectionId={sectionId} field={`plans.${i}.highlight`} value={plan.highlight} tag="span" />
                </div>
              )}

              <div className="fit01-plan-head">
                <div className="fit01-plan-name">
                  <GenericEditableText sectionId={sectionId} field={`plans.${i}.name`} value={plan.name} tag="span" />
                </div>
                {plan.period && (
                  <div className="fit01-plan-period">
                    <GenericEditableText sectionId={sectionId} field={`plans.${i}.period`} value={plan.period} tag="span" />
                  </div>
                )}
              </div>

              <div className="fit01-plan-price">
                <span className="fit01-plan-price-value">
                  <GenericEditableText sectionId={sectionId} field={`plans.${i}.price`} value={plan.price} tag="span" />
                </span>
                <span className="fit01-plan-price-meta">
                  <span className="fit01-plan-price-unit">
                    <GenericEditableText sectionId={sectionId} field={`plans.${i}.unit`} value={plan.unit ?? "Kč"} tag="span" />
                  </span>
                  {plan.perPeriod && (
                    <span className="fit01-plan-price-period">
                      <GenericEditableText sectionId={sectionId} field={`plans.${i}.perPeriod`} value={plan.perPeriod} tag="span" />
                    </span>
                  )}
                </span>
              </div>

              {(plan.features ?? []).length > 0 && (
                <ul className="fit01-plan-features">
                  {(plan.features ?? []).map((f, j) => (
                    <li key={j} className="fit01-plan-feature">
                      <span className="fit01-plan-check" aria-hidden="true">
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M2.5 7l3 3 6-6" />
                        </svg>
                      </span>
                      <GenericEditableText sectionId={sectionId} field={`plans.${i}.features.${j}`} value={f} tag="span" />
                    </li>
                  ))}
                </ul>
              )}

              <a href={plan.ctaHref ?? "/kontakt"} className={`fit01-plan-cta${plan.featured ? " fit01-plan-cta-featured" : ""}`} data-btn={plan.featured ? "primary" : "outline"}>
                <span>
                  <GenericEditableText sectionId={sectionId} field={`plans.${i}.ctaText`} value={plan.ctaText ?? "Začít program"} tag="span" />
                </span>
                <svg width="14" height="10" viewBox="0 0 14 10" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M1 5h11M8 1l4 4-4 4" />
                </svg>
              </a>
            </article>
          ))}
        </div>

        {note && (
          <p className="fit01-pricing-note">
            <GenericEditableText sectionId={sectionId} field="note" value={note} tag="span" />
          </p>
        )}
      </div>
    </section>
  );
}

// ── fyzio-01-services-grid ────────────────────────────────────────────────────
// Bílé bg, navy header band, 3-col magazine-style karty
// Foto s zoom hover, zelený top-border akcent, Montserrat H3 navy, teal arrow CTA
// ─────────────────────────────────────────────────────────────────────────────
function ServicesFyzio01({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  type Item = { title?: string; name?: string; description?: string; image?: string; tag?: string };
  const tagline  = String(content.tagline ?? "Naše specializace");
  const title    = String(content.title   ?? "Fyzioterapie pro všechny");
  const body     = String(content.body    ?? "");
  const ctaText  = String(content.ctaText ?? "Objednat se");
  const ctaHref  = String(content.ctaHref ?? "#kontakt");
  const items    = (content.items as Item[]) ?? [];

  const NAVY    = "#1f2d69";
  const GREEN   = "#10d15d";
  const TEAL    = "#6bbea1";
  const WHITE   = "#ffffff";
  const MUTED   = "#6b7280";
  const MONT    = "'Montserrat', sans-serif";
  const SANS    = "'Open Sans', sans-serif";

  return (
    <section id="sluzby" data-template="fyzio-01" style={{ backgroundColor: WHITE, fontFamily: SANS }}>
      {/* Header band — navy bg */}
      <div style={{ backgroundColor: NAVY, padding: "64px 24px 56px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", textAlign: "center" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
            <span style={{ width: 28, height: 2, backgroundColor: GREEN, display: "inline-block", borderRadius: 2 }} />
            <span style={{ fontFamily: MONT, fontSize: 11, fontWeight: 700, color: GREEN, letterSpacing: "0.2em", textTransform: "uppercase" }}>
              <GenericEditableText sectionId={sectionId} field="tagline" value={tagline} tag="span" />
            </span>
            <span style={{ width: 28, height: 2, backgroundColor: GREEN, display: "inline-block", borderRadius: 2 }} />
          </div>
          <h2 style={{ fontFamily: MONT, fontSize: "clamp(26px, 3.5vw, 42px)", fontWeight: 800, color: WHITE, margin: "0 0 16px", lineHeight: 1.2 }}>
            <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
          </h2>
          {body && (
            <p style={{ fontSize: 16, color: "rgba(255,255,255,0.7)", maxWidth: 560, margin: "0 auto", lineHeight: 1.75, fontFamily: SANS }}>
              <GenericEditableText sectionId={sectionId} field="body" value={body} tag="span" />
            </p>
          )}
        </div>
      </div>

      {/* Cards grid */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "56px 24px 80px" }}>
        <div className="fyzio01-svc-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24 }}>
          {items.map((item, i) => {
            const name = item.title ?? item.name ?? "";
            const desc = item.description ?? "";
            const img  = item.image ?? "";
            const tag  = item.tag ?? "";
            return (
              <div
                key={i}
                className="fyzio01-svc-card"
                style={{ backgroundColor: WHITE, borderRadius: 12, overflow: "hidden", boxShadow: "0 4px 24px rgba(31,45,105,0.10)", display: "flex", flexDirection: "column", transition: "transform 0.25s, box-shadow 0.25s" }}
                onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = "translateY(-6px)"; (e.currentTarget as HTMLDivElement).style.boxShadow = "0 12px 40px rgba(31,45,105,0.16)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)"; (e.currentTarget as HTMLDivElement).style.boxShadow = "0 4px 24px rgba(31,45,105,0.10)"; }}
              >
                {/* Image — full natural height, no crop */}
                <div style={{ position: "relative", overflow: "hidden" }}>
                  <GenericEditableImage sectionId={sectionId} field={`items.${i}.image`} src={img} alt={name} style={{ display: "block", width: "100%" }}>
                    {img ? (
                      <img
                        src={img}
                        alt={name}
                        loading="lazy"
                        className="fyzio01-svc-photo"
                        style={{ width: "100%", height: "auto", display: "block", transition: "transform 0.45s ease" }}
                      />
                    ) : (
                      <div style={{ width: "100%", aspectRatio: "3/2", backgroundColor: "#dde6f0", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke={NAVY} strokeWidth="1.5" opacity="0.3"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>
                      </div>
                    )}
                  </GenericEditableImage>
                  {/* Tag pill */}
                  {tag && (
                    <span style={{ position: "absolute", top: 14, left: 14, backgroundColor: GREEN, color: WHITE, fontFamily: MONT, fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", padding: "4px 12px", borderRadius: 20 }}>{tag}</span>
                  )}
                </div>

                {/* Green top accent bar */}
                <div style={{ height: 3, backgroundColor: GREEN, flexShrink: 0 }} />

                {/* Card body */}
                <div style={{ padding: "24px 28px 28px", flex: 1, display: "flex", flexDirection: "column" }}>
                  <h3 style={{ fontFamily: MONT, fontSize: 18, fontWeight: 700, color: NAVY, margin: "0 0 10px", lineHeight: 1.3 }}>
                    <GenericEditableText sectionId={sectionId} field={`items.${i}.title`} value={name} tag="span" />
                  </h3>
                  <p style={{ fontSize: 14, color: MUTED, lineHeight: 1.75, margin: 0, flex: 1 }}>
                    <GenericEditableText sectionId={sectionId} field={`items.${i}.description`} value={desc} tag="span" />
                  </p>
                  <div style={{ marginTop: 20, display: "flex", alignItems: "center", gap: 6, color: TEAL, fontFamily: MONT, fontSize: 13, fontWeight: 600 }}>
                    <span>Zjistit více</span>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA */}
        {ctaText && (
          <div style={{ textAlign: "center", marginTop: 52 }}>
            <a
              href={ctaHref}
              data-btn="primary"
              style={{ display: "inline-block", backgroundColor: NAVY, color: WHITE, fontFamily: MONT, fontSize: 15, fontWeight: 700, padding: "15px 40px", borderRadius: 4, textDecoration: "none", letterSpacing: "0.05em", textTransform: "uppercase", transition: "background 0.2s" }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = GREEN)}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = NAVY)}
            >
              <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
            </a>
          </div>
        )}
      </div>

      <style>{`
        .fyzio01-svc-card:hover .fyzio01-svc-photo { transform: scale(1.06); }
        @media (max-width: 900px) { .fyzio01-svc-grid { grid-template-columns: repeat(2,1fr) !important; } }
        @media (max-width: 560px) { .fyzio01-svc-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </section>
  );
}

// ── fyzio-02-services-list ────────────────────────────────────────────────────
// Bílé bg, centrovaný header, 2×2 grid karet s fotkou nahoře + text dole
// Navy #1a2e4a nadpisy, zlatá #c9a84c tagline + hover border
// Inspirováno resetclinic.cz sekce služeb
// ─────────────────────────────────────────────────────────────────────────────
function ServicesFyzio02({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  type Item = { title?: string; name?: string; description?: string; image?: string };
  const tagline = String(content.tagline ?? "Naše služby");
  const title   = String(content.title   ?? "Co vám můžeme nabídnout");
  const body    = String(content.body    ?? "");
  const ctaText = String(content.ctaText ?? "Rezervovat terapii");
  const ctaHref = String(content.ctaHref ?? "#rezervace");
  const items   = (content.items as Item[]) ?? [];

  const NAVY  = "#1a2e4a";
  const GOLD  = "#c9a84c";
  const SURF  = "#f5f3ee";
  const MUTED = "#6b7280";
  const WHITE = "#ffffff";
  const SERIF = "'DM Serif Display', serif";
  const SANS  = "'Plus Jakarta Sans', sans-serif";

  return (
    <section id="sluzby" data-template="fyzio-02" style={{ backgroundColor: WHITE, padding: "80px 24px", fontFamily: SANS }}>
      <style>{`
        .f02-svc-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 28px; }
        .f02-svc-card { border-radius: 12px; overflow: hidden; background: ${WHITE}; border: 1.5px solid #e8e4dc; transition: border-color 0.2s, box-shadow 0.2s; display: flex; flex-direction: column; }
        .f02-svc-card:hover { border-color: ${GOLD}; box-shadow: 0 8px 32px rgba(26,46,74,0.1); }
        @media(max-width: 700px) { .f02-svc-grid { grid-template-columns: 1fr !important; } }
      `}</style>

      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
            <span style={{ width: 24, height: 2, backgroundColor: GOLD }} />
            <span style={{ fontFamily: SANS, fontSize: 12, fontWeight: 600, color: GOLD, letterSpacing: "0.1em", textTransform: "uppercase" }}>
              <GenericEditableText sectionId={sectionId} field="tagline" value={tagline} tag="span" />
            </span>
            <span style={{ width: 24, height: 2, backgroundColor: GOLD }} />
          </div>
          <h2 style={{ fontFamily: SERIF, fontSize: "clamp(1.8rem, 3vw, 2.6rem)", fontWeight: 400, color: NAVY, marginBottom: body ? 16 : 0, lineHeight: 1.2 }}>
            <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
          </h2>
          {body && (
            <p style={{ fontSize: 16, color: MUTED, maxWidth: 580, margin: "0 auto", lineHeight: 1.75 }}>
              <GenericEditableText sectionId={sectionId} field="body" value={body} tag="span" />
            </p>
          )}
        </div>

        {/* 2×2 grid */}
        <div className="f02-svc-grid">
          {items.map((item, i) => {
            const name = item.title ?? item.name ?? "";
            const desc = item.description ?? "";
            const img  = item.image ?? "";
            return (
              <div key={i} className="f02-svc-card">
                {/* Foto */}
                <div style={{ position: "relative", aspectRatio: "16/9", overflow: "hidden", backgroundColor: SURF }}>
                  <GenericEditableImage sectionId={sectionId} field={`items.${i}.image`} src={img} alt={name} className="relative overflow-hidden" style={{ width: "100%", height: "100%" }}>
                    {img ? (
                      <img src={img} alt={name} loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", transition: "transform 0.4s ease" }}
                        onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.04)")}
                        onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
                      />
                    ) : (
                      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke={NAVY} strokeWidth="1.5" opacity="0.25"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>
                      </div>
                    )}
                  </GenericEditableImage>
                </div>
                {/* Text */}
                <div style={{ padding: "24px 28px 28px", flex: 1 }}>
                  <h3 style={{ fontFamily: SERIF, fontSize: "1.2rem", fontWeight: 400, color: NAVY, marginBottom: 10, lineHeight: 1.3 }}>
                    <GenericEditableText sectionId={sectionId} field={`items.${i}.title`} value={name} tag="span" />
                  </h3>
                  <p style={{ fontFamily: SANS, fontSize: 14, color: MUTED, lineHeight: 1.75, margin: 0 }}>
                    <GenericEditableText sectionId={sectionId} field={`items.${i}.description`} value={desc} tag="span" />
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA */}
        {ctaText && (
          <div style={{ textAlign: "center", marginTop: 52 }}>
            <a
              href={ctaHref}
              data-btn="primary"
              style={{ display: "inline-block", backgroundColor: GOLD, color: WHITE, fontFamily: SANS, fontSize: "0.95rem", fontWeight: 600, padding: "0.9rem 2.2rem", borderRadius: 8, textDecoration: "none", transition: "background 0.15s" }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#b8943d")}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = GOLD)}
            >
              <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
            </a>
          </div>
        )}
      </div>
    </section>
  );
}

// ── cafe-02-menu ───────────────────────────────────────────────────────────────
// Cream #F7F4EF bg; gold kicker + burgundy serif H2 centrovaně
// 3-col karty: foto (16:9) + gold top border + kategorie + popis + card link
// ─────────────────────────────────────────────────────────────────────────────
function ServicesCafe02({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const id      = String(content.id      ?? "menu");
  const tagline = String(content.tagline ?? "Naše nabídka");
  const title   = String(content.title   ?? "Menu pro každou\ndenní dobu.");
  const body    = String(content.body    ?? "");
  const ctaText = String(content.ctaText ?? "Zobrazit celé menu");
  const ctaHref = String(content.ctaHref ?? "/menu");
  const items   = (content.items as Array<Record<string, unknown>>) ?? [];

  const BG    = "#F7F4EF";
  const GOLD  = "#A89B67";
  const BURG  = "#6C1D45";
  const TEXT  = "#1A0E0A";
  const MUTED = "#8C7B6A";
  const CARD  = "#FFFFFF";
  const FONT  = "Georgia, 'Times New Roman', serif";
  const SANS  = "'Helvetica Neue', Helvetica, Arial, sans-serif";
  const PLACEHOLDERS = [
    "https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=600&h=400&fit=crop&fm=webp&q=85",
    "https://images.unsplash.com/photo-1547592180-85f173990554?w=600&h=400&fit=crop&fm=webp&q=85",
    "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&h=400&fit=crop&fm=webp&q=85",
  ];

  const secRef = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = secRef.current;
    if (!el) return;
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) { (e.target as HTMLElement).classList.add("c02m-vis"); obs.unobserve(e.target); } });
    }, { threshold: 0.1 });
    el.querySelectorAll<HTMLElement>("[data-c02m]").forEach(item => obs.observe(item));
    return () => obs.disconnect();
  }, []);

  return (
    <section ref={secRef} id={id} data-variant="cafe-02-menu" style={{ backgroundColor: BG, padding: "96px 0", fontFamily: SANS }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 clamp(24px, 5vw, 64px)" }}>
        {/* Header */}
        <div data-c02m="0" style={{ textAlign: "center", marginBottom: 56 }}>
          <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.18em", textTransform: "uppercase", color: GOLD, margin: "0 0 14px" }}>
            <GenericEditableText sectionId={sectionId} field="tagline" value={tagline} tag="span" />
          </p>
          <div style={{ width: 40, height: 1.5, backgroundColor: GOLD, margin: "0 auto 20px" }} />
          <h2 style={{ fontFamily: FONT, fontSize: "clamp(28px, 3.5vw, 46px)", fontWeight: 400, color: BURG, margin: "0 0 20px", lineHeight: 1.2, whiteSpace: "pre-line" }}>
            <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
          </h2>
          {body && (
            <p style={{ fontSize: 15, fontWeight: 400, lineHeight: 1.75, color: MUTED, maxWidth: 560, margin: "0 auto" }}>
              <GenericEditableText sectionId={sectionId} field="body" value={body} tag="span" />
            </p>
          )}
        </div>

        {/* Karty */}
        <div className="c02m-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24, marginBottom: 48 }}>
          {items.map((item, i) => {
            const name     = String(item.name        ?? "");
            const category = String(item.category    ?? "");
            const desc     = String(item.description ?? "");
            const img      = String(item.image       ?? PLACEHOLDERS[i % 3]);
            const cardCta  = String(item.ctaText     ?? "Jídelní lístek");
            const cardHref = String(item.ctaHref     ?? ctaHref);
            return (
              <div key={i} data-c02m={i + 1} style={{ transitionDelay: `${i * 0.12}s` }}>
                <div className="c02m-card" style={{ backgroundColor: CARD, overflow: "hidden", borderRadius: 2, boxShadow: "0 2px 16px rgba(26,14,10,0.07)", height: "100%" }}>
                  <div style={{ height: 2, backgroundColor: GOLD }} />
                  <div style={{ aspectRatio: "16/9", overflow: "hidden" }}>
                    <GenericEditableImage sectionId={sectionId} field={`items.${i}.image`} src={img} alt={name} style={{ width: "100%", height: "100%", display: "block" }}>
                      <img loading="lazy" src={img} alt={name} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                    </GenericEditableImage>
                  </div>
                  <div style={{ padding: "24px 24px 28px" }}>
                    <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.16em", textTransform: "uppercase", color: GOLD, margin: "0 0 8px" }}>
                      <GenericEditableText sectionId={sectionId} field={`items.${i}.category`} value={category} tag="span" />
                    </p>
                    <h3 style={{ fontFamily: FONT, fontSize: 22, fontWeight: 400, color: BURG, margin: "0 0 12px" }}>
                      <GenericEditableText sectionId={sectionId} field={`items.${i}.name`} value={name} tag="span" />
                    </h3>
                    <p style={{ fontSize: 13, fontWeight: 400, lineHeight: 1.75, color: TEXT, margin: "0 0 20px" }}>
                      <GenericEditableText sectionId={sectionId} field={`items.${i}.description`} value={desc} tag="span" />
                    </p>
                    <a href={cardHref}
                      style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: BURG, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 6, transition: "opacity 0.2s" }}
                      onMouseEnter={e => (e.currentTarget.style.opacity = "0.7")}
                      onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
                    >
                      <GenericEditableText sectionId={sectionId} field={`items.${i}.ctaText`} value={cardCta} tag="span" /> <span style={{ fontSize: 14 }}>→</span>
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Hlavní CTA */}
        <div style={{ textAlign: "center" }}>
          <a href={ctaHref} data-btn="primary" style={{
            fontFamily: SANS, fontSize: 12, fontWeight: 600, letterSpacing: "0.1em",
            textTransform: "uppercase", color: BURG, textDecoration: "none",
            padding: "14px 36px", border: `1.5px solid ${BURG}`, borderRadius: 2,
            display: "inline-block", transition: "background-color 0.2s, color 0.2s",
          }}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = BURG; e.currentTarget.style.color = "#fff"; }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = BURG; }}
          >
            <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
          </a>
        </div>
      </div>

      <style>{`
        @media(max-width:900px){.c02m-grid{grid-template-columns:1fr 1fr!important}}
        @media(max-width:600px){.c02m-grid{grid-template-columns:1fr!important}}
        .c02m-card{transition:transform 0.22s ease,box-shadow 0.22s ease}
        .c02m-card:hover{transform:translateY(-5px);box-shadow:0 8px 28px rgba(26,14,10,0.12)!important}
        [data-c02m]{opacity:0;transform:translateY(36px);transition:opacity .72s cubic-bezier(.22,1,.36,1),transform .72s cubic-bezier(.22,1,.36,1)}
        [data-c02m].c02m-vis{opacity:1;transform:translateY(0)}
      `}</style>
    </section>
  );
}

// ── restaurant-01-menu ─────────────────────────────────────────────────────────
// Dark #0f0a07 bg; amber kicker + cream serif H2 centrovaně
// 3-col menu karty: foto + amber top border + kategorie + popis + link
// ─────────────────────────────────────────────────────────────────────────────
function ServicesRestaurant01({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const id      = String(content.id      ?? "menu");
  const tagline = String(content.tagline ?? "Naše nabídka");
  const title   = String(content.title   ?? "Menu pro každou příležitost.");
  const body    = String(content.body    ?? "");
  const ctaText = String(content.ctaText ?? "Zobrazit celé menu");
  const ctaHref = String(content.ctaHref ?? "/menu");
  const items   = (content.items as Array<Record<string, unknown>>) ?? [];

  const secRef = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = secRef.current;
    if (!el) return;
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) { (e.target as HTMLElement).classList.add("r01-vis"); obs.unobserve(e.target); } });
    }, { threshold: 0.1 });
    el.querySelectorAll<HTMLElement>("[data-r01]").forEach(item => obs.observe(item));
    return () => obs.disconnect();
  }, []);

  const DARK   = "#0f0a07";
  const CREAM  = "#f5ede0";
  const AMBER  = "#c8943f";
  const MUTED  = "#a08060";
  const CARD   = "#1a0e0a";
  const FONT   = "Georgia, 'Times New Roman', serif";
  const SANS   = "'Helvetica Neue', Helvetica, Arial, sans-serif";
  const PLACEHOLDERS = [
    "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&h=400&fit=crop&fm=webp",
    "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=600&h=400&fit=crop&fm=webp",
    "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&h=400&fit=crop&fm=webp",
  ];

  return (
    <section ref={secRef} id={id} data-variant="restaurant-01-menu" style={{ backgroundColor: DARK, padding: "96px 0", fontFamily: SANS }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 clamp(24px, 5vw, 64px)" }}>
        {/* Header */}
        <div data-r01="0" style={{ textAlign: "center", marginBottom: 56 }}>
          <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.18em", textTransform: "uppercase", color: AMBER, margin: "0 0 16px" }}>
            <GenericEditableText sectionId={sectionId} field="tagline" value={tagline} tag="span" />
          </p>
          <h2 style={{ fontFamily: FONT, fontSize: "clamp(28px, 3.5vw, 46px)", fontWeight: 400, color: CREAM, margin: "0 0 20px", lineHeight: 1.2 }}>
            <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
          </h2>
          {body && (
            <p style={{ fontSize: 15, fontWeight: 300, color: MUTED, maxWidth: 560, margin: "0 auto" }}>
              <GenericEditableText sectionId={sectionId} field="body" value={body} tag="span" />
            </p>
          )}
        </div>

        {/* Karty */}
        <div className="r01-menu-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24, marginBottom: 48 }}>
          {items.map((item, i) => {
            const name     = String(item.name        ?? "");
            const category = String(item.category    ?? "");
            const desc     = String(item.description ?? "");
            const img      = String(item.image       ?? PLACEHOLDERS[i % 3]);
            const cardCta  = String(item.ctaText     ?? "Zobrazit menu");
            const cardHref = String(item.ctaHref     ?? ctaHref);
            return (
              /* Outer reveal wrapper */
              <div key={i} data-r01={i + 1} style={{ transitionDelay: `${i * 0.12}s` }}>
                {/* Inner card — handles hover independently */}
                <div className="r01-menu-card" style={{ backgroundColor: CARD, overflow: "hidden", borderRadius: 2, border: `1px solid rgba(200,148,63,0.15)`, height: "100%" }}>
                  {/* Amber top border */}
                  <div style={{ height: 2, backgroundColor: AMBER }} />
                  {/* Foto */}
                  <div style={{ aspectRatio: "16/9", overflow: "hidden" }}>
                    <GenericEditableImage sectionId={sectionId} field={`items.${i}.image`} src={img} alt={name} style={{ width: "100%", height: "100%", display: "block" }}>
                      <img
                        src={img}
                        alt={name}
                        style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                      />
                    </GenericEditableImage>
                  </div>
                  {/* Text */}
                  <div style={{ padding: "24px 24px 28px" }}>
                    <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.16em", textTransform: "uppercase", color: AMBER, margin: "0 0 8px" }}>
                      <GenericEditableText sectionId={sectionId} field={`items.${i}.category`} value={category} tag="span" />
                    </p>
                    <h3 style={{ fontFamily: FONT, fontSize: 22, fontWeight: 400, color: CREAM, margin: "0 0 12px" }}>
                      <GenericEditableText sectionId={sectionId} field={`items.${i}.name`} value={name} tag="span" />
                    </h3>
                    <p style={{ fontSize: 13, fontWeight: 300, lineHeight: 1.7, color: MUTED, margin: "0 0 20px" }}>
                      <GenericEditableText sectionId={sectionId} field={`items.${i}.description`} value={desc} tag="span" />
                    </p>
                    <a href={cardHref} style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: AMBER, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 6, transition: "opacity 0.2s" }}
                      onMouseEnter={e => (e.currentTarget.style.opacity = "0.7")}
                      onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
                    >
                      <GenericEditableText sectionId={sectionId} field={`items.${i}.ctaText`} value={cardCta} tag="span" /> <span style={{ fontSize: 14 }}>→</span>
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Hlavní CTA */}
        <div style={{ textAlign: "center" }}>
          <a href={ctaHref} data-btn="primary" style={{
            fontFamily: SANS, fontSize: 12, fontWeight: 600, letterSpacing: "0.1em",
            textTransform: "uppercase", color: CREAM, textDecoration: "none",
            padding: "14px 36px", border: `1px solid ${AMBER}`, borderRadius: 3,
            display: "inline-block", transition: "background-color 0.2s, color 0.2s",
          }}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = AMBER; e.currentTarget.style.color = DARK; }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = CREAM; }}
          >
            <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
          </a>
        </div>
      </div>

      <style>{`
        @media(max-width:900px){.r01-menu-grid{grid-template-columns:1fr!important}}
        @media(max-width:640px){.r01-menu-grid{grid-template-columns:1fr!important}}
        .r01-menu-card{transition:transform 0.22s ease}
        .r01-menu-card:hover{transform:translateY(-6px)}
        [data-r01]{opacity:0;transform:translateY(36px);transition:opacity .72s cubic-bezier(.22,1,.36,1),transform .72s cubic-bezier(.22,1,.36,1)}
        [data-r01].r01-vis{opacity:1;transform:translateY(0)}
      `}</style>
    </section>
  );
}

// ── restaurant-02-menu ────────────────────────────────────────────────────────
// 3-col karty — bílé bg, foto nahoře, kategorie + název + popis + CTA
// Ref: restauracehybernska.cz — sekce menu / Co u nás najdete
// ─────────────────────────────────────────────────────────────────────────────
function ServicesRestaurant02({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const id      = String(content.id      ?? "menu");
  const tagline = String(content.tagline ?? "Naše nabídka");
  const title   = String(content.title   ?? "Co u nás najdete.");
  const body    = String(content.body    ?? "");
  const ctaText = String(content.ctaText ?? "Celý jídelní lístek");
  const ctaHref = String(content.ctaHref ?? "/menu");

  type Item = { name: string; category?: string; description?: string; image?: string; ctaText?: string; ctaHref?: string };
  const items = (content.items as Item[]) ?? [];

  const RED     = "#c0392b";
  const BLACK   = "#1a1a1a";
  const MUTED   = "#666666";
  const BORDER  = "#e8e8e8";
  const POPPINS = "'Poppins', sans-serif";

  const secRef = useRef<HTMLElement>(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const el = secRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVis(true); obs.disconnect(); } }, { threshold: 0.1 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <section ref={secRef} id={id} data-template="restaurant-02" style={{ backgroundColor: "#f7f7f5", padding: "clamp(64px, 8vw, 112px) 0", fontFamily: POPPINS }}>
      {/* Hlavička sekce */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 clamp(20px, 5vw, 60px)", marginBottom: "clamp(40px, 5vw, 64px)", opacity: vis ? 1 : 0, transform: vis ? "translateY(0)" : "translateY(24px)", transition: "opacity 0.6s ease, transform 0.6s ease" }}>
        <p style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase", color: RED, margin: "0 0 12px" }}>
          <GenericEditableText sectionId={sectionId} field="tagline" value={tagline} tag="span" />
        </p>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
          <div>
            <h2 style={{ fontSize: "clamp(26px, 3vw, 40px)", fontWeight: 700, lineHeight: 1.2, color: BLACK, margin: "0 0 12px" }}>
              <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
            </h2>
            {body && (
              <p style={{ fontSize: 15, lineHeight: 1.7, color: MUTED, maxWidth: 560, margin: 0 }}>
                <GenericEditableText sectionId={sectionId} field="body" value={body} tag="span" />
              </p>
            )}
          </div>
          <a
            href={ctaHref}
            data-btn="primary"
            style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: RED, textDecoration: "none", borderBottom: `1.5px solid ${RED}`, paddingBottom: 2, whiteSpace: "nowrap", transition: "opacity 0.2s", flexShrink: 0 }}
            onMouseEnter={e => (e.currentTarget.style.opacity = "0.7")}
            onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
          >
            <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
          </a>
        </div>
      </div>

      {/* Karty */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 clamp(20px, 5vw, 60px)", display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24 }} className="r02-menu-grid">
        {items.map((item, i) => (
          <div
            key={i}
            className="r02-menu-card"
            style={{ backgroundColor: "#ffffff", border: `1px solid ${BORDER}`, overflow: "hidden", opacity: vis ? 1 : 0, transform: vis ? "translateY(0)" : "translateY(32px)", transition: `opacity 0.6s ease ${0.1 + i * 0.1}s, transform 0.6s ease ${0.1 + i * 0.1}s` }}
          >
            {item.image && (
              <div style={{ lineHeight: 0, overflow: "hidden" }}>
                <GenericEditableImage sectionId={sectionId} field={`items.${i}.image`} src={item.image} alt={item.name} style={{ display: "block", width: "100%" }}>
                  <img loading="lazy" src={item.image} alt={item.name} style={{ width: "100%", aspectRatio: "3/2", objectFit: "cover", display: "block", transition: "transform 0.4s ease" }}
                    onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.04)")}
                    onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
                  />
                </GenericEditableImage>
              </div>
            )}
            <div style={{ padding: "24px 24px 28px" }}>
              {item.category && (
                <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: RED, margin: "0 0 8px" }}>
                  <GenericEditableText sectionId={sectionId} field={`items.${i}.category`} value={item.category} tag="span" />
                </p>
              )}
              <h3 style={{ fontSize: 18, fontWeight: 700, color: BLACK, margin: "0 0 10px", lineHeight: 1.3 }}>
                <GenericEditableText sectionId={sectionId} field={`items.${i}.name`} value={item.name} tag="span" />
              </h3>
              {item.description && (
                <p style={{ fontSize: 14, lineHeight: 1.7, color: MUTED, margin: "0 0 20px" }}>
                  <GenericEditableText sectionId={sectionId} field={`items.${i}.description`} value={item.description} tag="span" />
                </p>
              )}
              {item.ctaText && (
                <a
                  href={item.ctaHref ?? ctaHref}
                  data-btn="primary"
                  style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: RED, textDecoration: "none", borderBottom: `1px solid ${RED}`, paddingBottom: 1, transition: "opacity 0.2s" }}
                  onMouseEnter={e => (e.currentTarget.style.opacity = "0.7")}
                  onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
                >
                  <GenericEditableText sectionId={sectionId} field={`items.${i}.ctaText`} value={item.ctaText} tag="span" />
                </a>
              )}
            </div>
          </div>
        ))}
      </div>

      <style>{`
        @media(max-width:900px){ .r02-menu-grid { grid-template-columns: 1fr 1fr !important; } }
        @media(max-width:580px){ .r02-menu-grid { grid-template-columns: 1fr !important; } }
        .r02-menu-card { transition: box-shadow 0.22s ease, transform 0.22s ease; }
        .r02-menu-card:hover { box-shadow: 0 8px 32px rgba(0,0,0,0.1); transform: translateY(-4px); }
      `}</style>
    </section>
  );
}

// ── restaurant-03-menu ────────────────────────────────────────────────────────
function ServicesRestaurant03({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const DARK   = "#0d1b2a";
  const GOLD   = "#e05e3f";
  const WHITE  = "#ffffff";
  const MUTED  = "rgba(255,255,255,0.65)";
  const SERIF  = "Georgia, 'Times New Roman', serif";
  const SANS   = "'Inter', 'Helvetica Neue', Arial, sans-serif";

  const id      = String(content.id      ?? "menu");
  const tagline = String(content.tagline ?? "Naše speciality");
  const title   = String(content.title   ?? "Menu pro každou chuť.");
  const body    = String(content.body    ?? "");
  const ctaText = String(content.ctaText ?? "Celé menu");
  const ctaHref = String(content.ctaHref ?? "/menu");
  const rawItems = Array.isArray(content.items) ? content.items as Record<string, unknown>[] : [];

  const secRef = useRef<HTMLElement>(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const el = secRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVis(true); obs.disconnect(); } }, { threshold: 0.1 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <section ref={secRef} id={id} data-template="restaurant-03" style={{ backgroundColor: DARK, padding: "clamp(72px, 10vw, 120px) 0", fontFamily: SANS }}>
      {/* Header */}
      <div style={{ maxWidth: 1200, margin: "0 auto 60px", padding: "0 clamp(20px, 5vw, 60px)", textAlign: "center" }}>
        <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.18em", textTransform: "uppercase", color: GOLD, margin: "0 0 14px" }}>
          <GenericEditableText sectionId={sectionId} field="tagline" value={tagline} tag="span" />
        </p>
        <h2 style={{ fontSize: "clamp(28px, 3.5vw, 46px)", fontWeight: 400, fontFamily: SERIF, lineHeight: 1.2, color: WHITE, margin: "0 0 20px", whiteSpace: "pre-line" }}>
          <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
        </h2>
        {body && (
          <p style={{ fontSize: 15, lineHeight: 1.8, color: MUTED, maxWidth: 600, margin: "0 auto" }}>
            <GenericEditableText sectionId={sectionId} field="body" value={body} tag="span" />
          </p>
        )}
      </div>

      {/* Cards */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 clamp(20px, 5vw, 60px)", display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 28 }} className="r03-menu-grid">
        {rawItems.map((item, i) => {
          const img  = String(item.image       ?? "");
          const name = String(item.name        ?? "");
          const cat  = String(item.category    ?? "");
          const desc = String(item.description ?? "");
          const cta  = String(item.ctaText     ?? "");
          const href = String(item.ctaHref     ?? ctaHref);
          return (
            <div
              key={i}
              className="r03-menu-card"
              style={{
                backgroundColor: "#162032",
                border: "1px solid #1e3a5f",
                overflow: "hidden",
                opacity: vis ? 1 : 0,
                transform: vis ? "translateY(0)" : "translateY(36px)",
                transition: `opacity 0.6s ease ${0.1 + i * 0.12}s, transform 0.6s ease ${0.1 + i * 0.12}s`,
              }}
            >
              {img && (
                <div style={{ lineHeight: 0, overflow: "hidden" }}>
                  <GenericEditableImage sectionId={sectionId} field={`items.${i}.image`} src={img} alt={name} style={{ display: "block", width: "100%" }}>
                    <img loading="lazy" src={img} alt={name} style={{ width: "100%", aspectRatio: "3/2", objectFit: "cover", display: "block", transition: "transform 0.45s ease" }}
                      onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.06)")}
                      onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
                    />
                  </GenericEditableImage>
                </div>
              )}
              <div style={{ padding: "24px 24px 28px" }}>
                {cat && (
                  <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: GOLD, margin: "0 0 8px" }}>
                    <GenericEditableText sectionId={sectionId} field={`items.${i}.category`} value={cat} tag="span" />
                  </p>
                )}
                <h3 style={{ fontSize: 20, fontWeight: 400, fontFamily: SERIF, color: WHITE, margin: "0 0 12px", lineHeight: 1.3 }}>
                  <GenericEditableText sectionId={sectionId} field={`items.${i}.name`} value={name} tag="span" />
                </h3>
                {desc && (
                  <p style={{ fontSize: 14, lineHeight: 1.75, color: MUTED, margin: "0 0 20px" }}>
                    <GenericEditableText sectionId={sectionId} field={`items.${i}.description`} value={desc} tag="span" />
                  </p>
                )}
                {cta && (
                  <a
                    href={href}
                    style={{ display: "inline-block", fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: GOLD, textDecoration: "none", border: `1.5px solid ${GOLD}`, padding: "8px 20px", transition: "background 0.2s, color 0.2s" }}
                    onMouseEnter={e => { e.currentTarget.style.backgroundColor = GOLD; e.currentTarget.style.color = DARK; }}
                    onMouseLeave={e => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = GOLD; }}
                  >
                    <GenericEditableText sectionId={sectionId} field={`items.${i}.ctaText`} value={cta} tag="span" />
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom CTA */}
      {ctaText && (
        <div style={{ textAlign: "center", marginTop: 56 }}>
          <a
            href={ctaHref}
            data-btn="primary"
            style={{ display: "inline-block", fontSize: 12, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: WHITE, textDecoration: "none", border: `2px solid ${GOLD}`, padding: "14px 40px", transition: "background 0.25s, color 0.25s" }}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = GOLD; e.currentTarget.style.color = DARK; }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = WHITE; }}
          >
            <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
          </a>
        </div>
      )}

      <style>{`
        @media(max-width:900px){ .r03-menu-grid { grid-template-columns: 1fr 1fr !important; } }
        @media(max-width:580px){ .r03-menu-grid { grid-template-columns: 1fr !important; } }
        .r03-menu-card { transition: box-shadow 0.25s ease, transform 0.25s ease; }
        .r03-menu-card:hover { box-shadow: 0 12px 40px rgba(0,0,0,0.5); transform: translateY(-4px); }
      `}</style>
    </section>
  );
}

// ── cafe-03-menu ───────────────────────────────────────────────────────────────
// Ref: cathedral.cz — nase-menu page s záložkami
// Bílé bg, tab navigace 01/02/03/04, tabulka položek (název + popis + cena)
// ─────────────────────────────────────────────────────────────────────────────
function ServicesCafe03({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const GOLD  = "#C69C60";
  const DARK  = "#1a1a1a";
  const MUTED = "#6b6b6b";
  const SANS  = "'Open Sans', sans-serif";
  const SERIF = "'Great Vibes', cursive";

  const title = String(content.title ?? "Jídelní & nápojový lístek");
  const tabs  = (content.tabs as Array<{
    label: string; number: string; subtitle?: string;
    items: Array<{ name: string; description?: string; price: string }>;
  }>) ?? [];

  const defaultTabs = [
    { label: "Snídaně",         number: "01", subtitle: "Každý den do 12:00", items: [{ name: "Vejce Benedikt", description: "bagel, sázené vejce, holandská omáčka", price: "239 Kč" }, { name: "Healthy Bowl", description: "jogurt, granola, ovoce", price: "189 Kč" }] },
    { label: "Menu",             number: "02", subtitle: "Obědové menu 11–15h", items: [{ name: "Svíčková", description: "hovězí, knedlík, brusinky", price: "289 Kč" }, { name: "Burger Cathedral", description: "hovězí patty, cheddar, BBQ", price: "299 Kč" }] },
    { label: "Nápojový lístek",  number: "03", subtitle: "Káva, čaj, koktejly", items: [{ name: "Espresso", description: "", price: "59 Kč" }, { name: "Aperol Spritz", description: "", price: "149 Kč" }] },
    { label: "Vinný lístek",     number: "04", subtitle: "Česká i zahraniční vína", items: [{ name: "Veltlínské zelené", description: "sklenka / lahev", price: "89 / 349 Kč" }] },
  ];
  const tabList = tabs.length > 0 ? tabs : defaultTabs;

  const [activeTab, setActiveTab] = useState(0);

  return (
    <section style={{ backgroundColor: "#fff", padding: "clamp(48px, 8vw, 96px) 0", fontFamily: SANS }}>
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 clamp(20px, 5vw, 60px)" }}>
        <GenericEditableText sectionId={sectionId} field="title" value={title} tag="h2">
          <h2 style={{ fontFamily: SERIF, fontSize: "clamp(32px, 4vw, 52px)", fontWeight: 400, color: DARK, margin: "0 0 48px", textAlign: "center" }}>{title}</h2>
        </GenericEditableText>

        {/* Tab nav */}
        <nav style={{ display: "flex", justifyContent: "center", flexWrap: "wrap", gap: "clamp(16px, 4vw, 48px)", marginBottom: 48, borderBottom: `1px solid #E8E2D8`, paddingBottom: 0 }}>
          {tabList.map((tab, i) => (
            <button
              key={i}
              onClick={() => setActiveTab(i)}
              style={{ background: "none", border: "none", cursor: "pointer", fontFamily: SANS, padding: "12px 0 16px", display: "flex", alignItems: "center", gap: 10, borderBottom: `2px solid ${i === activeTab ? GOLD : "transparent"}`, transition: "border-color 0.2s", marginBottom: -1 }}
            >
              <span style={{ fontFamily: SERIF, fontSize: "clamp(22px, 3vw, 32px)", color: i === activeTab ? GOLD : "#ccc", transition: "color 0.2s" }}>{tab.number}</span>
              <GenericEditableText sectionId={sectionId} field={`tabs.${i}.label`} value={tab.label} tag="span">
                <span style={{ fontFamily: SANS, fontSize: "clamp(14px, 1.8vw, 17px)", fontWeight: i === activeTab ? 600 : 400, color: i === activeTab ? DARK : MUTED, transition: "color 0.2s", letterSpacing: "0.02em" }}>{tab.label}</span>
              </GenericEditableText>
            </button>
          ))}
        </nav>

        {/* Active tab content */}
        {tabList[activeTab] && (
          <div>
            {tabList[activeTab].subtitle && (
              <GenericEditableText sectionId={sectionId} field={`tabs.${activeTab}.subtitle`} value={tabList[activeTab].subtitle!} tag="p">
                <p style={{ fontFamily: SANS, fontSize: 14, fontWeight: 400, color: GOLD, margin: "0 0 24px", textAlign: "center", letterSpacing: "0.04em" }}>{tabList[activeTab].subtitle}</p>
              </GenericEditableText>
            )}
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <tbody>
                {tabList[activeTab].items.map((item, j) => (
                  <tr key={j} style={{ borderBottom: `1px solid #E8E2D8` }}>
                    <td style={{ padding: "16px 16px 16px 0", verticalAlign: "top" }}>
                      <GenericEditableText sectionId={sectionId} field={`tabs.${activeTab}.items.${j}.name`} value={item.name} tag="strong">
                        <strong style={{ fontFamily: SANS, fontSize: 15, fontWeight: 600, color: DARK, display: "block", marginBottom: 4 }}>{item.name}</strong>
                      </GenericEditableText>
                      {item.description && (
                        <GenericEditableText sectionId={sectionId} field={`tabs.${activeTab}.items.${j}.description`} value={item.description} tag="span">
                          <span style={{ fontFamily: SANS, fontSize: 13, fontWeight: 300, color: MUTED }}>{item.description}</span>
                        </GenericEditableText>
                      )}
                    </td>
                    <td style={{ padding: "16px 0 16px 16px", textAlign: "right", verticalAlign: "top", whiteSpace: "nowrap" }}>
                      <GenericEditableText sectionId={sectionId} field={`tabs.${activeTab}.items.${j}.price`} value={item.price} tag="span">
                        <span style={{ fontFamily: SANS, fontSize: 15, fontWeight: 600, color: DARK }}>{item.price}</span>
                      </GenericEditableText>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Great+Vibes&family=Open+Sans:wght@300;400;600&display=swap" />
      <style>{`      `}</style>
    </section>
  );
}

// ── bakery-01-promo-2col ──────────────────────────────────────────────────────
// Section heading + 2-col promo cards (image, heading, text, CTA link)
// ─────────────────────────────────────────────────────────────────────────────
function ServicesBakery01({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const DARK   = "#393939";
  const MUTED  = "#666666";
  const BG     = "#f9f7f4";
  const SERIF  = "'Josefin Sans', 'Helvetica Neue', sans-serif";
  const SANS   = "'Metropolis', 'Inter', sans-serif";

  type Item = { image?: string; heading?: string; text?: string; cta?: string; ctaHref?: string };
  const sectionHeading = String(content.heading ?? "U nás se vždy něco děje");
  const items: Item[]  = Array.isArray(content.items) ? (content.items as Item[]) : [];

  return (
    <section style={{ backgroundColor: BG, fontFamily: SANS, padding: "clamp(56px, 8vw, 96px) 0" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 clamp(24px, 5vw, 60px)" }}>

        {/* Section heading */}
        <h2 style={{ fontFamily: SERIF, fontWeight: 300, fontSize: "clamp(1.4rem, 3vw, 2.2rem)", letterSpacing: "0.12em", textTransform: "uppercase", color: DARK, textAlign: "center", margin: "0 0 clamp(40px, 6vw, 64px)" }}>
          <GenericEditableText sectionId={sectionId} field="heading" value={sectionHeading} tag="span" />
        </h2>

        {/* 2-col cards */}
        <div
          className="b01-promo-grid"
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "clamp(24px, 4vw, 48px)" }}
        >
          {items.map((item, i) => {
            const img     = item.image   ?? "";
            const title   = item.heading ?? "";
            const text    = item.text    ?? "";
            const cta     = item.cta     ?? "";
            const ctaHref = item.ctaHref ?? "#";
            return (
              <div key={i} style={{ backgroundColor: "#ffffff", display: "flex", flexDirection: "column" }}>
                <GenericEditableImage sectionId={sectionId} field={`items.${i}.image`} src={img} alt={title} style={{ display: "block" }}>
                  <img
                    src={img}
                    alt={title}
                    loading="lazy"
                    style={{ width: "100%", aspectRatio: "4/3", objectFit: "cover", display: "block" }}
                  />
                </GenericEditableImage>
                <div style={{ padding: "clamp(24px, 3vw, 36px)", display: "flex", flexDirection: "column", gap: 12, flex: 1 }}>
                  <h3 style={{ fontFamily: SERIF, fontWeight: 300, fontSize: "clamp(1rem, 1.8vw, 1.3rem)", letterSpacing: "0.1em", textTransform: "uppercase", color: DARK, margin: 0 }}>
                    <GenericEditableText sectionId={sectionId} field={`items.${i}.heading`} value={title} tag="span" />
                  </h3>
                  <p style={{ fontSize: "clamp(0.88rem, 1.1vw, 0.95rem)", lineHeight: 1.8, color: MUTED, margin: 0, flex: 1 }}>
                    <GenericEditableText sectionId={sectionId} field={`items.${i}.text`} value={text} tag="span" />
                  </p>
                  {cta && (
                    <a
                      href={ctaHref}
                      data-btn="primary"
                      style={{
                        display: "inline-block",
                        fontFamily: SERIF,
                        fontSize: 10,
                        fontWeight: 400,
                        letterSpacing: "0.15em",
                        textTransform: "uppercase",
                        color: DARK,
                        textDecoration: "none",
                        borderBottom: `1px solid ${DARK}`,
                        paddingBottom: 2,
                        alignSelf: "flex-start",
                        marginTop: 8,
                      }}
                    >
                      <GenericEditableText sectionId={sectionId} field={`items.${i}.cta`} value={cta} tag="span" />
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <style>{`
        @media (max-width: 600px) {
          .b01-promo-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}

// ── cafe-04-menu ──────────────────────────────────────────────────────────────
// Ref: coffeeroom.cz coffeebar — centered label + deco lines, items as list
// ─────────────────────────────────────────────────────────────────────────────
function ServicesCafe04({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  type Item = { name: string; price: string; description?: string };
  const heading = String(content.heading ?? "Naše menu");
  const items   = (content.items as Item[] | undefined) ?? [];

  return (
    <section style={{ backgroundColor: "#fff", fontFamily: "Montserrat, sans-serif", padding: "80px 0 100px" }}>
      <style>{`
        .cr04-menu-wrap { width: 70%; margin: 0 auto; }
        .cr04-menu-header { display: flex; justify-content: center; align-items: center; margin-bottom: 60px; }
        .cr04-menu-deco { background-color: #ececed; width: 30px; height: 1px; display: inline-block; }
        .cr04-menu-label { opacity: 0.9; color: #b79570; letter-spacing: 2px; text-transform: uppercase; font-size: 12px; font-weight: 700; font-family: Montserrat, sans-serif; margin: 0 15px; }
        .cr04-menu-item { display: flex; align-items: flex-start; justify-content: space-between; padding: 20px 0; border-bottom: 1px solid #ececed; gap: 16px; }
        .cr04-menu-item:last-child { border-bottom: none; }
        .cr04-menu-name { font-family: Montserrat, sans-serif; font-size: 16px; font-weight: 600; color: #1d1f2e; margin: 0 0 4px; }
        .cr04-menu-desc { font-family: 'Karla', sans-serif; font-size: 14px; color: rgba(29,31,46,0.6); margin: 0; }
        .cr04-menu-price { font-family: Montserrat, sans-serif; font-size: 15px; font-weight: 600; color: #b79570; white-space: nowrap; flex-shrink: 0; }
        @media (max-width: 828px) { .cr04-menu-wrap { width: 90%; } }
      `}</style>
      <div className="cr04-menu-wrap">
        <div className="cr04-menu-header">
          <div className="cr04-menu-deco" />
          <span className="cr04-menu-label">
            <GenericEditableText sectionId={sectionId} field="heading" value={heading} tag="span" />
          </span>
          <div className="cr04-menu-deco" />
        </div>
        {items.map((item, i) => (
          <div key={i} className="cr04-menu-item">
            <div>
              <p className="cr04-menu-name">
                <GenericEditableText sectionId={sectionId} field={`items.${i}.name`} value={item.name} tag="span" />
              </p>
              {item.description && (
                <p className="cr04-menu-desc">
                  <GenericEditableText sectionId={sectionId} field={`items.${i}.description`} value={item.description} tag="span" />
                </p>
              )}
            </div>
            <span className="cr04-menu-price">
              <GenericEditableText sectionId={sectionId} field={`items.${i}.price`} value={item.price} tag="span" />
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

// ── reality-02-agents ─────────────────────────────────────────────────────────
// Ref: fermakleri.cz "Kdo jsou makléři, které vám doporučujeme?" — 5 criteria
// Light #e8efee bg, centrovaný H2, 5 řádků: ikona vlevo + text
// ─────────────────────────────────────────────────────────────────────────────
function ServicesReality02Agents({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const title    = String(content.title ?? "Kdo jsou makléři, které vám doporučujeme?");
  const criteria = (content.criteria as Array<{ icon: string; text: string }>) ?? [];

  const DARK = "#05303a";
  const LIGHT = "#e8efee";
  const FONT  = "'Montserrat', 'Helvetica Neue', Arial, sans-serif";

  const ICON_CONFIGS: Record<string, { bg: string; border: string; stroke: string }> = {
    experience:   { bg: "#e8f4ff", border: "#93c5fd", stroke: "#2563eb" },
    presentation: { bg: "#fff7ed", border: "#fcd34d", stroke: "#d97706" },
    references:   { bg: "#f5f3ff", border: "#c4b5fd", stroke: "#7c3aed" },
    contracts:    { bg: "#ecfdf5", border: "#6ee7b7", stroke: "#059669" },
    safekeeping:  { bg: "#fff1f2", border: "#fda4af", stroke: "#e11d48" },
  };

  const AgentIcon = ({ type }: { type: string }) => {
    const cfg = ICON_CONFIGS[type] ?? ICON_CONFIGS.safekeeping;
    const p = { width: 30, height: 30, viewBox: "0 0 30 30", fill: "none", stroke: cfg.stroke, strokeWidth: "1.2", strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
    switch (type) {
      case "experience":
        return (
          <svg {...p} className="r02a-ico-experience">
            <circle cx="15" cy="16" r="10"/>
            <g className="r02a-hand" style={{ transformOrigin: "15px 16px" }}>
              <path d="M15 10 L15 16 L19 18"/>
            </g>
            <path d="M11 4 L19 4"/><path d="M15 4 L15 7"/>
          </svg>
        );
      case "presentation":
        return (
          <svg {...p} className="r02a-ico-presentation">
            <rect x="3" y="5" width="24" height="15" rx="2"/>
            <line x1="9" y1="24" x2="21" y2="24"/>
            <line x1="15" y1="20" x2="15" y2="24"/>
            <path className="r02a-screen-line" d="M7 10 L17 10" style={{ strokeDasharray: 12, strokeDashoffset: 0 }}/>
            <path className="r02a-screen-line2" d="M7 13 L13 13" style={{ strokeDasharray: 8, strokeDashoffset: 0 }}/>
          </svg>
        );
      case "references":
        return (
          <svg {...p} className="r02a-ico-references">
            <path className="r02a-bubble" d="M19 14a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2z" style={{ transformOrigin: "10px 12px", transformBox: "fill-box" as const }}/>
          </svg>
        );
      case "contracts":
        return (
          <svg {...p} className="r02a-ico-contracts">
            <path d="M13 2H6a2 2 0 0 0-2 2v22a2 2 0 0 0 2 2h18a2 2 0 0 0 2-2V10z"/>
            <polyline points="13,2 13,10 21,10"/>
            <path className="r02a-line1" d="M8 15 L22 15" style={{ strokeDasharray: 16, strokeDashoffset: 0 }}/>
            <path className="r02a-line2" d="M8 19 L18 19" style={{ strokeDasharray: 12, strokeDashoffset: 0 }}/>
          </svg>
        );
      default:
        return (
          <svg {...p} className="r02a-ico-safekeeping">
            <rect x="5" y="13" width="20" height="14" rx="2"/>
            <path className="r02a-lock-shackle" d="M9 13 V9 a6 6 0 0 1 12 0 V13" style={{ transformOrigin: "15px 11px", transformBox: "fill-box" as const }}/>
            <circle className="r02a-keyhole" cx="15" cy="20" r="2" style={{ transformOrigin: "15px 20px", transformBox: "fill-box" as const }}/>
          </svg>
        );
    }
  };

  return (
    <section id="makleri" style={{ backgroundColor: LIGHT, fontFamily: FONT }}>
      <div style={{ width: 0, height: 0, borderLeft: "60px solid transparent", borderRight: "60px solid transparent", borderTop: "44px solid #ffffff", margin: "0 auto" }} />
      <style>{`
        @keyframes r02a-tickhand   { to { transform: rotate(360deg); } }
        @keyframes r02a-drawline   { from { stroke-dashoffset: 16; } to { stroke-dashoffset: 0; } }
        @keyframes r02a-drawline2  { from { stroke-dashoffset: 12; } to { stroke-dashoffset: 0; } }
        @keyframes r02a-bubblebounce { 0%,100%{transform:scale(1)} 40%{transform:scale(1.16)} 70%{transform:scale(0.94)} }
        @keyframes r02a-shackle    { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-3px)} }
        @keyframes r02a-keyhole    { 0%,100%{transform:scale(1)} 50%{transform:scale(1.35)} }
        @keyframes r02a-iconbounce { 0%,100%{transform:scale(1)} 50%{transform:scale(1.12) rotate(-5deg)} }

        .r02a-row { transition: transform 0.22s ease, box-shadow 0.22s ease; cursor: default; }
        .r02a-row:hover { transform: translateX(4px); box-shadow: 0 8px 24px rgba(5,48,58,0.10); }
        .r02a-circle { transition: transform 0.3s ease; }
        .r02a-row:hover .r02a-circle { animation: r02a-iconbounce 0.55s ease; }

        .r02a-row:hover .r02a-ico-experience .r02a-hand { animation: r02a-tickhand 1.2s linear infinite; }
        .r02a-row:hover .r02a-ico-presentation .r02a-screen-line  { animation: r02a-drawline  0.4s ease forwards; }
        .r02a-row:hover .r02a-ico-presentation .r02a-screen-line2 { animation: r02a-drawline2 0.4s 0.1s ease forwards; }
        .r02a-row:hover .r02a-ico-references .r02a-bubble         { animation: r02a-bubblebounce 0.5s ease; }
        .r02a-row:hover .r02a-ico-contracts .r02a-line1 { animation: r02a-drawline  0.4s ease forwards; }
        .r02a-row:hover .r02a-ico-contracts .r02a-line2 { animation: r02a-drawline2 0.4s 0.1s ease forwards; }
        .r02a-row:hover .r02a-ico-safekeeping .r02a-lock-shackle { animation: r02a-shackle 0.5s ease; }
        .r02a-row:hover .r02a-ico-safekeeping .r02a-keyhole      { animation: r02a-keyhole 0.5s ease; }
      `}</style>
      <div style={{ maxWidth: 800, margin: "0 auto", textAlign: "center", padding: "clamp(40px,6vw,80px) clamp(16px,5vw,48px) clamp(48px,8vw,96px)" }}>
        <h2 style={{ fontSize: "clamp(22px,3.5vw,36px)", fontWeight: 800, color: DARK, marginBottom: "clamp(36px,6vw,64px)" }}>
          <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {criteria.map((item, i) => {
            const cfg = ICON_CONFIGS[item.icon] ?? ICON_CONFIGS.safekeeping;
            return (
              <div key={`r02-agent-${i}`} className="r02a-row" style={{ display: "flex", alignItems: "center", gap: 20, padding: "16px 24px", backgroundColor: "#ffffff", borderRadius: 12, boxShadow: "0 2px 8px rgba(5,48,58,0.06)", textAlign: "left" }}>
                <div className="r02a-circle" style={{ width: 56, height: 56, borderRadius: "50%", backgroundColor: cfg.bg, border: `2px solid ${cfg.border}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <AgentIcon type={item.icon} />
                </div>
                <p style={{ fontSize: 15, fontWeight: 600, color: DARK, lineHeight: 1.55, margin: 0 }}>
                  <GenericEditableText sectionId={sectionId} field={`criteria.${i}.text`} value={item.text} tag="span" />
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}



// ── reality-03-services-4grid ─────────────────────────────────────────────────
// Checkerboard layout: bílá / navy / navy / bílá
// Každá karta má JINOU animovanou SVG ikonu
// Scroll entrance: karty letí střídavě zleva a zprava
// Hover: bílá → teplé béžové; navy → světlejší navy + lift + shadow
// ─────────────────────────────────────────────────────────────────────────────
function ServicesReality03Grid({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const title = String(content.title ?? "Naše služby");
  const items = (content.items as Array<{ title: string; body: string; ctaText?: string; ctaHref?: string }>) ?? [];

  const DARK  = "#132538";
  const OCHRE = "#e38a6a";
  const WHITE = "#ffffff";
  const SANS  = "'Helvetica Neue', Helvetica, Arial, sans-serif";

  const sectionRef = useRef<HTMLElement>(null);
  const [visible, setVisible]   = useState(false);
  const [hovered, setHovered]   = useState<number | null>(null);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } }, { threshold: 0.1 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // checkerboard: 0=white, 1=navy, 2=navy, 3=white
  const isDark = [false, true, true, false];

  const cardBg = (i: number, hov: boolean) => {
    if (!hov) return isDark[i] ? DARK : WHITE;
    return isDark[i] ? "#1e3852" : "#fdf0ea";
  };
  const cardText = (i: number) => isDark[i] ? WHITE : DARK;

  // slide direction alternates per card
  const slideFrom = (i: number) => i % 2 === 0 ? "translateX(-60px)" : "translateX(60px)";

  return (
    <section ref={sectionRef} id="sluzby" style={{ backgroundColor: "#f7f5f2", fontFamily: SANS, padding: "clamp(64px, 9vw, 110px) clamp(20px, 4vw, 64px)", overflow: "hidden" }}>
      <div style={{ maxWidth: 1240, margin: "0 auto" }}>

        {/* Heading */}
        <div style={{
          textAlign: "center", marginBottom: "clamp(40px, 6vw, 72px)",
          opacity: visible ? 1 : 0, transform: visible ? "none" : "translateY(30px)",
          transition: "opacity 0.7s ease, transform 0.7s ease",
        }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: OCHRE, letterSpacing: "4px", textTransform: "uppercase", margin: "0 0 14px" }}>Co pro vás děláme</p>
          <h2 style={{ fontSize: "clamp(1.8rem, 3.2vw, 2.6rem)", fontWeight: 700, color: DARK, margin: 0, letterSpacing: "-0.03em" }}>
            <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
          </h2>
        </div>

        {/* 2×2 checkerboard */}
        <div data-r03-svc-grid style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {items.map((item, i) => {
            const hov   = hovered === i;
            const dark  = isDark[i];
            const delay = `${i * 0.13}s`;
            return (
              <div
                key={`r03-svc-${i}`}
                className={`r03-card r03-card-${i}`}
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
                style={{
                  position: "relative",
                  padding: "clamp(32px, 4vw, 52px)",
                  backgroundColor: cardBg(i, hov),
                  borderRadius: 6,
                  display: "flex",
                  flexDirection: "column",
                  gap: 20,
                  cursor: "default",
                  transition: "background-color 0.4s ease, transform 0.35s ease, box-shadow 0.35s ease",
                  transform: visible ? (hov ? "translateY(-6px)" : "none") : slideFrom(i),
                  opacity: visible ? 1 : 0,
                  boxShadow: hov ? "0 24px 56px rgba(19,37,56,0.22)" : "0 2px 12px rgba(0,0,0,0.06)",
                  animation: visible ? `r03SlideIn${i} 0.65s cubic-bezier(0.22,1,0.36,1) ${delay} both` : "none",
                }}
              >
                {/* Číslo — absolutní v rohu */}
                <span style={{
                  position: "absolute", top: 24, right: 28,
                  fontSize: "clamp(48px, 6vw, 76px)", fontWeight: 800, lineHeight: 1,
                  color: dark ? "rgba(255,255,255,0.07)" : "rgba(19,37,56,0.06)",
                  userSelect: "none", pointerEvents: "none", letterSpacing: "-0.04em",
                  fontFamily: SANS,
                }}>
                  {String(i + 1).padStart(2, "0")}
                </span>

                {/* Ikona — každá jiná + animovaná */}
                <div className={`r03-icon r03-icon-${i}`} style={{
                  width: 60, height: 60, borderRadius: "50%",
                  backgroundColor: dark ? "rgba(227,138,106,0.15)" : "rgba(19,37,56,0.07)",
                  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                  color: OCHRE, transition: "background-color 0.4s ease",
                }}>
                  {i === 0 && (
                    // Klíč — rotuje + rámeček se rozsvítí
                    <svg className="r03-ico-key" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="7.5" cy="15.5" r="4.5"/>
                      <path d="M20 4L10.5 13.5"/>
                      <path d="M17 7l2 2"/>
                      <path d="M14 4l2 2"/>
                    </svg>
                  )}
                  {i === 1 && (
                    // Graf/šipka nahoru — trendová čára
                    <svg className="r03-ico-trend" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/>
                      <polyline points="16 7 22 7 22 13"/>
                    </svg>
                  )}
                  {i === 2 && (
                    // Lupa s hvězdou — hledání
                    <svg className="r03-ico-search" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="10.5" cy="10.5" r="6.5"/>
                      <line x1="15.5" y1="15.5" x2="21" y2="21"/>
                      <path d="M10.5 7.5v6M7.5 10.5h6"/>
                    </svg>
                  )}
                  {i === 3 && (
                    // Smlouva s perem — podpis
                    <svg className="r03-ico-sign" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 20h9"/>
                      <path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/>
                      <path d="M15 5l3 3"/>
                    </svg>
                  )}
                </div>

                {/* Ochre linka — dekorativní */}
                <div style={{ width: 36, height: 3, borderRadius: 2, backgroundColor: OCHRE, flexShrink: 0 }} />

                {/* Název */}
                <h3 style={{
                  fontSize: "clamp(1.1rem, 1.8vw, 1.35rem)", fontWeight: 700,
                  color: cardText(i), margin: 0, lineHeight: 1.25, letterSpacing: "-0.01em",
                  transition: "color 0.4s ease",
                }}>
                  <GenericEditableText sectionId={sectionId} field={`items.${i}.title`} value={item.title} tag="span" />
                </h3>

                {/* Popis */}
                <p style={{
                  fontSize: 15, lineHeight: 1.72, margin: 0, flex: 1,
                  color: dark ? "rgba(255,255,255,0.68)" : "#666",
                  transition: "color 0.4s ease",
                }}>
                  <GenericEditableText sectionId={sectionId} field={`items.${i}.body`} value={item.body} tag="span" />
                </p>

                {/* CTA */}
                {item.ctaText && item.ctaHref && (
                  <a
                    href={item.ctaHref}
                    data-btn="primary"
                    style={{
                      display: "inline-flex", alignItems: "center", gap: 8,
                      fontSize: 12, fontWeight: 700, color: OCHRE,
                      textDecoration: "none", letterSpacing: "0.1em", textTransform: "uppercase",
                    }}
                    className="r03-svc-cta"
                  >
                    {item.ctaText}
                    <svg className="r03-arrow" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14M12 5l7 7-7 7"/>
                    </svg>
                  </a>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <style>{`
        /* Slide-in z různých směrů */
        @keyframes r03SlideIn0 { from { opacity:0; transform:translateX(-60px); } to { opacity:1; transform:none; } }
        @keyframes r03SlideIn1 { from { opacity:0; transform:translateX(60px);  } to { opacity:1; transform:none; } }
        @keyframes r03SlideIn2 { from { opacity:0; transform:translateX(-60px); } to { opacity:1; transform:none; } }
        @keyframes r03SlideIn3 { from { opacity:0; transform:translateX(60px);  } to { opacity:1; transform:none; } }

        /* Ikona – klíč: rotace při hoveru */
        .r03-card:hover .r03-ico-key {
          animation: r03KeySpin 0.6s cubic-bezier(0.34,1.56,0.64,1) both;
        }
        @keyframes r03KeySpin {
          0%   { transform: rotate(0deg) scale(1); }
          40%  { transform: rotate(-30deg) scale(1.15); }
          100% { transform: rotate(0deg) scale(1); }
        }

        /* Ikona – trend: šipka poskočí nahoru */
        .r03-card:hover .r03-ico-trend {
          animation: r03TrendJump 0.5s cubic-bezier(0.34,1.56,0.64,1) both;
        }
        @keyframes r03TrendJump {
          0%   { transform: translateY(0); }
          45%  { transform: translateY(-7px) scale(1.1); }
          100% { transform: translateY(0) scale(1); }
        }

        /* Ikona – lupa: pulzující zoom */
        .r03-card:hover .r03-ico-search {
          animation: r03SearchPulse 0.55s ease both;
        }
        @keyframes r03SearchPulse {
          0%   { transform: scale(1) rotate(0deg); }
          35%  { transform: scale(1.2) rotate(-10deg); }
          100% { transform: scale(1) rotate(0deg); }
        }

        /* Ikona – pero: psací pohyb */
        .r03-card:hover .r03-ico-sign {
          animation: r03SignWrite 0.5s ease both;
        }
        @keyframes r03SignWrite {
          0%   { transform: rotate(0deg) translateX(0); }
          25%  { transform: rotate(-10deg) translateX(-3px); }
          75%  { transform: rotate(5deg) translateX(3px); }
          100% { transform: rotate(0deg) translateX(0); }
        }

        /* CTA šipka – letí doprava při hoveru na karte */
        .r03-card:hover .r03-arrow {
          animation: r03ArrowFly 0.3s ease both;
        }
        @keyframes r03ArrowFly {
          0%   { transform: translateX(0); }
          50%  { transform: translateX(6px); }
          100% { transform: translateX(3px); }
        }

        @media (max-width: 600px) {
          [data-r03-svc-grid] { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}

// ── reality-01-listings ───────────────────────────────────────────────────────
// Featured property cards — ref: lexxusnorton.cz
// Bílé bg; kicker + H2 center; tabs (Prodej/Pronájem); 3-col property karty
// ─────────────────────────────────────────────────────────────────────────────
function ServicesReality01Listings({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const tagline  = String(content.tagline  ?? "Vybrané nemovitosti");
  const title    = String(content.title    ?? "Pulz metropole, apartmá s výhledy\nnebo spoustu zeleně");
  const subtitle = String(content.subtitle ?? "Prohlédněte si naši aktuální nabídku prémiových nemovitostí.");
  const ctaText  = String(content.ctaText  ?? "Zobrazit všechny nemovitosti");
  const ctaHref  = String(content.ctaHref  ?? "/vypis-nemovitosti");

  type Item = { name: string; description: string; price: string; tag: string; image: string; href: string };
  const items = (content.items as Item[]) ?? [
    { name: "Luxusní apartmán — Praha 1", description: "3+kk, 98 m², výhled na Vltavu, nadstandardní vybavení.", price: "14 900 000 Kč", tag: "Prodej", image: "/templates/reality-01/listing-1.jpg", href: "/vypis-nemovitosti" },
    { name: "Rodinný dům — Praha západ",  description: "5+1, 220 m², pozemek 650 m², bazén, klidná lokalita.", price: "18 500 000 Kč", tag: "Prodej", image: "/templates/reality-01/listing-2.jpg", href: "/vypis-nemovitosti" },
    { name: "Moderní byt — Praha 2",      description: "2+kk, 65 m², po rekonstrukci, parket, sklep, parkování.", price: "45 000 Kč/měs", tag: "Pronájem", image: "/templates/reality-01/listing-3.jpg", href: "/vypis-nemovitosti" },
  ];

  const DARK       = "#1a3640";
  const GOLD       = "#d4a96e";
  const WHITE      = "#ffffff";
  const SURFACE    = "#f4ebe5";
  const TEXT       = "#141414";
  const TEXT_MUTED = "#6b7280";
  const MONTSERRAT = "'Montserrat', 'Helvetica Neue', Arial, sans-serif";
  const OPEN_SANS  = "'Open Sans', 'Helvetica Neue', Arial, sans-serif";

  const [activeTab, setActiveTab] = useState<"all" | "sale" | "rent">("all");

  const filtered = activeTab === "all" ? items
    : activeTab === "sale"  ? items.filter(i => i.tag === "Prodej")
    : items.filter(i => i.tag === "Pronájem");

  return (
    <section style={{ backgroundColor: WHITE, padding: "clamp(56px,8vw,96px) 0" }}>
      <div style={{ maxWidth: 1340, margin: "0 auto", padding: "0 clamp(20px,4vw,56px)" }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <GenericEditableText sectionId={sectionId} field="tagline" value={tagline} tag="p"
            style={{ fontFamily: MONTSERRAT, fontSize: 12, fontWeight: 600, letterSpacing: "0.18em", textTransform: "uppercase", color: TEXT_MUTED, margin: "0 0 14px" }} />
          <GenericEditableText sectionId={sectionId} field="title" value={title} tag="h2"
            style={{ fontFamily: MONTSERRAT, fontSize: "clamp(26px,3.5vw,42px)", fontWeight: 700, lineHeight: 1.15, color: TEXT, margin: "0 0 16px", whiteSpace: "pre-line" }} />
          <GenericEditableText sectionId={sectionId} field="subtitle" value={subtitle} tag="p"
            style={{ fontFamily: OPEN_SANS, fontSize: 16, color: TEXT_MUTED, margin: "0 auto", maxWidth: 540, lineHeight: 1.6 }} />
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", justifyContent: "center", gap: 0, marginBottom: 48, borderBottom: "2px solid #e5e7eb" }}>
          {([["all", "Vše"], ["sale", "Prodej"], ["rent", "Pronájem"]] as const).map(([key, label]) => (
            <button key={key} onClick={() => setActiveTab(key)} style={{
              padding: "10px 28px", background: "none", border: "none", cursor: "pointer",
              fontFamily: MONTSERRAT, fontSize: 14, fontWeight: activeTab === key ? 700 : 500,
              color: activeTab === key ? DARK : TEXT_MUTED,
              borderBottom: activeTab === key ? `2.5px solid ${GOLD}` : "2.5px solid transparent",
              marginBottom: -2, transition: "color 0.15s, border-color 0.15s",
            }}>
              {label}
            </button>
          ))}
        </div>

        {/* Property grid */}
        <div data-r01-grid style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 28 }}>
          {filtered.map((item, i) => (
            <a key={i} href={item.href} style={{ textDecoration: "none", color: "inherit", display: "flex", flexDirection: "column", borderRadius: 8, overflow: "hidden", backgroundColor: WHITE, boxShadow: "0 2px 12px rgba(0,0,0,0.07)", transition: "box-shadow 0.2s, transform 0.2s" }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 32px rgba(0,0,0,0.13)"; (e.currentTarget as HTMLElement).style.transform = "translateY(-3px)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = "0 2px 12px rgba(0,0,0,0.07)"; (e.currentTarget as HTMLElement).style.transform = "none"; }}
            >
              {/* Image */}
              <div style={{ position: "relative", paddingTop: "66%", backgroundColor: SURFACE, overflow: "hidden" }}>
                <GenericEditableImage sectionId={sectionId} field={`items.${i}.image`} src={item.image} alt={item.name} style={{ position: "absolute", inset: 0 }}>
                  <img loading="lazy" src={item.image} alt={item.name} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.4s" }} />
                </GenericEditableImage>
                {/* Badge */}
                <span style={{ position: "absolute", top: 14, left: 14, backgroundColor: item.tag === "Pronájem" ? DARK : GOLD, color: item.tag === "Pronájem" ? WHITE : "#1a1a1a", fontFamily: MONTSERRAT, fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", padding: "4px 10px", borderRadius: 3 }}>
                  {item.tag}
                </span>
              </div>
              {/* Content */}
              <div style={{ padding: "20px 22px 22px", display: "flex", flexDirection: "column", flex: 1 }}>
                <GenericEditableText sectionId={sectionId} field={`items.${i}.name`} value={item.name} tag="h3"
                  style={{ fontFamily: MONTSERRAT, fontSize: 17, fontWeight: 700, color: TEXT, margin: "0 0 8px", lineHeight: 1.3 }} />
                <GenericEditableText sectionId={sectionId} field={`items.${i}.description`} value={item.description} tag="p"
                  style={{ fontFamily: OPEN_SANS, fontSize: 14, color: TEXT_MUTED, margin: "0 0 16px", lineHeight: 1.55, flex: 1 }} />
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: "1px solid #f0ece8", paddingTop: 14 }}>
                  <GenericEditableText sectionId={sectionId} field={`items.${i}.price`} value={item.price} tag="span"
                    style={{ fontFamily: MONTSERRAT, fontSize: 18, fontWeight: 700, color: DARK }} />
                  <span style={{ fontFamily: MONTSERRAT, fontSize: 13, fontWeight: 600, color: GOLD, display: "flex", alignItems: "center", gap: 4 }}>
                    Detail
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </span>
                </div>
              </div>
            </a>
          ))}
        </div>

        {/* CTA */}
        <div style={{ textAlign: "center", marginTop: 52 }}>
          <a href={ctaHref} data-btn="primary" style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            border: `1.5px solid ${DARK}`, color: DARK, backgroundColor: WHITE,
            fontFamily: MONTSERRAT, fontSize: 14, fontWeight: 600, letterSpacing: "0.04em",
            padding: "13px 36px", borderRadius: 4, textDecoration: "none", transition: "background 0.2s, color 0.2s",
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = DARK; (e.currentTarget as HTMLElement).style.color = WHITE; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = WHITE; (e.currentTarget as HTMLElement).style.color = DARK; }}
          >
            <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </a>
        </div>
      </div>

      <style>{`
        @media (max-width: 1023px) { [data-r01-grid] { grid-template-columns: repeat(2, 1fr) !important; } }
        @media (max-width: 639px)  { [data-r01-grid] { grid-template-columns: 1fr !important; } }
      `}</style>
    </section>
  );
}

// ── reality-04-why-us ─────────────────────────────────────────────────────────
// Ref: quantumreality.cz — "Proč právě my?" sekce
// Layout: vlevo seznam 4 klikacích položek (číslo + nadpis + subtitle),
// vpravo velká fotka + body text aktivní položky. Aktivní řádek má modrý
// accent #1032CF vlevo a tučný nadpis. Přepínání s fade animací.
// ─────────────────────────────────────────────────────────────────────────────
function WhyUsReality04({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const sectionAnchor = String(content.id    ?? "sluzby");
  const title         = String(content.title ?? "Proč právě my?");
  const items = (content.items as Array<{ title: string; subtitle: string; body: string; image: string }>) ?? [];

  const [active, setActive] = useState(0);

  const PRIMARY = "#1032CF";
  const DARK    = "#241f0c";
  const MUTED   = "#666";
  const BORDER  = "#e8e8e8";
  const SANS    = "'Helvetica Neue', Helvetica, Arial, sans-serif";

  const current = items[active];

  return (
    <section id={sectionAnchor} style={{ backgroundColor: "#fff", padding: "clamp(56px, 7vw, 96px) 0" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 clamp(16px, 3vw, 40px)" }}>

        {/* Nadpis */}
        <h2 style={{ fontFamily: SANS, fontSize: "clamp(24px, 2.8vw, 36px)", fontWeight: 700, color: DARK, marginTop: 0, marginBottom: "clamp(32px, 4vw, 56px)" }}>
          <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
        </h2>

        <div className="r04-why-grid">
          {/* Levý sloupec — seznam položek */}
          <div style={{ display: "flex", flexDirection: "column" }}>
            {items.map((item, i) => (
              <button
                key={i}
                onClick={() => setActive(i)}
                style={{
                  background: "none", border: "none", cursor: "pointer", textAlign: "left",
                  padding: "20px 0 20px 20px",
                  borderTop: i === 0 ? `1px solid ${BORDER}` : "none",
                  borderBottom: `1px solid ${BORDER}`,
                  borderLeft: `3px solid ${i === active ? PRIMARY : "transparent"}`,
                  transition: "border-color 0.2s",
                }}
              >
                <div style={{ fontFamily: SANS, fontSize: 11, fontWeight: 600, color: i === active ? PRIMARY : MUTED, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 4 }}>
                  {String(i + 1).padStart(2, "0")}
                </div>
                <div style={{ fontFamily: SANS, fontSize: "clamp(15px, 1.4vw, 17px)", fontWeight: i === active ? 700 : 500, color: i === active ? PRIMARY : DARK, marginBottom: 4, transition: "color 0.2s, font-weight 0.2s" }}>
                  <GenericEditableText sectionId={sectionId} field={`items.${i}.title`} value={item.title} tag="span" />
                </div>
                <div style={{ fontFamily: SANS, fontSize: 13, color: MUTED, lineHeight: 1.4 }}>
                  <GenericEditableText sectionId={sectionId} field={`items.${i}.subtitle`} value={item.subtitle} tag="span" />
                </div>
              </button>
            ))}
          </div>

          {/* Pravý sloupec — fotka + text aktivní položky */}
          {current && (
            <div key={active} className="r04-why-detail">
              <GenericEditableImage sectionId={sectionId} field={`items.${active}.image`} src={current.image} alt={current.title} style={{ display: "block", marginBottom: 28 }}>
                <img
                  src={current.image}
                  alt={current.title}
                  style={{ width: "100%", aspectRatio: "16/9", objectFit: "cover", borderRadius: 6, display: "block" }}
                />
              </GenericEditableImage>
              <h3 style={{ fontFamily: SANS, fontSize: "clamp(17px, 1.6vw, 20px)", fontWeight: 700, color: DARK, margin: "0 0 12px" }}>
                <GenericEditableText sectionId={sectionId} field={`items.${active}.title`} value={current.title} tag="span" />
              </h3>
              <p style={{ fontFamily: SANS, fontSize: 15, color: MUTED, lineHeight: 1.7, margin: 0 }}>
                <GenericEditableText sectionId={sectionId} field={`items.${active}.body`} value={current.body} tag="span" />
              </p>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .r04-why-grid { display: grid; grid-template-columns: 1fr 1.1fr; gap: clamp(32px, 5vw, 72px); align-items: start; }
        .r04-why-detail { animation: r04WhyFade 0.3s ease; }
        @keyframes r04WhyFade { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
        @media (max-width: 768px) { .r04-why-grid { grid-template-columns: 1fr; } }
      `}</style>
    </section>
  );
}

// ── reality-06-services ───────────────────────────────────────────────────────
// Ref: jansrubar.cz — bílé bg, velký H2 vlevo + subtitle, 3×2 foto-grid s hover lift
function ServicesReality06({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const PRIMARY = "#263A82";
  const SANS    = "'Helvetica Neue', Helvetica, Arial, sans-serif";

  const title    = String(content.title    ?? "Služby");
  const subtitle = String(content.subtitle ?? "");
  const items = (content.services as Array<{ title?: string; name?: string; image?: string }>) ?? [];

  return (
    <section id="sluzby" style={{ backgroundColor: "#ffffff", padding: "80px 0" }} data-template="reality-06-services">
      <style>{`
        .r06-svc2-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 28px; }
        @media (max-width: 900px) { .r06-svc2-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 560px) { .r06-svc2-grid { grid-template-columns: 1fr; } }
        .r06-svc2-card { display: flex; flex-direction: column; gap: 14px; cursor: default; }
        .r06-svc2-img-wrap { overflow: hidden; border-radius: 12px; aspect-ratio: 4/3; background: #f3f4f6; }
        .r06-svc2-img-wrap img { width: 100%; height: 100%; object-fit: cover; display: block; transition: transform 0.45s cubic-bezier(0.25,0.46,0.45,0.94); }
        .r06-svc2-card:hover .r06-svc2-img-wrap img { transform: scale(1.07); }
      `}</style>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 clamp(16px,4vw,48px)" }}>
        {/* Header */}
        <div style={{ marginBottom: 48 }}>
          <h2 style={{ fontFamily: SANS, fontSize: "clamp(26px,4vw,34px)", fontWeight: 700, color: PRIMARY, margin: "0 0 16px", lineHeight: 1.2 }}>
            <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
          </h2>
          {subtitle && (
            <p style={{ fontFamily: SANS, fontSize: 17, lineHeight: 1.7, color: PRIMARY, margin: 0, maxWidth: 640, opacity: 0.8 }}>
              <GenericEditableText sectionId={sectionId} field="subtitle" value={subtitle} tag="span" />
            </p>
          )}
        </div>

        {/* Grid */}
        <div className="r06-svc2-grid">
          {items.map((item, i) => (
            <div key={i} className="r06-svc2-card">
              <div className="r06-svc2-img-wrap">
                <GenericEditableImage sectionId={sectionId} field={`services.${i}.image`} src={item.image ?? ""} alt={item.title ?? ""} style={{}}>
                  <img loading="lazy" src={item.image ?? ""} alt={item.title ?? item.name ?? ""} />
                </GenericEditableImage>
              </div>
              <h3 style={{ fontFamily: SANS, fontSize: 18, fontWeight: 700, color: PRIMARY, margin: 0 }}>
                <GenericEditableText sectionId={sectionId} field={`services.${i}.title`} value={item.title ?? item.name ?? ""} tag="span" />
              </h3>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── autoservis-03-services ───────────────────────────────────────────────────
// Dark #111827 bg; 4-col card grid s SVG ikonami; border orange/20 → hover orange/60 + lift
// 1:1 ref: sekce "Co pro vás děláme" na autoservistomas.cz
// ────────────────────────────────────────────────────────────────────────────
function ServicesAutoservis03({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const tagline  = String(content.tagline  ?? "Co pro vás děláme");
  const title    = String(content.title    ?? "Kompletní servis\nvašeho vozidla");
  const subtitle = String(content.subtitle ?? "");
  type Item = { icon?: string; name?: string; description?: string; ctaText?: string; ctaHref?: string };
  const items = (content.items as Item[]) ?? [];

  const SURFACE = "#111827";
  const CARD   = "#1f2937";
  const WHITE  = "#ffffff";
  const ORANGE = "#f97316";
  const MUTED  = "#9ca3af";
  const BORDER = "rgba(249,115,22,0.2)";
  const SANS   = "'Inter','Helvetica Neue',Helvetica,Arial,sans-serif";

  const ICONS: Record<string, React.ReactNode> = {
    wrench:   <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>,
    settings: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
    cpu:      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><line x1="9" y1="1" x2="9" y2="4"/><line x1="15" y1="1" x2="15" y2="4"/><line x1="9" y1="20" x2="9" y2="23"/><line x1="15" y1="20" x2="15" y2="23"/><line x1="20" y1="9" x2="23" y2="9"/><line x1="20" y1="14" x2="23" y2="14"/><line x1="1" y1="9" x2="4" y2="9"/><line x1="1" y1="14" x2="4" y2="14"/></svg>,
    shield:   <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  };

  const getIcon = (key?: string) => ICONS[key ?? "wrench"] ?? ICONS.wrench;

  return (
    <section style={{ backgroundColor: SURFACE, padding: "80px 0" }} data-section-id={sectionId}>
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 clamp(16px,4vw,48px)" }}>
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <p style={{ fontFamily: SANS, fontSize: 12, fontWeight: 600, color: ORANGE, letterSpacing: "3px", textTransform: "uppercase", marginBottom: 12 }}>
            <GenericEditableText sectionId={sectionId} field="tagline" value={tagline} tag="span" />
          </p>
          <h2 style={{ fontFamily: SANS, fontSize: "clamp(28px,4vw,42px)", fontWeight: 800, color: WHITE, margin: "0 0 16px", lineHeight: 1.15, whiteSpace: "pre-line" }}>
            <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
          </h2>
          {subtitle && (
            <p style={{ fontFamily: SANS, fontSize: 16, color: MUTED, maxWidth: 640, margin: "0 auto", lineHeight: 1.7 }}>
              <GenericEditableText sectionId={sectionId} field="subtitle" value={subtitle} tag="span" />
            </p>
          )}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 24 }}>
          {items.map((item, i) => (
            <div key={i}
              style={{ backgroundColor: CARD, borderRadius: 16, border: `1px solid ${BORDER}`, padding: "32px 28px", display: "flex", flexDirection: "column", gap: 16, transition: "border-color 0.2s, transform 0.2s" }}
              onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(249,115,22,0.6)"; (e.currentTarget as HTMLDivElement).style.transform = "translateY(-4px)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = BORDER; (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)"; }}
            >
              <div style={{ width: 56, height: 56, borderRadius: 12, backgroundColor: "rgba(249,115,22,0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: ORANGE, flexShrink: 0 }}>
                {getIcon(item.icon)}
              </div>
              <h3 style={{ fontFamily: SANS, fontSize: 18, fontWeight: 700, color: WHITE, margin: 0, lineHeight: 1.3 }}>
                <GenericEditableText sectionId={sectionId} field={`items.${i}.name`} value={item.name ?? ""} tag="span" />
              </h3>
              <p style={{ fontFamily: SANS, fontSize: 14, color: MUTED, margin: 0, lineHeight: 1.6, flex: 1 }}>
                <GenericEditableText sectionId={sectionId} field={`items.${i}.description`} value={item.description ?? ""} tag="span" />
              </p>
              {item.ctaText && (
                <a href={item.ctaHref ?? "#"} data-btn="primary" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontFamily: SANS, fontSize: 13, fontWeight: 600, color: ORANGE, textDecoration: "none", marginTop: 4, transition: "gap 0.18s" }}
                  onMouseEnter={e => (e.currentTarget.style.gap = "10px")}
                  onMouseLeave={e => (e.currentTarget.style.gap = "6px")}
                >
                  <GenericEditableText sectionId={sectionId} field={`items.${i}.ctaText`} value={item.ctaText} tag="span" />
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </a>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── autoservis-03-pricing ────────────────────────────────────────────────────
// Dual pricing tables (Autoservis + Pneuservis) na černém bg
// ────────────────────────────────────────────────────────────────────────────
function PricingAutoservis03({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const tagline  = String(content.tagline  ?? "Transparentní ceny");
  const title    = String(content.title    ?? "Ceník služeb");
  const subtitle = String(content.subtitle ?? "");
  const vatNote  = String(content.vatNote  ?? "* uvedené ceny jsou bez DPH");
  const ctaText  = String(content.ctaText  ?? "Získat nabídku");
  const ctaHref  = String(content.ctaHref  ?? "#kontakt");
  type PriceRow = { name: string; price: string };
  type Table = { heading: string; rows: PriceRow[] };
  const tables = (content.tables as Table[]) ?? [];

  const BLACK  = "#000000";
  const CARD   = "#111827";
  const WHITE  = "#ffffff";
  const ORANGE = "#f97316";
  const MUTED  = "#9ca3af";
  const BORDER = "rgba(249,115,22,0.15)";
  const LINE   = "rgba(255,255,255,0.06)";
  const SANS   = "'Inter','Helvetica Neue',Helvetica,Arial,sans-serif";

  return (
    <section id="cenik" style={{ backgroundColor: BLACK, padding: "80px 0" }} data-section-id={sectionId}>
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 clamp(16px,4vw,48px)" }}>
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <p style={{ fontFamily: SANS, fontSize: 12, fontWeight: 600, color: ORANGE, letterSpacing: "3px", textTransform: "uppercase", marginBottom: 12 }}>
            <GenericEditableText sectionId={sectionId} field="tagline" value={tagline} tag="span" />
          </p>
          <h2 style={{ fontFamily: SANS, fontSize: "clamp(28px,4vw,42px)", fontWeight: 800, color: WHITE, margin: "0 0 16px", lineHeight: 1.15 }}>
            <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
          </h2>
          {subtitle && (
            <p style={{ fontFamily: SANS, fontSize: 16, color: MUTED, maxWidth: 640, margin: "0 auto", lineHeight: 1.7 }}>
              <GenericEditableText sectionId={sectionId} field="subtitle" value={subtitle} tag="span" />
            </p>
          )}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: 24, marginBottom: 40 }}>
          {tables.map((table, ti) => (
            <div key={ti} style={{ backgroundColor: CARD, borderRadius: 16, border: `1px solid ${BORDER}`, overflow: "hidden" }}>
              <div style={{ padding: "20px 28px", borderBottom: `1px solid ${BORDER}`, backgroundColor: "rgba(249,115,22,0.06)" }}>
                <h3 style={{ fontFamily: SANS, fontSize: 18, fontWeight: 700, color: ORANGE, margin: 0 }}>
                  <GenericEditableText sectionId={sectionId} field={`tables.${ti}.heading`} value={table.heading} tag="span" />
                </h3>
              </div>
              <div>
                {table.rows.map((row, ri) => (
                  <div key={ri} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 28px", borderBottom: `1px solid ${LINE}` }}>
                    <span style={{ fontFamily: SANS, fontSize: 14, color: MUTED, lineHeight: 1.4, flex: 1, paddingRight: 16 }}>
                      <GenericEditableText sectionId={sectionId} field={`tables.${ti}.rows.${ri}.name`} value={row.name} tag="span" />
                    </span>
                    <span style={{ fontFamily: SANS, fontSize: 14, fontWeight: 700, color: WHITE, whiteSpace: "nowrap" }}>
                      <GenericEditableText sectionId={sectionId} field={`tables.${ti}.rows.${ri}.price`} value={row.price} tag="span" />
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div style={{ textAlign: "center" }}>
          <p style={{ fontFamily: SANS, fontSize: 12, color: MUTED, marginBottom: 24 }}>{vatNote}</p>
          <a href={ctaHref} data-btn="primary" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "14px 32px", background: "linear-gradient(to right,#f97316,#ea6c08)", color: WHITE, fontFamily: SANS, fontSize: 15, fontWeight: 700, textDecoration: "none", borderRadius: 12, boxShadow: "0 4px 20px rgba(249,115,22,0.3)", transition: "opacity 0.18s" }}
            onMouseEnter={e => (e.currentTarget.style.opacity = "0.85")}
            onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
          >
            <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
          </a>
        </div>
      </div>
    </section>
  );
}

// ── autoservis-02-services ───────────────────────────────────────────────────
// Bílé bg py-16; max-w-1200; červený tagline + H2 dark; 4-col ikono-karty:
// červená SVG ikona + H3 + popis + outline červené CTA — autoservis-02 GARANT
// ────────────────────────────────────────────────────────────────────────────
function ServicesAutoservis02({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const tagline = String(content.tagline ?? "Naše služby");
  const title   = String(content.title   ?? "Kompletní péče\no vaše vozidlo");
  const items   = (content.items as Array<{ icon?: string; name: string; description: string; ctaText?: string; ctaHref?: string }>) ?? [];

  const RED   = "#d82a2a";
  const DARK  = "#1a1a1a";
  const GRAY  = "#f5f5f5";
  const SANS  = "'Open Sans', Arial, sans-serif";

  const ICONS: Record<string, React.ReactElement> = {
    wrench: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={RED} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
      </svg>
    ),
    engine: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={RED} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="3" y="8" width="18" height="10" rx="2"/><path d="M7 8V6"/><path d="M17 8V6"/><path d="M7 18v2"/><path d="M17 18v2"/><path d="M3 13h2"/><path d="M19 13h2"/>
      </svg>
    ),
    electric: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={RED} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
      </svg>
    ),
    climate: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={RED} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 2v20M4.93 4.93l14.14 14.14M2 12h20M4.93 19.07 19.07 4.93"/><circle cx="12" cy="12" r="3"/>
      </svg>
    ),
  };

  return (
    <section style={{ backgroundColor: "#ffffff", padding: "64px 0" }} data-section-id={sectionId} data-template="autoservis-02-services">
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 clamp(16px,4vw,40px)" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <p style={{ fontFamily: SANS, fontSize: 12, fontWeight: 700, color: RED, letterSpacing: "3px", textTransform: "uppercase", margin: "0 0 10px" }}>
            <GenericEditableText sectionId={sectionId} field="tagline" value={tagline} tag="span" />
          </p>
          <h2 style={{ fontFamily: SANS, fontSize: "clamp(24px,3.5vw,36px)", fontWeight: 800, color: DARK, margin: 0, lineHeight: 1.25, whiteSpace: "pre-line" }}>
            <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
          </h2>
        </div>

        {/* 4-col grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 24 }}>
          {items.map((item, i) => (
            <div key={i} style={{ backgroundColor: GRAY, borderRadius: 8, padding: 28, display: "flex", flexDirection: "column", gap: 14, transition: "box-shadow 0.2s" }}
              onMouseEnter={e => (e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.10)")}
              onMouseLeave={e => (e.currentTarget.style.boxShadow = "none")}
            >
              {/* Icon */}
              <div style={{ width: 56, height: 56, borderRadius: 8, backgroundColor: "#fff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                {ICONS[item.icon ?? "wrench"] ?? ICONS.wrench}
              </div>
              {/* Name */}
              <h3 style={{ fontFamily: SANS, fontSize: 17, fontWeight: 800, color: DARK, margin: 0, lineHeight: 1.3 }}>
                <GenericEditableText sectionId={sectionId} field={`items.${i}.name`} value={item.name} tag="span" />
              </h3>
              {/* Description */}
              <p style={{ fontFamily: SANS, fontSize: 13.5, fontWeight: 400, color: "#4b5563", margin: 0, lineHeight: 1.65, flex: 1 }}>
                <GenericEditableText sectionId={sectionId} field={`items.${i}.description`} value={item.description} tag="span" />
              </p>
              {/* CTA */}
              {item.ctaText && (
                <a href={item.ctaHref ?? "#"} data-btn="primary"
                  style={{ display: "inline-flex", alignItems: "center", gap: 6, fontFamily: SANS, fontSize: 13, fontWeight: 700, color: RED, textDecoration: "none", marginTop: 4 }}
                  onMouseEnter={e => (e.currentTarget.style.opacity = "0.75")}
                  onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
                >
                  <GenericEditableText sectionId={sectionId} field={`items.${i}.ctaText`} value={item.ctaText} tag="span" />
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                </a>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── autoservis-01-services ────────────────────────────────────────────────────
// 3 foto-karty (4:3), light-gray #F0F1F3 bg, orange accent line pod nadpisem
function ServicesAutoservis01({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const ORANGE = "#FFA500";
  const DARK   = "#111111";
  const MUTED  = "#555555";
  const BG     = "#F0F1F3";
  const SANS   = "'Helvetica Neue', Helvetica, Arial, sans-serif";

  type Item = { name?: string; description?: string; image?: string; ctaText?: string; ctaHref?: string };
  const tagline = String(content.tagline ?? "Naše nabídka");
  const title   = String(content.title   ?? "Nejoblíbenější služby\nnaších zákazníků");
  const items   = (content.items as Item[]) ?? [];

  return (
    <section id={String(content.id ?? "sluzby")} style={{ backgroundColor: BG, padding: "96px 0" }} data-template="autoservis-01-services">
      <style>{`
        .a01-svc-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 28px; }
        @media (max-width: 860px) { .a01-svc-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 560px) { .a01-svc-grid { grid-template-columns: 1fr; } }
        .a01-svc-card { background: #fff; border-radius: 12px; overflow: hidden; display: flex; flex-direction: column; }
        .a01-svc-img { overflow: hidden; aspect-ratio: 4/3; }
        .a01-svc-img img { width: 100%; height: 100%; object-fit: cover; display: block; transition: transform 0.45s cubic-bezier(0.25,0.46,0.45,0.94); }
        .a01-svc-card:hover .a01-svc-img img { transform: scale(1.06); }
        .a01-svc-body { padding: 28px 28px 32px; display: flex; flex-direction: column; flex: 1; }
        .a01-svc-cta { display: inline-flex; align-items: center; gap: 6px; margin-top: auto; padding-top: 20px; font-weight: 700; text-decoration: none; transition: gap 0.2s; }
        .a01-svc-cta:hover { gap: 10px; }
      `}</style>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 clamp(16px,4vw,48px)" }}>
        <div style={{ marginBottom: 56, maxWidth: 580 }}>
          <p style={{ fontFamily: SANS, fontSize: 13, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: ORANGE, margin: "0 0 12px" }}>
            <GenericEditableText sectionId={sectionId} field="tagline" value={tagline} tag="span" />
          </p>
          <h2 style={{ fontFamily: SANS, fontSize: "clamp(26px,3.2vw,38px)", fontWeight: 800, color: DARK, margin: "0 0 16px", lineHeight: 1.2, whiteSpace: "pre-line" }}>
            <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
          </h2>
          <div style={{ width: 56, height: 3, backgroundColor: ORANGE, borderRadius: 2 }} />
        </div>

        <div className="a01-svc-grid">
          {items.map((item, i) => (
            <div key={i} className="a01-svc-card">
              <div className="a01-svc-img">
                <GenericEditableImage sectionId={sectionId} field={`items.${i}.image`} src={item.image ?? ""} alt={item.name ?? ""} style={{}}>
                  <img loading="lazy" src={item.image ?? ""} alt={item.name ?? ""} />
                </GenericEditableImage>
              </div>
              <div className="a01-svc-body">
                <h3 style={{ fontFamily: SANS, fontSize: 20, fontWeight: 800, color: DARK, margin: "0 0 12px", lineHeight: 1.3 }}>
                  <GenericEditableText sectionId={sectionId} field={`items.${i}.name`} value={item.name ?? ""} tag="span" />
                </h3>
                <p style={{ fontFamily: SANS, fontSize: 15, color: MUTED, lineHeight: 1.7, margin: 0 }}>
                  <GenericEditableText sectionId={sectionId} field={`items.${i}.description`} value={item.description ?? ""} tag="span" />
                </p>
                {item.ctaText && (
                  <a href={item.ctaHref ?? "#"} data-btn="primary" className="a01-svc-cta" style={{ fontFamily: SANS, fontSize: 14, color: ORANGE }}>
                    <GenericEditableText sectionId={sectionId} field={`items.${i}.ctaText`} value={item.ctaText} tag="span" />
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── autoservis-03-stats ───────────────────────────────────────────────────────
function StatsAutoservis03({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const SANS = "'Inter', 'Helvetica Neue', sans-serif";
  const ORANGE = "#f97316";
  const items = (content.items as Array<{ value: string; label: string }>) || [];

  return (
    <section
      id={(content.id as string) || "statistiky"}
      data-template="autoservis-03-stats"
      style={{ backgroundColor: "#111827", borderTop: "1px solid rgba(255,255,255,0.06)", borderBottom: "1px solid rgba(255,255,255,0.06)", padding: "56px 24px" }}
    >
      <style>{`
        .a03-stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; max-width: 1100px; margin: 0 auto; }
        @media (max-width: 640px) { .a03-stats-grid { grid-template-columns: repeat(2, 1fr); } }
        .a03-stats-item { text-align: center; padding: 0 16px; }
        .a03-stats-item:not(:last-child) { border-right: 1px solid rgba(255,255,255,0.08); }
        @media (max-width: 640px) { .a03-stats-item:not(:last-child) { border-right: none; } .a03-stats-item:nth-child(odd) { border-right: 1px solid rgba(255,255,255,0.08); } }
      `}</style>
      <div className="a03-stats-grid">
        {items.map((item, i) => (
          <div key={i} className="a03-stats-item">
            <div style={{ fontFamily: SANS, fontSize: "clamp(28px,4vw,52px)", fontWeight: 900, color: ORANGE, lineHeight: 1 }}>{item.value}</div>
            <div style={{ fontFamily: SANS, fontSize: 14, color: "#9ca3af", marginTop: 8, fontWeight: 500 }}>{item.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ── dental-01-services ───────────────────────────────────────────────────────
// 3 karty (foto nahoře, teal linka, title, popis). Bílé bg, section padding 96px.
// Kicker uppercase teal + H2 tmavý Montserrat. Hover: foto zoom + teal title.
// Inspirováno magicsmile.cz services grid.
// ─────────────────────────────────────────────────────────────────────────────
function ServicesDental01({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const TEAL  = "#14a2a8";
  const DARK  = "#1c2335";
  const MUTED = "#6b7280";
  const SURF  = "#f7f9f9";
  const FONT  = "'Montserrat', 'Arial', sans-serif";

  const heading = String(content.heading ?? "Naše služby");
  const kicker  = String(content.kicker  ?? "Co nabízíme");
  const items   = Array.isArray(content.items)
    ? (content.items as Array<{ title?: string; description?: string; imageUrl?: string }>)
    : [];

  return (
    <section id="sluzby" style={{ backgroundColor: "#ffffff", padding: "clamp(64px,8vw,100px) 0", fontFamily: FONT }}>
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: "clamp(40px,5vw,60px)", padding: "0 clamp(20px,5vw,60px)" }}>
        <p style={{
          fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.2em",
          textTransform: "uppercase", color: TEAL, margin: "0 0 14px", fontFamily: FONT,
        }}>
          <GenericEditableText sectionId={sectionId} field="kicker" value={kicker} tag="span" />
        </p>
        <h2 style={{
          fontSize: "clamp(1.7rem,3vw,2.5rem)", fontWeight: 800,
          color: DARK, margin: 0, lineHeight: 1.15, fontFamily: FONT,
        }}>
          <GenericEditableText sectionId={sectionId} field="heading" value={heading} tag="span" />
        </h2>
      </div>

      {/* Cards grid */}
      <div className="d01-services-grid" style={{
        maxWidth: 1240,
        margin: "0 auto",
        padding: "0 clamp(20px,5vw,60px)",
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: "clamp(20px,3vw,36px)",
      }}>
        {items.map((item, i) => (
          <div
            key={i}
            className="d01-service-card"
            style={{
              backgroundColor: SURF,
              borderRadius: 10,
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
              transition: "box-shadow 0.22s",
              boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = "0 8px 32px rgba(20,162,168,0.18)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = "0 2px 12px rgba(0,0,0,0.06)"; }}
          >
            {/* Foto */}
            <div style={{ position: "relative", width: "100%", aspectRatio: "16/10", overflow: "hidden", flexShrink: 0 }}>
              <GenericEditableImage
                sectionId={sectionId}
                field={`items.${i}.imageUrl`}
                src={item.imageUrl ?? ""}
                alt={item.title ?? ""}
                style={{ position: "absolute", inset: 0 }}
              >
                <img
                  src={item.imageUrl ?? ""}
                  alt={item.title ?? ""}
                  style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", transition: "transform 0.4s ease" }}
                  onMouseEnter={e => { (e.currentTarget as HTMLImageElement).style.transform = "scale(1.04)"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLImageElement).style.transform = "scale(1)"; }}
                />
              </GenericEditableImage>
            </div>

            {/* Teal linka */}
            <div style={{ height: 4, backgroundColor: TEAL, flexShrink: 0 }} />

            {/* Text */}
            <div style={{ padding: "clamp(20px,3vw,32px)", flex: 1, display: "flex", flexDirection: "column", gap: 12 }}>
              <h3 style={{ fontFamily: FONT, fontSize: "clamp(1rem,1.6vw,1.2rem)", fontWeight: 700, color: DARK, margin: 0, lineHeight: 1.3 }}>
                <GenericEditableText sectionId={sectionId} field={`items.${i}.title`} value={item.title ?? ""} tag="span" />
              </h3>
              <p style={{ fontFamily: FONT, fontSize: "0.9rem", color: MUTED, lineHeight: 1.7, margin: 0, flex: 1 }}>
                <GenericEditableText sectionId={sectionId} field={`items.${i}.description`} value={item.description ?? ""} tag="span" />
              </p>
            </div>
          </div>
        ))}
      </div>

      <style>{`
        @media (max-width: 768px) { .d01-services-grid { grid-template-columns: 1fr !important; } }
        @media (min-width: 769px) and (max-width: 1024px) { .d01-services-grid { grid-template-columns: repeat(2, 1fr) !important; } }
      `}</style>
    </section>
  );
}

// ── ortho-01-services ──────────────────────────────────────────────────────────
// 5 důvodů: střídavé řady (foto vlevo / vpravo), velké dekorativní číslo
// ─────────────────────────────────────────────────────────────────────────────
function ServicesOrtho01({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const TEAL  = "#00b7ad";
  const SLATE = "#244757";
  const FONT  = "'Inter', 'DM Sans', Arial, sans-serif";

  type Item = { number?: string; name?: string; description?: string; imageUrl?: string };

  const title = String(content.title ?? "5 důvodů, proč chtít naše neviditelná rovnátka");
  const items = ((content.items as Item[]) ?? []).slice(0, 6);

  return (
    <section
      id="sluzby"
      data-section-type="services"
      data-variant="ortho-01-services"
      style={{ backgroundColor: "#fff", padding: "clamp(56px, 7vw, 96px) 0", fontFamily: FONT }}
    >
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 clamp(20px, 5vw, 60px)" }}>

        {/* Section title */}
        <h2 style={{
          textAlign: "center",
          fontSize: "clamp(1.5rem, 3vw, 2.2rem)",
          fontWeight: 800,
          color: SLATE,
          margin: "0 0 clamp(40px, 6vw, 72px)",
          lineHeight: 1.2,
        }}>
          <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
        </h2>

        {/* Items */}
        <div style={{ display: "flex", flexDirection: "column", gap: "clamp(40px, 6vw, 72px)" }}>
          {items.map((item, i) => {
            const isEven = i % 2 === 1;
            const num    = item.number ?? `${i + 1}.`;
            const name   = item.name ?? "";
            const desc   = item.description ?? "";
            const imgSrc = item.imageUrl ?? "";

            return (
              <div
                key={i}
                className={`o01-row${isEven ? " o01-row-rev" : ""}`}
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "clamp(32px, 5vw, 64px)",
                  alignItems: "center",
                  direction: isEven ? "rtl" : "ltr",
                }}
              >
                {/* Image */}
                <div style={{ direction: "ltr", position: "relative", borderRadius: 16, overflow: "hidden", aspectRatio: "4/3" }}>
                  <GenericEditableImage sectionId={sectionId} field={`items.${i}.imageUrl`} src={imgSrc} alt={name} style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
                    <img loading="lazy" src={imgSrc} alt={name} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
                  </GenericEditableImage>
                </div>

                {/* Text */}
                <div style={{ direction: "ltr" }}>
                  {/* Big number */}
                  <span style={{ display: "block", fontSize: "clamp(4rem, 8vw, 7rem)", fontWeight: 900, color: TEAL, opacity: 0.15, lineHeight: 1, marginBottom: "-0.2em" }}>
                    {num}
                  </span>
                  <h3 style={{ fontSize: "clamp(1.2rem, 2vw, 1.6rem)", fontWeight: 800, color: SLATE, margin: "0 0 14px", lineHeight: 1.25 }}>
                    <GenericEditableText sectionId={sectionId} field={`items.${i}.name`} value={name} tag="span" />
                  </h3>
                  <p style={{ fontSize: "clamp(0.9rem, 1.2vw, 1.05rem)", color: "#506470", lineHeight: 1.75, margin: 0 }}>
                    <GenericEditableText sectionId={sectionId} field={`items.${i}.description`} value={desc} tag="span" />
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <style>{`
        @media (max-width: 680px) {
          .o01-row, .o01-row-rev { grid-template-columns: 1fr !important; direction: ltr !important; }
          .o01-row-rev > div { direction: ltr !important; }
        }
      `}</style>
    </section>
  );
}

// ── ortho-02-services ─────────────────────────────────────────────────────────
// 4 PathBox karty v řadě — foto nahoře (portrait), pod ní subtitle + název
// Bílé pozadí, bez nadpisu sekce, full-width, karty vedle sebe
// Reference: perfectsmile.cz → cPathBox--staticUnderPict
// ─────────────────────────────────────────────────────────────────────────────
function ServicesOrtho02({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const FONT  = "'Raleway', 'Helvetica Neue', Arial, sans-serif";
  const DARK  = "#1a1a1a";
  const MUTED = "#888888";
  const BEIGE = "#B7B3A5";

  type Item = { title?: string; subtitle?: string; description?: string; href?: string; image?: string };
  const items = ((content.items as Item[]) ?? []).slice(0, 4);

  const heading    = String(content.heading    ?? "Rovné zuby tvoří krásný úsměv.");
  const subheading = String(content.subheading ?? "Do ortodontické léčby přijímáme děti, teenagery i děti v Praze.");

  const defaultItems: Item[] = [
    { title: "Invisalign®",  subtitle: "Rovnátka", href: "#sluzby", image: "/templates/ortho-02/service-invisalign.jpg" },
    { title: "Estetická",    subtitle: "Rovnátka", href: "#sluzby", image: "/templates/ortho-02/service-esteticka.jpg" },
    { title: "Kovová",       subtitle: "Rovnátka", href: "#sluzby", image: "/templates/ortho-02/service-kovova.jpg" },
    { title: "Pro děti",     subtitle: "Rovnátka", href: "#sluzby", image: "/templates/ortho-02/service-deti.jpg" },
  ];

  const cards = items.length > 0 ? items : defaultItems;

  return (
    <section
      id="sluzby"
      data-section-type="services"
      data-variant="ortho-02-services"
      style={{ backgroundColor: "#ffffff", fontFamily: FONT }}
    >
      {/* Textový blok — kicker + velký H2, jako perfectsmile.cz cHeading */}
      <div style={{ padding: "clamp(56px, 7vw, 96px) clamp(32px, 6vw, 96px) clamp(48px, 6vw, 72px)" }}>
        <p style={{ margin: "0 0 16px", fontFamily: FONT, fontSize: "clamp(0.72rem, 1vw, 0.82rem)", fontWeight: 500, color: MUTED, letterSpacing: "0.12em", textTransform: "uppercase" }}>
          <GenericEditableText sectionId={sectionId} field="subheading" value="Proč chtít rovnátka" tag="span" />
        </p>
        <h2 style={{ margin: 0, maxWidth: "72ch", fontFamily: FONT, fontSize: "clamp(1.6rem, 3.2vw, 2.8rem)", fontWeight: 300, color: DARK, lineHeight: 1.35, letterSpacing: "-0.01em" }}>
          <GenericEditableText sectionId={sectionId} field="heading" value={heading} tag="span" />
        </h2>
      </div>

      {/* 4 PathBox karty */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
      }} className="o02-services-grid">
        {cards.map((card, i) => {
          const title    = card.title    ?? defaultItems[i]?.title    ?? "";
          const subtitle = card.subtitle ?? defaultItems[i]?.subtitle ?? "";
          const imgSrc   = card.image    ?? defaultItems[i]?.image    ?? "";
          const href     = card.href     ?? "#sluzby";

          return (
            <a
              key={i}
              href={href}
              className="o02-card"
              style={{
                display: "block",
                textDecoration: "none",
                color: "inherit",
                position: "relative",
                overflow: "hidden",
                borderRight: i < 3 ? "1px solid #f0f0f0" : "none",
              }}
            >
              {/* Image */}
              <div style={{ position: "relative", width: "100%", aspectRatio: "3/4", overflow: "hidden", backgroundColor: "#e8e4de" }}>
                <GenericEditableImage sectionId={sectionId} field={`items.${i}.image`} src={imgSrc} alt={title} style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
                  <img
                    src={imgSrc}
                    alt={title}
                    style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center top", transition: "transform 0.5s ease" }}
                    className="o02-card-img"
                  />
                </GenericEditableImage>
              </div>

              {/* Caption */}
              <div style={{ padding: "20px 24px 28px", backgroundColor: "#ffffff" }}>
                <p style={{ margin: "0 0 4px", fontFamily: FONT, fontSize: "0.7rem", fontWeight: 600, color: MUTED, letterSpacing: "0.12em", textTransform: "uppercase" }}>
                  <GenericEditableText sectionId={sectionId} field={`items.${i}.subtitle`} value={subtitle} tag="span" />
                </p>
                <h3 style={{ margin: "0 0 10px", fontFamily: FONT, fontSize: "1.2rem", fontWeight: 400, color: DARK, letterSpacing: "0.03em" }}>
                  <GenericEditableText sectionId={sectionId} field={`items.${i}.title`} value={title} tag="span" />
                </h3>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontFamily: FONT, fontSize: "0.78rem", fontWeight: 500, color: BEIGE, letterSpacing: "0.05em" }}>
                  Zjistit více
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </span>
              </div>
            </a>
          );
        })}
      </div>

      <style>{`
        .o02-card:hover .o02-card-img { transform: scale(1.04); }
        @media (max-width: 768px) {
          .o02-services-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .o02-card { border-right: none !important; border-bottom: 1px solid #f0f0f0; }
        }
        @media (max-width: 480px) {
          .o02-services-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}

// ── lawyer-01-services ────────────────────────────────────────────────────────
// Bílé bg, centrovaný navy H2 + perex, 3-col grid karet:
// SVG ikona (tematická) + H3 navy + popis šedý, hover → navy box-shadow
// ─────────────────────────────────────────────────────────────────────────────
function ServicesLawyer01({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const NAVY    = "#141760";
  const CRIMSON = "#a70336";
  const FONT    = "'Source Sans 3','Source Sans Pro','Raleway','Helvetica Neue',Arial,sans-serif";

  const title = String(content.title ?? "Oblasti práva");
  const lead  = String(content.lead  ?? "Pokrýváme všechny klíčové oblasti komerčního práva.");
  const items = (content.items as Array<{ name: string; description: string; icon?: string }>) ?? [];

  // SVG ikony pro každou oblast práva
  const iconMap: Record<string, React.ReactNode> = {
    bank: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
      </svg>
    ),
    briefcase: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/><line x1="12" y1="12" x2="12" y2="12"/>
      </svg>
    ),
    document: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
      </svg>
    ),
    people: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
    building: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="3" width="15" height="18"/><path d="M16 8h4l3 3v10h-7V8z"/><line x1="5" y1="7" x2="5" y2="7"/><line x1="9" y1="7" x2="9" y2="7"/><line x1="5" y1="11" x2="5" y2="11"/><line x1="9" y1="11" x2="9" y2="11"/><line x1="5" y1="15" x2="5" y2="15"/><line x1="9" y1="15" x2="9" y2="15"/>
      </svg>
    ),
    lightbulb: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <line x1="9" y1="18" x2="15" y2="18"/><line x1="10" y1="22" x2="14" y2="22"/><path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14"/>
      </svg>
    ),
  };

  const fallbackIcon = (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
    </svg>
  );

  return (
    <section style={{ backgroundColor: "#ffffff", padding: "88px 0 96px", fontFamily: FONT }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 clamp(16px,4vw,40px)" }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 64 }}>
          <div style={{ width: 36, height: 3, backgroundColor: CRIMSON, margin: "0 auto 20px", borderRadius: 2 }} />
          <h2 style={{ fontFamily: FONT, fontWeight: 700, fontSize: "clamp(1.6rem,2.8vw,2.4rem)", color: NAVY, margin: "0 0 16px", letterSpacing: "0.01em" }}>
            <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
          </h2>
          <p style={{ fontFamily: FONT, fontWeight: 400, fontSize: "1.05rem", color: "#6b7280", margin: "0 auto", maxWidth: 560, lineHeight: 1.65 }}>
            <GenericEditableText sectionId={sectionId} field="lead" value={lead} tag="span" />
          </p>
        </div>

        {/* Grid */}
        <div className="l01-services-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 28 }}>
          {items.map((item, i) => (
            <div
              key={i}
              className="l01-service-card"
              style={{
                backgroundColor: "#fff",
                border: "1px solid #e8eaed",
                borderRadius: 4,
                padding: "36px 32px",
                display: "flex",
                flexDirection: "column",
                gap: 16,
                transition: "box-shadow 0.22s ease, border-color 0.22s ease, transform 0.22s ease",
                cursor: "default",
              }}
              onMouseEnter={e => {
                const el = e.currentTarget as HTMLDivElement;
                el.style.boxShadow = `0 8px 32px rgba(20,23,96,0.13)`;
                el.style.borderColor = `rgba(20,23,96,0.25)`;
                el.style.transform = "translateY(-3px)";
              }}
              onMouseLeave={e => {
                const el = e.currentTarget as HTMLDivElement;
                el.style.boxShadow = "none";
                el.style.borderColor = "#e8eaed";
                el.style.transform = "translateY(0)";
              }}
            >
              {/* Icon */}
              <div style={{ width: 56, height: 56, borderRadius: "50%", backgroundColor: "rgba(20,23,96,0.07)", display: "flex", alignItems: "center", justifyContent: "center", color: NAVY, flexShrink: 0 }}>
                {iconMap[item.icon ?? ""] ?? fallbackIcon}
              </div>

              {/* Text */}
              <div>
                <h3 style={{ fontFamily: FONT, fontWeight: 700, fontSize: "1.05rem", color: NAVY, margin: "0 0 10px", lineHeight: 1.3 }}>
                  <GenericEditableText sectionId={sectionId} field={`items.${i}.name`} value={item.name} tag="span" />
                </h3>
                <p style={{ fontFamily: FONT, fontWeight: 400, fontSize: "0.9rem", color: "#6b7280", margin: 0, lineHeight: 1.65 }}>
                  <GenericEditableText sectionId={sectionId} field={`items.${i}.description`} value={item.description} tag="span" />
                </p>
              </div>

              {/* Arrow link */}
              <div style={{ marginTop: "auto", paddingTop: 8 }}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 6, color: CRIMSON, fontWeight: 600, fontSize: "0.82rem", letterSpacing: "0.05em", textTransform: "uppercase" }}>
                  Zjistit více
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) { .l01-services-grid { grid-template-columns: repeat(2,1fr) !important; } }
        @media (max-width: 580px) { .l01-services-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </section>
  );
}

// ─── Stavba-01 Services ──────────────────────────────────────────────────────
function ServicesStavba01({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const ORANGE = "#FF6F0D";
  const DARK   = "#1a1a1a";
  const GRAY   = "#6b6b6b";
  const BG     = "#f8f7f4";
  const FONT   = "'Inter', sans-serif";

  interface ServiceItem { name: string; description: string; image?: string; ctaText?: string; ctaHref?: string; }

  const tagline = String(content.tagline ?? "Co umíme");
  const title   = String(content.title   ?? "Naše stavební\nslužby");
  const items   = (content.items as ServiceItem[]) ?? [];

  return (
    <section id={String(content.id ?? "sluzby")} style={{ backgroundColor: BG, fontFamily: FONT, padding: "clamp(64px,9vw,112px) 0" }} data-template="stavba-01">
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 32px" }}>

        {/* Header */}
        <div style={{ marginBottom: 56 }}>
          <p style={{ color: ORANGE, fontSize: "0.78rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", margin: "0 0 12px" }}>
            <GenericEditableText sectionId={sectionId} field="tagline" value={tagline} tag="span" />
          </p>
          <h2 style={{ color: DARK, fontSize: "clamp(28px,4vw,48px)", fontWeight: 800, lineHeight: 1.1, letterSpacing: "-0.02em", margin: 0, whiteSpace: "pre-line" }}>
            <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
          </h2>
        </div>

        {/* Cards grid */}
        <div className="stavba-services-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 24 }}>
          {items.map((item, i) => (
            <div
              key={i}
              style={{ backgroundColor: "#ffffff", borderRadius: 16, overflow: "hidden", display: "flex", flexDirection: "column", boxShadow: "0 1px 3px rgba(0,0,0,0.06)", transition: "transform 0.22s ease, box-shadow 0.22s ease" }}
              onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = "translateY(-4px)"; (e.currentTarget as HTMLDivElement).style.boxShadow = "0 12px 36px rgba(0,0,0,0.10)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)"; (e.currentTarget as HTMLDivElement).style.boxShadow = "0 1px 3px rgba(0,0,0,0.06)"; }}
            >
              {/* Image */}
              {item.image && (
                <div style={{ position: "relative", aspectRatio: "16/10", overflow: "hidden" }}>
                  <GenericEditableImage sectionId={sectionId} field={`items.${i}.image`} src={item.image} alt={item.name} className="relative overflow-hidden w-full h-full" style={{ height: "100%" }}>
                    <Image src={item.image} alt={item.name} fill className="object-cover" sizes="(max-width:768px) 100vw, 25vw" unoptimized={shouldSkipNextImageOptimization(item.image)} />
                  </GenericEditableImage>
                  {/* Orange accent bar */}
                  <div style={{ position: "absolute", bottom: 0, left: 0, width: 48, height: 4, backgroundColor: ORANGE }} />
                </div>
              )}

              {/* Body */}
              <div style={{ padding: "24px 24px 20px", display: "flex", flexDirection: "column", flex: 1, gap: 10 }}>
                <h3 style={{ color: DARK, fontSize: "1.05rem", fontWeight: 700, margin: 0, lineHeight: 1.3 }}>
                  <GenericEditableText sectionId={sectionId} field={`items.${i}.name`} value={item.name} tag="span" />
                </h3>
                <p style={{ color: GRAY, fontSize: "0.875rem", lineHeight: 1.65, margin: 0, flex: 1 }}>
                  <GenericEditableText sectionId={sectionId} field={`items.${i}.description`} value={item.description} tag="span" />
                </p>
                {item.ctaText && item.ctaHref && (
                  <a
                    href={item.ctaHref}
                    data-btn="primary"
                    style={{ display: "inline-flex", alignItems: "center", gap: 5, color: ORANGE, fontSize: "0.82rem", fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase", textDecoration: "none", marginTop: 6, transition: "gap 0.15s" }}
                    onMouseEnter={e => { e.currentTarget.style.gap = "9px"; }}
                    onMouseLeave={e => { e.currentTarget.style.gap = "5px"; }}
                  >
                    <GenericEditableText sectionId={sectionId} field={`items.${i}.ctaText`} value={item.ctaText} tag="span" />
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M5 12h14M12 5l7 7-7 7"/>
                    </svg>
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @media (max-width: 1024px) { .stavba-services-grid { grid-template-columns: repeat(2, 1fr) !important; } }
        @media (max-width: 560px)  { .stavba-services-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </section>
  );
}

function ServicesLegal02({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const c = content as Record<string, unknown>;

  const NAVY  = "#143171";
  const FONT_B = "'bw_gradualbold', 'Montserrat', 'Helvetica Neue', Arial, sans-serif";
  const FONT_R = "'bw_gradualregular', 'Open Sans', 'Helvetica Neue', Arial, sans-serif";

  const title    = (c.title    as string) ?? "Profesionální právní servis ve všech směrech";
  const subtitle = (c.subtitle as string) ?? "Jdeme do hloubky a díky tomu jsme rádci, průvodci i rovnocenní partneři.";
  const ctaText  = (c.ctaText  as string) ?? "Zobrazit další";
  const ctaHref  = (c.ctaHref  as string) ?? "/sluzby";

  type Group = { name: string; items: string[] };
  const groups: Group[] = Array.isArray(c.groups) ? (c.groups as Group[]) : [
    { name: "Sektory",       items: ["Bankovnictví a další finanční služby", "Doprava a logistika", "Energetika, vodní a odpadové hospodářství", "IT a telekomunikace", "Média a související služby", "Nemovitosti a stavebnictví"] },
    { name: "Specializace",  items: ["Arbitráže", "Bankovní a finanční právo", "Daně a daňové spory", "Duševní vlastnictví", "Energetika a životní prostředí", "Fúze, akvizice a korporátní právo"] },
  ];

  return (
    <section data-variant="legal-02-services" style={{ backgroundColor: "#fff", padding: "80px 0" }}>
      <style>{`
        @font-face { font-family:'bw_gradualbold';    src:url('/templates/legal-02/bwgradual-bold-webfont.woff2')    format('woff2'); font-display:swap; }
        @font-face { font-family:'bw_gradualregular'; src:url('/templates/legal-02/bwgradual-regular-webfont.woff2') format('woff2'); font-display:swap; }
        .l02s-item a {
          color: #EB5C2E; padding: 24px 32px;
          text-decoration: none; display: block;
          transition: background .15s, color .15s;
        }
        .l02s-item a:hover { background: #EB5C2E; color: #fff; }
        .l02s-cta {
          display: inline-flex; align-items: center; gap: 10px;
          border: 2px solid #143171; border-radius: 30px;
          color: #143171; padding: 14px 40px; margin-top: 24px;
          font-family: 'bw_gradualbold', 'Montserrat', sans-serif; font-size: 17px;
          text-decoration: none; transition: background .2s, color .2s;
        }
        .l02s-cta:hover { background: #143171; color: #fff; }
        @media (max-width: 768px) {
          .l02s-groups { flex-direction: column !important; }
          .l02s-group  { width: 100% !important; }
        }
      `}</style>

      <div style={{ maxWidth: 1440, margin: "0 auto", padding: "0 80px" }}>

        {/* Header */}
        <div style={{ maxWidth: 700, marginBottom: 64 }}>
          <h2 style={{ fontFamily: FONT_B, fontSize: 48, lineHeight: "56px", color: NAVY, margin: "0 0 24px" }}>
            <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
          </h2>
          <p style={{ fontFamily: FONT_R, fontSize: 20, lineHeight: 1.6, color: "#4b5563", margin: 0 }}>
            <GenericEditableText sectionId={sectionId} field="subtitle" value={subtitle} tag="span" />
          </p>
        </div>

        {/* Two-column groups */}
        <div className="l02s-groups" style={{ display: "flex", gap: 24 }}>
          {groups.map((group, gi) => (
            <div key={gi} className="l02s-group" style={{ width: "50%" }}>
              <h3 style={{ fontFamily: FONT_B, fontSize: 32, lineHeight: "40px", color: NAVY, margin: "0 0 24px" }}>
                {group.name}
              </h3>
              <ul style={{ listStyle: "none", margin: "0 0 16px", padding: 0 }}>
                {group.items.map((item, ii) => (
                  <li key={ii} className="l02s-item" style={{ background: "#ECEFF4", marginBottom: 8 }}>
                    <a href={ctaHref} data-btn="primary">{item}</a>
                  </li>
                ))}
              </ul>
              {/* CTA only on last group */}
              {gi === groups.length - 1 && (
                <a href={ctaHref} data-btn="primary" className="l02s-cta">
                  {ctaText}
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </a>
              )}
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}

// ── elektro-01-services ───────────────────────────────────────────────────────
// 2 velké servisní karty: ELEKTROINSTALACE + HROMOSVODY
// Light #f5f5f5 bg, tmavé karty s červenou ikonou
// ─────────────────────────────────────────────────────────────────────────────
function ServicesElektro01({ content, sectionId, tenantSlug, isAdmin }: { content: Record<string, unknown>; sectionId: number; tenantSlug?: string; isAdmin: boolean }) {
  const RED   = "#dd0808";
  const DARK  = "#1b1b1b";
  const WHITE = "#ffffff";
  const FONT  = "'Montserrat', sans-serif";
  const RFONT = "'Roboto', sans-serif";

  const title  = String(content.title  ?? "Nabízené služby");
  const kicker = String(content.kicker ?? "Co nabízím");

  interface ServiceItem { title: string; description: string; ctaText?: string; ctaHref?: string; icon?: string; }
  const items = (content.items as ServiceItem[]) ?? [];

  function resolve(href: string) {
    if (!href || href.startsWith("http") || href.startsWith("#")) return href;
    if (tenantSlug) {
      const base = isAdmin ? `/demo/${tenantSlug}/admin` : `/demo/${tenantSlug}`;
      return base + (href.startsWith("/") ? href : "/" + href);
    }
    return href;
  }

  const LightningIcon = () => (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={RED} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
    </svg>
  );
  const ShieldIcon = () => (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={RED} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
  );

  return (
    <section id="sluzby" style={{ backgroundColor: "#f5f5f5", fontFamily: FONT, padding: "clamp(56px,8vw,96px) 0" }} data-template="elektro-01">
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 32px" }}>

        {/* Header */}
        <div style={{ marginBottom: 48, textAlign: "center" }}>
          <p style={{ color: RED, fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", margin: "0 0 12px" }}>
            <GenericEditableText sectionId={sectionId} field="kicker" value={kicker} tag="span" />
          </p>
          <h2 style={{ color: DARK, fontSize: "clamp(26px,3.5vw,44px)", fontWeight: 800, lineHeight: 1.1, letterSpacing: "-0.02em", margin: 0 }}>
            <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
          </h2>
        </div>

        {/* 2-col cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 32 }}>
          {items.map((item, i) => (
            <div
              key={i}
              style={{ backgroundColor: DARK, borderRadius: 4, padding: "48px 40px", display: "flex", flexDirection: "column", gap: 0, border: "2px solid transparent", transition: "border-color 0.2s, transform 0.2s, box-shadow 0.2s" }}
              onMouseEnter={e => { const el = e.currentTarget as HTMLDivElement; el.style.borderColor = RED; el.style.transform = "translateY(-4px)"; el.style.boxShadow = "0 16px 40px rgba(221,8,8,0.18)"; }}
              onMouseLeave={e => { const el = e.currentTarget as HTMLDivElement; el.style.borderColor = "transparent"; el.style.transform = "translateY(0)"; el.style.boxShadow = "none"; }}
            >
              {/* Icon */}
              <div style={{ marginBottom: 24 }}>
                {item.icon === "lightning" ? <LightningIcon /> : <ShieldIcon />}
              </div>

              {/* Title */}
              <h3 style={{ color: WHITE, fontSize: "clamp(20px,2vw,28px)", fontWeight: 700, lineHeight: 1.15, letterSpacing: "-0.01em", margin: "0 0 16px", fontFamily: FONT }}>
                <GenericEditableText sectionId={sectionId} field={`items.${i}.title`} value={item.title} tag="span" />
              </h3>

              {/* Description */}
              <p style={{ color: "rgba(255,255,255,0.68)", fontSize: "0.95rem", lineHeight: 1.7, margin: "0 0 32px", fontFamily: RFONT, flex: 1 }}>
                <GenericEditableText sectionId={sectionId} field={`items.${i}.description`} value={item.description} tag="span" />
              </p>

              {/* CTA */}
              {item.ctaText && (
                <a
                  href={resolve(item.ctaHref ?? "/")}
                  data-btn="primary"
                  style={{ display: "inline-flex", alignItems: "center", gap: 8, color: RED, textDecoration: "none", fontFamily: FONT, fontSize: "0.8rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", borderBottom: `1px solid ${RED}`, paddingBottom: 2, transition: "opacity 0.2s" }}
                  onMouseEnter={e => { e.currentTarget.style.opacity = "0.75"; }}
                  onMouseLeave={e => { e.currentTarget.style.opacity = "1"; }}
                >
                  <GenericEditableText sectionId={sectionId} field={`items.${i}.ctaText`} value={item.ctaText} tag="span" />
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </a>
              )}
            </div>
          ))}
        </div>
      </div>
      <style>{`.elektro-services-grid { display: grid; grid-template-columns: repeat(2,1fr); } @media (max-width:640px) { .elektro-services-grid { grid-template-columns: 1fr !important; } }`}</style>
    </section>
  );
}

// ── elektro-01-services-detail ────────────────────────────────────────────────
// Pro podstránky /elektroinstalace a /hromosvody
// Bílé bg, 1-2 sekce s ikonou + H3 + popis + bullet list
// ─────────────────────────────────────────────────────────────────────────────
function ServicesDetailElektro01({ content, sectionId, tenantSlug, isAdmin }: { content: Record<string, unknown>; sectionId: number; tenantSlug?: string; isAdmin: boolean }) {
  const RED   = "#dd0808";
  const DARK  = "#1b1b1b";
  const GRAY  = "#5D5D5D";
  const FONT  = "'Montserrat', sans-serif";
  const RFONT = "'Roboto', sans-serif";

  interface DetailSection { title: string; description: string; items?: string[]; }
  const detailSections = (content.sections as DetailSection[]) ?? [];

  function resolve(href: string) {
    if (!href || href.startsWith("http") || href.startsWith("#")) return href;
    if (tenantSlug) {
      const base = isAdmin ? `/demo/${tenantSlug}/admin` : `/demo/${tenantSlug}`;
      return base + (href.startsWith("/") ? href : "/" + href);
    }
    return href;
  }

  const CheckIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={RED} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }} aria-hidden="true">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  );

  return (
    <section style={{ backgroundColor: "#ffffff", fontFamily: FONT, padding: "clamp(56px,8vw,96px) 0" }} data-template="elektro-01">
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 32px" }}>
        <div style={{ display: "grid", gridTemplateColumns: detailSections.length > 1 ? "repeat(auto-fit, minmax(320px, 1fr))" : "1fr", gap: 64 }}>
          {detailSections.map((sec, i) => (
            <div key={i}>
              {/* Red accent + title */}
              <div style={{ display: "flex", alignItems: "flex-start", gap: 16, marginBottom: 20 }}>
                <span style={{ display: "block", width: 4, height: 40, backgroundColor: RED, flexShrink: 0, marginTop: 4 }} />
                <h2 style={{ color: DARK, fontSize: "clamp(22px,2.5vw,34px)", fontWeight: 700, lineHeight: 1.2, letterSpacing: "-0.01em", margin: 0 }}>
                  <GenericEditableText sectionId={sectionId} field={`sections.${i}.title`} value={sec.title} tag="span" />
                </h2>
              </div>

              {/* Description */}
              <p style={{ color: GRAY, fontSize: "1rem", lineHeight: 1.75, margin: "0 0 28px", fontFamily: RFONT }}>
                <GenericEditableText sectionId={sectionId} field={`sections.${i}.description`} value={sec.description} tag="span" />
              </p>

              {/* Bullet list */}
              {sec.items && sec.items.length > 0 && (
                <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 12 }}>
                  {sec.items.map((bullet, j) => (
                    <li key={j} style={{ display: "flex", alignItems: "flex-start", gap: 12, fontFamily: RFONT, fontSize: "0.95rem", color: DARK }}>
                      <CheckIcon />
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div style={{ marginTop: 56, textAlign: "center" }}>
          <a
            href={resolve("#kontakt")}
            style={{ display: "inline-flex", alignItems: "center", gap: 10, backgroundColor: RED, color: "#ffffff", fontFamily: FONT, fontSize: "0.8rem", fontWeight: 700, padding: "16px 40px", borderRadius: 0, textDecoration: "none", textTransform: "uppercase", letterSpacing: "0.06em", boxShadow: "0 4px 20px rgba(221,8,8,0.30)", transition: "opacity 0.18s" }}
            onMouseEnter={e => { e.currentTarget.style.opacity = "0.88"; }}
            onMouseLeave={e => { e.currentTarget.style.opacity = "1"; }}
          >
            Nezávazná poptávka
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </a>
        </div>
      </div>
    </section>
  );
}

// ── stavba-02-services ────────────────────────────────────────────────────────
// Cream bg, centered header, 8 icon-cards 4-col grid, brown accents
function ServicesStavba02({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const BROWN = "#674832";
  const CREAM = "#F8F5F0";
  const DARK  = "#2D1A0F";
  const MUTED = "#7A6454";
  const FONT  = "'Roboto', sans-serif";

  const title    = String(content.title    ?? "Zajišťujeme kompletní rekonstrukce interiérů");
  const subtitle = String(content.subtitle ?? "Od prvního návrhu po finální předání — postaráme se o vše.");
  const sectionId2 = String(content.id ?? "cinnosti");

  type Item = { icon?: string; title: string; text?: string };
  const items = (content.items as Item[]) ?? [];

  const Icon = ({ name }: { name?: string }) => {
    const s = { width: 29, height: 29 };
    const props = { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "1.8", strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true, style: s };
    if (name === "pipe")     return <svg {...props}><path d="M3 12h18M3 6h4v12H3zM17 6h4v12h-4z"/></svg>;
    if (name === "bath")     return <svg {...props}><path d="M4 12h16v3a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4v-3z"/><path d="M6 12V5a2 2 0 0 1 2-2h.5"/></svg>;
    if (name === "wall")     return <svg {...props}><rect x="2" y="4" width="20" height="4" rx="1"/><rect x="2" y="11" width="9" height="4" rx="1"/><rect x="13" y="11" width="9" height="4" rx="1"/><rect x="2" y="18" width="20" height="3" rx="1"/></svg>;
    if (name === "wrench")   return <svg {...props}><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>;
    if (name === "shovel")   return <svg {...props}><path d="M2 22 17 7"/><path d="m15 5 4 4"/><path d="m15 5 3-3 4 4-3 3"/><path d="M2 22c.6-.6 3-2 6-2s5.4 1.4 6 2"/></svg>;
    if (name === "building") return <svg {...props}><rect x="2" y="2" width="9" height="20" rx="1"/><rect x="13" y="8" width="9" height="14" rx="1"/><path d="M6 6h1M6 10h1M6 14h1M6 18h1M17 12h1M17 16h1"/></svg>;
    if (name === "house")    return <svg {...props}><path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z"/><path d="M9 21V12h6v9"/></svg>;
    /* home */              return <svg {...props}><path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z"/><path d="M9 21V12h6v9"/></svg>;
  };

  return (
    <section id={sectionId2} style={{ backgroundColor: CREAM, fontFamily: FONT, padding: "clamp(64px, 8vw, 100px) 0" }} data-template="stavba-02">
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 32px" }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 56, maxWidth: 640, margin: "0 auto 56px" }}>
          <h2 style={{ color: DARK, fontSize: "clamp(24px, 3.5vw, 40px)", fontWeight: 700, lineHeight: 1.15, letterSpacing: "-0.02em", margin: "0 0 14px" }}>
            <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
          </h2>
          <p style={{ color: MUTED, fontSize: "clamp(14px, 1.4vw, 17px)", lineHeight: 1.65, margin: 0 }}>
            <GenericEditableText sectionId={sectionId} field="subtitle" value={subtitle} tag="span" />
          </p>
        </div>

        {/* Cards */}
        <div className="s02-srv-grid">
          {items.map((item, i) => (
            <div
              key={i}
              style={{ backgroundColor: "#fff", borderRadius: 13, padding: "31px 24px 26px", display: "flex", flexDirection: "column", gap: 13, boxShadow: "0 1px 4px rgba(61,37,22,0.07)", transition: "transform 0.2s ease, box-shadow 0.2s ease", cursor: "default" }}
              onMouseEnter={e => { const d = e.currentTarget as HTMLDivElement; d.style.transform = "translateY(-4px)"; d.style.boxShadow = "0 10px 32px rgba(103,72,50,0.14)"; }}
              onMouseLeave={e => { const d = e.currentTarget as HTMLDivElement; d.style.transform = "translateY(0)"; d.style.boxShadow = "0 1px 4px rgba(61,37,22,0.07)"; }}
            >
              {/* Icon */}
              <div style={{ width: 53, height: 53, borderRadius: 11, backgroundColor: "rgba(103,72,50,0.10)", display: "flex", alignItems: "center", justifyContent: "center", color: BROWN, flexShrink: 0 }}>
                <Icon name={item.icon} />
              </div>
              {/* Title */}
              <h3 style={{ color: DARK, fontSize: "1.05rem", fontWeight: 700, lineHeight: 1.3, margin: 0 }}>
                <GenericEditableText sectionId={sectionId} field={`items.${i}.title`} value={item.title} tag="span" />
              </h3>
              {/* Text */}
              {item.text && (
                <p style={{ color: MUTED, fontSize: "0.91rem", lineHeight: 1.6, margin: 0 }}>
                  <GenericEditableText sectionId={sectionId} field={`items.${i}.text`} value={item.text} tag="span" />
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .s02-srv-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; }
        @media (max-width: 1024px) { .s02-srv-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 560px)  { .s02-srv-grid { grid-template-columns: 1fr; } }
      `}</style>
    </section>
  );
}

// ── stavba-03-services ────────────────────────────────────────────────────────
// 1:1 baurekstav.cz: tmavé #1b1a1a bg, bílý centrovaný heading + oranžový kicker
// 3-col grid bílých karet: oranžová ikona nahoře + H3 + popis + oranžový arrow link
// ─────────────────────────────────────────────────────────────────────────────
function ServicesStavba03({ content, sectionId, tenantSlug, isAdmin }: { content: Record<string, unknown>; sectionId: number; tenantSlug?: string; isAdmin?: boolean }) {
  const ORANGE = "#fa7d19";
  const DARK   = "#1b1a1a";
  const WHITE  = "#ffffff";
  const GRAY   = "#999999";
  const FONT   = "'Roboto', sans-serif";

  const kicker   = String(content.kicker   ?? "Naše služby");
  const heading  = String(content.heading  ?? "Kvalita, profesionalita, spolehlivost a cenová dostupnost");
  const subtitle = String(content.subtitle ?? "S námi proměníte své plány ve skutečnost");
  const items    = (content.items as Array<{ icon: string; title: string; description: string }>) ?? [];

  const resolve = (href: string) => {
    if (!tenantSlug || !href.startsWith("/")) return href;
    const base = isAdmin ? `/demo/${tenantSlug}/admin` : `/demo/${tenantSlug}`;
    return base + href;
  };

  const iconPath: Record<string, string> = {
    home:     "m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10",
    building: "M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18z M6 12H4a2 2 0 0 0-2 2v8h4 M18 9h2a2 2 0 0 1 2 2v11h-4 M10 6h4 M10 10h4 M10 14h4 M10 18h4",
    layers:   "M12 2 2 7l10 5 10-5-10-5z M2 17l10 5 10-5 M2 12l10 5 10-5",
    droplets: "M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z",
    grid:     "M3 3h7v7H3z M14 3h7v7h-7z M3 14h7v7H3z M14 14h7v7h-7z",
    wrench:   "M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z",
    tool:     "M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z",
  };

  return (
    <section style={{ backgroundColor: DARK, fontFamily: FONT, padding: "80px 0" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 32px" }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 52 }}>
          <div style={{ color: ORANGE, fontSize: "0.75rem", fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", marginBottom: 12 }}>
            <GenericEditableText sectionId={sectionId} field="kicker" value={kicker} tag="span" />
          </div>
          <h2 style={{ color: WHITE, fontFamily: FONT, fontWeight: 700, fontSize: "clamp(1.5rem, 2.5vw, 2rem)", lineHeight: 1.25, margin: "0 0 12px", maxWidth: 700, marginLeft: "auto", marginRight: "auto" }}>
            <GenericEditableText sectionId={sectionId} field="heading" value={heading} tag="span" />
          </h2>
          <p style={{ color: GRAY, fontSize: "0.95rem", margin: 0 }}>
            <GenericEditableText sectionId={sectionId} field="subtitle" value={subtitle} tag="span" />
          </p>
        </div>

        {/* Cards grid */}
        <div className="stavba03-srv-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24 }}>
          {items.map((item, i) => (
            <div
              key={i}
              style={{ backgroundColor: WHITE, padding: "36px 28px", borderRadius: 2, display: "flex", flexDirection: "column", gap: 14, transition: "transform 0.2s, box-shadow 0.2s" }}
              onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = "translateY(-4px)"; (e.currentTarget as HTMLDivElement).style.boxShadow = "0 12px 40px rgba(0,0,0,0.25)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)"; (e.currentTarget as HTMLDivElement).style.boxShadow = "none"; }}
            >
              {/* Icon */}
              <div style={{ width: 52, height: 52, backgroundColor: "#fff5ec", borderRadius: 2, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={ORANGE} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d={iconPath[item.icon] ?? iconPath.wrench}/>
                </svg>
              </div>

              {/* Title */}
              <h3 style={{ fontFamily: FONT, fontWeight: 700, fontSize: "1rem", color: DARK, lineHeight: 1.3, margin: 0 }}>
                <GenericEditableText sectionId={sectionId} field={`items.${i}.title`} value={item.title} tag="span" />
              </h3>

              {/* Description */}
              <p style={{ fontFamily: FONT, fontSize: "0.88rem", color: "#666", lineHeight: 1.65, margin: 0, flex: 1 }}>
                <GenericEditableText sectionId={sectionId} field={`items.${i}.description`} value={item.description} tag="span" />
              </p>

              {/* Arrow link */}
              <a
                href={resolve("#kontakt")}
                style={{ display: "inline-flex", alignItems: "center", gap: 6, color: ORANGE, fontFamily: FONT, fontSize: "0.85rem", fontWeight: 700, textDecoration: "none", marginTop: 4, transition: "gap 0.2s" }}
                onMouseEnter={e => { e.currentTarget.style.gap = "10px"; }}
                onMouseLeave={e => { e.currentTarget.style.gap = "6px"; }}
              >
                <GenericEditableText sectionId={sectionId} field={`items.${i}.ctaText`} value={String((item as Record<string,unknown>).ctaText ?? "Více")} tag="span" />
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </a>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) { .stavba03-srv-grid { grid-template-columns: repeat(2, 1fr) !important; } }
        @media (max-width: 560px) { .stavba03-srv-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </section>
  );
}

// ── instala-01-services ────────────────────────────────────────────────────────
// 1:1 instalateritopenari.cz:
// - tmavá sekce (#1e293b bg), bílý text pro header
// - kicker 24px/300/uppercase, H2 600/capitalize, odstavec 18px
// - 2×2 grid karet: foto (300px) + bílé tělo (název 24px/600 + popis + CTA link)
// - border-bottom: 1px solid #979797 u karet
// ─────────────────────────────────────────────────────────────────────────────
function ServicesInstala01({ content, sectionId, tenantSlug, isAdmin }: { content: Record<string, unknown>; sectionId: number; tenantSlug?: string; isAdmin: boolean }) {
  const YELLOW = "#FFC527";
  const DARK   = "#1e293b";
  const WHITE  = "#ffffff";
  const FONT   = "'Outfit', sans-serif";

  const kicker   = String(content.kicker   ?? "Naše služby");
  const title    = String(content.title    ?? "Řešení problémů pro každou domácnost");
  const subtitle = String(content.subtitle ?? "Potřebujete rychle a spolehlivě vyřešit instalatérské, topenářské nebo plynařské problémy? Jsme tady pro vás!");
  const items    = (content.items as Array<{ name: string; title: string; description: string; ctaText: string; ctaHref: string; image?: string }>) ?? [];

  function resolveHref(href: string) {
    if (!href || href.startsWith("http") || href.startsWith("#")) return href;
    if (tenantSlug) {
      const base = isAdmin ? `/demo/${tenantSlug}/admin` : `/demo/${tenantSlug}`;
      return base + (href.startsWith("/") ? href : "/" + href);
    }
    return href;
  }

  return (
    <section id="sluzby" style={{ backgroundColor: DARK, fontFamily: FONT, padding: "80px 0" }} data-template="instala-01-services">
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 40px" }}>

        {/* Section header */}
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <p style={{ fontSize: "24px", fontWeight: 300, textTransform: "uppercase", color: YELLOW, margin: "0 0 10px", letterSpacing: "0.06em" }}>
            <GenericEditableText sectionId={sectionId} field="kicker" value={kicker} tag="span" />
          </p>
          <h2 style={{ fontSize: "clamp(28px,3.5vw,46px)", fontWeight: 600, textTransform: "capitalize", color: WHITE, lineHeight: 1.15, margin: "0 0 18px" }}>
            <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
          </h2>
          <p style={{ fontSize: "18px", fontWeight: 400, color: "rgba(255,255,255,0.75)", lineHeight: 1.6, maxWidth: 680, margin: "0 auto" }}>
            <GenericEditableText sectionId={sectionId} field="subtitle" value={subtitle} tag="span" />
          </p>
        </div>

        {/* Service cards grid */}
        <div className="i01-srv-grid" style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 24 }}>
          {items.map((item, i) => {
            const img = item.image ?? "";
            return (
              <div key={i} style={{ backgroundColor: WHITE, borderRadius: 8, overflow: "hidden", display: "flex", flexDirection: "column", borderBottom: "1px solid #979797" }}>
                {/* Card image */}
                {img && (
                  <div style={{ position: "relative", height: 300, flexShrink: 0 }}>
                    <GenericEditableImage sectionId={sectionId} field={`items.${i}.image`} src={img} alt={item.title} className="relative overflow-hidden w-full h-full" style={{ height: "100%" }}>
                      <Image src={img} alt={item.title} fill className="object-cover" sizes="(max-width:900px) 100vw, 50vw" unoptimized={shouldSkipNextImageOptimization(img)} />
                    </GenericEditableImage>
                  </div>
                )}
                {/* Card body */}
                <div style={{ padding: "28px 32px 32px", display: "flex", flexDirection: "column", flex: 1 }}>
                  <h3 style={{ fontSize: "24px", fontWeight: 600, color: "#222222", margin: "0 0 12px", lineHeight: 1.2 }}>
                    <GenericEditableText sectionId={sectionId} field={`items.${i}.title`} value={item.title} tag="span" />
                  </h3>
                  <p style={{ fontSize: "16px", color: "#222222", lineHeight: 1.6, margin: "0 0 20px", flex: 1 }}>
                    <GenericEditableText sectionId={sectionId} field={`items.${i}.description`} value={item.description} tag="span" />
                  </p>
                  <a
                    href={resolveHref(item.ctaHref)}
                    data-btn="primary"
                    style={{ display: "inline-flex", alignItems: "center", gap: 6, color: DARK, fontWeight: 600, fontSize: "15px", textDecoration: "none", borderBottom: `2px solid ${YELLOW}`, paddingBottom: 2, width: "fit-content", transition: "color 0.18s" }}
                    onMouseEnter={e => { e.currentTarget.style.color = "#7a4800"; }}
                    onMouseLeave={e => { e.currentTarget.style.color = DARK; }}
                  >
                    <GenericEditableText sectionId={sectionId} field={`items.${i}.ctaText`} value={item.ctaText} tag="span" />
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) { .i01-srv-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </section>
  );
}

// ── catering-01-services ──────────────────────────────────────────────────────
// Dark teal bg, left food photo, right: kicker + 4 accordion service items
// ─────────────────────────────────────────────────────────────────────────────
// ── catering-01-services ──────────────────────────────────────────────────────
// Nordic Minimal Gastro:
// - Centered kicker + description, then 2×2 card grid
// - Each card: stone border, number accent, title + body, hover lift + terracotta top border
// - Bottom: terracotta CTA pill
// ─────────────────────────────────────────────────────────────────────────────
function ServicesCatering01({ content, sectionId, tenantSlug, isAdmin }: { content: Record<string, unknown>; sectionId: number; tenantSlug?: string; isAdmin: boolean }) {
  const GREEN  = "#2d4a3e";
  const TERRA  = "#c4755b";
  const WARM   = "#f8f5f0";
  const STONE  = "#e8e2d8";
  const SERIF  = "'Fraunces', Georgia, serif";
  const SANS   = "'Inter', system-ui, sans-serif";

  interface SvcItem { name: string; title?: string; description: string }
  const kickerRaw  = content.kicker;
  const titleRaw   = content.title;
  const kicker  = kickerRaw === undefined ? "co umíme" : String(kickerRaw);
  const desc    = String(content.description ?? "");
  const ctaText = String(content.ctaText     ?? "Poptat catering");
  const ctaHref = String(content.ctaHref     ?? "#kontakt");
  const items   = (content.items as SvcItem[]) ?? [];

  const showHeader = !!(kicker.trim() || desc.trim());

  function resolveHref(href: string) {
    if (!tenantSlug || href.startsWith("http")) return href;
    const base = isAdmin ? `/demo/${tenantSlug}/admin` : `/demo/${tenantSlug}`;
    return href === "/" ? base : `${base}${href}`;
  }

  return (
    <section
      id="sluzby"
      data-template="catering-01"
      data-variant="catering-01-services"
      style={{ background: WARM, padding: "6rem 0 7rem" }}
    >
      <style>{`
        .ct1sv-wrap{max-width:1200px;margin:0 auto;padding:0 1.5rem}
        .ct1sv-head{text-align:center;margin-bottom:4rem}
        .ct1sv-kicker{font-family:${SANS};font-size:.68rem;font-weight:600;letter-spacing:.18em;text-transform:uppercase;color:${TERRA};display:flex;align-items:center;justify-content:center;gap:.8rem;margin-bottom:1.2rem}
        .ct1sv-kicker::before,.ct1sv-kicker::after{content:'';width:2rem;height:1px;background:${TERRA};opacity:.5}
        .ct1sv-desc{font-family:${SANS};font-size:1.05rem;line-height:1.75;color:#555;max-width:42rem;margin:0 auto}
        .ct1sv-grid{display:grid;grid-template-columns:1fr;gap:1.5rem;margin-bottom:3.5rem}
        .ct1sv-card{border:1px solid ${STONE};padding:2.2rem 2rem;position:relative;transition:transform .3s cubic-bezier(.4,0,.2,1),box-shadow .3s,border-color .3s;background:${WARM}}
        .ct1sv-card::before{content:'';position:absolute;top:0;left:0;right:0;height:3px;background:${TERRA};transform:scaleX(0);transform-origin:left;transition:transform .35s cubic-bezier(.4,0,.2,1)}
        .ct1sv-card:hover{transform:translateY(-4px);box-shadow:0 8px 32px rgba(0,0,0,.06);border-color:${TERRA}}
        .ct1sv-card:hover::before{transform:scaleX(1)}
        .ct1sv-num{font-family:${SERIF};font-size:2.4rem;font-weight:300;color:${STONE};line-height:1;margin-bottom:1rem;transition:color .3s}
        .ct1sv-card:hover .ct1sv-num{color:${TERRA}}
        .ct1sv-title{font-family:${SERIF};font-size:1.2rem;font-weight:400;color:${GREEN};margin:0 0 .8rem;line-height:1.3}
        .ct1sv-body{font-family:${SANS};font-size:.88rem;line-height:1.7;color:#666;margin:0}
        .ct1sv-cta-wrap{text-align:center}
        .ct1sv-cta{display:inline-flex;align-items:center;background:${TERRA};color:#fff;font-family:${SANS};font-size:.75rem;font-weight:600;letter-spacing:.1em;text-transform:uppercase;text-decoration:none;padding:.8rem 2.2rem;border-radius:999px;transition:background .25s,transform .25s}
        .ct1sv-cta:hover{background:#b0634a;transform:translateY(-2px)}
        @media(min-width:640px){.ct1sv-grid{grid-template-columns:repeat(2,1fr)}}
        @media(min-width:1024px){
          .ct1sv-card{padding:2.8rem 2.4rem}
          .ct1sv-title{font-size:1.3rem}
        }
      `}</style>

      <div className="ct1sv-wrap">
        {showHeader && (
          <div className="ct1sv-head">
            {kicker.trim() && (
              <div className="ct1sv-kicker">
                <GenericEditableText sectionId={sectionId} field="kicker" value={kicker} tag="span" />
              </div>
            )}
            {desc.trim() && (
              <p className="ct1sv-desc">
                <GenericEditableText sectionId={sectionId} field="description" value={desc} tag="span" />
              </p>
            )}
          </div>
        )}

        <div className="ct1sv-grid">
          {items.map((item, i) => (
            <div key={i} className="ct1sv-card">
              <div className="ct1sv-num">{String(i + 1).padStart(2, "0")}</div>
              <h3 className="ct1sv-title">
                <GenericEditableText sectionId={sectionId} field={`items.${i}.title`} value={item.title ?? item.name} tag="span" />
              </h3>
              <p className="ct1sv-body">
                <GenericEditableText sectionId={sectionId} field={`items.${i}.description`} value={item.description} tag="span" />
              </p>
            </div>
          ))}
        </div>

        <div className="ct1sv-cta-wrap">
          <a href={resolveHref(ctaHref)} data-btn="primary" className="ct1sv-cta">
            <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
          </a>
        </div>
      </div>
    </section>
  );
}

// ─── autoskola-01 Services — 3 karty kurzů ────────────────────────────────────
function ServicesAutoskola01({ content, sectionId, tenantSlug, isAdmin }: { content: Record<string, unknown>; sectionId: number; tenantSlug?: string; isAdmin?: boolean }) {
  const heading    = String(content.heading    ?? "Naše kurzy");
  const subheading = String(content.subheading ?? "Vyberte si kurz, který vám sedí");
  const items = ((content.items as Record<string, unknown>[]) ?? []);

  const ORANGE = "#f16823";
  const DARK   = "#484848";
  const FONT   = "'Roboto', sans-serif";

  const resolve = (href: string) => (tenantSlug && !isAdmin) ? `/demo/${tenantSlug}${href}` : href;

  const Icon = ({ type }: { type?: string }) => {
    const s = { width: 28, height: 28, stroke: ORANGE, fill: "none", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
    if (type === "zap") return (
      <svg viewBox="0 0 24 24" {...s}><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
    );
    if (type === "repeat") return (
      <svg viewBox="0 0 24 24" {...s}><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>
    );
    // default car
    return (
      <svg viewBox="0 0 24 24" {...s}><path d="M5 17H3a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h14l4 4v4a2 2 0 0 1-2 2h-2"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/><path d="M5 9V7"/><path d="M1 9h18"/></svg>
    );
  };

  return (
    <section id={String(sectionId)} style={{ backgroundColor: "#f7f7f7", padding: "80px clamp(24px, 6vw, 80px)" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 52 }}>
          <p style={{ fontFamily: FONT, fontWeight: 400, fontSize: 12, letterSpacing: "0.2em", textTransform: "uppercase", color: ORANGE, margin: "0 0 10px" }}>
            <GenericEditableText sectionId={sectionId} field="subheading" value={subheading} tag="span" />
          </p>
          <h2 style={{ fontFamily: FONT, fontWeight: 700, fontSize: "clamp(1.5rem, 2.5vw, 2.2rem)", color: DARK, margin: 0 }}>
            <GenericEditableText sectionId={sectionId} field="heading" value={heading} tag="span" />
          </h2>
        </div>

        {/* Karty */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 24 }}>
          {items.map((item, i) => {
            const title       = String(item.title       ?? "");
            const description = String(item.description ?? "");
            const price       = String(item.price       ?? "");
            const ctaText     = String(item.ctaText     ?? "Přihlásit se");
            const ctaHref     = String(item.ctaHref     ?? "/prihlaseni");
            const iconType    = String(item.iconType    ?? "car");
            const highlighted = Boolean(item.highlighted);
            const features    = ((item.features as string[]) ?? []);

            return (
              <div
                key={i}
                style={{
                  backgroundColor: highlighted ? ORANGE : "#fff",
                  borderRadius: 4,
                  padding: "36px 28px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 16,
                  boxShadow: highlighted ? "0 8px 32px rgba(241,104,35,0.25)" : "0 2px 12px rgba(0,0,0,0.07)",
                  transform: highlighted ? "translateY(-6px)" : "none",
                  position: "relative",
                }}
              >
                {highlighted && (
                  <div style={{ position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)", backgroundColor: DARK, color: "#fff", fontFamily: FONT, fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", padding: "4px 16px", borderRadius: 50 }}>
                    Nejoblíbenější
                  </div>
                )}

                {/* Ikona */}
                <div style={{ width: 52, height: 52, borderRadius: "50%", backgroundColor: highlighted ? "rgba(255,255,255,0.18)" : "#fff3ec", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg viewBox="0 0 24 24" width={28} height={28} fill="none" stroke={highlighted ? "#fff" : ORANGE} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                    {iconType === "zap" && <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>}
                    {iconType === "repeat" && <><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></>}
                    {iconType === "car" && <><path d="M5 17H3a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h14l4 4v4a2 2 0 0 1-2 2h-2"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/><path d="M1 9h18"/></>}
                  </svg>
                </div>

                <div>
                  <h3 style={{ fontFamily: FONT, fontWeight: 700, fontSize: "1.1rem", color: highlighted ? "#fff" : DARK, margin: "0 0 8px" }}>
                    <GenericEditableText sectionId={sectionId} field={`items.${i}.title`} value={title} tag="span" />
                  </h3>
                  <p style={{ fontFamily: FONT, fontWeight: 400, fontSize: "0.9rem", color: highlighted ? "rgba(255,255,255,0.88)" : "#666", margin: 0, lineHeight: 1.65 }}>
                    <GenericEditableText sectionId={sectionId} field={`items.${i}.description`} value={description} tag="span" />
                  </p>
                </div>

                {/* Features */}
                {features.length > 0 && (
                  <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 8 }}>
                    {features.map((f, fi) => (
                      <li key={fi} style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: FONT, fontSize: "0.85rem", color: highlighted ? "rgba(255,255,255,0.9)" : DARK }}>
                        <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={highlighted ? "#fff" : ORANGE} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                        <GenericEditableText sectionId={sectionId} field={`items.${i}.features.${fi}`} value={f} tag="span" />
                      </li>
                    ))}
                  </ul>
                )}

                <div style={{ marginTop: "auto", paddingTop: 8 }}>
                  <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: "1.25rem", color: highlighted ? "#fff" : ORANGE, marginBottom: 14 }}>
                    <GenericEditableText sectionId={sectionId} field={`items.${i}.price`} value={price} tag="span" />
                  </div>
                  <a
                    href={resolve(ctaHref)}
                    data-btn="primary"
                    style={{ display: "block", textAlign: "center", padding: "12px 24px", backgroundColor: highlighted ? "#fff" : ORANGE, color: highlighted ? ORANGE : "#fff", fontFamily: FONT, fontSize: 14, fontWeight: 600, letterSpacing: "0.04em", textDecoration: "none", borderRadius: 4, transition: "opacity 0.2s" }}
                    onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.opacity = "0.85"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.opacity = "1"; }}
                  >
                    <GenericEditableText sectionId={sectionId} field={`items.${i}.ctaText`} value={ctaText} tag="span" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ─── sweet-01 Products — hover-reveal image cards ────────────────────────────
function ProductsSweet01({
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
  interface SvcItem { name: string; description: string; image?: string; imageAlt?: string; ctaText?: string; ctaHref?: string; }
  const kicker   = String(content.kicker  ?? "NAŠE NABÍDKA");
  const title    = String(content.title   ?? "Co u nás najdete");
  const services = (content.services as SvcItem[]) ?? [];

  const RED  = "#E2001A";
  const DARK = "#0a0a0a";
  const FONT = "'Roboto','Helvetica Neue',Arial,sans-serif";

  function resolveDemoHref(href: string) {
    if (!tenantSlug || !href || href.startsWith("http")) return href;
    const base = isAdmin ? `/demo/${tenantSlug}/admin` : `/demo/${tenantSlug}`;
    return href === "/" ? base : `${base}${href}`;
  }

  return (
    <section
      data-variant="sweet-01-products"
      style={{ background: "#f8f8f8", padding: "80px 0" }}
    >
      <style>{`
        .sw01-prod-hd { text-align: center; max-width: 1200px; margin: 0 auto 48px; padding: 0 24px; }
        .sw01-prod-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0; max-width: 1200px; margin: 0 auto; padding: 0 24px; gap: 24px; }
        .sw01-prod-card { position: relative; height: 434px; overflow: hidden; background: #ddd; cursor: pointer; }
        .sw01-prod-card-bg { position: absolute; inset: 0; background-size: cover; background-position: center; transition: transform 0.4s ease; }
        .sw01-prod-card:hover .sw01-prod-card-bg { transform: scale(1.05); }
        .sw01-prod-overlay { position: absolute; inset: 0; background: linear-gradient(to top, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.08) 60%, rgba(0,0,0,0) 100%); }
        .sw01-prod-img-title { position: absolute; bottom: 11.5rem; left: 0; right: 0; padding: 0 1rem 1rem; transition: opacity 0.3s ease; }
        .sw01-prod-img-title h3 { font-family: ${FONT}; font-size: 1.25rem; font-weight: 700; color: #fff; margin: 0; }
        .sw01-prod-panel { position: absolute; bottom: 0; left: 0; right: 0; height: 11.5rem; background: #fff; padding: 1rem; transition: height 0.4s ease; overflow: hidden; display: flex; flex-direction: column; gap: 8px; }
        .sw01-prod-card:hover .sw01-prod-panel { height: 13.5rem; }
        .sw01-prod-panel h3 { font-family: ${FONT}; font-size: 1rem; font-weight: 700; color: ${DARK}; margin: 0; }
        .sw01-prod-panel p { font-family: ${FONT}; font-size: 0.875rem; color: #555; margin: 0; line-height: 1.55; }
        .sw01-prod-panel-cta { font-family: ${FONT}; font-size: 0.8rem; font-weight: 700; color: ${RED}; text-transform: uppercase; letter-spacing: 1.5px; text-decoration: none; margin-top: auto; display: inline-block; }
        @media (max-width: 768px) {
          .sw01-prod-grid { grid-template-columns: 1fr; }
          .sw01-prod-card { height: 360px; }
        }
      `}</style>

      <div className="sw01-prod-hd">
        <p style={{ fontFamily: FONT, fontSize: "0.75rem", fontWeight: 700, letterSpacing: "3px", color: RED, textTransform: "uppercase", margin: "0 0 12px" }}>
          <GenericEditableText sectionId={sectionId} field="kicker" value={kicker} tag="span" />
        </p>
        <h2 style={{ fontFamily: FONT, fontSize: "clamp(1.6rem,3vw,2.4rem)", fontWeight: 700, color: DARK, margin: 0 }}>
          <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
        </h2>
      </div>

      <div className="sw01-prod-grid">
        {services.map((svc, i) => {
          const img     = svc.image ?? "";
          const alt     = svc.imageAlt ?? svc.name;
          const cta     = svc.ctaText ?? "Více informací";
          const ctaLink = resolveDemoHref(svc.ctaHref ?? "#");
          return (
            <div key={i} className="sw01-prod-card">
              {/* Background image — editable in studio */}
              <GenericEditableImage sectionId={sectionId} field={`services.${i}.image`} src={img} alt={alt} style={{ position: "absolute", inset: 0, zIndex: 0 }}>
                <div className="sw01-prod-card-bg" style={{ backgroundImage: `url(${img})` }} />
              </GenericEditableImage>
              <div className="sw01-prod-overlay" />

              {/* Title visible in image area */}
              <div className="sw01-prod-img-title">
                <h3>
                  <GenericEditableText sectionId={sectionId} field={`services.${i}.name`} value={svc.name} tag="span" />
                </h3>
              </div>

              {/* Slide-up white panel */}
              <div className="sw01-prod-panel">
                <h3>
                  <GenericEditableText sectionId={sectionId} field={`services.${i}.name`} value={svc.name} tag="span" />
                </h3>
                <p>
                  <GenericEditableText sectionId={sectionId} field={`services.${i}.description`} value={svc.description} tag="span" />
                </p>
                <a href={ctaLink} className="sw01-prod-panel-cta">
                  <GenericEditableText sectionId={sectionId} field={`services.${i}.ctaText`} value={cta} tag="span" />
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

// ── bakery-02-delivery ────────────────────────────────────────────────────────
function DeliveryBakery02({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const FONT = "'Lato','Helvetica Neue',Arial,sans-serif";
  const heading = String(content.heading ?? "Demo Pekářství na Wolt a Bolt Food");
  const text = String(content.text ?? "Všechny naše dobroty vám nyní rádi pošleme z naší pekárny až domů prostřednictvím Woltu nebo BoltFood.");

  return (
    <section
      data-variant="bakery-02-delivery"
      style={{
        backgroundColor: "#222",
        padding: "clamp(56px, 7vw, 96px) clamp(24px, 8vw, 120px)",
        textAlign: "center",
      }}
    >
      <style>{`
        [data-variant="bakery-02-delivery"] .b02d-logos {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: clamp(20px, 4vw, 48px);
          margin-bottom: clamp(28px, 4vw, 44px);
        }
        [data-variant="bakery-02-delivery"] .b02d-logo-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 9px 22px;
          border: 1px solid rgba(255,255,255,0.2);
          font-family: 'Lato','Helvetica Neue',Arial,sans-serif;
          font-size: 13px;
          font-weight: 700;
          letter-spacing: 1.5px;
          color: rgba(255,255,255,0.85);
          border-radius: 2px;
        }
        [data-variant="bakery-02-delivery"] .b02d-divider {
          color: rgba(255,255,255,0.2);
          font-size: 20px;
          font-weight: 100;
        }
      `}</style>

      {/* Wolt + Bolt badges */}
      <div className="b02d-logos" aria-hidden>
        <span className="b02d-logo-badge">
          {/* Wolt dot */}
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <circle cx="9" cy="9" r="9" fill="#00BFFF" opacity="0.85"/>
            <text x="9" y="13" textAnchor="middle" fontFamily="Arial" fontWeight="700" fontSize="9" fill="#fff">W</text>
          </svg>
          Wolt
        </span>
        <span className="b02d-divider">+</span>
        <span className="b02d-logo-badge">
          {/* Bolt lightning */}
          <svg width="14" height="18" viewBox="0 0 14 18" fill="none">
            <path d="M8 0L0 10h6l-1 8 9-11H8L9 0z" fill="#34D186" opacity="0.9"/>
          </svg>
          Bolt Food
        </span>
      </div>

      <h2 style={{
        fontFamily: FONT, fontSize: "clamp(1.2rem, 2.5vw, 2rem)", fontWeight: 300,
        letterSpacing: "2px", color: "#fff", margin: "0 0 20px", lineHeight: 1.35,
        textTransform: "uppercase",
      }}>
        <GenericEditableText sectionId={sectionId} field="heading" value={heading} tag="span" />
      </h2>

      <p style={{
        fontFamily: FONT, fontSize: "clamp(0.88rem, 1.2vw, 1.05rem)", fontWeight: 300,
        color: "rgba(255,255,255,0.6)", margin: "0 auto",
        maxWidth: 560, lineHeight: 1.75,
      }}>
        <GenericEditableText sectionId={sectionId} field="text" value={text} tag="span" />
      </p>
    </section>
  );
}

// ── bakery-02-locations ───────────────────────────────────────────────────────
function LocationsBakery02({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const FONT = "'Lato','Helvetica Neue',Arial,sans-serif";
  const heading = String(content.heading ?? "Naše pobočky");
  const rawItems = Array.isArray(content.items) ? content.items as Array<{ image?: string; name?: string; address?: string; woltHref?: string }> : [];
  const items = rawItems.length > 0 ? rawItems : [
    { image: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=800&q=80", name: "Demo Pekářství Praha 1", address: "Ukázková 123, Praha 1", woltHref: "https://wolt.com/demo" },
    { image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&q=80", name: "Demo Pekářství Praha 2", address: "Vzorová 456, Praha 2", woltHref: "https://wolt.com/demo" },
    { image: "https://images.unsplash.com/photo-1568254183919-78a4f43a2877?w=800&q=80", name: "Demo Pekářství Praha 3", address: "Demonstrační 789, Praha 3", woltHref: "https://wolt.com/demo" },
  ];

  return (
    <section
      data-variant="bakery-02-locations"
      style={{ backgroundColor: "#f7f5f0", padding: "clamp(56px, 7vw, 104px) clamp(24px, 6vw, 72px)" }}
    >
      <style>{`
        [data-variant="bakery-02-locations"] .b02l-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: clamp(24px, 3vw, 36px);
          max-width: 1200px;
          margin: 0 auto;
        }
        @media (min-width: 640px) {
          [data-variant="bakery-02-locations"] .b02l-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }
        [data-variant="bakery-02-locations"] .b02l-card {
          position: relative;
          overflow: hidden;
          aspect-ratio: 3 / 4;
          background: #ccc;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          text-decoration: none;
        }
        [data-variant="bakery-02-locations"] .b02l-card .b02l-img {
          transition: transform 0.7s cubic-bezier(.25,.46,.45,.94);
        }
        [data-variant="bakery-02-locations"] .b02l-card:hover .b02l-img {
          transform: scale(1.05);
        }
        [data-variant="bakery-02-locations"] .b02l-overlay {
          position: absolute; inset: 0;
          background: linear-gradient(to top, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.25) 50%, rgba(0,0,0,0.04) 100%);
          pointer-events: none;
        }
        [data-variant="bakery-02-locations"] .b02l-body {
          position: relative; z-index: 1;
          padding: clamp(20px, 3vw, 32px);
          display: flex; flex-direction: column; gap: 6px;
        }
        [data-variant="bakery-02-locations"] .b02l-name {
          font-family: 'Lato','Helvetica Neue',Arial,sans-serif;
          font-size: clamp(0.95rem, 1.3vw, 1.15rem);
          font-weight: 600;
          letter-spacing: 1px;
          color: #fff;
          margin: 0;
          text-transform: uppercase;
        }
        [data-variant="bakery-02-locations"] .b02l-address {
          font-family: 'Lato','Helvetica Neue',Arial,sans-serif;
          font-size: clamp(0.78rem, 1vw, 0.9rem);
          font-weight: 300;
          color: rgba(255,255,255,0.7);
          margin: 0;
        }
        [data-variant="bakery-02-locations"] .b02l-wolt {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          margin-top: 10px;
          padding: 8px 18px;
          border: 1px solid rgba(255,255,255,0.35);
          font-family: 'Lato','Helvetica Neue',Arial,sans-serif;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: #fff;
          text-decoration: none;
          align-self: flex-start;
          transition: background 0.25s, border-color 0.25s;
        }
        [data-variant="bakery-02-locations"] .b02l-wolt:hover {
          background: rgba(255,255,255,0.12);
          border-color: rgba(255,255,255,0.7);
        }
      `}</style>

      {/* Section heading */}
      <p style={{
        fontFamily: FONT, fontSize: "clamp(0.65rem, 1vw, 0.78rem)", fontWeight: 700,
        letterSpacing: "5px", textTransform: "uppercase", color: "#aaa",
        textAlign: "center", margin: "0 0 clamp(36px, 5vw, 64px)",
      }}>
        <GenericEditableText sectionId={sectionId} field="heading" value={heading} tag="span" />
      </p>

      <div className="b02l-grid">
        {items.map((item, i) => {
          const img = item.image ?? "";
          const name = item.name ?? "";
          const address = item.address ?? "";
          const woltHref = item.woltHref ?? "#";
          return (
            <div key={`b02l-${i}`} className="b02l-card">
              <GenericEditableImage sectionId={sectionId} field={`items.${i}.image`} src={img} alt={name} style={{ position: "absolute", inset: 0 }}>
                <Image
                  src={img} alt={name} fill
                  sizes="(max-width: 640px) 90vw, 33vw"
                  className="b02l-img"
                  style={{ objectFit: "cover", objectPosition: "center" }}
                  unoptimized={shouldSkipNextImageOptimization(img)}
                />
              </GenericEditableImage>
              <div className="b02l-overlay" />
              <div className="b02l-body">
                <p className="b02l-name">
                  <GenericEditableText sectionId={sectionId} field={`items.${i}.name`} value={name} tag="span" />
                </p>
                <p className="b02l-address">
                  <GenericEditableText sectionId={sectionId} field={`items.${i}.address`} value={address} tag="span" />
                </p>
                <a href={woltHref} className="b02l-wolt" onClick={e => e.stopPropagation()}>
                  Objednat na Wolt
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

// ── lang-01-services ──────────────────────────────────────────────────────────
// 1:1 jipka.cz kurzy sekce:
// - Bílé bg, padding 100px 40px
// - Centrovaný eyebrow kicker + H2 44px
// - 3-col grid karet: #f8f9fc bg, border-radius 20px, 2px border transparent
// - Karta: červený icon box 56px (border-radius 14px) + H3 + popis + ul bullet list
// - Hover: červený border, translateY(-4px), shadow, bílé bg
// ─────────────────────────────────────────────────────────────────────────────
function ServicesLang01({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const FONT = "'Inter', -apple-system, sans-serif";
  const RED  = "#e63946";
  const DARK = "#1a1a2e";

  const eyebrow = String(content.eyebrow ?? "Naše kurzy");
  const heading = String(content.heading ?? "Vyberte si formát, který sedí vám");
  const items   = (content.items as Array<{ icon?: string; title: string; description: string; features?: string[] }>) ?? [
    { icon: "SK",  title: "Skupinové kurzy",    description: "Klasické semestrální kurzy v malých skupinkách 4–8 studentů.",         features: ["2× týdně 90 min", "30 lekcí / semestr", "od 6 800 Kč"] },
    { icon: "IND", title: "Individuální výuka", description: "Lekce 1 na 1 podle vašeho tempa a potřeb. Online i osobně.",            features: ["flexibilní termíny", "plně přizpůsobeno", "od 690 Kč/hod"] },
    { icon: "FIR", title: "Firemní výuka",      description: "Jazykové vzdělávání pro vaše zaměstnance přímo ve firmě.",              features: ["na klíč", "reporting pokroku", "cenová nabídka na míru"] },
  ];

  return (
    <>
      <style>{`
        .lang01srv{padding:100px 40px;background:#fff;font-family:${FONT};}
        .lang01srv-inner{max-width:1280px;margin:0 auto;}
        .lang01srv-head{text-align:center;margin-bottom:60px;}
        .lang01srv-eyebrow{color:${RED};font-size:13px;letter-spacing:4px;text-transform:uppercase;font-weight:700;display:block;margin-bottom:10px;}
        .lang01srv-head h2{font-size:44px;font-weight:800;margin:0;color:${DARK};letter-spacing:-1px;}
        .lang01srv-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:24px;}
        .lang01srv-card{padding:32px 28px;border-radius:20px;background:#f8f9fc;border:2px solid transparent;transition:all 0.3s;}
        .lang01srv-card:hover{border-color:${RED};transform:translateY(-4px);background:#fff;box-shadow:0 12px 30px rgba(0,0,0,0.06);}
        .lang01srv-icon{width:56px;height:56px;border-radius:14px;background:${RED};color:#fff;display:flex;align-items:center;justify-content:center;font-size:16px;font-weight:800;margin-bottom:20px;letter-spacing:-0.5px;}
        .lang01srv-card h3{font-size:20px;font-weight:700;margin:0 0 8px;color:${DARK};}
        .lang01srv-card p{font-size:14px;color:#555;line-height:1.6;margin:0 0 18px;}
        .lang01srv-card ul{margin:0;padding-left:18px;color:#444;font-size:14px;line-height:1.8;}
        .lang01srv-card ul li::marker{color:${RED};}
        @media(max-width:900px){.lang01srv-grid{grid-template-columns:1fr;}.lang01srv{padding:60px 20px;}.lang01srv-head h2{font-size:32px;}}
      `}</style>
      <section className="lang01srv" id="kurzy" data-template="lang-01">
        <div className="lang01srv-inner">
          <div className="lang01srv-head">
            <span className="lang01srv-eyebrow">
              <GenericEditableText sectionId={sectionId} field="eyebrow" value={eyebrow} tag="span" />
            </span>
            <h2>
              <GenericEditableText sectionId={sectionId} field="heading" value={heading} tag="span" />
            </h2>
          </div>
          <div className="lang01srv-grid">
            {items.map((item, i) => (
              <div key={i} className="lang01srv-card">
                <div className="lang01srv-icon">
                  <GenericEditableText sectionId={sectionId} field={`items.${i}.icon`} value={String(item.icon ?? "")} tag="span" />
                </div>
                <h3>
                  <GenericEditableText sectionId={sectionId} field={`items.${i}.title`} value={item.title} tag="span" />
                </h3>
                <p>
                  <GenericEditableText sectionId={sectionId} field={`items.${i}.description`} value={item.description} tag="span" />
                </p>
                {item.features && item.features.length > 0 && (
                  <ul>
                    {item.features.map((f, fi) => (
                      <li key={fi}>
                        <GenericEditableText sectionId={sectionId} field={`items.${i}.features.${fi}`} value={f} tag="span" />
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

// ── edu-01-services ───────────────────────────────────────────────────────────
// Inspirováno skolapopulo.cz: bílé bg, dekorativní svg blob vlevo dole,
// centrovaný heading, 3-sloupcový grid 6 karet s blue ikonami.
// Hover: blue border + shadow + lift. CTA link dole.
// ─────────────────────────────────────────────────────────────────────────────
function ServicesEdu01({ content, sectionId, tenantSlug, isAdmin }: { content: Record<string, unknown>; sectionId: number; tenantSlug?: string; isAdmin: boolean }) {
  const NAVY = "#132339";
  const BLUE = "#0059df";
  const FONT = "'Libre Franklin', Arial, sans-serif";

  const heading    = String(content.heading    ?? "Co nabízíme");
  const subheading = String(content.subheading ?? "Komplexní vzdělávací podpora pro žáky všech věkových kategorií");
  const services   = (content.services as Array<{ title: string; description: string; icon?: string }>) ?? [];

  const resolve = (href: string) => (tenantSlug && !isAdmin) ? `/demo/${tenantSlug}${href}` : href;

  const ICONS: Record<string, JSX.Element> = {
    book: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
      </svg>
    ),
    package: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/>
      </svg>
    ),
    globe: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
      </svg>
    ),
    video: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/>
      </svg>
    ),
    clipboard: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1"/><path d="M9 12h6"/><path d="M9 16h6"/>
      </svg>
    ),
    monitor: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8"/><path d="M12 17v4"/>
      </svg>
    ),
  };

  return (
    <>
      <style>{`
        .edu01srv{position:relative;padding:100px 40px;background:#fff;font-family:${FONT};overflow:hidden;}
        /* dekorativní blob vlevo dole */
        .edu01srv::before{content:'';position:absolute;bottom:0;left:0;width:clamp(280px,26vw,480px);aspect-ratio:1;background:#eef4ff;border-top-right-radius:100%;pointer-events:none;z-index:0;}
        .edu01srv-inner{position:relative;z-index:1;max-width:1280px;margin:0 auto;}
        .edu01srv-head{text-align:center;margin-bottom:64px;}
        .edu01srv-eyebrow{display:inline-block;color:${BLUE};font-size:12px;font-weight:700;letter-spacing:2.5px;text-transform:uppercase;margin-bottom:12px;}
        .edu01srv-head h2{font-family:${FONT};font-size:clamp(1.8rem,3.5vw,2.8rem);font-weight:800;color:${NAVY};margin:0 0 14px;letter-spacing:-0.04em;line-height:1.15;}
        .edu01srv-sub{font-size:clamp(1rem,1.3vw,1.1rem);color:#6b7280;max-width:540px;margin:0 auto;line-height:1.65;}
        .edu01srv-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:20px;}
        .edu01srv-card{padding:32px 28px 28px;border-radius:16px;background:#f8fafc;border:1.5px solid transparent;transition:border-color 0.2s,box-shadow 0.2s,transform 0.2s,background 0.2s;cursor:default;}
        .edu01srv-card:hover{border-color:${BLUE};background:#fff;box-shadow:0 12px 40px rgba(0,89,223,0.1);transform:translateY(-5px);}
        .edu01srv-icon{width:48px;height:48px;border-radius:12px;background:${NAVY};color:#fff;display:flex;align-items:center;justify-content:center;margin-bottom:20px;transition:background 0.2s;}
        .edu01srv-card:hover .edu01srv-icon{background:${BLUE};}
        .edu01srv-card h3{font-family:${FONT};font-size:17px;font-weight:700;color:${NAVY};margin:0 0 10px;line-height:1.3;}
        .edu01srv-card p{font-size:14px;color:#6b7280;line-height:1.65;margin:0 0 18px;}
        .edu01srv-link{display:inline-flex;align-items:center;gap:5px;font-size:13px;font-weight:700;color:${BLUE};text-decoration:none;transition:gap 0.15s;}
        .edu01srv-link:hover{gap:9px;}
        .edu01srv-bottom{margin-top:48px;text-align:center;}
        .edu01srv-cta{display:inline-flex;align-items:center;gap:8px;padding:13px 32px;background:${BLUE};color:#fff;font-family:${FONT};font-size:15px;font-weight:700;border-radius:62px;text-decoration:none;transition:background 0.15s,transform 0.15s;}
        .edu01srv-cta:hover{background:#0032b2;transform:translateY(-2px);}
        @media(max-width:960px){.edu01srv-grid{grid-template-columns:1fr 1fr;}.edu01srv{padding:72px 24px;}}
        @media(max-width:640px){.edu01srv-grid{grid-template-columns:1fr;}.edu01srv-head h2{font-size:1.8rem;}}
      `}</style>

      <section id={String(sectionId)} className="edu01srv" data-template="edu-01-services">
        <div className="edu01srv-inner">
          <div className="edu01srv-head">
            <span className="edu01srv-eyebrow">Vzdělávání</span>
            <h2>
              <GenericEditableText sectionId={sectionId} field="heading" value={heading} tag="span" />
            </h2>
            <p className="edu01srv-sub">
              <GenericEditableText sectionId={sectionId} field="subheading" value={subheading} tag="span" />
            </p>
          </div>

          <div className="edu01srv-grid">
            {services.map((svc, i) => (
              <div key={i} className="edu01srv-card">
                <div className="edu01srv-icon">
                  {ICONS[svc.icon ?? "book"] ?? ICONS["book"]}
                </div>
                <h3>
                  <GenericEditableText sectionId={sectionId} field={`services.${i}.title`} value={svc.title} tag="span" />
                </h3>
                <p>
                  <GenericEditableText sectionId={sectionId} field={`services.${i}.description`} value={svc.description} tag="span" />
                </p>
                <a href={resolve("/sluzby")} className="edu01srv-link">
                  Zjistit více
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                </a>
              </div>
            ))}
          </div>

          <div className="edu01srv-bottom">
            <a href={resolve("/sluzby")} className="edu01srv-cta">
              Zobrazit všechny služby
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
            </a>
          </div>
        </div>
      </section>
    </>
  );
}

// ── kids-01-services ──────────────────────────────────────────────────────────
// 1:1 scioles.cz: bílá sekce, centrovaný heading, 3 karty (obdélník img + title + features)
// Animace: heading fade-up, karty stagger fade-up
// ─────────────────────────────────────────────────────────────────────────────
const SERVICE_IMAGES_K01 = [
  "/clones/scioles/img/scioles-intro-8.jpg",
  "/clones/scioles/img/10.jpg",
  "/clones/scioles/img/scioles-intro-9.jpg",
];

function ServicesKids01({
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

  const heading    = String(content.heading    ?? "Co spolu podnikneme?");
  const subheading = String(content.subheading ?? "Systematicky se s dětmi rozvíjíme a posilujeme jejich odolnost.");
  const items = (content.items as Array<{
    title: string; imageUrl?: string; features?: string[]; linkText?: string; linkHref?: string;
  }>) ?? [];

  function resolve(href: string) {
    if (!tenantSlug || href.startsWith("http")) return href;
    const base = isAdmin ? `/demo/${tenantSlug}/admin` : `/demo/${tenantSlug}`;
    return href === "/" ? base : `${base}${href}`;
  }

  const headRef  = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const [headVis,  setHeadVis]  = useState(false);
  const [cardsVis, setCardsVis] = useState(false);

  useEffect(() => {
    const makeObs = (el: Element | null, set: (v: boolean) => void) => {
      if (!el) return;
      const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { set(true); obs.disconnect(); } }, { threshold: 0.1 });
      obs.observe(el);
      return obs;
    };
    const o1 = makeObs(headRef.current,  setHeadVis);
    const o2 = makeObs(cardsRef.current, setCardsVis);
    return () => { o1?.disconnect(); o2?.disconnect(); };
  }, []);

  return (
    <section data-template="kids-01-services" style={{ background: "#fff", padding: "72px 0", fontFamily: FONT }}>
      <style>{`
        .k01svc-inner{max-width:1140px;margin:0 auto;padding:0 32px;}
        .k01svc-head{text-align:center;max-width:680px;margin:0 auto 56px;}
        .k01svc-head h2{font-size:clamp(1.8rem,3.5vw,2.6rem);font-weight:700;color:${DARK};margin:0 0 14px;font-family:'Gotham Rounded','Nunito',sans-serif;}
        .k01svc-head p{font-size:1.05rem;color:#555;line-height:1.65;margin:0;}
        .k01svc-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:36px;}
        .k01svc-card{text-align:center;transition:opacity .65s ease,transform .65s ease,box-shadow .3s ease;}
        .k01svc-card:hover{transform:translateY(-8px) !important;box-shadow:0 16px 40px rgba(0,155,222,0.14);}
        .k01svc-img-wrap{overflow:hidden;border-radius:4px;}
        .k01svc-img{width:100%;height:180px;object-fit:cover;object-position:center;border-radius:4px;display:block;transition:transform .45s ease;}
        .k01svc-card:hover .k01svc-img{transform:scale(1.07);}
        .k01svc-title{font-size:1.2rem;font-weight:700;color:${DARK};margin:18px 0 12px;letter-spacing:0.3px;transition:color .25s;}
        .k01svc-card:hover .k01svc-title{color:${BLUE};}
        .k01svc-features{list-style:none;padding:0;margin:0 0 16px;display:flex;flex-direction:column;gap:6px;}
        .k01svc-features li{font-size:.95rem;color:#555;line-height:1.5;}
        .k01svc-link{display:inline-block;color:${BLUE};font-weight:600;font-size:.9rem;text-decoration:none;letter-spacing:0.5px;position:relative;}
        .k01svc-link::after{content:'';position:absolute;bottom:-2px;left:0;width:0;height:2px;background:${BLUE};transition:width .25s ease;}
        .k01svc-link:hover::after{width:100%;}
        @media(max-width:768px){.k01svc-grid{grid-template-columns:1fr;gap:40px;}.k01svc-img{height:220px;}}
      `}</style>
      <div className="k01svc-inner">
        <div
          ref={headRef}
          className="k01svc-head"
          style={{ opacity: headVis ? 1 : 0, transform: headVis ? "none" : "translateY(24px)", transition: "opacity .6s ease, transform .6s ease" }}
        >
          <h2><GenericEditableText sectionId={sectionId} field="heading" value={heading} tag="span" /></h2>
          <p><GenericEditableText sectionId={sectionId} field="subheading" value={subheading} tag="span" /></p>
        </div>
        <div className="k01svc-grid" ref={cardsRef}>
          {items.map((item, i) => {
            const img = item.imageUrl || SERVICE_IMAGES_K01[i] || "";
            return (
              <div
                key={i}
                className="k01svc-card"
                style={{ opacity: cardsVis ? 1 : 0, transform: cardsVis ? "none" : "translateY(32px)", transitionDelay: `${i * 130}ms` }}
              >
                {img && (
                  <div className="k01svc-img-wrap">
                    <GenericEditableImage sectionId={sectionId} field={`items.${i}.imageUrl`} src={img} alt={item.title} style={{ width: "100%", height: 180, overflow: "hidden" }}>
                      <img src={img} alt={item.title} className="k01svc-img" loading="lazy" />
                    </GenericEditableImage>
                  </div>
                )}
                <h3 className="k01svc-title">
                  <GenericEditableText sectionId={sectionId} field={`items.${i}.title`} value={item.title} tag="span" />
                </h3>
                {item.features && item.features.length > 0 && (
                  <ul className="k01svc-features">
                    {item.features.map((f, j) => (
                      <li key={j}>
                        <GenericEditableText sectionId={sectionId} field={`items.${i}.features.${j}`} value={f} tag="span" />
                      </li>
                    ))}
                  </ul>
                )}
                {item.linkText && item.linkHref && (
                  <a href={resolve(item.linkHref)} className="k01svc-link">
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

// ── vet-01-services ───────────────────────────────────────────────────────────
// 1:1 veterinafenix.cz:
// - Bg #DCE9EE + texture, padding 150px top / 113px bottom
// - Wave shape dividers top + bottom (bílé)
// - Forum H2 50px #477A88 centrovaně + popis text
// - 4-col 2×2 ikona karty: PNG ikona 70px + Forum H3 #0D7486 + popis
//   (2 vpravo-zarovnané, 2 vlevo-zarovnané — vizuálně symetrické)
// - Fullwidth popis blok + teal CTA dole
// ─────────────────────────────────────────────────────────────────────────────
function ServicesVet01({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const TEAL    = "#0D7486";
  const HEADING = "#477A88";
  const BG      = "#DCE9EE";
  const FONT    = "'Forum', 'Georgia', serif";
  const BODY    = "'Roboto Condensed', 'Roboto', sans-serif";

  const kicker   = String(content.kicker   ?? "Co nabízíme");
  const heading  = String(content.heading  ?? "Naše služby");
  const body     = String(content.body     ?? "Na naší klinice poskytujeme širokou škálu služeb, včetně diagnostiky, prevence, chirurgické léčby a denní hospitalizace.");
  const ctaText  = String(content.ctaText  ?? "Více informací");
  const ctaHref  = String(content.ctaHref  ?? "#kontakt");
  const rawItems = (content.items as Array<{ title?: string; name?: string; description?: string; iconUrl?: string }>) ?? [];

  const DEFAULT_ITEMS = [
    { title: "Diagnostika",   description: "Komplexní vyšetření s využitím laboratorního vybavení přímo na klinice.", iconUrl: "/clones/veterinafenix/img/icon-vet.png" },
    { title: "Prevence",      description: "Očkování, preventivní prohlídky, poradenství v oblasti péče o domácí zvířata.", iconUrl: "/clones/veterinafenix/img/icon-vet-2.png" },
    { title: "Chirurgie",     description: "Plánované i urgentní operace, bezpečné metody sedace.", iconUrl: "/clones/veterinafenix/img/icon-vet-03.png" },
    { title: "Hospitalizace", description: "Denní stacionář s individuálními boxy, kde se zvířata cítí bezpečně.", iconUrl: "/clones/veterinafenix/img/icon-vet-4.png" },
  ];
  const items = rawItems.length > 0 ? rawItems : DEFAULT_ITEMS;

  return (
    <div id={String(sectionId)} data-template="vet-01-services" style={{ fontFamily: BODY }}>
      <style>{`
        /* White header block */
        .vet01srv-header{background:#fff;padding:72px 32px 56px;text-align:center;}
        .vet01srv-header-inner{max-width:800px;margin:0 auto;}
        .vet01srv-kicker{font-family:${BODY};font-size:13px;font-weight:600;letter-spacing:3px;text-transform:uppercase;color:${TEAL};margin:0 0 12px;}
        .vet01srv-heading{font-family:${FONT};font-size:clamp(32px,4vw,50px);font-weight:500;color:${HEADING};margin:0 0 10px;}
        .vet01srv-divider{width:52px;height:3px;background:${TEAL};border-radius:2px;margin:0 auto;}
        /* Teal section */
        .vet01srv-body-section{position:relative;background:${BG};}
        .vet01srv-wave-top{position:absolute;top:0;left:0;right:0;overflow:hidden;line-height:0;}
        .vet01srv-wave-top svg{display:block;width:100%;height:70px;}
        .vet01srv-wave-bot{position:absolute;bottom:0;left:0;right:0;overflow:hidden;line-height:0;}
        .vet01srv-wave-bot svg{display:block;width:100%;height:60px;}
        .vet01srv-inner{max-width:1200px;margin:0 auto;padding:96px 32px 96px;}
        /* Cards grid */
        .vet01srv-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:32px;margin:0 0 52px;}
        @media(max-width:900px){.vet01srv-grid{grid-template-columns:repeat(2,1fr);gap:24px;}}
        @media(max-width:520px){.vet01srv-grid{grid-template-columns:1fr;gap:20px;}}
        .vet01srv-card{background:#fff;border-radius:8px;padding:28px 20px 24px;text-align:center;box-shadow:0 2px 12px rgba(13,116,134,0.08);transition:box-shadow 0.2s,transform 0.2s;}
        .vet01srv-card:hover{box-shadow:0 6px 24px rgba(13,116,134,0.16);transform:translateY(-3px);}
        .vet01srv-card img{width:70px;height:70px;object-fit:contain;margin:0 auto 16px;}
        .vet01srv-card-title{font-family:${FONT};font-size:22px;font-weight:500;color:${TEAL};margin:0 0 10px;}
        .vet01srv-card-desc{font-size:15px;color:#555;line-height:1.6;margin:0;}
        .vet01srv-body{text-align:center;font-size:16px;color:#444;line-height:1.7;max-width:780px;margin:0 auto 32px;}
        .vet01srv-cta{display:inline-block;padding:12px 32px;background:${TEAL};color:#fff;border-radius:6px;font-family:${FONT};font-size:18px;text-decoration:none;transition:background 0.2s;}
        .vet01srv-cta:hover{background:#286C7E;}
        .vet01srv-cta-wrap{text-align:center;}
      `}</style>

      {/* Bílý blok: kicker + heading + divider */}
      <div className="vet01srv-header">
        <div className="vet01srv-header-inner">
          <p className="vet01srv-kicker">
            <GenericEditableText sectionId={sectionId} field="kicker" value={kicker} tag="span" />
          </p>
          <h2 className="vet01srv-heading">
            <GenericEditableText sectionId={sectionId} field="heading" value={heading} tag="span" />
          </h2>
          <div className="vet01srv-divider" />
        </div>
      </div>

      {/* Teal sekce s vlnami */}
      <div className="vet01srv-body-section">
        <div className="vet01srv-wave-top">
          <svg viewBox="0 0 1440 70" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0,0 C360,70 1080,70 1440,0 L1440,0 L0,0 Z" fill="#ffffff"/>
          </svg>
        </div>

        <div className="vet01srv-inner">
          <div className="vet01srv-grid">
            {items.map((item, i) => {
              const label = item.title ?? ("name" in item ? (item as { name?: string }).name : undefined) ?? "";
              return (
              <div key={i} className="vet01srv-card">
                {item.iconUrl && (
                  <GenericEditableImage sectionId={sectionId} field={`items.${i}.iconUrl`} src={item.iconUrl} alt={label} style={{ display: "block", margin: "0 auto 16px" }}>
                    <img loading="lazy" src={item.iconUrl} alt={label} style={{ width: 70, height: 70, objectFit: "contain", display: "block", margin: "0 auto" }} />
                  </GenericEditableImage>
                )}
                <div className="vet01srv-card-title">
                  <GenericEditableText sectionId={sectionId} field={`items.${i}.title`} value={label} tag="span" />
                </div>
                {item.description && (
                  <p className="vet01srv-card-desc">
                    <GenericEditableText sectionId={sectionId} field={`items.${i}.description`} value={item.description} tag="span" />
                  </p>
                )}
              </div>
            );
            })}
          </div>

          <p className="vet01srv-body">
            <GenericEditableText sectionId={sectionId} field="body" value={body} tag="span" />
          </p>
          <div className="vet01srv-cta-wrap">
            <a href={ctaHref} data-btn="primary" className="vet01srv-cta">
              <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
            </a>
          </div>
        </div>

      {/* Wave bottom */}
      <div className="vet01srv-wave-bot">
        <svg viewBox="0 0 1440 70" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0,70 C360,0 1080,0 1440,70 L1440,70 L0,70 Z" fill="#ffffff"/>
        </svg>
      </div>
      </div>{/* /vet01srv-body-section */}
    </div>
  );
}


// ── pethotel-01-services ──────────────────────────────────────────────────────
// 1:1 skolkapropejska.cz services section:
// - Bílé bg, padding 120px 0 90px
// - Centrovaný H2 tmavý 50px Quicksand
// - 3 sloupce: icon PNG (scale hover) + H3 #712419 uppercase 35px + popis 19px + červené CTA
// ─────────────────────────────────────────────────────────────────────────────
function ServicesPethotel01({
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
  const PRIMARY = "#712419";
  const RED     = "#D6123D";
  const FONT    = "'Quicksand', Arial, sans-serif";

  const heading  = String(content.heading ?? "Když chcete pro svého nejlepšího přítele jen to nejlepší");
  const services = (content.services as Array<{
    name: string; iconUrl?: string; title?: string;
    description: string; linkText?: string; linkHref?: string;
  }>) ?? [];

  function resolve(href: string) {
    if (!tenantSlug || href.startsWith("http")) return href;
    const base = isAdmin ? `/demo/${tenantSlug}/admin` : `/demo/${tenantSlug}`;
    return href === "/" ? base : `${base}${href}`;
  }

  return (
    <>
      <style>{`
        .ph01srv { background:#fff; padding:120px 0 90px; font-family:${FONT}; }
        .ph01srv-inner { max-width:1140px; margin:0 auto; padding:0 32px; }
        .ph01srv-title { text-align:center; margin:0 0 75px; color:#000; font-weight:700; font-size:clamp(28px,3.5vw,46px); line-height:1.25; font-family:${FONT}; }
        .ph01srv-grid { display:flex; gap:40px; }
        .ph01srv-col { flex:1; text-align:center; }
        .ph01srv-icon { margin-bottom:25px; display:flex; justify-content:center; align-items:center; }
        .ph01srv-icon img { width:90px; height:90px; object-fit:contain; transition:transform 300ms ease; }
        .ph01srv-col:hover .ph01srv-icon img { transform:scale(1.12); }
        .ph01srv-col h3 { margin:0 0 20px; color:${PRIMARY}; font-size:clamp(20px,2.5vw,32px); text-transform:uppercase; font-weight:700; font-family:${FONT}; line-height:1.2; }
        .ph01srv-col p { margin:0 0 28px; color:${PRIMARY}; font-size:18px; line-height:1.5; font-weight:400; }
        .ph01srv-btn { display:inline-block; padding:12px 32px; background:${RED}; color:#fff; font-family:${FONT}; font-size:16px; font-weight:700; text-decoration:none; border:2px solid ${RED}; border-radius:4px; transition:background .2s,transform .18s; }
        .ph01srv-btn:hover { background:#b80d32; border-color:#b80d32; transform:translateY(-2px); }
        @media(max-width:700px){
          .ph01srv-grid { flex-direction:column; gap:56px; }
          .ph01srv { padding:72px 0 60px; }
        }
      `}</style>
      <section className="ph01srv" data-template="pethotel-01-services">
        <div className="ph01srv-inner">
          <h2 className="ph01srv-title">
            <GenericEditableText sectionId={sectionId} field="heading" value={heading} tag="span" />
          </h2>
          <div className="ph01srv-grid">
            {services.map((svc, i) => (
              <div className="ph01srv-col" key={i}>
                {svc.iconUrl && (
                  <div className="ph01srv-icon">
                    <GenericEditableImage sectionId={sectionId} field={`services.${i}.iconUrl`} src={svc.iconUrl} alt={svc.name}>
                      <img loading="lazy" src={svc.iconUrl} alt={svc.name} />
                    </GenericEditableImage>
                  </div>
                )}
                <h3>
                  <GenericEditableText sectionId={sectionId} field={`services.${i}.title`} value={svc.title ?? svc.name} tag="span" />
                </h3>
                <p>
                  <GenericEditableText sectionId={sectionId} field={`services.${i}.description`} value={svc.description} tag="span" />
                </p>
                {svc.linkText && svc.linkHref && (
                  <a href={resolve(svc.linkHref)} className="ph01srv-btn">
                    <GenericEditableText sectionId={sectionId} field={`services.${i}.linkText`} value={svc.linkText} tag="span" />
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

// ── grooming-01-pricing ───────────────────────────────────────────────────────
// 1:1 cutedogs.cz ceník:
// - bg #fff, border-bottom 2px #f5f5f5, padding 80px
// - Tab selector: Full service / Trimování (gold active, uppercase letter-spacing 1.6px)
// - 3 sloupce; každý item: číslo gold + název + cena vpravo; hover → obrázek plemene
// ─────────────────────────────────────────────────────────────────────────────
function PricingGrooming01({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const [activeTab, setActiveTab] = useState(0);

  const GOLD = "#d0aa57";
  const DARK = "#101417";
  const FONT = "'Hanken Grotesk', 'Inter', sans-serif";

  type PriceItem = { num?: string; name?: string; price?: string; imageUrl?: string };
  type Col       = { heading?: string; items?: PriceItem[] };
  type SvcType   = { label?: string };

  const heading      = String(content.heading ?? "Služby a ceník");
  const kicker       = String(content.kicker  ?? "Ceník");
  const serviceTypes = (content.serviceTypes as SvcType[]) ?? [{ label: "Full service" }, { label: "Trimování" }];
  const cols         = (content.cols     as Col[]) ?? [];
  const trimCols     = (content.trimCols as Col[]) ?? [];
  const activeCols   = activeTab === 0 ? cols : trimCols;

  return (
    <section id="sluzby-a-cenik" data-template="grooming-01-pricing" style={{ background: "#fff", borderBottom: "2px solid #f5f5f5", fontFamily: FONT }}>
      <style>{`
        .gr01pr-inner{max-width:1200px;margin:0 auto;padding:80px 40px;}
        .gr01pr-header{margin-bottom:36px;}
        .gr01pr-kicker{font-size:12px;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:${GOLD};margin:0 0 10px;}
        .gr01pr-h2{font-size:clamp(28px,3.5vw,44px);font-weight:700;color:${DARK};margin:0;}
        .gr01pr-tabs{display:flex;margin-bottom:40px;border-bottom:2px solid #eee;}
        .gr01pr-tab{font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:1.6px;padding:14px 0;margin-right:40px;color:#bbb;cursor:pointer;border:none;border-bottom:2px solid transparent;margin-bottom:-2px;background:none;transition:color 0.2s,border-color 0.2s;}
        .gr01pr-tab.active{color:${GOLD};border-bottom-color:${GOLD};}
        .gr01pr-tab:hover:not(.active){color:${DARK};}
        .gr01pr-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:0 48px;}
        .gr01pr-col-head{font-size:14px;font-weight:600;color:${DARK};margin:0 0 4px;padding-bottom:16px;border-bottom:2px solid #eee;}
        .gr01pr-item{display:flex;align-items:center;border-bottom:2px solid #eee;padding:22px 0;position:relative;overflow:hidden;}
        .gr01pr-item:last-child{border-bottom:none;}
        .gr01pr-num{color:${GOLD};font-weight:700;font-size:13px;margin-right:10px;min-width:22px;flex-shrink:0;}
        .gr01pr-name{flex:1;font-size:16px;font-weight:500;color:${DARK};line-height:1.3;}
        .gr01pr-price{font-size:15px;font-weight:600;color:${DARK};white-space:nowrap;margin-left:12px;transition:opacity 0.15s;}
        .gr01pr-breed-wrap{position:absolute;right:-80px;top:50%;transform:translateY(-50%);width:72px;height:72px;transition:opacity 0.25s,right 0.25s;opacity:0;pointer-events:none;}
        .gr01pr-item:hover .gr01pr-breed-wrap{opacity:1;right:4px;}
        .gr01pr-item:hover .gr01pr-price{opacity:0;}
        .gr01pr-breed{width:100%;height:100%;object-fit:contain;display:block;}
        @media(max-width:800px){
          .gr01pr-grid{grid-template-columns:1fr;}
          .gr01pr-inner{padding:56px 24px;}
        }
      `}</style>

      <div className="gr01pr-inner">
        <div className="gr01pr-header">
          <p className="gr01pr-kicker">
            <GenericEditableText sectionId={sectionId} field="kicker" value={kicker} tag="span" />
          </p>
          <h2 className="gr01pr-h2">
            <GenericEditableText sectionId={sectionId} field="heading" value={heading} tag="span" />
          </h2>
        </div>

        {serviceTypes.length > 1 && (
          <div className="gr01pr-tabs" role="tablist">
            {serviceTypes.map((t, i) => (
              <button
                key={i}
                className={`gr01pr-tab${activeTab === i ? " active" : ""}`}
                onClick={() => setActiveTab(i)}
                role="tab"
                aria-selected={activeTab === i}
              >
                {t.label ?? `Tab ${i + 1}`}
              </button>
            ))}
          </div>
        )}

        <div className="gr01pr-grid">
          {activeCols.map((col, ci) => (
            <div key={ci}>
              {col.heading && <h3 className="gr01pr-col-head">{col.heading}</h3>}
              <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
                {(col.items ?? []).map((item, ii) => (
                  <li key={ii} className="gr01pr-item">
                    {item.num && <span className="gr01pr-num">{item.num}</span>}
                    <span className="gr01pr-name">
                      <GenericEditableText sectionId={sectionId} field={`cols.${ci}.items.${ii}.name`} value={item.name ?? ""} tag="span" />
                    </span>
                    <span className="gr01pr-price">
                      <GenericEditableText sectionId={sectionId} field={`cols.${ci}.items.${ii}.price`} value={item.price ?? ""} tag="span" />
                    </span>
                    {item.imageUrl && (
                      <GenericEditableImage
                        sectionId={sectionId}
                        field={`${activeTab === 0 ? "cols" : "trimCols"}.${ci}.items.${ii}.imageUrl`}
                        src={item.imageUrl}
                        className="gr01pr-breed-wrap"
                      >
                        <img loading="lazy" src={item.imageUrl} alt="" className="gr01pr-breed" aria-hidden="true" />
                      </GenericEditableImage>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── ucetni-02-services ────────────────────────────────────────────────────────
// grantex.cz sector grid:
// - White bg, centered H2 + gold accent + lead
// - 4-col grid of mint #E5ECEA icon cards
// - Hover: card flips to dark green with white icon + text
// ─────────────────────────────────────────────────────────────────────────────
function ServicesUcetni02({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const GREEN  = "#004835";
  const MINT   = "#E5ECEA";
  const GOLD   = "#bca160";
  const FONT_H = "'Montserrat', 'Helvetica Neue', Arial, sans-serif";
  const FONT_B = "'Open Sans', Arial, sans-serif";

  const title = String(content.title ?? "Oborová řešení");
  const lead  = String(content.lead  ?? "Poskytujeme komplexní daňové a účetní poradenství pro podniky napříč všemi odvětvími.");
  const items = (content.items as Array<{ name: string; description?: string; icon?: string }>) ?? [];

  const getIcon = (icon?: string) => {
    const s = { width: 40, height: 40, viewBox: "0 0 24 24", fill: "none", strokeWidth: 1.6, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
    switch (icon) {
      case "heart":       return <svg {...s}><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>;
      case "truck":       return <svg {...s}><rect x="1" y="3" width="15" height="13" rx="1"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>;
      case "settings":    return <svg {...s}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>;
      case "leaf":        return <svg {...s}><path d="M2 2l7.5 7.5M17 3s-9 1-12 10c3.5-1 7-1 10-4 1 3-1 7-1 7s5-3 6-8c0-3-3-5-3-5z"/></svg>;
      case "monitor":     return <svg {...s}><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>;
      case "building":    return <svg {...s}><rect x="4" y="2" width="16" height="20" rx="1"/><path d="M9 22V12h6v10"/><path d="M8 7h.01M12 7h.01M16 7h.01M8 11h.01M16 11h.01"/></svg>;
      case "zap":         return <svg {...s}><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>;
      case "map-pin":     return <svg {...s}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>;
      case "bar-chart":   return <svg {...s}><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/></svg>;
      case "shopping-bag":return <svg {...s}><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>;
      case "home":        return <svg {...s}><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>;
      case "coffee":      return <svg {...s}><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg>;
      default:            return <svg {...s}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><circle cx="12" cy="16" r="0.5" fill="currentColor"/></svg>;
    }
  };

  return (
    <>
      <style>{`
        .ucn02svc-section {
          background: #ffffff;
          padding: 80px 24px;
          font-family: ${FONT_B};
        }
        .ucn02svc-inner { max-width: 1200px; margin: 0 auto; }
        .ucn02svc-header { text-align: center; margin-bottom: 56px; }
        .ucn02svc-h2 {
          font-family: ${FONT_H};
          font-size: clamp(28px, 3vw, 40px);
          font-weight: 700;
          color: ${GREEN};
          margin: 0 0 16px 0;
        }
        .ucn02svc-gold-bar {
          width: 48px; height: 3px;
          background: ${GOLD};
          margin: 0 auto 20px;
          border-radius: 2px;
        }
        .ucn02svc-lead {
          font-family: ${FONT_B};
          font-size: 1rem;
          color: #5a6b66;
          max-width: 600px;
          margin: 0 auto;
          line-height: 1.7;
        }
        .ucn02svc-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
        }
        .ucn02svc-card {
          background: ${MINT};
          border-radius: 8px;
          padding: 32px 20px 28px;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          gap: 16px;
          cursor: default;
          transition: background 0.25s ease, transform 0.2s ease, box-shadow 0.25s ease;
        }
        .ucn02svc-card:hover {
          background: ${GREEN};
          transform: translateY(-3px);
          box-shadow: 0 12px 32px rgba(0,72,53,0.18);
        }
        .ucn02svc-icon {
          width: 56px; height: 56px;
          border-radius: 50%;
          background: rgba(0,72,53,0.1);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: background 0.25s ease;
        }
        .ucn02svc-card:hover .ucn02svc-icon {
          background: rgba(255,255,255,0.15);
        }
        .ucn02svc-icon svg {
          stroke: ${GREEN};
          transition: stroke 0.25s ease;
        }
        .ucn02svc-card:hover .ucn02svc-icon svg {
          stroke: #ffffff;
        }
        .ucn02svc-name {
          font-family: ${FONT_H};
          font-size: 0.9rem;
          font-weight: 600;
          color: ${GREEN};
          margin: 0;
          line-height: 1.35;
          transition: color 0.25s ease;
        }
        .ucn02svc-card:hover .ucn02svc-name {
          color: #ffffff;
        }
        @media (max-width: 1024px) {
          .ucn02svc-grid { grid-template-columns: repeat(3, 1fr); }
        }
        @media (max-width: 700px) {
          .ucn02svc-section { padding: 56px 16px; }
          .ucn02svc-grid { grid-template-columns: repeat(2, 1fr); gap: 12px; }
          .ucn02svc-card { padding: 24px 16px 20px; }
        }
        @media (max-width: 400px) {
          .ucn02svc-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <section id="sluzby" className="ucn02svc-section" data-template="ucetni-02-services">
        <div className="ucn02svc-inner">
          <div className="ucn02svc-header">
            <h2 className="ucn02svc-h2">
              <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
            </h2>
            <div className="ucn02svc-gold-bar" aria-hidden />
            <p className="ucn02svc-lead">
              <GenericEditableText sectionId={sectionId} field="lead" value={lead} tag="span" />
            </p>
          </div>

          <div className="ucn02svc-grid">
            {items.map((item, i) => (
              <div key={i} className="ucn02svc-card">
                <div className="ucn02svc-icon">{getIcon(item.icon)}</div>
                <h3 className="ucn02svc-name">
                  <GenericEditableText sectionId={sectionId} field={`items.${i}.name`} value={String(item.name ?? "")} tag="span" />
                </h3>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

// ─── ucetni-01-services ──────────────────────────────────────────────────────
function ServicesUcetni01({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const YELLOW = "#FFB500";
  const DARK   = "#202124";
  const MUTED  = "#515151";
  const FONT   = "'Space Grotesk', 'Inter', Arial, sans-serif";

  const title = String(content.title ?? "Naše služby");
  const lead  = String(content.lead  ?? "Komplexní účetní a daňové poradenství přizpůsobené vašim potřebám.");
  const items = (content.items as Array<{ name: string; description: string; icon?: string }>) ?? [];

  const iconMap: Record<string, React.ReactNode> = {
    document: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={YELLOW} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
        <line x1="16" y1="13" x2="8" y2="13"/>
        <line x1="16" y1="17" x2="8" y2="17"/>
      </svg>
    ),
    calculator: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={YELLOW} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="4" y="2" width="16" height="20" rx="2"/>
        <line x1="8" y1="6" x2="16" y2="6"/>
        <line x1="8" y1="12" x2="9" y2="12"/>
        <line x1="12" y1="12" x2="13" y2="12"/>
        <line x1="16" y1="12" x2="17" y2="12"/>
        <line x1="8" y1="16" x2="9" y2="16"/>
        <line x1="12" y1="16" x2="13" y2="16"/>
        <line x1="16" y1="16" x2="17" y2="16"/>
      </svg>
    ),
    people: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={YELLOW} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
    chart: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={YELLOW} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10"/>
        <line x1="12" y1="20" x2="12" y2="4"/>
        <line x1="6"  y1="20" x2="6"  y2="14"/>
        <line x1="2"  y1="20" x2="22" y2="20"/>
      </svg>
    ),
  };
  const fallbackIcon = (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={YELLOW} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
    </svg>
  );

  return (
    <section id="sluzby" style={{ backgroundColor: "#ffffff", padding: "5rem 0", fontFamily: FONT }}>
      <style>{`
        .uc01-services-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 24px;
        }
        .uc01-service-card {
          background: linear-gradient(270deg, #F4E4FD00 0%, #FFEEC6 100%);
          border-radius: 8px;
          padding: 32px 24px;
          display: flex;
          flex-direction: column;
          gap: 14px;
          transition: box-shadow 0.2s ease;
        }
        .uc01-service-card:hover {
          box-shadow: 0 4px 20px rgba(255,181,0,0.25);
        }
        @media (max-width: 1024px) {
          .uc01-services-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 640px) {
          .uc01-services-grid { grid-template-columns: 1fr; }
        }
      `}</style>
      <div style={{ maxWidth: 1320, margin: "0 auto", padding: "0 20px" }}>
        <h2 style={{ fontFamily: FONT, fontWeight: 400, fontSize: "3rem", color: DARK, margin: "0 0 12px", lineHeight: 1.2 }}>
          <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
        </h2>
        <p style={{ fontFamily: FONT, fontWeight: 400, fontSize: "1.05rem", color: MUTED, margin: "0 0 48px", lineHeight: 1.65 }}>
          <GenericEditableText sectionId={sectionId} field="lead" value={lead} tag="span" />
        </p>
        <div className="uc01-services-grid">
          {items.map((item, i) => (
            <div key={i} className="uc01-service-card">
              <div style={{ width: 52, height: 52, borderRadius: 8, background: "rgba(255,255,255,0.6)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                {iconMap[item.icon ?? ""] ?? fallbackIcon}
              </div>
              <h3 style={{ fontFamily: FONT, fontWeight: 600, fontSize: "1.15rem", color: DARK, margin: 0, lineHeight: 1.3 }}>
                <GenericEditableText sectionId={sectionId} field={`items.${i}.name`} value={item.name} tag="span" />
              </h3>
              <p style={{ fontFamily: FONT, fontWeight: 400, fontSize: "0.95rem", color: "#000000", margin: 0, lineHeight: 1.65 }}>
                <GenericEditableText sectionId={sectionId} field={`items.${i}.description`} value={item.description} tag="span" />
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── ucetni-03-services ────────────────────────────────────────────────────────
// gpf.cz style: white bg, centered H2 + lead, 4-col icon cards
// Card: white, border #e4e4e4, hover border #002000 + shadow
// Icon: Lucide SVG (28px, green #8ec63f), H3 Montserrat bold, desc Open Sans
// ─────────────────────────────────────────────────────────────────────────────
function ServicesUcetni03({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const DARK   = "#002000";
  const GREEN  = "#8ec63f";
  const FONT_H = "'Montserrat', 'Helvetica Neue', Arial, sans-serif";
  const FONT_B = "'Open Sans', 'Helvetica Neue', Arial, sans-serif";

  const title = String(content.title ?? "Proč zvolit Demo Hypoteční Poradce");
  const lead  = String(content.lead  ?? "Nabízíme komplexní hypoteční poradenství — vše zařídíme za vás, zdarma.");

  type SvcItem = { name?: string; description?: string; icon?: string };
  const rawItems = (content.items as SvcItem[]) ?? [];
  const items = rawItems.length > 0 ? rawItems : [
    { name: "Kompletní servis",      description: "Veškerou komunikaci s bankou a přípravu dokumentů zajistíme za vás.", icon: "briefcase" },
    { name: "Nejlepší podmínky",     description: "Porovnáváme nabídky všech velkých bank. Vždy nejlepší úroková sazba.", icon: "trending-down" },
    { name: "Poradenství zdarma",    description: "Naše služby jsou pro vás zcela bezplatné. Odměnu dostáváme od banky.", icon: "check-circle" },
    { name: "1 800 poradců po celé ČR", description: "Máme pobočky ve všech krajích. Váš poradce je vždy nablízku.", icon: "map-pin" },
  ];

  const ICONS: Record<string, string> = {
    briefcase:     `<path d="M20 7H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>`,
    "trending-down": `<polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/><polyline points="17 18 23 18 23 12"/>`,
    "check-circle": `<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>`,
    "map-pin":      `<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>`,
    shield:         `<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>`,
    star:           `<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>`,
    zap:            `<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>`,
    users:          `<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>`,
  };

  const getIcon = (name?: string) => {
    const d = ICONS[name ?? ""] ?? ICONS["briefcase"];
    return `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="${GREEN}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;
  };

  return (
    <>
      <style>{`
        .ucn03svc-section {
          background: #ffffff;
          padding: 80px 40px;
          font-family: ${FONT_B};
        }
        .ucn03svc-inner { max-width: 1200px; margin: 0 auto; }
        .ucn03svc-header { text-align: center; margin-bottom: 56px; }
        .ucn03svc-kicker {
          display: inline-block;
          font-size: 0.78rem;
          font-weight: 700;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          color: ${GREEN};
          margin-bottom: 12px;
        }
        .ucn03svc-h2 {
          font-family: ${FONT_H};
          font-size: clamp(1.6rem, 2.5vw, 2.2rem);
          font-weight: 800;
          color: ${DARK};
          margin: 0 0 16px 0;
          line-height: 1.2;
        }
        .ucn03svc-lead {
          font-size: 1.05rem;
          color: #737b79;
          max-width: 600px;
          margin: 0 auto;
          line-height: 1.65;
        }
        .ucn03svc-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 24px;
        }
        .ucn03svc-card {
          background: #ffffff;
          border: 1px solid #e4e4e4;
          border-radius: 12px;
          padding: 32px 24px;
          transition: border-color 0.2s, box-shadow 0.2s, transform 0.2s;
        }
        .ucn03svc-card:hover {
          border-color: ${DARK};
          box-shadow: 0 8px 28px rgba(0,32,0,0.1);
          transform: translateY(-3px);
        }
        .ucn03svc-icon {
          width: 52px;
          height: 52px;
          background: #f0f7e6;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 20px;
        }
        .ucn03svc-name {
          font-family: ${FONT_H};
          font-size: 1rem;
          font-weight: 700;
          color: ${DARK};
          margin: 0 0 10px 0;
          line-height: 1.3;
        }
        .ucn03svc-desc {
          font-size: 0.88rem;
          color: #737b79;
          line-height: 1.65;
          margin: 0;
        }
        @media (max-width: 1000px) { .ucn03svc-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 600px) {
          .ucn03svc-section { padding: 56px 20px; }
          .ucn03svc-grid { grid-template-columns: 1fr; gap: 16px; }
        }
      `}</style>

      <section className="ucn03svc-section" data-template="ucetni-03-services">
        <div className="ucn03svc-inner">
          <div className="ucn03svc-header">
            <span className="ucn03svc-kicker">Naše výhody</span>
            <h2 className="ucn03svc-h2">
              <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
            </h2>
            <p className="ucn03svc-lead">
              <GenericEditableText sectionId={sectionId} field="lead" value={lead} tag="span" />
            </p>
          </div>

          <div className="ucn03svc-grid">
            {items.map((item, i) => (
              <div key={i} className="ucn03svc-card">
                <div
                  className="ucn03svc-icon"
                  dangerouslySetInnerHTML={{ __html: getIcon(item.icon) }}
                />
                <h3 className="ucn03svc-name">
                  <GenericEditableText sectionId={sectionId} field={`items.${i}.name`} value={String(item.name ?? "")} tag="span" />
                </h3>
                <p className="ucn03svc-desc">
                  <GenericEditableText sectionId={sectionId} field={`items.${i}.description`} value={String(item.description ?? "")} tag="span" />
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

// ── solar-01-services ─────────────────────────────────────────────────────────
// solar-01 — Premium 3-col service showcase for B2B solar.
// Light surface bg w/ ambient orange glow, editorial header (conditional).
// Each card: 16:10 product image + numbered pill top-left + floating orange
// icon bottom-right (overlaps into body) + name + description + bullets w/
// gradient check icons + footer with price tag + pill CTA.
// Sequenced fade-up reveal (staggered 0.1 → 0.34s).
// ─────────────────────────────────────────────────────────────────────────────
function ServicesSolar01({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  type SvcItem = {
    icon?: string;
    name?: string;
    description?: string;
    bullets?: string[];
    image?: string;
    imageAlt?: string;
    priceLabel?: string;
    priceValue?: string;
    ctaLabel?: string;
    ctaHref?: string;
  };
  const rawItems = ((content.items as SvcItem[]) ?? []).slice(0, 3);
  const items: SvcItem[] = rawItems.length > 0 ? rawItems : [
    {
      icon: "battery",
      name: "Fotovoltaika s baterií",
      description: "Maximální energetická nezávislost díky kombinaci solárních panelů a bateriového úložiště pro noční provoz.",
      bullets: ["Panely 415–475 Wp", "Baterie 8–30 kWh", "Chytré řízení spotřeby"],
      image: "/assets/solar-01/service-battery.webp",
      imageAlt: "Fotovoltaika s bateriovým úložištěm",
      priceLabel: "Od",
      priceValue: "250 000 Kč",
      ctaLabel: "Zjistit více",
      ctaHref: "/sluzby",
    },
    {
      icon: "grid",
      name: "Fotovoltaika do sítě",
      description: "Ekonomická varianta s prodejem přebytků do distribuční sítě a virtuální baterií u dodavatele.",
      bullets: ["Návratnost 5–7 let", "Bez starosti s údržbou", "Rychlá instalace 5–7 dní"],
      image: "/assets/solar-01/service-grid.webp",
      imageAlt: "Fotovoltaika napojená do sítě",
      priceLabel: "Od",
      priceValue: "150 000 Kč",
      ctaLabel: "Zjistit více",
      ctaHref: "/sluzby",
    },
    {
      icon: "heat",
      name: "Tepelná čerpadla",
      description: "Efektivní vytápění a příprava teplé vody v kombinaci s fotovoltaikou pro téměř nulové provozní náklady.",
      bullets: ["Výkon 6–20 kW", "Topný faktor COP až 5", "Chlazení v létě"],
      image: "/assets/solar-01/service-heatpump.webp",
      imageAlt: "Tepelné čerpadlo venkovní jednotka",
      priceLabel: "Od",
      priceValue: "180 000 Kč",
      ctaLabel: "Zjistit více",
      ctaHref: "/sluzby",
    },
  ];

  const eyebrowRaw  = (content as Record<string, unknown>).eyebrow;
  const titleRaw    = (content as Record<string, unknown>).title;
  const subtitleRaw = (content as Record<string, unknown>).subtitle;
  const eyebrow     = eyebrowRaw  === undefined ? "Co pro vás uděláme" : String(eyebrowRaw);
  const title       = titleRaw    === undefined ? "Řešení postavená na míru" : String(titleRaw);
  const subtitle    = subtitleRaw === undefined ? "Komplexní služby pro rodinné domy i firmy — od výběru vhodné technologie po instalaci na klíč a servis." : String(subtitleRaw);
  const showHeader  = !!(eyebrow.trim() || title.trim() || subtitle.trim());

  const IconArrow = ({ size = 14 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
    </svg>
  );
  const IconCheck = ({ size = 12 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  );

  const serviceIcon = (key?: string) => {
    switch (key) {
      case "battery":
        return (
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <rect x="2" y="7" width="18" height="10" rx="2"/>
            <line x1="22" y1="11" x2="22" y2="13"/>
            <line x1="6" y1="11" x2="6" y2="13"/>
            <line x1="10" y1="11" x2="10" y2="13"/>
            <line x1="14" y1="11" x2="14" y2="13"/>
          </svg>
        );
      case "grid":
        return (
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
          </svg>
        );
      case "heat":
        return (
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M8 2s3 2 3 5-3 5-3 5 3 2 3 5-3 5-3 5"/>
            <path d="M16 2s3 2 3 5-3 5-3 5 3 2 3 5-3 5-3 5"/>
          </svg>
        );
      default:
        return (
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="4"/>
            <path d="M12 2v3m0 14v3M4.22 4.22l2.12 2.12m11.32 11.32l2.12 2.12M2 12h3m14 0h3M4.22 19.78l2.12-2.12m11.32-11.32l2.12-2.12"/>
          </svg>
        );
    }
  };

  return (
    <section className="s01sv" id="sluzby" data-template="solar-01">
      <div className="s01sv-bg-grid" aria-hidden="true" />
      <div className="s01sv-inner">
        {showHeader && (
          <div className="s01sv-head">
            {eyebrow.trim() && (
              <span className="s01sv-eyebrow">
                <span className="s01sv-eyebrow-dot" />
                <GenericEditableText sectionId={sectionId} field="eyebrow" value={eyebrow} tag="span" />
              </span>
            )}
            {title.trim() && (
              <h2 className="s01sv-title">
                <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
              </h2>
            )}
            {subtitle.trim() && (
              <p className="s01sv-sub">
                <GenericEditableText sectionId={sectionId} field="subtitle" value={subtitle} tag="span" />
              </p>
            )}
          </div>
        )}

        <div className="s01sv-grid">
          {items.map((it, i) => {
            const img = String(it.image ?? "");
            const ctaHref = String(it.ctaHref ?? "/sluzby");
            return (
              <article className="s01sv-card" key={i}>
                <div className="s01sv-img">
                  <span className="s01sv-num">{`0${i + 1}`.slice(-2)} — Služba</span>
                  {img ? (
                    <GenericEditableImage sectionId={sectionId} field={`items.${i}.image`} src={img}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={img} alt={String(it.imageAlt ?? it.name ?? "")} loading="lazy" />
                    </GenericEditableImage>
                  ) : null}
                  <span className="s01sv-icon" aria-hidden="true">{serviceIcon(it.icon)}</span>
                </div>

                <div className="s01sv-body">
                  <h3 className="s01sv-name">
                    <GenericEditableText sectionId={sectionId} field={`items.${i}.name`} value={it.name ?? ""} tag="span" />
                  </h3>
                  <p className="s01sv-desc">
                    <GenericEditableText sectionId={sectionId} field={`items.${i}.description`} value={it.description ?? ""} tag="span" />
                  </p>

                  {(it.bullets ?? []).length > 0 && (
                    <ul className="s01sv-bullets">
                      {(it.bullets ?? []).map((b, j) => (
                        <li className="s01sv-bullet" key={j}>
                          <span className="s01sv-bullet-check"><IconCheck /></span>
                          <GenericEditableText sectionId={sectionId} field={`items.${i}.bullets.${j}`} value={b} tag="span" />
                        </li>
                      ))}
                    </ul>
                  )}

                  <div className="s01sv-foot">
                    <div className="s01sv-price">
                      <span className="s01sv-price-lbl">
                        <GenericEditableText sectionId={sectionId} field={`items.${i}.priceLabel`} value={String(it.priceLabel ?? "Od")} tag="span" />
                      </span>
                      <span className="s01sv-price-val">
                        <GenericEditableText sectionId={sectionId} field={`items.${i}.priceValue`} value={String(it.priceValue ?? "")} tag="span" />
                      </span>
                    </div>
                    <a href={ctaHref} className="s01sv-cta">
                      <GenericEditableText sectionId={sectionId} field={`items.${i}.ctaLabel`} value={String(it.ctaLabel ?? "Zjistit více")} tag="span" />
                      <span className="s01sv-cta-arrow"><IconArrow /></span>
                    </a>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ── ucetni-04-services ────────────────────────────────────────────────────────
// 1:1 bcas.cz crossSection:
// bg: #FBF6EE, heading 1.5em 600, grid auto-fit minmax(15em,1fr) gap 8px
// cross__link: grid 36px 1fr 24px, padding 20px, bg #FBF6EE, border-radius 2px
// icon 36px navy #003366, text #171F22 1.125em 600, arrow #486A72
// hover: bg white, subtle shadow
// fade-in stagger animace při vstupu do viewportu
// ─────────────────────────────────────────────────────────────────────────────
function ServicesUcetni04({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const BG    = "#FBF6EE";
  const NAVY  = "#003366";
  const DARK  = "#171F22";
  const MUTED = "#486A72";
  const FONT  = "'Plus Jakarta Sans', Arial, 'Helvetica Neue', sans-serif";

  const heading    = String(content.heading    ?? "Co s námi řešíte?");
  const subheading = String(content.subheading ?? "Dopřejte si péči konzultantů z oboru financí a realit. Nabízíme komplexní řešení pro každou životní situaci.");
  const rawItems   = Array.isArray(content.items) ? content.items as Array<{ icon?: string; title?: string; description?: string; href?: string }> : [];
  const items      = rawItems.length > 0 ? rawItems : [
    { icon: "Home",       title: "Hypotéky & Reality",     description: "Pomůžeme vám najít nejlepší hypotéku a provést celým procesem koupě nebo prodeje nemovitosti.", href: "/" },
    { icon: "Shield",     title: "Pojištění",               description: "Zajistíme vás a vaši rodinu pro případ nečekaných situací. Porovnáme nabídky všech pojišťoven na trhu.", href: "/" },
    { icon: "TrendingUp", title: "Investice & Spoření",     description: "Zhodnotíme vaše úspory a nastavíme investiční strategii odpovídající vašim cílům.", href: "/" },
    { icon: "FileText",   title: "Finanční plánování",      description: "Vytvoříme komplexní finanční plán pro vaši rodinu – od spoření na penzi až po zabezpečení dětí.", href: "/" },
  ];

  const sectionRef = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } }, { threshold: 0.15 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // Inline SVG icons (subset of Lucide)
  const icons: Record<string, string> = {
    Home:       `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`,
    Shield:     `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`,
    TrendingUp: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>`,
    FileText:   `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>`,
    ArrowRight: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>`,
  };

  return (
    <>
      <style>{`
        .ucn04svc { background: ${BG}; font-family: ${FONT}; }
        .ucn04svc-inner {
          max-width: 1296px;
          margin: 0 auto;
          padding: clamp(48px,5vw,80px) 24px clamp(48px,5vw,80px);
        }
        .ucn04svc-hdr { margin-bottom: 8px; }
        .ucn04svc-h2 {
          font-size: clamp(22px,2.5vw,32px);
          font-weight: 600;
          color: ${DARK};
          letter-spacing: -0.025em;
          margin: 0 0 10px;
        }
        .ucn04svc-sub {
          font-size: 15px;
          color: ${MUTED};
          line-height: 1.6;
          margin: 0 0 clamp(24px,3vw,40px);
          max-width: 56em;
        }
        .ucn04svc-grid {
          list-style: none;
          margin: 0;
          padding: 0;
          display: grid;
          gap: 16px;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
        }
        .ucn04svc-item {
          display: flex;
          align-items: stretch;
          opacity: 0;
          transform: translateY(16px);
          transition: opacity 0.45s ease, transform 0.45s ease;
        }
        .ucn04svc-item.ucn04svc-vis {
          opacity: 1;
          transform: translateY(0);
        }
        .ucn04svc-link {
          padding: 28px 24px;
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 12px;
          color: ${DARK};
          text-decoration: none;
          border-radius: 8px;
          background: white;
          border: 1px solid #E8E4DC;
          transition: box-shadow 0.2s, transform 0.2s, border-color 0.2s;
        }
        .ucn04svc-link:hover {
          box-shadow: 0 6px 24px rgba(0,51,102,0.10);
          transform: translateY(-3px);
          border-color: rgba(27,58,107,0.2);
        }
        .ucn04svc-ico {
          width: 48px;
          height: 48px;
          background: rgba(27,58,107,0.08);
          border-radius: 10px;
          color: ${NAVY};
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .ucn04svc-text {
          font-size: 1rem;
          font-weight: 700;
          color: ${DARK};
          line-height: 1.3;
        }
        .ucn04svc-desc {
          font-size: 0.88rem;
          color: ${MUTED};
          line-height: 1.65;
          flex: 1;
        }
        .ucn04svc-arrow {
          color: ${NAVY};
          display: flex;
          align-items: center;
          margin-top: 4px;
          transition: transform 0.15s;
        }
        .ucn04svc-link:hover .ucn04svc-arrow {
          transform: translateX(4px);
        }
        @media (max-width: 640px) {
          .ucn04svc-grid { grid-template-columns: 1fr; }
        }
        @media (max-width: 400px) {
          .ucn04svc-link { padding: 20px 18px; }
        }
      `}</style>
      <section ref={sectionRef} id="sluzby" className="ucn04svc" data-template="ucetni-04-services">
        <div className="ucn04svc-inner">
          <div className="ucn04svc-hdr">
            <h2 className="ucn04svc-h2">
              <GenericEditableText sectionId={sectionId} field="heading" value={heading} tag="span" />
            </h2>
            <p className="ucn04svc-sub">
              <GenericEditableText sectionId={sectionId} field="subheading" value={subheading} tag="span" />
            </p>
          </div>
          <ol className="ucn04svc-grid">
            {items.map((item, i) => (
              <li
                key={i}
                className={`ucn04svc-item${visible ? " ucn04svc-vis" : ""}`}
                style={{ transitionDelay: `${i * 80}ms` }}
              >
                <a href={item.href ?? "/"} className="ucn04svc-link">
                  <span
                    className="ucn04svc-ico"
                    dangerouslySetInnerHTML={{ __html: icons[item.icon ?? ""] ?? icons.Home }}
                  />
                  <span className="ucn04svc-text">
                    <GenericEditableText sectionId={sectionId} field={`items.${i}.title`} value={String(item.title ?? "")} tag="span" />
                  </span>
                  <span className="ucn04svc-desc">
                    <GenericEditableText sectionId={sectionId} field={`items.${i}.description`} value={String(item.description ?? "")} tag="span" />
                  </span>
                  <span className="ucn04svc-arrow" dangerouslySetInnerHTML={{ __html: icons.ArrowRight }} />
                </a>
              </li>
            ))}
          </ol>
        </div>
      </section>
    </>
  );
}

// ── clean-01-services ─────────────────────────────────────────────────────────
// Horizontální service nav bar: tmavé pozadí #0d1a20, 5 dlaždic s SVG ikonou
// + název + popis, na hover zelený akcent. Scrollovatelný na mobile.
// ─────────────────────────────────────────────────────────────────────────────
function ServicesClean01({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const GREEN = "#69be28";
  const DARK  = "#0d1a20";
  const FONT  = "Arial, Helvetica, sans-serif";

  const title    = String(content.title    ?? "Naše služby");
  const subtitle = String(content.subtitle ?? "Komplexní úklidové a doplňkové služby pro průmyslové provozy, kanceláře, školy a další instituce.");
  const eyebrow  = String(content.eyebrow  ?? "Co nabízíme");

  type Item = { icon?: string; name?: string; description?: string };
  const items = (content.items as Item[] | undefined) ?? [];

  // SVG ikony z /clones/cleancat/img/
  const iconMap: Record<string, string> = {
    "🤖": "/clones/cleancat/img/cisteni.svg",
    "🧹": "/clones/cleancat/img/uklidove-nove.svg",
    "✨": "/clones/cleancat/img/specialni.svg",
    "⚙️": "/clones/cleancat/img/cisteni.svg",
    "🛡️": "/clones/cleancat/img/bezpecnostni.svg",
  };

  const styles = `
    .c01svc-section {
      background: ${DARK};
      font-family: ${FONT};
      padding: 4rem 1.5rem;
    }
    .c01svc-header {
      text-align: center;
      margin-bottom: 3rem;
    }
    .c01svc-eyebrow {
      display: inline-block;
      font-size: 0.78rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.14em;
      color: ${GREEN};
      margin-bottom: 0.75rem;
    }
    .c01svc-title {
      font-size: clamp(1.6rem, 3vw, 2.4rem);
      font-weight: 700;
      color: #ffffff;
      margin: 0 0 0.75rem;
    }
    .c01svc-subtitle {
      font-size: 1rem;
      color: rgba(255,255,255,0.6);
      max-width: 640px;
      margin: 0 auto;
      line-height: 1.6;
    }
    .c01svc-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 0;
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 4px;
      overflow: hidden;
      max-width: 1100px;
      margin: 0 auto;
    }
    .c01svc-tile {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      padding: 2.2rem 1.2rem 2rem;
      border-right: 1px solid rgba(255,255,255,0.08);
      transition: background 0.2s;
      cursor: default;
    }
    .c01svc-tile:last-child { border-right: none; }
    .c01svc-tile:hover { background: rgba(105,190,40,0.08); }
    .c01svc-icon {
      width: 64px;
      height: 64px;
      margin-bottom: 1.1rem;
      filter: brightness(0) invert(1);
      transition: filter 0.2s;
    }
    .c01svc-tile:hover .c01svc-icon {
      filter: brightness(0) saturate(100%) invert(60%) sepia(60%) saturate(600%) hue-rotate(60deg) brightness(1.1);
    }
    .c01svc-name {
      font-size: 0.95rem;
      font-weight: 700;
      color: #ffffff;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      margin-bottom: 0.5rem;
      line-height: 1.3;
    }
    .c01svc-desc {
      font-size: 0.82rem;
      color: rgba(255,255,255,0.5);
      line-height: 1.5;
    }
    @media (max-width: 47.99rem) {
      .c01svc-grid {
        grid-template-columns: 1fr 1fr;
      }
      .c01svc-tile {
        border-bottom: 1px solid rgba(255,255,255,0.08);
        border-right: none;
      }
      .c01svc-tile:nth-child(odd):not(:last-child) { border-right: 1px solid rgba(255,255,255,0.08); }
    }
  `;

  return (
    <section id="sluzby" className="c01svc-section">
      <style>{styles}</style>
      <div className="c01svc-header">
        <span className="c01svc-eyebrow">
          <GenericEditableText sectionId={sectionId} field="eyebrow" value={eyebrow} tag="span" />
        </span>
        <h2 className="c01svc-title">
          <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
        </h2>
        <p className="c01svc-subtitle">
          <GenericEditableText sectionId={sectionId} field="subtitle" value={subtitle} tag="span" />
        </p>
      </div>
      <div className="c01svc-grid">
        {items.map((item, i) => {
          const icon = String(item.icon ?? "🧹");
          const iconSrc = iconMap[icon] ?? "/clones/cleancat/img/uklidove-nove.svg";
          return (
            <div key={i} className="c01svc-tile">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img loading="lazy" src={iconSrc} alt="" className="c01svc-icon" width={64} height={64} />
              <div className="c01svc-icon-label" style={{ display: "none" }}>
                <GenericEditableText sectionId={sectionId} field={`items.${i}.icon`} value={icon} tag="span" />
              </div>
              <div className="c01svc-name">
                <GenericEditableText sectionId={sectionId} field={`items.${i}.name`} value={String(item.name ?? "")} tag="span" />
              </div>
              <div className="c01svc-desc">
                <GenericEditableText sectionId={sectionId} field={`items.${i}.description`} value={String(item.description ?? "")} tag="span" />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

// ─── instala-02 Services ─────────────────────────────────────────────────────
function ServicesInstala02({ content, sectionId, tenantSlug, isAdmin }: { content: Record<string, unknown>; sectionId: number; tenantSlug?: string; isAdmin?: boolean }) {
  const c = content as Record<string, unknown>;

  const RED    = "#ee4036";
  const DARK   = "#111111";
  const WHITE  = "#ffffff";
  const FONT_H = "'Montserrat', sans-serif";
  const FONT_B = "'Roboto', sans-serif";

  const kicker   = String(c.kicker   ?? "Co umíme");
  const title    = String(c.title    ?? "Veškeré topenářské a instalatérské služby");
  const subtitle = String(c.subtitle ?? "Havárie, rekonstrukce i nové instalace — od kotle přes tepelná čerpadla až po elektroinstalaci.");
  const items    = (c.items as Array<{ title: string; description: string; ctaText: string; ctaHref: string; icon: string; image: string }>) ?? [];

  const iconPaths: Record<string, React.ReactNode> = {
    flame:       <path d="M12 2c0 6-6 8-6 14a6 6 0 0 0 12 0c0-6-6-8-6-14z M9.5 14.5c0 1.38 1.12 2.5 2.5 2.5s2.5-1.12 2.5-2.5c0-2.5-2.5-3.5-2.5-5 0 1.5-2.5 2.5-2.5 5z" fill="none" stroke={WHITE} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>,
    thermometer: <><path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z" fill="none" stroke={WHITE} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></>,
    droplets:    <><path d="M7 16.3c2.2 0 4-1.83 4-4.05 0-1.16-.57-2.26-1.71-3.19S7.29 6.75 7 5.3c-.29 1.45-1.14 2.84-2.29 3.76S3 11.1 3 12.25c0 2.22 1.8 4.05 4 4.05z" fill="none" stroke={WHITE} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/><path d="M12.56 6.6A10.97 10.97 0 0 0 14 3.02c.5 2.5 2 4.9 3 5.5 2 1.2 3 2.5 3 4.5a6 6 0 0 1-6 6 4.5 4.5 0 0 1-4.5-4.5" fill="none" stroke={WHITE} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></>,
    zap:         <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" fill="none" stroke={WHITE} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>,
    settings:    <><circle cx="12" cy="12" r="3" fill="none" stroke={WHITE} strokeWidth="1.8"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" fill="none" stroke={WHITE} strokeWidth="1.8"/></>,
  };

  return (
    <section
      id="sluzby"
      data-template="instala-02-services"
      style={{ backgroundColor: "#0e0e0e", fontFamily: FONT_B, padding: "96px 0" }}
    >
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Montserrat:wght@600;700;800&family=Roboto:wght@400;500&display=swap" />
      <style>{`        .i2s-outer   { max-width: 1280px; margin: 0 auto; padding: 0 48px; }
        .i2s-header  { text-align: center; margin-bottom: 56px; }
        .i2s-kicker  { font-family: ${FONT_H}; font-size: 11px; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: ${RED}; margin: 0 0 14px; display: flex; align-items: center; justify-content: center; gap: 12px; }
        .i2s-kicker::before, .i2s-kicker::after { content: ''; display: inline-block; width: 32px; height: 2px; background: ${RED}; }
        .i2s-h2      { font-family: ${FONT_H}; font-size: clamp(26px, 3vw, 42px); font-weight: 800; color: ${WHITE}; line-height: 1.15; margin: 0 0 14px; }
        .i2s-sub     { font-size: 16px; color: #999; max-width: 640px; margin: 0 auto; line-height: 1.65; }

        /* grid: 3 cols top row, 2 cols bottom row via auto-fit */
        .i2s-grid    { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }

        /* card */
        .i2s-card    { position: relative; border-radius: 14px; overflow: hidden; height: 380px; display: flex; flex-direction: column; justify-content: flex-end; cursor: default; }
        .i2s-card-bg { position: absolute; inset: 0; z-index: 0; transition: transform .45s cubic-bezier(.25,.46,.45,.94); }
        .i2s-card:hover .i2s-card-bg { transform: scale(1.06); }
        .i2s-card-overlay { position: absolute; inset: 0; z-index: 1; background: linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.40) 50%, rgba(0,0,0,0.10) 100%); transition: background .3s; }
        .i2s-card:hover .i2s-card-overlay { background: linear-gradient(to top, rgba(180,28,28,0.82) 0%, rgba(0,0,0,0.50) 55%, rgba(0,0,0,0.12) 100%); }
        .i2s-card-body { position: relative; z-index: 2; padding: 28px 28px 24px; }
        .i2s-card-icon { width: 40px; height: 40px; background: ${RED}; border-radius: 8px; display: flex; align-items: center; justify-content: center; margin-bottom: 14px; transition: background .3s; }
        .i2s-card:hover .i2s-card-icon { background: ${WHITE}; }
        .i2s-card-title { font-family: ${FONT_H}; font-size: 18px; font-weight: 800; color: ${WHITE}; margin: 0 0 8px; line-height: 1.2; }
        .i2s-card-desc  { font-size: 13px; color: rgba(255,255,255,0.75); line-height: 1.6; margin: 0 0 16px; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
        .i2s-card-cta   { font-family: ${FONT_H}; font-size: 12px; font-weight: 700; color: ${RED}; letter-spacing: 0.08em; text-transform: uppercase; text-decoration: none; display: inline-flex; align-items: center; gap: 6px; transition: color .2s, gap .2s; }
        .i2s-card:hover .i2s-card-cta { color: ${WHITE}; gap: 10px; }

        /* last row centering — if 5 items, make last 2 span differently */
        .i2s-grid .i2s-card:nth-child(4) { grid-column: 1 / 2; }
        .i2s-grid .i2s-card:nth-child(5) { grid-column: 2 / 3; }

        @media (max-width: 960px) {
          .i2s-outer { padding: 0 20px !important; }
          .i2s-grid  { grid-template-columns: 1fr 1fr !important; }
          .i2s-grid .i2s-card:nth-child(4), .i2s-grid .i2s-card:nth-child(5) { grid-column: auto !important; }
          .i2s-card  { height: 300px !important; }
        }
        @media (max-width: 600px) {
          .i2s-grid  { grid-template-columns: 1fr !important; }
          .i2s-card  { height: 280px !important; }
        }
      `}</style>

      <div className="i2s-outer">
        <div className="i2s-header">
          <p className="i2s-kicker">
            <GenericEditableText sectionId={sectionId} field="kicker" value={kicker} tag="span" />
          </p>
          <h2 className="i2s-h2">
            <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
          </h2>
          <p className="i2s-sub">
            <GenericEditableText sectionId={sectionId} field="subtitle" value={subtitle} tag="span" />
          </p>
        </div>

        <div className="i2s-grid">
          {items.map((item, i) => (
            <div key={i} className="i2s-card">
              {/* background image */}
              <GenericEditableImage
                sectionId={sectionId} field={`items.${i}.image`} src={item.image} alt={item.title}
                className="i2s-card-bg" style={{ position: "absolute", inset: 0 }}
              >
                <Image
                  src={item.image} alt={item.title} fill className="object-cover"
                  sizes="(max-width:600px) 100vw, (max-width:960px) 50vw, 33vw"
                  unoptimized={shouldSkipNextImageOptimization(item.image)}
                />
              </GenericEditableImage>

              <div className="i2s-card-overlay" />

              <div className="i2s-card-body">
                <div className="i2s-card-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    {iconPaths[item.icon] ?? iconPaths.settings}
                  </svg>
                </div>
                <h3 className="i2s-card-title">
                  <GenericEditableText sectionId={sectionId} field={`items.${i}.title`} value={item.title} tag="span" />
                </h3>
                <p className="i2s-card-desc">
                  <GenericEditableText sectionId={sectionId} field={`items.${i}.description`} value={item.description} tag="span" />
                </p>
                <a href={item.ctaHref} data-btn="primary" className="i2s-card-cta">
                  <GenericEditableText sectionId={sectionId} field={`items.${i}.ctaText`} value={item.ctaText} tag="span" />
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── klima-01-services ─────────────────────────────────────────────────────────
// 1:1 pragoclima.cz: bílé bg, eyebrow + title + subtitle nahoře na střed,
// 3×2 grid karet — každá má emoji ikonu, tučný nadpis, popis. Hover: červený border.
// ─────────────────────────────────────────────────────────────────────────────
function ServicesKlima01({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  type Item = { icon?: string; name?: string; description?: string };
  const eyebrow = String(content.eyebrow  ?? "Co nabízíme");
  const title   = String(content.title    ?? "Služby v oblasti klimatizací a tepelných čerpadel");
  const subtitle= String(content.subtitle ?? "Komplexní servis od návrhu po montáž i dlouhodobou péči o vaše zařízení.");
  const items   = ((content.items as Item[]) ?? []).slice(0, 6);

  const RED  = "#e30016";
  const NAVY = "#182545";
  const FONT = "'Outfit', -apple-system, sans-serif";

  return (
    <>
    <style>{`
      @media (max-width: 768px) {
        .klima-services-grid { grid-template-columns: 1fr !important; }
      }
      @media (min-width: 481px) and (max-width: 768px) {
        .klima-services-grid { grid-template-columns: repeat(2, 1fr) !important; }
      }
    `}</style>
    <section
      style={{ backgroundColor: "#fff", padding: "80px 24px", fontFamily: FONT }}
      data-template="klima-01"
    >
      {/* Header */}
      <div style={{ textAlign: "center", maxWidth: 680, margin: "0 auto 56px" }}>
        <p style={{ fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.12em", color: RED, margin: "0 0 10px" }}>
          <GenericEditableText sectionId={sectionId} field="eyebrow" value={eyebrow} tag="span" />
        </p>
        <h2 style={{ fontSize: "clamp(1.5rem, 2.4vw, 2.1rem)", fontWeight: 700, color: NAVY, lineHeight: 1.25, margin: "0 0 16px" }}>
          <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
        </h2>
        <p style={{ fontSize: 15, lineHeight: 1.7, color: "#666", margin: 0 }}>
          <GenericEditableText sectionId={sectionId} field="subtitle" value={subtitle} tag="span" />
        </p>
      </div>

      {/* 3×2 grid */}
      <div className="klima-services-grid" style={{ maxWidth: 1200, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24 }}>
        {items.map((item, i) => (
          <div
            key={i}
            style={{
              padding: "32px 28px",
              border: "1px solid #e8e8e8",
              borderRadius: 10,
              backgroundColor: "#fff",
              transition: "border-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease",
            }}
            onMouseEnter={e => {
              const el = e.currentTarget as HTMLDivElement;
              el.style.borderColor = RED;
              el.style.boxShadow = "0 8px 28px rgba(0,0,0,0.08)";
              el.style.transform = "translateY(-4px)";
            }}
            onMouseLeave={e => {
              const el = e.currentTarget as HTMLDivElement;
              el.style.borderColor = "#e8e8e8";
              el.style.boxShadow = "none";
              el.style.transform = "translateY(0)";
            }}
          >
            <div style={{ fontSize: 36, marginBottom: 16, lineHeight: 1 }}>{String(item.icon ?? "🔧")}</div>
            <h3 style={{ fontSize: 17, fontWeight: 700, color: NAVY, margin: "0 0 10px", lineHeight: 1.3 }}>
              <GenericEditableText sectionId={sectionId} field={`items.${i}.name`} value={String(item.name ?? "")} tag="span" />
            </h3>
            <p style={{ fontSize: 14, lineHeight: 1.65, color: "#666", margin: 0 }}>
              <GenericEditableText sectionId={sectionId} field={`items.${i}.description`} value={String(item.description ?? "")} tag="span" />
            </p>
          </div>
        ))}
      </div>
    </section>
    </>
  );
}

// ── solar-03-services ──────────────────────────────────────────────────────────
function ServicesSolar03({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const ORANGE = "#ff8b00";

  type Card = {
    title?: string;
    subtitle?: string;
    tag?: string;
    image?: string;
    bullets?: string[];
    ctaText?: string;
    ctaHref?: string;
  };

  const eyebrow  = String(content.eyebrow  ?? "Naše řešení");
  const title    = String(content.title    ?? "Kompletní energetika pro váš dům");
  const subtitle = String(content.subtitle ?? "Od návrhu přes montáž až po servis — vše z jedné ruky. Vybírejte si podle svých priorit: rychlá úspora, energetická nezávislost, nebo obojí.");
  const cards: Card[] = Array.isArray(content.cards) ? (content.cards as Card[]) : [];

  const CheckIcon = () => (
    <span aria-hidden="true" style={{
      display: "inline-flex", alignItems: "center", justifyContent: "center",
      width: 20, height: 20, borderRadius: "50%",
      background: "linear-gradient(135deg, #ff8b00 0%, #ffa733 100%)",
      boxShadow: "0 3px 8px -3px rgba(255,139,0,0.45)", flexShrink: 0, marginTop: 1,
    }}>
      <svg width="11" height="11" viewBox="0 0 18 18" fill="none">
        <path d="M4.5 9l3 3 6-6.5" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </span>
  );

  // Per-card icon SVG dispatcher
  const CardIcon = ({ i }: { i: number }) => {
    const icons = [
      // heat pump — flame + wave
      <svg key="hp" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 3c1 3 4 4 4 8a4 4 0 1 1-8 0c0-2 1-3 2-4-.5 1.5.5 3 2 3 0-2 0-4-.5-6 .5 0 .5 0 .5-1z"/>
      </svg>,
      // solar panel
      <svg key="fv" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 18h18l-3-11H6l-3 11z"/><path d="M6 12h12M9 7l-1.5 11M15 7l1.5 11"/>
      </svg>,
      // hybrid — bolt inside circle
      <svg key="hy" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="9"/><path d="M13 6l-4 8h4l-1 4 4-8h-4l1-4z" fill="#fff" stroke="none"/>
      </svg>,
    ];
    return icons[i % icons.length];
  };

  return (
    <section className="s03svc-section" data-template="solar-03" id="sluzby">
      <div className="s03svc-grid-bg" aria-hidden="true" />
      <div className="s03svc-inner">
        <div className="s03svc-header">
          <div className="s03svc-eyebrow">
            <span className="s03svc-eyebrow-dot" aria-hidden="true" />
            <GenericEditableText sectionId={sectionId} field="eyebrow" value={eyebrow} tag="span" />
          </div>
          <h2 className="s03svc-h2">
            <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
          </h2>
          <p className="s03svc-sub-lead">
            <GenericEditableText sectionId={sectionId} field="subtitle" value={subtitle} tag="span" />
          </p>
        </div>

        <div className="s03svc-grid">
          {cards.map((card, i) => {
            const img = String(card.image ?? "");
            const bullets: string[] = Array.isArray(card.bullets) ? (card.bullets as string[]) : [];
            const tag = String(card.tag ?? ["Vytápění", "Fotovoltaika", "Hybrid"][i] ?? "");
            return (
              <article className="s03svc-card" key={i}>
                <span className="s03svc-card-topline" aria-hidden="true" />
                <div className="s03svc-card-image">
                  <GenericEditableImage sectionId={sectionId} field={`cards.${i}.image`} src={img} alt={String(card.title ?? "")} style={{ width: "100%", height: "100%" }}>
                    <img loading="lazy" src={img} alt={String(card.title ?? "")} className="s03svc-card-img" />
                  </GenericEditableImage>
                  <div className="s03svc-card-shade" aria-hidden="true" />
                  {tag && (
                    <span className="s03svc-card-tag">
                      <GenericEditableText sectionId={sectionId} field={`cards.${i}.tag`} value={tag} tag="span" />
                    </span>
                  )}
                  <svg className="s03svc-card-corner" width="34" height="34" viewBox="0 0 34 34" fill="none" aria-hidden="true">
                    <path d="M32 12V2H22" stroke={ORANGE} strokeWidth="1.6" strokeLinecap="square"/>
                  </svg>
                </div>

                <div className="s03svc-body">
                  <div className="s03svc-body-head">
                    <span className="s03svc-icon" aria-hidden="true">
                      <CardIcon i={i} />
                    </span>
                    <div>
                      <h3 className="s03svc-h3">
                        <GenericEditableText sectionId={sectionId} field={`cards.${i}.title`} value={String(card.title ?? "")} tag="span" />
                      </h3>
                      <p className="s03svc-sub">
                        <GenericEditableText sectionId={sectionId} field={`cards.${i}.subtitle`} value={String(card.subtitle ?? "")} tag="span" />
                      </p>
                    </div>
                  </div>

                  <ul className="s03svc-bullets">
                    {bullets.map((b, bi) => (
                      <li className="s03svc-bullet" key={bi}>
                        <CheckIcon />
                        <span>
                          <GenericEditableText sectionId={sectionId} field={`cards.${i}.bullets.${bi}`} value={b} tag="span" />
                        </span>
                      </li>
                    ))}
                  </ul>

                  <a className="s03svc-cta" href={String(card.ctaHref ?? "/sortiment")} data-btn="primary">
                    <GenericEditableText sectionId={sectionId} field={`cards.${i}.ctaText`} value={String(card.ctaText ?? "Podrobnosti")} tag="span" />
                    <span aria-hidden="true" style={{ marginLeft: 8, display: "inline-flex" }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                      </svg>
                    </span>
                  </a>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ─── SegmentsSolar02 ─── solar-02 Greenia 4-col customer segments ──────── */
function SegmentsSolar02({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const showHeader = content.showHeader !== false;
  const eyebrow  = String(content.eyebrow  ?? "Pro koho stavíme");
  const title    = String(content.title    ?? "Řešení přesně pro váš typ objektu");
  const subtitle = String(content.subtitle ?? "Pracujeme s firmami, obcemi, SVJ i zemědělskými areály — vždy s řešením přesně na míru.");
  type Seg = { icon: string; image?: string; title: string; description: string; ctaText?: string; ctaHref?: string };
  const segments: Seg[] = (content.segments as Seg[] | undefined) ?? [
    { icon: "factory",  image: "/assets/solar-02/seg-firmy.webp", title: "Firmy a průmysl",    description: "FVE i BESS systémy pro výrobní areály všech velikostí. Snížení provozních nákladů a energetická nezávislost.", ctaText: "Zjistit více", ctaHref: "/sluzby" },
    { icon: "city",     image: "/assets/solar-02/seg-obce.webp",  title: "Obce a města",       description: "Plnění závazků udržitelnosti a snížení výdajů za energie veřejných budov, škol i osvětlení.",              ctaText: "Zjistit více", ctaHref: "/sluzby" },
    { icon: "building", image: "/assets/solar-02/seg-svj.webp",   title: "Bytové domy a SVJ",  description: "Sdílená výroba elektřiny na střeše bytového domu. Nižší poplatky pro všechny nájemníky.",              ctaText: "Zjistit více", ctaHref: "/sluzby" },
    { icon: "farm",     image: "/assets/solar-02/seg-farm.webp",  title: "Zemědělské areály",  description: "FVE na střechách hal a stájí výrazně sníží vaše provozní náklady. Rychlá návratnost investice.",         ctaText: "Zjistit více", ctaHref: "/sluzby" },
  ];

  const icons: Record<string, JSX.Element> = {
    factory: (
      <svg width="22" height="22" viewBox="0 0 40 40" fill="none"><rect x="4" y="20" width="10" height="16" rx="1" stroke="currentColor" strokeWidth="2"/><rect x="16" y="14" width="8" height="22" rx="1" stroke="currentColor" strokeWidth="2"/><rect x="26" y="8" width="10" height="28" rx="1" stroke="currentColor" strokeWidth="2"/><path d="M2 36h36" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
    ),
    city: (
      <svg width="22" height="22" viewBox="0 0 40 40" fill="none"><rect x="3" y="16" width="14" height="20" rx="1" stroke="currentColor" strokeWidth="2"/><rect x="23" y="8" width="14" height="28" rx="1" stroke="currentColor" strokeWidth="2"/><path d="M7 22h6M7 27h6M27 14h6M27 20h6M27 26h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><path d="M2 36h36" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
    ),
    building: (
      <svg width="22" height="22" viewBox="0 0 40 40" fill="none"><rect x="6" y="10" width="28" height="26" rx="2" stroke="currentColor" strokeWidth="2"/><path d="M14 36V26h12v10" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/><path d="M6 18h28" stroke="currentColor" strokeWidth="1.5"/></svg>
    ),
    farm: (
      <svg width="22" height="22" viewBox="0 0 40 40" fill="none"><path d="M4 36h32" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><path d="M8 36V20l12-10 12 10v16" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/><rect x="16" y="26" width="8" height="10" rx="1" stroke="currentColor" strokeWidth="1.5"/></svg>
    ),
  };

  return (
    <section className="s02seg" id="segmenty" data-template="solar-02">
      {/* Decorative PV panel corner grid */}
      <svg className="s02seg-grid-motif" viewBox="0 0 300 200" aria-hidden="true" preserveAspectRatio="none">
        <g stroke="rgba(121,196,79,0.18)" strokeWidth="0.6" fill="none">
          {Array.from({length: 10}).map((_, i) => <line key={`v${i}`} x1={i*30} y1="0" x2={i*30} y2="200" />)}
          {Array.from({length: 7}).map((_, i) => <line key={`h${i}`} x1="0" y1={i*30} x2="300" y2={i*30} />)}
        </g>
      </svg>

      <div className="s02seg-inner">
        {showHeader && (
          <div className="s02seg-head">
            <div className="s02seg-eyebrow">
              <span className="s02seg-eyebrow-dot" aria-hidden="true" />
              <GenericEditableText sectionId={sectionId} field="eyebrow" value={eyebrow} tag="span" />
            </div>
            <h2 className="s02seg-h2">
              <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
            </h2>
            <p className="s02seg-sub">
              <GenericEditableText sectionId={sectionId} field="subtitle" value={subtitle} tag="span" />
            </p>
          </div>
        )}

        <div className="s02seg-grid">
          {segments.map((seg, i) => (
            <a key={i} href={String(seg.ctaHref ?? "/sluzby")} className="s02seg-card">
              <div className="s02seg-thumb">
                {seg.image && (
                  <GenericEditableImage sectionId={sectionId} field={`segments.${i}.image`} src={seg.image} alt={seg.title} style={{ position: "absolute", inset: 0 }}>
                    <img src={seg.image} alt={seg.title} loading="lazy" />
                  </GenericEditableImage>
                )}
                <div className="s02seg-thumb-tint" aria-hidden="true" />
                <div className="s02seg-icon" aria-hidden="true">{icons[seg.icon] ?? icons.factory}</div>
              </div>
              <div className="s02seg-body">
                <h3 className="s02seg-h3">
                  <GenericEditableText sectionId={sectionId} field={`segments.${i}.title`} value={seg.title} tag="span" />
                </h3>
                <p className="s02seg-p">
                  <GenericEditableText sectionId={sectionId} field={`segments.${i}.description`} value={seg.description} tag="span" />
                </p>
                <span className="s02seg-link">
                  <GenericEditableText sectionId={sectionId} field={`segments.${i}.ctaText`} value={String(seg.ctaText ?? "Zjistit více")} tag="span" />
                  <svg className="s02seg-link-arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                  </svg>
                </span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── ServicesSolar02 ─── solar-02 Greenia 6-grid services ─────────────── */
function ServicesSolar02({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const title    = String(content.title    ?? "Co nabízíme");
  const subtitle = String(content.subtitle ?? "Komplexní energetická řešení pod jednou střechou — od návrhu přes realizaci až po dlouhodobý provoz.");
  const services = (content.services as Array<{ icon: string; title: string; description: string }> | undefined) ?? [
    { icon: "solar",   title: "Fotovoltaické elektrárny", description: "Navrhujeme a realizujeme FVE na klíč pro průmyslové, komerční i rezidenční objekty. Výkon od 30 kWp po jednotky MWp." },
    { icon: "ppa",     title: "PPA – bez vlastní investice", description: "Elektřinu z naší FVE odebíráte za fixní cenu nižší, než je tržní. Nulová investice, žádné riziko, čistá úspora od prvního dne." },
    { icon: "bess",    title: "Bateriové úložiště (BESS)", description: "Maximalizujte využití vyrobené energie. Bateriové systémy zajistí stabilní dodávku i při výpadku sítě nebo špičkovém odběru." },
    { icon: "epc",     title: "EPC kontrakt", description: "Garantujeme úspory energie. Financujeme projekt z budoucích úspor — bez nutnosti vlastního kapitálu a s jasnou zárukou výsledku." },
    { icon: "monitor", title: "Správa a monitoring", description: "Vzdálený dohled 24/7, pravidelný servis a reporting výkonu. Vždy víte, kolik vaše elektrárna vyrábí a ušetří." },
    { icon: "grant",   title: "Dotace a financování", description: "Pomáháme s žádostmi o dotace z NRB, OPT i dalších fondů. Úspěšnost přes 98 %. Postaráme se o veškerou administrativu." },
  ];

  const icons: Record<string, JSX.Element> = {
    solar:   <svg width="36" height="36" viewBox="0 0 36 36" fill="none"><path d="M18 6L21 15H30L23 20.5L25.5 30L18 25L10.5 30L13 20.5L6 15H15Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/></svg>,
    ppa:     <svg width="36" height="36" viewBox="0 0 36 36" fill="none"><circle cx="18" cy="18" r="12" stroke="currentColor" strokeWidth="2"/><path d="M18 12v2M18 22v2M12 18h2M22 18h2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><circle cx="18" cy="18" r="3" stroke="currentColor" strokeWidth="1.5"/></svg>,
    bess:    <svg width="36" height="36" viewBox="0 0 36 36" fill="none"><rect x="7" y="11" width="22" height="14" rx="2" stroke="currentColor" strokeWidth="2"/><path d="M29 15h2v6h-2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M13 18h4l-2-4 6 4h-4l2 4-6-4z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>,
    epc:     <svg width="36" height="36" viewBox="0 0 36 36" fill="none"><path d="M8 28L14 20l6 4 8-12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><circle cx="28" cy="10" r="3" stroke="currentColor" strokeWidth="2"/></svg>,
    monitor: <svg width="36" height="36" viewBox="0 0 36 36" fill="none"><rect x="5" y="7" width="26" height="18" rx="2" stroke="currentColor" strokeWidth="2"/><path d="M13 29h10M18 25v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><path d="M10 18l4-4 4 3 4-5 4 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>,
    grant:   <svg width="36" height="36" viewBox="0 0 36 36" fill="none"><path d="M18 5l2.5 7.5H28l-6.5 4.5 2.5 7.5L18 20l-6 4.5 2.5-7.5L9 12.5h7.5z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/><path d="M10 28h16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>,
  };

  const showHeader = content.showHeader !== false;
  const eyebrow    = String(content.eyebrow ?? "Co nabízíme");

  return (
    <section className="s02svc" id="sluzby-nabidka" data-template="solar-02">
      <div className="s02svc-glow" aria-hidden="true" />
      <div className="s02svc-inner">
        {showHeader && (
          <div className="s02svc-head">
            <div className="s02svc-eyebrow">
              <span className="s02svc-eyebrow-dot" aria-hidden="true" />
              <GenericEditableText sectionId={sectionId} field="eyebrow" value={eyebrow} tag="span" />
            </div>
            <h2 className="s02svc-h2">
              <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
            </h2>
            <p className="s02svc-sub">
              <GenericEditableText sectionId={sectionId} field="subtitle" value={subtitle} tag="span" />
            </p>
          </div>
        )}
        <div className="s02svc-grid">
          {services.map((svc, i) => (
            <article className="s02svc-card" key={i}>
              <span className="s02svc-topline" aria-hidden="true" />
              <div className="s02svc-icon" aria-hidden="true">{icons[svc.icon] ?? icons.solar}</div>
              <h3 className="s02svc-h3">
                <GenericEditableText sectionId={sectionId} field={`services.${i}.title`} value={svc.title} tag="span" />
              </h3>
              <p className="s02svc-p">
                <GenericEditableText sectionId={sectionId} field={`services.${i}.description`} value={svc.description} tag="span" />
              </p>
              <svg className="s02svc-corner" width="34" height="34" viewBox="0 0 34 34" fill="none" aria-hidden="true">
                <path d="M2 22v10h10" stroke="rgba(121,196,79,0.4)" strokeWidth="1.2" strokeLinecap="round"/>
                <path d="M22 32h10V22" stroke="rgba(121,196,79,0.6)" strokeWidth="1.2" strokeLinecap="round"/>
              </svg>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── klempir-01-services ────────────────────────────────────────────────────────
// 1:1 klempirzprahy.cz:
// - #f9f9f9 bg, padding 80px 0
// - H2 "Nabízím" centered 36px + silver underline
// - Grid repeat(auto-fill, minmax(350px, 1fr)), gap 30px
// - Card: white bg, radius 8px, shadow 0 5px 15px rgba(0,0,0,0.1)
//   - hover: translateY(-10px), bigger shadow
//   - Image 250px, scale 1.05 on hover
//   - Content: padding 25px, text-align center; h3 22px #3a3a3a; p gray line-height 1.6
// ─────────────────────────────────────────────────────────────────────────────
interface ServicesK01Props {
  content: Record<string, unknown>;
  sectionId: number;
  tenantSlug?: string;
  isAdmin: boolean;
}
type K01ServiceItem = { title?: string; description?: string; image?: string; name?: string };

function ServicesKlempir01({ content, sectionId, tenantSlug, isAdmin }: ServicesK01Props) {
  const FONT   = "'Montserrat', sans-serif";
  const SILVER = "#c0c0c0";
  const DARK   = "#1a1a1a";
  const MEDIUM = "#3a3a3a";
  const GRAY   = "#717171";

  const title = String(content.title ?? "Nabízím");
  const items = (Array.isArray(content.items) ? content.items : []) as K01ServiceItem[];

  return (
    <>
      <style>{`
        .k01-services { background: #f9f9f9; padding: 80px 0; position: relative; font-family: ${FONT}; }
        .k01-services::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 1px; background: rgba(0,0,0,0.05); }
        .k01-services-container { width: 90%; max-width: 1200px; margin: 0 auto; padding: 0 15px; }
        .k01-services-h2 { font-size: 36px; font-weight: 600; color: ${DARK}; text-align: center; margin-bottom: 50px; position: relative; font-family: ${FONT}; }
        .k01-services-h2::after { content: ''; display: block; width: 80px; height: 3px; background: ${SILVER}; margin: 15px auto 0; }
        .k01-services-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap: 30px; }
        .k01-svc-card { background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 5px 15px rgba(0,0,0,0.1); transition: transform 0.3s ease, box-shadow 0.3s ease; display: flex; flex-direction: column; text-decoration: none; color: inherit; }
        .k01-svc-card:hover { transform: translateY(-10px); box-shadow: 0 15px 30px rgba(0,0,0,0.15); }
        .k01-svc-img { height: 250px; overflow: hidden; }
        .k01-svc-img img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.5s ease; display: block; }
        .k01-svc-card:hover .k01-svc-img img { transform: scale(1.05); }
        .k01-svc-body { padding: 25px; display: flex; flex-direction: column; flex-grow: 1; text-align: center; }
        .k01-svc-body h3 { color: ${MEDIUM}; margin-bottom: 15px; font-size: 22px; font-weight: 600; font-family: ${FONT}; }
        .k01-svc-body p { color: ${GRAY}; line-height: 1.6; margin: 0; font-size: 15px; }
        @media (max-width: 768px) {
          .k01-services-grid { grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); }
          .k01-svc-img { height: 200px; }
        }
      `}</style>

      <section id="sluzby" className="k01-services" data-template="klempir-01">
        <div className="k01-services-container">
          <h2 className="k01-services-h2">
            <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
          </h2>

          <div className="k01-services-grid">
            {items.map((item, i) => {
              const itemTitle = String(item.title ?? item.name ?? "");
              const itemDesc  = String(item.description ?? "");
              const itemImg   = String(item.image ?? "");
              return (
                <div key={i} className="k01-svc-card">
                  {itemImg && (
                    <div className="k01-svc-img">
                      <GenericEditableImage sectionId={sectionId} field={`items.${i}.image`} src={itemImg} alt={itemTitle} style={{}}>
                        <img loading="lazy" src={itemImg} alt={itemTitle} />
                      </GenericEditableImage>
                    </div>
                  )}
                  <div className="k01-svc-body">
                    <h3>
                      <GenericEditableText sectionId={sectionId} field={`items.${i}.title`} value={itemTitle} tag="span" />
                    </h3>
                    <p>
                      <GenericEditableText sectionId={sectionId} field={`items.${i}.description`} value={itemDesc} tag="span" />
                    </p>
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

// ── malir-01-services ─────────────────────────────────────────────────────────
// 1:1 petrovomalovani.cz more-description:
// - 2 full-bleed karty side by side (mobile: sloupec)
// - Každá karta: bg foto cover, tmavý overlay, centrovaný text
// - Amber Playfair H2 název (50px), bílý popis, navy CTA button
// ─────────────────────────────────────────────────────────────────────────────
interface ServicesMalir01Props {
  content: Record<string, unknown>;
  sectionId: number;
  tenantSlug?: string;
  isAdmin: boolean;
}

function ServicesMalir01({ content, sectionId, tenantSlug, isAdmin }: ServicesMalir01Props) {
  const AMBER    = "#E79B0E";
  const NAVY     = "#0F297B";
  const AMBER2   = "#F5AA23";
  const WHITE    = "#ffffff";
  const PLAYFAIR = "'Playfair Display', 'Times New Roman', serif";
  const RALEWAY  = "'Raleway', sans-serif";

  type Item = { name: string; description: string; image: string; ctaText: string; ctaHref: string };
  const defaultItems: Item[] = [
    { name: "Malování", description: "Interiér i exteriér", image: "/templates/malir-01/xroad-malovani.jpg", ctaText: "To mě zajímá", ctaHref: "/malování" },
    { name: "Lakování", description: "Okna, dveře, nábytek...", image: "/templates/malir-01/xroad-lakovani.jpg", ctaText: "To mě zajímá", ctaHref: "/lakování" },
  ];
  const items: Item[] = Array.isArray(content.items) && (content.items as unknown[]).length
    ? (content.items as Item[])
    : defaultItems;

  const resolve = (href: string) => {
    if (!tenantSlug) return href;
    const base = `/demo/${tenantSlug}${isAdmin ? "/admin" : ""}`;
    if (href === "/" || href === "") return base;
    if (href.startsWith("http") || href.startsWith("#")) return href;
    return `${base}${href.startsWith("/") ? href : "/" + href}`;
  };

  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@800&family=Raleway:wght@600&display=swap" />
      <style>{`        .m01s-wrap { display: flex; }
        .m01s-card { position: relative; flex: 1; height: 320px; overflow: hidden; display: flex; align-items: center; justify-content: center; flex-direction: column; text-align: center; }
        .m01s-card img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; display: block; transition: transform 0.5s ease; }
        .m01s-card:hover img { transform: scale(1.04); }
        .m01s-overlay { position: absolute; inset: 0; background: rgba(0,0,0,0.48); }
        .m01s-body { position: relative; z-index: 2; padding: 0 24px; }
        .m01s-name { font-family: ${PLAYFAIR}; font-size: 50px; font-weight: 800; color: ${AMBER}; line-height: 1.1; margin: 0 0 10px; }
        .m01s-desc { font-family: ${RALEWAY}; font-size: 18px; font-weight: 900; color: ${WHITE}; margin: 0 0 24px; line-height: 1.5; }
        .m01s-btn { display: inline-block; padding: 12px 40px; line-height: 35px; background: linear-gradient(270deg, transparent 0%, rgba(0,0,0,0.3) 100%), linear-gradient(0deg, ${NAVY}, ${NAVY}); text-decoration: none; text-transform: uppercase; color: ${WHITE}; font-size: 14px; font-weight: 600; border-radius: 4px; font-family: ${RALEWAY}; transition: color 0.3s; }
        .m01s-btn:hover { color: ${AMBER2}; }
        @media (max-width: 600px) { .m01s-wrap { flex-direction: column; } .m01s-card { height: 260px; } .m01s-name { font-size: 36px; } }
      `}</style>

      <section id="sluzby" data-template="malir-01">
        <div className="m01s-wrap">
          {items.map((item, i) => (
            <div key={i} className="m01s-card">
              <GenericEditableImage sectionId={sectionId} field={`items.${i}.image`} src={item.image} alt={item.name} style={{ position: "absolute", inset: 0 }}>
                <img loading="lazy" src={item.image} alt={item.name} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
              </GenericEditableImage>
              <div className="m01s-overlay" />
              <div className="m01s-body">
                <h2 className="m01s-name">
                  <GenericEditableText sectionId={sectionId} field={`items.${i}.name`} value={item.name} tag="span">{item.name}</GenericEditableText>
                </h2>
                <p className="m01s-desc">
                  <GenericEditableText sectionId={sectionId} field={`items.${i}.description`} value={item.description} tag="span">{item.description}</GenericEditableText>
                </p>
                <a href={resolve(item.ctaHref)} data-btn="primary" className="m01s-btn">
                  <GenericEditableText sectionId={sectionId} field={`items.${i}.ctaText`} value={item.ctaText} tag="span">{item.ctaText}</GenericEditableText>
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

// ── clean-02-services ─────────────────────────────────────────────────────────
function ServicesClean02({ content, sectionId, tenantSlug, isAdmin }: { content: Record<string, unknown>; sectionId: number; tenantSlug?: string; isAdmin: boolean }) {
  const eyebrow = String(content.eyebrow ?? "Naše služby");
  const title   = String(content.title   ?? "Modrý Žralok pro každý prostor");
  const sub     = String(content.subtitle ?? "Poskytujeme kompletní úklidový servis od úklidu kanceláří přes úklidy SVJ, generální úklidy, čištění nábytku a strojové čištění garáží.");
  const items   = (content.items as Array<{ image?: string; title?: string; name?: string; description?: string; href?: string }>) ?? [];

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
        .c02sv-section {
          background: ${NAVY};
          padding: 5.5rem 5%;
          font-family: 'Onest', sans-serif;
          position: relative; overflow: hidden;
        }
        /* subtle radial glow */
        .c02sv-section::before {
          content: '';
          position: absolute; inset: 0; pointer-events: none;
          background: radial-gradient(ellipse 60% 50% at 50% 0%, rgba(1,157,255,0.12) 0%, transparent 70%);
        }
        .c02sv-inner { max-width: 80rem; margin: 0 auto; position: relative; z-index: 1; }

        /* centered header */
        .c02sv-head { text-align: center; margin-bottom: 3.5rem; }
        .c02sv-tagline {
          display: inline-flex; align-items: center; gap: 0.5rem;
          font-size: 0.78rem; font-weight: 700; letter-spacing: 0.12em;
          text-transform: uppercase; color: ${BLUE};
          margin-bottom: 0.85rem;
        }
        .c02sv-tagline-dot { width: 6px; height: 6px; border-radius: 50%; background: ${BLUE}; }
        .c02sv-h2 {
          font-family: 'Bricolage Grotesque', sans-serif;
          font-size: clamp(1.75rem, 3.5vw, 2.6rem);
          font-weight: 800; color: #fff;
          line-height: 1.15; margin: 0 0 1rem;
          letter-spacing: -0.02em;
        }
        .c02sv-h2 span { color: ${BLUE}; }
        .c02sv-sub {
          font-size: 1.05rem; color: rgba(255,255,255,0.7);
          line-height: 1.65; margin: 0 auto;
          max-width: 40rem;
        }

        /* 3-col grid */
        .c02sv-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1.25rem;
        }
        .c02sv-card {
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 14px;
          overflow: hidden;
          transition: background 0.25s, border-color 0.25s, transform 0.2s, box-shadow 0.25s;
        }
        .c02sv-card:hover {
          background: rgba(255,255,255,0.09);
          border-color: rgba(1,157,255,0.4);
          transform: translateY(-3px);
          box-shadow: 0 16px 40px rgba(0,0,0,0.3);
        }
        .c02sv-img-wrap {
          width: 100%; aspect-ratio: 1/1; overflow: hidden;
          background: rgba(255,255,255,0.04);
        }
        .c02sv-img-wrap img {
          width: 100%; height: 100%;
          object-fit: contain; object-position: center;
          display: block;
          transition: transform 0.4s ease;
          image-rendering: crisp-edges;
        }
        .c02sv-card:hover .c02sv-img-wrap img { transform: scale(1.06); }
        .c02sv-body { padding: 1.4rem 1.5rem 1.6rem; }
        .c02sv-card-title {
          font-family: 'Bricolage Grotesque', sans-serif;
          font-size: 1.05rem; font-weight: 700;
          color: #fff; margin: 0 0 0.55rem; line-height: 1.3;
        }
        .c02sv-card-title span { color: ${BLUE}; }
        .c02sv-card-desc {
          font-size: 0.88rem; color: rgba(255,255,255,0.65);
          line-height: 1.65; margin: 0 0 1.1rem;
        }
        .c02sv-btn {
          display: inline-flex; align-items: center; gap: 0.4rem;
          font-size: 0.85rem; font-weight: 600;
          color: ${BLUE}; text-decoration: none;
          transition: gap 0.2s;
        }
        .c02sv-btn:hover { gap: 0.65rem; }

        @media (max-width: 900px) { .c02sv-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 550px) { .c02sv-grid { grid-template-columns: 1fr; } }
      `}</style>

      <section className="c02sv-section" id="sluzby" data-template="clean-02-services">
        <div className="c02sv-inner">

          <div className="c02sv-head">
            <div className="c02sv-tagline">
              <span className="c02sv-tagline-dot" aria-hidden />
              <GenericEditableText sectionId={sectionId} field="eyebrow" value={eyebrow} tag="span" />
            </div>
            <h2 className="c02sv-h2">
              Modrý Žralok pro <span>každý prostor</span>
            </h2>
            <p className="c02sv-sub">
              <GenericEditableText sectionId={sectionId} field="subtitle" value={sub} tag="span" />
            </p>
          </div>

          <div className="c02sv-grid">
            {items.map((item, i) => {
              const label = item.title ?? item.name ?? "";
              return (
                <div key={i} className="c02sv-card">
                  {item.image && (
                    <div className="c02sv-img-wrap">
                      <img src={item.image} alt={label} loading="lazy" />
                    </div>
                  )}
                  <div className="c02sv-body">
                    <h3 className="c02sv-card-title">
                      <GenericEditableText sectionId={sectionId} field={`items.${i}.title`} value={label} tag="span" />
                    </h3>
                    <p className="c02sv-card-desc">
                      <GenericEditableText sectionId={sectionId} field={`items.${i}.description`} value={item.description ?? ""} tag="span" />
                    </p>
                    <a href={resolve(item.href ?? "#kontakt")} className="c02sv-btn">
                      O službě
                      <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
                        <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </a>
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

// ── arbo-01-services ─────────────────────────────────────────────────────────
// 1:1 lesarb.cz:
// - White bg, centered section title (dark navy)
// - 6-card grid (3×2 desktop, 2×3 tablet, 1×6 mobile)
// - Each card: full image background with dark gradient overlay, white title + desc, "Více →" link
// - Hover: slight scale on image
// ─────────────────────────────────────────────────────────────────────────────
function ServicesArbo01({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const sectionTitle = String(content.title ?? "Kompletní servis pro vaši zeleň. Od kořenů až po korunu.");
  const rawItems = (content.items as Array<{ title?: string; name?: string; description?: string; image?: string; href?: string }>) ?? [];
  const items = rawItems.length > 0 ? rawItems : [
    { title: "Rizikové kácení",      description: "Bezpečné kácení stromů v náročných podmínkách.", image: "/clones/lesarb/site/card-04.jpg", href: "#sluzby" },
    { title: "Odborné ořezy a péče", description: "Certifikované arboristické ošetření stromů.",    image: "/clones/lesarb/site/card-02.jpg", href: "#sluzby" },
    { title: "Štěpkování a úklid",   description: "Zpracování a odvoz dřevní hmoty na místě.",      image: "/clones/lesarb/site/card-05.jpg", href: "#sluzby" },
    { title: "Frézování pařezů",     description: "Odstranění pařezů frézou pod úroveň terénu.",    image: "/clones/lesarb/site/img-07-desktop.jpg", href: "#sluzby" },
    { title: "Rekultivace pozemku",  description: "Komplexní úprava pozemku po těžbě.",             image: "/clones/lesarb/site/img-08-desktop.jpg", href: "#sluzby" },
    { title: "Hodnocení stromů",     description: "Odborné posouzení zdraví a stability stromů.",   image: "/clones/lesarb/site/img-05-desktop.jpg", href: "#sluzby" },
  ];

  return (
    <>
      <style>{`
        .arbo01-sv {
          background: #fff;
          padding: 5rem 1.5rem;
          font-family: "AlanSans","Inter",system-ui,sans-serif;
        }
        .arbo01-sv-inner {
          max-width: 1370px;
          margin: 0 auto;
        }
        .arbo01-sv-title {
          font-size: clamp(1.5rem, 2.5vw, 2.1rem);
          font-weight: 700;
          color: #051d35;
          text-align: center;
          margin: 0 0 3rem;
          line-height: 1.25;
          max-width: 52ch;
          margin-left: auto;
          margin-right: auto;
        }
        .arbo01-sv-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1rem;
        }
        @media (min-width: 600px) {
          .arbo01-sv-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (min-width: 960px) {
          .arbo01-sv-grid { grid-template-columns: repeat(3, 1fr); }
        }
        .arbo01-sv-card {
          position: relative;
          overflow: hidden;
          border-radius: 8px;
          aspect-ratio: 4/3;
          cursor: pointer;
        }
        .arbo01-sv-card img {
          width: 100%; height: 100%;
          object-fit: cover;
          display: block;
          transition: transform 0.5s ease;
        }
        .arbo01-sv-card:hover img { transform: scale(1.06); }
        .arbo01-sv-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to top, rgba(5,29,53,0.82) 0%, rgba(5,29,53,0.25) 55%, transparent 100%);
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          padding: 1.5rem;
          gap: 0.4rem;
        }
        .arbo01-sv-card-title {
          font-size: 1.15rem;
          font-weight: 700;
          color: #fff;
          margin: 0;
          line-height: 1.2;
        }
        .arbo01-sv-card-desc {
          font-size: 0.875rem;
          color: rgba(255,255,255,0.82);
          margin: 0;
          line-height: 1.45;
        }
        .arbo01-sv-card-link {
          display: inline-flex;
          align-items: center;
          gap: 0.3rem;
          margin-top: 0.5rem;
          color: #62D76A;
          font-size: 0.85rem;
          font-weight: 700;
          text-decoration: none;
          letter-spacing: 0.03em;
          transition: color 0.15s;
        }
        .arbo01-sv-card-link:hover { color: #fff; }
      `}</style>

      <section className="arbo01-sv" id={String(sectionId)} data-template="arbo-01-services">
        <div className="arbo01-sv-inner">
          <h2 className="arbo01-sv-title">
            <GenericEditableText sectionId={sectionId} field="title" value={sectionTitle} tag="span" />
          </h2>
          <div className="arbo01-sv-grid">
            {items.map((item, i) => (
              <div key={i} className="arbo01-sv-card">
                <GenericEditableImage sectionId={sectionId} field={`items.${i}.image`} src={item.image ?? "/clones/lesarb/site/card-02.jpg"} alt={item.title ?? item.name ?? "Služba"} style={{ position: "absolute", inset: 0 }}>
                  <img loading="lazy" src={item.image ?? "/clones/lesarb/site/card-02.jpg"} alt={item.title ?? item.name ?? "Služba"} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                </GenericEditableImage>
                <div className="arbo01-sv-overlay">
                  <h3 className="arbo01-sv-card-title">
                    <GenericEditableText sectionId={sectionId} field={`items.${i}.title`} value={item.title ?? item.name ?? ""} tag="span" />
                  </h3>
                  {item.description && (
                    <p className="arbo01-sv-card-desc">
                      <GenericEditableText sectionId={sectionId} field={`items.${i}.description`} value={item.description} tag="span" />
                    </p>
                  )}
                  <a href={item.href ?? "#sluzby"} className="arbo01-sv-card-link">
                    Více →
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

// ── ddd-01-services ───────────────────────────────────────────────────────────
// 1:1 deratizacepraha.com — "Služby" sekce (aside):
// - Světle modrý bg #f0f8ff
// - 2-col (flex-direction: row-reverse): LEFT = bullet list služeb, RIGHT = 4 service karty
// - Eyebrow + H2 nad listem; karty: čtvercové foto + caption dole
// ─────────────────────────────────────────────────────────────────────────────
function ServicesDdd01({ content, sectionId, tenantSlug, isAdmin }: { content: Record<string,unknown>; sectionId: number; tenantSlug?: string; isAdmin?: boolean }) {
  const PRIMARY = "#0c93eb";
  const DARK    = "#015ba3";
  const FONT    = "'Figtree', system-ui, sans-serif";

  const resolve = (href: string) => {
    if (!tenantSlug || href.startsWith("http")) return href;
    const base = isAdmin ? `/demo/${tenantSlug}/admin` : `/demo/${tenantSlug}`;
    return href === "/" ? base : `${base}${href}`;
  };

  const eyebrow   = String(content.eyebrow   ?? "..se zárukou kvality");
  const title     = String(content.title     ?? "Služby");
  const bullets   = (content.bullets   as Array<{ label: string; href?: string }>) ?? [];
  const cards     = (content.cards     as Array<{ url: string; alt?: string; caption?: string; href?: string }>) ?? [];

  return (
    <>
      <style>{`
        .ddd01sv-wrap {
          font-family: ${FONT};
          background: #f0f8ff;
          padding: 4rem 1.5rem;
        }
        .ddd01sv-inner { max-width: 80rem; margin: 0 auto; }
        .ddd01sv-grid {
          display: flex;
          flex-direction: row-reverse;
          gap: clamp(2rem, 5vw, 5rem);
          align-items: flex-start;
        }
        /* LEFT — text/list */
        .ddd01sv-left {
          flex: 0 0 clamp(220px, 38%, 420px);
        }
        .ddd01sv-eyebrow {
          display: inline-block;
          color: ${PRIMARY};
          font-size: clamp(0.84rem, 0.32vw + 0.77rem, 1.06rem);
          font-weight: 400;
          letter-spacing: 0.375rem;
          text-transform: uppercase;
          margin-bottom: 0.6rem;
        }
        .ddd01sv-h2 {
          color: ${DARK};
          font-size: clamp(1.625rem, 0.89vw + 1.45rem, 2.25rem);
          font-weight: 700;
          text-transform: uppercase;
          margin: 0 0 1.25rem;
        }
        .ddd01sv-list {
          list-style: none;
          padding: 0;
          margin: 0;
          columns: 2;
          column-gap: 1rem;
        }
        .ddd01sv-list li {
          position: relative;
          padding: 0 0 0.6rem 1.1em;
          font-size: 0.9375rem;
          color: #1a2a3a;
          break-inside: avoid;
        }
        .ddd01sv-list li::before {
          content: "›";
          position: absolute;
          left: 0;
          color: ${PRIMARY};
          font-weight: 700;
        }
        .ddd01sv-list a {
          color: inherit;
          text-decoration: none;
          transition: color 0.15s;
        }
        .ddd01sv-list a:hover { color: ${PRIMARY}; }

        /* RIGHT — karty */
        .ddd01sv-cards {
          flex: 1;
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 0.75rem;
        }
        .ddd01sv-card {
          position: relative;
          overflow: hidden;
          border-radius: 4px;
          aspect-ratio: 1/1;
          background: #d5e8f5;
          transition: transform 0.18s, box-shadow 0.18s;
        }
        .ddd01sv-card:hover { transform: scale(1.02); box-shadow: 0 4px 16px rgba(0,0,0,0.14); }
        .ddd01sv-card img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }
        .ddd01sv-card-caption {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          background: linear-gradient(transparent, rgba(0,0,0,0.6));
          color: #fff;
          font-size: 0.9rem;
          font-weight: 600;
          text-align: center;
          padding: 2rem 0.5rem 0.6rem;
        }

        @media (max-width: 768px) {
          .ddd01sv-grid { flex-direction: column; }
          .ddd01sv-left { width: 100%; }
          .ddd01sv-list { columns: 2; }
          .ddd01sv-cards { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 420px) {
          .ddd01sv-list { columns: 1; }
        }
      `}</style>

      <section className="ddd01sv-wrap" id="sluzby" data-template="ddd-01-services">
        <div className="ddd01sv-inner">
          <div className="ddd01sv-grid">

            {/* LEFT: eyebrow + H2 + bullet list */}
            <div className="ddd01sv-left">
              <p className="ddd01sv-eyebrow">
                <GenericEditableText sectionId={sectionId} field="eyebrow" value={eyebrow} tag="span" />
              </p>
              <h2 className="ddd01sv-h2">
                <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
              </h2>
              <ul className="ddd01sv-list">
                {bullets.map((b, i) => (
                  <li key={i}>
                    <a href={resolve(b.href ?? "#sluzby")}>
                      <GenericEditableText sectionId={sectionId} field={`bullets.${i}.label`} value={b.label} tag="span" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* RIGHT: 4 service karty */}
            <div className="ddd01sv-cards">
              {cards.map((card, i) => (
                <a key={i} href={resolve(card.href ?? "#sluzby")} className="ddd01sv-card" title={card.caption ?? ""}>
                  <GenericEditableImage sectionId={sectionId} field={`cards.${i}.url`} src={card.url} alt={card.alt ?? card.caption ?? ""} style={{}}>
                    <img src={card.url} alt={card.alt ?? card.caption ?? ""} loading="lazy" decoding="async" />
                  </GenericEditableImage>
                  <p className="ddd01sv-card-caption">
                    <GenericEditableText sectionId={sectionId} field={`cards.${i}.caption`} value={card.caption ?? ""} tag="span" />
                  </p>
                </a>
              ))}
            </div>

          </div>
        </div>
      </section>
    </>
  );
}

// ── hotel-01-rooms ────────────────────────────────────────────────────────────
function ServicesHotel01Rooms({ content, sectionId, isAdmin }: { content: Record<string, unknown>; sectionId: number; tenantSlug?: string; isAdmin: boolean }) {
  const c       = (content ?? {}) as Record<string, any>;
  const eyebrow = c.eyebrow  ?? "Ubytování";
  const title   = c.title    ?? "Stylové pokoje a apartmá";
  const subtitle= c.subtitle ?? "";
  const items: { name: string; description: string; image: string; moreHref: string; bookHref: string }[] = Array.isArray(c.items) ? c.items : [];

  const [active, setActive] = useState(0);

  const resolve = (href: string) => (isAdmin ? "#" : href ?? "#");

  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500&family=Poppins:wght@300;400;500&display=swap" />
      <style>{`        .h01rooms {
          background: #f9f6f2;
          padding: clamp(60px,8vw,110px) 0;
          font-family: 'Poppins', sans-serif;
          overflow: hidden;
        }
        .h01rooms-header {
          max-width: 1200px; margin: 0 auto 52px;
          padding: 0 clamp(20px,5vw,80px);
          text-align: center;
        }
        .h01rooms-eyebrow {
          font-size: 11px; letter-spacing: 0.22em; text-transform: uppercase;
          color: #a98763; font-weight: 500; margin: 0 0 16px;
        }
        .h01rooms-title {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: clamp(26px,3vw,42px); font-weight: 400; color: #3e3e3e;
          margin: 0 0 16px; line-height: 1.2;
        }
        .h01rooms-subtitle {
          font-size: 15px; color: #797979; font-weight: 300;
          max-width: 620px; margin: 0 auto; line-height: 1.7;
        }

        /* Tabs */
        .h01rooms-tabs {
          display: flex; justify-content: center; flex-wrap: wrap; gap: 0;
          margin: 0 auto 0; max-width: 1200px; padding: 0 clamp(20px,5vw,80px) 0;
          border-bottom: 1px solid #e8e0d6;
        }
        .h01rooms-tab {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: 13px; letter-spacing: 0.1em; text-transform: uppercase;
          color: #797979; background: none; border: none; cursor: pointer;
          padding: 14px 28px; position: relative; transition: color 0.2s;
          white-space: nowrap;
        }
        .h01rooms-tab.active { color: #a98763; }
        .h01rooms-tab.active::after {
          content: ''; position: absolute; bottom: -1px; left: 0; right: 0;
          height: 2px; background: #a98763;
        }
        .h01rooms-tab:hover { color: #a98763; }

        /* Card */
        .h01rooms-card {
          max-width: 1200px; margin: 0 auto;
          padding: 0 clamp(20px,5vw,80px);
          display: grid; grid-template-columns: 1fr 1fr; gap: 72px;
          align-items: center; padding-top: 56px;
        }
        .h01rooms-img-wrap {
          position: relative; overflow: hidden; aspect-ratio: 4/3;
        }
        .h01rooms-img {
          width: 100%; height: 100%; object-fit: cover; display: block;
          transition: transform 0.6s ease;
        }
        .h01rooms-img-wrap:hover .h01rooms-img { transform: scale(1.04); }
        .h01rooms-card-eyebrow {
          font-size: 10px; letter-spacing: 0.2em; text-transform: uppercase;
          color: #a98763; font-weight: 500; margin: 0 0 14px;
        }
        .h01rooms-card-name {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: clamp(22px,2.5vw,34px); font-weight: 400; color: #3e3e3e;
          margin: 0 0 20px; line-height: 1.25;
        }
        .h01rooms-card-desc {
          font-size: 15px; color: #5D5D5D; font-weight: 300;
          line-height: 1.85; margin: 0 0 36px;
        }
        .h01rooms-card-ctas {
          display: flex; gap: 14px; flex-wrap: wrap;
        }
        .h01rooms-more {
          display: inline-flex; align-items: center; justify-content: center;
          border: 1.5px solid #a98763; color: #a98763;
          font-family: 'Playfair Display', Georgia, serif;
          font-size: 12px; letter-spacing: 0.14em; text-transform: uppercase;
          padding: 11px 28px; text-decoration: none; transition: background 0.2s, color 0.2s;
        }
        .h01rooms-more:hover { background: #a98763; color: #fff; }
        .h01rooms-book {
          display: inline-flex; align-items: center; justify-content: center;
          background: #879B32; color: #fff;
          font-family: 'Playfair Display', Georgia, serif;
          font-size: 12px; letter-spacing: 0.14em; text-transform: uppercase;
          padding: 11px 28px; text-decoration: none; transition: background 0.2s;
        }
        .h01rooms-book:hover { background: #6a7a28; }

        /* Dots */
        .h01rooms-dots {
          display: flex; justify-content: center; gap: 8px; margin-top: 48px;
        }
        .h01rooms-dot {
          width: 7px; height: 7px; border-radius: 50%;
          background: #d4c8bb; border: none; cursor: pointer; padding: 0;
          transition: background 0.25s, transform 0.25s;
        }
        .h01rooms-dot.active { background: #a98763; transform: scale(1.35); }

        @media (max-width: 860px) {
          .h01rooms-card { grid-template-columns: 1fr; gap: 32px; }
          .h01rooms-tab { padding: 12px 16px; font-size: 11px; }
        }
      `}</style>

      <section className="h01rooms" id="pokoje" data-template="hotel-01-rooms">
        <div className="h01rooms-header">
          <p className="h01rooms-eyebrow">
            <GenericEditableText sectionId={sectionId} field="eyebrow" value={eyebrow} tag="span" />
          </p>
          <h2 className="h01rooms-title">
            <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
          </h2>
          {subtitle && (
            <p className="h01rooms-subtitle">
              <GenericEditableText sectionId={sectionId} field="subtitle" value={subtitle} tag="span" />
            </p>
          )}
        </div>

        {/* Tab bar */}
        <div className="h01rooms-tabs" role="tablist">
          {items.map((item, i) => (
            <button
              key={i}
              className={`h01rooms-tab${i === active ? " active" : ""}`}
              onClick={() => setActive(i)}
              role="tab"
              aria-selected={i === active}
            >
              {item.name}
            </button>
          ))}
        </div>

        {/* Active card */}
        {items[active] && (
          <div className="h01rooms-card">
            <div className="h01rooms-img-wrap">
              <GenericEditableImage sectionId={sectionId} field={`items.${active}.image`} src={items[active].image || "/placeholder.jpg"} alt={items[active].name} style={{ width: "100%", height: "100%" }}>
                <img src={items[active].image || "/placeholder.jpg"} alt={items[active].name} className="h01rooms-img" loading="lazy" />
              </GenericEditableImage>
            </div>
            <div>
              <p className="h01rooms-card-eyebrow">Ubytování</p>
              <h3 className="h01rooms-card-name">
                <GenericEditableText sectionId={sectionId} field={`items.${active}.name`} value={items[active].name} tag="span" />
              </h3>
              <p className="h01rooms-card-desc">
                <GenericEditableText sectionId={sectionId} field={`items.${active}.description`} value={items[active].description} tag="span" />
              </p>
              <div className="h01rooms-card-ctas">
                <a href={resolve(items[active].moreHref)} className="h01rooms-more">Více informací</a>
                <a href={resolve(items[active].bookHref)} className="h01rooms-book">Rezervujte</a>
              </div>
            </div>
          </div>
        )}

        {/* Dots */}
        {items.length > 1 && (
          <div className="h01rooms-dots">
            {items.map((_, i) => (
              <button
                key={i}
                className={`h01rooms-dot${i === active ? " active" : ""}`}
                onClick={() => setActive(i)}
                aria-label={`Pokoj ${i + 1}`}
              />
            ))}
          </div>
        )}
      </section>
    </>
  );
}

// ── chalet-01-amenities ───────────────────────────────────────────────────────
const CHALET_ICONS: Record<string, JSX.Element> = {
  home: (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  ),
  spa: (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2a10 10 0 0 1 10 10c0 4.42-2.87 8.17-6.84 9.49"/><path d="M12 2C6.48 2 2 6.48 2 12c0 4.42 2.87 8.17 6.84 9.49"/><path d="M12 8a4 4 0 0 0-4 4c0 2.21 1.79 4 4 4s4-1.79 4-4a4 4 0 0 0-4-4z"/>
    </svg>
  ),
  ski: (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 17l5-5 4 4 5-5 4 4"/><circle cx="17" cy="4" r="2"/><path d="M7 20l-4-4 14-14 4 4"/>
    </svg>
  ),
  fire: (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>
    </svg>
  ),
  fork: (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3zm0 0v7"/>
    </svg>
  ),
  bike: (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="18.5" cy="17.5" r="3.5"/><circle cx="5.5" cy="17.5" r="3.5"/><circle cx="15" cy="5" r="1"/><path d="M12 17.5V14l-3-3 4-3 2 3h2"/>
    </svg>
  ),
};

function AmenitiesChalet01({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const c = (content ?? {}) as Record<string, any>;
  const title = String(c.title ?? "Co u nás najdete");
  const items: Array<{ title: string; description: string; icon?: string }> =
    Array.isArray(c.items) && c.items.length > 0 ? c.items : [];

  const BEIGE  = "#c0bbad";
  const DARK   = "#1e2329";
  const FONT_H = "'Josefin Sans', system-ui, sans-serif";
  const FONT_B = "'Plus Jakarta Sans', system-ui, sans-serif";

  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Josefin+Sans:wght@300;400;600&family=Plus+Jakarta+Sans:wght@400;500;600&display=swap" />
      <style>{`        .ch01am {
          background: ${DARK};
          padding: clamp(4rem, 8vw, 7rem) 1.5rem;
        }
        .ch01am-heading {
          text-align: center;
          margin-bottom: clamp(2.5rem, 5vw, 4rem);
        }
        .ch01am-title {
          font-family: ${FONT_H};
          font-size: clamp(1.4rem, 3vw, 2rem);
          font-weight: 300;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: #fff;
          margin: 0 0 0.75rem;
        }
        .ch01am-divider {
          width: 40px;
          height: 1px;
          background: ${BEIGE};
          margin: 0 auto;
        }
        .ch01am-grid {
          max-width: 1100px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 2px;
        }
        .ch01am-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          padding: clamp(2rem, 4vw, 3rem) 1.5rem;
          border: 1px solid rgba(192,187,173,0.12);
          transition: background 0.25s, border-color 0.25s;
        }
        .ch01am-card:hover {
          background: rgba(192,187,173,0.06);
          border-color: rgba(192,187,173,0.28);
        }
        .ch01am-icon {
          color: ${BEIGE};
          margin-bottom: 1.25rem;
          opacity: 0.9;
        }
        .ch01am-card-title {
          font-family: ${FONT_H};
          font-size: 0.78rem;
          font-weight: 600;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: #fff;
          margin: 0 0 0.6rem;
        }
        .ch01am-card-desc {
          font-family: ${FONT_B};
          font-size: 0.85rem;
          line-height: 1.65;
          color: rgba(255,255,255,0.55);
          margin: 0;
        }
        @media (max-width: 768px) {
          .ch01am-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 480px) {
          .ch01am-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <section className="ch01am" data-template="chalet-01-amenities">
        <div className="ch01am-heading">
          <h2 className="ch01am-title">
            <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
          </h2>
          <div className="ch01am-divider" />
        </div>
        <div className="ch01am-grid">
          {items.map((item, i) => (
            <div key={i} className="ch01am-card">
              <div className="ch01am-icon">
                {CHALET_ICONS[item.icon ?? ""] ?? CHALET_ICONS.home}
              </div>
              <p className="ch01am-card-title">
                <GenericEditableText sectionId={sectionId} field={`items.${i}.title`} value={item.title} tag="span" />
              </p>
              <p className="ch01am-card-desc">
                <GenericEditableText sectionId={sectionId} field={`items.${i}.description`} value={item.description} tag="span" />
              </p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

// ── malir-02-services ─────────────────────────────────────────────────────────
// 1:1 malirstvi-bastar.cz — sekce Naše služby:
// - Fullbleed 4-col grid, výška 500px desktop / 300px mobile
// - Každý sloupeček: bg foto cover + tmavý overlay rgba(0,0,0,0.35)
// - Bílý Poppins 600 uppercase H4 nahoře + bílý popis dole
// - Hover: oranžový (#ff914d) overlay animace z dna (scale Y)
// - Mobile: 2-col; xs: 1-col
// ─────────────────────────────────────────────────────────────────────────────
function ServicesMalir02({ content, sectionId, tenantSlug, isAdmin }: { content: Record<string, unknown>; sectionId: number; tenantSlug?: string; isAdmin?: boolean }) {
  const ORANGE  = "#ff914d";
  const WHITE   = "#ffffff";
  const POPPINS = "'Poppins', sans-serif";

  type Item = { image: string; title: string; description: string };
  const defaultItems: Item[] = [
    { image: "/templates/malir-02/service-interier.jpg",  title: "Malování interiérů bytů a domů",    description: "Vymalujeme váš byt nebo dům tak, abyste se v něm cítili jako doma. Vše připravíme a uklidíme." },
    { image: "/templates/malir-02/service-fasada.jpg",    title: "Malování fasád a venkovních prostor", description: "Malujeme domy a zděné plochy. Natíráme také střechy a dřevěné plochy." },
    { image: "/templates/malir-02/service-komerce.jpg",   title: "Malování nebytových prostor",         description: "Vymalujeme kancelář, školu, obchod, zdravotnické zařízení nebo sklad." },
    { image: "/templates/malir-02/service-lak.jpg",       title: "Lakýrnické práce",                    description: "Natíráme okna, dveře, radiátory, kovové střechy, okapy, kovové a dřevěné ploty." },
  ];
  const items: Item[] = Array.isArray(content.items) && (content.items as unknown[]).length
    ? (content.items as Item[])
    : defaultItems;

  return (
    <>
      <style>{`
        .m02svc-wrap { display: grid; grid-template-columns: repeat(4, 1fr); }
        .m02svc-item {
          position: relative; height: 500px; overflow: hidden; cursor: default;
          display: flex; flex-direction: column; justify-content: space-between;
        }
        .m02svc-bg {
          position: absolute; inset: 0; z-index: 0;
          background-size: cover; background-position: center; background-repeat: no-repeat;
          transition: transform 0.5s ease;
        }
        .m02svc-item:hover .m02svc-bg { transform: scale(1.04); }
        .m02svc-dark { position: absolute; inset: 0; background: rgba(0,0,0,0.40); z-index: 1; }
        .m02svc-hover-overlay {
          position: absolute; inset: 0; background: ${ORANGE}; z-index: 2;
          transform: scaleY(0); transform-origin: bottom;
          transition: transform 0.4s cubic-bezier(.4,0,.2,1); opacity: 0.85;
        }
        .m02svc-item:hover .m02svc-hover-overlay { transform: scaleY(1); }
        .m02svc-content { position: relative; z-index: 3; padding: 32px 28px; display: flex; flex-direction: column; justify-content: space-between; height: 100%; box-sizing: border-box; }
        .m02svc-title { font-family: ${POPPINS}; font-weight: 600; font-size: 16px; color: ${WHITE}; text-transform: uppercase; letter-spacing: 0.04em; line-height: 1.35; margin: 0; }
        .m02svc-desc { font-family: ${POPPINS}; font-weight: 400; font-size: 14px; color: rgba(255,255,255,0.88); line-height: 1.6; margin: 0; }
        @media (max-width: 900px) {
          .m02svc-wrap { grid-template-columns: repeat(2, 1fr); }
          .m02svc-item { height: 320px; }
        }
        @media (max-width: 480px) {
          .m02svc-wrap { grid-template-columns: 1fr; }
          .m02svc-item { height: 280px; }
        }
      `}</style>

      <section data-template="malir-02">
        <div className="m02svc-wrap">
          {items.map((item, i) => (
            <div key={i} className="m02svc-item">
              <GenericEditableImage sectionId={sectionId} field={`items.${i}.image`} src={item.image} alt={item.title} style={{ position: "absolute", inset: 0, zIndex: 0 }}>
                <div className="m02svc-bg" style={{ backgroundImage: `url(${item.image})` }} />
              </GenericEditableImage>
              <div className="m02svc-dark" />
              <div className="m02svc-hover-overlay" />
              <div className="m02svc-content">
                <h4 className="m02svc-title">
                  <GenericEditableText sectionId={sectionId} field={`items.${i}.title`} value={item.title} tag="span">{item.title}</GenericEditableText>
                </h4>
                <p className="m02svc-desc">
                  <GenericEditableText sectionId={sectionId} field={`items.${i}.description`} value={item.description} tag="span">{item.description}</GenericEditableText>
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

// ── malir-02-pricing ─────────────────────────────────────────────────────────
function PricingMalir02({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const ORANGE  = "#ff914d";
  const DARK    = "#1a1a1a";
  const POPPINS = "'Poppins', sans-serif";

  type PriceRow = { name: string; price: string };
  const heading    = typeof content.heading === "string"    ? content.heading    : "Kolik stojí výmalba?";
  const subheading = typeof content.subheading === "string" ? content.subheading : "Výsledná cena se vždy odvíjí od mnoha faktorů — stavu povrchů, plochy, barevnosti a použitých materiálů. Rádi vám zdarma vypracujeme přesnou nabídku přímo na míru.";
  const ctaLabel   = typeof content.ctaLabel === "string"   ? content.ctaLabel   : "Získejte nabídku zdarma";
  const ctaHref    = typeof content.ctaHref === "string"    ? content.ctaHref    : "#kontakty";
  const noteText   = typeof content.note === "string"       ? content.note       : "Orientační ceny bez DPH. Pro přesnou nabídku nás kontaktujte.";
  const pricingImg1 = typeof content.pricingImg1 === "string" ? content.pricingImg1 : "/templates/malir-02/pricing-1.jpg";
  const pricingImg2 = typeof content.pricingImg2 === "string" ? content.pricingImg2 : "/templates/malir-02/pricing-2.jpg";
  const barTitle   = typeof content.barTitle === "string"   ? content.barTitle   : "Nezávazná cenová nabídka";
  const barSub     = typeof content.barSub === "string"     ? content.barSub     : "Přijedeme se podívat a vypracujeme cenovou nabídku zdarma.";
  const barLabel   = typeof content.barLabel === "string"   ? content.barLabel   : "Kontaktovat";
  const items: PriceRow[] = Array.isArray(content.items) && content.items.length
    ? content.items as PriceRow[]
    : [
        { name: "Byt 1+1, 2+kk",                                                price: "5 500 – 8 000 Kč" },
        { name: "Byt 2+1, 3+kk",                                                price: "7 000 – 13 000 Kč" },
        { name: "Byt 3+1 a větší",                                              price: "od 10 000 Kč" },
        { name: "Lakýrnické práce – okna, dveře, zárubně",                      price: "od 300 Kč / m²" },
        { name: "Lakýrnické práce – okapy, parapety, zábradlí",                 price: "100 Kč / bm" },
      ];

  return (
    <>
      <style>{`
        .m02pr-wrap {
          position: relative; overflow: hidden;
          background: #fafafa;
        }
        /* giant decorative watermark */
        .m02pr-watermark {
          position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
          font-family: ${POPPINS}; font-weight: 900; font-size: clamp(120px, 18vw, 240px);
          color: rgba(0,0,0,0.04); white-space: nowrap; pointer-events: none;
          user-select: none; letter-spacing: -0.02em; line-height: 1;
        }
        .m02pr-inner {
          position: relative; z-index: 1;
          max-width: 1200px; margin: 0 auto; padding: 96px 32px;
          display: grid; grid-template-columns: 1fr 1fr; gap: 80px; align-items: start;
        }
        /* ── left col ── */
        .m02pr-kicker {
          font-family: ${POPPINS}; font-weight: 700; font-size: 11px;
          letter-spacing: 0.18em; text-transform: uppercase; color: ${ORANGE};
          margin: 0 0 18px; display: flex; align-items: center; gap: 10px;
        }
        .m02pr-kicker::after { content: ''; flex: 0 0 40px; height: 2px; background: ${ORANGE}; }
        .m02pr-h2 {
          font-family: ${POPPINS}; font-weight: 800; font-size: clamp(28px, 3vw, 42px);
          color: ${DARK}; line-height: 1.15; margin: 0 0 24px; letter-spacing: -0.02em;
        }
        .m02pr-sub {
          font-family: ${POPPINS}; font-size: 15px; color: #666;
          line-height: 1.75; margin: 0 0 36px;
        }
        .m02pr-cta {
          display: inline-flex; align-items: center; gap: 10px;
          background: ${DARK}; color: #fff;
          font-family: ${POPPINS}; font-weight: 600; font-size: 13px;
          letter-spacing: 0.06em; text-transform: uppercase; text-decoration: none;
          padding: 16px 32px; transition: background 0.2s;
        }
        .m02pr-cta:hover { background: ${ORANGE}; }
        .m02pr-cta svg { transition: transform 0.2s; }
        .m02pr-cta:hover svg { transform: translateX(4px); }
        /* image strip */
        .m02pr-imgstrip {
          display: grid; grid-template-columns: 3fr 2fr; gap: 8px; margin-top: 44px;
        }
        .m02pr-imgstrip img { width: 100%; height: 220px; object-fit: cover; display: block; }
        /* ── right col ── */
        .m02pr-table-head {
          font-family: ${POPPINS}; font-weight: 700; font-size: 12px;
          letter-spacing: 0.14em; text-transform: uppercase; color: #aaa;
          display: flex; justify-content: space-between;
          padding-bottom: 14px; border-bottom: 2px solid ${DARK};
          margin-bottom: 0;
        }
        .m02pr-row {
          display: flex; align-items: center;
          padding: 20px 0; border-bottom: 1px solid #e4e4e4;
          gap: 16px;
        }
        .m02pr-row-num {
          font-family: ${POPPINS}; font-weight: 800; font-size: 13px;
          color: ${ORANGE}; min-width: 28px; letter-spacing: 0.04em;
        }
        .m02pr-row-name {
          font-family: ${POPPINS}; font-size: 15px; font-weight: 500;
          color: ${DARK}; flex: 1; line-height: 1.4;
        }
        .m02pr-row-price {
          font-family: ${POPPINS}; font-weight: 800; font-size: 15px;
          color: ${ORANGE}; white-space: nowrap; letter-spacing: -0.01em;
        }
        .m02pr-note {
          font-family: ${POPPINS}; font-size: 12px; color: #aaa;
          margin-top: 20px; line-height: 1.7; font-style: italic;
        }
        /* total CTA bar */
        .m02pr-bar {
          margin-top: 36px; background: ${ORANGE};
          padding: 24px 28px; display: flex; align-items: center; justify-content: space-between; gap: 16px;
        }
        .m02pr-bar-text {
          font-family: ${POPPINS}; font-weight: 700; font-size: 16px; color: #fff; line-height: 1.35;
        }
        .m02pr-bar-text span { display: block; font-weight: 400; font-size: 13px; opacity: 0.85; margin-top: 3px; }
        .m02pr-bar-btn {
          background: #fff; color: ${DARK};
          font-family: ${POPPINS}; font-weight: 700; font-size: 12px;
          letter-spacing: 0.08em; text-transform: uppercase; text-decoration: none;
          padding: 12px 22px; white-space: nowrap; flex-shrink: 0;
          transition: background 0.2s, color 0.2s;
        }
        .m02pr-bar-btn:hover { background: ${DARK}; color: #fff; }
        @media (max-width: 960px) {
          .m02pr-inner { grid-template-columns: 1fr; gap: 48px; padding: 64px 24px; }
        }
        @media (max-width: 480px) {
          .m02pr-imgstrip img { height: 140px; }
          .m02pr-bar { flex-direction: column; align-items: flex-start; }
        }
      `}</style>

      <section className="m02pr-wrap" id="cenik" data-template="malir-02">
        <div className="m02pr-watermark" aria-hidden="true">CENÍK</div>
        <div className="m02pr-inner">

          {/* ── LEFT ── */}
          <div>
            <p className="m02pr-kicker">Orientační ceník</p>
            <h2 className="m02pr-h2">
              <GenericEditableText sectionId={sectionId} field="heading" value={heading} tag="span">{heading}</GenericEditableText>
            </h2>
            <p className="m02pr-sub">
              <GenericEditableText sectionId={sectionId} field="subheading" value={subheading} tag="span">{subheading}</GenericEditableText>
            </p>
            <a href={ctaHref} data-btn="primary" className="m02pr-cta">
              <GenericEditableText sectionId={sectionId} field="ctaLabel" value={ctaLabel} tag="span">{ctaLabel}</GenericEditableText>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </a>
            <div className="m02pr-imgstrip">
              <GenericEditableImage sectionId={sectionId} field="pricingImg1" src={pricingImg1} alt="Malování interiéru" style={{}}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img loading="lazy" src={pricingImg1} alt="Malování interiéru" />
              </GenericEditableImage>
              <GenericEditableImage sectionId={sectionId} field="pricingImg2" src={pricingImg2} alt="Výsledek práce" style={{}}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img loading="lazy" src={pricingImg2} alt="Výsledek práce" />
              </GenericEditableImage>
            </div>
          </div>

          {/* ── RIGHT ── */}
          <div>
            <div className="m02pr-table-head">
              <span>Typ práce</span>
              <span>Orientační cena</span>
            </div>
            {items.map((row, i) => (
              <div key={i} className="m02pr-row">
                <span className="m02pr-row-num">{String(i + 1).padStart(2, "0")}.</span>
                <span className="m02pr-row-name">
                  <GenericEditableText sectionId={sectionId} field={`items.${i}.name`} value={row.name} tag="span">{row.name}</GenericEditableText>
                </span>
                <span className="m02pr-row-price">
                  <GenericEditableText sectionId={sectionId} field={`items.${i}.price`} value={row.price} tag="span">{row.price}</GenericEditableText>
                </span>
              </div>
            ))}
            <p className="m02pr-note">
              <GenericEditableText sectionId={sectionId} field="note" value={noteText} tag="span">{noteText}</GenericEditableText>
            </p>
            <div className="m02pr-bar">
              <div className="m02pr-bar-text">
                <GenericEditableText sectionId={sectionId} field="barTitle" value={barTitle} tag="span">{barTitle}</GenericEditableText>
                <span><GenericEditableText sectionId={sectionId} field="barSub" value={barSub} tag="span">{barSub}</GenericEditableText></span>
              </div>
              <a href={ctaHref} data-btn="primary" className="m02pr-bar-btn"><GenericEditableText sectionId={sectionId} field="barLabel" value={barLabel} tag="span">{barLabel}</GenericEditableText></a>
            </div>
          </div>

        </div>
      </section>
    </>
  );
}

// ── hotel-02-rooms ────────────────────────────────────────────────────────────
function ServicesHotel02Rooms({ content, sectionId, isAdmin }: { content: Record<string, unknown>; sectionId: number; tenantSlug?: string; isAdmin: boolean }) {
  const c        = (content ?? {}) as Record<string, any>;
  const eyebrow  = c.eyebrow  ?? "Ubytování";
  const title    = c.title    ?? "Pokoje pro každou příležitost";
  const subtitle = c.subtitle ?? "";
  const items: { name: string; description: string; image: string; moreHref: string; bookHref: string }[] = Array.isArray(c.items) ? c.items : [];

  const resolve = (href: string) => (isAdmin ? "#" : href ?? "#");

  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300&family=Montserrat:wght@300;400;500;600&display=swap" />
      <style>{`        .h02rooms {
          background: #fff;
          padding: clamp(70px,9vw,110px) 0;
          font-family: 'Montserrat', sans-serif;
        }
        .h02rooms-header {
          max-width: 1200px; margin: 0 auto clamp(52px,7vw,80px);
          padding: 0 clamp(20px,5vw,80px); text-align: center;
        }
        .h02rooms-eyebrow {
          font-size: 10px; font-weight: 500; letter-spacing: 0.28em;
          text-transform: uppercase; color: #96A1AC; margin: 0 0 16px; display: block;
        }
        .h02rooms-title {
          font-family: 'Cormorant Garamond', Georgia, serif;
          font-size: clamp(28px,3.2vw,44px); font-weight: 300;
          color: #1a2332; line-height: 1.2; margin: 0 0 16px;
        }
        .h02rooms-subtitle {
          font-size: 14px; color: #6b7280; font-weight: 300;
          max-width: 640px; margin: 0 auto; line-height: 1.8;
        }
        .h02rooms-list {
          max-width: 1200px; margin: 0 auto;
          display: flex; flex-direction: column; gap: clamp(56px,8vw,100px);
          padding: 0 clamp(20px,5vw,80px);
        }
        .h02rooms-row {
          display: grid; grid-template-columns: 3fr 2fr;
          align-items: center; gap: 0;
          box-shadow: 0 2px 24px rgba(26,35,50,0.06);
        }
        .h02rooms-row.reverse { grid-template-columns: 2fr 3fr; }
        .h02rooms-row.reverse .h02rooms-img-col { order: 2; }
        .h02rooms-row.reverse .h02rooms-text-col { order: 1; }
        .h02rooms-img-col { overflow: hidden; aspect-ratio: 3/2; }
        .h02rooms-img {
          width: 100%; height: 100%; object-fit: cover; display: block;
          transition: transform 0.65s ease;
        }
        .h02rooms-img-col:hover .h02rooms-img { transform: scale(1.04); }
        .h02rooms-text-col {
          padding: clamp(52px,6vw,96px) clamp(28px,4vw,72px);
        }
        .h02rooms-room-num {
          font-family: 'Cormorant Garamond', Georgia, serif;
          font-size: 11px; font-weight: 400; letter-spacing: 0.3em;
          color: #96A1AC; text-transform: uppercase; display: block; margin: 0 0 12px;
        }
        .h02rooms-room-name {
          font-family: 'Cormorant Garamond', Georgia, serif;
          font-size: clamp(22px,2.4vw,34px); font-weight: 300;
          color: #1a2332; line-height: 1.2; margin: 0 0 20px;
        }
        .h02rooms-rule {
          width: 36px; height: 1.5px; background: #96A1AC;
          margin: 0 0 20px; border: none;
        }
        .h02rooms-room-desc {
          font-size: 14px; line-height: 1.85; color: #6b7280;
          font-weight: 300; margin: 0 0 32px;
        }
        .h02rooms-ctas { display: flex; gap: 12px; flex-wrap: wrap; }
        .h02rooms-more {
          display: inline-flex; align-items: center;
          border: 1.5px solid #96A1AC; color: #96A1AC; background: transparent;
          font-family: 'Montserrat', sans-serif;
          font-size: 10px; font-weight: 600; letter-spacing: 0.18em; text-transform: uppercase;
          padding: 11px 24px; text-decoration: none; transition: background 0.2s, color 0.2s;
        }
        .h02rooms-more:hover { background: #96A1AC; color: #fff; }
        .h02rooms-book {
          display: inline-flex; align-items: center; gap: 8px;
          background: #1a2332; color: #fff; border: 1.5px solid #1a2332;
          font-family: 'Montserrat', sans-serif;
          font-size: 10px; font-weight: 600; letter-spacing: 0.18em; text-transform: uppercase;
          padding: 11px 24px; text-decoration: none; transition: background 0.2s;
        }
        .h02rooms-book:hover { background: #2d3f57; border-color: #2d3f57; }
        @media (max-width: 860px) {
          .h02rooms-row,
          .h02rooms-row.reverse { grid-template-columns: 1fr; }
          .h02rooms-row.reverse .h02rooms-img-col { order: 0; }
          .h02rooms-row.reverse .h02rooms-text-col { order: 0; }
          .h02rooms-img-col { aspect-ratio: 16/9; }
          .h02rooms-list { padding: 0 20px; }
        }
      `}</style>

      <section className="h02rooms" id="ubytovani" data-template="hotel-02-rooms">
        <div className="h02rooms-header">
          <span className="h02rooms-eyebrow">
            <GenericEditableText sectionId={sectionId} field="eyebrow" value={eyebrow} tag="span" />
          </span>
          <h2 className="h02rooms-title">
            <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
          </h2>
          {subtitle && (
            <p className="h02rooms-subtitle">
              <GenericEditableText sectionId={sectionId} field="subtitle" value={subtitle} tag="span" />
            </p>
          )}
        </div>

        <div className="h02rooms-list">
          {items.map((item, i) => (
            <div key={i} className={`h02rooms-row${i % 2 === 1 ? " reverse" : ""}`}>
              <div className="h02rooms-img-col">
                <GenericEditableImage sectionId={sectionId} field={`items.${i}.image`} src={item.image || "/placeholder.jpg"} alt={item.name} style={{ width: "100%", height: "100%" }}>
                  <img src={item.image || "/placeholder.jpg"} alt={item.name} className="h02rooms-img" loading="lazy" />
                </GenericEditableImage>
              </div>
              <div className="h02rooms-text-col">
                <span className="h02rooms-room-num">Pokoj {String(i + 1).padStart(2, "0")}</span>
                <h3 className="h02rooms-room-name">
                  <GenericEditableText sectionId={sectionId} field={`items.${i}.name`} value={item.name} tag="span" />
                </h3>
                <hr className="h02rooms-rule" />
                <p className="h02rooms-room-desc">
                  <GenericEditableText sectionId={sectionId} field={`items.${i}.description`} value={item.description} tag="span" />
                </p>
                <div className="h02rooms-ctas">
                  <a href={resolve(item.moreHref)} className="h02rooms-more">Více informací</a>
                  <a href={resolve(item.bookHref)} className="h02rooms-book">
                    Rezervovat
                    <svg width="14" height="9" viewBox="0 0 14 9" fill="none"><path d="M1 4.5h12M9 1l4 3.5L9 8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
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


// ── events-01-services ────────────────────────────────────────────────────────
// Prémiová event-agentura: 3-col dark grid s gold hairline eyebrow, Playfair H2,
// dark cards s gold gradient icon sphere, hover: expand corner brackets +
// gold hairline lift, stagger fade-in reveal (anti-flash na cards). Awwwards.
// ─────────────────────────────────────────────────────────────────────────────
function ServicesEvents01({ content, sectionId, tenantSlug, isAdmin }: { content: Record<string, unknown>; sectionId: number; tenantSlug?: string; isAdmin?: boolean }) {
  const GOLD = "#d4b896";
  const showHeader = content.showHeader !== false;
  const eyebrow    = String(content.eyebrow  ?? "Naše specializace");
  const title      = String(content.title    ?? "Co pro vás připravíme");
  const linkLabel  = String(content.linkLabel ?? "Zjistit více");
  const linkHref   = String(content.linkHref  ?? "/sluzby");
  const resolve    = (href: string) => resolveDemoHref(href, tenantSlug, isAdmin);
  const items      = (content.items as Array<{ icon?: string; title?: string; name?: string; description: string; href?: string }>) ?? [];

  return (
    <>
      <style>{`
        .ev01svc {
          position: relative;
          padding: 140px 40px 130px;
          background: #0f0f0f;
          overflow: hidden;
        }
        .ev01svc::before {
          content: "";
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent 0%, rgba(212,184,150,0.16) 50%, transparent 100%);
        }
        .ev01svc-inner { max-width: 1240px; margin: 0 auto; }
        .ev01svc-head { text-align: center; margin-bottom: 90px; }
        .ev01svc-eyebrow {
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
        .ev01svc-eyebrow::before,
        .ev01svc-eyebrow::after {
          content: "";
          display: block;
          width: 44px;
          height: 1px;
          background: linear-gradient(90deg, transparent 0%, ${GOLD} 100%);
        }
        .ev01svc-eyebrow::after {
          background: linear-gradient(90deg, ${GOLD} 0%, transparent 100%);
        }
        .ev01svc-h2 {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: clamp(34px, 4vw, 56px);
          font-weight: 400;
          margin: 0;
          color: #fff;
          letter-spacing: -0.01em;
          line-height: 1.1;
        }
        .ev01svc-h2 em {
          font-style: italic;
          color: ${GOLD};
        }
        .ev01svc-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 28px;
        }
        .ev01svc-card {
          position: relative;
          padding: 56px 36px 48px;
          background: linear-gradient(180deg, #181818 0%, #131313 100%);
          border: 1px solid rgba(212,184,150,0.08);
          text-align: center;
          transition:
            border-color 0.5s cubic-bezier(.32,.72,0,1),
            transform 0.5s cubic-bezier(.32,.72,0,1),
            box-shadow 0.5s cubic-bezier(.32,.72,0,1),
            background 0.5s cubic-bezier(.32,.72,0,1);
          opacity: 0;
          transform: translateY(20px);
          animation: ev01svcReveal 1s cubic-bezier(.32,.72,0,1) forwards;
        }
        .ev01svc-card:nth-child(1) { animation-delay: 0.1s; }
        .ev01svc-card:nth-child(2) { animation-delay: 0.25s; }
        .ev01svc-card:nth-child(3) { animation-delay: 0.4s; }
        .ev01svc-card:nth-child(4) { animation-delay: 0.55s; }
        .ev01svc-card:nth-child(5) { animation-delay: 0.7s; }
        .ev01svc-card:nth-child(6) { animation-delay: 0.85s; }
        @keyframes ev01svcReveal {
          to { opacity: 1; transform: translateY(0); }
        }
        .ev01svc-card::before,
        .ev01svc-card::after {
          content: "";
          position: absolute;
          width: 22px;
          height: 22px;
          border: 1px solid ${GOLD};
          opacity: 0;
          transition: opacity 0.5s cubic-bezier(.32,.72,0,1), width 0.5s cubic-bezier(.32,.72,0,1), height 0.5s cubic-bezier(.32,.72,0,1);
          pointer-events: none;
        }
        .ev01svc-card::before {
          top: -1px; left: -1px;
          border-right: none;
          border-bottom: none;
        }
        .ev01svc-card::after {
          bottom: -1px; right: -1px;
          border-left: none;
          border-top: none;
        }
        .ev01svc-card:hover {
          border-color: rgba(212,184,150,0.28);
          transform: translateY(-6px);
          background: linear-gradient(180deg, #1c1c1c 0%, #141414 100%);
          box-shadow: 0 30px 60px -20px rgba(0,0,0,0.6), 0 0 0 1px rgba(212,184,150,0.06);
        }
        .ev01svc-card:hover::before,
        .ev01svc-card:hover::after {
          opacity: 1;
          width: 30px;
          height: 30px;
        }
        .ev01svc-icon-wrap {
          position: relative;
          width: 76px;
          height: 76px;
          margin: 0 auto 32px;
        }
        .ev01svc-icon-ring {
          position: absolute;
          inset: -6px;
          border-radius: 50%;
          border: 1px solid rgba(212,184,150,0.18);
          transform: scale(0.9);
          opacity: 0;
          transition: transform 0.6s cubic-bezier(.32,.72,0,1), opacity 0.6s cubic-bezier(.32,.72,0,1);
        }
        .ev01svc-card:hover .ev01svc-icon-ring {
          transform: scale(1);
          opacity: 1;
        }
        .ev01svc-icon {
          width: 76px;
          height: 76px;
          border-radius: 50%;
          background: linear-gradient(135deg, #d4b896 0%, #a08560 100%);
          color: #0a0a0a;
          font-size: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 500;
          font-family: 'Playfair Display', serif;
          box-shadow: 0 8px 24px -6px rgba(212,184,150,0.28);
          transition: transform 0.6s cubic-bezier(.32,.72,0,1), box-shadow 0.6s cubic-bezier(.32,.72,0,1);
        }
        .ev01svc-card:hover .ev01svc-icon {
          transform: rotate(-8deg) scale(1.04);
          box-shadow: 0 14px 36px -8px rgba(212,184,150,0.45);
        }
        .ev01svc-card h3 {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: 24px;
          font-weight: 500;
          margin: 0 0 18px;
          color: #fff;
          letter-spacing: -0.005em;
        }
        .ev01svc-card p {
          font-family: 'Inter', sans-serif;
          font-size: 14.5px;
          line-height: 1.75;
          color: rgba(255,255,255,0.62);
          margin: 0 0 28px;
          letter-spacing: 0.1px;
        }
        .ev01svc-link {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          font-family: 'Inter', sans-serif;
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 2.6px;
          text-transform: uppercase;
          color: ${GOLD};
          text-decoration: none;
          padding-bottom: 4px;
          border-bottom: 1px solid rgba(212,184,150,0.22);
          transition: color 0.4s cubic-bezier(.32,.72,0,1), border-color 0.4s cubic-bezier(.32,.72,0,1), gap 0.4s cubic-bezier(.32,.72,0,1);
        }
        .ev01svc-link svg { transition: transform 0.4s cubic-bezier(.32,.72,0,1); }
        .ev01svc-card:hover .ev01svc-link { color: #f0d9b8; border-color: ${GOLD}; gap: 14px; }
        .ev01svc-card:hover .ev01svc-link svg { transform: translateX(3px); }
        @media (max-width: 900px) {
          .ev01svc { padding: 90px 24px 80px; }
          .ev01svc-grid { grid-template-columns: 1fr; gap: 20px; }
          .ev01svc-head { margin-bottom: 60px; }
          .ev01svc-card { padding: 44px 28px 40px; }
        }
      `}</style>
      <section className="ev01svc" id="sluzby" data-template="events-01-services">
        <div className="ev01svc-inner">
          {showHeader && (
            <div className="ev01svc-head">
              {eyebrow && (
                <div className="ev01svc-eyebrow">
                  <GenericEditableText sectionId={sectionId} field="eyebrow" value={eyebrow} tag="span">{eyebrow}</GenericEditableText>
                </div>
              )}
              {title && (
                <GenericEditableText sectionId={sectionId} field="title" value={title} tag="h2">
                  <h2 className="ev01svc-h2">{title}</h2>
                </GenericEditableText>
              )}
            </div>
          )}
          <div className="ev01svc-grid">
            {items.map((item, i) => {
              const name = String(item.title ?? item.name ?? "");
              const cardHref = item.href ?? linkHref;
              return (
                <div className="ev01svc-card" key={i}>
                  <div className="ev01svc-icon-wrap">
                    <div className="ev01svc-icon-ring" />
                    <div className="ev01svc-icon">{String(item.icon ?? "★")}</div>
                  </div>
                  <GenericEditableText sectionId={sectionId} field={`items.${i}.title`} value={name} tag="h3"><h3>{name}</h3></GenericEditableText>
                  <GenericEditableText sectionId={sectionId} field={`items.${i}.description`} value={item.description} tag="p"><p>{item.description}</p></GenericEditableText>
                  {linkLabel && (
                    <a href={resolve(cardHref)} className="ev01svc-link" aria-label={`${linkLabel} — ${name}`}>
                      <GenericEditableText sectionId={sectionId} field="linkLabel" value={linkLabel} tag="span">{linkLabel}</GenericEditableText>
                      <svg width="16" height="8" viewBox="0 0 16 8" fill="none" stroke="currentColor" strokeWidth="1"><path d="M0 4h14M11 1l3 3-3 3"/></svg>
                    </a>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}

// ── dj-01-services ────────────────────────────────────────────────────────────
// LUXE REDESIGN (Neon Nocturne — vasdj.cz Awwwards edition):
// - Preserved: bg světlé, 4×2 flex-wrap grid, čtverec tiles (padding-top:100%), 2-col mobile
// - Enhanced: warm off-white bg #f7f5f0 s subtle dark rim overlay
// - Tiles: midnight #0a0a0c bg + Unsplash WebP + duální overlay (dark gradient + orange radial bottom)
// - Content preserved centered: JBM Mono counter top-left "01." → Space Grotesk H3 → Inter Tight subtitle
// - Hover: image scale(1.06) + darkens overlay + orange 2px gradient border slides in from top + EQ-bar corner glow
// - IntersectionObserver stagger fade-up reveal na tiles (opacity:0 ONLY on inner tiles, NE na section wrapperu — anti-flash)
// ──────────────────────────────────────────────────────────────────────────────
function ServicesDj01({ content, sectionId, tenantSlug, isAdmin }: { content: Record<string, unknown>; sectionId: number; tenantSlug?: string; isAdmin: boolean }) {
  const ORANGE = "#f15a24";
  const AMBER  = "#ff8347";
  const WHITE  = "#ffffff";

  const heading = String(content.heading ?? "Služby");
  const items   = (content.services ?? content.items ?? []) as Array<Record<string, unknown>>;
  const ctaText = String(content.ctaText ?? "");
  const ctaHref = String(content.ctaHref ?? "#kontakt");

  const resolve = (href: string) => {
    if (tenantSlug && href.startsWith("#")) return `/demo/${tenantSlug}${isAdmin ? "/admin" : ""}${href}`;
    return href;
  };

  return (
    <>
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=JetBrains+Mono:wght@400;500&family=Inter+Tight:wght@300;400&display=swap" />
      <style>{`
        @keyframes dj01svc-reveal { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
        .dj01svc {
          position: relative;
          background: #f7f5f0;
          padding: 5.5rem 1.5rem 6rem;
          overflow: hidden;
        }
        .dj01svc::before {
          content: "";
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent 0%, rgba(10,10,12,0.12) 50%, transparent 100%);
        }
        .dj01svc-inner { max-width: 1280px; margin: 0 auto; }
        .dj01svc-h2 { display: none; }
        .dj01svc-grid {
          display: flex;
          flex-wrap: wrap;
          margin: 0 -0.4rem -0.8rem;
          justify-content: center;
          list-style: none;
          padding: 0;
        }
        .dj01svc-item {
          box-sizing: border-box;
          width: 25%;
          padding: 0 0.4rem;
          margin-bottom: 0.8rem;
          opacity: 0;
          animation: dj01svc-reveal 780ms cubic-bezier(.2,.7,.2,1) both;
        }
        .dj01svc-item:nth-child(1) { animation-delay:  60ms; }
        .dj01svc-item:nth-child(2) { animation-delay: 140ms; }
        .dj01svc-item:nth-child(3) { animation-delay: 220ms; }
        .dj01svc-item:nth-child(4) { animation-delay: 300ms; }
        .dj01svc-item:nth-child(5) { animation-delay: 380ms; }
        .dj01svc-item:nth-child(6) { animation-delay: 460ms; }
        .dj01svc-item:nth-child(7) { animation-delay: 540ms; }
        .dj01svc-item:nth-child(8) { animation-delay: 620ms; }
        .dj01svc-wrapper {
          position: relative;
          background: #0a0a0c;
          overflow: hidden;
          isolation: isolate;
        }
        .dj01svc-wrapper::before {
          content: "";
          float: left;
          padding-top: 100%;
          position: relative;
        }
        .dj01svc-wrapper::after {
          content: "";
          display: table;
          clear: both;
        }
        .dj01svc-link {
          position: absolute;
          inset: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-decoration: none;
          color: ${WHITE};
          padding: 1.4rem;
          box-sizing: border-box;
          overflow: hidden;
          transition: transform 380ms cubic-bezier(.2,.7,.2,1);
        }
        .dj01svc-link::after {
          content: "";
          position: absolute;
          inset: 0;
          background:
            radial-gradient(80% 60% at 50% 110%, rgba(241,90,36,0.28) 0%, rgba(241,90,36,0) 60%),
            linear-gradient(180deg, rgba(10,10,12,0.35) 0%, rgba(10,10,12,0.5) 55%, rgba(10,10,12,0.82) 100%);
          z-index: 1;
          transition: background 380ms cubic-bezier(.2,.7,.2,1);
          pointer-events: none;
        }
        .dj01svc-link:hover::after {
          background:
            radial-gradient(90% 65% at 50% 110%, rgba(241,90,36,0.42) 0%, rgba(241,90,36,0.05) 65%),
            linear-gradient(180deg, rgba(10,10,12,0.5) 0%, rgba(10,10,12,0.65) 55%, rgba(10,10,12,0.92) 100%);
        }
        .dj01svc-bg-wrap {
          position: absolute;
          inset: 0;
          overflow: hidden;
          z-index: 0;
        }
        .dj01svc-bg {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          transform: scale(1.02);
          filter: grayscale(0.1) contrast(1.05) brightness(0.85);
          transition: transform 900ms cubic-bezier(.2,.7,.2,1), filter 380ms cubic-bezier(.2,.7,.2,1);
        }
        .dj01svc-link:hover .dj01svc-bg {
          transform: scale(1.08);
          filter: grayscale(0) contrast(1.1) brightness(0.95);
        }
        .dj01svc-topbar {
          content: "";
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 2px;
          background: linear-gradient(90deg, ${ORANGE} 0%, ${AMBER} 100%);
          transform: scaleX(0);
          transform-origin: left center;
          transition: transform 480ms cubic-bezier(.2,.7,.2,1);
          z-index: 3;
          pointer-events: none;
        }
        .dj01svc-link:hover .dj01svc-topbar { transform: scaleX(1); }
        .dj01svc-counter {
          position: absolute;
          top: 1.1rem; left: 1.2rem;
          font-family: 'JetBrains Mono', ui-monospace, monospace;
          font-weight: 500;
          font-size: 0.72rem;
          letter-spacing: 0.26em;
          color: rgba(255,255,255,0.55);
          text-transform: uppercase;
          z-index: 2;
          transition: color 300ms cubic-bezier(.2,.7,.2,1);
        }
        .dj01svc-link:hover .dj01svc-counter { color: ${ORANGE}; }
        .dj01svc-eq {
          position: absolute;
          top: 1.1rem; right: 1.2rem;
          display: inline-flex;
          align-items: flex-end;
          gap: 2px;
          height: 14px;
          z-index: 2;
          opacity: 0;
          transition: opacity 300ms cubic-bezier(.2,.7,.2,1);
        }
        .dj01svc-link:hover .dj01svc-eq { opacity: 1; }
        .dj01svc-eq span {
          display: block;
          width: 2px;
          background: linear-gradient(180deg, ${AMBER} 0%, ${ORANGE} 100%);
          transform-origin: bottom center;
          animation: dj01svc-bar 1s cubic-bezier(.4,.0,.2,1) infinite;
        }
        .dj01svc-eq span:nth-child(1) { height: 55%; animation-delay:   0ms; }
        .dj01svc-eq span:nth-child(2) { height: 100%;animation-delay:  90ms; }
        .dj01svc-eq span:nth-child(3) { height: 70%; animation-delay: 180ms; }
        .dj01svc-eq span:nth-child(4) { height: 90%; animation-delay: 270ms; }
        @keyframes dj01svc-bar { 0%,100% { transform: scaleY(0.35); } 50% { transform: scaleY(1); } }
        .dj01svc-body {
          position: relative;
          z-index: 2;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
        }
        .dj01svc-title {
          color: ${WHITE};
          font-family: 'Space Grotesk', sans-serif;
          font-size: clamp(1.2rem, 1.7vw, 1.65rem);
          font-weight: 700;
          line-height: 1.05;
          margin: 0;
          text-transform: uppercase;
          letter-spacing: 0.03em;
          transition: color 280ms cubic-bezier(.2,.7,.2,1), transform 380ms cubic-bezier(.2,.7,.2,1);
        }
        .dj01svc-link:hover .dj01svc-title { color: ${ORANGE}; transform: translateY(-2px); }
        .dj01svc-sub {
          font-family: 'Inter Tight', sans-serif;
          font-size: 0.9rem;
          font-weight: 300;
          line-height: 1.45;
          margin: 0;
          color: rgba(255,255,255,0.72);
          max-width: 90%;
          transition: color 280ms cubic-bezier(.2,.7,.2,1);
        }
        .dj01svc-link:hover .dj01svc-sub { color: rgba(255,255,255,0.9); }
        .dj01svc-arrow {
          margin-top: 0.4rem;
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.7rem;
          letter-spacing: 0.26em;
          color: rgba(255,255,255,0.5);
          text-transform: uppercase;
          opacity: 0;
          transform: translateY(8px);
          transition: opacity 320ms cubic-bezier(.2,.7,.2,1), transform 380ms cubic-bezier(.2,.7,.2,1), color 280ms cubic-bezier(.2,.7,.2,1);
        }
        .dj01svc-link:hover .dj01svc-arrow {
          opacity: 1;
          transform: translateY(0);
          color: ${ORANGE};
        }
        .dj01svc-cta {
          text-align: center;
          margin-top: 3rem;
        }
        .dj01svc-cta a {
          display: inline-flex;
          align-items: center;
          gap: 0.75rem;
          color: #0a0a0c;
          font-family: 'JetBrains Mono', monospace;
          font-weight: 500;
          font-size: 0.78rem;
          text-transform: uppercase;
          letter-spacing: 0.22em;
          text-decoration: none;
          padding: 1rem 1.75rem;
          border: 1px solid rgba(10,10,12,0.14);
          position: relative;
          overflow: hidden;
          transition: color 320ms cubic-bezier(.2,.7,.2,1), border-color 320ms cubic-bezier(.2,.7,.2,1);
        }
        .dj01svc-cta a::before {
          content: "";
          position: absolute;
          inset: 0;
          background: linear-gradient(90deg, ${ORANGE} 0%, ${AMBER} 100%);
          transform: scaleX(0);
          transform-origin: left center;
          transition: transform 480ms cubic-bezier(.2,.7,.2,1);
          z-index: 0;
        }
        .dj01svc-cta a > span { position: relative; z-index: 1; }
        .dj01svc-cta a:hover { color: ${WHITE}; border-color: ${ORANGE}; }
        .dj01svc-cta a:hover::before { transform: scaleX(1); }
        @media (max-width: 960px) {
          .dj01svc-title { font-size: 1.2rem; }
          .dj01svc-sub   { font-size: 0.82rem; }
          .dj01svc-link  { padding: 1rem; }
          .dj01svc-counter, .dj01svc-eq { top: 0.75rem; }
          .dj01svc-counter { left: 0.9rem; font-size: 0.66rem; }
          .dj01svc-eq { right: 0.9rem; }
        }
        @media (max-width: 700px) {
          .dj01svc { padding: 4rem 1.25rem 4.5rem; }
          .dj01svc-item  { width: 50%; }
        }
        @media (max-width: 480px) {
          .dj01svc-title { font-size: 1.05rem; }
          .dj01svc-sub   { font-size: 0.78rem; }
        }
        @media (prefers-reduced-motion: reduce) {
          .dj01svc-item, .dj01svc-bg, .dj01svc-title, .dj01svc-sub, .dj01svc-arrow, .dj01svc-eq span {
            animation: none !important; transition: none !important; opacity: 1 !important; transform: none !important;
          }
        }
      `}</style>

      <section className="dj01svc" id="sluzby" data-template="dj-01-services">
        <div className="dj01svc-inner">
          <GenericEditableText sectionId={sectionId} field="heading" value={heading} tag="h2" className="dj01svc-h2">
            {heading}
          </GenericEditableText>
          <ul className="dj01svc-grid">
            {items.map((item, i) => {
              const name     = String(item.name     ?? item.title ?? `Služba ${i + 1}`);
              const subtitle = String(item.subtitle ?? "");
              const imageUrl = String(item.imageUrl ?? "");
              const href     = resolve(String(item.href ?? "#sluzby"));
              const counter  = String(i + 1).padStart(2, "0");
              return (
                <li key={i} className="dj01svc-item">
                  <div className="dj01svc-wrapper">
                    <a href={href} className="dj01svc-link" title={name}>
                      {imageUrl && (
                        <GenericEditableImage
                          sectionId={sectionId}
                          field={`services.${i}.imageUrl`}
                          src={imageUrl}
                          alt={name}
                          className="dj01svc-bg-wrap"
                          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", zIndex: 0 }}
                        >
                          <img src={imageUrl} alt="" className="dj01svc-bg" loading="lazy" />
                        </GenericEditableImage>
                      )}
                      <span className="dj01svc-topbar" aria-hidden />
                      <span className="dj01svc-counter">{counter}</span>
                      <span className="dj01svc-eq" aria-hidden>
                        <span /><span /><span /><span />
                      </span>
                      <div className="dj01svc-body">
                        <GenericEditableText sectionId={sectionId} field={`services.${i}.name`} value={name} tag="h3" className="dj01svc-title">
                          {name}
                        </GenericEditableText>
                        {subtitle && (
                          <GenericEditableText sectionId={sectionId} field={`services.${i}.subtitle`} value={subtitle} tag="p" className="dj01svc-sub">
                            {subtitle}
                          </GenericEditableText>
                        )}
                        <span className="dj01svc-arrow" aria-hidden>Otevřít →</span>
                      </div>
                    </a>
                  </div>
                </li>
              );
            })}
          </ul>
          {ctaText && (
            <div className="dj01svc-cta">
              <a href={resolve(ctaHref)}>
                <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span">
                  {ctaText}
                </GenericEditableText>
              </a>
            </div>
          )}
        </div>
      </section>
    </>
  );
}

// ── restaurant-04-menu ────────────────────────────────────────────────────────
// Tmavý povrch #152d11, header sekce (kicker + H2 + popis + CTA),
// 3-col grid karet s foto, červená kategorie, Fraunces italic název, body.
// ─────────────────────────────────────────────────────────────────────────────
function ServicesRestaurant04({ content, sectionId, tenantSlug, isAdmin }: { content: Record<string, unknown>; sectionId: number; tenantSlug?: string; isAdmin?: boolean }) {
  const tagline = String(content.tagline ?? "Naše speciality");
  const title   = String(content.title   ?? "Co pro vás\npřipravujeme.");
  const body    = String(content.body    ?? "");
  const ctaText = String(content.ctaText ?? "Zobrazit celé menu");
  const ctaHref = String(content.ctaHref ?? "/menu");
  const items   = (content.items as Array<{ name: string; category?: string; description?: string; image?: string; ctaText?: string; ctaHref?: string }>) ?? [];

  const DARK  = "#0d1f0a";
  const SURF  = "#152d11";
  const SURF2 = "#1a3515";
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
    <section style={{ background: SURF, padding: "clamp(64px, 10vw, 120px) clamp(24px, 6vw, 80px)" }}>
      {/* Header */}
      <div style={{ maxWidth: 1180, margin: "0 auto 56px" }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "clamp(24px,4vw,60px)", alignItems: "flex-end", justifyContent: "space-between" }}>
          <div style={{ flex: "1 1 340px" }}>
            <p style={{
              fontFamily: SANS, fontSize: 11, fontWeight: 700,
              letterSpacing: "0.22em", textTransform: "uppercase",
              color: RED, margin: "0 0 16px",
            }}>
              <GenericEditableText sectionId={sectionId} field="tagline" value={tagline} tag="span" />
            </p>
            <h2 style={{
              fontFamily: SERIF, fontSize: "clamp(28px, 4vw, 50px)", fontWeight: 400,
              fontStyle: "italic", color: CREAM, margin: 0, lineHeight: 1.12,
              whiteSpace: "pre-line",
            }}>
              <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
            </h2>
          </div>
          <div style={{ flex: "1 1 300px" }}>
            {body && (
              <p style={{
                fontFamily: SANS, fontSize: "clamp(14px, 1.4vw, 16px)",
                color: MUTED, lineHeight: 1.7, margin: "0 0 24px",
              }}>
                <GenericEditableText sectionId={sectionId} field="body" value={body} tag="span" />
              </p>
            )}
            <a
              href={resolve(ctaHref)}
              data-btn="primary"
              style={{
                display: "inline-block", fontFamily: SANS, fontSize: 11, fontWeight: 700,
                letterSpacing: "0.14em", textTransform: "uppercase",
                color: CREAM, textDecoration: "none",
                padding: "13px 28px", border: `1px solid ${RED}`, borderRadius: 2,
                transition: "background-color 0.2s, border-color 0.2s",
              }}
              onMouseEnter={e => { e.currentTarget.style.backgroundColor = RED; }}
              onMouseLeave={e => { e.currentTarget.style.backgroundColor = "transparent"; }}
            >
              <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
            </a>
          </div>
        </div>
      </div>

      {/* Karty */}
      <div style={{
        maxWidth: 1180, margin: "0 auto",
        display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24,
      }}
        className="r04-menu-grid"
      >
        {items.map((item, i) => (
          <div key={i} style={{
            background: DARK,
            borderRadius: 2,
            overflow: "hidden",
            display: "flex", flexDirection: "column",
            borderTop: `2px solid ${RED}`,
          }}>
            {/* Foto */}
            {item.image && (
              <div style={{ overflow: "hidden", height: 220 }}>
                <img
                  src={item.image}
                  alt={item.name}
                  style={{
                    width: "100%", height: "100%", objectFit: "cover", display: "block",
                    transition: "transform 0.5s ease",
                  }}
                  onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.05)")}
                  onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
                />
              </div>
            )}
            {/* Obsah */}
            <div style={{ padding: "24px 24px 28px", flex: 1, display: "flex", flexDirection: "column" }}>
              {item.category && (
                <p style={{
                  fontFamily: SANS, fontSize: 10, fontWeight: 700,
                  letterSpacing: "0.2em", textTransform: "uppercase",
                  color: RED, margin: "0 0 10px",
                }}>
                  <GenericEditableText sectionId={sectionId} field={`items.${i}.category`} value={item.category} tag="span" />
                </p>
              )}
              <h3 style={{
                fontFamily: SERIF, fontSize: "clamp(18px, 2vw, 22px)", fontWeight: 400,
                fontStyle: "italic", color: CREAM, margin: "0 0 12px", lineHeight: 1.2,
              }}>
                <GenericEditableText sectionId={sectionId} field={`items.${i}.name`} value={item.name} tag="span" />
              </h3>
              {item.description && (
                <p style={{
                  fontFamily: SANS, fontSize: 14, color: MUTED,
                  lineHeight: 1.65, margin: "0 0 20px", flex: 1,
                }}>
                  <GenericEditableText sectionId={sectionId} field={`items.${i}.description`} value={item.description} tag="span" />
                </p>
              )}
              {item.ctaText && item.ctaHref && (
                <a
                  href={resolve(item.ctaHref)}
                  data-btn="primary"
                  style={{
                    display: "inline-flex", alignItems: "center", gap: 6,
                    fontFamily: SANS, fontSize: 11, fontWeight: 700,
                    letterSpacing: "0.12em", textTransform: "uppercase",
                    color: RED, textDecoration: "none",
                    transition: "gap 0.2s",
                  }}
                  onMouseEnter={e => (e.currentTarget.style.gap = "10px")}
                  onMouseLeave={e => (e.currentTarget.style.gap = "6px")}
                >
                  <GenericEditableText sectionId={sectionId} field={`items.${i}.ctaText`} value={item.ctaText} tag="span" />
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M2 7h10M8 3l4 4-4 4" stroke={RED} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </a>
              )}
            </div>
          </div>
        ))}
      </div>

      <style>{`
        @media (max-width: 900px) { .r04-menu-grid { grid-template-columns: 1fr !important; } }
        @media (min-width: 601px) and (max-width: 900px) { .r04-menu-grid { grid-template-columns: repeat(2, 1fr) !important; } }
      `}</style>
    </section>
  );
}

// ── barber-dark-pricing ───────────────────────────────────────────────────────
// Tmavé #0a0a0a pozadí, 2-col mřížka karet s číslem + názvem + popisem + cenou.
// Zlatý kicker, velký bílý nadpis, oddělující zlatá linka. Poslední nepárová
// položka (např. balíček) se roztáhne na celou šířku jako "featured".
// ─────────────────────────────────────────────────────────────────────────────
function PricingBarberDark({
  content, sectionId, services, title,
}: {
  content: Record<string, unknown>;
  sectionId: number;
  services: { name: string; description: string; price?: string; duration?: string }[];
  title: string;
}) {
  const GOLD   = "#C9A84C";
  const BG     = "#0a0a0a";
  const CARD   = "#111111";
  const BORDER = "rgba(201,168,76,0.14)";
  const TEXT   = "#F5F5F5";
  const MUTED  = "#A0A0A0";
  const SERIF  = "var(--font-heading, Montserrat, sans-serif)";
  const SANS   = "var(--font-body, Inter, sans-serif)";

  const isOdd = services.length % 2 !== 0;
  const mainItems = isOdd ? services.slice(0, -1) : services;
  const featured  = isOdd ? services[services.length - 1] : null;
  const eyebrowRaw  = (content as Record<string, unknown>).eyebrow;
  const subtitleRaw = (content as Record<string, unknown>).subtitle;
  const titleRaw    = (content as Record<string, unknown>).title;
  const eyebrow  = eyebrowRaw === undefined  ? "Klasika & precizní řemeslo" : String(eyebrowRaw);
  const subtitle = subtitleRaw === undefined ? "Každý zákrok provádíme s důrazem na detail, čisté linie a péči o váš osobní styl. Ceny jsou konečné, bez skrytých poplatků." : String(subtitleRaw);
  const showHeader = !!(eyebrow.trim() || (titleRaw !== "" && title.trim()) || subtitle.trim());
  const footnote = String((content as Record<string, unknown>).footnote ?? "Ceny jsou orientační — finální cena závisí na délce vlasů a vousů. Rezervace minimálně 24h předem.");
  const ctaText  = String((content as Record<string, unknown>).ctaText  ?? "Rezervovat termín");
  const ctaHref  = String((content as Record<string, unknown>).ctaHref  ?? "#rezervace");

  return (
    <section id="sluzby" style={{ backgroundColor: BG, padding: "clamp(80px, 12vw, 130px) 24px", position: "relative", overflow: "hidden" }} data-template="barber-01">
      <style>{`
        .bc-pricing-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 2px;
          max-width: 960px;
          margin: 0 auto;
        }
        .bc-pricing-card {
          background: ${CARD};
          border: 1px solid ${BORDER};
          padding: 36px 40px;
          position: relative;
          transition: border-color 0.25s, background 0.25s;
        }
        .bc-pricing-card:hover {
          border-color: rgba(201,168,76,0.38);
          background: #161616;
        }
        .bc-pricing-card::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 2px;
          background: transparent;
          transition: background 0.25s;
        }
        .bc-pricing-card:hover::before { background: ${GOLD}; }
        .bc-pricing-featured {
          max-width: 960px;
          margin: 2px auto 0;
          background: #141414;
          border: 1px solid rgba(201,168,76,0.3);
          border-top: 2px solid ${GOLD};
          padding: 40px 48px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 40px;
        }
        @media (max-width: 680px) {
          .bc-pricing-grid { grid-template-columns: 1fr; }
          .bc-pricing-featured { flex-direction: column; align-items: flex-start; gap: 20px; padding: 28px 24px; }
          .bc-pricing-card { padding: 28px 24px; }
        }
        @media (max-width: 400px) {
          .bc-pricing-featured { padding: 22px 16px; }
          .bc-pricing-card { padding: 22px 16px; }
        }
      `}</style>

      {/* Decorative scissors watermark */}
      <div aria-hidden style={{
        position: "absolute", top: 40, left: -40, width: 240, height: 240, opacity: 0.025, zIndex: 0,
        backgroundImage: "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23C9A84C' stroke-width='1' stroke-linecap='round' stroke-linejoin='round'><circle cx='6' cy='6' r='3'/><circle cx='6' cy='18' r='3'/><line x1='20' y1='4' x2='8.12' y2='15.88'/><line x1='14.47' y1='14.48' x2='20' y2='20'/><line x1='8.12' y1='8.12' x2='12' y2='12'/></svg>\")",
        backgroundSize: "contain", backgroundRepeat: "no-repeat",
        transform: "rotate(-20deg)",
      }} />

      {/* Header — skipped on subpages where banner already shows page title */}
      {showHeader && (
        <div style={{ textAlign: "center", maxWidth: 760, margin: `0 auto clamp(48px, 7vw, 72px)`, position: "relative", zIndex: 1 }}>
          {eyebrow.trim() && (
            <div style={{ display: "inline-flex", alignItems: "center", gap: 14, marginBottom: 22 }}>
              <span aria-hidden style={{ width: 36, height: 1, background: GOLD }} />
              <GenericEditableText
                sectionId={sectionId}
                field="eyebrow"
                value={eyebrow}
                tag="span"
                className="services-eyebrow"
              />
              <span aria-hidden style={{ width: 36, height: 1, background: GOLD }} />
            </div>
          )}
          {title.trim() && titleRaw !== "" && (
            <h2 className="services-title" style={{ fontFamily: SERIF, fontSize: "clamp(2.2rem, 4.5vw, 3.2rem)", fontWeight: 700, color: TEXT, margin: "0 0 22px", letterSpacing: "-0.01em", lineHeight: 1.05 }}>
              <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
            </h2>
          )}
          {subtitle.trim() && (
            <p style={{ fontFamily: SANS, color: "rgba(245,245,245,0.7)", fontSize: "clamp(0.95rem, 1.05vw, 1.05rem)", lineHeight: 1.6, fontWeight: 300, margin: 0 }}>
              <GenericEditableText sectionId={sectionId} field="subtitle" value={subtitle} tag="span" />
            </p>
          )}
        </div>
      )}

      {/* 2-col grid */}
      <GenericSortableList
        sectionId={sectionId}
        field="services"
        items={mainItems as unknown as Record<string, unknown>[]}
      >
        {(s, i, handle) => {
          const sv = s as unknown as typeof services[0];
          const num = String(i + 1).padStart(2, "0");
          return (
            <div className="bc-pricing-card" style={{ display: "flex", gap: 20 }}>
              {handle}
              <span style={{ fontFamily: SERIF, fontSize: "1.5rem", fontWeight: 700, color: "rgba(201,168,76,0.22)", lineHeight: 1, flexShrink: 0, paddingTop: 2 }}>
                {num}
              </span>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, marginBottom: 10 }}>
                  <p style={{ fontFamily: SERIF, fontSize: "1.05rem", fontWeight: 600, color: TEXT, margin: 0, lineHeight: 1.3 }}>
                    <GenericEditableText sectionId={sectionId} field={`services.${i}.name`} value={sv.name} tag="span" />
                  </p>
                  {sv.price && (
                    <span style={{ fontFamily: SERIF, fontSize: "1.15rem", fontWeight: 700, color: GOLD, whiteSpace: "nowrap", flexShrink: 0 }}>
                      <GenericEditableText sectionId={sectionId} field={`services.${i}.price`} value={sv.price} tag="span" />
                    </span>
                  )}
                </div>
                <p style={{ fontFamily: SANS, fontSize: "0.82rem", color: MUTED, margin: "0 0 10px", lineHeight: 1.6 }}>
                  <GenericEditableText sectionId={sectionId} field={`services.${i}.description`} value={sv.description} tag="span" />
                </p>
                {sv.duration && (
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                    </svg>
                    <span style={{ fontFamily: SANS, fontSize: "0.75rem", color: "rgba(201,168,76,0.7)", letterSpacing: "0.06em" }}>
                      {sv.duration}
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        }}
      </GenericSortableList>

      {/* Featured last item (odd) */}
      {featured && (() => {
        const fi = services.length - 1;
        return (
          <div className="bc-pricing-featured">
            <div style={{ display: "flex", gap: 20, alignItems: "flex-start", flex: 1 }}>
              <span style={{ fontFamily: SERIF, fontSize: "2rem", fontWeight: 700, color: "rgba(201,168,76,0.3)", lineHeight: 1, flexShrink: 0 }}>
                {String(services.length).padStart(2, "0")}
              </span>
              <div>
                <p style={{ fontFamily: SANS, fontSize: 9, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: GOLD, margin: "0 0 6px" }}>
                  Doporučujeme
                </p>
                <p style={{ fontFamily: SERIF, fontSize: "1.2rem", fontWeight: 700, color: TEXT, margin: "0 0 8px" }}>
                  <GenericEditableText sectionId={sectionId} field={`services.${fi}.name`} value={featured.name} tag="span" />
                </p>
                <p style={{ fontFamily: SANS, fontSize: "0.85rem", color: MUTED, margin: "0 0 10px", lineHeight: 1.6, maxWidth: 460 }}>
                  <GenericEditableText sectionId={sectionId} field={`services.${fi}.description`} value={featured.description} tag="span" />
                </p>
                {featured.duration && (
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                    </svg>
                    <span style={{ fontFamily: SANS, fontSize: "0.75rem", color: "rgba(201,168,76,0.7)", letterSpacing: "0.06em" }}>
                      {featured.duration}
                    </span>
                  </div>
                )}
              </div>
            </div>
            {featured.price && (
              <div style={{ textAlign: "right", flexShrink: 0 }}>
                <p style={{ fontFamily: SERIF, fontSize: "2.2rem", fontWeight: 700, color: GOLD, margin: 0, lineHeight: 1 }}>
                  <GenericEditableText sectionId={sectionId} field={`services.${fi}.price`} value={featured.price} tag="span" />
                </p>
              </div>
            )}
          </div>
        );
      })()}

      {/* Footnote + CTA */}
      <div style={{
        maxWidth: 960, margin: "44px auto 0",
        display: "flex", flexWrap: "wrap", gap: 24, alignItems: "center", justifyContent: "space-between",
        position: "relative", zIndex: 1,
      }}>
        <p style={{
          fontFamily: SANS,
          color: "rgba(245,245,245,0.5)",
          fontSize: "0.78rem",
          maxWidth: 540,
          lineHeight: 1.55,
          fontStyle: "italic",
          margin: 0,
        }}>
          <GenericEditableText sectionId={sectionId} field="footnote" value={footnote} tag="span" />
        </p>
        <a
          href={ctaHref}
          className="barber-cta-premium"
          style={{
            position: "relative",
            overflow: "hidden",
            display: "inline-flex",
            alignItems: "center",
            gap: 10,
            paddingInline: 28,
            minHeight: 52,
            fontSize: "11px",
            fontWeight: 700,
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            color: "#0a0a0a",
            backgroundColor: GOLD,
            border: `1px solid ${GOLD}`,
            borderRadius: 2,
            textDecoration: "none",
            transition: "transform 0.25s ease, box-shadow 0.25s ease",
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 10px 28px rgba(201,168,76,0.4)"; }}
          onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "none"; }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#0a0a0a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/>
            <line x1="20" y1="4" x2="8.12" y2="15.88"/>
            <line x1="14.47" y1="14.48" x2="20" y2="20"/>
            <line x1="8.12" y1="8.12" x2="12" y2="12"/>
          </svg>
          <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
          <span aria-hidden className="barber-cta-shimmer" style={{
            position: "absolute", top: 0, left: "-60%", width: "50%", height: "100%",
            background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.45) 50%, transparent 100%)",
            transform: "skewX(-20deg)", pointerEvents: "none",
          }} />
        </a>
      </div>
    </section>
  );
}

// ── barber-04-services-cards ──────────────────────────────────────────────────
function ServicesBarber04Cards({ services, sectionId, eyebrow, title, lead, showHeader }: { services: Service[]; sectionId: number; eyebrow: string; title: string; lead: string; showHeader: boolean }) {
  const gridRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = gridRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        el.querySelectorAll<HTMLElement>(".b04s-card").forEach((card, i) => {
          card.style.animationDelay = `${i * 0.1}s`;
          card.classList.add("b04s-vis");
        });
        obs.disconnect();
      }
    }, { threshold: 0.12 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <section style={{ padding: "clamp(80px,10vw,120px) 24px", background: "#0a0806" }} data-template="barber-04">
      <style>{`
        @keyframes b04FadeUp { from { opacity:0; transform:translateY(32px); } to { opacity:1; transform:translateY(0); } }
        .b04s-card { opacity: 0; transition: border-color 0.35s ease, background 0.35s ease, transform 0.35s ease, box-shadow 0.35s ease; }
        .b04s-card.b04s-vis { animation: b04FadeUp 0.65s cubic-bezier(.22,.68,0,1.2) forwards; }
        .b04s-card:hover {
          background: #1a150f !important;
          border-color: rgba(213,185,129,0.55) !important;
          transform: translateY(-6px);
          box-shadow: 0 16px 48px rgba(213,185,129,0.10);
        }
        .b04s-card:hover .b04s-rule { width: 56px !important; opacity: 1 !important; }
      `}</style>

      {/* Section header — industrial numbered eyebrow + title + gold fade line */}
      {showHeader && (
        <div className="max-w-[860px] mx-auto text-center" style={{ marginBottom: "clamp(48px, 6vw, 72px)" }}>
          {eyebrow && (
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 12, marginBottom: 24,
              fontFamily: "'Lato',Helvetica,Arial,sans-serif", fontSize: 11, fontWeight: 700,
              letterSpacing: "0.32em", color: "#d5b981", textTransform: "uppercase",
            }}>
              <span aria-hidden style={{ width: 28, height: 1, backgroundColor: "#d5b981", opacity: 0.7 }} />
              <GenericEditableText sectionId={sectionId} field="eyebrow" value={eyebrow} tag="span" />
              <span aria-hidden style={{ width: 28, height: 1, backgroundColor: "#d5b981", opacity: 0.7 }} />
            </div>
          )}
          <h2
            className="uppercase"
            style={{
              fontFamily: "'Bebas Neue','Oswald',Impact,sans-serif",
              fontWeight: 400,
              fontSize: "clamp(32px, 4vw, 56px)",
              letterSpacing: "0.03em",
              color: "#fff",
              margin: "0 auto 20px",
              lineHeight: 1.05,
            }}
          >
            <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
          </h2>
          <div aria-hidden style={{
            width: 180, height: 1, margin: "0 auto",
            background: "linear-gradient(90deg, transparent 0%, rgba(213,185,129,.85) 50%, transparent 100%)",
          }} />
          {lead && (
            <p style={{
              fontFamily: "'Lato',Helvetica,Arial,sans-serif",
              fontWeight: 400, fontSize: "clamp(14px, 1.05vw, 16px)",
              color: "rgba(255,255,255,0.65)",
              maxWidth: 640, margin: "28px auto 0", lineHeight: 1.75,
            }}>
              <GenericEditableText sectionId={sectionId} field="lead" value={lead} tag="span" />
            </p>
          )}
        </div>
      )}

      <div ref={gridRef} style={{ maxWidth: 1180, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 12 }}>
        {services.map((sv, i) => (
          <div
            key={`svc-${i}`}
            className="b04s-card"
            style={{
              background: "#14110d",
              border: "1px solid rgba(213,185,129,0.12)",
              padding: "44px 28px",
              textAlign: "center",
              minHeight: 220,
              cursor: "default",
            }}
          >
            <div className="b04s-rule" style={{ width: 32, height: 1, background: "#d5b981", margin: "0 auto 24px", opacity: 0.6, transition: "width .35s cubic-bezier(.4,0,.2,1), opacity .25s ease" }} />
            <h4
              style={{
                fontFamily: "'Bebas Neue','Oswald',Impact,sans-serif",
                fontSize: "clamp(18px,1.5vw,22px)",
                letterSpacing: "0.12em",
                color: "#d5b981",
                margin: "0 0 16px",
                lineHeight: 1.2,
                textTransform: "uppercase",
              }}
            >
              <GenericEditableText sectionId={sectionId} field={`services.${i}.name`} value={sv.name} tag="span" />
            </h4>
            <p style={{ fontFamily: "'Lato','Inter',sans-serif", fontSize: 14, lineHeight: 1.75, color: "rgba(245,240,232,0.68)", margin: 0 }}>
              <GenericEditableText sectionId={sectionId} field={`services.${i}.description`} value={sv.description} tag="span" />
            </p>
            {sv.price && (
              <p style={{ fontFamily: "'Bebas Neue','Oswald',Impact,sans-serif", fontSize: 20, letterSpacing: "0.1em", color: "#f5f0e8", margin: "20px 0 0" }}>
                <GenericEditableText sectionId={sectionId} field={`services.${i}.price`} value={sv.price} tag="span" />
              </p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

// ── beauty-01 — Pricing Detail (Ceník) ─────────────────────────────────────
// Multi-category hairline price list. 3 categories (Holičství / Manikúra / Pleť),
// each with N rows (name + duration + price). Editorial magazine header, dotted leaders.
function Beauty01PricingDetail({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const eyebrowRaw  = content.eyebrow;
  const titleRaw    = content.title;
  const subtitleRaw = content.subtitle;
  const eyebrow  = eyebrowRaw  === undefined ? "Kompletní ceník" : String(eyebrowRaw);
  const titleStr = titleRaw    === undefined ? "Ceny všech služeb." : String(titleRaw);
  const subtitle = subtitleRaw === undefined ? "Bez skrytých příplatků. Konzultace a finální styling jsou v ceně. Pro kombinaci služeb se zeptejte při rezervaci — často umíme sladit termín i cenu." : String(subtitleRaw);
  const showHeader = !!(eyebrow.trim() || titleStr.trim() || subtitle.trim());
  type Service = { name?: string; duration?: string; price?: string; note?: string };
  type Category = { name?: string; items?: Service[] };
  const categories = (content.categories as Category[]) ?? [];
  const footerNote = String(content.footerNote ?? "Ceny jsou orientační. Závazné jsou ceny domluvené při rezervaci. Platba hotově i kartou.");
  const FONT = "'Fahkwang', Georgia, serif";
  const SANS = "var(--font-overpass), 'Overpass', Inter, system-ui, sans-serif";
  const MONO = "var(--font-overpass-mono), 'Overpass Mono', Menlo, monospace";
  const CREAM = "#FFF8F1";
  const DARK  = "#1F1F1F";
  const MUTED = "#5B4D43";
  const SAND  = "#E0BE9A";
  return (
    <section
      id="cenik"
      style={{
        backgroundColor: CREAM,
        padding: "clamp(72px, 9vw, 128px) clamp(24px, 5vw, 64px)",
      }}
      data-template="beauty-01"
    >
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        {showHeader && (
          <div className="b01-cnk-head" style={{
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
                fontSize: "clamp(32px, 4.5vw, 60px)",
                lineHeight: 1.1, letterSpacing: "0.01em",
                color: DARK,
              }}>
                <GenericEditableText sectionId={sectionId} field="title" value={titleStr} tag="span" />
              </h2>
            )}
            {subtitle.trim() && (
              <p style={{
                margin: "20px auto 0",
                fontFamily: SANS, fontWeight: 300,
                fontSize: "clamp(14px, 1.2vw, 16px)",
                color: MUTED, lineHeight: 1.7,
                maxWidth: 600,
              }}>
                <GenericEditableText sectionId={sectionId} field="subtitle" value={subtitle} tag="span" />
              </p>
            )}
          </div>
        )}

        {/* Categories — each category is its own block with title + price rows */}
        <div style={{ display: "flex", flexDirection: "column", gap: "clamp(48px, 6vw, 72px)" }}>
          {categories.map((cat, ci) => (
            <div key={`b01-cat-${ci}`} className="b01-cnk-cat">
              <div style={{
                display: "flex", alignItems: "baseline", justifyContent: "space-between",
                gap: 16,
                paddingBottom: 18,
                borderBottom: `1px solid ${DARK}`,
                marginBottom: 4,
              }}>
                <h3 style={{
                  margin: 0,
                  fontFamily: FONT, fontWeight: 500,
                  fontSize: "clamp(22px, 2.5vw, 32px)",
                  letterSpacing: "0.04em",
                  color: DARK,
                }}>
                  <GenericEditableText sectionId={sectionId} field={`categories.${ci}.name`} value={cat.name ?? ""} tag="span" />
                </h3>
                <span style={{
                  fontFamily: MONO, fontSize: 10, letterSpacing: "0.28em",
                  textTransform: "uppercase", color: SAND,
                }}>
                  {String(((cat.items as Service[]) ?? []).length)}× služba
                </span>
              </div>

              <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
                {((cat.items as Service[]) ?? []).map((srv, si) => (
                  <li
                    key={`b01-srv-${ci}-${si}`}
                    className="b01-cnk-row"
                    style={{
                      display: "grid",
                      gridTemplateColumns: "minmax(0, 1fr) auto",
                      columnGap: 16,
                      alignItems: "baseline",
                      padding: "16px 0",
                      borderBottom: "1px solid rgba(91,77,67,0.12)",
                      transition: "background-color 0.3s ease",
                    }}
                  >
                    <div style={{ minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "baseline", gap: 14, flexWrap: "wrap" }}>
                        <span style={{
                          fontFamily: FONT, fontWeight: 500,
                          fontSize: "clamp(15px, 1.3vw, 18px)",
                          color: DARK, letterSpacing: "0.01em",
                        }}>
                          <GenericEditableText sectionId={sectionId} field={`categories.${ci}.items.${si}.name`} value={srv.name ?? ""} tag="span" />
                        </span>
                        {srv.duration && (
                          <span style={{
                            fontFamily: MONO, fontSize: 11, letterSpacing: "0.10em",
                            color: MUTED,
                          }}>
                            <GenericEditableText sectionId={sectionId} field={`categories.${ci}.items.${si}.duration`} value={srv.duration} tag="span" />
                          </span>
                        )}
                      </div>
                      {srv.note && (
                        <p style={{
                          margin: "4px 0 0",
                          fontFamily: SANS, fontSize: 13,
                          color: MUTED, lineHeight: 1.5,
                        }}>
                          <GenericEditableText sectionId={sectionId} field={`categories.${ci}.items.${si}.note`} value={srv.note} tag="span" />
                        </p>
                      )}
                    </div>
                    {srv.price && (
                      <span className="b01-cnk-price" style={{
                        fontFamily: FONT, fontWeight: 500,
                        fontSize: "clamp(16px, 1.4vw, 20px)",
                        color: DARK, letterSpacing: "0.02em",
                        whiteSpace: "nowrap",
                        transition: "color 0.3s ease",
                      }}>
                        <GenericEditableText sectionId={sectionId} field={`categories.${ci}.items.${si}.price`} value={srv.price} tag="span" />
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {footerNote && (
          <p style={{
            marginTop: "clamp(40px, 5vw, 64px)",
            fontFamily: MONO, fontSize: 12, letterSpacing: "0.06em",
            color: MUTED, textAlign: "center",
            maxWidth: 720, marginLeft: "auto", marginRight: "auto",
          }}>
            <GenericEditableText sectionId={sectionId} field="footerNote" value={footerNote} tag="span" />
          </p>
        )}
      </div>
    </section>
  );
}
