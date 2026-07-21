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
  if (href.startsWith("/demo/")) return href;
  if (href === "/") return `/demo/${tenantSlug}${isAdmin ? "/admin" : ""}`;
  if (href.startsWith("/#")) return href.slice(1);
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

  if (variant === "proof-01-services") return <ServicesProof01 content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;
  if (variant === "proof-01-process")  return <ProcessProof01 content={content} sectionId={sectionId} />;
  if (variant === "proof-01-pricing")  return <PricingProof01 content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;
  if (variant === "pricing-photo-01")   return <PricingPhoto01 content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;
  if (variant === "artist-01-concerts") return <ConcertsArtist01 content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;
  if (variant === "eshop-16-benefits")  return <BenefitsEshop16 content={content} sectionId={sectionId} />;
  if (variant === "eshop-17-benefits")  return <BenefitsEshop17 content={content} sectionId={sectionId} />;
  if (variant === "harmonie-01-services") return <ServicesHarmonie01 content={content} sectionId={sectionId} />;
  if (variant === "tawan-01-services")  return <ServicesTawan01 content={content} sectionId={sectionId} />;
  if (variant === "thaimasaze-02-services")  return <ServicesThaimasaze02 content={content} sectionId={sectionId} />;
  if (variant === "tattoo-03-services") return <ServicesTattoo03 content={content} sectionId={sectionId} />;
  if (variant === "tattoo-03-pricing")  return <PricingTattoo03 content={content} sectionId={sectionId} />;
  if (variant === "tattoo-01-pricing")  return <PricingTattoo01 content={content} sectionId={sectionId} />;
  if (variant === "nails-01-services")  return <ServicesNails01 content={content} sectionId={sectionId} />;
  if (variant === "nails-02-pricing")   return <PricingNails02 content={content} sectionId={sectionId} />;
  if (variant === "nails-03-services")  return <ServicesNails03 content={content} sectionId={sectionId} />;
  if (variant === "clinic-02-services") return <ServicesClinic02 content={content} sectionId={sectionId} />;
  if (variant === "clinic-03-services") return <ServicesClinic03 content={content} sectionId={sectionId} />;
  if (variant === "clinic-03-pricing")  return <PricingClinic03 content={content} sectionId={sectionId} />;
  if (variant === "restaurant-01-menu") return <ServicesRestaurant01 content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;
  if (variant === "restaurant-02-menu") return <ServicesRestaurant02 content={content} sectionId={sectionId} />;
  if (variant === "restaurant-03-menu") return <ServicesRestaurant03 content={content} sectionId={sectionId} />;
  if (variant === "cafe-02-menu")       return <ServicesCafe02 content={content} sectionId={sectionId} />;
  if (variant === "cafe-03-menu")       return <ServicesCafe03 content={content} sectionId={sectionId} />;
  if (variant === "cafe-04-menu")       return <ServicesCafe04 content={content} sectionId={sectionId} />;
  if (variant === "bakery-01-promo-2col") return <ServicesBakery01 content={content} sectionId={sectionId} />;
  if (variant === "bakery-02-delivery")   return <DeliveryBakery02 content={content} sectionId={sectionId} />;
  if (variant === "bakery-02-locations")  return <LocationsBakery02 content={content} sectionId={sectionId} />;
  if (variant === "reality-01-listings")    return <ServicesReality01Listings content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;
  if (variant === "reality-01-listing-detail") return <ListingDetailReality01 content={content} sectionId={sectionId} />;
  if (variant === "reality-02-agents")      return <ServicesReality02Agents content={content} sectionId={sectionId} />;
  if (variant === "reality-03-services-4grid") return <ServicesReality03Grid content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;
  if (variant === "reality-04-why-us")         return <WhyUsReality04 content={content} sectionId={sectionId} />;
  if (variant === "reality-05-listings")         return <ListingsReality05 content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;
  if (variant === "reality-05-property-detail") return <PropertyDetailReality05 content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;
  if (variant === "reality-03-property-detail") return <PropertyDetailReality03 content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;
  if (variant === "reality-06-services")       return <ServicesReality06 content={content} sectionId={sectionId} />;
  if (variant === "autoservis-01-services")    return <ServicesAutoservis01 content={content} sectionId={sectionId} />;
  if (variant === "autoservis-02-services")    return <ServicesAutoservis02 content={content} sectionId={sectionId} />;
  if (variant === "autoservis-03-stats")       return <StatsAutoservis03 content={content} sectionId={sectionId} />;
  if (variant === "autoservis-03-services")    return <ServicesAutoservis03 content={content} sectionId={sectionId} />;
  if (variant === "autoservis-03-pricing")     return <PricingAutoservis03 content={content} sectionId={sectionId} />;
  if (variant === "fyzio-01-services-grid") return <ServicesFyzio01 content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;
  if (variant === "fyzio-01-pricing")       return <PricingFyzio01 content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;
  if (variant === "fyzio-02-services-list") return <ServicesFyzio02 content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;
  if (variant === "fyzio-02-pricing") return <PricingFyzio02 content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;
  if (variant === "dental-01-services")     return <ServicesDental01 content={content} sectionId={sectionId} />;
  if (variant === "lawyer-01-services")    return <ServicesLawyer01 content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;
  if (variant === "legal-02-services")     return <ServicesLegal02 content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;
  if (variant === "legal-02-career")       return <CareerLegal02 content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;
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
  if (variant === "malir-01-pricing")     return <PricingMalir01    content={content} sectionId={sectionId} />;
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
  if (variant === "rekonstrukce-01-services") return <ServicesRekonstrukce01 content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;
  if (variant === "stavba-01-services") return <ServicesStavba01 content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;
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
  if (variant === "vet-01-services")       return <ServicesVet01 content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;
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

  if (variant === "pricing-table-video") return <PricingTableVideo content={content} title={title} sectionId={sectionId} />;

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
// Luxe dark 3-col cards — tall image, gold numbered eyebrow, serif title,
// hover: card lift + gold border glow + image zoom + gold price reveal
// ─────────────────────────────────────────────────────────────────────────────
function Massage01Services3col({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const eyebrowRaw  = content.sectionTag;
  const titleRaw    = content.heading;
  const subtitleRaw = content.subtitle;
  const sectionTag = eyebrowRaw  === undefined ? "Nabídka terapií" : String(eyebrowRaw);
  const heading    = titleRaw    === undefined ? "Naše masážní techniky" : String(titleRaw);
  const subtitle   = subtitleRaw === undefined ? "Individuální přístup ke každému sezení — protože vaše tělo si zaslouží péči na míru" : String(subtitleRaw);
  const ctaText    = String(content.ctaText ?? "Celá nabídka & ceník");
  const ctaHref    = String(content.ctaHref ?? "/sluzby");
  const items      = (content.items as Array<{
    image: string; title: string; description: string; price: string;
  }>) ?? [];
  const showHeader = !!(sectionTag.trim() || heading.trim() || subtitle.trim());

  return (
    <section
      id="sluzby"
      className="m01-services"
      data-template="massage-01"
    >
      <div className="m01-services-inner">
        {showHeader && (
          <div className="m01-services-header">
            <p className="m01-services-tag">
              <span className="m01-services-tag-dot" aria-hidden="true" />
              <GenericEditableText sectionId={sectionId} field="sectionTag" value={sectionTag} tag="span" />
            </p>
            <h2 className="m01-services-h2">
              <GenericEditableText sectionId={sectionId} field="heading" value={heading} tag="span" />
            </h2>
            <p className="m01-services-sub">
              <GenericEditableText sectionId={sectionId} field="subtitle" value={subtitle} tag="span" />
            </p>
          </div>
        )}

        <div className="m01-services-grid">
          {items.map((item, i) => (
            <div key={i} className="m01-srv-card">
              <div className="m01-srv-img">
                <GenericEditableImage sectionId={sectionId} field={`items.${i}.image`} src={item.image} alt={item.title} style={{ width: "100%", height: "100%" }}>
                  <img loading="lazy" src={item.image} alt={item.title} />
                </GenericEditableImage>
                <span className="m01-srv-num" aria-hidden="true">{String(i + 1).padStart(2, "0")}</span>
              </div>
              <div className="m01-srv-body">
                <h3 className="m01-srv-title">
                  <GenericEditableText sectionId={sectionId} field={`items.${i}.title`} value={item.title} tag="span" />
                </h3>
                <p className="m01-srv-desc">
                  <GenericEditableText sectionId={sectionId} field={`items.${i}.description`} value={item.description} tag="span" />
                </p>
                <p className="m01-srv-price">
                  <GenericEditableText sectionId={sectionId} field={`items.${i}.price`} value={item.price} tag="span" />
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="m01-services-cta-row">
          <a href={ctaHref} className="m01-hero-cta" data-btn="primary">
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

// ── harmonie-01-services ────────────────────────────────────────────────────────
// Cream bg, centered gold H2 + subtitle, 4-col karty
// Karta: foto s tmavým overlay + arch clip na vrcholu + bílý titulek + popis + "VÍCE ZDE →"
// Hover: foto zoom + overlay zesvětlí + CTA podtržení
// Ref: original reference "Nabídka procedur a programů"
// ─────────────────────────────────────────────────────────────────────────────
function ServicesHarmonie01({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const title    = String(content.title    ?? "NABÍDKA PROCEDUR A PROGRAMŮ");
  const ctaText  = String(content.ctaText  ?? "VÍCE ZDE");

  type Card = { image: string; title: string; description: string; href: string };
  const rawCards = (content.cards as Card[] | undefined) ?? [];
  const cards: Card[] = rawCards.length > 0 ? rawCards : [
    { image: "/templates/harmonie-01/service-1.webp", title: "ÁJURVÉDSKÉ PROCEDURY",  description: "Jednotlivé ájurvédské terapie a procedury",    href: "#sluzby" },
    { image: "/templates/harmonie-01/service-2.webp", title: "DIAGNOSTIKA",            description: "Konzultace s ájurvédským lékařem a specialisty", href: "#sluzby" },
    { image: "/templates/harmonie-01/service-3.webp", title: "LÉČEBNÉ PROGRAMY",       description: "Komplexní balíčky ájurvédských procedur",        href: "#sluzby" },
    { image: "/templates/harmonie-01/service-4.webp", title: "SPA & BODY RELAX",       description: "Neájurvédské relaxační rituály a wellness",       href: "#sluzby" },
  ];

  const GOLD  = "#AA813A";
  const CREAM = "#F2EDE4";
  const FONT  = "'Jost', sans-serif";

  return (
    <section id="sluzby" data-template="harmonie-01" style={{ backgroundColor: CREAM, padding: "88px 0 96px" }}>
      {/* Header */}
      <div style={{ textAlign: "center", padding: "0 32px" }}>
        <h2 style={{ fontFamily: FONT, fontSize: "clamp(16px, 2vw, 20px)", fontWeight: 500, color: GOLD, letterSpacing: 5, textTransform: "uppercase", margin: 0 }}>
          <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
        </h2>
      </div>

      {/* Grid karet */}
      <div className="harmonie-srv-grid">
        {cards.map((card, i) => (
          <a key={i} href={card.href} className="harmonie-srv-card">
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
                className="harmonie-srv-img"
                sizes="(max-width: 540px) 100vw, (max-width: 900px) 50vw, 25vw"
                unoptimized={shouldSkipNextImageOptimization(card.image)}
              />
            </GenericEditableImage>

            {/* Overlay */}
            <div className="harmonie-srv-overlay" aria-hidden />

            {/* Text */}
            <div className="harmonie-srv-body">
              <p className="harmonie-srv-title">
                <GenericEditableText sectionId={sectionId} field={`cards.${i}.title`} value={card.title} tag="span" />
              </p>
              <p className="harmonie-srv-desc">
                <GenericEditableText sectionId={sectionId} field={`cards.${i}.description`} value={card.description} tag="span" />
              </p>
              <span className="harmonie-srv-cta">
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

// ─── thaimasaze-02-services ───────────────────────────────────────────────────────
function ServicesThaimasaze02({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  type CardItem = { title?: string; desc?: string; image?: string; duration?: string; price?: string; badges?: string[] };
  const eyebrowRaw = content.eyebrow; const titleRaw = content.title; const subtitleRaw = content.subtitle;
  const eyebrow  = eyebrowRaw  === undefined ? "Naše nejoblíbenější rituály" : String(eyebrowRaw);
  const title    = titleRaw    === undefined ? "Vyberte si svůj okamžik klidu" : String(titleRaw);
  const subtitle = subtitleRaw === undefined ? "" : String(subtitleRaw);
  const showHeader = !!(eyebrow.trim() || title.trim() || subtitle.trim());
  const detailLabel = String(content.detailLabel ?? "Zobrazit detail");
  const DEFAULT_ITEMS: CardItem[] = [
    { title: "Tradiční thajská masáž", desc: "Autentická technika akupresurních bodů a protahování pro hlubokou úlevu.", image: "/templates/thaimasaze-02/svc-thajska.webp", duration: "60 min", price: "990 Kč", badges: ["Nejoblíbenější"] },
    { title: "Masáž lávovými kameny", desc: "Hřejivé sopečné kameny uvolní napětí a rozproudí energii v těle.", image: "/templates/thaimasaze-02/svc-lavove.webp", duration: "75 min", price: "1 290 Kč", badges: [] },
    { title: "Aromaterapeutická masáž", desc: "Jemné tahy s esenciálními oleji pro dokonalou relaxaci smyslů.", image: "/templates/thaimasaze-02/svc-aroma.webp", duration: "60 min", price: "1 090 Kč", badges: [] },
    { title: "Masáž hlavy a šíje", desc: "Cílené uvolnění nejvíce zatěžovaných partií po náročném dni.", image: "/templates/thaimasaze-02/svc-hlava.webp", duration: "45 min", price: "790 Kč", badges: [] },
    { title: "Relaxační rituál", desc: "Celotělová péče v hřejivé atmosféře svící a vůní pro úplný oddech.", image: "/templates/thaimasaze-02/svc-relax.webp", duration: "90 min", price: "1 490 Kč", badges: ["Doporučujeme"] },
  ];
  const rawItems = (content.items as CardItem[]) ?? [];
  const items = rawItems.length ? rawItems : DEFAULT_ITEMS;

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

  const FONT  = "Candara, 'Candara Regular', 'Segoe UI', sans-serif";
  const SERIF = "'Cormorant Garamond', Georgia, serif";
  const ACCENT = "#AD8F78";
  const BROWN  = "#3C2F25";

  return (
    <section id="sluzby" data-template="thaimasaze-02" style={{ backgroundColor: "#fff", padding: "110px 0 118px", fontFamily: FONT }}>
      {/* Header */}
      {showHeader && (
        <div style={{ textAlign: "center", marginBottom: 60, padding: "0 24px" }}>
          <GenericEditableText sectionId={sectionId} field="eyebrow" value={eyebrow} tag="span" style={{
            fontFamily: FONT, fontSize: 12, fontWeight: 600, letterSpacing: 3.5, textTransform: "uppercase", color: ACCENT, display: "block", marginBottom: 14,
          }} />
          <GenericEditableText sectionId={sectionId} field="title" value={title} tag="h2" style={{
            fontFamily: SERIF, fontSize: "clamp(30px, 4vw, 48px)", fontWeight: 500, color: BROWN, margin: 0, lineHeight: 1.15, letterSpacing: 0.5,
          }} />
          {subtitle && <GenericEditableText sectionId={sectionId} field="subtitle" value={subtitle} tag="p" style={{ fontFamily: FONT, fontSize: 17, color: "rgba(60,47,37,.6)", marginTop: 14, maxWidth: 620, marginLeft: "auto", marginRight: "auto" }} />}
          <div aria-hidden style={{ display: "flex", justifyContent: "center", marginTop: 22 }}>
            <span style={{ width: 44, height: 1, background: `linear-gradient(90deg, transparent, ${ACCENT}66)` }} />
            <span style={{ margin: "0 10px", fontSize: 12, color: ACCENT, opacity: .6 }}>❁</span>
            <span style={{ width: 44, height: 1, background: `linear-gradient(90deg, ${ACCENT}66, transparent)` }} />
          </div>
        </div>
      )}

      {/* Slider + arrows */}
      <div style={{ maxWidth: 1360, margin: "0 auto", padding: "0 32px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>

          <button className="t02-svc-arrow" onClick={() => scrollByCard(-1)} aria-label="Předchozí">
            <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
              <path d="M7 1.5L3 5.5L7 9.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          <div ref={trackRef} className="t02-svc-track" style={{ flex: 1 }} onScroll={handleScroll}>
            {all.map((item, i) => {
              const realIdx = i - CLONES;
              const isReal = realIdx >= 0 && realIdx < items.length;
              return (
              <div key={i} className="t02-svc-card">
                <div className="t02-svc-media">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.image ?? ""} alt={item.title ?? ""} loading="lazy" />
                  <span className="t02-svc-media-veil" aria-hidden />
                  {item.badges && item.badges.length > 0 && item.badges[0] && (
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
                  <span className="t02-svc-btn">
                    {isReal
                      ? <GenericEditableText sectionId={sectionId} field="detailLabel" value={detailLabel} tag="span" />
                      : detailLabel}
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </span>
                </div>
              </div>
              );
            })}
          </div>

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
  const headingRaw    = c.heading;
  const subheadingRaw = c.subheading;
  const heading    = headingRaw    === undefined ? "Na co se specializujeme" : String(headingRaw);
  const subheading = subheadingRaw === undefined ? "Co děláme" : String(subheadingRaw);
  const showHeader = !!(heading.trim() || subheading.trim());
  const linkLabel  = String(c.linkLabel ?? "Zjistit více");
  const rawItems   = (c.items as Array<{ title: string; text: string; image: string; href: string }>) ?? [];

  const BG     = "#0e0e0e";
  const ACCENT = "#D41515";

  return (
    <section id="sluzby" data-template="tattoo-03" style={{ backgroundColor: BG, padding: "clamp(56px,7vw,104px) clamp(20px,4vw,40px)", position: "relative" }}>
      <div style={{ maxWidth: 1360, margin: "0 auto" }}>
        {/* Nadpis */}
        {showHeader && (
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
              <span aria-hidden style={{ width: 30, height: 1, background: "rgba(212,21,21,0.6)" }} />
              <GenericEditableText sectionId={sectionId} field="subheading" value={subheading} tag="span" style={{
                fontFamily: "'Barlow Condensed','Oswald',sans-serif", fontSize: "0.9rem", fontWeight: 600,
                letterSpacing: "0.26em", textTransform: "uppercase", color: ACCENT,
              }} />
              <span aria-hidden style={{ width: 30, height: 1, background: "rgba(212,21,21,0.6)" }} />
            </div>
            <h2 style={{
              fontFamily: "'Bebas Neue','Oswald',sans-serif",
              fontWeight: 400,
              fontSize: "clamp(32px, 4vw, 56px)",
              color: "#ffffff",
              margin: 0,
              letterSpacing: "0.01em",
              textTransform: "uppercase",
              lineHeight: 1,
            }}>
              <GenericEditableText sectionId={sectionId} field="heading" value={heading} tag="span" />
            </h2>
          </div>
        )}

        {/* 4-col karty */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: 22,
        }}>
          {rawItems.map((item, i) => (
            <a
              key={i}
              href={item.href || "#kontakt"}
              className="t03-svc-card"
              style={{
                backgroundColor: "#131318",
                border: "1px solid rgba(255,255,255,0.07)",
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
                textDecoration: "none",
                position: "relative",
                transition: "transform 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease",
              }}
            >
              {/* Foto */}
              <div style={{ aspectRatio: "3/4", overflow: "hidden", position: "relative" }}>
                <GenericEditableImage sectionId={sectionId} field={`items.${i}.image`} src={item.image} alt={item.title} className="w-full h-full" style={{ width: "100%", height: "100%" }}>
                  <img
                    src={item.image}
                    alt={item.title}
                    loading="lazy"
                    className="t03-svc-img"
                    style={{
                      width: "100%", height: "100%",
                      objectFit: "cover", objectPosition: "center",
                      transition: "transform 0.5s ease, filter 0.5s ease",
                    }}
                  />
                </GenericEditableImage>
                {/* Gradient + crimson bracket */}
                <span aria-hidden style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(19,19,24,0.75), transparent 45%)", pointerEvents: "none" }} />
                <span aria-hidden className="t03-svc-bracket" />
              </div>

              {/* Červená linka */}
              <div style={{ height: 3, backgroundColor: ACCENT }} />

              {/* Obsah */}
              <div style={{ padding: "24px 24px 28px", flex: 1, display: "flex", flexDirection: "column" }}>
                <h3 style={{
                  fontFamily: "'Bebas Neue','Oswald',sans-serif",
                  fontWeight: 400,
                  fontSize: "clamp(19px, 1.7vw, 24px)",
                  color: "#ffffff",
                  margin: "0 0 10px",
                  lineHeight: 1.05,
                  letterSpacing: "0.02em",
                  textTransform: "uppercase",
                }}>
                  <GenericEditableText sectionId={sectionId} field={`items.${i}.title`} value={item.title} tag="span" />
                </h3>
                <p style={{
                  fontFamily: "'Barlow','Helvetica Neue',Arial,sans-serif",
                  fontSize: "0.86rem",
                  color: "rgba(255,255,255,0.62)",
                  lineHeight: 1.7,
                  margin: "0 0 20px",
                  flex: 1,
                }}>
                  <GenericEditableText sectionId={sectionId} field={`items.${i}.text`} value={item.text} tag="span" />
                </p>
                <span style={{
                  display: "inline-flex", alignItems: "center", gap: 7,
                  fontFamily: "'Barlow Condensed','Oswald',sans-serif",
                  fontSize: "0.86rem",
                  fontWeight: 700,
                  color: ACCENT,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                }}>
                  <GenericEditableText sectionId={sectionId} field="linkLabel" value={linkLabel} tag="span" />
                  <span className="t03-svc-arrow" aria-hidden style={{ display: "inline-block", transition: "transform 0.2s ease" }}>→</span>
                </span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── tattoo-03-pricing ─────────────────────────────────────────────────────────
// Dark ceník — Bebas Neue header, 3–4 balíčkové karty s cenou "od", featured accent,
// feature list s crimson zaškrtnutím, dole poznámka o konzultaci
// ─────────────────────────────────────────────────────────────────────────────
// ── tattoo-01-pricing ─────────────────────────────────────────────────────────
// Dark ceníkové karty ve stylu tattoo-01 (Arial Black, coral, 0px radius)
// ─────────────────────────────────────────────────────────────────────────────
function PricingTattoo01({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const c       = content as Record<string, unknown>;
  const eyebrow = String(c.eyebrow ?? "Férové ceny");
  const heading = String(c.heading ?? "Ceník");
  const note    = String(c.note ?? "Uvedené ceny jsou orientační. Konečná cena vždy závisí na velikosti, detailu a umístění motivu — přesnou kalkulaci potvrdíme zdarma při osobní konzultaci.");
  const items   = (c.items as Array<{ name?: string; size?: string; price?: string; priceNote?: string; features?: string[]; featured?: boolean }>) ?? [];
  const ACCENT  = "#ff5c4b";
  const SANS    = "Arial, Helvetica, sans-serif";

  const headRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const [headVis, setHeadVis] = useState(false);
  const [gridVis, setGridVis] = useState(false);
  useEffect(() => {
    const o = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setHeadVis(true); o.disconnect(); } }, { threshold: 0.3 });
    if (headRef.current) o.observe(headRef.current);
    return () => o.disconnect();
  }, []);
  useEffect(() => {
    const o = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setGridVis(true); o.disconnect(); } }, { threshold: 0.1 });
    if (gridRef.current) o.observe(gridRef.current);
    return () => o.disconnect();
  }, []);

  return (
    <section id="cenik" data-template="tattoo-01" style={{ backgroundColor: "#0f0f0f", padding: "clamp(56px, 8vw, 96px) clamp(24px, 6vw, 80px)" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div ref={headRef} className={`t01-gal-reveal ${headVis ? "t01-visible" : ""}`} style={{ textAlign: "center", marginBottom: "clamp(40px, 6vw, 64px)" }}>
          <p style={{ fontFamily: SANS, fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.18em", color: ACCENT, margin: "0 0 16px" }}>
            <GenericEditableText sectionId={sectionId} field="eyebrow" value={eyebrow} tag="span" />
          </p>
          <div style={{ width: 48, height: 3, backgroundColor: ACCENT, margin: "0 auto 24px" }} aria-hidden />
          <h2 style={{ fontFamily: "'Arial Black', Arial, sans-serif", fontSize: "clamp(1.5rem, 3vw, 2.25rem)", fontWeight: 900, color: "#ffffff", textTransform: "uppercase", letterSpacing: "0.06em", margin: 0 }}>
            <GenericEditableText sectionId={sectionId} field="heading" value={heading} tag="span" />
          </h2>
        </div>

        <div ref={gridRef} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "clamp(16px, 2.5vw, 24px)" }}>
          {items.map((item, i) => {
            const featured = !!item.featured;
            return (
              <div
                key={i}
                className={`t01-price-card ${featured ? "t01-price-featured" : ""} t01-gal-reveal ${gridVis ? "t01-visible" : ""}`}
                style={{ transitionDelay: gridVis ? `${i * 0.1}s` : "0s" }}
              >
                {featured && <span className="t01-price-badge">Nejčastější volba</span>}
                <h3 style={{ fontFamily: "'Arial Black', Arial, sans-serif", fontSize: "clamp(1.2rem, 1.8vw, 1.5rem)", fontWeight: 900, color: "#ffffff", textTransform: "uppercase", letterSpacing: "0.03em", margin: "0 0 4px", lineHeight: 1.05 }}>
                  <GenericEditableText sectionId={sectionId} field={`items.${i}.name`} value={item.name ?? ""} tag="span" />
                </h3>
                <div style={{ fontFamily: SANS, fontSize: "0.78rem", fontWeight: 400, color: "rgba(255,255,255,0.42)", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 20 }}>
                  <GenericEditableText sectionId={sectionId} field={`items.${i}.size`} value={item.size ?? ""} tag="span" />
                </div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                  <span style={{ fontFamily: SANS, fontSize: "0.75rem", color: "rgba(255,255,255,0.45)", textTransform: "uppercase", letterSpacing: "0.1em" }}>od</span>
                  <span style={{ fontFamily: "'Arial Black', Arial, sans-serif", fontSize: "clamp(2rem, 3vw, 2.6rem)", fontWeight: 900, color: ACCENT, lineHeight: 1 }}>
                    <GenericEditableText sectionId={sectionId} field={`items.${i}.price`} value={item.price ?? ""} tag="span" />
                  </span>
                </div>
                {item.priceNote && (
                  <div style={{ fontFamily: SANS, fontSize: "0.76rem", color: "rgba(255,255,255,0.4)", marginTop: 6 }}>
                    <GenericEditableText sectionId={sectionId} field={`items.${i}.priceNote`} value={item.priceNote} tag="span" />
                  </div>
                )}
                <div style={{ width: "100%", height: 1, background: "rgba(255,255,255,0.08)", margin: "22px 0" }} aria-hidden />
                <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 12 }}>
                  {(item.features ?? []).map((f, j) => (
                    <li key={j} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden style={{ flexShrink: 0, marginTop: 3 }}><polyline points="20 6 9 17 4 12" /></svg>
                      <span style={{ fontFamily: SANS, fontSize: "0.88rem", color: "rgba(255,255,255,0.72)", lineHeight: 1.5 }}>
                        <GenericEditableText sectionId={sectionId} field={`items.${i}.features.${j}`} value={f} tag="span" />
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        <div style={{ marginTop: 40, display: "flex", alignItems: "flex-start", gap: 14, maxWidth: 780, marginLeft: "auto", marginRight: "auto", padding: "20px 26px", border: "1px solid rgba(255,255,255,0.08)", background: "#141414" }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden style={{ flexShrink: 0, marginTop: 2 }}><circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" /></svg>
          <p style={{ fontFamily: SANS, fontSize: "0.86rem", color: "rgba(255,255,255,0.6)", lineHeight: 1.7, margin: 0 }}>
            <GenericEditableText sectionId={sectionId} field="note" value={note} tag="span" />
          </p>
        </div>
      </div>
    </section>
  );
}

function PricingTattoo03({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const c          = content as Record<string, unknown>;
  const showHeader = c.showHeader !== false;
  const eyebrow    = String(c.eyebrow ?? "Férové ceny");
  const heading    = String(c.heading ?? "Ceník tetování");
  const note       = String(c.note    ?? "Konečná cena závisí na velikosti, detailu a umístění motivu. Přesnou kalkulaci vždy potvrdíme zdarma při osobní konzultaci.");
  const items      = (c.items as Array<{ name: string; size: string; price: string; priceNote?: string; features: string[]; featured?: boolean }>) ?? [];

  const ACCENT = "#D41515";

  return (
    <section id="cenik" data-template="tattoo-03" style={{ backgroundColor: "#0a0a0a", padding: "clamp(56px,7vw,104px) clamp(20px,4vw,40px)", position: "relative" }}>
      <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow+Condensed:wght@400;600;700&family=Barlow:wght@400&display=swap" rel="stylesheet" />

      <div style={{ maxWidth: 1280, margin: "0 auto" }}>
        {showHeader && (
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
              <span aria-hidden style={{ width: 30, height: 1, background: "rgba(212,21,21,0.6)" }} />
              <GenericEditableText sectionId={sectionId} field="eyebrow" value={eyebrow} tag="span" style={{
                fontFamily: "'Barlow Condensed','Oswald',sans-serif", fontSize: "0.9rem", fontWeight: 600,
                letterSpacing: "0.26em", textTransform: "uppercase", color: ACCENT,
              }} />
              <span aria-hidden style={{ width: 30, height: 1, background: "rgba(212,21,21,0.6)" }} />
            </div>
            <h2 style={{
              fontFamily: "'Bebas Neue','Oswald',sans-serif", fontWeight: 400,
              fontSize: "clamp(32px, 4vw, 56px)", color: "#ffffff", margin: 0,
              letterSpacing: "0.01em", textTransform: "uppercase", lineHeight: 1,
            }}>
              <GenericEditableText sectionId={sectionId} field="heading" value={heading} tag="span" />
            </h2>
          </div>
        )}

        {/* Pricing karty */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
          gap: 22,
        }}>
          {items.map((item, i) => {
            const featured = !!item.featured;
            return (
              <div
                key={i}
                className="t03-price-card"
                style={{
                  background: featured ? "linear-gradient(165deg, #17110f 0%, #0e0e0e 100%)" : "#111111",
                  border: featured ? `1px solid rgba(212,21,21,0.5)` : "1px solid rgba(255,255,255,0.07)",
                  padding: "36px 30px 32px",
                  position: "relative",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                {featured && (
                  <div style={{
                    position: "absolute", top: 0, left: "50%", transform: "translate(-50%,-50%)",
                    background: ACCENT, color: "#fff",
                    fontFamily: "'Barlow Condensed',sans-serif", fontSize: "0.66rem", fontWeight: 700,
                    letterSpacing: "0.16em", textTransform: "uppercase",
                    padding: "5px 16px",
                  }}>Nejoblíbenější</div>
                )}
                <div style={{ position: "absolute", top: 0, left: 0, width: featured ? "100%" : 40, height: 2, background: ACCENT }} aria-hidden />

                <h3 style={{
                  fontFamily: "'Bebas Neue','Oswald',sans-serif", fontWeight: 400,
                  fontSize: "clamp(24px,2.2vw,30px)", color: "#ffffff",
                  margin: "6px 0 4px", letterSpacing: "0.03em", textTransform: "uppercase", lineHeight: 1,
                }}>
                  <GenericEditableText sectionId={sectionId} field={`items.${i}.name`} value={item.name} tag="span" />
                </h3>
                <div style={{
                  fontFamily: "'Barlow Condensed',sans-serif", fontSize: "0.8rem", fontWeight: 400,
                  color: "rgba(255,255,255,0.4)", letterSpacing: "0.08em", textTransform: "uppercase",
                  marginBottom: 22,
                }}>
                  <GenericEditableText sectionId={sectionId} field={`items.${i}.size`} value={item.size} tag="span" />
                </div>

                <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 6 }}>
                  <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: "0.78rem", color: "rgba(255,255,255,0.45)", textTransform: "uppercase", letterSpacing: "0.1em" }}>od</span>
                  <span style={{ fontFamily: "'Bebas Neue','Oswald',sans-serif", fontSize: "clamp(38px,4vw,52px)", color: ACCENT, lineHeight: 0.9 }}>
                    <GenericEditableText sectionId={sectionId} field={`items.${i}.price`} value={item.price} tag="span" />
                  </span>
                </div>
                {item.priceNote && (
                  <div style={{ fontFamily: "'Barlow',sans-serif", fontSize: "0.76rem", color: "rgba(255,255,255,0.4)", marginBottom: 24 }}>
                    <GenericEditableText sectionId={sectionId} field={`items.${i}.priceNote`} value={item.priceNote} tag="span" />
                  </div>
                )}

                <div style={{ width: "100%", height: 1, background: "rgba(255,255,255,0.07)", margin: "8px 0 22px" }} aria-hidden />

                <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 12, flex: 1 }}>
                  {(item.features ?? []).map((f, j) => (
                    <li key={j} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden style={{ flexShrink: 0, marginTop: 3 }}><polyline points="20 6 9 17 4 12"/></svg>
                      <span style={{ fontFamily: "'Barlow',sans-serif", fontSize: "0.86rem", color: "rgba(255,255,255,0.72)", lineHeight: 1.5 }}>
                        <GenericEditableText sectionId={sectionId} field={`items.${i}.features.${j}`} value={f} tag="span" />
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        {/* Poznámka */}
        <div style={{
          marginTop: 40, display: "flex", alignItems: "flex-start", gap: 14,
          maxWidth: 760, marginLeft: "auto", marginRight: "auto",
          padding: "20px 26px", border: "1px solid rgba(255,255,255,0.07)", background: "#0e0e0e",
        }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden style={{ flexShrink: 0, marginTop: 2 }}><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
          <p style={{ fontFamily: "'Barlow',sans-serif", fontSize: "0.86rem", color: "rgba(255,255,255,0.6)", lineHeight: 1.7, margin: 0, textAlign: "left" }}>
            <GenericEditableText sectionId={sectionId} field="note" value={note} tag="span" />
          </p>
        </div>
      </div>
    </section>
  );
}

// nails-01 · Kyoto Wabi-Sabi Beauty services — editorial 2×2 grid
// Cream bg · centered eyebrow "02 · SLUŽBY" + Georgia H2 s italic accent · 4 portrait
// karty s Roman numeral hanko badge + corner brackets + Georgia italic tagline + procedury
// list s hanko dot bullets · "Ceník" underline-reveal link · bottom trust strip
function ServicesNails01({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const BURGUNDY = "#79142b";
  const CREAM    = "#f4f1e9";
  const SERIF    = "Georgia, 'Times New Roman', serif";
  const SANS     = "'Montserrat', 'Helvetica Neue', Arial, sans-serif";
  const ROMAN    = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII"];

  type ServiceItem = { name?: string; tagline?: string; description?: string; imageUrl?: string };
  const items    = (content.items as ServiceItem[]) ?? [];
  const eyebrow    = String(content.eyebrow     ?? "02 · SLUŽBY");
  const title      = String(content.title       ?? "Objevte naše");
  const titleAc    = String(content.titleAccent ?? "jedinečné rituály");
  const hideHeader = content.hideHeader === true;
  const linkText   = String(content.linkText    ?? "Kompletní ceník");
  const linkHref   = String(content.linkHref    ?? "/cenik");

  return (
    <section
      id="sluzby"
      data-template="nails-01"
      data-section-type="services"
      data-variant="nails-01-services"
      className="n01-services"
      style={{ backgroundColor: CREAM, padding: "clamp(80px, 12vh, 140px) clamp(24px, 6vw, 80px)", position: "relative", overflow: "hidden" }}
    >
      <style>{`
        .n01-services-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: clamp(22px, 2.6vw, 40px);
          align-items: start;
        }
        .n01-service-card { position: relative; }
        .n01-service-photo {
          position: relative;
          overflow: hidden;
          background: #efe9df;
        }
        .n01-service-photo::after {
          content: '';
          position: absolute; inset: 0;
          box-shadow: inset 0 0 0 1px rgba(121,20,43,0.10);
          pointer-events: none; z-index: 2;
        }
        .n01-service-photo img {
          transition: transform 1.05s cubic-bezier(.2,.7,.2,1), filter .6s ease;
          filter: saturate(0.9) brightness(0.99);
        }
        .n01-service-card:hover .n01-service-photo img {
          transform: scale(1.055);
          filter: saturate(1.02) brightness(1.01);
        }
        /* Corner brackets — reveal + settle on hover */
        .n01-service-frame {
          position: absolute; width: 26px; height: 26px; z-index: 3;
          pointer-events: none; opacity: 0;
          transition: opacity .5s ease, transform .55s cubic-bezier(.2,.7,.2,1);
        }
        .n01-service-frame-tl {
          top: 12px; left: 12px;
          border-top: 1.5px solid #f4f1e9; border-left: 1.5px solid #f4f1e9;
          transform: translate(7px, 7px);
        }
        .n01-service-frame-br {
          bottom: 12px; right: 12px;
          border-bottom: 1.5px solid #f4f1e9; border-right: 1.5px solid #f4f1e9;
          transform: translate(-7px, -7px);
        }
        .n01-service-card:hover .n01-service-frame { opacity: 0.9; transform: translate(0, 0); }
        /* Roman-numeral hanko badge */
        .n01-service-numeral {
          position: absolute; top: 14px; right: 14px;
          width: 52px; height: 52px; z-index: 4; display: block;
          filter: drop-shadow(0 4px 10px rgba(121,20,43,0.28));
          transition: transform .55s cubic-bezier(.34,1.56,.64,1);
        }
        .n01-service-card:hover .n01-service-numeral { transform: rotate(-9deg) scale(1.06); }
        /* Ceník link — underline reveal + arrow nudge */
        .n01-services-link {
          display: inline-flex; align-items: center; gap: 12px;
          font-family: 'Montserrat','Helvetica Neue',Arial,sans-serif;
          font-size: 0.78rem; font-weight: 400;
          letter-spacing: 0.26em; text-transform: uppercase;
          color: #79142b; text-decoration: none;
          position: relative; padding-bottom: 9px;
        }
        .n01-services-link::after {
          content: ''; position: absolute; left: 0; bottom: 0;
          width: 100%; height: 1px; background: #79142b;
          transform: scaleX(0); transform-origin: left;
          transition: transform .5s cubic-bezier(.2,.7,.2,1);
        }
        .n01-services-link:hover::after { transform: scaleX(1); }
        .n01-services-link-arrow { display: inline-block; transition: transform .4s ease; }
        .n01-services-link:hover .n01-services-link-arrow { transform: translateX(6px); }
        @media (max-width: 1024px) {
          .n01-services-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 36px 28px; }
        }
        @media (max-width: 560px) {
          .n01-services-grid { grid-template-columns: 1fr; gap: 44px; max-width: 420px; margin: 0 auto; }
        }
      `}</style>
      {/* Washi texture */}
      <div aria-hidden="true" style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        background: "radial-gradient(ellipse at 10% 90%, rgba(121,20,43,0.035), transparent 55%), radial-gradient(ellipse at 90% 10%, rgba(121,20,43,0.03), transparent 55%)",
      }} />

      <div style={{ maxWidth: 1240, margin: "0 auto", position: "relative" }}>
        {/* Header */}
        {!hideHeader && (
          <div style={{ textAlign: "center", marginBottom: "clamp(56px, 8vh, 88px)" }}>
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
              fontFamily: SERIF, fontSize: "clamp(36px, 4.4vw, 64px)",
              fontWeight: 400, color: BURGUNDY, lineHeight: 1.08, margin: 0,
              letterSpacing: "-0.005em",
            }}>
              <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
              <br />
              <em style={{ fontStyle: "italic" }}>
                <GenericEditableText sectionId={sectionId} field="titleAccent" value={titleAc} tag="span" />
              </em>
            </h2>
          </div>
        )}

        {/* 2×2 karty */}
        <div className="n01-services-grid">
          {items.map((item, i) => (
            <article key={`n01s-${i}`} className="n01-service-card">
              {/* Image s corner brackets + Roman numeral hanko badge */}
              <div className="n01-service-photo">
                <span aria-hidden="true" className="n01-service-frame n01-service-frame-tl" />
                <span aria-hidden="true" className="n01-service-frame n01-service-frame-br" />

                <GenericEditableImage
                  sectionId={sectionId}
                  field={`items.${i}.imageUrl`}
                  src={item.imageUrl ?? ""}
                  alt={item.name ?? ""}
                  style={{ display: "block", overflow: "hidden" }}
                >
                  {item.imageUrl ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img loading="lazy" src={item.imageUrl} alt={item.name ?? ""} style={{ width: "100%", aspectRatio: "4/5", objectFit: "cover", display: "block" }} />
                  ) : (
                    <div style={{ width: "100%", aspectRatio: "4/5", backgroundColor: "#f0ece4" }} />
                  )}
                </GenericEditableImage>

                {/* Roman numeral hanko badge — top-right */}
                <span aria-hidden="true" className="n01-service-numeral">
                  <svg width="52" height="52" viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="26" cy="26" r="24" fill={BURGUNDY} />
                    <circle cx="26" cy="26" r="20" stroke={CREAM} strokeWidth="0.5" strokeDasharray="1.2 1.6" fill="none" opacity="0.55" />
                  </svg>
                  <span style={{
                    position: "absolute", inset: 0,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontFamily: SERIF, fontStyle: "italic",
                    fontSize: "1.15rem", fontWeight: 400,
                    color: CREAM, letterSpacing: 0,
                  }}>{ROMAN[i] ?? String(i + 1)}</span>
                </span>
              </div>

              {/* Text */}
              <div style={{ marginTop: 24, padding: "0 4px" }}>
                <h3 style={{
                  fontFamily: SERIF, fontSize: "clamp(22px, 2vw, 28px)",
                  fontWeight: 400, color: BURGUNDY, lineHeight: 1.15,
                  margin: "0 0 6px", letterSpacing: "-0.005em",
                }}>
                  <GenericEditableText sectionId={sectionId} field={`items.${i}.name`} value={item.name ?? ""} tag="span" />
                </h3>
                <div style={{
                  fontFamily: SERIF, fontStyle: "italic",
                  fontSize: "0.98rem", color: BURGUNDY,
                  opacity: 0.65, marginBottom: 18,
                }}>
                  <GenericEditableText sectionId={sectionId} field={`items.${i}.tagline`} value={item.tagline ?? ""} tag="span" />
                </div>
                <div aria-hidden="true" style={{
                  width: 40, height: 1, background: BURGUNDY, opacity: 0.35,
                  marginBottom: 18,
                }} />
                <GenericEditableText
                  sectionId={sectionId}
                  field={`items.${i}.description`}
                  value={item.description ?? ""}
                  tag="p"
                  style={{
                    fontFamily: SANS, fontSize: "clamp(13px, 1vw, 15px)",
                    color: BURGUNDY, opacity: 0.82, fontWeight: 300,
                    margin: 0, lineHeight: 1.75, whiteSpace: "pre-line",
                  } as React.CSSProperties}
                />
              </div>
            </article>
          ))}
        </div>

        {/* Bottom link + trust strip */}
        <div style={{
          marginTop: "clamp(56px, 7vh, 84px)",
          display: "flex", flexDirection: "column", alignItems: "center", gap: 32,
        }}>
          <a href={linkHref} className="n01-services-link">
            <GenericEditableText sectionId={sectionId} field="linkText" value={linkText} tag="span" />
            <span aria-hidden="true" className="n01-services-link-arrow">→</span>
          </a>
          <div aria-hidden="true" style={{
            width: 220, height: 1,
            background: "linear-gradient(90deg, transparent, rgba(121,20,43,0.4), transparent)",
            position: "relative",
          }}>
            <span style={{
              position: "absolute", left: "50%", top: "50%",
              transform: "translate(-50%, -50%) rotate(45deg)",
              width: 6, height: 6, background: CREAM,
              border: `1px solid ${BURGUNDY}`,
            }} />
          </div>
          <div style={{
            fontFamily: SANS, fontSize: "0.68rem", fontWeight: 300,
            letterSpacing: "0.32em", textTransform: "uppercase",
            color: BURGUNDY, opacity: 0.65, textAlign: "center",
          }}>
            Reservio online · Praha 1 · od 2018
          </div>
        </div>
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
  const MUTED = "#6e6e6e";
  const SERIF = "'Cormorant Garamond', Georgia, 'Times New Roman', serif";
  const SANS  = "'Helvetica Neue', Arial, sans-serif";

  const numberPrefix = String(content.numberPrefix ?? "(02)");
  const kicker       = String(content.kicker       ?? "Ceník · Praha 1");
  const title        = String(content.title        ?? "Ceník");
  const lead         = String(content.lead         ?? "Editoriální ceník — všechny ceny v Kč včetně DPH. Skutečné ceny upraví majitel přes editor.");
  const groups       = (content.groups as PricingGroup[]) ?? [];

  const infoText  = String(content.infoText  ?? "Ceny včetně DPH");
  const infoText2 = String(content.infoText2 ?? "Rezervace 24 h předem");
  const infoText3 = String(content.infoText3 ?? "Storno 12 h předem");
  const ctaText     = String(content.ctaText     ?? "Objednat se");
  const ctaHref     = String(content.ctaHref     ?? "/kontakt");
  const secondaryText = String(content.secondaryText ?? "Prohlédnout galerii");
  const secondaryHref = String(content.secondaryHref ?? "/galerie");

  const roman = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII"];

  return (
    <section
      id="cenik"
      data-section-type="services"
      data-variant="nails-02-pricing"
      data-template="nails-02"
      style={{
        backgroundColor: CREAM,
        padding: (title || lead || numberPrefix) ? "clamp(90px, 12vw, 160px) clamp(24px, 6vw, 72px)" : "clamp(48px, 6vw, 72px) clamp(24px, 6vw, 72px)",
        position: "relative",
      }}
    >
      {/* Section eyebrow — hidden on subpages */}
      {(title || lead || numberPrefix) && (
      <div
        className="n02-price-eyebrow"
        aria-hidden="true"
        style={{
          position: "absolute",
          top: "clamp(40px, 6vw, 80px)",
          right: "clamp(24px, 6vw, 72px)",
          display: "flex",
          alignItems: "center",
          gap: 14,
          fontFamily: SANS,
          fontSize: "0.7rem",
          fontWeight: 500,
          color: TAUPE,
          letterSpacing: "0.32em",
          textTransform: "uppercase",
          opacity: 0.75,
        }}
      >
        <span>Kapitola · 02</span>
        <span style={{ display: "block", width: 42, height: 1, backgroundColor: TAUPE, opacity: 0.6 }} />
      </div>
      )}

      <div style={{ maxWidth: 1120, margin: "0 auto" }}>
        {/* Header — hidden on subpages where title+lead are empty */}
        {(title || lead || numberPrefix) && (
        <div style={{ marginBottom: "clamp(72px, 9vw, 120px)", maxWidth: 720 }}>
          {/* (02) with vertical hairline */}
          <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 40 }}>
            <span aria-hidden style={{ display: "block", width: 1, height: 32, backgroundColor: TAUPE }} />
            <span style={{
              fontFamily: SERIF,
              fontStyle: "italic",
              fontWeight: 400,
              fontSize: "clamp(1.5rem, 1.9vw, 1.9rem)",
              color: TAUPE,
              lineHeight: 1,
            }}>
              <GenericEditableText sectionId={sectionId} field="numberPrefix" value={numberPrefix} tag="span" />
            </span>
          </div>

          <h2
            style={{
              fontFamily: SERIF,
              fontStyle: "italic",
              fontWeight: 400,
              fontSize: "clamp(3.2rem, 7vw, 6.6rem)",
              lineHeight: 0.95,
              color: WINE,
              margin: 0,
              letterSpacing: "-0.015em",
            }}
          >
            <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
          </h2>

          <div aria-hidden="true" style={{ width: 88, height: 1, backgroundColor: TAUPE, margin: "48px 0 28px" }} />

          <p style={{
            fontFamily: SANS,
            fontSize: "0.76rem",
            fontWeight: 600,
            color: TAUPE,
            textTransform: "uppercase",
            letterSpacing: "0.32em",
            margin: 0,
          }}>
            <GenericEditableText sectionId={sectionId} field="kicker" value={kicker} tag="span" />
          </p>

          <p
            style={{
              marginTop: 28,
              fontFamily: SANS,
              fontSize: "1.02rem",
              fontWeight: 300,
              lineHeight: 1.8,
              color: INK,
              maxWidth: 580,
            }}
          >
            <GenericEditableText sectionId={sectionId} field="lead" value={lead} tag="span" />
          </p>
        </div>
        )}

        {/* Pricing groups — 2-col on desktop */}
        <div
          className="nails02-pricing-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
            columnGap: "clamp(56px, 8vw, 108px)",
            rowGap: "clamp(64px, 8vw, 96px)",
          }}
        >
          {groups.map((group, gi) => (
            <div key={`pg-${gi}`} className="n02-price-group">
              {/* Group header: Roman badge + italic title */}
              <div style={{ display: "flex", alignItems: "center", gap: 18, marginBottom: 12 }}>
                <span
                  aria-hidden="true"
                  className="n02-price-roman"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 44,
                    height: 44,
                    borderRadius: 999,
                    border: `1px solid ${TAUPE}`,
                    fontFamily: SERIF,
                    fontStyle: "italic",
                    fontWeight: 400,
                    fontSize: "1.05rem",
                    color: WINE,
                    letterSpacing: "0.02em",
                    transition: "border-color 0.4s ease, transform 0.4s ease",
                  }}
                >
                  {roman[gi] ?? String(gi + 1)}
                </span>
                <h3
                  style={{
                    fontFamily: SERIF,
                    fontStyle: "italic",
                    fontWeight: 500,
                    fontSize: "clamp(1.7rem, 2.4vw, 2rem)",
                    color: WINE,
                    margin: 0,
                    letterSpacing: "0.005em",
                    flex: 1,
                  }}
                >
                  <GenericEditableText sectionId={sectionId} field={`groups.${gi}.title`} value={group.title} tag="span" />
                </h3>
              </div>
              <div aria-hidden style={{ height: 1, backgroundColor: `${TAUPE}55`, marginBottom: 26 }} />

              <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 4 }}>
                {(group.items ?? []).map((item, ii) => (
                  <li
                    key={`pg-${gi}-it-${ii}`}
                    className="n02-price-row"
                    style={{
                      display: "flex",
                      alignItems: "baseline",
                      gap: 12,
                      padding: "12px 10px 12px 4px",
                      fontFamily: SANS,
                      transition: "background-color 0.35s ease, padding 0.35s ease",
                      borderBottom: `1px solid transparent`,
                    }}
                  >
                    <span
                      className="n02-price-name"
                      style={{
                        fontSize: "1rem",
                        fontWeight: 400,
                        color: INK,
                        maxWidth: "58%",
                        flexShrink: 0,
                        transition: "color 0.3s ease, transform 0.3s ease",
                      }}
                    >
                      <GenericEditableText sectionId={sectionId} field={`groups.${gi}.items.${ii}.name`} value={item.name} tag="span" />
                      {item.note && (
                        <span style={{
                          marginLeft: 8,
                          fontFamily: SERIF,
                          fontStyle: "italic",
                          fontSize: "0.88rem",
                          color: MUTED,
                          opacity: 0.85,
                        }}>
                          <GenericEditableText sectionId={sectionId} field={`groups.${gi}.items.${ii}.note`} value={item.note} tag="span" />
                        </span>
                      )}
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
                      className="n02-price-price"
                      style={{
                        fontFamily: SERIF,
                        fontStyle: "italic",
                        fontSize: "1.15rem",
                        fontWeight: 500,
                        color: WINE,
                        whiteSpace: "nowrap",
                        letterSpacing: "0.005em",
                        transition: "color 0.3s ease",
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

        {/* Footer info strip */}
        <div
          className="n02-price-footer"
          style={{
            marginTop: "clamp(72px, 10vw, 120px)",
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 0,
            borderTop: `1px solid ${TAUPE}55`,
            borderBottom: `1px solid ${TAUPE}55`,
          }}
        >
          {[
            { key: "infoText",  val: infoText,  icon: "★" },
            { key: "infoText2", val: infoText2, icon: "◈" },
            { key: "infoText3", val: infoText3, icon: "❋" },
          ].map((info, i) => (
            <div
              key={`info-${i}`}
              style={{
                padding: "28px 20px",
                borderLeft: i > 0 ? `1px dashed ${TAUPE}70` : "none",
                textAlign: "center",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 8,
              }}
            >
              <span aria-hidden style={{
                fontFamily: SERIF,
                fontStyle: "italic",
                fontSize: "1.2rem",
                color: TAUPE,
                opacity: 0.9,
              }}>
                {info.icon}
              </span>
              <span style={{
                fontFamily: SANS,
                fontSize: "0.74rem",
                fontWeight: 500,
                color: WINE,
                letterSpacing: "0.24em",
                textTransform: "uppercase",
              }}>
                <GenericEditableText sectionId={sectionId} field={info.key} value={info.val} tag="span" />
              </span>
            </div>
          ))}
        </div>

        {/* Dual CTA row */}
        <div style={{
          marginTop: 56,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 40,
          flexWrap: "wrap",
        }}>
          <a
            href={ctaHref}
            data-btn="primary"
            className="n02-price-cta"
            style={{
              position: "relative",
              display: "inline-flex",
              alignItems: "center",
              gap: 12,
              padding: "16px 36px",
              backgroundColor: "transparent",
              color: WINE,
              border: `1px solid ${WINE}`,
              fontFamily: SANS,
              fontSize: "0.78rem",
              fontWeight: 600,
              letterSpacing: "0.24em",
              textTransform: "uppercase",
              textDecoration: "none",
              overflow: "hidden",
              transition: "color 0.35s ease",
            }}
          >
            <span style={{ position: "relative", zIndex: 2 }}>
              <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
            </span>
            <span style={{ position: "relative", zIndex: 2, display: "inline-flex" }} className="n02-price-cta-arrow">
              <svg width="14" height="10" viewBox="0 0 14 10" fill="none"><path d="M1 5h11m-3.5-3.5L12 5l-3.5 3.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>
            </span>
          </a>
          <a
            href={secondaryHref}
            style={{
              fontFamily: SERIF,
              fontStyle: "italic",
              fontWeight: 400,
              fontSize: "1.02rem",
              color: WINE,
              textDecoration: "none",
              opacity: 0.8,
              transition: "opacity 0.3s ease",
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              paddingBottom: 4,
              borderBottom: `1px solid ${TAUPE}80`,
            }}
            className="n02-price-secondary"
          >
            <GenericEditableText sectionId={sectionId} field="secondaryText" value={secondaryText} tag="span" />
            <span aria-hidden="true">→</span>
          </a>
        </div>
      </div>

      <style>{`
        .n02-price-row:hover {
          background-color: rgba(212,160,128,0.09);
          padding-left: 12px !important;
        }
        .n02-price-row:hover .n02-price-name { color: ${WINE}; }
        .n02-price-group:hover .n02-price-roman { border-color: ${WINE}; transform: scale(1.08); }
        .n02-price-cta {
          transition: background-color 0.35s ease, color 0.35s ease, border-color 0.35s ease;
        }
        .n02-price-cta:hover { background-color: ${WINE}; color: ${CREAM}; border-color: ${WINE}; }
        .n02-price-cta:hover .n02-price-cta-arrow { transform: translateX(4px); transition: transform 0.3s ease; }
        .n02-price-secondary:hover { opacity: 1; border-bottom-color: ${WINE}; }
        @media (max-width: 768px) {
          .nails02-pricing-grid { grid-template-columns: 1fr !important; }
          .n02-price-eyebrow { display: none !important; }
        }
        @media (max-width: 560px) {
          .n02-price-footer { grid-template-columns: 1fr !important; }
          .n02-price-footer > div { border-left: none !important; border-top: 1px dashed ${TAUPE}70 !important; }
          .n02-price-footer > div:first-child { border-top: none !important; }
        }
      `}</style>
    </section>
  );
}

// ── nails-03-services ─────────────────────────────────────────────────────────
function ServicesNails03({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const CREAM = "#FCF9F0";
  const DARK  = "#0B090C";
  const BROWN = "#806248";
  const MUTED = "#5a5047";
  const FONT  = "'Manrope', 'Helvetica Neue', Arial, sans-serif";

  const title   = String(content.title   ?? "Naše služby");
  const kicker  = String(content.kicker  ?? "Péče pro dokonalý vzhled");
  const ctaText = String(content.ctaText ?? "Objednat se");

  const showHeader = content.title !== "" && content.kicker !== "";

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
      data-template="nails-03"
      data-variant="nails-03-services"
      style={{ backgroundColor: CREAM, padding: "110px 24px" }}
    >
      <div style={{ maxWidth: 820, margin: "0 auto" }}>

        {showHeader && (
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 14, marginBottom: 18 }}>
              <span aria-hidden="true" style={{ width: 32, height: "1px", background: BROWN, opacity: 0.5 }} />
              <p style={{
                fontFamily: FONT, fontWeight: 700, fontSize: "0.70rem",
                letterSpacing: "0.25em", textTransform: "uppercase",
                color: BROWN, margin: 0,
              }}>
                <GenericEditableText sectionId={sectionId} field="kicker" value={kicker} tag="span" />
              </p>
              <span aria-hidden="true" style={{ width: 32, height: "1px", background: BROWN, opacity: 0.5 }} />
            </div>
            <h2 style={{
              fontFamily: FONT, fontWeight: 800,
              fontSize: "clamp(1.9rem, 3.5vw, 2.8rem)",
              color: DARK, margin: 0, lineHeight: 1.08,
            }}>
              <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
            </h2>
          </div>
        )}

        {/* Tab pills */}
        <div style={{
          display: "flex", flexWrap: "wrap", justifyContent: "center",
          gap: 8, marginBottom: 48,
        }}>
          {groups.map((g, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className="n03-svc-tab"
              style={{
                padding: "9px 26px",
                borderRadius: 999,
                border: i === active ? `1.5px solid ${BROWN}` : `1.5px solid rgba(128,98,72,0.25)`,
                backgroundColor: i === active ? BROWN : "transparent",
                color: i === active ? CREAM : MUTED,
                fontFamily: FONT,
                fontSize: "0.80rem",
                fontWeight: i === active ? 700 : 500,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                cursor: "pointer",
                transition: "all 0.3s ease",
              }}
            >
              {g.title}
            </button>
          ))}
        </div>

        {/* Price list card */}
        <div className="n03-svc-card" style={{
          backgroundColor: "#fff",
          borderRadius: 4,
          padding: "44px 52px",
          boxShadow: "0 2px 24px rgba(11,9,12,0.05)",
          position: "relative",
        }}>
          {/* Corner brackets on card */}
          <div aria-hidden="true" style={{ position: "absolute", inset: -8, pointerEvents: "none" }}>
            <span style={{ position: "absolute", top: 0, left: 0, width: 20, height: 20, borderTop: `1px solid rgba(128,98,72,0.22)`, borderLeft: `1px solid rgba(128,98,72,0.22)` }} />
            <span style={{ position: "absolute", top: 0, right: 0, width: 20, height: 20, borderTop: `1px solid rgba(128,98,72,0.22)`, borderRight: `1px solid rgba(128,98,72,0.22)` }} />
            <span style={{ position: "absolute", bottom: 0, left: 0, width: 20, height: 20, borderBottom: `1px solid rgba(128,98,72,0.22)`, borderLeft: `1px solid rgba(128,98,72,0.22)` }} />
            <span style={{ position: "absolute", bottom: 0, right: 0, width: 20, height: 20, borderBottom: `1px solid rgba(128,98,72,0.22)`, borderRight: `1px solid rgba(128,98,72,0.22)` }} />
          </div>

          <h3 style={{
            fontFamily: FONT, fontWeight: 800,
            fontSize: "1rem", letterSpacing: "0.08em",
            textTransform: "uppercase", color: BROWN,
            margin: "0 0 8px",
          }}>
            <GenericEditableText sectionId={sectionId} field={`groups.${active}.title`} value={activeGroup.title} tag="span" />
          </h3>
          <div aria-hidden="true" style={{ width: 36, height: "1.5px", backgroundColor: BROWN, opacity: 0.4, marginBottom: 28 }} />

          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {activeGroup.items.map((item, j) => (
              <div
                key={j}
                className="n03-svc-row"
                style={{
                  display: "flex",
                  alignItems: "baseline",
                  padding: "14px 0",
                  borderBottom: j < activeGroup.items.length - 1 ? `1px solid rgba(128,98,72,0.10)` : "none",
                  transition: "background-color 0.2s ease",
                }}
              >
                <span style={{ fontFamily: FONT, fontSize: "0.93rem", fontWeight: 400, color: DARK, flexShrink: 0 }}>
                  <GenericEditableText sectionId={sectionId} field={`groups.${active}.items.${j}.name`} value={item.name} tag="span" />
                </span>
                {/* Dashed leader dots */}
                <span aria-hidden="true" style={{
                  flex: 1, minWidth: 24, margin: "0 12px",
                  borderBottom: `1px dashed rgba(128,98,72,0.25)`,
                  alignSelf: "center", height: 0,
                }} />
                <span style={{
                  flexShrink: 0,
                  fontFamily: FONT, fontSize: "0.93rem", fontWeight: 700,
                  color: BROWN, whiteSpace: "nowrap",
                }}>
                  <GenericEditableText sectionId={sectionId} field={`groups.${active}.items.${j}.price`} value={item.price} tag="span" />
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div style={{ textAlign: "center", marginTop: 52 }}>
          <a
            href="/kontakt"
            data-btn="primary"
            className="n03-svc-cta"
            style={{
              display: "inline-flex", alignItems: "center", gap: 10,
              padding: "12px 40px",
              backgroundColor: BROWN, color: CREAM,
              fontFamily: FONT, fontSize: "0.82rem", fontWeight: 700,
              letterSpacing: "0.08em", textTransform: "uppercase",
              textDecoration: "none", borderRadius: 999,
              transition: "background-color 0.3s ease, transform 0.3s ease, box-shadow 0.3s ease",
              position: "relative", overflow: "hidden",
            }}
          >
            <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="8" x2="13" y2="8"/><polyline points="9 4 13 8 9 12"/>
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}

// ── clinic-03-services ─────────────────────────────────────────────────────
// Infinite horizontal carousel: tripled array + snap-back, 4 visible desktop
// Reference: diamond-look.cz
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
function ServicesFyzio01({ content, sectionId, tenantSlug, isAdmin }: { content: Record<string, unknown>; sectionId: number; tenantSlug?: string; isAdmin?: boolean }) {
  type Item = { title?: string; name?: string; description?: string; image?: string; tag?: string };
  const taglineRaw = (content as Record<string, unknown>).tagline;
  const titleRaw   = (content as Record<string, unknown>).title;
  const tagline = taglineRaw === undefined ? "Naše specializace" : String(taglineRaw);
  const title   = titleRaw   === undefined ? "Co pro vás dokážeme udělat" : String(titleRaw);
  const showHeader = !!(tagline.trim() || title.trim());

  const body      = String(content.body    ?? "");
  const ctaText   = String(content.ctaText ?? "Objednat se");
  const ctaHref   = String(content.ctaHref ?? "/kontakt");
  const linkLabel = String(content.linkLabel ?? "Zjistit více");
  const items     = (content.items as Item[]) ?? [];

  const NAVY  = "#1f2d69";
  const GREEN = "#10d15d";
  const WHITE = "#ffffff";
  const MUTED = "#6b7280";
  const MONT  = "'Montserrat', sans-serif";
  const SANS  = "'Open Sans', sans-serif";

  const navResolve = (href: string) => resolveNavHref(href, String(content.siteMode ?? "multipage"), tenantSlug, isAdmin);

  return (
    <section id="sluzby" data-template="fyzio-01" className="fyzio01-svc" style={{ backgroundColor: WHITE, fontFamily: SANS }}>
      {/* Header band — navy bg s dekorativním EKG pruhem */}
      {showHeader && (
        <div className="fyzio01-svc-band">
          <svg className="fyzio01-svc-band-ecg" viewBox="0 0 1200 120" preserveAspectRatio="none" aria-hidden="true">
            <path d="M0,60 L420,60 L440,60 L455,26 L472,96 L488,18 L504,90 L520,60 L560,60 L1200,60" fill="none" stroke="#10d15d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <div style={{ maxWidth: 1200, margin: "0 auto", textAlign: "center", position: "relative", zIndex: 1 }}>
            {tagline.trim() && (
              <div className="fyzio01-svc-kicker">
                <span className="fyzio01-svc-kicker-dash" aria-hidden="true" />
                <GenericEditableText sectionId={sectionId} field="tagline" value={tagline} tag="span"
                  style={{ fontFamily: MONT, fontSize: 11, fontWeight: 700, color: GREEN, letterSpacing: "0.2em", textTransform: "uppercase" }} />
                <span className="fyzio01-svc-kicker-dash" aria-hidden="true" />
              </div>
            )}
            {title.trim() && (
              <h2 style={{ fontFamily: MONT, fontSize: "clamp(26px, 3.5vw, 42px)", fontWeight: 800, color: WHITE, margin: "16px 0 16px", lineHeight: 1.2, letterSpacing: "-0.01em" }}>
                <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
              </h2>
            )}
            {body && (
              <p style={{ fontSize: 16, color: "rgba(255,255,255,0.72)", maxWidth: 560, margin: "0 auto", lineHeight: 1.75, fontFamily: SANS }}>
                <GenericEditableText sectionId={sectionId} field="body" value={body} tag="span" />
              </p>
            )}
          </div>
        </div>
      )}

      {/* Cards grid */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "56px 24px 80px" }}>
        <div className="fyzio01-svc-grid">
          {items.map((item, i) => {
            const name = item.title ?? item.name ?? "";
            const desc = item.description ?? "";
            const img  = item.image ?? "";
            const tag  = item.tag ?? "";
            return (
              <div key={i} className="fyzio01-svc-card">
                {/* Image */}
                <div className="fyzio01-svc-media">
                  <GenericEditableImage sectionId={sectionId} field={`items.${i}.image`} src={img} alt={name} style={{ display: "block", width: "100%", height: "100%" }}>
                    {img ? (
                      <img src={img} alt={name} loading="lazy" className="fyzio01-svc-photo" />
                    ) : (
                      <div style={{ width: "100%", height: "100%", backgroundColor: "#dde6f0", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke={NAVY} strokeWidth="1.5" opacity="0.3"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>
                      </div>
                    )}
                  </GenericEditableImage>
                  {tag && (
                    <span className="fyzio01-svc-tag">
                      <GenericEditableText sectionId={sectionId} field={`items.${i}.tag`} value={tag} tag="span" />
                    </span>
                  )}
                </div>

                {/* Green accent bar */}
                <div className="fyzio01-svc-accent" aria-hidden="true" />

                {/* Card body */}
                <div className="fyzio01-svc-body">
                  <h3 style={{ fontFamily: MONT, fontSize: 18, fontWeight: 700, color: NAVY, margin: "0 0 10px", lineHeight: 1.3 }}>
                    <GenericEditableText sectionId={sectionId} field={`items.${i}.title`} value={name} tag="span" />
                  </h3>
                  <p style={{ fontSize: 14, color: MUTED, lineHeight: 1.75, margin: 0, flex: 1 }}>
                    <GenericEditableText sectionId={sectionId} field={`items.${i}.description`} value={desc} tag="span" />
                  </p>
                  <div className="fyzio01-svc-link">
                    <GenericEditableText sectionId={sectionId} field="linkLabel" value={linkLabel} tag="span" />
                    <svg className="fyzio01-svc-link-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA */}
        {ctaText && (
          <div style={{ textAlign: "center", marginTop: 52 }}>
            <a href={navResolve(ctaHref)} data-btn="primary" className="fyzio01-svc-cta"
              style={{ display: "inline-flex", alignItems: "center", gap: 10, backgroundColor: NAVY, color: WHITE, fontFamily: MONT, fontSize: 15, fontWeight: 700, padding: "15px 38px", borderRadius: 999, textDecoration: "none", letterSpacing: "0.03em" }}>
              <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
              <svg className="fyzio01-svc-cta-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
            </a>
          </div>
        )}
      </div>
    </section>
  );
}

// ── fyzio-01-pricing ──────────────────────────────────────────────────────────
// Ceník — surface bg, kategorie jako karty s řádky služba + cena, note + CTA
// ─────────────────────────────────────────────────────────────────────────────
function PricingFyzio01({ content, sectionId, tenantSlug, isAdmin }: { content: Record<string, unknown>; sectionId: number; tenantSlug?: string; isAdmin?: boolean }) {
  type Row = { name?: string; desc?: string; price?: string };
  type Category = { title?: string; rows?: Row[] };
  const taglineRaw = (content as Record<string, unknown>).tagline;
  const titleRaw   = (content as Record<string, unknown>).title;
  const tagline = taglineRaw === undefined ? "Ceník" : String(taglineRaw);
  const title   = titleRaw   === undefined ? "Přehledné ceny našich služeb" : String(titleRaw);
  const showHeader = !!(tagline.trim() || title.trim());

  const body      = String(content.body ?? "");
  const note      = String(content.note ?? "Ceny jsou orientační. Přesnou cenu terapie určíme po vstupním vyšetření.");
  const ctaText   = String(content.ctaText ?? "Objednat se");
  const ctaHref   = String(content.ctaHref ?? "/kontakt");
  const categories = (content.categories as Category[]) ?? [];

  const NAVY  = "#1f2d69";
  const GREEN = "#10d15d";
  const MUTED = "#6b7280";
  const MONT  = "'Montserrat', sans-serif";
  const SANS  = "'Open Sans', sans-serif";

  const navResolve = (href: string) => resolveNavHref(href, String(content.siteMode ?? "multipage"), tenantSlug, isAdmin);

  return (
    <section id="cenik" data-template="fyzio-01" className="fyzio01-pricing" style={{ fontFamily: SANS }}>
      <div style={{ maxWidth: 1080, margin: "0 auto", padding: "0 24px" }}>
        {showHeader && (
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            {tagline.trim() && (
              <div className="fyzio01-pricing-kicker">
                <span className="fyzio01-pricing-dash" aria-hidden="true" />
                <GenericEditableText sectionId={sectionId} field="tagline" value={tagline} tag="span"
                  style={{ fontFamily: MONT, fontSize: 12, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: "#6bbea1" }} />
                <span className="fyzio01-pricing-dash" aria-hidden="true" />
              </div>
            )}
            {title.trim() && (
              <h2 style={{ fontFamily: MONT, fontSize: "clamp(24px,3vw,38px)", fontWeight: 800, color: NAVY, margin: "14px 0 0", letterSpacing: "-0.01em" }}>
                <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
              </h2>
            )}
            {body && (
              <p style={{ fontSize: 15.5, color: MUTED, maxWidth: 560, margin: "14px auto 0", lineHeight: 1.7 }}>
                <GenericEditableText sectionId={sectionId} field="body" value={body} tag="span" />
              </p>
            )}
          </div>
        )}

        <div className="fyzio01-pricing-grid">
          {categories.map((cat, ci) => (
            <div key={ci} className="fyzio01-pricing-card">
              <h3 style={{ fontFamily: MONT, fontSize: 18, fontWeight: 700, color: NAVY, margin: "0 0 4px" }}>
                <GenericEditableText sectionId={sectionId} field={`categories.${ci}.title`} value={cat.title ?? ""} tag="span" />
              </h3>
              <div className="fyzio01-pricing-cat-rule" aria-hidden="true" />
              <ul style={{ listStyle: "none", margin: "18px 0 0", padding: 0 }}>
                {(cat.rows ?? []).map((r, ri) => (
                  <li key={ri} className="fyzio01-pricing-row">
                    <div>
                      <GenericEditableText sectionId={sectionId} field={`categories.${ci}.rows.${ri}.name`} value={r.name ?? ""} tag="span"
                        style={{ fontFamily: SANS, fontSize: 15, fontWeight: 600, color: "#2a3550", display: "block" }} />
                      {r.desc && (
                        <GenericEditableText sectionId={sectionId} field={`categories.${ci}.rows.${ri}.desc`} value={r.desc} tag="span"
                          style={{ fontFamily: SANS, fontSize: 13, color: MUTED, display: "block", marginTop: 2 }} />
                      )}
                    </div>
                    <span className="fyzio01-pricing-price">
                      <GenericEditableText sectionId={sectionId} field={`categories.${ci}.rows.${ri}.price`} value={r.price ?? ""} tag="span" />
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="fyzio01-pricing-foot">
          <p className="fyzio01-pricing-note">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6bbea1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flexShrink: 0 }}><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
            <GenericEditableText sectionId={sectionId} field="note" value={note} tag="span" />
          </p>
          {ctaText && (
            <a href={navResolve(ctaHref)} data-btn="primary" className="fyzio01-pricing-cta"
              style={{ display: "inline-flex", alignItems: "center", gap: 10, backgroundColor: GREEN, color: "#fff", fontFamily: MONT, fontSize: 15, fontWeight: 700, padding: "14px 32px", borderRadius: 999, textDecoration: "none", letterSpacing: "0.03em" }}>
              <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
              <svg className="fyzio01-pricing-cta-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
            </a>
          )}
        </div>
      </div>
    </section>
  );
}

// ── fyzio-02-services-list ────────────────────────────────────────────────────
// Bílé bg, centrovaný header + icon-list terapií (2-col řádky: teal ikona +
// title + popis, hairline dividery, hover fill/slide). Teal CTA pill dole.
// Movia — fyzioterapie & funkční neurologie. Inspirováno resetclinic.cz.
// ─────────────────────────────────────────────────────────────────────────────
function ServicesFyzio02({ content, sectionId, tenantSlug, isAdmin }: { content: Record<string, unknown>; sectionId: number; tenantSlug?: string; isAdmin?: boolean }) {
  type Item = { title?: string; name?: string; description?: string; icon?: string };
  const id      = String(content.id      ?? "sluzby");
  const ctaText = String(content.ctaText ?? "Objednat konzultaci");
  const ctaHref = String(content.ctaHref ?? "/kontakt");
  const items   = (content.items as Item[]) ?? [];
  const siteMode = String(content.siteMode ?? "multipage");
  const resolve = (href: string) => resolveNavHref(href, siteMode, tenantSlug, isAdmin);

  // conditional header (skryje se na /sluzby subpage)
  const eyebrowRaw = (content as Record<string, unknown>).tagline;
  const titleRaw   = (content as Record<string, unknown>).title;
  const bodyRaw    = (content as Record<string, unknown>).body;
  const tagline = eyebrowRaw === undefined ? "Naše terapie" : String(eyebrowRaw);
  const title   = titleRaw   === undefined ? "Terapie, které vracejí do pohybu" : String(titleRaw);
  const body    = bodyRaw    === undefined ? "Specializujeme se na bolesti pohybového aparátu, rehabilitaci po úrazech a stavy, u kterých běžná fyzioterapie nestačí." : String(bodyRaw);
  const showHeader = !!(tagline.trim() || title.trim() || body.trim());

  const secRef = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = secRef.current;
    if (!el) return;
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) { (e.target as HTMLElement).classList.add("fz2-vis"); obs.unobserve(e.target); } });
    }, { threshold: 0.14 });
    el.querySelectorAll<HTMLElement>("[data-fz2sv]").forEach(item => obs.observe(item));
    return () => obs.disconnect();
  }, []);

  const iconFor = (name?: string) => {
    if (name === "brain") return <><path d="M12 2C8.13 2 5 5.13 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.87-3.13-7-7-7z"/><path d="M9 21h6"/></>;
    if (name === "activity") return <><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></>;
    if (name === "zap") return <><path d="M13 2 3 14h9l-1 8 10-12h-9z"/></>;
    if (name === "monitor") return <><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></>;
    // hand (default — manuální terapie)
    return <><path d="M18 11V6a2 2 0 0 0-2-2 2 2 0 0 0-2 2M14 10V4a2 2 0 0 0-2-2 2 2 0 0 0-2 2v2M10 10.5V6a2 2 0 0 0-2-2 2 2 0 0 0-2 2v8"/><path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15"/></>;
  };

  return (
    <section ref={secRef} id={id} data-template="fyzio-02" className="fz2-sv">
      <div className="fz2-sv-inner">
        {showHeader && (
          <div className="fz2-sv-head fz2-reveal" data-fz2sv>
            {tagline.trim() && (
              <span className="fz2-pill">
                <GenericEditableText sectionId={sectionId} field="tagline" value={tagline} tag="span" />
              </span>
            )}
            {title.trim() && (
              <h2 className="fz2-sv-title">
                <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
              </h2>
            )}
            {body.trim() && (
              <p className="fz2-sv-lead">
                <GenericEditableText sectionId={sectionId} field="body" value={body} tag="span" />
              </p>
            )}
          </div>
        )}

        <div className="fz2-sv-list">
          {items.map((item, i) => {
            const name = item.title ?? item.name ?? "";
            const desc = item.description ?? "";
            return (
              <article key={i} className="fz2-sv-row fz2-reveal" data-fz2sv style={{ transitionDelay: `${i * 80}ms` }}>
                <div className="fz2-sv-ico">
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    {iconFor(item.icon)}
                  </svg>
                </div>
                <div className="fz2-sv-txt">
                  <h3 className="fz2-sv-row-title">
                    <GenericEditableText sectionId={sectionId} field={`items.${i}.title`} value={name} tag="span" />
                  </h3>
                  <p className="fz2-sv-row-body">
                    <GenericEditableText sectionId={sectionId} field={`items.${i}.description`} value={desc} tag="span" />
                  </p>
                </div>
                <span className="fz2-sv-arrow" aria-hidden="true">
                  <svg width="18" height="13" viewBox="0 0 18 13" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M1 6.5h15M11 1l5 5.5L11 12" /></svg>
                </span>
              </article>
            );
          })}
        </div>

        {ctaText.trim() && (
          <div className="fz2-sv-cta-wrap fz2-reveal" data-fz2sv>
            <a href={resolve(ctaHref)} data-btn="primary" className="fz2-sv-cta">
              <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
              <svg width="15" height="11" viewBox="0 0 15 11" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M1 5.5h12M9 1l4 4.5L9 10" /></svg>
            </a>
          </div>
        )}
      </div>
    </section>
  );
}

// ── fyzio-02-pricing ──────────────────────────────────────────────────────────
// Světlé #f1f6f6, 2×2 kategorie karty s řádky služba + délka + cena, teal accent,
// note karta + CTA. Movia ceník. Conditional header (na /cenik banner skryje).
// ─────────────────────────────────────────────────────────────────────────────
function PricingFyzio02({ content, sectionId, tenantSlug, isAdmin }: { content: Record<string, unknown>; sectionId: number; tenantSlug?: string; isAdmin?: boolean }) {
  type Row = { name?: string; note?: string; price?: string };
  type Cat = { title?: string; items?: Row[] };
  const id      = String(content.id ?? "cenik");
  const categories = (content.categories as Cat[]) ?? [];
  const note    = String(content.note    ?? "Terapii částečně hradíme přes smluvní zdravotní pojišťovny. Storno zdarma 24 hodin předem.");
  const ctaText = String(content.ctaText ?? "Objednat se");
  const ctaHref = String(content.ctaHref ?? "/kontakt");
  const noteLabel = String(content.noteLabel ?? "Dobré vědět");
  const siteMode = String(content.siteMode ?? "multipage");
  const resolve = (href: string) => resolveNavHref(href, siteMode, tenantSlug, isAdmin);

  // conditional header
  const eyebrowRaw = (content as Record<string, unknown>).tagline;
  const titleRaw   = (content as Record<string, unknown>).title;
  const bodyRaw    = (content as Record<string, unknown>).body;
  const tagline = eyebrowRaw === undefined ? "Ceník" : String(eyebrowRaw);
  const title   = titleRaw   === undefined ? "Transparentní ceny terapie" : String(titleRaw);
  const body    = bodyRaw    === undefined ? "Žádné skryté poplatky. Cenu vždy znáte předem a plán terapie sestavíme podle vašich možností." : String(bodyRaw);
  const showHeader = !!(tagline.trim() || title.trim() || body.trim());

  const secRef = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = secRef.current;
    if (!el) return;
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) { (e.target as HTMLElement).classList.add("fz2-vis"); obs.unobserve(e.target); } });
    }, { threshold: 0.12 });
    el.querySelectorAll<HTMLElement>("[data-fz2pr]").forEach(i => obs.observe(i));
    return () => obs.disconnect();
  }, []);

  return (
    <section ref={secRef} id={id} data-template="fyzio-02" className="fz2-pr">
      <div className="fz2-pr-inner">
        {showHeader && (
          <div className="fz2-pr-head fz2-reveal" data-fz2pr>
            {tagline.trim() && (
              <span className="fz2-pill">
                <GenericEditableText sectionId={sectionId} field="tagline" value={tagline} tag="span" />
              </span>
            )}
            {title.trim() && (
              <h2 className="fz2-pr-title">
                <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
              </h2>
            )}
            {body.trim() && (
              <p className="fz2-pr-lead">
                <GenericEditableText sectionId={sectionId} field="body" value={body} tag="span" />
              </p>
            )}
          </div>
        )}

        <div className="fz2-pr-grid">
          {categories.map((cat, ci) => (
            <article key={ci} className="fz2-pr-card fz2-reveal" data-fz2pr style={{ transitionDelay: `${ci * 80}ms` }}>
              <h3 className="fz2-pr-cat">
                <span className="fz2-pr-cat-dot" aria-hidden="true" />
                <GenericEditableText sectionId={sectionId} field={`categories.${ci}.title`} value={cat.title ?? ""} tag="span" />
              </h3>
              <ul className="fz2-pr-rows">
                {(cat.items ?? []).map((row, ri) => (
                  <li key={ri} className="fz2-pr-row">
                    <span className="fz2-pr-row-name">
                      <GenericEditableText sectionId={sectionId} field={`categories.${ci}.items.${ri}.name`} value={row.name ?? ""} tag="span" />
                      {(row.note ?? "").trim() && (
                        <GenericEditableText sectionId={sectionId} field={`categories.${ci}.items.${ri}.note`} value={row.note ?? ""} tag="span" style={{ display: "block", fontSize: "0.78rem", color: "#7b8b8d", fontWeight: 400, marginTop: "2px" }} />
                      )}
                    </span>
                    <span className="fz2-pr-dots" aria-hidden="true" />
                    <span className="fz2-pr-row-price">
                      <GenericEditableText sectionId={sectionId} field={`categories.${ci}.items.${ri}.price`} value={row.price ?? ""} tag="span" />
                    </span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>

        <div className="fz2-pr-foot fz2-reveal" data-fz2pr>
          <div className="fz2-pr-note">
            <span className="fz2-pr-note-ico" aria-hidden="true">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>
            </span>
            <span className="fz2-pr-note-txt">
              <GenericEditableText sectionId={sectionId} field="noteLabel" value={noteLabel} tag="strong" />
              <GenericEditableText sectionId={sectionId} field="note" value={note} tag="span" />
            </span>
          </div>
          <a href={resolve(ctaHref)} data-btn="primary" className="fz2-pr-cta">
            <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
            <svg width="15" height="11" viewBox="0 0 15 11" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M1 5.5h12M9 1l4 4.5L9 10" /></svg>
          </a>
        </div>
      </div>
    </section>
  );
}

// ── cafe-02-menu ───────────────────────────────────────────────────────────────
// Cream #F7F4EF bg; gold kicker + burgundy serif H2 centrovaně
// 3-col karty: foto (16:9) + gold top border + kategorie + popis + card link
// ─────────────────────────────────────────────────────────────────────────────
function ServicesCafe02({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const id           = String(content.id           ?? "menu");
  const eyebrow      = String(content.eyebrow      ?? content.tagline ?? "Naše nabídka");
  const title        = String(content.title        ?? "Menu pro každou\ndenní dobu.");
  const body         = String(content.body         ?? "Snídaně, obědy i večeře v elegantním vídeňském prostředí. Každý chod z čerstvých surovin a poctivých receptur — od klasického vídeňského řízku po výběrovou kávu z tichých roasterů.");
  const ctaText      = String(content.ctaText      ?? "Zobrazit celé menu");
  const ctaHref      = String(content.ctaHref      ?? "/menu");
  const showHeader   = content.showHeader !== false && (eyebrow || title || body);
  const items = (content.items as Array<Record<string, unknown>>) ?? [];

  const PLACEHOLDERS = [
    "https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=800&h=1000&fit=crop&fm=webp&q=88",
    "https://images.unsplash.com/photo-1547592180-85f173990554?w=800&h=1000&fit=crop&fm=webp&q=88",
    "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&h=1000&fit=crop&fm=webp&q=88",
  ];
  const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];

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
    <section
      ref={secRef}
      id={id}
      data-template="cafe-02"
      data-variant="cafe-02-menu"
      className="cafe02-menu"
      aria-label="Menu"
    >
      <span className="cafe02-menu__ornament" aria-hidden>
        <svg viewBox="0 0 80 80" fill="none">
          <circle cx="40" cy="40" r="30" stroke="currentColor" strokeWidth="0.6" opacity="0.5"/>
          <circle cx="40" cy="40" r="20" stroke="currentColor" strokeWidth="0.6" opacity="0.4"/>
          <circle cx="40" cy="40" r="4" fill="currentColor"/>
        </svg>
      </span>

      <div className="cafe02-menu__inner">
        {showHeader && (
          <div className="cafe02-menu__head" data-c02m="0">
            <div className="cafe02-menu__eyebrow">
              <span className="cafe02-menu__eyebrow-rule" />
              <GenericEditableText sectionId={sectionId} field="eyebrow" value={eyebrow} tag="span" />
              <span className="cafe02-menu__eyebrow-rule" />
            </div>
            <h2 className="cafe02-menu__title">
              <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
            </h2>
            {body && (
              <p className="cafe02-menu__body">
                <GenericEditableText sectionId={sectionId} field="body" value={body} tag="span" />
              </p>
            )}
          </div>
        )}

        <div className="cafe02-menu__grid">
          {items.map((item, i) => {
            const name     = String(item.name        ?? "");
            const category = String(item.category    ?? "");
            const desc     = String(item.description ?? "");
            const img      = String(item.image       ?? PLACEHOLDERS[i % 3]);
            const cardCta  = String(item.ctaText     ?? "Jídelní lístek");
            const cardHref = String(item.ctaHref     ?? ctaHref);
            const price    = String(item.priceHint   ?? "");

            return (
              <article
                key={i}
                data-c02m={i + 1}
                style={{ transitionDelay: `${i * 0.12}s` }}
                className="cafe02-menu__card"
              >
                <span className="cafe02-menu__roman" aria-hidden>{ROMAN[i] || String(i + 1)}</span>

                <div className="cafe02-menu__photo">
                  <GenericEditableImage sectionId={sectionId} field={`items.${i}.image`} src={img} alt={name} style={{ width: "100%", height: "100%", display: "block" }}>
                    <img loading="lazy" src={img} alt={name} className="cafe02-menu__photo-img" />
                  </GenericEditableImage>
                  <span className="cafe02-menu__photo-veil" aria-hidden />
                </div>

                <div className="cafe02-menu__body-wrap">
                  <div className="cafe02-menu__cat">
                    <span className="cafe02-menu__cat-dot" aria-hidden />
                    <GenericEditableText sectionId={sectionId} field={`items.${i}.category`} value={category} tag="span" />
                  </div>

                  <h3 className="cafe02-menu__name">
                    <GenericEditableText sectionId={sectionId} field={`items.${i}.name`} value={name} tag="span" />
                  </h3>

                  {price && (
                    <div className="cafe02-menu__price">
                      <span className="cafe02-menu__price-rail" />
                      <GenericEditableText sectionId={sectionId} field={`items.${i}.priceHint`} value={price} tag="span" />
                    </div>
                  )}

                  <p className="cafe02-menu__desc">
                    <GenericEditableText sectionId={sectionId} field={`items.${i}.description`} value={desc} tag="span" />
                  </p>

                  <a href={cardHref} className="cafe02-menu__card-link">
                    <GenericEditableText sectionId={sectionId} field={`items.${i}.ctaText`} value={cardCta} tag="span" />
                    <svg width="14" height="10" viewBox="0 0 16 10" fill="none" aria-hidden>
                      <path d="M1 5H15M10 1L15 5L10 9" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </a>
                </div>
              </article>
            );
          })}
        </div>

        <div className="cafe02-menu__cta-wrap" data-c02m={items.length + 1}>
          <a href={ctaHref} data-btn="primary" className="cafe02-menu__cta">
            <span className="cafe02-nav__cta-shine" aria-hidden />
            <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
            <svg width="16" height="10" viewBox="0 0 16 10" fill="none" aria-hidden className="cafe02-menu__cta-arrow">
              <path d="M1 5H15M10 1L15 5L10 9" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}

// ── restaurant-01-menu ─────────────────────────────────────────────────────────
// Dark #0f0a07 bg; amber kicker + cream serif H2 centrovaně
// 3-col menu karty: foto + amber top border + kategorie + popis + link
// ─────────────────────────────────────────────────────────────────────────────
function ServicesRestaurant01({ content, sectionId, tenantSlug, isAdmin }: { content: Record<string, unknown>; sectionId: number; tenantSlug?: string; isAdmin?: boolean }) {
  const id      = String(content.id      ?? "menu");
  const taglineRaw = content.tagline;
  const titleRaw   = content.title;
  const tagline = taglineRaw === undefined ? "Naše nabídka" : String(taglineRaw);
  const title   = titleRaw   === undefined ? "Kompozice chutí\npro každou chvíli." : String(titleRaw);
  const body    = String(content.body    ?? "");
  const showHeader = !!(tagline.trim() || title.trim() || body.trim());
  const ctaText = String(content.ctaText ?? "Kompletní jídelní lístek");
  const ctaHref = String(content.ctaHref ?? "/menu");
  const siteMode = String((content as { siteMode?: string }).siteMode ?? "multipage");
  const items   = (content.items as Array<Record<string, unknown>>) ?? [];

  const resolve = (href: string) => resolveNavHref(href, siteMode, tenantSlug, isAdmin);

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
  const FALLBACK = [
    "/templates/restaurant-01/menu-1.webp",
    "/templates/restaurant-01/menu-2.webp",
    "/templates/restaurant-01/menu-3.webp",
  ];

  return (
    <section ref={secRef} id={id} data-template="restaurant-01" data-variant="restaurant-01-menu" style={{ backgroundColor: DARK, padding: "clamp(72px, 9vw, 116px) 0", fontFamily: SANS }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 clamp(24px, 5vw, 64px)" }}>
        {/* Header */}
        {showHeader && (
          <div data-r01="0" style={{ textAlign: "center", marginBottom: "clamp(44px, 5vw, 64px)" }}>
            <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.2em", textTransform: "uppercase", color: AMBER, margin: "0 0 16px" }}>
              <GenericEditableText sectionId={sectionId} field="tagline" value={tagline} tag="span" />
            </p>
            {/* Decorative amber rule + diamond */}
            <div aria-hidden style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 22 }}>
              <span style={{ width: 40, height: 1, background: `${AMBER}66` }} />
              <span style={{ width: 6, height: 6, transform: "rotate(45deg)", background: AMBER }} />
              <span style={{ width: 40, height: 1, background: `${AMBER}66` }} />
            </div>
            <h2 style={{ fontFamily: FONT, fontSize: "clamp(28px, 3.5vw, 46px)", fontWeight: 400, color: CREAM, margin: "0 0 20px", lineHeight: 1.18, whiteSpace: "pre-line" }}>
              <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
            </h2>
            {body && (
              <p style={{ fontSize: 15, fontWeight: 300, lineHeight: 1.7, color: MUTED, maxWidth: 580, margin: "0 auto" }}>
                <GenericEditableText sectionId={sectionId} field="body" value={body} tag="span" />
              </p>
            )}
          </div>
        )}

        {/* Karty */}
        <div className="r01-menu-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 26, marginBottom: 52 }}>
          {items.map((item, i) => {
            const name     = String(item.name        ?? "");
            const category = String(item.category    ?? "");
            const desc     = String(item.description ?? "");
            const img      = String(item.image       ?? FALLBACK[i % 3]);
            const cardCta  = String(item.ctaText     ?? "Prohlédnout");
            const cardHref = String(item.ctaHref     ?? ctaHref);
            return (
              /* Outer reveal wrapper */
              <div key={i} data-r01={i + 1} style={{ transitionDelay: `${i * 0.12}s` }}>
                {/* Inner card — handles hover independently */}
                <div className="r01-menu-card" style={{ position: "relative", backgroundColor: CARD, overflow: "hidden", borderRadius: 2, border: `1px solid rgba(200,148,63,0.15)`, height: "100%", transition: "transform 0.32s cubic-bezier(.22,1,.36,1), border-color 0.32s ease, box-shadow 0.32s ease" }}>
                  {/* Amber top border */}
                  <div style={{ height: 2, backgroundColor: AMBER }} />
                  {/* Foto */}
                  <div style={{ position: "relative", aspectRatio: "16/10", overflow: "hidden" }}>
                    <GenericEditableImage sectionId={sectionId} field={`items.${i}.image`} src={img} alt={name} style={{ width: "100%", height: "100%", display: "block" }}>
                      <img
                        className="r01-menu-img"
                        src={img}
                        alt={name}
                        style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", transition: "transform 0.7s cubic-bezier(.22,1,.36,1)" }}
                      />
                    </GenericEditableImage>
                    {/* Gold corner brackets — appear on hover */}
                    <span className="r01-menu-corner r01-menu-corner-tl" aria-hidden />
                    <span className="r01-menu-corner r01-menu-corner-br" aria-hidden />
                  </div>
                  {/* Text */}
                  <div style={{ padding: "24px 24px 28px" }}>
                    <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.16em", textTransform: "uppercase", color: AMBER, margin: "0 0 10px" }}>
                      <GenericEditableText sectionId={sectionId} field={`items.${i}.category`} value={category} tag="span" />
                    </p>
                    <h3 style={{ fontFamily: FONT, fontSize: 23, fontWeight: 400, color: CREAM, margin: "0 0 12px" }}>
                      <GenericEditableText sectionId={sectionId} field={`items.${i}.name`} value={name} tag="span" />
                    </h3>
                    <p style={{ fontSize: 13, fontWeight: 300, lineHeight: 1.7, color: MUTED, margin: "0 0 20px" }}>
                      <GenericEditableText sectionId={sectionId} field={`items.${i}.description`} value={desc} tag="span" />
                    </p>
                    <a href={resolve(cardHref)} className="r01-menu-link" style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: AMBER, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 8, transition: "gap 0.24s ease, opacity 0.2s" }}
                      onMouseEnter={e => (e.currentTarget.style.gap = "14px")}
                      onMouseLeave={e => (e.currentTarget.style.gap = "8px")}
                    >
                      <GenericEditableText sectionId={sectionId} field={`items.${i}.ctaText`} value={cardCta} tag="span" /> <span aria-hidden style={{ fontSize: 14 }}>→</span>
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Hlavní CTA */}
        <div style={{ textAlign: "center" }}>
          <a href={resolve(ctaHref)} data-btn="primary" style={{
            fontFamily: SANS, fontSize: 12, fontWeight: 600, letterSpacing: "0.1em",
            textTransform: "uppercase", color: CREAM, textDecoration: "none",
            padding: "15px 40px", border: `1px solid ${AMBER}`, borderRadius: 3,
            display: "inline-block", transition: "background-color 0.28s ease, color 0.28s ease, transform 0.28s ease",
          }}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = AMBER; e.currentTarget.style.color = DARK; e.currentTarget.style.transform = "translateY(-2px)"; }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = CREAM; e.currentTarget.style.transform = "translateY(0)"; }}
          >
            <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
          </a>
        </div>
      </div>

      <style>{`
        @media(max-width:900px){.r01-menu-grid{grid-template-columns:1fr!important}}
        [data-variant="restaurant-01-menu"] .r01-menu-card:hover{transform:translateY(-8px);border-color:rgba(200,148,63,0.5);box-shadow:0 18px 44px rgba(0,0,0,0.5)}
        [data-variant="restaurant-01-menu"] .r01-menu-card:hover .r01-menu-img{transform:scale(1.07)}
        [data-variant="restaurant-01-menu"] .r01-menu-corner{position:absolute;width:22px;height:22px;opacity:0;transition:opacity 0.34s ease,transform 0.34s ease;pointer-events:none}
        [data-variant="restaurant-01-menu"] .r01-menu-corner-tl{top:14px;left:14px;border-top:2px solid ${AMBER};border-left:2px solid ${AMBER};transform:translate(6px,6px)}
        [data-variant="restaurant-01-menu"] .r01-menu-corner-br{bottom:14px;right:14px;border-bottom:2px solid ${AMBER};border-right:2px solid ${AMBER};transform:translate(-6px,-6px)}
        [data-variant="restaurant-01-menu"] .r01-menu-card:hover .r01-menu-corner{opacity:1;transform:translate(0,0)}
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
  const taglineRaw = content.tagline;
  const titleRaw   = content.title;
  const tagline = taglineRaw === undefined ? "Naše nabídka" : String(taglineRaw);
  const title   = titleRaw   === undefined ? "Co u nás ochutnáte." : String(titleRaw);
  const body    = String(content.body    ?? "");
  const showHeader = !!(tagline.trim() || title.trim() || body.trim());
  const ctaText = String(content.ctaText ?? "Celý jídelní lístek");
  const ctaHref = String(content.ctaHref ?? "/menu");

  type Item = { name: string; category?: string; description?: string; image?: string; ctaText?: string; ctaHref?: string };
  const items = (content.items as Item[]) ?? [];

  const RED     = "#c0392b";
  const BLACK   = "#1a1a1a";
  const MUTED   = "#5f5f5f";
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
    <section ref={secRef} id={id} data-template="restaurant-02" style={{ backgroundColor: "#f7f7f5", padding: "clamp(72px, 9vw, 120px) 0", fontFamily: POPPINS }}>
      {/* Hlavička sekce */}
      {showHeader && (
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 clamp(20px, 5vw, 60px)", marginBottom: "clamp(40px, 5vw, 64px)", opacity: vis ? 1 : 0, transform: vis ? "translateY(0)" : "translateY(24px)", transition: "opacity 0.6s ease, transform 0.6s ease" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
            <span aria-hidden style={{ width: 36, height: 2, background: RED }} />
            <GenericEditableText sectionId={sectionId} field="tagline" value={tagline} tag="span"
              style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: RED }} />
          </div>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
            <div>
              <h2 style={{ fontSize: "clamp(28px, 3.2vw, 42px)", fontWeight: 700, lineHeight: 1.18, color: BLACK, margin: "0 0 12px" }}>
                <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
              </h2>
              {body && (
                <p style={{ fontSize: 15, lineHeight: 1.75, color: MUTED, maxWidth: 560, margin: 0 }}>
                  <GenericEditableText sectionId={sectionId} field="body" value={body} tag="span" />
                </p>
              )}
            </div>
            <a href={ctaHref} className="r02-menu-headcta" style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.13em", textTransform: "uppercase", color: RED, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 9, whiteSpace: "nowrap", flexShrink: 0 }}>
              <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
              <svg className="r02-menu-headarrow" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
            </a>
          </div>
        </div>
      )}

      {/* Karty */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 clamp(20px, 5vw, 60px)", display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24 }} className="r02-menu-grid">
        {items.map((item, i) => (
          <div
            key={i}
            className="r02-menu-card"
            style={{ backgroundColor: "#ffffff", overflow: "hidden", opacity: vis ? 1 : 0, transform: vis ? "translateY(0)" : "translateY(32px)", transition: `opacity 0.6s ease ${0.1 + i * 0.1}s, transform 0.6s ease ${0.1 + i * 0.1}s` }}
          >
            {item.image && (
              <div className="r02-menu-imgwrap" style={{ lineHeight: 0, overflow: "hidden", position: "relative" }}>
                <GenericEditableImage sectionId={sectionId} field={`items.${i}.image`} src={item.image} alt={item.name} style={{ display: "block", width: "100%" }}>
                  <img loading="lazy" src={item.image} alt={item.name} className="r02-menu-img" style={{ width: "100%", aspectRatio: "3/2", objectFit: "cover", display: "block" }} />
                </GenericEditableImage>
                <span className="r02-menu-imgveil" aria-hidden />
              </div>
            )}
            <div style={{ padding: "24px 26px 28px", position: "relative" }}>
              {/* červená akcentní linka nad obsahem */}
              <span aria-hidden className="r02-menu-accent" style={{ position: "absolute", top: 0, left: 26, width: 32, height: 3, background: RED }} />
              {item.category && (
                <p style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: RED, margin: "10px 0 8px" }}>
                  <GenericEditableText sectionId={sectionId} field={`items.${i}.category`} value={item.category} tag="span" />
                </p>
              )}
              <h3 style={{ fontSize: 19, fontWeight: 700, color: BLACK, margin: "0 0 10px", lineHeight: 1.3 }}>
                <GenericEditableText sectionId={sectionId} field={`items.${i}.name`} value={item.name} tag="span" />
              </h3>
              {item.description && (
                <p style={{ fontSize: 14, lineHeight: 1.72, color: MUTED, margin: "0 0 20px" }}>
                  <GenericEditableText sectionId={sectionId} field={`items.${i}.description`} value={item.description} tag="span" />
                </p>
              )}
              {item.ctaText && (
                <a
                  href={item.ctaHref ?? ctaHref}
                  className="r02-menu-cardcta"
                  style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.11em", textTransform: "uppercase", color: RED, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 7 }}
                >
                  <GenericEditableText sectionId={sectionId} field={`items.${i}.ctaText`} value={item.ctaText} tag="span" />
                  <svg className="r02-menu-cardarrow" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ── restaurant-03-menu ────────────────────────────────────────────────────────
// La Casa Dorada — luxe deep-green #0c351a + warm gold à-la-carte karty.
// Ornament header, karty se zlatou hairline + corner brackets reveal + image zoom
// + gold overlay, serif name, gold "Zjistit více" arrow link. Conditional header.
// ─────────────────────────────────────────────────────────────────────────────
function ServicesRestaurant03({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const BG      = "#0c351a";
  const CARD    = "#0a2d15";
  const GOLD    = "#b97d26";
  const GOLD_LT = "#d4a24c";
  const WHITE   = "#ffffff";
  const MUTED   = "rgba(255,255,255,0.68)";
  const SERIF   = "Georgia, 'Times New Roman', serif";
  const SANS    = "'Helvetica Neue', Helvetica, Arial, sans-serif";

  const id      = String(content.id      ?? "menu");
  const taglineRaw = content.tagline;
  const titleRaw   = content.title;
  const tagline = taglineRaw === undefined ? "Naše speciality" : String(taglineRaw);
  const title   = titleRaw   === undefined ? "Menu pro\nkaždou chuť." : String(titleRaw);
  const body    = String(content.body    ?? "");
  const showHeader = !!(tagline.trim() || title.trim() || body.trim());
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
    <section ref={secRef} id={id} data-template="restaurant-03" style={{ backgroundColor: BG, padding: "clamp(72px, 10vw, 120px) 0", fontFamily: SANS, position: "relative", overflow: "hidden" }}>
      {/* Header */}
      {showHeader && (
        <div style={{ maxWidth: 760, margin: "0 auto 60px", padding: "0 clamp(20px, 5vw, 60px)", textAlign: "center" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
            <span aria-hidden style={{ width: 34, height: 1, background: `linear-gradient(to right, ${GOLD}00, ${GOLD})` }} />
            <span aria-hidden style={{ width: 6, height: 6, background: GOLD, transform: "rotate(45deg)" }} />
            <GenericEditableText sectionId={sectionId} field="tagline" value={tagline} tag="span"
              style={{ fontSize: 11.5, fontWeight: 600, letterSpacing: "0.24em", textTransform: "uppercase", color: GOLD_LT }} />
            <span aria-hidden style={{ width: 6, height: 6, background: GOLD, transform: "rotate(45deg)" }} />
            <span aria-hidden style={{ width: 34, height: 1, background: `linear-gradient(to left, ${GOLD}00, ${GOLD})` }} />
          </div>
          <h2 style={{ fontSize: "clamp(28px, 3.6vw, 48px)", fontWeight: 400, fontFamily: SERIF, lineHeight: 1.16, color: WHITE, margin: "0 0 20px", whiteSpace: "pre-line" }}>
            <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
          </h2>
          {body && (
            <p style={{ fontSize: 15.5, lineHeight: 1.8, color: MUTED, maxWidth: 600, margin: "0 auto" }}>
              <GenericEditableText sectionId={sectionId} field="body" value={body} tag="span" />
            </p>
          )}
        </div>
      )}

      {/* Cards */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 clamp(20px, 5vw, 60px)", display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 30 }} className="r03-menu-grid">
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
                backgroundColor: CARD,
                border: "1px solid rgba(185,125,38,0.28)",
                borderRadius: 2, overflow: "hidden", position: "relative",
                opacity: vis ? 1 : 0,
                transform: vis ? "translateY(0)" : "translateY(36px)",
                transition: `opacity 0.6s ease ${0.1 + i * 0.12}s, transform 0.6s ease ${0.1 + i * 0.12}s, box-shadow 0.3s ease, border-color 0.3s ease`,
              }}
            >
              {img && (
                <div className="r03-menu-imgwrap" style={{ lineHeight: 0, overflow: "hidden", position: "relative" }}>
                  <GenericEditableImage sectionId={sectionId} field={`items.${i}.image`} src={img} alt={name} style={{ display: "block", width: "100%" }}>
                    <img loading="lazy" src={img} alt={name} className="r03-menu-img" style={{ width: "100%", aspectRatio: "3/2", objectFit: "cover", display: "block" }} />
                  </GenericEditableImage>
                  <span aria-hidden className="r03-menu-imgtint" style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(10,45,21,0.7), rgba(10,45,21,0) 55%)" }} />
                </div>
              )}
              <div style={{ padding: "26px 26px 30px" }}>
                {cat && (
                  <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: GOLD_LT, margin: "0 0 10px" }}>
                    <GenericEditableText sectionId={sectionId} field={`items.${i}.category`} value={cat} tag="span" />
                  </p>
                )}
                <h3 style={{ fontSize: 22, fontWeight: 400, fontFamily: SERIF, color: WHITE, margin: "0 0 12px", lineHeight: 1.25 }}>
                  <GenericEditableText sectionId={sectionId} field={`items.${i}.name`} value={name} tag="span" />
                </h3>
                {desc && (
                  <p style={{ fontSize: 14, lineHeight: 1.8, color: MUTED, margin: "0 0 22px" }}>
                    <GenericEditableText sectionId={sectionId} field={`items.${i}.description`} value={desc} tag="span" />
                  </p>
                )}
                {cta && (
                  <a
                    href={href}
                    className="r03-menu-link"
                    style={{ display: "inline-flex", alignItems: "center", gap: 9, fontSize: 11, fontWeight: 600, letterSpacing: "0.16em", textTransform: "uppercase", color: GOLD_LT, textDecoration: "none", paddingBottom: 4, borderBottom: `1px solid ${GOLD}`, transition: "color 0.25s, gap 0.25s" }}
                    onMouseEnter={e => { e.currentTarget.style.color = WHITE; e.currentTarget.style.gap = "14px"; }}
                    onMouseLeave={e => { e.currentTarget.style.color = GOLD_LT; e.currentTarget.style.gap = "9px"; }}
                  >
                    <GenericEditableText sectionId={sectionId} field={`items.${i}.ctaText`} value={cta} tag="span" />
                    <span aria-hidden>→</span>
                  </a>
                )}
              </div>
              {/* Gold corner brackets */}
              <span aria-hidden className="r03-menu-corner r03-menu-corner--tl" />
              <span aria-hidden className="r03-menu-corner r03-menu-corner--br" />
            </div>
          );
        })}
      </div>

      {/* Bottom CTA */}
      {ctaText && (
        <div style={{ textAlign: "center", marginTop: 58 }}>
          <a
            href={ctaHref}
            data-btn="primary"
            style={{ display: "inline-flex", alignItems: "center", gap: 10, fontSize: 12, fontWeight: 600, letterSpacing: "0.18em", textTransform: "uppercase", color: BG, textDecoration: "none", background: GOLD, borderRadius: 2, padding: "15px 44px", transition: "background 0.3s, transform 0.3s" }}
            onMouseEnter={e => { e.currentTarget.style.background = GOLD_LT; e.currentTarget.style.transform = "translateY(-2px)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = GOLD; e.currentTarget.style.transform = "translateY(0)"; }}
          >
            <span aria-hidden style={{ width: 6, height: 6, background: "currentColor", transform: "rotate(45deg)" }} />
            <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
          </a>
        </div>
      )}

      <style>{`
        @media(max-width:900px){ .r03-menu-grid { grid-template-columns: 1fr 1fr !important; } }
        @media(max-width:580px){ .r03-menu-grid { grid-template-columns: 1fr !important; } }
        [data-template="restaurant-03"] .r03-menu-card:hover { box-shadow: 0 20px 48px rgba(0,0,0,0.5); transform: translateY(-6px) !important; border-color: rgba(185,125,38,0.6) !important; }
        [data-template="restaurant-03"] .r03-menu-img { transition: transform 0.7s cubic-bezier(.2,.7,.2,1); }
        [data-template="restaurant-03"] .r03-menu-card:hover .r03-menu-img { transform: scale(1.07); }
        [data-template="restaurant-03"] .r03-menu-imgtint { transition: opacity 0.5s ease; opacity: 0.65; }
        [data-template="restaurant-03"] .r03-menu-card:hover .r03-menu-imgtint { opacity: 1; }
        [data-template="restaurant-03"] .r03-menu-corner { position: absolute; width: 16px; height: 16px; opacity: 0; transition: opacity 0.4s ease, transform 0.4s ease; pointer-events: none; }
        [data-template="restaurant-03"] .r03-menu-corner--tl { top: 12px; left: 12px; border-top: 1px solid ${GOLD_LT}; border-left: 1px solid ${GOLD_LT}; transform: translate(6px,6px); }
        [data-template="restaurant-03"] .r03-menu-corner--br { bottom: 12px; right: 12px; border-bottom: 1px solid ${GOLD_LT}; border-right: 1px solid ${GOLD_LT}; transform: translate(-6px,-6px); }
        [data-template="restaurant-03"] .r03-menu-card:hover .r03-menu-corner { opacity: 1; transform: translate(0,0); }
      `}</style>
    </section>
  );
}

// ── cafe-03-menu ───────────────────────────────────────────────────────────────
// Cathedral Menu — luxe editorial (2026-07-02)
// Parchment bg, editorial header (eyebrow + Great Vibes H2 + Cormorant kicker),
// gothic arch watermarks; tabs jako Cormorant italic pill row s gold underline
// slide-in + Cormorant italic 01/02/… number, aktivní má gold fill; item list
// s **dashed gold leader dots** (menu-style) mezi názvem a cenou, Cormorant italic
// popis, allergen tags micro-pills, closing signature Great Vibes.
// ─────────────────────────────────────────────────────────────────────────────
function ServicesCafe03({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const GOLD    = "#C69C60";
  const GOLD_LT = "#D8B57A";
  const GOLD_DK = "#8F6A38";
  const NOIR    = "#0d0d0d";
  const INK     = "#1a1a1a";
  const MUTED   = "#5a544a";
  const PARCH   = "#F5EFE4";
  const CREAM   = "#FBF7EF";
  const SCRIPT  = "'Great Vibes', cursive";
  const ITAL    = "'Cormorant Garamond', 'Playfair Display', Georgia, serif";
  const SANS    = "'Inter', 'Open Sans', system-ui, sans-serif";

  type Item = { name: string; description?: string; price: string; tags?: string[] };
  type Tab  = { label: string; number: string; subtitle?: string; items: Item[]; note?: string };

  const eyebrow = String(content.eyebrow ?? "GASTRONOMIE CATHEDRAL");
  const title   = String(content.title   ?? "Jídelní & nápojový lístek");
  const kicker  = String(content.kicker  ?? "sezónní menu · aktualizováno každý týden");
  const signature = String(content.signature ?? "Adam Hála");
  const signRole  = String(content.signRole  ?? "Šéfkuchař & sommelier");

  const defaultTabs: Tab[] = [
    { label: "Snídaně", number: "01", subtitle: "Podáváme každý den do 12:00", items: [
      { name: "Vejce Benedikt Cathedral", description: "krevety pošírované ve vodním chlazení, holandská omáčka, briošový chlebík", price: "289 Kč", tags: ["G"] },
      { name: "Healthy Bowl",              description: "řecký jogurt Doubleshot, granola, sezónní ovoce, med z Bílých Karpat", price: "219 Kč", tags: ["V"] },
      { name: "Avokádový toast",           description: "kváskový chleba, avokádo, sázené vejce, chilli olej",                   price: "239 Kč", tags: ["V"] },
      { name: "Croque Cathedral",          description: "šunka z Vysočiny, ementál, béchamel, křupavý plátek",                   price: "249 Kč" },
    ], note: "Snídaně 9:00 — 12:00 · víkendový brunch do 14:00" },
    { label: "Poledne", number: "02", subtitle: "Obědové menu 11:30 — 15:00", items: [
      { name: "Vývar z volně žijících kachen", description: "domácí nudle, kořenová zelenina, čerstvé bylinky",                    price: "129 Kč" },
      { name: "Konfitovaná telecí lička",       description: "bramborová kaše s pórkem, redukce z portského, mladá karotka",         price: "389 Kč" },
      { name: "Rizoto z carnaroli",             description: "hříbky, parmigiano reggiano 24m, bílý lanýž",                          price: "329 Kč", tags: ["V"] },
      { name: "Cathedral Burger",               description: "180g dry-aged hovězí, čedar, karamelizovaná cibule, briošová bulka",  price: "329 Kč" },
    ], note: "Denní polední menu za 189 Kč — polévka a hlavní jídlo dle nabídky dne" },
    { label: "Večerní", number: "03", subtitle: "Bistro menu 18:00 — 22:00", items: [
      { name: "Steak tartar z Charolais",  description: "žloutek, kapary, cornichons, čerstvé pečivo",             price: "349 Kč" },
      { name: "Rib-eye 300 g",             description: "grilované chřestíky, béarnaise, pečené brambory",         price: "689 Kč" },
      { name: "Losos sous vide",           description: "pyré z pastináku, blanšírovaná zelenina, citrusová emulze", price: "459 Kč" },
      { name: "Čokoládový fondant",        description: "vanilková zmrzlina, sůl z Fleur de sel, malinová redukce",  price: "179 Kč", tags: ["V"] },
    ] },
    { label: "Nápoje", number: "04", subtitle: "Káva · čaj · koktejly · signature", items: [
      { name: "Espresso Doubleshot",  description: "specialty blend Sao Silvestre & Sidamo",                        price: "69 Kč" },
      { name: "Cappuccino",           description: "180 ml, mikropěna, alternativní mléko za 15 Kč",                 price: "89 Kč" },
      { name: "Cold Brew Cathedral",  description: "24h loužení, syrupem z bezinek",                                price: "129 Kč" },
      { name: "Aperol Spritz",        description: "prosecco, aperol, soda, plátek pomeranče",                     price: "179 Kč" },
      { name: "Cathedral Sazerac",    description: "signature: koňak, absinth, cukr, bitters — house cocktail",   price: "229 Kč" },
    ] },
    { label: "Vinný sklep", number: "05", subtitle: "Moravská rukojmí + import z Burgundska", items: [
      { name: "Ryzlink rýnský · Sonberk 2022",    description: "Pavlov, Morava · minerální, hruška, med",                 price: "89 / 429 Kč" },
      { name: "Pinot Noir · Nešetřil 2021",       description: "Mikulov, Morava · třešně, kůže, kouř",                     price: "119 / 549 Kč" },
      { name: "Champagne · Pierre Gimonnet",     description: "Blanc de Blancs, Cuis Premier Cru · citrus, brioche",       price: "1 890 Kč (lahev)" },
      { name: "Chablis · Domaine Vocoret 2021",  description: "Burgundsko · křída, jablko, citron",                       price: "149 / 690 Kč" },
    ], note: "Kompletní vinný lístek s 42 pozicemi na vyžádání u obsluhy" },
  ];

  const rawTabs = (content.tabs as Tab[]) ?? [];
  const tabList = rawTabs.length > 0 ? rawTabs : defaultTabs;

  const [activeTab, setActiveTab] = useState(0);
  const active = tabList[Math.min(activeTab, tabList.length - 1)];

  return (
    <section data-template="cafe-03" className="c3sv" style={{ backgroundColor: PARCH, padding: "clamp(64px, 8vw, 112px) 0", fontFamily: SANS, position: "relative", overflow: "hidden" }}>
      {/* Watermarks */}
      <svg aria-hidden width="380" height="500" viewBox="0 0 380 500" style={{ position: "absolute", right: -100, top: 60, opacity: 0.05, pointerEvents: "none" }}>
        <path d="M40 480 V 180 A 150 150 0 0 1 340 180 V 480" stroke={INK} strokeWidth="1" fill="none" />
      </svg>
      <svg aria-hidden width="300" height="400" viewBox="0 0 300 400" style={{ position: "absolute", left: -80, bottom: 40, opacity: 0.04, pointerEvents: "none" }}>
        <path d="M30 380 V 140 A 120 120 0 0 1 270 140 V 380" stroke={INK} strokeWidth="1" fill="none" />
      </svg>

      <div style={{ maxWidth: 1080, margin: "0 auto", padding: "0 clamp(20px, 5vw, 60px)", position: "relative", zIndex: 1 }}>
        {/* Header */}
        <header style={{ textAlign: "center", marginBottom: "clamp(40px, 5vw, 64px)" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 14, marginBottom: 18 }}>
            <span aria-hidden style={{ display: "inline-block", width: 32, height: 1, backgroundColor: GOLD }} />
            <GenericEditableText sectionId={sectionId} field="eyebrow" value={eyebrow} tag="span">
              <span style={{ fontFamily: SANS, fontSize: 11, fontWeight: 500, letterSpacing: "0.36em", textTransform: "uppercase", color: GOLD_DK }}>{eyebrow}</span>
            </GenericEditableText>
            <span aria-hidden style={{ display: "inline-block", width: 32, height: 1, backgroundColor: GOLD }} />
          </div>
          <GenericEditableText sectionId={sectionId} field="title" value={title} tag="h2">
            <h2 style={{ fontFamily: SCRIPT, fontSize: "clamp(44px, 6vw, 76px)", fontWeight: 400, color: INK, margin: 0, lineHeight: 1.05 }}>{title}</h2>
          </GenericEditableText>
          <GenericEditableText sectionId={sectionId} field="kicker" value={kicker} tag="p">
            <p style={{ fontFamily: ITAL, fontStyle: "italic", fontSize: "clamp(15px, 1.4vw, 18px)", color: GOLD_DK, margin: "10px 0 0", letterSpacing: "0.02em" }}>— {kicker}</p>
          </GenericEditableText>
        </header>

        {/* Tab nav */}
        <nav className="c3sv-tabs" style={{ display: "flex", justifyContent: "center", flexWrap: "wrap", gap: "clamp(8px, 2vw, 24px)", marginBottom: "clamp(40px, 5vw, 56px)", paddingBottom: 0 }} role="tablist">
          {tabList.map((tab, i) => {
            const isActive = i === activeTab;
            return (
              <button
                key={i}
                onClick={() => setActiveTab(i)}
                role="tab"
                aria-selected={isActive}
                className="c3sv-tab"
                style={{ background: "none", border: "none", cursor: "pointer", padding: "12px 8px 14px", display: "inline-flex", alignItems: "baseline", gap: 10, position: "relative", transition: "color 0.25s ease" }}
              >
                <span style={{ fontFamily: ITAL, fontStyle: "italic", fontSize: 18, color: isActive ? GOLD : `${GOLD_DK}80`, letterSpacing: "0.02em", transition: "color 0.25s" }}>{tab.number}</span>
                <GenericEditableText sectionId={sectionId} field={`tabs.${i}.label`} value={tab.label} tag="span">
                  <span style={{ fontFamily: SANS, fontSize: "clamp(12px, 1.2vw, 14px)", fontWeight: 500, letterSpacing: "0.22em", textTransform: "uppercase", color: isActive ? INK : MUTED, transition: "color 0.25s" }}>{tab.label}</span>
                </GenericEditableText>
                <span aria-hidden style={{ position: "absolute", left: isActive ? 0 : "50%", right: isActive ? 0 : "50%", bottom: 0, height: 1, backgroundColor: GOLD, transition: "left 0.35s cubic-bezier(.4,0,.2,1), right 0.35s cubic-bezier(.4,0,.2,1)" }} />
              </button>
            );
          })}
        </nav>

        {/* Active tab content */}
        {active && (
          <div key={activeTab} className="c3sv-panel">
            {active.subtitle && (
              <GenericEditableText sectionId={sectionId} field={`tabs.${activeTab}.subtitle`} value={active.subtitle} tag="p">
                <p style={{ fontFamily: ITAL, fontStyle: "italic", fontSize: "clamp(16px, 1.4vw, 20px)", color: GOLD_DK, margin: "0 0 32px", textAlign: "center", letterSpacing: "0.02em" }}>— {active.subtitle} —</p>
              </GenericEditableText>
            )}

            <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 22 }}>
              {active.items.map((item, j) => (
                <li key={j} className="c3sv-item" style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "baseline", flexWrap: "wrap", gap: 10 }}>
                      <GenericEditableText sectionId={sectionId} field={`tabs.${activeTab}.items.${j}.name`} value={item.name} tag="strong">
                        <strong style={{ fontFamily: ITAL, fontStyle: "italic", fontSize: "clamp(18px, 1.7vw, 22px)", fontWeight: 500, color: INK, letterSpacing: "0.01em" }}>{item.name}</strong>
                      </GenericEditableText>
                      {item.tags && item.tags.length > 0 && (
                        <span style={{ display: "inline-flex", gap: 6 }}>
                          {item.tags.map((t, k) => (
                            <span key={k} style={{ fontFamily: SANS, fontSize: 9, fontWeight: 600, letterSpacing: "0.18em", textTransform: "uppercase", color: GOLD_DK, border: `1px solid ${GOLD}66`, padding: "2px 6px" }}>{t}</span>
                          ))}
                        </span>
                      )}
                    </div>
                    {item.description && (
                      <GenericEditableText sectionId={sectionId} field={`tabs.${activeTab}.items.${j}.description`} value={item.description} tag="p">
                        <p style={{ fontFamily: SANS, fontSize: "clamp(13px, 1vw, 14px)", fontWeight: 400, color: MUTED, margin: "4px 0 0", lineHeight: 1.6 }}>{item.description}</p>
                      </GenericEditableText>
                    )}
                  </div>
                  <span aria-hidden className="c3sv-leader" style={{ flex: "0 1 auto", minWidth: 40, alignSelf: "flex-end", marginBottom: 8, borderBottom: `1px dashed ${GOLD}66` }} />
                  <GenericEditableText sectionId={sectionId} field={`tabs.${activeTab}.items.${j}.price`} value={item.price} tag="span">
                    <span style={{ fontFamily: ITAL, fontStyle: "italic", fontSize: "clamp(18px, 1.6vw, 22px)", fontWeight: 500, color: GOLD_DK, whiteSpace: "nowrap", letterSpacing: "0.01em" }}>{item.price}</span>
                  </GenericEditableText>
                </li>
              ))}
            </ul>

            {active.note && (
              <GenericEditableText sectionId={sectionId} field={`tabs.${activeTab}.note`} value={active.note} tag="p">
                <p style={{ fontFamily: ITAL, fontStyle: "italic", fontSize: 14, color: MUTED, margin: "32px 0 0", textAlign: "center", opacity: 0.85 }}>{active.note}</p>
              </GenericEditableText>
            )}
          </div>
        )}

        {/* Signature */}
        <div style={{ marginTop: "clamp(48px, 6vw, 72px)", paddingTop: 32, borderTop: `1px solid ${GOLD}55`, display: "flex", justifyContent: "center", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
          <GenericEditableText sectionId={sectionId} field="signature" value={signature} tag="span">
            <span style={{ fontFamily: SCRIPT, fontSize: 34, color: INK, lineHeight: 1 }}>{signature}</span>
          </GenericEditableText>
          <span aria-hidden style={{ display: "inline-block", width: 40, height: 1, backgroundColor: GOLD }} />
          <GenericEditableText sectionId={sectionId} field="signRole" value={signRole} tag="span">
            <span style={{ fontFamily: SANS, fontSize: 11, letterSpacing: "0.24em", textTransform: "uppercase", color: MUTED }}>{signRole}</span>
          </GenericEditableText>
        </div>
      </div>

      <style>{`
        [data-template="cafe-03"].c3sv .c3sv-panel { animation: c3svFade 0.4s cubic-bezier(.4,0,.2,1); }
        @keyframes c3svFade { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }
        [data-template="cafe-03"].c3sv .c3sv-tab:hover span { color: ${INK} !important; }
        [data-template="cafe-03"].c3sv .c3sv-tab:hover > span:first-child { color: ${GOLD} !important; }
        [data-template="cafe-03"].c3sv .c3sv-tab:hover > span:last-child { left: 0 !important; right: 0 !important; }
      `}</style>
    </section>
  );
}

// ── bakery-01-promo-2col ──────────────────────────────────────────────────────
// Section heading + 2-col promo cards (image, heading, text, CTA link)
// ─────────────────────────────────────────────────────────────────────────────
function ServicesBakery01({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const DARK   = "#393939";
  const MUTED  = "#666666";
  const BG     = "#f7f2ec";
  const ACCENT = "#8b6030";
  const SERIF  = "'Josefin Sans', 'Helvetica Neue', sans-serif";
  const SANS   = "'Metropolis', 'Inter', sans-serif";

  type Item = { image?: string; heading?: string; text?: string; cta?: string; ctaHref?: string; badge?: string };

  // conditional header
  const eyebrowRaw  = (content as Record<string, unknown>).eyebrow;
  const headingRaw  = (content as Record<string, unknown>).heading;
  const subtitleRaw = (content as Record<string, unknown>).subtitle;
  const eyebrow  = eyebrowRaw  === undefined ? "Ochutnejte víc" : String(eyebrowRaw);
  const heading  = headingRaw  === undefined ? "U nás se vždy něco děje" : String(headingRaw);
  const subtitle = subtitleRaw === undefined ? "Víkendové brunche, sezónní speciály a akce, na které se těší celá čtvrť." : String(subtitleRaw);
  const showHeader = !!(eyebrow.trim() || heading.trim() || subtitle.trim());

  const fallback: Item[] = [
    { image: "/templates/bakery-01/promo-brunch.webp", badge: "Každou sobotu & neděli", heading: "Víkendový brunch", text: "Prostřený stůl plný čerstvého pečiva, domácích marmelád, vajec z farmy a šálku výběrové kávy. Rezervaci doporučujeme.", cta: "Rezervovat stůl", ctaHref: "/kontakt" },
    { image: "/templates/bakery-01/promo-akce.webp", badge: "Sezónní nabídka", heading: "Dorty & oslavy", text: "Upečeme dort na míru vaší oslavě — narozeniny, svatby i firemní akce. Stačí se ozvat pár dní předem.", cta: "Objednat dort", ctaHref: "/kontakt" },
  ];
  const items: Item[]  = Array.isArray(content.items) && (content.items as Item[]).length ? (content.items as Item[]) : fallback;

  return (
    <section data-template="bakery-01" style={{ backgroundColor: BG, fontFamily: SANS, padding: "clamp(64px, 9vw, 112px) 0" }}>
      <div style={{ maxWidth: 1160, margin: "0 auto", padding: "0 clamp(24px, 5vw, 60px)" }}>

        {/* Section heading */}
        {showHeader && (
          <div style={{ textAlign: "center", margin: "0 auto clamp(44px, 6vw, 68px)", maxWidth: 640 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
              <span style={{ display: "block", width: 30, height: 1, background: "#dcae7a" }} />
              <GenericEditableText sectionId={sectionId} field="eyebrow" value={eyebrow} tag="span"
                style={{ fontFamily: SERIF, fontSize: "0.78rem", fontWeight: 400, letterSpacing: "0.24em", textTransform: "uppercase", color: ACCENT }} />
              <span style={{ display: "block", width: 30, height: 1, background: "#dcae7a" }} />
            </div>
            <h2 style={{ fontFamily: SERIF, fontWeight: 300, fontSize: "clamp(1.6rem, 3.4vw, 2.6rem)", letterSpacing: "0.1em", textTransform: "uppercase", color: DARK, margin: "0 0 16px", lineHeight: 1.18 }}>
              <GenericEditableText sectionId={sectionId} field="heading" value={heading} tag="span" />
            </h2>
            <p style={{ fontSize: "clamp(0.95rem, 1.3vw, 1.05rem)", lineHeight: 1.8, color: MUTED, margin: 0 }}>
              <GenericEditableText sectionId={sectionId} field="subtitle" value={subtitle} tag="span" />
            </p>
          </div>
        )}

        {/* 2-col cards */}
        <div className="b01-promo-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "clamp(24px, 4vw, 44px)" }}>
          {items.map((item, i) => {
            const img     = item.image   ?? "";
            const title   = item.heading ?? "";
            const text    = item.text    ?? "";
            const cta     = item.cta     ?? "";
            const ctaHref = item.ctaHref ?? "#";
            const badge   = item.badge   ?? "";
            return (
              <div key={i} className="b01-promo-card" style={{ backgroundColor: "#ffffff", display: "flex", flexDirection: "column", border: "1px solid #ece5db", transition: "transform 0.45s cubic-bezier(.2,.7,.2,1), box-shadow 0.45s ease" }}>
                <div className="b01-promo-imgwrap" style={{ position: "relative", overflow: "hidden" }}>
                  <GenericEditableImage sectionId={sectionId} field={`items.${i}.image`} src={img} alt={title} style={{ display: "block" }}>
                    <img className="b01-promo-img" src={img} alt={title} loading="lazy" style={{ width: "100%", aspectRatio: "4/3", objectFit: "cover", display: "block" }} />
                  </GenericEditableImage>
                  {badge && (
                    <span style={{ position: "absolute", top: 18, left: 18, fontFamily: SERIF, fontSize: 10.5, fontWeight: 500, letterSpacing: "0.16em", textTransform: "uppercase", color: "#2a1f16", background: "rgba(243,234,217,0.94)", padding: "7px 14px" }}>
                      <GenericEditableText sectionId={sectionId} field={`items.${i}.badge`} value={badge} tag="span" />
                    </span>
                  )}
                </div>
                <div style={{ padding: "clamp(26px, 3vw, 40px)", display: "flex", flexDirection: "column", gap: 14, flex: 1 }}>
                  <h3 style={{ fontFamily: SERIF, fontWeight: 300, fontSize: "clamp(1.15rem, 2vw, 1.5rem)", letterSpacing: "0.09em", textTransform: "uppercase", color: DARK, margin: 0 }}>
                    <GenericEditableText sectionId={sectionId} field={`items.${i}.heading`} value={title} tag="span" />
                  </h3>
                  <p style={{ fontSize: "clamp(0.9rem, 1.1vw, 0.98rem)", lineHeight: 1.8, color: MUTED, margin: 0, flex: 1 }}>
                    <GenericEditableText sectionId={sectionId} field={`items.${i}.text`} value={text} tag="span" />
                  </p>
                  {cta && (
                    <a className="b01-about-cta" href={ctaHref} style={{ display: "inline-flex", alignItems: "center", gap: 10, fontFamily: SERIF, fontSize: 12, fontWeight: 500, letterSpacing: "0.16em", textTransform: "uppercase", color: DARK, textDecoration: "none", alignSelf: "flex-start", marginTop: 6 }}>
                      <GenericEditableText sectionId={sectionId} field={`items.${i}.cta`} value={cta} tag="span" />
                      <svg className="b01-about-arrow" width="20" height="10" viewBox="0 0 20 10" fill="none" stroke={ACCENT} strokeWidth="1.4" aria-hidden="true"><path d="M0 5h18M14 1l4 4-4 4" strokeLinecap="round" strokeLinejoin="round"/></svg>
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
// Editorial menu list — coffee-gold hairlines, sekce (groups) volitelně,
// dotted leader mezi item name a cenou, hover row lift
// ─────────────────────────────────────────────────────────────────────────────
function ServicesCafe04({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  type Item = { name: string; price: string; description?: string };
  type Group = { title?: string; items: Item[] };
  const eyebrow  = String(content.eyebrow  ?? "Menu");
  const heading  = String(content.heading  ?? "Naše menu");
  const tagline  = String(content.tagline  ?? "Chuťovky, snídaně a specialty káva — od espressa přes cold brew po sourdough s vejcem.");

  // Support both legacy flat items[] and new groups[]
  const groupsRaw = (content.groups as Group[] | undefined);
  const legacyItems = (content.items as Item[] | undefined) ?? [];
  const groups: Group[] = groupsRaw && groupsRaw.length
    ? groupsRaw
    : (legacyItems.length ? [{ title: "", items: legacyItems }] : []);

  const hideHeader = !heading && !eyebrow && !tagline;

  return (
    <section className="cr04-menu" data-template="cafe-04">
      {!hideHeader && (
        <div className="cr04-menu-header">
          <span className="cr04-menu-eyebrow">
            <span className="cr04-menu-eyebrow-rule" aria-hidden />
            <GenericEditableText sectionId={sectionId} field="eyebrow" value={eyebrow} tag="span" />
          </span>
          <h2 className="cr04-menu-title">
            <GenericEditableText sectionId={sectionId} field="heading" value={heading} tag="span" />
          </h2>
          <p className="cr04-menu-tagline">
            <GenericEditableText sectionId={sectionId} field="tagline" value={tagline} tag="span" />
          </p>
        </div>
      )}

      <div className="cr04-menu-groups">
        {groups.map((group, gi) => (
          <div key={gi} className="cr04-menu-group">
            {group.title && (
              <h3 className="cr04-menu-group-title">
                <GenericEditableText sectionId={sectionId} field={groupsRaw ? `groups.${gi}.title` : "groupTitle"} value={group.title} tag="span" />
              </h3>
            )}
            <div className="cr04-menu-list">
              {group.items.map((item, i) => {
                const field = groupsRaw ? `groups.${gi}.items.${i}` : `items.${i}`;
                return (
                  <div key={i} className="cr04-menu-item">
                    <div className="cr04-menu-item-body">
                      <p className="cr04-menu-name">
                        <GenericEditableText sectionId={sectionId} field={`${field}.name`} value={item.name} tag="span" />
                      </p>
                      {item.description && (
                        <p className="cr04-menu-desc">
                          <GenericEditableText sectionId={sectionId} field={`${field}.description`} value={item.description} tag="span" />
                        </p>
                      )}
                    </div>
                    <span className="cr04-menu-dots" aria-hidden />
                    <span className="cr04-menu-price">
                      <GenericEditableText sectionId={sectionId} field={`${field}.price`} value={item.price} tag="span" />
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ── reality-02-agents ─────────────────────────────────────────────────────────
function ServicesReality02Agents({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const eyebrowRaw  = (content as Record<string,unknown>).eyebrow;
  const titleRaw    = (content as Record<string,unknown>).title;
  const subtitleRaw = (content as Record<string,unknown>).subtitle;
  const eyebrow  = eyebrowRaw  === undefined ? "Naši odborníci" : String(eyebrowRaw);
  const title    = titleRaw    === undefined ? "Koho vám vlastně doporučujeme?" : String(titleRaw);
  const subtitle = subtitleRaw === undefined ? "" : String(subtitleRaw);
  const showHeader = !!(eyebrow.trim() || title.trim() || subtitle.trim());
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

  const GREEN = "#3DCE78";
  const BODY  = "'Open Sans', 'Helvetica Neue', Arial, sans-serif";

  return (
    <section id="makleri" data-template="reality-02" style={{ backgroundColor: "#f4f8f7", fontFamily: FONT, padding: "clamp(56px,8vw,100px) clamp(16px,5vw,48px)" }}>
      <div style={{ maxWidth: 800, margin: "0 auto" }}>

        {showHeader && (
          <div style={{ textAlign: "center", marginBottom: "clamp(36px,5vw,56px)" }}>
            {eyebrow.trim() && <GenericEditableText sectionId={sectionId} field="eyebrow" value={eyebrow} tag="p" style={{ fontSize: 12, fontWeight: 600, color: GREEN, letterSpacing: "0.14em", textTransform: "uppercase", margin: "0 0 12px" }} />}
            {title.trim() && (
              <h2 style={{ fontSize: "clamp(24px,3vw,38px)", fontWeight: 700, color: DARK, margin: 0, letterSpacing: "-0.01em" }}>
                <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
              </h2>
            )}
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {criteria.map((item, i) => {
            const cfg = ICON_CONFIGS[item.icon] ?? ICON_CONFIGS.safekeeping;
            return (
              <div key={`r02-agent-${i}`} className="r02a-row" style={{ display: "flex", alignItems: "center", gap: 20, padding: "18px 28px", backgroundColor: "#ffffff", borderRadius: 14, border: "1px solid rgba(5,48,58,0.06)", textAlign: "left" }}>
                <div className="r02a-circle" style={{ width: 52, height: 52, borderRadius: "50%", backgroundColor: cfg.bg, border: `1.5px solid ${cfg.border}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <AgentIcon type={item.icon} />
                </div>
                <p style={{ fontFamily: BODY, fontSize: 15, fontWeight: 500, color: DARK, lineHeight: 1.6, margin: 0, opacity: 0.85 }}>
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
function ServicesReality03Grid({ content, sectionId, tenantSlug, isAdmin }: { content: Record<string, unknown>; sectionId: number; tenantSlug?: string; isAdmin?: boolean }) {
  const eyebrowRaw = (content as Record<string, unknown>).eyebrow;
  const titleRaw   = (content as Record<string, unknown>).title;
  const eyebrow = eyebrowRaw === undefined ? "Co pro vás děláme" : String(eyebrowRaw);
  const title   = titleRaw   === undefined ? "Jak vám pomůžeme" : String(titleRaw);
  const showHeader = !!(eyebrow.trim() || title.trim());
  const items = (content.items as Array<{ title: string; body: string; ctaText?: string; ctaHref?: string }>) ?? [];
  const siteMode = String(content.siteMode ?? "multipage");
  const resolve  = (href: string) => resolveNavHref(href, siteMode, tenantSlug, isAdmin ?? false);

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
    <section ref={sectionRef} id="sluzby" data-template="reality-03" style={{ backgroundColor: "#f7f5f2", fontFamily: SANS, padding: "clamp(64px, 9vw, 110px) clamp(20px, 4vw, 64px)", overflow: "hidden" }}>
      <div style={{ maxWidth: 1240, margin: "0 auto" }}>

        {/* Heading */}
        {showHeader && (
        <div style={{
          textAlign: "center", marginBottom: "clamp(40px, 6vw, 72px)",
          opacity: visible ? 1 : 0, transform: visible ? "none" : "translateY(30px)",
          transition: "opacity 0.7s ease, transform 0.7s ease",
        }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: OCHRE, letterSpacing: "4px", textTransform: "uppercase", margin: "0 0 14px" }}>
            <GenericEditableText sectionId={sectionId} field="eyebrow" value={eyebrow} tag="span" />
          </p>
          <h2 style={{ fontSize: "clamp(1.8rem, 3.2vw, 2.6rem)", fontWeight: 700, color: DARK, margin: 0, letterSpacing: "-0.03em" }}>
            <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
          </h2>
        </div>
        )}

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
                    href={resolve(item.ctaHref)}
                    data-btn="primary"
                    style={{
                      display: "inline-flex", alignItems: "center", gap: 8,
                      fontSize: 12, fontWeight: 700, color: OCHRE,
                      textDecoration: "none", letterSpacing: "0.1em", textTransform: "uppercase",
                    }}
                    className="r03-svc-cta"
                  >
                    <GenericEditableText sectionId={sectionId} field={`items.${i}.ctaText`} value={item.ctaText} tag="span" />
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
function ServicesReality01Listings({ content, sectionId, tenantSlug, isAdmin }: { content: Record<string, unknown>; sectionId: number; tenantSlug?: string; isAdmin?: boolean }) {
  const eyebrowRaw  = (content as Record<string,unknown>).tagline;
  const titleRaw    = (content as Record<string,unknown>).title;
  const subtitleRaw = (content as Record<string,unknown>).subtitle;
  const tagline  = eyebrowRaw  === undefined ? "Aktuální nabídka" : String(eyebrowRaw);
  const title    = titleRaw    === undefined ? "Nemovitosti, které stojí za váš čas" : String(titleRaw);
  const subtitle = subtitleRaw === undefined ? "Každý inzerát prochází naší rukou — pečlivě prověřený, reálně oceněný a připravený k jednání." : String(subtitleRaw);
  const showHeader = !!(tagline.trim() || title.trim() || subtitle.trim());

  const ctaText  = String(content.ctaText  ?? "Celá nabídka nemovitostí");
  const ctaHref  = String(content.ctaHref  ?? "/vypis-nemovitosti");
  const tabAllLabel  = String((content as Record<string,unknown>).tabAllLabel  ?? "Vše");
  const tabSaleLabel = String((content as Record<string,unknown>).tabSaleLabel ?? "Prodej");
  const tabRentLabel = String((content as Record<string,unknown>).tabRentLabel ?? "Pronájem");
  const detailLabel  = String((content as Record<string,unknown>).detailLabel  ?? "Zobrazit detail");

  type Item = { name: string; description: string; price: string; tag: string; image: string; href: string };
  const items = (content.items as Item[]) ?? [
    { name: "Rezidence Na Výšinách — Praha 6", description: "3+kk, 98 m², panoramatické výhledy, terasa, garáž v suterénu.", price: "14 900 000 Kč", tag: "Prodej", image: "/templates/reality-01/listing-1.webp", href: "/detail-nemovitosti" },
    { name: "Vila se zahradou — Praha západ",  description: "5+1, 220 m², pozemek 650 m², bazén, klidná lokalita u lesa.", price: "18 500 000 Kč", tag: "Prodej", image: "/templates/reality-01/listing-2.webp", href: "/detail-nemovitosti" },
    { name: "Loftový byt — Praha 7, Holešovice", description: "2+kk, 65 m², industriální styl, dřevěné trámy, metro 3 min.", price: "42 000 Kč/měs", tag: "Pronájem", image: "/templates/reality-01/listing-3.webp", href: "/detail-nemovitosti" },
  ];

  const DARK       = "#1a3640";
  const GOLD       = "#d4a96e";
  const WHITE      = "#ffffff";
  const SURFACE    = "#f4ebe5";
  const TEXT       = "#141414";
  const MUTED      = "#6b7280";
  const FONT       = "'Montserrat', 'Helvetica Neue', Arial, sans-serif";
  const BODY       = "'Open Sans', 'Helvetica Neue', Arial, sans-serif";

  const resolve = (href: string) => resolveDemoHref(href, tenantSlug, isAdmin ?? false);

  const [activeTab, setActiveTab] = useState<"all" | "sale" | "rent">("all");

  const filtered = activeTab === "all" ? items
    : activeTab === "sale"  ? items.filter(i => i.tag === "Prodej")
    : items.filter(i => i.tag === "Pronájem");

  return (
    <section data-template="reality-01" id="listings" style={{ backgroundColor: WHITE, padding: "clamp(64px,9vw,110px) 0" }}>
      <div style={{ maxWidth: 1340, margin: "0 auto", padding: "0 clamp(20px,4vw,56px)" }}>

        {/* Header — conditional */}
        {showHeader && (
          <div style={{ textAlign: "center", marginBottom: 44 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, marginBottom: 16 }}>
              <span style={{ width: 24, height: 1, backgroundColor: GOLD, opacity: 0.45 }} aria-hidden="true" />
              <GenericEditableText sectionId={sectionId} field="tagline" value={tagline} tag="p"
                style={{ fontFamily: FONT, fontSize: 11, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: GOLD, margin: 0 }} />
              <span style={{ width: 24, height: 1, backgroundColor: GOLD, opacity: 0.45 }} aria-hidden="true" />
            </div>
            <GenericEditableText sectionId={sectionId} field="title" value={title} tag="h2"
              style={{ fontFamily: FONT, fontSize: "clamp(26px,3.5vw,42px)", fontWeight: 700, lineHeight: 1.12, color: TEXT, margin: "0 0 14px", whiteSpace: "pre-line", letterSpacing: "-0.01em" }} />
            <GenericEditableText sectionId={sectionId} field="subtitle" value={subtitle} tag="p"
              style={{ fontFamily: BODY, fontSize: 16, color: MUTED, margin: "0 auto", maxWidth: 560, lineHeight: 1.65 }} />
          </div>
        )}

        {/* Tabs */}
        <div style={{ display: "flex", justifyContent: "center", gap: 0, marginBottom: 48, borderBottom: "1px solid #e8e8e8" }}>
          {([["all", tabAllLabel], ["sale", tabSaleLabel], ["rent", tabRentLabel]] as [string, string][]).map(([key, label]) => (
            <button key={key} onClick={() => setActiveTab(key as "all"|"sale"|"rent")} className="r01-listing-tab" style={{
              padding: "12px 28px", background: "none", border: "none", cursor: "pointer",
              fontFamily: FONT, fontSize: 13, fontWeight: activeTab === key ? 700 : 500,
              color: activeTab === key ? DARK : MUTED,
              borderBottom: activeTab === key ? `2.5px solid ${GOLD}` : "2.5px solid transparent",
              marginBottom: -1, transition: "color 0.2s, border-color 0.2s", letterSpacing: "0.03em",
            }}>
              {label}
            </button>
          ))}
        </div>

        {/* Property grid */}
        <div className="r01-listings-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 28 }}>
          {filtered.map((item, i) => (
            <a key={i} href={resolve(item.href)} className="r01-listing-card" style={{
              textDecoration: "none", color: "inherit", display: "flex", flexDirection: "column",
              borderRadius: 10, overflow: "hidden", backgroundColor: WHITE,
              border: "1px solid #f0ece8",
              transition: "box-shadow 0.3s cubic-bezier(0.4,0,0.2,1), transform 0.3s cubic-bezier(0.4,0,0.2,1)",
            }}>
              {/* Image */}
              <div style={{ position: "relative", paddingTop: "66%", backgroundColor: SURFACE, overflow: "hidden" }}>
                <GenericEditableImage sectionId={sectionId} field={`items.${i}.image`} src={item.image} alt={item.name} style={{ position: "absolute", inset: 0 }}>
                  <img loading="lazy" src={item.image} alt={item.name} className="r01-listing-img" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.5s cubic-bezier(0.4,0,0.2,1)" }} />
                </GenericEditableImage>
                {/* Badge */}
                <span style={{
                  position: "absolute", top: 14, left: 14,
                  backgroundColor: item.tag === "Pronájem" ? DARK : GOLD,
                  color: item.tag === "Pronájem" ? WHITE : DARK,
                  fontFamily: FONT, fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase",
                  padding: "5px 12px", borderRadius: 3,
                }}>
                  <GenericEditableText sectionId={sectionId} field={`items.${i}.tag`} value={item.tag} tag="span" />
                </span>
              </div>
              {/* Content */}
              <div style={{ padding: "22px 24px 24px", display: "flex", flexDirection: "column", flex: 1 }}>
                <GenericEditableText sectionId={sectionId} field={`items.${i}.name`} value={item.name} tag="h3"
                  style={{ fontFamily: FONT, fontSize: 16, fontWeight: 700, color: TEXT, margin: "0 0 8px", lineHeight: 1.35 }} />
                <GenericEditableText sectionId={sectionId} field={`items.${i}.description`} value={item.description} tag="p"
                  style={{ fontFamily: BODY, fontSize: 14, color: MUTED, margin: "0 0 18px", lineHeight: 1.6, flex: 1 }} />
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: "1px solid #f0ece8", paddingTop: 16 }}>
                  <GenericEditableText sectionId={sectionId} field={`items.${i}.price`} value={item.price} tag="span"
                    style={{ fontFamily: FONT, fontSize: 18, fontWeight: 700, color: DARK }} />
                  <span className="r01-listing-detail" style={{ fontFamily: FONT, fontSize: 12, fontWeight: 600, color: GOLD, display: "flex", alignItems: "center", gap: 5, transition: "gap 0.2s" }}>
                    <GenericEditableText sectionId={sectionId} field="detailLabel" value={detailLabel} tag="span" />
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </span>
                </div>
              </div>
            </a>
          ))}
        </div>

        {/* CTA */}
        <div style={{ textAlign: "center", marginTop: 56 }}>
          <a href={resolve(ctaHref)} className="r01-listings-cta" style={{
            display: "inline-flex", alignItems: "center", gap: 10,
            border: `1.5px solid ${DARK}`, color: DARK, backgroundColor: WHITE,
            fontFamily: FONT, fontSize: 13, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase",
            padding: "14px 38px", borderRadius: 4, textDecoration: "none",
            transition: "background 0.25s, color 0.25s, transform 0.25s",
          }}>
            <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </a>
        </div>
      </div>

      <style>{`
        @media (max-width: 1023px) { .r01-listings-grid { grid-template-columns: repeat(2, 1fr) !important; } }
        @media (max-width: 639px)  { .r01-listings-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </section>
  );
}

// ── reality-01-listing-detail ─────────────────────────────────────────────────
function ListingDetailReality01({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const DARK = "#1a3640";
  const GOLD = "#d4a96e";
  const SURFACE = "#f4ebe5";
  const FONT = "'Montserrat', 'Helvetica Neue', Arial, sans-serif";
  const BODY = "'Open Sans', 'Helvetica Neue', Arial, sans-serif";

  const title       = String(content.title       ?? "Rezidence Na Výšinách — byt 3+kk");
  const price       = String(content.price       ?? "11 200 000 Kč");
  const tag         = String(content.tag         ?? "Prodej");
  const address     = String(content.address     ?? "Na Výšinách 12, Praha 6 — Dejvice");
  const area        = String(content.area        ?? "88 m²");
  const rooms       = String(content.rooms       ?? "3+kk");
  const floor       = String(content.floor       ?? "3. / 5. NP");
  const ownership   = String(content.ownership   ?? "Osobní");
  const condition   = String(content.condition   ?? "Po rekonstrukci");
  const energy      = String(content.energy      ?? "B");
  const parking     = String(content.parking     ?? "Garážové stání");
  const description = String(content.description ?? "Nabízíme k prodeji prostorný cihlový byt 3+kk s terasou a výhledem na Prahu. Byt prošel kompletní rekonstrukcí v roce 2023 — nové rozvody, podlahové topení, dubové podlahy, designová koupelna s walk-in sprchou. Kuchyňská linka na míru je součástí prodeje.\n\nDispozice: vstupní chodba, obývací pokoj s kuchyňským koutem (35 m²), ložnice (16 m²), dětský pokoj (12 m²), koupelna, samostatné WC, šatna, terasa (8 m²). K bytu náleží sklep a garážové stání.");
  const mainImage   = String(content.mainImage   ?? "/templates/reality-01/detail-1.webp");
  const image2      = String(content.image2      ?? "/templates/reality-01/detail-2.webp");
  const image3      = String(content.image3      ?? "/templates/reality-01/detail-3.webp");
  const image4      = String(content.image4      ?? "/templates/reality-01/detail-4.webp");
  const agentName   = String(content.agentName   ?? "Mgr. Petr Kovář");
  const agentRole   = String(content.agentRole   ?? "Senior makléř");
  const agentPhone  = String(content.agentPhone  ?? "777 234 567");
  const agentEmail  = String(content.agentEmail  ?? "kovar@domus-reality.cz");

  type Spec = { label: string; value: string };
  const specs: Spec[] = [
    { label: "Plocha", value: area },
    { label: "Dispozice", value: rooms },
    { label: "Patro", value: floor },
    { label: "Vlastnictví", value: ownership },
    { label: "Stav", value: condition },
    { label: "Energetická třída", value: energy },
    { label: "Parkování", value: parking },
  ];

  return (
    <section data-template="reality-01" style={{ backgroundColor: "#fff", padding: "clamp(32px,5vw,64px) 0 clamp(56px,8vw,96px)", fontFamily: FONT }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 clamp(20px,4vw,56px)" }}>

        {/* Breadcrumb */}
        <div style={{ fontSize: 12, color: "#9ca3af", marginBottom: 24, fontFamily: BODY }}>
          <span>Nabídka</span>
          <span style={{ margin: "0 8px" }}>›</span>
          <GenericEditableText sectionId={sectionId} field="tag" value={tag} tag="span" style={{ color: GOLD }} />
        </div>

        {/* Image gallery — 2×2 bento grid */}
        <div className="r01-detail-gallery" style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gridTemplateRows: "260px 260px", gap: 8, borderRadius: 12, overflow: "hidden", marginBottom: 40 }}>
          <div style={{ gridRow: "1 / 3", overflow: "hidden" }}>
            <img src={mainImage} alt={title} loading="eager" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
          </div>
          <div style={{ overflow: "hidden" }}>
            <img src={image2} alt="" loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            <div style={{ overflow: "hidden" }}>
              <img src={image3} alt="" loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
            </div>
            <div style={{ overflow: "hidden" }}>
              <img src={image4} alt="" loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
            </div>
          </div>
        </div>

        {/* Content: 2/3 info + 1/3 sidebar */}
        <div className="r01-detail-content" style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: "clamp(32px,4vw,56px)", alignItems: "start" }}>

          {/* Main content */}
          <div>
            {/* Tag + Price row */}
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 12, flexWrap: "wrap" }}>
              <span style={{ display: "inline-block", padding: "4px 14px", borderRadius: 4, backgroundColor: DARK, color: "#fff", fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" as const }}>
                <GenericEditableText sectionId={sectionId} field="tag" value={tag} tag="span" />
              </span>
              <GenericEditableText sectionId={sectionId} field="price" value={price} tag="span"
                style={{ fontSize: "clamp(22px,3vw,32px)", fontWeight: 700, color: DARK, letterSpacing: "-0.02em" }} />
            </div>

            <GenericEditableText sectionId={sectionId} field="title" value={title} tag="h1"
              style={{ fontSize: "clamp(22px,3vw,34px)", fontWeight: 700, lineHeight: 1.2, color: DARK, margin: "0 0 8px", letterSpacing: "-0.02em" }} />
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 32, color: "#9ca3af", fontSize: 14, fontFamily: BODY }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
              <GenericEditableText sectionId={sectionId} field="address" value={address} tag="span" />
            </div>

            {/* Quick specs */}
            <div style={{ display: "flex", gap: 24, flexWrap: "wrap", marginBottom: 40, padding: "20px 0", borderTop: "1px solid #e5e7eb", borderBottom: "1px solid #e5e7eb" }}>
              {[
                { icon: "⬛", label: area, sub: "Plocha" },
                { icon: "🏠", label: rooms, sub: "Dispozice" },
                { icon: "📍", label: floor, sub: "Patro" },
              ].map((s, i) => (
                <div key={i} style={{ textAlign: "center", minWidth: 80 }}>
                  <div style={{ fontSize: 18, fontWeight: 700, color: DARK }}>{s.label}</div>
                  <div style={{ fontSize: 11, color: "#9ca3af", fontFamily: BODY, marginTop: 2 }}>{s.sub}</div>
                </div>
              ))}
            </div>

            {/* Description */}
            <GenericEditableText sectionId={sectionId} field="description" value={description} tag="div"
              style={{ fontFamily: BODY, fontSize: 15, lineHeight: 1.8, color: "#4b5563", whiteSpace: "pre-line", marginBottom: 40 }} />

            {/* Parameters table */}
            <h3 style={{ fontSize: 16, fontWeight: 700, color: DARK, marginBottom: 16, letterSpacing: "0.02em" }}>Parametry nemovitosti</h3>
            <div style={{ borderRadius: 10, overflow: "hidden", border: "1px solid #e5e7eb" }}>
              {specs.map((s, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "14px 20px", backgroundColor: i % 2 === 0 ? "#fff" : "#fafafa", borderBottom: i < specs.length - 1 ? "1px solid #f0f0f0" : "none" }}>
                  <span style={{ fontFamily: BODY, fontSize: 14, color: "#6b7280" }}>{s.label}</span>
                  <span style={{ fontFamily: FONT, fontSize: 14, fontWeight: 600, color: DARK }}>{s.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar — Agent card */}
          <div style={{ position: "sticky", top: 88 }}>
            <div style={{ borderRadius: 12, border: "1px solid #e5e7eb", padding: "32px 28px", backgroundColor: "#fff", boxShadow: "0 4px 24px rgba(0,0,0,0.04)" }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase" as const, color: "#9ca3af", marginBottom: 20 }}>Váš makléř</div>

              <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
                <div style={{ width: 56, height: 56, borderRadius: "50%", backgroundColor: SURFACE, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, fontWeight: 700, color: DARK }}>
                  {agentName.split(" ").map(n => n[0]).join("").slice(0, 2)}
                </div>
                <div>
                  <GenericEditableText sectionId={sectionId} field="agentName" value={agentName} tag="div"
                    style={{ fontWeight: 600, fontSize: 15, color: DARK }} />
                  <GenericEditableText sectionId={sectionId} field="agentRole" value={agentRole} tag="div"
                    style={{ fontSize: 12, color: "#9ca3af", fontFamily: BODY }} />
                </div>
              </div>

              <a href={`tel:+420${agentPhone.replace(/\s/g,"")}`} className="r01-detail-call" style={{
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8, width: "100%",
                padding: "14px 0", borderRadius: 6, backgroundColor: DARK, color: "#fff",
                fontSize: 14, fontWeight: 700, textDecoration: "none", letterSpacing: "0.04em",
                transition: "background 0.25s, transform 0.25s",
                marginBottom: 10,
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.34 2 2 0 0 1 3.58 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.55a16 16 0 0 0 6.05 6.05l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                <GenericEditableText sectionId={sectionId} field="agentPhone" value={`+420 ${agentPhone}`} tag="span" />
              </a>
              <a href={`mailto:${agentEmail}`} className="r01-detail-email" style={{
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8, width: "100%",
                padding: "14px 0", borderRadius: 6, border: `1.5px solid ${DARK}`, color: DARK,
                fontSize: 14, fontWeight: 600, textDecoration: "none", letterSpacing: "0.04em",
                transition: "background 0.25s, color 0.25s",
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                <GenericEditableText sectionId={sectionId} field="agentEmail" value={agentEmail} tag="span" />
              </a>

              <div style={{ marginTop: 24, padding: "16px 0 0", borderTop: "1px solid #f0f0f0", fontSize: 12, color: "#9ca3af", fontFamily: BODY, textAlign: "center", lineHeight: 1.6 }}>
                Prohlídku domluvíme<br/>do 48 hodin od kontaktu
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .r01-detail-content { grid-template-columns: 1fr !important; }
          .r01-detail-gallery { grid-template-columns: 1fr !important; grid-template-rows: 280px auto !important; }
          .r01-detail-gallery > div:first-child { grid-row: auto !important; }
        }
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
  // conditional header (skryje se na /sluzby podstránce, kde je banner)
  const eyebrowRaw  = (content as Record<string, unknown>).eyebrow;
  const titleRaw    = (content as Record<string, unknown>).title;
  const subtitleRaw = (content as Record<string, unknown>).subtitle;
  const eyebrow  = eyebrowRaw  === undefined ? "Proč Rezido" : String(eyebrowRaw);
  const title    = titleRaw    === undefined ? "Proč právě my?" : String(titleRaw);
  const subtitle = subtitleRaw === undefined ? "Čtyři důvody, proč svěřit svou nemovitost do rukou lidí, kteří to dělají srdcem." : String(subtitleRaw);
  const showHeader = !!(eyebrow.trim() || title.trim() || subtitle.trim());
  const items = (content.items as Array<{ title: string; subtitle: string; body: string; image: string }>) ?? [];

  const [active, setActive] = useState(0);

  const PRIMARY = "#1032CF";
  const GREEN   = "#21b276";
  const DARK    = "#141414";
  const MUTED   = "#6b7280";
  const SANS    = "'Helvetica Neue', Helvetica, Arial, sans-serif";

  const current = items[active];

  return (
    <section id={sectionAnchor} style={{ backgroundColor: "#fff", padding: "clamp(56px, 7vw, 100px) 0" }} data-template="reality-04">
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 clamp(16px, 3vw, 40px)" }}>

        {/* Header */}
        {showHeader && (
          <div style={{ maxWidth: 640, marginBottom: "clamp(32px, 4vw, 56px)" }}>
            {eyebrow.trim() && (
              <GenericEditableText sectionId={sectionId} field="eyebrow" value={eyebrow} tag="p"
                style={{ fontFamily: SANS, fontSize: 12.5, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: GREEN, margin: "0 0 12px" }} />
            )}
            {title.trim() && (
              <h2 style={{ fontFamily: SANS, fontSize: "clamp(26px, 3vw, 38px)", fontWeight: 700, color: DARK, margin: "0 0 14px", lineHeight: 1.15, letterSpacing: "-0.01em" }}>
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

        <div className="r04-why-grid">
          {/* Levý sloupec — seznam položek */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {items.map((item, i) => (
              <button
                key={i}
                onClick={() => setActive(i)}
                className={`r04-why-item${i === active ? " is-active" : ""}`}
              >
                <span className="r04-why-num" style={{ backgroundColor: i === active ? PRIMARY : "#eef1f8", color: i === active ? "#fff" : MUTED }}>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span style={{ display: "block", flex: 1 }}>
                  <span style={{ display: "block", fontFamily: SANS, fontSize: "clamp(15px, 1.4vw, 17.5px)", fontWeight: i === active ? 700 : 600, color: i === active ? PRIMARY : DARK, marginBottom: 4, transition: "color 0.2s" }}>
                    <GenericEditableText sectionId={sectionId} field={`items.${i}.title`} value={item.title} tag="span" />
                  </span>
                  <span style={{ display: "block", fontFamily: SANS, fontSize: 13.5, color: MUTED, lineHeight: 1.45 }}>
                    <GenericEditableText sectionId={sectionId} field={`items.${i}.subtitle`} value={item.subtitle} tag="span" />
                  </span>
                </span>
              </button>
            ))}
          </div>

          {/* Pravý sloupec — fotka + text aktivní položky */}
          {current && (
            <div key={active} className="r04-why-detail">
              <div className="r04-why-imgwrap">
                <GenericEditableImage sectionId={sectionId} field={`items.${active}.image`} src={current.image} alt={current.title} style={{ display: "block", width: "100%", height: "100%" }}>
                  <img
                    src={current.image}
                    alt={current.title}
                    style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                  />
                </GenericEditableImage>
              </div>
              <h3 style={{ fontFamily: SANS, fontSize: "clamp(18px, 1.7vw, 22px)", fontWeight: 700, color: DARK, margin: "26px 0 12px" }}>
                <GenericEditableText sectionId={sectionId} field={`items.${active}.title`} value={current.title} tag="span" />
              </h3>
              <p style={{ fontFamily: SANS, fontSize: 15.5, color: MUTED, lineHeight: 1.75, margin: 0 }}>
                <GenericEditableText sectionId={sectionId} field={`items.${active}.body`} value={current.body} tag="span" />
              </p>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .r04-why-grid { display: grid; grid-template-columns: 1fr 1.15fr; gap: clamp(32px, 5vw, 72px); align-items: start; }
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
  // conditional header (skryje se na /sluzby podstránce, kde je banner)
  const taglineRaw  = (content as Record<string, unknown>).tagline;
  const titleRaw    = (content as Record<string, unknown>).title;
  const subtitleRaw = (content as Record<string, unknown>).subtitle;
  const tagline  = taglineRaw  === undefined ? "Co pro vás děláme" : String(taglineRaw);
  const title    = titleRaw    === undefined ? "Kompletní servis\nvašeho vozidla" : String(titleRaw);
  const subtitle = subtitleRaw === undefined ? "" : String(subtitleRaw);
  const showHeader = !!(tagline.trim() || title.trim() || subtitle.trim());
  type Item = { icon?: string; name?: string; description?: string; ctaText?: string; ctaHref?: string };
  const items = (content.items as Item[]) ?? [];

  const WHITE  = "#ffffff";
  const ORANGE = "#f97316";
  const MUTED  = "#9ca3af";
  const SANS   = "'Inter','Helvetica Neue',Helvetica,Arial,sans-serif";

  const secRef = useRef<HTMLElement | null>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = secRef.current;
    if (!el) return;
    const io = new IntersectionObserver((e) => { if (e[0].isIntersecting) { setInView(true); io.disconnect(); } }, { threshold: 0.15 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const ICONS: Record<string, React.ReactNode> = {
    wrench:   <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>,
    settings: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
    cpu:      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><line x1="9" y1="1" x2="9" y2="4"/><line x1="15" y1="1" x2="15" y2="4"/><line x1="9" y1="20" x2="9" y2="23"/><line x1="15" y1="20" x2="15" y2="23"/><line x1="20" y1="9" x2="23" y2="9"/><line x1="20" y1="14" x2="23" y2="14"/><line x1="1" y1="9" x2="4" y2="9"/><line x1="1" y1="14" x2="4" y2="14"/></svg>,
    shield:   <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  };

  const getIcon = (key?: string) => ICONS[key ?? "wrench"] ?? ICONS.wrench;

  return (
    <section
      ref={secRef}
      id="sluzby"
      className={`a03-svc${inView ? " a03-in" : ""}`}
      data-section-id={sectionId}
      data-template="autoservis-03"
    >
      <style>{`
        .a03-eyebrow { display: inline-flex; align-items: center; gap: 10px; font-family: 'Inter','Helvetica Neue',Helvetica,Arial,sans-serif; font-size: 12.5px; font-weight: 700; letter-spacing: 2.5px; text-transform: uppercase; color: #f97316; margin-bottom: 14px; }
        .a03-eyebrow-bar { width: 26px; height: 2px; background: linear-gradient(to right,#f97316,#c2410c); border-radius: 2px; flex-shrink: 0; }

        .a03-svc { position: relative; background: #0d0d0d; padding: clamp(72px,9vw,110px) 24px; overflow: hidden; font-family: 'Inter','Helvetica Neue',Helvetica,Arial,sans-serif; }
        .a03-svc-glow { position: absolute; top: -220px; left: -160px; width: 560px; height: 560px; background: radial-gradient(circle, rgba(249,115,22,0.09) 0%, transparent 65%); pointer-events: none; }
        .a03-svc-wrap { max-width: 1220px; margin: 0 auto; position: relative; }
        .a03-svc-head { text-align: center; max-width: 660px; margin: 0 auto clamp(40px,5vw,60px); }
        .a03-svc-h2 { font-family: 'Inter','Helvetica Neue',Helvetica,Arial,sans-serif; font-size: clamp(1.8rem,3.4vw,2.7rem); font-weight: 800; color: #ffffff; letter-spacing: -0.5px; line-height: 1.15; margin: 0; }
        .a03-svc-sub { font-size: 15px; line-height: 1.7; color: #9ca3af; margin: 14px 0 0; }
        .a03-svc-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 22px; }
        .a03-svc-card { position: relative; background: #141414; border: 1px solid #232323; border-radius: 18px; padding: 30px 26px 28px; overflow: hidden; opacity: 0; transform: translateY(26px); transition: opacity .6s ease, transform .6s ease, border-color .25s, box-shadow .25s; }
        .a03-svc.a03-in .a03-svc-card { opacity: 1; transform: none; }
        .a03-svc-card:hover { border-color: rgba(249,115,22,0.45); box-shadow: 0 18px 44px rgba(0,0,0,0.45); }
        .a03-svc-card-top { position: absolute; top: 0; left: 0; right: 0; height: 3px; background: linear-gradient(to right,#f97316,#c2410c); transform: scaleX(0); transform-origin: left; transition: transform .35s ease; }
        .a03-svc-card:hover .a03-svc-card-top { transform: scaleX(1); }
        .a03-svc-icon { width: 56px; height: 56px; border-radius: 14px; background: rgba(249,115,22,0.12); color: #f97316; display: flex; align-items: center; justify-content: center; margin-bottom: 20px; }
        .a03-svc-name { font-family: 'Inter','Helvetica Neue',Helvetica,Arial,sans-serif; font-size: 17.5px; font-weight: 700; color: #ffffff; margin: 0 0 9px; letter-spacing: -0.2px; }
        .a03-svc-desc { font-size: 14px; line-height: 1.65; color: #9ca3af; margin: 0 0 14px; }
        .a03-svc-link:hover .a03-svc-arrow { transform: translateX(3px); }
        .a03-svc-arrow { transition: transform .2s; }
        @media (max-width: 1024px) { .a03-svc-grid { grid-template-columns: repeat(2,1fr); } }
        @media (max-width: 560px)  { .a03-svc-grid { grid-template-columns: 1fr; } }
      `}</style>
      <div aria-hidden="true" className="a03-svc-glow" />
      <div className="a03-svc-wrap">
        {showHeader && (
          <div className="a03-svc-head">
            {tagline.trim() && (
              <span className="a03-eyebrow">
                <span aria-hidden="true" className="a03-eyebrow-bar" />
                <GenericEditableText sectionId={sectionId} field="tagline" value={tagline} tag="span" />
              </span>
            )}
            {title.trim() && (
              <h2 className="a03-svc-h2" style={{ whiteSpace: "pre-line" }}>
                <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
              </h2>
            )}
            {subtitle.trim() && (
              <p className="a03-svc-sub">
                <GenericEditableText sectionId={sectionId} field="subtitle" value={subtitle} tag="span" />
              </p>
            )}
          </div>
        )}
        <div className="a03-svc-grid">
          {items.map((item, i) => (
            <div key={i} className="a03-svc-card" style={{ transitionDelay: `${i * 90}ms` }}>
              <span aria-hidden="true" className="a03-svc-card-top" />
              <div className="a03-svc-icon">
                {getIcon(item.icon)}
              </div>
              <h3 className="a03-svc-name">
                <GenericEditableText sectionId={sectionId} field={`items.${i}.name`} value={item.name ?? ""} tag="span" />
              </h3>
              <p className="a03-svc-desc">
                <GenericEditableText sectionId={sectionId} field={`items.${i}.description`} value={item.description ?? ""} tag="span" />
              </p>
              {item.ctaText && (
                <a href={item.ctaHref ?? "#"} className="a03-svc-link" style={{ display: "inline-flex", alignItems: "center", gap: 7, fontFamily: SANS, fontSize: 13, fontWeight: 700, color: ORANGE, textDecoration: "none", marginTop: 4 }}>
                  <GenericEditableText sectionId={sectionId} field={`items.${i}.ctaText`} value={item.ctaText} tag="span" />
                  <svg className="a03-svc-arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
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
  const taglineRaw  = (content as Record<string, unknown>).tagline;
  const titleRaw    = (content as Record<string, unknown>).title;
  const subtitleRaw = (content as Record<string, unknown>).subtitle;
  const tagline  = taglineRaw  === undefined ? "Transparentní ceny" : String(taglineRaw);
  const title    = titleRaw    === undefined ? "Ceník služeb" : String(titleRaw);
  const subtitle = subtitleRaw === undefined ? "" : String(subtitleRaw);
  const showHeader = !!(tagline.trim() || title.trim() || subtitle.trim());
  const vatNote  = String(content.vatNote  ?? "* uvedené ceny jsou bez DPH");
  const ctaText  = String(content.ctaText  ?? "Získat nabídku");
  const ctaHref  = String(content.ctaHref  ?? "#kontakt");
  type PriceRow = { name: string; price: string };
  type Table = { heading: string; rows: PriceRow[] };
  const tables = (content.tables as Table[]) ?? [];

  const secRef = useRef<HTMLElement | null>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = secRef.current;
    if (!el) return;
    const io = new IntersectionObserver((e) => { if (e[0].isIntersecting) { setInView(true); io.disconnect(); } }, { threshold: 0.12 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const tableIcon = (ti: number) => ti === 0 ? (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
  ) : (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="3.4"/></svg>
  );

  return (
    <section ref={secRef} id="cenik" className={`a03-price${inView ? " a03-in" : ""}`} data-template="autoservis-03">
      <style>{`
        .a03-eyebrow { display: inline-flex; align-items: center; gap: 10px; font-family: 'Inter','Helvetica Neue',Helvetica,Arial,sans-serif; font-size: 12.5px; font-weight: 700; letter-spacing: 2.5px; text-transform: uppercase; color: #f97316; margin-bottom: 14px; }
        .a03-eyebrow-bar { width: 26px; height: 2px; background: linear-gradient(to right,#f97316,#c2410c); border-radius: 2px; flex-shrink: 0; }

        .a03-price { position: relative; background: #0a0a0a; padding: clamp(72px,9vw,110px) 24px; overflow: hidden; font-family: 'Inter','Helvetica Neue',Helvetica,Arial,sans-serif; }
        .a03-price-glow { position: absolute; bottom: -240px; right: -180px; width: 600px; height: 600px; background: radial-gradient(circle, rgba(249,115,22,0.08) 0%, transparent 65%); pointer-events: none; }
        .a03-price-wrap { max-width: 1080px; margin: 0 auto; position: relative; }
        .a03-price-head { text-align: center; max-width: 640px; margin: 0 auto clamp(40px,5vw,60px); }
        .a03-price-h2 { font-family: 'Inter','Helvetica Neue',Helvetica,Arial,sans-serif; font-size: clamp(1.8rem,3.4vw,2.7rem); font-weight: 800; color: #ffffff; letter-spacing: -0.5px; line-height: 1.15; margin: 0; }
        .a03-price-sub { font-size: 15px; line-height: 1.7; color: #9ca3af; margin: 14px 0 0; }
        .a03-price-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 26px; }
        .a03-price-card { position: relative; background: #141414; border: 1px solid #232323; border-radius: 20px; padding: 34px 32px 26px; overflow: hidden; opacity: 0; transform: translateY(26px); transition: opacity .6s ease, transform .6s ease, border-color .25s; }
        .a03-price.a03-in .a03-price-card { opacity: 1; transform: none; }
        .a03-price-card:hover { border-color: rgba(249,115,22,0.4); }
        .a03-price-card-top { position: absolute; top: 0; left: 0; right: 0; height: 3px; background: linear-gradient(to right,#f97316,#c2410c); }
        .a03-price-cardhead { display: flex; align-items: center; gap: 14px; margin-bottom: 18px; }
        .a03-price-cardicon { width: 44px; height: 44px; border-radius: 12px; background: rgba(249,115,22,0.12); color: #f97316; display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .a03-price-heading { font-family: 'Inter','Helvetica Neue',Helvetica,Arial,sans-serif; font-size: 19px; font-weight: 800; color: #ffffff; letter-spacing: -0.2px; margin: 0; }
        .a03-price-row { display: flex; align-items: baseline; justify-content: space-between; gap: 18px; padding: 12.5px 0; border-bottom: 1px dashed #2c2c2c; }
        .a03-price-row:last-child { border-bottom: 0; }
        .a03-price-name { font-size: 14.5px; color: #d1d5db; }
        .a03-price-val { font-size: 14.5px; font-weight: 800; color: #f97316; white-space: nowrap; }
        .a03-price-foot { display: flex; align-items: center; justify-content: space-between; gap: 20px; margin-top: 30px; flex-wrap: wrap; }
        .a03-price-vat { font-size: 13px; color: #6b7280; margin: 0; }
        .a03-price-cta { position: relative; display: inline-flex; align-items: center; gap: 9px; background: linear-gradient(to right,#f97316,#ea6c08); color: #0a0a0a; font-family: 'Inter','Helvetica Neue',Helvetica,Arial,sans-serif; font-size: 14.5px; font-weight: 800; letter-spacing: 0.4px; text-decoration: none; padding: 14px 28px; border-radius: 999px; transition: transform .2s, box-shadow .25s; }
        .a03-price-cta:hover { transform: translateY(-2px); box-shadow: 0 14px 34px rgba(249,115,22,0.35); }
        .a03-price-cta:hover .a03-cta-arrow { transform: translateX(3px); }
        .a03-cta-arrow { transition: transform .2s; }
        @media (max-width: 860px) { .a03-price-grid { grid-template-columns: 1fr; } .a03-price-foot { justify-content: center; text-align: center; } }
      `}</style>
      <div aria-hidden="true" className="a03-price-glow" />
      <div className="a03-price-wrap">
        {showHeader && (
          <div className="a03-price-head">
            {tagline.trim() && (
              <span className="a03-eyebrow">
                <span aria-hidden="true" className="a03-eyebrow-bar" />
                <GenericEditableText sectionId={sectionId} field="tagline" value={tagline} tag="span" />
              </span>
            )}
            {title.trim() && (
              <h2 className="a03-price-h2">
                <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
              </h2>
            )}
            {subtitle.trim() && (
              <p className="a03-price-sub">
                <GenericEditableText sectionId={sectionId} field="subtitle" value={subtitle} tag="span" />
              </p>
            )}
          </div>
        )}
        <div className="a03-price-grid">
          {tables.map((table, ti) => (
            <div key={ti} className="a03-price-card" style={{ transitionDelay: `${ti * 120}ms` }}>
              <span aria-hidden="true" className="a03-price-card-top" />
              <div className="a03-price-cardhead">
                <span aria-hidden="true" className="a03-price-cardicon">{tableIcon(ti)}</span>
                <h3 className="a03-price-heading">
                  <GenericEditableText sectionId={sectionId} field={`tables.${ti}.heading`} value={table.heading} tag="span" />
                </h3>
              </div>
              <div>
                {table.rows.map((row, ri) => (
                  <div key={ri} className="a03-price-row">
                    <span className="a03-price-name">
                      <GenericEditableText sectionId={sectionId} field={`tables.${ti}.rows.${ri}.name`} value={row.name} tag="span" />
                    </span>
                    <span className="a03-price-val">
                      <GenericEditableText sectionId={sectionId} field={`tables.${ti}.rows.${ri}.price`} value={row.price} tag="span" />
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="a03-price-foot">
          <p className="a03-price-vat">
            <GenericEditableText sectionId={sectionId} field="vatNote" value={vatNote} tag="span" />
          </p>
          <a href={ctaHref} data-btn="primary" className="a03-price-cta">
            <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" style={{ position: "relative", zIndex: 1 }} />
            <svg className="a03-cta-arrow" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ position: "relative", zIndex: 1 }}><path d="M5 12h14M13 6l6 6-6 6"/></svg>
          </a>
        </div>
      </div>
    </section>
  );
}

// ── autoservis-02-services ───────────────────────────────────────────────────
// Bílé bg + jemný diagonal pattern; max-w-1280; red tagline + H2 dark;
// 4-col karty: red circle icon + H3 + popis + red CTA link.
// Hover: card lift, top red accent bar reveal, icon scale.
// Conditional header (showHeader) pro subpages. Open Sans, #d82a2a red.
// ────────────────────────────────────────────────────────────────────────────
function ServicesAutoservis02({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const taglineRaw = content.tagline;
  const titleRaw   = content.title;
  const tagline = taglineRaw === undefined ? "Co pro vás děláme" : String(taglineRaw);
  const title   = titleRaw   === undefined ? "Služby na míru\nvašemu vozu" : String(titleRaw);
  const showHeader = !!(tagline.trim() || title.trim());
  const items   = (content.items as Array<{ icon?: string; name: string; description: string; ctaText?: string; ctaHref?: string }>) ?? [];

  const RED   = "#d82a2a";
  const DARK  = "#1a1a1a";
  const SANS  = "'Open Sans', Arial, sans-serif";

  const ICONS: Record<string, React.ReactElement> = {
    wrench: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
      </svg>
    ),
    engine: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="3" y="8" width="18" height="10" rx="2"/><path d="M7 8V6"/><path d="M17 8V6"/><path d="M7 18v2"/><path d="M17 18v2"/><path d="M3 13h2"/><path d="M19 13h2"/>
      </svg>
    ),
    electric: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
      </svg>
    ),
    climate: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 2v20M4.93 4.93l14.14 14.14M2 12h20M4.93 19.07 19.07 4.93"/><circle cx="12" cy="12" r="3"/>
      </svg>
    ),
  };

  return (
    <section id={String(content.id ?? "sluzby")} style={{ backgroundColor: "#fafafa", padding: "clamp(72px,10vw,112px) 0", position: "relative" }} data-section-id={sectionId} data-template="autoservis-02">
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 clamp(16px,4vw,48px)" }}>
        {/* Header — conditional */}
        {showHeader && (
          <div className="a02s-header" style={{ textAlign: "center", marginBottom: 56 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
              <span style={{ width: 28, height: 2, background: RED, display: "inline-block", borderRadius: 1 }} aria-hidden="true" />
              <GenericEditableText sectionId={sectionId} field="tagline" value={tagline} tag="span" style={{ fontFamily: SANS, fontSize: 12.5, fontWeight: 700, color: RED, letterSpacing: "2.5px", textTransform: "uppercase" }} />
              <span style={{ width: 28, height: 2, background: RED, display: "inline-block", borderRadius: 1 }} aria-hidden="true" />
            </div>
            <h2 style={{ fontFamily: SANS, fontSize: "clamp(26px,4vw,40px)", fontWeight: 900, color: DARK, margin: 0, lineHeight: 1.2, whiteSpace: "pre-line", letterSpacing: "-0.3px" }}>
              <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
            </h2>
          </div>
        )}

        {/* 4-col grid */}
        <div className="a02s-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 28 }}>
          {items.map((item, i) => (
            <div key={i} className="a02s-card" style={{ backgroundColor: "#fff", borderRadius: 12, padding: "32px 28px", display: "flex", flexDirection: "column", gap: 16, position: "relative", overflow: "hidden", border: "1px solid #eee" }}>
              {/* Top accent bar — hidden, revealed on hover */}
              <div className="a02s-accent" style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: RED, transform: "scaleX(0)", transformOrigin: "left", transition: "transform .35s cubic-bezier(.4,0,.2,1)" }} aria-hidden="true" />
              {/* Icon — red circle */}
              <div className="a02s-icon" style={{ width: 56, height: 56, borderRadius: "50%", background: `linear-gradient(135deg, ${RED} 0%, #b21f1f 100%)`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: "0 4px 14px rgba(216,42,42,0.22)" }}>
                {ICONS[item.icon ?? "wrench"] ?? ICONS.wrench}
              </div>
              {/* Name */}
              <h3 style={{ fontFamily: SANS, fontSize: 18, fontWeight: 800, color: DARK, margin: 0, lineHeight: 1.3 }}>
                <GenericEditableText sectionId={sectionId} field={`items.${i}.name`} value={item.name} tag="span" />
              </h3>
              {/* Description */}
              <p style={{ fontFamily: SANS, fontSize: 14, fontWeight: 400, color: "#555", margin: 0, lineHeight: 1.7, flex: 1 }}>
                <GenericEditableText sectionId={sectionId} field={`items.${i}.description`} value={item.description} tag="span" />
              </p>
              {/* CTA */}
              {item.ctaText && (
                <a href={item.ctaHref ?? "#"} className="a02s-link"
                  style={{ display: "inline-flex", alignItems: "center", gap: 6, fontFamily: SANS, fontSize: 13, fontWeight: 700, color: RED, textDecoration: "none", marginTop: 4 }}
                >
                  <GenericEditableText sectionId={sectionId} field={`items.${i}.ctaText`} value={item.ctaText} tag="span" />
                  <svg className="a02s-arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
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
  // Conditional header — na /sluzby subpage se vyprázdní → banner nese titulek
  const taglineRaw = (content as Record<string, unknown>).tagline;
  const titleRaw   = (content as Record<string, unknown>).title;
  const tagline = taglineRaw === undefined ? "Naše nabídka" : String(taglineRaw);
  const title   = titleRaw   === undefined ? "Nejžádanější služby\nnašich zákazníků" : String(titleRaw);
  const showHeader = !!(tagline.trim() || title.trim());
  const items   = (content.items as Item[]) ?? [];

  return (
    <section id={String(content.id ?? "sluzby")} style={{ backgroundColor: BG, padding: "clamp(64px,9vw,104px) 0" }} data-template="autoservis-01-services">
      <style>{`
        .a01-svc-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 28px; }
        @media (max-width: 860px) { .a01-svc-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 560px) { .a01-svc-grid { grid-template-columns: 1fr; } }
        .a01-svc-card { position: relative; background: #fff; border-radius: 14px; overflow: hidden; display: flex; flex-direction: column; box-shadow: 0 1px 4px rgba(17,17,17,0.06); transition: transform .35s cubic-bezier(.4,0,.2,1), box-shadow .35s ease; }
        .a01-svc-card::before { content:""; position:absolute; left:0; right:0; top:0; height:4px; background:#FFA500; transform:scaleX(0); transform-origin:left center; transition:transform .4s cubic-bezier(.4,0,.2,1); z-index:3; }
        .a01-svc-card:hover { transform: translateY(-8px); box-shadow: 0 20px 44px rgba(17,17,17,0.16); }
        .a01-svc-card:hover::before { transform: scaleX(1); }
        .a01-svc-img { position: relative; overflow: hidden; aspect-ratio: 4/3; }
        .a01-svc-img::after { content:""; position:absolute; inset:0; background:linear-gradient(to top, rgba(17,17,17,0.28), transparent 55%); opacity:0; transition:opacity .4s ease; }
        .a01-svc-card:hover .a01-svc-img::after { opacity:1; }
        .a01-svc-img img { width: 100%; height: 100%; object-fit: cover; display: block; transition: transform 0.6s cubic-bezier(0.25,0.46,0.45,0.94); }
        .a01-svc-card:hover .a01-svc-img img { transform: scale(1.07); }
        .a01-svc-body { padding: 28px 28px 32px; display: flex; flex-direction: column; flex: 1; }
        .a01-svc-title { transition: color .25s ease; }
        .a01-svc-card:hover .a01-svc-title { color: #FFA500; }
        .a01-svc-cta { display: inline-flex; align-items: center; gap: 7px; margin-top: auto; padding-top: 22px; font-weight: 700; text-decoration: none; }
        .a01-svc-cta svg { transition: transform .28s cubic-bezier(.34,1.56,.64,1); }
        .a01-svc-card:hover .a01-svc-cta svg { transform: translateX(5px); }
      `}</style>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 clamp(16px,4vw,48px)" }}>
        {showHeader && (
          <div style={{ marginBottom: 56, maxWidth: 620 }}>
            <p style={{ display: "flex", alignItems: "center", gap: 12, fontFamily: SANS, fontSize: 13, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: ORANGE, margin: "0 0 14px" }}>
              <span aria-hidden="true" style={{ width: 30, height: 3, background: ORANGE, borderRadius: 2 }} />
              <GenericEditableText sectionId={sectionId} field="tagline" value={tagline} tag="span" />
            </p>
            <h2 style={{ fontFamily: SANS, fontSize: "clamp(27px,3.4vw,40px)", fontWeight: 800, color: DARK, margin: 0, lineHeight: 1.16, letterSpacing: "-0.02em", whiteSpace: "pre-line" }}>
              <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
            </h2>
          </div>
        )}

        <div className="a01-svc-grid">
          {items.map((item, i) => (
            <div key={i} className="a01-svc-card">
              <div className="a01-svc-img">
                <GenericEditableImage sectionId={sectionId} field={`items.${i}.image`} src={item.image ?? ""} alt={item.name ?? ""} style={{}}>
                  <img loading="lazy" src={item.image ?? ""} alt={item.name ?? ""} />
                </GenericEditableImage>
              </div>
              <div className="a01-svc-body">
                <h3 className="a01-svc-title" style={{ fontFamily: SANS, fontSize: 20, fontWeight: 800, color: DARK, margin: "0 0 12px", lineHeight: 1.3 }}>
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
// Inspirováno dentia-klinika.cz services grid.
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
function ServicesOrtho02({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const FONT  = "'Raleway', 'Helvetica Neue', Arial, sans-serif";
  const FONT_B = "'Open Sans', 'Raleway', Arial, sans-serif";
  const DARK  = "#1a1a1a";
  const MUTED = "#888888";
  const BEIGE = "#B7B3A5";
  const GOLD  = "#b39f6b";

  const eyebrowRaw  = (content as Record<string,unknown>).eyebrow;
  const titleRaw    = (content as Record<string,unknown>).heading;
  const subtitleRaw = (content as Record<string,unknown>).subheading;
  const eyebrow  = eyebrowRaw  === undefined ? "Naše specializace" : String(eyebrowRaw);
  const title    = titleRaw    === undefined ? "Každý úsměv si zaslouží individuální přístup a špičkovou péči" : String(titleRaw);
  const subtitle = subtitleRaw === undefined ? "" : String(subtitleRaw);
  const showHeader = !!(eyebrow.trim() || title.trim() || subtitle.trim());

  type Item = { title?: string; subtitle?: string; description?: string; href?: string; image?: string };
  const rawItems = (content.items as Item[]) ?? [];

  const defaultItems: Item[] = [
    { title: "Neviditelné alignery", subtitle: "Transparentní systém", description: "Moderní řešení bez kovových drátků — alignery jsou prakticky neviditelné a snadno snímatelné", href: "/sluzby", image: "/templates/ortho-02/svc-alignery.webp" },
    { title: "Keramická rovnátka",  subtitle: "Estetická volba",      description: "Zámečky v barvě zubu pro ty, kteří chtějí rovnátka bez kompromisů na vzhledu",                  href: "/sluzby", image: "/templates/ortho-02/svc-keramika.webp" },
    { title: "Klasická rovnátka",   subtitle: "Ověřená metoda",       description: "Nejspolehlivější řešení pro složitější ortodontické případy s precizní kontrolou",                href: "/sluzby", image: "/templates/ortho-02/svc-klasika.webp" },
    { title: "Dětská ortodoncie",   subtitle: "Péče od mládí",        description: "Šetrná léčba přizpůsobená rostoucímu chrupu — čím dříve začneme, tím lepší výsledek",            href: "/sluzby", image: "/templates/ortho-02/svc-deti.webp" },
  ];

  const cards = rawItems.length > 0 ? rawItems : defaultItems;

  return (
    <section
      id="sluzby"
      data-template="ortho-02"
      style={{ backgroundColor: "#ffffff", fontFamily: FONT }}
    >
      {showHeader && (
        <div style={{ padding: "clamp(64px, 8vw, 100px) clamp(32px, 6vw, 96px) clamp(40px, 5vw, 64px)", maxWidth: 900 }}>
          <p style={{ margin: "0 0 16px", fontFamily: FONT, fontSize: "0.78rem", fontWeight: 600, color: GOLD, letterSpacing: "0.14em", textTransform: "uppercase" }}>
            <GenericEditableText sectionId={sectionId} field="eyebrow" value={eyebrow} tag="span" />
          </p>
          <h2 style={{ margin: 0, maxWidth: "68ch", fontFamily: FONT, fontSize: "clamp(1.5rem, 3vw, 2.4rem)", fontWeight: 300, color: DARK, lineHeight: 1.4, letterSpacing: "-0.01em" }}>
            <GenericEditableText sectionId={sectionId} field="heading" value={title} tag="span" />
          </h2>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)" }} className="o02-svc-grid">
        {cards.map((card, i) => {
          const t    = card.title       ?? defaultItems[i]?.title       ?? "";
          const sub  = card.subtitle    ?? defaultItems[i]?.subtitle    ?? "";
          const desc = card.description ?? defaultItems[i]?.description ?? "";
          const img  = card.image       ?? defaultItems[i]?.image       ?? "";
          const href = card.href        ?? "/sluzby";
          const ctaLabel = String((content as Record<string,unknown>)[`items.${i}.ctaLabel`] ?? "Zjistit více");

          return (
            <a
              key={i}
              href={href}
              className="o02-svc-card"
              style={{
                display: "block",
                textDecoration: "none",
                color: "inherit",
                position: "relative",
                overflow: "hidden",
              }}
            >
              <div style={{ position: "relative", width: "100%", aspectRatio: "3/4", overflow: "hidden", backgroundColor: "#eae6e0" }}>
                <GenericEditableImage sectionId={sectionId} field={`items.${i}.image`} src={img} alt={t} style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
                  <img
                    src={img}
                    alt={t}
                    loading={i < 2 ? "eager" : "lazy"}
                    style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center top", transition: "transform 0.6s cubic-bezier(0.25,0.46,0.45,0.94), filter 0.6s ease" }}
                    className="o02-svc-img"
                  />
                </GenericEditableImage>
                {/* Gold overlay on hover */}
                <div className="o02-svc-overlay" style={{
                  position: "absolute",
                  inset: 0,
                  background: "linear-gradient(to top, rgba(179,159,107,0.25) 0%, transparent 60%)",
                  opacity: 0,
                  transition: "opacity 0.5s ease",
                  pointerEvents: "none",
                }} />
              </div>

              <div style={{ padding: "22px 28px 28px", backgroundColor: "#ffffff", borderTop: "1px solid #f0ede8" }}>
                <p style={{ margin: "0 0 5px", fontFamily: FONT, fontSize: "0.7rem", fontWeight: 600, color: GOLD, letterSpacing: "0.12em", textTransform: "uppercase" }}>
                  <GenericEditableText sectionId={sectionId} field={`items.${i}.subtitle`} value={sub} tag="span" />
                </p>
                <h3 style={{ margin: "0 0 8px", fontFamily: FONT, fontSize: "1.15rem", fontWeight: 500, color: DARK, letterSpacing: "0.02em" }}>
                  <GenericEditableText sectionId={sectionId} field={`items.${i}.title`} value={t} tag="span" />
                </h3>
                <p style={{ margin: "0 0 14px", fontFamily: FONT_B, fontSize: "0.85rem", fontWeight: 400, color: MUTED, lineHeight: 1.6 }}>
                  <GenericEditableText sectionId={sectionId} field={`items.${i}.description`} value={desc} tag="span" />
                </p>
                <span className="o02-svc-arrow" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontFamily: FONT, fontSize: "0.78rem", fontWeight: 600, color: BEIGE, letterSpacing: "0.05em", transition: "color 0.3s, gap 0.3s" }}>
                  <GenericEditableText sectionId={sectionId} field={`items.${i}.ctaLabel`} value={ctaLabel} tag="span" />
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="o02-svc-arrow-icon"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </span>
              </div>
            </a>
          );
        })}
      </div>
    </section>
  );
}

// ── lawyer-01-services ────────────────────────────────────────────────────────
// Bílé bg, centrovaný navy H2 + perex, 3-col grid karet:
// SVG ikona (tematická) + H3 navy + popis šedý, hover → navy box-shadow
// ─────────────────────────────────────────────────────────────────────────────
function ServicesLawyer01({ content, sectionId, tenantSlug, isAdmin }: { content: Record<string, unknown>; sectionId: number; tenantSlug?: string; isAdmin?: boolean }) {
  const NAVY     = "#141760";
  const CRIMSON  = "#a70336";
  const WORDFONT = "'Raleway','Montserrat','Helvetica Neue',Arial,sans-serif";
  const BODYFONT = "'Open Sans','Source Sans 3','Helvetica Neue',Arial,sans-serif";

  const eyebrowRaw = content.eyebrow;
  const titleRaw   = content.title;
  const leadRaw    = content.lead;
  const eyebrow  = eyebrowRaw === undefined ? "Naše specializace" : String(eyebrowRaw);
  const title    = titleRaw   === undefined ? "Oblasti práva" : String(titleRaw);
  const lead     = leadRaw    === undefined ? "Pokrýváme všechny klíčové oblasti komerčního práva pro domácí i zahraniční klienty." : String(leadRaw);
  const linkLabel = String(content.linkLabel ?? "Zjistit více");
  const showHeader = !!(eyebrow.trim() || title.trim() || lead.trim());
  const items = (content.items as Array<{ name: string; description: string; icon?: string; href?: string }>) ?? [];
  const siteMode = String(content.siteMode ?? "multipage");
  const resolve  = (href: string) => resolveNavHref(href, siteMode, tenantSlug, isAdmin);

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
    <section id="sluzby" data-template="lawyer-01" style={{ backgroundColor: "#ffffff", padding: "clamp(72px,9vw,112px) 0", fontFamily: BODYFONT, opacity: 1 }}>
      <style>{`
        @keyframes l01svcUp{from{opacity:0;transform:translateY(24px);}to{opacity:1;transform:translateY(0);}}
        .l01svc-rise{opacity:0;animation:l01svcUp .7s cubic-bezier(.2,.7,.2,1) both;}
        .l01svc-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:26px;}
        .l01svc-card{position:relative;display:flex;flex-direction:column;gap:18px;background:#fff;border:1px solid #e6e8ef;padding:38px 34px;text-decoration:none;overflow:hidden;transition:transform .3s cubic-bezier(.2,.7,.2,1),box-shadow .3s ease,border-color .3s ease;}
        .l01svc-card::before{content:"";position:absolute;left:0;top:0;bottom:0;width:3px;background:${CRIMSON};transform:scaleY(0);transform-origin:top;transition:transform .34s cubic-bezier(.4,0,.2,1);}
        .l01svc-card:hover{transform:translateY(-5px);box-shadow:0 22px 48px rgba(20,23,96,.14);border-color:rgba(20,23,96,.18);}
        .l01svc-card:hover::before{transform:scaleY(1);}
        .l01svc-ic{display:inline-flex;align-items:center;justify-content:center;width:58px;height:58px;background:rgba(20,23,96,.06);color:${NAVY};flex-shrink:0;transition:background .32s ease,color .32s ease,transform .38s cubic-bezier(.34,1.56,.64,1);}
        .l01svc-card:hover .l01svc-ic{background:${NAVY};color:#fff;transform:scale(1.06);}
        .l01svc-more{margin-top:auto;padding-top:6px;display:inline-flex;align-items:center;gap:7px;color:${CRIMSON};font-weight:700;font-size:.78rem;letter-spacing:.08em;text-transform:uppercase;}
        .l01svc-more svg{transition:transform .3s ease;}
        .l01svc-card:hover .l01svc-more svg{transform:translateX(5px);}
        @media (max-width: 900px) { .l01svc-grid { grid-template-columns: repeat(2,1fr); } }
        @media (max-width: 560px) { .l01svc-grid { grid-template-columns: 1fr; } }
      `}</style>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 clamp(16px,4vw,40px)" }}>

        {showHeader && (
          <div className="l01svc-rise" style={{ textAlign: "center", marginBottom: 60, maxWidth: 620, marginLeft: "auto", marginRight: "auto" }}>
            {eyebrow.trim() && (
              <div style={{ display: "inline-flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
                <span style={{ display: "block", width: 30, height: 2, background: CRIMSON }} />
                <GenericEditableText sectionId={sectionId} field="eyebrow" value={eyebrow} tag="span"
                  style={{ fontFamily: BODYFONT, fontWeight: 700, fontSize: "0.78rem", letterSpacing: "0.2em", textTransform: "uppercase", color: CRIMSON }} />
                <span style={{ display: "block", width: 30, height: 2, background: CRIMSON }} />
              </div>
            )}
            {title.trim() && (
              <h2 style={{ fontFamily: WORDFONT, fontWeight: 700, fontSize: "clamp(1.7rem,3vw,2.5rem)", color: NAVY, margin: "0 0 16px", letterSpacing: "-0.01em" }}>
                <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
              </h2>
            )}
            {lead.trim() && (
              <p style={{ fontFamily: BODYFONT, fontWeight: 400, fontSize: "1.05rem", color: "#6b7280", margin: 0, lineHeight: 1.65 }}>
                <GenericEditableText sectionId={sectionId} field="lead" value={lead} tag="span" />
              </p>
            )}
          </div>
        )}

        <div className="l01svc-grid">
          {items.map((item, i) => (
            <a
              key={i}
              href={resolve(item.href ?? "/sluzby")}
              className="l01svc-card l01svc-rise"
              style={{ animationDelay: `${0.05 + i * 0.06}s` }}
            >
              <span className="l01svc-ic">{iconMap[item.icon ?? ""] ?? fallbackIcon}</span>
              <div>
                <h3 style={{ fontFamily: WORDFONT, fontWeight: 600, fontSize: "1.12rem", color: NAVY, margin: "0 0 10px", lineHeight: 1.3 }}>
                  <GenericEditableText sectionId={sectionId} field={`items.${i}.name`} value={item.name} tag="span" />
                </h3>
                <p style={{ fontFamily: BODYFONT, fontWeight: 400, fontSize: "0.92rem", color: "#6b7280", margin: 0, lineHeight: 1.68 }}>
                  <GenericEditableText sectionId={sectionId} field={`items.${i}.description`} value={item.description} tag="span" />
                </p>
              </div>
              <span className="l01svc-more">
                <GenericEditableText sectionId={sectionId} field="linkLabel" value={linkLabel} tag="span" />
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Stavba-01 Services ──────────────────────────────────────────────────────
// ── rekonstrukce-01-services ──────────────────────────────────────────────────
// 8 icon karet (construction lucide ikony) s hover lift + amber icon accent.
// Conditional header (showHeader pattern) — na /sluzby subpage se skryje duplicitní H2.
// ──────────────────────────────────────────────────────────────────────────────
function ServicesRekonstrukce01({ content, sectionId, tenantSlug, isAdmin }: { content: Record<string, unknown>; sectionId: number; tenantSlug?: string; isAdmin: boolean }) {
  const AMBER  = "#C2622B";
  const AMBER2 = "#A24E1F";
  const DARK   = "#1F1B17";
  const MUTED  = "#7A7066";
  const BG     = "#FAF7F2";
  const CREAM  = "#F2ECE3";
  const FONT   = "'Inter', sans-serif";

  type Svc = { icon?: string; title?: string; text?: string };
  const items: Svc[] = (content.items as Svc[]) ?? [];

  const eyebrowRaw  = (content as Record<string, unknown>).eyebrow;
  const titleRaw    = (content as Record<string, unknown>).title;
  const subtitleRaw = (content as Record<string, unknown>).subtitle;
  const eyebrow  = eyebrowRaw  === undefined ? "Naše činnosti" : String(eyebrowRaw);
  const title    = titleRaw    === undefined ? "Zajišťujeme kompletní rekonstrukce interiérů" : String(titleRaw);
  const subtitle = subtitleRaw === undefined ? "Od prvního návrhu po finální předání — postaráme se o vše." : String(subtitleRaw);
  const showHeader = !!(eyebrow.trim() || title.trim() || subtitle.trim());
  void tenantSlug; void isAdmin;

  const Icon = ({ name }: { name: string }) => {
    const p = { width: 26, height: 26, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.7, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true };
    switch (name) {
      case "home":
      case "house": return (<svg {...p}><path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V21h14V9.5"/><path d="M9.5 21v-6h5v6"/></svg>);
      case "bath": return (<svg {...p}><path d="M4 12V5.5A1.5 1.5 0 0 1 5.5 4a1.5 1.5 0 0 1 1.5 1.5"/><path d="m6 6 1.5 1.5"/><path d="M3 12h18v3a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4z"/><path d="M6 19v1.5"/><path d="M18 19v1.5"/></svg>);
      case "droplet": return (<svg {...p}><path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5S12.5 5 12 2.5C11.5 5 10 7.4 8 9.5 6 11.1 5 13 5 15a7 7 0 0 0 7 7z"/></svg>);
      case "layers": return (<svg {...p}><path d="M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83z"/><path d="m6 9.5-3.4 1.58a1 1 0 0 0 0 1.81l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83L18 9.5"/></svg>);
      case "hammer": return (<svg {...p}><path d="m15 12-8.5 8.5a1.4 1.4 0 0 1-2-2L13 10"/><path d="m17.6 14.6 3.4-3.4"/><path d="M11.5 8.5 15 5l2 .5V4l-2-2-3 .3a5 5 0 0 0 1 4l-1.5 1.5z"/></svg>);
      case "shovel": return (<svg {...p}><path d="M2 22v-4l4-4 4 4-4 4z"/><path d="M8.5 15.5 15 9"/><path d="m15.5 3.5 5 5-1 1a3.2 3.2 0 0 1-4.5-4.5z"/></svg>);
      case "hardhat": return (<svg {...p}><path d="M2 18a1 1 0 0 0 1 1h18a1 1 0 0 0 1-1v-1a1 1 0 0 0-1-1H3a1 1 0 0 0-1 1z"/><path d="M10 10V5.5A1.5 1.5 0 0 1 11.5 4h1A1.5 1.5 0 0 1 14 5.5V10"/><path d="M4.5 15v-2a5.5 5.5 0 0 1 5-5.5"/><path d="M14.5 7.5a5.5 5.5 0 0 1 5 5.5v2"/></svg>);
      default: return (<svg {...p}><circle cx="12" cy="12" r="9"/></svg>);
    }
  };

  return (
    <section id={String(content.id ?? "cinnosti")} style={{ backgroundColor: BG, fontFamily: FONT, padding: "clamp(64px,9vw,110px) 0", opacity: 1 }} data-template="rekonstrukce-01">
      <style>{`
        .rk01svc-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:22px;}
        .rk01svc-card{position:relative;background:#fff;border:1px solid ${CREAM};border-radius:18px;padding:30px 26px 28px;box-shadow:0 2px 12px rgba(60,40,20,.05);transition:transform .28s cubic-bezier(.2,.7,.2,1),box-shadow .28s ease,border-color .28s ease;overflow:hidden;}
        .rk01svc-card::after{content:"";position:absolute;bottom:0;left:0;height:3px;width:100%;background:linear-gradient(90deg,${AMBER},${AMBER2});transform:scaleX(0);transform-origin:left;transition:transform .32s cubic-bezier(.4,0,.2,1);}
        .rk01svc-card:hover{transform:translateY(-6px);box-shadow:0 22px 50px rgba(60,40,20,.12);border-color:rgba(194,98,43,.28);}
        .rk01svc-card:hover::after{transform:scaleX(1);}
        .rk01svc-ic{display:inline-flex;align-items:center;justify-content:center;width:56px;height:56px;border-radius:14px;background:linear-gradient(140deg,rgba(194,98,43,.13),rgba(162,78,31,.09));color:${AMBER2};margin-bottom:18px;transition:transform .35s cubic-bezier(.34,1.56,.64,1),background .3s ease,color .3s ease;}
        .rk01svc-card:hover .rk01svc-ic{transform:scale(1.08) rotate(-5deg);background:linear-gradient(140deg,${AMBER},${AMBER2});color:#fff;}
        @media(max-width:1080px){.rk01svc-grid{grid-template-columns:repeat(2,1fr);}}
        @media(max-width:560px){.rk01svc-grid{grid-template-columns:1fr;}}
      `}</style>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 32px" }}>
        {showHeader && (
          <div style={{ maxWidth: 680, marginBottom: 52 }}>
            {eyebrow.trim() && (
              <div style={{ display: "inline-flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                <span style={{ display: "block", width: 30, height: 2, background: AMBER, borderRadius: 2 }} />
                <span style={{ color: AMBER2, fontSize: "0.78rem", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase" }}>
                  <GenericEditableText sectionId={sectionId} field="eyebrow" value={eyebrow} tag="span" />
                </span>
              </div>
            )}
            {title.trim() && (
              <h2 style={{ color: DARK, fontSize: "clamp(28px,4vw,46px)", fontWeight: 800, lineHeight: 1.12, letterSpacing: "-0.02em", margin: "0 0 14px" }}>
                <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
              </h2>
            )}
            {subtitle.trim() && (
              <p style={{ color: MUTED, fontSize: "1.05rem", lineHeight: 1.6, margin: 0 }}>
                <GenericEditableText sectionId={sectionId} field="subtitle" value={subtitle} tag="span" />
              </p>
            )}
          </div>
        )}

        <div className="rk01svc-grid">
          {items.map((it, i) => (
            <div key={i} className="rk01svc-card">
              <span className="rk01svc-ic"><Icon name={String(it.icon ?? "layers")} /></span>
              <h3 style={{ color: DARK, fontSize: "1.06rem", fontWeight: 700, margin: "0 0 9px", lineHeight: 1.3, letterSpacing: "-0.01em" }}>
                <GenericEditableText sectionId={sectionId} field={`items.${i}.title`} value={String(it.title ?? "")} tag="span" />
              </h3>
              <p style={{ color: MUTED, fontSize: "0.9rem", lineHeight: 1.62, margin: 0 }}>
                <GenericEditableText sectionId={sectionId} field={`items.${i}.text`} value={String(it.text ?? "")} tag="span" />
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ServicesStavba01({ content, sectionId, tenantSlug, isAdmin }: { content: Record<string, unknown>; sectionId: number; tenantSlug?: string; isAdmin?: boolean }) {
  const ORANGE = "#FF6F0D";
  const DARK   = "#1a1a1a";
  const GRAY   = "#6b6b6b";
  const BG     = "#f8f7f4";
  const FONT   = "'Inter', sans-serif";

  interface ServiceItem { name: string; description: string; image?: string; ctaText?: string; ctaHref?: string; }

  const taglineRaw  = content.tagline;
  const titleRaw    = content.title;
  const subtitleRaw = content.subtitle;
  const tagline  = taglineRaw  === undefined ? "Co umíme" : String(taglineRaw);
  const title    = titleRaw    === undefined ? "Naše stavební\nslužby" : String(titleRaw);
  const subtitle = subtitleRaw === undefined ? "" : String(subtitleRaw);
  const showHeader = !!(tagline.trim() || title.trim() || subtitle.trim());
  const items   = (content.items as ServiceItem[]) ?? [];

  const siteMode = String(content.siteMode ?? "multipage");
  const resolve = (href: string) => resolveNavHref(href, siteMode, tenantSlug, isAdmin);

  const gridRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;
    const cards = Array.from(grid.querySelectorAll<HTMLElement>(".s01-svc-card"));
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          const el = e.target as HTMLElement;
          const idx = cards.indexOf(el);
          el.style.animationDelay = `${Math.max(0, idx) * 0.1}s`;
          el.classList.add("s01-svc-vis");
          obs.unobserve(el);
        }
      });
    }, { threshold: 0.12 });
    cards.forEach((c) => obs.observe(c));
    return () => obs.disconnect();
  }, [items.length]);

  return (
    <section id={String(content.id ?? "sluzby")} style={{ backgroundColor: BG, fontFamily: FONT, padding: "clamp(64px,9vw,112px) 0" }} data-template="stavba-01">
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 32px" }}>

        {/* Header */}
        {showHeader && (
          <div style={{ marginBottom: 56, maxWidth: 640 }}>
            {tagline.trim() && (
              <div style={{ display: "inline-flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                <span style={{ display: "block", width: 30, height: 3, backgroundColor: ORANGE, borderRadius: 2 }} />
                <GenericEditableText sectionId={sectionId} field="tagline" value={tagline} tag="p"
                  style={{ color: ORANGE, fontSize: "0.78rem", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", margin: 0 }} />
              </div>
            )}
            {title.trim() && (
              <h2 style={{ color: DARK, fontSize: "clamp(28px,4vw,48px)", fontWeight: 800, lineHeight: 1.1, letterSpacing: "-0.02em", margin: 0, whiteSpace: "pre-line" }}>
                <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
              </h2>
            )}
            {subtitle.trim() && (
              <p style={{ color: GRAY, fontSize: "1.02rem", lineHeight: 1.7, margin: "18px 0 0" }}>
                <GenericEditableText sectionId={sectionId} field="subtitle" value={subtitle} tag="span" />
              </p>
            )}
          </div>
        )}

        {/* Cards grid */}
        <div ref={gridRef} className="stavba-services-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 24 }}>
          {items.map((item, i) => (
            <div
              key={i}
              className="s01-svc-card"
              style={{ backgroundColor: "#ffffff", borderRadius: 16, overflow: "hidden", display: "flex", flexDirection: "column", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}
            >
              {/* Image */}
              {item.image && (
                <div style={{ position: "relative", aspectRatio: "16/10", overflow: "hidden" }}>
                  <GenericEditableImage sectionId={sectionId} field={`items.${i}.image`} src={item.image} alt={item.name} className="absolute inset-0 w-full h-full" style={{ height: "100%" }}>
                    <Image src={item.image} alt={item.name} fill className="object-cover s01-svc-img" sizes="(max-width:768px) 100vw, 25vw" unoptimized={shouldSkipNextImageOptimization(item.image)} />
                  </GenericEditableImage>
                  {/* Orange accent bar (widens on hover) */}
                  <div className="s01-svc-bar" style={{ position: "absolute", bottom: 0, left: 0, width: 48, height: 4, backgroundColor: ORANGE, zIndex: 1 }} />
                </div>
              )}

              {/* Body */}
              <div style={{ padding: "24px 24px 22px", display: "flex", flexDirection: "column", flex: 1, gap: 10 }}>
                <h3 className="s01-svc-title" style={{ color: DARK, fontSize: "1.05rem", fontWeight: 700, margin: 0, lineHeight: 1.3 }}>
                  <GenericEditableText sectionId={sectionId} field={`items.${i}.name`} value={item.name} tag="span" />
                </h3>
                <p style={{ color: GRAY, fontSize: "0.875rem", lineHeight: 1.65, margin: 0, flex: 1 }}>
                  <GenericEditableText sectionId={sectionId} field={`items.${i}.description`} value={item.description} tag="span" />
                </p>
                {item.ctaText && item.ctaHref && (
                  <a
                    href={resolve(item.ctaHref)}
                    data-btn="primary"
                    className="s01-svc-link"
                    style={{ display: "inline-flex", alignItems: "center", gap: 7, color: ORANGE, fontSize: "0.82rem", fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase", textDecoration: "none", marginTop: 6 }}
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

function ServicesLegal02({ content, sectionId, tenantSlug, isAdmin }: { content: Record<string, unknown>; sectionId: number; tenantSlug?: string; isAdmin: boolean }) {
  const c = content as Record<string, unknown>;

  const NAVY  = "#143171";
  const FONT_B = "'bw_gradualbold', 'Montserrat', 'Helvetica Neue', Arial, sans-serif";
  const FONT_R = "'Open Sans', 'Helvetica Neue', Arial, sans-serif";

  const eyebrowRaw  = c.eyebrow;
  const titleRaw    = c.title;
  const subtitleRaw = c.subtitle;
  const eyebrow  = eyebrowRaw  === undefined ? "Naše specializace" : String(eyebrowRaw);
  const title    = titleRaw    === undefined ? "Komplexní právní péče\nve všech oblastech" : String(titleRaw);
  const subtitle = subtitleRaw === undefined ? "Specializujeme se tam, kde se věci komplikují — a přinášíme řešení, která obstojí." : String(subtitleRaw);
  const showHeader = !!(eyebrow.trim() || title.trim() || subtitle.trim());

  const ctaText  = String(c.ctaText  ?? "Zobrazit všechny služby");
  const ctaHref  = String(c.ctaHref  ?? "/sluzby");
  const siteMode = String(c.siteMode ?? "multipage");
  const resolve  = (href: string) => resolveNavHref(href, siteMode, tenantSlug, isAdmin);

  type Group = { name: string; items: string[] };
  const groups: Group[] = Array.isArray(c.groups) ? (c.groups as Group[]) : [
    { name: "Sektory",       items: ["Bankovnictví a další finanční služby", "Doprava a logistika", "Energetika, vodní a odpadové hospodářství", "IT a telekomunikace", "Média a související služby", "Nemovitosti a stavebnictví"] },
    { name: "Specializace",  items: ["Arbitráže", "Bankovní a finanční právo", "Daně a daňové spory", "Duševní vlastnictví", "Energetika a životní prostředí", "Fúze, akvizice a korporátní právo"] },
  ];

  const Arrow = () => (
    <svg className="l02s-item-arrow" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 12h14M12 5l7 7-7 7"/>
    </svg>
  );

  return (
    <section id="sluzby" data-template="legal-02" style={{ backgroundColor: "#fff", padding: "clamp(72px,9vw,110px) 0" }}>
      <style>{`
        @font-face { font-family:'bw_gradualbold';    src:url('/templates/legal-02/bwgradual-bold-webfont.woff2')    format('woff2'); font-display:swap; }
        @font-face { font-family:'bw_gradualregular'; src:url('/templates/legal-02/bwgradual-regular-webfont.woff2') format('woff2'); font-display:swap; }
        @media (max-width: 768px) {
          .l02s-groups { flex-direction: column !important; gap: 44px !important; }
          .l02s-group  { width: 100% !important; }
          .l02s-outer  { padding-left: 24px !important; padding-right: 24px !important; }
        }
      `}</style>

      <div className="l02s-outer" style={{ maxWidth: 1440, margin: "0 auto", padding: "0 80px" }}>

        {/* Header */}
        {showHeader && (
          <div style={{ maxWidth: 760, marginBottom: 64 }}>
            {eyebrow.trim() && (
              <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
                <span style={{ width: 40, height: 2, background: "#EB5C2E", display: "block" }} />
                <GenericEditableText sectionId={sectionId} field="eyebrow" value={eyebrow} tag="p"
                  style={{ fontFamily: FONT_B, fontSize: 13, letterSpacing: "0.16em", textTransform: "uppercase", color: "#EB5C2E", margin: 0 }} />
              </div>
            )}
            {title.trim() && (
              <GenericEditableText sectionId={sectionId} field="title" value={title} tag="h2"
                style={{ fontFamily: FONT_B, fontSize: "clamp(32px,3.8vw,48px)", lineHeight: 1.1, color: NAVY, margin: "0 0 22px", whiteSpace: "pre-line", letterSpacing: "-0.01em" }} />
            )}
            {subtitle.trim() && (
              <GenericEditableText sectionId={sectionId} field="subtitle" value={subtitle} tag="p"
                style={{ fontFamily: FONT_R, fontSize: 19, lineHeight: 1.6, color: "#4b5563", margin: 0 }} />
            )}
          </div>
        )}

        {/* Two-column groups */}
        <div className="l02s-groups" style={{ display: "flex", gap: 56 }}>
          {groups.map((group, gi) => (
            <div key={gi} className="l02s-group" style={{ width: "50%" }}>
              <h3 className="l02s-group-head" style={{ fontFamily: FONT_B, fontSize: "clamp(24px,2.4vw,30px)", lineHeight: 1.2, color: NAVY, margin: "0 0 26px" }}>
                <GenericEditableText sectionId={sectionId} field={`groups.${gi}.name`} value={group.name} tag="span" />
              </h3>
              <ul style={{ listStyle: "none", margin: "0 0 20px", padding: 0, borderTop: "1px solid #e3e7ef" }}>
                {group.items.map((item, ii) => (
                  <li key={ii} className="l02s-item">
                    <a href={resolve(ctaHref)}>
                      <GenericEditableText sectionId={sectionId} field={`groups.${gi}.items.${ii}`} value={item} tag="span" />
                      <Arrow />
                    </a>
                  </li>
                ))}
              </ul>
              {/* CTA only on last group */}
              {gi === groups.length - 1 && (
                <a href={resolve(ctaHref)} data-btn="primary" className="l02s-cta"
                  style={{ display: "inline-flex", alignItems: "center", gap: 10, border: `2px solid ${NAVY}`, borderRadius: 40, color: NAVY, padding: "15px 42px", marginTop: 10, fontFamily: FONT_B, fontSize: 17, textDecoration: "none" }}>
                  <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
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

// ── legal-02-career ── kariérní stránka: lead + benefity + otevřené pozice ───────
function CareerLegal02({ content, sectionId, tenantSlug, isAdmin }: { content: Record<string, unknown>; sectionId: number; tenantSlug?: string; isAdmin: boolean }) {
  const c = content as Record<string, unknown>;
  const NAVY  = "#143171";
  const ORANGE = "#EB5C2E";
  const FONT_B = "'bw_gradualbold', 'Montserrat', 'Helvetica Neue', Arial, sans-serif";
  const FONT_R = "'Open Sans', 'Helvetica Neue', Arial, sans-serif";
  const siteMode = String(c.siteMode ?? "multipage");
  const resolve = (href: string) => resolveNavHref(href, siteMode, tenantSlug, isAdmin);

  const lead = String(c.lead ?? "V DOLEŽAL & PARTNEŘI stavíme na lidech. Nabízíme prostředí, kde talentovaní právníci rostou po boku zkušených partnerů, pracují na významných kauzách předních klientů a mají reálný vliv na výsledek.");
  const benefitsTitle = String(c.benefitsTitle ?? "Proč pracovat u nás");
  const positionsTitle = String(c.positionsTitle ?? "Otevřené pozice");
  const applyLabel = String(c.applyLabel ?? "Mám zájem");
  const ctaHref = String(c.ctaHref ?? "/kontakt");

  type Benefit = { icon?: string; title?: string; text?: string };
  const benefits: Benefit[] = Array.isArray(c.benefits) ? c.benefits as Benefit[] : [
    { icon: "growth", title: "Kariérní růst", text: "Jasná cesta od koncipienta k partnerovi s pravidelným hodnocením a mentoringem." },
    { icon: "cases",  title: "Významné kauzy", text: "Přeshraniční transakce, arbitráže a regulatorní řízení pro přední klienty." },
    { icon: "learn",  title: "Vzdělávání", text: "Interní akademie, konference a plně hrazené odborné certifikace." },
    { icon: "balance",title: "Rovnováha", text: "Flexibilní režim, 5 týdnů dovolené a péče o duševní i fyzickou pohodu." },
  ];

  type Position = { title?: string; location?: string; type?: string };
  const positions: Position[] = Array.isArray(c.positions) ? c.positions as Position[] : [
    { title: "Advokátní koncipient/ka — Korporátní právo", location: "Praha", type: "Plný úvazek" },
    { title: "Senior advokát/ka — Soutěžní právo",          location: "Praha", type: "Plný úvazek" },
    { title: "Paralegal — Insolvence",                       location: "Praha", type: "Plný / částečný" },
    { title: "Studentská stáž — Právní tým",                 location: "Praha", type: "Stáž" },
  ];

  const BIcon = ({ icon }: { icon?: string }) => {
    const p = { width: 26, height: 26, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.7, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true };
    if (icon === "growth")  return <svg {...p}><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>;
    if (icon === "cases")   return <svg {...p}><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>;
    if (icon === "learn")   return <svg {...p}><path d="M22 10 12 5 2 10l10 5 10-5z"/><path d="M6 12v5c0 1 2 3 6 3s6-2 6-3v-5"/></svg>;
    return <svg {...p}><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>;
  };

  return (
    <section id="kariera" data-template="legal-02" style={{ backgroundColor: "#fff", padding: "clamp(64px,8vw,96px) 0" }}>
      <style>{`
        @font-face { font-family:'bw_gradualbold'; src:url('/templates/legal-02/bwgradual-bold-webfont.woff2') format('woff2'); font-display:swap; }
        .l02k-benefits { display:grid; grid-template-columns:repeat(4,1fr); gap:24px; }
        .l02k-pos { display:flex; align-items:center; justify-content:space-between; gap:24px; padding:26px 30px; border:1px solid #e3e7ef; background:#fff; }
        @media (max-width:900px){ .l02k-benefits { grid-template-columns:repeat(2,1fr); } .l02k-outer { padding-left:24px !important; padding-right:24px !important; } }
        @media (max-width:620px){ .l02k-benefits { grid-template-columns:1fr; } .l02k-pos { flex-direction:column; align-items:flex-start; } }
      `}</style>

      <div className="l02k-outer" style={{ maxWidth: 1180, margin: "0 auto", padding: "0 80px" }}>
        {/* Lead */}
        <GenericEditableText sectionId={sectionId} field="lead" value={lead} tag="p"
          style={{ fontFamily: FONT_R, fontSize: "clamp(19px,2vw,25px)", lineHeight: 1.55, color: NAVY, margin: "0 0 64px", maxWidth: 860, fontWeight: 400 }} />

        {/* Benefits */}
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 28 }}>
          <span style={{ width: 40, height: 2, background: ORANGE, display: "block" }} />
          <GenericEditableText sectionId={sectionId} field="benefitsTitle" value={benefitsTitle} tag="p"
            style={{ fontFamily: FONT_B, fontSize: 13, letterSpacing: "0.16em", textTransform: "uppercase", color: ORANGE, margin: 0 }} />
        </div>
        <div className="l02k-benefits" style={{ marginBottom: 72 }}>
          {benefits.map((b, i) => (
            <div key={i} className="l02k-benefit" style={{ padding: "32px 26px", background: "#F6F8FB", borderTop: `3px solid ${ORANGE}` }}>
              <span style={{ color: ORANGE, display: "block", marginBottom: 18 }}><BIcon icon={b.icon} /></span>
              <GenericEditableText sectionId={sectionId} field={`benefits.${i}.title`} value={b.title ?? ""} tag="h3"
                style={{ fontFamily: FONT_B, fontSize: 19, lineHeight: 1.25, color: NAVY, margin: "0 0 10px" }} />
              <GenericEditableText sectionId={sectionId} field={`benefits.${i}.text`} value={b.text ?? ""} tag="p"
                style={{ fontFamily: FONT_R, fontSize: 14.5, lineHeight: 1.6, color: "#6b7280", margin: 0 }} />
            </div>
          ))}
        </div>

        {/* Positions */}
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 28 }}>
          <span style={{ width: 40, height: 2, background: ORANGE, display: "block" }} />
          <GenericEditableText sectionId={sectionId} field="positionsTitle" value={positionsTitle} tag="p"
            style={{ fontFamily: FONT_B, fontSize: 13, letterSpacing: "0.16em", textTransform: "uppercase", color: ORANGE, margin: 0 }} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {positions.map((p, i) => (
            <div key={i} className="l02k-pos">
              <div>
                <GenericEditableText sectionId={sectionId} field={`positions.${i}.title`} value={p.title ?? ""} tag="h3"
                  style={{ fontFamily: FONT_B, fontSize: 19, lineHeight: 1.3, color: NAVY, margin: "0 0 6px" }} />
                <p style={{ fontFamily: FONT_R, fontSize: 14, color: "#6b7280", margin: 0, display: "flex", gap: 16, flexWrap: "wrap" }}>
                  <GenericEditableText sectionId={sectionId} field={`positions.${i}.location`} value={p.location ?? ""} tag="span" />
                  <GenericEditableText sectionId={sectionId} field={`positions.${i}.type`} value={p.type ?? ""} tag="span" style={{ color: ORANGE }} />
                </p>
              </div>
              <a href={resolve(ctaHref)} className="l02k-apply" style={{ flexShrink: 0, display: "inline-flex", alignItems: "center", gap: 8, border: `2px solid ${NAVY}`, borderRadius: 40, color: NAVY, padding: "12px 28px", fontFamily: FONT_B, fontSize: 15, textDecoration: "none" }}>
                <GenericEditableText sectionId={sectionId} field="applyLabel" value={applyLabel} tag="span" />
                <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </a>
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

  const kickerRaw  = (content as Record<string, unknown>).kicker;
  const titleRaw   = (content as Record<string, unknown>).title;
  const kicker = kickerRaw === undefined ? "Specializace" : String(kickerRaw);
  const title  = titleRaw  === undefined ? "Služby na míru" : String(titleRaw);
  const showHeader = !!(kicker.trim() || title.trim());

  interface ServiceItem { title: string; description: string; ctaText?: string; ctaHref?: string; icon?: string; }
  const items = (content.items as ServiceItem[]) ?? [];

  const siteMode = String((content as Record<string, unknown>).siteMode ?? "multipage");
  const resolve = (href: string) => resolveNavHref(href, siteMode, tenantSlug, isAdmin);

  const LightningIcon = () => (
    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke={RED} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
    </svg>
  );
  const ShieldIcon = () => (
    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke={RED} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
  );

  return (
    <section id="sluzby" style={{ backgroundColor: "#f5f5f5", fontFamily: FONT, padding: "clamp(64px,9vw,110px) 0" }} data-template="elektro-01">
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 32px" }}>

        {showHeader && (
          <div style={{ marginBottom: 56, textAlign: "center" }}>
            {kicker.trim() && (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 14, marginBottom: 14 }}>
                <span style={{ width: 32, height: 2, background: RED, display: "block" }} />
                <GenericEditableText sectionId={sectionId} field="kicker" value={kicker} tag="p"
                  style={{ color: RED, fontSize: "0.73rem", fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", margin: 0, fontFamily: FONT }} />
                <span style={{ width: 32, height: 2, background: RED, display: "block" }} />
              </div>
            )}
            {title.trim() && (
              <h2 style={{ color: DARK, fontSize: "clamp(26px,3.5vw,44px)", fontWeight: 800, lineHeight: 1.08, letterSpacing: "-0.02em", margin: 0, fontFamily: FONT }}>
                <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
              </h2>
            )}
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 32 }}>
          {items.map((item, i) => (
            <div
              key={i}
              className="e01-service-card"
              style={{
                backgroundColor: DARK, padding: "52px 44px", display: "flex", flexDirection: "column",
                borderLeft: `3px solid ${RED}`,
                transition: "transform 0.28s ease, box-shadow 0.28s ease",
              }}
            >
              <div className="e01-service-icon" style={{ marginBottom: 28, transition: "transform 0.3s ease" }}>
                {item.icon === "lightning" ? <LightningIcon /> : <ShieldIcon />}
              </div>

              <h3 style={{ color: WHITE, fontSize: "clamp(20px,2vw,28px)", fontWeight: 700, lineHeight: 1.15, letterSpacing: "-0.01em", margin: "0 0 18px", fontFamily: FONT }}>
                <GenericEditableText sectionId={sectionId} field={`items.${i}.title`} value={item.title} tag="span" />
              </h3>

              <p style={{ color: "rgba(255,255,255,0.65)", fontSize: "0.93rem", lineHeight: 1.75, margin: "0 0 36px", fontFamily: RFONT, flex: 1 }}>
                <GenericEditableText sectionId={sectionId} field={`items.${i}.description`} value={item.description} tag="span" />
              </p>

              {item.ctaText && (
                <a
                  href={resolve(item.ctaHref ?? "/")}
                  className="e01-service-link"
                  style={{ display: "inline-flex", alignItems: "center", gap: 8, color: RED, textDecoration: "none", fontFamily: FONT, fontSize: "0.78rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", transition: "gap 0.25s ease" }}
                >
                  <GenericEditableText sectionId={sectionId} field={`items.${i}.ctaText`} value={item.ctaText} tag="span" />
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ transition: "transform 0.25s ease" }}><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </a>
              )}
            </div>
          ))}
        </div>
      </div>
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
  const bottomCtaText = String((content as Record<string, unknown>).bottomCtaText ?? "Zaslat poptávku");
  const bottomCtaHref = String((content as Record<string, unknown>).bottomCtaHref ?? "/kontakt");

  const siteMode = String((content as Record<string, unknown>).siteMode ?? "multipage");
  const resolve = (href: string) => resolveNavHref(href, siteMode, tenantSlug, isAdmin);

  const CheckIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={RED} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }} aria-hidden="true">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  );

  return (
    <section style={{ backgroundColor: "#ffffff", fontFamily: FONT, padding: "clamp(64px,9vw,110px) 0" }} data-template="elektro-01">
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 32px" }}>
        <div style={{ display: "grid", gridTemplateColumns: detailSections.length > 1 ? "repeat(auto-fit, minmax(320px, 1fr))" : "1fr", gap: 64 }}>
          {detailSections.map((sec, i) => (
            <div key={i}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 16, marginBottom: 24 }}>
                <span style={{ display: "block", width: 4, height: 40, backgroundColor: RED, flexShrink: 0, marginTop: 4 }} />
                <h2 style={{ color: DARK, fontSize: "clamp(22px,2.5vw,34px)", fontWeight: 700, lineHeight: 1.2, letterSpacing: "-0.01em", margin: 0, fontFamily: FONT }}>
                  <GenericEditableText sectionId={sectionId} field={`sections.${i}.title`} value={sec.title} tag="span" />
                </h2>
              </div>

              <p style={{ color: GRAY, fontSize: "1rem", lineHeight: 1.75, margin: "0 0 28px", fontFamily: RFONT }}>
                <GenericEditableText sectionId={sectionId} field={`sections.${i}.description`} value={sec.description} tag="span" />
              </p>

              {sec.items && sec.items.length > 0 && (
                <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 14 }}>
                  {sec.items.map((bullet, j) => (
                    <li key={j} className="e01-detail-bullet" style={{ display: "flex", alignItems: "flex-start", gap: 12, fontFamily: RFONT, fontSize: "0.95rem", color: DARK, transition: "padding-left 0.2s ease" }}>
                      <CheckIcon />
                      <GenericEditableText sectionId={sectionId} field={`sections.${i}.items.${j}`} value={bullet} tag="span" />
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>

        <div style={{ marginTop: 60, textAlign: "center" }}>
          <a
            href={resolve(bottomCtaHref)}
            className="e01-hero-cta"
            style={{ display: "inline-flex", alignItems: "center", gap: 10, backgroundColor: RED, color: "#ffffff", fontFamily: FONT, fontSize: "0.8rem", fontWeight: 700, padding: "16px 40px", borderRadius: 0, textDecoration: "none", textTransform: "uppercase", letterSpacing: "0.08em", transition: "background 0.25s ease, box-shadow 0.25s ease, transform 0.25s ease" }}
          >
            <GenericEditableText sectionId={sectionId} field="bottomCtaText" value={bottomCtaText} tag="span" />
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </a>
        </div>
      </div>
    </section>
  );
}

// ── stavba-02-services ────────────────────────────────────────────────────────
// Luxe redesign — cream bg, eyebrow + centered header (conditional for subpages),
// 8 icon-cards 4-col grid with brown top-accent bar, badge fill + arrow nudge on hover.
function ServicesStavba02({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const BROWN = "#674832";
  const CREAM = "#F8F5F0";
  const DARK  = "#3D2516";
  const MUTED = "#7A6454";
  const FONT  = "'Roboto', sans-serif";

  const eyebrowRaw  = (content as Record<string, unknown>).eyebrow;
  const titleRaw    = (content as Record<string, unknown>).title;
  const subtitleRaw = (content as Record<string, unknown>).subtitle;
  const eyebrow  = eyebrowRaw  === undefined ? "Naše činnosti" : String(eyebrowRaw);
  const title    = titleRaw    === undefined ? "Zajišťujeme kompletní rekonstrukce interiérů" : String(titleRaw);
  const subtitle = subtitleRaw === undefined ? "Od prvního návrhu po finální předání — postaráme se o vše." : String(subtitleRaw);
  const showHeader = !!(eyebrow.trim() || title.trim() || subtitle.trim());
  const sectionId2 = String(content.id ?? "cinnosti");

  type Item = { icon?: string; title: string; text?: string };
  const items = (content.items as Item[]) ?? [];

  const Icon = ({ name }: { name?: string }) => {
    const s = { width: 28, height: 28 };
    const props = { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "1.7", strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true, style: s };
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
    <section id={sectionId2} style={{ backgroundColor: CREAM, fontFamily: FONT, padding: "clamp(64px, 8vw, 104px) 0" }} data-template="stavba-02">
      <div style={{ maxWidth: 1220, margin: "0 auto", padding: "0 clamp(16px,4vw,36px)" }}>

        {/* Header */}
        {showHeader && (
          <div style={{ textAlign: "center", maxWidth: 660, margin: "0 auto clamp(44px,5vw,60px)" }}>
            {eyebrow.trim() && (
              <div style={{ display: "inline-flex", alignItems: "center", gap: 11, marginBottom: 16 }}>
                <span aria-hidden="true" style={{ width: 26, height: 2, background: "#C4956A", borderRadius: 2 }} />
                <GenericEditableText sectionId={sectionId} field="eyebrow" value={eyebrow} tag="span" style={{ fontFamily: FONT, color: BROWN, fontSize: "0.74rem", fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase" }} />
                <span aria-hidden="true" style={{ width: 26, height: 2, background: "#C4956A", borderRadius: 2 }} />
              </div>
            )}
            {title.trim() && (
              <h2 style={{ fontFamily: FONT, color: DARK, fontSize: "clamp(25px, 3.4vw, 41px)", fontWeight: 700, lineHeight: 1.16, letterSpacing: "-0.02em", margin: "0 0 14px" }}>
                <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
              </h2>
            )}
            {subtitle.trim() && (
              <p style={{ fontFamily: FONT, color: MUTED, fontSize: "clamp(14px, 1.4vw, 17px)", lineHeight: 1.66, margin: 0 }}>
                <GenericEditableText sectionId={sectionId} field="subtitle" value={subtitle} tag="span" />
              </p>
            )}
          </div>
        )}

        {/* Cards */}
        <div className="s02-srv-grid">
          {items.map((item, i) => (
            <div key={i} className="s02-srv-card" style={{ position: "relative", backgroundColor: "#fff", borderRadius: 14, padding: "30px 24px 26px", display: "flex", flexDirection: "column", gap: 13, border: "1px solid rgba(103,72,50,0.09)", boxShadow: "0 1px 4px rgba(61,37,22,0.06)", overflow: "hidden" }}>
              {/* Top accent bar */}
              <span className="s02-srv-accent" aria-hidden="true" style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: "linear-gradient(90deg, #674832, #C4956A)", transform: "scaleX(0)", transformOrigin: "left center" }} />
              {/* Icon */}
              <div className="s02-srv-badge" style={{ width: 54, height: 54, borderRadius: 12, backgroundColor: "rgba(103,72,50,0.09)", display: "flex", alignItems: "center", justifyContent: "center", color: BROWN, flexShrink: 0 }}>
                <Icon name={item.icon} />
              </div>
              {/* Title */}
              <h3 style={{ fontFamily: FONT, color: DARK, fontSize: "1.05rem", fontWeight: 700, lineHeight: 1.3, margin: "2px 0 0" }}>
                <GenericEditableText sectionId={sectionId} field={`items.${i}.title`} value={item.title} tag="span" />
              </h3>
              {/* Text */}
              {item.text && (
                <p style={{ fontFamily: FONT, color: MUTED, fontSize: "0.9rem", lineHeight: 1.6, margin: 0 }}>
                  <GenericEditableText sectionId={sectionId} field={`items.${i}.text`} value={item.text} tag="span" />
                </p>
              )}
              {/* Arrow */}
              <span className="s02-srv-arrow" aria-hidden="true" style={{ marginTop: "auto", paddingTop: 10, color: BROWN, display: "inline-flex", alignItems: "center", gap: 6, fontSize: "0.78rem", fontWeight: 600, letterSpacing: "0.04em", opacity: 0 }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
              </span>
            </div>
          ))}
        </div>
      </div>
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

  const kickerRaw   = (content as Record<string, unknown>).kicker;
  const headingRaw  = (content as Record<string, unknown>).heading;
  const subtitleRaw = (content as Record<string, unknown>).subtitle;
  const kicker   = kickerRaw   === undefined ? "Naše služby" : String(kickerRaw);
  const heading  = headingRaw  === undefined ? "Kvalita, profesionalita, spolehlivost a cenová dostupnost" : String(headingRaw);
  const subtitle = subtitleRaw === undefined ? "S námi proměníte své plány ve skutečnost" : String(subtitleRaw);
  const showHeader = !!(kicker.trim() || heading.trim() || subtitle.trim());
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
    <section id="sluzby" style={{ backgroundColor: DARK, fontFamily: FONT, padding: "88px 0" }} data-template="stavba-03">
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 32px" }}>

        {/* Header */}
        {showHeader && (
          <div style={{ textAlign: "center", marginBottom: 54 }}>
            {kicker.trim() && (
              <div style={{ display: "inline-flex", alignItems: "center", gap: 10, color: ORANGE, fontSize: "0.75rem", fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", marginBottom: 14 }}>
                <span aria-hidden="true" style={{ width: 24, height: 2, background: ORANGE }} />
                <GenericEditableText sectionId={sectionId} field="kicker" value={kicker} tag="span" />
                <span aria-hidden="true" style={{ width: 24, height: 2, background: ORANGE }} />
              </div>
            )}
            {heading.trim() && (
              <h2 style={{ color: WHITE, fontFamily: FONT, fontWeight: 800, fontSize: "clamp(1.6rem, 2.6vw, 2.2rem)", letterSpacing: "-0.02em", lineHeight: 1.2, margin: "0 0 12px", maxWidth: 720, marginLeft: "auto", marginRight: "auto" }}>
                <GenericEditableText sectionId={sectionId} field="heading" value={heading} tag="span" />
              </h2>
            )}
            {subtitle.trim() && (
              <p style={{ color: GRAY, fontSize: "0.98rem", margin: 0 }}>
                <GenericEditableText sectionId={sectionId} field="subtitle" value={subtitle} tag="span" />
              </p>
            )}
          </div>
        )}

        {/* Cards grid */}
        <div className="stavba03-srv-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24 }}>
          {items.map((item, i) => (
            <div
              key={i}
              className="st03-srv-card"
              style={{ position: "relative", backgroundColor: WHITE, padding: "38px 30px", borderRadius: 2, display: "flex", flexDirection: "column", gap: 15, overflow: "hidden" }}
            >
              <span className="st03-srv-bar" aria-hidden="true" style={{ position: "absolute", top: 0, left: 0, height: 3, width: "100%", background: ORANGE, transform: "scaleX(0)", transformOrigin: "left center" }} />
              {/* Icon */}
              <div className="st03-srv-icon" style={{ width: 54, height: 54, backgroundColor: "#fff5ec", borderRadius: 2, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color: ORANGE }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d={iconPath[item.icon] ?? iconPath.wrench}/>
                </svg>
              </div>

              {/* Title */}
              <h3 style={{ fontFamily: FONT, fontWeight: 700, fontSize: "1.05rem", color: DARK, lineHeight: 1.3, letterSpacing: "-0.01em", margin: 0 }}>
                <GenericEditableText sectionId={sectionId} field={`items.${i}.title`} value={item.title} tag="span" />
              </h3>

              {/* Description */}
              <p style={{ fontFamily: FONT, fontSize: "0.88rem", color: "#666", lineHeight: 1.65, margin: 0, flex: 1 }}>
                <GenericEditableText sectionId={sectionId} field={`items.${i}.description`} value={item.description} tag="span" />
              </p>

              {/* Arrow link */}
              <a
                href={resolve("#kontakt")}
                className="st03-srv-link"
                style={{ display: "inline-flex", alignItems: "center", gap: 7, color: ORANGE, fontFamily: FONT, fontSize: "0.85rem", fontWeight: 700, textDecoration: "none", marginTop: 4 }}
              >
                <GenericEditableText sectionId={sectionId} field={`items.${i}.ctaText`} value={String((item as Record<string,unknown>).ctaText ?? "Nezávazná poptávka")} tag="span" />
                <svg className="st03-srv-arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
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

  const kickerRaw   = content.kicker;
  const titleRaw    = content.title;
  const subtitleRaw = content.subtitle;
  const kicker   = kickerRaw   === undefined ? "Co pro vás děláme" : String(kickerRaw);
  const title    = titleRaw    === undefined ? "Komplexní servis pod jednou střechou" : String(titleRaw);
  const subtitle = subtitleRaw === undefined ? "Od drobné opravy po celkovou rekonstrukci rozvodů. Každá zakázka dostane stejnou pozornost a péči." : String(subtitleRaw);
  const items    = (content.items as Array<{ name: string; title: string; description: string; ctaText: string; ctaHref: string; image?: string }>) ?? [];

  const showHeader = !!(kicker.trim() || title.trim() || subtitle.trim());

  function resolveHref(href: string) {
    if (!href || href.startsWith("http") || href.startsWith("#")) return href;
    if (tenantSlug) {
      const base = isAdmin ? `/demo/${tenantSlug}/admin` : `/demo/${tenantSlug}`;
      return base + (href.startsWith("/") ? href : "/" + href);
    }
    return href;
  }

  return (
    <section id="sluzby" style={{ backgroundColor: DARK, fontFamily: FONT, padding: "100px 0" }} data-template="instala-01-services">
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 40px" }}>

        {/* Section header */}
        {showHeader && (
          <div style={{ textAlign: "center", marginBottom: 64 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
              <span style={{ width: 32, height: 2, background: YELLOW, borderRadius: 2, display: "block" }} />
              <span style={{ fontSize: "13px", fontWeight: 600, textTransform: "uppercase", color: YELLOW, letterSpacing: "0.14em" }}>
                <GenericEditableText sectionId={sectionId} field="kicker" value={kicker} tag="span" />
              </span>
              <span style={{ width: 32, height: 2, background: YELLOW, borderRadius: 2, display: "block" }} />
            </div>
            <h2 style={{ fontSize: "clamp(30px,3.5vw,48px)", fontWeight: 700, color: WHITE, lineHeight: 1.12, margin: "0 0 18px", letterSpacing: "-0.02em" }}>
              <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
            </h2>
            <p style={{ fontSize: "17px", fontWeight: 400, color: "rgba(255,255,255,0.7)", lineHeight: 1.65, maxWidth: 620, margin: "0 auto" }}>
              <GenericEditableText sectionId={sectionId} field="subtitle" value={subtitle} tag="span" />
            </p>
          </div>
        )}

        {/* Service cards grid */}
        <div className="i01-srv-grid" style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 24 }}>
          {items.map((item, i) => {
            const img = item.image ?? "";
            return (
              <div key={i} className="i01-srv-card" style={{ backgroundColor: WHITE, borderRadius: 12, overflow: "hidden", display: "flex", flexDirection: "column", position: "relative" }}>
                {/* Yellow top accent */}
                <div className="i01-srv-accent" style={{ position: "absolute", top: 0, left: 0, right: 0, height: 4, background: YELLOW, zIndex: 2, transformOrigin: "left", transform: "scaleX(0)", transition: "transform 0.4s cubic-bezier(.22,.61,.36,1)" }} />
                {/* Card image */}
                {img && (
                  <div className="i01-srv-img" style={{ position: "relative", height: 260, flexShrink: 0, overflow: "hidden" }}>
                    <GenericEditableImage sectionId={sectionId} field={`items.${i}.image`} src={img} alt={item.title} className="relative overflow-hidden w-full h-full" style={{ height: "100%" }}>
                      <Image src={img} alt={item.title} fill className="object-cover" sizes="(max-width:900px) 100vw, 50vw" unoptimized={shouldSkipNextImageOptimization(img)} />
                    </GenericEditableImage>
                  </div>
                )}
                {/* Card body */}
                <div style={{ padding: "28px 32px 32px", display: "flex", flexDirection: "column", flex: 1 }}>
                  <h3 style={{ fontSize: "22px", fontWeight: 700, color: DARK, margin: "0 0 10px", lineHeight: 1.25, letterSpacing: "-0.01em" }}>
                    <GenericEditableText sectionId={sectionId} field={`items.${i}.title`} value={item.title} tag="span" />
                  </h3>
                  <p style={{ fontSize: "15px", color: "#6b7280", lineHeight: 1.65, margin: "0 0 22px", flex: 1 }}>
                    <GenericEditableText sectionId={sectionId} field={`items.${i}.description`} value={item.description} tag="span" />
                  </p>
                  <a
                    href={resolveHref(item.ctaHref)}
                    data-btn="primary"
                    className="i01-srv-link"
                  >
                    <GenericEditableText sectionId={sectionId} field={`items.${i}.ctaText`} value={item.ctaText} tag="span" />
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="i01-srv-arrow"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
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

// ─── autoskola-01 Services — Road Editorial Motion kurzy ───────────────────────
// Midnight ink bg, 3-col pricing cards: dark glass default, orange highlighted
// with "Nejoblíbenější" pill, yellow corner brackets, JBM Mono prices,
// dashed road-lane feature checks, yellow square CTAs
// ─────────────────────────────────────────────────────────────────────────────
function ServicesAutoskola01({ content, sectionId, tenantSlug, isAdmin }: { content: Record<string, unknown>; sectionId: number; tenantSlug?: string; isAdmin?: boolean }) {
  const heading    = String(content.heading    ?? "Kurzy pro každého");
  const subheading = String(content.subheading ?? "Flexibilní termíny, jasné ceny");
  const items = ((content.items as Record<string, unknown>[]) ?? []);

  const INK    = "#0f172a";
  const INK2   = "#1a2540";
  const BONE   = "#fafaf7";
  const ORANGE = "#f16823";
  const YELLOW = "#ffce00";
  const SLATE  = "#94a3b8";
  const FONT_D = "'Space Grotesk', 'Inter', sans-serif";
  const FONT_B = "'Inter Tight', 'Inter', sans-serif";

  const resolve = (href: string) => (tenantSlug && !isAdmin) ? `/demo/${tenantSlug}${href}` : href;

  return (
    <section data-template="autoskola-01" id={String(sectionId)} style={{ backgroundColor: INK, padding: "96px clamp(24px, 6vw, 80px)", position: "relative" }}>
      {/* Dashed road-lane top */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 0, borderTop: `2px dashed ${ORANGE}40` }} aria-hidden="true" />

      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, marginBottom: 16 }}>
            <span style={{ width: 32, height: 0, borderTop: `2px dashed ${ORANGE}` }} aria-hidden="true" />
            <span style={{ fontFamily: FONT_B, fontSize: 11, fontWeight: 600, letterSpacing: "0.2em", textTransform: "uppercase", color: ORANGE }}>
              <GenericEditableText sectionId={sectionId} field="subheading" value={subheading} tag="span" />
            </span>
            <span style={{ width: 32, height: 0, borderTop: `2px dashed ${ORANGE}` }} aria-hidden="true" />
          </div>
          <h2 style={{ fontFamily: FONT_D, fontWeight: 700, fontSize: "clamp(1.6rem, 3vw, 2.4rem)", color: BONE, margin: 0, letterSpacing: "-0.01em" }}>
            <GenericEditableText sectionId={sectionId} field="heading" value={heading} tag="span" />
          </h2>
        </div>

        {/* Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20 }}>
          {items.map((item, i) => {
            const title       = String(item.title       ?? "");
            const description = String(item.description ?? "");
            const price       = String(item.price       ?? "");
            const ctaText     = String(item.ctaText     ?? "Zapsat se");
            const ctaHref     = String(item.ctaHref     ?? "/zapis");
            const iconType    = String(item.iconType    ?? "car");
            const highlighted = Boolean(item.highlighted);
            const features    = ((item.features as string[]) ?? []);

            const cardBg = highlighted ? ORANGE : INK2;
            const cardBorder = highlighted ? `2px solid ${ORANGE}` : `1px solid ${SLATE}18`;
            const textCol = highlighted ? BONE : BONE;
            const mutedCol = highlighted ? "rgba(255,255,255,0.78)" : SLATE;
            const priceCol = highlighted ? YELLOW : YELLOW;
            const ctaBg = highlighted ? YELLOW : `${BONE}10`;
            const ctaCol = highlighted ? INK : BONE;
            const checkCol = highlighted ? YELLOW : ORANGE;

            return (
              <div key={i} className="as01-svc-card"
                style={{
                  backgroundColor: cardBg,
                  border: cardBorder,
                  padding: "36px 28px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 18,
                  position: "relative",
                  transform: highlighted ? "translateY(-8px)" : "none",
                  transition: "transform 0.3s, border-color 0.3s, box-shadow 0.3s",
                  boxShadow: highlighted ? `0 12px 40px rgba(241,104,35,0.25)` : "none",
                }}>

                {/* Yellow corner brackets */}
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true" style={{ position: "absolute", top: 10, right: 10, opacity: 0.25 }}>
                  <path d="M20 0 H13 M20 0 V7" stroke={YELLOW} strokeWidth="1.5"/>
                </svg>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true" style={{ position: "absolute", bottom: 10, left: 10, opacity: 0.25 }}>
                  <path d="M0 20 H7 M0 20 V13" stroke={YELLOW} strokeWidth="1.5"/>
                </svg>

                {highlighted && (
                  <div style={{ position: "absolute", top: -14, left: "50%", transform: "translateX(-50%)", backgroundColor: YELLOW, color: INK, fontFamily: FONT_D, fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", padding: "5px 18px", whiteSpace: "nowrap" }}>
                    Nejoblíbenější
                  </div>
                )}

                {/* Icon */}
                <div style={{ width: 48, height: 48, display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: highlighted ? "rgba(255,255,255,0.12)" : `${ORANGE}15`, borderRadius: 0 }}>
                  <svg viewBox="0 0 24 24" width={24} height={24} fill="none" stroke={highlighted ? YELLOW : ORANGE} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                    {iconType === "zap" && <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>}
                    {iconType === "repeat" && <><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></>}
                    {iconType === "car" && <><path d="M5 17H3a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h14l4 4v4a2 2 0 0 1-2 2h-2"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/><path d="M1 9h18"/></>}
                  </svg>
                </div>

                <div>
                  <h3 style={{ fontFamily: FONT_D, fontWeight: 700, fontSize: "1.15rem", color: textCol, margin: "0 0 8px", letterSpacing: "0.01em" }}>
                    <GenericEditableText sectionId={sectionId} field={`items.${i}.title`} value={title} tag="span" />
                  </h3>
                  <p style={{ fontFamily: FONT_B, fontWeight: 400, fontSize: "0.9rem", color: mutedCol, margin: 0, lineHeight: 1.65 }}>
                    <GenericEditableText sectionId={sectionId} field={`items.${i}.description`} value={description} tag="span" />
                  </p>
                </div>

                {/* Features with dashed checks */}
                {features.length > 0 && (
                  <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 10, borderTop: `1px dashed ${SLATE}20`, paddingTop: 16 }}>
                    {features.map((f, fi) => (
                      <li key={fi} style={{ display: "flex", alignItems: "center", gap: 10, fontFamily: FONT_B, fontSize: "0.85rem", color: mutedCol }}>
                        <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={checkCol} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                        <GenericEditableText sectionId={sectionId} field={`items.${i}.features.${fi}`} value={f} tag="span" />
                      </li>
                    ))}
                  </ul>
                )}

                <div style={{ marginTop: "auto", paddingTop: 12 }}>
                  {/* Price — JBM Mono */}
                  <div style={{ fontFamily: "'JetBrains Mono', 'SF Mono', monospace", fontWeight: 700, fontSize: "1.35rem", color: priceCol, marginBottom: 16, letterSpacing: "-0.01em" }}>
                    <GenericEditableText sectionId={sectionId} field={`items.${i}.price`} value={price} tag="span" />
                  </div>
                  <a href={resolve(ctaHref)} data-btn="primary" className="as01-svc-cta"
                    style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "12px 24px", backgroundColor: ctaBg, color: ctaCol, fontFamily: FONT_D, fontSize: 13, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", textDecoration: "none", transition: "background-color 0.2s, transform 0.15s" }}>
                    <GenericEditableText sectionId={sectionId} field={`items.${i}.ctaText`} value={ctaText} tag="span" />
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                    </svg>
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

// ─── sweet-01 Products — Pâtisserie editorial magazine cards ────────────────
// White bg, 3-col cards with 3:4 aspect photos, gold corner brackets,
// Fraunces italic titles, cherry red arrow CTA, hover image zoom + bracket expand
// ─────────────────────────────────────────────────────────────────────────────
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
  const kicker   = String(content.kicker  ?? "CO NABÍZÍME");
  const title    = String(content.title   ?? "Něco dobrého pro každého");
  const subtitle = String(content.subtitle ?? "");
  const services = (content.services as SvcItem[]) ?? [];

  const RED    = "#E2001A";
  const CREAM  = "#fdf6ee";
  const COCOA  = "#2b1810";
  const GOLD   = "#c8a568";
  const FONT_D = "'Fraunces', 'Playfair Display', Georgia, serif";
  const FONT_B = "'Inter', 'Helvetica Neue', Arial, sans-serif";

  const resolve = (href: string) => {
    if (!href || href.startsWith("http") || href.startsWith("#")) return href;
    if (isAdmin) return `/demo/${tenantSlug}/admin${href}`;
    if (tenantSlug) return `/demo/${tenantSlug}${href}`;
    return href;
  };

  const showHeader = !!(kicker || title);

  return (
    <section data-template="sweet-01" style={{ background: "#ffffff", padding: "100px 0 110px", position: "relative" }}>
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,500;0,9..144,600;1,9..144,400;1,9..144,500&family=Inter:wght@400;500;600;700&display=swap" />
      <style>{`
        .sw01-prod-wrap { max-width: 1280px; margin: 0 auto; padding: 0 clamp(24px, 5vw, 60px); }
        .sw01-prod-hd { text-align: center; margin-bottom: 64px; }
        .sw01-prod-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 36px; }
        .sw01-prod-card { position: relative; display: flex; flex-direction: column; }
        .sw01-prod-img { position: relative; aspect-ratio: 3/4; overflow: hidden; background: ${CREAM}; }
        .sw01-prod-img img { width: 100%; height: 100%; object-fit: cover; display: block; transition: transform 0.7s cubic-bezier(.4,0,.2,1); }
        .sw01-prod-card:hover .sw01-prod-img img { transform: scale(1.06); }
        .sw01-prod-img-brackets { position: absolute; inset: 12px; pointer-events: none; z-index: 2; transition: inset 0.5s cubic-bezier(.4,0,.2,1); }
        .sw01-prod-card:hover .sw01-prod-img-brackets { inset: 8px; }
        .sw01-prod-img-brackets::before, .sw01-prod-img-brackets::after { content: ""; position: absolute; width: 36px; height: 36px; border: 0 solid ${GOLD}; transition: width 0.5s, height 0.5s; }
        .sw01-prod-img-brackets::before { top: 0; left: 0; border-top-width: 1.5px; border-left-width: 1.5px; }
        .sw01-prod-img-brackets::after  { bottom: 0; right: 0; border-bottom-width: 1.5px; border-right-width: 1.5px; }
        .sw01-prod-card:hover .sw01-prod-img-brackets::before,
        .sw01-prod-card:hover .sw01-prod-img-brackets::after { width: 44px; height: 44px; }
        .sw01-prod-num { position: absolute; top: 16px; right: 16px; z-index: 3; font-family: ${FONT_D}; font-style: italic; font-weight: 400; font-size: 42px; color: rgba(255,255,255,0.25); line-height: 1; pointer-events: none; }
        .sw01-prod-body { padding: 28px 4px 0; flex: 1; display: flex; flex-direction: column; }
        .sw01-prod-name { font-family: ${FONT_D}; font-style: italic; font-weight: 500; font-size: 24px; color: ${COCOA}; margin: 0 0 12px; line-height: 1.2; }
        .sw01-prod-desc { font-family: ${FONT_B}; font-weight: 400; font-size: 14.5px; line-height: 1.75; color: rgba(43,24,16,0.65); margin: 0 0 20px; flex: 1; }
        .sw01-prod-link { display: inline-flex; align-items: center; gap: 8px; font-family: ${FONT_B}; font-weight: 600; font-size: 12px; letter-spacing: 0.16em; text-transform: uppercase; color: ${RED}; text-decoration: none; transition: gap 0.3s; align-self: flex-start; }
        .sw01-prod-link:hover { gap: 14px; }
        .sw01-prod-link svg { transition: transform 0.3s; }
        .sw01-prod-link:hover svg { transform: translateX(2px); }
        @media(max-width: 900px) {
          .sw01-prod-grid { grid-template-columns: 1fr 1fr; gap: 28px; }
        }
        @media(max-width: 600px) {
          .sw01-prod-grid { grid-template-columns: 1fr; max-width: 440px; margin: 0 auto; }
        }
      `}</style>

      <div className="sw01-prod-wrap">
        {showHeader && (
          <div className="sw01-prod-hd">
            {kicker && (
              <p style={{ fontFamily: FONT_B, fontSize: 10.5, fontWeight: 700, letterSpacing: "0.32em", textTransform: "uppercase", color: RED, margin: "0 0 16px", display: "flex", alignItems: "center", justifyContent: "center", gap: 14 }}>
                <span style={{ width: 24, height: 1.5, background: RED, display: "inline-block" }} />
                <GenericEditableText sectionId={sectionId} field="kicker" value={kicker} tag="span" />
                <span style={{ width: 24, height: 1.5, background: RED, display: "inline-block" }} />
              </p>
            )}
            {title && (
              <h2 style={{ fontFamily: FONT_D, fontStyle: "italic", fontWeight: 500, fontSize: "clamp(30px, 3.8vw, 46px)", color: COCOA, margin: "0 0 12px", lineHeight: 1.12, letterSpacing: "-0.01em" }}>
                <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
              </h2>
            )}
            {subtitle && (
              <p style={{ fontFamily: FONT_B, fontWeight: 400, fontSize: 15, color: "rgba(43,24,16,0.55)", margin: 0 }}>
                <GenericEditableText sectionId={sectionId} field="subtitle" value={subtitle} tag="span" />
              </p>
            )}
            {/* Scalloped ornament */}
            <svg aria-hidden viewBox="0 0 160 10" style={{ width: 120, height: 8, margin: "20px auto 0", display: "block" }}>
              <path d="M0 5 Q 8 0 16 5 T 32 5 T 48 5 T 64 5 T 80 5 T 96 5 T 112 5 T 128 5 T 144 5 T 160 5" fill="none" stroke={GOLD} strokeWidth="0.8" opacity="0.5" />
            </svg>
          </div>
        )}

        <div className="sw01-prod-grid">
          {services.map((svc, i) => {
            const img = svc.image ?? "";
            const alt = svc.imageAlt ?? svc.name;
            const cta = svc.ctaText ?? "Zobrazit";
            const ctaLink = resolve(svc.ctaHref ?? "#");
            return (
              <div key={i} className="sw01-prod-card">
                <div className="sw01-prod-img">
                  <GenericEditableImage sectionId={sectionId} field={`services.${i}.image`} src={img} alt={alt} style={{ width: "100%", height: "100%" }}>
                    <img loading="lazy" src={img} alt={alt} />
                  </GenericEditableImage>
                  <div className="sw01-prod-img-brackets" aria-hidden />
                  <span className="sw01-prod-num" aria-hidden>0{i + 1}</span>
                </div>
                <div className="sw01-prod-body">
                  <h3 className="sw01-prod-name">
                    <GenericEditableText sectionId={sectionId} field={`services.${i}.name`} value={svc.name} tag="span" />
                  </h3>
                  <p className="sw01-prod-desc">
                    <GenericEditableText sectionId={sectionId} field={`services.${i}.description`} value={svc.description} tag="span" />
                  </p>
                  <a href={ctaLink} className="sw01-prod-link">
                    <GenericEditableText sectionId={sectionId} field={`services.${i}.ctaText`} value={cta} tag="span" />
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
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

  const eyebrow     = String(content.eyebrow     ?? "Naše programy");
  const heading     = String(content.heading     ?? "Vše, co student potřebuje k úspěchu");
  const subheading  = String(content.subheading  ?? "Od základní školy po vysokoškolské přijímačky — provedeme vás každým krokem, vlastním tempem a s lektorem, který sedí.");
  const cardLinkText = String(content.cardLinkText ?? "Zjistit více");
  const ctaText     = String(content.ctaText     ?? "Zobrazit všechny služby");
  const ctaHref     = String(content.ctaHref     ?? "/sluzby");
  const siteMode    = String(content.siteMode    ?? "multipage");
  const services    = (content.services as Array<{ title: string; description: string; icon?: string }>) ?? [];

  const resolve = (href: string) => resolveNavHref(href, siteMode, tenantSlug, isAdmin);

  const gridRef = useRef<HTMLDivElement>(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const el = gridRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVis(true); obs.disconnect(); } }, { threshold: 0.12 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

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
        /* dekorativní blob vlevo dole + jemné tečky vpravo nahoře */
        .edu01srv::before{content:'';position:absolute;bottom:0;left:0;width:clamp(280px,26vw,480px);aspect-ratio:1;background:linear-gradient(135deg,#eef4ff 0%,#f6f9ff 100%);border-top-right-radius:100%;pointer-events:none;z-index:0;}
        .edu01srv::after{content:'';position:absolute;top:48px;right:40px;width:160px;height:160px;background-image:radial-gradient(${BLUE} 1.4px,transparent 1.4px);background-size:16px 16px;opacity:.12;pointer-events:none;z-index:0;}
        .edu01srv-inner{position:relative;z-index:1;max-width:1280px;margin:0 auto;}
        .edu01srv-head{text-align:center;margin-bottom:64px;}
        .edu01srv-eyebrow{display:inline-flex;align-items:center;gap:8px;color:${BLUE};font-size:12px;font-weight:700;letter-spacing:2.5px;text-transform:uppercase;margin-bottom:14px;}
        .edu01srv-eyebrow::before,.edu01srv-eyebrow::after{content:'';width:22px;height:1.5px;background:${BLUE};opacity:.45;}
        .edu01srv-head h2{font-family:${FONT};font-size:clamp(1.8rem,3.5vw,2.8rem);font-weight:800;color:${NAVY};margin:0 0 14px;letter-spacing:-0.04em;line-height:1.15;}
        .edu01srv-sub{font-size:clamp(1rem,1.3vw,1.1rem);color:#6b7280;max-width:560px;margin:0 auto;line-height:1.65;}
        .edu01srv-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:20px;}
        .edu01srv-card{position:relative;padding:32px 28px 28px;border-radius:16px;background:#f8fafc;border:1.5px solid #eef2f7;overflow:hidden;transition:border-color 0.25s,box-shadow 0.3s,transform 0.3s,background 0.25s,opacity .6s ease;cursor:default;}
        .edu01srv-card::before{content:'';position:absolute;top:0;left:0;right:0;height:3px;background:linear-gradient(90deg,${BLUE},#4f9bff);transform:scaleX(0);transform-origin:left;transition:transform .35s cubic-bezier(.4,0,.2,1);}
        .edu01srv-card:hover{border-color:${BLUE};background:#fff;box-shadow:0 16px 44px rgba(0,89,223,0.12);transform:translateY(-6px);}
        .edu01srv-card:hover::before{transform:scaleX(1);}
        .edu01srv-reveal{opacity:0;transform:translateY(22px);}
        .edu01srv-reveal.in{opacity:1;transform:translateY(0);}
        .edu01srv-icon{width:50px;height:50px;border-radius:13px;background:${NAVY};color:#fff;display:flex;align-items:center;justify-content:center;margin-bottom:20px;transition:background 0.25s,transform 0.35s cubic-bezier(.34,1.56,.64,1),box-shadow .3s;}
        .edu01srv-card:hover .edu01srv-icon{background:${BLUE};transform:rotate(-6deg) scale(1.08);box-shadow:0 8px 20px rgba(0,89,223,.35);}
        .edu01srv-card h3{font-family:${FONT};font-size:17px;font-weight:700;color:${NAVY};margin:0 0 10px;line-height:1.3;}
        .edu01srv-card p{font-size:14px;color:#6b7280;line-height:1.65;margin:0 0 18px;}
        .edu01srv-link{display:inline-flex;align-items:center;gap:5px;font-size:13px;font-weight:700;color:${BLUE};text-decoration:none;transition:gap 0.2s;}
        .edu01srv-link svg{transition:transform .2s;}
        .edu01srv-link:hover{gap:9px;}
        .edu01srv-link:hover svg{transform:translateX(2px);}
        .edu01srv-bottom{margin-top:52px;text-align:center;}
        .edu01srv-cta{display:inline-flex;align-items:center;gap:8px;padding:14px 34px;background:${BLUE};color:#fff;font-family:${FONT};font-size:15px;font-weight:700;border-radius:62px;text-decoration:none;box-shadow:0 8px 22px rgba(0,89,223,.28);transition:background 0.2s,transform 0.2s,box-shadow .25s;}
        .edu01srv-cta svg{transition:transform .2s;}
        .edu01srv-cta:hover{background:#0032b2;transform:translateY(-2px);box-shadow:0 12px 30px rgba(0,89,223,.4);}
        .edu01srv-cta:hover svg{transform:translateX(3px);}
        @media(max-width:960px){.edu01srv-grid{grid-template-columns:1fr 1fr;}.edu01srv{padding:72px 24px;}}
        @media(max-width:640px){.edu01srv-grid{grid-template-columns:1fr;}.edu01srv-head h2{font-size:1.8rem;}}
        @media(prefers-reduced-motion:reduce){.edu01srv-reveal{opacity:1!important;transform:none!important;}}
      `}</style>

      <section id={String(sectionId)} className="edu01srv" data-template="edu-01-services">
        <div className="edu01srv-inner">
          <div className="edu01srv-head">
            <span className="edu01srv-eyebrow">
              <GenericEditableText sectionId={sectionId} field="eyebrow" value={eyebrow} tag="span" />
            </span>
            <h2>
              <GenericEditableText sectionId={sectionId} field="heading" value={heading} tag="span" />
            </h2>
            <p className="edu01srv-sub">
              <GenericEditableText sectionId={sectionId} field="subheading" value={subheading} tag="span" />
            </p>
          </div>

          <div className="edu01srv-grid" ref={gridRef}>
            {services.map((svc, i) => (
              <div key={i} className={`edu01srv-card edu01srv-reveal${vis ? " in" : ""}`} style={{ transitionDelay: `${i * 0.08}s` }}>
                <div className="edu01srv-icon">
                  {ICONS[svc.icon ?? "book"] ?? ICONS["book"]}
                </div>
                <h3>
                  <GenericEditableText sectionId={sectionId} field={`services.${i}.title`} value={svc.title} tag="span" />
                </h3>
                <p>
                  <GenericEditableText sectionId={sectionId} field={`services.${i}.description`} value={svc.description} tag="span" />
                </p>
                <a href={resolve(ctaHref)} className="edu01srv-link">
                  <GenericEditableText sectionId={sectionId} field="cardLinkText" value={cardLinkText} tag="span" />
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                </a>
              </div>
            ))}
          </div>

          <div className="edu01srv-bottom">
            <a href={resolve(ctaHref)} className="edu01srv-cta">
              <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
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
// Luxe povýšení (vychází z veterinafenix.cz — bílý header + vlněná teal sekce):
// - Inline teal SVG ikony v soft gradient badge kruzích (bez PNG leakage)
// - Karty: hover lift + rostoucí teal accent bar + icon breathe + arrow nudge
// - Conditional header (showHeader) pro reuse na /sluzby podstránce
// - Pill CTA s šipkou, refined wave dividery
// ─────────────────────────────────────────────────────────────────────────────
function ServicesVet01({ content, sectionId, tenantSlug, isAdmin }: { content: Record<string, unknown>; sectionId: number; tenantSlug?: string; isAdmin?: boolean }) {
  const TEAL    = "#0D7486";
  const PRIMARY = "#286C7E";
  const ACCENT  = "#42aaba";
  const HEADING = "#2c6270";
  const BG      = "#DCE9EE";
  const FONT    = "'Forum', 'Georgia', serif";
  const BODY    = "'Roboto Condensed', 'Roboto', sans-serif";

  const kickerRaw  = content.kicker;
  const headingRaw = content.heading;
  const bodyRaw    = content.body;
  const kicker  = kickerRaw  === undefined ? "Co nabízíme" : String(kickerRaw);
  const heading = headingRaw === undefined ? "Co u nás najdete" : String(headingRaw);
  const body    = bodyRaw    === undefined ? "Poskytujeme kompletní veterinární péči pod jednou střechou — od preventivních prohlídek přes moderní diagnostiku až po chirurgické zákroky a pooperační péči." : String(bodyRaw);
  const showHeader = !!(kicker.trim() || heading.trim());
  const showBody   = !!body.trim();

  const ctaText  = String(content.ctaText  ?? "Objednat prohlídku");
  const ctaHref  = String(content.ctaHref  ?? "/kontakt");
  const siteMode = String(content.siteMode ?? "multipage");
  const resolve = (href: string) => {
    if (!href) return href;
    if (href.startsWith("#") || href.startsWith("http") || href.startsWith("mailto:") || href.startsWith("tel:")) return href;
    if (!tenantSlug || !href.startsWith("/")) return href;
    if (siteMode === "onepage" && href !== "/") return `/demo/${tenantSlug}${isAdmin ? "/admin" : ""}/#${href.replace(/^\//, "")}`;
    return `/demo/${tenantSlug}${isAdmin ? "/admin" : ""}${href === "/" ? "" : href}`;
  };

  const rawItems = (content.items as Array<{ title?: string; name?: string; description?: string; iconUrl?: string }>) ?? [];
  const DEFAULT_ITEMS = [
    { title: "Diagnostika",   description: "Laboratoř přímo na klinice, ultrazvuk, RTG a digitální zobrazovací metody pro rychlou a přesnou diagnózu." },
    { title: "Prevence",      description: "Vakcinace, odčervení, čipování a pravidelné preventivní prohlídky pro dlouhý a zdravý život vašeho mazlíčka." },
    { title: "Chirurgie",     description: "Plánované i urgentní operace v moderně vybaveném sále s bezpečnou anestezií a monitoringem EKG." },
    { title: "Hospitalizace", description: "Klidné boxy s individuálním přístupem, průběžné monitorování a pravidelné hlášení majiteli." },
  ];
  const items = rawItems.length > 0 ? rawItems : DEFAULT_ITEMS;

  // Inline vet SVG ikony (cyklují dle indexu): diagnostika / prevence / chirurgie / hospitalizace
  const ICONS = [
    // Stetoskop (diagnostika)
    (<><path d="M4.5 4.5v5a5 5 0 0 0 10 0v-5"/><path d="M2.5 4.5h4M12.5 4.5h4"/><path d="M9.5 14.5v2.5a4 4 0 0 0 8 0v-1"/><circle cx="18.5" cy="14" r="2.2"/></>),
    // Štít s křížkem (prevence)
    (<><path d="M12 3l7 3v5c0 4.5-3 8-7 9.5C8 19 5 15.5 5 11V6z"/><path d="M12 8.5v5M9.5 11h5"/></>),
    // Skalpel / activity (chirurgie)
    (<><path d="M3 12h4l2.5 6 4-13 2.5 7H21"/></>),
    // Srdce s pulzem (hospitalizace)
    (<><path d="M20.8 8.6a4.6 4.6 0 0 0-8-3.1 4.6 4.6 0 0 0-8 3.1C4.8 13 12 19 12 19s7.2-6 8.8-10.4z"/><path d="M7.5 11.5h2l1.5-2.5 2 5 1.2-2.5h2.3"/></>),
  ];

  return (
    <section id="sluzby" data-template="vet-01-services" style={{ fontFamily: BODY }}>
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Forum&family=Roboto+Condensed:wght@400;500;700&display=swap" />
      <style>{`
        .vet01srv-header{background:#fff;padding:78px 32px 60px;text-align:center;}
        .vet01srv-header-inner{max-width:820px;margin:0 auto;}
        .vet01srv-kicker{display:inline-flex;align-items:center;gap:9px;font-family:${BODY};font-size:13px;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;color:${TEAL};margin:0 0 14px;}
        .vet01srv-kicker svg{color:${ACCENT};}
        .vet01srv-heading{font-family:${FONT};font-size:clamp(32px,4.2vw,52px);font-weight:400;color:${HEADING};margin:0 0 16px;line-height:1.1;}
        .vet01srv-divider{width:60px;height:3px;background:linear-gradient(90deg,${TEAL},${ACCENT});border-radius:2px;margin:0 auto;}
        .vet01srv-body-section{position:relative;background:linear-gradient(180deg,${BG},#e8f1f4);}
        .vet01srv-wave-top,.vet01srv-wave-bot{position:absolute;left:0;right:0;overflow:hidden;line-height:0;z-index:1;}
        .vet01srv-wave-top{top:0;}.vet01srv-wave-top svg{display:block;width:100%;height:70px;}
        .vet01srv-wave-bot{bottom:0;}.vet01srv-wave-bot svg{display:block;width:100%;height:60px;}
        .vet01srv-inner{position:relative;z-index:2;max-width:1200px;margin:0 auto;padding:104px 32px 100px;}
        .vet01srv-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:26px;margin:0 0 48px;}
        @media(max-width:900px){.vet01srv-grid{grid-template-columns:repeat(2,1fr);gap:22px;}}
        @media(max-width:520px){.vet01srv-grid{grid-template-columns:1fr;gap:18px;}}
        .vet01srv-card{position:relative;background:#fff;border-radius:16px;padding:34px 24px 30px;text-align:center;box-shadow:0 4px 20px rgba(13,116,134,0.09);overflow:hidden;transition:box-shadow 0.35s cubic-bezier(.4,0,.2,1),transform 0.35s cubic-bezier(.4,0,.2,1);}
        .vet01srv-card::before{content:'';position:absolute;top:0;left:0;right:0;height:4px;background:linear-gradient(90deg,${TEAL},${ACCENT});transform:scaleX(0);transform-origin:left;transition:transform 0.4s cubic-bezier(.4,0,.2,1);}
        .vet01srv-card:hover{box-shadow:0 16px 40px rgba(13,116,134,0.2);transform:translateY(-8px);}
        .vet01srv-card:hover::before{transform:scaleX(1);}
        .vet01srv-badge{width:72px;height:72px;border-radius:20px;margin:0 auto 20px;display:flex;align-items:center;justify-content:center;background:linear-gradient(140deg,#e6f3f5,#d4e9ee);color:${TEAL};transition:transform 0.4s cubic-bezier(.34,1.4,.64,1),background 0.35s,color 0.35s;}
        .vet01srv-card:hover .vet01srv-badge{background:linear-gradient(140deg,${TEAL},${PRIMARY});color:#fff;transform:translateY(-4px) rotate(-4deg) scale(1.06);}
        .vet01srv-card-title{font-family:${FONT};font-size:23px;font-weight:400;color:${TEAL};margin:0 0 12px;}
        .vet01srv-card-desc{font-size:15px;color:#5d6b6e;line-height:1.65;margin:0;}
        .vet01srv-body{text-align:center;font-size:17px;color:#3f5157;line-height:1.75;max-width:800px;margin:0 auto 34px;}
        .vet01srv-cta-wrap{text-align:center;}
        .vet01srv-cta{display:inline-flex;align-items:center;gap:10px;padding:15px 34px;background:linear-gradient(135deg,${TEAL},${PRIMARY});color:#fff;border-radius:50px;font-family:${BODY};font-size:17px;font-weight:600;letter-spacing:0.01em;text-decoration:none;box-shadow:0 10px 26px rgba(13,116,134,0.28);transition:transform 0.28s cubic-bezier(.4,0,.2,1),box-shadow 0.28s;}
        .vet01srv-cta svg{transition:transform 0.28s ease;}
        .vet01srv-cta:hover{transform:translateY(-3px);box-shadow:0 16px 36px rgba(13,116,134,0.4);}
        .vet01srv-cta:hover svg{transform:translateX(4px);}
      `}</style>

      {showHeader && (
        <div className="vet01srv-header">
          <div className="vet01srv-header-inner">
            <p className="vet01srv-kicker">
              <svg width="15" height="15" viewBox="0 0 60 60" fill="currentColor" aria-hidden="true"><circle cx="18" cy="14" r="6"/><circle cx="30" cy="9" r="6"/><circle cx="42" cy="14" r="6"/><ellipse cx="30" cy="34" rx="13" ry="11"/><circle cx="23" cy="45" r="5"/><circle cx="37" cy="45" r="5"/></svg>
              <GenericEditableText sectionId={sectionId} field="kicker" value={kicker} tag="span" />
            </p>
            <h2 className="vet01srv-heading">
              <GenericEditableText sectionId={sectionId} field="heading" value={heading} tag="span" />
            </h2>
            <div className="vet01srv-divider" />
          </div>
        </div>
      )}

      <div className="vet01srv-body-section">
        <div className="vet01srv-wave-top">
          <svg viewBox="0 0 1440 70" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg"><path d="M0,0 C360,70 1080,70 1440,0 L1440,0 L0,0 Z" fill="#ffffff"/></svg>
        </div>

        <div className="vet01srv-inner">
          <div className="vet01srv-grid">
            {items.map((item, i) => {
              const label = item.title ?? ("name" in item ? (item as { name?: string }).name : undefined) ?? "";
              return (
                <div key={i} className="vet01srv-card">
                  <div className="vet01srv-badge">
                    <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      {ICONS[i % ICONS.length]}
                    </svg>
                  </div>
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

          {showBody && (
            <p className="vet01srv-body">
              <GenericEditableText sectionId={sectionId} field="body" value={body} tag="span" />
            </p>
          )}
          <div className="vet01srv-cta-wrap">
            <a href={resolve(ctaHref)} className="vet01srv-cta">
              <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
            </a>
          </div>
        </div>

        <div className="vet01srv-wave-bot">
          <svg viewBox="0 0 1440 70" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg"><path d="M0,70 C360,0 1080,0 1440,70 L1440,70 L0,70 Z" fill="#ffffff"/></svg>
        </div>
      </div>
    </section>
  );
}


// ── pethotel-01-services ──────────────────────────────────────────────────────
// 3 service cards — warm cream bg, rounded image, lift hover, pill CTA
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
  const ACCENT  = "#F9C93D";
  const CREAM   = "#FAF5F0";
  const FONT    = "'Quicksand', Arial, sans-serif";

  const eyebrowRaw  = (content as Record<string,unknown>).eyebrow;
  const titleRaw    = (content as Record<string,unknown>).heading;
  const subtitleRaw = (content as Record<string,unknown>).subtitle;
  const eyebrow  = eyebrowRaw  === undefined ? "Co nabízíme" : String(eyebrowRaw);
  const heading   = titleRaw    === undefined ? "Trojí péče pod jednou střechou" : String(titleRaw);
  const subtitle = subtitleRaw === undefined ? "" : String(subtitleRaw);
  const showHeader = !!(eyebrow.trim() || heading.trim() || subtitle.trim());

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
        .ph01srv { background:${CREAM}; padding:100px 0 90px; font-family:${FONT}; position:relative; }
        .ph01srv::before { content:''; position:absolute; top:0; left:0; right:0; height:5px; background:linear-gradient(90deg, ${ACCENT} 0%, ${RED} 50%, ${ACCENT} 100%); }
        .ph01srv-inner { max-width:1140px; margin:0 auto; padding:0 32px; }
        .ph01srv-header { text-align:center; margin-bottom:64px; }
        .ph01srv-eyebrow { font-family:${FONT}; font-size:13px; font-weight:700; color:${RED}; text-transform:uppercase; letter-spacing:0.14em; margin:0 0 12px; }
        .ph01srv-title { margin:0 0 12px; color:${PRIMARY}; font-weight:800; font-size:clamp(26px,3.2vw,42px); line-height:1.2; font-family:${FONT}; }
        .ph01srv-subtitle { margin:0; color:#a08070; font-size:17px; font-weight:500; }
        .ph01srv-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:28px; }
        .ph01srv-card { background:#fff; border-radius:20px; overflow:hidden; box-shadow:0 4px 20px rgba(113,36,25,0.07); transition:transform .35s cubic-bezier(.34,1.56,.64,1),box-shadow .35s ease; display:flex; flex-direction:column; }
        .ph01srv-card:hover { transform:translateY(-8px); box-shadow:0 16px 40px rgba(113,36,25,0.13); }
        .ph01srv-img { width:100%; aspect-ratio:4/3; overflow:hidden; position:relative; }
        .ph01srv-img > div { height:100%; }
        .ph01srv-img img { width:100%; height:100%; object-fit:cover; transition:transform .5s ease; }
        .ph01srv-card:hover .ph01srv-img img { transform:scale(1.06); }
        .ph01srv-body { padding:28px 28px 32px; display:flex; flex-direction:column; flex:1; }
        .ph01srv-card h3 { margin:0 0 12px; color:${PRIMARY}; font-size:22px; font-weight:700; font-family:${FONT}; line-height:1.2; }
        .ph01srv-card p { margin:0 0 24px; color:#7a5e52; font-size:15.5px; line-height:1.6; font-weight:500; flex:1; }
        .ph01srv-btn { display:inline-flex; align-items:center; gap:8px; padding:12px 28px; background:${RED}; color:#fff; font-family:${FONT}; font-size:15px; font-weight:700; text-decoration:none; border-radius:50px; transition:background .25s ease,transform .3s cubic-bezier(.34,1.56,.64,1),box-shadow .25s ease; box-shadow:0 4px 14px rgba(214,18,61,0.22); align-self:flex-start; }
        .ph01srv-btn:hover { background:#b80d32; transform:translateY(-2px); box-shadow:0 8px 22px rgba(214,18,61,0.32); }
        .ph01srv-btn svg { transition:transform .25s ease; }
        .ph01srv-btn:hover svg { transform:translateX(3px); }
        @media(max-width:800px){
          .ph01srv-grid { grid-template-columns:1fr; max-width:440px; margin:0 auto; }
          .ph01srv { padding:72px 0 60px; }
        }
      `}</style>
      <section className="ph01srv" data-template="pethotel-01-services" id="sluzby">
        <div className="ph01srv-inner">
          {showHeader && (
            <div className="ph01srv-header">
              {eyebrow.trim() && (
                <p className="ph01srv-eyebrow">
                  <GenericEditableText sectionId={sectionId} field="eyebrow" value={eyebrow} tag="span" />
                </p>
              )}
              {heading.trim() && (
                <h2 className="ph01srv-title">
                  <GenericEditableText sectionId={sectionId} field="heading" value={heading} tag="span" />
                </h2>
              )}
              {subtitle.trim() && (
                <p className="ph01srv-subtitle">
                  <GenericEditableText sectionId={sectionId} field="subtitle" value={subtitle} tag="span" />
                </p>
              )}
            </div>
          )}
          <div className="ph01srv-grid">
            {services.map((svc, i) => (
              <div className="ph01srv-card" key={i}>
                {svc.iconUrl && (
                  <div className="ph01srv-img">
                    <GenericEditableImage sectionId={sectionId} field={`services.${i}.iconUrl`} src={svc.iconUrl} alt={svc.name}>
                      <img loading="lazy" src={svc.iconUrl} alt={svc.name} />
                    </GenericEditableImage>
                  </div>
                )}
                <div className="ph01srv-body">
                  <h3>
                    <GenericEditableText sectionId={sectionId} field={`services.${i}.title`} value={svc.title ?? svc.name} tag="span" />
                  </h3>
                  <p>
                    <GenericEditableText sectionId={sectionId} field={`services.${i}.description`} value={svc.description} tag="span" />
                  </p>
                  {svc.linkText && svc.linkHref && (
                    <a href={resolve(svc.linkHref)} className="ph01srv-btn">
                      <GenericEditableText sectionId={sectionId} field={`services.${i}.linkText`} value={svc.linkText} tag="span" />
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
                    </a>
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

  const eyebrowRaw = (content as Record<string, unknown>).kicker;
  const titleRaw   = (content as Record<string, unknown>).heading;
  const kicker       = eyebrowRaw === undefined ? "Ceník" : String(eyebrowRaw);
  const heading      = titleRaw   === undefined ? "Služby a ceník" : String(titleRaw);
  const subtitleRaw  = (content as Record<string, unknown>).subtitle;
  const subtitle     = subtitleRaw === undefined ? "Ceny se řídí velikostí plemene a stavem srsti. Přesnou kalkulaci vám rádi potvrdíme při rezervaci." : String(subtitleRaw);
  const showHeader   = !!(kicker.trim() || heading.trim() || subtitle.trim());
  const serviceTypes = (content.serviceTypes as SvcType[]) ?? [{ label: "Kompletní péče" }, { label: "Trimování" }];
  const cols         = (content.cols     as Col[]) ?? [];
  const trimCols     = (content.trimCols as Col[]) ?? [];
  const activeCols   = activeTab === 0 ? cols : trimCols;
  const activeKey    = activeTab === 0 ? "cols" : "trimCols";

  return (
    <section id="sluzby-a-cenik" data-template="grooming-01-pricing" style={{ fontFamily: FONT }}>
      <div className="gr01pr-inner">
        {showHeader && (
          <div className="gr01pr-header">
            <p className="gr01pr-kicker">
              <GenericEditableText sectionId={sectionId} field="kicker" value={kicker} tag="span" />
            </p>
            <h2 className="gr01pr-h2">
              <GenericEditableText sectionId={sectionId} field="heading" value={heading} tag="span" />
            </h2>
            {subtitle.trim() && (
              <p className="gr01pr-sub">
                <GenericEditableText sectionId={sectionId} field="subtitle" value={subtitle} tag="span" />
              </p>
            )}
          </div>
        )}

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
                <GenericEditableText sectionId={sectionId} field={`serviceTypes.${i}.label`} value={t.label ?? `Služba ${i + 1}`} tag="span" />
              </button>
            ))}
          </div>
        )}

        <div className="gr01pr-grid">
          {activeCols.map((col, ci) => (
            <div key={ci} className="gr01pr-col">
              {col.heading && (
                <h3 className="gr01pr-col-head">
                  <GenericEditableText sectionId={sectionId} field={`${activeKey}.${ci}.heading`} value={col.heading} tag="span" />
                </h3>
              )}
              <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
                {(col.items ?? []).map((item, ii) => (
                  <li key={ii} className="gr01pr-item">
                    <span className="gr01pr-accent" aria-hidden="true" />
                    <span className="gr01pr-name">
                      <GenericEditableText sectionId={sectionId} field={`${activeKey}.${ci}.items.${ii}.name`} value={item.name ?? ""} tag="span" />
                    </span>
                    {item.imageUrl && (
                      <GenericEditableImage
                        sectionId={sectionId}
                        field={`${activeKey}.${ci}.items.${ii}.imageUrl`}
                        src={item.imageUrl}
                        className="gr01pr-breed-wrap"
                      >
                        <img loading="lazy" src={item.imageUrl} alt={item.name ?? ""} className="gr01pr-breed" />
                      </GenericEditableImage>
                    )}
                    <span className="gr01pr-price">
                      <GenericEditableText sectionId={sectionId} field={`${activeKey}.${ci}.items.${ii}.price`} value={item.price ?? ""} tag="span" />
                    </span>
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

  const eyebrowRaw = (content as Record<string, unknown>).eyebrow;
  const titleRaw   = (content as Record<string, unknown>).title;
  const leadRaw    = (content as Record<string, unknown>).lead;
  const eyebrow = eyebrowRaw === undefined ? "Oborová specializace" : String(eyebrowRaw);
  const title   = titleRaw   === undefined ? "Oborová řešení" : String(titleRaw);
  const lead    = leadRaw    === undefined ? "Poskytujeme komplexní daňové a účetní poradenství pro podniky napříč všemi odvětvími." : String(leadRaw);
  const showHeader = !!(eyebrow.trim() || title.trim() || lead.trim());
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
          padding: 96px 24px;
          font-family: ${FONT_B};
        }
        .ucn02svc-inner { max-width: 1200px; margin: 0 auto; }
        .ucn02svc-header { text-align: center; margin-bottom: 60px; }
        .ucn02svc-eyebrow {
          font-family: ${FONT_H};
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 3px;
          text-transform: uppercase;
          color: ${GOLD};
          display: block;
          margin-bottom: 16px;
        }
        .ucn02svc-h2 {
          font-family: ${FONT_H};
          font-size: clamp(30px, 3.2vw, 44px);
          font-weight: 800;
          color: ${GREEN};
          margin: 0 0 18px 0;
          letter-spacing: -0.5px;
        }
        .ucn02svc-gold-bar {
          width: 52px; height: 3px;
          background: ${GOLD};
          margin: 0 auto 22px;
        }
        .ucn02svc-lead {
          font-family: ${FONT_B};
          font-size: 1.05rem;
          color: #5a6b66;
          max-width: 640px;
          margin: 0 auto;
          line-height: 1.75;
        }
        .ucn02svc-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 18px;
        }
        .ucn02svc-card {
          position: relative;
          background: ${MINT};
          border-radius: 6px;
          padding: 30px 26px 32px;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          text-align: left;
          gap: 16px;
          cursor: default;
          overflow: hidden;
          border: 1px solid transparent;
          animation: ucn02Up 0.6s cubic-bezier(.22,.61,.36,1) both;
          transition: background 0.32s ease, transform 0.32s cubic-bezier(.4,0,.2,1), box-shadow 0.32s ease;
        }
        /* gold top accent that grows on hover */
        .ucn02svc-card::before {
          content: "";
          position: absolute;
          top: 0; left: 0;
          height: 3px; width: 0;
          background: ${GOLD};
          transition: width 0.4s cubic-bezier(.4,0,.2,1);
        }
        .ucn02svc-card:hover {
          background: ${GREEN};
          transform: translateY(-6px);
          box-shadow: 0 20px 44px rgba(0,72,53,0.22);
        }
        .ucn02svc-card:hover::before { width: 100%; }
        .ucn02svc-icon {
          width: 54px; height: 54px;
          border-radius: 10px;
          background: rgba(0,72,53,0.09);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: background 0.32s ease, transform 0.32s ease;
        }
        .ucn02svc-card:hover .ucn02svc-icon {
          background: rgba(188,161,96,0.22);
          transform: scale(1.06);
        }
        .ucn02svc-icon svg { stroke: ${GREEN}; transition: stroke 0.32s ease; }
        .ucn02svc-card:hover .ucn02svc-icon svg { stroke: ${GOLD}; }
        .ucn02svc-name {
          font-family: ${FONT_H};
          font-size: 1.02rem;
          font-weight: 700;
          color: ${GREEN};
          margin: 0;
          line-height: 1.3;
          transition: color 0.32s ease;
        }
        .ucn02svc-card:hover .ucn02svc-name { color: #ffffff; }
        .ucn02svc-desc {
          font-family: ${FONT_B};
          font-size: 0.86rem;
          font-weight: 400;
          color: #607570;
          margin: 0;
          line-height: 1.6;
          transition: color 0.32s ease;
        }
        .ucn02svc-card:hover .ucn02svc-desc { color: rgba(255,255,255,0.82); }
        .ucn02svc-arrow {
          margin-top: 2px;
          color: ${GOLD};
          opacity: 0;
          transform: translateX(-6px);
          transition: opacity 0.32s ease, transform 0.32s ease;
        }
        .ucn02svc-card:hover .ucn02svc-arrow { opacity: 1; transform: translateX(0); }
        @media (max-width: 1024px) {
          .ucn02svc-grid { grid-template-columns: repeat(3, 1fr); }
        }
        @media (max-width: 760px) {
          .ucn02svc-section { padding: 64px 18px; }
          .ucn02svc-grid { grid-template-columns: repeat(2, 1fr); gap: 14px; }
          .ucn02svc-card { padding: 24px 20px 26px; }
        }
        @media (max-width: 440px) {
          .ucn02svc-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <section id="sluzby" className="ucn02svc-section" data-template="ucetni-02-services">
        <div className="ucn02svc-inner">
          {showHeader && (
            <div className="ucn02svc-header">
              {eyebrow.trim() && (
                <GenericEditableText sectionId={sectionId} field="eyebrow" value={eyebrow} tag="span" className="ucn02svc-eyebrow" />
              )}
              {title.trim() && (
                <GenericEditableText sectionId={sectionId} field="title" value={title} tag="h2" className="ucn02svc-h2" />
              )}
              <div className="ucn02svc-gold-bar" aria-hidden />
              {lead.trim() && (
                <GenericEditableText sectionId={sectionId} field="lead" value={lead} tag="p" className="ucn02svc-lead" />
              )}
            </div>
          )}

          <div className="ucn02svc-grid">
            {items.map((item, i) => (
              <div key={i} className="ucn02svc-card" style={{ animationDelay: `${Math.min(i, 8) * 0.06}s` }}>
                <div className="ucn02svc-icon">{getIcon(item.icon)}</div>
                <h3 className="ucn02svc-name">
                  <GenericEditableText sectionId={sectionId} field={`items.${i}.name`} value={String(item.name ?? "")} tag="span" />
                </h3>
                {item.description && (
                  <p className="ucn02svc-desc">
                    <GenericEditableText sectionId={sectionId} field={`items.${i}.description`} value={String(item.description)} tag="span" />
                  </p>
                )}
                <span className="ucn02svc-arrow" aria-hidden="true">
                  <svg width="20" height="14" viewBox="0 0 20 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 7h16M12 2l5 5-5 5"/></svg>
                </span>
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

  const eyebrowRaw  = (content as Record<string, unknown>).eyebrow;
  const titleRaw    = (content as Record<string, unknown>).title;
  const leadRaw     = (content as Record<string, unknown>).lead;
  const eyebrow  = eyebrowRaw  === undefined ? "Naše výhody" : String(eyebrowRaw);
  const title    = titleRaw    === undefined ? "Proč zvolit FinHypotéky" : String(titleRaw);
  const lead     = leadRaw     === undefined ? "Komplexní servis od prvního setkání až po čerpání hypotéky — vše na jednom místě." : String(leadRaw);
  const showHeader = !!(eyebrow.trim() || title.trim() || lead.trim());

  type SvcItem = { name?: string; description?: string; icon?: string };
  const rawItems = (content.items as SvcItem[]) ?? [];
  const items = rawItems.length > 0 ? rawItems : [
    { name: "Kompletní vyřízení",       description: "Postaráme se o veškerou dokumentaci, komunikaci s bankou i katastrem. Vy se soustředíte na výběr nemovitosti.", icon: "briefcase" },
    { name: "Nejnižší sazba na trhu",   description: "Díky objemu sjednaných hypoték vyjednáváme sazby, které nejsou dostupné přes přepážku banky.", icon: "trending-down" },
    { name: "Služba zcela zdarma",      description: "Poradenství je pro vás bez poplatku. Naši poradci jsou odměňováni bankou, nikoliv vámi.", icon: "check-circle" },
    { name: "Pobočky po celé ČR",       description: "Přes 120 poboček ve všech krajích. Váš poradce je vždy dostupný — osobně, online i telefonicky.", icon: "map-pin" },
  ];

  const ICONS: Record<string, string> = {
    briefcase:       `<path d="M20 7H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>`,
    "trending-down": `<polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/><polyline points="17 18 23 18 23 12"/>`,
    "check-circle":  `<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>`,
    "map-pin":       `<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>`,
    shield:          `<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>`,
    star:            `<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>`,
    zap:             `<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>`,
    users:           `<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>`,
  };

  const getIcon = (name?: string) => {
    const d = ICONS[name ?? ""] ?? ICONS["briefcase"];
    return `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="${GREEN}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;
  };

  const sectionRef = useRef<HTMLElement>(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVis(true); obs.disconnect(); } }, { threshold: 0.15 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <>
      <style>{`
        .ucn03svc-section {
          position: relative;
          background: #ffffff;
          padding: 88px 40px;
          font-family: ${FONT_B};
          overflow: hidden;
        }
        .ucn03svc-inner { max-width: 1200px; margin: 0 auto; position: relative; z-index: 1; }
        .ucn03svc-header { text-align: center; margin-bottom: 56px; }
        .ucn03svc-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          font-family: ${FONT_H};
          font-size: 0.78rem;
          font-weight: 700;
          letter-spacing: 2.5px;
          text-transform: uppercase;
          color: ${GREEN};
          margin-bottom: 14px;
        }
        .ucn03svc-eyebrow::before, .ucn03svc-eyebrow::after {
          content: '';
          width: 28px; height: 1.5px;
          background: ${GREEN};
          opacity: 0.5;
        }
        .ucn03svc-h2 {
          font-family: ${FONT_H};
          font-size: clamp(1.65rem, 2.6vw, 2.3rem);
          font-weight: 800;
          color: ${DARK};
          margin: 0 0 16px 0;
          line-height: 1.2;
          letter-spacing: -0.3px;
        }
        .ucn03svc-lead {
          font-size: 1.05rem;
          color: #737b79;
          max-width: 620px;
          margin: 0 auto;
          line-height: 1.7;
        }
        .ucn03svc-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 24px;
        }
        .ucn03svc-card {
          position: relative;
          background: #ffffff;
          border: 1px solid #e8ede8;
          border-radius: 14px;
          padding: 34px 26px 30px;
          opacity: 0;
          transform: translateY(22px);
          transition: opacity 0.55s ease, transform 0.55s cubic-bezier(.22,.68,0,1),
                      border-color 0.35s ease, box-shadow 0.35s ease;
        }
        .ucn03svc-section.vis .ucn03svc-card {
          opacity: 1;
          transform: none;
        }
        .ucn03svc-card:nth-child(1) { transition-delay: 0s; }
        .ucn03svc-card:nth-child(2) { transition-delay: 0.1s; }
        .ucn03svc-card:nth-child(3) { transition-delay: 0.2s; }
        .ucn03svc-card:nth-child(4) { transition-delay: 0.3s; }
        .ucn03svc-card::before {
          content: '';
          position: absolute;
          top: 0; left: 24px; right: 24px;
          height: 3px;
          background: ${GREEN};
          border-radius: 0 0 3px 3px;
          transform: scaleX(0);
          transform-origin: left;
          transition: transform 0.4s cubic-bezier(.22,.68,0,1);
        }
        .ucn03svc-card:hover::before { transform: scaleX(1); }
        .ucn03svc-card:hover {
          border-color: rgba(142,198,63,0.5);
          box-shadow: 0 12px 36px rgba(0,32,0,0.1), 0 0 0 1px rgba(142,198,63,0.15);
          transform: translateY(-5px) !important;
        }
        .ucn03svc-icon {
          width: 56px;
          height: 56px;
          background: linear-gradient(135deg, #f0f7e6 0%, #e6f2d8 100%);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 22px;
          transition: transform 0.35s cubic-bezier(.22,.68,0,1), box-shadow 0.3s ease;
        }
        .ucn03svc-card:hover .ucn03svc-icon {
          transform: scale(1.08) rotate(-3deg);
          box-shadow: 0 6px 16px rgba(142,198,63,0.25);
        }
        .ucn03svc-name {
          font-family: ${FONT_H};
          font-size: 1.02rem;
          font-weight: 700;
          color: ${DARK};
          margin: 0 0 10px 0;
          line-height: 1.35;
        }
        .ucn03svc-desc {
          font-size: 0.88rem;
          color: #737b79;
          line-height: 1.7;
          margin: 0;
        }
        @media (max-width: 1000px) { .ucn03svc-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 600px) {
          .ucn03svc-section { padding: 56px 20px; }
          .ucn03svc-grid { grid-template-columns: 1fr; gap: 16px; }
          .ucn03svc-card { padding: 28px 20px 24px; }
        }
      `}</style>

      <section className={`ucn03svc-section${vis ? " vis" : ""}`} data-template="ucetni-03-services" id="sluzby" ref={sectionRef}>
        <div className="ucn03svc-inner">
          {showHeader && (
            <div className="ucn03svc-header">
              {eyebrow.trim() && (
                <div className="ucn03svc-eyebrow">
                  <GenericEditableText sectionId={sectionId} field="eyebrow" value={eyebrow} tag="span" />
                </div>
              )}
              {title.trim() && (
                <h2 className="ucn03svc-h2">
                  <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
                </h2>
              )}
              {lead.trim() && (
                <p className="ucn03svc-lead">
                  <GenericEditableText sectionId={sectionId} field="lead" value={lead} tag="span" />
                </p>
              )}
            </div>
          )}

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
// „Prosperita Finance" — services LUXE. Světlé pozadí, 4 karty (Hypotéky/Pojištění/
// Investice/Plán). Gold top-accent reveal, navy→gold icon tile, arrow reveal, lift.
// navy #1B3A6B + gold #C8923A + Inter. Editovatelný eyebrow + conditional header.
// ─────────────────────────────────────────────────────────────────────────────
function ServicesUcetni04({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const NAVY  = "#1B3A6B";
  const GOLD  = "#C8923A";
  const DARK  = "#1a2332";
  const MUTED = "#6b7280";
  const FONT  = "'Inter', 'Helvetica Neue', Arial, sans-serif";

  const eyebrowRaw   = (content as Record<string, unknown>).eyebrow;
  const headingRaw   = (content as Record<string, unknown>).heading;
  const subheadingRaw= (content as Record<string, unknown>).subheading;
  const eyebrow    = eyebrowRaw    === undefined ? "Naše služby" : String(eyebrowRaw);
  const heading    = headingRaw    === undefined ? "Jak vám pomůžeme?" : String(headingRaw);
  const subheading = subheadingRaw === undefined ? "Každá životní situace je jiná. Proto nabízíme řešení přesně na míru – od prvního rozhovoru až po dlouhodobý finanční plán." : String(subheadingRaw);
  const showHeader = !!(eyebrow.trim() || heading.trim() || subheading.trim());
  const rawItems   = Array.isArray(content.items) ? content.items as Array<{ icon?: string; title?: string; description?: string; href?: string }> : [];
  const items      = rawItems.length > 0 ? rawItems : [
    { icon: "Home",       title: "Hypotéky a bydlení",  description: "Vyjednáme pro vás nejvýhodnější hypotéku a provedeme vás celým procesem od výběru nemovitosti až po podpis smlouvy.", href: "/kontakt" },
    { icon: "Shield",     title: "Životní pojištění",   description: "Ochráníme vás i vaše blízké před nečekanými událostmi. Porovnáme nabídky trhu a doporučíme jen to, co skutečně potřebujete.", href: "/kontakt" },
    { icon: "TrendingUp", title: "Investice a důchod",  description: "Pomůžeme vám budovat majetek s rozumem. Nastavíme investiční strategii, která odpovídá vašim cílům, horizontu a toleranci rizika.", href: "/kontakt" },
    { icon: "FileText",   title: "Finanční plán",       description: "Sestavíme komplexní rodinný finanční plán – spoření pro děti, zajištění na stáří i ochrana příjmu v případě pracovní neschopnosti.", href: "/kontakt" },
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
        .ucn04svc { position: relative; background: linear-gradient(180deg, #F5F7FB, #ffffff 40%); font-family: ${FONT}; }
        .ucn04svc-inner { max-width: 1200px; margin: 0 auto; padding: clamp(64px,8vw,104px) 24px clamp(64px,8vw,104px); }
        .ucn04svc-hdr { max-width: 40em; margin: 0 auto clamp(40px,5vw,60px); text-align: center; }
        .ucn04svc-eyebrow { display: inline-flex; align-items: center; gap: 9px; font-size: 12.5px; font-weight: 700;
          letter-spacing: .16em; text-transform: uppercase; color: ${GOLD}; margin-bottom: 14px; }
        .ucn04svc-eyebrow::before, .ucn04svc-eyebrow::after { content: ""; width: 24px; height: 1px; background: rgba(200,146,58,0.5); }
        .ucn04svc-h2 { font-family: ${FONT}; font-size: clamp(26px,3.2vw,42px); font-weight: 800; color: ${NAVY}; letter-spacing: -0.03em; line-height: 1.12; margin: 0 0 16px; }
        .ucn04svc-sub { font-size: clamp(15px,1.5vw,17px); color: ${MUTED}; line-height: 1.68; margin: 0; }
        .ucn04svc-grid {
          list-style: none; margin: 0; padding: 0; display: grid; gap: 22px;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        }
        .ucn04svc-item {
          display: flex; align-items: stretch;
          opacity: 0; transform: translateY(22px); transition: opacity .55s ease, transform .55s ease;
        }
        .ucn04svc-item.ucn04svc-vis { opacity: 1; transform: translateY(0); }
        .ucn04svc-link {
          position: relative; overflow: hidden; padding: 34px 28px 30px; flex: 1;
          display: flex; flex-direction: column; gap: 15px; color: ${DARK}; text-decoration: none;
          border-radius: 18px; background: #fff; border: 1px solid #e6eaf1;
          box-shadow: 0 6px 20px -12px rgba(20,41,77,0.18);
          transition: box-shadow .4s cubic-bezier(.22,.68,0,1), transform .4s cubic-bezier(.22,.68,0,1), border-color .4s;
        }
        .ucn04svc-link::before { content: ""; position: absolute; top: 0; left: 0; right: 0; height: 3px;
          background: linear-gradient(90deg, ${GOLD}, #e6b968); transform: scaleX(0); transform-origin: left;
          transition: transform .45s cubic-bezier(.22,.68,0,1); }
        .ucn04svc-link:hover { transform: translateY(-6px); box-shadow: 0 24px 48px -20px rgba(20,41,77,0.32); border-color: rgba(200,146,58,0.3); }
        .ucn04svc-link:hover::before { transform: scaleX(1); }
        .ucn04svc-ico {
          width: 56px; height: 56px; border-radius: 15px; flex-shrink: 0;
          background: linear-gradient(140deg, rgba(27,58,107,0.1), rgba(27,58,107,0.05)); color: ${NAVY};
          display: flex; align-items: center; justify-content: center;
          transition: background .4s, color .4s, transform .4s cubic-bezier(.34,1.4,.5,1);
        }
        .ucn04svc-link:hover .ucn04svc-ico { background: linear-gradient(140deg, ${NAVY}, #14294d); color: #fff; transform: translateY(-2px) rotate(-4deg); }
        .ucn04svc-text { font-size: 1.18rem; font-weight: 700; color: ${NAVY}; line-height: 1.28; letter-spacing: -0.01em; }
        .ucn04svc-desc { font-size: 0.94rem; color: ${MUTED}; line-height: 1.68; flex: 1; }
        .ucn04svc-arrow { display: inline-flex; align-items: center; gap: 7px; color: ${GOLD}; font-size: 13.5px; font-weight: 700;
          letter-spacing: .02em; margin-top: 2px; opacity: .82; transition: gap .3s, opacity .3s; }
        .ucn04svc-link:hover .ucn04svc-arrow { gap: 12px; opacity: 1; }
        @media (max-width: 640px) { .ucn04svc-grid { grid-template-columns: 1fr; } }
        @media (max-width: 400px) { .ucn04svc-link { padding: 26px 22px; } }
      `}</style>
      <section ref={sectionRef} id="sluzby" className="ucn04svc" data-template="ucetni-04-services">
        <div className="ucn04svc-inner">
          {showHeader && (
            <div className="ucn04svc-hdr">
              {eyebrow.trim() && (
                <span className="ucn04svc-eyebrow">
                  <GenericEditableText sectionId={sectionId} field="eyebrow" value={eyebrow} tag="span" />
                </span>
              )}
              {heading.trim() && (
                <h2 className="ucn04svc-h2">
                  <GenericEditableText sectionId={sectionId} field="heading" value={heading} tag="span" />
                </h2>
              )}
              {subheading.trim() && (
                <p className="ucn04svc-sub">
                  <GenericEditableText sectionId={sectionId} field="subheading" value={subheading} tag="span" />
                </p>
              )}
            </div>
          )}
          <ol className="ucn04svc-grid">
            {items.map((item, i) => (
              <li
                key={i}
                className={`ucn04svc-item${visible ? " ucn04svc-vis" : ""}`}
                style={{ transitionDelay: `${i * 100}ms` }}
              >
                <a href={item.href ?? "/kontakt"} className="ucn04svc-link">
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
                  <span className="ucn04svc-arrow">
                    <GenericEditableText sectionId={sectionId} field={`items.${i}.linkLabel`} value={String((item as Record<string, unknown>).linkLabel ?? "Zjistit více")} tag="span" />
                    <span dangerouslySetInnerHTML={{ __html: icons.ArrowRight }} style={{ display: "inline-flex" }} />
                  </span>
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

  const eyebrowRaw  = (content as Record<string, unknown>).eyebrow;
  const titleRaw    = (content as Record<string, unknown>).title;
  const subtitleRaw = (content as Record<string, unknown>).subtitle;
  const eyebrow  = eyebrowRaw  === undefined ? "Co nabízíme" : String(eyebrowRaw);
  const title    = titleRaw    === undefined ? "Naše služby" : String(titleRaw);
  const subtitle = subtitleRaw === undefined ? "Komplexní úklidové a doplňkové služby pro průmyslové provozy, kanceláře, školy a další instituce." : String(subtitleRaw);
  const showHeader = !!(eyebrow.trim() || title.trim() || subtitle.trim());

  type Item = { icon?: string; name?: string; description?: string };
  const items = (content.items as Item[] | undefined) ?? [];

  // Inline SVG ikony keyed by emoji z contentu (žádné externí assety)
  const renderIcon = (emoji: string) => {
    switch (emoji) {
      case "🤖": // robotický úklid
        return (<><rect x="5" y="8" width="14" height="11" rx="2.5" /><path d="M12 8V4.5" /><circle cx="12" cy="3.5" r="1.2" /><circle cx="9.2" cy="13" r="1.1" fill="currentColor" stroke="none" /><circle cx="14.8" cy="13" r="1.1" fill="currentColor" stroke="none" /><path d="M9.5 16.2h5" /><path d="M5 12H3.2M19 12h1.8" /></>);
      case "🧹": // pravidelný úklid
        return (<><path d="M4 20l6.5-6.5" /><path d="M13.5 4.5l6 6" /><path d="M9.5 12.5l2-2 3.5-3.5 2.5 2.5-3.5 3.5-2 2z" /><path d="M4 20c2.2.4 4.4-.2 6-1.8l-4.2-4.2C4.2 15.6 3.6 17.8 4 20z" /></>);
      case "✨": // výškové práce (žebřík)
        return (<><path d="M8 3v18M16 3v18" /><path d="M8 7h8M8 11h8M8 15h8M8 19h8" /></>);
      case "⚙️": // průmyslové čištění
        return (<><path d="M12.2 2.6h-.4a1.9 1.9 0 0 0-1.9 1.9v.2a1.9 1.9 0 0 1-1 1.6l-.4.3a1.9 1.9 0 0 1-1.9 0l-.1-.1a1.9 1.9 0 0 0-2.6.7l-.2.4a1.9 1.9 0 0 0 .7 2.6l.1.1a1.9 1.9 0 0 1 1 1.6v.5a1.9 1.9 0 0 1-1 1.6l-.1.1a1.9 1.9 0 0 0-.7 2.6l.2.4a1.9 1.9 0 0 0 2.6.7l.1-.1a1.9 1.9 0 0 1 1.9 0l.4.3a1.9 1.9 0 0 1 1 1.6v.2a1.9 1.9 0 0 0 1.9 1.9h.4a1.9 1.9 0 0 0 1.9-1.9v-.2a1.9 1.9 0 0 1 1-1.6l.4-.3a1.9 1.9 0 0 1 1.9 0l.1.1a1.9 1.9 0 0 0 2.6-.7l.2-.4a1.9 1.9 0 0 0-.7-2.6l-.1-.1a1.9 1.9 0 0 1-1-1.6v-.5a1.9 1.9 0 0 1 1-1.6l.1-.1a1.9 1.9 0 0 0 .7-2.6l-.2-.4a1.9 1.9 0 0 0-2.6-.7l-.1.1a1.9 1.9 0 0 1-1.9 0l-.4-.3a1.9 1.9 0 0 1-1-1.6v-.2a1.9 1.9 0 0 0-1.9-1.9z" /><circle cx="12" cy="12" r="3" /></>);
      case "🛡️": // ostraha objektů
        return (<><path d="M12 3l7 3v5c0 4.4-3 8.2-7 9.5-4-1.3-7-5.1-7-9.5V6l7-3z" /><path d="M9 12l2 2 4-4" /></>);
      default:
        return (<><circle cx="12" cy="12" r="9" /><path d="M8 12l3 3 5-6" /></>);
    }
  };

  const styles = `
    .c01svc-section {
      position: relative;
      background:
        radial-gradient(90% 60% at 50% -5%, rgba(105,190,40,0.10), transparent 60%),
        ${DARK};
      font-family: ${FONT};
      padding: 6rem 1.5rem;
      overflow: hidden;
    }
    .c01svc-inner { max-width: 1200px; margin: 0 auto; }
    .c01svc-header {
      text-align: center;
      max-width: 680px;
      margin: 0 auto 3.4rem;
    }
    .c01svc-eyebrow {
      display: inline-flex;
      align-items: center;
      gap: 0.7rem;
      font-size: 0.76rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.18em;
      color: ${GREEN};
      margin-bottom: 1rem;
    }
    .c01svc-eyebrow::before { content: ""; width: 2rem; height: 2px; background: ${GREEN}; }
    .c01svc-title {
      font-family: ${FONT};
      font-size: clamp(1.9rem, 3.6vw, 2.9rem);
      font-weight: 700;
      color: #ffffff;
      letter-spacing: 0.005em;
      line-height: 1.15;
      margin: 0 0 1rem;
    }
    .c01svc-subtitle {
      font-size: 1.05rem;
      color: rgba(255,255,255,0.62);
      margin: 0 auto;
      line-height: 1.7;
    }
    .c01svc-grid {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 14px;
      overflow: hidden;
      background: rgba(255,255,255,0.02);
      box-shadow: 0 30px 60px -40px rgba(0,0,0,0.9);
    }
    .c01svc-tile {
      position: relative;
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      padding: 2.8rem 1.4rem 2.5rem;
      border-right: 1px solid rgba(255,255,255,0.08);
      transition: background 0.35s ease;
      cursor: default;
    }
    .c01svc-tile:last-child { border-right: none; }
    .c01svc-tile::before {
      content: "";
      position: absolute;
      top: 0; left: 0; right: 0;
      height: 3px;
      background: ${GREEN};
      transform: scaleX(0);
      transform-origin: left;
      transition: transform 0.4s cubic-bezier(.2,.7,.2,1);
    }
    .c01svc-tile:hover { background: rgba(105,190,40,0.07); }
    .c01svc-tile:hover::before { transform: scaleX(1); }
    .c01svc-ic {
      width: 74px;
      height: 74px;
      margin-bottom: 1.4rem;
      border-radius: 50%;
      border: 1px solid rgba(255,255,255,0.16);
      display: flex;
      align-items: center;
      justify-content: center;
      color: ${GREEN};
      transition: background 0.4s cubic-bezier(.2,.7,.2,1), color 0.35s ease, border-color 0.35s ease, transform 0.45s cubic-bezier(.2,.7,.2,1);
    }
    .c01svc-ic svg { width: 34px; height: 34px; }
    .c01svc-tile:hover .c01svc-ic {
      background: ${GREEN};
      border-color: ${GREEN};
      color: #ffffff;
      transform: translateY(-4px) scale(1.06);
    }
    .c01svc-name {
      font-size: 0.98rem;
      font-weight: 700;
      color: #ffffff;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      margin-bottom: 0.65rem;
      line-height: 1.3;
      transition: color 0.3s ease;
    }
    .c01svc-tile:hover .c01svc-name { color: ${GREEN}; }
    .c01svc-desc {
      font-size: 0.85rem;
      color: rgba(255,255,255,0.55);
      line-height: 1.6;
    }
    @media (max-width: 62rem) {
      .c01svc-grid { grid-template-columns: 1fr 1fr 1fr; }
      .c01svc-tile { border-bottom: 1px solid rgba(255,255,255,0.08); }
    }
    @media (max-width: 40rem) {
      .c01svc-section { padding: 4rem 1.1rem; }
      .c01svc-grid { grid-template-columns: 1fr 1fr; }
      .c01svc-tile { padding: 2.2rem 1rem 2rem; }
      .c01svc-tile:nth-child(odd) { border-right: 1px solid rgba(255,255,255,0.08); }
      .c01svc-tile:nth-child(even) { border-right: none; }
    }
    @media (max-width: 26rem) {
      .c01svc-grid { grid-template-columns: 1fr; }
      .c01svc-tile { border-right: none !important; }
    }
  `;

  return (
    <section id="sluzby" className="c01svc-section" data-template="clean-01">
      <style>{styles}</style>
      <div className="c01svc-inner">
        {showHeader && (
          <div className="c01svc-header">
            {!!eyebrow.trim() && (
              <span className="c01svc-eyebrow">
                <GenericEditableText sectionId={sectionId} field="eyebrow" value={eyebrow} tag="span" />
              </span>
            )}
            {!!title.trim() && (
              <h2 className="c01svc-title">
                <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
              </h2>
            )}
            {!!subtitle.trim() && (
              <p className="c01svc-subtitle">
                <GenericEditableText sectionId={sectionId} field="subtitle" value={subtitle} tag="span" />
              </p>
            )}
          </div>
        )}
        <div className="c01svc-grid">
          {items.map((item, i) => {
            const icon = String(item.icon ?? "🧹");
            return (
              <div key={i} className="c01svc-tile">
                <span className="c01svc-ic" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
                    {renderIcon(icon)}
                  </svg>
                </span>
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

  const kickerRaw = c.kicker as string | undefined;
  const titleRaw  = c.title  as string | undefined;
  const bodyRaw   = c.subtitle as string | undefined;
  const hasText = (v: unknown) => typeof v === "string" && v.trim() !== "";
  const showHeader = hasText(kickerRaw) || hasText(titleRaw) || hasText(bodyRaw);

  const kicker   = String(kickerRaw   ?? "Naše služby");
  const title    = String(titleRaw    ?? "Kompletní topenářské a instalatérské práce");
  const subtitle = String(bodyRaw     ?? "Topení, voda i elektro na jednom místě — od havárie po kompletní rekonstrukci.");
  const items    = (c.items as Array<{ title: string; description: string; ctaText: string; ctaHref: string; icon: string; image: string }>) ?? [];

  const iconPaths: Record<string, React.ReactNode> = {
    flame:       <path d="M12 2c0 6-6 8-6 14a6 6 0 0 0 12 0c0-6-6-8-6-14z M9.5 14.5c0 1.38 1.12 2.5 2.5 2.5s2.5-1.12 2.5-2.5c0-2.5-2.5-3.5-2.5-5 0 1.5-2.5 2.5-2.5 5z" fill="none" stroke={WHITE} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>,
    thermometer: <><path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z" fill="none" stroke={WHITE} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></>,
    droplets:    <><path d="M7 16.3c2.2 0 4-1.83 4-4.05 0-1.16-.57-2.26-1.71-3.19S7.29 6.75 7 5.3c-.29 1.45-1.14 2.84-2.29 3.76S3 11.1 3 12.25c0 2.22 1.8 4.05 4 4.05z" fill="none" stroke={WHITE} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/><path d="M12.56 6.6A10.97 10.97 0 0 0 14 3.02c.5 2.5 2 4.9 3 5.5 2 1.2 3 2.5 3 4.5a6 6 0 0 1-6 6 4.5 4.5 0 0 1-4.5-4.5" fill="none" stroke={WHITE} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></>,
    zap:         <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" fill="none" stroke={WHITE} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>,
    wrench:      <><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" fill="none" stroke={WHITE} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></>,
  };

  return (
    <section
      id="sluzby"
      data-template="instala-02-services"
      style={{ backgroundColor: "#0e0e0e", fontFamily: FONT_B, padding: "96px 0" }}
    >
      <div className="i2s-outer">
        {showHeader && (
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
        )}

        <div className="i2s-grid">
          {items.map((item, i) => (
            <div key={i} className="i2s-card">
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
                    {iconPaths[item.icon] ?? iconPaths.wrench}
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
function ServicesKlima01({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  type Item = { icon?: string; name?: string; description?: string };
  const eyebrow  = String(content.eyebrow  ?? "Naše služby");
  const title    = String(content.title    ?? "Co pro vás dokážeme zajistit");
  const subtitle = String(content.subtitle ?? "Od prvního návrhu přes realizaci až po záruční i pozáruční péči — kompletní servis na jednom místě.");
  const items    = ((content.items as Item[]) ?? []).slice(0, 6);

  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); io.disconnect(); } }, { threshold: 0.12 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const svcIcons = [
    <svg key="0" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="6" width="20" height="12" rx="2"/><path d="M12 12h.01"/><path d="M17 12h.01"/><path d="M7 12h.01"/></svg>,
    <svg key="1" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3c1 3 4 4 4 8a4 4 0 1 1-8 0c0-2 1-3 2-4"/><path d="M12 12v9"/></svg>,
    <svg key="2" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>,
    <svg key="3" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>,
    <svg key="4" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>,
    <svg key="5" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>,
  ];

  return (
    <section ref={ref} className="kl01-svc" data-template="klima-01">
      <div className="kl01-svc-wrap">
        <div className="kl01-svc-header">
          <p className="kl01-svc-eyebrow">
            <span className="kl01-svc-eline" aria-hidden="true" />
            <GenericEditableText sectionId={sectionId} field="eyebrow" value={eyebrow} tag="span" />
          </p>
          <h2 className="kl01-svc-title">
            <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
          </h2>
          <p className="kl01-svc-sub">
            <GenericEditableText sectionId={sectionId} field="subtitle" value={subtitle} tag="span" />
          </p>
        </div>

        <div className="kl01-svc-grid">
          {items.map((item, i) => (
            <div key={i} className="kl01-svc-card" style={{
              opacity: visible ? 1 : 0,
              transform: visible ? "translateY(0)" : "translateY(24px)",
              transition: `opacity 0.6s ease ${i * 80}ms, transform 0.6s cubic-bezier(0.4,0,0.2,1) ${i * 80}ms`,
            }}>
              <div className="kl01-svc-icon" aria-hidden="true">
                {svcIcons[i] ?? svcIcons[0]}
              </div>
              <h3 className="kl01-svc-name">
                <GenericEditableText sectionId={sectionId} field={`items.${i}.name`} value={String(item.name ?? "")} tag="span" />
              </h3>
              <p className="kl01-svc-desc">
                <GenericEditableText sectionId={sectionId} field={`items.${i}.description`} value={String(item.description ?? "")} tag="span" />
              </p>
              <span className="kl01-svc-line" aria-hidden="true" />
            </div>
          ))}
        </div>
      </div>
    </section>
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
// VYLEPŠENO (luxe malíř):
// - Section header: amber eyebrow + Playfair title + amber rule
// - 2 full-bleed karty (Malování/Lakování) s bg foto cover
// - Hover: image zoom 1.06 + overlay lighten + amber left border reveal
// - Amber Playfair H3 + Raleway popis + navy CTA s shimmer
// - Conditional header pro podstránky
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
  const WHITE    = "#ffffff";
  const DARK     = "#1a1a1a";
  const FONT_H   = "'Playfair Display', Georgia, serif";
  const FONT_B   = "'Raleway', sans-serif";

  const eyebrow  = String(content.eyebrow ?? content.tagline ?? "Naše specializace");
  const title    = String(content.title ?? "Co pro vás uděláme");
  const subtitle = String(content.subtitle ?? "");
  const showHeader = !!(eyebrow.trim() || title.trim() || subtitle.trim());

  type Item = { name: string; description: string; image: string; ctaText: string; ctaHref: string };
  const defaultItems: Item[] = [
    { name: "Malování interiérů", description: "Kompletní malířské práce — od přípravy povrchů přes stěrkování po finální nátěr. Pracujeme s barvami Primalex a Dulux.", image: "/templates/malir-01/svc-malovani.webp", ctaText: "Zjistit více", ctaHref: "/malovani" },
    { name: "Lakování & nátěry", description: "Profesionální lakování oken, dveří, zábradlí i nábytku. Renovace i nové nátěry dřevěných prvků s dlouhou životností.", image: "/templates/malir-01/svc-lakovani.webp", ctaText: "Zjistit více", ctaHref: "/lakovani" },
  ];
  const items: Item[] = Array.isArray(content.items) && (content.items as unknown[]).length
    ? (content.items as Item[])
    : defaultItems;

  const resolve = (href: string) => resolveDemoHref(href, tenantSlug, isAdmin);

  return (
    <section id="sluzby" data-template="malir-01" style={{
      background: WHITE, padding: showHeader ? "clamp(60px, 8vw, 100px) 0 0" : "0",
      fontFamily: FONT_B,
    }}>
      {/* Section header */}
      {showHeader && (
        <div style={{ textAlign: "center", marginBottom: "clamp(36px, 5vw, 56px)", padding: "0 30px" }}>
          <div className="m01s-reveal" style={{ display: "flex", alignItems: "center", gap: 12, justifyContent: "center", marginBottom: 14 }}>
            <span style={{ width: 32, height: 1, background: AMBER }} />
            <GenericEditableText sectionId={sectionId} field="eyebrow" value={eyebrow} tag="span" style={{
              fontFamily: FONT_B, fontWeight: 600, fontSize: 12, color: AMBER,
              letterSpacing: "0.14em", textTransform: "uppercase" as const,
            }} />
            <span style={{ width: 32, height: 1, background: AMBER }} />
          </div>
          <div className="m01s-reveal" style={{ animationDelay: "0.1s" }}>
            <GenericEditableText sectionId={sectionId} field="title" value={title} tag="h2" style={{
              fontFamily: FONT_H, fontWeight: 800,
              fontSize: "clamp(28px, 3.5vw, 42px)", lineHeight: 1.18,
              color: DARK, margin: "0 auto", maxWidth: 600,
            }} />
          </div>
          <div className="m01s-reveal" style={{ animationDelay: "0.15s" }}>
            <div style={{ width: 48, height: 3, background: AMBER, borderRadius: 2, margin: "18px auto 0" }} />
          </div>
        </div>
      )}

      {/* Service cards */}
      <div style={{ display: "flex" }} className="m01s-cards">
        {items.map((item, i) => (
          <a key={i} href={resolve(item.ctaHref)} className="m01s-card" style={{
            position: "relative", flex: 1, minHeight: "clamp(320px, 40vw, 420px)",
            overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center",
            flexDirection: "column", textAlign: "center", textDecoration: "none",
            cursor: "pointer",
          }}>
            <GenericEditableImage sectionId={sectionId} field={`items.${i}.image`} src={item.image} alt={item.name} style={{ position: "absolute", inset: 0 }}>
              <img loading="lazy" src={item.image} alt={item.name} className="m01s-card-img" style={{
                width: "100%", height: "100%", objectFit: "cover", display: "block",
                transition: "transform 0.7s cubic-bezier(.4,0,.2,1)",
              }} />
            </GenericEditableImage>
            {/* Overlay */}
            <div className="m01s-overlay" style={{
              position: "absolute", inset: 0,
              background: "linear-gradient(to top, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0.15) 100%)",
              transition: "background 0.4s",
            }} />
            {/* Amber left border accent (reveal on hover) */}
            <div className="m01s-accent" style={{
              position: "absolute", left: 0, top: "15%", bottom: "15%", width: 3,
              background: AMBER, transform: "scaleY(0)", transformOrigin: "center",
              transition: "transform 0.4s cubic-bezier(.4,0,.2,1)",
            }} />
            {/* Content */}
            <div style={{ position: "relative", zIndex: 2, padding: "0 clamp(20px, 4vw, 48px)" }}>
              <GenericEditableText sectionId={sectionId} field={`items.${i}.name`} value={item.name} tag="h3" style={{
                fontFamily: FONT_H, fontSize: "clamp(32px, 4vw, 48px)", fontWeight: 800,
                color: AMBER, lineHeight: 1.1, margin: "0 0 12px",
              }} />
              <GenericEditableText sectionId={sectionId} field={`items.${i}.description`} value={item.description} tag="p" style={{
                fontFamily: FONT_B, fontSize: 15, fontWeight: 400,
                color: `${WHITE}dd`, margin: "0 0 24px", lineHeight: 1.65,
                maxWidth: 380,
              }} />
              <span className="m01s-btn" style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                padding: "12px 32px",
                background: NAVY, color: WHITE,
                fontFamily: FONT_B, fontWeight: 700, fontSize: 13,
                letterSpacing: "0.06em", textTransform: "uppercase" as const,
                borderRadius: 4, position: "relative", overflow: "hidden",
                transition: "all 0.3s cubic-bezier(.4,0,.2,1)",
              }}>
                <GenericEditableText sectionId={sectionId} field={`items.${i}.ctaText`} value={item.ctaText} tag="span" />
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
              </span>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}

// ── clean-02-services ─────────────────────────────────────────────────────────
// Arctic Editorial: paper bg, levý editorial header, 3×2 grid bílých karet
// s foto 4/3 (cover, zoom on hover), hairline bordery, plně editovatelné
// texty i fotky (GenericEditableImage per item).
function ServicesClean02({ content, sectionId, tenantSlug, isAdmin }: { content: Record<string, unknown>; sectionId: number; tenantSlug?: string; isAdmin: boolean }) {
  const eyebrow = String(content.eyebrow ?? "Naše služby");
  const title   = String(content.title   ?? "Jedna firma pro každý prostor");
  const sub     = String(content.subtitle ?? "Kompletní úklidový servis — od kanceláří a bytových domů přes generální úklidy až po strojové čištění garáží a mytí oken.");
  const linkLabel = String(content.linkLabel ?? "Více o službě");
  const items   = (content.items as Array<{ image?: string; title?: string; name?: string; description?: string; href?: string }>) ?? [];

  const resolve = (href: string) => {
    if (!tenantSlug || href.startsWith("http") || href.startsWith("#")) return href;
    const base = isAdmin ? `/demo/${tenantSlug}/admin` : `/demo/${tenantSlug}`;
    return href === "/" ? base : `${base}${href}`;
  };

  return (
    <>
      <style>{`
        .c02sv-section {
          background: #F4F6F9;
          padding: clamp(4rem, 8vw, 7rem) 0;
          font-family: 'Onest', sans-serif;
        }
        .c02sv-inner { max-width: 76rem; margin: 0 auto; padding: 0 clamp(1.25rem, 4vw, 2.5rem); }
        .c02sv-head {
          display: grid; grid-template-columns: minmax(0, 7fr) minmax(0, 5fr);
          gap: 1.5rem 4rem; align-items: end;
          margin-bottom: clamp(2.2rem, 4.5vw, 3.5rem);
        }
        .c02sv-tagline {
          display: inline-flex; align-items: center; gap: 0.55rem;
          font-size: 0.8rem; font-weight: 700; letter-spacing: 0.14em;
          text-transform: uppercase; color: #1B5BFF;
          margin-bottom: 1.1rem;
        }
        .c02sv-tagline::before { content: ""; width: 22px; height: 2px; background: #1B5BFF; border-radius: 2px; }
        .c02sv-h2 {
          font-family: 'Bricolage Grotesque', sans-serif;
          font-size: clamp(1.9rem, 3.4vw, 2.9rem);
          font-weight: 750; color: #0B1526;
          line-height: 1.08; margin: 0;
          letter-spacing: -0.03em; text-wrap: balance;
        }
        .c02sv-sub {
          font-size: 1.02rem; color: #5B6577;
          line-height: 1.7; margin: 0 0 0.3rem;
        }
        .c02sv-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1.3rem;
        }
        .c02sv-card {
          background: #fff;
          border: 1px solid #E7EBF2;
          border-radius: 18px;
          overflow: hidden;
          display: flex; flex-direction: column;
          transition: box-shadow 0.3s, transform 0.3s, border-color 0.3s;
        }
        .c02sv-card:hover {
          transform: translateY(-4px);
          border-color: #D7E1F0;
          box-shadow: 0 30px 55px -30px rgba(11,21,38,0.28);
        }
        .c02sv-img-wrap {
          width: 100%; aspect-ratio: 4/3; overflow: hidden;
          background: #E7EBF2; position: relative;
        }
        .c02sv-img-wrap img {
          width: 100%; height: 100%;
          object-fit: cover; object-position: center;
          display: block;
          transition: transform 0.5s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .c02sv-card:hover .c02sv-img-wrap img { transform: scale(1.045); }
        .c02sv-body { padding: 1.45rem 1.5rem 1.55rem; display: flex; flex-direction: column; flex: 1; }
        .c02sv-card-title {
          font-family: 'Bricolage Grotesque', sans-serif;
          font-size: 1.18rem; font-weight: 700; letter-spacing: -0.015em;
          color: #0B1526; margin: 0 0 0.5rem; line-height: 1.25;
        }
        .c02sv-card-desc {
          font-size: 0.92rem; color: #5B6577;
          line-height: 1.66; margin: 0 0 1.2rem; flex: 1;
        }
        .c02sv-btn {
          display: inline-flex; align-items: center; gap: 0.45rem;
          font-size: 0.88rem; font-weight: 700;
          color: #1B5BFF; text-decoration: none;
          transition: gap 0.2s;
          margin-top: auto;
        }
        .c02sv-btn:hover { gap: 0.7rem; }

        @media (max-width: 960px) {
          .c02sv-head { grid-template-columns: 1fr; gap: 1.1rem; }
          .c02sv-grid { grid-template-columns: repeat(2, 1fr); gap: 1rem; }
        }
        @media (max-width: 560px) { .c02sv-grid { grid-template-columns: 1fr; } }
        @media (prefers-reduced-motion: reduce) {
          .c02sv-card, .c02sv-img-wrap img { transition: none !important; }
        }
      `}</style>

      <section className="c02sv-section" id="sluzby" data-template="clean-02-services">
        <div className="c02sv-inner">

          <div className="c02sv-head">
            <div>
              <div className="c02sv-tagline">
                <GenericEditableText sectionId={sectionId} field="eyebrow" value={eyebrow} tag="span" />
              </div>
              <h2 className="c02sv-h2">
                <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
              </h2>
            </div>
            <p className="c02sv-sub">
              <GenericEditableText sectionId={sectionId} field="subtitle" value={sub} tag="span" />
            </p>
          </div>

          <div className="c02sv-grid">
            {items.map((item, i) => {
              const label = item.title ?? item.name ?? "";
              return (
                <article key={i} className="c02sv-card">
                  {item.image && (
                    <div className="c02sv-img-wrap">
                      <GenericEditableImage sectionId={sectionId} field={`items.${i}.image`} src={item.image} alt={label} className="absolute inset-0 w-full h-full" style={{ position: "absolute" }}>
                        <img src={item.image} alt={label} loading="lazy" />
                      </GenericEditableImage>
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
                      {linkLabel}
                      <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                        <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </a>
                  </div>
                </article>
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
  const eyebrowRaw = content.eyebrow;
  const showHeader = eyebrowRaw !== "";
  const eyebrow = eyebrowRaw === undefined ? "Certifikované DDD zásahy" : String(eyebrowRaw);
  const title    = String(content.title ?? "Co řešíme");
  const bullets  = (content.bullets as Array<{ label: string; href?: string }>) ?? [];
  const cards    = (content.cards as Array<{ url: string; alt?: string; caption?: string; href?: string }>) ?? [];

  const resolve = (href: string) => resolveDemoHref(href, tenantSlug, isAdmin);

  return (
    <section className="ddd01sv-wrap" id="sluzby" data-template="ddd-01">
      <style>{`        .ddd01sv-wrap {
          font-family: 'Figtree', system-ui, sans-serif;
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
          color: #0c93eb;
          font-size: clamp(0.84rem, 0.32vw + 0.77rem, 1.06rem);
          font-weight: 400;
          letter-spacing: 0.375rem;
          text-transform: uppercase;
          margin-bottom: 0.6rem;
        }
        .ddd01sv-h2 {
          font-family: 'Figtree', system-ui, sans-serif;
          color: #015ba3;
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
          color: #0c93eb;
          font-weight: 700;
        }
        .ddd01sv-list a {
          color: inherit;
          text-decoration: none;
          transition: color 0.15s;
        }
        .ddd01sv-list a:hover { color: #0c93eb; }

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
        .ddd01sv-card > *:not(.ddd01sv-card-caption) {
          width: 100%;
          height: 100%;
        }
        .ddd01sv-card-caption {
          z-index: 1;
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
      
        .ddd01sv-header { margin-bottom: 2.25rem; }
      `}</style>
      <div className="ddd01sv-inner">

        {showHeader && (
          <div className="ddd01sv-header">
            <p className="ddd01sv-eyebrow">
              <GenericEditableText sectionId={sectionId} field="eyebrow" value={eyebrow} tag="span" />
            </p>
            <h2 className="ddd01sv-h2">
              <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
            </h2>
          </div>
        )}

        <div className="ddd01sv-grid">

          {/* LEFT: bullet list */}
          <div className="ddd01sv-left">
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
  );
}

// ── hotel-01-rooms ────────────────────────────────────────────────────────────
function ServicesHotel01Rooms({ content, sectionId, tenantSlug, isAdmin }: { content: Record<string, unknown>; sectionId: number; tenantSlug?: string; isAdmin: boolean }) {
  const c       = (content ?? {}) as Record<string, any>;
  const showHeader = c.showHeader !== false;
  const eyebrow = c.eyebrow  ?? "Ubytování";
  const title   = c.title    ?? "Pokoje a suity pro každou příležitost";
  const titleAccent = c.titleAccent ?? "suity";
  const subtitle= c.subtitle ?? "";
  const roomLabel = c.roomLabel ?? "Kategorie";
  const priceLabel = c.priceLabel ?? "Od";
  const priceSuffix = c.priceSuffix ?? "/ noc";
  const moreLabel = c.moreLabel ?? "Více informací";
  const bookLabel = c.bookLabel ?? "Rezervovat";
  const items: {
    name: string;
    description: string;
    image: string;
    moreHref: string;
    bookHref: string;
    price?: string;
    size?: string;
    beds?: string;
    guests?: string;
    amenities?: string[];
  }[] = Array.isArray(c.items) ? c.items : [];

  const [active, setActive] = useState(0);

  const href = (h: string) => resolveDemoHref(h ?? "#", tenantSlug, isAdmin);
  const idx2 = (n: number) => String(n + 1).padStart(2, "0");

  const renderTitle = () => {
    if (!titleAccent || !title.includes(titleAccent)) {
      return <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />;
    }
    const parts = title.split(titleAccent);
    return (
      <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span">
        <>{parts[0]}<em className="h01rooms-accent">{titleAccent}</em>{parts.slice(1).join(titleAccent)}</>
      </GenericEditableText>
    );
  };

  const room = items[active];

  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Poppins:wght@300;400;500&display=swap" />
      <style>{`
        .h01rooms {
          background: #fff;
          padding: clamp(80px,10vw,140px) 0 clamp(80px,8vw,120px);
          font-family: 'Poppins', sans-serif;
          position: relative; overflow: hidden;
        }
        .h01rooms::before {
          content: ''; position: absolute; top: 0; left: 50%; transform: translateX(-50%);
          width: min(1400px, 96%); height: 1px;
          background: linear-gradient(90deg, transparent 0%, rgba(169,135,99,.35) 20%, rgba(169,135,99,.55) 50%, rgba(169,135,99,.35) 80%, transparent 100%);
          pointer-events: none;
        }

        .h01rooms-header {
          max-width: 1240px; margin: 0 auto clamp(48px, 6vw, 80px);
          padding: 0 clamp(20px,5vw,80px);
          text-align: center;
        }
        .h01rooms-eyebrow {
          font-family: 'Playfair Display', Georgia, serif;
          font-style: italic; font-weight: 400;
          font-size: 13px; letter-spacing: 0.28em; text-transform: uppercase;
          color: #a98763; margin: 0 0 24px;
          display: inline-flex; align-items: center; gap: 18px;
        }
        .h01rooms-eyebrow::before, .h01rooms-eyebrow::after {
          content: ''; display: inline-block; width: 40px; height: 1px; background: #a98763;
        }
        .h01rooms-title {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: clamp(32px,4vw,54px); font-weight: 400;
          color: #3e3e3e; margin: 0 0 20px; line-height: 1.12;
          letter-spacing: 0.005em;
        }
        .h01rooms-accent { font-style: italic; color: #a98763; font-weight: 500; }
        .h01rooms-subtitle {
          font-size: 15.5px; color: #797979; font-weight: 300;
          max-width: 680px; margin: 0 auto; line-height: 1.75;
        }

        /* Editorial tabs — with numbers */
        .h01rooms-tabs {
          display: flex; justify-content: center; flex-wrap: wrap;
          margin: 0 auto; max-width: 1240px; padding: 0 clamp(20px,5vw,80px);
          gap: 0; position: relative;
        }
        .h01rooms-tabs::after {
          content: ''; position: absolute; left: clamp(20px,5vw,80px); right: clamp(20px,5vw,80px); bottom: 0;
          height: 1px; background: rgba(169,135,99,.22);
        }
        .h01rooms-tab {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: 14px; letter-spacing: 0.14em; text-transform: uppercase;
          color: #797979; background: none; border: none; cursor: pointer;
          padding: 18px 26px; position: relative; transition: color .35s;
          white-space: nowrap; z-index: 1;
          display: inline-flex; align-items: baseline; gap: 12px;
        }
        .h01rooms-tab-num {
          font-style: italic; font-size: 12px; color: #a98763;
          font-weight: 500; opacity: .6; transition: opacity .35s;
        }
        .h01rooms-tab::after {
          content: ''; position: absolute; bottom: 0; left: 26px; right: 26px;
          height: 2px; background: #a98763;
          transform: scaleX(0); transform-origin: left;
          transition: transform .55s cubic-bezier(.22,.68,0,1.1);
        }
        .h01rooms-tab.active { color: #1a1714; }
        .h01rooms-tab.active .h01rooms-tab-num { opacity: 1; }
        .h01rooms-tab.active::after { transform: scaleX(1); }
        .h01rooms-tab:hover { color: #3e3e3e; }
        .h01rooms-tab:hover .h01rooms-tab-num { opacity: 1; }

        /* Card */
        .h01rooms-card {
          max-width: 1240px; margin: 0 auto;
          padding: clamp(48px, 5vw, 72px) clamp(20px,5vw,80px) 0;
          display: grid; grid-template-columns: 1.15fr 1fr; gap: clamp(48px, 6vw, 88px);
          align-items: center;
        }
        .h01rooms-img-col { position: relative; }
        .h01rooms-img-wrap {
          position: relative; overflow: hidden; aspect-ratio: 4/5;
          background: #efe6d9;
        }
        .h01rooms-img {
          width: 100%; height: 100%; object-fit: cover; display: block;
          transition: transform 1.4s cubic-bezier(.22,.68,0,1.1), filter .8s;
          filter: sepia(.05) contrast(1.03);
        }
        .h01rooms-img-wrap:hover .h01rooms-img { transform: scale(1.06); filter: sepia(0) contrast(1.06); }

        /* Photo overlay label */
        .h01rooms-img-overlay {
          position: absolute; left: 0; bottom: 0; right: 0; z-index: 2;
          padding: 26px 24px;
          background: linear-gradient(180deg, transparent 0%, rgba(20,17,14,.62) 100%);
          display: flex; align-items: end; justify-content: space-between; gap: 14px;
          color: #fff;
        }
        .h01rooms-img-badge {
          font-family: 'Playfair Display', Georgia, serif;
          font-style: italic; font-size: 12px; letter-spacing: 0.24em; text-transform: uppercase;
          color: rgba(212,176,136,.95);
          display: inline-flex; align-items: center; gap: 12px;
        }
        .h01rooms-img-badge::before { content: ''; width: 22px; height: 1px; background: #a98763; }
        .h01rooms-img-num {
          font-family: 'Playfair Display', Georgia, serif;
          font-style: italic; font-weight: 500;
          font-size: 42px; color: rgba(255,255,255,.92); line-height: 1;
        }

        /* corner brackets */
        .h01rooms-corner {
          position: absolute; width: 28px; height: 28px; z-index: 3; pointer-events: none;
          opacity: 0; transition: opacity .5s cubic-bezier(.22,.68,0,1.1), transform .5s cubic-bezier(.22,.68,0,1.1);
        }
        .h01rooms-img-wrap:hover .h01rooms-corner { opacity: 1; }
        .h01rooms-corner svg { width: 100%; height: 100%; color: #a98763; }
        .h01rooms-corner.tl { top: -6px; left: -6px; transform: translate(4px,4px); }
        .h01rooms-corner.tr { top: -6px; right: -6px; transform: translate(-4px,4px) scaleX(-1); }
        .h01rooms-corner.bl { bottom: -6px; left: -6px; transform: translate(4px,-4px) scaleY(-1); }
        .h01rooms-corner.br { bottom: -6px; right: -6px; transform: translate(-4px,-4px) scale(-1,-1); }
        .h01rooms-img-wrap:hover .h01rooms-corner.tl { transform: translate(0,0); }
        .h01rooms-img-wrap:hover .h01rooms-corner.tr { transform: translate(0,0) scaleX(-1); }
        .h01rooms-img-wrap:hover .h01rooms-corner.bl { transform: translate(0,0) scaleY(-1); }
        .h01rooms-img-wrap:hover .h01rooms-corner.br { transform: translate(0,0) scale(-1,-1); }

        /* TEXT */
        .h01rooms-card-eyebrow {
          font-family: 'Playfair Display', Georgia, serif;
          font-style: italic; font-size: 12px; letter-spacing: 0.28em; text-transform: uppercase;
          color: #a98763; margin: 0 0 18px;
          display: inline-flex; align-items: center; gap: 14px;
        }
        .h01rooms-card-eyebrow::before {
          content: ''; width: 28px; height: 1px; background: #a98763;
        }
        .h01rooms-card-name {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: clamp(28px,3.2vw,44px); font-weight: 400;
          color: #1a1714; margin: 0 0 20px; line-height: 1.15;
          letter-spacing: 0.005em;
        }

        /* Specs row */
        .h01rooms-specs {
          display: flex; gap: 28px; flex-wrap: wrap;
          padding: 18px 0 22px;
          border-top: 1px solid rgba(169,135,99,.22);
          border-bottom: 1px solid rgba(169,135,99,.22);
          margin: 0 0 24px;
        }
        .h01rooms-spec {
          display: flex; align-items: center; gap: 10px;
          font-family: 'Poppins', sans-serif; font-size: 11.5px;
          letter-spacing: 0.14em; text-transform: uppercase;
          color: #5D5D5D; font-weight: 400;
        }
        .h01rooms-spec svg { width: 18px; height: 18px; color: #a98763; flex-shrink: 0; }

        .h01rooms-card-desc {
          font-size: 15.5px; color: #5D5D5D; font-weight: 300;
          line-height: 1.9; margin: 0 0 26px;
        }

        /* Amenities row */
        .h01rooms-amen {
          display: flex; flex-wrap: wrap; gap: 8px 20px; margin: 0 0 30px;
        }
        .h01rooms-amen-item {
          display: inline-flex; align-items: center; gap: 8px;
          font-family: 'Poppins', sans-serif; font-size: 12px;
          color: #5D5D5D; font-weight: 400; letter-spacing: 0.02em;
        }
        .h01rooms-amen-item::before {
          content: ''; width: 4px; height: 4px; background: #a98763;
          transform: rotate(45deg);
        }

        /* Price row */
        .h01rooms-price-row {
          display: flex; align-items: center; justify-content: space-between; gap: 20px;
          margin: 0 0 30px; flex-wrap: wrap;
        }
        .h01rooms-price {
          font-family: 'Playfair Display', Georgia, serif;
        }
        .h01rooms-price-label {
          font-style: italic; font-size: 11px; letter-spacing: 0.24em; text-transform: uppercase;
          color: #797979; margin-right: 10px; font-weight: 400;
        }
        .h01rooms-price-val {
          font-size: 30px; color: #1a1714; font-weight: 500;
          letter-spacing: 0.005em;
        }
        .h01rooms-price-suf {
          font-size: 12px; color: #797979; font-weight: 400;
          margin-left: 8px; font-style: italic;
        }

        /* CTAs */
        .h01rooms-card-ctas {
          display: flex; gap: 14px; flex-wrap: wrap;
        }
        .h01rooms-more, .h01rooms-book {
          position: relative; overflow: hidden;
          display: inline-flex; align-items: center; gap: 10px;
          font-family: 'Playfair Display', Georgia, serif;
          font-size: 12px; letter-spacing: 0.22em; text-transform: uppercase;
          padding: 14px 30px; text-decoration: none;
          transition: color .35s, border-color .35s;
        }
        .h01rooms-more {
          background: transparent; color: #3e3e3e; border: 1px solid #a98763;
        }
        .h01rooms-more::before {
          content: ''; position: absolute; inset: 0;
          background: #1a1714; transform: translateY(101%);
          transition: transform .55s cubic-bezier(.22,.68,0,1.1); z-index: 0;
        }
        .h01rooms-more:hover { color: #fff; border-color: #1a1714; }
        .h01rooms-more:hover::before { transform: translateY(0); }
        .h01rooms-more > * { position: relative; z-index: 1; }

        .h01rooms-book {
          background: #1a1714; color: #fff; border: 1px solid #1a1714;
        }
        .h01rooms-book::before {
          content: ''; position: absolute; inset: 0;
          background: linear-gradient(135deg,#a98763 0%,#c4a274 100%);
          transform: translateY(101%); transition: transform .55s cubic-bezier(.22,.68,0,1.1); z-index: 0;
        }
        .h01rooms-book:hover { border-color: #a98763; }
        .h01rooms-book:hover::before { transform: translateY(0); }
        .h01rooms-book > * { position: relative; z-index: 1; }
        .h01rooms-book .arrow { transition: transform .35s cubic-bezier(.22,.68,0,1.1); }
        .h01rooms-book:hover .arrow { transform: translateX(6px); }

        /* Nav — arrows + counter */
        .h01rooms-nav {
          max-width: 1240px; margin: clamp(48px, 5vw, 72px) auto 0;
          padding: 0 clamp(20px,5vw,80px);
          display: flex; align-items: center; justify-content: center; gap: 30px;
        }
        .h01rooms-arrow {
          width: 54px; height: 54px; border: 1px solid rgba(169,135,99,.4);
          background: transparent; cursor: pointer; color: #3e3e3e;
          display: inline-flex; align-items: center; justify-content: center;
          transition: background .35s, color .35s, border-color .35s;
        }
        .h01rooms-arrow:hover { background: #1a1714; color: #d4b088; border-color: #1a1714; }
        .h01rooms-counter {
          font-family: 'Playfair Display', Georgia, serif;
          display: flex; align-items: baseline; gap: 10px;
        }
        .h01rooms-counter-cur {
          font-style: italic; font-size: 30px; color: #a98763; font-weight: 500; line-height: 1;
        }
        .h01rooms-counter-line { width: 46px; height: 1px; background: #a98763; }
        .h01rooms-counter-tot {
          font-size: 14px; color: #797979; letter-spacing: 0.12em;
        }

        @media (max-width: 900px) {
          .h01rooms-card { grid-template-columns: 1fr; gap: 40px; }
          .h01rooms-img-wrap { aspect-ratio: 4/3; }
          .h01rooms-tab { padding: 14px 14px; font-size: 12px; }
          .h01rooms-tab-num { display: none; }
        }
        @media (max-width: 500px) {
          .h01rooms-eyebrow { font-size: 11px; letter-spacing: 0.22em; gap: 12px; }
          .h01rooms-eyebrow::before, .h01rooms-eyebrow::after { width: 22px; }
          .h01rooms-price-val { font-size: 24px; }
          .h01rooms-img-num { font-size: 32px; }
          .h01rooms-more, .h01rooms-book { padding: 13px 22px; font-size: 11px; letter-spacing: 0.18em; }
          .h01rooms-specs { gap: 16px; padding: 14px 0 18px; }
        }
      `}</style>

      <section className="h01rooms" id="pokoje" data-template="hotel-01-rooms">
        {showHeader && (
          <div className="h01rooms-header">
            <div className="h01rooms-eyebrow">
              <GenericEditableText sectionId={sectionId} field="eyebrow" value={eyebrow} tag="span" />
            </div>
            <h2 className="h01rooms-title">{renderTitle()}</h2>
            {subtitle && (
              <p className="h01rooms-subtitle">
                <GenericEditableText sectionId={sectionId} field="subtitle" value={subtitle} tag="span" />
              </p>
            )}
          </div>
        )}

        {items.length > 1 && (
          <div className="h01rooms-tabs" role="tablist">
            {items.map((item, i) => (
              <button
                key={i}
                className={`h01rooms-tab${i === active ? " active" : ""}`}
                onClick={() => setActive(i)}
                role="tab"
                aria-selected={i === active}
              >
                <span className="h01rooms-tab-num">{idx2(i)}</span>
                <GenericEditableText sectionId={sectionId} field={`items.${i}.name`} value={item.name} tag="span" />
              </button>
            ))}
          </div>
        )}

        {room && (
          <div className="h01rooms-card" key={active}>
            <div className="h01rooms-img-col">
              <div className="h01rooms-img-wrap">
                <GenericEditableImage sectionId={sectionId} field={`items.${active}.image`} src={room.image || "/placeholder.jpg"} alt={room.name} style={{ width: "100%", height: "100%" }}>
                  <img src={room.image || "/placeholder.jpg"} alt={room.name} className="h01rooms-img" loading="lazy" />
                </GenericEditableImage>
                <div className="h01rooms-corner tl" aria-hidden="true"><svg viewBox="0 0 28 28" fill="none"><path d="M2 10 L2 2 L10 2" stroke="currentColor" strokeWidth="1.2"/></svg></div>
                <div className="h01rooms-corner tr" aria-hidden="true"><svg viewBox="0 0 28 28" fill="none"><path d="M2 10 L2 2 L10 2" stroke="currentColor" strokeWidth="1.2"/></svg></div>
                <div className="h01rooms-corner bl" aria-hidden="true"><svg viewBox="0 0 28 28" fill="none"><path d="M2 10 L2 2 L10 2" stroke="currentColor" strokeWidth="1.2"/></svg></div>
                <div className="h01rooms-corner br" aria-hidden="true"><svg viewBox="0 0 28 28" fill="none"><path d="M2 10 L2 2 L10 2" stroke="currentColor" strokeWidth="1.2"/></svg></div>
                <div className="h01rooms-img-overlay">
                  <span className="h01rooms-img-badge">{roomLabel} · {idx2(active)}</span>
                  <span className="h01rooms-img-num">{idx2(active)}<span style={{ fontSize: "18px", opacity: .55 }}>/{idx2(items.length - 1)}</span></span>
                </div>
              </div>
            </div>

            <div>
              <div className="h01rooms-card-eyebrow">
                {roomLabel} · <GenericEditableText sectionId={sectionId} field="roomLabel" value={roomLabel} tag="span" />
              </div>
              <h3 className="h01rooms-card-name">
                <GenericEditableText sectionId={sectionId} field={`items.${active}.name`} value={room.name} tag="span" />
              </h3>

              {(room.size || room.beds || room.guests) && (
                <div className="h01rooms-specs">
                  {room.size && (
                    <div className="h01rooms-spec">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18"/><path d="M3 9h18M9 3v18"/></svg>
                      <GenericEditableText sectionId={sectionId} field={`items.${active}.size`} value={room.size} tag="span" />
                    </div>
                  )}
                  {room.beds && (
                    <div className="h01rooms-spec">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><path d="M2 20V8h20v12"/><path d="M2 12h20M6 8V5h5v3M13 8V5h5v3"/></svg>
                      <GenericEditableText sectionId={sectionId} field={`items.${active}.beds`} value={room.beds} tag="span" />
                    </div>
                  )}
                  {room.guests && (
                    <div className="h01rooms-spec">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                      <GenericEditableText sectionId={sectionId} field={`items.${active}.guests`} value={room.guests} tag="span" />
                    </div>
                  )}
                </div>
              )}

              <p className="h01rooms-card-desc">
                <GenericEditableText sectionId={sectionId} field={`items.${active}.description`} value={room.description} tag="span" />
              </p>

              {Array.isArray(room.amenities) && room.amenities.length > 0 && (
                <div className="h01rooms-amen">
                  {room.amenities.map((a, ai) => (
                    <span className="h01rooms-amen-item" key={ai}>
                      <GenericEditableText sectionId={sectionId} field={`items.${active}.amenities.${ai}`} value={a} tag="span" />
                    </span>
                  ))}
                </div>
              )}

              {room.price && (
                <div className="h01rooms-price-row">
                  <div className="h01rooms-price">
                    <span className="h01rooms-price-label">
                      <GenericEditableText sectionId={sectionId} field="priceLabel" value={priceLabel} tag="span" />
                    </span>
                    <span className="h01rooms-price-val">
                      <GenericEditableText sectionId={sectionId} field={`items.${active}.price`} value={room.price} tag="span" />
                    </span>
                    <span className="h01rooms-price-suf">
                      <GenericEditableText sectionId={sectionId} field="priceSuffix" value={priceSuffix} tag="span" />
                    </span>
                  </div>
                </div>
              )}

              <div className="h01rooms-card-ctas">
                <a href={href(room.moreHref)} className="h01rooms-more">
                  <GenericEditableText sectionId={sectionId} field="moreLabel" value={moreLabel} tag="span" />
                </a>
                <a href={href(room.bookHref)} className="h01rooms-book">
                  <GenericEditableText sectionId={sectionId} field="bookLabel" value={bookLabel} tag="span" />
                  <span className="arrow" aria-hidden="true">→</span>
                </a>
              </div>
            </div>
          </div>
        )}

        {items.length > 1 && (
          <div className="h01rooms-nav">
            <button
              className="h01rooms-arrow"
              onClick={() => setActive((active - 1 + items.length) % items.length)}
              aria-label="Předchozí pokoj"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
            </button>
            <div className="h01rooms-counter">
              <span className="h01rooms-counter-cur">{idx2(active)}</span>
              <span className="h01rooms-counter-line" />
              <span className="h01rooms-counter-tot">{idx2(items.length - 1)}</span>
            </div>
            <button
              className="h01rooms-arrow"
              onClick={() => setActive((active + 1) % items.length)}
              aria-label="Další pokoj"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
            </button>
          </div>
        )}
      </section>
    </>
  );
}

// ── chalet-01-amenities ───────────────────────────────────────────────────────
const CHALET_ICONS: Record<string, JSX.Element> = {
  home: (
    <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  ),
  spa: (
    <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2a10 10 0 0 1 10 10c0 4.42-2.87 8.17-6.84 9.49"/><path d="M12 2C6.48 2 2 6.48 2 12c0 4.42 2.87 8.17 6.84 9.49"/><path d="M12 8a4 4 0 0 0-4 4c0 2.21 1.79 4 4 4s4-1.79 4-4a4 4 0 0 0-4-4z"/>
    </svg>
  ),
  ski: (
    <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 17l5-5 4 4 5-5 4 4"/><circle cx="17" cy="4" r="2"/><path d="M7 20l-4-4 14-14 4 4"/>
    </svg>
  ),
  fire: (
    <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>
    </svg>
  ),
  fork: (
    <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3zm0 0v7"/>
    </svg>
  ),
  bike: (
    <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="18.5" cy="17.5" r="3.5"/><circle cx="5.5" cy="17.5" r="3.5"/><circle cx="15" cy="5" r="1"/><path d="M12 17.5V14l-3-3 4-3 2 3h2"/>
    </svg>
  ),
};

function AmenitiesChalet01({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const c = (content ?? {}) as Record<string, any>;
  const kicker = String(c.kicker ?? "Vybavení & komfort");
  const title  = String(c.title  ?? "Co u nás najdete");
  const items: Array<{ title: string; description: string; icon?: string }> =
    Array.isArray(c.items) && c.items.length > 0 ? c.items : [
      { icon: "home", title: "Kapacita 19 lůžek",       description: "Pět útulných pokojů s vlastní koupelnou a výhledem na krkonošské hřebeny." },
      { icon: "fire", title: "Krb & obývací hala",       description: "Společný prostor s masivním krbem, kde se po dni na horách skvěle odpočívá." },
      { icon: "spa",  title: "Finská sauna",              description: "Soukromá sauna s ochlazovacím bazénkem — ideální relax po túře i lyžování." },
      { icon: "fork", title: "Plně vybavená kuchyně",    description: "Prostorná kuchyně s jídelnou pro vlastní vaření i společné večeře." },
      { icon: "ski",  title: "Lyžování & skialpinismus",  description: "Sjezdovky i běžkařské tratě dostupné pěšky. Úschovna lyží a sušárna bot." },
      { icon: "bike", title: "Cyklistika & turistika",    description: "Horská kola k zapůjčení, turistické trasy přímo od dveří." },
    ];

  const BEIGE  = "#c0bbad";
  const DARK   = "#1e2329";
  const ACCENT = "#8a7e6e";
  const FONT_H = "'Josefin Sans', system-ui, sans-serif";
  const FONT_B = "'Plus Jakarta Sans', system-ui, sans-serif";

  return (
    <>
      <style>{`
        .ch01am {
          background: ${DARK};
          padding: clamp(5rem, 10vw, 9rem) 1.5rem;
        }
        .ch01am-head {
          text-align: center;
          margin-bottom: clamp(3rem, 6vw, 5rem);
        }
        .ch01am-kicker {
          font-family: ${FONT_B};
          font-size: 0.65rem; font-weight: 500;
          letter-spacing: 0.3em; text-transform: uppercase;
          color: ${ACCENT}; margin: 0 0 1rem;
        }
        .ch01am-title {
          font-family: ${FONT_H};
          font-size: clamp(1.5rem, 3.2vw, 2.3rem);
          font-weight: 300; letter-spacing: 0.2em;
          text-transform: uppercase; color: #fff;
          margin: 0 0 1rem;
        }
        .ch01am-rule {
          width: 48px; height: 1px;
          background: ${BEIGE}; margin: 0 auto;
        }
        .ch01am-grid {
          max-width: 1140px; margin: 0 auto;
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1px;
        }
        .ch01am-card {
          display: flex; flex-direction: column;
          align-items: center; text-align: center;
          padding: clamp(2.2rem, 4.5vw, 3.5rem) 1.8rem;
          border: 1px solid rgba(192,187,173,0.08);
          position: relative; overflow: hidden;
          transition: border-color 0.4s;
        }
        .ch01am-card::before {
          content: ''; position: absolute; inset: 0;
          background: radial-gradient(ellipse at 50% 0%, rgba(192,187,173,0.08) 0%, transparent 70%);
          opacity: 0; transition: opacity 0.5s;
        }
        .ch01am-card:hover::before { opacity: 1; }
        .ch01am-card:hover { border-color: rgba(192,187,173,0.22); }
        .ch01am-icon {
          color: ${BEIGE}; margin-bottom: 1.4rem;
          transition: transform 0.4s ease;
        }
        .ch01am-card:hover .ch01am-icon { transform: translateY(-3px); }
        .ch01am-card-title {
          font-family: ${FONT_H};
          font-size: 0.74rem; font-weight: 600;
          letter-spacing: 0.22em; text-transform: uppercase;
          color: #fff; margin: 0 0 0.7rem;
          position: relative; z-index: 1;
        }
        .ch01am-card-desc {
          font-family: ${FONT_B};
          font-size: 0.84rem; line-height: 1.7;
          color: rgba(255,255,255,0.5);
          margin: 0; max-width: 280px;
          position: relative; z-index: 1;
        }
        @media (max-width: 860px) {
          .ch01am-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 520px) {
          .ch01am-grid { grid-template-columns: 1fr; }
          .ch01am-card { padding: 2rem 1.5rem; }
        }
      `}</style>

      <section className="ch01am" id="vybaveni" data-template="chalet-01-amenities">
        <div className="ch01am-head">
          <p className="ch01am-kicker">
            <GenericEditableText sectionId={sectionId} field="kicker" value={kicker} tag="span" />
          </p>
          <h2 className="ch01am-title">
            <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
          </h2>
          <div className="ch01am-rule" />
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


// ── malir-01-pricing ─────────────────────────────────────────────────────────
function PricingMalir01({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const AMBER  = "#E79B0E";
  const NAVY   = "#0F297B";
  const DARK   = "#1a1a1a";
  const WHITE  = "#ffffff";
  const FONT_H = "'Playfair Display', Georgia, serif";
  const FONT_B = "'Raleway', sans-serif";

  type PriceRow = { name: string; price: string; note?: string };
  type PriceGroup = { title: string; items: PriceRow[] };

  const heading    = String(content.heading ?? "Orientační ceník");
  const subheading = String(content.subheading ?? "Ceny jsou orientační a závisí na stavu povrchů, výšce stropů a zvoleném materiálu. Přesnou nabídku připravíme po nezávazné prohlídce.");
  const noteText   = String(content.note ?? "Ceny jsou uvedeny včetně materiálu (barvy Primalex/Dulux, penetrace, stěrka). Přesnou cenu stanovíme po prohlídce.");
  const ctaLabel   = String(content.ctaLabel ?? "Nezávazná poptávka");
  const ctaHref    = String(content.ctaHref ?? "/kontakt");
  const showHeader = content.showHeader !== false;

  const groups: PriceGroup[] = Array.isArray(content.groups) && content.groups.length
    ? content.groups as PriceGroup[]
    : [
        {
          title: "Malování interiérů",
          items: [
            { name: "Byt 1+kk / 1+1 (do 45 m²)", price: "od 6 500 Kč" },
            { name: "Byt 2+kk / 2+1 (45–65 m²)", price: "od 8 500 Kč" },
            { name: "Byt 3+kk / 3+1 (65–90 m²)", price: "od 12 000 Kč" },
            { name: "Byt 4+kk a větší", price: "od 15 000 Kč" },
            { name: "Kancelářské prostory", price: "od 35 Kč/m²" },
            { name: "Stěrkování (hladká stěrka)", price: "od 120 Kč/m²" },
          ]
        },
        {
          title: "Lakování a nátěry",
          items: [
            { name: "Okno dvoukřídlé — kompletní renovace", price: "od 1 200 Kč/ks" },
            { name: "Interiérové dveře — lakování", price: "od 800 Kč/ks" },
            { name: "Zárubeň — lakování", price: "od 400 Kč/ks" },
            { name: "Dřevěný plot — lazurování", price: "od 80 Kč/bm" },
            { name: "Zábradlí — antikorozní nátěr", price: "od 100 Kč/bm" },
            { name: "Radiátor — lakování", price: "od 450 Kč/ks" },
          ]
        },
        {
          title: "Doplňkové práce",
          items: [
            { name: "Nezávazná prohlídka a cenová nabídka", price: "ZDARMA" },
            { name: "Odvoz a likvidace odpadu", price: "v ceně" },
            { name: "Zakrytí a ochrana nábytku", price: "v ceně" },
            { name: "Úklid po dokončení", price: "v ceně" },
          ]
        }
      ];

  return (
    <section data-template="malir-01" style={{
      background: WHITE, padding: "clamp(48px, 8vw, 80px) 0",
      fontFamily: FONT_B,
    }}>
      {/* Section header */}
      {showHeader && (
        <div style={{ textAlign: "center", maxWidth: 640, margin: "0 auto clamp(36px, 5vw, 56px)", padding: "0 30px" }}>
          <div className="m01pr-reveal" style={{ fontWeight: 600, fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase" as const, color: AMBER, marginBottom: 12 }}>Ceník</div>
          <GenericEditableText sectionId={sectionId} field="heading" value={heading} tag="h2" style={{
            fontFamily: FONT_H, fontWeight: 700, fontSize: "clamp(26px, 3.5vw, 40px)", color: DARK, lineHeight: 1.15, margin: "0 0 14px",
          }} />
          <div style={{ width: 48, height: 3, background: AMBER, borderRadius: 2, margin: "0 auto 16px" }} />
          <GenericEditableText sectionId={sectionId} field="subheading" value={subheading} tag="p" style={{
            fontSize: 15, lineHeight: 1.7, color: "#666", margin: 0,
          }} />
        </div>
      )}

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "0 30px" }}>
        {groups.map((group, gi) => (
          <div key={gi} className="m01pr-reveal" style={{ animationDelay: `${gi * 0.12}s`, marginBottom: gi < groups.length - 1 ? "clamp(32px, 4vw, 48px)" : 0 }}>
            {/* Group title */}
            <div style={{
              display: "flex", alignItems: "center", gap: 14,
              marginBottom: 20, paddingBottom: 14,
              borderBottom: `2px solid ${DARK}`,
            }}>
              <GenericEditableText sectionId={sectionId} field={`groups.${gi}.title`} value={group.title} tag="h3" style={{
                fontFamily: FONT_H, fontWeight: 700, fontSize: "clamp(18px, 2.2vw, 24px)",
                color: DARK, margin: 0, lineHeight: 1.2,
              }} />
              <div style={{ flex: 1, height: 1, background: `${AMBER}30` }} />
              <span style={{ fontFamily: FONT_H, fontWeight: 700, fontSize: 14, color: AMBER }}>
                {String(gi + 1).padStart(2, "0")}
              </span>
            </div>

            {/* Price rows */}
            {group.items.map((item, ii) => (
              <div key={ii} className="m01pr-row" style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "16px 0", borderBottom: `1px solid #eee`,
                transition: "background 0.2s, padding-left 0.3s",
              }}>
                <GenericEditableText sectionId={sectionId} field={`groups.${gi}.items.${ii}.name`} value={item.name} tag="span" style={{
                  fontSize: 15, fontWeight: 500, color: DARK, flex: 1, lineHeight: 1.4, paddingRight: 20,
                }} />
                <GenericEditableText sectionId={sectionId} field={`groups.${gi}.items.${ii}.price`} value={item.price} tag="span" style={{
                  fontFamily: FONT_H, fontWeight: 700, fontSize: 16,
                  color: item.price === "ZDARMA" || item.price === "v ceně" ? "#27ae60" : AMBER,
                  whiteSpace: "nowrap" as const, letterSpacing: "-0.01em",
                }} />
              </div>
            ))}
          </div>
        ))}

        {/* Note */}
        <div className="m01pr-reveal" style={{
          marginTop: "clamp(28px, 4vw, 40px)", padding: "20px 24px",
          background: "#f8f7f5", borderRadius: 6,
          borderLeft: `3px solid ${AMBER}`,
          display: "flex", alignItems: "flex-start", gap: 12,
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={AMBER} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 2 }}>
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
          </svg>
          <GenericEditableText sectionId={sectionId} field="note" value={noteText} tag="p" style={{
            fontSize: 13.5, lineHeight: 1.7, color: "#777", margin: 0,
          }} />
        </div>

        {/* CTA */}
        <div className="m01pr-reveal" style={{ textAlign: "center", marginTop: "clamp(28px, 4vw, 40px)" }}>
          <a href={ctaHref} className="m01pr-cta" style={{
            display: "inline-flex", alignItems: "center", gap: 10,
            background: NAVY, color: WHITE,
            fontFamily: FONT_B, fontWeight: 700, fontSize: 13,
            letterSpacing: "0.1em", textTransform: "uppercase" as const,
            textDecoration: "none", padding: "16px 36px", borderRadius: 4,
            transition: "background 0.3s, transform 0.2s",
          }}>
            <GenericEditableText sectionId={sectionId} field="ctaLabel" value={ctaLabel} tag="span" />
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </a>
        </div>
      </div>
    </section>
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
  const showHeader = c.showHeader !== false;
  const eyebrow  = c.eyebrow  ?? "Ubytování";
  const title    = c.title    ?? "Pohodlí, které ocení každý host";
  const subtitle = c.subtitle ?? "Od útulných dvoulůžkových pokojů až po luxusní apartmány — všechny prostory jsou zařízeny s důrazem na klid, eleganci a váš komfort.";
  const roomLabel = c.roomLabel ?? "Pokoj";
  const moreLabel = c.moreLabel ?? "Více informací";
  const bookLabel = c.bookLabel ?? "Rezervovat";
  const items: { name: string; description: string; image: string; moreHref: string; bookHref: string; features?: string[]; area?: string; capacity?: string }[] = Array.isArray(c.items) ? c.items : [];

  const resolve = (href: string) => (isAdmin ? "#" : href ?? "#");

  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400;1,500&family=Montserrat:wght@300;400;500;600&display=swap" />
      <style>{`        .h02rooms {
          position: relative;
          background: #fff;
          padding: clamp(80px,10vw,130px) 0;
          font-family: 'Montserrat', sans-serif;
        }
        .h02rooms-header {
          max-width: 1240px; margin: 0 auto clamp(64px,7vw,90px);
          padding: 0 clamp(20px,5vw,80px); text-align: center;
        }
        .h02rooms-eyebrow {
          display: inline-flex; align-items: center; gap: 16px;
          font-size: 10px; font-weight: 600; letter-spacing: 0.32em;
          text-transform: uppercase; color: #5B7A8E; margin: 0 0 20px;
        }
        .h02rooms-eyebrow::before,
        .h02rooms-eyebrow::after {
          content: ""; width: 34px; height: 1px; background: #5B7A8E;
        }
        .h02rooms-title {
          font-family: 'Cormorant Garamond', Georgia, serif;
          font-size: clamp(30px,3.4vw,50px); font-weight: 400; font-style: italic;
          color: #1a2332; line-height: 1.12; letter-spacing: -0.005em;
          margin: 0 0 20px;
        }
        .h02rooms-subtitle {
          font-size: 15px; color: #6b7280; font-weight: 400;
          max-width: 660px; margin: 0 auto; line-height: 1.8;
        }
        .h02rooms-list {
          max-width: 1240px; margin: 0 auto;
          display: flex; flex-direction: column; gap: clamp(64px,8vw,110px);
          padding: 0 clamp(20px,5vw,80px);
        }
        .h02rooms-row {
          position: relative;
          display: grid; grid-template-columns: 3fr 2fr;
          align-items: stretch; gap: 0;
        }
        .h02rooms-row.reverse { grid-template-columns: 2fr 3fr; }
        .h02rooms-row.reverse .h02rooms-img-col { order: 2; }
        .h02rooms-row.reverse .h02rooms-text-col { order: 1; }

        /* Big serif number watermark behind text col */
        .h02rooms-numbg {
          position: absolute; z-index: 0; pointer-events: none;
          font-family: 'Cormorant Garamond', Georgia, serif;
          font-style: italic; font-weight: 500;
          font-size: clamp(120px, 18vw, 240px); line-height: 1;
          color: rgba(150,161,172,0.10);
          top: -30px; user-select: none;
        }
        .h02rooms-row:not(.reverse) .h02rooms-numbg { right: 8px; }
        .h02rooms-row.reverse .h02rooms-numbg { left: 8px; }

        .h02rooms-img-col {
          position: relative; overflow: hidden; aspect-ratio: 5/4;
          box-shadow: 0 24px 60px -30px rgba(15,22,34,0.35);
        }
        .h02rooms-img-col::before,
        .h02rooms-img-col::after {
          content: ""; position: absolute; z-index: 3;
          width: 30px; height: 30px;
          border-color: rgba(255,255,255,0.95); border-style: solid; border-width: 0;
          opacity: 0; transition: opacity 0.5s cubic-bezier(.22,.68,0,1) 0.1s, width 0.5s cubic-bezier(.22,.68,0,1), height 0.5s cubic-bezier(.22,.68,0,1);
        }
        .h02rooms-img-col::before {
          top: 18px; left: 18px; border-top-width: 1px; border-left-width: 1px;
        }
        .h02rooms-img-col::after {
          bottom: 18px; right: 18px; border-bottom-width: 1px; border-right-width: 1px;
        }
        .h02rooms-img-col:hover::before,
        .h02rooms-img-col:hover::after { opacity: 1; width: 44px; height: 44px; }
        .h02rooms-img {
          width: 100%; height: 100%; object-fit: cover; display: block;
          transition: transform 0.9s cubic-bezier(.4,0,.2,1);
        }
        .h02rooms-img-col:hover .h02rooms-img { transform: scale(1.06); }

        /* Room chip meta over image (bottom-left) */
        .h02rooms-meta {
          position: absolute; z-index: 4; left: 22px; bottom: 22px;
          display: inline-flex; gap: 10px;
        }
        .h02rooms-chip {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 10px 16px;
          background: rgba(15,22,34,0.72);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          color: #fff;
          font-family: 'Montserrat', sans-serif;
          font-size: 10px; font-weight: 600; letter-spacing: 0.18em; text-transform: uppercase;
          border: 1px solid rgba(255,255,255,0.15);
        }
        .h02rooms-chip svg { width: 12px; height: 12px; opacity: 0.85; }

        .h02rooms-text-col {
          position: relative; z-index: 1;
          padding: clamp(48px,6vw,88px) clamp(28px,4vw,72px);
          display: flex; flex-direction: column; justify-content: center;
          background: #fff;
        }
        .h02rooms-row:nth-child(even) .h02rooms-text-col {
          background: #f7f8f9;
        }
        .h02rooms-room-num {
          display: inline-flex; align-items: center; gap: 12px;
          font-family: 'Montserrat', sans-serif;
          font-size: 10px; font-weight: 600; letter-spacing: 0.3em;
          color: #5B7A8E; text-transform: uppercase; margin: 0 0 18px;
        }
        .h02rooms-room-num::before {
          content: ""; width: 28px; height: 1px; background: #5B7A8E;
        }
        .h02rooms-room-name {
          font-family: 'Cormorant Garamond', Georgia, serif;
          font-size: clamp(24px,2.6vw,38px); font-weight: 500; font-style: italic;
          color: #1a2332; line-height: 1.18; letter-spacing: -0.005em;
          margin: 0 0 22px;
        }
        .h02rooms-rule {
          width: 44px; height: 1px; background: #96A1AC;
          margin: 0 0 24px; border: none;
        }
        .h02rooms-room-desc {
          font-size: 14.5px; line-height: 1.85; color: #4b5563;
          font-weight: 400; margin: 0 0 26px;
        }
        .h02rooms-feats {
          list-style: none; padding: 0; margin: 0 0 32px;
          display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px 20px;
        }
        .h02rooms-feats li {
          font-family: 'Montserrat', sans-serif;
          font-size: 12px; color: #4b5563; font-weight: 500;
          display: inline-flex; align-items: center; gap: 10px;
          padding-bottom: 8px; border-bottom: 1px solid rgba(150,161,172,0.20);
        }
        .h02rooms-feats li::before {
          content: ""; width: 5px; height: 5px; background: #96A1AC; border-radius: 999px;
          flex-shrink: 0;
        }
        .h02rooms-ctas { display: flex; gap: 14px; flex-wrap: wrap; align-items: center; }
        .h02rooms-more {
          position: relative;
          display: inline-flex; align-items: center; gap: 8px;
          color: #1a2332; background: transparent; border: none;
          font-family: 'Montserrat', sans-serif;
          font-size: 11px; font-weight: 600; letter-spacing: 0.22em; text-transform: uppercase;
          padding: 12px 0; text-decoration: none;
        }
        .h02rooms-more::after {
          content: ""; position: absolute; left: 0; right: 0; bottom: 8px;
          height: 1px; background: currentColor; transform-origin: right;
          transition: transform 0.4s cubic-bezier(.22,.68,0,1);
        }
        .h02rooms-more:hover::after { transform-origin: left; transform: scaleX(1.15); }
        .h02rooms-more-arrow { transition: transform 0.4s cubic-bezier(.22,.68,0,1); }
        .h02rooms-more:hover .h02rooms-more-arrow { transform: translateX(3px); }

        .h02rooms-book {
          position: relative; overflow: hidden; isolation: isolate;
          display: inline-flex; align-items: center; gap: 10px;
          background: #1a2332; color: #fff; border: 1px solid #1a2332;
          font-family: 'Montserrat', sans-serif;
          font-size: 11px; font-weight: 600; letter-spacing: 0.22em; text-transform: uppercase;
          padding: 14px 28px; text-decoration: none;
          transition: border-color 0.35s;
        }
        .h02rooms-book::before {
          content: ""; position: absolute; inset: 0; z-index: -1;
          background: #5B7A8E; transform: translateY(101%);
          transition: transform 0.5s cubic-bezier(.22,.68,0,1);
        }
        .h02rooms-book:hover::before { transform: translateY(0); }
        .h02rooms-book:hover { border-color: #5B7A8E; }
        .h02rooms-book-arrow { transition: transform 0.4s cubic-bezier(.22,.68,0,1); }
        .h02rooms-book:hover .h02rooms-book-arrow { transform: translate(3px,-3px); }

        @media (max-width: 900px) {
          .h02rooms-row,
          .h02rooms-row.reverse { grid-template-columns: 1fr; }
          .h02rooms-row.reverse .h02rooms-img-col { order: 0; }
          .h02rooms-row.reverse .h02rooms-text-col { order: 0; }
          .h02rooms-img-col { aspect-ratio: 16/10; }
          .h02rooms-list { padding: 0 20px; }
          .h02rooms-numbg { display: none; }
          .h02rooms-text-col { padding: 40px 24px 20px; }
        }
        @media (max-width: 480px) {
          .h02rooms-feats { grid-template-columns: 1fr; }
        }
      `}</style>

      <section className="h02rooms" id="ubytovani" data-template="hotel-02-rooms">
        {showHeader && (
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
        )}

        <div className="h02rooms-list">
          {items.map((item, i) => {
            const feats = Array.isArray(item.features) ? item.features : [];
            return (
              <div key={i} className={`h02rooms-row${i % 2 === 1 ? " reverse" : ""}`}>
                <span className="h02rooms-numbg" aria-hidden="true">{String(i + 1).padStart(2, "0")}</span>
                <div className="h02rooms-img-col">
                  <GenericEditableImage sectionId={sectionId} field={`items.${i}.image`} src={item.image || "/placeholder.jpg"} alt={item.name} style={{ width: "100%", height: "100%" }}>
                    <img src={item.image || "/placeholder.jpg"} alt={item.name} className="h02rooms-img" loading="lazy" />
                  </GenericEditableImage>
                  {(item.area || item.capacity) && (
                    <div className="h02rooms-meta">
                      {item.area && (
                        <span className="h02rooms-chip">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 4h16v16H4z M4 12h16 M12 4v16"/></svg>
                          <GenericEditableText sectionId={sectionId} field={`items.${i}.area`} value={item.area} tag="span" />
                        </span>
                      )}
                      {item.capacity && (
                        <span className="h02rooms-chip">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="9" cy="8" r="3"/><circle cx="17" cy="9" r="2.5"/><path d="M3 20c0-3 2.7-5 6-5s6 2 6 5M14 20c0-2 1.6-3.5 3.5-3.5S21 18 21 20"/></svg>
                          <GenericEditableText sectionId={sectionId} field={`items.${i}.capacity`} value={item.capacity} tag="span" />
                        </span>
                      )}
                    </div>
                  )}
                </div>
                <div className="h02rooms-text-col">
                  <span className="h02rooms-room-num">
                    <GenericEditableText sectionId={sectionId} field="roomLabel" value={roomLabel} tag="span" />
                    &nbsp;{String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="h02rooms-room-name">
                    <GenericEditableText sectionId={sectionId} field={`items.${i}.name`} value={item.name} tag="span" />
                  </h3>
                  <hr className="h02rooms-rule" />
                  <p className="h02rooms-room-desc">
                    <GenericEditableText sectionId={sectionId} field={`items.${i}.description`} value={item.description} tag="span" />
                  </p>
                  {feats.length > 0 && (
                    <ul className="h02rooms-feats">
                      {feats.map((f, j) => (
                        <li key={j}>
                          <GenericEditableText sectionId={sectionId} field={`items.${i}.features.${j}`} value={f} tag="span" />
                        </li>
                      ))}
                    </ul>
                  )}
                  <div className="h02rooms-ctas">
                    <a href={resolve(item.moreHref)} className="h02rooms-more">
                      <GenericEditableText sectionId={sectionId} field="moreLabel" value={moreLabel} tag="span" />
                      <svg className="h02rooms-more-arrow" width="14" height="9" viewBox="0 0 14 9" fill="none"><path d="M1 4.5h12M9 1l4 3.5L9 8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </a>
                    <a href={resolve(item.bookHref)} className="h02rooms-book">
                      <GenericEditableText sectionId={sectionId} field="bookLabel" value={bookLabel} tag="span" />
                      <svg className="h02rooms-book-arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/></svg>
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
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
  const eyebrowRaw  = (content as Record<string, unknown>).tagline;
  const titleRaw    = (content as Record<string, unknown>).title;
  const subtitleRaw = (content as Record<string, unknown>).subtitle;
  const tagline  = eyebrowRaw  === undefined ? "Naše speciality" : String(eyebrowRaw);
  const title    = titleRaw    === undefined ? "Co dnes\nvaříme." : String(titleRaw);
  const subtitle = subtitleRaw === undefined ? "" : String(subtitleRaw);
  const body     = String(content.body    ?? "Každý pokrm vzniká z pečlivě vybraných surovin — čerstvé mořské plody, sezónní zelenina z trhů a certifikovaný parmazán z Emilia-Romagna. Bez kompromisů.");
  const ctaText  = String(content.ctaText ?? "Celý jídelní lístek");
  const ctaHref  = String(content.ctaHref ?? "/menu");
  const items    = (content.items as Array<{ name: string; category?: string; description?: string; image?: string; ctaText?: string; ctaHref?: string }>) ?? [];

  const showHeader = !!(tagline.trim() || title.trim() || subtitle.trim());

  const DARK  = "#0d1f0a";
  const SURF  = "#152d11";
  const RED   = "#c41c1c";
  const CREAM = "#f5f0e8";
  const MUTED = "#8fa889";
  const SERIF = "'Fraunces', Georgia, 'Times New Roman', serif";
  const SANS  = "'Nunito Sans', 'Helvetica Neue', Arial, sans-serif";

  const siteMode = String((content as any).siteMode ?? "multipage");
  const resolve = (href: string) => resolveNavHref(href, siteMode, tenantSlug, isAdmin);

  return (
    <section id="menu" data-template="restaurant-04" style={{ background: SURF, padding: "clamp(80px, 10vw, 140px) clamp(24px, 6vw, 80px)", position: "relative" }}>

      {/* Header — 2-col: title left, body+CTA right */}
      {showHeader && (
        <div style={{ maxWidth: 1200, margin: "0 auto 64px" }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "clamp(24px,4vw,60px)", alignItems: "flex-end", justifyContent: "space-between" }}
            className="r04-menu-header">
            <div style={{ flex: "1 1 340px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14, margin: "0 0 20px" }}>
                <span aria-hidden="true" style={{ width: 32, height: 1, background: RED }} />
                <GenericEditableText sectionId={sectionId} field="tagline" value={tagline} tag="span"
                  style={{ fontFamily: SANS, fontSize: 11, fontWeight: 800,
                    letterSpacing: "0.24em", textTransform: "uppercase", color: RED }} />
              </div>
              <h2 style={{
                fontFamily: SERIF, fontSize: "clamp(28px, 4vw, 48px)", fontWeight: 400,
                fontStyle: "italic", color: CREAM, margin: 0, lineHeight: 1.12,
                whiteSpace: "pre-line",
              }}>
                <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
              </h2>
            </div>
            <div style={{ flex: "1 1 300px" }}>
              <p style={{
                fontFamily: SANS, fontSize: "clamp(14px, 1.4vw, 16px)",
                color: MUTED, lineHeight: 1.75, margin: "0 0 28px",
              }}>
                <GenericEditableText sectionId={sectionId} field="body" value={body} tag="span" />
              </p>
              <a href={resolve(ctaHref)} className="r04-menu-cta" style={{
                display: "inline-block", fontFamily: SANS, fontSize: 11, fontWeight: 800,
                letterSpacing: "0.14em", textTransform: "uppercase",
                color: CREAM, textDecoration: "none",
                padding: "14px 32px", border: `1px solid ${RED}`, borderRadius: 2,
              }}>
                <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Karty */}
      <div style={{
        maxWidth: 1200, margin: "0 auto",
        display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24,
      }} className="r04-menu-grid">
        {items.map((item, i) => (
          <div key={i} className="r04-menu-card" style={{
            background: DARK,
            borderRadius: 4,
            overflow: "hidden",
            display: "flex", flexDirection: "column",
            border: `1px solid ${CREAM}0a`,
            position: "relative",
          }}>
            {/* Red top accent */}
            <div aria-hidden="true" style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: RED, zIndex: 1 }} />

            {/* Foto */}
            {item.image && (
              <div className="r04-menu-card-img" style={{ overflow: "hidden", height: 240, position: "relative" }}>
                <img
                  src={item.image}
                  alt={item.name}
                  style={{
                    width: "100%", height: "100%", objectFit: "cover", display: "block",
                  }}
                />
                {/* Gradient overlay na foto */}
                <div aria-hidden="true" style={{
                  position: "absolute", bottom: 0, left: 0, right: 0, height: "50%",
                  background: `linear-gradient(to top, ${DARK}, transparent)`, pointerEvents: "none",
                }} />
              </div>
            )}

            {/* Obsah */}
            <div style={{ padding: "28px 28px 32px", flex: 1, display: "flex", flexDirection: "column" }}>
              {item.category && (
                <p style={{
                  fontFamily: SANS, fontSize: 10, fontWeight: 800,
                  letterSpacing: "0.22em", textTransform: "uppercase",
                  color: RED, margin: "0 0 12px",
                }}>
                  <GenericEditableText sectionId={sectionId} field={`items.${i}.category`} value={item.category} tag="span" />
                </p>
              )}
              <h3 style={{
                fontFamily: SERIF, fontSize: "clamp(20px, 2vw, 24px)", fontWeight: 400,
                fontStyle: "italic", color: CREAM, margin: "0 0 14px", lineHeight: 1.2,
              }}>
                <GenericEditableText sectionId={sectionId} field={`items.${i}.name`} value={item.name} tag="span" />
              </h3>
              {item.description && (
                <p style={{
                  fontFamily: SANS, fontSize: 14, color: MUTED,
                  lineHeight: 1.7, margin: "0 0 24px", flex: 1,
                }}>
                  <GenericEditableText sectionId={sectionId} field={`items.${i}.description`} value={item.description} tag="span" />
                </p>
              )}
              {item.ctaText && item.ctaHref && (
                <a href={resolve(item.ctaHref)} className="r04-menu-link" style={{
                  display: "inline-flex", alignItems: "center", gap: 8,
                  fontFamily: SANS, fontSize: 11, fontWeight: 800,
                  letterSpacing: "0.12em", textTransform: "uppercase",
                  color: RED, textDecoration: "none",
                }}>
                  <GenericEditableText sectionId={sectionId} field={`items.${i}.ctaText`} value={item.ctaText} tag="span" />
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </a>
              )}
            </div>
          </div>
        ))}
      </div>

      <style>{`
        @media (max-width: 900px) {
          .r04-menu-grid { grid-template-columns: 1fr !important; }
          .r04-menu-header { flex-direction: column !important; }
        }
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

// ── pricing-photo-01 ──────────────────────────────────────────────────────────
// Fotografka ceník: cream editorial, 3 balíčky, Playfair, taupe accent, featured middle
function PricingPhoto01({ content, sectionId, tenantSlug, isAdmin }: { content: Record<string, unknown>; sectionId: number; tenantSlug?: string; isAdmin?: boolean }) {
  const eyebrowRaw  = content.eyebrow;
  const titleRaw    = content.title;
  const subtitleRaw = content.subtitle;
  const eyebrow  = eyebrowRaw  === undefined ? "Ceník" : String(eyebrowRaw);
  const title    = titleRaw    === undefined ? "Balíčky focení" : String(titleRaw);
  const subtitle = subtitleRaw === undefined ? "Jasné ceny bez skrytých poplatků. Každé focení ladíme na míru — níže najdete orientační balíčky." : String(subtitleRaw);
  const note     = String(content.note ?? "Ceny jsou orientační. Rády připravíme nabídku přesně podle vašich představ.");
  const showHeader = !!(eyebrow.trim() || title.trim() || subtitle.trim());
  const siteMode = String(content.siteMode ?? "multipage");
  const resolve  = (href: string) => resolveNavHref(href, siteMode, tenantSlug, isAdmin);

  type Pkg = { name: string; price: string; priceNote?: string; description?: string; features?: string[]; ctaText?: string; ctaHref?: string; featured?: boolean };
  const packages = (content.packages as Pkg[] | undefined) ?? [];

  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;1,400&family=Inter:wght@300;400;500&display=swap" />
      <style>{`        .ph01pr { background: #faf6f1; padding: clamp(56px, 8vw, 104px) 5%; }
        .ph01pr-inner { max-width: 1160px; margin: 0 auto; }
        .ph01pr-head { text-align: center; max-width: 640px; margin: 0 auto clamp(40px, 5vw, 64px); }
        .ph01pr-eyebrow {
          display: inline-flex; align-items: center; gap: 0.8em;
          font-family: 'Inter', system-ui, sans-serif; font-size: 12px; font-weight: 500;
          letter-spacing: 0.24em; text-transform: uppercase; color: #8b7355; margin: 0 0 20px;
        }
        .ph01pr-eyebrow::before, .ph01pr-eyebrow::after { content: ''; width: 30px; height: 1px; background: #c0bbad; display: inline-block; }
        .ph01pr-title { font-family: 'Playfair Display', Georgia, serif; font-size: clamp(28px, 4vw, 46px); font-weight: 400; color: #1a1a1a; margin: 0 0 18px; line-height: 1.14; letter-spacing: -0.01em; }
        .ph01pr-sub { font-family: 'Inter', system-ui, sans-serif; font-size: clamp(15px, 1.5vw, 16.5px); line-height: 1.8; color: #6b6b6b; margin: 0; }
        .ph01pr-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: clamp(18px, 2.4vw, 30px); align-items: stretch; }
        .ph01pr-card {
          position: relative; display: flex; flex-direction: column;
          background: #fff; border: 1px solid #eae2d7; border-radius: 3px;
          padding: clamp(28px, 3vw, 40px) clamp(24px, 2.6vw, 34px);
          transition: transform 0.5s cubic-bezier(.32,.72,0,1), box-shadow 0.5s cubic-bezier(.32,.72,0,1), border-color 0.5s ease;
        }
        .ph01pr-card:hover { transform: translateY(-6px); box-shadow: 0 30px 60px -34px rgba(26,26,26,0.32); border-color: #d9cbb8; }
        .ph01pr-card[data-featured="true"] { background: #16110d; border-color: #16110d; }
        .ph01pr-badge {
          position: absolute; top: -11px; left: 50%; transform: translateX(-50%);
          font-family: 'Inter', system-ui, sans-serif; font-size: 10px; font-weight: 600;
          letter-spacing: 0.18em; text-transform: uppercase; color: #16110d; background: #c2a878;
          padding: 5px 14px; border-radius: 999px; white-space: nowrap;
        }
        .ph01pr-name { font-family: 'Playfair Display', Georgia, serif; font-size: clamp(21px, 2.2vw, 26px); font-weight: 400; color: #1a1a1a; margin: 0 0 6px; }
        .ph01pr-card[data-featured="true"] .ph01pr-name { color: #fff; }
        .ph01pr-desc { font-family: 'Inter', system-ui, sans-serif; font-size: 13.5px; line-height: 1.6; color: #6b6b6b; margin: 0 0 20px; min-height: 2.6em; }
        .ph01pr-card[data-featured="true"] .ph01pr-desc { color: #b7ada2; }
        .ph01pr-price { display: flex; align-items: baseline; gap: 0.4em; margin: 0 0 4px; }
        .ph01pr-price-num { font-family: 'Playfair Display', Georgia, serif; font-size: clamp(30px, 3.4vw, 40px); font-weight: 500; color: #8b7355; line-height: 1; }
        .ph01pr-card[data-featured="true"] .ph01pr-price-num { color: #c2a878; }
        .ph01pr-price-note { font-family: 'Inter', system-ui, sans-serif; font-size: 12.5px; color: #9a9088; }
        .ph01pr-card[data-featured="true"] .ph01pr-price-note { color: #8a7f73; }
        .ph01pr-rule { border: none; border-top: 1px solid #eae2d7; margin: 22px 0; }
        .ph01pr-card[data-featured="true"] .ph01pr-rule { border-top-color: #2a231c; }
        .ph01pr-feats { list-style: none; padding: 0; margin: 0 0 28px; display: flex; flex-direction: column; gap: 11px; flex: 1; }
        .ph01pr-feats li { display: flex; align-items: flex-start; gap: 10px; font-family: 'Inter', system-ui, sans-serif; font-size: 14px; line-height: 1.5; color: #4a4a4a; }
        .ph01pr-card[data-featured="true"] .ph01pr-feats li { color: #cfc6bb; }
        .ph01pr-feats svg { flex-shrink: 0; margin-top: 3px; }
        .ph01pr-btn {
          display: inline-flex; align-items: center; justify-content: center; gap: 0.6em;
          position: relative; overflow: hidden;
          font-family: 'Inter', system-ui, sans-serif; font-size: 12px; font-weight: 500;
          letter-spacing: 0.16em; text-transform: uppercase; text-decoration: none;
          padding: 14px 24px; border-radius: 2px; border: 1px solid #1a1a1a; color: #1a1a1a;
          transition: color 0.45s cubic-bezier(.32,.72,0,1), border-color 0.45s ease;
        }
        .ph01pr-btn::before { content: ''; position: absolute; inset: 0; background: #8b7355; transform: translateY(101%); transition: transform 0.5s cubic-bezier(.32,.72,0,1); z-index: 0; }
        .ph01pr-btn:hover { color: #fff; border-color: #8b7355; }
        .ph01pr-btn:hover::before { transform: translateY(0); }
        .ph01pr-btn > span { position: relative; z-index: 1; }
        .ph01pr-card[data-featured="true"] .ph01pr-btn { border-color: #c2a878; color: #16110d; background: #c2a878; }
        .ph01pr-card[data-featured="true"] .ph01pr-btn::before { background: #fff; }
        .ph01pr-card[data-featured="true"] .ph01pr-btn:hover { color: #16110d; border-color: #fff; }
        .ph01pr-note { text-align: center; font-family: 'Inter', system-ui, sans-serif; font-size: 13.5px; color: #9a9088; margin: clamp(32px, 4vw, 48px) auto 0; max-width: 560px; line-height: 1.7; }
        @media (max-width: 880px) { .ph01pr-grid { grid-template-columns: 1fr; max-width: 440px; margin: 0 auto; } .ph01pr-desc { min-height: 0; } }
      `}</style>

      <section className="ph01pr" id="cenik" data-template="photo-01-pricing">
        <div className="ph01pr-inner">
          {showHeader && (
            <div className="ph01pr-head">
              {eyebrow.trim() && <GenericEditableText sectionId={sectionId} field="eyebrow" value={eyebrow} tag="p" className="ph01pr-eyebrow" />}
              {title.trim() && <GenericEditableText sectionId={sectionId} field="title" value={title} tag="h2" className="ph01pr-title" />}
              {subtitle.trim() && <GenericEditableText sectionId={sectionId} field="subtitle" value={subtitle} tag="p" className="ph01pr-sub" />}
            </div>
          )}
          <div className="ph01pr-grid">
            {packages.map((pkg, i) => (
              <div key={i} className="ph01pr-card" data-featured={pkg.featured ? "true" : "false"}>
                {pkg.featured && (
                  <GenericEditableText sectionId={sectionId} field={`packages.${i}.badge`} value={String((pkg as Record<string, unknown>).badge ?? "Nejoblíbenější")} tag="span" className="ph01pr-badge" />
                )}
                <GenericEditableText sectionId={sectionId} field={`packages.${i}.name`} value={pkg.name} tag="h3" className="ph01pr-name" />
                <GenericEditableText sectionId={sectionId} field={`packages.${i}.description`} value={String(pkg.description ?? "")} tag="p" className="ph01pr-desc" />
                <p className="ph01pr-price">
                  <GenericEditableText sectionId={sectionId} field={`packages.${i}.price`} value={pkg.price} tag="span" className="ph01pr-price-num" />
                  {pkg.priceNote && <GenericEditableText sectionId={sectionId} field={`packages.${i}.priceNote`} value={pkg.priceNote} tag="span" className="ph01pr-price-note" />}
                </p>
                <hr className="ph01pr-rule" />
                <ul className="ph01pr-feats">
                  {(pkg.features ?? []).map((f, j) => (
                    <li key={j}>
                      <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true"><path d="M2 8l3.5 3.5L13 3.5" stroke={pkg.featured ? "#c2a878" : "#8b7355"} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      <GenericEditableText sectionId={sectionId} field={`packages.${i}.features.${j}`} value={f} tag="span" />
                    </li>
                  ))}
                </ul>
                <a href={resolve(String(pkg.ctaHref ?? "/kontakt"))} className="ph01pr-btn">
                  <GenericEditableText sectionId={sectionId} field={`packages.${i}.ctaText`} value={String(pkg.ctaText ?? "Nezávazně poptat")} tag="span" />
                </a>
              </div>
            ))}
          </div>
          {note.trim() && <GenericEditableText sectionId={sectionId} field="note" value={note} tag="p" className="ph01pr-note" />}
        </div>
      </section>
    </>
  );
}

// ── reality-05-listings ──────────────────────────────────────────────────────
function ListingsReality05({ content, sectionId, tenantSlug, isAdmin }: { content: Record<string, unknown>; sectionId: number; tenantSlug?: string; isAdmin: boolean }) {
  const eyebrowRaw = content.eyebrow;
  const titleRaw   = content.title;
  const eyebrow = eyebrowRaw === undefined ? "Aktuální nabídka" : String(eyebrowRaw);
  const title   = titleRaw   === undefined ? "Vybrané nemovitosti" : String(titleRaw);
  const showHeader = !!(eyebrow.trim() || title.trim());

  const ctaText  = String(content.ctaText  ?? "Celá nabídka");
  const ctaHref  = String(content.ctaHref  ?? "/nabidka");
  const tabAllLabel  = String(content.tabAllLabel  ?? "Vše");
  const tabSaleLabel = String(content.tabSaleLabel ?? "Prodej");
  const tabRentLabel = String(content.tabRentLabel ?? "Pronájem");
  const detailLabel  = String(content.detailLabel  ?? "Detail nemovitosti");
  const siteMode = String(content.siteMode ?? "multipage");

  type Item = { name: string; location: string; params: string; price: string; tag: string; image: string; href: string };
  const items = (content.items as Item[]) ?? [
    { name: "Mezonetový byt s terasou", location: "Praha 5 — Smíchov", params: "3+kk · 112 m² · terasa 28 m²", price: "12 490 000 Kč", tag: "Prodej", image: "/templates/reality-05/listing-1.webp", href: "/nabidka" },
    { name: "Rodinný dům se zahradou", location: "Praha-západ — Černošice", params: "5+1 · 185 m² · pozemek 620 m²", price: "16 900 000 Kč", tag: "Prodej", image: "/templates/reality-05/listing-2.webp", href: "/nabidka" },
    { name: "Moderní vila u lesa", location: "Praha 4 — Kunratice", params: "6+kk · 240 m² · garáž · bazén", price: "24 500 000 Kč", tag: "Prodej", image: "/templates/reality-05/listing-3.webp", href: "/nabidka" },
    { name: "Stylový loft v centru", location: "Praha 7 — Holešovice", params: "2+kk · 68 m² · sklep", price: "35 000 Kč/měs", tag: "Pronájem", image: "/templates/reality-05/listing-4.webp", href: "/nabidka" },
    { name: "Penthouse s panoramatem", location: "Praha 1 — Staré Město", params: "4+kk · 156 m² · terasa 45 m²", price: "29 900 000 Kč", tag: "Prodej", image: "/templates/reality-05/listing-5.webp", href: "/nabidka" },
    { name: "Kancelářské prostory", location: "Praha 8 — Karlín", params: "open-space · 120 m² · parking", price: "48 000 Kč/měs", tag: "Pronájem", image: "/templates/reality-05/listing-6.webp", href: "/nabidka" },
  ];

  const GOLD  = "#CFA968";
  const DARK  = "#1c1c1c";
  const WHITE = "#ffffff";
  const CREAM = "#f8f5f0";
  const MUTED = "#8a8a8a";
  const FONT  = "'Open Sans', sans-serif";

  const resolve = (href: string) => resolveNavHref(href, siteMode, tenantSlug, isAdmin);
  const [activeTab, setActiveTab] = useState<"all"|"sale"|"rent">("all");

  const filtered = activeTab === "all" ? items
    : activeTab === "sale"  ? items.filter(i => i.tag === "Prodej")
    : items.filter(i => i.tag === "Pronájem");

  return (
    <section data-template="reality-05" id="listings" style={{ backgroundColor: WHITE, padding: "clamp(64px,9vw,100px) 0", fontFamily: FONT }}>
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 clamp(20px,4vw,48px)" }}>

        {showHeader && (
          <div style={{ textAlign: "center", marginBottom: 40 }}>
            {eyebrow && (
              <GenericEditableText sectionId={sectionId} field="eyebrow" value={eyebrow} tag="p"
                style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: GOLD, margin: "0 0 12px" }} />
            )}
            <div style={{ width: 48, height: 2, background: GOLD, margin: "0 auto 20px", opacity: 0.5 }} />
            <GenericEditableText sectionId={sectionId} field="title" value={title} tag="h2"
              style={{ fontSize: "clamp(26px,3.5vw,40px)", fontWeight: 700, lineHeight: 1.15, color: DARK, margin: 0, letterSpacing: "-0.01em" }} />
          </div>
        )}

        {/* Tabs */}
        <div style={{ display: "flex", justifyContent: "center", gap: 0, marginBottom: 44, borderBottom: `1px solid ${CREAM}` }}>
          {([["all", tabAllLabel], ["sale", tabSaleLabel], ["rent", tabRentLabel]] as [string, string][]).map(([key, label]) => (
            <button key={key} onClick={() => setActiveTab(key as "all"|"sale"|"rent")} className="r05-listing-tab" style={{
              padding: "12px 32px", background: "none", border: "none", cursor: "pointer",
              fontFamily: FONT, fontSize: 13, fontWeight: activeTab === key ? 700 : 400,
              color: activeTab === key ? DARK : MUTED,
              borderBottom: activeTab === key ? `2px solid ${GOLD}` : "2px solid transparent",
              marginBottom: -1, transition: "color 0.2s, border-color 0.2s",
            }}>
              {label}
            </button>
          ))}
        </div>

        {/* Property grid */}
        <div className="r05-listings-grid">
          {filtered.map((item, i) => (
            <a key={i} href={resolve(item.href)} className="r05-listing-card" style={{
              textDecoration: "none", color: "inherit", display: "flex", flexDirection: "column",
              overflow: "hidden", backgroundColor: WHITE,
              border: `1px solid ${CREAM}`,
              transition: "box-shadow 0.35s cubic-bezier(0.4,0,0.2,1), transform 0.35s cubic-bezier(0.4,0,0.2,1)",
            }}>
              {/* Image */}
              <div style={{ position: "relative", paddingTop: "66%", backgroundColor: CREAM, overflow: "hidden" }}>
                <GenericEditableImage sectionId={sectionId} field={`items.${i}.image`} src={item.image} alt={item.name} style={{ position: "absolute", inset: 0 }}>
                  <img loading="lazy" src={item.image} alt={item.name} className="r05-listing-img" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.5s cubic-bezier(0.4,0,0.2,1)" }} />
                </GenericEditableImage>
                <span style={{
                  position: "absolute", top: 14, left: 14,
                  backgroundColor: item.tag === "Pronájem" ? DARK : GOLD,
                  color: item.tag === "Pronájem" ? WHITE : DARK,
                  fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase",
                  padding: "5px 14px",
                }}>
                  <GenericEditableText sectionId={sectionId} field={`items.${i}.tag`} value={item.tag} tag="span" />
                </span>
              </div>
              {/* Content */}
              <div style={{ padding: "20px 22px 22px", flex: 1, display: "flex", flexDirection: "column" }}>
                <GenericEditableText sectionId={sectionId} field={`items.${i}.name`} value={item.name} tag="h3"
                  style={{ fontSize: 17, fontWeight: 700, color: DARK, margin: "0 0 6px", lineHeight: 1.3 }} />
                <GenericEditableText sectionId={sectionId} field={`items.${i}.location`} value={item.location} tag="p"
                  style={{ fontSize: 13, color: MUTED, margin: "0 0 8px" }} />
                <GenericEditableText sectionId={sectionId} field={`items.${i}.params`} value={item.params} tag="p"
                  style={{ fontSize: 12, color: MUTED, margin: "0 0 16px", opacity: 0.8 }} />
                <div style={{ marginTop: "auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <GenericEditableText sectionId={sectionId} field={`items.${i}.price`} value={item.price} tag="span"
                    style={{ fontSize: 18, fontWeight: 700, color: GOLD }} />
                  <span style={{ fontSize: 11, fontWeight: 600, color: MUTED, letterSpacing: "0.06em", textTransform: "uppercase" }}>
                    {detailLabel} →
                  </span>
                </div>
              </div>
            </a>
          ))}
        </div>

        {/* CTA */}
        <div style={{ textAlign: "center", marginTop: 48 }}>
          <a href={resolve(ctaHref)} className="r05-listings-cta" style={{
            display: "inline-block", padding: "14px 40px",
            backgroundColor: GOLD, color: DARK,
            fontSize: 13, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase",
            textDecoration: "none", transition: "background-color 0.3s, transform 0.3s",
          }}>
            <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
          </a>
        </div>

      </div>
    </section>
  );
}


// ── reality-05-property-detail ───────────────────────────────────────────────
function PropertyDetailReality05({ content, sectionId, tenantSlug, isAdmin }: { content: Record<string, unknown>; sectionId: number; tenantSlug?: string; isAdmin: boolean }) {
  const propertyName = String(content.propertyName ?? "Nemovitost");
  const price        = String(content.price        ?? "Na dotaz");
  const location     = String(content.location     ?? "");
  const disposition  = String(content.disposition  ?? "");
  const area         = String(content.area         ?? "");
  const floor        = String(content.floor        ?? "");
  const state        = String(content.state        ?? "");
  const ownership    = String(content.ownership    ?? "");
  const energyClass  = String(content.energyClass  ?? "");
  const parking      = String(content.parking      ?? "");
  const terrace      = String(content.terrace      ?? "");
  const description  = String(content.description  ?? "");
  const features     = (content.features as string[]) ?? [];
  const images       = (content.images as string[]) ?? [];
  const agentName    = String(content.agentName    ?? "");
  const agentPhone   = String(content.agentPhone   ?? "");
  const agentEmail   = String(content.agentEmail   ?? "");
  const agentImage   = String(content.agentImage   ?? "");
  const ctaText      = String(content.ctaText      ?? "Domluvit prohlídku");
  const ctaHref      = String(content.ctaHref      ?? "/kontakt");
  const siteMode     = String(content.siteMode     ?? "multipage");

  const GOLD  = "#CFA968";
  const DARK  = "#1c1c1c";
  const WHITE = "#ffffff";
  const CREAM = "#f8f5f0";
  const MUTED = "#8a8a8a";
  const FONT  = "'Open Sans', sans-serif";

  const resolve = (href: string) => resolveNavHref(href, siteMode, tenantSlug, isAdmin);
  const [mainImg, setMainImg] = useState(0);

  const params: [string, string][] = [
    ["Dispozice", disposition],
    ["Plocha", area],
    ["Podlaží", floor],
    ["Stav", state],
    ["Vlastnictví", ownership],
    ["Energetická třída", energyClass],
    ["Parkování", parking],
    ["Terasa", terrace],
  ].filter(([, v]) => !!v.trim()) as [string, string][];

  return (
    <section data-template="reality-05" style={{ backgroundColor: WHITE, padding: "clamp(40px,6vw,72px) 0", fontFamily: FONT }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 clamp(20px,4vw,48px)" }}>

        <div className="r05-detail-layout">

          {/* Left — gallery + description */}
          <div>
            {/* Main image */}
            {images.length > 0 && (
              <div style={{ position: "relative", marginBottom: 12, overflow: "hidden", backgroundColor: CREAM }}>
                <GenericEditableImage sectionId={sectionId} field={`images.${mainImg}`} src={images[mainImg]} alt={propertyName} style={{ width: "100%" }}>
                  <img src={images[mainImg]} alt={propertyName} style={{ width: "100%", height: "auto", aspectRatio: "16/10", objectFit: "cover", display: "block" }} />
                </GenericEditableImage>
              </div>
            )}
            {/* Thumbnails */}
            {images.length > 1 && (
              <div style={{ display: "flex", gap: 8, marginBottom: 32 }}>
                {images.map((img, i) => (
                  <button key={i} onClick={() => setMainImg(i)}
                    style={{
                      flex: 1, border: i === mainImg ? `2px solid ${GOLD}` : `2px solid transparent`,
                      padding: 0, cursor: "pointer", overflow: "hidden", backgroundColor: CREAM,
                      opacity: i === mainImg ? 1 : 0.6, transition: "opacity 0.2s, border-color 0.2s",
                    }}
                    onMouseEnter={e => { e.currentTarget.style.opacity = "1"; }}
                    onMouseLeave={e => { if (i !== mainImg) e.currentTarget.style.opacity = "0.6"; }}
                  >
                    <img src={img} alt="" style={{ width: "100%", height: 72, objectFit: "cover", display: "block" }} />
                  </button>
                ))}
              </div>
            )}

            {/* Description */}
            {description && (
              <div style={{ marginBottom: 32 }}>
                <h3 style={{ fontSize: 14, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: GOLD, marginBottom: 16 }}>Popis nemovitosti</h3>
                <GenericEditableText sectionId={sectionId} field="description" value={description} tag="p"
                  style={{ fontSize: 15, lineHeight: 1.8, color: "#444", margin: 0 }} />
              </div>
            )}

            {/* Features */}
            {features.length > 0 && (
              <div>
                <h3 style={{ fontSize: 14, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: GOLD, marginBottom: 16 }}>Vybavení</h3>
                <div className="r05-detail-features" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 24px" }}>
                  {features.map((f, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ width: 6, height: 6, backgroundColor: GOLD, flexShrink: 0 }} />
                      <GenericEditableText sectionId={sectionId} field={`features.${i}`} value={f} tag="span"
                        style={{ fontSize: 14, color: "#555" }} />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right — price + params + agent */}
          <div>
            {/* Price card */}
            <div style={{ backgroundColor: DARK, padding: "28px 32px", marginBottom: 24 }}>
              <GenericEditableText sectionId={sectionId} field="price" value={price} tag="div"
                style={{ fontSize: "clamp(24px,3vw,32px)", fontWeight: 700, color: GOLD, marginBottom: 4 }} />
              {location && (
                <GenericEditableText sectionId={sectionId} field="location" value={location} tag="p"
                  style={{ fontSize: 14, color: "rgba(255,255,255,0.6)", margin: 0 }} />
              )}
            </div>

            {/* Params table */}
            <div style={{ marginBottom: 32 }}>
              {params.map(([label, val], i) => (
                <div key={i} style={{
                  display: "flex", justifyContent: "space-between", padding: "12px 0",
                  borderBottom: `1px solid ${CREAM}`, fontSize: 14,
                }}>
                  <span style={{ color: MUTED }}>{label}</span>
                  <span style={{ fontWeight: 600, color: DARK }}>{val}</span>
                </div>
              ))}
            </div>

            {/* Agent card */}
            {agentName && (
              <div style={{ backgroundColor: CREAM, padding: "24px 28px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
                  {agentImage && (
                    <GenericEditableImage sectionId={sectionId} field="agentImage" src={agentImage} alt={agentName} style={{ width: 56, height: 56 }}>
                      <img src={agentImage} alt={agentName} style={{ width: 56, height: 56, objectFit: "cover", borderRadius: "50%" }} />
                    </GenericEditableImage>
                  )}
                  <div>
                    <GenericEditableText sectionId={sectionId} field="agentName" value={agentName} tag="div"
                      style={{ fontWeight: 700, fontSize: 16, color: DARK }} />
                    <div style={{ fontSize: 12, color: MUTED, marginTop: 2 }}>Váš makléř</div>
                  </div>
                </div>
                {agentPhone && (
                  <a href={`tel:${agentPhone.replace(/\s/g, "")}`} className="r05-detail-contact" style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14, color: DARK, textDecoration: "none", marginBottom: 10, transition: "color 0.2s" }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                    <GenericEditableText sectionId={sectionId} field="agentPhone" value={agentPhone} tag="span" />
                  </a>
                )}
                {agentEmail && (
                  <a href={`mailto:${agentEmail}`} className="r05-detail-contact" style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14, color: DARK, textDecoration: "none", marginBottom: 20, transition: "color 0.2s" }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                    <GenericEditableText sectionId={sectionId} field="agentEmail" value={agentEmail} tag="span" />
                  </a>
                )}
                <a href={resolve(ctaHref)} className="r05-detail-cta" style={{
                  display: "block", textAlign: "center", padding: "14px 0",
                  backgroundColor: GOLD, color: DARK, fontWeight: 700, fontSize: 13,
                  letterSpacing: "0.08em", textTransform: "uppercase",
                  textDecoration: "none", transition: "background-color 0.3s",
                }}>
                  <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
                </a>
              </div>
            )}
          </div>
        </div>

      </div>
    </section>
  );
}



// ── reality-03-property-detail ───────────────────────────────────────────────
// Detail nemovitosti — čte ?id z URL, vybírá z properties[]. Galerie s pop-up
// lightboxem (klik na foto → fullscreen), parametry, popis, vybavení, agent card.
// ─────────────────────────────────────────────────────────────────────────────
type R03Property = {
  title: string; location: string; price: string; type?: string;
  disposition?: string; area?: string; floor?: string; state?: string;
  ownership?: string; energyClass?: string; parking?: string; terrace?: string;
  description?: string; features?: string[]; images?: string[];
};

function PropertyDetailReality03({ content, sectionId, tenantSlug, isAdmin }: { content: Record<string, unknown>; sectionId: number; tenantSlug?: string; isAdmin?: boolean }) {
  const properties = (content.properties as R03Property[]) ?? [];
  const backLabel  = String(content.backLabel ?? "Zpět na nabídku");
  const backHref   = String(content.backHref ?? "/nabidka");
  const agentName  = String(content.agentName ?? "Tereza & Martin Dvořákovi");
  const agentPhoneRaw = content.agentPhone;
  const agentPhone = String(agentPhoneRaw ?? "725 480 210");
  const agentEmail = String(content.agentEmail ?? "info@realitydvorak.cz");
  const agentImage = String(content.agentImage ?? "/templates/reality-03/agent.webp");
  const ctaText    = String(content.ctaText ?? "Domluvit prohlídku");
  const ctaHref    = String(content.ctaHref ?? "/kontakt");
  const siteMode   = String(content.siteMode ?? "multipage");

  const DARK  = "#132538";
  const OCHRE = "#e38a6a";
  const WHITE = "#ffffff";
  const LIGHT = "#dfedf5";
  const MUTED = "#7a828b";
  const SANS  = "'Helvetica Neue', Helvetica, Arial, sans-serif";

  const resolve = (href: string) => resolveNavHref(href, siteMode, tenantSlug, isAdmin ?? false);

  // Read ?id from URL (client-side)
  const [cur, setCur] = useState(0);
  useEffect(() => {
    try {
      const q = new URLSearchParams(window.location.search).get("id");
      const n = q ? parseInt(q, 10) : 0;
      if (!Number.isNaN(n) && n >= 0 && n < properties.length) setCur(n);
    } catch { /* noop */ }
  }, [properties.length]);

  const prop: R03Property = properties[cur] ?? properties[0] ?? { title: "Nemovitost", location: "", price: "Na dotaz" };
  const images = prop.images ?? [];
  const features = prop.features ?? [];
  const isRent = prop.type === "pronajem";
  const priceLabel = prop.price ? (isRent ? `${prop.price} Kč/měs.` : `${prop.price} Kč`) : "Na dotaz";

  const [mainImg, setMainImg] = useState(0);
  useEffect(() => { setMainImg(0); }, [cur]);

  // Lightbox
  const [lb, setLb] = useState<number | null>(null);
  const openLb  = (i: number) => setLb(i);
  const closeLb = () => setLb(null);
  const prevLb  = () => setLb(v => (v === null ? v : (v - 1 + images.length) % images.length));
  const nextLb  = () => setLb(v => (v === null ? v : (v + 1) % images.length));

  useEffect(() => {
    if (lb === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeLb();
      else if (e.key === "ArrowLeft") prevLb();
      else if (e.key === "ArrowRight") nextLb();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [lb, images.length]);

  const params: [string, string][] = [
    ["Dispozice", prop.disposition ?? ""],
    ["Užitná plocha", prop.area ?? ""],
    ["Podlaží", prop.floor ?? ""],
    ["Stav", prop.state ?? ""],
    ["Vlastnictví", prop.ownership ?? ""],
    ["Energetická třída", prop.energyClass ?? ""],
    ["Parkování", prop.parking ?? ""],
    ["Terasa / balkon", prop.terrace ?? ""],
  ].filter(([, v]) => !!v.trim()) as [string, string][];

  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <section data-template="reality-03" style={{ backgroundColor: WHITE, padding: "clamp(28px,4vw,48px) 0 clamp(56px,8vw,96px)", fontFamily: SANS }}>
      <div style={{ maxWidth: 1240, margin: "0 auto", padding: "0 clamp(20px,4vw,48px)" }}>

        {/* Breadcrumb / back */}
        <a href={resolve(backHref)} className="r03-detail-back" style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 12.5, fontWeight: 600, color: MUTED, textDecoration: "none", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 24, transition: "color 0.2s, gap 0.2s" }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          <GenericEditableText sectionId={sectionId} field="backLabel" value={backLabel} tag="span" />
        </a>

        {/* Title row */}
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-start", justifyContent: "space-between", gap: 16, marginBottom: 26 }}>
          <div>
            <span style={{ display: "inline-block", backgroundColor: isRent ? OCHRE : DARK, color: WHITE, fontSize: 10.5, fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", padding: "5px 11px", borderRadius: 4, marginBottom: 14 }}>
              {isRent ? "Pronájem" : "Prodej"}
            </span>
            <h1 style={{ fontSize: "clamp(1.6rem,3.2vw,2.5rem)", fontWeight: 700, color: DARK, margin: "0 0 10px", letterSpacing: "-0.025em", lineHeight: 1.15 }}>
              {prop.title}
            </h1>
            <div style={{ display: "flex", alignItems: "center", gap: 6, color: MUTED }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={OCHRE} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
              <span style={{ fontSize: 15 }}>{prop.location}</span>
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: "clamp(1.5rem,2.8vw,2.1rem)", fontWeight: 700, color: OCHRE, letterSpacing: "-0.02em" }}>{priceLabel}</div>
          </div>
        </div>

        <div className="r03-detail-layout" style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: "clamp(24px,3vw,44px)", alignItems: "start" }}>

          {/* LEFT — gallery + description + features */}
          <div>
            {/* Main image → opens lightbox */}
            {images.length > 0 && (
              <button onClick={() => openLb(mainImg)} className="r03-detail-main" aria-label="Otevřít galerii" style={{ position: "relative", display: "block", width: "100%", padding: 0, border: "none", borderRadius: 12, overflow: "hidden", cursor: "pointer", marginBottom: 12, background: LIGHT }}>
                <img src={images[mainImg]} alt={prop.title} style={{ width: "100%", aspectRatio: "16/10", objectFit: "cover", display: "block" }} />
                {/* zoom hint */}
                <span className="r03-detail-zoom" style={{ position: "absolute", right: 14, bottom: 14, display: "inline-flex", alignItems: "center", gap: 7, background: "rgba(19,37,56,0.72)", backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)", color: WHITE, fontSize: 12, fontWeight: 600, letterSpacing: "0.04em", padding: "8px 13px", borderRadius: 99 }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/></svg>
                  Zobrazit fotky · {images.length}
                </span>
              </button>
            )}
            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="r03-detail-thumbs" style={{ display: "grid", gridTemplateColumns: `repeat(${Math.min(images.length, 5)}, 1fr)`, gap: 8, marginBottom: 34 }}>
                {images.map((img, i) => (
                  <button key={i} onClick={() => { setMainImg(i); openLb(i); }} aria-label={`Fotka ${i + 1}`} className="r03-detail-thumb"
                    style={{ position: "relative", border: i === mainImg ? `2px solid ${OCHRE}` : "2px solid transparent", padding: 0, cursor: "pointer", overflow: "hidden", borderRadius: 8, background: LIGHT, opacity: i === mainImg ? 1 : 0.72, transition: "opacity 0.2s, border-color 0.2s" }}>
                    <img src={img} alt="" style={{ width: "100%", height: 68, objectFit: "cover", display: "block" }} />
                  </button>
                ))}
              </div>
            )}

            {/* Description */}
            {prop.description && (
              <div style={{ marginBottom: 34 }}>
                <h2 style={{ fontSize: 12.5, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: OCHRE, margin: "0 0 16px" }}>Popis nemovitosti</h2>
                <GenericEditableText sectionId={sectionId} field={`properties.${cur}.description`} value={prop.description} tag="p" style={{ fontSize: 15.5, lineHeight: 1.8, color: "#48505a", margin: 0, whiteSpace: "pre-line" }} />
              </div>
            )}

            {/* Features */}
            {features.length > 0 && (
              <div>
                <h2 style={{ fontSize: 12.5, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: OCHRE, margin: "0 0 16px" }}>Vybavení a dispozice</h2>
                <div className="r03-detail-features" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px 28px" }}>
                  {features.map((f, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 11 }}>
                      <span aria-hidden style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 22, height: 22, borderRadius: "50%", background: "rgba(227,138,106,0.14)", flexShrink: 0 }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={OCHRE} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                      </span>
                      <GenericEditableText sectionId={sectionId} field={`properties.${cur}.features.${i}`} value={f} tag="span" style={{ fontSize: 14.5, color: "#48505a" }} />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT — sticky params + agent */}
          <div className="r03-detail-side">
            {/* Params card */}
            {params.length > 0 && (
              <div style={{ border: "1px solid #e7eaed", borderRadius: 12, padding: "8px 22px", marginBottom: 20 }}>
                {params.map(([label, val], i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "13px 0", borderBottom: i === params.length - 1 ? "none" : "1px solid #eef1f3", fontSize: 14 }}>
                    <span style={{ color: MUTED }}>{label}</span>
                    <span style={{ fontWeight: 700, color: DARK }}>{val}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Agent card */}
            <div style={{ background: DARK, borderRadius: 12, padding: "26px 26px 28px", color: WHITE }}>
              <div style={{ display: "flex", alignItems: "center", gap: 15, marginBottom: 22 }}>
                {agentImage && (
                  <GenericEditableImage sectionId={sectionId} field="agentImage" src={agentImage} alt={agentName} style={{ width: 58, height: 58, flexShrink: 0 }}>
                    <img src={agentImage} alt={agentName} style={{ width: 58, height: 58, objectFit: "cover", objectPosition: "top center", borderRadius: "50%", display: "block" }} />
                  </GenericEditableImage>
                )}
                <div>
                  <GenericEditableText sectionId={sectionId} field="agentName" value={agentName} tag="div" style={{ fontWeight: 700, fontSize: 15.5, color: WHITE, lineHeight: 1.25 }} />
                  <GenericEditableText sectionId={sectionId} field="agentRole" value={String(content.agentRole ?? "Vaši rodinní makléři")} tag="div" style={{ fontSize: 12, color: OCHRE, marginTop: 3, letterSpacing: "0.04em" }} />
                </div>
              </div>
              <a href={`tel:${agentPhone.replace(/\s/g, "")}`} className="r03-detail-contact" style={{ display: "flex", alignItems: "center", gap: 11, fontSize: 14.5, color: "rgba(255,255,255,0.9)", textDecoration: "none", marginBottom: 12, transition: "color 0.2s" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={OCHRE} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.9.35 1.78.66 2.63a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.45-1.29a2 2 0 0 1 2.11-.45c.85.31 1.73.53 2.63.66A2 2 0 0 1 22 16.92z"/></svg>
                <GenericEditableText sectionId={sectionId} field="agentPhone" value={agentPhone} tag="span" />
              </a>
              <a href={`mailto:${agentEmail}`} className="r03-detail-contact" style={{ display: "flex", alignItems: "center", gap: 11, fontSize: 14.5, color: "rgba(255,255,255,0.9)", textDecoration: "none", marginBottom: 22, transition: "color 0.2s" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={OCHRE} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                <GenericEditableText sectionId={sectionId} field="agentEmail" value={agentEmail} tag="span" />
              </a>
              <a href={resolve(ctaHref)} className="r03-detail-cta" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 9, padding: "14px 0", background: OCHRE, color: WHITE, fontWeight: 700, fontSize: 13, letterSpacing: "0.08em", textTransform: "uppercase", textDecoration: "none", borderRadius: 99, transition: "transform 0.25s, box-shadow 0.25s, background 0.25s" }}>
                <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* LIGHTBOX popup */}
      {lb !== null && images[lb] && (
        <div onClick={closeLb} className="r03-lb-backdrop" style={{ position: "fixed", inset: 0, zIndex: 3000, background: "rgba(10,18,28,0.94)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)", display: "flex", flexDirection: "column" }}>
          {/* Top bar */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "clamp(14px,3vw,26px) clamp(16px,4vw,40px)", color: WHITE, flexShrink: 0 }}>
            <span style={{ fontSize: 14, fontWeight: 600, letterSpacing: "0.08em", fontFamily: SANS }}>
              <span style={{ color: OCHRE }}>{pad(lb + 1)}</span>
              <span style={{ opacity: 0.5 }}> / {pad(images.length)}</span>
            </span>
            <button onClick={closeLb} aria-label="Zavřít galerii" className="r03-lb-close" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 42, height: 42, borderRadius: "50%", border: "1px solid rgba(255,255,255,0.25)", background: "transparent", color: WHITE, cursor: "pointer", transition: "background 0.2s, transform 0.2s" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
          {/* Stage */}
          <div onClick={e => e.stopPropagation()} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "clamp(8px,2vw,24px)", padding: "0 clamp(12px,3vw,40px)", minHeight: 0 }}>
            <button onClick={prevLb} aria-label="Předchozí" className="r03-lb-nav" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 48, height: 48, borderRadius: "50%", border: "1px solid rgba(255,255,255,0.25)", background: "rgba(255,255,255,0.06)", color: WHITE, cursor: "pointer", flexShrink: 0, transition: "background 0.2s" }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
            </button>
            <img key={lb} src={images[lb]} alt={prop.title} className="r03-lb-img" style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain", borderRadius: 8, boxShadow: "0 30px 80px rgba(0,0,0,0.6)" }} />
            <button onClick={nextLb} aria-label="Další" className="r03-lb-nav" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 48, height: 48, borderRadius: "50%", border: "1px solid rgba(255,255,255,0.25)", background: "rgba(255,255,255,0.06)", color: WHITE, cursor: "pointer", flexShrink: 0, transition: "background 0.2s" }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg>
            </button>
          </div>
          {/* Caption + thumb strip */}
          <div onClick={e => e.stopPropagation()} style={{ padding: "clamp(12px,2vw,20px) clamp(16px,4vw,40px) clamp(18px,3vw,30px)", flexShrink: 0 }}>
            <p style={{ textAlign: "center", color: "rgba(255,255,255,0.85)", fontSize: 14, margin: "0 0 14px", fontFamily: SANS }}>{prop.title} · {prop.location}</p>
            <div className="r03-lb-strip" style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
              {images.map((img, i) => (
                <button key={i} onClick={() => setLb(i)} aria-label={`Fotka ${i + 1}`} style={{ padding: 0, border: i === lb ? `2px solid ${OCHRE}` : "2px solid transparent", borderRadius: 6, overflow: "hidden", cursor: "pointer", background: "none", opacity: i === lb ? 1 : 0.55, transition: "opacity 0.2s, border-color 0.2s" }}>
                  <img src={img} alt="" style={{ width: 64, height: 44, objectFit: "cover", display: "block" }} />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

// ── eshop-16-benefits ───────────────────────────────────────────────────────────
// Spížka (kosik.cz DNA): „Proč nakupovat ve Spížce" — horizontální pás širokých
// karet na surface krému (radius 16): velká fíková ikona vlevo, vpravo tučný
// Bricolage titulek + menší fialový text. Scroll-snap + kruhové šipky mizící
// na krajích (vzor es16c). content: heading / items[{icon,title,text}].
// Ikony: bag | multibuy | pricematch | family | leaf.
// ──────────────────────────────────────────────────────────────────────────────
type Es16Benefit = { icon?: string; title?: string; text?: string };

function Es16BenefitIcon({ name }: { name: string }) {
  const common = { fill: "none", stroke: "currentColor", strokeWidth: 1.6, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  switch (name) {
    case "multibuy":
      return (
        <svg width="64" height="64" viewBox="0 0 24 24" {...common}>
          <rect x="3" y="8.5" width="9" height="9" rx="1.6"/><rect x="8.5" y="5" width="9" height="9" rx="1.6" fill="var(--es16b-bg, #f6efe4)"/>
          <path d="M13 9.5v4M11 11.5h4"/>
        </svg>
      );
    case "pricematch":
      return (
        <svg width="64" height="64" viewBox="0 0 24 24" {...common}>
          <circle cx="10.5" cy="10.5" r="6.5"/><path d="m15.5 15.5 4.5 4.5"/>
          <path d="M8 11.8 10 9.2l1.6 2 2.2-2.8"/>
        </svg>
      );
    case "family":
      return (
        <svg width="64" height="64" viewBox="0 0 24 24" {...common}>
          <path d="M4 11.5 12 5l8 6.5"/><path d="M6.5 10v8.5h11V10"/>
          <path d="M12 16.4s-2.4-1.5-2.4-3a1.35 1.35 0 0 1 2.4-.9 1.35 1.35 0 0 1 2.4.9c0 1.5-2.4 3-2.4 3Z"/>
        </svg>
      );
    case "leaf":
      return (
        <svg width="64" height="64" viewBox="0 0 24 24" {...common}>
          <path d="M5 19C5 9 12 4 20 4c0 8-4 15-13 15Z"/><path d="M5 19c3-5 7-8 11-10"/>
        </svg>
      );
    default: // bag
      return (
        <svg width="64" height="64" viewBox="0 0 24 24" {...common}>
          <path d="M5.5 8h13l-1 12h-11l-1-12Z"/><path d="M9 10.5V6.8a3 3 0 0 1 6 0v3.7"/>
          <circle cx="12" cy="15" r="0.4" fill="currentColor"/>
        </svg>
      );
  }
}

function BenefitsEshop16({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const HEAD = "'Bricolage Grotesque', 'Segoe UI', sans-serif";
  const SANS = "'Figtree', 'Segoe UI', system-ui, sans-serif";
  const FIG = "#56203d";
  const INK = "#241a20";
  const MUTED = "#7a6c74";
  const CREAM = "#fbf7f1";
  const SURFACE = "#f6efe4";
  const LINE = "#e9dfe0";

  const heading = String(content.heading ?? "Proč nakupovat ve Spížce");
  const items = ((content.items as Es16Benefit[]) ?? []).slice(0, 8);
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
    <section data-variant="eshop-16-benefits" style={{ fontFamily: SANS, background: CREAM, padding: "26px 0 12px" }}>
      <style>{`
        .es16b-rail { display: flex; gap: 14px; overflow-x: auto; scroll-snap-type: x mandatory; scrollbar-width: none; -ms-overflow-style: none; padding: 4px 2px 14px; }
        .es16b-rail::-webkit-scrollbar { display: none; }
        .es16b-card { --es16b-bg: ${SURFACE}; scroll-snap-align: start; flex: 0 0 calc(25% - 10.5px); min-width: 320px; background: ${SURFACE}; border-radius: 16px;
          padding: 26px 24px; display: flex; align-items: center; gap: 20px; transition: transform 0.18s, box-shadow 0.18s; }
        .es16b-card:hover { transform: translateY(-3px); box-shadow: 0 16px 32px rgba(86,32,61,0.10); }
        .es16b-icon { flex: 0 0 auto; color: ${FIG}; display: inline-flex; }
        .es16b-title { font-family: ${HEAD}; font-weight: 800; font-size: 19px; letter-spacing: -0.01em; color: ${FIG}; line-height: 1.2; margin: 0; }
        .es16b-text { margin: 5px 0 0; font-size: 13.5px; font-weight: 500; color: ${MUTED}; line-height: 1.45; }
        .es16b-arrow { position: absolute; top: 50%; transform: translateY(-50%); z-index: 5; width: 44px; height: 44px; border-radius: 999px;
          border: 1px solid ${LINE}; background: #fff; color: ${FIG}; cursor: pointer; display: inline-flex; align-items: center; justify-content: center;
          box-shadow: 0 10px 24px rgba(36,26,32,0.12); transition: background 0.15s, opacity 0.18s; }
        .es16b-arrow:hover { background: ${FIG}; color: #fff; }
        .es16b-arrow:disabled { opacity: 0; pointer-events: none; }
        @media (max-width: 640px) { .es16b-card { min-width: 280px; padding: 20px 18px; gap: 15px; } .es16b-arrow { display: none; } .es16b-icon svg { width: 52px; height: 52px; } }
      `}</style>
      <div style={{ maxWidth: 1420, margin: "0 auto", padding: "0 28px" }}>
        <GenericEditableText sectionId={sectionId} field="heading" value={heading} tag="h2" style={{
          fontFamily: HEAD, fontWeight: 800, fontSize: "clamp(20px, 2vw, 26px)", letterSpacing: "-0.015em", color: INK, margin: "0 0 14px",
        }} />
        <div style={{ position: "relative" }}>
          <button className="es16b-arrow" style={{ left: -14 }} onClick={() => scrollBy(-1)} disabled={!canL} aria-label="Posunout doleva">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 6-6 6 6 6"/></svg>
          </button>
          <div className="es16b-rail" ref={railRef} onScroll={updateArrows}>
            {items.map((b, i) => (
              <div key={i} className="es16b-card">
                <span className="es16b-icon"><Es16BenefitIcon name={String(b.icon ?? "bag")} /></span>
                <span>
                  <h3 className="es16b-title">{b.title}</h3>
                  <p className="es16b-text">{b.text}</p>
                </span>
              </div>
            ))}
          </div>
          <button className="es16b-arrow" style={{ right: -14 }} onClick={() => scrollBy(1)} disabled={!canR} aria-label="Posunout doprava">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 6 6 6-6 6"/></svg>
          </button>
        </div>
      </div>
    </section>
  );
}

// ── eshop-17-benefits ───────────────────────────────────────────────────────────
// Rozkvět (florea.cz DNA): „Proč většina lidí na internetu nakupuje květiny
// u nás" — 5 krémových karet s vlasovým rámem: bordó titulek nahoře (2 řádky),
// pod ním vizuál. Tři typy vizuálu per karta: `image` (foto s hover zoomem),
// `map` (mini verze hero SVG mapy ČR s pulzujícími kurýry), `awards` (panel
// se zlatou hvězdou, Cena kvality + 100 nejlepších chipy). Fraunces nadpis
// bordó. Desktop 5 sloupců, mobil horizontální scroll-snap.
// content: heading / items[{title, image?, type?("map"|"awards"), awards?[{title,sub}]}]
// ──────────────────────────────────────────────────────────────────────────────
type Es17Benefit = { title?: string; image?: string; type?: string; awards?: Array<{ title?: string; sub?: string }> };

function BenefitsEshop17({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const HEAD = "'Fraunces', Georgia, serif";
  const SANS = "'Instrument Sans', 'Segoe UI', system-ui, sans-serif";
  const BORDO = "#8f1d3d";
  const BORDO_DK = "#611028";
  const GOLD = "#c9a24b";
  const INK = "#241a1d";
  const MUTED = "#7d6d72";
  const CREAM = "#f7f1e8";
  const LINE = "#eadfd6";

  const heading = String(content.heading ?? "Proč většina lidí na internetu nakupuje květiny u nás");
  const items = ((content.items as Es17Benefit[]) ?? []).slice(0, 6);

  if (!items.length) return null;

  return (
    <section data-variant="eshop-17-benefits" style={{ fontFamily: SANS, background: "#fff", padding: "30px 0 16px" }}>
      <style>{`
        .es17b-row { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 14px; }
        @media (max-width: 1100px) {
          .es17b-row { display: flex; overflow-x: auto; scroll-snap-type: x proximity; scrollbar-width: none; -ms-overflow-style: none; padding-bottom: 8px; }
          .es17b-row::-webkit-scrollbar { display: none; }
          .es17b-card { flex: 0 0 240px; scroll-snap-align: start; }
        }
        .es17b-card { background: ${CREAM}; border: 1px solid ${LINE}; border-radius: 14px; overflow: hidden; display: flex; flex-direction: column;
          transition: transform 0.18s, box-shadow 0.2s; }
        .es17b-card:hover { transform: translateY(-3px); box-shadow: 0 16px 32px rgba(46,10,24,0.1); }
        .es17b-title { padding: 14px 16px 12px; font-size: 14.5px; font-weight: 700; color: ${BORDO}; line-height: 1.4; min-height: calc(2.8em + 26px); }
        .es17b-media { position: relative; aspect-ratio: 4/3.1; overflow: hidden; background: #fdfbf8; border-top: 1px solid ${LINE}; margin: 0 12px 12px; border: 1px solid ${LINE}; border-radius: 10px; }
        .es17b-media img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; transition: transform 0.5s cubic-bezier(0.16,1,0.3,1); }
        .es17b-card:hover .es17b-media img { transform: scale(1.06); }
        @keyframes es17bPulse { 0% { transform: scale(0.55); opacity: 0.85; } 70% { transform: scale(1.9); opacity: 0; } 100% { transform: scale(1.9); opacity: 0; } }
        .es17b-ring { transform-origin: center; transform-box: fill-box; animation: es17bPulse 2.6s ease-out infinite; }
      `}</style>

      <div style={{ maxWidth: 1420, margin: "0 auto", padding: "0 28px" }}>
        <GenericEditableText sectionId={sectionId} field="heading" value={heading} tag="h2" style={{
          fontFamily: HEAD, fontWeight: 600, fontSize: "clamp(23px, 2.2vw, 30px)", letterSpacing: "-0.01em", color: BORDO, margin: "0 0 18px",
        }} />
        <div className="es17b-row">
          {items.map((it, i) => (
            <div key={i} className="es17b-card">
              <span className="es17b-title">{it.title}</span>
              <span className="es17b-media">
                {it.type === "map" ? (
                  <svg viewBox="0 0 180 135" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} role="img" aria-label="Poloha kurýrů na mapě">
                    <rect width="180" height="135" fill="#fdfbf8" />
                    <g transform="translate(0, 22)">
                      <path d="M 18 38 C 14 28 22 18 34 16 C 44 10 58 8 70 12 C 84 8 104 10 116 16 C 130 14 146 20 152 30 C 162 34 166 44 160 52 C 156 62 144 66 132 64 C 124 72 108 76 96 70 C 84 76 66 74 56 66 C 42 68 28 62 24 52 C 18 48 16 44 18 38 Z"
                        fill="#e4ecdf" stroke="#c4d4bb" strokeWidth="1" />
                      {[{ x: 55, y: 27 }, { x: 96, y: 34 }, { x: 34, y: 44 }, { x: 128, y: 46 }, { x: 148, y: 28 }, { x: 76, y: 58 }].map((p, pi) => (
                        <g key={pi}>
                          <circle className="es17b-ring" cx={p.x} cy={p.y} r="4.5" fill="none" stroke={BORDO} strokeWidth="0.9" style={{ animationDelay: `${pi * 0.45}s` }} />
                          <circle cx={p.x} cy={p.y} r="3" fill={BORDO} />
                        </g>
                      ))}
                    </g>
                  </svg>
                ) : it.type === "awards" ? (
                  <span style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 9, padding: 12 }}>
                    <svg width="34" height="34" viewBox="0 0 24 24" fill={GOLD} aria-hidden="true"><path d="M12 2.5l2.5 5.4 5.9.6-4.4 4 1.2 5.8-5.2-3-5.2 3 1.2-5.8-4.4-4 5.9-.6L12 2.5z"/></svg>
                    {(it.awards ?? []).slice(0, 2).map((a, ai) => (
                      <span key={ai} style={{ background: ai === 0 ? BORDO : "#fff", border: ai === 0 ? "none" : `1px solid ${LINE}`, borderRadius: 9, padding: "6px 13px", textAlign: "center", lineHeight: 1.3 }}>
                        <span style={{ display: "block", fontSize: 11.5, fontWeight: 700, color: ai === 0 ? "#fff" : INK }}>{a.title}</span>
                        {a.sub && <span style={{ display: "block", fontSize: 10, color: ai === 0 ? "rgba(255,255,255,0.75)" : MUTED }}>{a.sub}</span>}
                      </span>
                    ))}
                  </span>
                ) : (
                  it.image && <img src={it.image} alt={it.title ?? ""} loading="lazy" />
                )}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── artist-01-concerts (Koncerty) ────────────────────────────────────────────────
// 1:1 luciebila.com #koncerty: grid 4 karet, každá inner (bg světle šedá, padding)
// s date (31px) → bordered-box (city red uppercase + timePlace) → tourName →
// ticket odkaz s ikonou. Elevace na award level: karta lift + granátový sloupec
// zleva, datum split (den velký / měsíc), hairliny grow, ticket ikona + arrow
// nudge, jemný stagger reveal. + "Všechny termíny" CTA pod gridem.
// ─────────────────────────────────────────────────────────────────────────────
type Ar01Concert = { day?: string; month?: string; city?: string; time?: string; venue?: string; tour?: string; ticketHref?: string; soldOut?: boolean };

function ConcertsArtist01({ content, sectionId, tenantSlug, isAdmin }: { content: Record<string, unknown>; sectionId: number; tenantSlug?: string; isAdmin: boolean }) {
  const siteMode = String(content.siteMode ?? "multipage");
  const resolve  = (href: string) => resolveNavHref(href, siteMode, tenantSlug, isAdmin);

  const eyebrowRaw  = (content as Record<string, unknown>).eyebrow;
  const titleRaw    = (content as Record<string, unknown>).title;
  const subtitleRaw = (content as Record<string, unknown>).subtitle;
  const eyebrow  = eyebrowRaw  === undefined ? "Turné 2026" : String(eyebrowRaw);
  const title    = titleRaw    === undefined ? "Koncerty" : String(titleRaw);
  const subtitle = subtitleRaw === undefined ? "Přijďte na živý zážitek — velké haly i komorní sály po celé republice." : String(subtitleRaw);
  const showHeader = !!(eyebrow.trim() || title.trim() || subtitle.trim());

  const ctaText  = String(content.ctaText ?? "Všechny termíny");
  const ctaHref  = String(content.ctaHref ?? "/koncerty");
  const ticketLabel = String(content.ticketLabel ?? "Koupit vstupenku");
  const soldLabel   = String(content.soldLabel ?? "Vyprodáno");

  const items = (content.concerts as Ar01Concert[]) ?? [
    { day: "6", month: "Říjen", city: "Chomutov", time: "19:00", venue: "Kulturní dům Rocknet", tour: "Střepy a světlo", ticketHref: "/koncerty" },
    { day: "12", month: "Říjen", city: "Plzeň", time: "19:00", venue: "Měšťanská beseda", tour: "Střepy a světlo", ticketHref: "/koncerty" },
    { day: "18", month: "Říjen", city: "Jihlava", time: "19:30", venue: "Horácká aréna", tour: "Střepy a světlo", ticketHref: "/koncerty", soldOut: true },
    { day: "25", month: "Říjen", city: "Praha", time: "20:00", venue: "Rudolfinum — Dvořákova síň", tour: "Střepy a světlo", ticketHref: "/koncerty" },
  ];

  const RED = "#9b1c31";

  return (
    <>
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;1,500&family=Roboto:wght@300;400;500;700&display=swap" />
      <style>{`
        .ar01-conc { background: #faf7f2; padding: 96px 40px; }
        .ar01-conc-wrap { max-width: 1180px; margin: 0 auto; }
        .ar01-conc-head { text-align: center; margin-bottom: 60px; }
        .ar01-conc-eyebrow {
          display: block; font-family: 'Roboto', sans-serif; font-size: 13px; font-weight: 500;
          letter-spacing: .34em; text-transform: uppercase; color: ${RED}; margin-bottom: 14px;
        }
        .ar01-conc-title {
          font-family: 'Cormorant Garamond', Georgia, serif; font-style: italic;
          font-size: clamp(38px, 5vw, 60px); font-weight: 600; color: #14100e; margin: 0 0 16px; line-height: 1.02;
        }
        .ar01-conc-sub {
          font-family: 'Roboto', sans-serif; font-size: 17px; line-height: 28px; color: #6b6258;
          max-width: 560px; margin: 0 auto;
        }
        .ar01-conc-grid {
          display: grid; grid-template-columns: repeat(4, 1fr); gap: 26px;
        }
        .ar01-conc-card {
          position: relative; overflow: hidden;
          background: #fff;
          border: 1px solid #ece3d6;
          padding: 44px 24px 34px;
          text-align: center;
          transition: transform .5s cubic-bezier(.32,.72,0,1), box-shadow .5s cubic-bezier(.32,.72,0,1), border-color .5s;
          opacity: 0; transform: translateY(22px);
          animation: ar01ConcIn .6s cubic-bezier(.32,.72,0,1) forwards;
        }
        @keyframes ar01ConcIn { to { opacity: 1; transform: translateY(0); } }
        .ar01-conc-card::before {
          content: ""; position: absolute; left: 0; top: 0; bottom: 0; width: 3px;
          background: ${RED}; transform: scaleY(0); transform-origin: top center;
          transition: transform .5s cubic-bezier(.32,.72,0,1);
        }
        .ar01-conc-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 30px 60px -30px rgba(20,16,14,.4);
          border-color: transparent;
        }
        .ar01-conc-card:hover::before { transform: scaleY(1); }
        .ar01-conc-date {
          display: flex; flex-direction: column; align-items: center; line-height: 1; margin-bottom: 20px;
        }
        .ar01-conc-day {
          font-family: 'Cormorant Garamond', Georgia, serif; font-size: 52px; font-weight: 600; color: #14100e;
        }
        .ar01-conc-month {
          font-family: 'Roboto', sans-serif; font-size: 12px; font-weight: 500; letter-spacing: .28em;
          text-transform: uppercase; color: #9a8f84; margin-top: 4px;
        }
        .ar01-conc-hr { width: 0; height: 1px; background: #14100e; margin: 0 auto 14px; transition: width .5s cubic-bezier(.32,.72,0,1); }
        .ar01-conc-card:hover .ar01-conc-hr { width: 90px; }
        .ar01-conc-card:not(:hover) .ar01-conc-hr { width: 60px; opacity: .5; }
        .ar01-conc-city {
          font-family: 'Roboto', sans-serif; font-size: 19px; font-weight: 500; letter-spacing: .06em;
          text-transform: uppercase; color: ${RED}; margin-bottom: 6px;
        }
        .ar01-conc-place {
          font-family: 'Roboto', sans-serif; font-size: 15px; font-weight: 400; color: #4b423d; line-height: 22px; margin-bottom: 4px;
        }
        .ar01-conc-place b { font-weight: 600; color: #14100e; }
        .ar01-conc-tour {
          font-family: 'Cormorant Garamond', Georgia, serif; font-style: italic; font-size: 19px; font-weight: 500;
          color: #14100e; margin: 18px 0 22px;
        }
        .ar01-conc-ticket {
          display: inline-flex; align-items: center; gap: 9px;
          font-family: 'Roboto', sans-serif; font-size: 14px; font-weight: 700; letter-spacing: .1em; text-transform: uppercase;
          color: #14100e; text-decoration: none; padding-bottom: 3px;
          border-bottom: 1.5px solid transparent;
          transition: color .35s cubic-bezier(.32,.72,0,1), border-color .35s;
        }
        .ar01-conc-ticket svg { transition: transform .35s cubic-bezier(.32,.72,0,1); }
        .ar01-conc-ticket:hover { color: ${RED}; border-color: ${RED}; }
        .ar01-conc-ticket:hover svg { transform: translateX(4px); }
        .ar01-conc-sold {
          display: inline-block; font-family: 'Roboto', sans-serif; font-size: 13px; font-weight: 700;
          letter-spacing: .16em; text-transform: uppercase; color: #b3a99e; padding-bottom: 3px;
        }
        .ar01-conc-cta {
          text-align: center; margin-top: 56px;
        }
        .ar01-conc-cta a {
          position: relative; overflow: hidden;
          display: inline-block; font-family: 'Roboto', sans-serif; font-size: 15px; font-weight: 700;
          letter-spacing: .14em; text-transform: uppercase; color: #14100e; text-decoration: none;
          padding: 15px 44px; border: 1.5px solid #14100e; border-radius: 50px;
          transition: color .45s cubic-bezier(.32,.72,0,1), border-color .45s;
        }
        .ar01-conc-cta a::before {
          content: ""; position: absolute; inset: 0; background: ${RED}; transform: translateY(101%);
          transition: transform .45s cubic-bezier(.32,.72,0,1); z-index: -1;
        }
        .ar01-conc-cta a:hover { color: #fff; border-color: ${RED}; }
        .ar01-conc-cta a:hover::before { transform: translateY(0); }
        @media (max-width: 1000px) {
          .ar01-conc-grid { grid-template-columns: repeat(2, 1fr); gap: 20px; }
        }
        @media (max-width: 560px) {
          .ar01-conc { padding: 64px 22px; }
          .ar01-conc-grid { grid-template-columns: 1fr; }
        }
        @media (prefers-reduced-motion: reduce) {
          .ar01-conc-card { animation: none; opacity: 1; transform: none; }
        }
      `}</style>

      <section className="ar01-conc" data-template="artist-01" id="koncerty">
        <div className="ar01-conc-wrap">
          {showHeader && (
            <div className="ar01-conc-head">
              <GenericEditableText sectionId={sectionId} field="eyebrow" value={eyebrow} tag="span" className="ar01-conc-eyebrow" />
              <GenericEditableText sectionId={sectionId} field="title" value={title} tag="h2" className="ar01-conc-title" />
              <GenericEditableText sectionId={sectionId} field="subtitle" value={subtitle} tag="p" className="ar01-conc-sub" />
            </div>
          )}

          <div className="ar01-conc-grid">
            {items.map((c, i) => (
              <div className="ar01-conc-card" key={i} style={{ animationDelay: `${0.08 + i * 0.09}s` }}>
                <div className="ar01-conc-date">
                  <GenericEditableText sectionId={sectionId} field={`concerts.${i}.day`} value={String(c.day ?? "")} tag="span" className="ar01-conc-day" />
                  <GenericEditableText sectionId={sectionId} field={`concerts.${i}.month`} value={String(c.month ?? "")} tag="span" className="ar01-conc-month" />
                </div>
                <div className="ar01-conc-hr" aria-hidden="true" />
                <GenericEditableText sectionId={sectionId} field={`concerts.${i}.city`} value={String(c.city ?? "")} tag="div" className="ar01-conc-city" />
                <div className="ar01-conc-place">
                  <GenericEditableText sectionId={sectionId} field={`concerts.${i}.time`} value={String(c.time ?? "")} tag="b" />{" "}
                  <GenericEditableText sectionId={sectionId} field={`concerts.${i}.venue`} value={String(c.venue ?? "")} tag="span" />
                </div>
                <GenericEditableText sectionId={sectionId} field={`concerts.${i}.tour`} value={String(c.tour ?? "")} tag="div" className="ar01-conc-tour" />
                {c.soldOut ? (
                  <span className="ar01-conc-sold">{soldLabel}</span>
                ) : (
                  <a href={resolve(String(c.ticketHref ?? ctaHref))} className="ar01-conc-ticket">
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 9a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2 2 2 0 0 0 0 4 2 2 0 0 1-2 2H5a2 2 0 0 1-2-2 2 2 0 0 0 0-4z"/><path d="M13 7v10"/></svg>
                    <span>{ticketLabel}</span>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
                  </a>
                )}
              </div>
            ))}
          </div>

          {ctaText.trim() && (
            <div className="ar01-conc-cta">
              <a href={resolve(ctaHref)}>
                <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span">{ctaText}</GenericEditableText>
              </a>
            </div>
          )}
        </div>
      </section>
    </>
  );
}


// barber-03 pricing table. Vlastní komponenta, aby se hooks nevolaly až za
// early returny dispatcheru — jinak změna varianty za běhu mění počet hooks.
function PricingTableVideo({ content, title, sectionId }: { content: Record<string, unknown>; title: string; sectionId: number }) {
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

// ══ PROOF (proof-01) — services / process / pricing ═══════════════════════════
type Pf01Svc = { name?: string; description?: string; icon?: string; photo?: string; priceFrom?: string; href?: string };

function Pf01Icon({ name }: { name?: string }) {
  const p: Record<string, React.ReactNode> = {
    wrench: <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>,
    home: <><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></>,
    shield: <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>,
    zap: <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>,
    droplet: <path d="M12 2.7l5.66 5.66a8 8 0 1 1-11.31 0z"/>,
    leaf: <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10zM2 21c0-3 1.85-5.36 5.08-6"/>,
    truck: <><path d="M1 3h15v13H1z"/><path d="M16 8h4l3 3v5h-7z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></>,
    tool: <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>,
  };
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {p[name ?? "wrench"] ?? p.wrench}
    </svg>
  );
}

function ServicesProof01({ content, sectionId, tenantSlug, isAdmin }: { content: Record<string, unknown>; sectionId: number; tenantSlug?: string; isAdmin: boolean }) {
  const eyebrow = String(content.eyebrow ?? "Co pro vás uděláme");
  const title   = String(content.title   ?? "Služby na míru vaší zakázce");
  const lead    = String(content.lead    ?? "Vyberte oblast — na detailu služby najdete rozsah, ceník a příklady realizací.");
  const items = (content.items as Pf01Svc[] | undefined) ?? [];
  const linkLabel = String(content.linkLabel ?? "Zjistit více");
  const gridRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const root = gridRef.current;
    if (!root) return;
    const els = Array.from(root.querySelectorAll<HTMLElement>(".pf01svc-card"));
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("pf01-vis"); io.unobserve(e.target); } });
    }, { threshold: 0.15 });
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [items.length]);
  return (
    <>
      <style>{`
        .pf01svc { --pf-accent:#C3352B; --pf-ink:#1B3A5C; --pf-muted:#6A6E78; --pf-border:#E5E1D8; --pf-surface:#fff;
          background:#fff; font-family:var(--font-body, system-ui, -apple-system, sans-serif); color:var(--pf-ink);
          padding:clamp(56px,8vw,104px) clamp(20px,5vw,48px); }
        .pf01svc-inner { max-width:1280px; margin:0 auto; }
        .pf01svc-head { max-width:640px; margin-bottom:clamp(32px,5vw,56px); }
        .pf01-eyebrow { font-size:.78rem; font-weight:800; letter-spacing:.16em; text-transform:uppercase; color:var(--pf-accent); margin:0 0 12px; display:inline-flex; align-items:center; gap:12px; }
        .pf01-eyebrow::before { content:''; width:32px; height:2px; background:var(--pf-accent); }
        .pf01svc-title { font-family:var(--font-heading, system-ui, sans-serif); color:var(--pf-ink); font-size:clamp(1.9rem,3.8vw,3rem); font-weight:800; letter-spacing:-.03em; line-height:1.06; margin:0 0 14px; }
        .pf01svc-lead { font-size:1.05rem; color:var(--pf-muted); line-height:1.6; margin:0; }
        .pf01svc-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(280px,1fr)); gap:18px; }
        .pf01svc-card { position:relative; display:flex; flex-direction:column; gap:0; background:var(--pf-surface); border:1px solid var(--pf-border);
          border-radius:12px; padding:0; text-decoration:none; color:inherit; overflow:hidden;
          opacity:0; transform:translateY(20px);
          transition:opacity .55s cubic-bezier(.22,.68,0,1) calc(var(--i,0) * 70ms), transform .55s cubic-bezier(.22,.68,0,1) calc(var(--i,0) * 70ms), box-shadow .25s, border-color .25s; }
        .pf01svc-card.pf01-vis { opacity:1; transform:translateY(0); }
        .pf01svc-card.pf01-vis:hover { transform:translateY(-5px); box-shadow:0 12px 28px -18px rgba(27,58,92,.25); border-color:#d4cec1;
          transition:opacity .2s, transform .25s cubic-bezier(.22,.68,0,1), box-shadow .25s, border-color .25s; }
        .pf01svc-card::after { content:''; position:absolute; left:0; top:0; height:100%; width:3px; background:var(--pf-accent); transform:scaleY(0); transform-origin:top; transition:transform .3s cubic-bezier(.22,.68,0,1); }
        .pf01svc-card:hover::after { transform:scaleY(1); }
        .pf01svc-idx-old { display:none; position:absolute; top:14px; right:18px; font-family:var(--font-instrument-serif, Georgia, serif); font-style:italic;
          font-size:2.2rem; line-height:1; color:rgba(27,58,92,.07); transition:color .3s; pointer-events:none; user-select:none; }
        .pf01svc-card:hover .pf01svc-idx { color:rgba(195,53,43,.22); }
        .pf01svc-photo { position:relative; aspect-ratio:16/10; overflow:hidden; background:#E8E4DC; }
        .pf01svc-photo img { position:absolute; inset:0; width:100%; height:100%; object-fit:cover; transition:transform .5s cubic-bezier(.22,.68,0,1); }
        .pf01svc-card:hover .pf01svc-photo img { transform:scale(1.05); }
        .pf01svc-photo::after { content:''; position:absolute; inset:0; background:linear-gradient(180deg, transparent 55%, rgba(12,22,34,.45)); }
        .pf01svc-num { position:absolute; left:16px; bottom:12px; z-index:1; color:#fff; font-weight:800; font-size:.8rem; letter-spacing:.14em; }
        .pf01svc-body { display:flex; flex-direction:column; gap:12px; padding:22px 24px 24px; flex:1; }
        .pf01svc-name { font-family:var(--font-heading, system-ui, sans-serif); color:var(--pf-ink); font-size:1.18rem; font-weight:800; letter-spacing:-.01em; margin:0; }
        .pf01svc-desc { font-size:.94rem; color:var(--pf-muted); line-height:1.55; margin:0; flex:1; }
        .pf01svc-foot { display:flex; align-items:center; justify-content:space-between; gap:10px; margin-top:4px; }
        .pf01svc-price { font-weight:800; font-size:.98rem; }
        .pf01svc-more { display:inline-flex; align-items:center; gap:6px; font-weight:700; font-size:.88rem; color:var(--pf-accent); }
        .pf01svc-more svg { transition:transform .25s; } .pf01svc-card:hover .pf01svc-more svg { transform:translateX(4px); }
        @media (prefers-reduced-motion: reduce){ .pf01svc-card{ opacity:1; transform:none; transition:none; } .pf01svc-card::after,.pf01svc-more svg,.pf01svc-ic{ transition:none; } }
      `}</style>
      <section className="pf01svc" data-template="proof-01" id="sluzby">
        <div className="pf01svc-inner">
          <div className="pf01svc-head">
            <p className="pf01-eyebrow"><GenericEditableText sectionId={sectionId} field="eyebrow" value={eyebrow} tag="span" /></p>
            <h2 className="pf01svc-title"><GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" /></h2>
            <p className="pf01svc-lead"><GenericEditableText sectionId={sectionId} field="lead" value={lead} tag="span" /></p>
          </div>
          <div className="pf01svc-grid" ref={gridRef}>
            {items.map((s, i) => (
              <a key={i} className="pf01svc-card" style={{ ["--i" as string]: i % 3 }} href={resolveDemoHref(String(s.href ?? "/sluzby"), tenantSlug, isAdmin)}>
                <span className="pf01svc-photo" aria-hidden="true">
                  {s.photo && <img src={String(s.photo)} alt="" loading="lazy" />}
                  <span className="pf01svc-num">{String(i + 1).padStart(2, "0")}</span>
                </span>
                <span className="pf01svc-body">
                <h3 className="pf01svc-name"><GenericEditableText sectionId={sectionId} field={`items.${i}.name`} value={String(s.name ?? "")} tag="span" /></h3>
                <p className="pf01svc-desc"><GenericEditableText sectionId={sectionId} field={`items.${i}.description`} value={String(s.description ?? "")} tag="span" /></p>
                <div className="pf01svc-foot">
                  <span className="pf01svc-price"><GenericEditableText sectionId={sectionId} field={`items.${i}.priceFrom`} value={String(s.priceFrom ?? "")} tag="span" /></span>
                  <span className="pf01svc-more">
                    <GenericEditableText sectionId={sectionId} field="linkLabel" value={linkLabel} tag="span" />
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                  </span>
                </div>
                </span>
              </a>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

function ProcessProof01({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const eyebrow = String(content.eyebrow ?? "Jak to probíhá");
  const title   = String(content.title   ?? "Čtyři kroky od poptávky k hotovu");
  const lead    = String(content.lead    ?? "Transparentní proces bez skrytých kroků. Vždy víte, co bude následovat.");
  const steps = (content.steps as Array<{ title?: string; description?: string }> | undefined) ?? [];
  const gridRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const root = gridRef.current;
    if (!root) return;
    const els = Array.from(root.querySelectorAll<HTMLElement>(".pf01proc-step"));
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("pf01-vis"); io.unobserve(e.target); } });
    }, { threshold: 0.2 });
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [steps.length]);
  return (
    <>
      <style>{`
        .pf01proc { --pf-accent:#C3352B; --pf-ink:#1B3A5C; --pf-muted:#6A6E78; --pf-border:#E5E1D8;
          background:var(--pf-ink); color:#fff; font-family:var(--font-body, system-ui, -apple-system, sans-serif);
          padding:clamp(56px,8vw,104px) clamp(20px,5vw,48px); }
        .pf01proc-inner { max-width:1280px; margin:0 auto; }
        .pf01proc-head { max-width:640px; margin-bottom:clamp(36px,5vw,60px); }
        .pf01proc .pf01-eyebrow { font-size:.78rem; font-weight:800; letter-spacing:.16em; text-transform:uppercase; color:#F0A498; margin:0 0 12px; display:inline-flex; align-items:center; gap:12px; }
        .pf01proc .pf01-eyebrow::before { content:''; width:32px; height:2px; background:#F0A498; }
        .pf01proc-title { font-family:var(--font-heading, system-ui, sans-serif); color:#fff; font-size:clamp(1.9rem,3.8vw,3rem); font-weight:800; letter-spacing:-.03em; line-height:1.06; margin:0 0 14px; }
        .pf01proc-lead { font-size:1.05rem; color:rgba(255,255,255,.78); line-height:1.6; margin:0; }
        .pf01proc-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(220px,1fr)); gap:2px; background:rgba(255,255,255,.1); border:1px solid rgba(255,255,255,.1); border-radius:10px; overflow:hidden; }
        .pf01proc-step { background:var(--pf-ink); padding:34px 26px 30px; position:relative;
          opacity:0; transform:translateY(18px);
          transition:opacity .55s cubic-bezier(.22,.68,0,1) calc(var(--i,0) * 110ms), transform .55s cubic-bezier(.22,.68,0,1) calc(var(--i,0) * 110ms), background .25s; }
        .pf01proc-step.pf01-vis { opacity:1; transform:translateY(0); }
        .pf01proc-step:hover { background:#22456B; }
        .pf01proc-step::before { content:''; position:absolute; top:0; left:0; right:0; height:3px; background:var(--pf-accent);
          transform:scaleX(0); transform-origin:left; transition:transform .6s cubic-bezier(.22,.68,0,1) calc(var(--i,0) * 110ms + 250ms); }
        .pf01proc-step.pf01-vis::before { transform:scaleX(1); }
        .pf01proc-num { display:inline-flex; align-items:baseline; gap:8px; font-family:var(--font-heading, system-ui, sans-serif); font-weight:800;
          font-size:2.2rem; line-height:1; color:var(--pf-accent); margin-bottom:18px; }
        .pf01proc-num::after { content:''; width:26px; height:1px; background:rgba(195,53,43,.5); align-self:center; }
        .pf01proc-step h3 { font-family:var(--font-heading, system-ui, sans-serif); color:#fff; font-size:1.13rem; font-weight:800; margin:0 0 8px; letter-spacing:-.01em; }
        .pf01proc-step p { font-size:.92rem; color:rgba(255,255,255,.78); line-height:1.58; margin:0; }
        @media (prefers-reduced-motion: reduce){ .pf01proc-step{ opacity:1; transform:none; transition:none; } .pf01proc-step::before{ transform:scaleX(1); transition:none; } }
      `}</style>
      <section className="pf01proc" data-template="proof-01" id="postup">
        <div className="pf01proc-inner">
          <div className="pf01proc-head">
            <p className="pf01-eyebrow"><GenericEditableText sectionId={sectionId} field="eyebrow" value={eyebrow} tag="span" /></p>
            <h2 className="pf01proc-title"><GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" /></h2>
            <p className="pf01proc-lead"><GenericEditableText sectionId={sectionId} field="lead" value={lead} tag="span" /></p>
          </div>
          <div className="pf01proc-grid" ref={gridRef}>
            {steps.map((s, i) => (
              <div key={i} className="pf01proc-step" style={{ ["--i" as string]: i }}>
                <div className="pf01proc-num">{String(i + 1).padStart(2, "0")}</div>
                <h3><GenericEditableText sectionId={sectionId} field={`steps.${i}.title`} value={String(s.title ?? "")} tag="span" /></h3>
                <p><GenericEditableText sectionId={sectionId} field={`steps.${i}.description`} value={String(s.description ?? "")} tag="span" /></p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

function PricingProof01({ content, sectionId, tenantSlug, isAdmin }: { content: Record<string, unknown>; sectionId: number; tenantSlug?: string; isAdmin: boolean }) {
  const eyebrow = String(content.eyebrow ?? "Orientační ceník");
  const title   = String(content.title   ?? "Balíčky, které dávají smysl");
  const lead    = String(content.lead    ?? "Přehledné ceny předem. Přesnou nabídku připravíme po nezávazné konzultaci.");
  const note    = String(content.note    ?? "Ceny jsou orientační vč. DPH. Finální cena dle konkrétního rozsahu zakázky.");
  type Tier = { name?: string; price?: string; unit?: string; description?: string; features?: string[]; ctaText?: string; ctaHref?: string; featured?: boolean };
  const tiers = (content.tiers as Tier[] | undefined) ?? [];
  return (
    <>
      <style>{`
        .pf01pr { --pf-accent:#C3352B; --pf-ink:#1B3A5C; --pf-muted:#6A6E78; --pf-border:#E5E1D8; --pf-surface:#fff;
          background:var(--pf-paper,#F4F1EB); font-family:var(--font-body, system-ui, -apple-system, sans-serif); color:var(--pf-ink);
          padding:clamp(56px,8vw,104px) clamp(20px,5vw,48px); }
        .pf01pr-inner { max-width:1180px; margin:0 auto; }
        .pf01pr-head { max-width:640px; margin-bottom:clamp(32px,5vw,52px); }
        .pf01pr .pf01-eyebrow { font-size:.78rem; font-weight:800; letter-spacing:.16em; text-transform:uppercase; color:var(--pf-accent); margin:0 0 12px; display:inline-flex; align-items:center; gap:12px; }
        .pf01pr .pf01-eyebrow::before { content:''; width:32px; height:2px; background:var(--pf-accent); }
        .pf01pr-title { font-family:var(--font-heading, system-ui, sans-serif); color:var(--pf-ink); font-size:clamp(1.9rem,3.8vw,3rem); font-weight:800; letter-spacing:-.03em; line-height:1.06; margin:0 0 14px; }
        .pf01pr-lead { font-size:1.05rem; color:var(--pf-muted); line-height:1.6; margin:0; }
        .pf01pr-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(260px,1fr)); gap:18px; align-items:stretch; }
        .pf01pr-card { display:flex; flex-direction:column; background:var(--pf-surface); border:1px solid var(--pf-border); border-radius:12px; padding:30px 26px; transition:transform .25s, box-shadow .25s; }
        .pf01pr-card[data-featured="true"] { border:1px solid #0C1622; background:#0C1622; color:#fff; box-shadow:0 24px 56px -24px rgba(12,22,34,.6); position:relative; }
        .pf01pr-card[data-featured="true"] .pf01pr-name, .pf01pr-card[data-featured="true"] .pf01pr-price b { color:#fff; }
        .pf01pr-card[data-featured="true"] .pf01pr-desc, .pf01pr-card[data-featured="true"] .pf01pr-price span { color:rgba(255,255,255,.65); }
        .pf01pr-card[data-featured="true"] .pf01pr-feats li { color:rgba(255,255,255,.88); }
        @media (min-width:900px){ .pf01pr-card[data-featured="true"] { transform:scale(1.03); } .pf01pr-card[data-featured="true"]:hover { transform:scale(1.03) translateY(-4px); } }
        .pf01pr-card:hover { transform:translateY(-4px); box-shadow:0 12px 28px -18px rgba(27,58,92,.25); }
        .pf01pr-badge { position:absolute; top:-12px; left:26px; background:var(--pf-accent); color:#fff; font-size:.68rem; font-weight:800; letter-spacing:.1em; text-transform:uppercase; padding:5px 11px; border-radius:999px; }
        .pf01pr-name { font-family:var(--font-heading, system-ui, sans-serif); color:var(--pf-ink); font-size:1.05rem; font-weight:800; letter-spacing:.01em; margin:0 0 10px; }
        .pf01pr-price { display:flex; align-items:baseline; gap:6px; margin-bottom:6px; }
        .pf01pr-price b { font-size:2rem; font-weight:800; letter-spacing:-.02em; }
        .pf01pr-price span { color:var(--pf-muted); font-weight:600; font-size:.86rem; }
        .pf01pr-desc { font-size:.9rem; color:var(--pf-muted); line-height:1.5; margin:0 0 20px; }
        .pf01pr-feats { list-style:none; padding:0; margin:0 0 24px; display:grid; gap:10px; flex:1; }
        .pf01pr-feats li { display:flex; align-items:flex-start; gap:9px; font-size:.92rem; line-height:1.4; }
        .pf01pr-feats svg { flex-shrink:0; color:var(--pf-accent); margin-top:2px; }
        .pf01pr-cta { display:inline-flex; align-items:center; justify-content:center; gap:8px; padding:13px; border-radius:10px; font-weight:700; font-size:.94rem; text-decoration:none; transition:transform .2s, box-shadow .2s, background .2s; }
        .pf01pr-cta-solid { background:var(--pf-accent); color:#fff; } .pf01pr-cta-solid:hover { transform:translateY(-1px); box-shadow:0 12px 24px -12px rgba(195,53,43,.7); }
        .pf01pr-cta-out { background:transparent; color:var(--pf-ink); border:1.5px solid var(--pf-border); } .pf01pr-cta-out:hover { border-color:var(--pf-ink); }
        .pf01pr-note { font-size:.82rem; color:var(--pf-muted); margin:22px 0 0; text-align:center; }
        @media (prefers-reduced-motion: reduce){ .pf01pr-card,.pf01pr-cta{ transition:none; } }
      `}</style>
      <section className="pf01pr" data-template="proof-01" id="cenik">
        <div className="pf01pr-inner">
          <div className="pf01pr-head">
            <p className="pf01-eyebrow"><GenericEditableText sectionId={sectionId} field="eyebrow" value={eyebrow} tag="span" /></p>
            <h2 className="pf01pr-title"><GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" /></h2>
            <p className="pf01pr-lead"><GenericEditableText sectionId={sectionId} field="lead" value={lead} tag="span" /></p>
          </div>
          <div className="pf01pr-grid">
            {tiers.map((t, i) => {
              const feats = (t.features as string[] | undefined) ?? [];
              const featured = Boolean(t.featured);
              return (
                <div key={i} className="pf01pr-card" data-featured={featured}>
                  {featured && <span className="pf01pr-badge">Nejoblíbenější</span>}
                  <h3 className="pf01pr-name"><GenericEditableText sectionId={sectionId} field={`tiers.${i}.name`} value={String(t.name ?? "")} tag="span" /></h3>
                  <div className="pf01pr-price">
                    <b><GenericEditableText sectionId={sectionId} field={`tiers.${i}.price`} value={String(t.price ?? "")} tag="span" /></b>
                    <span><GenericEditableText sectionId={sectionId} field={`tiers.${i}.unit`} value={String(t.unit ?? "")} tag="span" /></span>
                  </div>
                  <p className="pf01pr-desc"><GenericEditableText sectionId={sectionId} field={`tiers.${i}.description`} value={String(t.description ?? "")} tag="span" /></p>
                  <ul className="pf01pr-feats">
                    {feats.map((f, fi) => (
                      <li key={fi}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 6L9 17l-5-5"/></svg>
                        <GenericEditableText sectionId={sectionId} field={`tiers.${i}.features.${fi}`} value={f} tag="span" />
                      </li>
                    ))}
                  </ul>
                  <a href={resolveDemoHref(String(t.ctaHref ?? "#poptavka"), tenantSlug, isAdmin)} className={`pf01pr-cta ${featured ? "pf01pr-cta-solid" : "pf01pr-cta-out"}`} data-btn={featured ? "primary" : undefined}>
                    <GenericEditableText sectionId={sectionId} field={`tiers.${i}.ctaText`} value={String(t.ctaText ?? "Poptat")} tag="span" />
                  </a>
                </div>
              );
            })}
          </div>
          <p className="pf01pr-note"><GenericEditableText sectionId={sectionId} field="note" value={note} tag="span" /></p>
        </div>
      </section>
    </>
  );
}
